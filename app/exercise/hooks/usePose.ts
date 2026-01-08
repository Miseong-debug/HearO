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

// 스켈레톤 연결 정의 (몸통만 - 얼굴 제외)
const POSE_CONNECTIONS: [number, number][] = [
  // 어깨
  [11, 12],
  // 왼팔
  [11, 13], [13, 15],
  // 오른팔
  [12, 14], [14, 16],
  // 몸통
  [11, 23], [12, 24], [23, 24],
  // 다리
  [23, 25], [25, 27], // 왼쪽 다리
  [24, 26], [26, 28], // 오른쪽 다리
]

// 주요 랜드마크 인덱스 (11번부터 - 얼굴 0-10 제외)
const KEY_LANDMARKS = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]

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
  const lightingCheckRef = useRef(0)
  const smoothingFactor = 0.7

  // 초기화
  useEffect(() => {
    let mounted = true
    async function init() {
      try {
        const landmarker = await createPoseLandmarker()
        if (mounted) {
          landmarkerRef.current = landmarker
          setIsReady(true)
        }
      } catch (error) {
        console.error("MediaPipe 초기화 실패:", error)
      }
    }
    init()
    return () => { mounted = false }
  }, [])

  // detectPose를 useRef로 안정화 (무한 루프 방지)
  const detectPoseRef = useRef<() => void>(() => {})

  detectPoseRef.current = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const landmarker = landmarkerRef.current

    if (!video || !canvas || !landmarker) return

    // 비디오가 충분히 로드되었는지 확인
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      return
    }

    // 조명 체크 (30프레임마다)
    lightingCheckRef.current++
    if (lightingCheckRef.current % 30 === 0) {
      const lightingResult = checkLightingQuality(video)
      setQuality(prev => ({
        ...prev,
        lighting: { isGood: lightingResult.isGood, message: lightingResult.message }
      }))
    }

    try {
      landmarker.detectForVideo(video, performance.now(), (result: any) => {
        const rawPose: Landmark[] | null = result?.landmarks?.[0] || null

        if (rawPose) {
          // 스무딩 적용 (인라인)
          const prev = prevLandmarksRef.current
          let smoothedPose: Landmark[]

          if (!prev || prev.length !== rawPose.length) {
            smoothedPose = rawPose
          } else {
            smoothedPose = rawPose.map((lm, i) => ({
              x: prev[i].x * smoothingFactor + lm.x * (1 - smoothingFactor),
              y: prev[i].y * smoothingFactor + lm.y * (1 - smoothingFactor),
              z: prev[i].z * smoothingFactor + lm.z * (1 - smoothingFactor),
              visibility: lm.visibility,
            }))
          }
          prevLandmarksRef.current = smoothedPose

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
    } catch {
      // 오류 발생 시 조용히 스킵
    }
  }

  // 안정적인 detectPose 함수 반환
  const detectPose = useCallback(() => {
    detectPoseRef.current()
  }, [])

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
