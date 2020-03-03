'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';
// Makes the script crash on unhandled rejections instead of silently
process.on('unhandledRejection', err => {
  throw err;
});

require('../config/env'); // process.env 설정
const webpack = require('webpack'); // wepback
const WebpackDevServer = require('webpack-dev-server'); // webpack-dev-server
const fs = require('fs'); // fs
const chalk = require('react-dev-utils/chalk'); // chalk
const clearConsole = require('react-dev-utils/clearConsole'); // 단순히 console clear
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles'); // 배열로 넘긴 path들이 실제로 존재하는지 -> 없으면 false
const openBrowser = require('react-dev-utils/openBrowser'); // 단순히 open browser
const paths = require('../config/paths'); // webpack dev server start 하는 데 필요한 path 들 -> 현재 app의 절대 경로, src/client의 절대 경로
const webpackClientConfig = require('../config/webpack.config.client'); // 기본적인 webpack config
const webpackDevServerConfig = require('../config/webpackDevServer.config'); // webpack dev server config
const { checkBrowsers } = require('react-dev-utils/browsersHelper'); // 모르겠음
const {
  choosePort, // port 선택 도움 -> 3000사용하고 있을 경우, 3001 제안 -> Promise로 사용한 port 반환
  createCompiler, // webpack config 를 통해 compiler 를 생성
  prepareUrls,
  prepareProxy, // proxy 설정
} = require('react-dev-utils/WebpackDevServerUtils');

const isInteractive = process.stdout.isTTY;

if (!checkRequiredFiles([paths.appHtml, paths.appClientIndex, paths.appServerIndex]))
  process.exit(1);

const DEFAULT_PORT = (process.env.PORT && parseInt(process.env.PORT, 10)) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

if (process.env.HOST) {
  console.log(
    chalk.cyan(
      `Attempting to bind to HOST environment variable: ${chalk.yellow(
        chalk.bold(process.env.HOST),
      )}`,
    ),
  );
  console.log(`If this was unintentional, check that you haven't mistakenly set it in your shell.`);
  console.log(`Learn more here: ${chalk.yellow('https://bit.ly/CRA-advanced-config')}`);
  console.log();
}

checkBrowsers(paths.appPath, isInteractive)
  .then(() => choosePort(HOST, DEFAULT_PORT))
  .then(port => {
    if (port == null) return;
    // package.json - name
    const appName = require(paths.appPackageJson).name;

    // wepback config
    const config = webpackClientConfig(process.env.NODE_ENV);

    // 'https' | 'http'
    const protocol = process.env.HTPPS === 'true' ? 'https' : 'http';

    // host가 있으면 해당 host로 url을 설정, 없으면 0.0.0.0||::으로 설정 -> host:port
    // terminal용 url -> 강조: chalk.bold, browser Url용 url -> 단순히 string
    // address.ip()를 통해 get PrivmateNetworkIp
    /**
       {
          lanUrlForConfig: '192.168.219.103',
          lanUrlForTerminal: 'http://192.168.219.103:\u001b[1m3000\u001b[22m',
          localUrlForTerminal: 'http://localhost:\u001b[1m3000\u001b[22m',
          localUrlForBrowser: 'http://localhost:3000'
        }
     */
    const urls = prepareUrls(protocol, HOST, port, paths.publicPath.slice(0, -1));

    // yarn-lock.json 파일 경로 -> 없으면 false
    const useYarn = fs.existsSync(paths.yarnLockFile);

    const devSocket = {
      warnings: warnings => devServer.sockWrite(devServer.sockets, 'warnings', warnings),
      errors: errors => devServer.sockWrite(devServer.sockets, 'errors', errors),
    };

    // tsconfig.json 파일 경로 -> 없으면 false
    const useTypeScript = fs.existsSync(paths.appTsConfig);

    const tscCompileOnError = process.env.TSC_COMPILE_ON_ERROR === 'true';

    const compiler = createCompiler({
      appName,
      config,
      urls,
      useYarn,
      webpack,
      devSocket,
      useTypeScript,
      tscCompileOnError,
    });

    // Ex) "http://localhost:3000"
    const proxySetting = require(paths.appPackageJson).proxy;

    // Ex) ("http://localhost:3000", process.cwd()+"/public", "/")
    /**
     * return object
      {
        target,
        logLevel: 'silent',
        context: function(pathname, req) {
          return (
            req.method !== 'GET' ||
            (mayProxy(pathname) &&
              req.headers.accept &&
              req.headers.accept.indexOf('text/html') === -1)
          );
        },
        onProxyReq: proxyReq => {
          if (proxyReq.getHeader('origin')) {
            proxyReq.setHeader('origin', target);
          }
        },
        onError: onProxyError(target),
        secure: false,
        changeOrigin: true,
        ws: true,
        xfwd: true,
      },
     */
    const proxyConfig = prepareProxy(proxySetting, paths.appPublic, paths.publicPath);

    const devServerConfig = webpackDevServerConfig(proxyConfig, urls.lanUrlForConfig);

    const devServer = new WebpackDevServer(compiler, devServerConfig);

    devServer.listen(port, HOST, err => {
      if (err) return console.error(err);
      if (isInteractive) clearConsole();
      console.log(chalk.cyan('Starting the development server...\n'));
      openBrowser(urls.localUrlForBrowser);
    });
    ['SIGINT', 'SIGTERM'].forEach(function(sig) {
      process.on(sig, function() {
        devServer.close();
        process.exit();
      });
    });
  })
  .catch(err => (err && err.message ? console.error(err.message) : process.exit(1)));
