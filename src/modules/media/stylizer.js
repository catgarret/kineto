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
import { LIVE_LOOK_KEYS, createStylizedRenderer, resolveLiveLook, resolveStyleConfig } from './rasterizer.js';

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

/**
 * Change the living look (motion / pointer) of an effect that already exists,
 * keeping `settings` and the running stylizer in step.
 *
 * `stylizer` may be null — an effect whose trigger has not fired yet has no
 * renderer, and the new look is resolved into the settings so it is already in
 * place when the effect finally runs.
 */
export { LIVE_LOOK_KEYS };

export function updateLiveLook(settings, patch = {}, stylizer = null) {
  // A running stylizer's renderer holds `settings.styleConfig` itself, so
  // configuring it updates both at once; without one we resolve in place.
  if (stylizer) stylizer.setLiveLook(patch);
  else Object.assign(settings.styleConfig, resolveLiveLook({ ...settings.styleConfig, ...patch }));
  settings.live = settings.styleConfig.motion !== 'none' || settings.styleConfig.pointer !== 'none';
  return settings.live;
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
  const { persist, startCell, handoffCell, transition, styleConfig, fps, maxDpr, ease } = settings;
  const { layer, canvas } = createStylizedCanvasLayer(wrapper, effect, prefix);
  const renderer = createStylizedRenderer(canvas, styleConfig, { maxDpr });
  const interval = 1000 / fps;
  // "Live" = the look keeps changing on its own. Not a const: setLiveLook()
  // can switch the motion on or off while the effect is running.
  let live = settings.live;
  // Pointer listeners are attached only once a pointer behaviour is actually
  // asked for — at creation, or later through setLiveLook().
  let pointer = styleConfig.pointer === 'none' ? null : trackPointer(wrapper);
  const syncPointer = () => {
    if (styleConfig.pointer === 'none') { pointer?.destroy(); pointer = null; }
    else if (!pointer) pointer = trackPointer(wrapper);
  };
  let rafId = null;
  let resizeObserver = null;
  let destroyed = false;
  let paused = false;
  let started = false;
  let startPending = true;
  let generation = 0;
  let frameTask = null;
  let waiting = null;
  let resizePending = false;
  let startTime = null;
  let lastDraw = -Infinity;
  // Wall clock the living look runs on. It stops while paused so a resumed
  // effect continues from where it was rather than jumping ahead.
  let clock = 0;
  let clockAt = null;

  const active = () => started && !destroyed && !paused && !document.hidden;
  const requestFrame = () => {
    if (!active() || !frameTask || rafId != null) return;
    rafId = requestAnimationFrame(time => {
      rafId = null;
      if (active()) frameTask?.(time);
    });
  };
  const armTimer = () => {
    if (!active() || !waiting || waiting.id != null) return;
    const task = waiting;
    task.at = performance.now();
    task.id = setTimeout(() => {
      task.id = null;
      task.remaining = 0;
      if (!active() || waiting !== task) return;
      waiting = null;
      task.callback();
    }, task.remaining);
  };
  const later = (callback, delay) => {
    waiting = { callback, remaining: Math.max(0, Number(delay) || 0), id: null, at: 0 };
    armTimer();
  };
  const advance = (time) => {
    if (clockAt != null) clock += time - clockAt;
    clockAt = time;
    return clock;
  };
  const paint = (cell, time = clock) => {
    const box = wrapper.getBoundingClientRect();
    renderer.sync(box.width, box.height);
    return renderer.render(drawable(), cell, { time, pointer: pointer?.state });
  };
  const suspend = () => {
    if (rafId != null) cancelAnimationFrame(rafId);
    rafId = null;
    clockAt = null;
    if (waiting?.id != null) {
      clearTimeout(waiting.id);
      waiting.remaining = Math.max(0, waiting.remaining - (performance.now() - waiting.at));
      waiting.id = null;
    }
  };
  const stopFrames = () => {
    suspend();
    waiting = null;
    frameTask = null;
    resizeObserver?.disconnect();
    resizeObserver = null;
    resizePending = false;
  };

  const runPersist = () => {
    const run = generation;
    const rendered = paint(startCell);
    onRendered?.(rendered);
    if (destroyed || run !== generation) return;
    onProgress?.(1, el);
    if (destroyed || run !== generation) return;
    // A living look (motion / pointer) animates a still image too, so it needs
    // the same continuous loop an animated source gets.
    if (rendered) syncPersistLoop();
  };

  // Persist has two resting states, and which one it is in depends only on
  // whether frames keep coming. This switches between them, so turning the
  // motion on or off later lands in exactly the same state as starting there.
  const persistLoop = (time) => {
    const now = advance(time);
    if (time - lastDraw >= interval) { paint(startCell, now); lastDraw = time; }
    requestFrame();
  };
  const watchResize = () => {
    if (resizeObserver || typeof ResizeObserver === 'undefined') return;
    resizeObserver = new ResizeObserver(() => {
      if (destroyed) return;
      if (active()) paint(startCell);
      else resizePending = true;
    });
    resizeObserver.observe(wrapper);
  };
  function syncPersistLoop() {
    if (animatedSource || live) {
      // Moving: one continuous loop, and no resize watcher — every frame
      // already re-measures the box.
      resizeObserver?.disconnect();
      resizeObserver = null;
      if (!frameTask) { frameTask = persistLoop; requestFrame(); }
      return;
    }
    // Still: stop the loop, leave the last frame on screen, and go back to
    // repainting only when the box changes size.
    if (frameTask === persistLoop) { suspend(); frameTask = null; }
    watchResize();
  }

  const runReveal = () => {
    const frame = (time) => {
      const run = generation;
      const now = advance(time);
      if (startTime == null) startTime = now;
      const raw = clamp((now - startTime) / duration, 0, 1);
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
          frameTask = null;
          onFinish?.();
          return;
        }
        onProgress?.(raw, el);
        if (destroyed || run !== generation) return;
        lastDraw = time;
      }
      if (raw < 1) requestFrame();
      else { frameTask = null; later(() => onFinish?.(), holdMs); }
    };
    paint(startCell);
    later(() => { frameTask = frame; requestFrame(); }, delayMs);
  };
  const wake = () => {
    if (!active()) return;
    if (startPending) {
      startPending = false;
      if (persist) runPersist();
      else runReveal();
    }
    if (resizePending) { resizePending = false; paint(startCell); }
    armTimer();
    requestFrame();
  };
  const visibility = () => { if (document.hidden) suspend(); else wake(); };
  document.addEventListener('visibilitychange', visibility);

  return {
    layer,
    canvas,
    renderer,
    get persist() { return persist; },
    /**
     * Start or stop the living look on a running effect — no teardown, so the
     * picture never blinks. `patch` holds any of the rasterizer's
     * LIVE_LOOK_KEYS (motion, motionSpeed, motionAmount, pointer…).
     *
     * A still picture that starts moving gets the continuous loop; one that
     * stops keeps the frame it was on, exactly as if it had been created that
     * way. An animated source keeps its loop either way.
     */
    setLiveLook(patch = {}) {
      if (destroyed) return;
      renderer.configure(patch);
      live = renderer.live;
      syncPointer();
      // Only `persist` has a loop that depends on this; a reveal is running its
      // own timeline and simply draws the new look from its next frame on.
      if (persist && started) syncPersistLoop();
      // Stopped and idle: repaint once so the change shows immediately instead
      // of waiting for the next resize.
      if (persist && started && !frameTask && active()) paint(startCell);
    },
    start() {
      if (destroyed || started) return;
      started = true;
      wake();
    },
    pause() { paused = true; suspend(); },
    resume() { paused = false; wake(); },
    /** Reset the reveal timeline and run again (persist re-paints). */
    replay() {
      if (destroyed) return;
      stopFrames();
      generation++;
      started = false;
      startPending = true;
      startTime = null;
      lastDraw = -Infinity;
      layer.style.opacity = '1';
      if (!layer.isConnected) wrapper.appendChild(layer);
      this.start();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      stopFrames();
      document.removeEventListener('visibilitychange', visibility);
      pointer?.destroy();
      renderer.destroy();
      layer.remove();
    }
  };
}

