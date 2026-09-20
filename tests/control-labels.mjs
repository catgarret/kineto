// 라이브러리가 **스스로 만든** 컨트롤의 접근성 이름은 페이지가 정할 수 있어야 합니다.
//
// 왜 이 파일이 생겼나
// -------------------
// Bottom Sheet 의 높이 조절 그립이 한국어 툴팁을 하드코딩하고 있었습니다. `resizable` 을 켠
// **모든 소비자 사이트**가 방문자 언어와 무관하게 한국어를 봤습니다. 같은 자리를 훑어보니
// 슬라이더 점("Go to slide 3"), 토스트 닫기("Dismiss"), 뷰어("Media viewer")처럼 영어로 박힌
// 문구가 더 있었습니다 — 한국어 사이트에서 스크린 리더가 영어를 읽던 셈입니다.
//
// 라이브러리는 읽는 사람의 언어를 알 수 없습니다. 그렇다고 이름을 안 줄 수도 없으므로
// (이름 없는 버튼이 더 나쁩니다) 규칙은 이렇습니다: **기본값은 영어, 문구는 언제나 페이지가
// 덮어쓸 수 있게.** 문자열마다 옵션을 만들면 금방 열 개씩 늘어나므로 모듈마다 `labels`
// 지도 하나만 공개합니다(`utils.labeller`).
//
// 이 파일은 두 가지를 지킵니다.
//   1. 구현: 네 모듈의 기본값이 문서와 같고, `labels` 로 실제로 덮어써지며, 자리표시자가 채워진다.
//   2. 예방: 모듈 소스에 사용자에게 보이는 문자열 리터럴이 **새로** 생기지 않는다.
//
// 실행: node tests/control-labels.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ── 1. 예방: 사용자에게 보이는 자리에 박힌 문자열이 있는가 ────────────────────
//
// 값이 옵션(`opts.`)이나 `label(...)`(= labeller)에서 오면 페이지가 바꿀 수 있으므로 통과입니다.
// 작성자가 준 내용(`text`, `originalTitle` 같은 변수)도 리터럴이 아니므로 걸리지 않습니다.
// 걸리는 것은 정확히 하나 — **모듈이 지어낸 문구를 그 자리에 바로 적은 경우**입니다.
const SINK = /setAttribute\(\s*'(?:aria-label|aria-roledescription|aria-valuetext|title|placeholder)'\s*,([^;]*)\)|\.(?:title|ariaLabel|placeholder)\s*=([^;]*);/g;
const offenders = [];
for (const file of fs.readdirSync(path.join(root, 'src/modules'), { recursive: true })) {
  if (!String(file).endsWith('.js')) continue;
  const source = fs.readFileSync(path.join(root, 'src/modules', String(file)), 'utf8');
  source.split('\n').forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
    for (const match of line.matchAll(SINK)) {
      const value = (match[1] ?? match[2] ?? '').trim();
      if (/\bopts\.|\blabel\(|\bLABELS\b/.test(value)) return;    // 페이지가 바꿀 수 있음
      // 따옴표 안의 **글자**만 봅니다. 값을 이어 붙이는 `', '`·`' '` 같은 구분자나
      // `` `${i + 1}` `` 처럼 숫자만 들어가는 틀은 모듈이 지어낸 말이 아닙니다.
      const invented = [...value.matchAll(/'([^']*)'|"([^"]*)"|`([^`]*)`/g)]
        .map((quoted) => (quoted[1] ?? quoted[2] ?? quoted[3] ?? ''))
        // 자리표시자 안은 작성자 내용입니다. 중첩 템플릿이면 조각이 열린 채로 끝나므로
        // 닫는 괄호를 선택으로 두어 그 조각도 통째로 걷어냅니다.
        .map((text) => text.replace(/\$\{[^}]*\}?/g, ''))
        .filter((text) => /[A-Za-z\u3131-\uD79D\u3040-\u30FF\u4E00-\u9FFF]/.test(text));
      if (!invented.length) return;
      offenders.push(`src/modules/${file}:${index + 1}  ${trimmed.slice(0, 110)}`);
    }
  });
}
assert.deepEqual(offenders, [],
  'these modules invent a user-visible string the page cannot change — give the module a `labels` map (see utils.labeller):\n  '
  + offenders.join('\n  '));

