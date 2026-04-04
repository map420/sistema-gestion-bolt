import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, unauthorized } from "@/lib/auth"
import { z } from "zod"

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
})

export async function GET() {
  const { user, error } = await getAuthUser()
  if (error) return unauthorized()

  const objectives = await prisma.objective.findMany({
    where: { userId: user!.id, isActive: true },
    include: { keyResults: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(objectives)
}

export async function POST(req: NextRequest) {
  const { user, error } = await getAuthUser()
  if (error) return unauthorized()

  const profile = await prisma.profile.findUnique({ where: { userId: user!.id } })
  if (!profile?.isPro) {
    const count = await prisma.objective.count({ where: { userId: user!.id, isActive: true } })
    if (count >= 1) {
      return NextResponse.json(
        { error: "Free plan limit: 1 objective. Upgrade to Pro for unlimited." },
        { status: 403 }
      )
    }
  }

  const body = createSchema.parse(await req.json())
  const objective = await prisma.objective.create({
    data: {
      userId: user!.id,
      title: body.title,
      description: body.description,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    },
  })
  return NextResponse.json(objective, { status: 201 })
}
