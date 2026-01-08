/**
 * 테마 이미지 다운로드 스크립트
 * 실행: npx ts-node scripts/download-theme-images.ts
 * 또는: npx tsx scripts/download-theme-images.ts
 */

import fs from "fs"
import path from "path"

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN

if (!REPLICATE_API_TOKEN) {
  console.error("REPLICATE_API_TOKEN 환경 변수가 필요합니다.")
  console.log("실행: REPLICATE_API_TOKEN=your_token npx tsx scripts/download-theme-images.ts")
  process.exit(1)
}

// 테마 정의
const themes = [
  {
    id: "dungeon",
    prompt: "dark fantasy dungeon entrance with glowing purple crystals, ancient stone archway, burning torches on walls, mysterious fog, epic adventure game art style, dramatic lighting, 16:9 aspect ratio",
    seed: 1001,
  },
  {
    id: "space",
    prompt: "futuristic spaceship cockpit interior with holographic displays, colorful nebula and planets visible through large window, sci-fi control panels, stars and galaxies, epic space adventure atmosphere, 16:9 aspect ratio",
    seed: 1002,
  },
  {
    id: "zombie",
    prompt: "zombie horde attacking in destroyed city ruins, undead monsters with rotting flesh emerging from darkness, blood and gore horror scene, apocalyptic nightmare atmosphere, The Walking Dead style, night scene with burning fires and smoke, terrifying survival horror, 16:9 aspect ratio",
    seed: 1003,
  },
  {
    id: "healing",
    prompt: "peaceful countryside cottage with colorful flower garden, warm golden sunset lighting, gentle rolling green hills, studio ghibli inspired style, cozy relaxing atmosphere, 16:9 aspect ratio",
    seed: 1004,
  },
]

async function generateImage(prompt: string, seed: number): Promise<string> {
  console.log(`  Replicate API 호출 중...`)

  const response = await fetch(
    "https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          prompt,
          seed,
          num_outputs: 1,
          aspect_ratio: "16:9",
          output_format: "webp",
          output_quality: 90,
        },
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`API 오류: ${await response.text()}`)
  }

  let prediction = await response.json()

  // 완료 대기 (최대 60초)
  let attempts = 0
  while (prediction.status !== "succeeded" && prediction.status !== "failed" && attempts < 60) {
    await new Promise((r) => setTimeout(r, 1000))
    const pollResponse = await fetch(prediction.urls.get, {
      headers: { Authorization: `Bearer ${REPLICATE_API_TOKEN}` },
    })
    prediction = await pollResponse.json()
    attempts++
    process.stdout.write(".")
  }
  console.log()

  if (prediction.status === "failed" || !prediction.output?.[0]) {
    throw new Error("이미지 생성 실패")
  }

  return prediction.output[0]
}

async function downloadImage(url: string, filepath: string): Promise<void> {
  const response = await fetch(url)
  const buffer = Buffer.from(await response.arrayBuffer())
  fs.writeFileSync(filepath, buffer)
}

async function main() {
  const outputDir = path.join(process.cwd(), "public", "images", "themes")

  // 디렉토리 생성
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  console.log("=== 테마 이미지 생성 시작 ===\n")

  for (const theme of themes) {
    const filepath = path.join(outputDir, `${theme.id}.webp`)

    // 이미 존재하면 스킵
    if (fs.existsSync(filepath)) {
      console.log(`[${theme.id}] 이미 존재함 - 스킵`)
      continue
    }

    console.log(`[${theme.id}] 이미지 생성 중...`)

    try {
      const imageUrl = await generateImage(theme.prompt, theme.seed)
      console.log(`  다운로드 중...`)
      await downloadImage(imageUrl, filepath)
      console.log(`  저장 완료: ${filepath}`)
    } catch (error) {
      console.error(`  오류: ${error}`)
    }

    console.log()
  }

  console.log("=== 완료 ===")
}

main().catch(console.error)
