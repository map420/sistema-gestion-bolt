// src/components/BottomNav.tsx
import { useTranslation } from 'react-i18next'
import { Users, ClipboardList, DollarSign, BarChart2, Settings, type LucideIcon } from 'lucide-react'
import type { Seccion } from './Sidebar'

interface Props {
  activa: Seccion
  onChange: (s: Seccion) => void
}

export default function BottomNav({ activa, onChange }: Props) {
  const { t } = useTranslation()

  const ITEMS: { key: Seccion; label: string; Icon: LucideIcon }[] = [
    { key: 'trabajadores',  label: t('bottom.staff'),    Icon: Users },
    { key: 'registro',      label: t('bottom.log'),      Icon: ClipboardList },
    { key: 'pagos',         label: t('bottom.payments'), Icon: DollarSign },
    { key: 'reportes',      label: t('bottom.reports'),  Icon: BarChart2 },
    { key: 'configuracion', label: t('bottom.config'),   Icon: Settings },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bottom-nav-safe">
      {/* Blur bg */}
      <div className="absolute inset-0 bg-[#07070a]/90 backdrop-blur-xl border-t border-white/[0.05]" />

      <div className="relative flex items-stretch px-1">
        {ITEMS.map(({ key, label, Icon }) => {
          const active = activa === key
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all relative"
            >
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 accent-gradient rounded-b-full" />
              )}
              <div className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all ${
                active ? 'bg-[#7c5ff018]' : ''
              }`}>
                <Icon
                  size={18}
                  strokeWidth={active ? 2.5 : 1.5}
                  className={`transition-colors ${active ? 'text-[#a78bfa]' : 'text-[#38383f]'}`}
                />
              </div>
              <span className={`text-[9px] font-semibold leading-none transition-colors ${active ? 'text-[#a78bfa]' : 'text-[#38383f]'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
