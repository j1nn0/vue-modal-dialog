/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}

declare module 'vite-plugin-eslint' {
  import type { ESLint } from 'eslint';
  import type { Plugin } from 'vite';

  type Options = ESLint.Options & {
    eslintPath?: string;
    lintOnStart?: boolean;
    include?: string | string[];
    exclude?: string | string[];
    formatter?: string | ESLint.Formatter['format'];
    emitWarning?: boolean;
    emitError?: boolean;
    failOnWarning?: boolean;
    failOnError?: boolean;
  };

  const eslintPlugin: (rawOptions?: Options) => Plugin;
  export { Options };
  export default eslintPlugin;
}
