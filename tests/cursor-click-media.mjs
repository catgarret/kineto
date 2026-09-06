import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import {
  createCursorClickEffects,
  normalizeClickImageLoop
} from '../src/modules/cursor/clickEffects.js';
import cursorModule from '../src/modules/cursor.js';
import { listTerminalFramePresets, resolveTerminalFramePreset } from '../src/modules/loadingIndicator/terminalFramePresets.js';

const root = path.resolve(import.meta.dirname, '..');
const assets = {
  gif: fs.readFileSync(path.join(root, 'demo/assets/motion-demo.gif')),
  webp: fs.readFileSync(path.join(root, 'demo/assets/motion-demo.webp')),
  apng: fs.readFileSync(path.join(root, 'demo/assets/motion-demo.png'))
};
const ascii = (bytes, start, length) => String.fromCharCode(...bytes.subarray(start, start + length));

assert.equal(listTerminalFramePresets().filter((preset) => preset.id.startsWith('quad-dot-')).length, 1,
  'the public terminal catalog must expose only one Quad Dot animation');
assert.equal(resolveTerminalFramePreset('quad-dot-pulse'), resolveTerminalFramePreset('quad-dot-chase'),
  'old Pulse options must resolve to the retained Chase implementation');
const demoDocument = new JSDOM(fs.readFileSync(path.join(root, 'demo/index.html'), 'utf8')).window.document;
assert.equal(demoDocument.querySelector('[data-kt-terminal-style="quad-dot-pulse"]'), null,
  'the duplicate Pulse card must not remain in the public demo');
assert.equal(demoDocument.querySelector('[data-kt-terminal-style="quad-dot-chase"]').closest('.card').dataset.demoMergedCard,
  'Quad Dot Pulse', 'the survivor must reserve the removed card’s shared-link identity');

const gif = normalizeClickImageLoop(assets.gif);
assert.equal(gif.format, 'gif');
assert.equal(gif.animated, true);
assert.equal(gif.normalized, true);
assert.ok(assets.gif.includes(Buffer.from('NETSCAPE2.0')), 'GIF fixture must exercise an authored repeat extension');
assert.equal(Buffer.from(gif.bytes).includes(Buffer.from('NETSCAPE2.0')), false, 'one-shot GIF must remove NETSCAPE2.0');
assert.equal(Buffer.from(gif.bytes).includes(Buffer.from('ANIMEXTS1.0')), false, 'one-shot GIF must remove ANIMEXTS1.0');
assert.equal(ascii(gif.bytes, 0, 6), 'GIF89a', 'GIF frame stream must stay intact');
assert.equal(gif.bytes.at(-1), 0x3b, 'GIF trailer must survive loop-extension removal');

const webp = normalizeClickImageLoop(assets.webp);
assert.equal(webp.format, 'webp');
assert.equal(webp.animated, true);
assert.equal(webp.normalized, true);
let webpOffset = 12;
let webpLoop = null;
const webpView = new DataView(webp.bytes.buffer, webp.bytes.byteOffset, webp.bytes.byteLength);
while (webpOffset + 8 <= webp.bytes.length) {
  const type = ascii(webp.bytes, webpOffset, 4);
  const length = webpView.getUint32(webpOffset + 4, true);
  if (type === 'ANIM') webpLoop = webpView.getUint16(webpOffset + 12, true);
  webpOffset += 8 + length + (length & 1);
}
assert.equal(webpLoop, 1, 'WebP ANIM loop count must be one total play');

const crcTable = new Uint32Array(256);
for (let index = 0; index < 256; index += 1) {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  crcTable[index] = value >>> 0;
}
const crc32 = (bytes, start, end) => {
  let value = 0xffffffff;
  for (let index = start; index < end; index += 1) value = crcTable[(value ^ bytes[index]) & 0xff] ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
};
const apng = normalizeClickImageLoop(assets.apng);
assert.equal(apng.format, 'apng');
assert.equal(apng.animated, true);
assert.equal(apng.normalized, true);
const apngView = new DataView(apng.bytes.buffer, apng.bytes.byteOffset, apng.bytes.byteLength);
let pngOffset = 8;
let apngChunk = null;
while (pngOffset + 12 <= apng.bytes.length) {
  const length = apngView.getUint32(pngOffset, false);
  if (ascii(apng.bytes, pngOffset + 4, 4) === 'acTL') apngChunk = { offset: pngOffset, length };
  pngOffset += 12 + length;
}
assert.ok(apngChunk, 'APNG fixture must contain acTL');
assert.equal(apngView.getUint32(apngChunk.offset + 12, false), 1, 'APNG num_plays must be one');
assert.equal(
  apngView.getUint32(apngChunk.offset + 8 + apngChunk.length, false),
  crc32(apng.bytes, apngChunk.offset + 4, apngChunk.offset + 8 + apngChunk.length),
  'APNG acTL CRC must be recomputed after changing num_plays'
);

const unknown = normalizeClickImageLoop(Uint8Array.from([1, 2, 3, 4]));
assert.equal(unknown.format, null);
assert.equal(unknown.normalized, false);
for (const image of [gif, webp, apng]) {
  assert.equal(image.duration, 960, `${image.format} must read the complete encoded cycle`);
}

