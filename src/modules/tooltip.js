import { clamp, env } from '../utils.js';

// Tooltip — accessible, themeable tooltips. Content comes from `content`, or the
// element's `data-kt-title` / `title` / `aria-label`. Placement (top/bottom/
// left/right) auto-flips when it would overflow the viewport. Triggers:
// hover (default, + focus for keyboard), focus, click (toggle), or manual (API
// only: instance.show()/hide()). `interactive:true` keeps it open while the
// pointer is over the tooltip (for links inside). Accessible: role="tooltip",
// aria-describedby wiring, Esc to close. Reduced motion: no fade. Theme with
// `.kt-tooltip` + --kt-tooltip-* variables.
export default {
  create(el, opts = {}) {
    const reduce = env().reducedMotion;
    const nativeTitle = el.getAttribute('title');
    const content = opts.content || el.getAttribute('data-kt-title') || nativeTitle || el.getAttribute('aria-label') || '';
    if (!content) return null;
    // Suppress the native title tooltip while we own it.
    if (nativeTitle != null) el.removeAttribute('title');

    const placement = ['top', 'bottom', 'left', 'right'].includes(opts.placement) ? opts.placement : 'top';
    const trigger = ['hover', 'focus', 'click', 'manual'].includes(opts.trigger) ? opts.trigger : 'hover';
    const delay = Math.max(0, Number(opts.delay ?? 120));
    const hideDelay = Math.max(0, Number(opts.hideDelay ?? 80));
    const offset = Number(opts.offset ?? 8);
    const duration = Math.max(0, Number(opts.duration ?? 0.16));
    const interactive = opts.interactive === true;
    // `html:true` renders the content as markup (e.g. a link inside the tip).
    // Pair with `interactive:true` so the pointer can travel onto it and click.
    const allowHtml = opts.html === true;
    // Enter/leave animation: fade (default) · scale (pop) · shift (rise) · none.
    const effect = ['fade', 'scale', 'shift', 'none'].includes(opts.effect) ? opts.effect : 'fade';
    const fromState = effect === 'scale' ? { opacity: 0, transform: 'scale(0.9)' }
      : effect === 'shift' ? { opacity: 0, transform: 'translateY(5px)' }
      : { opacity: 0, transform: 'none' };
    const toState = { opacity: 1, transform: 'none' };

    const tip = document.createElement('div');
    tip.className = 'kt-tooltip';
    tip.setAttribute('role', 'tooltip');
    tip.id = `kt-tooltip-${Math.random().toString(36).slice(2, 8)}`;
    tip.hidden = true;
    tip.style.position = 'fixed';
    tip.style.opacity = '0';
    if (allowHtml) tip.innerHTML = content; else tip.textContent = content;
    const arrow = document.createElement('span');
    arrow.className = 'kt-tooltip__arrow';
    arrow.setAttribute('aria-hidden', 'true');
    tip.appendChild(arrow);
    document.body.appendChild(tip);

    const describedBy = el.getAttribute('aria-describedby');
    el.setAttribute('aria-describedby', describedBy ? `${describedBy} ${tip.id}` : tip.id);

    let visible = false;
    let showTimer = null;
    let hideTimer = null;
    let anim = null;

    const position = () => {
      const r = el.getBoundingClientRect();
      const tw = tip.offsetWidth;
      const th = tip.offsetHeight;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let place = placement;
      // Auto-flip if there isn't room.
      if (place === 'top' && r.top - th - offset < 0) place = 'bottom';
      else if (place === 'bottom' && r.bottom + th + offset > vh) place = 'top';
      else if (place === 'left' && r.left - tw - offset < 0) place = 'right';
      else if (place === 'right' && r.right + tw + offset > vw) place = 'left';
      let x; let y;
      if (place === 'top') { x = r.left + r.width / 2 - tw / 2; y = r.top - th - offset; }
      else if (place === 'bottom') { x = r.left + r.width / 2 - tw / 2; y = r.bottom + offset; }
      else if (place === 'left') { x = r.left - tw - offset; y = r.top + r.height / 2 - th / 2; }
      else { x = r.right + offset; y = r.top + r.height / 2 - th / 2; }
      x = clamp(x, 4, vw - tw - 4);
      y = clamp(y, 4, vh - th - 4);
      tip.dataset.placement = place;
      tip.style.left = `${Math.round(x)}px`;
      tip.style.top = `${Math.round(y)}px`;
    };

    const show = () => {
      clearTimeout(hideTimer);
      if (visible) return;
      visible = true;
      tip.hidden = false;
      position();
      if (anim) anim.cancel(); // may fire a lingering hide's oncancel — guarded by !visible
      tip.style.opacity = '1';
      if (!reduce && effect !== 'none') anim = tip.animate([fromState, toState], { duration: duration * 1000, easing: 'ease' });
      // Capture so ANY ancestor scroller repositions the tip (scroll doesn't
      // bubble); passive because position() never calls preventDefault — keeps
      // scrolling off the main-thread critical path (D-3 listener policy).
      window.addEventListener('scroll', position, { capture: true, passive: true });
      window.addEventListener('resize', position);
    };
    const hide = () => {
      clearTimeout(showTimer);
      if (!visible) return;
      visible = false;
      // Guard: if re-shown before this finishes/cancels, don't hide the new one.
      const done = () => { if (!visible) { tip.hidden = true; tip.style.opacity = '0'; } };
      if (anim) anim.cancel();
      tip.style.opacity = '0';
      if (!reduce && effect !== 'none') { anim = tip.animate([toState, fromState], { duration: duration * 700, easing: 'ease' }); anim.onfinish = done; anim.oncancel = done; } else done();
      window.removeEventListener('scroll', position, true);
      window.removeEventListener('resize', position);
    };
    const scheduleShow = () => { clearTimeout(hideTimer); showTimer = setTimeout(show, delay); };
    const scheduleHide = () => { clearTimeout(showTimer); hideTimer = setTimeout(hide, hideDelay); };

    const onEnter = () => scheduleShow();
    const onLeave = () => scheduleHide();
    const onFocus = () => show();
    const onBlur = () => hide();
    const onClick = () => { visible ? hide() : show(); };
    const onKey = (e) => { if (e.key === 'Escape' && visible) hide(); };
    const onDocClick = (e) => { if (visible && !el.contains(e.target) && !tip.contains(e.target)) hide(); };

    if (trigger === 'hover') {
      el.addEventListener('pointerenter', onEnter);
      el.addEventListener('pointerleave', onLeave);
      el.addEventListener('focus', onFocus);
      el.addEventListener('blur', onBlur);
      if (interactive) { tip.style.pointerEvents = 'auto'; tip.addEventListener('pointerenter', () => clearTimeout(hideTimer)); tip.addEventListener('pointerleave', scheduleHide); }
    } else if (trigger === 'focus') {
      el.addEventListener('focus', onFocus);
      el.addEventListener('blur', onBlur);
    } else if (trigger === 'click') {
      el.addEventListener('click', onClick);
      document.addEventListener('pointerdown', onDocClick, true);
    }
    el.addEventListener('keydown', onKey);

    return {
      el,
      type: 'tooltip',
      show, hide,
      // Live-update the tip text/markup in place — no teardown (audit B-5).
      update(patch = {}) {
        if (patch.content != null) {
          const useHtml = patch.html != null ? patch.html === true : allowHtml;
          if (useHtml) tip.innerHTML = String(patch.content); else tip.textContent = String(patch.content);
        }
        if (visible) position();
      },
      pause() {}, resume() {},
      destroy() {
        clearTimeout(showTimer); clearTimeout(hideTimer);
        window.removeEventListener('scroll', position, true);
        window.removeEventListener('resize', position);
        el.removeEventListener('pointerenter', onEnter);
        el.removeEventListener('pointerleave', onLeave);
        el.removeEventListener('focus', onFocus);
        el.removeEventListener('blur', onBlur);
        el.removeEventListener('click', onClick);
        document.removeEventListener('pointerdown', onDocClick, true);
        el.removeEventListener('keydown', onKey);
        tip.remove();
        // Restore aria-describedby / title.
        const db = (el.getAttribute('aria-describedby') || '').split(/\s+/).filter((v) => v && v !== tip.id).join(' ');
        if (db) el.setAttribute('aria-describedby', db); else el.removeAttribute('aria-describedby');
        if (nativeTitle != null) el.setAttribute('title', nativeTitle);
      }
    };
  },
  reduced(el, opts) { return this.create(el, opts); }
};
