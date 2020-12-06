const fs = require('fs')

require('dotenv').config({
  path: `.${process.env.NODE_ENV}.env`,
})

// Prefetch remote resources for emails
require('axios')
  .post(process.env.SEND_EMAIL_API_URL + '/prefetchRemoteResources', [
    {
      name: 'tailwindcss',
      url: 'https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css',
      rel: 'stylesheet',
    },
  ])
  .catch(_ =>
    console.warn(
      "WARNING: The API responsible of sending emails couldn't fetch remote resources.",
    ),
  )

// for transpiling all ESM @fullcalendar/* packages
// also, for piping fullcalendar thru babel (to learn why, see babel.config.js)
const withTM = require('next-transpile-modules')(['@fullcalendar'])

module.exports = withTM({
  env: {
    SITE_URL: process.env.SITE_URL,
    API_URL: process.env.API_URL,
    SEND_EMAIL_API_URL: process.env.SEND_EMAIL_API_URL,
    GOOGLE_CLIENT_ID:
      process.env.NODE_ENV === 'production'
        ? fs.readFileSync('/run/secrets/GOOGLE_CLIENT_ID').toString()
        : process.env.GOOGLE_CLIENT_ID,
  },
})
