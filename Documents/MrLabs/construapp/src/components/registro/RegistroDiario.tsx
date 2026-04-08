// src/components/registro/RegistroDiario.tsx
import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Save, Check } from 'lucide-react'
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
    registrosDelDia.filter(r => !(r.trabajadorId in drafts)).reduce((sum, r) => sum + r.montoCalculado, 0)

  const guardar = () => {
    const next = updateData(d => {
      Object.entries(drafts).forEach(([trabajadorId, lineas]) => {
        d.registros = d.registros.filter(r => !(r.trabajadorId === trabajadorId && r.fecha === fecha))
        lineas.forEach(linea => {
          d.registros.push({ id: uuid(), trabajadorId, fecha, cantidad: linea.cantidad, actividad: linea.actividad, montoCalculado: linea.montoCalculado, proyectoId: linea.proyectoId })
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
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#f2f2f7] tracking-tight">{t('daily.title')}</h1>
        </div>

        {/* Date navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => cambiarFecha(-1)}
            className="p-2.5 rounded-xl bg-[#0f0f13] border border-white/[0.07] text-[#6b6b7a] hover:text-[#f2f2f7] hover:border-white/[0.12] transition-all"
          >
            <ChevronLeft size={15} />
          </button>
          <div className="flex-1 sm:min-w-52 text-sm text-[#f2f2f7] font-medium px-4 py-2.5 bg-[#0f0f13] border border-white/[0.07] rounded-xl capitalize text-center">
            {fmtFecha(fecha)}
          </div>
          <button
            onClick={() => cambiarFecha(1)}
            className="p-2.5 rounded-xl bg-[#0f0f13] border border-white/[0.07] text-[#6b6b7a] hover:text-[#f2f2f7] hover:border-white/[0.12] transition-all"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {trabajadores.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-[#6b6b7a] text-sm">{t('daily.noWorkers')}</p>
        </div>
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

          {/* Sticky total bar */}
          <div className="bg-[#0f0f13] border border-white/[0.07] rounded-2xl px-5 py-4 flex items-center justify-between sticky bottom-[80px] md:bottom-4 shadow-2xl shadow-black/40">
            <div>
              <p className="text-[10px] font-semibold text-[#6b6b7a] uppercase tracking-wider">{t('daily.total')}</p>
              <p className="text-2xl font-bold text-[#a78bfa] tracking-tight leading-tight">{fmt(totalDia)}</p>
            </div>
            <button
              onClick={guardar}
              className={`flex items-center gap-2 text-sm font-semibold px-5 py-3 rounded-xl transition-all ${
                guardado
                  ? 'bg-[#30d15820] text-[#30d158] border border-[#30d15830]'
                  : 'accent-gradient text-white hover:opacity-90 shadow-lg shadow-[#7c5ff025]'
              }`}
            >
              {guardado ? <Check size={15} /> : <Save size={15} />}
              {guardado ? t('daily.saved') : t('daily.save')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
