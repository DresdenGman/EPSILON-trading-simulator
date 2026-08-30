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
        // Local system stacks keep production builds and the app usable offline.
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', 'monospace'],
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
          // EPSILON instrument palette: monochrome by default; colour is evidence.
          'base-100': '#08090C',
          'base-200': '#101217',
          'base-300': '#292C34',
          'base-content': '#F0EFEA',
          'primary': '#F0EFEA',
          'primary-content': '#08090C',
          'secondary': '#8BE9FD',
          'secondary-content': '#08090C',
          'accent': '#D6A2FF',
          'accent-content': '#08090C',
          'neutral': '#1A1C22',
          'neutral-content': '#9B9DA5',
          'info': '#8BE9FD',
          'info-content': '#08090C',
          'success': '#74E6A5',
          'success-content': '#08090C',
          'warning': '#F3C969',
          'warning-content': '#08090C',
          'error': '#FF7185',
          'error-content': '#FFFFFF',
          '--rounded-box': '0.375rem',
          '--rounded-btn': '0.25rem',
          '--rounded-badge': '999px',
          '--tab-radius': '0.25rem',
          '--border': '1px',
          '--depth': '1',
        },
      },
    ],
  },
}
