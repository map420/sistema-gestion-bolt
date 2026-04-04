import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, unauthorized } from "@/lib/auth"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await getAuthUser()
  if (error) return unauthorized()
  const { id } = await params

  const objective = await prisma.objective.findFirst({
    where: { id, userId: user!.id },
    include: {
      keyResults: { orderBy: { createdAt: "asc" } },
      notes: { orderBy: { createdAt: "desc" } },
    },
  })
  if (!objective) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(objective)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await getAuthUser()
  if (error) return unauthorized()
  const { id } = await params

  const body = await req.json()
  const objective = await prisma.objective.updateMany({
    where: { id, userId: user!.id },
    data: {
      ...(body.title && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.startDate && { startDate: new Date(body.startDate) }),
      ...(body.endDate && { endDate: new Date(body.endDate) }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  })
  return NextResponse.json(objective)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await getAuthUser()
  if (error) return unauthorized()
  const { id } = await params

  await prisma.objective.updateMany({
    where: { id, userId: user!.id },
    data: { isActive: false },
  })
  return NextResponse.json({ success: true })
}
