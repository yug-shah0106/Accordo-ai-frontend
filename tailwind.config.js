// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {},
//     fontFamily: {
//       'Montserrat': ['Montserrat']
//     }
//   },
//   plugins: [],
// }


/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        marquee: 'marquee 15s linear infinite',  // Define the marquee animation with 15s duration
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },  // This defines the sliding effect
        },
      },
      fontFamily: {
        'Montserrat': ['Montserrat'],
        'Roboto':['Roboto']
      },
      colors: {
        dark: {
          bg: '#0B0F17',           // Dark background
          surface: '#1a1f2e',      // Card/surface background
          border: '#2d3748',       // Border color
          text: '#e2e8f0',         // Primary text
          'text-secondary': '#a0aec0', // Secondary text
        }
      },
    },
  },
  plugins: [],
}
