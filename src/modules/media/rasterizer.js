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

/**
 * Normalise author options into a renderer config. Lazy reads `opts.*` itself
 * (so the option analysis can attribute them to the variant) and passes the
 * plain values here.
 */
export function resolveStyleConfig(style, input = {}) {
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
    font: input.font || 'ui-monospace, "SF Mono", Menlo, Consolas, monospace'
  };
  return config;
}

/**
 * Create a renderer bound to a display canvas. `render(source, cellSize)` draws
 * one stylized frame of `source` using `cellSize` CSS pixels per cell.
 */
export function createStylizedRenderer(canvas, config, { maxDpr = 2 } = {}) {
  const context = canvas.getContext('2d', { alpha: true, desynchronized: true });
  const grid = document.createElement('canvas');
  const gridContext = grid.getContext('2d', { alpha: true, willReadFrequently: true });
  const random = seededRandom(config.seed);
  let cssWidth = 0;
  let cssHeight = 0;

  // Match the display canvas to its CSS box (bounded by maxDpr) so cells stay
  // crisp on high-density screens without rendering more pixels than needed.
  const sync = (width, height) => {
    cssWidth = Math.max(1, width);
    cssHeight = Math.max(1, height);
    const dpr = clamp((typeof window !== 'undefined' && window.devicePixelRatio) || 1, 1, maxDpr);
    const pixelWidth = Math.max(1, Math.round(cssWidth * dpr));
    const pixelHeight = Math.max(1, Math.round(cssHeight * dpr));
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  // Step 1 — sample the source into the cell grid. Returns the grid pixels or
  // null when the source has no dimensions yet (image still decoding, video
  // without a frame).
  const sample = (source, cellSize) => {
    const { width, height } = sourceSize(source);
    if (!width || !height) return null;
    const cell = Math.max(1, cellSize);
    const cols = Math.max(1, Math.ceil(cssWidth / cell));
    const rows = Math.max(1, Math.ceil(cssHeight / cell));
    if (grid.width !== cols || grid.height !== rows) {
      grid.width = cols;
      grid.height = rows;
    }
    const map = coverMap(width, height, cssWidth, cssHeight);
    gridContext.imageSmoothingEnabled = true;
    gridContext.clearRect(0, 0, cols, rows);
    try {
      gridContext.drawImage(source, map.sx, map.sy, map.sw, map.sh, 0, 0, cols, rows);
      return { cols, rows, cell, data: gridContext.getImageData(0, 0, cols, rows).data };
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

  // Ink amount for a cell: dark image → lots of ink. `inverted` flips it.
  const inkOf = (data, index) => {
    const lum = luminance(data[index], data[index + 1], data[index + 2]);
    const alpha = data[index + 3] / 255;
    const ink = (config.inverted ? lum : 1 - lum) * alpha;
    return clamp(ink, 0, 1);
  };

  // Step 2+3 for `dither`: compute every cell's tone into an ImageData sized
  // like the grid, then upscale that grid with smoothing off so each cell is a
  // crisp block.
  const renderDither = (frame) => {
    const { cols, rows, data } = frame;
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
        let rgb;
        if (diffusion && config.originalColors) {
          rgb = cellRgb.map((value, channel) => {
            const carried = clamp(value / 255 + errors[(y * cols + x) * channels + channel], 0, 1);
            const level = quantize(carried, steps);
            spread(x, y, channel, carried - level);
            return Math.round(level * 255);
          });
        } else if (diffusion) {
          const ink = clamp(inkOf(data, index) + errors[y * cols + x], 0, 1);
          const tone = quantize(ink, steps);
          spread(x, y, 0, ink - tone);
          rgb = paletteColor(tone, cellRgb);
        } else {
          const threshold = matrix ? matrix[y % matrix.length][x % matrix.length] : random();
          if (config.originalColors) {
            rgb = paletteColor(0, cellRgb, threshold);
          } else {
            // Ordered dithering with N levels: compare the fractional part of
            // the scaled ink against the matrix threshold.
            const scaled = inkOf(data, index) * (steps - 1);
            const base = Math.floor(scaled);
            rgb = paletteColor(clamp((base + (scaled - base > threshold ? 1 : 0)) / (steps - 1), 0, 1), cellRgb);
          }
        }
        out[index] = rgb[0];
        out[index + 1] = rgb[1];
        out[index + 2] = rgb[2];
        out[index + 3] = 255;
      }
    }
    gridContext.putImageData(output, 0, 0);
    context.clearRect(0, 0, cssWidth, cssHeight);
    context.imageSmoothingEnabled = false;
    context.drawImage(grid, 0, 0, cols, rows, 0, 0, cssWidth, cssHeight);
  };

  // `halftone`: paper background plus one shape per cell whose size follows the
  // ink amount — the print-screen look.
  const renderHalftone = (frame) => {
    const { cols, rows, cell, data } = frame;
    context.clearRect(0, 0, cssWidth, cssHeight);
    context.fillStyle = css(config.paper);
    context.fillRect(0, 0, cssWidth, cssHeight);
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const index = (y * cols + x) * 4;
        const ink = inkOf(data, index);
        if (ink <= 0.02) continue;
        context.fillStyle = css(config.originalColors ? paletteColor(ink, [data[index], data[index + 1], data[index + 2]]) : paletteColor(1));
        const cx = x * cell + cell / 2;
        const cy = y * cell + cell / 2;
        if (config.shape === 'square') {
          const side = cell * Math.sqrt(ink);
          context.fillRect(cx - side / 2, cy - side / 2, side, side);
        } else if (config.shape === 'line') {
          const thickness = Math.max(0.5, cell * ink);
          context.fillRect(x * cell, cy - thickness / 2, cell, thickness);
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
  const renderAscii = (frame) => {
    const { cols, rows, cell, data } = frame;
    const ramp = config.chars;
    context.clearRect(0, 0, cssWidth, cssHeight);
    context.fillStyle = css(config.paper);
    context.fillRect(0, 0, cssWidth, cssHeight);
    context.font = `${Math.max(4, cell * 1.15)}px ${config.font}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    const inkStyle = config.originalColors ? null : css(paletteColor(1));
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const index = (y * cols + x) * 4;
        const ink = inkOf(data, index);
        const glyph = ramp[Math.min(ramp.length - 1, Math.floor((1 - ink) * ramp.length))];
        if (glyph === ' ') continue;
        context.fillStyle = config.originalColors ? css(paletteColor(ink, [data[index], data[index + 1], data[index + 2]])) : inkStyle;
        context.fillText(glyph, x * cell + cell / 2, y * cell + cell / 2);
      }
    }
  };

  const painters = { dither: renderDither, halftone: renderHalftone, ascii: renderAscii };

  return {
    canvas,
    // Resize the canvas to `width × height` CSS pixels (call before render when
    // the box may have changed).
    sync,
    /** Draw one frame. Returns false when the source could not be sampled. */
    render(source, cellSize) {
      if (!context || !gridContext) return false;
      const frame = sample(source, cellSize);
      if (!frame) return false;
      (painters[config.style] || renderDither)(frame);
      return true;
    },
    destroy() {
      grid.width = 1;
      grid.height = 1;
    }
  };
}
