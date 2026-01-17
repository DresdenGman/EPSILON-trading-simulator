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
        success: {
          soft: '#3B7A57',
          softHover: '#4A8B6A',
        },
        danger: {
          soft: '#8B3A3A',
          softHover: '#9A4A4A',
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
      },
      boxShadow: {
        'epsilon-gold': 'inset 0 0 8px rgba(184, 149, 79, 0.2), 0 0 12px rgba(184, 149, 79, 0.15)',
        'epsilon-inset': 'inset 0 1px 1px rgba(21, 21, 21, 0.8)',
        'epsilon-inset-gold': 'inset 0 1px 1px rgba(184, 149, 79, 0.3)',
      },
      transitionDuration: {
        '250': '250ms',
        '280': '280ms',
        '300': '300ms',
      },
      transitionTimingFunction: {
        'ease-out-slow': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}

