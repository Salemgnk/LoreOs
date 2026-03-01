/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lore: {
          50: "#faf6ed",
          100: "#f2e8d0",
          200: "#e4d0a3",
          300: "#d4b36a",
          400: "#c4a35a",
          500: "#a08545",
          600: "#8a7039",
          700: "#6e5a2e",
          800: "#524320",
          900: "#372d15",
          950: "#1c170a",
        },
      },
      fontFamily: {
        display: ["Cinzel", "Palatino Linotype", "Book Antiqua", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
