const path = require('path');
const root = path.resolve(__dirname);
const webpack = require('webpack');
const ProvidePlugin = require('webpack/lib/ProvidePlugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');

module.exports = {
  resolve: { extensions: ['.ts', '.js'] },
  entry: path.join(root, 'ngx-uploader.ts'),
  output: {
    path: path.join(root, 'bundles'),
    publicPath: '/',
    filename: 'ngx-uploader.umd.js',
    libraryTarget: 'umd',
    library: 'ngx-uploader'
  },
  externals: [/^\@angular\//, /^rxjs\//],
  module: {
    rules: [
      { test: /\.ts$/, use: [ { loader: 'awesome-typescript-loader', options: { configFileName: 'src/tsconfig.browser.json' } }, { loader: 'angular2-template-loader' } ], exclude: [/\.aot\.ts$/] }
    ]
  }
};
