const purgecss = [
  '@fullhuman/postcss-purgecss',
  {
    content: [
      './components/**/*.{js,jsx,ts,tsx}',
      './pages/**/*.{js,jsx,ts,tsx}',
    ],
    defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
  },
]

module.exports = {
  plugins: [
    'postcss-flexbugs-fixes',
    'postcss-import',
    'tailwindcss',
    [
      'postcss-preset-env',
      {
        autoprefixer: {
          flexbox: 'no-2009',
        },
        stage: 3,
        features: {
          'nesting-rules': true,
          'custom-properties': false,
        },
      },
    ],
    ...(process.env.NODE_ENV === 'production' ? [purgecss] : []),
  ],
}
