import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, unauthorized } from "@/lib/auth"

export async function GET() {
  const { user, error } = await getAuthUser()
  if (error) return unauthorized()

  let profile = await prisma.profile.findUnique({ where: { userId: user!.id } })
  if (!profile) {
    profile = await prisma.profile.create({ data: { userId: user!.id } })
  }
  return NextResponse.json(profile)
}
