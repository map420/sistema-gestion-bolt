import { NextResponse } from "next/server"
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

  const weekStart = getMondayOfWeek(new Date())
  const review = await prisma.weeklyReview.findUnique({
    where: { userId_weekStart: { userId: user!.id, weekStart } },
  })
  return NextResponse.json(review ?? null)
}
