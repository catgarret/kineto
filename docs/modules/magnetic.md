# magnetic

> 커서가 가까이 오면 요소가 포인터 방향으로 부드럽게 따라오는 마그네틱 버튼 효과입니다.

링크/버튼에 적용해 인터랙티브한 호버 경험을 만듭니다.

---

## 사용법

### HTML

```html
<a href="#" class="btn" data-kt-magnetic data-kt-strength="0.4">
  더 알아보기 →
</a>
```

### JS API

```js
Kineto.magnetic('.btn', {
  strength: 0.4,
  radius: 100,
  ease: 0.15,
});
```

---

## 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `strength` | number | `0.4` | 따라오는 강도 (0~1, 1이면 정확히 커서 따라감) |
| `radius` | number | `100` | 효과 발동 반경 (px) |
| `ease` | number | `0.15` | lerp 계수 (작을수록 부드러움) |

---

## 작동 원리

1. 부모 요소(parent)에 `mousemove` 리스너
2. 커서가 요소 중심에서 `radius * 1.5` 이내 → 따라가기 시작
3. 매 프레임 lerp으로 부드럽게 이동
4. 마우스가 영역 벗어나면 원위치

---

## 예시

### 작은 강도 (서브틀)

```html
<a data-kt-magnetic data-kt-strength="0.2">조용히 따라옴</a>
```

### 강한 자석

```html
<a data-kt-magnetic data-kt-strength="0.8">매우 강하게 따라옴</a>
```

### 큰 반경

```html
<button data-kt-magnetic data-kt-radius="200">멀리서부터 끌려옴</button>
```

---

## 접근성 노트

- 마우스 이벤트만 사용 → 키보드 사용자에게 영향 없음
- 시맨틱은 본인이 유지: `<a>`, `<button>` 같은 인터랙티브 요소에 적용해야 함
- `prefers-reduced-motion`: 효과 비활성, 정상 호버만
- `:focus-visible` 시 outline 자동 적용 (CSS에서)

---

## 성능 노트

- 매 프레임 RAF 실행되지만 hovering 일 때만 (밖에 나가면 정지)
- `'low'` 티어: 효과 비활성
- 모든 버튼에 적용하지 말 것 — 한 페이지에 5-10개 정도가 적당
