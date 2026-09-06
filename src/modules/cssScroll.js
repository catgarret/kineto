import { ST } from '../utils.js';

function customPropertySnapshot(el, property) {
  const value = el.style.getPropertyValue(property);
  const priority = el.style.getPropertyPriority(property);
  return {
    value,
    priority,
    restore() {
      if (value) el.style.setProperty(property, value, priority);
      else el.style.removeProperty(property);
    }
  };
}

export default {
  create(el, opts) {
    const property = opts.property || '--scroll-progress';
    const rawAxis = String(opts.axis || '').trim();
    const usesScroll = opts.timeline === 'scroll';
    const timeline = usesScroll ? `scroll(nearest${rawAxis ? ` ${rawAxis}` : ''})` : `view(${rawAxis})`;
    const supportsTimeline = typeof CSS !== 'undefined' && CSS.supports?.('animation-timeline', timeline);
    const propertySnapshot = customPropertySnapshot(el, property);
    const previous = {
      animationName: el.style.animationName,
      animationTimeline: el.style.animationTimeline,
      animationRangeStart: el.style.animationRangeStart,
      animationRangeEnd: el.style.animationRangeEnd,
      animationFillMode: el.style.animationFillMode,
      animationPlayState: el.style.animationPlayState
    };

    if (supportsTimeline && opts.cssAnimation) {
      // `timeline:"scroll"` links to the nearest scrollport's progress (great for
      // reading bars / reverse columns); default `view()` links to the element's
      // own passage through the scrollport (fade/reveal on enter). `axis` picks
      // block/inline/x/y for either.
      el.style.animationName = opts.cssAnimation;
      el.style.animationTimeline = timeline;
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
          propertySnapshot.restore();
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
        propertySnapshot.restore();
      }
    };
  },

  reduced(el, opts = {}) {
    const property = opts.property || '--scroll-progress';
    const snapshot = customPropertySnapshot(el, property);
    // Reduced motion skips both continuously sampled implementations while
    // preserving their meaningful completed state.
    el.style.setProperty(property, '1', snapshot.priority);
    return {
      el,
      type: 'cssScroll',
      pause() {},
      resume() {},
      destroy: snapshot.restore
    };
  }
};
