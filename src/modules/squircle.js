// Squircle — the corner shape CSS could not draw until recently, on every
// browser. Apple's rounded rectangles are not circles: their corners are a
// superellipse, which leaves the straight sides longer and turns harder at the
// end, and the difference is exactly why a plain `border-radius` card never
// quite looks like an iOS one.
//
//   <div data-kt-squircle>…</div>                          the element's own radius, squircled
//   <div data-kt-squircle data-kt-corner-radius="28">…</div>      a radius of its own
//   <div data-kt-squircle="scoop" data-kt-corner-radius="20">…</div>
//   <div data-kt-squircle data-kt-superellipse="1.4">…</div>  the CSS superellipse(K) parameter
//
// CSS gained `corner-shape` for this, but as of September 2026 it is Chromium
// only — Safari and Firefox have nothing. So this module uses the real property
// where it exists (free, and borders, shadows and overflow all follow it) and
// draws the identical curve with a `clip-path` polygon everywhere else.
//
// The shape maths lives in ./surface/superellipse.js so other looks can share
// it; that file also explains how a keyword becomes an exponent.
import { snapshotInlineStyles } from '../utils.js';
import { CORNER_SHAPES, diagonalFraction, outlinePath, outlinePolygon, shapeK } from './surface/superellipse.js';

const BORDER_CLASS = 'kt-squircle-border';
const SVG_NS = 'http://www.w3.org/2000/svg';

/** True when the browser can draw the shape itself. */
export function supportsCornerShape() {
  return typeof CSS !== 'undefined' && typeof CSS.supports === 'function'
    && CSS.supports('corner-shape', 'squircle');
}

/**
 * Read a radius the way CSS reads `border-radius`: one value for every corner,
 * two for the diagonals, four clockwise from the top-left. Percentages resolve
 * against the box, so they keep working as it resizes.
 *
 * Returns null when there is nothing usable, which is the caller's signal to
 * fall back to the element's own computed radius.
 */
export function parseRadius(value, width, height) {
  if (value == null || value === '' || value === 'auto') return null;
  const parts = String(value).trim().split(/\s+/).slice(0, 4);
  const resolve = (token, axis) => {
    const percent = /%$/.test(token);
    const number = parseFloat(token);
    if (!Number.isFinite(number)) return null;
    return percent ? (number / 100) * axis : number;
  };
  // A percentage radius is per axis in CSS. We draw circular corners, so the
  // shorter side decides — a squircle whose two axes disagree is an egg.
  const axis = Math.min(width, height);
  const values = parts.map((token) => resolve(token, axis));
  if (values.some((entry) => entry == null)) return null;
  const [a, b = a, c = a, d = b] = values;
  return [a, b, c, d];
}

/** The element's own `border-radius`, in pixels, corner by corner. */
function computedRadius(computed, width, height) {
  const axis = Math.min(width, height);
  const read = (value) => {
    const token = String(value || '0').trim().split(/\s+/)[0];
    const number = parseFloat(token);
    if (!Number.isFinite(number)) return 0;
    return /%$/.test(token) ? (number / 100) * axis : number;
  };
  return [
    read(computed.borderTopLeftRadius),
    read(computed.borderTopRightRadius),
    read(computed.borderBottomRightRadius),
    read(computed.borderBottomLeftRadius)
  ];
}

/** The `corner-shape` value for the native path. */
function nativeShape(preset, smoothing) {
  if (Number.isFinite(Number(smoothing))) return `superellipse(${Number(smoothing)})`;
  return preset;
}

/**
 * The border, redrawn along the squircle.
 *
 * A `clip-path` cuts the element's own border off at every corner, because the
 * border still follows the rectangle underneath. The fix is to paint the outline
 * ourselves: an SVG stroke sitting exactly on the clip boundary. The clip then
 * removes the outer half of that stroke, so the width is doubled to leave the
 * authored width showing.
 */
function createBorderLayer() {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', BORDER_CLASS);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;overflow:visible;';
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('fill', 'none');
  svg.appendChild(path);
  return { svg, path };
}

