import { cssEase, env, motionDefaults } from '../utils.js';

// Gesture — Motion-style whileHover / whileTap feedback. The element springs up
// (and optionally lifts) on hover/focus and presses down on pointer/keydown,
// with a springy easing. Keyboard-accessible (focus mirrors hover, Space/Enter
// press). Reduced motion: no-op. Options: hoverScale, tapScale, lift, duration,
// ease.
export default {
  create(el, opts = {}) {
    if (env().reducedMotion) return { el, type: 'gesture', pause() {}, resume() {}, destroy() {} };

    const hoverScale = Number(opts.hoverScale ?? 1.04);
    const tapScale = Number(opts.tapScale ?? 0.96);
    const lift = Number(opts.lift ?? 0);
    const duration = Math.max(0, Number(opts.duration ?? 0.22));
    // Global `Kineto.config({spring:true})` bumps the default overshoot.
    const ease = opts.ease ? cssEase(opts.ease) : (motionDefaults.spring ? 'cubic-bezier(.34,1.8,.5,1)' : 'cubic-bezier(.34,1.56,.64,1)');
    // Phase-specific easing (audit C-3 / J-3): `hoverEase` shapes the hover
    // grow/settle, `pressEase` the press-down; both fall back to `ease`.
    const hoverEase = opts.hoverEase ? cssEase(opts.hoverEase) : ease;
    const pressEase = opts.pressEase ? cssEase(opts.pressEase) : ease;
    // Where the scale/press grows from (center | top | bottom | left | right |
    // any CSS transform-origin value).
    const origin = opts.origin || 'center';

    const prevTransition = el.style.transition;
    const prevTransform = el.style.transform;
    const prevOrigin = el.style.transformOrigin;
    const prevWillChange = el.style.willChange;
    el.style.transition = `transform ${duration}s ${ease}`;
    el.style.transformOrigin = origin;
    el.style.willChange = 'transform';

    let hovered = false;
    let pressed = false;
    const apply = () => {
      const scale = pressed ? tapScale : (hovered ? hoverScale : 1);
      const y = hovered && !pressed ? -lift : 0;
      el.style.transition = `transform ${duration}s ${pressed ? pressEase : hoverEase}`;
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
  },
  reduced(el) { return { el, type: 'gesture', pause() {}, resume() {}, destroy() {} }; }
};
