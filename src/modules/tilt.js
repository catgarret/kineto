import { clamp, lerp, snapshotInlineStyles } from '../utils.js';

export default {
  create(el, opts) {
    // Optional: skip entirely on touch devices (gyro/hover effects off).
    if (opts.disableOnMobile === true && typeof window !== 'undefined' && window.matchMedia?.('(hover: none), (pointer: coarse)').matches) return null;

    // On touch devices tilt falls back to the gyroscope instead of turning
    // off, so cards still respond to how the phone is held.
    const coarse = window.matchMedia?.('(hover: none)').matches === true;
    const gyroAvailable = typeof DeviceOrientationEvent !== 'undefined';
    if (coarse && (opts.gyro === false || !gyroAvailable)) return null;
    const max = Math.max(0, Number(opts.max ?? 12));
    const maxX = Math.max(0, Number(opts.maxX ?? max));
    const maxY = Math.max(0, Number(opts.maxY ?? max));
    const perspective = Math.max(100, Number(opts.perspective ?? 1000));
    const scale = Math.max(0.5, Number(opts.scale ?? 1.02));
    const smoothing = clamp(Number(opts.smoothing ?? opts.ease ?? 0.1), 0.01, 1);
    const sensitivity = Math.max(0.1, Number(opts.sensitivity ?? 1));
    const axis = opts.axis || 'both';
    const reverse = opts.reverse === true ? -1 : 1;
    const reset = opts.reset !== false;
    const glareEnabled = opts.glare !== false;
    const glareRadius = Math.max(20, Number(opts.glareRadius ?? 180));
    const glareOpacity = clamp(Number(opts.glareOpacity ?? 0.32), 0, 1);
    const glareColor = opts.glareColor || 'rgba(255,255,255,.85)';
    const glareBlur = Math.max(0, Number(opts.glareBlur ?? 8));
    const restore = snapshotInlineStyles(el, ['transform', 'transformStyle', 'willChange', 'position']);
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.style.transformStyle = 'preserve-3d';
    el.style.willChange = 'transform';

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let targetScale = 1;
    let currentScale = 1;
    let alive = true;
    let rafId = null;
    let hovering = false;
    let glareWrap = null;
    let glare = null;
    let glareX = 50;
    let glareY = 50;

    if (glareEnabled) {
      glareWrap = document.createElement('span');
      glareWrap.className = 'kt-tilt-glare-wrap';
      glareWrap.setAttribute('aria-hidden', 'true');
      glareWrap.style.cssText = 'position:absolute;inset:0;overflow:hidden;border-radius:inherit;pointer-events:none;z-index:9;';
      glare = document.createElement('span');
      glare.className = 'kt-tilt-glare';
      glare.style.cssText = `position:absolute;width:${glareRadius * 2}px;height:${glareRadius * 2}px;left:${-glareRadius}px;top:${-glareRadius}px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,${glareColor},rgba(255,255,255,0) 68%);filter:blur(${glareBlur}px);opacity:0;transition:opacity .2s ease;mix-blend-mode:screen;`;
      glareWrap.appendChild(glare);
      el.appendChild(glareWrap);
    }

    const tick = () => {
      if (!alive) return;
      currentX = lerp(currentX, targetX, smoothing);
      currentY = lerp(currentY, targetY, smoothing);
      currentScale = lerp(currentScale, targetScale, smoothing);
      el.style.transform = `perspective(${perspective}px) rotateX(${currentX}deg) rotateY(${currentY}deg) scale3d(${currentScale},${currentScale},${currentScale})`;
      if (glare) glare.style.transform = `translate3d(${glareX}%,${glareY}%,0)`;
      const moving = Math.abs(currentX - targetX) > 0.02 || Math.abs(currentY - targetY) > 0.02 || Math.abs(currentScale - targetScale) > 0.002;
      if (hovering || moving) rafId = requestAnimationFrame(tick);
      else rafId = null;
    };
    const ensureTick = () => { if (alive && rafId == null) rafId = requestAnimationFrame(tick); };

    const onEnter = () => {
      hovering = true;
      targetScale = scale;
      if (glare) glare.style.opacity = String(glareOpacity);
      ensureTick();
    };
    const onMove = (event) => {
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = clamp(((event.clientX - rect.left) / rect.width - 0.5) * sensitivity + 0.5, 0, 1);
      const y = clamp(((event.clientY - rect.top) / rect.height - 0.5) * sensitivity + 0.5, 0, 1);
      targetX = axis === 'x' ? 0 : (-(y - 0.5) * 2 * maxX * reverse);
      targetY = axis === 'y' ? 0 : ((x - 0.5) * 2 * maxY * reverse);
      glareX = x * 100;
      glareY = y * 100;
      ensureTick();
    };
    const onLeave = () => {
      hovering = false;
      if (reset) {
        targetX = 0;
        targetY = 0;
        targetScale = 1;
      }
      if (glare) glare.style.opacity = '0';
      ensureTick();
    };

    let gyroHandler = null;
    let permissionHandler = null;
    if (coarse) {
      gyroHandler = (event) => {
        const gx = clamp((event.gamma || 0) / 28, -1, 1);
        const gy = clamp(((event.beta || 0) - 40) / 28, -1, 1);
        targetX = -gy * maxX * reverse;
        targetY = gx * maxY * reverse;
        glareX = (gx + 1) * 50;
        glareY = (gy + 1) * 50;
        if (glare) glare.style.opacity = String(glareOpacity);
        hovering = true;
        ensureTick();
      };
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        permissionHandler = async () => {
          try {
            if (await DeviceOrientationEvent.requestPermission() === 'granted') {
              window.addEventListener('deviceorientation', gyroHandler, { passive: true });
            }
          } catch (_error) { /* permission requires a user gesture and may be denied */ }
        };
        el.addEventListener('pointerdown', permissionHandler, { once: true });
      } else {
        window.addEventListener('deviceorientation', gyroHandler, { passive: true });
      }
    } else {
      el.addEventListener('pointerenter', onEnter);
      el.addEventListener('pointermove', onMove, { passive: true });
      el.addEventListener('pointerleave', onLeave);
    }

    return {
      el,
      type: 'tilt',
      pause: () => { alive = false; if (rafId != null) cancelAnimationFrame(rafId); },
      resume: () => { if (!alive) { alive = true; ensureTick(); } },
      destroy: () => {
        alive = false;
        if (rafId != null) cancelAnimationFrame(rafId);
        el.removeEventListener('pointerenter', onEnter);
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
        if (gyroHandler) window.removeEventListener('deviceorientation', gyroHandler);
        if (permissionHandler) el.removeEventListener('pointerdown', permissionHandler);
        glareWrap?.remove();
        restore();
      }
    };
  },
  reduced() {},
  fallback() { return null; }
};
