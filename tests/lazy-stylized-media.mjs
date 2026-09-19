// Unit checks for the shared stylized-media rasterizer behind Lazy `dither`,
// `ascii` and `halftone` (src/modules/lazy/stylizedMedia.js).
//
// The browser suite (tests/browser/lazy-stylized.mjs) proves real pixels on
// three engines. This file pins the pure parts that do not need a browser:
// option normalisation and clamping, the threshold matrices, the cover-fit
// geometry, source measurement, colour parsing fallbacks, and the renderer's
// behaviour against a fake 2D context (no source size => no paint; a painted
// two-colour dither only ever uses paper and ink).
//
// Run: node tests/lazy-stylized-media.mjs
import assert from 'node:assert/strict';
import {
  DEFAULT_ASCII_CHARS,
  DITHER_MATRICES,
  DITHER_TYPES,
  HALFTONE_SHAPES,
  coverMap,
  createStylizedRenderer,
  parseColor,
  MOTION_TYPES,
  POINTER_TYPES,
  resolveStyleConfig,
  sourceSize
} from '../src/modules/media/rasterizer.js';

// 1. Threshold matrices are square, sized by name, and normalised to (0, 1).
for (const [name, matrix] of Object.entries(DITHER_MATRICES)) {
  const size = Number(name.split('x')[0]);
  assert.equal(matrix.length, size, `${name} must have ${size} rows`);
  const values = matrix.flat();
  assert.equal(values.length, size * size, `${name} must be square`);
  assert.ok(values.every((value) => value > 0 && value < 1), `${name} thresholds must sit strictly inside 0..1`);
  assert.equal(new Set(values).size, values.length, `${name} thresholds must be distinct so every cell has its own cut-off`);
}
assert.ok(DITHER_TYPES.includes('floyd-steinberg') && DITHER_TYPES.includes('atkinson'), 'both error-diffusion kernels stay public');
assert.deepEqual([...HALFTONE_SHAPES], ['dot', 'square', 'line']);
assert.ok(DEFAULT_ASCII_CHARS.length >= 4 && DEFAULT_ASCII_CHARS.endsWith(' '), 'the default glyph ramp ends in a space so bright cells stay empty');

// 2. Option normalisation: defaults, clamping and unknown values fall back.
const dither = resolveStyleConfig('dither', {});
assert.equal(dither.type, '8x8');
assert.equal(dither.colorSteps, 2, 'dither defaults to a two-tone palette');
assert.deepEqual(dither.paper, [244, 241, 234]);
assert.deepEqual(dither.ink, [17, 17, 17]);
assert.equal(dither.accent, null);
assert.equal(dither.originalColors, false);
assert.equal(dither.inverted, false);
const ascii = resolveStyleConfig('ascii', { chars: 'x', colorSteps: 99, type: 'nope', shape: 'triangle' });
assert.equal(ascii.chars, DEFAULT_ASCII_CHARS, 'a one-character ramp cannot express tone and falls back');
assert.equal(ascii.colorSteps, 8, 'colorSteps is clamped to 8');
assert.equal(ascii.type, '8x8', 'unknown dither type falls back');
assert.equal(ascii.shape, 'dot', 'unknown halftone shape falls back');
assert.equal(resolveStyleConfig('halftone', {}).colorSteps, 4, 'non-dither styles default to four palette steps');
assert.equal(resolveStyleConfig('halftone', { colorSteps: 1 }).colorSteps, 2, 'colorSteps is clamped to at least 2');
assert.equal(resolveStyleConfig('dither', { originalColors: 'true' }).originalColors, false, 'booleans must be real booleans (data attributes are coerced upstream)');

// 2b. Levels, motion and pointer — the living look. Every one of these is a
// public option, so an unknown value has to fall back instead of reaching the
// painter and drawing nothing.
const defaults = resolveStyleConfig('dither', {});
assert.equal(defaults.contrast, 1, 'levels are neutral by default');
assert.equal(defaults.brightness, 0);
assert.equal(defaults.motion, 'none', 'a look holds still unless motion is asked for');
assert.equal(defaults.pointer, 'none');
assert.equal(resolveStyleConfig('dither', { motion: 'nope' }).motion, 'none', 'unknown motion falls back to none');
assert.equal(resolveStyleConfig('dither', { pointer: 'nope' }).pointer, 'none', 'unknown pointer behaviour falls back to none');
assert.deepEqual(MOTION_TYPES, ['none', 'drift', 'shuffle', 'scan', 'flow', 'pulse']);
assert.deepEqual(POINTER_TYPES, ['none', 'lens', 'spotlight', 'ripple']);
const tuned = resolveStyleConfig('ascii', {
  contrast: 9, brightness: -4, motion: 'shuffle', motionSpeed: 99, motionAmount: 5,
  pointer: 'lens', pointerRadius: 5000, pointerStrength: 3, pointerCellSize: 999
});
assert.equal(tuned.contrast, 3, 'contrast is clamped');
assert.equal(tuned.brightness, -1, 'brightness is clamped');
assert.equal(tuned.motionSpeed, 6, 'motion speed is clamped');
assert.equal(tuned.motionAmount, 1, 'motion amount is clamped');
assert.equal(tuned.pointerRadius, 1200, 'pointer radius is clamped');
assert.equal(tuned.pointerStrength, 1, 'pointer strength is clamped');
assert.equal(tuned.pointerCellSize, 64, 'lens cell size is clamped');
assert.equal(resolveStyleConfig('dither', { contrast: 'x' }).contrast, 1, 'a non-numeric level keeps the neutral default');

