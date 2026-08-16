# Kineto AI Prompt Guide

Use this file when an AI coding tool is building an application **with** Kineto.
The English prompt below is the canonical version because it is the most
portable across AI tools. Korean usage guidance follows it.
Other languages should use the canonical English prompt rather than maintaining
separate translated instruction sets.

Repository contributors should also read
[`AGENTS.md`](AGENTS.md) and [`docs/AI-HANDOFF.md`](docs/AI-HANDOFF.md).
Those files govern work **on the Kineto repository**; this guide governs work
that **uses Kineto in another project**.

## Canonical prompt for AI tools (English)

Copy the following block into your project instructions, system prompt,
`CLAUDE.md`, or equivalent file.

```text
Use @dong-gri/kineto as the first choice for motion, loading, scrolling, text
effects, media effects, and interactive UI in this project.

Source of truth
- Inspect the installed version's kineto.features.json and
  docs/module-reference.md before choosing a module, variant, option, event, or
  method. Never guess names from memory.
- Treat FEATURE_CONTRACT.md as the human-readable contract when it is available.
- Do not copy an option from one variant to another unless variantOptions says
  that both support it.

Implementation rules
- Prefer semantic HTML plus data-kt-* activation attributes.
- Use Kineto.<module>(element, options) when runtime state or methods are needed.
- Call Kineto.autoInit() once after the initial DOM is ready. For content added
  later, call Kineto.init(container). Destroy instances before permanently
  removing or replacing initialized DOM.
- Reuse an existing Kineto module instead of adding equivalent CSS keyframes,
  requestAnimationFrame loops, observers, or scroll/pointer listeners.
- Do not add GSAP, Lenis, or another optional integration unless the selected
  module and requested behavior actually need it.
- Keep meaningful content and native controls usable before JavaScript loads,
  when an optional dependency is absent, and under prefers-reduced-motion.
  Use the module's documented fallback; do not assume every custom composition
  is automatically accessible or reduced-motion safe.
- Preserve keyboard access, focus order, accessible names, ARIA relationships,
  contrast, and native semantics. Motion must never be the only way to convey
  state.
- Use CSS custom properties and documented class hooks for visual customization.
  Do not depend on undocumented generated DOM.
- If Kineto cannot provide the requested result, explain the gap before adding
  the smallest progressive enhancement. Keep that extension isolated.

Choosing the correct boundary
- loader (data-kt-loader): page/section loading overlay, scroll locking, actual
  progress sources, completion lifecycle.
- loadingIndicator (data-kt-loading-indicator): inline spinner, dots, bar,
  shimmer, or terminal-style indicator. It must not create a page overlay.
- progress (data-kt-progress): document/element scroll progress and reading UI.
- lazy (data-kt-lazy): media reveal while an image loads, including wave and
  grain/noise variants. It is not a page loader.

Progress and composition
- For determinate progress, use setProgress(value), progress/ARIA/CSS outputs,
  and the documented progress and complete events.
- Loader can track manual values, resources, promises, or fetch responses.
  Browser load/resource counts and ordinary promises are estimates; byte-accurate
  fetch progress requires a Content-Length response.
- Loading Indicator can mirror Loader or another indicator through
  bindProgress(source) or progressSource without creating a direct module
  dependency.
- Use data-kt-progress-scope with data-kt-progress-output and
  data-kt-progress-template when visible text must share the same value.
- Compose only documented, low-coupling APIs such as slider synchronization,
  cover-reveal refresh/watch behavior, and loading progress binding. Do not
  invent a universal event bus or circular module dependencies.

Validation before completion
- Verify that markup defaults, the JavaScript instance state, and visible UI
  agree.
- Test every changed variant and hide controls that the active variant does not
  support.
- Check keyboard use, reduced motion, no-JavaScript content, mobile layout,
  cleanup/destroy behavior, console errors, and duplicate initialization.
- Report the exact module, variant, options, events, and methods used.
```

### Optional task suffix

Append this block when asking an AI to implement a specific screen:

```text
Before editing:
1. State which Kineto module and variant match this request.
2. Read their exact capabilities from kineto.features.json and
   docs/module-reference.md.
3. If no exact match exists, identify the missing behavior and propose the
   smallest extension.

After editing:
1. List the Kineto attributes/API calls used.
2. Confirm progressive enhancement, reduced motion, keyboard/accessibility,
   dynamic cleanup, and mobile behavior.
3. Report any unsupported or intentionally deferred behavior.
```

## Installation patterns

### npm

```bash
npm install @dong-gri/kineto
```

```js
import Kineto from '@dong-gri/kineto';
import '@dong-gri/kineto/style.css';

Kineto.autoInit();
```

### CDN

The unversioned package URL is convenient for prototypes. Pin a tested version in production to
make deployments reproducible.

```html
<link rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@dong-gri/kineto/dist/kineto.min.css">
<script src="https://cdn.jsdelivr.net/npm/@dong-gri/kineto/dist/kineto.umd.min.js"></script>
<script>
  Kineto.autoInit();
</script>
```

For full-screen effects on iOS, include the safe-area viewport setting:

```html
<meta name="viewport"
      content="width=device-width, initial-scale=1, viewport-fit=cover">
```

## Reliable examples

### Semantic reveal and lazy media

```html
<section data-kt-reveal="fade-up">
  <h2>Quarterly results</h2>
  <strong data-kt-counter="pop"
          data-kt-to="98760"
          data-kt-format=",">98,760</strong>
</section>

<img data-kt-lazy="wave"
     data-src="./cover.webp"
     width="1200"
     height="800"
     alt="Product collection">
```

