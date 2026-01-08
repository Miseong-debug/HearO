import { NextResponse } from "next/server"

// Pollinations.ai 무료 폴백
function generateWithPollinations(prompt: string): string {
  const cleanPrompt = prompt
    .replace(/[^\w\s,.-]/g, '')
    .slice(0, 200)
  const encodedPrompt = encodeURIComponent(cleanPrompt)
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1792&height=1024&nologo=true`
}

// Replicate Flux로 이미지 생성
async function generateWithReplicate(prompt: string, apiToken: string, seed?: number): Promise<string> {
  const input: Record<string, unknown> = {
    prompt: prompt,
    num_outputs: 1,
    aspect_ratio: "16:9",
    output_format: "webp",
    output_quality: 80,
  }

  // seed가 있으면 추가 (같은 seed = 같은 이미지)
  if (seed !== undefined) {
    input.seed = seed
  }

  const response = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error("Replicate API 오류:", error)
    throw new Error("Replicate API 실패")
  }

  let prediction = await response.json()

  // 최대 30초 대기
  let attempts = 0
  while (prediction.status !== "succeeded" && prediction.status !== "failed" && attempts < 30) {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const pollResponse = await fetch(prediction.urls.get, {
      headers: {
        "Authorization": `Bearer ${apiToken}`,
      },
    })
    prediction = await pollResponse.json()
    attempts++
  }

  if (prediction.status === "failed" || !prediction.output?.[0]) {
    throw new Error("이미지 생성 실패")
  }

  return prediction.output[0]
}

export async function POST(req: Request) {
  try {
    const { prompt, seed } = await req.json()

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: "프롬프트가 필요합니다" }, { status: 400 })
    }

    const apiToken = process.env.REPLICATE_API_TOKEN
    let imageUrl: string
    let provider: string

    // Replicate 시도, 실패 시 Pollinations 폴백
    if (apiToken) {
      try {
        imageUrl = await generateWithReplicate(prompt, apiToken, seed)
        provider = "replicate-flux"
      } catch (error) {
        console.log("Replicate 실패, Pollinations로 폴백:", error)
        imageUrl = generateWithPollinations(prompt)
        provider = "pollinations"
      }
    } else {
      imageUrl = generateWithPollinations(prompt)
      provider = "pollinations"
    }

    return NextResponse.json({
      image: imageUrl,
      provider,
    })
  } catch (error) {
    console.error("이미지 생성 중 오류:", error)
    return NextResponse.json({
      image: generateWithPollinations("fantasy adventure scene"),
      provider: "pollinations-fallback",
    })
  }
}
