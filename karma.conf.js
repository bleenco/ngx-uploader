const path = require('path');

function root(p) {
  return path.resolve(__dirname, p);
}

process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = (config) => {
  const webpackConfig = {
    devtool: 'inline-source-map',
    resolve: {
      extensions: ['.ts', '.js']
    },
    module: {
      rules: [
        { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader', exclude: [ root('node_modules/rxjs'), root('node_modules/@angular') ] },
        { test: /\.ts$/, use: [ { loader: 'awesome-typescript-loader', options: { configFileName: 'src/tsconfig.spec.json' } }, { loader: 'angular2-template-loader' } ] },
        { test: /\.json$/, loader: 'json-loader' },
        { test: /\.css$/, loader: ['to-string-loader', 'css-loader'] },
        { test: /\.scss$|\.sass$/, loader: ['raw-loader', 'sass-loader'] },
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

  const configuration = {
    basePath: '.',
    frameworks: ['jasmine'],
    exclude: [],
    files: [
      { pattern: './src/test.ts', watched: false },
      { pattern: './src/assets/**/*', watched: false, included: false, served: true, nocache: false }
    ],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-webpack'),
      require('karma-spec-reporter')
    ],
    preprocessors: { './src/test.ts': ['webpack'] },
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true,
      stats: {
        errors: true,
        errorDetails: true,
        depth: false,
        chunkOrigins: false,
        chunkModules: false,
        chunks: false,
        children: false,
        cacheAssets: false,
        cached: false,
        assets: false,
        modules: false,
        hash: false,
        reasons: false,
        source: false,
        timings: false,
        version: false,
        warnings: false
      }
    },
    reporters: ['spec'],
    specReporter: {
      maxLogLines: 5,
      suppressErrorSummary: false,
      suppressFailed: false,
      suppressPassed: false,
      suppressSkipped: true,
      showSpecTiming: true
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_ERROR,
    autoWatch: false,
    browsers: ['ChromeHeadless'],
    mime: { 'text/x-typescript': ['ts', 'tsx'] },
    singleRun: true,
    concurrency: 1,
    browserNoActivityTimeout: 10000
  };

  config.set(configuration);
};
