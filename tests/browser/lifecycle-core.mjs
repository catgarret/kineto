// Lifecycle races in the core and the page-level modules.
//
// Each case below was a real defect:
//   • Loader, window source: the `load` Event itself was passed to complete()
//     as its status, so the state became "[object Event]" and `finished`
//     resolved { status: Event }.
//   • Loader, source:'resources': an already-loaded <script src> or
//     stylesheet never counted (they have no ready state and their `load` had
//     fired), nor did a lazy image below the fold — the loader never finished.
//   • Loader, revealEffect exit: `finished` never resolved and onHide /
//     kt-loader-hide never fired; destroy() mid-wipe left a forwards-filled
//     animation running and the element hidden afterwards.
//   • Loader: a throwing onStart made create() fail with the page's scroll
//     locked for good; a throwing onProgress stalled the exit; a rejected
//     `promise` option raised an unhandledrejection.
//   • Progress outputs: destroy() restored `.value` on a <button> whose TEXT
//     had been written, so the button kept "40%" as its label.
//   • Lightbox: close() then open() inside the fade — the stale close timer
//     hid the reopened viewer and the page stayed overflow:hidden forever.
//   • Page Reveal: a Replay (destroy + create) let the destroyed run's late
//     `done` clean up the NEW run (transform-origin) and fire onComplete.
//   • Presence settled every run at once — leave() resolved, and safeToRemove
//     ran, before the exit motion (or `duration`) had even started.
//   • Presence (mode 'wait'): after a failed leave, the queued enter never
//     settled and re-entered after the next successful leave.
//   • Motion States: a new apply() on one element cancelled the whole older
//     run, snapping the other staggered elements back.
//   • updateModule(outer) destroyed a nested instance of the same module.
//   • scan(): GSAP-tier instances were created after the engine download on a
//     root the page had already removed or destroyed.
//   • Destroying the last instance switched smooth scroll off and dropped a
//     pending autoInit().
//   • Cover Reveal built new panels on replay()/exit() after destroy().
//   • Page Transition: two elements shared one navigator; destroying either
//     stopped navigation for both.
//
// Run: npm run build && node tests/browser/lifecycle-core.mjs   (KT_BROWSER=firefox|webkit)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const browserName = process.env.KT_BROWSER || 'chromium';
const browserType = { chromium, firefox, webkit }[browserName];
assert.ok(browserType, `Unsupported KT_BROWSER: ${browserName}`);
const SITE = 'http://kineto.test';
// The GSAP CDN request is answered late (and with a 404, so the scroll
// modules take their native path): long enough to remove / destroy a root
// while the scan is still waiting for the engine.
const ENGINE_DELAY_MS = 600;
const GIF = Buffer.from('R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=', 'base64');

const helpers = `<script>
  window.__rejections = [];
  window.addEventListener('unhandledrejection', (event) => { window.__rejections.push(String(event.reason)); });
  // Bounded waits: a regression must fail an assertion, never hang the run.
  window.__within = (promise, ms) => Promise.race([promise, new Promise((resolve) => setTimeout(() => resolve('timeout'), ms))]);
  window.__wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  window.__until = async (check, ms) => { const end = performance.now() + ms; while (performance.now() < end) { if (check()) return true; await window.__wait(20); } return Boolean(check()); };
</script>`;

