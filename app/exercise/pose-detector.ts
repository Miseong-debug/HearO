"use client"

import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision"

// 포즈 감지 설정
export const POSE_CONFIG = {
  // Confidence 임계값 (0.0 ~ 1.0)
  minPoseDetectionConfidence: 0.65,  // 포즈 감지 최소 신뢰도
  minPosePresenceConfidence: 0.65,   // 포즈 존재 최소 신뢰도
  minTrackingConfidence: 0.6,        // 트래킹 최소 신뢰도

  // Visibility 임계값
  minVisibility: 0.5,                // 랜드마크 가시성 최소값

  // 조명 품질 임계값
  minBrightness: 40,                 // 최소 밝기 (0-255)
  maxBrightness: 220,                // 최대 밝기 (너무 밝으면 안됨)
}

export async function createPoseLandmarker() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  )

  const landmarker = await (PoseLandmarker as any).createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numPoses: 1,
    minPoseDetectionConfidence: POSE_CONFIG.minPoseDetectionConfidence,
    minPosePresenceConfidence: POSE_CONFIG.minPosePresenceConfidence,
    minTrackingConfidence: POSE_CONFIG.minTrackingConfidence,
  })

  return landmarker
}

// 조명 품질 체크 함수
export function checkLightingQuality(video: HTMLVideoElement): {
  isGood: boolean
  brightness: number
  message: string
} {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    return { isGood: false, brightness: 0, message: "캔버스 오류" }
  }

  // 샘플링을 위해 작은 크기로
  canvas.width = 100
  canvas.height = 100
  ctx.drawImage(video, 0, 0, 100, 100)

  const imageData = ctx.getImageData(0, 0, 100, 100)
  const data = imageData.data

  // 평균 밝기 계산
  let totalBrightness = 0
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    // 인지된 밝기 공식
    totalBrightness += (0.299 * r + 0.587 * g + 0.114 * b)
  }

  const avgBrightness = totalBrightness / (data.length / 4)

  if (avgBrightness < POSE_CONFIG.minBrightness) {
    return {
      isGood: false,
      brightness: avgBrightness,
      message: "조명이 너무 어둡습니다. 밝은 곳으로 이동해주세요."
    }
  }

  if (avgBrightness > POSE_CONFIG.maxBrightness) {
    return {
      isGood: false,
      brightness: avgBrightness,
      message: "조명이 너무 밝습니다. 역광을 피해주세요."
    }
  }

  return {
    isGood: true,
    brightness: avgBrightness,
    message: "조명 상태 양호"
  }
}

// 랜드마크 품질 체크 (visibility 기반)
export function checkLandmarkQuality(landmarks: Array<{
  x: number
  y: number
  z: number
  visibility?: number
}>): {
  isGood: boolean
  visibleCount: number
  message: string
} {
  if (!landmarks || landmarks.length === 0) {
    return { isGood: false, visibleCount: 0, message: "포즈를 감지할 수 없습니다." }
  }

  // 주요 랜드마크 인덱스 (어깨, 팔꿈치, 손목, 엉덩이)
  const keyLandmarks = [11, 12, 13, 14, 15, 16, 23, 24]

  let visibleCount = 0
  for (const idx of keyLandmarks) {
    const lm = landmarks[idx]
    if (lm && (lm.visibility ?? 0) >= POSE_CONFIG.minVisibility) {
      visibleCount++
    }
  }

  const ratio = visibleCount / keyLandmarks.length

  if (ratio < 0.5) {
    return {
      isGood: false,
      visibleCount,
      message: "상체가 잘 보이지 않습니다. 카메라 위치를 조정해주세요."
    }
  }

  if (ratio < 0.75) {
    return {
      isGood: true,
      visibleCount,
      message: "일부 관절이 가려져 있습니다."
    }
  }

  return {
    isGood: true,
    visibleCount,
    message: "포즈 인식 상태 양호"
  }
}
