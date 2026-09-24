import { clamp, G, gsapEaseName, latestEntry, motionDefaults, observeOnce, snapshotAttributes, snapshotInlineStyles, ST } from '../utils.js';
import { cubicBezierFn, fn as easingFn } from '../easings.js';

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
  'zoom-in': { scale: 0.78, opacity: 0 },
  'zoom-out': { scale: 1.16, opacity: 0 },
  blur: { filter: 'blur(20px)', opacity: 0 },
  rise: { y: 72, scale: 0.96, opacity: 0 },
  soft: { y: 24, filter: 'blur(8px)', opacity: 0 },
  'flip-x': { rotationX: -80, transformPerspective: 900, opacity: 0 },
  'flip-y': { rotationY: -80, transformPerspective: 900, opacity: 0 },
  rotate: { rotate: -8, scale: 0.92, opacity: 0 },
  // Rotation about a CORNER rather than the centre. `rotate` spins in place;
  // this one hinges, which is a different read at the same angle.
  swing: { rotate: -12, x: -28, transformOrigin: '0% 0%', opacity: 0 },
  // Shear. Nothing else in this table deforms — everything moves, scales,
  // blurs, rotates or clips.
  skew: { skewY: 7, y: 28, opacity: 0 },
  mask: { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
  wipe: { clipPath: 'inset(100% 0 0 0)', opacity: 1 }
};

// Per-index stagger delays that mirror gsap's stagger `from` orders, so wipe/mask
// (which run on their own clip-path proxy tweens, not a gsap stagger) still honor
// the `order` option: start / end / center / edges / random.
const ORDER_PRESETS = new Set(['start', 'end', 'center', 'edges', 'random']);
const revealTargets = (el, opts) => opts.stagger && el.children.length ? Array.from(el.children) : [el];
// Staggered children and their root share one author-state lifetime.
function snapshotTargets(el, targets) {
  const restores = [...new Set([...targets, el])].map((node) => snapshotAttributes(node, ['style', 'class']));
  return () => restores.forEach((restore) => restore());
}

function normalizeOrder(value) {
  return ORDER_PRESETS.has(String(value)) ? String(value) : 'start';
}

function staggerDelays(count, each, from) {
  from = normalizeOrder(from);
  const step = Math.max(0, Number(each) || 0);
  const last = Math.max(0, count - 1);
  const mid = last / 2;
  let dist;
  if (from === 'end') dist = (i) => last - i;
  else if (from === 'center') dist = (i) => Math.abs(i - mid);
  else if (from === 'edges') dist = (i) => mid - Math.abs(i - mid);
  else if (from === 'random') {
    // Use a real shuffled rank (0...n-1), not unrelated random fractions.
    // This guarantees every item gets a distinct slot in the reveal sequence.
    const ranks = Array.from({ length: count }, (_unused, i) => i);
    for (let i = ranks.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [ranks[i], ranks[j]] = [ranks[j], ranks[i]];
    }
    dist = (i) => ranks[i];
  }
  else dist = (i) => i; // 'start' (default)
  return Array.from({ length: count }, (_unused, i) => dist(i) * step);
}

function setClasses(el, opts, active) {
  const enter = String(opts.enterClass || opts.activeClass || 'is-inview').split(/\s+/).filter(Boolean);
  const leave = String(opts.leaveClass || '').split(/\s+/).filter(Boolean);
  const [remove, add] = active ? [leave, enter] : [enter, leave];
  el.classList.remove(...remove);
  el.classList.add(...add);
  opts.onClassChange?.(active, el);
}

const addClasses = (el, opts) => setClasses(el, opts, true);
const removeClasses = (el, opts) => setClasses(el, opts, false);