// ── 2. 구현: 기본값과 덮어쓰기가 실제로 동작하는가 ────────────────────────────
const dom = new JSDOM('<!doctype html><body></body>', { pretendToBeVisual: true, url: 'http://localhost/' });
const { window } = dom;
Object.assign(globalThis, {
  window,
  document: window.document,
  Element: window.Element,
  HTMLElement: window.HTMLElement,
  Image: window.Image,
  getComputedStyle: window.getComputedStyle,
  requestAnimationFrame: window.requestAnimationFrame.bind(window),
  cancelAnimationFrame: window.cancelAnimationFrame.bind(window)
});
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: window.navigator });

const { labeller } = await import('../src/utils.js');
const fullpageModule = (await import('../src/modules/fullpage.js')).default;
const toastModule = (await import('../src/modules/toast.js')).default;

// 자리표시자는 넘긴 값으로만 채우고, 모르는 이름은 그대로 둡니다 — 오타가 조용히
// 빈칸이 되면 "이름 없는 버튼"이라는 원래 문제로 돌아갑니다.
const sample = labeller({ dot: 'Go to slide {n}', plain: 'Close' }, { plain: '닫기' });
assert.equal(sample('dot', { n: 3 }), 'Go to slide 3', 'placeholders must be filled from the supplied values');
assert.equal(sample('plain'), '닫기', 'a supplied label must win over the default');
assert.equal(sample('dot', { wrong: 1 }), 'Go to slide {n}', 'an unknown placeholder must stay visible, not vanish');
assert.equal(sample('missing'), '', 'an unknown key must not print "undefined" into the page');
assert.equal(labeller({ a: 'A' }, 'not-an-object')('a'), 'A', 'a non-object labels value must be ignored, not crash');
assert.equal(labeller({ a: 'A' }, { a: '' })('a'), 'A', 'an empty override must fall back rather than leave the control unnamed');

const mountFullpage = (options) => {
  const el = window.document.createElement('div');
  el.innerHTML = '<section>One</section><section>Two</section>';
  window.document.body.appendChild(el);
  Object.defineProperty(el, 'clientHeight', { configurable: true, value: 360 });
  [...el.children].forEach((section) => {
    Object.defineProperty(section, 'clientHeight', { configurable: true, value: 360 });
    Object.defineProperty(section, 'scrollHeight', { configurable: true, value: 360 });
  });
  const instance = fullpageModule.create(el, { duration: 0.1, dots: true, ...options });
  const labels = [...el.querySelectorAll('.kt-fullpage-dot')].map((dot) => dot.getAttribute('aria-label'));
  instance?.destroy?.();
  el.remove();
  return labels;
};
assert.deepEqual(mountFullpage({}), ['Go to section 1', 'Go to section 2'],
  'the documented English default must be what ships when the page says nothing');
assert.deepEqual(mountFullpage({ labels: { dot: '{n}번째 구역으로' } }), ['1번째 구역으로', '2번째 구역으로'],
  'fullpage dots must take the page\'s own wording');

const toastHost = window.document.createElement('button');
window.document.body.appendChild(toastHost);
const toast = toastModule.create(toastHost, { message: 'Saved', duration: 1000, labels: { region: '알림', dismiss: '닫기' } });
toast.show();
assert.equal(window.document.querySelector('.kt-toast-region')?.getAttribute('aria-label'), '알림',
  'the toast region must take the page\'s own wording');
assert.equal(window.document.querySelector('.kt-toast__close')?.getAttribute('aria-label'), '닫기',
  'the toast dismiss button must take the page\'s own wording');
toast.destroy?.();

console.log(`control-labels OK — no module invents a user-visible string the page cannot change; ${offenders.length === 0 ? 'fullpage, toast, slider, lightbox and bottomSheet' : ''} default to documented English and follow a supplied \`labels\` map.`);
