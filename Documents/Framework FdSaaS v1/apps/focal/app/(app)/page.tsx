"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

type KR = { id: string; title: string; currentValue: number; targetValue: number; unit: string }
type Note = { id: string; title: string; createdAt: string; objective: { title: string } }
type Objective = { id: string; title: string; keyResults: KR[]; notes: Note[] }
type DashboardData = {
  objectives: Objective[]
  recentNotes: Note[]
  stats: { objectiveCount: number; krCount: number; notesThisWeek: number }
}

const ACCENT_COLORS = ["#4BE277", "#2DD4BF", "#60A5FA"]

function krProgress(kr: KR) {
  return Math.min(100, Math.round((kr.currentValue / kr.targetValue) * 100))
}

function objProgress(objective: Objective) {
  if (!objective.keyResults.length) return 0
  const avg = objective.keyResults.reduce((s, kr) => s + krProgress(kr), 0) / objective.keyResults.length
  return Math.round(avg)
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const quarter = (() => {
    const m = new Date().getMonth()
    return `Q${Math.floor(m / 3) + 1} ${new Date().getFullYear()}`
  })()

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <span className="text-[#666666] text-sm">Loading...</span>
    </div>
  )

  return (
    <div className="flex h-full">
      {/* Main */}
      <div className="flex-1 px-6 py-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-headline text-2xl font-bold text-[#E5E2E1]">This Quarter</h1>
            <p className="text-sm text-[#666666] mt-0.5">
              {data?.stats.objectiveCount ?? 0} objectives · {data?.stats.krCount ?? 0} key results
            </p>
          </div>
          <span className="bg-[#22C55E]/10 text-[#4BE277] text-xs font-medium px-3 py-1 rounded-xl border border-[#22C55E]/20">
            {quarter}
          </span>
        </div>

        {/* Objectives */}
        {!data?.objectives.length ? (
          <div className="bg-[#201F1F] border border-[#3D4A3D] rounded p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-[#3D4A3D] block mb-3">flag</span>
            <p className="text-[#666666] text-sm mb-4">No active objectives for this quarter.</p>
            <Link
              href="/objectives"
              className="inline-flex items-center gap-2 bg-[#22C55E] text-[#0A1F0F] text-sm font-semibold px-4 py-2 rounded hover:bg-[#16A34A] transition-colors"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Create your first objective
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {data.objectives.map((obj, i) => {
              const progress = objProgress(obj)
              const color = ACCENT_COLORS[i % ACCENT_COLORS.length]
              return (
                <Link key={obj.id} href={`/objectives/${obj.id}`}>
                  <div className="bg-[#201F1F] border border-[#3D4A3D] rounded p-4 border-l-4 hover:bg-[#2A2A2A] transition-colors cursor-pointer" style={{ borderLeftColor: color }}>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h2 className="font-headline text-base font-bold text-[#E5E2E1]">{obj.title}</h2>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-[#BCCBB9] bg-[#2A2A2A] px-2 py-0.5 rounded-xl">
                          {obj.notes.length} notes
                        </span>
                        <span className="text-sm font-semibold" style={{ color }}>{progress}%</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 bg-[#2A2A2A] rounded-full mb-3">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${progress}%`, backgroundColor: color }}
                      />
                    </div>

                    {/* KRs */}
                    {obj.keyResults.slice(0, 3).map((kr) => (
                      <div key={kr.id} className="flex items-center gap-3 py-1.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-[#BCCBB9] truncate">{kr.title}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="w-16 h-1 bg-[#2A2A2A] rounded-full">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${krProgress(kr)}%`, backgroundColor: color }}
                            />
                          </div>
                          <span className="text-xs text-[#666666]">
                            {kr.currentValue}/{kr.targetValue}{kr.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Right panel — desktop only */}
      <aside className="hidden md:flex w-[280px] shrink-0 border-l border-[#3D4A3D] flex-col p-4">
        <h3 className="text-xs font-semibold text-[#BCCBB9] uppercase tracking-wider mb-4">
          Captured this week
        </h3>
        {!data?.recentNotes.length ? (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-3xl text-[#3D4A3D] block mb-2">note</span>
            <p className="text-xs text-[#666666]">No notes captured yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {data.recentNotes.map((note, i) => (
              <div key={note.id} className="flex items-start gap-2.5 py-2">
                <div
                  className="w-2 h-2 rounded-full mt-1 shrink-0"
                  style={{ backgroundColor: ACCENT_COLORS[i % ACCENT_COLORS.length] }}
                />
                <div className="min-w-0">
                  <p className="text-xs text-[#E5E2E1] truncate">{note.title}</p>
                  <p className="text-[10px] text-[#666666] mt-0.5 truncate">{note.objective?.title}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-[#3D4A3D]">
          <Link
            href="/capture"
            className="flex items-center justify-center gap-2 w-full bg-[#22C55E] text-[#0A1F0F] text-sm font-semibold py-2 rounded hover:bg-[#16A34A] transition-colors"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Capture note
          </Link>
        </div>
      </aside>
    </div>
  )
}
