import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, PowerOff, Users } from 'lucide-react'
import type { Trabajador } from '../../types'
import { updateData, loadData } from '../../storage'
import { useConfig } from '../../context/ConfigContext'
import TrabajadorForm from './TrabajadorForm'

export default function Trabajadores() {
  const { fmt } = useConfig()
  const { t } = useTranslation()
  const [data, setData] = useState(() => loadData())
  const [formAbierto, setFormAbierto] = useState(false)
  const [editando, setEditando] = useState<Trabajador | undefined>()

  const trabajadores = data.trabajadores
  const activos = trabajadores.filter(tr => tr.activo).length

  const guardar = (tr: Trabajador) => {
    const next = updateData(d => {
      const idx = d.trabajadores.findIndex(x => x.id === tr.id)
      if (idx >= 0) d.trabajadores[idx] = tr
      else d.trabajadores.push(tr)
      return d
    })
    setData(next)
    setFormAbierto(false)
    setEditando(undefined)
  }

  const toggleActivo = (id: string) => {
    const next = updateData(d => {
      const tr = d.trabajadores.find(x => x.id === id)
      if (tr) tr.activo = !tr.activo
      return d
    })
    setData(next)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#f2f2f7] tracking-tight">{t('workers.title')}</h1>
          <p className="text-sm text-[#6b6b7a] mt-0.5">{t('workers.nActive', { count: activos })}</p>
        </div>
        <button
          onClick={() => { setEditando(undefined); setFormAbierto(true) }}
          className="shrink-0 flex items-center gap-2 accent-gradient text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-opacity hover:opacity-90 shadow-lg shadow-[#7c5ff025]"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span className="hidden sm:inline">{t('workers.newWorker')}</span>
          <span className="sm:hidden">{t('workers.new')}</span>
        </button>
      </div>

      {/* Empty state */}
      {trabajadores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
          <div className="w-16 h-16 rounded-2xl relative flex items-center justify-center">
            <div className="absolute inset-0 accent-gradient opacity-10 rounded-2xl" />
            <Users size={28} className="text-[#7c5ff0]" />
          </div>
          <div>
            <p className="text-[#6b6b7a] text-sm">{t('workers.noWorkers')}</p>
            <button onClick={() => setFormAbierto(true)} className="text-sm text-[#a78bfa] font-medium hover:underline mt-2">
              {t('workers.addFirst')}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {trabajadores.map(tr => (
            <div
              key={tr.id}
              className={`bg-[#0f0f13] border rounded-2xl px-4 py-4 flex items-center gap-3 transition-all ${
                tr.activo ? 'border-white/[0.06] hover:border-white/[0.10]' : 'border-white/[0.03] opacity-40'
              }`}
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-xl relative flex items-center justify-center shrink-0">
                <div className="absolute inset-0 accent-gradient opacity-15 rounded-xl" />
                <span className="text-sm font-bold text-[#a78bfa] relative z-10">
                  {tr.nombre.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#f2f2f7] truncate">{tr.nombre}</p>
                <p className="text-xs text-[#6b6b7a] truncate">
                  {tr.oficio} · <span className="text-[#a78bfa] font-medium">{fmt(tr.tarifa)}</span>/{tr.tipoPago === 'dia' ? t('workers.day') : t('workers.hour')}
                </p>
              </div>

              {/* Status badge */}
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold shrink-0 ${
                tr.activo
                  ? 'bg-[#30d15820] text-[#30d158]'
                  : 'bg-white/5 text-[#6b6b7a]'
              }`}>
                {tr.activo ? t('workers.active') : t('workers.inactive')}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={() => { setEditando(tr); setFormAbierto(true) }}
                  className="p-2 text-[#38383f] hover:text-[#a78bfa] rounded-lg hover:bg-[#7c5ff010] transition-all"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => toggleActivo(tr.id)}
                  className="p-2 text-[#38383f] hover:text-[#ff453a] rounded-lg hover:bg-[#ff453a10] transition-all"
                >
                  <PowerOff size={13} />
                </button>
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
