import { clamp, env } from '../utils.js';

// Toast — transient status messages. Attach `data-kt-toast` to a trigger; each
// activation shows a toast in a shared, live region (role="status", or
// "alert" for the error type) so screen readers announce it. Auto-dismisses
// after `duration`; hovering/focusing pauses the timer. Fully imperative too:
// `instance.show(message, overrides)`. Under reduced motion it appears without
// the slide. Everything is themeable via `.kt-toast*` classes / CSS variables.
const REGIONS = {};

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
    const duration = Math.max(600, Number(opts.duration ?? 3200));
    const dismissible = opts.dismissible !== false;
    const defaultMessage = opts.message || el.getAttribute('data-kt-message') || el.textContent.trim() || 'Done';

    const show = (message, overrides = {}) => {
      const kind = overrides.type || type;
      const region = regionFor(overrides.position || position);
      const toast = document.createElement('div');
      toast.className = `kt-toast kt-toast--${kind}`;
      toast.setAttribute('role', kind === 'error' || kind === 'warning' ? 'alert' : 'status');
      const body = document.createElement('span');
      body.className = 'kt-toast__msg';
      body.textContent = message ?? defaultMessage;
      toast.appendChild(body);
      if (dismissible) {
        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'kt-toast__close';
        close.setAttribute('aria-label', 'Dismiss');
        close.innerHTML = '&times;';
        close.addEventListener('click', () => dismiss());
        toast.appendChild(close);
      }
      region.appendChild(toast);
      if (!reduce) {
        toast.animate(
          [{ opacity: 0, transform: 'translateY(12px) scale(.98)' }, { opacity: 1, transform: 'none' }],
          { duration: 260, easing: 'cubic-bezier(.22,.8,.3,1)' }
        );
      }
      let timer = null;
      let remaining = Number(overrides.duration ?? duration);
      let startedAt = 0;
      const dismiss = () => {
        clearTimeout(timer);
        if (!toast.isConnected) return;
        const done = () => toast.remove();
        if (reduce) { done(); return; }
        const out = toast.animate(
          [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(6px) scale(.98)' }],
          { duration: 200, easing: 'ease' }
        );
        out.onfinish = done; out.oncancel = done;
      };
      const arm = () => { startedAt = performance.now(); timer = setTimeout(dismiss, remaining); };
      const pause = () => { clearTimeout(timer); remaining -= performance.now() - startedAt; };
      toast.addEventListener('mouseenter', pause);
      toast.addEventListener('mouseleave', arm);
      toast.addEventListener('focusin', pause);
      toast.addEventListener('focusout', arm);
      arm();
      return { dismiss, el: toast };
    };

    const onTrigger = () => show();
    el.addEventListener('click', onTrigger);

    return {
      el,
      type: 'toast',
      show,
      pause() {},
      resume() {},
      destroy() { el.removeEventListener('click', onTrigger); }
    };
  },
  // Reduced motion: still functional, no entrance/exit animation (handled inside).
  reduced(el, opts) { return this.create(el, opts); }
};
