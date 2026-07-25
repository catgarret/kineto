# scrollShadows

> 스크롤 컨테이너의 가장자리에 그림자를 그려 "더 볼 내용이 있음"을 알리고, 끝에 닿으면 사라진다.

순수 CSS 그라디언트 기법(`background-attachment: local`)으로 동작해 스크롤마다 JS가 실행되지 않습니다. 요소 자신의 배경색을 "덮개" 그라디언트로 써서 끝에서 그림자를 가립니다.

---

## 사용법

### HTML (디자이너)

```html
<div class="list" data-kt-scroll-shadows style="overflow:auto; max-height:240px; background:#fff">
  <!-- 넘치는 콘텐츠 -->
</div>

<!-- 가로 스크롤 -->
<div data-kt-scroll-shadows data-kt-axis="horizontal" style="overflow:auto; display:flex">…</div>
```

### JS API (개발자)

```js
const instance = Kineto.scrollShadows('.list', { size: 44, shadow: 'rgba(0,0,0,.24)' });
instance.destroy();
```

---

## 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `axis` | `'vertical' \| 'horizontal'` | `'vertical'` | 그림자를 그릴 축 |
| `size` | number | `44` | 덮개 그라디언트 크기(px) |
| `color` | string | 요소 배경색 | 끝에서 그림자를 가리는 덮개 색(컨테이너 배경과 일치시켜야 함) |
| `shadow` | string | `rgba(0,0,0,.24)` | 그림자 색 |

---

## 접근성 / 성능 노트

- 순수 CSS 배경이라 런타임 비용이 사실상 없음(스크롤 이벤트 미사용).
- 컨테이너가 스크롤 가능하지 않으면 자동으로 `overflow:auto`를 지정.
- `color`가 컨테이너의 실제 배경색과 다르면 끝에서 그림자가 완전히 사라지지 않으니 배경색과 맞추세요.
- `destroy()`는 인라인 배경 스타일을 원상 복구.
