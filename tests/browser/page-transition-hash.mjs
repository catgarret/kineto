// Page Transition: a hash-only history move is not a navigation.
//
// 왜 이 파일이 생겼나
// -------------------
// `data-kt-page-transition` 이 붙은 페이지에서 사이드바 링크를 누르고 **뒤로가기**를 누르면
// 컨테이너 안의 내용이 통째로 사라졌습니다. 공개 데모에서 실제로 재현됐습니다 — 모듈 블록
// 53개, 설정 패널 227개, 비교 시트 34개가 전부 0이 됐습니다.
//
// 원인은 `onPopState` 가 아무 조건 없이 페이지를 다시 가져온 것입니다. 해시만 다른 history
// 항목은 **같은 문서 안의 이동**이라 브라우저가 이미 할 일을 다 했고, 거기서 다시 fetch 해
// 컨테이너를 갈아 끼우면 로드 이후에 페이지가 만든 것(생성된 섹션, 마운트된 패널, 프레임워크가
// 렌더한 것)이 전부 날아갑니다. 클릭은 `shouldHandle()` 에서 이미 해시 전용 URL을 거르고
// 있었고, history 이동에만 같은 규칙이 없었습니다.
//
// 그래서 두 가지를 함께 지킵니다.
//   1. 해시만 바뀌는 이동에서는 다시 가져오지 않고, 런타임에 만든 DOM이 살아남는다.
//   2. 경로가 실제로 바뀌는 이동에서는 **여전히** 전환이 동작한다(고쳤다고 꺼 버리면 안 됩니다).
//
// 실행: node tests/browser/page-transition-hash.mjs   (KT_BROWSER=firefox|webkit)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const browserName = process.env.KT_BROWSER || 'chromium';
const browserType = { chromium, firefox, webkit }[browserName] || chromium;

const page = (title) => `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>`
  + '<link rel="stylesheet" href="/dist/kineto.css">'
  + '<style>#deep{margin-top:150vh}</style></head>'
  + '<body data-kt-page-transition data-kt-container="main" data-kt-min-duration="0">'
  + `<main><h1 id="title">${title}</h1><a id="anchor" href="#deep">in-page anchor</a>`
  + '<div id="deep">deep</div></main>'
  + '<script src="/dist/kineto.umd.js"></script></body></html>';

const PAGES = { '/first.html': page('first'), '/second.html': page('second') };
const server = http.createServer((request, response) => {
  const url = request.url.split('?')[0];
  if (PAGES[url]) {
    response.writeHead(200, { 'content-type': 'text/html' });
    response.end(PAGES[url]);
    return;
  }
  const file = path.join(root, url);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    response.writeHead(404);
    response.end();
    return;
  }
  const type = url.endsWith('.css') ? 'text/css' : 'text/javascript';
  response.writeHead(200, { 'content-type': type });
  fs.createReadStream(file).pipe(response);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const launchOptions = { args: browserName === 'chromium' ? ['--no-sandbox', '--disable-dev-shm-usage'] : [] };
if (process.env.KT_CHROME && browserName === 'chromium') launchOptions.executablePath = process.env.KT_CHROME;
const browser = await browserType.launch(launchOptions);

try {
  const tab = await browser.newPage({ viewport: { width: 900, height: 700 } });
  const errors = [];
  const refetches = [];
  tab.on('pageerror', (error) => errors.push(error.message));
  tab.on('request', (request) => { if (request.headers()['x-kineto-navigation']) refetches.push(request.url().replace(origin, '')); });

  await tab.goto(`${origin}/first.html`, { waitUntil: 'load' });
  // 번들은 스스로 초기화하지 않습니다 — 데모도 main.js 에서 Kineto.init(document) 을 부릅니다.
  await tab.waitForFunction(() => Boolean(window.Kineto));
  await tab.evaluate(() => window.Kineto.init(document));
  await tab.waitForFunction(() => Boolean(window.Kineto.getInstance(document.body, 'pageTransition')), { timeout: 8000 });

  // 로드 이후에 페이지가 만든 것. 실제 데모에서는 모듈 블록과 설정 패널이 이 자리에 있습니다.
  const plantMarker = () => tab.evaluate(() => {
    const mark = document.createElement('p');
    mark.id = 'built-at-runtime';
    mark.textContent = 'built after load';
    document.querySelector('main').appendChild(mark);
  });
  const markerAlive = () => tab.evaluate(() => Boolean(document.getElementById('built-at-runtime')));

  // 1. 같은 문서 안의 앵커 이동 → 뒤로가기. 다시 가져오지 않아야 합니다.
  await plantMarker();
  refetches.length = 0;
  await tab.evaluate(() => { window.history.pushState({}, '', '#deep'); });
  await tab.goBack();
  await tab.waitForTimeout(600);
  assert.equal(await markerAlive(), true, 'Back across a hash-only entry must not replace the container');
  assert.deepEqual(refetches, [], `a hash-only history move must not refetch the page (got ${refetches.join(', ')})`);

  // 2. 주소창에서 해시를 바꾸는 경우도 같습니다.
  refetches.length = 0;
  await tab.evaluate(() => { window.location.hash = '#deep'; });
  await tab.waitForTimeout(500);
  await tab.evaluate(() => { window.location.hash = ''; });
  await tab.waitForTimeout(500);
  assert.equal(await markerAlive(), true, 'editing the hash must not replace the container');
  assert.deepEqual(refetches, [], 'a hash edit must not refetch the page');

  // 3. 경로가 진짜 바뀌면 전환은 그대로 동작해야 합니다 — 이 수정으로 모듈을 꺼 버리면
  //    버그를 고친 게 아니라 기능을 지운 것입니다.
  refetches.length = 0;
  await tab.evaluate(() => { document.querySelector('main').insertAdjacentHTML('beforeend', '<a id="go" href="/second.html">second</a>'); });
  await tab.click('#go');
  await tab.waitForFunction(() => document.getElementById('title')?.textContent === 'second', { timeout: 8000 });
  assert.ok(refetches.some((url) => url.startsWith('/second.html')), 'a real path change must still be handled by the module');
  assert.equal(await markerAlive(), false, 'a real navigation replaces the container, marker and all');

  // 4. 그리고 그 뒤의 뒤로가기도 여전히 전환입니다.
  refetches.length = 0;
  await tab.goBack();
  await tab.waitForFunction(() => document.getElementById('title')?.textContent === 'first', { timeout: 8000 });
  assert.ok(refetches.some((url) => url.startsWith('/first.html')), 'Back across a real navigation must still transition');

  assert.deepEqual(errors, [], 'page transitions must not raise page errors');
  console.log(`page-transition-hash OK (${browserName}) — hash-only history moves and hash edits keep the container (and everything built into it after load), while real path changes still transition both ways.`);
} finally {
  await browser.close();
  server.close();
}
