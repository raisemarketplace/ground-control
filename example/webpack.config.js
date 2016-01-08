const path = require('path');

module.exports = {
  devtool: 'source-map',
  entry: path.join(__dirname, 'app.js'),
  output: {
    path: path.join(__dirname, '__build__'),
    filename: 'bundle.js',
    publicPath: '/__build__/',
  },
  resolve: {
    alias: {
      'async-redux': path.join(__dirname, '..', 'modules', 'AsyncRedux'),
    },
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel' },
      { test: /\.css$/, loader: 'style!css' },
    ],
  },
};
