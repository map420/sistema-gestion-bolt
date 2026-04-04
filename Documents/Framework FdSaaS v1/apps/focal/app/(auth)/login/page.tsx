"use client"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${appUrl}/auth/callback` },
      })
      if (error) { setError(error.message); setLoading(false); return }
    }

    router.push("/")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#131313] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-[#4BE277]" />
          <span className="font-headline text-lg font-bold text-[#E5E2E1]">Focal</span>
        </div>

        {/* Heading */}
        <h1 className="font-headline text-2xl font-bold text-[#E5E2E1] mb-1">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-sm text-[#666666] mb-6">
          {mode === "login" ? "Sign in to your second brain." : "Start tracking your OKRs today."}
        </p>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#201F1F] p-1 rounded mb-6">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-1.5 text-sm rounded transition-colors ${
                mode === m
                  ? "bg-[#2A2A2A] text-[#E5E2E1] font-medium"
                  : "text-[#666666] hover:text-[#BCCBB9]"
              }`}
            >
              {m === "login" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-[#BCCBB9] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-[#201F1F] border border-[#3D4A3D] text-[#E5E2E1] placeholder:text-[#666666] px-3 py-2 rounded text-sm focus:border-[#4BE277] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-[#BCCBB9] mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full bg-[#201F1F] border border-[#3D4A3D] text-[#E5E2E1] placeholder:text-[#666666] px-3 py-2 rounded text-sm focus:border-[#4BE277] focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-50 text-[#0A1F0F] font-semibold text-sm py-2.5 rounded transition-colors"
          >
            {loading ? "Loading..." : mode === "login" ? "Sign in →" : "Create account →"}
          </button>
        </form>

        {mode === "login" && (
          <p className="text-xs text-[#666666] text-center mt-6">
            Demo: <span className="text-[#BCCBB9]">admin@admin.com</span> / <span className="text-[#BCCBB9]">admin123</span>
          </p>
        )}
      </div>
    </div>
  )
}
