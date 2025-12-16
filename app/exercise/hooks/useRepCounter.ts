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
} as const

type ArmState = "up" | "down" | "idle"

export function useRepCounter(onRepCount: (count: number) => void) {
  const repCountRef = useRef(0)
  const armStateRef = useRef<ArmState>("idle")
  const lastCountTimeRef = useRef(0)

  const countRep = useCallback(
    (landmarks: Landmark[] | null) => {
      if (!landmarks || landmarks.length < 33) return

      const leftShoulder = landmarks[LANDMARK.LEFT_SHOULDER]
      const rightShoulder = landmarks[LANDMARK.RIGHT_SHOULDER]
      const leftWrist = landmarks[LANDMARK.LEFT_WRIST]
      const rightWrist = landmarks[LANDMARK.RIGHT_WRIST]

      // visibility 체크 (0.5 이상일 때만 신뢰)
      const minVisibility = 0.5
      if (
        (leftShoulder.visibility ?? 0) < minVisibility ||
        (rightShoulder.visibility ?? 0) < minVisibility ||
        (leftWrist.visibility ?? 0) < minVisibility ||
        (rightWrist.visibility ?? 0) < minVisibility
      ) {
        return
      }

      // 어깨 평균 y좌표
      const shoulderY = (leftShoulder.y + rightShoulder.y) / 2
      // 손목 평균 y좌표
      const wristY = (leftWrist.y + rightWrist.y) / 2

      // y좌표가 작을수록 화면 위쪽
      // 손목이 어깨보다 위로 올라가면 "up" (threshold: 어깨 위 10% 이상)
      const threshold = 0.1
      const isArmsUp = wristY < shoulderY - threshold
      const isArmsDown = wristY > shoulderY + threshold

      const now = Date.now()
      const minInterval = 500 // 최소 0.5초 간격으로 카운트

      if (isArmsUp && armStateRef.current !== "up") {
        armStateRef.current = "up"
      } else if (isArmsDown && armStateRef.current === "up") {
        // up → down 전환 시 1회 카운트
        if (now - lastCountTimeRef.current > minInterval) {
          repCountRef.current += 1
          lastCountTimeRef.current = now
          onRepCount(repCountRef.current)
        }
        armStateRef.current = "down"
      }
    },
    [onRepCount]
  )

  const resetCount = useCallback(() => {
    repCountRef.current = 0
    armStateRef.current = "idle"
    onRepCount(0)
  }, [onRepCount])

  return {
    countRep,
    resetCount,
    getCount: () => repCountRef.current,
  }
}
