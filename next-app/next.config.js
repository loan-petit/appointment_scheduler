require('dotenv').config({
  path: `.${process.env.NODE_ENV}.env`,
})

// Prefetch remote resources for emails
require('axios').post(
  process.env.SEND_EMAIL_API_URL + '/prefetchRemoteResources',
  [
    {
      name: 'tailwindcss',
      url: 'https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css',
      rel: 'stylesheet',
    },
  ],
)

module.exports = {
  env: {
    SITE_URL: process.env.SITE_URL,
    API_URL: process.env.API_URL,
    SEND_EMAIL_API_URL: process.env.SEND_EMAIL_API_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  },
}
