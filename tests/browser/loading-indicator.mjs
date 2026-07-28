import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const chromePath = process.env.KT_CHROME || undefined;
const html = String.raw`<!doctype html>
<html lang="ko" class="light" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<style>
:root{--bg:#f5f6f8;--panel:#fff;--panel2:#f0f2f5;--line:#d9dde5;--text:#17191f;--muted:#707784;--accent:#ff5b1c;--font-sans:system-ui,sans-serif;--font-mono:ui-monospace,monospace}
body{margin:0;padding:32px;background:var(--bg);color:var(--text);font-family:var(--font-sans)}
#loading{max-width:980px;margin:auto}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.card{padding:18px;background:var(--panel);border:1px solid var(--line);border-radius:16px}.card h3{margin:0 0 6px}.card p{margin:0 0 14px;color:var(--muted)}
@media(max-width:700px){.grid{grid-template-columns:1fr}}
</style></head><body><section id="loading"><div class="grid">
<article class="card"><h3>Dual</h3><p>equal rings</p><div class="demo-stage loader-preview"><span id="dual"></span></div></article>
<article class="card"><h3>Spokes</h3><p>radial fade</p><div class="demo-stage loader-preview"><span id="spokes"></span></div></article>
<article class="card"><h3>Orbit</h3><p>track + arc</p><div class="demo-stage loader-preview"><span id="orbit"></span></div></article>
<article class="card"><h3>Glow bar</h3><p>centered</p><div class="demo-stage loader-preview"><span class="loading-preview-stack"><span>파일 준비</span><span id="bar"></span></span></div></article>
<article class="card"><h3>Shimmer</h3><p>light mode</p><div class="demo-stage loader-preview"><span id="shimmer"></span></div></article>
<article class="card"><h3>Meter</h3><p>scan motion</p><div class="demo-stage loader-preview"><span id="meter"></span></div></article>
<article class="card loading-frame-card"><h3>Frames</h3><p>ASCII and Unicode</p><div class="demo-stage loader-preview"><div class="loading-frame-grid" id="frames"></div></div></article>
</div></section>
<script type="module">
import loadingIndicator from '../../src/modules/loadingIndicator.js';
const create=(id,opts)=>loadingIndicator.create(document.getElementById(id),opts);
window.qa={
 dual:create('dual',{type:'spinner',spinnerStyle:'dual',size:48,highlightColor:'#6d8cff',transformOrigin:'25% 75%'}),
 spokes:create('spokes',{type:'spinner',spinnerStyle:'spokes',size:48,dotCount:12,direction:'reverse',transformOrigin:'50% 100%'}),
 orbit:create('orbit',{type:'spinner',spinnerStyle:'orbit',size:48,color:'#6d8cff'}),
 bar:create('bar',{type:'bar',indeterminate:true,barWidth:240,glow:true,glowColor:'#ff8a5c',glowSize:20,motionDuration:1}),
 shimmer:create('shimmer',{type:'shimmer',text:'응답을 준비하는 중',highlightColor:'#ff5b1c',motionDuration:1.2}),
 meter:create('meter',{type:'terminal',terminalStyle:'meter',progress:64,motionDuration:.9,direction:'reverse'})
};
window.frameInstances={};
const presets=['ascii','pulse','quadrant','braille','braille-dot','arrow','line','circle','corners','squares','boxes'];
for(const preset of presets){const item=document.createElement('span');item.className='loading-frame-item';item.innerHTML='<b>'+preset+'</b><span></span>';document.getElementById('frames').append(item);window.frameInstances[preset]=loadingIndicator.create(item.lastElementChild,{type:'terminal',terminalStyle:preset,frameInterval:72,direction:preset==='ascii'?'reverse':'normal'});}
window.qaReady=true;
</script></body></html>`;

const sourceCss = await readFile(path.join(root, 'src', 'kineto.css'), 'utf8');
const demoCss = await readFile(path.join(root, 'demo', 'styles.css'), 'utf8');
const moduleSource = (await readFile(path.join(root, 'src', 'modules', 'loadingIndicator.js'), 'utf8'))
  .replace("import { clamp } from '../utils.js';", 'const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));')
  .replace('export default {', 'window.__loadingIndicatorModule = {');
