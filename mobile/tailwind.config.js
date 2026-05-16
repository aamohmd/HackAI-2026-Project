/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#FDFBF7',
          100: '#F8F4E9',
          200: '#F1E9D2',
        },
        midnight: '#1E293B',
        wax: {
          DEFAULT: '#9A3412',
          dark: '#7C2D12',
        },
        seal: '#B45309',
      },
      fontFamily: {
        sans: ["Figtree"],
        serif: ["CrimsonText"],
      },
    },
  },
  plugins: [],
};
