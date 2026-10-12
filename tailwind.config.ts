import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: { ink: "#08090b", paper: "#f0eee9", muted: "#87877f", electric: "#355cff", signal: "#fd3f55" },
      fontFamily: { sans: ["var(--font-sans)"] },
      letterSpacing: { editorial: "-0.075em" }
    }
  },
  plugins: []
};
export default config;
