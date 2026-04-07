# Gestión de Personal — Construcción — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir una SPA web con React 19 + TailwindCSS para gestionar trabajadores, registros diarios, pagos y reportes PDF de una empresa de construcción, con persistencia en localStorage.

**Architecture:** SPA con sidebar fijo a la izquierda y área de contenido a la derecha. La sección activa se controla con `useState`. Un módulo `storage.ts` centraliza toda la interacción con `localStorage` — ningún componente lo toca directamente.

**Tech Stack:** React 19, TailwindCSS v3, Lucide Icons, html2pdf.js, Vite, TypeScript

---

## Estructura de archivos

```
construapp/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx                        # Shell: sidebar + main, estado de sección activa
│   ├── types.ts                       # Tipos: Trabajador, Registro, Pago, AppData
│   ├── storage.ts                     # Lectura/escritura de localStorage
│   ├── utils.ts                       # uuid(), formatFecha(), calcularSaldo()
│   ├── components/
│   │   ├── Sidebar.tsx                # Navegación izquierda
│   │   ├── trabajadores/
│   │   │   ├── Trabajadores.tsx       # Lista + empty state
│   │   │   └── TrabajadorForm.tsx     # Modal: crear / editar
│   │   ├── registro/
│   │   │   ├── RegistroDiario.tsx     # Selector fecha + lista de trabajadores
│   │   │   └── TrabajadorRow.tsx      # Toggle + campos expandibles por trabajador
│   │   ├── pagos/
│   │   │   ├── Pagos.tsx              # Selector período + lista con saldos
│   │   │   ├── PagoModal.tsx          # Modal: registrar pago
│   │   │   └── DetalleModal.tsx       # Modal: ver registros del período
│   │   ├── reportes/
│   │   │   └── Reportes.tsx           # Tabla general + exportar PDF
│   │   └── pdf/
│   │       ├── ComprobanteTemplate.tsx  # Plantilla HTML del comprobante individual
│   │       └── PlanillaTemplate.tsx     # Plantilla HTML de la planilla general
```

---

## Task 1: Scaffold del proyecto

**Files:**
- Create: `construapp/package.json`
- Create: `construapp/vite.config.ts`
- Create: `construapp/tsconfig.json`
- Create: `construapp/tailwind.config.ts`
- Create: `construapp/index.html`
- Create: `construapp/src/main.tsx`

- [ ] **Step 1: Crear proyecto con Vite**

```bash
cd C:/Users/Moises/Documents/MrLabs
npm create vite@latest construapp -- --template react-ts
cd construapp
```

- [ ] **Step 2: Instalar dependencias**

```bash
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install lucide-react
npm install html2pdf.js
npm install -D @types/html2pdf.js
```

- [ ] **Step 3: Configurar Tailwind**

Reemplazar `tailwind.config.ts`:
```ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
} satisfies Config
```

- [ ] **Step 4: Configurar CSS base**

Reemplazar `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #080808;
  color: #f0f0f0;
  font-family: system-ui, sans-serif;
}
```

- [ ] **Step 5: Limpiar App.tsx generado**

```tsx
// src/App.tsx
export default function App() {
  return <div className="min-h-screen bg-[#080808] text-[#f0f0f0]">OK</div>
}
```

- [ ] **Step 6: Verificar que arranca**

```bash
npm run dev
```
Esperado: página con texto "OK" en fondo oscuro en `http://localhost:5173`

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: scaffold construapp — vite + react + tailwind"
```

---

## Task 2: Tipos y storage

**Files:**
- Create: `src/types.ts`
- Create: `src/storage.ts`
- Create: `src/utils.ts`

- [ ] **Step 1: Definir tipos**

```ts
// src/types.ts
export type TipoPago = 'hora' | 'dia'

export interface Trabajador {
  id: string
  nombre: string
  oficio: string
  tipoPago: TipoPago
  tarifa: number
  telefono?: string
  activo: boolean
}

export interface Registro {
  id: string
  trabajadorId: string
  fecha: string        // YYYY-MM-DD
  cantidad: number     // horas o días
  actividad: string
  montoCalculado: number
}

export interface Pago {
  id: string
  trabajadorId: string
  fecha: string        // YYYY-MM-DD
  monto: number
  periodo: { desde: string; hasta: string }
  notas?: string
  folio: number
}

export interface AppData {
  trabajadores: Trabajador[]
  registros: Registro[]
  pagos: Pago[]
}
```

- [ ] **Step 2: Implementar storage**

```ts
// src/storage.ts
import type { AppData } from './types'

const KEY = 'construapp_data'

