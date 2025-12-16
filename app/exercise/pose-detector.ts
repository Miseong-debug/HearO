"use client"

import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision"

export async function createPoseLandmarker() {
  const vision = await FilesetResolver.forVisionTasks(
    // wasm 파일 경로
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  )

  const landmarker = await (PoseLandmarker as any).createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numPoses: 1,
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  })

  return landmarker
}
