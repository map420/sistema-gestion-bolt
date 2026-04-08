import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import type { Proyecto } from '../../types'
import { uuid } from '../../utils'

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280',
]

interface Props {
  inicial?: Proyecto
  onGuardar: (p: Proyecto) => void
  onCerrar: () => void
}

export default function ProyectoForm({ inicial, onGuardar, onCerrar }: Props) {
  const { t } = useTranslation()
  const [nombre, setNombre] = useState(inicial?.nombre ?? '')
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? '')
  const [color, setColor] = useState(inicial?.color ?? COLORS[5])
  const [errNombre, setErrNombre] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) {
      setErrNombre(t('form.errName'))
      return
    }
    const proyecto: Proyecto = {
      id: inicial?.id ?? uuid(),
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      color,
      activo: inicial?.activo ?? true,
    }
    onGuardar(proyecto)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-0 sm:px-4">
      <div className="w-full sm:max-w-md bg-[#111] rounded-t-2xl sm:rounded-2xl border border-white/10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-base font-bold text-[#f0f0f0]">
            {inicial ? t('projects.editTitle') : t('projects.newTitle')}
          </h2>
          <button onClick={onCerrar} className="p-1.5 text-[#555] hover:text-[#aaa] rounded-lg hover:bg-white/5">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-5 flex flex-col gap-4">
          {/* Nombre */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#555] uppercase tracking-wide">{t('projects.name')}</label>
            <input
              type="text"
              value={nombre}
              onChange={e => { setNombre(e.target.value); setErrNombre('') }}
              placeholder={t('projects.namePh')}
              className="bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0] placeholder:text-[#333]"
            />
            {errNombre && <p className="text-xs text-[#f87171]">{errNombre}</p>}
          </div>

          {/* Descripcion */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#555] uppercase tracking-wide">{t('projects.description')}</label>
            <input
              type="text"
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder={t('projects.descPh')}
              className="bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0] placeholder:text-[#333]"
            />
          </div>

          {/* Color */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#555] uppercase tracking-wide">{t('projects.color')}</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'scale-110 ring-2 ring-white/40 ring-offset-1 ring-offset-[#111]' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 py-2.5 rounded-lg border border-white/10 text-sm text-[#555] hover:text-[#aaa] transition-colors"
            >
              {t('form.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg bg-[#9d7ff0] hover:bg-[#8b6fd4] text-white text-sm font-semibold transition-colors"
            >
              {t('form.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
