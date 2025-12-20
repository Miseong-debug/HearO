"use client"

import { useState } from "react"
import { WORLDVIEW_LIST, type Worldview } from "@/lib/story/worldviews"

interface WorldviewSelectorProps {
  selectedId: string
  onSelect: (worldview: Worldview) => void
}

// 세계관별 이모지/아이콘
const WORLDVIEW_ICONS: Record<string, string> = {
  fantasy: "🏰",
  scifi: "🚀",
  martial: "⚔️",
  healing: "🌿",
  steampunk: "⚙️",
  underwater: "🌊",
}

// 세계관별 배경 그라데이션
const WORLDVIEW_GRADIENTS: Record<string, string> = {
  fantasy: "from-purple-600 to-pink-500",
  scifi: "from-cyan-500 to-blue-600",
  martial: "from-red-600 to-orange-500",
  healing: "from-green-500 to-emerald-400",
  steampunk: "from-amber-600 to-yellow-500",
  underwater: "from-blue-500 to-teal-400",
}

export default function WorldviewSelector({
  selectedId,
  onSelect,
}: WorldviewSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const selectedWorldview = WORLDVIEW_LIST.find((w) => w.id === selectedId)

  return (
    <div className="w-full">
      {/* 선택된 세계관 표시 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full p-4 rounded-xl bg-gradient-to-r ${
          WORLDVIEW_GRADIENTS[selectedId] || "from-gray-600 to-gray-500"
        } text-white shadow-lg transition-all hover:shadow-xl`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{WORLDVIEW_ICONS[selectedId]}</span>
            <div className="text-left">
              <div className="font-bold">{selectedWorldview?.nameKo}</div>
              <div className="text-sm opacity-80">{selectedWorldview?.description}</div>
            </div>
          </div>
          <span className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}>
            ▼
          </span>
        </div>
      </button>

      {/* 세계관 목록 */}
      {isExpanded && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {WORLDVIEW_LIST.map((worldview) => (
            <button
              key={worldview.id}
              onClick={() => {
                onSelect(worldview)
                setIsExpanded(false)
              }}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedId === worldview.id
                  ? `border-white bg-gradient-to-r ${WORLDVIEW_GRADIENTS[worldview.id]} text-white`
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{WORLDVIEW_ICONS[worldview.id]}</span>
                <div className="text-left">
                  <div className={`font-medium text-sm ${
                    selectedId === worldview.id ? "text-white" : "text-gray-900"
                  }`}>
                    {worldview.nameKo}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// 간단한 세계관 카드 컴포넌트 (온보딩용)
export function WorldviewCard({
  worldview,
  isSelected,
  onClick,
}: {
  worldview: Worldview
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl transition-all ${
        isSelected
          ? `bg-gradient-to-r ${WORLDVIEW_GRADIENTS[worldview.id]} text-white shadow-lg scale-105`
          : "bg-white border-2 border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{WORLDVIEW_ICONS[worldview.id]}</span>
        <div className="text-left flex-1">
          <div className={`font-bold ${isSelected ? "text-white" : "text-gray-900"}`}>
            {worldview.nameKo}
          </div>
          <div className={`text-sm ${isSelected ? "text-white/80" : "text-gray-500"}`}>
            {worldview.description}
          </div>
        </div>
      </div>
    </button>
  )
}
