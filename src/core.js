/**
 * Kineto core
 * Public API and lifecycle manager. The feature set is defined in
 * FEATURE_CONTRACT.md and tests/feature-contract.mjs.
 */

// Lenis (smooth scroll) is NOT bundled — it is loaded on demand via
// ensureLenis() (page global or official CDN) the first time enableSmooth() is
// called. Smooth scroll is opt-in and off by default, so a page that never
// enables it never fetches Lenis. See src/runtime.js for the engine loader.
import { dash, env, G, noopInstance, q, readOpts, ST, setMotionDefaults } from './utils.js';
import { setAnimationEngine, setEngineSource, getEngineSource, ensureGSAP, ensureLenis, gsapReady } from './runtime.js';

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

let initialized = false;
let domReadyScheduled = false;
let domReadyHandler = null;
let lenis = null;
let lenisRaf = null;
let lenisTicker = null;
let lenisLoading = null;
let visibilityHandler = null;
let cachedEnv = null;

const config = {
  smooth: false,
  smoothOptions: { lerp: 0.08, wheelMultiplier: 1, smoothWheel: true },
  respectReducedMotion: true,
  forceReducedMotion: false,
  performance: 'auto',
  spring: false,
  debug: false
};

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
  if (config.debug) console.info('[Kineto]', ...args);
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
  const record = { sourceEl, name, instance: normalized, options, destroyImplementation, destroying: false };

  // Calling instance.destroy() must also remove the core registry record.
  // Otherwise a later create() returns a stale, already-destroyed instance.
  normalized.destroy = () => removeRecord(record);

  records.add(record);
  getElementMap(sourceEl, true).set(name, record);
  return normalized;
}

function removeRecord(record, destroy = true, teardownIfEmpty = true) {
  if (!record || !records.has(record) || record.destroying) return;
  record.destroying = true;
  records.delete(record);
  const map = getElementMap(record.sourceEl);
  map?.delete(record.name);
  if (map?.size === 0) byElement.delete(record.sourceEl);

  if (destroy) {
    try {
      record.destroyImplementation();
    } catch (error) {
      console.error(`[Kineto/${record.name}] destroy() failed:`, error);
    }
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

  visibilityHandler = () => {
    const method = document.hidden ? 'pause' : 'resume';
    records.forEach(({ instance, name }) => {
      try {
        instance[method]();
      } catch (error) {
        console.error(`[Kineto/${name}] ${method}() failed:`, error);
      }
    });
  };
  document.addEventListener('visibilitychange', visibilityHandler);
}


// Async because Lenis is dynamically imported the first time smooth scroll is
// enabled. enableSmooth() still returns synchronously (chainable); the Lenis
// instance simply becomes live a microtask later, once the module resolves. A
// single in-flight guard (lenisLoading) stops concurrent enables from creating
// two Lenis instances.
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
  version: '0.8.50',

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
      return null;
    }

    const elements = q(target);
    if (!elements.length) return null;

    const instances = elements.map((el) => {
      const existing = getElementMap(el)?.get(name);
      if (existing) return existing.instance;

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

        if (!instance) return null;
        return addRecord(el, name, instance, options);
      } catch (error) {
        console.error(`[Kineto/${name}] create() failed:`, error);
        return null;
      }
    }).filter(Boolean);

    if (instances.length) ensureCoreServices();
    return instances.length <= 1 ? (instances[0] || null) : instances;
  },

  scan(root = typeof document !== 'undefined' ? document : null) {
    if (this.env.ssr || !root) return this;
    ensureCoreServices();

    const scanModules = (accept) => {
      modules.forEach((_module, name) => {
        if (!accept(name)) return;
        const selector = `[data-kt-${dash(name)}]`;
        const candidates = [];
        if (typeof Element !== 'undefined' && root instanceof Element && root.matches(selector)) candidates.push(root);
        if (typeof root.querySelectorAll === 'function') candidates.push(...root.querySelectorAll(selector));
        candidates.filter((el) => !activationIsOwnedOption(el, name))
          .forEach((el) => this.create(name, el, readOpts(el, name)));
      });
    };
    // Pre-init flash guard: once modules have applied their initial states,
    // release the `kt-preload` veil (see kineto.css).
    const releaseVeil = () => {
      if (typeof document === 'undefined') return;
      if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(() => document.documentElement.classList.remove('kt-preload'));
      else document.documentElement.classList.remove('kt-preload');
    };

    // Effects that don't need GSAP init immediately — they must never wait on a
    // network fetch. GSAP-backed effects init after the engine is ready.
    scanModules((name) => !GSAP_MODULES.has(name));

    const matches = (name) => {
      const selector = `[data-kt-${dash(name)}]`;
      if (typeof Element !== 'undefined' && root instanceof Element && root.matches(selector) && !activationIsOwnedOption(root, name)) return true;
      return typeof root.querySelectorAll === 'function'
        && Array.from(root.querySelectorAll(selector)).some((el) => !activationIsOwnedOption(el, name));
    };
    const needsGsap = Array.from(GSAP_MODULES).some(matches);

    if (needsGsap && !gsapReady()) {
      // Fetch the engine (page global or CDN), THEN create the scroll modules so
      // they find GSAP — keeping the preload veil up until they've applied.
      ensureGSAP().finally(() => { scanModules((name) => GSAP_MODULES.has(name)); releaseVeil(); });
    } else {
      scanModules((name) => GSAP_MODULES.has(name));
      releaseVeil();
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
  updateModule(target, name, patch = {}) {
    const els = q(target);
    let liveCount = 0;
    els.forEach((el) => {
      const record = getElementMap(el)?.get(name);
      if (record && typeof record.instance.update === 'function') {
        const merged = { ...record.options, ...patch };
        try {
          record.instance.update(patch, merged);
          record.options = merged;
          liveCount += 1;
          return;
        } catch (error) {
          console.error(`[Kineto/${name}] update() failed, recreating:`, error);
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
