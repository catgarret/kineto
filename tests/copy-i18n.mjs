import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

const root = path.resolve(import.meta.dirname, '..');
const html = fs.readFileSync(path.join(root, 'demo/index.html'), 'utf8');
const demoMain = fs.readFileSync(path.join(root, 'demo/main.js'), 'utf8');
const document = new JSDOM(html).window.document;
const context = { window: {} };

vm.runInNewContext(
  fs.readFileSync(path.join(root, 'demo/copy-i18n.js'), 'utf8'),
  context
);
for (const file of ['help-i18n.js', 'help-i18n-extra.js', 'playground-i18n.js']) {
  vm.runInNewContext(
    fs.readFileSync(path.join(root, 'demo', file), 'utf8'),
    context
  );
}

const copy = context.window.KINETO_COPY_I18N;
const help = context.window.MK_HELP_I18N;
const playgroundUi = context.window.KINETO_PLAYGROUND_I18N;
const languages = ['en', 'ja', 'zh-CN', 'zh-TW', 'ru', 'it'];
const clean = (value) => value.replace(/\s+/g, ' ').trim();
const descriptions = [...new Set(
  [...document.querySelectorAll([
    'main .card > p',
    'main .scroll-demo-unit > p',
    'main .hscroll-demo-unit > p',
    'main .sticky-stack-unit > p',
    'main .reveal-demo-card > p',
    'main .glow-demo > div > p'
  ].join(','))]
    .filter((node) => /[가-힣]/.test(node.textContent))
    .map((node) => clean(node.textContent))
)];
const titles = [...new Set(
  [...document.querySelectorAll('article.card > h3')]
    .filter((node) => /[가-힣]/.test(node.textContent))
    .map((node) => clean(node.textContent))
)];

assert.deepEqual([...copy.languages], languages);
for (const key of [
  '본문으로 건너뛰기', '맨 위로 이동', '사이트맵', '테마 전환', '언어 선택',
  '모듈 목록', '모듈 검색', '닫기', '내려받는 중', '{value}% 완료'
]) {
  assert.equal(copy.ui[key]?.length, languages.length, `missing localized demo UI: ${key}`);
}
assert.match(
  demoMain,
  /\['button\.kt-progress-ring','맨 위로'\]/,
  'the generated back-to-top ring must join the locale refresh contract'
);
// 모듈 옵션으로 들어가는 문구는 마크업이 선언하고, main.js 의 한 패스가 언어를 바꿀 때마다
// 그 값을 다시 씁니다. 예전에는 모듈마다 JS 에 선택자를 적어 두었는데, 그러면 새 사례가
// 생길 때마다 특수 처리가 하나씩 늘고 빠뜨리기도 쉬웠습니다. 여기서는 구현 한 줄이 아니라
// **약속**을 검사합니다 — 선언이 실제로 있고, 그 문구가 모든 언어로 번역되어 있는지.
assert.match(
  demoMain,
  /querySelectorAll\('\[data-demo-i18n-option\]'\)/,
  'main.js must apply the declared option translations on every language change'
);
const optionDeclarations = [...document.querySelectorAll('[data-demo-i18n-option]')];
assert.ok(optionDeclarations.length > 0, 'the demo must declare at least one translated module option');
for (const node of optionDeclarations) {
  const key = node.getAttribute('data-demo-i18n-option');
  const attribute = node.getAttribute('data-demo-i18n-option-attr');
  assert.ok(attribute?.startsWith('data-kt-'), `data-demo-i18n-option="${key}" must name the data-kt-* option that carries it`);
  assert.equal(node.getAttribute(attribute), key, `${attribute} must start out holding the authored Korean copy for "${key}"`);
  assert.equal(copy.ui[key]?.length, languages.length, `a translated module option needs every language: ${key}`);
}
assert.ok(
  optionDeclarations.some((node) => node.getAttribute('data-demo-i18n-option-attr') === 'data-kt-label' && node.hasAttribute('data-kt-click-to-top')),
  'the back-to-top ring must retain the locale across auto-init replacement'
);
// Two tabbed pairs replace four descriptions with two; Wave and Film Grain add
// two dedicated Lazy examples; the date-time demo now has four explicit modes;
// the native Scroll Snap slider adds one translated description; CSS Scroll
// adds one translated mixed-language title for its native/fallback comparison.
// Six Slider and seventeen Reveal comparisons plus one Wave playback card.
// Stylize contributes six cards (living grain, ASCII shuffle, pointer lens,
// colour diffusion, halftone video scan, and the lazy-load dither reveal).
// 2026-09-20: the `radial` compatibility card is gone. It only restated that
// `data-kt-radial` is another way into Slider's radial effect, which made the
// demo show the same carousel twice; the Radial Carousel card now carries the
// `radial` home and declares itself that module's comparison material.
// The last seven variants without dedicated markup got cards of their own: Lazy
// data-mosaic and rgb-slice-burst, Cursor blob, and Glitch noise, crt, reveal
// and rgb-slice-burst (docs/variant-distinctness.md). Stylize adds a rotated
// print screen so the halftone angle has a card of its own.
// 2026-09-20: the Squircle module adds two cards — the iOS corner comparison
// and the other corner-shape keywords. 2026-09-21: Card Glow's `glass` variant
// adds the Liquid Glass pane, and FLIP's `fold` adds the opening-panel card.
assert.equal(descriptions.length, 188);
// 18 since the Korean-titled `radial` compatibility card was removed (see above).
assert.equal(titles.length, 21);

