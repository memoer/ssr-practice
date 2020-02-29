const fs = require('fs');
const dotenv = require('dotenv');
const paths = require('./paths');

// 1. ensure read paths
delete require.cache[require.resolve('./paths')];

// 2. check process.env.NODE_ENV
const { NODE_ENV } = process.env;
if (!NODE_ENV)
  throw new Error('The NODE_ENV environment variable isrequired but was not specified');

// 3. config dotenv File
const dotEnvFile = `${paths.dotenv}.${NODE_ENV}`;
// dotEnvFile이 존재한다면
if (fs.existsSync(dotEnvFile)) {
  // dotenv config!
  dotenv.config({
    path: dotEnvFile,
  });
}

// 4. filter dotenv variable names
const WEBPACK = /^WEBPACK_/i;

// 5. total function
const getEnvToBeUsedWebpack = publicUrl => {
  const raw = Object.keys(process.env)
    .filter(key => WEBPACK.test(key))
    .reduce(
      (env, key) => {
        env[key] = process.env[key];
        return env;
      },
      {
        NODE_ENV,
        PUBLIC_URL: publicUrl,
      },
    );
  const stringified = {
    'process.env': Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key]);
      return env;
    }, {}),
  };
  return { raw, stringified };
};

module.exports = getEnvToBeUsedWebpack;
