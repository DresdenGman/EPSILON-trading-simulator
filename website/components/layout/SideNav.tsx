'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { NavItem } from '@/lib/types'
import styles from './SideNav.module.css'

interface SideNavProps {
  items: NavItem[]
}

export default function SideNav({ items }: SideNavProps) {
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !navRef.current) return

    items.forEach((item, index) => {
      const section = document.getElementById(item.id)
      if (!section) return

      ScrollTrigger.create({
        trigger: section,
        start: 'top 60%',
        end: 'bottom 40%',
        onEnter: () => {
          navRef.current?.querySelectorAll('a').forEach((el, i) => {
            el.setAttribute('data-active', i === index ? 'true' : 'false')
          })
          const progress = ((index + 1) / items.length) * 100
          navRef.current?.style.setProperty('--navProgress', `${progress}%`)
        },
        onEnterBack: () => {
          navRef.current?.querySelectorAll('a').forEach((el, i) => {
            el.setAttribute('data-active', i === index ? 'true' : 'false')
          })
          const progress = ((index + 1) / items.length) * 100
          navRef.current?.style.setProperty('--navProgress', `${progress}%`)
        },
      })
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [items])

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav ref={navRef} className={styles.sideNav}>
      <div className={styles.container}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ height: 'var(--navProgress, 0%)' }} />
        </div>
        
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className={styles.navItem}
            data-active={false}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  )
}