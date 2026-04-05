import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0A0E1A",
        cyan: "#00F5D4",
        amber: "#FFB627",
        benefit: "#3DDB85",
        pathogen: "#FF4757",
        panel: "rgba(255,255,255,0.05)"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(0,245,212,0.25), 0 0 32px rgba(0,245,212,0.15)",
        amber: "0 0 0 1px rgba(255,182,39,0.3), 0 0 24px rgba(255,182,39,0.15)"
      },
      backgroundImage: {
        membrane:
          "radial-gradient(circle at center, rgba(0,245,212,0.08) 0, rgba(0,245,212,0.04) 1px, transparent 1px), linear-gradient(120deg, rgba(255,255,255,0.03), rgba(255,255,255,0))",
        hero:
          "radial-gradient(circle at top, rgba(0,245,212,0.18), rgba(10,14,26,0.85) 48%, rgba(10,14,26,1) 100%)"
      },
      animation: {
        pulseGlow: "pulseGlow 1.8s ease-in-out infinite",
        floaty: "floaty 6s ease-in-out infinite",
        spinSlow: "spin 3s linear infinite"
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 1px rgba(0,245,212,0.2), 0 0 12px rgba(0,245,212,0.12)" },
          "50%": { boxShadow: "0 0 0 1px rgba(0,245,212,0.4), 0 0 24px rgba(0,245,212,0.2)" }
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "50%": { transform: "translateY(-12px) translateX(6px)" }
        }
      }
    }
  },
  plugins: []
};

export default config;

