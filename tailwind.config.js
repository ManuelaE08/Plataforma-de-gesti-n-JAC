/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1B7F4B",
        secondary: "#2563EB",
        tertiary: "#F59E0B",
        neutral: "#F5F7FA",
      },
    },
  },
  plugins: [],
};