// Stylize — give an <img> or <video> a rasterized look: dither, ASCII or
// halftone. It is a filter, not a loading effect: by default (`mode: persist`)
// the look stays for the media's whole life (a still image re-renders on
// resize, GIF/APNG/WebP and video frame by frame); `mode: reveal` plays the
// look once and shrinks its cells into the original picture instead.
//
//   <img data-kt-stylize="halftone" data-kt-cell-size="7" src="photo.webp" alt="…">
//   <video data-kt-stylize="ascii" data-kt-paper-color="#0b1220" src="clip.mp4" muted loop playsinline></video>
//   <img data-kt-stylize="dither" data-kt-mode="reveal" data-kt-trigger="view" src="photo.webp" alt="…">
//
// Loading stays native (or Lazy's, when both are attached — Stylize reuses
// Lazy's wrapper): a still image starts once it is complete, a video once it
// has data and plays. The original element is never hidden, so a source the
// canvas cannot read back (cross-origin without CORS) simply shows as-is.
//
// The drawing lives in ./media/rasterizer.js and the lifecycle in
// ./media/stylizer.js, shared with Lazy's deprecated dither/ascii/halftone
// aliases so both modules render identically.
import { observeOnce } from '../utils.js';
import { ensureWrapper, releaseWrapper } from './media/wrapper.js';
import {
  ANIMATED_EXTENSIONS, STYLIZED_EFFECTS, createImageStylizer, createVideoStylizer, durationMs, isStylizedEffect, resolveStylizedSettings
} from './media/stylizer.js';

const TRIGGERS = new Set(['load', 'view', 'manual']);
const WRAPPER_CLASS = 'kt-stylize-wrap';

/** The wrapper box options Stylize exposes (`display`, `aspectRatio`, `height`). */
function wrapperBox(opts) {
  return { className: WRAPPER_CLASS, display: opts.display, aspectRatio: opts.aspectRatio, height: opts.height };
}

function styleMedia(media, opts) {
  const original = media.getAttribute('style');
  media.style.display = 'block';
  media.style.width = '100%';
  media.style.height = '100%';
  media.style.objectFit = opts.objectFit || 'cover';
  if (media.tagName === 'IMG') media.style.objectPosition = opts.objectPosition || '50% 50%';
  return original;
}

/** The media element the module works on: the element itself or a descendant. */
function mediaOf(el) {
  if (el.tagName === 'IMG' || el.tagName === 'VIDEO') return el;
  return el.querySelector('img, video');
}

function currentSource(media) {
  return media.currentSrc || media.getAttribute('src') || media.getAttribute('data-src') || '';
}


// The raw option values, read here so the feature contract can scan this
// file for the options Stylize owns; the `effect` branches let
// scripts/derive-variant-options.mjs attribute each one to its variant.
function readStylizedInput(effect, opts, mode, scope = null) {
  const input = {
    // Design tokens (`var(--fg)`) are read from the element the look is on, so
    // a section that re-themes its tokens re-themes the effect too.
    scope,
    persist: mode === 'persist',
    cellSize: opts.cellSize,
    paperColor: opts.paperColor,
    inkColor: opts.inkColor,
    accentColor: opts.accentColor,
    originalColors: opts.originalColors,
    colorSteps: opts.colorSteps,
    inverted: opts.inverted,
    // Levels first: a mid-toned photograph dithers to grey mush, and pushing
    // contrast is what gives the print look its snap.
    contrast: opts.contrast,
    brightness: opts.brightness,
    // The look keeps moving on its own.
    motion: opts.motion,
    motionSpeed: opts.motionSpeed,
    motionAmount: opts.motionAmount,
    // …and reacts to the pointer.
    pointer: opts.pointer,
    pointerRadius: opts.pointerRadius,
    pointerStrength: opts.pointerStrength,
    pointerCellSize: opts.pointerCellSize,
    // How a reveal hands the picture back. Stylize defaults to the crisp
    // cell-by-cell dissolve; `shrink` is the older, softer walk-down.
    transition: opts.transition || 'dissolve',
    seed: opts.seed,
    renderFps: opts.renderFps,
    maxDpr: opts.maxDpr,
    ease: opts.ease
  };
  if (effect === 'dither') input.ditherType = opts.ditherType;
  if (effect === 'ascii') { input.asciiChars = opts.asciiChars; input.asciiFont = opts.asciiFont; }
  if (effect === 'halftone') { input.halftoneShape = opts.halftoneShape; input.halftoneAngle = opts.halftoneAngle; }
  return input;
}

function readTiming(opts) {
  return {
    durationMs: Math.max(120, durationMs(opts.duration, 1.6)),
    delayMs: Math.max(0, durationMs(opts.delay, 0)),
    holdMs: Math.max(0, durationMs(opts.holdDuration, 0))
  };
}

