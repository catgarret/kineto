import { clamp } from '../utils.js';

function createProgressUI(el, type, opts) {
  // Bring-your-own visuals: `renderUI(el, opts)` may return { root?, render }
  // and completely replaces the built-in DOM. Built-in visuals are plain,
  // class-named elements (kt-loader-*) driven by --kt-loader-color, so they
  // can also be restyled with CSS alone.
  if (typeof opts.renderUI === 'function') {
    const custom = opts.renderUI(el, opts) || {};
    if (custom.root) el.appendChild(custom.root);
    return { root: custom.root || el, render: custom.render || (() => {}) };
  }
  const color = opts.color || 'var(--kt-loader-color,currentColor)';
  const trackColor = opts.trackColor || 'rgba(127,127,127,.18)';
  const showPercent = opts.showPercent !== false;
  let valueEl = null;
  let progressEl = null;
  let root = null;

  if (type === 'slot') {
    root = document.createElement('div');
    root.className = 'kt-loader-counter';
    root.style.cssText = 'position:absolute;inset:0;display:grid;place-items:center;font-size:clamp(2.5rem,8vw,5rem);font-weight:850;font-variant-numeric:tabular-nums;color:var(--kt-loader-color,currentColor);';
    valueEl = document.createElement('span');
    valueEl.textContent = '0%';
    root.appendChild(valueEl);
  } else if (type === 'circular') {
    const size = Math.max(48, Number(opts.size ?? 132));
    const stroke = Math.max(1, Number(opts.stroke ?? 8));
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    root = document.createElement('div');
    root.className = 'kt-loader-circular';
    root.style.cssText = `position:absolute;left:50%;top:50%;width:${size}px;height:${size}px;transform:translate(-50%,-50%);`;
    root.innerHTML = `<svg aria-hidden="true" viewBox="0 0 ${size} ${size}" style="display:block;width:100%;height:100%;transform:rotate(-90deg)"><circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="${trackColor}" stroke-width="${stroke}"></circle><circle class="kt-loader-circular-progress" cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}"></circle></svg><span class="kt-loader-value" style="position:absolute;inset:0;display:${showPercent ? 'grid' : 'none'};place-items:center;font-weight:800;font-variant-numeric:tabular-nums">0%</span>`;
    progressEl = root.querySelector('.kt-loader-circular-progress');
    valueEl = root.querySelector('.kt-loader-value');
    progressEl.dataset.circumference = String(circumference);
  } else if (type === 'bar') {
    const width = opts.barWidth || 'min(68vw,420px)';
    const height = Math.max(2, Number(opts.barHeight ?? 5));
    root = document.createElement('div');
    root.className = 'kt-loader-bar';
    root.style.cssText = `position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:${typeof width === 'number' ? `${width}px` : width};display:grid;gap:12px;`;
    const label = opts.label ? `<span class="kt-loader-label" style="font-size:.8rem;letter-spacing:.08em;text-transform:uppercase;opacity:.65">${String(opts.label)}</span>` : '';
    root.innerHTML = `${label}<span class="kt-loader-bar-track" style="display:block;position:relative;height:${height}px;border-radius:999px;overflow:hidden;background:${trackColor}"><span class="kt-loader-bar-progress" style="display:block;width:100%;height:100%;transform:scaleX(0);transform-origin:left;background:${color};border-radius:inherit"></span></span><span class="kt-loader-value" style="display:${showPercent ? 'block' : 'none'};text-align:right;font-variant-numeric:tabular-nums;font-weight:700">0%</span>`;
    progressEl = root.querySelector('.kt-loader-bar-progress');
    valueEl = root.querySelector('.kt-loader-value');
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
  return { root, render };
}

function collectPageResources(opts) {
  if (Array.isArray(opts.resources)) return opts.resources;
  const selector = opts.resourceSelector || 'img[src],img[data-src],video[src],source[src],link[rel="stylesheet"],script[src]';
  return Array.from(document.querySelectorAll(selector));
}

export default {
  create(el, opts = {}) {
    const type = opts.type || opts.preset || 'bar';
    const source = opts.source || opts.progressSource || 'window';
    const minDuration = Math.max(0, Number(opts.minDuration ?? 0));
    const hideScrollbar = opts.hideScrollbar !== false;
    const original = {
      style: el.getAttribute('style'),
      class: el.getAttribute('class'),
      bodyOverflow: document.body.style.overflow,
      rootOverflow: document.documentElement.style.overflow,
      aria: el.getAttribute('aria-label'),
      role: el.getAttribute('role')
    };
    if (opts.className) el.classList.add(...String(opts.className).split(/\s+/).filter(Boolean));
    const progressUI = createProgressUI(el, type, opts);
    let progress = clamp(Number(opts.progress ?? opts.percent ?? 0), 0, 100);
    let displayed = progress;
    let completed = false;
    let destroyed = false;
    let paused = false;
    let rafId = null;
    let timer = null;
    let loadHandler = null;
    let performanceObserver = null;
    const cleanupFunctions = [];
    const startedAt = performance.now();

    el.setAttribute('role', 'status');
    el.setAttribute('aria-label', opts.ariaLabel || 'Loading');
    // Lock scrolling while the loader runs. The body overflow alone is not
    // enough when <html> is the scroller (e.g. overflow-x:clip blocks the
    // body→viewport propagation), so lock the root too.
    if (hideScrollbar) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }

    const render = () => {
      progressUI.render(displayed);
      el.setAttribute('aria-valuenow', String(Math.round(displayed)));
      opts.onProgress?.(displayed, el);
    };
    const animate = () => {
      if (destroyed) return;
      if (!paused) displayed += (progress - displayed) * clamp(Number(opts.smoothing ?? 0.16), 0.01, 1);
      if (Math.abs(displayed - progress) < 0.05) displayed = progress;
      render();
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    const exit = () => {
      if (destroyed) return;
      const duration = Math.max(0, Number(opts.exitDuration ?? opts.duration ?? 0.45));
      const exitEffect = opts.exit || opts.transition || 'fade';
      // Both directional exits honor exitDirection, falling back to the fill
      // direction so the overlay leaves the way it filled.
      const directions = ['up', 'down', 'left', 'right'];
      const exitDirection = directions.includes(opts.exitDirection)
        ? opts.exitDirection
        : (directions.includes(opts.fill) ? opts.fill : 'up');
      if (exitEffect === 'wipe' || exitEffect === 'mask') {
        // The transition needs a concrete start state — from `none` the mask
        // would snap instead of sweeping.
        el.style.clipPath = 'inset(0 0 0 0)';
        void el.offsetWidth;
      }
      el.style.transition = `opacity ${duration}s ease,transform ${duration}s cubic-bezier(.4,0,.2,1),clip-path ${duration}s cubic-bezier(.76,0,.24,1)`;
      if (exitEffect === 'slide') {
        const slides = { up: '0,-100%', down: '0,100%', left: '-100%,0', right: '100%,0' };
        el.style.transform = `translate3d(${slides[exitDirection]},0)`;
      } else if (exitEffect === 'wipe' || exitEffect === 'mask') {
        const insets = { up: '0 0 100% 0', down: '100% 0 0 0', left: '0 100% 0 0', right: '0 0 0 100%' };
        el.style.clipPath = `inset(${insets[exitDirection]})`;
      } else el.style.opacity = '0';
      timer = setTimeout(() => {
        el.style.display = 'none';
        document.body.style.overflow = original.bodyOverflow;
        document.documentElement.style.overflow = original.rootOverflow;
        opts.onComplete?.(el);
      }, duration * 1000 + 20);
    };
    const complete = () => {
      if (completed || destroyed) return;
      completed = true;
      progress = 100;
      const wait = Math.max(0, minDuration - (performance.now() - startedAt));
      setTimeout(() => {
        progress = 100;
        displayed = 100;
        render();
        setTimeout(exit, Math.max(0, Number(opts.completeHold ?? 120)));
      }, wait);
    };
    const setProgress = (value) => {
      if (destroyed || completed) return;
      progress = clamp(Number(value) || 0, 0, 100);
      if (progress >= 100) complete();
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
      return Promise.resolve(promise).then((value) => { clearInterval(interval); complete(); return value; }, (error) => { clearInterval(interval); opts.onError?.(error, el); if (opts.completeOnError !== false) complete(); throw error; });
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
      trackFetch(opts.url || opts.fetch, opts.fetchOptions).catch((error) => { opts.onError?.(error, el); if (opts.completeOnError !== false) complete(); });
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

    return {
      el,
      type: 'loader',
      get progress() { return displayed; },
      setProgress,
      complete,
      trackPromise,
      trackFetch,
      pause() { paused = true; },
      resume() { paused = false; },
      destroy() {
        destroyed = true;
        clearTimeout(timer);
        if (rafId != null) cancelAnimationFrame(rafId);
        if (loadHandler) window.removeEventListener('load', loadHandler);
        performanceObserver?.disconnect();
        cleanupFunctions.forEach((cleanup) => cleanup());
        progressUI.root?.remove();
        document.body.style.overflow = original.bodyOverflow;
        document.documentElement.style.overflow = original.rootOverflow;
        if (original.style == null) el.removeAttribute('style'); else el.setAttribute('style', original.style);
        if (original.aria == null) el.removeAttribute('aria-label'); else el.setAttribute('aria-label', original.aria);
        if (original.role == null) el.removeAttribute('role'); else el.setAttribute('role', original.role);
        if (original.class == null) el.removeAttribute('class'); else el.setAttribute('class', original.class);
        el.removeAttribute('aria-valuenow');
      }
    };
  },
  reduced(el) {
    const original = el.style.display;
    el.style.display = 'none';
    return { el, type: 'loader', pause() {}, resume() {}, destroy() { el.style.display = original; } };
  }
};
