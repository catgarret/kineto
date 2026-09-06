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

`<br>`로 작성한 줄바꿈과 JavaScript `texts` 배열 안의 `\n`은 `char`,
`word`, 문구 교체, `replay()`에서 모두 실제 줄바꿈으로 유지됩니다.

```html
<h1 data-kt-text-split="word">첫 번째 줄<br>두 번째 줄</h1>
```

```js
Kineto.textSplit('.status', {
  by: 'char',
  texts: ['전략을 분석하고 있어요.\n잠시만 기다려 주세요.', '이미지를 생성하고 있어요.\n곧 완료됩니다.']
});
```

Text Reveal도 authored `<br>`와 `text` 옵션의 `\n`을 같은 방식으로
보존합니다. [Blur Text](blur-text.md)는 DOM의 `<br>`와 실제 줄바꿈 문자를
보존합니다. 일반 `reveal`은 자식 DOM을 분할하지 않으므로 기존 `<br>`를
그대로 둡니다.

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

`prefers-reduced-motion`: 애니메이션 없이 첫 문구를 표시하고 줄바꿈을
유지합니다. 옵션 문구가 없으면 작성한 inline markup도 유지합니다.

---

## 알려진 한계

- **일반 애니메이션의 HTML 태그 제거**: 텍스트를 추출해 새 span으로 나누므로 `<em>`, `<strong>` 같은 inline 태그는 사라집니다. `<br>`는 줄바꿈으로 복원합니다.
- **줄(line) 단위 분할 미지원**: 강제 줄바꿈 자체는 보존하지만, 한 줄 전체를 하나의 animation unit으로 만드는 `by: 'line'`은 현재 공개 계약에 없습니다.
- **다국어**: 한글/영문 모두 동작. 이모지는 분리되지 않음 (의도).
