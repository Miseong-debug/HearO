"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Flame, PauseCircle, PlayCircle, Target, Volume2, VolumeX, Camera as CameraIcon, Trophy, Minus, Plus } from "lucide-react"
import dynamic from "next/dynamic"
import { useVoiceGuide } from "./hooks/useVoiceGuide"

// Camera 컴포넌트를 클라이언트에서만 로드 (MediaPipe는 SSR 불가)
const Camera = dynamic(() => import("./camera"), { ssr: false })

export default function ExercisePage() {
  const router = useRouter()

  const [isRunning, setIsRunning] = useState(false)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [reps, setReps] = useState(0)
  const [duration, setDuration] = useState(0)
  const [quality, setQuality] = useState(0)
  const [targetReps, setTargetReps] = useState(10)
  const [isTargetReached, setIsTargetReached] = useState(false)
  const [isVoiceGuideOn, setIsVoiceGuideOn] = useState(false)

  const voiceGuide = useVoiceGuide()
  const lastPostureWarningRef = useRef(0)

  const adjustTarget = (delta: number) => {
    setTargetReps((prev) => Math.max(1, Math.min(50, prev + delta)))
  }

  const toggleVoiceGuide = () => {
    if (isVoiceGuideOn) {
      voiceGuide.announceOff()
      setIsVoiceGuideOn(false)
    } else {
      setIsVoiceGuideOn(true)
      voiceGuide.announceWelcome()
    }
  }

  // 타이머: 운동 중일 때 1초마다 duration 증가
  useEffect(() => {
    if (!isRunning) return

    const timer = setInterval(() => {
      setDuration((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning])

  const toggleExercise = () => {
    setIsRunning((prev) => {
      const newState = !prev
      if (isVoiceGuideOn) {
        if (newState) {
          voiceGuide.announceStart()
        } else {
          voiceGuide.announcePause()
        }
      }
      return newState
    })
  }

  const startCamera = () => {
    setIsCameraReady(true)
  }

  const finishExercise = () => {
    if (isVoiceGuideOn) {
      voiceGuide.announceFinish(reps, quality)
    }
    // 음성이 끝난 후 이동하도록 약간 딜레이
    setTimeout(() => {
      router.push(`/result?reps=${reps}&score=${quality}&duration=${duration}&theme=fantasy`)
    }, isVoiceGuideOn ? 2000 : 0)
  }

  // 반복 카운트 음성 안내
  const handleRepCount = (count: number) => {
    setReps(count)
    if (isVoiceGuideOn) {
      voiceGuide.announceRep(count, targetReps)
    }
  }

  // 목표 달성 음성 안내
  const handleTargetReached = () => {
    setIsTargetReached(true)
    if (isVoiceGuideOn) {
      voiceGuide.announceTargetReached()
    }
  }

  // 자세 점수 업데이트 및 경고
  const handleScoreUpdate = (score: number) => {
    setQuality(score)

    // 운동 중이고 음성 가이드가 켜져 있을 때만
    if (!isRunning || !isVoiceGuideOn) return

    const now = Date.now()
    const warningInterval = 10000 // 10초 간격으로만 경고

    // 점수가 50 이하이고 마지막 경고로부터 10초 이상 지났을 때
    if (score > 0 && score < 50 && now - lastPostureWarningRef.current > warningInterval) {
      lastPostureWarningRef.current = now
      voiceGuide.announcePostureWarning(score)
    }
  }

  return (
    <main className="min-h-screen epic-gradient relative overflow-hidden flex flex-col md:flex-row gap-4 p-4 md:p-8">
      {/* 왼쪽: 카메라 / 포즈 시각화 영역 */}
      <section className="relative flex-1 min-h-[320px] md:min-h-[480px]">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "radial-gradient(circle, oklch(0.98 0.01 285) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <Card className="relative h-full w-full backdrop-blur-xl bg-card/30 border border-border/40 rounded-3xl shadow-[0_0_40px_oklch(0.65_0.25_285_/_0.35)] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between gap-2 relative z-10">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Activity className="w-5 h-5 text-primary" />
                실시간 재활 운동
              </CardTitle>
              <CardDescription>웹캠을 활성화하고, 가이드에 맞춰 천천히 움직여 보세요.</CardDescription>
            </div>
            <span className="px-3 py-1 rounded-full bg-muted/40 text-xs text-muted-foreground">
              HearO Pose Tracker
            </span>
          </CardHeader>

          <CardContent className="relative z-10 h-full">
            <div className="relative mt-2 h-[260px] md:h-[360px] rounded-2xl border border-border/40 bg-black/40 overflow-hidden flex items-center justify-center">
              {isCameraReady ? (
                <Camera
                  onRepCount={handleRepCount}
                  onScoreUpdate={handleScoreUpdate}
                  onTargetReached={handleTargetReached}
                  isRunning={isRunning}
                  targetReps={targetReps}
                />
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-xs md:text-sm text-muted-foreground text-center px-4">
                    카메라를 활성화하여 자세를 실시간으로 추적하세요.
                  </p>
                  <Button
                    onClick={startCamera}
                    variant="outline"
                    className="bg-primary/20 border-primary/50 hover:bg-primary/30"
                  >
                    <CameraIcon className="w-4 h-4 mr-2" />
                    카메라 활성화
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-4 text-xs md:text-sm text-muted-foreground leading-relaxed">
              {isCameraReady ? (
                <span className="text-green-400">✓ 카메라 활성화됨 - 포즈 추적 중</span>
              ) : (
                "어깨와 허리를 곧게 펴고, 화면 중앙에 위치해주세요."
              )}
              {" "}무리하지 말고, 통증이 느껴진다면 즉시 중단하세요.
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 오른쪽: 운동 상태 패널 */}
      <section className="w-full md:w-[360px] flex-shrink-0 space-y-4">
        <Card className="backdrop-blur-2xl bg-card/40 border border-border/40 rounded-3xl shadow-[0_0_30px_oklch(0.65_0.25_285_/_0.3)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              오늘의 세션
            </CardTitle>
            <CardDescription>오늘 목표를 달성하면, 새로운 스토리가 열립니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center text-xs md:text-sm">
              <div className={`p-3 rounded-2xl border transition-all duration-300 ${
                isTargetReached
                  ? "bg-green-500/20 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                  : "bg-muted/40 border-border/20"
              }`}>
                <p className="text-muted-foreground mb-1 flex items-center justify-center gap-1">
                  {isTargetReached && <Trophy className="w-3 h-3 text-yellow-400" />}
                  반복 수
                </p>
                <div className="flex items-center justify-center gap-1">
                  {!isRunning && !isTargetReached && (
                    <button
                      type="button"
                      onClick={() => adjustTarget(-1)}
                      className="w-6 h-6 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                  )}
                  <p className={`text-lg md:text-2xl font-bold min-w-[60px] ${isTargetReached ? "text-green-400" : "text-primary"}`}>
                    {reps}/{targetReps}
                  </p>
                  {!isRunning && !isTargetReached && (
                    <button
                      type="button"
                      onClick={() => adjustTarget(1)}
                      className="w-6 h-6 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/20">
                <p className="text-muted-foreground mb-1">운동 시간</p>
                <p className="text-lg md:text-2xl font-bold">
                  {Math.floor(duration / 60).toString().padStart(2, "0")}:
                  {(duration % 60).toString().padStart(2, "0")}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/20">
                <p className="text-muted-foreground mb-1">자세 점수</p>
                <p className="text-lg md:text-2xl font-bold text-accent">{quality}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs md:text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                {isTargetReached ? (
                  <>
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-green-400 font-medium">목표 달성! 스토리를 확인하세요!</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4 text-secondary" />
                    <span>꾸준함이 곧 힘입니다.</span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={toggleVoiceGuide}
                className={`inline-flex items-center gap-1 text-[11px] transition-colors ${
                  isVoiceGuideOn
                    ? "text-green-400 hover:text-green-300"
                    : "text-primary hover:text-secondary"
                }`}
              >
                {isVoiceGuideOn ? (
                  <>
                    <Volume2 className="w-3 h-3" />
                    음성 가이드 ON
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3 h-3" />
                    음성 가이드 OFF
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                type="button"
                onClick={toggleExercise}
                className="w-full h-11 bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground font-semibold shadow-[0_0_24px_oklch(0.7_0.25_260_/_0.6)] hover:scale-[1.02] hover:opacity-95 transition-all duration-300"
              >
                {isRunning ? (
                  <>
                    <PauseCircle className="w-4 h-4 mr-2" />
                    운동 일시 정지
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    운동 시작하기
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={finishExercise}
                className="w-full h-11 bg-muted/40 border-border/40 backdrop-blur-sm hover:bg-muted/60 hover:border-primary/50 transition-all duration-300"
              >
                세션 종료 및 결과 보기
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-card/30 border border-border/30 rounded-3xl text-xs md:text-sm text-muted-foreground">
          <CardContent className="pt-4 space-y-2">
            <p className="font-semibold text-primary text-sm">TIP</p>
            <p>
              운동의 품질은 <span className="text-accent font-medium">속도보다 정렬과 안정성</span>에 더 크게
              영향을 받습니다.
            </p>
            <p>천천히, 그러나 꾸준하게. 오늘의 움직임이 내일의 영웅을 만듭니다.</p>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}