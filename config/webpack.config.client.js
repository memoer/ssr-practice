const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const safePostCssParser = require('postcss-safe-parser');

const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

const paths = require('./paths');
const getEnv = require('./env');

const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';

module.exports = webpackEnv => {
  const isProd = webpackEnv === 'production';
  const env = getEnv(paths.publicPath);
  const getStyleLoaders = (importLoaders, preProcessor) => {
    const loaders = [
      isProd ? MiniCssExtractPlugin.loader : 'style-loader',
      {
        loader: 'css-loader',
        options: {
          // css-loader 전에 적용할 loader 의 개수
          // 1일 경우 -> postcss-loader 만
          // 2일 경우 -> postcss-loader, sass-loader 2개만
          importLoaders,
          sourceMap: isProd && shouldUseSourceMap,
        },
      },
      // 'postcss-loader',
      // 'sass-loader'
    ];
    if (preProcessor) {
      loaders.push({
        loader: preProcessor,
        options: {
          sourceMap: true,
        },
      });
    }
    return loaders;
  };
  return {
    target: 'web',
    mode: webpackEnv,
    // Fail out on the first error instead of tolerating it.
    // 웹팩 에러가 났을 경우, 터미널에 출력( HMR 일 경우, 브라우저상에서도 출력)하지만, 번들은 계속 진행한다.
    // true 로 할 경우, force webpack to exit its bundling process
    bail: isProd,
    devtool: isProd ? (shouldUseSourceMap ? 'source-map' : false) : 'cheap-module-source-map',
    entry: [
      !isProd && require.resolve('react-dev-utils/webpackHotDevClient'),
      paths.appClientIndex,
    ].filter(Boolean),
    output: {
      path: isProd ? paths.appClientBuild : undefined,
      // Tells webpack to include comments in bundles with information about the contained modules
      // This option defaults to true in development and false in production mode respectively
      pathinfo: !isProd,
      filename: isProd ? 'static/js/[name].[contenthash:8].js' : 'static/js/bundle.js',
      // bundle된 assets들을 브라우저상에서 접근할 경로
      publicPath: paths.publicPath,
      devtoolModuleFilenameTemplate: isProd
        ? info => path.relative(paths.appClient, info.absoluteResourcePath).replace(/\\/g, '/')
        : info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
      globalObject: 'this',
    },
    optimization: {
      minimize: isProd,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            // We want terser to parse ecma 8 code.
            parse: { ecma: 8 },
            compress: { ecma: 8, warnings: false, comparisons: false, inline: 2 },
            mangle: {
              safari10: true,
            },
            // Added for profiling in devtools
            // keep_classnames: isEnvProductionProfile,
            // keep_fnames: isEnvProductionProfile,
            output: {
              ecma: 5,
              comments: false,
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
      // splitChunks: {
      //   chunks: 'all',
      //   name: false,
      // },
      // runtimeChunk: {
      //   name: entrypoint => `runtime-${entrypoint.name}`,
      // },
    },
    resolve: {
      modules: ['node_modules', paths.appNodeModules],
      enforceExtension: false,
      extensions: ['.tsx', '.ts', '.js'],
      alias: paths.webpackAlias,
      // Prevents users from importing files from outside of src/client/ (or node_modules/).
      plugins: [new ModuleScopePlugin(paths.appClient, [paths.appPackageJson])],
    },
    module: {
      strictExportPresence: true,
      rules: [
        // Disable require.ensure as it's not a standard language feature.
        { parser: { requireEnsure: false } },
        // First, run the linter.
        // It's important to do this before Babel processes the JS.
        {
          test: /\.(ts|tsx)$/,
          enforce: 'pre',
          use: [
            {
              options: {
                cache: true,
                formatter: require.resolve('react-dev-utils/eslintFormatter'),
                eslintPath: require.resolve('eslint'),
                resolvePluginsRelativeTo: __dirname,
              },
              loader: require.resolve('eslint-loader'),
            },
          ],
          include: paths.appClient,
        },
        {
          oneOf: [
            {
              test: /\.(ts|tsx)$/,
              include: paths.appClient,
              loader: require.resolve('babel-loader'),
              options: {
                cacheDirectory: true,
                cacheCompression: false,
                compact: isProd,
              },
            },
            {
              test: /\.css$/,
              use: getStyleLoaders(1),
              // Don't consider CSS imports dead code even if the
              // containing package claims to have no side effects.
              // 절대로 tree shaking 하지 말 것.
              sideEffects: true,
            },
            {
              test: /\.(scss|sass)$/,
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
      // Makes some environment variables available in index.html.
      // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
      // <link rel="icon" href="%PUBLIC_URL%/favicon.ico">
      new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
      // Makes some environment variables available to the JS code, for example:
      // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
      // It is absolutely essential that NODE_ENV is set to production
      // during a production build.
      // Otherwise React will be compiled in the very slow development mode.
      new webpack.DefinePlugin(env.stringified),
      // This is necessary to emit hot updates (currently CSS only):
      !isProd && new webpack.HotModuleReplacementPlugin(),
      isProd &&
        new MiniCssExtractPlugin({
          // Options similar to the same options in webpackOptions.output
          // both options are optional
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
        }),
      // https://github.com/danethurber/webpack-manifest-plugin
      new ManifestPlugin({
        fileName: 'asset-manifest.json',
        publicPath: paths.publicPath,
      }),
    ].filter(Boolean),
    node: {
      module: 'empty',
      dgram: 'empty',
      dns: 'mock',
      fs: 'empty',
      http2: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty',
    },
  };
};
