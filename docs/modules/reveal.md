# reveal

요소가 뷰포트에 진입할 때 실행되는 콘텐츠 등장 모션입니다. 이미지 다운로드·디코딩을 담당하는 Lazy와 분리합니다.

## 프리셋

`fade`, `fade-up/down/left/right`, `slide-up/down/left/right`, `zoom-in/out`, `blur`, `rise`, `soft`, `flip-x/y`, `rotate`, `swing`, `skew`, `mask`, `wipe`, `clock`, `class`

방향 없는 `zoom`·`flip`은 공개 프리셋이 아닙니다. `zoom-in`·`zoom-out`,
`flip-x`·`flip-y` 중 의도한 동작을 지정합니다. `swing`은 왼쪽 위 모서리를
축으로 회전하고, `skew`는 전단 변형을 바로잡습니다. 데모에서 Mask·Swing·Skew의
독립 카드와 Replay로 원본 줄바꿈을 유지하는 진입 동작을 비교할 수 있습니다.

```html
<section data-kt-reveal="slide-left">왼쪽에서 등장</section>
<section data-kt-reveal="wipe" data-kt-direction="right">마스크 등장</section>
<span data-kt-reveal="slide-up" data-kt-distance="18">촘촘한 인라인 등장</span>
```

자식 요소를 순차 노출할 때 `stagger`와 `order`를 함께 사용합니다. `order`는 `start`, `end`, `center`, `edges`, `random`을 지원하며 GSAP 경로와 CSS 대체 경로에서 같은 순서로 동작합니다. `random`은 `replay()`할 때마다 다시 섞입니다.

```html
<ul data-kt-reveal="fade-up" data-kt-stagger="0.08" data-kt-order="edges">
  <li>01</li><li>02</li><li>03</li><li>04</li>
</ul>
```

`clock`도 `stagger`가 설정된 컨테이너에서는 부모 전체를 한 번에 자르지
않고 각 직계 자식에 독립적인 원형 마스크를 적용합니다.

```html
<ul data-kt-reveal="clock" data-kt-stagger="0.08" data-kt-order="start">
  <li>01</li><li>02</li><li>03</li><li>04</li>
</ul>
```

## Class-only designer hook

```html
<section
  data-kt-reveal="class"
  data-kt-class-only="true"
  data-kt-enter-class="is-visible"
  data-kt-leave-class="is-hidden"
  data-kt-remove-class-on-leave="true"
>...</section>
```

Kineto는 viewport 감지와 class on/off만 담당하고 실제 모션은 CSS로 구현할 수 있습니다. `activeClass`, `enterClass`, `leaveClass`, `onClassChange`를 제공합니다.

Text Motion과 Content Entrance 데모는 시각 검수를 위해 Replay를 제공합니다. reduced-motion에서는 최종 상태를 즉시 표시합니다.

방향을 생략한 `mask`는 가로로, `wipe`는 세로로 열립니다. `direction`을
지정하면 해당 방향을 우선합니다. GSAP 없이도 마스크가 viewport 진입을 감지해
자동 재생되며, 순수 `fade`에는 추가 이동이 없습니다.
`delay`는 재생 시작 전 대기 시간(초)이고 `onComplete`는 전환 시간이 지난 뒤
호출됩니다. `replay()`·`destroy()`는 이전 실행에 예약된 callback을 취소합니다.
GSAP 경로의 `pause()`·`resume()`는 Replay로 시작한 현재 tween에도 적용됩니다.
GSAP의 일반 transform/opacity 프리셋(`mask`·`wipe`·`clock`·`class` 제외)은
`once:false`에서 Replay 뒤에도 원래 스크롤 이탈·역재생·재진입과
진입/이탈 callback을 유지합니다.
엔진 없는 일반 CSS 전환 경로의 `pause()`·`resume()`는 기존처럼 no-op입니다.

별도 마스크 분기에는 기존 제한이 남아 있습니다. `mask`·`wipe`·`clock`은
`once:false`를 지정해도 viewport 자동 진입은 한 번이며, 이탈 역재생과
자동 재진입 반복은 아직 지원하지 않습니다. 이 세 프리셋의 `onEnter`·`onLeave`·
`onEnterBack`·`onLeaveBack`도 현재 연결되어 있지 않습니다. 명시적인 `replay()`와
`onComplete`는 사용할 수 있으며, 이 제한은 후속 개선 대상입니다.

일반 `reveal`은 대상의 자식 DOM을 다시 만들지 않으므로 authored `<br>`와
inline markup을 그대로 보존합니다. 글자·단어를 실제 span으로 나누는
`textSplit`, `textReveal`, `blurText`는 별도의 줄바꿈 보존 경로를 사용합니다.

`slide-*`, `fade-*`, `rise`, `soft` 프리셋은 `distance`(px)로 이동 거리를 직접 줄일 수 있습니다. 기본 프리셋을 덮는 복잡한 인라인 스타일 없이, 본문 텍스트·배지처럼 촘촘한 레이아웃에 맞출 때 사용합니다.
