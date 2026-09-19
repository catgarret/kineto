// Stylized media rasterizers — dither, ASCII, halftone.
//
// One source-agnostic pipeline turns any drawable (an <img>, a live GIF/APNG/
// animated WebP, a playing <video>, another canvas) into a stylized frame:
//
//   1. sample   — draw the source, cover-fitted, into a tiny grid canvas where
//                 one pixel = one output cell, then read the cell colours;
//   2. quantize — map each cell's luminance/colour to the chosen palette with
//                 the selected dithering algorithm (or pick a glyph / dot size);
//   3. paint    — either upscale the grid canvas without smoothing (dither) or
//                 draw shapes/glyphs per cell (halftone / ASCII) on the display
//                 canvas.
//
// The Stylize module (and, for one deprecation cycle, Lazy's stylized
// aliases) own the DOM — wrapper, layers, lifecycle — through
// ./stylizer.js and call `renderer.render(source, cellSize)` for every frame
// they want; this file only knows how to draw.
import { clamp } from '../../utils.js';

// Ordered-dither threshold matrices, normalised to 0..1. The classic Bayer
// pattern: neighbouring cells get thresholds spread evenly across the range,
// so flat areas turn into the familiar cross-hatch instead of banding.
const BAYER_2 = [
  [0, 2],
  [3, 1]
];
const BAYER_4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5]
];
const BAYER_8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21]
];
const normalizeMatrix = (matrix) => {
  const size = matrix.length;
  const cells = size * size;
  return matrix.map((row) => row.map((value) => (value + 0.5) / cells));
};
export const DITHER_MATRICES = Object.freeze({
  '2x2': normalizeMatrix(BAYER_2),
  '4x4': normalizeMatrix(BAYER_4),
  '8x8': normalizeMatrix(BAYER_8)
});
export const DITHER_TYPES = Object.freeze(['8x8', '4x4', '2x2', 'random', 'floyd-steinberg', 'atkinson']);
export const HALFTONE_SHAPES = Object.freeze(['dot', 'square', 'line']);
// Dense → sparse glyph ramp: dark cells get heavy glyphs, bright cells spaces.
export const DEFAULT_ASCII_CHARS = '@%#*+=-:. ';

