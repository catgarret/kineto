<div align="center">

<img src="assets/logo.svg" width="72" height="72" alt="Kineto">

# Kineto

**실시간으로 조절하고 코드를 그대로 복사해 쓰는 웹 모션 라이브러리 — 바닐라 JS · React · Vue · jQuery 지원.**

[English](README.md) · 한국어 · [日本語](README.jp.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Русский](README.ru.md) · [Italiano](README.it.md)

[![npm](https://img.shields.io/npm/v/@dong-gri/kineto.svg)](https://www.npmjs.com/package/@dong-gri/kineto) [![license](https://img.shields.io/npm/l/@dong-gri/kineto.svg)](LICENSE) [![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/@dong-gri/kineto.svg)](https://www.jsdelivr.com/package/npm/@dong-gri/kineto)

[라이브 데모](https://git.dongri.me/example/kineto) · [모듈 레퍼런스](docs/module-reference.md) · [AI 프롬프트 가이드](AI-PROMPT-GUIDE.md) · [기능 계약](FEATURE_CONTRACT.md)

</div>

---

> **Kineto** — 이름은 “운동·움직임”을 뜻하는 그리스어 *kínēsis*(키네시스)에서 유래한 *kinetic*(키네틱)에서 따왔습니다. 웹의 모션을 다루는 라이브러리에 어울리는 이름입니다.

Kineto은 34개의 인터랙션 모듈(모션·미디어·스크롤·로더·텍스트)을 `data-kt-*` 속성 하나로 붙이거나 JavaScript API로 세밀하게 제어할 수 있는 라이브러리입니다. 코어는 외부 의존성이 없으며, 미지원 브라우저나 저사양 기기에서는 효과만 비활성화되고 콘텐츠는 그대로 유지됩니다.

> AI 코딩 도구(Cursor, Claude 등)로 작업한다면 [AI 프롬프트 가이드](AI-PROMPT-GUIDE.md)를 참고하세요. 모션·인터랙션을 Kineto 모듈로 우선 적용하도록 지시하는, 그대로 붙여넣는 프롬프트가 들어 있습니다.

<img src="https://cdn.jsdelivr.net/gh/catgarret/kineto@main/assets/preview/kineto.gif" width="620" alt="Kineto Preview">

## 대표 기능

모든 효과는 [라이브 데모](https://git.dongri.me/example/kineto)에서 옵션을 바꿔 Apply를 누르면 바로 확인하고, 결과 HTML·JavaScript를 복사해 쓸 수 있습니다.

**Progressive Print** — `lazy`. 잉크젯 인쇄처럼 줄 단위로, 저해상도에서 고해상도로 이미지가 차오릅니다.

<img src="https://cdn.jsdelivr.net/gh/catgarret/kineto@main/assets/preview/print.gif" width="620" alt="Progressive Print">

**Card Spotlight & Reflection** — `cardGlow`. 포인터를 따라가는 스포트라이트·표면 광택·발광 외곽선.

<img src="https://cdn.jsdelivr.net/gh/catgarret/kineto@main/assets/preview/cardglow.gif" width="620" alt="Card Spotlight and Reflection">

**Text Transition** — `textTransition`. 슬라이드·블러·스케일로 문구를 전환합니다.

<img src="https://cdn.jsdelivr.net/gh/catgarret/kineto@main/assets/preview/texttransition.gif" width="620" alt="Text Transition">

**ScrollVelocity** — `scrollVelocity`. 스크롤 속도·방향에 따라 요소를 스큐·스케일·이동합니다.

<img src="https://cdn.jsdelivr.net/gh/catgarret/kineto@main/assets/preview/scrollvelocity.gif" width="620" alt="ScrollVelocity">

**Lightbox** — `lightbox`. 그룹·확대·미니맵을 갖춘 전체화면 이미지 뷰어.

<img src="https://cdn.jsdelivr.net/gh/catgarret/kineto@main/assets/preview/lightbox.gif" width="620" alt="Lightbox">

전체 34개 모듈은 아래 [모듈 목록](#모듈)을 참고하세요.

## 설치

### npm

```bash
npm install @dong-gri/kineto
```

```js
import Kineto from '@dong-gri/kineto';
import '@dong-gri/kineto/style.css';

Kineto.autoInit();
```

### CDN (설치 없이 script 태그)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@dong-gri/kineto/dist/kineto.min.css">
<script src="https://cdn.jsdelivr.net/npm/@dong-gri/kineto/dist/kineto.umd.min.js"></script>
<script>
  Kineto.autoInit();
</script>
```

### CDN (ESM)

```js
import Kineto from 'https://cdn.jsdelivr.net/npm/@dong-gri/kineto/+esm';
```

## 빠른 시작

HTML 속성만으로 동작합니다.

```html
<h2 data-kt-text-reveal="stream">문장이 흐르듯 나타납니다</h2>
<strong data-kt-counter="pop" data-kt-to="98760" data-kt-format=",">98,760</strong>
<img data-kt-lazy="skeleton" data-src="./cover.webp" alt="Cover">
<section data-kt-reveal="fade-up">스크롤 진입 시 나타납니다</section>
```

동일한 기능을 JavaScript API로도 쓸 수 있습니다.

```js
Kineto.counter('#total', { preset: 'pop', to: 98760, format: ',' });
Kineto.reveal('.card', { preset: 'fade-up', stagger: 0.06 });
const lightbox = Kineto.lightbox('.gallery img', { group: 'work', minimap: true });
```

## 선택적 의존성

코어는 단독으로 동작합니다. 아래 라이브러리가 페이지에 있으면 자동으로 감지해 스크롤 스크럽(GSAP + ScrollTrigger)과 스무스 스크롤(Lenis)에 활용하고, 없으면 표준 API로 폴백합니다.

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js"></script>
```

스무스 스크롤은 기본 비활성화이며, 필요할 때만 켤 수 있습니다.

```js
Kineto.enableSmooth({ lerp: 0.08 });
Kineto.disableSmooth();
```

## 모듈

| 모듈 | 활성화 속성 | 용도 |
|---|---|---|
| `ambientMedia` | `data-kt-ambient-media` | 미디어 주변광(Ambient Glow) |
| `blurText` | `data-kt-blur-text` | 글자별 블러 리빌 |
| `brushReveal` | `data-kt-brush-reveal` | 포인터 브러시 마스크 리빌 |
| `cardGlow` | `data-kt-card-glow` | 포인터 스포트라이트·표면 반사·발광 외곽선 |
| `counter` | `data-kt-counter` | 숫자 카운트·플립·시계·카운트다운 |
| `cssScroll` | `data-kt-css-scroll` | CSS 변수·애니메이션 타임라인 스크롤 연동 |
| `cursor` | `data-kt-cursor` | 커스텀 커서 11종 |
| `fullpage` | `data-kt-fullpage` | 풀페이지 섹션 페이징(세로·가로·혼합축) |
| `glitch` | `data-kt-glitch` | RGB 슬라이스·글리치 리빌 |
| `lazy` | `data-kt-lazy` | 이미지 로딩 연출(스켈레톤·픽셀·프린트·디졸브) |
| `lightbox` | `data-kt-lightbox` | 전체화면 뷰어·그룹·확대·미니맵 |
| `loader` | `data-kt-loader` | 실제 진행률 연동 로더 |
| `magnetic` | `data-kt-magnetic` | 포인터 자석 반응 |
| `marquee` | `data-kt-marquee` | 무한 흐름 텍스트 |
| `mouseParallax` | `data-kt-mouse-parallax` | 포인터·자이로 패럴럭스 |
| `overflowText` | `data-kt-overflow-text` | 넘치는 텍스트 처리 8종 |
| `pageReveal` | `data-kt-page-reveal` | 페이지 진입 오버레이 |
| `pageTransition` | `data-kt-page-transition` | 동일 출처 페이지 전환 |
| `parallax` | `data-kt-parallax` | 스크롤 패럴럭스 |
| `progress` | `data-kt-progress` | 읽기 진행률 바·링 |
| `reveal` | `data-kt-reveal` | 스크롤 진입 리빌 |
| `ripple` | `data-kt-ripple` | 클릭 리플 |
| `scrollSequence` | `data-kt-scroll-sequence` | 이미지 시퀀스 스크럽 |
| `scrollVelocity` | `data-kt-scroll-velocity` | 스크롤 속도·방향 반응 |
| `shuffle` | `data-kt-shuffle` | 문자 셔플 디코드 |
| `slider` | `data-kt-slider` | 슬라이드·커버플로우 |
| `stickyStack` | `data-kt-sticky-stack` | 스티키 스택(세로·가로·플로팅) |
| `textFill` | `data-kt-text-fill` | 스크롤 텍스트 채움 |
| `textReveal` | `data-kt-text-reveal` | 텍스트 리빌(한글 조합 포함) |
| `textSplit` | `data-kt-text-split` | 글자·단어 분할 모션 |
| `textTransition` | `data-kt-text-transition` | 텍스트 교체 전환 |
| `tilt` | `data-kt-tilt` | 3D 틸트·글레어 |
| `typewriter` | `data-kt-typewriter` | 타이핑 효과 |
| `vibrate` | `data-kt-vibrate` | 햅틱 진동 피드백 |

각 모듈의 variant와 옵션 전체 목록은 [모듈 레퍼런스](docs/module-reference.md)와 `kineto.features.json`을 참고하세요.

## 프레임워크 어댑터

```jsx
import { Motion } from '@dong-gri/kineto/react';
<Motion as="h2" type="textReveal" options={{ mode: 'hangul' }}>안녕하세요</Motion>
```

```js
import KinetoVue from '@dong-gri/kineto/vue';
app.use(KinetoVue);
```

```js
import installKineto from '@dong-gri/kineto/jquery';
installKineto(window.jQuery);
$('.card').kineto('reveal', { preset: 'fade-up' });
```

## 브라우저 지원

Chrome, Edge, Firefox, Safari(데스크톱·모바일)의 최신 버전을 지원합니다. `prefers-reduced-motion`을 켜면 모든 모듈이 애니메이션 없이 최종 상태로 렌더링되며, 미지원 환경에서는 효과가 정적 콘텐츠로 자동 축소됩니다.

## 빌드

```bash
npm install
npm run build   # dist/ 생성
npm run verify  # lint · build · 테스트 · 계약 검증
```

## 라이선스

MIT © [dongri](https://dongri.me)
