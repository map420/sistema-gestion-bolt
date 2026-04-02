'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import StatusBadge from '@/components/dashboard/StatusBadge'

type Filtro = 'hoy' | 'semana' | 'todas'

type Cita = {
  id: string
  paciente: { nombre: string; telefono: string }
  dentista: { nombre: string }
  fecha: string
  estado: string
  wa1SentAt: string | null
  wa2SentAt: string | null
}

export default function AgendaPage() {
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<Filtro>('todas')

  useEffect(() => {
    fetch('/api/citas')
      .then(r => r.json())
      .then(d => { setCitas(d.citas ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
    const endOfWeek = new Date(startOfDay.getTime() + 7 * 24 * 60 * 60 * 1000)

    return citas.filter(c => {
      const fecha = new Date(c.fecha)
      if (filtro === 'hoy') return fecha >= startOfDay && fecha < endOfDay
      if (filtro === 'semana') return fecha >= startOfDay && fecha < endOfWeek
      return true
    })
  }, [citas, filtro])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#e2e2e2]">Agenda</h1>
        <Link
          href="/dashboard/agenda/nueva"
          className="px-5 py-2.5 bg-gradient-to-r from-[#3cd7ff] to-[#009ebe] text-[#003642] text-sm font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity"
        >
          + Nueva cita
        </Link>
      </div>

      <div className="flex gap-0 mb-6 border-b border-[#1f1f1f]">
        {(['hoy', 'semana', 'todas'] as Filtro[]).map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-6 py-3 text-xs uppercase tracking-widest transition-colors ${
              filtro === f
                ? 'text-[#3cd7ff] border-b-2 border-[#3cd7ff]'
                : 'text-[#8b90a0] hover:text-[#e2e2e2]'
            }`}
          >
            {f === 'hoy' ? 'Hoy' : f === 'semana' ? 'Esta semana' : 'Todas'}
          </button>
        ))}
      </div>

      <div className="bg-[#1b1b1b]">
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-[#8b90a0]">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-[#8b90a0]">No hay citas para este período.</p>
            <Link href="/dashboard/agenda/nueva" className="text-[#3cd7ff] text-sm hover:underline mt-2 inline-block">
              Agregar cita
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1f1f1f]">
                {['Paciente', 'Dentista', 'Fecha', 'Hora', 'Estado', 'WhatsApp', 'Acciones'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs uppercase tracking-widest text-[#8b90a0]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((cita, i) => {
                const fecha = new Date(cita.fecha)
                const waSent = !!(cita.wa1SentAt || cita.wa2SentAt)
                return (
                  <tr
                    key={cita.id}
                    className={`border-b border-[#1f1f1f] hover:bg-[#1f1f1f] transition-colors ${i === filtered.length - 1 ? 'border-0' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#e2e2e2]">{cita.paciente.nombre}</div>
                      <div className="text-xs text-[#8b90a0]">{cita.paciente.telefono}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#8b90a0]">{cita.dentista.nombre}</td>
                    <td className="px-6 py-4 text-sm text-[#e2e2e2]">{fecha.toISOString().slice(0, 10)}</td>
                    <td className="px-6 py-4 text-sm text-[#e2e2e2] font-mono">
                      {fecha.toTimeString().slice(0, 5)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge estado={cita.estado as Parameters<typeof StatusBadge>[0]['estado']} />
                    </td>
                    <td className="px-6 py-4">
                      {waSent ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-[#3de273] rounded-full" />
                          <span className="text-xs text-[#3de273]">Enviado</span>
                        </span>
                      ) : (
                        <span className="text-xs text-[#414755]">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-xs text-[#8b90a0] hover:text-[#f87171] transition-colors uppercase tracking-widest">
                        Cancelar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <p className="mt-4 text-xs text-[#8b90a0]">{filtered.length} cita{filtered.length !== 1 ? 's' : ''}</p>
      )}
    </div>
  )
}
