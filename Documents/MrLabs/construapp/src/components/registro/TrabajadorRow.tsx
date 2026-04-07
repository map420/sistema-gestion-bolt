// src/components/registro/TrabajadorRow.tsx
import { useState } from 'react'
import type { Trabajador, Registro } from '../../types'
import { formatMoneda } from '../../utils'

interface Props {
  trabajador: Trabajador
  registroExistente?: Registro
  onChange: (parcial: Omit<Registro, 'id' | 'trabajadorId' | 'fecha'> | null) => void
}

export default function TrabajadorRow({ trabajador, registroExistente, onChange }: Props) {
  const [activo, setActivo] = useState(!!registroExistente)
  const [cantidad, setCantidad] = useState(registroExistente?.cantidad?.toString() ?? '')
  const [actividad, setActividad] = useState(registroExistente?.actividad ?? '')

  const monto = activo && cantidad ? trabajador.tarifa * Number(cantidad) : 0

  const handleToggle = (val: boolean) => {
    setActivo(val)
    if (!val) {
      onChange(null)
      setCantidad('')
      setActividad('')
    }
  }

  const handleChange = (newCantidad: string, newActividad: string) => {
    const num = Number(newCantidad)
    if (!num || num <= 0) { onChange(null); return }
    onChange({
      actividad: newActividad,
      cantidad: num,
      montoCalculado: trabajador.tarifa * num,
    })
  }

  const initials = trabajador.nombre.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className={`bg-[#111] rounded-xl border transition-colors ${activo ? 'border-[#9d7ff040]' : 'border-white/5'}`}>
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="w-9 h-9 rounded-full bg-[#9d7ff020] flex items-center justify-center text-sm font-bold text-[#9d7ff0] shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#f0f0f0] truncate">{trabajador.nombre}</p>
          <p className="text-xs text-[#555]">{trabajador.oficio} · {formatMoneda(trabajador.tarifa)}/{trabajador.tipoPago === 'dia' ? 'día' : 'hora'}</p>
        </div>
        <button
          onClick={() => handleToggle(!activo)}
          className={`relative w-10 h-5 rounded-full transition-colors ${activo ? 'bg-[#9d7ff0]' : 'bg-[#333]'}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${activo ? 'left-5' : 'left-0.5'}`} />
        </button>
        <span className={`text-xs font-medium w-16 text-right ${activo ? 'text-[#9d7ff0]' : 'text-[#555]'}`}>
          {activo ? 'Trabajó' : 'No trabajó'}
        </span>
      </div>

      {activo && (
        <div className="px-4 pb-3.5 pt-3 border-t border-white/5 flex flex-col gap-2 sm:flex-row sm:gap-2">
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-xs text-[#555] uppercase tracking-wide">Actividad</span>
            <input
              className="bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0]"
              placeholder="Ej: Colada de columnas — Bloque B"
              value={actividad}
              onChange={e => { setActividad(e.target.value); handleChange(cantidad, e.target.value) }}
            />
          </div>
          <div className="flex gap-2 sm:contents">
            <div className="flex-1 sm:w-20 sm:flex-none flex flex-col gap-1">
              <span className="text-xs text-[#555] uppercase tracking-wide">{trabajador.tipoPago === 'dia' ? 'Días' : 'Horas'}</span>
              <input
                type="number"
                min="0"
                step={trabajador.tipoPago === 'hora' ? '0.5' : '1'}
                className="w-full bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#f0f0f0] text-center focus:outline-none focus:border-[#9d7ff0]"
                value={cantidad}
                onChange={e => { setCantidad(e.target.value); handleChange(e.target.value, actividad) }}
              />
            </div>
            <div className="flex-1 sm:w-24 sm:flex-none flex flex-col gap-1">
              <span className="text-xs text-[#555] uppercase tracking-wide">Total</span>
              <div className="bg-[#9d7ff015] border border-[#9d7ff030] rounded-lg px-3 py-2 text-sm font-bold text-[#9d7ff0] text-center">
                {formatMoneda(monto)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
