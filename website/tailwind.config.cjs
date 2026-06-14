/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        foreground: '#E5E5E5',
        muted: {
          DEFAULT: '#1E1E1E',
          foreground: '#9CA3AF',
        },
        border: '#282828',
        epsilon: {
          gold: '#C5A059',
          goldHover: '#D4B26D',
          goldMuted: '#B8954F',
          goldDark: '#8A703E',
        },
        accent: {
          DEFAULT: '#00D09C',
          hover: '#00B386',
          muted: 'rgb(0 208 156 / 0.15)',
        },
        danger: {
          soft: '#8B3A3A',
          softHover: '#9A4A4A',
        },
        surface: {
          DEFAULT: '#0F172A',
          elevated: '#1E293B',
          highlight: '#334155',
        },
        gray: {
          200: '#E5E5E5',
          300: '#D1D5DB',
          350: '#B8BCC2',
          400: '#9CA3AF',
          500: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
      },
      letterSpacing: {
        tighter: '-0.02em',
        tight: '0.02em',
        normal: '0.18em',
        wide: '0.32em',
      },
      borderRadius: {
        sm: '0.125rem',
        DEFAULT: '0.125rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'epsilon-gold': 'inset 0 0 8px rgba(184, 149, 79, 0.2), 0 0 12px rgba(184, 149, 79, 0.15)',
        'epsilon-inset': 'inset 0 1px 1px rgba(21, 21, 21, 0.8)',
        'epsilon-inset-gold': 'inset 0 1px 1px rgba(184, 149, 79, 0.3)',
        'glass': '0 4px 24px -1px rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.2)',
        'glass-lg': '0 8px 32px -2px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
        'glow': '0 0 20px rgb(0 208 156 / 0.15)',
        'glow-lg': '0 0 40px rgb(0 208 156 / 0.2)',
      },
      transitionDuration: {
        '250': '250ms',
        '280': '280ms',
        '300': '300ms',
      },
      transitionTimingFunction: {
        'ease-out-slow': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'scan': 'scan 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        scan: {
          '0%, 100%': { top: '-2px', opacity: '0' },
          '10%': { opacity: '1' },
          '50%': { top: 'calc(100% + 2px)', opacity: '1' },
          '60%, 100%': { opacity: '0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 8px rgb(0 208 156 / 0.15)' },
          '50%': { boxShadow: '0 0 20px rgb(0 208 156 / 0.3)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