function createImageInstance(el, media, effect, opts, kineto) {
  const mode = opts.mode === 'reveal' ? 'reveal' : 'persist';
  const trigger = TRIGGERS.has(opts.trigger) ? opts.trigger : 'load';
  const lowTier = kineto?.performance === 'low';
  const wrapping = ensureWrapper(media, wrapperBox(opts));
  const { wrapper } = wrapping;
  const originalStyle = styleMedia(media, opts);

  // A still image only animates while revealing, so the reveal gets a higher
  // frame budget than a permanent (persist) look.
  const settings = resolveStylizedSettings(effect, readStylizedInput(effect, opts, mode, media), { lowTier, persistFps: 24, revealFps: 30, maxDpr: 2 });
  const src = currentSource(media);
  const animatedSource = opts.animated === true || ANIMATED_EXTENSIONS.test(src);
  let stylizer = null;
  let observer = null;
  let destroyed = false;
  let paused = false;
  let armed = false;

  const finishReveal = () => {
    // The layer has crossfaded into the original: drop it and report once.
    stylizer?.destroy();
    stylizer = null;
    opts.onComplete?.(media);
  };
  const run = () => {
    if (destroyed || stylizer) return;
    stylizer = createImageStylizer({
      el: media, wrapper, effect, settings, prefix: 'kt-stylize',
      animatedSource,
      ...readTiming(opts),
      onProgress: (progress, target) => opts.onProgress?.(progress, target),
      onFinish: finishReveal,
      onRendered: (rendered) => { if (rendered && mode === 'persist') opts.onComplete?.(media); }
    });
    if (paused) stylizer.pause();
    stylizer.start();
  };
  // Persist applies as soon as the pixels exist; a reveal additionally waits
  // for its trigger (in view, or a manual replay()).
  const arm = () => {
    if (destroyed || armed) return;
    armed = true;
    if (mode === 'persist' || trigger === 'load') { run(); return; }
    if (trigger === 'view') {
      observer = observeOnce(media, run, { threshold: Number(opts.threshold ?? 0.05), rootMargin: opts.rootMargin || '0px' });
    }
  };
  const ready = () => media.complete && media.naturalWidth > 0;
  const onLoad = () => { media.removeEventListener('load', onLoad); arm(); };
  if (ready()) arm();
  else media.addEventListener('load', onLoad);

  return {
    el,
    type: 'stylize',
    // True when frames keep coming: an animated source, or a look that moves
    // (motion / pointer) on a still picture.
    get animatedMedia() { return animatedSource || settings.live; },
    /** Play the reveal again (persist: re-paint from the current frame). */
    replay() {
      if (destroyed) return;
      if (stylizer) { stylizer.replay(); return; }
      if (ready()) run();
    },
    pause() { paused = true; stylizer?.pause(); },
    resume() { paused = false; stylizer?.resume(); },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      media.removeEventListener('load', onLoad);
      observer?.disconnect();
      observer = null;
      stylizer?.destroy();
      stylizer = null;
      releaseWrapper(media, wrapping);
      if (originalStyle == null) media.removeAttribute('style');
      else media.setAttribute('style', originalStyle);
    }
  };
}

function createVideoInstance(el, media, effect, opts, kineto) {
  let destroyed = false;
  let paused = false;
  let requested = false;
  let observer = null;
  let stylizer = null;
  const mode = opts.mode === 'reveal' ? 'reveal' : 'persist';
  const trigger = TRIGGERS.has(opts.trigger) ? opts.trigger : 'load';
  const lowTier = kineto?.performance === 'low';
  const wrapping = ensureWrapper(media, wrapperBox(opts));
  const { wrapper } = wrapping;
  const originalStyle = styleMedia(media, opts);

  // Video renders every playing frame, so it starts from a lighter DPR budget.
  const settings = resolveStylizedSettings(effect, readStylizedInput(effect, opts, mode, media), { lowTier, persistFps: 24, revealFps: 24, maxDpr: 1.5 });
  const run = () => {
    if (destroyed || stylizer || media.readyState < 2) return;
    observer?.disconnect();
    observer = null;
    stylizer = createVideoStylizer({
      el: media, wrapper, effect, settings, prefix: 'kt-stylize',
      ...readTiming(opts),
      onProgress: (progress, target) => opts.onProgress?.(progress, target),
      onFinish: () => opts.onComplete?.(media)
    });
    if (paused) stylizer.pause();
    stylizer.start();
  };
  const arm = () => {
    if (destroyed) return;
    if (requested || mode === 'persist' || trigger === 'load') { run(); return; }
    if (trigger === 'view') {
      observer = observeOnce(media, run, { threshold: Number(opts.threshold ?? 0.05), rootMargin: opts.rootMargin || '0px' });
    }
  };
  // Playback events may resume an armed controller, never bypass its trigger.
  const onData = () => { media.removeEventListener('loadeddata', onData); arm(); };
  if (media.readyState >= 2) arm();
  else media.addEventListener('loadeddata', onData);

  return {
    el,
    type: 'stylize',
    get animatedMedia() { return true; },
    replay() {
      if (destroyed) return;
      requested = true;
      if (stylizer) stylizer.replay();
      else run();
    },
    pause() { paused = true; stylizer?.pause(); },
    resume() { paused = false; stylizer?.resume(); },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      media.removeEventListener('loadeddata', onData);
      observer?.disconnect();
      stylizer?.destroy();
      releaseWrapper(media, wrapping);
      if (originalStyle == null) media.removeAttribute('style');
      else media.setAttribute('style', originalStyle);
    }
  };
}

export default {
  create(el, opts = {}, kineto = null) {
    const media = mediaOf(el);
    if (!media) return null;
    // `data-kt-stylize="ascii"` arrives as `preset`; unknown names fall back
    // to the default look (the literal here is what the option scanner and the
    // feature contract's defaultVariant agree on).
    const requested = opts.preset || opts.effect || 'dither';
    const effect = isStylizedEffect(requested) ? requested : STYLIZED_EFFECTS[0];
    return media.tagName === 'VIDEO'
      ? createVideoInstance(el, media, effect, opts, kineto)
      : createImageInstance(el, media, effect, opts, kineto);
  },

  // prefers-reduced-motion: the look itself is not motion, so `persist` stays
  // (an animated source moves on its own, stylized or not); a `reveal` skips
  // straight to its end state — the untouched original.
  reduced(el, opts = {}, kineto = null) {
    if (opts.mode === 'reveal') {
      return { el, type: 'stylize', pause() {}, resume() {}, replay() {}, destroy() {} };
    }
    return this.create(el, { ...opts, motion: 'none', pointer: 'none' }, kineto);
  }
};
