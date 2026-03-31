import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* צבעים מותאמים - גווני חום כהה פרימיום */
      colors: {
        brown: {
          50: "#fdf8f6",
          100: "#f2e8e5",
          200: "#eaddd7",
          300: "#e0cfc7",
          400: "#d2bab0",
          500: "#bfa094",
          600: "#a18072",
          700: "#7c5e52",
          800: "#5c4033",
          900: "#3e2723",
          950: "#2c1a12",
        },
        gold: {
          400: "#d4a853",
          500: "#c9952e",
          600: "#b8860b",
        },
      },
      fontFamily: {
        heebo: ["Heebo", "sans-serif"],
        frank: ["Frank Ruhl Libre", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
