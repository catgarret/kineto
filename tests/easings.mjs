// Easing subsystem acceptance (audit C-1 / J-3):
//  • the full easings.net family set is present
//  • Elastic and Bounce are honest CSS linear() curves, NOT fake cubic-beziers
//  • 'spring' is a real physics spring (linear()), distinct from the Back bezier
//  • cubic-bezier x-coordinates are validated to [0,1]
//  • named tokens resolve to valid CSS <easing-function> strings
// Run: node tests/easings.mjs
import assert from 'node:assert/strict';
import { toCSS, fn, EASINGS, springFunction, isValidBezierPoints, gsapEase } from '../src/easings.js';

const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); };

// 1. Full easings.net family set present.
const REQUIRED = ['Sine', 'Quad', 'Cubic', 'Quart', 'Quint', 'Expo', 'Circ', 'Back', 'Elastic', 'Bounce', 'Spring'];
for (const f of REQUIRED) ok(EASINGS.families[f], `missing easing family: ${f}`);
ok(EASINGS.families.Elastic === 'linear', 'Elastic must be a linear() curve, not cubic-bezier');
ok(EASINGS.families.Bounce === 'linear', 'Bounce must be a linear() curve, not cubic-bezier');
ok(EASINGS.families.Spring === 'spring', 'Spring must be a physics spring, not cubic-bezier');

// 2. Elastic/Bounce/Spring resolve to linear(), never cubic-bezier.
for (const t of ['elastic-in', 'elastic-out', 'elastic-in-out', 'bounce-in', 'bounce-out', 'bounce-in-out', 'spring']) {
  const css = toCSS(t);
  ok(css.startsWith('linear('), `${t} should be linear(), got: ${css.slice(0, 24)}`);
  ok(!css.includes('cubic-bezier'), `${t} must not be a cubic-bezier`);
}

// 3. cubic-bezier families resolve to their real easings.net beziers.
assert.equal(toCSS('sine-in'), 'cubic-bezier(0.12,0,0.39,0)');
assert.equal(toCSS('back-out'), 'cubic-bezier(0.34,1.56,0.64,1)');
assert.equal(toCSS('ease-in-out'), 'ease-in-out');
assert.equal(toCSS('linear'), 'linear');

// 4. Object spring spec.
ok(toCSS({ spring: { stiffness: 200, damping: 12, mass: 1, velocity: 0 } }).startsWith('linear('), 'spring object must resolve to linear()');

// 5. Bezier x-coordinate validation ([0,1] required for CSS).
ok(isValidBezierPoints([0.3, 0, 0.7, 1]) === true, 'valid bezier rejected');
ok(isValidBezierPoints([1.4, 0, 0.7, 1]) === false, 'x1>1 must be invalid');
ok(isValidBezierPoints([-0.2, 0, 0.7, 1]) === false, 'x1<0 must be invalid');
ok(isValidBezierPoints([0.3, 0, 1.2, 1]) === false, 'x2>1 must be invalid');

// 6. Spring is a real 0→1 settling curve (endpoints correct, overshoots for low damping).
const s = springFunction({ stiffness: 200, damping: 8, mass: 1, velocity: 0 });
assert.equal(s(0), 0); assert.equal(s(1), 1);
let peak = 0; for (let i = 0; i <= 40; i++) peak = Math.max(peak, s(i / 40));
ok(peak > 1, `under-damped spring should overshoot 1 (peak=${peak.toFixed(3)})`);

// 7. JS easing functions available (for canvas/RAF modules).
ok(typeof fn('elastic-out') === 'function' && Math.abs(fn('elastic-out')(1) - 1) < 1e-6, 'elastic-out JS fn wrong endpoint');

// 8. GSAP bridge — tokens map to GSAP ease names; native names pass through.
assert.equal(gsapEase('elastic-out'), 'elastic.out');
assert.equal(gsapEase('bounce-in'), 'bounce.in');
assert.equal(gsapEase('sine-in'), 'sine.in');
assert.equal(gsapEase('quad-in-out'), 'power1.inOut'); // GSAP: quad === power1
assert.equal(gsapEase('quart-out'), 'power3.out');
assert.equal(gsapEase('linear'), 'none');
assert.equal(gsapEase('spring'), 'elastic.out(1,0.5)');
assert.equal(gsapEase('power3.out'), 'power3.out');

if (fails.length) { console.error('FAILED:\n - ' + fails.join('\n - ')); process.exit(1); }
console.log(`easings OK — ${REQUIRED.length} families incl. Elastic/Bounce (linear) + real Spring; CSS + GSAP bridges + validation verified.`);