const dom = new JSDOM('<!doctype html><html><head></head><body><div id="host"></div></body></html>', {
  pretendToBeVisual: true,
  url: 'https://example.test/demo/'
});
const { window } = dom;
const revoked = [];
let objectUrlSequence = 0;
const blobs = [];
window.URL.createObjectURL = (blob) => {
  blobs.push(blob);
  return `blob:https://example.test/${++objectUrlSequence}`;
};
window.URL.revokeObjectURL = (url) => revoked.push(url);
window.fetch = async () => ({
  ok: true,
  headers: { get: () => 'application/octet-stream' },
  arrayBuffer: async () => assets.gif.buffer.slice(assets.gif.byteOffset, assets.gif.byteOffset + assets.gif.byteLength)
});
const host = window.document.getElementById('host');
const controller = createCursorClickEffects({
  clickImage: './assets/motion-demo.gif',
  clickImageDuration: 1000,
  clickImageSize: 120
}, host, 100);
const first = await controller.spawn(24, 36);
const second = await controller.spawn(48, 72);
assert.equal(host.querySelectorAll('.kt-cursor-click-image').length, 2, 'simultaneous clicks must keep independent image nodes');
assert.notEqual(first.src, second.src, 'each click must receive a fresh Blob URL and restart at frame one');
assert.equal(first.dataset.ktClickImageFormat, 'gif');
assert.equal(first.dataset.ktClickImageLoop, 'one');
assert.equal(first.style.left, '24px');
assert.equal(first.style.width, '120px');
assert.equal(blobs[0].type, 'image/gif', 'verified signature must supply MIME for generic server responses');
controller.destroy();
assert.equal(host.childElementCount, 0, 'destroy must remove active click images');
assert.deepEqual(new Set(revoked), new Set([first.src, second.src]), 'destroy must revoke every click Blob URL');
assert.equal(controller.spawn(0, 0), null, 'destroyed controllers must ignore later clicks');

let finishFetch;
let slowSignal;
window.fetch = (_url, options) => {
  slowSignal = options.signal;
  return new Promise((resolve) => { finishFetch = resolve; });
};
const slow = createCursorClickEffects({ clickImage: './slow.gif' }, host);
const pendingClick = slow.spawn(1, 2);
slow.destroy();
assert.equal(slowSignal.aborted, true, 'destroy must abort a pending image request');
finishFetch({ ok: true, arrayBuffer: async () => assets.gif });
assert.equal(await pendingClick, null, 'a fetch that settles after destroy must not create click UI');
assert.equal(host.childElementCount, 0);

// A slow decode must not consume the display lifetime. The default lifetime
// covers the actual encoded cycle rather than cutting a 960ms image at 700ms.
window.fetch = async () => ({ ok: true, arrayBuffer: async () => assets.gif });
const originalSetTimeout = window.setTimeout;
const originalClearTimeout = window.clearTimeout;
let clock = 0;
let timerId = 0;
const pendingTimers = new Map();
window.setTimeout = (callback, delay) => {
  const id = ++timerId;
  pendingTimers.set(id, { at: clock + delay, callback });
  return id;
};
window.clearTimeout = (id) => pendingTimers.delete(id);
const advance = (milliseconds) => {
  clock += milliseconds;
  for (const [id, timer] of pendingTimers) {
    if (timer.at <= clock) { pendingTimers.delete(id); timer.callback(); }
  }
};
const delayedLoad = createCursorClickEffects({ clickImage: './delayed.gif' }, host);
const delayedNode = await delayedLoad.spawn(1, 2);
advance(3000);
assert.equal(delayedNode.isConnected, true, 'the playback timer must not run before decoding completes');
delayedNode.dispatchEvent(new window.Event('load'));
advance(1000);
assert.equal(delayedNode.isConnected, true, 'default display time must include the full encoded 960ms cycle plus final-frame grace');
advance(50);
assert.equal(delayedNode.isConnected, false, 'the automatic full-cycle lifetime must expire');
assert.equal(pendingTimers.size, 0, 'replacing the stalled-load timer must not leak it');
delayedLoad.destroy();
const zeroDuration = createCursorClickEffects({ clickImage: './auto.gif', clickImageDuration: 0 }, host);
const automaticNode = await zeroDuration.spawn(1, 2);
automaticNode.dispatchEvent(new window.Event('load'));
advance(1000);
assert.equal(automaticNode.isConnected, true, 'zero duration must select the complete encoded cycle, not an 80ms minimum');
advance(50);
assert.equal(automaticNode.isConnected, false, 'zero duration must expire after the automatic cycle');
zeroDuration.destroy();
const positiveDuration = createCursorClickEffects({ clickImage: './explicit.gif', clickImageDuration: 1800 }, host);
const explicitNode = await positiveDuration.spawn(1, 2);
explicitNode.dispatchEvent(new window.Event('load'));
advance(1500);
assert.equal(explicitNode.isConnected, true, 'a positive duration must override the shorter encoded cycle');
advance(300);
assert.equal(explicitNode.isConnected, false, 'a positive duration must expire at the requested lifetime');
positiveDuration.destroy();
assert.equal(pendingTimers.size, 0);
let timeoutSignal;
window.fetch = (_url, options) => {
  timeoutSignal = options.signal;
  return new Promise(() => {});
};
const stalledFetch = createCursorClickEffects({ clickImage: './never-responds.gif' }, host);
const stalledClick = stalledFetch.spawn(1, 2);
advance(15000);
const timedFallback = await stalledClick;
assert.equal(timeoutSignal.aborted, true, 'fetch must abort at its 15s deadline');
assert.equal(timedFallback.dataset.ktClickImageLoop, 'duration-fallback', 'a stalled fetch must settle into the bounded image fallback');
stalledFetch.destroy();
assert.equal(pendingTimers.size, 0, 'deadline and fallback loading timers must both clear on destroy');
const cancelledFetch = createCursorClickEffects({ clickImage: './destroy-before-response.gif' }, host);
const cancelledClick = cancelledFetch.spawn(1, 2);
cancelledFetch.destroy();
assert.equal(await cancelledClick, null, 'destroy must settle queued clicks even when fetch ignores abort');
assert.equal(pendingTimers.size, 0, 'destroy must immediately clear the pending fetch deadline');
window.setTimeout = originalSetTimeout;
window.clearTimeout = originalClearTimeout;

