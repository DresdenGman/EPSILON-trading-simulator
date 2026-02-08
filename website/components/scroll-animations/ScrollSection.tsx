'use client'

import { useEffect, useRef, ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// 注册 ScrollTrigger 插件
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface ScrollSectionProps {
  children: ReactNode
  className?: string
  id?: string
}

export function ScrollSection({ children, className = '', id }: ScrollSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    // 刷新 ScrollTrigger 以确保正确计算位置
    ScrollTrigger.refresh()
  }, [])

  return (
    <section ref={sectionRef} id={id} className={className}>
      {children}
    </section>
  )
}
