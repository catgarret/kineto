import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contract = JSON.parse(fs.readFileSync(path.join(root, 'kineto.features.json'), 'utf8'));
const audit = fs.readFileSync(path.join(root, 'docs/variant-distinctness.md'), 'utf8');
const demo = fs.readFileSync(path.join(root, 'demo/index.html'), 'utf8');
const playground = fs.readFileSync(path.join(root, 'demo/playground.js'), 'utf8');

const pageReveal = contract.modules.find((module) => module.name === 'pageReveal');
const pageRevealSource = fs.readFileSync(path.join(root, 'src/modules/pageReveal.js'), 'utf8');
assert.ok(pageReveal, 'pageReveal contract is required');
assert.equal(pageReveal.variants.length, 16, 'the public Page Reveal set must remain bounded at 16 variants');
for (const variant of pageReveal.variants) {
  const row = new RegExp('\\| `' + variant + '` \\| ([^|]+) \\| ([^|]+) \\| distinct \\|').exec(audit);
  assert.ok(row, `variant audit must contain a distinct row for ${variant}`);
  assert.ok(row[1].trim().length > 12 && row[2].trim().length > 2, `variant audit needs a mechanism and code reference for ${variant}`);
  const branch = variant === 'curtain' ? /curtain \(default\)/ : new RegExp(`effect === ['"]${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`);
  assert.match(pageRevealSource, branch, `pageReveal source must retain a mechanism branch for ${variant}`);
}
for (const legacy of ['circle', 'wipe', 'columns', 'strips', 'checker']) {
  assert.doesNotMatch(JSON.stringify(pageReveal.variants), new RegExp(`\\b${legacy}\\b`), `legacy variant ${legacy} must stay out of the public contract`);
}

