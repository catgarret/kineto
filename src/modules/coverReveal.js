import { clamp, env } from '../utils.js';

// Cover reveal — a coloured panel (or two, layered) covers the element and then
// sweeps away to reveal it when it scrolls into view. The classic
// agency/portfolio "block reveal" (e.g. designnas nomos). Rich options: panel
// colour(s), sweep direction, play duration, start delay, easing, layer count
// and per-layer stagger. Reduced motion reveals instantly with no panels.
export default {
  create(el, opts = {}) {
    const reduce = env().reducedMotion;
    const color = opts.color || '#ff5b1c';
    const color2 = opts.color2 || '#12141a';
    const direction = ['left', 'right', 'up', 'down'].includes(opts.direction) ? opts.direction : 'right';
    const duration = Math.max(0.05, Number(opts.duration ?? 0.7));
    const delay = Math.max(0, Number(opts.delay ?? 0));
    const ease = opts.ease || 'cubic-bezier(.77,0,.18,1)';
    const layers = clamp(Math.round(Number(opts.layers ?? 2)), 1, 3);
    const stagger = Math.max(0, Number(opts.stagger ?? 120));

    // Wrap the element so panels can be positioned over it without disturbing
    // the surrounding layout.
    const cs = getComputedStyle(el);
    const inline = el.tagName === 'IMG' || cs.display.startsWith('inline');
    const wrap = document.createElement('div');
    wrap.className = 'kt-cover-wrap';
    wrap.style.cssText = `position:relative;overflow:hidden;display:${inline ? 'inline-block' : 'block'};`;
    el.parentNode.insertBefore(wrap, el);
    wrap.appendChild(el);

    const exitTransform = {
      right: 'translateX(101%)', left: 'translateX(-101%)',
      down: 'translateY(101%)', up: 'translateY(-101%)'
    }[direction];

    const panels = [];
    if (!reduce) {
      for (let i = 0; i < layers; i += 1) {
        const panel = document.createElement('div');
        panel.setAttribute('aria-hidden', 'true');
        const c = layers > 1 && i === layers - 1 ? color2 : color;
        panel.style.cssText = `position:absolute;inset:0;background:${c};z-index:${20 + i};transform:translate(0,0);transition:transform ${duration}s ${ease};pointer-events:none;will-change:transform;`;
        wrap.appendChild(panel);
        panels.push(panel);
      }
    }

    let played = false;
    let io = null;
    let timers = [];
    const play = () => {
      if (played) return;
      played = true;
      // Ensure the covered start frame is painted, then trigger the transitions
      // on the next frame — otherwise a 0ms delay jumps instead of animating.
      void wrap.offsetWidth;
      requestAnimationFrame(() => {
        // Top layer leaves first, lower layers follow, uncovering the element.
        panels.forEach((panel, i) => {
          const order = layers - 1 - i;
          timers.push(setTimeout(() => { panel.style.transform = exitTransform; }, delay + order * stagger));
        });
      });
      const total = delay + (layers - 1) * stagger + duration * 1000 + 80;
      timers.push(setTimeout(() => { panels.forEach((panel) => panel.remove()); opts.onComplete?.(el); }, total));
    };

    if (reduce) {
      // Nothing to reveal — element is already visible.
    } else if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver((records) => {
        for (const record of records) { if (record.isIntersecting) { io.disconnect(); io = null; play(); break; } }
      }, { threshold: clamp(Number(opts.threshold ?? 0.2), 0, 1) });
      io.observe(wrap);
    } else {
      play();
    }

    return {
      el,
      type: 'coverReveal',
      replay() {
        played = false;
        timers.forEach(clearTimeout); timers = [];
        if (reduce) return;
        // Rebuild panels covering, then play again.
        panels.length = 0;
        for (let i = 0; i < layers; i += 1) {
          const panel = document.createElement('div');
          const c = layers > 1 && i === layers - 1 ? color2 : color;
          panel.style.cssText = `position:absolute;inset:0;background:${c};z-index:${20 + i};transform:translate(0,0);transition:transform ${duration}s ${ease};pointer-events:none;`;
          wrap.appendChild(panel); panels.push(panel);
        }
        requestAnimationFrame(play);
      },
      pause() {},
      resume() {},
      destroy() {
        io?.disconnect();
        timers.forEach(clearTimeout);
        panels.forEach((panel) => panel.remove());
        if (wrap.parentNode) { wrap.parentNode.insertBefore(el, wrap); wrap.remove(); }
      }
    };
  },
  // Reduced motion: reveal instantly (create() already skips panels).
  reduced(el, opts) { return this.create(el, opts); }
};
