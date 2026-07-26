# horizontalScroll

> 섹션을 화면에 고정(pin)하고, 세로로 스크롤하면 안쪽 트랙이 가로로 흘러간다 — "가로 스크롤 섹션".

GSAP 없이 네이티브 스크롤 위치만으로 단일 transform을 구동해 스크롤과 정확히 동기화됩니다. `smooth`로 관성감을 줄 수 있고, `destroy()`는 원래 DOM을 그대로 복원합니다.

---

## 사용법

### HTML (디자이너)

```html
<div data-kt-horizontal-scroll data-kt-height="min(70vh,540px)">
  <!-- 첫 자식들이 그대로 가로 트랙이 됩니다 -->
  <article>PANEL 01</article>
  <article>PANEL 02</article>
  <article>PANEL 03</article>
</div>
```

### JS API (개발자)

```js
const instance = Kineto.horizontalScroll('.gallery', {
  height: 'min(58vh, 460px)',
  top: 'calc((100svh - min(58vh, 460px)) / 2)',
  smooth: true
});
instance.destroy();
```

---

## 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `height` | string | `'100vh'` | 고정 뷰포트(스테이지) 높이. `min(70vh,540px)`처럼 상한을 두면 큰 화면에서 과하게 커지지 않음 |
| `top` | string | viewport 중앙 정렬식 | sticky 시작 위치. 고정 header safe area나 직접 정렬이 필요할 때 CSS 길이/계산식 지정 |
| `smooth` | boolean \| number | `false` | 트랙 이동에 관성(lerp) 적용. 숫자면 lerp 계수(0.02~1) |

---

## 접근성 / 성능 노트

- 스크롤 리스너는 passive + rAF 스로틀, `translate3d` 단일 트랜스폼만 갱신.
- `prefers-reduced-motion: reduce`에서는 pin 없이 네이티브 가로 스와이프(`overflow-x:auto`)로 대체.
- 트랙 폭이 바뀌면 `ResizeObserver`로 자동 재측정.
- 스테이지 높이는 트랙의 가로 이동 거리만큼 자동으로 늘어나(세로 스크롤 = 가로 이동), 세로/가로 스크롤 길이가 1:1로 대응.
