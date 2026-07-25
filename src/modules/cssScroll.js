import { ST } from '../utils.js';

export default {
  create(el, opts) {
    const property = opts.property || '--scroll-progress';
    const supportsTimeline = typeof CSS !== 'undefined' && CSS.supports?.('animation-timeline', 'scroll()');
    const previous = {
      animationName: el.style.animationName,
      animationTimeline: el.style.animationTimeline,
      animationRangeStart: el.style.animationRangeStart,
      animationRangeEnd: el.style.animationRangeEnd,
      animationFillMode: el.style.animationFillMode,
      animationPlayState: el.style.animationPlayState,
      property: el.style.getPropertyValue(property)
    };

    if (supportsTimeline && opts.cssAnimation) {
      // `timeline:"scroll"` links to the nearest scrollport's progress (great for
      // reading bars / reverse columns); default `view()` links to the element's
      // own passage through the scrollport (fade/reveal on enter). `axis` picks
      // block/inline/x/y for either.
      const rawAxis = (opts.axis || '').trim();
      const usesScroll = opts.timeline === 'scroll';
      el.style.animationName = opts.cssAnimation;
      el.style.animationTimeline = usesScroll ? `scroll(nearest${rawAxis ? ` ${rawAxis}` : ''})` : `view(${rawAxis})`;
      el.style.animationRangeStart = opts.rangeStart || (usesScroll ? '0%' : 'entry 0%');
      el.style.animationRangeEnd = opts.rangeEnd || (usesScroll ? '100%' : 'exit 100%');
      el.style.animationFillMode = 'both';
      el.style.animationPlayState = 'running';
      return {
        el,
        type: 'cssScroll',
        pause: () => { el.style.animationPlayState = 'paused'; },
        resume: () => { el.style.animationPlayState = 'running'; },
        destroy: () => {
          el.style.animationName = previous.animationName;
          el.style.animationTimeline = previous.animationTimeline;
          el.style.animationRangeStart = previous.animationRangeStart;
          el.style.animationRangeEnd = previous.animationRangeEnd;
          el.style.animationFillMode = previous.animationFillMode;
          el.style.animationPlayState = previous.animationPlayState;
          if (previous.property) el.style.setProperty(property, previous.property);
          else el.style.removeProperty(property);
        }
      };
    }

    const scrollTrigger = ST();
    if (!scrollTrigger) return null;
    const trigger = scrollTrigger.create({
      trigger: el,
      start: opts.start || 'top bottom',
      end: opts.end || 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        el.style.setProperty(property, self.progress);
        opts.onUpdate?.(self.progress, el, self);
      }
    });
    return {
      el,
      type: 'cssScroll',
      pause: () => trigger.disable(),
      resume: () => trigger.enable(),
      destroy: () => {
        trigger.kill();
        if (previous.property) el.style.setProperty(property, previous.property);
        else el.style.removeProperty(property);
      }
    };
  }
};
