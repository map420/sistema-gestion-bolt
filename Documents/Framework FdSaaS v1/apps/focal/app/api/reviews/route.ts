import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, unauthorized } from "@/lib/auth"

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1))
  d.setHours(0, 0, 0, 0)
  return d
}

export async function GET() {
  const { user, error } = await getAuthUser()
  if (error) return unauthorized()

  const reviews = await prisma.weeklyReview.findMany({
    where: { userId: user!.id },
    orderBy: { weekStart: "desc" },
  })
  return NextResponse.json(reviews)
}

export async function POST(req: NextRequest) {
  const { user, error } = await getAuthUser()
  if (error) return unauthorized()

  const body = await req.json()
  const weekStart = getMondayOfWeek(new Date())

  const existing = await prisma.weeklyReview.findUnique({
    where: { userId_weekStart: { userId: user!.id, weekStart } },
  })
  if (existing) {
    return NextResponse.json({ error: "Review already exists for this week" }, { status: 409 })
  }

  const review = await prisma.weeklyReview.create({
    data: {
      userId: user!.id,
      weekStart,
      capturedCount: body.capturedCount ?? 0,
      distilledNoteIds: body.distilledNoteIds ?? [],
      progressUpdates: body.progressUpdates ?? [],
      reflection: body.reflection,
    },
  })
  return NextResponse.json(review, { status: 201 })
}
