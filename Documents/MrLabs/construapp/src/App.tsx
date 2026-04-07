// src/App.tsx
import { useState } from 'react'
import Sidebar, { type Seccion } from './components/Sidebar'
import Trabajadores from './components/trabajadores/Trabajadores'
import RegistroDiario from './components/registro/RegistroDiario'
import Pagos from './components/pagos/Pagos'

export default function App() {
  const [seccion, setSeccion] = useState<Seccion>('trabajadores')

  return (
    <div className="flex min-h-screen bg-[#080808] text-[#f0f0f0]">
      <Sidebar activa={seccion} onChange={setSeccion} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-3xl">
          {seccion === 'trabajadores' && <Trabajadores />}
          {seccion === 'registro' && <RegistroDiario />}
          {seccion === 'pagos' && <Pagos />}
          {seccion === 'reportes' && <p className="text-[#555] text-sm">Próximamente: reportes</p>}
        </div>
      </main>
    </div>
  )
}
