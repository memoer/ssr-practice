import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ManifestPlugin from 'webpack-manifest-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import safePostCssParser from 'postcss-safe-parser';
import paths from './paths';
import devServerConfig from './webpackDevServer.config';
import getEnv from './env';

const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';
const TYPE = 'client';
const TS_REGEX = /\.(ts|tsx)$/;
const CSS_REGEX = /\.css$/;
const SASS_REGEX = /\.(scss|sass)$/;

const config = webpackEnv => {
  const isProd = webpackEnv === 'production';
  const env = getEnv(paths.publicPath);
  const getStyleLoaders = (importLoaders, preProcessor) => {
    const loaders = [
      isProd
        ? {
            loader: MiniCssExtractPlugin.loader,
          }
        : 'style-loader',
      {
        loader: 'css-loader',
        options: {
          importLoaders,
          sourceMap: isProd && shouldUseSourceMap,
        },
      },
    ];
    if (preProcessor) {
      loaders.push({
        loader: preProcessor,
        options: { sourceMap: true },
      });
    }
    return loaders;
  };
  const config: webpack.Configuration = {
    target: 'web',
    mode: webpackEnv,
    bail: isProd,
    devtool: isProd ? (shouldUseSourceMap ? 'source-map' : false) : 'cheap-module-source-map',
    entry: paths.appIndex(TYPE),
    output: {
      path: paths.appBuild(TYPE),
      pathinfo: !isProd,
      filename: isProd ? 'static/js/[name].[contenthash:8].js' : 'static/js/bundle.js',
      publicPath: paths.publicPath,
      globalObject: 'this',
    },
    optimization: {
      minimize: isProd,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            parse: { ecma: 8 },
            compress: { ecma: 8, warnings: false, comparisons: false, inline: 2 },
            mangle: {
              safari10: true,
            },
            output: {
              ecma: 5,
              comments: false,
              // eslint-disable-next-line @typescript-eslint/camelcase
              ascii_only: true,
            },
            sourceMap: shouldUseSourceMap,
          },
        }),
        new OptimizeCSSAssetsPlugin({
          cssProcessorOptions: {
            parser: safePostCssParser,
            map: shouldUseSourceMap
              ? {
                  inline: false,
                  annotation: true,
                }
              : false,
          },
          cssProcessorPluginOptions: {
            preset: ['default', { minifyFontValues: { removeQuotes: false } }],
          },
        }),
      ],
    },
    resolve: {
      modules: ['node_modules', paths.appNodeModules],
      enforceExtension: false,
      extensions: ['.tsx', '.ts', '.js'],
      alias: paths.webpackPaths,
    },
    module: {
      strictExportPresence: true,
      rules: [
        { parser: { requireEnsure: false } },
        {
          oneOf: [
            {
              test: TS_REGEX,
              loader: 'babel-loader',
              exclude: paths.appNodeModules,
              options: {
                cacheDirectory: true,
                cacheCompression: false,
                compact: isProd,
              },
            },
            {
              test: CSS_REGEX,
              use: getStyleLoaders(1),
              sideEffects: true,
            },
            {
              test: SASS_REGEX,
              use: getStyleLoaders(3, 'sass-loader'),
              sideEffects: true,
            },
            {
              loader: 'file-loader',
              exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
              options: {
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
          ],
        },
      ],
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
      new webpack.DefinePlugin(env.stringified),
      isProd &&
        new MiniCssExtractPlugin({
          // Options similar to the same options in webpackOptions.output
          // both options are optional
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
        }),
      !isProd && new webpack.HotModuleReplacementPlugin(),
      // https://github.com/danethurber/webpack-manifest-plugin
      new ManifestPlugin({
        fileName: 'asset-manifest.json',
        publicPath: paths.publicPath,
      }),
    ],
    node: {
      module: 'empty',
      dgram: 'empty',
      dns: 'mock',
      fs: 'empty',
      http2: 'empty',
      net: 'empty',
      tls: 'empty',
      // eslint-disable-next-line @typescript-eslint/camelcase
      child_process: 'empty',
    },
    externals: {
      react: 'React',
      'react-dom': 'ReactDOM',
    },
  };
  if (!isProd) return Object.assign(devServerConfig, config);
  return config;
};

export default config;
