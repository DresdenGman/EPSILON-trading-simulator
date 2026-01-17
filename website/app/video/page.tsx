'use client'

import { VideoPlayer } from '@/components/video-player'

export default function VideoPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="font-mono text-3xl font-semibold text-epsilon-gold mb-2 tracking-wide">
            EPSILON
          </h1>
          <p className="text-sm font-light text-gray-400">Introduction Video</p>
        </div>

        {/* Video Player Container - 3:2 aspect ratio */}
        <div 
          className="relative w-full bg-[#050505] border border-epsilon-gold/50 overflow-hidden epsilon-inset-shadow-gold epsilon-gold-glow" 
          style={{ aspectRatio: '3/2' }}
        >
          <VideoPlayer
            src="/epsilon-intro.mp4"
            className="w-full h-full"
            autoPlay={false}
            muted={false}
            loop={false}
          />
        </div>

        {/* Footer Info */}
        <div className="mt-10 text-center">
          <p className="text-xs font-light text-gray-500">
            © 2026 EPSILON LABS · Team Approcher
          </p>
          <div className="mt-5 flex justify-center gap-5 text-xs font-light">
            <a
              href="/"
              className="text-gray-400 transition-colors duration-280 ease-out-slow hover:text-epsilon-gold"
            >
              Visit Main Site
            </a>
            <span className="text-gray-600">|</span>
            <a
              href="https://github.com/DresdenGman/EPSILON-trading-simulator"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 transition-colors duration-280 ease-out-slow hover:text-epsilon-gold"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
