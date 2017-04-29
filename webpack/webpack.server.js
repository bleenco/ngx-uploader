const { root } = require('./helpers');
const { AotPlugin } = require('@ngtools/webpack');

module.exports = {
  entry: root('./src/main.server.ts'),
  output: {
    filename: 'server.js'
  },
  target: 'node'
};
