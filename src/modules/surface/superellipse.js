// Superellipse corner geometry — the maths behind CSS `corner-shape`, so the
// same shape can be drawn where the browser does not have that property yet.
//
// A corner is one quadrant of the curve `x^n + y^n = 1`, and CSS names the
// exponent indirectly: `superellipse(K)` means `n = 2^K`. That one line is what
// makes every keyword fall out of a single formula:
//
//   K →  ∞   n → ∞     square   (the corner stays a right angle)
//   K =  2   n = 4     squircle (Apple's corner: flatter sides, tighter turn)
//   K =  1   n = 2     round    (an ordinary circle — plain border-radius)
//   K =  0   n = 1     bevel    (a straight diagonal cut)
//   K = -1   n = 0.5   scoop    (the same curve mirrored: it bites inwards)
//   K → -∞   n → 0     notch    (a square bite)
//
// Measured against Chromium's own `corner-shape` (2026-09-20): the outline this
// file produces is the exact analytic curve — for `bevel`, where the answer is a
// known straight line, it lands on it to the sampling step.
export const CORNER_SHAPES = Object.freeze(['squircle', 'round', 'bevel', 'scoop', 'notch', 'square']);

/** CSS's own K for each keyword; `superellipse(K)` is the general form. */
const SHAPE_K = Object.freeze({
  square: Infinity,
  squircle: 2,
  round: 1,
  bevel: 0,
  scoop: -1,
  notch: -Infinity
});

// ±Infinity would give n = ∞ or 0, and `Math.pow(cos, 2/n)` then returns 0 or 1
// with no curve in between. These stand in for the two ends: far enough that the
// corner is visually square (or a square bite) while every sample stays finite.
const K_LIMIT = 12;

/**
 * The K for a shape name or a numeric override, clamped to where the sampling
 * still produces a curve. Anything unrecognised falls back to the squircle,
 * which is what the module exists to draw.
 */
export function shapeK(shape, smoothing) {
  const k = Number.isFinite(Number(smoothing)) ? Number(smoothing) : SHAPE_K[shape] ?? SHAPE_K.squircle;
  return Math.max(-K_LIMIT, Math.min(K_LIMIT, k));
}

/**
 * How a corner is walked, for one K.
 *
 * A positive K is the superellipse itself: `u = cos(φ)^(2/n)`, `v = sin(φ)^(2/n)`
 * with `n = 2^K`, where u and v measure from the corner's centre towards the
 * corner. Squaring and adding gives `u^n + v^n = 1` — the curve, by definition.
 *
 * A negative K is NOT that formula with a fractional exponent. CSS defines it
 * as the MIRROR of the positive curve for |K| (its own words: "a negative
 * superellipse is symmetrical to a superellipse with its inverse K value"), and
 * the two are genuinely different shapes: measured against Chromium's own
 * `corner-shape: scoop`, the mirrored curve meets the 45° diagonal at 70.7% of
 * the radius and the fractional-exponent one at 75%. So a concave corner
 * reflects the convex one about the line `u + v = 1`, which is the map
 * `(u, v) → (1 − v, 1 − u)`.
 */
export function cornerProfile(k) {
  const power = 2 / Math.pow(2, Math.abs(k));
  const concave = k < 0;
  // `at(step, steps)` rather than `at(angle)`: the two ends of a quadrant have
  // to be EXACT. `Math.cos(Math.PI / 2)` is 6.1e-17, not 0, and raising that to
  // a tiny power gives 0.98 — so at the extremes (square, notch) the curve
  // stopped 98% short of its own endpoint and the outline collapsed into a bar.
  // Taking the step index lets the first and last samples be written down
  // instead of computed, which is also simply the truth about where they are.
  return {
    concave,
    at(step, steps) {
      const cos = step === 0 ? 1 : step === steps ? 0 : Math.cos((step / steps) * (Math.PI / 2));
      const sin = step === 0 ? 0 : step === steps ? 1 : Math.sin((step / steps) * (Math.PI / 2));
      return concave
        ? [1 - Math.pow(sin, power), 1 - Math.pow(cos, power)]
        : [Math.pow(cos, power), Math.pow(sin, power)];
    }
  };
}

