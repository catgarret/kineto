import { G, ST, snapshotInlineStyles } from '../utils.js';

export default {
  create(el, opts) {
    const gsap = G();
    const scrollTrigger = ST();
    if (!gsap || !scrollTrigger) return this.fallback(el, opts);

    const restore = snapshotInlineStyles(el, ['transform', 'willChange']);
    const speed = opts.speed ?? 0.5;
    const axis = opts.axis || 'y';
    const distance = (opts.distance ?? 200) * Math.abs(speed);
    const from = { [axis]: speed < 0 ? distance : -distance };
    const to = {
      [axis]: speed < 0 ? -distance : distance,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: opts.start || 'top bottom',
        end: opts.end || 'bottom top',
        scrub: opts.scrub ?? true,
        invalidateOnRefresh: true,
        onUpdate: opts.onUpdate ? (self) => opts.onUpdate(self.progress, el, self) : undefined
      }
    };

    el.style.willChange = 'transform';
    const tween = gsap.fromTo(el, from, to);
    return {
      el,
      type: 'parallax',
      pause: () => tween.pause(),
      resume: () => tween.resume(),
      destroy: () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        restore();
      }
    };
  },

  reduced(el) {
    const restore = snapshotInlineStyles(el, ['transform']);
    const gsap = G();
    if (gsap) gsap.set(el, { x: 0, y: 0 });
    else el.style.transform = 'none';
    return { el, type: 'parallax', pause() {}, resume() {}, destroy: restore };
  },

  // No GSAP/ScrollTrigger on the page → drive the same translate from a native
  // passive scroll listener (rAF-throttled) so parallax still works everywhere,
  // e.g. reverse-scrolling columns. Honours axis + speed sign (negative = slower
  // / opposite direction).
  fallback(el, opts = {}) {
    const restore = snapshotInlineStyles(el, ['transform', 'willChange']);
    const axis = opts.axis === 'x' ? 'x' : 'y';
    const speed = Number(opts.speed ?? 0.5);
    const distance = (Number(opts.distance ?? 200)) * speed;
    el.style.willChange = 'transform';
    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      // 0 as the element enters from the bottom, 1 as it leaves past the top.
      const progress = (vh - rect.top) / (vh + rect.height);
      const value = (progress - 0.5) * 2 * -distance;
      el.style.transform = axis === 'x' ? `translate3d(${value}px,0,0)` : `translate3d(0,${value}px,0)`;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return {
      el,
      type: 'parallax',
      pause() { window.removeEventListener('scroll', onScroll); },
      resume() { window.addEventListener('scroll', onScroll, { passive: true }); },
      destroy() {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
        restore();
      }
    };
  }
};
