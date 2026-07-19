# textFill

> 스크롤 진행에 따라 글자 색이 채워진다. 긴 인용문에 시선 유도.

긴 텍스트나 인용문에 적용하면 사용자가 읽는 속도와 스크롤이 자연스럽게 동기화됩니다.

---

## 사용법

### HTML

```html
<p data-kt-text-fill
   data-kt-base-color="rgba(255,255,255,0.15)"
   data-kt-fill-color="rgba(255,255,255,1)">
  Motion is no longer decoration. It is the language of trust...
</p>
```

### JS API

```js
Kineto.textFill('p.quote', {
  baseColor: 'rgba(0,0,0,0.15)',
  fillColor: 'rgba(0,0,0,1)',
  start: 'top 70%',
  end: 'bottom 30%',
});
```

---

## 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `baseColor` | string | `'rgba(255,255,255,0.15)'` | 처음 색 (어두운 베이스) |
| `fillColor` | string | `'currentColor'` | 채워지는 색 |
| `start` | string | `'top 70%'` | 채워지기 시작 |
| `end` | string | `'bottom 30%'` | 모두 채워짐 |

---

## 작동

텍스트를 글자별로 span 분할 → ScrollTrigger의 `progress`에 따라 왼쪽부터 한 글자씩 색이 fill로 변경.

---

## 예시

### 라이트 테마

```html
<p data-kt-text-fill
   data-kt-base-color="#cccccc"
   data-kt-fill-color="#000000">
  큰 텍스트가 스크롤 따라 검정으로 채워집니다.
</p>
```

### 컬러 강조

```html
<p data-kt-text-fill
   data-kt-base-color="rgba(255,255,255,0.1)"
   data-kt-fill-color="#ff5b1c">
  스크롤하면 오렌지로 빛납니다.
</p>
```

---

## 접근성 노트

- 원본 텍스트는 `aria-label`로 보존
- 분할된 span은 `aria-hidden="true"`
- `prefers-reduced-motion`: 효과 없이 정상 표시 (모든 글자 fillColor)

---

## 성능 노트

- 긴 텍스트(500자+)는 span 수가 많아져서 무거워짐 → 단락 단위로 적용 권장
- `'low'` 티어: 비활성 (정상 색상 표시)
- `scrub` 트리거이므로 스크롤마다 매 글자 색을 업데이트 → CPU 약간 사용
