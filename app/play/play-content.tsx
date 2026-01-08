"use client"

import { useState, useEffect, useRef } from "react"
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
  ChevronRight,
  X,
  AlertTriangle,
  Volume2,
  VolumeX
} from "lucide-react"
import { ExerciseId, getExerciseConfig, DEFAULT_EXERCISE } from "@/lib/exercises"

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
  const nickname = searchParams.get("nickname") || "영웅"
  const profileId = searchParams.get("profileId") || undefined
  const exerciseId = (searchParams.get("exercise") || DEFAULT_EXERCISE) as ExerciseId
  const exerciseConfig = getExerciseConfig(exerciseId)

  const {
    state,
    currentEvent,
    startExercise,
    updateExercise,
    completeExercise,
    nextEvent,
    saveToHistory
  } = useGameState(theme, eventCount, nickname, profileId, exerciseId)

  const [showExitDialog, setShowExitDialog] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 배경음악 초기화 및 재생
  useEffect(() => {
    const audio = new Audio("/audio/bgm/bgm.mp3")
    audio.loop = true
    audio.volume = 0.3
    audioRef.current = audio

    // 사용자 인터랙션 후 자동 재생 시도
    const playAudio = () => {
      audio.play().catch(() => {
        // 자동 재생 실패 시 무시 (브라우저 정책)
      })
    }

    // 페이지 로드 시 재생 시도
    playAudio()

    // 클릭 시 재생 시도 (브라우저 자동재생 정책 대응)
    const handleInteraction = () => {
      if (audio.paused) {
        playAudio()
      }
      document.removeEventListener("click", handleInteraction)
    }
    document.addEventListener("click", handleInteraction)

    return () => {
      audio.pause()
      audio.src = ""
      document.removeEventListener("click", handleInteraction)
    }
  }, [])

  // 음소거 토글
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // 게임 완료 시 음악 정지 및 히스토리 저장
  const hasSavedRef = useRef(false)
  useEffect(() => {
    if (state.isCompleted) {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      // 중복 저장 방지
      if (!hasSavedRef.current) {
        hasSavedRef.current = true
        saveToHistory()
      }
    }
  }, [state.isCompleted, saveToHistory])

  const handleExit = () => {
    // 나갈 때 음악 정지
    if (audioRef.current) {
      audioRef.current.pause()
    }
    router.push("/adventure")
  }

  // 로딩 중
  if (state.isLoading) {
    return (
      <main className="min-h-screen epic-gradient flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <div>
            <p className="text-lg font-medium">{nickname}의 스토리를 생성하는 중...</p>
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

      {/* 나가기 확인 다이얼로그 */}
      {showExitDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm backdrop-blur-xl bg-card/90 border-border/40 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold">모험을 중단하시겠습니까?</h3>
                  <p className="text-sm text-muted-foreground">진행 상황이 저장되지 않습니다</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowExitDialog(false)}
                >
                  계속하기
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleExit}
                >
                  나가기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 헤더 */}
      <header className="relative z-10 flex items-center justify-between p-4 md:p-6">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => setShowExitDialog(true)}
        >
          <ChevronLeft className="w-4 h-4" />
          나가기
        </Button>

        <div className="text-center">
          <h1 className="font-semibold text-sm md:text-base">{state.chapter.title}</h1>
          <p className="text-xs text-muted-foreground">{nickname} - {themeNames[theme]}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-bold">{state.totalExp}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="w-8 h-8 p-0"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
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
            <StoryPanel
              event={currentEvent}
              onStartExercise={startExercise}
              onNextEvent={nextEvent}
              imageUrl={state.currentImageUrl}
              isImageLoading={state.isImageLoading}
            />
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
              currentAngles={state.exerciseAngles}
              exerciseId={exerciseId}
            />
          )}
        </div>
      </section>
    </main>
  )
}
