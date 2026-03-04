/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#f0a500",
          deep: "#c8880a",
          light: "#ffd166",
          soft: "#fff8e7",
        },
        surface: {
          DEFAULT: "#ffffff",
          dark: "#1a1a2a",
        },
        "surface-2": {
          DEFAULT: "#f8fafc",
          dark: "#22223a",
        },
        ink: {
          DEFAULT: "#111827",
          dark: "#f0f0fa",
        },
        muted: {
          DEFAULT: "#6b7280",
          dark: "#a0a0c0",
        },
        border: {
          DEFAULT: "#e5e7eb",
          dark: "rgba(255,255,255,0.07)",
        },
        bg: {
          light: "#f4f6f9",
          dark: "#0d0d14",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Manrope", "Inter", "system-ui", "sans-serif"],
        heading: ["Plus Jakarta Sans", "Outfit", "Manrope", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 3px rgba(0, 0, 0, 0.08)",
        card: "0 4px 20px rgba(0, 0, 0, 0.08)",
        gold: "0 6px 24px rgba(240,165,0,0.30)",
        "gold-lg": "0 10px 36px rgba(240,165,0,0.40)",
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "28px",
      },
      maxWidth: {
        shell: "1440px",
        content: "1200px",
      },
      spacing: {
        header: "70px",
      },
      animation: {
        "page-fade": "pageFade 0.5s ease-out",
        "fade-up": "fadeUp 0.5s ease forwards",
        "slide-in": "slideIn 0.4s ease",
        "pulse-dot": "pulseDot 2s ease-in-out infinite",
        "spin-slow": "spin 20s linear infinite",
      },
      keyframes: {
        pageFade: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateX(-10px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.8)" },
        },
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #f0a500, #c8880a)",
        "dark-gradient": "linear-gradient(145deg, #0e0e1b 0%, #171726 50%, #1a1030 100%)",
      },
    },
  },
  plugins: [],
};
