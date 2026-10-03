/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#090d16",
        surface: {
          50: "#1e293b",
          100: "#182234",
          200: "#131b2c",
          300: "#0f1624",
          400: "#0b101c",
          500: "#070b13",
        },
        bull: {
          DEFAULT: "#10b981",
          light: "#34d399",
          dark: "#059669",
          glow: "rgba(16, 185, 129, 0.25)",
          bg: "rgba(16, 185, 129, 0.12)",
        },
        bear: {
          DEFAULT: "#f43f5e",
          light: "#fb7185",
          dark: "#e11d48",
          glow: "rgba(244, 63, 94, 0.25)",
          bg: "rgba(244, 63, 94, 0.12)",
        },
        brand: {
          50: "#eef2ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          accent: "#38bdf8",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      keyframes: {
        flashGreen: {
          "0%": { backgroundColor: "rgba(16, 185, 129, 0.45)", color: "#34d399" },
          "100%": { backgroundColor: "transparent", color: "inherit" },
        },
        flashRed: {
          "0%": { backgroundColor: "rgba(244, 63, 94, 0.45)", color: "#fb7185" },
          "100%": { backgroundColor: "transparent", color: "inherit" },
        },
        ticker: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "flash-green": "flashGreen 1.2s ease-out",
        "flash-red": "flashRed 1.2s ease-out",
        "ticker": "ticker 40s linear infinite",
      },
    },
  },
  plugins: [],
};
