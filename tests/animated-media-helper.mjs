/* global Buffer, document, getComputedStyle, Kineto, window */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const toDataUri = async (root, path, mime) => `data:${mime};base64,${(await readFile(resolve(root, path))).toString('base64')}`;

export async function runAnimatedMediaQa(browser, root) {
  const sources = {
    gif: await toDataUri(root, 'demo/assets/motion-demo.gif', 'image/gif'),
    webp: await toDataUri(root, 'demo/assets/motion-demo.webp', 'image/webp'),
    apng: await toDataUri(root, 'demo/assets/motion-demo.png', 'image/png'),
    mp4: await toDataUri(root, 'demo/assets/motion-demo.mp4', 'video/mp4')
  };

  const page = await browser.newPage({ viewport: { width: 900, height: 700 }, reducedMotion: 'no-preference' });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.stack || error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });

  try {
    await page.setContent('<!doctype html><html><head><style>body{margin:0}.host{width:320px;height:200px;position:relative;margin:20px}.host img,.host video{width:100%;height:100%;object-fit:cover}</style></head><body><div id="root"></div></body></html>');
    await page.addStyleTag({ path: resolve(root, 'dist/kineto.css') });
    await page.addScriptTag({ path: resolve(root, 'dist/kineto.umd.js') });
    const cdp = await page.context().newCDPSession(page);
    const sleep = (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));

    async function changes(selector) {
      const locator = page.locator(selector);
      await locator.waitFor({ state: 'visible', timeout: 7000 });
      const box = await locator.boundingBox();
      assert.ok(box && box.width > 1 && box.height > 1, `${selector} has no box`);
      const hashes = [];
      for (let index = 0; index < 10; index += 1) {
        const shot = await cdp.send('Page.captureScreenshot', {
          format: 'png',
          fromSurface: true,
          clip: { x: box.x, y: box.y, width: box.width, height: box.height, scale: 1 }
        });
        hashes.push(createHash('sha1').update(Buffer.from(shot.data, 'base64')).digest('hex'));
        await sleep(140);
      }
      return new Set(hashes).size > 1;
    }

    const formatCases = [
      ['gif', sources.gif, 'print'],
      ['webp', sources.webp, 'dissolve'],
      ['apng', sources.apng, 'skeleton']
    ];
    const formatResults = {};

    for (const [name, src, effect] of formatCases) {
      await page.evaluate(({ name, src, effect }) => {
        const host = document.createElement('div');
        host.id = `host-${name}`;
        host.className = 'host';
        const image = document.createElement('img');
        image.id = `image-${name}`;
        image.dataset.src = src;
        host.appendChild(image);
        document.querySelector('#root').appendChild(host);
        const lazy = Kineto.lazy(image, { effect, src, nativeLazy: false, rootMargin: '10000px', duration: 0.45, minDuration: effect === 'skeleton' ? 160 : 0, delay: 0 });
        const ambient = Kineto.ambientMedia(host, { blur: 20, opacity: 0.62 });
        const lightbox = Kineto.lightbox(image, { src, duration: 0, minimap: true, title: name });
        window.__mediaQa = { lazy, ambient, lightbox };
      }, { name, src, effect });

      await page.waitForFunction((formatName) => {
        const image = document.querySelector(`#image-${formatName}`);
        return image?.complete && image.naturalWidth > 0 && getComputedStyle(image).opacity === '1';
      }, name, { timeout: 7000 });

      const originalMoving = await changes(`#image-${name}`);
      const cloneSelector = `#host-${name} .kt-ambient-image-clone`;
      const cloneMoving = await changes(cloneSelector);
      await page.evaluate(() => window.__mediaQa.lightbox.open());
      await page.waitForFunction(() => {
        const image = document.querySelector('#kt-lightbox .kt-lightbox-image');
        return image?.complete && image.naturalWidth > 0 && !document.querySelector('#kt-lightbox').hidden;
      }, { timeout: 7000 });
      const viewerMoving = await changes('#kt-lightbox .kt-lightbox-image');
      const tags = await page.evaluate((formatName) => ({
        original: document.querySelector(`#image-${formatName}`)?.tagName,
        clone: document.querySelector(`#host-${formatName} .kt-ambient-image-clone`)?.tagName,
        viewer: document.querySelector('#kt-lightbox .kt-lightbox-image')?.tagName
      }), name);
      formatResults[name] = { originalMoving, cloneMoving, viewerMoving, tags };
      await page.evaluate(() => {
        window.__mediaQa.lightbox.close();
        window.__mediaQa.lightbox.destroy();
        window.__mediaQa.ambient.destroy();
        window.__mediaQa.lazy.destroy();
        document.querySelector('.host')?.remove();
        delete window.__mediaQa;
      });
      await sleep(40);
    }

    const video = await page.evaluate(async (src) => {
      const host = document.createElement('div');
      host.id = 'video-host';
      host.className = 'host';
      const media = document.createElement('video');
      media.id = 'ambient-video';
      media.src = src;
      media.muted = true;
      media.loop = true;
      media.autoplay = true;
      media.playsInline = true;
      host.appendChild(media);
      document.querySelector('#root').appendChild(host);
      await media.play().catch(() => {});
      const wait = async (test) => {
        for (let index = 0; index < 160; index += 1) {
          if (test()) return true;
          await new Promise((resolveWait) => setTimeout(resolveWait, 40));
        }
        return false;
      };
      const ready = await wait(() => media.readyState >= 2 && media.currentTime > 0);
      const instance = Kineto.ambientMedia(host, { sampleFps: 12, blur: 24 });
      const sampled = await wait(() => Number(host.querySelector('.kt-ambient-video-canvas')?.dataset.frames || 0) >= 3);
      const before = media.currentTime;
      await new Promise((resolveWait) => setTimeout(resolveWait, 350));
      const advancing = media.currentTime > before;
      const frames = Number(host.querySelector('.kt-ambient-video-canvas')?.dataset.frames || 0);
      instance.destroy();
      media.pause();
      host.remove();
      return { ready, sampled, advancing, frames };
    }, sources.mp4);

    await page.evaluate(() => Kineto.destroy());
    const instanceCount = await page.evaluate(() => Kineto.instanceCount);

    for (const [name, state] of Object.entries(formatResults)) {
      assert.equal(state.originalMoving, true, `${name} original animation froze`);
      assert.equal(state.cloneMoving, true, `${name} ambient clone froze`);
      assert.equal(state.viewerMoving, true, `${name} lightbox image froze`);
      assert.deepEqual(Object.values(state.tags), ['IMG', 'IMG', 'IMG']);
    }
    assert.equal(video.ready, true, 'video did not start');
    assert.equal(video.sampled, true, 'ambient video canvas did not sample frames');
    assert.equal(video.advancing, true, 'video stopped while ambient was active');
    assert.ok(video.frames >= 3);
    assert.equal(instanceCount, 0, 'animated-media QA leaked instances');
    assert.deepEqual(errors, [], `animated media runtime errors:\n${errors.join('\n')}`);
  } finally {
    await page.close().catch(() => {});
  }
}
