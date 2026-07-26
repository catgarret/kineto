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
    const observe = () => {
      if (observer && opts.watch !== false) observer.observe(el, { childList: true, subtree: false });
    };
    if (opts.watch !== false && typeof MutationObserver !== 'undefined') {
      // firstRects holds positions from before this mutation (recorded on init
      // and after each play), so playing now animates old → new correctly.
      observer = new MutationObserver(() => play());
      observe();
    }
    record();

    const reorder = (nextItems) => {
      observer?.disconnect();
      record();
      const fragment = document.createDocumentFragment();
      nextItems.forEach((item) => fragment.appendChild(item));
      el.appendChild(fragment);
      requestAnimationFrame(() => {
        play();
        observe();
      });
      return nextItems;
    };

    const shuffle = () => {
      const nextItems = items();
      for (let i = nextItems.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [nextItems[i], nextItems[j]] = [nextItems[j], nextItems[i]];
      }
      return reorder(nextItems);
    };

    // Sort existing children without rebuilding them, so listeners/state stay
    // intact and the move is animated through the same FLIP transaction.
    // Examples:
    //   instance.sort('asc')
    //   instance.sort('date', { key: 'date', order: 'desc' })
    //   instance.sort('category', { key: 'category', categoryOrder: ['work','lab'] })
    //   instance.sort((a, b) => Number(a.dataset.rank) - Number(b.dataset.rank))
    const sort = (strategy = 'asc', sortOptions = {}) => {
      const nextItems = items();
      if (typeof strategy === 'function') return reorder(nextItems.sort(strategy));

      const mode = String(strategy || 'asc').toLowerCase();
      const order = (sortOptions.order || (mode === 'desc' ? 'desc' : 'asc')) === 'desc' ? -1 : 1;
      const key = sortOptions.key || (mode === 'date' ? 'date' : mode === 'category' ? 'category' : '');
      const read = sortOptions.getValue || ((item) => {
        if (!key) return item.textContent?.trim() || '';
        return item.dataset?.[key] ?? item.getAttribute(`data-${key}`) ?? '';
      });
      const categoryOrder = Array.isArray(sortOptions.categoryOrder) ? sortOptions.categoryOrder : null;
      const collator = new Intl.Collator(sortOptions.locale, { numeric: true, sensitivity: 'base' });

      nextItems.sort((a, b) => {
        const av = read(a);
        const bv = read(b);
        if (mode === 'date') {
          const result = (Date.parse(av) || 0) - (Date.parse(bv) || 0);
          return result * order;
        }
        if (mode === 'category' && categoryOrder) {
          const ai = categoryOrder.indexOf(av);
          const bi = categoryOrder.indexOf(bv);
          const ar = ai < 0 ? categoryOrder.length : ai;
          const br = bi < 0 ? categoryOrder.length : bi;
          if (ar !== br) return (ar - br) * order;
        }
        return collator.compare(String(av), String(bv)) * order;
      });
      return reorder(nextItems);
    };

    return {
      el,
      type: 'flip',
      record,
      play,
      reorder,
      shuffle,
      sort,
      pause() { observer?.disconnect(); },
      resume() { observe(); },
      destroy() { observer?.disconnect(); observer = null; }
    };
  },
  reduced(el, opts) { return this.create(el, opts); }
};
