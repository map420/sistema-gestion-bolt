// src/components/Sidebar.tsx
import { Users, ClipboardList, DollarSign, BarChart2, Settings, Building2, type LucideIcon } from 'lucide-react'
import type { Config } from '../types'

export type Seccion = 'trabajadores' | 'registro' | 'pagos' | 'reportes' | 'configuracion'

interface Props {
  activa: Seccion
  onChange: (s: Seccion) => void
  config: Config
}

const NAV_ITEMS: { key: Seccion; label: string; Icon: LucideIcon }[] = [
  { key: 'trabajadores', label: 'Trabajadores',    Icon: Users },
  { key: 'registro',     label: 'Registro diario', Icon: ClipboardList },
  { key: 'pagos',        label: 'Pagos',           Icon: DollarSign },
  { key: 'reportes',     label: 'Reportes',        Icon: BarChart2 },
]

export default function Sidebar({ activa, onChange, config }: Props) {
  const initials = config.nombreEmpresa
    ? config.nombreEmpresa.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'CE'

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col h-screen sticky top-0 bg-[#0d0d0d] border-r border-white/[0.06]">

      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 bg-[#9d7ff020] border border-[#9d7ff030] flex items-center justify-center">
            {config.logoDataUrl
              ? <img src={config.logoDataUrl} alt="Logo" className="w-full h-full object-contain p-0.5" />
              : config.nombreEmpresa
                ? <span className="text-xs font-bold text-[#9d7ff0]">{initials}</span>
                : <Building2 size={16} className="text-[#9d7ff0]" />
            }
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#e0e0e0] truncate leading-tight">
              {config.nombreEmpresa || 'Mi Empresa'}
            </p>
            <p className="text-[10px] text-[#3a3a3a] mt-0.5 leading-none">Panel de gestión</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ key, label, Icon }) => {
          const active = activa === key
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left group ${
                active
                  ? 'bg-[#9d7ff018] text-[#b89ff8]'
                  : 'text-[#444] hover:text-[#888] hover:bg-white/[0.04]'
              }`}
            >
              <Icon
                size={15}
                className={`shrink-0 transition-colors ${active ? 'text-[#9d7ff0]' : 'text-[#333] group-hover:text-[#666]'}`}
              />
              {label}
            </button>
          )
        })}
      </nav>

      {/* Settings at bottom */}
      <div className="px-3 pb-4 border-t border-white/[0.06] pt-3">
        <button
          onClick={() => onChange('configuracion')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left group ${
            activa === 'configuracion'
              ? 'bg-[#9d7ff018] text-[#b89ff8]'
              : 'text-[#444] hover:text-[#888] hover:bg-white/[0.04]'
          }`}
        >
          <Settings
            size={15}
            className={`shrink-0 transition-colors ${activa === 'configuracion' ? 'text-[#9d7ff0]' : 'text-[#333] group-hover:text-[#666]'}`}
          />
          Configuración
        </button>
      </div>
    </aside>
  )
}
