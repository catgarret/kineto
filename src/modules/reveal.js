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
  remove.forEach((className) => el.classList.remove(className));
  add.forEach((className) => el.classList.add(className));
  opts.onClassChange?.(active, el);
}

const addClasses = (el, opts) => setClasses(el, opts, true);
const removeClasses = (el, opts) => setClasses(el, opts, false);

export { PRESETS, staggerDelays };

export default {
  create(el, opts = {}) {
    const gsap = G();
    const scrollTrigger = ST();
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
      const enter = () => {
        if (destroyed) return;
        addClasses(el, opts);
        if (!destroyed) opts.onEnter?.(el);
      };
      const leave = () => {
        if (destroyed) return;
        if (opts.removeClassOnLeave === false) return;
        removeClasses(el, opts);
        if (!destroyed) opts.onLeave?.(el);
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
        observer = new IntersectionObserver(([entry]) => entry.isIntersecting ? enter() : leave(), {
          threshold: Number(opts.threshold ?? 0.1), rootMargin: opts.rootMargin || '0px'
        });
        observer.observe(el);
      } else enter();
      return {
        el,
        type: 'reveal',
        replay(nextOptions) {
          if (destroyed) return;
          Object.assign(opts, nextOptions || {});
          if (replayRaf != null) cancelAnimationFrame(replayRaf);
          removeClasses(el, opts);
          if (destroyed) return;
          replayRaf = requestAnimationFrame(() => { replayRaf = null; enter(); });
        },
        pause() { trigger?.disable?.(); observer?.disconnect?.(); },
        resume() { trigger?.enable?.(); },
        destroy() {
          destroyed = true;
          if (replayRaf != null) cancelAnimationFrame(replayRaf);
          trigger?.kill?.();
          observer?.disconnect?.();
          if (originalClass == null) el.removeAttribute('class'); else el.setAttribute('class', originalClass);
        }
      };
    }

    if (preset === 'clock') {
      // Clock wipe: a conic mask sweeps around like a watch hand until the
      // content is fully revealed. A staggered container applies a separate
      // clock mask to every direct child instead of masking the whole list.
      const clockNodes = revealTargets(el, opts);
      const restore = snapshotTargets(el, clockNodes);
      const apply = (node, progress) => {
        const startAngle = Number(opts.startAngle ?? 0);
        const counter = opts.clockDirection === 'ccw';
        const sweep = clamp(progress, 0, 1) * 360;
        const gradient = counter
          ? `conic-gradient(from ${startAngle}deg, transparent 0deg ${360 - sweep}deg, #000 ${360 - sweep}deg)`
          : `conic-gradient(from ${startAngle}deg, #000 ${sweep}deg, transparent ${sweep}deg)`;
        node.style.maskImage = gradient;
        node.style.webkitMaskImage = gradient;
        node.style.opacity = '1';
      };
      const finishNode = (node) => {
        node.style.maskImage = 'none';
        node.style.webkitMaskImage = 'none';
      };
      clockNodes.forEach((node) => apply(node, 0));
      let clockTweens = [];
      let clockRaf = null;
      let clockObserver = null;
      const stop = () => {
        clockTweens.forEach((tween) => tween.kill?.());
        clockTweens = [];
        if (clockRaf != null) cancelAnimationFrame(clockRaf);
        clockRaf = null;
      };
      const runRaf = () => {
        const duration = Math.max(0.05, Number(opts.duration ?? 1.4));
        const baseDelay = Math.max(0, Number(opts.delay ?? 0));
        const delays = clockNodes.length > 1 ? staggerDelays(clockNodes.length, opts.stagger, opts.order) : [0];
        let startTime = null;
        const frame = (time) => {
          if (startTime == null) startTime = time;
          const elapsed = (time - startTime) / 1000;
          let complete = 0;
          clockNodes.forEach((node, index) => {
            const progress = clamp((elapsed - baseDelay - delays[index]) / duration, 0, 1);
            apply(node, progress);
            if (progress >= 1) {
              finishNode(node);
              complete += 1;
            }
          });
          if (complete < clockNodes.length) clockRaf = requestAnimationFrame(frame);
          else {
            clockRaf = null;
            opts.onComplete?.(el);
          }
        };
        clockRaf = requestAnimationFrame(frame);
      };
      const startClock = () => {
        stop();
        clockNodes.forEach((node) => apply(node, 0));
        addClasses(el, opts);
        if (gsap) {
          const duration = Math.max(0.05, Number(opts.duration ?? 1.4));
          const baseDelay = Math.max(0, Number(opts.delay ?? 0));
          const delays = clockNodes.length > 1 ? staggerDelays(clockNodes.length, opts.stagger, opts.order) : [0];
          let complete = 0;
          clockTweens = clockNodes.map((node, index) => {
            const state = { p: 0 };
            return gsap.to(state, {
              p: 1,
              duration,
              delay: baseDelay + delays[index],
              ease: (opts.enterEase ?? opts.ease) ? gsapEaseName(opts.enterEase ?? opts.ease) : 'power1.inOut',
              onUpdate: () => apply(node, state.p),
              onComplete: () => {
                finishNode(node);
                complete += 1;
                if (complete === clockNodes.length) opts.onComplete?.(el);
              }
            });
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
          startClock();
        },
        pause() { clockTweens.forEach((tween) => tween.pause?.()); },
        resume() { clockTweens.forEach((tween) => tween.resume?.()); },
        destroy() {
          stop();
          clockObserver?.kill?.();
          clockObserver?.disconnect?.();
          restore();
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
      const clipNodes = revealTargets(el, opts);
      const staggered = clipNodes.length > 1;
      const clipRestore = snapshotTargets(el, clipNodes);
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
        if (!entries.some((entry) => entry.isIntersecting)) return;
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
    const targets = revealTargets(el, opts);
    const restore = snapshotTargets(el, targets);
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
    let timers = [];
    let destroyed = false;
    const rafs = new Set();
    const frame = (callback) => {
      const id = requestAnimationFrame(() => { rafs.delete(id); if (!destroyed) callback(); });
      rafs.add(id);
    };
    const stop = () => {
      timers.forEach(clearTimeout);
      timers = [];
      rafs.forEach(cancelAnimationFrame);
      rafs.clear();
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
    const initial = (node) => {
      node.style.transition = 'none';
      node.style.opacity = String(from.opacity ?? 0);
      node.style.transform = transformFrom;
      if (from.transformOrigin) node.style.transformOrigin = from.transformOrigin;
      if (from.filter) node.style.filter = from.filter;
      // Fully clipped targets do not intersect the viewport. Keep them hidden
      // with opacity until the observer enters, then install the clip before
      // starting its transition (without inserting an authored-DOM wrapper).
      if (from.clipPath) { node.style.clipPath = 'none'; node.style.opacity = '0'; }
    };
    targets.forEach(initial);
    const enter = () => {
      if (destroyed) return;
      stop();
      if (from.clipPath) {
        targets.forEach((node) => { node.style.clipPath = from.clipPath; node.style.opacity = '1'; });
        void el.offsetWidth;
      }
      const delays = staggerDelays(targets.length, opts.stagger, opts.order);
      const baseDelay = Math.max(0, Number(opts.delay ?? 0));
      const finalIndex = delays.indexOf(Math.max(...delays));
      addClasses(el, opts);
      targets.forEach((node, index) => {
        timers.push(setTimeout(() => frame(() => {
          node.style.transition = `opacity ${duration}s ease,transform ${duration}s ease,filter ${duration}s ease,clip-path ${duration}s ease`;
          node.style.opacity = '1';
          node.style.transform = 'none';
          node.style.filter = 'none';
          node.style.clipPath = 'inset(0)';
          if (index === finalIndex) timers.push(setTimeout(() => {
            if (!destroyed) opts.onComplete?.(el);
          }, duration * 1000));
        }), (baseDelay + delays[index]) * 1000));
      });
    };
    const observer = observeOnce(el, enter, { threshold: Number(opts.threshold ?? 0.1), rootMargin: opts.rootMargin || '0px 0px -10% 0px' });
    return {
      el,
      type: 'reveal',
      replay(nextOptions) {
        if (destroyed) return;
        Object.assign(opts, nextOptions || {});
        observer.disconnect();
        stop();
        targets.forEach(initial);
        frame(enter);
      },
      pause() {},
      resume() {},
      destroy() {
        destroyed = true;
        observer.disconnect();
        stop();
        restore();
      }
    };
  }
};
