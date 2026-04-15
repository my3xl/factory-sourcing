/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#32373C',
          brown: '#A2674F',
          blue: '#1E73BE',
          warm: '#534D4F',
          cream: '#FDFDF1',
          gray: '#636363',
          border: '#F0F0F0',
        }
      },
    },
  },
  plugins: [],
}
