# progress

> 스크롤 진행률을 시각화. 페이지 상단 진행 바.

---

## 사용법

### HTML

```html
<div class="scroll-progress" data-kt-progress></div>
```

```css
.scroll-progress {
  position: fixed;
  top: 0; left: 0;
  height: 2px;
  width: 100%;
  background: var(--accent);
  z-index: 999;
  transform-origin: left center;
}
```

### JS API

```js
Kineto.progress('.scroll-progress', {
  target: 'page',
  property: 'scaleX',
});
```

---

## 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `target` | `'page'` \| selector | `'page'` | 진행률 측정 대상 |
| `property` | `'scaleX'` \| `'width'` | `'scaleX'` | 적용 방식 |

---

## 작동

- `target: 'page'`: 전체 페이지 스크롤 진행률 (0~1)
- `target: '.section'`: 해당 섹션이 뷰포트를 통과하는 진행률
- `property: 'scaleX'`: `transform: scaleX(0~1)` (GPU 가속)
- `property: 'width'`: `width: 0%~100%` (레이아웃 영향)

`scaleX` 권장 (성능 좋음).

---

## 예시

### 글 진행률

```html
<article class="post">
  <div class="reading-progress" data-kt-progress data-kt-target=".post"></div>
  <h1>제목</h1>
  <p>본문...</p>
</article>
```

### 비디오 같은 width 모드

```html
<div class="bar" data-kt-progress data-kt-property="width"></div>
```

---

## 접근성 노트

- 자동 `aria-hidden="true"` 적용 (장식 요소)
- 의미 있는 진행률(파일 업로드 등)에는 별도 `<progress>` 또는 `role="progressbar"` 사용
- `prefers-reduced-motion`: 정상 동작 (스크롤 위치 그대로 반영)

---

## 성능 노트

- RAF 1개로 계속 측정 → 매우 가벼움
- `scaleX`는 GPU 컴포지팅 → 메인 스레드 영향 거의 없음
- 한 페이지에 5개+ progress 두는 건 비추천
