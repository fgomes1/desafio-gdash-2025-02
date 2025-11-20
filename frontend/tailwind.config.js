/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gdash: {
          primary: '#00E08E',
          dark: '#0F172A',
          card: '#1E293B',
          gray: '#94A3B8',
        }
      }
    },
  },
  plugins: [],
}