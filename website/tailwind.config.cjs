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
          goldMuted: '#8A703E',
        },
        success: {
          soft: '#3B7A57',
        },
        danger: {
          soft: '#8B3A3A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.3rem',
      },
      boxShadow: {
        'epsilon-gold': '0 0 25px rgba(197, 160, 89, 0.25)',
      },
    },
  },
  plugins: [],
}

