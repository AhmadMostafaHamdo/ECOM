/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors - From Logo Orange (#FF9500)
        primary: {
          DEFAULT: "#FF9500",
          50: "#FFF8E7",
          100: "#FFEFD6",
          200: "#FFE0B3",
          300: "#FFD08A",
          400: "#FFBF5C",
          500: "#FF9500",
          600: "#E68600",
          700: "#CC7700",
          800: "#A35F00",
          900: "#7A4700",
        },
        // Secondary Colors - From Logo Gray (#808080)
        secondary: {
          DEFAULT: "#808080",
          50: "#F5F5F5",
          100: "#E8E8E8",
          200: "#D4D4D4",
          300: "#B8B8B8",
          400: "#999999",
          500: "#808080",
          600: "#666666",
          700: "#4D4D4D",
          800: "#333333",
          900: "#1A1A1A",
        },
        // Semantic Colors
        success: {
          DEFAULT: "#10B981",
          soft: "#D1FAE5",
          dark: "#047857",
        },
        warning: {
          DEFAULT: "#F59E0B",
          soft: "#FEF3C7",
          dark: "#B45309",
        },
        error: {
          DEFAULT: "#EF4444",
          soft: "#FEE2E2",
          dark: "#B91C1C",
        },
        info: {
          DEFAULT: "#808080",
          soft: "#F5F5F5",
          dark: "#4D4D4D",
        },
        // Background & Surface
        background: {
          DEFAULT: "#FFFFFF",
          subtle: "#FAFAFA",
          hover: "#F5F5F5",
          active: "#EBEBEB",
          dark: "#0D0D0D",
          "dark-subtle": "#121212",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          raised: "#FFFFFF",
          elevated: "#FFFFFF",
          dark: "#1A1A1A",
          "dark-raised": "#262626",
          "dark-elevated": "#333333",
        },
        // Text Colors
        text: {
          primary: "#1A1A1A",
          secondary: "#4D4D4D",
          tertiary: "#808080",
          placeholder: "#999999",
          disabled: "#B8B8B8",
          inverse: "#FFFFFF",
          "dark-primary": "#FFFFFF",
          "dark-secondary": "#EBEBEB",
          "dark-tertiary": "#B8B8B8",
        },
        // Border Colors
        border: {
          DEFAULT: "#E8E8E8",
          subtle: "#F0F0F0",
          strong: "#D4D4D4",
          dark: "#333333",
          "dark-subtle": "#262626",
          "dark-strong": "#404040",
        },
        // Legacy compatibility mappings
        brand: {
          DEFAULT: "#FF9500",
          deep: "#CC7700",
          light: "#FFB84D",
          soft: "#FFF8E7",
        },
        ink: {
          DEFAULT: "#1A1A1A",
          dark: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#808080",
          dark: "#B8B8B8",
        },
        bg: {
          light: "#FAFAFA",
          dark: "#0D0D0D",
        },
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "Manrope",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
        heading: ["Plus Jakarta Sans", "Outfit", "Manrope", "sans-serif"],
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0, 0, 0, 0.04)",
        md: "0 4px 12px rgba(0, 0, 0, 0.08)",
        lg: "0 8px 24px rgba(0, 0, 0, 0.12)",
        xl: "0 16px 48px rgba(0, 0, 0, 0.16)",
        soft: "0 1px 3px rgba(0, 0, 0, 0.08)",
        card: "0 4px 20px rgba(0, 0, 0, 0.08)",
        primary: "0 4px 16px rgba(255, 149, 0, 0.35)",
        "primary-lg": "0 8px 32px rgba(255, 149, 0, 0.45)",
        gold: "0 6px 24px rgba(255, 149, 0, 0.30)",
        "gold-lg": "0 10px 36px rgba(255, 149, 0, 0.40)",
        "dark-sm": "0 1px 2px rgba(0, 0, 0, 0.3)",
        "dark-md": "0 4px 12px rgba(0, 0, 0, 0.4)",
        "dark-lg": "0 8px 24px rgba(0, 0, 0, 0.5)",
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
        "primary-gradient": "linear-gradient(135deg, #FF9500 0%, #E68600 100%)",
        "primary-gradient-hover":
          "linear-gradient(135deg, #FFB84D 0%, #FF9500 100%)",
        "surface-gradient": "linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)",
        "gold-gradient": "linear-gradient(135deg, #FF9500, #CC7700)",
        "dark-gradient":
          "linear-gradient(145deg, #0D0D0D 0%, #1A1A1A 50%, #262626 100%)",
        "dark-surface": "linear-gradient(180deg, #1A1A1A 0%, #0D0D0D 100%)",
        glow: "radial-gradient(circle, rgba(255, 149, 0, 0.15) 0%, transparent 70%)",
      },
    },
  },
  plugins: [],
};
