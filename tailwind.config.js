/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        PoppinsBold: ["PoppinsBold", "sans-serif"],
        PoppinsSemiBold: ["PoppinsSemiBold", "sans-serif"],
        PoppinsRegular: ["PoppinsRegular", "sans-serif"],
      },
    },
  },
  plugins: [],
};
