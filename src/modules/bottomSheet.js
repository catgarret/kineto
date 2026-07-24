import { clamp, env } from '../utils.js';

// Bottom sheet — a panel that slides up from the bottom edge with an optional
// backdrop and drag-to-dismiss handle. Put `data-kt-bottom-sheet` on the panel;
// triggers are any elements matching `opts.trigger` (default
// `[data-kt-sheet-trigger]` whose value is `#panelId`). Accessible dialog:
// aria-modal, focus moves in on open and returns to the trigger on close,
// Esc / backdrop / handle-drag / close-button all dismiss, background is inert
// to the keyboard while open. Imperative: `instance.open()` / `instance.close()`.
export default {
  create(el, opts = {}) {
    const reduce = env().reducedMotion;
    const duration = Math.max(0.05, Number(opts.duration ?? 0.34));
    const useBackdrop = opts.backdrop !== false;
    const backdropOpacity = clamp(Number(opts.backdropOpacity ?? 0.5), 0, 1);
    const dismissible = opts.dismissible !== false;
    const useHandle = opts.handle !== false;
    const triggerSel = opts.trigger || '[data-kt-sheet-trigger]';

    el.classList.add('kt-sheet');
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.hidden = true;

    let backdrop = null;
    if (useBackdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'kt-sheet-backdrop';
      backdrop.hidden = true;
    }
    let handle = null;
    if (useHandle) {
      handle = document.createElement('div');
      handle.className = 'kt-sheet__handle';
      handle.setAttribute('aria-hidden', 'true');
      el.insertBefore(handle, el.firstChild);
    }

    let open = false;
    let lastFocus = null;
    let anim = null;

    const focusables = () => Array.from(el.querySelectorAll(
      'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])'
    ));

    const doOpen = () => {
      if (open) return;
      open = true;
      lastFocus = document.activeElement;
      if (backdrop) { document.body.appendChild(backdrop); backdrop.hidden = false; if (!reduce) backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: duration * 1000, easing: 'ease' }); }
      el.hidden = false;
      el.classList.add('kt-open');
      if (anim) anim.cancel();
      if (!reduce) anim = el.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { duration: duration * 1000, easing: 'cubic-bezier(.22,.8,.3,1)' });
      (focusables()[0] || el).focus?.();
      document.addEventListener('keydown', onKey, true);
    };

    const doClose = () => {
      if (!open) return;
      open = false;
      el.classList.remove('kt-open');
      document.removeEventListener('keydown', onKey, true);
      const finish = () => { el.hidden = true; if (backdrop) backdrop.hidden = true; };
      if (backdrop && !reduce) backdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: duration * 800, easing: 'ease' });
      if (reduce) finish();
      else { if (anim) anim.cancel(); anim = el.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(100%)' }], { duration: duration * 800, easing: 'ease' }); anim.onfinish = finish; anim.oncancel = finish; }
      lastFocus?.focus?.();
    };

    const onKey = (event) => {
      if (event.key === 'Escape' && dismissible) { event.preventDefault(); doClose(); return; }
      if (event.key !== 'Tab') return;
      // Simple focus trap.
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };

    if (backdrop && dismissible) backdrop.addEventListener('click', doClose);
    el.style.setProperty('--kt-sheet-backdrop-opacity', String(backdropOpacity));

    // Drag-to-dismiss on the handle (pointer).
    if (handle && dismissible) {
      let startY = 0; let dragging = false;
      const down = (e) => { dragging = true; startY = e.clientY; el.style.transition = 'none'; handle.setPointerCapture?.(e.pointerId); };
      const move = (e) => { if (!dragging) return; const dy = Math.max(0, e.clientY - startY); el.style.transform = `translateY(${dy}px)`; };
      const up = (e) => { if (!dragging) return; dragging = false; el.style.transition = ''; const dy = Math.max(0, e.clientY - startY); el.style.transform = ''; if (dy > 90) doClose(); };
      handle.addEventListener('pointerdown', down);
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', up);
      handle.addEventListener('pointercancel', up);
      handle._kt = { down, move, up };
    }

    const triggers = el.id ? Array.from(document.querySelectorAll(triggerSel)).filter((t) => (t.getAttribute('data-kt-sheet-trigger') || t.getAttribute('href') || '') === `#${el.id}` || opts.trigger) : [];
    const onTrig = (e) => { e.preventDefault(); doOpen(); };
    triggers.forEach((t) => { t.setAttribute('aria-haspopup', 'dialog'); t.addEventListener('click', onTrig); });

    return {
      el,
      type: 'bottomSheet',
      open: doOpen,
      close: doClose,
      pause() {},
      resume() {},
      destroy() {
        doClose();
        document.removeEventListener('keydown', onKey, true);
        triggers.forEach((t) => t.removeEventListener('click', onTrig));
        if (backdrop) backdrop.remove();
        if (handle) handle.remove();
        el.classList.remove('kt-sheet', 'kt-open');
        el.removeAttribute('role'); el.removeAttribute('aria-modal'); el.hidden = false;
      }
    };
  },
  reduced(el, opts) { return this.create(el, opts); }
};
