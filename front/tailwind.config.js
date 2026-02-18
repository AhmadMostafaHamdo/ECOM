/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors from existing design system
        brand: {
          DEFAULT: '#2563eb',
          strong: '#1d4ed8',
          soft: '#eff6ff',
        },
        // Background colors
        bg: {
          main: '#fafbfc',
          accent: '#f3f4f6',
        },
        // Surface colors
        surface: '#ffffff',
        'surface-alt': '#f9fafb',
        // Text colors
        text: {
          main: '#111827',
          muted: '#6b7280',
        },
        // Accent colors
        highlight: '#f59e0b',
        success: '#10b981',
        danger: '#ef4444',
        // Line colors
        line: '#e5e7eb',
      },
      fontFamily: {
        'sans': ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
        'heading': ['Outfit', 'Manrope', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'strong': '0 10px 40px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'lg': '12px',
        'md': '8px',
        'sm': '6px',
      },
      maxWidth: {
        'shell': '1440px',
      },
      spacing: {
        'header': '64px',
        'subnav': '52px',
      },
      animation: {
        'page-fade': 'pageFade 0.55s ease-out',
        'fade-in': 'fadeIn 0.5s ease forwards',
      },
      keyframes: {
        pageFade: {
          from: {
            opacity: '0',
            transform: 'translateY(12px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeIn: {
          from: {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
}
