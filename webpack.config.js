const ngtools = require('@ngtools/webpack');
const webpackMerge = require('webpack-merge');
const commonPartial = require('./webpack/webpack.common');
const clientPartial = require('./webpack/webpack.client');
const serverPartial = require('./webpack/webpack.server');
const prodPartial = require('./webpack/webpack.prod');
const devPartial = require('./webpack/webpack.dev');
const { getAotPlugin } = require('./webpack/webpack.aot');
const { root } = require('./webpack/helpers');
const { getDevStylesConfig, getProdStylesConfig } = require('./webpack/webpack.style');
const portfinder = require('portfinder');

module.exports = function (options, webpackOptions) {
  options = options || {};

  if (options.aot) {
    console.log(`Running build for ${options.client ? 'client' : 'server'} with AoT compilation...`)
  }

  const serverConfig = webpackMerge({}, commonPartial, serverPartial, {
    entry: options.aot ? './src/main.server.aot.ts' : serverPartial.entry,
    plugins: [
      getAotPlugin('server', !!options.aot)
    ]
  }, getProdStylesConfig());

  let clientConfig = webpackMerge({}, commonPartial, clientPartial, {
    plugins: [
      getAotPlugin('client', !!options.aot)
    ]
  }, options.dev ? getDevStylesConfig() : getProdStylesConfig());

  if (webpackOptions.p) {
    clientConfig = webpackMerge({}, clientConfig, prodPartial);
  }

  let config;

  if (options.client) {
    config = clientConfig;
  } else if (options.server) {
    config = serverConfig;
  }

  if (options.serve) {
    if (!options.aot) {
      config.module.rules.shift();
      config = webpackMerge({}, config, devPartial);
    }

    return portfinder.getPortPromise().then(port => {
      config.devServer.port = port;
      return config;
    });
  } else {
    return Promise.resolve(config);
  }
}
