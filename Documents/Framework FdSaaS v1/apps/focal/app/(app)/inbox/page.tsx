"use client"
import { useEffect, useState } from "react"

type Note = { id: string; title: string; content: string; isDistilled: boolean; createdAt: string }
type ObjectiveGroup = { id: string; title: string; notes: Note[] }

export default function InboxPage() {
  const [groups, setGroups] = useState<ObjectiveGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "distilled">("all")
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => { loadInbox() }, [])

  async function loadInbox() {
    try {
      const res = await fetch("/api/inbox")
      const data = await res.json()
      if (Array.isArray(data)) {
        setGroups(data)
        const exp: Record<string, boolean> = {}
        data.forEach((g: ObjectiveGroup) => { exp[g.id] = true })
        setExpanded(exp)
      }
    } catch {}
    setLoading(false)
  }

  async function toggleDistilled(noteId: string, current: boolean) {
    await fetch(`/api/notes/${noteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDistilled: !current }),
    })
    loadInbox()
  }

  const totalNotes = groups.reduce((s, g) => s + g.notes.length, 0)
  const totalDistilled = groups.reduce((s, g) => s + g.notes.filter((n) => n.isDistilled).length, 0)

  const filteredGroups = groups.map((g) => ({
    ...g,
    notes: filter === "distilled" ? g.notes.filter((n) => n.isDistilled) : g.notes,
  })).filter((g) => g.notes.length > 0)

  return (
    <div className="px-4 md:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-headline text-2xl font-bold text-[#E5E2E1]">Inbox</h1>
        <div className="flex gap-1 bg-[#201F1F] p-1 rounded">
          {(["all", "distilled"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs rounded transition-colors ${filter === f ? "bg-[#2A2A2A] text-[#E5E2E1]" : "text-[#666666] hover:text-[#BCCBB9]"}`}>
              {f === "all" ? "All" : "Distilled"}
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm text-[#666666] mb-6">
        Last 7 days — {totalNotes} notes · {totalDistilled} distilled
      </p>

      {loading ? (
        <p className="text-sm text-[#666666]">Loading...</p>
      ) : !filteredGroups.length ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-4xl text-[#3D4A3D] block mb-3">inbox</span>
          <p className="text-[#666666] text-sm">
            {filter === "distilled" ? "No distilled notes yet." : "No notes captured this week."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredGroups.map((group, gi) => (
            <div key={group.id} className="bg-[#201F1F] border border-[#3D4A3D] rounded overflow-hidden">
              {/* Group header */}
              <button
                onClick={() => setExpanded((prev) => ({ ...prev, [group.id]: !prev[group.id] }))}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2A2A2A] transition-colors"
              >
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ["#4BE277","#2DD4BF","#60A5FA"][gi % 3] }} />
                <span className="text-sm font-medium text-[#E5E2E1] flex-1 text-left">{group.title}</span>
                <span className="text-xs bg-[#2A2A2A] text-[#BCCBB9] px-2 py-0.5 rounded-xl">{group.notes.length}</span>
                <span className="material-symbols-outlined text-base text-[#666666]">
                  {expanded[group.id] ? "expand_less" : "expand_more"}
                </span>
              </button>

              {/* Notes */}
              {expanded[group.id] && (
                <div className="border-t border-[#3D4A3D]">
                  {group.notes.map((note) => (
                    <div key={note.id} className="flex items-center gap-3 px-4 py-3 border-b border-[#3D4A3D] last:border-b-0 hover:bg-[#2A2A2A] transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#E5E2E1] truncate">{note.title}</p>
                        <p className="text-xs text-[#666666] truncate mt-0.5">{note.content}</p>
                      </div>
                      <button onClick={() => toggleDistilled(note.id, note.isDistilled)} className="shrink-0">
                        <span className={`material-symbols-outlined text-base ${note.isDistilled ? "text-[#4BE277]" : "text-[#666666] hover:text-[#BCCBB9]"}`}>
                          {note.isDistilled ? "star" : "star_border"}
                        </span>
                      </button>
                      <span className="text-[10px] text-[#666666] shrink-0">
                        {new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
