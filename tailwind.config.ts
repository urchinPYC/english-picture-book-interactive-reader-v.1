import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5D4037',
        secondary: '#A1887F',
        accent: '#D7CCC8',
        background: '#FDF8F1',
      },
      fontFamily: {
        sans: ['Noto Sans TC', 'sans-serif'],
        sketch: ['Fredericka the Great', 'cursive'],
      },
    },
  },
  plugins: [],
} satisfies Config
