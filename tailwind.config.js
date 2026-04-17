/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a6ff7',
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#1a6ff7',
          600: '#1558d0',
          700: '#1044aa',
          800: '#0c3383',
          900: '#082563',
        },
        accent: {
          DEFAULT: '#f5c518',
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f5c518',
          600: '#d4a017',
          700: '#b07d12',
          800: '#8a5e0d',
          900: '#654508',
        },
        surface: {
          DEFAULT: '#0f1623',
          2: '#172033',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