// The React / Vue adapters are loaded from src/ with the frameworks replaced
// by the few hooks they call at import and in the paths checked here, so the
// adapters' own teardown runs without a bundler.
const importMap = JSON.stringify({ imports: {
  react: `${SITE}/stubs/react.js`,
  vue: `${SITE}/stubs/vue.js`,
  // The adapters import the full runtime as `@dong-gri/kineto/all` (0.13);
  // the bare name stays mapped for anything that still uses it.
  '@dong-gri/kineto': `${SITE}/stubs/kineto.js`,
  '@dong-gri/kineto/all': `${SITE}/stubs/kineto.js`,
  '@dong-gri/kineto/presence': `${SITE}/stubs/presence.js`
} });
const stubs = {
  '/stubs/kineto.js': 'export default window.Kineto;',
  '/stubs/presence.js': 'export default () => ({ subscribe: () => () => {}, destroy() {} });',
  '/stubs/react.js': `
    export const effects = [];
    export const Children = { toArray: (value) => [].concat(value || []) };
    export const createContext = () => ({});
    export const createElement = () => null;
    export const forwardRef = (render) => render;
    export const useContext = () => null;
    export const useEffect = (effect) => { effects.push(effect); };
    export const useImperativeHandle = () => {};
    export const useRef = (value = null) => ({ current: value });
    export const useState = (value) => [value, () => {}];`,
  '/stubs/vue.js': `
    export const hooks = { mounted: [], beforeUnmount: [] };
    export const Comment = Symbol('Comment');
    export const defineComponent = (options) => options;
    export const h = () => null;
    export const inject = () => null;
    export const onBeforeUnmount = (hook) => { hooks.beforeUnmount.push(hook); };
    export const onMounted = (hook) => { hooks.mounted.push(hook); };
    export const onUpdated = () => {};
    export const provide = () => {};
    export const ref = (value = null) => ({ value });
    export const shallowRef = ref;
    export const toRef = (source, key) => ({ get value() { return source[key]; } });
    export const unref = (value) => (value && typeof value === 'object' && 'value' in value ? value.value : value);
    export const watch = () => () => {};`
};

const html = `<!doctype html><html><head><meta charset="utf-8">
  <script type="importmap">${importMap}</script>
  <link rel="stylesheet" href="${SITE}/fixture.css">
  <script src="${SITE}/fixture.js"></script>
  <style>body{margin:0} .spacer{height:5000px}</style>
  ${helpers}
</head><body>
  <main id="app"></main>
  <div id="pt-main">start</div>
  <div class="spacer"></div>
  <img id="lazy" alt="lazy" loading="lazy" width="10" height="10" src="${SITE}/lazy.gif">
  <script src="${SITE}/dist/kineto.umd.js"></script>
</body></html>`;

// autoInit() while the document is still loading, then the only instance is
// destroyed before DOMContentLoaded: the button after the script must still
// be initialised.
const readyHtml = `<!doctype html><html><head><meta charset="utf-8"></head><body>
  <script src="${SITE}/dist/kineto.umd.js"></script>
  <script>
    window.Kineto.autoInit();
    const probe = document.body.appendChild(document.createElement('button'));
    window.Kineto.create('ripple', probe).destroy();
  </script>
  <button id="late" data-kt-ripple>late</button>
</body></html>`;

const nextPage = '<!doctype html><html><head><title>next</title></head><body><div id="pt-main">next</div></body></html>';

const browser = await browserType.launch(browserName === 'chromium'
  ? { headless: true, ...(process.env.KT_CHROME ? { executablePath: process.env.KT_CHROME } : {}), args: ['--no-sandbox'] }
  : { headless: true });
