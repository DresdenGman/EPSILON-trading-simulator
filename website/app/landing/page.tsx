'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import Link from 'next/link'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// 照片列表 - 使用你提供的照片（类似 OVA 的环绕效果）
const images = [
  '/images/annie-spratt-QckxruozjRg-unsplash.jpg',
  '/images/pexels-alesiakozik-6771899.jpg',
  '/images/pexels-alper-tufan-651927958-34032677.jpg',
  '/images/pexels-alphatradezone-5831251.jpg',
  '/images/pexels-blue-8562969.jpg',
  '/images/pexels-blue-8562970.jpg',
  '/images/pexels-blue-8562972.jpg',
  '/images/pexels-egorkomarov-27141311.jpg',
  '/images/pexels-karola-g-7680467.jpg',
  '/images/pexels-mizunokozuki-13801650.jpg',
]

// 导航项
const navItems = [
  { id: 'hero', label: '01' },
  { id: 'portfolio', label: '02' },
  { id: 'about', label: '03' },
  { id: 'purpose', label: '04' },
  { id: 'features', label: '05' },
  { id: 'interface', label: '06' },
  { id: 'downloads', label: '07' },
  { id: 'contact', label: '08' },
]

export default function Home() {
  const imageFlowRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const heroTitleRef = useRef<HTMLHeadingElement>(null)
  const heroTextRef = useRef<HTMLParagraphElement>(null)
  const autoScrollRef = useRef<gsap.core.Tween | null>(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastScrollY = useRef(0)

  useEffect(() => {
    // 检测滚动状态 - 改进版本
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollDelta = Math.abs(currentScrollY - lastScrollY.current)
      
      if (scrollDelta > 5) {
        setIsScrolling(true)
        if (autoScrollRef.current) {
          autoScrollRef.current.kill()
          autoScrollRef.current = null
        }
      }
      
      lastScrollY.current = currentScrollY
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false)
      }, 2000)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    // Hero Section 文字动画 - 立即显示，不需要滚动触发
    if (heroTitleRef.current) {
      gsap.to(heroTitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out',
      })
    }

    if (heroTextRef.current) {
      gsap.to(heroTextRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.3,
        ease: 'power2.out',
      })
    }

    // Hero Section 照片背景自动环绕效果 - 使用 CSS 变量控制（类似 OVA）
    let heroAutoScrollInterval: NodeJS.Timeout | null = null
    const heroSection = document.getElementById('hero')
    
    if (imageFlowRef.current && heroSection) {
      const totalWidth = images.length * 100
      
      // 初始化 CSS 变量
      heroSection.style.setProperty('--bgsProgress', '1')
      heroSection.style.setProperty('--bgEndProgress', '0')
      
      // 自动慢速环绕效果（当不滚动时）- 使用 CSS 变量
      const startAutoScroll = () => {
        if (autoScrollRef.current || !imageFlowRef.current || !heroSection) return

        const currentProgress = parseFloat(heroSection.style.getPropertyValue('--bgsProgress') || '1')
        const step = 0.02 // 每次移动2%进度
        const nextProgress = currentProgress <= 0 ? 1 : currentProgress - step
        
        autoScrollRef.current = gsap.to(heroSection, {
          '--bgsProgress': nextProgress,
          duration: 4,
          ease: 'power1.inOut',
          onComplete: () => {
            if (!isScrolling && window.scrollY < window.innerHeight * 0.8 && heroSection) {
              // 循环播放
              const finalProgress = parseFloat(heroSection.style.getPropertyValue('--bgsProgress') || '0')
              if (finalProgress <= 0) {
                heroSection.style.setProperty('--bgsProgress', '1')
              }
              autoScrollRef.current = null
              setTimeout(() => {
                if (!isScrolling && window.scrollY < window.innerHeight * 0.8) {
                  startAutoScroll()
                }
              }, 200)
            } else {
              autoScrollRef.current = null
            }
          },
        })
      }

      // 监听滚动状态，控制自动环绕
      const checkAutoScroll = () => {
        if (!isScrolling && window.scrollY < window.innerHeight * 0.8) {
          // 在顶部且不滚动时，启动自动环绕
          if (!autoScrollRef.current) {
            startAutoScroll()
          }
        } else {
          // 滚动时停止自动环绕
          if (autoScrollRef.current) {
            autoScrollRef.current.kill()
            autoScrollRef.current = null
          }
        }
      }

      // 滚动时控制背景切换 - 使用 CSS 变量，添加平滑过渡
      ScrollTrigger.create({
        trigger: heroSection,
        start: 'top top',
        end: 'bottom top',
        scrub: 1, // 添加 scrub，让背景切换更平滑
        onUpdate: (self) => {
          const progress = 1 - self.progress
          heroSection.style.setProperty('--bgsProgress', String(progress))
          heroSection.style.setProperty('--bgEndProgress', String(self.progress))
        },
      })
      
      // Hero Section 淡出效果 - 当滚动离开时
      ScrollTrigger.create({
        trigger: heroSection,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => {
          // 当滚动到 Hero Section 底部时，内容逐渐淡出
          const fadeProgress = Math.min(self.progress * 1.5, 1)
          if (heroTitleRef.current) {
            gsap.to(heroTitleRef.current, {
              opacity: 1 - fadeProgress * 0.5,
              y: fadeProgress * 30,
              duration: 0.3,
            })
          }
          if (heroTextRef.current) {
            gsap.to(heroTextRef.current, {
              opacity: 1 - fadeProgress * 0.5,
              y: fadeProgress * 20,
              duration: 0.3,
            })
          }
        },
      })

      // 初始启动自动环绕 - 立即开始，不等待
      if (window.scrollY < window.innerHeight * 0.8) {
        startAutoScroll()
      }

      // 定期检查是否需要自动环绕
      heroAutoScrollInterval = setInterval(checkAutoScroll, 500)
    }

    // Portfolio Section 照片横向滚动效果 - 进一步降低灵敏度
    let portfolioScrollTween: gsap.core.Tween | null = null
    const portfolioFlow = document.querySelector('.portfolio-flow')
    if (portfolioFlow) {
      // 每张照片占100vw（包含间距），实际显示75vw，留25vw给相邻照片显示边边
      const totalWidth = images.length * 100 - 20 // 总宽度
      const container = portfolioFlow.parentElement?.parentElement
      
      // 滚动驱动的横向移动 - 优化衔接
      portfolioScrollTween = gsap.to(portfolioFlow, {
        x: () => `-${totalWidth - 100}vw`,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: () => `+=${totalWidth * 4}vw`,
          scrub: 4,
          pin: true,
          anticipatePin: 1,
          pinSpacing: true, // 确保 pin 后间距正确
          onEnter: () => {
            // 进入 Portfolio section 时的过渡效果
            gsap.from(portfolioFlow, {
              opacity: 0,
              duration: 0.8,
              ease: 'power2.out',
            })
          },
        },
      })

      // 每张图片的淡入淡出和缩放效果
      portfolioFlow.querySelectorAll('.image-item > div').forEach((imgWrapper: Element, index: number) => {
        const img = imgWrapper as HTMLElement
        gsap.to(img, {
          opacity: 1,
          scale: 1,
          scrollTrigger: {
            trigger: img,
            start: 'left 75%',
            end: 'right 25%',
            scrub: 4,
          },
        })
      })
    }

    // 文字滚动显示效果 - 使用 CSS 变量控制（类似 OVA），优化触发时机
    const revealElements = document.querySelectorAll('.reveal-text')
    revealElements.forEach((el) => {
      const element = el as HTMLElement
      element.style.setProperty('--revealProgress', '0')
      
      gsap.to(element, {
        '--revealProgress': 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 90%', // 更早触发，让文字显示更自然
          end: 'top 40%', // 延长动画区间，让过渡更平滑
          scrub: 1.5, // 稍微增加 scrub，让动画更平滑
        },
      })
    })
    
    // 文字分割动画 - 改进版本（类似 OVA 的 data-module-split）
    const splitElements = document.querySelectorAll('[data-split]')
    splitElements.forEach((el) => {
      const element = el as HTMLElement
      const splitType = element.getAttribute('data-split')
      
      if (splitType?.includes('words')) {
        // 简单的文字分割动画
        const words = element.textContent?.split(' ') || []
        element.innerHTML = words.map((word, i) => 
          `<span class="word" style="opacity: 0; transform: translateY(20px);">${word}</span>`
        ).join(' ')
        
        // 为每个词添加动画
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

    // 侧边导航高亮 - 优化触发时机
    if (navRef.current) {
      navItems.forEach((item, index) => {
        const section = document.getElementById(item.id)
        if (!section) return

        ScrollTrigger.create({
          trigger: section,
          start: 'top 60%', // 更早触发，让导航切换更自然
          end: 'bottom 40%',
          onEnter: () => {
            navRef.current?.querySelectorAll('a').forEach((el, i) => {
              el.setAttribute('data-active', i === index ? 'true' : 'false')
            })
            // 更新导航进度条
            const progress = ((index + 1) / navItems.length) * 100
            navRef.current?.style.setProperty('--navProgress', `${progress}%`)
          },
          onEnterBack: () => {
            navRef.current?.querySelectorAll('a').forEach((el, i) => {
              el.setAttribute('data-active', i === index ? 'true' : 'false')
            })
            // 更新导航进度条
            const progress = ((index + 1) / navItems.length) * 100
            navRef.current?.style.setProperty('--navProgress', `${progress}%`)
          },
        })
      })
    }
    
    // 全局滚动平滑处理
    ScrollTrigger.config({
      autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
    })
    
    // 刷新 ScrollTrigger 以确保所有动画正确初始化
    ScrollTrigger.refresh()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      if (heroAutoScrollInterval) {
        clearInterval(heroAutoScrollInterval)
      }
      if (autoScrollRef.current) {
        autoScrollRef.current.kill()
      }
      if (portfolioScrollTween) {
        portfolioScrollTween.kill()
      }
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [isScrolling])

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* 顶部导航 - 参考 OVA 设计，左上角 Contact 和 About US，右上角 Menu */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* 左上角 - Contact 和 About US */}
          <nav className="flex items-center gap-4 text-sm">
            <a 
              href="#contact" 
              className="px-4 py-2 rounded-md hover:bg-gray-100 transition-colors font-medium text-gray-700 hover:text-gray-900"
            >
              Contact
            </a>
            <button 
              onClick={() => {
                const aboutSection = document.getElementById('about')
                if (aboutSection) {
                  aboutSection.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className="px-4 py-2 rounded-md hover:bg-gray-100 transition-colors font-medium text-gray-700 hover:text-gray-900"
            >
              About US
            </button>
            </nav>

          {/* 右上角 - EPSILON Logo 和 Menu */}
          <div className="flex items-center gap-6">
            <div className="text-xl font-bold text-gray-900 hidden md:block">EPSILON</div>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="px-4 py-2 rounded-md hover:bg-gray-100 transition-colors font-medium text-gray-700 hover:text-gray-900"
            >
              {menuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>
      </header>

      {/* Menu 展开菜单 - 参考 OVA 设计 */}
      {menuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md flex items-center justify-center"
          onClick={() => setMenuOpen(false)}
        >
          <nav 
            className="flex flex-col gap-6 text-center bg-white/95 backdrop-blur-lg rounded-lg p-12 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 text-sm text-gray-500 font-mono">
              EPSILON embodies a central promise. A promise which, in reality, is a declaration of intent: 
              to provide only the most valuable, the most promising and the most resilient trading education experience.
            </div>
            <div className="border-t border-gray-200 pt-6">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="block text-2xl font-medium text-gray-900 hover:text-blue-600 transition-colors py-3"
                >
                  {item.label} - {item.id.charAt(0).toUpperCase() + item.id.slice(1)}
                </a>
              ))}
            </div>
          </nav>
        </div>
      )}

      {/* 侧边导航 - 类似 OVA，带进度指示 */}
      <nav
        ref={navRef}
        className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden md:block font-mono"
      >
        <div className="flex flex-col gap-3 relative">
          {/* 进度条 */}
          <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-gray-200">
            <div 
              className="absolute top-0 left-0 w-full bg-gray-900 transition-all duration-300"
              style={{ height: 'var(--navProgress, 0%)' }}
            />
          </div>
          
          {navItems.map((item, index) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-xs font-medium text-gray-400 transition-all duration-300 hover:text-gray-900 data-[active=true]:text-gray-900 data-[active=true]:font-bold pr-6 relative"
              onClick={(e) => {
                e.preventDefault()
                const section = document.getElementById(item.id)
                if (section) {
                  section.scrollIntoView({ behavior: 'smooth' })
                }
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <main>
        {/* Hero Section - 白色简洁风格，类似 OVA，使用 CSS 变量控制 */}
        <section 
          id="hero" 
          className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white transition-opacity duration-500"
          style={{ '--bgsProgress': 1, '--bgEndProgress': 0 } as React.CSSProperties}
        >
          {/* 照片背景层 - 双背景切换（类似 OVA） */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            {/* 背景开始层 */}
            <div 
              className="absolute inset-0 hero-background-start"
              style={{ 
                opacity: 'var(--bgsProgress)',
                transition: 'opacity 0.3s ease-out'
              }}
            >
              <div
                ref={imageFlowRef}
                className="flex h-full"
                style={{ width: `${images.length * 100}vw` }}
              >
                {images.slice(0, Math.ceil(images.length / 2)).map((src, index) => (
                  <div
                    key={`start-${index}`}
                    className="image-item relative h-full w-screen flex-shrink-0"
                    style={{ opacity: 0.15 }}
                  >
                    <Image
                      src={src}
                      alt={`Hero background start ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                      sizes="100vw"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 背景结束层 */}
            <div 
              className="absolute inset-0 hero-background-end"
              style={{ 
                opacity: 'var(--bgEndProgress)',
                transition: 'opacity 0.3s ease-out'
              }}
            >
              <div
                className="flex h-full"
                style={{ width: `${images.length * 100}vw` }}
              >
                {images.slice(Math.ceil(images.length / 2)).map((src, index) => (
                  <div
                    key={`end-${index}`}
                    className="image-item relative h-full w-screen flex-shrink-0"
                    style={{ opacity: 0.15 }}
                  >
                    <Image
                      src={src}
                      alt={`Hero background end ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="100vw"
                  />
                </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* 内容层 */}
          <div className="relative z-20 max-w-4xl text-center px-6">
            <h1 
              ref={heroTitleRef}
              className="text-6xl md:text-8xl lg:text-9xl font-bold mb-8 text-gray-900 leading-tight"
              style={{ opacity: 0, transform: 'translateY(50px)' }}
              data-split="words"
            >
              Valuable, that is
              <br />
              <span className="inline-block">
                <span className="text-blue-600">our</span>
                <br />
                <span className="text-gray-900">future.</span>
              </span>
            </h1>
            <p 
              ref={heroTextRef}
              className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
              style={{ opacity: 0, transform: 'translateY(30px)' }}
              data-split="words"
            >
              EPSILON is a stock trading simulator built around a central promise: 
              to provide the most valuable, promising, and resilient trading education experience.
            </p>
          </div>
        </section>

        {/* 照片横向滚动流 - 类似 OVA 的环绕效果 */}
        <section id="portfolio" className="relative bg-white">
          {/* 渐变过渡层 - 从 Hero 到 Portfolio 的平滑过渡 */}
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white via-white/80 to-transparent z-10 pointer-events-none" />
          <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
            <div
              className="portfolio-flow flex h-[75vh] items-center"
              style={{ 
                width: `${images.length * 100 - 20}vw`, // 每张照片100vw，但实际显示75vw，留25vw给相邻照片
              }}
            >
              {images.map((src, index) => (
                <div
                  key={index}
                  className="image-item flex-shrink-0 flex items-center justify-center"
                  style={{ 
                    width: '100vw', // 每张照片占100vw（包含间距）
                    height: '75vh', // 固定高度
                  }}
                >
                  <div
                    className="relative"
                    style={{ 
                      height: '75vh', // 固定高度
                      width: 'auto', // 宽度根据图片比例自适应
                      maxWidth: '75vw', // 最大宽度限制
                      opacity: index === 0 ? 1 : 0.5,
                      transform: `scale(${index === 0 ? 1 : 0.92})`,
                      transition: 'opacity 0.3s, transform 0.3s',
                    }}
                  >
                    <Image
                      src={src}
                      alt={`Portfolio ${index + 1}`}
                      width={1200}
                      height={900}
                      className="object-contain rounded-lg"
                      style={{ 
                        height: '75vh',
                        width: 'auto',
                        maxWidth: '75vw',
                      }}
                      priority={index === 0}
                      sizes="(max-width: 75vw) 75vw, 75vw"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section - 文字滚动显示，背景图片呼应 */}
        <section id="about" className="min-h-screen flex items-center justify-center px-6 bg-white relative overflow-hidden pt-24 pb-20">
          {/* 背景图片 */}
          <div className="absolute inset-0 opacity-10">
            <Image
              src="/images/pexels-alesiakozik-6771899.jpg"
              alt="About background"
              fill
              className="object-cover"
            />
          </div>

          <div className="max-w-4xl relative z-10">
            <h2 className="text-5xl md:text-6xl font-bold mb-12 text-gray-900 reveal-text">About</h2>
            <div className="space-y-8 text-lg md:text-xl text-gray-600 leading-relaxed">
              <p className="text-2xl font-semibold text-gray-900 reveal-text">
                <strong>Dresden E. Goehner</strong>
              </p>
              <p className="reveal-text">
                Creator of EPSILON Stock Trading Simulator
              </p>
              <p className="reveal-text">
                EPSILON embodies a central promise. A promise which, in reality, is a declaration of intent: 
                to provide only the most valuable, the most promising and the most resilient trading education experience.
              </p>
              <p className="reveal-text">
                EPSILON is a privacy-first, institutional-grade trading simulator built for the next generation of quants. 
                Our platform combines real-time market data, advanced analytics, and comprehensive risk management tools 
                to create an unparalleled educational experience.
                </p>
              <p className="reveal-text">
                By focusing on companies and technologies transforming the digital landscape, EPSILON identifies solutions 
                capable of addressing contemporary challenges and generating significant and sustainable returns.
                </p>
            </div>
          </div>
        </section>

        {/* Purpose Section - 文字滚动显示，背景图片呼应 */}
        <section id="purpose" className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-b from-white via-white to-gray-50 relative overflow-hidden py-24">
          {/* 背景图片 */}
          <div className="absolute inset-0 opacity-10">
            <Image
              src="/images/pexels-alphatradezone-5831251.jpg"
              alt="Purpose background"
              fill
              className="object-cover"
            />
          </div>

          <div className="max-w-4xl relative z-10">
            <h2 className="text-5xl md:text-6xl font-bold mb-12 text-gray-900 reveal-text">
              EPSILON
              <br />
              <span className="text-blue-600">Invests</span>
              <br />
              <span className="text-gray-900">Evaluates</span>
              <br />
              <span className="text-gray-700">Performs</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl reveal-text">
              In the most valuable, promising, and resilient assets. The concept of &quot;value&quot; at EPSILON 
              is fundamentally multidimensional.
            </p>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mt-6 reveal-text">
              Assets not only for their immediate financial potential but also for their ability to innovate, 
              adapt agilely to market evolutions, and sustain long-term growth, even in volatile economic environments.
            </p>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mt-6 reveal-text">
              By maximizing every investment opportunity, EPSILON builds a portfolio of assets that not only withstand 
              fluctuations but capitalize on the most promising opportunities on a global scale.
                    </p>
                  </div>
        </section>

        {/* Features Section - 文字滚动显示，背景图片呼应 */}
        <section id="features" className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden py-24">
          {/* 背景图片 */}
          <div className="absolute inset-0 opacity-10">
            <Image
              src="/images/pexels-blue-8562972.jpg"
              alt="Features background"
              fill
              className="object-cover"
            />
                </div>
          
          <div className="max-w-4xl relative z-10">
            <h2 className="text-5xl md:text-6xl font-bold mb-12 text-gray-900 reveal-text">Features</h2>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="reveal-text">
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Real-time Trading</h3>
                <p className="text-gray-600">
                  Experience real-time market data and trading simulation with institutional-grade tools. 
                  Access live market feeds, execute trades, and analyze performance in real-time.
                </p>
              </div>
              <div className="reveal-text">
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Risk Management</h3>
                <p className="text-gray-600">
                  Learn to manage risk with advanced analytics and automated risk scoring. 
                  Monitor portfolio exposure, set stop-loss limits, and optimize risk-return ratios.
                </p>
              </div>
              <div className="reveal-text">
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Quantitative Analysis</h3>
                <p className="text-gray-600">
                  Leverage powerful quantitative tools to analyze market trends, identify patterns, 
                  and develop data-driven trading strategies.
                </p>
              </div>
              <div className="reveal-text">
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Educational Resources</h3>
                <p className="text-gray-600">
                  Access comprehensive educational materials, tutorials, and interactive guides 
                  to master the art of quantitative trading.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Interface Section - 展示界面照片 */}
        <section id="interface" className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden py-24">
          {/* 背景图片 */}
          <div className="absolute inset-0 opacity-10">
            <Image
              src="/images/pexels-tabtrader-com-app-180445110-24709181.jpg"
              alt="Interface background"
              fill
              className="object-cover"
            />
          </div>

          <div className="max-w-6xl relative z-10">
            <h2 className="text-5xl md:text-6xl font-bold mb-12 text-gray-900 reveal-text text-center">Interface</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="reveal-text">
                <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src="/screenshots/main_interface.png"
                    alt="EPSILON Interface"
                    fill
                    className="object-contain bg-gray-50"
                  />
          </div>
          </div>
              <div className="reveal-text">
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Intuitive Design</h3>
                <p className="text-gray-600 mb-4">
                  EPSILON features a clean, intuitive interface designed for both beginners and experienced traders. 
                  Navigate seamlessly through real-time data, charts, and analytics.
                </p>
                <p className="text-gray-600">
                  Our interface prioritizes clarity and efficiency, allowing you to focus on what matters most: 
                  making informed trading decisions.
                </p>
                  </div>
                </div>
          </div>
        </section>

        {/* Downloads Section - 下载区域 */}
        <section id="downloads" className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden py-24">
          {/* 背景图片 */}
          <div className="absolute inset-0 opacity-10">
            <Image
              src="/images/pexels-egorkomarov-27141311.jpg"
              alt="Downloads background"
              fill
              className="object-cover"
            />
          </div>

          <div className="max-w-4xl relative z-10 text-center">
            <h2 className="text-5xl md:text-6xl font-bold mb-12 text-gray-900 reveal-text">Downloads</h2>
            
            {/* 商业计划书下载 */}
            <div className="mb-12 reveal-text">
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Business Plan</h3>
              <a
                href="/epsilon-business-plan.pdf"
                download
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                Download Business Plan (PDF)
                  </a>
                </div>

            {/* 视频 */}
            <div className="mb-12 reveal-text">
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Introduction Video</h3>
              <div className="relative w-full max-w-3xl mx-auto aspect-video rounded-lg overflow-hidden shadow-lg">
                <video
                  controls
                  className="w-full h-full object-cover"
                  poster="/images/pexels-alesiakozik-6771899.jpg"
                >
                  <source src="/epsilon-intro.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            {/* 应用程序下载 */}
            <div className="reveal-text">
              <h3 className="text-2xl font-semibold mb-6 text-gray-900">Download Application</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <a
                  href="#"
                  className="px-6 py-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-center"
                  onClick={(e) => {
                    e.preventDefault()
                    alert('macOS version coming soon!')
                  }}
                >
                  <div className="text-3xl mb-2">🍎</div>
                  <div className="font-semibold text-gray-900">macOS</div>
                  <div className="text-sm text-gray-600">Coming Soon</div>
                </a>
                <a
                  href="#"
                  className="px-6 py-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-center"
                  onClick={(e) => {
                    e.preventDefault()
                    alert('Windows version coming soon!')
                  }}
                >
                  <div className="text-3xl mb-2">🪟</div>
                  <div className="font-semibold text-gray-900">Windows</div>
                  <div className="text-sm text-gray-600">Coming Soon</div>
                </a>
                <a
                  href="#"
                  className="px-6 py-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-center"
                  onClick={(e) => {
                    e.preventDefault()
                    alert('Linux version coming soon!')
                  }}
                >
                  <div className="text-3xl mb-2">🐧</div>
                  <div className="font-semibold text-gray-900">Linux</div>
                  <div className="text-sm text-gray-600">Coming Soon</div>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section - 文字滚动显示，背景图片呼应 */}
        <section id="contact" className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-b from-white via-white to-gray-50 relative overflow-hidden py-24">
          {/* 背景图片 */}
          <div className="absolute inset-0 opacity-10">
            <Image
              src="/images/pexels-karola-g-7680467.jpg"
              alt="Contact background"
              fill
              className="object-cover"
            />
          </div>

          <div className="max-w-4xl text-center relative z-10">
            <h2 className="text-5xl md:text-6xl font-bold mb-8 text-gray-900 reveal-text">Contact</h2>
            <p className="text-lg md:text-xl text-gray-600 mb-4 reveal-text">
              Share your vision with us.
                </p>
            <p className="text-lg md:text-xl text-gray-600 reveal-text">
              Together, let&apos;s explore how to transform your ideas into tangible opportunities.
                </p>
            <div className="mt-8 reveal-text">
              <p className="text-gray-600 mb-2">
                <strong className="text-gray-900">Email:</strong> dresdengoehner@gmail.com
                </p>
              <p className="text-gray-600">
                <strong className="text-gray-900">Created by:</strong> Dresden E. Goehner
              </p>
            </div>
            </div>
        </section>

        {/* Footer */}
        <section id="footer" className="min-h-[50vh] flex items-center justify-center px-6 bg-gray-900 text-white">
          <div className="text-center">
            <p className="text-gray-400">© 2024 EPSILON. All rights reserved.</p>
            <p className="text-gray-500 mt-2">Stock Trading Simulator by Dresden E. Goehner</p>
          </div>
        </section>
      </main>

      <style jsx>{`
        .reveal-text {
          opacity: calc(var(--revealProgress, 0));
          transform: translateY(calc(30px * (1 - var(--revealProgress, 0))));
          transition: opacity 0.3s ease-out, transform 0.3s ease-out;
        }
        
        .hero-background-start,
        .hero-background-end {
          will-change: opacity;
          transition: opacity 0.5s ease-out;
        }
        
        /* 文字分割动画 */
        [data-split] .word {
          display: inline-block;
          margin-right: 0.25em;
        }
        
        /* Section 之间的平滑过渡 */
        section {
          scroll-margin-top: 80px; /* 为固定导航栏留出空间 */
        }
        
        /* Portfolio section 的渐变过渡 */
        #portfolio::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100px;
          background: linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
          z-index: 5;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}
