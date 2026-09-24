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
 * `depth` is how far in from the rim the bevel reaches. Inside that band the
 * backdrop is pushed along the inward normal, hardest right at the rim and
 * fading to nothing at `depth` — which is what a thick edge does to whatever is
 * behind it. Past the band nothing moves, so the middle of the pane stays
 * honest and only the border reads as glass.
 */
export function buildDisplacementMap(context, width, height, radius, depth) {
  const image = context.createImageData(width, height);
  const band = Math.max(1, depth);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const inside = -roundedRectDistance(x + 0.5, y + 0.5, width, height, radius);
      // `t` runs 1 at the rim to 0 at the inner edge of the bevel. A rounded
      // profile keeps the lens visible across the band instead of reducing
      // the bend to a hairline; the interior remains neutral.
      const t = inside <= 0 || inside >= band ? 0 : 1 - inside / band;
      const amount = Math.sin(t * Math.PI / 2);
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
