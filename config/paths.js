const path = require('path');
const fs = require('fs');
const tsconfig = require('../tsconfig.json');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
const getPublicPath = publicPath => {
  if (!publicPath) return '/';
  if (!publicPath.endsWith('/')) throw new Error(`not publicPath endsWith "/" : ${publicPath}`);
  return publicPath;
};
const publicPath = getPublicPath(process.env.PUBLIC_URL);

//
const { paths: tsconfigPaths } = tsconfig.compilerOptions;
const webpackPaths = Object.keys(tsconfigPaths).reduce((paths, alias) => {
  // 경로에 /client/ 가 있을때에만
  const relativePath = tsconfigPaths[alias][0];
  const isClientPath = relativePath.includes('/client/');
  if (isClientPath) {
    paths[alias.slice(0, -2)] = path.resolve(resolveApp('.'), relativePath.slice(0, -1));
  }
  return paths;
}, {});

module.exports = {
  appNodeModules: resolveApp('node_modules'),
  appPackageJson: resolveApp('package.json'),
  dotenv: resolveApp('.env'),
  appPath: resolveApp('.'),
  appSrc: resolveApp('src'),
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.html'),
  appServer: resolveApp('src/server'),
  appServerIndex: resolveApp('src/server/index.ts'),
  appServerBuild: resolveApp('src/build/server'),
  appClient: resolveApp('client'),
  appClientIndex: resolveApp('src/client/index.tsx'),
  appClientBuild: resolveApp('src/build/client'),
  proxySetup: resolveApp('src/setupProxy.js'),
  yarnLockFile: resolveApp('yarn.lock'),
  appTsConfig: resolveApp('tsconfig.json'),
  publicPath,
  webpackPaths,
};
