// Liquid glass — the material iOS 26 is built out of, as far as a browser can
// take it.
//
// Four things make a pane read as glass rather than as a blurred rectangle,
// and they degrade in that order as browser support runs out:
//
//   1. the backdrop is blurred and its colour is pushed  (backdrop-filter)
//   2. a bright rim runs along the lit edge and fades away round the back
//   3. a soft sheen sits inside the top of the pane
//   4. what is behind BENDS at the rim, the way it does through a real bevel
//
// Only the fourth needs something not every engine has: an SVG filter used as
// a `backdrop-filter`, which today is Chromium only. The first three are plain
// CSS and carry the look on their own, which is why they are not optional.
//
// The bend is a displacement map: one pixel per pixel of the pane, where the
// red and green channels say how far to pull the backdrop sideways and down.
// 128 means "leave it alone", so the middle of the pane is flat grey and only a
// band along the rim carries a value.
import { CORNER_SHAPES, shapeK } from './superellipse.js';

export const NEUTRAL = 128;

// The bevel never reaches past this share of the pane's half-thickness. A 52px
// pill with an 18px bevel used to be bent across 70% of its height, which left
// no clear centre and read as a smeared copy of the backdrop.
const BAND_LIMIT = 0.6;
// How far the rim looks inward, as a share of the bevel band. The rim shows
// what is LENS_PULL × band inside it, magnified by 1 / (1 − 2 × LENS_PULL)
// (about 6× here); the magnification falls smoothly to 1 at the inner edge.
const LENS_PULL = 0.42;

/** How far in from the rim the bevel reaches, in px, for a pane of this size. */
export function bevelBand(width, height, depth) {
  return Math.max(1, Math.min(Number(depth) || 1, (Math.min(width, height) / 2) * BAND_LIMIT));
}

/** The feDisplacementMap `scale` that pairs with a map built for `band`. */
export function displacementScale(band) {
  // feDisplacementMap moves by scale × (channel/255 − 0.5), so a full-strength
  // channel moves half the scale: the rim moves exactly LENS_PULL × band.
  return 2 * LENS_PULL * band;
}

/** Signed distance to the edge of a rounded rectangle: negative inside. */
export function roundedRectDistance(x, y, width, height, radius) {
  const r = Math.max(0, Math.min(radius, Math.min(width, height) / 2));
  const qx = Math.abs(x - width / 2) - (width / 2 - r);
  const qy = Math.abs(y - height / 2) - (height / 2 - r);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}

/**
 * Signed distance to a rounded rectangle whose corners follow the superellipse
 * `x^n + y^n = 1` with n = 2^k (CSS `corner-shape: superellipse(k)`; the
 * squircle is k = 2). k = 1 is the ordinary round corner. Concave shapes
 * (k ≤ 0: bevel, scoop, notch) are approximated by the round corner — the lens
 * only needs the rim's direction, and those are rare on glass.
 * Exact on the outline, a close approximation of distance near it.
 */
export function cornerShapeDistance(x, y, width, height, radius, k = 1) {
  if (!(k > 1)) return roundedRectDistance(x, y, width, height, radius);
  const r = Math.max(0, Math.min(radius, Math.min(width, height) / 2));
  if (r === 0) return roundedRectDistance(x, y, width, height, 0);
  const qx = Math.abs(x - width / 2) - (width / 2 - r);
  const qy = Math.abs(y - height / 2) - (height / 2 - r);
  if (qx <= 0 || qy <= 0) return Math.max(qx, qy) - r;
  const n = 2 ** Math.min(k, 12);
  const s = ((qx / r) ** n + (qy / r) ** n) ** (1 / n);
  return r * (s - 1);
}

/**
 * The corner exponent K of a pane: CSS `corner-shape` when the browser draws it
 * (the Squircle module's native path), otherwise the Squircle module's own
 * markup (its clip-path polyfill), otherwise 1 (round).
 */
export function paneCornerK(el, cornerShapeValue, squircleOptions = {}) {
  const value = String(cornerShapeValue || '').trim();
  const numeric = value.match(/^superellipse\(\s*(-?[\d.]+|infinity|-infinity)\s*\)/i);
  if (numeric) return shapeK(null, /infinity/i.test(numeric[1]) ? (numeric[1].startsWith('-') ? -Infinity : Infinity) : Number(numeric[1]));
  const keyword = value.split(/\s+/)[0];
  if (CORNER_SHAPES.includes(keyword)) return shapeK(keyword);
  if (el && el.hasAttribute && el.hasAttribute('data-kt-squircle')) {
    const preset = squircleOptions.preset || el.getAttribute('data-kt-squircle') || 'squircle';
    return shapeK(CORNER_SHAPES.includes(preset) ? preset : 'squircle', squircleOptions.superellipse ?? el.getAttribute('data-kt-superellipse'));
  }
  return 1;
}