// Each entry is a manually reviewed visual mechanism plus one or more source
// anchors that participate in that mechanism. The anchors are intentionally
// implementation-facing: deleting a renderer/engine branch while leaving the
// public name in the contract must fail this check.
const MODULE_AUDITS = {
  lazy: {
    fade: ['opacity-ramp', "if (effect === 'fade') {", "el.style.opacity = '0';"],
    'blur-up': ['blur-scale-resolve', "if (effect === 'blur-up') {", "el.style.filter = 'blur(0px)';"],
    wave: ['sliced-wave-canvas', "if (effect === 'wave' || effect === 'grain') {", 'const offset = Math.sin(y * frequency + time * speed) * amplitude;'],
    grain: ['live-grain-canvas', "if (effect === 'grain') {", "noise.canvas.classList.add('kt-lazy-grain-canvas');"],
    skeleton: ['placeholder-layer', "if (effect === 'skeleton') {", 'const setupSkeleton = () => {'],
    pixelate: ['discrete-pixel-stages', "if (effect === 'pixelate') {", 'resolvePixelSteps(opts, rect.width, rect.height)'],
    print: ['directional-sharp-scan', "if (effect === 'print') {", 'sharp.style.maskImage = maskFor(direction, scan, feather, false);'],
    dissolve: ['global-noise-blur-decay', "if (effect === 'print' || effect === 'dissolve') {", 'noise.canvas.style.opacity = String(noiseOpacity * Math.pow(1 - eased, 1.2));'],
    flicker: ['slice-blackout-decode', "if (effect === 'flicker') {", 'const drawGlitch = (progress) => {'],
    polaroid: ['instant-film-development', "if (effect === 'polaroid') {", "createLayer(wrapper, 'kt-lazy-polaroid-frame', 6)"],
    crt: ['crt-power-on', "if (effect === 'crt') {", "createLayer(wrapper, 'kt-lazy-crt-beam', 7)"],
    'data-mosaic': ['seeded-tile-clear', "if (effect === 'data-mosaic') {", 'const tileMax = Math.max(8, Number(opts.tileMax ?? 44));'],
    'rgb-slice-burst': ['one-shot-channel-slices', "effect === 'rgb-slice-burst'", 'const slices = Math.round(between(3, 7));']
  },
  cursor: {
    dot: ['snapped-dot-follow-ring', "if (opts.follower !== false) addFollower(opts.shape || 'circle');"],
    ring: ['eased-outline-follower', "} else if (type === 'ring') {"],
    blob: ['filled-blurred-follower', "} else if (type === 'blob') {"],
    crosshair: ['viewport-or-local-axes', "if (type === 'crosshair') {", 'kt-cursor-hair--vp-x'],
    text: ['rotating-svg-text-path', "} else if (type === 'text') {", 'kt-cursor-textring-spin'],
    trail: ['elastic-dot-chain', "} else if (type === 'trail') {", 'chain.spring = clamp(Number(opts.spring ?? 0.28)'],
    orbit: ['elliptical-character-orbit', "} else if (type === 'orbit') {", 'chain.orbitRadius'],
    snake: ['spaced-glyph-chase', "} else if (type === 'snake') {", 'chain.minScale'],
    sparkle: ['pointer-path-particles', "} else if (type === 'sparkle') {", 'sparkles.symbols'],
    image: ['live-image-cursor', "} else if (type === 'image' && opts.src) {", "image.className = 'kt-cursor-image';"],
    custom: ['authored-template-cursor', "} else if (type === 'custom') {", 'const template = opts.template || opts.html']
  },
  overflowText: {
    loop: ['seamless-duplicate-marquee', "if (mode === 'loop') {", 'const second = createSegment(text, true);'],
    bounce: ['bidirectional-end-return', "if (mode === 'bounce') {", 'const total = delay + moveDuration + endPause + moveDuration + restartDelay;'],
    rewind: ['masked-invisible-reset', 'const runRewind = async () => {', 'await maskOut(viewport);'],
    once: ['single-forward-hold', "if (mode === 'once') {", "fill: 'forwards'"],
    page: ['page-step-directional-mask', "if (mode === 'page') {", 'await maskIn(viewport);'],
    flip: ['split-flap-page-turn', "if (mode === 'flip') {", 'rotateX(${sign * 88}deg)'],
    dissolve: ['per-character-step-scramble', "if (mode === 'dissolve') {", 'const scramble = (entering) => Promise.all(spans.map'],
    'page-roll': ['paged-vertical-ticker', "if (mode === 'page-roll' || mode === 'pageRoll') {", 'const rollPage = async () => {'],
    rolling: ['item-ranking-ticker', "if (mode === 'rolling') buildRolling();", 'const buildRolling = () => {'],
    fade: ['page-crossfade', "if (mode === 'fade') {", 'const swapFade = async () => {'],
    'scroll-fade': ['marquee-seam-crossfade', "if (mode === 'scroll-fade' || mode === 'scrollFade') {", 'const runCross = async () => {']
  },
  glitch: {
    rgb: ['three-layer-rgb-slices', 'const rgbBurst = () => {', 'const directions = [-1, 0, 1];'],
    pixel: ['pixel-grid-glyph-fragments', 'const pixelBurst = () => {', 'pixelBits.add(bit);'],
    noise: ['character-noise-scramble', 'const noiseBurst = () => {', 'NOISE_CHARS[Math.floor(random() * NOISE_CHARS.length)]'],
    crt: ['image-crt-scan-roll', "if (preset === 'crt' || preset === 'vcr') {", "overlay.className = 'kt-glitch-crt';"],
    wave: ['seeded-slice-wave', "if (preset === 'wave') {", 'const stepWave = () => {'],
    image: ['canvas-channel-slice-loop', "if (preset === 'image' || preset === 'reveal' || preset === 'datamosh') {", 'const drawImageGlitch = (amp) => {'],
    datamosh: ['block-compression-burst', "const datamoshMode = preset === 'datamosh';", 'datamoshMode ? (0.35 + Math.sin(progress * Math.PI) * 0.8)'],
    reveal: ['one-shot-glitch-decode', "const revealMode = preset === 'reveal';", "if (revealMode) imageEl.style.opacity = '0';"],
    vcr: ['tracking-band-vhs-jitter', "const isVcr = preset === 'vcr';", 'kt-vcr-track'],
    'rgb-slice-burst': ['seeded-artifact-burst', "if (preset === 'rgb-slice-burst') {", 'artifactCount']
  },
  slider: {
    slide: ['linear-track-translation', "if (effect === 'slide') {", 'const baseX = centerOffset + distance * step'],
    fade: ['stacked-opacity-crossfade', "if (fade) {", "slide.style.opacity = String(visible);"],
    dissolve: ['stacked-blur-scale-dissolve', "} else if (dissolve) {", 'const blur = absolute * 14 * effectIntensity;'],
    wipe: ['directional-clip-transition', "} else if (wipe) {", 'const clips = {'],
    coverflow: ['centered-3d-neighbours', "if (coverflow) {", 'const angle = clamp(-distance * rotate'],
    flip: ['half-turn-card-plane', "} else if (flip) {", 'distance * -180 * effectIntensity'],
    cube: ['hinged-cube-face', "} else if (cube) {", 'distance * -90 * effectIntensity'],
    cards: ['stacked-card-depth', "} else if (cards) {", 'const rotateZ = distance * 4 * effectIntensity;'],
    creative: ['offset-rotate-blur-stack', "const creative = effect === 'creative';", 'const x = distance * 34 * effectIntensity;'],
    radial: ['independent-orbit-hub-engine', "const radialMode = (opts.effect || opts.preset) === 'radial';", 'const renderRadial = (positionValue) => {']
  }
};

const variantListMatch = playground.match(/^ {2}const PUBLIC_VARIANTS = (\{.*\});$/m);
assert.ok(variantListMatch, 'demo playground must contain the generated PUBLIC_VARIANTS map');
const demoChoices = JSON.parse(variantListMatch[1]);
let additionalVariants = 0;
let directDemoVariants = 0;

