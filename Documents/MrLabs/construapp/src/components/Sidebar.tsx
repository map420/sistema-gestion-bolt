// src/components/Sidebar.tsx
import { useTranslation } from 'react-i18next'
import { Users, ClipboardList, DollarSign, BarChart2, Settings, Building2, FolderKanban, LogOut, type LucideIcon } from 'lucide-react'
import type { Config } from '../types'
import { useAuth } from '../context/AuthContext'

export type Seccion = 'trabajadores' | 'registro' | 'proyectos' | 'pagos' | 'reportes' | 'configuracion'

interface Props {
  activa: Seccion
  onChange: (s: Seccion) => void
  config: Config
}

export default function Sidebar({ activa, onChange, config }: Props) {
  const { t } = useTranslation()
  const { user, logout } = useAuth()

  const NAV_ITEMS: { key: Seccion; label: string; Icon: LucideIcon }[] = [
    { key: 'trabajadores', label: t('nav.workers'),   Icon: Users },
    { key: 'registro',     label: t('nav.daily'),     Icon: ClipboardList },
    { key: 'proyectos',    label: t('nav.projects'),  Icon: FolderKanban },
    { key: 'pagos',        label: t('nav.payments'),  Icon: DollarSign },
    { key: 'reportes',     label: t('nav.reports'),   Icon: BarChart2 },
  ]

  const initials = config.nombreEmpresa
    ? config.nombreEmpresa.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'CA'

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col h-screen sticky top-0 bg-[#0a0a0e] border-r border-white/[0.05] safe-top">

      {/* Brand */}
      <div className="px-4 py-5 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 relative flex items-center justify-center">
            {config.logoDataUrl ? (
              <img src={config.logoDataUrl} alt="Logo" className="w-full h-full object-contain p-0.5" />
            ) : (
              <>
                <div className="absolute inset-0 accent-gradient opacity-20 rounded-xl" />
                <div className="absolute inset-[1px] bg-[#0f0f13] rounded-[10px]" />
                {config.nombreEmpresa
                  ? <span className="text-xs font-bold text-[#a78bfa] relative z-10">{initials}</span>
                  : <Building2 size={15} className="text-[#a78bfa] relative z-10" />
                }
              </>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#f2f2f7] truncate leading-tight">
              {config.nombreEmpresa || t('nav.myCompany')}
            </p>
            <p className="text-[10px] text-[#38383f] mt-0.5">{t('nav.panel')}</p>
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left group relative ${
                active ? 'text-white' : 'text-[#6b6b7a] hover:text-[#a0a0b0] hover:bg-white/[0.03]'
              }`}
            >
              {active && (
                <div className="absolute inset-0 rounded-xl accent-gradient opacity-15" />
              )}
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 accent-gradient rounded-r-full" />
              )}
              <Icon
                size={15}
                className={`shrink-0 transition-colors relative z-10 ${active ? 'text-[#a78bfa]' : 'text-[#38383f] group-hover:text-[#6b6b7a]'}`}
              />
              <span className="relative z-10">{label}</span>
            </button>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-white/[0.05] pt-3 flex flex-col gap-0.5">
        <button
          onClick={() => onChange('configuracion')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left group relative ${
            activa === 'configuracion' ? 'text-white' : 'text-[#6b6b7a] hover:text-[#a0a0b0] hover:bg-white/[0.03]'
          }`}
        >
          {activa === 'configuracion' && (
            <div className="absolute inset-0 rounded-xl accent-gradient opacity-15" />
          )}
          <Settings
            size={15}
            className={`shrink-0 relative z-10 ${activa === 'configuracion' ? 'text-[#a78bfa]' : 'text-[#38383f] group-hover:text-[#6b6b7a]'}`}
          />
          <span className="relative z-10">{t('nav.settings')}</span>
        </button>

        {user && (
          <div className="flex items-center gap-2 px-3 py-2 mt-1 rounded-xl">
            <div className="w-6 h-6 rounded-full bg-[#7c5ff020] border border-[#7c5ff030] flex items-center justify-center shrink-0">
              <span className="text-[9px] font-bold text-[#a78bfa]">
                {user.nombre?.[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
            <p className="text-xs text-[#38383f] truncate flex-1">{user.nombre}</p>
            <button
              onClick={logout}
              title={t('auth.logout')}
              className="p-1.5 text-[#38383f] hover:text-[#ff453a] rounded-lg hover:bg-white/5 transition-colors shrink-0"
            >
              <LogOut size={13} />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
