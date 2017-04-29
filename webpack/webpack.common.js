const { root } = require('./helpers');
const copy = require('copy-webpack-plugin');

module.exports = {
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    path: root('dist')
  },
  module: {
    rules: [
      { test: /\.ts$/, loader: '@ngtools/webpack' },
      { test: /\.html$/, loader: 'raw-loader' },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.(jp?g|png|gif)$/, loader: 'file-loader', options: { hash: 'sha512', digest: 'hex', name: 'images/[hash].[ext]' } },
      { test: /\.(eot|woff2?|svg|ttf|otf)([\?]?.*)$/, loader: 'file-loader', options: { hash: 'sha512', digest: 'hex', name: 'fonts/[hash].[ext]' } }
    ]
  },
  plugins: [
    new copy([{ context: './public', from: '**/*' }])
  ],
  devServer: {
    historyApiFallback: true,
    port: 8000,
    open: true,
    hot: false,
    inline: true,
    stats: { colors: true, chunks: false },
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000
    }
  }
};
