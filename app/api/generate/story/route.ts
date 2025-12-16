import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { reps = 0, score = 0, duration = 0, theme = "fantasy" } =
      await req.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY 없음")
    }

    const prompt = `
오늘 재활 운동 결과:
- 반복 횟수: ${reps}
- 점수: ${score}
- 운동 시간: ${duration}초
- 테마: ${theme}

이 결과를 바탕으로
200자 내외의 감정적인 RPG 스타일 스토리를 생성해줘.
한국어로 작성해줘.
`.trim()

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
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
        }),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      console.error("Gemini error response:", data)
      throw new Error("Gemini API 실패")
    }

    const story =
      data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!story) {
      throw new Error("스토리 결과가 비어 있음")
    }

    return NextResponse.json({ story })
  } catch (error) {
    console.error("STORY API ERROR:", error)
    return NextResponse.json(
      { error: "스토리 생성 실패" },
      { status: 500 }
    )
  }
}
