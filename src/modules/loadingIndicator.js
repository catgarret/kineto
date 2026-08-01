import { clamp, createProgressOutputs } from '../utils.js';
import {
  getTerminalFramePreset,
  TERMINAL_FRAME_LEGACY_PRESETS,
  TERMINAL_FRAME_PRESET_IDS
} from './loadingIndicator/terminalFramePresets.js';
import {
  mountLegacyCharFrames,
  mountTerminalFrameSpinner
} from './loadingIndicator/terminalFrameRuntime.js';

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text != null) element.textContent = String(text);
  element.setAttribute('aria-hidden', 'true');
  return element;
}

function variant(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

const TERMINAL_FRAME_PRESETS = Object.freeze({
  ...TERMINAL_FRAME_LEGACY_PRESETS
});

const TERMINAL_STYLES = [
  'cursor', 'dots', 'blocks', 'meter',
  ...TERMINAL_FRAME_PRESET_IDS,
  ...Object.keys(TERMINAL_FRAME_PRESETS)
];

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
  let spinnerArc = null;
  let meterNode = null;
  let meterTimer = null;
  let blockCells = [];
  let frameNode = null;
  let frameTimer = null;
  let frameIndex = 0;
  let framePaused = false;
  let initialFrameRender = true;
  let frames = [];
  let frameRuntime = null;
  const timerHost = host.ownerDocument?.defaultView || globalThis;
  const reversed = opts.direction === 'reverse' || opts.direction === 'rtl';

  const stopFrames = () => {
    if (frameTimer != null) {
      timerHost.clearTimeout(frameTimer);
      timerHost.clearInterval(frameTimer);
    }
    frameTimer = null;
  };
  const scheduleFrames = () => {
    stopFrames();
    if (framePaused || !frameNode || frames.length < 2) return;
    const interval = Math.max(40, Number(opts.frameInterval ?? (Number(opts.motionDuration ?? 1.1) * 1000 / 12)));
    frameTimer = timerHost.setTimeout(() => {
      const step = reversed ? -1 : 1;
      frameIndex = (frameIndex + step + frames.length) % frames.length;
      frameNode.textContent = frames[frameIndex];
      scheduleFrames();
    }, interval);
  };

  if (type === 'spinner') {
    // `dual` and `orbit` are gone: the comet spinner now covers both through
    // options (`track` for the rail, `spinnerMode:'grow'` for the stretching
    // arc), so there is one arc spinner instead of three near-duplicates.
    const style = variant(opts.spinnerStyle, ['ring', 'comet', 'spokes'], 'comet');
    root.classList.add(`kt-loading-spinner--${style}`);
    if (style === 'spokes') {
      if (opts.rotateSpokes) root.classList.add('is-rotating');
      const count = Math.round(clamp(Number(opts.dotCount ?? 12), 6, 16));
      for (let index = 0; index < count; index += 1) {
        const spoke = node('i', 'kt-loading-spinner__spoke');
        const angle = (360 / count) * index;
        spoke.style.setProperty('--kt-loading-angle', `${angle}deg`);
        spoke.style.setProperty('--kt-loading-index', String(index));
        spoke.style.setProperty('--kt-loading-count', String(count));
        // Peak time is (0.42 * D - delay) mod D, so a SMALLER negative delay
        // peaks sooner. `order = index` therefore lights spoke 0 (top) first and
        // sweeps clockwise — rightwards across the top, i.e. left -> right.
        // `reverse` inverts the order and sweeps anticlockwise.
        const order = reversed ? count - 1 - index : index;
        spoke.style.animationDelay = `${-(Number(opts.motionDuration ?? 1.1) / count) * order}s`;
        root.appendChild(spoke);
      }
    } else if (style === 'ring') {
      root.appendChild(node('i', 'kt-loading-spinner__ring'));
    } else {
      // ONE SVG arc engine (Adobe-Spectrum-style progress circle): an optional
      // track circle plus an arc that rotates.
      //   mode 'grow' — arc stretches and shrinks while rotating
      //   mode 'spin' — a fixed-length arc just rotates (default)
      //   mode 'fill' — determinate: the arc length follows `progress`
      // `track:true` adds the grey backing rail.
      const mode = variant(opts.spinnerMode, ['grow', 'spin', 'fill'], 'spin');
      const showTrack = opts.track === true;
      root.classList.add(`kt-loading-spinner--mode-${mode}`);
      if (showTrack) root.classList.add('has-track');
      const NS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '0 0 48 48');
      svg.setAttribute('class', 'kt-loading-spinner__svg');
      svg.setAttribute('aria-hidden', 'true');
      const circle = (cls) => {
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', '24'); c.setAttribute('cy', '24'); c.setAttribute('r', '20');
        c.setAttribute('class', cls);
        return c;
      };
      if (showTrack) svg.appendChild(circle('kt-loading-spinner__track'));
      spinnerArc = circle('kt-loading-spinner__arc');
      svg.appendChild(spinnerArc);
      root.appendChild(svg);
      if (mode === 'fill') {
        // Determinate: no self-rotation, the arc length IS the progress.
        root.classList.add('is-determinate-arc');
      }
    }
  } else if (type === 'dots') {
    const style = variant(opts.dotStyle, ['pulse', 'bounce', 'wave'], 'wave');
    root.classList.add(`kt-loading-dots--${style}`);
    const count = Math.round(clamp(Number(opts.dotCount ?? 3), 3, 8));
    for (let index = 0; index < count; index += 1) {
      const dot = node('i', 'kt-loading-dot');
      dot.style.setProperty('--kt-loading-index', String(index));
      const order = reversed ? count - 1 - index : index;
      dot.style.animationDelay = `${order * 110}ms`;
      root.appendChild(dot);
    }
  } else if (type === 'bar') {
    const track = node('span', 'kt-loading-bar__track');
    progressNode = node('i', 'kt-loading-bar__progress');
    track.appendChild(progressNode);
    root.appendChild(track);
    if (opts.indeterminate !== false) {
      root.classList.add('is-indeterminate');
      // barMode: 'slide' crosses once per loop, 'grow' stretches while crossing,
      // and 'pingpong' keeps a constant-width block bouncing left ↔ right.
      root.classList.add(`is-bar-${variant(opts.barMode, ['slide', 'grow', 'pingpong'], 'slide')}`);
    }
  } else if (type === 'shimmer' || type === 'shimmer-wave') {
    const text = String(opts.text || opts.label || 'Loading');
    if (type === 'shimmer') {
      const shimmerText = node('span', 'kt-loading-shimmer__text', text);
      shimmerText.dataset.text = text;
      if (reversed) shimmerText.classList.add('is-reverse');
      root.appendChild(shimmerText);
    } else {
      const line = node('span', 'kt-loading-shimmer-wave__text');
      Array.from(text).forEach((character, index) => {
        const char = node('i', 'kt-loading-shimmer-wave__char', character === ' ' ? '\u00a0' : character);
        char.style.setProperty('--kt-loading-index', String(index));
        const order = reversed ? text.length - 1 - index : index;
        char.style.animationDelay = `${order * 42}ms`;
        line.appendChild(char);
      });
      root.appendChild(line);
    }
  } else {
    const requestedStyle = variant(opts.terminalStyle, TERMINAL_STYLES, 'cursor');
    const customFrames = Array.isArray(opts.frames) ? opts.frames.map(String).filter(Boolean) : [];
    const style = customFrames.length ? 'custom' : requestedStyle;
    root.classList.add(`kt-loading-terminal--${style}`);
    if (style === 'dots') {
      for (let index = 0; index < 3; index += 1) {
        const dot = node('i', 'kt-loading-terminal__dot', '.');
        dot.style.setProperty('--kt-loading-index', String(index));
        const order = reversed ? 2 - index : index;
        dot.style.animationDelay = `${order * 140}ms`;
        root.appendChild(dot);
      }
    } else if (style === 'blocks') {
      const count = Math.round(clamp(Number(opts.dotCount ?? 4), 3, 8));
      for (let index = 0; index < count; index += 1) {
        const block = node('i', 'kt-loading-terminal__block', '■');
        block.style.setProperty('--kt-loading-index', String(index));
        const order = reversed ? count - 1 - index : index;
        block.style.animationDelay = `${order * 120}ms`;
        root.appendChild(block);
        blockCells.push(block);
      }
    } else if (style === 'meter') {
      meterNode = node('span', 'kt-loading-terminal__meter');
      
      const count = Math.round(clamp(Number(opts.dotCount ?? 10), 5, 40));
      const emptyChar = opts.emptyChar || '░';
      const fillChar = opts.fillChar || '█';
      meterNode.dataset.count = count;
      meterNode.dataset.emptyChar = emptyChar;
      meterNode.dataset.fillChar = fillChar;

      // A terminal meter is drawn with real block characters in individual cells
      // for BOTH modes, the way a shell progress bar looks:
      //   indeterminate → a filled window slides across and wraps
      //                   [██████░░░░] → [░██████░░░] → … → [██░░░░████]
      //   determinate   → cells fill left→right from the real progress value
      //                   [░░░░░░░░░░] → [███░░░░░░░] → [██████████]
      // Per-cell nodes (not whole-string frame swaps) keep the width fixed and
      // let setProgress()/the API update it without rebuilding the DOM.
      meterNode.appendChild(node('i', 'kt-loading-terminal__bracket', '['));
      const meterCells = [];
      for (let index = 0; index < count; index += 1) {
        const cell = node('i', 'kt-loading-terminal__cell', emptyChar);
        cell.style.setProperty('--kt-loading-index', String(index));
        meterNode.appendChild(cell);
        meterCells.push(cell);
      }
      meterNode.appendChild(node('i', 'kt-loading-terminal__bracket', ']'));
      const paintCells = (isFilled) => {
        meterCells.forEach((cell, index) => {
          const active = Boolean(isFilled(index));
          cell.textContent = active ? fillChar : emptyChar;
          cell.classList.toggle('is-filled', active);
        });
      };
      if (opts.indeterminate !== true) {
        // Default: real progress meter driven by setProgress()/the progress option.
        // `spread` is an explicit override — say "light 4 cells" directly instead
        // of back-solving a percentage.
        meterNode.classList.add('is-determinate');
        if (opts.spread != null && opts.spread !== '') {
          const lit = Math.round(clamp(Number(opts.spread), 0, count));
          meterNode.dataset.lit = String(lit);
          paintCells((index) => index < lit);
        } else paintCells(() => false);
      } else {
        // Sliding window. `dotCount` is the track length, `spread` is how many
        // cells travel — both are independently configurable. No fading: a real
        // terminal just moves solid blocks along the track.
        const windowSize = Math.round(clamp(Number(opts.spread ?? 0) || Math.max(1, Math.round(count * 0.3)), 1, count));
        let offset = 0;
        const stepMs = Math.max(40, Number(opts.frameInterval ?? (Number(opts.motionDuration ?? 1.1) * 1000 / count)));
        paintCells((index) => ((index - offset + count * 2) % count) < windowSize);
        meterTimer = timerHost.setInterval(() => {
          if (framePaused) return;
          offset = (offset + (reversed ? -1 : 1) + count) % count;
          paintCells((index) => ((index - offset + count * 2) % count) < windowSize);
        }, stepMs);
      }
      root.appendChild(meterNode);
    } else if (style === 'cursor') {
      root.appendChild(node('i', 'kt-loading-terminal__cursor', opts.cursorChar || '█'));
    } else {
      const framePreset = customFrames.length ? null : getTerminalFramePreset(requestedStyle);
      if (framePreset) {
        // Forward the compound part-toggles explicitly. The frame runtime is a
        // separate file, and the behaviour contract only sees options this module
        // reads — so naming them here is what makes them public and settable.
        frameRuntime = mountTerminalFrameSpinner(root, framePreset, {
          ...opts,
          showSpinner: opts.showSpinner,
          showLabel: opts.showLabel,
          showStatus: opts.showStatus,
          stepTotal: opts.stepTotal
        });
      } else if (customFrames.length) {
        frames = customFrames;
        frameNode = node('i', 'kt-loading-terminal__frame', frames[0]);
        root.classList.add('kt-loading-terminal--custom');
        root.appendChild(frameNode);
        scheduleFrames();
      } else if (TERMINAL_FRAME_PRESETS[requestedStyle]) {
        frameRuntime = mountLegacyCharFrames(root, requestedStyle, opts);
      } else {
        frames = Array.from(TERMINAL_FRAME_PRESETS.ascii || '|/-\\');
        frameNode = node('i', 'kt-loading-terminal__frame', frames[0]);
        root.classList.add('kt-loading-terminal--ascii');
        root.appendChild(frameNode);
        scheduleFrames();
      }
    }
  }

  if (reversed && type !== 'shimmer') root.classList.add('is-reverse');
  if (opts.glow === true) root.classList.add('has-glow');
  root.setAttribute('aria-hidden', 'true');
  host.appendChild(root);

  return {
    root,
    render(value) {
      const progress = clamp(Number(value) || 0, 0, 100);
      if (progressNode && !root.classList.contains('is-indeterminate')) {
        progressNode.style.transform = `scaleX(${progress / 100})`;
      }
      // The public instance renders once during creation to publish ARIA/CSS
      // progress. Scanner without an authored progress value is indeterminate;
      // forwarding that synthetic initial 0 used to collapse it to one frame
      // and freeze the demo. A later setProgress(0) is still an intentional
      // determinate update and therefore renders normally.
      const skipInitialScannerProgress = initialFrameRender
        && root.classList.contains('kt-loading-terminal--scanner')
        && (opts.progress == null || opts.progress === '')
        && opts.indeterminate !== false;
      initialFrameRender = false;
      if (!skipInitialScannerProgress) frameRuntime?.render?.(progress);
      if (spinnerArc && root.classList.contains('is-determinate-arc')) {
        const C = 125.66;
        spinnerArc.style.strokeDasharray = `${(C * progress / 100).toFixed(2)} ${C}`;
      }
      if (meterNode && meterNode.classList.contains('is-determinate') && meterNode.dataset.lit == null) {
        const count = Number(meterNode.dataset.count);
        const empty = meterNode.dataset.emptyChar;
        const fill = meterNode.dataset.fillChar;
        const filled = Math.round((progress / 100) * count);
        const cells = meterNode.querySelectorAll('.kt-loading-terminal__cell');
        cells.forEach((cell, index) => {
          const active = index < filled;
          cell.textContent = active ? fill : empty;
          cell.classList.toggle('is-filled', active);
        });
      }
      if (blockCells.length && opts.indeterminate === false) {
        const filled = Math.round((progress / 100) * blockCells.length);
        blockCells.forEach((block, index) => {
          const active = index < filled;
          block.classList.toggle('is-filled', active);
          block.style.opacity = active ? '1' : '0.25';
        });
      }
    },
    setState(state) {
      root.dataset.state = state;
      framePaused = state !== 'running';
      if (frameRuntime) frameRuntime.setState(state);
      else if (framePaused) stopFrames(); else scheduleFrames();
    },
    destroy() {
      stopFrames();
      if (meterTimer != null) { timerHost.clearInterval(meterTimer); meterTimer = null; }
      frameRuntime?.destroy?.();
      root.remove();
    },
    restartFrames() {
      frameIndex = 0;
      if (frameNode && frames[0] != null) frameNode.textContent = frames[0];
      frameRuntime?.restart?.();
      if (!frameRuntime && !framePaused) scheduleFrames();
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
    const terminalStyle = variant(opts.terminalStyle, TERMINAL_STYLES, 'cursor');
    const determinate = (type === 'bar' && opts.indeterminate === false)
      || (type === 'spinner' && opts.spinnerStyle === 'comet' && opts.spinnerMode === 'fill')
      || (type === 'terminal' && (
        terminalStyle === 'meter'
        || terminalStyle === 'scanner' && opts.indeterminate !== true && opts.progress != null
      ));
    const color = opts.color || 'currentColor';

    el.classList.add('kt-loading-indicator');
    if (opts.className) el.classList.add(...String(opts.className).split(/\s+/).filter(Boolean));
    el.style.setProperty('--kt-loading-color', color);
    el.style.setProperty('--kt-loading-track-color', opts.trackColor || 'rgba(127,127,127,.18)');
    el.style.setProperty('--kt-loading-highlight-color', opts.highlightColor || opts.glowColor || 'currentColor');
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
    if (opts.transformOrigin) el.style.setProperty('--kt-loading-transform-origin', String(opts.transformOrigin));
    if (opts.fontFamily) el.style.setProperty('--kt-loading-font-family', opts.fontFamily);
    if (opts.fontWeight) el.style.setProperty('--kt-loading-font-weight', String(opts.fontWeight));
    if (opts.letterSpacing != null) el.style.setProperty('--kt-loading-letter-spacing', String(opts.letterSpacing));
    if (opts.lineHeight != null) el.style.setProperty('--kt-loading-line-height', String(opts.lineHeight));
    if (opts.fixedWidth) el.classList.add('is-terminal-fixed-width');
    if (opts.asciiOnly) el.classList.add('is-ascii-only');
    if (opts.viewportWidth != null) el.style.setProperty('--kt-terminal-viewport-width', `${Math.max(4, Number(opts.viewportWidth))}ch`);
    if (opts.secondaryColor || opts.highlightColor) {
      el.style.setProperty('--kt-loading-secondary-color', opts.secondaryColor || opts.highlightColor);
    }

    const ui = buildIndicator(el, type, opts);
    const progressOutputs = createProgressOutputs(el, {
      ...opts,
      progressOutput: opts.progressOutput,
      progressScope: opts.progressScope,
      progressTemplate: opts.progressTemplate
    });
    const EventCtor = el.ownerDocument?.defaultView?.CustomEvent || globalThis.CustomEvent;
    let progress = clamp(Number(opts.progress ?? 0), 0, 100);
    let state = 'running';
    let destroyed = false;
    let completionTimer = null;
    const progressSubscriptions = [];
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
      progressOutputs.update(progress, next);
      opts.onStateChange?.(next, previous, el);
      emit('statechange', { previous });
    };
    const render = () => {
      ui.render?.(progress);
      el.style.setProperty('--kt-loading-progress', (progress / 100).toFixed(4));
      el.style.setProperty('--kt-loading-percent', String(Math.round(progress)));
      if (determinate) el.setAttribute('aria-valuenow', String(Math.round(progress)));
      progressOutputs.update(progress, state);
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
    const bindProgress = (source) => {
      const target = typeof source === 'string'
        ? el.ownerDocument.querySelector(source)
        : (source?.el || source);
      if (!target?.addEventListener) return () => {};
      const onProgress = (event) => setProgress(event.detail?.value ?? event.detail?.progress ?? 0);
      const onComplete = () => complete();
      const bindings = [
        ['kt-loader-progress', onProgress],
        ['kt-loading-indicator-progress', onProgress],
        ['kt-loader-complete', onComplete],
        ['kt-loading-indicator-complete', onComplete]
      ];
      bindings.forEach(([name, listener]) => target.addEventListener(name, listener));
      const unsubscribe = () => bindings.forEach(([name, listener]) => target.removeEventListener(name, listener));
      progressSubscriptions.push(unsubscribe);
      const initial = source?.progress ?? target.getAttribute?.('aria-valuenow');
      if (Number.isFinite(Number(initial))) setProgress(initial);
      return unsubscribe;
    };

    el.setAttribute('role', determinate ? 'progressbar' : 'status');
    el.setAttribute('aria-label', opts.ariaLabel || 'Loading');
    el.setAttribute('aria-busy', 'true');
    if (determinate) {
      el.setAttribute('aria-valuemin', '0');
      el.setAttribute('aria-valuemax', '100');
    }
    render();
    if (opts.progressSource) bindProgress(opts.progressSource);
    opts.onStart?.(el);
    emit('start');

    return {
      el,
      type: 'loadingIndicator',
      get progress() { return progress; },
      get state() { return state; },
      get finished() { return finished; },
      setProgress,
      bindProgress,
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
      restart() {
        if (destroyed) return;
        ui.restartFrames?.();
        setState('running');
      },
      destroy() {
        if (destroyed) return;
        destroyed = true;
        if (completionTimer) clearTimeout(completionTimer);
        progressSubscriptions.splice(0).forEach((unsubscribe) => unsubscribe());
        ui.destroy?.();
        progressOutputs.destroy();
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
