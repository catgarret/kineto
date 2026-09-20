import { G, gsapEaseName, observeOnce, renderTextLineBreaks, segmentText, snapshotAttributes, snapshotChildNodes, snapshotInlineStyles, ST, textWithLineBreaks } from '../utils.js';

export default {
  create(el, opts) {
    const gsap = G();
    const scrollTrigger = ST();
    const restoreContent = snapshotChildNodes(el);
    const restoreAttributes = snapshotAttributes(el, ['aria-label']);
    const text = textWithLineBreaks(el);
    el.setAttribute('aria-label', text);
    el.innerHTML = '';

    const chars = segmentText(text).map((char) => {
      if (/^\s$/.test(char)) {
        const whitespace = char === '\n' ? document.createElement('br') : document.createTextNode(char);
        if (char === '\n') whitespace.setAttribute('aria-hidden', 'true');
        el.appendChild(whitespace);
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
    // native 경로는 글자를 setTimeout 으로 차례로 띄웁니다. 일시정지가 그 예약을 멈추지
    // 않으면, 탭을 숨겨도(Kineto 는 그때 인스턴스를 멈춘다고 약속합니다) 글자는 계속
    // 나타납니다. 그래서 예약을 **남은 지연과 함께** 들고 있다가 resume 때 그만큼만
    // 다시 겁니다 — 처음부터 다시 시작하면 이미 나타난 글자가 다시 튑니다.
    const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const pending = new Set();
    let pausedAt = 0;

    const schedule = (run, delay) => {
      const entry = { run, runAt: now() + delay };
      entry.id = setTimeout(() => { pending.delete(entry); run(); }, delay);
      pending.add(entry);
    };

    const clearTimers = () => {
      pending.forEach((entry) => clearTimeout(entry.id));
      pending.clear();
      pausedAt = 0;
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
        schedule(() => {
          char.style.transition = `filter ${duration}s ease, opacity ${duration}s ease`;
          char.style.filter = 'blur(0)';
          char.style.opacity = '1';
          if (index === chars.length - 1) { releaseWillChange(); opts.onComplete?.(); }
        }, stagger * index * 1000);
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
      pause: () => {
        tween?.pause();
        if (pausedAt || !pending.size) return;
        pausedAt = now();
        pending.forEach((entry) => clearTimeout(entry.id));
      },
      resume: () => {
        tween?.resume();
        if (!pausedAt) return;
        const held = now() - pausedAt;
        pausedAt = 0;
        pending.forEach((entry) => {
          entry.runAt += held;
          entry.id = setTimeout(() => { pending.delete(entry); entry.run(); }, Math.max(0, entry.runAt - now()));
        });
      },
      destroy: () => {
        observer?.disconnect();
        clearTimers();
        tween?.scrollTrigger?.kill();
        tween?.kill();
        restoreContent();
        restoreAttributes();
      }
    };
  },

  reduced(el) {
    const restoreContent = snapshotChildNodes(el);
    const restoreAttributes = snapshotAttributes(el, ['aria-label']);
    const restore = snapshotInlineStyles(el, ['opacity', 'filter']);
    el.setAttribute('aria-label', textWithLineBreaks(el));
    renderTextLineBreaks(el);
    el.style.opacity = '1';
    el.style.filter = 'none';
    return {
      el,
      type: 'blurText',
      pause() {},
      resume() {},
      destroy() {
        restoreContent();
        restoreAttributes();
        restore();
      }
    };
  }
};
