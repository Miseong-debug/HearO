"use client"

import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useGameState, Theme } from "./hooks/useGameState"
import StoryPanel from "./components/StoryPanel"
import ExercisePanel from "./components/ExercisePanel"
import ProgressBar from "./components/ProgressBar"
import {
  ChevronLeft,
  Loader2,
  Star,
  Trophy,
  Home,
  RotateCcw,
  ChevronRight
} from "lucide-react"

const themeNames: Record<Theme, string> = {
  dungeon: "던전/판타지",
  space: "우주/SF",
  zombie: "좀비 서바이벌",
  healing: "일상/힐링"
}

export default function PlayContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const theme = (searchParams.get("theme") || "dungeon") as Theme
  const eventCount = Number(searchParams.get("events") || 5)

  const {
    state,
    currentEvent,
    startExercise,
    updateExercise,
    completeExercise,
    nextEvent,
    saveToHistory
  } = useGameState(theme, eventCount)

  // 로딩 중
  if (state.isLoading) {
    return (
      <main className="min-h-screen epic-gradient flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <div>
            <p className="text-lg font-medium">스토리를 생성하는 중...</p>
            <p className="text-sm text-muted-foreground mt-1">
              {themeNames[theme]} 모험을 준비하고 있습니다
            </p>
          </div>
        </div>
      </main>
    )
  }

  // 에러 (챕터 없음)
  if (!state.chapter || !currentEvent) {
    return (
      <main className="min-h-screen epic-gradient flex items-center justify-center">
        <Card className="backdrop-blur-xl bg-card/40 border-border/40 rounded-3xl max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-lg mb-4">스토리를 불러오지 못했습니다</p>
            <Button onClick={() => router.push("/adventure")}>
              다시 시도
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  // 게임 완료
  if (state.isCompleted) {
    // 히스토리에 저장
    saveToHistory()

    return (
      <main className="min-h-screen epic-gradient relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 30%, oklch(0.7 0.25 60 / 0.4) 0%, transparent 50%)",
            }}
          />
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <Card className="backdrop-blur-xl bg-card/40 border-border/40 rounded-3xl max-w-lg w-full">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-2xl font-bold mb-2">모험 완료!</h1>
              <p className="text-muted-foreground mb-6">
                &quot;{state.chapter.title}&quot; 챕터를 클리어했습니다
              </p>

              <div className="bg-muted/20 rounded-2xl p-4 mb-8">
                <div className="flex items-center justify-center gap-2 text-amber-400">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-2xl font-bold">{state.totalExp}</span>
                  <span className="text-sm">경험치 획득</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary via-accent to-secondary"
                  onClick={() => router.push("/adventure")}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  새로운 모험 시작
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/history")}
                >
                  <ChevronRight className="w-4 h-4 mr-2" />
                  모험 기록 보기
                </Button>
                <Link href="/" className="block">
                  <Button size="lg" variant="ghost" className="w-full">
                    <Home className="w-4 h-4 mr-2" />
                    홈으로
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  // 게임 진행 중
  return (
    <main className="min-h-screen epic-gradient relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 50%, oklch(0.65 0.25 285 / 0.3) 0%, transparent 50%)",
          }}
        />
      </div>

      {/* 헤더 */}
      <header className="relative z-10 flex items-center justify-between p-4 md:p-6">
        <Link href="/adventure">
          <Button variant="ghost" size="sm" className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            나가기
          </Button>
        </Link>

        <div className="text-center">
          <h1 className="font-semibold text-sm md:text-base">{state.chapter.title}</h1>
          <p className="text-xs text-muted-foreground">{themeNames[theme]}</p>
        </div>

        <div className="flex items-center gap-1 text-amber-400">
          <Star className="w-4 h-4 fill-current" />
          <span className="font-bold">{state.totalExp}</span>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <section className="relative z-10 px-4 md:px-6 pb-8">
        <div className="max-w-2xl mx-auto">
          {/* 진행 바 */}
          <div className="mb-6">
            <ProgressBar
              currentIndex={state.currentEventIndex}
              totalEvents={state.chapter.events.length}
            />
            <p className="text-center text-xs text-muted-foreground mt-2">
              이벤트 {state.currentEventIndex + 1} / {state.chapter.events.length}
            </p>
          </div>

          {/* 운동 중이 아닐 때: 스토리 패널 */}
          {!state.isExercising && (
            <>
              <StoryPanel
                event={currentEvent}
                onStartExercise={startExercise}
              />

              {/* 스토리 이벤트일 경우 다음 버튼 */}
              {currentEvent.type === "story" && (
                <div className="mt-6 text-center">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary via-accent to-secondary"
                    onClick={nextEvent}
                  >
                    다음으로
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </>
          )}

          {/* 운동 중일 때: 운동 패널 */}
          {state.isExercising && (
            <ExercisePanel
              event={currentEvent}
              onComplete={() => {
                completeExercise()
                nextEvent()
              }}
              onUpdate={updateExercise}
              currentReps={state.exerciseReps}
              currentScore={state.exerciseScore}
            />
          )}
        </div>
      </section>
    </main>
  )
}
