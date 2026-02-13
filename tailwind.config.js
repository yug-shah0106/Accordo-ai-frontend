/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        marquee: 'marquee 15s linear infinite',
        'counter': 'counter 2s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        counter: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      fontFamily: {
        'Montserrat': ['Montserrat', 'sans-serif'],
        'Inter': ['Inter', 'system-ui', 'sans-serif'],
        'Roboto': ['Roboto', 'sans-serif'],
      },
      colors: {
        // Primary brand colors
        primary: {
          50: '#EEF1FE',
          100: '#D8DFFE',
          200: '#B5C1FD',
          300: '#8DA0FC',
          400: '#5A78FA',
          500: '#234BF3',
          600: '#1A3AD4',
          700: '#132DB5',
          800: '#0E2196',
          900: '#0A1777',
        },
        // Dark theme colors (preserved for dashboard)
        dark: {
          bg: '#0B0F17',
          surface: '#1a1f2e',
          border: '#2d3748',
          text: '#e2e8f0',
          'text-secondary': '#a0aec0',
        },
        // Landing page light theme
        landing: {
          bg: '#FFFFFF',
          'bg-alt': '#F8FAFC',
          'bg-section': '#F1F5F9',
          text: '#0F172A',
          'text-secondary': '#475569',
          'text-muted': '#94A3B8',
          border: '#E2E8F0',
          'border-light': '#F1F5F9',
        },
      },
      maxWidth: {
        'landing': '1280px',
      },
      spacing: {
        'section': '6rem',
        'section-sm': '3rem',
      },
    },
  },
  plugins: [],
}
