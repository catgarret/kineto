import gsapPackage from 'gsap';
import ScrollTriggerPackage from 'gsap/ScrollTrigger.js';

const resolveDefault = (value) => value?.default || value?.gsap || value;
const win = typeof window !== 'undefined' ? window : undefined;

// Kineto bundles its own gsap + ScrollTrigger so it works with zero setup.
// But if the host page ALSO loads gsap from a CDN, there would be two gsap
// instances: the CDN's ScrollTrigger registers onto window.gsap while Kineto
// animates on the bundled copy, so every scrollTrigger tween fails with
// "Invalid property scrollTrigger ... Missing plugin? gsap.registerPlugin()"
// and scroll-sequence / sticky-stack / textFill silently stop working.
// Preferring the instance already on the page keeps everything on one gsap.
let gsapInstance = (win && win.gsap) || resolveDefault(gsapPackage);
let scrollTriggerInstance = (win && win.ScrollTrigger) || resolveDefault(ScrollTriggerPackage);

function registerScrollTrigger() {
  if (!gsapInstance || !scrollTriggerInstance || typeof gsapInstance.registerPlugin !== 'function') return;
  try {
    gsapInstance.registerPlugin(scrollTriggerInstance);
  } catch (_error) {
    // GSAP safely ignores duplicate registrations in browsers. Some SSR/test
    // environments can still throw, so registration remains best-effort.
  }
}

registerScrollTrigger();

export function setAnimationEngine({ gsap, ScrollTrigger } = {}) {
  if (gsap) gsapInstance = resolveDefault(gsap);
  if (ScrollTrigger) scrollTriggerInstance = resolveDefault(ScrollTrigger);
  registerScrollTrigger();
}

export function getGSAP() {
  if (gsapInstance) return gsapInstance;
  if (win) return win.gsap || null;
  return null;
}

export function getScrollTrigger() {
  if (scrollTriggerInstance) return scrollTriggerInstance;
  if (win) return win.ScrollTrigger || null;
  return null;
}