// Deterministic pseudo-random for the `random` dither type so a seeded render is
// reproducible (tests, replay) — mulberry32.
function seededRandom(seed) {
  let state = (Number(seed) || 0x9e3779b9) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

// Parse a CSS colour to RGB through a scratch canvas so palettes accept every
// notation the page author already uses (hex, rgb(), hsl(), named colours).
// Parsed values are memoised; the cache is bounded because a colour picker in
// the demo drawer can emit hundreds of distinct values while dragging.
const COLOR_CACHE_LIMIT = 256;
// A sentinel the author is very unlikely to ask for: if the canvas still holds
// it after the assignment, the input was not a valid CSS colour.
const INVALID_COLOR_SENTINEL = '#010203';
const colorCache = new Map();
export function parseColor(value, fallback = [0, 0, 0]) {
  const key = String(value ?? '').trim();
  if (!key) return fallback;
  if (colorCache.has(key)) return colorCache.get(key);
  // No document (SSR) or no 2D context: answer with the fallback but do not
  // remember it, so a later call in a real browser still parses the colour.
  const context = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;
  if (!context) return fallback;
  let rgb = fallback;
  context.fillStyle = INVALID_COLOR_SENTINEL;
  context.fillStyle = key;
  if (context.fillStyle !== INVALID_COLOR_SENTINEL || key.toLowerCase() === INVALID_COLOR_SENTINEL) {
    context.fillRect(0, 0, 1, 1);
    const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
    rgb = [r, g, b];
  }
  if (colorCache.size >= COLOR_CACHE_LIMIT) colorCache.clear();
  colorCache.set(key, rgb);
  return rgb;
}

const mix = (from, to, amount) => from + (to - from) * amount;
const luminance = (r, g, b) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

export function coverMap(sourceWidth, sourceHeight, boxWidth, boxHeight) {
  const scale = Math.max(boxWidth / sourceWidth, boxHeight / sourceHeight);
  const sw = Math.min(sourceWidth, boxWidth / scale);
  const sh = Math.min(sourceHeight, boxHeight / scale);
  return { sx: (sourceWidth - sw) / 2, sy: (sourceHeight - sh) / 2, sw, sh };
}

// Natural dimensions for the three drawable kinds Lazy hands us.
export function sourceSize(source) {
  if (!source) return { width: 0, height: 0 };
  if (source.videoWidth || source.videoHeight) return { width: source.videoWidth, height: source.videoHeight };
  if (source.naturalWidth || source.naturalHeight) return { width: source.naturalWidth, height: source.naturalHeight };
  return { width: source.width || 0, height: source.height || 0 };
}

// Deterministic per-cell noise. `hash3(x, y, tick)` returns 0..1 and is stable
// for the same inputs, so a seeded render replays identically while still
// changing from frame to frame when the caller advances `tick`.
function hash3(x, y, tick, seed) {
  let h = (x * 374761393 + y * 668265263 + tick * 2246822519 + seed) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export const MOTION_TYPES = Object.freeze(['none', 'drift', 'shuffle', 'scan', 'flow', 'pulse']);
export const POINTER_TYPES = Object.freeze(['none', 'lens', 'spotlight', 'ripple']);

/**
 * Normalise author options into a renderer config. The modules read `opts.*`
 * themselves (so the option analysis can attribute each one to its variant) and
 * pass the plain values here.
 */
export function resolveStyleConfig(style, input = {}) {
  const number = (value, fallback, min, max) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? clamp(parsed, min, max) : fallback;
  };
  const config = {
    style,
    // Palette: `originalColors` keeps the sampled colours (posterised to
    // `colorSteps`); otherwise cells are painted between paper and ink.
    originalColors: input.originalColors === true,
    paper: parseColor(input.paperColor, [244, 241, 234]),
    ink: parseColor(input.inkColor, [17, 17, 17]),
    accent: input.accentColor ? parseColor(input.accentColor) : null,
    colorSteps: clamp(Math.round(Number(input.colorSteps ?? (style === 'dither' ? 2 : 4))), 2, 8),
    inverted: input.inverted === true,
    seed: input.seed,
    type: DITHER_TYPES.includes(input.type) ? input.type : '8x8',
    shape: HALFTONE_SHAPES.includes(input.shape) ? input.shape : 'dot',
    chars: typeof input.chars === 'string' && input.chars.length >= 2 ? input.chars : DEFAULT_ASCII_CHARS,
    font: input.font || 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    // Levels. A photograph straight out of a camera sits in the middle of the
    // range and dithers to grey mush; pushing contrast first is what gives the
    // print look its snap.
    contrast: number(input.contrast, 1, 0, 3),
    brightness: number(input.brightness, 0, -1, 1),
    // Living look: how the pattern moves while it stays on the media.
    motion: MOTION_TYPES.includes(input.motion) ? input.motion : 'none',
    motionSpeed: number(input.motionSpeed, 1, 0.05, 6),
    motionAmount: number(input.motionAmount, 0.5, 0, 1),
    // Pointer reaction.
    pointer: POINTER_TYPES.includes(input.pointer) ? input.pointer : 'none',
    pointerRadius: number(input.pointerRadius, 140, 10, 1200),
    pointerStrength: number(input.pointerStrength, 0.6, 0, 1),
    // 0 means "half the cell size", resolved per frame against the live cell.
    pointerCellSize: number(input.pointerCellSize, 0, 0, 64)
  };
  return config;
}

/**
 * Create a renderer bound to a display canvas.
 * `render(source, cellSize, frame)` draws one stylized frame of `source`.
 *
 * Everything is drawn in DEVICE pixels with an integer number of device pixels
 * per cell. That is what keeps the result crisp: with a CSS-pixel grid, one
 * cell lands on 2.4 device pixels and nearest-neighbour upscaling gives some
 * cells 2 pixels and their neighbours 3, which reads as a blurry, shimmering
 * grid. An integer cell makes every dot identical.
 */
export function createStylizedRenderer(canvas, config, { maxDpr = 2 } = {}) {
  const context = canvas.getContext('2d', { alpha: true, desynchronized: true });
  const grid = document.createElement('canvas');
  const gridContext = grid.getContext('2d', { alpha: true, willReadFrequently: true });
  const seed = (Number(config.seed) || 0x9e3779b9) | 0;
  const random = seededRandom(config.seed);
  let cssWidth = 0;
  let cssHeight = 0;
  let pixelWidth = 0;
  let pixelHeight = 0;
  let ratio = 1;

  // Match the display canvas to its CSS box (bounded by maxDpr) and draw in
  // device pixels — `setTransform` stays identity on purpose.
  const sync = (width, height) => {
    cssWidth = Math.max(1, width);
    cssHeight = Math.max(1, height);
    ratio = clamp((typeof window !== 'undefined' && window.devicePixelRatio) || 1, 1, maxDpr);
    pixelWidth = Math.max(1, Math.round(cssWidth * ratio));
    pixelHeight = Math.max(1, Math.round(cssHeight * ratio));
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    context.setTransform(1, 0, 0, 1, 0, 0);
  };

  // Step 1 — sample the source into the cell grid. `shiftX/shiftY` slide the
  // grid under the image (the `flow` motion) by sampling one extra cell and
  // painting from a negative origin. Returns null when the source has no
  // dimensions yet (image still decoding, video without a frame).
  const sample = (source, cellDevice, shiftX = 0, shiftY = 0) => {
    const { width, height } = sourceSize(source);
    if (!width || !height) return null;
    const moving = shiftX !== 0 || shiftY !== 0;
    const cols = Math.max(1, Math.ceil(pixelWidth / cellDevice) + (moving ? 1 : 0));
    const rows = Math.max(1, Math.ceil(pixelHeight / cellDevice) + (moving ? 1 : 0));
    if (grid.width !== cols || grid.height !== rows) {
      grid.width = cols;
      grid.height = rows;
    }
    const map = coverMap(width, height, pixelWidth, pixelHeight);
    // The grid covers a slightly larger box when it is sliding, so widen the
    // source rect by the same fraction to keep the framing steady.
    const scaleX = (cols * cellDevice) / pixelWidth;
    const scaleY = (rows * cellDevice) / pixelHeight;
    gridContext.imageSmoothingEnabled = true;
    gridContext.clearRect(0, 0, cols, rows);
    try {
      gridContext.drawImage(source, map.sx, map.sy, map.sw * scaleX, map.sh * scaleY, 0, 0, cols, rows);
      return {
        cols,
        rows,
        cell: cellDevice,
        originX: -shiftX,
        originY: -shiftY,
        data: gridContext.getImageData(0, 0, cols, rows).data
      };
    } catch (_error) {
      // A tainted (cross-origin) source cannot be read back; the caller keeps
      // the previous frame and the original media stays visible underneath.
      return null;
    }
  };

  // Quantise one 0..1 value to `steps` levels (2 = pure black/white).
  const quantize = (value, steps) => Math.round(clamp(value, 0, 1) * (steps - 1)) / (steps - 1);

  // Paint helpers shared by the styles. `tone` is 0 (paper) .. 1 (ink).
  // With `originalColors` the cell keeps its own colour, posterised to
  // `colorSteps` levels per channel (`threshold` lets ordered dithering push
  // a channel up or down instead of plain rounding).
  const paletteColor = (tone, cellRgb, threshold = null) => {
    if (config.originalColors) {
      const steps = config.colorSteps;
      const channel = (value) => {
        const scaled = (value / 255) * (steps - 1);
        if (threshold == null) return Math.round(quantize(value / 255, steps) * 255);
        const base = Math.floor(scaled);
        return Math.round(clamp((base + (scaled - base > threshold ? 1 : 0)) / (steps - 1), 0, 1) * 255);
      };
      return [channel(cellRgb[0]), channel(cellRgb[1]), channel(cellRgb[2])];
    }
    if (config.accent && tone > 0 && tone < 1) {
      // Three-colour palette: paper → accent → ink.
      const [from, to, local] = tone < 0.5 ? [config.paper, config.accent, tone * 2] : [config.accent, config.ink, tone * 2 - 1];
      return [mix(from[0], to[0], local), mix(from[1], to[1], local), mix(from[2], to[2], local)];
    }
    return [mix(config.paper[0], config.ink[0], tone), mix(config.paper[1], config.ink[1], tone), mix(config.paper[2], config.ink[2], tone)];
  };
  const css = ([r, g, b]) => `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;

  // Ink amount for a cell: dark image → lots of ink. Levels are applied here so
  // every style gets the same tonal response, then `inverted` flips it.
  const levels = (value) => clamp((value - 0.5) * config.contrast + 0.5 + config.brightness, 0, 1);
  const inkOf = (data, index) => {
    const lum = levels(luminance(data[index], data[index + 1], data[index + 2]));
    const alpha = data[index + 3] / 255;
    return clamp((config.inverted ? lum : 1 - lum) * alpha, 0, 1);
  };

  // ── Living look ───────────────────────────────────────────────────────────
  // One object per frame describing what the motion and the pointer do to each
  // cell, so the three painters share exactly one implementation of each
  // behaviour instead of three that drift apart.
  const makeDynamics = (frame, cell, time, pointer) => {
    const { motion, motionAmount: amount, motionSpeed: speed } = config;
    const seconds = (time || 0) / 1000;
    const tick = Math.floor(seconds * speed * 18);
    const phase = seconds * speed;
    // `scan` sweeps a band down the grid; the band is ~12% of the height.
    const bandHeight = Math.max(1, frame.rows * 0.12);
    const bandY = ((phase * 0.45) % 1.3 - 0.15) * frame.rows;
    // `pulse` breathes the exposure instead of the geometry, which keeps the
    // grid steady — a pulsing cell size re-samples everything and flickers.
    const pulse = motion === 'pulse' ? Math.sin(phase * 2.2) * 0.22 * amount : 0;
    // `drift` crawls the ordered matrix instead of re-rolling each cell. A
    // per-cell random threshold turns an ordered dither into a random one and
    // the picture dissolves into noise; sliding the matrix keeps the structure
    // and reads as the grain moving over the image.
    const driftX = motion === 'drift' ? Math.floor(phase * 3.1) : 0;
    const driftY = motion === 'drift' ? Math.floor(phase * 2.3) : 0;
    const px = pointer && pointer.active ? pointer.x : null;
    const py = pointer && pointer.active ? pointer.y : null;
    const radius = config.pointerRadius * ratio;
    const strength = config.pointerStrength;
    const usePointer = config.pointer !== 'none' && px != null;
    return {
      pulse,
      // 0 at the pointer, 1 outside its radius. Smoothstep so the edge of the
      // interaction is not a visible circle.
      falloff(cx, cy) {
        if (!usePointer) return 1;
        const distance = Math.hypot(cx - px, cy - py) / radius;
        if (distance >= 1) return 1;
        const t = distance * distance * (3 - 2 * distance);
        return t;
      },
      // Extra ink (or less) from the motion and the pointer, added to a cell.
      driftX,
      driftY,
      inkShift(x, y, cx, cy) {
        let shift = pulse;
        if (motion === 'shuffle' && hash3(x, y, tick, seed ^ 0x51ed) < amount * 0.5) {
          shift += (hash3(x, y, tick + 1, seed) - 0.5) * 0.9;
        } else if (motion === 'scan') {
          const distance = Math.abs(y - bandY);
          if (distance < bandHeight) shift += (1 - distance / bandHeight) * 0.45 * amount;
        }
        if (usePointer && config.pointer !== 'lens') {
          const near = 1 - this.falloff(cx, cy);
          if (near > 0) {
            if (config.pointer === 'spotlight') shift += near * strength * 0.7;
            else if (config.pointer === 'ripple') {
              const wave = Math.sin(Math.hypot(cx - px, cy - py) / (cell * 2) - seconds * 4 * speed);
              shift += near * wave * strength * 0.5;
            }
          }
        }
        return shift;
      },
      // Threshold nudge for ordered dithering — a moving threshold is what
      // makes a still photo shimmer like film grain.
      thresholdShift(x, y) {
        // Just enough jitter to keep the grain alive; the crawl above does the
        // visible work.
        if (motion === 'drift') return (hash3(x, y, tick, seed ^ 0x9e37) - 0.5) * 0.14 * amount;
        if (motion === 'shuffle' && hash3(x, y, tick, seed ^ 0x51ed) < amount * 0.5) return (hash3(x, y, tick + 7, seed) - 0.5);
        return 0;
      },
      // Glyph index nudge for ASCII — cells re-pick a neighbouring glyph.
      glyphShift(x, y) {
        if (motion === 'shuffle' && hash3(x, y, tick, seed ^ 0x2f1b) < amount) return hash3(x, y, tick + 3, seed) < 0.5 ? -1 : 1;
        if (motion === 'drift' && hash3(x, y, tick, seed ^ 0x7c3a) < amount * 0.3) return 1;
        return 0;
      }
    };
  };

  // Step 2+3 for `dither`: compute every cell's tone into an ImageData sized
  // like the grid, then upscale that grid by a whole number with smoothing off
  // so each cell is an identical crisp block.
  const renderDither = (frame, dynamics) => {
    const { cols, rows, cell, data, originX, originY } = frame;
    const steps = config.colorSteps;
    const output = gridContext.createImageData(cols, rows);
    const out = output.data;
    const matrix = DITHER_MATRICES[config.type];
    // Error diffusion carries the rounding error of a cell to its neighbours.
    const diffusion = config.type === 'floyd-steinberg'
      ? [[1, 0, 7 / 16], [-1, 1, 3 / 16], [0, 1, 5 / 16], [1, 1, 1 / 16]]
      : config.type === 'atkinson'
        ? [[1, 0, 1 / 8], [2, 0, 1 / 8], [-1, 1, 1 / 8], [0, 1, 1 / 8], [1, 1, 1 / 8], [0, 2, 1 / 8]]
        : null;
    // Error buffers: one for the ink tone, or one per channel in colour mode.
    const channels = config.originalColors ? 3 : 1;
    const errors = diffusion ? new Float32Array(cols * rows * channels) : null;
    const spread = (x, y, channel, error) => {
      diffusion.forEach(([dx, dy, weight]) => {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < cols && ny < rows) errors[(ny * cols + nx) * channels + channel] += error * weight;
      });
    };
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const index = (y * cols + x) * 4;
        const cellRgb = [data[index], data[index + 1], data[index + 2]];
        const cx = originX + x * cell + cell / 2;
        const cy = originY + y * cell + cell / 2;
        let rgb;
        if (diffusion && config.originalColors) {
          rgb = cellRgb.map((value, channel) => {
            const carried = clamp(value / 255 + errors[(y * cols + x) * channels + channel], 0, 1);
            const level = quantize(carried, steps);
            spread(x, y, channel, carried - level);
            return Math.round(level * 255);
          });
        } else if (diffusion) {
          const ink = clamp(inkOf(data, index) + dynamics.inkShift(x, y, cx, cy) + errors[y * cols + x], 0, 1);
          const tone = quantize(ink, steps);
          spread(x, y, 0, ink - tone);
          rgb = paletteColor(tone, cellRgb);
        } else {
          const base = matrix
            ? matrix[(y + dynamics.driftY) % matrix.length][(x + dynamics.driftX) % matrix.length]
            : random();
          const threshold = clamp(base + dynamics.thresholdShift(x, y), 0, 1);
          if (config.originalColors) {
            rgb = paletteColor(0, cellRgb, threshold);
          } else {
            // Ordered dithering with N levels: compare the fractional part of
            // the scaled ink against the matrix threshold.
            const ink = clamp(inkOf(data, index) + dynamics.inkShift(x, y, cx, cy), 0, 1);
            const scaled = ink * (steps - 1);
            const floor = Math.floor(scaled);
            rgb = paletteColor(clamp((floor + (scaled - floor > threshold ? 1 : 0)) / (steps - 1), 0, 1), cellRgb);
          }
        }
        out[index] = rgb[0];
        out[index + 1] = rgb[1];
        out[index + 2] = rgb[2];
        out[index + 3] = 255;
      }
    }
    gridContext.putImageData(output, 0, 0);
    context.imageSmoothingEnabled = false;
    context.drawImage(grid, 0, 0, cols, rows, originX, originY, cols * cell, rows * cell);
  };

  // `halftone`: paper background plus one shape per cell whose size follows the
  // ink amount — the print-screen look.
  const renderHalftone = (frame, dynamics) => {
    const { cols, rows, cell, data, originX, originY } = frame;
    context.fillStyle = css(config.paper);
    context.fillRect(0, 0, pixelWidth, pixelHeight);
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const index = (y * cols + x) * 4;
        const cx = originX + x * cell + cell / 2;
        const cy = originY + y * cell + cell / 2;
        const ink = clamp(inkOf(data, index) + dynamics.inkShift(x, y, cx, cy), 0, 1);
        if (ink <= 0.02) continue;
        context.fillStyle = css(config.originalColors ? paletteColor(ink, [data[index], data[index + 1], data[index + 2]]) : paletteColor(1));
        if (config.shape === 'square') {
          const side = cell * Math.sqrt(ink);
          context.fillRect(cx - side / 2, cy - side / 2, side, side);
        } else if (config.shape === 'line') {
          const thickness = Math.max(0.5, cell * ink);
          context.fillRect(originX + x * cell, cy - thickness / 2, cell, thickness);
        } else {
          context.beginPath();
          context.arc(cx, cy, (cell / 2) * Math.sqrt(ink), 0, Math.PI * 2);
          context.fill();
        }
      }
    }
  };

  // `ascii`: paper background plus a glyph per cell chosen from the ramp by ink
  // amount. Glyphs are drawn in the ink colour, or in the (posterised) cell
  // colour when `originalColors` is on.
  const renderAscii = (frame, dynamics) => {
    const { cols, rows, cell, data, originX, originY } = frame;
    const ramp = config.chars;
    context.fillStyle = css(config.paper);
    context.fillRect(0, 0, pixelWidth, pixelHeight);
    context.font = `${Math.max(4, cell * 1.15)}px ${config.font}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    const inkStyle = config.originalColors ? null : css(paletteColor(1));
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const index = (y * cols + x) * 4;
        const cx = originX + x * cell + cell / 2;
        const cy = originY + y * cell + cell / 2;
        const ink = clamp(inkOf(data, index) + dynamics.inkShift(x, y, cx, cy), 0, 1);
        const slot = Math.floor((1 - ink) * ramp.length) + dynamics.glyphShift(x, y);
        const glyph = ramp[clamp(slot, 0, ramp.length - 1)];
        if (glyph === ' ') continue;
        context.fillStyle = config.originalColors ? css(paletteColor(ink, [data[index], data[index + 1], data[index + 2]])) : inkStyle;
        context.fillText(glyph, cx, cy);
      }
    }
  };

  const painters = { dither: renderDither, halftone: renderHalftone, ascii: renderAscii };

  return {
    canvas,
    // Resize the canvas to `width × height` CSS pixels (call before render when
    // the box may have changed).
    sync,
    /**
     * Draw one frame. `frame` carries the living-look state:
     * `{ time }` in ms and `{ pointer: { x, y, active } }` in CSS pixels.
     * Returns false when the source could not be sampled.
     */
    render(source, cellSize, frame = {}) {
      if (!context || !gridContext) return false;
      // An integer number of device pixels per cell is what keeps dots crisp.
      const cell = Math.max(1, Math.round(Math.max(1, cellSize) * ratio));
      const time = frame.time || 0;
      const moving = config.motion === 'flow';
      const travel = moving ? ((time / 1000) * config.motionSpeed * cell * 1.6) % cell : 0;
      const sampled = sample(source, cell, travel, travel * 0.35);
      if (!sampled) return false;
      const pointer = frame.pointer && frame.pointer.active
        ? { active: true, x: frame.pointer.x * ratio, y: frame.pointer.y * ratio }
        : null;
      const dynamics = makeDynamics(sampled, cell, time, pointer);
      const paint = painters[config.style] || renderDither;
      context.clearRect(0, 0, pixelWidth, pixelHeight);
      paint(sampled, dynamics);
      // `lens`: the area under the pointer is redrawn at its own cell size, so
      // the picture sharpens (or coarsens) exactly where the pointer is.
      if (config.pointer === 'lens' && pointer) {
        const lensCell = Math.max(1, Math.round((config.pointerCellSize || cellSize / 2) * ratio));
        if (lensCell !== cell) {
          const lensFrame = sample(source, lensCell);
          if (lensFrame) {
            context.save();
            context.beginPath();
            context.arc(pointer.x, pointer.y, config.pointerRadius * ratio, 0, Math.PI * 2);
            context.clip();
            paint(lensFrame, makeDynamics(lensFrame, lensCell, time, null));
            context.restore();
          }
        }
      }
      return true;
    },
    /**
     * Punch cell-sized holes in what was just drawn so the original media shows
     * through. This is how a reveal can stay crisp: instead of shrinking the
     * cell size (which walks through blurry in-between resolutions), the look
     * is rendered once at its final size and then dissolves away cell by cell.
     *
     * `kind` is 'dissolve' (seeded random order) or 'wipe' (a soft diagonal
     * edge). `progress` is 0..1; at 1 every cell is cleared.
     */
    mask(progress, kind, cellSize) {
      if (!context) return;
      const amount = clamp(progress, 0, 1);
      if (amount <= 0) return;
      const cell = Math.max(1, Math.round(Math.max(1, cellSize) * ratio));
      const cols = Math.max(1, Math.ceil(pixelWidth / cell));
      const rows = Math.max(1, Math.ceil(pixelHeight / cell));
      context.save();
      context.globalCompositeOperation = 'destination-out';
      context.fillStyle = '#000';
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const order = kind === 'wipe'
            // A pure diagonal edge reads as a hard line, so blend in a little
            // per-cell noise to break it up.
            ? clamp((x / cols) * 0.55 + (y / rows) * 0.45 + (hash3(x, y, 0, seed) - 0.5) * 0.22, 0, 1)
            : hash3(x, y, 0, seed);
          if (order < amount) context.fillRect(x * cell, y * cell, cell, cell);
        }
      }
      context.restore();
    },
    destroy() {
      grid.width = 1;
      grid.height = 1;
    }
  };
}
