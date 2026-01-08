import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { worldviewId, reps, score, duration, targetReps, userName, chapter } = await req.json()

    const prompt = `
당신은 재활 운동 RPG 게임의 스토리 작가입니다.
환자가 영웅이 되어가는 이야기를 만들어주세요.

세계관: ${worldviewId}
챕터: ${chapter || 1}
플레이어 이름: ${userName || "영웅"}
운동 반복 횟수: ${reps}회 (목표: ${targetReps || reps}회)
자세 점수: ${score}점
운동 시간: ${Math.floor(duration / 60)}분

위 운동 데이터를 바탕으로 200자 내외의 짧은 영웅 서사를 한국어로 작성해주세요.
희망적이고 격려하는 톤으로 작성하세요.
    `.trim()

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    })

    const story = response.choices[0].message.content

    return NextResponse.json({ story })
  } catch (error) {
    console.error("스토리 생성 중 오류:", error)
    return NextResponse.json(
      { error: "스토리 생성 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}