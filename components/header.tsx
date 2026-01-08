"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Loader2, Users } from "lucide-react"
import { getCurrentProfile, getProfiles, Profile } from "@/lib/profiles"

export function Header() {
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null)
  const [hasProfiles, setHasProfiles] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const profiles = getProfiles()
    setHasProfiles(profiles.length > 0)
    const profile = getCurrentProfile()
    setCurrentProfile(profile)
    setLoading(false)
  }, [])

  return (
    <header className="relative z-10 flex items-center justify-between p-6 md:p-8">
      <Link href="/" className="flex items-center gap-1 group">
        <img
          src="/HearOLogo.png"
          alt="HearO"
          className="h-20 w-auto transition-transform group-hover:scale-105"
        />
        <div className="flex flex-col -ml-1">
          <span
            className="text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent leading-none"
          >
            HearO
          </span>
          <span className="text-[10px] text-muted-foreground/70 tracking-widest uppercase">
            Rehab RPG
          </span>
        </div>
      </Link>

      {loading ? (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/40 border border-border/40 backdrop-blur-sm">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex items-center gap-3">
          {currentProfile ? (
            <Link href="/profiles">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/40 border border-border/40 backdrop-blur-sm hover:bg-muted/60 transition-colors cursor-pointer">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: currentProfile.avatarColor }}
                >
                  {currentProfile.nickname.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{currentProfile.nickname}</span>
                <Users className="w-3 h-3 text-muted-foreground" />
              </div>
            </Link>
          ) : hasProfiles ? (
            <Link href="/profiles">
              <Button variant="outline" size="sm" className="bg-muted/40 border-border/40 backdrop-blur-sm hover:bg-muted/60">
                <Users className="w-4 h-4 mr-1" />
                프로필 선택
              </Button>
            </Link>
          ) : (
            <Link href="/profiles">
              <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg hover:opacity-90">
                시작하기
              </Button>
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
