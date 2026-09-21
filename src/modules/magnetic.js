import { clamp, dropEmptyAttributes, lerp, snapshotInlineStyles } from '../utils.js';

/*
 * Magnetic — an element that answers the pointer coming near it. Two ways:
 *
 *   pointer (default)  one element is pulled towards the cursor
 *   dock               a ROW of items magnifies around the cursor and the rest
 *                      slide aside, the way a macOS dock does
 *
 * They share a family and nothing else: `pointer` moves one thing toward you,
 * `dock` resizes a set and re-packs the row around whichever item you are
 * nearest. That second part is what people actually recognise — a dock where
 * icons only grow, without the neighbours making room, reads as items
 * overlapping rather than as a row opening up.
 */

/**
 * How much an item grows at a given distance from the pointer, 1 at the far
 * edge of `range` and `maxScale` right under it. A raised cosine rather than a
 * straight line: a linear falloff has a corner at the edge of its range, and the
 * eye catches the moment an icon starts growing.
 */
function dockScale(distance, range, maxScale) {
  if (!(range > 0) || distance >= range) return 1;
  const bump = (Math.cos((distance / range) * Math.PI) + 1) / 2;
  return 1 + (maxScale - 1) * bump;
}

/**
 * A dock: the row's own children are the items.
 *
 * Each frame the items are scaled by their distance from the pointer and then
 * RE-PACKED outward from the one nearest it, so the row grows sideways instead
 * of the icons growing into each other. Everything is a transform, so the
 * page's layout never changes and nothing around the dock reflows.
 */
function createDock(el, { axis, maxScale, lift, range, ease, item }) {
  const vertical = axis === 'vertical' || axis === 'y';
  const peak = Math.max(1, Number(maxScale ?? 1.8));
  const raise = Number(lift ?? 10);
  const reach = Math.max(1, Number(range ?? 120));
  const smoothing = clamp(Number(ease ?? 0.22), 0.02, 1);
  const selector = item || null;

  const items = () => (selector ? Array.from(el.querySelectorAll(selector)) : Array.from(el.children));
  const restore = new Map();
  let rest = [];
  let alive = true;
  let rafId = null;
  let pointer = null;
  let scales = [];

  // Rest geometry is measured with every transform cleared, so a resize during
  // a hover cannot bake the current magnification into the new baseline.
  const measure = () => {
    const nodes = items();
    nodes.forEach((node) => {
      if (!restore.has(node)) restore.set(node, snapshotInlineStyles(node, ['transform', 'transform-origin', 'will-change']));
      node.style.transform = '';
    });
    rest = nodes.map((node) => {
      const box = node.getBoundingClientRect();
      return {
        node,
        centre: vertical ? box.top + box.height / 2 : box.left + box.width / 2,
        size: vertical ? box.height : box.width
      };
    });
    nodes.forEach((node) => {
      node.style.transformOrigin = vertical ? 'left center' : 'center bottom';
      node.style.willChange = 'transform';
    });
    scales = rest.map(() => 1);
  };

  const paint = () => {
    if (!rest.length) return;
    // 1. how big each item wants to be, eased towards from where it is now.
    const wanted = rest.map(({ centre }) => (
      pointer == null ? 1 : dockScale(Math.abs(pointer - centre), reach, peak)
    ));
    let settled = true;
    scales = scales.map((current, index) => {
      const next = lerp(current, wanted[index], smoothing);
      if (Math.abs(next - wanted[index]) > 0.002) settled = false;
      return next;
    });

    // 2. re-pack the row around the item the pointer is nearest, so the extra
    //    width goes into the row rather than on top of the neighbours.
    let focus = 0;
    for (let index = 1; index < rest.length; index += 1) {
      if (pointer != null && Math.abs(rest[index].centre - pointer) < Math.abs(rest[focus].centre - pointer)) focus = index;
    }
    // The authored gap between two items is edge to edge, so that is what has to
    // be preserved — measuring it from the centres instead makes every step
    // slightly short, and the row never quite comes back to where it started.
    const gapBefore = (index) => (rest[index].centre - rest[index].size / 2)
      - (rest[index - 1].centre + rest[index - 1].size / 2);
    const placed = new Array(rest.length);
    placed[focus] = rest[focus].centre;
    for (let index = focus + 1; index < rest.length; index += 1) {
      placed[index] = placed[index - 1]
        + (rest[index - 1].size * scales[index - 1]) / 2 + gapBefore(index) + (rest[index].size * scales[index]) / 2;
    }
    for (let index = focus - 1; index >= 0; index -= 1) {
      placed[index] = placed[index + 1]
        - (rest[index + 1].size * scales[index + 1]) / 2 - gapBefore(index + 1) - (rest[index].size * scales[index]) / 2;
    }

    rest.forEach(({ node, centre, size }, index) => {
      const shift = placed[index] - centre;
      const grown = (scales[index] - 1) / Math.max(0.0001, peak - 1);
      const along = vertical ? `translate3d(${(raise * grown).toFixed(2)}px, ${shift.toFixed(2)}px, 0)`
        : `translate3d(${shift.toFixed(2)}px, ${(-raise * grown).toFixed(2)}px, 0)`;
      node.style.transform = `${along} scale(${scales[index].toFixed(3)})`;
      void size;
    });
    return settled;
  };

  const loop = () => {
    if (!alive) { rafId = null; return; }
    const settled = paint();
    rafId = settled && pointer == null ? null : requestAnimationFrame(loop);
  };
  const wake = () => { if (alive && rafId == null) rafId = requestAnimationFrame(loop); };

  const onMove = (event) => {
    pointer = vertical ? event.clientY : event.clientX;
    wake();
  };
  const onLeave = () => { pointer = null; wake(); };

  measure();
  paint();
  el.addEventListener('pointermove', onMove, { passive: true });
  el.addEventListener('pointerleave', onLeave);
  let observer = null;
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(() => { if (pointer == null) measure(); });
    observer.observe(el);
  }

  return {
    el,
    type: 'magnetic',
    pause() { alive = false; if (rafId != null) cancelAnimationFrame(rafId); rafId = null; },
    resume() { if (!alive) { alive = true; wake(); } },
    destroy() {
      alive = false;
      if (rafId != null) cancelAnimationFrame(rafId);
      observer?.disconnect();
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      restore.forEach((undo, node) => {
        undo();
        // The snapshot puts every property back, but an element that had no
        // style attribute at all is left holding an empty one — the husk a
        // `style.x = ''` leaves behind. This is the shared helper for it.
        dropEmptyAttributes(node);
      });
      restore.clear();
    }
  };
}

