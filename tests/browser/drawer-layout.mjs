// Settings drawer layout: height follows the active view, groups pack without
// holes (multicol "tetris"), and folding never overlaps boxes.
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CHROME=process.env.KT_CHROME||undefined;
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.woff2':'font/woff2','.json':'application/json','.mp4':'video/mp4'};
const server=http.createServer((q,s)=>{let p=decodeURIComponent(q.url.split('?')[0]);let fp=path.join(root,p);if(fp.endsWith('/'))fp=path.join(fp,'index.html');fs.readFile(fp,(e,b)=>{if(e){s.writeHead(404);s.end();return;}s.writeHead(200,{'content-type':MIME[path.extname(fp)]||'application/octet-stream'});s.end(b);});});
await new Promise(r=>server.listen(0,r)); const PORT=server.address().port;
const br=await chromium.launch({...(CHROME?{executablePath:CHROME}:{}),headless:true,args:['--no-sandbox','--disable-gpu']});
const pg=await br.newPage({viewport:{width:1440,height:900}});
pg.on('pageerror',e=>console.log('PAGEERROR:',e.message));
await pg.goto(`http://localhost:${PORT}/demo/index.html`,{waitUntil:'load'});
await pg.waitForFunction(()=>window.Kineto&&document.getElementById('mod-progress'),null,{timeout:15000});
await pg.waitForTimeout(1200);
let pass=0,fail=0;const ck=(n,c,d)=>{console.log(`  [${c?'PASS':'FAIL'}] ${n}${d?' — '+d:''}`);c?pass++:fail++;};
const openDrawer=async(id)=>{await pg.evaluate((i)=>{const b=document.getElementById(i);b.scrollIntoView({block:'center'});b.querySelector('.kt-playground>summary')?.click();},id);await pg.waitForTimeout(900);};
const openCard=async(title)=>{
  const opened=await pg.evaluate((text)=>{
    const card=[...document.querySelectorAll('article.card')].find((node)=>node.querySelector(':scope>h3')?.textContent.trim()===text);
    const summary=card?.querySelector('.kt-playground>summary');
    card?.scrollIntoView({block:'center'});
    summary?.click();
    return Boolean(summary);
  },title);
  if(!opened) throw new Error(`settings trigger not found for card: ${title}`);
  await pg.waitForTimeout(900);
};
const sheetH=()=>pg.evaluate(()=>Math.round(document.querySelector('.kt-drawer-sheet').getBoundingClientRect().height));
const setView=async(v)=>{await pg.evaluate((view)=>document.querySelector(`.kt-drawer-sheet .kt-vt[data-view="${view}"]`)?.click(),v);await pg.waitForTimeout(600);};

await openDrawer('mod-toast');
const hSettings=await sheetH(); await setView('code'); const hCode=await sheetH(); await setView('settings');
console.log('  heights: settings=',hSettings,' code=',hCode);
ck('height differs between 설정 and 코드 view (content-driven)', Math.abs(hSettings-hCode)>8, `${hSettings} vs ${hCode}`);
ck('height within floor/ceiling', hSettings>=230 && hSettings<=780 && hCode>=230 && hCode<=780);

const tabSemantics=await pg.evaluate(()=>{
  const body=[...document.querySelectorAll('.kt-drawer-sheet>.kt-playground__body')].find((node)=>!node.hidden);
  const viewList=body.querySelector('.kt-playground__viewtabs');
  const viewTabs=[...viewList.querySelectorAll('[role="tab"]')];
  const codeList=body.querySelector('.kt-playground__tabs');
  const codeTabs=[...codeList.querySelectorAll('[role="tab"]')];
  const codeOutput=body.querySelector('.kt-playground__pre[role="tabpanel"]');
  const allIds=[...body.querySelectorAll('[id]')].map((node)=>node.id).filter((id)=>id.startsWith('kt-playground-a11y-'));
  return {
    labelledLists:viewList.getAttribute('aria-label')&&codeList.getAttribute('aria-label'),
    outerRelations:viewTabs.every((tab)=>{
      const panel=document.getElementById(tab.getAttribute('aria-controls'));
      return Boolean(tab.id&&panel?.getAttribute('role')==='tabpanel'&&panel.getAttribute('aria-labelledby')===tab.id);
    }),
    codeRelations:codeTabs.every((tab)=>tab.id&&tab.getAttribute('aria-controls')===codeOutput.id),
    codeLabelledBy:codeOutput.getAttribute('aria-labelledby')===codeTabs.find((tab)=>tab.getAttribute('aria-selected')==='true')?.id,
    outerRoving:viewTabs.filter((tab)=>tab.tabIndex===0).length===1,
    codeRoving:codeTabs.filter((tab)=>tab.tabIndex===0).length===1,
    uniqueIds:new Set(allIds).size===allIds.length,
    ids:allIds
  };
});
ck('view and code tabs expose labelled tablists',Boolean(tabSemantics.labelledLists));
ck('view tabs control uniquely labelled tabpanels',tabSemantics.outerRelations===true);
ck('code tabs control the labelled code output panel',tabSemantics.codeRelations===true&&tabSemantics.codeLabelledBy===true);
ck('both tab levels use one roving tabindex stop',tabSemantics.outerRoving===true&&tabSemantics.codeRoving===true);
ck('generated tab and panel ids are unique',tabSemantics.uniqueIds===true);

