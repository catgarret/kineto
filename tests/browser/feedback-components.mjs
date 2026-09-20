import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { labeller, snapshotAttributes } from '../../src/utils.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const chromePath = process.env.KT_CHROME || undefined;
const css = await readFile(path.join(root, 'src', 'kineto.css'), 'utf8');
// 모듈 소스를 그대로 페이지에 넣고 돌립니다. import 줄은 정확한 문자열이 아니라 패턴으로
// 지우세요 — 예전에는 한 줄을 글자 그대로 지우고 있어서, 모듈이 헬퍼를 하나 더 가져오는
// 순간 지우지 못한 `import` 가 남아 페이지가 통째로 죽었습니다(원인이 안 보이는 타임아웃).
const withoutImports = (source) => source.replace(/^import[^;]*from '[^']*';\s*$/gm, '');
// 헬퍼는 흉내 내지 않고 **진짜 구현**을 넣습니다. 검사 대상이 이 동작이기 때문입니다.
// 모듈이 utils 에서 새 헬퍼를 가져오면 여기에도 더해야 합니다 — 빠뜨리면 페이지에서
// 그 이름이 정의되지 않아 스크립트가 죽고, 원인이 보이지 않는 타임아웃으로 나타납니다.
const stub = "const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));const env=()=>({reducedMotion:false});"
  + `const labeller = ${labeller.toString()};`
  + `const snapshotAttributes = ${snapshotAttributes.toString()};`;

// 모듈이 utils 에서 가져오는 이름이 stub 에 다 있는지 **먼저** 확인합니다.
// 빠진 이름이 있으면 페이지 안에서 그 식별자가 정의되지 않아 스크립트가 통째로 죽고,
// 겉으로는 `waitForFunction` 타임아웃으로만 보입니다 — 실제로 두 번 그렇게 시간을
// 버렸습니다. 여기서 이름을 대며 즉시 실패하면 고칠 곳이 바로 보입니다.
const rawBottom = await readFile(path.join(root, 'src', 'modules', 'bottomSheet.js'), 'utf8');
const rawToast = await readFile(path.join(root, 'src', 'modules', 'toast.js'), 'utf8');
for (const source of [rawBottom, rawToast]) {
  for (const match of source.matchAll(/import \{([^}]*)\} from '\.\.\/utils\.js';/g)) {
    for (const name of match[1].split(',').map((part) => part.trim()).filter(Boolean)) {
      assert.match(stub, new RegExp(`\\b(?:const|function)\\s+${name}\\b`),
        `this suite hand-stubs the utils helpers: add \`${name}\` to the stub above (import the real one from src/utils.js when it is self-contained)`);
    }
  }
}

const bottomSource = withoutImports(rawBottom).replace('export default {', 'window.__bottomSheetModule = {');
const toastSource = withoutImports(rawToast).replace('export default {', 'window.__toastModule = {');

