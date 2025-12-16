import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import ResultContent from "./result-content"

export default function ResultPage() {
  return (
    <Suspense fallback={<ResultLoading />}>
      <ResultContent />
    </Suspense>
  )
}

function ResultLoading() {
  return (
    <main className="min-h-screen epic-gradient flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p>로딩 중...</p>
      </div>
    </main>
  )
}
