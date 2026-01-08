import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// 운동별 스토리 액션 설명
const exerciseActions: Record<string, { name: string; action: string; examples: Record<string, string[]> }> = {
  armRaise: {
    name: "팔 들어올리기",
    action: "양팔을 머리 위로 높이 올렸다가 내리는 동작",
    examples: {
      dungeon: ["마법 주문을 외치며 지팡이를 하늘 높이 들어올려라!", "방패를 머리 위로 들어 적의 공격을 막아라!", "성스러운 빛을 소환하며 손을 하늘로 뻗어라!"],
      space: ["조종간을 위로 당겨 우주선을 상승시켜라!", "손을 높이 들어 신호를 보내라!", "에너지 실드를 활성화하며 양손을 들어올려라!"],
      zombie: ["바리케이드를 머리 위로 들어올려 문을 막아라!", "횃불을 높이 들어 좀비들을 위협해라!", "구조 신호를 보내며 손을 하늘로 뻗어라!"],
      healing: ["빨래를 높이 들어 빨랫줄에 널어라!", "꽃바구니를 들어올려 선반에 올려놓아라!", "하늘을 향해 기지개를 펴라!"]
    }
  },
  squat: {
    name: "스쿼트",
    action: "무릎을 굽혀 앉았다가 일어서는 동작",
    examples: {
      dungeon: ["낮은 자세로 적의 공격을 피하라!", "숨어서 함정을 피한 뒤 재빨리 일어서라!", "땅의 마력을 흡수하며 웅크렸다 일어서라!"],
      space: ["낮은 자세로 레이저를 피하라!", "중력 변화에 적응하며 앉았다 일어서라!", "우주복 점검을 위해 천천히 앉았다 일어서라!"],
      zombie: ["좀비의 습격을 피해 숨었다가 빠르게 일어나라!", "낮은 자세로 바리케이드 아래를 통과하라!", "경계하며 웅크렸다가 신속히 움직여라!"],
      healing: ["텃밭에서 채소를 수확하며 앉았다 일어서라!", "바닥의 꽃씨를 심으며 천천히 움직여라!", "아침 체조로 무릎 운동을 해라!"]
    }
  },
  pushup: {
    name: "팔굽혀펴기",
    action: "팔꿈치를 굽혀 몸을 낮췄다가 밀어올리는 동작",
    examples: {
      dungeon: ["땅을 밀어 함정에서 탈출하라!", "무거운 돌문을 팔 힘으로 밀어올려라!", "쓰러진 상태에서 힘차게 일어나라!"],
      space: ["우주선 해치를 밀어 열어라!", "무중력에서 벽을 밀어 이동하라!", "손상된 패널을 힘으로 밀어 수리하라!"],
      zombie: ["무너진 잔해를 밀어내고 탈출하라!", "좀비를 밀쳐내며 버텨라!", "바리케이드를 밀어 길을 만들어라!"],
      healing: ["정원의 무거운 화분을 밀어 옮겨라!", "반죽을 힘차게 치대라!", "침대에서 기지개를 펴며 일어나라!"]
    }
  },
  lunge: {
    name: "런지",
    action: "한 발을 앞으로 내딛어 무릎을 굽히는 동작",
    examples: {
      dungeon: ["한 발 앞으로 내딛어 적에게 돌진하라!", "자세를 낮추며 검을 휘둘러라!", "힘차게 전진하며 공격하라!"],
      space: ["한 발 앞으로 내딛어 우주선에 올라타라!", "자세를 낮추며 운석을 피하라!", "착지하며 앞으로 나아가라!"],
      zombie: ["한 발 앞으로 나서며 좀비를 밀어내라!", "돌진하며 탈출구로 향하라!", "낮은 자세로 장애물을 넘어라!"],
      healing: ["정원을 가로지르며 걸어가라!", "산책하며 한 걸음씩 내딛어라!", "요가 자세로 스트레칭하라!"]
    }
  },
  heelSlide: {
    name: "힐 슬라이드",
    action: "다리를 천천히 당겼다가 펴는 동작",
    examples: {
      dungeon: ["다리를 당겨 은신 자세를 취하라!", "조용히 미끄러지듯 이동하라!", "발을 움직여 마법진을 그려라!"],
      space: ["다리를 당겨 우주복 점검 자세를 취하라!", "중력에 적응하며 다리를 움직여라!", "캡슐 안에서 천천히 스트레칭하라!"],
      zombie: ["소리 없이 다리를 당겨 숨어라!", "조용히 움직이며 탈출 준비를 하라!", "부상당한 다리를 조심스럽게 움직여라!"],
      healing: ["침대에서 다리 스트레칭을 하라!", "햇살 아래 편안히 다리를 움직여라!", "휴식하며 천천히 재활 운동을 하라!"]
    }
  }
}

