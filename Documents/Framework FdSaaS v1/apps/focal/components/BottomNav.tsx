"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/", icon: "dashboard", label: "Home" },
  { href: "/objectives", icon: "flag", label: "Goals" },
  { href: "/capture", icon: "add_circle", label: "Capture" },
  { href: "/inbox", icon: "inbox", label: "Inbox" },
  { href: "/review", icon: "rate_review", label: "Review" },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#1C1B1B] border-t border-[#3D4A3D] flex items-center justify-around md:hidden z-20">
      {navItems.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
              isActive ? "text-[#4BE277]" : "text-[#666666]"
            }`}
          >
            <span className="material-symbols-outlined text-2xl">{item.icon}</span>
            <span className="text-[10px]">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
