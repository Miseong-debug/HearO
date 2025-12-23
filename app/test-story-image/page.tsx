"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ImageIcon } from "lucide-react"
import { StoryImage, StoryProgressTimeline } from "@/components/story-image"
import { getAllStages, getThemeDisplayName, type StoryTheme } from "@/lib/story-images"

export default function TestStoryImagePage() {
  const [selectedTheme, setSelectedTheme] = useState<StoryTheme>("fantasy")
  const [progress, setProgress] = useState(0)

  const themes: StoryTheme[] = ["fantasy", "zombie", "healing"]
  const stages = getAllStages(selectedTheme)

  return (
    <main className="min-h-screen epic-gradient relative overflow-hidden p-6">
      {/* 배경 효과 */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 50%, oklch(0.65 0.25 285 / 0.3) 0%, transparent 50%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              홈으로
            </Button>
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-primary" />
            스토리 이미지 테스트
          </h1>
          <div className="w-20" />
        </div>

        {/* 테마 선택 */}
        <Card className="backdrop-blur-xl bg-card/40 border-border/40 rounded-3xl overflow-hidden mb-6">
          <CardHeader>
            <CardTitle>테마 선택</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {themes.map((theme) => (
                <Button
                  key={theme}
                  variant={selectedTheme === theme ? "default" : "outline"}
                  onClick={() => setSelectedTheme(theme)}
                  className={selectedTheme === theme ? "bg-primary" : ""}
                >
                  {getThemeDisplayName(theme)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 진행도 슬라이더 */}
        <Card className="backdrop-blur-xl bg-card/40 border-border/40 rounded-3xl overflow-hidden mb-6">
          <CardHeader>
            <CardTitle>진행도: {progress}%</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>시작</span>
              <span>진행 중</span>
              <span>완료</span>
            </div>
          </CardContent>
        </Card>

        {/* 메인 스토리 이미지 */}
        <Card className="backdrop-blur-xl bg-card/40 border-border/40 rounded-3xl overflow-hidden mb-6">
          <CardHeader>
            <CardTitle>현재 장면</CardTitle>
          </CardHeader>
          <CardContent>
            <StoryImage
              theme={selectedTheme}
              progress={progress}
              className="aspect-video"
            />
          </CardContent>
        </Card>

        {/* 진행도 타임라인 */}
        <Card className="backdrop-blur-xl bg-card/40 border-border/40 rounded-3xl overflow-hidden mb-6">
          <CardHeader>
            <CardTitle>스토리 진행 타임라인</CardTitle>
          </CardHeader>
          <CardContent>
            <StoryProgressTimeline theme={selectedTheme} currentProgress={progress} />
          </CardContent>
        </Card>

        {/* 모든 스테이지 미리보기 */}
        <Card className="backdrop-blur-xl bg-card/40 border-border/40 rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle>모든 스테이지 ({getThemeDisplayName(selectedTheme)})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {stages.map((stage) => (
                <div
                  key={stage.stage}
                  className="cursor-pointer"
                  onClick={() => setProgress(((stage.stage - 0.5) / 6) * 100)}
                >
                  <StoryImage
                    theme={selectedTheme}
                    progress={((stage.stage - 0.5) / 6) * 100}
                    className="aspect-video"
                    showInfo={true}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 사용법 안내 */}
        <Card className="backdrop-blur-xl bg-card/40 border-border/40 rounded-3xl overflow-hidden mt-6">
          <CardHeader>
            <CardTitle>이미지 추가 방법</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              현재는 Pollinations.ai placeholder 이미지가 표시됩니다.<br />
              직접 이미지를 추가하려면:
            </p>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                <code className="bg-muted/40 px-2 py-1 rounded">/public/story-images/{selectedTheme}/</code> 폴더에 이미지 저장
              </li>
              <li>
                파일명: <code className="bg-muted/40 px-2 py-1 rounded">stage1.png</code> ~ <code className="bg-muted/40 px-2 py-1 rounded">stage6.png</code>
              </li>
              <li>권장 해상도: 1024x576 (16:9)</li>
            </ol>
            <div className="p-4 bg-muted/20 rounded-xl">
              <p className="font-medium mb-2">폴더 구조:</p>
              <pre className="text-xs">
{`/public/story-images/
  ├── fantasy/
  │   ├── stage1.png
  │   ├── stage2.png
  │   └── ...
  ├── zombie/
  │   └── ...
  └── healing/
      └── ...`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
