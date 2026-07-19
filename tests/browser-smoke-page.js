import Kineto from '../src/index.js';

async function runSmoke() {

  const expected = [
    'parallax','mouseParallax','reveal','counter','lazy','textSplit','blurText','shuffle','typewriter',
    'textReveal','textTransition','magnetic','ripple','marquee','overflowText','loader','tilt','cursor','textFill','stickyStack',
    'scrollVelocity','progress','slider','ambientMedia','pageReveal','glitch','cardGlow','lightbox',
    'pageTransition','vibrate','cssScroll','scrollSequence','brushReveal','fullpage'
  ].sort();
  const errors = [];
  window.addEventListener('error', (event) => errors.push(String(event.error || event.message)));
  window.addEventListener('unhandledrejection', (event) => errors.push(String(event.reason)));
  Kineto.config({ smooth: false, debug: false });

  const root = document.querySelector('#fixtures');
  const svg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#888"/><circle cx="32" cy="32" r="18" fill="#ddd"/></svg>')}`;
  const make = (tag = 'div', text = 'Kineto') => {
    const el = document.createElement(tag);
    el.className = 'fixture';
    el.textContent = text;
    root.appendChild(el);
    return el;
  };
  const results = {};
  const run = (name, el, options = {}, { allowNull = false } = {}) => {
    try {
      const first = Kineto.create(name, el, options);
      const second = Kineto.create(name, el, options);
      if (!allowNull && !first) throw new Error(`${name} returned null`);
      if (first && second !== first) throw new Error(`${name} duplicate initialization created a new instance`);
      if (first) {
        first.pause?.();
        first.resume?.();
        if (name === 'reveal') {
          first.destroy();
          if (Kineto.getInstance(el, name)) throw new Error(`${name} direct destroy left a stale core record`);
          const recreated = Kineto.create(name, el, options);
          if (!recreated || recreated === first) throw new Error(`${name} could not recreate after direct destroy`);
        }
        const replayed = Kineto.replay(el, name);
        if (!replayed) throw new Error(`${name} replay returned null`);
        Kineto.destroyModule(el, name);
        if (Kineto.getInstance(el, name)) throw new Error(`${name} was not destroyed`);
      }
      results[name] = first ? 'ok' : 'supported-null';
    } catch (error) {
      results[name] = 'failed';
      errors.push(`${name}: ${error.stack || error.message}`);
    }
  };

  run('parallax', make());
  run('mouseParallax', make());
  run('reveal', make());
  run('counter', make('div', '0'), { mode: 'plain', to: 12, duration: 0.01 });
  const lazy = make('img', ''); lazy.setAttribute('data-src', svg); run('lazy', lazy, { preset: 'pixelate', duration: 0.01, delay: 0, steps: [0.2, 1] });
  run('textSplit', make('div', 'Split text'));
  run('blurText', make('div', 'Blur text'));
  run('shuffle', make('div', 'Shuffle'), { speed: 1 });
  run('typewriter', make('div', 'Type'), { strings: ['A'], typeSpeed: 1, loop: false });
  run('textReveal', make('div', '한글'), { mode: 'hangul', speed: 1 });
  run('textTransition', make('div', 'One'), { texts: ['One', 'Two'], duration: 0.01, pause: 10, loop: false });
  run('magnetic', make('button', 'Magnetic'));
  run('ripple', make('button', 'Ripple'), { duration: 30 });
  const marquee = make(); marquee.innerHTML = '<span>Marquee</span><span>Marquee</span>'; run('marquee', marquee, { speed: 20 });
  const overflow = make('div', 'A very long track title that must scroll like an old MP3 display'); overflow.style.width = '120px'; run('overflowText', overflow, { mode: 'bounce', speed: 120, delay: 0, endPause: 10 });
  run('loader', make(), { minDuration: 0, duration: 0.01 });
  run('tilt', make(), { glare: false });
  run('cursor', make(), {}, { allowNull: true });
  run('textFill', make('div', 'Fill text'));
  const sticky = make(); sticky.id = 'sticky'; sticky.innerHTML = '<div>A</div><div>B</div>'; run('stickyStack', sticky);
  const horizontal = make(); horizontal.innerHTML = '<div>A</div><div>B</div><div>C</div>'; run('stickyStack', horizontal, { mode: 'horizontal', pin: false, scrub: 0.1 });
  const floating = make(); floating.innerHTML = '<div>A</div><div>B</div><div>C</div>'; run('stickyStack', floating, { mode: 'floating', pin: false, scrub: 0.1, scrollLength: 10 });
  run('scrollVelocity', make(), { mode: 'translate', axis: 'x', distance: 24 });
  run('progress', make());
  const slider = make(); slider.innerHTML = '<div class="kt-slider-wrap"><div class="kt-slider-track"><div class="kt-slide">A</div><div class="kt-slide">B</div></div></div>';
  try {
    const sliderInstance = Kineto.create('slider', slider, { autoplay: false, speed: 0.01 });
    if (!sliderInstance) throw new Error('slider returned null');
    if (sliderInstance.index !== 0) throw new Error(`slider initial getter is invalid: ${sliderInstance.index}`);
    sliderInstance.next();
    if (sliderInstance.index !== 1) throw new Error(`slider live index getter was flattened: ${sliderInstance.index}`);
    const duplicateSlider = Kineto.create('slider', slider, { autoplay: false });
    if (duplicateSlider !== sliderInstance) throw new Error('slider duplicate initialization created a new instance');
    sliderInstance.destroy();
    results.slider = 'ok';
  } catch (error) {
    results.slider = 'failed';
    errors.push(`slider: ${error.stack || error.message}`);
  }
  const ambient = make(); ambient.innerHTML = '<iframe title="empty"></iframe>'; run('ambientMedia', ambient, { color: '#888', disableOnMobile: false });
  run('pageReveal', make());
  run('glitch', make('div', 'Glitch'));
  run('cardGlow', make(), { mode: 'spotlight', radius: 90, sensitivity: 1.2 });
  const lightbox = make('img', ''); lightbox.src = svg; run('lightbox', lightbox);
  run('pageTransition', document.body, { minDuration: 0, executeScripts: false });
  run('vibrate', make(), { trigger: 'click' }, { allowNull: true });
  run('cssScroll', make());
  const sequence = make(); run('scrollSequence', sequence, { frames: 2, urls: [svg, svg], scrollLength: '200px' });

  // Functional checks for the article's pixelate use case and key text/data flows.
  const functionalHost = document.createElement('div');
  functionalHost.style.cssText = 'position:fixed;top:0;left:0;width:320px;min-height:200px;z-index:-1;';
  document.body.appendChild(functionalHost);
  const makeFunctional = (tag = 'div', text = '') => {
    const element = document.createElement(tag);
    element.textContent = text;
    element.style.cssText = 'display:block;width:128px;min-height:32px;';
    functionalHost.appendChild(element);
    return element;
  };
  const autoInitElement = makeFunctional('div', 'Auto init');
  autoInitElement.setAttribute('data-kt-reveal', 'fade-up');
  Kineto.scan(autoInitElement);
  if (!Kineto.getInstance(autoInitElement, 'reveal')) errors.push('data attribute scan failed');
  Kineto.destroy(autoInitElement);

  const unknownTarget = makeFunctional('div', 'Untouched');
  unknownTarget.setAttribute('data-owner-state', 'keep');
  const unknownBefore = unknownTarget.outerHTML;
  const unknownResult = Kineto.create('notAContractedModule', unknownTarget, { invented: true });
  if (unknownResult !== null || unknownTarget.outerHTML !== unknownBefore) errors.push('unknown module mutated its target or returned a non-null instance');

  const destroyRoot = makeFunctional('section', '');
  const destroyChild = document.createElement('div');
  destroyChild.textContent = 'Nested reveal';
  destroyRoot.appendChild(destroyChild);
  Kineto.create('reveal', destroyChild, { duration: 0.01 });
  Kineto.destroy(destroyRoot);
  if (Kineto.getInstance(destroyChild, 'reveal')) errors.push('root destroy did not remove descendant instances');

  let lazyLoaded = false;
  const pixelImage = makeFunctional('img', '');
  pixelImage.style.height = '128px';
  pixelImage.setAttribute('data-src', svg);
  const pixelInstance = Kineto.create('lazy', pixelImage, {
    effect: 'pixelate',
    steps: [0.1, 0.25, 1],
    delay: 0,
    stepDuration: 5,
    fadeDuration: 0.01,
    onLoad: () => { lazyLoaded = true; }
  });



  const slotCounter = makeFunctional('div', '0');
  const slotCounterInstance = Kineto.create('counter', slotCounter, { mode: 'slot', to: 12345, format: ',', duration: 0.02, loops: 0 });
  if (!slotCounter.querySelector('.kt-counter-separator') || slotCounter.getAttribute('aria-label') !== '12,345') {
    errors.push('slot counter did not preserve comma grouping');
  }

  const digitCounter = makeFunctional('div', '0');
  const digitCounterInstance = Kineto.create('counter', digitCounter, { mode: 'digit', to: 54321, format: ',', duration: 0.03, loops: 0, stagger: 0 });
  if (digitCounter.querySelector('.kt-counter-reel') || !digitCounter.querySelector('.kt-counter-digit')) {
    errors.push('digit counter used a vertical reel or omitted digit nodes');
  }

  const popCounter = makeFunctional('div', '0');
  const popCounterInstance = Kineto.create('counter', popCounter, { mode: 'pop', to: 9876, format: ',', duration: 0.03, loops: 0, stagger: 0, popScale: 1.6 });
  if (popCounter.querySelector('.kt-counter-reel') || !popCounter.querySelector('.kt-counter-digit')) {
    errors.push('pop counter used a vertical reel or omitted pop digit nodes');
  }

  let pixelProgress = 0;
  const rangedPixelImage = makeFunctional('img', '');
  rangedPixelImage.style.height = '128px';
  rangedPixelImage.setAttribute('data-src', svg);
  const rangedPixelInstance = Kineto.create('lazy', rangedPixelImage, {
    effect: 'pixelate', pixelStart: 0.05, pixelEnd: 1, pixelStepCount: 4,
    delay: 0, stepDuration: 4, holdDuration: 2, fadeDuration: 0.01,
    onProgress: () => { pixelProgress += 1; }
  });

  const printImage = makeFunctional('img', '');
  printImage.style.height = '128px';
  printImage.setAttribute('data-src', svg);
  const printInstance = Kineto.create('lazy', printImage, {
    effect: 'print', duration: 0.05, delay: 0, feather: 12, noise: 0.1, direction: 'down', fadeDuration: 0.01
  });
  if (printImage.parentElement.querySelector('[class*="scanner"]')) errors.push('print effect reintroduced a scanner/laser element');

  const glowCard = makeFunctional('div', 'Glow');
  glowCard.style.height = '80px';
  const glowInstance = Kineto.create('cardGlow', glowCard, { radius: 70, color: 'rgba(90,120,255,.7)' });
  const glowLayer = glowCard.querySelector('.kt-card-glow-spotlight');
  if (!glowLayer || glowLayer.firstElementChild?.style.background.includes('conic-gradient')) {
    errors.push('default card glow is not a clipped single-color spotlight');
  }

  const overflowLong = makeFunctional('div', 'This title is intentionally much longer than the display width');
  overflowLong.style.width = '90px';
  const overflowLongInstance = Kineto.create('overflowText', overflowLong, { mode: 'bounce', delay: 0, speed: 200, endPause: 10 });
  const overflowShort = makeFunctional('div', 'Short');
  overflowShort.style.width = '200px';
  const overflowShortInstance = Kineto.create('overflowText', overflowShort, { mode: 'loop', delay: 0 });
  if (overflowLong.querySelector('.kt-overflow-text-track')?.getAnimations().length === 0) errors.push('overflow text did not animate overflowing content');
  if (overflowShort.querySelector('.kt-overflow-text-track')?.getAnimations().length !== 0) errors.push('overflow text animated content that fits');

  const simpleLightboxImage = makeFunctional('img', '');
  simpleLightboxImage.src = svg;
  const simpleLightboxInstance = Kineto.create('lightbox', simpleLightboxImage, { duration: 0.01 });
  simpleLightboxImage.click();

  const hangulElement = makeFunctional('div', '강');
  const hangulInstance = Kineto.create('textReveal', hangulElement, { mode: 'hangul', speed: 2 });

  const plainCounter = makeFunctional('div', '0');
  Kineto.create('counter', plainCounter, { mode: 'plain', to: 42, duration: 0.02 });

  const ariaCounter = makeFunctional('div', '7');
  ariaCounter.setAttribute('aria-label', 'Original counter');
  ariaCounter.setAttribute('aria-live', 'assertive');
  const ariaCounterInstance = Kineto.create('counter', ariaCounter, { mode: 'plain', to: 8, duration: 0.01 });
  ariaCounterInstance?.destroy();
  if (ariaCounter.getAttribute('aria-label') !== 'Original counter' || ariaCounter.getAttribute('aria-live') !== 'assertive') {
    errors.push('counter destroy did not restore original ARIA attributes');
  }

  const staggerReveal = makeFunctional('div', '');
  staggerReveal.innerHTML = '<span style="opacity:.4;transform:scale(1.2)">A</span><span style="filter:blur(1px)">B</span>';
  const staggerStyles = Array.from(staggerReveal.children, (child) => child.getAttribute('style'));
  const staggerInstance = Kineto.create('reveal', staggerReveal, { stagger: 0.01, duration: 0.01 });
  staggerInstance?.destroy();
  const restoredStaggerStyles = Array.from(staggerReveal.children, (child) => child.getAttribute('style'));
  if (JSON.stringify(restoredStaggerStyles) !== JSON.stringify(staggerStyles)) errors.push('stagger reveal did not restore child styles');

  Kineto.config({ forceReducedMotion: true });
  const reducedCounter = makeFunctional('div', '');
  reducedCounter.innerHTML = '<strong>0</strong>';
  const reducedCounterOriginal = reducedCounter.innerHTML;
  const reducedCounterInstance = Kineto.create('counter', reducedCounter, { to: 99 });
  if (reducedCounter.textContent !== '99') errors.push(`reduced counter did not render final value: ${reducedCounter.textContent}`);
  reducedCounterInstance?.destroy();
  if (reducedCounter.innerHTML !== reducedCounterOriginal) errors.push('reduced counter destroy did not restore original HTML');

  const reducedLazy = makeFunctional('img', '');
  reducedLazy.setAttribute('src', svg);
  reducedLazy.setAttribute('data-src', svg + '#next');
  reducedLazy.setAttribute('style', 'opacity:.5');
  const reducedLazyOriginalStyle = reducedLazy.getAttribute('style');
  const reducedLazyOriginalSrc = reducedLazy.getAttribute('src');
  const reducedLazyInstance = Kineto.create('lazy', reducedLazy);
  reducedLazyInstance?.destroy();
  if (reducedLazy.getAttribute('style') !== reducedLazyOriginalStyle || reducedLazy.getAttribute('src') !== reducedLazyOriginalSrc) {
    errors.push('reduced lazy destroy did not restore source and style');
  }

  const reducedTypewriter = makeFunctional('div', 'Original');
  const reducedTypewriterInstance = Kineto.create('typewriter', reducedTypewriter, { strings: ['Static', 'Ignored'], loop: true });
  if (reducedTypewriter.textContent !== 'Static' || reducedTypewriter.querySelector('.kt-tw-caret')) {
    errors.push('reduced typewriter started an animated caret/loop instead of rendering a static value');
  }
  reducedTypewriterInstance?.destroy();
  if (reducedTypewriter.textContent !== 'Original') errors.push('reduced typewriter destroy did not restore original content');
  Kineto.config({ forceReducedMotion: false });

  await new Promise((resolve) => setTimeout(resolve, 300));
  if (!lazyLoaded || !pixelImage.complete || !pixelImage.src.startsWith('data:image/svg+xml')) errors.push('lazy pixelate did not load its real image');
  if (hangulElement.textContent !== '강') errors.push(`hangul reveal did not settle to original text: ${hangulElement.textContent}`);
  if (plainCounter.textContent !== '42') errors.push(`plain counter did not reach target: ${plainCounter.textContent}`);

  if (digitCounter.textContent !== '54,321') errors.push(`digit counter did not reach grouped target: ${digitCounter.textContent}`);
  if (popCounter.textContent !== '9,876') errors.push(`pop counter did not reach grouped target: ${popCounter.textContent}`);
  if (pixelProgress < 3 || !rangedPixelImage.complete || !rangedPixelImage.src.startsWith('data:image/svg+xml')) errors.push('pixelate range controls did not complete');
  if (!printImage.complete || !printImage.src.startsWith('data:image/svg+xml') || printImage.style.opacity !== '1') errors.push('progressive print did not reveal the real image');
  const lightboxDialog = document.querySelector('#kt-lightbox');
  if (!lightboxDialog || lightboxDialog.hidden || lightboxDialog.style.display === 'none' || getComputedStyle(lightboxDialog).position !== 'fixed' || lightboxDialog.getBoundingClientRect().width < window.innerWidth - 1 || !lightboxDialog.querySelector('.kt-lightbox-minimap')) errors.push('full lightbox viewer did not open across the viewport');
  lightboxDialog?.querySelector('.kt-lightbox-close')?.click();

  const replayedCounter = Kineto.replay(plainCounter, 'counter', { mode: 'plain', to: 84, duration: 0.02, start: false });
  if (!replayedCounter) errors.push('counter replay with replacement options returned null');
  await new Promise((resolve) => setTimeout(resolve, 100));
  if (plainCounter.textContent !== '84') errors.push(`replay replacement options were not applied: ${plainCounter.textContent}`);
  pixelInstance?.destroy();
  rangedPixelInstance?.destroy();
  printInstance?.destroy();
  slotCounterInstance?.destroy();
  digitCounterInstance?.destroy();
  popCounterInstance?.destroy();
  glowInstance?.destroy();
  overflowLongInstance?.destroy();
  overflowShortInstance?.destroy();
  simpleLightboxInstance?.destroy();
  hangulInstance?.destroy();
  replayedCounter?.destroy();
  functionalHost.remove();
  const registry = Object.keys(Kineto.registry).sort();
  if (JSON.stringify(registry) !== JSON.stringify(expected)) errors.push(`registry mismatch: ${registry.join(',')}`);
  Kineto.destroy();
  if (Kineto.instanceCount !== 0) errors.push(`instance leak: ${Kineto.instanceCount}`);
  window.__MK_SMOKE__ = { ok: errors.length === 0, errors, results, registry, instanceCount: Kineto.instanceCount };
  document.documentElement.dataset.smokeDone = 'true';
}

runSmoke().catch((error) => {
  window.__MK_SMOKE__ = { ok: false, errors: [error.stack || error.message], results: {}, registry: [], instanceCount: -1 };
  document.documentElement.dataset.smokeDone = 'true';
});
