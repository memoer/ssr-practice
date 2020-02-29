import webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import paths from './paths';

const TYPE = 'server';

const config = (env: 'development' | 'production'): webpack.Configuration => {
  const isProd = env === 'production';

  return {
    target: 'node',
    mode: isProd ? 'production' : 'development',
    entry: paths.appIndex(TYPE),
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
        '~server': paths.appPath(TYPE),
      },
    },
    output: {
      filename: 'render.js',
      path: paths.appBuild(TYPE),
    },
    externals: [nodeExternals()],
  };
};

export default config;
