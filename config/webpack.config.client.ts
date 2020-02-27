import webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ManifestPlugin from 'webpack-manifest-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import paths from './paths';
import { Env } from './types/webpack';

const TYPE = 'client';

const config = (env: Env): webpack.Configuration => {
  const isProd = env === 'production';

  return {
    target: 'web',
    mode: isProd ? 'production' : 'development',
    devtool: isProd ? 'source-map' : 'cheap-module-source-map',
    entry: {
      app: paths.appIndex(TYPE),
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin(
        Object.assign(
          {},
          {
            inject: true,
            template: paths.appHtml,
          },
          !isProd
            ? {
                minify: {
                  removeComments: true,
                  collapseWhitespace: true,
                  removeRedundantAttributes: true,
                  useShortDoctype: true,
                  removeEmptyAttributes: true,
                  removeStyleLinkTypeAttributes: true,
                  keepClosingSlash: true,
                  minifyJS: true,
                  minifyCSS: true,
                  minifyURLs: true,
                },
              }
            : undefined,
        ),
      ),
      // https://github.com/danethurber/webpack-manifest-plugin
      new ManifestPlugin({
        fileName: 'asset-manifest.json',
        publicPath: paths.appPublicPath,
      }),
    ],
    module: {
      rules: [
        {
          oneOf: [
            {
              test: /\.(ts|tsx)$/,
              loader: 'babel-loader',
              exclude: paths.appNodeModules,
            },
            {
              test: /\.css&/,
              use: ['style-loader', 'css-loader'],
            },
            {
              test: /\.(png|svg|jpe|gif)$/,
              use: ['file-loader'],
            },
          ],
        },
      ],
    },
    resolve: {
      enforceExtension: false,
      extensions: ['.tsx', '.ts'],
      alias: {
        '~client': paths.appPath(TYPE),
      },
    },
    output: {
      filename: 'static/js/[name].js',
      path: paths.appBuild(TYPE),
      publicPath: paths.appPublicPath,
    },
    externals: [nodeExternals()],
  };
};

export default config;
