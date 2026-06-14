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
        // Core surfaces — layered depth system
        'surface-root': '#07080B',
        'surface-base': '#0B0D14',
        'surface-raised': '#111620',
        'surface-overlay': '#19202E',

        // Text hierarchy
        'text-primary': '#EDF0F5',
        'text-secondary': '#8B95A8',
        'text-muted': '#586376',

        // Border system
        'border-subtle': 'rgba(255,255,255,0.06)',
        'border-default': 'rgba(255,255,255,0.10)',
        'border-strong': 'rgba(255,255,255,0.15)',
        'border-accent': 'rgba(0,208,156,0.25)',

        // Brand accent (teal-green)
        accent: {
          DEFAULT: '#00D09C',
          light: '#1AE8B4',
          muted: 'rgba(0,208,156,0.15)',
          glow: 'rgba(0,208,156,0.35)',
        },

        // Danger red
        danger: {
          DEFAULT: '#F0616D',
          light: '#F47F8A',
          muted: 'rgba(240,97,109,0.15)',
        },

        // Warning amber
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          muted: 'rgba(245,158,11,0.15)',
        },

        // Info blue
        info: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
          muted: 'rgba(59,130,246,0.15)',
        },

        // Legacy — keep for backward compat
        background: '#07080B',
        foreground: '#EDF0F5',
        muted: {
          DEFAULT: '#111620',
          foreground: '#8B95A8',
        },
        border: 'rgba(255,255,255,0.10)',
        epsilon: {
          gold: '#C5A059',
          goldHover: '#D4B26D',
          goldMuted: '#B8954F',
          goldDark: '#8A703E',
        },
        success: {
          soft: '#00D09C',
          softHover: '#1AE8B4',
        },
        gray: {
          200: '#EDF0F5',
          300: '#C8CFDA',
          350: '#8B95A8',
          400: '#586376',
          500: '#3E4858',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem', letterSpacing: '0.02em' }],
        'display-xl': ['clamp(3rem, 8vw, 7rem)', { lineHeight: '0.95', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-lg': ['clamp(2.25rem, 5vw, 4rem)', { lineHeight: '1.0', letterSpacing: '-0.02em', fontWeight: '700' }],
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
        // Card depth layers
        'surface-sm': '0 1px 2px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)',
        'surface-md': '0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
        'surface-lg': '0 4px 16px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
        'surface-xl': '0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.07)',
        // Accent glows
        'glow-accent': '0 0 20px rgba(0,208,156,0.15), 0 0 60px rgba(0,208,156,0.05)',
        'glow-accent-sm': '0 0 12px rgba(0,208,156,0.12)',
        // Legacy — keep for backward compat
        'epsilon-gold': 'inset 0 0 8px rgba(184,149,79,0.2), 0 0 12px rgba(184,149,79,0.15)',
        'epsilon-inset': 'inset 0 1px 1px rgba(0,0,0,0.8)',
        'epsilon-inset-gold': 'inset 0 1px 1px rgba(184,149,79,0.3)',
      },

      transitionDuration: {
        '150': '150ms',
        '250': '250ms',
        '350': '350ms',
        '500': '500ms',
      },

      transitionTimingFunction: {
        'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'ease-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ease-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-subtle': 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)',
        'gradient-accent': 'linear-gradient(135deg, rgba(0,208,156,0.08) 0%, rgba(0,208,156,0.02) 100%)',
      },

      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },

      animation: {
        'fade-in': 'fade-in 0.5s ease-out-expo forwards',
        'fade-in-up': 'fade-in-up 0.6s ease-out-expo forwards',
        'scale-in': 'scale-in 0.4s ease-spring forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
