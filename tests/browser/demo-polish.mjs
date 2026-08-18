import assert from 'node:assert/strict';
import { chromium, firefox, webkit } from 'playwright';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';

const root = resolve(import.meta.dirname, '..', '..');
let html = await readFile(resolve(root, 'demo/index.html'), 'utf8');
html = html
  .replace(/<link rel="stylesheet" href="\.\.\/dist\/kineto\.css[^"]*">/, '')
  .replace(/<script src="\.\.\/dist\/kineto\.umd\.js[^"]*"><\/script>/, '')
  .replace(/<script src="\.\/(?:help-i18n|help-i18n-extra|playground-i18n|playground|copy-i18n|module-metadata|main)\.js[^"]*"><\/script>/g, '')
  .replace('<head>', '<head><base href="http://kineto.local/demo/">')
  // setContent() keeps an opaque/about:blank document origin. Mark demo images
  // as anonymous and return ACAO below so Canvas tests exercise real pixels
  // instead of silently falling back to the surrounding page color.
  .replace(/<img /g, '<img crossorigin="anonymous" ');
const mime = { '.svg':'image/svg+xml','.png':'image/png','.gif':'image/gif','.webp':'image/webp','.js':'text/javascript','.css':'text/css' };
const browserName = process.env.KT_BROWSER || 'chromium';
let lastCheckpoint = 'startup';
const checkpoint = (name) => {
  lastCheckpoint = name;
  console.log(`[demo-polish:${browserName}] ${name}`);
};
// The retry wrapper terminates a stalled browser process after a bounded
// attempt. Emit the last completed phase as a workflow annotation so a
// hosted-runner hang remains actionable even when job logs require sign-in.
process.on('SIGTERM', () => {
  console.error(`::error title=Demo polish timeout::${browserName} stopped after checkpoint: ${lastCheckpoint}`);
});
const browserEngine = { chromium, firefox, webkit }[browserName];
if (!browserEngine) throw new Error(`Unsupported KT_BROWSER: ${browserName}`);
const browser = await browserEngine.launch(browserEngine === chromium
  ? { headless:true, ...(process.env.KT_CHROME ? { executablePath:process.env.KT_CHROME } : {}), args:['--no-sandbox','--disable-setuid-sandbox','--disable-gpu'] }
  : { headless:true });
