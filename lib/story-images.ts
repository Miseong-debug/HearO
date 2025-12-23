// 스토리 이미지 시스템
// 테마별 장면 이미지를 관리하고 진행도에 따라 적절한 이미지를 반환

export type StoryTheme = "fantasy" | "zombie" | "healing"

export interface StageInfo {
  stage: number
  name: string
  description: string
  imagePath: string
}

// 테마별 스테이지 정보
const stageData: Record<StoryTheme, StageInfo[]> = {
  fantasy: [
    { stage: 1, name: "모험의 시작", description: "평화로운 마을에서 영웅의 여정이 시작됩니다", imagePath: "/story-images/fantasy/stage1.png" },
    { stage: 2, name: "숲의 시련", description: "어두운 숲에서 첫 번째 적과 마주칩니다", imagePath: "/story-images/fantasy/stage2.png" },
    { stage: 3, name: "동굴 탐험", description: "고대의 비밀이 숨겨진 동굴로 들어갑니다", imagePath: "/story-images/fantasy/stage3.png" },
    { stage: 4, name: "드래곤의 영역", description: "드래곤이 잠들어 있는 화산 지대에 도착합니다", imagePath: "/story-images/fantasy/stage4.png" },
    { stage: 5, name: "최후의 전투", description: "세계의 운명을 건 마지막 전투가 시작됩니다", imagePath: "/story-images/fantasy/stage5.png" },
    { stage: 6, name: "영웅의 귀환", description: "승리를 거두고 마을로 돌아옵니다", imagePath: "/story-images/fantasy/stage6.png" },
  ],
  zombie: [
    { stage: 1, name: "재앙의 시작", description: "좀비 바이러스가 도시를 덮쳤습니다", imagePath: "/story-images/zombie/stage1.png" },
    { stage: 2, name: "도시 탈출", description: "좀비들을 피해 안전한 곳을 찾습니다", imagePath: "/story-images/zombie/stage2.png" },
    { stage: 3, name: "생존자 캠프", description: "다른 생존자들과 합류합니다", imagePath: "/story-images/zombie/stage3.png" },
    { stage: 4, name: "물자 수집", description: "생존을 위한 물자를 찾아 나섭니다", imagePath: "/story-images/zombie/stage4.png" },
    { stage: 5, name: "좀비 호드", description: "거대한 좀비 무리가 캠프를 습격합니다", imagePath: "/story-images/zombie/stage5.png" },
    { stage: 6, name: "새로운 시작", description: "안전지대에 도착해 새 삶을 시작합니다", imagePath: "/story-images/zombie/stage6.png" },
  ],
  healing: [
    { stage: 1, name: "평화로운 아침", description: "새들이 지저귀는 아름다운 아침입니다", imagePath: "/story-images/healing/stage1.png" },
    { stage: 2, name: "정원 가꾸기", description: "예쁜 꽃들로 정원을 꾸밉니다", imagePath: "/story-images/healing/stage2.png" },
    { stage: 3, name: "동물 친구들", description: "귀여운 동물 친구들이 찾아옵니다", imagePath: "/story-images/healing/stage3.png" },
    { stage: 4, name: "축제 준비", description: "마을 축제를 위해 함께 준비합니다", imagePath: "/story-images/healing/stage4.png" },
    { stage: 5, name: "축제의 밤", description: "화려한 불꽃과 함께 축제가 시작됩니다", imagePath: "/story-images/healing/stage5.png" },
    { stage: 6, name: "행복한 결말", description: "모두가 행복한 하루를 마무리합니다", imagePath: "/story-images/healing/stage6.png" },
  ],
}

// 진행도에 따른 스테이지 번호 계산 (0~100% -> 1~6 스테이지)
export function getStageFromProgress(progress: number): number {
  if (progress <= 0) return 1
  if (progress >= 100) return 6

  // 0-16%: stage 1, 17-33%: stage 2, 34-50%: stage 3, 51-67%: stage 4, 68-84%: stage 5, 85-100%: stage 6
  const stage = Math.ceil((progress / 100) * 6)
  return Math.min(Math.max(stage, 1), 6)
}

// 테마와 진행도에 따른 스테이지 정보 반환
export function getStageInfo(theme: StoryTheme, progress: number): StageInfo {
  const stage = getStageFromProgress(progress)
  const stages = stageData[theme]
  return stages[stage - 1]
}

// 테마의 모든 스테이지 정보 반환
export function getAllStages(theme: StoryTheme): StageInfo[] {
  return stageData[theme]
}

// 이미지 경로 반환 (이미지가 없으면 placeholder URL 반환)
export function getStoryImageUrl(theme: StoryTheme, stage: number): string {
  const stageInfo = stageData[theme]?.[stage - 1]
  if (!stageInfo) {
    return getPlaceholderUrl(theme, stage)
  }
  return stageInfo.imagePath
}

// Pollinations.ai를 사용한 placeholder 이미지 URL 생성
export function getPlaceholderUrl(theme: StoryTheme, stage: number): string {
  const prompts: Record<StoryTheme, string[]> = {
    fantasy: [
      "fantasy village starting adventure, medieval town, hero departing",
      "dark forest battle, fantasy warrior fighting monsters",
      "ancient cave exploration, mysterious underground, torches",
      "volcanic dragon lair, epic fantasy landscape, fire",
      "epic boss battle, hero vs dragon, dramatic lighting",
      "hero returning victorious, celebration, fantasy kingdom",
    ],
    zombie: [
      "zombie apocalypse beginning, city outbreak, horror",
      "escaping zombie city, running through streets, survival",
      "survivor camp, makeshift shelter, post apocalyptic",
      "scavenging supplies, abandoned building, zombie survival",
      "zombie horde attack, defending camp, action scene",
      "safe zone arrival, new hope, post apocalyptic sunrise",
    ],
    healing: [
      "peaceful morning, cozy cottage, sunrise, pastoral",
      "beautiful garden, flowers blooming, gentle atmosphere",
      "cute forest animals, friendly creatures, whimsical",
      "village festival preparation, decorations, community",
      "night festival celebration, fireworks, magical lights",
      "happy ending sunset, peaceful village, warm atmosphere",
    ],
  }

  const prompt = prompts[theme]?.[stage - 1] || "fantasy scene"
  const encodedPrompt = encodeURIComponent(`${prompt}, digital art, illustration style, vibrant colors`)

  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=576&nologo=true&seed=${theme}${stage}`
}

// 테마 한글 이름
export function getThemeDisplayName(theme: StoryTheme): string {
  const names: Record<StoryTheme, string> = {
    fantasy: "판타지",
    zombie: "좀비 서바이벌",
    healing: "힐링",
  }
  return names[theme]
}
