import {
  getTerminalFramePreset,
  TERMINAL_FRAME_LEGACY_PRESETS
} from './terminalFramePresets.js';

const MONO = 'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace';
const QUAD_TRAIL = [1, 0.68, 0.32, 0.12];
const QUAD_FALLBACK = [
  '● •\n· ·',
  '• ●\n· ·',
  '· •\n· ●',
  '· ·\n● •'
];

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text != null) element.textContent = String(text);
  element.setAttribute('aria-hidden', 'true');
  return element;
}

// A marquee scrolls continuously: the text walks in from the right edge,
// crosses the viewport and walks out the left, then wraps with no jump. The
// previous version only nudged the label a few cells inside a fixed pad and
// snapped back, which read as "not moving".
// Split into user-perceived characters, not UTF-16 code units: slicing by index
// tears a Hangul syllable apart from its combining jamo (and breaks emoji), so
// the marquee showed broken glyphs mid-scroll.
function graphemes(text) {
  const value = String(text);
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    return [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(value)].map((part) => part.segment);
  }
  return [...value];
}

const SCRAMBLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@?';
function scrambleChar() {
  return SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
}

function buildMarqueeFrames(text, width = 12, opts = {}) {
  const cells = graphemes(String(text || 'Loading')).slice(0, 40);
  const view = Math.max(4, Math.round(Number(width) || 12));
  // `[ text ]` — a space of padding inside each bracket, the way a shell prints
  // it. Without this the text butted straight up against both brackets.
  const wrap = (window) => `[ ${window.join('')} ]`;
  const effect = ['shuffle', 'decode'].includes(opts.textEffect) ? opts.textEffect : null;
  if (effect) {
    // Reveal in place instead of scrolling: each pass locks in one more real
    // character while the rest keep churning, like Text Reveal's shuffle/decode.
    const frames = [];
    const passes = effect === 'decode' ? 2 : 3;
    for (let revealed = 0; revealed <= cells.length; revealed += 1) {
      for (let pass = 0; pass < (revealed === cells.length ? 1 : passes); pass += 1) {
        frames.push(wrap(cells.map((cell, index) => (
          index < revealed || cell === ' ' ? cell
            : effect === 'decode' ? (index === revealed ? scrambleChar() : '·') : scrambleChar()
        ))));
      }
    }
    return frames;
  }
  const track = [...cells, ...Array(view).fill(' ')];
  const frames = [];
  for (let offset = 0; offset < track.length; offset += 1) {
    const window = [];
    for (let index = 0; index < view; index += 1) window.push(track[(offset + index) % track.length]);
    frames.push(wrap(window));
  }
  // Stepping this sequence forward slides the text LEFT (each frame reveals a
  // later slice of the track). `normal` has to read left -> right like every
  // other direction option in the library, so the base order is reversed and
  // `direction:'reverse'` — which walks the frame index backwards — gives
  // right -> left.
  frames.reverse();
  return frames;
}


/**
 * Scanner beam frames. Three things the static `sweepTrack()` catalogue entry
 * could not do:
 *   - `direction:'reverse'` used to walk the same frames backwards, so the beam
 *     shrank from the right while the arrowhead still pointed right. The glyph
 *     is now mirrored (`<===` instead of `===>`) and the beam grows from the
 *     right wall, which is what "reverse" reads as.
 *   - the track length is settable through `dotCount`, the same option the
 *     Terminal Meter uses for its cell count.
 *   - a numeric `progress` (0-100) fills the beam to that fraction and stops
 *     animating, matching Progress bar / Terminal Meter behaviour.
 */
