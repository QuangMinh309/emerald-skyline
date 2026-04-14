/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
      extend: {
        colors: {
          main: "#244B35",
          secondary: "#E09B6B",
          third: "#EFEAE1",
          border: "#D9D9D9",
          background: "#FFFFFF",
          foreground: "#000000",
        },
        fontFamily: {
          BeVietnamPro: ["BeVietnamPro"],
          BeVietnamProMedium: ["BeVietnamProMedium"],
          BeVietnamProSemi: ["BeVietnamProSemiBold"],
          BeVietnamProBold: ["BeVietnamProBold"],
        },
    },
  },
  plugins: [],
};