const page = await browser.newPage({ viewport:{ width:1437, height:807 } });
try {
  checkpoint('page-created');
  await page.route(/fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net/, (route)=>route.fulfill({status:200,body:'',contentType:'text/css'}));
  await page.route('http://kineto.local/**', async (route) => {
    const url=new URL(route.request().url());
    const relative=decodeURIComponent(url.pathname).replace(/^\/demo\//,'');
    try { const file=resolve(root,'demo',relative); await route.fulfill({status:200,body:await readFile(file),contentType:mime[extname(file)]||'application/octet-stream',headers:{'access-control-allow-origin':'*'}}); }
    catch { await route.fulfill({status:404,body:'Not found'}); }
  });
  await page.setContent(html,{waitUntil:'load'});
  checkpoint('content-loaded');
  await page.evaluate(() => {
    const store=new Map([['kt-drawer-h','740']]);
    Object.defineProperty(window,'localStorage',{configurable:true,value:{
      getItem:(key)=>store.has(key)?store.get(key):null,
      setItem:(key,value)=>store.set(key,String(value)),
      removeItem:(key)=>store.delete(key),
      clear:()=>store.clear()
    }});
  });
  await page.addStyleTag({path:resolve(root,'dist/kineto.css')});
  for (const file of ['dist/kineto.umd.js','demo/help-i18n.js','demo/help-i18n-extra.js','demo/playground-i18n.js','demo/module-metadata.js','demo/playground.js','demo/copy-i18n.js','demo/main.js']) {
    await page.addScriptTag({path:resolve(root,file)});
  }
  checkpoint('scripts-loaded');
  await page.waitForFunction(()=>window.Kineto&&window.Kineto.instanceCount>30,null,{timeout:15000});
  await page.waitForFunction(()=>!document.querySelector('.intro-loader'),null,{timeout:10000});
  await page.waitForTimeout(700);
  checkpoint('demo-initialized');

  // Chromium's integrated browser lane performs the exhaustive 397-field
  // audit. Firefox/WebKit still exercise a representative drawer here, but
  // avoid constructing every lazy settings body on hosted engines where that
  // synchronous DOM work can exceed the bounded browser retry window.
  const helpAudit = await page.evaluate(async (fullAudit) => {
    const allPanels = [...document.querySelectorAll('.kt-playground')];
    const panels = fullAudit ? allPanels : allPanels.slice(0, 8);
    const missing = [];
    let fields = 0;
    for (const panel of panels) {
      const body = panel.__buildBody?.();
      if (!body) continue;
      for (const field of body.querySelectorAll('.kt-playground__field')) {
        fields += 1;
        const help = field.querySelector('.kt-help');
        if (!help || !help.dataset.tip || help.getAttribute('aria-label') !== help.dataset.tip) {
          missing.push({
            field: `${field.dataset.module || '?'}:${field.dataset.key || '?'}`,
            hasHelp: Boolean(help),
            tip: help?.dataset.tip || '',
            ariaLabel: help?.getAttribute('aria-label') || ''
          });
        }
      }
    }
    const panel = panels.find((item) => item.__buildBody);
    panel.open = true;
    panel.dispatchEvent(new Event('toggle'));
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    const help = Array.from(document.querySelectorAll('.kt-drawer-sheet.is-open .kt-help'))
      .find((item) => {
        const box = item.getBoundingClientRect();
        return box.width > 0 && box.height > 0 && !item.closest('[hidden],.is-collapsed');
      });
    const rect = help?.getBoundingClientRect();
    help?.click();
    await new Promise((resolve) => setTimeout(resolve, 140));
    const tooltip = document.querySelector('.kt-tooltip.kt-playground-help');
    const result = {
      fields,
      missing,
      width: rect?.width || 0,
      height: rect?.height || 0,
      tooltipVisible: Boolean(tooltip && getComputedStyle(tooltip).display !== 'none' && Number(getComputedStyle(tooltip).opacity) > 0),
      tooltipText: tooltip?.textContent?.trim() || '',
      expectedText: help?.dataset.tip || ''
    };
    panel.open = false;
    return { ...result, auditedPanels: panels.length, totalPanels: allPanels.length };
  }, browserName === 'chromium');
  const minimumHelpFields = browserName === 'chromium' ? 374 : 1;
  assert.ok(helpAudit.fields >= minimumHelpFields, `generated settings fields must be audited (${JSON.stringify(helpAudit)})`);
  assert.deepEqual(helpAudit.missing, [], `every generated field needs one translated help button (${JSON.stringify(helpAudit.missing.slice(0, 20))})`);
  assert.ok(helpAudit.width >= 14 && helpAudit.height >= 14, `help buttons must not shrink or clip (${JSON.stringify(helpAudit)})`);
  assert.ok(helpAudit.tooltipVisible && helpAudit.tooltipText === helpAudit.expectedText, `clicking help must show its translated explanation (${JSON.stringify(helpAudit)})`);
  checkpoint('help-audit');

  const githubButton = await page.evaluate(() => {
    const button = document.querySelector('.hero-github');
    const icon = button.querySelector('.ph-github-logo');
    return { gap: getComputedStyle(button).gap, iconSize: getComputedStyle(icon).fontSize };
  });
  assert.deepEqual(githubButton, { gap: '0px', iconSize: '16px' }, 'hero GitHub button must use its dedicated icon spacing');

  const counterTimeRow = await page.evaluate(() => {
    const block = document.getElementById('mod-counter');
    const cards = [...block.querySelectorAll(':scope .module-block-body > .card')];
    return ['Clock', 'Elapsed seconds', 'Countdown'].map((title) => {
      const card = cards.find((item) => item.querySelector('h3')?.textContent.trim() === title);
      const rect = card?.getBoundingClientRect();
      return { title, left: rect?.left, top: rect?.top, width: rect?.width };
    });
  });
  assert.ok(counterTimeRow.every((item) => Number.isFinite(item.width)), `counter time cards must remain in the Counter block (${JSON.stringify(counterTimeRow)})`);
  assert.ok(counterTimeRow.every((item) => Math.abs(item.top - counterTimeRow[0].top) < 2), `Clock, elapsed seconds, and countdown must share one row (${JSON.stringify(counterTimeRow)})`);
  assert.ok(counterTimeRow.every((item) => Math.abs(item.width - counterTimeRow[0].width) < 2), `counter time cards must have equal widths (${JSON.stringify(counterTimeRow)})`);

  const relativeTimeDemo = await page.evaluate(() => {
    const card = document.querySelector('[data-demo-module="dateTime"]');
    const target = card?.querySelector('[data-kt-date-time]');
    const panel = card?.querySelector(':scope > .kt-playground');
    const body = panel?.__buildBody?.();
    return {
      text: target?.textContent?.trim() || '',
      date: target?.dataset.ktDate || '',
      hasSettings: Boolean(panel),
      fields: [...(body?.querySelectorAll('[data-module="dateTime"][data-key]') || [])].map((field) => field.dataset.key)
    };
  });
  assert.match(relativeTimeDemo.text, /(분 전|minute ago)/, 'relative-time demo must show a past relative timestamp: ' + JSON.stringify(relativeTimeDemo));
  assert.ok(relativeTimeDemo.date, 'relative-time demo must seed a real server-date value: ' + JSON.stringify(relativeTimeDemo));
  assert.ok(relativeTimeDemo.hasSettings && ['date', 'mode', 'locale', 'live'].every((key) => relativeTimeDemo.fields.includes(key)), 'relative-time demo must expose its settings: ' + JSON.stringify(relativeTimeDemo));
  checkpoint('counter-and-relative-time');

  const frameworkCopy = await page.evaluate(async () => {
    const panel = document.querySelector('[data-demo-module="dateTime"] .kt-playground');
    const body = panel?.__buildBody?.();
    body?.querySelector('[data-view="code"]')?.click();
    await new Promise(requestAnimationFrame);
    const tabs = [...(body?.querySelectorAll('[data-code-tab]') || [])].map((tab) => tab.dataset.codeTab);
    body?.querySelector('[data-code-tab="react"]')?.click();
    await new Promise(requestAnimationFrame);
    const react = body?.querySelector('.kt-playground__pre code')?.textContent || '';
    body?.querySelector('[data-code-tab="vue"]')?.click();
    await new Promise(requestAnimationFrame);
    const vue = body?.querySelector('.kt-playground__pre code')?.textContent || '';
    return { tabs, react, vue };
  });
  assert.deepEqual(frameworkCopy.tabs, ['html', 'js', 'react', 'vue', 'css'], `framework copy tabs must be available: ${JSON.stringify(frameworkCopy)}`);
  assert.match(frameworkCopy.react, /@dong-gri\/kineto\/react/);
  assert.match(frameworkCopy.react, /<Motion/);
  assert.match(frameworkCopy.vue, /@dong-gri\/kineto\/vue/);
  assert.match(frameworkCopy.vue, /useKineto/);
  checkpoint('framework-copy');

  const brushDrag = await page.evaluate(() => {
    const host = document.querySelector('[data-kt-brush-reveal]');
    const image = host?.querySelector('img');
    const event = new Event('dragstart', { bubbles: true, cancelable: true });
    image?.dispatchEvent(event);
    return { draggable: image?.draggable, prevented: event.defaultPrevented };
  });
  assert.equal(brushDrag.draggable, false, `Brush Reveal images must disable native browser ghost dragging: ${JSON.stringify(brushDrag)}`);
  assert.equal(brushDrag.prevented, true, `Brush Reveal must prevent dragstart before a browser ghost image appears: ${JSON.stringify(brushDrag)}`);
  checkpoint('brush-drag');

  const cover = await page.evaluate(() => {
    const text=document.querySelector('.demo-css-0a735447');
    const stage=text.closest('.demo-stage');
    return {font:Number.parseFloat(getComputedStyle(text).fontSize),textHeight:text.getBoundingClientRect().height,stageHeight:stage.getBoundingClientRect().height};
  });
  assert.ok(cover.font>=32,`Cover Reveal demo text must retain display scale (${cover.font}px)`);
  assert.ok(cover.textHeight<cover.stageHeight,'Cover Reveal demo text must fit within its stage');
  assert.equal(
    await page.locator('[data-page-effect="zoom"]').count(),
    1,
    'the compatibility-preserved Page Reveal zoom preset must remain discoverable in the demo'
  );
  await page.waitForFunction(() => !document.documentElement.classList.contains('kt-preload'), null, { timeout: 10000 });
  await page.waitForTimeout(750);
  const zoomHeader = await page.evaluate(async () => {
    const header = document.querySelector('.site-header');
    const beforeWidth = header.getBoundingClientRect().width;
    document.querySelector('[data-page-effect="zoom"]').click();
    // WebKit may expose the animation one frame later when the click handler
    // is attached by a separately loaded demo script. Wait for the actual root
    // animation instead of sampling a single frame and mistaking a race for a
    // broken Page Reveal implementation.
    const rootAnimations = await new Promise((resolve, reject) => {
      const deadline = performance.now() + 2000;
      const check = () => {
        const animations = document.documentElement.getAnimations().filter((animation) => animation.effect?.target === document.documentElement);
        if (animations.length) { resolve(animations); return; }
        if (performance.now() > deadline) { reject(new Error('Page Reveal zoom root animation was not created')); return; }
        requestAnimationFrame(check);
      };
      check();
    });
    rootAnimations.forEach((animation) => { animation.pause(); animation.currentTime = 140; });
    const style = getComputedStyle(header);
    const during = {
      opacity: Number(style.opacity),
      transform: style.transform,
      height: header.getBoundingClientRect().height,
      width: header.getBoundingClientRect().width,
      beforeWidth,
      bodyTransform: getComputedStyle(document.body).transform,
      rootTransform: getComputedStyle(document.documentElement).transform,
      rootOpacity: Number(getComputedStyle(document.documentElement).opacity),
      viewportCovers: [...document.documentElement.children].filter((node) => node.matches?.('div[aria-hidden="true"]') && node.style.zIndex === '99997').length
    };
    window.Kineto.destroyModule(document.body, 'pageReveal');
    return during;
  });
  assert.ok(zoomHeader.opacity > 0.99 && zoomHeader.height > 0, `Page Reveal zoom must keep the persistent header in the animated page layer (${JSON.stringify(zoomHeader)})`);
  assert.ok(zoomHeader.rootOpacity > 0 && zoomHeader.rootOpacity < 1, `Page Reveal zoom must fade the whole page from opacity 0 to 1 while scaling (${JSON.stringify(zoomHeader)})`);
  assert.notEqual(zoomHeader.rootTransform, 'none', `the real Zoom button must animate the root viewport consistently across Safari and Chromium (${JSON.stringify(zoomHeader)})`);
  assert.ok(zoomHeader.width < zoomHeader.beforeWidth, `the persistent header must zoom with the page instead of staying fixed (${JSON.stringify(zoomHeader)})`);
  assert.equal(zoomHeader.viewportCovers, 0, `Zoom must not flash a full-viewport cover over the header (${JSON.stringify(zoomHeader)})`);
  checkpoint('page-reveal');
  const webkitLayout = await page.evaluate(() => {
    const images = [...document.querySelectorAll('.lightbox-grid img')].map((item) => item.getBoundingClientRect());
    const dots = [...document.querySelectorAll('.kt-slider-dot')].map((item) => {
      const box = item.getBoundingClientRect();
      return { width:box.width, height:box.height, appearance:getComputedStyle(item).appearance, before:getComputedStyle(item,'::before').content, after:getComputedStyle(item,'::after').content };
    });
    const coverflow = document.querySelector('[data-kt-slider="coverflow"]');
    const dissolve = document.querySelector('.slider-demo--dissolve');
    const dissolveWrap = dissolve?.querySelector('.kt-slider-wrap');
    const dissolveSlide = dissolve?.querySelector('.kt-slide');
    return {
      lightboxRows: [...new Set(images.map((box) => Math.round(box.top)))].length,
      lightboxInside: images.every((box) => box.width > 0 && box.height > 0),
      dots,
      coverflowOverflow:getComputedStyle(coverflow).overflow,
      coverflowPadding:getComputedStyle(coverflow).paddingBottom,
      coverflowMargin:getComputedStyle(coverflow).marginBottom,
      dissolveClip:dissolveWrap?getComputedStyle(dissolveWrap).clipPath:'',
      dissolveSlideClip:dissolveSlide?getComputedStyle(dissolveSlide).clipPath:''
    };
  });
  assert.equal(webkitLayout.lightboxRows, 2, `Safari Lightbox thumbnails must form two non-overlapping rows (${JSON.stringify(webkitLayout)})`);
  assert.ok(webkitLayout.lightboxInside, `Safari Lightbox thumbnails must retain measurable grid cells (${JSON.stringify(webkitLayout)})`);
  assert.ok(webkitLayout.dots.length > 0 && webkitLayout.dots.every((dot) => dot.width >= 8 && dot.height === 8 && dot.appearance === 'none'), `Safari slider dots must not inherit native button appearance or collapse (${JSON.stringify(webkitLayout)})`);
  assert.ok(webkitLayout.dots.every((dot) => dot.before === 'none' && dot.after === 'none'), `slider dots must not paint Safari pseudo-element artifacts (${JSON.stringify(webkitLayout)})`);
  assert.equal(webkitLayout.coverflowOverflow, 'hidden', `Coverflow previews must be clipped at the demo boundary (${JSON.stringify(webkitLayout)})`);
  assert.ok(webkitLayout.coverflowPadding==='70px'&&webkitLayout.coverflowMargin==='-70px', `Coverflow must reserve a clipped lower shadow gutter without changing layout flow (${JSON.stringify(webkitLayout)})`);
  assert.ok(webkitLayout.dissolveClip.includes('inset(0')&&webkitLayout.dissolveSlideClip.includes('inset(0'), `Dissolve must hard-clip both scene and slides so inactive colors cannot leak through rounded subpixels (${JSON.stringify(webkitLayout)})`);
  checkpoint('engine-layout');
  const heavyLayout = await page.evaluate(async () => {
    const box = (element) => {
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height };
    };
    const vertical = document.querySelector('.stack-vertical');
    const verticalStage = vertical?.closest('.sticky-vertical-stage');
    const horizontal = document.querySelector('.horizontal-scroll');
    const horizontalViewport = horizontal?.querySelector('.kt-sticky-horizontal-viewport');
    const horizontalTrack = horizontal?.querySelector('.kt-sticky-horizontal-track');
    const floating = document.querySelector('.floating-scroll');
    const floatingViewport = floating?.querySelector('.kt-floating-viewport');
    const shadows = document.querySelector('[data-kt-scroll-shadows="mask"]');
    const stickyHost = [...document.querySelectorAll('.demo-scrollbox')].find((element) => element.querySelector('.demo-sticky-head'));
    const stickyHeader = stickyHost?.querySelector('.demo-sticky-head');
    const fixedHeader = document.querySelector('.cover-fixed-header');
    const pageTransition = document.querySelector('.pt-fx-row');
    const cursors = [...document.querySelectorAll('.kt-cursor')];
    const fullpages = [...document.querySelectorAll('#mod-fullpage [data-kt-fullpage]')];
    const radial = document.querySelector('[data-kt-slider="radial"]');
    const coverGallery = document.querySelector('#cover-gallery-demo');
    const stickyBefore = stickyHeader ? { scrollTop: stickyHost.scrollTop, progress: stickyHeader.style.getPropertyValue('--kt-header-progress'), stuck: stickyHeader.classList.contains('kt-stuck') } : null;
    if (stickyHost && stickyHeader) {
      stickyHost.scrollTop = Math.min(80, Math.max(0, stickyHost.scrollHeight - stickyHost.clientHeight));
      stickyHost.dispatchEvent(new Event('scroll'));
      await new Promise(requestAnimationFrame);
    }
    const stickyAfter = stickyHeader ? { scrollTop: stickyHost.scrollTop, progress: stickyHeader.style.getPropertyValue('--kt-header-progress'), stuck: stickyHeader.classList.contains('kt-stuck') } : null;
    if (stickyHost && stickyBefore) stickyHost.scrollTop = stickyBefore.scrollTop;
    return {
      stickyStack: {
        stage: box(verticalStage),
        host: box(vertical),
        children: [...(vertical?.children || [])].map((element) => ({ position: getComputedStyle(element).position, box: box(element) }))
      },
      horizontalStack: {
        host: box(horizontal),
        viewport: { ...box(horizontalViewport), position: horizontalViewport && getComputedStyle(horizontalViewport).position, overflow: horizontalViewport && getComputedStyle(horizontalViewport).overflow },
        track: { ...box(horizontalTrack), scrollWidth: horizontalTrack?.scrollWidth || 0, viewportWidth: horizontalViewport?.clientWidth || 0 },
        children: [...(horizontalTrack?.children || [])].map((element) => box(element))
      },
      floatingStack: {
        host: box(floating),
        viewport: { ...box(floatingViewport), position: floatingViewport && getComputedStyle(floatingViewport).position, overflow: floatingViewport && getComputedStyle(floatingViewport).overflow },
        children: [...(floatingViewport?.children || [])].map((element) => ({ position: getComputedStyle(element).position, box: box(element) }))
      },
      scrollShadows: {
        box: box(shadows),
        max: shadows ? shadows.scrollHeight - shadows.clientHeight : 0,
        mask: shadows ? (getComputedStyle(shadows).maskImage !== 'none' ? getComputedStyle(shadows).maskImage : getComputedStyle(shadows).webkitMaskImage) : 'none',
        end: shadows?.style.getPropertyValue('--kt-scroll-shadow-end') || ''
      },
      stickyHeader: {
        host: box(stickyHost),
        header: { ...box(stickyHeader), position: stickyHeader && getComputedStyle(stickyHeader).position },
        before: stickyBefore,
        after: stickyAfter
      },
      fixedHeader: { box: box(fixedHeader), position: fixedHeader && getComputedStyle(fixedHeader).position },
      pageTransition: { box: box(pageTransition), overflowX: pageTransition && getComputedStyle(pageTransition).overflowX, buttons: pageTransition?.querySelectorAll('button').length || 0 },
      cursor: { count: cursors.length, roots: cursors.slice(0, 4).map((element) => ({ position: getComputedStyle(element).position, pointerEvents: getComputedStyle(element).pointerEvents, box: box(element) })) },
      radial: {
        box: box(radial),
        items: [...(radial?.querySelectorAll('.kt-radial-item') || [])].map((item) => ({
          box: box(item),
          images: item.querySelectorAll('img').length,
          opacity: Number(getComputedStyle(item).opacity)
        }))
      },
      coverReveal: {
        box: box(coverGallery),
        targets: [...(coverGallery?.querySelectorAll('[data-kt-cover-reveal]') || [])].map((target) => ({
          box: box(target),
          wrapper: box(target.closest('.kt-cover-wrap')),
          panels: target.closest('.kt-cover-wrap')?.querySelectorAll('[aria-hidden="true"]').length || 0
        }))
      },
      fullpage: fullpages.map((host) => {
        const track = host.querySelector('.kt-fullpage-track');
        const hostBox = box(host);
        return { box: hostBox, track: box(track), overflow: getComputedStyle(host).overflow, sections: [...(track?.children || [])].map((section) => ({ box: box(section), overflowY: getComputedStyle(section).overflowY })) };
      })
    };
  });
  const positiveBox = (value) => value && value.width > 0 && value.height > 0;
  assert.ok(positiveBox(heavyLayout.stickyStack.stage) && positiveBox(heavyLayout.stickyStack.host), `sticky stack must retain measurable stage bounds: ${JSON.stringify(heavyLayout.stickyStack)}`);
  assert.ok(heavyLayout.stickyStack.children.length >= 3 && heavyLayout.stickyStack.children.every((item) => item.position === 'sticky' && positiveBox(item.box)), `vertical Sticky Stack cards must use native sticky positioning in every engine: ${JSON.stringify(heavyLayout.stickyStack)}`);
  assert.ok(positiveBox(heavyLayout.horizontalStack.viewport) && heavyLayout.horizontalStack.viewport.position === 'sticky' && heavyLayout.horizontalStack.viewport.overflow === 'hidden', `horizontal Sticky Stack must keep a clipped sticky viewport: ${JSON.stringify(heavyLayout.horizontalStack)}`);
  assert.ok(heavyLayout.horizontalStack.track.scrollWidth > heavyLayout.horizontalStack.track.viewportWidth && heavyLayout.horizontalStack.children.every(positiveBox), `horizontal Sticky Stack must preserve an overflowing measurable track: ${JSON.stringify(heavyLayout.horizontalStack)}`);
  assert.ok(positiveBox(heavyLayout.floatingStack.viewport) && heavyLayout.floatingStack.viewport.position === 'sticky' && heavyLayout.floatingStack.viewport.overflow === 'hidden' && heavyLayout.floatingStack.children.every((item) => item.position === 'absolute' && positiveBox(item.box)), `floating Sticky Stack must keep absolute layers inside a clipped sticky viewport: ${JSON.stringify(heavyLayout.floatingStack)}`);
  assert.ok(positiveBox(heavyLayout.scrollShadows.box) && heavyLayout.scrollShadows.max > 0 && heavyLayout.scrollShadows.mask.includes('gradient') && heavyLayout.scrollShadows.end, `Scroll Shadows mask must publish a real edge fade for overflowing content: ${JSON.stringify(heavyLayout.scrollShadows)}`);
  assert.ok(positiveBox(heavyLayout.stickyHeader.host) && positiveBox(heavyLayout.stickyHeader.header) && heavyLayout.stickyHeader.header.position === 'sticky' && Number(heavyLayout.stickyHeader.after.progress) > Number(heavyLayout.stickyHeader.before.progress) && heavyLayout.stickyHeader.after.stuck, `Sticky Header must react inside its own scroll host: ${JSON.stringify(heavyLayout.stickyHeader)}`);
  assert.ok(positiveBox(heavyLayout.fixedHeader.box) && heavyLayout.fixedHeader.position === 'sticky', `cover-to-fixed Sticky Header must retain its sticky layer: ${JSON.stringify(heavyLayout.fixedHeader)}`);
  assert.ok(positiveBox(heavyLayout.pageTransition.box) && heavyLayout.pageTransition.buttons >= 8, `Page Transition effects must retain a measurable clipped control row: ${JSON.stringify(heavyLayout.pageTransition)}`);
  assert.ok(heavyLayout.cursor.count > 0 && heavyLayout.cursor.roots.every((item) => item.position === 'fixed' && item.pointerEvents === 'none'), `Cursor layers must remain fixed and pointer-transparent: ${JSON.stringify(heavyLayout.cursor)}`);
  assert.ok(positiveBox(heavyLayout.radial.box) && heavyLayout.radial.items.length >= 5 && heavyLayout.radial.items.every((item) => item.images === 1 && positiveBox(item.box)), `Radial Carousel must keep one measurable image layer per item without ghost duplicates: ${JSON.stringify(heavyLayout.radial)}`);
  assert.ok(positiveBox(heavyLayout.coverReveal.box) && heavyLayout.coverReveal.targets.length >= 8 && heavyLayout.coverReveal.targets.every((target) => positiveBox(target.box) && positiveBox(target.wrapper) && target.panels >= 1), `Cover Reveal gallery must keep measurable target/wrapper layers without clipped ghost panels: ${JSON.stringify(heavyLayout.coverReveal)}`);
  assert.ok(heavyLayout.fullpage.length >= 3 && heavyLayout.fullpage.every((item) => positiveBox(item.box) && positiveBox(item.track) && item.overflow === 'hidden' && item.sections.length >= 2 && item.sections.every((section) => positiveBox(section.box))), `Fullpage tracks and sections must retain measurable clipped layers: ${JSON.stringify(heavyLayout.fullpage)}`);
  checkpoint('heavy-layout');
  const coverRevealModes = await page.evaluate(async () => {
    const canvas=document.createElement('canvas'); canvas.width=40; canvas.height=20;
    const context=canvas.getContext('2d'); context.fillStyle='#e3162a'; context.fillRect(0,0,28,20); context.fillStyle='#164ee3'; context.fillRect(28,0,12,20);
    const image=new Image();
    const ready=new Promise((resolve)=>{ image.onload=resolve; image.onerror=resolve; });
    image.src=canvas.toDataURL();
    // WebKit can leave `HTMLImageElement.decode()` pending indefinitely on a
    // detached data URL under a throttled hosted runner. The image is only a
    // tiny unit-test fixture, so a bounded load/error wait is sufficient and
    // keeps one engine from consuming the wrapper's entire retry budget.
    await Promise.race([ready,new Promise((resolve)=>setTimeout(resolve,2000))]);
    document.body.appendChild(image);
    const auto=Kineto.coverReveal(image,{colorMode:'auto',layers:2,duration:10,delay:5000,waitForImage:true});
    await new Promise(requestAnimationFrame);
    const colors=[...image.closest('.kt-cover-wrap').querySelectorAll('[aria-hidden="true"]')].map((panel)=>getComputedStyle(panel).backgroundColor);
    auto.destroy(); image.remove();
    const host=document.createElement('div'); host.style.cssText='position:fixed;top:10px;left:10px'; const text=document.createElement('div'); text.textContent='content mask'; host.appendChild(text); document.body.appendChild(host);
    const mask=Kineto.coverReveal(text,{mask:true,layers:2,color:'#f00',color2:'#0f0',duration:10,delay:5000,waitForImage:false});
    // IntersectionObserver/first-paint delivery can be slower in hosted
    // WebKit than in local runs. Synchronize on the actual mask style rather
    // than sampling a fixed 80ms window, while keeping the probe bounded.
    await new Promise((resolve, reject) => {
      const deadline = performance.now() + 2000;
      const check = () => {
        const current = text.closest('.kt-cover-wrap');
        if (current?.style.clipPath) { resolve(); return; }
        if (performance.now() > deadline) { reject(new Error('Cover Reveal mask did not establish a clip path')); return; }
        requestAnimationFrame(check);
      };
      check();
    });
    const wrap=text.closest('.kt-cover-wrap');
    const result={colors,panels:wrap.querySelectorAll('[aria-hidden="true"]').length,wrapClip:wrap.style.clipPath,contentClip:text.style.clipPath};
    mask.destroy(); host.remove();
    return result;
  });
  assert.equal(new Set(coverRevealModes.colors).size, 2, `auto Cover Reveal must retain distinct colors extracted from the image (${JSON.stringify(coverRevealModes)})`);
  assert.ok(coverRevealModes.panels === 1 && coverRevealModes.wrapClip !== '' && coverRevealModes.contentClip === '', `mask replacement must clip the complete wrapper above both content and colored panels (${JSON.stringify(coverRevealModes)})`);
  const lineMaskTiming = await page.evaluate(async () => {
    const host=document.createElement('div');host.style.cssText='position:fixed;top:40px;left:10px;width:64px';
    const text=document.createElement('div');text.textContent='first second third fourth fifth sixth seventh';host.appendChild(text);document.body.appendChild(host);
    const instance=Kineto.coverReveal(text,{mask:true,lines:true,layers:2,color:'#f00',color2:'#0f0',duration:1,stagger:200,waitForImage:false});
    // Wait for the first line's reveal and a later line's still-covered state
    // instead of assuming an 80ms first-paint window in hosted WebKit.
    await new Promise((resolve, reject) => {
      const deadline = performance.now() + 2000;
      const check = () => {
        const current = [...text.querySelectorAll('.kt-cover-line')].map((line) => line.style.clipPath);
        if (current.length > 1 && !current[0].includes('100') && current.slice(1).some((clip) => clip.includes('100'))) {
          resolve();
          return;
        }
        if (performance.now() > deadline) { reject(new Error('Cover Reveal line mask did not establish staggered clips')); return; }
        requestAnimationFrame(check);
      };
      check();
    });
    const lines=[...text.querySelectorAll('.kt-cover-line')];
    const result=lines.map((line)=>({
      clip:line.style.clipPath,
      panel:line.querySelector('[aria-hidden="true"]')?.style.transform||'',
      background:line.querySelector('[aria-hidden="true"]')?.style.background||''
    }));
    instance.destroy();host.remove();return result;
  });
  assert.ok(lineMaskTiming.length>1&&!lineMaskTiming[0].clip.includes('100')&&lineMaskTiming.slice(1).some((line)=>line.clip.includes('100')), `Mask must reveal each rendered line on its own stagger (${JSON.stringify(lineMaskTiming)})`);
  assert.ok(lineMaskTiming.every((line)=>line.panel&&line.background&&!/0,?\s*255,?\s*0/.test(line.background)), `the mask replacement must keep one color1 panel per line; a completed panel may already have exited by the time a slow engine reports the stagger (${JSON.stringify(lineMaskTiming)})`);
  checkpoint('cover-reveal-unit');
  await page.locator('#cover-gallery-demo').scrollIntoViewIfNeeded();
  await page.evaluate(() => document.querySelectorAll('#cover-gallery-demo img').forEach((image) => { image.loading='eager'; }));
  await page.waitForFunction(() => [...document.querySelectorAll('#cover-gallery-demo img')].every((image)=>image.complete&&image.naturalWidth>0),null,{timeout:10000});
  const galleryPalettes = await page.evaluate(async () => {
    const targets=[...document.querySelectorAll('#cover-gallery-demo [data-kt-cover-reveal]')];
    targets.forEach((target)=>Kineto.getInstance(target,'coverReveal')?.replay());
    await new Promise(requestAnimationFrame);
    return targets.map((target)=>({
      src:target.querySelector('img')?.getAttribute('src')||'',
      mode:target.dataset.ktColorMode,
      mask:target.dataset.ktMask,
      colors:target.dataset.ktColors||'',
      panels:[...target.closest('.kt-cover-wrap')?.querySelectorAll('[aria-hidden="true"]')||[]].map((panel)=>panel.style.background)
    }));
  });
  assert.ok(galleryPalettes.every((entry)=>entry.mode==='auto'&&entry.mask==='false'&&!entry.colors&&entry.panels.length===2&&entry.panels.every(Boolean)), `Cover Reveal gallery must extract two cover colors for every individual image with Mask off by default (${JSON.stringify(galleryPalettes)})`);
  const pairsBySource=new Map();
  galleryPalettes.forEach((entry)=>{
    const pair=entry.panels.join('|');
    if(pairsBySource.has(entry.src))assert.equal(pair,pairsBySource.get(entry.src),`the same source image must retain the same extracted pair (${entry.src})`);
    else pairsBySource.set(entry.src,pair);
  });
  assert.ok(new Set(pairsBySource.values()).size>=4, `different gallery images must produce independently sampled two-color pairs (${JSON.stringify(galleryPalettes)})`);
  const coverReset = await page.evaluate(async () => {
    const gallery=document.getElementById('cover-gallery-demo');
    const before=[...gallery.querySelectorAll('[data-kt-cover-reveal]')];
    window.__ktCoverResetTargets=before;
    const card=gallery.closest('.card');
    card.querySelector('.kt-playground>summary')?.click();
    await new Promise((resolve)=>setTimeout(resolve,250));
    const body=[...document.querySelectorAll('.kt-drawer-sheet .kt-playground__body')].find((node)=>!node.hidden);
    body?.querySelector('.kt-playground__toolbar button:last-child')?.click();
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    const after=[...gallery.querySelectorAll('[data-kt-cover-reveal]')];
    const result={
      sameTargets:after.length===before.length&&after.every((target,index)=>target===before[index]),
      coverInstances:after.filter((target)=>Kineto.getInstance(target,'coverReveal')).length,
      coverWrappers:after.filter((target)=>target.closest('.kt-cover-wrap')).length,
      flip:Boolean(Kineto.getInstance(gallery,'flip'))
    };
    document.querySelector('.kt-drawer-backdrop.is-open')?.click();
    await new Promise((resolve)=>setTimeout(resolve,250));
    return result;
  });
  assert.ok(coverReset.sameTargets&&coverReset.coverInstances===8&&coverReset.coverWrappers===8&&coverReset.flip, `Reset must preserve and recreate both nested Cover Reveal and Flip instances (${JSON.stringify(coverReset)})`);
  checkpoint('cover-reveal-gallery');
  const radial = page.locator('[data-kt-slider="radial"]');
  const radialDefault = await radial.evaluate((host)=>{
    const boxes=[...host.querySelectorAll('.kt-radial-item')].filter((item)=>Number(getComputedStyle(item).opacity)>.99).map((item)=>item.querySelector('img').getBoundingClientRect());
    const nearest=Math.min(...boxes.flatMap((box,index)=>boxes.slice(index+1).map((other)=>Math.hypot((box.left+box.width/2)-(other.left+other.width/2),(box.top+box.height/2)-(other.top+other.height/2)))));
    return {bottom:host.classList.contains('kt-radial--bottom'),radius:host.style.getPropertyValue('--kt-radial-radius'),solid:boxes.length,nearest,maxDiameter:Math.max(...boxes.map((box)=>box.width))};
  });
  assert.ok(radialDefault.bottom&&radialDefault.radius==='180px'&&radialDefault.solid>=3&&radialDefault.nearest>radialDefault.maxDiameter,`Radial demo must open in the spacious Bottom layout (${JSON.stringify(radialDefault)})`);
  await radial.evaluate((host)=>window.Kineto.updateModule(host,'slider',{position:'center',radius:96}));
  await radial.locator('.kt-radial-next').click();
  await page.waitForTimeout(260);
  const radialMotion = await radial.evaluate((host)=>{
    const centers=[...host.querySelectorAll('.kt-radial-item img')].map((item)=>{const box=item.getBoundingClientRect();return{x:box.left+box.width/2,y:box.top+box.height/2};});
    const nearest=centers.map((point,index)=>Math.min(...centers.filter((_,other)=>other!==index).map((other)=>Math.hypot(point.x-other.x,point.y-other.y))));
    return {spread:Math.max(...nearest)-Math.min(...nearest),nearest};
  });
  assert.ok(radialMotion.spread<2,`center Radial must rotate as one evenly spaced wheel without endpoint remnants (${JSON.stringify(radialMotion)})`);
  await page.waitForTimeout(500);
  const radialCenter = await radial.evaluate((host) => {
    const items = [...host.querySelectorAll('.kt-radial-item')];
    const images = items.map((item) => item.querySelector('img'));
    const imageRects = images.map((item) => item.getBoundingClientRect());
    const stageRect = host.closest('.demo-stage').getBoundingClientRect();
    const controls = host.querySelector('.kt-radial-controls');
    const visible = items.filter((item) => {
      const box = item.getBoundingClientRect();
      return Number(getComputedStyle(item).opacity) > 0.99 && box.width > 0 && box.height > 0;
    });
    return {
      position: host.classList.contains('kt-radial--center'),
      visible: visible.length,
      total: items.length,
      uniqueTransforms: new Set(items.map((item) => getComputedStyle(item).transform)).size,
      controlsZ: Number(getComputedStyle(controls).zIndex),
      hubZ: Number(getComputedStyle(host.querySelector('.kt-radial-hub')).zIndex),
      maxItemZ: Math.max(...items.map((item) => Number(getComputedStyle(item).zIndex))),
      radius:host.style.getPropertyValue('--kt-radial-radius'),
      opaque:images.every((item)=>Number(getComputedStyle(item).opacity)===1),
      inside:imageRects.every((box)=>box.top>=stageRect.top&&box.right<=stageRect.right&&box.bottom<=stageRect.bottom&&box.left>=stageRect.left),
      minCenterDistance:Math.min(...imageRects.flatMap((box,index)=>imageRects.slice(index+1).map((other)=>Math.hypot((box.left+box.width/2)-(other.left+other.width/2),(box.top+box.height/2)-(other.top+other.height/2))))),
      maxDiameter:Math.max(...imageRects.map((box)=>box.width))
    };
  });
  assert.ok(radialCenter.position && radialCenter.visible === radialCenter.total, `center Radial demo must show the complete wheel (${JSON.stringify(radialCenter)})`);
  assert.equal(radialCenter.uniqueTransforms, radialCenter.total, `center Radial must leave no overlapping transition ghosts (${JSON.stringify(radialCenter)})`);
  assert.ok(radialCenter.opaque && radialCenter.inside && radialCenter.minCenterDistance > radialCenter.maxDiameter, `center Radial demo items must stay opaque, separated, and inside the stage (${JSON.stringify(radialCenter)})`);
  assert.ok(radialCenter.controlsZ > radialCenter.hubZ, `Radial paging controls must remain above the hub stacking context (${JSON.stringify(radialCenter)})`);
  const radialInput=await radial.evaluate((host)=>{
    const image=host.querySelector('.kt-radial-item img');
    const instance=window.Kineto.getInstance(host,'slider');
    const active=host.querySelector('.kt-radial-item.kt-active img').getBoundingClientRect();
    return {draggable:image.draggable,touchAction:getComputedStyle(host).touchAction,index:instance.index,x:active.left+active.width/2,y:active.top+active.height/2};
  });
  assert.equal(radialInput.draggable,false,'Radial images must disable native browser ghost dragging');
  assert.equal(radialInput.touchAction,'pan-x','center Radial must retain horizontal page scroll while owning its vertical swipe axis');
  await page.mouse.move(radialInput.x,radialInput.y);
  await page.mouse.down();
  await page.mouse.move(radialInput.x,radialInput.y+90,{steps:5});
  await page.mouse.up();
  const radialDragResult=await radial.evaluate((host)=>{
    const instance=window.Kineto.getInstance(host,'slider');
    const afterDrag=instance.index;
    host.querySelector('.kt-radial-item').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
    return {afterDrag,afterClick:instance.index};
  });
  const {afterDrag:radialAfterDrag,afterClick:radialAfterClick}=radialDragResult;
  assert.notEqual(radialAfterDrag,radialInput.index,`Radial must respond to a pointer drag (${JSON.stringify({radialInput,radialAfterDrag})})`);
  assert.equal(radialAfterClick,radialAfterDrag,`Radial must suppress the click generated by a drag (${JSON.stringify({radialInput,radialAfterDrag,radialAfterClick})})`);
  checkpoint('radial');
  const segmentedDemoTab=page.locator('#mod-tabs .demo-tabs .demo-tab',{hasText:'Segmented'});
  await segmentedDemoTab.click();
  await page.waitForTimeout(80);
  const initialSegmentIndicator=await page.evaluate(()=>{
    const panel=document.querySelector('#mod-tabs .demo-tabpanel:not([hidden])');
    const indicator=panel.querySelector('.kt-tabs__indicator');
    const rect=indicator.getBoundingClientRect();
    return {
      width:rect.width,
      height:rect.height,
      background:getComputedStyle(indicator).backgroundColor
    };
  });
  assert.ok(initialSegmentIndicator.width>20&&initialSegmentIndicator.height>20,
    `a tab revealed after hidden initialization must place its active pill: ${JSON.stringify(initialSegmentIndicator)}`);
  assert.notEqual(initialSegmentIndicator.background,'rgba(0, 0, 0, 0)',
    'the initial segmented-tab pill must have a visible background');
  checkpoint('tabs');

  const megaTabs = await page.evaluate(() => {
    const card = document.querySelector('#mod-megaMenu .card[data-demo-tabs]');
    const panels = [...card.querySelectorAll('.demo-tabpanel')];
    const tabs = [...card.querySelectorAll(':scope .demo-tabs > .demo-tab')];
    const hosts = [...card.querySelectorAll(':scope > .demo-tabhosts > .kt-playground-host')];
    return {
      labels: tabs.map((tab) => tab.textContent.trim()),
      targetCounts: panels.map((panel) => panel.querySelectorAll('[data-kt-mega-menu]').length),
      overviewItems: panels[0]?.querySelectorAll(':scope > nav > ul > li > button').length || 0,
      settingsHosts: hosts.length,
      settingsTargets: hosts.map((host) => host.dataset.settingsFor)
    };
  });
  assert.deepEqual(megaTabs.labels,['전체','드롭다운','메가메뉴'],'GNB examples must be grouped into overview/dropdown/mega tabs');
  assert.deepEqual(megaTabs.targetCounts,[1,1,1],'each GNB tab must own one independently initialized menu');
  assert.equal(megaTabs.overviewItems,3,'the read-only overview must compare dropdown, click, and mega triggers');
  assert.equal(megaTabs.settingsHosts,2,'overview must stay read-only while both detail tabs own settings');
  assert.deepEqual(megaTabs.settingsTargets,['megaMenu','megaMenu'],'each GNB detail tab must own a Mega Menu settings panel');
  checkpoint('mega-menu-structure');

  await page.setViewportSize({width:700,height:807});
  const solutionTrigger=page.locator('#mod-megaMenu .demo-tabpanel:not([hidden]) .kt-menu-trigger',{hasText:'솔루션'});
  await solutionTrigger.hover();
  await page.waitForTimeout(260);
  assert.equal(
    await solutionTrigger.getAttribute('aria-expanded'),
    'true',
    'wrapped medium-width mega-menu trigger must open on its first hover'
  );
  const scrollVelocityGrid = await page.evaluate(() => {
    const grid = document.querySelector('#mod-scrollVelocity .module-block-body.grid');
    const cards = [...grid.querySelectorAll(':scope > .card')];
    const rows = new Map();
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const top = Math.round(rect.top);
      if (!rows.has(top)) rows.set(top, []);
      rows.get(top).push({ width: rect.width, className: card.className });
    });
    const last = [...rows.entries()].sort(([a], [b]) => a - b).at(-1)?.[1] || [];
    return {
      gridWidth: grid.getBoundingClientRect().width,
      rows: [...rows.values()],
      last
    };
  });
  assert.equal(scrollVelocityGrid.last.length, 1, 'Scroll Velocity should expose its one-card final row at 700px');
  assert.ok(
    scrollVelocityGrid.last[0].width >= scrollVelocityGrid.gridWidth - 2,
    `Scroll Velocity final card must fill the 700px row: ${JSON.stringify(scrollVelocityGrid)}`
  );
  checkpoint('responsive-width');

  await page.setViewportSize({width:390,height:844});
  // Exactly one visible trigger must match, or the assertions below could be
  // reading a hidden duplicate from one of the other GNB tabs. Those tabs carry
  // `hidden`, so their panels never lay out and `grid-template-columns` would
  // come back as the *specified* value instead of the used one.
  assert.equal(await solutionTrigger.count(), 1,
    'exactly one visible 솔루션 trigger must match, otherwise the mobile assertions read a hidden duplicate');
  // Re-enter after resizing to cancel any desktop hover-close timer. Then
  // exercise a rapid close/reopen by click: narrow layouts must remain usable
  // even when the environment still reports a fine, hoverable pointer.
  await solutionTrigger.hover();
  await solutionTrigger.evaluate((trigger) => new Promise((resolve, reject) => {
    const deadline = performance.now() + 2000;
    const check = () => {
      if (trigger.getAttribute('aria-expanded') === 'true') { resolve(); return; }
      if (performance.now() > deadline) { reject(new Error('mobile mega trigger did not open on hover')); return; }
      requestAnimationFrame(check);
    };
    check();
  }));
  const mobileClickStates = await solutionTrigger.evaluate((trigger) => {
    trigger.click();
    const closed = trigger.getAttribute('aria-expanded');
    trigger.click();
    return { closed, reopened: trigger.getAttribute('aria-expanded') };
  });
  assert.equal(mobileClickStates.closed, 'false',
    'mobile-width click must close a hover-opened menu');
  assert.equal(mobileClickStates.reopened, 'true',
    'mobile-width click must immediately reopen a closing menu');
  // `aria-expanded` flips before the panel has been laid out, and a fixed
  // `waitForTimeout` is not a synchronisation primitive — on a slow CI runner it
  // expires first. That is the whole failure: reading a panel that is still
  // `hidden` returns rect 0x0, and `getComputedStyle` on a `display:none`
  // element yields the COMPUTED value `repeat(2, minmax(0px, 1fr))` rather than
  // the used value (measured: `149px 149px`). Splitting that on spaces counts 3, so
  // the column assertion failed with a plausible-looking `3` while the CSS was
  // correct all along. Wait for the specific panel AND its grid child to have a
  // real box before measuring anything.
  await solutionTrigger.evaluate((trigger) => new Promise((resolve, reject) => {
    const deadline = performance.now() + 10000;
    const check = () => {
      const panel = trigger.closest('li').querySelector(':scope > .kt-menu-panel');
      const grid = panel?.firstElementChild;
      const pr = panel?.getBoundingClientRect();
      const gr = grid?.getBoundingClientRect();
      if (trigger.getAttribute('aria-expanded') === 'true'
        && panel && !panel.hidden
        && getComputedStyle(panel).display !== 'none'
        && pr.width > 0 && pr.height > 0
        && gr.width > 0 && gr.height > 0) { resolve(); return; }
      if (performance.now() > deadline) {
        reject(new Error(`mobile mega panel never laid out: ${JSON.stringify({
          expanded: trigger.getAttribute('aria-expanded'),
          hidden: panel?.hidden,
          display: panel && getComputedStyle(panel).display,
          panelRect: pr && [pr.width, pr.height],
          gridRect: gr && [gr.width, gr.height]
        })}`));
        return;
      }
      requestAnimationFrame(check);
    };
    check();
  }));
  const mobileMega = await solutionTrigger.evaluate((trigger) => {
    const menu = trigger.closest('[data-kt-mega-menu]');
    const topList = menu.querySelector(':scope > ul');
    const panel = trigger.closest('li').querySelector(':scope > .kt-menu-panel');
    const grid = panel.firstElementChild;
    const rect = panel.getBoundingClientRect();
    const gridRect = grid.getBoundingClientRect();
    const rawColumns = getComputedStyle(grid).gridTemplateColumns;
    const columns = rawColumns.split(' ').length;
    return {
      responsiveClass: menu.classList.contains('kt-menu--responsive-scroll'),
      topOverflowX: getComputedStyle(topList).overflowX,
      topWrap: getComputedStyle(topList).flexWrap,
      left: rect.left,
      right: rect.right,
      width: rect.width,
      height: rect.height,
      viewportWidth: innerWidth,
      viewportHeight: innerHeight,
      columns,
      // Kept in the payload so a future failure says WHY: a `repeat(...)` string
      // here means the panel was not laid out, which is a synchronisation bug,
      // not a stylesheet bug.
      rawColumns,
      expanded: trigger.getAttribute('aria-expanded'),
      panelHidden: panel.hidden,
      panelDisplay: getComputedStyle(panel).display,
      gridWidth: gridRect.width,
      gridHeight: gridRect.height,
      overflowY: getComputedStyle(panel).overflowY
    };
  });
  // Read the state first, so the column assertion can never be satisfied or
  // defeated by an unlaid-out panel again.
  assert.equal(mobileMega.expanded, 'true',
    `mobile mega trigger must still be expanded when measured: ${JSON.stringify(mobileMega)}`);
  assert.equal(mobileMega.panelHidden, false,
    `mobile mega panel must not be hidden when measured: ${JSON.stringify(mobileMega)}`);
  assert.notEqual(mobileMega.panelDisplay, 'none',
    `mobile mega panel must be displayed when measured: ${JSON.stringify(mobileMega)}`);
  assert.ok(mobileMega.width > 0 && mobileMega.height > 0,
    `mobile mega panel must have a real box when measured: ${JSON.stringify(mobileMega)}`);
  assert.ok(mobileMega.gridWidth > 0 && mobileMega.gridHeight > 0,
    `mobile mega grid must have a real box when measured: ${JSON.stringify(mobileMega)}`);
  assert.ok(!/repeat\(/.test(mobileMega.rawColumns),
    `grid-template-columns must be a resolved used value, not a specified one — an unlaid-out panel returns "repeat(...)" whose space-split length is misleading: ${JSON.stringify(mobileMega)}`);
  assert.ok(mobileMega.left >= -1 && mobileMega.right <= mobileMega.viewportWidth + 1,
    `mobile mega menu must remain inside the viewport: ${JSON.stringify(mobileMega)}`);
  assert.ok(mobileMega.height <= mobileMega.viewportHeight * .6 + 1,
    `mobile mega menu must cap its height: ${JSON.stringify(mobileMega)}`);
  assert.equal(mobileMega.columns, 2, `mobile mega menu should use a compact two-column layout: ${JSON.stringify(mobileMega)}`);
  assert.equal(mobileMega.overflowY, 'auto', 'mobile mega menu should scroll internally only when needed');
  assert.equal(mobileMega.responsiveClass, true, 'the demo should opt into the library scroll mode');
  assert.equal(mobileMega.topOverflowX, 'auto', 'mobile top-level menu items should be swipeable');
  assert.equal(mobileMega.topWrap, 'nowrap', 'mobile top-level menu items should stay on one row');
  checkpoint('mobile-mega-menu');
  await page.locator('#mod-megaMenu .demo-tabs > .demo-tab',{hasText:'드롭다운'}).click();
  const dropdownTrigger=page.locator('#mod-megaMenu .demo-tabpanel:not([hidden]) .kt-menu-trigger',{hasText:'라이브러리'});
  await dropdownTrigger.click();
  const mobileDropdown=await dropdownTrigger.evaluate((trigger)=>{
    const panel=trigger.closest('li').querySelector(':scope > .kt-menu-panel');
    const rect=panel.getBoundingClientRect();
    return {expanded:trigger.getAttribute('aria-expanded'),hidden:panel.hidden,position:getComputedStyle(panel).position,left:rect.left,right:rect.right,width:rect.width,viewportWidth:innerWidth};
  });
  assert.equal(mobileDropdown.expanded,'true',`mobile Dropdown must open by touch/click: ${JSON.stringify(mobileDropdown)}`);
  assert.equal(mobileDropdown.hidden,false,`mobile Dropdown panel must be visible: ${JSON.stringify(mobileDropdown)}`);
  assert.equal(mobileDropdown.position,'fixed',`mobile Dropdown must escape the card's clipping context: ${JSON.stringify(mobileDropdown)}`);
  assert.ok(mobileDropdown.width>0&&mobileDropdown.left>=-1&&mobileDropdown.right<=mobileDropdown.viewportWidth+1,`mobile Dropdown must remain inside the viewport: ${JSON.stringify(mobileDropdown)}`);
  checkpoint('mobile-dropdown');

  const splitEffect=page.locator('.pt-fx-row [data-pt-preview="split"]');
  await splitEffect.click();
  await page.waitForTimeout(320);
  const mobilePageEffects=await page.evaluate(()=>{
    const row=document.querySelector('.pt-fx-row');
    const active=row.querySelector('.is-active').getBoundingClientRect();
    const bounds=row.getBoundingClientRect();
    return {
      clientWidth:row.clientWidth,
      scrollWidth:row.scrollWidth,
      scrollLeft:row.scrollLeft,
      overflowX:getComputedStyle(row).overflowX,
      wrap:getComputedStyle(row).flexWrap,
      activeInside:active.left>=bounds.left-1&&active.right<=bounds.right+1
    };
  });
  assert.ok(mobilePageEffects.scrollWidth>mobilePageEffects.clientWidth,
    `mobile Page Transition effects should form a swipeable row: ${JSON.stringify(mobilePageEffects)}`);
  assert.equal(mobilePageEffects.overflowX,'auto');
  assert.equal(mobilePageEffects.wrap,'nowrap');
  assert.ok(mobilePageEffects.scrollLeft>0&&mobilePageEffects.activeInside,
    `selecting a hidden Page Transition effect should reveal it: ${JSON.stringify(mobilePageEffects)}`);

  const mobileCompounds=await page.evaluate(()=>[...document.querySelectorAll(
    '.module-block-body--dense [data-kt-terminal-style^="spinner-"], .module-block-body--dense [data-kt-terminal-style="quad-dots-label"]'
  )].map((indicator)=>{
    const content=indicator.getBoundingClientRect();
    const stage=indicator.closest('.demo-stage').getBoundingClientRect();
    const card=indicator.closest('.card').getBoundingClientRect();
    const grid=indicator.closest('.module-block-body--dense').getBoundingClientRect();
    return {
      style:indicator.getAttribute('data-kt-terminal-style'),
      inside:content.left>=stage.left-1&&content.right<=stage.right+1,
      fullRow:card.width>=grid.width-2
    };
  }));
  assert.ok(mobileCompounds.length>=5,'compound loading demos must remain present on mobile');
  assert.ok(mobileCompounds.every((item)=>item.inside),`compound loading text must fit its mobile stage: ${JSON.stringify(mobileCompounds)}`);
  assert.ok(mobileCompounds.every((item)=>item.fullRow),`compound loading cards must use the full mobile row: ${JSON.stringify(mobileCompounds)}`);
  checkpoint('mobile-loading');

  await page.setViewportSize({width:1437,height:807});
  const summary=page.locator('[data-settings-for="loadingIndicator"]').first().locator('.kt-playground > summary');
  await summary.click();
  await page.waitForTimeout(350);
  const drawerBefore=await page.evaluate(() => {
    const sheet=document.querySelector('.kt-drawer-sheet');
    const grip=document.querySelector('.kt-drawer-grip');
    const groups=document.querySelector('.kt-playground__viewstage>.kt-playground__groups.is-active');
    const r=sheet.getBoundingClientRect(),g=grip.getBoundingClientRect();
    return {height:r.height,maxAllowed:Math.round(innerHeight*.44),gripHeight:g.height,stored:localStorage.getItem('kt-drawer-h'),groupsOverflow:getComputedStyle(groups).overflowY,bodyOverflow:getComputedStyle(groups.closest('.kt-playground__body')).overflow};
  });
  assert.equal(drawerBefore.stored,null,'stale persisted drawer height must be cleared');
  assert.ok(drawerBefore.height<=drawerBefore.maxAllowed+1,'desktop drawer must leave more than half the live demo visible');
  assert.ok(drawerBefore.gripHeight<=24,'drawer grip must stay compact');
  assert.equal(drawerBefore.groupsOverflow,'auto','settings groups must own vertical scrolling');
  assert.equal(drawerBefore.bodyOverflow,'hidden','portal body itself must not become the scroll container');
  checkpoint('drawer-layout');

  const resize=await page.evaluate(() => {
    const sheet=document.querySelector('.kt-drawer-sheet');
    const grip=document.querySelector('.kt-drawer-grip');
    const before=sheet.getBoundingClientRect().height;
    grip.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:41,pointerType:'mouse',button:0,clientY:500}));
    grip.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerId:41,pointerType:'mouse',buttons:1,clientY:460}));
    grip.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:41,pointerType:'mouse',button:0,clientY:460}));
    return {before,after:sheet.getBoundingClientRect().height};
  });
  assert.ok(Math.abs(resize.after-(resize.before+40))<.1,'the visible grey grip must resize the drawer');
  checkpoint('complete');
  console.log('Demo polish browser QA OK',JSON.stringify({cover,initialSegmentIndicator,megaTabs,mobileMega,mobilePageEffects,mobileCompounds,drawerBefore,resize}));
} finally {
  await browser.close();
}
