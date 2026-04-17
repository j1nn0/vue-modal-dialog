import { URL, fileURLToPath } from 'node:url';

import banner from 'vite-plugin-banner';
import dts from 'vite-plugin-dts';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import pkg from './package.json';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

const bannerText = `/*!
* ${pkg.name} v${pkg.version}
* (c) 2025-present ${pkg.author}
* @license ${pkg.license}
*/`;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    eslint({
      failOnWarning: true,
      include: ['src/**/*.{ts,vue}'],
    }),
    vue(),
    dts({
      tsconfigPath: './tsconfig.build.json',
      rollupTypes: true,
    }),
    banner(bannerText),
    vueDevTools(),
  ],
  publicDir: false,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'J1nn0VueModalDialog',
      formats: ['es', 'umd'],
      fileName: (format) => `vue-modal-dialog.${format}.js`,
    },
    rollupOptions: {
      external: ['vue', '@vueuse/core', '@vueuse/integrations', 'focus-trap'], // 外部依存
      output: {
        globals: {
          vue: 'Vue',
          '@vueuse/core': 'VueUse',
          '@vueuse/integrations': 'VueUseIntegrations',
          'focus-trap': 'focusTrap',
        },
      },
    },
  },
  server: {
    host: '127.0.0.1',
  },
});
