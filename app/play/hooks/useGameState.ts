"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { recordGameComplete } from "@/lib/profiles"
import { AngleInfo } from "@/app/exercise/hooks/useAngle"
import { ExerciseId, DEFAULT_EXERCISE } from "@/lib/exercises"

export type Theme = "dungeon" | "space" | "zombie" | "healing"
export type EventType = "story" | "battle" | "obstacle" | "treasure" | "boss"

export interface StoryEvent {
  type: EventType
  narrative: string
  exerciseTarget?: number
  reward?: {
    exp: number
    item?: string
  }
}

export interface Chapter {
  title: string
  events: StoryEvent[]
}

export interface GameState {
  theme: Theme
  nickname: string
  chapter: Chapter | null
  currentEventIndex: number
  totalExp: number
  isExercising: boolean
  exerciseReps: number
  exerciseAngles: AngleInfo | null
  isLoading: boolean
  isCompleted: boolean
  currentImageUrl: string | null
  isImageLoading: boolean
}

interface GameHistory {
  id: string
  theme: Theme
  nickname: string
  chapterTitle: string
  totalExp: number
  completedAt: string
  eventCount: number
}

const STORAGE_KEY = "hearo_game_history"

export function useGameState(
  theme: Theme,
  eventCount: number,
  nickname: string,
  profileId?: string,
  exerciseId: ExerciseId = DEFAULT_EXERCISE
) {
  // 중복 로드 방지용 ref
  const hasLoadedRef = useRef(false)

  const [state, setState] = useState<GameState>({
    theme,
    nickname,
    chapter: null,
    currentEventIndex: 0,
    totalExp: 0,
    isExercising: false,
    exerciseReps: 0,
    exerciseAngles: null,
    isLoading: true,
    isCompleted: false,
    currentImageUrl: null,
    isImageLoading: false
  })

  // 테마별 캐릭터 및 배경 (비주얼 노벨 스타일)
  const themeImageStyles: Record<Theme, { character: string; background: string }> = {
    dungeon: {
      character: "elderly fantasy wizard with long white beard, purple robe with magical runes, tall pointed hat, holding wooden staff with glowing crystal, wise mentor character",
      background: "dark medieval dungeon with stone walls, burning torches on walls, ancient magical symbols, mysterious fog"
    },
    space: {
      character: "female android with glowing cyan eyes, sleek white metallic body armor, short silver hair, holographic HUD display near face, friendly sci-fi companion",
      background: "spaceship control bridge with holographic displays, stars and nebula visible through large windows, futuristic control panels"
    },
    zombie: {
      character: "rugged male military survivor with short hair and stubble, worn tactical vest with patches, bandana around neck, walkie-talkie on shoulder, battle-scarred veteran",
      background: "abandoned city street with wrecked cars, broken storefronts, overcast sky, distant smoke plumes"
    },
    healing: {
      character: "gentle female village healer with long braided hair, wearing simple linen dress with herb pouch, flower crown, warm motherly smile, nature spirit aura",
      background: "peaceful countryside village with thatched cottages, blooming flower garden, warm golden sunset lighting, gentle rolling hills"
    }
  }

  // 이벤트 타입별 표정 및 포즈
  const eventActionStyles: Record<EventType, string> = {
    story: "calm gentle smile, relaxed posture, welcoming expression",
    battle: "fierce determined expression, battle-ready stance, intense focused eyes",
    obstacle: "worried concerned expression, cautious alert posture",
    treasure: "excited joyful smile, surprised happy expression, sparkling eyes",
    boss: "serious intense expression, dramatic tension, narrowed eyes"
  }

  // 이미지 생성
  const generateImage = useCallback(async (event: StoryEvent) => {
    try {
      const style = themeImageStyles[theme]
      const action = eventActionStyles[event.type]

      // 비주얼 노벨 스타일 프롬프트 (캐릭터 사이드 배치)
      const prompt = `visual novel game screenshot, ${style.character}, ${action}, upper body portrait on left side of frame, character turned slightly toward center, ${style.background} visible on right side, anime illustration style, detailed expressive face, soft lighting, clean linework, high quality 2D game art, dialogue scene composition`

      const res = await fetch("/api/generate/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      })

      if (res.ok) {
        const data = await res.json()
        setState(prev => ({
          ...prev,
          currentImageUrl: data.image || null,
          isImageLoading: false
        }))
      } else {
        setState(prev => ({ ...prev, isImageLoading: false }))
      }
    } catch (error) {
      console.error("이미지 생성 실패:", error)
      setState(prev => ({ ...prev, isImageLoading: false }))
    }
  }, [theme])

  // 챕터 로드
  const loadChapter = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }))

    try {
      const res = await fetch("/api/generate/chapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, eventCount, nickname, exerciseId })
      })

      if (!res.ok) throw new Error("챕터 로드 실패")

      const chapter: Chapter = await res.json()

      setState(prev => ({
        ...prev,
        chapter,
        currentEventIndex: 0,
        isLoading: false,
        isCompleted: false
      }))
    } catch (error) {
      console.error("챕터 로드 에러:", error)
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [theme, eventCount, nickname, exerciseId])

  // 현재 이벤트
  const currentEvent = state.chapter?.events[state.currentEventIndex] || null

  // 운동 시작
  const startExercise = useCallback(() => {
    setState(prev => ({
      ...prev,
      isExercising: true,
      exerciseReps: 0,
      exerciseAngles: null
    }))
  }, [])

  // 운동 진행 업데이트
  const updateExercise = useCallback((reps: number, angles: AngleInfo | null) => {
    setState(prev => ({
      ...prev,
      exerciseReps: reps,
      exerciseAngles: angles
    }))
  }, [])

  // 운동 완료 & 다음 이벤트로
  const completeExercise = useCallback(() => {
    setState(prev => {
      const event = prev.chapter?.events[prev.currentEventIndex]
      const expGain = event?.reward?.exp || 0

      return {
        ...prev,
        isExercising: false,
        totalExp: prev.totalExp + expGain
      }
    })
  }, [])

  // 다음 이벤트로 진행
  const nextEvent = useCallback(() => {
    setState(prev => {
      const nextIndex = prev.currentEventIndex + 1
      const totalEvents = prev.chapter?.events.length || 0

      if (nextIndex >= totalEvents) {
        return { ...prev, isCompleted: true }
      }

      return {
        ...prev,
        currentEventIndex: nextIndex,
        exerciseReps: 0,
        exerciseAngles: null,
        currentImageUrl: null,
        isImageLoading: true
      }
    })
  }, [])

  // 게임 완료 시 히스토리 저장 및 프로필 통계 업데이트
  const saveToHistory = useCallback(() => {
    if (!state.chapter) return

    const history: GameHistory = {
      id: Date.now().toString(),
      theme: state.theme,
      nickname: state.nickname,
      chapterTitle: state.chapter.title,
      totalExp: state.totalExp,
      completedAt: new Date().toISOString(),
      eventCount: state.chapter.events.length
    }

    try {
      const existing = localStorage.getItem(STORAGE_KEY)
      const histories: GameHistory[] = existing ? JSON.parse(existing) : []
      histories.unshift(history)
      // 최근 20개만 유지
      const trimmed = histories.slice(0, 20)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))

      // 프로필 통계 업데이트
      if (profileId) {
        recordGameComplete(profileId, state.totalExp)
      }
    } catch (error) {
      console.error("히스토리 저장 실패:", error)
    }
  }, [state.chapter, state.theme, state.nickname, state.totalExp, profileId])

  // 히스토리 불러오기
  const getHistory = useCallback((): GameHistory[] => {
    try {
      const existing = localStorage.getItem(STORAGE_KEY)
      return existing ? JSON.parse(existing) : []
    } catch {
      return []
    }
  }, [])

  // 초기 로드 (중복 실행 방지)
  useEffect(() => {
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true
    loadChapter()
  }, [loadChapter])

  // 이벤트 변경 시 이미지 생성
  useEffect(() => {
    if (currentEvent && !state.isLoading) {
      generateImage(currentEvent)
    }
  }, [state.currentEventIndex, state.isLoading, currentEvent, generateImage])

  return {
    state,
    currentEvent,
    loadChapter,
    startExercise,
    updateExercise,
    completeExercise,
    nextEvent,
    saveToHistory,
    getHistory
  }
}
