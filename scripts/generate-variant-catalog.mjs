// Variant catalog — the single declared source for the demo's "모든 variant 비교"
// sheet (demo/compare.js) and for docs/variant-compare.md.
//
// WHY THIS FILE EXISTS
// --------------------
// 계약(kineto.features.json)은 "이 모듈에 어떤 variant가 있는가"만 압니다. 비교
// 시트는 거기에 더해 "그 variant를 마크업으로 어떻게 켜는가"를 알아야 합니다.
// 그 답은 모듈마다 다릅니다:
//
//   - 대부분은 활성화 속성의 값이 곧 variant 입니다.
//     `data-kt-reveal="zoom-in"` → readOpts()가 값을 `preset`(radial만 `position`)에
//     넣고, 모듈이 그 값을 읽습니다. src/utils.js readOpts() 참고.
//   - 몇몇은 별도의 옵션이 variant를 나릅니다. `data-kt-text-split` 의 값은 애니메이션
//     이름이고, char/word 는 `by` 옵션입니다.
//   - 나머지는 하나의 옵션으로 켤 수 없습니다. ambientMedia 의 variant 는 소스 종류에서
//     파생되고, progress 의 `page:scaleX` 는 두 옵션의 조합이며, pageReveal 은 화면 전체를
//     덮어서 한 페이지에 여러 개를 띄울 수 없습니다.
//
// 그래서 이 파일은 모듈마다 셋 중 하나를 선언합니다.
//
//   grid    — 같은 소재를 variant 수만큼 복제해 나란히 살아 있는 상태로 보여 줍니다.
//   control — 데모가 이미 variant마다 전용 컨트롤을 갖고 있습니다(pageReveal 의 16개 버튼).
//             시트는 그 컨트롤을 대신 눌러 줍니다.
//   link    — 한 페이지에 여러 개를 둘 수 없거나, 한 옵션으로 켤 수 없습니다.
//             이유를 적고 모듈 데모로 보냅니다.
//
// 선언은 여기 한 곳에만 있고, tests/variant-compare.mjs 가 다음을 강제합니다.
//   · variant 가 2개 이상인 모든 모듈은 셋 중 하나를 선언한다
//   · grid 모듈의 모든 variant 는 데모에 요구 조건을 만족하는 소재가 실제로 있다
//   · control 모듈의 모든 variant 는 `data-demo-variant` 컨트롤이 정확히 하나 있다
//   · link 모듈은 비어 있지 않은 이유를 갖는다
//
// 새 variant 를 추가하고 이 중 어느 것도 하지 않으면 CI 가 떨어집니다 — 카테고리 분류와
// 같은 원칙입니다(docs/module-taxonomy.md).
//
// 실행: node scripts/generate-variant-catalog.mjs [--check]
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const contractUrl = new URL('../kineto.features.json', import.meta.url);
const metadataUrl = new URL('../kineto.module-metadata.json', import.meta.url);
const demoUrl = new URL('../demo/variant-catalog.js', import.meta.url);
const docsUrl = new URL('../docs/variant-compare.md', import.meta.url);

const contract = JSON.parse(await readFile(contractUrl, 'utf8'));
const metadata = JSON.parse(await readFile(metadataUrl, 'utf8'));

/** camelCase 옵션 이름을 실제 속성 이름으로 바꿉니다. cellSize → data-kt-cell-size */
const dash = (value) => String(value).replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);

// readOpts()가 활성화 속성의 값을 넣어 주는 옵션. radial 만 예외이며, 그 예외는
// src/utils.js 에 이미 주석과 함께 고정되어 있습니다.
const activationOptionOf = (name) => (name === 'radial' ? 'position' : 'preset');

// 활성화 값이 variant 가 아닌 모듈만 적습니다. 값은 variant 를 나르는 공개 옵션 이름이고,
// 아래에서 publicOptions 에 실제로 있는지 검증합니다.
const VARIANT_CARRIERS = {
  // data-kt-text-split 의 값은 애니메이션 이름입니다(src/modules/textSplit.js:101).
  textSplit: 'by',
  marquee: 'direction',
  parallax: 'axis',
  scrollSequence: 'fit',
  megaMenu: 'layout',
  flip: 'mode',
  // hold 의 `confirm` 은 게이지(길게 누르기·연타), `tap` 은 제자리 확인입니다.
  // 둘을 가르는 것은 `mode` 옵션입니다(src/modules/hold.js).
  hold: 'mode'
};