const themeDescriptions: Record<string, { name: string; setting: string; enemies: string; npc: string; npcRole: string }> = {
  dungeon: {
    name: "던전 탐험",
    setting: "어둡고 신비로운 지하 던전",
    enemies: "고블린, 슬라임, 오크, 스켈레톤, 드래곤",
    npc: "아르카누스",
    npcRole: "수백 년을 살아온 현명한 대마법사. 던전의 비밀을 알고 있으며, 주인공을 이끌어준다."
  },
  space: {
    name: "우주 탐사",
    setting: "광활한 우주와 미지의 행성",
    enemies: "외계인, 운석, 고장난 로봇, AI 시스템",
    npc: "노바",
    npcRole: "우주선의 AI 안드로이드. 친절하고 논리적이며, 주인공의 든든한 파트너."
  },
  zombie: {
    name: "좀비 서바이벌",
    setting: "좀비 아포칼립스로 황폐해진 도시",
    enemies: "좀비, 감염자, 바리케이드, 폐허",
    npc: "캡틴 리",
    npcRole: "베테랑 군인 생존자. 거칠지만 의리 있고, 생존 노하우를 알려준다."
  },
  healing: {
    name: "일상 힐링",
    setting: "평화로운 마을과 아늑한 집",
    enemies: "길고양이, 반죽, 잡초, 먼지",
    npc: "하나",
    npcRole: "마을의 힐러이자 약초사. 따뜻하고 다정하며, 자연과 교감한다."
  }
}

export async function POST(req: Request) {
  try {
    const { theme = "dungeon", eventCount = 5, nickname = "영웅", exerciseId = "armRaise" } = await req.json()

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY 없음")
    }

    const themeInfo = themeDescriptions[theme] || themeDescriptions.dungeon
    const exerciseInfo = exerciseActions[exerciseId] || exerciseActions.armRaise
    const examples = exerciseInfo.examples[theme] || exerciseInfo.examples.dungeon

const prompt = `
당신은 재활 운동 RPG 게임의 스토리 작가입니다. 환자가 주인공이 되어 운동을 통해 성장하는 이야기를 만듭니다.

## 설정
- 테마: ${themeInfo.name}
- 배경: ${themeInfo.setting}
- 등장하는 적/장애물: ${themeInfo.enemies}
- 주인공 이름: ${nickname}
- 주인공 설정: 부상에서 회복 중인 용사. 운동할 때마다 힘을 되찾는다.
- NPC 이름: ${themeInfo.npc}
- NPC 설정: ${themeInfo.npcRole}

## 중요: 운동 동작
이 게임에서 플레이어가 실제로 수행하는 운동은 **"${exerciseInfo.name}"**입니다.
- ${exerciseInfo.action}
- 이 동작을 반복하여 목표 횟수를 달성

따라서 스토리에서 운동이 필요한 상황을 묘사할 때, 반드시 "${exerciseInfo.name}" 동작과 자연스럽게 연결되는 상황을 만들어주세요.

이 테마에서 사용할 수 있는 상황 예시:
${examples.map((ex, i) => `- "${ex}"`).join("\n")}

## 중요 규칙
1. 스토리에서 주인공을 "${nickname}"으로 부르세요.
2. NPC "${themeInfo.npc}"가 주인공에게 직접 말하는 대화를 포함하세요.
3. 모든 운동 상황은 "${exerciseInfo.name}" 동작과 맞아야 합니다.
4. 희망적이고 격려하는 톤을 유지하세요.

## narrative 작성 형식 (중요!)
각 이벤트의 narrative는 다음 두 가지를 모두 포함해야 합니다:
1. 상황 묘사 (줄글): 현재 상황을 설명하는 문장
2. NPC 대사: "${themeInfo.npc}"가 직접 말하는 대화 (큰따옴표로 감싸기)

예시: "${themeInfo.npc}가 급히 다가왔다. \\"${nickname}, ${examples[0]}\\""

## 구조
- 총 ${eventCount}개 이벤트
- 첫 이벤트: story (도입부 - NPC가 주인공에게 상황 설명)
- 중간 이벤트: battle/obstacle/treasure 섞어서 (NPC가 조언하며 격려)
- 마지막 이벤트: boss (NPC가 결전을 앞두고 주인공을 응원)

## 이벤트 타입별 특징
- story: 스토리 전개만 (운동 없음)
- battle: 적과 싸움 (${exerciseInfo.name}로 공격/방어)
- obstacle: 장애물 통과 (${exerciseInfo.name}로 극복)
- treasure: 보물 획득 (${exerciseInfo.name}로 열기/도달)
- boss: 강력한 적 (${exerciseInfo.name}로 결전)

## 출력 형식
반드시 아래 JSON 형식으로만 응답하세요:
{
  "title": "챕터 제목 (흥미롭게)",
  "events": [
    {
      "type": "story",
      "narrative": "상황 묘사 + NPC 대사 포함 (2-3문장)"
    },
    {
      "type": "battle",
      "narrative": "상황 묘사 + NPC 대사 포함 (2-3문장)",
      "exerciseTarget": 8,
      "reward": { "exp": 15 }
    }
  ]
}
`.trim()

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
    })

    const responseText = response.choices[0].message.content

    if (!responseText) {
      throw new Error("챕터 생성 결과가 비어 있음")
    }

    // JSON 파싱
    let chapter
    try {
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