import { clamp } from '../utils.js';

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
      gutter: document.documentElement.style.scrollbarGutter
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

function collectPageResources(opts) {
  if (Array.isArray(opts.resources)) return opts.resources;
  const selector = opts.resourceSelector || 'img[src],img[data-src],video[src],source[src],link[rel="stylesheet"],script[src]';
  return Array.from(document.querySelectorAll(selector));
}

export default {
  create(el, opts = {}) {
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
    let progress = clamp(Number(opts.progress ?? opts.percent ?? 0), 0, 100);
    let displayed = progress;
    let completed = false;
    let destroyed = false;
    let paused = false;
    let rafId = null;
    let loadHandler = null;
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
    const setState = (next, detail = {}) => {
      if (state === next) return;
      const previous = state;
      state = next;
      el.dataset.ktLoaderState = next;
      progressUI.setState?.(next);
      opts.onStateChange?.(next, previous, el, detail);
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
    opts.onStart?.(el);
    emit('start');

    const render = () => {
      progressUI.render(displayed);
      el.setAttribute('aria-valuenow', String(Math.round(displayed)));
      // Headless API: stream progress to CSS variables so a fully custom loader
      // can be built with `renderUI` OR pure CSS (no JS): --kt-loader-progress
      // is 0..1, --kt-loader-percent is 0..100. onProgress(value, el) also fires.
      el.style.setProperty('--kt-loader-progress', (displayed / 100).toFixed(4));
      el.style.setProperty('--kt-loader-percent', String(Math.round(displayed)));
      opts.onProgress?.(displayed, el);
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
      later(() => {
        el.style.display = 'none';
        el.hidden = true;
        el.setAttribute('aria-busy', 'false');
        releaseLock();
        setState(outcome);
        opts.onComplete?.(el);
        opts.onHide?.(el, outcome);
        emit('complete', { outcome });
        emit('hide', { reason: outcome });
        settle(outcome);
      }, duration * 1000 + 20);
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
      opts.onShow?.(el);
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
      opts.onHide?.(el, reason);
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
      opts.onCancel?.(reason, el);
      opts.onHide?.(el, reason);
      emit('cancel', { reason });
      emit('hide', { reason });
      settle('cancelled', { reason });
      return true;
    };
    const fail = (error) => {
      if (destroyed || completed) return false;
      opts.onError?.(error, el);
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
      trackPromise(opts.promise);
    } else if (source === 'fetch' && (opts.url || opts.fetch)) {
      trackFetch(opts.url || opts.fetch, opts.fetchOptions).catch((error) => { fail(error); });
    } else if (source === 'resources') {
      const resources = collectPageResources(opts);
      if (!resources.length) complete();
      else {
        let finished = 0;
        const update = () => { finished += 1; setProgress(finished / resources.length * 100); };
        resources.forEach((resource) => {
          const ready = resource.tagName === 'IMG' ? resource.complete : resource.readyState >= 2;
          if (ready) update();
          else {
            resource.addEventListener('load', update, { once: true });
            resource.addEventListener('error', update, { once: true });
            cleanupFunctions.push(() => { resource.removeEventListener('load', update); resource.removeEventListener('error', update); });
          }
        });
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
        loadHandler = complete;
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
        performanceObserver?.disconnect();
        cleanupFunctions.forEach((cleanup) => cleanup());
        // Release the shared scroll lock exactly once (no-op if exit already
        // released it, or if this instance never held it).
        releaseLock();
        // Only remove UI we created — never the host element itself (a custom
        // renderUI with no root falls back to `el`). Also remove the page-fill
        // overlay so it doesn't accumulate across recreate.
        progressUI.destroy?.();
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
  fallback(el, opts = {}) { return this.reduced(el, opts); },
  reduced(el, opts = {}) {
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
      opts.onComplete?.(el);
      opts.onStateChange?.('completed', 'completing', el);
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
        opts.onCancel?.(reason, el);
        resolveFinished?.({ status: 'cancelled', progress: 100, el, reason });
        return true;
      },
      fail(error) {
        if (done || destroyed) return false;
        clearTimeout(id);
        done = true;
        state = 'error';
        opts.onError?.(error, el);
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
