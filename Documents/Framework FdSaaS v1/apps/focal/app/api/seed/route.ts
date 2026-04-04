import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, unauthorized } from "@/lib/auth"

export async function POST() {
  const { user, error } = await getAuthUser()
  if (error) return unauthorized()

  const userId = user!.id

  // Clean existing data for this user
  await prisma.weeklyReview.deleteMany({ where: { userId } })
  await prisma.note.deleteMany({ where: { userId } })
  await prisma.keyResult.deleteMany({ where: { userId } })
  await prisma.objective.deleteMany({ where: { userId } })

  // Ensure profile exists
  await prisma.profile.upsert({
    where: { userId },
    update: {},
    create: { userId, isPro: true },
  })

  const now = new Date()
  const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
  const qEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0)

  // Objective 1
  const obj1 = await prisma.objective.create({
    data: {
      userId,
      title: "Reach $5K MRR with Focal",
      description: "Launch and grow Focal to first paying customers",
      startDate: qStart,
      endDate: qEnd,
    },
  })

  const kr1 = await prisma.keyResult.create({
    data: { userId, objectiveId: obj1.id, title: "Paying customers", targetValue: 20, currentValue: 7, unit: " users" },
  })
  const kr2 = await prisma.keyResult.create({
    data: { userId, objectiveId: obj1.id, title: "Monthly Recurring Revenue", targetValue: 5000, currentValue: 840, unit: "$" },
  })
  await prisma.keyResult.create({
    data: { userId, objectiveId: obj1.id, title: "Weekly active users", targetValue: 50, currentValue: 18, unit: " WAU" },
  })

  await prisma.note.createMany({
    data: [
      { userId, objectiveId: obj1.id, keyResultId: kr1.id, title: "Distribution beats product in year 1", content: "Alex Hormozi: you can have the best product in the world but if nobody knows about it, you have nothing. Focus on getting the message out first.", source: "100M Offers", isDistilled: true },
      { userId, objectiveId: obj1.id, keyResultId: kr2.id, title: "Price anchoring — charge more than you think", content: "Users perceive higher prices as higher quality. $12/mo feels cheaper than $99/year even though it's more expensive annually.", source: "Idea", isDistilled: false },
      { userId, objectiveId: obj1.id, title: "Cold DM strategy that's working", content: "Sent 40 DMs to founders on Twitter mentioning OKRs. 8 replied, 3 booked demos, 1 converted. That's a 2.5% close rate from cold outreach.", source: "Experiment", isDistilled: true },
    ],
  })

  // Objective 2
  const obj2 = await prisma.objective.create({
    data: {
      userId,
      title: "Build the habit of weekly review",
      description: "Complete 12 weekly reviews in Q2 without missing",
      startDate: qStart,
      endDate: qEnd,
    },
  })

  const kr3 = await prisma.keyResult.create({
    data: { userId, objectiveId: obj2.id, title: "Weekly reviews completed", targetValue: 12, currentValue: 5, unit: "/12" },
  })
  await prisma.keyResult.create({
    data: { userId, objectiveId: obj2.id, title: "Notes distilled per week", targetValue: 5, currentValue: 3, unit: " avg" },
  })

  await prisma.note.createMany({
    data: [
      { userId, objectiveId: obj2.id, keyResultId: kr3.id, title: "Weekly review is the keystone habit", content: "Tiago Forte: the weekly review is the moment where capture becomes action. Without it, the system is just a pile of notes.", source: "Building a Second Brain", isDistilled: true },
      { userId, objectiveId: obj2.id, title: "Best time for review: Sunday 7pm", content: "Tried morning, tried Friday afternoon. Sunday evening before the week starts feels most natural. Already thinking about the upcoming week.", source: "Personal experiment", isDistilled: false },
    ],
  })

  // Objective 3 (low progress)
  const obj3 = await prisma.objective.create({
    data: {
      userId,
      title: "Launch content strategy on LinkedIn",
      description: "Establish thought leadership for Focal through consistent content",
      startDate: qStart,
      endDate: qEnd,
    },
  })

  await prisma.keyResult.create({
    data: { userId, objectiveId: obj3.id, title: "Posts published", targetValue: 24, currentValue: 4, unit: " posts" },
  })
  await prisma.keyResult.create({
    data: { userId, objectiveId: obj3.id, title: "Followers gained", targetValue: 500, currentValue: 67, unit: " followers" },
  })

  await prisma.note.create({
    data: { userId, objectiveId: obj3.id, title: "Hook formula that gets engagement", content: "The best LinkedIn hooks are contrarian statements that challenge conventional wisdom. 'You don't need a content calendar' performs 3x better than 'Here's my content calendar'.", source: "Justin Welsh newsletter", isDistilled: false },
  })

  // Weekly review
  const monday = new Date(now)
  const day = monday.getDay()
  monday.setDate(monday.getDate() - day + (day === 0 ? -6 : 1))
  monday.setHours(0, 0, 0, 0)

  await prisma.weeklyReview.create({
    data: {
      userId,
      weekStart: monday,
      capturedCount: 6,
      distilledNoteIds: [],
      progressUpdates: [
        { krId: kr1.id, from: 5, to: 7 },
        { krId: kr2.id, from: 600, to: 840 },
        { krId: kr3.id, from: 3, to: 5 },
      ],
      reflection: "Good week. Closed 2 new customers via DM. Content strategy is lagging — need to batch-write posts this weekend.",
    },
  })

  return NextResponse.json({ success: true, message: "Demo data created" })
}
