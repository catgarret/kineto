import {
  G,
  gsapEaseName,
  hangulFrames,
  normalizeTextLineBreaks,
  observeOnce,
  renderTextLineBreaks,
  segmentText,
  snapshotAttributes,
  snapshotChildNodes,
  scramblePainter,
  labelStaticText,
  srText,
  textWithLineBreaks,
  timeMs,
  wordBox,
  wordSink
} from '../utils.js';

function lineBreak() {
  const br = document.createElement('br');
  br.setAttribute('aria-hidden', 'true');
  return br;
}

// Whitespace ends the current word: it goes to the element itself, not into a
// word box, so it stays a place where the line may wrap.
function appendWhitespace(sink, content) {
  normalizeTextLineBreaks(content).split(/(\n)/).forEach((part) => {
    if (!part) return;
    sink.gap(part === '\n' ? lineBreak() : document.createTextNode(part));
  });
}

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

// Whether a GSAP tween or a WAAPI player is moving (or waiting out its delay)
// right now — the only ones pause() stops and resume() starts again. A finished
// player must stay finished: play() on it starts it over.
function isRunning(animation) {
  if (typeof animation.paused === 'function') return !animation.paused() && animation.progress() < 1;
  return animation.playState === 'running';
}

export default {
  // Kineto.config({ defer: true }) may create this only when the element nears
  // the viewport (src/deferCreate.js): it only matters where it can be seen.
  defer: true,
  // A looping reveal (decode/shuffle `loop`, flicker `flickerLoop`) never ends,
  // so the core pauses it while off screen (see `offscreen` in src/core.js).
  offscreen: (options) => (options.flickerLoop === true || options.loop === true ? 'pause' : null),
  create(el, opts) {
    const restoreContent = snapshotChildNodes(el);
    const text = normalizeTextLineBreaks(opts.text ?? textWithLineBreaks(el));
    const mode = opts.mode || opts.preset || 'stream';
    const speed = Number(opts.speed ?? (mode === 'stream' ? 30 : mode === 'hangul' ? 80 : 100));
    const delay = Number(opts.delay ?? 0);
    const gsap = G();
    // Steps waiting on a timeout. pause() stops the timeouts but keeps the
    // steps with the time each had left, so resume() continues where the text
    // stopped (it used to wipe the text and reveal it again from the start).
    const pending = new Set();
    // Live animations only: a WAAPI player leaves as soon as it ends, so the
    // ambient flicker loop no longer piles up a player every second or two.
    const animations = new Set();
    // What pause() stopped, for resume() to start again (nothing else).
    let pausedAnimations = [];
    let pausedAt = 0;
    let observer = null;
    let alive = true;
    let started = false;
    // The element has been on screen (the IntersectionObserver fired). Until
    // then resume() must not start anything.
    let entered = false;
    let destroyed = false;
    let generation = 0;

    el.innerHTML = '';
    // The glyphs are aria-hidden; screen readers read this one text node.
    const screenReaderText = srText(el, text);

    const arm = (entry, milliseconds) => {
      entry.id = setTimeout(() => {
        pending.delete(entry);
        if (alive) entry.callback();
      }, milliseconds);
    };
    const later = (callback, milliseconds) => {
      const entry = { callback, runAt: now() + milliseconds, id: 0 };
      pending.add(entry);
      // While paused the step only waits in the list; resume() arms it.
      if (alive) arm(entry, milliseconds);
    };

    const track = (animation) => {
      animations.add(animation);
      animation.finished?.catch(() => {}).then(() => animations.delete(animation));
      return animation;
    };

    const clearWork = () => {
      generation += 1;
      pending.forEach((entry) => clearTimeout(entry.id));
      pending.clear();
      pausedAt = 0;
      animations.forEach((animation) => {
        if (typeof animation.kill === 'function') animation.kill();
        else animation.cancel?.();
      });
      animations.clear();
      pausedAnimations = [];
    };

    const resumeAnimation = (animation) => {
      if (typeof animation.resume === 'function') animation.resume();
      else animation.play?.();
    };

    const addSpan = (content, styles = {}) => {
      const span = document.createElement('span');
      span.textContent = content;
      span.setAttribute('aria-hidden', 'true');
      span.style.display = 'inline-block';
      Object.assign(span.style, styles);
      return span;
    };

    const complete = () => { if (alive && !destroyed) opts.onComplete?.(el); };

    const renderHangul = () => {
      const chars = segmentText(text);
      let charIndex = 0;
      const cursor = addSpan('');
      el.appendChild(cursor);
      // The half-typed syllable rides in the current word box, so the cursor
      // never wraps to the next line on its own and then jumps back.
      let word = null;

      const nextChar = () => {
        if (charIndex >= chars.length) {
          cursor.remove();
          complete();
          return;
        }
        const char = chars[charIndex];
        if (/^\s$/.test(char)) {
          if (word) { word.after(cursor); word = null; }
          if (char === '\n') cursor.before(lineBreak());
          else cursor.before(document.createTextNode(char));
          charIndex += 1;
          later(nextChar, speed);
          return;
        }
        if (!word) {
          word = wordBox();
          cursor.before(word);
          word.appendChild(cursor);
        }
        const frames = hangulFrames(char);
        let frameIndex = 0;
        const nextFrame = () => {
          cursor.textContent = frames[frameIndex];
          frameIndex += 1;
          if (frameIndex < frames.length) {
            later(nextFrame, speed);
          } else {
            cursor.before(addSpan(char));
            cursor.textContent = '';
            charIndex += 1;
            later(nextChar, speed);
          }
        };
        nextFrame();
      };
      later(nextChar, delay * 1000);
    };

    const renderBounce = () => {
      const sink = wordSink(el);
      const spans = segmentText(text).map((char) => {
        if (/^\s$/.test(char)) {
          appendWhitespace(sink, char);
          return null;
        }
        return sink.add(addSpan(char, { opacity: '0', transformOrigin: 'bottom' }));
      }).filter(Boolean);

      if (gsap) {
        gsap.set(spans, { y: 20, scaleY: 0.5, opacity: 0 });
        track(gsap.to(spans, {
          y: 0,
          scaleY: 1,
          opacity: 1,
          duration: Number(opts.duration ?? 0.8),
          stagger: Number(opts.stagger ?? 0.04),
          ease: opts.ease ? gsapEaseName(opts.ease) : 'elastic.out(1, 0.4)',
          delay,
          onComplete: complete
        }));
      } else {
        spans.forEach((span, index) => later(() => {
          span.style.transition = 'opacity .4s var(--kt-ease-ui, ease), transform .4s var(--kt-ease-ui, ease)';
          span.style.opacity = '1';
          span.style.transform = 'none';
          if (index === spans.length - 1) complete();
        }, delay * 1000 + index * Number(opts.stagger ?? 0.04) * 1000));
      }
    };

    const renderStream = () => {
      let tokens;
      if (mode === 'word') tokens = text.split(/(\n|[^\S\n]+)/);
      else if (mode === 'line') tokens = text.split(/(\n)/);
      else tokens = segmentText(text);

      const spans = [];
      const sink = wordSink(el);
      tokens.forEach((token) => {
        if (!token) return;
        if (/^\s+$/.test(token)) {
          appendWhitespace(sink, token);
          return;
        }
        const wrapper = addSpan('', { overflow: 'hidden', verticalAlign: 'bottom', paddingBottom: '2px' });
        const inner = addSpan(token, { opacity: '0', transform: 'translateY(100%)' });
        wrapper.appendChild(inner);
        sink.add(wrapper);
        spans.push(inner);
      });

      if (gsap) {
        track(gsap.to(spans, {
          y: '0%',
          opacity: 1,
          duration: Number(opts.duration ?? 0.6),
          stagger: Number(opts.stagger ?? 0.05),
          ease: opts.ease ? gsapEaseName(opts.ease) : 'power3.out',
          delay,
          onComplete: complete
        }));
      } else {
        spans.forEach((span, index) => later(() => {
          span.style.transition = 'opacity .5s var(--kt-ease-ui, ease), transform .5s var(--kt-ease-ui, ease)';
          span.style.opacity = '1';
          span.style.transform = 'translateY(0)';
          if (index === spans.length - 1) complete();
        }, delay * 1000 + index * Number(opts.stagger ?? 0.05) * 1000));
      }
    };

    // ── RF-style type decode: characters appear in order, each flickering
    // through a few random glyphs before settling (built from live text, no
    // hand-written per-char markup needed). ─────────────────────────────────
    const renderDecode = () => {
      const charset = String(opts.chars || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/\\|=+*#');
      const scramblePaint = scramblePainter({ rainbow: opts.rainbow, rainbowColors: opts.rainbowColors, scrambleFade: opts.scrambleFade });
      const flickerFrames = Math.max(1, Math.round(Number(opts.flickerCount ?? 3)));
      // Seconds (≤ 20) or milliseconds — see utils.timeMs.
      const hold = Math.max(200, timeMs(opts.hold, 1400));
      const cells = segmentText(text).map((char) => {
        if (char === '\n') {
          return { span: lineBreak(), char, space: true, break: true };
        }
        if (/^\s$/.test(char)) {
          const gapSpan = addSpan(' ', { width: '0.45em' });
          return { span: gapSpan, char, space: true };
        }
        const span = addSpan(char, { visibility: 'hidden' });
        return { span, char, space: false };
      });
      const sink = wordSink(el);
      cells.forEach(({ span, space }) => (space ? sink.gap(span) : sink.add(span)));

      let index = 0;
      const step = () => {
        if (!alive) return;
        if (index >= cells.length) {
          complete();
          if (opts.loop === true) {
            later(() => {
              cells.forEach(({ span, space }) => { if (!space) span.style.visibility = 'hidden'; });
              index = 0;
              later(step, speed);
            }, hold);
          }
          return;
        }
        const cell = cells[index];
        index += 1;
        if (cell.space) { later(step, cell.break ? 0 : speed * 0.6); return; }
        cell.span.style.visibility = 'visible';
        let frame = 0;
        const flick = () => {
          if (!alive) return;
          if (frame < flickerFrames) {
            cell.span.textContent = charset[Math.floor(Math.random() * charset.length)];
            scramblePaint?.paint(cell.span);
            frame += 1;
            later(flick, Math.max(16, speed * 0.45));
          } else {
            cell.span.textContent = cell.char;
            scramblePaint?.clear(cell.span);
            later(step, speed);
          }
        };
        flick();
      };
      later(step, delay * 1000);
    };

    // ── Callisto-style mechanical flicker: every character blinks on with an
    // irregular strobe before holding, optionally re-flickering forever. ────
    const renderFlicker = () => {
      const currentGeneration = generation;
      const duration = Math.max(0.1, Number(opts.duration ?? 0.9)) * 1000;
      const sink = wordSink(el);
      const spans = segmentText(text).map((char) => {
        if (/^\s$/.test(char)) {
          appendWhitespace(sink, char);
          return null;
        }
        return sink.add(addSpan(char, { opacity: '0' }));
      }).filter(Boolean);
      const strobe = (span, settleVisible = true) => {
        const blinks = 2 + Math.floor(Math.random() * 3);
        const frames = [{ opacity: 0 }];
        for (let blink = 0; blink < blinks; blink += 1) {
          frames.push({ opacity: 1, offset: Math.min(0.92, (blink + 0.4) / (blinks + 1)) });
          frames.push({ opacity: Math.random() * 0.25, offset: Math.min(0.96, (blink + 0.8) / (blinks + 1)) });
        }
        frames.push({ opacity: settleVisible ? 1 : 0 });
        const player = span.animate(frames, {
          duration: duration * (0.55 + Math.random() * 0.7),
          delay: Math.random() * duration * 0.6 + delay * 1000,
          easing: 'steps(1, end)',
          fill: 'both'
        });
        return track(player);
      };
      // Flicker is a mechanical strobe — no color scramble here (decode only).
      let done = 0;
      spans.forEach((span) => {
        strobe(span).finished.then(() => {
          // A fulfilled native `finished` promise can already be queued when
          // replay/destroy cancels its animation. Ignore that previous run.
          if (currentGeneration !== generation) return;
          done += 1;
          if (done === spans.length) complete();
        }).catch(() => {});
      });
      // Ambient machine hum: a random glyph re-flickers now and then.
      if (opts.flickerLoop === true) {
        const ambient = () => {
          if (!alive) return;
          const span = spans[Math.floor(Math.random() * spans.length)];
          if (span) {
            const player = span.animate([
              { opacity: 1 }, { opacity: 0.15, offset: 0.3 }, { opacity: 1, offset: 0.5 },
              { opacity: 0.4, offset: 0.7 }, { opacity: 1 }
            ], { duration: 260 + Math.random() * 240, easing: 'steps(1, end)' });
            track(player);
          }
          later(ambient, 500 + Math.random() * 1800);
        };
        later(ambient, duration + 600);
      }
    };

    // ── Shuffle: every character scrambles at once, then the word resolves
    // left→right (merged from the former standalone `shuffle` module). ────────
    const renderShuffle = () => {
      const charset = String(opts.chars || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*');
      const scramblePaint = scramblePainter({ rainbow: opts.rainbow, rainbowColors: opts.rainbowColors, scrambleFade: opts.scrambleFade });
      const shuffleSpeed = Math.max(12, Number(opts.speed ?? 34));
      const revealRate = Math.max(1, Number(opts.revealRate ?? 2));
      const graphemes = segmentText(text);
      const sink = wordSink(el);
      const cells = graphemes.map((char) => {
        if (/^\s$/.test(char)) { appendWhitespace(sink, char); return null; }
        return sink.add(addSpan(char, { textAlign: 'center' }));
      });
      // Lock each cell to its final width so scrambled glyphs never reflow lines.
      cells.forEach((span) => { if (span) span.style.width = `${Math.ceil(span.getBoundingClientRect().width * 100) / 100}px`; });
      let revealed = 0;
      let tick = 0;
      const paintFrame = () => {
        cells.forEach((span, i) => {
          if (!span) return;
          if (i < revealed) { span.textContent = graphemes[i]; scramblePaint?.clear(span); }
          else { span.textContent = charset[Math.floor(Math.random() * charset.length)] || graphemes[i]; scramblePaint?.paint(span); }
        });
      };
      const step = () => {
        if (!alive) return;
        paintFrame();
        tick += 1;
        if (tick % revealRate === 0) revealed += 1;
        if (revealed >= graphemes.length) {
          cells.forEach((span, i) => { if (span) { span.textContent = graphemes[i]; scramblePaint?.clear(span); } });
          complete();
          if (opts.loop === true) later(() => { revealed = 0; tick = 0; step(); }, Math.max(200, timeMs(opts.hold, 1400)));
          return;
        }
        later(step, shuffleSpeed);
      };
      paintFrame();
      later(step, delay * 1000);
    };

    const start = () => {
      if (started || !alive) return;
      started = true;
      if (mode === 'hangul') renderHangul();
      else if (mode === 'bounce') renderBounce();
      else if (mode === 'decode') renderDecode();
      else if (mode === 'flicker') renderFlicker();
      else if (mode === 'shuffle') renderShuffle();
      else renderStream();
    };

    observer = observeOnce(el, () => { entered = true; start(); }, {
      threshold: Number(opts.threshold ?? 0.2),
      rootMargin: opts.rootMargin || '0px'
    });

    const reset = () => {
      if (destroyed) return;
      clearWork();
      el.innerHTML = '';
      screenReaderText.attach();
      alive = true;
      started = false;
      start();
    };

    return {
      el,
      type: 'textReveal',
      replay: reset,
      pause: () => {
        if (destroyed || !alive) return;
        alive = false;
        pausedAt = now();
        pending.forEach((entry) => clearTimeout(entry.id));
        pausedAnimations = [...animations].filter(isRunning);
        pausedAnimations.forEach((animation) => animation.pause());
      },
      resume: () => {
        if (destroyed || alive) return;
        alive = true;
        pausedAnimations.forEach(resumeAnimation);
        pausedAnimations = [];
        const held = pausedAt ? now() - pausedAt : 0;
        pausedAt = 0;
        pending.forEach((entry) => {
          entry.runAt += held;
          arm(entry, Math.max(0, entry.runAt - now()));
        });
        // It came on screen while paused: begin now. Before that, and after
        // the reveal is done, there is nothing to resume.
        if (entered && !started) start();
      },
      destroy: () => {
        if (destroyed) return;
        destroyed = true;
        alive = false;
        observer?.disconnect();
        clearWork();
        screenReaderText.restore();
        restoreContent();
      }
    };
  },

  reduced(el, opts = {}) {
    const restoreContent = snapshotChildNodes(el);
    const restoreAttributes = snapshotAttributes(el, ['aria-label']);
    const text = normalizeTextLineBreaks(opts.text ?? textWithLineBreaks(el));
    labelStaticText(el, text);
    if (opts.text != null) el.textContent = text;
    renderTextLineBreaks(el);
    return {
      el,
      type: 'textReveal',
      pause() {},
      resume() {},
      destroy() {
        restoreContent();
        restoreAttributes();
      }
    };
  }
};
