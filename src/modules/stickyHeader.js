import { clamp } from '../utils.js';

/*
 * Sticky header that reacts to scroll: it drops a shadow and (optionally)
 * shrinks once you've scrolled past a threshold — the classic "shrinking header"
 * / "cover card to fixed header" pattern. A `--kt-header-progress` custom
 * property (0→1 across `distance`) is always published so any bespoke scrubbed
 * styling can be wired in CSS with zero extra JS. Toggling is class-based
 * (`kt-stuck`) so it stays fully themeable and progressively enhanced.
 */
export default {
  create(el, opts = {}) {
    const offset = Math.max(0, Number(opts.offset ?? 8));
    const distance = Math.max(1, Number(opts.distance ?? 120));
    const shrink = opts.shrink !== false;
    const shadow = opts.shadow !== false;
    const activeClass = opts.activeClass || 'kt-stuck';

    el.classList.add('kt-sticky-header');
    if (shrink) el.classList.add('kt-sh-shrink');
    if (shadow) el.classList.add('kt-sh-shadow');

    // The header may live inside a scrollable panel (not just the page). Bind to
    // the nearest scrollable ancestor if there is one, else the window — so the
    // shadow/shrink react to whichever scroll actually moves the header.
    const findScrollParent = (node) => {
      let p = node.parentElement;
      while (p && p !== document.body && p !== document.documentElement) {
        const oy = getComputedStyle(p).overflowY;
        if ((oy === 'auto' || oy === 'scroll') && p.scrollHeight > p.clientHeight + 1) return p;
        p = p.parentElement;
      }
      return window;
    };
    const scrollHost = findScrollParent(el);
    const scrollY = () => (scrollHost === window
      ? (window.scrollY || document.documentElement.scrollTop || 0)
      : scrollHost.scrollTop);

    let stuck = false;
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = scrollY();
      const progress = clamp(y / distance, 0, 1);
      el.style.setProperty('--kt-header-progress', progress.toFixed(4));
      const nowStuck = y > offset;
      if (nowStuck !== stuck) {
        stuck = nowStuck;
        el.classList.toggle(activeClass, stuck);
        opts.onChange?.(stuck, progress, el);
      }
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };

    update();
    scrollHost.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return {
      el,
      type: 'stickyHeader',
      pause() { scrollHost.removeEventListener('scroll', onScroll); },
      resume() { scrollHost.addEventListener('scroll', onScroll, { passive: true }); },
      destroy() {
        scrollHost.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
        el.classList.remove('kt-sticky-header', 'kt-sh-shrink', 'kt-sh-shadow', activeClass);
        el.style.removeProperty('--kt-header-progress');
      }
    };
  }
};
