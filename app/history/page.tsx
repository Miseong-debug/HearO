"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarClock, Play, Star, Sword, Rocket, Skull, Heart, ChevronLeft } from "lucide-react"

type Theme = "dungeon" | "space" | "zombie" | "healing"

interface GameHistory {
  id: string
  theme: Theme
  chapterTitle: string
  totalExp: number
  completedAt: string
  eventCount: number
}

const STORAGE_KEY = "hearo_game_history"

const themeIcons: Record<Theme, React.ReactNode> = {
  dungeon: <Sword className="w-4 h-4" />,
  space: <Rocket className="w-4 h-4" />,
  zombie: <Skull className="w-4 h-4" />,
  healing: <Heart className="w-4 h-4" />
}

const themeNames: Record<Theme, string> = {
  dungeon: "던전/판타지",
  space: "우주/SF",
  zombie: "좀비 서바이벌",
  healing: "일상/힐링"
}

const themeColors: Record<Theme, string> = {
  dungeon: "from-purple-500 to-indigo-600",
  space: "from-blue-500 to-cyan-500",
  zombie: "from-green-600 to-emerald-500",
  healing: "from-pink-400 to-rose-500"
}

export default function HistoryPage() {
  const [records, setRecords] = useState<GameHistory[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const existing = localStorage.getItem(STORAGE_KEY)
      if (existing) {
        setRecords(JSON.parse(existing))
      }
    } catch {
      console.error("히스토리 로드 실패")
    }
    setIsLoaded(true)
  }, [])

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <main className="min-h-screen epic-gradient relative overflow-hidden p-4 md:p-8">
      <div className="relative z-10 max-w-4xl mx-auto space-y-6 md:space-y-8">
        {/* 헤더 */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                홈으로
              </Button>
            </Link>
          </div>
        </header>

        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent drop-shadow-[0_0_18px_oklch(0.7_0.25_260_/_0.6)]">
            모험 기록
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            당신이 완료한 모험들을 확인하세요
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/adventure">
            <Button className="h-10 bg-gradient-to-r from-primary via-accent to-secondary text-xs md:text-sm">
              <Play className="w-4 h-4 mr-1" />
              새로운 모험 시작하기
            </Button>
          </Link>
        </div>

        {/* 기록 리스트 */}
        <section className="space-y-4">
          {isLoaded && records.length > 0 && records.map((rec) => (
            <Card
              key={rec.id}
              className="relative overflow-hidden backdrop-blur-2xl bg-card/40 border border-border/40 rounded-3xl shadow-[0_0_30px_oklch(0.65_0.25_285_/_0.25)]"
            >
              <div
                className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${themeColors[rec.theme]}`}
                aria-hidden
              />
              <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                  background:
                    "radial-gradient(circle at 0% 0%, oklch(0.65 0.25 285 / 0.5), transparent 60%)",
                }}
              />

              <CardHeader className="relative z-10 flex flex-row items-start justify-between gap-4">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${themeColors[rec.theme]} flex items-center justify-center text-white`}>
                      {themeIcons[rec.theme]}
                    </div>
                    {rec.chapterTitle}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 text-xs md:text-sm">
                    <span className="flex items-center gap-1">
                      <CalendarClock className="w-4 h-4" />
                      {formatDate(rec.completedAt)}
                    </span>
                    <span className="text-muted-foreground">
                      {themeNames[rec.theme]}
                    </span>
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="text-xl font-bold">{rec.totalExp}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {rec.eventCount}개 이벤트 클리어
                  </p>
                </div>
              </CardHeader>

              <CardContent className="relative z-10">
                <div className="flex justify-end">
                  <Link href={`/adventure`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 bg-muted/40 border-border/40 hover:bg-muted/60 text-xs"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      다시 도전하기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}

          {isLoaded && records.length === 0 && (
            <Card className="backdrop-blur-xl bg-card/40 border-border/40 rounded-3xl">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground mb-4">
                  아직 완료한 모험이 없습니다
                </p>
                <Link href="/adventure">
                  <Button className="bg-gradient-to-r from-primary via-accent to-secondary">
                    <Play className="w-4 h-4 mr-2" />
                    첫 모험 시작하기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {!isLoaded && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">로딩 중...</p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
