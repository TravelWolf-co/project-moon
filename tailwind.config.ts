import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        blush: "#ffe9f1",
        cream: "#fffaf5",
        rose: "#f9d7e3",
        lavender: "#e8e0ff",
        sage: "#dcefe4",
        ink: "#463d4f"
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        sans: ["Inter", "Avenir", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 14px 40px -18px rgba(95, 61, 87, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
