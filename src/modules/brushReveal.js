import { clamp } from '../utils.js';

function coverMap(sourceWidth, sourceHeight, boxWidth, boxHeight) {
  const scale = Math.max(boxWidth / sourceWidth, boxHeight / sourceHeight);
  const sw = Math.min(sourceWidth, boxWidth / scale);
  const sh = Math.min(sourceHeight, boxHeight / scale);
  return { sx: (sourceWidth - sw) / 2, sy: (sourceHeight - sh) / 2, sw, sh };
}

/*
 * Brush reveal: hovering the element paints a second image (e.g. the night
 * version of a day scene) through a soft round Photoshop-style brush.
 * Strokes can persist like real paint or gently fade back to the base image.
 */
export default {
  create(el, opts = {}) {
    const src = opts.src || opts.revealSrc || el.getAttribute('data-reveal-src') || '';
    if (!src) return null;

    const radius = Math.max(8, Number(opts.radius ?? 80));
    // softness 0 = hard stamp, 1 = fully feathered airbrush.
    const softness = clamp(Number(opts.softness ?? 0.55), 0, 1);
    // Extra gaussian spread on top of the gradient falloff (px).
    const edgeBlur = Math.max(0, Number(opts.blur ?? 0));
    const persist = opts.persist === true;
    const fade = clamp(Number(opts.fade ?? 0.045), 0.002, 0.5);
    const maxDpr = clamp(Number(opts.maxDpr ?? 2), 1, 3);
    const originalStyle = el.getAttribute('style');
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    // Scratch-card behavior on touch: the finger paints instead of scrolling.
    el.style.touchAction = 'none';

    const canvas = document.createElement('canvas');
    canvas.className = 'kt-brush-reveal-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;border-radius:inherit;z-index:2;';
    el.appendChild(canvas);
    const context = canvas.getContext('2d', { alpha: true });
    const mask = document.createElement('canvas');
    const maskContext = mask.getContext('2d', { alpha: true });

    const image = new Image();
    image.decoding = 'async';
    if (opts.crossOrigin) image.crossOrigin = opts.crossOrigin;
    let ready = false;
    image.onload = () => { ready = true; };
    image.onerror = () => opts.onError?.(new Error(`Kineto brushReveal image failed to load: ${src}`), el);
    image.src = src;

    let cssWidth = 0;
    let cssHeight = 0;
    let dpr = 1;
    let rafId = null;
    let alive = true;
    let active = false;
    let hasInk = false;
    // Ink is tracked analytically (no getImageData): reading pixels throws on
    // canvases tainted by file:// or cross-origin images, which froze healing
    // and made strokes persist forever even with persist off.
    let inkLevel = 0;
    let lastX = null;
    let lastY = null;

    const sync = () => {
      const box = el.getBoundingClientRect();
      cssWidth = Math.max(1, box.width);
      cssHeight = Math.max(1, box.height);
      dpr = clamp(window.devicePixelRatio || 1, 1, maxDpr);
      const pw = Math.max(1, Math.round(cssWidth * dpr));
      const ph = Math.max(1, Math.round(cssHeight * dpr));
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
        mask.width = pw;
        mask.height = ph;
      }
    };
    sync();

    const stamp = (x, y) => {
      const px = x * dpr;
      const py = y * dpr;
      const r = radius * dpr;
      // The solid core shrinks as softness rises, so the falloff band really
      // spans `softness * radius` — a proper airbrush spread control.
      const core = r * (1 - softness);
      // Solid opaque core, soft falloff only at the rim (opacity is optional).
      const paintAlpha = clamp(Number(opts.opacity ?? 1), 0.05, 1);
      const gradient = maskContext.createRadialGradient(px, py, Math.max(0.5, core), px, py, r);
      gradient.addColorStop(0, `rgba(255,255,255,${paintAlpha})`);
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      maskContext.save();
      maskContext.globalCompositeOperation = 'source-over';
      if (edgeBlur > 0 && 'filter' in maskContext) maskContext.filter = `blur(${edgeBlur * dpr}px)`;
      maskContext.fillStyle = gradient;
      maskContext.beginPath();
      maskContext.arc(px, py, r, 0, Math.PI * 2);
      maskContext.fill();
      maskContext.restore();
      if (edgeBlur > 0) {
        // The blur filter dilutes the core below the requested opacity —
        // re-lay a crisp, unfiltered core so opacity:1 is really opaque.
        maskContext.save();
        maskContext.globalCompositeOperation = 'source-over';
        maskContext.fillStyle = `rgba(255,255,255,${paintAlpha})`;
        maskContext.beginPath();
        maskContext.arc(px, py, Math.max(0.5, core), 0, Math.PI * 2);
        maskContext.fill();
        maskContext.restore();
      }
      hasInk = true;
      inkLevel = Math.min(1.5, inkLevel + 0.06);
    };

    const stampStroke = (x, y) => {
      if (lastX == null) { stamp(x, y); }
      else {
        // Interpolate so fast pointer movement paints a continuous stroke.
        const distance = Math.hypot(x - lastX, y - lastY);
        const steps = Math.max(1, Math.ceil(distance / (radius * 0.35)));
        for (let index = 1; index <= steps; index += 1) {
          stamp(lastX + ((x - lastX) * index) / steps, lastY + ((y - lastY) * index) / steps);
        }
      }
      lastX = x;
      lastY = y;
    };

    const render = () => {
      if (!alive) return;
      // Trail healing: older strokes fade continuously while the spot under
      // the pointer is re-inked every frame — so the area you're on stays
      // revealed and the rest breathes back to the base image.
      // Fade FIRST, then re-stamp, so the active spot renders at the full
      // requested opacity instead of one fade-step below it.
      if (!persist && hasInk) {
        // Exponential fade leaves a long, barely-visible ghost at the tail:
        // once the remaining ink is faint, accelerate the wipe so the last
        // traces snap away instead of lingering.
        const tailBoost = inkLevel < 0.22 ? 4 : 1;
        const step = Math.min(0.5, fade * tailBoost);
        maskContext.globalCompositeOperation = 'destination-out';
        maskContext.fillStyle = `rgba(0,0,0,${step})`;
        maskContext.fillRect(0, 0, mask.width, mask.height);
        inkLevel *= (1 - step);
      }
      if (active && lastX != null) stamp(lastX, lastY);
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (ready && hasInk) {
        const map = coverMap(image.naturalWidth, image.naturalHeight, canvas.width, canvas.height);
        context.globalCompositeOperation = 'source-over';
        context.drawImage(image, map.sx, map.sy, map.sw, map.sh, 0, 0, canvas.width, canvas.height);
        context.globalCompositeOperation = 'destination-in';
        context.drawImage(mask, 0, 0);
        context.globalCompositeOperation = 'source-over';
      }
      if (!persist && !active && inkLevel < 0.008) {
        // Every stroke has fully healed — stop the loop and clear.
        hasInk = false;
        inkLevel = 0;
        maskContext.clearRect(0, 0, mask.width, mask.height);
        context.clearRect(0, 0, canvas.width, canvas.height);
        rafId = null;
        return;
      }
      if (active || (!persist && hasInk) || (persist && active)) rafId = requestAnimationFrame(render);
      else rafId = null;
    };
    const wake = () => { if (alive && rafId == null) rafId = requestAnimationFrame(render); };

    const onEnter = () => { active = true; lastX = null; lastY = null; sync(); wake(); };
    const onMove = (event) => {
      if (!active) return;
      const box = el.getBoundingClientRect();
      stampStroke(event.clientX - box.left, event.clientY - box.top);
      wake();
    };
    const onLeave = () => { active = false; lastX = null; lastY = null; wake(); };

    // Touch: painting starts on touch-down (no pointerenter on touch devices).
    const onDown = (event) => {
      active = true;
      sync();
      el.setPointerCapture?.(event.pointerId);
      const box = el.getBoundingClientRect();
      lastX = event.clientX - box.left;
      lastY = event.clientY - box.top;
      stamp(lastX, lastY);
      wake();
    };
    const onUp = (event) => {
      if (event.pointerType !== 'mouse') { active = false; lastX = null; lastY = null; }
      wake();
    };
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('pointerleave', onLeave);
    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(sync) : null;
    resizeObserver?.observe(el);

    return {
      el,
      type: 'brushReveal',
      clear() {
        maskContext.clearRect(0, 0, mask.width, mask.height);
        context.clearRect(0, 0, canvas.width, canvas.height);
        hasInk = false;
        inkLevel = 0;
      },
      replay() { this.clear(); },
      pause() { alive = false; if (rafId != null) cancelAnimationFrame(rafId); rafId = null; },
      resume() { if (!alive) { alive = true; wake(); } },
      destroy() {
        alive = false;
        if (rafId != null) cancelAnimationFrame(rafId);
        el.removeEventListener('pointerenter', onEnter);
        el.removeEventListener('pointerdown', onDown);
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerup', onUp);
        el.removeEventListener('pointercancel', onUp);
        el.removeEventListener('pointerleave', onLeave);
        resizeObserver?.disconnect();
        canvas.remove();
        if (originalStyle == null) el.removeAttribute('style'); else el.setAttribute('style', originalStyle);
      }
    };
  },
  reduced() {}
};
