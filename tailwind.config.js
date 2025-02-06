/** @type {import('tailwindcss').Config} */

import colors from './src/colors'

module.exports = {
  content: [],
  theme: {
    extend: {
      fontFamily: {
        inter : ['Inter', 'sans-serif'],
      },
      colors: colors
    },
  },
  plugins: [],
}

