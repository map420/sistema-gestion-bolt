// src/App.tsx
import { useState } from 'react'
import Sidebar, { type Seccion } from './components/Sidebar'
import Trabajadores from './components/trabajadores/Trabajadores'

export default function App() {
  const [seccion, setSeccion] = useState<Seccion>('trabajadores')

  return (
    <div className="flex min-h-screen bg-[#080808] text-[#f0f0f0]">
      <Sidebar activa={seccion} onChange={setSeccion} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-3xl">
          {seccion === 'trabajadores' && <Trabajadores />}
          {seccion !== 'trabajadores' && <p className="text-[#555] text-sm">Próximamente: {seccion}</p>}
        </div>
      </main>
    </div>
  )
}
