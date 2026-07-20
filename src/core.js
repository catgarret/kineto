/**
 * Kineto core
 * Public API and lifecycle manager. The feature set is defined in
 * FEATURE_CONTRACT.md and tests/feature-contract.mjs.
 */

import Lenis from 'lenis';
import { dash, env, G, noopInstance, q, readOpts, ST } from './utils.js';
import { setAnimationEngine } from './runtime.js';

const modules = new Map();
const records = new Set();
const byElement = new WeakMap();

let initialized = false;
let domReadyScheduled = false;
let domReadyHandler = null;
let lenis = null;
let lenisRaf = null;
let lenisTicker = null;
let visibilityHandler = null;
let cachedEnv = null;

const config = {
  smooth: false,
  smoothOptions: { lerp: 0.08, wheelMultiplier: 1, smoothWheel: true },
  respectReducedMotion: true,
  forceReducedMotion: false,
  performance: 'auto',
  debug: false
};

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


function startSmoothService(gsap = G(), scrollTrigger = ST()) {
  if (lenis || Kineto.env.ssr || !config.smooth || Kineto.performance === 'low') return lenis;
  try {
    lenis = new Lenis(config.smoothOptions);
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
  }
  return lenis;
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
  version: '0.8.16',

  get env() {
    if (!cachedEnv) cachedEnv = env();
    return cachedEnv;
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
    cachedEnv = null;
    return this;
  },

  setAnimationEngine,

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
        const reduced = config.forceReducedMotion ||
          (config.respectReducedMotion && this.env.reducedMotion);
        const reducedHandler = module.reducedMotion || module.reduced;

        if (reduced) {
          const reducedResult = reducedHandler?.(el, options, this);
          instance = reducedResult || noopInstance(el, name);
        } else if (this.performance === 'low' && typeof module.fallback === 'function') {
          const fallbackResult = module.fallback(el, options, this);
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

    modules.forEach((_module, name) => {
      const selector = `[data-kt-${dash(name)}]`;
      const candidates = [];
      if (typeof Element !== 'undefined' && root instanceof Element && root.matches(selector)) candidates.push(root);
      if (typeof root.querySelectorAll === 'function') candidates.push(...root.querySelectorAll(selector));
      candidates.forEach((el) => this.create(name, el, readOpts(el, name)));
    });
    // Pre-init flash guard: once modules have applied their initial states,
    // release the `kt-preload` veil (see kineto.css).
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => document.documentElement.classList.remove('kt-preload'));
    } else {
      document.documentElement.classList.remove('kt-preload');
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