const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
const errors = [];
page.on('pageerror', (error) => errors.push(String(error)));
await page.route('**/*', async (route) => {
  const url = new URL(route.request().url());
  if (url.hostname === 'cdn.jsdelivr.net') {
    await new Promise((resolve) => setTimeout(resolve, ENGINE_DELAY_MS));
    return route.fulfill({ status: 404, body: '' });
  }
  if (url.origin !== SITE) return route.fulfill({ status: 404, body: '' });
  if (url.pathname === '/') return route.fulfill({ status: 200, contentType: 'text/html', body: html });
  if (url.pathname === '/ready.html') return route.fulfill({ status: 200, contentType: 'text/html', body: readyHtml });
  if (url.pathname === '/pt-next') return route.fulfill({ status: 200, contentType: 'text/html', body: nextPage });
  if (url.pathname === '/fixture.css') return route.fulfill({ status: 200, contentType: 'text/css', body: '.fixture{color:red}' });
  if (url.pathname === '/fixture.js') return route.fulfill({ status: 200, contentType: 'text/javascript', body: 'window.__fixtureRan = true;' });
  if (url.pathname.endsWith('.gif')) return route.fulfill({ status: 200, contentType: 'image/gif', body: GIF });
  if (stubs[url.pathname]) return route.fulfill({ status: 200, contentType: 'text/javascript', body: stubs[url.pathname] });
  if (url.pathname.startsWith('/src/adapters/')) {
    const file = path.join(root, url.pathname);
    if (fs.existsSync(file)) return route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(file) });
  }
  if (url.pathname.startsWith('/dist/')) {
    const file = path.join(root, url.pathname);
    if (fs.existsSync(file)) return route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(file) });
  }
  return route.fulfill({ status: 404, body: '' });
});
await page.goto(`${SITE}/`, { waitUntil: 'load' });
await page.waitForFunction(() => window.Kineto && window.__fixtureRan);

// Every case runs even when an earlier one fails, so one run shows them all.
const failures = [];
const passed = [];
async function gate(name, run) {
  try {
    await run();
    passed.push(name);
  } catch (error) {
    failures.push(`${name}: ${error.message.split('\n')[0]}`);
  }
}

await gate('loader-resources-already-loaded', async () => {
  const result = await page.evaluate(async () => {
    const make = () => document.body.appendChild(document.createElement('div'));
    // 1. After the page loaded: the head <script src>, the stylesheet, the UMD
    //    script and a lazy image far below the fold (never requested).
    const first = window.Kineto.create('loader', make(), { source: 'resources', completeHold: 0, exitDuration: 0, hideScrollbar: false });
    const settled = await window.__within(first.finished, 3000);
    const firstStatus = settled === 'timeout' ? 'timeout' : settled.status;
    first.destroy();
    // 2. The same elements while the document still reports 'interactive':
    //    the stylesheet has a sheet and the scripts were already fetched.
    Object.defineProperty(document, 'readyState', { configurable: true, get: () => 'interactive' });
    let secondStatus;
    try {
      const second = window.Kineto.create('loader', make(), { source: 'resources', resourceSelector: 'link[rel="stylesheet"],script[src]', completeHold: 0, exitDuration: 0, hideScrollbar: false });
      const done = await window.__within(second.finished, 3000);
      secondStatus = done === 'timeout' ? 'timeout' : done.status;
      second.destroy();
    } finally {
      delete document.readyState;
    }
    return { firstStatus, secondStatus, lazyRequested: document.getElementById('lazy').complete };
  });
  assert.deepEqual({ first: result.firstStatus, second: result.secondStatus }, { first: 'completed', second: 'completed' },
    `already-loaded scripts, stylesheets and a lazy image must count as loaded (${JSON.stringify(result)})`);
});

await gate('loader-window-load-event', async () => {
  const result = await page.evaluate(async () => {
    Object.defineProperty(document, 'readyState', { configurable: true, get: () => 'interactive' });
    let instance;
    try {
      instance = window.Kineto.create('loader', document.body.appendChild(document.createElement('div')), { completeHold: 0, exitDuration: 0, hideScrollbar: false });
    } finally {
      delete document.readyState;
    }
    window.dispatchEvent(new Event('load'));
    const done = await window.__within(instance.finished, 2000);
    const describe = (value) => (typeof value === 'string' ? value : Object.prototype.toString.call(value));
    const outcome = { state: describe(instance.state), status: done === 'timeout' ? 'timeout' : describe(done.status) };
    instance.destroy();
    return outcome;
  });
  assert.deepEqual(result, { state: 'completed', status: 'completed' }, `the window load event must complete the loader as 'completed' (${JSON.stringify(result)})`);
});