/**
 * The original magnet: one element pulled towards the cursor while it is
 * within reach, easing back to its own place when the pointer leaves.
 */
function createPointerMagnet(el, { strength, radius, ease }) {
  // The pointer is tracked on the PARENT, so the pull starts before the cursor
  // is over the element itself — a button that only reacts once you are already
  // on it has nothing magnetic about it.
  const parent = el.parentElement || el;
  const pull = strength ?? 0.4;
  const reach = radius ?? 100;
  const smoothing = ease ?? 0.15;
  const restore = snapshotInlineStyles(el, ['transform', 'willChange']);

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let active = false;
  let alive = true;
  let rafId = null;

  el.style.willChange = 'transform';

  const loop = () => {
    if (!alive) return;
    currentX = lerp(currentX, targetX, smoothing);
    currentY = lerp(currentY, targetY, smoothing);
    el.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    const moving = Math.abs(currentX - targetX) > 0.1 || Math.abs(currentY - targetY) > 0.1;
    if (active || moving) rafId = requestAnimationFrame(loop);
    else rafId = null;
  };

  const ensureLoop = () => {
    if (rafId == null && alive) rafId = requestAnimationFrame(loop);
  };

  const onMove = (event) => {
    const rect = el.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    const distance = Math.hypot(x, y);
    if (distance <= reach * 1.5) {
      active = true;
      targetX = x * pull;
      targetY = y * pull;
      ensureLoop();
    } else {
      active = false;
      targetX = 0;
      targetY = 0;
      ensureLoop();
    }
  };

  const onLeave = () => {
    active = false;
    targetX = 0;
    targetY = 0;
    ensureLoop();
  };

  parent.addEventListener('pointermove', onMove, { passive: true });
  parent.addEventListener('pointerleave', onLeave);

  return {
    el,
    type: 'magnetic',
    pause: () => {
      alive = false;
      if (rafId != null) cancelAnimationFrame(rafId);
      rafId = null;
    },
    resume: () => {
      if (!alive) {
        alive = true;
        ensureLoop();
      }
    },
    destroy: () => {
      alive = false;
      if (rafId != null) cancelAnimationFrame(rafId);
      parent.removeEventListener('pointermove', onMove);
      parent.removeEventListener('pointerleave', onLeave);
      restore();
    }
  };
}

export default {
  create(el, opts) {
    const preset = opts.preset === 'dock' || opts.effect === 'dock' ? 'dock' : 'pointer';
    if (preset === 'dock') {
      return createDock(el, {
        axis: opts.axis,
        maxScale: opts.maxScale,
        lift: opts.lift,
        range: opts.range,
        ease: opts.ease,
        item: opts.item
      });
    }
    return createPointerMagnet(el, {
      strength: opts.strength,
      radius: opts.radius,
      ease: opts.ease
    });
  },
  reduced() {},
  fallback(el, opts) {
    return this.create(el, opts);
  }
};
