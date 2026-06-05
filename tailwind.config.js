/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        vazir: ['Vazirmatn', 'sans-serif'],
        heading: ['var(--font-heading)', 'Vazirmatn', 'sans-serif'],
        body: ['var(--font-body)', 'Vazirmatn', 'sans-serif'],
        mono: ['var(--font-mono)', 'Vazirmatn', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#fdf2ff',
          100: '#f5d0fe',
          200: '#e879f9',
          300: '#d946ef',
          400: '#c026d3',
          500: '#a21caf',
          600: '#86198f',
          700: '#701a75',
          800: '#4a044e',
          900: '#2e0032',
        },
        acid: {
          400: '#a3e635',
          500: '#84cc16',
        },
        neon: {
          400: '#22d3ee',
          500: '#06b6d4',
        },
        hot: {
          400: '#fb923c',
          500: '#f97316',
        },
      },
    },
  },
  plugins: [],
}
