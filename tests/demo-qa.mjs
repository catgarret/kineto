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
  const page = await browser.newPage({ viewport:{ width:1440,height:900 }, reducedMotion:'no-preference', offline:true });
  const runtimeErrors=[];
  page.on('pageerror',(error)=>runtimeErrors.push(error.stack||error.message));
  page.on('console',(message)=>{
    if(message.type()==='error') {
      const location=message.location();
      runtimeErrors.push(`console: ${message.text()} (${location.url||'unknown'}:${location.lineNumber??0})`);
    }
  });
  // Font CDNs are unreachable in the offline QA sandbox — stub them.
  await page.route(/fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net/, (route)=>route.fulfill({status:200,body:'',contentType:'text/css'}));
  // Keep analytics and decorative CDN assets deterministic without removing
  // them from the production demo. Only these observed external URLs receive
  // fixtures; any new un-routed resource still fails in the offline context.
  const noopScript={status:200,body:'/* Offline demo QA fixture. */',contentType:'text/javascript'};
  const emptyStylesheet={status:200,body:'',contentType:'text/css'};
  const badgeFixture={status:200,body:'<svg xmlns="http://www.w3.org/2000/svg" width="90" height="20" viewBox="0 0 90 20"><rect width="90" height="20" rx="3" fill="#555"/><text x="45" y="14" text-anchor="middle" fill="white" font-size="11">QA fixture</text></svg>',contentType:'image/svg+xml'};
  const externalFixtures=new Map([
    ['https://www.googletagmanager.com/gtm.js?id=GTM-KFQSFGJL',noopScript],
    ['https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css',emptyStylesheet],
    ['https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.css',emptyStylesheet],
    ['https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js',noopScript],
    ['https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.js',noopScript],
    ['https://github.com/catgarret/kineto/actions/workflows/ci.yml/badge.svg',badgeFixture],
    ['https://img.shields.io/npm/v/@dong-gri/kineto.svg',badgeFixture],
    ['https://img.shields.io/npm/l/@dong-gri/kineto.svg',badgeFixture],
    ['https://img.shields.io/jsdelivr/npm/hm/@dong-gri/kineto.svg',badgeFixture]
  ]);
  await page.route((url)=>externalFixtures.has(url.href),
    (route)=>route.fulfill(externalFixtures.get(route.request().url())));
  await page.route('http://kineto.local/**', async (route) => {
    const url=new URL(route.request().url());
    const relative=decodeURIComponent(url.pathname).replace(/^\/demo\//,'');
    try { const path=resolve(root,'demo',relative); const body=await readFile(path); await route.fulfill({status:200,body,contentType:mimeTypes[extname(path)]||'application/octet-stream'}); }
    catch { await route.fulfill({status:404,body:'Not found'}); }
  });
  await page.setContent(html,{waitUntil:'load'});
  await page.addStyleTag({path:resolve(root,'dist/kineto.css')});
  await page.addScriptTag({path:resolve(root,'dist/kineto.umd.js')});
  // The offline route above replaces CDN responses with an empty fixture. Use
  // that fixture's SHA-384 only inside QA so browser SRI remains exercised
  // without weakening or bypassing the production hashes.
  await page.evaluate(() => window.Kineto.setEngineSource({
    gsapIntegrity: 'sha384-OLBgp1GsljhM2TJ+sbHjaiH9txEUvgdDTAzHv2P24donTt6/529l+9Ua0vFImLlb',
    scrollTriggerIntegrity: 'sha384-OLBgp1GsljhM2TJ+sbHjaiH9txEUvgdDTAzHv2P24donTt6/529l+9Ua0vFImLlb',
    lenisIntegrity: 'sha384-OLBgp1GsljhM2TJ+sbHjaiH9txEUvgdDTAzHv2P24donTt6/529l+9Ua0vFImLlb'
  }));
  await page.addScriptTag({path:resolve(root,'demo/help-i18n.js')});
  await page.addScriptTag({path:resolve(root,'demo/help-i18n-extra.js')});
  await page.addScriptTag({path:resolve(root,'demo/playground-i18n.js')});
  await page.addScriptTag({path:resolve(root,'demo/module-metadata.js')});
  await page.addScriptTag({path:resolve(root,'demo/playground.js')});
  await page.addScriptTag({path:resolve(root,'demo/copy-i18n.js')});
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
  // Radial remains a public compatibility module but intentionally shares the
  // Slider section, so the demo has one fewer navigation chip than registry
  // entries. tests/nav-parity.mjs verifies that exact grouped relationship.
  assert.ok(surface.modules>=contract.moduleCount,`registry entries ${surface.modules}`);
  assert.equal(surface.chips + 1,contract.moduleCount);
  assert.ok(surface.categories>=6,`categories ${surface.categories}`);
  assert.ok(surface.panels>=55,`expected at least 55 playground panels, got ${surface.panels}`);
  assert.equal(surface.codeBlocks,0,'playground bodies should stay lazy until opened'); assert.equal(surface.notice,1);
  const normalizeOptions=(entries)=>Object.fromEntries(
    Object.entries(entries).map(([name,options])=>[name,[...options].sort()])
  );
  assert.deepEqual(
    normalizeOptions(surface.optionContract),
    normalizeOptions(Object.fromEntries(contract.modules.map((module)=>[module.name,module.publicOptions]))),
    'playground option sets must match the feature contract'
  );
  assert.equal(surface.shadowHelp,true,'Tilt/Card Glow shadow help must be translated in every demo locale');

  const sharedSettings = await page.evaluate(async () => {
    const panel = document.querySelector('#mod-counter .kt-playground');
    panel.open = true;
    await new Promise((resolve) => setTimeout(resolve, 80));
    const target = document.querySelector('.kt-drawer-sheet [data-option="to"]');
    target.value = '4242';
    target.dispatchEvent(new window.Event('change', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 120));
    document.querySelector('.kt-drawer-sheet .kt-playground__share').click();
    await new Promise((resolve) => setTimeout(resolve, 80));
    const token = new window.URLSearchParams(window.location.search).get('kt');
    const padded = token.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((token.length + 3) % 4);
    const payload = JSON.parse(new window.TextDecoder().decode(Uint8Array.from(window.atob(padded), (char) => char.charCodeAt(0))));
    const keys = [...document.querySelectorAll('.kt-playground[data-share-key]')].map((item) => item.dataset.shareKey);
    return {
      payload,
      shareKey: panel.dataset.shareKey,
      legacyShareKey: panel.dataset.shareLegacyKey,
      uniqueKeys: new Set(keys).size === keys.length,
      copied: document.querySelector('.kt-drawer-sheet .kt-playground__status').textContent
    };
  });
  assert.equal(sharedSettings.payload.v, 2, 'new shared settings URLs must use the semantic-key payload version');
  assert.equal(sharedSettings.payload.demo, sharedSettings.shareKey, 'the payload must identify the selected semantic demo key');
  assert.match(sharedSettings.payload.demo, /^counter--.+--counter-/, 'shared settings keys must encode stable block, card, module, and variant context');
  assert.equal(sharedSettings.legacyShareKey.startsWith('counter-'), true, 'the panel must retain its v1 ordinal alias');
  assert.equal(sharedSettings.uniqueKeys, true, 'semantic settings keys must be collision checked');
  assert.equal(sharedSettings.payload.options.counter.to, 4242, 'shared settings URLs must contain changed safe controls only');
  assert.match(sharedSettings.copied, /링크|link/i, 'sharing settings must report a copy result');

  const cardGlowShareIdentity=await page.evaluate(()=>[
    ...document.querySelectorAll('#pointer .glow-demo')
  ].slice(0,2).map((card)=>({
    heading:card.querySelector('h3')?.textContent.trim(),
    shareKey:card.querySelector(':scope > .kt-playground')?.dataset.shareKey,
    legacyShareKey:card.querySelector(':scope > .kt-playground')?.dataset.shareLegacyKey
  })));
  assert.deepEqual(cardGlowShareIdentity,[
    {
      heading:'Soft',
      shareKey:'cardglow--soft--tilt-default+card-glow-spotlight',
      legacyShareKey:'tilt+cardGlow-115'
    },
    {
      heading:'Sharp',
      shareKey:'cardglow--sharp--tilt-default+card-glow-spotlight',
      legacyShareKey:'tilt+cardGlow-116'
    }
  ],'nested Card Glow headings must produce stable semantic keys without changing their v1 aliases');

  const cssScrollSettingsIdentity=await page.evaluate(()=>{
    const card=[...document.querySelectorAll('.card[data-demo-tabs]')]
      .find((candidate)=>candidate.querySelector('[data-kt-css-scroll]'));
    const panels=[...card.querySelectorAll('.demo-tabpanel')];
    const hosts=[...card.querySelectorAll(':scope > .demo-tabhosts > .kt-playground-host')];
    return panels.map((panel,index)=>{
      const playground=hosts[index]?.querySelector('.kt-playground');
      const body=playground?.__buildBody?.();
      return {
        label:panel.dataset.demoTabLabel,
        legacyShareKey:playground?.dataset.shareLegacyKey||'',
        shareKey:playground?.dataset.shareKey||'',
        timeline:body?.querySelector('[data-module="cssScroll"][data-key="timeline"] select')?.value,
        fields:[...body.querySelectorAll('[data-module="cssScroll"][data-key]')]
          .map((field)=>field.dataset.key).sort()
      };
    });
  });
  const cssScrollFields=['axis','cssAnimation','end','property','rangeEnd','rangeStart','start','timeline'];
  assert.deepEqual(
    cssScrollSettingsIdentity.map(({label,timeline,fields})=>({label,timeline,fields})),
    [
      {label:'대체 경로',timeline:'view',fields:cssScrollFields},
      {label:'네이티브 뷰',timeline:'view',fields:cssScrollFields},
      {label:'네이티브 스크롤',timeline:'scroll',fields:cssScrollFields}
    ],
    'all three cssScroll variants must expose the existing native/fallback settings'
  );
  assert.match(cssScrollSettingsIdentity[0].legacyShareKey,/^cssScroll-\d+$/,
    'the historical cssScroll settings host must retain its v1 ordinal alias');
  assert.deepEqual(cssScrollSettingsIdentity.slice(1).map(({legacyShareKey})=>legacyShareKey),['',''],
    'new cssScroll native settings must not consume historical v1 ordinals');
  assert.equal(new Set(cssScrollSettingsIdentity.map(({shareKey})=>shareKey)).size,3,
    'each cssScroll tab must retain a distinct semantic v2 share key');

  const localizedCopy=await page.evaluate(async()=>{
    const select=document.getElementById('lang');
    const languages=['ko','en','ja','zh-CN','zh-TW','ru','it'];
    const result={};
    document.querySelector('.card > .kt-playground')?.__buildBody?.();
    for(const language of languages){
      select.value=language;
      select.dispatchEvent(new window.Event('change',{bubbles:true}));
      await new Promise((resolve)=>window.requestAnimationFrame(
        ()=>window.requestAnimationFrame(resolve)
      ));
      // Locale changes mutate several demo regions and can make auto-init
      // replace generated controls. Wait for the replacement ring to inherit
      // the selected locale instead of sampling an intermediate DOM.
      const expectedTop=language==='ko'
        ?'맨 위로'
        :window.KINETO_COPY_I18N.ui['맨 위로'][{en:0,ja:1,'zh-CN':2,'zh-TW':3,ru:4,it:5}[language]];
      await new Promise((resolve)=>{
        const deadline=Date.now()+300;
        const poll=()=>{
          if(document.querySelector('button.kt-progress-ring')?.getAttribute('aria-label')===expectedTop
            ||Date.now()>=deadline){resolve();return;}
          setTimeout(poll,10);
        };
        poll();
      });
      const descriptions=[...document.querySelectorAll([
        'main .card > p',
        'main .scroll-demo-unit > p',
        'main .hscroll-demo-unit > p',
        'main .sticky-stack-unit > p',
        'main .reveal-demo-card > p',
        'main .glow-demo > div > p'
      ].join(','))];
      result[language]={
        count:descriptions.length,
        twoLines:descriptions.every((node)=>{
          const style=getComputedStyle(node);
          const lineHeight=Number.parseFloat(style.lineHeight);
          return node.clientHeight<=lineHeight*2.05;
        }),
        summary:document.querySelector('.kt-playground__summary-label')?.textContent
          ===window.KINETO_PLAYGROUND_I18N[language].summary,
        drawerChrome:[
          ...document.querySelectorAll('.kt-playground__legend-text,.kt-playground__toolbar button,.kt-playground__viewtabs button,.kt-bz-btn')
        ].every((node)=>(
          (!/[가-힣]/.test(node.textContent)&&!/[가-힣]/.test(node.title))
          ||language==='ko'
        )),
        accessibleChrome:(()=>{
          const index={en:0,ja:1,'zh-CN':2,'zh-TW':3,ru:4,it:5};
          const expected=(key)=>language==='ko'?key:window.KINETO_COPY_I18N.ui[key]?.[index[language]];
          const checks=[...document.querySelectorAll('[data-demo-i18n-aria-label]')].map((node)=>{
            const key=node.dataset.demoI18nAriaLabel;
            return {key,actual:node.getAttribute('aria-label'),expected:expected(key)};
          });
          checks.push({key:'본문으로 건너뛰기',actual:document.querySelector('.skip-link')?.textContent,expected:expected('본문으로 건너뛰기')});
          checks.push({key:'sitemap-title',actual:document.getElementById('sitemap-title')?.textContent,expected:`Kineto — ${expected('사이트맵')}`});
          // Animated examples intentionally preserve their authored Korean
          // content. Several modules mirror that content into aria-label only
          // after an animation starts, so a document-wide query is sensitive to
          // runner speed. Restrict the untranslated-label guard to application
          // chrome; localized controls themselves are exhaustively asserted by
          // `checks` above, including controls rendered inside demo stages.
          const remainingKorean=language==='ko'?[]:[...document.querySelectorAll('[aria-label]')]
            .filter((node)=>!node.closest('.demo-stage'))
            .map((node)=>node.getAttribute('aria-label'))
            .filter((label)=>/[가-힣]/.test(label))
            .sort();
          return {
            ok:document.documentElement.lang===language
              &&checks.every(({actual,expected:value})=>actual===value)
              &&remainingKorean.length===0,
            checks,
            remainingKorean
          };
        })(),
        moduleIndexKorean:language==='ko'?[]:[...document.querySelectorAll('.mod-index-item .mii-sub')]
          .filter((node)=>/[가-힣]/.test(node.textContent))
          .map((node)=>node.closest('.mod-index-item')?.dataset.module),
        moduleBlockKorean:language==='ko'?[]:[...document.querySelectorAll('[data-module-block] .module-block-sub')]
          .filter((node)=>/[가-힣]/.test(node.textContent))
          .map((node)=>node.closest('[data-module-block]')?.dataset.moduleBlock)
      };
    }
    select.value='ko';
    select.dispatchEvent(new window.Event('change',{bubbles:true}));
    return result;
  });
  assert.ok(
    Object.values(localizedCopy).every(({count,twoLines,summary,drawerChrome,accessibleChrome,moduleIndexKorean,moduleBlockKorean})=>
      count>=129&&twoLines&&summary&&drawerChrome&&accessibleChrome.ok&&moduleIndexKorean.length===0&&moduleBlockKorean.length===0
    ),
    `localized demo copy or controls are incomplete: ${JSON.stringify(localizedCopy)}`
  );

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
  await pop.evaluate((card)=>{
    const panel=card.querySelector(':scope > .kt-playground');
    const body=panel.__buildBody();
    const input=body.querySelector('[data-option="to"]');
    input.value='123456';
    input.dispatchEvent(new window.Event('change',{bubbles:true}));
  });
  // The drawer owns the option contract; animation completion is covered by the
  // module regressions. Here assert the live target, generated code and instance
  // lifecycle without coupling the UI test to an exact counter paint frame.
  await page.waitForFunction(
    () => document.querySelector('[data-kt-counter="pop"]')?.dataset.ktTo === '123456',
    null,
    { polling: 50, timeout: 2500 }
  );
  const popState=await pop.evaluate((card)=>{
    const target=card.querySelector('[data-kt-counter="pop"]');
    return {
      to:target.dataset.ktTo,
      html:card.querySelector('.kt-playground').dataset.htmlCode,
      js:card.querySelector('.kt-playground').dataset.jsCode,
      counterInstances:Kineto.getInstance(target).filter((instance)=>instance.type==='counter').length
    };
  });
  assert.equal(popState.to,'123456'); assert.match(popState.html,/data-kt-to="123456"/); assert.match(popState.js,/"to": 123456/); assert.equal(popState.counterInstances,1);
  await pop.evaluate((card)=>{
    const body=card.querySelector(':scope > .kt-playground').__buildBody();
    [...body.querySelectorAll('.kt-playground__toolbar button')].find((button)=>button.textContent.trim()==='초기화')?.click();
  });
  await page.waitForFunction(
    () => document.querySelector('[data-kt-counter="pop"]')?.dataset.ktTo === '98760',
    null,
    { polling: 50, timeout: 2500 }
  );
  assert.equal(await pop.locator('[data-kt-counter="pop"]').getAttribute('data-kt-to'),'98760');

  const elapsedSeconds=page.locator('#counter .card').filter({has:page.getByRole('heading',{name:'Elapsed seconds',exact:true})});
  await elapsedSeconds.waitFor();
  const elapsedState=await elapsedSeconds.locator('[data-kt-counter="clock"]').evaluate((el)=>({
    text:el.textContent,
    secondsOnly:el.dataset.ktSecondsOnly,
    digits:el.dataset.ktSecondsDigits,
    label:el.dataset.ktSecondsLabel,
    since:el.dataset.ktSince
  }));
  assert.equal(elapsedState.secondsOnly,'true');
  assert.equal(elapsedState.digits,'3');
  assert.equal(elapsedState.label,'S');
  assert.ok(elapsedState.since,'seconds-only demo must expose a server-origin timestamp');
  assert.match(elapsedState.text,/^\d+S$/,'seconds-only demo must render a seconds value');
  const elapsedDrawer=await elapsedSeconds.evaluate((card)=>{
    const body=card.querySelector(':scope > .kt-playground').__buildBody();
    return {
      modeHidden:body.querySelector('[data-module="counter"][data-key="preset"]')?.hidden,
      sourceMode:card.querySelector('[data-kt-counter]').getAttribute('data-kt-counter')
    };
  });
  assert.equal(elapsedDrawer.modeHidden,true,'seconds-only demo must not expose incompatible Counter modes');
  assert.equal(elapsedDrawer.sourceMode,'clock','seconds-only demo must retain its Clock activation');

  // Exercise every distinct runtime drawer control, not merely the first range
  // in each card. Controls are grouped by body/module: every binding is changed
  // and synchronously checked, then restored before one debounced rebuild. This
  // keeps the sweep fast while covering text/select/checkbox/number/colour/ease,
  // conditional controls, tab hosts, and the three virtual page-level panels.
  const panelSweep=await page.evaluate(async()=>{
    const sleep=(ms)=>new Promise((resolve)=>setTimeout(resolve,ms));
    const dash=(value)=>String(value).replace(/([a-z\d])([A-Z])/g,'$1-$2').toLowerCase();
    const panels=[...document.querySelectorAll('.kt-playground')];
    const candidates=new Map();
    let renderedOccurrences=0;

    // A module/key/type is one factory binding. Prefer a currently visible
    // instance when the same option appears in several demo variants; hidden
    // conditional fields are still exercised when no visible variant exists.
    panels.forEach((panel)=>{
      const body=panel.__buildBody?.();
      body?.querySelectorAll('.kt-playground__field[data-module][data-key][data-type]').forEach((field)=>{
        renderedOccurrences+=1;
        const input=field.querySelector('input[data-option],select[data-option]');
        if(!input)return;
        const {module,key,type}=field.dataset;
        const signature=`${module}.${key}:${type}`;
        const candidate={body,field,input,key,module,panel,type,visible:!field.hidden};
        const previous=candidates.get(signature);
        if(!previous||(candidate.visible&&!previous.visible))candidates.set(signature,candidate);
      });
    });

    const groupsByBody=new Map();
    candidates.forEach((candidate,signature)=>{
      if(!groupsByBody.has(candidate.body))groupsByBody.set(candidate.body,new Map());
      const moduleGroups=groupsByBody.get(candidate.body);
      if(!moduleGroups.has(candidate.module))moduleGroups.set(candidate.module,[]);
      moduleGroups.get(candidate.module).push({...candidate,signature});
    });

    const responseFailures=[];
    const rebuildFailures=[];
    const untestable=[];
    const exercisedByType={};
    const exercisedModules=new Set();
    const resetPanels=new Set();
    let exercised=0;

    const valueOf=(input,type)=>type==='checkbox'?input.checked:input.value;
    const writeValue=(input,type,value)=>{
      if(type==='checkbox')input.checked=Boolean(value);
      else input.value=String(value);
    };
    const probeValue=(input,type)=>{
      const before=valueOf(input,type);
      if(type==='checkbox')return !before;
      if(type==='select'||type==='easing'){
        const alternatives=[...input.options].filter((option)=>!option.disabled&&option.value!==before);
        return alternatives.find((option)=>option.value!=='')?.value??alternatives[0]?.value;
      }
      if(type==='color')return String(before).toLowerCase()==='#123456'?'#654321':'#123456';
      if(type==='range'){
        const current=Number(before);
        const min=Number(input.min);
        const max=Number(input.max);
        const step=Number(input.step)||1;
        const up=Math.min(max,current+step);
        return up!==current?String(up):String(Math.max(min,current-step));
      }
      if(type==='number'){
        const current=Number(before);
        return String(Number.isFinite(current)?current+1:1);
      }
      if(type==='text')return before==='__kt_control_probe__'?'__kt_control_probe_2__':'__kt_control_probe__';
      return undefined;
    };
    const codeState=(panel)=>[
      panel.dataset.htmlCode||'',panel.dataset.jsCode||'',
      panel.dataset.reactCode||'',panel.dataset.vueCode||'',panel.dataset.cssCode||''
    ].join('\u0000');

    for(const [body,moduleGroups] of groupsByBody){
      const owner=body.__mkOwner;
      if(owner?.isConnected)resetPanels.add(owner);
      for(const [module,controls] of moduleGroups){
        if(!owner?.isConnected){
          rebuildFailures.push(`${module}: settings owner disconnected before edit`);
          continue;
        }
        const status=body.querySelector('.kt-playground__status');
        const sentinel=`__kt_control_rebuild_${module}_${exercised}__`;
        if(status)status.textContent=sentinel;

        for(const control of controls){
          const {input,key,signature,type}=control;
          const before=valueOf(input,type);
          const next=probeValue(input,type);
          if(next===undefined||String(next)===String(before)){
            untestable.push(signature);
            continue;
          }
          const expectedAttribute=`data-kt-${dash(key==='preset'?module:key)}`;
          const codeBefore=codeState(owner);
          const observer=new window.MutationObserver(()=>{});
          observer.observe(document.documentElement,{
            attributes:true,
            attributeOldValue:true,
            subtree:true,
            attributeFilter:[expectedAttribute]
          });
          writeValue(input,type,next);
          input.dispatchEvent(new window.Event(type==='range'||type==='color'?'input':'change',{bubbles:true}));
          const reflected=observer.takeRecords().some((record)=>record.attributeName===expectedAttribute)
            ||codeState(owner)!==codeBefore;
          observer.disconnect();
          if(!reflected)responseFailures.push(signature);

          // Restore synchronously. The host-level debounce then performs one
          // real rebuild for the whole module with safe authored values.
          writeValue(input,type,before);
          input.dispatchEvent(new window.Event(type==='range'||type==='color'?'input':'change',{bubbles:true}));
          exercised+=1;
          exercisedByType[type]=(exercisedByType[type]||0)+1;
          exercisedModules.add(module);
        }

        await sleep(180);
        if(!owner.isConnected||!owner.querySelector('summary')){
          rebuildFailures.push(`${module}: settings trigger disappeared after rebuild`);
        }
        if(status?.textContent===sentinel){
          rebuildFailures.push(`${module}: debounced rebuild did not complete`);
        }
        if(status?.dataset.error==='1'){
          rebuildFailures.push(`${module}: ${status.textContent||'rebuild failed'}`);
        }
      }
    }

    // Return every touched demo to its authored state so this exhaustive audit
    // cannot bias the later, scenario-specific assertions in this same page.
    resetPanels.forEach((panel)=>{
      if(!panel.isConnected)return;
      panel.__mkBody?.querySelector('.kt-playground__toolbar button:nth-child(2)')?.click();
    });
    await sleep(80);

    const duplicates=[];
    [document.documentElement,...document.querySelectorAll('*')].forEach((node)=>{
      const counts=new Map();
      Kineto.getInstance(node).forEach((instance)=>counts.set(instance.type,(counts.get(instance.type)||0)+1));
      counts.forEach((count,type)=>{
        if(count>1)duplicates.push(`${node.id||node.className||node.tagName}:${type}×${count}`);
      });
    });

    return {
      discovered:candidates.size,
      duplicateInstances:[...new Set(duplicates)],
      exercised,
      exercisedByType,
      exercisedModules:exercisedModules.size,
      hiddenOnly:[...candidates.values()].filter((candidate)=>!candidate.visible).length,
      rebuildFailures,
      renderedOccurrences,
      responseFailures,
      runtimeFieldDefinitions:Object.values(window.KinetoPlayground.fields).reduce((sum,definitions)=>sum+definitions.length,0),
      runtimeFieldModules:Object.keys(window.KinetoPlayground.fields).length,
      untestable
    };
  });
  assert.ok(
    panelSweep.discovered>=panelSweep.runtimeFieldDefinitions,
    `rendered control manifest ${panelSweep.discovered} did not cover ${panelSweep.runtimeFieldDefinitions} runtime field definitions`
  );
  assert.equal(panelSweep.exercised,panelSweep.discovered,`exercised ${panelSweep.exercised}/${panelSweep.discovered} distinct drawer controls`);
  assert.ok(panelSweep.exercisedModules>=panelSweep.runtimeFieldModules,`exercised only ${panelSweep.exercisedModules}/${panelSweep.runtimeFieldModules} runtime field modules`);
  assert.deepEqual(Object.keys(panelSweep.exercisedByType).sort(),['checkbox','color','easing','number','range','select','text']);
  assert.deepEqual(panelSweep.untestable,[],`drawer controls had no deterministic alternate value: ${panelSweep.untestable.join(', ')}`);
  assert.deepEqual(panelSweep.responseFailures,[],`drawer controls did not reflect their edited option: ${panelSweep.responseFailures.join(', ')}`);
  assert.deepEqual(panelSweep.rebuildFailures,[],`drawer module rebuild failures: ${panelSweep.rebuildFailures.join(', ')}`);
  assert.deepEqual(panelSweep.duplicateInstances,[],`live-edit sweep created duplicate target instances: ${panelSweep.duplicateInstances.join(', ')}`);
  console.log(
    `Demo control QA: ${panelSweep.exercised}/${panelSweep.discovered} distinct controls `
    + `(${panelSweep.renderedOccurrences} rendered instances, ${panelSweep.hiddenOnly} conditional-only), `
    + `${panelSweep.exercisedModules} modules and ${Object.keys(panelSweep.exercisedByType).length} control types.`
  );

  const loaderVisibility=await page.evaluate(async()=>{
    const sleep=(ms)=>new Promise((resolve)=>setTimeout(resolve,ms));
    const indicator=document.querySelector('[data-kt-loading-indicator="spinner"][data-kt-spinner-style="comet"]');
    const card=indicator?.closest('.card');
    const panel=card?.querySelector(
      '.demo-tabhosts > .kt-playground-host:not([hidden]) > .kt-playground, :scope > .kt-playground'
    );
    const body=panel?.__buildBody?.();
    const type=body?.querySelector('[data-module="loadingIndicator"][data-option="preset"]');
    const spinnerMode=body?.querySelector('[data-module="loadingIndicator"][data-option="spinnerMode"]');
    const terminalStyle=body?.querySelector('[data-option="terminalStyle"]');
    if(!type||!spinnerMode||!terminalStyle)return {found:false};
    const visible=(key)=>!body.querySelector(`[data-option="${key}"]`)?.closest('.kt-playground__field')?.hidden;
    const defaultMode=type.value==='spinner'&&spinnerMode.value==='spin';
    type.value='terminal';
    type.dispatchEvent(new window.Event('change',{bubbles:true}));
    await sleep(180);
    const terminalOnly=visible('terminalStyle')&&!visible('spinnerStyle')&&!visible('barWidth')&&!visible('transformOrigin');
    terminalStyle.value='blocks';
    terminalStyle.dispatchEvent(new window.Event('change',{bubbles:true}));
    await sleep(180);
    const blocksOnly=visible('dotCount')&&!visible('cursorChar');
    return {found:true,defaultMode,terminalOnly,blocksOnly};
  });
  assert.equal(loaderVisibility.found,true,'Loading Indicator settings fixture was not found');
  assert.equal(loaderVisibility.defaultMode,true,'Loading Indicator must show its running spinner/spin defaults');
  assert.equal(loaderVisibility.terminalOnly,true,'Loading Indicator type switch left unsupported spinner controls visible');
  assert.equal(loaderVisibility.blocksOnly,true,'Terminal blocks did not expose only its supported count controls');

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
  assert.equal(demoPolish.accordionPaddingBottom,'14px','open accordion note must match its 14px top padding');
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

  // The settings drawer is fluid: three or more categories share the same
  // responsive grid instead of forcing an odd final card across the full row.
  // Collapsed title bars must remain compact and cards must never overlap.
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
      forcedFull:groups.length>1&&groups.some((group)=>getComputedStyle(group).gridColumnEnd==='-1'),
      compact:collapsed.every((group)=>group.querySelector('.kt-playground__controls')?.offsetHeight===0&&group.offsetHeight<80),
      overlap
    };
    panel.open=false;
    panel.dispatchEvent(new window.Event('toggle'));
    return result;
  });
  assert.equal(drawerLayout.found,true,'no multi-group settings panel available for layout QA');
  assert.equal(drawerLayout.expanded,1,'settings layout QA must leave exactly one expanded group');
  assert.equal(drawerLayout.forcedFull,false,'multi-group settings cards must not be forced across the full drawer width');
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
    const viewBox=graph?.viewBox?.baseVal;
    const graphMarks=[...graph.querySelectorAll('.kt-bz-handle,.kt-bz-anchor')].map(rect);
    const graphRatio=graphRect.width/graphRect.height;
    const viewBoxRatio=viewBox.width/viewBox.height;
    const result={
      found:Boolean(ease&&graph&&duration&&stagger&&close),
      easeTrackFit:Math.abs(easeRect.width-(durationRect.width+staggerRect.width+gap))<=3,
      graphWidthFit:Math.abs(graphRect.right-easeRect.right)<=2,
      graphFixedHeight:Math.abs(graphRect.height-190)<=2,
      graphWide:graphRect.width>graphRect.height,
      graphViewBoxFit:Math.abs(graphRatio-viewBoxRatio)<=0.02,
      graphMarksRound:graphMarks.every((mark)=>Math.abs(mark.width-mark.height)<=0.5),
      graphMarksContained:graphMarks.every((mark)=>
        mark.left>=graphRect.left-1&&mark.right<=graphRect.right+1&&
        mark.top>=graphRect.top-1&&mark.bottom<=graphRect.bottom+1
      ),
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
  assert.equal(drawerVisuals.graphWidthFit,true,'ease graph does not fill its available grid track');
  assert.equal(drawerVisuals.graphFixedHeight,true,'ease graph must retain its fixed height');
  assert.equal(drawerVisuals.graphWide,true,'ease graph should allow a wide rectangular layout');
  assert.equal(drawerVisuals.graphViewBoxFit,true,'ease graph viewBox must match the rendered box ratio');
  assert.equal(drawerVisuals.graphMarksRound,true,'ease graph handles and anchors must remain circular');
  assert.equal(drawerVisuals.graphMarksContained,true,'ease graph handles and anchors must not be clipped');
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
    const savedScrollTop=Math.min(240,longSection.scrollHeight-longSection.clientHeight);
    longSection.scrollTop=savedScrollTop;
    instance.go(2,true);
    instance.go(1,true);
    const afterReentry=longSection.scrollTop;
    const result={
      found:true,
      embeddedFillsHost:Math.abs(embedded.getBoundingClientRect().height-host.getBoundingClientRect().height)<=1,
      normalStartsAfterDeck:normal.offsetTop>=embedded.offsetHeight-1,
      longSectionOverflows:longSection.scrollHeight>longSection.clientHeight+2,
      afterLanding,
      afterTail,
      afterNextGesture,
      savedScrollTop,
      afterReentry
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
  assert.equal(fullpageFlow.afterReentry,fullpageFlow.savedScrollTop,'re-entering a long Fullpage section must preserve its internal scroll position');
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
  console.log(`Demo QA OK: ${surface.panels} playgrounds, lifecycle/UMD smoke, and animated media continuity; 48 owner requirements represented.`);
  passed = true;
} finally {
  killBrowserServer(browserServer);
  await new Promise((resolveCleanup) => setTimeout(resolveCleanup, 250));
  if (passed) process.reallyExit(0);
}
