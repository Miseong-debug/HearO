"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Sword,
  Rocket,
  Skull,
  Heart,
  ChevronLeft,
  Play,
  Sparkles
} from "lucide-react"

type Theme = "dungeon" | "space" | "zombie" | "healing"

interface ThemeOption {
  id: Theme
  name: string
  description: string
  icon: React.ReactNode
  gradient: string
  enemies: string
}

const themes: ThemeOption[] = [
  {
    id: "dungeon",
    name: "던전/판타지",
    description: "어둠의 던전을 탐험하고 몬스터를 물리치세요",
    icon: <Sword className="w-8 h-8" />,
    gradient: "from-purple-500 to-indigo-600",
    enemies: "고블린, 오크, 드래곤"
  },
  {
    id: "space",
    name: "우주/SF",
    description: "광활한 우주를 탐사하고 외계 생명체를 만나세요",
    icon: <Rocket className="w-8 h-8" />,
    gradient: "from-blue-500 to-cyan-500",
    enemies: "외계인, 운석, AI"
  },
  {
    id: "zombie",
    name: "좀비 서바이벌",
    description: "좀비 아포칼립스에서 살아남으세요",
    icon: <Skull className="w-8 h-8" />,
    gradient: "from-green-600 to-emerald-500",
    enemies: "좀비, 바리케이드, 감염자"
  },
  {
    id: "healing",
    name: "일상/힐링",
    description: "평화로운 일상 속 소소한 모험을 즐기세요",
    icon: <Heart className="w-8 h-8" />,
    gradient: "from-pink-400 to-rose-500",
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
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)
  const [selectedEventCount, setSelectedEventCount] = useState(5)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 로그인 상태 확인 (localStorage에서 사용자 정보 확인)
    const user = localStorage.getItem("hearo_user")
    if (!user) {
      // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
      router.push("/login?redirect=/adventure")
      return
    }
    setIsLoggedIn(true)
    setIsLoading(false)
  }, [router])

  const handleStartAdventure = () => {
    if (!selectedTheme) return
    router.push(`/play?theme=${selectedTheme}&events=${selectedEventCount}`)
  }

  // 로딩 중이거나 로그인 안된 경우 (리다이렉트 중)
  if (isLoading || !isLoggedIn) {
    return (
      <main className="min-h-screen epic-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </main>
    )
  }

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
      <header className="relative z-10 flex items-center justify-between p-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            홈으로
          </Button>
        </Link>
      </header>

      {/* 메인 콘텐츠 */}
      <section className="relative z-10 px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* 타이틀 */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-sm text-primary mb-4">
              <Sparkles className="w-4 h-4" />
              모험을 선택하세요
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              어떤 세계로 떠나시겠습니까?
            </h1>
            <p className="text-muted-foreground">
              테마를 선택하고 나만의 영웅 서사를 시작하세요
            </p>
          </div>

          {/* 테마 선택 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {themes.map((theme) => (
              <Card
                key={theme.id}
                className={`cursor-pointer transition-all duration-300 backdrop-blur-xl bg-card/30 border-2 rounded-2xl overflow-hidden ${
                  selectedTheme === theme.id
                    ? "border-primary shadow-[0_0_30px_oklch(0.65_0.25_285_/_0.4)] scale-[1.02]"
                    : "border-border/40 hover:border-border/60 hover:shadow-lg"
                }`}
                onClick={() => setSelectedTheme(theme.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white shrink-0`}>
                      {theme.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold mb-1">{theme.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {theme.description}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        등장: {theme.enemies}
                      </p>
                    </div>
                    {selectedTheme === theme.id && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 이벤트 수 선택 */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-4 text-center">모험 길이 선택</h2>
            <div className="flex justify-center gap-3">
              {eventCounts.map((option) => (
                <button
                  key={option.value}
                  className={`px-5 py-3 rounded-xl border-2 transition-all ${
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

          {/* 시작 버튼 */}
          <div className="text-center">
            <Button
              size="lg"
              className={`h-14 px-10 text-lg font-semibold transition-all ${
                selectedTheme
                  ? "bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground shadow-[0_0_30px_oklch(0.7_0.25_260_/_0.5)] hover:scale-105"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
              disabled={!selectedTheme}
              onClick={handleStartAdventure}
            >
              <Play className="w-5 h-5 mr-2" />
              모험 시작하기
            </Button>
            {!selectedTheme && (
              <p className="text-sm text-muted-foreground mt-3">
                테마를 선택해주세요
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
