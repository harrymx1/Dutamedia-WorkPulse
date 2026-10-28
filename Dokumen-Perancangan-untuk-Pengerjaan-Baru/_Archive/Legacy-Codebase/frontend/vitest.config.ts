import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import { fileURLToPath, URL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const testUtilsCjs = require.resolve('@vue/test-utils');
const testUtilsEsm = testUtilsCjs.replace('vue-test-utils.cjs.js', 'vue-test-utils.esm-bundler.mjs');

export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@vue/test-utils': testUtilsEsm,
      '@vue/compiler-dom': fileURLToPath(new URL('./node_modules/@vue/compiler-dom', import.meta.url)),
      '@vue/server-renderer': fileURLToPath(new URL('./node_modules/@vue/server-renderer', import.meta.url)),
      'vue': fileURLToPath(new URL('./node_modules/vue', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    root: './',
    include: ['tests/**/*.spec.ts'],
    exclude: ['**/tests/e2e/**', '**/node_modules/**', '**/dist/**'],
    server: {
      deps: {
        inline: ['vuetify', '@vue/test-utils'],
      },
    },
  },
});
