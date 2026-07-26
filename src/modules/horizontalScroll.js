import { clamp, lerp } from '../utils.js';

/*
 * Horizontal scroll section: pin a full-height stage and translate its inner
 * track sideways as the page scrolls vertically. Universal (no GSAP needed) —
 * it drives a single transform from the stage's position in the viewport, so it
 * stays in sync with native scrolling. `smooth` eases the track for a weighty,
 * inertial feel. `destroy()` fully rebuilds the original DOM.
 */
export default {
  create(el, opts = {}) {
    const heightCss = opts.height || '100vh';
    // A shorter pinned stage should sit in the visual centre of the viewport.
    // `top` remains configurable for layouts that need a custom safe area.
    const topCss = opts.top || `calc((100svh - ${heightCss}) / 2)`;
    const smooth = opts.smooth === true ? 0.12 : (typeof opts.smooth === 'number' ? clamp(opts.smooth, 0.02, 1) : 0);

    // Wrap: <el(stage, tall)> → sticky viewport → track(holds original kids).
    const parent = el.parentNode;
    if (!parent) return null;
    const originalChildren = Array.from(el.childNodes);
    const prevStyle = el.getAttribute('style');
    const authoredTrack = el.children.length === 1
      && el.firstElementChild?.classList.contains('hscroll-track')
      ? el.firstElementChild
      : null;

    const viewport = document.createElement('div');
    viewport.className = 'kt-hscroll-viewport';
    const track = authoredTrack || document.createElement('div');
    const prevTrackStyle = track.getAttribute('style');
    if (!authoredTrack) {
      track.className = 'kt-hscroll-track';
      originalChildren.forEach((node) => track.appendChild(node));
    }
    viewport.appendChild(track);
    el.appendChild(viewport);

    el.classList.add('kt-hscroll');
    el.style.position = 'relative';
    el.style.width = '100%';
    el.style.maxWidth = '100%';
    el.style.minWidth = '0';
    el.style.boxSizing = 'border-box';
    viewport.style.cssText = `position:sticky;top:${topCss};width:100%;max-width:100%;min-width:0;height:${heightCss};overflow:hidden;display:flex;align-items:center;box-sizing:border-box;`;
    track.style.display = 'flex';
    track.style.flex = '0 0 auto';
    track.style.width = 'max-content';
    track.style.minWidth = 'max-content';
    track.style.willChange = 'transform';

    let maxX = 0;
    let targetX = 0;
    let currentX = 0;
    let rafId = null;
    let running = false;

    const measure = () => {
      const vpWidth = viewport.clientWidth;
      maxX = Math.max(0, track.scrollWidth - vpWidth);
      // Stage height = one viewport of pinning + the horizontal travel, so the
      // section scrolls through exactly its own extra width.
      el.style.height = `calc(${heightCss} + ${maxX}px)`;
    };

    const compute = () => {
      const rect = el.getBoundingClientRect();
      const vpHeight = viewport.clientHeight;
      const travel = el.offsetHeight - vpHeight;
      const stickyTop = Number.parseFloat(getComputedStyle(viewport).top) || 0;
      const scrolled = clamp(stickyTop - rect.top, 0, travel);
      const t = travel > 0 ? scrolled / travel : 0;
      targetX = t * maxX;
    };

    const apply = () => {
      currentX = smooth ? lerp(currentX, targetX, smooth) : targetX;
      track.style.transform = `translate3d(${-currentX}px,0,0)`;
      if (smooth && Math.abs(currentX - targetX) > 0.2) { rafId = requestAnimationFrame(apply); }
      else { currentX = targetX; track.style.transform = `translate3d(${-currentX}px,0,0)`; rafId = null; }
    };
    const tick = () => {
      if (!running) return;
      compute();
      if (smooth) { if (rafId == null) rafId = requestAnimationFrame(apply); }
      else apply();
    };

    let ticking = false;
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; tick(); }); } };
    const onResize = () => { measure(); tick(); };

    running = true;
    measure();
    tick();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null;
    resizeObserver?.observe(track);

    const teardown = () => {
      running = false;
      if (rafId != null) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      resizeObserver?.disconnect();
      if (authoredTrack) {
        el.insertBefore(track, viewport);
        if (prevTrackStyle == null) track.removeAttribute('style'); else track.setAttribute('style', prevTrackStyle);
      } else {
        const kids = Array.from(track.childNodes);
        kids.forEach((node) => el.insertBefore(node, viewport));
      }
      viewport.remove();
      el.classList.remove('kt-hscroll');
      if (prevStyle == null) el.removeAttribute('style'); else el.setAttribute('style', prevStyle);
    };

    return {
      el,
      type: 'horizontalScroll',
      pause() { running = false; },
      resume() { running = true; tick(); },
      destroy: teardown
    };
  },

  reduced(el) {
    // No pinning under reduced motion — leave the strip natively swipeable.
    el.style.overflowX = 'auto';
    return { el, type: 'horizontalScroll', pause() {}, resume() {}, destroy() { el.style.overflowX = ''; } };
  }
};
