# HearO - 재활 운동 앱

AI 기반 포즈 인식과 스토리 생성으로 재활 운동을 게이미피케이션한 웹 앱입니다.

## 배포 URL

https://hearo-beta.vercel.app

## 주요 기능

### 실시간 포즈 인식 (개선됨)
- MediaPipe Pose Landmarker를 사용한 실시간 자세 추적
- **향상된 인식률**: confidence 임계값 최적화 (0.65)
- **조명 품질 체크**: 너무 어둡거나 밝은 환경 경고
- **랜드마크 스무딩**: 떨림 감소로 안정적인 추적
- **visibility 기반 시각화**: 가려진 관절 자동 감지
- 팔 들어올리기 운동 반복 횟수 자동 카운팅
- 자세 품질 점수 계산 (어깨 정렬, 팔 대칭, 안정성)

### 피드백 시스템
- 반복 카운트 효과음 (Web Audio API)
- 목표 달성 시 팡파레 효과음
- 음성 가이드 (Web Speech API)
  - 운동 시작/정지 안내
  - 5회 단위 반복 횟수 안내
  - 자세 점수 낮을 시 경고
  - 목표 달성 축하

### AI 스토리 생성 (개선됨)
- Gemini API를 사용한 RPG 스타일 스토리 생성
- **6가지 세계관 선택 가능**:
  - 🏰 판타지 왕국 - 마법과 용의 세계
  - 🚀 우주 오디세이 - SF 우주 탐험
  - ⚔️ 무협 전설 - 동양 무협 세계
  - 🌿 숲속 힐링 - 자연 치유 세계
  - ⚙️ 스팀펑크 제국 - 증기기관 세계
  - 🌊 심해 왕국 - 해저 모험 세계
- 운동 결과 기반 맞춤형 서사 (진행도 반영)
- TTS로 스토리 읽어주기

### AI 이미지 생성 (개선됨)
- **Hugging Face FLUX.1-schnell**: 고품질 이미지 생성
- **Pollinations.ai 폴백**: API 키 없이도 동작
- 세계관별 맞춤 이미지 스타일

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui |
| Pose Detection | MediaPipe Pose Landmarker |
| AI Story | Google Gemini 2.0 Flash |
| AI Image | Hugging Face FLUX / Pollinations.ai |
| TTS/Sound | Web Speech API, Web Audio API |
| Deployment | Vercel |

## 프로젝트 구조

```
app/
├── api/generate/
│   ├── story/          # Gemini 스토리 생성 API
│   └── image/          # 이미지 생성 API
├── exercise/           # 운동 페이지
│   ├── hooks/
│   │   ├── usePose.ts        # 포즈 감지
│   │   ├── useRepCounter.ts  # 반복 카운팅
│   │   ├── useQualityScore.ts # 자세 점수
│   │   ├── useSound.ts       # 효과음
│   │   └── useVoiceGuide.ts  # 음성 가이드
│   ├── camera.tsx      # 카메라 컴포넌트
│   └── pose-detector.ts # MediaPipe 초기화
├── result/             # 결과 페이지
├── history/            # 운동 기록
├── login/              # 로그인
└── signup/             # 회원가입

components/ui/          # shadcn/ui 컴포넌트
lib/                    # 유틸리티
```

## 로컬 개발

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# GEMINI_API_KEY 추가

# 개발 서버 실행
npm run dev
```

http://localhost:3000 에서 확인

## 환경 변수

| 변수 | 설명 | 필수 |
|------|------|------|
| `GEMINI_API_KEY` | Google Gemini API 키 (스토리 생성) | O |
| `HUGGINGFACE_API_KEY` | Hugging Face API 키 (이미지 생성) | X (폴백 있음) |

## 사용 방법

1. `/exercise` 페이지 접속
2. **카메라 활성화** 클릭
3. 목표 횟수 설정 (기본 10회)
4. **운동 시작하기** 클릭
5. 양팔을 어깨 위로 올렸다 내리기 반복
6. 목표 달성 후 **세션 종료 및 결과 보기**
7. AI가 생성한 스토리와 이미지 확인

## 라이선스

MIT
