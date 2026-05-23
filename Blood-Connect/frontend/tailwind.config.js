/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        blood: {
          50: '#fff1f1', 100: '#ffe0e0', 200: '#ffc5c5',
          300: '#ff9a9a', 400: '#ff5c5c', 500: '#f83030',
          600: '#e51111', 700: '#c10a0a', 800: '#a00c0c',
          900: '#840f0f'
        }
      }
    }
  },
  plugins: []
}
