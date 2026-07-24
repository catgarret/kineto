import { clamp } from '../utils.js';

// Hold-to-confirm — press and hold a control for `duration` ms to confirm a
// (usually destructive or important) action. A fill sweeps across as you hold;
// releasing early rewinds it. Fires a `kt-hold-confirm` event and opts.onComplete
// on success. Pointer + keyboard (Enter/Space). Reduced motion keeps the fill
// but skips the rewind easing.
export default {
  create(el, opts = {}) {
    const duration = Math.max(120, Number(opts.duration ?? 1000));
    const color = opts.color || 'color-mix(in srgb, currentColor 22%, transparent)';

    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.style.overflow = el.style.overflow || 'hidden';

    const fill = document.createElement('span');
    fill.className = 'kt-hold-fill';
    fill.setAttribute('aria-hidden', 'true');
    fill.style.cssText = `position:absolute;inset:0;transform-origin:left center;transform:scaleX(0);background:${color};pointer-events:none;border-radius:inherit;z-index:0;`;
    el.insertBefore(fill, el.firstChild);

    let rafId = null;
    let startTime = 0;
    let holding = false;
    let confirmed = false;

    const setProgress = (p) => { fill.style.transform = `scaleX(${clamp(p, 0, 1)})`; };
    const cancelRaf = () => { if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; } };

    const tick = (time) => {
      const p = clamp((time - startTime) / duration, 0, 1);
      setProgress(p);
      if (p >= 1) {
        confirmed = true; holding = false; rafId = null;
        el.classList.add('kt-hold-confirmed');
        try { el.dispatchEvent(new CustomEvent('kt-hold-confirm', { bubbles: true })); } catch (_error) { /* older */ }
        opts.onComplete?.(el);
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    const start = () => {
      if (holding || confirmed) return;
      holding = true;
      startTime = performance.now();
      fill.style.transition = 'none';
      cancelRaf();
      rafId = requestAnimationFrame(tick);
    };
    const reset = () => {
      holding = false;
      cancelRaf();
      if (confirmed) return;
      // Rewind smoothly back to empty.
      fill.style.transition = `transform ${Math.min(0.35, duration / 3000)}s ease`;
      setProgress(0);
    };

    const onDown = (event) => { if (event.pointerType === 'mouse' && event.button !== 0) return; start(); };
    const onKey = (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); start(); } };
    const onKeyUp = (event) => { if (event.key === 'Enter' || event.key === ' ') reset(); };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointerup', reset);
    el.addEventListener('pointerleave', reset);
    el.addEventListener('pointercancel', reset);
    el.addEventListener('keydown', onKey);
    el.addEventListener('keyup', onKeyUp);

    return {
      el,
      type: 'hold',
      reset() { confirmed = false; el.classList.remove('kt-hold-confirmed'); reset(); },
      pause() {},
      resume() {},
      destroy() {
        cancelRaf();
        el.removeEventListener('pointerdown', onDown);
        el.removeEventListener('pointerup', reset);
        el.removeEventListener('pointerleave', reset);
        el.removeEventListener('pointercancel', reset);
        el.removeEventListener('keydown', onKey);
        el.removeEventListener('keyup', onKeyUp);
        fill.remove();
      }
    };
  }
};
