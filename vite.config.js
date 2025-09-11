import { URL, fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    eslint({
      failOnWarning: true,
      include: ['src/**/*.js', 'src/**/*.vue'],
    }),
  ],
  publicDir: false,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.js', import.meta.url)),
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
