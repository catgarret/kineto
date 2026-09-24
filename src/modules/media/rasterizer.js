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
import { clamp, numberOption } from '../../utils.js';

// Ordered-dither threshold matrices, normalised to 0..1.
//
// Two families, and they look nothing alike:
//
//   DISPERSED (Bayer) — neighbouring cells get thresholds spread as far apart as
//     possible, so a flat tone turns into an even cross-hatch. Built by the
//     recursive doubling rule below rather than typed out, so 2x2 through 16x16
//     are one formula and a new size is one entry. The bigger the matrix the
//     more tone steps it can express, and the less the weave reads as a pattern.
//
//   CLUSTERED (the print screen) — thresholds spiral outward from the middle of
//     the tile, so ink grows as one blob per cell instead of scattered pixels.
//     This is what a newspaper halftone is, and it is the pattern that reads as
//     "printed" rather than "computed".
//
// `bayer(1)` is [[0]]; doubling quadruples the tile and offsets each quadrant,
// which is the standard construction: M2n = [[4M, 4M+2], [4M+3, 4M+1]].
const QUADRANT_OFFSET = [0, 2, 3, 1]; // top-left, top-right, bottom-left, bottom-right
const doubleBayer = (matrix) => {
  const size = matrix.length;
  const next = [];
  for (let y = 0; y < size * 2; y += 1) {
    const row = [];
    for (let x = 0; x < size * 2; x += 1) {
      const quadrant = (y < size ? 0 : 2) + (x < size ? 0 : 1);
      row.push(matrix[y % size][x % size] * 4 + QUADRANT_OFFSET[quadrant]);
    }
    next.push(row);
  }
  return next;
};
const bayer = (size) => {
  let matrix = [[0]];
  while (matrix.length < size) matrix = doubleBayer(matrix);
  return matrix;
};
// Clustered-dot 8x8 screen: 0 in the middle, growing outward in a spiral, so a
// cell fills as one round blob. Classic print halftone ordering.
const CLUSTER_8 = [
  [24, 10, 12, 26, 35, 47, 49, 37],
  [8, 0, 2, 14, 45, 59, 61, 51],
  [22, 6, 4, 16, 43, 57, 63, 53],
  [30, 20, 18, 28, 33, 41, 55, 39],
  [34, 46, 48, 36, 25, 11, 13, 27],
  [44, 58, 60, 50, 9, 1, 3, 15],
  [42, 56, 62, 52, 23, 7, 5, 17],
  [32, 40, 54, 38, 31, 21, 19, 29]
];
const normalizeMatrix = (matrix) => {
  const size = matrix.length;
  const cells = size * size;
  return matrix.map((row) => row.map((value) => (value + 0.5) / cells));
};
export const DITHER_MATRICES = Object.freeze({
  '2x2': normalizeMatrix(bayer(2)),
  '4x4': normalizeMatrix(bayer(4)),
  '8x8': normalizeMatrix(bayer(8)),
  '16x16': normalizeMatrix(bayer(16)),
  cluster: normalizeMatrix(CLUSTER_8)
});
/**
 * Interleaved gradient noise — a threshold field with no repeating tile.
 *
 * Bayer's weave is what makes a dithered photo look coarse: the eye finds the
 * 8x8 grid before it finds the picture. This is the cheap, grid-free
 * alternative used in real-time rendering; it gives blue-noise-like spacing
 * from three constants, so a fine cell size reads as texture rather than as a
 * pattern. `phase` lets the field crawl for the `drift` motion.
 */
const gradientNoise = (x, y, phase) => {
  const value = 52.9829189 * (0.06711056 * (x + phase * 1.7) + 0.00583715 * (y + phase));
  return value - Math.floor(value);
};
export const DITHER_TYPES = Object.freeze([
  '8x8', '4x4', '2x2', '16x16', 'cluster', 'noise', 'random', 'floyd-steinberg', 'atkinson'
]);
export const HALFTONE_SHAPES = Object.freeze(['dot', 'square', 'line', 'cross', 'diamond', 'ring', 'triangle']);
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

