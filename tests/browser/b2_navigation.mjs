// B-2: unified navigation — nav click / scroll / hash / Back-Forward stay in sync,
// no dead internal anchors, no top-jumping href="#", first-snap => #mod-textSplit.
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CHROME = process.env.KT_CHROME || undefined;
const MODULE_COUNT = JSON.parse(fs.readFileSync(path.join(root, 'kineto.features.json'), 'utf8')).moduleCount;
// Radial remains a public compatibility module, but its demo is intentionally
// grouped into the Slider block instead of duplicating the same carousel UI.
const DEMO_BLOCK_COUNT = MODULE_COUNT - 1;
const shareToken=(payload)=>Buffer.from(JSON.stringify(payload),'utf8').toString('base64url');
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.woff2':'font/woff2'};
const server=http.createServer((q,s)=>{const requestUrl=new URL(q.url,'http://localhost');let p=decodeURIComponent(requestUrl.pathname);let fp=path.join(root,p);if(fp.endsWith('/'))fp=path.join(fp,'index.html');fs.readFile(fp,(e,b)=>{if(e){s.writeHead(404);s.end();return;}if(requestUrl.searchParams.has('share-order-fixture')&&fp===path.join(root,'demo/index.html')){const marker='<article class="card wide"><h3>Typewriter</h3>';const fixture='<article class="card" data-demo-module="textSplit" data-share-order-fixture><h3>Unrelated ordering fixture</h3><p>Only shifts the legacy mount ordinal.</p><div class="demo-stage"><div data-kt-text-split="word">ORDER FIXTURE</div></div></article>';b=Buffer.from(b.toString().replace(marker,fixture+marker));}s.writeHead(200,{'content-type':MIME[path.extname(fp)]||'application/octet-stream'});s.end(b);});});
await new Promise(r=>server.listen(0,r)); const PORT=server.address().port;
const browser=await chromium.launch({headless:true,...(CHROME?{executablePath:CHROME}:{}),args:['--no-sandbox','--disable-gpu']});
const page=await browser.newPage({viewport:{width:1280,height:900}});
page.on('pageerror',e=>console.log('PAGEERROR:',e.message));
await page.goto(`http://localhost:${PORT}/demo/index.html`,{waitUntil:'load'});
await page.waitForFunction((expected)=>window.Kineto&&document.querySelectorAll('main [data-module-block]').length>=expected,DEMO_BLOCK_COUNT,{timeout:15000});
await page.waitForTimeout(800);
let pass=0,fail=0; const ck=(n,c,d)=>{console.log(`  [${c?'PASS':'FAIL'}] ${n}${d?' — '+d:''}`);c?pass++:fail++;};
const hash=()=>page.evaluate(()=>location.hash);

// 0. The first keyboard stop is a visible-on-focus skip link, and activating it
// moves programmatic focus to the real main landmark rather than only scrolling.
{
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});
  const sp=await ctx.newPage();
  await sp.goto(`http://localhost:${PORT}/demo/index.html`,{waitUntil:'load'});
  await sp.waitForFunction(()=>window.Kineto&&document.querySelector('main [data-module-block]'),null,{timeout:15000});
  const r=await sp.evaluate(async()=>{
    const skip=document.querySelector('.skip-link');
    const candidates=[...document.querySelectorAll('a[href],button:not([disabled]),select,input:not([disabled]),[tabindex]:not([tabindex="-1"])')];
    const first=candidates.find((node)=>!node.closest('[hidden]')&&getComputedStyle(node).display!=='none'&&getComputedStyle(node).visibility!=='hidden');
    skip.focus();
    await new Promise((resolve)=>setTimeout(resolve,180));
    const rect=skip.getBoundingClientRect();
    skip.click();
    await new Promise((resolve)=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    return {
      firstIsSkip:first===skip,
      visibleWhileFocused:rect.top>=0&&rect.bottom<=innerHeight&&rect.width>0,
      activeId:document.activeElement?.id,
      mainTabIndex:document.getElementById('main-content')?.tabIndex,
      hash:location.hash
    };
  });
  ck('skip link is the first visible keyboard stop',r.firstIsSkip,String(r.firstIsSkip));
  ck('focused skip link is visible in the viewport',r.visibleWhileFocused,String(r.visibleWhileFocused));
  ck('skip link moves focus to the main landmark',r.activeId==='main-content'&&r.mainTabIndex===-1,JSON.stringify(r));
  await ctx.close();
}

// 1. No dead internal anchors: every href^="#..." (non-empty) resolves to exactly 1 element
const anchorReport=await page.evaluate(()=>{
  const bad=[]; let emptyHash=0;
  for(const a of document.querySelectorAll('a[href^="#"]')){
    const h=a.getAttribute('href');
    if(h==='#'){emptyHash++;continue;}
    const id=h.slice(1); let n=0; try{n=document.querySelectorAll('#'+CSS.escape(id)).length;}catch(_){n=-1;}
    if(n!==1) bad.push({href:h,found:n});
  }
  return {bad,emptyHash};
});
ck('no href="#" (top-jump) anchors', anchorReport.emptyHash===0, `count=${anchorReport.emptyHash}`);
ck('every internal anchor resolves to exactly 1 target', anchorReport.bad.length===0, JSON.stringify(anchorReport.bad).slice(0,300));

