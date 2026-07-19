/* global window, document, getComputedStyle, Kineto */
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { chromium } from 'playwright-core';
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
  browserServer = await chromium.launchServer({ executablePath: process.env.MK_CHROMIUM || '/usr/bin/chromium', headless:true, args:['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required'] });
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
  await page.addScriptTag({path:resolve(root,'demo/playground.js')});
  await page.addScriptTag({content:inlineScript});
  // The demo defers module init behind the intro loader (full-load gate);
  // wait until the modules are actually running before asserting.
  await page.waitForFunction(()=>window.Kineto&&window.Kineto.instanceCount>30,null,{timeout:10000});
  await page.waitForTimeout(700);

  const surface=await page.evaluate(()=>({
    version:Kineto.version, modules:Object.keys(Kineto.registry).length, chips:document.querySelectorAll('#module-list span').length,
    categories:document.querySelectorAll('[data-demo]').length, panels:document.querySelectorAll('.kt-playground').length,
    codeBlocks:document.querySelectorAll('.kt-playground__code').length, notice:document.querySelectorAll('.hero-meta').length,
    optionContract:window.KinetoPlayground.publicOptions
  }));
  assert.equal(surface.version,'0.8.0');
  assert.equal(surface.modules,34); assert.equal(surface.chips,34); assert.equal(surface.categories,11);
  assert.ok(surface.panels>=55,`expected at least 55 playground panels, got ${surface.panels}`);
  assert.equal(surface.codeBlocks,surface.panels); assert.equal(surface.notice,1);
  assert.deepEqual(surface.optionContract,Object.fromEntries(contract.modules.map((module)=>[module.name,module.publicOptions])));

  const missing=await page.evaluate(()=>Array.from(document.querySelectorAll('.card')).filter((card)=>
    card.querySelector('[data-kt-counter],[data-kt-lazy],[data-kt-overflow-text],[data-kt-text-split],[data-kt-shuffle],[data-kt-typewriter],[data-kt-text-reveal],[data-kt-text-transition],[data-kt-glitch],[data-kt-text-fill],[data-kt-reveal],[data-kt-scroll-velocity],[data-kt-slider],[data-kt-ambient-media],[data-kt-lightbox],[data-kt-card-glow],[data-kt-tilt],[data-kt-cursor],[data-kt-magnetic],[data-kt-ripple],[data-kt-vibrate],[data-kt-mouse-parallax],[data-loader-type]') && !card.querySelector(':scope > .kt-playground')).length);
  assert.equal(missing,0,'an adjustable demo card is missing its playground');

  const pop=page.locator('#counter .card').filter({has:page.getByRole('heading',{name:'Pop',exact:true})});
  await pop.locator('.kt-playground').evaluate((el)=>{el.open=true;});
  const baseCount=await page.evaluate(()=>Kineto.instanceCount);
  const drawer=page.locator('.kt-playground__body.is-portal:not([hidden])');
  await drawer.locator('[data-option="to"]').fill('123456'); await drawer.locator('[data-option="to"]').dispatchEvent('change'); await page.waitForTimeout(220);
  const popState=await pop.evaluate((card)=>({text:card.querySelector('[data-kt-counter="pop"]').textContent,html:card.querySelector('.kt-playground').dataset.htmlCode,js:card.querySelector('.kt-playground').dataset.jsCode,count:Kineto.instanceCount}));
  assert.equal(popState.text,'123,456'); assert.match(popState.html,/data-kt-to="123456"/); assert.match(popState.js,/"to": 123456/); assert.equal(popState.count,baseCount);
  await drawer.getByRole('button',{name:'Reset'}).click(); await page.waitForTimeout(180); assert.equal(await pop.locator('[data-kt-counter="pop"]').textContent(),'98,760');

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
    const printInstance=Kineto.lazy(noiseImage,{effect:'print',src:'./assets/demo-setup.svg',duration:0.8,delay:0,nativeLazy:false,rootMargin:'10000px'});
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
    // Text transition and RGB glitch.
    const transition=document.querySelector('[data-kt-text-transition]'); const ti=Kineto.getInstance(transition,'textTransition'); const before=ti.index; ti.next(); await sleep(1050); result.transition=ti.index!==before;
    const glitch=document.querySelector('[data-kt-glitch="rgb"]'); result.glitch=glitch.querySelectorAll(':scope > span').length>=4;
    // Class-only reveal.
    const classReveal=document.querySelector('[data-kt-reveal="class"]'); Kineto.getInstance(classReveal,'reveal').replay(); await sleep(40); result.classHook=classReveal.classList.contains('is-inview');
    // Spring velocity and vertical sticky.
    const velocity=document.querySelector('[data-kt-scroll-velocity="translate"]'); result.spring=Boolean(Kineto.getInstance(velocity,'scrollVelocity'));
    result.sticky=Array.from(document.querySelectorAll('.stack-vertical > article')).every((item)=>getComputedStyle(item).position==='sticky');
    // Coverflow moves exactly one index.
    const slider=document.querySelector('[data-kt-slider="coverflow"]'); const si=Kineto.getInstance(slider,'slider'); const initial=si.index; si.next(); result.slider=si.index===initial+1;
    // Ambient image uses a live IMG clone.
    const animatedHost=document.querySelector('#media-ui [data-kt-lazy="dissolve"]').closest('[data-kt-ambient-media]'); const ai=Kineto.getInstance(animatedHost,'ambientMedia');
    result.ambient=ai?.mode==='image-clone' && Boolean(animatedHost.parentElement?.querySelector('.kt-ambient-image-clone')||animatedHost.querySelector('.kt-ambient-image-clone'));
    // Full viewport lightbox and viewer controls.
    const lightboxSource=document.querySelector('[data-kt-lightbox][data-kt-title="Composition 01"]'); lightboxSource.click(); await sleep(60); const viewer=document.querySelector('#kt-lightbox');
    const rect=viewer.getBoundingClientRect(); const reset=viewer.querySelector('.kt-lightbox-zoom-reset').textContent; viewer.querySelector('.kt-lightbox-zoom-in').click();
    result.lightbox=!viewer.hidden && rect.width>=window.innerWidth-1 && rect.height>=window.innerHeight-1 && viewer.querySelector('.kt-lightbox-minimap') && viewer.querySelector('.kt-lightbox-next') && viewer.querySelector('.kt-lightbox-zoom-reset').textContent!==reset;
    viewer.querySelector('.kt-lightbox-close').click();
    // Cursor variants are exposed and created.
    result.cursor=document.querySelectorAll('.kt-cursor').length>=1;
    // Loader manual API.
    const overlay=document.createElement('div'); overlay.style.cssText='position:fixed;inset:0;'; document.body.appendChild(overlay); const loader=Kineto.loader(overlay,{type:'bar',source:'manual',hideScrollbar:false}); loader.setProgress(47); await sleep(180); result.loader=loader.progress>0&&Boolean(overlay.querySelector('.kt-loader-bar-progress'));  loader.destroy(); overlay.remove();
    // Smooth scroll API is explicitly toggleable.
    Kineto.enableSmooth(); result.smoothOn=Kineto.smoothEnabled; Kineto.disableSmooth(); result.smoothOff=!Kineto.smoothEnabled;
    return result;
  });
  for(const [key,value] of Object.entries(functional)) assert.ok(value,`${key} demo behavior failed`);
  assert.deepEqual(runtimeErrors,[],`Demo runtime errors:\n${runtimeErrors.join('\n')}`);

  // Run the complete 34-module lifecycle smoke in the same Chromium process.
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
  assert.deepEqual(umd, { version: '0.8.0', modules: 34, autoInit: 'function' });
  assert.deepEqual(smokeErrors, [], `Lifecycle/UMD runtime errors:\n${smokeErrors.join('\n')}`);
  await smokePage.close();
  await page.close();
  await runAnimatedMediaQa(browser, root);
  console.log(`Demo QA OK: ${surface.panels} playgrounds, 34-module lifecycle/UMD smoke, and animated media continuity; 46 owner requirements represented.`);
  passed = true;
} finally {
  killBrowserServer(browserServer);
  await new Promise((resolveCleanup) => setTimeout(resolveCleanup, 250));
  if (passed) process.reallyExit(0);
}
