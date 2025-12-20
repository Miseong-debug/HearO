import { NextResponse } from "next/server"

// 이미지 생성 제공자 타입
type ImageProvider = "huggingface" | "pollinations"

export async function POST(req: Request) {
  try {
    const { prompt, provider = "huggingface" } = await req.json()

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: "프롬프트가 필요합니다" }, { status: 400 })
    }

    // 안전한 프롬프트로 변환 (부적절한 내용 필터링)
    const safePrompt = sanitizePrompt(prompt)

    let imageResult: { url: string; provider: string } | null = null

    // 1차 시도: Hugging Face FLUX
    if (provider === "huggingface" || provider === "pollinations") {
      imageResult = await tryHuggingFace(safePrompt)
    }

    // 2차 시도: Pollinations (폴백)
    if (!imageResult) {
      imageResult = await tryPollinations(safePrompt)
    }

    if (!imageResult) {
      throw new Error("모든 이미지 생성 서비스 실패")
    }

    return NextResponse.json({
      image: imageResult.url,
      provider: imageResult.provider,
    })
  } catch (error) {
    console.error("이미지 생성 중 오류:", error)
    return NextResponse.json(
      { error: "이미지 생성 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// 프롬프트 안전화
function sanitizePrompt(prompt: string): string {
  // 기본 필터링 - 영어로 변환 및 안전한 내용만 유지
  const sanitized = prompt
    .replace(/[^\w\s,.\-가-힣]/g, "")
    .substring(0, 500)

  return sanitized
}

// Hugging Face FLUX.1-schnell 사용
async function tryHuggingFace(prompt: string): Promise<{ url: string; provider: string } | null> {
  const apiKey = process.env.HUGGINGFACE_API_KEY

  if (!apiKey) {
    console.log("HUGGINGFACE_API_KEY 없음, 폴백 사용")
    return null
  }

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            num_inference_steps: 4,
            guidance_scale: 0,
          },
        }),
      }
    )

    if (!response.ok) {
      console.error("Hugging Face API 오류:", response.status, await response.text())
      return null
    }

    // 이미지 blob을 base64로 변환
    const blob = await response.blob()
    const buffer = await blob.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    const dataUrl = `data:image/jpeg;base64,${base64}`

    return { url: dataUrl, provider: "huggingface" }
  } catch (error) {
    console.error("Hugging Face 오류:", error)
    return null
  }
}

// Pollinations.ai 사용 (폴백)
async function tryPollinations(prompt: string): Promise<{ url: string; provider: string } | null> {
  try {
    const encodedPrompt = encodeURIComponent(prompt)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${Date.now()}`

    // URL이 유효한지 확인 (HEAD 요청)
    const checkResponse = await fetch(imageUrl, { method: "HEAD" })

    if (checkResponse.ok) {
      return { url: imageUrl, provider: "pollinations" }
    }

    return null
  } catch (error) {
    console.error("Pollinations 오류:", error)
    return null
  }
}