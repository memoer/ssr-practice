import path from 'path';
const resolveApp = (relativePath: string): string => path.resolve(__dirname, '..', relativePath);

export default {
  dotenv: resolveApp('.env'),
  appHtml: resolveApp('public/index.html'),
  appPath: (type: 'client' | 'server'): string => resolveApp(`src/${type}`),
  appIndex: (type: 'client' | 'server'): string =>
    resolveApp(type === 'client' ? 'src/client/index.tsx' : 'src/server/index.ts'),
  appBuild: (type: 'client' | 'server'): string => resolveApp(`build/${type}`),
  appNodeModules: resolveApp('node_modules'),
  appPublicPath: '/',
};
