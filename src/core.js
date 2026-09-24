/**
 * Kineto core
 * Public API and lifecycle manager. The feature set is defined in
 * FEATURE_CONTRACT.md and tests/feature-contract.mjs.
 */

// Lenis (smooth scroll) is NOT bundled — it is loaded on demand via
// ensureLenis() (page global or official CDN) the first time enableSmooth() is
// called. Smooth scroll is opt-in and off by default, so a page that never
// enables it never fetches Lenis. See src/runtime.js for the engine loader.
import { dash, dropEmptyAttributes, env, G, noopInstance, q, readOpts, ST, setMotionDefaults } from './utils.js';
import { setAnimationEngine, setEngineSource, getEngineSource, ensureGSAP, ensureLenis, gsapReady } from './runtime.js';
import { createDiagnosticHub, DIAGNOSTIC_CODES } from './diagnostics.js';

// Modules whose motion is driven by GSAP / ScrollTrigger. If a page uses any of
// these, scan() fetches the engine (from the page or the CDN) before creating
// them, then initialises the rest immediately — so nothing that doesn't need
// GSAP is ever blocked on it.
const GSAP_MODULES = new Set([
  'blurText', 'counter', 'cssScroll', 'marquee', 'parallax', 'reveal',
  'scrollSequence', 'scrollVelocity', 'stickyStack', 'textFill', 'textReveal', 'textSplit'
]);
// A few concise option names intentionally match another module's activation
// attribute. On a slider, for example, `data-kt-progress="true"` means
// "show autoplay progress"; it must not also instantiate the standalone
// Progress module on the same node. Composition remains available by nesting
// elements or by calling create() explicitly.
const ACTIVATION_OPTION_OWNERS = {
  cursor: ['lightbox'],
  drag: ['fullpage', 'radial'],
  hold: ['textReveal', 'textSplit'],
  progress: ['slider', 'loadingIndicator']
};
function activationIsOwnedOption(el, name) {
  return (ACTIVATION_OPTION_OWNERS[name] || []).some((owner) => el.hasAttribute?.(`data-kt-${dash(owner)}`));
}
import { toCSS as easingToCSS, fn as easingFn, EASINGS } from './easings.js';

const modules = new Map();
const records = new Set();
const byElement = new WeakMap();
// Live-DOM watchers created by Kineto.observe(): one per root, so a framework
// (React, Vue, Bootstrap's modals, PrimeVue dialogs …) can add or remove
// `data-kt-*` markup at any time and Kineto follows without per-framework glue.
const observers = new Map();

let initialized = false;
let domReadyScheduled = false;
let domReadyHandler = null;
let lenis = null;
let lenisRaf = null;
let lenisTicker = null;
let lenisLoading = null;
let visibilityHandler = null;
let cachedEnv = null;
// SYSTEM SUSPENSION — one rule for every instance:
//
//   suspended  ⇔  the tab is hidden  OR  the element is off screen
//
// and it is kept apart from the page's own pause() (`record.paused`), so
// neither ever overrides the other. `syncSuspension(record)` is the only place
// that applies it; the visibilitychange handler and the IntersectionObserver
// below just update the inputs and call it.
//
// Offscreen: a module that declares `offscreen: 'pause'` on its definition is
// watched by ONE shared IntersectionObserver. Before this, the demo page kept
// 127 of its 128 running animations going with nobody able to see them.
// `offscreen` may also be a function of the instance's options, for a module
// that should keep running in some configurations (Scroll Velocity keeps
// running when the page listens to its `onUpdate`, since that may drive
// something that IS on screen).
//
// How a module is suspended:
//   • default — through its own pause()/resume(), with the user's pause
//     respected (a paused instance is left alone, and a resume() asked for
//     while suspended waits until the suspension ends);
//   • `suspend(on)` — a module whose pause() is PUBLIC state (Loading
//     Indicator reports 'paused' to the page) implements this quiet hook
//     instead: it only stops the work, never changes what the page sees, and
//     the core calls it on every change of the rule above, independently of
//     the user's pause/resume, which then always go straight to the module.
let offscreenObserver = null;
const offscreenRecords = new Map(); // element → Set of records watched on it
// Set on a watched element while it is out of view, so ONE stylesheet rule can
// hold Kineto's own CSS keyframes still inside it (see kineto.css). It is the
// core's state, not an activation attribute: observe() must not rescan on it.
const OFFSCREEN_ATTRIBUTE = 'data-kt-offscreen';
const CORE_STATE_ATTRIBUTES = new Set([OFFSCREEN_ATTRIBUTE]);

const config = {
  smooth: false,
  smoothOptions: { lerp: 0.08, wheelMultiplier: 1, smoothWheel: true },
  respectReducedMotion: true,
  forceReducedMotion: false,
  performance: 'auto',
  spring: false,
  debug: false,
  debugSink: null
};

const diagnostics = createDiagnosticHub({
  isEnabled: () => Boolean(config.debug || typeof config.debugSink === 'function'),
  sink: (event) => {
    if (typeof config.debugSink === 'function') config.debugSink(event);
    else if (config.debug) console.info('[Kineto]', event);
  }
});

