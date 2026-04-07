// src/components/Sidebar.tsx
import { Users, ClipboardList, DollarSign, FileText, type LucideIcon } from 'lucide-react'

export type Seccion = 'trabajadores' | 'registro' | 'pagos' | 'reportes'

interface Props {
  activa: Seccion
  onChange: (s: Seccion) => void
}

const ITEMS: { key: Seccion; label: string; Icon: LucideIcon }[] = [
  { key: 'trabajadores', label: 'Trabajadores', Icon: Users },
  { key: 'registro',     label: 'Registro diario', Icon: ClipboardList },
  { key: 'pagos',        label: 'Pagos', Icon: DollarSign },
  { key: 'reportes',     label: 'Reportes', Icon: FileText },
]

export default function Sidebar({ activa, onChange }: Props) {
  return (
    <aside className="w-52 shrink-0 bg-[#111] border-r border-white/5 flex flex-col h-screen sticky top-0">
      <div className="px-4 py-5 border-b border-white/5">
        <p className="text-xs font-bold tracking-widest text-[#f0f0f0]">CONSTRUCTORA</p>
        <p className="text-xs text-[#555] mt-0.5">Panel de gestión</p>
      </div>
      <nav className="flex-1 p-2 flex flex-col gap-0.5 mt-2">
        {ITEMS.map(({ key, label, Icon }) => {
          const active = activa === key
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                active
                  ? 'bg-[#9d7ff020] text-[#9d7ff0]'
                  : 'text-[#666] hover:text-[#aaa] hover:bg-white/5'
              }`}
            >
              <Icon size={16} className="shrink-0" />
              {label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