window.fetch = async () => { throw new TypeError('CORS blocked'); };
const fallback = createCursorClickEffects({
  clickImage: 'https://cdn.invalid/effect.webp?size=2#frame',
  clickImageDuration: 1000
}, host, 100);
const fallbackNode = await fallback.spawn(10, 20);
assert.equal(fallbackNode.dataset.ktClickImageLoop, 'duration-fallback');
assert.match(fallbackNode.src, /effect\.webp\?size=2&kt-click=\d+-1#frame$/, 'fallback cache buster must preserve query and fragment ordering');
fallbackNode.dispatchEvent(new window.Event('error'));
assert.equal(host.childElementCount, 0, 'failed fallback images must be removed without another request');
fallback.destroy();
assert.equal(host.childElementCount, 0, 'fallback destroy must remove its image');

window.fetch = async () => ({ ok: true, arrayBuffer: async () => assets.gif });
const failedBlob = createCursorClickEffects({ clickImage: './blocked-blob.gif' }, host);
const failedNode = await failedBlob.spawn(1, 1);
failedNode.dispatchEvent(new window.Event('error'));
assert.equal(failedNode.dataset.ktClickImageLoop, 'duration-fallback', 'Blob policy failures get one source-image fallback');
const fallbackSource = failedNode.src;
failedNode.dispatchEvent(new window.Event('error'));
assert.equal(host.childElementCount, 0, 'second image error must clean up instead of retrying');
assert.equal(failedNode.src, fallbackSource);
failedBlob.destroy();

const sprite = createCursorClickEffects({
  clickSprite: './assets/click-burst.svg',
  clickSpriteWidth: 96,
  clickSpriteHeight: 96,
  clickSpriteFrames: 8,
  clickSpriteDuration: 480
}, host, 100);
const spriteNode = sprite.spawn(32, 40);
assert.match(spriteNode.style.animation, /480ms steps\(8,\s*jump-none\) forwards/, 'sprite sheet must divide its duration equally across all eight frames');
assert.match(window.document.head.querySelector('style[data-uid]').textContent, /-672px 0/, 'sprite must stop on its last real frame, not the blank position beyond the sheet');
assert.equal(window.document.head.querySelectorAll('style[data-uid]').length, 1);
sprite.destroy();
assert.equal(host.childElementCount, 0);
assert.equal(window.document.head.querySelectorAll('style[data-uid]').length, 0, 'sprite keyframes must clean up');

// The touch-only cursor delegates to the same controller instead of maintaining
// a second implementation with different media and cleanup behavior.
Object.assign(globalThis, {
  window,
  document: window.document,
  Image: window.Image
});
window.fetch = async () => ({
  ok: true,
  headers: { get: () => 'image/webp' },
  arrayBuffer: async () => assets.webp.buffer.slice(assets.webp.byteOffset, assets.webp.byteOffset + assets.webp.byteLength)
});
const touchTarget = window.document.createElement('button');
window.document.body.appendChild(touchTarget);
const touchCursor = cursorModule._clickEffectsOnly(touchTarget, {
  clickImage: './assets/motion-demo.webp',
  clickImageDuration: 1000
});
touchTarget.dispatchEvent(new window.MouseEvent('pointerdown', { bubbles: true, clientX: 12, clientY: 18 }));
await new Promise((resolve) => setTimeout(resolve, 0));
assert.equal(window.document.querySelector('.kt-cursor-click-image')?.dataset.ktClickImageFormat, 'webp');
touchCursor.destroy();
assert.equal(window.document.querySelector('.kt-cursor-click-image'), null, 'touch destroy must use shared image cleanup');

console.log('Cursor click media OK — GIF/APNG/WebP one-shot metadata, fallback, concurrency, sprite, and touch cleanup.');
