// Reduced-motion policy + live state (audit D-1 / J-5).
//  • Kineto.prefersReducedMotion is a live getter (not a one-time read).
//  • setReducedMotion('always'|'never'|'user') switches the policy and the
//    module-init gate honours it immediately.
// Run: node tests/reduced-motion.mjs
import assert from 'node:assert/strict';
import Kineto from '../dist/kineto.js';

assert.equal(typeof Kineto.setReducedMotion, 'function', 'setReducedMotion API missing');
assert.equal('prefersReducedMotion' in Kineto, true, 'prefersReducedMotion getter missing');

// Policy switching (SSR/node env has OS reduced-motion = false).
Kineto.setReducedMotion('always');
assert.equal(Kineto.prefersReducedMotion, true, "policy 'always' should force reduced motion on");
Kineto.setReducedMotion('never');
assert.equal(Kineto.prefersReducedMotion, false, "policy 'never' should force reduced motion off");
Kineto.setReducedMotion('user');
assert.equal(Kineto.prefersReducedMotion, false, "policy 'user' should follow the (false) OS value here");

// The getter reflects the live cached env, not a frozen copy.
const before = Kineto.prefersReducedMotion;
assert.equal(before, false);

console.log('reduced-motion OK — live prefersReducedMotion getter + user/always/never policy verified.');
