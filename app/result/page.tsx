"use client"

import { Suspense, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Home, Loader2, Play, RefreshCw, Volume2 } from "lucide-react"
import { useSearchParams } from "next/navigation"

type Theme = "fantasy" | "scifi" | "zombie" | "sports" | "healing"

export default function ResultPage() {
  return (
    <Suspense fallback={<ResultLoading />}>
      <ResultContent />
    </Suspense>
  )
}

function ResultLoading() {
  return (
    <main className="min-h-screen epic-gradient flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p>로딩 중...</p>
      </div>
    </main>
  )
}

function ResultContent() {
  const searchParams = useSearchParams()

  const reps = Number(searchParams.get("reps") ?? 0)
  const score = Number(searchParams.get("score") ?? 0)
  const duration = Number(searchParams.get("duration") ?? 0)
  const themeParam = (searchParams.get("theme") ?? "fantasy") as Theme

  const [theme] = useState<Theme>(themeParam)
  const [story, setStory] = useState<string>("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const [loading, setLoading] = useState<boolean>(true)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)

  // 페이지 진입 시 스토리 + 이미지 생성
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)

        // 1) 스토리 생성
        const storyRes = await fetch("/api/generate/story", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme, reps, score, duration }),
        })
        const storyData = await storyRes.json()
        setStory(storyData.story ?? "")

        // 2) 이미지 생성
        const prompt = `
Rehabilitation themed hero illustration.
The character is doing calm rehab exercise, not intense workout.
Theme: ${theme}
Reps: ${reps}, Pose score: ${score}, Duration: ${duration} seconds.
Style: soft glow, hopeful atmosphere, concept art quality, no text, dark background with subtle gradients.
        `.trim()

        const imageRes = await fetch("/api/generate/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        })

        const imageData = await imageRes.json()
        setImageUrl(imageData.image ?? null)
      } catch (error) {
        console.error("결과 생성 중 오류:", error)
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [theme, reps, score, duration])

  // TTS 재생 (Web Speech API - 무료)
  const handlePlayTTS = () => {
    if (!story || isPlaying) return

    const utterance = new SpeechSynthesisUtterance(story)
    utterance.lang = "ko-KR"
    utterance.rate = 0.9
    utterance.pitch = 1

    utterance.onstart = () => setIsPlaying(true)
    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)

    window.speechSynthesis.speak(utterance)
  }

  const loadingText = "오늘의 영웅 서사를 준비하는 중입니다..."

  return (
    <main className="min-h-screen epic-gradient relative overflow-hidden flex items-center justify-center p-4 md:p-8">
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-6 md:gap-8">
        
        {/* 왼쪽: 이미지 + 스토리 카드 */}
        <Card className="relative overflow-hidden backdrop-blur-2xl bg-card/40 border border-border/40 rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between gap-4 relative z-10">
            <div>
              <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                오늘의 영웅 서사
              </CardTitle>
              <CardDescription>
                오늘의 재활 운동 기록을 바탕으로 AI가 이미지와 이야기를 만들어줍니다.
              </CardDescription>
            </div>
            <span className="px-3 py-1 rounded-full bg-muted/40 text-[11px] text-muted-foreground">
              {theme.toUpperCase()} MODE
            </span>
          </CardHeader>

          <CardContent className="space-y-4 relative z-10">
            {/* 이미지 영역 */}
            <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-black/40 h-[220px] md:h-[280px] lg:h-[320px] flex items-center justify-center">
              {loading && (
                <div className="flex flex-col items-center gap-3 text-muted-foreground text-sm">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <p className="text-center px-4">{loadingText}</p>
                </div>
              )}

              {!loading && imageUrl && (
                <Image
                  src={imageUrl}
                  alt="AI generated hero illustration"
                  fill
                  className="object-cover"
                  unoptimized
                />
              )}

              {!loading && !imageUrl && (
                <p className="text-xs md:text-sm text-muted-foreground px-4 text-center">
                  이미지를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
                </p>
              )}
            </div>

            {/* 스토리 영역 */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-primary uppercase tracking-[0.15em]">
                STORY
              </h2>
              {loading ? (
                <p className="text-sm text-muted-foreground">{loadingText}</p>
              ) : (
                <p className="text-sm md:text-base leading-relaxed text-foreground/90 whitespace-pre-line">
                  {story}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              오늘의 선택이 당신의 내일을 바꾸고 있습니다.
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={loading || !story}
              onClick={() => speakStory(story)}

              className="inline-flex items-center gap-1 bg-muted/40 border-border/40 backdrop-blur-sm hover:bg-muted/60 hover:border-primary/50 transition-all"
            >
              <Volume2 className="w-4 h-4" />
              {isPlaying ? "다시 듣기" : "스토리 듣기"}
            </Button>
          </CardFooter>
        </Card>

        {/* 오른쪽: 오늘의 요약 & 버튼들 */}
        <Card className="backdrop-blur-2xl bg-card/40 border border-border/40 rounded-3xl flex flex-col">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-secondary" />
              오늘의 성장 요약
            </CardTitle>
            <CardDescription>
              운동 데이터를 기반으로 한 요약입니다.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/20">
                <p className="text-muted-foreground text-xs mb-1">운동 지속 시간</p>
                <p className="text-lg font-bold">{Math.floor(duration / 60)}분</p>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/20">
                <p className="text-muted-foreground text-xs mb-1">추정 반복 횟수</p>
                <p className="text-lg font-bold">{reps}회</p>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/20">
                <p className="text-muted-foreground text-xs mb-1">자세 품질 점수</p>
                <p className="text-lg font-bold text-accent">{score}점</p>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/20">
                <p className="text-muted-foreground text-xs mb-1">성장 포인트</p>
                <p className="text-lg font-bold text-primary">+{Math.floor(score / 5)}</p>
              </div>
            </div>

            <div className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              이 세션은{" "}
              <span className="text-primary font-medium">균형과 안정성 향상</span>에 특히 도움이 되었습니다.
              비슷한 난이도의 운동을 2~3회 더 반복하면, 다음 단계의 스토리가 열립니다.
            </div>
          </CardContent>

          <CardFooter className="mt-auto flex flex-col gap-3">
            <Link href="/exercise" className="w-full">
              <Button className="w-full h-11 bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground font-semibold hover:scale-[1.02] hover:opacity-95 transition-all">
                <Play className="w-4 h-4 mr-2" />
                다음 운동 이어가기
              </Button>
            </Link>
            <Link href="/" className="w-full">
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 bg-muted/40 border-border/40 hover:bg-muted/60"
              >
                <Home className="w-4 h-4 mr-1" />
                홈으로
              </Button>
            </Link>
          </CardFooter>
        </Card>

      </div>
    </main>
  )
  
}

const speakStory = (text: string) => {
  if (!("speechSynthesis" in window)) {
    alert("이 브라우저는 음성 재생을 지원하지 않습니다.")
    return
  }

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = "ko-KR"
  utterance.rate = 0.95   // 말 속도
  utterance.pitch = 1.0   // 음높이
  utterance.volume = 1.0

  window.speechSynthesis.cancel() // 중복 방지
  window.speechSynthesis.speak(utterance)
}
