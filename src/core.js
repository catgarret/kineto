/**
 * Kineto core
 * Public API and lifecycle manager. The feature set is defined in
 * FEATURE_CONTRACT.md and tests/feature-contract.mjs.
 */

// Lenis (smooth scroll) is NOT bundled — it is loaded on demand via
// ensureLenis() (page global or official CDN) the first time enableSmooth() is
// called. Smooth scroll is opt-in and off by default, so a page that never
// enables it never fetches Lenis. See src/runtime.js for the engine loader.
import { dash, dropEmptyAttributes, env, G, NATIVE_POINTER_FIELDS, noopInstance, q, readOpts, ST, setMotionDefaults } from './utils.js';
import { setAnimationEngine, setEngineSource, getEngineSource, ensureGSAP, ensureLenis, gsapReady, engineFailure } from './runtime.js';
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
// Progress module on the same node. The map is generated from the contract
// (src/activationOwners.js), so a new option can never re-open the collision.
function activationIsOwnedOption(el, name) {
  return (ACTIVATION_OPTION_OWNERS[name] || []).some((owner) => el.hasAttribute?.(`data-kt-${dash(owner)}`));
}
import { toCSS as easingToCSS, fn as easingFn, EASINGS } from './easings.js';
import { createLayoutRefresh } from './layoutRefresh.js';
import { createDeferral } from './deferCreate.js';
import { ACTIVATION_OPTION_OWNERS } from './activationOwners.js';

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
  debugSink: null,
  // Refresh ScrollTrigger when the document's height changes on its own
  // (src/layoutRefresh.js). `false` leaves refreshing to the page.
  autoRefresh: true,
  // Create markup-discovered effects only when their element nears the
  // viewport (src/deferCreate.js). Off by default: a page opts in.
  defer: false
};

// Scroll-driven instances alive right now. The layout-shift watcher runs only
// while this is above zero, so a page without scroll effects pays nothing.
let scrollDrivenCount = 0;
// Elements scan() found but left for later (config.defer). Created through the
// normal create() path, with options read at that moment.
const deferral = createDeferral({
  create: (el, name) => {
    if (modules.has(name)) Kineto.create(name, el, readOpts(el, name));
  }
});

const layoutRefresh = createLayoutRefresh({
  getScrollTrigger: () => ST(),
  isEnabled: () => config.autoRefresh !== false
});

const diagnostics = createDiagnosticHub({
  isEnabled: () => Boolean(config.debug || typeof config.debugSink === 'function'),
  sink: (event) => {
    if (typeof config.debugSink === 'function') config.debugSink(event);
    else if (config.debug) console.info('[Kineto]', event);
  }
});

// One signal when an on-demand engine does not arrive (debug only, like every
// diagnostic). Modules already degrade on their own; this says WHY, and which
// modules were waiting, instead of leaving the author with effects that
// quietly did less. Nothing from the page is included — only engine, reason
// (the loader's own message, which names the engine URL) and module names.
function reportEngineUnavailable(engine, modules = []) {
  const reason = engineFailure(engine);
  if (!reason) return;
  diagnostics.emit({
    code: DIAGNOSTIC_CODES.ENGINE_UNAVAILABLE,
    phase: 'runtime',
    recoverable: true,
    detail: { engine, reason, modules: [...new Set(modules)].sort() }
  });
}

// Modules known by name but not imported yet. Only the `@dong-gri/kineto/auto`
// entry installs a source (src/lazyModules.js via setModuleSource()); the full
// and core entries leave it null, so scan() takes exactly its old path and they
// carry none of the loading code. Shape:
//   { discoverable(): string[], has(name), loadAll(names): Promise, notLoaded(name): null }
let moduleSource = null;

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
  if (GSAP_MODULES.has(name)) {
    scrollDrivenCount += 1;
    layoutRefresh.start();
  }
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
  if (GSAP_MODULES.has(record.name) && --scrollDrivenCount <= 0) {
    scrollDrivenCount = 0;
    layoutRefresh.stop();
  }
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
  if (teardownIfEmpty && records.size === 0) teardownInstanceServices();
}

// True when `root` is, or contains, `node` (the document and window cover all).
function coversNode(root, node) {
  if ((typeof document !== 'undefined' && root === document) ||
      (typeof window !== 'undefined' && root === window)) return true;
  return root === node || (typeof root?.contains === 'function' && root.contains(node));
}

