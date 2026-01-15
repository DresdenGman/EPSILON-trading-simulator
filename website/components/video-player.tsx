'use client'

import { useState, useRef, useEffect } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VideoPlayerProps {
  src: string
  className?: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
}

export function VideoPlayer({ src, className = '', autoPlay = true, muted = true, loop = true }: VideoPlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const toggleFullscreen = async () => {
    if (!containerRef.current) return

    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error)
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <video
        className="w-full h-full object-contain"
        src={src}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        controls
        style={{ objectFit: 'contain' }}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleFullscreen}
        className="absolute bottom-2 right-2 h-8 w-8 bg-black/60 text-white hover:bg-black/80"
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      >
        {isFullscreen ? (
          <Minimize2 className="h-4 w-4" />
        ) : (
          <Maximize2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
