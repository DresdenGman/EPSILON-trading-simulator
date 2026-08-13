'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface UseScrollStateReturn {
  isScrolling: boolean
  scrollTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>
  lastScrollY: React.MutableRefObject<number>
}

export function useScrollState(timeoutMs: number = 2000): UseScrollStateReturn {
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollDelta = Math.abs(currentScrollY - lastScrollY.current)

      if (scrollDelta > 5) {
        setIsScrolling(true)
      }

      lastScrollY.current = currentScrollY

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false)
      }, timeoutMs)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [timeoutMs])

  return { isScrolling, scrollTimeoutRef, lastScrollY }
}

interface UseAutoScrollConfig {
  ref: React.RefObject<HTMLElement | null>
  isScrolling: boolean
  startThreshold?: number
  step?: number
  duration?: number
}

export function useAutoScroll(config: UseAutoScrollConfig) {
  const { ref, isScrolling, startThreshold = 0.8, step = 0.02, duration = 4 } = config
  const autoScrollRef = useRef<gsap.core.Tween | null>(null)

  const startAutoScroll = useCallback(() => {
    if (autoScrollRef.current || !ref.current) return

    const element = ref.current
    const currentProgress = parseFloat(element.style.getPropertyValue('--bgsProgress') || '1')
    const nextProgress = currentProgress <= 0 ? 1 : currentProgress - step

    autoScrollRef.current = gsap.to(element, {
      '--bgsProgress': nextProgress,
      duration,
      ease: 'power1.inOut',
      onComplete: () => {
        if (!isScrolling && window.scrollY < window.innerHeight * startThreshold && element) {
          const finalProgress = parseFloat(element.style.getPropertyValue('--bgsProgress') || '0')
          if (finalProgress <= 0) {
            element.style.setProperty('--bgsProgress', '1')
          }
          autoScrollRef.current = null
          setTimeout(() => {
            if (!isScrolling && window.scrollY < window.innerHeight * startThreshold) {
              startAutoScroll()
            }
          }, 200)
        } else {
          autoScrollRef.current = null
        }
      },
    })
  }, [ref, isScrolling, startThreshold, step, duration])

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRef.current) {
      autoScrollRef.current.kill()
      autoScrollRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!isScrolling && window.scrollY < window.innerHeight * startThreshold) {
      startAutoScroll()
    } else {
      stopAutoScroll()
    }
  }, [isScrolling, startThreshold, startAutoScroll, stopAutoScroll])

  useEffect(() => {
    return () => {
      stopAutoScroll()
    }
  }, [stopAutoScroll])

  return { startAutoScroll, stopAutoScroll }
}

export function useGSAPAnimation(
  selector: string,
  animation: gsap.TweenVars,
  config?: ScrollTrigger.Vars
) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const elements = document.querySelectorAll(selector)
    elements.forEach((el) => {
      gsap.to(el, {
        ...animation,
        scrollTrigger: config
          ? {
              trigger: el,
              ...config,
            }
          : undefined,
      })
    })

    return () => {
      if (config?.trigger) {
        ScrollTrigger.getAll()
          .filter((st) => st.vars.trigger === selector)
          .forEach((st) => st.kill())
      }
    }
  }, [selector, animation, config])
}

export function useTextRevealAnimation() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const revealElements = document.querySelectorAll('.reveal-text')
    revealElements.forEach((el) => {
      const element = el as HTMLElement
      element.style.setProperty('--revealProgress', '0')

      gsap.to(element, {
        '--revealProgress': 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 90%',
          end: 'top 40%',
          scrub: 1.5,
        },
      })
    })
  }, [])
}

export function useSplitTextAnimation() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const splitElements = document.querySelectorAll('[data-split]')
    splitElements.forEach((el) => {
      const element = el as HTMLElement
      const splitType = element.getAttribute('data-split')

      if (splitType?.includes('words')) {
        const words = element.textContent?.split(' ') || []
        element.innerHTML = words
          .map(
            (word, i) =>
              `<span class="word" style="opacity: 0; transform: translateY(20px);">${word}</span>`
          )
          .join(' ')

        const wordElements = element.querySelectorAll('.word')
        wordElements.forEach((wordEl, i) => {
          gsap.to(wordEl, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: i * 0.05,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          })
        })
      }
    })
  }, [])
}