function authoredDemoVariants(module) {
  const escapedAttribute = module.attribute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const attributePattern = new RegExp(`${escapedAttribute}(?:=(?:"([^"]*)"|'([^']*)'))?`, 'g');
  const authored = new Set();
  let match;
  while ((match = attributePattern.exec(demo))) authored.add(match[1] || match[2] || module.defaultVariant);
  return authored;
}

function assertAuditSummary(module, authored) {
  const summary = new RegExp('\\| `' + module.name + '` \\| `'
    + module.variants.length + '/' + module.variants.length + '` \\| `'
    + authored.size + '/' + module.variants.length + '` \\| distinct \\|');
  assert.match(audit, summary, `${module.name} audit summary must record contract and direct-demo coverage`);
}

for (const [moduleName, mechanisms] of Object.entries(MODULE_AUDITS)) {
  const module = contract.modules.find((entry) => entry.name === moduleName);
  assert.ok(module, `${moduleName} contract is required`);
  assert.deepEqual(Object.keys(mechanisms).sort(), [...module.variants].sort(), `${moduleName} audit must cover every public variant exactly once`);
  assert.deepEqual(demoChoices[moduleName], module.variants, `${moduleName} settings choices must mirror the public contract`);

  const source = fs.readFileSync(path.join(root, `src/modules/${moduleName}.js`), 'utf8');
  const identities = [];
  const sourceAnchors = [];
  for (const variant of module.variants) {
    const [identity, ...anchors] = mechanisms[variant];
    assert.ok(identity.length > 8, `${moduleName}.${variant} needs a meaningful mechanism identity`);
    assert.ok(anchors.length > 0, `${moduleName}.${variant} needs at least one source anchor`);
    identities.push(identity);
    sourceAnchors.push(anchors.join('\u0000'));
    for (const anchor of anchors) {
      assert.ok(source.includes(anchor), `${moduleName}.${variant} lost source mechanism anchor: ${anchor}`);
    }
  }
  assert.equal(new Set(identities).size, module.variants.length, `${moduleName} variants must not share a mechanism identity`);
  assert.equal(new Set(sourceAnchors).size, module.variants.length, `${moduleName} variants must not share the same source-anchor fingerprint`);

  const authored = authoredDemoVariants(module);
  assert.ok(authored.size > 0, `${moduleName} needs at least one direct demo instance`);
  for (const variant of authored) {
    assert.ok(module.variants.includes(variant), `${moduleName} demo authors stale variant "${variant}"`);
  }
  assertAuditSummary(module, authored);
  additionalVariants += module.variants.length;
  directDemoVariants += authored.size;
}

// Reveal's declarative PRESETS are stronger than string anchors: every public
// non-special variant must map to a unique initial visual state. `class` and
// `clock` are separate lifecycle/rendering branches checked below.
const reveal = contract.modules.find((module) => module.name === 'reveal');
const revealModule = await import(pathToFileURL(path.join(root, 'src/modules/reveal.js')).href);
const revealPresetNames = reveal.variants.filter((variant) => !['class', 'clock'].includes(variant));
assert.deepEqual(Object.keys(revealModule.PRESETS).sort(), revealPresetNames.sort(), 'Reveal PRESETS must cover every non-special public variant');
const revealStates = Object.entries(revealModule.PRESETS).map(([variant, state]) => [
  variant,
  JSON.stringify(Object.fromEntries(Object.entries(state).sort(([left], [right]) => left.localeCompare(right))))
]);
assert.equal(new Set(revealStates.map(([, state]) => state)).size, revealStates.length, 'Reveal presets must retain unique initial visual states');
const revealSource = fs.readFileSync(path.join(root, 'src/modules/reveal.js'), 'utf8');
assert.ok(revealSource.includes("preset === 'class'"), 'Reveal class variant needs its lifecycle branch');
assert.ok(revealSource.includes("preset === 'clock'"), 'Reveal clock variant needs its conic-mask branch');
assert.deepEqual(demoChoices.reveal, reveal.variants, 'Reveal settings choices must mirror the public contract');
const authoredReveal = authoredDemoVariants(reveal);
for (const variant of authoredReveal) {
  assert.ok(reveal.variants.includes(variant), `Reveal demo authors stale variant "${variant}"`);
}
assertAuditSummary(reveal, authoredReveal);
additionalVariants += reveal.variants.length;
directDemoVariants += authoredReveal.size;

assert.match(audit, /확대 검토일: 2026-09-05/);
console.log(`variant-distinctness OK — ${pageReveal.variants.length} Page Reveal + ${additionalVariants} expanded mechanisms audited; ${directDemoVariants}/${additionalVariants} expanded variants have dedicated demo markup and all remain available in settings.`);