/**
 * Where a corner's outline meets the 45° diagonal, as a fraction of the radius.
 * Exact, and the cheapest way to say which shape something is: 0.159 squircle,
 * 0.293 round, 0.5 bevel, 0.707 scoop.
 */
export function diagonalFraction(k) {
  return k >= 0
    ? 1 - Math.pow(2, -1 / Math.pow(2, k))
    : Math.pow(2, -1 / Math.pow(2, -k));
}



/**
 * One corner quadrant, as points, going clockwise around the box.
 *
 * `cx/cy` is the centre the corner turns around (inset by its radii), `dirX/dirY`
 * point from that centre towards the corner itself, and `reverse` walks the
 * quadrant the other way — the top-right and bottom-left corners are entered
 * from their curved end.
 */
function quadrant(points, cx, cy, rx, ry, dirX, dirY, reverse, profile, samples) {
  for (let step = 0; step <= samples; step += 1) {
    const [u, v] = profile.at(reverse ? samples - step : step, samples);
    points.push([cx + dirX * rx * u, cy + dirY * ry * v]);
  }
}

/**
 * CSS's overlap rule: when two radii on one side add up to more than that side,
 * every radius shrinks by the same factor. Without this a 40px radius on a 50px
 * box draws a corner that runs past the middle and the outline crosses itself.
 */
export function fitRadii(radii, width, height) {
  const [tl, tr, br, bl] = radii;
  const factor = Math.min(
    1,
    width / Math.max(1e-6, tl + tr),
    width / Math.max(1e-6, bl + br),
    height / Math.max(1e-6, tl + bl),
    height / Math.max(1e-6, tr + br)
  );
  return radii.map((radius) => Math.max(0, radius * factor));
}

/**
 * The outline of a `width × height` box with superellipse corners, as points in
 * CSS pixels, clockwise from the top-left corner's straight edge.
 *
 * `samples` is per corner: the chord error of a polyline is about
 * r·(1−cos(π/4/samples)), so 24 samples on a 100px corner is ~0.05px — already
 * below a device pixel, and the default scales with the radius.
 */
export function superellipseOutline(width, height, radii, k, samples) {
  const [tl, tr, br, bl] = fitRadii(radii, width, height);
  const steps = Math.max(2, Math.round(samples ?? Math.min(48, Math.max(8, Math.ceil(Math.max(tl, tr, br, bl) / 2)))));
  const profile = cornerProfile(k);
  const points = [];
  quadrant(points, tl, tl, tl, tl, -1, -1, false, profile, steps);
  quadrant(points, width - tr, tr, tr, tr, +1, -1, true, profile, steps);
  quadrant(points, width - br, height - br, br, br, +1, +1, false, profile, steps);
  quadrant(points, bl, height - bl, bl, bl, -1, +1, true, profile, steps);
  return points;
}

/** The outline as a `clip-path: polygon(...)` value. */
export function outlinePolygon(width, height, radii, k, samples) {
  const points = superellipseOutline(width, height, radii, k, samples);
  return `polygon(${points.map(([x, y]) => `${x.toFixed(2)}px ${y.toFixed(2)}px`).join(',')})`;
}

/** The same outline as an SVG path, for drawing a border along it. */
export function outlinePath(width, height, radii, k, samples) {
  const points = superellipseOutline(width, height, radii, k, samples);
  const [first, ...rest] = points;
  return `M${first[0].toFixed(2)} ${first[1].toFixed(2)}${rest.map(([x, y]) => `L${x.toFixed(2)} ${y.toFixed(2)}`).join('')}Z`;
}
