# 공통 옵션과 데이터 속성

모든 옵션이 모든 모듈에 적용되는 것은 아닙니다. 아래는 여러 모듈이 공유하는 이름과 변환 규칙이며, 실제 기본값은 각 모듈 문서와 소스를 기준으로 합니다.

## 모션 옵션

| 옵션 | 일반적인 타입 | 의미 |
|---|---|---|
| `duration` | number | 모션 시간(초) |
| `delay` | number | 시작 지연(초) |
| `ease` | string | GSAP easing |
| `stagger` | number/object | 자식 또는 분할 텍스트의 순차 간격 |
| `speed` | number | 모듈별 이동량·문자 속도·흐름 속도 |
| `onComplete` | function | 완료 콜백 |

## 스크롤 옵션

| 옵션 | 일반적인 타입 | 의미 |
|---|---|---|
| `start` | string | ScrollTrigger 시작 위치 |
| `end` | string | ScrollTrigger 종료 위치 |
| `scrub` | boolean/number | 스크롤 진행률 연동 |
| `once` | boolean | 모듈이 지원할 때 1회 재생 여부 |
| `onUpdate` | function | 진행률 변경 콜백 |

각 모듈은 서로 다른 기본 `start`, `end`, `scrub` 값을 가질 수 있습니다.

## data 속성 변환

```html
<div
  data-kt-reveal="fade-up"
  data-kt-duration="0.8"
  data-kt-once="false"
  data-kt-stagger='{"each":0.08,"from":"center"}'
></div>
```

| HTML 값 | JS 값 |
|---|---|
| 빈 문자열 / `"true"` | `true` |
| `"false"` | `false` |
| `"12"`, `"0.5"` | number |
| `"{...}"`, `"[...]"` | JSON parse 결과 |
| 그 외 | string |

모듈 활성화 속성 자체의 값은 `preset`으로 읽습니다. 예를 들어 `data-kt-reveal="fade-up"`은 `{ preset: 'fade-up' }`과 같습니다.

## 반환값

```js
const one = Kineto.reveal('#hero', { preset: 'fade-up' });
const many = Kineto.reveal('.card', { preset: 'fade-up' });
```

- 일치 요소 1개: 인스턴스
- 일치 요소 여러 개: 인스턴스 배열
- 일치 요소 없음/지원 환경 아님: `null`

정규화된 인스턴스는 `pause`, `resume`, `destroy`를 가집니다. 모듈에 따라 `replay`, `next`, `previous`, `navigate` 같은 추가 메서드가 있을 수 있습니다.

## 전역 설정 — 스프링 모션

`Kineto.config({ spring: true })` 한 줄로 트랜스폼 계열 모듈의 기본 이징을 스프링(오버슈트)으로 바꿉니다. 현재 `reveal`(진입) · `gesture`(hover/press)에 적용되며, 요소별 `spring` / `ease`(또는 `easing`) 옵션으로 개별 override할 수 있습니다.

```js
Kineto.config({ spring: true });   // 전역 스프링 on
Kineto.reveal('.card', { preset: 'fade-up' });        // 스프링 이징 적용
Kineto.reveal('.hero', { preset: 'fade-up', spring: false }); // 이 요소만 끔
```

이징을 직접 지정하면 스프링보다 우선합니다. 대표 이징 예시:

| 용도 | 값 |
|---|---|
| 표준(자연스러운 감속) | `power3.out` / `cubic-bezier(.22,.8,.3,1)` |
| 스프링(살짝 튕김) | `back.out(1.25)` / `cubic-bezier(.34,1.56,.64,1)` |
| 강한 스프링 | `cubic-bezier(.34,1.8,.5,1)` |
| 선형(스크럽) | `none` / `linear` |

## 컨트롤 이름 — `labels`

슬라이더의 점, 토스트의 닫기 버튼, 라이트박스의 도구 버튼처럼 **모듈이 직접 만드는 컨트롤**에는
접근성 이름이 있어야 합니다. 그런데 라이브러리는 읽는 사람의 언어를 알 수 없습니다. 그래서
기본값은 영어로 두고, 문구는 언제든 페이지가 덮어쓸 수 있게 했습니다.

문자열마다 옵션을 만들면 금방 열 개씩 늘어나므로, 모듈마다 `labels` **지도 하나**만 공개합니다.
아무것도 넘기지 않으면 아래 표의 영어가 그대로 나갑니다.

| 모듈 | 키와 기본값 |
|---|---|
| `slider` | `dot` `'Go to slide {n}'` · `slide` `'{n} of {total}'` · `pause` `'Pause carousel autoplay'` · `resume` `'Resume carousel autoplay'` · `carouselRole` `'carousel'` · `slideRole` `'slide'` |
| `fullpage` | `dot` `'Go to section {n}'` |
| `toast` | `region` `'Notifications'` · `dismiss` `'Dismiss'` |
| `lightbox` | `viewer` `'Media viewer'` · `backdrop`·`close` `'Close viewer'` · `previous` `'Previous item'` · `next` `'Next item'` · `zoomIn` `'Zoom in'` · `zoomOut` `'Zoom out'` · `zoomReset` `'Reset zoom'` · `zoomHint` `'Click to type an exact zoom %'` · `zoomInput` `'Zoom percent'` · `share` `'Share'` · `download` `'Download'` |

`{n}`·`{total}` 자리표시자는 값이 있을 때만 바뀝니다. 이름을 잘못 적으면 `{dot}`처럼 그대로
보이므로, 오타가 조용히 빈칸이 되지 않습니다.

```html
<!-- 마크업: JSON 속성을 그대로 읽습니다 -->
<div data-kt-slider="fade" data-kt-labels='{"dot":"슬라이드 {n}으로 이동","pause":"자동 재생 멈춤"}'>
```

```js
// JS: 같은 지도를 옵션으로 넘깁니다
Kineto.slider('#gallery', { labels: { dot: '슬라이드 {n}으로 이동' } });
```

일부 키만 넘겨도 됩니다 — 나머지는 기본값이 남습니다. 빈 문자열은 "이름 없음"이 아니라
기본값으로 되돌아갑니다(이름 없는 버튼이 영어 이름보다 나쁘기 때문입니다).

**한 번만 만들어지는 것들:** 토스트의 region 은 위치마다 하나, 라이트박스 뷰어는 페이지에
하나를 공유합니다. 그래서 **그 자리를 처음 연 인스턴스의 문구**가 이름이 됩니다. 한 페이지에서
서로 다른 문구를 쓰고 싶다면 위치를 나누거나 같은 문구로 맞추세요.

**요소 자신의 이름은 별개입니다.** `slider`·`bottomSheet`·`progress` 의 `label`,
`loader`·`loadingIndicator` 의 `ariaLabel` 은 그 요소 자체의 이름이고, `labels` 는 그 안에
모듈이 만들어 넣는 컨트롤들의 이름입니다. `bottomSheet` 은 만드는 컨트롤이 그립 하나뿐이라
지도 대신 `resizeLabel` 옵션 하나를 씁니다(`''` 이면 툴팁을 달지 않습니다).
