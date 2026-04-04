"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [seeding, setSeeding] = useState(false)
  const [seedDone, setSeedDone] = useState(false)
  const [seedError, setSeedError] = useState("")

  async function handleSeed() {
    setSeeding(true)
    setSeedError("")
    setSeedDone(false)
    const res = await fetch("/api/seed", { method: "POST" })
    if (res.ok) {
      setSeedDone(true)
      setTimeout(() => router.push("/"), 1200)
    } else {
      const d = await res.json()
      setSeedError(d.error ?? "Error creating demo data")
    }
    setSeeding(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="px-4 md:px-6 py-6 max-w-lg">
      <h1 className="font-headline text-2xl font-bold text-[#E5E2E1] mb-6">Settings</h1>

      {/* Demo data */}
      <div className="bg-[#201F1F] border border-[#3D4A3D] rounded p-5 mb-4">
        <div className="flex items-start gap-3 mb-4">
          <span className="material-symbols-outlined text-xl text-[#4BE277] mt-0.5">science</span>
          <div>
            <h2 className="text-sm font-semibold text-[#E5E2E1] mb-1">Load demo data</h2>
            <p className="text-xs text-[#666666]">
              Creates 3 objectives, 7 key results, 7 notes and a weekly review so you can explore the app. Replaces any existing data.
            </p>
          </div>
        </div>

        {seedDone && (
          <div className="flex items-center gap-2 text-xs text-[#4BE277] bg-[#4BE277]/10 border border-[#4BE277]/20 rounded px-3 py-2 mb-3">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Demo data created — redirecting to dashboard...
          </div>
        )}
        {seedError && (
          <p className="text-xs text-red-400 mb-3">{seedError}</p>
        )}

        <button
          onClick={handleSeed}
          disabled={seeding || seedDone}
          className="flex items-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-50 text-[#0A1F0F] text-sm font-semibold px-4 py-2 rounded transition-colors"
        >
          <span className="material-symbols-outlined text-base">
            {seeding ? "hourglass_empty" : "play_arrow"}
          </span>
          {seeding ? "Creating..." : "Load demo data"}
        </button>
      </div>

      {/* Account */}
      <div className="bg-[#201F1F] border border-[#3D4A3D] rounded p-5">
        <div className="flex items-start gap-3 mb-4">
          <span className="material-symbols-outlined text-xl text-[#666666] mt-0.5">account_circle</span>
          <div>
            <h2 className="text-sm font-semibold text-[#E5E2E1] mb-1">Account</h2>
            <p className="text-xs text-[#666666]">Sign out of your account.</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 border border-[#3D4A3D] hover:bg-[#2A2A2A] text-[#BCCBB9] text-sm px-4 py-2 rounded transition-colors"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          Sign out
        </button>
      </div>
    </div>
  )
}
