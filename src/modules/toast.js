import { clamp, env } from '../utils.js';

// Toast — transient status messages in a shared live region (role="status", or
// "alert" for warning/error) so screen readers announce them. Auto-dismisses
// after `duration`; hovering/focusing pauses it. Imperative: instance.show().
// Customization: `type` (info/success/warning/error/none), `icon` (default type
// glyph, false = none, or a custom string/emoji/HTML), `progressBar`
// (none/bar/ring), `barColor`, `dismissible`, `position`, `max`. Colours via
// --kt-toast-bg / -fg / -accent / -bar (per type with .kt-toast--*). Reduced
// motion: no entrance/exit animation.
const REGIONS = {};
// Clean line-symbol icons (stroke = currentColor → the accent). No emoji.
const svg = (paths) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
const TYPE_ICON = {
  info: svg('<path d="M12 11v5"/><path d="M12 7.5h.01"/>'),
  success: svg('<path d="M5 12.5l4.2 4.2L19 7"/>'),
  warning: svg('<path d="M12 8v5"/><path d="M12 16.5h.01"/>'),
  error: svg('<path d="M7.5 7.5l9 9"/><path d="M16.5 7.5l-9 9"/>')
};

const regionFor = (position) => {
  if (REGIONS[position]) return REGIONS[position];
  const region = document.createElement('div');
  region.className = `kt-toast-region kt-toast-region--${position}`;
  region.setAttribute('role', 'region');
  region.setAttribute('aria-label', 'Notifications');
  document.body.appendChild(region);
  REGIONS[position] = region;
  return region;
};

