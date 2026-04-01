/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        peak: {
          purple: '#6366f1',
          blue: '#3b82f6',
          green: '#22c55e',
          red: '#ef4444',
          yellow: '#f59e0b',
        }
      }
    },
  },
  plugins: [],
}
