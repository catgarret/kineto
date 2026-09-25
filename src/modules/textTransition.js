import { cssEase, segmentText, timeMs, wordSink } from '../utils.js';

/*
 * Text transition rebuilt around a single live node: the visible text is
 * always real content in normal flow (no absolute stacking, no height
 * measuring, no animation-engine dependency), so it can never render empty.
 */
// Each effect is a pair of keyframe lists (enter, leave), or a function of the
// instance's options that builds one. Tunable effects (blur, scale) are
// functions so every instance gets FRESH keyframes: this table used to be
// edited in place from create(), so the last element created decided the
// blur amount and scales of every other Text Transition on the page.
//
// Optional fields an effect may add:
//   clip       — the wrapper hides overflow (the text moves out of its box)
//   perChar    — the effect only exists per character (charMode is forced on)
//   easing     — the enter easing is part of the effect (pop's spring)
//   quickLeave — the old text leaves in one short fade instead of a stagger
//   defaults   — duration / stagger used when the page gives none
const EFFECTS = {
  'slide-up': {
    enter: [{ transform: 'translateY(0.9em)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
    leave: [{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-0.7em)', opacity: 0 }]
  },
  // `slide` used to be `EFFECTS.slide = EFFECTS['slide-up']` — literally the same
  // object, so the two presets were indistinguishable on screen and in the
  // settings panel. Replaced with the one mechanism this table was missing:
  // everything else moves in the plane, this one rotates out of it.
  flip: {
    enter: [
      { transform: 'perspective(600px) rotateX(-72deg)', opacity: 0 },
      { transform: 'perspective(600px) rotateX(0deg)', opacity: 1 }
    ],
    leave: [
      { transform: 'perspective(600px) rotateX(0deg)', opacity: 1 },
      { transform: 'perspective(600px) rotateX(58deg)', opacity: 0 }
    ],
    clip: true
  },
  rise: {
    enter: [{ transform: 'translateY(110%)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
    leave: [{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-110%)', opacity: 0 }],
    clip: true
  },
  fade: {
    enter: [{ opacity: 0 }, { opacity: 1 }],
    leave: [{ opacity: 1 }, { opacity: 0 }]
  },
  blur: (opts) => {
    const amount = Math.max(0, Number(opts.blur ?? 14));
    return {
      enter: [{ opacity: 0, filter: `blur(${amount}px)` }, { opacity: 1, filter: 'blur(0px)' }],
      leave: [{ opacity: 1, filter: 'blur(0px)' }, { opacity: 0, filter: `blur(${Math.round(amount * 0.85)}px)` }]
    };
  },
  scale: (opts) => ({
    enter: [{ opacity: 0, transform: `scale(${Math.max(0.1, Number(opts.startScale ?? 0.82))})` }, { opacity: 1, transform: 'scale(1)' }],
    leave: [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: `scale(${Math.max(0.1, Number(opts.endScale ?? 1.12))})` }]
  }),
  clip: {
    // -webkit-clip-path mirrors keep the clip animation working on iOS Safari.
    enter: [{ clipPath: 'inset(0 100% 0 0)', webkitClipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)', webkitClipPath: 'inset(0 0 0 0)' }],
    leave: [{ clipPath: 'inset(0 0 0 0)', webkitClipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 0 100%)', webkitClipPath: 'inset(0 0 0 100%)' }]
  },
  pop: () => popEffect()
};

// ── pop ───────────────────────────────────────────────────────────────────
// Each letter springs up from small, low and tilted, overshoots a little and
// settles — the per-letter entrance seen on many product sites when a title
// changes. The motion is a damped spring (damping ratio 0.5, the familiar
// "stiffness 100 / damping 10" feel) SAMPLED into keyframes and played with a
// linear easing, so every engine plays the same curve through plain WAAPI and
// no animation library is needed. The old text leaves in one short fade.
const POP = Object.freeze({
  fromY: 0.4,          // em below the baseline at the start
  fromScale: 0.4,      // starting scale
  fromRotate: -15,     // degrees of tilt at the start
  dampingRatio: 0.5,   // < 1 overshoots; 0.5 overshoots about 16 %
  settle: 0.005,       // the spring counts as settled within 0.5 % of rest
  samples: 40,         // keyframes per letter (shared by every letter)
  duration: 1,         // seconds to settle, when the page gives none
  stagger: 0.02        // seconds between letters, when the page gives none
});

// Progress (0 → 1, overshooting) of an underdamped spring at `t`, where t = 1
// is the moment its envelope falls below POP.settle.
function springProgress(t) {
  const ratio = POP.dampingRatio;
  const root = Math.sqrt(1 - ratio * ratio);
  const natural = Math.log(1 / (POP.settle * root)) / ratio; // ω·T that makes t = 1 "settled"
  const damped = natural * root;
  const envelope = Math.exp(-ratio * natural * t);
  return 1 - envelope * (Math.cos(damped * t) + (ratio / root) * Math.sin(damped * t));
}

const popTransform = (progress) => {
  const rest = 1 - progress;
  return `translateY(${(POP.fromY * rest).toFixed(4)}em) scale(${(POP.fromScale + (1 - POP.fromScale) * progress).toFixed(4)}) rotate(${(POP.fromRotate * rest).toFixed(3)}deg)`;
};

let popFrames = null; // the keyframes never change, so they are built once
function popEffect() {
  if (!popFrames) {
    popFrames = Array.from({ length: POP.samples + 1 }, (_, step) => {
      const t = step / POP.samples;
      const progress = step === POP.samples ? 1 : springProgress(t);
      return { offset: t, opacity: Math.min(1, Math.max(0, progress)), transform: popTransform(progress) };
    });
  }
  return {
    enter: popFrames,
    leave: [{ opacity: 1, transform: popTransform(1) }, { opacity: 0, transform: 'translateY(-0.12em) scale(0.92) rotate(0deg)' }],
    perChar: true,
    easing: 'linear',
    quickLeave: true,
    defaults: { duration: POP.duration, stagger: POP.stagger }
  };
}

// Upper bound for a quick leave, so a long `duration` never makes the old text
// linger: the old line should be gone before the first new letter lands.
const QUICK_LEAVE_MS = 200;

/** The effect's keyframes for this instance (a fresh object for tunable ones). */
const resolveEffect = (name, opts) => (typeof EFFECTS[name] === 'function' ? EFFECTS[name](opts) : EFFECTS[name]);

export default {
  // Kineto.config({ defer: true }) may create this only when the element nears
  // the viewport (src/deferCreate.js): it only matters where it can be seen.
  defer: true,
  // Paused by the core while the element is off screen and resumed as it
  // returns (cycling phrases keep swapping on a timer). See `offscreen` in src/core.js.
  offscreen: 'pause',
  create(el, opts) {
    const originalHTML = el.innerHTML;
    const originalStyle = el.getAttribute('style');

    let texts = Array.isArray(opts.texts) ? opts.texts.map(String) : null;
    if (!texts) {
      const children = Array.from(el.children).map((child) => child.textContent.trim()).filter(Boolean);
      texts = children.length ? children : [String(el.textContent || '').trim()].filter(Boolean);
    }
    if (!texts.length) return null;

    const requested = opts.effect || opts.preset || 'slide-up';
    const effectName = EFFECTS[requested]
      ? requested
      : (requested === 'shimmer' || requested === 'dissolve') ? requested : 'slide-up';
    const dissolve = effectName === 'dissolve';
    // Dissolve plays per-character opacity steps over the fade keyframes;
    // shimmer has no keyframe pair at all (it builds its own sweep below).
    const effect = effectName === 'shimmer' ? null : resolveEffect(dissolve ? 'fade' : effectName, opts);
    const effectDefaults = effect?.defaults || {};
    // Both accept seconds (≤ 20) or milliseconds — see utils.timeMs.
    const duration = Math.max(50, timeMs(opts.duration ?? effectDefaults.duration, 550));
    const hold = timeMs(opts.pause ?? opts.hold, 1600);
    const loop = opts.loop !== false;
    // Dissolve and pop are inherently per-character.
    const charMode = opts.charMode === true || dissolve || effect?.perChar === true;
    const stagger = Math.max(0, Number(opts.stagger ?? effectDefaults.stagger ?? 0.035)) * 1000;
    // Per-character reveal order: ltr (left→right, default), rtl (right→left),
    // or random.
    const charDirection = ['ltr', 'rtl', 'random'].includes(opts.charDirection) ? opts.charDirection : 'ltr';
    const staggerOrder = (n) => {
      if (charDirection === 'rtl') return Array.from({ length: n }, (_, i) => n - 1 - i);
      if (charDirection === 'random') {
        const a = Array.from({ length: n }, (_, i) => i);
        for (let i = n - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
        return a;
      }
      return Array.from({ length: n }, (_, i) => i);
    };
    // Only dissolve shakes its letters.
    const jitterAmp = effectName === 'dissolve' ? Math.max(0, Number(opts.jitter ?? 5)) : 0;

    el.innerHTML = '';
    el.style.display = 'block';
    el.style.position = getComputedStyle(el).position === 'static' ? 'relative' : el.style.position;
    if (opts.minHeight) el.style.minHeight = typeof opts.minHeight === 'number' ? `${opts.minHeight}px` : String(opts.minHeight);
    else el.style.minHeight = '1.3em';

    // ── shimmer: AI-style gradient sweep over static text ───────────────────
    if (effectName === 'shimmer') {
      const inner = document.createElement('span');
      inner.textContent = texts[0];
      const base = opts.baseColor || 'currentColor';
      const shine = opts.shimColor || 'rgba(160,205,255,1)';
      inner.style.cssText = `display:inline-block;background-image:linear-gradient(100deg,${base} 38%,${shine} 50%,${base} 62%);background-size:220% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;`;
      el.appendChild(inner);
      const player = inner.animate(
        [{ backgroundPosition: '160% 0' }, { backgroundPosition: '-160% 0' }],
        { duration: Math.max(600, Number(opts.shimSpeed ?? 2.4) * 1000), iterations: Infinity, easing: 'linear' }
      );
      return {
        el,
        type: 'textTransition',
        get index() { return 0; },
        setText(value) { inner.textContent = String(value); },
        next() {},
        replay() { player.currentTime = 0; player.play(); },
        pause: () => player.pause(),
        resume: () => player.play(),
        destroy: () => {
          player.cancel();
          el.innerHTML = originalHTML;
          if (originalStyle == null) el.removeAttribute('style'); else el.setAttribute('style', originalStyle);
        }
      };
    }

    const wrap = document.createElement('span');
    wrap.style.cssText = `display:block;${effect.clip ? 'overflow:hidden;' : ''}`;
    const inner = document.createElement('span');
    inner.style.cssText = 'display:block;will-change:transform,opacity,filter;';
    inner.setAttribute('aria-live', opts.ariaLive || 'polite');
    wrap.appendChild(inner);
    el.appendChild(wrap);

    let index = 0;
    let alive = true;
    let timer = null;
    const players = new Set();

    const animate = (node, keyframes, options) => {
      const player = node.animate(keyframes, { fill: 'forwards', ...options });
      players.add(player);
      player.finished.catch(() => {}).finally(() => players.delete(player));
      return player;
    };
    const clearWork = () => {
      clearTimeout(timer);
      timer = null;
      players.forEach((player) => player.cancel());
      players.clear();
    };
    const schedule = () => {
      clearTimeout(timer);
      if (!alive || texts.length < 2) return;
      timer = setTimeout(cycle, hold);
    };

    const setContent = (value) => {
      if (charMode) {
        inner.innerHTML = '';
        // Word boxes keep each word on one line (utils.wordSink).
        const sink = wordSink(inner);
        segmentText(value).forEach((char) => {
          if (/^\s$/.test(char)) {
            sink.gap(document.createTextNode(char));
            return;
          }
          const span = document.createElement('span');
          span.className = 'kt-text-char';
          span.style.cssText = 'display:inline-block;will-change:transform,opacity;';
          span.textContent = char;
          sink.add(span);
        });
      } else {
        inner.textContent = value;
      }
    };

    // Only the characters animate — not the word boxes holding them.
    const charSpans = () => Array.from(inner.querySelectorAll('.kt-text-char'));

    // Per-character noisy dissolve frames: jitter plus stepped opacity
    // flicker in random order (no blur — it reads as glow on colored text).
    const dissolveFrames = (entering) => {
      const jx = (Math.random() - 0.5) * jitterAmp * 2;
      const jy = (Math.random() - 0.5) * jitterAmp * 1.4;
      return entering ? [
        { opacity: 0, transform: `translate(${jx}px,${jy}px)` },
        { opacity: 0.85, transform: `translate(${(-jx * 0.6).toFixed(1)}px,${(-jy * 0.6).toFixed(1)}px)`, offset: 0.45 },
        { opacity: 0.3, transform: `translate(${(jx * 0.4).toFixed(1)}px,${(jy * 0.3).toFixed(1)}px)`, offset: 0.62 },
        { opacity: 1, transform: 'translate(0,0)' }
      ] : [
        { opacity: 1, transform: 'translate(0,0)' },
        { opacity: 0.25, transform: `translate(${(jx * 0.5).toFixed(1)}px,${(jy * 0.4).toFixed(1)}px)`, offset: 0.35 },
        { opacity: 0.8, transform: `translate(${(-jx * 0.4).toFixed(1)}px,${(-jy * 0.5).toFixed(1)}px)`, offset: 0.55 },
        { opacity: 0, transform: `translate(${jx}px,${jy}px)` }
      ];
    };

    const enter = (onDone) => {
      if (charMode) {
        const spans = charSpans();
        let finished = 0;
        if (!spans.length) { onDone?.(); return; }
        const order = staggerOrder(spans.length);
        spans.forEach((span, spanIndex) => {
          const player = animate(span, dissolve ? dissolveFrames(true) : effect.enter, {
            duration,
            delay: dissolve ? Math.random() * duration * 0.5 : order[spanIndex] * Math.min(stagger, 900 / Math.max(1, spans.length)),
            easing: dissolve ? `steps(${2 + Math.floor(Math.random() * 3)}, end)` : (effect.easing || (opts.ease ? cssEase(opts.ease) : 'cubic-bezier(.22,.8,.3,1)'))
          });
          player.finished.then(() => {
            finished += 1;
            if (finished === spans.length) onDone?.();
          }).catch(() => {});
        });
      } else {
        animate(inner, effect.enter, { duration, easing: effect.easing || 'cubic-bezier(.22,.8,.3,1)' })
          .finished.then(() => onDone?.()).catch(() => {});
      }
    };

    const leave = (onDone) => {
      if (charMode) {
        const spans = charSpans().reverse();
        let finished = 0;
        if (!spans.length) { onDone?.(); return; }
        // A quick leave (pop) is one short fade for the whole line, so the new
        // text's entrance — not the old text's exit — is what reads.
        const quick = effect.quickLeave === true;
        spans.forEach((span, spanIndex) => {
          const player = animate(span, dissolve ? dissolveFrames(false) : effect.leave, {
            duration: quick ? Math.min(QUICK_LEAVE_MS, duration * 0.3) : duration * 0.55,
            delay: dissolve ? Math.random() * duration * 0.35 : quick ? 0 : spanIndex * Math.min(stagger * 0.6, 500 / Math.max(1, spans.length)),
            easing: dissolve ? `steps(${2 + Math.floor(Math.random() * 3)}, end)` : 'cubic-bezier(.5,0,.75,.4)'
          });
          player.finished.then(() => {
            finished += 1;
            if (finished === spans.length) onDone?.();
          }).catch(() => {});
        });
      } else {
        animate(inner, effect.leave, { duration: duration * 0.55, easing: 'cubic-bezier(.5,0,.75,.4)' })
          .finished.then(() => onDone?.()).catch(() => {});
      }
    };

    const cycle = () => {
      if (!alive) return;
      const nextIndex = index + 1;
      if (!loop && nextIndex >= texts.length) {
        opts.onComplete?.(el);
        return;
      }
      leave(() => {
        if (!alive) return;
        index = nextIndex % texts.length;
        setContent(texts[index]);
        opts.onChange?.(index, texts[index], el);
        enter(schedule);
      });
    };

    setContent(texts[0]);
    enter(schedule);

    return {
      el,
      type: 'textTransition',
      get index() { return index; },
      next: () => { clearTimeout(timer); cycle(); },
      replay: () => {
        clearWork();
        alive = true;
        index = 0;
        setContent(texts[0]);
        enter(schedule);
      },
      pause: () => {
        alive = false;
        clearTimeout(timer);
        players.forEach((player) => player.pause());
      },
      resume: () => {
        if (alive) return;
        alive = true;
        players.forEach((player) => player.play());
        if (!players.size) schedule();
      },
      destroy: () => {
        alive = false;
        clearWork();
        el.innerHTML = originalHTML;
        if (originalStyle == null) el.removeAttribute('style'); else el.setAttribute('style', originalStyle);
      }
    };
  },

  reduced(el) {
    const children = Array.from(el.children);
    const styles = children.map((child) => child.getAttribute('style'));
    children.forEach((child, index) => {
      child.style.display = index === 0 ? '' : 'none';
    });
    return {
      el, type: 'textTransition', pause() {}, resume() {},
      destroy() {
        children.forEach((child, index) => {
          if (styles[index] == null) child.removeAttribute('style'); else child.setAttribute('style', styles[index]);
        });
      }
    };
  },
  fallback(el, opts) { return this.reduced(el, opts); }
};
