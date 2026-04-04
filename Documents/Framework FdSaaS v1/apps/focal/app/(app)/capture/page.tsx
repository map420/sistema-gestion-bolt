"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Objective = { id: string; title: string }

export default function CapturePage() {
  const router = useRouter()
  const [objectives, setObjectives] = useState<Objective[]>([])
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [source, setSource] = useState("")
  const [objectiveId, setObjectiveId] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/objectives").then((r) => r.json()).then((data) => {
      setObjectives(data)
      if (data.length) setObjectiveId(data[0].id)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!objectiveId) { setError("Select an objective first"); return }
    setSaving(true)
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, source: source || undefined, objectiveId }),
    })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error)
      setSaving(false)
      return
    }
    router.push("/inbox")
  }

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <h1 className="font-headline text-2xl font-bold text-[#E5E2E1] mb-1">Capture Note</h1>
        <p className="text-sm text-[#666666] mb-6">What did you just learn or think?</p>

        <form onSubmit={handleSubmit} className="bg-[#201F1F] border border-[#3D4A3D] rounded p-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs text-[#BCCBB9] mb-1.5">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Distribution beats product in year 1" required
              className="w-full bg-[#2A2A2A] border border-[#3D4A3D] text-[#E5E2E1] placeholder:text-[#666666] px-3 py-2 rounded text-sm focus:border-[#4BE277] focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs text-[#BCCBB9] mb-1.5">Note</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)}
              placeholder="What did you just learn or think?" rows={4}
              className="w-full bg-[#2A2A2A] border border-[#3D4A3D] text-[#E5E2E1] placeholder:text-[#666666] px-3 py-2 rounded text-sm focus:border-[#4BE277] focus:outline-none resize-none" />
          </div>

          <div>
            <label className="block text-xs text-[#BCCBB9] mb-1.5">Source <span className="text-[#666666]">(optional)</span></label>
            <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Book, podcast, idea..."
              className="w-full bg-[#2A2A2A] border border-[#3D4A3D] text-[#E5E2E1] placeholder:text-[#666666] px-3 py-2 rounded text-sm focus:border-[#4BE277] focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs text-[#BCCBB9] mb-1.5">Link to Objective</label>
            {objectives.length === 0 ? (
              <p className="text-xs text-[#666666]">No active objectives. <a href="/objectives" className="text-[#4BE277]">Create one first</a>.</p>
            ) : (
              <select value={objectiveId} onChange={(e) => setObjectiveId(e.target.value)}
                className="w-full bg-[#2A2A2A] border border-[#3D4A3D] text-[#E5E2E1] px-3 py-2 rounded text-sm focus:border-[#4BE277] focus:outline-none">
                {objectives.map((o) => (
                  <option key={o.id} value={o.id}>{o.title}</option>
                ))}
              </select>
            )}
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={() => router.back()}
              className="px-4 py-2 text-sm text-[#BCCBB9] border border-[#3D4A3D] rounded hover:bg-[#2A2A2A] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm bg-[#22C55E] text-[#0A1F0F] font-semibold rounded hover:bg-[#16A34A] disabled:opacity-50 transition-colors">
              {saving ? "Saving..." : "Capture →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
