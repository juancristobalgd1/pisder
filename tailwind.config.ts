import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0f1513", surface: "#151c19", card: "#1a231f", line: "#26322d",
        muted: "#8a8a8a", soft: "#bdbdbd",
        brand: { DEFAULT: "#2fd3a0", 400: "#6ee7c3", 600: "#14b88a", 700: "#0e8f6c" },
        wa: "#25d366",
      },
      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      backgroundImage: {
        "brand-grad": "linear-gradient(135deg,#6ee7c3 0%,#10b981 100%)",
        "card-fade": "linear-gradient(180deg,rgba(0,0,0,0) 45%,rgba(0,0,0,.75) 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
