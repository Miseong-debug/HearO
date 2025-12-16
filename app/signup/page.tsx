"use client"

import Link from "next/link"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, UserPlus2 } from "lucide-react"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [nickname, setNickname] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: 회원가입 로직 추가 (Supabase / Firebase 등)
    console.log("Signup:", { email, nickname, password, confirm })
  }

  return (
    <main className="min-h-screen epic-gradient relative overflow-hidden flex items-center justify-center p-4">
      {/* 배경 오브 + 그리드 (전역 layout에도 있지만 여기선 좀 더 강조) */}
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
        {/* 타이틀 */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent drop-shadow-[0_0_20px_oklch(0.7_0.25_260_/_0.6)]">
            영웅 등록
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            HearO 세계에 합류하여 당신만의 회복 서사를 만들어 보세요.
          </p>
        </div>

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
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="hero@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-input/40 border border-border/40 backdrop-blur-sm focus:ring-primary/60 focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname">닉네임</Label>
                <Input
                  id="nickname"
                  type="text"
                  required
                  placeholder="예: 불굴의 히어로"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="bg-input/40 border border-border/40 backdrop-blur-sm focus:ring-primary/60 focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-input/40 border border-border/40 backdrop-blur-sm focus:ring-primary/60 focus:border-primary transition-all"
                />
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
                  className="bg-input/40 border border-border/40 backdrop-blur-sm focus:ring-primary/60 focus:border-primary transition-all"
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 relative z-10">
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground font-semibold shadow-[0_0_24px_oklch(0.7_0.25_260_/_0.6)] hover:scale-[1.02] hover:opacity-95 transition-all duration-300 shine-effect"
              >
                <Shield className="w-4 h-4 mr-2" />
                영웅으로 등록하기
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                이미 계정이 있나요?{" "}
                <Link href="/login" className="text-primary hover:text-secondary underline underline-offset-4">
                  로그인으로 이동
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  )
}
