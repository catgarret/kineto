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
| `radial` | 항목을 원형 궤도에 배치하는 캐러셀 |

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

기본 Radial 전환은 `duration` 기반 cubic 보간을 유지합니다. `smoothing`을
지정하면 트랙 슬라이더와 같은 프레임 단위 보간으로 전환되어 드래그와 버튼
이동이 같은 감속감을 공유합니다. `0.02`~`0.5` 범위에서 설정하며, 기존
Radial 동작을 유지하려면 생략합니다. `spring:true`를 선택하면 Radial도
트랙과 같은 선택적 정착 solver를 사용하고 `stiffness`(기본 `170`),
`damping`(기본 `24`), `mass`(기본 `1`)로 물성을 조절합니다. 기본값은
`spring:false`이며 기존 cubic 전환 비용과 동작을 그대로 유지합니다.

슬라이드와 Radial 항목 안의 이미지는 라이브러리가 `draggable=false`와 `-webkit-user-drag:none`으로 처리하고 컨테이너의 `dragstart`도 캡처 단계에서 취소하므로, Safari를 포함한 브라우저의 반투명 고스트 이미지가 드래그를 가로채지 않습니다. 실제 이동 임계값을 넘은 뒤에만 페이지 스크롤을 막고 클릭을 억제하며, `destroy()`에서 이미지에 원래 지정한 drag·선택 스타일을 복원합니다.

트랙 효과는 `.kt-slider-track`이 필요합니다. `radial`은 활성 요소 바로
아래에 항목이 두 개 이상 있어야 합니다. 설정 데모는 현재 마크업에서
실행할 수 없는 효과를 선택 목록에서 숨깁니다.

기존 `data-kt-radial`과 `Kineto.radial()`은 공개 호환 진입점으로
유지되며 내부에서 같은 원형 엔진을 사용합니다.

Radial에서 `position:'center'`를 지정하면 허브를 중앙에 놓고 항목 간격을
`360 / 항목 수`로 계산해 원 전체를 표시합니다. 기존 `top`, `right`,
`bottom`, `left`는 컨테이너 가장자리에서 일부 원호만 보여주는 방식입니다.

Coverflow에서 `activeShadow:true`를 켜면 활성 슬라이드의 회전된 실루엣을
따라 `drop-shadow`가 표시됩니다. 기본값은 기존 화면을 유지하도록
`false`이며 `activeShadowOpacity`의 기본값은 `0.28`입니다.

## 자동 재생과 진행 UI

`dots:true`로 페이지 점을 표시합니다. `progress:true`와 `progressType:'bar'|'ring'`으로 자동 재생 진행률을 표시하며 `pauseButton:true`로 재생·일시정지 버튼을 추가합니다.

일시정지, 호버, 드래그 중에는 타이머와 진행 UI가 같은 지점에서 멈춥니다. 다시 시작하면 남은 시간부터 이어집니다.
화면 밖으로 완전히 벗어난 슬라이더는 기본적으로 자동 재생, 진행 UI, 전환용
`requestAnimationFrame`을 멈춥니다. 다시 화면에 들어오면 남은 상태에서 재개합니다.
이 동작이 필요하지 않으면 `pauseWhenOffscreen:false`로 끌 수 있습니다.
드래그를 놓을 때는 최근 최대 5개 포인터 샘플을 순서로 가중해 관성을
계산하므로 한 번 튄 이벤트보다 실제 손가락의 마지막 흐름을 우선합니다.
`velocityInfluence`는 해제 순간의 관성 배율이며 기본값은 `0.35`입니다.
`0`이면 드래그 자체는 유지하면서 해제 플링만 끄고, `1`보다 크게 하면
빠른 해제가 다음 슬라이드까지 더 멀리 이어집니다. Radial에는 적용되지
않습니다.
`momentum:false`는 해제 속도를 완전히 무시합니다. `velocityInfluence:0`과
같은 결과를 내지만, 설정 의도가 코드에 드러나는 이름입니다.
`stickySnap:true`를 선택하면 드래그를 놓은 위치를 가장 가까운 정수 슬라이드로
고정합니다. 기본값은 `false`로, 기존의 fractional release target을 보존합니다.
`bounce:true`는 양 끝에서 발생한 overscroll을 놓을 때 경계로 되돌리는 제한된
스프링 애니메이션을 추가합니다. 기본값은 `false`입니다.
`spring:true`를 켜면 트랙 정착을 스프링 물리로 바꿉니다. `stiffness`(기본 `170`),
`damping`(기본 `24`), `mass`(기본 `1`)로 당기는 힘·감쇠·질량을 조절할 수
있으며, 세 파라미터는 `spring:true`인 트랙·Radial 효과에서만 의미가
있습니다. 기본값은 `spring:false`로 기존 보간 동작을 그대로 유지합니다.
목표 위치로 정착하는 보간은 프레임 수가 아니라 경과 시간을 기준으로 계산하며,
긴 백그라운드 탭 간격은 64ms로 제한합니다. 따라서 60/90/120Hz에서도 같은
시간에 거의 같은 위치로 수렴합니다.

`momentum`, `bounce`, `stickySnap`은 track Slider에 먼저 적용됩니다. Radial은
원호 이동 방식과 입력 축이 달라 같은 관성 모델을 자동으로 공유하지 않습니다.
단순한 수평 `slide` 구성에서는 `scrollSnap:true`로 native CSS Scroll Snap을
선택할 수 있습니다. `loop:'off'`, `perView:1`, `axis:'x'`, `gap:0`,
`autoHeight:false`(기본값), touch 입력이 모두 필요하며, 조건을 벗어나면
자동으로 기존 transform 엔진으로 fallback합니다. 기본값은 `false`이고, 효과가
다른 슬라이더나 루프·다중 표시·세로 축에서는 native 경로를 사용하지 않습니다.
native 경로에서도 API·키보드·휠·touch·마우스 드래그가 같은 `index`와 change
이벤트를 공유하며, `destroy()`는 authored scroll 스타일을 복원합니다. 자세한
지원 범위와 브라우저 검증 기준은 [`docs/slider-physics-rfc.md`](../slider-physics-rfc.md)를
참조하세요.

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

// Narrow native CSS Scroll Snap path; unsupported combinations fall back.
const nativeSlider = Kineto.slider('.snap-slider', {
  effect: 'slide', loop: 'off', perView: 1, axis: 'x', gap: 0,
  scrollSnap: true
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

두 슬라이더를 연결할 때는 `sync`에 상대 슬라이더의 selector나 요소를
전달합니다. 어느 쪽에서 이동해도 상대 인덱스가 갱신되며 내부
`syncTo()`는 재전파를 막아 순환 호출을 만들지 않습니다.

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
  --kt-slide-active-shadow-color: #111827;
  --kt-slide-active-shadow-opacity: 22%;
  --kt-slide-active-shadow-x: 0;
  --kt-slide-active-shadow-y: 20px;
  --kt-slide-active-shadow-blur: 28px;
}

.my-slider .kt-slider-dot.is-active {
  background: #ff5b1c;
}
```

컨테이너에는 `kt-slider--{effect}` 클래스와 `data-kt-slider-effect`가 붙습니다. 각 슬라이드는 `--kt-slider-slide-distance`, `--kt-slider-slide-progress`, `--kt-slider-transition-mix` 상태 변수를 제공합니다.

주요 선택자는 `.kt-slider-dots`, `.kt-slider-dot`, `.is-active`, `.kt-slider-progress`, `.kt-slider-progress--bar`, `.kt-slider-progress--ring`, `.kt-slider-pause`입니다.
