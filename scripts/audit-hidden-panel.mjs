// Audit: does any module end up different when it is created inside a hidden
// panel (a closed tab, accordion or dialog) and shown later?
//
// A module that decides what it is from a size read at create() sees 0×0 in a
// hidden panel. That class of bug has shipped several times — Cursor's scope,
// Media's wrapper, Radial's radius, Fullpage's height (an owner report), and
// two this script found: Squircle's native path, and a native slide-left/right
// Reveal that never played on a page clipping horizontal overflow. It is not a CI gate: it
// takes a few minutes and some modules differ between two plain runs. Run it
// when a change touches how a module measures itself.
//
// For every registered module with markup in site/index.html (the demo), the
// first such element (with --each: every distinct one) is created three times
// on a blank page with the demo's
// CSS: visible, visible again (the control), and inside `display:none` that is
// removed 80ms later. After the same settle time each copy is measured: the
// layout box of every node, the node count, and the inline style properties on
// the element. A module whose two visible runs already differ (a random or
// time-based effect) is listed as "varies" and not compared further.
//
//   npm run build && node scripts/audit-hidden-panel.mjs    # every module
//   node scripts/audit-hidden-panel.mjs squircle            # names containing "squircle"
//   node scripts/audit-hidden-panel.mjs --each slider       # every demo variant, not just the first
//   KT_BROWSER=webkit KT_SETTLE_MS=2500 node scripts/audit-hidden-panel.mjs
//
// Exits with 1 when a module differs only because it was created hidden and it
// is not listed in KNOWN below.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'http://kineto.test';
const browserName = process.env.KT_BROWSER || 'chromium';
const browserType = { chromium, firefox, webkit }[browserName];
if (!browserType) throw new Error(`Unsupported KT_BROWSER: ${browserName}`);
const settleMs = Math.max(200, Number(process.env.KT_SETTLE_MS) || 1500);
const args = process.argv.slice(2);
// --each: every distinct demo element of a module (its variants), not just the first.
const each = args.includes('--each');
const filter = (args.find((arg) => !arg.startsWith('--')) || '').toLowerCase();
// Layout boxes within this many pixels count as equal (sub-pixel rounding).
const BOX_TOLERANCE_PX = 2;

// Differences that are understood and harmless. Each entry says why.
const KNOWN = {
  // A paused tilt resumes with one frame at rest, which writes an identity
  // transform (the same one it keeps after any hover). Nothing moves.
  tilt: 'resume writes an identity transform, as after any hover',
  cardGlow: 'the demo element also carries Tilt (see tilt)'
};

