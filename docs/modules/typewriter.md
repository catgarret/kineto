# typewriter

> 타이핑 + 백스페이스 + 루프. 헤드라인 강조용.

여러 문장을 순환하며 타이핑/지우기 효과. 히어로 섹션 단골.

---

## 사용법

### HTML

```html
<span data-kt-typewriter
      data-kt-strings='["빌드.", "출시.", "감동을 전달."]'
      data-kt-type-speed="60"
      data-kt-pause-after="1500"></span>
```

### JS API

```js
Kineto.typewriter('.hero-text', {
  strings: ['Build.', 'Ship.', 'Delight.'],
  typeSpeed: 60,
  eraseSpeed: 30,
  pauseAfter: 1500,
  loop: true,
});
```

---

## 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `strings` | string[] | textContent | 순환할 문장 배열 |
| `typeSpeed` | number | `60` | 타이핑 속도 (ms/글자) |
| `eraseSpeed` | number | `30` | 지우는 속도 (ms/글자) |
| `pauseAfter` | number | `1500` | 한 문장 끝나고 대기 (ms) |
| `loop` | boolean | `true` | 반복 |

---

## 작동

```
문자열 1 입력 → pauseAfter 대기 → 지우기 → 문자열 2 입력 → ...
```

`loop: false`면 마지막 문자열 입력 후 정지.

---

## 예시

### 빠른 타이핑

```html
<span data-kt-typewriter
      data-kt-strings='["FAST.", "FASTER.", "FASTEST."]'
      data-kt-type-speed="30"></span>
```

### 한 번만

```html
<span data-kt-typewriter
      data-kt-strings='["Welcome."]'
      data-kt-loop="false"></span>
```

### 한국어

```html
<span data-kt-typewriter
      data-kt-strings='["안녕하세요", "반갑습니다", "환영합니다"]'></span>
```

---

## 접근성 노트

- 타이핑 중인 줄은 `aria-hidden="true"`이고, 모든 strings를 쉼표로 이은 문장 하나를 보이지 않는
  텍스트(`kt-sr-only`)로 요소 안에 둡니다. 스크린리더는 이 문장을 한 번 읽고, 글자가 바뀔 때마다
  읽지 않습니다.
- `aria-label`은 제목·링크·버튼처럼 이름을 가질 수 있는 요소에만 함께 붙습니다. `span`·`div`·`p`에는
  붙이지 않습니다(그 자리의 `aria-label`은 NVDA·JAWS가 읽기 모드에서 무시합니다).
- caret(`▋`)은 `aria-hidden="true"`
- `prefers-reduced-motion`: 첫 번째 문자열만 정적 표시 (애니메이션 없음)
- `loop:false`로 마지막 문자열까지 친 뒤에는 `resume()`이 다시 타이핑하지 않고 `onComplete`도 다시
  부르지 않습니다.

---

## 성능 노트

- `setTimeout` 기반 (RAF 아님) → 매우 가벼움
- 백그라운드 탭에서 자동 일시정지
- 동시에 5개+ 두지 말 것 (시각적으로도 산만)
