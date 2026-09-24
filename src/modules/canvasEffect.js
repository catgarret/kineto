// Canvas Effect — a host for creative canvas and WebGL effects.
//
// Kineto does not ship "background effects" of its own. It ships the part every
// such effect gets wrong when it is written from scratch — usually by an AI,
// once per effect — and lets the effect be only its drawing code:
//
//   • the canvas: inserted behind the element's content, sized to it, with the
//     pixel ratio capped (`maxDpr`) and re-sized when the element changes;
//   • the clock: one requestAnimationFrame loop with a frame-rate cap (`fps`),
//     time that pauses with the effect, and rest — frame() returns false and
//     the loop stops until pointer, scroll, a resize or an update wakes it;
//   • the inputs: pointer and scroll signals, sampled once per frame;
//   • the lifecycle: paused off screen and in hidden tabs by the core, one still
//     frame under reduced motion, quality tiers for weak devices, WebGL context
//     loss handled, and destroy() puts the element back exactly as it was;
//   • fragment shaders: `{ fragment: '…GLSL…' }` is a whole effect — the host
//     compiles it, draws it and binds the options as uniforms (shader.js).
//
// The effect itself is a definition registered with Kineto.defineCanvasEffect()
// (registry.js) and named in markup: <div data-kt-canvas-effect="my-effect">.
// Nothing here fetches anything or evaluates strings: markup can only NAME an
// effect the page's own scripts registered.
import { numberOption, snapshotInlineStyles } from '../utils.js';
import { defineCanvasEffect, listCanvasEffects, resolveCanvasEffect, waitForCanvasEffect } from './canvasEffect/registry.js';
import { QUALITY_TIERS, resolveQuality } from './canvasEffect/quality.js';
import { createPointerSignal, createScrollSignal } from './canvasEffect/signals.js';
import { createShaderRuntime } from './canvasEffect/shader.js';

const HOST_CLASS = 'kt-canvas-effect';
const CANVAS_CLASS = 'kt-canvas-effect__canvas';
const STATE_CLASSES = { still: 'is-still', unsupported: 'is-unsupported', failed: 'is-failed' };
// The longest step one frame may take: a long pause (a debugger, a stalled tab)
// must not fling an effect's simulation forward.
const MAX_DELTA = 1 / 15;

// ---- colours ---------------------------------------------------------------
// Colour strings are normalised by a 2D canvas (no layout, no style read):
// assigning to fillStyle and reading it back yields '#rrggbb' or 'rgba(…)'.
let colorProbe = null;
const SENTINEL = '#010203';
function parseCssColor(value) {
  if (typeof document === 'undefined') return null;
  colorProbe ||= document.createElement('canvas').getContext('2d');
  if (!colorProbe) return null;
  colorProbe.fillStyle = SENTINEL;
  colorProbe.fillStyle = value;
  const normalized = String(colorProbe.fillStyle);
  if (normalized === SENTINEL && value.trim().toLowerCase() !== SENTINEL) return null;
  if (normalized[0] === '#') {
    const n = parseInt(normalized.slice(1, 7), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1];
  }
  const parts = normalized.match(/[\d.]+/g);
  return parts && parts.length >= 3
    ? [parts[0] / 255, parts[1] / 255, parts[2] / 255, parts[3] == null ? 1 : Number(parts[3])]
    : null;
}

// ---- options ---------------------------------------------------------------
// The shared vocabulary. An effect may declare any option it likes, but these
// names mean the same thing in every effect, so markup, the demo's settings
// drawer and AI-written effects all speak one language:
//   color / color2   the main and the secondary colour
//   background       what the canvas is cleared to ('transparent' shows the host)
//   speed            how fast it moves (1 = the effect's natural pace)
//   density          how many things there are (cells, particles, bands…)
//   size             how big each thing is, in CSS px
//   strength         how strongly it reacts to the pointer (0 = not at all)
//   distortion       how far it bends or warps (0 = none)
function vocabulary(opts) {
  return {
    color: opts.color,
    color2: opts.color2,
    background: opts.background,
    speed: opts.speed,
    density: opts.density,
    size: opts.size,
    strength: opts.strength,
    distortion: opts.distortion
  };
}

