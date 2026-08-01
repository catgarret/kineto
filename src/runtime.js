// Animation-engine bridge.
//
// Kineto does NOT bundle GSAP or Lenis. Bundling would redistribute them (a
// licensing grey area for GSAP, whose terms restrict use in code-free visual
// animation builders) and pin their versions. Instead the engines are loaded at
// runtime, on demand:
//   1. If the page already exposes `window.gsap` / `window.Lenis` (you added a
//      <script>, or your bundler set them), Kineto uses that instance.
//   2. Otherwise, the first time an effect needs an engine, Kineto injects the
//      official CDN build. Nothing loads until a feature actually needs it, so a
//      page using only CSS-based effects never pulls GSAP.
// Offline / blocked CDN → the promise resolves to null and the affected modules
// fall back to native behaviour instead of crashing.

const win = typeof window !== 'undefined' ? window : undefined;
const resolveDefault = (value) => value?.default || value?.gsap || value;
const defer = (callback) => Promise.resolve().then(callback);

// CDN sources — overridable via Kineto.setEngineSource() to pin an exact
// version, self-host, or point at an internal mirror.
const sources = {
  gsap: 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js',
  scrollTrigger: 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollTrigger.min.js',
  lenis: 'https://cdn.jsdelivr.net/npm/lenis@1.3.25/dist/lenis.min.js'
};

let gsapInstance = (win && win.gsap) ? resolveDefault(win.gsap) : null;
let scrollTriggerInstance = (win && win.ScrollTrigger) ? resolveDefault(win.ScrollTrigger) : null;
let gsapPromise = null;
let lenisPromise = null;

export function setEngineSource(next = {}) {
  const gsapChanged = ('gsap' in next && next.gsap !== sources.gsap)
    || ('scrollTrigger' in next && next.scrollTrigger !== sources.scrollTrigger);
  const lenisChanged = 'lenis' in next && next.lenis !== sources.lenis;
  Object.assign(sources, next);
  // A failed request must not poison a later self-host/CDN override.
  if (gsapChanged && !gsapReady()) gsapPromise = null;
  if (lenisChanged && !(win && win.Lenis)) lenisPromise = null;
}

export function getEngineSource() {
  return { ...sources };
}

function registerScrollTrigger() {
  if (!gsapInstance || !scrollTriggerInstance || typeof gsapInstance.registerPlugin !== 'function') return;
  try {
    gsapInstance.registerPlugin(scrollTriggerInstance);
  } catch (_error) {
    // GSAP ignores duplicate registrations in browsers; some SSR/test
    // environments still throw, so registration stays best-effort.
  }
}

export function setAnimationEngine({ gsap, ScrollTrigger } = {}) {
  if (gsap) gsapInstance = resolveDefault(gsap);
  if (ScrollTrigger) scrollTriggerInstance = resolveDefault(ScrollTrigger);
  registerScrollTrigger();
}

export function getGSAP() {
  if (gsapInstance) return gsapInstance;
  if (win && win.gsap) { gsapInstance = resolveDefault(win.gsap); if (win.ScrollTrigger && !scrollTriggerInstance) scrollTriggerInstance = resolveDefault(win.ScrollTrigger); registerScrollTrigger(); return gsapInstance; }
  return null;
}

export function getScrollTrigger() {
  if (scrollTriggerInstance) return scrollTriggerInstance;
  if (win && win.ScrollTrigger) { scrollTriggerInstance = resolveDefault(win.ScrollTrigger); return scrollTriggerInstance; }
  return null;
}

// True once GSAP + ScrollTrigger are both usable — the signal the scan gate uses
// to decide whether it must fetch the engine before creating scroll modules.
export function gsapReady() {
  return Boolean(getGSAP()?.registerPlugin && getScrollTrigger());
}

function loadScript(src, timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    if (!src) { reject(new Error('Kineto: engine disabled')); return; }
    if (typeof document === 'undefined') { reject(new Error('Kineto: no document to load ' + src)); return; }
    // Reuse a matching tag if the page (or a previous call) already added it.
    const existing = Array.from(document.getElementsByTagName('script')).find((s) => s.src === src && s.dataset.ktFailed !== '1');
    if (existing) {
      if (existing.dataset.ktLoaded === '1') { resolve(); return; }
      let timer = null;
      const cleanup = () => { clearTimeout(timer); existing.removeEventListener('load', onLoad); existing.removeEventListener('error', onError); };
      const onLoad = () => { cleanup(); existing.dataset.ktLoaded = '1'; resolve(); };
      const onError = () => { cleanup(); existing.dataset.ktFailed = '1'; reject(new Error('Kineto: load failed ' + src)); };
      existing.addEventListener('load', onLoad, { once: true });
      existing.addEventListener('error', onError, { once: true });
      timer = setTimeout(() => { cleanup(); reject(new Error('Kineto: load timeout ' + src)); }, timeoutMs);
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    // ensureGSAP awaits GSAP before requesting ScrollTrigger, so downloads can
    // stay async without sacrificing execution order.
    script.async = true;
    script.dataset.ktEngine = '';
    let timer = null;
    const cleanup = () => { clearTimeout(timer); script.removeEventListener('load', onLoad); script.removeEventListener('error', onError); };
    const onLoad = () => { cleanup(); script.dataset.ktLoaded = '1'; resolve(); };
    const onError = () => { cleanup(); script.remove(); reject(new Error('Kineto: load failed ' + src)); };
    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', onError, { once: true });
    timer = setTimeout(() => { cleanup(); script.remove(); reject(new Error('Kineto: load timeout ' + src)); }, timeoutMs);
    (document.head || document.documentElement).appendChild(script);
  });
}

// Resolve with a ready GSAP (registering ScrollTrigger), loading the CDN build
// only if the page hasn't already provided one. Never rejects — on failure it
// resolves to whatever GSAP is available (possibly null) so callers degrade.
export function ensureGSAP() {
  if (gsapReady()) { registerScrollTrigger(); return Promise.resolve(getGSAP()); }
  if (gsapPromise) return gsapPromise;
  gsapPromise = (async () => {
    try {
      if (!(win && win.gsap)) await loadScript(sources.gsap);
      if (!(win && win.ScrollTrigger)) await loadScript(sources.scrollTrigger);
      setAnimationEngine({ gsap: win && win.gsap, ScrollTrigger: win && win.ScrollTrigger });
    } catch (_error) {
      // CDN unreachable — leave engines null; scroll modules fall back.
    }
    const result = getGSAP();
    if (!gsapReady()) defer(() => { gsapPromise = null; });
    return result;
  })();
  return gsapPromise;
}

// Resolve with the Lenis constructor (for smooth scroll), loading the CDN build
// on demand. Resolves to null if unavailable so smooth scroll degrades to native.
export function ensureLenis() {
  if (win && win.Lenis) return Promise.resolve(resolveDefault(win.Lenis));
  if (lenisPromise) return lenisPromise;
  lenisPromise = (async () => {
    try { await loadScript(sources.lenis); } catch (_error) {
      defer(() => { lenisPromise = null; });
      return null;
    }
    const result = (win && win.Lenis) ? resolveDefault(win.Lenis) : null;
    if (!result) defer(() => { lenisPromise = null; });
    return result;
  })();
  return lenisPromise;
}