/**
 * Resolve a CSS custom property so a page can hand Kineto its own design
 * tokens: `data-kt-ink-color="var(--fg)"`. `scope` is the element the token is
 * read from, which matters when a section overrides the token for a theme;
 * it falls back to the document root, where most token sets live.
 *
 * Only the reference itself is resolved, once, with its `var(--a, fallback)`
 * fallback honoured — the result still goes through the normal colour parser,
 * so a token holding `hsl(...)` or a named colour works like any other value.
 */
const CSS_VARIABLE = /^var\(\s*(--[\w-]+)\s*(?:,\s*([\s\S]+?)\s*)?\)$/;
export function resolveCssColorToken(value, scope = null) {
  const key = String(value ?? '').trim();
  const match = CSS_VARIABLE.exec(key);
  if (!match) return key;
  if (typeof window === 'undefined' || typeof getComputedStyle !== 'function') return match[2] || '';
  const element = (scope && scope.nodeType === 1 ? scope : null)
    || (typeof document !== 'undefined' ? document.documentElement : null);
  if (!element) return match[2] || '';
  const resolved = getComputedStyle(element).getPropertyValue(match[1]).trim();
  // An undefined token falls back to whatever the author wrote as the second
  // argument, exactly like CSS would.
  return resolved || match[2] || '';
}

