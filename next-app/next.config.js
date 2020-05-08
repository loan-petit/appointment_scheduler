require('dotenv').config({
  path: `.${process.env.NODE_ENV}.env`,
})

module.exports = {
  env: {
    API_URL: process.env.API_URL,
  },
}
