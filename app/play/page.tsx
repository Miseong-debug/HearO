"use client"

import { Suspense } from "react"
import PlayContent from "./play-content"
import { Loader2 } from "lucide-react"

export default function PlayPage() {
  return (
    <Suspense fallback={<PlayLoading />}>
      <PlayContent />
    </Suspense>
  )
}

function PlayLoading() {
  return (
    <main className="min-h-screen epic-gradient flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p>모험 준비 중...</p>
      </div>
    </main>
  )
}
