/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#F8F9FA',
          surface: '#FFFFFF',
          deep: '#EBEFEA',
          'ink-panel': '#0E241B',
        },
        ink: {
          DEFAULT: '#0F261C',
          soft: '#385547',
          faint: '#6B877A',
        },
        brand: {
          DEFAULT: '#12372A',
          deep: '#091F17',
          leaf: '#436850',
          tint: '#E8F0EC',
        },
        gold: {
          DEFAULT: '#B8860B',
          soft: '#D4AF37',
          tint: '#FFFDF0',
        },
        maroon: {
          DEFAULT: '#8B0000',
          deep: '#5B0000',
          tint: '#FDF0F0',
        },
        hairline: {
          DEFAULT: '#D1DCD6',
          soft: '#E4ECE8',
        }
      },
      fontFamily: {
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      boxShadow: {
        'paper-sm': '0 1px 3px rgba(15, 38, 28, 0.04)',
        'paper': '0 4px 16px rgba(15, 38, 28, 0.06)',
        'paper-lg': '0 12px 32px rgba(15, 38, 28, 0.09)',
      },
      borderRadius: {
        'control': '8px',
        'card': '14px',
        'modal': '18px',
      }
    },
  },
  plugins: [],
}
