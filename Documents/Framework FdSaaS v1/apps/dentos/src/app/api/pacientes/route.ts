import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clinica = await prisma.clinica.findUnique({ where: { userId: user.id } })
  if (!clinica) return NextResponse.json({ pacientes: [] })

  const pacientes = await prisma.paciente.findMany({
    where: { clinicaId: clinica.id },
    include: {
      citas: {
        select: { fecha: true, estado: true },
        orderBy: { fecha: 'desc' },
      },
    },
    orderBy: { nombre: 'asc' },
  })

  const result = pacientes.map(p => ({
    id: p.id,
    nombre: p.nombre,
    telefono: p.telefono,
    totalCitas: p.citas.length,
    ultimaCita: p.citas[0]?.fecha.toISOString().slice(0, 10) ?? null,
    noShows: p.citas.filter(c => c.estado === 'NO_SHOW').length,
  }))

  return NextResponse.json({ pacientes: result })
}