export function buildScannerFrames(opts, reversed) {
  const width = Math.round(clampNumber(Number(opts.dotCount ?? 10), 3, 40));
  const tail = opts.fillChar || '=';
  const head = reversed ? '<' : '>';
  const empty = opts.emptyChar === '' ? ' ' : (opts.emptyChar || ' ');
  const beam = (length) => {
    const row = Array(width).fill(empty);
    // The arrowhead sits on the LEADING tip, not against the wall the beam grew
    // from: normal reads `[ ===>      ]`, reverse mirrors it as `[      <=== ]`.
    // `length` counts the head, so length 1 is the arrowhead alone.
    for (let i = 0; i < length - 1; i += 1) row[reversed ? width - 1 - i : i] = tail;
    row[reversed ? width - length : length - 1] = head;
    return `[ ${row.join('')} ]`;
  };
  const pct = scannerProgress(opts);
  if (pct != null) return [beam(Math.max(1, Math.round((pct / 100) * width)))];
  const frames = [];
  for (let length = 1; length <= width; length += 1) frames.push(beam(length));
  return frames;
}

/** Numeric `progress` means determinate; anything else means keep animating. */
function scannerProgress(opts) {
  if (opts.indeterminate === true) return null;
  const raw = opts.progress;
  if (raw == null || raw === '' || raw === false) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? clampNumber(value, 0, 100) : null;
}

/**
 * The single source of truth for an ASCII meter string. The compound presets and
 * the standalone Terminal Meter now agree on cell count, lit count and glyphs,
 * so `dotCount`, `spread`, `fillChar` and `emptyChar` behave identically in both.
 */
export function renderMeterText(opts, progress, fallbackCount = 10) {
  // `fallbackCount` lets a compound preset ask for a shorter bar than the
  // standalone Terminal Meter: Spinner + Meter measured 252px inside a 240px demo
  // stage at 10 cells and was clipped on the right. An explicit `dotCount` from
  // the user always wins over the compound's suggestion.
  const count = Math.round(clampNumber(Number(opts.dotCount ?? fallbackCount), 5, 40));
  const fill = opts.fillChar || '█';
  const empty = opts.emptyChar || '░';
  const pct = clampNumber(Number(progress ?? opts.progress ?? 60), 0, 100);
  const lit = opts.spread != null && opts.spread !== ''
    ? Math.round(clampNumber(Number(opts.spread), 0, count))
    : Math.round((pct / 100) * count);
  return `[${fill.repeat(lit)}${empty.repeat(Math.max(0, count - lit))}] ${Math.round(pct)}%`;
}
function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}

// The static text and the blinking caret for each cursor preset. The caret is
// always present in the layout; only its opacity changes, so the label never
// shifts as it blinks.
function cursorParts(presetId, opts) {
  const label = String(opts.text || opts.label || 'Loading');
  const caret = opts.cursorChar || null;
  switch (presetId) {
    case 'typing-cursor':   return { label, caret: caret || '_', mode: 'blink' };
    case 'block-cursor':    return { label, caret: caret || '█', mode: 'blink' };
    case 'dot-cursor':      return { label, caret: caret || '·', mode: 'blink' };
    case 'command-prompt':  return { label: '> npm run build', caret: caret || '_', mode: 'blink' };
    // The ellipsis GROWS, so its three dots are reserved up front and revealed
    // one at a time — the width is fixed from the first frame.
    case 'ellipsis-typing': return { label, caret: caret || '.', mode: 'ellipsis' };
    default:                return { label, caret: caret || '_', mode: 'blink' };
  }
}

function pickFrames(preset, opts) {
  if (Array.isArray(opts.frames) && opts.frames.length) {
    return opts.frames.map(String).filter(Boolean);
  }
  if (opts.asciiOnly && preset.fallbackFrames?.length) {
    return preset.fallbackFrames.slice();
  }
  if (preset.renderer === 'marquee-frame' && preset.id === 'marquee') {
    return buildMarqueeFrames(opts.text || opts.label, Number(opts.viewportWidth ?? 12), opts);
  }
  if (preset.id === 'scanner') {
    // Built here rather than taken from the catalogue: the glyph, the track
    // length and the determinate fill all depend on live options.
    return buildScannerFrames(opts, opts.direction === 'reverse' || opts.direction === 'rtl');
  }
  if ((preset.id === 'quad-dot-chase' || preset.id === 'quad-dot-pulse') && opts.asciiOnly) {
    return QUAD_FALLBACK.slice();
  }
  return preset.frames.slice();
}

