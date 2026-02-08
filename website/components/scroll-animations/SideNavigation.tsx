'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface SideNavigationProps {
  items: Array<{ id: string; label: string }>
  className?: string
}

export function SideNavigation({ items, className = '' }: SideNavigationProps) {
  const navRef = useRef<HTMLElement | null>(null)
  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([])

  useEffect(() => {
    if (!navRef.current) return

    // 为每个导航项创建 ScrollTrigger
    items.forEach((item, index) => {
      const section = document.getElementById(item.id)
      if (!section) return

      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => {
          // 高亮当前导航项
          itemsRef.current.forEach((el, i) => {
            if (el) {
              el.setAttribute('data-active', i === index ? 'true' : 'false')
            }
          })
        },
        onEnterBack: () => {
          itemsRef.current.forEach((el, i) => {
            if (el) {
              el.setAttribute('data-active', i === index ? 'true' : 'false')
            }
          })
        },
      })
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [items])

  return (
    <nav
      ref={navRef}
      className={`fixed right-8 top-1/2 z-50 -translate-y-1/2 hidden md:block ${className}`}
    >
      <div className="flex flex-col gap-4">
        {items.map((item, index) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            ref={(el) => {
              itemsRef.current[index] = el
            }}
            className="text-sm font-medium text-gray-400 transition-all duration-300 hover:text-white data-[active=true]:text-white data-[active=true]:font-bold"
            onClick={(e) => {
              e.preventDefault()
              const section = document.getElementById(item.id)
              if (section) {
                section.scrollIntoView({ behavior: 'smooth' })
              }
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </a>
        ))}
      </div>
    </nav>
  )
}
