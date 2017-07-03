const { resolve } = require('path');
const AoTPlugin = require('@ngtools/webpack').AotPlugin;
const webpackMerge = require('webpack-merge');
const compression = require('compression-webpack-plugin');
const html = require('html-webpack-plugin');
const copy = require('copy-webpack-plugin');
const extract = require('extract-text-webpack-plugin');
const portfinder = require('portfinder');

module.exports = function (options, webpackOptions) {
  options = options || {};

  let config = {};

  config = webpackMerge({}, config, {
    entry: getEntry(options),
    resolve: { extensions: ['.ts', '.js', '.json'] },
    output: {
      path: root('dist')
    },
    module: {
      rules: [
        { test: /\.html$/, loader: 'raw-loader' },
        { test: /\.json$/, loader: 'json-loader' },
        { test: /\.(jp?g|png|gif)$/, loader: 'file-loader', options: { hash: 'sha512', digest: 'hex', name: 'images/[hash].[ext]' } },
        { test: /\.(eot|woff2?|svg|ttf|otf)([\?]?.*)$/, loader: 'file-loader', options: { hash: 'sha512', digest: 'hex', name: 'fonts/[hash].[ext]' } }
      ]
    },
    plugins: [
      new copy([{ context: './src/assets/public', from: '**/*' }])
    ]
  });

  config = webpackMerge({}, config, {
    output: {
      filename: 'js/app.js'
    },
    target: 'web',
    plugins: [
      new html({ template: root('src/index.html'), output: root('dist') })
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
  });

  if (webpackOptions.p) {
    config = webpackMerge({}, config, getProductionPlugins());
    config = webpackMerge({}, config, getProdStylesConfig());
  } else {
    config = webpackMerge({}, config, getDevStylesConfig());
  }

  if (options.aot) {
    console.log(`Running build for with AoT compilation...`)

    config = webpackMerge({}, config, {
      module: {
        rules: [{ test: /\.ts$/, loader: '@ngtools/webpack' }]
      },
      plugins: [
        new AoTPlugin({ tsConfigPath: root('src/tsconfig.json') })
      ]
    });
  } else {
    config = webpackMerge({}, config, {
      module: {
        rules: [{ test: /\.ts$/, loader: '@ngtools/webpack' }]
      },
      plugins: [
        new AoTPlugin({
          tsConfigPath: root('src/tsconfig.json'),
          skipCodeGeneration: true
        })
      ]
    });
  }

  if (options.serve) {
    return portfinder.getPortPromise().then(port => {
      config.devServer.port = port;
      return config;
    });
  } else {
    return Promise.resolve(config);
  }
}

function root(path) {
  return resolve(__dirname, path);
}

function getEntry(options) {
  if (options.aot) {
    return { app: root('src/main.aot.ts') };
  } else {
    return { app: root('src/main.ts') };
  }
}

function getProductionPlugins() {
  return {
    plugins: [
      new compression({ asset: "[path].gz[query]", algorithm: "gzip", test: /\.js$|\.html$/, threshold: 10240, minRatio: 0.8 })
    ]
  }
}

function getDevStylesConfig() {
  return {
    module: {
      rules: [
        { test: /\.css$/, use: ['style-loader', 'css-loader'], exclude: [root('src')] },
        { test: /\.css$/, use: ['to-string-loader', 'css-loader'], exclude: [root('src/styles')] },
        { test: /\.scss$|\.sass$/, use: ['style-loader', 'css-loader', 'sass-loader'], include: [root('src/styles') ] },
        { test: /\.scss$|\.sass$/, use: ['to-string-loader', 'css-loader', 'sass-loader'], exclude: [root('src/styles')] },
      ]
    }
  };
}

function getProdStylesConfig() {
  return {
    plugins: [
      new extract('css/[name].css')
    ],
    module: {
      rules: [
        { test: /\.css$/, use: extract.extract({ fallback: 'style-loader', use: 'css-loader' }), include: [root('src/styles')] },
        { test: /\.css$/, use: ['to-string-loader', 'css-loader'], exclude: [root('src/styles')] },
        { test: /\.scss$|\.sass$/, loader: extract.extract({ fallback: 'style-loader', use: ['css-loader', 'sass-loader'] }), exclude: [root('src/app')] },
        { test: /\.scss$|\.sass$/, use: ['to-string-loader', 'css-loader', 'sass-loader'], exclude: [root('src/styles')] },
      ]
    }
  };
}
