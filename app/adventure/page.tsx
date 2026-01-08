"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Play,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Check,
  Info
} from "lucide-react"
import { Header } from "@/components/header"
import { getCurrentProfile, getProfiles, Profile } from "@/lib/profiles"
import { ExerciseId, ExerciseConfig, EXERCISE_LIST, getExerciseConfig, DEFAULT_EXERCISE } from "@/lib/exercises"
import { getSavedCalibration } from "@/app/exercise/hooks/useCalibration"

type Theme = "dungeon" | "space" | "zombie" | "healing"

interface ThemeOption {
  id: Theme
  name: string
  description: string
  gradient: string
  image: string // 정적 이미지 경로
  enemies: string
}

// 테마별 정적 이미지 (public/images/themes/)
const themes: ThemeOption[] = [
  {
    id: "dungeon",
    name: "던전/판타지",
    description: "어둠의 던전을 탐험하고 몬스터를 물리치세요",
    gradient: "from-purple-600 via-indigo-600 to-violet-700",
    image: "/images/themes/dungeon.webp",
    enemies: "고블린, 오크, 드래곤"
  },
  {
    id: "space",
    name: "우주/SF",
    description: "광활한 우주를 탐사하고 외계 생명체를 만나세요",
    gradient: "from-blue-600 via-cyan-500 to-teal-500",
    image: "/images/themes/space.webp",
    enemies: "외계인, 운석, AI"
  },
  {
    id: "zombie",
    name: "좀비 서바이벌",
    description: "좀비 아포칼립스에서 살아남으세요",
    gradient: "from-green-700 via-emerald-600 to-lime-600",
    image: "/images/themes/zombie.webp",
    enemies: "좀비, 바리케이드, 감염자"
  },
  {
    id: "healing",
    name: "일상/힐링",
    description: "평화로운 일상 속 소소한 모험을 즐기세요",
    gradient: "from-pink-500 via-rose-500 to-orange-400",
    image: "/images/themes/healing.webp",
    enemies: "고양이, 빵 굽기, 정원 가꾸기"
  }
]

const eventCounts = [
  { value: 3, label: "짧은 모험", description: "약 5-10분" },
  { value: 5, label: "표준 모험", description: "약 10-15분" },
  { value: 7, label: "긴 모험", description: "약 15-20분" }
]