// Watch the OS reduced-motion setting for RUNTIME changes and keep the cached
// env in sync, dispatching `kineto:reduced-motion` so live views/instances can
// react instead of the value being read only once at first access (D-1 / J-5).
// Recreate active instances so a reduced-motion change takes effect on the
// elements already on the page — not just future ones. Each module re-runs its
// create()/reduced() path with the SAME element + options, so nothing is lost.
function reapplyReducedMotion() {
  if (typeof document === 'undefined' || !records.size) return;
  const snap = [...records].map((r) => ({ el: r.sourceEl, name: r.name, options: r.options }));
  snap.forEach(({ el, name }) => { try { Kineto.destroyModule(el, name); } catch (_e) { /* keep going */ } });
  snap.forEach(({ el, name, options }) => { try { Kineto.create(name, el, options); } catch (_e) { /* keep going */ } });
}

let rmWatched = false;
let rmMediaQuery = null;
let rmChangeHandler = null;
function installReducedMotionWatch() {
  if (rmWatched || typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
  rmWatched = true;
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const onChange = () => {
    if (cachedEnv) cachedEnv.reducedMotion = mq.matches;
    // Only re-apply on an OS change when the policy actually follows the OS.
    if (config.respectReducedMotion && !config.forceReducedMotion) reapplyReducedMotion();
    try { document.dispatchEvent(new CustomEvent('kineto:reduced-motion', { detail: { reduced: Kineto.prefersReducedMotion } })); } catch (_e) { /* older */ }
  };
  if (mq.addEventListener) mq.addEventListener('change', onChange);
  else if (mq.addListener) mq.addListener(onChange);
  rmMediaQuery = mq;
  rmChangeHandler = onChange;
  installConnectionWatch();
}

// Watch Network Information changes (Save-Data toggled, effectiveType shifting
// between wifi/4g/2g) so the derived performance tier and saveData flag stay
// live rather than being sampled once (audit D-1). We refresh the cached env and
// emit `kineto:environment` for views/instances that adapt to network quality.
let connWatched = false;
let watchedConnection = null;
let connectionChangeHandler = null;
function installConnectionWatch() {
  if (connWatched || typeof navigator === 'undefined') return;
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!conn || typeof conn.addEventListener !== 'function') return;
  connWatched = true;
  const onChange = () => {
    cachedEnv = null; // re-derive perf/saveData on next read
    try { document.dispatchEvent(new CustomEvent('kineto:environment', { detail: { performance: Kineto.performance, saveData: !!conn.saveData, effectiveType: conn.effectiveType } })); } catch (_e) { /* older */ }
  };
  watchedConnection = conn;
  connectionChangeHandler = onChange;
  conn.addEventListener('change', onChange);
}

function debug(...args) {
  diagnostics.emit({
    code: DIAGNOSTIC_CODES.DEBUG,
    module: 'core',
    phase: 'runtime',
    recoverable: true,
    detail: { message: args.map((value) => value instanceof Error ? value.message : value) }
  });
}

function emitDiagnostic(payload) {
  return diagnostics.emit(payload);
}

function normalizeInstance(instance, sourceEl, name, options) {
  const value = instance || noopInstance(sourceEl, name);
  const normalized = {};
  Object.defineProperties(normalized, Object.getOwnPropertyDescriptors(value));
  normalized.el = value.el || sourceEl;
  normalized.sourceEl = sourceEl;
  normalized.type = value.type || name;
  normalized.options = options;
  normalized.pause = typeof value.pause === 'function' ? value.pause.bind(value) : () => {};
  normalized.resume = typeof value.resume === 'function' ? value.resume.bind(value) : () => {};
  normalized.destroy = typeof value.destroy === 'function' ? value.destroy.bind(value) : () => {};
  return normalized;
}

function getElementMap(el, create = false) {
  let map = byElement.get(el);
  if (!map && create) {
    map = new Map();
    byElement.set(el, map);
  }
  return map;
}

function addRecord(sourceEl, name, instance, options) {
  const normalized = normalizeInstance(instance, sourceEl, name, options);
  const destroyImplementation = normalized.destroy;
  const pauseImplementation = normalized.pause;
  const resumeImplementation = normalized.resume;
  const record = { sourceEl, name, instance: normalized, options, destroyImplementation, destroying: false,
    visibility: false, paused: false, offscreen: false, suspended: false,
    // A module with the quiet `suspend(on)` hook handles system suspension
    // itself (see SYSTEM SUSPENSION above).
    quiet: typeof normalized.suspend === 'function' };

  // User pause is independent of the temporary page-visibility suspension.
  normalized.pause = () => {
    if (!records.has(record)) return;
    if (!record.visibility) record.paused = true;
    record.visibility = false;
    return pauseImplementation();
  };
  normalized.resume = () => {
    if (!records.has(record)) return;
    if (!record.visibility) record.paused = false;
    record.visibility = false;
    // Clearing the user's pause is always honoured; actually running again waits
    // until the system suspension ends — unless the module suspends quietly,
    // in which case it keeps its own work stopped and can take the resume now.
    if (record.quiet || !record.suspended) return resumeImplementation();
  };

  // Calling instance.destroy() must also remove the core registry record.
  // Otherwise a later create() returns a stale, already-destroyed instance.
  normalized.destroy = () => removeRecord(record);

  records.add(record);
  getElementMap(sourceEl, true).set(name, record);
  return normalized;
}

