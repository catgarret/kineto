import { clamp, createProgressOutputs, selectAll } from '../utils.js';

// Reference-counted global scroll lock. Overlapping loaders used to each save
// and restore <html>/<body> overflow independently, so a second loader would
// snapshot the ALREADY-locked value and then write it back — freezing the page
// permanently. Here the original values are captured once on the first lock and
// restored only when the last holder releases; every holder releases exactly
// once. Only hideScrollbar:true instances ever participate.
let scrollLockCount = 0;
let scrollLockOriginal = null;
function acquireScrollLock() {
  if (typeof document === 'undefined') return;
  if (scrollLockCount === 0) {
    scrollLockOriginal = {
      body: document.body.style.overflow,
      root: document.documentElement.style.overflow,
      gutter: document.documentElement.style.scrollbarGutter,
      scroll: [window.scrollX, window.scrollY]
    };
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    // Release the reserved scrollbar-gutter too, or a `scrollbar-gutter:stable`
    // page keeps an empty strip on the right that the overlay can't cover.
    document.documentElement.style.scrollbarGutter = 'auto';
  }
  scrollLockCount += 1;
}
function releaseScrollLock() {
  if (typeof document === 'undefined' || scrollLockCount === 0) return;
  scrollLockCount -= 1;
  if (scrollLockCount === 0 && scrollLockOriginal) {
    document.body.style.overflow = scrollLockOriginal.body;
    document.documentElement.style.overflow = scrollLockOriginal.root;
    document.documentElement.style.scrollbarGutter = scrollLockOriginal.gutter;
    // Some browsers temporarily collapse the root scrollport when both html
    // and body become overflow:hidden. Preserve the position at which the
    // full-page loader opened instead of revealing the page from top:0.
    const root = document.scrollingElement || document.documentElement;
    [root.scrollLeft, root.scrollTop] = scrollLockOriginal.scroll;
    scrollLockOriginal = null;
  }
}

function createNode(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = String(text);
  return node;
}

