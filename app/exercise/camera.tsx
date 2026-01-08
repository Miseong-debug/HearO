"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { usePose } from "./hooks/usePose"
import { useRepCounter, calculateExerciseAngle } from "./hooks/useRepCounter"
import { useAngle, AngleInfo } from "./hooks/useAngle"
import { useSound } from "./hooks/useSound"
import { useCalibration, CalibrationState } from "./hooks/useCalibration"
import { ExerciseId, ExerciseConfig, getExerciseConfig, DEFAULT_EXERCISE } from "@/lib/exercises"

// 캘리브레이션 완료 메시지 컴포넌트 (자동 숨김)
function CalibrationCompleteMessage({
  baselineAngle,
  exercise,
  isLoadedFromStorage,
}: {
  baselineAngle: number
  exercise: ExerciseConfig
  isLoadedFromStorage: boolean
}) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (isLoadedFromStorage) {
      setVisible(false)
      return
    }
    const timer = setTimeout(() => setVisible(false), 2000)
    return () => clearTimeout(timer)
  }, [isLoadedFromStorage])

  if (!visible) return null

  const targetAngle = baselineAngle + exercise.targetAngleDelta

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-30 animate-fade-out">
      <div className="text-center p-8">
        <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${exercise.gradient} flex items-center justify-center`}>
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-white text-xl font-bold mb-2">캘리브레이션 완료!</h3>
        <p className="text-gray-300 text-sm mb-2">
          기준 각도: <span className="text-green-400 font-bold">{baselineAngle}°</span>
        </p>
        <p className="text-gray-400 text-sm">
          목표: <span className="text-blue-400 font-bold">{targetAngle}°</span> 달성 시 카운트
        </p>
      </div>
    </div>
  )
}

// 저장된 캘리브레이션 배너
function SavedCalibrationBanner({
  baselineAngle,
  exercise,
  onRecalibrate,
}: {
  baselineAngle: number
  exercise: ExerciseConfig
  onRecalibrate: () => void
}) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
      <div className={`bg-gradient-to-r ${exercise.gradient} text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg flex items-center gap-3`}>
        <span className="text-2xl">{exercise.icon}</span>
        <span>{exercise.name} - 기준: {baselineAngle}°</span>
        <button
          onClick={onRecalibrate}
          className="px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded text-xs transition-colors"
        >
          재측정
        </button>
      </div>
    </div>
  )
}

interface CameraProps {
  onRepCount?: (count: number) => void
  onAngleUpdate?: (angles: AngleInfo) => void
  onTargetReached?: () => void
  onCalibrationComplete?: (baselineAngle: number) => void
  isRunning?: boolean
  targetReps?: number
  devMode?: boolean
  exerciseId?: ExerciseId
}

export default function Camera({
  onRepCount,
  onAngleUpdate,
  onTargetReached,
  onCalibrationComplete,
  isRunning = true,
  targetReps = 10,
  devMode = false,
  exerciseId = DEFAULT_EXERCISE,
}: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const targetReachedRef = useRef(false)
  const detectPoseRef = useRef<(() => void) | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isCameraLoading, setIsCameraLoading] = useState(true)
  const [showDevPanel, setShowDevPanel] = useState(devMode)

  // 운동 설정
  const exerciseConfig = getExerciseConfig(exerciseId)

  const { landmarks, detectPose, isReady, quality } = usePose(videoRef, canvasRef)
  const { playRepSound, playAchievementSound } = useSound()

  // detectPose를 ref로 관리하여 useEffect 의존성에서 제외 (무한 루프 방지)
  detectPoseRef.current = detectPose

  // 캘리브레이션 훅 (운동별)
  const calibration = useCalibration(exerciseId)

  // 반복 카운트 콜백 (효과음 포함)
  const handleRepCount = useCallback(
    (count: number) => {
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

  const { countRep, debug } = useRepCounter(handleRepCount, {
    baselineAngle: calibration.baselineAngle,
    exerciseId,
  })
  const { calculateAngles } = useAngle(onAngleUpdate ?? (() => { }))

  // 캘리브레이션 완료 시 콜백 호출
  useEffect(() => {
    if (calibration.state === "completed" && calibration.baselineAngle !== null) {
      onCalibrationComplete?.(calibration.baselineAngle)
    }
  }, [calibration.state, calibration.baselineAngle, onCalibrationComplete])

  // 운동 변경 시 목표 도달 상태 리셋
  useEffect(() => {
    targetReachedRef.current = false
  }, [exerciseId])

  // 포즈가 감지될 때마다 반복 카운트 및 각도 계산
  useEffect(() => {
    if (landmarks) {
      calculateAngles(landmarks)

      // 캘리브레이션 중이면 운동에 맞는 각도 샘플 추가
      if (calibration.state === "calibrating") {
        const angles = calculateExerciseAngle(landmarks, exerciseId)
        calibration.addAngleSample(angles.max)
      }

      // 캘리브레이션 완료 후에만 카운트 실행
      if (calibration.state === "completed") {
        countRep(landmarks)
      }
    }
  }, [landmarks, countRep, calculateAngles, calibration, exerciseId])

  useEffect(() => {
    let animationFrameId: number | null = null
    let isMounted = true

    async function init() {
      try {
        console.log("카메라 초기화 시작...")
        setIsCameraLoading(true)

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })

        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop())
          return
        }

        console.log("카메라 스트림 획득 성공")

        if (!videoRef.current) {
          console.error("videoRef가 null입니다")
          return
        }

        videoRef.current.srcObject = stream

        videoRef.current.onloadeddata = () => {
          const video = videoRef.current
          if (!video || !isMounted) return

          video.play().then(() => {
            console.log("비디오 재생 시작")
            setIsCameraLoading(false)

            const loop = () => {
              if (!isMounted) return
              if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
                // ref를 통해 최신 detectPose 호출 (의존성 배열에서 제외)
                detectPoseRef.current?.()
              }
              animationFrameId = requestAnimationFrame(loop)
            }
            loop()
          }).catch(err => {
            console.log("자동 재생 실패:", err)
            setIsCameraLoading(false)
          })
        }
      } catch (error) {
        console.error("카메라 접근 오류:", error)
        setCameraError("카메라에 접근할 수 없습니다. 권한을 확인해주세요.")
        setIsCameraLoading(false)
      }
    }

    init()

    return () => {
      isMounted = false
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, []) // detectPose 의존성 제거 - ref 패턴 사용

  // 품질 경고 메시지
  const qualityMessage = !quality.lighting.isGood
    ? quality.lighting.message
    : !quality.landmarks.isGood
      ? quality.landmarks.message
      : null

  return (
    <div className="relative w-full h-full min-h-[300px] bg-gray-900">
      {/* 카메라 오류 */}
      {cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-20">
          <div className="text-center p-4">
            <div className="text-red-500 text-lg mb-2">⚠️</div>
            <p className="text-white">{cameraError}</p>
          </div>
        </div>
      )}

      {/* 카메라 로딩 */}
      {isCameraLoading && !cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2" />
            <p className="text-white text-sm">카메라 연결 중...</p>
          </div>
        </div>
      )}

      {/* MediaPipe 로딩 */}
      {!isCameraLoading && !isReady && !cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2" />
            <p className="text-white text-sm">포즈 인식 준비 중...</p>
          </div>
        </div>
      )}

      {/* 캘리브레이션 UI */}
      {calibration.state === "idle" && isReady && !isCameraLoading && !cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-30">
          <div className="text-center p-8 max-w-sm">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${exerciseConfig.gradient} flex items-center justify-center text-4xl`}>
              {exerciseConfig.icon}
            </div>
            <h3 className="text-white text-xl font-bold mb-2">{exerciseConfig.name} 캘리브레이션</h3>
            <p className="text-gray-300 text-sm mb-6">
              {exerciseConfig.instruction}
              <br />
              <span className="text-gray-400 text-xs mt-2 block">
                시작 자세를 취하고 버튼을 누르세요
              </span>
            </p>
            <button
              onClick={() => calibration.startCalibration()}
              className={`px-6 py-3 bg-gradient-to-r ${exerciseConfig.gradient} text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg`}
            >
              캘리브레이션 시작
            </button>
            <button
              onClick={() => calibration.skipCalibration()}
              className="block mx-auto mt-3 text-gray-400 text-sm hover:text-white transition-colors"
            >
              건너뛰기 (기본값 사용)
            </button>
          </div>
        </div>
      )}

      {/* 캘리브레이션 진행 중 */}
      {calibration.state === "calibrating" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-30">
          <div className="text-center p-8">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="none" />
                <circle
                  cx="64" cy="64" r="56"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${((3 - calibration.countdown) / 3) * 352} 352`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-bold text-white animate-pulse">
                  {calibration.countdown}
                </span>
              </div>
            </div>

            <h3 className="text-white text-xl font-bold mb-2">시작 자세 유지</h3>
            <p className="text-gray-300 text-sm mb-4">{exerciseConfig.instruction}</p>

            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2 inline-block">
              <span className="text-gray-400 text-sm">현재 감지 각도: </span>
              <span className="text-white font-bold text-lg">{calibration.currentAngle}°</span>
            </div>
          </div>
        </div>
      )}

      {/* 캘리브레이션 완료 메시지 */}
      {calibration.state === "completed" && calibration.baselineAngle !== null && !calibration.isLoadedFromStorage && (
        <CalibrationCompleteMessage
          baselineAngle={calibration.baselineAngle}
          exercise={exerciseConfig}
          isLoadedFromStorage={false}
        />
      )}

      {/* 저장된 캘리브레이션 배너 */}
      {calibration.isLoadedFromStorage && calibration.baselineAngle !== null && (
        <SavedCalibrationBanner
          baselineAngle={calibration.baselineAngle}
          exercise={exerciseConfig}
          onRecalibrate={() => calibration.clearCalibration()}
        />
      )}

      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
        playsInline
        muted
        autoPlay
        style={{ minHeight: "300px" }}
      />

      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        className="absolute inset-0 w-full h-full scale-x-[-1]"
      />

      {/* 품질 경고 */}
      {qualityMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-yellow-500/90 text-black px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
            ⚠️ {qualityMessage}
          </div>
        </div>
      )}

      {/* 포즈 인식 상태 */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
          quality.overall ? "bg-green-500/80 text-white" : "bg-red-500/80 text-white"
        }`}>
          <div className={`w-2 h-2 rounded-full ${quality.overall ? "bg-green-300 animate-pulse" : "bg-red-300"}`} />
          {quality.overall ? "포즈 인식 중" : "포즈 감지 안됨"}
        </div>
      </div>

      {/* 개발자 모드 토글 */}
      <button
        onClick={() => setShowDevPanel(prev => !prev)}
        className="absolute top-4 right-4 z-20 px-2 py-1 bg-black/60 text-white text-xs rounded hover:bg-black/80"
      >
        {showDevPanel ? "DEV OFF" : "DEV"}
      </button>

      {/* 개발자 패널 */}
      {showDevPanel && (
        <div className="absolute top-12 right-4 z-20 bg-black/80 text-white p-3 rounded-lg text-xs font-mono space-y-1 min-w-[220px]">
          <div className="text-yellow-400 font-bold mb-2">🔧 Developer Mode</div>

          <div className="border-b border-white/20 pb-2 mb-2">
            <div className="flex justify-between">
              <span>운동:</span>
              <span className={`text-${exerciseConfig.color}-400`}>{exerciseConfig.name}</span>
            </div>
            <div className="flex justify-between">
              <span>캘리브레이션:</span>
              <span className={calibration.state === "completed" ? "text-green-400" : "text-yellow-400"}>
                {calibration.state === "idle" ? "대기중" : calibration.state === "calibrating" ? "진행중" : "완료"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>기준 각도:</span>
              <span className="text-cyan-400">{debug.baselineAngle}°</span>
            </div>
            <div className="flex justify-between">
              <span>목표 각도:</span>
              <span className="text-purple-400">{debug.targetAngle}°</span>
            </div>
            <div className="flex justify-between">
              <span>방향:</span>
              <span className={debug.countOnIncrease ? "text-green-400" : "text-orange-400"}>
                {debug.countOnIncrease ? "증가" : "감소"} 시 카운트
              </span>
            </div>
          </div>

          <div className="flex justify-between">
            <span>왼쪽 각도:</span>
            <span className="text-white">{debug.leftAngle}°</span>
          </div>

          <div className="flex justify-between">
            <span>오른쪽 각도:</span>
            <span className="text-white">{debug.rightAngle}°</span>
          </div>

          <div className="flex justify-between border-t border-white/20 pt-1 mt-1">
            <span>현재 각도:</span>
            <span className={`font-bold ${debug.targetReached ? "text-green-400" : "text-white"}`}>
              {debug.maxAngle}°
            </span>
          </div>

          <div className="flex justify-between">
            <span>상대 각도:</span>
            <span className="text-orange-400">{debug.relativeAngle > 0 ? "+" : ""}{debug.relativeAngle}°</span>
          </div>

          <div className="flex justify-between">
            <span>목표 달성:</span>
            <span className={debug.targetReached ? "text-green-400" : "text-red-400"}>
              {debug.targetReached ? "✓ 달성" : "✗ 미달"}
            </span>
          </div>

          <div className="flex justify-between">
            <span>상태:</span>
            <span className={debug.state === "active" ? "text-blue-400" : "text-gray-400"}>
              {debug.state === "active" ? "ACTIVE" : "IDLE"}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
