import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const chromePath = process.env.KT_CHROME || undefined;
const css = await readFile(path.join(root, 'src', 'kineto.css'), 'utf8');
const stub = "const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));const env=()=>({reducedMotion:false});";
const bottomSource = (await readFile(path.join(root, 'src', 'modules', 'bottomSheet.js'), 'utf8'))
  .replace("import { clamp, env } from '../utils.js';", '')
  .replace('export default {', 'window.__bottomSheetModule = {');
const toastSource = (await readFile(path.join(root, 'src', 'modules', 'toast.js'), 'utf8'))
  .replace("import { clamp, env } from '../utils.js';", '')
  .replace('export default {', 'window.__toastModule = {');

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
