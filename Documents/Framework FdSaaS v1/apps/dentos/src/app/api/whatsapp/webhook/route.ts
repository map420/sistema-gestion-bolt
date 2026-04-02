import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendWhatsAppMessage, buildCancellationAlert } from '@/lib/whatsapp'

// ── GET: verificación del webhook con Meta ──
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 })
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// ── POST: mensajes entrantes de pacientes ──
export async function POST(request: Request) {
  const body = await request.json()

  const entry = body?.entry?.[0]
  const change = entry?.changes?.[0]
  const value = change?.value

  if (!value?.messages?.length) {
    return NextResponse.json({ ok: true }) // ping de Meta, ignorar
  }

  const message = value.messages[0]
  const from = message.from // número del paciente (sin +)
  const text = message.text?.body?.trim().toUpperCase()

  if (!from || !text) return NextResponse.json({ ok: true })

  const isConfirm = ['SÍ', 'SI', 'S', 'YES', '1', 'CONFIRMO', 'CONFIRMAR'].includes(text)
  const isCancel = ['NO', 'N', 'CANCELAR', 'CANCELO', '0'].includes(text)

  if (!isConfirm && !isCancel) return NextResponse.json({ ok: true })

  // Buscar la cita más próxima de este paciente que esté pendiente de confirmación
  const paciente = await prisma.paciente.findFirst({
    where: { telefono: { contains: from.slice(-9) } }, // últimos 9 dígitos
  })

  if (!paciente) return NextResponse.json({ ok: true })

  const cita = await prisma.cita.findFirst({
    where: {
      pacienteId: paciente.id,
      estado: { in: ['PENDIENTE', 'RECORDATORIO_1', 'RECORDATORIO_2'] },
      fecha: { gte: new Date() },
    },
    include: { clinica: true, dentista: true },
    orderBy: { fecha: 'asc' },
  })

  if (!cita) return NextResponse.json({ ok: true })

  if (isConfirm) {
    await prisma.cita.update({
      where: { id: cita.id },
      data: { estado: 'CONFIRMADA' },
    })
    await sendWhatsAppMessage(
      from,
      `✅ ¡Confirmado! Te esperamos el ${cita.fecha.toLocaleDateString('es-PE')} a las ${cita.fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })} con ${cita.dentista.nombre} en ${cita.clinica.nombre}.`
    )
  }

  if (isCancel) {
    const hora = cita.fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    await prisma.cita.update({
      where: { id: cita.id },
      data: { estado: 'CANCELADA' },
    })
    await sendWhatsAppMessage(
      from,
      `Entendido, hemos cancelado tu cita de las ${hora}. Si deseas reagendar, llámanos.`
    )
    // Notificar a la clínica si tiene WhatsApp configurado
    if (cita.clinica.whatsappNumero) {
      await sendWhatsAppMessage(
        cita.clinica.whatsappNumero,
        buildCancellationAlert(paciente.nombre, hora)
      )
    }
  }

  return NextResponse.json({ ok: true })
}
