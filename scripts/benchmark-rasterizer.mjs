// Optional local A/B measurement against a Git revision. No timing CI gate.
// node scripts/benchmark-rasterizer.mjs e58442a
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ref = process.argv[2];
if (!ref || !/^[a-zA-Z0-9_./~-]+$/.test(ref) || ref.startsWith('-')) throw new Error('Pass a baseline Git revision.');
const relative = `src/modules/media/.benchmark-${process.pid}.js`;
const baselineFile = path.join(root, relative);
const baseline = execFileSync('git', ['show', `${ref}:src/modules/media/rasterizer.js`], { cwd: root, encoding: 'utf8' });
fs.writeFileSync(baselineFile, baseline);
let browser;
const server = http.createServer((req, res) => {
  if (req.url === '/') { res.setHeader('Content-Type', 'text/html'); res.end('<!doctype html><body></body>'); return; }
  const file = path.resolve(root, '.' + req.url.split('?')[0]);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
  res.setHeader('Content-Type', 'text/javascript');
  fs.createReadStream(file).pipe(res);
});
try {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const engine = process.env.KT_BROWSER || 'chromium';
  browser = await ({ chromium, firefox, webkit }[engine]).launch({
    ...(engine === 'chromium' && process.env.KT_CHROME ? { executablePath: process.env.KT_CHROME } : {})
  });
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  const results = await page.evaluate(async (baselinePath) => {
    const before = await import('/' + baselinePath);
    const after = await import('/src/modules/media/rasterizer.js');
    const source = document.createElement('canvas');
    source.width = 640; source.height = 360;
    const ctx = source.getContext('2d');
    const pixels = ctx.createImageData(640, 360);
    for (let i = 0; i < pixels.data.length; i += 1) pixels.data[i] = i % 4 === 3 ? 255 : (i * 73 + Math.floor(i / 13) * 41) % 256;
    ctx.putImageData(pixels, 0, 0);
    const median = (values) => values.sort((a, b) => a - b)[Math.floor(values.length / 2)];
    const cases = [
      ['ordered', 'dither', { type: '8x8' }],
      ['floyd-rgb', 'dither', { type: 'floyd-steinberg', originalColors: true }],
      ['atkinson', 'dither', { type: 'atkinson' }],
      ['halftone', 'halftone', {}],
      ['ascii', 'ascii', {}]
    ];
    const results = [];
    for (const [name, style, opts] of cases) {
      const make = (module) => {
        const canvas = document.createElement('canvas');
        const renderer = module.createStylizedRenderer(canvas, module.resolveStyleConfig(style, { ...opts, seed: 7, colorSteps: 4 }));
        renderer.sync(640, 360);
        return { renderer, canvas };
      };
      const old = make(before); const next = make(after);
      const run = (item) => {
        const start = globalThis.performance.now();
        for (let i = 0; i < 20; i += 1) item.renderer.render(source, 3, { time: i * 100 });
        return (globalThis.performance.now() - start) / 20;
      };
      run(old); run(next);
      const oldTimes = []; const nextTimes = [];
      for (let trial = 0; trial < 7; trial += 1) {
        if (trial % 2) { nextTimes.push(run(next)); oldTimes.push(run(old)); }
        else { oldTimes.push(run(old)); nextTimes.push(run(next)); }
      }
      const read = (item) => item.canvas.getContext('2d').getImageData(0, 0, 640, 360).data;
      const a = read(old); const b = read(next);
      let differences = 0;
      for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) differences += 1;
      results.push({ name, baselineMs: +median(oldTimes).toFixed(3), currentMs: +median(nextTimes).toFixed(3), changedChannels: differences });
      old.renderer.destroy(); next.renderer.destroy();
    }
    return results;
  }, relative);
  for (const result of results) assert.equal(result.changedChannels, 0, `${result.name} pixel parity`);
  console.log(JSON.stringify({ engine, baseline: ref, width: 640, height: 360, cellSize: 3, trials: 7, framesPerTrial: 20, results }, null, 2));
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(baselineFile, { force: true });
}
