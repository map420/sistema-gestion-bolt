// src/components/BottomNav.tsx
import { useTranslation } from 'react-i18next'
import { Users, ClipboardList, DollarSign, BarChart2, FolderKanban, type LucideIcon } from 'lucide-react'
import type { Seccion } from './Sidebar'

interface Props {
  activa: Seccion
  onChange: (s: Seccion) => void
}

export default function BottomNav({ activa, onChange }: Props) {
  const { t } = useTranslation()

  const ITEMS: { key: Seccion; label: string; Icon: LucideIcon }[] = [
    { key: 'trabajadores', label: t('bottom.staff'),    Icon: Users },
    { key: 'registro',     label: t('bottom.log'),      Icon: ClipboardList },
    { key: 'proyectos',    label: t('bottom.projects'), Icon: FolderKanban },
    { key: 'pagos',        label: t('bottom.payments'), Icon: DollarSign },
    { key: 'reportes',     label: t('bottom.reports'),  Icon: BarChart2 },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d0d0d] border-t border-white/[0.06] flex items-stretch bottom-nav-safe">
      {ITEMS.map(({ key, label, Icon }) => {
        const active = activa === key
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors ${
              active ? 'text-[#9d7ff0]' : 'text-[#444]'
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2 : 1.5} />
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
