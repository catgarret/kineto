import { clamp, env, snapshotAttributes } from '../utils.js';

// One arrow-key press on the resize handle changes the height by this much.
const RESIZE_KEY_STEP = 24;
// Page parts that never take focus or clicks, so they need no `inert`.
const NEVER_INTERACTIVE = new Set(['SCRIPT', 'STYLE', 'LINK', 'META', 'TEMPLATE', 'NOSCRIPT']);
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';

// Make everything outside `el` inert (every sibling of `el` and of each of its
// ancestors up to <body>), except `keep`. Returns the undo. Elements that were
// already inert are left to whoever made them so.
function inertOutside(el, keep) {
  const changed = [];
  for (let node = el; node && node.parentElement && node !== document.body; node = node.parentElement) {
    Array.from(node.parentElement.children).forEach((sibling) => {
      if (sibling === node || sibling === keep || sibling.inert || NEVER_INTERACTIVE.has(sibling.tagName)) return;
      sibling.inert = true;
      changed.push(sibling);
    });
  }
  return () => changed.forEach((sibling) => { sibling.inert = false; });
}

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
    // 아래에서 이름을 붙일 수 있으므로 **붙이기 전에** 원래 상태를 기억합니다.
    // 그러지 않으면 destroy 한 뒤에도 라이브러리가 지은 이름이 요소에 남습니다.
    const restoreNaming = snapshotAttributes(el, ['aria-label', 'aria-labelledby']);
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
    let restoreBackground = null;
    // The sheet itself takes focus when it has nothing focusable inside; a
    // plain <div> ignores focus(), which left focus behind on the page.
    const restoreTabIndex = snapshotAttributes(el, ['tabindex']);

    // Only what can actually be reached: a control inside a collapsed part of
    // the sheet (display:none) cannot take focus, so it cannot close the trap.
    const focusables = () => Array.from(el.querySelectorAll(FOCUSABLE))
      .filter((node) => node.getClientRects().length > 0);

    // Opening lands on the first control of the content; the resize handle
    // (when resizable) is in the Tab order but is not where a reader starts.
    const focusInside = () => {
      const items = focusables();
      const first = items.find((node) => node !== handle) || items[0];
      if (first) { first.focus(); return; }
      if (!el.hasAttribute('tabindex')) el.tabIndex = -1;
      el.focus?.();
    };

    const doOpen = () => {
      if (open) return;
      open = true;
      lastFocus = document.activeElement;
      if (backdrop) { document.body.appendChild(backdrop); backdrop.hidden = false; if (!reduce) backdrop.animate([{ opacity: 0 }, { opacity: backdropOpacity }], { duration: duration * 1000, easing: 'ease' }); }
      el.hidden = false;
      el.classList.add('kt-open');
      if (anim) anim.cancel();
      if (!reduce) anim = el.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { duration: duration * 1000, easing: 'cubic-bezier(.22,.8,.3,1)' });
      // A modal dialog: the page behind it is out of reach for keyboard,
      // pointer and screen reader alike — the comment above always said so,
      // but nothing made it true. The backdrop stays clickable to dismiss.
      restoreBackground?.();
      restoreBackground = inertOutside(el, backdrop);
      focusInside();
      document.addEventListener('keydown', onKey, true);
    };

    const doClose = () => {
      if (!open) return;
      open = false;
      el.classList.remove('kt-open');
      document.removeEventListener('keydown', onKey, true);
      restoreBackground?.();
      restoreBackground = null;
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
      // Simple focus trap. With nothing focusable inside, Tab stays on the sheet.
      const items = focusables();
      if (!items.length) { event.preventDefault(); focusInside(); return; }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };

    if (backdrop && dismissible) backdrop.addEventListener('click', doClose);
    // Buttons inside the sheet marked `data-kt-sheet-close` close it.
    const onCloseClick = (event) => {
      const closer = event.target.closest?.('[data-kt-sheet-close]');
      if (closer && el.contains(closer)) { event.preventDefault(); doClose(); }
    };
    el.addEventListener('click', onCloseClick);
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
    // `maxHeight` accepts a number (px), "60vh" or "60%". It caps both the drag
    // resize and the auto-height mode; the default ceiling is half the viewport.
    const resolveMaxHeight = () => {
      const raw = opts.maxHeight;
      const viewport = (typeof window !== 'undefined' ? window.innerHeight : 800);
      if (raw == null || raw === '') return viewport * 0.5;
      const text = String(raw).trim();
      if (/vh$/i.test(text) || /%$/.test(text)) {
        const ratio = parseFloat(text);
        return Number.isFinite(ratio) ? viewport * (ratio / 100) : viewport * 0.5;
      }
      const px = parseFloat(text);
      return Number.isFinite(px) && px > 0 ? px : viewport * 0.5;
    };
    // autoHeight: the sheet hugs its own content instead of a fixed CSS height,
    // growing only until the maxHeight ceiling and then scrolling inside.
    const autoHeight = opts.autoHeight === true;
    const applyAutoHeight = () => {
      if (!autoHeight) return;
      el.style.height = 'auto';
      el.style.maxHeight = `${Math.round(resolveMaxHeight())}px`;
      el.style.overflowY = 'auto';
    };
    // `maxHeight` is a ceiling for the sheet in every mode, not just autoHeight
    // and drag-resize: setting it alone used to do nothing at all.
    const applyCeiling = () => {
      if (autoHeight) { applyAutoHeight(); return; }
      if (opts.maxHeight == null || opts.maxHeight === '') return;
      el.style.maxHeight = `${Math.round(resolveMaxHeight())}px`;
      el.style.overflowY = 'auto';
    };
    let autoHeightResize = null;
    if (typeof window !== 'undefined') {
      applyCeiling();
      autoHeightResize = () => applyCeiling();
      window.addEventListener('resize', autoHeightResize);
    }
    const resetSize = () => { el.style.height = ''; el.style.maxHeight = ''; if (autoHeight) applyAutoHeight(); };
    const dragBindings = [];
    let onHandleKey = null;
    if (handle && resizable) {
      handle.style.cursor = 'ns-resize'; handle.style.touchAction = 'none'; el.classList.add('kt-sheet--resizable');
      // 손잡이 툴팁. 라이브러리가 쓰는 사람의 언어를 알 수는 없으므로, `label` 과 같은
      // 규칙으로 영어 기본값을 두고 문구는 페이지가 정합니다. 빈 문자열이면 툴팁을 끕니다.
      const resizeLabel = opts.resizeLabel ?? 'Drag to resize · Double-click to reset';
      handle.title = handle.title || resizeLabel;
      // Resizing was pointer-only. The handle is now a focusable splitter
      // (role=separator): ↑/↓ change the height, Home/End jump to the limits.
      // Its name is the title above — one string, so a page that re-words the
      // tooltip (a language switch) re-words the name with it.
      handle.removeAttribute('aria-hidden');
      handle.tabIndex = 0;
      handle.setAttribute('role', 'separator');
      handle.setAttribute('aria-orientation', 'horizontal');
      handle.setAttribute('aria-valuemin', String(minHeight));
      onHandleKey = (event) => {
        const viewportMax = Math.round((typeof window !== 'undefined' ? window.innerHeight : 800) * 0.95);
        const maxHeight = Math.min(viewportMax, resolveMaxHeight());
        const current = el.getBoundingClientRect().height;
        const wanted = { ArrowUp: current + RESIZE_KEY_STEP, ArrowDown: current - RESIZE_KEY_STEP, Home: minHeight, End: maxHeight }[event.key];
        if (wanted == null) return;
        event.preventDefault();
        const h = Math.min(maxHeight, Math.max(minHeight, Math.round(wanted)));
        el.style.height = `${h}px`; el.style.maxHeight = `${maxHeight}px`;
        handle.setAttribute('aria-valuemax', String(Math.round(maxHeight)));
        handle.setAttribute('aria-valuenow', String(h));
        opts.onResize?.(h, el);
        emit('kt-sheet-resize', { height: h, source: 'keyboard' });
      };
      handle.addEventListener('keydown', onHandleKey);
    }
    if (resizable) {
      el.classList.add(`kt-sheet--resize-${resizeArea}`);
      el.dataset.ktSheetResizeArea = resizeArea;
    }
    const authoredHeader = el.querySelector('[data-kt-sheet-header],.kt-sheet__header,header');
    const surfaces = resizable && resizeArea === 'header'
      ? [handle, authoredHeader].filter((surface, index, list) => surface && list.indexOf(surface) === index)
      : [handle].filter(Boolean);
    const interactive = 'button,a,input,select,textarea,label,[contenteditable="true"],[data-kt-sheet-no-resize]';
    surfaces.forEach((dragSurface) => {
      let startY = 0; let startH = 0; let dragging = false; let moved = false; let lastTapAt = 0;
      const source = dragSurface === handle ? 'handle' : 'header';
      if (resizable) {
        dragSurface.style.cursor = 'ns-resize';
        dragSurface.style.touchAction = 'none';
      }
      let startX = 0; let armed = false;
      const down = (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        if (e.target.closest?.(interactive)) return;
        // Capture and preventDefault are deliberately deferred: taking the
        // pointer on mousedown blocks text selection in the header. The gesture
        // only becomes a drag once it is clearly vertical.
        dragging = true; moved = false;
        // The handle is a dedicated resize grip: arm at once. A header, which
        // holds selectable text, stays ambiguous until the drag is vertical.
        armed = dragSurface === handle;
        if (armed) {
          el.style.transition = 'none';
          el.classList.add('kt-sheet--dragging');
          try { dragSurface.setPointerCapture?.(e.pointerId); } catch (_err) { /* synthetic */ }
        }
        startY = e.clientY; startX = e.clientX;
        startH = el.getBoundingClientRect().height;
      };
      const move = (e) => {
        if (!dragging) return;
        const dy = e.clientY - startY;
        if (!armed) {
          const sideways = Math.abs(e.clientX - startX);
          if (Math.abs(dy) < 7 || Math.abs(dy) < sideways) return;
          armed = true;
          el.style.transition = 'none';
          el.classList.add('kt-sheet--dragging');
          try { dragSurface.setPointerCapture?.(e.pointerId); } catch (_err) { /* synthetic */ }
          el.ownerDocument?.defaultView?.getSelection?.()?.removeAllRanges?.();
        }
        if (Math.abs(dy) > 3) moved = true;
        if (resizable) {
          const viewportMax = Math.round((typeof window !== 'undefined' ? window.innerHeight : 800) * 0.95);
          const maxHeight = Math.min(viewportMax, resolveMaxHeight());
          const h = Math.min(maxHeight, Math.max(minHeight, Math.round(startH - dy)));
          el.style.height = `${h}px`; el.style.maxHeight = `${maxHeight}px`;
          opts.onResize?.(h, el);
          emit('kt-sheet-resize', { height: h, source });
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
      const dblclick = resizable ? (event) => {
        if (event.target.closest?.(interactive)) return;
        resetSize();
      } : null;
      dragSurface.addEventListener('pointerdown', down);
      dragSurface.addEventListener('pointermove', move);
      dragSurface.addEventListener('pointerup', up);
      dragSurface.addEventListener('pointercancel', up);
      if (dblclick) dragSurface.addEventListener('dblclick', dblclick);
      dragBindings.push({ surface: dragSurface, down, move, up, dblclick });
    });

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
        // The close animation's finish handler hides the panel. Detach it and
        // stop the animation now, or it fires after destroy() has restored the
        // element and hides it for good.
        if (anim) { anim.onfinish = null; anim.oncancel = null; anim.cancel(); anim = null; }
        document.removeEventListener('keydown', onKey, true);
        el.removeEventListener('click', onCloseClick);
        if (onHandleKey) handle.removeEventListener('keydown', onHandleKey);
        restoreTabIndex();
        triggers.forEach((t) => t.removeEventListener('click', onTrig));
        dragBindings.forEach(({ surface, down, move, up, dblclick }) => {
          surface.removeEventListener('pointerdown', down);
          surface.removeEventListener('pointermove', move);
          surface.removeEventListener('pointerup', up);
          surface.removeEventListener('pointercancel', up);
          if (dblclick) surface.removeEventListener('dblclick', dblclick);
        });
        if (backdrop) backdrop.remove();
        if (handle) handle.remove();
        if (autoHeightResize) window.removeEventListener('resize', autoHeightResize);
        el.style.removeProperty('overflow-y');
        el.classList.remove('kt-sheet', 'kt-open', 'kt-sheet--resizable', 'kt-sheet--resize-handle', 'kt-sheet--resize-header', 'kt-sheet--dragging');
        delete el.dataset.ktSheetResizeArea;
        el.removeAttribute('role'); el.removeAttribute('aria-modal'); el.hidden = false;
        restoreNaming();
      }
    };
  },
  reduced(el, opts) { return this.create(el, opts); }
};
