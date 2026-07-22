import { clamp, snapshotAttributes } from '../utils.js';

function backgroundIsDark(el) {
  let node = el;
  while (node && node !== document.documentElement) {
    const bg = getComputedStyle(node).backgroundColor;
    const match = bg && bg.match(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\)/);
    if (match && (match[4] == null || Number(match[4]) > 0.15)) {
      const luma = 0.2126 * Number(match[1]) + 0.7152 * Number(match[2]) + 0.0722 * Number(match[3]);
      return luma < 128;
    }
    node = node.parentElement;
  }
  return false;
}

const NOISE_CHARS = '!@#$%^&*()<>?/|{}~ABCDEFGHIJabcdefghij0123456789';

export default {
  create(el, opts) {
    const type = opts.preset || opts.type || 'rgb';
    const preset = type === 'digital' ? 'noise' : type;
    const intensity = clamp(Number(opts.intensity ?? 1), 0.1, 3);
    const speed = Math.max(0.1, Number(opts.speed ?? 1));
    const loop = opts.loop !== false;
    const trigger = opts.trigger || 'auto';

    // ── Continuous CRT / VCR overlay on an image (retro scanlines + roll bar) ──
    // `crt`/`vcr` on an <img> apply a persistent CSS overlay: 1px scanlines, a
    // sweeping roll bar, a vignette and flicker (VCR adds tracking noise + a
    // jitter on the picture). CSS-only, so it's cheap on mobile. Previously `crt`
    // on an image fell through to the text path and blanked the image out.
    if (preset === 'crt' || preset === 'vcr') {
      const imageEl = el.tagName === 'IMG' ? el : el.querySelector?.('img');
      const host = el.tagName === 'IMG' ? el.parentElement : el;
      if (imageEl && host) {
        const isVcr = preset === 'vcr';
        const oHostPos = host.style.position;
        const oHostOvf = host.style.overflow;
        const oImgFilter = imageEl.style.filter;
        const oImgAnim = imageEl.style.animation;
        if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
        host.style.overflow = 'hidden';
        const sl = 0.08 * intensity;   // scanline darkness (kept subtle)
        const gr = 0.035 * intensity;  // aperture-grille (RGB phosphor) strength
        const overlay = document.createElement('div');
        overlay.className = 'kt-glitch-crt';
        overlay.setAttribute('aria-hidden', 'true');
        // Layer 1: fine horizontal scanlines. Layer 2: vertical RGB aperture
        // grille (phosphor stripes). Soft vignette + gentle flicker on top.
        overlay.style.cssText = 'position:absolute;inset:0;z-index:3;pointer-events:none;border-radius:inherit;overflow:hidden;'
          + `background:repeating-linear-gradient(0deg,rgba(0,0,0,${sl}) 0,rgba(0,0,0,${sl}) 1px,transparent 1px,transparent 3px),`
          + `repeating-linear-gradient(90deg,rgba(255,40,40,${gr}) 0,rgba(255,40,40,${gr}) 1px,rgba(40,255,90,${gr}) 1px,rgba(40,255,90,${gr}) 2px,rgba(60,120,255,${gr}) 2px,rgba(60,120,255,${gr}) 3px);`
          + `box-shadow:inset 0 0 ${isVcr ? 70 : 110}px rgba(0,0,0,${isVcr ? 0.45 : 0.4}),inset 0 0 20px rgba(0,0,0,.28);`
          + `animation:kt-crt-flicker ${(isVcr ? 2.2 : 3.4) / speed}s ease-in-out infinite;`;
        // Soft bright scan band drifting down slowly (CRT refresh sweep).
        const roll = document.createElement('div');
        roll.style.cssText = `position:absolute;left:0;right:0;height:${isVcr ? 22 : 34}%;pointer-events:none;`
          + `background:linear-gradient(to bottom,transparent,rgba(255,255,255,${isVcr ? 0.04 : 0.07}) 45%,rgba(255,255,255,${isVcr ? 0.08 : 0.11}) 55%,transparent);`
          + `filter:blur(1px);animation:kt-crt-roll ${(isVcr ? 4.5 : 8) / speed}s linear infinite;`;
        overlay.appendChild(roll);
        // Subtle CRT phosphor bloom / color lift on the picture itself.
        imageEl.style.filter = `${oImgFilter ? oImgFilter + ' ' : ''}saturate(${isVcr ? 1.18 : 1.08}) contrast(1.06) brightness(1.02)`;
        let noise = null;
        let track = null;
        if (isVcr) {
          // Analogue VCR noise (SVG fractal turbulence), a jumping tracking band,
          // chromatic bleed and a slight picture jitter — the tape look.
          noise = document.createElement('div');
          noise.style.cssText = "position:absolute;inset:-20%;pointer-events:none;opacity:.08;mix-blend-mode:overlay;"
            + "background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\");"
            + `animation:kt-vcr-noise ${0.5 / speed}s steps(3,end) infinite;`;
          overlay.appendChild(noise);
          track = document.createElement('div');
          track.style.cssText = 'position:absolute;left:0;right:0;height:20%;pointer-events:none;'
            + 'background:linear-gradient(to bottom,transparent 0%,rgba(0,0,0,.16) 38%,rgba(0,0,0,.32) 50%,rgba(0,0,0,.16) 62%,transparent 100%);mix-blend-mode:multiply;filter:blur(2px);'
            + `animation:kt-vcr-track ${3.2 / speed}s linear infinite;`;
          overlay.appendChild(track);
          imageEl.style.filter += ' drop-shadow(1.2px 0 0 rgba(255,0,60,.4)) drop-shadow(-1.2px 0 0 rgba(0,180,255,.4))';
          imageEl.style.animation = `kt-vcr-jitter ${7 / speed}s steps(1,end) infinite`;
        }
        host.appendChild(overlay);
        const setPlay = (s) => { [overlay, roll, noise, track].forEach((n) => { if (n) n.style.animationPlayState = s; }); if (isVcr) imageEl.style.animationPlayState = s; };
        return {
          el,
          type: 'glitch',
          replay: () => {},
          pause: () => setPlay('paused'),
          resume: () => setPlay('running'),
          destroy: () => {
            overlay.remove();
            host.style.position = oHostPos;
            host.style.overflow = oHostOvf;
            imageEl.style.filter = oImgFilter;
            imageEl.style.animation = oImgAnim;
          }
        };
      }
    }

    // ── Ambient image glitch (독립 상시 효과, 레이지 로딩과 무관) ──────────
    // A canvas overlay bursts slice displacements / blackout flashes over a
    // live <img> at random intervals, then goes transparent again.
    if (preset === 'image' || preset === 'reveal') {
      const revealMode = preset === 'reveal';
      const imageEl = el.tagName === 'IMG' ? el : el.querySelector?.('img');
      if (!imageEl) return null;
      const host = el.tagName === 'IMG' ? el.parentElement : el;
      if (!host) return null;
      const originalHostPosition = host.style.position;
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      const canvas = document.createElement('canvas');
      canvas.className = 'kt-glitch-image-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;border-radius:inherit;z-index:2;opacity:0;';
      host.appendChild(canvas);
      const context = canvas.getContext('2d', { alpha: false });
      const slices = Math.max(2, Math.round(Number(opts.sliceCount ?? 7)));
      let imgAlive = true;
      let imgRaf = null;
      const imgTimers = new Set();
      const imgLater = (fn, ms) => {
        const id = setTimeout(() => { imgTimers.delete(id); if (imgAlive) fn(); }, ms / speed);
        imgTimers.add(id);
      };
      const syncCanvas = () => {
        const box = host.getBoundingClientRect();
        const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
        const pw = Math.max(1, Math.round(box.width * dpr));
        const ph = Math.max(1, Math.round(box.height * dpr));
        if (canvas.width !== pw || canvas.height !== ph) { canvas.width = pw; canvas.height = ph; }
      };
      const drawImageGlitch = (amp) => {
        if (!imageEl.naturalWidth) return;
        const w = canvas.width;
        const h = canvas.height;
        const scale = Math.max(w / imageEl.naturalWidth, h / imageEl.naturalHeight);
        const sw = Math.min(imageEl.naturalWidth, w / scale);
        const sh = Math.min(imageEl.naturalHeight, h / scale);
        const sx = (imageEl.naturalWidth - sw) / 2;
        const sy = (imageEl.naturalHeight - sh) / 2;
        const power = amp * intensity;
        context.filter = 'none';
        context.fillStyle = '#000';
        context.fillRect(0, 0, w, h);
        if (Math.random() < power * 0.12) return; // blackout flash
        // Chromatic ghost passes so the burst reads even on flat artwork.
        if ('filter' in context) {
          context.globalCompositeOperation = 'screen';
          context.globalAlpha = 0.55;
          context.filter = 'hue-rotate(90deg) saturate(3)';
          context.drawImage(imageEl, sx, sy, sw, sh, Math.round(-w * 0.02 * power), 0, w, h);
          context.filter = 'hue-rotate(-90deg) saturate(3)';
          context.drawImage(imageEl, sx, sy, sw, sh, Math.round(w * 0.02 * power), 0, w, h);
          context.filter = 'none';
          context.globalAlpha = 1;
          context.globalCompositeOperation = 'source-over';
        }
        for (let index = 0; index < slices; index += 1) {
          const bandY = Math.floor((index / slices) * h);
          const bandH = Math.ceil(h / slices);
          const shifted = Math.random() < 0.55;
          const offset = shifted ? Math.round((Math.random() - 0.5) * w * 0.16 * power) : 0;
          if (shifted && Math.random() < 0.28 && 'filter' in context) context.filter = `invert(1) brightness(${1 + power * 0.3})`;
          context.drawImage(imageEl, sx, sy + (bandY / h) * sh, sw, (bandH / h) * sh, offset, bandY, w, bandH);
          context.filter = 'none';
        }
        // Faint scanlines while glitching.
        context.globalAlpha = 0.18 * power;
        context.fillStyle = '#000';
        for (let y = 0; y < h; y += 4) context.fillRect(0, y, w, 1);
        context.globalAlpha = 1;
      };
      // Reveal mode = the lazy "flicker" decode-in as a one-shot: the image is
      // hidden, the canvas glitches from full strength down to clean, then the
      // real <img> is shown and the canvas removed.
      if (revealMode) imageEl.style.opacity = '0';
      const imageBurst = () => {
        if (!imgAlive) return;
        const burstDuration = revealMode
          ? Math.max(200, Number(opts.duration ?? 1.15) * 1000) / speed
          : (140 + Math.random() * 260) / speed;
        const started = performance.now();
        canvas.style.opacity = '1';
        syncCanvas();
        const frame = (time) => {
          if (!imgAlive) return;
          const progress = Math.min(1, (time - started) / burstDuration);
          drawImageGlitch(revealMode ? (1 - progress) : (1 - progress * 0.5));
          if (progress < 1) imgRaf = requestAnimationFrame(frame);
          else if (revealMode) {
            imageEl.style.opacity = '1';
            canvas.style.opacity = '0';
          } else {
            canvas.style.opacity = '0';
            if (loop) imgLater(imageBurst, 700 + Math.random() * 1800);
          }
        };
        imgRaf = requestAnimationFrame(frame);
      };
      let imgHoverEnter = null;
      let imgHoverLeave = null;
      if (trigger === 'hover') {
        imgHoverEnter = () => { imgAlive = true; imageBurst(); };
        imgHoverLeave = () => {
          imgTimers.forEach(clearTimeout);
          imgTimers.clear();
          if (imgRaf != null) cancelAnimationFrame(imgRaf);
          canvas.style.opacity = '0';
        };
        host.addEventListener('pointerenter', imgHoverEnter);
        host.addEventListener('pointerleave', imgHoverLeave);
      } else {
        imgLater(imageBurst, 400);
      }
      return {
        el,
        type: 'glitch',
        replay: () => { imgAlive = true; if (revealMode) imageEl.style.opacity = '0'; imageBurst(); },
        pause: () => {
          imgAlive = false;
          imgTimers.forEach(clearTimeout);
          imgTimers.clear();
          if (imgRaf != null) cancelAnimationFrame(imgRaf);
          canvas.style.opacity = '0';
        },
        resume: () => { if (!imgAlive) { imgAlive = true; imgLater(imageBurst, 200); } },
        destroy: () => {
          imgAlive = false;
          imgTimers.forEach(clearTimeout);
          imgTimers.clear();
          if (imgRaf != null) cancelAnimationFrame(imgRaf);
          if (imgHoverEnter) host.removeEventListener('pointerenter', imgHoverEnter);
          if (imgHoverLeave) host.removeEventListener('pointerleave', imgHoverLeave);
          if (revealMode) imageEl.style.opacity = '';
          canvas.remove();
          host.style.position = originalHostPosition;
        }
      };
    }
    const originalHTML = el.innerHTML;
    const originalStyle = el.getAttribute('style');
    const restoreAttributes = snapshotAttributes(el, ['aria-label']);
    const text = el.textContent || '';
    // Colored duplicates must read on any background: screen-blend disappears
    // on light panels, multiply disappears on dark ones — pick per background.
    const dark = backgroundIsDark(el);
    const blend = opts.blendMode || (dark ? 'screen' : 'multiply');
    const colors = Array.isArray(opts.colors) && opts.colors.length >= 2
      ? opts.colors
      : (dark ? ['rgba(255,0,60,.9)', 'rgba(0,255,0,.85)', 'rgba(61,139,255,.9)'] : ['#ff0040', '#00b894', '#2f6bff']);

    // Text-glitch presets (rgb/noise/crt-burst) wrap and rewrite the element's
    // text. On an image, an element containing an image, or anything with no
    // text, that would blank the content — so no-op safely instead of breaking.
    if (el.tagName === 'IMG' || (el.querySelector && el.querySelector('img')) || !text || !String(text).trim()) {
      return { el, type: 'glitch', replay() {}, pause() {}, resume() {}, destroy() {} };
    }

    el.setAttribute('aria-label', text);
    el.innerHTML = '';
    el.style.position = 'relative';
    el.style.display = 'inline-block';

    const base = document.createElement('span');
    base.textContent = text;
    base.style.cssText = 'position:relative;z-index:2;display:inline-block;will-change:transform;';
    base.setAttribute('aria-hidden', 'true');
    el.appendChild(base);

    const layers = colors.slice(0, 3).map((color, index) => {
      const layer = document.createElement('span');
      layer.textContent = text;
      layer.setAttribute('aria-hidden', 'true');
      layer.style.cssText = `position:absolute;inset:0;z-index:${3 + index};opacity:0;pointer-events:none;color:${color};mix-blend-mode:${blend};will-change:transform,clip-path;`;
      el.appendChild(layer);
      return layer;
    });

    let scanline = null;
    const timers = new Set();
    const running = new Set();
    let alive = true;

    const later = (callback, ms) => {
      const id = setTimeout(() => {
        timers.delete(id);
        if (alive) callback();
      }, Math.max(0, ms) / speed);
      timers.add(id);
      return id;
    };
    const animate = (node, keyframes, options) => {
      const player = node.animate(keyframes, options);
      running.add(player);
      player.finished.catch(() => {}).finally(() => running.delete(player));
      return player;
    };
    const stopWork = () => {
      timers.forEach(clearTimeout);
      timers.clear();
      running.forEach((player) => player.cancel());
      running.clear();
      base.textContent = text;
      layers.forEach((layer) => { layer.style.opacity = '0'; });
    };

    // ── RGB slice burst (original three colored duplicates) ────────────────
    const rgbBurst = () => {
      if (!alive) return;
      const duration = (170 + Math.random() * 280) / speed;
      const sliceOf = () => {
        const top = Math.round(Math.random() * 82);
        const height = Math.round(4 + Math.random() * 20 * intensity);
        return `inset(${top}% 0 ${Math.max(0, 100 - top - height)}% 0)`;
      };
      const offsetX = (Math.random() - 0.5) * 18 * intensity;
      const offsetY = (Math.random() - 0.5) * 5 * intensity;
      const steps = Math.max(2, Math.round(3 + intensity));
      layers.forEach((layer, index) => {
        const direction = index === 1 ? -0.6 : index === 2 ? 0.45 : 1;
        animate(layer, [
          { opacity: 0.9, clipPath: sliceOf(), webkitClipPath: sliceOf(), transform: `translate(${offsetX * direction}px,${offsetY * direction}px)` },
          { opacity: 0.85, clipPath: sliceOf(), webkitClipPath: sliceOf(), transform: `translate(${-offsetX * direction * 0.6}px,${-offsetY * direction}px)`, offset: 0.5 },
          { opacity: 0, clipPath: 'inset(0 0 0 0)', webkitClipPath: 'inset(0 0 0 0)', transform: 'translate(0,0)' }
        ], { duration, delay: index * 18, easing: `steps(${steps}, end)`, fill: 'forwards' });
      });
      animate(base, [
        { transform: 'skewX(0deg)' },
        { transform: `skewX(${1.8 * intensity}deg) translateX(${offsetX * 0.2}px)`, offset: 0.33 },
        { transform: `skewX(${-1.4 * intensity}deg)`, offset: 0.66 },
        { transform: 'skewX(0deg)' }
      ], { duration, easing: `steps(${steps}, end)` });
      if (loop) later(rgbBurst, 520 + Math.random() * 1400);
    };

    // ── Digital noise scramble ──────────────────────────────────────────────
    const noiseBurst = () => {
      if (!alive) return;
      const duration = (320 + Math.random() * 320) / speed;
      const frameMs = 40 / speed;
      const totalFrames = Math.max(3, Math.round(duration / frameMs));
      let frame = 0;
      const tick = () => {
        if (!alive) return;
        frame += 1;
        const progress = frame / totalFrames;
        base.textContent = Array.from(text, (char) => {
          if (/^\s$/.test(char)) return char;
          return Math.random() > progress * (1.35 - Math.min(0.9, 0.3 * intensity))
            ? NOISE_CHARS[Math.floor(Math.random() * NOISE_CHARS.length)]
            : char;
        }).join('');
        if (frame < totalFrames) later(tick, frameMs);
        else {
          base.textContent = text;
          if (loop) later(noiseBurst, 620 + Math.random() * 1100);
        }
      };
      tick();
    };

    // ── CRT analog jitter with scanlines ────────────────────────────────────
    const crtBurst = () => {
      if (!alive) return;
      if (!scanline) {
        scanline = document.createElement('span');
        scanline.setAttribute('aria-hidden', 'true');
        scanline.style.cssText = `position:absolute;inset:0;z-index:6;pointer-events:none;border-radius:inherit;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,${0.13 * intensity}) 2px,rgba(0,0,0,${0.13 * intensity}) 4px);opacity:0;transition:opacity .2s ease;`;
        el.appendChild(scanline);
      }
      scanline.style.opacity = '1';
      const duration = (900 + Math.random() * 700) / speed;
      const jitter = 4 * intensity;
      animate(el, [
        { opacity: 1, filter: 'none', transform: 'none' },
        { opacity: 0.82, filter: 'brightness(1.35) hue-rotate(6deg)', transform: `translateX(${jitter}px)`, offset: 0.08 },
        { transform: `translateX(${-jitter}px)`, offset: 0.09 },
        { opacity: 1, filter: 'none', transform: 'none', offset: 0.1 },
        { opacity: 0.78, filter: 'brightness(.85) hue-rotate(-8deg)', transform: `skewX(${1.5 * intensity}deg)`, offset: 0.45 },
        { filter: 'none', transform: 'none', opacity: 1, offset: 0.46 },
        { opacity: 0.9, filter: 'brightness(1.2)', transform: `translateX(${-jitter * 0.5}px)`, offset: 0.72 },
        { transform: 'none', offset: 0.73 },
        { opacity: 1, filter: 'none', transform: 'none' }
      ], { duration, easing: 'linear' });
      later(() => {
        if (scanline) scanline.style.opacity = '0';
        if (loop && alive) later(crtBurst, 900 + Math.random() * 1500);
      }, duration);
    };

    const burst = () => {
      if (preset === 'noise') noiseBurst();
      else if (preset === 'crt') crtBurst();
      else rgbBurst();
    };

    let hoverEnter = null;
    let hoverLeave = null;
    let observer = null;
    if (trigger === 'hover') {
      hoverEnter = () => { alive = true; burst(); };
      hoverLeave = () => { stopWork(); };
      el.addEventListener('pointerenter', hoverEnter);
      el.addEventListener('pointerleave', hoverLeave);
    } else if (trigger === 'scroll' || trigger === 'view') {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => { if (entry.isIntersecting) burst(); });
      }, { threshold: 0.4 });
      observer.observe(el);
    } else {
      const rawDelay = Number(opts.delay ?? (preset === 'noise' ? 0.7 : 0.35));
      later(burst, rawDelay <= 10 ? rawDelay * 1000 : rawDelay);
    }

    return {
      el,
      type: 'glitch',
      replay: () => { stopWork(); alive = true; burst(); },
      pause: () => { alive = false; stopWork(); },
      resume: () => {
        if (alive) return;
        alive = true;
        later(burst, 120);
      },
      destroy: () => {
        alive = false;
        stopWork();
        if (hoverEnter) el.removeEventListener('pointerenter', hoverEnter);
        if (hoverLeave) el.removeEventListener('pointerleave', hoverLeave);
        observer?.disconnect();
        el.innerHTML = originalHTML;
        if (originalStyle == null) el.removeAttribute('style'); else el.setAttribute('style', originalStyle);
        restoreAttributes();
      }
    };
  },
  reduced(el) {
    const restore = snapshotAttributes(el, ['aria-label']);
    return { el, type: 'glitch', pause() {}, resume() {}, destroy: restore };
  }
};
