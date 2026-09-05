import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: { preserveSymlinks: true },
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    outDir: 'dist-iife',
    emptyOutDir: false,
    lib: {
      entry: resolve(import.meta.dirname, 'src/hydration.jsx'),
      name: 'KinetoHydrationQA',
      formats: ['iife'],
      fileName: () => 'hydration-qa.js'
    }
  }
});
