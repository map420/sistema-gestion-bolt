"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

type KR = { id: string; title: string; currentValue: number; targetValue: number; unit: string }
type Note = { id: string; title: string; content: string; source?: string; isDistilled: boolean; createdAt: string }
type Objective = { id: string; title: string; description?: string; startDate: string; endDate: string; keyResults: KR[]; notes: Note[] }

const ACCENT_COLORS = ["#4BE277", "#2DD4BF", "#60A5FA"]

export default function ObjectiveDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [obj, setObj] = useState<Objective | null>(null)
  const [loading, setLoading] = useState(true)
  const [showKRForm, setShowKRForm] = useState(false)
  const [krTitle, setKRTitle] = useState("")
  const [krTarget, setKRTarget] = useState("100")
  const [krUnit, setKRUnit] = useState("%")
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [noteTitle, setNoteTitle] = useState("")
  const [noteContent, setNoteContent] = useState("")
  const [noteSource, setNoteSource] = useState("")

  useEffect(() => { loadObjective() }, [id])

  async function loadObjective() {
    const res = await fetch(`/api/objectives/${id}`)
    if (!res.ok) { router.push("/objectives"); return }
    setObj(await res.json())
    setLoading(false)
  }

  async function updateKR(krId: string, currentValue: number) {
    await fetch(`/api/key-results/${krId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentValue }),
    })
    loadObjective()
  }

  async function createKR(e: React.FormEvent) {
    e.preventDefault()
    await fetch("/api/key-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ objectiveId: id, title: krTitle, targetValue: parseFloat(krTarget), unit: krUnit }),
    })
    setShowKRForm(false); setKRTitle(""); setKRTarget("100"); setKRUnit("%")
    loadObjective()
  }

  async function createNote(e: React.FormEvent) {
    e.preventDefault()
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ objectiveId: id, title: noteTitle, content: noteContent, source: noteSource || undefined }),
    })
    setShowNoteForm(false); setNoteTitle(""); setNoteContent(""); setNoteSource("")
    loadObjective()
  }

  async function toggleDistilled(noteId: string, current: boolean) {
    await fetch(`/api/notes/${noteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDistilled: !current }),
    })
    loadObjective()
  }

  if (loading) return <div className="flex items-center justify-center h-full"><span className="text-[#666666] text-sm">Loading...</span></div>
  if (!obj) return null

  const progress = obj.keyResults.length
    ? Math.round(obj.keyResults.reduce((s, kr) => s + Math.min(100, (kr.currentValue / kr.targetValue) * 100), 0) / obj.keyResults.length)
    : 0

  return (
    <div className="px-4 md:px-6 py-6 max-w-3xl">
      {/* Back */}
      <button onClick={() => router.push("/objectives")} className="flex items-center gap-1 text-xs text-[#666666] hover:text-[#BCCBB9] mb-4 transition-colors">
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Objectives
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-headline text-2xl font-bold text-[#E5E2E1] mb-2">{obj.title}</h1>
        <div className="flex items-center gap-4">
          <span className="text-xs text-[#666666]">
            {new Date(obj.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })} —{" "}
            {new Date(obj.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </span>
          <span className="text-sm font-semibold text-[#4BE277]">{progress}%</span>
        </div>
      </div>

      {/* Key Results */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#BCCBB9] uppercase tracking-wider">Key Results</h2>
          <button onClick={() => setShowKRForm(!showKRForm)} className="text-xs text-[#4BE277] hover:text-[#22C55E] flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">add</span>
            Add KR
          </button>
        </div>

        {showKRForm && (
          <form onSubmit={createKR} className="bg-[#201F1F] border border-[#3D4A3D] rounded p-3 mb-3 flex gap-2">
            <input value={krTitle} onChange={(e) => setKRTitle(e.target.value)} placeholder="Key result title" required
              className="flex-1 bg-[#2A2A2A] border border-[#3D4A3D] text-[#E5E2E1] placeholder:text-[#666666] px-3 py-1.5 rounded text-sm focus:border-[#4BE277] focus:outline-none" />
            <input value={krTarget} onChange={(e) => setKRTarget(e.target.value)} placeholder="100" type="number" required
              className="w-16 bg-[#2A2A2A] border border-[#3D4A3D] text-[#E5E2E1] px-2 py-1.5 rounded text-sm focus:border-[#4BE277] focus:outline-none" />
            <input value={krUnit} onChange={(e) => setKRUnit(e.target.value)} placeholder="%"
              className="w-12 bg-[#2A2A2A] border border-[#3D4A3D] text-[#E5E2E1] px-2 py-1.5 rounded text-sm focus:border-[#4BE277] focus:outline-none" />
            <button type="submit" className="px-3 py-1.5 bg-[#22C55E] text-[#0A1F0F] text-sm font-semibold rounded hover:bg-[#16A34A]">Add</button>
          </form>
        )}

        {obj.keyResults.length === 0 ? (
          <p className="text-sm text-[#666666] py-4">No key results yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {obj.keyResults.map((kr, i) => {
              const pct = Math.min(100, Math.round((kr.currentValue / kr.targetValue) * 100))
              const color = ACCENT_COLORS[i % ACCENT_COLORS.length]
              return (
                <div key={kr.id} className="bg-[#201F1F] border border-[#3D4A3D] rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-[#E5E2E1]">{kr.title}</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        defaultValue={kr.currentValue}
                        onBlur={(e) => updateKR(kr.id, parseFloat(e.target.value))}
                        className="w-16 bg-[#2A2A2A] border border-[#3D4A3D] text-[#E5E2E1] text-xs px-2 py-1 rounded text-right focus:border-[#4BE277] focus:outline-none"
                      />
                      <span className="text-xs text-[#666666]">/ {kr.targetValue}{kr.unit}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-[#2A2A2A] rounded-full">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#BCCBB9] uppercase tracking-wider">
            Notes linked to this objective
          </h2>
          <button onClick={() => setShowNoteForm(!showNoteForm)} className="text-xs text-[#4BE277] hover:text-[#22C55E] flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">add</span>
            Capture note
          </button>
        </div>

        {showNoteForm && (
          <form onSubmit={createNote} className="bg-[#201F1F] border border-[#3D4A3D] rounded p-4 mb-4 flex flex-col gap-3">
            <input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} placeholder="Note title" required
              className="w-full bg-[#2A2A2A] border border-[#3D4A3D] text-[#E5E2E1] placeholder:text-[#666666] px-3 py-2 rounded text-sm focus:border-[#4BE277] focus:outline-none" />
            <textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} placeholder="What did you learn or think?" rows={3}
              className="w-full bg-[#2A2A2A] border border-[#3D4A3D] text-[#E5E2E1] placeholder:text-[#666666] px-3 py-2 rounded text-sm focus:border-[#4BE277] focus:outline-none resize-none" />
            <input value={noteSource} onChange={(e) => setNoteSource(e.target.value)} placeholder="Source — book, podcast, idea..."
              className="w-full bg-[#2A2A2A] border border-[#3D4A3D] text-[#E5E2E1] placeholder:text-[#666666] px-3 py-2 rounded text-sm focus:border-[#4BE277] focus:outline-none" />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowNoteForm(false)} className="px-3 py-1.5 text-sm text-[#BCCBB9] border border-[#3D4A3D] rounded hover:bg-[#2A2A2A]">Cancel</button>
              <button type="submit" className="px-4 py-1.5 text-sm bg-[#22C55E] text-[#0A1F0F] font-semibold rounded hover:bg-[#16A34A]">Capture →</button>
            </div>
          </form>
        )}

        {obj.notes.length === 0 ? (
          <p className="text-sm text-[#666666] py-4">No notes linked yet.</p>
        ) : (
          <div className="columns-1 md:columns-2 gap-4">
            {obj.notes.map((note) => (
              <div key={note.id} className="bg-[#201F1F] border border-[#3D4A3D] rounded p-3 mb-4 break-inside-avoid">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="text-sm font-medium text-[#E5E2E1]">{note.title}</h3>
                  <button onClick={() => toggleDistilled(note.id, note.isDistilled)}>
                    <span className={`material-symbols-outlined text-base ${note.isDistilled ? "text-[#4BE277]" : "text-[#666666]"}`}>
                      {note.isDistilled ? "star" : "star_border"}
                    </span>
                  </button>
                </div>
                <p className="text-xs text-[#BCCBB9] line-clamp-2 mb-2">{note.content}</p>
                {note.source && (
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-[#666666]">menu_book</span>
                    <span className="text-[10px] text-[#666666]">{note.source}</span>
                  </div>
                )}
                <p className="text-[10px] text-[#666666] mt-1.5">
                  {new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
