// Fullpage section paging — fullpage.js-style snapping between full-height
// sections, driven by wheel, touch swipe, keyboard and dot navigation.
//
// - Percent-based transforms: any viewport/container resize is handled
//   instantly with no recalculation (responsive & mobile by construction).
// - The container only hijacks scroll while it can actually move in that
//   direction, so an embedded container never traps the page.
// - mode:'snap' opts into native CSS scroll-snap instead of transforms
//   (progressive enhancement); reduced motion falls back to it automatically.

export default {
  create(el, opts) {
    const originalHTML = el.innerHTML;
    const originalStyle = el.getAttribute('style');
    const sections = opts.sectionSelector
      ? Array.from(el.querySelectorAll(opts.sectionSelector))
      : Array.from(el.children);
    if (!sections.length) return null;

    const duration = Math.max(0.15, Number(opts.duration ?? 0.75));
    const easing = typeof opts.ease === 'string' && (opts.ease.includes('(') || opts.ease.startsWith('ease') || opts.ease === 'linear')
      ? opts.ease
      : 'cubic-bezier(.76,0,.24,1)';
    const loop = opts.loop === true;
    // Mixed axis: a SINGLE sequence whose steps change direction — e.g. A→B→C
    // slide horizontally, C→D slides vertically. Each section carries the axis
    // of the move that lands on it via data-kt-fp-axis ('x'|'y'); the first
    // section has none. Unspecified steps default to horizontal.
    const perStepAxis = sections.map((section, sectionIndex) => {
      if (sectionIndex === 0) return null;
      const declared = section.getAttribute('data-kt-fp-axis');
      return declared === 'x' || declared === 'y' ? declared : null;
    });
    const mixed = opts.axis === 'mixed' || perStepAxis.some(Boolean);
    const useSnap = opts.mode === 'snap' && !mixed;
    // axis:'x' pages horizontally; axis:'mixed' varies per step (see above).
    const horizontal = opts.axis === 'x';
    // 2D grid coordinates for each section (in whole-viewport units).
    const coords = [{ x: 0, y: 0 }];
    for (let sectionIndex = 1; sectionIndex < sections.length; sectionIndex += 1) {
      const stepAxis = perStepAxis[sectionIndex] || 'x';
      const prev = coords[sectionIndex - 1];
      coords.push(stepAxis === 'y' ? { x: prev.x, y: prev.y + 1 } : { x: prev.x + 1, y: prev.y });
    }
    const bidir = horizontal || mixed;
    const threshold = Math.max(4, Number(opts.threshold ?? 24));
    let index = Math.min(sections.length - 1, Math.max(0, Number(opts.initial ?? 0)));
    let animating = false;
    let alive = true;

    if (opts.height) el.style.height = typeof opts.height === 'number' ? `${opts.height}px` : String(opts.height);
    else if (el.clientHeight < 10) el.style.height = '100svh';
    el.classList.add('kt-fullpage');
    el.style.position = 'relative';
    el.style.overflow = 'hidden';
    // overscroll-behavior:contain stops the COMPOSITOR from chain-scrolling the
    // parent on uncancelable wheel events (fast mouse wheels), which is what
    // otherwise scrolls the page at the same time as the deck. Because this then
    // also blocks the browser's own hand-off at the edges, we drive the outer
    // scroll ourselves there (see onWheel) — so there's no trap either.
    el.style.overscrollBehavior = 'contain';

    // Nearest scrollable ancestor (or null → the window), used to hand the
    // gesture off at the deck's edges since `contain` blocks native chaining.
    const scrollParent = () => {
      let node = el.parentElement;
      while (node && node !== document.body && node !== document.documentElement) {
        const style = getComputedStyle(node);
        if (/(auto|scroll|overlay)/.test(style.overflowY) && node.scrollHeight > node.clientHeight) return node;
        node = node.parentElement;
      }
      return null;
    };

    const track = document.createElement('div');
    track.className = 'kt-fullpage-track';
    track.style.cssText = mixed
      ? 'position:relative;height:100%;width:100%;will-change:transform;'
      : horizontal
        ? 'height:100%;width:100%;display:flex;will-change:transform;'
        : 'height:100%;will-change:transform;';
    sections.forEach((section, sectionIndex) => {
      section.classList.add('kt-fullpage-section');
      section.style.height = '100%';
      if (mixed) {
        // Each section is absolutely placed at its 2D grid coordinate; the
        // track then translates so the active section sits at (0,0).
        section.style.position = 'absolute';
        section.style.top = '0';
        section.style.left = '0';
        section.style.width = '100%';
        section.style.transform = `translate3d(${coords[sectionIndex].x * 100}%,${coords[sectionIndex].y * 100}%,0)`;
      } else if (horizontal) {
        section.style.flex = '0 0 100%';
      }
      section.style.overflow = 'hidden';
      track.appendChild(section);
    });
    el.appendChild(track);
    if (horizontal) el.style.touchAction = 'pan-y';

    let onSnapScroll = null;
    if (useSnap) {
      // Native scroll-snap needs real overflow: size the track to N×100% so
      // the percent chain still resolves (sections each 100%/N of the track).
      if (horizontal) {
        el.style.overflowX = 'auto';
        el.style.scrollSnapType = 'x mandatory';
        track.style.width = `${sections.length * 100}%`;
        sections.forEach((section) => { section.style.flex = `0 0 ${100 / sections.length}%`; section.style.scrollSnapAlign = 'start'; });
      } else {
        el.style.overflowY = 'auto';
        el.style.scrollSnapType = 'y mandatory';
        track.style.height = `${sections.length * 100}%`;
        sections.forEach((section) => { section.style.height = `${100 / sections.length}%`; section.style.scrollSnapAlign = 'start'; });
      }
      // Keep dots and callbacks in sync with native snapping.
      onSnapScroll = () => {
        const position = horizontal ? el.scrollLeft / Math.max(1, el.clientWidth) : el.scrollTop / Math.max(1, el.clientHeight);
        const next = Math.min(sections.length - 1, Math.max(0, Math.round(position)));
        if (next !== index) {
          index = next;
          syncDots();
          opts.onChange?.(index, sections[index]);
        }
      };
      el.addEventListener('scroll', onSnapScroll, { passive: true });
    }

    // Dot navigation.
    let dotsWrap = null;
    let dots = [];
    const syncDots = () => dots.forEach((dot, dotIndex) => {
      const active = dotIndex === index;
      dot.setAttribute('aria-current', active ? 'true' : 'false');
      dot.style.transform = active ? 'scale(1.45)' : 'scale(1)';
      dot.style.opacity = active ? '1' : '.45';
    });
    if (opts.dots !== false) {
      dotsWrap = document.createElement('div');
      dotsWrap.className = 'kt-fullpage-dots';
      dotsWrap.setAttribute('role', 'tablist');
      dotsWrap.style.cssText = bidir
        ? 'position:absolute;left:50%;bottom:12px;transform:translateX(-50%);display:flex;flex-direction:row;gap:10px;z-index:5;'
        : 'position:absolute;right:14px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:10px;z-index:5;';
      dots = sections.map((_, dotIndex) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'kt-fullpage-dot';
        dot.setAttribute('aria-label', `Go to section ${dotIndex + 1}`);
        dot.style.cssText = 'width:8px;height:8px;border-radius:50%;border:0;padding:0;cursor:pointer;background:var(--kt-fullpage-dot,currentColor);opacity:.45;transition:transform .25s ease,opacity .25s ease;';
        dot.addEventListener('click', () => go(dotIndex));
        dotsWrap.appendChild(dot);
        return dot;
      });
      el.appendChild(dotsWrap);
    }

    const settle = () => { animating = false; };
    track.addEventListener('transitionend', settle);

    const go = (next, immediate = false) => {
      if (!alive) return;
      let target = next;
      if (loop) target = (next + sections.length) % sections.length;
      target = Math.min(sections.length - 1, Math.max(0, target));
      if (target === index && !immediate) return;
      const from = index;
      index = target;
      opts.onLeave?.(from, index, sections[from]);
      if (useSnap) {
        sections[index].scrollIntoView(horizontal
          ? { behavior: immediate ? 'auto' : 'smooth', inline: 'start', block: 'nearest' }
          : { behavior: immediate ? 'auto' : 'smooth', block: 'start' });
      } else {
        animating = !immediate;
        track.style.transition = immediate ? 'none' : `transform ${duration}s ${easing}`;
        track.style.transform = mixed
          ? `translate3d(${-coords[index].x * 100}%,${-coords[index].y * 100}%,0)`
          : horizontal
            ? `translate3d(${-index * 100}%,0,0)`
            : `translate3d(0,${-index * 100}%,0)`;
        if (!immediate) setTimeout(settle, duration * 1000 + 120);
      }
      syncDots();
      opts.onChange?.(index, sections[index]);
    };

    const canMove = (dir) => loop || (dir > 0 ? index < sections.length - 1 : index > 0);

    // Wheel handling, gated ONLY by the transition:
    //   • While the deck can move in the wheel's direction, we preventDefault —
    //     the outer scroller stays frozen and the deck steps once. Momentum /
    //     rapid notches that arrive during the transition are swallowed by the
    //     `animating` guard, so one intent = one step.
    //   • At an edge we can't move toward, we do NOT preventDefault, so the
    //     wheel cleanly hands off to an outer scroll container / the page.
    // No gesture timer: rapid mouse-wheel notches used to fall inside a
    // "same gesture" window and get swallowed forever, trapping the user.
    let cooldownUntil = 0;
    let lastWheelAt = 0;
    let absorbTail = false; // swallow the momentum tail of the flick that hit an edge
    const onWheel = (event) => {
      if (useSnap && !horizontal) return; // vertical snap scrolls natively
      const now = performance.now();
      const continuous = now - lastWheelAt < 140; // same uninterrupted flick
      lastWheelAt = now;
      if (!continuous) absorbTail = false; // the wheel stream went cold → stop absorbing
      // Normalise to pixels: some mice report deltas in LINES (deltaMode 1) or
      // PAGES (2). Without this, a line-mode wheel (deltaY≈3) fell under the
      // threshold and the deck never reacted.
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? el.clientHeight : 1;
      const dy = event.deltaY * unit;
      const dx = event.deltaX * unit;
      const delta = bidir ? (Math.abs(dx) >= Math.abs(dy) ? dx : dy) : dy;
      if (Math.abs(delta) < 4) return;
      const dir = delta > 0 ? 1 : -1;
      // Inside a scroll container, only take over once the deck is fully pinned
      // (covers the container's viewport). Otherwise let the container finish
      // scrolling the deck into place first — e.g. scrolling back UP, the parent
      // rises until the deck is fully in view, THEN the deck starts paging.
      const sp = scrollParent();
      if (sp) {
        const er = el.getBoundingClientRect();
        const pr = sp.getBoundingClientRect();
        const pinned = er.top <= pr.top + 1 && er.bottom >= pr.bottom - 1;
        if (!pinned) {
          event.preventDefault();
          event.stopPropagation();
          sp.scrollTop += dy;
          return;
        }
      }
      // At an edge → hand the scroll to the outer scroller. Because `contain`
      // blocks native chaining, we drive it ourselves. While a transition is
      // running, or while still absorbing the tail of the flick that reached the
      // edge, we swallow instead — so ONE flick never both advances the deck AND
      // scrolls the page.
      if (!canMove(dir)) {
        event.preventDefault();
        event.stopPropagation();
        if (animating || absorbTail) return;
        if (sp) sp.scrollTop += dy;
        else window.scrollBy(0, dy);
        return;
      }
      // Can move → hijack. Freeze the outer scroller for this event.
      event.preventDefault();
      event.stopPropagation();
      // One step per transition (+ short cooldown so trackpad inertia doesn't
      // over-shoot multiple slides in a single flick).
      if (animating || now < cooldownUntil) return;
      cooldownUntil = now + Math.max(320, duration * 1000 + 90);
      go(index + dir);
      // If that step landed on an edge, absorb the rest of THIS flick's tail.
      if (!canMove(dir)) absorbTail = true;
    };

    // Touch swipe. While a swipe is being handled (or a transition runs), the
    // move events are prevented so the page behind never pans on mobile; a
    // swipe at the first/last section falls through to normal page scroll.
    let touchStartY = null;
    let touchConsumed = false;
    const onTouchStart = (event) => { touchStartY = event.touches[0].clientY; touchConsumed = false; };
    const onTouchMove = (event) => {
      if (useSnap || touchStartY == null) return;
      if (animating || touchConsumed) { event.preventDefault(); return; }
      const delta = touchStartY - event.touches[0].clientY;
      if (Math.abs(delta) > 6 && canMove(delta > 0 ? 1 : -1)) {
        event.preventDefault();
        if (Math.abs(delta) >= threshold) {
          // Navigate as soon as the swipe passes the threshold — the rest of
          // this touch is swallowed entirely.
          touchConsumed = true;
          go(index + (delta > 0 ? 1 : -1));
        }
      }
    };
    const onTouchEnd = (event) => {
      if (useSnap || touchStartY == null) return;
      const delta = touchStartY - event.changedTouches[0].clientY;
      touchStartY = null;
      if (touchConsumed || Math.abs(delta) < threshold || animating) return;
      const dir = delta > 0 ? 1 : -1;
      if (canMove(dir)) go(index + dir);
    };

    // Keyboard, when focus is on/inside the container.
    const onKeyDown = (event) => {
      if (!el.contains(document.activeElement)) return;
      const forwardKeys = mixed ? ['ArrowRight', 'ArrowDown', 'PageDown', ' '] : horizontal ? ['ArrowRight', 'PageDown', ' '] : ['ArrowDown', 'PageDown', ' '];
      const backKeys = mixed ? ['ArrowLeft', 'ArrowUp', 'PageUp'] : horizontal ? ['ArrowLeft', 'PageUp'] : ['ArrowUp', 'PageUp'];
      const forward = forwardKeys.includes(event.key);
      const back = backKeys.includes(event.key);
      if (!forward && !back && event.key !== 'Home' && event.key !== 'End') return;
      event.preventDefault();
      if (event.key === 'Home') go(0);
      else if (event.key === 'End') go(sections.length - 1);
      else go(index + (forward ? 1 : -1));
    };

    // Mouse drag-swipe (drag:false disables). Same threshold as touch.
    let dragStart = null;
    let dragConsumed = false;
    const onPointerDown = (event) => {
      if (useSnap || event.pointerType !== 'mouse' || event.button !== 0) return;
      if (event.target.closest('.kt-fullpage-dot')) return;
      dragStart = horizontal ? event.clientX : event.clientY;
      dragConsumed = false;
      el.style.cursor = 'grabbing';
    };
    const onPointerMove = (event) => {
      if (dragStart == null || dragConsumed || animating || event.pointerType !== 'mouse') return;
      const delta = dragStart - (horizontal ? event.clientX : event.clientY);
      if (Math.abs(delta) >= threshold) {
        dragConsumed = true;
        const dir = delta > 0 ? 1 : -1;
        if (canMove(dir)) go(index + dir);
      }
    };
    const onPointerUp = () => { dragStart = null; el.style.cursor = opts.drag === false ? '' : 'grab'; };
    if (opts.drag !== false && !useSnap) {
      el.style.cursor = 'grab';
      el.style.userSelect = 'none';
      el.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    }

    if (opts.wheel !== false) el.addEventListener('wheel', onWheel, { passive: false });
    if (opts.touch !== false) {
      el.addEventListener('touchstart', onTouchStart, { passive: true });
      el.addEventListener('touchmove', onTouchMove, { passive: false });
      el.addEventListener('touchend', onTouchEnd, { passive: true });
    }
    if (opts.keyboard !== false) {
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
      el.addEventListener('keydown', onKeyDown);
    }

    go(index, true);

    return {
      el,
      type: 'fullpage',
      go,
      next: () => go(index + 1),
      prev: () => go(index - 1),
      get index() { return index; },
      pause() {},
      resume() {},
      destroy() {
        alive = false;
        el.removeEventListener('wheel', onWheel);
        el.removeEventListener('touchstart', onTouchStart);
        el.removeEventListener('touchmove', onTouchMove);
        el.removeEventListener('touchend', onTouchEnd);
        el.removeEventListener('keydown', onKeyDown);
        el.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        if (onSnapScroll) el.removeEventListener('scroll', onSnapScroll);
        track.removeEventListener('transitionend', settle);
        el.classList.remove('kt-fullpage');
        el.innerHTML = originalHTML;
        if (originalStyle == null) el.removeAttribute('style'); else el.setAttribute('style', originalStyle);
      }
    };
  },

  // Reduced motion: native scroll with snap points — same structure, no
  // transform animation, no hijacked wheel.
  reduced(el, opts) {
    const originalStyle = el.getAttribute('style');
    const sections = opts.sectionSelector
      ? Array.from(el.querySelectorAll(opts.sectionSelector))
      : Array.from(el.children);
    if (el.clientHeight < 10 && !opts.height) el.style.height = '100svh';
    el.style.overflowY = 'auto';
    el.style.scrollSnapType = 'y proximity';
    const restoreSections = sections.map((section) => {
      const previous = section.getAttribute('style');
      section.style.minHeight = '100%';
      section.style.scrollSnapAlign = 'start';
      return () => { if (previous == null) section.removeAttribute('style'); else section.setAttribute('style', previous); };
    });
    return {
      el,
      type: 'fullpage',
      pause() {},
      resume() {},
      destroy() {
        restoreSections.forEach((fn) => fn());
        if (originalStyle == null) el.removeAttribute('style'); else el.setAttribute('style', originalStyle);
      }
    };
  }
};