await gate('loader-reveal-effect-exit', async () => {
  const result = await page.evaluate(async () => {
    const make = () => {
      const el = document.body.appendChild(document.createElement('div'));
      el.style.cssText = 'position:fixed;inset:0;background:#000';
      return el;
    };
    const events = [];
    const el = make();
    el.addEventListener('kt-loader-hide', () => events.push('hide-event'));
    const loader = window.Kineto.create('loader', el, { source: 'manual', revealEffect: 'wipe', exitDuration: 0.15, completeHold: 0, hideScrollbar: false, onHide: () => events.push('onHide') });
    loader.complete();
    const done = await window.__within(loader.finished, 2500);
    const finishedStatus = done === 'timeout' ? 'timeout' : done.status;
    loader.destroy();
    // Destroy while the wipe is still running.
    const el2 = make();
    const loader2 = window.Kineto.create('loader', el2, { source: 'manual', revealEffect: 'wipe', exitDuration: 0.3, completeHold: 0, hideScrollbar: false });
    loader2.complete();
    const started = await window.__until(() => el2.getAnimations().length > 0, 1500);
    loader2.destroy();
    await window.__wait(500);
    const after = { started, hidden: el2.hidden, display: el2.style.display, animations: el2.getAnimations().length };
    el.remove(); el2.remove();
    return { finishedStatus, events, after };
  });
  assert.deepEqual(result, {
    finishedStatus: 'completed',
    events: ['onHide', 'hide-event'],
    after: { started: true, hidden: false, display: '', animations: 0 }
  }, `a revealEffect exit must settle finished/onHide, and destroy() mid-wipe must leave nothing behind (${JSON.stringify(result)})`);
});

await gate('loader-throwing-callbacks', async () => {
  const result = await page.evaluate(async () => {
    const before = { body: document.body.style.overflow, root: document.documentElement.style.overflow };
    const rejectionsBefore = window.__rejections.length;
    const quiet = console.error;
    console.error = () => {}; // the reported callback errors are expected here
    try {
      const starter = window.Kineto.create('loader', document.body.appendChild(document.createElement('div')), {
        source: 'manual', onStart() { throw new Error('onStart boom'); }
      });
      const created = Boolean(starter);
      starter?.destroy();
      const lockAfterDestroy = { body: document.body.style.overflow, root: document.documentElement.style.overflow };
      const statusOf = async (loader) => {
        if (!loader) return 'not created';
        const done = await window.__within(loader.finished, 2000);
        return done === 'timeout' ? 'timeout' : done.status;
      };
      const progress = window.Kineto.create('loader', document.body.appendChild(document.createElement('div')), {
        source: 'manual', completeHold: 0, exitDuration: 0, hideScrollbar: false, onProgress() { throw new Error('onProgress boom'); }
      });
      progress?.complete();
      const progressStatus = await statusOf(progress);
      progress?.destroy();
      const rejecting = window.Kineto.create('loader', document.body.appendChild(document.createElement('div')), {
        source: 'promise', promise: Promise.reject(new Error('load failed')), completeHold: 0, exitDuration: 0, hideScrollbar: false
      });
      const rejectStatus = await statusOf(rejecting);
      await window.__wait(150);
      rejecting?.destroy();
      return {
        created,
        lockRestored: lockAfterDestroy.body === before.body && lockAfterDestroy.root === before.root,
        progressStatus,
        rejectStatus,
        unhandled: window.__rejections.slice(rejectionsBefore)
      };
    } finally {
      console.error = quiet;
    }
  });
  assert.deepEqual(result, { created: true, lockRestored: true, progressStatus: 'completed', rejectStatus: 'error', unhandled: [] },
    `a throwing callback must not leak the scroll lock or stall the loader, and a rejected promise must not go unhandled (${JSON.stringify(result)})`);
});