// A shared, frame-coalesced boundary observer for native timelines. IO wakes it
// on layout changes; captured scroll events include nested scrolling containers.
function observeBoundaries(el, opts, clock, boundary, watch, visibleOnly, bounds = () => el.getBoundingClientRect()) {
  let stopped = false, raf = null, zone = null, observer = null;
  const threshold = Number(opts.threshold ?? (clock ? .2 : .1));
  const margin = String(opts.rootMargin || (clock ? '0px' : '0px 0px -10% 0px')).trim().split(/\s+/);
  const measure = () => {
    raf = null;
    if (stopped) return;
    const width = document.documentElement.clientWidth || window.innerWidth;
    const height = document.documentElement.clientHeight || window.innerHeight;
    const offsets = [0, 1, 2, 3].map((index) => {
      const value = margin[index] || margin[index % 2] || margin[0];
      return Number.parseFloat(value) * (value.endsWith('%') ? width / 100 : 1);
    });
    const rect = bounds();
    let top = -offsets[0], bottom = height + offsets[2], left = -offsets[3], right = width + offsets[1];
    for (let parent = el.parentElement; parent; parent = parent.parentElement) {
      const style = getComputedStyle(parent);
      if (!/(hidden|clip|auto|scroll)/.test(style.overflowX + style.overflowY)) continue;
      const box = parent.getBoundingClientRect();
      const scaleX = parent.offsetWidth ? box.width / parent.offsetWidth : 1;
      const scaleY = parent.offsetHeight ? box.height / parent.offsetHeight : 1;
      if (style.overflowX !== 'visible') {
        left = Math.max(left, box.left + parent.clientLeft * scaleX);
        right = Math.min(right, box.left + (parent.clientLeft + parent.clientWidth) * scaleX);
      }
      if (style.overflowY !== 'visible') {
        top = Math.max(top, box.top + parent.clientTop * scaleY);
        bottom = Math.min(bottom, box.top + (parent.clientTop + parent.clientHeight) * scaleY);
      }
    }
    const area = Math.max(0, Math.min(rect.right, right) - Math.max(rect.left, left))
      * Math.max(0, Math.min(rect.bottom, bottom) - Math.max(rect.top, top));
    const visible = area > 0 && area / (rect.width * rect.height) >= threshold;
    if (visibleOnly) { if (visible) visibleOnly(); return; }
    const next = visible ? 0 : rect.top >= (top + bottom - rect.height) / 2 ? 1 : -1;
    const previous = zone;
    zone = next;
    if ((previous == null && next !== 0) || previous === next) return;
    if (previous === -1) boundary(2);
    else if (previous === 1 || previous == null) boundary(0);
    if (stopped) return;
    if (next === -1) boundary(1);
    else if (next === 1) boundary(3);
  };
  const schedule = () => { if (!stopped && raf == null) raf = requestAnimationFrame(measure); };
  if (typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver(schedule, { threshold, rootMargin: margin.join(' ') });
    observer.observe(el);
  } else if (!visibleOnly) boundary(0);
  if (watch && !visibleOnly) {
    document.addEventListener('scroll', schedule, { passive: true, capture: true });
    window.addEventListener('resize', schedule, { passive: true });
  }
  return { disconnect() {
    stopped = true;
    observer?.disconnect();
    if (raf != null) cancelAnimationFrame(raf);
    document.removeEventListener('scroll', schedule, true);
    window.removeEventListener('resize', schedule);
  } };
}

