// Documentation integrity guard. The roadmap and troubleshooting guide are
// operational inputs, not decorative pages: a stale version or broken module
// link sends the next maintainer toward the wrong release contract.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const pkg = JSON.parse(read('package.json'));
const contract = JSON.parse(read('kineto.features.json'));
const readme = read('README.md');
const docsReadme = read('docs/README.md');
const roadmap = read('docs/ROADMAP.md');
const troubleshooting = read('docs/troubleshooting.md');
const usageMatrix = read('docs/module-usage-matrix.md');
const moduleStatus = read('docs/module-status.md');
const consumerBundles = read('docs/consumer-bundle-size.md');
const browserQa = read('docs/browser-qa-matrix.md');
const browserQaHistory = read('docs/browser-qa-history.md');
const browserDeviceQa = read('docs/browser-device-qa.md');
const variantDistinctness = read('docs/variant-distinctness.md');
const flipSharedLayout = read('docs/flip-shared-layout.md');
const sliderPhysics = read('docs/slider-physics-rfc.md');
const readiness = read('docs/1.0-readiness.md');
const diagnostics = read('docs/diagnostics-and-deprecation.md');
const presetBoundary = read('docs/preset-runtime-boundary.md');
const platformEnhancements = read('docs/platform-enhancements.md');
const caseStudy = read('docs/case-study-template.md');
const reference = read('docs/module-reference.md');
const modulesReadme = read('docs/modules/README.md');
const demoPolish = read('tests/browser/demo-polish.mjs');
const localizedReadmes = ['ko', 'jp', 'zh-CN', 'zh-TW', 'ru', 'it'].map((locale) => read(`i18n/README.${locale}.md`));

assert.equal(pkg.version, contract.libraryVersion, 'package and feature contract versions must match');
assert.match(roadmap, new RegExp(`기준 버전: v${pkg.version}(?:\\s|·)`), 'roadmap baseline must track package version');
assert.match(roadmap, new RegExp(`v${pkg.version}에서`), 'roadmap must record the latest release evidence');
assert.match(readme, /\[Troubleshooting\]\(docs\/troubleshooting\.md\)/, 'root README must link troubleshooting');
assert.match(docsReadme, /\[문제 해결\]\(troubleshooting\.md\)/, 'docs index must link troubleshooting');
assert.match(docsReadme, /\[모듈 사용·품질 매트릭스\]\(module-usage-matrix\.md\)/, 'docs index must link module quality matrix');
assert.match(docsReadme, /\[모듈 유지 상태표\]\(module-status\.md\)/, 'docs index must link module status');
assert.match(docsReadme, /\[소비자 번들 측정\]\(consumer-bundle-size\.md\)/, 'docs index must link consumer bundle measurements');
assert.match(docsReadme, /\[브라우저 레이어 QA 매트릭스\]\(browser-qa-matrix\.md\)/, 'docs index must link browser QA matrix');
for (const [label, file] of [
  ['브라우저 레이어 QA 이력', 'browser-qa-history.md'],
  ['실기기 브라우저 QA 실행표', 'browser-device-qa.md'],
  ['Page Reveal variant 중복 감사', 'variant-distinctness.md'],
  ['FLIP shared layout 범위', 'flip-shared-layout.md'],
  ['Slider physics RFC', 'slider-physics-rfc.md'],
  ['1.0 계약 준비도', '1.0-readiness.md'],
  ['1.0 진단·deprecation 계약', 'diagnostics-and-deprecation.md'],
  ['Preset과 runtime 경계', 'preset-runtime-boundary.md'],
  ['플랫폼 progressive enhancement 경로', 'platform-enhancements.md'],
  ['실제 사용 사례 기록 템플릿', 'case-study-template.md']
]) {
  assert.match(docsReadme, new RegExp(`\\[${label}\\]\\(${file}\\)`), `docs index must link ${file}`);
}
assert.ok(localizedReadmes.every((content) => content.includes('../docs/troubleshooting.md')), 'every localized README must link troubleshooting');

