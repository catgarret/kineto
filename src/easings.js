// Central easing subsystem (audit C / J-3, spring system 2026-09-27).
//
// Honesty rules this module enforces:
//  • Sine…Back are the real easings.net cubic-beziers.
//  • Elastic and Bounce CANNOT be a single cubic-bezier, so they are emitted as
//    CSS `linear()` functions sampled from their true JS curves — not a fake
//    bezier lookalike.
//  • `spring` is a REAL damped-harmonic spring (stiffness, damping, mass,
//    velocity), also emitted as `linear()`. It is never conflated with the
//    overshoot cubic-bezier that other libraries mislabel "spring".
//  • Apple presets carry Apple's published numbers, not lookalikes:
//      spring-smooth / spring-snappy / spring-bouncy — SwiftUI `Spring.smooth`,
//        `.snappy`, `.bouncy`: duration 0.5 s, bounce 0 / 0.15 / 0.3
//      spring-apple — SwiftUI `Animation.default` (iOS 17+): response 0.55,
//        dampingFraction 1.0
//      spring-interactive — `interactiveSpring()`: response 0.15, dampingFraction 0.86
//      spring-classic — `spring(response:dampingFraction:)` defaults 0.5 / 0.825
//      apple-standard / apple-decelerate / apple-header — the three curves the
//        apple.com product pages use most (measured from their stylesheets)
//      apple-ease-in-out — Core Animation `easeInEaseOut` (SwiftUI easeInOut, 0.35 s)
//    Conversion (SwiftUI `Spring` docs: duration 0.5 + bounce 0.3 → mass 1,
//    stiffness 157.9, damping 17.6):
//      stiffness = (2π / duration)²,  damping = 4π(1 − bounce) / duration  (bounce ≥ 0)
//      damping   = 4π / (duration · (1 + bounce))                           (bounce < 0)
//      response/dampingFraction: stiffness = (2π / response)², damping = 4π·ζ / response
//
// Accepted specs everywhere (`toCSS`, `fn`, `gsapEase`, `springDuration`):
//   'ease-out', 'sine-in', 'elastic-out', 'apple-standard'   named tokens
//   'spring', 'spring-snappy'                                 spring presets
//   'spring-bouncy(0.6s)', 'spring-snappy(0.4s, 0.1)'         preset + duration (+ extra bounce)
//   'spring(0.5s, 0.3)', 'spring(400ms)'                      Apple duration/bounce form
//   'spring(170, 26)', 'spring(100, 8, 1, 0)'                 physics form (stiffness, damping, mass, velocity)
//   {spring:{stiffness,damping,mass,velocity}} | {spring:{duration,bounce}} | {spring:{response,dampingFraction}}
//   'cubic-bezier(…)', 'linear(…)', 'steps(…)'                raw CSS (passed through / evaluated in JS)
//   [x1, y1, x2, y2]                                           bezier array

const TAU = Math.PI * 2;
const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

// ── easings.net cubic-beziers (single-bezier families) ─────────────────────
export const CUBIC_BEZIERS = {
  'sine-in': [0.12, 0, 0.39, 0], 'sine-out': [0.61, 1, 0.88, 1], 'sine-in-out': [0.37, 0, 0.63, 1],
  'quad-in': [0.11, 0, 0.5, 0], 'quad-out': [0.5, 1, 0.89, 1], 'quad-in-out': [0.45, 0, 0.55, 1],
  'cubic-in': [0.32, 0, 0.67, 0], 'cubic-out': [0.33, 1, 0.68, 1], 'cubic-in-out': [0.65, 0, 0.35, 1],
  'quart-in': [0.5, 0, 0.75, 0], 'quart-out': [0.25, 1, 0.5, 1], 'quart-in-out': [0.76, 0, 0.24, 1],
  'quint-in': [0.64, 0, 0.78, 0], 'quint-out': [0.22, 1, 0.36, 1], 'quint-in-out': [0.83, 0, 0.17, 1],
  'expo-in': [0.7, 0, 0.84, 0], 'expo-out': [0.16, 1, 0.3, 1], 'expo-in-out': [0.87, 0, 0.13, 1],
  'circ-in': [0.55, 0, 1, 0.45], 'circ-out': [0, 0.55, 0.45, 1], 'circ-in-out': [0.85, 0, 0.15, 1],
  // Back overshoots the [0,1] range — a legitimate single cubic-bezier.
  'back-in': [0.36, 0, 0.66, -0.56], 'back-out': [0.34, 1.56, 0.64, 1], 'back-in-out': [0.68, -0.6, 0.32, 1.6],
};

