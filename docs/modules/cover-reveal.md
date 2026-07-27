# coverReveal

색상 커버가 요소를 덮었다가 지정한 방향으로 걷히며 콘텐츠를 드러냅니다. 이미지, 텍스트 줄, 갤러리 타일에 적용할 수 있습니다.

```html
<div
  data-kt-cover-reveal
  data-kt-color-mode="palette"
  data-kt-colors="#ff5b1c,#ac7bef,#2791ef,#e5b322"
  data-kt-layers="3"
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
| `auto` | 이미지의 평균색을 우선 샘플링하고, 불가능하면 주변 배경색을 기준으로 조화 팔레트를 생성 |

`colors`는 쉼표 또는 `|`로 구분한 CSS 색상 문자열이나 JavaScript 배열을 받습니다. `color`, `color2`, `colors`에는 HEX뿐 아니라 RGB, RGBA, HSL, HSLA 같은 유효한 CSS 색상값을 사용할 수 있습니다. 교차 출처 이미지라 픽셀을 읽을 수 없는 경우에도 `auto`는 주변 배경색으로 안전하게 대체되며 리빌을 멈추지 않습니다.

갤러리 순서까지 바꾸려면 같은 컨테이너에 `flip`을 함께 적용하고 `flip.shuffle()` 뒤 각 coverReveal 인스턴스를 replay합니다. `destroy()`는 생성한 wrapper와 cover layer를 제거하고 원래 콘텐츠 구조를 복원합니다.
