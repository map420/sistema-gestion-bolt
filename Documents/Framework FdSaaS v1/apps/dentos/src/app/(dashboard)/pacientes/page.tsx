'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'

type Paciente = {
  id: string
  nombre: string
  telefono: string
  totalCitas: number
  ultimaCita: string | null
  noShows: number
}

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/pacientes')
      .then(r => r.json())
      .then(d => { setPacientes(d.pacientes ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() =>
    pacientes.filter(p =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.telefono.includes(search)
    ), [pacientes, search])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#e2e2e2]">Pacientes</h1>
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o teléfono..."
          className="bg-[#1b1b1b] text-[#e2e2e2] px-4 py-2.5 text-sm outline-none border border-[#414755] focus:border-[#3cd7ff] transition-colors placeholder:text-[#414755] w-72"
        />
      </div>

      <div className="bg-[#1b1b1b]">
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-[#8b90a0]">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-[#8b90a0]">
              {search ? 'No se encontraron pacientes.' : 'Aún no hay pacientes registrados.'}
            </p>
            {!search && (
              <Link href="/dashboard/agenda/nueva" className="text-[#3cd7ff] text-sm hover:underline mt-2 inline-block">
                Crear primera cita
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1f1f1f]">
                {['Paciente', 'Teléfono', 'Total citas', 'Última cita', 'No-shows', 'Acciones'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs uppercase tracking-widest text-[#8b90a0]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr
                  key={p.id}
                  className={`border-b border-[#1f1f1f] hover:bg-[#1f1f1f] transition-colors ${i === filtered.length - 1 ? 'border-0' : ''}`}
                >
                  <td className="px-6 py-4 text-sm text-[#e2e2e2] font-medium">{p.nombre}</td>
                  <td className="px-6 py-4 text-sm text-[#8b90a0] font-mono">{p.telefono}</td>
                  <td className="px-6 py-4 text-sm text-[#e2e2e2]">{p.totalCitas}</td>
                  <td className="px-6 py-4 text-sm text-[#8b90a0]">{p.ultimaCita ?? '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${p.noShows > 0 ? 'text-[#f87171]' : 'text-[#3de273]'}`}>
                      {p.noShows}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/agenda/nueva?paciente=${encodeURIComponent(p.nombre)}&telefono=${encodeURIComponent(p.telefono)}`}
                      className="text-xs text-[#8b90a0] hover:text-[#3cd7ff] transition-colors uppercase tracking-widest"
                    >
                      Nueva cita
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <p className="mt-4 text-xs text-[#8b90a0]">{filtered.length} paciente{filtered.length !== 1 ? 's' : ''}</p>
      )}
    </div>
  )
}
