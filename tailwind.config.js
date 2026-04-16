/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7c6af7',
          50:  '#f3f1ff',
          100: '#e9e6ff',
          200: '#d6d0ff',
          300: '#b8adff',
          400: '#9b8df9',
          500: '#7c6af7',
          600: '#6a56f0',
          700: '#5a44dc',
          800: '#4a38b8',
          900: '#3d3096',
        },
        surface: {
          DEFAULT: '#1a1a24',
          2: '#22222f',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
