import { clamp, observeOnce } from '../utils.js';
import { fn as easingFunction } from '../easings.js';
import { coverMap } from './media/rasterizer.js';
import { createLayer, ensureWrapper, releaseWrapper } from './media/wrapper.js';
import {
  ANIMATED_EXTENSIONS, createImageStylizer, createVideoStylizer, durationMs, isStylizedEffect, resolveStylizedSettings
} from './media/stylizer.js';

// `dither` / `ascii` / `halftone` were Lazy variants in 0.10.0. They are now
// the Stylize module (`data-kt-stylize`); Lazy keeps them for one minor as
// deprecated aliases — lazy-load first, then the same stylizer controller —
// and reports KT_DEPRECATED through the opt-in diagnostics.
const STYLIZED_ALIAS_REPLACEMENT = 'stylize';

/** The wrapper box options Lazy exposes (`display`, `aspectRatio`, `height`). */
function wrapperBox(opts) {
  return { display: opts.display, aspectRatio: opts.aspectRatio, height: opts.height };
}

function sourceOf(el, opts = {}) {
  return opts.src || el.dataset.src || el.getAttribute('data-src') || el.currentSrc || el.getAttribute('src') || '';
}

/*
 * Pixel Mosaic (owner implementation, adapted from pixel-mosaic v1.2.6).
 * Pixel stages are real block sizes in CSS pixels (largest → 1px), rendered on
 * a canvas that redraws the live <img> every frame, so animated GIF/WebP/APNG
 * keep playing during the reveal. Discrete stages use equal time slices.
 */
function resolvePixelSteps(opts, width, height) {
  const shortest = Math.max(1, Math.min(width || 300, height || 200));
  const toBlock = (value) => (value <= 1 ? Math.max(1, Math.round(1 / Math.max(0.004, value))) : Math.round(value));

  if (Array.isArray(opts.steps) && opts.steps.length) {
    const list = opts.steps.map(Number).filter((value) => Number.isFinite(value) && value > 0).map(toBlock);
    if (list.length) return list.sort((a, b) => b - a);
  }

  const count = Math.max(2, Math.round(Number(opts.pixelStepCount ?? opts.stepCount ?? 8)));
  const hasRatio = opts.pixelStart != null || opts.pixelEnd != null;
  const largest = hasRatio
    ? clamp(toBlock(clamp(Number(opts.pixelStart ?? 0.035), 0.004, 1)), 2, 200)
    : clamp(Math.round(shortest / 6), 20, 96);
  const smallest = hasRatio ? toBlock(clamp(Number(opts.pixelEnd ?? 1), 0.01, 1)) : 1;

  const output = [];
  for (let index = 0; index < count; index += 1) {
    const ratio = index / Math.max(1, count - 1);
    const raw = largest * Math.pow(Math.max(1, smallest) / largest, ratio);
    let value = Math.max(smallest, Math.round(raw));
    if (output.length && value >= output[output.length - 1]) {
      value = Math.max(smallest, output[output.length - 1] - 1);
    }
    output.push(value);
  }
  output[output.length - 1] = smallest;
  return output;
}

// A 1px stage is indistinguishable from the original image, so it acts as the
// hand-off point instead of keeping the canvas alive.
function visibleMosaicSteps(steps) {
  if (steps.length > 1 && steps[steps.length - 1] <= 1) return steps.slice(0, -1);
  return steps.length ? steps : [2];
}

function createLiveImage(src, el, opts = {}) {
  const image = document.createElement('img');
  image.className = 'kt-lazy-live-image';
  image.alt = '';
  image.setAttribute('aria-hidden', 'true');
  image.loading = 'eager';
  image.decoding = 'async';
  if (opts.crossOrigin) image.crossOrigin = opts.crossOrigin;
  const srcset = opts.srcset || el.getAttribute('data-srcset') || el.getAttribute('srcset');
  const sizes = opts.sizes || el.getAttribute('sizes');
  if (srcset) image.srcset = srcset;
  if (sizes) image.sizes = sizes;
  image.src = src;
  image.style.cssText = `display:block;width:100%;height:100%;object-fit:${opts.objectFit || 'cover'};object-position:${opts.objectPosition || '50% 50%'};border-radius:inherit;`;
  return image;
}

function createNoiseCanvas(wrapper, opts, zIndex = 4) {
  const canvas = document.createElement('canvas');
  canvas.className = 'kt-lazy-noise';
  canvas.setAttribute('aria-hidden', 'true');
  // The canvas is stretched to 100% of the wrapper, so its PIXEL size is the grain
  // size: 128x72 meant every noise pixel landed as a chunky block. 320x180 keeps
  // the 16:9 ratio and makes the grain ~2.5x finer, which reads as film grain
  // rather than a mosaic. Still overridable through noiseWidth / noiseHeight.
  canvas.width = Math.max(32, Number(opts.noiseWidth ?? 320));
  canvas.height = Math.max(18, Number(opts.noiseHeight ?? 180));
  canvas.style.cssText = `position:absolute;inset:0;width:100%;height:100%;z-index:${zIndex};pointer-events:none;mix-blend-mode:${opts.noiseBlend || 'overlay'};opacity:0;border-radius:inherit;`;
  wrapper.appendChild(canvas);
  const context = canvas.getContext('2d', { alpha: true });
  let last = 0;
  let frames = 0;
  const fps = clamp(Number(opts.noiseFps ?? 30), 4, 60);
  const interval = 1000 / fps;
  const draw = (time = performance.now()) => {
    if (!context || time - last < interval) return;
    last = time;
    const frame = context.createImageData(canvas.width, canvas.height);
    // 0.72, not 1: at full contrast the grain went to pure black/white and looked
    // harsh over the image. Lower amplitude keeps the texture but softens it.
    const contrast = clamp(Number(opts.noiseContrast ?? 0.95), 0.1, 3);
    for (let index = 0; index < frame.data.length; index += 4) {
      const random = (Math.random() - 0.5) * 255 * contrast + 128;
      const value = clamp(Math.round(random), 0, 255);
      frame.data[index] = value;
      frame.data[index + 1] = value;
      frame.data[index + 2] = value;
      frame.data[index + 3] = 255;
    }
    context.putImageData(frame, 0, 0);
    frames += 1;
    canvas.dataset.frames = String(frames);
  };
  return { canvas, draw };
}

function maskFor(direction, progress, feather = 8, inverse = false) {
  const p = clamp(progress * 100, 0, 100);
  const soft = clamp(Number(feather), 0, 30);
  const before = clamp(p - soft, 0, 100);
  const after = clamp(p + soft, 0, 100);
  const to = direction === 'up' ? 'to top' : direction === 'left' ? 'to left' : direction === 'right' ? 'to right' : 'to bottom';
  if (!inverse) return `linear-gradient(${to}, #000 0%, #000 ${before}%, transparent ${after}%, transparent 100%)`;
  return `linear-gradient(${to}, transparent 0%, transparent ${before}%, #000 ${after}%, #000 100%)`;
}