// 데모가 variant마다 전용 컨트롤을 이미 갖고 있는 모듈. 값은 그 컨트롤이 무엇인지에 대한
// 한 줄 설명입니다(시트가 사용자에게 그대로 보여 줍니다).
const CONTROL_MODULES = {
  pageReveal: '화면 전체를 덮는 오버레이라 한 페이지에 여러 개를 띄울 수 없습니다. 데모의 재생 버튼을 그대로 사용합니다.',
  loader: '전체 화면 로더라 한 번에 하나만 띄울 수 있습니다. 데모의 로더 카드를 그대로 사용합니다.'
};

// 한 옵션으로 켤 수 없거나 한 페이지에 여러 개를 둘 수 없는 모듈. 이유는 시트에 그대로
// 보이므로, "왜 여기서는 나란히 못 보는가"에 답하는 문장이어야 합니다.
const LINK_MODULES = {
  ambientMedia: 'variant 가 소스 종류(복제할 이미지·샘플링할 영상·단색)에서 파생됩니다. 옵션 하나로 바꿀 수 없어 모듈 데모의 세 카드가 그대로 비교 화면입니다.',
  cssScroll: 'variant 는 어떤 타임라인 옵션을 채웠는지의 결과입니다. 속성 값은 이름표일 뿐이라 값만 바꿔서는 다른 variant 가 되지 않습니다.',
  fullpage: '페이지 전체의 스크롤을 가져가는 모듈이라 한 페이지에 여러 개를 둘 수 없습니다.',
  lightbox: 'viewer 와 grouped 는 `data-kt-group` 을 함께 쓰는지의 차이입니다. 갤러리 전체가 하나의 소재라 카드 단위로 복제되지 않습니다.',
  progress: 'variant 가 대상(page·element)과 표현(scaleX·width) 두 옵션의 조합이고, page 계열은 문서 전체에 하나만 존재할 수 있습니다.',
  scrollShadows: 'variant 는 축(vertical·horizontal)과 모드(mask)가 섞인 조합이라 옵션 하나로 순회할 수 없습니다.',
  stickyHeader: '뷰포트에 고정되는 헤더라 한 페이지에 여러 개를 나란히 둘 수 없습니다.',
  tilt: 'variant 가 maxX·maxY·glare·reverse 옵션의 조합에서 파생됩니다. 옵션 하나로 순회할 수 없습니다.'
};

// 변형을 고를 때 모듈이 대체 값으로 함께 읽는 옵션들(`opts.mode || opts.preset || opts.style`).
// 복제한 소재에 이 중 하나가 남아 있으면 우리가 지정한 variant 를 이겨 버리므로, 시트는
// 이 목록을 먼저 지우고 나서 variant 를 씁니다.
const VARIANT_FALLBACK_OPTIONS = ['preset', 'mode', 'type', 'style', 'effect', 'variant'];

const modules = contract.modules.filter((module) => (module.variants || []).length > 1);
const errors = [];

const catalog = {};
for (const module of modules) {
  const { name } = module;
  const declared = [
    CONTROL_MODULES[name] ? 'control' : null,
    LINK_MODULES[name] ? 'link' : null,
    VARIANT_CARRIERS[name] ? 'carrier' : null
  ].filter(Boolean);
  if (declared.length > 1) {
    errors.push(`${name}: declared in more than one table (${declared.join(', ')}) — a module has exactly one preview mode`);
    continue;
  }

  const activationOption = activationOptionOf(name);
  const carrier = VARIANT_CARRIERS[name] || (module.publicOptions.includes(activationOption) ? activationOption : null);
  let preview = 'grid';
  let reason = '';
  if (CONTROL_MODULES[name]) { preview = 'control'; reason = CONTROL_MODULES[name]; }
  else if (LINK_MODULES[name]) { preview = 'link'; reason = LINK_MODULES[name]; }
  else if (!carrier) {
    errors.push(`${name}: has ${module.variants.length} public variants but nothing says how to switch between them. Declare a carrier option in VARIANT_CARRIERS, or explain the limit in CONTROL_MODULES / LINK_MODULES.`);
    continue;
  }

  if (VARIANT_CARRIERS[name] && !module.publicOptions.includes(VARIANT_CARRIERS[name])) {
    errors.push(`${name}: declared carrier "${VARIANT_CARRIERS[name]}" is not a public option of the module`);
    continue;
  }

  // 시트가 소재에서 지워야 하는 옵션 속성들. variant 를 나르는 옵션과, 모듈이 대체 값으로
  // 읽는 옵션들 중 이 모듈이 실제로 공개한 것만 담습니다.
  const clearOptions = [...new Set([
    carrier,
    ...VARIANT_FALLBACK_OPTIONS.filter((option) => module.publicOptions.includes(option))
  ])].filter(Boolean);

  catalog[name] = {
    attribute: module.attribute,
    category: metadata.modules[name]?.category || '',
    preview,
    reason,
    // 'activation' 은 속성의 값 자체에 쓴다는 뜻입니다. 그 밖에는 별도 속성에 씁니다.
    carrier: preview === 'grid' ? (carrier === activationOption ? 'activation' : carrier) : '',
    carrierAttribute: preview === 'grid' && carrier !== activationOption ? `data-kt-${dash(carrier)}` : '',
    clearAttributes: preview === 'grid' ? clearOptions.map((option) => `data-kt-${dash(option)}`) : [],
    defaultVariant: module.defaultVariant,
    deprecatedVariants: [...(module.deprecatedVariants || [])],
    // 옵션 이름은 소재를 복제할 때 "이 모듈의 옵션인가"를 판별하는 데 쓰입니다.
    optionAttributes: [...module.publicOptions].sort().map((option) => `data-kt-${dash(option)}`),
    variants: module.variants.map((variant) => ({
      name: variant,
      requires: module.variantRequires?.[variant] || 'any',
      deprecated: (module.deprecatedVariants || []).includes(variant)
    }))
  };
}

