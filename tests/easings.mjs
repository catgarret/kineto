// Easing subsystem acceptance (audit C-1 / J-3):
//  • the full easings.net family set is present
//  • Elastic and Bounce are honest CSS linear() curves, NOT fake cubic-beziers
//  • 'spring' is a real physics spring (linear()), distinct from the Back bezier
//  • cubic-bezier x-coordinates are validated to [0,1]
//  • named tokens resolve to valid CSS <easing-function> strings
// Run: node tests/easings.mjs
import assert from 'node:assert/strict';
import {
  toCSS, fn, EASINGS, springFunction, isValidBezierPoints, gsapEase, parseSpring, springDuration,
  springFromDuration, springFromResponse, SPRING_PRESETS, APPLE_BEZIERS
} from '../src/easings.js';
import { resolveMotion, setMotionDefaults, motionDefaults } from '../src/utils.js';

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
// Springs are an exact physics ease FUNCTION for GSAP (GSAP accepts functions),
// not the elastic lookalike this bridge used to return.
ok(typeof gsapEase('spring') === 'function', 'gsapEase(spring) must be the physics function');
ok(Math.abs(gsapEase('spring')(0.5) - springFunction()(0.5)) < 1e-9, 'gsapEase(spring) must equal springFunction');
ok(typeof gsapEase({ spring: { stiffness: 100, damping: 8 } }) === 'function', 'object spec must not stringify to [object Object]');
ok(typeof gsapEase('cubic-bezier(0.4,0,0.6,1)') === 'function', 'raw cubic-bezier must become a GSAP function');
assert.equal(gsapEase('power3.out'), 'power3.out');

// 9. Apple presets carry Apple's published numbers.
//    SwiftUI Spring docs: Spring(duration: 0.5, bounce: 0.3) → mass 1, stiffness 157.9, damping 17.6.
const bouncy = SPRING_PRESETS['spring-bouncy'];
ok(Math.abs(bouncy.stiffness - 157.9) < 0.05 && Math.abs(bouncy.damping - 17.6) < 0.05 && bouncy.mass === 1,
  `spring-bouncy must be SwiftUI .bouncy (157.9/17.6), got ${bouncy.stiffness}/${bouncy.damping}`);
const zeta = (p) => p.damping / (2 * Math.sqrt(p.stiffness * p.mass));
ok(Math.abs(zeta(SPRING_PRESETS['spring-smooth']) - 1) < 1e-9, 'spring-smooth must be critically damped (bounce 0)');
ok(Math.abs(zeta(SPRING_PRESETS['spring-snappy']) - 0.85) < 1e-9, 'spring-snappy must be bounce 0.15 (ζ 0.85)');
ok(Math.abs(zeta(SPRING_PRESETS['spring-bouncy']) - 0.7) < 1e-9, 'spring-bouncy must be bounce 0.3 (ζ 0.7)');
ok(Math.abs(zeta(SPRING_PRESETS['spring-apple']) - 1) < 1e-9 && Math.abs(SPRING_PRESETS['spring-apple'].stiffness - (2 * Math.PI / 0.55) ** 2) < 1e-6,
  'spring-apple must be SwiftUI Animation.default (response 0.55, dampingFraction 1)');
ok(Math.abs(zeta(SPRING_PRESETS['spring-interactive']) - 0.86) < 1e-9, 'spring-interactive must be interactiveSpring (0.15 / 0.86)');
assert.deepEqual(SPRING_PRESETS.spring, { stiffness: 170, damping: 26, mass: 1, velocity: 0 }, 'legacy spring token must not change');
assert.deepEqual(APPLE_BEZIERS['apple-standard'], [0.4, 0, 0.6, 1]);
assert.equal(toCSS('apple-standard'), 'cubic-bezier(0.4,0,0.6,1)');
assert.equal(toCSS('apple-ease-in-out'), 'cubic-bezier(0.42,0,0.58,1)');

// 10. Every spring notation parses to the same physics.
const near = (a, b) => a && b && ['stiffness', 'damping', 'mass', 'velocity'].every((k) => Math.abs(a[k] - b[k]) < 1e-9);
ok(near(parseSpring('spring(0.5s, 0.3)'), springFromDuration(0.5, 0.3)), 'spring(0.5s, 0.3) must be Apple duration/bounce');
ok(near(parseSpring('spring(500ms, 0.3)'), springFromDuration(0.5, 0.3)), 'ms duration must parse');
ok(near(parseSpring('spring-bouncy(0.6s, 0.1)'), springFromDuration(0.6, 0.4)), 'preset(duration, extraBounce) must add to the base bounce');
ok(near(parseSpring('spring(100, 8)'), { stiffness: 100, damping: 8, mass: 1, velocity: 0 }), 'physics form must parse');
ok(near(parseSpring({ spring: { response: 0.15, dampingFraction: 0.86 } }), springFromResponse(0.15, 0.86)), 'response form must parse');
ok(near(parseSpring({ spring: { duration: 0.5, bounce: 0.15 } }), SPRING_PRESETS['spring-snappy']), 'duration/bounce object must parse');
for (const bad of ['spring(', 'spring(a,b)', 'spring(1,2,3,4,5)', 'springy', 'spring-nope', 'ease']) {
  ok(parseSpring(bad) === null, `${bad} must not parse as a spring`);
}
ok(toCSS('spring(a,b)') === 'spring(a,b)', 'an invalid spring passes through verbatim like any unknown token');

