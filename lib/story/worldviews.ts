// 스토리 세계관 정의
export interface Worldview {
  id: string
  name: string
  nameKo: string
  description: string
  setting: string
  protagonist: string
  tone: string
  keywords: string[]
  imageStyle: string
}

export const WORLDVIEWS: Record<string, Worldview> = {
  fantasy: {
    id: "fantasy",
    name: "Fantasy Kingdom",
    nameKo: "판타지 왕국",
    description: "마법과 용이 존재하는 중세 판타지 세계",
    setting: "마법이 존재하는 중세 왕국. 용과 마법사, 기사들이 활동하는 세계.",
    protagonist: "마법 기사 견습생",
    tone: "웅장하고 희망찬",
    keywords: ["마법", "용", "기사", "마법사", "왕국", "퀘스트", "던전"],
    imageStyle: "fantasy medieval kingdom, magical aura, dragon, knight, epic lighting, detailed illustration",
  },
  scifi: {
    id: "scifi",
    name: "Space Odyssey",
    nameKo: "우주 오디세이",
    description: "광활한 우주를 탐험하는 SF 세계",
    setting: "2350년, 인류가 은하계를 탐험하는 시대. 우주선과 외계 행성, 첨단 기술의 세계.",
    protagonist: "우주 탐험대원",
    tone: "미래지향적이고 도전적인",
    keywords: ["우주", "행성", "AI", "우주선", "탐험", "외계", "테크놀로지"],
    imageStyle: "sci-fi space station, futuristic technology, starship, cosmic nebula, cyberpunk elements",
  },
  martial: {
    id: "martial",
    name: "Martial Arts Legend",
    nameKo: "무협 전설",
    description: "내공과 검술이 펼쳐지는 무협 세계",
    setting: "고대 중원의 무림. 강호의 영웅들이 무공을 겨루고 정의를 추구하는 세계.",
    protagonist: "젊은 무림 고수",
    tone: "비장하고 의협심 넘치는",
    keywords: ["무공", "내공", "검법", "강호", "협객", "비급", "무림맹"],
    imageStyle: "wuxia martial arts, chinese ancient temple, warrior monk, flowing robes, misty mountains",
  },
  healing: {
    id: "healing",
    name: "Forest Sanctuary",
    nameKo: "숲속 힐링",
    description: "자연 속에서 치유를 받는 힐링 세계",
    setting: "신비로운 치유의 숲. 정령들과 마법 생물들이 함께하는 평화로운 자연의 세계.",
    protagonist: "숲의 치유사",
    tone: "따뜻하고 평화로운",
    keywords: ["자연", "치유", "정령", "나무", "꽃", "명상", "평화"],
    imageStyle: "enchanted forest, healing sanctuary, nature spirits, soft sunlight, peaceful atmosphere, studio ghibli style",
  },
  steampunk: {
    id: "steampunk",
    name: "Clockwork Empire",
    nameKo: "스팀펑크 제국",
    description: "증기와 기계가 지배하는 스팀펑크 세계",
    setting: "19세기 빅토리아 풍의 대안 역사. 증기 기관과 기계 장치가 발달한 세계.",
    protagonist: "천재 발명가",
    tone: "모험적이고 창의적인",
    keywords: ["증기", "기계", "발명", "비행선", "공장", "톱니바퀴", "고글"],
    imageStyle: "steampunk victorian, brass gears, steam machinery, airship, vintage technology, industrial revolution",
  },
  underwater: {
    id: "underwater",
    name: "Deep Ocean Kingdom",
    nameKo: "심해 왕국",
    description: "신비로운 바다 속 해저 세계",
    setting: "깊은 바다 속 숨겨진 왕국. 인어와 해양 생물들이 사는 신비로운 해저 도시.",
    protagonist: "해저 탐험가",
    tone: "신비롭고 몽환적인",
    keywords: ["바다", "인어", "해저", "산호", "진주", "해류", "고래"],
    imageStyle: "underwater kingdom, bioluminescent deep sea, coral palace, merfolk, mystical ocean, ethereal lighting",
  },
}

export const WORLDVIEW_LIST = Object.values(WORLDVIEWS)

export function getWorldview(id: string): Worldview {
  return WORLDVIEWS[id] || WORLDVIEWS.fantasy
}

// 운동 결과에 따른 스토리 진행도 계산
export function calculateProgress(reps: number, targetReps: number, score: number): {
  level: "epic" | "great" | "good" | "normal"
  progressPercent: number
  description: string
} {
  const repProgress = Math.min(reps / targetReps, 1)
  const scoreBonus = score / 100
  const total = (repProgress * 0.7 + scoreBonus * 0.3) * 100

  if (total >= 90) {
    return { level: "epic", progressPercent: total, description: "전설적인 성과" }
  } else if (total >= 70) {
    return { level: "great", progressPercent: total, description: "훌륭한 성과" }
  } else if (total >= 50) {
    return { level: "good", progressPercent: total, description: "좋은 성과" }
  } else {
    return { level: "normal", progressPercent: total, description: "시작이 반" }
  }
}
