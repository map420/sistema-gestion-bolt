// src/components/BottomNav.tsx
import { Users, ClipboardList, DollarSign, BarChart2, Settings, type LucideIcon } from 'lucide-react'
import type { Seccion } from './Sidebar'

interface Props {
  activa: Seccion
  onChange: (s: Seccion) => void
}

const ITEMS: { key: Seccion; label: string; Icon: LucideIcon }[] = [
  { key: 'trabajadores', label: 'Personal',  Icon: Users },
  { key: 'registro',     label: 'Registro',  Icon: ClipboardList },
  { key: 'pagos',        label: 'Pagos',     Icon: DollarSign },
  { key: 'reportes',     label: 'Reportes',  Icon: BarChart2 },
  { key: 'configuracion',label: 'Config',    Icon: Settings },
]

export default function BottomNav({ activa, onChange }: Props) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d0d0d] border-t border-white/[0.06] flex items-stretch safe-area-inset-bottom">
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
