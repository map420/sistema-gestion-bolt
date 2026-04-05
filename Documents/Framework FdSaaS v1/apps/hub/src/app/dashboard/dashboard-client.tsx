"use client"
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { ProductMetrics } from './page'
import type { ProductConfig } from '@/config/products'

type Props = {
  products: ProductConfig[]
  metricsMap: Record<string, ProductMetrics>
}

function StatusDot({ status }: { status: ProductMetrics['status'] }) {
  const colors: Record<string, string> = {
    healthy: '#22C55E',
    degraded: '#EAB308',
    down: '#EF4444',
  }
  return (
    <span
      className="inline-block w-2 h-2 rounded-full"
      style={{ background: colors[status] ?? '#6B6B6B' }}
      title={status}
    />
  )
}

function MetricCard({ product, config, metrics }: { product: string; config: ProductConfig; metrics: ProductMetrics }) {
  const updatedAt = new Date(metrics.lastUpdated)
  const timeAgo = Math.round((Date.now() - updatedAt.getTime()) / 1000)
  const timeLabel = timeAgo < 60 ? `${timeAgo}s ago` : `${Math.round(timeAgo / 60)}m ago`

  return (
    <div
      className="rounded-xl p-6 flex flex-col gap-5"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ background: config.color }} />
            <span className="font-semibold text-base" style={{ color: 'var(--text)' }}>{config.name}</span>
            <StatusDot status={metrics.status} />
          </div>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>{config.description}</p>
        </div>
        <a
          href={config.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-2 py-1 rounded transition-colors"
          style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          ↗ App
        </a>
      </div>

      {/* Users */}
      <div
        className="rounded-lg p-4 flex items-center justify-between"
        style={{ background: 'var(--surface-high)' }}
      >
        <div>
          <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Usuarios</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{metrics.users.total.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Esta semana</p>
          <p className="text-lg font-semibold" style={{ color: metrics.users.newThisWeek > 0 ? 'var(--accent)' : 'var(--muted)' }}>
            +{metrics.users.newThisWeek}
          </p>
        </div>
      </div>

      {/* Records */}
      {metrics.records.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {metrics.records.map((rec) => (
            <div
              key={rec.label}
              className="rounded-lg p-3"
              style={{ background: 'var(--surface-high)' }}
            >
              <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>{rec.label}</p>
              <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>{rec.total.toLocaleString()}</p>
              <p className="text-xs mt-1" style={{ color: rec.thisWeek > 0 ? 'var(--accent)' : 'var(--muted)' }}>
                +{rec.thisWeek} esta semana
              </p>
            </div>
          ))}
        </div>
      )}

      {metrics.status === 'down' && metrics.error && (
        <p className="text-xs px-3 py-2 rounded" style={{ color: '#FCA5A5', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
          Error: {metrics.error}
        </p>
      )}

      {/* Footer */}
      <p className="text-xs" style={{ color: 'var(--muted)' }}>Actualizado {timeLabel}</p>
    </div>
  )
}

export default function DashboardClient({ products, metricsMap }: Props) {
  const router = useRouter()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Auto-refresh cada 60s
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      router.refresh()
    }, 60_000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [router])

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/')
  }

  const now = new Date()
  const totalUsers = Object.values(metricsMap).reduce((sum, m) => sum + m.users.total, 0)
  const newThisWeek = Object.values(metricsMap).reduce((sum, m) => sum + m.users.newThisWeek, 0)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
          <span className="text-sm font-semibold tracking-widest uppercase" style={{ color: 'var(--muted)' }}>
            Factory Hub
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-high)', color: 'var(--muted)' }}>
            {products.length} productos
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            {now.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
          <button
            onClick={handleLogout}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            Salir
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>USUARIOS TOTALES — TODA LA FÁBRICA</p>
            <p className="text-4xl font-bold" style={{ color: 'var(--text)' }}>{totalUsers.toLocaleString()}</p>
          </div>
          <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>NUEVOS ESTA SEMANA</p>
            <p className="text-4xl font-bold" style={{ color: newThisWeek > 0 ? 'var(--accent)' : 'var(--text)' }}>
              +{newThisWeek.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Product cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((p) => (
            <MetricCard
              key={p.id}
              product={p.id}
              config={p}
              metrics={metricsMap[p.id]}
            />
          ))}
        </div>

        <p className="text-center text-xs mt-8" style={{ color: 'var(--muted)' }}>
          Auto-refresh cada 60s · {now.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}