const empty: AppData = { trabajadores: [], registros: [], pagos: [] }

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return structuredClone(empty)
    return JSON.parse(raw) as AppData
  } catch {
    return structuredClone(empty)
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function getData(): AppData {
  return loadData()
}

export function updateData(updater: (data: AppData) => AppData): AppData {
  const current = loadData()
  const next = updater(current)
  saveData(next)
  return next
}
```

- [ ] **Step 3: Implementar utils**

```ts
// src/utils.ts

export function uuid(): string {
  return crypto.randomUUID()
}

export function hoy(): string {
  return new Date().toISOString().split('T')[0]
}

export function formatFecha(fecha: string): string {
  const [y, m, d] = fecha.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatMoneda(monto: number): string {
  return `$${monto.toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function semanaActual(): { desde: string; hasta: string } {
  const hoyDate = new Date()
  const dia = hoyDate.getDay()
  const lunes = new Date(hoyDate)
  lunes.setDate(hoyDate.getDate() - (dia === 0 ? 6 : dia - 1))
  const domingo = new Date(lunes)
  domingo.setDate(lunes.getDate() + 6)
  return {
    desde: lunes.toISOString().split('T')[0],
    hasta: domingo.toISOString().split('T')[0],
  }
}

export function quincenaActual(): { desde: string; hasta: string } {
  const hoyDate = new Date()
  const y = hoyDate.getFullYear()
  const m = hoyDate.getMonth()
  const d = hoyDate.getDate()
  if (d <= 15) {
    return {
      desde: `${y}-${String(m + 1).padStart(2, '0')}-01`,
      hasta: `${y}-${String(m + 1).padStart(2, '0')}-15`,
    }
  }
  const ultimo = new Date(y, m + 1, 0).getDate()
  return {
    desde: `${y}-${String(m + 1).padStart(2, '0')}-16`,
    hasta: `${y}-${String(m + 1).padStart(2, '0')}-${ultimo}`,
  }
}

export function calcularSaldo(
  trabajadorId: string,
  periodo: { desde: string; hasta: string },
  registros: import('./types').Registro[],
  pagos: import('./types').Pago[]
): { devengado: number; pagado: number; pendiente: number } {
  const devengado = registros
    .filter(r => r.trabajadorId === trabajadorId && r.fecha >= periodo.desde && r.fecha <= periodo.hasta)
    .reduce((sum, r) => sum + r.montoCalculado, 0)

  const pagado = pagos
    .filter(p => p.trabajadorId === trabajadorId && p.fecha >= periodo.desde && p.fecha <= periodo.hasta)
    .reduce((sum, p) => sum + p.monto, 0)

  return { devengado, pagado, pendiente: Math.max(0, devengado - pagado) }
}

export function siguienteFolio(pagos: import('./types').Pago[]): number {
  if (pagos.length === 0) return 1
  return Math.max(...pagos.map(p => p.folio)) + 1
}
```

- [ ] **Step 4: Commit**

```bash
git add src/types.ts src/storage.ts src/utils.ts
git commit -m "feat: tipos, storage y utils"
```

---

## Task 3: Shell — App + Sidebar

**Files:**
- Modify: `src/App.tsx`
- Create: `src/components/Sidebar.tsx`

- [ ] **Step 1: Crear Sidebar**

```tsx
// src/components/Sidebar.tsx
import { Users, ClipboardList, DollarSign, FileText } from 'lucide-react'

export type Seccion = 'trabajadores' | 'registro' | 'pagos' | 'reportes'

interface Props {
  activa: Seccion
  onChange: (s: Seccion) => void
}

const ITEMS: { key: Seccion; label: string; Icon: React.FC<{ size?: number; className?: string }> }[] = [
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
```

- [ ] **Step 2: Actualizar App.tsx**

```tsx
// src/App.tsx
import { useState } from 'react'
import Sidebar, { type Seccion } from './components/Sidebar'

export default function App() {
  const [seccion, setSeccion] = useState<Seccion>('trabajadores')

  return (
    <div className="flex min-h-screen bg-[#080808] text-[#f0f0f0]">
      <Sidebar activa={seccion} onChange={setSeccion} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <p className="text-[#555] text-sm">Sección: {seccion}</p>
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Verificar visualmente**

```bash
npm run dev
```
Esperado: sidebar con 4 ítems, el activo resaltado en violeta, navegación funcional.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/components/Sidebar.tsx
git commit -m "feat: shell — sidebar + navegación por secciones"
```

---

## Task 4: Módulo Trabajadores

**Files:**
- Create: `src/components/trabajadores/Trabajadores.tsx`
- Create: `src/components/trabajadores/TrabajadorForm.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Crear TrabajadorForm**

```tsx
// src/components/trabajadores/TrabajadorForm.tsx
import { useState } from 'react'
import { X } from 'lucide-react'
import type { Trabajador, TipoPago } from '../../types'
import { uuid } from '../../utils'

interface Props {
  inicial?: Trabajador
  onGuardar: (t: Trabajador) => void
  onCerrar: () => void
}

export default function TrabajadorForm({ inicial, onGuardar, onCerrar }: Props) {
  const [nombre, setNombre] = useState(inicial?.nombre ?? '')
  const [oficio, setOficio] = useState(inicial?.oficio ?? '')
  const [tipoPago, setTipoPago] = useState<TipoPago>(inicial?.tipoPago ?? 'dia')
  const [tarifa, setTarifa] = useState(inicial?.tarifa?.toString() ?? '')
  const [telefono, setTelefono] = useState(inicial?.telefono ?? '')
  const [error, setError] = useState('')

  const handleGuardar = () => {
    if (!nombre.trim()) { setError('El nombre es obligatorio'); return }
    if (!oficio.trim()) { setError('El oficio es obligatorio'); return }
    if (!tarifa || isNaN(Number(tarifa)) || Number(tarifa) <= 0) { setError('La tarifa debe ser un número mayor a 0'); return }
    onGuardar({
      id: inicial?.id ?? uuid(),
      nombre: nombre.trim(),
      oficio: oficio.trim(),
      tipoPago,
      tarifa: Number(tarifa),
      telefono: telefono.trim() || undefined,
      activo: inicial?.activo ?? true,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[#f0f0f0]">{inicial ? 'Editar trabajador' : 'Nuevo trabajador'}</h2>
          <button onClick={onCerrar} className="text-[#555] hover:text-[#aaa]"><X size={18} /></button>
        </div>

        {error && <p className="text-xs text-[#f87171] bg-[#f8717115] border border-[#f8717130] rounded-lg px-3 py-2">{error}</p>}

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#555] uppercase tracking-wide">Nombre *</span>
            <input className="bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0]" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Carlos Méndez" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#555] uppercase tracking-wide">Oficio *</span>
            <input className="bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0]" value={oficio} onChange={e => setOficio(e.target.value)} placeholder="Albañil" />
          </label>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-[#555] uppercase tracking-wide">Tipo de pago *</span>
            <div className="flex gap-2">
              {(['dia', 'hora'] as TipoPago[]).map(t => (
                <button key={t} onClick={() => setTipoPago(t)} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${tipoPago === t ? 'bg-[#9d7ff020] border-[#9d7ff050] text-[#9d7ff0]' : 'bg-[#0d0d0d] border-white/10 text-[#555] hover:text-[#aaa]'}`}>
                  Por {t === 'dia' ? 'día' : 'hora'}
                </button>
              ))}
            </div>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#555] uppercase tracking-wide">Tarifa ($ por {tipoPago === 'dia' ? 'día' : 'hora'}) *</span>
            <input type="number" min="0" className="bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0]" value={tarifa} onChange={e => setTarifa(e.target.value)} placeholder="180" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#555] uppercase tracking-wide">Teléfono (opcional)</span>
            <input className="bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0]" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="8888-0000" />
          </label>
        </div>

        <div className="flex gap-2 pt-2">
          <button onClick={onCerrar} className="flex-1 py-2 rounded-lg text-sm border border-white/10 text-[#666] hover:text-[#aaa]">Cancelar</button>
          <button onClick={handleGuardar} className="flex-1 py-2 rounded-lg text-sm font-semibold bg-[#9d7ff0] text-white hover:bg-[#8b6fd4] transition-colors">Guardar</button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Crear Trabajadores**

```tsx
// src/components/trabajadores/Trabajadores.tsx
import { useState } from 'react'
import { Plus, Pencil, PowerOff } from 'lucide-react'
import type { Trabajador } from '../../types'
import { updateData, loadData } from '../../storage'
import { formatMoneda } from '../../utils'
import TrabajadorForm from './TrabajadorForm'

export default function Trabajadores() {
  const [data, setData] = useState(() => loadData())
  const [formAbierto, setFormAbierto] = useState(false)
  const [editando, setEditando] = useState<Trabajador | undefined>()

  const trabajadores = data.trabajadores

  const guardar = (t: Trabajador) => {
    const next = updateData(d => {
      const idx = d.trabajadores.findIndex(x => x.id === t.id)
      if (idx >= 0) {
        d.trabajadores[idx] = t
      } else {
        d.trabajadores.push(t)
      }
      return d
    })
    setData(next)
    setFormAbierto(false)
    setEditando(undefined)
  }

  const toggleActivo = (id: string) => {
    const next = updateData(d => {
      const t = d.trabajadores.find(x => x.id === id)
      if (t) t.activo = !t.activo
      return d
    })
    setData(next)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#f0f0f0] tracking-tight">Trabajadores</h1>
          <p className="text-sm text-[#555] mt-0.5">{trabajadores.filter(t => t.activo).length} activos</p>
        </div>
        <button onClick={() => { setEditando(undefined); setFormAbierto(true) }} className="flex items-center gap-2 bg-[#9d7ff0] hover:bg-[#8b6fd4] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} /> Nuevo trabajador
        </button>
      </div>

      {trabajadores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#9d7ff015] border border-[#9d7ff030] flex items-center justify-center">
            <Plus size={24} className="text-[#9d7ff0]" />
          </div>
          <p className="text-[#555] text-sm">No hay trabajadores registrados.</p>
          <button onClick={() => setFormAbierto(true)} className="text-sm text-[#9d7ff0] font-medium hover:underline">Agregar primer trabajador</button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {trabajadores.map(t => (
            <div key={t.id} className={`bg-[#111] border rounded-xl px-4 py-3.5 flex items-center gap-3 ${t.activo ? 'border-white/5' : 'border-white/5 opacity-50'}`}>
              <div className="w-9 h-9 rounded-full bg-[#9d7ff020] flex items-center justify-center text-sm font-bold text-[#9d7ff0] shrink-0">
                {t.nombre.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#f0f0f0] truncate">{t.nombre}</p>
                <p className="text-xs text-[#555]">{t.oficio} · {formatMoneda(t.tarifa)}/{t.tipoPago === 'dia' ? 'día' : 'hora'}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.activo ? 'bg-[#34d39920] text-[#34d399]' : 'bg-[#55555520] text-[#555]'}`}>
                {t.activo ? 'Activo' : 'Inactivo'}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => { setEditando(t); setFormAbierto(true) }} className="p-1.5 text-[#555] hover:text-[#aaa] rounded-lg hover:bg-white/5"><Pencil size={14} /></button>
                <button onClick={() => toggleActivo(t.id)} className="p-1.5 text-[#555] hover:text-[#f87171] rounded-lg hover:bg-white/5"><PowerOff size={14} /></button>
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
```

- [ ] **Step 3: Conectar en App.tsx**

```tsx
// src/App.tsx
import { useState } from 'react'
import Sidebar, { type Seccion } from './components/Sidebar'
import Trabajadores from './components/trabajadores/Trabajadores'

export default function App() {
  const [seccion, setSeccion] = useState<Seccion>('trabajadores')

  return (
    <div className="flex min-h-screen bg-[#080808] text-[#f0f0f0]">
      <Sidebar activa={seccion} onChange={setSeccion} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-3xl">
          {seccion === 'trabajadores' && <Trabajadores />}
          {seccion !== 'trabajadores' && <p className="text-[#555] text-sm">Próximamente: {seccion}</p>}
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Verificar**

```bash
npm run dev
```
Esperado: crear, editar, activar/desactivar trabajadores. Los datos persisten al recargar.

- [ ] **Step 5: Commit**

```bash
git add src/components/trabajadores/ src/App.tsx
git commit -m "feat: módulo trabajadores — lista, crear, editar, activar/desactivar"
```

---

## Task 5: Módulo Registro Diario

**Files:**
- Create: `src/components/registro/TrabajadorRow.tsx`
- Create: `src/components/registro/RegistroDiario.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Crear TrabajadorRow**

```tsx
// src/components/registro/TrabajadorRow.tsx
import { useState } from 'react'
import type { Trabajador, Registro } from '../../types'
import { formatMoneda } from '../../utils'

interface Props {
  trabajador: Trabajador
  registroExistente?: Registro
  onChange: (parcial: Omit<Registro, 'id' | 'trabajadorId' | 'fecha'> | null) => void
}

export default function TrabajadorRow({ trabajador, registroExistente, onChange }: Props) {
  const [trabajo] = useState(!!registroExistente)
  const [activo, setActivo] = useState(!!registroExistente)
  const [cantidad, setCantidad] = useState(registroExistente?.cantidad?.toString() ?? '')
  const [actividad, setActividad] = useState(registroExistente?.actividad ?? '')

  const monto = activo && cantidad ? trabajador.tarifa * Number(cantidad) : 0

  const handleToggle = (val: boolean) => {
    setActivo(val)
    if (!val) {
      onChange(null)
      setCantidad('')
      setActividad('')
    }
  }

  const handleChange = (newCantidad: string, newActividad: string) => {
    const num = Number(newCantidad)
    if (!num || num <= 0) { onChange(null); return }
    onChange({
      actividad: newActividad,
      cantidad: num,
      montoCalculado: trabajador.tarifa * num,
    })
  }

  const initials = trabajador.nombre.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className={`bg-[#111] rounded-xl border transition-colors ${activo ? 'border-[#9d7ff040]' : 'border-white/5'}`}>
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="w-9 h-9 rounded-full bg-[#9d7ff020] flex items-center justify-center text-sm font-bold text-[#9d7ff0] shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#f0f0f0] truncate">{trabajador.nombre}</p>
          <p className="text-xs text-[#555]">{trabajador.oficio} · {formatMoneda(trabajador.tarifa)}/{trabajador.tipoPago === 'dia' ? 'día' : 'hora'}</p>
        </div>
        <button
          onClick={() => handleToggle(!activo)}
          className={`relative w-10 h-5 rounded-full transition-colors ${activo ? 'bg-[#9d7ff0]' : 'bg-[#333]'}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${activo ? 'left-5' : 'left-0.5'}`} />
        </button>
        <span className={`text-xs font-medium w-16 text-right ${activo ? 'text-[#9d7ff0]' : 'text-[#555]'}`}>
          {activo ? 'Trabajó' : 'No trabajó'}
        </span>
      </div>

      {activo && (
        <div className="px-4 pb-3.5 pt-0 border-t border-white/5 flex gap-2 mt-0">
          <div className="flex-1 flex flex-col gap-1 pt-3">
            <span className="text-xs text-[#555] uppercase tracking-wide">Actividad</span>
            <input
              className="bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0]"
              placeholder="Ej: Colada de columnas — Bloque B"
              value={actividad}
              onChange={e => { setActividad(e.target.value); handleChange(cantidad, e.target.value) }}
            />
          </div>
          <div className="w-20 flex flex-col gap-1 pt-3">
            <span className="text-xs text-[#555] uppercase tracking-wide">{trabajador.tipoPago === 'dia' ? 'Días' : 'Horas'}</span>
            <input
              type="number"
              min="0"
              step={trabajador.tipoPago === 'hora' ? '0.5' : '1'}
              className="bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#f0f0f0] text-center focus:outline-none focus:border-[#9d7ff0]"
              value={cantidad}
              onChange={e => { setCantidad(e.target.value); handleChange(e.target.value, actividad) }}
            />
          </div>
          <div className="w-24 flex flex-col gap-1 pt-3">
            <span className="text-xs text-[#555] uppercase tracking-wide">Total</span>
            <div className="bg-[#9d7ff015] border border-[#9d7ff030] rounded-lg px-3 py-2 text-sm font-bold text-[#9d7ff0] text-center">
              {formatMoneda(monto)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Crear RegistroDiario**

```tsx
// src/components/registro/RegistroDiario.tsx
import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Save } from 'lucide-react'
import type { Registro } from '../../types'
import { loadData, updateData } from '../../storage'
import { hoy, formatFecha, uuid, formatMoneda } from '../../utils'
import TrabajadorRow from './TrabajadorRow'

export default function RegistroDiario() {
  const [fecha, setFecha] = useState(hoy())
  const [data, setData] = useState(() => loadData())
  const [drafts, setDrafts] = useState<Record<string, Omit<Registro, 'id' | 'trabajadorId' | 'fecha'> | null>>({})
  const [guardado, setGuardado] = useState(false)

  const trabajadores = data.trabajadores.filter(t => t.activo)

  const registrosDelDia = data.registros.filter(r => r.fecha === fecha)

  const cambiarFecha = (dias: number) => {
    const d = new Date(fecha + 'T12:00:00')
    d.setDate(d.getDate() + dias)
    setFecha(d.toISOString().split('T')[0])
    setDrafts({})
    setGuardado(false)
  }

  const handleChange = useCallback((trabajadorId: string, parcial: Omit<Registro, 'id' | 'trabajadorId' | 'fecha'> | null) => {
    setDrafts(prev => ({ ...prev, [trabajadorId]: parcial }))
  }, [])

  const totalDia = Object.values(drafts).reduce((sum, d) => sum + (d?.montoCalculado ?? 0), 0) +
    registrosDelDia
      .filter(r => !(r.trabajadorId in drafts))
      .reduce((sum, r) => sum + r.montoCalculado, 0)

  const guardar = () => {
    const next = updateData(d => {
      Object.entries(drafts).forEach(([trabajadorId, parcial]) => {
        const idx = d.registros.findIndex(r => r.trabajadorId === trabajadorId && r.fecha === fecha)
        if (parcial === null) {
          if (idx >= 0) d.registros.splice(idx, 1)
        } else {
          const registro: Registro = { id: idx >= 0 ? d.registros[idx].id : uuid(), trabajadorId, fecha, ...parcial }
          if (idx >= 0) d.registros[idx] = registro
          else d.registros.push(registro)
        }
      })
      return d
    })
    setData(next)
    setDrafts({})
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#f0f0f0] tracking-tight">Registro diario</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => cambiarFecha(-1)} className="p-2 rounded-lg bg-[#111] border border-white/10 text-[#aaa] hover:text-white"><ChevronLeft size={16} /></button>
          <span className="text-sm text-[#f0f0f0] font-medium px-3 py-2 bg-[#111] border border-white/10 rounded-lg capitalize min-w-48 text-center">{formatFecha(fecha)}</span>
          <button onClick={() => cambiarFecha(1)} className="p-2 rounded-lg bg-[#111] border border-white/10 text-[#aaa] hover:text-white"><ChevronRight size={16} /></button>
        </div>
      </div>

      {trabajadores.length === 0 ? (
        <div className="py-20 text-center text-[#555] text-sm">No hay trabajadores activos. Agrega trabajadores primero.</div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {trabajadores.map(t => (
              <TrabajadorRow
                key={t.id}
                trabajador={t}
                registroExistente={registrosDelDia.find(r => r.trabajadorId === t.id)}
                onChange={parcial => handleChange(t.id, parcial)}
              />
            ))}
          </div>

          <div className="bg-[#111] border border-white/10 rounded-xl px-4 py-3.5 flex items-center justify-between sticky bottom-4">
            <div>
              <p className="text-xs text-[#555] uppercase tracking-wide">Total del día</p>
              <p className="text-xl font-bold text-[#9d7ff0] tracking-tight">{formatMoneda(totalDia)}</p>
            </div>
            <button onClick={guardar} className="flex items-center gap-2 bg-[#9d7ff0] hover:bg-[#8b6fd4] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
              <Save size={15} />
              {guardado ? 'Guardado' : 'Guardar registro'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Conectar en App.tsx**

```tsx
// src/App.tsx
import { useState } from 'react'
import Sidebar, { type Seccion } from './components/Sidebar'
import Trabajadores from './components/trabajadores/Trabajadores'
import RegistroDiario from './components/registro/RegistroDiario'

export default function App() {
  const [seccion, setSeccion] = useState<Seccion>('trabajadores')

  return (
    <div className="flex min-h-screen bg-[#080808] text-[#f0f0f0]">
      <Sidebar activa={seccion} onChange={setSeccion} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-3xl">
          {seccion === 'trabajadores' && <Trabajadores />}
          {seccion === 'registro' && <RegistroDiario />}
          {seccion !== 'trabajadores' && seccion !== 'registro' && <p className="text-[#555] text-sm">Próximamente: {seccion}</p>}
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Verificar**

```bash
npm run dev
```
Esperado: navegar entre fechas, marcar trabajadores, ingresar actividad + cantidad, total calculado automáticamente, guardar persiste en localStorage.

- [ ] **Step 5: Commit**

```bash
git add src/components/registro/ src/App.tsx
git commit -m "feat: módulo registro diario — toggle, actividad, horas/días, guardar"
```

---

## Task 6: Módulo Pagos

**Files:**
- Create: `src/components/pagos/Pagos.tsx`
- Create: `src/components/pagos/PagoModal.tsx`
- Create: `src/components/pagos/DetalleModal.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Crear PagoModal**

```tsx
// src/components/pagos/PagoModal.tsx
import { useState } from 'react'
import { X } from 'lucide-react'
import type { Trabajador, Pago } from '../../types'
import { uuid, hoy, formatMoneda, siguienteFolio } from '../../utils'
import { loadData } from '../../storage'

interface Props {
  trabajador: Trabajador
  saldoPendiente: number
  periodo: { desde: string; hasta: string }
  onGuardar: (pago: Pago) => void
  onCerrar: () => void
}

export default function PagoModal({ trabajador, saldoPendiente, periodo, onGuardar, onCerrar }: Props) {
  const [monto, setMonto] = useState(saldoPendiente.toFixed(2))
  const [notas, setNotas] = useState('')
  const [error, setError] = useState('')

  const handleGuardar = () => {
    const num = Number(monto)
    if (!num || num <= 0) { setError('El monto debe ser mayor a 0'); return }
    const pagos = loadData().pagos
    onGuardar({
      id: uuid(),
      trabajadorId: trabajador.id,
      fecha: hoy(),
      monto: num,
      periodo,
      notas: notas.trim() || undefined,
      folio: siguienteFolio(pagos),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-sm p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[#f0f0f0]">Registrar pago</h2>
          <button onClick={onCerrar} className="text-[#555] hover:text-[#aaa]"><X size={18} /></button>
        </div>
        <p className="text-sm text-[#555]">{trabajador.nombre} · Saldo pendiente: <span className="text-[#f87171] font-semibold">{formatMoneda(saldoPendiente)}</span></p>

        {error && <p className="text-xs text-[#f87171] bg-[#f8717115] border border-[#f8717130] rounded-lg px-3 py-2">{error}</p>}

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#555] uppercase tracking-wide">Monto a pagar *</span>
            <input type="number" min="0" className="bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0]" value={monto} onChange={e => setMonto(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#555] uppercase tracking-wide">Notas (opcional)</span>
            <input className="bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0]" value={notas} onChange={e => setNotas(e.target.value)} placeholder="Ej: Pago semana 1 de abril" />
          </label>
        </div>

        <div className="flex gap-2 pt-2">
          <button onClick={onCerrar} className="flex-1 py-2 rounded-lg text-sm border border-white/10 text-[#666] hover:text-[#aaa]">Cancelar</button>
          <button onClick={handleGuardar} className="flex-1 py-2 rounded-lg text-sm font-semibold bg-[#9d7ff0] text-white hover:bg-[#8b6fd4] transition-colors">Registrar pago</button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Crear DetalleModal**

```tsx
// src/components/pagos/DetalleModal.tsx
import { X } from 'lucide-react'
import type { Trabajador, Registro } from '../../types'
import { formatFecha, formatMoneda } from '../../utils'

interface Props {
  trabajador: Trabajador
  registros: Registro[]
  periodo: { desde: string; hasta: string }
  onCerrar: () => void
}

export default function DetalleModal({ trabajador, registros, periodo, onCerrar }: Props) {
  const etiquetaPeriodo = `${periodo.desde} al ${periodo.hasta}`
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg p-6 flex flex-col gap-4 max-h-[80vh]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-[#f0f0f0]">{trabajador.nombre}</h2>
            <p className="text-xs text-[#555]">Período: {etiquetaPeriodo}</p>
          </div>
          <button onClick={onCerrar} className="text-[#555] hover:text-[#aaa]"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto flex flex-col gap-1.5">
          {registros.length === 0 ? (
            <p className="text-sm text-[#555] text-center py-8">Sin registros en este período.</p>
          ) : registros.map(r => (
            <div key={r.id} className="flex items-center gap-3 bg-[#0d0d0d] border border-white/5 rounded-lg px-3 py-2.5">
              <span className="text-xs text-[#555] w-20 shrink-0 capitalize">{formatFecha(r.fecha).split(',')[0]}</span>
              <span className="flex-1 text-sm text-[#aaa] truncate">{r.actividad || '—'}</span>
              <span className="text-xs text-[#555] w-12 text-center shrink-0">{r.cantidad} {trabajador.tipoPago === 'dia' ? 'd' : 'h'}</span>
              <span className="text-sm font-semibold text-[#f0f0f0] w-20 text-right shrink-0">{formatMoneda(r.montoCalculado)}</span>
            </div>
          ))}
        </div>
        {registros.length > 0 && (
          <div className="border-t border-white/5 pt-3 flex justify-between items-center">
            <span className="text-xs text-[#555]">Total devengado</span>
            <span className="font-bold text-[#f0f0f0]">{formatMoneda(registros.reduce((s, r) => s + r.montoCalculado, 0))}</span>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Crear Pagos**

```tsx
// src/components/pagos/Pagos.tsx
import { useState } from 'react'
import { Eye, DollarSign, FileText } from 'lucide-react'
import type { Trabajador, Pago } from '../../types'
import { loadData, updateData } from '../../storage'
import { calcularSaldo, formatMoneda, semanaActual, quincenaActual } from '../../utils'
import PagoModal from './PagoModal'
import DetalleModal from './DetalleModal'

type ModoPeriodo = 'semana' | 'quincena' | 'personalizado'

export default function Pagos() {
  const [data, setData] = useState(() => loadData())
  const [modo, setModo] = useState<ModoPeriodo>('semana')
  const [periodoCustom, setPeriodoCustom] = useState({ desde: '', hasta: '' })
  const [pagoModal, setPagoModal] = useState<Trabajador | null>(null)
  const [detalleModal, setDetalleModal] = useState<Trabajador | null>(null)

  const periodo = modo === 'semana' ? semanaActual() : modo === 'quincena' ? quincenaActual() : periodoCustom
  const trabajadores = data.trabajadores.filter(t => t.activo)

  const guardarPago = (pago: Pago) => {
    const next = updateData(d => { d.pagos.push(pago); return d })
    setData(next)
    setPagoModal(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-[#f0f0f0] tracking-tight">Pagos</h1>

      {/* Period selector */}
      <div className="flex flex-wrap gap-2 items-center">
        {(['semana', 'quincena', 'personalizado'] as ModoPeriodo[]).map(m => (
          <button key={m} onClick={() => setModo(m)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${modo === m ? 'bg-[#9d7ff0] text-white' : 'bg-[#111] border border-white/10 text-[#555] hover:text-[#aaa]'}`}>
            {m}
          </button>
        ))}
        {modo === 'personalizado' && (
          <div className="flex gap-2 items-center mt-1 w-full">
            <input type="date" className="bg-[#111] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0]" value={periodoCustom.desde} onChange={e => setPeriodoCustom(p => ({ ...p, desde: e.target.value }))} />
            <span className="text-[#555] text-sm">al</span>
            <input type="date" className="bg-[#111] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0]" value={periodoCustom.hasta} onChange={e => setPeriodoCustom(p => ({ ...p, hasta: e.target.value }))} />
          </div>
        )}
      </div>

      {trabajadores.length === 0 ? (
        <p className="text-[#555] text-sm text-center py-20">No hay trabajadores activos.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {trabajadores.map(t => {
            const { devengado, pagado, pendiente } = calcularSaldo(t.id, periodo, data.registros, data.pagos)
            const sinDeuda = pendiente === 0
            return (
              <div key={t.id} className="bg-[#111] border border-white/5 rounded-xl px-4 py-3.5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#9d7ff020] flex items-center justify-center text-sm font-bold text-[#9d7ff0] shrink-0">
                    {t.nombre.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#f0f0f0] truncate">{t.nombre}</p>
                    <p className="text-xs text-[#555]">{t.oficio}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-[#f0f0f0] tracking-tight">{formatMoneda(devengado)}</p>
                    <span className={`text-xs font-medium ${sinDeuda ? 'text-[#34d399]' : 'text-[#f87171]'}`}>
                      {sinDeuda ? 'Sin deuda' : `Pendiente ${formatMoneda(pendiente)}`}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 border-t border-white/5 pt-3">
                  <button onClick={() => setDetalleModal(t)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs border border-white/10 text-[#555] hover:text-[#aaa]">
                    <Eye size={13} /> Ver detalle
                  </button>
                  <button onClick={() => setPagoModal(t)} disabled={sinDeuda} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${sinDeuda ? 'bg-[#1a1a1a] text-[#333] cursor-not-allowed' : 'bg-[#9d7ff0] text-white hover:bg-[#8b6fd4]'}`}>
                    <DollarSign size={13} /> Registrar pago
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {pagoModal && (
        <PagoModal
          trabajador={pagoModal}
          saldoPendiente={calcularSaldo(pagoModal.id, periodo, data.registros, data.pagos).pendiente}
          periodo={periodo}
          onGuardar={guardarPago}
          onCerrar={() => setPagoModal(null)}
        />
      )}
      {detalleModal && (
        <DetalleModal
          trabajador={detalleModal}
          registros={data.registros.filter(r => r.trabajadorId === detalleModal.id && r.fecha >= periodo.desde && r.fecha <= periodo.hasta)}
          periodo={periodo}
          onCerrar={() => setDetalleModal(null)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 4: Conectar en App.tsx**

```tsx
// src/App.tsx
import { useState } from 'react'
import Sidebar, { type Seccion } from './components/Sidebar'
import Trabajadores from './components/trabajadores/Trabajadores'
import RegistroDiario from './components/registro/RegistroDiario'
import Pagos from './components/pagos/Pagos'

export default function App() {
  const [seccion, setSeccion] = useState<Seccion>('trabajadores')

  return (
    <div className="flex min-h-screen bg-[#080808] text-[#f0f0f0]">
      <Sidebar activa={seccion} onChange={setSeccion} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-3xl">
          {seccion === 'trabajadores' && <Trabajadores />}
          {seccion === 'registro' && <RegistroDiario />}
          {seccion === 'pagos' && <Pagos />}
          {seccion === 'reportes' && <p className="text-[#555] text-sm">Próximamente: reportes</p>}
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 5: Verificar**

```bash
npm run dev
```
Esperado: ver saldos por trabajador, registrar pagos, ver detalle de registros por período. Botón deshabilitado si sin deuda.

- [ ] **Step 6: Commit**

```bash
git add src/components/pagos/ src/App.tsx
git commit -m "feat: módulo pagos — saldos, registrar pago, detalle por período"
```

---

## Task 7: Plantillas PDF

**Files:**
- Create: `src/components/pdf/ComprobanteTemplate.tsx`
- Create: `src/components/pdf/PlanillaTemplate.tsx`
- Create: `src/hooks/usePDF.ts`

- [ ] **Step 1: Crear hook usePDF**

```ts
// src/hooks/usePDF.ts
import html2pdf from 'html2pdf.js'

export function usePDF() {
  const exportar = (elementId: string, nombreArchivo: string) => {
    const el = document.getElementById(elementId)
    if (!el) return
    html2pdf().set({
      margin: 10,
      filename: `${nombreArchivo}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' },
    }).from(el).save()
  }
  return { exportar }
}
```

- [ ] **Step 2: Crear ComprobanteTemplate**

```tsx
// src/components/pdf/ComprobanteTemplate.tsx
import type { Trabajador, Registro, Pago } from '../../types'
import { formatMoneda } from '../../utils'

interface Props {
  id: string
  trabajador: Trabajador
  registros: Registro[]
  pago: Pago
  nombreEmpresa?: string
}

export default function ComprobanteTemplate({ id, trabajador, registros, pago, nombreEmpresa = 'Constructora' }: Props) {
  return (
    <div id={id} style={{ fontFamily: 'Arial, sans-serif', padding: '32px', color: '#111', background: '#fff', maxWidth: '700px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #eee' }}>
        <div>
          <p style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>COMPROBANTE DE PAGO</p>
          <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 0' }}>Folio #{String(pago.folio).padStart(4, '0')} · {pago.fecha}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>{nombreEmpresa}</p>
        </div>
      </div>
      {/* Trabajador info */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px' }}>Trabajador</p>
        <p style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>{trabajador.nombre}</p>
        <p style={{ fontSize: '12px', color: '#666', margin: '2px 0 0' }}>{trabajador.oficio} · Período: {pago.periodo.desde} al {pago.periodo.hasta}</p>
      </div>
      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '20px' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #eee', color: '#888', fontWeight: 600 }}>Fecha</th>
            <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #eee', color: '#888', fontWeight: 600 }}>Actividad</th>
            <th style={{ textAlign: 'right', padding: '8px', border: '1px solid #eee', color: '#888', fontWeight: 600 }}>{trabajador.tipoPago === 'dia' ? 'Días' : 'Horas'}</th>
            <th style={{ textAlign: 'right', padding: '8px', border: '1px solid #eee', color: '#888', fontWeight: 600 }}>Monto</th>
          </tr>
        </thead>
        <tbody>
          {registros.map((r, i) => (
            <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
              <td style={{ padding: '7px 8px', border: '1px solid #eee' }}>{r.fecha}</td>
              <td style={{ padding: '7px 8px', border: '1px solid #eee' }}>{r.actividad || '—'}</td>
              <td style={{ padding: '7px 8px', border: '1px solid #eee', textAlign: 'right' }}>{r.cantidad}</td>
              <td style={{ padding: '7px 8px', border: '1px solid #eee', textAlign: 'right' }}>{formatMoneda(r.montoCalculado)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Total */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
        <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '12px 20px', textAlign: 'right' }}>
          <p style={{ fontSize: '11px', color: '#888', margin: '0 0 4px' }}>Total pagado</p>
          <p style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>{formatMoneda(pago.monto)}</p>
        </div>
      </div>
      {/* Firmas */}
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #eee', fontSize: '11px', color: '#aaa' }}>
        <span>Firma del trabajador: ___________________</span>
        <span>Firma del empleador: ___________________</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Crear PlanillaTemplate**

```tsx
// src/components/pdf/PlanillaTemplate.tsx
import type { Trabajador, Registro, Pago } from '../../types'
import { calcularSaldo, formatMoneda } from '../../utils'

interface Props {
  id: string
  trabajadores: Trabajador[]
  registros: Registro[]
  pagos: Pago[]
  periodo: { desde: string; hasta: string }
  nombreEmpresa?: string
}

export default function PlanillaTemplate({ id, trabajadores, registros, pagos, periodo, nombreEmpresa = 'Constructora' }: Props) {
  const filas = trabajadores.map(t => {
    const regs = registros.filter(r => r.trabajadorId === t.id && r.fecha >= periodo.desde && r.fecha <= periodo.hasta)
    const totalCantidad = regs.reduce((s, r) => s + r.cantidad, 0)
    const { devengado, pagado, pendiente } = calcularSaldo(t.id, periodo, registros, pagos)
    return { t, totalCantidad, devengado, pagado, pendiente }
  }).filter(f => f.devengado > 0)

  const totalDevengado = filas.reduce((s, f) => s + f.devengado, 0)
  const totalPagado = filas.reduce((s, f) => s + f.pagado, 0)
  const totalPendiente = filas.reduce((s, f) => s + f.pendiente, 0)

  return (
    <div id={id} style={{ fontFamily: 'Arial, sans-serif', padding: '32px', color: '#111', background: '#fff' }}>
      <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #eee' }}>
        <p style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>PLANILLA DE PAGO</p>
        <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 0' }}>{nombreEmpresa} · Período: {periodo.desde} al {periodo.hasta}</p>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #eee', color: '#888', fontWeight: 600 }}>Trabajador</th>
            <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #eee', color: '#888', fontWeight: 600 }}>Oficio</th>
            <th style={{ textAlign: 'right', padding: '8px', border: '1px solid #eee', color: '#888', fontWeight: 600 }}>Días/Hrs</th>
            <th style={{ textAlign: 'right', padding: '8px', border: '1px solid #eee', color: '#888', fontWeight: 600 }}>Devengado</th>
            <th style={{ textAlign: 'right', padding: '8px', border: '1px solid #eee', color: '#888', fontWeight: 600 }}>Pagado</th>
            <th style={{ textAlign: 'right', padding: '8px', border: '1px solid #eee', color: '#888', fontWeight: 600 }}>Pendiente</th>
          </tr>
        </thead>
        <tbody>
          {filas.map(({ t, totalCantidad, devengado, pagado, pendiente }, i) => (
            <tr key={t.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
              <td style={{ padding: '7px 8px', border: '1px solid #eee', fontWeight: 600 }}>{t.nombre}</td>
              <td style={{ padding: '7px 8px', border: '1px solid #eee', color: '#666' }}>{t.oficio}</td>
              <td style={{ padding: '7px 8px', border: '1px solid #eee', textAlign: 'right' }}>{totalCantidad}</td>
              <td style={{ padding: '7px 8px', border: '1px solid #eee', textAlign: 'right' }}>{formatMoneda(devengado)}</td>
              <td style={{ padding: '7px 8px', border: '1px solid #eee', textAlign: 'right' }}>{formatMoneda(pagado)}</td>
              <td style={{ padding: '7px 8px', border: '1px solid #eee', textAlign: 'right', fontWeight: pendiente > 0 ? 700 : 400 }}>{formatMoneda(pendiente)}</td>
            </tr>
          ))}
          <tr style={{ background: '#f0f0f0', fontWeight: 700 }}>
            <td colSpan={3} style={{ padding: '8px', border: '1px solid #eee', textAlign: 'right' }}>TOTALES</td>
            <td style={{ padding: '8px', border: '1px solid #eee', textAlign: 'right' }}>{formatMoneda(totalDevengado)}</td>
            <td style={{ padding: '8px', border: '1px solid #eee', textAlign: 'right' }}>{formatMoneda(totalPagado)}</td>
            <td style={{ padding: '8px', border: '1px solid #eee', textAlign: 'right' }}>{formatMoneda(totalPendiente)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/pdf/ src/hooks/
git commit -m "feat: plantillas PDF — comprobante individual y planilla general"
```

---

## Task 8: Comprobante PDF en módulo Pagos

**Files:**
- Modify: `src/components/pagos/Pagos.tsx`

- [ ] **Step 1: Integrar generación de comprobante en Pagos**

Agregar al final de `Pagos.tsx`, dentro del `return`, un div oculto con la plantilla del comprobante, y conectar el botón "Comprobante PDF":

```tsx
// Agregar imports al inicio de Pagos.tsx
import { useState, useRef } from 'react'
import { Eye, DollarSign, FileText } from 'lucide-react'
import ComprobanteTemplate from '../pdf/ComprobanteTemplate'
import { usePDF } from '../../hooks/usePDF'

// Agregar dentro del componente Pagos:
const { exportar } = usePDF()
const [comprobanteTarget, setComprobanteTarget] = useState<{ trabajador: Trabajador; pago: Pago } | null>(null)

const generarComprobante = (t: Trabajador) => {
  const pagosT = data.pagos
    .filter(p => p.trabajadorId === t.id && p.fecha >= periodo.desde && p.fecha <= periodo.hasta)
    .sort((a, b) => b.folio - a.folio)
  const ultimoPago = pagosT[0]
  if (!ultimoPago) return
  setComprobanteTarget({ trabajador: t, pago: ultimoPago })
  setTimeout(() => {
    exportar(`comprobante-${t.id}`, `comprobante-${t.nombre.replace(/\s+/g, '-')}-${ultimoPago.folio}`)
  }, 100)
}

// Dentro del JSX de la tarjeta de cada trabajador, reemplazar el div de acciones:
<div className="flex gap-2 border-t border-white/5 pt-3">
  <button onClick={() => setDetalleModal(t)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs border border-white/10 text-[#555] hover:text-[#aaa]">
    <Eye size={13} /> Ver detalle
  </button>
  <button onClick={() => setPagoModal(t)} disabled={sinDeuda} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${sinDeuda ? 'bg-[#1a1a1a] text-[#333] cursor-not-allowed' : 'bg-[#9d7ff0] text-white hover:bg-[#8b6fd4]'}`}>
    <DollarSign size={13} /> Registrar pago
  </button>
  <button onClick={() => generarComprobante(t)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs border border-white/10 text-[#555] hover:text-[#aaa]">
    <FileText size={13} /> Comprobante
  </button>
</div>

// Al final del return, div oculto con la plantilla:
{comprobanteTarget && (
  <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
    <ComprobanteTemplate
      id={`comprobante-${comprobanteTarget.trabajador.id}`}
      trabajador={comprobanteTarget.trabajador}
      registros={data.registros.filter(r =>
        r.trabajadorId === comprobanteTarget.trabajador.id &&
        r.fecha >= comprobanteTarget.pago.periodo.desde &&
        r.fecha <= comprobanteTarget.pago.periodo.hasta
      )}
      pago={comprobanteTarget.pago}
    />
  </div>
)}
```

- [ ] **Step 2: Verificar**

```bash
npm run dev
```
Esperado: al hacer click en "Comprobante" se descarga un PDF con el detalle del último pago del trabajador en el período.

- [ ] **Step 3: Commit**

```bash
git add src/components/pagos/Pagos.tsx
git commit -m "feat: generar comprobante PDF individual desde módulo pagos"
```

---

## Task 9: Módulo Reportes

**Files:**
- Create: `src/components/reportes/Reportes.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Crear Reportes**

```tsx
// src/components/reportes/Reportes.tsx
import { useState } from 'react'
import { Download } from 'lucide-react'
import { loadData } from '../../storage'
import { calcularSaldo, formatMoneda, semanaActual, quincenaActual } from '../../utils'
import { usePDF } from '../../hooks/usePDF'
import PlanillaTemplate from '../pdf/PlanillaTemplate'

type ModoPeriodo = 'semana' | 'quincena' | 'personalizado'

export default function Reportes() {
  const [data] = useState(() => loadData())
  const [modo, setModo] = useState<ModoPeriodo>('semana')
  const [periodoCustom, setPeriodoCustom] = useState({ desde: '', hasta: '' })
  const { exportar } = usePDF()

  const periodo = modo === 'semana' ? semanaActual() : modo === 'quincena' ? quincenaActual() : periodoCustom
  const trabajadores = data.trabajadores.filter(t => t.activo)

  const filas = trabajadores.map(t => {
    const regs = data.registros.filter(r => r.trabajadorId === t.id && r.fecha >= periodo.desde && r.fecha <= periodo.hasta)
    const totalCantidad = regs.reduce((s, r) => s + r.cantidad, 0)
    const { devengado, pagado, pendiente } = calcularSaldo(t.id, periodo, data.registros, data.pagos)
    return { t, totalCantidad, devengado, pagado, pendiente }
  })

  const conActividad = filas.filter(f => f.devengado > 0)
  const totalDevengado = conActividad.reduce((s, f) => s + f.devengado, 0)
  const totalPagado = conActividad.reduce((s, f) => s + f.pagado, 0)
  const totalPendiente = conActividad.reduce((s, f) => s + f.pendiente, 0)

  const exportarPlanilla = () => {
    exportar('planilla-pdf', `planilla-${periodo.desde}-${periodo.hasta}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#f0f0f0] tracking-tight">Reportes</h1>
        <button onClick={exportarPlanilla} className="flex items-center gap-2 border border-[#9d7ff050] text-[#9d7ff0] text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#9d7ff010] transition-colors">
          <Download size={15} /> Exportar planilla PDF
        </button>
      </div>

      {/* Period selector */}
      <div className="flex flex-wrap gap-2 items-center">
        {(['semana', 'quincena', 'personalizado'] as ModoPeriodo[]).map(m => (
          <button key={m} onClick={() => setModo(m)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${modo === m ? 'bg-[#9d7ff0] text-white' : 'bg-[#111] border border-white/10 text-[#555] hover:text-[#aaa]'}`}>
            {m}
          </button>
        ))}
        {modo === 'personalizado' && (
          <div className="flex gap-2 items-center mt-1 w-full">
            <input type="date" className="bg-[#111] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0]" value={periodoCustom.desde} onChange={e => setPeriodoCustom(p => ({ ...p, desde: e.target.value }))} />
            <span className="text-[#555] text-sm">al</span>
            <input type="date" className="bg-[#111] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0]" value={periodoCustom.hasta} onChange={e => setPeriodoCustom(p => ({ ...p, hasta: e.target.value }))} />
          </div>
        )}
      </div>

      {conActividad.length === 0 ? (
        <div className="py-20 text-center text-[#555] text-sm">Sin registros en este período.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2.5 px-3 text-xs text-[#555] uppercase tracking-wide font-semibold">Trabajador</th>
                <th className="text-left py-2.5 px-3 text-xs text-[#555] uppercase tracking-wide font-semibold">Oficio</th>
                <th className="text-right py-2.5 px-3 text-xs text-[#555] uppercase tracking-wide font-semibold">Días/Hrs</th>
                <th className="text-right py-2.5 px-3 text-xs text-[#555] uppercase tracking-wide font-semibold">Devengado</th>
                <th className="text-right py-2.5 px-3 text-xs text-[#555] uppercase tracking-wide font-semibold">Pagado</th>
                <th className="text-right py-2.5 px-3 text-xs text-[#555] uppercase tracking-wide font-semibold">Pendiente</th>
              </tr>
            </thead>
            <tbody>
              {conActividad.map(({ t, totalCantidad, devengado, pagado, pendiente }) => (
                <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-3 px-3 font-medium text-[#f0f0f0]">{t.nombre}</td>
                  <td className="py-3 px-3 text-[#555]">{t.oficio}</td>
                  <td className="py-3 px-3 text-right text-[#aaa]">{totalCantidad}</td>
                  <td className="py-3 px-3 text-right text-[#f0f0f0]">{formatMoneda(devengado)}</td>
                  <td className="py-3 px-3 text-right text-[#34d399]">{formatMoneda(pagado)}</td>
                  <td className={`py-3 px-3 text-right font-semibold ${pendiente > 0 ? 'text-[#f87171]' : 'text-[#34d399]'}`}>{formatMoneda(pendiente)}</td>
                </tr>
              ))}
              <tr className="border-t border-white/20 bg-white/[0.03]">
                <td colSpan={3} className="py-3 px-3 text-xs font-bold text-[#555] uppercase tracking-wide text-right">Totales</td>
                <td className="py-3 px-3 text-right font-bold text-[#f0f0f0]">{formatMoneda(totalDevengado)}</td>
                <td className="py-3 px-3 text-right font-bold text-[#34d399]">{formatMoneda(totalPagado)}</td>
                <td className="py-3 px-3 text-right font-bold text-[#f87171]">{formatMoneda(totalPendiente)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Hidden PDF template */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <PlanillaTemplate
          id="planilla-pdf"
          trabajadores={trabajadores}
          registros={data.registros}
          pagos={data.pagos}
          periodo={periodo}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Conectar en App.tsx**

```tsx
// src/App.tsx
import { useState } from 'react'
import Sidebar, { type Seccion } from './components/Sidebar'
import Trabajadores from './components/trabajadores/Trabajadores'
import RegistroDiario from './components/registro/RegistroDiario'
import Pagos from './components/pagos/Pagos'
import Reportes from './components/reportes/Reportes'

export default function App() {
  const [seccion, setSeccion] = useState<Seccion>('trabajadores')

  return (
    <div className="flex min-h-screen bg-[#080808] text-[#f0f0f0]">
      <Sidebar activa={seccion} onChange={setSeccion} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-4xl">
          {seccion === 'trabajadores' && <Trabajadores />}
          {seccion === 'registro' && <RegistroDiario />}
          {seccion === 'pagos' && <Pagos />}
          {seccion === 'reportes' && <Reportes />}
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Verificar**

```bash
npm run dev
```
Esperado: tabla de planilla con totales, botón exportar genera PDF descargable.

- [ ] **Step 4: Commit**

```bash
git add src/components/reportes/ src/App.tsx
git commit -m "feat: módulo reportes — planilla por período + exportar PDF"
```

---

## Task 10: Build y verificación final

**Files:** ninguno nuevo

- [ ] **Step 1: Build de producción**

```bash
npm run build
```
Esperado: carpeta `dist/` generada sin errores de TypeScript.

- [ ] **Step 2: Preview del build**

```bash
npm run preview
```
Verificar que todos los módulos funcionan desde el build estático.

- [ ] **Step 3: Agregar .gitignore si no existe**

```bash
# Verificar que dist/ y node_modules están ignorados
cat .gitignore
```
Debe contener `dist`, `node_modules`, `.env`.

- [ ] **Step 4: Commit final**

```bash
git add .
git commit -m "feat: construapp — app completa de gestión de personal construcción"
```

---

## Auto-revisión del plan

**Cobertura del spec:**
- Trabajadores (crear, editar, desactivar) — Task 4
- Registro diario (fecha, toggle, actividad, cantidad, cálculo) — Task 5
- Pagos (saldos, registrar pago, detalle, badge) — Task 6
- Comprobante PDF individual — Task 8
- Reportes / Planilla PDF — Task 9
- `storage.ts` centralizado — Task 2
- Estados UI: empty state, saldo cero deshabilitado, registros existentes — cubiertos en Tasks 4, 5, 6, 9
- Período personalizado — Tasks 6, 9
- `calcularSaldo` reutilizada en Pagos y Reportes — definida en Task 2, usada en Tasks 6 y 9

**Sin placeholders:** todo el código está completo en cada step.

**Consistencia de tipos:** `Trabajador`, `Registro`, `Pago` definidos en Task 2 y usados consistentemente. `calcularSaldo` firma idéntica en Tasks 2, 6 y 9. `usePDF` → `exportar(elementId, filename)` consistente en Tasks 7, 8 y 9.
