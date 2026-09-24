import { clamp, lerp, snapshotInlineStyles } from '../utils.js';
import { createInteractiveShadow } from '../interactiveShadow.js';
import { buildDisplacementMap, supportsBackdrop, supportsBackdropRefraction } from './surface/glass.js';

function bool(value, fallback = false) {
  if (value == null) return fallback;
  return value !== false && value !== 'false' && value !== 0 && value !== '0';
}

export default {
  create(el, opts = {}) {
    // Optional: skip entirely on touch devices (gyro/hover effects off).
    if (opts.disableOnMobile === true && typeof window !== 'undefined' && window.matchMedia?.('(hover: none), (pointer: coarse)').matches) return null;
    const mode = opts.mode || opts.preset || 'spotlight';
    const computed = getComputedStyle(el);
    const restore = snapshotInlineStyles(el, ['position', 'zIndex', 'overflow', 'isolation']);
    if (computed.position === 'static') el.style.position = 'relative';
    // Aurora is an outer halo that must be able to leak outside the card.
    if (mode === 'aurora' || mode === 'comet') {
      if (computed.zIndex === 'auto') el.style.zIndex = '1';
    } else if (mode === 'glass') {
      // No `isolation` here on purpose. Isolating the card creates a stacking
      // context, and a backdrop-filter inside one can only see the backdrop
      // WITHIN it — which for a card is nothing at all, so the glass would come
      // out clear. The pane's own layer is what clips the look to the card.
      if (computed.overflow === 'visible') el.style.overflow = 'hidden';
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
    const shadowCss = opts.shadowCss || '';
    const shadowEnabled = bool(opts.shadow, false) || Boolean(String(shadowCss).trim());
    const shadowColor = opts.shadowColor || '#111827';
    const shadowOpacity = clamp(Number(opts.shadowOpacity ?? 0.24), 0, 1);
    const shadowBlur = Math.max(0, Number(opts.shadowBlur ?? 32));
    const shadowSpread = Number(opts.shadowSpread ?? -10);
    const shadowX = Number(opts.shadowX ?? 0);
    const shadowY = Number(opts.shadowY ?? 12);
    const shadowFollow = Math.max(0, Number(opts.shadowFollow ?? 12));
    const shadowHoverOnly = opts.shadowHoverOnly === true;
    const shadowInset = opts.shadowInset === true;
    const shadow = createInteractiveShadow(el, 'card-glow', {
      enabled: shadowEnabled,
      color: shadowColor,
      opacity: shadowOpacity,
      blur: shadowBlur,
      spread: shadowSpread,
      x: shadowX,
      y: shadowY,
      inset: shadowInset,
      css: shadowCss,
      active: shadowEnabled && !shadowHoverOnly
    });

    // ── glass ─────────────────────────────────────────────────────────────
    // These are read inside the `glass` branch below, not here, so the variant
    // analysis can see that they belong to that one look — otherwise the
    // settings drawer would offer glass controls on every other mode.
    let glassDepth = 20;
    let refracting = false;
    let glassFilterId = '';
    let glassSheen = null;
    let glassMap = null;

    const root = document.createElement('span');
    root.className = `kt-card-glow kt-card-glow-${mode}`;
    root.setAttribute('aria-hidden', 'true');
    root.style.cssText = 'position:absolute;inset:0;z-index:0;border-radius:inherit;pointer-events:none;overflow:hidden;opacity:0;transition:opacity .2s var(--kt-ease-ui, ease);';

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
      root.style.cssText = `position:absolute;inset:0;z-index:0;border-radius:inherit;pointer-events:none;opacity:${bool(opts.alwaysOn, true) ? 1 : 0};transition:opacity .35s var(--kt-ease-ui, ease);`;
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
      root.style.cssText = `position:absolute;inset:${-inset}px;z-index:-1;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .45s var(--kt-ease-ui, ease);`;
      spotlight.style.cssText = `position:absolute;inset:0;border-radius:inherit;background:conic-gradient(from var(--kt-angle,0deg),${auroraColor},${auroraColor2},${auroraColor});filter:blur(${Math.max(4, blur)}px);opacity:${opacity};animation:kt-border-spin ${cycle}s linear infinite;will-change:filter;`;
    } else if (mode === 'shine') {
      spotlight.style.cssText = `position:absolute;top:0;bottom:0;left:-55%;width:42%;border-radius:0;background:linear-gradient(90deg,transparent,${color},transparent);filter:blur(${blur}px);opacity:${opacity};transform:skewX(-20deg);will-change:transform;`;
    } else if (mode === 'glass') {
      const glassBlur = Math.max(0, Number(opts.glassBlur ?? 14));
      const glassSaturate = Math.max(0, Number(opts.glassSaturate ?? 1.7));
      const rimWidth = Math.max(0.5, Number(opts.glassRim ?? 1.5));
      const rimOpacity = clamp(Number(opts.glassRimOpacity ?? 0.9), 0, 1);
      const sheenOpacity = clamp(Number(opts.glassSheen ?? 0.3), 0, 1);
      const wantsRefraction = opts.glassRefraction !== 'off' && opts.glassRefraction !== false;
      glassDepth = Math.max(1, Number(opts.glassDepth ?? 20));
      // The bend needs an SVG filter used as a backdrop-filter, which is
      // Chromium only today. Everything else about the pane works without it,
      // so this is the one part that simply does not happen elsewhere.
      refracting = supportsBackdrop() && wantsRefraction && supportsBackdropRefraction();
      glassFilterId = refracting ? `kt-glass-${Math.random().toString(36).slice(2, 10)}` : '';
      const glassFilter = `${refracting ? `url(#${glassFilterId}) ` : ''}blur(${glassBlur}px) saturate(${glassSaturate})`;
      // The pane itself: a blurred, colour-pushed backdrop under a faint tint.
      // It is always on — glass is a material the card is made of, not a hover
      // reaction — and it keeps the card's own corner radius.
      const tint = opts.glassTint || 'rgba(255,255,255,.10)';
      root.style.cssText = `position:absolute;inset:0;z-index:0;border-radius:inherit;pointer-events:none;overflow:hidden;opacity:1;background:${tint};box-shadow:inset 0 1px 1px #ffffff40,inset 0 -1px 2px #00000020;`;
      if (supportsBackdrop()) {
        root.style.backdropFilter = glassFilter;
        root.style.webkitBackdropFilter = glassFilter;
      }
      // The rim is the part people recognise. A ring one and a half pixels
      // wide, bright where the light falls and gone round the back, drawn with
      // the same mask-composite trick the border mode uses.
      spotlight.style.cssText = `position:absolute;inset:0;border-radius:inherit;padding:${rimWidth}px;opacity:${rimOpacity};`
        + '-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;'
        + 'mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;will-change:background;';
      // …and a soft sheen inside the lit edge, which is what stops the pane
      // from reading as a flat sheet of frosted plastic.
      const sheen = document.createElement('span');
      sheen.className = 'kt-card-glow-sheen';
      sheen.style.cssText = `position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:${sheenOpacity};`;
      root.appendChild(sheen);
      glassSheen = sheen;
    }

    el.insertBefore(root, el.firstChild);
    // Track the children we promote to positioned so destroy() can undo it.
    // 공용 스냅샷을 씁니다. 직접 `child.style.position = ''` 로 되돌리면 원래 style 속성이
    // 없던 자식에게 `style=""` 라는 빈 껍데기가 남습니다 — 스냅샷의 복원은 그 경우 속성째
    // 지워 주므로, 자식도 만나기 전과 똑같은 모습으로 돌아갑니다.
    const promotedChildren = [];
    Array.from(el.children).forEach((child) => {
      if (child !== root && getComputedStyle(child).position === 'static') {
        promotedChildren.push(snapshotInlineStyles(child, ['position']));
        child.style.position = 'relative';
      }
    });

    // The bend is drawn per pane, because it depends on the pane's own size and
    // corner radius. Rebuilt only when the box actually changes: the map costs
    // one pass over the pane's pixels, which is nothing once, and everything if
    // it ran per frame.
    const createRefraction = () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('aria-hidden', 'true');
      svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;';
      svg.innerHTML = `<filter id="${glassFilterId}" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%">`
        + '<feImage x="0" y="0" result="kt-map"></feImage>'
        + '<feDisplacementMap in="SourceGraphic" in2="kt-map" xChannelSelector="R" yChannelSelector="G"></feDisplacementMap>'
        + '</filter>';
      // Inside the pane's own layer, so it leaves with it and no id is left
      // behind in the document for the next card to collide with.
      root.appendChild(svg);
      return { svg, image: svg.querySelector('feImage'), displace: svg.querySelector('feDisplacementMap') };
    };
    const drawRefraction = () => {
      if (!refracting) return;
      const width = Math.round(el.clientWidth);
      const height = Math.round(el.clientHeight);
      if (width < 2 || height < 2) return;
      if (!glassMap) glassMap = createRefraction();
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d', { willReadFrequently: false });
      if (!context) return;
      const paneRadius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
      context.putImageData(buildDisplacementMap(context, width, height, paneRadius, glassDepth), 0, 0);
      glassMap.image.setAttribute('href', canvas.toDataURL());
      glassMap.image.setAttribute('width', String(width));
      glassMap.image.setAttribute('height', String(height));
      // How far the backdrop is allowed to travel. Tied to the bevel, so a
      // deeper edge bends more — which is what a thicker piece of glass does.
      glassMap.displace.setAttribute('scale', String(Math.round(glassDepth * 1.2)));
    };
    let glassResize = null;
    if (refracting && typeof ResizeObserver !== 'undefined') {
      let lastBox = '';
      glassResize = new ResizeObserver(() => {
        const box = `${Math.round(el.clientWidth)}x${Math.round(el.clientHeight)}`;
        if (box === lastBox) return;
        lastBox = box;
        drawRefraction();
      });
      glassResize.observe(el);
    } else if (refracting) {
      drawRefraction();
    }

    let targetX = el.clientWidth * (mode === 'glass' ? 0.25 : 0.5);
    let targetY = el.clientHeight * (mode === 'glass' ? 0.2 : 0.5);
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
      shadow.update(
        shadowX + (xPercent - 50) / 50 * shadowFollow,
        shadowY + (yPercent - 50) / 50 * shadowFollow,
        !shadowHoverOnly || hovering
      );
      root.style.setProperty('--kt-x', `${xPercent}%`);
      root.style.setProperty('--kt-y', `${yPercent}%`);
      if (mode === 'spotlight' || mode === 'edge' || mode === 'border') {
        let glowX = currentX;
        let glowY = currentY;
        if (mode === 'edge') {
          // Project the pointer onto whichever border it is closest to, so the
          // glow rides the edge of the card rather than following the cursor
          // across its face.
          const w = el.clientWidth;
          const h = el.clientHeight;
          const toLeft = currentX;
          const toRight = w - currentX;
          const toTop = currentY;
          const toBottom = h - currentY;
          const nearest = Math.min(toLeft, toRight, toTop, toBottom);
          if (nearest === toLeft) glowX = 0;
          else if (nearest === toRight) glowX = w;
          else if (nearest === toTop) glowY = 0;
          else glowY = h;
        }
        spotlight.style.transform = `translate3d(${glowX}px,${glowY}px,0)`;
      }
      updateSurface(xPercent, yPercent);
      if (mode === 'glass') {
        // The light comes from where the pointer is: the rim is brightest on
        // the near edge and fades round the far side, and the sheen leans the
        // same way. This is the part that makes the pane feel like a solid
        // object being tilted rather than a picture of one.
        const angle = Math.atan2(yPercent - 50, xPercent - 50) * 180 / Math.PI + 90;
        spotlight.style.background = `linear-gradient(${angle + 180}deg,`
          + 'rgba(255,255,255,.95) 0%,rgba(255,255,255,.22) 34%,'
          + 'rgba(255,255,255,0) 52%,rgba(255,255,255,.5) 100%)';
        if (glassSheen) {
          glassSheen.style.background = `linear-gradient(${angle + 180}deg,`
            + 'rgba(255,255,255,.55) 0%,rgba(255,255,255,0) 46%)';
        }
      }
      const moving = Math.abs(currentX - targetX) > 0.08 || Math.abs(currentY - targetY) > 0.08;
      if (moving || (hovering && follow && mode !== 'glass')) rafId = requestAnimationFrame(render);
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
      shadow.update(shadowX, shadowY, true);
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
      targetX = el.clientWidth * (mode === 'glass' ? 0.25 : 0.5);
      targetY = el.clientHeight * (mode === 'glass' ? 0.2 : 0.5);
      // Glass is what the card is made of, so it stays when the pointer leaves;
      // only the direction its light comes from goes back to neutral.
      root.style.opacity = mode === 'glass'
        ? '1'
        : (bool(opts.alwaysOn, mode === 'aurora' || mode === 'comet') ? String(opacity) : '0');
      shadow.update(shadowX, shadowY, !shadowHoverOnly);
      requestRender();
    };

    // Press / tap reaction: move the light to the touch point and pulse a
    // brightness burst — gives touch devices (and corner taps) a light-flow
    // response even without hover. Works across all modes.
    const onPress = (event) => {
      hovering = true;
      root.style.opacity = '1';
      shadow.update(shadowX, shadowY, true);
      setPointer(event);
      root.animate([
        { filter: 'brightness(1)' },
        { filter: 'brightness(1.5) saturate(1.15)', offset: 0.28 },
        { filter: 'brightness(1)' }
      ], { duration: 520, easing: 'cubic-bezier(.2,.7,.2,1)' });
      requestRender();
    };

    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointermove', setPointer, { passive: true });
    el.addEventListener('pointerleave', onLeave);
    el.addEventListener('pointerdown', onPress);
    if (bool(opts.alwaysOn, mode === 'aurora' || mode === 'comet')) root.style.opacity = String(opacity);
    updateSurface(50, 50);
    // Glass has to look like glass before anyone touches it, so paint one frame
    // at rest: the rim lit from the top-left, which is where a page's light
    // conventionally comes from.
    if (mode === 'glass') {
      root.style.opacity = '1';
      render();
    }

    return {
      el,
      type: 'cardGlow',
      pause() {
        alive = false;
        if (rafId != null) cancelAnimationFrame(rafId);
        rafId = null;
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
        glassResize?.disconnect();
        glassResize = null;
        if (rafId != null) cancelAnimationFrame(rafId);
        el.removeEventListener('pointerenter', onEnter);
        el.removeEventListener('pointermove', setPointer);
        el.removeEventListener('pointerleave', onLeave);
        el.removeEventListener('pointerdown', onPress);
        root.remove();
        promotedChildren.forEach((restoreChild) => restoreChild());
        shadow.destroy();
        restore();
      }
    };
  },
  fallback() {},
  reduced() {}
};
