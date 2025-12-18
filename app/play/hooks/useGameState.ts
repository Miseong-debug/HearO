"use client"

import { useState, useCallback, useEffect } from "react"

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
  chapter: Chapter | null
  currentEventIndex: number
  totalExp: number
  isExercising: boolean
  exerciseReps: number
  exerciseScore: number
  isLoading: boolean
  isCompleted: boolean
}

interface GameHistory {
  id: string
  theme: Theme
  chapterTitle: string
  totalExp: number
  completedAt: string
  eventCount: number
}

const STORAGE_KEY = "hearo_game_history"

export function useGameState(theme: Theme, eventCount: number) {
  const [state, setState] = useState<GameState>({
    theme,
    chapter: null,
    currentEventIndex: 0,
    totalExp: 0,
    isExercising: false,
    exerciseReps: 0,
    exerciseScore: 0,
    isLoading: true,
    isCompleted: false
  })

  // 챕터 로드
  const loadChapter = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }))

    try {
      const res = await fetch("/api/generate/chapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, eventCount })
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
  }, [theme, eventCount])

  // 현재 이벤트
  const currentEvent = state.chapter?.events[state.currentEventIndex] || null

  // 운동 시작
  const startExercise = useCallback(() => {
    setState(prev => ({
      ...prev,
      isExercising: true,
      exerciseReps: 0,
      exerciseScore: 0
    }))
  }, [])

  // 운동 진행 업데이트
  const updateExercise = useCallback((reps: number, score: number) => {
    setState(prev => ({
      ...prev,
      exerciseReps: reps,
      exerciseScore: score
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
        exerciseScore: 0
      }
    })
  }, [])

  // 게임 완료 시 히스토리 저장
  const saveToHistory = useCallback(() => {
    if (!state.chapter) return

    const history: GameHistory = {
      id: Date.now().toString(),
      theme: state.theme,
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
    } catch (error) {
      console.error("히스토리 저장 실패:", error)
    }
  }, [state.chapter, state.theme, state.totalExp])

  // 히스토리 불러오기
  const getHistory = useCallback((): GameHistory[] => {
    try {
      const existing = localStorage.getItem(STORAGE_KEY)
      return existing ? JSON.parse(existing) : []
    } catch {
      return []
    }
  }, [])

  // 초기 로드
  useEffect(() => {
    loadChapter()
  }, [loadChapter])

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
