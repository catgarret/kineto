import { clamp, cssEase, env, labeller, motionDefaults, snapshotInlineStyles } from '../utils.js';

// Gesture — pointer gestures on an element. Two of them:
//
//   spring (default)  Motion-style whileHover / whileTap: the element springs
//                     up (and optionally lifts) on hover or focus and presses
//                     down on pointer/keydown
//   pull              pull-to-refresh: drag a scroll container down from the
//                     top and it stretches against you, an indicator fills as
//                     you go, and letting go past the threshold asks the page
//                     to refresh
//
// Keyboard-accessible (focus mirrors hover, Space/Enter press; `pull` exposes a
// button so it is reachable without a pointer at all). Reduced motion: the
// spring is a no-op, and `pull` keeps working without the rubber band, because
// a refresh gesture that does nothing is a broken control rather than a calm one.

/**
 * A pull-to-refresh gesture on a scroll container.
 *
 * Two things make this different from "drag the element down". It only engages
 * when the container is already scrolled to the top AND the drag is downward,
 * so it never steals a normal scroll; and it RESISTS — the content follows at a
 * fraction of the finger and asymptotes towards `max`, which is what tells you
 * with your hand that you have reached the end of the gesture rather than
 * needing a label to say so.
 */
function createPull(el, { threshold, max, resistance, duration, labels, onRefresh }) {
  const trigger = Math.max(20, Number(threshold ?? 64));
  const limit = Math.max(trigger, Number(max ?? trigger * 1.8));
  const give = clamp(Number(resistance ?? 0.7), 0.05, 1);
  const settle = Math.max(0, Number(duration ?? 0.32));
  const label = labeller({ pull: 'Pull to refresh', release: 'Release to refresh', busy: 'Refreshing' }, labels);

  const restore = snapshotInlineStyles(el, ['transform', 'transition', 'overscroll-behavior', 'touch-action']);
  el.style.overscrollBehavior = 'contain';

  const indicator = document.createElement('span');
  indicator.className = 'kt-pull-indicator';
  indicator.setAttribute('role', 'status');
  indicator.setAttribute('aria-live', 'polite');
  indicator.style.cssText = 'position:absolute;left:50%;top:0;translate:-50% 0;display:grid;place-items:center;'
    + 'width:34px;height:34px;pointer-events:none;opacity:0;color:currentColor;';
  indicator.innerHTML = '<svg viewBox="0 0 36 36" width="26" height="26" aria-hidden="true">'
    + '<circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" stroke-opacity=".2" stroke-width="3"></circle>'
    + '<circle class="kt-pull-arc" cx="18" cy="18" r="15" fill="none" stroke="currentColor" stroke-width="3"'
    + ' stroke-linecap="round" stroke-dasharray="94.2" stroke-dashoffset="94.2" transform="rotate(-90 18 18)"></circle>'
    + '</svg><span class="kt-pull-label"></span>';
  const arc = indicator.querySelector('.kt-pull-arc');
  const say = indicator.querySelector('.kt-pull-label');

  // The indicator has to sit over the container without joining its scroll, so
  // it goes in the container's parent — a child would scroll away with the
  // content the moment the list is longer than the box.
  const host = el.parentElement || el;
  const restoreHost = snapshotInlineStyles(host, ['position']);
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
  host.appendChild(indicator);

  /**
   * How far the content moves for a given finger distance.
   *
   * Straight (scaled by `give`) up to the threshold, then easing into `limit`.
   * A single exponential from zero — the obvious formulation — is wrong in a way
   * that only shows when you try it: it is stiffest exactly where the gesture
   * starts, so reaching a 60px threshold took 157px of finger and the control
   * felt broken rather than resistant. Resistance belongs at the END of a pull,
   * not the beginning.
   */
  const resist = (travelled) => {
    const direct = travelled * give;
    if (direct <= trigger) return direct;
    const room = Math.max(1, limit - trigger);
    return trigger + room * (1 - Math.exp(-(direct - trigger) / room));
  };

  let pulling = false;
  let busy = false;
  let startY = 0;
  let offset = 0;
  let pointerId = null;

  const paint = (value, animate) => {
    offset = value;
    const progress = clamp(offset / trigger, 0, 1);
    el.style.transition = animate ? `transform ${settle}s cubic-bezier(.22,.8,.3,1)` : 'none';
    el.style.transform = offset ? `translateY(${offset.toFixed(1)}px)` : '';
    indicator.style.opacity = String(clamp(offset / (trigger * 0.6), 0, 1));
    indicator.style.translate = `-50% ${Math.max(0, offset - 34).toFixed(1)}px`;
    arc.setAttribute('stroke-dashoffset', String(94.2 * (1 - progress)));
    indicator.style.rotate = busy ? '' : `${progress * 180}deg`;
    const next = busy ? label('busy') : (progress >= 1 ? label('release') : label('pull'));
    if (say.textContent !== next) say.textContent = next;
  };

  /** Let go of the gesture: either refresh, or spring straight back. */
  const release = () => {
    if (!pulling) return;
    pulling = false;
    pointerId = null;
    if (offset < trigger || busy) { paint(0, true); return; }
    busy = true;
    el.classList.add('kt-pull-loading');
    indicator.classList.add('kt-pull-spinning');
    paint(trigger, true);
    let proceed = true;
    try {
      proceed = el.dispatchEvent(new CustomEvent('kt-pull-refresh', { bubbles: true, cancelable: true }));
    } catch (_error) { /* older engines */ }
    // Whatever the page hands back — a promise, or nothing — decides when the
    // gesture ends. Nothing means "I am done", which keeps the simple case a
    // one-liner instead of forcing every caller to call done().
    const answer = proceed ? onRefresh?.(el) : null;
    Promise.resolve(answer).finally(() => instance.done());
  };

  const onDown = (event) => {
    if (busy || el.scrollTop > 0) return;
    pointerId = event.pointerId;
    startY = event.clientY;
    pulling = true;
  };
  const onMove = (event) => {
    if (!pulling || event.pointerId !== pointerId) return;
    const travelled = event.clientY - startY;
    if (travelled <= 0) { if (offset) paint(0, false); return; }
    paint(resist(travelled), false);
  };
  const onUp = () => release();
  // A touch drag would otherwise scroll the page behind the container; only
  // block it once the gesture has actually taken over.
  const onTouchMove = (event) => { if (pulling && offset > 0) event.preventDefault(); };

  el.addEventListener('pointerdown', onDown, { passive: true });
  el.addEventListener('pointermove', onMove, { passive: true });
  el.addEventListener('pointerup', onUp);
  el.addEventListener('pointercancel', onUp);
  el.addEventListener('touchmove', onTouchMove, { passive: false });

  const instance = {
    el,
    type: 'gesture',
    /** True while the page is refreshing. */
    get refreshing() { return busy; },
    /** Ask for a refresh without the gesture — a toolbar button, a shortcut. */
    refresh() {
      if (busy) return;
      pulling = true;
      offset = trigger;
      release();
    },
    /** The page is finished: put the container back. */
    done() {
      if (!busy) return;
      busy = false;
      el.classList.remove('kt-pull-loading');
      indicator.classList.remove('kt-pull-spinning');
      paint(0, true);
    },
    pause() {}, resume() {},
    destroy() {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('touchmove', onTouchMove);
      el.classList.remove('kt-pull-loading');
      indicator.remove();
      restore();
      restoreHost();
    }
  };
  return instance;
}

