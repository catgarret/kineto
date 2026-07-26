import { clamp } from '../utils.js';

// Drag — make an element draggable with a pointer. Axis lock (`axis`),
// containment to the offset parent (`bounds:"parent"`), spring-back to origin
// on release (`snapBack`), momentum after a flick (`inertia`, default on), and a
// drag handle (`handle` selector). Keyboard-accessible: focus + arrow keys nudge
// (Shift = larger step). Reduced motion keeps drag but drops momentum.
export default {
  create(el, opts = {}) {
    const axis = ['x', 'y', 'both'].includes(opts.axis) ? opts.axis : 'both';
    const bounds = opts.bounds; // 'parent' | undefined
    const snapBack = opts.snapBack === true;
    const inertia = opts.inertia !== false && !snapBack;
    const handle = opts.handle ? (el.querySelector(opts.handle) || el) : el;

    const prevTransform = el.style.transform;
    const prevTransition = el.style.transition;
    const prevTouch = el.style.touchAction;
    const prevCursor = handle.style.cursor;
    el.style.touchAction = axis === 'x' ? 'pan-y' : axis === 'y' ? 'pan-x' : 'none';
    handle.style.cursor = 'grab';

    let x = 0; let y = 0;
    let dragging = false;
    let sx = 0; let sy = 0; let ox = 0; let oy = 0;
    let lastX = 0; let lastY = 0; let lastT = 0; let vx = 0; let vy = 0; let raf = null;

    const range = () => {
      if (bounds !== 'parent') return null;
      const parent = el.offsetParent || el.parentElement;
      if (!parent) return null;
      const pr = parent.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      const baseLeft = er.left - x; const baseTop = er.top - y;
      return {
        minX: pr.left - baseLeft, maxX: pr.right - (baseLeft + er.width),
        minY: pr.top - baseTop, maxY: pr.bottom - (baseTop + er.height)
      };
    };
    const setPos = (nx, ny) => {
      if (axis === 'y') nx = 0;
      if (axis === 'x') ny = 0;
      const r = range();
      if (r) { nx = clamp(nx, r.minX, r.maxX); ny = clamp(ny, r.minY, r.maxY); }
      x = nx; y = ny;
      el.style.transform = `translate(${x}px, ${y}px)`;
    };

    const onDown = (e) => {
      if (e.button != null && e.button !== 0) return;
      dragging = true;
      el.style.transition = 'none';
      handle.style.cursor = 'grabbing';
      sx = e.clientX; sy = e.clientY; ox = x; oy = y;
      lastX = e.clientX; lastY = e.clientY; lastT = performance.now();
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    };
    const onMove = (e) => {
      if (!dragging) return;
      setPos(ox + (e.clientX - sx), oy + (e.clientY - sy));
      const now = performance.now();
      const dt = now - lastT || 16;
      vx = (e.clientX - lastX) / dt; vy = (e.clientY - lastY) / dt;
      lastX = e.clientX; lastY = e.clientY; lastT = now;
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      handle.style.cursor = 'grab';
      if (snapBack) {
        el.style.transition = 'transform .42s cubic-bezier(.22,.8,.3,1)';
        setPos(0, 0);
      } else if (inertia && (Math.abs(vx) > 0.02 || Math.abs(vy) > 0.02)) {
        const decay = () => {
          vx *= 0.92; vy *= 0.92;
          setPos(x + vx * 16, y + vy * 16);
          if (Math.abs(vx) > 0.02 || Math.abs(vy) > 0.02) raf = requestAnimationFrame(decay); else raf = null;
        };
        raf = requestAnimationFrame(decay);
      }
    };
    const onKey = (e) => {
      const step = e.shiftKey ? 20 : 6;
      let moved = true;
      el.style.transition = 'transform .12s var(--kt-ease-ui, ease)';
      if (e.key === 'ArrowLeft') setPos(x - step, y);
      else if (e.key === 'ArrowRight') setPos(x + step, y);
      else if (e.key === 'ArrowUp') setPos(x, y - step);
      else if (e.key === 'ArrowDown') setPos(x, y + step);
      else moved = false;
      if (moved) e.preventDefault();
    };

    handle.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
    el.addEventListener('keydown', onKey);

    return {
      el,
      type: 'drag',
      reset() { el.style.transition = 'transform .42s cubic-bezier(.22,.8,.3,1)'; setPos(0, 0); },
      pause() {}, resume() {},
      destroy() {
        if (raf) cancelAnimationFrame(raf);
        handle.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        el.removeEventListener('keydown', onKey);
        el.style.transform = prevTransform;
        el.style.transition = prevTransition;
        el.style.touchAction = prevTouch;
        handle.style.cursor = prevCursor;
      }
    };
  },
  reduced(el, opts) { return this.create(el, opts); }
};
