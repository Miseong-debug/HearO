"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Headphones, Sparkles, Shield, Swords, ChevronLeft, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/"
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!supabase) {
      // Supabase not configured - use localStorage fallback
      const localUser = {
        email,
        nickname: email.split("@")[0],
        isGuest: false,
        loginAt: new Date().toISOString()
      }
      localStorage.setItem("hearo_user", JSON.stringify(localUser))
      router.push(redirect)
      setLoading(false)
      return
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        if (signInError.message.includes("Invalid login credentials")) {
          setError("이메일 또는 비밀번호가 올바르지 않습니다.")
        } else if (signInError.message.includes("Email not confirmed")) {
          setError("이메일 인증이 필요합니다. 이메일을 확인해주세요.")
        } else {
          setError(signInError.message)
        }
        setLoading(false)
        return
      }

      if (data.user) {
        router.push(redirect)
        router.refresh()
      }
    } catch (err) {
      setError("로그인 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    setError(null)
    setLoading(true)

    // localStorage 폴백 (Supabase 없이도 동작)
    const guestUser = {
      email: "guest@hearo.app",
      nickname: "용감한 모험가",
      isGuest: true,
      loginAt: new Date().toISOString()
    }

    if (!supabase) {
      localStorage.setItem("hearo_user", JSON.stringify(guestUser))
      router.push(redirect)
      setLoading(false)
      return
    }

    try {
      // 게스트 계정으로 로그인 (익명 인증)
      const { data, error: signInError } = await supabase.auth.signInAnonymously()

      if (signInError) {
        // 익명 인증이 비활성화된 경우 localStorage 폴백
        localStorage.setItem("hearo_user", JSON.stringify(guestUser))
        router.push(redirect)
        return
      }

      if (data.user) {
        // 게스트 사용자 메타데이터 업데이트
        await supabase.auth.updateUser({
          data: { nickname: "용감한 모험가", isGuest: true }
        })
        router.push(redirect)
        router.refresh()
      }
    } catch (err) {
      // 에러 시 localStorage 폴백
      localStorage.setItem("hearo_user", JSON.stringify(guestUser))
      router.push(redirect)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">

      {/* ===== 홈으로 버튼 ===== */}
      <div className="flex justify-start">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4" />
            홈으로
          </Button>
        </Link>
      </div>

      {/* ===== LOGO ===== */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative group">

            {/* BACKLIGHT */}
            <div className="absolute inset-0 rounded-full blur-3xl opacity-30 animate-pulse"
              style={{
                background: "radial-gradient(circle, oklch(0.65 0.25 285) 0%, transparent 70%)"
              }}
            />

            {/* MAIN ICON */}
            <div className="relative p-6 rounded-3xl
              bg-gradient-to-br from-primary via-secondary to-accent
              shadow-[0_0_25px_oklch(0.65_0.25_285_/_0.7)]
              glow-effect shine-effect">

              <Headphones className="w-16 h-16 text-primary-foreground drop-shadow-[0_0_15px_oklch(0.98_0.01_285_/_0.8)]" />
            </div>
          </div>
        </div>

        {/* TITLE */}
        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tight bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent drop-shadow-[0_0_25px_oklch(0.7_0.25_260_/_0.5)]">
            HearO
          </h1>

          <p className="text-xl text-muted-foreground flex items-center justify-center gap-2 leading-relaxed">
            <Sparkles className="w-5 h-5 text-secondary animate-pulse" />
            <span>당신의 영웅 서사가 시작됩니다</span>
            <Sparkles className="w-5 h-5 text-accent animate-pulse" style={{ animationDelay: "1s" }} />
          </p>
        </div>
      </div>

      {/* ===== LOGIN CARD ===== */}
      <Card className="
        relative overflow-hidden
        backdrop-blur-2xl bg-card/40
        border border-border/30
        rounded-3xl
        shadow-[0_0_40px_oklch(0.65_0.25_285_/_0.2)]
        glow-effect shine-effect">

        {/* Light overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background: "linear-gradient(115deg, transparent, oklch(0.98 0.01 285 / 0.3), transparent)"
          }}
        />

        <CardHeader className="space-y-2 relative z-10">
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            영웅의 문
          </CardTitle>
          <CardDescription className="text-center">계정으로 로그인하여 모험을 계속하세요</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 relative z-10">
            {/* 에러 메시지 */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="hero@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="bg-input/40 border border-border/40 backdrop-blur-sm focus:ring-primary/60 focus:border-primary transition-all disabled:opacity-50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-input/40 border border-border/40 backdrop-blur-sm focus:ring-primary/60 focus:border-primary transition-all disabled:opacity-50"
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 relative z-10">
            <Button
              type="submit"
              disabled={loading}
              className="
              w-full h-12 text-base font-semibold
              bg-gradient-to-r from-primary via-accent to-secondary
              text-primary-foreground
              shadow-[0_0_25px_oklch(0.7_0.25_260_/_0.6)]
              hover:scale-[1.03] hover:opacity-95
              transition-all duration-300
              shine-effect disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  접속 중...
                </>
              ) : (
                <>
                  <Swords className="w-5 h-5 mr-2" />
                  모험 시작하기
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={loading}
              className="w-full bg-muted/40 border-border/40 backdrop-blur-sm hover:bg-muted/60 hover:border-primary/50 transition-all duration-300 disabled:opacity-50"
              onClick={handleGuestLogin}
            >
              게스트로 시작하기
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              아직 영웅이 아니신가요?{" "}
              <Link href="/signup" className="text-primary hover:text-secondary underline underline-offset-4">
                영웅 등록하기
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>

      {/* THEMES */}
      <div className="text-center space-y-3 opacity-80">
        <p className="text-sm text-muted-foreground">선택 가능한 세계</p>
        <div className="flex flex-wrap justify-center gap-2">
          {["Fantasy", "Sci-Fi", "Zombie", "Sports", "Spy", "K-pop Idol"].map((theme, index) => (
            <div
              key={theme}
              style={{ animationDelay: `${index * 0.1}s` }}
              className="
              px-3 py-1.5 rounded-full
              bg-muted/30 border border-border/30
              backdrop-blur-sm text-xs text-muted-foreground
              hover:bg-primary/20 hover:text-primary hover:border-primary/50
              cursor-pointer transition-all duration-300"
            >
              {theme}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
