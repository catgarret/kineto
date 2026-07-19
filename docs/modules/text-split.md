# textSplit

> 텍스트를 글자/단어 단위로 나눠 stagger 등장.

큰 헤드라인을 한 글자씩 떠오르게 하거나, 단어별로 페이드인. 시네마틱한 타이포그래피.

---

## 사용법

### HTML

```html
<h1 data-kt-text-split="char" data-kt-stagger="0.04">
  Move everything.
</h1>
```

### JS API

```js
Kineto.textSplit('h1', {
  by: 'char',          // 'char' | 'word'
  animation: 'rise',   // 'rise' | 'fade' | 'wave'
  stagger: 0.04,
  duration: 0.8,
});
```

---

## 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `by` (=`preset`) | `'char' \| 'word'` | `'char'` | 분할 단위 |
| `animation` | `'rise' \| 'fade' \| 'wave'` | `'rise'` | 애니메이션 종류 |
| `stagger` | number | `0.03` | 글자 간 시간차 (초) |
| `duration` | number | `0.8` | 각 글자 애니메이션 길이 |
| `delay` | number | `0` | 시작 지연 |
| `ease` | string | `'power3.out'` | GSAP ease |
| `start` | string | `'top 85%'` | 트리거 시작 |

---

## 애니메이션 종류

- `rise`: 아래에서 위로 마스크 슬라이드 (시네마틱)
- `fade`: 단순 페이드인
- `wave`: 살짝 떠오르며 페이드 (가벼움)

---

## 예시

### 영화 타이틀 스타일

```html
<h1 data-kt-text-split="char"
    data-kt-animation="rise"
    data-kt-stagger="0.05"
    data-kt-duration="1.2">
  Tomorrow Awaits
</h1>
```

### 단어 단위

```html
<p data-kt-text-split="word" data-kt-animation="fade" data-kt-stagger="0.08">
  자연스러운 단어 단위 등장
</p>
```

---

## 접근성 노트

**중요**: 원본 텍스트는 `aria-label`로 보존, 분할된 span은 `aria-hidden="true"`.

```html
<!-- 적용 후 -->
<h1 aria-label="Move everything.">
  <span aria-hidden="true">M</span>
  <span aria-hidden="true">o</span>
  <span aria-hidden="true">v</span>
  ...
</h1>
```

스크린리더는 `aria-label`만 읽고 분할된 span은 무시합니다.

`prefers-reduced-motion`: 분할은 하지만 stagger 없이 모두 한 번에 표시.

---

## 알려진 한계

- **HTML 태그 제거됨**: textContent로 추출하기 때문에 `<em>`, `<strong>` 같은 inline 태그가 사라집니다. 강조하려면 GSAP에서 특정 글자 인덱스에 다른 색을 입히는 식으로 우회.
- **줄(line) 분할 미지원**: v0.3에서 GSAP SplitText 통합 예정.
- **다국어**: 한글/영문 모두 동작. 이모지는 분리되지 않음 (의도).
