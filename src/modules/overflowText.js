import { clamp, segmentText } from '../utils.js';

function number(value, fallback, min = 0) {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? Math.max(min, parsed) : fallback;
}

function normalizeMaskDirection(value) {
  const direction = String(value || 'top-to-bottom').toLowerCase();
  const aliases = {
    down: 'top-to-bottom',
    up: 'bottom-to-top',
    right: 'left-to-right',
    left: 'right-to-left'
  };
  return aliases[direction] || direction;
}

function hiddenClip(direction) {
  if (direction === 'bottom-to-top') return 'inset(100% 0 0 0)';
  if (direction === 'left-to-right') return 'inset(0 100% 0 0)';
  if (direction === 'right-to-left') return 'inset(0 0 0 100%)';
  return 'inset(0 0 100% 0)';
}

function oppositeClip(direction) {
  if (direction === 'bottom-to-top') return 'inset(0 0 100% 0)';
  if (direction === 'left-to-right') return 'inset(0 0 0 100%)';
  if (direction === 'right-to-left') return 'inset(0 100% 0 0)';
  return 'inset(100% 0 0 0)';
}

// Small positional nudge along the mask direction so the wipe reads as
// movement instead of a hard shutter (Toss-style soft directional swap).
function nudge(direction, amount = '0.3em') {
  if (direction === 'bottom-to-top') return `translate3d(0,-${amount},0)`;
  if (direction === 'left-to-right') return `translate3d(${amount},0,0)`;
  if (direction === 'right-to-left') return `translate3d(-${amount},0,0)`;
  return `translate3d(0,${amount},0)`;
}

