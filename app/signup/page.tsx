"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, UserPlus2, ChevronLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase"

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/"
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [nickname, setNickname] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // 유효성 검사
    if (password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.")
      return
    }

    if (password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.")
      return
    }

    if (nickname.length < 2) {
      setError("닉네임은 최소 2자 이상이어야 합니다.")
      return
    }

    setLoading(true)

    try {
      // Supabase 회원가입
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nickname: nickname,
            created_at: new Date().toISOString()
          }
        }
      })

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          setError("이미 등록된 이메일입니다. 로그인을 시도해주세요.")
        } else if (signUpError.message.includes("Invalid email")) {
          setError("올바른 이메일 형식을 입력해주세요.")
        } else {
          setError(signUpError.message)
        }
        setLoading(false)
        return
      }

      if (data.user) {
        setSuccess(true)
        // 이메일 확인이 필요한 경우
        if (data.user.identities?.length === 0) {
          setError("이미 등록된 이메일입니다.")
          setSuccess(false)
        } else {
          // 3초 후 로그인 페이지로 이동
          setTimeout(() => {
            router.push(`/login${redirect !== "/" ? `?redirect=${redirect}` : ""}`)
          }, 3000)
        }
      }
    } catch (err) {
      setError("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen epic-gradient relative overflow-hidden flex items-center justify-center p-4">
      {/* 배경 효과 */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-40"
          style={{
            background: "radial-gradient(circle, oklch(0.68 0.22 320) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{
            background: "radial-gradient(circle, oklch(0.7 0.25 260) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, oklch(0.98 0.01 285) 1px, transparent 1px)",
            backgroundSize: "45px 45px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8 animate-in fade-in duration-700">
        {/* 홈으로 버튼 */}
        <div className="flex justify-start">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-4 h-4" />
              홈으로
            </Button>
          </Link>
        </div>

        {/* 타이틀 */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent drop-shadow-[0_0_20px_oklch(0.7_0.25_260_/_0.6)]">
            영웅 등록
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            HearO 세계에 합류하여 당신만의 회복 서사를 만들어 보세요.
          </p>
        </div>

        {/* 성공 메시지 */}
        {success && (
          <Card className="border-green-500/50 bg-green-500/10 backdrop-blur-xl">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
              <div>
                <p className="font-semibold text-green-500">영웅 등록 완료!</p>
                <p className="text-sm text-muted-foreground">
                  이메일을 확인하여 계정을 활성화해주세요. 잠시 후 로그인 페이지로 이동합니다...
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {!success && (
          <Card className="relative overflow-hidden backdrop-blur-2xl bg-card/40 border border-border/30 rounded-3xl shadow-[0_0_40px_oklch(0.65_0.25_285_/_0.25)] glow-effect shine-effect">
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                background:
                  "linear-gradient(115deg, transparent, oklch(0.98 0.01 285 / 0.25), transparent)",
              }}
            />
            <CardHeader className="space-y-2 relative z-10">
              <CardTitle className="text-xl font-semibold text-center flex items-center justify-center gap-2">
                <UserPlus2 className="w-5 h-5 text-primary" />
                새로운 영웅 생성
              </CardTitle>
              <CardDescription className="text-center">
                이메일과 닉네임을 입력하고, 모험을 시작할 준비를 해요.
              </CardDescription>
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
                    required
                    placeholder="hero@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="bg-input/40 border border-border/40 backdrop-blur-sm focus:ring-primary/60 focus:border-primary transition-all disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nickname">닉네임 (게임 내 표시명)</Label>
                  <Input
                    id="nickname"
                    type="text"
                    required
                    minLength={2}
                    maxLength={20}
                    placeholder="예: 불굴의 히어로"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    disabled={loading}
                    className="bg-input/40 border border-border/40 backdrop-blur-sm focus:ring-primary/60 focus:border-primary transition-all disabled:opacity-50"
                  />
                  <p className="text-xs text-muted-foreground">2-20자, 다른 영웅들에게 보여질 이름이에요</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">비밀번호</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="bg-input/40 border border-border/40 backdrop-blur-sm focus:ring-primary/60 focus:border-primary transition-all disabled:opacity-50"
                  />
                  <p className="text-xs text-muted-foreground">최소 6자 이상</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm">비밀번호 확인</Label>
                  <Input
                    id="confirm"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    disabled={loading}
                    className={`bg-input/40 border backdrop-blur-sm focus:ring-primary/60 focus:border-primary transition-all disabled:opacity-50 ${
                      confirm && password !== confirm
                        ? "border-red-500/50 focus:border-red-500"
                        : "border-border/40"
                    }`}
                  />
                  {confirm && password !== confirm && (
                    <p className="text-xs text-red-400">비밀번호가 일치하지 않습니다</p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4 relative z-10">
                <Button
                  type="submit"
                  disabled={loading || (confirm !== "" && password !== confirm)}
                  className="w-full h-11 bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground font-semibold shadow-[0_0_24px_oklch(0.7_0.25_260_/_0.6)] hover:scale-[1.02] hover:opacity-95 transition-all duration-300 shine-effect disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      영웅 등록 중...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      영웅으로 등록하기
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  이미 계정이 있나요?{" "}
                  <Link href={`/login${redirect !== "/" ? `?redirect=${redirect}` : ""}`} className="text-primary hover:text-secondary underline underline-offset-4">
                    로그인으로 이동
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </main>
  )
}