// 2. nav click updates hash + active
await page.click('#side-nav-modules [data-module="slider"]');
await page.waitForTimeout(1400);
const hClick=await hash();
ck('nav click -> #mod-slider hash', hClick==='#mod-slider', hClick);
const activeAfterClick=await page.evaluate(()=>document.querySelector('#side-nav-modules .nav-mod.active')?.dataset.module);
ck('nav click -> active nav item', activeAfterClick==='slider', activeAfterClick);

// 3. scroll updates hash (scrollspy)
await page.evaluate(()=>{const el=document.getElementById('mod-tabs');el&&el.scrollIntoView();});
await page.waitForTimeout(1000);
const hScroll=await hash();
ck('scroll -> hash tracks section in view', /^#mod-/.test(hScroll), hScroll);

// 4. Back/Forward across two CLICKS (each pushState). Use modules distinct from
//    the current hash so each click genuinely pushes a new entry.
await page.click('#side-nav-modules [data-module="slider"]'); await page.waitForTimeout(1400);
const hA=await hash(); ck('click A -> #mod-slider', hA==='#mod-slider', hA);
await page.click('#side-nav-modules [data-module="counter"]'); await page.waitForTimeout(1400);
const hB=await hash(); ck('click B -> #mod-counter', hB==='#mod-counter', hB);
await page.goBack(); await page.waitForTimeout(900);
const hBack=await hash(); ck('Back -> #mod-slider', hBack==='#mod-slider', hBack);
await page.goForward(); await page.waitForTimeout(900);
const hFwd=await hash(); ck('Forward -> #mod-counter', hFwd==='#mod-counter', hFwd);

// 5. deep-link on a FRESH load (real usage): scroll lands on the module AND hash stays
{
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});
  const dp=await ctx.newPage();
  await dp.goto(`http://localhost:${PORT}/demo/index.html#mod-counter`,{waitUntil:'load'});
  await dp.waitForFunction(()=>window.Kineto&&document.getElementById('mod-counter'),null,{timeout:15000}).catch(()=>{});
  await dp.waitForTimeout(2500);
  const r=await dp.evaluate(()=>{const el=document.getElementById('mod-counter');return {top:el?Math.round(el.getBoundingClientRect().top):99999, hash:location.hash};});
  ck('deep-link #mod-counter scrolls into view on load', Math.abs(r.top)<200, `|top|=${Math.abs(r.top)}`);
  ck('deep-link keeps the #mod-counter hash', r.hash==='#mod-counter', r.hash);
  await ctx.close();
}

// 6. A copied settings URL may combine `?kt=…` with a module hash. Restoring
// the selected card must not steal the final scroll from the requested block.
{
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});
  const sp=await ctx.newPage();
  const shared=`?kt=${shareToken({v:1,demo:'typewriter-15',options:{typewriter:{typeSpeed:19}}})}#mod-textReveal`;
  await sp.goto(`http://localhost:${PORT}/demo/index.html${shared}`,{waitUntil:'load'});
  await sp.waitForFunction(()=>window.Kineto&&document.querySelector('#mod-typewriter .kt-playground[data-share-key]'),null,{timeout:15000});
  await sp.waitForTimeout(2500);
  const r=await sp.evaluate(()=>({
    hash:location.hash,
    top:Math.round(document.getElementById('mod-textReveal')?.getBoundingClientRect().top||99999),
    restoredTypeSpeed:document.querySelector('#mod-typewriter [data-kt-typewriter]')?.getAttribute('data-kt-type-speed'),
    shareKey:document.querySelector('#mod-typewriter .kt-playground[data-share-key]')?.dataset.shareKey,
    legacyShareKey:document.querySelector('#mod-typewriter .kt-playground[data-share-key]')?.dataset.shareLegacyKey
  }));
  const identity={shareKey:r.shareKey,legacyShareKey:r.legacyShareKey};
  ck('Typewriter retains its legacy v1 ordinal alias',identity.legacyShareKey==='typewriter-15',identity.legacyShareKey);
  ck('shared settings URL keeps the requested module hash',r.hash==='#mod-textReveal',r.hash);
  ck('shared settings URL lands on the requested module',Math.abs(r.top)<200,`|top|=${Math.abs(r.top)}`);
  ck('legacy v1 URL restores the real selected option',r.restoredTypeSpeed==='19',`typeSpeed=${r.restoredTypeSpeed}`);
  await ctx.close();

  const fixtureCtx=await browser.newContext({viewport:{width:1280,height:900}});
  const fixturePage=await fixtureCtx.newPage();
  await fixturePage.goto(`http://localhost:${PORT}/demo/index.html?share-order-fixture=1`,{waitUntil:'load'});
  await fixturePage.waitForFunction(()=>window.Kineto&&document.querySelector('[data-share-order-fixture] .kt-playground'),null,{timeout:15000});
  await fixturePage.waitForTimeout(1000);
  const shiftedIdentity=await fixturePage.evaluate(()=>{
    const panel=document.querySelector('#mod-typewriter .kt-playground[data-share-key]');
    return {shareKey:panel?.dataset.shareKey,legacyShareKey:panel?.dataset.shareLegacyKey};
  });
  ck('semantic v2 key survives an unrelated earlier mount',shiftedIdentity.shareKey===identity.shareKey,`${identity.shareKey} / ${shiftedIdentity.shareKey}`);
  ck('fixture genuinely shifts the legacy global ordinal',shiftedIdentity.legacyShareKey!==identity.legacyShareKey,`${identity.legacyShareKey} / ${shiftedIdentity.legacyShareKey}`);
  await fixtureCtx.close();

  const restoreCtx=await browser.newContext({viewport:{width:1280,height:900}});
  const restorePage=await restoreCtx.newPage();
  const v2=`?share-order-fixture=1&kt=${shareToken({v:2,demo:identity.shareKey,options:{typewriter:{typeSpeed:23}}})}#mod-textReveal`;
  await restorePage.goto(`http://localhost:${PORT}/demo/index.html${v2}`,{waitUntil:'load'});
  await restorePage.waitForFunction(()=>window.Kineto&&document.getElementById('mod-textReveal'),null,{timeout:15000});
  await restorePage.waitForTimeout(2500);
  const restored=await restorePage.evaluate(()=>({
    hash:location.hash,
    top:Math.round(document.getElementById('mod-textReveal')?.getBoundingClientRect().top||99999),
    typeSpeed:document.querySelector('#mod-typewriter [data-kt-typewriter]')?.getAttribute('data-kt-type-speed')
  }));
  ck('v2 URL restores the real option after mount-order insertion',restored.typeSpeed==='23',`typeSpeed=${restored.typeSpeed}`);
  ck('v2 restore preserves hash landing after mount-order insertion',restored.hash==='#mod-textReveal'&&Math.abs(restored.top)<200,`${restored.hash}, |top|=${Math.abs(restored.top)}`);
  await restoreCtx.close();
}

