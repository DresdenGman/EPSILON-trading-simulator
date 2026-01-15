'use client'

import { VideoPlayer } from '@/components/video-player'

export default function VideoPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-7xl">
        {/* Minimal Header */}
        <div className="mb-4 text-center">
          <h1 className="font-mono text-xl text-epsilon-gold mb-1 tracking-wider">
            EPSILON
          </h1>
          <p className="text-xs text-gray-500">Introduction Video</p>
        </div>

        {/* Video Player - Full Width, Responsive */}
        <div className="border border-[#333] rounded-sm overflow-hidden bg-black aspect-video">
          <VideoPlayer
            src="/epsilon-intro.mp4"
            className="w-full h-full"
            autoPlay={false}
            controls={true}
            loop={false}
            muted={false}
          />
        </div>

        {/* Minimal Footer */}
        <div className="mt-4 text-center">
          <p className="text-[10px] text-gray-600">
            © 2026 EPSILON LABS
          </p>
        </div>
      </div>
    </div>
  )
}
