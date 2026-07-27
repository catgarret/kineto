import { clamp } from '../utils.js';

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text != null) element.textContent = String(text);
  return element;
}

function variant(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function buildIndicator(host, type, opts) {
  if (typeof opts.renderUI === 'function') {
    const custom = opts.renderUI(host, opts) || {};
    if (custom.root) host.appendChild(custom.root);
    return {
      root: custom.root || host,
      render: custom.render || (() => {}),
      setState: custom.setState || (() => {}),
      destroy: custom.destroy || (() => {})
    };
  }

  const root = node('span', `kt-loading kt-loading--${type}`);
  let progressNode = null;
  let meterNode = null;

  if (type === 'spinner') {
    const style = variant(opts.spinnerStyle, ['ring', 'comet', 'dual', 'spokes', 'orbit'], 'comet');
    root.classList.add(`kt-loading-spinner--${style}`);
    if (style === 'spokes') {
      const count = Math.round(clamp(Number(opts.dotCount ?? 12), 6, 16));
      for (let index = 0; index < count; index += 1) {
        const spoke = node('i', 'kt-loading-spinner__spoke');
        spoke.style.setProperty('--kt-loading-index', String(index));
        spoke.style.setProperty('--kt-loading-count', String(count));
        spoke.style.animationDelay = `${-(Number(opts.motionDuration ?? 1.1) / count) * index}s`;
        root.appendChild(spoke);
      }
    } else {
      root.appendChild(node('i', 'kt-loading-spinner__ring'));
      if (style === 'dual') root.appendChild(node('i', 'kt-loading-spinner__ring kt-loading-spinner__ring--inner'));
      if (style === 'orbit') root.appendChild(node('i', 'kt-loading-spinner__orbit'));
    }
  } else if (type === 'dots') {
    const style = variant(opts.dotStyle, ['pulse', 'bounce', 'wave'], 'wave');
    root.classList.add(`kt-loading-dots--${style}`);
    const count = Math.round(clamp(Number(opts.dotCount ?? 3), 3, 8));
    for (let index = 0; index < count; index += 1) {
      const dot = node('i', 'kt-loading-dot');
      dot.style.setProperty('--kt-loading-index', String(index));
      dot.style.animationDelay = `${index * 110}ms`;
      root.appendChild(dot);
    }
  } else if (type === 'bar') {
    const track = node('span', 'kt-loading-bar__track');
    progressNode = node('i', 'kt-loading-bar__progress');
    track.appendChild(progressNode);
    root.appendChild(track);
    if (opts.indeterminate !== false) root.classList.add('is-indeterminate');
  } else if (type === 'shimmer' || type === 'shimmer-wave') {
    const text = String(opts.text || opts.label || 'Loading');
    if (type === 'shimmer') {
      root.appendChild(node('span', 'kt-loading-shimmer__text', text));
    } else {
      const line = node('span', 'kt-loading-shimmer-wave__text');
      Array.from(text).forEach((character, index) => {
        const char = node('i', 'kt-loading-shimmer-wave__char', character === ' ' ? '\u00a0' : character);
        char.style.setProperty('--kt-loading-index', String(index));
        char.style.animationDelay = `${index * 42}ms`;
        line.appendChild(char);
      });
      root.appendChild(line);
    }
  } else {
    const style = variant(opts.terminalStyle, ['cursor', 'dots', 'blocks', 'meter'], 'cursor');
    root.classList.add(`kt-loading-terminal--${style}`);
    if (style === 'dots') {
      for (let index = 0; index < 3; index += 1) {
        const dot = node('i', 'kt-loading-terminal__dot', '.');
        dot.style.setProperty('--kt-loading-index', String(index));
        dot.style.animationDelay = `${index * 140}ms`;
        root.appendChild(dot);
      }
    } else if (style === 'blocks') {
      const count = Math.round(clamp(Number(opts.dotCount ?? 4), 3, 8));
      for (let index = 0; index < count; index += 1) {
        const block = node('i', 'kt-loading-terminal__block', '■');
        block.style.setProperty('--kt-loading-index', String(index));
        block.style.animationDelay = `${index * 120}ms`;
        root.appendChild(block);
      }
    } else if (style === 'meter') {
      meterNode = node('span', 'kt-loading-terminal__meter', '[░░░░░░░░░░]');
      root.appendChild(meterNode);
    } else {
      root.appendChild(node('i', 'kt-loading-terminal__cursor', opts.cursorChar || '█'));
    }
  }

  if (opts.direction === 'reverse' || opts.direction === 'rtl') root.classList.add('is-reverse');
  if (opts.glow !== false) root.classList.add('has-glow');
  root.setAttribute('aria-hidden', 'true');
  host.appendChild(root);

  return {
    root,
    render(value) {
      const progress = clamp(Number(value) || 0, 0, 100);
      if (progressNode && !root.classList.contains('is-indeterminate')) {
        progressNode.style.transform = `scaleX(${progress / 100})`;
      }
      if (meterNode) {
        const filled = Math.round(progress / 10);
        meterNode.textContent = `[${'█'.repeat(filled)}${'░'.repeat(10 - filled)}]`;
      }
    },
    setState(state) {
      root.dataset.state = state;
    },
    destroy() {
      root.remove();
    }
  };
}

export default {
  create(el, opts = {}) {
    const type = variant(opts.type || opts.preset, ['spinner', 'dots', 'bar', 'shimmer', 'shimmer-wave', 'terminal'], 'spinner');
    const original = {
      style: el.getAttribute('style'),
      className: el.getAttribute('class'),
      role: el.getAttribute('role'),
      aria: el.getAttribute('aria-label'),
      busy: el.getAttribute('aria-busy'),
      valueMin: el.getAttribute('aria-valuemin'),
      valueMax: el.getAttribute('aria-valuemax'),
      valueNow: el.getAttribute('aria-valuenow'),
      hidden: el.hidden
    };
    const duration = Math.max(0.2, Number(opts.motionDuration ?? 1.1));
    const terminalStyle = variant(opts.terminalStyle, ['cursor', 'dots', 'blocks', 'meter'], 'cursor');
    const determinate = (type === 'bar' && opts.indeterminate === false) || (type === 'terminal' && terminalStyle === 'meter');
    const color = opts.color || 'currentColor';

    el.classList.add('kt-loading-indicator');
    if (opts.className) el.classList.add(...String(opts.className).split(/\s+/).filter(Boolean));
    el.style.setProperty('--kt-loading-color', color);
    el.style.setProperty('--kt-loading-track-color', opts.trackColor || 'rgba(127,127,127,.18)');
    el.style.setProperty('--kt-loading-highlight-color', opts.highlightColor || opts.glowColor || '#fff');
    el.style.setProperty('--kt-loading-base-color', opts.baseColor || 'color-mix(in srgb,currentColor 32%,transparent)');
    el.style.setProperty('--kt-loading-size', `${Math.max(18, Number(opts.size ?? 48))}px`);
    el.style.setProperty('--kt-loading-stroke', `${Math.max(1, Number(opts.stroke ?? 4))}px`);
    el.style.setProperty('--kt-loading-bar-width', typeof opts.barWidth === 'number' ? `${opts.barWidth}px` : (opts.barWidth || 'min(240px,70vw)'));
    el.style.setProperty('--kt-loading-bar-height', `${Math.max(2, Number(opts.barHeight ?? 5))}px`);
    el.style.setProperty('--kt-loading-dot-size', `${Math.max(2, Number(opts.dotSize ?? 8))}px`);
    el.style.setProperty('--kt-loading-dot-gap', `${Math.max(0, Number(opts.dotGap ?? 6))}px`);
    el.style.setProperty('--kt-loading-motion-duration', `${duration}s`);
    el.style.setProperty('--kt-loading-fast-duration', `${duration * 0.72}s`);
    el.style.setProperty('--kt-loading-glow-color', opts.glowColor || color);
    el.style.setProperty('--kt-loading-glow-size', `${Math.max(0, Number(opts.glowSize ?? 16))}px`);
    el.style.setProperty('--kt-loading-text-size', typeof opts.textSize === 'number' ? `${opts.textSize}px` : (opts.textSize || '1rem'));
    el.style.setProperty('--kt-loading-spread', `${clamp(Number(opts.spread ?? 24), 2, 80)}%`);
    if (opts.fontFamily) el.style.setProperty('--kt-loading-font-family', opts.fontFamily);

    const ui = buildIndicator(el, type, opts);
    const EventCtor = el.ownerDocument?.defaultView?.CustomEvent || globalThis.CustomEvent;
    let progress = clamp(Number(opts.progress ?? 0), 0, 100);
    let state = 'running';
    let destroyed = false;
    let completionTimer = null;
    let finishResolve;
    let finishSettled = false;
    const finished = new Promise((resolve) => { finishResolve = resolve; });
    const emit = (name, detail = {}) => {
      if (!EventCtor) return;
      el.dispatchEvent(new EventCtor(`kt-loading-indicator-${name}`, {
        bubbles: true,
        detail: { indicator: el, state, progress, ...detail }
      }));
    };
    const setState = (next) => {
      if (state === next) return;
      const previous = state;
      state = next;
      el.dataset.ktLoadingState = next;
      ui.setState?.(next);
      opts.onStateChange?.(next, previous, el);
      emit('statechange', { previous });
    };
    const render = () => {
      ui.render?.(progress);
      el.style.setProperty('--kt-loading-progress', (progress / 100).toFixed(4));
      el.style.setProperty('--kt-loading-percent', String(Math.round(progress)));
      if (determinate) el.setAttribute('aria-valuenow', String(Math.round(progress)));
      opts.onProgress?.(progress, el);
      emit('progress', { value: progress });
    };
    const settle = (status) => {
      if (finishSettled) return;
      finishSettled = true;
      finishResolve?.({ status, progress, el });
    };
    const hide = (reason = 'manual') => {
      if (destroyed) return false;
      el.hidden = true;
      el.setAttribute('aria-busy', 'false');
      setState('hidden');
      opts.onHide?.(el, reason);
      emit('hide', { reason });
      return true;
    };
    const show = () => {
      if (destroyed) return false;
      el.hidden = false;
      el.setAttribute('aria-busy', 'true');
      setState('running');
      opts.onShow?.(el);
      emit('show');
      return true;
    };
    const complete = (status = 'completed') => {
      if (destroyed || state === 'completing' || state === 'completed') return false;
      progress = 100;
      render();
      setState('completing');
      const hold = Math.max(0, Number(opts.completeHold ?? 120));
      const exitDuration = Math.max(0, Number(opts.exitDuration ?? 180));
      el.style.setProperty('--kt-loading-exit-duration', `${exitDuration}ms`);
      el.classList.add('is-complete');
      completionTimer = setTimeout(() => {
        if (destroyed) return;
        el.hidden = opts.hideOnComplete !== false;
        el.setAttribute('aria-busy', 'false');
        setState(status);
        opts.onComplete?.(el, status);
        emit('complete', { status });
        settle(status);
      }, hold + exitDuration);
      return true;
    };
    const setProgress = (value) => {
      if (destroyed) return false;
      progress = clamp(Number(value) || 0, 0, 100);
      render();
      if (progress >= 100 && opts.autoComplete !== false) complete();
      return true;
    };
    const trackPromise = (promise) => {
      show();
      return Promise.resolve(promise).then(
        (value) => { complete(); return value; },
        (error) => {
          setState('error');
          opts.onError?.(error, el);
          emit('error', { error });
          if (opts.completeOnError !== false) complete('error');
          throw error;
        }
      );
    };

    el.setAttribute('role', determinate ? 'progressbar' : 'status');
    el.setAttribute('aria-label', opts.ariaLabel || 'Loading');
    el.setAttribute('aria-busy', 'true');
    if (determinate) {
      el.setAttribute('aria-valuemin', '0');
      el.setAttribute('aria-valuemax', '100');
    }
    render();
    opts.onStart?.(el);
    emit('start');

    return {
      el,
      type: 'loadingIndicator',
      get progress() { return progress; },
      get state() { return state; },
      get finished() { return finished; },
      setProgress,
      start: show,
      show,
      hide,
      stop: complete,
      complete,
      trackPromise,
      pause() {
        if (destroyed) return;
        el.classList.add('is-paused');
        setState('paused');
      },
      resume() {
        if (destroyed) return;
        el.classList.remove('is-paused');
        setState('running');
      },
      destroy() {
        if (destroyed) return;
        destroyed = true;
        if (completionTimer) clearTimeout(completionTimer);
        ui.destroy?.();
        if (original.style == null) el.removeAttribute('style'); else el.setAttribute('style', original.style);
        if (original.className == null) el.removeAttribute('class'); else el.setAttribute('class', original.className);
        if (original.role == null) el.removeAttribute('role'); else el.setAttribute('role', original.role);
        if (original.aria == null) el.removeAttribute('aria-label'); else el.setAttribute('aria-label', original.aria);
        if (original.busy == null) el.removeAttribute('aria-busy'); else el.setAttribute('aria-busy', original.busy);
        if (original.valueMin == null) el.removeAttribute('aria-valuemin'); else el.setAttribute('aria-valuemin', original.valueMin);
        if (original.valueMax == null) el.removeAttribute('aria-valuemax'); else el.setAttribute('aria-valuemax', original.valueMax);
        if (original.valueNow == null) el.removeAttribute('aria-valuenow'); else el.setAttribute('aria-valuenow', original.valueNow);
        el.hidden = original.hidden;
        delete el.dataset.ktLoadingState;
        settle('destroyed');
      }
    };
  },
  reduced(el, opts = {}) {
    const instance = this.create(el, opts);
    instance.pause();
    return instance;
  }
};
