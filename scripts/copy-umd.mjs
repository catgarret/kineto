import { copyFile } from 'node:fs/promises';
await copyFile(new URL('../dist/kineto.umd.js', import.meta.url), new URL('../dist/kineto.umd.cjs', import.meta.url));
