import { NextResponse } from "next/server"

const themeDescriptions: Record<string, { name: string; setting: string; enemies: string }> = {
  dungeon: {
    name: "던전 탐험",
    setting: "어둡고 신비로운 지하 던전",
    enemies: "고블린, 슬라임, 오크, 스켈레톤, 드래곤"
  },
  space: {
    name: "우주 탐사",
    setting: "광활한 우주와 미지의 행성",
    enemies: "외계인, 운석, 고장난 로봇, AI 시스템"
  },
  zombie: {
    name: "좀비 서바이벌",
    setting: "좀비 아포칼립스로 황폐해진 도시",
    enemies: "좀비, 감염자, 바리케이드, 폐허"
  },
  healing: {
    name: "일상 힐링",
    setting: "평화로운 마을과 아늑한 집",
    enemies: "길고양이, 반죽, 잡초, 먼지"
  }
}

export async function POST(req: Request) {
  try {
    const { theme = "dungeon", eventCount = 5 } = await req.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY 없음")
    }

    const themeInfo = themeDescriptions[theme] || themeDescriptions.dungeon

    const prompt = `
당신은 재활 운동을 RPG 게임처럼 만드는 스토리 작가입니다.
테마: ${themeInfo.name}
배경: ${themeInfo.setting}
등장하는 적/장애물: ${themeInfo.enemies}

다음 조건으로 챕터를 생성해주세요:
1. 총 ${eventCount}개의 이벤트로 구성
2. 이벤트 타입: story(스토리만), battle(전투), obstacle(장애물), treasure(보물), boss(보스)
3. 첫 이벤트는 반드시 story 타입 (도입부)
4. 마지막 이벤트는 boss 타입 (클라이맥스)
5. 운동이 필요한 이벤트(battle, obstacle, treasure, boss)에는 exerciseTarget(3~15 사이)과 reward 포함
6. 각 narrative는 2-3문장, 한국어로, 생동감 있게

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만:
{
  "title": "챕터 제목",
  "events": [
    {
      "type": "story",
      "narrative": "스토리 텍스트..."
    },
    {
      "type": "battle",
      "narrative": "전투 상황 설명...",
      "exerciseTarget": 10,
      "reward": { "exp": 15 }
    }
  ]
}
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

    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!responseText) {
      throw new Error("챕터 생성 결과가 비어 있음")
    }

    // JSON 파싱
    let chapter
    try {
      // 혹시 ```json ... ``` 형식으로 왔을 경우 처리
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/)
      const jsonStr = jsonMatch ? jsonMatch[1] : responseText
      chapter = JSON.parse(jsonStr.trim())
    } catch (parseError) {
      console.error("JSON parse error:", parseError, responseText)
      throw new Error("챕터 JSON 파싱 실패")
    }

    return NextResponse.json(chapter)
  } catch (error) {
    console.error("CHAPTER API ERROR:", error)
    return NextResponse.json(
      { error: "챕터 생성 실패" },
      { status: 500 }
    )
  }
}
