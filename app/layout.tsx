import "./globals.css"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "HearO - 당신의 영웅 서사가 시작됩니다",
  description:
    "재활 운동을 통해 영웅이 되는 RPG 모험 - Fantasy, Sci-Fi, Zombie, Sports, Spy, K-pop Idol 세계를 탐험하세요",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="dark">
      <body
        className={`${geist.className} min-h-screen relative overflow-x-hidden antialiased`}
      >
        {/* ===== GLOBAL BACKGROUND LAYERS ===== */}

        {/* Orb Glow 1 */}
        <div
          className="pointer-events-none fixed top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full opacity-30 blur-3xl"
          style={{
            background: "radial-gradient(circle, oklch(0.65 0.25 285) 0%, transparent 70%)",
          }}
        />

        {/* Orb Glow 2 */}
        <div
          className="pointer-events-none fixed bottom-[-10%] right-[-10%] w-[55vw] h-[55vw] rounded-full opacity-25 blur-3xl"
          style={{
            background: "radial-gradient(circle, oklch(0.68 0.22 320) 0%, transparent 70%)",
          }}
        />

        {/* Global Shine Overlay */}
        <div className="pointer-events-none fixed inset-0 shine-effect opacity-20" />

        {/* Global Grid (optional aesthetic layer) */}
        <div
          className="pointer-events-none fixed inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, oklch(0.98 0.01 285) 1px, transparent 1px)",
            backgroundSize: "45px 45px",
          }}
        />

        {/* ===== MAIN CONTENT ===== */}
        <main className="relative z-10">
          {children}
        </main>

        <Analytics />
      </body>
    </html>
  )
}
