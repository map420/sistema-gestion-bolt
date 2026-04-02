import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clinica = await prisma.clinica.findUnique({ where: { userId: user.id } })
  if (!clinica) return NextResponse.json({ error: 'Clinic not set up' }, { status: 404 })

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [citasHoy, confirmacionesHoy, noShowsEvitadosMes, canceladasMes, pendientesConfirmar] =
    await Promise.all([
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
        where: { clinicaId: clinica.id, fecha: { gte: startOfMonth }, estado: 'CANCELADA' },
      }),
      prisma.cita.count({
        where: { clinicaId: clinica.id, estado: 'PENDIENTE', fecha: { gte: now } },
      }),
    ])

  // Revenue recuperado estimado: $40 por cita confirmada (promedio clínica Perú)
  const TICKET_PROMEDIO = 40
  const revenueRecuperado = noShowsEvitadosMes * TICKET_PROMEDIO

  return NextResponse.json({
    metrics: {
      confirmacionesHoy,
      noShowsEvitados: noShowsEvitadosMes,
      revenueRecuperado: `$${revenueRecuperado}`,
      citasPendientes: pendientesConfirmar,
      canceladasMes,
    },
    citasHoy: citasHoy.map(c => ({
      id: c.id,
      paciente: c.paciente.nombre,
      telefono: c.paciente.telefono,
      dentista: c.dentista.nombre,
      hora: c.fecha.toTimeString().slice(0, 5),
      estado: c.estado,
      waSent: !!(c.wa1SentAt || c.wa2SentAt),
    })),
  })
}
