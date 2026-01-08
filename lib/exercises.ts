// 운동 설정 파일
// MediaPipe Pose Landmarks: https://developers.google.com/mediapipe/solutions/vision/pose_landmarker

export type ExerciseId = "armRaise" | "squat" | "pushup" | "lunge" | "heelSlide"

// MediaPipe 랜드마크 인덱스
export const LANDMARKS = {
  // 상체
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  // 하체
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const

export type LandmarkSide = "left" | "right" | "both"

export interface ExerciseLandmarks {
  // 각도 계산을 위한 3개 포인트 (point2를 꼭짓점으로 각도 계산)
  point1: { left: number; right: number }
  point2: { left: number; right: number }  // 꼭짓점 (각도의 중심)
  point3: { left: number; right: number }
  // 어느 쪽을 측정할지
  side: LandmarkSide
}

export interface ExerciseConfig {
  id: ExerciseId
  name: string
  nameEn: string
  icon: string  // lucide icon name or emoji
  description: string
  instruction: string  // 운동 방법 안내
  setup: string | null  // 시작 전 자세 안내 (null이면 안내 없음)
  landmarks: ExerciseLandmarks
  // 각도 설정
  defaultBaselineAngle: number  // 기본 시작 각도 (캘리브레이션 없을 때)
  targetAngleDelta: number  // 기준 각도에서 목표까지의 변화량
  resetAngleDelta: number  // 리셋 판정 기준 (기준 각도 + 이 값 이하로 내려오면 리셋)
  // 각도 방향 (true: 각도가 커지면 카운트, false: 각도가 작아지면 카운트)
  countOnIncrease: boolean
  // 색상 (UI용)
  color: string
  gradient: string
}

export const EXERCISES: Record<ExerciseId, ExerciseConfig> = {
  armRaise: {
    id: "armRaise",
    name: "팔올리기",
    nameEn: "Arm Raise",
    icon: "🙋",
    description: "어깨 관절 가동범위 회복",
    instruction: "팔을 옆으로 천천히 들어올리세요",
    setup: null,
    landmarks: {
      point1: { left: LANDMARKS.LEFT_ELBOW, right: LANDMARKS.RIGHT_ELBOW },
      point2: { left: LANDMARKS.LEFT_SHOULDER, right: LANDMARKS.RIGHT_SHOULDER },
      point3: { left: LANDMARKS.LEFT_HIP, right: LANDMARKS.RIGHT_HIP },
      side: "both",
    },
    defaultBaselineAngle: 30,
    targetAngleDelta: 60,  // 기준 + 60° 도달 시 카운트
    resetAngleDelta: 30,   // 기준 + 30° 이하로 내려오면 리셋
    countOnIncrease: true,
    color: "blue",
    gradient: "from-blue-500 to-cyan-500",
  },

  squat: {
    id: "squat",
    name: "스쿼트",
    nameEn: "Squat",
    icon: "🏋️",
    description: "하체 근력 강화",
    instruction: "무릎을 90도까지 굽히세요",
    setup: "카메라가 옆모습을 볼 수 있도록 서주세요",
    landmarks: {
      point1: { left: LANDMARKS.LEFT_HIP, right: LANDMARKS.RIGHT_HIP },
      point2: { left: LANDMARKS.LEFT_KNEE, right: LANDMARKS.RIGHT_KNEE },
      point3: { left: LANDMARKS.LEFT_ANKLE, right: LANDMARKS.RIGHT_ANKLE },
      side: "both",
    },
    defaultBaselineAngle: 170,  // 서있을 때 거의 펴진 상태
    targetAngleDelta: -80,  // 기준 - 80° (약 90°) 도달 시 카운트
    resetAngleDelta: -30,   // 기준 - 30° 이상으로 올라오면 리셋
    countOnIncrease: false,  // 각도가 작아지면 카운트
    color: "orange",
    gradient: "from-orange-500 to-amber-500",
  },

  pushup: {
    id: "pushup",
    name: "팔굽혀펴기",
    nameEn: "Push-up",
    icon: "💪",
    description: "상체 근력 강화",
    instruction: "팔꿈치를 90도로 굽히세요",
    setup: "카메라가 옆모습을 볼 수 있도록 엎드려주세요",
    landmarks: {
      point1: { left: LANDMARKS.LEFT_SHOULDER, right: LANDMARKS.RIGHT_SHOULDER },
      point2: { left: LANDMARKS.LEFT_ELBOW, right: LANDMARKS.RIGHT_ELBOW },
      point3: { left: LANDMARKS.LEFT_WRIST, right: LANDMARKS.RIGHT_WRIST },
      side: "both",
    },
    defaultBaselineAngle: 160,  // 팔 펴진 상태
    targetAngleDelta: -70,  // 기준 - 70° (약 90°) 도달 시 카운트
    resetAngleDelta: -20,   // 기준 - 20° 이상으로 올라오면 리셋
    countOnIncrease: false,
    color: "red",
    gradient: "from-red-500 to-rose-500",
  },

  lunge: {
    id: "lunge",
    name: "런지",
    nameEn: "Lunge",
    icon: "🚶",
    description: "하체 균형 및 근력 강화",
    instruction: "앞다리 무릎을 90도로 굽히세요",
    setup: "카메라가 옆모습을 볼 수 있도록 서주세요",
    landmarks: {
      point1: { left: LANDMARKS.LEFT_HIP, right: LANDMARKS.RIGHT_HIP },
      point2: { left: LANDMARKS.LEFT_KNEE, right: LANDMARKS.RIGHT_KNEE },
      point3: { left: LANDMARKS.LEFT_ANKLE, right: LANDMARKS.RIGHT_ANKLE },
      side: "left",  // 기본적으로 왼쪽 다리 (앞다리)
    },
    defaultBaselineAngle: 170,
    targetAngleDelta: -80,
    resetAngleDelta: -30,
    countOnIncrease: false,
    color: "green",
    gradient: "from-green-500 to-emerald-500",
  },

  heelSlide: {
    id: "heelSlide",
    name: "Heel Slide",
    nameEn: "Heel Slide",
    icon: "🦵",
    description: "무릎 수술 후 관절가동범위 회복",
    instruction: "발뒤꿈치를 천천히 끌어당기세요",
    setup: "옆으로 앉아서 다리가 카메라에 보이게 해주세요.\n다리를 쭉 펴고 바닥에 앉은 상태에서 시작합니다.",
    landmarks: {
      point1: { left: LANDMARKS.LEFT_HIP, right: LANDMARKS.RIGHT_HIP },
      point2: { left: LANDMARKS.LEFT_KNEE, right: LANDMARKS.RIGHT_KNEE },
      point3: { left: LANDMARKS.LEFT_ANKLE, right: LANDMARKS.RIGHT_ANKLE },
      side: "left",  // 재활하는 다리 선택
    },
    defaultBaselineAngle: 170,  // 다리 펴진 상태
    targetAngleDelta: -50,  // 기준 - 50° (약 120°) 도달 시 카운트
    resetAngleDelta: -20,   // 기준 - 20° 이상으로 펴지면 리셋
    countOnIncrease: false,
    color: "purple",
    gradient: "from-purple-500 to-violet-500",
  },
}

// 운동 목록 배열
export const EXERCISE_LIST = Object.values(EXERCISES)

// 운동 ID로 설정 가져오기
export function getExerciseConfig(id: ExerciseId): ExerciseConfig {
  return EXERCISES[id]
}

// 기본 운동
export const DEFAULT_EXERCISE: ExerciseId = "armRaise"
