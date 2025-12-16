"use client"

import { useRef, useCallback } from "react"

type Landmark = {
  x: number
  y: number
  z: number
  visibility?: number
}

// MediaPipe Pose 랜드마크 인덱스
const LANDMARK = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
} as const

// 점수 가중치
const WEIGHTS = {
  SHOULDER_ALIGNMENT: 0.3,  // 어깨 수평 정렬
  ARM_SYMMETRY: 0.3,        // 팔 대칭
  BODY_STABILITY: 0.2,      // 몸 안정성
  VISIBILITY: 0.2,          // 포즈 감지 신뢰도
}

export function useQualityScore(onScoreUpdate: (score: number) => void) {
  // 안정성 계산을 위한 이전 위치 저장
  const prevPositionsRef = useRef<{ x: number; y: number }[]>([])
  const scoreHistoryRef = useRef<number[]>([])

  const calculateScore = useCallback(
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
      const nose = landmarks[LANDMARK.NOSE]

      // 1. 어깨 수평 정렬 점수 (0-100)
      const shoulderYDiff = Math.abs(leftShoulder.y - rightShoulder.y)
      // 차이가 0.05 이하면 100점, 0.15 이상이면 0점
      const shoulderScore = Math.max(0, Math.min(100, (1 - shoulderYDiff / 0.15) * 100))

      // 2. 팔 대칭 점수 (0-100)
      // 양쪽 팔꿈치와 손목의 Y좌표 차이 비교
      const elbowYDiff = Math.abs(leftElbow.y - rightElbow.y)
      const wristYDiff = Math.abs(leftWrist.y - rightWrist.y)
      const armAsymmetry = (elbowYDiff + wristYDiff) / 2
      const armSymmetryScore = Math.max(0, Math.min(100, (1 - armAsymmetry / 0.2) * 100))

      // 3. 몸 안정성 점수 (0-100)
      // 코와 어깨 중심의 이동량 측정
      const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2
      const shoulderCenterY = (leftShoulder.y + rightShoulder.y) / 2
      const currentPositions = [
        { x: nose.x, y: nose.y },
        { x: shoulderCenterX, y: shoulderCenterY },
      ]

      let stabilityScore = 100
      if (prevPositionsRef.current.length > 0) {
        const prevNose = prevPositionsRef.current[0]
        const prevShoulder = prevPositionsRef.current[1]

        const noseMovement = Math.sqrt(
          Math.pow(nose.x - prevNose.x, 2) + Math.pow(nose.y - prevNose.y, 2)
        )
        const shoulderMovement = Math.sqrt(
          Math.pow(shoulderCenterX - prevShoulder.x, 2) +
            Math.pow(shoulderCenterY - prevShoulder.y, 2)
        )

        const totalMovement = (noseMovement + shoulderMovement) / 2
        // 움직임이 0.01 이하면 100점, 0.05 이상이면 0점
        stabilityScore = Math.max(0, Math.min(100, (1 - totalMovement / 0.05) * 100))
      }
      prevPositionsRef.current = currentPositions

      // 4. Visibility 점수 (0-100)
      const keyLandmarks = [
        leftShoulder,
        rightShoulder,
        leftElbow,
        rightElbow,
        leftWrist,
        rightWrist,
        leftHip,
        rightHip,
      ]
      const avgVisibility =
        keyLandmarks.reduce((sum, lm) => sum + (lm.visibility ?? 0), 0) / keyLandmarks.length
      const visibilityScore = avgVisibility * 100

      // 가중 평균 계산
      const totalScore = Math.round(
        shoulderScore * WEIGHTS.SHOULDER_ALIGNMENT +
          armSymmetryScore * WEIGHTS.ARM_SYMMETRY +
          stabilityScore * WEIGHTS.BODY_STABILITY +
          visibilityScore * WEIGHTS.VISIBILITY
      )

      // 점수 히스토리에 추가 (최근 10개 평균으로 부드럽게)
      scoreHistoryRef.current.push(totalScore)
      if (scoreHistoryRef.current.length > 10) {
        scoreHistoryRef.current.shift()
      }

      const smoothedScore = Math.round(
        scoreHistoryRef.current.reduce((a, b) => a + b, 0) / scoreHistoryRef.current.length
      )

      onScoreUpdate(smoothedScore)
    },
    [onScoreUpdate]
  )

  const resetScore = useCallback(() => {
    prevPositionsRef.current = []
    scoreHistoryRef.current = []
  }, [])

  return {
    calculateScore,
    resetScore,
  }
}