// An effect receives ONLY the options its definition declares, each coerced to
// the type of its default — so a typo in markup falls back instead of flowing
// into drawing code, and other modules' data-kt-* options on the same element
// never reach it.
function effectOptions(defaults, given) {
  const options = {};
  Object.entries(defaults).forEach(([key, fallback]) => {
    const value = given[key];
    if (value === undefined || value === null || value === '') options[key] = fallback;
    else if (typeof fallback === 'number') options[key] = numberOption(value, fallback);
    else if (typeof fallback === 'boolean') options[key] = value === true || value === 'true' ? true : value === false || value === 'false' ? false : fallback;
    else if (typeof fallback === 'string') options[key] = String(value);
    else if (Array.isArray(fallback)) options[key] = Array.isArray(value) && value.length === fallback.length && value.every((item) => Number.isFinite(Number(item))) ? value.map(Number) : fallback;
    else options[key] = value;
  });
  return options;
}

// Setting a vocabulary option the effect does not read is almost always a typo
// or the wrong effect — say so once per effect and option, instead of silence.
const reportedUnread = new Set();
function warnUnread(label, definition, opts) {
  Object.entries(vocabulary(opts)).forEach(([key, value]) => {
    if (value === undefined || Object.prototype.hasOwnProperty.call(definition.options, key)) return;
    const id = `${label}:${key}`;
    if (reportedUnread.has(id)) return;
    reportedUnread.add(id);
    console.warn(`[Kineto/canvasEffect] "${label}" does not read "${key}" (it reads: ${Object.keys(definition.options).join(', ') || 'no options'}).`);
  });
}