// Apple's own curves. apple-standard/decelerate/header were counted in the
// apple.com product-page stylesheets (standard ≈ 270 uses at .24–.32 s,
// decelerate ≈ 95, header ≈ 13 — the global navigation); apple-ease-in-out is
// Core Animation's kCAMediaTimingFunctionEaseInEaseOut.
export const APPLE_BEZIERS = {
  'apple-standard': [0.4, 0, 0.6, 1],
  'apple-decelerate': [0, 0, 0.2, 1],
  'apple-header': [0.25, 0.1, 0.3, 1],
  'apple-ease-in-out': [0.42, 0, 0.58, 1],
};

export const CSS_KEYWORDS = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'];
// CSS keyword control points, so JS paths (GSAP/rAF) honour the same curve.
const KEYWORD_BEZIERS = {
  ease: [0.25, 0.1, 0.25, 1], 'ease-in': [0.42, 0, 1, 1], 'ease-out': [0, 0, 0.58, 1], 'ease-in-out': [0.42, 0, 0.58, 1],
};

// ── True JS easing functions for the non-bezier families ───────────────────
const outElastic = (t) => (t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (TAU / 3)) + 1);
const inElastic = (t) => (t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * (TAU / 3)));
const inOutElastic = (t) => (t === 0 ? 0 : t === 1 ? 1
  : t < 0.5 ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * (TAU / 4.5))) / 2
    : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * (TAU / 4.5))) / 2 + 1);
const outBounce = (t) => {
  const n = 7.5625; const d = 2.75;
  if (t < 1 / d) return n * t * t;
  if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
  if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
  return n * (t -= 2.625 / d) * t + 0.984375;
};
const inBounce = (t) => 1 - outBounce(1 - t);
const inOutBounce = (t) => (t < 0.5 ? (1 - outBounce(1 - 2 * t)) / 2 : (1 + outBounce(2 * t - 1)) / 2);

export const JS_EASINGS = {
  'elastic-in': inElastic, 'elastic-out': outElastic, 'elastic-in-out': inOutElastic,
  'bounce-in': inBounce, 'bounce-out': outBounce, 'bounce-in-out': inOutBounce,
};

// ── Spring parameter models ────────────────────────────────────────────────

/** SwiftUI `Spring(duration:bounce:)` → physics. duration in seconds, bounce −1…1. */
export function springFromDuration(duration = 0.5, bounce = 0) {
  const d = clamp(Number(duration) || 0.5, 0.01, 10);
  const b = clamp(Number(bounce) || 0, -1, 0.99);
  const stiffness = (TAU / d) ** 2;
  const damping = b >= 0 ? (2 * TAU * (1 - b)) / d : (2 * TAU) / (d * (1 + b));
  return { stiffness, damping, mass: 1, velocity: 0 };
}

/** SwiftUI `spring(response:dampingFraction:)` → physics. */
export function springFromResponse(response = 0.5, dampingFraction = 0.825) {
  const r = clamp(Number(response) || 0.5, 0.01, 10);
  const zeta = clamp(Number(dampingFraction), 0, 4);
  return { stiffness: (TAU / r) ** 2, damping: (2 * TAU * zeta) / r, mass: 1, velocity: 0 };
}

