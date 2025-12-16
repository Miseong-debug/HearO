import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: "프롬프트가 필요합니다" }, { status: 400 })
    }

    // Pollinations.ai 무료 이미지 생성
    const encodedPrompt = encodeURIComponent(prompt)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`

    return NextResponse.json({ image: imageUrl })
  } catch (error) {
    console.error("이미지 생성 중 오류:", error)
    return NextResponse.json(
      { error: "이미지 생성 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}