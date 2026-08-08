<div align="center">

<img src="../assets/logo.svg" width="72" height="72" alt="Kineto">

# Kineto

**옵션을 실시간으로 조절하고 완성된 코드를 복사하는 웹 모션
라이브러리입니다.**

[English](../README.md) · 한국어 · [日本語](README.jp.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Русский](README.ru.md) · [Italiano](README.it.md)

<p><a href="https://www.npmjs.com/package/@dong-gri/kineto"><img src="https://img.shields.io/npm/v/@dong-gri/kineto.svg" alt="npm" height="20"></a>&nbsp;&nbsp;<a href="../LICENSE"><img src="https://img.shields.io/npm/l/@dong-gri/kineto.svg" alt="license" height="20"></a>&nbsp;&nbsp;<a href="https://www.jsdelivr.com/package/npm/@dong-gri/kineto"><img src="https://img.shields.io/jsdelivr/npm/hm/@dong-gri/kineto.svg" alt="jsDelivr" height="20"></a></p>

[라이브 데모](https://kineto.dongri.me) · [모듈 레퍼런스](../docs/module-reference.md) · [AI 프롬프트 가이드](../AI-PROMPT-GUIDE.md) · [기능 계약](../FEATURE_CONTRACT.md)

</div>

---

Kineto는 모션·미디어·스크롤·텍스트·UI를 다루는 51개 모듈을
제공합니다.
`data-kt-*` 속성 하나로 적용하거나 JavaScript API로 세밀하게
제어할 수 있습니다.
지원하지 않는 환경에서는 효과만 끄고 콘텐츠는 그대로 표시합니다.

> AI 코딩 도구를 사용한다면 [AI 프롬프트 가이드](../AI-PROMPT-GUIDE.md)의
> 지침을 바로 붙여 넣어 사용할 수 있습니다.

<img src="https://cdn.jsdelivr.net/gh/catgarret/kineto@main/assets/preview/kineto.gif" width="620" alt="Kineto Preview">

## 대표 기능

모든 효과는 [라이브 데모](https://kineto.dongri.me)에서
바로 조절할 수 있습니다.
완성된 HTML·JavaScript 코드도 함께 복사할 수 있습니다.

**Progressive Print** — 블러와 미세 노이즈가 걷히며 이미지가
선명해집니다.

<img src="https://cdn.jsdelivr.net/gh/catgarret/kineto@main/assets/preview/print.gif" width="620" alt="Progressive Print">

**Card Glow** — 포인터를 따라 스포트라이트·표면 반사·외곽광이
움직입니다.

<img src="https://cdn.jsdelivr.net/gh/catgarret/kineto@main/assets/preview/cardglow.gif" width="620" alt="Card Spotlight and Reflection">

**Text Transition** — 슬라이드·블러·디졸브·시머로 문구를
전환합니다.

<img src="https://cdn.jsdelivr.net/gh/catgarret/kineto@main/assets/preview/texttransition.gif" width="620" alt="Text Transition">

**Scroll Velocity** — 스크롤 속도와 방향에 따라 요소를
이동·회전·변형합니다.

<img src="https://cdn.jsdelivr.net/gh/catgarret/kineto@main/assets/preview/scrollvelocity.gif" width="620" alt="ScrollVelocity">

**Lightbox** — 그룹 이동·확대·미니맵을 지원하는 전체 화면 이미지
뷰어입니다.

<img src="https://cdn.jsdelivr.net/gh/catgarret/kineto@main/assets/preview/lightbox.gif" width="620" alt="Lightbox">

전체 51개 모듈은 아래 [모듈 목록](#모듈)을 참고하세요.

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

### CDN (빌드 도구 없음)

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

### iOS 전체 화면

로더와 페이지 전환을 노치와 홈 바까지 채우려면 viewport 메타에
`viewport-fit=cover`를 추가하세요.

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

## 모션 엔진

Kineto는 GSAP과 Lenis를 번들에 포함하지 않습니다.
필요한 효과를 처음 사용할 때 CDN에서 불러오며, 페이지에 이미 있는
인스턴스가 있으면 그대로 사용합니다.
CDN을 사용할 수 없으면 정적 콘텐츠를 유지하고 표준 동작으로
대체합니다.
기본 CDN 엔진은 SHA-384 무결성 검증을 사용합니다. 엔진 URL을 바꾸면 해당 파일의 integrity 값도 함께 설정해야 합니다.

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
| `ambientMedia` | `data-kt-ambient-media` | 미디어에서 추출한 주변광 |
| `blurText` | `data-kt-blur-text` | 글자별 블러 진입 |
| `brushReveal` | `data-kt-brush-reveal` | 포인터 브러시 마스크 |
| `cardGlow` | `data-kt-card-glow` | 포인터 스포트라이트·반사·외곽광 |
| `counter` | `data-kt-counter` | 숫자 카운트·플립·시계·카운트다운 |
| `dateTime` | `data-kt-date-time` | 서버 날짜의 상대 시간·절대 시간 표기 |
| `cssScroll` | `data-kt-css-scroll` | CSS 변수·스크롤 타임라인 연동 |
| `cursor` | `data-kt-cursor` | 11가지 커스텀 커서 |
| `fullpage` | `data-kt-fullpage` | 세로·가로·혼합축 풀페이지 |
| `glitch` | `data-kt-glitch` | RGB 슬라이스·픽셀 글리치 |
| `lazy` | `data-kt-lazy` | 스켈레톤·픽셀·프린트·디졸브 로딩 |
| `lightbox` | `data-kt-lightbox` | 그룹·확대·미니맵 전체 화면 뷰어 |
| `loader` | `data-kt-loader` | 실제 진행률 연동 로더 |
| `loadingIndicator` | `data-kt-loading-indicator` | 인라인 스피너·바·시머·기호 인디케이터 |
| `magnetic` | `data-kt-magnetic` | 포인터 자석 반응 |
| `marquee` | `data-kt-marquee` | 연속 마퀴 |
| `mouseParallax` | `data-kt-mouse-parallax` | 포인터·자이로 패럴럭스 |
| `overflowText` | `data-kt-overflow-text` | 넘치는 텍스트 처리 |
| `pageReveal` | `data-kt-page-reveal` | 페이지 진입 오버레이 |
| `pageTransition` | `data-kt-page-transition` | 동일 출처 페이지 전환 |
| `parallax` | `data-kt-parallax` | 스크롤 패럴럭스 |
| `progress` | `data-kt-progress` | 읽기 진행률 바·링 |
| `reveal` | `data-kt-reveal` | 스크롤 진입 리빌 |
| `ripple` | `data-kt-ripple` | 클릭 리플 |
| `scrollSequence` | `data-kt-scroll-sequence` | 이미지 시퀀스 스크럽 |
| `scrollVelocity` | `data-kt-scroll-velocity` | 스크롤 속도·방향 반응 |
| `slider` | `data-kt-slider` | 슬라이드·커버플로우·스택·원형 캐러셀 |
| `radial` | `data-kt-radial` | 기존 원형 캐러셀 호환 진입점 |
| `stickyStack` | `data-kt-sticky-stack` | 세로·가로·플로팅 스티키 스택 |
| `textFill` | `data-kt-text-fill` | 스크롤 텍스트 채우기 |
| `textReveal` | `data-kt-text-reveal` | 셔플·디코드·한글 조합 리빌 |
| `textSplit` | `data-kt-text-split` | 글자·단어 분할 모션 |
| `textTransition` | `data-kt-text-transition` | 문구 교체 전환 |
| `tilt` | `data-kt-tilt` | 3D 틸트·글레어·그림자 |
| `typewriter` | `data-kt-typewriter` | 한글 조합 타이핑 |
| `vibrate` | `data-kt-vibrate` | 햅틱 진동 피드백 |
| `confetti` | `data-kt-confetti` | 클릭·진입 색종이 효과 |
| `accordion` | `data-kt-accordion` | 접근성을 지원하는 details 아코디언 |
| `hold` | `data-kt-hold` | 길게 누르기·연타 확인 게이지 |
| `megaMenu` | `data-kt-mega-menu` | 키보드·ARIA 메가 메뉴 |
| `toast` | `data-kt-toast` | 상태 토스트 알림 |
| `bottomSheet` | `data-kt-bottom-sheet` | 포커스 고정을 지원하는 바텀 시트 |
| `tabs` | `data-kt-tabs` | WAI-ARIA 탭·세그먼트 컨트롤 |
| `coverReveal` | `data-kt-cover-reveal` | 색상 커버 리빌 |
| `gesture` | `data-kt-gesture` | 호버·누름 스프링 피드백 |
| `drag` | `data-kt-drag` | 관성·경계·스냅백 드래그 |
| `tooltip` | `data-kt-tooltip` | 위치 자동 보정 툴팁 |
| `switch` | `data-kt-switch` | 폼에서 사용하는 접근성 스위치 |
| `flip` | `data-kt-flip` | 정렬·추가·삭제 FLIP 전환 |
| `scrollShadows` | `data-kt-scroll-shadows` | 스크롤 가장자리 그림자 |
| `stickyHeader` | `data-kt-sticky-header` | 축소·커버형 고정 헤더 |
| `horizontalScroll` | `data-kt-horizontal-scroll` | 고정형 가로 스크롤 |

각 모듈의 variant와 옵션 전체 목록은 [모듈 레퍼런스](../docs/module-reference.md)와 `kineto.features.json`을 참고하세요.

## 프레임워크 어댑터

Kineto는 전체 패키지, 모듈형 core/module import, React·Vue·jQuery
어댑터용 공식 TypeScript 선언을 함께 제공합니다. 모듈 옵션은 사용자 정의
모듈과 새 옵션을 타입 단언 없이 쓸 수 있도록 확장 가능한 형태로 유지합니다.

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

최신 Chrome·Edge·Firefox·Safari의 데스크톱과 모바일 버전을
지원합니다.
동작 줄이기 설정에서는 애니메이션 없이 최종 상태를 표시합니다.

## 빌드

```bash
npm install
npm run build   # dist/ 생성
npm run ci      # lint · build · Node/Chromium 테스트 · 계약/패키지 검증
npm run verify  # 전체 CI 검증 + 의존성 보안 감사
```

## 라이선스

MIT © [dongri.me](https://dongri.me)