export default {
  create(el, opts = {}) {
    const reduce = env().reducedMotion;
    const position = opts.position || 'bottom-right';
    const type = opts.type || 'info';
    const duration = clamp(Number(opts.duration ?? 5000), 1000, 30000);
    const dismissible = opts.dismissible !== false;
    const defaultMessage = opts.message || el.getAttribute('data-kt-message') || el.textContent.trim() || 'Done';
    const progressStyle = opts.progressBar === 'ring' ? 'ring'
      : opts.progressBar === 'fill' ? 'fill'
      : (opts.progressBar === true || opts.progressBar === 'bar') ? 'bar' : 'none';
    const maxVisible = Math.max(1, Number(opts.max ?? 5));
    const iconOpt = opts.icon; // undefined → default glyph; false → none; string → custom

    const show = (message, overrides = {}) => {
      const kind = overrides.type || type;
      const region = regionFor(overrides.position || position);
      while (region.children.length >= maxVisible) region.firstElementChild?.remove();

      const toast = document.createElement('div');
      toast.className = `kt-toast kt-toast--${kind}`;
      toast.setAttribute('role', kind === 'error' || kind === 'warning' ? 'alert' : 'status');
      if (opts.barColor) toast.style.setProperty('--kt-toast-bar', opts.barColor);

      // Icon HTML (customizable): default clean type symbol, unless type is
      // "none" or icon:false. A string is used verbatim (custom SVG/text).
      const iconHtml = (kind !== 'none' && iconOpt !== false) ? (typeof iconOpt === 'string' ? iconOpt : (TYPE_ICON[kind] || '')) : '';

      const body = document.createElement('span');
      body.className = 'kt-toast__msg';
      body.textContent = message ?? defaultMessage;
      toast.appendChild(body);

      let closed = false;
      const removeNow = () => toast.remove();
      const dismiss = () => {
        if (closed) return;
        closed = true;
        clearTimeout(timerId);
        if (barAnim) barAnim.cancel();
        if (reduce || !toast.animate) { removeNow(); return; }
        const out = toast.animate(
          [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(6px) scale(.98)' }],
          { duration: 200, easing: 'ease' }
        );
        out.onfinish = removeNow; out.oncancel = removeNow;
      };

      if (dismissible) {
        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'kt-toast__close';
        close.setAttribute('aria-label', 'Dismiss');
        close.innerHTML = '&times;';
        close.addEventListener('click', dismiss);
        toast.appendChild(close);
      }
      region.appendChild(toast);

      if (!reduce && toast.animate) {
        toast.animate(
          [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 240, easing: 'cubic-bezier(.22,.8,.3,1)' }
        );
      }

      // Dismissal is driven ONLY by this timer, never below 300ms — so a stray
      // hover / event can never make the toast vanish instantly. The progress
      // bar/ring below is purely visual and stays in sync (pause/resume).
      let remaining = Math.max(1000, Number(overrides.duration ?? duration));
      let startedAt = 0;
      let timerId = null;
      let barAnim = null;
      const startTimer = () => { if (closed) return; startedAt = performance.now(); clearTimeout(timerId); timerId = setTimeout(dismiss, Math.max(300, remaining)); };
      const pauseTimer = () => { if (closed || !startedAt) return; clearTimeout(timerId); remaining = Math.max(300, remaining - (performance.now() - startedAt)); startedAt = 0; };

      // Lead element (before the message): a countdown ring — which WRAPS the
      // type icon in its centre so they never overlap — or a standalone icon.
      if (progressStyle === 'ring' && !reduce && toast.animate) {
        const ring = document.createElement('span');
        ring.className = 'kt-toast__ring';
        ring.setAttribute('aria-hidden', 'true');
        const C = 2 * Math.PI * 9;
        ring.innerHTML = `<svg viewBox="0 0 24 24"><circle class="kt-toast__ring-track" cx="12" cy="12" r="9"></circle><circle class="kt-toast__ring-fill" cx="12" cy="12" r="9" transform="rotate(-90 12 12)" stroke-dasharray="${C}" stroke-dashoffset="0"></circle></svg>`;
        if (iconHtml) {
          const ic = document.createElement('span');
          ic.className = 'kt-toast__ring-icon';
          ic.setAttribute('aria-hidden', 'true');
          ic.innerHTML = iconHtml;
          ring.appendChild(ic);
        }
        toast.insertBefore(ring, toast.firstChild);
        barAnim = ring.querySelector('.kt-toast__ring-fill').animate([{ strokeDashoffset: 0 }, { strokeDashoffset: C }], { duration: remaining, easing: 'linear' });
      } else {
        if (iconHtml) {
          const icon = document.createElement('span');
          icon.className = 'kt-toast__icon';
          icon.setAttribute('aria-hidden', 'true');
          icon.innerHTML = iconHtml;
          toast.insertBefore(icon, toast.firstChild);
        }
        if (progressStyle === 'bar' && !reduce && toast.animate) {
          const bar = document.createElement('span');
          bar.className = 'kt-toast__bar';
          bar.setAttribute('aria-hidden', 'true');
          toast.appendChild(bar);
          barAnim = bar.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: remaining, easing: 'linear' });
        } else if (progressStyle === 'fill' && !reduce && toast.animate) {
          // The whole toast box fills like a progress bar: a tinted layer sweeps
          // across behind the content over the lifetime.
          const fill = document.createElement('span');
          fill.className = 'kt-toast__fill';
          fill.setAttribute('aria-hidden', 'true');
          toast.insertBefore(fill, toast.firstChild);
          barAnim = fill.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: remaining, easing: 'linear', fill: 'forwards' });
        }
      }

      const pause = () => { pauseTimer(); if (barAnim) barAnim.pause(); };
      const resume = () => { startTimer(); if (barAnim) barAnim.play(); };
      toast.addEventListener('mouseenter', pause);
      toast.addEventListener('mouseleave', resume);
      toast.addEventListener('focusin', pause);
      toast.addEventListener('focusout', resume);
      startTimer();
      return { dismiss, el: toast };
    };

    const onTrigger = () => show();
    el.addEventListener('click', onTrigger);

    return {
      el,
      type: 'toast',
      show,
      pause() {}, resume() {},
      destroy() { el.removeEventListener('click', onTrigger); }
    };
  },
  reduced(el, opts) { return this.create(el, opts); }
};
