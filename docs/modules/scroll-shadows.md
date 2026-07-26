# scrollShadows

스크롤 컨테이너 가장자리에 그림자나 마스크 페이드를 표시해 남은 스크롤 방향을 알려줍니다. 시작과 끝에 닿으면 해당 방향의 효과가 자연스럽게 사라집니다.

## 사용법

```html
<div
  class="list"
  data-kt-scroll-shadows
  data-kt-mode="mask"
  data-kt-transition="180"
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
| `transition` | number | `180` | mask 모드의 전환 시간(ms) |
| `opacity` | number | `1` | shadow 모드의 불투명도 |
| `color` | string | 요소 배경색 | 그림자를 가리는 덮개 색 |
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

`destroy()`는 인라인 배경·마스크·overflow와 상태 클래스, 이벤트 리스너를 정리합니다.
