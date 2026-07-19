import { snapshotInlineStyles } from '../utils.js';

export default {
  create(el, opts) {
    const restore = snapshotInlineStyles(el, ['position', 'overflow', 'isolation']);
    const computed = getComputedStyle(el);
    if (computed.position === 'static') el.style.position = 'relative';
    if (opts.unbounded !== true) el.style.overflow = 'hidden';
    el.style.isolation = 'isolate';

    const ripples = new Set();
    const color = opts.color || 'currentColor';
    const opacity = Math.max(0, Math.min(1, Number(opts.opacity ?? 0.22)));
    const duration = Math.max(80, Number(opts.duration ?? 520));
    const scale = Math.max(1, Number(opts.scale ?? 1));

    const onPointerDown = (event) => {
      if (event.button != null && event.button !== 0) return;
      const rect = el.getBoundingClientRect();
      const centered = opts.centered === true;
      const x = centered ? rect.width / 2 : event.clientX - rect.left;
      const y = centered ? rect.height / 2 : event.clientY - rect.top;
      const radius = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y)) * scale;
      const ripple = document.createElement('span');
      ripple.className = 'kt-ripple-wave';
      ripple.setAttribute('aria-hidden', 'true');
      ripple.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${radius * 2}px;height:${radius * 2}px;border-radius:50%;background:${color};opacity:${opacity};pointer-events:none;transform:translate(-50%,-50%) scale(0);transform-origin:center;z-index:0;will-change:transform,opacity;`;
      el.appendChild(ripple);
      ripples.add(ripple);
      const animation = ripple.animate([
        { transform: 'translate(-50%,-50%) scale(0)', opacity },
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 0 }
      ], { duration, easing: opts.easing || 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' });
      animation.finished.catch(() => {}).finally(() => {
        ripples.delete(ripple);
        ripple.remove();
      });
    };

    el.addEventListener('pointerdown', onPointerDown);
    return {
      el,
      type: 'ripple',
      pause() { ripples.forEach((node) => node.getAnimations().forEach((animation) => animation.pause())); },
      resume() { ripples.forEach((node) => node.getAnimations().forEach((animation) => animation.play())); },
      destroy() {
        el.removeEventListener('pointerdown', onPointerDown);
        ripples.forEach((node) => {
          node.getAnimations().forEach((animation) => animation.cancel());
          node.remove();
        });
        ripples.clear();
        restore();
      }
    };
  },
  reduced(el, opts) {
    if (opts.disableInReducedMotion !== false) return { el, type: 'ripple', pause() {}, resume() {}, destroy() {} };
    return this.create(el, { ...opts, duration: Math.min(160, Number(opts.duration ?? 160)) });
  }
};