export default function AdventurePage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)
  const [selectedEventCount, setSelectedEventCount] = useState(5)
  const [selectedExercise, setSelectedExercise] = useState<ExerciseConfig>(getExerciseConfig(DEFAULT_EXERCISE))
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 프로필 확인
  useEffect(() => {
    const profiles = getProfiles()

    if (profiles.length === 0) {
      router.push("/profiles")
      return
    }

    const profile = getCurrentProfile()
    if (!profile) {
      router.push("/profiles")
      return
    }

    setCurrentProfile(profile)
    setIsReady(true)
    setIsLoading(false)
  }, [router])

  const handleSelectTheme = (themeId: Theme) => {
    setSelectedTheme(themeId)
  }

  const handleNextStep = () => {
    if (selectedTheme) {
      setStep(2)
    }
  }

  const handlePrevStep = () => {
    setStep(1)
  }

  const handleStartAdventure = () => {
    if (!selectedTheme || !currentProfile) return
    const params = new URLSearchParams({
      theme: selectedTheme,
      events: selectedEventCount.toString(),
      nickname: currentProfile.nickname,
      profileId: currentProfile.id,
      exercise: selectedExercise.id
    })
    router.push(`/play?${params.toString()}`)
  }

  if (isLoading || !isReady) {
    return (
      <main className="min-h-screen epic-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </main>
    )
  }

  const selectedThemeData = themes.find(t => t.id === selectedTheme)

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
      <Header />

      {/* 메인 콘텐츠 */}
      <section className="relative z-10 px-6 pb-12">
        <div className="max-w-4xl mx-auto">

          {/* Step 1: 게임 모드 선택 */}
          {step === 1 && (
            <>
              {/* 타이틀 */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-sm text-primary mb-4">
                  <Sparkles className="w-4 h-4" />
                  STEP 1 - 게임 모드 선택
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  어떤 세계로 떠나시겠습니까?
                </h1>
                <p className="text-muted-foreground">
                  원하는 모험의 테마를 선택하세요
                </p>
              </div>

              {/* 게임 모드 카드 그리드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                {themes.map((theme) => (
                  <Card
                    key={theme.id}
                    className={`cursor-pointer transition-all duration-300 border-2 rounded-2xl overflow-hidden ${
                      selectedTheme === theme.id
                        ? "border-primary shadow-[0_0_40px_oklch(0.65_0.25_285_/_0.5)] scale-[1.02]"
                        : "border-border/40 hover:border-border/60 hover:shadow-xl hover:scale-[1.01]"
                    }`}
                    onClick={() => handleSelectTheme(theme.id)}
                  >
                    {/* 이미지 영역 */}
                    <div className="relative h-44 overflow-hidden">
                      {/* 그라데이션 배경 (폴백) */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />

                      {/* 정적 이미지 */}
                      <img
                        src={theme.image}
                        alt={theme.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          // 이미지 로드 실패 시 숨김 (그라데이션 배경 표시)
                          e.currentTarget.style.display = "none"
                        }}
                      />

                      {/* 그라데이션 오버레이 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                      {/* 선택 표시 */}
                      {selectedTheme === theme.id && (
                        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg z-20">
                          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* 텍스트 영역 */}
                    <CardContent className="p-5 bg-card/60 backdrop-blur-sm">
                      <h3 className="text-xl font-bold mb-2">{theme.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {theme.description}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        등장: {theme.enemies}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* 다음 버튼 */}
              <div className="text-center">
                <Button
                  size="lg"
                  className={`h-14 px-10 text-lg font-semibold transition-all ${
                    selectedTheme
                      ? "bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground shadow-[0_0_30px_oklch(0.7_0.25_260_/_0.5)] hover:scale-105"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                  disabled={!selectedTheme}
                  onClick={handleNextStep}
                >
                  다음 단계
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
                {!selectedTheme && (
                  <p className="text-sm text-muted-foreground mt-3">
                    게임 모드를 선택해주세요
                  </p>
                )}
              </div>
            </>
          )}

          {/* Step 2: 모험 설정 */}
          {step === 2 && selectedThemeData && (
            <>
              {/* 타이틀 */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-sm text-primary mb-4">
                  <Sparkles className="w-4 h-4" />
                  STEP 2 - 모험 설정
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  모험을 준비하세요
                </h1>
                <p className="text-muted-foreground">
                  <span className={`font-semibold bg-gradient-to-r ${selectedThemeData.gradient} bg-clip-text text-transparent`}>
                    {selectedThemeData.name}
                  </span>
                  {" "}모험의 설정을 완료하세요
                </p>
              </div>

              {/* 선택된 테마 미니 카드 */}
              <div className="max-w-md mx-auto mb-8">
                <div className="relative rounded-xl overflow-hidden h-24">
                  {/* 그라데이션 배경 */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${selectedThemeData.gradient}`} />

                  {/* 정적 이미지 */}
                  <img
                    src={selectedThemeData.image}
                    alt={selectedThemeData.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />

                  <div className="absolute inset-0 bg-black/50" />
                  <div className="absolute inset-0 flex items-center gap-4 p-5 text-white">
                    <div>
                      <p className="text-sm opacity-80">선택된 모드</p>
                      <p className="font-bold text-xl">{selectedThemeData.name}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 모험 설정 */}
              <div className="max-w-2xl mx-auto space-y-8">
                {/* 현재 프로필 표시 */}
                {currentProfile && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-center">플레이어</h3>
                    <div className="flex items-center justify-center gap-4 p-4 bg-card/30 border border-border/40 rounded-xl">
                      <div
                        className="w-14 h-14 rounded-lg flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                        style={{ backgroundColor: currentProfile.avatarColor }}
                      >
                        {currentProfile.nickname.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-lg">{currentProfile.nickname}</p>
                        <p className="text-sm text-muted-foreground">
                          총 {currentProfile.totalExp.toLocaleString()} EXP · {currentProfile.gamesPlayed}회 플레이
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 모험 길이 선택 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-center">모험 길이</h3>
                  <div className="flex justify-center gap-3">
                    {eventCounts.map((option) => (
                      <button
                        key={option.value}
                        className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
                          selectedEventCount === option.value
                            ? "border-primary bg-primary/20 text-primary"
                            : "border-border/40 bg-card/30 text-muted-foreground hover:border-border/60"
                        }`}
                        onClick={() => setSelectedEventCount(option.value)}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs opacity-70">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 운동 부위 선택 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-center flex items-center justify-center gap-2">
                    <Dumbbell className="w-5 h-5" />
                    운동 부위
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {EXERCISE_LIST.map((exercise) => {
                      const isSelected = selectedExercise.id === exercise.id
                      const savedCalibration = getSavedCalibration(exercise.id)
                      const hasCalibration = savedCalibration !== null

                      return (
                        <button
                          key={exercise.id}
                          className={`relative p-5 rounded-2xl border-2 transition-all text-left ${
                            isSelected
                              ? `border-primary bg-gradient-to-br ${exercise.gradient} text-white shadow-lg scale-[1.02]`
                              : "border-border/40 bg-card/30 hover:border-border/60 hover:bg-card/50"
                          }`}
                          onClick={() => setSelectedExercise(exercise)}
                        >
                          {/* 선택 표시 */}
                          {isSelected && (
                            <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white flex items-center justify-center">
                              <Check className="w-4 h-4 text-primary" />
                            </div>
                          )}

                          {/* 아이콘 */}
                          <div className="text-4xl mb-3">{exercise.icon}</div>

                          {/* 이름 */}
                          <div className={`font-bold text-lg ${isSelected ? "text-white" : ""}`}>
                            {exercise.name}
                          </div>

                          {/* 영문명 */}
                          <div className={`text-sm mt-1 ${isSelected ? "text-white/80" : "text-muted-foreground"}`}>
                            {exercise.nameEn}
                          </div>

                          {/* 캘리브레이션 상태 */}
                          {hasCalibration && (
                            <div className={`mt-3 text-xs font-medium ${isSelected ? "text-white/90" : "text-green-500"}`}>
                              ✓ 캘리브레이션 완료
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* 선택된 운동 설명 */}
                  <div className="mt-6 p-5 bg-card/40 border border-border/40 rounded-2xl">
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${selectedExercise.gradient} flex items-center justify-center text-3xl flex-shrink-0 shadow-lg`}>
                        {selectedExercise.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-xl mb-1">{selectedExercise.name}</div>
                        <div className="text-base text-muted-foreground">{selectedExercise.description}</div>
                        <div className="text-sm text-muted-foreground/80 mt-2">{selectedExercise.instruction}</div>
                      </div>
                    </div>

                    {/* 자세 안내 (setup이 있는 운동) */}
                    {selectedExercise.setup && (
                      <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="text-sm font-semibold text-amber-400 mb-1">시작 전 자세 안내</div>
                            <div className="text-sm text-amber-200/90 whitespace-pre-line leading-relaxed">
                              {selectedExercise.setup}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 버튼들 */}
              <div className="flex justify-center gap-4 mt-10">
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg"
                  onClick={handlePrevStep}
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  이전
                </Button>
                <Button
                  type="button"
                  size="lg"
                  className="h-14 px-10 text-lg font-semibold transition-all bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground shadow-[0_0_30px_oklch(0.7_0.25_260_/_0.5)] hover:scale-105"
                  onClick={handleStartAdventure}
                >
                  <Play className="w-5 h-5 mr-2" />
                  모험 시작!
                </Button>
              </div>
            </>
          )}

        </div>
      </section>
    </main>
  )
}
