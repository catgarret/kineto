// Shared media wrapper for modules that layer canvases or overlays on top of
// an <img> / <video>: Lazy (loading reveals) and Stylize (dither / ASCII /
// halftone looks). One element can carry both — Lazy wraps first, Stylize
// reuses that wrapper — so the helpers accept any wrapper class in WRAP_CLASSES
// and only create a new <span> when none is there yet.

import { measureThenApplyThisTask } from '../../utils.js';

export const WRAP_CLASSES = Object.freeze(['kt-lazy-wrap', 'kt-stylize-wrap']);

function hasWrapClass(element) {
  return Boolean(element && WRAP_CLASSES.some((className) => element.classList?.contains(className)));
}

/**
 * Make sure `el` sits inside a positioned, clipping wrapper that occupies the
 * media's box. Returns the wrapper, whether it was created here (so destroy()
 * knows to unwrap), the wrapper's original inline style (to restore when an
 * existing wrapper was reused) and `cancel` for the pending measurement.
 *
 * The box values (`display`, `aspectRatio`, `height`) are passed in by the
 * calling module rather than read from its options here, so each module file
 * still spells out every option it consumes for the feature contract.
 *
 * Writes happen now; everything that needs computed style or layout is read in
 * ONE batch with every other instance created in the same task, right after it
 * (measureThenApplyThisTask — still before the first paint, and no frame is
 * left scheduled). Reading here, between the DOM writes of the previous image
 * and this one, forced a full style + layout pass per image — 24 lazy and
 * stylized images on the demo cost most of a second on a phone.
 */
export function ensureWrapper(el, { className = 'kt-lazy-wrap', display, aspectRatio, height } = {}) {
  let wrapper = el.parentElement;
  let created = false;
  const originalWrapperStyle = wrapper?.getAttribute('style') ?? null;
  if (!hasWrapClass(wrapper)) {
    wrapper = document.createElement('span');
    wrapper.className = className;
    el.parentNode?.insertBefore(wrapper, el);
    wrapper.appendChild(el);
    created = true;
    // A span we just made is static; the layers inside are absolutely placed.
    wrapper.style.position = 'relative';
  }
  wrapper.style.overflow = 'hidden';
  wrapper.style.display = display || 'block';
  wrapper.style.lineHeight = '0';
  wrapper.style.width = '100%';
  // The wrapper must occupy the same box as the media it replaces. A declared
  // ratio or the image's width/height attributes say it without measuring.
  const ratio = aspectRatio || el.getAttribute('data-aspect-ratio');
  const attrWidth = Number(el.getAttribute('width'));
  const attrHeight = Number(el.getAttribute('height'));
  if (ratio) wrapper.style.aspectRatio = String(ratio).replace(':', ' / ');
  else if (attrWidth > 0 && attrHeight > 0) wrapper.style.aspectRatio = `${attrWidth} / ${attrHeight}`;
  if (height) wrapper.style.height = typeof height === 'number' ? `${height}px` : String(height);
  // Otherwise the box comes from measuring: fill the parent when the parent
  // already defines a box (a skeleton otherwise shows as a thin bar inside an
  // aspect-ratio stage), and fall back to 16:9 when the wrapper would collapse.
  const needsBox = !ratio && !(attrWidth > 0 && attrHeight > 0) && !height;
  const cancel = measureThenApplyThisTask(() => ({
    position: created ? 'relative' : getComputedStyle(wrapper).position,
    // Keep rounded media rounded while layers are active: the wrapper is the
    // clipping box, so a radius left on the image alone shows square corners.
    radius: getComputedStyle(el).borderRadius,
    parentHeight: needsBox && created ? wrapper.parentElement?.getBoundingClientRect().height || 0 : 0,
    ownHeight: needsBox ? wrapper.getBoundingClientRect().height : 0
  }), ({ position, radius, parentHeight, ownHeight }) => {
    if (!wrapper.isConnected) return;
    if (position === 'static') wrapper.style.position = 'relative';
    if (radius && radius !== '0px') wrapper.style.borderRadius = radius;
    if (!needsBox) return;
    if (created && parentHeight > 2) wrapper.style.height = '100%';
    else if (ownHeight < 2) wrapper.style.aspectRatio = '16 / 9';
  });
  return { wrapper, created, originalWrapperStyle, cancel };
}

/** Undo ensureWrapper(): unwrap a created wrapper or restore a reused one. */
export function releaseWrapper(el, { wrapper, created, originalWrapperStyle, cancel }) {
  cancel?.();
  if (created && wrapper.parentNode) {
    wrapper.parentNode.insertBefore(el, wrapper);
    wrapper.remove();
  } else if (!created) {
    if (originalWrapperStyle == null) wrapper.removeAttribute('style');
    else wrapper.setAttribute('style', originalWrapperStyle);
  }
}

/** An absolutely positioned, decorative overlay inside the wrapper. */
export function createLayer(wrapper, className, zIndex = 2) {
  const layer = document.createElement('span');
  layer.className = className;
  layer.setAttribute('aria-hidden', 'true');
  layer.style.cssText = `position:absolute;inset:0;z-index:${zIndex};display:block;overflow:hidden;pointer-events:none;border-radius:inherit;`;
  wrapper.appendChild(layer);
  return layer;
}