// 11. Natural duration: an under-damped spring's settle time is where it stays within 0.1%.
for (const name of ['spring-smooth', 'spring-snappy', 'spring-bouncy', 'spring(100, 8)']) {
  const d = springDuration(name);
  const curve = springFunction(parseSpring(name));
  ok(d > 0.05 && d < 10, `${name} duration out of range: ${d}`);
  let worst = 0; for (let i = 0; i <= 200; i++) worst = Math.max(worst, Math.abs(1 - curve(0.999 + i * 0.000005)));
  ok(worst < 0.002, `${name} must be at rest at the end of its duration (err ${worst})`);
}
ok(springDuration('ease') === null, 'curves have no natural duration');

// 12. The baked linear() stays within 0.3% of the true spring and keeps the overshoot.
const baked = toCSS('spring(100, 8)');
const bakedFn = fn(baked);
const truth = springFunction(parseSpring('spring(100, 8)'));
let maxErr = 0; let bakedPeak = 0;
for (let i = 0; i <= 1000; i++) { const t = i / 1000; maxErr = Math.max(maxErr, Math.abs(bakedFn(t) - truth(t))); bakedPeak = Math.max(bakedPeak, bakedFn(t)); }
ok(maxErr < 0.003, `baked linear() drifts ${maxErr.toFixed(4)} from the spring`);
ok(bakedPeak > 1.2, `spring(100, 8) must keep its ~25% overshoot in CSS (peak ${bakedPeak.toFixed(3)})`);
ok(baked.length < 900, `baked spring should stay compact (${baked.length} chars)`);

// 13. fn() understands raw CSS text too (it used to fall back to linear).
ok(Math.abs(fn('ease-out')(0.5) - fn('cubic-bezier(0,0,0.58,1)')(0.5)) < 1e-9, 'fn(keyword) must equal its bezier');
ok(fn('ease-out')(0.5) > 0.6, 'fn(ease-out) must not be linear');
ok(Math.abs(fn('linear(0, 0.8 20%, 1)')(0.1) - 0.4) < 1e-9, 'fn(linear()) must interpolate stops');
ok(fn('steps(4, end)')(0.3) === 0.25, 'fn(steps()) must step');

// 14. resolveMotion: authored duration wins; a spring otherwise keeps its natural pace;
//     page-wide defaults apply only where the module allows them.
const snappyDuration = springDuration('spring-snappy');
let m = resolveMotion({ ease: 'spring-snappy' }, { ease: 'ease', duration: 0.3 });
ok(m.spring && Math.abs(m.seconds - snappyDuration) < 1e-9 && m.css.startsWith('linear('), 'spring without duration uses its natural pace');
m = resolveMotion({ ease: 'spring-snappy', duration: 0.2 }, { ease: 'ease', duration: 0.3 });
ok(Math.abs(m.seconds - 0.2) < 1e-9, 'authored duration wins over the spring pace');
m = resolveMotion({ duration: 400 }, { ease: 'ease', duration: 520, durationUnit: 'ms' });
ok(Math.abs(m.ms - 400) < 1e-9 && m.css === 'ease', 'ms-unit modules keep their unit');
setMotionDefaults({ spring: true });
ok(resolveMotion({}, { ease: 'ease', duration: 0.3 }).spring, 'Kineto.config({spring:true}) must give UI motion a spring');
ok(!resolveMotion({}, { ease: 'linear', duration: 1, springable: false }).spring, 'springable:false must ignore page springs');
ok(resolveMotion({ ease: 'ease-out' }, { ease: 'ease' }).css === 'ease-out', 'an element ease wins over page springs');
setMotionDefaults({ spring: false, ease: 'apple-standard' });
ok(resolveMotion({}, { ease: 'ease' }).css === 'cubic-bezier(0.4,0,0.6,1)', 'Kineto.config({ease}) must set the page UI curve');
setMotionDefaults({ spring: false, ease: null });
ok(motionDefaults.ease === null, 'defaults reset');

if (fails.length) { console.error('FAILED:\n - ' + fails.join('\n - ')); process.exit(1); }
console.log(`easings OK — ${REQUIRED.length} families incl. Elastic/Bounce (linear) + real Spring; CSS + GSAP bridges + validation verified.`);
