import { G, ST } from '../utils.js';

export default {
  create(el, opts) {
    const urls = Array.isArray(opts.urls) && opts.urls.length ? opts.urls : null;
    if (!urls && !opts.urlPrefix) return null;
    const gsap = G();
    const scrollTrigger = ST();
    if (!gsap || !scrollTrigger) return null;

    const frameCount = Math.max(1, Number(opts.frames ?? urls?.length ?? 100));
    const prefix = opts.urlPrefix || '';
    const extension = opts.extension || '.jpg';
    const padding = Number(opts.padding ?? 3);
    const original = {
      parent: el.parentNode,
      next: el.nextSibling,
      style: el.getAttribute('style')
    };

    const triggerWrap = document.createElement('div');
    triggerWrap.className = 'kt-scroll-sequence-wrap';
    triggerWrap.style.height = opts.scrollLength || `${Math.max(2, frameCount * Number(opts.vhPerFrame ?? 3))}vh`;
    original.parent.insertBefore(triggerWrap, el);
    triggerWrap.appendChild(el);

    el.style.position = 'sticky';
    // `top` offsets the pinned frame (e.g. below a fixed header); number → px.
    el.style.top = opts.top != null
      ? (typeof opts.top === 'number' ? `${opts.top}px` : String(opts.top))
      : '0';
    el.style.height = opts.height || '100vh';
    el.style.overflow = 'hidden';

    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'display:block;width:100%;height:100%;';
    el.appendChild(canvas);
    const context = canvas.getContext('2d');
    const images = new Array(frameCount);
    const loadStates = new Array(frameCount).fill('idle');
    const sequence = { frame: 0 };
    let width = 1;
    let height = 1;
    let dpr = 1;
    let requestedFrame = Math.round(sequence.frame);
    let renderedFrame = -1;
    const preloadRadius = Math.max(0, Math.floor(Number(opts.preloadRadius ?? 8) || 0));
    // Keep a wider decoded-image window than the preload window so normal
    // back-and-forth scrubbing does not thrash, while long sequences stop
    // retaining every frame ever visited until destroy().
    const retentionRadius = Math.max(preloadRadius + 2, preloadRadius * 2);

    const urlFor = (index) => urls?.[index] || `${prefix}${String(index + 1).padStart(padding, '0')}${extension}`;

    const releaseFrame = (index) => {
      const image = images[index];
      if (!image || loadStates[index] !== 'loaded') return;
      image.onload = null;
      image.onerror = null;
      images[index] = undefined;
      loadStates[index] = 'idle';
      if (renderedFrame === index) renderedFrame = -1;
    };

    const pruneFrames = (center) => {
      for (let index = 0; index < frameCount; index += 1) {
        if (Math.abs(index - center) <= retentionRadius) continue;
        releaseFrame(index);
      }
    };

    const loadFrame = (index) => {
      if (index < 0 || index >= frameCount || loadStates[index] !== 'idle') return;
      loadStates[index] = 'loading';
      const image = new Image();
      if (opts.crossOrigin) image.crossOrigin = opts.crossOrigin;
      image.decoding = 'async';
      image.onload = () => {
        loadStates[index] = 'loaded';
        images[index] = image;
        // A slow request can finish after the user has scrubbed far away. Do
        // not let that late decode silently grow the retained-frame window.
        if (Math.abs(index - requestedFrame) > retentionRadius) {
          releaseFrame(index);
          return;
        }
        if (Math.round(sequence.frame) === index || index === 0) render(index);
      };
      image.onerror = () => {
        loadStates[index] = 'error';
        opts.onError?.(index, image.src);
      };
      image.src = urlFor(index);
      images[index] = image;
    };

    const preloadAround = (index) => {
      for (let offset = -preloadRadius; offset <= preloadRadius; offset += 1) loadFrame(index + offset);
      pruneFrames(index);
    };

    const render = (index, force = false) => {
      const image = images[index];
      if (!image || loadStates[index] !== 'loaded' || !image.naturalWidth) {
        preloadAround(index);
        return;
      }
      // GSAP's scrub tween can call onUpdate many times while snap still rounds
      // to the same integer frame. Redrawing an identical decoded image wastes
      // a full-canvas clear + drawImage + user callback with no visual change.
      // Resize passes force=true because changing canvas dimensions clears it.
      if (!force && renderedFrame === index) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.imageSmoothingEnabled = true;
      const imageRatio = image.naturalWidth / image.naturalHeight;
      const boxRatio = width / height;
      let drawWidth;
      let drawHeight;
      let x;
      let y;
      if ((opts.fit || 'cover') === 'contain') {
        const ratio = Math.min(width / image.naturalWidth, height / image.naturalHeight);
        drawWidth = image.naturalWidth * ratio;
        drawHeight = image.naturalHeight * ratio;
      } else if (imageRatio > boxRatio) {
        drawHeight = height;
        drawWidth = height * imageRatio;
      } else {
        drawWidth = width;
        drawHeight = width / imageRatio;
      }
      x = (width - drawWidth) / 2;
      y = (height - drawHeight) / 2;
      context.drawImage(image, x * dpr, y * dpr, drawWidth * dpr, drawHeight * dpr);
      renderedFrame = index;
      opts.onFrame?.(index, image, canvas);
    };

    const resize = () => {
      const rect = el.getBoundingClientRect();
      width = Math.max(1, rect.width || window.innerWidth);
      height = Math.max(1, rect.height || window.innerHeight);
      dpr = Math.min(window.devicePixelRatio || 1, Number(opts.maxDpr ?? 2));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      render(Math.round(sequence.frame), true);
    };

    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(el);
    window.addEventListener('resize', resize);
    resize();
    loadFrame(0);
    preloadAround(0);

    const tween = gsap.to(sequence, {
      frame: frameCount - 1,
      snap: { frame: 1 },
      ease: 'none',
      scrollTrigger: {
        trigger: triggerWrap,
        start: opts.start || 'top top',
        end: opts.end || 'bottom bottom',
        scrub: opts.scrub ?? 0.5,
        invalidateOnRefresh: true
      },
      onUpdate: () => {
        const index = Math.round(sequence.frame);
        if (index === requestedFrame) return;
        requestedFrame = index;
        preloadAround(index);
        render(index);
      }
    });

    return {
      el,
      type: 'scrollSequence',
      pause: () => tween.pause(),
      resume: () => tween.resume(),
      destroy: () => {
        resizeObserver?.disconnect();
        window.removeEventListener('resize', resize);
        tween.scrollTrigger?.kill();
        tween.kill();
        images.forEach((image, index) => {
          if (!image) return;
          image.onload = null;
          image.onerror = null;
          images[index] = undefined;
        });
        canvas.remove();
        if (triggerWrap.parentNode) {
          triggerWrap.parentNode.insertBefore(el, triggerWrap);
          triggerWrap.remove();
        }
        if (original.style == null) el.removeAttribute('style'); else el.setAttribute('style', original.style);
        if (original.next && original.next.parentNode === original.parent) original.parent.insertBefore(el, original.next);
      }
    };
  },

  // Low-performance devices get the same static first-frame as reduced-motion —
  // no canvas, no per-frame decode (audit D-2).
  fallback(el, opts) { return this.reduced(el, opts); },
  reduced(el, opts) {
    const first = Array.isArray(opts.urls) && opts.urls.length
      ? opts.urls[0]
      : opts.urlPrefix
        ? `${opts.urlPrefix}${String(1).padStart(Number(opts.padding ?? 3), '0')}${opts.extension || '.jpg'}`
        : null;
    if (!first) return null;
    const style = el.getAttribute('style');
    el.style.backgroundImage = `url("${first}")`;
    el.style.backgroundSize = opts.fit || 'cover';
    el.style.backgroundPosition = 'center';
    return {
      el, type: 'scrollSequence', pause() {}, resume() {},
      destroy() { if (style == null) el.removeAttribute('style'); else el.setAttribute('style', style); }
    };
  }
};
