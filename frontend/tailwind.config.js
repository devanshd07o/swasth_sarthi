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
          DEFAULT: '#FBF6EC',
          deep: '#F2E9D6',
          'ink-panel': '#1E2116',
        },
        ink: {
          DEFAULT: '#241F17',
          soft: '#5B5442',
          faint: '#8A8266',
        },
        brand: {
          DEFAULT: '#2F5233',
          deep: '#1E3924',
          tint: '#E7EEE3',
        },
        gold: {
          DEFAULT: '#B97A34',
          soft: '#D9A868',
          tint: '#FBF2E6',
        },
        maroon: {
          DEFAULT: '#8A2A34',
          deep: '#691B24',
          tint: '#F3E3E1',
        },
        hairline: {
          DEFAULT: '#DED0AC',
          soft: '#E8DEC2',
        }
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      boxShadow: {
        'paper-sm': '0 1px 3px rgba(36, 32, 20, 0.08)',
        'paper': '0 4px 12px rgba(36, 32, 20, 0.08)',
        'paper-lg': '0 12px 28px rgba(36, 32, 20, 0.12)',
      },
      borderRadius: {
        'control': '9px',
        'card': '12px',
        'modal': '16px',
      }
    },
  },
  plugins: [],
}
