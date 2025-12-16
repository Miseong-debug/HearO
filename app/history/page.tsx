"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarClock, ImageIcon, Play, Volume2 } from "lucide-react"

type Record = {
  id: string
  date: string
  title: string
  score: number
  points: number
  summary: string
}

const mockRecords: Record[] = [
  {
    id: "1",
    date: "2025-03-01",
    title: "첫 번째 회복의 발걸음",
    score: 80,
    points: 10,
    summary:
      "오늘 당신은 오랜만에 몸을 깨우는 결심을 했습니다. 조심스러운 움직임이었지만, 그 안에는 포기하지 않겠다는 확고한 의지가 담겨 있었습니다.",
  },
  {
    id: "2",
    date: "2025-03-03",
    title: "조금 덜 아픈 아침",
    score: 83,
    points: 12,
    summary:
      "두 번째 세션에서 몸은 첫날보다 조금 더 가볍게 반응했습니다. 관절이 서서히 제자리를 찾으며, 어제의 선택이 틀리지 않았다는 것을 증명해 주었습니다.",
  },
  {
    id: "3",
    date: "2025-03-05",
    title: "숨겨진 근육의 귀환",
    score: 87,
    points: 15,
    summary:
      "오늘은 근육들이 오랜 잠에서 깨어나는 듯한 느낌이 들었습니다. 아직 완벽하진 않지만, 당신의 몸은 분명히 회복을 향해 나아가고 있습니다.",
  },
]

export default function HistoryPage() {
  return (
    <main className="min-h-screen epic-gradient relative overflow-hidden p-4 md:p-8">
      <div className="relative z-10 max-w-5xl mx-auto space-y-6 md:space-y-8">
        {/* 헤더 */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent drop-shadow-[0_0_18px_oklch(0.7_0.25_260_/_0.6)]">
              회복 기록
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              당신의 여정을 한 장면씩 되돌아볼 수 있는 스토리 아카이브입니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/exercise">
              <Button className="h-10 bg-gradient-to-r from-primary via-accent to-secondary text-xs md:text-sm">
                <Play className="w-4 h-4 mr-1" />
                새로운 세션 시작하기
              </Button>
            </Link>
          </div>
        </header>

        {/* 기록 리스트 */}
        <section className="space-y-4">
          {mockRecords.map((rec) => (
            <Card
              key={rec.id}
              className="relative overflow-hidden backdrop-blur-2xl bg-card/40 border border-border/40 rounded-3xl shadow-[0_0_30px_oklch(0.65_0.25_285_/_0.25)]"
            >
              <div
                className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary via-accent to-secondary"
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
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    {rec.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 text-xs md:text-sm">
                    <CalendarClock className="w-4 h-4" />
                    {rec.date}
                  </CardDescription>
                </div>
                <div className="text-right text-xs md:text-sm">
                  <p className="text-muted-foreground">자세 점수</p>
                  <p className="text-lg md:text-xl font-bold text-accent">{rec.score}</p>
                  <p className="text-[11px] text-primary mt-1">성장 포인트 +{rec.points}</p>
                </div>
              </CardHeader>

              <CardContent className="relative z-10 grid grid-cols-1 md:grid-cols-[2fr_minmax(0,1fr)] gap-4 md:gap-6">
                <div className="space-y-2 text-xs md:text-sm text-foreground/90 leading-relaxed">
                  {rec.summary}
                </div>
                <div className="flex flex-col justify-between gap-3">
                  {/* 썸네일 자리 */}
                  <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-black/40 h-20 md:h-24 flex items-center justify-center">
                    <p className="text-[11px] md:text-xs text-muted-foreground text-center px-3">
                      AI 생성 이미지 썸네일 자리입니다.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 bg-muted/40 border-border/40 hover:bg-muted/60 text-[11px] md:text-xs"
                    >
                      <Volume2 className="w-3 h-3 mr-1" />
                      스토리 듣기
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 bg-muted/40 border-border/40 hover:bg-muted/60 text-[11px] md:text-xs"
                    >
                      자세히 보기
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {mockRecords.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-12">
              아직 기록이 없습니다. 첫 운동을 시작해 보세요!
            </p>
          )}
        </section>
      </div>
    </main>
  )
}