for (const name of [...Object.keys(CONTROL_MODULES), ...Object.keys(LINK_MODULES), ...Object.keys(VARIANT_CARRIERS)]) {
  if (!modules.some((module) => module.name === name)) {
    errors.push(`${name}: declared here but is not a module with two or more public variants`);
  }
}
for (const [name, text] of [...Object.entries(CONTROL_MODULES), ...Object.entries(LINK_MODULES)]) {
  if (!String(text).trim()) errors.push(`${name}: needs a reason a reader can act on`);
}

if (errors.length) {
  console.error('generate-variant-catalog failed:\n' + errors.map((line) => `  - ${line}`).join('\n'));
  process.exit(1);
}

const totalVariants = Object.values(catalog).reduce((sum, entry) => sum + entry.variants.length, 0);
const gridVariants = Object.values(catalog).filter((entry) => entry.preview === 'grid').reduce((sum, entry) => sum + entry.variants.length, 0);

const output = {
  schemaVersion: '1.0.0',
  libraryVersion: contract.libraryVersion,
  moduleCount: Object.keys(catalog).length,
  variantCount: totalVariants,
  capabilities: contract.variantCapabilities,
  modules: catalog
};

const demoText = [
  '/* Generated from kineto.features.json by scripts/generate-variant-catalog.mjs. Do not edit directly. */',
  '/* global window */',
  `window.KINETO_VARIANT_CATALOG = Object.freeze(${JSON.stringify(output, null, 2)});`,
  ''
].join('\n');

const tick = String.fromCharCode(96);
const code = (value) => `${tick}${value}${tick}`;
const esc = (value) => String(value).replaceAll('|', '\\|');
const PREVIEW_LABEL = { grid: '나란히', control: '데모 컨트롤', link: '모듈 데모' };

