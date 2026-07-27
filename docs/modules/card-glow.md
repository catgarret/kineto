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
