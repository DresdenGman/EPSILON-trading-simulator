'use client'

import { VideoPlayer } from '@/components/video-player'

export default function VideoPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-mono text-3xl text-epsilon-gold mb-2 tracking-wider">
            EPSILON
          </h1>
          <p className="text-sm text-gray-400">Introduction Video</p>
        </div>

        {/* Video Player Container */}
        <div className="relative w-full aspect-video bg-black border border-[#333] rounded-sm overflow-hidden epsilon-gold-glow shadow-2xl">
          <VideoPlayer
            src="/epsilon-intro.mp4"
            className="w-full h-full"
            autoPlay={false}
            muted={false}
            loop={false}
          />
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © 2026 EPSILON LABS · Team Approcher
          </p>
          <div className="mt-4 flex justify-center gap-4 text-xs">
            <a
              href="https://epsilon-livid.vercel.app"
              className="text-gray-400 hover:text-epsilon-gold transition-colors"
            >
              Visit Main Site
            </a>
            <span className="text-gray-600">|</span>
            <a
              href="https://github.com/DresdenGman/EPSILON-trading-simulator"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-epsilon-gold transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
