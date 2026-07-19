import { clamp, observeOnce } from '../utils.js';

const ANIMATED_EXTENSIONS = /\.(?:gif|apng|webp)(?:$|[?#])/i;

function sourceOf(el, opts = {}) {
  return opts.src || el.dataset.src || el.getAttribute('data-src') || el.currentSrc || el.getAttribute('src') || '';
}

function durationMs(value, fallbackSeconds) {
  const number = Number(value ?? fallbackSeconds);
  if (!Number.isFinite(number)) return fallbackSeconds * 1000;
  return number <= 30 ? number * 1000 : number;
}

/*
 * Pixel Mosaic (owner implementation, adapted from pixel-mosaic v1.2.6).
 * Pixel stages are real block sizes in CSS pixels (largest → 1px), rendered on
 * a canvas that redraws the live <img> every frame, so animated GIF/WebP/APNG
 * keep playing during the reveal. Discrete stages use equal time slices.
 */
function resolvePixelSteps(opts, width, height) {
  const shortest = Math.max(1, Math.min(width || 300, height || 200));
  const toBlock = (value) => (value <= 1 ? Math.max(1, Math.round(1 / Math.max(0.004, value))) : Math.round(value));

  if (Array.isArray(opts.steps) && opts.steps.length) {
    const list = opts.steps.map(Number).filter((value) => Number.isFinite(value) && value > 0).map(toBlock);
    if (list.length) return list.sort((a, b) => b - a);
  }

  const count = Math.max(2, Math.round(Number(opts.pixelStepCount ?? opts.stepCount ?? 8)));
  const hasRatio = opts.pixelStart != null || opts.pixelEnd != null;
  const largest = hasRatio
    ? clamp(toBlock(clamp(Number(opts.pixelStart ?? 0.035), 0.004, 1)), 2, 200)
    : clamp(Math.round(shortest / 6), 20, 96);
  const smallest = hasRatio ? toBlock(clamp(Number(opts.pixelEnd ?? 1), 0.01, 1)) : 1;

  const output = [];
  for (let index = 0; index < count; index += 1) {
    const ratio = index / Math.max(1, count - 1);
    const raw = largest * Math.pow(Math.max(1, smallest) / largest, ratio);
    let value = Math.max(smallest, Math.round(raw));
    if (output.length && value >= output[output.length - 1]) {
      value = Math.max(smallest, output[output.length - 1] - 1);
    }
    output.push(value);
  }
  output[output.length - 1] = smallest;
  return output;
}

// A 1px stage is indistinguishable from the original image, so it acts as the
// hand-off point instead of keeping the canvas alive.
function visibleMosaicSteps(steps) {
  if (steps.length > 1 && steps[steps.length - 1] <= 1) return steps.slice(0, -1);
  return steps.length ? steps : [2];
}

function coverMap(sourceWidth, sourceHeight, boxWidth, boxHeight) {
  const scale = Math.max(boxWidth / sourceWidth, boxHeight / sourceHeight);
  const sw = Math.min(sourceWidth, boxWidth / scale);
  const sh = Math.min(sourceHeight, boxHeight / scale);
  return { sx: (sourceWidth - sw) / 2, sy: (sourceHeight - sh) / 2, sw, sh };
}

function ensureWrapper(el, opts) {
  let wrapper = el.parentElement;
  let created = false;
  const originalWrapperStyle = wrapper?.getAttribute('style') ?? null;
  if (!wrapper?.classList.contains('kt-lazy-wrap')) {
    wrapper = document.createElement('span');
    wrapper.className = 'kt-lazy-wrap';
    el.parentNode?.insertBefore(wrapper, el);
    wrapper.appendChild(el);
    created = true;
  }
  const computed = getComputedStyle(wrapper);
  if (computed.position === 'static') wrapper.style.position = 'relative';
  wrapper.style.overflow = 'hidden';
  wrapper.style.display = opts.display || 'block';
  wrapper.style.lineHeight = '0';
  // The wrapper must occupy the same box as the image it replaces: fill the
  // parent when the parent already defines a box (fixes skeleton showing as a
  // thin bar inside aspect-ratio stages), otherwise fall back to aspect-ratio.
  const parentBox = wrapper.parentElement?.getBoundingClientRect();
  const ratio = opts.aspectRatio || el.getAttribute('data-aspect-ratio');
  const width = Number(el.getAttribute('width'));
  const height = Number(el.getAttribute('height'));
  wrapper.style.width = '100%';
  if (ratio) wrapper.style.aspectRatio = String(ratio).replace(':', ' / ');
  else if (width > 0 && height > 0) wrapper.style.aspectRatio = `${width} / ${height}`;
  else if (created && parentBox && parentBox.height > 2) wrapper.style.height = '100%';
  else if (wrapper.getBoundingClientRect().height < 2) wrapper.style.aspectRatio = '16 / 9';
  if (opts.height) wrapper.style.height = typeof opts.height === 'number' ? `${opts.height}px` : String(opts.height);
  return { wrapper, created, originalWrapperStyle };
}

function createLayer(wrapper, className, zIndex = 2) {
  const layer = document.createElement('span');
  layer.className = className;
  layer.setAttribute('aria-hidden', 'true');
  layer.style.cssText = `position:absolute;inset:0;z-index:${zIndex};display:block;overflow:hidden;pointer-events:none;border-radius:inherit;`;
  wrapper.appendChild(layer);
  return layer;
}

function createLiveImage(src, el, opts = {}) {
  const image = document.createElement('img');
  image.className = 'kt-lazy-live-image';
  image.alt = '';
  image.setAttribute('aria-hidden', 'true');
  image.loading = 'eager';
  image.decoding = 'async';
  if (opts.crossOrigin) image.crossOrigin = opts.crossOrigin;
  const srcset = opts.srcset || el.getAttribute('data-srcset') || el.getAttribute('srcset');
  const sizes = opts.sizes || el.getAttribute('sizes');
  if (srcset) image.srcset = srcset;
  if (sizes) image.sizes = sizes;
  image.src = src;
  image.style.cssText = `display:block;width:100%;height:100%;object-fit:${opts.objectFit || 'cover'};object-position:${opts.objectPosition || '50% 50%'};`;
  return image;
}

function createNoiseCanvas(wrapper, opts, zIndex = 4) {
  const canvas = document.createElement('canvas');
  canvas.className = 'kt-lazy-noise';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.width = Math.max(32, Number(opts.noiseWidth ?? 128));
  canvas.height = Math.max(18, Number(opts.noiseHeight ?? 72));
  canvas.style.cssText = `position:absolute;inset:0;width:100%;height:100%;z-index:${zIndex};pointer-events:none;mix-blend-mode:${opts.noiseBlend || 'soft-light'};opacity:0;border-radius:inherit;`;
  wrapper.appendChild(canvas);
  const context = canvas.getContext('2d', { alpha: true });
  let last = 0;
  let frames = 0;
  const fps = clamp(Number(opts.noiseFps ?? 24), 4, 60);
  const interval = 1000 / fps;
  const draw = (time = performance.now()) => {
    if (!context || time - last < interval) return;
    last = time;
    const frame = context.createImageData(canvas.width, canvas.height);
    const contrast = clamp(Number(opts.noiseContrast ?? 1), 0.1, 3);
    for (let index = 0; index < frame.data.length; index += 4) {
      const random = (Math.random() - 0.5) * 255 * contrast + 128;
      const value = clamp(Math.round(random), 0, 255);
      frame.data[index] = value;
      frame.data[index + 1] = value;
      frame.data[index + 2] = value;
      frame.data[index + 3] = 255;
    }
    context.putImageData(frame, 0, 0);
    frames += 1;
    canvas.dataset.frames = String(frames);
  };
  return { canvas, draw };
}

function maskFor(direction, progress, feather = 8, inverse = false) {
  const p = clamp(progress * 100, 0, 100);
  const soft = clamp(Number(feather), 0, 30);
  const before = clamp(p - soft, 0, 100);
  const after = clamp(p + soft, 0, 100);
  const to = direction === 'up' ? 'to top' : direction === 'left' ? 'to left' : direction === 'right' ? 'to right' : 'to bottom';
  if (!inverse) return `linear-gradient(${to}, #000 0%, #000 ${before}%, transparent ${after}%, transparent 100%)`;
  return `linear-gradient(${to}, transparent 0%, transparent ${before}%, #000 ${after}%, #000 100%)`;
}

function preload(src, el, opts) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    if (opts.crossOrigin) image.crossOrigin = opts.crossOrigin;
    const srcset = opts.srcset || el.getAttribute('data-srcset') || el.getAttribute('srcset');
    if (srcset) image.srcset = srcset;
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Kineto lazy image failed to load: ${src}`));
    image.src = src;
  });
}

export default {
  create(el, opts = {}) {
    const requested = opts.preset || opts.effect || 'fade';
    // zoom was a near-duplicate of blur-up; keep the API alive but route it.
    const effect = requested === 'noise' ? 'dissolve' : requested === 'zoom' ? 'blur-up' : requested;
    const src = sourceOf(el, opts);
    if (!src) return null;

    const original = {
      style: el.getAttribute('style'),
      src: el.getAttribute('src'),
      srcset: el.getAttribute('srcset'),
      sizes: el.getAttribute('sizes'),
      loading: el.getAttribute('loading'),
      decoding: el.getAttribute('decoding')
    };
    const { wrapper, created, originalWrapperStyle } = ensureWrapper(el, opts);

    el.loading = opts.nativeLazy === false ? 'eager' : 'lazy';
    el.decoding = 'async';
    el.style.display = 'block';
    el.style.width = '100%';
    el.style.height = '100%';
    el.style.objectFit = opts.objectFit || 'cover';
    el.style.objectPosition = opts.objectPosition || '50% 50%';

    const layers = [];
    const timers = new Set();
    let observer = null;
    let rafId = null;
    let destroyed = false;
    let paused = false;
    let started = false;
    let noise = null;

    const later = (callback, delay) => {
      const timer = setTimeout(() => {
        timers.delete(timer);
        if (!destroyed) callback();
      }, Math.max(0, Number(delay) || 0));
      timers.add(timer);
      return timer;
    };
    const removeLayers = () => {
      layers.splice(0).forEach((layer) => layer.remove());
      noise?.canvas.remove();
      noise = null;
    };
    const expose = () => {
      const srcset = opts.srcset || el.getAttribute('data-srcset');
      if (srcset) el.srcset = srcset;
      if (opts.sizes) el.sizes = opts.sizes;
      el.loading = 'eager';
      el.src = src;
      el.style.opacity = '1';
      el.style.filter = 'none';
      el.style.transform = 'none';
      el.style.clipPath = 'none';
      el.style.maskImage = 'none';
      el.style.webkitMaskImage = 'none';
    };
    const finish = () => {
      expose();
      removeLayers();
      opts.onProgress?.(1, el);
      opts.onLoad?.(el);
    };

    const setupSkeleton = () => {
      const variant = opts.skeletonVariant || opts.variant || 'shimmer';
      const layer = createLayer(wrapper, `kt-lazy-skeleton kt-lazy-skeleton-${variant}`, 5);
      const base = opts.skeletonColor || 'color-mix(in srgb, currentColor 9%, transparent)';
      const highlight = opts.skeletonHighlight || 'rgba(255,255,255,.45)';
      const speed = Math.max(0.3, Number(opts.skeletonSpeed ?? 1.5));
      layer.style.backgroundColor = base;
      if (variant === 'pulse') {
        layer.style.animation = `kt-skeleton-pulse ${speed}s ease-in-out infinite`;
      } else {
        // Diagonal sweep with a soft band, closer to product skeletons.
        layer.style.backgroundImage = `linear-gradient(${Number(opts.skeletonAngle ?? 100)}deg,transparent 32%,${highlight} 50%,transparent 68%)`;
        layer.style.backgroundSize = '250% 100%';
        layer.style.animation = `kt-shimmer ${speed}s cubic-bezier(.4,.2,.6,.8) infinite`;
      }
      if (opts.skeletonIcon !== false) {
        const icon = document.createElement('span');
        icon.className = 'kt-lazy-skeleton-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.style.cssText = 'position:absolute;left:50%;top:50%;width:15%;max-width:64px;min-width:28px;aspect-ratio:1;transform:translate(-50%,-50%);opacity:.32;';
        icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.8" cy="8.8" r="1.9"/><path d="m21 15.2-3.6-3.6a1.8 1.8 0 0 0-2.6 0L6 21"/></svg>';
        layer.appendChild(icon);
      }
      layers.push(layer);
      el.style.opacity = '0';
      return layer;
    };

    const run = async () => {
      if (started || destroyed) return;
      started = true;
      const startedAt = performance.now();
      let image;
      try {
        image = await preload(src, el, opts);
      } catch (error) {
        removeLayers();
        if (opts.fallbackSrc) el.src = opts.fallbackSrc;
        else if (original.src == null) el.removeAttribute('src');
        else el.setAttribute('src', original.src);
        el.style.opacity = '1';
        opts.onError?.(error, el);
        return;
      }
      const minDuration = Math.max(0, Number(opts.minDuration ?? 0));
      const remaining = minDuration - (performance.now() - startedAt);
      if (remaining > 0) await new Promise((resolve) => later(resolve, remaining));
      if (destroyed) return;

      if (effect === 'skeleton') {
        const skeleton = layers[0] || setupSkeleton();
        expose();
        const fade = Math.max(0, Number(opts.fadeDuration ?? opts.duration ?? 0.45));
        el.style.transform = 'scale(1.015)';
        el.style.transition = `opacity ${fade}s ease, transform ${Math.max(fade, 0.5)}s cubic-bezier(.22,.8,.3,1)`;
        skeleton.style.transition = `opacity ${fade * 0.8}s ease`;
        requestAnimationFrame(() => {
          el.style.opacity = '1';
          el.style.transform = 'scale(1)';
          skeleton.style.opacity = '0';
        });
        later(removeLayers, fade * 1000 + 60);
        opts.onLoad?.(el, image);
        return;
      }

      if (effect === 'fade') {
        el.src = src;
        el.style.opacity = '0';
        el.style.transition = `opacity ${Math.max(0, Number(opts.duration ?? 0.7))}s ${opts.ease || 'ease'}`;
        requestAnimationFrame(() => { el.style.opacity = '1'; });
        opts.onLoad?.(el, image);
        return;
      }

      if (effect === 'blur-up') {
        el.src = src;
        el.style.opacity = '1';
        el.style.filter = `blur(${Math.max(0, Number(opts.blur ?? 18))}px)`;
        el.style.transform = `scale(${Math.max(1, Number(opts.startScale ?? 1.06))})`;
        const duration = Math.max(0, Number(opts.duration ?? 0.85));
        requestAnimationFrame(() => {
          el.style.transition = `filter ${duration}s ease,transform ${duration}s cubic-bezier(.22,.8,.3,1)`;
          el.style.filter = 'blur(0px)';
          el.style.transform = 'scale(1)';
        });
        opts.onLoad?.(el, image);
        return;
      }

      if (effect === 'polaroid') {
        // Instant-photo development: overexposed, washed out and slightly
        // blurred, settling into full color inside a paper frame.
        el.src = src;
        const frameEnabled = opts.frame !== false;
        let frame = null;
        if (frameEnabled) {
          frame = createLayer(wrapper, 'kt-lazy-polaroid-frame', 6);
          const frameWidth = `clamp(6px, 4.5%, 18px)`;
          frame.style.cssText += `border:${frameWidth} solid ${opts.frameColor || '#fbfaf7'};border-bottom-width:calc(${frameWidth} * 3.2);box-shadow:inset 0 0 8px rgba(0,0,0,.12);`;
          layers.push(frame);
        }
        const duration = Math.max(0.2, Number(opts.duration ?? 2.4));
        el.style.opacity = '1';
        el.style.filter = 'brightness(2.1) saturate(.05) contrast(.72) sepia(.28) blur(7px)';
        el.style.transform = `rotate(${Number(opts.rotate ?? -2)}deg) scale(.965)`;
        wrapper.style.transition = 'none';
        requestAnimationFrame(() => requestAnimationFrame(() => {
          el.style.transition = `filter ${duration}s cubic-bezier(.3,.1,.25,1),transform ${Math.min(duration, 1.1)}s cubic-bezier(.34,1.4,.44,1)`;
          el.style.filter = 'none';
          el.style.transform = 'none';
        }));
        later(() => { if (opts.keepFrame !== true) finish(); else { expose(); opts.onLoad?.(el, image); } }, duration * 1000 + 120);
        return;
      }

      if (effect === 'crt') {
        // Old CRT / brown-tube TV power-on. A bright line snaps open, the
        // picture expands vertically out of it with a bloom, then settles.
        // A faint scanline overlay (on by default) sells the tube look.
        el.src = src;
        const duration = Math.max(0.3, Number(opts.duration ?? 1.1));
        el.style.opacity = '1';
        el.style.transformOrigin = 'center';
        el.style.willChange = 'transform, filter, opacity';
        el.style.animation = `kt-lazy-crt ${duration}s cubic-bezier(.2,.7,.2,1) both`;
        // The bright electron-beam line + a brief white bloom = authentic power-on.
        const beam = createLayer(wrapper, 'kt-lazy-crt-beam', 7);
        beam.style.cssText += 'pointer-events:none;top:50%;bottom:auto;height:2px;transform:translateY(-50%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.85) 16%,#fff 50%,rgba(255,255,255,.85) 84%,transparent);box-shadow:0 0 12px 2px rgba(255,255,255,.5);'
          + `animation:kt-lazy-crt-beam ${duration}s ease-out both;`;
        layers.push(beam);
        const bloom = createLayer(wrapper, 'kt-lazy-crt-bloom', 8);
        bloom.style.cssText += `pointer-events:none;background:#fff;animation:kt-lazy-crt-bloom ${duration}s ease-out both;`;
        layers.push(bloom);
        if (opts.frame !== false) {
          const scan = createLayer(wrapper, 'kt-lazy-crt-scan', 5);
          scan.style.cssText += 'pointer-events:none;background:repeating-linear-gradient(to bottom,rgba(0,0,0,.09) 0,rgba(0,0,0,.09) 1px,transparent 1px,transparent 3px);mix-blend-mode:multiply;opacity:0;'
            // Stays hidden while the picture is still a thin line (no grey flash),
            // then gently fades in and back out — no abrupt on/off.
            + `animation:kt-lazy-crt-scan ${duration}s ease both;`;
          layers.push(scan);
          // Black roll bar sweeping up/down (vertical-hold rolling) as it powers on.
          const roll = createLayer(wrapper, 'kt-lazy-crt-roll', 6);
          roll.style.cssText += 'pointer-events:none;top:0;bottom:auto;height:60%;background:linear-gradient(to bottom,transparent 0%,rgba(0,0,0,.18) 35%,rgba(0,0,0,.28) 50%,rgba(0,0,0,.18) 65%,transparent 100%);filter:blur(3px);'
            + `animation:kt-lazy-crt-roll ${duration}s linear both;`;
          layers.push(roll);
        }
        later(() => { el.style.animation = ''; el.style.willChange = ''; finish(); }, duration * 1000 + 160);
        return;
      }

      if (effect === 'pixelate') {
        el.src = src;
        el.style.opacity = '1';
        const layer = createLayer(wrapper, 'kt-lazy-pixelate-layer', 3);
        const canvas = document.createElement('canvas');
        canvas.className = 'kt-lazy-pixelate-canvas';
        canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
        layer.appendChild(canvas);
        layers.push(layer);
        const context = canvas.getContext('2d', { alpha: true, desynchronized: true });
        const small = document.createElement('canvas');
        const smallContext = small.getContext('2d', { alpha: true });

        const rect = wrapper.getBoundingClientRect();
        const steps = visibleMosaicSteps(resolvePixelSteps(opts, rect.width, rect.height));
        const stepDuration = Math.max(0, Number(opts.stepDuration ?? 0));
        const total = stepDuration > 0 ? stepDuration * steps.length : durationMs(opts.duration, 1.25);
        const delayMs = Math.max(0, Number(opts.delay ?? 100));
        const hold = Math.max(0, Number(opts.holdDuration ?? 0));
        const maxDpr = clamp(Number(opts.maxDpr ?? 2), 0.5, 4);
        const fps = clamp(Number(opts.renderFps ?? 60), 4, 120);
        const interval = 1000 / fps;

        let cssWidth = 0;
        let cssHeight = 0;
        const sync = () => {
          const box = wrapper.getBoundingClientRect();
          cssWidth = Math.max(1, box.width);
          cssHeight = Math.max(1, box.height);
          const dpr = clamp(window.devicePixelRatio || 1, 1, maxDpr);
          const pixelWidth = Math.max(1, Math.round(cssWidth * dpr));
          const pixelHeight = Math.max(1, Math.round(cssHeight * dpr));
          if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
            canvas.width = pixelWidth;
            canvas.height = pixelHeight;
          }
          context.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        // Drawing the live <img> each frame keeps GIF/APNG/animated WebP moving.
        const draw = (pixelSize) => {
          const drawable = el.complete && el.naturalWidth ? el : image;
          const sourceWidth = drawable.naturalWidth;
          const sourceHeight = drawable.naturalHeight;
          if (!sourceWidth || !sourceHeight) return;
          const smallWidth = Math.max(1, Math.ceil(cssWidth / Math.max(1, pixelSize)));
          const smallHeight = Math.max(1, Math.ceil(cssHeight / Math.max(1, pixelSize)));
          if (small.width !== smallWidth || small.height !== smallHeight) {
            small.width = smallWidth;
            small.height = smallHeight;
          }
          const map = coverMap(sourceWidth, sourceHeight, cssWidth, cssHeight);
          smallContext.clearRect(0, 0, smallWidth, smallHeight);
          smallContext.imageSmoothingEnabled = true;
          try {
            smallContext.drawImage(drawable, map.sx, map.sy, map.sw, map.sh, 0, 0, smallWidth, smallHeight);
          } catch (_error) {
            return;
          }
          context.clearRect(0, 0, cssWidth, cssHeight);
          context.imageSmoothingEnabled = false;
          context.drawImage(small, 0, 0, smallWidth, smallHeight, 0, 0, cssWidth, cssHeight);
        };

        let startTime = null;
        let pausedAt = null;
        let lastDraw = -Infinity;
        let lastStage = -1;
        const frame = (time) => {
          if (destroyed) return;
          if (paused) {
            if (pausedAt == null) pausedAt = time;
            rafId = requestAnimationFrame(frame);
            return;
          }
          if (pausedAt != null && startTime != null) {
            startTime += time - pausedAt;
            pausedAt = null;
          }
          if (startTime == null) startTime = time;
          const progress = clamp((time - startTime) / Math.max(1, total), 0, 1);
          const index = progress >= 1 ? steps.length - 1 : Math.min(steps.length - 1, Math.floor(progress * steps.length));
          // Never skip a stage: every configured pixel step renders and
          // reports progress at least once, even under slow frames.
          while (lastStage < index) {
            lastStage += 1;
            sync();
            draw(steps[lastStage]);
            lastDraw = time;
            opts.onProgress?.(clamp((lastStage + 1) / (steps.length + 1), 0, 1), el);
          }
          if (progress >= 1) {
            later(finish, hold);
            return;
          }
          if (time - lastDraw >= interval) {
            sync();
            draw(steps[index]);
            lastDraw = time;
          }
          rafId = requestAnimationFrame(frame);
        };
        sync();
        draw(steps[0]);
        later(() => { rafId = requestAnimationFrame(frame); }, delayMs);
        return;
      }

      if (effect === 'flicker') {
        // Callisto-style glitch load: the image strobes on through horizontal
        // slice displacements and blackout flashes on a canvas, then settles.
        el.src = src;
        el.style.opacity = '1';
        const layer = createLayer(wrapper, 'kt-lazy-flicker-layer', 3);
        layer.style.background = opts.flickerBackground || '#000';
        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
        layer.appendChild(canvas);
        layers.push(layer);
        const context = canvas.getContext('2d', { alpha: false });
        const duration = Math.max(120, durationMs(opts.duration, 1.15));
        const strength = clamp(Number(opts.glitchStrength ?? 1), 0.1, 3);
        const slices = Math.max(2, Math.round(Number(opts.sliceCount ?? 7)));
        const delayMs = Math.max(0, Number(opts.delay ?? 60));
        let startTime = null;
        let pausedAt = null;
        const sync = () => {
          const box = wrapper.getBoundingClientRect();
          const dpr = clamp(window.devicePixelRatio || 1, 1, clamp(Number(opts.maxDpr ?? 2), 0.5, 4));
          const pw = Math.max(1, Math.round(box.width * dpr));
          const ph = Math.max(1, Math.round(box.height * dpr));
          if (canvas.width !== pw || canvas.height !== ph) { canvas.width = pw; canvas.height = ph; }
        };
        const drawGlitch = (progress) => {
          const drawable = el.complete && el.naturalWidth ? el : image;
          if (!drawable.naturalWidth) return;
          const w = canvas.width;
          const h = canvas.height;
          const map = coverMap(drawable.naturalWidth, drawable.naturalHeight, w, h);
          context.fillStyle = '#000';
          context.fillRect(0, 0, w, h);
          // Blackout flash early on, less often as it settles.
          if (Math.random() < (1 - progress) * 0.28) return;
          const amp = (1 - progress) * strength;
          context.globalAlpha = 1;
          for (let index = 0; index < slices; index += 1) {
            const bandY = Math.floor((index / slices) * h);
            const bandH = Math.ceil(h / slices);
            const offset = Math.round((Math.random() - 0.5) * w * 0.12 * amp * (Math.random() < 0.4 ? 1 : 0.15));
            context.drawImage(
              drawable,
              map.sx, map.sy + (bandY / h) * map.sh, map.sw, (bandH / h) * map.sh,
              offset, bandY, w, bandH
            );
          }
          // Ghost pass for a subtle chromatic double-exposure.
          if (amp > 0.15 && Math.random() < 0.6) {
            context.globalAlpha = 0.18 * amp;
            context.drawImage(drawable, map.sx, map.sy, map.sw, map.sh, Math.round(8 * amp), 0, w, h);
            context.globalAlpha = 1;
          }
        };
        const frame = (time) => {
          if (destroyed) return;
          if (paused) {
            if (pausedAt == null) pausedAt = time;
            rafId = requestAnimationFrame(frame);
            return;
          }
          if (pausedAt != null && startTime != null) { startTime += time - pausedAt; pausedAt = null; }
          if (startTime == null) startTime = time;
          const progress = clamp((time - startTime) / duration, 0, 1);
          sync();
          drawGlitch(progress);
          opts.onProgress?.(progress, el);
          if (progress < 1) rafId = requestAnimationFrame(frame);
          else finish();
        };
        later(() => { rafId = requestAnimationFrame(frame); }, delayMs);
        return;
      }

      if (effect === 'print' || effect === 'dissolve') {
        el.src = src;
        el.style.opacity = '0';
        const base = createLayer(wrapper, `kt-lazy-${effect}-base`, 2);
        const baseImage = createLiveImage(src, el, opts);
        base.appendChild(baseImage);
        layers.push(base);
        let sharp = null;
        let sharpImage = null;
        let edge = null;
        if (effect === 'print') {
          sharp = createLayer(wrapper, 'kt-lazy-print-sharp', 3);
          sharpImage = createLiveImage(src, el, opts);
          sharp.appendChild(sharpImage);
          layers.push(sharp);
          // Soft printing edge: a faint, wide luminance lift that travels with
          // the scan front. Deliberately subtle — no neon line.
          edge = createLayer(wrapper, 'kt-lazy-print-edge', 5);
          edge.style.mixBlendMode = 'soft-light';
          layers.push(edge);
        }
        noise = createNoiseCanvas(wrapper, opts, 4);
        const duration = Math.max(50, durationMs(opts.duration, effect === 'print' ? 2.2 : 1.55));
        const delay = Math.max(0, Number(opts.delay ?? 100));
        const blur = Math.max(0, Number(opts.blur ?? (effect === 'print' ? 16 : 16)));
        const noiseOpacity = clamp(Number(opts.noise ?? (effect === 'print' ? 0.3 : 0.48)), 0, 1);
        const direction = opts.direction || 'down';
        const feather = Number(opts.feather ?? (effect === 'print' ? 12 : 8));
        let startTime = null;
        let pausedAt = null;
        const frame = (time) => {
          if (destroyed) return;
          if (paused) {
            if (pausedAt == null) pausedAt = time;
            rafId = requestAnimationFrame(frame);
            return;
          }
          if (pausedAt != null && startTime != null) {
            startTime += time - pausedAt;
            pausedAt = null;
          }
          if (startTime == null) startTime = time;
          const raw = clamp((time - startTime) / duration, 0, 1);
          const eased = 1 - Math.pow(1 - raw, 2.2);
          noise.draw(time);
          if (effect === 'print') {
            // Ease the scan itself so the head accelerates then settles.
            const scan = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
            const remainingBlur = blur * (1 - raw * 0.45);
            baseImage.style.filter = `blur(${remainingBlur}px) contrast(${1 + (1 - raw) * 0.1}) brightness(${1 + (1 - raw) * 0.06})`;
            sharp.style.maskImage = maskFor(direction, scan, feather, false);
            sharp.style.webkitMaskImage = sharp.style.maskImage;
            noise.canvas.style.maskImage = maskFor(direction, scan, feather, true);
            noise.canvas.style.webkitMaskImage = noise.canvas.style.maskImage;
            noise.canvas.style.opacity = String(noiseOpacity * (1 - raw * 0.5));
            const to = direction === 'up' ? 'to top' : direction === 'left' ? 'to left' : direction === 'right' ? 'to right' : 'to bottom';
            const p = clamp(scan * 100, 0, 100);
            const band = clamp(Number(opts.edgeWidth ?? 9), 2, 30);
            edge.style.opacity = raw >= 1 ? '0' : '1';
            edge.style.background = `linear-gradient(${to}, transparent ${clamp(p - band, 0, 100)}%, rgba(255,255,255,${clamp(Number(opts.edgeOpacity ?? 0.5), 0, 1)}) ${p}%, transparent ${clamp(p + band * 0.4, 0, 100)}%)`;
          } else {
            baseImage.style.filter = `blur(${blur * (1 - eased)}px) contrast(${1 + (1 - eased) * 0.22})`;
            noise.canvas.style.opacity = String(noiseOpacity * Math.pow(1 - eased, 1.2));
          }
          opts.onProgress?.(raw, el);
          if (raw < 1) rafId = requestAnimationFrame(frame);
          else finish();
        };
        later(() => { rafId = requestAnimationFrame(frame); }, delay);
        return;
      }

      expose();
      opts.onLoad?.(el, image);
    };

    if (effect === 'skeleton') setupSkeleton();
    else if (!['blur-up', 'polaroid', 'pixelate'].includes(effect)) el.style.opacity = '0';

    observer = observeOnce(el, run, {
      threshold: Number(opts.threshold ?? 0.05),
      rootMargin: opts.rootMargin || '200px 0px'
    });

    return {
      el,
      type: 'lazy',
      get animatedMedia() { return opts.animated === true || ANIMATED_EXTENSIONS.test(src); },
      replay() {
        removeLayers();
        started = false;
        if (effect === 'skeleton') setupSkeleton();
        run();
      },
      pause() { paused = true; },
      resume() { paused = false; },
      destroy() {
        destroyed = true;
        paused = false;
        observer?.disconnect();
        if (rafId != null) cancelAnimationFrame(rafId);
        timers.forEach(clearTimeout);
        timers.clear();
        removeLayers();
        if (created && wrapper.parentNode) {
          wrapper.parentNode.insertBefore(el, wrapper);
          wrapper.remove();
        } else if (!created) {
          if (originalWrapperStyle == null) wrapper.removeAttribute('style');
          else wrapper.setAttribute('style', originalWrapperStyle);
        }
        const restore = (name, value) => value == null ? el.removeAttribute(name) : el.setAttribute(name, value);
        restore('style', original.style);
        restore('src', original.src);
        restore('srcset', original.srcset);
        restore('sizes', original.sizes);
        restore('loading', original.loading);
        restore('decoding', original.decoding);
      }
    };
  },

  reduced(el, opts = {}) {
    const originalStyle = el.getAttribute('style');
    const originalSrc = el.getAttribute('src');
    const src = sourceOf(el, opts);
    if (src) el.src = src;
    el.style.opacity = '1';
    el.style.filter = 'none';
    el.style.transform = 'none';
    return {
      el,
      type: 'lazy',
      pause() {},
      resume() {},
      destroy() {
        if (originalStyle == null) el.removeAttribute('style'); else el.setAttribute('style', originalStyle);
        if (originalSrc == null) el.removeAttribute('src'); else el.setAttribute('src', originalSrc);
      }
    };
  }
};
