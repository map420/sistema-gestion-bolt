// src/components/registro/RegistroDiario.tsx
import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Save } from 'lucide-react'
import type { Registro } from '../../types'
import { loadData, updateData } from '../../storage'
import { hoy, uuid } from '../../utils'
import { useConfig } from '../../context/ConfigContext'
import TrabajadorRow from './TrabajadorRow'

type LineaDraft = Omit<Registro, 'id' | 'trabajadorId' | 'fecha'>

export default function RegistroDiario() {
  const { fmt, fmtFecha } = useConfig()
  const { t } = useTranslation()
  const [fecha, setFecha] = useState(hoy())
  const [data, setData] = useState(() => loadData())
  const [drafts, setDrafts] = useState<Record<string, LineaDraft[]>>({})
  const [guardado, setGuardado] = useState(false)

  const trabajadores = data.trabajadores.filter(tr => tr.activo)
  const proyectos = data.proyectos.filter(p => p.activo)
  const registrosDelDia = data.registros.filter(r => r.fecha === fecha)

  const cambiarFecha = (dias: number) => {
    const d = new Date(fecha + 'T12:00:00')
    d.setDate(d.getDate() + dias)
    setFecha(d.toISOString().split('T')[0])
    setDrafts({})
    setGuardado(false)
  }

  const handleChange = useCallback((trabajadorId: string, lineas: LineaDraft[]) => {
    setDrafts(prev => ({ ...prev, [trabajadorId]: lineas }))
  }, [])

  const totalDia =
    Object.values(drafts).flat().reduce((sum, l) => sum + l.montoCalculado, 0) +
    registrosDelDia
      .filter(r => !(r.trabajadorId in drafts))
      .reduce((sum, r) => sum + r.montoCalculado, 0)

  const guardar = () => {
    const next = updateData(d => {
      Object.entries(drafts).forEach(([trabajadorId, lineas]) => {
        // Remove all existing registros for this worker on this date
        d.registros = d.registros.filter(r => !(r.trabajadorId === trabajadorId && r.fecha === fecha))
        // Insert new lineas
        lineas.forEach(linea => {
          const registro: Registro = {
            id: uuid(),
            trabajadorId,
            fecha,
            cantidad: linea.cantidad,
            actividad: linea.actividad,
            montoCalculado: linea.montoCalculado,
            proyectoId: linea.proyectoId,
          }
          d.registros.push(registro)
        })
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-[#f0f0f0] tracking-tight">{t('daily.title')}</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => cambiarFecha(-1)} className="p-2 rounded-lg bg-[#111] border border-white/10 text-[#aaa] hover:text-white">
            <ChevronLeft size={16} />
          </button>
          <span className="flex-1 text-sm text-[#f0f0f0] font-medium px-3 py-2 bg-[#111] border border-white/10 rounded-lg capitalize text-center sm:min-w-48">
            {fmtFecha(fecha)}
          </span>
          <button onClick={() => cambiarFecha(1)} className="p-2 rounded-lg bg-[#111] border border-white/10 text-[#aaa] hover:text-white">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {trabajadores.length === 0 ? (
        <div className="py-20 text-center text-[#555] text-sm">{t('daily.noWorkers')}</div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {trabajadores.map(tr => (
              <TrabajadorRow
                key={`${tr.id}-${fecha}`}
                trabajador={tr}
                registrosExistentes={registrosDelDia.filter(r => r.trabajadorId === tr.id)}
                proyectos={proyectos}
                onChange={lineas => handleChange(tr.id, lineas)}
              />
            ))}
          </div>

          <div className="bg-[#111] border border-white/10 rounded-xl px-4 py-3.5 flex items-center justify-between sticky bottom-[80px] md:bottom-4">
            <div>
              <p className="text-xs text-[#555] uppercase tracking-wide">{t('daily.total')}</p>
              <p className="text-xl font-bold text-[#9d7ff0] tracking-tight">{fmt(totalDia)}</p>
            </div>
            <button
              onClick={guardar}
              className="flex items-center gap-2 bg-[#9d7ff0] hover:bg-[#8b6fd4] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              <Save size={15} />
              {guardado ? t('daily.saved') : t('daily.save')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
