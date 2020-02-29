declare namespace NodeJS {
  export interface Process {
    env: ProcessEnv;
  }
  export interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
    PORT?: string;
    PUBLIC_URL?: string;
    HTTPS?: 'true';
  }
}

declare module 'postcss-safe-parser';

// declare function myLib(a: string): string;
// interface MyLib {
//   name: string;
//   length: number;
//   extras?: string[];
// }

// declare module 'react-dev-utils/chalk';

// declare module 'react-dev-utils/browsersHelper' {
//   export function checkBrowsers(dir: string, isInteractive: boolean, retry?: boolean): any;
//   export function shouldSetBrowsers(isInteractive: boolean): Promise<boolean>;
// }
