# Getting Started

## 1. 설치

### npm package / local tarball

```bash
npm install @dong-gri/kineto
# 또는
npm install ./dong-gri-kineto-0.12.0.tgz
```

```js
import Kineto from '@dong-gri/kineto';
import '@dong-gri/kineto/style.css';

Kineto.autoInit();
```

### 브라우저 UMD

```html
<link rel="stylesheet" href="../dist/kineto.css">
<script src="../dist/kineto.umd.js"></script>
<script>
  Kineto.autoInit();
</script>
```

GSAP·Lenis는 UMD bundle에 포함하지 않습니다. 필요한 모듈에서만 설정된 CDN으로 불러오며, 페이지에 이미 같은 전역 객체가 있으면 기존 객체를 재사용합니다.

## 2. 첫 인터랙션

```html
<h1 data-kt-reveal="fade-up">안녕하세요</h1>
<span data-kt-counter="pop" data-kt-to="98760" data-kt-format=",">98,760</span>
<button data-kt-ripple>저장</button>
<img data-kt-lazy="skeleton" data-src="big.webp" data-kt-skeleton-variant="shimmer" alt="Example">
```

```js
const instance = Kineto.create('reveal', '.hero', { preset: 'slide-up' });
instance?.pause();
instance?.resume();
instance?.replay?.();
instance?.destroy();
```

## 3. 자동 초기화

`Kineto.autoInit()`은 등록된 **53개 모듈**의 활성화 속성을 스캔합니다. import만으로 자동 실행되지는 않습니다.

```js
Kineto.scan(document.querySelector('#new-section'));
```

같은 요소와 같은 모듈을 다시 스캔해도 중복 인스턴스를 만들지 않습니다.

### 나중에 렌더링되는 DOM: `Kineto.observe()`

React/Vue 트리, Bootstrap 토스트·모달, 무한 스크롤 목록처럼 요소가 나중에 들어오는 앱은
변경 때마다 `scan()`을 다시 부르는 대신 `observe()`를 한 번만 호출합니다. 지금 있는 요소를
스캔하고, 이후 추가되는 `data-kt-*` 요소는 마이크로태스크 단위로 묶어 붙이며, DOM에서 빠진
요소의 인스턴스는 정리합니다.

```js
const live = Kineto.observe();                       // 기본 root는 document
Kineto.observe('#app', { attributes: true });        // data-kt-* 속성 변경에도 반응
live.disconnect();                                   // 감시만 중단 (인스턴스는 유지)
Kineto.destroy();                                    // 전체 정리 시 observer도 함께 해제
```

같은 root에 두 번 호출해도 하나의 observer만 유지되고, SSR에서는 `active: false`인 빈 핸들을
돌려주므로 공용 코드에서 안전하게 호출할 수 있습니다.

## 4. 모듈 조합

```html
<img
  data-kt-lazy="dissolve"
  data-kt-ambient-media="image-clone"
  data-kt-lightbox="viewer"
  data-src="motion-demo.gif"
  data-kt-animated="true"
  data-kt-group="motion"
  alt="Animated media"
>
```

GIF·APNG·animated WebP는 Lazy, Ambient, Lightbox 조합에서도 살아 있는 이미지 요소를 유지합니다.

## 5. 디자이너용 class-only Reveal

```html
<section
  data-kt-reveal="class"
  data-kt-class-only="true"
  data-kt-enter-class="is-visible"
  data-kt-leave-class="is-hidden"
>...</section>
```

Kineto는 viewport 진입만 감지하고, 실제 디자인은 CSS 클래스로 제어할
수 있습니다.

## 6. Loader 진행률

```js
const loader = Kineto.loader('.loader', { type: 'bar', source: 'manual' });
loader.setProgress(35);
await loader.trackPromise(fetch('/api/bootstrap'));
loader.complete();
```

`source`는 `manual`, `window`, `resources`, `promise`, `fetch`를 지원합니다.

## 7. Smooth Scroll 선택 사용

Smooth Scroll은 기본 비활성화입니다.

```js
Kineto.enableSmooth({ lerp: 0.08, wheelMultiplier: 1 });
Kineto.scrollTo('#section-2', { offset: -72 });
Kineto.disableSmooth();
```

## 8. 설정과 수명주기

```js
Kineto.config({
  respectReducedMotion: true,
  performance: 'auto',
  debug: false
});

Kineto.replay('.title', 'textReveal');
Kineto.destroyModule('.title', 'textReveal');
Kineto.destroy('#route-container');
Kineto.destroy();
```

## 9. 다음 문서

- [정확한 Module Reference](module-reference.md)
- [디자인 시스템·UI 라이브러리 연동 가이드](integrations/README.md) — shadcn/ui 레지스트리, Bootstrap 5, MUI·Mantine·Chakra·Ant Design, Nuxt UI·PrimeVue·Vuetify, Figma MCP, Kineto MCP 서버
- [공통 옵션과 데이터 속성](common-options.md)
- [접근성](accessibility.md)
- [기능 계약](../FEATURE_CONTRACT.md)
- [소유자 요구사항](../OWNER_REQUIREMENTS.md)
