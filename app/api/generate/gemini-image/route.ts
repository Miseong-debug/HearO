import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: "프롬프트가 필요합니다" }, { status: 400 })
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_GEMINI_API_KEY가 설정되지 않았습니다" },
        { status: 500 }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)

    // Gemini 2.0 Flash 모델 사용 (이미지 생성 지원)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: ["image", "text"],
      } as any,
    })

    // 판타지 RPG 스타일 프롬프트 생성
    const enhancedPrompt = `Create a fantasy RPG style illustration: ${prompt}.
    Style: vibrant colors, detailed fantasy art, game illustration style, epic atmosphere,
    high quality digital art, dramatic lighting.`

    const response = await model.generateContent(enhancedPrompt)
    const result = response.response

    // 응답에서 이미지 데이터 추출
    const parts = result.candidates?.[0]?.content?.parts

    if (!parts) {
      return NextResponse.json(
        { error: "이미지 생성에 실패했습니다" },
        { status: 500 }
      )
    }

    let imageData: string | null = null
    let textResponse: string | null = null

    for (const part of parts) {
      if (part.inlineData) {
        const mimeType = part.inlineData.mimeType
        const data = part.inlineData.data
        imageData = `data:${mimeType};base64,${data}`
      }
      if (part.text) {
        textResponse = part.text
      }
    }

    if (!imageData) {
      return NextResponse.json(
        {
          error: "이미지가 생성되지 않았습니다. 다른 프롬프트를 시도해보세요.",
          text: textResponse
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      image: imageData,
      text: textResponse,
      provider: "gemini",
    })
  } catch (error: any) {
    console.error("Gemini 이미지 생성 중 오류:", error)
    return NextResponse.json(
      { error: error.message || "이미지 생성 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
