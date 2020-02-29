'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';
// Makes the script crash on unhandled rejections instead of silently
process.on('unhandledRejection', err => {
  throw err;
});

require('../config/env');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const { checkBrowsers } = require('react-dev-utils/browsersHelper');
const chalk = require('react-dev-utils/chalk');
const clearConsole = require('react-dev-utils/clearConsole');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const {
  choosePort,
  createCompiler,
  prepareUrls,
  prepareProxy,
} = require('react-dev-utils/WebpackDevServerUtils');
const openBrowser = require('react-dev-utils/openBrowser');
const paths = require('../config/paths');
const { default: webpackConfig } = require('../config/webpack.config.client');
const { default: webpackDevServerConfig } = require('../config/webpackDevServer.config');

const isInteractive = process.stdout.isTTY;

if (!checkRequiredFiles([paths.appHtml, paths.appIndex('client'), paths.appIndex('server')]))
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
  // defaul port를 이용, 이미 이용하고 있을 경우 다른 port를 제안
  // `choosePort()` Promise resolves to the next free port.
  .then(() => choosePort(HOST, DEFAULT_PORT))
  .then(port => {
    if (port == null) return;
    const appName = require(paths.appPackageJson).name;
    const config = webpackConfig('development');
    const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
    const urls = prepareUrls(protocol, HOST, port);
    const devSocket = {
      warnings: warnings => devServer.sockWrite(devServer.sockets, 'warnings', warnings),
      errors: errors => devServer.sockWrite(devServer.sockets, 'errors', errors),
    };
    const compiler = createCompiler({
      appName,
      config,
      urls,
      useYarn: false,
      webpack,
      useTypeScript: true,
      devSocket,
    });
    const proxySetting = require(paths.appPackageJson).proxy;
    const proxyConfig = prepareProxy(proxySetting, paths.appPublic, paths.publicPath);
    const serverConfig = webpackDevServerConfig(proxyConfig, urls.lanUrlForConfig);

    const devServer = new WebpackDevServer(compiler, serverConfig);
    devServer.listen(port, HOST, err => {
      if (err) return console.log(err);
      if (isInteractive) clearConsole();
      if (process.env.NODE_PATH) {
        console.log(
          chalk.yellow(
            'Setting NODE_PATH to resolve modules absolutely has been deprecated in favor of setting baseUrl in jsconfig.json (or tsconfig.json if you are using TypeScript) and will be removed in a future major release of create-react-app.',
          ),
        );
        console.log();
      }

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
  .catch(err => (err && err.message ? console.log(err.message) : process.exit(1)));
