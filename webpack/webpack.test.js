const { root } = require('./helpers');

module.exports = function (options) {
  return {
    devtool: 'inline-source-map',
    resolve: {
      extensions: ['.ts', '.js']
    },
    module: {
      rules: [
        { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader', exclude: [ root('node_modules/rxjs'), root('node_modules/@angular') ] },
        { test: /\.ts$/, use: [ { loader: 'awesome-typescript-loader', options: { configFileName: 'src/tsconfig.browser.json', module: 'commonjs' } }, { loader: 'angular2-template-loader' } ], exclude: [/\.aot\.ts$/] },
        { test: /\.json$/, loader: 'json-loader', exclude: [root('src/index.html')] },
        { test: /\.css$/, loader: ['to-string-loader', 'css-loader'], exclude: [root('src/index.html')] },
        { test: /\.scss$|\.sass$/, loader: ['raw-loader', 'sass-loader'], exclude: [root('src/index.html')] },
        { test: /\.html$/, loader: 'raw-loader', exclude: [root('src/index.html')] }
      ]
    },
    performance: { hints: false },
    node: {
      global: true,
      process: false,
      crypto: 'empty',
      module: false,
      clearImmediate: false,
      setImmediate: false
    }
  };
}
