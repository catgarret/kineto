import { G, gsapEaseName, observeOnce, segmentText, snapshotAttributes, snapshotInlineStyles, ST } from '../utils.js';

export default {
  create(el, opts) {
    const gsap = G();
    const scrollTrigger = ST();
    const originalHTML = el.innerHTML;
    const restoreAttributes = snapshotAttributes(el, ['aria-label']);
    const text = el.textContent || '';
    el.setAttribute('aria-label', text);
    el.innerHTML = '';

    const chars = segmentText(text).map((char) => {
      if (/^\s$/.test(char)) {
        el.appendChild(document.createTextNode(char));
        return null;
      }
      const span = document.createElement('span');
      span.style.cssText = 'display:inline-block;filter:blur(8px);opacity:0;will-change:filter,opacity;';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = char;
      el.appendChild(span);
      return span;
    }).filter(Boolean);

    const duration = opts.duration ?? 0.6;
    const stagger = opts.stagger ?? 0.03;
    let observer = null;
    let tween = null;
    const timers = new Set();

    const clearTimers = () => {
      timers.forEach(clearTimeout);
      timers.clear();
    };

    // Release the compositor hint once the one-shot entrance is done so it isn't
    // pinned for the life of the element (audit D-5). Kept while `once:false`
    // (the effect can replay/reverse on re-entry).
    const releaseWillChange = () => { if (opts.once !== false) chars.forEach((char) => { char.style.willChange = ''; }); };

    const fallbackPlay = () => {
      clearTimers();
      if (!chars.length) {
        opts.onComplete?.();
        return;
      }
      chars.forEach((char, index) => {
        const timer = setTimeout(() => {
          timers.delete(timer);
          char.style.transition = `filter ${duration}s ease, opacity ${duration}s ease`;
          char.style.filter = 'blur(0)';
          char.style.opacity = '1';
          if (index === chars.length - 1) { releaseWillChange(); opts.onComplete?.(); }
        }, stagger * index * 1000);
        timers.add(timer);
      });
    };

    if (gsap && scrollTrigger) {
      tween = gsap.to(chars, {
        filter: 'blur(0px)',
        opacity: 1,
        duration,
        stagger,
        ease: opts.ease ? gsapEaseName(opts.ease) : 'power2.out',
        onComplete: () => { releaseWillChange(); opts.onComplete?.(); },
        scrollTrigger: {
          trigger: el,
          start: opts.start || 'top 85%',
          toggleActions: opts.once === false ? 'play reverse play reverse' : 'play none none none'
        }
      });
    } else {
      observer = observeOnce(el, fallbackPlay, { threshold: 0.1 });
    }

    const replay = () => {
      if (tween) {
        tween.restart();
        return;
      }
      chars.forEach((char) => {
        char.style.filter = 'blur(8px)';
        char.style.opacity = '0';
      });
      fallbackPlay();
    };

    return {
      el,
      type: 'blurText',
      replay,
      pause: () => tween?.pause(),
      resume: () => tween?.resume(),
      destroy: () => {
        observer?.disconnect();
        clearTimers();
        tween?.scrollTrigger?.kill();
        tween?.kill();
        el.innerHTML = originalHTML;
        restoreAttributes();
      }
    };
  },

  reduced(el) {
    const restore = snapshotInlineStyles(el, ['opacity', 'filter']);
    el.style.opacity = '1';
    el.style.filter = 'none';
    return { el, type: 'blurText', pause() {}, resume() {}, destroy: restore };
  }
};