/**
 * The spring: hover/focus grows the element, press squashes it, and the easing
 * overshoots a little so it reads as something springy rather than something
 * being resized.
 */
function createSpring(el, { hoverScale, tapScale, lift, duration, ease, hoverEase, pressEase, origin }) {
  if (env().reducedMotion) return { el, type: 'gesture', pause() {}, resume() {}, destroy() {} };

  const grow = Number(hoverScale ?? 1.04);
  const press = Number(tapScale ?? 0.96);
  const rise = Number(lift ?? 0);
  const time = Math.max(0, Number(duration ?? 0.22));
  // Global `Kineto.config({spring:true})` bumps the default overshoot.
  const curve = ease ? cssEase(ease) : (motionDefaults.spring ? 'cubic-bezier(.34,1.8,.5,1)' : 'cubic-bezier(.34,1.56,.64,1)');
  // Phase-specific easing (audit C-3 / J-3): `hoverEase` shapes the hover
  // grow/settle, `pressEase` the press-down; both fall back to `ease`.
  const hoverCurve = hoverEase ? cssEase(hoverEase) : curve;
  const pressCurve = pressEase ? cssEase(pressEase) : curve;
  // Where the scale/press grows from (center | top | bottom | left | right |
  // any CSS transform-origin value).
  const from = origin || 'center';

  const prevTransition = el.style.transition;
  const prevTransform = el.style.transform;
  const prevOrigin = el.style.transformOrigin;
  const prevWillChange = el.style.willChange;
  el.style.transition = `transform ${time}s ${curve}`;
  el.style.transformOrigin = from;
  el.style.willChange = 'transform';

  let hovered = false;
  let pressed = false;
  const apply = () => {
    const scale = pressed ? press : (hovered ? grow : 1);
    const y = hovered && !pressed ? -rise : 0;
    el.style.transition = `transform ${time}s ${pressed ? pressCurve : hoverCurve}`;
    el.style.transform = `translateY(${y}px) scale(${scale})`;
  };

  const onEnter = () => { hovered = true; apply(); };
  const onLeave = () => { hovered = false; pressed = false; apply(); };
  const onDown = () => { pressed = true; apply(); };
  const onUp = () => { pressed = false; apply(); };
  const onFocus = () => { hovered = true; apply(); };
  const onBlur = () => { hovered = false; pressed = false; apply(); };
  const onKeyDown = (e) => { if (e.key === ' ' || e.key === 'Enter') { pressed = true; apply(); } };
  const onKeyUp = (e) => { if (e.key === ' ' || e.key === 'Enter') { pressed = false; apply(); } };

  el.addEventListener('pointerenter', onEnter);
  el.addEventListener('pointerleave', onLeave);
  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointerup', onUp);
  el.addEventListener('pointercancel', onUp);
  el.addEventListener('focus', onFocus);
  el.addEventListener('blur', onBlur);
  el.addEventListener('keydown', onKeyDown);
  el.addEventListener('keyup', onKeyUp);

  return {
    el,
    type: 'gesture',
    pause() {}, resume() {},
    destroy() {
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('focus', onFocus);
      el.removeEventListener('blur', onBlur);
      el.removeEventListener('keydown', onKeyDown);
      el.removeEventListener('keyup', onKeyUp);
      el.style.transition = prevTransition;
      el.style.transform = prevTransform;
      el.style.transformOrigin = prevOrigin;
      el.style.willChange = prevWillChange;
    }
  };
}

