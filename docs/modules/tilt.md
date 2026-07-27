# tilt

Pointer 위치에 따라 card를 3D로 기울이고 선택적으로 glare와 입체 그림자를 표시합니다.

주요 option은 `max`, `maxX`, `maxY`, `axis`, `sensitivity`, `smoothing`, `perspective`, `scale`, `reverse`, `reset`, `glare`, `glareOpacity`, `glareRadius`, `glareBlur`, `glareColor`입니다.

그림자는 `tiltShadow`로 켜고 `tiltShadowColor`, `tiltShadowOpacity`, `tiltShadowBlur`, `tiltShadowSpread`, `tiltShadowX`, `tiltShadowY`로 모양을 조절합니다. `tiltShadowFollow`는 기울기에 따라 그림자가 반대 방향으로 움직이는 정도이며, `tiltShadowHoverOnly`, `tiltShadowInset`, `tiltShadowCss`도 지원합니다.

```css
[data-kt-tilt] {
  /* 완성된 shadow 한 줄을 직접 지정 */
  --kt-tilt-shadow: 0 18px 44px -12px rgb(12 18 32 / 35%);

  /* 또는 생성된 shadow의 구성 요소만 교체 */
  --kt-tilt-shadow-color: #172033;
  --kt-tilt-shadow-opacity: 32%;
  --kt-tilt-shadow-blur: 42px;
}
```

CSS 변수는 JS option보다 우선하며, `--kt-tilt-shadow`를 지정하면 완성된 shadow 표현을 통째로 교체합니다. Card Glow와 함께 사용해도 각 모듈의 그림자 채널과 기존 `box-shadow`가 합성됩니다.

`x-only`, `y-only`, `reverse`, `tilt`, `tilt-glare` variant를 제공하며 Card Glow와 같은 Card Interaction 카테고리지만 서로 독립된 모듈입니다.