// 진단에 넣을 짧은 요소 식별자. 작성자가 페이지에서 바로 찾을 수 있을 만큼만 담고,
// 텍스트나 속성 값은 넣지 않습니다(진단이 페이지 내용을 실어 나르면 안 됩니다).
function describeElement(el) {
  if (!el || typeof el.tagName !== 'string') return 'unknown element';
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : '';
  const className = typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(Boolean)[0] : '';
  return `${tag}${id}${className ? `.${className}` : ''}`;
}

// A pause or resume the SYSTEM makes (hidden tab, element off screen). It runs
// through the instance's own wrapper with `visibility` set, so the user's pause
// flag is left exactly as it was.
function systemCall(record, method) {
  try {
    record.visibility = true;
    record.instance[method]();
  } catch (error) {
    console.error(`[Kineto/${record.name}] ${method}() failed:`, error);
  } finally {
    record.visibility = false;
  }
}

// Apply the SYSTEM SUSPENSION rule to one record — called whenever one of its
// inputs (tab visibility, the element's on-screen state) may have changed.
function syncSuspension(record) {
  const suspended = Boolean((typeof document !== 'undefined' && document.hidden) || record.offscreen);
  if (suspended === record.suspended) return;
  record.suspended = suspended;
  if (record.quiet) {
    try {
      record.instance.suspend(suspended);
    } catch (error) {
      console.error(`[Kineto/${record.name}] suspend() failed:`, error);
    }
    return;
  }
  // A user-paused instance stays paused either way; its resume() will run it.
  if (record.paused) return;
  systemCall(record, suspended ? 'pause' : 'resume');
}

function onOffscreenEntries(entries) {
  entries.forEach((entry) => {
    const watched = offscreenRecords.get(entry.target);
    if (!watched) return;
    const offscreen = !entry.isIntersecting;
    entry.target.toggleAttribute(OFFSCREEN_ATTRIBUTE, offscreen);
    watched.forEach((record) => {
      record.offscreen = offscreen;
      syncSuspension(record);
    });
  });
}

function pausesOffscreen(module, options) {
  const flag = typeof module.offscreen === 'function' ? module.offscreen(options || {}) : module.offscreen;
  return flag === 'pause';
}

function watchOffscreen(record) {
  if (typeof IntersectionObserver === 'undefined') return;
  const el = record.instance.el || record.sourceEl;
  if (!el || typeof el.getBoundingClientRect !== 'function') return;
  // A quarter of a screen of lead, so a loop is already running again by the
  // time its element scrolls into view instead of starting on the first
  // visible frame.
  offscreenObserver ||= new IntersectionObserver(onOffscreenEntries, { rootMargin: '25% 0px' });
  if (!offscreenRecords.has(el)) offscreenRecords.set(el, new Set());
  offscreenRecords.get(el).add(record);
  record.offscreenTarget = el;
  offscreenObserver.observe(el);
}

function unwatchOffscreen(record) {
  const el = record.offscreenTarget;
  if (!el) return;
  const set = offscreenRecords.get(el);
  set?.delete(record);
  if (set && set.size === 0) {
    offscreenRecords.delete(el);
    offscreenObserver?.unobserve(el);
    el.removeAttribute(OFFSCREEN_ATTRIBUTE);
  }
  record.offscreenTarget = null;
  if (offscreenRecords.size === 0) {
    offscreenObserver?.disconnect();
    offscreenObserver = null;
  }
}

function removeRecord(record, destroy = true, teardownIfEmpty = true) {
  if (!record || !records.has(record) || record.destroying) return;
  record.destroying = true;
  unwatchOffscreen(record);
  records.delete(record);
  const map = getElementMap(record.sourceEl);
  map?.delete(record.name);
  if (map?.size === 0) byElement.delete(record.sourceEl);

  if (destroy) {
    try {
      record.destroyImplementation();
    } catch (error) {
      console.error(`[Kineto/${record.name}] destroy() failed:`, error);
      emitDiagnostic({ code: DIAGNOSTIC_CODES.DESTROY_FAILED, module: record.name, phase: 'destroy', recoverable: true, cause: error });
    }
    // 모듈이 클래스와 인라인 스타일을 되돌리고 나면 `class=""` · `style=""` 라는 빈
    // 껍데기가 남습니다. 동작은 같지만 요소가 "만나기 전과 같은 모습"이 아니게 되고,
    // 복원이 끝났는지 눈으로도 검사로도 확인하기 어려워집니다. **비어 있을 때만** 지우므로
    // 같은 요소에 살아 있는 다른 모듈이나 페이지가 넣은 값은 건드리지 않습니다.
    dropEmptyAttributes(record.sourceEl);
  }
  if (teardownIfEmpty && records.size === 0) teardownCoreServices();
}

function matchesRoot(record, roots) {
  return roots.some((root) => {
    if ((typeof document !== 'undefined' && root === document) ||
        (typeof window !== 'undefined' && root === window)) return true;
    if (record.sourceEl === root || record.instance.el === root) return true;
    return typeof root.contains === 'function' &&
      (root.contains(record.sourceEl) || root.contains(record.instance.el));
  });
}

