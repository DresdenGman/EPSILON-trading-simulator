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
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem', letterSpacing: '0.02em' }],
        'display-xl': ['clamp(3rem, 8vw, 7rem)', { lineHeight: '0.95', letterSpacing: '-0.03em', fontWeight: '700' }],
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
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
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('daisyui')],
  daisyui: {
    themes: [
      {
        'epsilon': {
          'color-scheme': 'dark',
          'base-100': '#0B0E14',
          'base-200': '#111620',
          'base-300': '#19202E',
          'base-content': '#D8DEE9',
          'primary': '#00D09C',
          'primary-content': '#07080B',
          'secondary': '#5E81AC',
          'secondary-content': '#D8DEE9',
          'accent': '#C5A059',
          'accent-content': '#07080B',
          'neutral': '#2E3440',
          'neutral-content': '#D8DEE9',
          'info': '#81A1C1',
          'info-content': '#07080B',
          'success': '#A3BE8C',
          'success-content': '#07080B',
          'warning': '#EBCB8B',
          'warning-content': '#07080B',
          'error': '#BF616A',
          'error-content': '#07080B',
          '--rounded-box': '0.75rem',
          '--rounded-btn': '0.5rem',
          '--rounded-badge': '0.375rem',
          '--tab-radius': '0.5rem',
        },
      },
    ],
  },
}
