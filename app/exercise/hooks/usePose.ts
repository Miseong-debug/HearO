"use client"

import { RefObject, useEffect, useRef, useState } from "react"
import { createPoseLandmarker } from "../pose-detector"

// 간단 Landmark 타입 정의 (라이브러리 타입 말고 우리가 씀)
type Landmark = {
  x: number
  y: number
  z: number
  visibility?: number
}

// 스켈레톤 연결 정의
const POSE_CONNECTIONS: [number, number][] = [
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 12],
  [23, 24],
]

export function usePose(
  videoRef: RefObject<HTMLVideoElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>
) {
  const landmarkerRef = useRef<any>(null)
  const [landmarks, setLandmarks] = useState<Landmark[] | null>(null)

  // 초기화
  useEffect(() => {
    async function init() {
      landmarkerRef.current = await createPoseLandmarker()
    }
    init()
  }, [])

  const detectPose = async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const landmarker = landmarkerRef.current

    if (!video || !canvas || !landmarker) return

    landmarker.detectForVideo(video, performance.now(), (result: any) => {
      const pose: Landmark[] | null = result?.landmarks?.[0] || null
      setLandmarks(pose)
      drawSkeleton(canvas, pose)
    })
  }

  return {
    landmarks,
    detectPose,
  }
}

function drawSkeleton(canvas: HTMLCanvasElement, pose: Landmark[] | null) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const width = canvas.width
  const height = canvas.height

  ctx.clearRect(0, 0, width, height)

  if (!pose) return

  // 라인
  ctx.strokeStyle = "rgba(255,255,255,0.9)"
  ctx.lineWidth = 3

  POSE_CONNECTIONS.forEach(([a, b]) => {
    const p1 = pose[a]
    const p2 = pose[b]
    if (!p1 || !p2) return

    ctx.beginPath()
    ctx.moveTo(p1.x * width, p1.y * height)
    ctx.lineTo(p2.x * width, p2.y * height)
    ctx.stroke()
  })

  // 점
  ctx.fillStyle = "rgba(255,100,200,1)"
  pose.forEach((p) => {
    ctx.beginPath()
    ctx.arc(p.x * width, p.y * height, 4, 0, 2 * Math.PI)
    ctx.fill()
  })
}
