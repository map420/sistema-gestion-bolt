// src/App.tsx
import { useState } from 'react'
import { X } from 'lucide-react'
import type { Config } from './types'
import Sidebar, { type Seccion } from './components/Sidebar'
import BottomNav from './components/BottomNav'
import Trabajadores from './components/trabajadores/Trabajadores'
import RegistroDiario from './components/registro/RegistroDiario'
import Pagos from './components/pagos/Pagos'
import Reportes from './components/reportes/Reportes'
import Configuracion from './components/configuracion/Configuracion'
import Proyectos from './components/proyectos/Proyectos'
import Login from './components/auth/Login'
import Paywall from './components/paywall/Paywall'
import PaymentSuccess from './components/paywall/PaymentSuccess'
import PaymentCancelled from './components/paywall/PaymentCancelled'
import TrialBanner from './components/TrialBanner'
import { ConfigProvider, useConfig } from './context/ConfigContext'
import { AuthProvider, useAuth } from './context/AuthContext'

interface AppShellProps {
  trialDaysRemaining: number | null
}

function AppShell({ trialDaysRemaining }: AppShellProps) {
  const [seccion, setSeccion] = useState<Seccion>('trabajadores')
  const [showConfig, setShowConfig] = useState(false)
  const { config, updateConfig } = useConfig()

  const handleNav = (s: Seccion) => {
    if (s === 'configuracion') { setShowConfig(true); return }
    setSeccion(s)
  }

  const handleSave = (next: Config) => {
    updateConfig(next)
    setShowConfig(false)
  }

  return (
    <div className="flex min-h-screen bg-[#080808] text-[#f0f0f0]">
      <Sidebar activa={seccion} onChange={handleNav} config={config} />

      <main className="flex-1 overflow-y-auto safe-top">
        <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-10 pb-28 md:pb-10">
          {trialDaysRemaining !== null && (
            <TrialBanner daysRemaining={trialDaysRemaining} />
          )}
          {seccion === 'trabajadores' && <Trabajadores />}
          {seccion === 'registro'     && <RegistroDiario />}
          {seccion === 'proyectos'    && <Proyectos />}
          {seccion === 'pagos'        && <Pagos nombreEmpresa={config.nombreEmpresa || 'Mi Empresa'} />}
          {seccion === 'reportes'     && <Reportes nombreEmpresa={config.nombreEmpresa || 'Mi Empresa'} />}
        </div>
      </main>

      <BottomNav activa={seccion} onChange={handleNav} />

      {/* Config modal */}
      {showConfig && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4"
          onClick={() => setShowConfig(false)}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#0d0d0d] border border-white/10 rounded-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-0">
              <h2 className="text-base font-semibold text-[#f0f0f0]">Configuración</h2>
              <button onClick={() => setShowConfig(false)} className="p-1.5 text-[#555] hover:text-[#aaa] rounded-lg hover:bg-white/5 transition-colors">
                <X size={16} />
              </button>
            </div>
            <Configuracion config={config} onSave={handleSave} />
          </div>
        </div>
      )}
    </div>
  )
}

function AppContent() {
  const { user, trialStatus, confirmPayment } = useAuth()

  const params = new URLSearchParams(window.location.search)
  const paymentStatus = params.get('payment')
  const sessionId = params.get('session_id')

  // Payment success — must be checked before login gate (new user may not exist yet)
  if (paymentStatus === 'success' && sessionId) {
    const pendingRaw = sessionStorage.getItem('construapp_pending_pay')
    const pendingRegistration = pendingRaw
      ? JSON.parse(pendingRaw) as { email: string; password: string }
      : undefined
    return <PaymentSuccess sessionId={sessionId} onConfirm={confirmPayment} pendingRegistration={pendingRegistration} />
  }

  // Payment cancelled during new-user registration flow
  if (paymentStatus === 'cancelled' && sessionStorage.getItem('construapp_pending_pay')) {
    sessionStorage.removeItem('construapp_pending_pay')
    return <PaymentCancelled />
  }

  // Clear any stale payment params from URL so they don't interfere later
  if (paymentStatus) {
    window.history.replaceState({}, '', '/')
  }

  if (!user) return <Login />

  if (trialStatus?.expired) return <Paywall userId={user.id} />

  return (
    <ConfigProvider key={user.id}>
      <AppShell trialDaysRemaining={trialStatus?.inTrial ? trialStatus.daysRemaining : null} />
    </ConfigProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