// Named spring presets. `spring` keeps Kineto's historical 170/26 so existing
// pages do not change; the rest are Apple's published presets (see header).
const APPLE_PRESET_BOUNCE = { 'spring-smooth': 0, 'spring-snappy': 0.15, 'spring-bouncy': 0.3 };
export const SPRING_PRESETS = {
  spring: { stiffness: 170, damping: 26, mass: 1, velocity: 0 },
  'spring-smooth': springFromDuration(0.5, APPLE_PRESET_BOUNCE['spring-smooth']),
  'spring-snappy': springFromDuration(0.5, APPLE_PRESET_BOUNCE['spring-snappy']),
  'spring-bouncy': springFromDuration(0.5, APPLE_PRESET_BOUNCE['spring-bouncy']),
  'spring-apple': springFromResponse(0.55, 1),
  'spring-interactive': springFromResponse(0.15, 0.86),
  'spring-classic': springFromResponse(0.5, 0.825),
};

// A CSS time ("0.5s", "400ms") → seconds, or null when the token has no unit.
function timeSeconds(token) {
  const m = String(token).trim().match(/^(-?\d*\.?\d+)(ms|s)$/i);
  if (!m) return null;
  return m[2].toLowerCase() === 'ms' ? Number(m[1]) / 1000 : Number(m[1]);
}

function normalizePhysics(p) {
  const out = {
    stiffness: Number(p.stiffness), damping: Number(p.damping),
    mass: p.mass == null ? 1 : Number(p.mass), velocity: p.velocity == null ? 0 : Number(p.velocity),
  };
  if (![out.stiffness, out.damping, out.mass, out.velocity].every(Number.isFinite)) return null;
  out.stiffness = clamp(out.stiffness, 1, 20000);
  out.damping = clamp(out.damping, 0, 2000);
  out.mass = clamp(out.mass, 0.01, 100);
  out.velocity = clamp(out.velocity, -100, 100);
  return out;
}

function physicsFromObject(o) {
  if (!o || typeof o !== 'object') return null;
  if (o.stiffness != null || o.damping != null) {
    return normalizePhysics({ stiffness: 170, damping: 26, ...o });
  }
  if (o.response != null) return springFromResponse(o.response, o.dampingFraction ?? o.dampingRatio ?? 1);
  if (o.duration != null || o.bounce != null) {
    const d = typeof o.duration === 'string' ? timeSeconds(o.duration) ?? Number(o.duration) : o.duration;
    return springFromDuration(d ?? 0.5, o.bounce ?? 0);
  }
  return { ...SPRING_PRESETS.spring };
}

/**
 * Parse any spring spec to physics `{stiffness, damping, mass, velocity}`.
 * Returns null when the spec is not a spring (so callers fall through to
 * curves). Never throws; invalid numbers fall back to safe ranges.
 */
export function parseSpring(spec) {
  if (spec == null) return null;
  if (typeof spec === 'object') {
    if (Array.isArray(spec)) return null;
    if (spec.spring === true) return { ...SPRING_PRESETS.spring };
    if (spec.spring && typeof spec.spring === 'object') return physicsFromObject(spec.spring);
    if (typeof spec.spring === 'string') return parseSpring(spec.spring);
    return null;
  }
  const v = String(spec).trim().toLowerCase();
  if (!v.startsWith('spring')) return null;
  if (SPRING_PRESETS[v]) return { ...SPRING_PRESETS[v] };
  const m = v.match(/^(spring(?:-[a-z]+)?)\(([^)]*)\)$/);
  if (!m) return null;
  const name = m[1];
  const args = m[2].split(/[\s,]+/).filter(Boolean);
  if (args.length > 4) return null;
  // Apple preset with duration / extra bounce: spring-bouncy(0.6s, 0.1)
  if (name in APPLE_PRESET_BOUNCE) {
    const duration = args[0] == null ? 0.5 : timeSeconds(args[0]) ?? Number(args[0]);
    const extra = args[1] == null ? 0 : Number(args[1]);
    if (!Number.isFinite(duration) || !Number.isFinite(extra)) return null;
    return springFromDuration(duration, APPLE_PRESET_BOUNCE[name] + extra);
  }
  if (name !== 'spring') return null;
  // spring(0.5s, 0.3) — first argument carries a time unit → Apple duration/bounce.
  const firstTime = args[0] == null ? null : timeSeconds(args[0]);
  if (firstTime != null) {
    const bounce = args[1] == null ? 0 : Number(args[1]);
    return Number.isFinite(bounce) ? springFromDuration(firstTime, bounce) : null;
  }
  // spring(stiffness, damping[, mass, velocity]) — physics.
  const [stiffness, damping, mass, velocity] = args.map(Number);
  if (args.length < 2) return null;
  return normalizePhysics({ stiffness, damping, mass, velocity });
}