for (const [label, values, dictionary] of [
  ['card description', descriptions, copy.cards],
  ['mixed-language title', titles, copy.titles]
]) {
  for (const source of values) {
    assert.ok(dictionary[source], `missing ${label} translation: ${source}`);
    assert.equal(dictionary[source].length, languages.length, `${label}: ${source}`);
    assert.ok(
      dictionary[source].every((value) => typeof value === 'string' && value.trim()),
      `empty ${label} translation: ${source}`
    );
  }
}

assert.ok(
  descriptions.every((description) => [...description].length <= 48),
  'Korean card descriptions must stay concise enough for two lines'
);

for (const language of languages) {
  const sectionCopy = copy.langs[language];
  assert.ok(sectionCopy, `missing section copy: ${language}`);
  for (const key of [
    'counter',
    'lazy',
    'content-reveal',
    'pointer',
    'components',
    'buttons-feedback',
    'loading',
    'module-index',
    '_hero',
    '_chips',
    '_support',
    '_footerBrand'
  ]) {
    assert.ok(sectionCopy[key], `missing ${language} section copy: ${key}`);
  }
}

const flattenHelp = (locale) => Object.fromEntries(
  Object.entries(locale).flatMap(([module, options]) =>
    Object.entries(options).map(([option, value]) => [`${module}.${option}`, value])
  )
);
const koreanHelpKeys = Object.keys(flattenHelp(help.ko)).sort();
for (const language of ['ko', ...languages]) {
  const localized = flattenHelp(help[language]);
  assert.deepEqual(
    Object.keys(localized).sort(),
    koreanHelpKeys,
    `${language} option-help translations are incomplete`
  );
  assert.ok(
    Object.values(localized).every((value) => typeof value === 'string' && value.trim()),
    `${language} option-help translations contain an empty value`
  );
  assert.deepEqual(
    Object.keys(playgroundUi[language]).sort(),
    Object.keys(playgroundUi.ko).sort(),
    `${language} playground chrome translations are incomplete`
  );
}
for (const language of ['ja', 'zh-CN', 'zh-TW', 'ru', 'it']) {
  for (const option of ['separatorColor', 'seamColor', 'shadow']) {
    assert.notEqual(
      help[language].counter[option],
      help.en.counter[option],
      `${language} counter.${option} still falls back to English`
    );
  }
}

const featureNames = JSON.parse(
  fs.readFileSync(path.join(root, 'kineto.features.json'), 'utf8')
).modules.map((module) => module.name).sort();
const readmes = [
  'README.md',
  'i18n/README.ko.md',
  'i18n/README.jp.md',
  'i18n/README.zh-CN.md',
  'i18n/README.zh-TW.md',
  'i18n/README.ru.md',
  'i18n/README.it.md'
];

for (const file of readmes) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const documented = [...source.matchAll(/^\| `([^`]+)` \| `data-kt-[^`]+` \|/gm)]
    .map((match) => match[1])
    .sort();
  assert.deepEqual(documented, featureNames, `${file} module table is stale`);
  assert.doesNotMatch(source, /\b45\b/, `${file} contains the stale module count`);
  assert.doesNotMatch(
    source,
    /AI (?:vibe-coding|바이브코딩)|バイブコーディング|氛围编程|氛圍編程/i,
    `${file} contains unrelated AI-production copy`
  );
}

console.log(
  `copy-i18n OK — ${descriptions.length} card descriptions, `
  + `${titles.length} titles, ${koreanHelpKeys.length} option-help strings, `
  + `${readmes.length} synchronized READMEs.`
);
