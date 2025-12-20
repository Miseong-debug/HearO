"use client"

import { useEffect, useRef, useCallback, useState } from "react"
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
  const [cameraError, setCameraError] = useState<string | null>(null)

  const { landmarks, detectPose, isReady, quality } = usePose(videoRef, canvasRef)
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
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
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
      } catch (error) {
        console.error("카메라 접근 오류:", error)
        setCameraError("카메라에 접근할 수 없습니다. 권한을 확인해주세요.")
      }
    }

    init()
  }, [detectPose])

  // 품질 경고 메시지
  const qualityMessage = !quality.lighting.isGood
    ? quality.lighting.message
    : !quality.landmarks.isGood
    ? quality.landmarks.message
    : null

  return (
    <div className="relative w-full h-full">
      {/* 카메라 오류 표시 */}
      {cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-20">
          <div className="text-center p-4">
            <div className="text-red-500 text-lg mb-2">⚠️</div>
            <p className="text-white">{cameraError}</p>
          </div>
        </div>
      )}

      {/* MediaPipe 로딩 표시 */}
      {!isReady && !cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2" />
            <p className="text-white text-sm">포즈 인식 준비 중...</p>
          </div>
        </div>
      )}

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

      {/* 품질 상태 표시 */}
      {qualityMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-yellow-500/90 text-black px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
            ⚠️ {qualityMessage}
          </div>
        </div>
      )}

      {/* 포즈 인식 상태 표시 */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
          quality.overall
            ? "bg-green-500/80 text-white"
            : "bg-red-500/80 text-white"
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            quality.overall ? "bg-green-300 animate-pulse" : "bg-red-300"
          }`} />
          {quality.overall ? "포즈 인식 중" : "포즈 감지 안됨"}
        </div>
      </div>
    </div>
  )
}
