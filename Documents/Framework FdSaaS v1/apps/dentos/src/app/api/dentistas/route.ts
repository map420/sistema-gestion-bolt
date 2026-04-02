import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clinica = await prisma.clinica.findUnique({ where: { userId: user.id } })
  if (!clinica) return NextResponse.json({ dentistas: [] })

  const dentistas = await prisma.dentista.findMany({
    where: { clinicaId: clinica.id },
    orderBy: { nombre: 'asc' },
  })

  return NextResponse.json({ dentistas })
}

const createSchema = z.object({ nombre: z.string().min(1) })

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clinica = await prisma.clinica.findUnique({ where: { userId: user.id } })
  if (!clinica) return NextResponse.json({ error: 'Clinic not set up' }, { status: 404 })

  // Plan limits
  const count = await prisma.dentista.count({ where: { clinicaId: clinica.id } })
  if (clinica.plan === 'STARTER' && count >= 1) {
    return NextResponse.json({ error: 'Plan limit: upgrade to Pro for up to 3 dentists' }, { status: 403 })
  }
  if (count >= 3) {
    return NextResponse.json({ error: 'Maximum 3 dentists reached' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const dentista = await prisma.dentista.create({
    data: { nombre: parsed.data.nombre, clinicaId: clinica.id },
  })

  return NextResponse.json({ dentista }, { status: 201 })
}
