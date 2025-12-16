import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Headphones, Play, Trophy, Sparkles, Activity, BookOpen, ChevronRight } from "lucide-react"

export default function Home() {
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
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle, oklch(0.98 0.01 285) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* 헤더 */}
      <header className="relative z-10 flex items-center justify-between p-6 md:p-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center shadow-lg">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">HearO</span>
        </div>
        <Link href="/login">
          <Button variant="outline" className="bg-muted/40 border-border/40 backdrop-blur-sm">
            로그인
          </Button>
        </Link>
      </header>

      {/* 히어로 섹션 */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-16 md:py-24">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-sm text-primary mb-6">
          <Sparkles className="w-4 h-4" />
          AI 기반 재활 운동 플랫폼
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl leading-tight">
          당신의{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">
            영웅 서사
          </span>
          가<br />시작됩니다
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          MediaPipe 포즈 인식으로 정확한 자세를 추적하고,
          <br className="hidden md:block" />
          AI가 만들어주는 나만의 RPG 스토리로 재활 운동을 즐겁게.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/exercise">
            <Button
              size="lg"
              className="h-14 px-8 text-lg bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground font-semibold shadow-[0_0_30px_oklch(0.7_0.25_260_/_0.5)] hover:scale-105 transition-all"
            >
              <Play className="w-5 h-5 mr-2" />
              운동 시작하기
            </Button>
          </Link>
          <Link href="/history">
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-lg bg-muted/40 border-border/40 backdrop-blur-sm hover:bg-muted/60"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              내 스토리 보기
            </Button>
          </Link>
        </div>
      </section>

      {/* 기능 소개 */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="backdrop-blur-xl bg-card/30 border-border/40 rounded-3xl overflow-hidden group hover:shadow-[0_0_40px_oklch(0.65_0.25_285_/_0.3)] transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">실시간 포즈 인식</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                MediaPipe로 33개 관절을 실시간 추적하고, 자세 품질을 점수로 피드백합니다.
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-card/30 border-border/40 rounded-3xl overflow-hidden group hover:shadow-[0_0_40px_oklch(0.65_0.25_285_/_0.3)] transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI 스토리 생성</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Gemini AI가 운동 결과를 바탕으로 나만의 RPG 영웅 서사를 만들어줍니다.
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-card/30 border-border/40 rounded-3xl overflow-hidden group hover:shadow-[0_0_40px_oklch(0.65_0.25_285_/_0.3)] transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">목표 달성 시스템</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                효과음과 음성 가이드로 동기부여하고, 목표 달성 시 팡파레로 축하합니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="relative z-10 px-6 pb-20">
        <Card className="max-w-3xl mx-auto backdrop-blur-xl bg-card/40 border-border/40 rounded-3xl overflow-hidden">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              오늘의 움직임이 내일의 영웅을 만듭니다
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              지금 바로 시작하세요. 카메라만 있으면 어디서든 재활 운동을 할 수 있습니다.
            </p>
            <Link href="/exercise">
              <Button
                size="lg"
                className="h-12 px-6 bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground font-semibold shadow-[0_0_24px_oklch(0.7_0.25_260_/_0.5)] hover:scale-105 transition-all"
              >
                무료로 시작하기
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* 푸터 */}
      <footer className="relative z-10 border-t border-border/20 py-8 px-6 text-center text-sm text-muted-foreground">
        <p>© 2024 HearO. 당신의 재활을 응원합니다.</p>
      </footer>
    </main>
  )
}
