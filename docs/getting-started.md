# Getting Started

## 1. 설치

### npm package / local tarball

```bash
npm install kineto
# 또는
npm install ./kineto-0.8.0.tgz
```

```js
import Kineto from 'kineto';
import 'kineto/style.css';

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

UMD bundle은 필요한 runtime dependency를 포함하므로 GSAP·Lenis를 같은 페이지에 중복 로드하지 않습니다.

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

`Kineto.autoInit()`은 등록된 **32개 모듈**의 활성화 속성을 스캔합니다. import만으로 자동 실행되지는 않습니다.

```js
Kineto.scan(document.querySelector('#new-section'));
```

같은 요소와 같은 모듈을 다시 스캔해도 중복 인스턴스를 만들지 않습니다.

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

Kineto은 viewport 감지만 담당하고 실제 디자인은 CSS class로 제어할 수 있습니다.

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

Kineto.replay('.title', 'shuffle');
Kineto.destroyModule('.title', 'shuffle');
Kineto.destroy('#route-container');
Kineto.destroy();
```

## 9. 다음 문서

- [정확한 Module Reference](module-reference.md)
- [공통 옵션과 데이터 속성](common-options.md)
- [접근성](accessibility.md)
- [기능 계약](../FEATURE_CONTRACT.md)
- [소유자 요구사항](../OWNER_REQUIREMENTS.md)
