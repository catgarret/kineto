import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const requirements = JSON.parse(await read('../kineto.requirements.json'));
const features = JSON.parse(await read('../kineto.features.json'));
const packageJson = JSON.parse(await read('../package.json'));
const demo = (await read('../demo/index.html')) + (await read('../demo/main.js')) + (await read('../demo/styles.css'));
const playground = await read('../demo/playground.js');
const source = Object.fromEntries(await Promise.all([
  'counter','loader','lazy','reveal','shuffle','textTransition','glitch','ripple','overflowText','lightbox','slider','ambientMedia','cardGlow','cursor','scrollVelocity','stickyStack'
].map(async (name) => [name, await read(`../src/modules/${name}.js`)])));

assert.equal(requirements.libraryVersion, packageJson.version);
assert.equal(requirements.requirements.length, 46, 'all 46 owner requirements must remain locked');
assert.equal(new Set(requirements.requirements.map(({ id }) => id)).size, 46, 'requirement IDs must be unique');
assert.equal(features.moduleCount, 34);
const module = (name) => features.modules.find((entry) => entry.name === name);

assert.deepEqual(module('counter').variants, ['slot','plain','digit','pop','flip','clock']);
assert.deepEqual(module('lazy').variants, ['fade','blur-up','skeleton','pixelate','print','dissolve','flicker','polaroid']);
assert.ok(module('overflowText').variants.includes('rolling'));
assert.ok(module('reveal').variants.includes('slide-down') && module('reveal').variants.includes('class'));
assert.ok(module('cursor').variants.includes('custom'));
assert.ok(module('slider').variants.includes('coverflow'));

assert.match(source.counter, /Pop is not a count-up mode/);
assert.match(source.loader, /source === 'resources'/);
assert.match(source.loader, /trackPromise/);
assert.match(source.loader, /trackFetch/);
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
assert.match(playground, /Customize & copy code/);
assert.match(playground, /navigator\.clipboard\.writeText/);
assert.match(playground, /function reset\(/);
assert.match(playground, /function replay\(/);
assert.match(playground, /function apply\(/);
assert.match(playground, /data-code-tab="html"/);
assert.match(playground, /data-code-tab="js"/);

console.log(`Owner requirements OK: ${requirements.requirements.length} locked requirements.`);