// One reversible clock drives every mask and staggered child. Scroll boundaries
// control the current run, so replay never revives an obsolete animation.
function maskedReveal(el, opts, gsap, scrollTrigger, clock, clipAt) {
  const preset = opts.preset || 'fade-up';
  const nodes = revealTargets(el, opts);
  const restore = snapshotTargets(el, nodes);
  const once = opts.once !== false;
  const watch = !once || opts.onEnter || opts.onLeave || opts.onEnterBack || opts.onLeaveBack;
  const state = { time: 0 };
  let destroyed = false;
  let paused = false;
  let played = false;
  let phase = -1;
  let rate = 1;
  let duration, delays, total, ease;
  let tween = null;
  let raf = null;
  let lastTime = null;
  let trigger = null;
  let observer = null;
  const stop = () => {
    tween?.pause();
    if (raf != null) cancelAnimationFrame(raf);
    raf = lastTime = null;
  };
  const paint = () => {
    if (destroyed) return;
    nodes.forEach((node, index) => {
      const progress = clamp(ease(clamp((state.time - delays[index]) / duration, 0, 1)), 0, 1);
      node.style.opacity = !gsap && !clock && progress === 0 ? '0' : '1';
      if (preset === 'clock') {
        const sweep = progress * 360;
        const stops = opts.clockDirection === 'ccw'
          ? `transparent 0deg ${360 - sweep}deg, #000 ${360 - sweep}deg`
          : `#000 ${sweep}deg, transparent ${sweep}deg`;
        const mask = progress === 1 ? 'none' : `conic-gradient(from ${Number(opts.startAngle ?? 0)}deg, ${stops})`;
        node.style.maskImage = node.style.webkitMaskImage = mask;
      } else {
        // Native IO must not mistake our own fully closed aperture for a scroll
        // exit. Hidden endpoints retain their box through opacity instead.
        const clip = progress >= .998 || (!gsap && progress === 0) ? 'none' : clipAt(1 - progress);
        node.style.clipPath = node.style.webkitClipPath = clip;
      }
      node.style.willChange = progress > 0 && progress < 1 ? (clock ? 'mask-image' : 'clip-path') : '';
    });
  };
  const complete = () => {
    if (destroyed) return;
    paint();
    if (!watch) { observer?.disconnect(); trigger?.kill(); }
    opts.onComplete?.(el);
  };
  const frame = (time) => {
    raf = null;
    if (destroyed || paused) return;
    if (lastTime != null) state.time = clamp(state.time + (time - lastTime) * rate / 1000, 0, total);
    lastTime = time;
    paint();
    if (rate > 0 ? state.time < total : state.time > 0) raf = requestAnimationFrame(frame);
    else if (rate > 0) complete();
  };
  const drive = () => {
    if (destroyed || paused) return;
    if (gsap) { if (rate > 0) tween.play(); else tween.reverse(); }
    else if (raf == null && (rate > 0 ? state.time < total : state.time > 0)) {
      lastTime = null;
      raf = requestAnimationFrame(frame);
    }
  };
  const prepare = () => {
    stop();
    tween?.kill();
    duration = Math.max(.05, Number(opts.duration ?? (clock ? 1.4 : gsap ? .8 : .55)));
    const delay = Number(opts.delay ?? 0);
    delays = staggerDelays(nodes.length, opts.stagger, opts.order).map((value) => value + (gsap && !clock ? delay : Math.max(0, delay)));
    total = Math.max(.001, duration + Math.max(...delays));
    const configuredEase = opts.enterEase ?? opts.ease;
    const cssPoints = {
      ease: [.25, .1, .25, 1], 'ease-in': [.42, 0, 1, 1],
      'ease-out': [0, 0, .58, 1], 'ease-in-out': [.42, 0, .58, 1]
    }[configuredEase || (clock ? 'linear' : 'ease')]
      || String(configuredEase).match(/^cubic-bezier\(\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*\)$/)?.slice(1).map(Number);
    ease = gsap
      ? gsap.parseEase(configuredEase ? gsapEaseName(configuredEase) : clock ? 'power1.inOut' : (opts.spring ?? motionDefaults.spring) === true ? 'back.out(1.25)' : 'power3.out')
      : cssPoints ? cubicBezierFn(...cssPoints) : easingFn(configuredEase);
    state.time = 0;
    rate = 1;
    paint();
    if (gsap) tween = gsap.to(state, { time: total, duration: total, ease: 'none', paused: true, onUpdate: paint, onComplete: complete });
  };
  const boundary = (next) => {
    if (destroyed || phase === next) return;
    phase = next;
    if (next % 2 === 0 && (!played || !once)) {
      played = true;
      rate = 1;
      addClasses(el, opts);
      if (destroyed) return;
      drive();
    }
    [opts.onEnter, opts.onLeave, opts.onEnterBack, opts.onLeaveBack][next]?.(el);
    if (destroyed || next % 2 === 0 || once) return;
    if (opts.removeClassOnLeave !== false) removeClasses(el, opts);
    if (destroyed) return;
    rate = -1;
    drive();
  };
  prepare();

  if (scrollTrigger) trigger = scrollTrigger.create({
    trigger: el, start: opts.start || 'top 85%', end: opts.end,
    onEnter: () => boundary(0), onLeave: () => boundary(1),
    onEnterBack: () => boundary(2), onLeaveBack: () => boundary(3)
  });
  observer = observeBoundaries(el, opts, clock, boundary, watch,
    scrollTrigger ? () => { if (!played) boundary(0); } : null);
  return {
    el, type: 'reveal',
    replay(nextOptions) {
      if (destroyed) return;
      Object.assign(opts, nextOptions || {});
      prepare();
      paused = false;
      played = true;
      addClasses(el, opts);
      drive();
    },
    pause() { paused = true; stop(); },
    resume() { paused = false; drive(); },
    destroy() {
      destroyed = true;
      stop();
      tween?.kill();
      trigger?.kill();
      observer?.disconnect();
      restore();
    }
  };
}

