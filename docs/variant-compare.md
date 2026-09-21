# Variant 비교 시트

> Generated from `scripts/generate-variant-catalog.mjs` · library v0.11.0 · 37 modules / 223 variants.

데모의 모듈 블록마다 **"모든 variant 비교"** 버튼이 있습니다. 열면 그 모듈의 공개 variant가
전부 같은 소재 위에 한 번에 펼쳐지고, 타일마다 그대로 붙여넣을 수 있는 마크업이 붙습니다.

사람이 결과를 훑어보고 "이거 말고 저거"라고 말하기 위한 화면이고, AI 도구가 한 번의 스크린샷으로
모듈의 선택지를 전부 확인하기 위한 화면이기도 합니다 — `docs/ROADMAP.md`의 "데모는 검수 화면이다" 원칙을 따릅니다.

## 세 가지 미리보기 방식

| 방식 | 뜻 | 모듈 | variant |
|---|---|---|---|
| `grid` (나란히) | 같은 소재를 variant 수만큼 복제해 살아 있는 상태로 나란히 보여 줍니다. | 27개 | 180개 |
| `control` (데모 컨트롤) | 데모가 이미 variant마다 컨트롤을 갖고 있어, 시트가 그 컨트롤을 대신 눌러 줍니다. | 2개 | 19개 |
| `link` (모듈 데모) | 한 페이지에 여러 개를 둘 수 없거나 옵션 하나로 켤 수 없어, 이유를 적고 모듈 데모로 보냅니다. | 8개 | 24개 |

180/223 variant가 시트 안에서 그대로 살아 움직입니다. 나머지는 왜 그럴 수 없는지가 아래 표에 적혀 있습니다.

## 모듈별

| 모듈 | 방식 | variant를 켜는 법 | variant 수 | 비고 |
|---|---|---|---|---|
| `ambientMedia` | `link` | — | 3 | variant 가 소스 종류(복제할 이미지·샘플링할 영상·단색)에서 파생됩니다. 옵션 하나로 바꿀 수 없어 모듈 데모의 세 카드가 그대로 비교 화면입니다. |
| `cardGlow` | `grid` | `data-kt-card-glow="<variant>"` | 7 |  |
| `counter` | `grid` | `data-kt-counter="<variant>"` | 6 |  |
| `dateTime` | `grid` | `data-kt-date-time="<variant>"` | 3 |  |
| `cssScroll` | `link` | — | 3 | variant 는 어떤 타임라인 옵션을 채웠는지의 결과입니다. 속성 값은 이름표일 뿐이라 값만 바꿔서는 다른 variant 가 되지 않습니다. |
| `cursor` | `grid` | `data-kt-cursor="<variant>"` | 11 |  |
| `fullpage` | `link` | — | 2 | 페이지 전체의 스크롤을 가져가는 모듈이라 한 페이지에 여러 개를 둘 수 없습니다. |
| `glitch` | `grid` | `data-kt-glitch="<variant>"` | 10 |  |
| `lazy` | `grid` | `data-kt-lazy="<variant>"` | 16 | 지원 중단 예정: `dither`, `ascii`, `halftone` |
| `stylize` | `grid` | `data-kt-stylize="<variant>"` | 3 |  |
| `lightbox` | `link` | — | 2 | viewer 와 grouped 는 `data-kt-group` 을 함께 쓰는지의 차이입니다. 갤러리 전체가 하나의 소재라 카드 단위로 복제되지 않습니다. |
| `loader` | `control` | — | 3 | 전체 화면 로더라 한 번에 하나만 띄울 수 있습니다. 데모의 로더 카드를 그대로 사용합니다. |
| `loadingIndicator` | `grid` | `data-kt-loading-indicator="<variant>"` | 6 |  |
| `magnetic` | `grid` | `data-kt-magnetic="<variant>"` | 2 |  |
| `marquee` | `grid` | `data-kt-direction="<variant>"` | 3 |  |
| `mouseParallax` | `grid` | `data-kt-mouse-parallax="<variant>"` | 3 |  |
| `overflowText` | `grid` | `data-kt-overflow-text="<variant>"` | 11 |  |
| `pageReveal` | `control` | — | 16 | 화면 전체를 덮는 오버레이라 한 페이지에 여러 개를 띄울 수 없습니다. 데모의 재생 버튼을 그대로 사용합니다. |
| `parallax` | `grid` | `data-kt-axis="<variant>"` | 2 |  |
| `progress` | `link` | — | 4 | variant 가 대상(page·element)과 표현(scaleX·width) 두 옵션의 조합이고, page 계열은 문서 전체에 하나만 존재할 수 있습니다. |
| `reveal` | `grid` | `data-kt-reveal="<variant>"` | 23 |  |
| `radial` | `grid` | `data-kt-radial="<variant>"` | 4 |  |
| `scrollSequence` | `grid` | `data-kt-fit="<variant>"` | 2 |  |
| `scrollVelocity` | `grid` | `data-kt-scroll-velocity="<variant>"` | 5 |  |
| `slider` | `grid` | `data-kt-slider="<variant>"` | 10 |  |
| `stickyStack` | `grid` | `data-kt-sticky-stack="<variant>"` | 4 |  |
| `textReveal` | `grid` | `data-kt-text-reveal="<variant>"` | 9 |  |
| `textSplit` | `grid` | `data-kt-by="<variant>"` | 2 |  |
| `textTransition` | `grid` | `data-kt-text-transition="<variant>"` | 9 |  |
| `tilt` | `link` | — | 5 | variant 가 maxX·maxY·glare·reverse 옵션의 조합에서 파생됩니다. 옵션 하나로 순회할 수 없습니다. |
| `vibrate` | `grid` | `data-kt-vibrate="<variant>"` | 11 |  |
| `hold` | `grid` | `data-kt-mode="<variant>"` | 2 |  |
| `megaMenu` | `grid` | `data-kt-layout="<variant>"` | 2 |  |
| `flip` | `grid` | `data-kt-mode="<variant>"` | 8 |  |
| `scrollShadows` | `link` | — | 3 | variant 는 축(vertical·horizontal)과 모드(mask)가 섞인 조합이라 옵션 하나로 순회할 수 없습니다. |
| `squircle` | `grid` | `data-kt-squircle="<variant>"` | 6 |  |
| `stickyHeader` | `link` | — | 2 | 뷰포트에 고정되는 헤더라 한 페이지에 여러 개를 나란히 둘 수 없습니다. |

