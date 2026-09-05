import Kineto from '../src/index.js';
import gsapPackage from 'gsap';
import ScrollTriggerPackage from 'gsap/ScrollTrigger.js';

async function runSmoke() {

  const expected = Object.keys(Kineto.registry).sort();
  const errors = [];
  window.addEventListener('error', (event) => errors.push(String(event.error || event.message)));
  window.addEventListener('unhandledrejection', (event) => errors.push(String(event.reason)));
  Kineto.setAnimationEngine({
    gsap: gsapPackage?.gsap || gsapPackage?.default || gsapPackage,
    ScrollTrigger: ScrollTriggerPackage?.ScrollTrigger || ScrollTriggerPackage?.default || ScrollTriggerPackage
  });
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
  const withMarkup = (html, tag = 'div') => {
    const el = make(tag, '');
    el.innerHTML = html;
    return el;
  };
  const sliderFixture = (prefix = '') => withMarkup(
    `<div class="kt-slider-wrap"><div class="kt-slider-track"><div class="kt-slide">${prefix}A</div><div class="kt-slide">${prefix}B</div></div></div>`
  );
  const results = {};
  const supplementalResults = {};
  const run = (name, el, options = {}, { verify } = {}) => {
    try {
      const first = Kineto.create(name, el, options);
      const second = Kineto.create(name, el, options);
      if (!first) throw new Error(`${name} returned null`);
      if (second !== first) throw new Error(`${name} duplicate initialization created a new instance`);
      verify?.(first);
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
      results[name] = 'ok';
    } catch (error) {
      results[name] = 'failed';
      errors.push(`${name}: ${error.stack || error.message}`);
    }
  };

  // Headless Firefox/WebKit do not expose the optional Vibration API. Stub the
  // browser capability in this isolated fixture so Vibrate still executes its
  // real create/replay/destroy path instead of being silently excluded.
  if (typeof navigator.vibrate !== 'function') {
    Object.defineProperty(navigator, 'vibrate', { configurable: true, value: () => true });
  }

  const smokeCases = {
    ambientMedia: () => ({
      el: withMarkup('<iframe title="Ambient source"></iframe>'),
      options: { color: '#888', disableOnMobile: false }
    }),
    blurText: () => ({ el: make('div', 'Blur text') }),
    brushReveal: () => ({
      el: withMarkup(`<img src="${svg}" alt="">`),
      options: { src: svg, persist: true }
    }),
    cardGlow: () => ({ el: make(), options: { mode: 'spotlight', radius: 90, sensitivity: 1.2 } }),
    counter: () => ({ el: make('div', '0'), options: { mode: 'plain', to: 12, duration: 0.01 } }),
    dateTime: () => ({
      el: make('time', '2026-01-02 03:04:05'),
      options: { value: '2026-01-02T03:04:05Z', now: '2026-01-02T03:05:05Z', live: false }
    }),
    cssScroll: () => ({ el: make() }),
    cursor: () => ({ el: make(), options: { clickImage: svg } }),
    fullpage: () => {
      const el = withMarkup('<section>One</section><section>Two</section>');
      el.style.height = '180px';
      return { el, options: { duration: 0.15, wheel: false, touch: false, keyboard: false, drag: false } };
    },
    glitch: () => ({ el: make('div', 'Glitch') }),
    lazy: () => {
      const el = make('img', '');
      el.setAttribute('data-src', svg);
      return { el, options: { preset: 'pixelate', duration: 0.01, delay: 0, steps: [0.2, 1] } };
    },
    lightbox: () => {
      const el = make('img', '');
      el.src = svg;
      return { el };
    },
    loader: () => ({ el: make(), options: { minDuration: 0, duration: 0.01 } }),
    loadingIndicator: () => ({ el: make(), options: { type: 'spinner', autoComplete: false } }),
    magnetic: () => ({ el: make('button', 'Magnetic') }),
    marquee: () => ({ el: withMarkup('<span>Marquee</span><span>Marquee</span>'), options: { speed: 20 } }),
    mouseParallax: () => ({ el: make() }),
    overflowText: () => {
      const el = make('div', 'A very long track title that must scroll like an old MP3 display');
      el.style.width = '120px';
      return { el, options: { mode: 'bounce', speed: 120, delay: 0, endPause: 10 } };
    },
    pageReveal: () => ({ el: make() }),
    pageTransition: () => ({ el: document.body, options: { minDuration: 0, executeScripts: false } }),
    parallax: () => ({ el: make() }),
    progress: () => ({ el: make() }),
    reveal: () => ({ el: make() }),
    radial: () => ({
      el: withMarkup('<div>Radial A</div><div>Radial B</div>'),
      options: { autoplay: false, controls: false, duration: 0.01 }
    }),
    ripple: () => ({ el: make('button', 'Ripple'), options: { duration: 30 } }),
    scrollSequence: () => ({ el: make(), options: { frames: 2, urls: [svg, svg], scrollLength: '200px' } }),
    scrollVelocity: () => ({ el: make(), options: { mode: 'translate', axis: 'x', distance: 24 } }),
    slider: () => ({
      el: sliderFixture(),
      options: { autoplay: false, speed: 0.01 },
      verify(instance) {
        if (instance.index !== 0) throw new Error(`slider initial getter is invalid: ${instance.index}`);
        instance.next();
        if (instance.index !== 1) throw new Error(`slider live index getter was flattened: ${instance.index}`);
      }
    }),
    stickyStack: () => {
      const el = withMarkup('<div>A</div><div>B</div>');
      el.id = 'sticky';
      return { el };
    },
    textFill: () => ({ el: make('div', 'Fill text') }),
    textReveal: () => ({ el: make('div', 'Shuffle'), options: { preset: 'shuffle', text: 'Shuffle', speed: 1 } }),
    textSplit: () => ({ el: make('div', 'Split text') }),
    textTransition: () => ({ el: make('div', 'One'), options: { texts: ['One', 'Two'], duration: 0.01, pause: 10, loop: false } }),
    tilt: () => ({ el: make(), options: { glare: false } }),
    typewriter: () => ({ el: make('div', 'Type'), options: { strings: ['A'], typeSpeed: 1, loop: false } }),
    vibrate: () => ({ el: make(), options: { trigger: 'manual' } }),
    confetti: () => ({ el: make('button', 'Confetti'), options: { trigger: 'click', count: 4 } }),
    accordion: () => ({ el: withMarkup('<details><summary>Question</summary><p>Answer</p></details>') }),
    hold: () => ({ el: make('button', 'Hold'), options: { submit: false } }),
    megaMenu: () => ({
      el: withMarkup('<ul><li><button>Menu</button><div class="kt-menu-panel"><a href="#">Item</a></div></li></ul>', 'nav'),
      options: { trigger: 'click' }
    }),
    toast: () => ({ el: make('button', 'Toast'), options: { duration: 1000 } }),
    bottomSheet: () => {
      const el = withMarkup('<h2 id="smoke-sheet-title">Sheet</h2><button>Close</button>', 'section');
      el.id = 'smoke-bottom-sheet';
      el.setAttribute('aria-labelledby', 'smoke-sheet-title');
      return { el, options: { backdrop: false } };
    },
    tabs: () => ({
      el: withMarkup('<div class="kt-tablist"><button>One</button><button>Two</button></div><div class="kt-tabpanel">Panel one</div><div class="kt-tabpanel">Panel two</div>')
    }),
    coverReveal: () => ({ el: make('div', 'Cover reveal'), options: { duration: 0.05, waitForImage: false } }),
    gesture: () => ({ el: make('button', 'Gesture') }),
    drag: () => ({ el: make('div', 'Drag'), options: { inertia: false } }),
    tooltip: () => {
      const el = make('button', 'Tooltip');
      el.title = 'Tooltip content';
      return { el };
    },
    switch: () => ({ el: make('button', 'Switch') }),
    flip: () => ({ el: withMarkup('<span>One</span><span>Two</span>'), options: { duration: 0 } }),
    scrollShadows: () => {
      const el = withMarkup('<div style="height:180px">Scrollable content</div>');
      el.style.cssText = 'height:60px;overflow:auto;';
      return { el, options: { transitionMode: 'instant' } };
    },
    stickyHeader: () => ({ el: make('header', 'Sticky header') }),
    horizontalScroll: () => ({
      el: withMarkup('<div style="width:180px">One</div><div style="width:180px">Two</div>'),
      options: { height: '80px', smooth: false }
    })
  };

  const declared = Object.keys(smokeCases).sort();
  const missingCases = expected.filter((name) => !declared.includes(name));
  const unknownCases = declared.filter((name) => !expected.includes(name));
  if (missingCases.length || unknownCases.length) {
    errors.push(`smoke registry mismatch; missing: ${missingCases.join(',') || 'none'}; unknown: ${unknownCases.join(',') || 'none'}`);
  }
  expected.forEach((name) => {
    try {
      const fixture = smokeCases[name]?.();
      if (!fixture) return;
      run(name, fixture.el, fixture.options, { verify: fixture.verify });
    } catch (error) {
      results[name] = 'failed';
      errors.push(`${name} fixture: ${error.stack || error.message}`);
    }
  });

  // Retain focused variant coverage in addition to the one-case-per-module
  // registry. These do not count as separate public modules.
  const horizontal = make(); horizontal.innerHTML = '<div>A</div><div>B</div><div>C</div>'; run('stickyStack', horizontal, { mode: 'horizontal', pin: false, scrub: 0.1 });
  const floating = make(); floating.innerHTML = '<div>A</div><div>B</div><div>C</div>'; run('stickyStack', floating, { mode: 'floating', pin: false, scrub: 0.1, scrollLength: 10 });
  const nativeSlider = sliderFixture('Native ');
  try {
    const nativeInstance = Kineto.create('slider', nativeSlider, {
      effect: 'slide', loop: 'off', perView: 1, axis: 'x', gap: 0, scrollSnap: true
    });
    const nativeWrap = nativeSlider.querySelector('.kt-slider-wrap');
    const nativeSelected = nativeSlider.dataset.ktSliderScrollSnap === 'native'
      && getComputedStyle(nativeWrap).overflowX === 'auto'
      && /x.*mandatory/.test(getComputedStyle(nativeWrap).scrollSnapType)
      && nativeWrap.scrollWidth > nativeWrap.clientWidth;
    nativeInstance?.goTo(1);
    if (!nativeSelected || nativeInstance?.index !== 1) throw new Error('native Scroll Snap path did not select or navigate');
    nativeInstance?.destroy();
    supplementalResults.sliderNative = 'ok';
  } catch (error) {
    supplementalResults.sliderNative = 'failed';
    errors.push(`sliderNative: ${error.stack || error.message}`);
  }

  // Functional checks for the article's pixelate use case and key text/data flows.
  const functionalHost = document.createElement('div');
  // Keep functional fixtures paint-visible. Linux WebKit can suspend image
  // loading and animation work for content fully occluded behind the page.
  functionalHost.style.cssText = 'position:fixed;top:0;left:0;width:320px;min-height:200px;z-index:1;opacity:.01;pointer-events:none;';
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

  const waitUntil = async (condition, timeout = 2000) => {
    const started = performance.now();
    while (!condition() && performance.now() - started < timeout) {
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  };
  await waitUntil(() => (
    lazyLoaded
    && pixelImage.complete
    && rangedPixelImage.complete
    && pixelProgress >= 3
    && printImage.complete
    && printImage.style.opacity === '1'
  ), 3000);
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
  await waitUntil(() => plainCounter.textContent === '84', 1000);
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
  const exercised = Object.keys(results).sort();
  if (JSON.stringify(registry) !== JSON.stringify(expected)) errors.push(`registry mismatch: ${registry.join(',')}`);
  if (JSON.stringify(exercised) !== JSON.stringify(expected)) errors.push(`smoke coverage mismatch: ${exercised.join(',')}`);
  Kineto.destroy();
  if (Kineto.instanceCount !== 0) errors.push(`instance leak: ${Kineto.instanceCount}`);
  window.__MK_SMOKE__ = {
    ok: errors.length === 0,
    errors,
    results,
    supplementalResults,
    registry,
    exercised,
    instanceCount: Kineto.instanceCount
  };
  document.documentElement.dataset.smokeDone = 'true';
}

runSmoke().catch((error) => {
  window.__MK_SMOKE__ = { ok: false, errors: [error.stack || error.message], results: {}, registry: [], exercised: [], instanceCount: -1 };
  document.documentElement.dataset.smokeDone = 'true';
});