/**
 * Video frames share the rasterizer with images. The caller activates start()
 * after loading/trigger selection; playback events only resume an active run.
 * Reveal delay/duration/hold advance on visible, unpaused playback time.
 * Persist keeps rendering until paused or destroyed.
 */
export function createVideoStylizer({
  el, wrapper, effect, settings, prefix = 'kt-stylize',
  durationMs: duration = 1600, delayMs = 0, holdMs = 0, onProgress, onFinish
}) {
  const { persist, startCell, handoffCell, transition, styleConfig, fps, maxDpr, ease } = settings;
  const { layer, canvas } = createStylizedCanvasLayer(wrapper, effect, prefix);
  const renderer = createStylizedRenderer(canvas, styleConfig, { maxDpr });
  const interval = 1000 / fps;
  // Attached only once a pointer behaviour is asked for — see setLiveLook().
  let pointer = styleConfig.pointer === 'none' ? null : trackPointer(wrapper);
  let rafId = null;
  let destroyed = false;
  let paused = false;
  let started = false;
  let revealed = false;
  let elapsed = 0;
  let tickAt = null;
  let generation = 0;
  let lastDraw = -Infinity;
  let clock = 0;

  const paint = (cell, time = clock) => {
    if (el.readyState < 2) return false;
    const box = wrapper.getBoundingClientRect();
    renderer.sync(box.width, box.height);
    return renderer.render(el, cell, { time, pointer: pointer?.state });
  };
  const runnable = () => started && !destroyed && !paused && !document.hidden && !el.paused && !el.ended && !revealed && el.readyState >= 2;
  const stop = () => {
    if (rafId != null) cancelAnimationFrame(rafId);
    rafId = null;
    // Count only active frame intervals, never the time spent suspended.
    tickAt = null;
  };
  const schedule = () => {
    if (runnable() && rafId == null) rafId = requestAnimationFrame(frame);
  };
  const finish = () => {
    revealed = true;
    stop();
    layer.remove();
    onFinish?.();
  };
  const frame = (time) => {
    rafId = null;
    if (!runnable()) { tickAt = null; return; }
    if (tickAt != null) elapsed += time - tickAt;
    tickAt = time;
    if (time - lastDraw < interval) { schedule(); return; }
    // The video's own playback is the clock, so the living look advances with
    // it and freezes when the video does.
    clock = el.currentTime * 1000;
    lastDraw = time;
    if (persist) { paint(startCell); schedule(); return; }
    const run = generation;
    const raw = clamp((elapsed - delayMs) / duration, 0, 1);
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
    onProgress?.(rendered ? raw : 1, el);
    if (destroyed || run !== generation) return;
    if (!rendered || elapsed >= delayMs + duration + holdMs) finish();
    else schedule();
  };
  const start = () => {
    if (destroyed || revealed) return;
    started = true;
    schedule();
  };
  const visibility = () => { if (document.hidden) stop(); else schedule(); };
  const stopEvents = ['pause', 'ended', 'waiting'];
  el.addEventListener('playing', schedule);
  stopEvents.forEach(event => el.addEventListener(event, stop));
  document.addEventListener('visibilitychange', visibility);

  return {
    layer,
    canvas,
    renderer,
    get persist() { return persist; },
    /**
     * Same contract as the image stylizer's: swap the living look in place.
     * A video redraws every playing frame anyway, so there is no loop to
     * start or stop — only the settings and the pointer listeners change.
     */
    setLiveLook(patch = {}) {
      if (destroyed) return;
      renderer.configure(patch);
      if (styleConfig.pointer === 'none') { pointer?.destroy(); pointer = null; }
      else if (!pointer) pointer = trackPointer(wrapper);
      // A paused or ended video is not redrawing, so repaint the new look once.
      if (started && !runnable()) paint(startCell);
    },
    start,
    pause() { paused = true; stop(); },
    resume() { paused = false; schedule(); },
    replay() {
      if (destroyed) return;
      stop();
      generation++;
      elapsed = 0;
      revealed = false;
      lastDraw = -Infinity;
      layer.style.opacity = '1';
      if (!layer.isConnected) wrapper.appendChild(layer);
      start();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      stop();
      el.removeEventListener('playing', schedule);
      stopEvents.forEach(event => el.removeEventListener(event, stop));
      document.removeEventListener('visibilitychange', visibility);
      pointer?.destroy();
      renderer.destroy();
      layer.remove();
    }
  };
}
