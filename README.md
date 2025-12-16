# HearO - 재활 운동 앱

AI 기반 포즈 인식과 스토리 생성으로 재활 운동을 게이미피케이션한 웹 앱입니다.

## 배포 URL

https://hearo-beta.vercel.app

## 주요 기능

### 실시간 포즈 인식
- MediaPipe Pose Landmarker를 사용한 실시간 자세 추적
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

### AI 스토리 생성
- Gemini API를 사용한 RPG 스타일 스토리 생성
- 운동 결과 기반 맞춤형 서사
- Pollinations.ai를 사용한 AI 이미지 생성
- TTS로 스토리 읽어주기

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui |
| Pose Detection | MediaPipe Pose Landmarker |
| AI Story | Google Gemini API |
| AI Image | Pollinations.ai |
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

| 변수 | 설명 |
|------|------|
| `GEMINI_API_KEY` | Google Gemini API 키 |

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
