// Canvas Effect — the parts that need no real canvas (MK-CANVAS-001).
//
//   1. definitions are validated with messages that say exactly what is wrong;
//   2. listCanvasEffects() describes every effect for tooling (the drawer);
//   3. markup can only NAME an effect: an object in the `effect` slot — which a
//      JSON data-kt-* value can produce — never starts anything;
//   4. an element that asked for an effect before it was defined starts the
//      moment it is defined;
//   5. with no drawing context (no WebGL, or jsdom) the element keeps its own
//      background, and destroy() hands it back exactly as it was;
//   6. the shared option vocabulary is the same in the host, the contract, the
//      demo drawer and the docs, and the demo's AI prompt is the guide's.
//
// The drawing itself is covered in a real browser: tests/browser/canvas-effect.mjs.
// Run: npm run build && node tests/canvas-effect.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://example.test/', pretendToBeVisual: true });
const { window: w } = dom;
globalThis.window = w;
globalThis.document = w.document;
for (const key of ['Element', 'Node', 'NodeList', 'HTMLElement', 'HTMLCanvasElement', 'Event', 'CustomEvent', 'getComputedStyle']) globalThis[key] = w[key];
globalThis.requestAnimationFrame = w.requestAnimationFrame = (callback) => setTimeout(() => callback(Date.now()), 0);
globalThis.cancelAnimationFrame = w.cancelAnimationFrame = (id) => clearTimeout(id);
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
class NoObserver { observe() {} unobserve() {} disconnect() {} }
w.IntersectionObserver = NoObserver;
globalThis.IntersectionObserver = NoObserver;
// jsdom has no canvas: getContext() answers null, as a browser without WebGL does.
w.HTMLCanvasElement.prototype.getContext = () => null;
const warnings = [];
const savedWarn = console.warn;
console.warn = (...args) => warnings.push(args.join(' '));

const { default: Kineto, defineCanvasEffect, listCanvasEffects } = await import('../dist/kineto.js');

// 1. Validation — each message names the problem.
const rejects = (name, definition, pattern) => assert.throws(() => defineCanvasEffect(name, definition), pattern);
rejects('Bad Name', { frame() {} }, /lower-case letters, digits and dashes/);
rejects('no-frame', { options: {} }, /needs a frame\(api\) function or a fragment shader/);
rejects('shader-2d', { context: '2d', fragment: 'void main(){}' }, /fragment shader needs a webgl or webgl2 context/);
rejects('odd-context', { context: 'webgpu', frame() {} }, /context must be one of 2d, webgl, webgl2/);
rejects('odd-hook', { frame() {}, resize: 'no' }, /resize must be a function/);
assert.equal(defineCanvasEffect('dots', { options: { color: '#fff', size: 12 }, frame() { return false; } }), 'dots');
defineCanvasEffect('glow', { options: { speed: 1 }, fragment: 'void main(){gl_FragColor=vec4(1.0);}' });

// 2. Descriptors for tooling.
assert.deepEqual(listCanvasEffects(), [
  { name: 'dots', context: '2d', shader: false, options: { color: '#fff', size: 12 } },
  { name: 'glow', context: 'webgl', shader: true, options: { speed: 1 } }
]);
assert.equal(Kineto.listCanvasEffects, listCanvasEffects, 'the helper is on the Kineto object too');

// 3. Markup can only name an effect.
const smuggled = w.document.body.appendChild(w.document.createElement('div'));
smuggled.setAttribute('data-kt-canvas-effect', '{"effect":{"fragment":"void main(){gl_FragColor=vec4(1.0);}"}}');
Kineto.scan(smuggled.parentNode);
assert.equal(Kineto.getInstance(smuggled, 'canvasEffect'), null, 'a definition in markup must never start an effect');
assert.equal(smuggled.querySelector('canvas'), null, 'and must not even insert a canvas');
assert.ok(warnings.some((line) => /must name an effect registered/.test(line)), 'the refusal is explained once in the console');
assert.equal(Kineto.create('canvasEffect', w.document.createElement('div'), { effect: { frame() {} } }), null,
  'an object from JS is refused the same way: definitions go through defineCanvasEffect()');

