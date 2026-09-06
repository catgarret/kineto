# reveal

요소가 뷰포트에 진입할 때 실행되는 콘텐츠 등장 모션입니다. 이미지 다운로드·디코딩을 담당하는 Lazy와 분리합니다.

## 프리셋

`fade`, `fade-up/down/left/right`, `slide-up/down/left/right`, `zoom`, `zoom-in/out`, `blur`, `rise`, `soft`, `flip`, `flip-x/y`, `rotate`, `mask`, `wipe`, `clock`, `class`

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

일반 `reveal`은 대상의 자식 DOM을 다시 만들지 않으므로 authored `<br>`와
inline markup을 그대로 보존합니다. 글자·단어를 실제 span으로 나누는
`textSplit`, `textReveal`, `blurText`는 별도의 줄바꿈 보존 경로를 사용합니다.

`slide-*`, `fade-*`, `rise`, `soft` 프리셋은 `distance`(px)로 이동 거리를 직접 줄일 수 있습니다. 기본 프리셋을 덮는 복잡한 인라인 스타일 없이, 본문 텍스트·배지처럼 촘촘한 레이아웃에 맞출 때 사용합니다.
