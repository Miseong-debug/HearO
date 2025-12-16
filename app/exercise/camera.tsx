"use client"

import { useEffect, useRef, useCallback } from "react"
import { usePose } from "./hooks/usePose"
import { useRepCounter } from "./hooks/useRepCounter"
import { useQualityScore } from "./hooks/useQualityScore"
import { useSound } from "./hooks/useSound"

interface CameraProps {
  onRepCount?: (count: number) => void
  onScoreUpdate?: (score: number) => void
  onTargetReached?: () => void
  isRunning?: boolean
  targetReps?: number
}

export default function Camera({
  onRepCount,
  onScoreUpdate,
  onTargetReached,
  isRunning = true,
  targetReps = 10,
}: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const targetReachedRef = useRef(false)

  const { landmarks, detectPose } = usePose(videoRef, canvasRef)
  const { playRepSound, playAchievementSound } = useSound()

  // 반복 카운트 콜백 (효과음 포함)
  const handleRepCount = useCallback(
    (count: number) => {
      // 목표 달성 체크
      if (count >= targetReps && !targetReachedRef.current) {
        targetReachedRef.current = true
        playAchievementSound()
        onTargetReached?.()
      } else {
        playRepSound()
      }
      onRepCount?.(count)
    },
    [playRepSound, playAchievementSound, onRepCount, onTargetReached, targetReps]
  )

  const { countRep } = useRepCounter(handleRepCount)
  const { calculateScore } = useQualityScore(onScoreUpdate ?? (() => {}))

  // 포즈가 감지될 때마다 반복 카운트 및 점수 계산
  useEffect(() => {
    if (isRunning && landmarks) {
      countRep(landmarks)
      calculateScore(landmarks)
    }
  }, [landmarks, isRunning, countRep, calculateScore])

  useEffect(() => {
    async function init() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      })

      if (!videoRef.current) return

      videoRef.current.srcObject = stream
      await videoRef.current.play()

      const loop = () => {
        detectPose()
        requestAnimationFrame(loop)
      }
      loop()
    }

    init()
  }, [detectPose])

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
        playsInline
        muted
      />

      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        className="absolute inset-0 w-full h-full scale-x-[-1]"
      />
    </div>
  )
}
