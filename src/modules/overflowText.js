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
// movement instead of a hard shutter (soft directional swap).
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
    // GNB-style hover trigger: with `trigger:'hover'` the rolling swap advances
    // once each time the pointer enters (or the item gains focus) instead of on
    // a timer. Duplicate the label (items:['MENU','MENU']) for a clean vertical
    // swap-in-place. `hoverTarget` (a selector) lets a parent link drive it.
    const hoverTrigger = opts.trigger === 'hover';
    let hoverAdvance = null;
    let hoverLeaveHandler = null;
    let hoverEnterHandler = null;
    let hoverExitHandler = null;
    let hoverTarget = null;
    const originalHTML = el.innerHTML;
    const originalStyle = el.getAttribute('style');
    const originalTitle = el.getAttribute('title');
    const originalAria = el.getAttribute('aria-label');
    const originalRole = el.getAttribute('role');
    const text = String(opts.text ?? el.textContent ?? '').trim();
    // Rolling items must be read before the element is emptied below,
    // otherwise markup children (div/span items) would be lost.
    const rollingItems = mode === 'rolling' ? parseItems(el, opts) : null;
    // fade/dissolve/flip/page also work as ITEM scene transitions (like rolling)
    // when the element holds multiple item children — not only overflowing text.
    const sceneModes = ['fade', 'dissolve', 'flip', 'page'];
    const sceneItems = (sceneModes.includes(mode) && el.children.length >= 2) ? parseItems(el, opts) : null;

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
      // Clear any previously-built viewport first — items were captured once at
      // create, so replay/rebuild must not append a second rolling viewport
      // (which left stacked tracks with only the last one animating).
      el.innerHTML = '';
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
        if (!hoverTrigger) schedule(advance, hold);
      };
      if (hoverTrigger) {
        hoverTarget = opts.hoverTarget ? (el.closest(opts.hoverTarget) || el.parentElement || el) : el;
        const restoreOnLeave = opts.restoreOnLeave !== false;
        const loopOnHover = opts.loopOnHover === true;
        // restoreDirection: 'reverse' (default) slides back DOWN to the original;
        // 'continue' keeps rolling UP (same direction) and wraps to the original.
        const continueRoll = opts.restoreDirection === 'continue' || opts.restoreDirection === 'forward';
        const ease = opts.easing || 'cubic-bezier(.22,.8,.25,1)';
        const homeTf = 'translate3d(0,0,0)';
        const upTf = 'translate3d(0,-1.35em,0)';
        let hoverState = 0;
        let continueResetTimer = null;
        const resetToHome = () => {
          track.style.transition = 'none';
          if (track.firstElementChild) track.firstElementChild.innerHTML = items[0];
          if (track.lastElementChild) track.lastElementChild.innerHTML = items[1 % items.length];
          activeIndex = 0;
          track.style.transform = homeTf;
          el.setAttribute('aria-label', plainText(items[0]));
        };
        // loopOnHover: a horizontal, infinitely-scrolling marquee of the label
        // (like `mode:'loop'`) while hovered — NOT the vertical roll. Restored to
        // the static label on leave.
        let marqueeAnim = null;
        const startMarquee = () => {
          if (marqueeAnim) return;
          const boxW = Math.round(rollViewport.getBoundingClientRect().width || el.getBoundingClientRect().width || 120);
          const label = items.map(plainText).join(' ');
          el.innerHTML = '';
          const vp = document.createElement('span');
          vp.style.cssText = `display:inline-block;overflow:hidden;white-space:nowrap;vertical-align:bottom;width:${boxW}px;max-width:${boxW}px;`;
          const inner = document.createElement('span');
          inner.style.cssText = 'display:inline-flex;white-space:nowrap;will-change:transform;';
          const a = document.createElement('span'); a.textContent = label + '  ';
          const b = document.createElement('span'); b.setAttribute('aria-hidden', 'true'); b.textContent = label + '  ';
          inner.append(a, b);
          vp.appendChild(inner);
          el.appendChild(vp);
          const w = a.getBoundingClientRect().width || 200;
          const pxPerSec = Math.max(20, number(opts.speed, 60));
          marqueeAnim = inner.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${-w}px)` }],
            { duration: Math.max(600, w / pxPerSec * 1000), iterations: Infinity, easing: 'linear' });
        };
        const stopMarquee = () => {
          if (!marqueeAnim) return;
          marqueeAnim.cancel(); marqueeAnim = null;
          el.innerHTML = '';
          el.appendChild(rollViewport);
          resetToHome();
        };
        // continue mode uses a 3-segment stack [item0, item1, item0] so leaving
        // always rolls UP to the original and the reset (to the identical top
        // item0) is invisible. reverse mode uses a simple 2-state up/down slide.
        const upTf2 = 'translate3d(0,-2.7em,0)';
        if (continueRoll && track.children.length < 3 && track.firstElementChild) {
          const clone0 = track.firstElementChild.cloneNode(true);
          clone0.innerHTML = items[0];
          track.appendChild(clone0);
        }
        hoverAdvance = () => {
          if (destroyed) return;
          if (loopOnHover) { startMarquee(); return; }
          clearTimeout(continueResetTimer);
          if (continueRoll) {
            track.style.transition = 'none'; track.style.transform = homeTf; void track.offsetHeight;
            track.style.transition = `transform ${rollDuration}ms ${ease}`;
            track.style.transform = upTf;            // item0 -> item1
            el.setAttribute('aria-label', plainText(items[1 % items.length]));
            opts.onChange?.(1 % items.length, items[1 % items.length], el);
            return;
          }
          resetToHome(); void track.offsetHeight;   // reverse: start from home
          track.style.transition = `transform ${rollDuration}ms ${ease}`;
          track.style.transform = upTf;
          el.setAttribute('aria-label', plainText(items[1 % items.length]));
          opts.onChange?.(1 % items.length, items[1 % items.length], el);
        };
        hoverLeaveHandler = () => {
          if (destroyed) return;
          if (loopOnHover) { if (restoreOnLeave) stopMarquee(); return; }
          if (!restoreOnLeave) return;
          if (continueRoll) {
            track.style.transition = `transform ${rollDuration}ms ${ease}`;
            track.style.transform = upTf2;           // item1 -> item0 (third seg)
            el.setAttribute('aria-label', plainText(items[0]));
            opts.onChange?.(0, items[0], el);
            clearTimeout(continueResetTimer);
            continueResetTimer = setTimeout(() => {
              if (destroyed) return;
              track.style.transition = 'none';
              track.style.transform = homeTf;        // seg0 (item0) — identical, invisible
            }, rollDuration + 60);
            return;
          }
          track.style.transition = `transform ${rollDuration}ms ${ease}`;
          track.style.transform = homeTf;
          el.setAttribute('aria-label', plainText(items[0]));
          opts.onChange?.(0, items[0], el);
        };
        hoverEnterHandler = (event) => {
          if (!hoverState) hoverAdvance();
          hoverState |= event.type === 'pointerenter' ? 1 : 2;
        };
        hoverExitHandler = (event) => {
          if (event.type === 'focusout' && hoverTarget.contains(event.relatedTarget)) return;
          hoverState &= event.type === 'pointerleave' ? ~1 : ~2;
          if (!hoverState) hoverLeaveHandler();
        };
        hoverTarget.addEventListener('pointerenter', hoverEnterHandler);
        hoverTarget.addEventListener('focusin', hoverEnterHandler);
        hoverTarget.addEventListener('pointerleave', hoverExitHandler);
        hoverTarget.addEventListener('focusout', hoverExitHandler);
      } else if (items.length > 1) schedule(advance, number(opts.delay, hold));
    };

    // Item scene transitions: cycle discrete items with fade / dissolve / flip /
    // page(mask). Items overlap during the transition, then the new one settles
    // into flow (so the viewport sizes to it).
    const buildScenes = () => {
      const list = sceneItems || [];
      if (list.length < 2) { buildOverflow(); return; }
      clearMotion();
      el.innerHTML = '';
      el.style.whiteSpace = 'normal';
      el.setAttribute('role', opts.role || 'status');
      el.setAttribute('aria-live', opts.ariaLive || 'polite');
      const vp = document.createElement('span');
      vp.className = 'kt-overflow-scene-viewport';
      vp.style.cssText = 'display:block;position:relative;overflow:hidden;';
      if (mode === 'flip') vp.style.perspective = `${number(opts.perspective, 700, 100)}px`;
      el.appendChild(vp);
      const nodes = list.map((html) => {
        const node = document.createElement('span');
        node.className = 'kt-overflow-scene';
        node.innerHTML = html;
        // Measure each item stacked in normal flow first (so we can lock the
        // viewport to the tallest and it never collapses mid-transition).
        node.style.cssText = 'display:block;white-space:normal;position:relative;';
        if (mode === 'flip') node.style.transformOrigin = 'center';
        vp.appendChild(node);
        return node;
      });
      // Lock the box to the tallest item, then overlap all items absolutely so
      // switching one out never shrinks the parent (the old bug).
      let maxH = 0;
      nodes.forEach((node) => { maxH = Math.max(maxH, node.offsetHeight); });
      if (maxH > 0) vp.style.height = `${maxH}px`;
      nodes.forEach((node, i) => {
        node.style.position = 'absolute';
        node.style.inset = '0';
        node.style.opacity = i === 0 ? '1' : '0';
      });
      let idx = 0;
      const pageHold = number(opts.pageDuration, 1800, 120);
      const dur = number(opts.dissolveDuration ?? opts.flipDuration ?? opts.maskDuration, 460, 60);
      const flipDown = opts.flipDirection !== 'up';
      const framesFor = () => {
        if (mode === 'dissolve') return [[{ opacity: 1, filter: 'blur(0px)' }, { opacity: 0, filter: 'blur(7px)' }], [{ opacity: 0, filter: 'blur(7px)' }, { opacity: 1, filter: 'blur(0px)' }]];
        if (mode === 'flip') return [[{ transform: 'rotateX(0deg)', opacity: 1 }, { transform: `rotateX(${flipDown ? -90 : 90}deg)`, opacity: 0 }], [{ transform: `rotateX(${flipDown ? 90 : -90}deg)`, opacity: 0 }, { transform: 'rotateX(0deg)', opacity: 1 }]];
        if (mode === 'page') { // vertical mask wipe
          const down = opts.maskDirection !== 'bottom-to-top';
          return [[{ clipPath: 'inset(0 0 0 0)' }, { clipPath: down ? 'inset(0 0 100% 0)' : 'inset(100% 0 0 0)' }], [{ clipPath: down ? 'inset(100% 0 0 0)' : 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }]];
        }
        return [[{ opacity: 1 }, { opacity: 0 }], [{ opacity: 0 }, { opacity: 1 }]]; // fade
      };
      const swap = (nextIdx) => {
        if (destroyed) return;
        const cur = nodes[idx];
        const nxt = nodes[nextIdx];
        // Both stay absolutely overlapped (box height already locked); we only
        // cross-animate opacity/transform/clip so nothing reflows.
        const [outKf, inKf] = framesFor();
        const cfg = { duration: dur, easing: mode === 'flip' ? 'cubic-bezier(.4,0,.2,1)' : 'ease', fill: 'both' };
        const outAnim = cur.animate(outKf, cfg);
        animation = nxt.animate(inKf, cfg);
        const settle = () => {
          outAnim.cancel();
          animation?.cancel?.();
          cur.style.opacity = '0'; cur.style.transform = ''; cur.style.filter = ''; cur.style.clipPath = '';
          nxt.style.opacity = '1'; nxt.style.transform = ''; nxt.style.filter = ''; nxt.style.clipPath = '';
        };
        animation.onfinish = settle;
        idx = nextIdx;
        activeIndex = nextIdx;
        opts.onPage?.(nextIdx, nodes.length, el);
      };
      const step = () => {
        if (destroyed) return;
        if (paused) { schedule(step, pageHold); return; }
        const nextIdx = (idx + 1) % nodes.length;
        swap(nextIdx);
        if (opts.repeat !== false || nextIdx !== 0) schedule(step, pageHold);
      };
      schedule(step, delay + pageHold);
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

      if (mode === 'scroll-fade' || mode === 'scrollFade') {
        // Scroll to the end, fade out, then fade the start back in and scroll
        // again — a soft-looping marquee with no hard jump.
        const fadeMs = number(opts.maskDuration, 320, 10);
        if (opts.crossfade === true) {
          // Cross-dissolve the END view into the START view with no dead frame:
          // one track scrolls, and at the seam a frozen ghost of the end fades
          // out while the track (reset to the start) fades in — over the SAME
          // spot, so the two never scroll past each other and smear.
          const h = first.getBoundingClientRect().height || first.offsetHeight;
          viewport.style.height = h ? `${h}px` : '1.35em';
          track.style.position = 'absolute';
          track.style.left = '0';
          track.style.top = '0';
          track.style.willChange = 'transform,opacity';
          const runCross = async () => {
            if (destroyed || paused) return;
            track.style.opacity = '1';
            track.style.transform = `translate3d(${startX}px,0,0)`;
            const move = track.animate(
              [{ transform: `translate3d(${startX}px,0,0)` }, { transform: `translate3d(${endX}px,0,0)` }],
              { duration: moveDuration, delay, easing: opts.easing || 'linear', fill: 'forwards' }
            );
            animation = move;
            try { await move.finished; } catch (_e) { return; }
            if (destroyed || paused) return;
            move.cancel();
            track.style.transform = `translate3d(${endX}px,0,0)`;
            await new Promise((resolve) => schedule(resolve, endPause));
            if (destroyed || paused) return;
            const ghost = track.cloneNode(true);
            ghost.setAttribute('aria-hidden', 'true');
            ghost.style.cssText = track.style.cssText;
            ghost.style.transform = `translate3d(${endX}px,0,0)`;
            ghost.style.opacity = '1';
            viewport.appendChild(ghost);
            track.style.transform = `translate3d(${startX}px,0,0)`;
            track.style.opacity = '0';
            ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: fadeMs, easing: 'ease', fill: 'forwards' });
            const fadeIn = track.animate([{ opacity: 0 }, { opacity: 1 }], { duration: fadeMs, easing: 'ease', fill: 'forwards' });
            animation = fadeIn;
            try { await fadeIn.finished; } catch (_e) { ghost.remove(); return; }
            ghost.remove();
            track.style.opacity = '1';
            if (opts.repeat !== false) schedule(runCross, restartDelay);
          };
          runCross();
          return;
        }
        const total = delay + fadeMs + moveDuration + fadeMs + endPause;
        const d0 = clamp(delay / total, 0, 1);
        const o1 = clamp((delay + fadeMs) / total, d0, 1);
        const o2 = clamp((delay + fadeMs + moveDuration) / total, o1, 1);
        const o3 = clamp((delay + fadeMs + moveDuration + fadeMs) / total, o2, 1);
        animation = track.animate([
          { transform: `translate3d(${startX}px,0,0)`, opacity: 0, offset: 0 },
          { transform: `translate3d(${startX}px,0,0)`, opacity: 0, offset: d0 },
          { transform: `translate3d(${startX}px,0,0)`, opacity: 1, offset: o1 },
          { transform: `translate3d(${endX}px,0,0)`, opacity: 1, offset: o2 },
          { transform: `translate3d(${endX}px,0,0)`, opacity: 0, offset: o3 },
          { transform: `translate3d(${endX}px,0,0)`, opacity: 0, offset: 1 }
        ], { duration: total, iterations: opts.repeat === false ? 1 : Infinity, easing: 'linear', fill: 'both' });
        return;
      }

      if (mode === 'page-roll' || mode === 'pageRoll') {
        // Page + rolling hybrid: the first page shows as-is, then each next
        // page of the same long text rolls in vertically like a ticker.
        const pageSize = Math.max(1, viewportWidth - number(opts.pageOverlap, 12));
        const positions = [0];
        for (let moved = pageSize; moved < overflow; moved += pageSize) positions.push(moved);
        if (positions[positions.length - 1] !== overflow) positions.push(overflow);
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
        if (positions[positions.length - 1] !== overflow) positions.push(overflow);
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

      if (mode === 'fade') {
        // Pure crossfade between pages of the long text (no noise) — fade out,
        // jump to the next page, fade in.
        const pageSize = Math.max(1, viewportWidth - number(opts.pageOverlap, 12));
        const positions = [0];
        for (let moved = pageSize; moved < overflow; moved += pageSize) positions.push(moved);
        if (positions[positions.length - 1] !== overflow) positions.push(overflow);
        const fadeMs = number(opts.maskDuration, 300, 10);
        const pageHold = number(opts.pageDuration, 1200, 120);
        let pageIndex = 0;
        const swapFade = async () => {
          if (destroyed || paused) return;
          await track.animate([{ opacity: 1 }, { opacity: 0 }], { duration: fadeMs, easing: 'ease', fill: 'forwards' }).finished.catch(() => {});
          if (destroyed) return;
          pageIndex = (pageIndex + 1) % positions.length;
          const moved = positions[pageIndex];
          const target = horizontalDirection < 0 ? -moved : -(overflow - moved);
          track.style.transform = `translate3d(${target}px,0,0)`;
          animation = track.animate([{ opacity: 0 }, { opacity: 1 }], { duration: fadeMs, easing: 'ease', fill: 'forwards' });
          await animation.finished.catch(() => {});
          track.dataset.page = String(pageIndex);
          opts.onPage?.(pageIndex, positions.length, el);
          if (opts.repeat !== false || pageIndex < positions.length - 1) schedule(swapFade, pageIndex === 0 ? restartDelay : pageHold);
        };
        schedule(swapFade, delay);
        return;
      }

      if (mode === 'flip') {
        // Split-flap page turn: the visible line flips down (or up) around its
        // horizontal axis and comes back showing the next page of text.
        el.style.perspective = `${number(opts.perspective, 520, 120)}px`;
        const pageSize = Math.max(1, viewportWidth - number(opts.pageOverlap, 12));
        const positions = [0];
        for (let moved = pageSize; moved < overflow; moved += pageSize) positions.push(moved);
        if (positions[positions.length - 1] !== overflow) positions.push(overflow);
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
        if (positions[positions.length - 1] !== overflow) positions.push(overflow);
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
      else if (sceneItems && sceneItems.length >= 2) buildScenes();
      else buildOverflow();
    };
    build();

    // Modes that drive themselves with schedule()/recursion (not a single WAAPI
    // handle) must be REBUILT to resume, and rebuilt via build() on resize so
    // scene transitions aren't clobbered into a plain overflow marquee.
    const selfScheduling = ['rolling', 'fade', 'dissolve', 'flip', 'page', 'page-roll', 'pageRoll', 'scroll-fade', 'scrollFade'].includes(mode)
      || (sceneItems && sceneItems.length >= 2);

    if (typeof ResizeObserver !== 'undefined' && mode !== 'rolling') {
      let width = el.clientWidth;
      resizeObserver = new ResizeObserver(() => {
        if (Math.abs(el.clientWidth - width) < 1) return;
        width = el.clientWidth;
        clearMotion();
        build();
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
    if (pauseOnHover && !hoverTrigger) {
      el.addEventListener('pointerenter', onHoverIn);
      el.addEventListener('pointerleave', onHoverOut);
    }

    return {
      el,
      type: 'overflowText',
      get index() { return activeIndex; },
      replay() { clearMotion(); activeIndex = 0; build(); },
      pause() { paused = true; animation?.pause?.(); clearTimeout(timer); },
      resume() {
        paused = false;
        // Self-scheduling loops (scroll-fade crossfade, page/flip/scene, rolling)
        // leave a stale finished handle, so re-run the loop instead of play().
        if (selfScheduling) { clearMotion(); build(); }
        else { animation?.play?.(); if (!animation) build(); }
      },
      destroy() {
        destroyed = true;
        clearMotion();
        resizeObserver?.disconnect();
        el.removeEventListener('pointerenter', onHoverIn);
        el.removeEventListener('pointerleave', onHoverOut);
        if (hoverTarget && hoverEnterHandler) { hoverTarget.removeEventListener('pointerenter', hoverEnterHandler); hoverTarget.removeEventListener('focusin', hoverEnterHandler); }
        if (hoverTarget && hoverExitHandler) { hoverTarget.removeEventListener('pointerleave', hoverExitHandler); hoverTarget.removeEventListener('focusout', hoverExitHandler); }
        if (originalStyle == null) el.removeAttribute('style'); else el.setAttribute('style', originalStyle);
        if (originalTitle == null) el.removeAttribute('title'); else el.setAttribute('title', originalTitle);
        if (originalAria == null) el.removeAttribute('aria-label'); else el.setAttribute('aria-label', originalAria);
        if (originalRole == null) el.removeAttribute('role'); else el.setAttribute('role', originalRole);
        el.innerHTML = originalHTML;
        delete el.dataset.ktOverflowActive;
      }
    };
  },
  fallback() {},
  reduced() {}
};
