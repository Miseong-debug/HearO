"use client"

import { useCallback, useRef } from "react"

export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }
    return audioContextRef.current
  }, [])

  // 반복 카운트 효과음 (상승하는 밝은 톤)
  const playRepSound = useCallback(() => {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // 오실레이터 생성
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gainNode = ctx.createGain()

    // 화음으로 밝은 느낌
    osc1.type = "sine"
    osc1.frequency.setValueAtTime(523.25, now) // C5
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.1) // E5

    osc2.type = "sine"
    osc2.frequency.setValueAtTime(659.25, now) // E5
    osc2.frequency.exponentialRampToValueAtTime(783.99, now + 0.1) // G5

    // 볼륨 엔벨로프
    gainNode.gain.setValueAtTime(0.3, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15)

    // 연결
    osc1.connect(gainNode)
    osc2.connect(gainNode)
    gainNode.connect(ctx.destination)

    // 재생
    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.15)
    osc2.stop(now + 0.15)
  }, [getAudioContext])

  // 목표 달성 효과음 (팡파레)
  const playAchievementSound = useCallback(() => {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = "sine"
      osc.frequency.value = freq

      const startTime = now + i * 0.1
      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(startTime)
      osc.stop(startTime + 0.3)
    })
  }, [getAudioContext])

  return {
    playRepSound,
    playAchievementSound,
  }
}
