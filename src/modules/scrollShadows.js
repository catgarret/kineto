import { snapshotInlineStyles } from '../utils.js';

/*
 * Scroll shadows / edge fade for a scroll container. Two modes:
 *   mode:"shadow" (default) — soft shadows at the overflowing edges that melt
 *     away as you reach each end. Pure-CSS gradient technique (no JS on scroll):
 *     "cover" gradients in the element's own background scroll WITH the content
 *     (background-attachment:local) to hide the shadow at the very edges, while
 *     the shadow gradients stay pinned (background-attachment:scroll).
 *   mode:"mask" — the content itself DISSOLVES to transparent at the overflowing
 *     edges via `mask-image`, and the fade retracts at each end (scroll-aware).
 * The shadow colour reads a `--kt-scroll-shadow` CSS variable, so it (and every
 * other property) stays fully themeable from your stylesheet.
 */
export default {
  create(el, opts = {}) {
    const axis = opts.axis === 'horizontal' ? 'horizontal' : 'vertical';
    const size = Math.max(4, Number(opts.size ?? 44));
    const mode = opts.mode === 'mask' ? 'mask' : 'shadow';
    const horizontal = axis === 'horizontal';
    const transition = Math.max(0, Number(opts.transition ?? 180));
    let lastState = null;
    const readState = () => {
      const position = horizontal ? el.scrollLeft : el.scrollTop;
      const max = Math.max(0, horizontal ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight);
      return {
        axis,
        position,
        max,
        progress: max > 0 ? position / max : 0,
        atStart: position <= 1,
        atEnd: max <= 1 || position >= max - 1,
        canScrollStart: position > 1,
        canScrollEnd: max > 1 && position < max - 1
      };
    };
    const publishState = () => {
      const state = readState();
      el.classList.toggle('kt-at-start', state.atStart);
      el.classList.toggle('kt-at-end', state.atEnd);
      el.classList.toggle('kt-can-scroll-start', state.canScrollStart);
      el.classList.toggle('kt-can-scroll-end', state.canScrollEnd);
      el.style.setProperty('--kt-scroll-shadow-progress', state.progress.toFixed(4));
      const signature = `${state.atStart}:${state.atEnd}:${state.canScrollStart}:${state.canScrollEnd}`;
      if (signature !== lastState) {
        lastState = signature;
        opts.onChange?.(state, el);
        el.dispatchEvent(new CustomEvent('kineto:scroll-shadows-change', { detail: state }));
      }
      return state;
    };

    if (horizontal) { if (getComputedStyle(el).overflowX === 'visible') el.style.overflowX = 'auto'; }
    else if (getComputedStyle(el).overflowY === 'visible') el.style.overflowY = 'auto';

    // ── Mask mode: dissolve the edges, scroll-aware ─────────────────────────
    if (mode === 'mask') {
      const restore = snapshotInlineStyles(el, ['maskImage', 'webkitMaskImage', 'overflowX', 'overflowY']);
      const dir = horizontal ? 'to right' : 'to bottom';
      let frame = null;
      let currentStart = null;
      let currentEnd = null;
      let targetStart = 0;
      let targetEnd = 0;
      const paint = () => {
        frame = null;
        const pos = horizontal ? el.scrollLeft : el.scrollTop;
        const max = horizontal ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight;
        // Ramp the fade proportionally over the first/last `size` px of travel so
        // it grows in and out smoothly instead of snapping on/off.
        targetStart = Math.max(0, Math.min(size, pos));
        targetEnd = Math.max(0, Math.min(size, max - pos));
        if (currentStart == null || transition === 0) {
          currentStart = targetStart;
          currentEnd = targetEnd;
        } else {
          const smoothing = Math.min(1, 32 / transition);
          currentStart += (targetStart - currentStart) * smoothing;
          currentEnd += (targetEnd - currentEnd) * smoothing;
        }
        const value = `linear-gradient(${dir}, transparent 0, #000 ${currentStart.toFixed(2)}px, #000 calc(100% - ${currentEnd.toFixed(2)}px), transparent 100%)`;
        el.style.maskImage = value;
        el.style.webkitMaskImage = value;
        publishState();
        if (Math.abs(targetStart - currentStart) > 0.1 || Math.abs(targetEnd - currentEnd) > 0.1) frame = requestAnimationFrame(paint);
      };
      const onScroll = () => { if (frame == null) frame = requestAnimationFrame(paint); };
      paint();
      el.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      return {
        el,
        type: 'scrollShadows',
        get state() { return readState(); },
        refresh() { paint(); return readState(); },
        pause() {}, resume() {},
        destroy() {
          if (frame != null) cancelAnimationFrame(frame);
          el.removeEventListener('scroll', onScroll);
          window.removeEventListener('resize', onScroll);
          el.classList.remove('kt-at-start', 'kt-at-end', 'kt-can-scroll-start', 'kt-can-scroll-end');
          el.style.removeProperty('--kt-scroll-shadow-progress');
          restore();
        }
      };
    }

    // ── Shadow mode: pure-CSS edge shadows ──────────────────────────────────
    const shade = Math.round(size * 0.34);
    const computedBg = typeof getComputedStyle !== 'undefined' ? getComputedStyle(el).backgroundColor : '';
    const opaque = computedBg && computedBg !== 'rgba(0, 0, 0, 0)' && computedBg !== 'transparent';
    const cover = `var(--kt-scroll-shadow-cover, ${opts.color || (opaque ? computedBg : 'Canvas')})`;
    // Themeable base colour (`--kt-scroll-shadow` overrides from CSS), with an
    // optional `opacity` (0..1) mixed in for quick strength control.
    const shadowBase = `var(--kt-scroll-shadow, ${opts.shadow || 'rgba(0, 0, 0, 0.24)'})`;
    const op = Math.max(0, Math.min(1, Number(opts.opacity ?? 1)));
    const shadow = op < 1 ? `color-mix(in srgb, ${shadowBase} ${Math.round(op * 100)}%, transparent)` : shadowBase;
    // `shape:"linear"` uses a straight edge gradient; default is the soft radial bloom.
    const linear = opts.shape === 'linear';

    const restore = snapshotInlineStyles(el, [
      'backgroundImage', 'backgroundRepeat', 'backgroundSize', 'backgroundPosition',
      'backgroundAttachment', 'backgroundColor', 'overflowX', 'overflowY'
    ]);

    const covers = horizontal
      ? [`linear-gradient(to right, ${cover} 30%, rgba(0,0,0,0))`,
         `linear-gradient(to left, ${cover} 30%, rgba(0,0,0,0))`]
      : [`linear-gradient(${cover} 30%, rgba(0,0,0,0))`,
         `linear-gradient(rgba(0,0,0,0), ${cover} 70%)`];
    const shadows = linear
      ? (horizontal
        ? [`linear-gradient(to right, ${shadow}, rgba(0,0,0,0))`,
           `linear-gradient(to left, ${shadow}, rgba(0,0,0,0))`]
        : [`linear-gradient(to bottom, ${shadow}, rgba(0,0,0,0))`,
           `linear-gradient(to top, ${shadow}, rgba(0,0,0,0))`])
      : (horizontal
        ? [`radial-gradient(farthest-side at 0 50%, ${shadow}, rgba(0,0,0,0))`,
           `radial-gradient(farthest-side at 100% 50%, ${shadow}, rgba(0,0,0,0))`]
        : [`radial-gradient(farthest-side at 50% 0, ${shadow}, rgba(0,0,0,0))`,
           `radial-gradient(farthest-side at 50% 100%, ${shadow}, rgba(0,0,0,0))`]);

    el.style.backgroundImage = [...covers, ...shadows].join(', ');
    el.style.backgroundRepeat = 'no-repeat';
    el.style.backgroundColor = cover;
    if (horizontal) {
      el.style.backgroundSize = `var(--kt-scroll-shadow-size, ${size}px) 100%, var(--kt-scroll-shadow-size, ${size}px) 100%, var(--kt-scroll-shadow-shade, ${shade}px) 100%, var(--kt-scroll-shadow-shade, ${shade}px) 100%`;
      el.style.backgroundAttachment = 'local, local, scroll, scroll';
      el.style.backgroundPosition = 'left center, right center, left center, right center';
    } else {
      el.style.backgroundSize = `100% var(--kt-scroll-shadow-size, ${size}px), 100% var(--kt-scroll-shadow-size, ${size}px), 100% var(--kt-scroll-shadow-shade, ${shade}px), 100% var(--kt-scroll-shadow-shade, ${shade}px)`;
      el.style.backgroundAttachment = 'local, local, scroll, scroll';
      el.style.backgroundPosition = 'center top, center bottom, center top, center bottom';
    }

    const onScroll = () => publishState();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    publishState();

    return {
      el,
      type: 'scrollShadows',
      get state() { return readState(); },
      refresh() { return publishState(); },
      pause() {}, resume() {},
      destroy() {
        el.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
        el.classList.remove('kt-at-start', 'kt-at-end', 'kt-can-scroll-start', 'kt-can-scroll-end');
        el.style.removeProperty('--kt-scroll-shadow-progress');
        restore();
      }
    };
  },
  reduced(el, opts) { return this.create(el, opts); }
};
