import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const key = request.headers.get('x-metrics-key')
  if (key !== process.env.METRICS_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const [
      clinicasTotal,
      clinicasThisWeek,
      citasTotal,
      citasThisWeek,
      pacientesTotal,
      pacientesThisWeek,
    ] = await Promise.all([
      prisma.clinica.count(),
      prisma.clinica.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.cita.count(),
      prisma.cita.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.paciente.count(),
      prisma.paciente.count({ where: { createdAt: { gte: weekAgo } } }),
    ])

    return NextResponse.json({
      product: 'DentOS',
      status: 'healthy',
      users: {
        total: clinicasTotal,
        newThisWeek: clinicasThisWeek,
      },
      records: [
        { label: 'Citas', total: citasTotal, thisWeek: citasThisWeek },
        { label: 'Pacientes', total: pacientesTotal, thisWeek: pacientesThisWeek },
      ],
      lastUpdated: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[metrics] error:', message)
    return NextResponse.json({
      product: 'DentOS',
      status: 'degraded',
      error: message,
      users: { total: 0, newThisWeek: 0 },
      records: [],
      lastUpdated: new Date().toISOString(),
    }, { status: 200 }) // 200 para que el hub muestre degraded en vez de fallar
  }
}
