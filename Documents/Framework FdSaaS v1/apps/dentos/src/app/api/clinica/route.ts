import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clinica = await prisma.clinica.findUnique({ where: { userId: user.id } })
  if (!clinica) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ clinica })
}

const updateSchema = z.object({
  nombre: z.string().min(1).optional(),
  ciudad: z.string().min(1).optional(),
  telefono: z.string().min(1).optional(),
  whatsappNumero: z.string().optional(),
})

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const clinica = await prisma.clinica.update({
    where: { userId: user.id },
    data: parsed.data,
  })

  return NextResponse.json({ clinica })
}
