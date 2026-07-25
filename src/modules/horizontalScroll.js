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
    const smooth = opts.smooth === true ? 0.12 : (typeof opts.smooth === 'number' ? clamp(opts.smooth, 0.02, 1) : 0);

    // Wrap: <el(stage, tall)> → sticky viewport → track(holds original kids).
    const parent = el.parentNode;
    if (!parent) return null;
    const originalChildren = Array.from(el.childNodes);
    const prevStyle = el.getAttribute('style');
    const prevPosition = el.style.position;

    const viewport = document.createElement('div');
    viewport.className = 'kt-hscroll-viewport';
    const track = document.createElement('div');
    track.className = 'kt-hscroll-track';
    originalChildren.forEach((node) => track.appendChild(node));
    viewport.appendChild(track);
    el.appendChild(viewport);

    el.classList.add('kt-hscroll');
    viewport.style.cssText = `position:sticky;top:0;height:${heightCss};overflow:hidden;display:flex;align-items:center;`;
    track.style.cssText = 'display:flex;flex:0 0 auto;will-change:transform;';

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
      const scrolled = clamp(-rect.top, 0, travel);
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

    el.style.position = prevPosition || 'relative';
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
      const kids = Array.from(track.childNodes);
      kids.forEach((node) => el.insertBefore(node, viewport));
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
