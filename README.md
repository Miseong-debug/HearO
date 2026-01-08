# HearO - 재활 운동 RPG

AI 기반 포즈 인식과 스토리 생성으로 재활 운동을 게이미피케이션한 웹 앱입니다.
운동을 하면 AI가 실시간으로 스토리를 진행시켜, 지루한 재활 운동을 몰입감 있는 RPG 모험으로 만들어줍니다.

## 주요 기능

### 게임 모드 (4가지 테마)
| 테마 | 설명 |
|------|------|
| 던전/판타지 | 마법사 NPC와 함께 던전을 탐험하며 몬스터와 싸우는 모험 |
| 우주/SF | AI 안드로이드와 함께 광활한 우주를 탐사하는 SF 모험 |
| 좀비 서바이벌 | 베테랑 군인과 함께 좀비 아포칼립스에서 생존하는 모험 |
| 일상/힐링 | 마을 힐러와 함께 평화로운 일상을 보내는 힐링 모험 |

### 운동 부위 선택 (5가지)
| 운동 | 설명 | 타겟 부위 |
|------|------|----------|
| 팔올리기 | 양팔을 옆으로 들어올리기 | 어깨 관절 가동범위 |
| 스쿼트 | 무릎을 굽혀 앉았다 일어서기 | 하체 근력 |
| 팔굽혀펴기 | 팔꿈치를 굽혀 몸을 낮췄다 밀어올리기 | 상체 근력 |
| 런지 | 한 발 앞으로 내딛어 무릎 굽히기 | 하체 균형 및 근력 |
| Heel Slide | 다리를 천천히 당겼다 펴기 | 무릎 관절가동범위 |

### 실시간 포즈 인식
- **MediaPipe Pose Landmarker** 기반 실시간 자세 추적
- 운동별 맞춤 랜드마크 감지 (어깨, 팔꿈치, 무릎, 발목 등)
- 조명 품질 체크 및 경고
- 랜드마크 스무딩으로 안정적인 추적
- visibility 기반 스켈레톤 시각화

### 캘리브레이션 시스템
- 운동 시작 전 기준 자세 측정
- 운동별 캘리브레이션 데이터 자동 저장 (localStorage)
- 저장된 캘리브레이션 재사용 및 재측정 기능

### AI 스토리 생성
- **OpenAI GPT-4o-mini**를 사용한 RPG 스타일 스토리 생성
- 선택한 운동에 맞는 스토리 상황 자동 생성
- NPC 대화 포함으로 몰입감 향상
- 이벤트별 경험치 보상 시스템

### AI 이미지 생성
- **Replicate Flux** 모델을 사용한 고품질 이미지 생성
- 테마별, 이벤트별 맞춤 비주얼 노벨 스타일 이미지
- 캐릭터 표정 및 포즈 동적 변화

### 피드백 시스템
- 반복 카운트 효과음 (Web Audio API)
- 목표 달성 시 팡파레 효과음
- 배경 음악 지원

### 모험 기록
- 완료한 모험 히스토리 저장
- 획득 경험치 및 클리어 정보 기록

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui |
| Pose Detection | MediaPipe Pose Landmarker |
| AI Story | OpenAI GPT-4o-mini |
| AI Image | Replicate Flux |
| Sound | Web Audio API |
| State | React Hooks, localStorage |

## 설치 방법

### 1. 저장소 클론

```bash
git clone https://github.com/Miseong-debug/HearO.git
cd HearO
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가합니다:

```env
# OpenAI API (스토리 생성) - 필수
OPENAI_API_KEY=sk-your-openai-api-key

# Replicate API (이미지 생성) - 필수
REPLICATE_API_TOKEN=r8_your-replicate-api-token
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 환경 변수

| 변수 | 설명 | 필수 |
|------|------|------|
| `OPENAI_API_KEY` | OpenAI API 키 (스토리 생성) | O |
| `REPLICATE_API_TOKEN` | Replicate API 토큰 (이미지 생성) | O |

### API 키 발급 방법

1. **OpenAI API Key**: https://platform.openai.com/api-keys
2. **Replicate API Token**: https://replicate.com/account/api-tokens

## 프로젝트 구조

```
app/
├── api/generate/
│   ├── chapter/        # 챕터/스토리 생성 API
│   ├── story/          # 개별 스토리 생성 API
│   └── image/          # 이미지 생성 API
├── adventure/          # 모험 설정 페이지
├── play/               # 게임 플레이 페이지
│   ├── hooks/
│   │   └── useGameState.ts  # 게임 상태 관리
│   └── components/
│       ├── StoryPanel.tsx   # 스토리 표시
│       └── ExercisePanel.tsx # 운동 UI
├── exercise/           # 운동 모드 페이지
│   ├── hooks/
│   │   ├── usePose.ts       # 포즈 감지
│   │   ├── useRepCounter.ts # 반복 카운팅
│   │   ├── useCalibration.ts # 캘리브레이션
│   │   ├── useAngle.ts      # 관절 각도 계산
│   │   └── useSound.ts      # 효과음
│   ├── camera.tsx      # 카메라 컴포넌트
│   └── pose-detector.ts # MediaPipe 초기화
├── history/            # 모험 기록
├── login/              # 로그인
└── signup/             # 회원가입

lib/
├── exercises.ts        # 운동 설정 (랜드마크, 각도 등)
└── profiles.ts         # 프로필 관리

components/
├── ui/                 # shadcn/ui 컴포넌트
└── ExerciseSelector.tsx # 운동 선택 컴포넌트
```

## 사용 방법

1. 메인 페이지에서 **모험 시작하기** 클릭
2. 닉네임 입력
3. 테마 선택 (던전/우주/좀비/힐링)
4. 운동 부위 선택 (팔올리기/스쿼트/팔굽혀펴기/런지/Heel Slide)
5. 이벤트 수 설정 (3~10개)
6. **모험 시작** 클릭
7. 스토리를 읽고 운동 이벤트에서 카메라 활성화
8. 캘리브레이션 진행 (처음 1회만)
9. 운동 시작 후 목표 횟수 달성
10. 다음 스토리로 진행
11. 모든 이벤트 완료 시 모험 클리어!

## 배포

> 배포 URL: 준비 중

## 라이선스

MIT
