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
