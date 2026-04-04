import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, unauthorized } from "@/lib/auth"

export async function GET() {
  const { user, error } = await getAuthUser()
  if (error) return unauthorized()

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const objectives = await prisma.objective.findMany({
    where: { userId: user!.id, isActive: true },
    include: {
      notes: {
        where: { createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  return NextResponse.json(objectives)
}
