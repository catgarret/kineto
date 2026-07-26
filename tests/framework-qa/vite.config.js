import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  resolve: { preserveSymlinks: true },
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    outDir: 'dist-iife',
    emptyOutDir: true,
    lib: {
      entry: resolve(import.meta.dirname, 'src/main.jsx'),
      name: 'KinetoFrameworkQA',
      formats: ['iife'],
      fileName: () => 'framework-qa.js'
    }
  }
});
