import path from 'path';
import webpack from 'webpack';
import { Env } from './webpack.d';

const resolveApp = (...rest) => path.resolve(__dirname, ...rest);

const config = (env: Env): webpack.Configuration => {
  const isProd = env === 'production';

  const entry = resolveApp('client', 'index.tsx');
  const output = {
    filename: 'main.js',
    path: resolveApp('build', 'client'),
  };

  return {
    mode: isProd ? 'production' : 'development',
    entry,
    output,
  };
};

export default config;
