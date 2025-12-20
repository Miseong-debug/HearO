"use client"

import { RefObject, useCallback, useEffect, useRef, useState } from "react"
import { createPoseLandmarker, checkLightingQuality, checkLandmarkQuality, POSE_CONFIG } from "../pose-detector"

// Landmark 타입 정의
export type Landmark = {
  x: number
  y: number
  z: number
  visibility?: number
}

// 포즈 품질 상태
export type PoseQuality = {
  lighting: { isGood: boolean; message: string }
  landmarks: { isGood: boolean; message: string }
  overall: boolean
}

// 스켈레톤 연결 정의 (상체 중심 확장)
const POSE_CONNECTIONS: [number, number][] = [
  // 얼굴-어깨
  [0, 11], [0, 12],
  // 어깨
  [11, 12],
  // 왼팔
  [11, 13], [13, 15],
  // 오른팔
  [12, 14], [14, 16],
  // 몸통
  [11, 23], [12, 24], [23, 24],
  // 다리 (상단만)
  [23, 25], [24, 26],
]

// 주요 랜드마크 인덱스
const KEY_LANDMARKS = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26]

export function usePose(
  videoRef: RefObject<HTMLVideoElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>
) {
  const landmarkerRef = useRef<any>(null)
  const [landmarks, setLandmarks] = useState<Landmark[] | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [quality, setQuality] = useState<PoseQuality>({
    lighting: { isGood: true, message: "" },
    landmarks: { isGood: true, message: "" },
    overall: true,
  })

  // 스무딩을 위한 이전 랜드마크
  const prevLandmarksRef = useRef<Landmark[] | null>(null)
  const smoothingFactor = 0.7 // 0 = 완전히 새 값, 1 = 완전히 이전 값

  // 초기화
  useEffect(() => {
    async function init() {
      try {
        landmarkerRef.current = await createPoseLandmarker()
        setIsReady(true)
      } catch (error) {
        console.error("MediaPipe 초기화 실패:", error)
      }
    }
    init()
  }, [])

  // 랜드마크 스무딩 (떨림 감소)
  const smoothLandmarks = useCallback((newLandmarks: Landmark[]): Landmark[] => {
    const prev = prevLandmarksRef.current

    if (!prev || prev.length !== newLandmarks.length) {
      prevLandmarksRef.current = newLandmarks
      return newLandmarks
    }

    const smoothed = newLandmarks.map((lm, i) => {
      const prevLm = prev[i]
      return {
        x: prevLm.x * smoothingFactor + lm.x * (1 - smoothingFactor),
        y: prevLm.y * smoothingFactor + lm.y * (1 - smoothingFactor),
        z: prevLm.z * smoothingFactor + lm.z * (1 - smoothingFactor),
        visibility: lm.visibility,
      }
    })

    prevLandmarksRef.current = smoothed
    return smoothed
  }, [])

  // 조명 체크 (주기적으로)
  const lightingCheckRef = useRef(0)

  const detectPose = useCallback(async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const landmarker = landmarkerRef.current

    if (!video || !canvas || !landmarker) return

    // 조명 체크 (30프레임마다)
    lightingCheckRef.current++
    if (lightingCheckRef.current % 30 === 0) {
      const lightingResult = checkLightingQuality(video)
      setQuality(prev => ({
        ...prev,
        lighting: { isGood: lightingResult.isGood, message: lightingResult.message }
      }))
    }

    landmarker.detectForVideo(video, performance.now(), (result: any) => {
      const rawPose: Landmark[] | null = result?.landmarks?.[0] || null

      if (rawPose) {
        // 스무딩 적용
        const smoothedPose = smoothLandmarks(rawPose)
        setLandmarks(smoothedPose)

        // 랜드마크 품질 체크
        const landmarkResult = checkLandmarkQuality(smoothedPose)
        setQuality(prev => ({
          ...prev,
          landmarks: { isGood: landmarkResult.isGood, message: landmarkResult.message },
          overall: prev.lighting.isGood && landmarkResult.isGood
        }))

        drawSkeleton(canvas, smoothedPose)
      } else {
        setLandmarks(null)
        setQuality(prev => ({
          ...prev,
          landmarks: { isGood: false, message: "포즈를 감지할 수 없습니다." },
          overall: false
        }))
        drawSkeleton(canvas, null)
      }
    })
  }, [videoRef, canvasRef, smoothLandmarks])

  return {
    landmarks,
    detectPose,
    isReady,
    quality,
  }
}

function drawSkeleton(canvas: HTMLCanvasElement, pose: Landmark[] | null) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const width = canvas.width
  const height = canvas.height

  ctx.clearRect(0, 0, width, height)

  if (!pose) return

  // 연결선 그리기 (visibility 기반 투명도)
  POSE_CONNECTIONS.forEach(([a, b]) => {
    const p1 = pose[a]
    const p2 = pose[b]
    if (!p1 || !p2) return

    // visibility 기반 투명도
    const v1 = p1.visibility ?? 1
    const v2 = p2.visibility ?? 1
    const avgVisibility = (v1 + v2) / 2

    if (avgVisibility < POSE_CONFIG.minVisibility) return

    // 그라데이션 효과
    const gradient = ctx.createLinearGradient(
      p1.x * width, p1.y * height,
      p2.x * width, p2.y * height
    )
    gradient.addColorStop(0, `rgba(59, 130, 246, ${avgVisibility})`)
    gradient.addColorStop(1, `rgba(147, 51, 234, ${avgVisibility})`)

    ctx.strokeStyle = gradient
    ctx.lineWidth = 4
    ctx.lineCap = "round"

    ctx.beginPath()
    ctx.moveTo(p1.x * width, p1.y * height)
    ctx.lineTo(p2.x * width, p2.y * height)
    ctx.stroke()
  })

  // 주요 랜드마크만 그리기 (visibility 기반)
  KEY_LANDMARKS.forEach((idx) => {
    const p = pose[idx]
    if (!p) return

    const visibility = p.visibility ?? 1
    if (visibility < POSE_CONFIG.minVisibility) return

    // 외곽 원 (glow 효과)
    ctx.beginPath()
    ctx.arc(p.x * width, p.y * height, 8, 0, 2 * Math.PI)
    ctx.fillStyle = `rgba(59, 130, 246, ${visibility * 0.3})`
    ctx.fill()

    // 내부 원
    ctx.beginPath()
    ctx.arc(p.x * width, p.y * height, 5, 0, 2 * Math.PI)
    ctx.fillStyle = `rgba(255, 255, 255, ${visibility})`
    ctx.fill()

    // 테두리
    ctx.strokeStyle = `rgba(59, 130, 246, ${visibility})`
    ctx.lineWidth = 2
    ctx.stroke()
  })
}
