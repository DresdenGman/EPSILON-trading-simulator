'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface NavBarProps {
  onMenuToggle: () => void
  menuOpen: boolean
}

export default function NavBar({ onMenuToggle, menuOpen }: NavBarProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id)
    if (section) section.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-surface/60 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/10'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto max-w-7xl px-6 flex items-center justify-between py-4">
        <nav className="flex items-center gap-6">
          <button
            onClick={() => scrollToSection('contact')}
            className="text-sm font-medium text-white/60 hover:text-white transition-colors duration-200"
          >
            Contact
          </button>
          <button
            onClick={() => scrollToSection('about')}
            className="text-sm font-medium text-white/60 hover:text-white transition-colors duration-200"
          >
            About
          </button>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-accent hover:text-accent-light transition-colors duration-200"
          >
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-6">
          <div className="hidden md:block text-lg font-bold tracking-tight text-white">
            EPSILON
          </div>
          <Link
            href="/auth/login"
            className="hidden md:inline-flex text-sm font-medium text-white/60 hover:text-white transition-colors duration-200"
          >
            Sign In
          </Link>
          <button
            onClick={onMenuToggle}
            className="text-sm font-medium text-white/80 hover:text-white transition-colors duration-200"
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>
    </header>
  )
}
