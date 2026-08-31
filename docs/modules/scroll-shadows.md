# scrollShadows

스크롤 컨테이너 가장자리에 그림자나 마스크 페이드를 표시해 남은 스크롤 방향을 알려줍니다. 시작과 끝에 닿으면 해당 방향의 효과가 자연스럽게 사라집니다. `mask`는 가장자리별 남은 거리 CSS 변수를 이용하는 그라데이션 페이드 방식이라, 콘텐츠 위에 그림자를 덧칠하지 않고 자연스럽게 사라집니다. 이 방식은 [Base UI Scroll Area의 Gradient scroll fade](https://base-ui.com/react/components/scroll-area#gradient-scroll-fade)처럼 overflow 거리를 CSS 변수로 발행하고 `mask-image`가 이를 읽는 구조를 따릅니다.

## 사용법

```html
<div
  class="list"
  data-kt-scroll-shadows
  data-kt-mode="mask"
  data-kt-transition-mode="smooth"
  data-kt-transition-duration="0.24"
  data-kt-ease="cubic-out"
  style="overflow:auto; max-height:240px"
>
  <!-- 넘치는 콘텐츠 -->
</div>
```

```js
const shadows = Kineto.scrollShadows('.list', {
  mode: 'shadow',
  size: 44,
  shadow: 'rgba(0,0,0,.24)',
  onChange(state) {
    console.log(state.atStart, state.atEnd);
  }
});

console.log(shadows.state.progress);
shadows.refresh();
```

## 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `mode` | `'shadow' \| 'mask'` | `'shadow'` | 가장자리 그림자 또는 콘텐츠 마스크 페이드 |
| `axis` | `'vertical' \| 'horizontal'` | `'vertical'` | 스크롤 축 |
| `shape` | `'radial' \| 'linear'` | `'radial'` | shadow 모드의 번짐 형태 |
| `size` | number | `44` | 가장자리 효과의 길이(px) |
| `transitionMode` | `'smooth' \| 'instant'` | `'smooth'` | 마스크 가장자리를 보간하거나 즉시 바꿈 |
| `transitionDuration` | number | `0.18` | 마스크 전환 시간(초) |
| `ease` | string | `'cubic-out'` | 마스크 전환 이징 |
| `transition` | number | — | 이전 버전의 전환 시간(ms). 호환용 |
| `opacity` | number | `1` | shadow 모드의 불투명도 |
| `shadow` | string | `rgba(0,0,0,.24)` | 그림자 색 |
| `onChange` | function | — | 시작·끝 상태가 바뀔 때 호출 |

## 상태와 스타일 확장

인스턴스의 `state`에는 `position`, `max`, `progress`, `atStart`, `atEnd`, `canScrollStart`, `canScrollEnd`가 들어 있습니다. 같은 값은 `kineto:scroll-shadows-change` 이벤트로도 받을 수 있습니다.

상태 클래스:

- `.kt-at-start`, `.kt-at-end`
- `.kt-can-scroll-start`, `.kt-can-scroll-end`

CSS 변수:

- `--kt-scroll-shadow`
- `--kt-scroll-shadow-cover`
- `--kt-scroll-shadow-size`
- `--kt-scroll-shadow-shade`
- `--kt-scroll-shadow-progress`
- `--kt-scroll-shadow-start`, `--kt-scroll-shadow-end` (현재 보이는 시작·끝 페이드 길이)

shadow 모드는 스크롤 거리만큼 그림자가 자연스럽게 드러납니다. 시간 기반 전환은 mask 모드에서 제공하며, 설정창에는 현재 모드에서 동작하는 옵션만 표시됩니다.

그림자를 가리는 커버색은 요소의 계산된 배경색을 자동으로 사용합니다. 별도 테마가 필요하면 `--kt-scroll-shadow-cover` CSS 변수로 명시할 수 있습니다. `shadow`와 `--kt-scroll-shadow`는 HEX, RGB, RGBA, HSL, HSLA 등 유효한 CSS 색상값을 그대로 받습니다.

SSR 또는 첫 paint에서 변수가 아직 없을 때도 끝쪽 페이드가 유지되도록 `--kt-scroll-shadow-end`에는 `size` fallback을 포함합니다. 자식 레이어에 같은 거리를 전달해야 하면 `--kt-scroll-shadow-start: inherit`와 `--kt-scroll-shadow-end: inherit`를 명시적으로 지정하십시오. `destroy()`는 인라인 배경·마스크·overflow와 상태 클래스, 이벤트 리스너를 정리합니다.
