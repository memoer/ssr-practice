const nodeExternals = require('webpack-node-externals');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const paths = require('./paths');

module.exports = env => ({
  target: 'node',
  mode: env,
  entry: paths.appServerIndex,
  plugins: [new CleanWebpackPlugin()],
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.(ts|tsx)$/,
            loader: 'babel-loader',
            exclude: paths.appNodeModules,
          },
        ],
      },
    ],
  },
  resolve: {
    enforceExtension: false,
    extensions: ['.tsx', '.ts'],
    alias: {
      '~server': paths.appServer,
    },
  },
  output: {
    filename: 'render.js',
    path: paths.appServerBuild,
  },
  externals: [nodeExternals()],
});
