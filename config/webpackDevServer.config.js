import fs from 'fs';
import paths from './paths';
import webpack from 'webpack';
import errorOverlayMiddleware from 'react-dev-utils/errorOverlayMiddleware';
import evalSourceMapMiddleware from 'react-dev-utils/evalSourceMapMiddleware';
import noopServiceWorkerMiddleware from 'react-dev-utils/noopServiceWorkerMiddleware';
import ignoredFiles from 'react-dev-utils/ignoredFiles';
import redirectServedPath from 'react-dev-utils/redirectServedPathMiddleware';
import WebpackDevServer from 'webpack-dev-server';

const host = process.env.HOST || '0.0.0.0';
const sockHost = process.env.WDS_SOCKET_HOST;
const sockPath = process.env.WDS_SOCKET_PATH; // default: '/sockjs-node'
const sockPort = process.env.WDS_SOCKET_PORT;
// https://webpack.js.org/configuration/dev-server/
export default (
  proxy: WebpackDevServer.ProxyConfigArray,
  allowedHost?: string,
): webpack.Configuration => ({
  devServer: {
    disableHostCheck: !proxy || process.env.DANGEROUSLY_DISABLE_HOST_CHECK === 'true',
    compress: true,
    clientLogLevel: 'none',
    // public assets
    contentBase: paths.appPublic,
    // public 내부에 존재하는 모든 assets들에 대한 접근 경로
    contentBasePublicPath: paths.publicPath,
    watchContentBase: true,
    hot: true,
    // transportMode: 'ws',
    injectClient: false,
    sockHost,
    sockPath,
    sockPort,
    // bundle된 assets들에 대한 접근 경로
    publicPath: paths.publicPath.slice(0, -1),
    quiet: true,
    watchOptions: {
      ignored: ignoredFiles(paths.appSrc),
    },
    host,
    // // Shows a full-screen overlay in the browser when there are compiler errors or warnings.
    overlay: false,
    historyApiFallback: {
      disableDotRule: true,
      index: paths.publicPath,
    },
    public: allowedHost,
    proxy,
    before: (app, server): void => {
      app.use(evalSourceMapMiddleware(server));
      app.use(errorOverlayMiddleware());

      if (fs.existsSync(paths.proxySetup)) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require(paths.proxySetup)(app);
      }
    },
    after: (app): void => {
      app.use(redirectServedPath(paths.publicPath));
      app.use(noopServiceWorkerMiddleware(paths.publicPath));
    },
  },
});