## 소재는 어디서 오나

시트는 소재를 새로 만들지 않고 **데모가 이미 authoring 해 둔 것을 복제**합니다. 그래서 비교 화면이
실제 데모와 어긋날 수 없습니다. 고르는 순서는 이렇습니다.

1. `data-demo-specimen="<module>"` 이 붙은 요소 — 비교용 소재를 직접 지정하고 싶을 때만 씁니다.
2. 그 모듈의 홈 카드(`data-demo-home`) 안에 있는 인스턴스.
3. 그 밖에 데모에 있는 같은 모듈의 인스턴스(문서 순서).

variant 마다 요구 조건(`variantRequires`)이 다를 수 있으므로 — 예를 들어 Glitch의 `rgb`는 텍스트가,
`datamosh`는 이미지가 필요합니다 — 시트는 위 순서에서 **그 요구 조건을 만족하는 첫 소재**를 씁니다.

| 요구 조건 | 뜻 |
|---|---|
| `any` | No requirement — works on any element. |
| `image` | Needs an <img> (the element itself or a descendant). |
| `text` | Needs rendered text and no image to operate on. |
| `video` | Needs a <video> element. |
| `media` | Needs an <img> or <video> (the element itself or a descendant). |
| `items` | Needs two or more element children to sequence. |
| `track` | Needs a .kt-slider-track descendant for track-based slider effects. |

복제한 소재에서는 이 모듈의 variant를 나르는 옵션 속성을 먼저 지우고(그대로 두면 authoring된 값이
우리가 지정한 variant를 이깁니다), 그 variant로 authoring된 인스턴스가 데모에 있으면 그 인스턴스의
옵션만 다시 입혀 줍니다. 결과적으로 **소재는 같고, 옵션은 그 variant에 맞게 다듬어진** 타일이 됩니다.

## 새 variant를 추가할 때

1. `kineto.features.json` 에 variant를 추가합니다(계약 생성기가 채웁니다).
2. `npm run test:variant-compare` 를 돌립니다.
3. 떨어지면 셋 중 하나를 합니다 — 데모에 소재를 하나 추가하거나, 전용 컨트롤에
   `data-demo-variant="<module>:<variant>"` 를 붙이거나, 나란히 볼 수 없는 이유를
   `scripts/generate-variant-catalog.mjs` 에 적습니다.

조용히 빠지는 경로는 없습니다.
