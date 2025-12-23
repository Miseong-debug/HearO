"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, ImageIcon, Loader2, ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function TestImagePage() {
  const [prompt, setPrompt] = useState("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const examplePrompts = [
    "판타지 RPG 스타일, 용사가 숲에서 슬라임과 마주친 장면",
    "중세 판타지 성 안에서 마법사가 주문을 외우는 장면",
    "우주선 조종석에서 외계 행성을 바라보는 우주 비행사",
    "좀비 아포칼립스 도시에서 생존자가 바리케이드를 치는 장면",
  ]

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError("프롬프트를 입력해주세요")
      return
    }

    setLoading(true)
    setError(null)
    setImageUrl(null)

    try {
      // 판타지 RPG 스타일 프롬프트 강화
      const enhancedPrompt = `fantasy RPG game art style, ${prompt}, vibrant colors, detailed illustration, epic atmosphere, high quality digital art`
      const encodedPrompt = encodeURIComponent(enhancedPrompt)
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${Date.now()}`

      // 이미지 로드 확인
      const img = new Image()
      img.onload = () => {
        setImageUrl(url)
        setLoading(false)
      }
      img.onerror = () => {
        setError("이미지 생성에 실패했습니다. 다시 시도해주세요.")
        setLoading(false)
      }
      img.src = url
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen epic-gradient relative overflow-hidden p-6">
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

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              홈으로
            </Button>
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Gemini 이미지 생성 테스트
          </h1>
          <div className="w-20" />
        </div>

        {/* 입력 섹션 */}
        <Card className="backdrop-blur-xl bg-card/40 border-border/40 rounded-3xl overflow-hidden mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              이미지 프롬프트 입력
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">스토리 텍스트 또는 장면 설명</Label>
              <Input
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="예: 판타지 RPG 스타일, 용사가 숲에서 슬라임과 마주친 장면"
                className="bg-input/40 border-border/40"
                onKeyDown={(e) => e.key === "Enter" && generateImage()}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">예시 프롬프트 (클릭하여 사용)</Label>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(example)}
                    className="px-3 py-1.5 text-xs bg-muted/40 border border-border/40 rounded-full hover:bg-primary/20 hover:border-primary/40 transition-all"
                  >
                    {example.length > 30 ? example.substring(0, 30) + "..." : example}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={generateImage}
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground font-semibold shadow-lg hover:scale-[1.02] transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  이미지 생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  이미지 생성하기
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 에러 메시지 */}
        {error && (
          <Card className="backdrop-blur-xl bg-red-500/10 border-red-500/30 rounded-2xl overflow-hidden mb-6">
            <CardContent className="p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* 결과 섹션 */}
        {imageUrl && (
          <Card className="backdrop-blur-xl bg-card/40 border-border/40 rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-green-500" />
                생성된 이미지
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl overflow-hidden border border-border/40">
                <img
                  src={imageUrl}
                  alt="Generated"
                  className="w-full h-auto"
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Powered by Pollinations.ai
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    window.open(imageUrl, "_blank")
                  }}
                >
                  새 탭에서 보기
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setImageUrl(null)
                  }}
                >
                  초기화
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 로딩 스켈레톤 */}
        {loading && (
          <Card className="backdrop-blur-xl bg-card/40 border-border/40 rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="aspect-square bg-muted/20 rounded-2xl flex items-center justify-center animate-pulse">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
                  <p className="text-muted-foreground">Pollinations.ai가 이미지를 생성하고 있습니다...</p>
                  <p className="text-xs text-muted-foreground/70 mt-2">약 5-15초 소요될 수 있습니다</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
