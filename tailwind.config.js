/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF8F5',
        'text-primary': '#2C2418',
        'text-secondary': '#6B5D4F',
        accent: '#C4762B',
        'accent-hover': '#A85E1C',
        success: '#4A7C59',
        warning: '#D4A843',
        danger: '#C44B2B',
        card: '#FFFFFF',
        border: '#E8E2DA',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
