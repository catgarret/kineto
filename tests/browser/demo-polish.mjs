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

  const githubButton = await page.evaluate(() => {
    const button = document.querySelector('.hero-github');
    const icon = button.querySelector('.ph-github-logo');
    return { gap: getComputedStyle(button).gap, iconSize: getComputedStyle(icon).fontSize };
  });
  assert.deepEqual(githubButton, { gap: '0px', iconSize: '16px' }, 'hero GitHub button must use its dedicated icon spacing');

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
    await new Promise((resolve) => setTimeout(resolve, 140));
    const style = getComputedStyle(header);
    const during = {
      opacity: Number(style.opacity),
      transform: style.transform,
      height: header.getBoundingClientRect().height,
      width: header.getBoundingClientRect().width,
      beforeWidth,
      bodyTransform: getComputedStyle(document.body).transform
    };
    window.Kineto.destroyModule(document.body, 'pageReveal');
    return during;
  });
  assert.ok(zoomHeader.opacity > 0.99 && zoomHeader.height > 0, `Page Reveal zoom must keep the persistent header visible (${JSON.stringify(zoomHeader)})`);
  assert.notEqual(zoomHeader.bodyTransform, 'none', `the real Zoom button must animate the whole demo page (${JSON.stringify(zoomHeader)})`);
  assert.ok(zoomHeader.width < zoomHeader.beforeWidth, `the persistent header must zoom with the page instead of staying fixed (${JSON.stringify(zoomHeader)})`);
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
  console.log('Demo polish browser QA OK',JSON.stringify({cover,initialSegmentIndicator,megaTabs,mobileMega,mobilePageEffects,mobileCompounds,drawerBefore,resize}));
} finally {
  await browser.close();
}
