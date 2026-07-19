# reveal

요소가 뷰포트에 진입할 때 실행되는 콘텐츠 등장 모션입니다. 이미지 다운로드·디코딩을 담당하는 Lazy와 분리합니다.

## 프리셋

`fade`, `fade-up/down/left/right`, `slide-up/down/left/right`, `zoom`, `zoom-in/out`, `blur`, `rise`, `soft`, `flip`, `flip-x/y`, `rotate`, `mask`, `wipe`, `class`

```html
<section data-kt-reveal="slide-left">왼쪽에서 등장</section>
<section data-kt-reveal="wipe" data-kt-direction="right">마스크 등장</section>
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

Kineto은 viewport 감지와 class on/off만 담당하고 실제 모션은 디자이너가 CSS로 구현할 수 있습니다. `activeClass`, `enterClass`, `leaveClass`, `onClassChange`를 제공합니다.

Text Motion과 Content Entrance 데모는 시각 검수를 위해 Replay를 제공합니다. reduced-motion에서는 최종 상태를 즉시 표시합니다.
