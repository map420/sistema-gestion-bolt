import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, unauthorized } from "@/lib/auth"

export async function GET() {
  const { user, error } = await getAuthUser()
  if (error) return unauthorized()

  const today = new Date()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(today.getDate() - 7)

  const objectives = await prisma.objective.findMany({
    where: {
      userId: user!.id,
      isActive: true,
      startDate: { lte: today },
      endDate: { gte: today },
    },
    include: {
      keyResults: { orderBy: { createdAt: "asc" } },
      notes: {
        where: { createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const allRecentNotes = await prisma.note.findMany({
    where: {
      userId: user!.id,
      createdAt: { gte: sevenDaysAgo },
    },
    include: { objective: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  const totalKRs = objectives.reduce((sum, o) => sum + o.keyResults.length, 0)

  return NextResponse.json({
    objectives,
    recentNotes: allRecentNotes,
    stats: {
      objectiveCount: objectives.length,
      krCount: totalKRs,
      notesThisWeek: allRecentNotes.length,
    },
  })
}
