import { G, snapshotInlineStyles, ST } from '../utils.js';

// Below this speed (px/s) a hovered or focused strip counts as stopped, so the
// loop can rest instead of easing toward zero forever.
const REST_VELOCITY = 0.5;

// A clone repeats the strip only for the eye. `aria-hidden` kept it out of the
// accessibility tree, but its links and buttons were still in the Tab order —
// focus landed on things a screen reader was told do not exist — and every
// id inside it existed twice. `inert` removes it from both.
function silenceClone(clone) {
  clone.setAttribute('aria-hidden', 'true');
  clone.inert = true;
  clone.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
}

export default {
  // Kineto.config({ defer: true }) may create this only when the element nears
  // the viewport (src/deferCreate.js): it only matters where it can be seen.
  defer: true,
  // Paused by the core while the element is off screen and resumed as it
  // returns (an endless strip that nobody can see is pure cost). See `offscreen` in src/core.js.
  offscreen: 'pause',
  create(el, opts) {
    const gsap = G();
    const scrollTrigger = ST();
    const originalHTML = el.innerHTML;
    const originalStyle = el.getAttribute('style');
    const speed = Math.abs(Number(opts.speed ?? 50));
    const direction = opts.direction === 'right' ? 1 : -1;
    const reverseOnScrollUp = opts.reverseOnScrollUp === true;
    const scrollAcceleration = Number(opts.scrollAcceleration ?? 0);
    const pauseOnHover = opts.pauseOnHover !== false;
    const cloneCount = Math.max(1, Number(opts.clones ?? 2));

    el.style.display = 'flex';
    el.style.overflow = 'hidden';
    el.style.whiteSpace = 'nowrap';
    // Edge fade: dissolve the left/right ends with a gradient mask so the loop
    // doesn't hard-cut at the container edges (great for logo strips / carousels).
    const fade = Math.max(0, Number(opts.fade ?? 0));
    if (fade > 0) {
      const maskValue = `linear-gradient(to right, transparent 0, #000 ${fade}px, #000 calc(100% - ${fade}px), transparent 100%)`;
      el.style.webkitMaskImage = maskValue;
      el.style.maskImage = maskValue;
    }

    const group = document.createElement('div');
    group.className = 'kt-marquee-group';
    group.style.cssText = 'display:flex;flex:0 0 auto;will-change:transform;';
    while (el.firstChild) group.appendChild(el.firstChild);
    el.appendChild(group);
    for (let index = 0; index < cloneCount; index += 1) {
      const clone = group.cloneNode(true);
      silenceClone(clone);
      el.appendChild(clone);
    }
    const groups = Array.from(el.children);

    let baseVelocity = speed * direction;
    let targetVelocity = baseVelocity;
    // `hovered` holds the strip still: the pointer is over it (pauseOnHover)
    // or keyboard focus is inside it, where a moving link cannot be read.
    let hovered = false;
    let pointerOver = false;
    let focusInside = false;
    let currentVelocity = baseVelocity;
    let groupWidth = 0;
    let position = 0;
    let alive = true;
    let rafId = null;
    let previousTime = performance.now();
    // The width comes from the ResizeObserver's first report instead of an
    // offsetWidth read here, right after building the strip (a forced layout
    // per marquee during create). The loop rests until it is known.
    const measureWidth = () => {
      const firstMeasure = groupWidth === 0;
      groupWidth = group.offsetWidth || 0;
      if (firstMeasure && direction > 0) position = -groupWidth;
      wake();
    };
    const marqueeResizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measureWidth) : null;
    marqueeResizeObserver?.observe(group);

    // One setter for the whole strip: gsap.set() per frame built a new tween
    // object every frame; quickSetter reuses one.
    const setGsapX = gsap?.quickSetter ? gsap.quickSetter(groups, 'x', 'px') : null;
    const setX = (value) => {
      if (setGsapX) setGsapX(value);
      else if (gsap) gsap.set(groups, { x: value });
      else groups.forEach((item) => { item.style.transform = `translate3d(${value}px,0,0)`; });
    };

    const tick = (time = performance.now()) => {
      rafId = null;
      if (!alive) return;
      const delta = Math.min(0.05, Math.max(0, (time - previousTime) / 1000));
      previousTime = time;
      const width = groupWidth;
      if (width <= 0) return; // measureWidth() wakes the loop
      currentVelocity += (targetVelocity - currentVelocity) * Math.min(1, delta * 8);
      // Held still and (almost) there: stop, and let pointerleave/focusout wake it.
      if (hovered && Math.abs(currentVelocity) < REST_VELOCITY && Math.abs(targetVelocity) < REST_VELOCITY) {
        currentVelocity = 0;
        return;
      }
      position += currentVelocity * delta;
      while (position <= -width) position += width;
      while (position > 0) position -= width;
      setX(position);
      // Drift back toward the base speed (scroll-boost recovery) — but never
      // while hovered, or pauseOnHover would immediately un-pause itself.
      if (!hovered) targetVelocity += (baseVelocity - targetVelocity) * Math.min(1, delta * 4);
      rafId = requestAnimationFrame(tick);
    };
    function wake() {
      if (!alive || rafId != null) return;
      previousTime = performance.now();
      rafId = requestAnimationFrame(tick);
    }
    if (!marqueeResizeObserver) measureWidth();

    let velocityTrigger = null;
    // Optional scroll-reactive skew: the line leans with scroll velocity and
    // springs back, adding a living, elastic feel.
    const maxSkew = Math.max(0, Number(opts.skew ?? 0));
    let skewTarget = 0;
    let skewCurrent = 0;
    let skewRaf = null;
    // The lean only needs frames while it is springing back: a scroll update
    // wakes it, and once it is upright again it stops asking for frames.
    const skewTick = () => {
      skewRaf = null;
      if (!alive) return;
      skewTarget *= 0.9;
      skewCurrent += (skewTarget - skewCurrent) * 0.12;
      const upright = Math.abs(skewTarget) < 0.001 && Math.abs(skewCurrent) < 0.001;
      if (upright) { skewTarget = 0; skewCurrent = 0; }
      el.style.transform = `skewX(${skewCurrent.toFixed(3)}deg)`;
      if (!upright) skewRaf = requestAnimationFrame(skewTick);
    };
    const wakeSkew = () => {
      if (alive && maxSkew > 0 && skewRaf == null) skewRaf = requestAnimationFrame(skewTick);
    };
    if (scrollTrigger && (reverseOnScrollUp || scrollAcceleration > 0 || maxSkew > 0)) {
      velocityTrigger = scrollTrigger.create({
        trigger: document.documentElement,
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const scrollVelocity = self.getVelocity();
          if (reverseOnScrollUp) baseVelocity = speed * (self.direction < 0 ? 1 : -1);
          if (!hovered && (reverseOnScrollUp || scrollAcceleration > 0)) {
            targetVelocity = baseVelocity + (scrollVelocity / 50) * scrollAcceleration * -direction;
          }
          wake();
          if (maxSkew > 0) {
            skewTarget = Math.max(-maxSkew, Math.min(maxSkew, (scrollVelocity / 220) * maxSkew));
            wakeSkew();
          }
        }
      });
      wakeSkew();
    }

    const syncHeld = () => {
      const held = pointerOver || focusInside;
      if (held === hovered) return;
      hovered = held;
      targetVelocity = hovered ? 0 : baseVelocity;
      wake();
    };
    const onEnter = () => { pointerOver = true; syncHeld(); };
    const onLeave = () => { pointerOver = false; syncHeld(); };
    // Keyboard focus always stops the strip (WCAG 2.2.2): a link that keeps
    // sliding away cannot be read or activated, and a keyboard user has no
    // hover to pause it with.
    const onFocusIn = () => { focusInside = true; syncHeld(); };
    const onFocusOut = (event) => {
      if (event.relatedTarget && el.contains(event.relatedTarget)) return;
      focusInside = false;
      syncHeld();
    };
    if (pauseOnHover) {
      el.addEventListener('pointerenter', onEnter);
      el.addEventListener('pointerleave', onLeave);
    }
    el.addEventListener('focusin', onFocusIn);
    el.addEventListener('focusout', onFocusOut);

    return {
      el,
      type: 'marquee',
      pause: () => {
        alive = false;
        if (rafId != null) cancelAnimationFrame(rafId);
        rafId = null;
        if (skewRaf != null) cancelAnimationFrame(skewRaf);
        skewRaf = null;
      },
      // Resume restarts the strip AND the lean (it used to stay frozen after
      // the first pause, because only the strip loop was restarted).
      resume: () => {
        if (alive) return;
        alive = true;
        wake();
        if (velocityTrigger) wakeSkew();
      },
      destroy: () => {
        alive = false;
        if (rafId != null) cancelAnimationFrame(rafId);
        if (skewRaf != null) cancelAnimationFrame(skewRaf);
        marqueeResizeObserver?.disconnect();
        velocityTrigger?.kill();
        el.removeEventListener('pointerenter', onEnter);
        el.removeEventListener('pointerleave', onLeave);
        el.removeEventListener('focusin', onFocusIn);
        el.removeEventListener('focusout', onFocusOut);
        el.innerHTML = originalHTML;
        if (originalStyle == null) el.removeAttribute('style'); else el.setAttribute('style', originalStyle);
      }
    };
  },
  reduced(el) {
    const restore = snapshotInlineStyles(el, ['overflowX', 'transform']);
    el.style.overflowX = 'auto';
    el.style.transform = 'none';
    return { el, type: 'marquee', pause() {}, resume() {}, destroy: restore };
  },
  fallback(el, opts) { return this.reduced(el, opts); }
};
