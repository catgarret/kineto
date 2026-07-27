// Real headless-Chromium measurement harness for the toast + loader bugs.
// Serves the repo over http, drives the demo page, prints hard measurements.
// Run: LD_LIBRARY_PATH=/tmp/xstub node tests/browser/measure.mjs
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CHROME = process.env.KT_CHROME || undefined; // portable: normal 'npx playwright install' needs no path
const MIME = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.woff2':'font/woff2' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  let fp = path.join(root, p);
  if (fp.endsWith('/')) fp = path.join(fp, 'index.html');
  fs.readFile(fp, (err, buf) => {
    if (err) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, { 'content-type': MIME[path.extname(fp)] || 'application/octet-stream' });
    res.end(buf);
  });
});
await new Promise((r) => server.listen(0, r));
const PORT = server.address().port;

const browser = await chromium.launch({ headless: true, ...(CHROME ? { executablePath: CHROME } : {}), args: ['--no-sandbox','--disable-setuid-sandbox','--disable-gpu'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on('pageerror', (e) => console.log('PAGEERROR:', e.message));
await page.goto(`http://localhost:${PORT}/demo/index.html`, { waitUntil: 'load' });
await page.waitForFunction(() => window.Kineto && document.querySelector('[data-kt-toast]'), null, { timeout: 15000 }).catch(() => console.log('WARN: not ready'));
await page.waitForTimeout(1200);
const sleep = (ms) => page.waitForTimeout(ms);
let pass = 0, fail = 0;
const check = (name, cond, detail) => { console.log(`  [${cond ? 'PASS' : 'FAIL'}] ${name}${detail ? ' — ' + detail : ''}`); cond ? pass++ : fail++; };

// ---------------- TOAST ----------------
console.log('\n===== TOAST =====');
const toastBtn = await page.$('[data-kt-toast]');
const toastDuration = Number(await toastBtn.getAttribute('data-kt-duration')) || 5000;
await toastBtn.scrollIntoViewIfNeeded();
await toastBtn.click();
// The demo defers init; if the first click landed before the toast module was
// bound, retry until the toast actually appears (max ~1s).
for (let i = 0; i < 10; i++) {
  if (await page.evaluate(() => !!document.querySelector('.kt-toast-region .kt-toast'))) break;
  await sleep(100); await toastBtn.click();
}
const readToast = () => page.evaluate(() => {
  const t = document.querySelector('.kt-toast-region .kt-toast');
  if (!t) return { present: false };
  const cs = getComputedStyle(t);
  return { present: true, opacity: +(+cs.opacity).toFixed(3), display: cs.display };
});
const samples = {};
for (const [label, delay] of [
  ['100ms', 100],
  ['500ms', 400],
  ['before timeout', Math.max(0, toastDuration - 1500)]
]) {
  await sleep(delay);
  samples[label] = await readToast();
  console.log(`  t=${label}:`, JSON.stringify(samples[label]));
}
check('toast visible (opacity>=0.9) at 500ms', samples['500ms'].present && samples['500ms'].opacity >= 0.9, `opacity=${samples['500ms'].opacity}`);
check('toast visible before configured timeout', samples['before timeout'].present && samples['before timeout'].opacity >= 0.9, `duration=${toastDuration} opacity=${samples['before timeout'].opacity}`);
await sleep(1800);
const afterToastTimeout = await readToast();
console.log('  t=after timeout:', JSON.stringify(afterToastTimeout));
check('toast removed after configured timeout', !afterToastTimeout.present, `duration=${toastDuration} present=${afterToastTimeout.present}`);

// ---------------- SLIDER HOVER AUTOPLAY ----------------
console.log('\n===== SLIDER hover autoplay =====');
const dissolveSlider = page.locator('.slider-demo--dissolve').first();
await dissolveSlider.scrollIntoViewIfNeeded();
await page.mouse.move(4, 4);
const sliderTiming = await dissolveSlider.evaluate((slider) => {
  window.Kineto.destroyModule(slider, 'slider');
  const instance = window.Kineto.create('slider', slider, {
    effect: 'fade',
    loop: 'rewind',
    autoplay: 500,
    pauseOnHover: true,
    progress: true,
    progressType: 'ring'
  });
  window.__KT_SLIDER_HOVER_QA__ = instance;
  return { index: instance.index };
});
await sleep(260);
await dissolveSlider.hover();
const hoverStarted = await dissolveSlider.evaluate(() => {
  const progress = document.querySelector('.slider-demo--dissolve .kt-slider-progress__fill');
  return {
    index: window.__KT_SLIDER_HOVER_QA__.index,
    offset: Number(progress?.style.strokeDashoffset)
  };
});
await sleep(420);
const hoverHeld = await dissolveSlider.evaluate(() => {
  const progress = document.querySelector('.slider-demo--dissolve .kt-slider-progress__fill');
  return {
    index: window.__KT_SLIDER_HOVER_QA__.index,
    offset: Number(progress?.style.strokeDashoffset)
  };
});
check('slider hover pauses past the original autoplay deadline', hoverHeld.index === hoverStarted.index, `${hoverStarted.index} -> ${hoverHeld.index}`);
check('slider hover freezes the elapsed progress', Math.abs(hoverHeld.offset - hoverStarted.offset) < 0.03, `${hoverStarted.offset} -> ${hoverHeld.offset}`);
await page.mouse.move(4, 4);
await sleep(310);
const hoverResumedIndex = await dissolveSlider.evaluate(() => window.__KT_SLIDER_HOVER_QA__.index);
check(
  'slider leave resumes from remaining time instead of zero',
  hoverResumedIndex !== hoverStarted.index,
  `${hoverStarted.index} -> ${hoverResumedIndex}`
);

await dissolveSlider.evaluate((slider) => {
  window.Kineto.destroyModule(slider, 'slider');
  window.__KT_SLIDER_DEFAULT_HOVER_QA__ = window.Kineto.create('slider', slider, {
    effect: 'fade',
    loop: 'rewind',
    autoplay: 320
  });
});
await dissolveSlider.hover();
const defaultHoverStart = await dissolveSlider.evaluate(() => window.__KT_SLIDER_DEFAULT_HOVER_QA__.index);
await sleep(390);
const defaultHoverEnd = await dissolveSlider.evaluate(() => window.__KT_SLIDER_DEFAULT_HOVER_QA__.index);
check(
  'slider hover does not pause unless pauseOnHover is enabled',
  defaultHoverEnd !== defaultHoverStart,
  `${defaultHoverStart} -> ${defaultHoverEnd}`
);

const coverflowPreview = await page.locator('[data-kt-slider="coverflow"]').first().evaluate((slider) => {
  const viewport = slider.querySelector('.kt-slider-wrap')?.getBoundingClientRect();
  const slides = [...slider.querySelectorAll('.kt-slide')].map((slide) => slide.getBoundingClientRect());
  const intersect = (rect) => Math.max(0, Math.min(rect.right, viewport.right) - Math.max(rect.left, viewport.left));
  return {
    viewport: viewport?.width || 0,
    visibleParts: slides.map(intersect),
    active: window.Kineto.getInstance(slider, 'slider')?.index
  };
});
check(
  'coverflow keeps adjacent-card previews visible',
  coverflowPreview.visibleParts.filter((width) => width >= 20).length >= 3,
  JSON.stringify(coverflowPreview)
);

// ---------------- CURSOR PER-ELEMENT PILL ----------------
console.log('\n===== CURSOR per-element pill =====');
const cursorStage = page.locator('.cursor-custom-stage').first();
await cursorStage.scrollIntoViewIfNeeded();
const cursorTarget = cursorStage.locator('.cursor-target').first();
const cursorTargetBox = await cursorTarget.boundingBox();
await page.mouse.move(
  cursorTargetBox.x + cursorTargetBox.width * 0.55,
  cursorTargetBox.y + cursorTargetBox.height * 0.5
);
await sleep(320);
const cursorHover = await cursorStage.evaluate((stage) => {
  const instance = window.Kineto.getInstance(stage, 'cursor');
  const cursor = instance?.cursor;
  const follower = cursor?.querySelector('.kt-cursor-follower');
  const dot = cursor?.querySelector('.kt-cursor-dot');
  const label = cursor?.querySelector('.kt-cursor-label');
  const followerStyle = follower ? getComputedStyle(follower) : null;
  return {
    active: cursor?.classList.contains('is-hover') || false,
    label: label?.textContent || '',
    labelOpacity: label ? Number(getComputedStyle(label).opacity) : 0,
    width: follower ? follower.getBoundingClientRect().width : 0,
    height: follower ? follower.getBoundingClientRect().height : 0,
    background: followerStyle?.backgroundColor || '',
    dotOpacity: dot ? Number(getComputedStyle(dot).opacity) : 1
  };
});
check('cursor uses the target label', cursorHover.label === 'PLAY' && cursorHover.labelOpacity > 0.9, JSON.stringify(cursorHover));
check('cursor morphs into a compact capsule', cursorHover.width > cursorHover.height && cursorHover.height >= 36, `${cursorHover.width}×${cursorHover.height}`);
check('cursor uses the target color and hides the inner dot', cursorHover.background === 'rgb(22, 183, 119)' && cursorHover.dotOpacity < 0.1, `${cursorHover.background}, dot=${cursorHover.dotOpacity}`);
await page.mouse.move(4, 4);
await sleep(320);
const cursorRest = await cursorStage.evaluate((stage) => {
  const follower = window.Kineto.getInstance(stage, 'cursor')?.cursor?.querySelector('.kt-cursor-follower');
  return follower ? { width: follower.getBoundingClientRect().width, height: follower.getBoundingClientRect().height } : {};
});
check('cursor restores the base ring after leave', Math.abs(cursorRest.width - 32) < 0.5 && Math.abs(cursorRest.height - 32) < 0.5, JSON.stringify(cursorRest));

// ---------------- LOADER ----------------
console.log('\n===== LOADER =====');
const state = () => page.evaluate(() => {
  const nav = document.querySelector('.side-nav') || document.querySelector('[class*="side-nav"]');
  return {
    overlays: document.querySelectorAll('.kt-demo-loader-overlay').length,
    bodyOverflow: document.body.style.overflow || '(empty)',
    htmlOverflow: document.documentElement.style.overflow || '(empty)',
    navTop: nav ? Math.round(nav.getBoundingClientRect().top) : null,
    navPos: nav ? getComputedStyle(nav).position : null,
    instanceCount: window.Kineto?.instanceCount ?? null
  };
});
await page.evaluate(() => window.scrollTo(0, 0));
await sleep(300);
const before = await state(); console.log('  before:', JSON.stringify(before));
const loaderBtn = await page.$('.loader-demo-button[data-loader-type="slot"]');
await loaderBtn.click();
await sleep(60);
const during = await state(); console.log('  +60ms:', JSON.stringify(during));
check('exactly 1 overlay per click', during.overlays === 1, `overlays=${during.overlays}`);
check('scrollbar hidden during loader (overflow:hidden)', during.bodyOverflow === 'hidden' && during.htmlOverflow === 'hidden', `body=${during.bodyOverflow} html=${during.htmlOverflow}`);
await sleep(4300);
const after = await state(); console.log('  +4.36s:', JSON.stringify(after));
check('overlays cleared after', after.overlays === 0, `overlays=${after.overlays}`);
check('body overflow RESTORED after (scrollbar back)', after.bodyOverflow === before.bodyOverflow, `${before.bodyOverflow} -> ${after.bodyOverflow}`);
check('html overflow RESTORED after', after.htmlOverflow === before.htmlOverflow, `${before.htmlOverflow} -> ${after.htmlOverflow}`);
check('sticky nav restored after', after.navTop === before.navTop, `navTop ${before.navTop} -> ${after.navTop}`);
check('instanceCount back to baseline', after.instanceCount === before.instanceCount, `${before.instanceCount} -> ${after.instanceCount}`);
const scrolled = await page.evaluate(async () => { const y0 = window.scrollY; window.scrollBy(0, 200); await new Promise(r=>setTimeout(r,100)); return { moved: window.scrollY !== y0, y: window.scrollY }; });
check('page scrolls after loader', scrolled.moved, JSON.stringify(scrolled));

// rapid clicks
console.log('\n===== LOADER rapid clicks =====');
await page.evaluate(() => window.scrollTo(0, 0)); await sleep(200);
const base2 = await state();
await loaderBtn.click(); await loaderBtn.click(); await loaderBtn.click();
await sleep(60);
const rc = await state(); console.log('  after 3 rapid clicks +60ms:', JSON.stringify(rc));
check('rapid clicks never exceed 1 overlay', rc.overlays <= 1, `overlays=${rc.overlays}`);
await sleep(4500);
const rcAfter = await state(); console.log('  settle:', JSON.stringify(rcAfter));
check('no lingering lock/instances after rapid clicks', rcAfter.overlays === 0 && rcAfter.bodyOverflow === base2.bodyOverflow && rcAfter.instanceCount === base2.instanceCount, JSON.stringify(rcAfter));

// ---------------- MOBILE LAYOUT + SITEMAP ----------------
console.log('\n===== MOBILE layout + sitemap =====');
await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(() => window.scrollTo(0, 1200));
await sleep(500);
const mobile = await page.evaluate(() => {
  const rect = (selector) => document.querySelector(selector)?.getBoundingClientRect();
  const brand = rect('.site-header .brand');
  const actions = rect('.site-header .header-actions');
  const search = rect('.side-nav .nav-search');
  const ringNode = document.querySelector('body > .kt-progress-ring');
  const ring = ringNode?.getBoundingClientRect();
  const chips = [...document.querySelectorAll('.side-nav .nav-mod')].filter((node) => !node.hidden);
  const inside = (box) => Boolean(box && box.left >= -1 && box.right <= innerWidth + 1 && box.top >= -1 && box.bottom <= innerHeight + 1);
  const overlaps = (a, b) => Boolean(a && b && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top);
  return {
    viewport: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    brandInside: inside(brand),
    actionsInside: inside(actions),
    headerOverlap: overlaps(brand, actions),
    searchInside: inside(search),
    chipCount: chips.length,
    chipsReadable: chips.every((chip) => {
      const box = chip.getBoundingClientRect();
      const style = getComputedStyle(chip);
      return box.width >= 44 && style.whiteSpace === 'nowrap' && style.overflow !== 'hidden';
    }),
    ringVisible: Boolean(ring && ring.width > 0 && getComputedStyle(ringNode).visibility !== 'hidden'),
    ringSearchOverlap: overlaps(ring, search),
    ringBottom: ring ? Math.round(innerHeight - ring.bottom) : null
  };
});
check('mobile page has no horizontal document overflow', mobile.documentWidth <= mobile.viewport + 1, `${mobile.documentWidth}/${mobile.viewport}`);
check('mobile header controls stay inside and do not overlap', mobile.brandInside && mobile.actionsInside && !mobile.headerOverlap, JSON.stringify(mobile));
check('mobile search and module chips stay readable', mobile.searchInside && mobile.chipCount === 51 && mobile.chipsReadable, JSON.stringify(mobile));
check('mobile scroll-to-top ring clears module search', mobile.ringVisible && !mobile.ringSearchOverlap && Math.abs(mobile.ringBottom - 112) <= 3, JSON.stringify(mobile));

await page.locator('#sitemap-btn').click();
await sleep(320);
const sitemap = await page.evaluate(() => {
  const overlay = document.querySelector('.sitemap-overlay');
  const panel = overlay?.querySelector('.sitemap-panel');
  const grid = overlay?.querySelector('.sitemap-grid');
  const box = panel?.getBoundingClientRect();
  return {
    open: Boolean(overlay && !overlay.hidden && overlay.classList.contains('is-open')),
    inside: Boolean(box && box.left >= 0 && box.right <= innerWidth && box.top >= 0 && box.bottom <= innerHeight),
    columns: grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').length : 0,
    links: grid?.querySelectorAll('a').length || 0,
    rawIds: [...grid?.querySelectorAll('.sm-txt b,.sm-txt small') || []].some((node) => /\bmod-[\w-]+/.test(node.textContent))
  };
});
check('mobile sitemap is a one-column, in-viewport list of all modules', sitemap.open && sitemap.inside && sitemap.columns === 1 && sitemap.links === 51 && !sitemap.rawIds, JSON.stringify(sitemap));
await page.locator('.sitemap-close').click();

await browser.close();
server.close();
console.log(`\n===== RESULT: ${pass} passed, ${fail} failed =====`);
process.exit(fail ? 1 : 0);
