import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, unauthorized } from "@/lib/auth"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await getAuthUser()
  if (error) return unauthorized()
  const { id } = await params

  const body = await req.json()
  const kr = await prisma.keyResult.updateMany({
    where: { id, userId: user!.id },
    data: {
      ...(body.title && { title: body.title }),
      ...(body.currentValue !== undefined && { currentValue: body.currentValue }),
      ...(body.targetValue !== undefined && { targetValue: body.targetValue }),
      ...(body.unit && { unit: body.unit }),
    },
  })
  return NextResponse.json(kr)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await getAuthUser()
  if (error) return unauthorized()
  const { id } = await params

  await prisma.keyResult.deleteMany({ where: { id, userId: user!.id } })
  return NextResponse.json({ success: true })
}
