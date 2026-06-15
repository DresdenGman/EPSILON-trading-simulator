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
          // Brittany Chiang navy palette — professional trading aesthetic
          'base-100': '#0A192F',   /* dark navy background */
          'base-200': '#112240',   /* navy card surface */
          'base-300': '#233554',   /* hover/raised surface */
          'base-content': '#CCD6F6', /* primary text — light slate */
          'primary': '#64FFDA',    /* mint accent — buy/CTA */
          'primary-content': '#0A192F',
          'secondary': '#57CBFF',  /* sky blue */
          'secondary-content': '#0A192F',
          'accent': '#F57DFF',     /* pink accent */
          'accent-content': '#0A192F',
          'neutral': '#233554',
          'neutral-content': '#8892B0', /* slate text */
          'info': '#57CBFF',
          'info-content': '#0A192F',
          'success': '#64FFDA',    /* mint green = profit */
          'success-content': '#0A192F',
          'warning': '#FFD700',
          'warning-content': '#0A192F',
          'error': '#F0616D',      /* red = loss */
          'error-content': '#FFFFFF',
          '--rounded-box': '0.75rem',
          '--rounded-btn': '0.5rem',
          '--rounded-badge': '0.375rem',
          '--tab-radius': '0.5rem',
          '--border': '1px',
          '--depth': '1',
        },
      },
    ],
  },
}
