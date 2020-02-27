import webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';
import paths from './paths';
import { Env } from './webpack.d';

const config = (env: Env): webpack.Configuration => {
  const isProd = env === 'production';

  return {
    mode: isProd ? 'production' : 'development',
    entry: paths.appClientIndex,
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          loader: 'babel-loader',
          exclude: paths.appNodeModules,
        },
      ],
    },
    resolve: {
      enforceExtension: false,
      extensions: ['.tsx', '.ts'],
      alias: {
        '~client': paths.appClient,
      },
    },
    output: {
      filename: 'main.js',
      path: paths.appClientBuild,
    },
    externals: [nodeExternals()],
  };
};

export default config;