await gate('progress-output-text-restore', async () => {
  const result = await page.evaluate(async () => {
    const scope = document.body.appendChild(document.createElement('div'));
    scope.setAttribute('data-kt-progress-scope', '');
    const host = scope.appendChild(document.createElement('div'));
    const button = scope.appendChild(document.createElement('button'));
    button.setAttribute('data-kt-progress-output', '');
    button.textContent = 'Go';
    const loader = window.Kineto.create('loader', host, { source: 'manual', hideScrollbar: false, smoothing: 1 });
    loader.setProgress(40);
    await window.__until(() => button.textContent === '40%', 1000);
    const during = button.textContent;
    loader.destroy();
    const after = button.textContent;
    scope.remove();
    return { during, after };
  });
  assert.deepEqual(result, { during: '40%', after: 'Go' }, `a text output must get its own text back on destroy (${JSON.stringify(result)})`);
});

await gate('lightbox-close-reopen', async () => {
  const result = await page.evaluate(async () => {
    // A known starting point, whatever an earlier (failing) case left behind.
    document.body.style.removeProperty('overflow');
    const original = document.body.style.overflow;
    const thumb = document.body.appendChild(document.createElement('div'));
    const lightbox = window.Kineto.create('lightbox', thumb, { src: '/pic.gif', lightboxDuration: 0.2 });
    lightbox.open();
    lightbox.close();
    lightbox.open(); // inside the 200ms close fade
    await window.__wait(450);
    const viewer = document.getElementById('kt-lightbox');
    const reopened = Boolean(viewer && !viewer.hidden && getComputedStyle(viewer).display !== 'none');
    lightbox.close();
    await window.__wait(450);
    const restored = document.body.style.overflow === original;
    lightbox.destroy();
    // A viewer that was never opened has nothing to restore on destroy.
    document.body.style.overflow = 'clip';
    const idle = window.Kineto.create('lightbox', thumb, { src: '/pic.gif' });
    idle.destroy();
    const pageOverflowKept = document.body.style.overflow === 'clip';
    document.body.style.removeProperty('overflow');
    thumb.remove();
    return { reopened, restored, pageOverflowKept };
  });
  assert.deepEqual(result, { reopened: true, restored: true, pageOverflowKept: true },
    `a reopen inside the close fade must stay open, the next close must restore overflow, and destroying an unopened viewer must not touch it (${JSON.stringify(result)})`);
});

await gate('page-reveal-replay', async () => {
  const result = await page.evaluate(async () => {
    const stage = document.body.appendChild(document.createElement('section'));
    stage.style.cssText = 'height:200px';
    let firstCompletes = 0;
    window.Kineto.create('pageReveal', stage, { effect: 'zoom', duration: 0.6, onComplete: () => { firstCompletes += 1; } });
    window.Kineto.destroyModule(stage, 'pageReveal'); // the playground's Replay
    window.Kineto.create('pageReveal', stage, { effect: 'zoom', duration: 0.6 });
    await window.__wait(50);
    const origin = stage.style.transformOrigin;
    window.Kineto.destroyModule(stage, 'pageReveal');
    await window.__wait(50);
    stage.remove();
    return { originKept: origin !== '', firstCompletes };
  });
  assert.deepEqual(result, { originKept: true, firstCompletes: 0 }, `a destroyed Page Reveal run must not clean up the next run or complete (${JSON.stringify(result)})`);
});

await gate('presence-wait-after-failed-leave', async () => {
  const result = await page.evaluate(async () => {
    const { default: presence } = await import('/dist/modular/presence.js');
    const el = document.body.appendChild(document.createElement('div'));
    let leaves = 0;
    let enters = 0;
    const controller = presence(el, {
      mode: 'wait',
      exit: { run: () => { leaves += 1; return leaves === 1 ? new Promise((_resolve, reject) => setTimeout(() => reject(new Error('motion failed')), 40)) : Promise.resolve(); } },
      enter: { run: () => { enters += 1; return Promise.resolve(); } }
    });
    const firstLeave = controller.leave();
    const queuedEnter = controller.enter(); // waits for the leave
    const leaveResult = await firstLeave;
    const enterResult = await window.__within(queuedEnter, 500);
    await controller.leave();
    await window.__wait(100);
    const outcome = { leave: leaveResult.status, enter: enterResult === 'timeout' ? 'pending' : enterResult.status, enters, status: controller.status };
    controller.destroy();
    el.remove();
    return outcome;
  });
  assert.deepEqual(result, { leave: 'error', enter: 'cancelled', enters: 0, status: 'finished' },
    `an enter queued behind a failed leave must settle and never run later (${JSON.stringify(result)})`);
});