function createProgressUI(el, type, opts) {
  // Bring-your-own visuals: `renderUI(el, opts)` may return { root?, render }
  // and completely replaces the built-in DOM. Built-in visuals are plain,
  // class-named elements (kt-loader-*) driven by --kt-loader-color, so they
  // can also be restyled with CSS alone.
  if (typeof opts.renderUI === 'function') {
    const custom = opts.renderUI(el, opts) || {};
    if (custom.root) el.appendChild(custom.root);
    return {
      root: custom.root || el,
      render: custom.render || (() => {}),
      setState: custom.setState || (() => {}),
      destroy: custom.destroy || (() => {})
    };
  }
  const color = opts.color || 'var(--kt-loader-color,currentColor)';
  const trackColor = opts.trackColor || 'rgba(127,127,127,.18)';
  const showPercent = opts.showPercent !== false;
  el.style.setProperty('--kt-loader-color', color);
  el.style.setProperty('--kt-loader-track-color', trackColor);
  el.style.setProperty('--kt-loader-radius', typeof opts.radius === 'number' ? `${opts.radius}px` : (opts.radius || '999px'));
  let valueEl = null;
  let progressEl = null;
  let root = null;

  if (type === 'slot') {
    root = createNode('div', 'kt-loader-ui kt-loader-counter');
    valueEl = createNode('span', 'kt-loader-value');
    valueEl.textContent = '0%';
    root.appendChild(valueEl);
  } else if (type === 'circular') {
    const size = Math.max(48, Number(opts.size ?? 132));
    const stroke = Math.max(1, Number(opts.stroke ?? 8));
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    root = createNode('div', 'kt-loader-ui kt-loader-circular');
    root.style.setProperty('--kt-loader-size', `${size}px`);
    root.style.setProperty('--kt-loader-stroke', `${stroke}px`);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    const track = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    track.classList.add('kt-loader-circular-track');
    const progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    progressCircle.classList.add('kt-loader-circular-progress');
    [track, progressCircle].forEach((circle) => {
      circle.setAttribute('cx', String(size / 2));
      circle.setAttribute('cy', String(size / 2));
      circle.setAttribute('r', String(radius));
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke-width', String(stroke));
    });
    progressCircle.setAttribute('stroke-linecap', opts.linecap || 'round');
    progressCircle.setAttribute('stroke-dasharray', String(circumference));
    progressCircle.setAttribute('stroke-dashoffset', String(circumference));
    svg.append(track, progressCircle);
    valueEl = createNode('span', 'kt-loader-value', '0%');
    valueEl.hidden = !showPercent;
    root.append(svg, valueEl);
    progressEl = progressCircle;
    progressEl.dataset.circumference = String(circumference);
  } else if (type === 'bar') {
    const width = opts.barWidth || 'min(68vw,420px)';
    const height = Math.max(2, Number(opts.barHeight ?? 5));
    root = createNode('div', 'kt-loader-ui kt-loader-bar');
    root.style.setProperty('--kt-loader-bar-width', typeof width === 'number' ? `${width}px` : width);
    root.style.setProperty('--kt-loader-bar-height', `${height}px`);
    if (opts.label) root.appendChild(createNode('span', 'kt-loader-label', opts.label));
    const track = createNode('span', 'kt-loader-bar-track');
    progressEl = createNode('span', 'kt-loader-bar-progress');
    track.appendChild(progressEl);
    valueEl = createNode('span', 'kt-loader-value', '0%');
    valueEl.hidden = !showPercent;
    root.append(track, valueEl);
  }
  // Optional page-fill: the overlay background fills with the accent color
  // like a giant progress bar (fill: 'up' | 'down' | 'left' | 'right').
  let fillEl = null;
  const fillDirection = opts.fill === true ? 'up' : opts.fill;
  if (['up', 'down', 'left', 'right'].includes(fillDirection)) {
    fillEl = document.createElement('div');
    fillEl.className = 'kt-loader-fill';
    fillEl.setAttribute('aria-hidden', 'true');
    const origin = { up: 'bottom', down: 'top', left: 'right', right: 'left' }[fillDirection];
    const axis = (fillDirection === 'left' || fillDirection === 'right') ? 'scaleX' : 'scaleY';
    fillEl.dataset.axis = axis;
    fillEl.style.cssText = `position:absolute;inset:0;background:${opts.fillColor || color};transform-origin:${origin === 'bottom' ? 'center bottom' : origin === 'top' ? 'center top' : origin === 'left' ? 'left center' : 'right center'};transform:${axis}(0);will-change:transform;`;
    el.insertBefore(fillEl, el.firstChild);
  }
  if (root) {
    root.setAttribute('aria-hidden', 'true');
    el.appendChild(root);
    // Keep the percentage readable over the fill: recolor and/or blend it.
    if (opts.labelColor) root.style.color = opts.labelColor;
    if (opts.labelBlend) root.style.mixBlendMode = String(opts.labelBlend);
  }
  const render = (value) => {
    const progress = clamp(Number(value) || 0, 0, 100);
    if (valueEl) valueEl.textContent = `${Math.round(progress)}%`;
    if (type === 'bar' && progressEl) progressEl.style.transform = `scaleX(${progress / 100})`;
    if (type === 'circular' && progressEl) {
      const circumference = Number(progressEl.dataset.circumference || 0);
      progressEl.style.strokeDashoffset = String(circumference * (1 - progress / 100));
    }
    if (fillEl) fillEl.style.transform = `${fillEl.dataset.axis}(${progress / 100})`;
  };
  const setState = (state) => {
    if (root) root.dataset.state = state;
  };
  return { root, fillEl, render, setState, destroy() {} };
}

// Page callbacks (onStart, onStateChange, onProgress, a renderUI's render …)
// run INSIDE the loader's own steps: create(), a frame, the exit timer. One that
// threw used to abort that step half-way — create() failed after taking the
// page's scroll lock (nobody could release it) with a frame loop and a `load`
// listener still attached, and a throw in the exit timer left `finished`
// pending forever. The error is reported and the loader carries on.
function callSafely(kineto, name, callback, ...args) {
  if (typeof callback !== 'function') return undefined;
  try {
    return callback(...args);
  } catch (error) {
    console.error(`[Kineto/loader] ${name} failed:`, error);
    try {
      kineto?.diagnostics?.emit?.({ code: kineto.diagnosticCodes.LIFECYCLE_FAILED, module: 'loader', phase: 'runtime', recoverable: true, cause: error, detail: name });
    } catch (_error) { /* diagnostics are best effort */ }
    return undefined;
  }
}

