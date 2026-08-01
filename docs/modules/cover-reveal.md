# coverReveal

색상 커버가 요소를 덮었다가 지정한 방향으로 걷히며 콘텐츠를 드러냅니다. 이미지, 텍스트 줄, 갤러리 타일에 적용할 수 있습니다.

```html
<div
  data-kt-cover-reveal
  data-kt-color-mode="auto"
  data-kt-layers="2"
  data-kt-direction="random"
>
  <img src="work.webp" alt="">
</div>
```

`direction`은 `up`, `down`, `left`, `right`, `random`을 지원합니다. `random`은 재생할 때마다 방향을 다시 선택합니다. 텍스트에는 `lines:true`, 이미지에는 `waitForImage:true`를 사용할 수 있습니다.

## 커버 색상

| `colorMode` | 동작 |
|---|---|
| `single` | `color` 하나를 모든 레이어에 사용 |
| `pair` | `color`와 `color2`를 레이어에 조합(기존 기본 동작) |
| `palette` | `colors`로 전달한 색상 목록 안에서 시작색과 레이어색을 선택 |
| `auto` | 이미지 픽셀을 색상 구간별로 집계한 뒤 면적·채도·색상 거리를 함께 반영해 서로 구별되는 대표색 두 개를 사용하고, 읽을 수 없으면 주변 배경색 기준 팔레트로 대체 |

`colors`는 쉼표 또는 `|`로 구분한 CSS 색상 문자열이나 JavaScript 배열을 받습니다. `color`, `color2`, `colors`에는 HEX뿐 아니라 RGB, RGBA, HSL, HSLA 같은 유효한 CSS 색상값을 사용할 수 있습니다. 여러 이미지에 각각 Cover Reveal을 적용하면 `auto`는 실제 `<img>` 요소별로 픽셀을 읽고 대표색 두 개를 따로 추출합니다. 따라서 갤러리 공통 팔레트를 공유하지 않으며, 같은 이미지에서는 다시 재생해도 동일한 조합이 나옵니다. 교차 출처 이미지라 픽셀을 읽을 수 없는 경우에는 주변 배경색으로 안전하게 대체되며 리빌을 멈추지 않습니다.

직접 지정할 때는 각 요소에 `data-kt-color`, `data-kt-color-2`를 따로 설정할 수 있습니다. `mask:true`를 켜면 마지막 색상 패널을 만들지 않고 같은 시간 슬롯의 최상위 마스크가 콘텐츠와 남은 색상 패널을 한 단위로 감쌉니다. 예를 들어 `layers:2`에서는 첫 번째 색상 패널 하나와 색 없는 외부 마스크 하나가 움직이며, `color2`는 그 재생에서 사용되지 않습니다.

마스크는 교체되는 마지막 색상 패널과 같은 `duration`, `delay`, `stagger`, 방향을 사용합니다. `lines:true`에서는 전체 문단을 한 번에 자르지 않고 렌더링된 각 줄에 별도 마스크를 만들며, 기존 다중 색상 패널과 같은 줄별 시간차로 재생됩니다.

갤러리 순서까지 바꾸려면 같은 컨테이너에 `flip`을 함께 적용하고 `flip.shuffle()` 뒤 각 coverReveal 인스턴스를 replay합니다. `destroy()`는 생성한 wrapper와 cover layer를 제거하고 원래 콘텐츠 구조를 복원합니다.