function mount(el, opts, kineto, still) {
  const name = opts.effect ?? opts.preset;
  // Only a registered NAME is accepted here. data-kt-* values are parsed as
  // JSON, so an object in this slot may come from markup — and a definition
  // is code (a shader, at the least). Definitions arrive only through
  // Kineto.defineCanvasEffect(), from the page's own scripts.
  if (typeof name !== 'string') {
    if (name != null) console.warn('[Kineto/canvasEffect] `effect` must name an effect registered with Kineto.defineCanvasEffect(); definitions are not accepted as options.');
    return null;
  }
  const definition = resolveCanvasEffect(name);
  if (!definition) {
    // Not defined (yet): a definition script may load after Kineto scanned the
    // page. Kineto.defineCanvasEffect(name) starts this element then.
    waitForCanvasEffect(name, el, () => kineto.create('canvasEffect', el, opts));
    return null;
  }

  warnUnread(name, definition, opts);
  const quality = resolveQuality(opts.quality, { performance: kineto.performance, touch: Boolean(kineto.env?.touch) });
  const tier = QUALITY_TIERS[quality];
  const settings = {
    maxDpr: numberOption(opts.maxDpr, tier.maxDpr, 0.5, 4),
    fps: numberOption(opts.fps, tier.fps, 0, 240),
    pointer: ['host', 'window', 'none'].includes(opts.pointer) ? opts.pointer : 'host'
  };
  const ownCanvas = el.tagName === 'CANVAS';
  const canvas = ownCanvas ? el : document.createElement('canvas');
  const restoreStyles = snapshotInlineStyles(el, ['position', 'isolation']);
  const hadHostClass = el.classList.contains(HOST_CLASS);
  el.classList.add(HOST_CLASS);
  if (!ownCanvas) {
    // Keep the canvas behind the element's content without the page writing
    // any CSS: a positioned, isolated host (the canvas sits at z-index -1).
    // A page has only a few of these, so this one style read is cheap.
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.style.isolation = 'isolate';
    canvas.className = CANVAS_CLASS;
    canvas.setAttribute('aria-hidden', 'true');
    el.insertBefore(canvas, el.firstChild);
  }

  let alive = true;      // false while paused (by the page or by the core)
  let destroyed = false;
  let resting = true;    // no frame requested
  let failed = false;
  let lost = false;      // the WebGL context is gone until the browser restores it
  let rafId = null;
  let lastTime = null;
  let lastDrawn = 0;
  let ctx = null;
  let shader = null;
  let setupDone = false;
  const colors = new Map();

  const colorOf = (value) => {
    if (Array.isArray(value)) return value;
    const text = String(value ?? '').trim();
    if (!colors.has(text)) {
      // var(--token) is resolved against the element, once per value.
      const token = /^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\)$/.exec(text);
      const resolved = token ? (getComputedStyle(el).getPropertyValue(token[1]).trim() || token[2] || '') : text;
      colors.set(text, resolved ? parseCssColor(resolved) : null);
    }
    return colors.get(text);
  };

  const pointer = createPointerSignal({ el, target: settings.pointer, onInput: () => wake() });
  const scroll = createScrollSignal({ enabled: opts.scroll !== false, onInput: () => wake() });

  // The one object an effect is handed, every call. Effects may keep their
  // own data in `api.state` (setup()'s return value lands there too).
  const api = {
    el,
    canvas,
    context: definition.context,
    ctx: null,
    gl: null,
    options: effectOptions(definition.options, opts),
    state: undefined,
    width: 0,
    height: 0,
    dpr: 1,
    time: 0,
    delta: 0,
    frame: 0,
    pointer: pointer.view,
    scroll: scroll.view,
    quality,
    reducedMotion: still,
    color: colorOf,
    wake: () => wake()
  };

  const setState = (key, on) => el.classList.toggle(STATE_CLASSES[key], on);
  const report = (error) => {
    failed = true;
    stop();
    setState('failed', true);
    console.error(`[Kineto/canvasEffect] "${name}" stopped:`, error);
    try { opts.onError?.(error, el); } catch (_callbackError) { /* the page's handler must not break teardown */ }
  };

  const createContext = () => {
    const webgl = definition.context !== '2d';
    const attributes = webgl
      ? { alpha: true, antialias: false, depth: false, stencil: false, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: quality === 'high' ? 'default' : 'low-power' }
      : { alpha: true };
    const context = canvas.getContext(definition.context, attributes);
    if (!context) return false;
    ctx = context;
    api.ctx = context;
    api.gl = webgl ? context : null;
    if (definition.fragment) shader = createShaderRuntime(context, definition.fragment, colorOf);
    return true;
  };

  const runSetup = () => {
    if (!createContext()) {
      // No WebGL (or no canvas) here: the element keeps its own CSS background.
      setState('unsupported', true);
      return false;
    }
    api.state = definition.setup ? definition.setup(api) : undefined;
    setupDone = true;
    return true;
  };

  // Size the backing store to the element × the capped pixel ratio.
  const applySize = (width, height) => {
    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, settings.maxDpr);
    const pixelWidth = Math.max(1, Math.round(width * dpr));
    const pixelHeight = Math.max(1, Math.round(height * dpr));
    api.width = width;
    api.height = height;
    api.dpr = dpr;
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
    if (setupDone) definition.resize?.(api);
  };

  const draw = (time) => {
    const rect = el.getBoundingClientRect();
    const delta = lastTime == null ? 0 : Math.min(MAX_DELTA, Math.max(0, (time - lastTime) / 1000));
    lastTime = time;
    api.delta = still ? 0 : delta;
    api.time += api.delta;
    api.frame += 1;
    pointer.sample(rect, delta);
    scroll.sample(rect, delta);
    let result = definition.frame ? definition.frame(api) : undefined;
    if (shader) shader.draw(api, definition.uniforms ? definition.uniforms(api) : null);
    // A shader that animates with time never rests on its own.
    if (shader && !definition.frame) result = undefined;
    return result;
  };

  const tick = (time) => {
    rafId = null;
    if (!alive || destroyed || failed || lost) { resting = true; return; }
    // Frame-rate cap: skip display frames until enough time has passed.
    if (settings.fps > 0 && lastDrawn && time - lastDrawn < 1000 / settings.fps - 1) {
      rafId = requestAnimationFrame(tick);
      return;
    }
    lastDrawn = time;
    let result;
    try {
      result = draw(time);
    } catch (error) {
      report(error);
      return;
    }
    if (still || result === false) {
      resting = true;
      lastTime = null; // the next wake starts a fresh step instead of a huge one
      return;
    }
    rafId = requestAnimationFrame(tick);
  };

  function wake() {
    if (!alive || destroyed || failed || lost || !setupDone || !resting) return;
    resting = false;
    rafId = requestAnimationFrame(tick);
  }
  function stop() {
    if (rafId != null) cancelAnimationFrame(rafId);
    rafId = null;
    resting = true;
    lastTime = null;
  }

  // WebGL may lose its context (GPU reset, too many contexts). Asking to keep
  // it (preventDefault) lets the browser restore it; setup then runs again.
  const onLost = (event) => { event.preventDefault(); lost = true; stop(); };
  const onRestored = () => {
    lost = false;
    shader = null;
    try {
      runSetup();
      applySize(api.width, api.height);
      wake();
    } catch (error) {
      report(error);
    }
  };
  if (definition.context !== '2d') {
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);
  }

  // Start: measure the element (the first ResizeObserver report arrives after
  // layout, so it costs no extra layout), set up, draw.
  let resizeObserver = null;
  const start = (width, height) => {
    try {
      applySize(width, height);
      if (!setupDone && !runSetup()) return;
      definition.resize?.(api);
      setState('still', still);
      if (setupDone && still) {
        // Reduced motion: one frame, drawn now and again on every resize.
        draw(typeof performance !== 'undefined' ? performance.now() : 0);
        return;
      }
      wake();
    } catch (error) {
      report(error);
    }
  };
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      if (destroyed) return;
      // The canvas fills the PADDING box (it is absolutely positioned), so size
      // it from clientWidth/Height — the observer's contentRect leaves the
      // padding out. Read inside the observer callback, after layout.
      const box = { width: el.clientWidth, height: el.clientHeight };
      if (!setupDone && !failed) { start(box.width, box.height); return; }
      if (failed || !setupDone) return;
      if (box.width === Math.round(api.width) && box.height === Math.round(api.height)) return;
      try {
        applySize(box.width, box.height);
        if (still) draw(performance.now());
        else wake();
      } catch (error) {
        report(error);
      }
    });
    resizeObserver.observe(el);
  } else {
    start(el.clientWidth, el.clientHeight);
  }

  return {
    el,
    type: 'canvasEffect',
    get effect() { return name; },
    get quality() { return quality; },
    /** Draw again now (after changing api.state from outside, for example). */
    redraw() {
      if (still && setupDone) { try { draw(performance.now()); } catch (error) { report(error); } return; }
      wake();
    },
    pause() {
      alive = false;
      stop();
    },
    resume() {
      if (alive) return;
      alive = true;
      wake();
    },
    // Options change live; the effect's resize() runs again so layout derived
    // from them (a grid from `density`, say) follows. A different effect is a
    // different instance, so that is a recreate.
    update(patch, merged) {
      if ((patch.effect != null || patch.preset != null) && resolveCanvasEffect(merged.effect ?? merged.preset) !== definition) return false;
      api.options = effectOptions(definition.options, merged);
      colors.clear();
      if (!setupDone) return true;
      try {
        definition.resize?.(api);
        if (still) draw(performance.now());
        else wake();
      } catch (error) {
        report(error);
      }
      return true;
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      stop();
      resizeObserver?.disconnect();
      pointer.destroy();
      scroll.destroy();
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      try { if (setupDone) definition.destroy?.(api); } catch (error) { console.error('[Kineto/canvasEffect] destroy() failed:', error); }
      shader?.destroy();
      // Free the GPU memory now rather than whenever the canvas is collected.
      if (api.gl) api.gl.getExtension('WEBGL_lose_context')?.loseContext();
      if (!ownCanvas) canvas.remove();
      else if (ctx && definition.context === '2d') ctx.clearRect(0, 0, canvas.width, canvas.height);
      Object.values(STATE_CLASSES).forEach((cls) => el.classList.remove(cls));
      if (!hadHostClass) el.classList.remove(HOST_CLASS);
      restoreStyles();
    }
  };
}

const canvasEffect = {
  // Suspended by the core while the element is off screen (SYSTEM SUSPENSION
  // in src/core.js); `pauseOffscreen: false` keeps it drawing (a fixed page
  // background that is always in view does not need the observer at all).
  offscreen: (opts) => (opts.pauseOffscreen === false ? null : 'pause'),
  create(el, opts = {}, kineto) {
    return mount(el, opts, kineto, false);
  },
  // Reduced motion: one still frame (at time 0) instead of a loop, unless the
  // page explicitly asks the effect to keep moving (`reducedMotion: 'run'`).
  reduced(el, opts = {}, kineto) {
    return mount(el, opts, kineto, opts.reducedMotion !== 'run');
  },
  // Static helpers, also reachable from a modular import of this file.
  define: defineCanvasEffect,
  list: listCanvasEffects
};

export default canvasEffect;
