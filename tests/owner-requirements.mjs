import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const requirements = JSON.parse(await read('../kineto.requirements.json'));
const features = JSON.parse(await read('../kineto.features.json'));
const packageJson = JSON.parse(await read('../package.json'));
const aiPromptGuide = await read('../AI-PROMPT-GUIDE.md');
const demo = (await read('../demo/index.html')) + (await read('../demo/main.js')) + (await read('../demo/styles.css'));
const playground = await read('../demo/playground.js');
const playgroundI18n = await read('../demo/playground-i18n.js');
const source = Object.fromEntries(await Promise.all([
  'counter','loader','loadingIndicator','lazy','reveal','textReveal','textTransition','glitch','ripple','overflowText','lightbox','slider','ambientMedia','cardGlow','cursor','scrollVelocity','stickyStack'
].map(async (name) => [name, await read(`../src/modules/${name}.js`)])));

assert.equal(requirements.libraryVersion, packageJson.version);
assert.equal(requirements.requirements.length, 48, 'all 48 owner requirements must remain locked');
assert.equal(new Set(requirements.requirements.map(({ id }) => id)).size, 48, 'requirement IDs must be unique');
assert.equal(features.moduleCount, 51);
assert.ok(
  aiPromptGuide.indexOf('Canonical prompt for AI tools (English)')
    < aiPromptGuide.indexOf('## 한국어 사용 안내'),
  'AI prompt guide must keep the canonical English prompt before Korean guidance'
);
for (const marker of [
  'kineto.features.json',
  'data-kt-loading-indicator',
  'bindProgress(source)',
  'data-kt-lazy="wave"',
  'data-kt-lazy="grain"',
  'Other languages'
]) {
  assert.match(aiPromptGuide, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
}
const module = (name) => features.modules.find((entry) => entry.name === name);

assert.deepEqual(module('counter').variants, ['slot','plain','digit','pop','flip','clock']);
// data-mosaic / rgb-slice-burst are shared with Page Reveal and Glitch.
assert.deepEqual(module('lazy').variants, ['fade','blur-up','wave','grain','skeleton','pixelate','print','dissolve','flicker','polaroid','crt','data-mosaic','rgb-slice-burst']);
assert.ok(module('overflowText').variants.includes('rolling'));
assert.ok(module('reveal').variants.includes('slide-down') && module('reveal').variants.includes('class'));
assert.ok(module('cursor').variants.includes('custom'));
assert.ok(module('slider').variants.includes('coverflow'));
assert.deepEqual(module('loader').variants, ['slot','circular','bar']);
assert.deepEqual(module('loadingIndicator').variants, ['spinner','dots','bar','shimmer','shimmer-wave','terminal']);

assert.match(source.counter, /Pop is not a count-up mode/);
assert.match(source.loader, /source === 'resources'/);
assert.match(source.loader, /trackPromise/);
assert.match(source.loader, /trackFetch/);
assert.match(source.loader, /get finished\(\)/);
assert.match(source.loader, /kt-loader-\$\{name\}/);
assert.match(source.loadingIndicator, /kt-loading-shimmer/);
assert.match(source.loadingIndicator, /kt-loading-terminal/);
assert.match(source.loadingIndicator, /trackPromise/);
assert.match(source.loadingIndicator, /get finished\(\)/);
assert.match(source.loadingIndicator, /kt-loading-indicator-\$\{name\}/);
assert.match(source.lazy, /kt-lazy-skeleton/);
assert.match(source.lazy, /Math\.random\(\)/);
assert.match(source.lazy, /effect === 'print' \|\| effect === 'dissolve'/);
assert.match(source.lazy, /ANIMATED_EXTENSIONS/);
assert.match(source.overflowText, /mode === 'rolling'/);
assert.match(source.overflowText, /maskDirection/);
assert.match(source.reveal, /classOnly/);
assert.match(source.reveal, /slide-down/);
assert.match(source.scrollVelocity, /stiffness/);
assert.match(source.stickyStack, /position = 'sticky'/);
assert.match(source.cardGlow, /surfaceEnabled/);
assert.match(source.cardGlow, /borderEnabled/);
assert.match(source.glitch, /rgba\(0,255,0/);
assert.match(source.glitch, /clipPath/);
assert.match(source.textTransition, /get index\(\)/);
assert.match(source.ripple, /kt-ripple-wave/);
assert.match(source.slider, /effect === 'coverflow'/);
assert.match(source.ambientMedia, /image-clone/);
assert.match(source.ambientMedia, /video-sample/);
assert.match(source.lightbox, /kt-lightbox-minimap/);
assert.match(source.lightbox, /uiTemplate/);
assert.match(source.cursor, /type === 'crosshair'/);
assert.match(source.cursor, /type === 'custom'/);

for (const marker of ['data-demo="counter"','data-demo="loader"','data-demo="lazy"','data-demo="overflow-text"','data-demo="card-glow"','data-demo="buttons"','data-demo="text-motion"','data-demo="content-reveal"','data-demo="scroll"','data-demo="media-ui"','data-demo="cursor-smooth"']) {
  assert.match(demo, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `demo marker missing: ${marker}`);
}
for (const marker of ['Skeleton — Pulse','Rolling Ticker','SURFACE + EDGE','Class Hook','motion-demo.gif','motion-demo.webp','motion-demo.png','Lightbox Viewer','Ring + Dot']) assert.match(demo, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
assert.match(demo, /KinetoPlayground\.capture/);
assert.match(demo, /KinetoPlayground\.mount/);
assert.match(playground, /kt-playground__summary-label/);
assert.match(playgroundI18n, /설정 · 코드/);
assert.match(playground, /navigator\.clipboard\.writeText/);
assert.match(playground, /function reset\(/);
assert.match(playground, /function replay\(/);
assert.match(playground, /function apply\(/);
assert.match(playground, /data-code-tab="html"/);
assert.match(playground, /data-code-tab="js"/);

console.log(`Owner requirements OK: ${requirements.requirements.length} locked requirements.`);
