import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Focal — Your OKR Second Brain",
  description: "Track objectives, capture insights, and review your progress weekly.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-[#131313] text-[#E5E2E1]">{children}</body>
    </html>
  )
}
