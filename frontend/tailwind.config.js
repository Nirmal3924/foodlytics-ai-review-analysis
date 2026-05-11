/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#E8401C',
          dark: '#C0300E',
          light: '#FFF5F3',
        },
      },
    },
  },
}
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        slideUp: 'slideUp 0.22s ease',
      }
    },
  },
}