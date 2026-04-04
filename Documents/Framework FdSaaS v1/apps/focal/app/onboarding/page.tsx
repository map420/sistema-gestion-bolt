"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function OnboardingPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const currentQuarter = (() => {
    const now = new Date()
    const q = Math.floor(now.getMonth() / 3)
    const year = now.getFullYear()
    const starts = [0, 3, 6, 9]
    const start = new Date(year, starts[q], 1)
    const end = new Date(year, starts[q] + 3, 0)
    return {
      label: `Q${q + 1} ${year}`,
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    }
  })()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch("/api/objectives", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        startDate: startDate || currentQuarter.start,
        endDate: endDate || currentQuarter.end,
      }),
    })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error)
      setSaving(false)
      return
    }
    router.push("/objectives")
  }

  return (
    <div className="min-h-screen bg-[#131313] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          <div className="h-1 flex-1 bg-[#22C55E] rounded-full" />
          <div className="h-1 flex-1 bg-[#2A2A2A] rounded-full" />
          <div className="h-1 flex-1 bg-[#2A2A2A] rounded-full" />
        </div>

        <p className="text-xs text-[#666666] mb-2">Step 1 of 3 — Your first Objective</p>
        <h1 className="font-headline text-2xl font-bold text-[#E5E2E1] mb-2">
          What's your main goal this quarter?
        </h1>
        <p className="text-sm text-[#666666] mb-8">Be specific. A great objective inspires and focuses.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Reach $5K MRR with Focal"
            required
            className="w-full bg-[#201F1F] border border-[#3D4A3D] text-[#E5E2E1] placeholder:text-[#666666] px-4 py-3 rounded text-base focus:border-[#4BE277] focus:outline-none"
          />

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-[#666666] mb-1.5">From</label>
              <input type="date" value={startDate || currentQuarter.start}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#201F1F] border border-[#3D4A3D] text-[#E5E2E1] px-3 py-2 rounded text-sm focus:border-[#4BE277] focus:outline-none" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-[#666666] mb-1.5">To</label>
              <input type="date" value={endDate || currentQuarter.end}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#201F1F] border border-[#3D4A3D] text-[#E5E2E1] px-3 py-2 rounded text-sm focus:border-[#4BE277] focus:outline-none" />
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button type="submit" disabled={saving}
            className="w-full bg-[#22C55E] text-[#0A1F0F] font-semibold py-3 rounded hover:bg-[#16A34A] disabled:opacity-50 transition-colors">
            {saving ? "Creating..." : "Continue →"}
          </button>

          <p className="text-xs text-[#666666] text-center">
            You can add more objectives after onboarding
          </p>
        </form>
      </div>
    </div>
  )
}
