// Canvas Effect — the pointer and scroll signals an effect reads.
//
// Event handlers only RECORD what happened (client coordinates, button state);
// they never measure. The host turns that into element coordinates once per
// frame, from one getBoundingClientRect() read (see sample()), so a busy page
// is not laid out again on every pointer event.

/**
 * @param {{ el: Element, target: 'host'|'window'|'none', onInput: () => void }} setup
 */
export function createPointerSignal({ el, target, onInput }) {
  const state = { clientX: 0, clientY: 0, down: false, seen: false, overHost: false, lastInput: 0 };
  const view = {
    x: 0, y: 0,        // CSS px inside the element (can be outside 0…width)
    nx: 0.5, ny: 0.5,  // 0…1 across the element (0.5 until the pointer is seen)
    vx: 0, vy: 0,      // CSS px per second
    inside: false,     // over the element right now
    down: false,       // a button / finger is pressed
    active: false      // moved within the last half second
  };
  if (target === 'none' || typeof window === 'undefined') {
    return { view, sample() {}, destroy() {} };
  }
  const source = target === 'window' ? window : el;
  const record = (event) => {
    state.clientX = event.clientX;
    state.clientY = event.clientY;
    state.seen = true;
    state.lastInput = performance.now();
    onInput();
  };
  const onDown = (event) => { state.down = true; record(event); };
  const onUp = (event) => { state.down = false; record(event); };
  const onEnter = () => { state.overHost = true; onInput(); };
  const onLeave = () => { state.overHost = false; state.down = false; onInput(); };
  const listeners = [['pointermove', record], ['pointerdown', onDown], ['pointerup', onUp], ['pointercancel', onUp]];
  listeners.forEach(([type, handler]) => source.addEventListener(type, handler, { passive: true }));
  el.addEventListener('pointerenter', onEnter, { passive: true });
  el.addEventListener('pointerleave', onLeave, { passive: true });

  let lastX = null;
  let lastY = null;
  return {
    view,
    /** Update `view` from the latest input. `rect` is the element's box this frame. */
    sample(rect, delta) {
      if (!state.seen) return;
      const x = state.clientX - rect.left;
      const y = state.clientY - rect.top;
      if (lastX != null && delta > 0) {
        view.vx = (x - lastX) / delta;
        view.vy = (y - lastY) / delta;
      }
      lastX = x;
      lastY = y;
      view.x = x;
      view.y = y;
      view.nx = rect.width ? x / rect.width : 0.5;
      view.ny = rect.height ? y / rect.height : 0.5;
      view.inside = state.overHost || (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height);
      view.down = state.down;
      view.active = performance.now() - state.lastInput < 500;
    },
    destroy() {
      listeners.forEach(([type, handler]) => source.removeEventListener(type, handler));
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointerleave', onLeave);
    }
  };
}

/**
 * @param {{ enabled: boolean, onInput: () => void }} setup
 */
export function createScrollSignal({ enabled, onInput }) {
  const view = {
    progress: 0,  // 0 when the element's top meets the viewport bottom, 1 when its bottom leaves the top
    velocity: 0   // page scroll speed, px per second (positive = scrolling down)
  };
  if (!enabled || typeof window === 'undefined') {
    return { view, sample() {}, destroy() {} };
  }
  const onScroll = () => onInput();
  window.addEventListener('scroll', onScroll, { passive: true });
  let lastY = null;
  return {
    view,
    sample(rect, delta) {
      const viewport = window.innerHeight || 1;
      const travel = viewport + rect.height;
      view.progress = travel > 0 ? Math.min(1, Math.max(0, (viewport - rect.top) / travel)) : 0;
      const y = window.scrollY;
      view.velocity = lastY != null && delta > 0 ? (y - lastY) / delta : 0;
      lastY = y;
    },
    destroy() {
      window.removeEventListener('scroll', onScroll);
    }
  };
}