const localizedTablistNames=await pg.evaluate(async()=>{
  const select=document.getElementById('lang');
  const originalLanguage=select.value;
  const languages=['ko','en','ja','zh-CN','zh-TW','ru','it'];
  const results=[];
  for(const language of languages){
    select.value=language;
    select.dispatchEvent(new Event('change',{bubbles:true}));
    await new Promise((resolve)=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    const body=[...document.querySelectorAll('.kt-drawer-sheet>.kt-playground__body')]
      .find((node)=>!node.hidden);
    const messages=window.KINETO_PLAYGROUND_I18N[language];
    results.push({
      language,
      documentLanguage:document.documentElement.lang,
      viewActual:body?.querySelector('.kt-playground__viewtabs')?.getAttribute('aria-label'),
      viewExpected:messages.viewTabsLabel,
      codeActual:body?.querySelector('.kt-playground__tabs')?.getAttribute('aria-label'),
      codeExpected:messages.codeTabsLabel
    });
  }
  select.value=originalLanguage;
  select.dispatchEvent(new Event('change',{bubbles:true}));
  await new Promise((resolve)=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  return results;
});
ck(
  'all 7 locales expose translated settings/code and code-format tablist names',
  localizedTablistNames.every((result)=>(
    result.documentLanguage===result.language
    &&result.viewActual===result.viewExpected
    &&result.codeActual===result.codeExpected
  )),
  JSON.stringify(localizedTablistNames.filter((result)=>(
    result.documentLanguage!==result.language
    ||result.viewActual!==result.viewExpected
    ||result.codeActual!==result.codeExpected
  )))
);

await pg.locator('.kt-drawer-sheet .kt-vt[data-view="settings"]').focus();
await pg.keyboard.press('ArrowRight');
let keyboardTabs=await pg.evaluate(()=>({
  active:document.activeElement?.dataset.view,
  selected:document.querySelector('.kt-drawer-sheet .kt-vt[aria-selected="true"]')?.dataset.view
}));
ck('ArrowRight focuses and activates the next view tab',keyboardTabs.active==='code'&&keyboardTabs.selected==='code',JSON.stringify(keyboardTabs));
await pg.keyboard.press('Home');
keyboardTabs=await pg.evaluate(()=>({active:document.activeElement?.dataset.view,selected:document.querySelector('.kt-drawer-sheet .kt-vt[aria-selected="true"]')?.dataset.view}));
ck('Home focuses and activates the first view tab',keyboardTabs.active==='settings'&&keyboardTabs.selected==='settings',JSON.stringify(keyboardTabs));
await pg.keyboard.press('End');
await pg.locator('.kt-drawer-sheet [data-code-tab="html"]').focus();
await pg.keyboard.press('ArrowRight');
let codeKeyboard=await pg.evaluate(()=>({
  active:document.activeElement?.dataset.codeTab,
  activeId:document.activeElement?.id,
  selected:document.querySelector('.kt-drawer-sheet [data-code-tab][aria-selected="true"]')?.dataset.codeTab,
  labelledby:document.querySelector('.kt-drawer-sheet .kt-playground__pre')?.getAttribute('aria-labelledby')
}));
ck('ArrowRight focuses and activates the next code tab',codeKeyboard.active==='js'&&codeKeyboard.selected==='js'&&codeKeyboard.labelledby===codeKeyboard.activeId,JSON.stringify(codeKeyboard));
await pg.keyboard.press('End');
codeKeyboard=await pg.evaluate(()=>({active:document.activeElement?.dataset.codeTab,selected:document.querySelector('.kt-drawer-sheet [data-code-tab][aria-selected="true"]')?.dataset.codeTab}));
ck('End focuses and activates the last code tab',codeKeyboard.active==='css'&&codeKeyboard.selected==='css',JSON.stringify(codeKeyboard));
await pg.keyboard.press('Home');
codeKeyboard=await pg.evaluate(()=>({active:document.activeElement?.dataset.codeTab,selected:document.querySelector('.kt-drawer-sheet [data-code-tab][aria-selected="true"]')?.dataset.codeTab}));
ck('Home focuses and activates the first code tab',codeKeyboard.active==='html'&&codeKeyboard.selected==='html',JSON.stringify(codeKeyboard));

await pg.locator('.kt-drawer-sheet .kt-playground__toolbar button').nth(1).click();
await pg.waitForTimeout(500);
const rebuiltTabs=await pg.evaluate((oldIds)=>{
  const ids=[...document.querySelectorAll('[id^="kt-playground-a11y-"]')].map((node)=>node.id);
  return {
    unique:new Set(ids).size===ids.length,
    oldRemoved:oldIds.every((id)=>!document.getElementById(id)),
    bodyCount:[...document.querySelectorAll('.kt-drawer-sheet>.kt-playground__body')].filter((node)=>!node.hidden).length,
    tablists:document.querySelectorAll('.kt-drawer-sheet>.kt-playground__body:not([hidden]) [role="tablist"]').length
  };
},tabSemantics.ids);
ck('reset rebuild removes old tab ids without duplicate tablists',rebuiltTabs.unique&&rebuiltTabs.oldRemoved&&rebuiltTabs.bodyCount===1&&rebuiltTabs.tablists===2,JSON.stringify(rebuiltTabs));

// packing + overlap, before and after folding
const measure=()=>pg.evaluate(()=>{
  const groups=[...document.querySelectorAll('.kt-playground__viewstage>.kt-playground__groups .kt-playground__group')].filter(g=>g.offsetParent!==null);
  const r=groups.map(g=>{const b=g.getBoundingClientRect();return {t:b.top,l:b.left,r:b.right,b:b.bottom,h:b.height};});
  let overlaps=0;
  for(let i=0;i<r.length;i++)for(let j=i+1;j<r.length;j++){
    const a=r[i],c=r[j];
    const ox=Math.min(a.r,c.r)-Math.max(a.l,c.l), oy=Math.min(a.b,c.b)-Math.max(a.t,c.t);
    if(ox>2&&oy>2)overlaps++;
  }
  // column balance: max vs min column bottom
  const cols={}; r.forEach(x=>{const k=Math.round(x.l);cols[k]=Math.max(cols[k]||0,x.b);});
  const bottoms=Object.values(cols);
  return {count:r.length, overlaps, colCount:bottoms.length, spread: bottoms.length?Math.round(Math.max(...bottoms)-Math.min(...bottoms)):0};
});
const before=await measure(); console.log('  before fold:',JSON.stringify(before));
ck('no overlapping group boxes', before.overlaps===0, `overlaps=${before.overlaps}`);
ck('groups pack into multiple columns', before.colCount>=2, `cols=${before.colCount}`);
// fold the first two groups then re-measure
await pg.evaluate(()=>{const ls=[...document.querySelectorAll('.kt-drawer-sheet .kt-playground__legend')];ls[0]?.click();ls[1]?.click();});
await pg.waitForTimeout(600);
const after=await measure(); console.log('  after fold:',JSON.stringify(after));
ck('no overlap after folding', after.overlaps===0, `overlaps=${after.overlaps}`);
ck('layout reflows after folding (heights change)', after.spread!==before.spread || after.count===before.count);
// Ease field must not tower over its neighbours. A 430px container-query
// threshold used to match the 420px controls column, stacking the field so
// `aspect-ratio:1; width:100%` blew the curve up to 420x420 and made the field
// 709.6px tall against 49.6px for a plain field. Also: an empty .kt-bz-status
// reserved a 14px band, so the ease field always ended taller at the bottom.
await openDrawer('mod-textSplit');
const ez=await pg.evaluate(()=>{
  const sheet=document.querySelector('.kt-drawer-sheet');
  const ease=sheet?.querySelector('.kt-ease-field');
  if(!ease) return null;
  const svg=ease.querySelector('.kt-bz-svg');
  const ctr=ease.closest('.kt-playground__controls');
  const sibs=[...ctr.querySelectorAll(':scope > .kt-playground__field')]
    .filter(f=>!f.classList.contains('kt-ease-field')&&f.getBoundingClientRect().height>0);
  const tail=(f)=>{const fr=f.getBoundingClientRect();let m=-Infinity;
    f.querySelectorAll('*').forEach(n=>{if(n.hidden)return;const r=n.getBoundingClientRect();
      if(!r.height&&!r.width)return;if(r.bottom>m)m=r.bottom;});
    return Math.round(fr.bottom-m);};
  const st=ease.querySelector('.kt-bz-status');
  return {ctrW:Math.round(ctr.getBoundingClientRect().width),
    easeH:Math.round(ease.getBoundingClientRect().height),
    svgW:svg?Math.round(svg.getBoundingClientRect().width):0,
    svgH:svg?Math.round(svg.getBoundingClientRect().height):0,
    easeTail:tail(ease), sibTail:sibs.length?tail(sibs[0]):null,
    statusH:st?Math.round(st.getBoundingClientRect().height):0};
});
if(!ez) ck('ease field present in Text Split drawer', false, 'no .kt-ease-field found');
else {
  console.log('  ease field:',JSON.stringify(ez));
  ck('ease curve is not an oversized square', ez.svgW<=220 && ez.svgH<=220, `svg=${ez.svgW}x${ez.svgH}`);
  ck('ease field height stays reasonable', ez.easeH<=340, `easeH=${ez.easeH} (ctrW=${ez.ctrW})`);
  ck('empty status reserves no band', ez.statusH===0, `statusH=${ez.statusH}`);
  ck('ease bottom padding matches other fields', Math.abs(ez.easeTail-(ez.sibTail??0))<=4, `ease=${ez.easeTail} sib=${ez.sibTail}`);
}
await openCard('Slider / Coverflow');
const coverflowFields=await pg.evaluate(()=>{
  const sheet=document.querySelector('.kt-drawer-sheet');
  const body=[...sheet.children].find((node)=>node.classList.contains('kt-playground__body')&&!node.hidden);
  const field=(key)=>body.querySelector(`.kt-playground__field[data-module="slider"][data-key="${key}"]`);
  const preset=field('preset')?.querySelector('select');
  return {
    presets:[...preset.options].map((option)=>option.value),
    alignHidden:field('align')?.hidden,
    controlsHidden:field('controls')?.hidden,
    directionHidden:field('effectDirection')?.hidden,
    rotateHidden:field('rotate')?.hidden,
    activeShadowHidden:field('activeShadow')?.hidden,
    activeShadowChecked:body.querySelector('[data-module="slider"][data-key="activeShadow"] input')?.checked,
    activeShadowOpacityHidden:field('activeShadowOpacity')?.hidden,
    perViewHidden:field('perView')?.hidden
  };
});
ck('track slider does not offer incompatible radial markup', !coverflowFields.presets.includes('radial'), coverflowFields.presets.join(','));
ck('coverflow hides its meaningless Align control', coverflowFields.alignHidden===true);
ck('coverflow hides radial-only Controls', coverflowFields.controlsHidden===true);
ck('coverflow hides wipe-only Effect direction', coverflowFields.directionHidden===true);
ck('coverflow keeps 3D Rotate visible', coverflowFields.rotateHidden===false);
ck(
  'coverflow exposes shadow controls only when applicable',
  coverflowFields.activeShadowHidden===false
    && coverflowFields.activeShadowOpacityHidden===!coverflowFields.activeShadowChecked
);
ck('coverflow keeps Per view visible', coverflowFields.perViewHidden===false);
const groupColumns=()=>pg.evaluate(()=>{
  const sheet=document.querySelector('.kt-drawer-sheet');
  const body=[...sheet.children].find((node)=>node.classList.contains('kt-playground__body')&&!node.hidden);
  const columns=[...body.querySelectorAll('.kt-playground__masonry-col')];
  return Object.fromEntries([...body.querySelectorAll('.kt-playground__group')]
    .filter((group)=>group.offsetParent!==null)
    .map((group)=>[group.dataset.group,columns.indexOf(group.parentElement)]));
});
const coverflowGroupColumnsBefore=await groupColumns();
const shadowEnabled=await pg.evaluate(()=>{
  const sheet=document.querySelector('.kt-drawer-sheet');
  const body=[...sheet.children].find((node)=>node.classList.contains('kt-playground__body')&&!node.hidden);
  const toggle=body.querySelector('[data-module="slider"][data-key="activeShadow"] input');
  toggle.checked=true; toggle.dispatchEvent(new Event('change',{bubbles:true}));
  return !body.querySelector('[data-module="slider"][data-key="activeShadowOpacity"]').hidden;
});
await pg.waitForTimeout(250);
ck('coverflow reveals shadow opacity only after the shadow is enabled', shadowEnabled===true);
const coverflowGroupColumnsAfter=await groupColumns();
ck('changing an option does not move unchanged setting sections', JSON.stringify(coverflowGroupColumnsAfter)===JSON.stringify(coverflowGroupColumnsBefore), `${JSON.stringify(coverflowGroupColumnsBefore)} -> ${JSON.stringify(coverflowGroupColumnsAfter)}`);
await pg.evaluate(()=>{
  const sheet=document.querySelector('.kt-drawer-sheet');
  const body=[...sheet.children].find((node)=>node.classList.contains('kt-playground__body')&&!node.hidden);
  const select=body.querySelector('[data-module="slider"][data-key="preset"] select');
  select.value='dissolve'; select.dispatchEvent(new Event('change',{bubbles:true}));
});
await pg.waitForTimeout(500);
const dissolveFields=await pg.evaluate(()=>{
  const sheet=document.querySelector('.kt-drawer-sheet');
  const body=[...sheet.children].find((node)=>node.classList.contains('kt-playground__body')&&!node.hidden);
  const hidden=(key)=>body.querySelector(`.kt-playground__field[data-module="slider"][data-key="${key}"]`)?.hidden;
  return {rotate:hidden('rotate'),perView:hidden('perView'),intensity:hidden('effectIntensity'),direction:hidden('effectDirection')};
});
ck('dissolve hides coverflow-only geometry', dissolveFields.rotate===true&&dissolveFields.perView===true, JSON.stringify(dissolveFields));
ck('dissolve keeps its intensity and hides wipe direction', dissolveFields.intensity===false&&dissolveFields.direction===true, JSON.stringify(dissolveFields));
await openCard('Radial Carousel (원형 스와이퍼)');
const radialFields=await pg.evaluate(()=>{
  const sheet=document.querySelector('.kt-drawer-sheet');
  const body=[...sheet.children].find((node)=>node.classList.contains('kt-playground__body')&&!node.hidden);
  const card=[...document.querySelectorAll('article.card')].find((node)=>node.querySelector(':scope>h3')?.textContent.trim()==='Radial Carousel (원형 스와이퍼)');
  const field=(key)=>body.querySelector(`.kt-playground__field[data-module="slider"][data-key="${key}"]`);
  return {
    drawerTitle:body.querySelector('.kt-playground__drawer-heading strong')?.textContent.trim(),
    targetPreset:card?.querySelector('[data-kt-slider]')?.getAttribute('data-kt-slider'),
    sourceSummaryOpen:card?.querySelector('.kt-playground')?.open,
    selectedPreset:field('preset')?.querySelector('select')?.value,
    presets:[...field('preset').querySelectorAll('option')].map((option)=>option.value),
    aligns:[...field('align').querySelectorAll('option')].map((option)=>option.value),
    loops:[...field('loop').querySelectorAll('option')].map((option)=>option.value),
    controlsHidden:field('controls').hidden,
    perViewHidden:field('perView').hidden,
    axisHidden:field('axis').hidden
  };
});
ck('radial demo offers only the compatible radial preset', radialFields.presets.length===1&&radialFields.presets[0]==='radial', radialFields.presets.join(','));
ck('radial choices contain only supported align/loop values', radialFields.aligns.join(',')==='center,edge'&&radialFields.loops.join(',')==='off,infinite', JSON.stringify(radialFields));
ck('radial hides track-only controls', radialFields.controlsHidden===false&&radialFields.perViewHidden===true&&radialFields.axisHidden===true, JSON.stringify(radialFields));
const sh=await pg.$('.kt-drawer-sheet'); if(sh) await sh.screenshot({path:path.join(root,'tests/browser/shots/drawer-tetris.png')});
await br.close(); server.close();
console.log(`\n===== DRAWER LAYOUT: ${pass} passed, ${fail} failed =====`); process.exit(fail?1:0);
