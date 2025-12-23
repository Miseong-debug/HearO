"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Headphones, LogOut, User, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export function Header() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    // 현재 세션 확인
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // 인증 상태 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    localStorage.removeItem("hearo_user") // 게스트 로그인 정리
    setUser(null)
    setLoggingOut(false)
    router.refresh()
  }

  const getNickname = () => {
    if (user?.user_metadata?.nickname) {
      return user.user_metadata.nickname
    }
    if (user?.email) {
      return user.email.split("@")[0]
    }
    if (user?.is_anonymous) {
      return "용감한 모험가"
    }
    return "영웅"
  }

  const isGuest = user?.is_anonymous || user?.user_metadata?.isGuest

  return (
    <header className="relative z-10 flex items-center justify-between p-6 md:p-8">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center shadow-lg">
          <Headphones className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight">HearO</span>
      </Link>

      {loading ? (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/40 border border-border/40 backdrop-blur-sm">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      ) : user ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/40 border border-border/40 backdrop-blur-sm">
            <User className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{getNickname()}</span>
            {isGuest && (
              <span className="text-xs text-muted-foreground">(게스트)</span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={loggingOut}
            className="bg-muted/40 border-border/40 backdrop-blur-sm hover:bg-muted/60 disabled:opacity-50"
          >
            {loggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <LogOut className="w-4 h-4 mr-1" />
                로그아웃
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Link href="/login">
            <Button variant="outline" className="bg-muted/40 border-border/40 backdrop-blur-sm hover:bg-muted/60">
              로그인
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg hover:opacity-90">
              회원가입
            </Button>
          </Link>
        </div>
      )}
    </header>
  )
}
