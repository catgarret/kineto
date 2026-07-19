import { clamp, G, observeOnce, snapshotAttributes, snapshotInlineStyles, ST } from '../utils.js';

const PRESETS = {
  fade: { opacity: 0 },
  'fade-up': { y: 40, opacity: 0 },
  'fade-down': { y: -40, opacity: 0 },
  'fade-left': { x: -40, opacity: 0 },
  'fade-right': { x: 40, opacity: 0 },
  'slide-up': { yPercent: 100, opacity: 0 },
  'slide-down': { yPercent: -100, opacity: 0 },
  'slide-left': { xPercent: -100, opacity: 0 },
  'slide-right': { xPercent: 100, opacity: 0 },
  zoom: { scale: 0.86, opacity: 0 },
  'zoom-in': { scale: 0.78, opacity: 0 },
  'zoom-out': { scale: 1.16, opacity: 0 },
  blur: { filter: 'blur(20px)', opacity: 0 },
  rise: { y: 72, scale: 0.96, opacity: 0 },
  soft: { y: 24, filter: 'blur(8px)', opacity: 0 },
  flip: { rotationX: -80, transformPerspective: 900, transformOrigin: '50% 100%', opacity: 0 },
  'flip-x': { rotationX: -80, transformPerspective: 900, opacity: 0 },
  'flip-y': { rotationY: -80, transformPerspective: 900, opacity: 0 },
  rotate: { rotate: -8, scale: 0.92, opacity: 0 },
  mask: { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
  wipe: { clipPath: 'inset(100% 0 0 0)', opacity: 1 }
};

function directionalClip(direction) {
  if (direction === 'down') return 'inset(0 0 100% 0)';
  if (direction === 'left') return 'inset(0 0 0 100%)';
  if (direction === 'right') return 'inset(0 100% 0 0)';
  return 'inset(100% 0 0 0)';
}

function addClasses(el, opts) {
  const enter = String(opts.enterClass || opts.activeClass || 'is-inview').split(/\s+/).filter(Boolean);
  const leave = String(opts.leaveClass || '').split(/\s+/).filter(Boolean);
  leave.forEach((className) => el.classList.remove(className));
  enter.forEach((className) => el.classList.add(className));
  opts.onClassChange?.(true, el);
}

function removeClasses(el, opts) {
  const enter = String(opts.enterClass || opts.activeClass || 'is-inview').split(/\s+/).filter(Boolean);
  const leave = String(opts.leaveClass || '').split(/\s+/).filter(Boolean);
  enter.forEach((className) => el.classList.remove(className));
  leave.forEach((className) => el.classList.add(className));
  opts.onClassChange?.(false, el);
}

export { PRESETS };

export default {
  create(el, opts = {}) {
    const gsap = G();
    const scrollTrigger = ST();
    const preset = opts.preset || 'fade-up';
    const direction = opts.direction || 'up';
    const classOnly = opts.classOnly === true || preset === 'class';
    const once = opts.once !== false;
    const originalClass = el.getAttribute('class');

    if (classOnly) {
      let observer = null;
      let trigger = null;
      const enter = () => {
        addClasses(el, opts);
        opts.onEnter?.(el);
      };
      const leave = () => {
        if (opts.removeClassOnLeave === false) return;
        removeClasses(el, opts);
        opts.onLeave?.(el);
      };
      if (scrollTrigger) {
        trigger = scrollTrigger.create({
          trigger: el,
          start: opts.start || 'top 85%',
          end: opts.end || 'bottom 15%',
          once,
          onEnter: enter,
          onEnterBack: () => { enter(); opts.onEnterBack?.(el); },
          onLeave: leave,
          onLeaveBack: () => { leave(); opts.onLeaveBack?.(el); }
        });
      } else if (once) {
        observer = observeOnce(el, enter, { threshold: Number(opts.threshold ?? 0.1), rootMargin: opts.rootMargin || '0px 0px -10% 0px' });
      } else if (typeof IntersectionObserver !== 'undefined') {
        observer = new IntersectionObserver(([entry]) => entry.isIntersecting ? enter() : leave(), {
          threshold: Number(opts.threshold ?? 0.1), rootMargin: opts.rootMargin || '0px'
        });
        observer.observe(el);
      } else enter();
      return {
        el,
        type: 'reveal',
        replay() { removeClasses(el, opts); requestAnimationFrame(enter); },
        pause() { trigger?.disable?.(); observer?.disconnect?.(); },
        resume() { trigger?.enable?.(); },
        destroy() {
          trigger?.kill?.();
          observer?.disconnect?.();
          if (originalClass == null) el.removeAttribute('class'); else el.setAttribute('class', originalClass);
        }
      };
    }

    if (preset === 'clock') {
      // Clock wipe: a conic mask sweeps around like a watch hand until the
      // content is fully revealed (SOL-style timed activation).
      const startAngle = Number(opts.startAngle ?? 0);
      const counter = opts.clockDirection === 'ccw';
      const duration = Math.max(0.05, Number(opts.duration ?? 1.4));
      const originalStyleAttr = el.getAttribute('style');
      const apply = (progress) => {
        const sweep = clamp(progress, 0, 1) * 360;
        const gradient = counter
          ? `conic-gradient(from ${startAngle}deg, transparent 0deg ${360 - sweep}deg, #000 ${360 - sweep}deg)`
          : `conic-gradient(from ${startAngle}deg, #000 ${sweep}deg, transparent ${sweep}deg)`;
        el.style.maskImage = gradient;
        el.style.webkitMaskImage = gradient;
        el.style.opacity = '1';
      };
      apply(0);
      let clockTween = null;
      let clockRaf = null;
      let clockObserver = null;
      const finish = () => {
        el.style.maskImage = 'none';
        el.style.webkitMaskImage = 'none';
        addClasses(el, opts);
        opts.onComplete?.(el);
      };
      const runRaf = () => {
        let startTime = null;
        const frame = (time) => {
          if (startTime == null) startTime = time;
          const progress = Math.min(1, (time - startTime) / (duration * 1000));
          apply(progress);
          if (progress < 1) clockRaf = requestAnimationFrame(frame);
          else finish();
        };
        clockRaf = requestAnimationFrame(frame);
      };
      const startClock = () => {
        if (gsap) {
          const state = { p: 0 };
          clockTween = gsap.to(state, {
            p: 1,
            duration,
            delay: Number(opts.delay ?? 0),
            ease: opts.ease || 'power1.inOut',
            onUpdate: () => apply(state.p),
            onComplete: finish
          });
        } else runRaf();
      };
      if (scrollTrigger) {
        clockObserver = scrollTrigger.create({
          trigger: el,
          start: opts.start || 'top 85%',
          once: true,
          onEnter: startClock
        });
      } else clockObserver = observeOnce(el, startClock, { threshold: Number(opts.threshold ?? 0.2) });
      return {
        el,
        type: 'reveal',
        replay() {
          clockTween?.kill?.();
          if (clockRaf != null) cancelAnimationFrame(clockRaf);
          apply(0);
          startClock();
        },
        pause() { clockTween?.pause?.(); },
        resume() { clockTween?.resume?.(); },
        destroy() {
          clockTween?.kill?.();
          if (clockRaf != null) cancelAnimationFrame(clockRaf);
          clockObserver?.kill?.();
          clockObserver?.disconnect?.();
          if (originalStyleAttr == null) el.removeAttribute('style'); else el.setAttribute('style', originalStyleAttr);
        }
      };
    }

    let from = PRESETS[preset];
    if (preset === 'wipe' || preset === 'mask') from = { clipPath: directionalClip(direction), opacity: 1 };
    if (!from) {
      console.warn(`[Kineto/reveal] Unknown preset: ${preset}`);
      return null;
    }
    if (!gsap || !scrollTrigger) return this.fallback(el, opts, from);

    const target = opts.stagger && el.children.length ? Array.from(el.children) : el;
    const targets = Array.isArray(target) ? target : [target];
    const restores = targets.map((node) => snapshotAttributes(node, ['style', 'class']));
    const duration = Math.max(0, Number(opts.duration ?? 0.8));
    const ease = opts.ease || (opts.spring === true ? 'back.out(1.25)' : 'power3.out');
    const animateVars = {
      x: 0,
      y: 0,
      xPercent: 0,
      yPercent: 0,
      scale: 1,
      rotation: 0,
      rotationX: 0,
      rotationY: 0,
      opacity: 1,
      filter: 'blur(0px)',
      clipPath: 'inset(0 0 0 0)',
      duration,
      delay: Number(opts.delay ?? 0),
      ease,
      stagger: opts.stagger || undefined,
      onStart: () => addClasses(el, opts),
      onComplete: () => opts.onComplete?.(el)
    };
    const to = {
      ...animateVars,
      scrollTrigger: {
        trigger: el,
        start: opts.start || 'top 85%',
        end: opts.end,
        toggleActions: once ? 'play none none none' : 'play reverse play reverse',
        onEnter: () => opts.onEnter?.(el),
        onLeave: () => {
          opts.onLeave?.(el);
          if (!once && opts.removeClassOnLeave !== false) removeClasses(el, opts);
        },
        onEnterBack: () => { addClasses(el, opts); opts.onEnterBack?.(el); },
        onLeaveBack: () => {
          opts.onLeaveBack?.(el);
          if (!once && opts.removeClassOnLeave !== false) removeClasses(el, opts);
        }
      }
    };
    targets.forEach((node) => { node.style.willChange = 'transform,opacity,filter,clip-path'; });
    const tween = gsap.fromTo(target, from, to);
    return {
      el,
      type: 'reveal',
      // Play the entrance now as a one-shot, independent of the scroll trigger —
      // ScrollTrigger holds its own tween paused while the element is already in
      // view, so tween.restart() alone would just snap back to the start state.
      replay() { gsap.fromTo(target, from, { ...animateVars, delay: 0, overwrite: 'auto' }); },
      pause() { tween.pause(); },
      resume() { tween.resume(); },
      destroy() {
        tween.scrollTrigger?.kill?.();
        tween.kill();
        restores.forEach((restore) => restore());
      }
    };
  },

  reduced(el) {
    const restore = snapshotInlineStyles(el, ['opacity', 'transform', 'filter', 'clipPath']);
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.style.filter = 'none';
    el.style.clipPath = 'none';
    return { el, type: 'reveal', pause() {}, resume() {}, destroy: restore };
  },

  fallback(el, opts = {}, from = PRESETS['fade-up']) {
    const restore = snapshotAttributes(el, ['style', 'class']);
    const x = Number(from.x ?? 0);
    const y = Number(from.y ?? 24);
    const scale = Number(from.scale ?? 1);
    el.style.opacity = String(from.opacity ?? 0);
    el.style.transform = `translate3d(${x}px,${y}px,0) scale(${scale})`;
    if (from.filter) el.style.filter = from.filter;
    if (from.clipPath) el.style.clipPath = from.clipPath;
    const enter = () => {
      const duration = Math.max(0, Number(opts.duration ?? 0.55));
      el.style.transition = `opacity ${duration}s ease,transform ${duration}s ease,filter ${duration}s ease,clip-path ${duration}s ease`;
      addClasses(el, opts);
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.filter = 'none';
        el.style.clipPath = 'inset(0)';
        opts.onComplete?.(el);
      });
    };
    const observer = observeOnce(el, enter, { threshold: Number(opts.threshold ?? 0.1), rootMargin: opts.rootMargin || '0px 0px -10% 0px' });
    return {
      el,
      type: 'reveal',
      replay() { el.style.opacity = String(from.opacity ?? 0); requestAnimationFrame(enter); },
      pause() {},
      resume() {},
      destroy() { observer.disconnect(); restore(); }
    };
  }
};
