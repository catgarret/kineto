import { G, ST } from '../utils.js';

export default {
  create(el, opts) {
    const gsap = G();
    const scrollTrigger = ST();
    if (!gsap || !scrollTrigger) return null;

    const urls = Array.isArray(opts.urls) ? opts.urls : null;
    const frameCount = Math.max(1, Number(opts.frames ?? urls?.length ?? 100));
    const prefix = opts.urlPrefix || 'https://example.com/seq/frame_';
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

    const urlFor = (index) => urls?.[index] || `${prefix}${String(index + 1).padStart(padding, '0')}${extension}`;

    const loadFrame = (index) => {
      if (index < 0 || index >= frameCount || loadStates[index] !== 'idle') return;
      loadStates[index] = 'loading';
      const image = new Image();
      if (opts.crossOrigin) image.crossOrigin = opts.crossOrigin;
      image.decoding = 'async';
      image.onload = () => {
        loadStates[index] = 'loaded';
        images[index] = image;
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
      const radius = Number(opts.preloadRadius ?? 8);
      for (let offset = -radius; offset <= radius; offset += 1) loadFrame(index + offset);
    };

    const render = (index) => {
      const image = images[index];
      if (!image || loadStates[index] !== 'loaded' || !image.naturalWidth) {
        preloadAround(index);
        return;
      }
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
      opts.onFrame?.(index, image, canvas);
    };

    const resize = () => {
      const rect = el.getBoundingClientRect();
      width = Math.max(1, rect.width || window.innerWidth);
      height = Math.max(1, rect.height || window.innerHeight);
      dpr = Math.min(window.devicePixelRatio || 1, Number(opts.maxDpr ?? 2));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      render(Math.round(sequence.frame));
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
        images.forEach((image) => {
          if (image) { image.onload = null; image.onerror = null; }
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

  reduced(el, opts) {
    const first = Array.isArray(opts.urls)
      ? opts.urls[0]
      : `${opts.urlPrefix || 'https://example.com/seq/frame_'}${String(1).padStart(Number(opts.padding ?? 3), '0')}${opts.extension || '.jpg'}`;
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
