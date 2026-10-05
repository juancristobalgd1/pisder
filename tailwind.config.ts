import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#161616", surface: "#1e1e1e", card: "#232323", line: "#2c2c2c",
        muted: "#8a8a8a", soft: "#bdbdbd",
        brand: { DEFAULT: "#b46ef0", 400: "#c99af7", 600: "#9a4fe0", 700: "#7e3bc4" },
        wa: "#25d366",
      },
      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      backgroundImage: {
        "brand-grad": "linear-gradient(135deg,#d08cf5 0%,#a855f7 100%)",
        "card-fade": "linear-gradient(180deg,rgba(0,0,0,0) 45%,rgba(0,0,0,.75) 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