await gate('presence-waits-for-motion', async () => {
  const result = await page.evaluate(async () => {
    const { default: presence } = await import('/dist/modular/presence.js');
    const el = document.body.appendChild(document.createElement('div'));
    let removedAt = null;
    const withMotion = presence(el, {
      exit: () => new Promise((resolve) => setTimeout(resolve, 250)),
      safeToRemove: () => { removedAt = performance.now(); }
    });
    const started = performance.now();
    await withMotion.leave();
    const motionMs = performance.now() - started;
    const safeToRemoveMs = removedAt - started;
    withMotion.destroy();
    const timed = presence(el);
    const timerStart = performance.now();
    await timed.leave({ duration: 150 });
    const timerMs = performance.now() - timerStart;
    timed.destroy();
    el.remove();
    return { motionWaited: motionMs >= 200, removalWaited: safeToRemoveMs >= 200, timerWaited: timerMs >= 120, motionMs: Math.round(motionMs), timerMs: Math.round(timerMs) };
  });
  assert.deepEqual({ motion: result.motionWaited, removal: result.removalWaited, timer: result.timerWaited }, { motion: true, removal: true, timer: true },
    `leave() must wait for its motion (or its duration) before resolving and calling safeToRemove (${JSON.stringify(result)})`);
});

await gate('states-partial-takeover', async () => {
  const result = await page.evaluate(async () => {
    const list = Array.from({ length: 4 }, () => {
      const item = document.body.appendChild(document.createElement('div'));
      item.style.opacity = '0';
      return item;
    });
    const states = window.Kineto.states({ hidden: { opacity: 0 }, visible: { opacity: 1 } });
    const all = states.apply(list, 'visible', { duration: 300, stagger: 80 });
    await window.__wait(120);
    states.apply(list[0], 'hidden', { duration: 60 });
    const allResult = await window.__within(all, 2000);
    await window.__wait(50);
    const opacities = list.slice(1).map((item) => getComputedStyle(item).opacity);
    states.destroy();
    list.forEach((item) => item.remove());
    return { opacities, settled: allResult === 'timeout' ? 'timeout' : allResult.status };
  });
  assert.deepEqual(result, { opacities: ['1', '1', '1'], settled: 'cancelled' },
    `taking over one element must leave the rest of the older run to finish (${JSON.stringify(result)})`);
});

await gate('update-module-keeps-nested', async () => {
  const result = await page.evaluate(() => {
    const outer = document.body.appendChild(document.createElement('div'));
    const inner = outer.appendChild(document.createElement('button'));
    window.Kineto.create('ripple', outer);
    const innerInstance = window.Kineto.create('ripple', inner);
    const before = window.Kineto.instanceCount;
    window.Kineto.updateModule(outer, 'ripple', { duration: 1 });
    const after = window.Kineto.instanceCount;
    const sameInner = window.Kineto.getInstance(inner, 'ripple') === innerInstance;
    window.Kineto.destroy(outer);
    outer.remove();
    return { countKept: after === before, sameInner };
  });
  assert.deepEqual(result, { countKept: true, sameInner: true }, `updateModule(outer) must not destroy a nested instance (${JSON.stringify(result)})`);
});

