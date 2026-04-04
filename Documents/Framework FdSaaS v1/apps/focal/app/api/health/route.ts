import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const results: Record<string, string> = {}

  // Test Supabase auth
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    results.auth = user ? `authenticated as ${user.email}` : "no session"
  } catch (e: unknown) {
    results.auth = `error: ${e instanceof Error ? e.message : String(e)}`
  }

  // Test DB connection
  try {
    await prisma.profile.count()
    results.db = "connected"
  } catch (e: unknown) {
    results.db = `error: ${e instanceof Error ? e.message : String(e)}`
  }

  return NextResponse.json({ status: "ok", ...results })
}