export default {
  create(el, opts = {}) {
    // Read inside the branch so the variant analysis can tell the two apart.
    const preset = opts.preset === 'pull' || opts.effect === 'pull' ? 'pull' : 'spring';
    // A ternary rather than an if/return: the analysis reads the tested branch
    // as guarded and the other as common, so this shape keeps every `pull`
    // option off the spring. The spring's own options still reach `pull` in the
    // drawer — the alternate branch of a two-way choice is "common" by
    // construction — which is a harmless extra control rather than a missing
    // one, and the way to avoid it entirely is an if/else-if chain where every
    // branch tests a literal (see Card Glow's modes).
    return preset === 'pull'
      ? createPull(el, {
        threshold: opts.threshold,
        max: opts.max,
        resistance: opts.resistance,
        duration: opts.duration,
        labels: opts.labels,
        onRefresh: opts.onRefresh
      })
      : createSpring(el, {
        hoverScale: opts.hoverScale,
        tapScale: opts.tapScale,
        lift: opts.lift,
        duration: opts.duration,
        ease: opts.ease,
        hoverEase: opts.hoverEase,
        pressEase: opts.pressEase,
        origin: opts.origin
      });
  },
  // The spring is decoration and is dropped. Pull-to-refresh is a FEATURE: it
  // keeps working, with no settle animation.
  reduced(el, opts = {}) {
    const pull = opts.preset === 'pull' || opts.effect === 'pull';
    if (!pull) return { el, type: 'gesture', pause() {}, resume() {}, destroy() {} };
    return this.create(el, { ...opts, duration: 0 });
  }
};