await gate('adapters-keep-nested', async () => {
  const result = await page.evaluate(async () => {
    const nest = () => {
      const outer = document.body.appendChild(document.createElement('div'));
      const inner = outer.appendChild(document.createElement('button'));
      return { outer, inner };
    };
    // React: useKineto() on the outer element, then its effect cleanup (unmount).
    const react = await import('react');
    const { useKineto: useReactKineto } = await import('/src/adapters/react.js');
    const r = nest();
    const innerReact = window.Kineto.create('ripple', r.inner);
    const hook = useReactKineto('ripple');
    hook.ref.current = r.outer;
    const cleanup = react.effects.pop()();
    cleanup();
    const reactKept = window.Kineto.getInstance(r.inner, 'ripple') === innerReact && !window.Kineto.getInstance(r.outer, 'ripple');
    // Vue: the v-motion directive, then useKineto()'s unmount hook.
    const vue = await import('vue');
    const { vMotion, useKineto: useVueKineto } = await import('/src/adapters/vue.js');
    const v = nest();
    const innerVue = window.Kineto.create('ripple', v.inner);
    vMotion.mounted(v.outer, { value: 'ripple' });
    vMotion.unmounted(v.outer);
    const directiveKept = window.Kineto.getInstance(v.inner, 'ripple') === innerVue && !window.Kineto.getInstance(v.outer, 'ripple');
    const composable = useVueKineto('ripple');
    composable.element.value = v.outer;
    vue.hooks.mounted.pop()();
    vue.hooks.beforeUnmount.pop()();
    const composableKept = window.Kineto.getInstance(v.inner, 'ripple') === innerVue && !window.Kineto.getInstance(v.outer, 'ripple');
    [r, v].forEach(({ outer }) => { window.Kineto.destroy(outer); outer.remove(); });
    return { reactKept, directiveKept, composableKept };
  });
  assert.deepEqual(result, { reactKept: true, directiveKept: true, composableKept: true },
    `an adapter unmounting one element must leave nested instances alone (${JSON.stringify(result)})`);
});

await gate('scan-after-engine-load', async () => {
  const result = await page.evaluate(async () => {
    const base = window.Kineto.instanceCount;
    const section = (id) => {
      const holder = document.getElementById('app').appendChild(document.createElement('section'));
      holder.id = id;
      holder.innerHTML = '<div data-kt-reveal>reveal</div>';
      return holder;
    };
    const removed = section('removed');
    const destroyed = section('destroyed');
    const kept = section('kept');
    window.Kineto.init(removed);
    window.Kineto.init(destroyed);
    window.Kineto.init(kept);
    removed.remove();                    // gone while the engine downloads
    window.Kineto.destroy(destroyed);    // torn down while the engine downloads
    const keptReveal = kept.querySelector('[data-kt-reveal]');
    const created = await window.__until(() => Boolean(window.Kineto.getInstance(keptReveal, 'reveal')), 4000);
    await window.__wait(50);
    const outcome = {
      created,
      removedHasInstance: Boolean(window.Kineto.getInstance(removed.firstElementChild, 'reveal')),
      destroyedHasInstance: Boolean(window.Kineto.getInstance(destroyed.firstElementChild, 'reveal')),
      added: window.Kineto.instanceCount - base
    };
    window.Kineto.destroy(document.getElementById('app'));
    document.getElementById('app').textContent = '';
    return outcome;
  });
  assert.deepEqual(result, { created: true, removedHasInstance: false, destroyedHasInstance: false, added: 1 },
    `a scan waiting for GSAP must skip roots removed or destroyed meanwhile (${JSON.stringify(result)})`);
});

await gate('smooth-survives-last-instance', async () => {
  const result = await page.evaluate(async () => {
    if (window.Kineto.instanceCount !== 0) window.Kineto.destroy();
    let lenisDestroyed = 0;
    // A minimal stand-in: the core only needs a constructor with these methods.
    window.Lenis = class { on() {} raf() {} scrollTo() {} stop() {} start() {} destroy() { lenisDestroyed += 1; } };
    window.Kineto.enableSmooth();
    const on = await window.__until(() => window.Kineto.smoothEnabled, 1000);
    const button = document.body.appendChild(document.createElement('button'));
    window.Kineto.create('ripple', button).destroy(); // the page's last instance
    const outcome = { on, stillOn: window.Kineto.smoothEnabled, lenisDestroyed };
    window.Kineto.disableSmooth();
    outcome.offAfterDisable = !window.Kineto.smoothEnabled;
    delete window.Lenis;
    button.remove();
    return outcome;
  });
  assert.deepEqual(result, { on: true, stillOn: true, lenisDestroyed: 0, offAfterDisable: true },
    `destroying the last instance must not switch smooth scroll off (${JSON.stringify(result)})`);
});