function parseItems(el, opts) {
  if (Array.isArray(opts.items)) return opts.items.map(String).filter(Boolean);
  if (typeof opts.items === 'string') {
    try {
      const parsed = JSON.parse(opts.items);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch (_error) {
      return opts.items.split('|').map((item) => item.trim()).filter(Boolean);
    }
  }
  const dataItems = el.getAttribute('data-items');
  if (dataItems) return dataItems.split('|').map((item) => item.trim()).filter(Boolean);
  // Element children keep their full markup so rolling items can contain
  // spans, icons, links — anything, not just plain text.
  const children = Array.from(el.children).map((child) => child.innerHTML.trim()).filter(Boolean);
  return children.length ? children : [el.textContent.trim()].filter(Boolean);
}

function plainText(html) {
  const probe = document.createElement('div');
  probe.innerHTML = html;
  return probe.textContent || '';
}

export default {
  create(el, opts = {}) {
    const mode = opts.mode || opts.preset || 'loop';
    const speed = number(opts.speed, 36, 1);
    const delay = number(opts.delay, 700);
    const endPause = number(opts.endPause, 900);
    // Pause after a full cycle before the effect starts again (falls back to
    // the start delay so existing markup keeps its old rhythm).
    const restartDelay = number(opts.restartDelay, delay);
    const gap = number(opts.gap, 32);
    const horizontalDirection = opts.direction === 'right' ? 1 : -1;
    const maskDirection = normalizeMaskDirection(opts.maskDirection || opts.transitionDirection);
    const maskDuration = number(opts.maskDuration, 260, 20);
    const pauseOnHover = opts.pauseOnHover !== false;
    const originalHTML = el.innerHTML;
    const originalStyle = el.getAttribute('style');
    const originalTitle = el.getAttribute('title');
    const originalAria = el.getAttribute('aria-label');
    const originalRole = el.getAttribute('role');
    const text = String(opts.text ?? el.textContent ?? '').trim();
    // Rolling items must be read before the element is emptied below,
    // otherwise markup children (div/span items) would be lost.
    const rollingItems = mode === 'rolling' ? parseItems(el, opts) : null;

    let animation = null;
    let resizeObserver = null;
    let timer = null;
    let destroyed = false;
    let paused = false;
    let viewport = null;
    let track = null;
    let activeIndex = 0;

    el.textContent = '';
    el.style.overflow = 'hidden';
    el.style.whiteSpace = 'nowrap';
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    if (text) el.setAttribute('aria-label', text);
    if (!originalTitle && opts.title !== false && text) el.setAttribute('title', text);

    let hoverPaused = false;
    let deferred = null;
    const clearMotion = () => {
      animation?.cancel?.();
      animation = null;
      clearTimeout(timer);
      timer = null;
      deferred = null;
    };
    const schedule = (callback, duration) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        if (destroyed) return;
        // While hover-paused, remember the step and run it on hover-out
        // instead of dropping it (dropping froze the cycle mid-sequence).
        if (paused || hoverPaused) { deferred = callback; return; }
        callback();
      }, Math.max(0, duration));
    };
    // Masks run on the viewport (the visible box) instead of the wide track,
    // so left/right wipes travel exactly across what the eye can see.
    const maskOut = async (node) => {
      const current = node.animate([
        { clipPath: 'inset(0 0 0 0)', webkitClipPath: 'inset(0 0 0 0)', transform: 'translate3d(0,0,0)', opacity: 1 },
        { clipPath: hiddenClip(maskDirection), webkitClipPath: hiddenClip(maskDirection), transform: nudge(maskDirection), opacity: 0.6 }
      ], { duration: maskDuration, easing: opts.maskEase || 'cubic-bezier(.5,0,.75,.4)', fill: 'forwards' });
      animation = current;
      try { await current.finished; } catch (_error) { /* cancelled */ }
      if (animation === current) animation = null;
    };
    const maskIn = async (node) => {
      const current = node.animate([
        { clipPath: oppositeClip(maskDirection), webkitClipPath: oppositeClip(maskDirection), transform: nudge(maskDirection === 'bottom-to-top' ? 'top-to-bottom' : maskDirection === 'top-to-bottom' ? 'bottom-to-top' : maskDirection === 'left-to-right' ? 'right-to-left' : 'left-to-right'), opacity: 0.6 },
        { clipPath: 'inset(0 0 0 0)', webkitClipPath: 'inset(0 0 0 0)', transform: 'translate3d(0,0,0)', opacity: 1 }
      ], { duration: maskDuration, easing: opts.maskEase || 'cubic-bezier(.22,.8,.3,1)', fill: 'forwards' });
      animation = current;
      try { await current.finished; } catch (_error) { /* cancelled */ }
      if (animation === current) animation = null;
    };
    const createSegment = (value = text, clone = false, html = false) => {
      const segment = document.createElement('span');
      segment.className = 'kt-overflow-text-segment';
      if (html) segment.innerHTML = value;
      else segment.textContent = value;
      segment.style.cssText = 'display:inline-block;flex:0 0 auto;white-space:nowrap;';
      if (clone) segment.setAttribute('aria-hidden', 'true');
      return segment;
    };

    const buildRolling = () => {
      const items = rollingItems || [];
      if (!items.length) return;
      el.setAttribute('role', opts.role || 'status');
      el.setAttribute('aria-live', opts.ariaLive || 'polite');
      const rollViewport = document.createElement('span');
      rollViewport.className = 'kt-overflow-rolling-viewport';
      rollViewport.style.cssText = 'display:block;position:relative;height:1.35em;overflow:hidden;';
      track = document.createElement('span');
      track.className = 'kt-overflow-rolling-track';
      track.style.cssText = 'display:flex;flex-direction:column;will-change:transform;';
      const current = createSegment(items[0], false, true);
      const next = createSegment(items[1 % items.length], true, true);
      current.style.height = next.style.height = '1.35em';
      current.style.lineHeight = next.style.lineHeight = '1.35em';
      current.style.display = next.style.display = 'flex';
      current.style.alignItems = next.style.alignItems = 'center';
      current.style.gap = next.style.gap = '0.4em';
      track.append(current, next);
      rollViewport.appendChild(track);
      el.appendChild(rollViewport);
      const direction = opts.rollDirection === 'down' ? 1 : -1;
      const rollDuration = number(opts.rollDuration, 380, 50);
      const hold = number(opts.holdDuration, 1500, 100);
      const advance = async () => {
        if (destroyed || paused || items.length < 2) return;
        const nextIndex = (activeIndex + 1) % items.length;
        const incoming = direction < 0 ? track.lastElementChild : track.firstElementChild;
        incoming.innerHTML = items[nextIndex];
        const from = direction < 0 ? 'translate3d(0,0,0)' : 'translate3d(0,-1.35em,0)';
        const to = direction < 0 ? 'translate3d(0,-1.35em,0)' : 'translate3d(0,0,0)';
        track.style.transform = from;
        const currentAnimation = track.animate([{ transform: from }, { transform: to }], {
          duration: rollDuration,
          easing: opts.easing || 'cubic-bezier(.22,.8,.25,1)',
          fill: 'forwards'
        });
        animation = currentAnimation;
        try { await currentAnimation.finished; } catch (_error) { return; }
        if (destroyed) return;
        currentAnimation.cancel();
        if (direction < 0) {
          const first = track.firstElementChild;
          track.appendChild(first);
        } else {
          const last = track.lastElementChild;
          track.insertBefore(last, track.firstElementChild);
        }
        track.style.transform = 'translate3d(0,0,0)';
        activeIndex = nextIndex;
        el.setAttribute('aria-label', plainText(items[activeIndex]));
        opts.onChange?.(activeIndex, items[activeIndex], el);
        schedule(advance, hold);
      };
      if (items.length > 1) schedule(advance, number(opts.delay, hold));
    };

    const buildOverflow = () => {
      clearMotion();
      el.textContent = '';
      viewport = document.createElement('span');
      viewport.className = 'kt-overflow-text-viewport';
      viewport.style.cssText = 'display:block;position:relative;overflow:hidden;will-change:clip-path,transform;';
      track = document.createElement('span');
      track.className = `kt-overflow-text-track kt-overflow-text-${mode}`;
      track.setAttribute('aria-hidden', 'true');
      track.dataset.mode = mode;
      track.style.cssText = 'display:inline-flex;align-items:center;white-space:nowrap;will-change:transform;';
      const first = createSegment();
      track.appendChild(first);
      viewport.appendChild(track);
      el.appendChild(viewport);

      // Measure against the viewport (content box). Using el.clientWidth
      // included the element's padding and under-measured the overflow, so
      // page/flip/once modes cut off the tail of the text.
      const viewportWidth = viewport.clientWidth || el.clientWidth;
      const overflow = Math.max(0, first.scrollWidth - viewportWidth);
      const shouldAnimate = opts.force === true || overflow > number(opts.threshold, 1);
      el.dataset.ktOverflowActive = String(shouldAnimate);
      if (!shouldAnimate) {
        track.style.display = 'inline-block';
        track.style.maxWidth = '100%';
        track.style.overflow = 'hidden';
        track.style.textOverflow = opts.ellipsis === false ? 'clip' : 'ellipsis';
        return;
      }

      if (mode === 'loop') {
        first.style.marginRight = `${gap}px`;
        const second = createSegment(text, true);
        second.style.marginRight = `${gap}px`;
        track.appendChild(second);
        const travel = first.getBoundingClientRect().width + gap;
        const duration = Math.max(200, (travel / speed) * 1000);
        const from = horizontalDirection < 0 ? 0 : -travel;
        const to = horizontalDirection < 0 ? -travel : 0;
        animation = track.animate([
          { transform: `translate3d(${from}px,0,0)` },
          { transform: `translate3d(${to}px,0,0)` }
        ], { duration, delay, iterations: opts.repeat === false ? 1 : Infinity, easing: 'linear', fill: 'both' });
        return;
      }

      const travel = overflow;
      const moveDuration = Math.max(120, (travel / speed) * 1000);
      const startX = horizontalDirection < 0 ? 0 : -travel;
      const endX = horizontalDirection < 0 ? -travel : 0;
      track.style.transform = `translate3d(${startX}px,0,0)`;

      if (mode === 'bounce') {
        const total = delay + moveDuration + endPause + moveDuration + restartDelay;
        const a = clamp(delay / total, 0, 1);
        const b = clamp((delay + moveDuration) / total, a, 1);
        const c = clamp((delay + moveDuration + endPause) / total, b, 1);
        const d = clamp((delay + moveDuration + endPause + moveDuration) / total, c, 1);
        animation = track.animate([
          { transform: `translate3d(${startX}px,0,0)`, offset: 0 },
          { transform: `translate3d(${startX}px,0,0)`, offset: a },
          { transform: `translate3d(${endX}px,0,0)`, offset: b },
          { transform: `translate3d(${endX}px,0,0)`, offset: c },
          { transform: `translate3d(${startX}px,0,0)`, offset: d },
          { transform: `translate3d(${startX}px,0,0)`, offset: 1 }
        ], { duration: total, iterations: opts.repeat === false ? 1 : Infinity, easing: opts.easing || 'ease-in-out', fill: 'both' });
        return;
      }

      if (mode === 'once') {
        animation = track.animate([
          { transform: `translate3d(${startX}px,0,0)` },
          { transform: `translate3d(${endX}px,0,0)` }
        ], { duration: moveDuration, delay, easing: opts.easing || 'ease-in-out', fill: 'forwards' });
        return;
      }

      if (mode === 'page-roll' || mode === 'pageRoll') {
        // Page + rolling hybrid: the first page shows as-is, then each next
        // page of the same long text rolls in vertically like a ticker.
        const pageSize = Math.max(1, viewportWidth - number(opts.pageOverlap, 12));
        const positions = [0];
        for (let moved = pageSize; moved < overflow; moved += pageSize) positions.push(moved);
        if (positions.at(-1) !== overflow) positions.push(overflow);
        const rollDuration = number(opts.rollDuration, 420, 60);
        const pageHold = number(opts.pageDuration, 1200, 120);
        const rollDown = opts.rollDirection === 'down';
        viewport.style.height = '1.3em';
        track.remove();
        const makeLine = (offsetPx) => {
          const line = document.createElement('span');
          line.className = 'kt-overflow-text-line';
          line.setAttribute('aria-hidden', 'true');
          line.style.cssText = 'position:absolute;left:0;top:0;height:100%;display:inline-flex;align-items:center;white-space:nowrap;will-change:transform;';
          const segment = createSegment();
          segment.style.transform = `translate3d(${offsetPx}px,0,0)`;
          line.appendChild(segment);
          viewport.appendChild(line);
          return line;
        };
        const offsetFor = (pageIndex) => {
          const moved = positions[pageIndex];
          return horizontalDirection < 0 ? -moved : -(overflow - moved);
        };
        let lineA = makeLine(0);
        let lineB = makeLine(0);
        lineB.style.transform = 'translateY(100%)';
        let pageIndex = 0;
        const rollPage = async () => {
          if (destroyed || paused) return;
          pageIndex = (pageIndex + 1) % positions.length;
          lineB.firstElementChild.style.transform = `translate3d(${offsetFor(pageIndex)}px,0,0)`;
          const fromB = rollDown ? 'translateY(-100%)' : 'translateY(100%)';
          const toA = rollDown ? 'translateY(100%)' : 'translateY(-100%)';
          lineB.style.transform = fromB;
          const easing = opts.easing || 'cubic-bezier(.22,.8,.25,1)';
          const outgoing = lineA.animate([{ transform: 'translateY(0)' }, { transform: toA }], { duration: rollDuration, easing, fill: 'forwards' });
          const incoming = lineB.animate([{ transform: fromB }, { transform: 'translateY(0)' }], { duration: rollDuration, easing, fill: 'forwards' });
          animation = incoming;
          try { await Promise.all([outgoing.finished, incoming.finished]); } catch (_error) { return; }
          if (destroyed) return;
          outgoing.cancel();
          incoming.cancel();
          const previous = lineA;
          lineA = lineB;
          lineB = previous;
          lineA.style.transform = 'translateY(0)';
          lineB.style.transform = 'translateY(100%)';
          lineA.dataset.page = String(pageIndex);
          opts.onPage?.(pageIndex, positions.length, el);
          if (opts.repeat !== false || pageIndex < positions.length - 1) schedule(rollPage, pageIndex === 0 ? restartDelay : pageHold);
        };
        schedule(rollPage, delay);
        return;
      }

      if (mode === 'dissolve') {
        // Noisy dissolve page transition: characters flicker out in random
        // order with jitter and micro-blur (no plain crossfade), the track
        // jumps to the next page, then characters flicker back in.
        const pageSize = Math.max(1, viewportWidth - number(opts.pageOverlap, 12));
        const positions = [0];
        for (let moved = pageSize; moved < overflow; moved += pageSize) positions.push(moved);
        if (positions.at(-1) !== overflow) positions.push(overflow);
        const dissolveMs = number(opts.dissolveDuration ?? opts.maskDuration, 460, 100);
        const jitterAmp = number(opts.jitter, 5, 0);
        track.style.display = 'inline-block';
        track.textContent = '';
        const spans = [];
        segmentText(text).forEach((char) => {
          if (/^\s$/.test(char)) {
            track.appendChild(document.createTextNode(char));
            return;
          }
          const span = document.createElement('span');
          span.textContent = char;
          span.style.cssText = 'display:inline-block;will-change:transform,opacity,filter;';
          track.appendChild(span);
          spans.push(span);
        });
        const scramble = (entering) => Promise.all(spans.map((span) => {
          const jx = (Math.random() - 0.5) * jitterAmp * 2;
          const jy = (Math.random() - 0.5) * jitterAmp * 1.4;
          // Jitter + step flicker only — no blur, which read as a glow.
          const frames = entering ? [
            { opacity: 0, transform: `translate(${jx}px,${jy}px)` },
            { opacity: 0.85, transform: `translate(${(-jx * 0.6).toFixed(1)}px,${(-jy * 0.6).toFixed(1)}px)`, offset: 0.45 },
            { opacity: 0.3, transform: `translate(${(jx * 0.4).toFixed(1)}px,${(jy * 0.3).toFixed(1)}px)`, offset: 0.62 },
            { opacity: 1, transform: 'translate(0,0)' }
          ] : [
            { opacity: 1, transform: 'translate(0,0)' },
            { opacity: 0.25, transform: `translate(${(jx * 0.5).toFixed(1)}px,${(jy * 0.4).toFixed(1)}px)`, offset: 0.35 },
            { opacity: 0.8, transform: `translate(${(-jx * 0.4).toFixed(1)}px,${(-jy * 0.5).toFixed(1)}px)`, offset: 0.55 },
            { opacity: 0, transform: `translate(${jx}px,${jy}px)` }
          ];
          const player = span.animate(frames, {
            duration: dissolveMs,
            delay: Math.random() * dissolveMs * 0.5,
            easing: `steps(${2 + Math.floor(Math.random() * 3)}, end)`,
            fill: 'forwards'
          });
          animation = player;
          return player.finished.catch(() => {});
        }));
        let pageIndex = 0;
        const pageHold = number(opts.pageDuration, 1200, 120);
        const swapDissolve = async () => {
          if (destroyed || paused) return;
          await scramble(false);
          if (destroyed) return;
          pageIndex = (pageIndex + 1) % positions.length;
          const moved = positions[pageIndex];
          const target = horizontalDirection < 0 ? -moved : -(overflow - moved);
          track.style.transform = `translate3d(${target}px,0,0)`;
          await scramble(true);
          track.dataset.page = String(pageIndex);
          opts.onPage?.(pageIndex, positions.length, el);
          if (opts.repeat !== false || pageIndex < positions.length - 1) schedule(swapDissolve, pageIndex === 0 ? restartDelay : pageHold);
        };
        schedule(swapDissolve, delay);
        return;
      }

      if (mode === 'flip') {
        // Split-flap page turn: the visible line flips down (or up) around its
        // horizontal axis and comes back showing the next page of text.
        el.style.perspective = `${number(opts.perspective, 520, 120)}px`;
        const pageSize = Math.max(1, viewportWidth - number(opts.pageOverlap, 12));
        const positions = [0];
        for (let moved = pageSize; moved < overflow; moved += pageSize) positions.push(moved);
        if (positions.at(-1) !== overflow) positions.push(overflow);
        let pageIndex = 0;
        const pageHold = number(opts.pageDuration, 1200, 120);
        const flipMs = number(opts.flipDuration ?? opts.maskDuration, 300, 60);
        const sign = (opts.flipDirection || 'down') === 'up' ? 1 : -1;
        viewport.style.transformOrigin = '50% 50%';
        viewport.style.willChange = 'transform,opacity';
        const flipPage = async () => {
          if (destroyed || paused) return;
          const out = viewport.animate([
            { transform: 'rotateX(0deg)', opacity: 1 },
            { transform: `rotateX(${sign * 88}deg)`, opacity: 0.4 }
          ], { duration: flipMs / 2, easing: 'cubic-bezier(.55,0,.7,.4)', fill: 'forwards' });
          animation = out;
          try { await out.finished; } catch (_error) { return; }
          if (destroyed) return;
          pageIndex = (pageIndex + 1) % positions.length;
          const moved = positions[pageIndex];
          const target = horizontalDirection < 0 ? -moved : -(overflow - moved);
          track.style.transform = `translate3d(${target}px,0,0)`;
          const back = viewport.animate([
            { transform: `rotateX(${-sign * 88}deg)`, opacity: 0.4 },
            { transform: 'rotateX(0deg)', opacity: 1 }
          ], { duration: flipMs / 2, easing: 'cubic-bezier(.25,.7,.35,1)', fill: 'forwards' });
          animation = back;
          try { await back.finished; } catch (_error) { return; }
          track.dataset.page = String(pageIndex);
          opts.onPage?.(pageIndex, positions.length, el);
          if (opts.repeat !== false || pageIndex < positions.length - 1) schedule(flipPage, pageIndex === 0 ? restartDelay : pageHold);
        };
        schedule(flipPage, delay);
        return;
      }

      if (mode === 'page') {
        const pageSize = Math.max(1, viewportWidth - number(opts.pageOverlap, 12));
        const positions = [0];
        for (let moved = pageSize; moved < overflow; moved += pageSize) positions.push(moved);
        if (positions.at(-1) !== overflow) positions.push(overflow);
        let pageIndex = 0;
        const pageHold = number(opts.pageDuration, 1100, 120);
        const swapPage = async () => {
          if (destroyed || paused) return;
          await maskOut(viewport);
          if (destroyed) return;
          pageIndex = (pageIndex + 1) % positions.length;
          const moved = positions[pageIndex];
          const target = horizontalDirection < 0 ? -moved : -(overflow - moved);
          track.style.transform = `translate3d(${target}px,0,0)`;
          void viewport.offsetWidth;
          await maskIn(viewport);
          track.dataset.page = String(pageIndex);
          opts.onPage?.(pageIndex, positions.length, el);
          if (opts.repeat !== false || pageIndex < positions.length - 1) schedule(swapPage, pageIndex === 0 ? restartDelay : pageHold);
        };
        schedule(swapPage, delay);
        return;
      }

      const runRewind = async () => {
        if (destroyed || paused) return;
        track.style.transform = `translate3d(${startX}px,0,0)`;
        viewport.style.clipPath = 'inset(0 0 0 0)';
        const movement = track.animate([
          { transform: `translate3d(${startX}px,0,0)` },
          { transform: `translate3d(${endX}px,0,0)` }
        ], { duration: moveDuration, delay, easing: opts.easing || 'linear', fill: 'forwards' });
        animation = movement;
        try { await movement.finished; } catch (_error) { return; }
        if (destroyed || paused) return;
        movement.cancel();
        track.style.transform = `translate3d(${endX}px,0,0)`;
        schedule(async () => {
          await maskOut(viewport);
          if (destroyed) return;
          track.style.transform = `translate3d(${startX}px,0,0)`;
          void viewport.offsetWidth;
          await maskIn(viewport);
          if (opts.repeat !== false) schedule(runRewind, restartDelay);
        }, endPause);
      };
      runRewind();
    };

    const build = () => {
      if (mode === 'rolling') buildRolling();
      else buildOverflow();
    };
    build();

    if (typeof ResizeObserver !== 'undefined' && mode !== 'rolling') {
      let width = el.clientWidth;
      resizeObserver = new ResizeObserver(() => {
        if (Math.abs(el.clientWidth - width) < 1) return;
        width = el.clientWidth;
        buildOverflow();
      });
      resizeObserver.observe(el);
    }

    // Hover pause: only running animations get paused (playing a cancelled
    // one restarted it from frame 0 and made rolling jump), and steps that
    // fire while hovered are deferred until the pointer leaves.
    const onHoverIn = () => {
      hoverPaused = true;
      if (animation?.playState === 'running') animation.pause();
    };
    const onHoverOut = () => {
      hoverPaused = false;
      if (animation?.playState === 'paused') animation.play();
      if (deferred && timer == null) {
        const callback = deferred;
        deferred = null;
        schedule(callback, 220);
      }
    };
    if (pauseOnHover) {
      el.addEventListener('pointerenter', onHoverIn);
      el.addEventListener('pointerleave', onHoverOut);
    }

    return {
      el,
      type: 'overflowText',
      get index() { return activeIndex; },
      replay() { clearMotion(); activeIndex = 0; build(); },
      pause() { paused = true; animation?.pause?.(); clearTimeout(timer); },
      resume() { paused = false; animation?.play?.(); if (!animation) build(); },
      destroy() {
        destroyed = true;
        clearMotion();
        resizeObserver?.disconnect();
        el.removeEventListener('pointerenter', onHoverIn);
        el.removeEventListener('pointerleave', onHoverOut);
        if (originalStyle == null) el.removeAttribute('style'); else el.setAttribute('style', originalStyle);
        if (originalTitle == null) el.removeAttribute('title'); else el.setAttribute('title', originalTitle);
        if (originalAria == null) el.removeAttribute('aria-label'); else el.setAttribute('aria-label', originalAria);
        if (originalRole == null) el.removeAttribute('role'); else el.setAttribute('role', originalRole);
        el.innerHTML = originalHTML;
        delete el.dataset.ktOverflowActive;
      }
    };
  },
  reduced() {}
};
