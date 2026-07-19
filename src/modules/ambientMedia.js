function mediaSource(media, opts = {}) {
  return opts.ambientSrc || opts.source || opts.src || media.dataset?.src || media.getAttribute?.('data-src') || media.currentSrc || media.getAttribute?.('src') || '';
}

function createImageClone(src, media, opts) {
  const clone = document.createElement('img');
  clone.className = 'kt-ambient-image-clone';
  clone.alt = '';
  clone.setAttribute('aria-hidden', 'true');
  clone.loading = 'eager';
  clone.decoding = 'async';
  clone.src = src;
  const srcset = opts.ambientSrcset || media.getAttribute?.('data-srcset') || media.getAttribute?.('srcset');
  if (srcset) clone.srcset = srcset;
  clone.style.cssText = 'display:block;width:100%;height:100%;object-fit:cover;object-position:50% 50%;';
  return clone;
}

export default {
  create(el, opts = {}) {
    const media = ['VIDEO', 'IFRAME', 'IMG', 'PICTURE'].includes(el.tagName) ? el : el.querySelector('video,iframe,img,picture');
    if (!media) return null;
    const actualMedia = media.tagName === 'PICTURE' ? media.querySelector('img') : media;
    if (!actualMedia) return null;

    let host = actualMedia.closest('.kt-lazy-wrap') || actualMedia;
    let outer = host.parentElement;
    let createdWrapper = false;
    const originalOuterStyle = outer?.getAttribute('style') ?? null;
    const originalHostStyle = host.getAttribute('style');
    const originalMediaStyle = actualMedia.getAttribute('style');

    const needsWrapper = !outer || !outer.classList.contains('kt-ambient-wrap') || getComputedStyle(outer).overflow === 'hidden';
    if (needsWrapper) {
      outer = document.createElement('span');
      outer.className = 'kt-ambient-wrap';
      // Fill the parent box: without explicit size this wrapper broke the
      // percentage sizing chain of lazy-loaded images (they collapsed into a
      // thin bar inside fixed-ratio stages).
      outer.style.cssText = 'position:relative;display:block;isolation:isolate;overflow:visible;width:100%;height:100%;';
      host.parentNode?.insertBefore(outer, host);
      outer.appendChild(host);
      createdWrapper = true;
    } else {
      const computed = getComputedStyle(outer);
      if (computed.position === 'static') outer.style.position = 'relative';
      outer.style.isolation = 'isolate';
      if (opts.allowOverflow !== false) outer.style.overflow = 'visible';
    }

    host.style.position = host.style.position || 'relative';
    host.style.zIndex = '1';
    actualMedia.style.position = actualMedia.style.position || 'relative';
    actualMedia.style.zIndex = '1';

    const glow = document.createElement('span');
    glow.className = 'kt-ambient-glow';
    glow.setAttribute('aria-hidden', 'true');
    const inset = Number(opts.inset ?? -28);
    const blur = Math.max(0, Number(opts.blur ?? 42));
    const opacity = Math.min(1, Math.max(0, Number(opts.opacity ?? 0.62)));
    const scale = Math.max(1, Number(opts.scale ?? 1.06));
    glow.style.cssText = `position:absolute;inset:${inset}px;z-index:0;pointer-events:none;border-radius:${opts.radius || 'inherit'};overflow:hidden;filter:blur(${blur}px) saturate(${Number(opts.saturation ?? 1.45)}) brightness(${Number(opts.brightness ?? 0.82)});opacity:${opacity};transform:scale(${scale}) translateZ(0);transform-origin:center;transition:opacity .25s ease;`;
    outer.insertBefore(glow, host);

    const tag = actualMedia.tagName;
    const source = mediaSource(actualMedia, opts);
    let canvas = null;
    let context = null;
    let clone = null;
    let rafId = null;
    let alive = true;
    let lastDraw = 0;
    let observer = null;
    let drawCount = 0;
    const fallbackColor = opts.color || opts.fallbackColor || 'rgba(100,120,180,.42)';

    const setFallback = () => {
      glow.style.background = fallbackColor;
      glow.dataset.mode = 'color';
    };

    if (tag === 'IMG' || (tag === 'IFRAME' && source)) {
      if (source) {
        clone = createImageClone(source, actualMedia, opts);
        glow.appendChild(clone);
        glow.dataset.mode = 'image-clone';
        const updateSource = () => {
          const next = mediaSource(actualMedia, opts);
          if (next && clone.src !== new URL(next, document.baseURI).href) clone.src = next;
        };
        observer = new globalThis.MutationObserver(updateSource);
        observer.observe(actualMedia, { attributes: true, attributeFilter: ['src', 'data-src', 'srcset', 'data-srcset'] });
        actualMedia.addEventListener('load', updateSource);
        glow._mkLoadHandler = updateSource;
      } else setFallback();
    } else if (tag === 'VIDEO') {
      canvas = document.createElement('canvas');
      canvas.className = 'kt-ambient-video-canvas';
      canvas.width = Math.max(16, Number(opts.sampleWidth ?? 48));
      canvas.height = Math.max(9, Number(opts.sampleHeight ?? 27));
      canvas.style.cssText = 'display:block;width:100%;height:100%;object-fit:cover;';
      context = canvas.getContext('2d', { alpha: false });
      glow.appendChild(canvas);
      glow.dataset.mode = 'video-sample';
      const fps = Math.min(30, Math.max(2, Number(opts.sampleFps ?? 12)));
      const interval = 1000 / fps;
      const draw = (time) => {
        if (!alive) return;
        if (time - lastDraw >= interval && actualMedia.readyState >= 2) {
          lastDraw = time;
          try {
            context.drawImage(actualMedia, 0, 0, canvas.width, canvas.height);
            drawCount += 1;
            canvas.dataset.frames = String(drawCount);
          } catch (_error) {
            setFallback();
          }
        }
        rafId = requestAnimationFrame(draw);
      };
      rafId = requestAnimationFrame(draw);
    } else setFallback();

    return {
      el,
      type: 'ambientMedia',
      get mode() { return glow.dataset.mode; },
      get frames() { return drawCount; },
      pause() {
        alive = false;
        if (rafId != null) cancelAnimationFrame(rafId);
        glow.style.opacity = opts.hideOnPause === true ? '0' : String(opacity);
      },
      resume() {
        if (!alive) {
          alive = true;
          glow.style.opacity = String(opacity);
          if (canvas) rafId = requestAnimationFrame((time) => {
            lastDraw = time - 1000;
            const loop = (now) => {
              if (!alive) return;
              if (now - lastDraw >= 1000 / Math.min(30, Math.max(2, Number(opts.sampleFps ?? 12))) && actualMedia.readyState >= 2) {
                lastDraw = now;
                try { context.drawImage(actualMedia, 0, 0, canvas.width, canvas.height); drawCount += 1; canvas.dataset.frames = String(drawCount); } catch (_error) { setFallback(); }
              }
              rafId = requestAnimationFrame(loop);
            };
            loop(time);
          });
        }
      },
      destroy() {
        alive = false;
        if (rafId != null) cancelAnimationFrame(rafId);
        observer?.disconnect();
        if (glow._mkLoadHandler) actualMedia.removeEventListener('load', glow._mkLoadHandler);
        glow.remove();
        if (createdWrapper && outer.parentNode) {
          outer.parentNode.insertBefore(host, outer);
          outer.remove();
        } else if (!createdWrapper) {
          if (originalOuterStyle == null) outer.removeAttribute('style'); else outer.setAttribute('style', originalOuterStyle);
        }
        if (originalHostStyle == null) host.removeAttribute('style'); else host.setAttribute('style', originalHostStyle);
        if (originalMediaStyle == null) actualMedia.removeAttribute('style'); else actualMedia.setAttribute('style', originalMediaStyle);
      }
    };
  },
  reduced() {}
};