await gate('cover-reveal-after-destroy', async () => {
  const result = await page.evaluate(async () => {
    const card = document.body.appendChild(document.createElement('div'));
    card.style.cssText = 'width:120px;height:80px';
    const cover = window.Kineto.create('coverReveal', card, {});
    cover.destroy();
    const realCreate = document.createElement;
    let panels = 0;
    document.createElement = function createElement(tag, ...rest) {
      if (String(tag).toLowerCase() === 'span') panels += 1;
      return realCreate.call(this, tag, ...rest);
    };
    try {
      cover.replay();
      await cover.exit();
      await cover.refresh();
    } finally {
      document.createElement = realCreate;
    }
    await window.__wait(50);
    card.remove();
    return { panels };
  });
  assert.deepEqual(result, { panels: 0 }, `replay()/exit()/refresh() after destroy() must not build panels (${JSON.stringify(result)})`);
});

await gate('page-transition-shared-navigator', async () => {
  const result = await page.evaluate(async () => {
    const a = window.Kineto.create('pageTransition', document.body.appendChild(document.createElement('div')), { container: '#pt-main', minDuration: 0, executeScripts: false });
    const b = window.Kineto.create('pageTransition', document.body.appendChild(document.createElement('div')), { container: '#pt-main', minDuration: 0, executeScripts: false });
    a.destroy();
    const link = document.body.appendChild(document.createElement('a'));
    link.href = '/pt-next';
    link.textContent = 'next';
    let handled = null;
    // Runs after the document-level navigator; stops a real navigation either way.
    window.addEventListener('click', (event) => { handled = event.defaultPrevented; event.preventDefault(); }, { once: true });
    link.click();
    const swapped = handled ? await window.__until(() => document.getElementById('pt-main')?.textContent === 'next', 2000) : false;
    await window.__wait(80);
    b.destroy();
    link.remove();
    return { handled, swapped };
  });
  assert.deepEqual(result, { handled: true, swapped: true }, `destroying one Page Transition must keep the other navigating (${JSON.stringify(result)})`);
});

await gate('auto-init-survives-last-instance', async () => {
  const ready = await browser.newPage();
  ready.on('pageerror', (error) => errors.push(String(error)));
  await ready.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.origin === SITE && url.pathname === '/ready.html') return route.fulfill({ status: 200, contentType: 'text/html', body: readyHtml });
    if (url.origin === SITE && url.pathname.startsWith('/dist/')) return route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(path.join(root, url.pathname)) });
    return route.fulfill({ status: 404, body: '' });
  });
  await ready.goto(`${SITE}/ready.html`, { waitUntil: 'load' });
  const initialised = await ready.evaluate(() => Boolean(window.Kineto.getInstance(document.getElementById('late'), 'ripple')));
  await ready.close();
  assert.equal(initialised, true, 'a pending autoInit() must still scan after the last instance was destroyed');
});

await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
await browser.close();
if (errors.length) failures.push(`page errors: ${errors.join(' | ')}`);
assert.deepEqual(failures, [], `lifecycle-core failed (${browserName}):\n  ${failures.join('\n  ')}`);
console.log(`lifecycle-core OK (${browserName}) — ${passed.length} cases: Loader completes on the load event, for already-loaded resources, after a revealEffect exit and past throwing callbacks; outputs, Lightbox, Page Reveal, Presence, Motion States, updateModule, late GSAP scans, smooth scroll, autoInit, Cover Reveal and Page Transition all hold through destroy/re-open races.`);