function intervalMs(opts, preset) {
  if (preset.renderer === 'matrix-frame') {
    const duration = Math.max(400, Number(opts.motionDuration ?? 1) * 1000);
    return Math.max(40, Number(opts.frameInterval ?? duration / 4));
  }
  return Math.max(40, Number(opts.frameInterval ?? preset.defaultInterval ?? (Number(opts.motionDuration ?? 1.1) * 1000 / 12)));
}

/**
 * @param {HTMLElement} root kt-loading--terminal root
 * @param {import('./terminalFramePresets.js').TerminalFramePreset} preset
 * @param {object} opts
 */
export function mountTerminalFrameSpinner(root, preset, opts) {
  const timerHost = root.ownerDocument?.defaultView || globalThis;
  const reversed = opts.direction === 'reverse' || opts.direction === 'rtl';
  let frames = pickFrames(preset, opts);
  let frameIndex = 0;
  let frameTimer = null;
  let rafId = null;
  let framePaused = false;
  let quadHead = 0;
  let elapsedStart = timerHost.performance?.now?.() ?? Date.now();
  let elapsedTimer = null;

  root.classList.add(`kt-loading-terminal--${preset.id}`);
  if (preset.fixedWidth || opts.fixedWidth) root.classList.add('is-fixed-width');
  root.style.setProperty('--kt-loading-font-family', opts.fontFamily || MONO);
  if (opts.fontWeight) root.style.setProperty('--kt-loading-font-weight', String(opts.fontWeight));
  if (opts.letterSpacing != null) root.style.setProperty('--kt-loading-letter-spacing', String(opts.letterSpacing));
  if (opts.lineHeight != null) root.style.setProperty('--kt-loading-line-height', String(opts.lineHeight));
  if (opts.highlightColor) root.style.setProperty('--kt-loading-highlight-color', opts.highlightColor);

  /** @type {HTMLElement|null} */
  let frameNode = null;
  /** @type {HTMLElement[]} */
  let quadDots = [];
  /** @type {ReturnType<typeof mountTerminalFrameSpinner>|null} */
  let nestedSpinner = null;
  let compoundStatus = null;
  let compoundLabel = null;
  /** @type {HTMLElement[]} */
  let cursorCarets = [];
  let cursorMode = null;
  let cursorStep = 0;
  // Opacity only — never add/remove the glyph, or the line width changes.
  const paintCursor = (step) => {
    if (!cursorCarets.length) return;
    if (cursorMode === 'ellipsis') {
      const shown = step % (cursorCarets.length + 1);
      cursorCarets.forEach((caret, index) => { caret.style.opacity = index < shown ? '1' : '0'; });
      return;
    }
    cursorCarets[0].style.opacity = step % 2 ? '0' : '1';
  };

  const stopTimers = () => {
    if (frameTimer != null) {
      timerHost.clearTimeout(frameTimer);
      timerHost.clearInterval(frameTimer);
    }
    frameTimer = null;
    if (rafId != null) timerHost.cancelAnimationFrame(rafId);
    rafId = null;
    if (elapsedTimer != null) timerHost.clearInterval(elapsedTimer);
    elapsedTimer = null;
  };

  const applyTextFrame = (content) => {
    if (!frameNode) return;
    if (preset.renderer === 'multiline-frame') {
      frameNode.textContent = content;
    } else {
      frameNode.textContent = content;
    }
  };

  const advanceFrame = () => {
    if (cursorCarets.length) {
      cursorStep = (cursorStep + 1) % (cursorMode === 'ellipsis' ? cursorCarets.length + 1 : 2);
      paintCursor(cursorStep);
      return;
    }
    if (frames.length < 2) return;
    // Scanner bakes its direction into the glyph and the growth order, so it must
    // always play forward; every other preset expresses reverse by walking the
    // frame index backwards.
    const step = (reversed && preset.id !== 'scanner') ? -1 : 1;
    frameIndex = (frameIndex + step + frames.length) % frames.length;
    applyTextFrame(frames[frameIndex]);
  };

  const scheduleFrames = () => {
    stopTimers();
    if (framePaused) return;

    if (preset.renderer === 'matrix-frame' && !opts.asciiOnly) {
      const dotSize = Math.max(2, Number(opts.dotSize ?? 4));
      const dotGap = Math.max(0, Number(opts.dotGap ?? 4));
      const transition = Math.max(80, Math.min(220, Number(opts.opacityTransition ?? 160)));
      root.style.setProperty('--kt-terminal-dot-size', `${dotSize}px`);
      root.style.setProperty('--kt-terminal-dot-gap', `${dotGap}px`);
      root.style.setProperty('--kt-terminal-dot-transition', `${transition}ms`);
      const minOpacity = clamp(Number(opts.minOpacity ?? 0.12), 0, 1);
      const trailStrength = clamp(Number(opts.trailStrength ?? 1), 0, 1);
      const stepMs = intervalMs(opts, preset);
      const tick = () => {
        if (framePaused) return;
        quadDots.forEach((dot, dotIndex) => {
          const distance = reversed
            ? (dotIndex - quadHead + 4) % 4
            : (quadHead - dotIndex + 4) % 4;
          const base = QUAD_TRAIL[distance] ?? minOpacity;
          // quad-dot-pulse breathes the whole cluster on top of the chase: a
          // slow cosine over one full lap, so it dims and brightens as the head
          // travels rather than holding one flat brightness.
          const breathe = preset.id === 'quad-dot-pulse'
            ? 0.62 + 0.38 * (0.5 + 0.5 * Math.cos((quadHead / 4) * Math.PI * 2))
            : 1;
          dot.style.opacity = String((minOpacity + (base - minOpacity) * trailStrength) * breathe);
        });
        quadHead = reversed ? (quadHead + 3) % 4 : (quadHead + 1) % 4;
      };
      tick();
      frameTimer = timerHost.setInterval(tick, stepMs);
      return;
    }

    if (preset.renderer === 'compound-frame') {
      elapsedTimer = timerHost.setInterval(() => {
        if (!compoundStatus || framePaused) return;
        const cfg = preset.compound || {};
        if (cfg.showElapsed) {
          const ms = (timerHost.performance?.now?.() ?? Date.now()) - elapsedStart;
          const sec = Math.floor(ms / 1000);
          const clock = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
          // Elapsed time alone says nothing about how far along the job is, so
          // when a progress value exists the clock carries the percentage too.
          const pct = opts.progress == null ? null : clamp(Number(opts.progress), 0, 100);
          compoundStatus.textContent = pct == null ? clock : `${clock}·${Math.round(pct)}%`;
        } else if (cfg.showStep) {
          const total = Math.max(1, Math.round(Number(opts.stepTotal ?? cfg.stepTotal ?? 8)));
          const step = Math.floor(((timerHost.performance?.now?.() ?? Date.now()) - elapsedStart) / 900) % total + 1;
          compoundStatus.textContent = `${step}/${total}`;
        } else if (cfg.showMeter) {
          compoundStatus.textContent = renderMeterText(opts, null, cfg.meterCount);
        }
      }, 250);
      return;
    }

    if (frames.length < 2 && !cursorCarets.length) return;
    const ms = intervalMs(opts, preset);
    const loop = () => {
      advanceFrame();
      frameTimer = timerHost.setTimeout(loop, ms);
    };
    frameTimer = timerHost.setTimeout(loop, ms);
  };

  if (preset.renderer === 'matrix-frame') {
    root.classList.add('kt-loading-terminal--quad-dots');
    if (opts.asciiOnly) {
      frames = QUAD_FALLBACK.slice();
      frameNode = node('span', 'kt-loading-terminal__frame kt-loading-terminal__frame--multiline', frames[0]);
      root.appendChild(frameNode);
    } else {
      const wrap = node('span', 'terminal-spinner terminal-spinner--quad-dots');
      for (let i = 0; i < 4; i += 1) {
        const dot = node('span', 'quad-dot kt-loading-terminal__quad-dot');
        dot.dataset.index = String(i);
        if (opts.dotShape === 'square') dot.classList.add('is-square');
        wrap.appendChild(dot);
        quadDots.push(dot);
      }
      root.appendChild(wrap);
    }
  } else if (preset.renderer === 'compound-frame') {
    const cfg = preset.compound || {};
    const wantSpinner = opts.showSpinner !== false;
    const labelText = String(opts.text ?? opts.label ?? 'Running');
    const wantLabel = opts.showLabel !== false && labelText !== '';
    const wantStatus = opts.showStatus !== false;
    const compound = node('span', 'kt-loading-terminal__compound');
    const spinnerSlot = node('span', 'kt-loading-terminal__compound-spinner');
    compoundLabel = node('span', 'kt-loading-terminal__compound-label', labelText);
    compoundStatus = node('span', 'kt-loading-terminal__compound-status', '');
    if (wantSpinner) compound.appendChild(spinnerSlot);
    if (wantLabel) compound.appendChild(compoundLabel);
    if (wantStatus) compound.appendChild(compoundStatus);
    root.appendChild(compound);
    if (!wantStatus) compoundStatus = null;
    const subPreset = wantSpinner ? getTerminalFramePreset(cfg.spinner || 'braille') : null;
    if (subPreset) {
      const subRoot = node('span', 'kt-loading kt-loading--terminal');
      spinnerSlot.appendChild(subRoot);
      nestedSpinner = mountTerminalFrameSpinner(subRoot, subPreset, {
        ...opts,
        direction: opts.direction,
        frameInterval: opts.frameInterval ?? subPreset.defaultInterval
      });
    }
    if (cfg.showMeter && compoundStatus) {
      compoundStatus.textContent = renderMeterText(opts, null, cfg.meterCount);
      // Reserve exactly what the meter needs so the slot does not jitter as the
      // percentage grows from 9% to 100%, and no more: the demo used to hardcode
      // 17ch for this preset, sized for a 10-cell bar, so a shorter bar left a
      // dead reservation that pushed the compound to 252px inside a 240px stage.
      // 2 brackets + 1 space + 4 for "100%" on top of the cell count.
      const cells = Math.round(clampNumber(Number(opts.dotCount ?? cfg.meterCount ?? 10), 5, 40));
      root.style.setProperty('--kt-terminal-status-width', `${cells + 7}ch`);
    }
  } else {
    const multiline = preset.renderer === 'multiline-frame';
    frameNode = node('i', `kt-loading-terminal__frame${multiline ? ' kt-loading-terminal__frame--multiline' : ''}`, frames[0] || '');
    if (multiline) frameNode.style.whiteSpace = 'pre';
    root.appendChild(frameNode);
  }
  if (preset.renderer === 'cursor-frame') {
    const parts = cursorParts(preset.id, opts);
    frameNode.textContent = '';
    frameNode.classList.add('kt-loading-terminal__frame--cursor');
    frameNode.appendChild(node('span', 'kt-loading-terminal__cursor-label', parts.label));
    const carets = parts.mode === 'ellipsis' ? 3 : 1;
    cursorCarets = [];
    for (let index = 0; index < carets; index += 1) {
      const caret = node('i', 'kt-loading-terminal__caret', parts.caret);
      frameNode.appendChild(caret);
      cursorCarets.push(caret);
    }
    cursorMode = parts.mode;
    paintCursor(0);
  }

  scheduleFrames();

  return {
    restart() {
      frameIndex = 0;
      quadHead = 0;
      elapsedStart = timerHost.performance?.now?.() ?? Date.now();
      if (frames[0] != null) applyTextFrame(frames[0]);
      nestedSpinner?.restart?.();
      scheduleFrames();
    },
    setState(state) {
      framePaused = state !== 'running';
      nestedSpinner?.setState?.(state);
      if (framePaused) stopTimers();
      else scheduleFrames();
    },
    render(progress) {
      // Scanner is a real progress bar now: a reported percentage rebuilds the
      // beam to that fraction and freezes the animation, so `trackPromise()`,
      // `onProgress` and a manual `progress` option all drive it the same way
      // the arc, the bar and the Terminal Meter are driven.
      if (preset.id === 'scanner') {
        const pct = clamp(Number(progress) || 0, 0, 100);
        opts.progress = pct;
        frames = buildScannerFrames(opts, reversed);
        frameIndex = 0;
        applyTextFrame(frames[0]);
        // One frame means nothing left to animate; scheduleFrames() bails.
        scheduleFrames();
        return;
      }
      if (preset.renderer !== 'compound-frame' || !compoundStatus) return;
      const cfg = preset.compound || {};
      const pct = clamp(Number(progress) || 0, 0, 100);
      if (cfg.showMeter) {
        compoundStatus.textContent = renderMeterText(opts, pct, cfg.meterCount);
      } else if (cfg.showElapsed) {
        // Keep the running clock, swap in the freshly reported percentage.
        opts.progress = pct;
      }
    },
    destroy() {
      stopTimers();
      nestedSpinner?.destroy?.();
      nestedSpinner = null;
    },
    getSnapshot() {
      return {
        presetId: preset.id,
        renderer: preset.renderer,
        frameIndex,
        reversed,
        interval: intervalMs(opts, preset),
        frames: frames.slice()
      };
    }
  };
}

