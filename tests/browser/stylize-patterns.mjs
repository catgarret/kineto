// Stylize pattern + motion matrix, in a real browser against the built runtime.
//
// 두 가지를 지킵니다.
//
//  1. **공개된 패턴은 서로 다른 그림이다.** ditherType 9개와 halftoneShape 7개, 그리고
//     halftoneAngle 은 이름만 다른 값이 아니라 캔버스에 다른 픽셀을 남겨야 합니다.
//     variant-distinctness 가 variant 에 대해 하는 일을, 옵션 값에 대해 합니다.
//  2. **모든 motion 이 모든 룩에서 실제로 움직인다.** 이것이 이 파일이 생긴 이유입니다 —
//     `drift` 는 정렬 행렬을 밀어서 움직이는데, 행렬이 없는 룩(오차 확산·noise 디더,
//     halftone)에서는 아무 일도 일어나지 않아 "옵션이 동작하지 않는다"로 보였습니다.
//     이제 행렬이 없는 룩에는 이동하는 톤 파동이 들어갑니다.
//
// 실행: node tests/browser/stylize-patterns.mjs   (KT_BROWSER=firefox|webkit 로 엔진 선택)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const browserName = process.env.KT_BROWSER || 'chromium';
const browserType = { chromium, firefox, webkit }[browserName] || chromium;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png' };
const FIXTURE_PATH = '/__stylize-patterns__.html';
const fixtureHtml = () => '<!doctype html><html><head><link rel="stylesheet" href="/dist/kineto.css">'
  + '<style>body{margin:0;background:#101318}.cell{width:200px;height:150px;display:inline-block;margin:4px}'
  + '.cell img{width:100%;height:100%;object-fit:cover}</style></head>'
  + '<body><main></main><script src="/dist/kineto.umd.js"></script></body></html>';

