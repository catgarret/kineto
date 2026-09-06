# Module Catalog

공개 모듈은 정확히 **52개**입니다. 각 모듈은 `Kineto.<name>(target, options)`와 대응하는 `data-kt-*` 활성화 속성을 제공합니다. 전체 옵션·변형은 [module-reference.md](../module-reference.md)와 `kineto.features.json`을 참고하세요.

| 모듈 | 속성 | 핵심 역할 |
|---|---|---|
| `parallax` | `data-kt-parallax` | X/Y scroll parallax |
| `mouseParallax` | `data-kt-mouse-parallax` | pointer/gyro movement |
| `reveal` | `data-kt-reveal` | viewport content entrance |
| `counter` | `data-kt-counter` | slot/plain/digit/final-value pop |
| `dateTime` | `data-kt-date-time` | relative/absolute server timestamp |
| `lazy` | `data-kt-lazy` | image loading/reveal effects |
| `textSplit` | `data-kt-text-split` | character/word split motion |
| `blurText` | `data-kt-blur-text` | [blur text reveal](blur-text.md) |
| `typewriter` | `data-kt-typewriter` | type/erase loop |
| `textReveal` | `data-kt-text-reveal` | stream/char/word/line/bounce/hangul |
| `textTransition` | `data-kt-text-transition` | measured rotating text/items |
| `magnetic` | `data-kt-magnetic` | magnetic pointer response |
| `ripple` | `data-kt-ripple` | Material click ripple |
| `marquee` | `data-kt-marquee` | loop/hover/scroll response |
| `overflowText` | `data-kt-overflow-text` | loop/bounce/rewind/once/page/rolling |
| `loader` | `data-kt-loader` | overlay/slot/circular/bar loading UI |
| `loadingIndicator` | `data-kt-loading-indicator` | inline spinner/bar/shimmer/terminal indicators |
| `tilt` | `data-kt-tilt` | 3D tilt/glare |
| `cursor` | `data-kt-cursor` | custom pointer |
| `textFill` | `data-kt-text-fill` | scroll fill |
| `stickyStack` | `data-kt-sticky-stack` | vertical/horizontal/zindex/floating |
| `scrollVelocity` | `data-kt-scroll-velocity` | direction/speed response |
| `progress` | `data-kt-progress` | page/element progress |
| `slider` | `data-kt-slider` | slide/coverflow controls (incl. radial) |
| `ambientMedia` | `data-kt-ambient-media` | image clone / video-sampled ambient glow |
| `pageReveal` | `data-kt-page-reveal` | page entrance overlay |
| `glitch` | `data-kt-glitch` | RGB slice/digital glitch |
| `cardGlow` | `data-kt-card-glow` | bounded spotlight and optional variants |
| `lightbox` | `data-kt-lightbox` | full-viewport grouped viewer with zoom/minimap/custom UI |
| `pageTransition` | `data-kt-page-transition` | same-origin document transition |
| `vibrate` | `data-kt-vibrate` | device vibration feedback |
| `cssScroll` | `data-kt-css-scroll` | CSS scroll / view timeline progress |
| `scrollSequence` | `data-kt-scroll-sequence` | Canvas frame sequence |
| `brushReveal` | `data-kt-brush-reveal` | brush-mask reveal / scratch card |
| `fullpage` | `data-kt-fullpage` | fullpage section paging |
| `scrollShadows` | `data-kt-scroll-shadows` | CSS edge shadows on scroll containers |
| `stickyHeader` | `data-kt-sticky-header` | shrinking / cover-to-fixed sticky header |
| `horizontalScroll` | `data-kt-horizontal-scroll` | pinned horizontal scroll section |
| `accordion` | `data-kt-accordion` | accessible details accordion |
| `megaMenu` | `data-kt-mega-menu` | GNB dropdown / mega menu |
| `tabs` | `data-kt-tabs` | WAI-ARIA tabs / segmented control |
| `bottomSheet` | `data-kt-bottom-sheet` | draggable bottom sheet |
| `tooltip` | `data-kt-tooltip` | accessible auto-placed tooltip |
| `switch` | `data-kt-switch` | accessible toggle switch |
| `coverReveal` | `data-kt-cover-reveal` | color cover wipe reveal |
| `confetti` | `data-kt-confetti` | click / view confetti burst |
| `hold` | `data-kt-hold` | hold / mash-to-confirm gauge |
| `toast` | `data-kt-toast` | status toast (bar/ring/fill progress) |
| `gesture` | `data-kt-gesture` | whileHover / whileTap feedback |
| `drag` | `data-kt-drag` | drag with inertia / bounds / keyboard |
| `flip` | `data-kt-flip` | FLIP layout animation |

`tabs` 인스턴스는 `select(index)`, `refresh()`, `destroy()` 메서드를 제공합니다. 외부 UI가 탭 패널을 `hidden` 상태에서 다시 표시한 뒤에는 `refresh()`를 호출해 인디케이터 geometry를 즉시 재측정할 수 있습니다.

## 카테고리 원칙

- Counter와 Loader를 분리합니다. `circular`와 `bar`는 Loader입니다.
- Lazy는 이미지 로드/노출 효과입니다. `slide-up`과 `wipe`는 viewport Reveal입니다.
- Card Interaction은 Card Glow/Tilt, Pointer & Button Feedback은 Magnetic/Ripple/Vibrate/Mouse Parallax입니다.
- 데모는 모든 공개 모듈과 핵심 variant를 확인하는 QA 표면입니다.
- Mega Menu의 `responsive`는 좁은 화면에서 `wrap`(가운데 줄바꿈),
  `scroll`(한 줄 스와이프), `custom`(애플리케이션 CSS 위임)을 선택합니다.

정확한 variant와 공개 option은 [`../module-reference.md`](../module-reference.md), 삭제·재해석 금지 동작은 [`../../OWNER_REQUIREMENTS.md`](../../OWNER_REQUIREMENTS.md)를 확인합니다.
