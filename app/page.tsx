import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Trophy, Sparkles, Activity, BookOpen, Camera, Dumbbell, BookText, ChevronRight } from "lucide-react"
import { Header } from "@/components/header"

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
      <Header />

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
          <Link href="/profiles">
            <Button
              size="lg"
              className="h-14 px-8 text-lg bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground font-semibold shadow-[0_0_30px_oklch(0.7_0.25_260_/_0.5)] hover:scale-105 transition-all"
            >
              <Play className="w-5 h-5 mr-2" />
              모험 시작하기
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
                Gemini AI가 만든 스토리 속에서 운동으로 적을 물리치고 모험을 진행하세요.
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

      {/* 작동 방식 섹션 */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">작동 방식</h2>
          <p className="text-muted-foreground text-center mb-12">3단계로 시작하는 나만의 영웅 모험</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mx-auto mb-4 flex items-center justify-center shadow-[0_0_30px_oklch(0.6_0.2_220_/_0.3)]">
                <Camera className="w-10 h-10 text-white" />
              </div>
              <div className="text-4xl font-bold text-primary mb-2">1</div>
              <h3 className="font-semibold mb-2">카메라 켜기</h3>
              <p className="text-sm text-muted-foreground">웹캠을 허용하면 AI가 자세를 인식할 준비 완료</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mx-auto mb-4 flex items-center justify-center shadow-[0_0_30px_oklch(0.6_0.25_300_/_0.3)]">
                <Dumbbell className="w-10 h-10 text-white" />
              </div>
              <div className="text-4xl font-bold text-secondary mb-2">2</div>
              <h3 className="font-semibold mb-2">운동하기</h3>
              <p className="text-sm text-muted-foreground">화면의 가이드를 따라 운동하면 실시간 점수 피드백</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 mx-auto mb-4 flex items-center justify-center shadow-[0_0_30px_oklch(0.7_0.2_60_/_0.3)]">
                <BookText className="w-10 h-10 text-white" />
              </div>
              <div className="text-4xl font-bold text-accent mb-2">3</div>
              <h3 className="font-semibold mb-2">스토리 진행</h3>
              <p className="text-sm text-muted-foreground">운동을 완료하면 AI가 다음 스토리를 생성</p>
            </div>
          </div>
        </div>
      </section>

      {/* 화면 미리보기 섹션 */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">실제 화면 미리보기</h2>
          <p className="text-muted-foreground text-center mb-10">이렇게 운동하고, 스토리를 진행해요</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="backdrop-blur-xl bg-card/30 border-border/40 rounded-3xl overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center relative">
                  <div className="absolute inset-4 border-2 border-dashed border-primary/30 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="w-12 h-12 text-primary/50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">운동 화면</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">실시간 포즈 인식 & 점수 표시</p>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 px-3 py-1 bg-primary/20 rounded-full text-xs text-primary">
                    LIVE
                  </div>
                  <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 rounded-lg text-sm">
                    점수: 85점
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1">운동 모드</h3>
                  <p className="text-sm text-muted-foreground">카메라로 자세를 인식하고 실시간 피드백을 받아요</p>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-card/30 border-border/40 rounded-3xl overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center relative p-6">
                  <div className="text-center">
                    <div className="text-4xl mb-3">🐉</div>
                    <p className="text-sm text-white/90 leading-relaxed">
                      &ldquo;용사여, 드래곤이 마을을 위협하고 있다!<br />
                      스쿼트 10회로 방어막을 만들어라!&rdquo;
                    </p>
                  </div>
                  <div className="absolute top-4 left-4 px-3 py-1 bg-amber-500/20 rounded-full text-xs text-amber-400">
                    Chapter 3
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1">스토리 모드</h3>
                  <p className="text-sm text-muted-foreground">AI가 생성한 스토리 속에서 영웅이 되어보세요</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ 섹션 */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">자주 묻는 질문</h2>
          <div className="space-y-4">
            <Card className="backdrop-blur-xl bg-card/30 border-border/40 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">어떤 장비가 필요한가요?</h3>
                <p className="text-sm text-muted-foreground">
                  웹캠이 있는 컴퓨터나 카메라가 있는 스마트폰만 있으면 됩니다. 별도의 장비나 앱 설치가 필요 없습니다.
                </p>
              </CardContent>
            </Card>
            <Card className="backdrop-blur-xl bg-card/30 border-border/40 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">어떤 운동을 할 수 있나요?</h3>
                <p className="text-sm text-muted-foreground">
                  팔 들어올리기, 스쿼트 등 재활에 도움이 되는 다양한 운동을 스토리와 함께 진행합니다. AI가 실시간으로 자세를 분석해 피드백을 제공합니다.
                </p>
              </CardContent>
            </Card>
            <Card className="backdrop-blur-xl bg-card/30 border-border/40 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">무료인가요?</h3>
                <p className="text-sm text-muted-foreground">
                  네, HearO는 완전 무료입니다. 회원가입 후 모든 기능을 제한 없이 사용할 수 있습니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 팀 소개 섹션 */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">HearO 팀</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            재활이 지루하지 않도록, 운동이 모험이 되도록.<br />
            HearO는 더 나은 재활 경험을 만들기 위해 노력합니다.
          </p>
          <div className="flex justify-center gap-4">
            <Card className="backdrop-blur-xl bg-card/30 border-border/40 rounded-2xl overflow-hidden flex-1 max-w-xs">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center text-2xl">
                  🎮
                </div>
                <h3 className="font-semibold mb-1">게이미피케이션</h3>
                <p className="text-xs text-muted-foreground">운동을 게임처럼 재미있게</p>
              </CardContent>
            </Card>
            <Card className="backdrop-blur-xl bg-card/30 border-border/40 rounded-2xl overflow-hidden flex-1 max-w-xs">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-pink-500 mx-auto mb-4 flex items-center justify-center text-2xl">
                  🤖
                </div>
                <h3 className="font-semibold mb-1">AI 기술</h3>
                <p className="text-xs text-muted-foreground">정확한 자세 분석과 스토리 생성</p>
              </CardContent>
            </Card>
            <Card className="backdrop-blur-xl bg-card/30 border-border/40 rounded-2xl overflow-hidden flex-1 max-w-xs">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 mx-auto mb-4 flex items-center justify-center text-2xl">
                  ❤️
                </div>
                <h3 className="font-semibold mb-1">사용자 중심</h3>
                <p className="text-xs text-muted-foreground">누구나 쉽게 사용할 수 있도록</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 하단 CTA 섹션 */}
      <section className="relative z-10 px-6 pb-20">
        <Card className="max-w-3xl mx-auto backdrop-blur-xl bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 border-primary/30 rounded-3xl overflow-hidden">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              지금 바로 영웅이 되어보세요
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              카메라만 있으면 어디서든 시작할 수 있습니다.<br />
              오늘의 운동이 내일의 영웅을 만듭니다.
            </p>
            <Link href="/profiles">
              <Button
                size="lg"
                className="h-14 px-8 text-lg bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground font-semibold shadow-[0_0_30px_oklch(0.7_0.25_260_/_0.5)] hover:scale-105 transition-all"
              >
                모험 시작하기
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* 푸터 */}
      <footer className="relative z-10 border-t border-border/20 py-8 px-6 text-center text-sm text-muted-foreground">
        <p>© 2025 HearO. 당신의 재활을 응원합니다.</p>
      </footer>
    </main>
  )
}