// source:'resources' — deciding whether a page resource has ALREADY loaded.
// Only <img> has a `complete` flag. <script> and <link> have no ready state at
// all (`readyState >= 2` was undefined >= 2, always false) and their `load`
// event has normally fired before the loader exists, so they waited forever.
// <video>/<audio> never fire `load` (their event is `loadeddata`), and a
// lazy image below the fold never loads while the loader locks scrolling.
const DEFAULT_RESOURCE_SELECTOR = 'img[src],img[data-src],video[src],source[src],link[rel="stylesheet"],script[src]';
// HTMLMediaElement.HAVE_CURRENT_DATA / NETWORK_NO_SOURCE (constants on the
// element's prototype, spelled out so the check also runs where they're missing).
const MEDIA_HAVE_CURRENT_DATA = 2;
const MEDIA_NETWORK_NO_SOURCE = 3;
// The longest the loader waits for resources that never report: a video the
// browser decides not to preload, or a load event that fired unseen. After
// this the loader completes instead of holding the page behind it for good.
const RESOURCE_TIMEOUT_MS = 10000;

const isMedia = (node) => node?.tagName === 'VIDEO' || node?.tagName === 'AUDIO';
const pageLoaded = () => document.readyState === 'complete';
// A finished request leaves a Resource Timing entry, even when its element's
// `load` event fired before anyone listened.
function wasFetched(url) {
  if (!url || typeof performance === 'undefined' || typeof performance.getEntriesByName !== 'function') return false;
  try { return performance.getEntriesByName(url, 'resource').length > 0; } catch (_error) { return false; }
}

function resourceLoaded(node) {
  // Nothing to listen to (not an element): nothing to wait for.
  if (typeof node?.addEventListener !== 'function') return true;
  if (node.tagName === 'IMG') return node.complete || node.loading === 'lazy';
  if (isMedia(node)) {
    return node.readyState >= MEDIA_HAVE_CURRENT_DATA || node.preload === 'none'
      || Boolean(node.error) || node.networkState === MEDIA_NETWORK_NO_SOURCE;
  }
  if (node.tagName === 'LINK') return Boolean(node.sheet) || pageLoaded() || wasFetched(node.href);
  if (node.tagName === 'SCRIPT') return pageLoaded() || wasFetched(node.src);
  return typeof node.readyState === 'number' && node.readyState >= 2;
}

// Listen for one resource to finish (or fail); returns the listener remover.
// `error` is captured because it does not bubble: a failing <source> reports
// on itself, not on its <video>.
function watchResource(node, onDone) {
  const loadEvent = isMedia(node) ? 'loadeddata' : 'load';
  const stop = () => {
    node.removeEventListener(loadEvent, done);
    node.removeEventListener('error', done, true);
  };
  const done = () => { stop(); onDone(); };
  node.addEventListener(loadEvent, done);
  node.addEventListener('error', done, true);
  return stop;
}

function collectPageResources(opts) {
  const found = Array.isArray(opts.resources) ? opts.resources : selectAll(opts.resourceSelector || DEFAULT_RESOURCE_SELECTOR);
  // A <source> loads through its <video>/<audio>, which is counted once in its
  // place; a <picture> source is already counted through its <img>.
  const resources = new Set();
  found.forEach((node) => {
    if (node?.tagName !== 'SOURCE') resources.add(node);
    else if (isMedia(node.parentElement)) resources.add(node.parentElement);
  });
  return [...resources];
}