export const isSpring = (spec) => parseSpring(spec) != null;

// ── Real physics spring → position over time ───────────────────────────────
// Solves the damped harmonic oscillator exactly (under/critically/over-damped)
// for a unit step 0 → 1 with initial velocity v0 (in units of travel per second).
function springPosition({ stiffness, damping, mass, velocity }) {
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const v0 = -velocity; // displacement starts at −1 (x = pos − 1); positive velocity moves toward the target
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    const B = (zeta * w0 + v0) / wd;
    return (t) => 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + B * Math.sin(wd * t));
  }
  if (zeta === 1) return (t) => 1 - Math.exp(-w0 * t) * (1 + (w0 + v0) * t);
  const wd = w0 * Math.sqrt(zeta * zeta - 1);
  const B = (zeta * w0 + v0) / wd;
  return (t) => 1 - Math.exp(-zeta * w0 * t) * (Math.cosh(wd * t) + B * Math.sinh(wd * t));
}

const SETTLE_EPSILON = 0.001;   // "at rest" once within 0.1% of the travel for good
const SETTLE_STEP = 0.001;      // 1 ms scan
const SETTLE_MAX = 10;          // seconds — an undamped spring never rests
const settleCache = new Map();
const physicsKey = (p) => `${p.stiffness}|${p.damping}|${p.mass}|${p.velocity}`;

function settleSeconds(physics) {
  const key = physicsKey(physics);
  if (settleCache.has(key)) return settleCache.get(key);
  const pos = springPosition(physics);
  const { stiffness, damping, mass, velocity } = physics;
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  let last = 0;
  if (zeta > 0 && zeta < 1) {
    // Under-damped: the envelope C·e^(−ζω₀t) bounds the error, so every time
    // after the envelope drops below ε is at rest. Scan back from there.
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    const B = (zeta * w0 - velocity) / wd;
    const envelopeRest = Math.log(Math.sqrt(1 + B * B) / SETTLE_EPSILON) / (zeta * w0);
    for (let t = Math.min(SETTLE_MAX, envelopeRest); t > 0; t -= SETTLE_STEP) {
      if (Math.abs(1 - pos(t)) > SETTLE_EPSILON) { last = t; break; }
    }
  } else if (zeta === 0) {
    last = SETTLE_MAX; // undamped never rests
  } else {
    // Critically/over-damped: at most one crossing, then a monotone approach.
    for (let t = 0; t <= SETTLE_MAX; t += SETTLE_STEP) {
      if (Math.abs(1 - pos(t)) > SETTLE_EPSILON) last = t;
      else if (t - last > 0.1) break;
    }
  }
  const seconds = clamp(last + SETTLE_STEP, 0.05, SETTLE_MAX);
  if (settleCache.size > 128) settleCache.delete(settleCache.keys().next().value);
  settleCache.set(key, seconds);
  return seconds;
}

/**
 * Natural duration of a spring spec in seconds (time to rest within 0.1%).
 * Use it as the CSS/WAAPI duration so a spring keeps its real pace; returns
 * null for non-spring specs.
 */
export function springDuration(spec) {
  const physics = parseSpring(spec);
  return physics ? settleSeconds(physics) : null;
}

/**
 * Normalized spring curve: progress 0 → 1 across the spring's settle time.
 * Accepts physics or any spring spec.
 */
