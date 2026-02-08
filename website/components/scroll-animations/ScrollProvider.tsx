'use client'

import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 确保 ScrollTrigger 在页面加载后刷新
    const timer = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 100)

    // 监听窗口大小变化
    const handleResize = () => {
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <>{children}</>
}
