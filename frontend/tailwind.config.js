/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          primary: '#ff8c00',
          secondary: '#ffa500',
          accent: '#ffd700',
        }
      }
    },
  },
  plugins: [],
}
