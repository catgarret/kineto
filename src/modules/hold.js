import { clamp } from '../utils.js';

// Hold-to-confirm — press and hold (mode:"hold", default) for `duration` ms to
// confirm, or button-mash (mode:"mash") where each tap adds `step` and the fill
// slowly `decay`s between taps, so repeated taps climb it to full (game-style).
// A fill sweeps across; on success it fires a cancelable `kt-hold-confirm`
// event + opts.onComplete and performs the element's action (link/submit/click).
// Pointer + keyboard (Enter/Space). API: instance.reset() / progress().
export default {
  create(el, opts = {}) {
    const mode = opts.mode === 'mash' ? 'mash' : 'hold';
    const duration = Math.max(120, Number(opts.duration ?? 1000));
    // Fill is themeable: `color` option or the --kt-hold-fill CSS variable, and
    // an optional `blend` (mix-blend-mode). It also carries the `.kt-hold-fill`
    // class so you can style it entirely from CSS.
    const color = opts.color || 'var(--kt-hold-fill, color-mix(in srgb, currentColor 22%, transparent))';
    const blend = opts.blend || 'var(--kt-hold-blend, normal)';
    const step = clamp(Number(opts.step ?? 0.08), 0.01, 1); // mash: per-tap gain
    const decay = Math.max(0, Number(opts.decay ?? 0.4));   // mash: per-second drain

    const prevPosition = el.style.position;
    const prevOverflow = el.style.overflow;
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.style.overflow = el.style.overflow || 'hidden';

    const fill = document.createElement('span');
    fill.className = 'kt-hold-fill';
    fill.setAttribute('aria-hidden', 'true');
    fill.style.cssText = `position:absolute;inset:0;transform-origin:left center;transform:scaleX(0);background:${color};mix-blend-mode:${blend};pointer-events:none;border-radius:0;z-index:0;`;
    el.insertBefore(fill, el.firstChild);

    let rafId = null;
    let holding = false;
    let confirmed = false;
    let progress = 0;

    const setProgress = (p) => { progress = clamp(p, 0, 1); fill.style.transform = `scaleX(${progress})`; };
    const cancelRaf = () => { if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; } };

    // On confirm, perform the element's action so devs don't have to wire it up:
    // opts.action/data-kt-hold-action → click; <a href> → navigate; submit
    // button / submit:true / data-kt-hold-submit → submit the form. submit:false
    // opts out. The cancelable event + onComplete always fire.
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

    const confirm = () => {
      if (confirmed) return;
      confirmed = true; holding = false; cancelRaf();
      setProgress(1);
      el.classList.add('kt-hold-confirmed');
      el.setAttribute('aria-pressed', 'true');
      let proceed = true;
      try { proceed = el.dispatchEvent(new CustomEvent('kt-hold-confirm', { bubbles: true, cancelable: true })); } catch (_error) { /* older */ }
      opts.onComplete?.(el);
      if (proceed) runAction();
    };

    // ── Hold mode ────────────────────────────────────────────────────────────
    let startTime = 0;
    const tick = (time) => {
      const p = clamp((time - startTime) / duration, 0, 1);
      setProgress(p);
      if (p >= 1) { rafId = null; confirm(); return; }
      rafId = requestAnimationFrame(tick);
    };
    const start = () => {
      if (holding || confirmed) return;
      holding = true; startTime = performance.now();
      fill.style.transition = 'none';
      cancelRaf(); rafId = requestAnimationFrame(tick);
    };
    const release = () => {
      holding = false; cancelRaf();
      if (confirmed) return;
      fill.style.transition = `transform ${Math.min(0.35, duration / 3000)}s ease`;
      setProgress(0);
    };

    // ── Mash mode ────────────────────────────────────────────────────────────
    let lastT = 0;
    const decayTick = (time) => {
      const dt = lastT ? (time - lastT) / 1000 : 0; lastT = time;
      setProgress(progress - decay * dt);
      if (progress <= 0) { rafId = null; lastT = 0; return; }
      rafId = requestAnimationFrame(decayTick);
    };
    const tap = () => {
      if (confirmed) return;
      fill.style.transition = 'none';
      setProgress(progress + step);
      if (progress >= 1) { confirm(); return; }
      lastT = 0;
      if (rafId == null) rafId = requestAnimationFrame(decayTick);
    };

    const onDown = (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (mode === 'mash') tap(); else start();
    };
    const onKey = (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      if (mode === 'mash') { if (!event.repeat) tap(); } else start();
    };
    const onKeyUp = (event) => { if (mode === 'hold' && (event.key === 'Enter' || event.key === ' ')) release(); };

    el.addEventListener('pointerdown', onDown);
    if (mode === 'hold') {
      el.addEventListener('pointerup', release);
      el.addEventListener('pointerleave', release);
      el.addEventListener('pointercancel', release);
    }
    el.addEventListener('keydown', onKey);
    el.addEventListener('keyup', onKeyUp);

    return {
      el,
      type: 'hold',
      progress: () => progress,
      reset() { confirmed = false; el.classList.remove('kt-hold-confirmed'); el.removeAttribute('aria-pressed'); cancelRaf(); lastT = 0; fill.style.transition = 'transform .2s var(--kt-ease-ui, ease)'; setProgress(0); },
      pause() {},
      resume() {},
      destroy() {
        cancelRaf();
        el.removeEventListener('pointerdown', onDown);
        el.removeEventListener('pointerup', release);
        el.removeEventListener('pointerleave', release);
        el.removeEventListener('pointercancel', release);
        el.removeEventListener('keydown', onKey);
        el.removeEventListener('keyup', onKeyUp);
        fill.remove();
        el.style.position = prevPosition;
        el.style.overflow = prevOverflow;
        el.classList.remove('kt-hold-confirmed');
        el.removeAttribute('aria-pressed');
      }
    };
  },

  // Reduced motion: no fill sweep, but the control must still WORK — a plain
  // click confirms (fires the cancelable event + onComplete + the action), so
  // reduced-motion users aren't left with a dead button.
  reduced(el, opts = {}) {
    if (!/^(a|button)$/i.test(el.tagName) && !el.hasAttribute('tabindex')) el.tabIndex = 0;
    const runAction = () => {
      if (opts.submit === false) return;
      const targetSel = opts.action || el.getAttribute('data-kt-hold-action');
      if (targetSel) { document.querySelector(targetSel)?.click?.(); return; }
      if (el.tagName === 'A' && el.getAttribute('href')) { window.location.href = el.href; return; }
      const form = el.closest?.('form');
      const wantsSubmit = opts.submit === true || el.type === 'submit' || el.getAttribute('data-kt-hold-submit') != null;
      if (form && wantsSubmit) { if (typeof form.requestSubmit === 'function') form.requestSubmit(el.type === 'submit' ? el : undefined); else form.submit(); }
    };
    let done = false;
    const onClick = () => {
      if (done) return; done = true;
      el.classList.add('kt-hold-confirmed');
      let proceed = true;
      try { proceed = el.dispatchEvent(new CustomEvent('kt-hold-confirm', { bubbles: true, cancelable: true })); } catch (_error) { /* older */ }
      opts.onComplete?.(el);
      if (proceed) runAction();
    };
    el.addEventListener('click', onClick);
    return { el, type: 'hold', pause() {}, resume() {}, destroy() { el.removeEventListener('click', onClick); el.classList.remove('kt-hold-confirmed'); } };
  }
};
