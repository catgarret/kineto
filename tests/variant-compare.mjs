// Variant 비교 시트의 게이트.
//
// 로드맵이 약속한 문장은 "한 모듈의 모든 공개 variant가 같은 소재로 한눈에 비교된다"입니다.
// 그 약속이 사람의 기억이 아니라 CI로 지켜지게 하는 것이 이 파일입니다. 지키는 것:
//
//   1. 계약에 variant가 2개 이상인 모듈은 전부 카탈로그에 들어 있다.
//   2. grid 모듈의 모든 variant는 요구 조건(텍스트/이미지/영상…)을 만족하는 소재가
//      데모에 실제로 있고, 그 소재를 복제하면 정확히 그 variant가 켜진다.
//   3. control 모듈의 모든 variant는 전용 컨트롤이 정확히 하나 있다.
//   4. link 모듈은 "왜 나란히 볼 수 없는지"를 읽을 수 있는 문장으로 남긴다.
//   5. 시트가 쓰는 모든 문구는 데모의 6개 언어에 전부 번역되어 있다.
//
// 이 검사는 실제 demo/compare.js 를 JSDOM 에서 그대로 실행해서 확인합니다 — 판정 로직의
// 사본을 테스트에 만들어 두면 그 사본이 먼저 낡기 때문입니다.
//
// 실행: node tests/variant-compare.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const contract = JSON.parse(read('kineto.features.json'));
const html = read('demo/index.html');
const compareSource = read('demo/compare.js');
const mainSource = read('demo/main.js');

// ── 0. 페이지가 카탈로그 → 비교 시트 → main 순서로 읽는가 ─────────────────────
const scriptOrder = [...html.matchAll(/<script src="\.\/([^"?]+)/g)].map((match) => match[1]);
const order = (file) => scriptOrder.indexOf(file);
assert.ok(order('variant-catalog.js') >= 0, 'demo must load the generated variant catalog');
assert.ok(order('compare.js') >= 0, 'demo must load the variant compare sheet');
assert.ok(order('variant-catalog.js') < order('compare.js'), 'the catalog must load before the sheet that reads it');
assert.ok(order('compare.js') < order('main.js'), 'the sheet must be ready before main.js builds the module blocks');
assert.match(mainSource, /KINETO_COMPARE\?\.attach\(block,n\)/, 'main.js must attach the compare sheet to every module block');

// ── 1. 실제 데모 DOM 에서 실제 compare.js 를 돌린다 ───────────────────────────
const dom = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/gi, ''), { url: 'https://example.test/', runScripts: 'outside-only' });
const { window } = dom;
const run = (file) => vm.runInContext(read(file), dom.getInternalVMContext());
run('demo/module-metadata.js');
run('demo/variant-catalog.js');
run('demo/compare.js');

const compare = window.KINETO_COMPARE;
assert.ok(compare, 'demo/compare.js must expose its helpers so this gate checks the real implementation');
compare.snapshot();

// 스냅샷은 페이지를 여는 순간 돌아갑니다. 능력 하나당 복제본 하나를 넘기면 쓰지도 않을
// 복제본이 수백 개 생기므로, 그 상한을 여기서 지킵니다.
const snapshotStats = compare.stats();
assert.ok(snapshotStats.clones <= snapshotStats.needed,
  `the compare sheet snapshots ${snapshotStats.clones} clones for ${snapshotStats.needed} needed capabilities — one per capability is the budget`);

const catalog = window.KINETO_VARIANT_CATALOG;
const expected = contract.modules.filter((module) => (module.variants || []).length > 1).map(({ name }) => name);
assert.deepEqual(Object.keys(catalog.modules).sort(), Array.from(expected).sort(),
  'every module with two or more public variants needs a compare entry — regenerate with scripts/generate-variant-catalog.mjs');
assert.equal(catalog.libraryVersion, contract.libraryVersion, 'catalog version must match the feature contract');

// ── 2. 모듈별 검사 ────────────────────────────────────────────────────────────
const problems = [];
const activationAttributes = new Set(contract.modules.map((module) => module.attribute));
let gridVariants = 0;
let controlVariants = 0;
let linkVariants = 0;

