import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import SignupContent from "./signup-content"

function SignupLoading() {
  return (
    <div className="flex flex-col items-center gap-3 text-muted-foreground">
      <Loader2 className="w-8 h-8 animate-spin" />
      <p>로딩 중...</p>
    </div>
  )
}

export default function SignupPage() {
  return (
    <main className="min-h-screen epic-gradient relative overflow-hidden flex items-center justify-center p-4">
      {/* 배경 효과 */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-40"
          style={{
            background: "radial-gradient(circle, oklch(0.68 0.22 320) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{
            background: "radial-gradient(circle, oklch(0.7 0.25 260) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, oklch(0.98 0.01 285) 1px, transparent 1px)",
            backgroundSize: "45px 45px",
          }}
        />
      </div>

      <Suspense fallback={<SignupLoading />}>
        <SignupContent />
      </Suspense>
    </main>
  )
}
