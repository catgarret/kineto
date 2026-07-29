import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CHROME = process.env.KT_CHROME || undefined;
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.woff2':'font/woff2'};
// serve DEMO (uses local dist so Kineto loads offline in sandbox)
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]);let fp=path.join(root,p);if(fp.endsWith('/'))fp=path.join(fp,'index.html');fs.readFile(fp,(e,b)=>{if(e){res.writeHead(404);res.end();return;}res.writeHead(200,{'content-type':MIME[path.extname(fp)]||'application/octet-stream'});res.end(b);});});
await new Promise(r=>server.listen(0,r)); const PORT=server.address().port;
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version;
const browser=await chromium.launch({headless:true,...(CHROME?{executablePath:CHROME}:{}),args:['--no-sandbox','--disable-gpu']});
const page=await browser.newPage();
await page.goto(`http://localhost:${PORT}/demo/index.html`,{waitUntil:'load'});
await page.waitForFunction(()=>window.Kineto&&document.querySelector('[data-kt-version]')?.textContent);
await page.waitForTimeout(500);
const r=await page.evaluate(()=>({
  runtime: window.Kineto.version,
  headerVersions: [...document.querySelectorAll('.site-header [data-kt-version]')].map(n=>n.textContent),
  allVersions: [...document.querySelectorAll('[data-kt-version]')].map(n=>n.textContent),
  moduleCount: document.querySelector('[data-kt-module-count]')?.textContent,
  // The footer meta strip now labels the value in a <dt>, so the value cell
  // holds just the build id.
  build: document.querySelector('[data-kt-build]')?.textContent,
  buildLabel: document.querySelector('[data-kt-build]')?.closest('div')?.querySelector('dt')?.textContent,
  has34: /\b34\b/.test(document.body.innerText)
}));
let pass=0,fail=0; const ck=(n,c,d)=>{console.log(`  [${c?'PASS':'FAIL'}] ${n}${d?' — '+d:''}`);c?pass++:fail++;};
console.log('  measured:', JSON.stringify(r));
ck('runtime version == package', r.runtime===pkg, `${r.runtime} vs ${pkg}`);
ck('all displayed versions == runtime', r.allVersions.every(v=>v===r.runtime), JSON.stringify(r.allVersions));
ck('module count == 51', r.moduleCount==='51', r.moduleCount);
ck('no stale "34" in body text', r.has34===false);
ck('build id stamped', /^\S+$/.test((r.build||'').trim()) && /build/i.test(r.buildLabel||''), `${r.buildLabel}=${r.build}`);
await browser.close(); server.close();
console.log(`\n===== B-1 RUNTIME: ${pass} passed, ${fail} failed =====`);
process.exit(fail?1:0);