/**
 * The displacement map for one pane, as ImageData.
 *
 * `band` is how far in from the rim the bevel reaches (see bevelBand()). Inside
 * that band each pixel shows the backdrop from a little further in — the way a
 * convex edge bends a ray toward the centre — so what is behind the rim appears
 * magnified. Past the band nothing moves, so the middle of the pane stays clear.
 *
 * The shape of that pull is what separates glass from a smear. The pull is
 * (1 − u)² at a distance u·band from the rim: largest at the rim, and with zero
 * SLOPE at the inner edge, so the magnified band meets the clear centre without
 * a seam. The old profile, sin(π/2 · (1 − u)), had its steepest slope exactly
 * there and stretched a sliver of backdrop about 17× across the band's inner
 * edge — the "cheap copy" look.
 */
export function buildDisplacementMap(context, width, height, radius, bandWidth) {
  const image = context.createImageData(width, height);
  const band = Math.max(1, bandWidth);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const inside = -roundedRectDistance(x + 0.5, y + 0.5, width, height, radius);
      // `t` runs 1 at the rim to 0 at the inner edge of the bevel.
      const t = inside <= 0 || inside >= band ? 0 : 1 - inside / band;
      const amount = t * t;
      const index = (y * width + x) * 4;
      if (amount === 0) {
        image.data[index] = NEUTRAL;
        image.data[index + 1] = NEUTRAL;
      } else {
        // The gradient of the distance field is the surface normal, by
        // definition — no need to special-case corners against edges.
        const gx = (roundedRectDistance(x + 1.5, y + 0.5, width, height, radius)
          - roundedRectDistance(x - 0.5, y + 0.5, width, height, radius)) / 2;
        const gy = (roundedRectDistance(x + 0.5, y + 1.5, width, height, radius)
          - roundedRectDistance(x + 0.5, y - 0.5, width, height, radius)) / 2;
        const length = Math.hypot(gx, gy) || 1;
        image.data[index] = Math.round(NEUTRAL - (gx / length) * amount * 127);
        image.data[index + 1] = Math.round(NEUTRAL - (gy / length) * amount * 127);
      }
      image.data[index + 2] = NEUTRAL;
      image.data[index + 3] = 255;
    }
  }
  return image;
}

// ── Physical lens map (2026-09-27) ─────────────────────────────────────────
//
// The map above is a hand-tuned pull. The one below comes from optics:
//
//   thickness  The pane is a slab whose edge rounds off over the bevel band.
//              At depth d inside the rim (u = d / band) its height is the
//              quarter-circle h(u) = H·√(1 − (1 − u)²): vertical at the rim,
//              flat where the band meets the clear centre.
//   refraction A ray from the viewer meets that surface tilted by θi = atan(h′).
//              Snell's law (n = `ior`) bends it to θt = asin(sin θi / n), and
//              over the thickness T it lands T·tan(θi − θt) further in — so
//              the rim shows the backdrop from further inside, magnified.
//   meniscus   The last ~1.5 px ease off the pull, like the lip of a liquid
//              against a wall, so the rim reads as a thin clean line instead of
//              the most-smeared pixels of the pane. (It stays an inward pull:
//              Chromium cannot sample the backdrop outside the element's box.)
//
// The blue channel carries the normalised height. The filter lights that
// height field (feSpecularLighting), so the highlight follows the real shape.
const MAX_INCIDENCE = (80 * Math.PI) / 180; // a vertical tangent would send the ray to infinity
const MENISCUS_WIDTH = 1.5;
const MENISCUS_DEPTH = 0.35;
const MAP_CACHE_SIZE = 16;
const mapCache = new Map();
let scratch = null;

/** Height of the rounded edge at u ∈ [0, 1] (0 = rim, 1 = inner edge of the band). */
export function thicknessProfile(u) {
  const v = Math.min(1, Math.max(0, u));
  return Math.sqrt(1 - (1 - v) * (1 - v));
}

/**
 * Lateral travel of a ray through a surface tilted by `slope` (dh/dd), over a
 * thickness `thickness`, for index of refraction `ior`. Grows with the slope and
 * with the index; zero on a flat surface or for n = 1 (air).
 */
