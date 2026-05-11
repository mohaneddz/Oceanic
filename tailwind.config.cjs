/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: "#effbff",
          100: "#d7f3ff",
          200: "#afe7ff",
          300: "#73d6ff",
          400: "#30c0f2",
          500: "#07a9df",
          600: "#0688b6",
          700: "#0a6d91",
          800: "#115b77",
          900: "#124c63",
        },
      },
      boxShadow: {
        panel: "0 20px 45px rgba(4, 43, 66, 0.18)",
      },
    },
  },
  plugins: [],
};
