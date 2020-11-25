const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require('tailwindcss/colors')

module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  theme: {
    colors: {
      ...defaultTheme.colors,
      gray: colors.blueGray,
    },
    extend: {},
  },
  variants: {},
  plugins: [],
}