const REQUIRED = ['dist/kineto.umd.js', 'site/index.html', 'site/styles.css', 'site/kineto.min.css'];
for (const file of REQUIRED) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`${file} is missing — run npm run build first`);
}
const demoHtml = fs.readFileSync(path.join(root, 'site/index.html'), 'utf8');
const blankPage = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="/site/kineto.min.css"><link rel="stylesheet" href="/site/styles.css">
<style>body{margin:0} #stage{width:880px;margin:40px auto;position:relative}</style></head>
<body><main id="stage"></main><script src="/dist/kineto.umd.js"></script></body></html>`;
const MIME = { '.css': 'text/css', '.js': 'text/javascript' };

const browser = await browserType.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(String(error)));
// Only repository files are served, and nothing outside the repository root.
await page.route('**/*', (route) => {
  const url = new URL(route.request().url());
  if (url.origin !== SITE) return route.fulfill({ status: 404, body: '' });
  if (url.pathname === '/') return route.fulfill({ status: 200, contentType: 'text/html', body: blankPage });
  const file = path.resolve(root, `.${decodeURIComponent(url.pathname)}`);
  if (!file.startsWith(`${root}${path.sep}`) || !fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
  return route.fulfill({ status: 200, contentType: MIME[path.extname(file)] || 'application/octet-stream', body: fs.readFileSync(file) });
});
await page.goto(`${SITE}/`);

const results = await page.evaluate(async ({ demoHtml, filter, settleMs, tolerance, each }) => {
  const { Kineto } = window;
  const dash = (name) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  const demo = new window.DOMParser().parseFromString(demoHtml, 'text/html');
  const stage = document.getElementById('stage');
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const styleKeys = (element) => (element.getAttribute('style') || '')
    .split(';').map((rule) => rule.split(':')[0].trim()).filter(Boolean).sort().join(',');
  const measure = (element) => {
    const nodes = [element, ...element.querySelectorAll('*')];
    return {
      count: nodes.length,
      boxes: nodes.map((node) => [node.tagName, Math.round(node.offsetWidth ?? 0), Math.round(node.offsetHeight ?? 0)]),
      style: styleKeys(element)
    };
  };
  const differences = (a, b) => {
    const found = [];
    if (a.count !== b.count) found.push(`node count ${a.count} vs ${b.count}`);
    for (let index = 0; index < Math.min(a.boxes.length, b.boxes.length) && found.length < 4; index += 1) {
      const [tag, w1, h1] = a.boxes[index];
      const [, w2, h2] = b.boxes[index];
      if (Math.abs(w1 - w2) > tolerance || Math.abs(h1 - h2) > tolerance) found.push(`#${index} <${tag}> ${w1}×${h1} vs ${w2}×${h2}`);
    }
    if (a.style !== b.style) found.push(`inline style [${a.style}] vs [${b.style}]`);
    return found;
  };
  const createOnce = async (source, hidden) => {
    stage.innerHTML = '';
    const holder = document.createElement('div');
    if (hidden) holder.style.display = 'none';
    holder.append(source.cloneNode(true));
    stage.append(holder);
    Kineto.scan(holder);
    if (hidden) {
      await wait(80);
      holder.style.display = '';
    }
    await wait(settleMs);
    const snapshot = measure(holder.firstElementChild);
    Kineto.destroy();
    return snapshot;
  };

  const out = [];
  for (const name of Object.keys(Kineto.registry)) {
    if (filter && !name.toLowerCase().includes(filter)) continue;
    const all = [...demo.querySelectorAll(`[data-kt-${dash(name)}]`)];
    if (!all.length) { out.push({ name, module: name, status: 'no-markup' }); continue; }
    // Identical markup is checked once.
    const distinct = [...new Map(all.map((element) => [element.outerHTML, element])).values()];
    const sources = each ? distinct : distinct.slice(0, 1);
    for (const [index, source] of sources.entries()) {
      const label = sources.length > 1 ? `${name}#${index + 1}` : name;
      const visible = await createOnce(source, false);
      const control = await createOnce(source, false);
      const varies = differences(visible, control);
      if (varies.length) { out.push({ name: label, module: name, status: 'varies', detail: varies }); continue; }
      const hidden = await createOnce(source, true);
      const found = differences(visible, hidden);
      out.push({ name: label, module: name, status: found.length ? 'differs' : 'same', detail: found });
    }
  }
  return out;
}, { demoHtml, filter, settleMs, tolerance: BOX_TOLERANCE_PX, each });
await browser.close();

let failing = 0;
for (const { name, module, status, detail } of results) {
  if (status === 'same') continue;
  if (status === 'no-markup') { console.log(`  ${name}: no demo markup, not checked`); continue; }
  if (status === 'varies') { console.log(`  ${name}: varies between two visible runs, not compared (${detail[0]})`); continue; }
  if (KNOWN[module]) { console.log(`  ${name}: known — ${KNOWN[module]}`); continue; }
  failing += 1;
  console.log(`✗ ${name}: differs when created hidden — ${detail.join(' | ')}`);
}
const checked = results.filter(({ status }) => status === 'same' || status === 'differs').length;
if (pageErrors.length) console.log(`page errors: ${pageErrors.slice(0, 5).join(' / ')}`);
console.log(`hidden-panel audit (${browserName}, settle ${settleMs}ms): ${checked} compared, ${failing} differ only because they were created hidden.`);
// A hidden copy starts its lazy images and entrances when it is shown, so a
// short settle can catch it mid-way. A difference that goes away with a longer
// settle is timing, not a create-time size decision.
if (failing) console.log('To rule out timing, run the module again with KT_SETTLE_MS=3500.');
process.exitCode = failing ? 1 : 0;
