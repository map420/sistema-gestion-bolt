'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Dentista = { id: string; nombre: string }

export default function NuevaCitaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dentistas, setDentistas] = useState<Dentista[]>([])

  const [paciente, setPaciente] = useState('')
  const [telefono, setTelefono] = useState('')
  const [dentistaId, setDentistaId] = useState('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [motivo, setMotivo] = useState('')

  useEffect(() => {
    fetch('/api/dentistas')
      .then(r => r.json())
      .then(d => {
        setDentistas(d.dentistas ?? [])
        if (d.dentistas?.length === 1) setDentistaId(d.dentistas[0].id)
      })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paciente, telefono, dentistaId, fecha, hora, motivo }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Error al crear cita')
      }

      router.push('/dashboard/agenda')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error. Intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/agenda" className="text-[#8b90a0] hover:text-[#e2e2e2] text-sm transition-colors">
          ← Agenda
        </Link>
        <h1 className="text-2xl font-bold text-[#e2e2e2]">Nueva cita</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#1b1b1b] p-8 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <Field label="Nombre del paciente" value={paciente} onChange={setPaciente} placeholder="María Rodríguez" required />
          <Field label="Teléfono (+51...)" value={telefono} onChange={setTelefono} placeholder="+51 987 654 321" required />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-[#8b90a0] mb-2">Dentista</label>
          <select
            required
            value={dentistaId}
            onChange={e => setDentistaId(e.target.value)}
            className="w-full bg-[#1f1f1f] text-[#e2e2e2] px-4 py-3 text-sm outline-none border-b border-transparent focus:border-b focus:border-[#3cd7ff] transition-colors"
          >
            <option value="" disabled>Seleccionar dentista</option>
            {dentistas.map(d => (
              <option key={d.id} value={d.id}>{d.nombre}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#8b90a0] mb-2">Fecha</label>
            <input
              type="date"
              required
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              className="w-full bg-[#1f1f1f] text-[#e2e2e2] px-4 py-3 text-sm outline-none border-b border-transparent focus:border-b focus:border-[#3cd7ff] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#8b90a0] mb-2">Hora</label>
            <input
              type="time"
              required
              value={hora}
              onChange={e => setHora(e.target.value)}
              className="w-full bg-[#1f1f1f] text-[#e2e2e2] px-4 py-3 text-sm outline-none border-b border-transparent focus:border-b focus:border-[#3cd7ff] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-[#8b90a0] mb-2">Motivo (opcional)</label>
          <input
            type="text"
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            placeholder="Limpieza, extracción, revisión..."
            className="w-full bg-[#1f1f1f] text-[#e2e2e2] px-4 py-3 text-sm outline-none border-b border-transparent focus:border-b focus:border-[#3cd7ff] transition-colors placeholder:text-[#414755]"
          />
        </div>

        {error && <p className="text-xs text-[#f87171]">{error}</p>}

        <p className="text-xs text-[#8b90a0]">
          DentOS enviará un recordatorio automático por WhatsApp 24h y 2h antes de la cita.
        </p>

        <div className="flex gap-4 pt-2">
          <Link
            href="/dashboard/agenda"
            className="flex-1 py-3 text-sm text-center border border-[#414755] text-[#8b90a0] hover:border-[#e2e2e2] hover:text-[#e2e2e2] transition-colors uppercase tracking-widest"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-[#3cd7ff] to-[#009ebe] text-[#003642] font-semibold py-3 text-sm uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar cita'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-[#8b90a0] mb-2">{label}</label>
      <input
        type="text"
        required={required}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#1f1f1f] text-[#e2e2e2] px-4 py-3 text-sm outline-none border-b border-transparent focus:border-b focus:border-[#3cd7ff] transition-colors placeholder:text-[#414755]"
      />
    </div>
  )
}
