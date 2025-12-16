"use client"

import { useCallback, useRef } from "react"

export function useVoiceGuide() {
  const isSpeakingRef = useRef(false)
  const lastRepAnnouncedRef = useRef(0)

  const speak = useCallback((text: string, priority: boolean = false) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return

    // 우선순위가 높은 메시지는 기존 음성 중단
    if (priority) {
      window.speechSynthesis.cancel()
    } else if (isSpeakingRef.current) {
      return // 이미 말하고 있으면 스킵
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "ko-KR"
    utterance.rate = 1.1 // 약간 빠르게
    utterance.pitch = 1.0
    utterance.volume = 0.8

    // 한국어 음성 찾기
    const voices = window.speechSynthesis.getVoices()
    const koreanVoice = voices.find((voice) => voice.lang.includes("ko"))
    if (koreanVoice) {
      utterance.voice = koreanVoice
    }

    utterance.onstart = () => {
      isSpeakingRef.current = true
    }
    utterance.onend = () => {
      isSpeakingRef.current = false
    }
    utterance.onerror = () => {
      isSpeakingRef.current = false
    }

    window.speechSynthesis.speak(utterance)
  }, [])

  // 운동 시작 안내
  const announceStart = useCallback(() => {
    speak("운동을 시작합니다. 팔을 천천히 올렸다 내려주세요.", true)
  }, [speak])

  // 운동 일시정지 안내
  const announcePause = useCallback(() => {
    speak("운동을 일시 정지합니다.", true)
  }, [speak])

  // 반복 카운트 안내 (5회 단위로)
  const announceRep = useCallback(
    (count: number, target: number) => {
      // 5회 단위 또는 목표 직전에만 안내
      if (count === lastRepAnnouncedRef.current) return

      if (count % 5 === 0 || count === target - 1) {
        lastRepAnnouncedRef.current = count
        if (count === target - 1) {
          speak(`${count}회. 마지막 한 번!`)
        } else {
          const remaining = target - count
          speak(`${count}회. ${remaining}회 남았습니다.`)
        }
      }
    },
    [speak]
  )

  // 목표 달성 안내
  const announceTargetReached = useCallback(() => {
    speak("축하합니다! 목표를 달성했습니다. 오늘의 스토리를 확인해보세요.", true)
  }, [speak])

  // 자세 교정 안내
  const announcePostureWarning = useCallback(
    (score: number) => {
      if (score < 50) {
        speak("자세를 바르게 해주세요. 어깨를 펴고 정면을 바라봐주세요.")
      }
    },
    [speak]
  )

  // 세션 종료 안내
  const announceFinish = useCallback(
    (reps: number, score: number) => {
      speak(`운동을 종료합니다. 총 ${reps}회, 평균 점수 ${score}점입니다.`, true)
    },
    [speak]
  )

  // 초기 안내
  const announceWelcome = useCallback(() => {
    speak("음성 가이드가 활성화되었습니다.", true)
  }, [speak])

  // 음성 가이드 끄기
  const announceOff = useCallback(() => {
    speak("음성 가이드를 종료합니다.", true)
  }, [speak])

  // 음성 중단
  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      isSpeakingRef.current = false
    }
  }, [])

  // 리셋
  const reset = useCallback(() => {
    lastRepAnnouncedRef.current = 0
    stop()
  }, [stop])

  return {
    speak,
    announceStart,
    announcePause,
    announceRep,
    announceTargetReached,
    announcePostureWarning,
    announceFinish,
    announceWelcome,
    announceOff,
    stop,
    reset,
  }
}