export { PRESETS, staggerDelays };

export default {
  create(el, opts = {}, context) {
    const gsap = context?.performance === 'low' ? null : G();
    const scrollTrigger = gsap && ST();
    const preset = opts.preset || 'fade-up';
    const presetDirection = preset.startsWith('slide-') ? preset.slice(6) : null;
    const direction = opts.direction || presetDirection || (preset === 'mask' ? 'right' : 'up');
    const resolvedPreset = preset.startsWith('slide-') && ['up', 'down', 'left', 'right'].includes(direction)
      ? `slide-${direction}`
      : preset;
    const classOnly = opts.classOnly === true || preset === 'class';
    const once = opts.once !== false;
    const originalClass = el.getAttribute('class');

    if (classOnly) {
      let observer = null;
      let trigger = null;
      let replayRaf = null;
      let destroyed = false;
      let paused = false;
      let entered = false;
      const enter = () => {
        if (destroyed || paused) return;
        entered = true;
        addClasses(el, opts);
        if (!destroyed) opts.onEnter?.(el);
      };
      const leave = () => {
        if (destroyed || paused) return;
        if (opts.removeClassOnLeave === false) return;
        removeClasses(el, opts);
        if (!destroyed) opts.onLeave?.(el);
      };
      const resume = () => {
        if (destroyed || !paused) return;
        paused = false;
        trigger?.enable?.();
        if (!once || !entered) observer?.observe?.(el);
      };
      if (scrollTrigger) {
        trigger = scrollTrigger.create({
          trigger: el,
          start: opts.start || 'top 85%',
          end: opts.end || 'bottom 15%',
          once,
          onEnter: enter,
          onEnterBack: () => { enter(); if (!destroyed) opts.onEnterBack?.(el); },
          onLeave: leave,
          onLeaveBack: () => { leave(); if (!destroyed) opts.onLeaveBack?.(el); }
        });
      } else if (once) {
        observer = observeOnce(el, enter, { threshold: Number(opts.threshold ?? 0.1), rootMargin: opts.rootMargin || '0px 0px -10% 0px' });
      } else if (typeof IntersectionObserver !== 'undefined') {
        observer = new IntersectionObserver((entries) => (latestEntry(entries, el)?.isIntersecting ? enter() : leave()), {
          threshold: Number(opts.threshold ?? 0.1), rootMargin: opts.rootMargin || '0px'
        });
        observer.observe(el);
      } else enter();
      return {
        el,
        type: 'reveal',
        replay(nextOptions) {
          resume();
          if (destroyed) return;
          Object.assign(opts, nextOptions || {});
          if (replayRaf != null) cancelAnimationFrame(replayRaf);
          removeClasses(el, opts);
          if (destroyed) return;
          replayRaf = requestAnimationFrame(() => { replayRaf = null; enter(); });
        },
        pause() { if (destroyed) return; paused = true; trigger?.disable?.(); observer?.disconnect?.(); },
        resume,
        destroy() {
          destroyed = true;
          if (replayRaf != null) cancelAnimationFrame(replayRaf);
          trigger?.kill?.();
          observer?.disconnect?.();
          if (originalClass == null) el.removeAttribute('class'); else el.setAttribute('class', originalClass);
        }
      };
    }

    const clock = preset === 'clock';

    // Wipe/mask: gsap can't reliably tween a `clip-path: inset()` string, so we
    // animate the reveal via a numeric progress and build the inset ourselves in
    // onUpdate. clipAt(p): p=1 fully clipped (hidden) → p=0 fully shown.
    const isClip = resolvedPreset === 'wipe' || resolvedPreset === 'mask';
    const clipAt = (p) => {
      const v = `${(Math.max(0, Math.min(1, p)) * 100).toFixed(2)}%`;
      if (direction === 'down') return `inset(0px 0px ${v} 0px)`;
      if (direction === 'left') return `inset(0px 0px 0px ${v})`;
      if (direction === 'right') return `inset(0px ${v} 0px 0px)`;
      return `inset(${v} 0px 0px 0px)`; // up (default)
    };
    if (clock || isClip) return maskedReveal(el, opts, clock || scrollTrigger ? gsap : null, scrollTrigger, clock, clipAt);
    let from = PRESETS[resolvedPreset];
    // The historical slide presets use full-element percentages, which are good
    // for cards but too large for compact inline content. `distance` provides a
    // direct px override without forcing consumers to reproduce internal styles.
    if (from && opts.distance != null && opts.distance !== '') {
      const distance = Math.max(0, Number(opts.distance));
      if (Number.isFinite(distance)) {
        from = { ...from };
        if ('xPercent' in from) { from.x = Math.sign(from.xPercent || 1) * distance; delete from.xPercent; }
        if ('yPercent' in from) { from.y = Math.sign(from.yPercent || 1) * distance; delete from.yPercent; }
        if ('x' in from && !('xPercent' in PRESETS[resolvedPreset])) from.x = Math.sign(from.x || 1) * distance;
        if ('y' in from && !('yPercent' in PRESETS[resolvedPreset])) from.y = Math.sign(from.y || 1) * distance;
      }
    }
    if (!from) {
      console.warn(`[Kineto/reveal] Unknown preset: ${preset}`);
      return null;
    }
    if (!gsap || !scrollTrigger) return this.fallback(el, opts, from);


    const targets = revealTargets(el, opts);
    const restore = snapshotTargets(el, targets);
    const duration = Math.max(0, Number(opts.duration ?? 0.8));
    const ease = (opts.enterEase ?? opts.ease) ? gsapEaseName(opts.enterEase ?? opts.ease) : ((opts.spring ?? motionDefaults.spring) === true ? 'back.out(1.25)' : 'power3.out');
    let destroyed = false;
    const animateVars = (delay = Number(opts.delay ?? 0)) => {
      // Explicit delays keep every order preset identical across the GSAP and
      // CSS fallback paths. Random is rebuilt for each entrance/replay.
      const delays = staggerDelays(targets.length, opts.stagger, opts.order);
      return {
        x: 0,
        y: 0,
        xPercent: 0,
        yPercent: 0,
        scale: 1,
        rotation: 0,
        rotationX: 0,
        rotationY: 0,
        skewX: 0,
        skewY: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration,
        delay,
        ease,
        stagger: opts.stagger ? (index) => delays[index] : undefined,
        onStart: () => addClasses(el, opts),
        // Release the GPU layer once the entrance is done (frees graphics memory).
        onComplete: () => { targets.forEach((node) => { node.style.willChange = ''; }); opts.onComplete?.(el); }
      };
    };
    let tween = null;
    let activeTween = null;
    const useScrollTween = () => {
      if (!tween) return;
      if (activeTween !== tween) activeTween?.kill();
      activeTween = tween;
    };
    const to = {
      ...animateVars(),
      scrollTrigger: {
        trigger: el,
        start: opts.start || 'top 85%',
        end: opts.end,
        toggleActions: once ? 'play none none none' : 'play reverse play reverse',
        onEnter: () => { if (destroyed) return; useScrollTween(); opts.onEnter?.(el); },
        onLeave: () => {
          if (destroyed) return;
          useScrollTween();
          opts.onLeave?.(el);
          if (destroyed) return;
          if (!once && opts.removeClassOnLeave !== false) removeClasses(el, opts);
        },
        onEnterBack: () => {
          if (destroyed) return;
          useScrollTween();
          addClasses(el, opts);
          if (!destroyed) opts.onEnterBack?.(el);
        },
        onLeaveBack: () => {
          if (destroyed) return;
          useScrollTween();
          opts.onLeaveBack?.(el);
          if (destroyed) return;
          if (!once && opts.removeClassOnLeave !== false) removeClasses(el, opts);
        }
      }
    };
    targets.forEach((node) => { node.style.willChange = 'transform,opacity,filter,clip-path'; });
    tween = gsap.fromTo(targets, from, to);
    activeTween = tween;
    const playImmediate = (delay = 0) => {
      if (destroyed) return;
      io?.disconnect();
      io = null;
      // A repeatable entrance still needs its original timeline and trigger
      // for later leave/re-enter actions. The replay only temporarily owns the
      // rendered properties; a scroll boundary hands them back to that tween.
      if (once) tween.scrollTrigger?.disable(false);
      tween.pause();
      if (activeTween !== tween) activeTween.kill();
      activeTween = gsap.fromTo(targets, from, { ...animateVars(delay), overwrite: 'auto' });
    };

    // Backup trigger: ScrollTrigger can miss an element whose position it measured
    // before late images / the intro overlay settled, or one that is already in
    // view at init — leaving the entrance frozen at its `from` state (e.g. a wipe
    // stuck fully clipped). An IntersectionObserver guarantees the entrance plays
    // once the element is actually on screen, and yields to ScrollTrigger if it
    // already ran (tween.progress() > 0).
    let io = null;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver((entries) => {
        if (!latestEntry(entries, el)?.isIntersecting) return;
        io.disconnect(); io = null;
        if (tween.progress() === 0) {
          playImmediate(Number(opts.delay ?? 0));
        }
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      io.observe(el);
    }
    return {
      el,
      type: 'reveal',
      // Play the entrance now as a one-shot, independent of the scroll trigger —
      // ScrollTrigger holds its own tween paused while the element is already in
      // view, so tween.restart() alone would just snap back to the start state.
      replay(nextOptions) { Object.assign(opts, nextOptions || {}); playImmediate(); },
      pause() { activeTween.pause(); },
      resume() { activeTween.resume(); },
      destroy() {
        destroyed = true;
        io?.disconnect();
        tween.scrollTrigger?.kill?.();
        activeTween.kill();
        tween.kill();
        restore();
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
    // Core passes its context as the third argument; internal rendering passes
    // a resolved preset instead. Resolve low-tier options before rendering them.
    if (from.performance === 'low') return this.create(el, opts, from);
    const targets = revealTargets(el, opts);
    const restore = snapshotTargets(el, targets);
    const opacity = String(from.opacity ?? 0);
    const x = Number(from.x ?? 0);
    const y = Number(from.y ?? 0);
    const xPercent = Number(from.xPercent ?? 0);
    const yPercent = Number(from.yPercent ?? 0);
    const scale = Number(from.scale ?? 1);
    // Rotation and shear were silently dropped here, so without GSAP the `rotate`,
    // `flip-x` and `flip-y` presets all degraded to a plain slide-and-fade —
    // measured: `flip-x` produced `matrix(1, 0, 0, 1, 0, 24)`, i.e. no rotation at
    // all. Every key the preset table can contain has to be rendered, otherwise a
    // preset is only real when an optional third-party engine happens to be loaded.
    const rotate = Number(from.rotate ?? from.rotation ?? 0);
    const rotationX = Number(from.rotationX ?? 0);
    const rotationY = Number(from.rotationY ?? 0);
    const skewX = Number(from.skewX ?? 0);
    const skewY = Number(from.skewY ?? 0);
    const perspective = Number(from.transformPerspective ?? 0);
    const duration = Math.max(0, Number(opts.duration ?? 0.55));
    const once = opts.once !== false;
    const watch = !once || opts.onEnter || opts.onLeave || opts.onEnterBack || opts.onLeaveBack;
    let timers = [];
    let destroyed = false;
    let paused = false;
    let played = false, rate = 1, generation = 0;
    let observer = null;
    const animations = new Set();
    const pending = new Set();
    const rafs = new Set();
    const frame = (callback) => {
      const id = requestAnimationFrame(() => { rafs.delete(id); if (!destroyed) callback(); });
      rafs.add(id);
    };
    const stop = () => {
      generation++;
      animations.forEach((animation) => { animation.onfinish = null; animation.cancel(); });
      animations.clear();
      pending.clear();
      timers.forEach(clearTimeout);
      timers = [];
      rafs.forEach(cancelAnimationFrame);
      rafs.clear();
    };
    const complete = () => {
      if (destroyed || rate < 0) return;
      if (!watch) observer?.disconnect();
      opts.onComplete?.(el);
    };
    const drive = () => {
      animations.forEach((animation) => {
        animation.playbackRate = rate;
        const end = animation.effect.getComputedTiming().endTime;
        if (!paused && (rate > 0 ? animation.currentTime < end : animation.currentTime > 0)) animation.play();
      });
    };
    // `perspective()` must come FIRST in the transform list or it does not apply
    // to the rotations that follow it.
    const transformFrom = [
      perspective ? `perspective(${perspective}px)` : '',
      `translate3d(${x}px,${y}px,0)`,
      (xPercent || yPercent) ? `translate(${xPercent}%,${yPercent}%)` : '',
      rotate ? `rotate(${rotate}deg)` : '',
      rotationX ? `rotateX(${rotationX}deg)` : '',
      rotationY ? `rotateY(${rotationY}deg)` : '',
      skewX ? `skewX(${skewX}deg)` : '',
      skewY ? `skewY(${skewY}deg)` : '',
      scale !== 1 ? `scale(${scale})` : ''
    ].filter(Boolean).join(' ');
    const keyframes = [
      { opacity, transform: transformFrom, filter: from.filter || 'none' },
      { opacity: '1', transform: 'none', filter: 'none' }
    ];
    const initial = (node) => {
      node.style.transition = 'none';
      node.style.opacity = opacity;
      node.style.transform = transformFrom;
      if (from.transformOrigin) node.style.transformOrigin = from.transformOrigin;
      if (from.filter) node.style.filter = from.filter;
    };
    targets.forEach(initial);
    const enter = () => {
      if (destroyed) return;
      stop();
      const run = generation;
      played = true;
      rate = 1;
      const delays = staggerDelays(targets.length, opts.stagger, opts.order);
      const baseDelay = Math.max(0, Number(opts.delay ?? 0));
      const finalIndex = delays.indexOf(Math.max(...delays));
      addClasses(el, opts);
      if (destroyed || run !== generation) return;
      targets.forEach((node, index) => {
        if (typeof node.animate === 'function') {
          Object.assign(node.style, keyframes[1]);
          const animation = node.animate(keyframes, {
            duration: duration * 1000, delay: (baseDelay + delays[index]) * 1000,
            easing: 'ease', fill: once ? 'backwards' : 'both'
          });
          animations.add(animation);
          pending.add(animation);
          if (paused) animation.pause();
          animation.onfinish = () => {
            if (destroyed || run !== generation || rate < 0 || !pending.delete(animation)) return;
            if (once) { animation.onfinish = null; animations.delete(animation); }
            if (!pending.size) complete();
          };
          return;
        }
        timers.push(setTimeout(() => frame(() => {
          node.style.transition = `opacity ${duration}s ease,transform ${duration}s ease,filter ${duration}s ease`;
          Object.assign(node.style, keyframes[1]);
          if (index === finalIndex) timers.push(setTimeout(() => {
            complete();
          }, duration * 1000));
        }), (baseDelay + delays[index]) * 1000));
      });
    };
    const boundary = (next) => {
      if (destroyed) return;
      if (next % 2 === 0 && (!played || !once)) {
        if (!played || !animations.size) enter();
        else {
          rate = 1;
          animations.forEach(animation => pending.add(animation));
          addClasses(el, opts);
          if (!destroyed) drive();
        }
      }
      if (destroyed) return;
      const run = generation;
      [opts.onEnter, opts.onLeave, opts.onEnterBack, opts.onLeaveBack][next]?.(el);
      if (destroyed || run !== generation || next % 2 === 0 || once) return;
      if (opts.removeClassOnLeave !== false) removeClasses(el, opts);
      if (destroyed || run !== generation) return;
      rate = -1;
      if (animations.size) drive();
      else {
        stop();
        targets.forEach(node => {
          node.style.transition = `opacity ${duration}s ease,transform ${duration}s ease,filter ${duration}s ease`;
          Object.assign(node.style, keyframes[0]);
        });
      }
    };
    // Measure the layout box, not the translation/rotation we animate. Otherwise
    // reversing near an edge can move the target back inside and retrigger it.
    const bounds = () => {
      if (targets[0] !== el) return el.getBoundingClientRect();
      const value = el.style.getPropertyValue('transform');
      const priority = el.style.getPropertyPriority('transform');
      el.style.setProperty('transform', 'none', 'important');
      const rect = el.getBoundingClientRect();
      if (value) el.style.setProperty('transform', value, priority);
      else el.style.removeProperty('transform');
      return rect;
    };
    observer = observeBoundaries(el, opts, false, boundary, watch, null, bounds);
    return {
      el,
      type: 'reveal',
      replay(nextOptions) {
        if (destroyed) return;
        Object.assign(opts, nextOptions || {});
        paused = false;
        if (!watch) observer.disconnect();
        stop();
        targets.forEach(initial);
        frame(enter);
      },
      pause() { if (!destroyed) { paused = true; animations.forEach((animation) => animation.pause()); } },
      resume() { if (!destroyed) { paused = false; drive(); } },
      destroy() {
        destroyed = true;
        observer.disconnect();
        stop();
        // Flush the animation's inline declaration before restoring absent style
        // attributes; Chromium can otherwise serialize them back as style="".
        targets.forEach((node) => node.getAttribute('style'));
        restore();
      }
    };
  }
};
