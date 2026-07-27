# slider

드래그, 터치, 키보드, 휠, 자동 재생을 하나의 상태로 처리하는 슬라이더입니다.

## 효과

| 값 | 동작 |
| --- | --- |
| `slide` | 가로·세로 기본 이동 |
| `fade` | 위치 변화 없는 교차 페이드 |
| `dissolve` | 입자, 블러, 미세 스케일을 조합한 디졸브 |
| `wipe` | `effectDirection` 방향으로 열리는 마스크 |
| `coverflow` | 활성 슬라이드와 양옆 항목을 입체 배치 |
| `flip` | 카드가 뒤집히는 전환 |
| `cube` | 면이 회전하는 큐브 전환 |
| `cards` | 카드를 겹쳐 넘기는 전환 |
| `creative` | 깊이, 회전, 블러를 조합한 장면 전환 |

```html
<div class="my-slider" data-kt-slider="dissolve" data-kt-loop="rewind">
  <div class="kt-slider-wrap">
    <div class="kt-slider-track">
      <article class="kt-slide">1</article>
      <article class="kt-slide">2</article>
      <article class="kt-slide">3</article>
    </div>
  </div>
</div>
```

`drag`, `touch`, `keyboard`, `wheel`은 입력 수단별로 끌 수 있습니다. `loop`는 `off`, `infinite`, `rewind`를 지원합니다.

## 자동 재생과 진행 UI

`dots:true`로 페이지 점을 표시합니다. `progress:true`와 `progressType:'bar'|'ring'`으로 자동 재생 진행률을 표시하며 `pauseButton:true`로 재생·일시정지 버튼을 추가합니다.

일시정지, 호버, 드래그 중에는 타이머와 진행 UI가 같은 지점에서 멈춥니다. 다시 시작하면 남은 시간부터 이어집니다.

## API와 이벤트

```js
const slider = Kineto.slider('.my-slider', {
  effect: 'wipe',
  effectDirection: 'left',
  autoplay: 4000,
  drag: true,
  touch: true,
  keyboard: true,
  onChange(index, slide) {
    console.log(index, slide);
  }
})[0];

slider.slideNext();
slider.slidePrev();
slider.slideTo(2);
slider.pause();
slider.resume();
slider.disable();
slider.enable();
```

다음 상태를 읽을 수 있습니다.

- `index`
- `slides`
- `paused`
- `enabled`
- `isBeginning`
- `isEnd`

DOM 이벤트는 `kt-slider-init`, `kt-slider-before-change`, `kt-slider-change`입니다. 콜백은 `onInit`, `onBeforeChange`, `onChange`를 지원합니다.

## CSS 확장

```css
.my-slider {
  --kt-slider-ui-color: #111;
  --kt-slider-ui-bg: rgb(255 255 255 / 72%);
  --kt-slider-dot-size: 6px;
  --kt-slider-dot-active-width: 28px;
  --kt-slider-dot-gap: 10px;
  --kt-slider-progress-color: #ff5b1c;
  --kt-slider-progress-track: rgb(17 17 17 / 18%);
  --kt-slider-progress-size: 48px;
  --kt-slider-progress-width: 3px;
  --kt-slider-progress-inset: 16px;
  --kt-slider-dissolve-noise: .16;
  --kt-slider-dissolve-blend: soft-light;
}

.my-slider .kt-slider-dot.is-active {
  background: #ff5b1c;
}
```

컨테이너에는 `kt-slider--{effect}` 클래스와 `data-kt-slider-effect`가 붙습니다. 각 슬라이드는 `--kt-slider-slide-distance`, `--kt-slider-slide-progress`, `--kt-slider-transition-mix` 상태 변수를 제공합니다.

주요 선택자는 `.kt-slider-dots`, `.kt-slider-dot`, `.is-active`, `.kt-slider-progress`, `.kt-slider-progress--bar`, `.kt-slider-progress--ring`, `.kt-slider-pause`입니다.