// Destroy every instance whose element is no longer in the document. Called
// after a watched subtree lost nodes; instances of detached elements would
// otherwise keep listeners, observers and timers alive (a leak in SPAs).
function releaseDetachedRecords() {
  Array.from(records).forEach((record) => {
    const el = record.sourceEl;
    if (el && el.isConnected === false) removeRecord(record);
  });
}

// Build the MutationObserver behind Kineto.observe(). Mutations are batched
// into one microtask so a framework commit that touches hundreds of nodes
// costs one scan pass, not one per node.
function createLiveObserver(root, options) {
  const watchAttributes = options.attributes === true;
  let added = new Set();
  let removed = false;
  let scheduled = false;
  let active = true;
  const flush = () => {
    if (!active) return;
    scheduled = false;
    const nodes = added;
    added = new Set();
    const hadRemoval = removed;
    removed = false;
    nodes.forEach((node) => {
      if (!active || !node.isConnected || !root.contains(node)) return;
      // A framework may insert a parent, then build its children in the same
      // commit. Scan only the outermost pending subtree using its current ancestry.
      for (let parent = node.parentNode; parent; parent = parent.parentNode) {
        if (nodes.has(parent)) return;
        if (parent === root) break;
      }
      Kineto.scan(node);
    });
    if (active && hadRemoval) releaseDetachedRecords();
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    Promise.resolve().then(flush);
  };
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes') {
        const name = String(mutation.attributeName || '');
        if (name.startsWith('data-kt-') && !CORE_STATE_ATTRIBUTES.has(name)) added.add(mutation.target);
        return;
      }
      mutation.addedNodes.forEach((node) => { if (node.nodeType === 1) added.add(node); });
      if (mutation.removedNodes.length) removed = true;
    });
    if (added.size || removed) schedule();
  });
  observer.observe(root, { childList: true, subtree: true, attributes: watchAttributes });
  return {
    disconnect() {
      active = false;
      observer.disconnect();
      added.clear();
    }
  };
}

function ensureCoreServices() {
  if (initialized || Kineto.env.ssr) return;
  initialized = true;
  injectCSSFallback();

  const gsap = G();
  const scrollTrigger = ST();
  const performance = Kineto.performance;

  // Stop ScrollTrigger from refreshing (and yanking pinned sections) when the
  // mobile browser's URL bar shows/hides — that tiny viewport resize is what
  // makes pinned scroll (sticky-stack, scroll-sequence) bounce on phones.
  try { scrollTrigger?.config?.({ ignoreMobileResize: true }); } catch (_error) { /* older ScrollTrigger */ }

  if (config.smooth && performance !== 'low') startSmoothService(gsap, scrollTrigger);

  visibilityHandler = () => records.forEach(syncSuspension);
  document.addEventListener('visibilitychange', visibilityHandler);
}


// Async because Lenis is dynamically imported the first time smooth scroll is
// enabled. enableSmooth() still returns synchronously (chainable); the Lenis
// instance simply becomes live a microtask later, once the module resolves. A
// single in-flight guard (lenisLoading) stops concurrent enables from creating
// two Lenis instances.

// Modules that assign the host element's own `transform`. Derived by inspection
// of src/modules/*.js (14 of 53 at the time of writing); anything that only
// transforms a child it created is deliberately absent, because those compose.
const HOST_TRANSFORM_MODULES = new Set([
  'bottomSheet', 'drag', 'gesture', 'lazy', 'loader', 'magnetic', 'marquee',
  'mouseParallax', 'parallax', 'progress', 'reveal', 'scrollVelocity',
  'textSplit', 'tilt'
]);
const warnedClashes = new WeakMap();
function warnHostTransformClash(el, name) {
  if (!HOST_TRANSFORM_MODULES.has(name)) return;
  const map = getElementMap(el);
  if (!map) return;
  const other = [...map.keys()].find((key) => key !== name && HOST_TRANSFORM_MODULES.has(key));
  if (!other) return;
  // One warning per element per pair; a live playground remounts constantly and
  // a warning per remount would be noise, not a signal.
  const seen = warnedClashes.get(el) || new Set();
  const pair = [name, other].sort().join('+');
  if (seen.has(pair)) return;
  seen.add(pair);
  warnedClashes.set(el, seen);
  console.warn(
    `[Kineto] "${name}" and "${other}" both write this element's transform, so one will overwrite the other. `
    + 'Put them on nested elements instead. See docs/rfc/module-composition.md'
  );
  emitDiagnostic({
    code: DIAGNOSTIC_CODES.TRANSFORM_CONFLICT,
    module: name,
    phase: 'create',
    recoverable: true,
    detail: { otherModule: other }
  });
}
// True when `node` is inside a scrollable container (or one tagged with
// data-lenis-prevent), so Lenis should skip it and let native scroll happen.
function isInnerScrollable(node) {
  let el = node && node.nodeType === 1 ? node : (node && node.parentElement);
  const root = typeof document !== 'undefined' ? document : null;
  while (el && root && el !== root.body && el !== root.documentElement) {
    if (el.nodeType === 1) {
      if (el.hasAttribute('data-lenis-prevent') || el.hasAttribute('data-lenis-prevent-wheel')) return true;
      const style = getComputedStyle(el);
      const oy = style.overflowY;
      if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 1) return true;
      const ox = style.overflowX;
      if ((ox === 'auto' || ox === 'scroll') && el.scrollWidth > el.clientWidth + 1) return true;
    }
    el = el.parentElement;
  }
  return false;
}

