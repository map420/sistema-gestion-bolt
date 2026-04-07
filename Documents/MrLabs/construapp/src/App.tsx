// src/App.tsx
import { useState } from 'react'
import Sidebar, { type Seccion } from './components/Sidebar'
import BottomNav from './components/BottomNav'
import Trabajadores from './components/trabajadores/Trabajadores'
import RegistroDiario from './components/registro/RegistroDiario'
import Pagos from './components/pagos/Pagos'
import Reportes from './components/reportes/Reportes'
import Configuracion from './components/configuracion/Configuracion'
import { loadConfig } from './storage'
import type { Config } from './types'

export default function App() {
  const [seccion, setSeccion] = useState<Seccion>('trabajadores')
  const [config, setConfig] = useState<Config>(() => loadConfig())

  return (
    <div className="flex min-h-screen bg-[#080808] text-[#f0f0f0]">
      {/* Sidebar — desktop only */}
      <Sidebar activa={seccion} onChange={setSeccion} config={config} />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-10 pb-28 md:pb-10">
          {seccion === 'trabajadores'  && <Trabajadores />}
          {seccion === 'registro'      && <RegistroDiario />}
          {seccion === 'pagos'         && <Pagos nombreEmpresa={config.nombreEmpresa || 'Mi Empresa'} />}
          {seccion === 'reportes'      && <Reportes nombreEmpresa={config.nombreEmpresa || 'Mi Empresa'} />}
          {seccion === 'configuracion' && <Configuracion config={config} onSave={setConfig} />}
        </div>
      </main>

      {/* Bottom nav — mobile only */}
      <BottomNav activa={seccion} onChange={setSeccion} />
    </div>
  )
}
