// Small helpers the media modules share. Kept apart from the rasterizer and
// the stylizer so Lazy can use them without loading either: Lazy needs the
// renderer only for its deprecated `dither` / `ascii` / `halftone` aliases,
// and imports it on demand when one of those is used.

export const STYLIZED_EFFECTS = Object.freeze(['dither', 'ascii', 'halftone']);
const EFFECT_SET = new Set(STYLIZED_EFFECTS);

export const ANIMATED_EXTENSIONS = /\.(?:gif|apng|webp)(?:$|[?#])/i;

export function isStylizedEffect(name) {
  return EFFECT_SET.has(name);
}

/** Seconds (≤ 30) or milliseconds, as the media modules have always accepted. */
export function durationMs(value, fallbackSeconds) {
  const number = Number(value ?? fallbackSeconds);
  if (!Number.isFinite(number)) return fallbackSeconds * 1000;
  return number <= 30 ? number * 1000 : number;
}

// The centred source rectangle that covers a box (CSS `object-fit: cover`).
export function coverMap(sourceWidth, sourceHeight, boxWidth, boxHeight) {
  const scale = Math.max(boxWidth / sourceWidth, boxHeight / sourceHeight);
  const sw = Math.min(sourceWidth, boxWidth / scale);
  const sh = Math.min(sourceHeight, boxHeight / scale);
  return { sx: (sourceWidth - sw) / 2, sy: (sourceHeight - sh) / 2, sw, sh };
}

// The renderer behind Lazy's deprecated `dither` / `ascii` / `halftone`
// aliases is the Stylize module's. Stylize puts it here when it loads, so Lazy
// never imports it: a page that uses Lazy's own effects does not carry the
// ~8.5 KB (gzip) renderer, and the single-file builds (which always include
// Stylize) need no dynamic import.
let aliasRenderer = null;
export function provideAliasRenderer(api) { aliasRenderer = api; }
export function aliasRendererApi() { return aliasRenderer; }