export default {
  create(el, opts = {}, kineto = null) {
    const requestedType = opts.type || opts.preset || 'bar';
    const type = ['slot', 'circular', 'bar'].includes(requestedType) ? requestedType : 'bar';
    const source = opts.source || opts.progressSource || 'window';
    const minDuration = Math.max(0, Number(opts.minDuration ?? 0));
    const hideScrollbar = opts.hideScrollbar !== false;
    const original = {
      style: el.getAttribute('style'),
      class: el.getAttribute('class'),
      aria: el.getAttribute('aria-label'),
      role: el.getAttribute('role'),
      busy: el.getAttribute('aria-busy'),
      live: el.getAttribute('aria-live'),
      valueMin: el.getAttribute('aria-valuemin'),
      valueMax: el.getAttribute('aria-valuemax'),
      valueNow: el.getAttribute('aria-valuenow'),
      hidden: el.hidden
    };
    if (opts.className) el.classList.add(...String(opts.className).split(/\s+/).filter(Boolean));
    const progressUI = createProgressUI(el, type, opts);
    const progressOutputs = createProgressOutputs(el, {
      ...opts,
      progressOutput: opts.progressOutput,
      progressScope: opts.progressScope,
      progressTemplate: opts.progressTemplate
    });
    let progress = clamp(Number(opts.progress ?? opts.percent ?? 0), 0, 100);
    let displayed = progress;
    let completed = false;
    let destroyed = false;
    let paused = false;
    let rafId = null;
    let loadHandler = null;
    let revealPlayer = null;
    let performanceObserver = null;
    let state = 'idle';
    let outcome = 'completed';
    let finishResolve;
    let finishSettled = false;
    const finished = new Promise((resolve) => { finishResolve = resolve; });
    const cleanupFunctions = [];
    // Track every timeout so destroy() can cancel the minDuration wait, the
    // completeHold delay and the exit timer — none were cancellable before.
    const timeouts = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timeouts.delete(id); fn(); }, ms); timeouts.add(id); return id; };
    const startedAt = performance.now();

    // Scroll lock is opt-out (hideScrollbar:false). A false instance NEVER
    // touches <html>/<body> overflow in create, exit or destroy. `holdsLock`
    // guarantees this instance releases the shared lock exactly once.
    let holdsLock = false;
    const releaseLock = () => { if (holdsLock) { holdsLock = false; releaseScrollLock(); } };
    const acquireLock = () => {
      if (hideScrollbar && !holdsLock) {
        acquireScrollLock();
        holdsLock = true;
      }
    };
    const emit = (name, detail = {}) => {
      try {
        el.dispatchEvent(new CustomEvent(`kt-loader-${name}`, {
          bubbles: true,
          detail: { loader: el, state, progress: displayed, ...detail }
        }));
      } catch (_error) { /* older browser */ }
    };
    // Every page-supplied function goes through here (see callSafely).
    const call = (name, callback, ...args) => callSafely(kineto, name, callback, ...args);
    const setState = (next, detail = {}) => {
      if (state === next) return;
      const previous = state;
      state = next;
      el.dataset.ktLoaderState = next;
      call('renderUI setState', progressUI.setState, next);
      progressOutputs.update(displayed, next);
      call('onStateChange', opts.onStateChange, next, previous, el, detail);
      emit('statechange', { previous, ...detail });
    };
    const settle = (status, detail = {}) => {
      if (finishSettled) return;
      finishSettled = true;
      finishResolve?.({ status, progress: displayed, el, ...detail });
    };

    el.setAttribute('role', 'progressbar');
    el.setAttribute('aria-label', opts.ariaLabel || 'Loading');
    el.setAttribute('aria-live', opts.announce === false ? 'off' : 'polite');
    el.setAttribute('aria-busy', 'true');
    el.setAttribute('aria-valuemin', '0');
    el.setAttribute('aria-valuemax', '100');
    acquireLock();
    setState('running');
    call('onStart', opts.onStart, el);
    emit('start');

    const render = () => {
      call('renderUI render', progressUI.render, displayed);
      el.setAttribute('aria-valuenow', String(Math.round(displayed)));
      // Headless API: stream progress to CSS variables so a fully custom loader
      // can be built with `renderUI` OR pure CSS (no JS): --kt-loader-progress
      // is 0..1, --kt-loader-percent is 0..100. onProgress(value, el) also fires.
      el.style.setProperty('--kt-loader-progress', (displayed / 100).toFixed(4));
      el.style.setProperty('--kt-loader-percent', String(Math.round(displayed)));
      progressOutputs.update(displayed, state);
      call('onProgress', opts.onProgress, displayed, el);
      emit('progress', { value: displayed });
    };
    const animate = () => {
      rafId = null;
      if (destroyed) return;
      if (!paused) displayed += (progress - displayed) * clamp(Number(opts.smoothing ?? 0.16), 0.01, 1);
      if (Math.abs(displayed - progress) < 0.05) displayed = progress;
      render();
      // Keep ticking only while there is motion. Once displayed == progress the
      // loop stops; setProgress()/complete() call wake() to resume it. This is
      // what stops the rAF (and onProgress) from running forever after the
      // overlay is gone.
      if (!destroyed && displayed !== progress) rafId = requestAnimationFrame(animate);
    };
    const wake = () => { if (!destroyed && rafId == null && displayed !== progress) rafId = requestAnimationFrame(animate); };
    rafId = requestAnimationFrame(animate);

    // The end of every exit: hide the overlay, then report. The revealEffect
    // exit used to run its own shorter copy of this (under a name that shadowed
    // `settle`), so `finished` never resolved and onHide / kt-loader-complete /
    // kt-loader-hide never fired for it.
    const finishExit = () => {
      el.style.display = 'none';
      el.hidden = true;
      el.setAttribute('aria-busy', 'false');
      releaseLock();
      setState(outcome);
      call('onComplete', opts.onComplete, el);
      call('onHide', opts.onHide, el, outcome);
      emit('complete', { outcome });
      emit('hide', { reason: outcome });
      settle(outcome);
    };
    const exit = () => {
      if (destroyed) return;
      // The steady-state fill animation is done; stop its rAF so onProgress
      // can't keep firing behind the exit transition.
      if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; }
      const duration = Math.max(0, Number(opts.exitDuration ?? opts.duration ?? 0.45));
      const exitEffect = opts.exit || opts.transition || 'fade';
      // Both directional exits honor exitDirection, falling back to the fill
      // direction so the overlay leaves the way it filled.
      const directions = ['up', 'down', 'left', 'right'];
      const exitDirection = directions.includes(opts.exitDirection)
        ? opts.exitDirection
        : (directions.includes(opts.fill) ? opts.fill : 'up');
      // Release the scroll lock NOW, before the overlay wipes away — not after.
      // While <html> is overflow:hidden the page has no scrollport, so any
      // position:sticky element (e.g. the demo's side nav) collapses to its
      // in-flow position and looks "gone". The overlay still fully covers the
      // viewport at this point, so restoring early is invisible but means the
      // page revealed underneath already has a working sticky nav. A no-op for
      // hideScrollbar:false instances (they never held the lock).
      releaseLock();
      // `revealEffect` plays one of Page Reveal's covers ON THE LOADER ITSELF.
      // Spawning a second overlay on top was wrong: the loader you were looking
      // at just vanished and an unrelated cover animated over the page. Here the
      // loader IS the cover, so it is the thing that gets wiped away.
      if (opts.revealEffect && typeof el.animate === 'function') {
        const ease = 'cubic-bezier(.165,.84,.44,1)';
        const shift = { up: '0,-100%', down: '0,100%', left: '-100%,0', right: '100%,0' }[exitDirection] || '0,-100%';
        const insets = { up: '0 0 100% 0', down: '100% 0 0 0', left: '0 100% 0 0', right: '0 0 0 100%' };
        const frames = {
          flash: [{ transform: 'translate3d(0,0,0)' }, { transform: `translate3d(${shift},0)` }],
          wipe: [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: `inset(${insets[exitDirection]})` }],
          curtain: [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: `inset(${insets[exitDirection]})` }],
          iris: [{ clipPath: 'circle(150% at 50% 50%)' }, { clipPath: 'circle(0% at 50% 50%)' }],
          circle: [{ clipPath: 'circle(150% at 50% 50%)' }, { clipPath: 'circle(0% at 50% 50%)' }],
          split: [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 50% 0 50%)' }],
          blinds: [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: `inset(${insets[exitDirection]})` }],
          fade: [{ opacity: 1 }, { opacity: 0 }]
        };
        const keyframes = frames[opts.revealEffect] || frames.wipe;
        el.style.willChange = 'clip-path, transform, opacity';
        // Kept so destroy() can cancel it: with fill:'forwards' the finished
        // wipe keeps the element clipped away even after its style is restored.
        revealPlayer = el.animate(keyframes, {
          duration: Math.max(120, duration * 1000),
          easing: ease,
          fill: 'forwards'
        });
        // A destroy() mid-wipe cancels the player, whose `finished` then
        // rejects: nothing may be written to the restored element after that.
        const finishReveal = () => {
          if (destroyed) return;
          el.style.removeProperty('will-change');
          finishExit();
        };
        revealPlayer.finished.then(finishReveal, finishReveal);
        return;
      }
      if (exitEffect === 'wipe' || exitEffect === 'mask') {
        // The transition needs a concrete start state — from `none` the mask
        // would snap instead of sweeping.
        el.style.clipPath = 'inset(0 0 0 0)';
        el.style.webkitClipPath = 'inset(0 0 0 0)';
        void el.offsetWidth;
      }
      // -webkit-clip-path in the transition too, so iOS Safari sweeps the mask
      // instead of snapping to the end.
      el.style.transition = `opacity ${duration}s ease,transform ${duration}s cubic-bezier(.4,0,.2,1),clip-path ${duration}s cubic-bezier(.76,0,.24,1),-webkit-clip-path ${duration}s cubic-bezier(.76,0,.24,1)`;
      if (exitEffect === 'slide') {
        const slides = { up: '0,-100%', down: '0,100%', left: '-100%,0', right: '100%,0' };
        el.style.transform = `translate3d(${slides[exitDirection]},0)`;
      } else if (exitEffect === 'wipe' || exitEffect === 'mask') {
        const insets = { up: '0 0 100% 0', down: '100% 0 0 0', left: '0 100% 0 0', right: '0 0 0 100%' };
        el.style.clipPath = `inset(${insets[exitDirection]})`;
        el.style.webkitClipPath = `inset(${insets[exitDirection]})`;
      } else el.style.opacity = '0';
      later(finishExit, duration * 1000 + 20);
    };
    const complete = (status = 'completed') => {
      if (completed || destroyed) return;
      completed = true;
      outcome = status;
      setState('completing', { outcome });
      progress = 100;
      const wait = Math.max(0, minDuration - (performance.now() - startedAt));
      later(() => {
        progress = 100;
        displayed = 100;
        render();
        later(exit, Math.max(0, Number(opts.completeHold ?? 120)));
      }, wait);
    };
    const setProgress = (value) => {
      if (destroyed || completed) return;
      progress = clamp(Number(value) || 0, 0, 100);
      wake();
      if (progress >= 100) complete();
    };
    const show = () => {
      if (destroyed || completed) return false;
      el.hidden = false;
      el.style.display = '';
      el.style.opacity = '';
      el.style.transform = '';
      el.style.clipPath = '';
      el.style.webkitClipPath = '';
      el.setAttribute('aria-busy', 'true');
      acquireLock();
      setState(paused ? 'paused' : 'running');
      call('onShow', opts.onShow, el);
      emit('show');
      return true;
    };
    const hide = (reason = 'manual') => {
      if (destroyed) return false;
      el.style.display = 'none';
      el.hidden = true;
      el.setAttribute('aria-busy', 'false');
      releaseLock();
      setState('hidden', { reason });
      call('onHide', opts.onHide, el, reason);
      emit('hide', { reason });
      return true;
    };
    const cancel = (reason = 'cancelled') => {
      if (destroyed || completed) return false;
      completed = true;
      if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; }
      timeouts.forEach((id) => clearTimeout(id));
      timeouts.clear();
      el.style.display = 'none';
      el.hidden = true;
      el.setAttribute('aria-busy', 'false');
      releaseLock();
      setState('cancelled', { reason });
      call('onCancel', opts.onCancel, reason, el);
      call('onHide', opts.onHide, el, reason);
      emit('cancel', { reason });
      emit('hide', { reason });
      settle('cancelled', { reason });
      return true;
    };
    const fail = (error) => {
      if (destroyed || completed) return false;
      call('onError', opts.onError, error, el);
      setState('error', { error });
      emit('error', { error });
      if (opts.completeOnError !== false) complete('error');
      else {
        el.setAttribute('aria-busy', 'false');
        releaseLock();
        settle('error', { error });
      }
      return true;
    };

    const trackPromise = (promise) => {
      if (!promise?.then) return promise;
      setProgress(Math.max(progress, Number(opts.promiseStart ?? 8)));
      let fake = Number(opts.promiseStart ?? 8);
      const interval = setInterval(() => {
        fake += (Number(opts.promiseCeiling ?? 88) - fake) * 0.08;
        setProgress(fake);
      }, 120);
      cleanupFunctions.push(() => clearInterval(interval));
      return Promise.resolve(promise).then((value) => { clearInterval(interval); complete(); return value; }, (error) => { clearInterval(interval); fail(error); throw error; });
    };

    const trackFetch = async (input, init) => {
      const response = await fetch(input, init);
      const length = Number(response.headers.get('content-length'));
      if (!response.body || !Number.isFinite(length) || length <= 0) {
        setProgress(80);
        complete();
        return response;
      }
      let received = 0;
      const reader = response.body.getReader();
      const chunks = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.byteLength;
        setProgress(received / length * 100);
      }
      complete();
      const blob = new globalThis.Blob(chunks, { type: response.headers.get('content-type') || 'application/octet-stream' });
      return new globalThis.Response(blob, { status: response.status, statusText: response.statusText, headers: response.headers });
    };

    if (source === 'manual') {
      const manualDuration = Math.max(0, Number(opts.manualDuration ?? opts.duration ?? 0));
      if (manualDuration > 0) {
        const start = performance.now();
        const manualTick = (time) => {
          if (destroyed || completed) return;
          if (!paused) setProgress((time - start) / (manualDuration <= 30 ? manualDuration * 1000 : manualDuration) * 100);
          if (!completed) requestAnimationFrame(manualTick);
        };
        requestAnimationFrame(manualTick);
      }
    } else if (source === 'promise' && opts.promise) {
      // trackPromise() re-throws for the caller that awaits it; nobody awaits
      // this one, so without a handler a rejected `promise` option surfaced as
      // an unhandledrejection. The failure is already reported via fail().
      trackPromise(opts.promise)?.catch?.(() => {});
    } else if (source === 'fetch' && (opts.url || opts.fetch)) {
      trackFetch(opts.url || opts.fetch, opts.fetchOptions).catch((error) => { fail(error); });
    } else if (source === 'resources') {
      const resources = collectPageResources(opts);
      if (!resources.length) complete();
      else {
        let loadedCount = 0;
        const countLoaded = () => { loadedCount += 1; setProgress(loadedCount / resources.length * 100); };
        const waiting = new Map(); // resource → listener remover
        const stopWaiting = () => { waiting.forEach((stop) => stop()); waiting.clear(); };
        resources.forEach((resource) => {
          if (resourceLoaded(resource)) countLoaded();
          else waiting.set(resource, watchResource(resource, () => { waiting.delete(resource); countLoaded(); }));
        });
        cleanupFunctions.push(stopWaiting);
        if (waiting.size) later(() => { stopWaiting(); setProgress(100); }, RESOURCE_TIMEOUT_MS);
      }
    } else {
      const existing = performance.getEntriesByType?.('resource')?.length || 0;
      let observed = 0;
      if (typeof globalThis.PerformanceObserver !== 'undefined') {
        performanceObserver = new globalThis.PerformanceObserver((list) => {
          observed += list.getEntries().length;
          const expected = Math.max(Number(opts.expectedResources ?? existing + 12), existing + observed);
          setProgress(Math.min(92, (existing + observed) / expected * 100));
        });
        try { performanceObserver.observe({ type: 'resource', buffered: true }); } catch (_error) { /* unsupported */ }
      }
      if (document.readyState === 'complete') complete();
      else {
        // Not `loadHandler = complete`: the listener receives the load Event,
        // which then became the outcome (state "[object Event]", `finished`
        // resolving { status: Event }).
        loadHandler = () => complete();
        window.addEventListener('load', loadHandler, { once: true });
      }
    }
    render();

    const instance = {
      el,
      type: 'loader',
      get progress() { return displayed; },
      get state() { return state; },
      get finished() { return finished; },
      setProgress,
      complete,
      show,
      hide,
      cancel,
      fail,
      trackPromise,
      trackFetch,
      pause() {
        if (destroyed || completed) return;
        paused = true;
        el.classList.add('is-paused');
        setState('paused');
      },
      resume() {
        if (destroyed || completed) return;
        paused = false;
        el.classList.remove('is-paused');
        setState('running');
        wake();
      },
      destroy() {
        if (destroyed) return; // idempotent — safe to call repeatedly
        destroyed = true;
        setState('destroyed');
        timeouts.forEach((id) => clearTimeout(id));
        timeouts.clear();
        if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; }
        if (loadHandler) window.removeEventListener('load', loadHandler);
        // A forwards-filled reveal wipe would keep the restored element clipped.
        try { revealPlayer?.cancel(); } catch (_error) { /* already gone */ }
        revealPlayer = null;
        performanceObserver?.disconnect();
        cleanupFunctions.forEach((cleanup) => cleanup());
        // Release the shared scroll lock exactly once (no-op if exit already
        // released it, or if this instance never held it).
        releaseLock();
        // Only remove UI we created — never the host element itself (a custom
        // renderUI with no root falls back to `el`). Also remove the page-fill
        // overlay so it doesn't accumulate across recreate.
        progressUI.destroy?.();
        progressOutputs.destroy();
        if (progressUI.root && progressUI.root !== el) progressUI.root.remove();
        progressUI.fillEl?.remove();
        if (original.style == null) el.removeAttribute('style'); else el.setAttribute('style', original.style);
        if (original.aria == null) el.removeAttribute('aria-label'); else el.setAttribute('aria-label', original.aria);
        if (original.role == null) el.removeAttribute('role'); else el.setAttribute('role', original.role);
        if (original.class == null) el.removeAttribute('class'); else el.setAttribute('class', original.class);
        if (original.busy == null) el.removeAttribute('aria-busy'); else el.setAttribute('aria-busy', original.busy);
        if (original.live == null) el.removeAttribute('aria-live'); else el.setAttribute('aria-live', original.live);
        if (original.valueMin == null) el.removeAttribute('aria-valuemin'); else el.setAttribute('aria-valuemin', original.valueMin);
        if (original.valueMax == null) el.removeAttribute('aria-valuemax'); else el.setAttribute('aria-valuemax', original.valueMax);
        if (original.valueNow == null) el.removeAttribute('aria-valuenow'); else el.setAttribute('aria-valuenow', original.valueNow);
        el.hidden = original.hidden;
        delete el.dataset.ktLoaderState;
        settle('destroyed');
      }
    };
    return instance;
  },
  // Low-perf devices skip the loader entirely (same as reduced) so the page
  // isn't held behind an animation it can't render smoothly (audit D-2 / D-6).
  fallback(el, opts = {}, kineto = null) { return this.reduced(el, opts, kineto); },
  reduced(el, opts = {}, kineto = null) {
    const original = el.style.display;
    el.style.display = 'none';
    // Even when the loader is skipped, onComplete must still fire exactly once
    // (async) so callers gating page reveal / cleanup on it aren't left hanging.
    let done = false;
    let destroyed = false;
    let state = 'completing';
    let resolveFinished;
    const finished = new Promise((resolve) => { resolveFinished = resolve; });
    const id = setTimeout(() => {
      done = true;
      state = 'completed';
      callSafely(kineto, 'onComplete', opts.onComplete, el);
      callSafely(kineto, 'onStateChange', opts.onStateChange, 'completed', 'completing', el);
      resolveFinished?.({ status: 'completed', progress: 100, el });
    }, 0);
    return {
      el,
      type: 'loader',
      get progress() { return 100; },
      get state() { return state; },
      get finished() { return finished; },
      setProgress() {},
      complete() {},
      trackPromise(promise) { return promise; },
      trackFetch(input, init) { return fetch(input, init); },
      show() { return false; },
      hide() { return true; },
      cancel(reason = 'cancelled') {
        if (done || destroyed) return false;
        clearTimeout(id);
        done = true;
        state = 'cancelled';
        callSafely(kineto, 'onCancel', opts.onCancel, reason, el);
        resolveFinished?.({ status: 'cancelled', progress: 100, el, reason });
        return true;
      },
      fail(error) {
        if (done || destroyed) return false;
        clearTimeout(id);
        done = true;
        state = 'error';
        callSafely(kineto, 'onError', opts.onError, error, el);
        resolveFinished?.({ status: 'error', progress: 100, el, error });
        return true;
      },
      pause() {},
      resume() {},
      destroy() {
        if (destroyed) return;
        destroyed = true;
        if (!done) {
          clearTimeout(id);
          resolveFinished?.({ status: 'destroyed', progress: 100, el });
        }
        state = 'destroyed';
        el.style.display = original;
      }
    };
  }
};