export default {
  create(el, opts = {}) {
    const preset = CORNER_SHAPES.includes(opts.preset) ? opts.preset : 'squircle';
    const smoothing = opts.superellipse;
    const k = shapeK(preset, smoothing);
    // `nativeShape: "off"` draws the polyfill shape even where the browser could
    // do it itself — the only way to compare the two, and what the tests use.
    const useNative = opts.nativeShape !== 'off' && opts.nativeShape !== false && supportsCornerShape();
    const drawBorder = opts.borderFollow !== 'off' && opts.borderFollow !== false;
    const samples = Number.isFinite(Number(opts.cornerSamples)) ? Math.round(Number(opts.cornerSamples)) : undefined;

    const restore = snapshotInlineStyles(el, [
      'border-radius', 'corner-shape', 'clip-path', 'position', 'border-color'
    ]);
    let border = null;
    let observer = null;
    let destroyed = false;
    let lastKey = '';

    // What the shape is actually drawn from, so a page can read it back.
    let current = { width: 0, height: 0, radii: [0, 0, 0, 0] };

    const measure = () => {
      const box = el.getBoundingClientRect();
      const computed = getComputedStyle(el);
      const width = Math.max(0, box.width);
      const height = Math.max(0, box.height);
      // The radius comes from the option, or from the element's own CSS — so
      // `data-kt-squircle` on a card that is already rounded just upgrades the
      // curve, and a design system stays the source of truth for the size.
      const asked = parseRadius(opts.cornerRadius, width, height);
      const own = computedRadius(computed, width, height);
      const radii = asked || (own.some((value) => value > 0) ? own : [24, 24, 24, 24]);
      return { width, height, radii, computed };
    };

    const applyBorder = ({ width, height, radii, computed }) => {
      const widthPx = parseFloat(computed.borderTopWidth) || 0;
      const visible = drawBorder && !useNative && widthPx > 0 && computed.borderTopStyle !== 'none';
      if (!visible) {
        if (border) { border.svg.remove(); border = null; }
        return;
      }
      if (!border) {
        if (computed.position === 'static') el.style.position = 'relative';
        border = createBorderLayer();
        el.appendChild(border.svg);
      }
      border.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      border.path.setAttribute('d', outlinePath(width, height, radii, k, samples));
      border.path.setAttribute('stroke', computed.borderTopColor);
      // Doubled: the clip keeps the inner half only.
      border.path.setAttribute('stroke-width', String(widthPx * 2));
      el.style.borderColor = 'transparent';
    };

    const apply = () => {
      if (destroyed) return;
      const state = measure();
      const { width, height, radii } = state;
      if (width <= 0 || height <= 0) return;
      const key = `${width}x${height}|${radii.join(',')}`;
      if (key === lastKey) return;
      lastKey = key;
      current = { width, height, radii: [...radii] };
      if (useNative) {
        // The native property shapes the corner the radius declares, so the
        // radius has to be there for it to do anything at all.
        el.style.borderRadius = radii.map((value) => `${value}px`).join(' ');
        el.style.cornerShape = nativeShape(preset, smoothing);
      } else {
        // The polyfill's shape is the clip, and a border-radius left in place
        // would be a SECOND clip intersected with it: the element then gets
        // whichever of the two cuts deeper. For anything flatter than a circle
        // — squircle and square, the two people actually ask for — that is the
        // round corner, so the effect silently did nothing. Clearing it makes
        // the outline the only thing deciding the shape.
        el.style.borderRadius = '0px';
        el.style.clipPath = outlinePolygon(width, height, radii, k, samples);
      }
      applyBorder(state);
    };

    apply();
    // The polyfill is drawn in pixels, so it has to be redrawn when the box
    // changes. The native path needs no observer at all.
    if (!useNative && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => apply());
      observer.observe(el);
    }

    return {
      el,
      type: 'squircle',
      /** Which path drew the shape — `'native'` or `'polyfill'`. */
      get renderer() { return useNative ? 'native' : 'polyfill'; },
      /**
       * The corner shape in effect and the box it was drawn for. `k` is the CSS
       * `superellipse(K)` parameter, and `diagonal` is where the curve meets the
       * 45° diagonal as a fraction of the radius — the one number that says
       * which shape this is (0.159 squircle, 0.293 round, 0.5 bevel, 0.707
       * scoop).
       */
      get shape() { return { preset, k, diagonal: diagonalFraction(k), ...current }; },
      /** Redraw after a change the observer cannot see (a radius from CSS). */
      refresh() { lastKey = ''; apply(); },
      pause() {}, resume() {},
      destroy() {
        if (destroyed) return;
        destroyed = true;
        observer?.disconnect();
        observer = null;
        border?.svg.remove();
        border = null;
        restore();
      }
    };
  },
  // The shape is not motion — there is nothing to reduce. It stays exactly as
  // it is under `prefers-reduced-motion`.
  reduced(el, opts) { return this.create(el, opts); }
};
