import { useState } from 'react'
import { Plus, Pencil, PowerOff } from 'lucide-react'
import type { Trabajador } from '../../types'
import { updateData, loadData } from '../../storage'
import { formatMoneda } from '../../utils'
import TrabajadorForm from './TrabajadorForm'

export default function Trabajadores() {
  const [data, setData] = useState(() => loadData())
  const [formAbierto, setFormAbierto] = useState(false)
  const [editando, setEditando] = useState<Trabajador | undefined>()

  const trabajadores = data.trabajadores

  const guardar = (t: Trabajador) => {
    const next = updateData(d => {
      const idx = d.trabajadores.findIndex(x => x.id === t.id)
      if (idx >= 0) {
        d.trabajadores[idx] = t
      } else {
        d.trabajadores.push(t)
      }
      return d
    })
    setData(next)
    setFormAbierto(false)
    setEditando(undefined)
  }

  const toggleActivo = (id: string) => {
    const next = updateData(d => {
      const t = d.trabajadores.find(x => x.id === id)
      if (t) t.activo = !t.activo
      return d
    })
    setData(next)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-[#f0f0f0] tracking-tight">Trabajadores</h1>
          <p className="text-sm text-[#555] mt-0.5">{trabajadores.filter(t => t.activo).length} activos</p>
        </div>
        <button onClick={() => { setEditando(undefined); setFormAbierto(true) }} className="shrink-0 flex items-center gap-2 bg-[#9d7ff0] hover:bg-[#8b6fd4] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} /> <span className="hidden sm:inline">Nuevo trabajador</span><span className="sm:hidden">Nuevo</span>
        </button>
      </div>

      {trabajadores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#9d7ff015] border border-[#9d7ff030] flex items-center justify-center">
            <Plus size={24} className="text-[#9d7ff0]" />
          </div>
          <p className="text-[#555] text-sm">No hay trabajadores registrados.</p>
          <button onClick={() => setFormAbierto(true)} className="text-sm text-[#9d7ff0] font-medium hover:underline">Agregar primer trabajador</button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {trabajadores.map(t => (
            <div key={t.id} className={`bg-[#111] border rounded-xl px-4 py-3.5 flex items-center gap-3 ${t.activo ? 'border-white/5' : 'border-white/5 opacity-50'}`}>
              <div className="w-9 h-9 rounded-full bg-[#9d7ff020] flex items-center justify-center text-sm font-bold text-[#9d7ff0] shrink-0">
                {t.nombre.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#f0f0f0] truncate">{t.nombre}</p>
                <p className="text-xs text-[#555]">{t.oficio} · {formatMoneda(t.tarifa)}/{t.tipoPago === 'dia' ? 'día' : 'hora'}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.activo ? 'bg-[#34d39920] text-[#34d399]' : 'bg-[#55555520] text-[#555]'}`}>
                {t.activo ? 'Activo' : 'Inactivo'}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => { setEditando(t); setFormAbierto(true) }} className="p-1.5 text-[#555] hover:text-[#aaa] rounded-lg hover:bg-white/5"><Pencil size={14} /></button>
                <button onClick={() => toggleActivo(t.id)} className="p-1.5 text-[#555] hover:text-[#f87171] rounded-lg hover:bg-white/5"><PowerOff size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {formAbierto && (
        <TrabajadorForm
          inicial={editando}
          onGuardar={guardar}
          onCerrar={() => { setFormAbierto(false); setEditando(undefined) }}
        />
      )}
    </div>
  )
}