export function springFunction(spec = {}) {
  const physics = (spec && spec.stiffness != null) || (spec && spec.damping != null)
    ? normalizePhysics({ stiffness: 170, damping: 26, ...spec })
    : parseSpring(spec) ?? parseSpring({ spring: spec });
  const safe = physics ?? { ...SPRING_PRESETS.spring };
  const pos = springPosition(safe);
  const settle = settleSeconds(safe);
  return (t) => (t <= 0 ? 0 : t >= 1 ? 1 : pos(t * settle));
}

// ── Sampling a JS easing to a CSS linear() string ──────────────────────────

// Legacy uniform sampler (kept for compatibility).
export function toLinear(fn, samples = 40) {
  const pts = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    pts.push(Number(fn(t).toFixed(5)));
  }
  return `linear(${pts.join(',')})`;
}

// Vertical-distance Ramer–Douglas–Peucker: fewest points within `tolerance`.
function simplify(points, tolerance) {
  const keep = new Uint8Array(points.length);
  keep[0] = 1; keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const pa = points[a]; const pb = points[b];
    let max = 0; let idx = -1;
    for (let i = a + 1; i < b; i++) {
      const p = points[i];
      const y = pa.y + ((pb.y - pa.y) * (p.x - pa.x)) / (pb.x - pa.x || 1);
      const d = Math.abs(p.y - y);
      if (d > max) { max = d; idx = i; }
    }
    if (idx > 0 && max > tolerance) { keep[idx] = 1; stack.push([a, idx], [idx, b]); }
  }
  return points.filter((_, i) => keep[i]);
}

const bakeCache = new Map();
/**
 * Bake a JS easing to the smallest CSS `linear()` that stays within
 * `tolerance` of the true curve (default 0.002 of the travel). Overshoot and
 * multiple oscillations survive because linear() points may exceed 1.
 */
export function bakeLinear(fn, { tolerance = 0.002, samples = 480, key = null } = {}) {
  if (key && bakeCache.has(key)) return bakeCache.get(key);
  const points = [];
  for (let i = 0; i <= samples; i++) { const x = i / samples; points.push({ x, y: fn(x) }); }
  const kept = simplify(points, tolerance);
  const round = (n, d) => { const f = 10 ** d; const r = Math.round(n * f) / f; return Object.is(r, -0) ? 0 : r; };
  const body = kept.map((p, i) => {
    if (i === 0) return String(round(p.y, 4));
    if (i === kept.length - 1) return String(round(p.y, 4));
    return `${round(p.y, 4)} ${round(p.x * 100, 2)}%`;
  }).join(', ');
  const css = `linear(${body})`;
  if (key) {
    if (bakeCache.size > 128) bakeCache.delete(bakeCache.keys().next().value);
    bakeCache.set(key, css);
  }
  return css;
}

// x-coordinates of a CSS cubic-bezier MUST be within [0,1]; y may exceed.
export function isValidBezierPoints(p) {
  return Array.isArray(p) && p.length === 4 && p.every((n) => typeof n === 'number' && Number.isFinite(n))
    && p[0] >= 0 && p[0] <= 1 && p[2] >= 0 && p[2] <= 1;
}

const bezierCss = (p) => `cubic-bezier(${p.join(',')})`;
const namedBezier = (low) => CUBIC_BEZIERS[low] || APPLE_BEZIERS[low] || null;

// Registry metadata (drives the demo picker, docs and tests).
export const EASINGS = {
  keywords: CSS_KEYWORDS,
  families: {
    Sine: 'cubic-bezier', Quad: 'cubic-bezier', Cubic: 'cubic-bezier', Quart: 'cubic-bezier',
    Quint: 'cubic-bezier', Expo: 'cubic-bezier', Circ: 'cubic-bezier', Back: 'cubic-bezier',
    Elastic: 'linear', Bounce: 'linear', Spring: 'spring', Apple: 'cubic-bezier', Steps: 'steps',
  },
  springs: Object.keys(SPRING_PRESETS),
  apple: Object.keys(APPLE_BEZIERS),
  tokens: [
    ...CSS_KEYWORDS, ...Object.keys(CUBIC_BEZIERS), ...Object.keys(APPLE_BEZIERS),
    ...Object.keys(JS_EASINGS), ...Object.keys(SPRING_PRESETS), 'steps',
  ],
};

