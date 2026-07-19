// Named haptic patterns in the spirit of platform haptics. The Web Vibration
// API has no amplitude control, so texture comes from timing: short pulses
// read as "tap", tight pulse trains read as a ratchet/buzz.
const HAPTICS = {
  tap: [10],
  'double-tap': [12, 70, 12],
  soft: [6],
  rigid: [18],
  heavy: [45],
  success: [10, 50, 10, 50, 22],
  warning: [28, 60, 28],
  error: [55, 70, 55, 70, 90],
  ratchet: [7, 22, 7, 22, 7, 22, 7, 22, 7, 22, 7],
  heartbeat: [18, 90, 34, 240, 18, 90, 34],
  'long-press': [90]
};

export default {
  create(el, opts) {
    if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return null;
    const named = HAPTICS[opts.preset || opts.haptic];
    const pattern = named
      || (Array.isArray(opts.pattern) ? opts.pattern.map(Number) : Number(opts.pattern ?? 50));
    const trigger = opts.trigger || 'hover';
    let alive = true;
    let observer = null;

    const vibrate = () => {
      if (alive) navigator.vibrate(pattern);
    };

    // trigger:'manual' binds nothing — developers call instance.play()
    // (or Kineto.getInstance(el,'vibrate').play()) whenever they want.
    if (trigger === 'hover' && !window.matchMedia?.('(hover: none)').matches) el.addEventListener('pointerenter', vibrate);
    else if (trigger === 'click') el.addEventListener('click', vibrate);
    else if (trigger === 'scroll' && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) vibrate();
      }, { threshold: Number(opts.threshold ?? 0.1) });
      observer.observe(el);
    }

    return {
      el,
      type: 'vibrate',
      // Programmatic fire — works with any trigger, including 'manual'.
      play: vibrate,
      replay: vibrate,
      pause: () => { alive = false; navigator.vibrate(0); },
      resume: () => { alive = true; },
      destroy: () => {
        alive = false;
        navigator.vibrate(0);
        el.removeEventListener('pointerenter', vibrate);
        el.removeEventListener('click', vibrate);
        observer?.disconnect();
      }
    };
  },
  reduced() {}
};