function startSmoothService(gsap = G(), scrollTrigger = ST()) {
  if (lenis || Kineto.env.ssr || !config.smooth || Kineto.performance === 'low') return Promise.resolve(lenis);
  if (lenisLoading) return lenisLoading;
  lenisLoading = (async () => {
    try {
      const Lenis = await ensureLenis();
      // ensureLenis resolves to null when offline / CDN blocked — fall back to
      // native scrolling instead of throwing.
      if (!Lenis) return lenis;
      // enableSmooth may have been toggled back off (or SSR entered) while the
      // engine was loading — bail without constructing anything.
      if (lenis || !config.smooth || Kineto.env.ssr || Kineto.performance === 'low') return lenis;
      // Let native wheel/touch through over inner scroll containers. Lenis
      // captures the wheel for the whole page, which otherwise freezes nested
      // scrollers (e.g. a scroll-shadow box or a sticky-header inner panel).
      // We merge a default `prevent` that returns true when the event target
      // sits inside an independently scrollable ancestor (or one flagged with
      // data-lenis-prevent). A user-supplied `prevent` is respected as-is.
      const smoothOptions = { ...config.smoothOptions };
      if (typeof smoothOptions.prevent !== 'function') {
        smoothOptions.prevent = (node) => isInnerScrollable(node);
      }
      lenis = new Lenis(smoothOptions);
      if (scrollTrigger) lenis.on('scroll', scrollTrigger.update);
      if (gsap?.ticker) {
        lenisTicker = (time) => lenis?.raf(time * 1000);
        gsap.ticker.add(lenisTicker);
        gsap.ticker.lagSmoothing(0);
      } else {
        const tick = (time) => {
          lenis?.raf(time);
          if (lenis) lenisRaf = requestAnimationFrame(tick);
        };
        lenisRaf = requestAnimationFrame(tick);
      }
    } catch (error) {
      lenis = null;
      debug('Lenis initialization skipped.', error);
    } finally {
      lenisLoading = null;
    }
    return lenis;
  })();
  return lenisLoading;
}

function stopSmoothService() {
  const gsap = G();
  if (lenisTicker && gsap?.ticker) gsap.ticker.remove(lenisTicker);
  lenisTicker = null;
  if (lenisRaf) cancelAnimationFrame(lenisRaf);
  lenisRaf = null;
  lenis?.destroy?.();
  lenis = null;
}

function teardownCoreServices() {
  if (visibilityHandler && typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', visibilityHandler);
  }
  visibilityHandler = null;
  if (domReadyHandler && typeof document !== 'undefined') {
    document.removeEventListener('DOMContentLoaded', domReadyHandler);
  }
  domReadyHandler = null;

  if (rmMediaQuery && rmChangeHandler) {
    if (rmMediaQuery.removeEventListener) rmMediaQuery.removeEventListener('change', rmChangeHandler);
    else rmMediaQuery.removeListener?.(rmChangeHandler);
  }
  rmMediaQuery = null;
  rmChangeHandler = null;
  rmWatched = false;
  if (watchedConnection && connectionChangeHandler) {
    watchedConnection.removeEventListener?.('change', connectionChangeHandler);
  }
  watchedConnection = null;
  connectionChangeHandler = null;
  connWatched = false;

  stopSmoothService();
  initialized = false;
  domReadyScheduled = false;
}

function injectCSSFallback() {
  if (typeof document === 'undefined' || document.getElementById('kineto-inline-fallback')) return;
  const style = document.createElement('style');
  style.id = 'kineto-inline-fallback';
  style.textContent = `
    @property --kt-angle { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
    @keyframes kt-border-spin { to { --kt-angle: 360deg; } }
    @keyframes kt-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    @keyframes kt-aurora { to { transform: rotate(360deg); } }
    @keyframes kt-aurora-drift { 0% { transform: translate3d(-3%,-2%,0) scale(1.06); } 100% { transform: translate3d(3%,2%,0) scale(1.12); } }
    @keyframes kt-caret { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
    .kt-cursor-active, .kt-cursor-active * { cursor: none !important; }
    .kt-cursor-scope, .kt-cursor-scope * { cursor: none !important; }
    .kt-tw-caret { animation: kt-caret .8s step-end infinite; }
    .kt-slide { position: relative; flex: 0 0 100%; min-width: 0; }
    .kt-slider-wrap { position: relative; overflow: hidden; }
    @media (prefers-reduced-motion: reduce) {
      [data-kt-reveal], [data-kt-text-split], [data-kt-blur-text] { opacity: 1 !important; transform: none !important; filter: none !important; }
    }
  `;
  document.head.appendChild(style);
}