// ── Public resolver: any spec → a valid CSS <easing-function> string ───────
export function toCSS(spec) {
  if (spec == null || spec === '') return 'ease';
  const physics = parseSpring(spec);
  if (physics) return bakeLinear(springFunction(physics), { key: `spring|${physicsKey(physics)}` });
  if (typeof spec === 'object') {
    if (Array.isArray(spec) && isValidBezierPoints(spec)) return bezierCss(spec);
    return 'ease';
  }
  const v = String(spec).trim();
  const low = v.toLowerCase();
  if (CSS_KEYWORDS.includes(low)) return low;
  const bezier = namedBezier(low);
  if (bezier) return bezierCss(bezier);
  if (JS_EASINGS[low]) return bakeLinear(JS_EASINGS[low], { key: low });
  // Pass through already-valid CSS easing syntax.
  if (/^(cubic-bezier|linear|steps)\(/i.test(v)) return v;
  return v; // unknown token — hand back verbatim (module/engine may understand it)
}

// ── CSS easing string → JS function (for GSAP and rAF paths) ───────────────
function parseLinearCss(v) {
  const inner = v.slice(v.indexOf('(') + 1, v.lastIndexOf(')'));
  const raw = inner.split(',').map((s) => s.trim()).filter(Boolean).map((part) => {
    const [y, ...stops] = part.split(/\s+/);
    return { y: Number(y), xs: stops.map((s) => Number.parseFloat(s) / 100) };
  });
  if (!raw.length || raw.some((p) => !Number.isFinite(p.y))) return null;
  const pts = [];
  raw.forEach((p) => { if (p.xs.length) p.xs.forEach((x) => pts.push({ x, y: p.y })); else pts.push({ x: null, y: p.y }); });
  if (pts[0].x == null) pts[0].x = 0;
  if (pts[pts.length - 1].x == null) pts[pts.length - 1].x = 1;
  // Spread missing inputs evenly between known neighbours (CSS spec behaviour).
  for (let i = 1; i < pts.length; i++) {
    if (pts[i].x != null) { pts[i].x = Math.max(pts[i].x, pts[i - 1].x); continue; }
    let j = i; while (pts[j].x == null) j++;
    const start = pts[i - 1].x; const step = (pts[j].x - start) / (j - i + 1);
    for (let k = i; k < j; k++) pts[k].x = start + step * (k - i + 1);
  }
  return (t) => {
    if (t <= pts[0].x) return pts[0].y;
    for (let i = 1; i < pts.length; i++) {
      if (t <= pts[i].x) {
        const a = pts[i - 1]; const b = pts[i];
        return b.x === a.x ? b.y : a.y + ((b.y - a.y) * (t - a.x)) / (b.x - a.x);
      }
    }
    return pts[pts.length - 1].y;
  };
}

function parseStepsCss(v) {
  const m = v.match(/^steps\(\s*(\d+)\s*(?:,\s*([a-z-]+))?\s*\)$/i);
  if (!m) return null;
  const n = Math.max(1, Number(m[1]));
  const pos = (m[2] || 'end').toLowerCase();
  if (pos === 'start' || pos === 'jump-start') return (t) => (t >= 1 ? 1 : Math.min(1, Math.floor(t * n + 1) / n));
  if (pos === 'jump-both') return (t) => (t >= 1 ? 1 : Math.floor(t * n + 1) / (n + 1));
  if (pos === 'jump-none') return (t) => (t >= 1 ? 1 : Math.floor(t * n) / Math.max(1, n - 1));
  return (t) => (t >= 1 ? 1 : Math.floor(t * n) / n);
}

// JS easing function for a spec (for canvas/RAF-driven modules). Understands
// every spec toCSS does, including raw cubic-bezier()/linear()/steps() text.
export function fn(spec) {
  const physics = parseSpring(spec);
  if (physics) return springFunction(physics);
  if (Array.isArray(spec) && isValidBezierPoints(spec)) return cubicBezierFn(...spec);
  const v = String(spec ?? '').trim();
  const low = v.toLowerCase();
  if (JS_EASINGS[low]) return JS_EASINGS[low];
  const bezier = namedBezier(low) || KEYWORD_BEZIERS[low];
  if (bezier) return cubicBezierFn(bezier[0], bezier[1], bezier[2], bezier[3]);
  const cb = low.match(/^cubic-bezier\(([^)]*)\)$/);
  if (cb) {
    const p = cb[1].split(',').map(Number);
    if (isValidBezierPoints(p)) return cubicBezierFn(p[0], p[1], p[2], p[3]);
  }
  if (low.startsWith('linear(')) return parseLinearCss(low) || ((t) => clamp01(t));
  if (low.startsWith('steps(')) return parseStepsCss(low) || ((t) => clamp01(t));
  return (t) => clamp01(t); // linear fallback
}

