const entries = new Set();
let manager = null;

function sourceOf(el, opts = {}) {
  return opts.src || el.dataset.src || el.getAttribute('data-src') || el.getAttribute('href') || (el.tagName === 'IMG' ? el.currentSrc || el.src : '') || el.querySelector?.('img')?.currentSrc || el.querySelector?.('img')?.src || '';
}

function createButton(className, label, text) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.setAttribute('aria-label', label);
  button.textContent = text;
  return button;
}

function createManager() {
  const root = document.createElement('div');
  root.id = 'kt-lightbox';
  root.className = 'kt-lightbox';
  root.hidden = true;
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'Media viewer');
  // Stay below Kineto cursors (default z 2147483000) so the custom pointer
  // remains visible above the dimmed backdrop.
  root.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;margin:0;padding:0;z-index:2147482000;display:none;overflow:hidden;';

  if (!document.getElementById('kt-lightbox-style')) {
    const style = document.createElement('style');
    style.id = 'kt-lightbox-style';
    style.textContent = `
      .kt-lightbox button{transition:background-color .18s ease,border-color .18s ease,transform .18s ease,opacity .18s ease;}
      .kt-lightbox .kt-lightbox-toolbar button:hover:not(:disabled){background:rgba(255,255,255,.16)!important;border-color:rgba(255,255,255,.3)!important;}
      .kt-lightbox .kt-lightbox-toolbar button:disabled{opacity:.32;cursor:default;}
      .kt-lightbox .kt-lightbox-prev:hover,.kt-lightbox .kt-lightbox-next:hover{background:rgba(255,255,255,.14)!important;transform:translateY(-50%) scale(1.06);}
      .kt-lightbox .kt-lightbox-stage.is-zoomed{cursor:grab;}
      .kt-lightbox .kt-lightbox-stage.is-panning{cursor:grabbing;}
      @media (max-width: 760px) {
        .kt-lightbox .kt-lightbox-toolbar{padding:12px max(16px, env(safe-area-inset-right)) 10px max(16px, env(safe-area-inset-left));justify-content:space-between;}
        /* On narrow screens the absolutely-centered counter overlaps the zoom /
           close controls — drop it back into flow so space-between separates them. */
        .kt-lightbox .kt-lightbox-counter{position:static !important;left:auto !important;top:auto !important;transform:none !important;}
        .kt-lightbox .kt-lightbox-toolbar button{min-width:34px;height:34px;padding:0 8px;}
        .kt-lightbox .kt-lightbox-zoom-out,.kt-lightbox .kt-lightbox-zoom-in,.kt-lightbox .kt-lightbox-close{width:34px;padding:0;aspect-ratio:1;}
        .kt-lightbox .kt-lightbox-prev{left:max(10px, env(safe-area-inset-left)) !important;}
        .kt-lightbox .kt-lightbox-next{right:max(10px, env(safe-area-inset-right)) !important;}
        .kt-lightbox .kt-lightbox-info{padding-bottom:calc(22px + env(safe-area-inset-bottom)) !important;}
      }
    `;
    document.head.appendChild(style);
  }

  const backdrop = document.createElement('button');
  backdrop.type = 'button';
  backdrop.className = 'kt-lightbox-backdrop';
  backdrop.setAttribute('aria-label', 'Close viewer');
  // Visual styling reads CSS custom properties first so designers can retheme
  // the viewer from a stylesheet (.kt-lightbox{--kt-lightbox-*:...}) without
  // touching JS. Options still win when passed explicitly.
  backdrop.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;margin:0;padding:0;background:var(--kt-lightbox-backdrop,rgba(10,10,14,.88));backdrop-filter:blur(var(--kt-lightbox-backdrop-blur,20px)) saturate(1.15);-webkit-backdrop-filter:blur(var(--kt-lightbox-backdrop-blur,20px)) saturate(1.15);cursor:zoom-out;';

  const shell = document.createElement('div');
  shell.className = 'kt-lightbox-shell';
  shell.style.cssText = 'position:absolute;inset:0;display:grid;grid-template-rows:auto minmax(0,1fr) auto;pointer-events:none;color:white;';

  const toolbar = document.createElement('div');
  toolbar.className = 'kt-lightbox-toolbar';
  toolbar.style.cssText = 'position:relative;z-index:5;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 16px;pointer-events:auto;';
  const counter = document.createElement('span');
  counter.className = 'kt-lightbox-counter';
  counter.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font:600 13px/1 ui-monospace,monospace;letter-spacing:.08em;opacity:.72;';
  const actions = document.createElement('div');
  actions.className = 'kt-lightbox-actions';
  actions.style.cssText = 'display:flex;align-items:center;gap:6px;';
  const zoomOut = createButton('kt-lightbox-zoom-out', 'Zoom out', '−');
  const zoomReset = createButton('kt-lightbox-zoom-reset', 'Reset zoom', '100%');
  const zoomIn = createButton('kt-lightbox-zoom-in', 'Zoom in', '+');
  const closeButton = createButton('kt-lightbox-close', 'Close viewer', '×');
  [zoomOut, zoomReset, zoomIn, closeButton].forEach((button) => {
    button.style.cssText = 'min-width:38px;height:38px;padding:0 10px;border:1px solid var(--kt-lightbox-button-border,rgba(255,255,255,.14));border-radius:var(--kt-lightbox-button-radius,11px);background:var(--kt-lightbox-button-bg,rgba(255,255,255,.08));color:var(--kt-lightbox-button-color,white);font:600 14px/1 sans-serif;backdrop-filter:blur(12px);cursor:pointer;';
  });
  closeButton.style.fontSize = '24px';
  closeButton.style.marginLeft = '8px';
  actions.append(zoomOut, zoomReset, zoomIn, closeButton);
  actions.style.marginLeft = 'auto';
  toolbar.append(counter, actions);

  const stage = document.createElement('div');
  stage.className = 'kt-lightbox-stage';
  stage.style.cssText = 'position:relative;min-width:0;min-height:0;display:grid;place-items:center;overflow:hidden;pointer-events:auto;touch-action:none;';
  // Image and its caption travel together so the title/description sit right
  // under the picture instead of hugging the bottom of the screen.
  const stageContent = document.createElement('div');
  stageContent.className = 'kt-lightbox-stage-content';
  stageContent.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:16px;max-width:100%;max-height:100%;min-height:0;';
  const mediaHost = document.createElement('div');
  mediaHost.className = 'kt-lightbox-media-host';
  mediaHost.style.cssText = 'position:relative;display:grid;place-items:center;max-width:100%;min-height:0;will-change:transform;transform-origin:center;';
  const image = document.createElement('img');
  image.className = 'kt-lightbox-image';
  image.alt = '';
  image.style.cssText = 'display:block;max-width:min(94vw,1800px);max-height:calc(100vh - 230px);width:auto;height:auto;object-fit:contain;border-radius:var(--kt-lightbox-radius,4px);user-select:none;-webkit-user-drag:none;';
  mediaHost.appendChild(image);
  stageContent.appendChild(mediaHost);
  stage.appendChild(stageContent);

  const previous = createButton('kt-lightbox-prev', 'Previous item', '‹');
  const next = createButton('kt-lightbox-next', 'Next item', '›');
  [previous, next].forEach((button) => {
    button.style.cssText = 'position:absolute;top:50%;z-index:4;width:48px;height:48px;border:1px solid var(--kt-lightbox-button-border,rgba(255,255,255,.14));border-radius:999px;background:var(--kt-lightbox-button-bg,rgba(255,255,255,.08));backdrop-filter:blur(10px);color:var(--kt-lightbox-button-color,white);font:300 30px/1 sans-serif;transform:translateY(-50%);cursor:pointer;pointer-events:auto;display:grid;place-items:center;padding-bottom:4px;';
    stage.appendChild(button);
  });
  previous.style.left = '14px';
  next.style.right = '14px';

  // Caption lives with the image (title/description right under it); the
  // bottom bar keeps only the metadata, floated up from the screen edge.
  const textInfo = document.createElement('div');
  textInfo.className = 'kt-lightbox-caption';
  textInfo.style.cssText = 'max-width:min(860px,92vw);text-align:center;flex:0 0 auto;transition:opacity .25s ease;';
  const title = document.createElement('strong');
  title.className = 'kt-lightbox-title';
  title.style.cssText = 'display:block;font:650 15px/1.4 sans-serif;';
  const description = document.createElement('span');
  description.className = 'kt-lightbox-description';
  description.style.cssText = 'display:block;margin-top:4px;opacity:.68;font:400 13px/1.45 sans-serif;';
  textInfo.append(title, description);
  stageContent.appendChild(textInfo);
  const info = document.createElement('div');
  info.className = 'kt-lightbox-info';
  info.style.cssText = 'position:relative;z-index:5;display:flex;flex-direction:column;align-items:center;padding:16px 18px 26px;pointer-events:none;text-align:center;';
  const meta = document.createElement('span');
  meta.className = 'kt-lightbox-meta';
  meta.style.cssText = 'font:500 11px/1.4 ui-monospace,monospace;opacity:.55;text-align:center;';
  info.append(meta);

  const minimap = document.createElement('div');
  minimap.className = 'kt-lightbox-minimap';
  minimap.hidden = true;
  minimap.style.cssText = 'position:absolute;right:18px;bottom:86px;z-index:6;width:140px;height:90px;border:1px solid rgba(255,255,255,.25);border-radius:8px;overflow:hidden;background:#111;pointer-events:none;box-shadow:0 8px 30px rgba(0,0,0,.35);';
  const miniImage = document.createElement('img');
  miniImage.alt = '';
  miniImage.style.cssText = 'width:100%;height:100%;object-fit:contain;opacity:.65;';
  const miniViewport = document.createElement('span');
  miniViewport.style.cssText = 'position:absolute;border:1px solid white;background:rgba(255,255,255,.08);';
  minimap.append(miniImage, miniViewport);

  const custom = document.createElement('div');
  custom.className = 'kt-lightbox-custom-ui';
  custom.style.pointerEvents = 'auto';
  toolbar.prepend(custom);

  shell.append(toolbar, stage, info);
  root.append(backdrop, shell, minimap);
  document.body.appendChild(root);

  let activeEntry = null;
  let activeList = [];
  let activeIndex = 0;
  let previousOverflow = '';
  let previousFocus = null;
  let scale = 1;
  let x = 0;
  let y = 0;
  let dragging = false;
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let originX = 0;
  let originY = 0;
  let lazyInstance = null;

  const controls = { root, backdrop, shell, toolbar, stage, image, closeButton, previous, next, zoomIn, zoomOut, zoomReset, info, title, description, meta, minimap, custom, counter };

  const updateMinimap = () => {
    const show = activeEntry?.minimap !== false && scale > 1.02;
    minimap.hidden = !show;
    if (!show) return;
    const width = clamp(100 / scale, 12, 100);
    const height = clamp(100 / scale, 12, 100);
    const maxX = Math.max(1, stage.clientWidth * (scale - 1) / 2);
    const maxY = Math.max(1, stage.clientHeight * (scale - 1) / 2);
    const left = clamp(50 - width / 2 - x / (maxX * 2) * (100 - width), 0, 100 - width);
    const top = clamp(50 - height / 2 - y / (maxY * 2) * (100 - height), 0, 100 - height);
    miniViewport.style.width = `${width}%`;
    miniViewport.style.height = `${height}%`;
    miniViewport.style.left = `${left}%`;
    miniViewport.style.top = `${top}%`;
  };

  const applyTransform = () => {
    const maxPanX = Math.max(0, stage.clientWidth * (scale - 1) / 2);
    const maxPanY = Math.max(0, stage.clientHeight * (scale - 1) / 2);
    x = clamp(x, -maxPanX, maxPanX);
    y = clamp(y, -maxPanY, maxPanY);
    mediaHost.style.transform = `translate3d(${x}px,${y}px,0) scale(${scale})`;
    zoomReset.textContent = `${Math.round(scale * 100)}%`;
    // Disable the controls that can't do anything at the current scale.
    const min = Number(activeEntry?.minZoom ?? 1);
    const max = Math.max(min, Number(activeEntry?.maxZoom ?? 5));
    zoomOut.disabled = scale <= min + 0.001;
    zoomIn.disabled = scale >= max - 0.001;
    zoomReset.disabled = Math.abs(scale - 1) <= 0.001;
    stage.classList.toggle('is-zoomed', scale > 1.001);
    // The caption would collide with a zoomed image — fade it away.
    textInfo.style.opacity = scale > 1.02 ? '0' : '1';
    updateMinimap();
  };

  const setScale = (value, clientX, clientY) => {
    const min = Number(activeEntry?.minZoom ?? 1);
    const max = Math.max(min, Number(activeEntry?.maxZoom ?? 5));
    const nextScale = clamp(value, min, max);
    if (clientX != null && clientY != null && nextScale !== scale) {
      const rect = stage.getBoundingClientRect();
      const px = clientX - rect.left - rect.width / 2;
      const py = clientY - rect.top - rect.height / 2;
      const ratio = nextScale / scale;
      x = px - (px - x) * ratio;
      y = py - (py - y) * ratio;
    }
    scale = nextScale;
    if (scale <= 1.001) { x = 0; y = 0; }
    applyTransform();
  };

  const resetZoom = () => { scale = 1; x = 0; y = 0; applyTransform(); };

  const applyOptions = () => {
    // Explicit options win; otherwise the CSS custom property defaults apply.
    if (activeEntry?.backdropColor != null || activeEntry?.backdropOpacity != null) {
      const opacity = clamp(Number(activeEntry?.backdropOpacity ?? 0.9), 0, 1);
      backdrop.style.background = activeEntry?.backdropColor || `rgba(0,0,0,${opacity})`;
    } else {
      backdrop.style.background = 'var(--kt-lightbox-backdrop,rgba(10,10,14,.88))';
    }
    const blurValue = activeEntry?.backdropBlur != null
      ? `${Math.max(0, Number(activeEntry.backdropBlur))}px`
      : 'var(--kt-lightbox-backdrop-blur,20px)';
    const filterValue = `blur(${blurValue}) saturate(1.15)`;
    backdrop.style.backdropFilter = filterValue;
    backdrop.style.webkitBackdropFilter = filterValue;
    root.style.setProperty('--kt-lightbox-radius', `${Number(activeEntry?.radius ?? 4)}px`);
    root.className = `kt-lightbox ${activeEntry?.className || ''}`.trim();
    toolbar.hidden = activeEntry?.toolbar === false;
    info.hidden = activeEntry?.info === false;
    custom.innerHTML = activeEntry?.uiTemplate || '';
    activeEntry?.renderUI?.(custom, controls, activeEntry);
  };

  const render = (index) => {
    if (!activeList.length) return;
    lazyInstance?.destroy?.();
    lazyInstance = null;
    activeIndex = (index + activeList.length) % activeList.length;
    activeEntry = activeList[activeIndex];
    resetZoom();
    const source = activeEntry.src;
    image.removeAttribute('srcset');
    image.removeAttribute('sizes');
    image.alt = activeEntry.alt || '';
    image.style.opacity = '1';
    image.style.filter = 'none';
    image.style.transform = 'none';
    if (activeEntry.lazyEffect) {
      image.removeAttribute('src');
      image.dataset.src = source;
      lazyInstance = activeEntry.Kineto?.create('lazy', image, {
        effect: activeEntry.lazyEffect,
        ...(activeEntry.lazyOptions || {}),
        rootMargin: '0px',
        nativeLazy: false
      });
    } else {
      image.removeAttribute('data-src');
      image.src = source;
    }
    miniImage.src = source;
    title.textContent = activeEntry.title || '';
    description.textContent = activeEntry.description || '';
    const showControls = activeList.length > 1;
    previous.hidden = !showControls;
    next.hidden = !showControls;
    counter.textContent = showControls ? `${activeIndex + 1} / ${activeList.length}` : '';
    // Soft item transition: fade + rise, Toss-style restraint.
    mediaHost.animate?.([
      { opacity: 0, transform: 'translate3d(0,10px,0) scale(.985)' },
      { opacity: 1, transform: 'translate3d(0,0,0) scale(1)' }
    ], { duration: 170, easing: 'cubic-bezier(.22,.8,.3,1)' });
    applyOptions();
    image.onload = () => {
      const basic = `${image.naturalWidth || '?'}×${image.naturalHeight || '?'} · ${activeIndex + 1}/${activeList.length}`;
      const supplied = activeEntry.metadata && typeof activeEntry.metadata === 'object'
        ? Object.entries(activeEntry.metadata).map(([key, value]) => `${key}: ${value}`).join(' · ')
        : String(activeEntry.metadata || '');
      meta.textContent = supplied ? `${basic} · ${supplied}` : basic;
      activeEntry.onLoad?.(image, activeEntry);
    };
    activeEntry.onChange?.(activeIndex, activeEntry, controls);
  };

  const close = () => {
    if (root.hidden) return;
    const duration = Math.max(0, Number(activeEntry?.duration ?? 0.12));
    root.style.transition = `opacity ${duration}s ease`;
    root.style.opacity = '0';
    setTimeout(() => {
      root.hidden = true;
      root.style.display = 'none';
      root.style.opacity = '1';
      document.body.style.overflow = previousOverflow;
      lazyInstance?.destroy?.();
      lazyInstance = null;
      previousFocus?.focus?.();
      activeEntry?.onClose?.();
    }, duration * 1000);
  };

  const open = (entry) => {
    previousFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    activeList = entry.group ? Array.from(entries).filter((item) => item.group === entry.group) : [entry];
    render(Math.max(0, activeList.indexOf(entry)));
    root.hidden = false;
    root.style.display = 'block';
    root.style.opacity = '0';
    document.body.style.overflow = 'hidden';
    const duration = Math.max(0, Number(entry.duration ?? 0.12));
    root.style.transition = `opacity ${duration}s ease`;
    requestAnimationFrame(() => { root.style.opacity = '1'; });
    closeButton.focus();
    entry.onOpen?.(controls);
  };

  const onKeyDown = (event) => {
    if (root.hidden) return;
    if (event.key === 'Escape') close();
    else if (event.key === 'ArrowLeft' && activeList.length > 1) render(activeIndex - 1);
    else if (event.key === 'ArrowRight' && activeList.length > 1) render(activeIndex + 1);
    else if (event.key === '+' || event.key === '=') setScale(scale + Number(activeEntry?.zoomStep ?? 0.5));
    else if (event.key === '-') setScale(scale - Number(activeEntry?.zoomStep ?? 0.5));
    else if (event.key === '0') resetZoom();
  };
  const onWheel = (event) => {
    if (activeEntry?.zoom === false) return;
    event.preventDefault();
    const step = Number(activeEntry?.wheelStep ?? 0.18);
    setScale(scale * (event.deltaY < 0 ? 1 + step : 1 / (1 + step)), event.clientX, event.clientY);
  };
  // Pointer handling covers mouse pan and touch pinch-zoom.
  const activePointers = new Map();
  let pinchStartDistance = 0;
  let pinchStartScale = 1;
  const pinchDistance = () => {
    const points = [...activePointers.values()];
    return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
  };
  const pinchCenter = () => {
    const points = [...activePointers.values()];
    return { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
  };
  const onPointerDown = (event) => {
    if (event.target.closest('button,.kt-lightbox-toolbar,.kt-lightbox-info')) return;
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    try { stage.setPointerCapture?.(event.pointerId); } catch (_error) { /* synthetic events */ }
    if (activePointers.size === 2) {
      pinchStartDistance = pinchDistance();
      pinchStartScale = scale;
      dragging = false;
      return;
    }
    if (scale <= 1) return;
    dragging = true;
    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    originX = x;
    originY = y;
    stage.classList.add('is-panning');
  };
  const onPointerMove = (event) => {
    if (activePointers.has(event.pointerId)) {
      activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }
    if (activePointers.size === 2 && pinchStartDistance > 0) {
      const center = pinchCenter();
      setScale(pinchStartScale * (pinchDistance() / pinchStartDistance), center.x, center.y);
      return;
    }
    if (!dragging || event.pointerId !== pointerId) return;
    x = originX + event.clientX - startX;
    y = originY + event.clientY - startY;
    applyTransform();
  };
  const onPointerEnd = (event) => {
    activePointers.delete(event.pointerId);
    stage.releasePointerCapture?.(event.pointerId);
    if (activePointers.size < 2) pinchStartDistance = 0;
    if (!dragging || event.pointerId !== pointerId) return;
    dragging = false;
    stage.classList.remove('is-panning');
  };

  backdrop.addEventListener('click', () => {
    if (activeEntry?.closeOnBackdrop !== false) close();
  });
  // The stage (which covers the middle band for pan/zoom) also counts as
  // "empty background": clicking beside the image closes the viewer — but
  // never after a drag/pinch, and never while zoomed in.
  let stageDownAt = null;
  stage.addEventListener('pointerdown', (event) => {
    stageDownAt = { x: event.clientX, y: event.clientY };
  });
  stage.addEventListener('click', (event) => {
    if (activeEntry?.closeOnBackdrop === false || scale > 1.001) return;
    if (event.target !== stage && event.target !== stageContent) return;
    if (stageDownAt && Math.hypot(event.clientX - stageDownAt.x, event.clientY - stageDownAt.y) > 8) return;
    close();
  });
  closeButton.addEventListener('click', close);
  previous.addEventListener('click', () => render(activeIndex - 1));
  next.addEventListener('click', () => render(activeIndex + 1));
  zoomIn.addEventListener('click', () => setScale(scale + Number(activeEntry?.zoomStep ?? 0.5)));
  zoomOut.addEventListener('click', () => setScale(scale - Number(activeEntry?.zoomStep ?? 0.5)));
  zoomReset.addEventListener('click', resetZoom);
  stage.addEventListener('wheel', onWheel, { passive: false });
  stage.addEventListener('pointerdown', onPointerDown);
  stage.addEventListener('pointermove', onPointerMove);
  stage.addEventListener('pointerup', onPointerEnd);
  stage.addEventListener('pointercancel', onPointerEnd);
  image.addEventListener('dblclick', (event) => setScale(scale > 1 ? 1 : Number(activeEntry?.doubleClickZoom ?? 2), event.clientX, event.clientY));
  document.addEventListener('keydown', onKeyDown);

  return {
    root,
    controls,
    open,
    close,
    next() { render(activeIndex + 1); },
    prev() { render(activeIndex - 1); },
    zoom(value) { setScale(Number(value)); },
    destroy() {
      lazyInstance?.destroy?.();
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      root.remove();
    }
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export default {
  create(el, opts = {}, Kineto) {
    const src = sourceOf(el, opts);
    if (!src) return null;
    if (!manager) manager = createManager();
    const originalCursor = el.style.cursor;
    const imageEl = el.tagName === 'IMG' ? el : el.querySelector?.('img');
    const entry = {
      el,
      src,
      alt: opts.alt || imageEl?.alt || el.getAttribute('aria-label') || '',
      title: opts.title || el.dataset.title || imageEl?.dataset?.title || imageEl?.alt || '',
      description: opts.description || opts.caption || el.dataset.description || el.dataset.caption || '',
      metadata: opts.metadata,
      group: opts.group || el.dataset.ktLightboxGroup || el.getAttribute('data-kt-lightbox-group') || null,
      backdropColor: opts.backdropColor,
      backdropOpacity: opts.backdropOpacity,
      backdropBlur: opts.backdropBlur,
      // lightboxDuration lets the viewer fade stay fast even when the element
      // shares data-kt-duration with another module (e.g. a lazy loader whose
      // long load duration would otherwise bleed into the backdrop fade).
      duration: opts.lightboxDuration ?? opts.duration,
      radius: opts.radius,
      toolbar: opts.toolbar,
      info: opts.info,
      zoom: opts.zoom,
      minZoom: opts.minZoom,
      maxZoom: opts.maxZoom,
      zoomStep: opts.zoomStep,
      wheelStep: opts.wheelStep,
      doubleClickZoom: opts.doubleClickZoom,
      closeOnBackdrop: opts.closeOnBackdrop,
      minimap: opts.minimap,
      className: opts.className,
      uiTemplate: opts.uiTemplate,
      renderUI: opts.renderUI,
      lazyEffect: opts.lazyEffect,
      lazyOptions: opts.lazyOptions,
      onOpen: opts.onOpen,
      onClose: opts.onClose,
      onChange: opts.onChange,
      onLoad: opts.onLoad,
      Kineto
    };
    entries.add(entry);
    el.style.cursor = opts.cursor || 'zoom-in';
    const open = (event) => { event?.preventDefault?.(); manager.open(entry); };
    el.addEventListener('click', open);

    return {
      el,
      type: 'lightbox',
      open,
      close() { manager?.close(); },
      next() { manager?.next(); },
      prev() { manager?.prev(); },
      zoom(value) { manager?.zoom(value); },
      pause() {},
      resume() {},
      destroy() {
        el.removeEventListener('click', open);
        el.style.cursor = originalCursor;
        entries.delete(entry);
        if (!entries.size) {
          manager?.destroy();
          manager = null;
        }
      }
    };
  },
  reduced() {}
};
