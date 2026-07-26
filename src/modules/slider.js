import { clamp, lerp, snapshotInlineStyles } from '../utils.js';

/*
 * Single-engine slider: one continuous position value drives every slide
 * transform through a rAF spring, so drag, buttons, keyboard and autoplay can
 * never fight each other or double-run. Coverflow renders centered 3D slides
 * from the same value.
 */
export default {
  create(el, opts = {}) {
    const wrap = el.querySelector('.kt-slider-wrap') || el;
    const track = wrap.querySelector('.kt-slider-track') || el.firstElementChild;
    if (!track) return null;
    const slides = Array.from(track.children);
    if (!slides.length) return null;

    const effect = opts.effect || opts.preset || 'slide';
    const coverflow = effect === 'coverflow';
    // fade/dissolve: slides stack in place and cross-fade by distance from active.
    const fade = effect === 'fade' || effect === 'dissolve';
    const gap = Math.max(0, Number(opts.gap ?? (coverflow ? 22 : 0)));
    const perView = fade ? 1 : clamp(Number(opts.perView ?? (coverflow ? 1.35 : 1)), 1, slides.length);
    // The active slide is centered by default in both effects; align:'left'
    // restores the classic left-edge slide alignment.
    const centered = coverflow || (opts.align || 'center') !== 'left';
    const maxIndex = centered ? slides.length - 1 : Math.max(0, Math.ceil(slides.length - perView));
    // loop: false/'off' = none · true/'infinite' = seamless endless ring ·
    // 'rewind' = play to the last slide, then return to the first.
    const loopMode = opts.loop === true ? 'infinite' : (opts.loop || 'off');
    const seamless = loopMode === 'infinite';
    const smoothing = clamp(Number(opts.smoothing ?? (0.14 / Math.max(0.2, Number(opts.speed ?? opts.duration ?? 0.55) / 0.55))), 0.02, 0.5);
    const autoplayDelay = opts.autoplay === true ? 3000 : Math.max(0, Number(opts.autoplay || 0));
    // Hover pausing is opt-in. This keeps the runtime aligned with the settings
    // switch: an unchecked Pause on hover control must never pause autoplay.
    const pauseOnHover = opts.pauseOnHover === true;
    const rotate = Number(opts.rotate ?? 32);
    const depth = Number(opts.depth ?? 140);
    const scaleStep = Number(opts.scaleStep ?? 0.12);
    const minScale = clamp(Number(opts.minScale ?? 0.8), 0.2, 1);
    const opacityStep = Number(opts.opacityStep ?? 0.32);
    const minOpacity = clamp(Number(opts.minOpacity ?? 0.25), 0, 1);
    // axis:'y' pages vertically (slides stack top→bottom, drag/keys follow).
    const vertical = opts.axis === 'y';

    const original = {
      wrap: wrap.getAttribute('style'), track: track.getAttribute('style'),
      wrapRole: wrap.getAttribute('role'), wrapLabel: wrap.getAttribute('aria-label'), wrapTab: wrap.getAttribute('tabindex'),
      slides: slides.map((slide) => ({ style: slide.getAttribute('style'), role: slide.getAttribute('role'), hidden: slide.getAttribute('aria-hidden'), label: slide.getAttribute('aria-label') }))
    };

    let index = clamp(Math.round(Number(opts.initial ?? 0)), 0, maxIndex);
    let position = index;      // rendered (smoothed) position
    let target = index;        // where the spring is heading
    let dragging = false;
    let dragStartX = 0;
    let dragStartTarget = 0;
    let lastMoveX = 0;
    let lastMoveTime = 0;
    let velocity = 0;
    let pointerId = null;
    let rafId = null;
    let timer = null;
    let timerStartedAt = 0;
    let remaining = autoplayDelay;
    let hoverPaused = false;
    let paused = false;
    let alive = true;
    let pauseButton = null;
    // Assigned once the progress bar is set up (below); no-op until then so the
    // autoplay start() can call it without a temporal-dead-zone hazard.
    let resetProgressSafe = () => {};

    wrap.setAttribute('role', 'region');
    wrap.setAttribute('aria-roledescription', 'carousel');
    wrap.setAttribute('aria-label', opts.label || 'Carousel');
    if (!wrap.hasAttribute('tabindex')) wrap.tabIndex = 0;
    wrap.style.overflow = 'hidden';
    wrap.style.touchAction = vertical ? 'pan-x' : 'pan-y';
    wrap.style.position = 'relative';
    if (coverflow) wrap.style.perspective = `${Number(opts.perspective ?? 1100)}px`;
    track.style.display = 'block';
    track.style.position = 'relative';
    track.style.width = '100%';
    track.style.transformStyle = coverflow ? 'preserve-3d' : 'flat';

    const slideWidthPercent = 100 / perView;
    slides.forEach((slide, slideIndex) => {
      slide.style.position = slideIndex === 0 ? 'relative' : 'absolute';
      slide.style.top = '0';
      slide.style.left = '0';
      if (vertical) {
        slide.style.width = '100%';
        slide.style.height = `calc(${slideWidthPercent}% - ${(gap * (perView - 1)) / perView}px)`;
        if (slideIndex !== 0) slide.style.width = '100%';
      } else {
        slide.style.width = `calc(${slideWidthPercent}% - ${(gap * (perView - 1)) / perView}px)`;
        slide.style.minWidth = '0';
        if (slideIndex !== 0) slide.style.height = '100%';
      }
      slide.style.transformOrigin = '50% 50%';
      slide.style.willChange = 'transform,opacity';
      slide.style.transition = 'none';
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', `${slideIndex + 1} of ${slides.length}`);
    });

    const metrics = () => {
      const rect = wrap.getBoundingClientRect();
      const width = (vertical ? rect.height : rect.width) || 1;
      // offsetWidth/Height ignore transforms — measuring the bounding box of
      // a scaled/rotated side slide skewed the math, so the last slide never
      // landed dead-center.
      const slideWidth = (vertical ? slides[0].offsetHeight : slides[0].offsetWidth) || width / perView;
      return { width, slideWidth, step: slideWidth + gap };
    };

    const render = () => {
      if (fade) {
        // Stack every slide and cross-fade by distance from the active position.
        slides.forEach((slide, slideIndex) => {
          const distance = seamless ? wrapDelta(slideIndex - position) : slideIndex - position;
          const absolute = Math.abs(distance);
          slide.style.transform = 'translate3d(0,0,0)';
          slide.style.opacity = String(clamp(1 - absolute, 0, 1));
          slide.style.zIndex = String(absolute < 0.5 ? 2 : 1);
          slide.style.pointerEvents = absolute < 0.5 ? '' : 'none';
        });
        return;
      }
      const { width, slideWidth, step } = metrics();
      const centerOffset = centered ? (width - slideWidth) / 2 : 0;
      slides.forEach((slide, slideIndex) => {
        const distance = seamless ? wrapDelta(slideIndex - position) : slideIndex - position;
        const absolute = Math.abs(distance);
        const baseX = centerOffset + distance * step * (coverflow ? Number(opts.spacing ?? 0.62) : 1);
        if (coverflow) {
          const angle = clamp(-distance * rotate, -rotate * 1.4, rotate * 1.4);
          const scale = Math.max(minScale, 1 - absolute * scaleStep);
          slide.style.transform = vertical
            ? `translate3d(0,${baseX}px,${-absolute * depth}px) rotateX(${-angle}deg) scale(${scale})`
            : `translate3d(${baseX}px,0,${-absolute * depth}px) rotateY(${angle}deg) scale(${scale})`;
          slide.style.opacity = String(Math.max(minOpacity, 1 - absolute * opacityStep));
          slide.style.zIndex = String(1000 - Math.round(absolute * 10));
        } else {
          slide.style.transform = vertical ? `translate3d(0,${baseX}px,0)` : `translate3d(${baseX}px,0,0)`;
          slide.style.opacity = '1';
          slide.style.zIndex = '';
        }
      });
    };

    const syncState = () => {
      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === index;
        const hidden = centered
          ? Math.abs(slideIndex - index) > Math.ceil(perView / 2)
          : slideIndex < index || slideIndex >= index + Math.ceil(perView);
        slide.setAttribute('aria-hidden', String(coverflow ? !active : hidden));
        slide.classList.toggle('is-active', active);
      });
      el.dataset.ktSliderIndex = String(index);
      updateDots();
      opts.onChange?.(index, slides[index], el);
    };

    const tick = () => {
      if (!alive) return;
      position = lerp(position, target, dragging ? 0.55 : smoothing);
      render();
      if (dragging || Math.abs(position - target) > 0.0015) {
        rafId = requestAnimationFrame(tick);
      } else {
        position = target;
        render();
        rafId = null;
      }
    };
    const wake = () => { if (alive && rafId == null) rafId = requestAnimationFrame(tick); };

    const slideCount = slides.length;
    // Shortest signed distance around the ring, mapped into [-n/2, n/2]. A slide
    // past the halfway point teleports to the near side while it's off-screen
    // (or faded out in coverflow) — that's what makes the loop seamless with no
    // cloned DOM nodes and no snap-back when wrapping last → first.
    const wrapDelta = (d) => { d = ((d % slideCount) + slideCount) % slideCount; return d > slideCount / 2 ? d - slideCount : d; };
    const normalize = (value) => ((Math.round(value) % slideCount) + slideCount) % slideCount;
    // In loop mode the continuous target just keeps climbing/falling forever, so
    // the spring never has to unwind the whole track to wrap around.
    const settle = (raw) => {
      target = seamless ? raw : clamp(raw, 0, maxIndex);
      const nextIndex = seamless ? normalize(target) : clamp(Math.round(target), 0, maxIndex);
      if (nextIndex !== index) { index = nextIndex; syncState(); }
      wake();
    };
    const goTo = (value) => {
      if (seamless) { const base = Math.round(target); settle(base + Math.round(wrapDelta(value - base))); }
      else settle(value);
    };
    const next = () => {
      if (seamless) return settle(Math.round(target) + 1);
      if (loopMode === 'rewind' && index >= maxIndex) return goTo(0);
      return goTo(index + 1);
    };
    const prev = () => {
      if (seamless) return settle(Math.round(target) - 1);
      if (loopMode === 'rewind' && index <= 0) return goTo(maxIndex);
      return goTo(index - 1);
    };

    const stop = (preserve = true) => {
      if (timer != null && preserve) {
        remaining = Math.max(0, remaining - (performance.now() - timerStartedAt));
      }
      clearTimeout(timer);
      timer = null;
    };
    const resetAutoplayClock = () => {
      remaining = autoplayDelay;
      resetProgressSafe();
    };
    const start = (reset = false) => {
      stop(false);
      if (reset) resetAutoplayClock();
      if (!autoplayDelay || paused || hoverPaused || dragging) return;
      if (remaining <= 16) remaining = autoplayDelay;
      timerStartedAt = performance.now();
      timer = setTimeout(() => {
        timer = null;
        if (!dragging && !paused && !hoverPaused) {
          next();
          resetAutoplayClock();
        }
        start();
      }, remaining);
    };

    const onDown = (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      dragging = true;
      pointerId = event.pointerId;
      dragStartX = vertical ? event.clientY : event.clientX;
      dragStartTarget = target;
      lastMoveX = vertical ? event.clientY : event.clientX;
      lastMoveTime = performance.now();
      velocity = 0;
      wrap.setPointerCapture?.(pointerId);
      stop();
      wake();
    };
    const onMove = (event) => {
      if (!dragging || event.pointerId !== pointerId) return;
      const { step } = metrics();
      const pointerPosition = vertical ? event.clientY : event.clientX;
      const diff = pointerPosition - dragStartX;
      let value = dragStartTarget - diff / Math.max(1, step);
      if (!seamless) {
        if (value < 0) value *= 0.3;
        else if (value > maxIndex) value = maxIndex + (value - maxIndex) * 0.3;
      }
      const now = performance.now();
      const dt = Math.max(1, now - lastMoveTime);
      velocity = (lastMoveX - pointerPosition) / dt; // px per ms toward next
      lastMoveX = pointerPosition;
      lastMoveTime = now;
      target = value;
      wake();
    };
    const onEnd = (event) => {
      if (!dragging || event.pointerId !== pointerId) return;
      dragging = false;
      wrap.releasePointerCapture?.(pointerId);
      const { step } = metrics();
      const fling = clamp(velocity * step * 0.35 / Math.max(1, step), -1.2, 1.2);
      goTo(target + fling);
      start();
    };
    const onKey = (event) => {
      const forwardKey = vertical ? 'ArrowDown' : 'ArrowRight';
      const backKey = vertical ? 'ArrowUp' : 'ArrowLeft';
      if (event.key === forwardKey) { event.preventDefault(); next(); }
      else if (event.key === backKey) { event.preventDefault(); prev(); }
      else if (event.key === 'Home') { event.preventDefault(); goTo(0); }
      else if (event.key === 'End') { event.preventDefault(); goTo(maxIndex); }
    };

    const nextButtons = Array.from(document.querySelectorAll(opts.nextSelector || `[data-kt-slider-next="${el.id || ''}"], [data-kt-slider-next]`)).filter((button) => !button.dataset.ktSliderBound);
    const prevButtons = Array.from(document.querySelectorAll(opts.prevSelector || `[data-kt-slider-prev="${el.id || ''}"], [data-kt-slider-prev]`)).filter((button) => !button.dataset.ktSliderBound);
    const bindButton = (button, handler) => { button.dataset.ktSliderBound = 'true'; button.addEventListener('click', handler); };
    nextButtons.forEach((button) => bindButton(button, next));
    prevButtons.forEach((button) => bindButton(button, prev));

    // Horizontal swipe must win over page scroll once a drag has started.
    const onTouchMove = (event) => { if (dragging) event.preventDefault(); };
    wrap.addEventListener('pointerdown', onDown);
    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerup', onEnd);
    wrap.addEventListener('pointercancel', onEnd);
    wrap.addEventListener('touchmove', onTouchMove, { passive: false });
    wrap.addEventListener('keydown', onKey);
    // Mouse-wheel navigation (opt-in): whichever wheel axis has the larger delta
    // pages the slider, throttled so one flick advances one slide.
    const wheelNav = opts.wheel === true;
    let wheelLock = 0;
    const onWheel = (event) => {
      const delta = Math.abs(event.deltaX) >= Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(delta) < 6) return;
      event.preventDefault();
      const now = performance.now();
      if (now - wheelLock < 320) return;
      wheelLock = now;
      if (delta > 0) next(); else prev();
    };
    if (wheelNav) wrap.addEventListener('wheel', onWheel, { passive: false });
    const onEnter = () => { if (pauseOnHover) { hoverPaused = true; stop(); } };
    const onLeave = () => { if (pauseOnHover) { hoverPaused = false; start(); } };
    wrap.addEventListener('pointerenter', onEnter);
    wrap.addEventListener('pointerleave', onLeave);
    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => { render(); }) : null;
    resizeObserver?.observe(wrap);

    // Pagination dots — intentionally class-only so product code can completely
    // restyle them without fighting inline declarations.
    const showDots = opts.dots === true;
    const dotButtons = [];
    let dotsWrap = null;
    if (showDots) {
      dotsWrap = document.createElement('div');
      dotsWrap.className = 'kt-slider-dots';
      slides.forEach((_slide, dotIndex) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'kt-slider-dot';
        dot.setAttribute('aria-label', `Go to slide ${dotIndex + 1}`);
        dot.addEventListener('pointerdown', (event) => event.stopPropagation());
        dot.addEventListener('click', (event) => {
          event.stopPropagation();
          goTo(dotIndex);
          start(true);
        });
        dotsWrap.appendChild(dot);
        dotButtons.push(dot);
      });
      wrap.appendChild(dotsWrap);
    }
    const updateDots = () => {
      dotButtons.forEach((dot, dotIndex) => {
        const active = dotIndex === index;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-current', String(active));
      });
    };

    // Autoplay progress — bar or ring — fills across each interval, resets on
    // advance, and freezes while paused/dragging. No-op when autoplay is off.
    const showProgress = opts.progress === true && autoplayDelay > 0;
    const progressType = opts.progressType === 'ring' ? 'ring' : 'bar';
    let progressFill = null;
    let progressWrap = null;
    let progressRaf = null;
    if (showProgress) {
      progressWrap = document.createElement('div');
      progressWrap.className = `kt-slider-progress kt-slider-progress--${progressType}`;
      if (progressType === 'ring') {
        progressWrap.innerHTML = '<svg class="kt-slider-progress__svg" viewBox="0 0 36 36" aria-hidden="true"><circle class="kt-slider-progress__track" cx="18" cy="18" r="15"/><circle class="kt-slider-progress__fill" cx="18" cy="18" r="15" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>';
        progressFill = progressWrap.querySelector('.kt-slider-progress__fill');
      } else {
        progressWrap.setAttribute('aria-hidden', 'true');
        progressFill = document.createElement('div');
        progressFill.className = 'kt-slider-progress__fill';
        progressWrap.appendChild(progressFill);
      }
      wrap.appendChild(progressWrap);
    }

    // When a ring is shown, the play/pause control lives inside it. This matches
    // familiar carousel controls and makes the elapsed-time indicator actionable.
    const playIcon = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5.2v9.6L14.5 10 7 5.2Z" fill="currentColor"/></svg>';
    const pauseIcon = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6.4 5.2h2.4v9.6H6.4zm4.8 0h2.4v9.6h-2.4z" fill="currentColor"/></svg>';
    const syncPauseButton = () => {
      if (!pauseButton) return;
      pauseButton.dataset.paused = String(paused);
      pauseButton.setAttribute('aria-label', paused ? 'Resume carousel autoplay' : 'Pause carousel autoplay');
      pauseButton.setAttribute('aria-pressed', String(paused));
      pauseButton.innerHTML = paused ? playIcon : pauseIcon;
    };
    if (opts.pauseButton === true && autoplayDelay > 0) {
      pauseButton = document.createElement('button');
      pauseButton.type = 'button';
      pauseButton.className = 'kt-slider-pause';
      pauseButton.addEventListener('pointerdown', (event) => event.stopPropagation());
      pauseButton.addEventListener('click', (event) => {
        event.stopPropagation();
        paused = !paused;
        if (paused) stop(); else start();
        syncPauseButton();
      });
      syncPauseButton();
      if (progressWrap && progressType === 'ring') {
        progressWrap.classList.add('has-control');
        progressWrap.appendChild(pauseButton);
      } else wrap.appendChild(pauseButton);
    }

    let progressValue = 0;
    const paintProgress = () => {
      if (!progressFill) return;
      if (progressType === 'ring') progressFill.style.strokeDashoffset = String(1 - progressValue);
      else progressFill.style.transform = `scaleX(${progressValue})`;
    };
    const resetProgress = () => { progressValue = 0; paintProgress(); };
    const stopProgressLoop = () => { if (progressRaf != null) { cancelAnimationFrame(progressRaf); progressRaf = null; } };
    const progressLoop = () => {
      if (!progressFill) { progressRaf = null; return; }
      // `remaining` is preserved by stop(), so the ring and the actual timeout
      // freeze and resume from the same point.
      if (timer != null && !dragging && !paused && !hoverPaused) {
        const elapsed = performance.now() - timerStartedAt;
        progressValue = clamp((autoplayDelay - remaining + elapsed) / autoplayDelay, 0, 1);
      }
      paintProgress();
      progressRaf = requestAnimationFrame(progressLoop);
    };
    const startProgressLoop = () => { if (progressFill && progressRaf == null) progressLoop(); };
    resetProgressSafe = resetProgress;

    render();
    syncState();
    start();
    startProgressLoop();

    return {
      el,
      type: 'slider',
      get index() { return index; },
      next,
      prev,
      goTo(value) { goTo(Number(value)); },
      replay() { goTo(0); },
      get paused() { return paused; },
      pause() { paused = true; stop(); syncPauseButton(); },
      resume() { paused = false; start(); syncPauseButton(); },
      destroy() {
        alive = false;
        stop();
        stopProgressLoop();
        dotButtons.forEach((dot) => dot.remove());
        dotsWrap?.remove();
        progressWrap?.remove();
        pauseButton?.remove();
        if (rafId != null) cancelAnimationFrame(rafId);
        resizeObserver?.disconnect();
        wrap.removeEventListener('pointerdown', onDown); wrap.removeEventListener('pointermove', onMove); wrap.removeEventListener('pointerup', onEnd); wrap.removeEventListener('pointercancel', onEnd); wrap.removeEventListener('touchmove', onTouchMove); wrap.removeEventListener('keydown', onKey); wrap.removeEventListener('wheel', onWheel); wrap.removeEventListener('pointerenter', onEnter); wrap.removeEventListener('pointerleave', onLeave);
        nextButtons.forEach((button) => { button.removeEventListener('click', next); delete button.dataset.ktSliderBound; });
        prevButtons.forEach((button) => { button.removeEventListener('click', prev); delete button.dataset.ktSliderBound; });
        const restore = (node, name, value) => value == null ? node.removeAttribute(name) : node.setAttribute(name, value);
        restore(wrap, 'style', original.wrap); restore(track, 'style', original.track); restore(wrap, 'role', original.wrapRole); restore(wrap, 'aria-label', original.wrapLabel); restore(wrap, 'tabindex', original.wrapTab);
        slides.forEach((slide, slideIndex) => { const state = original.slides[slideIndex]; restore(slide, 'style', state.style); restore(slide, 'role', state.role); restore(slide, 'aria-hidden', state.hidden); restore(slide, 'aria-label', state.label); slide.classList.remove('is-active'); });
        delete el.dataset.ktSliderIndex;
      }
    };
  },
  reduced(el) {
    const restore = snapshotInlineStyles(el, ['overflowX', 'scrollSnapType']);
    el.style.overflowX = 'auto'; el.style.scrollSnapType = 'x mandatory';
    return { el, type: 'slider', pause() {}, resume() {}, destroy: restore };
  }
};
