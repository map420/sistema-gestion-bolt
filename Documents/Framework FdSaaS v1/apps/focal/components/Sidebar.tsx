"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { href: "/", icon: "dashboard", label: "Dashboard" },
  { href: "/objectives", icon: "flag", label: "Objectives" },
  { href: "/inbox", icon: "inbox", label: "Inbox" },
  { href: "/review", icon: "rate_review", label: "Weekly Review" },
  { href: "/settings", icon: "settings", label: "Settings" },
]

export default function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const initials = userEmail.slice(0, 2).toUpperCase()

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-[220px] bg-[#1C1B1B] border-r border-[#3D4A3D] flex-col z-20">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-[#3D4A3D]">
        <div className="w-2 h-2 rounded-full bg-[#4BE277]" />
        <span className="font-headline text-base font-bold text-[#E5E2E1]">Focal</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                isActive
                  ? "border-l-2 border-[#22C55E] bg-[#2A2A2A] text-[#E5E2E1] pl-[10px]"
                  : "text-[#BCCBB9] hover:bg-[#2A2A2A] hover:text-[#E5E2E1]"
              }`}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}

        <Link
          href="/capture"
          className="flex items-center gap-3 px-3 py-2 rounded text-sm text-[#BCCBB9] hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-colors mt-2"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          Capture Note
        </Link>
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-[#3D4A3D]">
        <div className="flex items-center gap-3 px-2 py-2 rounded hover:bg-[#2A2A2A] transition-colors group">
          <div className="w-7 h-7 rounded-full bg-[#22C55E]/20 flex items-center justify-center text-[#4BE277] text-xs font-semibold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#E5E2E1] truncate">{userEmail}</p>
          </div>
          <button
            onClick={signOut}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            title="Sign out"
          >
            <span className="material-symbols-outlined text-base text-[#666666] hover:text-[#E5E2E1]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
