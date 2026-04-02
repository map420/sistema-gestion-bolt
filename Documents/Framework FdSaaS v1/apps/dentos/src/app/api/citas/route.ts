import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSchema = z.object({
  paciente: z.string().min(1),
  telefono: z.string().min(1),
  dentistaId: z.string().min(1),
  fecha: z.string(),
  hora: z.string(),
  motivo: z.string().optional(),
})

async function getClinica(userId: string) {
  return prisma.clinica.findUnique({ where: { userId } })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clinica = await getClinica(user.id)
  if (!clinica) return NextResponse.json({ citas: [] })

  const citas = await prisma.cita.findMany({
    where: { clinicaId: clinica.id },
    include: { paciente: true, dentista: true },
    orderBy: { fecha: 'asc' },
  })

  return NextResponse.json({ citas })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const clinica = await getClinica(user.id)
  if (!clinica) return NextResponse.json({ error: 'Clinic not set up' }, { status: 404 })

  const { paciente: pacienteNombre, telefono, dentistaId, fecha, hora, motivo } = parsed.data

  // Find or create patient
  let paciente = await prisma.paciente.findFirst({
    where: { clinicaId: clinica.id, telefono },
  })
  if (!paciente) {
    paciente = await prisma.paciente.create({
      data: { nombre: pacienteNombre, telefono, clinicaId: clinica.id },
    })
  }

  const fechaHora = new Date(`${fecha}T${hora}:00`)
  const cita = await prisma.cita.create({
    data: {
      fecha: fechaHora,
      motivo: motivo ?? null,
      clinicaId: clinica.id,
      dentistaId,
      pacienteId: paciente.id,
      estado: 'PENDIENTE',
    },
    include: { paciente: true, dentista: true },
  })

  return NextResponse.json({ ok: true, cita }, { status: 201 })
}