const server = http.createServer((request, response) => {
  const url = request.url.split('?')[0];
  if (url === FIXTURE_PATH) {
    response.writeHead(200, { 'content-type': 'text/html' });
    response.end(fixtureHtml());
    return;
  }
  const file = path.join(root, url);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    response.writeHead(404);
    response.end();
    return;
  }
  response.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(response);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const launchOptions = { args: browserName === 'chromium' ? ['--no-sandbox', '--disable-dev-shm-usage'] : [] };
if (process.env.KT_CHROME && browserName === 'chromium') launchOptions.executablePath = process.env.KT_CHROME;
const browser = await browserType.launch(launchOptions);

try {
  const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${origin}${FIXTURE_PATH}`, { waitUntil: 'load' });
  await page.waitForFunction(() => Boolean(window.Kineto));

  const result = await page.evaluate(async () => {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const main = document.querySelector('main');
    const canvasOf = (media) => media.closest('.kt-stylize-wrap, .kt-lazy-wrap')?.querySelector('.kt-stylize-stylized-canvas') || null;
    // 모든 픽셀을 훑습니다. 듬성듬성 뽑으면 ASCII 글리프가 한 칸 바뀌는 변화를 놓칩니다.
    const readCanvas = (canvas) => canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    const fingerprint = (data) => {
      let hash = 0;
      for (let index = 0; index < data.length; index += 4) hash = (hash * 33 + data[index]) >>> 0;
      return hash;
    };
    const changedPixels = (a, b) => {
      let changed = 0;
      for (let index = 0; index < a.length; index += 4) if (a[index] !== b[index]) changed += 1;
      return changed;
    };

    const mount = async (options) => {
      const cell = document.createElement('div');
      cell.className = 'cell';
      const media = document.createElement('img');
      media.src = './demo/assets/gallery-03.webp';
      cell.appendChild(media);
      main.appendChild(cell);
      await media.decode().catch(() => {});
      const instance = window.Kineto.create('stylize', media, { mode: 'persist', cellSize: 4, contrast: 1.3, seed: 7, ...options });
      await wait(120);
      return { media, instance, cell };
    };
    const teardown = ({ instance, cell }) => { instance?.destroy?.(); cell.remove(); };

    const patterns = {};
    const missing = [];
    const record = async (key, options) => {
      const mounted = await mount(options);
      const canvas = canvasOf(mounted.media);
      if (!canvas) { missing.push(key); teardown(mounted); return; }
      patterns[key] = fingerprint(readCanvas(canvas));
      teardown(mounted);
    };

    const ditherTypes = ['2x2', '4x4', '8x8', '16x16', 'cluster', 'noise', 'random', 'floyd-steinberg', 'atkinson'];
    for (const ditherType of ditherTypes) await record(`dither:${ditherType}`, { preset: 'dither', ditherType });
    const halftoneShapes = ['dot', 'square', 'line', 'cross', 'diamond', 'ring', 'triangle'];
    for (const shape of halftoneShapes) await record(`halftone:${shape}`, { preset: 'halftone', cellSize: 7, halftoneShape: shape });
    for (const angle of [0, 30, 45]) await record(`angle:${angle}`, { preset: 'halftone', cellSize: 7, halftoneShape: 'dot', halftoneAngle: angle });

    // motion 행렬: 룩 × motion. `none` 만 정지여야 하고 나머지는 전부 움직여야 합니다.
    const motion = {};
    const looks = [
      ['dither-ordered', { preset: 'dither', ditherType: '8x8' }],
      ['dither-noise', { preset: 'dither', ditherType: 'noise' }],
      ['dither-diffusion', { preset: 'dither', ditherType: 'floyd-steinberg' }],
      ['ascii', { preset: 'ascii', cellSize: 8 }],
      ['halftone', { preset: 'halftone', cellSize: 7 }],
      ['halftone-angled', { preset: 'halftone', cellSize: 7, halftoneAngle: 30 }]
    ];
    for (const [label, base] of looks) {
      for (const type of ['none', 'drift', 'shuffle', 'scan', 'flow', 'pulse']) {
        const mounted = await mount({ ...base, motion: type, motionSpeed: 1.6, motionAmount: 0.8, renderFps: 60 });
        const canvas = canvasOf(mounted.media);
        if (!canvas) { motion[`${label}:${type}`] = -1; teardown(mounted); continue; }
        const before = readCanvas(canvas).slice();
        await wait(650);
        motion[`${label}:${type}`] = changedPixels(before, readCanvas(canvas));
        teardown(mounted);
      }
    }
    return { patterns, missing, motion };
  });

  assert.deepEqual(errors, [], 'stylize patterns must not raise page errors');
  assert.deepEqual(result.missing, [], `every pattern must paint a canvas; missing: ${result.missing.join(', ')}`);

  // 1. 같은 갈래 안에서 이름이 다르면 그림도 달라야 합니다. 갈래를 넘어선 비교는 하지
  //    않습니다 — `angle:0` 은 정의상 `halftone:dot` 의 기본값과 같은 그림입니다.
  const fingerprints = Object.entries(result.patterns);
  for (const family of ['dither', 'halftone', 'angle']) {
    const members = fingerprints.filter(([key]) => key.startsWith(`${family}:`));
    const seen = new Map();
    for (const [key, value] of members) {
      const twin = seen.get(value);
      assert.ok(twin === undefined, `${key} draws exactly the same pixels as ${twin} — one of them is a name without a mechanism`);
      seen.set(value, key);
    }
  }
  assert.equal(fingerprints.length, 9 + 7 + 3, 'every declared dither type, halftone shape and sampled angle must be measured');

  // 2. motion 은 모든 룩에서 실제로 움직여야 하고, `none` 은 멈춰 있어야 합니다.
  const stuck = [];
  const restless = [];
  for (const [key, changed] of Object.entries(result.motion)) {
    assert.notEqual(changed, -1, `${key} did not paint a canvas`);
    const [, type] = key.split(':');
    if (type === 'none') { if (changed > 0) restless.push(`${key} (${changed}px)`); continue; }
    if (changed <= 0) stuck.push(key);
  }
  assert.deepEqual(stuck, [], `these motions paint the same frame forever: ${stuck.join(', ')}`);
  assert.deepEqual(restless, [], `motion "none" must hold still: ${restless.join(', ')}`);

  const moved = Object.entries(result.motion).filter(([key]) => !key.endsWith(':none')).length;
  console.log(`stylize-patterns OK (${browserName}) — ${fingerprints.length} distinct patterns (9 dither types, 7 halftone shapes, 3 screen angles); ${moved} look x motion pairs all animate and every "none" holds still.`);
} finally {
  await browser.close();
  server.close();
}
