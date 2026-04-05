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
      usersTotal,
      usersThisWeek,
      objectivesTotal,
      objectivesThisWeek,
      notesTotal,
      notesThisWeek,
    ] = await Promise.all([
      prisma.profile.count(),
      prisma.profile.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.objective.count(),
      prisma.objective.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.note.count(),
      prisma.note.count({ where: { createdAt: { gte: weekAgo } } }),
    ])

    return NextResponse.json({
      product: 'Focal',
      status: 'healthy',
      users: {
        total: usersTotal,
        newThisWeek: usersThisWeek,
      },
      records: [
        { label: 'Objetivos', total: objectivesTotal, thisWeek: objectivesThisWeek },
        { label: 'Notas', total: notesTotal, thisWeek: notesThisWeek },
      ],
      lastUpdated: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[metrics] error:', message)
    return NextResponse.json({
      product: 'Focal',
      status: 'degraded',
      error: message,
      users: { total: 0, newThisWeek: 0 },
      records: [],
      lastUpdated: new Date().toISOString(),
    }, { status: 200 })
  }
}
