"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Note = { id: string; title: string; content: string; isDistilled: boolean }
type KR = { id: string; title: string; currentValue: number; targetValue: number; unit: string }
type Objective = { id: string; title: string; keyResults: KR[] }

export default function ReviewPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [notes, setNotes] = useState<Note[]>([])
  const [objectives, setObjectives] = useState<Objective[]>([])
  const [distilled, setDistilled] = useState<Set<string>>(new Set())
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [reflection, setReflection] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alreadyDone, setAlreadyDone] = useState(false)

  useEffect(() => {
    async function load() {
      const [currentRes, inboxRes, objRes] = await Promise.all([
        fetch("/api/reviews/current"),
        fetch("/api/inbox"),
        fetch("/api/objectives"),
      ])
      const current = await currentRes.json()
      if (current) { setAlreadyDone(true); setLoading(false); return }

      const groups = await inboxRes.json()
      const allNotes = groups.flatMap((g: { notes: Note[] }) => g.notes)
      setNotes(allNotes)

      const objs = await objRes.json()
      setObjectives(objs)

      const prog: Record<string, number> = {}
      objs.forEach((o: Objective) => o.keyResults.forEach((kr) => { prog[kr.id] = kr.currentValue }))
      setProgress(prog)

      setLoading(false)
    }
    load()
  }, [])

  async function completeReview() {
    setSaving(true)

    // Update KR progress
    await Promise.all(
      objectives.flatMap((o) =>
        o.keyResults.map((kr) =>
          progress[kr.id] !== kr.currentValue
            ? fetch(`/api/key-results/${kr.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentValue: progress[kr.id] }),
              })
            : Promise.resolve()
        )
      )
    )

    // Mark distilled notes
    await Promise.all(
      Array.from(distilled).map((id) =>
        fetch(`/api/notes/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isDistilled: true }),
        })
      )
    )

    // Save review
    const progressUpdates = objectives.flatMap((o) =>
      o.keyResults.map((kr) => ({ krId: kr.id, from: kr.currentValue, to: progress[kr.id] ?? kr.currentValue }))
    )
    await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        capturedCount: notes.length,
        distilledNoteIds: Array.from(distilled),
        progressUpdates,
        reflection,
      }),
    })
    router.push("/")
  }

  const weekLabel = (() => {
    const now = new Date()
    const mon = new Date(now)
    const day = mon.getDay()
    mon.setDate(mon.getDate() - day + (day === 0 ? -6 : 1))
    const sun = new Date(mon)
    sun.setDate(sun.getDate() + 6)
    const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    return `${fmt(mon)} — ${fmt(sun)}`
  })()

  if (loading) return <div className="flex items-center justify-center h-full"><span className="text-[#666666] text-sm">Loading...</span></div>

  if (alreadyDone) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <span className="material-symbols-outlined text-5xl text-[#4BE277] block mb-4">check_circle</span>
        <h2 className="font-headline text-xl font-bold text-[#E5E2E1] mb-2">Review completed this week</h2>
        <p className="text-sm text-[#666666] mb-6">Come back next Monday.</p>
        <button onClick={() => router.push("/")} className="bg-[#22C55E] text-[#0A1F0F] text-sm font-semibold px-4 py-2 rounded hover:bg-[#16A34A]">Back to Dashboard</button>
      </div>
    </div>
  )

  return (
    <div className="px-4 md:px-6 py-6 max-w-2xl">
      {/* Progress bar */}
      <div className="h-1 bg-[#2A2A2A] rounded-full mb-6">
        <div className="h-full bg-[#4BE277] rounded-full transition-all" style={{ width: `${(step / 3) * 100}%` }} />
      </div>

      <p className="text-xs text-[#666666] mb-1">Step {step} of 3</p>

      {/* Step 1 */}
      {step === 1 && (
        <div>
          <h1 className="font-headline text-2xl font-bold text-[#E5E2E1] mb-1">What did you capture?</h1>
          <p className="text-sm text-[#666666] mb-6">Week of {weekLabel} · {notes.length} notes captured · {distilled.size} distilled</p>

          {notes.length === 0 ? (
            <p className="text-sm text-[#666666] py-8 text-center">No notes captured this week.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {notes.map((note) => (
                <div key={note.id}
                  onClick={() => setDistilled((prev) => { const s = new Set(prev); s.has(note.id) ? s.delete(note.id) : s.add(note.id); return s })}
                  className={`bg-[#201F1F] border rounded p-3 cursor-pointer transition-colors ${distilled.has(note.id) ? "border-[#4BE277]" : "border-[#3D4A3D] hover:border-[#666666]"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-[#E5E2E1]">{note.title}</p>
                    <span className={`material-symbols-outlined text-base shrink-0 ${distilled.has(note.id) ? "text-[#4BE277]" : "text-[#666666]"}`}>
                      {distilled.has(note.id) ? "star" : "star_border"}
                    </span>
                  </div>
                  <p className="text-xs text-[#666666] mt-1 line-clamp-2">{note.content}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <button onClick={() => setStep(2)} className="bg-[#22C55E] text-[#0A1F0F] text-sm font-semibold px-4 py-2 rounded hover:bg-[#16A34A]">Continue →</button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div>
          <h1 className="font-headline text-2xl font-bold text-[#E5E2E1] mb-1">How did you advance?</h1>
          <p className="text-sm text-[#666666] mb-6">Update your key results progress.</p>

          {objectives.flatMap((o) => o.keyResults).length === 0 ? (
            <p className="text-sm text-[#666666] py-8 text-center">No key results found.</p>
          ) : (
            <div className="flex flex-col gap-3 mb-6">
              {objectives.map((obj) =>
                obj.keyResults.map((kr) => {
                  const val = progress[kr.id] ?? kr.currentValue
                  const pct = Math.min(100, Math.round((val / kr.targetValue) * 100))
                  return (
                    <div key={kr.id} className="bg-[#201F1F] border border-[#3D4A3D] rounded p-3">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <p className="text-sm text-[#E5E2E1] flex-1">{kr.title}</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={val}
                            onChange={(e) => setProgress((prev) => ({ ...prev, [kr.id]: parseFloat(e.target.value) || 0 }))}
                            className="w-16 bg-[#2A2A2A] border border-[#3D4A3D] text-[#E5E2E1] text-xs px-2 py-1 rounded text-right focus:border-[#4BE277] focus:outline-none"
                          />
                          <span className="text-xs text-[#666666]">/ {kr.targetValue}{kr.unit}</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-[#2A2A2A] rounded-full">
                        <div className="h-full bg-[#4BE277] rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          <div className="flex gap-3 justify-between">
            <button onClick={() => setStep(1)} className="px-4 py-2 text-sm text-[#BCCBB9] border border-[#3D4A3D] rounded hover:bg-[#2A2A2A]">← Back</button>
            <button onClick={() => setStep(3)} className="bg-[#22C55E] text-[#0A1F0F] text-sm font-semibold px-4 py-2 rounded hover:bg-[#16A34A]">Save & Continue →</button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div>
          <h1 className="font-headline text-2xl font-bold text-[#E5E2E1] mb-1">Reflection</h1>
          <p className="text-sm text-[#666666] mb-6">Any insight, blocker or decision this week?</p>

          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="What matters most right now? What's blocking you? What did you decide?"
            rows={6}
            className="w-full bg-[#201F1F] border border-[#3D4A3D] text-[#E5E2E1] placeholder:text-[#666666] px-4 py-3 rounded text-sm focus:border-[#4BE277] focus:outline-none resize-none mb-6"
          />

          <div className="flex gap-3 justify-between">
            <button onClick={() => setStep(2)} className="px-4 py-2 text-sm text-[#BCCBB9] border border-[#3D4A3D] rounded hover:bg-[#2A2A2A]">← Back</button>
            <button onClick={completeReview} disabled={saving}
              className="flex items-center gap-2 bg-[#22C55E] text-[#0A1F0F] text-sm font-semibold px-4 py-2 rounded hover:bg-[#16A34A] disabled:opacity-50">
              <span className="material-symbols-outlined text-base">check</span>
              {saving ? "Saving..." : "Complete Review"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
