// Stylized-media controllers — the DOM/lifecycle half of dither, ASCII and
// halftone looks, shared by two modules:
//
//   - Stylize (`data-kt-stylize`): applies the look to an <img> / <video>,
//     permanently (`mode: 'persist'`) or as a reveal into the original.
//   - Lazy (`data-kt-lazy="dither|ascii|halftone"`): the deprecated aliases
//     from 0.10.0 that lazy-load the media first and then run the same
//     controller (removed in the next major; see docs/modules/stylize.md).
//
// The rasterizer (./rasterizer.js) only draws frames; this file owns the
// canvas layer, the frame budget, the reveal timeline and pause/replay/destroy.
// Each caller passes the wrapper it already owns and the class prefix its
// stylesheet and tests expect (`kt-stylize` / `kt-lazy`).
import { clamp } from '../../utils.js';
import { fn as easingFunction } from '../../easings.js';
import { createLayer } from './wrapper.js';
import { createStylizedRenderer, resolveStyleConfig } from './rasterizer.js';

export const STYLIZED_EFFECTS = Object.freeze(['dither', 'ascii', 'halftone']);
const EFFECT_SET = new Set(STYLIZED_EFFECTS);
// Starting cell (CSS px) per effect and the smallest cell a reveal shrinks to
// before the layer crossfades into the original.
const DEFAULT_CELL = { dither: 6, ascii: 12, halftone: 8 };
const HANDOFF_CELL = { dither: 2, ascii: 5, halftone: 3 };
// Cells shrink for the first 70% of a reveal, then the layer fades out.
const SHRINK_PORTION = 0.7;
export const REVEAL_TRANSITIONS = Object.freeze(['shrink', 'dissolve', 'wipe']);
export const ANIMATED_EXTENSIONS = /\.(?:gif|apng|webp)(?:$|[?#])/i;

/**
 * Follow the pointer over the wrapper so the renderer can react to it. Returns
 * a live `{ x, y, active }` in CSS pixels relative to the wrapper, plus the
 * listener teardown. `active` stays true after a touch ends so the last touched
 * spot keeps its effect instead of snapping back.
 */
export function trackPointer(wrapper) {
  const state = { x: 0, y: 0, active: false };
  const move = (event) => {
    const box = wrapper.getBoundingClientRect();
    state.x = event.clientX - box.left;
    state.y = event.clientY - box.top;
    state.active = true;
  };
  const leave = () => { state.active = false; };
  wrapper.addEventListener('pointermove', move, { passive: true });
  wrapper.addEventListener('pointerdown', move, { passive: true });
  wrapper.addEventListener('pointerleave', leave, { passive: true });
  return {
    state,
    destroy() {
      wrapper.removeEventListener('pointermove', move);
      wrapper.removeEventListener('pointerdown', move);
      wrapper.removeEventListener('pointerleave', leave);
    }
  };
}

export function isStylizedEffect(name) {
  return EFFECT_SET.has(name);
}

/** Seconds (≤ 30) or milliseconds, as the media modules have always accepted. */
export function durationMs(value, fallbackSeconds) {
  const number = Number(value ?? fallbackSeconds);
  if (!Number.isFinite(number)) return fallbackSeconds * 1000;
  return number <= 30 ? number * 1000 : number;
}

/**
 * One frame of the reveal timeline, shared by the <img> and <video> paths:
 * cells shrink geometrically from `startCell` to `handoffCell` during the
 * first 70% of `progress` (0..1, already eased), then the layer fades out over
 * the remaining 30% so the original media shows through.
 */
export function stylizedRevealFrame(progress, startCell, handoffCell) {
  const shrink = clamp(progress / SHRINK_PORTION, 0, 1);
  const fade = clamp((progress - SHRINK_PORTION) / (1 - SHRINK_PORTION), 0, 1);
  return {
    cell: startCell * Math.pow(handoffCell / startCell, shrink),
    layerOpacity: 1 - fade
  };
}

/**
 * Turn the raw option values a module read into renderer settings. Each
 * module reads its own options (the feature contract scans every module file
 * for the option names it owns) and hands the values over as `input`; this
 * function clamps them and builds the rasterizer config so both modules agree.
 * `budgets` lets each caller pick its frame budget: a still image only needs
 * frames while revealing, a video renders for its whole playback.
 */
export function resolveStylizedSettings(effect, input = {}, { lowTier = false, persistFps = 24, revealFps = 24, maxDpr = 2 } = {}) {
  if (!EFFECT_SET.has(effect)) return null;
  const persist = input.persist === true;
  const startCell = clamp(Number(input.cellSize ?? DEFAULT_CELL[effect]), 2, 64);
  const styleInput = {
    // The element the look belongs to, so `var(--token)` colours resolve
    // against the page's own design tokens (including a section-scoped theme).
    scope: input.scope,
    paperColor: input.paperColor,
    inkColor: input.inkColor,
    accentColor: input.accentColor,
    originalColors: input.originalColors === true,
    colorSteps: input.colorSteps,
    inverted: input.inverted === true,
    seed: input.seed,
    contrast: input.contrast,
    brightness: input.brightness,
    motion: input.motion,
    motionSpeed: input.motionSpeed,
    motionAmount: input.motionAmount,
    pointer: input.pointer,
    pointerRadius: input.pointerRadius,
    pointerStrength: input.pointerStrength,
    pointerCellSize: input.pointerCellSize
  };
  if (effect === 'dither') styleInput.type = input.ditherType;
  if (effect === 'ascii') { styleInput.chars = input.asciiChars; styleInput.font = input.asciiFont; }
  if (effect === 'halftone') { styleInput.shape = input.halftoneShape; styleInput.angle = input.halftoneAngle; }
  const styleConfig = resolveStyleConfig(effect, styleInput);
  // A look is "live" when it keeps changing on its own (motion) or has to
  // follow the pointer — a still image then needs the same continuous loop an
  // animated source gets, instead of a single paint.
  const live = styleConfig.motion !== 'none' || styleConfig.pointer !== 'none';
  // Low-tier devices cap the canvas frame rate regardless of the request.
  const requestedFps = input.renderFps ?? (persist ? persistFps : revealFps);
  return {
    persist,
    live,
    startCell,
    handoffCell: Math.min(startCell, HANDOFF_CELL[effect]),
    // How a reveal hands the picture back. `dissolve`/`wipe` keep the look at
    // its authored cell size and clear it cell by cell, so every frame is as
    // crisp as the finished effect; `shrink` walks the cell size down, which is
    // softer by nature and stays the default only for the deprecated aliases.
    transition: REVEAL_TRANSITIONS.includes(input.transition) ? input.transition : 'shrink',
    styleConfig,
    fps: clamp(Number(requestedFps), 4, lowTier ? 12 : 60),
    maxDpr: clamp(Number(input.maxDpr ?? maxDpr), 0.5, 4),
    ease: easingFunction(input.ease || 'cubic-out')
  };
}

/** The canvas overlay a stylizer draws into (`<prefix>-<effect>-layer` etc.). */
export function createStylizedCanvasLayer(wrapper, effect, prefix = 'kt-stylize') {
  const layer = createLayer(wrapper, `${prefix}-${effect}-layer ${prefix}-stylized-layer`, 3);
  const canvas = document.createElement('canvas');
  canvas.className = `${prefix}-${effect}-canvas ${prefix}-stylized-canvas`;
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
  layer.appendChild(canvas);
  return { layer, canvas };
}

/**
 * Still or animated <img>. `drawable()` returns what to paint each frame (the
 * live element keeps GIF/APNG/WebP moving; a preloaded Image is the fallback
 * while the element is not complete yet).
 *
 * Reveal: cells shrink, then the layer crossfades into the original and
 * `onFinish()` runs (the caller removes layers / exposes the picture).
 * Persist: paints once; animated sources keep re-rendering, still images
 * re-render on resize. A source the canvas cannot read back (cross-origin
 * without CORS) leaves the original visible and calls `onFinish()` for a
 * reveal or simply stays blank for persist.
 */
export function createImageStylizer({
  el, wrapper, effect, settings, prefix = 'kt-stylize',
  drawable = () => el, animatedSource = false,
  durationMs: duration = 1600, delayMs = 60, holdMs = 0,
  onProgress, onFinish, onRendered
}) {
  const { persist, live, startCell, handoffCell, transition, styleConfig, fps, maxDpr, ease } = settings;
  const { layer, canvas } = createStylizedCanvasLayer(wrapper, effect, prefix);
  const renderer = createStylizedRenderer(canvas, styleConfig, { maxDpr });
  const interval = 1000 / fps;
  const timers = new Set();
  // Only attach pointer listeners when a pointer behaviour was asked for.
  const pointer = styleConfig.pointer === 'none' ? null : trackPointer(wrapper);
  let rafId = null;
  let resizeObserver = null;
  let destroyed = false;
  let paused = false;
  let startTime = null;
  let pausedAt = null;
  let lastDraw = -Infinity;
  // Wall clock the living look runs on. It stops while paused so a resumed
  // effect continues from where it was rather than jumping ahead.
  let clock = 0;
  let clockAt = null;

  const later = (callback, delay) => {
    const timer = setTimeout(() => { timers.delete(timer); if (!destroyed) callback(); }, Math.max(0, Number(delay) || 0));
    timers.add(timer);
  };
  const advance = (time) => {
    if (clockAt != null && !paused) clock += time - clockAt;
    clockAt = time;
    return clock;
  };
  const paint = (cell, time = clock) => {
    const box = wrapper.getBoundingClientRect();
    renderer.sync(box.width, box.height);
    return renderer.render(drawable(), cell, { time, pointer: pointer?.state });
  };
  const stopFrames = () => {
    if (rafId != null) cancelAnimationFrame(rafId);
    rafId = null;
    resizeObserver?.disconnect();
    resizeObserver = null;
  };

  const runPersist = () => {
    const rendered = paint(startCell);
    onRendered?.(rendered);
    onProgress?.(1, el);
    // A living look (motion / pointer) animates a still image too, so it needs
    // the same continuous loop an animated source gets.
    if (rendered && (animatedSource || live)) {
      const frame = (time) => {
        const now = advance(time);
        if (destroyed) return;
        if (!paused && time - lastDraw >= interval) { paint(startCell, now); lastDraw = time; }
        rafId = requestAnimationFrame(frame);
      };
      rafId = requestAnimationFrame(frame);
    } else if (rendered && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => { if (!destroyed) paint(startCell); });
      resizeObserver.observe(wrapper);
    }
  };

  const runReveal = () => {
    const frame = (time) => {
      if (destroyed) return;
      if (paused) {
        if (pausedAt == null) pausedAt = time;
        clockAt = time;
        rafId = requestAnimationFrame(frame);
        return;
      }
      if (pausedAt != null && startTime != null) { startTime += time - pausedAt; pausedAt = null; }
      if (startTime == null) startTime = time;
      const now = advance(time);
      const raw = clamp((time - startTime) / duration, 0, 1);
      if (time - lastDraw >= interval || raw >= 1) {
        const eased = clamp(ease(raw), 0, 1);
        let rendered;
        if (transition === 'shrink') {
          const { cell, layerOpacity } = stylizedRevealFrame(eased, startCell, handoffCell);
          rendered = paint(cell, now);
          layer.style.opacity = String(layerOpacity);
        } else {
          // Crisp hand-off: the look stays at its authored cell size and is
          // cleared cell by cell, so no frame is a half-resolution blur.
          rendered = paint(startCell, now);
          if (rendered) renderer.mask(eased, transition, startCell);
        }
        if (!rendered && lastDraw === -Infinity) {
          // Unreadable source: skip the effect rather than hide the picture.
          rafId = null;
          onFinish?.();
          return;
        }
        onProgress?.(raw, el);
        lastDraw = time;
      }
      if (raw < 1) rafId = requestAnimationFrame(frame);
      else { rafId = null; later(() => onFinish?.(), holdMs); }
    };
    paint(startCell);
    later(() => { rafId = requestAnimationFrame(frame); }, delayMs);
  };

  return {
    layer,
    canvas,
    renderer,
    get persist() { return persist; },
    start() {
      if (destroyed) return;
      if (persist) runPersist();
      else runReveal();
    },
    pause() { paused = true; },
    resume() { paused = false; },
    /** Reset the reveal timeline and run again (persist re-paints). */
    replay() {
      if (destroyed) return;
      stopFrames();
      timers.forEach(clearTimeout);
      timers.clear();
      startTime = null;
      pausedAt = null;
      lastDraw = -Infinity;
      layer.style.opacity = '1';
      if (!layer.isConnected) wrapper.appendChild(layer);
      this.start();
    },
    destroy() {
      destroyed = true;
      stopFrames();
      timers.forEach(clearTimeout);
      timers.clear();
      pointer?.destroy();
      renderer.destroy();
      layer.remove();
    }
  };
}

/**
 * Playing <video>: every frame goes through the rasterizer while the video
 * plays. Reveal shrinks cells over `duration` from the first painted frame and
 * then hands the viewport to the raw video; persist keeps the look for the
 * whole playback. The caller decides when the video is ready (Lazy after its
 * lazy load, Stylize on `loadeddata`) and calls `start()`; `playing` events
 * are wired here so a paused/resumed video keeps rendering.
 */
export function createVideoStylizer({
  el, wrapper, effect, settings, prefix = 'kt-stylize',
  durationMs: duration = 1600, onProgress
}) {
  const { persist, startCell, handoffCell, transition, styleConfig, fps, maxDpr, ease } = settings;
  const { layer, canvas } = createStylizedCanvasLayer(wrapper, effect, prefix);
  const renderer = createStylizedRenderer(canvas, styleConfig, { maxDpr });
  const interval = 1000 / fps;
  const pointer = styleConfig.pointer === 'none' ? null : trackPointer(wrapper);
  let rafId = null;
  let destroyed = false;
  let paused = false;
  let revealStart = null;
  let revealed = persist;
  let lastDraw = -Infinity;
  let clock = 0;

  const paint = (cell, time = clock) => {
    if (el.readyState < 2) return false;
    const box = wrapper.getBoundingClientRect();
    renderer.sync(box.width, box.height);
    return renderer.render(el, cell, { time, pointer: pointer?.state });
  };
  const frame = (time) => {
    if (destroyed) return;
    rafId = requestAnimationFrame(frame);
    if (paused || el.paused || el.ended) return;
    if (time - lastDraw < interval) return;
    // The video's own playback is the clock, so the living look advances with
    // it and freezes when the video does.
    clock = el.currentTime * 1000;
    lastDraw = time;
    if (persist) { paint(startCell); return; }
    if (revealStart == null) revealStart = time;
    const raw = clamp((time - revealStart) / duration, 0, 1);
    const eased = clamp(ease(raw), 0, 1);
    let rendered;
    if (transition === 'shrink') {
      const { cell, layerOpacity } = stylizedRevealFrame(eased, startCell, handoffCell);
      rendered = paint(cell);
      layer.style.opacity = String(layerOpacity);
    } else {
      rendered = paint(startCell);
      if (rendered) renderer.mask(eased, transition, startCell);
    }
    if (!rendered || raw >= 1) {
      // Either the reveal finished or the frames cannot be read back: hand the
      // viewport to the raw video and stop rendering.
      revealed = true;
      layer.remove();
      cancelAnimationFrame(rafId);
      rafId = null;
      onProgress?.(1, el);
    } else {
      onProgress?.(raw, el);
    }
  };
  const start = () => {
    if (destroyed || rafId != null || (revealed && !persist)) return;
    rafId = requestAnimationFrame(frame);
  };
  el.addEventListener('playing', start);

  return {
    layer,
    canvas,
    renderer,
    get persist() { return persist; },
    start,
    pause() { paused = true; },
    resume() { paused = false; start(); },
    replay() {
      if (destroyed) return;
      revealStart = null;
      revealed = persist;
      lastDraw = -Infinity;
      layer.style.opacity = '1';
      if (!layer.isConnected) wrapper.appendChild(layer);
      start();
    },
    destroy() {
      destroyed = true;
      if (rafId != null) cancelAnimationFrame(rafId);
      rafId = null;
      el.removeEventListener('playing', start);
      pointer?.destroy();
      renderer.destroy();
      layer.remove();
    }
  };
}
