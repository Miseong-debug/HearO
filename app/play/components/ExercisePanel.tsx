"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StoryEvent } from "../hooks/useGameState"
import { Camera as CameraIcon, CheckCircle, Swords } from "lucide-react"
import { AngleInfo } from "@/app/exercise/hooks/useAngle"
import { ExerciseId, getExerciseConfig, DEFAULT_EXERCISE } from "@/lib/exercises"

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
  onUpdate: (reps: number, angles: AngleInfo | null) => void
  currentReps: number
  currentAngles: AngleInfo | null
  exerciseId?: ExerciseId
}

export default function ExercisePanel({
  event,
  onComplete,
  onUpdate,
  currentReps,
  currentAngles,
  exerciseId = DEFAULT_EXERCISE
}: ExercisePanelProps) {
  const exerciseConfig = getExerciseConfig(exerciseId)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [isTargetReached, setIsTargetReached] = useState(false)

  const targetReps = event.exerciseTarget || 10

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
    onUpdate(count, currentAngles)
  }

  // 각도 콜백
  const handleAngleUpdate = (angles: AngleInfo) => {
    onUpdate(currentReps, angles)
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
    <div className="space-y-4 relative z-50">
      {/* 상단: 상태 표시 */}
      <Card className="backdrop-blur-xl bg-card/40 border-border/40 rounded-2xl">
        <CardContent className="p-4">
          {/* 운동 정보 */}
          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border/30">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${exerciseConfig.gradient} flex items-center justify-center text-xl`}>
              {exerciseConfig.icon}
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{exerciseConfig.name}</div>
              <div className="text-xs text-muted-foreground">{exerciseConfig.instruction}</div>
            </div>
          </div>

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

          {/* 관절 각도 표시 */}
          {currentAngles && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">왼팔꿈치</span>
                <span className="font-medium text-blue-400">{currentAngles.leftElbow}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">오른팔꿈치</span>
                <span className="font-medium text-blue-400">{currentAngles.rightElbow}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">왼어깨</span>
                <span className="font-medium text-purple-400">{currentAngles.leftShoulder}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">오른어깨</span>
                <span className="font-medium text-purple-400">{currentAngles.rightShoulder}°</span>
              </div>
            </div>
          )}
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
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <Camera
                onRepCount={handleRepCount}
                onAngleUpdate={handleAngleUpdate}
                onTargetReached={handleTargetReached}
                isRunning={isRunning}
                targetReps={targetReps}
                exerciseId={exerciseId}
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