// 7. First-screen snap remains a single deliberate gesture in both directions.
// Its momentum tail must be consumed rather than bouncing the page straight back.
{
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});
  const sp=await ctx.newPage();
  await sp.goto(`http://localhost:${PORT}/demo/index.html`,{waitUntil:'load'});
  await sp.waitForFunction(()=>window.Kineto&&document.getElementById('mod-textSplit'),null,{timeout:15000});
  // The first-load intro deliberately locks document scrolling while it exits.
  await sp.waitForTimeout(2500);
  const downward=await sp.evaluate(()=>{
    window.scrollTo(0,0);
    const event=new WheelEvent('wheel',{deltaY:120,cancelable:true});
    window.dispatchEvent(event);
    return event.defaultPrevented;
  });
  await sp.waitForTimeout(300);
  const momentumAllowed=await sp.evaluate(()=>{
    const event=new WheelEvent('wheel',{deltaY:120,cancelable:true});
    window.dispatchEvent(event);
    return event.defaultPrevented;
  });
  const tailBlocked=await sp.evaluate(()=>{
    const event=new WheelEvent('wheel',{deltaY:-120,cancelable:true});
    window.dispatchEvent(event);
    return event.defaultPrevented;
  });
  await sp.waitForTimeout(900);
  const landed=await sp.evaluate(()=>{
    const landing=document.querySelector('main .section-head');
    return {top:Math.round(landing.getBoundingClientRect().top),scrollY:Math.round(window.scrollY),offsetTop:landing.offsetTop};
  });
  ck('hero wheel -> first scene', downward&&Math.abs(landed.top)<120, `prevented=${downward}, ${JSON.stringify(landed)}`);
  ck('hero snap preserves same-direction momentum', !momentumAllowed, `prevented=${momentumAllowed}`);
  ck('hero snap consumes momentum tail', tailBlocked, `prevented=${tailBlocked}`);
  const reverse=await sp.evaluate(()=>{
    const event=new WheelEvent('wheel',{deltaY:-120,cancelable:true});
    window.dispatchEvent(event);
    return event.defaultPrevented;
  });
  await sp.waitForTimeout(2200);
  const returned=await sp.evaluate(()=>window.scrollY<6);
  ck('first-scene wheel up -> hero', reverse&&returned, `prevented=${reverse}, returned=${returned}, before=${JSON.stringify(landed)}`);
  await ctx.close();
}

// Screenshots (evidence H-4): desktop + mobile
const shotDir=path.join(root,'tests/browser/shots');
fs.mkdirSync(shotDir,{recursive:true});
await page.setViewportSize({width:1440,height:900});
await page.evaluate(()=>window.scrollTo(0,0)); await page.waitForTimeout(400);
await page.screenshot({path:path.join(shotDir,'nav-desktop.png')});
await page.setViewportSize({width:390,height:844});
await page.waitForTimeout(400);
await page.screenshot({path:path.join(shotDir,'nav-mobile.png')});

await browser.close(); server.close();
console.log(`\n===== B-2 NAV: ${pass} passed, ${fail} failed =====`);
process.exit(fail?1:0);
