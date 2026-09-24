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
선명한 유리에는 `glassBlur: 1`~`2`, `glassSaturate: 1.25`,
`glassTint: 'rgba(255,255,255,.06)'`, `glassDepth: 18`을 사용하세요.
기본 `glassBlur: 14`는 기존의 서리 낀 유리 설정을 유지합니다.
데모는 사진 위에 뜬 캡슐을 끌어 볼 수 있게 해, 굴절이 배경을 따라 움직이는 모습을 보여 줍니다
(`data-kt-drag`를 같은 요소에 조합).

`glassDepth`는 가장자리 렌즈(베벨) 폭입니다. 얇은 패널이 가운데까지 휘지 않도록
패널 짧은 변 절반의 60%를 넘지 않게 자동으로 줄입니다. 베벨 안쪽의 각 픽셀은 조금 더 안쪽의
배경을 보여 주어(볼록한 가장자리가 빛을 안쪽으로 꺾듯) 테두리 쪽이 확대되어 보이고,
그 당김은 테두리에서 가장 세고 안쪽 끝에서 **기울기 0으로** 사라져 맑은 가운데와 이음매 없이
만납니다. 예전 프로파일은 그 안쪽 끝에서 배경 한 줄을 크게 늘려 "번진 복사본"처럼 보였습니다
(`tests/browser/card-glass.mjs`가 이 이음매를 검사합니다).

`glassRim`·`glassRimOpacity`는 반사 테두리, `glassSheen`은 안쪽 광택을 조절합니다. 테두리와
베벨의 명암(빛 쪽 안쪽 가장자리가 밝고 반대쪽이 은은하게 한 번 더 빛남)은 포인터 방향을
따라 움직이고, 이탈하면 좌상단 조명으로 부드럽게 돌아갑니다. 정착하면 프레임 루프를 멈추며,
pause/resume 이후에도 입력에 반응합니다.

Apple의 네이티브 재질과 동일한 셰이더 구현은 아닙니다. 브라우저의 SVG
backdrop filter 합성 지원 여부에 따라 굴절이 달라집니다. CSS 문법 검사만으로
지원 여부를 알 수 없어 Chromium 계열에서만 SVG 굴절을 켜고 Firefox·WebKit은
CSS 블러를 유지합니다. `glassRefraction: 'off'`는
블러와 반사만 남깁니다. 불투명한 배경색을 패널 자체에 주면 뒤가 가려집니다.
등장 모션은 재질과 별개로 Reveal을 조합합니다. 레퍼런스:
[Apple 하단 내비게이션](https://www.apple.com/kr/iphone-18-pro/).
