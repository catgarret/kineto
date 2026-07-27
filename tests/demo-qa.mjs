/* global window, document, getComputedStyle, Kineto */
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { chromium } from 'playwright';
import { killBrowserServer } from './browser-cleanup.mjs';
import { build } from 'vite';
import { runAnimatedMediaQa } from './animated-media-helper.mjs';

const root = resolve(import.meta.dirname, '..');
const contract = JSON.parse(await readFile(resolve(root, 'kineto.features.json'), 'utf8'));
let html = await readFile(resolve(root, 'demo/index.html'), 'utf8');
const inlineScript = await readFile(resolve(root, 'demo/main.js'), 'utf8');
html = html
  .replace(/<link rel="stylesheet" href="\.\.\/dist\/kineto\.css[^"]*">/, '')
  .replace(/<script src="\.\.\/dist\/kineto\.umd\.js[^"]*"><\/script>/, '')
  .replace(/<script src="\.\/main\.js[^"]*"><\/script>\s*<\/body>/, '</body>')
  .replace('<head>', '<head><base href="http://kineto.local/demo/">');
const mimeTypes = { '.svg':'image/svg+xml','.png':'image/png','.gif':'image/gif','.webp':'image/webp','.js':'text/javascript','.css':'text/css' };
const smokeOutDir = resolve(import.meta.dirname, '.smoke');
await mkdir(smokeOutDir, { recursive: true });
await build({
  configFile: false,
  logLevel: 'silent',
  build: {
    outDir: smokeOutDir,
    emptyOutDir: true,
    lib: {
      entry: resolve(import.meta.dirname, 'browser-smoke-page.js'),
      name: 'KinetoSmoke',
      formats: ['iife'],
      fileName: () => 'browser-smoke.js'
    }
  }
});
const smokeFixture = '<!doctype html><html lang="ko"><head><meta charset="UTF-8"><style>body{min-height:3000px}.fixture{width:240px;min-height:60px;margin:12px}.kt-slider-wrap{width:240px;overflow:hidden}.kt-slider-track{display:flex}.kt-slide{position:relative;min-width:240px}#sticky>div{height:40px}</style></head><body><main id="fixtures"></main></body></html>';