function preload(src, el, opts) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    if (opts.crossOrigin) image.crossOrigin = opts.crossOrigin;
    const srcset = opts.srcset || el.getAttribute('data-srcset') || el.getAttribute('srcset');
    if (srcset) image.srcset = srcset;
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Kineto lazy image failed to load: ${src}`));
    image.src = src;
    // Safari (esp. iOS) does not re-fire onload for an already-cached image, so a
    // replay would hang forever awaiting preload. Resolve straight away when the
    // image is already complete.
    if (image.complete && image.naturalWidth) resolve(image);
  });
}

// Lazy scroll-reveal for a <video>. Source(s) held in data-src / <source data-src>
// until near the viewport; on reveal we attach them, load, fade in over
// `duration`, and (when muted) autoplay. `once:false` re-arms on each entry and
// pauses on exit — handy for section hero loops.
function createVideoReveal(el, opts = {}) {
  const original = { style: el.getAttribute('style'), src: el.getAttribute('src'), preload: el.getAttribute('preload') };
  const sources = Array.from(el.querySelectorAll('source'));
  const directSrc = opts.src || el.dataset.src || el.getAttribute('data-src') || '';
  const duration = Math.max(0, Number(opts.duration ?? 0.6)) * 1000;
  const ease = opts.ease || 'cubic-bezier(.22,.8,.3,1)';
  const once = opts.once !== false;
  const autoplay = opts.autoplay !== false;
  const muted = opts.muted !== false;

  if (muted) { el.muted = true; el.setAttribute('muted', ''); }
  if (opts.loop !== false) { el.loop = true; }
  if (opts.playsinline !== false) el.setAttribute('playsinline', '');
  el.preload = opts.preload || 'none';
  el.style.opacity = '0';
  el.style.transition = `opacity ${duration}ms ${ease}`;
  el.style.willChange = 'opacity';

  let loaded = false;
  let destroyed = false;
  let observer = null;

  const attachSources = () => {
    if (loaded) return;
    loaded = true;
    let any = false;
    sources.forEach((s) => { const ds = s.dataset.src || s.getAttribute('data-src'); if (ds) { s.src = ds; any = true; } });
    if (directSrc) { el.src = directSrc; any = true; }
    if (any) el.load();
  };
  const play = () => {
    if (destroyed) return;
    el.style.opacity = '1';
    if (autoplay) { const p = el.play?.(); if (p && typeof p.catch === 'function') p.catch(() => {}); }
    opts.onReveal?.(el);
  };
  const reveal = () => { attachSources(); if (el.readyState >= 2) play(); else el.addEventListener('loadeddata', play, { once: true }); };

  if (once) {
    observer = observeOnce(el, reveal, { threshold: Number(opts.threshold ?? 0.15), rootMargin: opts.rootMargin || '200px 0px' });
  } else if (typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) reveal(); else if (loaded) el.pause?.(); });
    }, { threshold: Number(opts.threshold ?? 0.15), rootMargin: opts.rootMargin || '0px' });
    observer.observe(el);
  } else { reveal(); }

  return {
    el,
    type: 'lazy',
    get animatedMedia() { return true; },
    replay() { loaded = false; el.style.opacity = '0'; reveal(); },
    pause() { el.pause?.(); },
    resume() { if (loaded && autoplay) { const p = el.play?.(); if (p && typeof p.catch === 'function') p.catch(() => {}); } },
    destroy() {
      destroyed = true;
      observer?.disconnect?.();
      el.pause?.();
      el.removeEventListener('loadeddata', play);
      const restore = (name, value) => value == null ? el.removeAttribute(name) : el.setAttribute(name, value);
      restore('style', original.style);
      restore('src', original.src);
      restore('preload', original.preload);
    }
  };
}

// The raw option values the deprecated stylized aliases read. Reads stay in
// this file (the feature contract scans each module for its own options) and
// the `effect` branches let scripts/derive-variant-options.mjs attribute them
// to dither / ascii / halftone instead of to every Lazy variant.
function readStylizedInput(effect, opts, scope = null) {
  // Same design-token scope as the Stylize module the aliases delegate to.
  const input = { scope };
  if (effect === 'dither' || effect === 'ascii' || effect === 'halftone') {
    input.persist = opts.persist;
    input.cellSize = opts.cellSize;
    input.paperColor = opts.paperColor;
    input.inkColor = opts.inkColor;
    input.accentColor = opts.accentColor;
    input.originalColors = opts.originalColors;
    input.colorSteps = opts.colorSteps;
    input.inverted = opts.inverted;
    input.seed = opts.seed;
    input.renderFps = opts.renderFps;
    input.maxDpr = opts.maxDpr;
    input.ease = opts.ease;
  }
  if (effect === 'dither') input.ditherType = opts.ditherType;
  if (effect === 'ascii') { input.asciiChars = opts.asciiChars; input.asciiFont = opts.asciiFont; }
  if (effect === 'halftone') { input.halftoneShape = opts.halftoneShape; input.halftoneAngle = opts.halftoneAngle; }
  return input;
}

// Deprecated stylized <video> alias: the plain lazy video reveal handles
// loading/autoplay and the shared video stylizer re-renders each playing frame.
function createStylizedVideo(el, opts, effect, kineto = null) {
  reportDeprecatedAlias(kineto, effect);
  const lowTier = kineto?.performance === 'low';
  const wrapping = ensureWrapper(el, wrapperBox(opts));
  const { wrapper } = wrapping;
  const originalStyle = el.getAttribute('style');
  el.style.display = 'block';
  el.style.width = '100%';
  el.style.height = '100%';
  el.style.objectFit = opts.objectFit || 'cover';
  // Video renders every playing frame, so it starts from a lighter DPR budget.
  const settings = resolveStylizedSettings(effect, readStylizedInput(effect, opts, el), { lowTier, persistFps: 24, revealFps: 24, maxDpr: 1.5 });
  const stylizer = createVideoStylizer({
    el, wrapper, effect, settings, prefix: 'kt-lazy',
    durationMs: Math.max(120, durationMs(opts.duration, 1.6)),
    onProgress: (progress, target) => opts.onProgress?.(progress, target)
  });
  const inner = createVideoReveal(el, {
    ...opts,
    onReveal: (video) => {
      opts.onReveal?.(video);
      stylizer.start();
    }
  });

  return {
    el,
    type: 'lazy',
    get animatedMedia() { return true; },
    replay() { inner.replay(); stylizer.replay(); },
    pause() { stylizer.pause(); inner.pause(); },
    resume() { stylizer.resume(); inner.resume(); },
    destroy() {
      stylizer.destroy();
      inner.destroy();
      releaseWrapper(el, wrapping);
      if (originalStyle == null) el.removeAttribute('style');
      else el.setAttribute('style', originalStyle);
    }
  };
}

// Opt-in deprecation notice (Kineto.config({ debug: true }) or a diagnostics
// subscriber); silent otherwise, exactly like every other diagnostic.
function reportDeprecatedAlias(kineto, effect) {
  const diagnostics = kineto?.diagnostics;
  const code = kineto?.diagnosticCodes?.DEPRECATED;
  if (!diagnostics || !code) return;
  try {
    diagnostics.emit(diagnostics.create({
      code,
      module: 'lazy',
      phase: 'create',
      recoverable: true,
      detail: { variant: effect, replacement: `data-kt-${STYLIZED_ALIAS_REPLACEMENT}="${effect}"`, removal: 'next major' }
    }));
  } catch (_error) { /* diagnostics must never break creation */ }
}

export default {
  create(el, opts = {}, kineto = null) {
    // Scroll video reveal: a <video> stays unloaded until it nears the viewport,
    // then its source is attached, it loads, fades in, and (muted) autoplays —
    // the "lazy video" pattern. Kept as a fully isolated branch so it never
    // touches the well-tested <img> pixel/blur pipeline below. The stylized
    // effects layer their renderer on top of that same reveal.
    if (el.tagName === 'VIDEO') {
      const videoEffect = opts.preset || opts.effect || 'fade';
      return isStylizedEffect(videoEffect)
        ? createStylizedVideo(el, opts, videoEffect, kineto)
        : createVideoReveal(el, opts);
    }

    const requested = opts.preset || opts.effect || 'fade';
    // zoom was a near-duplicate of blur-up; keep the API alive but route it.
    const effect = requested === 'noise' ? 'dissolve' : requested === 'zoom' ? 'blur-up' : requested;
    const src = sourceOf(el, opts);
    if (!src) return null;

    const original = {
      style: el.getAttribute('style'),
      src: el.getAttribute('src'),
      srcset: el.getAttribute('srcset'),
      sizes: el.getAttribute('sizes'),
      loading: el.getAttribute('loading'),
      decoding: el.getAttribute('decoding')
    };
    const wrapping = ensureWrapper(el, wrapperBox(opts));
    const { wrapper } = wrapping;
    if (isStylizedEffect(effect)) reportDeprecatedAlias(kineto, effect);

    el.loading = opts.nativeLazy === false ? 'eager' : 'lazy';
    el.decoding = 'async';
    el.style.display = 'block';
    el.style.width = '100%';
    el.style.height = '100%';
    el.style.objectFit = opts.objectFit || 'cover';
    el.style.objectPosition = opts.objectPosition || '50% 50%';

    const layers = [];
    const timers = new Set();
    let observer = null;
    let rafId = null;
    let destroyed = false;
    let paused = false;
    let started = false;
    let noise = null;
    let stylized = null;
    // 타일/슬라이스 구성을 버스트마다 다르게 하려고 셉니다. 첫 번째는 선언된 seed 그대로라
    // 재현이 되고, 다시 재생하면 같은 그림이 아니라 새 배치가 나옵니다.
    let burstIndex = 0;
    const lowTier = kineto?.performance === 'low';

    const later = (callback, delay) => {
      const timer = setTimeout(() => {
        timers.delete(timer);
        if (!destroyed) callback();
      }, Math.max(0, Number(delay) || 0));
      timers.add(timer);
      return timer;
    };
    const removeLayers = () => {
      layers.splice(0).forEach((layer) => layer.remove());
      noise?.canvas.remove();
      noise = null;
      stylized?.destroy();
      stylized = null;
    };
    const expose = () => {
      const srcset = opts.srcset || el.getAttribute('data-srcset');
      if (srcset) el.srcset = srcset;
      if (opts.sizes) el.sizes = opts.sizes;
      el.loading = 'eager';
      el.src = src;
      el.style.opacity = '1';
      el.style.filter = 'none';
      el.style.transform = 'none';
      el.style.clipPath = 'none';
      el.style.maskImage = 'none';
      el.style.webkitMaskImage = 'none';
    };
    const finish = () => {
      expose();
      removeLayers();
      opts.onProgress?.(1, el);
      opts.onLoad?.(el);
    };

    const setupSkeleton = () => {
      const variant = opts.skeletonVariant || opts.variant || 'shimmer';
      const layer = createLayer(wrapper, `kt-lazy-skeleton kt-lazy-skeleton-${variant}`, 5);
      const base = opts.skeletonColor || 'color-mix(in srgb, currentColor 9%, transparent)';
      const highlight = opts.skeletonHighlight || 'rgba(255,255,255,.45)';
      const speed = Math.max(0.3, Number(opts.skeletonSpeed ?? 1.5));
      layer.style.backgroundColor = base;
      if (variant === 'pulse') {
        layer.style.animation = `kt-skeleton-pulse ${speed}s ease-in-out infinite`;
      } else {
        // Diagonal sweep with a soft band, closer to product skeletons.
        layer.style.backgroundImage = `linear-gradient(${Number(opts.skeletonAngle ?? 100)}deg,transparent 32%,${highlight} 50%,transparent 68%)`;
        layer.style.backgroundSize = '250% 100%';
        layer.style.animation = `kt-shimmer ${speed}s cubic-bezier(.4,.2,.6,.8) infinite`;
      }
      if (opts.skeletonIcon !== false) {
        const icon = document.createElement('span');
        icon.className = 'kt-lazy-skeleton-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.8" cy="8.8" r="1.9"/><path d="m21 15.2-3.6-3.6a1.8 1.8 0 0 0-2.6 0L6 21"/></svg>';
        layer.appendChild(icon);
      }
      layers.push(layer);
      el.style.opacity = '0';
      return layer;
    };

    const run = async () => {
      if (started || destroyed) return;
      started = true;
      const startedAt = performance.now();
      let image;
      try {
        image = await preload(src, el, opts);
      } catch (error) {
        removeLayers();
        if (opts.fallbackSrc) el.src = opts.fallbackSrc;
        else if (original.src == null) el.removeAttribute('src');
        else el.setAttribute('src', original.src);
        el.style.opacity = '1';
        opts.onError?.(error, el);
        return;
      }
      const minDuration = Math.max(0, Number(opts.minDuration ?? 0));
      const remaining = minDuration - (performance.now() - startedAt);
      if (remaining > 0) await new Promise((resolve) => later(resolve, remaining));
      if (destroyed) return;

      if (effect === 'skeleton') {
        const skeleton = layers[0] || setupSkeleton();
        expose();
        const fade = Math.max(0, Number(opts.fadeDuration ?? opts.duration ?? 0.45));
        el.style.transform = 'scale(1.015)';
        el.style.transition = `opacity ${fade}s ease, transform ${Math.max(fade, 0.5)}s cubic-bezier(.22,.8,.3,1)`;
        // The pulse/shimmer keyframes animate opacity/background, which would
        // override the inline opacity fade — so the skeleton (and its icon) would
        // linger as an afterimage. Stop the animation first so it fades cleanly,
        // and fade it out faster than the image so the icon is gone before the
        // photo resolves.
        skeleton.style.animation = 'none';
        skeleton.style.transition = `opacity ${Math.min(Math.max(fade * 0.5, 0.18), 0.32)}s ease`;
        requestAnimationFrame(() => {
          el.style.opacity = '1';
          el.style.transform = 'scale(1)';
          skeleton.style.opacity = '0';
        });
        later(removeLayers, fade * 1000 + 60);
        opts.onLoad?.(el, image);
        return;
      }

      if (effect === 'fade') {
        el.src = src;
        // Clear any leftover transition from a previous run + force a reflow, so
        // the start (opacity 0) applies instantly instead of animating and
        // cancelling out the reveal on replay.
        el.style.transition = 'none';
        el.style.opacity = '0';
        void el.offsetWidth;
        el.style.transition = `opacity ${Math.max(0, Number(opts.duration ?? 0.7))}s ${opts.ease || 'ease'}`;
        requestAnimationFrame(() => { el.style.opacity = '1'; });
        opts.onLoad?.(el, image);
        return;
      }

      if (effect === 'blur-up') {
        el.src = src;
        el.style.transition = 'none'; // reset so replay re-animates from the start
        el.style.opacity = '1';
        el.style.filter = `blur(${Math.max(0, Number(opts.blur ?? 18))}px)`;
        el.style.transform = `scale(${Math.max(1, Number(opts.startScale ?? 1.06))})`;
        const duration = Math.max(0, Number(opts.duration ?? 0.85));
        void el.offsetWidth;
        requestAnimationFrame(() => {
          el.style.transition = `filter ${duration}s ease,transform ${duration}s cubic-bezier(.22,.8,.3,1)`;
          el.style.filter = 'blur(0px)';
          el.style.transform = 'scale(1)';
        });
        opts.onLoad?.(el, image);
        return;
      }

      if (effect === 'polaroid') {
        // Instant-photo development: overexposed, washed out and slightly
        // blurred, settling into full color inside a paper frame.
        el.src = src;
        const frameEnabled = opts.frame !== false;
        let frame = null;
        if (frameEnabled) {
          frame = createLayer(wrapper, 'kt-lazy-polaroid-frame', 6);
          const frameWidth = `clamp(6px, 4.5%, 18px)`;
          frame.style.cssText += `border:${frameWidth} solid ${opts.frameColor || '#fbfaf7'};border-bottom-width:calc(${frameWidth} * 3.2);box-shadow:inset 0 0 8px rgba(0,0,0,.12);`;
          layers.push(frame);
        }
        const duration = Math.max(0.2, Number(opts.duration ?? 2.4));
        el.style.transition = 'none'; // reset so replay re-animates from the start
        el.style.opacity = '1';
        el.style.filter = 'brightness(2.1) saturate(.05) contrast(.72) sepia(.28) blur(7px)';
        el.style.transform = `rotate(${Number(opts.rotate ?? -2)}deg) scale(.965)`;
        wrapper.style.transition = 'none';
        void el.offsetWidth;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          el.style.transition = `filter ${duration}s cubic-bezier(.3,.1,.25,1),transform ${Math.min(duration, 1.1)}s cubic-bezier(.34,1.4,.44,1)`;
          el.style.filter = 'none';
          el.style.transform = 'none';
        }));
        later(() => { if (opts.keepFrame !== true) finish(); else { expose(); opts.onLoad?.(el, image); } }, duration * 1000 + 120);
        return;
      }

      if (effect === 'crt') {
        // Old CRT / brown-tube TV power-on. A bright line snaps open, the
        // picture expands vertically out of it with a bloom, then settles.
        // A faint scanline overlay (on by default) sells the tube look.
        el.src = src;
        const duration = Math.max(0.3, Number(opts.duration ?? 1.1));
        el.style.opacity = '1';
        el.style.transformOrigin = 'center';
        el.style.willChange = 'transform, filter, opacity';
        el.style.animation = `kt-lazy-crt ${duration}s cubic-bezier(.2,.7,.2,1) both`;
        // The bright electron-beam line + a brief white bloom = authentic power-on.
        const beam = createLayer(wrapper, 'kt-lazy-crt-beam', 7);
        beam.style.cssText += 'pointer-events:none;top:50%;bottom:auto;height:2px;transform:translateY(-50%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.85) 16%,#fff 50%,rgba(255,255,255,.85) 84%,transparent);box-shadow:0 0 12px 2px rgba(255,255,255,.5);'
          + `animation:kt-lazy-crt-beam ${duration}s ease-out both;`;
        layers.push(beam);
        const bloom = createLayer(wrapper, 'kt-lazy-crt-bloom', 8);
        bloom.style.cssText += `pointer-events:none;background:#fff;animation:kt-lazy-crt-bloom ${duration}s ease-out both;`;
        layers.push(bloom);
        if (opts.frame !== false) {
          const scan = createLayer(wrapper, 'kt-lazy-crt-scan', 5);
          scan.style.cssText += 'pointer-events:none;background:repeating-linear-gradient(to bottom,rgba(0,0,0,.09) 0,rgba(0,0,0,.09) 1px,transparent 1px,transparent 3px);mix-blend-mode:multiply;opacity:0;'
            // Stays hidden while the picture is still a thin line (no grey flash),
            // then gently fades in and back out — no abrupt on/off.
            + `animation:kt-lazy-crt-scan ${duration}s ease both;`;
          layers.push(scan);
          // Black roll bar sweeping up/down (vertical-hold rolling) as it powers on.
          const roll = createLayer(wrapper, 'kt-lazy-crt-roll', 6);
          roll.style.cssText += 'pointer-events:none;top:0;bottom:auto;height:60%;background:linear-gradient(to bottom,transparent 0%,rgba(0,0,0,.18) 35%,rgba(0,0,0,.28) 50%,rgba(0,0,0,.18) 65%,transparent 100%);filter:blur(3px);'
            + `animation:kt-lazy-crt-roll ${duration}s linear both;`;
          layers.push(roll);
        }
        later(() => { el.style.animation = ''; el.style.willChange = ''; finish(); }, duration * 1000 + 160);
        return;
      }

      // ── Data Mosaic / RGB Slice Burst, shared with Page Reveal and Glitch ────
      // Both are tile/slice compositions over the loaded image rather than a
      // filter on it, so they live here as their own branches instead of being
      // squeezed into the blur/fade path.
      if (effect === 'data-mosaic' || effect === 'rgb-slice-burst') {
        const duration = Math.max(0.1, Number(opts.duration ?? 1.1));
        el.src = src;
        el.style.opacity = '1';
        const layer = createLayer(wrapper, `kt-lazy-${effect}-layer`, 3);
        layer.style.cssText += ';overflow:hidden';
        const box = wrapper.getBoundingClientRect();
        const width = box.width || el.naturalWidth || 300;
        const height = box.height || el.naturalHeight || 200;
        const burst = burstIndex;
        burstIndex += 1;
        let seedState = (((Math.floor(Number(opts.seed ?? 20260729)) || 1) >>> 0) + Math.imul(burst, 0x9E3779B1)) >>> 0;
        const rnd = () => {
          seedState = (seedState + 0x6D2B79F5) >>> 0;
          let t = seedState;
          t = Math.imul(t ^ (t >>> 15), t | 1);
          t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
        const between = (min, max) => min + rnd() * (max - min);
        if (effect === 'data-mosaic') {
          // A cover of tiles over the image that clears biggest-last, so the
          // photo assembles out of noise instead of fading in.
          const tileMax = Math.max(8, Number(opts.tileMax ?? 44));
          const tileMin = Math.max(3, Number(opts.tileMin ?? 8));
          const cover = String(opts.skeletonColor || '#0a0908');
          // 타일을 **재귀 분할**로 만듭니다. 예전에는 tileMax 격자의 칸마다 같은 배율로
          // 쪼개서 결과가 거의 한 가지 크기로 수렴했고, 그래서 모자이크가 아니라 규칙적인
          // 격자로 읽혔습니다("랜덤해 보이지 않는다"의 진짜 원인). 칸마다 더 쪼갤지를 따로
          // 굴리면 큰 타일과 작은 타일이 한 화면에 섞여 크기가 실제로 흩어집니다.
          // `tileMax` 가 가장 굵은 눈금, `tileMin` 이 더 이상 쪼개지 않는 바닥입니다.
          const nodes = [];
          const place = (x, y, size) => {
            if (x >= width || y >= height) return;
            if (size / 2 >= tileMin && rnd() < 0.68) {
              const half = size / 2;
              place(x, y, half);
              place(x + half, y, half);
              place(x, y + half, half);
              place(x + half, y + half, half);
              return;
            }
            const tileWidth = Math.ceil(Math.min(size, width - x));
            const tileHeight = Math.ceil(Math.min(size, height - y));
            if (tileWidth <= 0 || tileHeight <= 0) return;
            const tile = document.createElement('span');
            tile.style.cssText = `position:absolute;left:${x}px;top:${y}px;`
              + `width:${tileWidth}px;height:${tileHeight}px;background:${cover}`;
            layer.appendChild(tile);
            // 작은 타일이 먼저, 큰 덩어리가 나중에 걷힙니다 — 세부부터 드러나야 사진이
            // "조립되는" 인상이 나고, 반대로 하면 그냥 덩어리가 사라지는 것으로 보입니다.
            nodes.push({ tile, weight: rnd() * 0.66 + (size / tileMax) * 0.34 });
          };
          for (let y = 0; y < height; y += tileMax) {
            for (let x = 0; x < width; x += tileMax) place(x, y, tileMax);
          }
          nodes.sort((a, b) => a.weight - b.weight);
          nodes.forEach((entry, index) => {
            const t = index / Math.max(1, nodes.length - 1);
            later(() => {
              entry.tile.style.transition = 'opacity 90ms linear';
              entry.tile.style.opacity = '0';
            }, t * duration * 1000);
          });
          later(() => { layer.remove(); finish(); }, duration * 1000 + 200);
        } else {
          // 이미지가 막 올라올 때 한 번 터지는 채널 분리. 반복이 아니라 단발입니다.
          //
          // 예전에는 **단색 띠**를 얹고 통째로 사라지게 했습니다. 움직임이 없어서 사진과
          // 아무 관계 없는 디버그 오버레이처럼 보였고, 그래서 "퀄이 떨어진다"가 됩니다.
          // RGB 슬라이스는 원래 **사진 자신**을 채널로 나눠 어긋나게 미는 것이므로, 사진을
          // 채널 색으로 곱한 사본(background-blend-mode:multiply)을 가로 띠로 잘라 좌우로
          // 밀고 몇 프레임 튀게 합니다. 색이 사진에서 나오므로 화면과 따로 놀지 않습니다.
          const palette = (Array.isArray(opts.colors) && opts.colors.length >= 3)
            ? opts.colors : ['#ff2020', '#20ff40', '#2060ff'];
          const sliceCount = Math.round(between(4, 7));
          const shove = Math.max(6, width * 0.05);
          // 레인 번호를 섞어 앞에서부터 sliceCount 개만 씁니다 — 위치는 흩어지되 규칙적이지 않게.
          const laneOrder = Array.from({ length: sliceCount * 2 }, (_unused, lane) => lane);
          for (let index = laneOrder.length - 1; index > 0; index -= 1) {
            const swap = Math.floor(rnd() * (index + 1));
            const held = laneOrder[index];
            laneOrder[index] = laneOrder[swap];
            laneOrder[swap] = held;
          }
          for (let index = 0; index < sliceCount; index += 1) {
            // 레인을 슬라이스 수의 **두 배**로 잘라 그중 일부만 씁니다. 완전히 무작위로 뿌리면
            // 한쪽에 몰려 "아래쪽만 색이 뜬" 것처럼 보이고, 레인마다 하나씩 채우면 일정한
            // 줄무늬(블라인드)가 되어 글리치가 아니라 테스트 패턴으로 읽힙니다. 절반만 채우면
            // 프레임 대부분은 깨끗한 채로 몇 군데가 불규칙하게 튑니다.
            const lane = height / laneOrder.length;
            const bandHeight = Math.max(6, Math.min(lane * 1.4, between(height * 0.035, height * 0.12)));
            const top = Math.min(height - bandHeight, laneOrder[index] * lane + between(0, lane * 0.5));
            const band = document.createElement('span');
            band.style.cssText = `position:absolute;left:0;right:0;top:${top}px;height:${bandHeight}px;`
              + 'overflow:hidden;mix-blend-mode:screen;pointer-events:none;'
              + `opacity:${between(0.32, 0.6).toFixed(2)}`;
            // 띠 안에서 사진을 원래 위치 그대로 보이게 올려 두면, 띠는 사진의 그 부분을
            // 잘라 든 것이 됩니다 — 그래야 밀었을 때 "찢겨 어긋난" 것으로 읽힙니다.
            const skin = document.createElement('span');
            skin.style.cssText = `position:absolute;left:0;top:${-top}px;width:100%;height:${height}px;`
              + `background-image:url("${String(src).replace(/["\\]/g, '\\$&')}");`
              + 'background-size:cover;background-position:center;'
              + `background-color:${palette[index % palette.length]};background-blend-mode:multiply;`;
            band.appendChild(skin);
            layer.appendChild(band);
            // 대부분은 몇 px 만 어긋나 **색 테두리**로 읽히고(채널 분리의 본모습), 가끔 하나가
            // 크게 밀려 찢어집니다. 전부 크게 밀면 사진과 무관한 색 막대가 늘어설 뿐입니다.
            const torn = rnd() < 0.3;
            const offset = (rnd() < 0.5 ? -1 : 1) * (torn ? between(shove * 0.5, shove) : between(2, 9));
            const frames = [
              { transform: `translateX(${offset.toFixed(1)}px)`, opacity: band.style.opacity },
              { transform: `translateX(${(-offset * 0.55).toFixed(1)}px)`, opacity: band.style.opacity, offset: 0.45 },
              { transform: `translateX(${(offset * 0.22).toFixed(1)}px)`, opacity: '0.35', offset: 0.75 },
              { transform: 'translateX(0)', opacity: '0' }
            ];
            const burstMs = Math.max(220, duration * 520);
            if (typeof band.animate === 'function') {
              // 계단 이징이라 부드럽게 흐르지 않고 프레임 단위로 튑니다 — 글리치의 핵심입니다.
              band.animate(frames, { duration: burstMs, easing: 'steps(5, end)', fill: 'forwards' });
            } else {
              band.style.transition = `transform ${burstMs}ms steps(5, end), opacity ${burstMs}ms linear`;
              band.style.transform = 'translateX(0)';
              band.style.opacity = '0';
            }
          }
          later(() => { layer.remove(); finish(); }, duration * 1000 + 200);
        }
        return;
      }

      if (effect === 'wave' || effect === 'grain') {
        el.src = src;
        el.style.opacity = '1';
        const duration = Math.max(120, durationMs(opts.duration, effect === 'wave' ? 1.35 : 1.1));
        const delayMs = Math.max(0, Number(opts.delay ?? 60));
        const maxDpr = clamp(Number(opts.maxDpr ?? 1.5), 0.5, 2);
        const fps = clamp(Number(opts.renderFps ?? (effect === 'wave' ? 30 : 24)), 4, 60);
        const interval = 1000 / fps;
        const ease = easingFunction(opts.ease || 'cubic-out');
        const grainOpacity = clamp(Number(opts.grain ?? opts.noise ?? (effect === 'wave' ? 0.13 : 0.3)), 0, 1);
        const layer = createLayer(wrapper, `kt-lazy-${effect}-layer`, 3);
        const canvas = document.createElement('canvas');
        canvas.className = `kt-lazy-${effect}-canvas`;
        layer.appendChild(canvas);
        layers.push(layer);
        const context = canvas.getContext('2d', { alpha: true, desynchronized: true });
        noise = createNoiseCanvas(wrapper, opts, 4);
        noise.canvas.classList.add('kt-lazy-grain-canvas');
        let startTime = null;
        let pausedAt = null;
        let lastDraw = -Infinity;
        let cssWidth = 0;
        let cssHeight = 0;
        let dpr = 1;

        const sync = () => {
          const box = wrapper.getBoundingClientRect();
          cssWidth = Math.max(1, box.width);
          cssHeight = Math.max(1, box.height);
          dpr = clamp(window.devicePixelRatio || 1, 1, maxDpr);
          const width = Math.max(1, Math.round(cssWidth * dpr));
          const height = Math.max(1, Math.round(cssHeight * dpr));
          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
          }
          context.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        const draw = (progress, time) => {
          const drawable = el.complete && el.naturalWidth ? el : image;
          if (!drawable.naturalWidth) return;
          const map = coverMap(drawable.naturalWidth, drawable.naturalHeight, cssWidth, cssHeight);
          context.clearRect(0, 0, cssWidth, cssHeight);
          if (effect === 'grain') {
            context.drawImage(drawable, map.sx, map.sy, map.sw, map.sh, 0, 0, cssWidth, cssHeight);
          } else {
            const amplitude = Math.max(0, Number(opts.waveAmplitude ?? 22)) * (1 - progress);
            const frequency = Math.max(0.001, Number(opts.waveFrequency ?? 0.035));
            const speed = Number(opts.waveSpeed ?? 0.012);
            const sliceHeight = Math.max(1, Math.round(Number(opts.waveSliceHeight ?? 2)));
            for (let y = 0; y < cssHeight; y += sliceHeight) {
              const sourceY = map.sy + (y / cssHeight) * map.sh;
              const sourceH = Math.max(1, (sliceHeight / cssHeight) * map.sh);
              const offset = Math.sin(y * frequency + time * speed) * amplitude;
              context.drawImage(
                drawable,
                map.sx, sourceY, map.sw, sourceH,
                offset, y, cssWidth, sliceHeight
              );
            }
          }
        };
        const frame = (time) => {
          if (destroyed) return;
          if (paused) {
            if (pausedAt == null) pausedAt = time;
            rafId = requestAnimationFrame(frame);
            return;
          }
          if (pausedAt != null && startTime != null) {
            startTime += time - pausedAt;
            pausedAt = null;
          }
          if (startTime == null) startTime = time;
          const raw = clamp((time - startTime) / duration, 0, 1);
          const progress = clamp(ease(raw), 0, 1);
          if (time - lastDraw >= interval || raw >= 1) {
            sync();
            draw(progress, time);
            noise.draw(time);
            noise.canvas.style.opacity = String(grainOpacity * Math.pow(1 - progress, 1.15));
            layer.style.opacity = String(Math.max(0, 1 - progress));
            opts.onProgress?.(raw, el);
            lastDraw = time;
          }
          if (raw < 1) rafId = requestAnimationFrame(frame);
          else finish();
        };
        later(() => { rafId = requestAnimationFrame(frame); }, delayMs);
        return;
      }

      if (effect === 'pixelate') {
        el.src = src;
        el.style.opacity = '1';
        const layer = createLayer(wrapper, 'kt-lazy-pixelate-layer', 3);
        const canvas = document.createElement('canvas');
        canvas.className = 'kt-lazy-pixelate-canvas';
        canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
        layer.appendChild(canvas);
        layers.push(layer);
        // Monochrome film-grain over the mosaic (Pixel-Mosaic-Lazy-Loader style),
        // fading out as the picture resolves. On by default; data-kt-noise="false"
        // (or 0) turns it off, a number sets its peak opacity.
        const pxNoiseOn = opts.noise !== false && opts.noise !== 0 && opts.noise !== '0' && opts.noise !== 'false';
        const pxNoiseOpacity = typeof opts.noise === 'number' ? clamp(opts.noise, 0, 1) : 0.14;
        if (pxNoiseOn) { noise = createNoiseCanvas(wrapper, opts, 4); noise.canvas.style.opacity = String(pxNoiseOpacity); }
        const context = canvas.getContext('2d', { alpha: true, desynchronized: true });
        const small = document.createElement('canvas');
        const smallContext = small.getContext('2d', { alpha: true });

        const rect = wrapper.getBoundingClientRect();
        const steps = visibleMosaicSteps(resolvePixelSteps(opts, rect.width, rect.height));
        const stepDuration = Math.max(0, Number(opts.stepDuration ?? 0));
        const total = stepDuration > 0 ? stepDuration * steps.length : durationMs(opts.duration, 1.25);
        const delayMs = Math.max(0, Number(opts.delay ?? 100));
        const hold = Math.max(0, Number(opts.holdDuration ?? 0));
        const maxDpr = clamp(Number(opts.maxDpr ?? 2), 0.5, 4);
        const fps = clamp(Number(opts.renderFps ?? 60), 4, 120);
        const interval = 1000 / fps;

        let cssWidth = 0;
        let cssHeight = 0;
        const sync = () => {
          const box = wrapper.getBoundingClientRect();
          cssWidth = Math.max(1, box.width);
          cssHeight = Math.max(1, box.height);
          const dpr = clamp(window.devicePixelRatio || 1, 1, maxDpr);
          const pixelWidth = Math.max(1, Math.round(cssWidth * dpr));
          const pixelHeight = Math.max(1, Math.round(cssHeight * dpr));
          if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
            canvas.width = pixelWidth;
            canvas.height = pixelHeight;
          }
          context.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        // Drawing the live <img> each frame keeps GIF/APNG/animated WebP moving.
        const draw = (pixelSize) => {
          const drawable = el.complete && el.naturalWidth ? el : image;
          const sourceWidth = drawable.naturalWidth;
          const sourceHeight = drawable.naturalHeight;
          if (!sourceWidth || !sourceHeight) return;
          const smallWidth = Math.max(1, Math.ceil(cssWidth / Math.max(1, pixelSize)));
          const smallHeight = Math.max(1, Math.ceil(cssHeight / Math.max(1, pixelSize)));
          if (small.width !== smallWidth || small.height !== smallHeight) {
            small.width = smallWidth;
            small.height = smallHeight;
          }
          const map = coverMap(sourceWidth, sourceHeight, cssWidth, cssHeight);
          smallContext.clearRect(0, 0, smallWidth, smallHeight);
          smallContext.imageSmoothingEnabled = true;
          try {
            smallContext.drawImage(drawable, map.sx, map.sy, map.sw, map.sh, 0, 0, smallWidth, smallHeight);
          } catch (_error) {
            return;
          }
          context.clearRect(0, 0, cssWidth, cssHeight);
          context.imageSmoothingEnabled = false;
          context.drawImage(small, 0, 0, smallWidth, smallHeight, 0, 0, cssWidth, cssHeight);
        };

        let startTime = null;
        let pausedAt = null;
        let lastDraw = -Infinity;
        let lastStage = -1;
        const frame = (time) => {
          if (destroyed) return;
          if (paused) {
            if (pausedAt == null) pausedAt = time;
            rafId = requestAnimationFrame(frame);
            return;
          }
          if (pausedAt != null && startTime != null) {
            startTime += time - pausedAt;
            pausedAt = null;
          }
          if (startTime == null) startTime = time;
          const progress = clamp((time - startTime) / Math.max(1, total), 0, 1);
          if (noise) { noise.draw(time); noise.canvas.style.opacity = String(pxNoiseOpacity * Math.max(0, 1 - progress)); }
          const index = progress >= 1 ? steps.length - 1 : Math.min(steps.length - 1, Math.floor(progress * steps.length));
          // Never skip a stage: every configured pixel step renders and
          // reports progress at least once, even under slow frames.
          while (lastStage < index) {
            lastStage += 1;
            sync();
            draw(steps[lastStage]);
            lastDraw = time;
            opts.onProgress?.(clamp((lastStage + 1) / (steps.length + 1), 0, 1), el);
          }
          if (progress >= 1) {
            later(finish, hold);
            return;
          }
          if (time - lastDraw >= interval) {
            sync();
            draw(steps[index]);
            lastDraw = time;
          }
          rafId = requestAnimationFrame(frame);
        };
        sync();
        draw(steps[0]);
        later(() => { rafId = requestAnimationFrame(frame); }, delayMs);
        return;
      }

      if (effect === 'flicker') {
        // Callisto-style glitch load: the image strobes on through horizontal
        // slice displacements and blackout flashes on a canvas, then settles.
        el.src = src;
        el.style.opacity = '1';
        const layer = createLayer(wrapper, 'kt-lazy-flicker-layer', 3);
        layer.style.background = opts.flickerBackground || '#000';
        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
        layer.appendChild(canvas);
        layers.push(layer);
        const context = canvas.getContext('2d', { alpha: false });
        const duration = Math.max(120, durationMs(opts.duration, 1.15));
        const strength = clamp(Number(opts.glitchStrength ?? 1), 0.1, 3);
        const slices = Math.max(2, Math.round(Number(opts.sliceCount ?? 7)));
        const delayMs = Math.max(0, Number(opts.delay ?? 60));
        let startTime = null;
        let pausedAt = null;
        const sync = () => {
          const box = wrapper.getBoundingClientRect();
          const dpr = clamp(window.devicePixelRatio || 1, 1, clamp(Number(opts.maxDpr ?? 2), 0.5, 4));
          const pw = Math.max(1, Math.round(box.width * dpr));
          const ph = Math.max(1, Math.round(box.height * dpr));
          if (canvas.width !== pw || canvas.height !== ph) { canvas.width = pw; canvas.height = ph; }
        };
        const drawGlitch = (progress) => {
          const drawable = el.complete && el.naturalWidth ? el : image;
          if (!drawable.naturalWidth) return;
          const w = canvas.width;
          const h = canvas.height;
          const map = coverMap(drawable.naturalWidth, drawable.naturalHeight, w, h);
          context.fillStyle = '#000';
          context.fillRect(0, 0, w, h);
          // Blackout flash early on, less often as it settles.
          if (Math.random() < (1 - progress) * 0.28) return;
          const amp = (1 - progress) * strength;
          context.globalAlpha = 1;
          for (let index = 0; index < slices; index += 1) {
            const bandY = Math.floor((index / slices) * h);
            const bandH = Math.ceil(h / slices);
            const offset = Math.round((Math.random() - 0.5) * w * 0.12 * amp * (Math.random() < 0.4 ? 1 : 0.15));
            context.drawImage(
              drawable,
              map.sx, map.sy + (bandY / h) * map.sh, map.sw, (bandH / h) * map.sh,
              offset, bandY, w, bandH
            );
          }
          // Ghost pass for a subtle chromatic double-exposure.
          if (amp > 0.15 && Math.random() < 0.6) {
            context.globalAlpha = 0.18 * amp;
            context.drawImage(drawable, map.sx, map.sy, map.sw, map.sh, Math.round(8 * amp), 0, w, h);
            context.globalAlpha = 1;
          }
        };
        const frame = (time) => {
          if (destroyed) return;
          if (paused) {
            if (pausedAt == null) pausedAt = time;
            rafId = requestAnimationFrame(frame);
            return;
          }
          if (pausedAt != null && startTime != null) { startTime += time - pausedAt; pausedAt = null; }
          if (startTime == null) startTime = time;
          const progress = clamp((time - startTime) / duration, 0, 1);
          sync();
          drawGlitch(progress);
          opts.onProgress?.(progress, el);
          if (progress < 1) rafId = requestAnimationFrame(frame);
          else finish();
        };
        later(() => { rafId = requestAnimationFrame(frame); }, delayMs);
        return;
      }

      // Spelled out per variant so scripts/derive-variant-options.mjs can
      // attribute the timing reads below to these three aliases only.
      if (effect === 'dither' || effect === 'ascii' || effect === 'halftone') {
        // Deprecated alias of the Stylize module: reveal into the original (or
        // keep the look with `persist`). The original stays visible underneath
        // the canvas so a source the canvas cannot read back (cross-origin
        // without CORS) still shows the picture.
        el.src = src;
        el.style.opacity = '1';
        // A still image only animates while revealing, so the reveal gets a
        // higher frame budget than a permanent (persist) stylization.
        const settings = resolveStylizedSettings(effect, readStylizedInput(effect, opts, el), { lowTier, persistFps: 24, revealFps: 30, maxDpr: 2 });
        stylized = createImageStylizer({
          el, wrapper, effect, settings, prefix: 'kt-lazy',
          // Drawing the live <img> each frame keeps GIF/APNG/animated WebP moving.
          drawable: () => (el.complete && el.naturalWidth ? el : image),
          animatedSource: opts.animated === true || ANIMATED_EXTENSIONS.test(src),
          durationMs: Math.max(120, durationMs(opts.duration, 1.6)),
          delayMs: Math.max(0, Number(opts.delay ?? 60)),
          holdMs: Math.max(0, Number(opts.holdDuration ?? 0)),
          onProgress: (progress, target) => opts.onProgress?.(progress, target),
          onFinish: finish
        });
        layers.push(stylized.layer);
        if (settings.persist) opts.onLoad?.(el, image);
        stylized.start();
        return;
      }

      if (effect === 'print' || effect === 'dissolve') {
        el.src = src;
        el.style.opacity = '0';
        const base = createLayer(wrapper, `kt-lazy-${effect}-base`, 2);
        const baseImage = createLiveImage(src, el, opts);
        base.appendChild(baseImage);
        layers.push(base);
        let sharp = null;
        let sharpImage = null;
        let edge = null;
        if (effect === 'print') {
          sharp = createLayer(wrapper, 'kt-lazy-print-sharp', 3);
          sharpImage = createLiveImage(src, el, opts);
          sharp.appendChild(sharpImage);
          layers.push(sharp);
          // Soft printing edge: a faint, wide luminance lift that travels with
          // the scan front. Deliberately subtle — no neon line.
          edge = createLayer(wrapper, 'kt-lazy-print-edge', 5);
          edge.style.mixBlendMode = 'soft-light';
          layers.push(edge);
        }
        noise = createNoiseCanvas(wrapper, opts, 4);
        const duration = Math.max(50, durationMs(opts.duration, effect === 'print' ? 2.2 : 1.55));
        const delay = Math.max(0, Number(opts.delay ?? 100));
        const blur = Math.max(0, Number(opts.blur ?? (effect === 'print' ? 16 : 16)));
        const noiseOpacity = clamp(Number(opts.noise ?? (effect === 'print' ? 0.3 : 0.68)), 0, 1);
        const direction = opts.direction || 'down';
        const feather = Number(opts.feather ?? (effect === 'print' ? 12 : 8));
        let startTime = null;
        let pausedAt = null;
        const frame = (time) => {
          if (destroyed) return;
          if (paused) {
            if (pausedAt == null) pausedAt = time;
            rafId = requestAnimationFrame(frame);
            return;
          }
          if (pausedAt != null && startTime != null) {
            startTime += time - pausedAt;
            pausedAt = null;
          }
          if (startTime == null) startTime = time;
          const raw = clamp((time - startTime) / duration, 0, 1);
          const eased = 1 - Math.pow(1 - raw, 2.2);
          noise.draw(time);
          if (effect === 'print') {
            // Ease the scan itself so the head accelerates then settles.
            const scan = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
            const remainingBlur = blur * (1 - raw * 0.45);
            baseImage.style.filter = `blur(${remainingBlur}px) contrast(${1 + (1 - raw) * 0.1}) brightness(${1 + (1 - raw) * 0.06})`;
            sharp.style.maskImage = maskFor(direction, scan, feather, false);
            sharp.style.webkitMaskImage = sharp.style.maskImage;
            noise.canvas.style.maskImage = maskFor(direction, scan, feather, true);
            noise.canvas.style.webkitMaskImage = noise.canvas.style.maskImage;
            noise.canvas.style.opacity = String(noiseOpacity * (1 - Math.pow(raw, 1.6) * 0.85));
            const to = direction === 'up' ? 'to top' : direction === 'left' ? 'to left' : direction === 'right' ? 'to right' : 'to bottom';
            const p = clamp(scan * 100, 0, 100);
            const band = clamp(Number(opts.edgeWidth ?? 9), 2, 30);
            edge.style.opacity = raw >= 1 ? '0' : '1';
            edge.style.background = `linear-gradient(${to}, transparent ${clamp(p - band, 0, 100)}%, rgba(255,255,255,${clamp(Number(opts.edgeOpacity ?? 0.5), 0, 1)}) ${p}%, transparent ${clamp(p + band * 0.4, 0, 100)}%)`;
          } else {
            baseImage.style.filter = `blur(${blur * (1 - eased)}px) contrast(${1 + (1 - eased) * 0.22})`;
            noise.canvas.style.opacity = String(noiseOpacity * Math.pow(1 - eased, 1.2));
          }
          opts.onProgress?.(raw, el);
          if (raw < 1) rafId = requestAnimationFrame(frame);
          else finish();
        };
        later(() => { rafId = requestAnimationFrame(frame); }, delay);
        return;
      }

      expose();
      opts.onLoad?.(el, image);
    };

    if (effect === 'skeleton') setupSkeleton();
    else if (!['blur-up', 'polaroid', 'pixelate'].includes(effect) && !isStylizedEffect(effect)) el.style.opacity = '0';

    observer = observeOnce(el, run, {
      threshold: Number(opts.threshold ?? 0.05),
      rootMargin: opts.rootMargin || '200px 0px'
    });

    return {
      el,
      type: 'lazy',
      get animatedMedia() { return opts.animated === true || ANIMATED_EXTENSIONS.test(src); },
      replay() {
        removeLayers();
        started = false;
        if (effect === 'skeleton') setupSkeleton();
        run();
      },
      pause() { paused = true; stylized?.pause(); },
      resume() { paused = false; stylized?.resume(); },
      destroy() {
        destroyed = true;
        paused = false;
        observer?.disconnect();
        if (rafId != null) cancelAnimationFrame(rafId);
        timers.forEach(clearTimeout);
        timers.clear();
        removeLayers();
        releaseWrapper(el, wrapping);
        const restore = (name, value) => value == null ? el.removeAttribute(name) : el.setAttribute(name, value);
        restore('style', original.style);
        restore('src', original.src);
        restore('srcset', original.srcset);
        restore('sizes', original.sizes);
        restore('loading', original.loading);
        restore('decoding', original.decoding);
      }
    };
  },

  reduced(el, opts = {}) {
    const originalStyle = el.getAttribute('style');
    const originalSrc = el.getAttribute('src');
    const src = sourceOf(el, opts);
    if (src) el.src = src;
    el.style.opacity = '1';
    el.style.filter = 'none';
    el.style.transform = 'none';
    return {
      el,
      type: 'lazy',
      pause() {},
      resume() {},
      destroy() {
        if (originalStyle == null) el.removeAttribute('style'); else el.setAttribute('style', originalStyle);
        if (originalSrc == null) el.removeAttribute('src'); else el.setAttribute('src', originalSrc);
      }
    };
  }
};
