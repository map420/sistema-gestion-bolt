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
  trialDaysRemaining?: number | null
}

export default function Sidebar({ activa, onChange, config, trialDaysRemaining }: Props) {
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
    : 'CE'

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col h-screen sticky top-0 bg-[#0d0d0d] border-r border-white/[0.06] safe-top">

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
              {config.nombreEmpresa || t('nav.myCompany')}
            </p>
            <p className="text-[10px] text-[#3a3a3a] mt-0.5 leading-none">{t('nav.panel')}</p>
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

      {/* Settings + User at bottom */}
      <div className="px-3 pb-4 border-t border-white/[0.06] pt-3 flex flex-col gap-0.5">
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
          {t('nav.settings')}
        </button>

        {/* Trial badge */}
        {trialDaysRemaining !== null && trialDaysRemaining !== undefined && (
          <div className={`mx-3 mb-1 px-3 py-1.5 rounded-lg text-xs font-medium text-center ${
            trialDaysRemaining <= 3
              ? 'text-[#f87171] bg-[#f8717115]'
              : 'text-[#eab308] bg-[#eab30815]'
          }`}>
            {t('paywall.trialBadge', { count: trialDaysRemaining })}
          </div>
        )}

        {/* User info + logout */}
        {user && (
          <div className="flex items-center gap-2 px-3 py-2 mt-1">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#555] truncate">{user.nombre}</p>
            </div>
            <button
              onClick={logout}
              title={t('auth.logout')}
              className="p-1.5 text-[#555] hover:text-[#f87171] rounded-lg hover:bg-white/5 transition-colors shrink-0"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
