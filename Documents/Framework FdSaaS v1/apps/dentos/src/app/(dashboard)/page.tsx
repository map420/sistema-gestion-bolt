import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import MetricCard from '@/components/dashboard/MetricCard'
import StatusBadge from '@/components/dashboard/StatusBadge'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clinica = await prisma.clinica.findUnique({ where: { userId: user.id } })
  if (!clinica) redirect('/onboarding')

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [citasHoy, confirmacionesHoy, noShowsEvitadosMes, pendientesConfirmar] = await Promise.all([
    prisma.cita.findMany({
      where: { clinicaId: clinica.id, fecha: { gte: startOfDay, lt: endOfDay } },
      include: { paciente: true, dentista: true },
      orderBy: { fecha: 'asc' },
    }),
    prisma.cita.count({
      where: { clinicaId: clinica.id, fecha: { gte: startOfDay, lt: endOfDay }, estado: 'CONFIRMADA' },
    }),
    prisma.cita.count({
      where: { clinicaId: clinica.id, fecha: { gte: startOfMonth }, estado: 'CONFIRMADA' },
    }),
    prisma.cita.count({
      where: { clinicaId: clinica.id, estado: 'PENDIENTE', fecha: { gte: now } },
    }),
  ])

  const TICKET_PROMEDIO = 40
  const revenueRecuperado = `$${noShowsEvitadosMes * TICKET_PROMEDIO}`

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#e2e2e2]">Dashboard</h1>
          <p className="text-sm text-[#8b90a0] mt-1">
            {now.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link
          href="/dashboard/agenda/nueva"
          className="px-5 py-2.5 bg-gradient-to-r from-[#3cd7ff] to-[#009ebe] text-[#003642] text-sm font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity"
        >
          + Nueva cita
        </Link>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-4 gap-px bg-[#1f1f1f] mb-8">
        <MetricCard
          label="Confirmaciones hoy"
          value={confirmacionesHoy}
          trend="up"
          accent="cyan"
          sublabel={`de ${citasHoy.length} citas`}
        />
        <MetricCard
          label="No-shows evitados este mes"
          value={noShowsEvitadosMes}
          trend="up"
          accent="green"
          sublabel="confirmadas"
        />
        <MetricCard
          label="Revenue recuperado"
          value={revenueRecuperado}
          trend="up"
          accent="green"
          sublabel="estimado este mes"
        />
        <MetricCard
          label="Pendientes de confirmar"
          value={pendientesConfirmar}
          trend="neutral"
          accent="muted"
          sublabel="requieren atención"
        />
      </div>

      {/* Citas de hoy */}
      <div className="bg-[#1b1b1b]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f1f1f]">
          <h2 className="text-sm font-semibold text-[#e2e2e2] uppercase tracking-widest">Citas de hoy</h2>
          <Link href="/dashboard/agenda" className="text-xs text-[#3cd7ff] hover:underline uppercase tracking-widest">
            Ver todas →
          </Link>
        </div>

        {citasHoy.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-[#8b90a0] text-sm">No hay citas para hoy.</p>
            <Link href="/dashboard/agenda/nueva" className="text-[#3cd7ff] text-sm hover:underline mt-2 inline-block">
              Agregar primera cita
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1f1f1f]">
                {['Paciente', 'Dentista', 'Hora', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs uppercase tracking-widest text-[#8b90a0]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {citasHoy.map((cita, i) => (
                <tr
                  key={cita.id}
                  className={`border-b border-[#1f1f1f] hover:bg-[#1f1f1f] transition-colors ${i === citasHoy.length - 1 ? 'border-0' : ''}`}
                >
                  <td className="px-6 py-4 text-sm text-[#e2e2e2]">{cita.paciente.nombre}</td>
                  <td className="px-6 py-4 text-sm text-[#8b90a0]">{cita.dentista.nombre}</td>
                  <td className="px-6 py-4 text-sm text-[#e2e2e2] font-mono">
                    {cita.fecha.toTimeString().slice(0, 5)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge estado={cita.estado as 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'RECORDATORIO_1' | 'RECORDATORIO_2' | 'NO_SHOW'} />
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/agenda?id=${cita.id}`} className="text-xs text-[#8b90a0] hover:text-[#3cd7ff] transition-colors uppercase tracking-widest">
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
