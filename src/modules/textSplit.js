import {
  G,
  gsapEaseName,
  normalizeTextLineBreaks,
  renderTextLineBreaks,
  segmentText,
  snapshotAttributes,
  snapshotChildNodes,
  snapshotInlineStyles,
  ST,
  textWithLineBreaks
} from '../utils.js';

// Per-animation from/to states. "rise" clips inside an overflow wrapper,
// "spin"/"flip" rotate every glyph in 3D, "wave" is a soft bounce-up.
const ANIMATIONS = {
  rise: { from: { y: '110%', opacity: 0 }, to: { y: 0, opacity: 1 }, wrap: true },
  wave: { from: { y: 30, opacity: 0 }, to: { y: 0, opacity: 1 } },
  fade: { from: { opacity: 0 }, to: { opacity: 1 } },
  spin: { from: { rotateY: -95, opacity: 0, y: 8 }, to: { rotateY: 0, opacity: 1, y: 0 } },
  flip: { from: { rotateX: -90, opacity: 0, y: 10 }, to: { rotateX: 0, opacity: 1, y: 0 } },
  scale: { from: { scale: 0.4, opacity: 0 }, to: { scale: 1, opacity: 1 } },
  blur: { from: { opacity: 0, filter: 'blur(10px)', y: 12 }, to: { opacity: 1, filter: 'blur(0px)', y: 0 } },
  'slide-up': { from: { y: '0.9em', opacity: 0 }, to: { y: 0, opacity: 1 } },
  'slide-down': { from: { y: '-0.9em', opacity: 0 }, to: { y: 0, opacity: 1 } },
  // anime.js home-page style: characters drift in horizontally rather than
  // rising, so a headline resolves left-to-right instead of bottom-up.
  drift: { from: { x: '0.55em', opacity: 0 }, to: { x: 0, opacity: 1 } },
  // Same drift with a horizontal squash that settles — the trailing characters
  // read as still catching up when the leading ones have landed.
  squeeze: { from: { x: '0.4em', opacity: 0, scaleX: 0.28 }, to: { x: 0, opacity: 1, scaleX: 1 } }
};

const SWAP_OUT = {
  'slide-up': { y: '-0.7em', opacity: 0 },
  'slide-down': { y: '0.7em', opacity: 0 },
  fade: { opacity: 0 },
  blur: { opacity: 0, filter: 'blur(8px)' },
  scale: { scale: 0.6, opacity: 0 },
  flip: { rotateX: 90, opacity: 0 },
  spin: { rotateY: 95, opacity: 0 },
  drift: { x: '-0.45em', opacity: 0 },
  squeeze: { x: '-0.35em', opacity: 0, scaleX: 0.28 }
};

function buildUnits(el, text, by, wrap) {
  const units = [];
  const appendBreak = () => {
    const br = document.createElement('br');
    br.setAttribute('aria-hidden', 'true');
    el.appendChild(br);
  };
  const appendWhitespace = (content) => {
    const parts = normalizeTextLineBreaks(content).split(/(\n)/);
    parts.forEach((part) => {
      if (!part) return;
      if (part === '\n') appendBreak();
      else el.appendChild(document.createTextNode(part));
    });
  };
  const addUnit = (content) => {
    const span = document.createElement('span');
    span.style.display = 'inline-block';
    span.style.transformStyle = 'preserve-3d';
    span.style.backfaceVisibility = 'hidden';
    span.setAttribute('aria-hidden', 'true');
    span.textContent = content;
    if (wrap) {
      const wrapper = document.createElement('span');
      wrapper.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;';
      wrapper.appendChild(span);
      el.appendChild(wrapper);
    } else {
      el.appendChild(span);
    }
    units.push(span);
  };

  if (by === 'word') {
    normalizeTextLineBreaks(text).split(/(\n|[^\S\n]+)/).forEach((token) => {
      if (!token) return;
      if (/^\s+$/.test(token)) appendWhitespace(token);
      else addUnit(token);
    });
  } else {
    segmentText(normalizeTextLineBreaks(text)).forEach((char) => {
      if (/^\s$/.test(char)) appendWhitespace(char);
      else addUnit(char);
    });
  }
  return units;
}

