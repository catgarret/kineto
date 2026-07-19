# Kineto Owner Requirements

이 문서는 기능 아이디어가 아니라 **삭제·축소·자의적 재해석 금지 요구사항**입니다. 기계 판독 원본은 `kineto.requirements.json`입니다.

## 현재 계약

- 라이브러리 버전: `0.8.0`
- 요구사항 계약 버전: `3.0.0`
- 고정 요구사항: **46개**
- 변경 정책: 소유자의 명시적 승인 없이 요구사항을 제거하거나 의미를 바꿀 수 없습니다.

## 변경 원칙

1. 요구사항 삭제나 의미 변경은 소유자의 명시적 승인 없이는 금지합니다.
2. 버그 수정은 공개 모드·옵션·데모를 축소하지 않는 방식으로 진행합니다.
3. 구현과 문서가 충돌하면 요구사항을 우선하고, 테스트가 부족하면 테스트를 추가합니다.
4. 데모는 장식용 축약본이 아니라 공개 기능을 검수하는 QA 표면입니다.
5. 기능의 카테고리와 시각적 의미도 요구사항입니다.
6. 빌드 성공만으로 완료 처리하지 않고 실제 브라우저 동작, lifecycle, 패키지 설치를 검증합니다.

## 고정 요구사항

| ID | 대상 | 제목 | 수락 조건 |
|---|---|---|---|
| `MK-DEMO-001` | `demo` | Complete categorized demo gallery | The demo exposes all public modules, keeps product categories distinct, and provides replay controls for inspectable text and entrance motion. |
| `MK-DEMO-002` | `demo` | Live settings playground and code copy | Every adjustable demo exposes relevant live settings, replay, reset, synchronized HTML and JavaScript examples, and a working copy action without leaking Kineto instances. |
| `MK-COUNTER-001` | `counter` | Grouped number formatting | Comma or locale grouping works in slot, plain, digit, and pop counter modes. |
| `MK-COUNTER-002` | `counter` | Direct digit cycling | Digit mode cycles 0-9 by replacing glyphs without vertical reels. |
| `MK-COUNTER-003` | `counter` | Final-value pop landing | Pop never counts up or cycles through intermediate values; the final formatted characters already exist and land one by one from a larger scale. |
| `MK-LOADER-001` | `loader` | Circular progress loader | Circular progress is a loader mode, not a counter mode, and exposes size, stroke, color and percent controls. |
| `MK-LOADER-002` | `loader` | Progress bar loader | A horizontal loading bar with progress and optional label is available as a loader mode. |
| `MK-LAZY-001` | `lazy` | Working pixelate reveal | Pixelate reliably reveals the final image with configurable live-image pixel stages and does not freeze animated image formats. |
| `MK-LAZY-002` | `lazy` | Pixel stage controls | Pixelate exposes explicit steps or pixelStart, pixelEnd and pixelStepCount plus delay, stepDuration and holdDuration. |
| `MK-LAZY-003` | `lazy` | True skeleton placeholder | Skeleton is a temporary shimmer placeholder layer and is visually and structurally distinct from blur-up. |
| `MK-LAZY-004` | `lazy` | Progressive print scan | Print starts as blurred image plus fine noise and resolves sharply in a configurable scan direction without square mosaic blocks or neon scan lines. |
| `MK-LAZY-005` | `lazy` | Dissolve reveal | Dissolve removes global fine noise and blur across the whole image until the original is sharp, without directional wipe or simple opacity-only fade. |
| `MK-REVEAL-001` | `reveal` | Content entrance classification | Slide-up and wipe are reveal presets triggered by viewport entrance and are not lazy image-loading presets. |
| `MK-TEXT-001` | `shuffle` | Working shuffle decode | Shuffle visibly randomizes unresolved characters, resolves to the exact target text and can replay. |
| `MK-TEXT-002` | `textTransition` | Working text transition | Text transition measures a stable container, cycles visible items, exposes index and next, and can replay to the first item. |
| `MK-GLITCH-001` | `glitch` | Original RGB slice glitch | The default RGB glitch preserves the original three colored duplicate layers and intermittent horizontal slice bursts. |
| `MK-BUTTON-001` | `ripple` | Android-style click ripple | Clicking a button creates a circular Material-style ripple from the pointer location and cleans it up after animation. |
| `MK-GLOW-001` | `cardGlow` | Bounded pointer glow | The default glow is a clipped single-color pointer spotlight with configurable radius, opacity, blur, spread, follow and sensitivity. |
| `MK-TILT-001` | `tilt` | Configurable tilt response | Tilt exposes angle, axis, sensitivity, smoothing, perspective, scale, reverse, reset and glare controls. |
| `MK-CATEGORY-001` | `demo` | Card and button categories remain separate | Card Glow and Tilt contains only card glow and tilt; magnetic, ripple, vibrate and mouse-parallax demos live in Pointer and Button Feedback. |
| `MK-OVERFLOW-001` | `overflowText` | Distinct MP3 overflow modes | Overflow text animates only when needed and provides loop, bounce, rewind, once and page modes. |
| `MK-OVERFLOW-002` | `overflowText` | Masked rewind reset | Rewind travels only toward the end, masks out, snaps invisibly to the beginning, masks in and repeats; it never animates backward like bounce. |
| `MK-OVERFLOW-003` | `overflowText` | Page-step display | Page mode changes page-sized text segments using a directional mask instead of a plain tween or opacity-only transition. |
| `MK-SCROLL-001` | `scrollVelocity` | Direction-responsive text motion | Scroll velocity supports direction and speed-responsive skew, translate, rotate, scale and combo responses. |
| `MK-SCROLL-002` | `stickyStack` | Horizontal pinned scroll | Sticky stack includes a functioning configurable horizontal pinned scroll mode. |
| `MK-SCROLL-003` | `stickyStack` | Floating pinned sequence | Sticky stack includes a functioning floating pinned content sequence with configurable entry and previous-item treatment. |
| `MK-MEDIA-001` | `lightbox` | Full grouped lightbox viewer | Lightbox covers the complete viewport and supports grouped navigation, captions, metadata, zoom, pan, minimap and custom UI hooks. |
| `MK-MEDIA-002` | `slider` | Working coverflow slider | Coverflow displays centered active and adjacent preview slides and supports buttons, keyboard, drag, index state and cleanup. |
| `MK-MEDIA-003` | `ambientMedia` | Visible bounded ambient glow | Ambient glow remains visible around the media instead of disappearing behind the page and restores original styles on destroy. |
| `MK-LIFECYCLE-001` | `core` | No runtime or lifecycle leaks | Repeated create, replay and destroy leaves zero active instances, timers, generated UI or browser runtime errors in automated QA. |
| `MK-LAZY-006` | `lazy` | Animated image continuity | GIF, APNG and animated WebP continue playing during lazy effects and after completion. |
| `MK-LAZY-007` | `lazy` | Dynamic fine noise | Print and Dissolve noise changes continuously and does not expose an obvious repeating pattern. |
| `MK-OVERFLOW-004` | `overflowText` | Directional mask transitions | Rewind and Page accept top-to-bottom, bottom-to-top, left-to-right and right-to-left mask directions. |
| `MK-OVERFLOW-005` | `overflowText` | Realtime ranking rolling | Rolling mode changes multiple items vertically like a legacy realtime-search ranking ticker. |
| `MK-GLOW-002` | `cardGlow` | Surface reflection layer | Card glow optionally renders a configurable pointer-responsive surface reflection gradient. |
| `MK-GLOW-003` | `cardGlow` | Luminous gradient border | Card glow optionally renders a configurable gradient light along the card outline. |
| `MK-REVEAL-002` | `reveal` | Directional entrance presets | Reveal includes up, down, left and right slide/fade directions plus mask, wipe, zoom, blur, flip and rotate presets. |
| `MK-REVEAL-003` | `reveal` | Designer class hooks | Reveal can operate class-only and toggle configurable enter/leave classes for custom CSS. |
| `MK-SCROLL-004` | `scrollVelocity` | Optional spring response | Direction-responsive motion exposes spring on/off plus stiffness, damping, mass and response controls. |
| `MK-SCROLL-005` | `stickyStack` | Working vertical sticky stack | Vertical stack uses reliable CSS sticky positioning and restores owned styles on destroy. |
| `MK-MEDIA-004` | `lightbox` | Viewer UI customization | Lightbox UI can be replaced or extended with custom HTML, CSS classes and render callbacks. |
| `MK-MEDIA-005` | `media` | Composable animated media | A media element can combine Lazy, Ambient and Lightbox without freezing GIF, APNG or animated WebP. |
| `MK-MEDIA-006` | `ambientMedia` | Image and video ambient glow | Ambient glow supports live image clones and sampled video frames with configurable blur, opacity, saturation and brightness. |
| `MK-CURSOR-001` | `cursor` | Custom cursor system | Cursor supports dot, ring, blob, crosshair, image and custom templates with hover, press, label, color, size and smoothing options. |
| `MK-LOADER-003` | `loader` | Real progress sources | Loader accepts manual updates and can track window load, selected resources, promises and streamed fetch progress. |
| `MK-SMOOTH-001` | `core` | Optional Lenis smooth scrolling | Smooth scrolling is disabled or enabled explicitly and exposes runtime enable, disable, toggle and scrollTo APIs. |

## 검증

```bash
npm run test:requirements
npm run verify
```

`tests/owner-requirements.mjs`는 요구사항 ID와 구현·데모·문서 표면을 검사합니다. 테스트를 통과시키기 위해 수락 조건을 완화하는 변경은 금지합니다.
