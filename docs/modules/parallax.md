# parallax

> 스크롤에 따라 요소가 다른 속도로 움직이며 깊이감을 만든다.

배경은 천천히, 전경은 빠르게 움직여 시차(parallax) 효과를 만듭니다. 스크롤에 정밀하게 연동되어 자연스러운 카메라 워크를 연출.

---

## 사용법

### HTML (디자이너)

```html
<img src="hero.jpg" data-kt-parallax data-kt-speed="0.5">

<!-- 음수 = 더 천천히 (배경) -->
<div class="bg" data-kt-parallax data-kt-speed="-0.3"></div>

<!-- 양수 = 더 빠르게 (전경) -->
<div class="fg" data-kt-parallax data-kt-speed="0.4"></div>
```

### JS API (개발자)

```js
const instance = Kineto.parallax('.hero-img', {
  speed: 0.5,
  axis: 'y',
});

instance.destroy();
```

### React (v0.3 예정)

```jsx
<MkParallax speed={0.5}>
  <img src="hero.jpg" />
</MkParallax>
```

---

## 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `speed` | number | `0.5` | 이동 속도. 양수=빠름, 음수=느림, 0=정지 |
| `axis` | `'x' \| 'y'` | `'y'` | 이동 축 |
| `start` | string | `'top bottom'` | 트리거 시작 |
| `end` | string | `'bottom top'` | 트리거 끝 |
| `scrub` | boolean \| number | `true` | 스크롤 연동 |

---

## 예시

### 다중 레이어

```html
<div class="parallax-stage">
  <img src="bg.jpg"   data-kt-parallax data-kt-speed="-0.3">
  <img src="mid.png"  data-kt-parallax data-kt-speed="0">
  <img src="char.png" data-kt-parallax data-kt-speed="0.4">
</div>
```

### 가로 패럴럭스

```html
<div data-kt-parallax data-kt-axis="x" data-kt-speed="0.3"></div>
```

### 부드러운 scrub

```js
Kineto.parallax('.hero', {
  speed: 0.5,
  scrub: 0.6,  // 0.6초 lerp
});
```

---

## 접근성 노트

- `prefers-reduced-motion: reduce` 시 자동 비활성. 요소는 정상 위치에 유지.
- 본 모듈 자체는 인터랙티브하지 않음. 콘텐츠 시맨틱 영향 없음.

---

## 성능 노트

- `'low'` 티어에서 자동 비활성 (데이터 절약 / 2G / 저메모리 디바이스)
- 100+ 요소에 적용하면 ScrollTrigger 인스턴스 과다로 부드러움 ↓. 정말 필요한 곳에만.
- `will-change: transform`이 자동 적용되지 않음 → 매우 큰 이미지에는 직접 추가 권장:
  ```css
  [data-kt-parallax] { will-change: transform; }
  ```
