/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sakura-pink': '#FFB7C5',
        'sakura-light': '#FFF0F3',
        'heart-red': '#FF6B9D',
      },
      animation: {
        'float': 'float 15s infinite ease-in-out',
        'float-slow': 'float 20s infinite ease-in-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px) rotate(0deg)' },
          '25%': { transform: 'translateY(-20px) translateX(10px) rotate(5deg)' },
          '50%': { transform: 'translateY(-40px) translateX(-10px) rotate(-5deg)' },
          '75%': { transform: 'translateY(-20px) translateX(10px) rotate(3deg)' },
        }
      }
    },
  },
  plugins: [],
}
