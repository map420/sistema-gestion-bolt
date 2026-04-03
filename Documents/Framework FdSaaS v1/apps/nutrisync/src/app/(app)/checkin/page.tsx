'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Plan { id: string; weekStart: string; calories: number }

function MetricCard({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: '12px', padding: '24px' }}>
      <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-outfit)', fontSize: '22px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2, marginBottom: '20px' }}>{title}</p>
      {children}
    </div>
  )
}

function Rating({ value, onChange, minLabel, maxLabel }: { value: number; onChange: (v: number) => void; minLabel: string; maxLabel: string }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button" onClick={() => onChange(n)}
            style={{
              width: '52px', height: '52px', borderRadius: '8px', fontSize: '15px', fontWeight: 600,
              border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              background: value === n ? 'var(--primary)' : 'var(--inset)',
              color: value === n ? 'var(--on-primary)' : 'var(--muted)',
              boxShadow: value === n ? '0 0 16px rgba(0,212,106,0.30)' : 'none',
            }}>
            {n}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{minLabel}</span>
        <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{maxLabel}</span>
      </div>
    </div>
  )
}

export default function CheckinPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [planId, setPlanId] = useState('')
  const [adherence, setAdherence] = useState(0)
  const [energy, setEnergy] = useState(0)
  const [weight, setWeight] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/plans').then(r => r.json()).then(({ plans: p }) => {
      setPlans(p ?? [])
      if (p?.length) setPlanId(p[0].id)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!adherence || !energy || !weight) {
      setError('Completá las 3 métricas antes de continuar.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, planAdherence: adherence, energyLevel: energy, weightKg: parseFloat(weight), notes: notes || undefined }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Error')
      setSuccess(true)
      setTimeout(() => router.push('/'), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setSubmitting(false)
    }
  }

  if (success) return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '28px', color: 'var(--on-primary)', fontWeight: 700 }}>✓</span>
      </div>
      <h2 style={{ fontFamily: 'var(--font-outfit)', fontSize: '24px', fontWeight: 700, color: 'var(--text)' }}>Check-in guardado</h2>
      <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Tu próximo plan está siendo generado…</p>
    </div>
  )

  return (
    <div style={{ padding: '28px 32px', maxWidth: '900px' }}>

      {/* Header */}
      <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '40px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.1, marginBottom: '10px' }}>
        Check-in semanal
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--primary)', display: 'inline-block', flexShrink: 0 }} />
        3 preguntas rápidas para optimizar tu metabolismo
      </p>

      <form id="checkin-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Row 1 — Métrica 01 + 02 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <MetricCard label="Métrica 01" title="¿Qué tan bien seguiste el plan?">
            <Rating value={adherence} onChange={setAdherence} minLabel="Bajo" maxLabel="Perfecto" />
          </MetricCard>

          <MetricCard label="Métrica 02" title="¿Cómo estuvo tu energía?">
            <Rating value={energy} onChange={setEnergy} minLabel="Agotado" maxLabel="Explosivo" />
          </MetricCard>
        </div>

        {/* Row 2 — Métrica 03 (full width) */}
        <div style={{ background: 'var(--surface)', borderRadius: '12px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>Métrica 03</p>
            <p style={{ fontFamily: 'var(--font-outfit)', fontSize: '22px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2, marginBottom: '10px' }}>¿Cuánto pesás hoy?</p>
            <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.5 }}>Mantené la consistencia pesándote siempre en ayunas para mayor precisión analítica.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexShrink: 0 }}>
            <input type="number" step="0.1" min="30" max="300" required value={weight}
              onChange={e => setWeight(e.target.value)} placeholder="00.0"
              style={{ fontFamily: 'var(--font-outfit)', fontSize: '44px', fontWeight: 700, background: 'var(--inset)', border: 'none', borderRadius: '10px', padding: '16px 20px', color: weight ? 'var(--text)' : 'var(--muted)', outline: 'none', width: '160px', textAlign: 'center' }} />
            <span style={{ fontFamily: 'var(--font-outfit)', fontSize: '20px', color: 'var(--muted)', fontWeight: 400 }}>kg</span>
          </div>
        </div>

        {/* Row 3 — Observaciones */}
        <div style={{ background: 'var(--surface)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ color: 'var(--primary)', fontSize: '16px', lineHeight: 1 }}>≡</span>
            <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>Observaciones adicionales</p>
          </div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            placeholder="Escribí aquí cualquier detalle sobre tu digestión, sueño o sensaciones durante el entrenamiento..."
            style={{ width: '100%', background: 'var(--inset)', border: 'none', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: 'var(--text)', outline: 'none', resize: 'none', lineHeight: 1.6, boxSizing: 'border-box' }} />
        </div>

        {error && <p style={{ color: '#EF4444', fontSize: '13px' }}>{error}</p>}

      </form>
    </div>
  )
}
