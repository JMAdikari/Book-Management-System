/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E3D4B9',
          100: '#D9CBA0',
          200: '#D9CBA0',
          300: '#A67C4D',
          400: '#A67C4D',
          500: '#8B5B29',
          600: '#8B5B29',
          700: '#4B3D2D',
          800: '#4B3D2D',
          900: '#4B3D2D',
        },
        secondary: {
          50: '#E3D4B9',
          100: '#D9CBA0',
          500: '#A67C4D',
          700: '#4B3D2D',
        },
        accent: {
          light: '#E3D4B9',
          main: '#D9CBA0',
          medium: '#A67C4D',
          dark: '#4B3D2D',
          primary: '#8B5B29',
        }
      },
    },
  },
  plugins: [],
}