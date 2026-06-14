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
        background: '#050508',
        foreground: '#E8ECF1',
        muted: {
          DEFAULT: 'rgba(255,255,255,0.04)',
          foreground: '#8E95A3',
        },
        border: 'rgba(255,255,255,0.06)',
        // Primary teal accent
        accent: {
          DEFAULT: '#00D09C',
          light: '#1FE6B2',
          dark: '#00A87C',
          muted: 'rgba(0,208,156,0.12)',
        },
        // Epsilon gold (legacy)
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
        // Glass surface colors
        surface: {
          DEFAULT: 'rgba(255,255,255,0.03)',
          hover: 'rgba(255,255,255,0.06)',
          raised: 'rgba(255,255,255,0.05)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      letterSpacing: {
        tighter: '-0.03em',
        tight: '-0.01em',
        normal: '0.02em',
        wide: '0.08em',
        wider: '0.16em',
      },
      borderRadius: {
        sm: '0.375rem',
        DEFAULT: '0.5rem',
        md: '0.625rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        'epsilon-gold': 'inset 0 0 8px rgba(184, 149, 79, 0.2), 0 0 12px rgba(184, 149, 79, 0.15)',
        'epsilon-inset': 'inset 0 1px 1px rgba(21, 21, 21, 0.8)',
        'epsilon-inset-gold': 'inset 0 1px 1px rgba(184, 149, 79, 0.3)',
        glow: '0 0 20px rgba(0,208,156,0.15), 0 0 60px rgba(0,208,156,0.05)',
        'glow-lg': '0 0 40px rgba(0,208,156,0.2), 0 0 100px rgba(0,208,156,0.08)',
        card: '0 1px 2px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)',
        'card-hover': '0 2px 4px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.3)',
      },
      backdropBlur: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '20px',
        xl: '28px',
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 70%)',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-from), var(--tw-gradient-via), var(--tw-gradient-to))',
        'hero-glow':
          'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,208,156,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 20%, rgba(197,160,89,0.06) 0%, transparent 50%)',
      },
      transitionDuration: {
        '250': '250ms',
        '280': '280ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
      },
      transitionTimingFunction: {
        'ease-out-slow': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'ease-out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'ease-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-up': 'fadeUp 0.6s ease-out-slow forwards',
        'fade-down': 'fadeDown 0.6s ease-out-slow forwards',
        'scale-in': 'scaleIn 0.4s ease-spring forwards',
        'slide-right': 'slideRight 0.5s ease-out-slow forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeDown: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,208,156,0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(0,208,156,0.25)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}
