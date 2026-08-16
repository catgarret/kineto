import { clamp, env, lerp, snapshotInlineStyles } from '../utils.js';

/*
 * Single-engine slider: one continuous position value drives every slide
 * transform through a rAF spring, so drag, buttons, keyboard and autoplay can
 * never fight each other or double-run. Coverflow renders centered 3D slides
 * from the same value.
 */
export default {
  create(el, opts = {}) {
    // `radial` is a genuinely different layout — items orbit a hub instead of
    // travelling along a track — so it gets its own engine rather than being
    // bent onto the linear one. The public `radial` module remains as a
    // compatibility adapter while the slider preset reuses this implementation.
    const radialMode = (opts.effect || opts.preset) === 'radial';
    if (radialMode) {
      const reduce = env().reducedMotion;
      const items = (() => {
        const marked = Array.from(el.querySelectorAll(':scope > .kt-radial-item'));
        if (marked.length) return marked;
        return Array.from(el.children).filter((c) => c.nodeType === 1 && !c.matches('.kt-radial-controls, button'));
      })();
      if (items.length < 2) return null;

      const fullCircle = opts.position === 'center';
      const requestedRadius = Math.max(40, Number(opts.radius ?? 260));
      const itemExtent = Math.max(0, ...items.map((item) => Math.max(item.offsetWidth, item.offsetHeight)));
      const availableDiameter = Math.min(el.clientWidth, el.clientHeight);
      const fittedRadius = availableDiameter > itemExtent
        ? Math.max(40, (availableDiameter - itemExtent - 16) / 2)
        : requestedRadius;
      const radius = fullCircle ? Math.min(requestedRadius, fittedRadius) : requestedRadius;
      const step = fullCircle ? 360 / items.length : Number(opts.step ?? 26);
      const position = ['bottom', 'top', 'left', 'right', 'center'].includes(opts.position) ? opts.position : 'bottom';
      // Focal angle points AWAY from the docked edge, into the visible area:
      // bottom → up, top → down, left → right, right → left.
      const presetAngle = { bottom: -90, top: 90, left: 0, right: 180, center: -90 }[position];
      const activeAngle = opts.activeAngle != null ? Number(opts.activeAngle) : presetAngle;
      const duration = Math.max(0, Number(opts.duration ?? 0.6));
      const loop = opts.loop !== false && opts.loop !== 'off';
      const drag = opts.drag !== false;
      const useControls = opts.controls !== false;
      const originalTouchAction = el.style.touchAction;
      // `activeClass` hooks your OWN class on the focused item (with `.kt-active`).
      const stateClass = (opts.activeClass || '').trim();

      // Radial items are often images. Match the track slider and Brush Reveal
      // by keeping native drag previews out of the interaction surface, while
      // preserving authored draggable values for destroy(). Docked wheels leave
      // the page's perpendicular scroll axis available; a centered wheel keeps
      // horizontal page scrolling available while claiming its vertical drag axis.
      const radialImages = items
        .flatMap((item) => item.matches?.('img') ? [item] : [...item.querySelectorAll('img')])
        .map((node) => {
          const value = node.getAttribute('draggable');
          node.draggable = false;
          return [node, value];
        });

      el.classList.add('kt-radial', `kt-radial--${position}`);
      el.style.setProperty('--kt-radial-radius', `${radius}px`);
      el.style.touchAction = position === 'bottom' || position === 'top' ? 'pan-y' : 'pan-x';
      el.setAttribute('role', 'group');
      el.setAttribute('aria-roledescription', 'carousel');

      // Rotation hub: a zero-size point the preset positions at an edge; items
      // orbit around it so only the focal arc shows.
      const hub = document.createElement('div');
      hub.className = 'kt-radial-hub';
      el.appendChild(hub);
      items.forEach((item) => { item.classList.add('kt-radial-item'); hub.appendChild(item); });

      // `align:"center"` places the hub so the ACTIVE item lands at the container's
      // centre (instead of being clipped at the docked edge), for every dock/angle.
      // `align:"edge"` (default) keeps the hub on the docked edge (CSS class).
      if (fullCircle) {
        hub.style.left = '50%';
        hub.style.top = '50%';
      } else if (opts.align === 'center') {
        const a = activeAngle * Math.PI / 180;
        hub.style.left = `calc(50% - ${(Math.cos(a) * radius).toFixed(1)}px)`;
        hub.style.top = `calc(50% - ${(Math.sin(a) * radius).toFixed(1)}px)`;
      }

      const requestedIndex = Number(opts.initialIndex ?? opts.index);
      let active = Number.isFinite(requestedIndex)
        ? clamp(Math.round(requestedIndex), 0, items.length - 1)
        : Math.floor(items.length / 2);

      const live = document.createElement('div');
      live.className = 'kt-radial-live';
      live.setAttribute('aria-live', 'polite');
      live.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);';
      el.appendChild(live);

      const n = items.length;
      let visualActive = active;
      let targetActive = active;
      let radialFrame = null;
      const renderRadial = (positionValue) => {
        items.forEach((item, i) => {
          let offset = i - positionValue;
          if (loop) { // shortest way around
            offset = ((offset % n) + n) % n;
            if (offset > n / 2) offset -= n;
          }
          const angle = activeAngle + offset * step;
          item.style.transition = 'none';
          // transform-origin is the hub point (0,0); the inner translate(-50%,-50%)
          // (applied FIRST) centers the item there, then rotate·translate·rotate
          // orbits its centre to radius·(cosθ,sinθ), upright.
          item.style.transform = `rotate(${angle}deg) translate(${radius}px) rotate(${-angle}deg) translate(-50%, -50%)`;
          // Fade items out toward the arc edges so a wrapping/leaving item never
          // lingers as a translucent ghost: the active item and its two neighbours
          // are solid, anything further out fades fully to 0 (no edge remnants).
          item.style.opacity = fullCircle ? '1' : String(Math.max(0, 1 - Math.max(0, Math.abs(offset) - 1)));
          const on = i === active;
          item.classList.toggle('kt-active', on);
          item.classList.toggle('active-item', on);
          if (stateClass) item.classList.toggle(stateClass, on);
          if (on) item.setAttribute('aria-current', 'true'); else item.removeAttribute('aria-current');
          item.style.zIndex = String(100 - Math.abs(offset));
        });
        live.textContent = `${active + 1} / ${items.length}`;
      };

      const go = (index) => {
        const previous = active;
        const nextActive = loop
          ? ((index % items.length) + items.length) % items.length
          : clamp(index, 0, items.length - 1);
        let delta = nextActive - previous;
        if (loop) {
          if (delta > n / 2) delta -= n;
          else if (delta < -n / 2) delta += n;
        }
        active = nextActive;
        targetActive += delta;
        if (radialFrame) cancelAnimationFrame(radialFrame);
        if (reduce || duration === 0) {
          visualActive = targetActive;
          renderRadial(visualActive);
          return;
        }
        const from = visualActive;
        const started = performance.now();
        const tick = (time) => {
          const progress = Math.min(1, (time - started) / (duration * 1000));
          const eased = 1 - ((1 - progress) ** 3);
          visualActive = from + (targetActive - from) * eased;
          renderRadial(visualActive);
          if (progress < 1) radialFrame = requestAnimationFrame(tick);
          else radialFrame = null;
        };
        radialFrame = requestAnimationFrame(tick);
      };
      const next = () => go(active + 1);
      const prev = () => go(active - 1);

      items.forEach((item) => {
        item.style.cursor = 'pointer';
        if (!item.hasAttribute('tabindex')) item.tabIndex = -1;
      });
      let suppressItemClick = false;
      let suppressItemClickTimer = null;
      const onItemClick = (event) => {
        if (suppressItemClick) {
          suppressItemClick = false;
          if (suppressItemClickTimer != null) clearTimeout(suppressItemClickTimer);
          suppressItemClickTimer = null;
          event.preventDefault();
          return;
        }
        const item = event.target.closest('.kt-radial-item');
        const index = items.indexOf(item);
        if (index >= 0) go(index);
      };
      hub.addEventListener('click', onItemClick);

      // Controls: reuse an existing .kt-radial-controls block or build one.
      let controls = el.querySelector('.kt-radial-controls');
      let prevBtn = null; let nextBtn = null; let builtControls = false;
      if (useControls) {
        if (!controls) {
          controls = document.createElement('div');
          controls.className = 'kt-radial-controls';
          controls.innerHTML = '<button type="button" class="kt-radial-prev" aria-label="Previous"></button><button type="button" class="kt-radial-next" aria-label="Next"></button>';
          el.appendChild(controls);
          builtControls = true;
        }
        prevBtn = controls.querySelector('.kt-radial-prev, [data-kt-radial-prev]');
        nextBtn = controls.querySelector('.kt-radial-next, [data-kt-radial-next]');
        prevBtn?.addEventListener('click', prev);
        nextBtn?.addEventListener('click', next);
      }

      const onKey = (event) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); next(); }
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); prev(); }
      };
      if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
      el.addEventListener('keydown', onKey);

      // Drag to spin (a full `step` of drag advances one item).
      let dragState = null;
      const dragAxisH = position === 'bottom' || position === 'top';
      // Don't start a drag on the control buttons, and DON'T capture the pointer
      // (capturing stole clicks from the prev/next buttons — hence "had to click
      // repeatedly"). Only spin once the drag actually passes a small threshold.
      const onDown = (e) => {
        if (!drag || e.target.closest('.kt-radial-controls, button')) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        dragState = { x: e.clientX, y: e.clientY, start: active, pointerId: e.pointerId, moved: false, captured: false, lastIndex: active };
      };
      const onMove = (e) => {
        if (!dragState || e.pointerId !== dragState.pointerId) return;
        const delta = dragAxisH ? e.clientX - dragState.x : e.clientY - dragState.y;
        if (Math.abs(delta) <= 6) return; // ignore micro-moves (taps/clicks)
        if (!dragState.captured) {
          el.setPointerCapture?.(e.pointerId);
          dragState.captured = true;
        }
        dragState.moved = true;
        const nextIndex = dragState.start + Math.round(-delta / 60);
        if (nextIndex === dragState.lastIndex) return;
        dragState.lastIndex = nextIndex;
        go(nextIndex);
      };
      const onUp = (e) => {
        if (!dragState || e.pointerId !== dragState.pointerId) return;
        if (dragState.captured) el.releasePointerCapture?.(e.pointerId);
        if (dragState.moved) {
          suppressItemClick = true;
          if (suppressItemClickTimer != null) clearTimeout(suppressItemClickTimer);
          // The browser normally emits the synthetic click immediately after
          // pointerup. Keep a bounded fallback so a cancelled pointer sequence
          // cannot suppress an unrelated future click forever.
          suppressItemClickTimer = setTimeout(() => {
            suppressItemClick = false;
            suppressItemClickTimer = null;
          }, 2000);
        }
        dragState = null;
      };
      const onTouchMove = (e) => { if (dragState?.moved) e.preventDefault(); };
      if (drag) {
        el.addEventListener('pointerdown', onDown);
        el.addEventListener('pointermove', onMove);
        el.addEventListener('pointerup', onUp);
        el.addEventListener('pointercancel', onUp);
        el.addEventListener('touchmove', onTouchMove, { passive: false });
      }

      // Autoplay (pauses on hover / when tab hidden).
      const autoplay = Math.max(0, Number(opts.autoplay ?? 0));
      let timer = null;
      const startAuto = () => { if (autoplay && !reduce) { stopAuto(); timer = setInterval(next, autoplay); } };
      const stopAuto = () => { if (timer) { clearInterval(timer); timer = null; } };
      if (autoplay) {
        el.addEventListener('mouseenter', stopAuto);
        el.addEventListener('mouseleave', startAuto);
        startAuto();
      }

      renderRadial(visualActive);

      return {
        el,
        type: 'slider',
        effect: 'radial',
        get index() { return active; },
        next, prev, go,
        pause: stopAuto,
        resume: startAuto,
        destroy() {
          stopAuto();
          if (radialFrame) cancelAnimationFrame(radialFrame);
          if (suppressItemClickTimer != null) clearTimeout(suppressItemClickTimer);
          hub.removeEventListener('click', onItemClick);
          el.removeEventListener('keydown', onKey);
          el.removeEventListener('pointerdown', onDown);
          el.removeEventListener('pointermove', onMove);
          el.removeEventListener('pointerup', onUp);
          el.removeEventListener('pointercancel', onUp);
          el.removeEventListener('touchmove', onTouchMove);
          el.removeEventListener('mouseenter', stopAuto);
          el.removeEventListener('mouseleave', startAuto);
          prevBtn?.removeEventListener('click', prev);
          nextBtn?.removeEventListener('click', next);
          items.forEach((item) => {
            // Fully restore each item: clear inline transform/opacity/transition,
            // remove the kt-radial-item class (so its `will-change:transform` from
            // the stylesheet doesn't linger) and the active markers, then re-home it.
            item.style.transform = ''; item.style.transition = ''; item.style.opacity = ''; item.style.zIndex = ''; item.style.cursor = '';
            delete item._ktOffset;
            item.classList.remove('kt-radial-item', 'kt-active', 'active-item');
            if (stateClass) item.classList.remove(stateClass);
            item.removeAttribute('aria-current');
            el.appendChild(item);
          });
          radialImages.forEach(([node, value]) => {
            if (value == null) node.removeAttribute('draggable');
            else node.setAttribute('draggable', value);
          });
          hub.remove();
          live.remove();
          if (builtControls) controls.remove();
          el.classList.remove('kt-radial', `kt-radial--${position}`);
          el.style.removeProperty('--kt-radial-radius');
          el.style.touchAction = originalTouchAction;
          el.removeAttribute('role'); el.removeAttribute('aria-roledescription');
        }
      };
    }
    const wrap = el.querySelector('.kt-slider-wrap') || el;
    const track = wrap.querySelector('.kt-slider-track') || el.firstElementChild;
    if (!track) return null;
    const slides = Array.from(track.children);
    if (!slides.length) return null;
    const emit = (name, detail) => {
      const EventCtor = el.ownerDocument?.defaultView?.CustomEvent || globalThis.CustomEvent;
      if (EventCtor) el.dispatchEvent(new EventCtor(name, { detail }));
    };

    const effect = String(opts.effect || opts.preset || 'slide').toLowerCase();
    const coverflow = effect === 'coverflow';
    const fade = effect === 'fade';
    const dissolve = effect === 'dissolve';
    const wipe = effect === 'wipe';
    const flip = effect === 'flip';
    const cube = effect === 'cube';
    const cards = effect === 'cards';
    const creative = effect === 'creative';
    const stacked = fade || dissolve || wipe || flip || cube || cards || creative;
    const activeShadow = coverflow && opts.activeShadow === true;
    const activeShadowOpacity = clamp(Number(opts.activeShadowOpacity ?? 0.28), 0, 1);
    const originalActiveShadowOpacity = el.style.getPropertyValue('--kt-slide-active-shadow-opacity');
    const gap = Math.max(0, Number(opts.gap ?? (coverflow ? 22 : 0)));
    // `breakpoints` mirrors Swiper: {"640":{"perView":2},"1024":{"perView":3}} —
    // the widest entry at or below the viewport wins. Accepts an object or a
    // JSON string so it can be authored as a data attribute.
    const breakpointPerView = (() => {
      let table = opts.breakpoints;
      if (typeof table === 'string') { try { table = JSON.parse(table); } catch (_e) { table = null; } }
      if (!table || typeof table !== 'object') return null;
      const width = typeof window !== 'undefined' ? window.innerWidth : 0;
      let best = null; let bestKey = -1;
      Object.entries(table).forEach(([key, value]) => {
        const min = Number(key);
        if (Number.isFinite(min) && width >= min && min > bestKey) { bestKey = min; best = value; }
      });
      const resolved = Number(best?.perView ?? best?.slidesPerView);
      return Number.isFinite(resolved) ? resolved : null;
    })();
    const perView = stacked ? 1 : clamp(Number(breakpointPerView ?? opts.perView ?? (coverflow ? 1.35 : 1)), 1, slides.length);
    // How many slides one next()/prev() advances (Swiper's slidesPerGroup).
    const perGroup = Math.max(1, Math.round(Number(opts.perGroup ?? 1)));
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
    const effectIntensity = clamp(Number(opts.effectIntensity ?? 1), 0, 3);
    const effectDirection = String(opts.effectDirection || (vertical ? 'up' : 'left')).toLowerCase();
    const allowDrag = opts.drag !== false;
    const allowTouch = opts.touch !== false;
    const allowKeyboard = opts.keyboard !== false;

    const original = {
      wrap: wrap.getAttribute('style'), track: track.getAttribute('style'),
      wrapRole: wrap.getAttribute('role'), wrapLabel: wrap.getAttribute('aria-label'), wrapTab: wrap.getAttribute('tabindex'),
      slides: slides.map((slide) => ({ style: slide.getAttribute('style'), role: slide.getAttribute('role'), hidden: slide.getAttribute('aria-hidden'), label: slide.getAttribute('aria-label') }))
    };

    let index = clamp(Math.round(Number(opts.initial ?? 0)), 0, maxIndex);
    let position = index;      // rendered (smoothed) position
    let target = index;        // where the spring is heading
    let dragging = false;
    let dragMoved = false;
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
    let enabled = opts.enabled !== false;
    // Assigned once the progress bar is set up (below); no-op until then so the
    // autoplay start() can call it without a temporal-dead-zone hazard.
    let resetProgressSafe = () => {};

    wrap.setAttribute('role', 'region');
    wrap.setAttribute('aria-roledescription', 'carousel');
    wrap.setAttribute('aria-label', opts.label || 'Carousel');
    if (!wrap.hasAttribute('tabindex')) wrap.tabIndex = 0;
    // `visible` let the shadow through but also stopped clipping the off-screen
    // slides, which a looped coverflow needs. `clip` with an explicit clip
    // margin does both: the box still clips, just N px further out than its own
    // border box. The margin must cover the drop-shadow's offset plus its blur
    // (0 18px 24px -> ~54px), which is why the default is 56px.
    //
    // `overflow-clip-margin` is honoured ONLY with `clip`, never with `hidden` —
    // that pairing was the original bug, and the later `visible` was a
    // workaround for it.
    if (activeShadow) {
      wrap.style.overflow = 'clip';
      wrap.style.overflowClipMargin = 'var(--kt-slide-active-shadow-room, 56px)';
    } else {
      wrap.style.overflow = 'hidden';
      wrap.style.removeProperty('overflow-clip-margin');
    }
    wrap.style.touchAction = vertical ? 'pan-x' : 'pan-y';
    wrap.style.position = 'relative';
    if (coverflow || flip || cube || cards || creative) wrap.style.perspective = `${Number(opts.perspective ?? 1100)}px`;
    el.dataset.ktSliderEffect = effect;
    el.classList.add(`kt-slider--${effect}`);
    el.classList.toggle('kt-slider--active-shadow', activeShadow);
    if (activeShadow) {
      el.style.setProperty('--kt-slide-active-shadow-opacity', `${Number((activeShadowOpacity * 100).toFixed(2))}%`);
    }
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
        // Every slide but the first is absolutely positioned, so it needs a
        // height to fill the viewport — EXCEPT under autoHeight, where the whole
        // point is that each slide keeps its own height and the viewport follows.
        if (slideIndex !== 0 && opts.autoHeight !== true) slide.style.height = '100%';
      }
      slide.style.transformOrigin = '50% 50%';
      slide.style.willChange = activeShadow ? 'transform,opacity,filter' : 'transform,opacity';
      slide.style.transition = 'none';
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', `${slideIndex + 1} of ${slides.length}`);
      slide.querySelectorAll('img').forEach((image) => { image.draggable = false; });
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
      if (stacked) {
        // Stack scene effects in one plane. Fade remains a clean cross-fade;
        // dissolve adds a noisy blur/scale transition; wipe, flip, cube, cards
        // and creative each get a genuinely distinct transform.
        slides.forEach((slide, slideIndex) => {
          const distance = seamless ? wrapDelta(slideIndex - position) : slideIndex - position;
          const absolute = Math.abs(distance);
          const visible = clamp(1 - absolute, 0, 1);
          const mix = clamp(1 - Math.abs(visible * 2 - 1), 0, 1);
          slide.style.setProperty('--kt-slider-slide-distance', String(distance));
          slide.style.setProperty('--kt-slider-slide-progress', String(visible));
          slide.style.setProperty('--kt-slider-transition-mix', String(mix));
          slide.style.filter = '';
          slide.style.clipPath = '';
          slide.style.backfaceVisibility = '';
          if (fade) {
            slide.style.transform = 'translate3d(0,0,0)';
            slide.style.opacity = String(visible);
          } else if (dissolve) {
            const blur = absolute * 14 * effectIntensity;
            const scale = 1 + absolute * 0.045 * effectIntensity;
            slide.style.transform = `translate3d(0,0,0) scale(${scale})`;
            slide.style.filter = `blur(${blur}px) saturate(${Math.max(0.72, 1 - absolute * 0.18)})`;
            slide.style.opacity = String(Math.pow(visible, 0.78));
          } else if (wipe) {
            const hidden = (1 - visible) * 100;
            const travelDirection = Math.sign(target - position) || 1;
            const incoming = Math.sign(distance) === travelDirection;
            const clips = {
              left: `inset(0 ${hidden}% 0 0)`,
              right: `inset(0 0 0 ${hidden}%)`,
              up: `inset(0 0 ${hidden}% 0)`,
              down: `inset(${hidden}% 0 0 0)`
            };
            slide.style.transform = 'translate3d(0,0,0)';
            slide.style.clipPath = incoming ? (clips[effectDirection] || clips.left) : 'inset(0)';
            slide.style.opacity = absolute < 1 ? '1' : '0';
          } else if (flip) {
            const angle = clamp(distance * -180 * effectIntensity, -180, 180);
            slide.style.transform = `translate3d(0,0,${-absolute * 40}px) rotate${vertical ? 'X' : 'Y'}(${angle}deg)`;
            slide.style.backfaceVisibility = 'hidden';
            slide.style.opacity = String(visible);
          } else if (cube) {
            const angle = clamp(distance * -90 * effectIntensity, -100, 100);
            const shift = distance * 50;
            slide.style.transformOrigin = vertical
              ? (distance > 0 ? '50% 100%' : '50% 0%')
              : (distance > 0 ? '100% 50%' : '0% 50%');
            slide.style.transform = vertical
              ? `translate3d(0,${shift}%,${-absolute * 80}px) rotateX(${angle}deg)`
              : `translate3d(${shift}%,0,${-absolute * 80}px) rotateY(${angle}deg)`;
            slide.style.backfaceVisibility = 'hidden';
            slide.style.opacity = String(visible);
          } else if (cards) {
            const x = distance * 7 * effectIntensity;
            const y = absolute * 8 * effectIntensity;
            const rotateZ = distance * 4 * effectIntensity;
            const scale = Math.max(0.82, 1 - absolute * 0.055 * effectIntensity);
            slide.style.transform = `translate3d(${x}%,${y}px,${-absolute * 70}px) rotateZ(${rotateZ}deg) scale(${scale})`;
            slide.style.opacity = String(Math.max(0, 1 - absolute * 0.45));
          } else {
            const x = distance * 34 * effectIntensity;
            const y = distance * -7 * effectIntensity;
            const rotateZ = distance * -5 * effectIntensity;
            const scale = Math.max(0.78, 1 - absolute * 0.12 * effectIntensity);
            slide.style.transform = `translate3d(${x}%,${y}%,${-absolute * 150}px) rotateZ(${rotateZ}deg) scale(${scale})`;
            slide.style.filter = `blur(${absolute * 4 * effectIntensity}px)`;
            slide.style.opacity = String(visible);
          }
          slide.style.zIndex = String(wipe && Math.sign(distance) === (Math.sign(target - position) || 1) ? 3 : (absolute < 0.5 ? 2 : 1));
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
      applyAutoHeight();
      syncPartners(index);
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
      if (!enabled) return;
      target = seamless ? raw : clamp(raw, 0, maxIndex);
      const nextIndex = seamless ? normalize(target) : clamp(Math.round(target), 0, maxIndex);
      if (nextIndex !== index) {
        const previousIndex = index;
        opts.onBeforeChange?.(nextIndex, previousIndex, el);
        emit('kt-slider-before-change', { index: nextIndex, previousIndex, slide: slides[nextIndex] });
        index = nextIndex;
        syncState();
        emit('kt-slider-change', { index, previousIndex, slide: slides[index] });
      }
      wake();
    };
    const goTo = (value) => {
      if (seamless) { const base = Math.round(target); settle(base + Math.round(wrapDelta(value - base))); }
      else settle(value);
    };
    const next = () => {
      if (seamless) return settle(Math.round(target) + perGroup);
      if (loopMode === 'rewind' && index >= maxIndex) return goTo(0);
      return goTo(Math.min(maxIndex, index + perGroup));
    };
    const prev = () => {
      if (seamless) return settle(Math.round(target) - perGroup);
      if (loopMode === 'rewind' && index <= 0) return goTo(maxIndex);
      return goTo(Math.max(0, index - perGroup));
    };

    // `sync` links two or more sliders — the Swiper "thumbs gallery" / slick
    // "asNavFor" pattern. Point a main slider at its thumbnail strip (or the
    // other way round) and moving either moves the other. Guarded against the
    // obvious infinite ping-pong: a programmatic sync never re-broadcasts.
    const syncTargets = (() => {
      const raw = opts.sync;
      if (!raw) return [];
      const list = Array.isArray(raw) ? raw : [raw];
      return list.map((entry) => (typeof entry === 'string' ? document.querySelector(entry) : entry)).filter(Boolean);
    })();
    let syncing = false;
    const syncPartners = (nextIndex) => {
      if (!syncTargets.length || syncing) return;
      syncTargets.forEach((target) => {
        const partner = target.__ktSlider;
        if (!partner || partner.el === el) return;
        partner.syncTo(nextIndex);
      });
    };
    // Clicking a thumbnail should drive the main slider even when
    // slideToClickedSlide is off — that is the whole point of a thumbs strip.
    const syncOnClick = opts.sync ? true : opts.slideToClickedSlide === true;

    // Swiper parity: show the drag affordance, and let a click on a neighbouring
    // slide bring it to the front instead of only the arrows doing so.
    const clickHandlers = [];
    if (opts.grabCursor === true) {
      el.style.cursor = 'grab';
      el.addEventListener('pointerdown', () => { el.style.cursor = 'grabbing'; });
      el.addEventListener('pointerup', () => { el.style.cursor = 'grab'; });
    }
    if (syncOnClick) {
      slides.forEach((slide, slideIndex) => {
        const onClick = (event) => {
          if (performance.now() < suppressClickUntil) { event.preventDefault(); return; }
          if (event.target.closest?.('a,button,input,select,textarea')) return;
          if (slideIndex === index) return;
          goTo(slideIndex);
        };
        slide.addEventListener('click', onClick);
        clickHandlers.push({ slide, onClick });
      });
    }

    // `autoHeight` lets the viewport follow the ACTIVE slide instead of being as
    // tall as the tallest one. Slides are absolutely-positioned in the stacked
    // effects, so this measures the slide itself and drives the wrap's height.
    const autoHeight = opts.autoHeight === true;
    let autoHeightResize = null;
    const applyAutoHeight = () => {
      if (!autoHeight) return;
      const slide = slides[index];
      if (!slide) return;
      const height = Math.round(slide.scrollHeight || slide.getBoundingClientRect().height);
      if (!height) return;
      wrap.style.transition = `height ${Math.max(0.05, Number(opts.duration ?? 0.6))}s cubic-bezier(.22,.8,.3,1)`;
      wrap.style.height = `${height}px`;
    };
    if (autoHeight) {
      // Deliberately does NOT re-decide the overflow mode: it was already set
      // above, and the old `||` fallback here disagreed with that decision
      // (`clip` with no clip margin), so any path that reached it with an empty
      // inline value silently cut the active shadow off again.
      // The track is a flex row, so its children stretch to the wrap's height.
      // Once the wrap is given a height that feedback loop pins every slide to
      // the FIRST slide's height and the measurement can never change. Letting
      // slides keep their natural height breaks the loop.
      track.style.alignItems = 'flex-start';
      autoHeightResize = () => applyAutoHeight();
      window.addEventListener('resize', autoHeightResize);
      requestAnimationFrame(applyAutoHeight);
    }

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
      if (!enabled) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (event.pointerType === 'mouse' ? !allowDrag : !allowTouch) return;
      dragging = true;
      dragMoved = false;
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
      if (!dragMoved && Math.abs(diff) < 5) return;
      dragMoved = true;
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
      if (dragMoved) suppressClickUntil = performance.now() + 250;
      const { step } = metrics();
      const fling = clamp(velocity * step * 0.35 / Math.max(1, step), -1.2, 1.2);
      goTo(target + fling);
      start();
    };
    const onKey = (event) => {
      if (!enabled || !allowKeyboard) return;
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
    let suppressClickUntil = 0;
    const onTouchMove = (event) => { if (dragging && dragMoved) event.preventDefault(); };
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
      if (!enabled) return;
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
    opts.onInit?.(el);
    emit('kt-slider-init', { index, slide: slides[index] });

    const api = {
      el,
      type: 'slider',
      get index() { return index; },
      get slides() { return slides.slice(); },
      // Move without broadcasting back, so two linked sliders settle instead of
      // bouncing the index between each other forever.
      syncTo(value) {
        syncing = true;
        try { goTo(Number(value)); } finally { syncing = false; }
      },
      next,
      prev,
      slideNext: next,
      slidePrev: prev,
      goTo(value) { goTo(Number(value)); },
      slideTo(value) { goTo(Number(value)); },
      replay() { goTo(0); },
      get paused() { return paused; },
      get enabled() { return enabled; },
      get isBeginning() { return !seamless && index === 0; },
      get isEnd() { return !seamless && index === maxIndex; },
      enable() { enabled = true; wrap.removeAttribute('aria-disabled'); },
      disable() { enabled = false; stop(); wrap.setAttribute('aria-disabled', 'true'); },
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
        clickHandlers.forEach(({ slide, onClick }) => slide.removeEventListener('click', onClick));
        if (autoHeightResize) window.removeEventListener('resize', autoHeightResize);
        wrap.style.removeProperty('height');
        track.style.removeProperty('align-items');
        el.style.removeProperty('cursor');
        el.classList.remove(`kt-slider--${effect}`, 'kt-slider--active-shadow');
        if (originalActiveShadowOpacity) el.style.setProperty('--kt-slide-active-shadow-opacity', originalActiveShadowOpacity);
        else el.style.removeProperty('--kt-slide-active-shadow-opacity');
        delete el.dataset.ktSliderIndex;
        delete el.dataset.ktSliderEffect;
        delete el.__ktSlider;
      }
    };
    // Partners find each other through the element, so `sync` can point at a
    // plain selector without the caller holding instance references.
    el.__ktSlider = api;
    return api;
  },
  reduced(el) {
    const restore = snapshotInlineStyles(el, ['overflowX', 'scrollSnapType']);
    el.style.overflowX = 'auto'; el.style.scrollSnapType = 'x mandatory';
    return { el, type: 'slider', pause() {}, resume() {}, destroy: restore };
  },
  fallback(el, opts) { return this.reduced(el, opts); }
};
