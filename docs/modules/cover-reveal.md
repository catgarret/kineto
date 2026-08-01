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
| `auto` | 이미지 픽셀을 두 대표 색상 군집으로 나눠 실제 대표색을 사용하고, 읽을 수 없으면 주변 배경색 기준 팔레트로 대체 |

`colors`는 쉼표 또는 `|`로 구분한 CSS 색상 문자열이나 JavaScript 배열을 받습니다. `color`, `color2`, `colors`에는 HEX뿐 아니라 RGB, RGBA, HSL, HSLA 같은 유효한 CSS 색상값을 사용할 수 있습니다. 교차 출처 이미지라 픽셀을 읽을 수 없는 경우에도 `auto`는 주변 배경색으로 안전하게 대체되며 리빌을 멈추지 않습니다.

여러 이미지가 있어도 각 요소에 `data-kt-color`, `data-kt-color-2`를 따로 지정하면 각 이미지가 자기 색 조합을 사용합니다. `maskColor:'surface'` 또는 `data-kt-mask-color="surface"`를 사용하면 가장 앞 패널이 실행 시점의 주변 배경색을 읽습니다. 따라서 라이트·다크 테마가 바뀌어도 배경과 같은 마스크색을 유지합니다. 기본값 `color2`는 기존처럼 지정한 두 번째 색을 사용합니다.

갤러리 순서까지 바꾸려면 같은 컨테이너에 `flip`을 함께 적용하고 `flip.shuffle()` 뒤 각 coverReveal 인스턴스를 replay합니다. `destroy()`는 생성한 wrapper와 cover layer를 제거하고 원래 콘텐츠 구조를 복원합니다.
