import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, unauthorized } from "@/lib/auth"
import { z } from "zod"

const createSchema = z.object({
  objectiveId: z.string(),
  keyResultId: z.string().optional(),
  title: z.string().min(1),
  content: z.string(),
  source: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const { user, error } = await getAuthUser()
  if (error) return unauthorized()

  const { searchParams } = new URL(req.url)
  const objectiveId = searchParams.get("objectiveId")
  const krId = searchParams.get("krId")

  const notes = await prisma.note.findMany({
    where: {
      userId: user!.id,
      ...(objectiveId && { objectiveId }),
      ...(krId && { keyResultId: krId }),
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(notes)
}

export async function POST(req: NextRequest) {
  const { user, error } = await getAuthUser()
  if (error) return unauthorized()

  const profile = await prisma.profile.findUnique({ where: { userId: user!.id } })
  if (!profile?.isPro) {
    const count = await prisma.note.count({ where: { userId: user!.id } })
    if (count >= 20) {
      return NextResponse.json(
        { error: "Free plan limit: 20 notes. Upgrade to Pro for unlimited." },
        { status: 403 }
      )
    }
  }

  const body = createSchema.parse(await req.json())
  const note = await prisma.note.create({
    data: {
      userId: user!.id,
      objectiveId: body.objectiveId,
      keyResultId: body.keyResultId,
      title: body.title,
      content: body.content,
      source: body.source,
    },
  })
  return NextResponse.json(note, { status: 201 })
}
