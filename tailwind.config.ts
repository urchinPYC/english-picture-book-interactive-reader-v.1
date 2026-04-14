import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Noto Sans TC", "sans-serif"],
        sketch: ["Fredericka the Great", "cursive"],
      },
      colors: {
        primary: "#5D4037", // 深棕色
        secondary: "#A1887F", // 淺棕色
        accent: "#D7CCC8", // 淺灰色
        background: "#FDF8F1", // 淺米色
      },
    },
  },
  plugins: [],
}
