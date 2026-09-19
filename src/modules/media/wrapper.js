// Shared media wrapper for modules that layer canvases or overlays on top of
// an <img> / <video>: Lazy (loading reveals) and Stylize (dither / ASCII /
// halftone looks). One element can carry both — Lazy wraps first, Stylize
// reuses that wrapper — so the helpers accept any wrapper class in WRAP_CLASSES
// and only create a new <span> when none is there yet.

export const WRAP_CLASSES = Object.freeze(['kt-lazy-wrap', 'kt-stylize-wrap']);

function hasWrapClass(element) {
  return Boolean(element && WRAP_CLASSES.some((className) => element.classList?.contains(className)));
}

/**
 * Make sure `el` sits inside a positioned, clipping wrapper that occupies the
 * media's box. Returns the wrapper, whether it was created here (so destroy()
 * knows to unwrap) and the wrapper's original inline style (to restore when
 * an existing wrapper was reused).
 *
 * The box values (`display`, `aspectRatio`, `height`) are passed in by the
 * calling module rather than read from its options here, so each module file
 * still spells out every option it consumes for the feature contract.
 */
export function ensureWrapper(el, { className = 'kt-lazy-wrap', display, aspectRatio, height } = {}) {
  let wrapper = el.parentElement;
  let created = false;
  const elementRadius = getComputedStyle(el).borderRadius;
  const originalWrapperStyle = wrapper?.getAttribute('style') ?? null;
  if (!hasWrapClass(wrapper)) {
    wrapper = document.createElement('span');
    wrapper.className = className;
    el.parentNode?.insertBefore(wrapper, el);
    wrapper.appendChild(el);
    created = true;
  }
  const computed = getComputedStyle(wrapper);
  if (computed.position === 'static') wrapper.style.position = 'relative';
  wrapper.style.overflow = 'hidden';
  wrapper.style.display = display || 'block';
  wrapper.style.lineHeight = '0';
  // Keep rounded media rounded while layers are active. The generated wrapper
  // is the clipping box, so leaving the radius only on the original image
  // briefly exposes square corners.
  if (elementRadius && elementRadius !== '0px') wrapper.style.borderRadius = elementRadius;
  // The wrapper must occupy the same box as the media it replaces: fill the
  // parent when the parent already defines a box (fixes skeleton showing as a
  // thin bar inside aspect-ratio stages), otherwise fall back to aspect-ratio.
  const parentBox = wrapper.parentElement?.getBoundingClientRect();
  const ratio = aspectRatio || el.getAttribute('data-aspect-ratio');
  const attrWidth = Number(el.getAttribute('width'));
  const attrHeight = Number(el.getAttribute('height'));
  wrapper.style.width = '100%';
  if (ratio) wrapper.style.aspectRatio = String(ratio).replace(':', ' / ');
  else if (attrWidth > 0 && attrHeight > 0) wrapper.style.aspectRatio = `${attrWidth} / ${attrHeight}`;
  else if (created && parentBox && parentBox.height > 2) wrapper.style.height = '100%';
  else if (wrapper.getBoundingClientRect().height < 2) wrapper.style.aspectRatio = '16 / 9';
  if (height) wrapper.style.height = typeof height === 'number' ? `${height}px` : String(height);
  return { wrapper, created, originalWrapperStyle };
}

/** Undo ensureWrapper(): unwrap a created wrapper or restore a reused one. */
export function releaseWrapper(el, { wrapper, created, originalWrapperStyle }) {
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
