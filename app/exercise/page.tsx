"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Flame, PauseCircle, PlayCircle, Target, Volume2, VolumeX, Camera as CameraIcon, Trophy, Minus, Plus, Sparkles, RotateCcw, ChevronLeft, Dumbbell } from "lucide-react"
import dynamic from "next/dynamic"
import { useVoiceGuide } from "./hooks/useVoiceGuide"
import WorldviewSelector from "@/components/WorldviewSelector"
import { WORLDVIEW_LIST, type Worldview } from "@/lib/story/worldviews"
import { AngleInfo } from "./hooks/useAngle"
import { getSavedCalibration, clearCalibrationStorage } from "./hooks/useCalibration"
import { ExerciseId, ExerciseConfig, EXERCISE_LIST, getExerciseConfig, DEFAULT_EXERCISE } from "@/lib/exercises"
import ExerciseSelector, { SetupGuideModal } from "@/components/ExerciseSelector"

// Camera 컴포넌트를 클라이언트에서만 로드 (MediaPipe는 SSR 불가)
const Camera = dynamic(() => import("./camera"), { ssr: false })

type PageStep = "select-exercise" | "exercise"

export default function ExercisePage() {
  const router = useRouter()

  // 페이지 단계
  const [step, setStep] = useState<PageStep>("select-exercise")

  // 선택된 운동
  const [selectedExercise, setSelectedExercise] = useState<ExerciseConfig>(getExerciseConfig(DEFAULT_EXERCISE))
  const [showSetupGuide, setShowSetupGuide] = useState(false)

  // 운동 상태
  const [isRunning, setIsRunning] = useState(false)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [reps, setReps] = useState(0)
  const [duration, setDuration] = useState(0)
  const [angles, setAngles] = useState<AngleInfo | null>(null)
  const [targetReps, setTargetReps] = useState(10)
  const [isTargetReached, setIsTargetReached] = useState(false)
  const [isVoiceGuideOn, setIsVoiceGuideOn] = useState(false)
  const [selectedWorldview, setSelectedWorldview] = useState<Worldview>(WORLDVIEW_LIST[0])
  const [userName, setUserName] = useState("용사")
  const [chapter, setChapter] = useState(1)
  const [baselineAngle, setBaselineAngle] = useState<number | null>(null)
  const [cameraKey, setCameraKey] = useState(0)
  const [hasSavedCalibration, setHasSavedCalibration] = useState(false)

  const voiceGuide = useVoiceGuide()

  // 선택된 운동의 저장된 캘리브레이션 확인
  useEffect(() => {
    const saved = getSavedCalibration(selectedExercise.id)
    if (saved) {
      setBaselineAngle(saved.baselineAngle)
      setHasSavedCalibration(true)
    } else {
      setBaselineAngle(null)
      setHasSavedCalibration(false)
    }
  }, [selectedExercise.id])

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

  // 타이머
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

  // 운동 선택 후 시작
  const handleSelectExercise = (exercise: ExerciseConfig) => {
    setSelectedExercise(exercise)
  }

  const handleStartExercise = () => {
    // setup 안내가 있는 운동이면 모달 표시
    if (selectedExercise.setup) {
      setShowSetupGuide(true)
    } else {
      setStep("exercise")
    }
  }

  const handleSetupConfirm = () => {
    setShowSetupGuide(false)
    setStep("exercise")
  }

  const handleBackToSelect = () => {
    setStep("select-exercise")
    setIsCameraReady(false)
    setIsRunning(false)
    setReps(0)
    setDuration(0)
    setIsTargetReached(false)
  }

  const startCamera = () => {
    setIsCameraReady(true)
  }

  const finishExercise = () => {
    if (isVoiceGuideOn) {
      voiceGuide.announceFinish(reps, 0)
    }
    const params = new URLSearchParams({
      reps: String(reps),
      duration: String(duration),
      targetReps: String(targetReps),
      worldview: selectedWorldview.id,
      userName: userName,
      chapter: String(chapter),
      exercise: selectedExercise.id,
    })
    setTimeout(() => {
      router.push(`/result?${params.toString()}`)
    }, isVoiceGuideOn ? 2000 : 0)
  }

  const handleRepCount = (count: number) => {
    setReps(count)
    if (isVoiceGuideOn) {
      voiceGuide.announceRep(count, targetReps)
    }
  }

  const handleTargetReached = () => {
    setIsTargetReached(true)
    if (isVoiceGuideOn) {
      voiceGuide.announceTargetReached()
    }
  }

  const handleAngleUpdate = (newAngles: AngleInfo) => {
    setAngles(newAngles)
  }

  const handleCalibrationComplete = (angle: number) => {
    setBaselineAngle(angle)
    setHasSavedCalibration(true)
    console.log(`[Exercise] ${selectedExercise.name} 캘리브레이션 완료, 기준 각도:`, angle)
  }

  const resetCalibration = () => {
    clearCalibrationStorage(selectedExercise.id)
    setBaselineAngle(null)
    setHasSavedCalibration(false)
    setReps(0)
    setCameraKey(prev => prev + 1)
  }

  // 운동 선택 화면
  if (step === "select-exercise") {
    return (
      <main className="min-h-screen epic-gradient relative overflow-hidden">
        {/* 자세 안내 모달 */}
        {showSetupGuide && (
          <SetupGuideModal
            exercise={selectedExercise}
            onConfirm={handleSetupConfirm}
            onCancel={() => setShowSetupGuide(false)}
          />
        )}

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-sm text-primary mb-4">
              <Dumbbell className="w-4 h-4" />
              재활 운동 선택
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              어떤 운동을 하시겠습니까?
            </h1>
            <p className="text-muted-foreground">
              원하는 재활 운동을 선택하세요
            </p>
          </div>

          {/* 운동 선택 그리드 */}
          <ExerciseSelector
            selectedId={selectedExercise.id}
            onSelect={handleSelectExercise}
          />

          {/* 시작 버튼 */}
          <div className="mt-8 text-center">
            <Button
              size="lg"
              className={`h-14 px-10 text-lg font-semibold transition-all bg-gradient-to-r ${selectedExercise.gradient} text-white shadow-lg hover:scale-105`}
              onClick={handleStartExercise}
            >
              <span className="text-2xl mr-2">{selectedExercise.icon}</span>
              {selectedExercise.name} 시작
            </Button>
          </div>
        </div>
      </main>
    )
  }

  // 운동 화면
  return (
    <main className="min-h-screen epic-gradient relative overflow-hidden flex flex-col md:flex-row gap-4 p-4 md:p-8">
      {/* 왼쪽: 카메라 영역 */}
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
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToSelect}
                className="p-2 hover:bg-muted/40 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <span className="text-2xl">{selectedExercise.icon}</span>
                  {selectedExercise.name}
                </CardTitle>
                <CardDescription>{selectedExercise.instruction}</CardDescription>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${selectedExercise.gradient} text-white text-xs`}>
              {selectedExercise.nameEn}
            </span>
          </CardHeader>

          <CardContent className="relative z-10 h-full">
            <div className="relative mt-2 h-[260px] md:h-[360px] rounded-2xl border border-border/40 bg-black/40 overflow-hidden flex items-center justify-center">
              {isCameraReady ? (
                <Camera
                  key={cameraKey}
                  onRepCount={handleRepCount}
                  onAngleUpdate={handleAngleUpdate}
                  onTargetReached={handleTargetReached}
                  onCalibrationComplete={handleCalibrationComplete}
                  isRunning={isRunning}
                  targetReps={targetReps}
                  exerciseId={selectedExercise.id}
                />
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-xs md:text-sm text-muted-foreground text-center px-4">
                    카메라를 활성화하여 자세를 실시간으로 추적하세요.
                  </p>
                  <Button
                    onClick={startCamera}
                    variant="outline"
                    className={`bg-gradient-to-r ${selectedExercise.gradient} border-0 text-white hover:opacity-90`}
                  >
                    <CameraIcon className="w-4 h-4 mr-2" />
                    카메라 활성화
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs md:text-sm text-muted-foreground leading-relaxed">
              <div>
                {isCameraReady ? (
                  baselineAngle !== null ? (
                    <span className="text-green-400">
                      ✓ 캘리브레이션 {hasSavedCalibration ? "(저장됨)" : ""} - 기준: {baselineAngle}°
                    </span>
                  ) : (
                    <span className="text-yellow-400">⏳ 캘리브레이션 대기 중...</span>
                  )
                ) : (
                  selectedExercise.setup || "카메라를 활성화하세요"
                )}
              </div>
              {isCameraReady && baselineAngle !== null && (
                <button
                  onClick={resetCalibration}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  초기화
                </button>
              )}
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
                <p className="text-muted-foreground mb-1">현재 각도</p>
                <p className="text-lg md:text-2xl font-bold text-accent">
                  {angles ? `${angles.leftElbow}°` : "-"}
                </p>
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
                    음성 ON
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3 h-3" />
                    음성 OFF
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                type="button"
                onClick={toggleExercise}
                className={`w-full h-11 bg-gradient-to-r ${selectedExercise.gradient} text-white font-semibold shadow-lg hover:scale-[1.02] hover:opacity-95 transition-all duration-300`}
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

        {/* 세계관 선택 */}
        <Card className="backdrop-blur-xl bg-card/30 border border-border/30 rounded-3xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              스토리 세계관
            </CardTitle>
            <CardDescription className="text-xs">
              운동 후 생성될 스토리의 세계관을 선택하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WorldviewSelector
              selectedId={selectedWorldview.id}
              onSelect={setSelectedWorldview}
            />
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
