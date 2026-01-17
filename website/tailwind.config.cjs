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
        border: '#333333',
        epsilon: {
          gold: '#C5A059',
          goldMuted: '#B8954F',
          goldDark: '#8A703E',
        },
        success: {
          soft: '#3B7A57',
        },
        danger: {
          soft: '#8B3A3A',
        },
        gray: {
          200: '#E5E5E5',
          300: '#D1D5DB',
          350: '#B8BDC5',
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
        bold: '700',
      },
      letterSpacing: {
        'epsilon': '0.32em',
        'label': '0.18em',
        'body': '0.02em',
      },
      borderRadius: {
        sm: '0.125rem',
        DEFAULT: '0.125rem',
      },
      boxShadow: {
        'epsilon-gold': '0 0 20px rgba(184, 149, 79, 0.2)',
        'epsilon-gold-hover': '0 0 15px rgba(184, 149, 79, 0.25)',
        'inset-card': 'inset 0 0 0 1px rgba(21, 21, 21, 1)',
        'inset-button': 'inset 0 0 0 1px rgba(40, 40, 40, 0.5)',
      },
      transitionDuration: {
        'epsilon': '280ms',
      },
      transitionTimingFunction: {
        'epsilon': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

