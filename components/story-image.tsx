"use client"

import { useState, useEffect } from "react"
import { getStageInfo, getPlaceholderUrl, getThemeDisplayName, type StoryTheme } from "@/lib/story-images"

interface StoryImageProps {
  theme: StoryTheme
  progress: number // 0-100
  className?: string
  showInfo?: boolean
}

export function StoryImage({ theme, progress, className = "", showInfo = true }: StoryImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const stageInfo = getStageInfo(theme, progress)

  // progress 변경 시 상태 리셋
  useEffect(() => {
    setImageError(false)
    setIsLoading(true)
  }, [theme, progress])

  // 이미지 URL 결정 (로컬 이미지가 실패하면 placeholder 사용)
  const imageSrc = imageError
    ? getPlaceholderUrl(theme, stageInfo.stage)
    : stageInfo.imagePath

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      {/* 로딩 스켈레톤 */}
      {isLoading && (
        <div className="absolute inset-0 bg-muted/30 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* 이미지 */}
      <img
        src={imageSrc}
        alt={stageInfo.name}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          if (!imageError) {
            setImageError(true)
          }
          setIsLoading(false)
        }}
      />

      {/* 스테이지 정보 오버레이 */}
      {showInfo && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-primary/30 rounded-full text-xs text-primary-foreground">
              {getThemeDisplayName(theme)}
            </span>
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs text-white">
              Stage {stageInfo.stage}/6
            </span>
          </div>
          <h3 className="text-lg font-bold text-white">{stageInfo.name}</h3>
          <p className="text-sm text-white/80">{stageInfo.description}</p>
        </div>
      )}

      {/* 진행도 바 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-black/30">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

// 미니 버전 (진행도 표시용)
interface StoryImageMiniProps {
  theme: StoryTheme
  stage: number
  isActive?: boolean
  isCompleted?: boolean
  onClick?: () => void
}

export function StoryImageMini({ theme, stage, isActive = false, isCompleted = false, onClick }: StoryImageMiniProps) {
  const [imageError, setImageError] = useState(false)
  const stageInfo = getStageInfo(theme, (stage / 6) * 100)

  const imageSrc = imageError
    ? getPlaceholderUrl(theme, stage)
    : stageInfo.imagePath

  return (
    <button
      onClick={onClick}
      className={`relative w-16 h-16 rounded-lg overflow-hidden transition-all ${
        isActive
          ? "ring-2 ring-primary scale-110 z-10"
          : isCompleted
          ? "opacity-100"
          : "opacity-50 grayscale"
      }`}
    >
      <img
        src={imageSrc}
        alt={`Stage ${stage}`}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
      {isCompleted && (
        <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-center py-0.5">
        <span className="text-[10px] text-white">{stage}</span>
      </div>
    </button>
  )
}

// 진행도 타임라인
interface StoryProgressTimelineProps {
  theme: StoryTheme
  currentProgress: number
}

export function StoryProgressTimeline({ theme, currentProgress }: StoryProgressTimelineProps) {
  const currentStage = Math.ceil((currentProgress / 100) * 6) || 1

  return (
    <div className="flex items-center justify-center gap-2">
      {[1, 2, 3, 4, 5, 6].map((stage) => (
        <StoryImageMini
          key={stage}
          theme={theme}
          stage={stage}
          isActive={stage === currentStage}
          isCompleted={stage < currentStage}
        />
      ))}
    </div>
  )
}
