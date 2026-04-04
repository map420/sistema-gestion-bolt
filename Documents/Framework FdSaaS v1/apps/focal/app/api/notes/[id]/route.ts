import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, unauthorized } from "@/lib/auth"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await getAuthUser()
  if (error) return unauthorized()
  const { id } = await params

  const body = await req.json()
  await prisma.note.updateMany({
    where: { id, userId: user!.id },
    data: {
      ...(body.title && { title: body.title }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.source !== undefined && { source: body.source }),
      ...(body.isDistilled !== undefined && { isDistilled: body.isDistilled }),
    },
  })
  const note = await prisma.note.findUnique({ where: { id } })
  return NextResponse.json(note)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await getAuthUser()
  if (error) return unauthorized()
  const { id } = await params

  await prisma.note.deleteMany({ where: { id, userId: user!.id } })
  return NextResponse.json({ success: true })
}
