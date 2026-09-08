import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Grounded in the "receipt handed over at the counter" concept.
        espresso: "#2B1D14", // outer frame background
        paper: "#F3E9D8", // receipt card surface
        ink: "#2B1D14", // text on paper
        chalk: "#E7DCC8", // muted text on the dark frame
        gold: "#C98A2C", // single interactive accent
        sage: "#6E8B5E", // reserved for thank-you/closure state only
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "ui-serif", "serif"],
        body: ["var(--font-inter)", "ui-sans-serif", "sans-serif"],
      },
      keyframes: {
        "card-rise": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "star-pulse": {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.18)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "card-rise": "card-rise 0.4s ease-out",
        "star-pulse": "star-pulse 0.3s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