export function parseColor(value, fallback = [0, 0, 0], scope = null) {
  const key = resolveCssColorToken(value, scope);
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

/**
 * `dissolve` 전환에서 셀이 걷히는 **차례**(0..1). 작을수록 먼저 사라집니다.
 *
 * 셀마다 독립 난수를 쓰면 중간 단계에서 원본 위에 고립된 흑백 점만 남아, 디더가 걷히는
 * 것이 아니라 사진에 때가 낀 것처럼 보입니다. 굵은 격자에서 값을 뽑아 부드럽게 보간하면
 * 이웃 셀이 비슷한 차례를 받아 **지역 단위**로 걷히고, 남은 쪽과 드러난 쪽이 각각 온전한
 * 그림으로 읽힙니다. 거기에 셀 단위 흔들림을 조금 섞어, 경계가 매끈한 얼룩이 아니라 디더
 * 특유의 자글자글한 가장자리가 되게 합니다.
 *
 * 순수 함수라 이웃 간 차이를 바로 잴 수 있습니다(tests/lazy-stylized-media.mjs).
 */
export function dissolveOrder(x, y, patch, seed) {
  const size = Math.max(3, patch);
  const smooth = (t) => t * t * (3 - 2 * t);
  const gx = x / size;
  const gy = y / size;
  const x0 = Math.floor(gx);
  const y0 = Math.floor(gy);
  const u = smooth(gx - x0);
  const v = smooth(gy - y0);
  const top = hash3(x0, y0, 0, seed) * (1 - u) + hash3(x0 + 1, y0, 0, seed) * u;
  const bottom = hash3(x0, y0 + 1, 0, seed) * (1 - u) + hash3(x0 + 1, y0 + 1, 0, seed) * u;
  const clumped = top * (1 - v) + bottom * v;
  return clamp(clumped * 0.82 + hash3(x, y, 0, seed) * 0.18, 0, 1);
}

export const MOTION_TYPES = Object.freeze(['none', 'drift', 'shuffle', 'scan', 'flow', 'pulse']);
export const POINTER_TYPES = Object.freeze(['none', 'lens', 'spotlight', 'ripple']);

/**
 * Normalise author options into a renderer config. The modules read `opts.*`
 * themselves (so the option analysis can attribute each one to its variant) and
 * pass the plain values here.
 */
export function resolveStyleConfig(style, input = {}) {
  const config = {
    style,
    // Palette: `originalColors` keeps the sampled colours (posterised to
    // `colorSteps`); otherwise cells are painted between paper and ink.
    originalColors: input.originalColors === true,
    // `scope` is the element design tokens are read from (see
    // resolveCssColorToken); the modules pass the media element they own.
    paper: parseColor(input.paperColor, [244, 241, 234], input.scope),
    ink: parseColor(input.inkColor, [17, 17, 17], input.scope),
    accent: input.accentColor ? parseColor(input.accentColor, [0, 0, 0], input.scope) : null,
    colorSteps: clamp(Math.round(Number(input.colorSteps ?? (style === 'dither' ? 2 : 4))), 2, 8),
    inverted: input.inverted === true,
    seed: input.seed,
    type: DITHER_TYPES.includes(input.type) ? input.type : '8x8',
    shape: HALFTONE_SHAPES.includes(input.shape) ? input.shape : 'dot',
    // 하프톤 스크린 각도(도). 0은 화면과 나란한 격자입니다.
    angle: numberOption(input.angle, 0, 0, 90),
    chars: typeof input.chars === 'string' && input.chars.length >= 2 ? input.chars : DEFAULT_ASCII_CHARS,
    font: input.font || 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    // Levels. A photograph straight out of a camera sits in the middle of the
    // range and dithers to grey mush; pushing contrast first is what gives the
    // print look its snap.
    contrast: numberOption(input.contrast, 1, 0, 3),
    brightness: numberOption(input.brightness, 0, -1, 1),
    // Living look: how the pattern moves, and how it answers the pointer.
    // Resolved apart from the rest because these are the settings a running
    // effect can swap without rebuilding its canvas (see resolveLiveLook).
    ...resolveLiveLook(input)
  };
  return config;
}

/**
 * The subset of the look that can change WHILE the effect runs: the motion and
 * the pointer reaction. Everything else (cell size, palette, contrast…) decides
 * how the canvas is built, so changing it needs a fresh instance.
 *
 * Every key is always present, so assigning the result over a live config never
 * leaves a half-applied state — `{ motion: 'drift' }` in gives a full, valid
 * live-look block out, with the defaults for what the caller left out.
 */
export function resolveLiveLook(input = {}) {
  return {
    motion: MOTION_TYPES.includes(input.motion) ? input.motion : 'none',
    motionSpeed: numberOption(input.motionSpeed, 1, 0.05, 6),
    motionAmount: numberOption(input.motionAmount, 0.5, 0, 1),
    pointer: POINTER_TYPES.includes(input.pointer) ? input.pointer : 'none',
    pointerRadius: numberOption(input.pointerRadius, 140, 10, 1200),
    pointerStrength: numberOption(input.pointerStrength, 0.6, 0, 1),
    // 0 means "half the cell size", resolved per frame against the live cell.
    pointerCellSize: numberOption(input.pointerCellSize, 0, 0, 64)
  };
}

/** The option names resolveLiveLook owns — what a live update may contain. */
export const LIVE_LOOK_KEYS = Object.freeze([
  'motion', 'motionSpeed', 'motionAmount',
  'pointer', 'pointerRadius', 'pointerStrength', 'pointerCellSize'
]);

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
  let pixelWidth = 0;
  let pixelHeight = 0;
  let ratio = 1;
  let errors = null;
  // A cell only passes error to the current and next one/two rows. Keep a
  // rolling window, not a width × height allocation on every video frame.
  const diffusion = config.type === 'floyd-steinberg'
    ? [[1, 0, 7 / 16], [-1, 1, 3 / 16], [0, 1, 5 / 16], [1, 1, 1 / 16]]
    : config.type === 'atkinson'
      ? [[1, 0, 1 / 8], [2, 0, 1 / 8], [-1, 1, 1 / 8], [0, 1, 1 / 8], [1, 1, 1 / 8], [0, 2, 1 / 8]]
      : null;
  const errorRows = config.type === 'atkinson' ? 3 : 2;

  // Match the display canvas to its CSS box (bounded by maxDpr) and draw in
  // device pixels — `setTransform` stays identity on purpose.
  const sync = (width, height) => {
    ratio = clamp((typeof window !== 'undefined' && window.devicePixelRatio) || 1, 1, maxDpr);
    pixelWidth = Math.max(1, Math.round(Math.max(1, width) * ratio));
    pixelHeight = Math.max(1, Math.round(Math.max(1, height) * ratio));
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
      const imageData = gridContext.getImageData(0, 0, cols, rows);
      return {
        cols,
        rows,
        cell: cellDevice,
        originX: -shiftX,
        originY: -shiftY,
        imageData,
        data: imageData.data
      };
    } catch (_error) {
      // A tainted (cross-origin) source cannot be read back; the caller keeps
      // the previous frame and the original media stays visible underneath.
      return null;
    }
  };

  // Quantise an already bounded 0..1 value (source channel or clamped carry).
  const quantize = (value, steps) => Math.round(value * (steps - 1)) / (steps - 1);

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
      return cellRgb.map(channel);
    }
    let from = config.paper;
    let to = config.ink;
    if (config.accent && tone > 0 && tone < 1) {
      // Three-colour palette: paper → accent → ink.
      if (tone < 0.5) { to = config.accent; tone *= 2; }
      else { from = config.accent; tone = tone * 2 - 1; }
    }
    return [mix(from[0], to[0], tone), mix(from[1], to[1], tone), mix(from[2], to[2], tone)];
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
    // 행렬이 없는 룩에서는 기어갈 격자가 없습니다 — 오차 확산·random·noise 디더와
    // halftone 이 그렇습니다. 이 셋에는 **부드럽게 이동하는 톤 파동**을 더해 같은 "그레인이
    // 기어간다"는 인상을 만듭니다. 여기서 셀마다 난수를 뽑으면 정렬 디더가 랜덤 디더가 되어
    // 그림이 노이즈로 녹습니다(2a60fa4에서 겪은 함정). 진폭을 작게 둬서 행렬이 있는 룩에
    // 함께 적용돼도 무늬를 해치지 않습니다.
    const driftWave = motion === 'drift'
      ? (x, y) => Math.sin(x * 0.21 + y * 0.16 - phase * 2.6) * 0.05 * amount
      : null;
    // noise 디더의 필드를 흐르게 하는 위상. 타일이 없으므로 위상만 밀면 됩니다.
    const noisePhase = motion === 'drift' ? phase * 5 : 0;
    const px = pointer && pointer.active ? pointer.x : null;
    const py = pointer && pointer.active ? pointer.y : null;
    const radius = config.pointerRadius * ratio;
    const strength = config.pointerStrength;
    const usePointer = config.pointer !== 'none' && px != null;
    return {
      pulse,
      noisePhase,
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
        if (driftWave) shift += driftWave(x, y);
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
    // Every source cell is read only once, before its output is written. Reuse
    // the sample's ImageData rather than allocating a second full RGBA buffer.
    const matrix = DITHER_MATRICES[config.type];
    const channels = config.originalColors ? 3 : 1;
    const stride = cols * channels;
    if (diffusion) {
      const length = stride * errorRows;
      if (!errors || errors.length !== length) errors = new Float32Array(length);
      else errors.fill(0);
    }
    const spread = (x, y, channel, error) => {
      for (const [dx, dy, weight] of diffusion) {
        const nx = x + dx;
        if (nx >= 0 && nx < cols && y + dy < rows) errors[dy * stride + nx * channels + channel] += error * weight;
      }
    };
    const cellRgb = [0, 0, 0];
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const index = (y * cols + x) * 4;
        for (let channel = 0; channel < 3; channel += 1) cellRgb[channel] = data[index + channel];
        const cx = originX + x * cell + cell / 2;
        const cy = originY + y * cell + cell / 2;
        let rgb;
        if (diffusion) {
          for (let channel = 0; channel < channels; channel += 1) {
            const value = config.originalColors ? cellRgb[channel] / 255 : inkOf(data, index) + dynamics.inkShift(x, y, cx, cy);
            const carried = clamp(value + errors[x * channels + channel], 0, 1);
            const level = quantize(carried, steps);
            spread(x, y, channel, carried - level);
            if (config.originalColors) cellRgb[channel] = Math.round(level * 255);
            else rgb = paletteColor(level);
          }
          if (config.originalColors) rgb = cellRgb;
        } else {
          const base = matrix
            ? matrix[(y + dynamics.driftY) % matrix.length][(x + dynamics.driftX) % matrix.length]
            : config.type === 'noise' ? gradientNoise(x, y, dynamics.noisePhase) : random();
          const threshold = clamp(base + dynamics.thresholdShift(x, y), 0, 1);
          if (config.originalColors) {
            rgb = paletteColor(0, cellRgb, threshold);
          } else {
            const ink = clamp(inkOf(data, index) + dynamics.inkShift(x, y, cx, cy), 0, 1);
            const scaled = ink * (steps - 1);
            const floor = Math.floor(scaled);
            rgb = paletteColor(clamp((floor + (scaled - floor > threshold ? 1 : 0)) / (steps - 1), 0, 1));
          }
        }
        data[index] = rgb[0];
        data[index + 1] = rgb[1];
        data[index + 2] = rgb[2];
        data[index + 3] = 255;
      }
      // Slide the small window once per row, avoiding modulo per neighbour.
      if (diffusion) { errors.copyWithin(0, stride); errors.fill(0, -stride); }
    }
    gridContext.putImageData(frame.imageData, 0, 0);
    context.imageSmoothingEnabled = false;
    context.drawImage(grid, 0, 0, cols, rows, originX, originY, cols * cell, rows * cell);
  };

  /**
   * 한 셀에 찍는 도형. `ink`(0..1)가 크기를 정하고, 면적이 잉크 양에 비례하도록
   * 반지름은 sqrt(ink)를 씁니다 — 선형으로 키우면 중간 톤이 실제보다 어둡게 보입니다.
   */
  const SHAPE_PAINTERS = {
    square(ctx, cx, cy, cell, ink) {
      const side = cell * Math.sqrt(ink);
      ctx.fillRect(cx - side / 2, cy - side / 2, side, side);
    },
    line(ctx, cx, cy, cell, ink) {
      const thickness = Math.max(0.5, cell * ink);
      ctx.fillRect(cx - cell / 2, cy - thickness / 2, cell, thickness);
    },
    // 십자(+)가 잉크가 늘수록 두꺼워집니다. 인쇄 스크린보다 도트 매트릭스에 가까운 질감.
    cross(ctx, cx, cy, cell, ink) {
      const arm = cell * Math.sqrt(ink);
      const thickness = Math.max(0.5, arm * 0.36);
      ctx.fillRect(cx - arm / 2, cy - thickness / 2, arm, thickness);
      ctx.fillRect(cx - thickness / 2, cy - arm / 2, thickness, arm);
    },
    diamond(ctx, cx, cy, cell, ink) {
      const radius = (cell / 2) * Math.sqrt(ink) * 1.35;
      ctx.beginPath();
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx + radius, cy);
      ctx.lineTo(cx, cy + radius);
      ctx.lineTo(cx - radius, cy);
      ctx.closePath();
      ctx.fill();
    },
    // 속이 빈 원. 밝은 쪽은 가는 링, 어두운 쪽은 꽉 찬 원으로 자연스럽게 메워집니다.
    ring(ctx, cx, cy, cell, ink) {
      const radius = (cell / 2) * Math.sqrt(ink);
      const thickness = Math.max(0.5, radius * (1 - ink * 0.85));
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(thickness / 2, radius - thickness / 2), 0, Math.PI * 2);
      ctx.lineWidth = thickness;
      ctx.strokeStyle = ctx.fillStyle;
      ctx.stroke();
    },
    triangle(ctx, cx, cy, cell, ink) {
      const radius = (cell / 2) * Math.sqrt(ink) * 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx + radius * 0.866, cy + radius * 0.5);
      ctx.lineTo(cx - radius * 0.866, cy + radius * 0.5);
      ctx.closePath();
      ctx.fill();
    },
    dot(ctx, cx, cy, cell, ink) {
      ctx.beginPath();
      ctx.arc(cx, cy, (cell / 2) * Math.sqrt(ink), 0, Math.PI * 2);
      ctx.fill();
    }
  };

  /**
   * `halftone`: 종이색 배경 위에 셀마다 도형 하나. 도형 크기가 잉크 양을 나타냅니다.
   *
   * `angle`이 0이면 샘플 격자를 그대로 씁니다. 0이 아니면 **회전한 격자** 위에 도형을
   * 찍습니다 — 실제 인쇄 스크린이 격자 무늬를 눈에 덜 띄게 하려고 판을 기울이는 것과
   * 같은 이유이고, 0도 격자가 주는 "표 같은" 인상을 없애 주는 가장 큰 요인입니다.
   * 회전 격자의 각 점은 자기 위치에서 가장 가까운 샘플 셀의 잉크를 읽습니다.
   */
  const renderHalftone = (frame, dynamics) => {
    const { cols, rows, cell, data, originX, originY } = frame;
    context.fillStyle = css(config.paper);
    context.fillRect(0, 0, pixelWidth, pixelHeight);
    const paintShape = SHAPE_PAINTERS[config.shape] || SHAPE_PAINTERS.dot;
    if (!config.originalColors) context.fillStyle = css(config.ink);
    const inkAt = (gx, gy, cx, cy) => {
      const index = (clamp(gy, 0, rows - 1) * cols + clamp(gx, 0, cols - 1)) * 4;
      return { index, ink: clamp(inkOf(data, index) + dynamics.inkShift(gx, gy, cx, cy), 0, 1) };
    };
    const paintCell = (gx, gy, cx, cy) => {
      const { index, ink } = inkAt(gx, gy, cx, cy);
      if (ink <= 0.02) return;
      if (config.originalColors) context.fillStyle = css(paletteColor(ink, [data[index], data[index + 1], data[index + 2]]));
      paintShape(context, cx, cy, cell, ink);
    };

    if (!config.angle) {
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          paintCell(x, y, originX + x * cell + cell / 2, originY + y * cell + cell / 2);
        }
      }
      return;
    }

    // 회전 격자: 화면 중심에서 두 기저 벡터를 따라 걸어 다니며, 캔버스를 덮을 만큼만 돕니다.
    const radians = (config.angle * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const centerX = pixelWidth / 2;
    const centerY = pixelHeight / 2;
    const reach = Math.ceil(Math.hypot(pixelWidth, pixelHeight) / (2 * cell)) + 1;
    for (let j = -reach; j <= reach; j += 1) {
      for (let i = -reach; i <= reach; i += 1) {
        const cx = centerX + (i * cos - j * sin) * cell;
        const cy = centerY + (i * sin + j * cos) * cell;
        if (cx < -cell || cy < -cell || cx > pixelWidth + cell || cy > pixelHeight + cell) continue;
        paintCell(Math.floor((cx - originX) / cell), Math.floor((cy - originY) / cell), cx, cy);
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
    if (!config.originalColors) context.fillStyle = css(config.ink);
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const index = (y * cols + x) * 4;
        const cx = originX + x * cell + cell / 2;
        const cy = originY + y * cell + cell / 2;
        const ink = clamp(inkOf(data, index) + dynamics.inkShift(x, y, cx, cy), 0, 1);
        const slot = Math.floor((1 - ink) * ramp.length) + dynamics.glyphShift(x, y);
        const glyph = ramp[clamp(slot, 0, ramp.length - 1)];
        if (glyph === ' ') continue;
        if (config.originalColors) context.fillStyle = css(paletteColor(ink, [data[index], data[index + 1], data[index + 2]]));
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
     * Swap the living-look settings of a renderer that is already drawing —
     * the motion and the pointer reaction — so an effect can start or stop
     * moving without being rebuilt. `patch` holds any of LIVE_LOOK_KEYS; the
     * whole block is re-resolved from the current values so a partial patch
     * (`{ motion: 'none' }`) can never leave an invalid combination behind.
     *
     * Only these keys: the others (cell size, palette, contrast…) are read
     * while the canvas is set up, so changing them needs a new renderer.
     */
    configure(patch = {}) {
      Object.assign(config, resolveLiveLook({ ...config, ...patch }));
      return config;
    },
    /** The settings a live update may change, for callers that want to check. */
    get live() { return config.motion !== 'none' || config.pointer !== 'none'; },
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
      // 덩어리 크기는 화면에 비례합니다 — 셀 수가 많을수록 덩어리도 커야 같은 인상이 납니다.
      const patch = Math.max(3, Math.round(Math.min(cols, rows) / 12));
      context.save();
      context.globalCompositeOperation = 'destination-out';
      context.fillStyle = '#000';
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const order = kind === 'wipe'
            // A pure diagonal edge reads as a hard line, so blend in a little
            // per-cell noise to break it up.
            ? clamp((x / cols) * 0.55 + (y / rows) * 0.45 + (hash3(x, y, 0, seed) - 0.5) * 0.22, 0, 1)
            : dissolveOrder(x, y, patch, seed);
          if (order < amount) context.fillRect(x * cell, y * cell, cell, cell);
        }
      }
      context.restore();
    },
    destroy() {
      errors = null;
      grid.width = 1;
      grid.height = 1;
    }
  };
}
