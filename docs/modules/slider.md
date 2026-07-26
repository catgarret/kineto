# slider

버튼, 키보드, pointer drag, autoplay를 지원하는 slider입니다.

| variant | 동작 |
|---|---|
| `slide` | 일반 수평 slide |
| `coverflow` | 중앙 active slide와 양옆 preview를 depth/rotation/scale로 표시 |
| `fade` / `dissolve` | 위치 이동 없이 slide를 교차 fade |

```html
<div data-kt-slider="coverflow" data-kt-gap="24" data-kt-rotate="34" data-kt-depth="120">
  <article class="kt-slide">1</article>
  <article class="kt-slide">2</article>
  <article class="kt-slide">3</article>
</div>
```

`dots:true`로 pagination dot, `progress:true`와 `progressType:'bar'|'ring'`으로 autoplay 진행 표시, `pauseButton:true`로 재생/일시정지 UI를 켤 수 있습니다. 링과 일시정지를 함께 켜면 버튼이 링 안에 배치되며, 일시정지한 시점의 남은 시간부터 이어서 재생합니다.

생성 UI에는 레이아웃을 강제하는 inline style을 넣지 않습니다. 다음 class와 CSS 변수로 제품 디자인에 맞게 바꿀 수 있습니다.

```css
.my-slider {
  --kt-slider-ui-color: #111;
  --kt-slider-ui-bg: rgba(255,255,255,.72);
  --kt-slider-dot-size: 6px;
  --kt-slider-dot-active-width: 28px;
  --kt-slider-dot-gap: 10px;
  --kt-slider-progress-color: #ff5b1c;
  --kt-slider-progress-track: rgba(17,17,17,.18);
  --kt-slider-progress-size: 48px;
  --kt-slider-progress-width: 3px;
  --kt-slider-progress-inset: 16px;
}

.my-slider .kt-slider-dot.is-active {
  background: #ff5b1c;
}
```

주요 hook은 `.kt-slider-dots`, `.kt-slider-dot`, `.kt-slider-dot.is-active`, `.kt-slider-progress`, `.kt-slider-progress--bar`, `.kt-slider-progress--ring`, `.kt-slider-pause`입니다. `index`와 `paused`는 현재 상태를 반영하는 live getter입니다. 이전/다음 버튼, 방향키, drag, hover pause, autoplay, `onChange`를 지원합니다.
