import { segmentText } from '../utils.js';

/*
 * Text transition rebuilt around a single live node: the visible text is
 * always real content in normal flow (no absolute stacking, no height
 * measuring, no animation-engine dependency), so it can never render empty.
 */
const EFFECTS = {
  'slide-up': {
    enter: [{ transform: 'translateY(0.9em)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
    leave: [{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-0.7em)', opacity: 0 }]
  },
  slide: null, // alias of slide-up, filled below
  rise: {
    enter: [{ transform: 'translateY(110%)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
    leave: [{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-110%)', opacity: 0 }],
    clip: true
  },
  fade: {
    enter: [{ opacity: 0 }, { opacity: 1 }],
    leave: [{ opacity: 1 }, { opacity: 0 }]
  },
  blur: {
    enter: [{ opacity: 0, filter: 'blur(14px)' }, { opacity: 1, filter: 'blur(0px)' }],
    leave: [{ opacity: 1, filter: 'blur(0px)' }, { opacity: 0, filter: 'blur(12px)' }]
  },
  scale: {
    enter: [{ opacity: 0, transform: 'scale(.82)' }, { opacity: 1, transform: 'scale(1)' }],
    leave: [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.12)' }]
  },
  clip: {
    // -webkit-clip-path mirrors keep the clip animation working on iOS Safari.
    enter: [{ clipPath: 'inset(0 100% 0 0)', webkitClipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)', webkitClipPath: 'inset(0 0 0 0)' }],
    leave: [{ clipPath: 'inset(0 0 0 0)', webkitClipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 0 100%)', webkitClipPath: 'inset(0 0 0 100%)' }]
  }
};
EFFECTS.slide = EFFECTS['slide-up'];

export default {
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
    // Honor the contracted tuning options on their matching effects.
    const blurAmount = Math.max(0, Number(opts.blur ?? 14));
    EFFECTS.blur.enter[0].filter = `blur(${blurAmount}px)`;
    EFFECTS.blur.leave[1].filter = `blur(${Math.round(blurAmount * 0.85)}px)`;
    EFFECTS.scale.enter[0].transform = `scale(${Math.max(0.1, Number(opts.startScale ?? 0.82))})`;
    EFFECTS.scale.leave[1].transform = `scale(${Math.max(0.1, Number(opts.endScale ?? 1.12))})`;
    const duration = Math.max(50, Number(opts.duration ?? 0.55) * (Number(opts.duration ?? 0.55) <= 20 ? 1000 : 1));
    const hold = Math.max(0, Number(opts.pause ?? opts.hold ?? 1600));
    const loop = opts.loop !== false;
    // Dissolve is inherently per-character.
    const charMode = opts.charMode === true || dissolve;
    const stagger = Math.max(0, Number(opts.stagger ?? 0.035)) * 1000;
    const jitterAmp = Math.max(0, Number(opts.jitter ?? 5));

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

    const effect = dissolve ? EFFECTS.fade : EFFECTS[effectName];
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
        segmentText(value).forEach((char) => {
          if (/^\s$/.test(char)) {
            inner.appendChild(document.createTextNode(char));
            return;
          }
          const span = document.createElement('span');
          span.style.cssText = 'display:inline-block;will-change:transform,opacity;';
          span.textContent = char;
          inner.appendChild(span);
        });
      } else {
        inner.textContent = value;
      }
    };

    const charSpans = () => Array.from(inner.querySelectorAll('span'));

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
        spans.forEach((span, spanIndex) => {
          const player = animate(span, dissolve ? dissolveFrames(true) : effect.enter, {
            duration,
            delay: dissolve ? Math.random() * duration * 0.5 : spanIndex * Math.min(stagger, 900 / Math.max(1, spans.length)),
            easing: dissolve ? `steps(${2 + Math.floor(Math.random() * 3)}, end)` : (typeof opts.ease === 'string' && opts.ease.includes('(') ? opts.ease : 'cubic-bezier(.22,.8,.3,1)')
          });
          player.finished.then(() => {
            finished += 1;
            if (finished === spans.length) onDone?.();
          }).catch(() => {});
        });
      } else {
        animate(inner, effect.enter, { duration, easing: 'cubic-bezier(.22,.8,.3,1)' })
          .finished.then(() => onDone?.()).catch(() => {});
      }
    };

    const leave = (onDone) => {
      if (charMode) {
        const spans = charSpans().reverse();
        let finished = 0;
        if (!spans.length) { onDone?.(); return; }
        spans.forEach((span, spanIndex) => {
          const player = animate(span, dissolve ? dissolveFrames(false) : effect.leave, {
            duration: duration * 0.55,
            delay: dissolve ? Math.random() * duration * 0.35 : spanIndex * Math.min(stagger * 0.6, 500 / Math.max(1, spans.length)),
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
  }
};
