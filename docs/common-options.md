# 공통 옵션과 데이터 속성

모든 옵션이 모든 모듈에 적용되는 것은 아닙니다. 아래는 여러 모듈이 공유하는 이름과 변환 규칙이며, 실제 기본값은 각 모듈 문서와 소스를 기준으로 합니다.

## 모션 옵션

| 옵션 | 일반적인 타입 | 의미 |
|---|---|---|
| `duration` | number | 모션 시간(초) |
| `delay` | number | 시작 지연(초) |
| `ease` | string | 모션 곡선 — 이징 토큰·애플 곡선·스프링 (아래 [이징과 스프링](#이징과-스프링)) |
| `stagger` | number/object | 자식 또는 분할 텍스트의 순차 간격 |
| `speed` | number | 모듈별 이동량·문자 속도·흐름 속도 |
| `onComplete` | function | 완료 콜백 |
| `hold` / `pause` | number | 텍스트를 바꾸기 전 머무는 시간 — Text Transition·Text Split·Text Reveal |

`hold`(Text Transition은 `pause`도)는 **초와 밀리초를 둘 다** 받습니다. 20 이하는 초, 그보다 크면
밀리초입니다 — `hold: 1.4`와 `data-kt-hold="1400"`은 같은 1.4초입니다. 20ms 동안 머무는 문구도,
20초씩 기다리는 단어 교체도 없어서 두 범위가 겹치지 않습니다(`src/utils.js`의 `timeMs`).
Text Transition의 `duration`도 같은 규칙입니다.

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

## 이징과 스프링

모션이 있는 모든 모듈은 `ease`(Overflow Text·Ripple은 `easing`)를 **한 해석기**(`src/utils.js`의
`resolveMotion`)로 읽습니다. 그래서 어느 모듈이든 같은 값을 알아듣고, CSS·WAAPI·GSAP 어느 경로로
그려도 같은 곡선이 됩니다. CSS 이징이 아닌 값(GSAP 이름·오타)은 모듈 기본 곡선으로 돌아가며, 예전처럼
WAAPI에서 예외를 던지지 않습니다.

| 쓰는 법 | 예 | 뜻 |
|---|---|---|
| CSS 키워드 | `ease-out` | 그대로 |
| easings.net | `expo-out`, `back-out` | 실제 cubic-bezier |
| 애플 곡선 | `apple-standard`, `apple-decelerate`, `apple-header`, `apple-ease-in-out` | apple.com 제품 페이지가 가장 많이 쓰는 세 곡선 + Core Animation `easeInEaseOut` |
| 애플 스프링 | `spring-smooth`, `spring-snappy`, `spring-bouncy` | SwiftUI `.smooth`·`.snappy`·`.bouncy` (duration 0.5초, bounce 0 / 0.15 / 0.3) |
| | `spring-apple`, `spring-interactive`, `spring-classic` | SwiftUI `Animation.default`(iOS 17, response 0.55·damping 1.0), `interactiveSpring()`(0.15·0.86), `spring(response:dampingFraction:)` 기본값(0.5·0.825) |
| 애플 스프링 조정 | `spring-bouncy(0.6s)`, `spring-snappy(0.4s, 0.1)` | 길이와 추가 bounce (SwiftUI `extraBounce`) |
| 애플 표기 | `spring(0.5s, 0.3)`, `spring(400ms)` | duration·bounce |
| 물리 표기 | `spring(170, 26)`, `spring(100, 8, 1, 0)` | stiffness·damping·mass·velocity |
| 기존 토큰 | `spring` | Kineto가 예전부터 쓰던 170/26 (바뀌지 않음) |
| 객체 | `{ spring: { duration: 0.5, bounce: 0.3 } }` | 세 표기 모두 객체로도 |

애플 값의 변환은 SwiftUI `Spring` 문서의 식 그대로입니다: `stiffness = (2π / duration)²`,
`damping = 4π(1 − bounce) / duration` (mass 1). 문서 예시 `Spring(duration: 0.5, bounce: 0.3)` →
stiffness 157.9, damping 17.6과 같은지 `tests/easings.mjs`가 확인합니다.

**스프링은 제 속도로 움직입니다.** `duration`을 주지 않으면 스프링이 0.1% 안으로 멈추는 시간이 모션
길이가 됩니다(`spring-snappy` ≈ 0.70초). `duration`을 주면 그 시간에 맞춰 곡선을 늘이거나 줄입니다.
CSS로는 스프링을 `linear()`로 구워 넘기므로 1을 넘는 오버슈트와 여러 번의 진동이 그대로 남습니다.
GSAP 경로에는 같은 물리 함수가 이징 함수로 들어갑니다(예전의 `elastic.out` 흉내가 아님).

```html
<div data-kt-tabs data-kt-ease="spring-snappy">…</div>          <!-- 탭 표시가 네이티브 세그먼트처럼 -->
<div data-kt-bottom-sheet data-kt-ease="spring-smooth">…</div>  <!-- 시트가 iOS처럼 올라옴 -->
<div data-kt-slider data-kt-ease="spring(0.5s, 0.3)">…</div>    <!-- 슬라이드를 실제 물리로 -->
<a data-kt-lightbox data-kt-ease="spring-bouncy" href="…">…</a>
```

### 페이지 전체 기본값

```js
Kineto.config({ spring: true });            // UI 모션을 spring-snappy로
Kineto.config({ ease: 'apple-standard' });  // 또는 원하는 값 하나 (spring보다 우선)
Kineto.config({ ease: null });              // 해제
Kineto.reveal('.hero', { preset: 'fade-up', spring: false }); // 이 요소만 제외
```

요소의 `ease`가 항상 이깁니다. 진행 표시·스크럽·스텝처럼 곡선이 의미를 가진 모션(Page Reveal의 손으로
맞춘 곡선, Blur Text의 blur, Lazy의 페이드, Ripple, Reveal `clock`, Card Glow의 shine)은 페이지 기본값을
받지 않고, 요소에 직접 준 `ease`만 따릅니다.

### Kineto 밖 CSS에서 — 토큰

`kineto.css`가 스프링과 애플 곡선을 CSS 변수로 제공합니다(`scripts/generate-easing-tokens.mjs`가
`src/easings.js`에서 생성 — 손으로 고치지 마세요).

```css
.card { transition: translate var(--kt-spring-snappy-duration) var(--kt-spring-snappy); }
.card:hover { translate: 0 -6px; }
.menu { transition: opacity .24s var(--kt-ease-apple-standard); }
```

`--kt-spring-{smooth|snappy|bouncy|apple|interactive}`와 각 `-duration`,
`--kt-ease-apple-{standard|decelerate|header|ease-in-out}`가 있습니다.

### JS에서

```js
const s = Kineto.spring('spring-bouncy');   // { easing, duration, durationMs, fn, stiffness, damping, mass, velocity }
el.animate(frames, { duration: s.durationMs, easing: s.easing });
Kineto.easing('apple-standard');            // 'cubic-bezier(0.4,0,0.6,1)'
Kineto.easingFn('spring(100, 8)')(0.3);     // 캔버스·rAF용 진행 함수
```

### 어디에 적용되나

| 무엇이 스프링을 받나 | 모듈 |
|---|---|
| 등장·전환 | Reveal(모든 preset, GSAP 없이도), Text Split·Text Reveal·Text Transition, Blur Text, Cover Reveal, Page Transition, Page Reveal |
| 컴포넌트 | Tabs(표시 + 패널), Bottom Sheet(열기), Tooltip(나타남), Toast(도착), Switch(손잡이), Mega Menu(열기), Accordion(높이), Lightbox(프레임 전환) |
| 포인터·배치 | Gesture(hover/press), Drag(제자리로), Flip(배치 전환), Fullpage(섹션 이동), Slider·Radial(실제 물리 엔진) |
| 스크롤·숫자 | Sticky Stack, Counter (GSAP 이징 함수로) |

닫힘·퇴장 모션(시트 닫기, 툴팁 사라짐, 텍스트 퇴장)은 짧은 가속 곡선을 그대로 둡니다 — 사라지는 것이
튕기면 머뭇거리는 것처럼 보이기 때문입니다.

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
| `lightbox` | `viewer` `'Media viewer'` · `backdrop`·`close` `'Close viewer'` · `previous` `'Previous item'` · `next` `'Next item'` · `zoomIn` `'Zoom in'` · `zoomOut` `'Zoom out'` · `zoomReset` `'Reset zoom'` · `zoomHint` `'Click to type an exact zoom %'` · `zoomInput` `'Zoom percent'` · `thumbnail` `'Item {n} of {total}'` · `share` `'Share'` · `download` `'Download'` |

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