const docsText = [
  '# Variant 비교 시트',
  '',
  `> Generated from ${code('scripts/generate-variant-catalog.mjs')} · library v${contract.libraryVersion} · ${Object.keys(catalog).length} modules / ${totalVariants} variants.`,
  '',
  '데모의 모듈 블록마다 **"모든 variant 비교"** 버튼이 있습니다. 열면 그 모듈의 공개 variant가',
  '전부 같은 소재 위에 한 번에 펼쳐지고, 타일마다 그대로 붙여넣을 수 있는 마크업이 붙습니다.',
  '',
  '사람이 결과를 훑어보고 "이거 말고 저거"라고 말하기 위한 화면이고, AI 도구가 한 번의 스크린샷으로',
  `모듈의 선택지를 전부 확인하기 위한 화면이기도 합니다 — ${code('docs/ROADMAP.md')}의 "데모는 검수 화면이다" 원칙을 따릅니다.`,
  '',
  '## 세 가지 미리보기 방식',
  '',
  `| 방식 | 뜻 | 모듈 | variant |`,
  '|---|---|---|---|',
  ...['grid', 'control', 'link'].map((mode) => {
    const entries = Object.entries(catalog).filter(([, entry]) => entry.preview === mode);
    const count = entries.reduce((sum, [, entry]) => sum + entry.variants.length, 0);
    const meaning = mode === 'grid'
      ? '같은 소재를 variant 수만큼 복제해 살아 있는 상태로 나란히 보여 줍니다.'
      : mode === 'control'
        ? '데모가 이미 variant마다 컨트롤을 갖고 있어, 시트가 그 컨트롤을 대신 눌러 줍니다.'
        : '한 페이지에 여러 개를 둘 수 없거나 옵션 하나로 켤 수 없어, 이유를 적고 모듈 데모로 보냅니다.';
    return `| ${code(mode)} (${PREVIEW_LABEL[mode]}) | ${meaning} | ${entries.length}개 | ${count}개 |`;
  }),
  '',
  `${gridVariants}/${totalVariants} variant가 시트 안에서 그대로 살아 움직입니다. 나머지는 왜 그럴 수 없는지가 아래 표에 적혀 있습니다.`,
  '',
  '## 모듈별',
  '',
  '| 모듈 | 방식 | variant를 켜는 법 | variant 수 | 비고 |',
  '|---|---|---|---|---|',
  ...Object.entries(catalog).map(([name, entry]) => {
    const how = entry.preview !== 'grid'
      ? '—'
      : entry.carrier === 'activation'
        ? code(`${entry.attribute}="<variant>"`)
        : code(`${entry.carrierAttribute}="<variant>"`);
    const note = entry.reason
      ? esc(entry.reason)
      : (entry.deprecatedVariants.length ? `지원 중단 예정: ${entry.deprecatedVariants.map(code).join(', ')}` : '');
    return `| ${code(name)} | ${code(entry.preview)} | ${how} | ${entry.variants.length} | ${note} |`;
  }),
  '',
  '## 소재는 어디서 오나',
  '',
  '시트는 소재를 새로 만들지 않고 **데모가 이미 authoring 해 둔 것을 복제**합니다. 그래서 비교 화면이',
  '실제 데모와 어긋날 수 없습니다. 고르는 순서는 이렇습니다.',
  '',
  `1. ${code('data-demo-specimen="<module>"')} 이 붙은 요소 — 비교용 소재를 직접 지정하고 싶을 때만 씁니다.`,
  `2. 그 모듈의 홈 카드(${code('data-demo-home')}) 안에 있는 인스턴스.`,
  '3. 그 밖에 데모에 있는 같은 모듈의 인스턴스(문서 순서).',
  '',
  `variant 마다 요구 조건(${code('variantRequires')})이 다를 수 있으므로 — 예를 들어 Glitch의 ${code('rgb')}는 텍스트가,`,
  `${code('datamosh')}는 이미지가 필요합니다 — 시트는 위 순서에서 **그 요구 조건을 만족하는 첫 소재**를 씁니다.`,
  '',
  '| 요구 조건 | 뜻 |',
  '|---|---|',
  ...Object.entries(contract.variantCapabilities).map(([key, text]) => `| ${code(key)} | ${esc(text)} |`),
  '',
  '복제한 소재에서는 이 모듈의 variant를 나르는 옵션 속성을 먼저 지우고(그대로 두면 authoring된 값이',
  '우리가 지정한 variant를 이깁니다), 그 variant로 authoring된 인스턴스가 데모에 있으면 그 인스턴스의',
  '옵션만 다시 입혀 줍니다. 결과적으로 **소재는 같고, 옵션은 그 variant에 맞게 다듬어진** 타일이 됩니다.',
  '',
  '## 새 variant를 추가할 때',
  '',
  `1. ${code('kineto.features.json')} 에 variant를 추가합니다(계약 생성기가 채웁니다).`,
  `2. ${code('npm run test:variant-compare')} 를 돌립니다.`,
  '3. 떨어지면 셋 중 하나를 합니다 — 데모에 소재를 하나 추가하거나, 전용 컨트롤에',
  `   ${code('data-demo-variant="<module>:<variant>"')} 를 붙이거나, 나란히 볼 수 없는 이유를`,
  `   ${code('scripts/generate-variant-catalog.mjs')} 에 적습니다.`,
  '',
  '조용히 빠지는 경로는 없습니다.',
  ''
].join('\n');

const check = process.argv.includes('--check');
let failed = false;
for (const [url, expected] of [[demoUrl, demoText], [docsUrl, docsText]]) {
  const current = await readFile(url, 'utf8').catch(() => '');
  if (check) {
    if (current !== expected) {
      console.error(`${url.pathname.replace(root, '')} is out of sync. Run: node scripts/generate-variant-catalog.mjs`);
      failed = true;
    }
  } else {
    await writeFile(url, expected);
  }
}
if (check && failed) process.exitCode = 1;
else if (check) console.log(`variant catalog in sync — ${Object.keys(catalog).length} modules / ${totalVariants} variants.`);
else console.log(`Generated the variant catalog: ${Object.keys(catalog).length} modules, ${totalVariants} variants, ${gridVariants} of them live side by side.`);
