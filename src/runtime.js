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

// CDN sources — overridable via Kineto.setEngineSource() to pin an exact
// version, self-host, or point at an internal mirror.
const sources = {
  gsap: 'https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js',
  scrollTrigger: 'https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js',
  lenis: 'https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js'
};

let gsapInstance = (win && win.gsap) ? resolveDefault(win.gsap) : null;
let scrollTriggerInstance = (win && win.ScrollTrigger) ? resolveDefault(win.ScrollTrigger) : null;
let gsapPromise = null;
let lenisPromise = null;

export function setEngineSource(next = {}) {
  Object.assign(sources, next);
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

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') { reject(new Error('Kineto: no document to load ' + src)); return; }
    // Reuse a matching tag if the page (or a previous call) already added it.
    const existing = Array.from(document.getElementsByTagName('script')).find((s) => s.src === src);
    if (existing) {
      if (existing.dataset.ktLoaded === '1') { resolve(); return; }
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Kineto: failed to load ' + src)), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = false; // preserve gsap-before-ScrollTrigger order
    script.dataset.ktEngine = '';
    script.addEventListener('load', () => { script.dataset.ktLoaded = '1'; resolve(); }, { once: true });
    script.addEventListener('error', () => reject(new Error('Kineto: failed to load ' + src)), { once: true });
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
    return getGSAP();
  })();
  return gsapPromise;
}

// Resolve with the Lenis constructor (for smooth scroll), loading the CDN build
// on demand. Resolves to null if unavailable so smooth scroll degrades to native.
export function ensureLenis() {
  if (win && win.Lenis) return Promise.resolve(resolveDefault(win.Lenis));
  if (lenisPromise) return lenisPromise;
  lenisPromise = (async () => {
    try { await loadScript(sources.lenis); } catch (_error) { return null; }
    return (win && win.Lenis) ? resolveDefault(win.Lenis) : null;
  })();
  return lenisPromise;
}