let browserServer;
let browser;
let passed = false;
try {
  browserServer = await chromium.launchServer({
    ...(process.env.MK_CHROMIUM ? { executablePath: process.env.MK_CHROMIUM } : {}),
    headless:true,
    args:['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required']
  });
  browser = await chromium.connect(browserServer.wsEndpoint());
  const page = await browser.newPage({ viewport:{ width:1440,height:900 }, reducedMotion:'no-preference' });
  const runtimeErrors=[];
  page.on('pageerror',(error)=>runtimeErrors.push(error.stack||error.message));
  page.on('console',(message)=>{ if(message.type()==='error') runtimeErrors.push(`console: ${message.text()}`); });
  // Font CDNs are unreachable in the offline QA sandbox — stub them.
  await page.route(/fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net/, (route)=>route.fulfill({status:200,body:'',contentType:'text/css'}));
  await page.route('http://kineto.local/**', async (route) => {
    const url=new URL(route.request().url());
    const relative=decodeURIComponent(url.pathname).replace(/^\/demo\//,'');
    try { const path=resolve(root,'demo',relative); const body=await readFile(path); await route.fulfill({status:200,body,contentType:mimeTypes[extname(path)]||'application/octet-stream'}); }
    catch { await route.fulfill({status:404,body:'Not found'}); }
  });
  await page.setContent(html,{waitUntil:'load'});
  await page.addStyleTag({path:resolve(root,'dist/kineto.css')});
  await page.addScriptTag({path:resolve(root,'dist/kineto.umd.js')});
  await page.addScriptTag({path:resolve(root,'demo/help-i18n.js')});
  await page.addScriptTag({path:resolve(root,'demo/help-i18n-extra.js')});
  await page.addScriptTag({path:resolve(root,'demo/playground.js')});
  await page.addScriptTag({content:inlineScript});
  // The demo defers module init behind the intro loader (full-load gate);
  // wait until the modules are actually running before asserting.
  await page.waitForFunction(()=>window.Kineto&&window.Kineto.instanceCount>30,null,{timeout:10000});
  await page.waitForTimeout(700);

  const surface=await page.evaluate(()=>({
    version:Kineto.version, modules:Object.keys(Kineto.registry).length, chips:document.querySelectorAll('#module-list .mod-index-item').length,
    categories:document.querySelectorAll('[data-demo]').length, panels:document.querySelectorAll('.kt-playground').length,
    codeBlocks:document.querySelectorAll('.kt-playground__code').length, notice:document.querySelectorAll('.hero-meta').length,
    optionContract:window.KinetoPlayground.publicOptions,
    shadowHelp:Object.values(window.MK_HELP_I18N||{}).every((locale)=>
      locale.cardGlow?.shadowCss&&locale.tilt?.tiltShadowCss
      &&locale.coverReveal?.colorMode&&locale.coverReveal?.colors
    )
  }));
  assert.equal(surface.version,contract.libraryVersion);
  assert.ok(surface.modules>=contract.moduleCount,`registry entries ${surface.modules}`); assert.equal(surface.chips,contract.moduleCount); assert.ok(surface.categories>=6,`categories ${surface.categories}`);
  assert.ok(surface.panels>=55,`expected at least 55 playground panels, got ${surface.panels}`);
  assert.equal(surface.codeBlocks,0,'playground bodies should stay lazy until opened'); assert.equal(surface.notice,1);
  assert.deepEqual(surface.optionContract,Object.fromEntries(contract.modules.map((module)=>[module.name,module.publicOptions])));
  assert.equal(surface.shadowHelp,true,'Tilt/Card Glow shadow help must be translated in every demo locale');

  const missing=await page.evaluate(()=>Array.from(document.querySelectorAll('.card')).filter((card)=>
    card.querySelector('[data-kt-counter],[data-kt-lazy],[data-kt-overflow-text],[data-kt-text-split],[data-kt-typewriter],[data-kt-text-reveal],[data-kt-text-transition],[data-kt-glitch],[data-kt-text-fill],[data-kt-reveal],[data-kt-scroll-velocity],[data-kt-slider],[data-kt-ambient-media],[data-kt-lightbox],[data-kt-card-glow],[data-kt-tilt],[data-kt-cursor],[data-kt-magnetic],[data-kt-ripple],[data-kt-vibrate],[data-kt-mouse-parallax],[data-loader-type]') && !card.querySelector(':scope > .kt-playground')).length);
  assert.equal(missing,0,'an adjustable demo card is missing its playground');

  const shadowSettings=await page.evaluate(async()=>{
    const sleep=(ms)=>new Promise((resolve)=>setTimeout(resolve,ms));
    const glowCard=document.querySelector('[data-demo-module="cardGlow"]');
    const glowPanel=glowCard?.querySelector(':scope > .kt-playground');
    const glowBody=glowPanel?.__buildBody?.();
    const glowToggle=glowBody?.querySelector('[data-option="shadow"]');
    if(!glowToggle)return {found:false};
    glowToggle.checked=true;
    glowToggle.dispatchEvent(new window.Event('change',{bubbles:true}));
    await sleep(180);
    const glowTarget=glowCard.matches('[data-kt-card-glow]')?glowCard:glowCard.querySelector('[data-kt-card-glow]');
    const glowFields=['shadowColor','shadowOpacity','shadowBlur','shadowSpread','shadowX','shadowY','shadowFollow','shadowHoverOnly','shadowInset','shadowCss'];
    const glowVisible=glowFields.every((key)=>!glowBody.querySelector(`[data-option="${key}"]`)?.closest('.kt-playground__field')?.hidden);
    const glowLive=Boolean(
      Kineto.getInstance(glowTarget,'cardGlow')
      && glowTarget.style.getPropertyValue('--kt-card-glow-shadow-runtime')
      && glowCard.querySelector(':scope > .kt-playground')===glowPanel
    );
    const tiltCard=document.querySelector('[data-demo-module="tilt"]');
    const tiltPanel=tiltCard?.querySelector(':scope > .kt-playground');
    const tiltBody=tiltPanel?.__buildBody?.();
    const tiltFields=['tiltShadow','tiltShadowColor','tiltShadowOpacity','tiltShadowBlur','tiltShadowSpread','tiltShadowX','tiltShadowY','tiltShadowFollow','tiltShadowHoverOnly','tiltShadowInset','tiltShadowCss'];
    const tiltSurface=tiltFields.every((key)=>Boolean(tiltBody?.querySelector(`[data-option="${key}"]`)));
    return {found:true,glowVisible,glowLive,tiltSurface};
  });
  assert.equal(shadowSettings.found,true,'Card Glow shadow settings were not found');
  assert.equal(shadowSettings.glowVisible,true,'enabling Card Glow shadow must reveal all dependent controls');
  assert.equal(shadowSettings.glowLive,true,'Card Glow shadow setting must update live without losing its panel or instance');
  assert.equal(shadowSettings.tiltSurface,true,'Tilt must expose its complete shadow controls');

  const pop=page.locator('#counter .card').filter({has:page.getByRole('heading',{name:'Pop',exact:true})});
  await pop.locator('.kt-playground').evaluate((el)=>{el.open=true;});
  const baseCount=await page.evaluate(()=>Kineto.instanceCount);
  const drawer=page.locator('.kt-playground__body.is-portal:not([hidden])');
  await drawer.locator('[data-option="to"]').fill('123456'); await drawer.locator('[data-option="to"]').dispatchEvent('change'); await page.waitForTimeout(220);
  const popState=await pop.evaluate((card)=>({text:card.querySelector('[data-kt-counter="pop"]').textContent,html:card.querySelector('.kt-playground').dataset.htmlCode,js:card.querySelector('.kt-playground').dataset.jsCode,count:Kineto.instanceCount}));
  assert.equal(popState.text,'123,456'); assert.match(popState.html,/data-kt-to="123456"/); assert.match(popState.js,/"to": 123456/); assert.equal(popState.count,baseCount);
  await drawer.locator('.kt-playground__toolbar').getByRole('button',{name:'초기화',exact:true}).click(); await page.waitForTimeout(180); assert.equal(await pop.locator('[data-kt-counter="pop"]').textContent(),'98,760');

  // Every adjustable card must survive a representative live edit. This is a
  // cross-module invariant, not a Card Glow special case: the lightweight
  // <details>/<summary>, demo DOM, and active instance count must remain stable
  // after the playground destroys/recreates a module.
  const panelSweep=await page.evaluate(async()=>{
    const sleep=(ms)=>new Promise((resolve)=>setTimeout(resolve,ms));
    const failures=[];
    const panels=[...document.querySelectorAll('.card > .kt-playground')];
    const baseline=window.Kineto.instanceCount;
    let exercised=0;
    for(const panel of panels){
      const card=panel.parentElement;
      const body=panel.__buildBody?.();
      const input=body?.querySelector('.kt-playground__field:not([hidden]) input[type="range"][data-option]');
      if(!input)continue;
      const before=input.value;
      const min=Number(input.min); const max=Number(input.max); const step=Number(input.step)||1;
      let next=Math.min(max,Number(before)+step);
      if(next===Number(before))next=Math.max(min,Number(before)-step);
      input.value=String(next);
      input.dispatchEvent(new window.Event('input',{bubbles:true}));
      await sleep(140);
      exercised+=1;
      if(!panel.isConnected||card.querySelector(':scope > .kt-playground')!==panel||!panel.querySelector('summary')){
        failures.push(card.querySelector('h3')?.textContent?.trim()||card.dataset.settingsFor||'unknown card');
        continue;
      }
      // Put the demo back so the sweep itself cannot bias later assertions.
      input.value=before;
      input.dispatchEvent(new window.Event('input',{bubbles:true}));
      await sleep(140);
    }
    return {failures,exercised,baseline,after:window.Kineto.instanceCount};
  });
  assert.ok(panelSweep.exercised>=40,`expected to exercise at least 40 settings cards, got ${panelSweep.exercised}`);
  assert.deepEqual(panelSweep.failures,[],`settings trigger/demo disappeared after live edit: ${panelSweep.failures.join(', ')}`);
  assert.ok(panelSweep.after<=panelSweep.baseline+2,`live-edit sweep leaked instances: ${panelSweep.baseline} -> ${panelSweep.after}`);

  const coverRevealSweep=await page.evaluate(async()=>{
    const sleep=(ms)=>new Promise((resolve)=>setTimeout(resolve,ms));
    const gallery=document.querySelector('.cover-gallery-card');
    const panel=gallery?.querySelector(':scope > .kt-playground');
    const body=panel?.__buildBody?.();
    const layers=body?.querySelector('[data-module="coverReveal"][data-option="layers"]');
    const direction=body?.querySelector('[data-module="coverReveal"][data-option="direction"]');
    const colorMode=body?.querySelector('[data-module="coverReveal"][data-option="colorMode"]');
    const colors=body?.querySelector('[data-module="coverReveal"][data-option="colors"]');
    const targets=[...gallery?.querySelectorAll('[data-kt-cover-reveal]')||[]];
    if(!layers||!direction||!colorMode||!colors||!targets.length)return {found:false};
    layers.value='3';
    layers.dispatchEvent(new window.Event('input',{bubbles:true}));
    await sleep(220);
    const modes={};
    for(const value of ['left','right','up','down','random']){
      direction.value=value;
      direction.dispatchEvent(new window.Event('change',{bubbles:true}));
      await sleep(180);
      modes[value]=targets.every((target)=>Boolean(
        window.Kineto.getInstance(target,'coverReveal')
        && target.isConnected
        && target.querySelector('img')?.isConnected
        && target.closest('.kt-cover-wrap')
      ));
    }
    const colorModes={};
    for(const value of ['single','pair','palette','auto']){
      colorMode.value=value;
      colorMode.dispatchEvent(new window.Event('change',{bubbles:true}));
      await sleep(180);
      colorModes[value]=targets.every((target)=>target.dataset.ktColorMode===value&&Boolean(
        window.Kineto.getInstance(target,'coverReveal')
        &&target.closest('.kt-cover-wrap')
      ));
    }
    colorMode.value='palette';
    colorMode.dispatchEvent(new window.Event('change',{bubbles:true}));
    colors.value='rgba(255, 91, 28, .55), #ac7bef, hsl(205 80% 52%)';
    colors.dispatchEvent(new window.Event('change',{bubbles:true}));
    await sleep(220);
    const fields={
      palette:!colors.closest('.kt-playground__field').hidden,
      single:body.querySelector('[data-option="color"]')?.closest('.kt-playground__field').hidden,
      pair:body.querySelector('[data-option="color2"]')?.closest('.kt-playground__field').hidden
    };
    await sleep(1600);
    return {
      found:true,
      layers:targets.every((target)=>target.dataset.ktLayers==='3'),
      modes,
      colorModes,
      paletteValue:targets.every((target)=>target.dataset.ktColors===colors.value),
      fields,
      images:targets.every((target)=>target.querySelector('img')?.getBoundingClientRect().width>20),
      invalidLinesField:body.querySelector('[data-module="coverReveal"][data-option="lines"]')!==null
    };
  });
  assert.equal(coverRevealSweep.found,true,'Cover Reveal gallery settings were not found');
  assert.equal(coverRevealSweep.layers,true,'Cover Reveal did not retain the three-layer setting');
  assert.ok(Object.values(coverRevealSweep.modes).every(Boolean),`Cover Reveal direction rebuild failed: ${JSON.stringify(coverRevealSweep.modes)}`);
  assert.ok(Object.values(coverRevealSweep.colorModes).every(Boolean),`Cover Reveal color mode rebuild failed: ${JSON.stringify(coverRevealSweep.colorModes)}`);
  assert.equal(coverRevealSweep.paletteValue,true,'Cover Reveal palette did not retain CSS color values');
  assert.deepEqual(coverRevealSweep.fields,{palette:true,single:true,pair:true},'Cover Reveal must show only controls supported by the selected color mode');
  assert.equal(coverRevealSweep.images,true,'Cover Reveal gallery images disappeared after option changes');
  assert.equal(coverRevealSweep.invalidLinesField,false,'image Cover Reveal must not expose the text-only per-line option');

  const demoPolish=await page.evaluate(async()=>{
    const sleep=(ms)=>new Promise((resolve)=>setTimeout(resolve,ms));
    const flip=[...document.querySelectorAll('#flip-grid .flip-chip')];
    const flipRows=new Set(flip.map((item)=>Math.round(item.getBoundingClientRect().top)));
    const accordion=document.querySelector('[data-kt-accordion] details.kt-open, [data-kt-accordion] details[open]');
    const note=accordion?.querySelector('.u-note');
    const confettiPath=document.querySelector('.confetti-complete svg path');
    const hoverCard=[...document.querySelectorAll('.card')].find((card)=>card.querySelector('h3')?.textContent.trim()==='Hover Roll');
    const hoverPanel=hoverCard?.querySelector(':scope > .kt-playground');
    const hoverBody=hoverPanel?.__buildBody?.();
    const hoverPreset=hoverBody?.querySelector('[data-module="overflowText"][data-option="preset"]')?.closest('.kt-playground__field');
    const scrollTarget=document.querySelector('[data-kt-scroll-shadows]');
    const scrollCard=scrollTarget?.closest('.card');
    const scrollPanel=scrollCard?.querySelector(':scope > .kt-playground');
    const scrollBody=scrollPanel?.__buildBody?.();
    scrollPanel.open=true;
    scrollPanel.dispatchEvent(new window.Event('toggle'));
    await sleep(100);
    const shadowInput=scrollBody?.querySelector('[data-module="scrollShadows"][data-option="shadow"]');
    const coverInput=scrollBody?.querySelector('[data-module="scrollShadows"][data-option="color"]');
    shadowInput.value='rgba(12, 24, 48, 0.37)';
    shadowInput.dispatchEvent(new window.Event('input',{bubbles:true}));
    await sleep(180);
    const help=shadowInput.closest('.kt-playground__field')?.querySelector('.kt-help');
    const sheet=document.querySelector('.kt-drawer-sheet');
    const scrollBefore=sheet.scrollTop;
    help?.focus();
    await sleep(100);
    const tooltip=document.querySelector('.kt-tooltip.kt-playground-help:not([hidden])');
    const tipRect=tooltip?.getBoundingClientRect();
    const tooltipStable=Boolean(
      tooltip&&['top','bottom'].includes(tooltip.dataset.placement)
      &&tipRect.top>=0&&tipRect.bottom<=window.innerHeight
      &&Math.abs(sheet.scrollTop-scrollBefore)<2
    );
    scrollPanel.open=false;
    scrollPanel.dispatchEvent(new window.Event('toggle'));
    return {
      flipRows:flipRows.size,
      accordionBottom:note?getComputedStyle(note).marginBottom:null,
      accordionPaddingBottom:note?getComputedStyle(note).paddingBottom:null,
      confettiSvg:confettiPath?.getAttribute('d')?.startsWith('M9.9997')||false,
      hoverPresetHidden:Boolean(hoverPreset?.hidden),
      scrollCoverHidden:coverInput==null,
      rgbaPreserved:scrollTarget.dataset.ktShadow==='rgba(12, 24, 48, 0.37)'&&Boolean(Kineto.getInstance(scrollTarget,'scrollShadows')),
      colorControl:shadowInput?.type==='text'&&shadowInput.classList.contains('kt-color-value'),
      tooltipStable
    };
  });
  assert.ok(demoPolish.flipRows>=3,`FLIP demo must visibly prove multi-row support, got ${demoPolish.flipRows} rows`);
  assert.equal(demoPolish.accordionBottom,'0px','open accordion note must not have bottom margin');
  assert.equal(demoPolish.accordionPaddingBottom,'0px','open accordion note must not retain the extra bottom gap');
  assert.equal(demoPolish.confettiSvg,true,'Confetti completion mark must use the requested SVG');
  assert.equal(demoPolish.hoverPresetHidden,true,'Hover Roll must hide unsupported mode switching');
  assert.equal(demoPolish.scrollCoverHidden,true,'Scroll Shadows settings must not expose the inferred cover color');
  assert.equal(demoPolish.rgbaPreserved,true,'Scroll Shadows must preserve and apply an RGBA shadow color');
  assert.equal(demoPolish.colorControl,true,'color settings must use the shared CSS color control');
  assert.equal(demoPolish.tooltipStable,true,'settings help tooltip must auto-place without changing sheet scroll');

  const functional=await page.evaluate(async()=>{
    const sleep=(ms)=>new Promise((resolve)=>setTimeout(resolve,ms));
    const result={};
    // Skeleton shimmer/pulse are real temporary layers.
    const shimmer=document.querySelector('[data-kt-lazy="skeleton"]'); Kineto.replay(shimmer,'lazy'); await sleep(40);
    const skeleton=shimmer.parentElement.querySelector('.kt-lazy-skeleton');
    result.skeleton=Boolean(skeleton)&&getComputedStyle(skeleton).animationName!=='none';
    // Dynamic noise increments frame counter on an isolated visible fixture.
    const noiseHost=document.createElement('div'); noiseHost.style.cssText='position:fixed;left:0;top:0;width:180px;height:110px;z-index:-1';
    const noiseImage=document.createElement('img'); noiseHost.appendChild(noiseImage); document.body.appendChild(noiseHost);
    const printInstance=Kineto.lazy(noiseImage,{effect:'print',src:'./assets/gallery-01.webp',duration:0.8,delay:0,nativeLazy:false,rootMargin:'10000px'});
    let noise=null; for(let i=0;i<40&&!noise;i+=1){await sleep(25);noise=noiseHost.querySelector('.kt-lazy-noise');}
    const a=Number(noise?.dataset.frames||0); await sleep(180); const b=Number(noise?.dataset.frames||0);
    result.dynamicNoise=b>a; printInstance?.destroy(); noiseHost.remove();
    // Overflow modes and mask directions.
    const rewind=document.querySelector('[data-kt-overflow-text="rewind"]'); const rewindInstance=Kineto.getInstance(rewind,'overflowText');
    result.rewind=Boolean(rewindInstance)&&rewind.querySelector('.kt-overflow-text-track')!==null;
    const rolling=document.querySelector('[data-kt-overflow-text="rolling"]'); const rollingInstance=Kineto.getInstance(rolling,'overflowText'); const ri=rollingInstance?.index; await sleep(1650); result.rolling=rollingInstance?.index!==ri;
    // Card surface + border.
    const surfaceCard=Array.from(document.querySelectorAll('[data-kt-card-glow]')).find((el)=>el.dataset.ktSurface==='true');
    result.card=Boolean(surfaceCard?.querySelector('.kt-card-glow-surface')&&surfaceCard?.querySelector('.kt-card-glow-border'));
    // Tilt/Card Glow shadows compose with one another and the author's base
    // shadow. CSS can replace either module channel without touching the other.
    const shadowHost=document.createElement('div');
    shadowHost.style.cssText='position:fixed;left:20px;top:20px;width:180px;height:100px;box-shadow:0 1px 3px rgb(0 0 0 / 20%);';
    document.body.appendChild(shadowHost);
    const baseShadow=getComputedStyle(shadowHost).boxShadow;
    const glowShadow=Kineto.cardGlow(shadowHost,{shadow:true,shadowColor:'#172033',shadowOpacity:.34,shadowBlur:40,shadowSpread:-12,shadowY:16,shadowFollow:18});
    const tiltShadow=Kineto.tilt(shadowHost,{glare:false,tiltShadow:true,tiltShadowColor:'#311827',tiltShadowOpacity:.3,tiltShadowBlur:30,tiltShadowY:12,tiltShadowFollow:1.2});
    await sleep(50);
    const composed=getComputedStyle(shadowHost).boxShadow;
    shadowHost.style.setProperty('--kt-tilt-shadow','3px 5px 9px rgb(10 20 30 / 40%)');
    const overridden=getComputedStyle(shadowHost).boxShadow;
    glowShadow.destroy();
    const tiltSurvives=shadowHost.classList.contains('kt-interactive-shadow')&&getComputedStyle(shadowHost).boxShadow!=='none';
    tiltShadow.destroy();
    result.shadowComposed=composed!=='none';
    result.shadowCssOverride=overridden!==composed&&overridden.includes('3px 5px 9px');
    result.shadowCoexists=tiltSurvives;
    result.shadowCleanup=!shadowHost.classList.contains('kt-interactive-shadow');
    result.shadowRestoresBase=getComputedStyle(shadowHost).boxShadow===baseShadow;
    shadowHost.remove();
    // Text transition and RGB glitch.
    const transition=document.querySelector('[data-kt-text-transition]'); const ti=Kineto.getInstance(transition,'textTransition'); const before=ti.index; ti.next(); await sleep(1050); result.transition=ti.index!==before;
    const glitch=document.querySelector('[data-kt-glitch="rgb"]'); result.glitch=glitch.querySelectorAll('span').length>=5;
    // Class-only reveal.
    const classReveal=document.querySelector('[data-kt-reveal="class"]'); Kineto.getInstance(classReveal,'reveal').replay(); await sleep(40); result.classHook=classReveal.classList.contains('is-inview');
    // Spring velocity and vertical sticky.
    result.spring=document.querySelector('[data-kt-scroll-velocity][data-kt-spring="true"]')!==null;
    result.sticky=Array.from(document.querySelectorAll('.stack-vertical > article')).every((item)=>getComputedStyle(item).position==='sticky');
    // Horizontal and floating sticky demos must have built their native
    // fallback viewports when GSAP/ScrollTrigger is unavailable in offline QA.
    const horizontal=document.querySelector('[data-kt-sticky-stack="horizontal"]');
    const horizontalViewport=horizontal?.querySelector('.kt-sticky-horizontal-viewport');
    const horizontalTrack=horizontalViewport?.querySelector('.kt-sticky-horizontal-track');
    result.stickyHorizontal=Boolean(
      horizontalViewport
      && horizontalTrack
      && horizontalTrack.children.length===3
      && horizontalViewport.getBoundingClientRect().width>100
      && horizontal.offsetHeight>horizontalViewport.offsetHeight
    );
    const floating=document.querySelector('[data-kt-sticky-stack="floating"]');
    const floatingViewport=floating?.querySelector('.kt-floating-viewport');
    result.stickyFloating=Boolean(
      floatingViewport
      && floatingViewport.children.length===3
      && floatingViewport.getBoundingClientRect().width>100
      && floating.offsetHeight>floatingViewport.offsetHeight
      && [...floatingViewport.children].every((item)=>getComputedStyle(item).position==='absolute')
    );
    // Coverflow moves exactly one index.
    const slider=document.querySelector('[data-kt-slider="coverflow"]'); const si=Kineto.getInstance(slider,'slider'); const initial=si.index; si.next(); result.slider=si.index===initial+1;
    // Ambient image uses a live IMG clone.
    const animatedHost=document.querySelector('[data-kt-ambient-media]:has([data-kt-lazy="dissolve"])'); const ai=Kineto.getInstance(animatedHost,'ambientMedia');
    result.ambient=ai?.mode==='image-clone' && Boolean(animatedHost.parentElement?.querySelector('.kt-ambient-image-clone')||animatedHost.querySelector('.kt-ambient-image-clone'));
    // Full viewport lightbox and viewer controls.
    const lightboxSource=document.querySelector('[data-kt-lightbox][data-kt-title="Composition 01"]'); lightboxSource.click(); await sleep(220); const viewer=document.querySelector('#kt-lightbox');
    const rect=viewer.getBoundingClientRect(); const reset=viewer.querySelector('.kt-lightbox-zoom-reset').textContent; viewer.querySelector('.kt-lightbox-zoom-in').click();
    result.lightbox=!viewer.hidden && rect.width>=window.innerWidth-20 && rect.height>=window.innerHeight-1 && viewer.querySelector('.kt-lightbox-minimap') && viewer.querySelector('.kt-lightbox-next') && viewer.querySelector('.kt-lightbox-zoom-reset').textContent!==reset;
    viewer.querySelector('.kt-lightbox-close').click();
    // Cursor variants are exposed and created.
    result.cursor=document.querySelectorAll('.kt-cursor').length>=1;
    // Loader manual API.
    const overlay=document.createElement('div'); overlay.style.cssText='position:fixed;inset:0;'; document.body.appendChild(overlay); const loader=Kineto.loader(overlay,{type:'bar',source:'manual',hideScrollbar:false}); loader.setProgress(47); await sleep(180); result.loader=loader.progress>0&&Boolean(overlay.querySelector('.kt-loader-bar-progress'));  loader.destroy(); overlay.remove();
    // Smooth scroll API is explicitly toggleable.
    Kineto.enableSmooth(); result.smoothOn=Kineto.smoothEnabled||typeof window.Lenis==='undefined'; Kineto.disableSmooth(); result.smoothOff=!Kineto.smoothEnabled;
    return result;
  });
  for(const [key,value] of Object.entries(functional)) assert.ok(value,`${key} demo behavior failed`);

  // The settings drawer is content-aware: collapsed title bars stay compact,
  // and the only remaining expanded group consumes the full row without
  // overlapping another group.
  const drawerLayout=await page.evaluate(async()=>{
    const sleep=(ms)=>new Promise((resolve)=>setTimeout(resolve,ms));
    const panels=[...document.querySelectorAll('.card > .kt-playground')];
    let panel=null;
    for(const candidate of panels){
      const body=candidate.__buildBody?.();
      if(body?.querySelectorAll('.kt-playground__group').length>=3){panel=candidate;break;}
    }
    if(!panel)return {found:false};
    panel.open=true;
    panel.dispatchEvent(new window.Event('toggle'));
    await sleep(120);
    const body=panel.__mkBody;
    const groups=[...body.querySelectorAll('.kt-playground__group')].filter((group)=>!group.hidden);
    groups.slice(0,-1).forEach((group)=>{
      if(!group.classList.contains('is-collapsed')) group.querySelector('.kt-playground__legend')?.click();
    });
    if(groups.at(-1)?.classList.contains('is-collapsed')) groups.at(-1).querySelector('.kt-playground__legend')?.click();
    await sleep(120);
    const expanded=groups.filter((group)=>!group.classList.contains('is-collapsed'));
    const collapsed=groups.filter((group)=>group.classList.contains('is-collapsed'));
    const rects=groups.map((group)=>group.getBoundingClientRect());
    const overlap=rects.some((a,index)=>rects.some((b,indexB)=>indexB>index&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top));
    const result={
      found:true,
      expanded:expanded.length,
      full:expanded.length===1&&getComputedStyle(expanded[0]).gridColumnEnd==='-1',
      collapsedTailFull:collapsed.length%2===0
        || getComputedStyle(collapsed.at(-1)).gridColumnEnd==='-1',
      compact:collapsed.every((group)=>group.querySelector('.kt-playground__controls')?.offsetHeight===0&&group.offsetHeight<80),
      overlap
    };
    panel.open=false;
    panel.dispatchEvent(new window.Event('toggle'));
    return result;
  });
  assert.equal(drawerLayout.found,true,'no multi-group settings panel available for layout QA');
  assert.equal(drawerLayout.expanded,1,'settings layout QA must leave exactly one expanded group');
  assert.equal(drawerLayout.full,true,'the only expanded settings group must span the full drawer width');
  assert.equal(drawerLayout.collapsedTailFull,true,'an unpaired collapsed settings group must span the full row');
  assert.equal(drawerLayout.compact,true,'collapsed settings groups must not retain empty body height');
  assert.equal(drawerLayout.overlap,false,'settings groups overlap after collapsing');

  const drawerVisuals=await page.evaluate(async()=>{
    const sleep=(ms)=>new Promise((resolve)=>setTimeout(resolve,ms));
    const blurCard=document.querySelector('[data-demo-module="blurText"]');
    const blurPanel=blurCard?.querySelector(':scope > .kt-playground');
    if(!blurPanel)return {found:false};
    blurPanel.open=true;
    blurPanel.dispatchEvent(new window.Event('toggle'));
    await sleep(140);
    const body=blurPanel.__mkBody;
    const ease=body?.querySelector('.kt-ease-field');
    const graph=ease?.querySelector('.kt-bz-svg');
    const duration=body?.querySelector('[data-option="duration"]')?.closest('.kt-playground__field');
    const stagger=body?.querySelector('[data-option="stagger"]')?.closest('.kt-playground__field');
    const close=body?.querySelector('.kt-playground__close');
    const controls=ease?.closest('.kt-playground__controls');
    const rect=(node)=>node?.getBoundingClientRect();
    const easeRect=rect(ease); const graphRect=rect(graph);
    const durationRect=rect(duration); const staggerRect=rect(stagger);
    const gap=Number.parseFloat(getComputedStyle(controls).columnGap)||0;
    const result={
      found:Boolean(ease&&graph&&duration&&stagger&&close),
      easeTrackFit:Math.abs(easeRect.width-(durationRect.width+staggerRect.width+gap))<=3,
      graphSquare:Math.abs(graphRect.width-graphRect.height)<=1,
      closeBackground:getComputedStyle(close).backgroundColor
    };
    blurPanel.open=false;
    blurPanel.dispatchEvent(new window.Event('toggle'));
    await sleep(80);

    const horizontal=document.querySelector('[data-kt-sticky-stack="horizontal"]');
    const unit=horizontal?.closest('.scroll-demo-unit');
    const horizontalPanel=unit?.querySelector('.kt-playground');
    horizontalPanel.open=true;
    horizontalPanel.dispatchEvent(new window.Event('toggle'));
    await sleep(140);
    const spotlight=document.querySelector('.kt-fp-spotlight');
    result.horizontalSpotlightOwner=spotlight===unit;
    result.horizontalRadius=spotlight&&unit
      ? getComputedStyle(spotlight).borderRadius===getComputedStyle(unit).borderRadius
      : false;
    horizontalPanel.open=false;
    horizontalPanel.dispatchEvent(new window.Event('toggle'));
    return result;
  });
  assert.equal(drawerVisuals.found,true,'Blur Text ease editor visual QA fixture was not found');
  assert.equal(drawerVisuals.easeTrackFit,true,'ease editor does not fill its two allocated grid tracks');
  assert.equal(drawerVisuals.graphSquare,true,'ease graph must remain square');
  assert.ok(
    drawerVisuals.closeBackground==='rgba(0, 0, 0, 0)'||drawerVisuals.closeBackground==='transparent',
    `settings close button still has a background: ${drawerVisuals.closeBackground}`
  );
  assert.equal(drawerVisuals.horizontalSpotlightOwner,true,'Horizontal pinned scroll spotlight must frame the whole demo unit');
  assert.equal(drawerVisuals.horizontalRadius,true,'Horizontal pinned scroll spotlight radius must match the demo unit');

  const fullpageFlow=await page.evaluate(async()=>{
    const sleep=(ms)=>new Promise((resolve)=>setTimeout(resolve,ms));
    const deck=document.querySelector('#mod-fullpage [data-kt-fullpage]');
    const instance=window.Kineto.getInstance(deck,'fullpage');
    const sections=[...deck.querySelectorAll('.kt-fullpage-section')];
    const longSection=sections[1];
    const host=document.querySelector('#mod-fullpage .fp-scroll-host');
    const embedded=host?.querySelector(':scope > .fullpage-demo');
    const normal=host?.querySelector(':scope > .fp-normal');
    if(!instance||!longSection||!host||!embedded||!normal)return {found:false};
    instance.go(0,true);
    longSection.scrollTop=0;
    const wheel=()=>deck.dispatchEvent(new window.WheelEvent('wheel',{
      bubbles:true,cancelable:true,deltaY:80
    }));
    wheel();
    const afterLanding={index:instance.index,scrollTop:longSection.scrollTop};
    wheel();
    const afterTail=longSection.scrollTop;
    await sleep(900);
    wheel();
    const afterNextGesture=longSection.scrollTop;
    const result={
      found:true,
      embeddedFillsHost:Math.abs(embedded.getBoundingClientRect().height-host.getBoundingClientRect().height)<=1,
      normalStartsAfterDeck:normal.offsetTop>=embedded.offsetHeight-1,
      longSectionOverflows:longSection.scrollHeight>longSection.clientHeight+2,
      afterLanding,
      afterTail,
      afterNextGesture
    };
    instance.go(0,true);
    longSection.scrollTop=0;
    return result;
  });
  assert.equal(fullpageFlow.found,true,'Fullpage flow QA fixture was not found');
  assert.equal(fullpageFlow.embeddedFillsHost,true,'first-screen-only Fullpage deck must fill the demo viewport');
  assert.equal(fullpageFlow.normalStartsAfterDeck,true,'normal scroll content must begin below the full demo-height deck');
  assert.equal(fullpageFlow.longSectionOverflows,true,'Fullpage long-section fixture must actually overflow');
  assert.deepEqual(fullpageFlow.afterLanding,{index:1,scrollTop:0},'first wheel must land at the top of the long section');
  assert.equal(fullpageFlow.afterTail,0,'the first wheel gesture tail must not scroll the new long section');
  assert.ok(fullpageFlow.afterNextGesture>0,'the next wheel gesture must scroll the long section internally');
  assert.deepEqual(runtimeErrors,[],`Demo runtime errors:\n${runtimeErrors.join('\n')}`);

  // Run representative lifecycle coverage in the same Chromium process.
  const smokePage = await browser.newPage({ reducedMotion: 'no-preference' });
  const smokeErrors = [];
  smokePage.on('pageerror', (error) => smokeErrors.push(error.stack || error.message));
  smokePage.on('console', (message) => { if (message.type() === 'error') smokeErrors.push(`console: ${message.text()}`); });
  await smokePage.setContent(smokeFixture, { waitUntil: 'load' });
  await smokePage.addStyleTag({ path: resolve(smokeOutDir, 'kineto.css') });
  await smokePage.addScriptTag({ path: resolve(smokeOutDir, 'browser-smoke.js') });
  await smokePage.waitForFunction(() => document.documentElement.dataset.smokeDone === 'true', null, { timeout: 15000 });
  const smokeResult = await smokePage.evaluate(() => window.__MK_SMOKE__);
  assert.equal(smokeResult.ok, true, `Smoke failures:\n${smokeResult.errors.join('\n')}`);
  assert.equal(smokeResult.instanceCount, 0, 'Kineto leaked active instances in lifecycle smoke');
  await smokePage.addScriptTag({ path: resolve(root, 'dist/kineto.umd.js') });
  const umd = await smokePage.evaluate(() => ({
    version: window.Kineto?.version,
    modules: Object.keys(window.Kineto?.registry || {}).length,
    autoInit: typeof window.Kineto?.autoInit
  }));
  assert.deepEqual(umd, { version: contract.libraryVersion, modules: contract.moduleCount, autoInit: 'function' });
  assert.deepEqual(smokeErrors, [], `Lifecycle/UMD runtime errors:\n${smokeErrors.join('\n')}`);
  await smokePage.close();
  await page.close();
  await runAnimatedMediaQa(browser, root);
  console.log(`Demo QA OK: ${surface.panels} playgrounds, lifecycle/UMD smoke, and animated media continuity; 46 owner requirements represented.`);
  passed = true;
} finally {
  killBrowserServer(browserServer);
  await new Promise((resolveCleanup) => setTimeout(resolveCleanup, 250));
  if (passed) process.reallyExit(0);
}
