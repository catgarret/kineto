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
      if (!gsap || !scrollTrigger) return null;
      const gap = Math.max(0, Number(opts.gap ?? 24));
      const panelWidth = opts.panelWidth || '100%';
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
      if (!gsap || !scrollTrigger) return null;
      const effect = opts.effect || 'fade-up';
      const overlap = Math.min(0.9, Math.max(0, Number(opts.overlap ?? 0.25)));
      const itemDuration = Math.max(0.1, Number(opts.itemDuration ?? 1));
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
    }

    return {
      el,
      type: 'stickyStack',
      pause() { animations.forEach((animation) => animation.pause?.()); },
      resume() { animations.forEach((animation) => animation.resume?.()); },
      destroy() {
        animations.forEach((animation) => { animation.scrollTrigger?.kill?.(); animation.kill?.(); });
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