// Bridge a token to a GSAP ease (for modules that tween with GSAP).
// GSAP has native elastic/bounce/back/etc., so named tokens map to GSAP names.
// Springs, Apple curves and raw cubic-bezier()/linear() — which GSAP cannot
// parse without a plugin — become an ease FUNCTION (GSAP accepts functions),
// so the physics spring is exact instead of an elastic lookalike.
const GSAP_FAMILY = { sine: 'sine', quad: 'power1', cubic: 'power2', quart: 'power3', quint: 'power4', expo: 'expo', circ: 'circ', back: 'back', elastic: 'elastic', bounce: 'bounce' };
export function gsapEase(spec) {
  if (spec == null || spec === '') return undefined;
  if (typeof spec === 'function') return spec;
  if (typeof spec === 'object') return fn(spec);
  if (parseSpring(spec)) return fn(spec);
  const v = String(spec).trim();
  const low = v.toLowerCase();
  if (low === 'linear' || low === 'none') return 'none';
  if (low === 'ease') return 'power1.inOut';
  if (low === 'ease-in') return 'power1.in';
  if (low === 'ease-out') return 'power1.out';
  if (low === 'ease-in-out') return 'power1.inOut';
  if (APPLE_BEZIERS[low] || /^(cubic-bezier|linear|steps)\(/.test(low)) return fn(low);
  const m = low.match(/^([a-z]+)-(in-out|in|out)$/);
  if (m && GSAP_FAMILY[m[1]]) {
    const dir = m[2] === 'in-out' ? 'inOut' : m[2];
    return `${GSAP_FAMILY[m[1]]}.${dir}`;
  }
  return v; // already a GSAP ease name, or something GSAP-specific
}

// Sampled cubic-bezier evaluator (Newton-Raphson on x).
export function cubicBezierFn(x1, y1, x2, y2) {
  const cx = 3 * x1; const bx = 3 * (x2 - x1) - cx; const ax = 1 - cx - bx;
  const cy = 3 * y1; const by = 3 * (y2 - y1) - cy; const ay = 1 - cy - by;
  const sx = (t) => ((ax * t + bx) * t + cx) * t;
  const sy = (t) => ((ay * t + by) * t + cy) * t;
  const dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    let t = x;
    for (let i = 0; i < 8; i++) { const d = dx(t) || 1e-6; t -= (sx(t) - x) / d; }
    return sy(clamp01(t));
  };
}

export default {
  toCSS, fn, gsapEase, EASINGS, CUBIC_BEZIERS, APPLE_BEZIERS, JS_EASINGS, SPRING_PRESETS,
  springFunction, springDuration, parseSpring, springFromDuration, springFromResponse,
  toLinear, bakeLinear, isValidBezierPoints,
};