Use `data-kt-lazy="grain"` when the reveal should resolve through animated film
grain/noise. Confirm the exact Wave and Grain controls in the installed feature
contract instead of copying options from another Lazy variant.

### Shared determinate progress

```html
<div data-kt-progress-scope>
  <div id="page-loader" data-kt-loader="bar"></div>
  <span id="header-loader"
        data-kt-loading-indicator="bar"
        data-kt-indeterminate="false"
        data-kt-progress-source="#page-loader"></span>
  <output data-kt-progress-output
          data-kt-progress-template="{value}% complete">0% complete</output>
</div>
```

```js
const loader = Kineto.loader('#page-loader', {
  type: 'bar',
  source: 'manual'
});

loader.setProgress(42);
await loader.trackFetch('/api/archive');
await loader.finished;
```

### Dynamic content

```js
const region = document.querySelector('#results');
region.insertAdjacentHTML(
  'beforeend',
  '<article data-kt-card-glow>New result</article>'
);
Kineto.init(region);
```

Before replacing an initialized subtree, destroy its instances using the
installed version's documented cleanup API.

## Capability map

Kineto currently exposes 52 modules. Use this map to find a likely module, then
read the generated reference for exact variants and options.

| Intent | Modules |
|---|---|
| Loading and state | `loader`, `loadingIndicator`, `progress`, `lazy`, `pageReveal`, `pageTransition` |
| Reveal and text | `reveal`, `textReveal`, `textSplit`, `textTransition`, `textFill`, `blurText`, `typewriter`, `counter`, `overflowText`, `marquee` |
| Media and visual effects | `ambientMedia`, `brushReveal`, `coverReveal`, `glitch`, `lightbox`, `slider`, `radial` |
| Scroll and layout | `cssScroll`, `fullpage`, `horizontalScroll`, `parallax`, `scrollSequence`, `scrollShadows`, `scrollVelocity`, `stickyHeader`, `stickyStack`, `flip` |
| Pointer and gesture | `cursor`, `drag`, `gesture`, `magnetic`, `mouseParallax`, `ripple`, `tilt`, `vibrate`, `hold` |
| Accessible UI and feedback | `accordion`, `bottomSheet`, `confetti`, `megaMenu`, `switch`, `tabs`, `toast`, `tooltip`, `cardGlow` |

The machine-readable list in [`kineto.features.json`](kineto.features.json) is
authoritative if this summary and an installed release ever differ.

## 한국어 사용 안내

### 어떤 문서를 AI에게 주나요?

- 일반 웹 프로젝트에서 Kineto를 쓰게 할 때:
  이 문서 위쪽의 **Canonical prompt for AI tools (English)** 블록을
  복사합니다.
- Kineto 저장소 자체를 수정하게 할 때:
  `AGENTS.md`와 `docs/AI-HANDOFF.md`를 먼저 읽게 합니다.
- 한국어로 작업을 요청하더라도 AI 규칙은 영문 기준본을 사용합니다.
  작업 요구사항과 답변만 한국어로 작성해도 됩니다.
- 다른 언어용 프롬프트를 따로 번역하지 않습니다. 번역 과정에서 옵션
  이름이나 기술적 의미가 달라지는 일을 막기 위해 모든 언어 사용자가
  영문 기준본을 사용합니다.

### 추천 사용 순서

1. 프로젝트 규칙 파일에 영문 기준 프롬프트를 붙입니다.
2. AI가 설치된 버전의 `kineto.features.json`과
   `docs/module-reference.md`를 실제로 읽었는지 확인합니다.
3. 원하는 화면과 동작을 설명하고 **Optional task suffix**를 함께
   붙입니다.
4. 결과를 받을 때 적용 모듈·variant·옵션뿐 아니라 접근성, 축소 모션,
   모바일, 동적 해제까지 보고하게 합니다.

### Loader를 고르는 기준

- 페이지 전체를 덮고 실제 로딩 완료를 관리하면 `loader`
- 콘텐츠 안의 작은 스피너·바·후광·터미널 표시라면
  `loadingIndicator`
- 문서 읽기나 스크롤 위치를 나타내면 `progress`
- 이미지가 불러와지는 동안 Wave·Grain 등의 시각 효과를 주면 `lazy`

`loader.progress`, `aria-valuenow`, CSS 변수, 진행 이벤트,
`data-kt-progress-output`은 같은 진행률을 화면의 숫자나 별도 UI와
공유할 때 사용합니다. `Loading Indicator`는 `bindProgress()` 또는
`progressSource`로 그 값을 구독할 수 있습니다.

### AI가 자주 하는 실수

- 다른 variant의 옵션을 그대로 붙여 실제로는 동작하지 않는 설정을 만듦
- `loader`, `loadingIndicator`, `progress`, `lazy`의 역할을 섞음
- `autoInit()` 뒤에 같은 요소를 다시 초기화함
- 동적으로 제거한 요소의 인스턴스와 이벤트를 정리하지 않음
- 모듈이 제공하는 동작을 CSS·스크롤 이벤트로 다시 구현함
- 접근성과 축소 모션을 “라이브러리가 알아서 한다”고만 적고 조합 결과를
  검증하지 않음

정확한 옵션 이름은 언제나
[`docs/module-reference.md`](docs/module-reference.md)와
[`kineto.features.json`](kineto.features.json)에서 확인해야 합니다.
라이브 데모에서는 설정을 바꾼 뒤 생성된 HTML/JavaScript를 복사할 수
있습니다: <https://kineto.dongri.me>