for (const [name, entry] of Object.entries(catalog.modules)) {
  const module = contract.modules.find((item) => item.name === name);
  assert.ok(module, `${name}: no such module in the feature contract`);
  // 카탈로그는 JSDOM 렐름 안에서 만들어지므로 배열끼리 바로 비교하면 프로토타입이 달라 실패합니다.
  assert.equal(Array.from(entry.variants, (variant) => variant.name).join(','), module.variants.join(','), `${name}: catalog variants drifted from the contract`);
  assert.ok(['grid', 'control', 'link'].includes(entry.preview), `${name}: unknown preview mode "${entry.preview}"`);
  assert.ok(window.document.querySelector(`[data-demo-home="${name}"]`), `${name}: needs a home card so the sheet has somewhere to send a reader`);

  for (const variant of entry.variants) {
    assert.ok(Object.prototype.hasOwnProperty.call(catalog.capabilities, variant.requires),
      `${name}.${variant.name}: unknown capability "${variant.requires}"`);

    if (entry.preview === 'grid') {
      gridVariants += 1;
      // 소재가 있는가 — 없으면 시트가 빈 칸을 보여 주게 됩니다.
      const specimen = compare.specimenFor(name, variant.requires);
      if (!specimen) {
        problems.push(`${name}.${variant.name}: the demo has no material that satisfies "${variant.requires}" (${catalog.capabilities[variant.requires]})`);
        continue;
      }
      // 복제하면 정확히 그 variant 가 켜지는가.
      const material = compare.prepareMaterial(name, entry, variant);
      if (!material) { problems.push(`${name}.${variant.name}: the material could not be prepared`); continue; }
      const applied = entry.carrier === 'activation'
        ? material.getAttribute(entry.attribute)
        : material.getAttribute(entry.carrierAttribute);
      if (applied !== variant.name) {
        problems.push(`${name}.${variant.name}: the prepared material reads "${applied}" — an authored option is beating the variant`);
      }
      // 타일의 뿌리에는 이 모듈의 속성만 남아야 합니다 — 그래야 타일이 보여 주는 것이
      // 정확히 이 모듈의 이 variant 하나입니다.
      const strays = [...material.attributes].map((attribute) => attribute.name)
        .filter((attributeName) => attributeName.startsWith('data-kt-')
          && attributeName !== entry.attribute
          && !entry.optionAttributes.includes(attributeName));
      if (strays.length) problems.push(`${name}.${variant.name}: the tile root still carries ${strays.join(', ')}`);
      // 자식에 다른 모듈이 살아 있으면 타일이 두 모듈을 동시에 보여 주게 됩니다.
      const nested = [...material.querySelectorAll('*')].flatMap((node) => [...node.attributes]
        .map((attribute) => attribute.name)
        .filter((attributeName) => activationAttributes.has(attributeName) && attributeName !== entry.attribute));
      if (nested.length) problems.push(`${name}.${variant.name}: another module is still live inside the tile (${[...new Set(nested)].join(', ')})`);
    } else if (entry.preview === 'control') {
      controlVariants += 1;
      const controls = window.document.querySelectorAll(`[data-demo-variant="${name}:${variant.name}"]`);
      if (controls.length !== 1) {
        problems.push(`${name}.${variant.name}: expected exactly one data-demo-variant control, found ${controls.length}`);
      }
    } else {
      linkVariants += 1;
      if (!String(entry.reason || '').trim()) problems.push(`${name}: a link-mode module must say why its variants cannot sit side by side`);
    }
  }
}

// 데모에 남은 data-demo-variant 훅이 전부 실제 variant 를 가리키는가(오타·이름 변경 방지).
for (const match of html.matchAll(/data-demo-variant="([^"]+)"/g)) {
  const [moduleName, ...rest] = match[1].split(':');
  const variantName = rest.join(':');
  const entry = catalog.modules[moduleName];
  if (!entry) { problems.push(`data-demo-variant="${match[1]}": unknown module`); continue; }
  if (!entry.variants.some((variant) => variant.name === variantName)) {
    problems.push(`data-demo-variant="${match[1]}": "${variantName}" is not a public variant of ${moduleName}`);
  }
}

// ── 3. 시트가 쓰는 문구는 전부 번역되어 있는가 ────────────────────────────────
const i18nContext = { window: {} };
vm.runInNewContext(read('demo/copy-i18n.js'), i18nContext);
const ui = i18nContext.window.KINETO_COPY_I18N.ui;
const languageCount = i18nContext.window.KINETO_COPY_I18N.languages.length;
// `t('…')` 로 감싼 문구와, badge()/button() 에 라벨 키로 넘긴 문구를 전부 긁습니다.
// 앞에 단어 문자가 오면 `closest('button')` 같은 호출까지 잡히므로 경계를 둡니다.
const uiKeys = [...compareSource.matchAll(/(?<![\w$.])t\('([^']+)'\)/g)].map((match) => match[1])
  .concat([...compareSource.matchAll(/(?:badge|button)\('[^']*', *'([^']+)'/g)].map((match) => match[1]))
  .concat(Object.values(catalog.modules).map((entry) => entry.reason).filter(Boolean));
assert.ok(uiKeys.length >= 10, 'the string scan found suspiciously few keys — did the sheet stop using t()?');
for (const key of new Set(uiKeys)) {
  if (!ui[key] || ui[key].length !== languageCount) problems.push(`demo copy is missing a translation for: ${key}`);
}

if (problems.length) {
  console.error('variant-compare FAILED:\n' + problems.map((line) => `  - ${line}`).join('\n')
    + '\n\nFix one of these three ways (docs/variant-compare.md):\n'
    + '  · add demo material that satisfies the variant requirement,\n'
    + '  · add data-demo-variant="<module>:<variant>" to the control the demo already has,\n'
    + '  · or record in scripts/generate-variant-catalog.mjs why the variants cannot sit side by side.\n');
  process.exit(1);
}

console.log(`variant-compare OK — ${Object.keys(catalog.modules).length} modules / ${catalog.variantCount} variants:`
  + ` ${gridVariants} live side by side, ${controlVariants} play through the demo's own controls, ${linkVariants} explain why they cannot;`
  + ` the page-load snapshot holds ${snapshotStats.clones} clones.`);
