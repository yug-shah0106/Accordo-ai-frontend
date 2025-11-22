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
    },
  },
  plugins: [],
}