export function mountLegacyCharFrames(root, styleKey, opts, _controls) {
  const chars = TERMINAL_FRAME_LEGACY_PRESETS[styleKey];
  if (!chars) return null;
  const frames = Array.from(chars);
  const frameNode = node('i', 'kt-loading-terminal__frame', frames[0]);
  root.appendChild(frameNode);
  root.classList.add(`kt-loading-terminal--${styleKey}`);

  let frameIndex = 0;
  let frameTimer = null;
  let framePaused = false;
  const timerHost = root.ownerDocument?.defaultView || globalThis;
  const reversed = opts.direction === 'reverse' || opts.direction === 'rtl';

  const stopFrames = () => {
    if (frameTimer != null) timerHost.clearTimeout(frameTimer);
    frameTimer = null;
  };
  const scheduleFrames = () => {
    stopFrames();
    if (framePaused || frames.length < 2) return;
    const interval = Math.max(40, Number(opts.frameInterval ?? (Number(opts.motionDuration ?? 1.1) * 1000 / 12)));
    frameTimer = timerHost.setTimeout(() => {
      const step = reversed ? -1 : 1;
      frameIndex = (frameIndex + step + frames.length) % frames.length;
      frameNode.textContent = frames[frameIndex];
      scheduleFrames();
    }, interval);
  };
  scheduleFrames();

  return {
    restart() {
      frameIndex = 0;
      frameNode.textContent = frames[0];
      scheduleFrames();
    },
    setState(state) {
      framePaused = state !== 'running';
      if (framePaused) stopFrames();
      else scheduleFrames();
    },
    render() {},
    destroy() {
      stopFrames();
    },
    getSnapshot() {
      return { presetId: styleKey, renderer: 'text-frame', frameIndex, reversed, frames };
    }
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
