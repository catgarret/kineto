import { clamp, lerp } from '../utils.js';

function bool(value, fallback = false) {
  if (value == null) return fallback;
  return value !== false && value !== 'false' && value !== 0 && value !== '0';
}

export default {
  create(el, opts = {}) {
    // Optional: skip entirely on touch devices (gyro/hover effects off).
    if (opts.disableOnMobile === true && typeof window !== 'undefined' && window.matchMedia?.('(hover: none), (pointer: coarse)').matches) return null;
    const mode = opts.mode || opts.preset || 'spotlight';
    const originalStyle = el.getAttribute('style');
    const computed = getComputedStyle(el);
    if (computed.position === 'static') el.style.position = 'relative';
    // Aurora is an outer halo that must be able to leak outside the card.
    if (mode === 'aurora' || mode === 'comet') {
      if (computed.zIndex === 'auto') el.style.zIndex = '1';
    } else {
      if (computed.overflow === 'visible') el.style.overflow = 'hidden';
      el.style.isolation = 'isolate';
    }

    const radius = Math.max(24, Number(opts.radius ?? 180));
    const opacity = clamp(Number(opts.opacity ?? opts.intensity ?? 0.72), 0, 1);
    const blur = Math.max(0, Number(opts.blur ?? 14));
    const spread = Number(opts.spread ?? 0);
    const follow = opts.follow !== false;
    const sensitivity = Math.max(0.1, Number(opts.sensitivity ?? 1));
    const smoothing = clamp(Number(opts.smoothing ?? opts.speed ?? 0.16), 0.01, 1);
    const color = opts.color || opts.color1 || 'rgba(120,150,255,.58)';
    const color2 = opts.color2 || 'rgba(148,255,226,.34)';

    const root = document.createElement('span');
    root.className = `kt-card-glow kt-card-glow-${mode}`;
    root.setAttribute('aria-hidden', 'true');
    root.style.cssText = 'position:absolute;inset:0;z-index:0;border-radius:inherit;pointer-events:none;overflow:hidden;opacity:0;transition:opacity .2s ease;';

    const spotlight = document.createElement('span');
    spotlight.className = 'kt-card-glow-spotlight';
    spotlight.style.cssText = `position:absolute;left:${-radius}px;top:${-radius}px;width:${radius * 2}px;height:${radius * 2}px;border-radius:50%;background:radial-gradient(circle,${color} 0%,transparent 70%);filter:blur(${blur}px);opacity:${opacity};mix-blend-mode:${opts.blendMode || 'screen'};will-change:transform;`;
    root.appendChild(spotlight);

    const surfaceEnabled = bool(opts.surface ?? opts.reflection, false);
    let surface = null;
    if (surfaceEnabled) {
      surface = document.createElement('span');
      surface.className = 'kt-card-glow-surface';
      const surfaceOpacity = clamp(Number(opts.surfaceOpacity ?? 0.38), 0, 1);
      const surfaceBlur = Math.max(0, Number(opts.surfaceBlur ?? 0));
      const surfaceBlend = opts.surfaceBlend || 'soft-light';
      surface.style.cssText = `position:absolute;inset:${Number(opts.surfaceInset ?? 0)}px;border-radius:inherit;opacity:${surfaceOpacity};mix-blend-mode:${surfaceBlend};filter:blur(${surfaceBlur}px);will-change:background;`;
      root.appendChild(surface);
    }

    const borderEnabled = bool(opts.borderGlow ?? opts.luminousBorder, mode === 'border');
    let border = null;
    if (borderEnabled) {
      border = document.createElement('span');
      border.className = 'kt-card-glow-border';
      const width = Math.max(1, Number(opts.borderWidth ?? 1.5));
      const borderOpacity = clamp(Number(opts.borderOpacity ?? 0.8), 0, 1);
      border.style.cssText = `position:absolute;inset:${Number(opts.borderInset ?? spread)}px;border-radius:inherit;padding:${width}px;opacity:${borderOpacity};filter:blur(${Math.max(0, Number(opts.borderBlur ?? 0))}px);background:radial-gradient(${Math.max(40, Number(opts.borderRadius ?? radius * 0.75))}px circle at var(--kt-x,50%) var(--kt-y,50%),${opts.borderColor || color},${opts.borderColor2 || color2} 42%,transparent 74%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;will-change:background;`;
      root.appendChild(border);
    }

    if (mode === 'comet') {
      // Traveling gradient light along the card outline (original pretty
      // border): conic gradient with transparent tail, masked to a thin ring.
      const width = Math.max(1, Number(opts.borderWidth ?? 2));
      const cometColor = opts.borderColor || opts.color || 'rgba(123,159,255,1)';
      const cometColor2 = opts.borderColor2 || opts.color2 || 'rgba(91,232,190,.9)';
      const cycle = Math.max(0.8, Number(opts.cycleDuration ?? opts.speed ?? 3));
      root.style.cssText = `position:absolute;inset:0;z-index:0;border-radius:inherit;pointer-events:none;opacity:${bool(opts.alwaysOn, true) ? 1 : 0};transition:opacity .35s ease;`;
      spotlight.style.cssText = `position:absolute;inset:0;border-radius:inherit;padding:${width}px;background:conic-gradient(from var(--kt-angle,0deg),transparent 0deg,${cometColor} 80deg,${cometColor2} 160deg,transparent 280deg);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;opacity:${opacity};animation:kt-border-spin ${cycle}s linear infinite;filter:blur(${Math.max(0, Number(opts.blur ?? 0))}px);will-change:background;`;
      if (blur > 0 && opts.halo !== false) {
        // Soft duplicate underneath for a light haze around the edge.
        const haze = spotlight.cloneNode(false);
        haze.className = 'kt-card-glow-comet-haze';
        haze.style.filter = `blur(${Math.max(6, blur)}px)`;
        haze.style.opacity = String(opacity * 0.7);
        root.appendChild(haze);
      }
    } else if (mode === 'aurora') {
      // Rotating conic halo that leaks outside the card edge (original effect).
      const inset = Math.max(2, Number(opts.spread ?? 6));
      const cycle = Math.max(1, Number(opts.cycleDuration ?? opts.speed ?? 6));
      const auroraColor = opts.color1 || opts.color || 'rgba(88,150,255,.55)';
      const auroraColor2 = opts.color2 || 'rgba(94,234,195,.45)';
      root.style.cssText = `position:absolute;inset:${-inset}px;z-index:-1;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .45s ease;`;
      spotlight.style.cssText = `position:absolute;inset:0;border-radius:inherit;background:conic-gradient(from var(--kt-angle,0deg),${auroraColor},${auroraColor2},${auroraColor});filter:blur(${Math.max(4, blur)}px);opacity:${opacity};animation:kt-border-spin ${cycle}s linear infinite;will-change:filter;`;
    } else if (mode === 'shine') {
      spotlight.style.cssText = `position:absolute;top:0;bottom:0;left:-55%;width:42%;border-radius:0;background:linear-gradient(90deg,transparent,${color},transparent);filter:blur(${blur}px);opacity:${opacity};transform:skewX(-20deg);will-change:transform;`;
    }

    el.insertBefore(root, el.firstChild);
    Array.from(el.children).forEach((child) => {
      if (child !== root && getComputedStyle(child).position === 'static') child.style.position = 'relative';
    });

    let targetX = el.clientWidth / 2;
    let targetY = el.clientHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let rafId = null;
    let alive = true;
    let hovering = false;

    const updateSurface = (xPercent, yPercent) => {
      if (!surface) return;
      const angle = Math.atan2(yPercent - 50, xPercent - 50) * 180 / Math.PI + 90;
      const custom = opts.surfaceGradient;
      surface.style.background = custom || `linear-gradient(${angle}deg,transparent 12%,${opts.surfaceColor || 'rgba(255,255,255,.48)'} 42%,${opts.surfaceColor2 || 'rgba(145,180,255,.16)'} 55%,transparent 78%)`;
      surface.style.backgroundSize = `${Math.max(100, Number(opts.surfaceSize ?? 170))}% ${Math.max(100, Number(opts.surfaceSize ?? 170))}%`;
      surface.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
    };

    const render = () => {
      if (!alive) return;
      currentX = lerp(currentX, targetX, smoothing);
      currentY = lerp(currentY, targetY, smoothing);
      const width = Math.max(1, el.clientWidth);
      const height = Math.max(1, el.clientHeight);
      const xPercent = clamp(currentX / width * 100, 0, 100);
      const yPercent = clamp(currentY / height * 100, 0, 100);
      root.style.setProperty('--kt-x', `${xPercent}%`);
      root.style.setProperty('--kt-y', `${yPercent}%`);
      if (mode === 'spotlight' || mode === 'pointer' || mode === 'border') {
        spotlight.style.transform = `translate3d(${currentX}px,${currentY}px,0)`;
      }
      updateSurface(xPercent, yPercent);
      const moving = Math.abs(currentX - targetX) > 0.08 || Math.abs(currentY - targetY) > 0.08;
      if (hovering && (follow || moving)) rafId = requestAnimationFrame(render);
      else rafId = null;
    };
    const requestRender = () => {
      if (alive && rafId == null && mode !== 'aurora' && mode !== 'shine' && mode !== 'comet') rafId = requestAnimationFrame(render);
    };
    const setPointer = (event) => {
      if (!follow) return;
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = clamp(((event.clientX - rect.left) / rect.width - 0.5) * sensitivity + 0.5, 0, 1);
      const y = clamp(((event.clientY - rect.top) / rect.height - 0.5) * sensitivity + 0.5, 0, 1);
      targetX = x * rect.width;
      targetY = y * rect.height;
      requestRender();
    };
    const onEnter = (event) => {
      hovering = true;
      root.style.opacity = '1';
      setPointer(event);
      if (mode === 'shine') {
        spotlight.animate([
          { transform: 'translateX(0) skewX(-20deg)' },
          { transform: 'translateX(390%) skewX(-20deg)' }
        ], { duration: Math.max(100, Number(opts.duration ?? 800)), easing: opts.ease || 'ease-in-out' });
      }
      requestRender();
    };
    const onLeave = () => {
      hovering = false;
      targetX = el.clientWidth / 2;
      targetY = el.clientHeight / 2;
      root.style.opacity = bool(opts.alwaysOn, mode === 'aurora' || mode === 'comet') ? String(opacity) : '0';
      requestRender();
    };

    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointermove', setPointer, { passive: true });
    el.addEventListener('pointerleave', onLeave);
    if (bool(opts.alwaysOn, mode === 'aurora' || mode === 'comet')) root.style.opacity = String(opacity);
    updateSurface(50, 50);

    return {
      el,
      type: 'cardGlow',
      pause() {
        alive = false;
        if (rafId != null) cancelAnimationFrame(rafId);
        spotlight.style.animationPlayState = 'paused';
      },
      resume() {
        if (!alive) {
          alive = true;
          spotlight.style.animationPlayState = 'running';
          requestRender();
        }
      },
      destroy() {
        alive = false;
        if (rafId != null) cancelAnimationFrame(rafId);
        el.removeEventListener('pointerenter', onEnter);
        el.removeEventListener('pointermove', setPointer);
        el.removeEventListener('pointerleave', onLeave);
        root.remove();
        if (originalStyle == null) el.removeAttribute('style'); else el.setAttribute('style', originalStyle);
      }
    };
  },
  reduced() {}
};
