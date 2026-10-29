import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        athar: {
          ink: "#0a0a0a",
          panel: "#151515",
          gold: "#d7b76a",
          paper: "#f5f1e8"
        }
      }
    }
  },
  plugins: []
};

export default config;
