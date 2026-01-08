"use client"

import { ExerciseId, ExerciseConfig, EXERCISE_LIST, getExerciseConfig } from "@/lib/exercises"
import { getSavedCalibration } from "@/app/exercise/hooks/useCalibration"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Clock } from "lucide-react"

interface ExerciseSelectorProps {
  selectedId: ExerciseId
  onSelect: (exercise: ExerciseConfig) => void
  compact?: boolean
}

export default function ExerciseSelector({
  selectedId,
  onSelect,
  compact = false,
}: ExerciseSelectorProps) {
  return (
    <div className={`grid gap-3 ${compact ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
      {EXERCISE_LIST.map((exercise) => {
        const isSelected = selectedId === exercise.id
        const savedCalibration = getSavedCalibration(exercise.id)
        const hasCalibration = savedCalibration !== null

        return (
          <Card
            key={exercise.id}
            className={`cursor-pointer transition-all duration-200 border-2 rounded-xl overflow-hidden ${
              isSelected
                ? "border-primary shadow-[0_0_20px_oklch(0.65_0.25_285_/_0.4)] scale-[1.02]"
                : "border-border/40 hover:border-border/60 hover:shadow-lg hover:scale-[1.01]"
            }`}
            onClick={() => onSelect(exercise)}
          >
            <CardContent className={`${compact ? "p-3" : "p-4"}`}>
              <div className="flex items-start gap-3">
                {/* 아이콘 */}
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${exercise.gradient} flex items-center justify-center text-2xl shadow-md`}
                >
                  {exercise.icon}
                </div>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-bold ${compact ? "text-sm" : "text-base"}`}>
                      {exercise.name}
                    </h3>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  {!compact && (
                    <>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {exercise.nameEn}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {exercise.description}
                      </p>
                    </>
                  )}

                  {/* 캘리브레이션 상태 */}
                  <div className="flex items-center gap-2 mt-2">
                    {hasCalibration ? (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                        <Check className="w-2.5 h-2.5" />
                        보정됨 ({savedCalibration.baselineAngle}°)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground border border-border/30">
                        <Clock className="w-2.5 h-2.5" />
                        보정 필요
                      </span>
                    )}

                    {exercise.setup && (
                      <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        자세 안내 있음
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 확장 정보 (비컴팩트 모드) */}
              {!compact && (
                <div className="mt-3 pt-3 border-t border-border/20 text-xs text-muted-foreground">
                  <p>{exercise.instruction}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// 자세 안내 모달 컴포넌트
interface SetupGuideModalProps {
  exercise: ExerciseConfig
  onConfirm: () => void
  onCancel: () => void
}

export function SetupGuideModal({ exercise, onConfirm, onCancel }: SetupGuideModalProps) {
  if (!exercise.setup) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md backdrop-blur-xl bg-card/95 border-border/40 rounded-2xl shadow-2xl">
        <CardContent className="p-6">
          {/* 아이콘 */}
          <div className="flex justify-center mb-4">
            <div
              className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${exercise.gradient} flex items-center justify-center text-4xl shadow-lg`}
            >
              {exercise.icon}
            </div>
          </div>

          {/* 제목 */}
          <h2 className="text-xl font-bold text-center mb-2">{exercise.name}</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {exercise.nameEn}
          </p>

          {/* 자세 안내 */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
            <h3 className="text-amber-400 font-semibold text-sm mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              시작 전 자세 안내
            </h3>
            <p className="text-sm text-amber-200/80 whitespace-pre-line">
              {exercise.setup}
            </p>
          </div>

          {/* 운동 방법 */}
          <div className="bg-muted/20 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-sm mb-2">운동 방법</h3>
            <p className="text-sm text-muted-foreground">{exercise.instruction}</p>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 rounded-xl border border-border/50 bg-muted/20 text-muted-foreground hover:bg-muted/40 transition-colors"
            >
              취소
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-3 rounded-xl bg-gradient-to-r ${exercise.gradient} text-white font-semibold shadow-lg hover:opacity-90 transition-opacity`}
            >
              준비 완료
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