export default {
  create(el, opts) {
    const gsap = G();
    const scrollTrigger = ST();
    if (!gsap || !scrollTrigger) return null;

    const by = opts.by || 'char';
    const animationName = (typeof opts.animation === 'string' && ANIMATIONS[opts.animation]) ? opts.animation : (ANIMATIONS[opts.preset] ? opts.preset : 'rise');
    const definition = ANIMATIONS[animationName];
    const restoreContent = snapshotChildNodes(el);
    const restoreAttributes = snapshotAttributes(el, ['aria-label']);
    const originalText = textWithLineBreaks(el);
    const restoreStyle = snapshotInlineStyles(el, ['overflow', 'perspective', 'display', 'minHeight']);
    const texts = Array.isArray(opts.texts) && opts.texts.length
      ? opts.texts.map((text) => normalizeTextLineBreaks(String(text)))
      : null;
    const duration = Number(opts.duration ?? 0.8);
    const stagger = Number(opts.stagger ?? 0.03);
    const ease = opts.ease ? gsapEaseName(opts.ease) : 'power3.out';

    el.setAttribute('aria-label', texts ? texts[0] : originalText);
    el.innerHTML = '';
    if (animationName === 'spin' || animationName === 'flip') el.style.perspective = `${Number(opts.perspective ?? 600)}px`;

    let units = buildUnits(el, texts ? texts[0] : originalText, by, definition.wrap && !texts);
    let tween = null;
    let swapTimer = null;
    let textIndex = 0;
    let alive = true;

    const playIn = (onComplete) => {
      tween?.kill();
      tween = gsap.fromTo(units, { ...definition.from }, {
        ...definition.to,
        duration,
        delay: Number(opts.delay ?? 0),
        ease: animationName === 'wave' ? (opts.ease ? gsapEaseName(opts.ease) : 'back.out(2.2)') : ease,
        stagger,
        overwrite: true,
        onComplete: () => {
          opts.onComplete?.(el);
          onComplete?.();
        }
      });
      return tween;
    };

    // Soft text swap: current glyphs stagger out (slide-up + fade by
    // default), the next text staggers in with the entrance animation.
    const hold = Math.max(200, Number(opts.hold ?? opts.pause ?? 2000));
    const outDefinition = SWAP_OUT[opts.swapOut] || SWAP_OUT['slide-up'];
    const scheduleSwap = () => {
      if (!texts || texts.length < 2 || !alive) return;
      clearTimeout(swapTimer);
      swapTimer = setTimeout(() => {
        if (!alive) return;
        tween?.kill();
        tween = gsap.to(units, {
          ...outDefinition,
          duration: Math.min(0.45, duration),
          ease: opts.swapEase ? gsapEaseName(opts.swapEase) : 'power2.in',
          stagger: Math.min(0.02, stagger),
          overwrite: true,
          onComplete: () => {
            if (!alive) return;
            textIndex = (textIndex + 1) % texts.length;
            el.innerHTML = '';
            units = buildUnits(el, texts[textIndex], by, false);
            el.setAttribute('aria-label', texts[textIndex]);
            opts.onSwap?.(textIndex, texts[textIndex], el);
            playIn(scheduleSwap);
          }
        });
      }, hold);
    };

    let started = false;
    const trigger = scrollTrigger.create({
      trigger: el,
      start: opts.start || 'top 85%',
      onEnter: () => {
        if (started && opts.once !== false) return;
        started = true;
        playIn(texts ? scheduleSwap : null);
      },
      onLeaveBack: () => {
        if (opts.once === false) {
          started = false;
          clearTimeout(swapTimer);
          tween?.kill();
          gsap.set(units, { ...definition.from });
        }
      }
    });
    gsap.set(units, { ...definition.from });

    return {
      el,
      type: 'textSplit',
      get units() { return units; },
      replay: () => {
        clearTimeout(swapTimer);
        tween?.kill();
        if (texts) {
          textIndex = 0;
          el.innerHTML = '';
          units = buildUnits(el, texts[0], by, false);
          el.setAttribute('aria-label', texts[0]);
        }
        gsap.set(units, { ...definition.from });
        playIn(texts ? scheduleSwap : null);
      },
      pause: () => { tween?.pause(); clearTimeout(swapTimer); },
      resume: () => { tween?.resume(); if (texts && !tween?.isActive()) scheduleSwap(); },
      destroy: () => {
        alive = false;
        clearTimeout(swapTimer);
        trigger.kill();
        tween?.kill();
        restoreContent();
        restoreAttributes();
        restoreStyle();
      }
    };
  },

  reduced(el, opts = {}) {
    const restoreContent = snapshotChildNodes(el);
    const restoreAttributes = snapshotAttributes(el, ['aria-label']);
    const restoreStyle = snapshotInlineStyles(el, ['opacity', 'transform']);
    const firstText = Array.isArray(opts.texts) && opts.texts.length
      ? normalizeTextLineBreaks(String(opts.texts[0]))
      : textWithLineBreaks(el);
    if (Array.isArray(opts.texts) && opts.texts.length) el.textContent = firstText;
    renderTextLineBreaks(el);
    el.setAttribute('aria-label', firstText);
    el.style.opacity = '1';
    el.style.transform = 'none';
    return {
      el,
      type: 'textSplit',
      pause() {},
      resume() {},
      destroy() {
        restoreContent();
        restoreAttributes();
        restoreStyle();
      }
    };
  }
};
