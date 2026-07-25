import { env } from '../utils.js';

// FLIP layout animations — when the container's children move, resize, are
// added, removed or reordered, they animate smoothly from their old box to the
// new one (First-Last-Invert-Play). Auto-watches via MutationObserver (`watch`);
// or drive it manually with instance.record() before a change and
// instance.play() after. Options: duration, ease, stagger, item (child
// selector). Reduced motion: layout still updates, just without the tween.
export default {
  create(el, opts = {}) {
    const reduce = env().reducedMotion;
    const duration = Math.max(0, Number(opts.duration ?? 0.4));
    const ease = opts.ease || 'cubic-bezier(.22,.8,.3,1)';
    const stagger = Math.max(0, Number(opts.stagger ?? 0));
    const itemSelector = opts.item || null;

    const items = () => itemSelector
      ? Array.from(el.querySelectorAll(itemSelector))
      : Array.from(el.children);

    let firstRects = new WeakMap();
    let seen = new WeakSet();
    const record = () => {
      firstRects = new WeakMap();
      seen = new WeakSet();
      items().forEach((item) => { firstRects.set(item, item.getBoundingClientRect()); seen.add(item); });
    };

    const play = () => {
      if (reduce || duration === 0) { record(); return; }
      let i = 0;
      items().forEach((item) => {
        const first = firstRects.get(item);
        const last = item.getBoundingClientRect();
        if (!first || !seen.has(item)) {
          // Newly added item: soft enter.
          item.animate([{ opacity: 0, transform: 'scale(.92)' }, { opacity: 1, transform: 'none' }],
            { duration: duration * 1000, easing: ease, delay: i * stagger * 1000 });
          i += 1;
          return;
        }
        const dx = first.left - last.left;
        const dy = first.top - last.top;
        const sx = last.width ? first.width / last.width : 1;
        const sy = last.height ? first.height / last.height : 1;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01) return;
        item.animate(
          [{ transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` }, { transform: 'none' }],
          { duration: duration * 1000, easing: ease, delay: i * stagger * 1000 }
        );
        i += 1;
      });
      record();
    };

    let observer = null;
    if (opts.watch !== false && typeof MutationObserver !== 'undefined') {
      // firstRects holds positions from before this mutation (recorded on init
      // and after each play), so playing now animates old → new correctly.
      observer = new MutationObserver(() => play());
      observer.observe(el, { childList: true, subtree: false });
    }
    record();

    return {
      el,
      type: 'flip',
      record,
      play,
      pause() { observer?.disconnect(); },
      resume() { if (observer && opts.watch !== false) observer.observe(el, { childList: true, subtree: false }); },
      destroy() { observer?.disconnect(); observer = null; }
    };
  },
  reduced(el, opts) { return this.create(el, opts); }
};
