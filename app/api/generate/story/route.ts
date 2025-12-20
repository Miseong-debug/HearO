import { NextResponse } from "next/server"
import { getWorldview, calculateProgress } from "@/lib/story/worldviews"

export async function POST(req: Request) {
  try {
    const {
      reps = 0,
      score = 0,
      duration = 0,
      targetReps = 10,
      worldviewId = "fantasy",
      userName = "용사",
      chapter = 1,
    } = await req.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY 없음")
    }

    // 세계관 정보 가져오기
    const worldview = getWorldview(worldviewId)
    const progress = calculateProgress(reps, targetReps, score)

    // 운동 시간 포맷
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    const durationText = minutes > 0 ? `${minutes}분 ${seconds}초` : `${seconds}초`

    const prompt = `
당신은 재활 운동 앱을 위한 스토리 작가입니다.
사용자의 운동 결과를 바탕으로 몰입감 있는 스토리를 생성합니다.

## 세계관: ${worldview.nameKo}
${worldview.setting}

## 주인공
- 이름: ${userName}
- 역할: ${worldview.protagonist}

## 오늘의 운동 결과
- 현재 챕터: ${chapter}장
- 반복 횟수: ${reps}회 (목표: ${targetReps}회)
- 자세 점수: ${score}점
- 운동 시간: ${durationText}
- 성과 레벨: ${progress.description} (${Math.round(progress.progressPercent)}%)

## 작성 지침
1. ${worldview.tone} 톤으로 작성
2. 운동 결과가 스토리 속 성과와 연결되어야 함
3. ${progress.level === "epic" ? "대단한 업적을 달성한 영웅적인" : progress.level === "great" ? "훌륭한 성과를 이룬" : progress.level === "good" ? "꾸준히 성장하는" : "첫 발을 내딛는"} 장면을 묘사
4. 다음 챕터를 향한 기대감 형성
5. 키워드 활용: ${worldview.keywords.slice(0, 4).join(", ")}

## 출력 형식
250-350자의 한국어 스토리를 생성하세요.
챕터 제목 없이 본문만 작성하세요.
`.trim()

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 500,
          },
        }),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      console.error("Gemini error response:", data)
      throw new Error("Gemini API 실패")
    }

    const story = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!story) {
      throw new Error("스토리 결과가 비어 있음")
    }

    // 이미지 프롬프트도 함께 생성
    const imagePrompt = generateImagePrompt(worldview, progress.level)

    return NextResponse.json({
      story: story.trim(),
      worldview: worldview.nameKo,
      progress: progress,
      imagePrompt,
      chapter,
    })
  } catch (error) {
    console.error("STORY API ERROR:", error)
    return NextResponse.json(
      { error: "스토리 생성 실패" },
      { status: 500 }
    )
  }
}

function generateImagePrompt(
  worldview: ReturnType<typeof getWorldview>,
  level: string
): string {
  const levelDescriptions = {
    epic: "triumphant hero, glowing aura, legendary achievement",
    great: "confident warrior, victorious pose, impressive scene",
    good: "determined adventurer, steady progress, hopeful atmosphere",
    normal: "young apprentice, beginning journey, dawn of adventure",
  }

  const levelDesc = levelDescriptions[level as keyof typeof levelDescriptions] || levelDescriptions.good

  return `${worldview.imageStyle}, ${levelDesc}, single character, cinematic composition, high quality, vibrant colors`
}
