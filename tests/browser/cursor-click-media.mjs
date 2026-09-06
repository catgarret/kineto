// Decode real GIF/APNG/WebP files in each browser: move during the first cycle,
// remain on the final frame after it, restart per click, and clean up on destroy.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';
import { rolldown } from 'rolldown';

const root = path.resolve(import.meta.dirname, '..', '..');
const browserName = process.env.KT_BROWSER || 'chromium';
const browserType = { chromium, firefox, webkit }[browserName];
assert.ok(browserType, `Unknown browser: ${browserName}`);
const sources = {};
for (const [format, extension] of [['gif', 'gif'], ['webp', 'webp'], ['apng', 'png']]) {
  const bytes = await readFile(path.join(root, `demo/assets/motion-demo.${extension}`));
  // Exercise object stores serving valid media with a generic Content-Type.
  sources[format] = `data:application/octet-stream;base64,${bytes.toString('base64')}`;
}
async function bundleEntry(entry, name) {
  const bundle = await rolldown({ input: path.join(root, entry), logLevel: 'silent' });
  try {
    const { output } = await bundle.generate({ format: 'iife', name });
    return output[0].code;
  } finally { await bundle.close(); }
}
const helperBundle = await bundleEntry('src/modules/cursor/clickEffects.js', '__clickMedia');
const cursorBundle = await bundleEntry('src/modules/cursor.js', '__cursorModule');
const browser = await browserType.launch({
  headless: true,
  ...(browserName === 'chromium' && process.env.KT_CHROME ? { executablePath: process.env.KT_CHROME } : {})
});
const page = await browser.newPage({ viewport: { width: 600, height: 560 }, reducedMotion: 'no-preference' });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const hashImage = async (selector) => createHash('sha256').update(await page.locator(selector).screenshot()).digest('hex');
try {
  await page.setContent('<!doctype html><html><head><style>body{margin:0;background:white}</style></head><body><button id="touch">Tap</button></body></html>');
  await page.addScriptTag({ content: helperBundle });
  await page.addScriptTag({ content: cursorBundle });
  await page.evaluate(async (assets) => {
    const createUrl = URL.createObjectURL.bind(URL);
    const revokeUrl = URL.revokeObjectURL.bind(URL);
    window.__activeClickUrls = new Set();
    URL.createObjectURL = (blob) => {
      const url = createUrl(blob);
      window.__activeClickUrls.add(url);
      return url;
    };
    URL.revokeObjectURL = (url) => { window.__activeClickUrls.delete(url); revokeUrl(url); };
    window.__clickControllers = {};
    await Promise.all(Object.entries(assets).map(async ([format, source], index) => {
      const controller = window.__clickMedia.createCursorClickEffects({
        clickImage: source, clickImageSize: 160, clickImageDuration: 7000
      }, document.body);
      window.__clickControllers[format] = controller;
      const node = await controller.spawn(110 + index * 190, 220);
      node.id = `click-${format}`;
    }));
  }, sources);
  await page.waitForFunction(() => [...document.querySelectorAll('.kt-cursor-click-image')]
    .every((image) => image.complete && image.naturalWidth > 0));
  const firstCycle = Object.fromEntries(Object.keys(sources).map((format) => [format, []]));
  for (let sample = 0; sample < 4; sample += 1) {
    for (const format of Object.keys(sources)) firstCycle[format].push(await hashImage(`#click-${format}`));
    await page.waitForTimeout(110);
  }
  for (const [format, hashes] of Object.entries(firstCycle)) {
    assert.ok(new Set(hashes).size > 1, `${browserName} ${format} must display multiple frames on its first play`);
  }
  await page.waitForTimeout(1100);
  const finalFrames = {};
  for (const format of Object.keys(sources)) finalFrames[format] = await hashImage(`#click-${format}`);
  await page.waitForTimeout(500);
  for (const format of Object.keys(sources)) {
    assert.equal(await hashImage(`#click-${format}`), finalFrames[format],
      `${browserName} ${format} must stop after one complete 960ms cycle`);
    assert.ok(firstCycle[format].some((frame) => frame !== finalFrames[format]),
      `${format} must not merely freeze on the first observed frame`);
  }
  await page.evaluate(async () => {
    await Promise.all(Object.entries(window.__clickControllers).map(async ([format, controller], index) => {
      const node = await controller.spawn(110 + index * 190, 400);
      node.id = `restart-${format}`;
    }));
  });
  await page.waitForFunction(() => [...document.querySelectorAll('[id^="restart-"]')]
    .every((image) => image.complete && image.naturalWidth > 0));
  for (const format of Object.keys(sources)) {
    assert.notEqual(await hashImage(`#restart-${format}`), finalFrames[format],
      `${browserName} ${format} must restart instead of reusing the finished decoder`);
  }
  const cleanup = await page.evaluate(() => {
    Object.values(window.__clickControllers).forEach((controller) => controller.destroy());
    return { nodes: document.querySelectorAll('.kt-cursor-click-image').length, urls: window.__activeClickUrls.size };
  });
  assert.deepEqual(cleanup, { nodes: 0, urls: 0 });

  const spriteTiming = await page.evaluate(async () => {
    const results = [];
    for (const frames of [1, 2, 8]) {
      const controller = window.__clickMedia.createCursorClickEffects({
        clickSprite: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="768" height="96"/>',
        clickSpriteWidth: 96, clickSpriteHeight: 96, clickSpriteFrames: frames,
        clickSpriteDuration: 100000
      }, document.body);
      const node = controller.spawn(100, 100);
      const animation = node.getAnimations()[0];
      animation.pause();
      const samples = [];
      for (let frame = 0; frame < frames; frame += 1) {
        for (const fraction of [0.25, 0.75]) {
          animation.currentTime = (frame + fraction) / frames * 100000;
          await new Promise(requestAnimationFrame);
          samples.push({ expected: -frame * 96, actual: Number.parseFloat(getComputedStyle(node).backgroundPositionX) });
        }
      }
      animation.currentTime = 100000;
      await new Promise(requestAnimationFrame);
      samples.push({ expected: -(frames - 1) * 96, actual: Number.parseFloat(getComputedStyle(node).backgroundPositionX) });
      results.push({ frames, samples });
      controller.destroy();
    }
    return { results, nodes: document.querySelectorAll('.kt-cursor-click-sprite').length,
      styles: document.querySelectorAll('style[data-uid]').length };
  });
  for (const { frames, samples } of spriteTiming.results) {
    assert.ok(samples.every(({ expected, actual }) => Math.abs(expected - actual) < 0.1),
      `${browserName}: ${frames}-frame sheet must display every frame for equal time and stop on its last frame (${JSON.stringify(samples)})`);
  }
  assert.equal(spriteTiming.nodes, 0);
  assert.equal(spriteTiming.styles, 0);

  // The real touch-only module path must use the same image controller.
  await page.evaluate((source) => {
    Object.defineProperty(navigator, 'maxTouchPoints', { value: 1, configurable: true });
    const target = document.querySelector('#touch');
    const module = window.__cursorModule.default || window.__cursorModule;
    window.__touchCursor = module.create(target, { clickImage: source, clickImageDuration: 100 });
    target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 100, clientY: 100, pointerType: 'touch' }));
  }, sources.apng);
  await page.waitForFunction(() => document.querySelector('.kt-cursor-click-image')?.naturalWidth > 0);
  await page.waitForFunction(() => !document.querySelector('.kt-cursor-click-image'));
  assert.equal(await page.evaluate(() => window.__activeClickUrls.size), 0, 'natural expiration must revoke its Blob URL');
  await page.evaluate(() => window.__touchCursor.destroy());
  assert.deepEqual(errors, [], 'click images must not cause browser runtime errors');
  console.log(`Cursor click media (${browserName}) OK — real GIF/APNG/WebP frames animate once, stop, restart, expire, and clean up.`);
} finally {
  await browser.close();
}