const moduleMatch = html.match(/<script type="module">([\s\S]*?)<\/script>/);
const initSource = moduleMatch[1].replace("import loadingIndicator from '../../src/modules/loadingIndicator.js';", 'const loadingIndicator=window.__loadingIndicatorModule;');
const pageHtml = html.replace(/<script type="module">[\s\S]*?<\/script>/, '');
const browser = await chromium.launch({ headless:true, ...(chromePath ? { executablePath:chromePath } : {}), args:['--no-sandbox','--disable-setuid-sandbox','--disable-gpu'] });
const page = await browser.newPage({ viewport:{ width:1280, height:1100 }, deviceScaleFactor:1 });
try {
  await page.setContent(pageHtml, { waitUntil:'load' });
  await page.addStyleTag({ content:sourceCss });
  await page.addStyleTag({ content:demoCss });
  await page.addScriptTag({ type:'module', content:`${moduleSource}\n${initSource}` });
  await page.waitForFunction(() => window.qaReady === true);
  const result = await page.evaluate(async () => {
    const rect = (el) => { const r=el.getBoundingClientRect(); return {x:r.x,y:r.y,left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height,cx:r.x+r.width/2,cy:r.y+r.height/2}; };
    const css = (el, pseudo) => getComputedStyle(el, pseudo);
    const frame = () => new Promise(requestAnimationFrame);
    const dualHost=document.getElementById('dual');
    const dualRings=[...document.querySelectorAll('#dual .kt-loading-spinner__ring')];
    const dualRects=dualRings.map(rect);
    const spokeHost=document.getElementById('spokes');
    const spokeEls=[...document.querySelectorAll('#spokes .kt-loading-spinner__spoke')];
    const spokeTransforms=spokeEls.map((el)=>css(el).transform);
    const orbit=document.querySelector('#orbit .kt-loading-spinner__orbit');
    const particle=document.querySelector('#orbit .kt-loading-spinner__orbit-particle');
    const progress=document.querySelector('#bar .kt-loading-bar__progress');
    const track=document.querySelector('#bar .kt-loading-bar__track');
    const barAnimation=progress.getAnimations()[0];
    barAnimation.pause();
    const duration=Number(barAnimation.effect.getTiming().duration);
    const barSamples=[];
    for(const ratio of [.001,.25,.5,.75,.999]){
      barAnimation.currentTime=duration*ratio;
      await frame();
      const r=rect(progress), t=rect(track);
      barSamples.push({ratio,left:r.left,right:r.right,cx:r.cx,trackLeft:t.left,trackRight:t.right,trackCx:t.cx});
    }
    const shimmer=document.querySelector('#shimmer .kt-loading-shimmer__text');
    const shimmerPseudo=css(shimmer,'::after');
    const shimmerRule=[...document.styleSheets].flatMap((sheet)=>{try{return [...sheet.cssRules]}catch{return []}}).find((rule)=>rule.name==='kt-loading-shimmer');
    const cells=[...document.querySelectorAll('#meter .kt-loading-terminal__cell.is-filled')];
    const meterAnimation=cells[0].getAnimations()[0];
    meterAnimation.pause();
    const meterDuration=Number(meterAnimation.effect.getTiming().duration);
    const meterSamples=[];
    for(const ratio of [0,.18,.36,.5,.64,.82]){meterAnimation.currentTime=meterDuration*ratio;await frame();meterSamples.push(Number(css(cells[0]).opacity));}
    const meterLow=Math.min(...meterSamples), meterHigh=Math.max(...meterSamples);
    const terminalFrame=document.querySelector('.loading-frame-item .kt-loading-terminal__frame');
    window.frameInstances.ascii.pause();
    const firstFrame=terminalFrame.textContent;
    window.frameInstances.ascii.resume();
    await new Promise((resolve)=>setTimeout(resolve,90));
    window.frameInstances.ascii.pause();
    const secondFrame=terminalFrame.textContent;
    const stages=[...document.querySelectorAll('.loader-preview')].map((stage)=>{const child=stage.firstElementChild;const a=rect(stage),b=rect(child);return {shadow:css(stage).boxShadow,dy:Math.abs(a.cy-b.cy),height:a.height,paddingTop:css(stage).paddingTop,paddingBottom:css(stage).paddingBottom};});
    const defaultTargets=['#dual .kt-loading','#spokes .kt-loading','#orbit .kt-loading','#shimmer .kt-loading','#meter .kt-loading'].map((selector)=>document.querySelector(selector)).map((el)=>({boxShadow:css(el).boxShadow,filter:css(el).filter,textShadow:css(el).textShadow}));
    return {
      dualRects,
      dualOriginToken:dualHost.style.getPropertyValue('--kt-loading-transform-origin'),
      dualOrigins:dualRings.map((el)=>css(el).transformOrigin),
      dualAnimations:dualRings.map((el)=>({name:css(el).animationName,direction:css(el).animationDirection,inset:css(el).inset})),
      spokeCount:spokeEls.length,spokeUnique:new Set(spokeTransforms).size,spokeAnimations:spokeEls.map((el)=>css(el).animationName),spokeDelays:spokeEls.map((el)=>Number.parseFloat(css(el).animationDelay)),spokeOriginToken:spokeHost.style.getPropertyValue('--kt-loading-transform-origin'),
      orbit:{animation:css(orbit).animationName,ringAnimation:css(document.querySelector('#orbit .kt-loading-spinner__ring')).animationName,hasParticle:!!particle},
      bar:{samples:barSamples,shadow:css(progress).boxShadow,widthRatio:rect(progress).width/rect(track).width,timing:barAnimation.effect.getTiming().easing},
      shimmer:{baseColor:css(shimmer).color,fill:css(shimmer).webkitTextFillColor,background:shimmerPseudo.backgroundImage,size:shimmerPseudo.backgroundSize,clip:shimmerPseudo.backgroundClip,animation:shimmerPseudo.animationName,keyframes:shimmerRule ? [...shimmerRule.cssRules].map((r)=>({key:r.keyText,pos:r.style.backgroundPosition})) : []},
      meter:{filled:cells.length,low:meterLow,high:meterHigh,animation:css(cells[0]).animationName,delays:cells.map((cell)=>Number.parseFloat(css(cell).animationDelay))},
      frame:{first:firstFrame,second:secondFrame},stages,defaultTargets
    };
  });
  assert.equal(result.dualRects.length,2);
  assert.ok(Math.abs(result.dualRects[0].width-result.dualRects[1].width)<.1 && Math.abs(result.dualRects[0].height-result.dualRects[1].height)<.1,'dual rings must be equal size');
  assert.ok(result.dualAnimations.every((item)=>item.inset==='0px'),'dual rings must overlap at inset 0');
  assert.equal(result.dualAnimations[1].direction,'reverse');
  assert.equal(result.dualOriginToken,'25% 75%');
  assert.notEqual(result.dualOrigins[0],result.dualRects[0].width/2+'px '+result.dualRects[0].height/2+'px','custom transform origin must reach transform-based parts');
  assert.equal(result.spokeCount,12); assert.equal(result.spokeUnique,12); assert.ok(result.spokeAnimations.every((name)=>name==='kt-loading-spoke'));
  assert.ok(result.spokeDelays[0]<result.spokeDelays.at(-1),'reverse must invert the spokes phase order');
  assert.equal(result.spokeOriginToken,'50% 100%');
  assert.equal(result.orbit.ringAnimation,'none'); assert.equal(result.orbit.animation,'kt-loading-spin'); assert.ok(result.orbit.hasParticle,'orbit spinner must render an orbiting particle element');
  const samples=result.bar.samples;
  assert.ok(samples.every((sample,index)=>index===0 || sample.cx>samples[index-1].cx),'indeterminate bar must move monotonically without a visual jump');
  assert.ok(samples[0].right<=samples[0].trackLeft+2,'bar must begin fully outside the left edge');
  assert.ok(samples.at(-1).left>=samples.at(-1).trackRight-2,'bar must finish fully outside the right edge');
  assert.ok(Math.abs(samples[2].cx-samples[2].trackCx)<1.5,`bar midpoint must be centered (delta ${Math.abs(samples[2].cx-samples[2].trackCx)})`);
  assert.notEqual(result.bar.shadow,'none'); assert.equal(result.bar.timing,'linear');
  assert.equal(result.shimmer.size,'200% 100%'); assert.ok(result.shimmer.clip.includes('text')); assert.ok(result.shimmer.background.includes('linear-gradient')); assert.equal(result.shimmer.animation,'kt-loading-shimmer');
  assert.notEqual(result.shimmer.baseColor,'rgba(0, 0, 0, 0)','shimmer base text must remain visible in light mode');
  assert.deepEqual(result.shimmer.keyframes.map((item)=>item.pos),['-200% 0','200% 0']);
  assert.equal(result.meter.filled,6); assert.equal(result.meter.animation,'kt-loading-meter-scan'); assert.ok(result.meter.delays[0]<result.meter.delays.at(-1),'reverse must invert the meter scan order'); assert.ok(result.meter.high>result.meter.low+.3,'meter scan must visibly change opacity');
  const asciiFrames=['|','/','-','\\'];
  assert.equal(asciiFrames.indexOf(result.frame.second),(asciiFrames.indexOf(result.frame.first)-1+asciiFrames.length)%asciiFrames.length,'reverse ASCII spinner must step backward');
  assert.ok(result.stages.every((stage)=>stage.shadow==='none' && stage.dy<1 && stage.height>=220 && stage.paddingTop===stage.paddingBottom),'previews must be shadowless and vertically centered');
  assert.ok(result.defaultTargets.every((target)=>target.boxShadow==='none' && target.filter==='none' && target.textShadow==='none'),'default indicators must not add shadows');
  console.log('Loading indicator browser QA OK', JSON.stringify(result));
} finally {
  await browser.close();
}
