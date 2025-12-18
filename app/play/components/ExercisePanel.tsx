"use client"

import { useRef, useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StoryEvent } from "../hooks/useGameState"
import { Camera as CameraIcon, CheckCircle, Swords } from "lucide-react"

// 카메라 컴포넌트 동적 로드
const Camera = dynamic(() => import("@/app/exercise/camera"), {
  ssr: false,
  loading: () => (
    <div className="aspect-video bg-muted/20 rounded-2xl flex items-center justify-center">
      <p className="text-muted-foreground">카메라 로딩 중...</p>
    </div>
  )
})

interface ExercisePanelProps {
  event: StoryEvent
  onComplete: () => void
  onUpdate: (reps: number, score: number) => void
  currentReps: number
  currentScore: number
}

export default function ExercisePanel({
  event,
  onComplete,
  onUpdate,
  currentReps,
  currentScore
}: ExercisePanelProps) {
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [isTargetReached, setIsTargetReached] = useState(false)
  const latestScoreRef = useRef(currentScore)

  const targetReps = event.exerciseTarget || 10

  // 점수 업데이트 추적
  useEffect(() => {
    latestScoreRef.current = currentScore
  }, [currentScore])

  // 카메라 시작
  const startCamera = () => {
    setIsCameraReady(true)
  }

  // 운동 시작
  const startExercise = () => {
    setIsRunning(true)
  }

  // 반복 수 콜백
  const handleRepCount = (count: number) => {
    onUpdate(count, latestScoreRef.current)
  }

  // 점수 콜백
  const handleScoreUpdate = (score: number) => {
    onUpdate(currentReps, score)
  }

  // 목표 달성 콜백
  const handleTargetReached = () => {
    setIsTargetReached(true)
    setIsRunning(false)
  }

  // 진행률 계산
  const progress = Math.min((currentReps / targetReps) * 100, 100)

  // 적 HP 바 (진행률의 역)
  const enemyHp = Math.max(100 - progress, 0)

  return (
    <div className="space-y-4">
      {/* 상단: 상태 표시 */}
      <Card className="backdrop-blur-xl bg-card/40 border-border/40 rounded-2xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-red-400" />
              <span className="font-medium">전투 중!</span>
            </div>
            <div className="text-sm">
              <span className="text-primary font-bold text-lg">{currentReps}</span>
              <span className="text-muted-foreground">/{targetReps}회</span>
            </div>
          </div>

          {/* 적 HP 바 */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>적 HP</span>
              <span>{Math.round(enemyHp)}%</span>
            </div>
            <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-300"
                style={{ width: `${enemyHp}%` }}
              />
            </div>
          </div>

          {/* 자세 점수 */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">자세 점수</span>
            <span className={`font-medium ${currentScore >= 70 ? "text-green-400" : currentScore >= 50 ? "text-amber-400" : "text-red-400"}`}>
              {currentScore}점
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 카메라 영역 */}
      <Card className="backdrop-blur-xl bg-card/40 border-border/40 rounded-2xl overflow-hidden">
        <CardContent className="p-4">
          {!isCameraReady ? (
            <div className="aspect-video bg-muted/20 rounded-xl flex flex-col items-center justify-center gap-4">
              <CameraIcon className="w-12 h-12 text-muted-foreground" />
              <Button onClick={startCamera} variant="outline">
                카메라 활성화
              </Button>
            </div>
          ) : (
            <div className="relative">
              <Camera
                onRepCount={handleRepCount}
                onScoreUpdate={handleScoreUpdate}
                onTargetReached={handleTargetReached}
                isRunning={isRunning}
                targetReps={targetReps}
              />

              {/* 운동 시작 오버레이 */}
              {!isRunning && !isTargetReached && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-accent"
                    onClick={startExercise}
                  >
                    운동 시작
                  </Button>
                </div>
              )}

              {/* 목표 달성 오버레이 */}
              {isTargetReached && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-xl gap-4">
                  <CheckCircle className="w-16 h-16 text-green-400" />
                  <p className="text-xl font-bold text-white">목표 달성!</p>
                  <p className="text-amber-400">+{event.reward?.exp || 0} 경험치</p>
                  <Button
                    size="lg"
                    className="mt-2 bg-gradient-to-r from-primary to-accent"
                    onClick={onComplete}
                  >
                    다음으로
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
