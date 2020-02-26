import path from 'path';
const resolveApp = (relativePath: string): string => path.resolve(__dirname, '..', relativePath);

export default {
  dotenv: resolveApp('.env'),
  appClient: resolveApp('src/client'),
  appClientBuild: resolveApp('build/client'),
  appClientIndex: resolveApp('src/client/index.tsx'),
  appNodeModules: resolveApp('node_modules'),
};
