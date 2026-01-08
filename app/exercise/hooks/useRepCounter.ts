"use client"

import { useRef, useCallback, useState } from "react"
import { ExerciseId, ExerciseConfig, getExerciseConfig, DEFAULT_EXERCISE } from "@/lib/exercises"

type Landmark = {
  x: number
  y: number
  z: number
  visibility?: number
}

type RepState = "active" | "idle"

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
  return Math.round((angleRad * 180) / Math.PI)
}

// 디버그 정보 타입
export type RepCounterDebug = {
  leftAngle: number
  rightAngle: number
  maxAngle: number
  state: RepState
  visibilityOk: boolean
  targetReached: boolean
  baselineAngle: number
  targetAngle: number
  relativeAngle: number
  exerciseId: ExerciseId
  countOnIncrease: boolean
}

type RepCounterOptions = {
  baselineAngle?: number | null
  exerciseId?: ExerciseId
}

export function useRepCounter(
  onRepCount: (count: number) => void,
  options?: RepCounterOptions
) {
  const exerciseId = options?.exerciseId ?? DEFAULT_EXERCISE
  const exerciseConfig = getExerciseConfig(exerciseId)

  // 캘리브레이션된 기준 각도 또는 운동별 기본값
  const baselineAngle = options?.baselineAngle ?? exerciseConfig.defaultBaselineAngle

  // 목표 각도와 리셋 각도 계산
  const targetAngle = baselineAngle + exerciseConfig.targetAngleDelta
  const resetAngle = baselineAngle + exerciseConfig.resetAngleDelta

  const repCountRef = useRef(0)
  const stateRef = useRef<RepState>("idle")
  const lastCountTimeRef = useRef(0)

  const debugRef = useRef<RepCounterDebug>({
    leftAngle: 0,
    rightAngle: 0,
    maxAngle: 0,
    state: "idle",
    visibilityOk: false,
    targetReached: false,
    baselineAngle: baselineAngle,
    targetAngle: targetAngle,
    relativeAngle: 0,
    exerciseId: exerciseId,
    countOnIncrease: exerciseConfig.countOnIncrease,
  })
  const [debug, setDebug] = useState<RepCounterDebug>(debugRef.current)
  const lastDebugUpdateRef = useRef(0)

  const countRep = useCallback(
    (landmarks: Landmark[] | null) => {
      if (!landmarks || landmarks.length < 33) {
        return
      }

      const { landmarks: landmarkConfig } = exerciseConfig

      // 운동에 맞는 랜드마크 가져오기
      const leftPoint1 = landmarks[landmarkConfig.point1.left]
      const leftPoint2 = landmarks[landmarkConfig.point2.left]
      const leftPoint3 = landmarks[landmarkConfig.point3.left]

      const rightPoint1 = landmarks[landmarkConfig.point1.right]
      const rightPoint2 = landmarks[landmarkConfig.point2.right]
      const rightPoint3 = landmarks[landmarkConfig.point3.right]

      // visibility 체크 비활성화 - 랜드마크가 있으면 OK
      const visibilityOk = true

      // 각도 계산 (point2가 꼭짓점)
      const leftAngle = calculateAngle(leftPoint1, leftPoint2, leftPoint3)
      const rightAngle = calculateAngle(rightPoint1, rightPoint2, rightPoint3)

      // side 설정에 따라 사용할 각도 결정
      let currentAngle: number
      if (landmarkConfig.side === "left") {
        currentAngle = leftAngle
      } else if (landmarkConfig.side === "right") {
        currentAngle = rightAngle
      } else {
        // "both" - 양쪽 중 더 적합한 값 사용
        // countOnIncrease가 true면 큰 값, false면 작은 값
        currentAngle = exerciseConfig.countOnIncrease
          ? Math.max(leftAngle, rightAngle)
          : Math.min(leftAngle, rightAngle)
      }

      // 상대적 각도 계산 (baseline 대비)
      const relativeAngle = currentAngle - baselineAngle

      // 목표 도달 여부 (운동 방향에 따라 다름)
      let targetReached: boolean
      let shouldReset: boolean

      if (exerciseConfig.countOnIncrease) {
        // 각도가 커지면 카운트 (팔올리기 등)
        targetReached = currentAngle >= targetAngle
        shouldReset = currentAngle < resetAngle
      } else {
        // 각도가 작아지면 카운트 (스쿼트, 팔굽혀펴기 등)
        targetReached = currentAngle <= targetAngle
        shouldReset = currentAngle > resetAngle
      }

      // 디버그 정보 업데이트 (ref에 저장)
      debugRef.current = {
        leftAngle,
        rightAngle,
        maxAngle: currentAngle,
        state: stateRef.current,
        visibilityOk,
        targetReached,
        baselineAngle,
        targetAngle,
        relativeAngle,
        exerciseId,
        countOnIncrease: exerciseConfig.countOnIncrease,
      }

      // 100ms마다만 UI 업데이트 (성능 최적화)
      const now = Date.now()
      if (now - lastDebugUpdateRef.current > 100) {
        lastDebugUpdateRef.current = now
        setDebug({ ...debugRef.current })
      }

      // 디버그 로그 (1초마다)
      if (now % 1000 < 50) {
        console.log(`[RepCounter:${exerciseId}]`, {
          currentAngle,
          baseline: baselineAngle,
          target: targetAngle,
          relativeAngle,
          state: stateRef.current,
          countOnIncrease: exerciseConfig.countOnIncrease,
        })
      }

      // visibility 체크 실패 시 리턴
      if (!visibilityOk) return

      const minInterval = 500 // 최소 0.5초 간격으로 카운트

      // 목표 각도 도달 시 카운트
      if (targetReached && stateRef.current !== "active") {
        if (now - lastCountTimeRef.current > minInterval) {
          repCountRef.current += 1
          lastCountTimeRef.current = now
          console.log(`[RepCounter:${exerciseId}] 카운트!`, repCountRef.current, "각도:", currentAngle, "목표:", targetAngle)
          onRepCount(repCountRef.current)
        }
        stateRef.current = "active"
      }
      // 리셋 조건 충족 시 다음 카운트 준비
      else if (shouldReset && stateRef.current === "active") {
        console.log(`[RepCounter:${exerciseId}] 상태 리셋 -> idle, 각도:`, currentAngle, "리셋 기준:", resetAngle)
        stateRef.current = "idle"
      }
    },
    [onRepCount, baselineAngle, targetAngle, resetAngle, exerciseConfig, exerciseId]
  )

  const resetCount = useCallback(() => {
    repCountRef.current = 0
    stateRef.current = "idle"
    onRepCount(0)
  }, [onRepCount])

  return {
    countRep,
    resetCount,
    getCount: () => repCountRef.current,
    debug,
  }
}

