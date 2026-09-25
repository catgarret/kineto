import { ST } from '../utils.js';

// Values of `overflow` that make an element a scroll container. `clip` and
// `visible` do not, which is why `overflow: clip` is the fix we point authors to.
const SCROLL_CONTAINER_OVERFLOW = new Set(['hidden', 'auto', 'scroll', 'overlay']);

/**
 * A native `scroll()` / `view()` timeline follows the NEAREST scroll container.
 * An ancestor with `overflow: hidden` is a scroll container too — one nobody can
 * scroll — so a timeline inside it never moves. A card that clips its content
 * with `overflow: hidden` is enough to freeze it (the demo's own stage did).
 *
 * Returns that ancestor when the nearest scroll container on the timeline's
 * axis cannot be scrolled by the reader, or null when the native timeline will
 * follow a real scroll (the page, or an `auto`/`scroll` panel).
 */
function capturingAncestor(el, axis) {
  if (typeof getComputedStyle !== 'function') return null;
  const inline = axis === 'inline' || axis === 'x';
  const root = el.ownerDocument?.documentElement;
  for (let node = el.parentElement; node && node !== root && node !== el.ownerDocument?.body; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (!SCROLL_CONTAINER_OVERFLOW.has(style.overflowX) && !SCROLL_CONTAINER_OVERFLOW.has(style.overflowY)) continue;
    // The first scroll container decides: the timeline binds to it whatever it is.
    return (inline ? style.overflowX : style.overflowY) === 'hidden' ? node : null;
  }
  return null;
}

/** `div#id.first-class` — enough to find the element, and no page content. */
function describe(node) {
  const id = node.id ? `#${node.id}` : '';
  const cls = node.classList?.[0] ? `.${node.classList[0]}` : '';
  return `${String(node.tagName || '').toLowerCase()}${id}${cls}`;
}

function reportCapturedTimeline(kineto, ancestor) {
  const diagnostics = kineto?.diagnostics;
  const code = kineto?.diagnosticCodes?.NATIVE_FALLBACK;
  if (!diagnostics || !code) return;
  try {
    diagnostics.emit(diagnostics.create({
      code,
      module: 'cssScroll',
      phase: 'create',
      recoverable: true,
      detail: { ancestor: describe(ancestor), reason: 'overflow: hidden captures the native timeline', fix: 'overflow: clip' }
    }));
  } catch (_error) { /* diagnostics must never break creation */ }
}

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
  // Kineto.config({ defer: true }) may create this only when the element nears
  // the viewport (src/deferCreate.js): it only matters where it can be seen.
  defer: true,
  create(el, opts, kineto = null) {
    const property = opts.property || '--scroll-progress';
    const rawAxis = String(opts.axis || '').trim();
    const usesScroll = opts.timeline === 'scroll';
    const timeline = usesScroll ? `scroll(nearest${rawAxis ? ` ${rawAxis}` : ''})` : `view(${rawAxis})`;
    const supportsTimeline = typeof CSS !== 'undefined' && CSS.supports?.('animation-timeline', timeline);
    // Only worth checking when the native path would otherwise be taken.
    const captured = supportsTimeline && opts.cssAnimation ? capturingAncestor(el, rawAxis) : null;
    if (captured) reportCapturedTimeline(kineto, captured);
    const propertySnapshot = customPropertySnapshot(el, property);
    const previous = {
      animationName: el.style.animationName,
      animationTimeline: el.style.animationTimeline,
      animationRangeStart: el.style.animationRangeStart,
      animationRangeEnd: el.style.animationRangeEnd,
      animationFillMode: el.style.animationFillMode,
      animationPlayState: el.style.animationPlayState
    };

    if (supportsTimeline && opts.cssAnimation && !captured) {
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
        // Which engine drives the progress: 'native' (CSS scroll-driven
        // animation) or 'fallback' (ScrollTrigger). Read-only, for pages and
        // tests that want to show or check it.
        mode: 'native',
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
      mode: 'fallback',
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
