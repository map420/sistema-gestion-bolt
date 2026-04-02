import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  clinica: z.object({
    nombre: z.string().min(1),
    ciudad: z.string().min(1),
    telefono: z.string().min(1),
    whatsappNumero: z.string().optional(),
  }),
  cita: z.object({
    pacienteNombre: z.string().min(1),
    pacienteTelefono: z.string().min(1),
    fecha: z.string(),
    hora: z.string(),
  }).optional(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const { clinica: clinicaData, cita: citaData } = parsed.data

  // Check if clinic already exists for this user
  const existing = await prisma.clinica.findUnique({ where: { userId: user.id } })
  if (existing) {
    return NextResponse.json({ error: 'Clinic already set up' }, { status: 409 })
  }

  const clinica = await prisma.clinica.create({
    data: {
      userId: user.id,
      nombre: clinicaData.nombre,
      ciudad: clinicaData.ciudad,
      telefono: clinicaData.telefono,
      whatsappNumero: clinicaData.whatsappNumero,
      plan: 'TRIAL',
      planActivoHasta: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
    },
  })

  // Create default dentista using the user's name from metadata
  const dentistaNombre = (user.user_metadata?.nombre as string) ?? 'Dr. Principal'
  const dentista = await prisma.dentista.create({
    data: { nombre: dentistaNombre, clinicaId: clinica.id },
  })

  // Create first appointment if provided
  if (citaData) {
    const paciente = await prisma.paciente.create({
      data: {
        nombre: citaData.pacienteNombre,
        telefono: citaData.pacienteTelefono,
        clinicaId: clinica.id,
      },
    })

    const fechaHora = new Date(`${citaData.fecha}T${citaData.hora}:00`)
    await prisma.cita.create({
      data: {
        fecha: fechaHora,
        clinicaId: clinica.id,
        dentistaId: dentista.id,
        pacienteId: paciente.id,
        estado: 'PENDIENTE',
      },
    })
  }

  return NextResponse.json({ ok: true, clinicaId: clinica.id }, { status: 201 })
}
