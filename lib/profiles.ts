// 프로필 관리 유틸리티

export interface Profile {
  id: string
  nickname: string
  avatarColor: string
  createdAt: string
  lastPlayedAt?: string
  totalExp: number
  gamesPlayed: number
}

const PROFILES_KEY = "hearo_profiles"
const CURRENT_PROFILE_KEY = "hearo_current_profile"

// 아바타 색상 팔레트
export const AVATAR_COLORS = [
  "#FF6B6B", // 빨강
  "#4ECDC4", // 청록
  "#45B7D1", // 하늘
  "#96CEB4", // 민트
  "#FFEAA7", // 노랑
  "#DDA0DD", // 보라
  "#98D8C8", // 연두
  "#F7DC6F", // 금색
  "#BB8FCE", // 라벤더
  "#85C1E9", // 파랑
]

// 모든 프로필 가져오기
export function getProfiles(): Profile[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(PROFILES_KEY)
  return stored ? JSON.parse(stored) : []
}

// 프로필 저장
export function saveProfiles(profiles: Profile[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
}

// 새 프로필 생성
export function createProfile(nickname: string): Profile {
  const profiles = getProfiles()
  const usedColors = profiles.map(p => p.avatarColor)
  const availableColors = AVATAR_COLORS.filter(c => !usedColors.includes(c))
  const color = availableColors.length > 0
    ? availableColors[Math.floor(Math.random() * availableColors.length)]
    : AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]

  const newProfile: Profile = {
    id: Date.now().toString(),
    nickname,
    avatarColor: color,
    createdAt: new Date().toISOString(),
    totalExp: 0,
    gamesPlayed: 0,
  }

  profiles.push(newProfile)
  saveProfiles(profiles)
  return newProfile
}

// 프로필 삭제
export function deleteProfile(id: string): void {
  const profiles = getProfiles().filter(p => p.id !== id)
  saveProfiles(profiles)

  // 현재 프로필이 삭제된 경우 초기화
  const current = getCurrentProfile()
  if (current?.id === id) {
    localStorage.removeItem(CURRENT_PROFILE_KEY)
  }
}

// 현재 선택된 프로필 가져오기
export function getCurrentProfile(): Profile | null {
  if (typeof window === "undefined") return null
  const currentId = localStorage.getItem(CURRENT_PROFILE_KEY)
  if (!currentId) return null

  const profiles = getProfiles()
  return profiles.find(p => p.id === currentId) || null
}

// 현재 프로필 설정
export function setCurrentProfile(id: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(CURRENT_PROFILE_KEY, id)
}

// 프로필 업데이트 (게임 완료 시 등)
export function updateProfile(id: string, updates: Partial<Profile>): void {
  const profiles = getProfiles()
  const index = profiles.findIndex(p => p.id === id)
  if (index !== -1) {
    profiles[index] = { ...profiles[index], ...updates }
    saveProfiles(profiles)
  }
}

// 프로필 게임 완료 기록
export function recordGameComplete(profileId: string, expEarned: number): void {
  const profiles = getProfiles()
  const profile = profiles.find(p => p.id === profileId)
  if (profile) {
    profile.totalExp += expEarned
    profile.gamesPlayed += 1
    profile.lastPlayedAt = new Date().toISOString()
    saveProfiles(profiles)
  }
}

// 최대 프로필 수
export const MAX_PROFILES = 5
