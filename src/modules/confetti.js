import { clamp, env } from '../utils.js';

// Confetti burst — a lightweight canvas particle celebration fired on click
// (default), on init (`trigger:"auto"`), or manually via instance.fire().
// One shared full-viewport canvas per instance, aria-hidden and pointer-through;
// the rAF loop stops (and the canvas is removed) once every particle has died,
// so nothing runs at rest. Skipped entirely under reduced motion.
export default {
  create(el, opts = {}) {
    const environment = env();
    const trigger = opts.trigger || 'click';
    const count = clamp(Math.round(Number(opts.count ?? 90)), 4, 400);
    const spread = clamp(Number(opts.spread ?? 62), 5, 180);
    const duration = Math.max(0.4, Number(opts.duration ?? 1.8));
    const gravity = Number(opts.gravity ?? 0.9);
    const scalar = clamp(Number(opts.scalar ?? 1), 0.3, 4);
    const zIndex = Number(opts.zIndex ?? 11000);
    const palette = (Array.isArray(opts.colors) && opts.colors.length)
      ? opts.colors
      : (typeof opts.colors === 'string' && opts.colors.trim())
        ? opts.colors.split(',').map((c) => c.trim())
        : ['#ff5b1c', '#ffd166', '#2ec16b', '#4aa8ff', '#c86bff'];

    let canvas = null;
    let context = null;
    let particles = [];
    let rafId = null;
    let lastTime = 0;

    const ensureCanvas = () => {
      if (canvas) return;
      canvas = document.createElement('canvas');
      canvas.setAttribute('aria-hidden', 'true');
      canvas.style.cssText = `position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:${zIndex};`;
      const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      context = canvas.getContext('2d', { alpha: true, desynchronized: true });
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      document.body.appendChild(canvas);
    };

    const tick = (time) => {
      const dt = lastTime ? Math.min(48, time - lastTime) / 16.67 : 1;
      lastTime = time;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      let alive = 0;
      for (const p of particles) {
        if (p.life <= 0) continue;
        alive += 1;
        p.life -= dt / (duration * 60);
        p.vy += gravity * 0.28 * dt;
        p.vx *= 0.99;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.spin * dt;
        context.globalAlpha = clamp(p.life, 0, 1);
        context.fillStyle = p.color;
        context.save();
        context.translate(p.x, p.y);
        context.rotate(p.rotation);
        context.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        context.restore();
      }
      context.globalAlpha = 1;
      if (alive > 0) { rafId = requestAnimationFrame(tick); }
      else { rafId = null; canvas?.remove(); canvas = null; context = null; particles = []; }
    };

    const fire = (originX, originY) => {
      if (environment.reducedMotion) return;
      ensureCanvas();
      const rect = el.getBoundingClientRect();
      const ox = originX ?? (rect.left + rect.width / 2);
      const oy = originY ?? (rect.top + rect.height / 2);
      const base = -Math.PI / 2; // upward
      for (let i = 0; i < count; i += 1) {
        const angle = base + (Math.random() - 0.5) * (spread * Math.PI / 180) * 2;
        const speed = (5 + Math.random() * 6) * scalar;
        particles.push({
          x: ox, y: oy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: (6 + Math.random() * 6) * scalar,
          color: palette[(Math.random() * palette.length) | 0],
          rotation: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.4,
          life: 1
        });
      }
      if (rafId == null) { lastTime = 0; rafId = requestAnimationFrame(tick); }
    };

    const onClick = (event) => fire(event.clientX, event.clientY);
    if (trigger === 'click') el.addEventListener('click', onClick);
    else if (trigger === 'auto') fire();

    return {
      el,
      type: 'confetti',
      fire: (x, y) => fire(x, y),
      replay: () => fire(),
      pause() {},
      resume() {},
      destroy() {
        if (trigger === 'click') el.removeEventListener('click', onClick);
        if (rafId != null) cancelAnimationFrame(rafId);
        rafId = null;
        canvas?.remove();
        canvas = null;
        particles = [];
      }
    };
  },
  // Reduced motion: the celebration is decorative — do nothing.
  reduced(el) {
    return { el, type: 'confetti', fire() {}, replay() {}, pause() {}, resume() {}, destroy() {} };
  }
};
