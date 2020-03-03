'use strict';

const fs = require('fs');
const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware');
const evalSourceMapMiddleware = require('react-dev-utils/evalSourceMapMiddleware');
const noopServiceWorkerMiddleware = require('react-dev-utils/noopServiceWorkerMiddleware');
const ignoredFiles = require('react-dev-utils/ignoredFiles');
const redirectServedPath = require('react-dev-utils/redirectServedPathMiddleware');
const paths = require('./paths');

const host = process.env.HOST || '0.0.0.0';
const sockHost = process.env.WDS_SOCKET_HOST;
const sockPath = process.env.WDS_SOCKET_PATH; // default: '/sockjs-node'
const sockPort = process.env.WDS_SOCKET_PORT;

module.exports = function(proxy, allowedHost) {
  return {
    disableHostCheck: !proxy || process.env.DANGEROUSLY_DISABLE_HOST_CHECK === 'true',
    // Enable gzip compression for everything served:
    compress: true,
    // generally not useful
    clientLogLevel: 'silent',
    // file path where public data is located Ex) ../public
    contentBase: paths.appPublic,
    // access browser path to public data     Ex) if "/assets/" -> http:localhost:3000/assets/...
    contentBasePublicPath: paths.publicPath,
    // dev-server watch the files served by the contentBase
    // default: false
    // if true, file changes will trigger a full page reload
    watchContentBase: true,
    // enable webpack's hot module replacement
    hot: true,
    // This allows to specify how browser or other client communicates with the devServer
    // default: sockjs -> but, 'ws' mode will become the default mode in the next major devServer version. < wepback-5 >
    transportMode: 'ws',
    // webpack client 파일들을 browser - sources들로 serve 할 것인지? -> notion 참고
    injectClient: false,
    // Tells clients connected to devServer to use provided socket host.
    sockHost,
    // The path at which to connect to the reloading socket.
    // react-dev-utils default : /sockjs-node ( webpack 이 기본으로 제공해주는 default path가 아님 )
    sockPath,
    // Tells clients connected to devServer to use provided socket port.
    sockPort,
    // access browser path to bundled files
    publicPath: paths.publicPath.slice(0, -1),
    quiet: true,
    watchOptions: {
      ignored: ignoredFiles(paths.appSrc),
    },
    host,
    overlay: false,
    // historyApiFallback: {
    // disableDotRule: true,
    // index: paths.publicUrlOrPath,
    // },
    // public: allowedHost,
    proxy,
    // before(app, server) {
    //   app.use(evalSourceMapMiddleware(server));
    //   app.use(errorOverlayMiddleware());
    //   if (fs.existsSync(paths.proxySetup)) {
    //     require(paths.proxySetup)(app);
    //   }
    // },
    // after(app) {
    //   app.use(redirectServedPath(paths.publicUrlOrPath));
    //   app.use(noopServiceWorkerMiddleware(paths.publicUrlOrPath));
    // },
  };
};
