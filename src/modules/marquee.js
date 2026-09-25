import { G, snapshotInlineStyles, ST } from '../utils.js';

export default {
  // Kineto.config({ defer: true }) may create this only when the element nears
  // the viewport (src/deferCreate.js): it only matters where it can be seen.
  defer: true,
  // Paused by the core while the element is off screen and resumed as it
  // returns (an endless strip that nobody can see is pure cost). See `offscreen` in src/core.js.
  offscreen: 'pause',
  create(el, opts) {
    const gsap = G();
    const scrollTrigger = ST();
    const originalHTML = el.innerHTML;
    const originalStyle = el.getAttribute('style');
    const speed = Math.abs(Number(opts.speed ?? 50));
    const direction = opts.direction === 'right' ? 1 : -1;
    const reverseOnScrollUp = opts.reverseOnScrollUp === true;
    const scrollAcceleration = Number(opts.scrollAcceleration ?? 0);
    const pauseOnHover = opts.pauseOnHover !== false;
    const cloneCount = Math.max(1, Number(opts.clones ?? 2));

    el.style.display = 'flex';
    el.style.overflow = 'hidden';
    el.style.whiteSpace = 'nowrap';
    // Edge fade: dissolve the left/right ends with a gradient mask so the loop
    // doesn't hard-cut at the container edges (great for logo strips / carousels).
    const fade = Math.max(0, Number(opts.fade ?? 0));
    if (fade > 0) {
      const maskValue = `linear-gradient(to right, transparent 0, #000 ${fade}px, #000 calc(100% - ${fade}px), transparent 100%)`;
      el.style.webkitMaskImage = maskValue;
      el.style.maskImage = maskValue;
    }

    const group = document.createElement('div');
    group.className = 'kt-marquee-group';
    group.style.cssText = 'display:flex;flex:0 0 auto;will-change:transform;';
    while (el.firstChild) group.appendChild(el.firstChild);
    el.appendChild(group);
    for (let index = 0; index < cloneCount; index += 1) {
      const clone = group.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      el.appendChild(clone);
    }
    const groups = Array.from(el.children);

    let baseVelocity = speed * direction;
    let targetVelocity = baseVelocity;
    let hovered = false;
    let currentVelocity = baseVelocity;
    // Cache the group width (reading offsetWidth every frame forces a layout
    // flush on the continuous loop); re-measure only on resize.
    let groupWidth = group.offsetWidth || 0;
    let position = direction < 0 ? 0 : -groupWidth;
    let alive = true;
    let rafId = null;
    let previousTime = performance.now();
    const measureWidth = () => { groupWidth = group.offsetWidth || 0; };
    const marqueeResizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measureWidth) : null;
    marqueeResizeObserver?.observe(group);

    const setX = (value) => {
      if (gsap) gsap.set(groups, { x: value });
      else groups.forEach((item) => { item.style.transform = `translate3d(${value}px,0,0)`; });
    };

    const tick = (time = performance.now()) => {
      if (!alive) return;
      const delta = Math.min(0.05, Math.max(0, (time - previousTime) / 1000));
      previousTime = time;
      const width = groupWidth;
      if (width > 0) {
        currentVelocity += (targetVelocity - currentVelocity) * Math.min(1, delta * 8);
        position += currentVelocity * delta;
        while (position <= -width) position += width;
        while (position > 0) position -= width;
        setX(position);
        // Drift back toward the base speed (scroll-boost recovery) — but never
        // while hovered, or pauseOnHover would immediately un-pause itself.
        if (!hovered) targetVelocity += (baseVelocity - targetVelocity) * Math.min(1, delta * 4);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    let velocityTrigger = null;
    // Optional scroll-reactive skew: the line leans with scroll velocity and
    // springs back, adding a living, elastic feel.
    const maxSkew = Math.max(0, Number(opts.skew ?? 0));
    let skewTarget = 0;
    let skewCurrent = 0;
    let skewRaf = null;
    // The lean only needs frames while it is springing back: a scroll update
    // wakes it, and once it is upright again it stops asking for frames.
    const skewTick = () => {
      skewRaf = null;
      if (!alive) return;
      skewTarget *= 0.9;
      skewCurrent += (skewTarget - skewCurrent) * 0.12;
      const upright = Math.abs(skewTarget) < 0.001 && Math.abs(skewCurrent) < 0.001;
      if (upright) { skewTarget = 0; skewCurrent = 0; }
      el.style.transform = `skewX(${skewCurrent.toFixed(3)}deg)`;
      if (!upright) skewRaf = requestAnimationFrame(skewTick);
    };
    const wakeSkew = () => {
      if (alive && maxSkew > 0 && skewRaf == null) skewRaf = requestAnimationFrame(skewTick);
    };
    if (scrollTrigger && (reverseOnScrollUp || scrollAcceleration > 0 || maxSkew > 0)) {
      velocityTrigger = scrollTrigger.create({
        trigger: document.documentElement,
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const scrollVelocity = self.getVelocity();
          if (reverseOnScrollUp) baseVelocity = speed * (self.direction < 0 ? 1 : -1);
          if (!hovered && (reverseOnScrollUp || scrollAcceleration > 0)) {
            targetVelocity = baseVelocity + (scrollVelocity / 50) * scrollAcceleration * -direction;
          }
          if (maxSkew > 0) {
            skewTarget = Math.max(-maxSkew, Math.min(maxSkew, (scrollVelocity / 220) * maxSkew));
            wakeSkew();
          }
        }
      });
      wakeSkew();
    }

    const onEnter = () => { hovered = true; targetVelocity = 0; };
    const onLeave = () => { hovered = false; targetVelocity = baseVelocity; };
    if (pauseOnHover) {
      el.addEventListener('pointerenter', onEnter);
      el.addEventListener('pointerleave', onLeave);
    }

    return {
      el,
      type: 'marquee',
      pause: () => {
        alive = false;
        if (rafId != null) cancelAnimationFrame(rafId);
        if (skewRaf != null) cancelAnimationFrame(skewRaf);
        skewRaf = null;
      },
      // Resume restarts the strip AND the lean (it used to stay frozen after
      // the first pause, because only the strip loop was restarted).
      resume: () => {
        if (alive) return;
        alive = true;
        previousTime = performance.now();
        rafId = requestAnimationFrame(tick);
        if (velocityTrigger) wakeSkew();
      },
      destroy: () => {
        alive = false;
        if (rafId != null) cancelAnimationFrame(rafId);
        if (skewRaf != null) cancelAnimationFrame(skewRaf);
        marqueeResizeObserver?.disconnect();
        velocityTrigger?.kill();
        el.removeEventListener('pointerenter', onEnter);
        el.removeEventListener('pointerleave', onLeave);
        el.innerHTML = originalHTML;
        if (originalStyle == null) el.removeAttribute('style'); else el.setAttribute('style', originalStyle);
      }
    };
  },
  reduced(el) {
    const restore = snapshotInlineStyles(el, ['overflowX', 'transform']);
    el.style.overflowX = 'auto';
    el.style.transform = 'none';
    return { el, type: 'marquee', pause() {}, resume() {}, destroy: restore };
  },
  fallback(el, opts) { return this.reduced(el, opts); }
};
