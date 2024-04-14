/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        blur: {
          '0%': { filter: "blur(1px)" },
          '100%': { filter: "blur(4px)" },
        },
        unblur: {
          '0%': { filter: "blur(4px)" },
          '100%': { filter: "blur(0px)" },
        }
      },
      animation: {
        blur: 'blur 0.5s ease-in forwards',
        unblur: 'unblur 0.25s ease-out forwards',
      }
    },
  },
  // eslint-disable-next-line no-undef
  plugins: [require('daisyui')],
  daisyui: {
    themes: ["night"]
  }
}
