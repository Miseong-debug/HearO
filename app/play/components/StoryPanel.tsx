"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sword, Mountain, Gift, Crown, BookOpen, Play } from "lucide-react"
import { EventType, StoryEvent } from "../hooks/useGameState"

interface StoryPanelProps {
  event: StoryEvent
  onStartExercise: () => void
}

const eventIcons: Record<EventType, React.ReactNode> = {
  story: <BookOpen className="w-6 h-6" />,
  battle: <Sword className="w-6 h-6" />,
  obstacle: <Mountain className="w-6 h-6" />,
  treasure: <Gift className="w-6 h-6" />,
  boss: <Crown className="w-6 h-6" />
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

export default function StoryPanel({ event, onStartExercise }: StoryPanelProps) {
  const isExerciseEvent = event.type !== "story"
  const icon = eventIcons[event.type]
  const label = eventLabels[event.type]
  const colorClass = eventColors[event.type]

  return (
    <Card className="backdrop-blur-xl bg-card/40 border-border/40 rounded-3xl overflow-hidden">
      <CardContent className="p-8">
        {/* 이벤트 타입 배지 */}
        <div className="flex justify-center mb-6">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${colorClass} text-white font-medium`}>
            {icon}
            <span>{label}</span>
          </div>
        </div>

        {/* 내러티브 */}
        <div className="text-center mb-8">
          <p className="text-lg md:text-xl leading-relaxed whitespace-pre-line">
            {event.narrative}
          </p>
        </div>

        {/* 운동 이벤트일 경우 시작 버튼 */}
        {isExerciseEvent && (
          <div className="text-center">
            <div className="mb-4 text-muted-foreground">
              <span className="text-2xl font-bold text-primary">{event.exerciseTarget}회</span>
              <span className="ml-2">팔 들어올리기로 해결하세요!</span>
            </div>

            {event.reward && (
              <p className="text-sm text-muted-foreground mb-6">
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
      </CardContent>
    </Card>
  )
}
