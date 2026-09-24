# cardGlow

Card 내부에 제한되는 pointer spotlight와 선택적 표면 반사·발광 외곽선을 제공합니다. 무지개 Aurora는 기본값이 아닙니다.

```html
<article
  data-kt-card-glow="spotlight"
  data-kt-color="rgba(120,160,255,.65)"
  data-kt-radius="180"
  data-kt-surface="true"
  data-kt-surface-opacity=".22"
  data-kt-luminous-border="true"
  data-kt-border-color="#7aa2ff"
  data-kt-border-color2="#d9e3ff"
  data-kt-shadow="true"
  data-kt-shadow-follow="12"
>Card</article>
```

- Spotlight: `color`, `radius`, `opacity`, `blur`, `spread`, `follow`, `sensitivity`
- Surface reflection: `surface`, `surfaceGradient`, `surfaceColor`, `surfaceColor2`, `surfaceOpacity`, `surfaceBlur`, `surfaceSize`
- Luminous border: `luminousBorder`, `borderColor`, `borderColor2`, `borderOpacity`, `borderWidth`, `borderBlur`
- Shadow: `shadow`, `shadowColor`, `shadowOpacity`, `shadowBlur`, `shadowSpread`, `shadowX`, `shadowY`, `shadowFollow`, `shadowHoverOnly`, `shadowInset`, `shadowCss`

`shadowFollow`는 포인터 위치에 따라 그림자가 이동하는 최대 거리(px)입니다. `shadowCss`에는 완성된 CSS `box-shadow` 값을 넣을 수 있으며, 스타일시트에서는 다음 변수를 사용할 수 있습니다.

```css
[data-kt-card-glow] {
  --kt-card-glow-shadow: 0 16px 40px -12px rgb(14 20 35 / 32%);
  /* 개별 구성 요소를 바꾸려면 아래 변수를 사용 */
  --kt-card-glow-shadow-color: #111827;
  --kt-card-glow-shadow-opacity: 28%;
  --kt-card-glow-shadow-x: 0px;
  --kt-card-glow-shadow-y: 16px;
  --kt-card-glow-shadow-blur: 40px;
  --kt-card-glow-shadow-spread: -12px;
}
```

Glow와 reflection은 card clipping bounds 안에 유지됩니다. 그림자는 바깥으로 자연스럽게 표시되며 Tilt 그림자와 기존 `box-shadow`를 덮지 않고 합성합니다. Magnetic, Ripple, Vibrate는 Pointer & Button Feedback 카테고리입니다.

## Liquid Glass

`data-kt-card-glow="glass"`는 배경 굴절·블러·틴트·포인터 반사를 겹칩니다.
선명한 유리에는 `glassBlur: 2`, `glassSaturate: 1.25`,
`glassTint: 'rgba(255,255,255,.06)'`, `glassDepth: 18`을 사용하세요.
기본 `glassBlur: 14`는 기존의 서리 낀 유리 설정을 유지합니다.
데모는 배경 형태가 남는 낮은 블러의 캡슐로 재질을 보여줍니다.

`glassDepth`는 가장자리 렌즈 폭과 굴절량, `glassRim`·`glassRimOpacity`는
반사 테두리, `glassSheen`은 안쪽 광택을 조절합니다. 반사는 포인터를 따라
이동하고 이탈하면 좌상단 조명으로 부드럽게 돌아갑니다. 정착하면 프레임
루프를 멈추며, pause/resume 이후에도 입력에 반응합니다.

Apple의 네이티브 재질과 동일한 셰이더 구현은 아닙니다. 브라우저의 SVG
backdrop filter 합성 지원 여부에 따라 굴절이 달라집니다. CSS 문법 검사만으로
지원 여부를 알 수 없어 Chromium 계열에서만 SVG 굴절을 켜고 Firefox·WebKit은
CSS 블러를 유지합니다. `glassRefraction: 'off'`는
블러와 반사만 남깁니다. 불투명한 배경색을 패널 자체에 주면 뒤가 가려집니다.
등장 모션은 재질과 별개로 Reveal을 조합합니다. 레퍼런스:
[Apple 하단 내비게이션](https://www.apple.com/kr/iphone-18-pro/).
