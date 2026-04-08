// src/App.tsx
import { useState } from 'react'
import Sidebar, { type Seccion } from './components/Sidebar'
import BottomNav from './components/BottomNav'
import Trabajadores from './components/trabajadores/Trabajadores'
import RegistroDiario from './components/registro/RegistroDiario'
import Pagos from './components/pagos/Pagos'
import Reportes from './components/reportes/Reportes'
import Configuracion from './components/configuracion/Configuracion'
import { ConfigProvider, useConfig } from './context/ConfigContext'

function AppShell() {
  const [seccion, setSeccion] = useState<Seccion>('trabajadores')
  const { config, updateConfig } = useConfig()

  return (
    <div className="flex min-h-screen bg-[#080808] text-[#f0f0f0]">
      <Sidebar activa={seccion} onChange={setSeccion} config={config} />

      <main className="flex-1 overflow-y-auto safe-top">
        <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-10 pb-28 md:pb-10">
          {seccion === 'trabajadores'  && <Trabajadores />}
          {seccion === 'registro'      && <RegistroDiario />}
          {seccion === 'pagos'         && <Pagos nombreEmpresa={config.nombreEmpresa || 'Mi Empresa'} />}
          {seccion === 'reportes'      && <Reportes nombreEmpresa={config.nombreEmpresa || 'Mi Empresa'} />}
          {seccion === 'configuracion' && <Configuracion config={config} onSave={updateConfig} />}
        </div>
      </main>

      <BottomNav activa={seccion} onChange={setSeccion} />
    </div>
  )
}

export default function App() {
  return (
    <ConfigProvider>
      <AppShell />
    </ConfigProvider>
  )
}
