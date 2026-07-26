import { G, ST } from '../utils.js';

function floatingFrom(effect, opts) {
  const distance = Number(opts.distance ?? 80);
  const scaleFrom = Number(opts.scaleFrom ?? 0.82);
  const rotate = Number(opts.rotate ?? 6);
  if (effect === 'fade') return { autoAlpha: 0 };
  if (effect === 'scale') return { autoAlpha: 0, scale: scaleFrom };
  if (effect === 'blur') return { autoAlpha: 0, filter: `blur(${Number(opts.blur ?? 18)}px)`, scale: scaleFrom };
  if (effect === 'slide-left') return { autoAlpha: 0, x: -distance };
  if (effect === 'slide-right') return { autoAlpha: 0, x: distance };
  if (effect === 'rotate') return { autoAlpha: 0, y: distance, rotate, scale: scaleFrom };
  if (effect === 'depth') return { autoAlpha: 0, y: distance, z: -240, rotateX: rotate, scale: scaleFrom };
  return { autoAlpha: 0, y: distance };
}

export default {
  create(el, opts = {}) {
    const gsap = G();
    const scrollTrigger = ST();
    const mode = opts.mode || opts.type || opts.preset || 'vertical';
    const children = Array.from(el.children);
    if (!children.length) return null;

    const originalElStyle = el.getAttribute('style');
    const originalChildStyles = children.map((child) => child.getAttribute('style'));
    const animations = [];
    let fallbackCleanup = null;
    let fallbackPaused = false;

    if (mode === 'vertical') {
      // align:'center' (default) keeps the pinned card vertically centered in
      // the viewport instead of hugging the top edge.
      const align = opts.align || 'center';
      const top = Number(opts.top ?? opts.offsetTop ?? 24);
      const offset = Number(opts.offsetY ?? opts.offset ?? 16);
      const gap = Number(opts.gap ?? 24);
      const zDirection = opts.reverseZ === true ? -1 : 1;
      el.style.position = 'relative';
      el.style.display = 'block';
      el.style.overflow = 'visible';
      el.style.paddingBottom = `${Math.max(0, Number(opts.bottomSpace ?? top + offset * Math.max(0, children.length - 1)))}px`;
      const stickyTop = (child, index) => align === 'center'
        ? `calc(50vh - ${Math.round((child.offsetHeight || 0) / 2)}px + ${index * offset}px)`
        : `${top + index * offset}px`;
      children.forEach((child, index) => {
        child.style.position = 'sticky';
        child.style.top = stickyTop(child, index);
        child.style.marginBottom = index === children.length - 1 ? '0px' : `${gap}px`;
        child.style.zIndex = String(zDirection > 0 ? index + 1 : children.length - index);
        child.style.transformOrigin = opts.transformOrigin || '50% 0%';
      });
      if (gsap && scrollTrigger && (opts.scalePrevious !== false || opts.fadePrevious === true)) {
        children.slice(0, -1).forEach((child, index) => {
          const next = children[index + 1];
          const tween = gsap.to(child, {
            scale: Number(opts.previousScale ?? 0.96),
            opacity: opts.fadePrevious === true ? Number(opts.previousOpacity ?? 0.55) : 1,
            filter: opts.previousBlur ? `blur(${Number(opts.previousBlur)}px)` : 'none',
            ease: 'none',
            scrollTrigger: {
              trigger: next,
              start: () => {
                const base = align === 'center' ? Math.round((window.innerHeight - next.offsetHeight) / 2) : top;
                return `top ${base + (index + 1) * offset + Number(opts.transitionStartOffset ?? 160)}`;
              },
              end: () => {
                const base = align === 'center' ? Math.round((window.innerHeight - next.offsetHeight) / 2) : top;
                return `top ${base + (index + 1) * offset}`;
              },
              scrub: Number(opts.scrub ?? 0.5),
              invalidateOnRefresh: true
            }
          });
          animations.push(tween);
        });
      }
    } else if (mode === 'horizontal') {
      const gap = Math.max(0, Number(opts.gap ?? 24));
      const panelWidth = opts.panelWidth || '100%';
      if (gsap && scrollTrigger) {
        el.style.display = 'flex';
        el.style.flexWrap = 'nowrap';
        el.style.gap = `${gap}px`;
        el.style.overflow = 'hidden';
        el.style.width = '100%';
        children.forEach((child) => { child.style.flex = `0 0 ${panelWidth}`; });
        const distance = () => Math.max(0, el.scrollWidth - el.clientWidth);
        const tween = gsap.to(el, {
          '--kt-horizontal-progress': 1,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            pin: opts.pin !== false,
            pinSpacing: opts.pinSpacing !== false,
            scrub: Number(opts.scrub ?? 1),
            start: opts.start || ((opts.align || 'center') === 'center' ? 'center center' : 'top top'),
            end: () => opts.end || `+=${Math.max(window.innerWidth, distance())}`,
            invalidateOnRefresh: true,
            snap: opts.snap === true ? 1 / Math.max(1, children.length - 1) : false,
            onUpdate: (self) => {
              const x = -distance() * self.progress;
              children.forEach((child) => { child.style.transform = `translate3d(${x}px,0,0)`; });
              opts.onProgress?.(self.progress, el);
            }
          }
        });
        animations.push(tween);
      } else {
        const viewport = document.createElement('div');
        const track = document.createElement('div');
        viewport.className = 'kt-sticky-horizontal-viewport';
        track.className = 'kt-sticky-horizontal-track';
        viewport.style.cssText = 'position:sticky;top:15svh;width:100%;max-width:100%;min-width:0;height:70svh;overflow:hidden;box-sizing:border-box;';
        track.style.cssText = `display:flex;align-items:stretch;gap:${gap}px;width:max-content;min-width:max-content;height:100%;will-change:transform;`;
        children.forEach((child) => {
          child.style.flex = `0 0 ${panelWidth}`;
          track.appendChild(child);
        });
        viewport.appendChild(track);
        el.appendChild(viewport);
        el.style.position = 'relative';
        el.style.width = '100%';
        el.style.maxWidth = '100%';
        el.style.minWidth = '0';
        el.style.height = 'auto';
        el.style.overflow = 'visible';
        let distance = 0;
        let raf = 0;
        const update = () => {
          raf = 0;
          if (fallbackPaused) return;
          const rect = el.getBoundingClientRect();
          const top = Number.parseFloat(getComputedStyle(viewport).top) || 0;
          const travel = Math.max(1, el.offsetHeight - viewport.offsetHeight);
          const progress = Math.min(1, Math.max(0, (top - rect.top) / travel));
          track.style.transform = `translate3d(${-distance * progress}px,0,0)`;
          el.style.setProperty('--kt-horizontal-progress', String(progress));
          opts.onProgress?.(progress, el);
        };
        const requestUpdate = () => { if (!raf) raf = requestAnimationFrame(update); };
        const measure = () => {
          if (panelWidth === '100%') {
            children.forEach((child) => { child.style.flexBasis = `${viewport.clientWidth}px`; });
          }
          distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
          el.style.minHeight = `calc(70svh + ${distance}px)`;
          requestUpdate();
        };
        window.addEventListener('scroll', requestUpdate, { passive: true });
        window.addEventListener('resize', measure, { passive: true });
        const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
        observer?.observe(track);
        measure();
        fallbackCleanup = () => {
          if (raf) cancelAnimationFrame(raf);
          window.removeEventListener('scroll', requestUpdate);
          window.removeEventListener('resize', measure);
          observer?.disconnect();
          children.forEach((child) => el.insertBefore(child, viewport));
          viewport.remove();
        };
      }
    } else if (mode === 'zindex') {
      if (!gsap || !scrollTrigger) return null;
      el.style.position = 'relative';
      children.forEach((child, index) => {
        child.style.position = 'sticky';
        child.style.top = opts.top || '0px';
        child.style.minHeight = opts.itemHeight || '100vh';
        child.style.zIndex = String(index + 1);
        if (index > 0) animations.push(gsap.fromTo(child,
          { yPercent: 18, opacity: 0.55, scale: 0.9 },
          {
            yPercent: 0,
            opacity: 1,
            scale: 1,
            ease: opts.ease || 'power2.inOut',
            scrollTrigger: { trigger: child, start: opts.start || 'top bottom', end: opts.end || 'top top', scrub: Number(opts.scrub ?? 1) }
          }
        ));
      });
    } else if (mode === 'floating') {
      const effect = opts.effect || 'fade-up';
      const overlap = Math.min(0.9, Math.max(0, Number(opts.overlap ?? 0.25)));
      const itemDuration = Math.max(0.1, Number(opts.itemDuration ?? 1));
      // An auto-width element can be measured as 0 while ScrollTrigger creates
      // its pin spacer during a large demo-page layout pass. Pin an explicit
      // container width so the sequence never collapses to a zero-width line.
      el.style.width = '100%';
      el.style.maxWidth = '100%';
      el.style.minWidth = '0';
      el.style.boxSizing = 'border-box';
      if (gsap && scrollTrigger) {
        el.style.position = 'relative';
        el.style.minHeight = opts.minHeight || '70vh';
        el.style.perspective = `${Number(opts.perspective ?? 1200)}px`;
        children.forEach((child, index) => {
          child.style.position = 'absolute';
          child.style.inset = '0';
          child.style.display = 'flex';
          child.style.alignItems = 'center';
          child.style.justifyContent = 'center';
          child.style.zIndex = String(index + 1);
          child.style.transformStyle = 'preserve-3d';
        });
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            pin: opts.pin !== false,
            pinSpacing: opts.pinSpacing !== false,
            scrub: Number(opts.scrub ?? 1),
            start: opts.start || ((opts.align || 'center') === 'center' ? 'center center' : 'top top'),
            end: opts.end || `+=${Math.max(1, children.length) * Number(opts.scrollLength ?? 80)}%`,
            anticipatePin: 1
          }
        });
        children.forEach((child, index) => {
          const at = index * itemDuration * (1 - overlap);
          timeline.fromTo(child, floatingFrom(effect, opts), {
            autoAlpha: 1, x: 0, y: 0, z: 0, rotate: 0, rotateX: 0, scale: 1, filter: 'blur(0px)',
            duration: itemDuration, ease: opts.ease || 'power2.out'
          }, at);
          if (index < children.length - 1) timeline.to(child, {
            autoAlpha: Number(opts.previousOpacity ?? 0.18),
            scale: Number(opts.previousScale ?? 0.88),
            y: Number(opts.previousY ?? -40),
            filter: opts.fadePrevious === false ? 'blur(0px)' : `blur(${Number(opts.previousBlur ?? 8)}px)`,
            duration: itemDuration, ease: opts.ease || 'power2.inOut'
          }, at + itemDuration * (1 - overlap));
        });
        animations.push(timeline);
      } else {
        const stageHeight = opts.minHeight || '70svh';
        const scrollLength = Math.max(20, Number(opts.scrollLength ?? 80));
        const distance = Number(opts.distance ?? 80);
        const previousOpacity = Number(opts.previousOpacity ?? 0.18);
        const previousScale = Number(opts.previousScale ?? 0.88);
        const previousY = Number(opts.previousY ?? -40);
        const previousBlur = opts.fadePrevious === false ? 0 : Number(opts.previousBlur ?? 8);
        const viewport = document.createElement('div');
        viewport.className = 'kt-floating-viewport';
        const computed = getComputedStyle(el);
        viewport.style.cssText = `position:sticky;top:calc((100svh - ${stageHeight}) / 2);width:100%;height:${stageHeight};overflow:hidden;border-radius:inherit;background:${computed.background};color:${computed.color};perspective:${Number(opts.perspective ?? 1200)}px;`;
        children.forEach((child, index) => {
          child.style.position = 'absolute';
          child.style.inset = '0';
          child.style.display = 'flex';
          child.style.alignItems = 'center';
          child.style.justifyContent = 'center';
          child.style.zIndex = String(index + 1);
          child.style.transformStyle = 'preserve-3d';
          viewport.appendChild(child);
        });
        el.appendChild(viewport);
        el.style.position = 'relative';
        el.style.height = 'auto';
        el.style.minHeight = `calc(${stageHeight} + ${Math.max(1, children.length - 1) * scrollLength}vh)`;
        el.style.overflow = 'visible';
        el.style.background = 'transparent';
        let raf = 0;
        const update = () => {
          raf = 0;
          if (fallbackPaused) return;
          const rect = el.getBoundingClientRect();
          const top = Number.parseFloat(getComputedStyle(viewport).top) || 0;
          const travel = Math.max(1, el.offsetHeight - viewport.offsetHeight);
          const progress = Math.min(1, Math.max(0, (top - rect.top) / travel));
          const phase = progress * Math.max(1, children.length - 1);
          children.forEach((child, index) => {
            const delta = index - phase;
            const incoming = Math.min(1, Math.max(0, delta));
            const outgoing = Math.min(1, Math.max(0, -delta));
            let x = 0;
            let y = incoming * distance + outgoing * previousY;
            let rotate = 0;
            let rotateX = 0;
            let z = 0;
            if (effect === 'slide-left') { x = -incoming * distance; y = outgoing * previousY; }
            if (effect === 'slide-right') { x = incoming * distance; y = outgoing * previousY; }
            if (effect === 'rotate') rotate = incoming * Number(opts.rotate ?? 6);
            if (effect === 'depth') { z = -incoming * 240; rotateX = incoming * Number(opts.rotate ?? 6); }
            const scale = 1 - incoming * (1 - Number(opts.scaleFrom ?? 0.82)) - outgoing * (1 - previousScale);
            child.style.opacity = String((1 - incoming) * (1 - outgoing * (1 - previousOpacity)));
            child.style.filter = `blur(${outgoing * previousBlur + (effect === 'blur' ? incoming * Number(opts.blur ?? 18) : 0)}px)`;
            child.style.transform = `translate3d(${x}px,${y}px,${z}px) rotate(${rotate}deg) rotateX(${rotateX}deg) scale(${scale})`;
          });
          opts.onProgress?.(progress, el);
        };
        const requestUpdate = () => { if (!raf) raf = requestAnimationFrame(update); };
        window.addEventListener('scroll', requestUpdate, { passive: true });
        window.addEventListener('resize', requestUpdate, { passive: true });
        requestUpdate();
        fallbackCleanup = () => {
          if (raf) cancelAnimationFrame(raf);
          window.removeEventListener('scroll', requestUpdate);
          window.removeEventListener('resize', requestUpdate);
          children.forEach((child) => el.insertBefore(child, viewport));
          viewport.remove();
        };
      }
    }

    return {
      el,
      type: 'stickyStack',
      pause() { fallbackPaused = true; animations.forEach((animation) => animation.pause?.()); },
      resume() {
        fallbackPaused = false;
        animations.forEach((animation) => animation.resume?.());
        window.dispatchEvent(new Event('scroll'));
      },
      destroy() {
        animations.forEach((animation) => { animation.scrollTrigger?.kill?.(); animation.kill?.(); });
        fallbackCleanup?.();
        if (originalElStyle == null) el.removeAttribute('style'); else el.setAttribute('style', originalElStyle);
        children.forEach((child, index) => {
          const style = originalChildStyles[index];
          if (style == null) child.removeAttribute('style'); else child.setAttribute('style', style);
        });
      }
    };
  },
  reduced(el) {
    const children = Array.from(el.children);
    const styles = children.map((child) => child.getAttribute('style'));
    children.forEach((child) => {
      child.style.position = 'relative';
      child.style.inset = 'auto';
      child.style.transform = 'none';
      child.style.opacity = '1';
      child.style.filter = 'none';
    });
    return {
      el, type: 'stickyStack', pause() {}, resume() {},
      destroy() { children.forEach((child, index) => styles[index] == null ? child.removeAttribute('style') : child.setAttribute('style', styles[index])); }
    };
  }
};