export function snellOffset(slope, thickness, ior) {
  const incidence = Math.min(MAX_INCIDENCE, Math.atan(Math.abs(slope)));
  const n = Math.max(1, Number(ior) || 1);
  const refracted = Math.asin(Math.sin(incidence) / n);
  return Math.max(0, thickness) * Math.tan(incidence - refracted);
}

/**
 * Build the physical lens map for a pane: `{ image, scale }`, where `image` is
 * ImageData at `dpr` × the pane's CSS size and `scale` is the matching
 * feDisplacementMap scale in CSS px. R/G carry the travel (128 = none), B the
 * normalised height, A stays opaque (premultiplication would corrupt R/G).
 */
export function buildGlassMap(context, width, height, radius, { band, ior = 1.5, dpr = 1, k = 1 } = {}) {
  // Squircle / superellipse corners: the lens follows the pane's real outline.
  const dist = (px, py, pw, ph, pr) => cornerShapeDistance(px, py, pw, ph, pr, k);
  const w = Math.max(1, Math.round(width * dpr));
  const h = Math.max(1, Math.round(height * dpr));
  const bevel = Math.max(1, band);
  // The slab is 1.5× as thick as its bevel is wide (a deeper edge is a thicker
  // piece of glass and bends more); the ray crosses the local edge height plus
  // a quarter of the slab below it before it reaches the back plane.
  const H = bevel * 1.5;
  const travel = new Float32Array(w * h * 2);
  const heights = new Float32Array(w * h);
  let max = 0;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const px = (x + 0.5) / dpr;
      const py = (y + 0.5) / dpr;
      const inside = -dist(px, py, width, height, radius);
      const cell = y * w + x;
      if (inside <= 0) continue;
      if (inside >= bevel) { heights[cell] = 1; continue; }
      const u = inside / bevel;
      const profile = thicknessProfile(u);
      heights[cell] = profile;
      // dh/dd for h = H·√(1 − (1 − u)²):  H·(1 − u) / (band·√(1 − (1 − u)²))
      const slope = profile > 1e-6 ? (H * (1 - u)) / (bevel * profile) : Infinity;
      let amount = snellOffset(slope, H * profile + H * 0.25, ior);
      if (inside < MENISCUS_WIDTH) amount -= amount * MENISCUS_DEPTH * (1 - inside / MENISCUS_WIDTH) * 2;
      const gx = (dist(px + 0.5, py, width, height, radius) - dist(px - 0.5, py, width, height, radius));
      const gy = (dist(px, py + 0.5, width, height, radius) - dist(px, py - 0.5, width, height, radius));
      const length = Math.hypot(gx, gy) || 1;
      // Inward = against the outward gradient of the distance field.
      travel[cell * 2] = (-gx / length) * amount;
      travel[cell * 2 + 1] = (-gy / length) * amount;
      max = Math.max(max, Math.abs(travel[cell * 2]), Math.abs(travel[cell * 2 + 1]));
    }
  }
  const limit = Math.max(0.5, max);
  const image = context.createImageData(w, h);
  for (let cell = 0; cell < w * h; cell += 1) {
    const index = cell * 4;
    image.data[index] = Math.round(NEUTRAL + (travel[cell * 2] / limit) * 127);
    image.data[index + 1] = Math.round(NEUTRAL + (travel[cell * 2 + 1] / limit) * 127);
    image.data[index + 2] = Math.round(heights[cell] * 255);
    image.data[index + 3] = 255;
  }
  // feDisplacementMap moves by scale × (c/255 − 0.5): ±127 → ±limit.
  return { image, scale: 2 * limit };
}

/**
 * The lens map as a data URL, cached by geometry (identical cards share one
 * encode) and drawn on one shared scratch canvas.
 */
export function glassMapUrl(width, height, radius, params) {
  const dpr = Math.min(2, Math.max(1, params.dpr || 1));
  const key = `${width}x${height}|${radius.toFixed(1)}|${params.band.toFixed(2)}|${params.ior}|${dpr}|${params.k ?? 1}`;
  const hit = mapCache.get(key);
  if (hit) { mapCache.delete(key); mapCache.set(key, hit); return hit; }
  if (typeof document === 'undefined') return null;
  scratch ||= document.createElement('canvas');
  const context = scratch.getContext('2d');
  if (!context) return null;
  const { image, scale } = buildGlassMap(context, width, height, radius, { ...params, dpr });
  scratch.width = image.width;
  scratch.height = image.height;
  context.putImageData(image, 0, 0);
  const entry = { href: scratch.toDataURL(), scale };
  mapCache.set(key, entry);
  if (mapCache.size > MAP_CACHE_SIZE) mapCache.delete(mapCache.keys().next().value);
  return entry;
}

