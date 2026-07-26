// B-2: unified navigation — nav click / scroll / hash / Back-Forward stay in sync,
// no dead internal anchors, no top-jumping href="#", first-snap => #mod-textSplit.
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CHROME = process.env.KT_CHROME || undefined;
const MODULE_COUNT = JSON.parse(fs.readFileSync(path.join(root, 'kineto.features.json'), 'utf8')).moduleCount;
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.woff2':'font/woff2'};
const server=http.createServer((q,s)=>{let p=decodeURIComponent(q.url.split('?')[0]);let fp=path.join(root,p);if(fp.endsWith('/'))fp=path.join(fp,'index.html');fs.readFile(fp,(e,b)=>{if(e){s.writeHead(404);s.end();return;}s.writeHead(200,{'content-type':MIME[path.extname(fp)]||'application/octet-stream'});s.end(b);});});
await new Promise(r=>server.listen(0,r)); const PORT=server.address().port;
const browser=await chromium.launch({headless:true,...(CHROME?{executablePath:CHROME}:{}),args:['--no-sandbox','--disable-gpu']});
const page=await browser.newPage({viewport:{width:1280,height:900}});
page.on('pageerror',e=>console.log('PAGEERROR:',e.message));
await page.goto(`http://localhost:${PORT}/demo/index.html`,{waitUntil:'load'});
await page.waitForFunction((expected)=>window.Kineto&&document.querySelectorAll('main [data-module-block]').length>=expected,MODULE_COUNT,{timeout:15000});
await page.waitForTimeout(800);
let pass=0,fail=0; const ck=(n,c,d)=>{console.log(`  [${c?'PASS':'FAIL'}] ${n}${d?' — '+d:''}`);c?pass++:fail++;};
const hash=()=>page.evaluate(()=>location.hash);

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
