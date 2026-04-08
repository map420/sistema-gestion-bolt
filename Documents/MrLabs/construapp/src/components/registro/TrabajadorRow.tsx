import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, X } from 'lucide-react'
import type { Trabajador, Registro, Proyecto } from '../../types'
import { useConfig } from '../../context/ConfigContext'
import { uuid } from '../../utils'

interface LineaDraft {
  draftId: string
  proyectoId: string
  cantidad: string
  actividad: string
}

interface Props {
  trabajador: Trabajador
  registrosExistentes: Registro[]
  proyectos: Proyecto[]
  onChange: (lineas: Array<Omit<Registro, 'id' | 'trabajadorId' | 'fecha'>>) => void
}

function lineaFromRegistro(r: Registro): LineaDraft {
  return {
    draftId: uuid(),
    proyectoId: r.proyectoId ?? '',
    cantidad: r.cantidad.toString(),
    actividad: r.actividad ?? '',
  }
}

export default function TrabajadorRow({ trabajador, registrosExistentes, proyectos, onChange }: Props) {
  const { fmt } = useConfig()
  const { t } = useTranslation()

  const [lineas, setLineas] = useState<LineaDraft[]>(() =>
    registrosExistentes.length > 0
      ? registrosExistentes.map(lineaFromRegistro)
      : []
  )

  // Sync when registrosExistentes changes (fecha change)
  useEffect(() => {
    setLineas(registrosExistentes.length > 0 ? registrosExistentes.map(lineaFromRegistro) : [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registrosExistentes.map(r => r.id).join(',')])

  const emitChange = (newLineas: LineaDraft[]) => {
    const result = newLineas
      .filter(l => Number(l.cantidad) > 0)
      .map(l => ({
        proyectoId: l.proyectoId || undefined,
        cantidad: Number(l.cantidad),
        actividad: l.actividad,
        montoCalculado: trabajador.tarifa * Number(l.cantidad),
      }))
    onChange(result)
  }

  const addLinea = () => {
    const newLinea: LineaDraft = { draftId: uuid(), proyectoId: '', cantidad: '', actividad: '' }
    const next = [...lineas, newLinea]
    setLineas(next)
    emitChange(next)
  }

  const updateLinea = (draftId: string, patch: Partial<LineaDraft>) => {
    const next = lineas.map(l => l.draftId === draftId ? { ...l, ...patch } : l)
    setLineas(next)
    emitChange(next)
  }

  const removeLinea = (draftId: string) => {
    const next = lineas.filter(l => l.draftId !== draftId)
    setLineas(next)
    emitChange(next)
  }

  const totalMonto = lineas
    .filter(l => Number(l.cantidad) > 0)
    .reduce((sum, l) => sum + trabajador.tarifa * Number(l.cantidad), 0)

  const initials = trabajador.nombre.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
  const tieneLineas = lineas.length > 0

  return (
    <div className={`bg-[#111] rounded-xl border transition-colors ${tieneLineas ? 'border-[#9d7ff040]' : 'border-white/5'}`}>
      {/* Worker header */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="w-9 h-9 rounded-full bg-[#9d7ff020] flex items-center justify-center text-sm font-bold text-[#9d7ff0] shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#f0f0f0] truncate">{trabajador.nombre}</p>
          <p className="text-xs text-[#555]">
            {trabajador.oficio} · {fmt(trabajador.tarifa)}/{trabajador.tipoPago === 'dia' ? t('daily.day') : t('daily.hour')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tieneLineas ? (
            <span className="text-sm font-bold text-[#9d7ff0]">{fmt(totalMonto)}</span>
          ) : (
            <span className="text-xs text-[#555]">{t('daily.notWorked')}</span>
          )}
          <button
            onClick={addLinea}
            className="flex items-center gap-1 text-xs text-[#9d7ff0] border border-[#9d7ff040] hover:bg-[#9d7ff015] px-2 py-1 rounded-lg transition-colors"
          >
            <Plus size={12} />
            {t('daily.addProject')}
          </button>
        </div>
      </div>

      {/* Lines area */}
      {tieneLineas && (
        <div className="px-4 pb-3.5 pt-0 border-t border-white/5 flex flex-col gap-2 mt-0">
          {lineas.map((linea, idx) => {
            const proyecto = proyectos.find(p => p.id === linea.proyectoId)
            return (
              <div key={linea.draftId} className="flex flex-col gap-2 pt-2">
                {idx > 0 && <div className="border-t border-white/5" />}
                <div className="flex items-start gap-2">
                  {/* Project selector (only if projects exist) */}
                  {proyectos.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: proyecto?.color ?? '#555' }}
                      />
                      <select
                        value={linea.proyectoId}
                        onChange={e => updateLinea(linea.draftId, { proyectoId: e.target.value })}
                        className="flex-1 min-w-0 bg-[#0d0d0d] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0]"
                      >
                        <option value="">{t('daily.noProject')}</option>
                        {proyectos.map(p => (
                          <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Activity input */}
                  <input
                    type="text"
                    placeholder={t('daily.actPh')}
                    value={linea.actividad}
                    onChange={e => updateLinea(linea.draftId, { actividad: e.target.value })}
                    className={`bg-[#0d0d0d] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0] placeholder:text-[#333] ${proyectos.length > 0 ? 'w-32 sm:flex-1' : 'flex-1'}`}
                  />

                  {/* Quantity */}
                  <input
                    type="number"
                    min="0"
                    step={trabajador.tipoPago === 'hora' ? '0.5' : '1'}
                    placeholder="0"
                    value={linea.cantidad}
                    onChange={e => updateLinea(linea.draftId, { cantidad: e.target.value })}
                    className="w-16 bg-[#0d0d0d] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-[#f0f0f0] text-center focus:outline-none focus:border-[#9d7ff0]"
                  />

                  {/* Subtotal */}
                  <div className="w-16 bg-[#9d7ff015] border border-[#9d7ff030] rounded-lg px-2 py-1.5 text-xs font-bold text-[#9d7ff0] text-center">
                    {fmt(trabajador.tarifa * (Number(linea.cantidad) || 0))}
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeLinea(linea.draftId)}
                    className="p-1.5 text-[#555] hover:text-[#f87171] rounded-lg hover:bg-white/5 transition-colors shrink-0"
                    title={t('daily.removeEntry')}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
