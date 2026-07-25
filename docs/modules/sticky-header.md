# stickyHeader

> 스크롤을 내리면 헤더가 그림자를 얻고 (선택적으로) 살짝 줄어든다 — shrinking header / cover-to-fixed 패턴.

`position: sticky` 헤더에 스크롤 반응을 더합니다. 페이지(window)뿐 아니라 **가장 가까운 스크롤 가능한 조상 컨테이너**의 스크롤에도 반응합니다. `--kt-header-progress`(0→1) 변수를 내보내 커스텀 스크럽 스타일에 쓸 수 있습니다. 토글은 `.kt-stuck` 클래스 기반이라 테마·점진적 향상에 유리합니다.

---

## 사용법

### HTML (디자이너)

```html
<header data-kt-sticky-header data-kt-offset="8">
  <strong>Brand</strong>
  <nav>…</nav>
</header>
```

### JS API (개발자)

```js
Kineto.stickyHeader('header', {
  offset: 8,       // 이 이상 스크롤하면 .kt-stuck 부여
  distance: 120,   // 진행률(0→1)이 채워지는 스크롤 거리(px)
  shrink: true,
  shadow: true,
  onChange: (stuck, progress, el) => {},
});
```

### 커스텀 스크럽 (CSS 변수)

```css
[data-kt-sticky-header] {
  --shrink: calc(1 - 0.35 * var(--kt-header-progress, 0));
  transform: scaleY(var(--shrink));
}
```

---

## 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `offset` | number | `8` | `.kt-stuck`를 붙이는 스크롤 임계값(px) |
| `distance` | number | `120` | `--kt-header-progress`가 0→1 되는 거리(px) |
| `shrink` | boolean | `true` | 고정 시 패딩 축소(`.kt-sh-shrink`) |
| `shadow` | boolean | `true` | 고정 시 그림자(`.kt-sh-shadow`) |
| `activeClass` | string | `'kt-stuck'` | 고정 상태 클래스명 |
| `onChange` | function | — | `(stuck, progress, el)` 콜백 |

---

## 접근성 / 성능 노트

- 스크롤 리스너는 passive + `requestAnimationFrame` 스로틀, CSS 변수 갱신만 수행.
- 스크롤 컨테이너 자동 감지: 헤더의 조상 중 `overflow:auto/scroll`인 요소가 있으면 그 컨테이너에, 없으면 window에 바인딩.
- `destroy()`는 추가한 클래스와 `--kt-header-progress` 변수를 제거.
