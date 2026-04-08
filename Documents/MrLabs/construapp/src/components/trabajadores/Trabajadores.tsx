import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, PowerOff } from 'lucide-react'
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

  const guardar = (tr: Trabajador) => {
    const next = updateData(d => {
      const idx = d.trabajadores.findIndex(x => x.id === tr.id)
      if (idx >= 0) {
        d.trabajadores[idx] = tr
      } else {
        d.trabajadores.push(tr)
      }
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
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-[#f0f0f0] tracking-tight">{t('workers.title')}</h1>
          <p className="text-sm text-[#555] mt-0.5">{t('workers.nActive', { count: trabajadores.filter(tr => tr.activo).length })}</p>
        </div>
        <button onClick={() => { setEditando(undefined); setFormAbierto(true) }} className="shrink-0 flex items-center gap-2 bg-[#9d7ff0] hover:bg-[#8b6fd4] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} /> <span className="hidden sm:inline">{t('workers.newWorker')}</span><span className="sm:hidden">{t('workers.new')}</span>
        </button>
      </div>

      {trabajadores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#9d7ff015] border border-[#9d7ff030] flex items-center justify-center">
            <Plus size={24} className="text-[#9d7ff0]" />
          </div>
          <p className="text-[#555] text-sm">{t('workers.noWorkers')}</p>
          <button onClick={() => setFormAbierto(true)} className="text-sm text-[#9d7ff0] font-medium hover:underline">{t('workers.addFirst')}</button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {trabajadores.map(tr => (
            <div key={tr.id} className={`bg-[#111] border rounded-xl px-4 py-3.5 flex items-center gap-3 ${tr.activo ? 'border-white/5' : 'border-white/5 opacity-50'}`}>
              <div className="w-9 h-9 rounded-full bg-[#9d7ff020] flex items-center justify-center text-sm font-bold text-[#9d7ff0] shrink-0">
                {tr.nombre.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#f0f0f0] truncate">{tr.nombre}</p>
                <p className="text-xs text-[#555]">{tr.oficio} · {fmt(tr.tarifa)}/{tr.tipoPago === 'dia' ? t('workers.day') : t('workers.hour')}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tr.activo ? 'bg-[#34d39920] text-[#34d399]' : 'bg-[#55555520] text-[#555]'}`}>
                {tr.activo ? t('workers.active') : t('workers.inactive')}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => { setEditando(tr); setFormAbierto(true) }} className="p-1.5 text-[#555] hover:text-[#aaa] rounded-lg hover:bg-white/5"><Pencil size={14} /></button>
                <button onClick={() => toggleActivo(tr.id)} className="p-1.5 text-[#555] hover:text-[#f87171] rounded-lg hover:bg-white/5"><PowerOff size={14} /></button>
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
