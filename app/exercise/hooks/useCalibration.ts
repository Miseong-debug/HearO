"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { ExerciseId, getExerciseConfig, DEFAULT_EXERCISE } from "@/lib/exercises"

export type CalibrationState = "idle" | "calibrating" | "completed"

export type CalibrationResult = {
  baselineAngle: number
  calibratedAt: Date
}

interface SavedCalibration {
  baselineAngle: number
  savedAt: string
}

// 운동별 캘리브레이션 저장 키 생성
function getCalibrationStorageKey(exerciseId: ExerciseId): string {
  return `hearo-calibration-${exerciseId}`
}

// localStorage에서 캘리브레이션 값 로드
function loadCalibrationFromStorage(exerciseId: ExerciseId): SavedCalibration | null {
  if (typeof window === "undefined") return null
  try {
    const key = getCalibrationStorageKey(exerciseId)
    const saved = localStorage.getItem(key)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    console.error("[Calibration] localStorage 로드 실패:", error)
  }
  return null
}

// localStorage에 캘리브레이션 값 저장
function saveCalibrationToStorage(exerciseId: ExerciseId, baselineAngle: number): void {
  if (typeof window === "undefined") return
  try {
    const key = getCalibrationStorageKey(exerciseId)
    const data: SavedCalibration = {
      baselineAngle,
      savedAt: new Date().toISOString().split("T")[0] // YYYY-MM-DD
    }
    localStorage.setItem(key, JSON.stringify(data))
    console.log(`[Calibration] ${exerciseId} localStorage에 저장:`, data)
  } catch (error) {
    console.error("[Calibration] localStorage 저장 실패:", error)
  }
}

// localStorage에서 캘리브레이션 값 삭제
export function clearCalibrationStorage(exerciseId?: ExerciseId): void {
  if (typeof window === "undefined") return
  try {
    if (exerciseId) {
      // 특정 운동만 삭제
      const key = getCalibrationStorageKey(exerciseId)
      localStorage.removeItem(key)
      console.log(`[Calibration] ${exerciseId} localStorage에서 삭제됨`)
    } else {
      // 모든 운동의 캘리브레이션 삭제
      const keys = Object.keys(localStorage).filter(k => k.startsWith("hearo-calibration-"))
      keys.forEach(key => localStorage.removeItem(key))
      console.log("[Calibration] 모든 캘리브레이션 localStorage에서 삭제됨")
    }
  } catch (error) {
    console.error("[Calibration] localStorage 삭제 실패:", error)
  }
}

// 저장된 캘리브레이션 값 가져오기 (외부에서 사용)
export function getSavedCalibration(exerciseId: ExerciseId): SavedCalibration | null {
  return loadCalibrationFromStorage(exerciseId)
}

export function useCalibration(exerciseId: ExerciseId = DEFAULT_EXERCISE) {
  const [state, setState] = useState<CalibrationState>("idle")
  const [countdown, setCountdown] = useState(3)
  const [baselineAngle, setBaselineAngle] = useState<number | null>(null)
  const [currentAngle, setCurrentAngle] = useState<number>(0)
  const [isLoadedFromStorage, setIsLoadedFromStorage] = useState(false)
  const [currentExerciseId, setCurrentExerciseId] = useState<ExerciseId>(exerciseId)

  // 캘리브레이션 중 측정된 각도들
  const anglesSampledRef = useRef<number[]>([])
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const calibrationStartTimeRef = useRef<number>(0)

  // 운동이 변경되면 해당 운동의 캘리브레이션 로드
  useEffect(() => {
    setCurrentExerciseId(exerciseId)
    const saved = loadCalibrationFromStorage(exerciseId)
    if (saved) {
      setBaselineAngle(saved.baselineAngle)
      setState("completed")
      setIsLoadedFromStorage(true)
      console.log(`[Calibration] ${exerciseId} 저장된 값 로드:`, saved)
    } else {
      // 저장된 값이 없으면 초기 상태로
      setBaselineAngle(null)
      setState("idle")
      setIsLoadedFromStorage(false)
    }
  }, [exerciseId])

  // 캘리브레이션 시작
  const startCalibration = useCallback(() => {
    setState("calibrating")
    setCountdown(3)
    anglesSampledRef.current = []
    calibrationStartTimeRef.current = Date.now()
    setIsLoadedFromStorage(false)

    // 카운트다운 시작
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // 카운트다운 종료
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current)
            countdownIntervalRef.current = null
          }

          // 평균 각도 계산
          const samples = anglesSampledRef.current
          const exerciseConfig = getExerciseConfig(currentExerciseId)

          if (samples.length > 0) {
            const avgAngle = Math.round(
              samples.reduce((a, b) => a + b, 0) / samples.length
            )
            setBaselineAngle(avgAngle)
            // localStorage에 저장
            saveCalibrationToStorage(currentExerciseId, avgAngle)
            console.log(`[Calibration] ${currentExerciseId} 기준 각도 설정:`, avgAngle, "샘플 수:", samples.length)
          } else {
            // 샘플이 없으면 기본값 사용
            const defaultAngle = exerciseConfig.defaultBaselineAngle
            setBaselineAngle(defaultAngle)
            saveCalibrationToStorage(currentExerciseId, defaultAngle)
            console.log(`[Calibration] ${currentExerciseId} 샘플 없음, 기본값 사용:`, defaultAngle)
          }

          setState("completed")
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [currentExerciseId])

  // 캘리브레이션 중 각도 샘플 추가
  const addAngleSample = useCallback((angle: number) => {
    if (state === "calibrating") {
      anglesSampledRef.current.push(angle)
      setCurrentAngle(angle)
    }
  }, [state])

  // 캘리브레이션 리셋 (현재 세션만 - localStorage 유지)
  const resetCalibration = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
    setState("idle")
    setCountdown(3)
    setBaselineAngle(null)
    setCurrentAngle(0)
    anglesSampledRef.current = []
    setIsLoadedFromStorage(false)
  }, [])

  // 캘리브레이션 완전 초기화 (localStorage도 삭제)
  const clearCalibration = useCallback(() => {
    clearCalibrationStorage(currentExerciseId)
    resetCalibration()
  }, [currentExerciseId, resetCalibration])

  // 캘리브레이션 건너뛰기 (기본값 사용)
  const skipCalibration = useCallback(() => {
    const exerciseConfig = getExerciseConfig(currentExerciseId)
    const defaultAngle = exerciseConfig.defaultBaselineAngle
    setBaselineAngle(defaultAngle)
    saveCalibrationToStorage(currentExerciseId, defaultAngle)
    setState("completed")
    console.log(`[Calibration] ${currentExerciseId} 건너뛰기 - 기본값 사용:`, defaultAngle)
  }, [currentExerciseId])

  return {
    state,
    countdown,
    baselineAngle,
    currentAngle,
    startCalibration,
    addAngleSample,
    resetCalibration,
    clearCalibration,
    skipCalibration,
    isCalibrating: state === "calibrating",
    isCompleted: state === "completed",
    isLoadedFromStorage,
    exerciseId: currentExerciseId,
  }
}
