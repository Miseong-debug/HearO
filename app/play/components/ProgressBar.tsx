"use client"

interface ProgressBarProps {
  currentIndex: number
  totalEvents: number
}

export default function ProgressBar({ currentIndex, totalEvents }: ProgressBarProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalEvents }).map((_, index) => (
        <div key={index} className="flex items-center">
          {/* 노드 */}
          <div
            className={`w-4 h-4 rounded-full transition-all ${
              index < currentIndex
                ? "bg-primary"
                : index === currentIndex
                ? "bg-primary ring-4 ring-primary/30"
                : "bg-muted/50"
            }`}
          />
          {/* 연결선 */}
          {index < totalEvents - 1 && (
            <div
              className={`w-8 h-1 transition-all ${
                index < currentIndex ? "bg-primary" : "bg-muted/30"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
