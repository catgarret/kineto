// Pixel fingerprint of the pre-optimization rasterizer on deterministic samples.
// Unlike screenshots these tests exercise rounding and error carry exactly.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createStylizedRenderer, DITHER_TYPES, resolveStyleConfig } from '../src/modules/media/rasterizer.js';
const digest = createHash('sha256');
let outputAllocations = 0;
let errorAllocations = 0;
let largestErrorBuffer = 0;
const NativeFloat32Array = globalThis.Float32Array;
globalThis.Float32Array = class extends NativeFloat32Array {
  constructor(size) { super(size); errorAllocations += 1; largestErrorBuffer = Math.max(largestErrorBuffer, size); }
};
const context = {
  setTransform() {}, clearRect() {}, drawImage() {}, save() {}, restore() {}, beginPath() {}, arc() {}, clip() {},
  getImageData(_x, _y, width, height) {
    const data = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < data.length; i += 1) data[i] = (i * 73 + Math.floor(i / 13) * 41) % 256;
    return { data, width, height };
  },
  createImageData(width, height) {
    outputAllocations += 1;
    return { data: new Uint8ClampedArray(width * height * 4), width, height };
  },
  putImageData(image) { digest.update(image.data); }
};
const canvas = () => ({ width: 0, height: 0, getContext: () => context });
globalThis.document = { createElement: canvas };
globalThis.window = { devicePixelRatio: 1 };
let renders = 0;
try {
  for (const type of DITHER_TYPES) {
    for (const originalColors of [false, true]) {
      for (const motion of ['none', 'drift', 'shuffle', 'scan', 'flow', 'pulse']) {
        // Avoid colour parsing mocks; supply the resolved palette explicitly.
        const config = resolveStyleConfig('dither', { type, originalColors, motion, colorSteps: 4, seed: 7 });
        Object.assign(config, { paper: [247, 232, 210], ink: [14, 27, 43], accent: [210, 74, 38] });
        const renderer = createStylizedRenderer(canvas(), config);
        for (const [width, height] of [[31, 23], [1, 1], [19, 37]]) {
          renderer.sync(width, height);
          for (const time of [0, 100, 200]) {
            assert.equal(renderer.render({ width: 80, height: 60 }, 3, { time }), true);
            renders += 1;
          }
        }
        renderer.configure({ pointer: 'lens', pointerCellSize: 1 });
        renderer.render({ width: 80, height: 60 }, 3, { time: 300, pointer: { active: true, x: 4, y: 5 } });
        renders += 1;
        renderer.destroy();
      }
    }
  }
  const hash = digest.digest('hex');
  console.log({ renders, hash, outputAllocations, errorAllocations, largestErrorBuffer });
  assert.equal(hash, '74d8472cb66080b5f4e3021e9607e77ea64634afc71eb31d4c7e636c5388f28c',
    'all dither patterns, motion, colours, resize and lens pixels must match the original renderer');
  assert.equal(outputAllocations, 0, 'dither must reuse its sampled RGBA buffer');
  assert.ok(errorAllocations < 264, 'steady-size frames must reuse diffusion storage');
  assert.ok(largestErrorBuffer <= 19 * 3 * 3, 'error storage must be bounded by width × 3 rows × RGB');
} finally {
  globalThis.Float32Array = NativeFloat32Array;
  delete globalThis.document;
  delete globalThis.window;
}
