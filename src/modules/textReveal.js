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
  textWithLineBreaks
} from '../utils.js';

function lineBreak() {
  const br = document.createElement('br');
  br.setAttribute('aria-hidden', 'true');
  return br;
}

function appendWhitespace(parent, content) {
  normalizeTextLineBreaks(content).split(/(\n)/).forEach((part) => {
    if (!part) return;
    parent.appendChild(part === '\n' ? lineBreak() : document.createTextNode(part));
  });
}

export default {
  create(el, opts) {
    const restoreContent = snapshotChildNodes(el);
    const restoreAttributes = snapshotAttributes(el, ['aria-label']);
    const text = normalizeTextLineBreaks(opts.text ?? textWithLineBreaks(el));
    const mode = opts.mode || opts.preset || 'stream';
    const speed = Number(opts.speed ?? (mode === 'stream' ? 30 : mode === 'hangul' ? 80 : 100));
    const delay = Number(opts.delay ?? 0);
    const gsap = G();
    const timers = new Set();
    const animations = [];
    let observer = null;
    let alive = true;
    let started = false;
    let destroyed = false;
    let generation = 0;

    el.setAttribute('aria-label', text);
    el.innerHTML = '';

    const later = (callback, milliseconds) => {
      const id = setTimeout(() => {
        timers.delete(id);
        if (alive) callback();
      }, milliseconds);
      timers.add(id);
      return id;
    };

    const clearWork = () => {
      generation += 1;
      timers.forEach(clearTimeout);
      timers.clear();
      animations.forEach((animation) => {
        if (typeof animation.kill === 'function') animation.kill();
        else animation.cancel?.();
      });
      animations.length = 0;
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

      const nextChar = () => {
        if (charIndex >= chars.length) {
          cursor.remove();
          complete();
          return;
        }
        const char = chars[charIndex];
        if (/^\s$/.test(char)) {
          if (char === '\n') cursor.before(lineBreak());
          else cursor.before(document.createTextNode(char));
          charIndex += 1;
          later(nextChar, speed);
          return;
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
      const spans = segmentText(text).map((char) => {
        if (/^\s$/.test(char)) {
          appendWhitespace(el, char);
          return null;
        }
        const span = addSpan(char, { opacity: '0', transformOrigin: 'bottom' });
        el.appendChild(span);
        return span;
      }).filter(Boolean);

      if (gsap) {
        gsap.set(spans, { y: 20, scaleY: 0.5, opacity: 0 });
        animations.push(gsap.to(spans, {
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
      tokens.forEach((token) => {
        if (!token) return;
        if (/^\s+$/.test(token)) {
          appendWhitespace(el, token);
          return;
        }
        const wrapper = addSpan('', { overflow: 'hidden', verticalAlign: 'bottom', paddingBottom: '2px' });
        const inner = addSpan(token, { opacity: '0', transform: 'translateY(100%)' });
        wrapper.appendChild(inner);
        el.appendChild(wrapper);
        spans.push(inner);
      });

      if (gsap) {
        animations.push(gsap.to(spans, {
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
      const hold = Math.max(200, Number(opts.hold ?? 1400));
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
      cells.forEach(({ span }) => el.appendChild(span));

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
      const spans = segmentText(text).map((char) => {
        if (/^\s$/.test(char)) {
          appendWhitespace(el, char);
          return null;
        }
        const span = addSpan(char, { opacity: '0' });
        el.appendChild(span);
        return span;
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
        animations.push(player);
        return player;
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
            animations.push(player);
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
      const cells = graphemes.map((char) => {
        if (/^\s$/.test(char)) { appendWhitespace(el, char); return null; }
        const span = addSpan(char, { textAlign: 'center' });
        el.appendChild(span);
        return span;
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
          if (opts.loop === true) later(() => { revealed = 0; tick = 0; step(); }, Math.max(200, Number(opts.hold ?? 1400)));
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

    observer = observeOnce(el, start, {
      threshold: Number(opts.threshold ?? 0.2),
      rootMargin: opts.rootMargin || '0px'
    });

    const reset = () => {
      if (destroyed) return;
      clearWork();
      el.innerHTML = '';
      alive = true;
      started = false;
      start();
    };

    return {
      el,
      type: 'textReveal',
      replay: reset,
      pause: () => {
        if (destroyed) return;
        alive = false;
        timers.forEach(clearTimeout);
        timers.clear();
        animations.forEach((animation) => animation.pause?.());
      },
      resume: () => {
        if (!destroyed && !alive) {
          alive = true;
          if (animations.length) animations.forEach(resumeAnimation);
          else reset();
        }
      },
      destroy: () => {
        if (destroyed) return;
        destroyed = true;
        alive = false;
        observer?.disconnect();
        clearWork();
        restoreContent();
        restoreAttributes();
      }
    };
  },

  reduced(el, opts = {}) {
    const restoreContent = snapshotChildNodes(el);
    const restoreAttributes = snapshotAttributes(el, ['aria-label']);
    const text = normalizeTextLineBreaks(opts.text ?? textWithLineBreaks(el));
    el.setAttribute('aria-label', text);
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