// 3. Cover-fit geometry crops the longer side and never exceeds the source.
assert.deepEqual(coverMap(200, 100, 100, 100), { sx: 50, sy: 0, sw: 100, sh: 100 }, 'a wide source is cropped horizontally');
assert.deepEqual(coverMap(100, 200, 100, 100), { sx: 0, sy: 50, sw: 100, sh: 100 }, 'a tall source is cropped vertically');
assert.deepEqual(coverMap(300, 150, 200, 100), { sx: 0, sy: 0, sw: 300, sh: 150 }, 'a same-ratio source is used whole');

// 4. Source measurement prefers the live media size and tolerates unknown nodes.
assert.deepEqual(sourceSize({ videoWidth: 640, videoHeight: 360 }), { width: 640, height: 360 });
assert.deepEqual(sourceSize({ naturalWidth: 12, naturalHeight: 8 }), { width: 12, height: 8 });
assert.deepEqual(sourceSize({ width: 3, height: 2 }), { width: 3, height: 2 });
assert.deepEqual(sourceSize({}), { width: 0, height: 0 }, 'an unmeasurable source reports zero so render() can skip it');

// 5. Without a document (SSR, Node) colour parsing returns the fallback instead
//    of throwing, and empty input always means "use the fallback".
assert.deepEqual(parseColor('', [1, 2, 3]), [1, 2, 3]);
assert.deepEqual(parseColor(undefined, [4, 5, 6]), [4, 5, 6]);
assert.deepEqual(parseColor('#ff4a1c', [7, 8, 9]), [7, 8, 9], 'no canvas available here => fallback, never a crash');

// 6. The renderer against a fake 2D context. The fake records fills so the
//    checks can reason about what was painted without a real canvas.
function fakeCanvas(pixels) {
  const fills = [];
  const context = {
    imageSmoothingEnabled: true,
    fillStyle: '',
    font: '',
    textAlign: '',
    textBaseline: '',
    setTransform() {},
    clearRect() {},
    fillRect(x, y, w, h) { fills.push({ style: this.fillStyle, x, y, w, h }); },
    fillText(text, x, y) { fills.push({ style: this.fillStyle, text, x, y }); },
    beginPath() {},
    arc() {},
    fill() { fills.push({ style: this.fillStyle, arc: true }); },
    drawImage() {},
    getImageData(_x, _y, w, h) {
      // Return the sampled cell colours the test asked for, tiled across w×h.
      const data = new Uint8ClampedArray(w * h * 4);
      for (let index = 0; index < w * h; index += 1) {
        const [r, g, b, a = 255] = pixels[index % pixels.length];
        data.set([r, g, b, a], index * 4);
      }
      return { data, width: w, height: h };
    },
    putImageData() {},
    createImageData(w, h) { return { data: new Uint8ClampedArray(w * h * 4), width: w, height: h }; }
  };
  const canvas = { width: 0, height: 0, getContext: () => context, fills };
  return canvas;
}
// A 1×1 probe canvas that behaves like a browser for `#rrggbb` (anything else
// is rejected and leaves the previous colour in place), so parseColor's
// sentinel-based validity check can be exercised without a real canvas.
function probeCanvas() {
  let color = '#000000';
  const context = {
    get fillStyle() { return color; },
    set fillStyle(value) { if (/^#[0-9a-f]{6}$/i.test(String(value))) color = String(value).toLowerCase(); },
    fillRect() {},
    getImageData() {
      const packed = Number.parseInt(color.slice(1), 16);
      return { data: new Uint8ClampedArray([(packed >> 16) & 255, (packed >> 8) & 255, packed & 255, 255]) };
    }
  };
  return { width: 0, height: 0, getContext: () => context };
}
globalThis.document = { createElement: () => probeCanvas() };
globalThis.window = { devicePixelRatio: 1 };
try {
  assert.deepEqual(parseColor('#ff4a1c'), [255, 74, 28], 'a valid colour is parsed through the probe canvas');
  assert.deepEqual(parseColor('not-a-colour', [9, 9, 9]), [9, 9, 9], 'an invalid colour returns the fallback instead of black');
  assert.deepEqual(parseColor('#010203'), [1, 2, 3], 'the sentinel colour itself is still accepted when asked for explicitly');
  // The display canvas records what gets painted; the sampling grid the
  // renderer creates for itself reports alternating black/white source cells.
  const canvas = fakeCanvas([]);
  const grid = fakeCanvas([[0, 0, 0], [255, 255, 255]]);
  const config = resolveStyleConfig('halftone', { paperColor: '#f4f1ea', inkColor: '#111111' });
  globalThis.document.createElement = () => grid;
  const renderer = createStylizedRenderer(canvas, config, { maxDpr: 2 });
  globalThis.document.createElement = () => probeCanvas();
  renderer.sync(40, 20);
  assert.equal(canvas.width, 40);
  assert.equal(canvas.height, 20);
  assert.equal(renderer.render({}, 4), false, 'a source without dimensions is not painted');
  assert.equal(renderer.render({ naturalWidth: 80, naturalHeight: 40 }, 4), true, 'a measurable source paints');
  const styles = new Set(canvas.fills.map((fill) => fill.style));
  // Paper background plus ink dots — the fake reported black+white cells, so
  // black cells (full ink) draw dots and white cells (no ink) draw nothing.
  assert.ok(styles.size === 2, `halftone paints exactly paper and ink, got ${[...styles].join(' | ')}`);
  assert.ok(canvas.fills.some((fill) => fill.arc), 'the default halftone shape is a dot');
  renderer.destroy();
} finally {
  delete globalThis.document;
  delete globalThis.window;
}

console.log('lazy-stylized-media OK — matrices, option normalisation, cover geometry, colour fallbacks and fake-context painting.');