// scan() creates GSAP-driven modules only after the engine has downloaded.
// Whatever the page tears down in the meantime must stay torn down: a
// Kineto.destroy(root), or removing the root, used to be undone a moment later
// when the engine arrived and the scan created instances on nodes the page had
// already let go of (and that nothing would ever destroy).
// jsdom 30 and later reject a selector longer than 2048 characters (a guard
// against runaway selectors; browsers have no limit), and jsdom is where most
// apps run their unit tests. The built-in registry's activation selector is
// about 1.1 KB, so it stays one traversal; a page that registers many modules
// of its own gets a few selectors under the limit instead of a RangeError.
const MAX_SELECTOR_LENGTH = 2048;
const DOCUMENT_POSITION_FOLLOWING = 4; // Node.DOCUMENT_POSITION_FOLLOWING

// `root` itself and the elements under it that match any of `parts` (simple
// selectors), each once and in document order.
function queryAny(root, parts) {
  const selectors = [];
  let current = '';
  for (const part of parts) {
    const joined = current ? `${current},${part}` : part;
    if (current && joined.length > MAX_SELECTOR_LENGTH) {
      selectors.push(current);
      current = part;
    } else current = joined;
  }
  if (current) selectors.push(current);
  const found = selectors.some((selector) => root.matches?.(selector)) ? [root] : [];
  if (selectors.length === 1) {
    root.querySelectorAll?.(selectors[0]).forEach((el) => found.push(el));
    return found;
  }
  const seen = new Set(found);
  selectors.forEach((selector) => root.querySelectorAll?.(selector).forEach((el) => {
    if (!seen.has(el)) { seen.add(el); found.push(el); }
  }));
  // Separate traversals interleave: put the union back in document order, so
  // each module still creates its elements top to bottom.
  return found.sort((a, b) => (a.compareDocumentPosition(b) & DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
}

const pendingScans = new Set(); // { root, cancelled, released: [roots destroyed meanwhile] }
function forgetPendingScans(roots = null) {
  pendingScans.forEach((pending) => {
    if (!roots || roots.some((gone) => coversNode(gone, pending.root))) pending.cancelled = true;
    else pending.released.push(...roots);
  });
}

function matchesRoot(record, roots) {
  return roots.some((root) => coversNode(root, record.sourceEl) || coversNode(root, record.instance.el));
}

// Destroy instances owned by source elements inside subtrees removed from an
// observed root. Walk only those subtrees instead of scanning the complete
// registry after every removal — large SPAs can keep thousands of unrelated
// instances alive elsewhere on the page.
function releaseDetachedSubtrees(roots) {
  const releaseElement = (el) => {
    if (!el || el.isConnected !== false) return;
    const map = getElementMap(el);
    if (!map?.size) return;
    // Snapshot because removeRecord mutates the per-element map.
    [...map.values()].forEach((record) => removeRecord(record));
  };
  roots.forEach((root) => {
    if (!root || root.nodeType !== 1 || root.isConnected) return;
    releaseElement(root);
    root.querySelectorAll?.('*').forEach(releaseElement);
  });
  deferral.prune();
}

// Build the MutationObserver behind Kineto.observe(). Mutations are batched
// into one microtask so a framework commit that touches hundreds of nodes
// costs one scan pass, not one per node.
function createLiveObserver(root, options) {
  const watchAttributes = options.attributes === true;
  let added = new Set();
  let removed = new Set();
  let scheduled = false;
  let active = true;
  const flush = () => {
    if (!active) return;
    scheduled = false;
    const nodes = added;
    added = new Set();
    const removedNodes = removed;
    removed = new Set();
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
    if (active && removedNodes.size) {
      removedNodes.forEach((node) => {
        // A framework may remove a parent and descendants separately in one
        // commit. Process only the outermost removed subtree.
        for (let parent = node.parentNode; parent; parent = parent.parentNode) {
          if (removedNodes.has(parent)) return;
        }
        releaseDetachedSubtrees([node]);
      });
    }
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
      mutation.removedNodes.forEach((node) => { if (node.nodeType === 1) removed.add(node); });
    });
    if (added.size || removed.size) schedule();
  });
  observer.observe(root, { childList: true, subtree: true, attributes: watchAttributes });
  return {
    disconnect() {
      active = false;
      observer.disconnect();
      added.clear();
      removed.clear();
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
// True when `node` ITSELF is a scrollable container (or is tagged with
// data-lenis-prevent), so Lenis should skip the event and let native scroll
// happen. Only this one element is checked: Lenis already calls `prevent` for
// every element on the event's path, target first. Walking the ancestors here
// as well read computed style depth² times per wheel event (a 12-deep target
// cost 78 style reads instead of 12).
function isInnerScrollable(node) {
  const root = typeof document !== 'undefined' ? document : null;
  if (!root || !node || node.nodeType !== 1) return false;
  if (node === root.body || node === root.documentElement) return false;
  if (node.hasAttribute('data-lenis-prevent') || node.hasAttribute('data-lenis-prevent-wheel')) return true;
  const style = getComputedStyle(node);
  const oy = style.overflowY;
  if ((oy === 'auto' || oy === 'scroll') && node.scrollHeight > node.clientHeight + 1) return true;
  const ox = style.overflowX;
  return (ox === 'auto' || ox === 'scroll') && node.scrollWidth > node.clientWidth + 1;
}

function startSmoothService(gsap = G(), scrollTrigger = ST()) {
  if (lenis || Kineto.env.ssr || !config.smooth || Kineto.performance === 'low') return Promise.resolve(lenis);
  if (lenisLoading) return lenisLoading;
  lenisLoading = (async () => {
    try {
      const Lenis = await ensureLenis();
      // ensureLenis resolves to null when offline / CDN blocked — fall back to
      // native scrolling instead of throwing.
      if (!Lenis) { reportEngineUnavailable('lenis', ['smooth']); return lenis; }
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

// Services that exist only for live instances: the layout watcher, the tab
// visibility hook and the reduced-motion / connection watchers. They go when
// the last instance goes and come back with the next create().
function teardownInstanceServices() {
  layoutRefresh.stop();
  scrollDrivenCount = 0;
  if (visibilityHandler && typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', visibilityHandler);
  }
  visibilityHandler = null;

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
  initialized = false;
}

// Everything, including what the PAGE switched on: smooth scroll
// (enableSmooth) and a pending autoInit() waiting for DOMContentLoaded. Only
// Kineto.destroy() ends those. Destroying the last instance used to do it too,
// so an SPA route unmounting its only effect turned smooth scroll off (while
// `config.smooth` stayed true) and silently dropped a pending autoInit().
function teardownCoreServices() {
  teardownInstanceServices();
  if (domReadyHandler && typeof document !== 'undefined') {
    document.removeEventListener('DOMContentLoaded', domReadyHandler);
  }
  domReadyHandler = null;
  domReadyScheduled = false;
  stopSmoothService();
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
    .kt-cursor-active :is(${NATIVE_POINTER_FIELDS}), .kt-cursor-scope :is(${NATIVE_POINTER_FIELDS}),
    .kt-cursor-active [data-kt-cursor-hide], .kt-cursor-active [data-kt-cursor-hide] *,
    .kt-cursor-scope [data-kt-cursor-hide], .kt-cursor-scope [data-kt-cursor-hide] * { cursor: auto !important; }
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
  version: '0.13.1',

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
  // `true`/`false` are accepted as 'always'/'never' — the type declarations
  // offered booleans for years while the code treated `true` as "follow the
  // system", so a page asking for reduced motion did not get it.
  setReducedMotion(policy) {
    if (policy === 'always' || policy === true) { config.forceReducedMotion = true; config.respectReducedMotion = true; }
    else if (policy === 'never' || policy === false) { config.forceReducedMotion = false; config.respectReducedMotion = false; }
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
    // Known but not imported yet (auto entry): create() is synchronous and
    // cannot wait, so the source starts the import and says how to wait for it.
    if (!module && moduleSource?.has(name)) return moduleSource.notLoaded(name);
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

    const eligible = (el, name) => !getElementMap(el)?.has(name) && !deferral.has(el, name) && !activationIsOwnedOption(el, name);
    // Discover one engine tier with one selector traversal (a few for a very
    // large registry — see queryAny) instead of one
    // querySelectorAll() per registered module. Keep results grouped by module
    // so create order remains the registry order, not DOM order across modules.
    const discoverModules = (engine) => {
      const names = [];
      const byAttribute = new Map();
      const add = (name) => {
        if (GSAP_MODULES.has(name) !== engine) return;
        names.push(name);
        byAttribute.set(`data-kt-${dash(name)}`, name);
      };
      modules.forEach((_module, name) => add(name));
      // On-demand modules (auto entry) are found by the same traversal and
      // created by the rescan that follows their import (see below).
      moduleSource?.discoverable().forEach((name) => { if (!modules.has(name)) add(name); });
      const discovered = new Map(names.map((name) => [name, []]));
      if (!names.length) return discovered;

      const collect = (el) => {
        const attributes = el.getAttributeNames?.() || [];
        attributes.forEach((attribute) => {
          const name = byAttribute.get(attribute);
          if (name && eligible(el, name)) discovered.get(name).push(el);
        });
      };

      // Snapshot the tier before creating from it: a factory may clone markup
      // carrying the same activation attribute, and that clone belongs to a
      // subsequent scan rather than recursively expanding this one.
      queryAny(root, names.map((name) => `[data-kt-${dash(name)}]`)).forEach(collect);
      return discovered;
    };
    const scanDiscovered = (discovered, keep = null) => {
      modules.forEach((module, name) => {
        const candidates = discovered.get(name);
        if (!candidates) return;
        // config.defer: a module that declares `defer: true` waits until its
        // element nears the viewport (src/deferCreate.js).
        const waits = config.defer === true && module.defer === true;
        candidates.forEach((el) => {
          if (keep && !keep(el)) return;
          if (waits && deferral.queue(el, name)) return;
          this.create(name, el, readOpts(el, name));
        });
      });
    };
    // Pre-init flash guard: once modules have applied their initial states,
    // release the `kt-preload` veil (see kineto.css).
    const releaseVeil = () => {
      if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(() => document.documentElement.classList.remove('kt-preload'));
      else document.documentElement.classList.remove('kt-preload');
    };

    // Effects that don't need GSAP init immediately — they must never wait on a
    // network fetch. Discover the whole tier once, then preserve registry-order
    // creation from that snapshot.
    const plainDiscovered = discoverModules(false);
    scanDiscovered(plainDiscovered);

    const gsapDiscovered = discoverModules(true);
    const needsGsap = Array.from(gsapDiscovered.values()).some((candidates) => candidates.length > 0);

    // Auto entry: modules the markup asked for that are known but not imported.
    // Import them, then scan once more — the rescan creates them and releases
    // the veil, so on-demand effects apply their first frame before content
    // shows, like GSAP modules do. A failed import is left out of discovery,
    // so the rescan always terminates. Without a source this is always empty.
    const toLoad = moduleSource
      ? [plainDiscovered, gsapDiscovered].flatMap((found) => Array.from(found)
        .filter(([name, candidates]) => candidates.length && !modules.has(name))
        .map(([name]) => name))
      : [];
    const release = toLoad.length ? () => {} : releaseVeil;
    if (toLoad.length) {
      moduleSource.loadAll(toLoad).then(() => (root.isConnected === false ? releaseVeil() : this.scan(root)));
    }

    if (needsGsap && !gsapReady()) {
      // Fetch the engine (page global or CDN), THEN create the scroll modules so
      // they find GSAP — keeping the preload veil up until they've applied.
      // Re-discover once after the asynchronous fetch so GSAP markup inserted
      // while the engine was loading keeps the pre-existing scan() semantics.
      // See pendingScans: skip a root destroyed meanwhile, and any element
      // under a root destroyed meanwhile. A root that was on the page and has
      // left it (or an element that has) is skipped too; a subtree scanned
      // before it was attached keeps its old behaviour.
      const pending = { root, cancelled: false, released: [] };
      pendingScans.add(pending);
      const watchConnection = root.isConnected !== false;
      const keep = (el) => (!watchConnection || el.isConnected !== false)
        && !pending.released.some((gone) => coversNode(gone, el));
      ensureGSAP().finally(() => {
        pendingScans.delete(pending);
        // The engine did not load: say which modules wait for it (diagnostic),
        // whether or not their root is still here.
        if (!gsapReady()) {
          reportEngineUnavailable('gsap', Array.from(gsapDiscovered.entries())
            .filter(([, candidates]) => candidates.length > 0).map(([name]) => name));
        }
        const rootLeft = watchConnection && root.isConnected === false;
        if (!pending.cancelled && !rootLeft) scanDiscovered(discoverModules(true), keep);
        release();
      });
    } else {
      scanDiscovered(gsapDiscovered);
      release();
    }
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
      // Rebuild THIS element's instance only. destroyModule(el, name) also
      // destroys every same-module instance nested inside `el` (a reveal
      // inside a reveal), and those were never recreated.
      if (record) removeRecord(record);
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
      deferral.cancel(roots);
      forgetPendingScans(roots);
      return this;
    }

    deferral.cancel();
    forgetPendingScans();
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

/**
 * Internal: installs the on-demand module source (see `moduleSource`). Only
 * src/lazyModules.js calls it; it is not part of the Kineto object, so bundles
 * that never import the auto entry drop it.
 */
export function setModuleSource(source) {
  moduleSource = source;
}

export default Kineto;
