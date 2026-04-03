'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, UtensilsCrossed, CheckSquare, ShoppingCart, Settings, Bell, UserCircle } from 'lucide-react'

const NAV = [
  { href: '/',        label: 'Inicio',   icon: LayoutDashboard },
  { href: '/plan',    label: 'Mi Plan',  icon: UtensilsCrossed },
  { href: '/checkin', label: 'Check-in', icon: CheckSquare },
  { href: '/lista',   label: 'Compras',  icon: ShoppingCart },
]

const GOAL_LABEL: Record<string, string> = {
  MUSCLE_GAIN: 'Ganancia Muscular',
  FAT_LOSS: 'Pérdida de Grasa',
  MAINTENANCE: 'Mantenimiento',
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [userGoal, setUserGoal] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setUserName(user.email.split('@')[0])
    })
    fetch('/api/dashboard').then(r => r.json()).then(json => {
      if (!json.error) setUserGoal(json.goal ?? 'MUSCLE_GAIN')
    })
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isCheckin = pathname === '/checkin'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--base)' }}>

      {/* Topbar */}
      <header style={{ height: '56px', flexShrink: 0, background: 'var(--sidebar)', borderBottom: '1px solid var(--surface-high)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 10 }}>
        <p style={{ fontFamily: 'var(--font-outfit)', fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>NutriSync</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center' }}>
            <Bell size={18} strokeWidth={1.5} />
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center' }}>
            <UserCircle size={20} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>

        {/* Sidebar */}
        <aside style={{ width: '220px', flexShrink: 0, background: 'var(--sidebar)', display: 'flex', flexDirection: 'column', padding: '20px 16px', borderRight: '1px solid var(--surface-high)' }}>

          {/* User profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '8px', background: 'var(--surface)', marginBottom: '24px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--surface-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '16px' }}>👤</span>
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontFamily: 'var(--font-outfit)', fontSize: '13px', fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Hola, {userName}
              </p>
              <p style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '1px' }}>
                {GOAL_LABEL[userGoal] ?? 'Ganancia Muscular'}
              </p>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link key={href} href={href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 12px', borderRadius: '8px',
                    background: active ? 'var(--surface-high)' : 'transparent',
                    color: active ? 'var(--text)' : 'var(--muted)',
                    fontSize: '14px', fontWeight: active ? 500 : 400,
                    textDecoration: 'none', transition: 'all 0.15s',
                  }}>
                  <Icon size={16} strokeWidth={active ? 2 : 1.5} />
                  {label}
                  {active && <span style={{ marginLeft: 'auto', width: '4px', height: '4px', borderRadius: '50%', background: 'var(--primary)' }} />}
                </Link>
              )
            })}
          </nav>

          {/* Submit button — solo visible en /checkin */}
          {isCheckin && (
            <button type="submit" form="checkin-form"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--primary)', color: 'var(--on-primary)', fontFamily: 'var(--font-outfit)', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', marginBottom: '12px', transition: 'opacity 0.15s' }}>
              Registrar Entrenamiento
            </button>
          )}

          {/* Settings */}
          <button onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', background: 'none', border: 'none', color: 'var(--muted)', fontSize: '14px', cursor: 'pointer', width: '100%' }}>
            <Settings size={16} strokeWidth={1.5} />
            Ajustes
          </button>
        </aside>

        {/* Content */}
        <main style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </main>

      </div>
    </div>
  )
}
