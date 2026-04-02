import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendWhatsAppMessage, buildReminder1, buildReminder2 } from '@/lib/whatsapp'

// Protect with a secret token — call via cron service (e.g. Vercel Cron, Upstash)
function isAuthorized(request: Request) {
  const token = request.headers.get('x-cron-secret')
  return token === process.env.CRON_SECRET || process.env.NODE_ENV === 'development'
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const results = { reminder1: 0, reminder2: 0, errors: 0 }

  // ── Reminder 1: citas en las próximas 24-26h que aún no recibieron WA1 ──
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const in26h = new Date(now.getTime() + 26 * 60 * 60 * 1000)

  const citasReminder1 = await prisma.cita.findMany({
    where: {
      fecha: { gte: in24h, lte: in26h },
      estado: 'PENDIENTE',
      wa1SentAt: null,
    },
    include: { paciente: true, dentista: true, clinica: true },
  })

  for (const cita of citasReminder1) {
    try {
      const msg = buildReminder1(
        cita.paciente.nombre,
        cita.dentista.nombre,
        cita.fecha,
        cita.clinica.nombre
      )
      const result = await sendWhatsAppMessage(cita.paciente.telefono, msg)
      if (result.success) {
        await prisma.cita.update({
          where: { id: cita.id },
          data: { estado: 'RECORDATORIO_1', wa1SentAt: now },
        })
        results.reminder1++
      } else {
        results.errors++
      }
    } catch {
      results.errors++
    }
  }

  // ── Reminder 2: citas en las próximas 2-4h que no confirmaron y no recibieron WA2 ──
  const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000)
  const in4h = new Date(now.getTime() + 4 * 60 * 60 * 1000)

  const citasReminder2 = await prisma.cita.findMany({
    where: {
      fecha: { gte: in2h, lte: in4h },
      estado: { in: ['PENDIENTE', 'RECORDATORIO_1'] },
      wa2SentAt: null,
    },
    include: { paciente: true, dentista: true, clinica: true },
  })

  for (const cita of citasReminder2) {
    try {
      const msg = buildReminder2(
        cita.paciente.nombre,
        cita.dentista.nombre,
        cita.fecha,
        cita.clinica.nombre
      )
      const result = await sendWhatsAppMessage(cita.paciente.telefono, msg)
      if (result.success) {
        await prisma.cita.update({
          where: { id: cita.id },
          data: { estado: 'RECORDATORIO_2', wa2SentAt: now },
        })
        results.reminder2++
      } else {
        results.errors++
      }
    } catch {
      results.errors++
    }
  }

  console.log(`[CRON] ${now.toISOString()} — R1: ${results.reminder1}, R2: ${results.reminder2}, Errors: ${results.errors}`)
  return NextResponse.json({ ok: true, ...results })
}
