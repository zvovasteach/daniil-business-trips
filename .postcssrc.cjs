module.exports = (ctx) => ({
  syntax: 'postcss-scss',
  map: ctx.env === 'development' ? true : false,
  plugins: {
    'postcss-import': {},
    'cssnano': ctx.env === 'production' ? { preset: 'default' } : false,
    'autoprefixer': {},
    'postcss-preset-env': {},
  }
})
