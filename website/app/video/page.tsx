'use client'

import { VideoPlayer } from '@/components/video-player'

export default function VideoPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-mono text-3xl font-semibold text-epsilon-gold mb-2 tracking-epsilon">
            EPSILON
          </h1>
          <p className="text-sm font-light text-gray-400">Introduction Video</p>
        </div>

        {/* Video Player Container - 3:2 aspect ratio */}
        <div className="relative w-full bg-[#050505] border border-epsilon-gold/30 overflow-hidden epsilon-gold-glow shadow-inset-card transition-all duration-epsilon ease-epsilon" style={{ aspectRatio: '3/2' }}>
          <div className="absolute inset-0 epsilon-mesh opacity-10" />
          <div className="relative z-10 h-full w-full brightness-[0.9] contrast-110">
            <VideoPlayer
              src="/epsilon-intro.mp4"
              className="w-full h-full"
              autoPlay={false}
              muted={false}
              loop={false}
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-xs font-normal text-gray-500">
            © 2026 EPSILON LABS · Team Approcher
          </p>
          <div className="mt-4 flex justify-center gap-4 text-xs">
            <a
              href="https://epsilon-livid.vercel.app"
              className="font-normal text-gray-400 transition-colors duration-epsilon ease-epsilon hover:text-epsilon-gold"
            >
              Visit Main Site
            </a>
            <span className="text-gray-600">|</span>
            <a
              href="https://github.com/DresdenGman/EPSILON-trading-simulator"
              target="_blank"
              rel="noopener noreferrer"
              className="font-normal text-gray-400 transition-colors duration-epsilon ease-epsilon hover:text-epsilon-gold"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
