import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, PowerOff } from 'lucide-react'
import type { Proyecto } from '../../types'
import { useData } from '../../context/DataContext'
import ProyectoForm from './ProyectoForm'

export default function Proyectos() {
  const { t } = useTranslation()
  const { data, updateData } = useData()
  const [formAbierto, setFormAbierto] = useState(false)
  const [editando, setEditando] = useState<Proyecto | undefined>()

  const proyectos = data.proyectos

  const guardar = (p: Proyecto) => {
    updateData(d => {
      const idx = d.proyectos.findIndex(x => x.id === p.id)
      if (idx >= 0) {
        d.proyectos[idx] = p
      } else {
        d.proyectos.push(p)
      }
      return d
    })
    setFormAbierto(false)
    setEditando(undefined)
  }

  const toggleActivo = (id: string) => {
    updateData(d => {
      const p = d.proyectos.find(x => x.id === id)
      if (p) p.activo = !p.activo
      return d
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-[#f0f0f0] tracking-tight">{t('projects.title')}</h1>
          <p className="text-sm text-[#555] mt-0.5">
            {t('projects.nActive', { count: proyectos.filter(p => p.activo).length })}
          </p>
        </div>
        <button
          onClick={() => { setEditando(undefined); setFormAbierto(true) }}
          className="shrink-0 flex items-center gap-2 bg-[#9d7ff0] hover:bg-[#8b6fd4] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">{t('projects.newProject')}</span>
          <span className="sm:hidden">{t('projects.new')}</span>
        </button>
      </div>

      {proyectos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#9d7ff015] border border-[#9d7ff030] flex items-center justify-center">
            <Plus size={24} className="text-[#9d7ff0]" />
          </div>
          <p className="text-[#555] text-sm">{t('projects.noProjects')}</p>
          <button
            onClick={() => setFormAbierto(true)}
            className="text-sm text-[#9d7ff0] font-medium hover:underline"
          >
            {t('projects.addFirst')}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {proyectos.map(p => (
            <div
              key={p.id}
              className={`bg-[#111] border rounded-xl px-4 py-3.5 flex items-center gap-3 ${p.activo ? 'border-white/5' : 'border-white/5 opacity-50'}`}
            >
              <div
                className="w-4 h-4 rounded-full shrink-0"
                style={{ backgroundColor: p.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#f0f0f0] truncate">{p.nombre}</p>
                {p.descripcion && (
                  <p className="text-xs text-[#555] truncate">{p.descripcion}</p>
                )}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.activo ? 'bg-[#34d39920] text-[#34d399]' : 'bg-[#55555520] text-[#555]'}`}>
                {p.activo ? t('projects.active') : t('projects.inactive')}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setEditando(p); setFormAbierto(true) }}
                  className="p-1.5 text-[#555] hover:text-[#aaa] rounded-lg hover:bg-white/5"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => toggleActivo(p.id)}
                  className="p-1.5 text-[#555] hover:text-[#f87171] rounded-lg hover:bg-white/5"
                >
                  <PowerOff size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {formAbierto && (
        <ProyectoForm
          inicial={editando}
          onGuardar={guardar}
          onCerrar={() => { setFormAbierto(false); setEditando(undefined) }}
        />
      )}
    </div>
  )
}