const moduleNames = contract.modules.map((module) => module.name);
const referenceNames = [...reference.matchAll(/^## ([A-Za-z][A-Za-z0-9]*)$/gm)].map((match) => match[1]);
assert.equal(referenceNames.length, contract.moduleCount, 'generated module reference heading count must match contract');
assert.deepEqual(new Set(referenceNames), new Set(moduleNames), 'generated module reference must cover every public module');
for (const name of moduleNames) {
  const listed = modulesReadme.includes(`| \`${name}\` |`)
    || (name === 'radial' && modulesReadme.includes('| `slider` |'));
  assert.ok(listed, `module index must list ${name}`);
  assert.ok(usageMatrix.includes(`| \`${name}\` |`), `module quality matrix must list ${name}`);
}

for (const heading of [
  '## 모듈형 엔트리가 동작하지 않음',
  '## 숨겨진 컨테이너에서 크기·정렬이 틀림',
  '## 모바일 Mega Menu가 열리지 않거나 엉뚱한 위치에 표시됨',
  '## Slider/Radial을 드래그하면 고스트 이미지가 생김',
  '## Page Reveal의 fade·flash가 비슷하게 보임',
  '## dateTime이 `n분 전` 대신 이상한 날짜를 표시함',
  '## Scroll Shadows가 너무 진하거나 자연스럽지 않음',
  '## SSR·hydration에서 `window` 오류 또는 DOM 불일치',
  '## CDN·CSP/SRI·GTM 확인',
  '## CI가 오래 걸리거나 실패함'
]) {
  assert.ok(troubleshooting.includes(heading), `troubleshooting guide is missing: ${heading}`);
}
for (const token of ['tabs.refresh()', "trigger: 'click'", 'relativeCutoff', 'GTM-KFQSFGJL', 'prefers-reduced-motion', 'timeout 5m']) {
  assert.ok(troubleshooting.includes(token), `troubleshooting guide is missing operational token: ${token}`);
}
assert.match(roadmap, /heavy-layout/, 'roadmap must record the cross-engine heavy-layout checkpoint');
assert.match(demoPolish, /checkpoint\('heavy-layout'\)/, 'browser QA must emit the heavy-layout checkpoint');
for (const token of ["checkpoint('heavy-layout')", 'getBoundingClientRect', 'position:fixed', 'position:sticky', 'clip-path', 'Firefox', 'WebKit']) {
  assert.ok(browserQa.includes(token), `browser QA matrix is missing operational token: ${token}`);
}
for (const token of ['공개 지원표', 'evergreen-canvas', '실제 iOS Safari/Android Chrome 실기기 검증']) {
  assert.ok(browserQa.includes(token), `browser QA support table is missing operational token: ${token}`);
}
for (const token of ['stable', 'maintenance', 'experimental', 'deprecated']) {
  assert.ok(moduleStatus.includes(`\`${token}\``), `module status is missing: ${token}`);
}
for (const token of ['Measurement scope', 'Vite library build', 'Independent bundler check (Rolldown)', 'Rolldown']) {
  assert.ok(consumerBundles.includes(token), `consumer bundle report is missing: ${token}`);
}
for (const token of ['public error code', 'opt-in debug output', 'migration fixture', '최소 한 minor']) {
  assert.ok(diagnostics.includes(token), `diagnostics/deprecation contract is missing: ${token}`);
}
assert.match(browserQaHistory, /fa055cc/);
for (const token of ['iOS Safari', 'Android Chrome', 'docs/qa-evidence']) {
  assert.ok(browserDeviceQa.includes(token), `device QA runbook is missing: ${token}`);
}
assert.match(browserDeviceQa, /실제\s+iOS\/Android 성공으로 표기하지 않습니다/);
for (const token of ['curtain', 'fade', 'flash', 'data-mosaic', 'distinct', '2026-08-19']) {
  assert.ok(variantDistinctness.includes(token), `variant distinctness audit is missing: ${token}`);
}
assert.match(flipSharedLayout, /data-kt-layout-id/);
assert.match(sliderPhysics, /momentum/);
assert.match(sliderPhysics, /bounce/);
assert.match(sliderPhysics, /sticky snap/);
assert.match(sliderPhysics, /native Scroll Snap/);
assert.match(readiness, /Core API·module registry/);
assert.match(presetBoundary, /@dong-gri\/kineto\/core/);
assert.match(platformEnhancements, /View Transitions/);
assert.match(caseStudy, /3건/);
for (const moduleName of ['pageReveal', 'pageTransition', 'slider', 'stickyStack', 'stickyHeader', 'lightbox', 'cursor', 'fullpage']) {
  assert.ok(roadmap.includes(moduleName), `roadmap heavy-layout list is missing ${moduleName}`);
}

console.log(`docs-navigation OK — v${pkg.version}, ${moduleNames.length} module references, troubleshooting coverage present.`);
