import { clamp, lerp, snapshotInlineStyles, ST } from '../utils.js';

export default {
  // Suspended by the core while the element is off screen (see SYSTEM
  // SUSPENSION in src/core.js) — a jump-scroll used to spring every instance on
  // the page, visible or not. A page that listens to onUpdate keeps it running:
  // that callback may drive something that IS on screen.
  offscreen: (opts) => (typeof opts.onUpdate === 'function' ? null : 'pause'),
  create(el, opts = {}) {
    const scrollTrigger = ST();
    if (!scrollTrigger) return null;
    const mode = opts.mode || opts.preset || opts.effect || 'skew';
    const axis = opts.axis === 'x' ? 'x' : 'y';
    const reverse = opts.reverse === true ? -1 : 1;
    const maxSkew = Math.max(0, Number(opts.maxSkew ?? 8));
    const maxBlur = Math.max(0, Number(opts.maxBlur ?? 0));
    const distance = Math.max(0, Number(opts.distance ?? 48));
    const maxRotate = Math.max(0, Number(opts.maxRotate ?? 4));
    const maxScale = Math.max(0, Number(opts.maxScale ?? 0.08));
    const divisor = Math.max(100, Number(opts.velocityDivisor ?? 2200));
    const spring = opts.spring !== false && opts.elastic !== false;
    const smoothing = clamp(Number(opts.smoothing ?? 0.16), 0.01, 1);
    const decay = clamp(Number(opts.decay ?? 0.08), 0.001, 1);
    const stiffness = Math.max(1, Number(opts.stiffness ?? 170));
    const damping = Math.max(0.1, Number(opts.damping ?? 24));
    const mass = Math.max(0.05, Number(opts.mass ?? 1));
    const response = clamp(Number(opts.response ?? 1), 0.05, 4);
    const restore = snapshotInlineStyles(el, ['transform', 'filter', 'willChange']);
    el.style.willChange = maxBlur ? 'transform,filter' : 'transform';

    let target = 0;
    let current = 0;
    let currentVelocity = 0;
    let alive = true;
    let destroyed = false;
    let rafId = null;
    let lastTime = performance.now();

    const apply = (value) => {
      const translate = value * distance;
      const skew = value * maxSkew;
      const rotate = value * maxRotate;
      const scale = 1 + Math.abs(value) * maxScale;
      let transform;
      if (mode === 'translate') transform = axis === 'x' ? `translate3d(${translate}px,0,0)` : `translate3d(0,${translate}px,0)`;
      else if (mode === 'rotate') transform = `rotate(${rotate}deg)`;
      else if (mode === 'scale') transform = `scale(${scale})`;
      else if (mode === 'combo') {
        const translatePart = axis === 'x' ? `translate3d(${translate}px,0,0)` : `translate3d(0,${translate}px,0)`;
        transform = `${translatePart} skew${axis === 'x' ? 'Y' : 'X'}(${skew}deg) rotate(${rotate}deg) scale(${scale})`;
      } else transform = `skew${axis === 'x' ? 'Y' : 'X'}(${skew}deg)`;
      el.style.transform = transform;
      if (maxBlur) el.style.filter = `blur(${Math.abs(value) * maxBlur}px)`;
      opts.onUpdate?.(value, el);
    };

    const tick = (time) => {
      rafId = null;
      if (!alive) return;
      const dt = Math.min(0.05, Math.max(0.001, (time - lastTime) / 1000));
      lastTime = time;
      if (spring) {
        const force = -stiffness * (current - target);
        const dampingForce = -damping * currentVelocity;
        const acceleration = (force + dampingForce) / mass;
        currentVelocity += acceleration * dt;
        current += currentVelocity * dt;
        target = lerp(target, 0, decay);
      } else {
        current = lerp(current, target, smoothing);
        target = lerp(target, 0, decay);
        currentVelocity = 0;
      }
      // Include velocity: a spring crossing zero can still carry momentum.
      const settled = Math.abs(current) < 0.0001 && Math.abs(target) < 0.0001
        && Math.abs(currentVelocity) < 0.0001;
      if (settled) current = target = currentVelocity = 0;
      apply(current);
      if (!settled) wake();
    };
    const wake = () => {
      if (!alive || rafId != null) return;
      rafId = requestAnimationFrame(tick);
    };
    const trigger = scrollTrigger.create({
      trigger: opts.global === true ? document.documentElement : el,
      start: opts.start || (opts.global === true ? 0 : 'top bottom'),
      end: opts.end || (opts.global === true ? 'max' : 'bottom top'),
      onUpdate: (self) => {
        if (destroyed) return;
        if (rafId == null) lastTime = performance.now();
        target = clamp(self.getVelocity() / divisor, -1, 1) * reverse * response;
        opts.onDirection?.(self.direction, el, self);
        wake();
      }
    });

    wake();
    const pause = () => {
      alive = false;
      if (rafId != null) cancelAnimationFrame(rafId);
      rafId = null;
    };

    return {
      el,
      type: 'scrollVelocity',
      get value() { return current; },
      pause,
      resume() { if (!alive && !destroyed) { alive = true; lastTime = performance.now(); wake(); } },
      destroy() {
        if (destroyed) return;
        destroyed = true;
        pause();
        trigger.kill();
        restore();
      }
    };
  },
  reduced() {}
};
