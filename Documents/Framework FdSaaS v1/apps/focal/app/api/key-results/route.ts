import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, unauthorized } from "@/lib/auth"
import { z } from "zod"

const createSchema = z.object({
  objectiveId: z.string(),
  title: z.string().min(1),
  targetValue: z.number().optional(),
  unit: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const { user, error } = await getAuthUser()
  if (error) return unauthorized()

  const profile = await prisma.profile.findUnique({ where: { userId: user!.id } })
  const body = createSchema.parse(await req.json())

  if (!profile?.isPro) {
    const count = await prisma.keyResult.count({ where: { objectiveId: body.objectiveId, userId: user!.id } })
    if (count >= 2) {
      return NextResponse.json(
        { error: "Free plan limit: 2 key results per objective. Upgrade to Pro." },
        { status: 403 }
      )
    }
  }

  const kr = await prisma.keyResult.create({
    data: {
      userId: user!.id,
      objectiveId: body.objectiveId,
      title: body.title,
      targetValue: body.targetValue ?? 100,
      unit: body.unit ?? "%",
    },
  })
  return NextResponse.json(kr, { status: 201 })
}
