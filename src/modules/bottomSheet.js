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
    const emit = (name, detail) => {
      const EventCtor = el.ownerDocument?.defaultView?.CustomEvent || globalThis.CustomEvent;
      if (EventCtor) el.dispatchEvent(new EventCtor(name, { detail }));
    };
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
    // A dialog needs an accessible name: honour an existing label, else derive
    // one from a heading inside the sheet, else a sensible default.
    if (!el.hasAttribute('aria-label') && !el.hasAttribute('aria-labelledby')) {
      const heading = el.querySelector('h1,h2,h3,h4,[data-kt-sheet-title]');
      if (heading) {
        if (!heading.id) heading.id = `kt-sheet-title-${Math.random().toString(36).slice(2, 7)}`;
        el.setAttribute('aria-labelledby', heading.id);
      } else {
        el.setAttribute('aria-label', opts.label || 'Sheet');
      }
    }
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
      if (backdrop) { document.body.appendChild(backdrop); backdrop.hidden = false; if (!reduce) backdrop.animate([{ opacity: 0 }, { opacity: backdropOpacity }], { duration: duration * 1000, easing: 'ease' }); }
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
      // Guard on `open`: if the sheet is reopened before this close animation
      // finishes (or is cancelled by the reopen), do NOT hide it.
      const finish = () => { if (!open) { el.hidden = true; if (backdrop) backdrop.hidden = true; } };
      if (backdrop && !reduce) backdrop.animate([{ opacity: backdropOpacity }, { opacity: 0 }], { duration: duration * 800, easing: 'ease' });
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
    // Set the resting opacity on the backdrop itself (it lives on <body>, not
    // inside the sheet, so a var on the sheet would never reach it).
    if (backdrop) backdrop.style.setProperty('--kt-sheet-backdrop-opacity', String(backdropOpacity));

    // Drag behaviour. Default keeps the familiar handle-only drag-to-dismiss.
    // `resizable:true` turns vertical drag into live height resizing. The
    // default handle remains available, while resizeArea:"header" uses an
    // authored `[data-kt-sheet-header]`, `<header>` or `.kt-sheet__header`.
    // The content body is never a drag surface, so text stays selectable.
    const resizable = opts.resizable === true;
    const resizeArea = opts.resizeArea === 'header' ? 'header' : 'handle';
    const minHeight = Math.max(120, Number(opts.minHeight ?? 140));
    const resetSize = () => { el.style.height = ''; el.style.maxHeight = ''; };
    let onHandleDbl = null;
    let dragBinding = null;
    if (handle && resizable) {
      handle.style.cursor = 'ns-resize'; handle.style.touchAction = 'none'; el.classList.add('kt-sheet--resizable');
      handle.title = handle.title || '드래그: 높이 조절 · 더블클릭: 초기화';
    }
    if (resizable) {
      el.classList.add(`kt-sheet--resize-${resizeArea}`);
      el.dataset.ktSheetResizeArea = resizeArea;
    }
    const authoredHeader = el.querySelector('[data-kt-sheet-header],.kt-sheet__header,header');
    const dragSurface = resizable && resizeArea === 'header' ? (authoredHeader || handle) : handle;
    if (dragSurface && (dismissible || resizable)) {
      let startY = 0; let startH = 0; let dragging = false; let moved = false; let lastTapAt = 0;
      const interactive = 'button,a,input,select,textarea,label,[contenteditable="true"],[data-kt-sheet-no-resize]';
      const down = (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        if (e.target.closest?.(interactive)) return;
        dragging = true; moved = false; startY = e.clientY; startH = el.getBoundingClientRect().height;
        el.style.transition = 'none';
        el.classList.add('kt-sheet--dragging');
        dragSurface.setPointerCapture?.(e.pointerId);
      };
      const move = (e) => {
        if (!dragging) return;
        const dy = e.clientY - startY;
        if (Math.abs(dy) > 3) moved = true;
        if (resizable) {
          const viewportMax = Math.round((typeof window !== 'undefined' ? window.innerHeight : 800) * 0.95);
          const configuredMax = Number(opts.maxHeight);
          const maxHeight = Number.isFinite(configuredMax) && configuredMax > 0 ? Math.min(viewportMax, configuredMax) : viewportMax;
          const h = Math.min(maxHeight, Math.max(minHeight, Math.round(startH - dy)));
          el.style.height = `${h}px`; el.style.maxHeight = `${maxHeight}px`;
          opts.onResize?.(h, el);
          emit('kt-sheet-resize', { height: h, source: resizeArea });
        }
        else { el.style.transform = `translateY(${Math.max(0, dy)}px)`; }
      };
      const up = (e) => {
        if (!dragging) return; dragging = false; el.style.transition = ''; el.classList.remove('kt-sheet--dragging');
        if (!resizable) { const dy = Math.max(0, e.clientY - startY); el.style.transform = ''; if (dismissible && dy > 90) doClose(); }
        else if (!moved) {
          const now = Date.now();
          if (now - lastTapAt < 320) resetSize();
          lastTapAt = now;
        }
      };
      dragSurface.addEventListener('pointerdown', down);
      dragSurface.addEventListener('pointermove', move);
      dragSurface.addEventListener('pointerup', up);
      dragSurface.addEventListener('pointercancel', up);
      dragBinding = { surface: dragSurface, down, move, up };
      if (resizable) {
        onHandleDbl = (event) => {
          if (event.target.closest?.(interactive)) return;
          resetSize();
        };
        dragSurface.addEventListener('dblclick', onHandleDbl);
      }
    }

    const triggers = el.id ? Array.from(document.querySelectorAll(triggerSel)).filter((t) => (t.getAttribute('data-kt-sheet-trigger') || t.getAttribute('href') || '') === `#${el.id}` || opts.trigger) : [];
    const onTrig = (e) => { e.preventDefault(); doOpen(); };
    triggers.forEach((t) => { t.setAttribute('aria-haspopup', 'dialog'); t.addEventListener('click', onTrig); });

    return {
      el,
      type: 'bottomSheet',
      open: doOpen,
      close: doClose,
      // Clear a drag-resized height, returning the sheet to its CSS default size.
      resetSize,
      pause() {},
      resume() {},
      destroy() {
        doClose();
        document.removeEventListener('keydown', onKey, true);
        triggers.forEach((t) => t.removeEventListener('click', onTrig));
        if (dragBinding) {
          const { surface, down, move, up } = dragBinding;
          surface.removeEventListener('pointerdown', down);
          surface.removeEventListener('pointermove', move);
          surface.removeEventListener('pointerup', up);
          surface.removeEventListener('pointercancel', up);
          if (onHandleDbl) surface.removeEventListener('dblclick', onHandleDbl);
        }
        if (backdrop) backdrop.remove();
        if (handle) handle.remove();
        el.classList.remove('kt-sheet', 'kt-open', 'kt-sheet--resizable', 'kt-sheet--resize-handle', 'kt-sheet--resize-header', 'kt-sheet--dragging');
        delete el.dataset.ktSheetResizeArea;
        el.removeAttribute('role'); el.removeAttribute('aria-modal'); el.hidden = false;
      }
    };
  },
  reduced(el, opts) { return this.create(el, opts); }
};
