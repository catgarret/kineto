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

    const prevPosition = el.style.position;
    const prevOverflow = el.style.overflow;
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

    // On confirm, actually perform the action so devs don't have to wire it up:
    //  1) opts.action / data-kt-hold-action selector → click that element
    //  2) an <a href> → navigate
    //  3) a submit button or `submit:true` / data-kt-hold-submit → submit the form
    // Opt out entirely with submit:false. The event + onComplete always fire too.
    const runAction = () => {
      if (opts.submit === false) return;
      const targetSel = opts.action || el.getAttribute('data-kt-hold-action');
      if (targetSel) { document.querySelector(targetSel)?.click?.(); return; }
      if (el.tagName === 'A' && el.getAttribute('href')) { window.location.href = el.href; return; }
      const form = el.closest?.('form');
      const wantsSubmit = opts.submit === true || el.type === 'submit' || el.getAttribute('data-kt-hold-submit') != null;
      if (form && wantsSubmit) {
        if (typeof form.requestSubmit === 'function') form.requestSubmit(el.type === 'submit' ? el : undefined);
        else form.submit();
      }
    };

    const tick = (time) => {
      const p = clamp((time - startTime) / duration, 0, 1);
      setProgress(p);
      if (p >= 1) {
        confirmed = true; holding = false; rafId = null;
        el.classList.add('kt-hold-confirmed');
        el.setAttribute('aria-pressed', 'true');
        // Cancelable event: preventDefault() in a listener skips the auto action.
        let proceed = true;
        try {
          const ev = new CustomEvent('kt-hold-confirm', { bubbles: true, cancelable: true });
          proceed = el.dispatchEvent(ev);
        } catch (_error) { /* older */ }
        opts.onComplete?.(el);
        if (proceed) runAction();
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
        el.style.position = prevPosition;
        el.style.overflow = prevOverflow;
        el.classList.remove('kt-hold-confirmed');
        el.removeAttribute('aria-pressed');
      }
    };
  }
};
