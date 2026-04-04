"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

type KR = { id: string; title: string; currentValue: number; targetValue: number; unit: string }
type Objective = { id: string; title: string; startDate: string; endDate: string; keyResults: KR[]; isActive: boolean }

const ACCENT_COLORS = ["#4BE277", "#2DD4BF", "#60A5FA"]

function objProgress(obj: Objective) {
  if (!obj.keyResults.length) return 0
  const avg = obj.keyResults.reduce((s, kr) => s + Math.min(100, (kr.currentValue / kr.targetValue) * 100), 0) / obj.keyResults.length
  return Math.round(avg)
}

function formatRange(start: string, end: string) {
  const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" })
  return `${fmt(start)} — ${fmt(end)}`
}

export default function ObjectivesPage() {
  const [objectives, setObjectives] = useState<Objective[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => { loadObjectives() }, [])

  async function loadObjectives() {
    const res = await fetch("/api/objectives")
    const data = await res.json()
    setObjectives(data)
    setLoading(false)
  }

  async function createObjective(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    const res = await fetch("/api/objectives", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, startDate, endDate }),
    })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error)
      setSaving(false)
      return
    }
    setShowForm(false)
    setTitle(""); setStartDate(""); setEndDate("")
    loadObjectives()
    setSaving(false)
  }

  async function archiveObjective(id: string) {
    await fetch(`/api/objectives/${id}`, { method: "DELETE" })
    loadObjectives()
  }

  return (
    <div className="px-4 md:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-headline text-2xl font-bold text-[#E5E2E1]">Objectives</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#22C55E] text-[#0A1F0F] text-sm font-semibold px-3 py-1.5 rounded hover:bg-[#16A34A] transition-colors"
        >
          <span className="material-symbols-outlined text-base">add</span>
          New Objective
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={createObjective} className="bg-[#201F1F] border border-[#3D4A3D] rounded p-4 mb-6 flex flex-col gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Reach $5K MRR with Focal"
            required
            className="w-full bg-[#2A2A2A] border border-[#3D4A3D] text-[#E5E2E1] placeholder:text-[#666666] px-3 py-2 rounded text-sm focus:border-[#4BE277] focus:outline-none"
          />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-[#666666] mb-1">Start date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required
                className="w-full bg-[#2A2A2A] border border-[#3D4A3D] text-[#E5E2E1] px-3 py-2 rounded text-sm focus:border-[#4BE277] focus:outline-none" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-[#666666] mb-1">End date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required
                className="w-full bg-[#2A2A2A] border border-[#3D4A3D] text-[#E5E2E1] px-3 py-2 rounded text-sm focus:border-[#4BE277] focus:outline-none" />
            </div>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-sm text-[#BCCBB9] border border-[#3D4A3D] rounded hover:bg-[#2A2A2A] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-1.5 text-sm bg-[#22C55E] text-[#0A1F0F] font-semibold rounded hover:bg-[#16A34A] disabled:opacity-50 transition-colors">
              {saving ? "Creating..." : "Create →"}
            </button>
          </div>
        </form>
      )}

      {/* Grid */}
      {loading ? (
        <p className="text-sm text-[#666666]">Loading...</p>
      ) : !objectives.length ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-4xl text-[#3D4A3D] block mb-3">flag</span>
          <p className="text-[#666666] text-sm">No objectives yet. Create your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {objectives.map((obj, i) => {
            const progress = objProgress(obj)
            const color = ACCENT_COLORS[i % ACCENT_COLORS.length]
            return (
              <div key={obj.id} className="bg-[#201F1F] border border-[#3D4A3D] rounded border-l-4 p-4 hover:bg-[#2A2A2A] transition-colors group"
                style={{ borderLeftColor: color }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Link href={`/objectives/${obj.id}`} className="flex-1">
                    <h2 className="font-headline text-base font-bold text-[#E5E2E1] group-hover:text-white">{obj.title}</h2>
                  </Link>
                  <button onClick={() => archiveObjective(obj.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    title="Archive">
                    <span className="material-symbols-outlined text-base text-[#666666] hover:text-red-400">archive</span>
                  </button>
                </div>
                <p className="text-xs text-[#666666] mb-3">{formatRange(obj.startDate, obj.endDate)}</p>

                {/* Progress ring (simple bar) */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-1.5 bg-[#2A2A2A] rounded-full">
                    <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: color }} />
                  </div>
                  <span className="text-sm font-semibold shrink-0" style={{ color }}>{progress}%</span>
                </div>

                <p className="text-xs text-[#666666]">{obj.keyResults.length} key results</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
