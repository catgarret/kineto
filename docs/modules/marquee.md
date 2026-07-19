# marquee

> 무한 가로 흐름. hover 시 일시정지.

브랜드 로고 띠, 키워드 슬라이드 등에 사용. `<marquee>` 태그의 현대 버전.

---

## 사용법

### HTML

```html
<div class="marquee" data-kt-marquee data-kt-speed="60">
  <span>PARALLAX · REVEAL · COUNTER · LAZY · MAGNETIC</span>
</div>
```

### JS API

```js
Kineto.marquee('.marquee', {
  speed: 60,
  direction: 'left',
  pauseOnHover: true,
});
```

---

## 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `speed` | number | `50` | px/초 |
| `direction` | `'left' \| 'right'` | `'left'` | 흐름 방향 |
| `pauseOnHover` | boolean | `true` | 호버 시 일시정지 |

---

## 작동 원리

내부 콘텐츠를 자동으로 한 번 더 복제하여 무한 흐름처럼 보이게 합니다. 한 세트만큼 이동하면 transform 위치를 0으로 리셋(시각적으로 끊김 없음).

---

## 예시

### 빠른 흐름

```html
<div data-kt-marquee data-kt-speed="120">
  <span>QUICK BROWN FOX JUMPS OVER</span>
</div>
```

### 오른쪽으로

```html
<div data-kt-marquee data-kt-direction="right">
  <span>TRENDING NOW</span>
</div>
```

### 호버 정지 끄기

```html
<div data-kt-marquee data-kt-pause-on-hover="false">
  <span>NEVER STOPS</span>
</div>
```

---

## 접근성 노트

- 클론된 부분은 `aria-hidden="true"` (스크린리더가 두 번 읽지 않음)
- `prefers-reduced-motion`: 흐름 정지, 정적 표시
- 중요한 정보를 마퀴에 두지 말 것 — 사용자가 못 따라잡음

---

## 성능 노트

- RAF 1개로 동작 (가벼움)
- 매우 긴 콘텐츠(5000px+)에서는 transform이 GPU 텍스처를 키움 → 적당히 자르기
- `will-change: transform` 자동 적용