// 4. Asked for before it existed → starts when defined.
const early = w.document.body.appendChild(w.document.createElement('div'));
early.setAttribute('data-kt-canvas-effect', 'late');
Kineto.scan(early.parentNode);
assert.equal(Kineto.getInstance(early, 'canvasEffect'), null, 'nothing to run yet');
defineCanvasEffect('late', { frame() { return false; } });
assert.ok(Kineto.getInstance(early, 'canvasEffect'), 'defining the effect starts the element that asked for it');

// 5. No drawing context → the element's own background stays; destroy restores it.
const host = w.document.body.appendChild(w.document.createElement('section'));
host.className = 'hero';
host.innerHTML = '<h1>Title</h1>';
const before = host.outerHTML;
const instance = Kineto.create('canvasEffect', host, { effect: 'dots', size: '20', color: 'abc' });
assert.ok(instance, 'an instance exists even without a context');
assert.ok(host.classList.contains('kt-canvas-effect') && host.classList.contains('is-unsupported'), 'the host says why nothing is drawn');
assert.equal(host.firstElementChild.tagName, 'CANVAS', 'the canvas goes first, behind the content');
assert.equal(host.style.isolation, 'isolate', 'the host becomes its own stacking context');
instance.destroy();
assert.equal(host.outerHTML, before, 'destroy() hands the element back exactly as it was');

// Unread vocabulary is reported once — usually a typo or the wrong effect.
Kineto.create('canvasEffect', w.document.body.appendChild(w.document.createElement('div')), { effect: 'dots', distortion: 2 });
assert.ok(warnings.some((line) => /"dots" does not read "distortion"/.test(line)), 'an option the effect does not read is reported');

// 6. One vocabulary everywhere; one prompt.
const vocabulary = ['color', 'color2', 'background', 'speed', 'density', 'size', 'strength', 'distortion'];
const hostSource = read('src/modules/canvasEffect.js');
const hostVocabulary = [...hostSource.slice(hostSource.indexOf('function vocabulary'), hostSource.indexOf('// An effect receives ONLY')).matchAll(/opts\.(\w+)/g)].map((match) => match[1]);
assert.deepEqual(hostVocabulary, vocabulary, 'the host vocabulary drifted');
const contract = JSON.parse(read('kineto.features.json')).modules.find(({ name }) => name === 'canvasEffect');
vocabulary.forEach((key) => assert.ok(contract.publicOptions.includes(key), `the contract must list ${key}`));
const playground = read('demo/playground.js');
const drawerVocabulary = JSON.parse(playground.match(/const CANVAS_EFFECT_VOCABULARY = (\[[^\]]+\])/)[1].replace(/'/g, '"'));
assert.deepEqual(drawerVocabulary, vocabulary, 'the drawer vocabulary drifted');
const guide = read('docs/modules/canvas-effect.md');
vocabulary.forEach((key) => assert.ok(guide.includes(`\`${key}\``), `docs/modules/canvas-effect.md must explain ${key}`));

const promptGuide = read('AI-PROMPT-GUIDE.md');
const section = promptGuide.slice(promptGuide.indexOf('### Canvas effects'));
const guidePrompt = section.slice(section.indexOf('```text\n') + 8, section.indexOf('\n```', section.indexOf('```text\n')));
const demo = new JSDOM(read('demo/index.html')).window.document;
const demoPrompt = demo.getElementById('ce-ai-prompt')?.textContent;
assert.equal(demoPrompt, guidePrompt, "the demo's AI prompt must be the guide's, word for word");
assert.ok(demo.querySelector('[data-copy="#ce-ai-prompt"]'), 'and the demo card copies it');

console.warn = savedWarn;
console.log(`canvas-effect OK — validation, descriptors, name-only markup, define-after-scan, no-context fallback with exact restore, one vocabulary and one prompt (${guidePrompt.split('\n').length} lines).`);
process.exit(0);