/** Number of cached lens maps (for tests: the cache must stay bounded). */
export const glassMapCacheSize = () => mapCache.size;

/**
 * The refraction filter graph (Chromium's SVG backdrop-filter), in order:
 *   frost    blur the backdrop BEFORE bending it — blurring after the bend (the
 *            old `url() blur()` order) smeared the bend away
 *   bend     three displacements, one per colour, at slightly different
 *            strengths: chromatic dispersion, the rainbow fringe of real glass
 *   colour   saturate the refracted image
 *   light    a specular highlight computed from the height field, lit from
 *            the pointer's side (the azimuth is updated as it moves)
 * All ids are prefixed with the filter id, so panes never share a result name.
 */
export function glassFilterMarkup(id, { blur, saturate, dispersion, specular, surface }) {
  const d = Math.max(0, Math.min(0.5, Number(dispersion) || 0));
  const channel = (name, scaleFactor, row) => `<feDisplacementMap in="frost" in2="map" scale="0" data-kt-scale="${scaleFactor}" xChannelSelector="R" yChannelSelector="G" result="${name}-raw"/>`
    + `<feColorMatrix in="${name}-raw" type="matrix" values="${row}" result="${name}"/>`;
  return `<filter id="${id}" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%">`
    + '<feImage x="0" y="0" preserveAspectRatio="none" result="map"/>'
    + `<feGaussianBlur in="SourceGraphic" stdDeviation="${Math.max(0, Number(blur) || 0)}" edgeMode="duplicate" result="frost"/>`
    + channel('r', 1 + d, '1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0')
    + channel('g', 1, '0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0')
    + channel('b', 1 - d, '0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0')
    + '<feComposite in="r" in2="g" operator="arithmetic" k2="1" k3="1" result="rg"/>'
    + '<feComposite in="rg" in2="b" operator="arithmetic" k2="1" k3="1" result="bent"/>'
    + `<feColorMatrix in="bent" type="saturate" values="${Math.max(0, Number(saturate) || 0)}" result="coloured"/>`
    + '<feColorMatrix in="map" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0" result="height"/>'
    + `<feSpecularLighting in="height" surfaceScale="${Math.max(0, Number(surface) || 0).toFixed(2)}" specularConstant="1" specularExponent="36" lighting-color="#fff" result="spec">`
    + '<feDistantLight azimuth="225" elevation="28"/></feSpecularLighting>'
    + `<feComposite in="coloured" in2="spec" operator="arithmetic" k2="1" k3="${Math.max(0, Math.min(1, Number(specular) || 0))}"/>`
    + '</filter>';
}

/**
 * The bevel's light and shade, as a `box-shadow` list, for light arriving from
 * the direction (lx, ly) — a unit vector from the pane's centre toward the light.
 *
 * A real glass edge catches light twice: brightly on the side facing the
 * light, and faintly on the opposite inner edge where the light leaves again.
 * An inset shadow shows on the edge OPPOSITE its offset, hence the signs. The
 * last entry is a soft inner glow the width of the bevel: the thickness.
 */
export function bevelShading(lx, ly, band) {
  const near = `${(-lx * 2).toFixed(2)}px ${(-ly * 2).toFixed(2)}px 2px -1px rgba(255,255,255,.55)`;
  const far = `${(lx * 2).toFixed(2)}px ${(ly * 2).toFixed(2)}px 2px -1px rgba(255,255,255,.2)`;
  return `inset ${near},inset ${far},inset 0 0 ${Math.round(band * 0.8)}px rgba(255,255,255,.08)`;
}

/** True when this engine can use an SVG filter as a `backdrop-filter`. */
export function supportsBackdropRefraction() {
  // CSS.supports only checks syntax: Gecko/WebKit accept url() without
  // compositing SVG backdrop filters. Keep their working CSS blur fallback.
  return typeof navigator !== 'undefined' && /(?:Chrome|Chromium|Edg)\//.test(navigator.userAgent)
    && typeof CSS !== 'undefined' && typeof CSS.supports === 'function'
    && CSS.supports('backdrop-filter', 'url(#kt-glass-probe)');
}

/** True when the engine can blur a backdrop at all — the floor for the look. */
export function supportsBackdrop() {
  return typeof CSS !== 'undefined' && typeof CSS.supports === 'function'
    && (CSS.supports('backdrop-filter', 'blur(4px)') || CSS.supports('-webkit-backdrop-filter', 'blur(4px)'));
}
