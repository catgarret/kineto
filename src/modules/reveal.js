import { clamp, G, gsapEaseName, motionDefaults, observeOnce, snapshotAttributes, snapshotInlineStyles, ST } from '../utils.js';

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

// Per-index stagger delays that mirror gsap's stagger `from` orders, so wipe/mask
// (which run on their own clip-path proxy tweens, not a gsap stagger) still honor
// the `order` option: start / end / center / edges / random.
const ORDER_PRESETS = new Set(['start', 'end', 'center', 'edges', 'random']);
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

export { PRESETS, staggerDelays };

export default {
  create(el, opts = {}) {
    const gsap = G();
    const scrollTrigger = ST();
    const preset = opts.preset || 'fade-up';
    const presetDirection = preset.startsWith('slide-') ? preset.slice(6) : null;
    const direction = opts.direction || presetDirection || 'up';
    const resolvedPreset = preset.startsWith('slide-') && ['up', 'down', 'left', 'right'].includes(direction)
      ? `slide-${direction}`
      : preset;
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
        replay(nextOptions) { Object.assign(opts, nextOptions || {}); removeClasses(el, opts); requestAnimationFrame(enter); },
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
            ease: (opts.enterEase ?? opts.ease) ? gsapEaseName(opts.enterEase ?? opts.ease) : 'power1.inOut',
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
        replay(nextOptions) {
          Object.assign(opts, nextOptions || {});
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
    let from = PRESETS[resolvedPreset];
    if (isClip) from = { opacity: 1, clipPath: clipAt(1) };
    if (!from) {
      console.warn(`[Kineto/reveal] Unknown preset: ${preset}`);
      return null;
    }
    if (!gsap || !scrollTrigger) return this.fallback(el, opts, from);

    // Wipe/mask run on their own proxy-number tween — a real changing value that
    // gsap always ticks — with the clip string built in onUpdate. Triggered by
    // ScrollTrigger plus an IntersectionObserver backup (already-in-view / late
    // layout), so the entrance never stays frozen at the clipped start.
    if (isClip) {
      // Stagger across children when asked (and they exist) so a list wipes in
      // item-by-item; otherwise the whole element is one clip. `order` reshapes
      // the per-child delays exactly like the transform path below.
      const clipNodes = (opts.stagger && el.children.length) ? Array.from(el.children) : [el];
      const staggered = clipNodes.length > 1;
      const nodeRestores = clipNodes.map((node) => snapshotAttributes(node, ['style', 'class']));
      const elRestore = staggered ? snapshotAttributes(el, ['style', 'class']) : null;
      const clipRestore = () => { nodeRestores.forEach((fn) => fn()); elRestore?.(); };
      const clipDuration = Math.max(0.05, Number(opts.duration ?? 0.8));
      // Compute ease locally: the shared `const ease` below is declared after this
      // branch's early return, so referencing it here would throw (TDZ).
      const clipEase = (opts.enterEase ?? opts.ease) ? gsapEaseName(opts.enterEase ?? opts.ease) : ((opts.spring ?? motionDefaults.spring) === true ? 'back.out(1.25)' : 'power3.out');
      const baseDelay = Number(opts.delay ?? 0);
      const states = clipNodes.map(() => ({ p: 1 }));
      // iOS Safari needs the -webkit- prefix to repaint clip-path each frame;
      // without it the intermediate frames are skipped and the reveal just pops.
      const applyNode = (i) => {
        const value = states[i].p <= 0.002 ? 'none' : clipAt(states[i].p);
        clipNodes[i].style.clipPath = value;
        clipNodes[i].style.webkitClipPath = value;
      };
      clipNodes.forEach((node, i) => { node.style.willChange = 'clip-path'; applyNode(i); });
      let clipTweens = [];
      let played = false;
      const play = () => {
        clipTweens.forEach((tween) => tween.kill());
        clipTweens = [];
        states.forEach((state, i) => { state.p = 1; applyNode(i); });
        addClasses(el, opts);
        // Recalculate on every run so random order really shuffles on replay.
        const delays = staggered ? staggerDelays(clipNodes.length, opts.stagger, opts.order) : [0];
        const finalIndex = delays.indexOf(Math.max(...delays));
        clipNodes.forEach((node, i) => {
          clipTweens.push(gsap.to(states[i], {
            p: 0, duration: clipDuration, ease: clipEase, delay: baseDelay + delays[i],
            onUpdate: () => applyNode(i),
            onComplete: () => { applyNode(i); node.style.willChange = ''; if (i === finalIndex) opts.onComplete?.(el); }
          }));
        });
      };
      const trigger = scrollTrigger.create({
        trigger: el, start: opts.start || 'top 85%', once,
        onEnter: () => { if (!played) { played = true; play(); } }
      });
      let clipIO = null;
      if (typeof IntersectionObserver !== 'undefined') {
        clipIO = new IntersectionObserver((entries) => {
          if (!entries.some((e) => e.isIntersecting) || played) return;
          played = true; clipIO.disconnect(); clipIO = null;
          trigger?.disable(false);
          play();
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
        clipIO.observe(el);
      }
      return {
        el,
        type: 'reveal',
        replay(nextOptions) { Object.assign(opts, nextOptions || {}); played = true; play(); },
        pause() { clipTweens.forEach((tween) => tween.pause()); },
        resume() { clipTweens.forEach((tween) => tween.resume()); },
        destroy() { clipIO?.disconnect(); trigger?.kill?.(); clipTweens.forEach((tween) => tween.kill()); clipRestore(); }
      };
    }

    const target = opts.stagger && el.children.length ? Array.from(el.children) : el;
    const targets = Array.isArray(target) ? target : [target];
    const restores = targets.map((node) => snapshotAttributes(node, ['style', 'class']));
    const duration = Math.max(0, Number(opts.duration ?? 0.8));
    const ease = (opts.enterEase ?? opts.ease) ? gsapEaseName(opts.enterEase ?? opts.ease) : ((opts.spring ?? motionDefaults.spring) === true ? 'back.out(1.25)' : 'power3.out');
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
    const to = {
      ...animateVars(),
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

    // Backup trigger: ScrollTrigger can miss an element whose position it measured
    // before late images / the intro overlay settled, or one that is already in
    // view at init — leaving the entrance frozen at its `from` state (e.g. a wipe
    // stuck fully clipped). An IntersectionObserver guarantees the entrance plays
    // once the element is actually on screen, and yields to ScrollTrigger if it
    // already ran (tween.progress() > 0).
    let io = null;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        io.disconnect(); io = null;
        if (tween.progress() === 0) {
          tween.scrollTrigger?.disable(false); // stop ScrollTrigger double-firing
          gsap.fromTo(target, from, { ...animateVars(0), overwrite: 'auto' });
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
      replay(nextOptions) { Object.assign(opts, nextOptions || {}); gsap.fromTo(target, from, { ...animateVars(0), overwrite: 'auto' }); },
      pause() { tween.pause(); },
      resume() { tween.resume(); },
      destroy() {
        io?.disconnect();
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
    const targets = opts.stagger && el.children.length ? Array.from(el.children) : [el];
    const restores = targets.map((node) => snapshotAttributes(node, ['style', 'class']));
    const restoreRoot = targets.length > 1 ? snapshotAttributes(el, ['style', 'class']) : null;
    const x = Number(from.x ?? 0);
    const y = Number(from.y ?? 24);
    const xPercent = Number(from.xPercent ?? 0);
    const yPercent = Number(from.yPercent ?? 0);
    const scale = Number(from.scale ?? 1);
    const duration = Math.max(0, Number(opts.duration ?? 0.55));
    let timers = [];
    const initial = (node) => {
      node.style.transition = 'none';
      node.style.opacity = String(from.opacity ?? 0);
      node.style.transform = `translate3d(${x}px,${y}px,0) translate(${xPercent}%,${yPercent}%) scale(${scale})`;
      if (from.filter) node.style.filter = from.filter;
      if (from.clipPath) node.style.clipPath = from.clipPath;
    };
    targets.forEach(initial);
    const enter = () => {
      timers.forEach(clearTimeout);
      timers = [];
      const delays = staggerDelays(targets.length, opts.stagger, opts.order);
      const finalIndex = delays.indexOf(Math.max(...delays));
      addClasses(el, opts);
      targets.forEach((node, index) => {
        timers.push(setTimeout(() => requestAnimationFrame(() => {
          node.style.transition = `opacity ${duration}s ease,transform ${duration}s ease,filter ${duration}s ease,clip-path ${duration}s ease`;
          node.style.opacity = '1';
          node.style.transform = 'none';
          node.style.filter = 'none';
          node.style.clipPath = 'inset(0)';
          if (index === finalIndex) opts.onComplete?.(el);
        }), delays[index] * 1000));
      });
    };
    const observer = observeOnce(el, enter, { threshold: Number(opts.threshold ?? 0.1), rootMargin: opts.rootMargin || '0px 0px -10% 0px' });
    return {
      el,
      type: 'reveal',
      replay(nextOptions) { Object.assign(opts, nextOptions || {}); targets.forEach(initial); requestAnimationFrame(enter); },
      pause() {},
      resume() {},
      destroy() {
        observer.disconnect();
        timers.forEach(clearTimeout);
        restores.forEach((restore) => restore());
        restoreRoot?.();
      }
    };
  }
};
