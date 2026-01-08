"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Play, Trophy, Gamepad2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Profile,
  getProfiles,
  createProfile,
  deleteProfile,
  setCurrentProfile,
  MAX_PROFILES,
  AVATAR_COLORS,
} from "@/lib/profiles"

export default function ProfilesPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [newNickname, setNewNickname] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    setProfiles(getProfiles())
  }, [])

  const handleSelectProfile = (profile: Profile) => {
    setCurrentProfile(profile.id)
    router.push("/adventure")
  }

  const handleCreateProfile = () => {
    if (newNickname.trim().length < 2) return
    if (profiles.length >= MAX_PROFILES) return

    createProfile(newNickname.trim())
    setProfiles(getProfiles())
    setNewNickname("")
    setIsDialogOpen(false)
  }

  const handleDeleteProfile = (id: string) => {
    deleteProfile(id)
    setProfiles(getProfiles())
    setDeleteConfirmId(null)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "플레이 기록 없음"
    const date = new Date(dateString)
    return `마지막 플레이: ${date.toLocaleDateString("ko-KR")}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
      {/* 로고 */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">HearO</h1>
        <p className="text-slate-400">누가 플레이하나요?</p>
      </div>

      {/* 프로필 그리드 */}
      <div className="flex flex-wrap justify-center gap-6 max-w-4xl">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="group relative"
          >
            {/* 삭제 확인 */}
            {deleteConfirmId === profile.id ? (
              <div className="w-32 h-44 flex flex-col items-center justify-center bg-slate-800/80 rounded-lg p-3">
                <p className="text-white text-sm text-center mb-3">삭제할까요?</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteProfile(profile.id)}
                  >
                    삭제
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteConfirmId(null)}
                  >
                    취소
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => handleSelectProfile(profile)}
                className="cursor-pointer transition-transform hover:scale-105"
              >
                {/* 아바타 */}
                <div
                  className="w-32 h-32 rounded-lg flex items-center justify-center text-5xl font-bold text-white shadow-lg mb-3 relative overflow-hidden"
                  style={{ backgroundColor: profile.avatarColor }}
                >
                  {profile.nickname.charAt(0).toUpperCase()}
                  {/* 호버 시 플레이 아이콘 */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-10 h-10 text-white" />
                  </div>
                </div>

                {/* 닉네임 */}
                <p className="text-white text-center font-medium truncate w-32">
                  {profile.nickname}
                </p>

                {/* 통계 */}
                <div className="flex justify-center gap-3 mt-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    {profile.totalExp.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Gamepad2 className="w-3 h-3" />
                    {profile.gamesPlayed}
                  </span>
                </div>

                {/* 삭제 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteConfirmId(profile.id)
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </div>
            )}
          </div>
        ))}

        {/* 프로필 추가 버튼 */}
        {profiles.length < MAX_PROFILES && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <div className="cursor-pointer transition-transform hover:scale-105">
                <div className="w-32 h-32 rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center mb-3 hover:border-slate-400 transition-colors">
                  <Plus className="w-12 h-12 text-slate-500" />
                </div>
                <p className="text-slate-400 text-center">프로필 추가</p>
              </div>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">새 프로필 만들기</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="nickname" className="text-slate-300">
                    닉네임
                  </Label>
                  <Input
                    id="nickname"
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    placeholder="닉네임을 입력하세요"
                    className="mt-2 bg-slate-800 border-slate-600 text-white"
                    maxLength={20}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateProfile()
                    }}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    2-20자 사이로 입력해주세요
                  </p>
                </div>

                {/* 미리보기 */}
                {newNickname.trim().length >= 2 && (
                  <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg">
                    <div
                      className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold text-white"
                      style={{
                        backgroundColor:
                          AVATAR_COLORS[
                            Math.floor(Math.random() * AVATAR_COLORS.length)
                          ],
                      }}
                    >
                      {newNickname.trim().charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{newNickname.trim()}</p>
                      <p className="text-slate-400 text-sm">새로운 영웅</p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleCreateProfile}
                  disabled={newNickname.trim().length < 2}
                  className="w-full"
                >
                  프로필 만들기
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* 안내 메시지 */}
      {profiles.length === 0 && (
        <p className="text-slate-500 mt-8 text-center">
          아직 프로필이 없습니다.<br />
          프로필을 추가해서 모험을 시작하세요!
        </p>
      )}

      {/* 최대 프로필 수 안내 */}
      {profiles.length >= MAX_PROFILES && (
        <p className="text-slate-500 mt-8 text-sm">
          최대 {MAX_PROFILES}개의 프로필을 만들 수 있습니다
        </p>
      )}
    </div>
  )
}
