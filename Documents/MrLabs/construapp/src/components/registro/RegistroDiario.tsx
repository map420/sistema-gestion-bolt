// src/components/registro/RegistroDiario.tsx
import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Save } from 'lucide-react'
import type { Registro } from '../../types'
import { loadData, updateData } from '../../storage'
import { hoy, formatFecha, uuid, formatMoneda } from '../../utils'
import TrabajadorRow from './TrabajadorRow'

export default function RegistroDiario() {
  const [fecha, setFecha] = useState(hoy())
  const [data, setData] = useState(() => loadData())
  const [drafts, setDrafts] = useState<Record<string, Omit<Registro, 'id' | 'trabajadorId' | 'fecha'> | null>>({})
  const [guardado, setGuardado] = useState(false)

  const trabajadores = data.trabajadores.filter(t => t.activo)
  const registrosDelDia = data.registros.filter(r => r.fecha === fecha)

  const cambiarFecha = (dias: number) => {
    const d = new Date(fecha + 'T12:00:00')
    d.setDate(d.getDate() + dias)
    setFecha(d.toISOString().split('T')[0])
    setDrafts({})
    setGuardado(false)
  }

  const handleChange = useCallback((trabajadorId: string, parcial: Omit<Registro, 'id' | 'trabajadorId' | 'fecha'> | null) => {
    setDrafts(prev => ({ ...prev, [trabajadorId]: parcial }))
  }, [])

  const totalDia = Object.values(drafts).reduce((sum, d) => sum + (d?.montoCalculado ?? 0), 0) +
    registrosDelDia
      .filter(r => !(r.trabajadorId in drafts))
      .reduce((sum, r) => sum + r.montoCalculado, 0)

  const guardar = () => {
    const next = updateData(d => {
      Object.entries(drafts).forEach(([trabajadorId, parcial]) => {
        const idx = d.registros.findIndex(r => r.trabajadorId === trabajadorId && r.fecha === fecha)
        if (parcial === null) {
          if (idx >= 0) d.registros.splice(idx, 1)
        } else {
          const registro: Registro = { id: idx >= 0 ? d.registros[idx].id : uuid(), trabajadorId, fecha, ...parcial }
          if (idx >= 0) d.registros[idx] = registro
          else d.registros.push(registro)
        }
      })
      return d
    })
    setData(next)
    setDrafts({})
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#f0f0f0] tracking-tight">Registro diario</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => cambiarFecha(-1)} className="p-2 rounded-lg bg-[#111] border border-white/10 text-[#aaa] hover:text-white"><ChevronLeft size={16} /></button>
          <span className="text-sm text-[#f0f0f0] font-medium px-3 py-2 bg-[#111] border border-white/10 rounded-lg capitalize min-w-48 text-center">{formatFecha(fecha)}</span>
          <button onClick={() => cambiarFecha(1)} className="p-2 rounded-lg bg-[#111] border border-white/10 text-[#aaa] hover:text-white"><ChevronRight size={16} /></button>
        </div>
      </div>

      {trabajadores.length === 0 ? (
        <div className="py-20 text-center text-[#555] text-sm">No hay trabajadores activos. Agrega trabajadores primero.</div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {trabajadores.map(t => (
              <TrabajadorRow
                key={`${t.id}-${fecha}`}
                trabajador={t}
                registroExistente={registrosDelDia.find(r => r.trabajadorId === t.id)}
                onChange={parcial => handleChange(t.id, parcial)}
              />
            ))}
          </div>

          <div className="bg-[#111] border border-white/10 rounded-xl px-4 py-3.5 flex items-center justify-between sticky bottom-4">
            <div>
              <p className="text-xs text-[#555] uppercase tracking-wide">Total del día</p>
              <p className="text-xl font-bold text-[#9d7ff0] tracking-tight">{formatMoneda(totalDia)}</p>
            </div>
            <button onClick={guardar} className="flex items-center gap-2 bg-[#9d7ff0] hover:bg-[#8b6fd4] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
              <Save size={15} />
              {guardado ? 'Guardado' : 'Guardar registro'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
