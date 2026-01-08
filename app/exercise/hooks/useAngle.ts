"use client"

import { useCallback } from "react"

type Landmark = {
  x: number
  y: number
  z: number
  visibility?: number
}

// MediaPipe Pose 랜드마크 인덱스
const LANDMARK = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const

// 각도 정보 타입
export type AngleInfo = {
  leftElbow: number    // 왼쪽 팔꿈치 각도
  rightElbow: number   // 오른쪽 팔꿈치 각도
  leftShoulder: number // 왼쪽 어깨 각도
  rightShoulder: number // 오른쪽 어깨 각도
  leftKnee: number     // 왼쪽 무릎 각도
  rightKnee: number    // 오른쪽 무릎 각도
}

// 세 점 사이의 각도 계산 (도 단위)
function calculateAngle(
  p1: Landmark,
  p2: Landmark, // 꼭지점 (각도의 중심)
  p3: Landmark
): number {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y }
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y }

  const dot = v1.x * v2.x + v1.y * v2.y
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y)
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y)

  if (mag1 === 0 || mag2 === 0) return 0

  const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)))
  const angleRad = Math.acos(cosAngle)
  const angleDeg = (angleRad * 180) / Math.PI

  return Math.round(angleDeg)
}

export function useAngle(onAngleUpdate: (angles: AngleInfo) => void) {
  const calculateAngles = useCallback(
    (landmarks: Landmark[] | null) => {
      if (!landmarks || landmarks.length < 33) {
        return
      }

      const leftShoulder = landmarks[LANDMARK.LEFT_SHOULDER]
      const rightShoulder = landmarks[LANDMARK.RIGHT_SHOULDER]
      const leftElbow = landmarks[LANDMARK.LEFT_ELBOW]
      const rightElbow = landmarks[LANDMARK.RIGHT_ELBOW]
      const leftWrist = landmarks[LANDMARK.LEFT_WRIST]
      const rightWrist = landmarks[LANDMARK.RIGHT_WRIST]
      const leftHip = landmarks[LANDMARK.LEFT_HIP]
      const rightHip = landmarks[LANDMARK.RIGHT_HIP]
      const leftKnee = landmarks[LANDMARK.LEFT_KNEE]
      const rightKnee = landmarks[LANDMARK.RIGHT_KNEE]
      const leftAnkle = landmarks[LANDMARK.LEFT_ANKLE]
      const rightAnkle = landmarks[LANDMARK.RIGHT_ANKLE]

      // 각도 계산
      const angles: AngleInfo = {
        // 팔꿈치 각도: 어깨-팔꿈치-손목
        leftElbow: calculateAngle(leftShoulder, leftElbow, leftWrist),
        rightElbow: calculateAngle(rightShoulder, rightElbow, rightWrist),
        // 어깨 각도: 팔꿈치-어깨-엉덩이
        leftShoulder: calculateAngle(leftElbow, leftShoulder, leftHip),
        rightShoulder: calculateAngle(rightElbow, rightShoulder, rightHip),
        // 무릎 각도: 엉덩이-무릎-발목
        leftKnee: calculateAngle(leftHip, leftKnee, leftAnkle),
        rightKnee: calculateAngle(rightHip, rightKnee, rightAnkle),
      }

      onAngleUpdate(angles)
    },
    [onAngleUpdate]
  )

  return {
    calculateAngles,
  }
}