const Kineto = {
  version: '0.11.0',

  // Central easing subsystem (audit C / J-3). `Kineto.easing(name)` resolves any
  // token — CSS keyword, easings.net name, 'elastic-out'/'bounce-in-out'
  // (emitted as real `linear()` curves), 'spring' or {spring:{stiffness,damping,
  // mass,velocity}} (a real physics spring, also `linear()`), or a raw
  // cubic-bezier/linear string — to a valid CSS <easing-function>.
  easing: easingToCSS,
  easingFn,
  easings: EASINGS,

  get env() {
    if (!cachedEnv) cachedEnv = env();
    installReducedMotionWatch();
    return cachedEnv;
  },

  // Live, policy-resolved reduced-motion state (audit D-1 / J-5). Reflects OS
  // changes at runtime (see installReducedMotionWatch) and the active policy set
  // via setReducedMotion('user' | 'always' | 'never').
  get prefersReducedMotion() {
    if (config.forceReducedMotion) return true;
    return !!(config.respectReducedMotion && this.env.reducedMotion);
  },

  // Set the reduced-motion policy and notify listeners. New module inits honour
  // it immediately; a `kineto:reduced-motion` event fires so live views can react.
  setReducedMotion(policy) {
    if (policy === 'always') { config.forceReducedMotion = true; config.respectReducedMotion = true; }
    else if (policy === 'never') { config.forceReducedMotion = false; config.respectReducedMotion = false; }
    else { config.forceReducedMotion = false; config.respectReducedMotion = true; }
    // Re-apply to elements already on the page so the switch is live, not just
    // for future inits.
    reapplyReducedMotion();
    try { document.dispatchEvent(new CustomEvent('kineto:reduced-motion', { detail: { reduced: this.prefersReducedMotion } })); } catch (_e) { /* SSR */ }
    return this;
  },

  get performance() {
    return config.performance === 'auto' ? this.env.perf : config.performance;
  },

  get registry() {
    return Object.fromEntries(modules);
  },

  get instanceCount() {
    return records.size;
  },

  diagnostics,
  diagnosticCodes: DIAGNOSTIC_CODES,

  get smoothEnabled() {
    return Boolean(lenis);
  },

  get lenis() {
    return lenis;
  },

  config(options = {}) {
    if (options.smoothOptions) {
      config.smoothOptions = { ...config.smoothOptions, ...options.smoothOptions };
    }
    Object.assign(config, { ...options, smoothOptions: config.smoothOptions });
    if (options.spring !== undefined) setMotionDefaults({ spring: options.spring === true });
    cachedEnv = null;
    return this;
  },

  setAnimationEngine,

  // Point Kineto at a specific GSAP/Lenis build (pin a version, self-host, or use
  // an internal mirror) before any scroll effect initialises. Merges over the
  // defaults; unspecified engines keep the jsDelivr CDN source.
  setEngineSource(sources = {}) { setEngineSource(sources); return this; },
  getEngineSource() { return getEngineSource(); },

  enableSmooth(options = {}) {
    config.smooth = true;
    config.smoothOptions = { ...config.smoothOptions, ...options };
    if (!initialized) ensureCoreServices();
    else startSmoothService();
    return this;
  },

  disableSmooth() {
    config.smooth = false;
    stopSmoothService();
    return this;
  },

  toggleSmooth(force, options = {}) {
    const next = typeof force === 'boolean' ? force : !config.smooth;
    return next ? this.enableSmooth(options) : this.disableSmooth();
  },

  scrollTo(target, options = {}) {
    if (lenis) {
      lenis.scrollTo(target, options);
      return this;
    }
    if (typeof target === 'number') window.scrollTo({ top: target, behavior: options.behavior || 'smooth' });
    else q(target)[0]?.scrollIntoView?.({ behavior: options.behavior || 'smooth', block: options.block || 'start' });
    return this;
  },

  register(name, module) {
    if (!name || !module || typeof module.create !== 'function') {
      console.warn(`[Kineto] Module "${name}" needs a create() function.`);
      emitDiagnostic({ code: DIAGNOSTIC_CODES.INVALID_MODULE, module: String(name || 'unknown'), phase: 'register', recoverable: true });
      return this;
    }
    modules.set(name, module);
    this[name] = (target, options = {}) => this.create(name, target, options);
    return this;
  },

  unregister(name) {
    Array.from(records).forEach((record) => {
      if (record.name === name) removeRecord(record);
    });
    modules.delete(name);
    delete this[name];
    return this;
  },

  create(name, target, options = {}) {
    const module = modules.get(name);
    if (!module) {
      console.warn(`[Kineto] Unknown module: ${name}`);
      emitDiagnostic({ code: DIAGNOSTIC_CODES.UNKNOWN_MODULE, module: String(name || 'unknown'), phase: 'create', recoverable: true });
      return null;
    }

    const elements = q(target);
    if (!elements.length) return null;

    const instances = elements.map((el) => {
      const existing = getElementMap(el)?.get(name);
      if (existing) return existing.instance;

      // `transform` is a single string slot, and the modules below all write it
      // on the HOST element. Two of them on one element means whichever runs the
      // later frame silently erases the other — the shared `box-shadow` was given
      // a custom-property composition path for exactly this reason, `transform`
      // has not been. Warn rather than guess at a merge order: see
      // docs/rfc/module-composition.md.
      warnHostTransformClash(el, name);

      try {
        let instance;
        const reduced = this.prefersReducedMotion;
        const reducedHandler = module.reducedMotion || module.reduced;

        if (reduced) {
          // Bind to the module so a `reduced(){ return this.create(...) }` handler
          // keeps its `this` (calling `reducedHandler(...)` detached loses it and
          // breaks reduced-motion init for those modules).
          const reducedResult = reducedHandler ? reducedHandler.call(module, el, options, this) : undefined;
          instance = reducedResult || noopInstance(el, name);
        } else if (this.performance === 'low' && typeof module.fallback === 'function') {
          const fallbackResult = module.fallback.call(module, el, options, this);
          instance = fallbackResult || noopInstance(el, name);
        } else {
          instance = module.create(el, options, this);
        }

        if (!instance) {
          // 모듈이 "이 마크업에는 붙을 수 없다"고 한 경우입니다(필수 자식이 없다든지).
          // 오류가 아니지만 화면에는 아무 일도 일어나지 않으므로, 어느 요소였는지
          // 남깁니다 — 없으면 작성자도 AI 도구도 왜 안 되는지 알 길이 없습니다.
          emitDiagnostic({
            code: DIAGNOSTIC_CODES.NOT_APPLICABLE,
            module: name,
            phase: 'create',
            recoverable: true,
            detail: describeElement(el)
          });
          return null;
        }
        const created = addRecord(el, name, instance, options);
        if (pausesOffscreen(module, options)) watchOffscreen(getElementMap(el).get(name));
        return created;
      } catch (error) {
        console.error(`[Kineto/${name}] create() failed:`, error);
        emitDiagnostic({ code: DIAGNOSTIC_CODES.CREATE_FAILED, module: name, phase: 'create', recoverable: true, cause: error });
        return null;
      }
    }).filter(Boolean);

    if (instances.length) ensureCoreServices();
    return instances.length <= 1 ? (instances[0] || null) : instances;
  },

  scan(root = typeof document !== 'undefined' ? document : null) {
    if (this.env.ssr || !root) return this;
    ensureCoreServices();

    function* candidates(name) {
      const selector = `[data-kt-${dash(name)}]`;
      // Snapshot before root creation: factories can clone activation markup.
      const descendants = root.querySelectorAll?.(selector) || [];
      if (root.matches?.(selector)) yield root;
      yield* descendants;
    }
    const eligible = (el, name) => !getElementMap(el)?.has(name) && !activationIsOwnedOption(el, name);
    const scanModules = (engine) => {
      modules.forEach((_module, name) => {
        if (GSAP_MODULES.has(name) !== engine) return;
        for (const el of candidates(name)) {
          if (eligible(el, name)) this.create(name, el, readOpts(el, name));
        }
      });
    };
    // Pre-init flash guard: once modules have applied their initial states,
    // release the `kt-preload` veil (see kineto.css).
    const releaseVeil = () => {
      if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(() => document.documentElement.classList.remove('kt-preload'));
      else document.documentElement.classList.remove('kt-preload');
    };

    // Effects that don't need GSAP init immediately — they must never wait on a
    // network fetch. GSAP-backed effects init after the engine is ready.
    scanModules(false);

    const needsGsap = Array.from(GSAP_MODULES).some((name) => {
      if (!modules.has(name)) return false;
      for (const el of candidates(name)) { if (eligible(el, name)) return true; }
      return false;
    });

    const complete = () => { scanModules(true); releaseVeil(); };
    if (needsGsap && !gsapReady()) {
      // Fetch the engine (page global or CDN), THEN create the scroll modules so
      // they find GSAP — keeping the preload veil up until they've applied.
      ensureGSAP().finally(complete);
    } else complete();
    return this;
  },

  init(root = typeof document !== 'undefined' ? document : null) {
    return this.scan(root);
  },

  initModules(targets) {
    const elements = q(targets);
    elements.forEach((el) => this.scan(el));
    return this;
  },

  autoInit(root = typeof document !== 'undefined' ? document : null) {
    if (this.env.ssr || !root) return this;
    if (document.readyState === 'loading') {
      if (!domReadyScheduled) {
        domReadyScheduled = true;
        domReadyHandler = () => {
          domReadyScheduled = false;
          domReadyHandler = null;
          this.scan(root);
        };
        document.addEventListener('DOMContentLoaded', domReadyHandler, { once: true });
      }
      return this;
    }
    return this.scan(root);
  },

  /**
   * Watch `root` (default: the document) for markup added or removed after
   * the first scan. Added subtrees are scanned for activation attributes and
   * instances whose element left the document are destroyed. This is the
   * one-line integration for React/Vue apps and for UI libraries that inject
   * DOM (Bootstrap modals, shadcn/Radix portals, PrimeVue dialogs): put
   * `data-kt-*` attributes on any element that reaches the DOM and call
   * `Kineto.observe()` once at startup. Idempotent per root; returns a handle
   * whose `disconnect()` stops watching (instances stay alive).
   *
   * `options.scan` (default true) scans the root immediately.
   * `options.attributes` (default false) also reacts when a `data-kt-*`
   * attribute is added to an existing element, at the cost of observing
   * every attribute change under the root.
   */
  observe(root = typeof document !== 'undefined' ? document : null, options = {}) {
    const target = typeof root === 'string' ? q(root)[0] : root;
    const noop = { root: target || null, active: false, disconnect() {} };
    if (this.env.ssr || !target || typeof MutationObserver === 'undefined') return noop;
    const existing = observers.get(target);
    if (existing) return existing.handle;
    const live = createLiveObserver(target, options);
    const handle = {
      root: target,
      active: true,
      disconnect: () => {
        const entry = observers.get(target);
        if (!entry || entry.handle !== handle) return;
        entry.live.disconnect();
        observers.delete(target);
        handle.active = false;
      }
    };
    observers.set(target, { live, handle });
    if (options.scan !== false) this.scan(target);
    return handle;
  },

  getInstance(target, name) {
    const el = q(target)[0];
    if (!el) return null;
    if (name) return getElementMap(el)?.get(name)?.instance || null;
    return Array.from(getElementMap(el)?.values() || [], ({ instance }) => instance);
  },

  // Live-update an instance IN PLACE when the module supports it, instead of the
  // blunt destroy→recreate cycle (audit B-5 / section I). A module that
  // implements `update(patch, mergedOptions)` mutates its existing DOM/animation
  // (e.g. a colour, speed or label change) with no teardown; modules that don't
  // fall back to recreate. Returns whether at least one instance updated live.
  //
  // `update()` may return `false` for a patch it cannot apply live (Stylize
  // does this for anything but its motion/pointer settings) — that is a normal
  // answer, not a failure, and the instance is recreated quietly. Throwing is
  // reserved for a genuine error and is reported as one.
  updateModule(target, name, patch = {}) {
    const els = q(target);
    let liveCount = 0;
    els.forEach((el) => {
      const record = getElementMap(el)?.get(name);
      if (record && typeof record.instance.update === 'function') {
        const merged = { ...record.options, ...patch };
        try {
          if (record.instance.update(patch, merged) !== false) {
            record.options = merged;
            liveCount += 1;
            return;
          }
        } catch (error) {
          console.error(`[Kineto/${name}] update() failed, recreating:`, error);
          emitDiagnostic({ code: DIAGNOSTIC_CODES.UPDATE_FAILED, module: name, phase: 'update', recoverable: true, cause: error });
        }
      }
      const opts = record ? { ...record.options, ...patch } : patch;
      if (record?.instance?.effect === 'radial' && Number.isFinite(record.instance.index)) {
        opts.initialIndex = record.instance.index;
      }
      this.destroyModule(el, name);
      this.create(name, el, opts);
    });
    return liveCount > 0;
  },

  destroyModule(target, name) {
    const roots = q(target);
    if (!roots.length) return this;
    Array.from(records).forEach((record) => {
      if (record.name === name && matchesRoot(record, roots)) removeRecord(record);
    });
    return this;
  },

  replay(target, name, options) {
    const roots = q(target);
    const matched = [];
    Array.from(records).forEach((record) => {
      if (record.name === name && matchesRoot(record, roots)) matched.push(record);
    });
    const results = [];
    matched.forEach((record) => {
      // Prefer the instance's own replay() when no new options are given: it plays
      // the effect in place, which works even when the element is already on screen.
      // Destroy + recreate builds a fresh ScrollTrigger that won't fire onEnter for
      // an already-visible element, so the effect would stay stuck at its start.
      if (!options && typeof record.instance?.replay === 'function') {
        record.instance.replay();
        results.push(record.instance);
      } else {
        const el = record.sourceEl;
        const opts = options || record.options;
        removeRecord(record, true, false);
        const inst = this.create(name, el, opts);
        if (inst) results.push(inst);
      }
    });
    return results.length <= 1 ? (results[0] || null) : results;
  },

  destroy(target) {
    if (target) {
      const roots = q(target);
      Array.from(records).forEach((record) => {
        if (matchesRoot(record, roots)) removeRecord(record);
      });
      return this;
    }

    Array.from(records).forEach((record) => removeRecord(record));
    Array.from(observers.values()).forEach(({ handle }) => handle.disconnect());
    teardownCoreServices();
    return this;
  },

  pause() {
    records.forEach(({ instance }) => instance.pause());
    lenis?.stop();
    return this;
  },

  resume() {
    records.forEach(({ instance }) => instance.resume());
    lenis?.start();
    return this;
  },

  refresh() {
    ST()?.refresh();
    return this;
  }
};

Kineto.core = {
  initModules: (targets) => Kineto.initModules(targets),
  destroyModule: (target, name) => Kineto.destroyModule(target, name),
  getInstance: (target, name) => Kineto.getInstance(target, name),
  replay: (target, name, options) => Kineto.replay(target, name, options),
  scan: (root) => Kineto.scan(root),
  enableSmooth: (options) => Kineto.enableSmooth(options),
  disableSmooth: () => Kineto.disableSmooth(),
  toggleSmooth: (force, options) => Kineto.toggleSmooth(force, options),
  scrollTo: (target, options) => Kineto.scrollTo(target, options)
};

export default Kineto;
