// Central easing subsystem (audit C / J-3).
//
// Honesty rules this module enforces:
//  • Sine…Back are the real easings.net cubic-beziers.
//  • Elastic and Bounce CANNOT be a single cubic-bezier, so they are emitted as
//    CSS `linear()` functions sampled from their true JS curves — not a fake
//    bezier lookalike.
//  • `spring` is a REAL damped-harmonic spring (stiffness, damping, mass,
//    velocity), also emitted as `linear()`. It is never conflated with the
//    overshoot cubic-bezier that other libraries mislabel "spring".
//
// `toCSS(spec)` resolves any of: a CSS keyword, a named token ('elastic-out',
// 'bounce-in-out', 'spring', 'sine-in'…), a raw `cubic-bezier(...)`/`linear(...)`
// string, or a spring object `{spring:{stiffness,damping,mass,velocity}}` — to a
// valid CSS <easing-function> string. `fn(spec)` returns the JS easing function.

const TAU = Math.PI * 2;
const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);

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

export const CSS_KEYWORDS = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'];

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

// ── Real physics spring → normalized 0..1 position curve ───────────────────
// Solves a damped harmonic oscillator (critically/under/over-damped) and
// normalizes so the eased value goes 0 → 1 across the settling time.
export function springFunction({ stiffness = 170, damping = 26, mass = 1, velocity = 0 } = {}) {
  const k = Math.max(1, stiffness); const c = Math.max(0, damping); const m = Math.max(0.01, mass); const v0 = velocity;
  const w0 = Math.sqrt(k / m);                 // natural frequency
  const zeta = c / (2 * Math.sqrt(k * m));     // damping ratio
  // Settling time estimate (~ when the envelope decays to ~0.5%).
  const decay = zeta < 1 ? zeta * w0 : w0;
  const settle = Math.min(10, Math.max(0.15, -Math.log(0.005) / (decay || 1)));
  // position(τ) for a unit step from 1 → 0 displacement (we invert to 0→1).
  const pos = (t) => {
    const tau = t * settle;
    if (zeta < 1) {
      const wd = w0 * Math.sqrt(1 - zeta * zeta);
      const A = 1; const B = (zeta * w0 + -v0) / wd;
      return 1 - Math.exp(-zeta * w0 * tau) * (A * Math.cos(wd * tau) + B * Math.sin(wd * tau));
    }
    if (zeta === 1) return 1 - Math.exp(-w0 * tau) * (1 + (w0 - v0) * tau);
    const wd = w0 * Math.sqrt(zeta * zeta - 1);
    const A = 1; const B = (zeta * w0 - v0) / wd;
    return 1 - Math.exp(-zeta * w0 * tau) * (A * Math.cosh(wd * tau) + B * Math.sinh(wd * tau));
  };
  return (t) => (t <= 0 ? 0 : t >= 1 ? 1 : pos(t));
}

// ── Sampling a JS easing to a CSS linear() string ──────────────────────────
export function toLinear(fn, samples = 40) {
  const pts = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    pts.push(Number(fn(t).toFixed(5)));
  }
  return `linear(${pts.join(',')})`;
}

// x-coordinates of a CSS cubic-bezier MUST be within [0,1]; y may exceed.
export function isValidBezierPoints(p) {
  return Array.isArray(p) && p.length === 4 && p.every((n) => typeof n === 'number' && Number.isFinite(n))
    && p[0] >= 0 && p[0] <= 1 && p[2] >= 0 && p[2] <= 1;
}

const bezierCss = (p) => `cubic-bezier(${p.join(',')})`;

// Registry metadata (drives the demo picker, docs and tests).
export const EASINGS = {
  keywords: CSS_KEYWORDS,
  families: {
    Sine: 'cubic-bezier', Quad: 'cubic-bezier', Cubic: 'cubic-bezier', Quart: 'cubic-bezier',
    Quint: 'cubic-bezier', Expo: 'cubic-bezier', Circ: 'cubic-bezier', Back: 'cubic-bezier',
    Elastic: 'linear', Bounce: 'linear', Spring: 'spring', Steps: 'steps',
  },
  tokens: [...CSS_KEYWORDS, ...Object.keys(CUBIC_BEZIERS), ...Object.keys(JS_EASINGS), 'spring', 'steps'],
};

// ── Public resolver: any spec → a valid CSS <easing-function> string ───────
export function toCSS(spec) {
  if (spec == null) return 'ease';
  if (typeof spec === 'object') {
    if (spec.spring) return toLinear(springFunction(spec.spring));
    if (Array.isArray(spec) && isValidBezierPoints(spec)) return bezierCss(spec);
    return 'ease';
  }
  const v = String(spec).trim();
  const low = v.toLowerCase();
  if (CSS_KEYWORDS.includes(low)) return low;
  if (CUBIC_BEZIERS[low]) return bezierCss(CUBIC_BEZIERS[low]);
  if (JS_EASINGS[low]) return toLinear(JS_EASINGS[low]);
  if (low === 'spring') return toLinear(springFunction());
  // Pass through already-valid CSS easing syntax.
  if (/^(cubic-bezier|linear|steps)\(/i.test(v)) return v;
  return v; // unknown token — hand back verbatim (module/engine may understand it)
}

// Bridge a token to a GSAP ease string (for modules that tween with GSAP).
// GSAP has native elastic/bounce/back/etc., so named tokens map cleanly; a raw
// cubic-bezier/linear() (which GSAP can't parse without a plugin) and unknown
// values pass through so a caller's existing GSAP ease name still works.
const GSAP_FAMILY = { sine: 'sine', quad: 'power1', cubic: 'power2', quart: 'power3', quint: 'power4', expo: 'expo', circ: 'circ', back: 'back', elastic: 'elastic', bounce: 'bounce' };
export function gsapEase(spec) {
  if (spec == null) return undefined;
  const v = String(spec).trim();
  const low = v.toLowerCase();
  if (low === 'linear' || low === 'none') return 'none';
  if (low === 'ease') return 'power1.inOut';
  if (low === 'ease-in') return 'power1.in';
  if (low === 'ease-out') return 'power1.out';
  if (low === 'ease-in-out') return 'power1.inOut';
  if (low === 'spring') return 'elastic.out(1,0.5)'; // GSAP has no physics spring core-side
  const m = low.match(/^([a-z]+)-(in-out|in|out)$/);
  if (m && GSAP_FAMILY[m[1]]) {
    const dir = m[2] === 'in-out' ? 'inOut' : m[2];
    return `${GSAP_FAMILY[m[1]]}.${dir}`;
  }
  return v; // already a GSAP ease name, or something GSAP-specific
}

// JS easing function for a spec (for canvas/RAF-driven modules).
export function fn(spec) {
  if (spec && typeof spec === 'object' && spec.spring) return springFunction(spec.spring);
  const low = String(spec || '').toLowerCase();
  if (JS_EASINGS[low]) return JS_EASINGS[low];
  if (low === 'spring') return springFunction();
  if (CUBIC_BEZIERS[low]) { const p = CUBIC_BEZIERS[low]; return cubicBezierFn(p[0], p[1], p[2], p[3]); }
  return (t) => clamp01(t); // linear fallback
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

export default { toCSS, fn, EASINGS, CUBIC_BEZIERS, JS_EASINGS, springFunction, toLinear, isValidBezierPoints };
