import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(import.meta.dirname, 'src/umd.js'),
      name: 'Kineto',
      formats: ['umd'],
      fileName: () => 'kineto.umd.js',
      cssFileName: 'kineto'
    },
    rollupOptions: {
      output: {
        exports: 'default',
        assetFileNames: (assetInfo) => assetInfo.name === 'style.css' ? 'kineto.css' : '[name][extname]'
      }
    }
  }
});