// 운동별 각도 계산 함수 (캘리브레이션용)
export function calculateExerciseAngle(
  landmarks: Landmark[],
  exerciseId: ExerciseId
): { left: number; right: number; max: number } {
  const config = getExerciseConfig(exerciseId)
  const { landmarks: landmarkConfig } = config

  const leftPoint1 = landmarks[landmarkConfig.point1.left]
  const leftPoint2 = landmarks[landmarkConfig.point2.left]
  const leftPoint3 = landmarks[landmarkConfig.point3.left]

  const rightPoint1 = landmarks[landmarkConfig.point1.right]
  const rightPoint2 = landmarks[landmarkConfig.point2.right]
  const rightPoint3 = landmarks[landmarkConfig.point3.right]

  const leftAngle = calculateAngle(leftPoint1, leftPoint2, leftPoint3)
  const rightAngle = calculateAngle(rightPoint1, rightPoint2, rightPoint3)

  // side 설정에 따라 사용할 각도 결정
  let maxAngle: number
  if (landmarkConfig.side === "left") {
    maxAngle = leftAngle
  } else if (landmarkConfig.side === "right") {
    maxAngle = rightAngle
  } else {
    maxAngle = config.countOnIncrease
      ? Math.max(leftAngle, rightAngle)
      : Math.min(leftAngle, rightAngle)
  }

  return { left: leftAngle, right: rightAngle, max: maxAngle }
}
