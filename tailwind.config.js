/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background:   'hsl(var(--background) / <alpha-value>)',
        foreground:   'hsl(var(--foreground) / <alpha-value>)',
        card:         'hsl(var(--card) / <alpha-value>)',
        sidebar:      'hsl(var(--sidebar) / <alpha-value>)',
        header:       'hsl(var(--header) / <alpha-value>)',
        muted:        'hsl(var(--muted) / <alpha-value>)',
        'muted-fore': 'hsl(var(--muted-fore) / <alpha-value>)',
        border:       'hsl(var(--border) / <alpha-value>)',
        input:        'hsl(var(--input) / <alpha-value>)',
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          fore:    'hsl(var(--primary-fore) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          fore:    'hsl(var(--accent-fore) / <alpha-value>)',
        },
        destructive:  'hsl(var(--destructive) / <alpha-value>)',
        success:      'hsl(var(--success) / <alpha-value>)',
        warning:      'hsl(var(--warning) / <alpha-value>)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: 'calc(var(--radius) - 4px)',
        md: 'var(--radius)',
        lg: 'calc(var(--radius) + 2px)',
        xl: 'calc(var(--radius) + 4px)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
