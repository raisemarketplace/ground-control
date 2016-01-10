module.exports = {
  devtool: 'source-map',
  entry: `${__dirname}/client.js`,
  output: {
    path: `${__dirname}/__build__`,
    filename: 'bundle.js',
    publicPath: '/__build__/',
  },
  resolve: {
    modulesDirectories: ['web_modules', 'node_modules', `${__dirname}/..`],
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel' },
    ],
  },
};
