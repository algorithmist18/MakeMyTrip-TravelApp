/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
        },
        ink: {
          900: "#0f172a",
          700: "#334155",
          500: "#64748b",
        },
        navy: {
          950: "#070c1f",
          900: "#0b1229",
          800: "#121a3a",
          700: "#1a2450",
        },
        accent: {
          50: "#eef6ff",
          100: "#d9ebff",
          400: "#3b93f0",
          500: "#1a73e8",
          600: "#1358b8",
          700: "#0d4290",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