const browser = await chromium.launch({ headless:true, ...(chromePath ? { executablePath:chromePath } : {}), args:['--no-sandbox','--disable-setuid-sandbox','--disable-gpu'] });
const page = await browser.newPage({ viewport:{ width:1000, height:800 } });
try {
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;font-family:system-ui;background:#f4f4f4}.kt-sheet{position:fixed;left:50%;bottom:0;transform:translateX(-50%);width:520px;height:300px;background:white;border-radius:20px 20px 0 0}.kt-sheet__header{height:64px;display:flex;align-items:center;padding:0 24px}.kt-toast-region{position:fixed;right:24px;bottom:24px}.kt-toast{background:white;color:#111;border:1px solid #ddd}
  </style></head><body>
  <section id="sheet"><header class="kt-sheet__header" data-kt-sheet-header><h2>Settings</h2></header><div>Body text remains selectable.</div></section>
  <button id="toastTrigger">Toast</button>
  </body></html>`, { waitUntil:'load' });
  await page.addStyleTag({ content:css });
  await page.addScriptTag({ type:'module', content:`${stub}\n${bottomSource}\n${toastSource}\nwindow.sheetEvents=[];const sheet=document.getElementById('sheet');sheet.addEventListener('kt-sheet-resize',(event)=>window.sheetEvents.push(event.detail));window.sheetApi=window.__bottomSheetModule.create(sheet,{backdrop:false,resizable:true,resizeArea:'header',minHeight:180,maxHeight:700,duration:.05});window.sheetApi.open();window.toastApi=window.__toastModule.create(document.getElementById('toastTrigger'),{message:'Saved',duration:1000,progressBar:'ring',dismissible:false});window.qaReady=true;` });
  await page.waitForFunction(() => window.qaReady === true);

  const sheetResult = await page.evaluate(() => {
    const sheet=document.getElementById('sheet');
    const handle=sheet.querySelector('.kt-sheet__handle');
    const header=sheet.querySelector('[data-kt-sheet-header]');
    const drag=(surface,fromY,toY,id)=>{
      surface.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:id,pointerType:'mouse',button:0,clientY:fromY}));
      surface.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerId:id,pointerType:'mouse',buttons:1,clientY:toY}));
      surface.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:id,pointerType:'mouse',button:0,clientY:toY}));
    };
    const initial=sheet.getBoundingClientRect().height;
    drag(handle,300,250,11);
    const afterHandle=sheet.getBoundingClientRect().height;
    drag(header,300,260,12);
    const afterHeader=sheet.getBoundingClientRect().height;
    return {initial,afterHandle,afterHeader,events:window.sheetEvents,handleCursor:getComputedStyle(handle).cursor,headerCursor:getComputedStyle(header).cursor};
  });
  assert.ok(sheetResult.initial>=300);
  assert.equal(sheetResult.afterHandle,sheetResult.initial+50,'visible top handle must resize the sheet');
  assert.equal(sheetResult.afterHeader,sheetResult.afterHandle+40,'authored header must also resize the sheet');
  assert.deepEqual(sheetResult.events.map((event)=>event.source),['handle','header']);
  assert.equal(sheetResult.handleCursor,'ns-resize');
  assert.equal(sheetResult.headerCursor,'ns-resize');

  // 그립 툴팁은 라이브러리가 문구를 정하지 않습니다. 예전에는 한국어 한 줄이 박혀 있어서,
  // resizable 을 켠 모든 사이트가 방문자 언어와 무관하게 한국어 툴팁을 보여 줬습니다.
  const labels = await page.evaluate(() => {
    const mount=(options)=>{
      const node=document.createElement('section');
      node.innerHTML='<div>body</div>';
      document.body.appendChild(node);
      window.__bottomSheetModule.create(node,{backdrop:false,resizable:true,duration:.05,...options});
      return node.querySelector('.kt-sheet__handle').title;
    };
    return {
      fallback:document.getElementById('sheet').querySelector('.kt-sheet__handle').title,
      authored:mount({resizeLabel:'Ziehen zum Anpassen'}),
      silent:mount({resizeLabel:''})
    };
  });
  assert.equal(labels.fallback,'Drag to resize · Double-click to reset','the default grip tooltip must be the documented English one, not any one page\'s language');
  assert.equal(labels.authored,'Ziehen zum Anpassen','resizeLabel must decide the grip tooltip');
  assert.equal(labels.silent,'','an empty resizeLabel must leave the grip without a tooltip');

  await page.evaluate(() => window.toastApi.show());
  await page.waitForSelector('.kt-toast__ring-fill');
  await page.waitForTimeout(1060);
  const toastDuringExit = await page.evaluate(() => {
    const toast=document.querySelector('.kt-toast');
    const fill=document.querySelector('.kt-toast__ring-fill');
    return {exists:Boolean(toast),dash:fill ? Number.parseFloat(getComputedStyle(fill).strokeDashoffset) : null};
  });
  assert.equal(toastDuringExit.exists,true,'toast should still be fading during the exit interval');
  assert.ok(toastDuringExit.dash>50,`depleted ring must stay depleted during exit (dash ${toastDuringExit.dash})`);
  await page.waitForTimeout(220);
  assert.equal(await page.locator('.kt-toast').count(),0,'toast should be removed after its exit');

  console.log('Feedback component browser QA OK', JSON.stringify({sheetResult,toastDuringExit}));
} finally {
  await browser.close();
}
