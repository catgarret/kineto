import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';

const root = resolve(import.meta.dirname, '..', '..');
let html = await readFile(resolve(root, 'demo/index.html'), 'utf8');
html = html
  .replace(/<link rel="stylesheet" href="\.\.\/dist\/kineto\.css[^"]*">/, '')
  .replace(/<script src="\.\.\/dist\/kineto\.umd\.js[^"]*"><\/script>/, '')
  .replace(/<script src="\.\/(?:help-i18n|help-i18n-extra|playground-i18n|playground|copy-i18n|main)\.js[^"]*"><\/script>/g, '')
  .replace('<head>', '<head><base href="http://kineto.local/demo/">');
const mime = { '.svg':'image/svg+xml','.png':'image/png','.gif':'image/gif','.webp':'image/webp','.js':'text/javascript','.css':'text/css' };
const browser = await chromium.launch({ headless:true, ...(process.env.KT_CHROME ? { executablePath:process.env.KT_CHROME } : {}), args:['--no-sandbox','--disable-setuid-sandbox','--disable-gpu'] });
const page = await browser.newPage({ viewport:{ width:1437, height:807 } });
try {
  await page.route(/fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net/, (route)=>route.fulfill({status:200,body:'',contentType:'text/css'}));
  await page.route('http://kineto.local/**', async (route) => {
    const url=new URL(route.request().url());
    const relative=decodeURIComponent(url.pathname).replace(/^\/demo\//,'');
    try { const file=resolve(root,'demo',relative); await route.fulfill({status:200,body:await readFile(file),contentType:mime[extname(file)]||'application/octet-stream'}); }
    catch { await route.fulfill({status:404,body:'Not found'}); }
  });
  await page.setContent(html,{waitUntil:'load'});
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
  for (const file of ['dist/kineto.umd.js','demo/help-i18n.js','demo/help-i18n-extra.js','demo/playground-i18n.js','demo/playground.js','demo/copy-i18n.js','demo/main.js']) {
    await page.addScriptTag({path:resolve(root,file)});
  }
  await page.waitForFunction(()=>window.Kineto&&window.Kineto.instanceCount>30,null,{timeout:15000});
  await page.waitForTimeout(700);

  const cover = await page.evaluate(() => {
    const text=document.querySelector('.demo-css-0a735447');
    const stage=text.closest('.demo-stage');
    return {font:Number.parseFloat(getComputedStyle(text).fontSize),textHeight:text.getBoundingClientRect().height,stageHeight:stage.getBoundingClientRect().height};
  });
  assert.ok(cover.font>=32,`Cover Reveal demo text must retain display scale (${cover.font}px)`);
  assert.ok(cover.textHeight<cover.stageHeight,'Cover Reveal demo text must fit within its stage');

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
  console.log('Demo polish browser QA OK',JSON.stringify({cover,drawerBefore,resize}));
} finally {
  await browser.close();
}
