import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0B0D10",
          900: "#12151A",
          800: "#1B1F26",
          700: "#262B33",
          600: "#3A4048",
        },
        paper: {
          50: "#FAFAF8",
          100: "#F3F2EE",
          200: "#E7E5DE",
        },
        accent: {
          DEFAULT: "#3E63DD",
          50: "#EEF1FD",
          100: "#DCE3FB",
          400: "#6685E6",
          500: "#3E63DD",
          600: "#2F4DBB",
          700: "#243C93",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(10,10,10,0.04), 0 8px 24px rgba(10,10,10,0.06)",
        glow: "0 0 0 1px rgba(62,99,221,0.15), 0 20px 60px -12px rgba(62,99,221,0.35)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(var(--tw-rotate,0))" },
          "50%": { transform: "translateY(-14px) rotate(var(--tw-rotate,0))" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-22px)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        blob: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -40px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.95)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 9s ease-in-out infinite",
        "spin-slow": "spin-slow 22s linear infinite",
        blob: "blob 12s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
      },
      typography: () => ({
        DEFAULT: {
          css: {
            maxWidth: "70ch",
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
