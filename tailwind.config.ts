import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-ibm-plex-arabic)", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#1a1a2e", // Deep Navy
          light: "#24243e",
          dark: "#0f0f1c",
        },
        accent: {
          DEFAULT: "#C8A96E", // Gold/Amber Qiddiya Accent
          light: "#dcc494",
          dark: "#a6884d",
        },
        danger: {
          DEFAULT: "#dc2626",
          light: "#fca5a5",
        },
        warning: {
          DEFAULT: "#f59e0b",
          light: "#fde68a",
        },
        success: {
          DEFAULT: "#16a34a",
          light: "#86efac",
        },
        surface: "#FFFFFF",
        customBorder: "#E5E7EB",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
