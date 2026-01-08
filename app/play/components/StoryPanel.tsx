"use client"

import { Button } from "@/components/ui/button"
import { Sword, Mountain, Gift, Crown, BookOpen, Play, Loader2, ChevronRight } from "lucide-react"
import { EventType, StoryEvent } from "../hooks/useGameState"
import { useState, useEffect } from "react"

interface StoryPanelProps {
  event: StoryEvent
  onStartExercise: () => void
  onNextEvent: () => void
  imageUrl: string | null
  isImageLoading: boolean
}

const eventIcons: Record<EventType, React.ReactNode> = {
  story: <BookOpen className="w-5 h-5" />,
  battle: <Sword className="w-5 h-5" />,
  obstacle: <Mountain className="w-5 h-5" />,
  treasure: <Gift className="w-5 h-5" />,
  boss: <Crown className="w-5 h-5" />
}

const eventLabels: Record<EventType, string> = {
  story: "스토리",
  battle: "전투!",
  obstacle: "장애물!",
  treasure: "보물 발견!",
  boss: "보스 등장!"
}

const eventColors: Record<EventType, string> = {
  story: "from-blue-500 to-indigo-500",
  battle: "from-red-500 to-orange-500",
  obstacle: "from-amber-500 to-yellow-500",
  treasure: "from-emerald-500 to-teal-500",
  boss: "from-purple-500 to-pink-500"
}

export default function StoryPanel({ event, onStartExercise, onNextEvent, imageUrl, isImageLoading }: StoryPanelProps) {
  const isExerciseEvent = event.type !== "story"
  const icon = eventIcons[event.type]
  const label = eventLabels[event.type]
  const colorClass = eventColors[event.type]

  // 문장 단위 타이핑 애니메이션
  const [displayedSentences, setDisplayedSentences] = useState<string[]>([])
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)

  // 문장 분리 (마침표, 느낌표, 물음표 기준)
  const sentences = event.narrative.match(/[^.!?]+[.!?]+/g) || [event.narrative]

  useEffect(() => {
    setDisplayedSentences([])
    setCurrentSentenceIndex(0)
    setCurrentCharIndex(0)
    setIsTyping(true)
    setImageLoaded(false)
  }, [event.narrative])

  useEffect(() => {
    if (currentSentenceIndex >= sentences.length) {
      setIsTyping(false)
      return
    }

    const currentSentence = sentences[currentSentenceIndex]

    if (currentCharIndex < currentSentence.length) {
      // 글자 단위 타이핑 (50ms per character - 더 천천히)
      const timer = setTimeout(() => {
        setDisplayedSentences(prev => {
          const newSentences = [...prev]
          newSentences[currentSentenceIndex] = currentSentence.slice(0, currentCharIndex + 1)
          return newSentences
        })
        setCurrentCharIndex(prev => prev + 1)
      }, 50)
      return () => clearTimeout(timer)
    } else {
      // 문장 완료 후 다음 문장으로 (800ms 대기)
      const timer = setTimeout(() => {
        setCurrentSentenceIndex(prev => prev + 1)
        setCurrentCharIndex(0)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [currentSentenceIndex, currentCharIndex, sentences])

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* 배경 이미지 */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black">
        {/* 로딩 표시 */}
        {(isImageLoading || (imageUrl && !imageLoaded)) && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">장면 생성 중...</p>
            </div>
          </div>
        )}

        {/* 이미지 */}
        {imageUrl && (
          <img
            key={imageUrl}
            src={imageUrl}
            alt="Story scene"
            className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{
              animation: imageLoaded ? "slowZoom 20s ease-out forwards" : "none"
            }}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              console.error("이미지 로드 실패:", imageUrl)
              setImageLoaded(true)
            }}
          />
        )}

        {/* 폴백 배경 */}
        {!imageUrl && !isImageLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black" />
        )}

        {/* 이미지 오버레이 (하단 그라데이션) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      {/* 이벤트 타입 배지 (좌상단) */}
      <div className="absolute top-4 left-4 z-10">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${colorClass} text-white text-sm font-medium shadow-lg`}>
          {icon}
          <span>{label}</span>
        </div>
      </div>

      {/* 하단 자막 영역 */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
        {/* 내러티브 (문장별 자막 스타일) */}
        <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-5 mb-4 min-h-[100px]">
          <div className="space-y-2">
            {displayedSentences.map((sentence, index) => (
              <p
                key={index}
                className={`text-white text-lg md:text-xl leading-relaxed font-medium transition-opacity duration-300 ${
                  index < currentSentenceIndex ? "opacity-70" : "opacity-100"
                }`}
              >
                {sentence}
                {index === currentSentenceIndex && isTyping && (
                  <span className="animate-pulse ml-1">|</span>
                )}
              </p>
            ))}
          </div>
        </div>

        {/* 스토리 이벤트일 경우 다음 버튼 */}
        {!isExerciseEvent && !isTyping && (
          <div className="text-center animate-fade-in">
            <Button
              size="lg"
              className="h-14 px-10 text-lg font-semibold bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground shadow-[0_0_30px_oklch(0.7_0.25_260_/_0.5)] hover:scale-105 transition-all"
              onClick={onNextEvent}
            >
              다음으로
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* 운동 이벤트일 경우 시작 버튼 */}
        {isExerciseEvent && !isTyping && (
          <div className="text-center animate-fade-in">
            <div className="mb-3 text-white/90">
              <span className="text-3xl font-bold text-primary drop-shadow-glow">{event.exerciseTarget}회</span>
              <span className="ml-2 text-lg">팔 들어올리기로 해결하세요!</span>
            </div>

            {event.reward && (
              <p className="text-sm text-white/70 mb-4">
                보상: <span className="text-amber-400 font-medium">+{event.reward.exp} 경험치</span>
                {event.reward.item && (
                  <span className="ml-2 text-emerald-400">+ {event.reward.item}</span>
                )}
              </p>
            )}

            <Button
              size="lg"
              className="h-14 px-10 text-lg font-semibold bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground shadow-[0_0_30px_oklch(0.7_0.25_260_/_0.5)] hover:scale-105 transition-all"
              onClick={onStartExercise}
            >
              <Play className="w-5 h-5 mr-2" />
              {event.type === "boss" ? "최종 전투 시작!" : "도전 시작!"}
            </Button>
          </div>
        )}
      </div>

      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slowZoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        .drop-shadow-glow {
          filter: drop-shadow(0 0 10px oklch(0.7 0.25 260 / 0.7));
        }
      `}</style>
    </div>
  )
}
