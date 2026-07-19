# Changelog

MotionKit follows Semantic Versioning. Public scope is additionally governed by `FEATURE_CONTRACT.md`.

## [0.8.1]

- **Fix: framework adapters resolve the scoped package.** The React, Vue, and jQuery adapters imported the core as `motionkit`; after the rename to `@dong-gri/motionkit` that no longer resolved, breaking adapter users on 0.8.0. They now import `@dong-gri/motionkit`.
- Removed a stray duplicated `demo/motionKit/` directory from the package.

## [Unreleased]

### Added / Changed (release prep)

- **Counter `from`**: counters can start from any value, not just 0, and animate up or down to `to` (e.g. a 34,000 → 10,000 discount). `plain` tweens the value; `slot` rolls each digit reel from the start digit to the target in the correct direction. Exposed in the demo playground and shown in a new "Discount" card.
- **Fullpage scroll hand-off (Chrome mouse wheel)**: restored `overscroll-behavior:contain` on the pager to stop the compositor from chain-scrolling the parent on uncancelable wheel events, and drive the outer scroll manually at the edges so nothing gets trapped. Normalises `deltaMode` (line/page → px) for mice that don't report pixels. Inside a scroll container the deck only takes over once it is fully pinned, so scrolling back up lets the parent rise first.
- **Safari `file://` fix**: removed `?v=` cache-buster query strings from local demo resources — Safari refuses query strings on `file://` URLs, which had blocked the whole bundle from loading. The demo intro loader also has a failsafe so it can never leave the page blank.
- **Header (dark mode)**: the brand button now sets its own `color` (buttons don't inherit it), so the wordmark is visible in dark mode.
- **Release packaging**: package renamed to `@dong-gri/motionkit` with repository/homepage/bugs/keywords and `publishConfig.access: public`; READMEs (ko/en/ja) rewritten; added `PUBLISH-GUIDE.md` and `VSCODE-GUIDE.md`; removed the stale `motionkit-0.5.1-stabilized` snapshot and stray `.DS_Store` files.

### Changed / Added (round 24 — inline options panel & polish)

- **Options are a wide floating dock with a spotlight.** The panel is a wide bottom dock; the card being edited is lifted above a light dim (no blur on the example) and scrolled into view, so you watch the live effect while adjusting. Toss/Supabase-style layout: grouped setting cards, label + value on one row, boolean toggles as switches, focus rings, and the code preview tucked into a collapsible "코드 보기" drawer. Actions (Replay/Apply/Reset/close) live in a sticky head; the sheet keeps its rounded top.
- **Fullpage — real mixed axis.** A single sequence can change direction per step: `axis:"mixed"` with `data-mk-fp-axis="x|y"` on each section (e.g. A→B→C horizontal, C→D vertical). Sections are placed on a 2D grid and the track translates in both axes. Added to the playground axis select.
- **Fullpage coexists with normal scroll.** At an edge it can't move toward, the wheel gesture is now fully released — even mid-gesture — so an outer scroll container or the page takes over. New demo: two slides that hand off to a normal-scroll area + footer ("첫 화면만 슬라이드").
- **Cursor orbit** demo now has a hover target so the ellipse→circle bloom is visible; **cursor image** demo shows the click burst (`clickSprite`/`clickImage` fire on click for any cursor type).
- **Glitch** gains a `reveal` preset: the flicker/decode-in load effect as a one-shot on an image, with its own `duration`.
- **Haptic** buttons show a toast on PC/iOS explaining vibration only fires on supported (mainly Android) hardware, instead of silently doing nothing.
- The Customize summary now scrolls long / translated module names with MotionKit's own overflowText instead of clipping them.
- Lightbox Viewer grid rows trimmed to a fixed height so images no longer overlap the Customize summary.
- **Brand symbol.** New MotionKit mark (`logo.svg` / `demo/favicon.svg`) — a rounded tile with an object tracing an easing curve and a fading motion trail. Wired into the demo header (replacing the plain square), the favicon, and all READMEs.
- **Reusable toast** (`window.mkToast(msg)`): multi-line via `\n`, always centered, one shared component. Used by the copy buttons ("복사되었습니다"), Apply/Reset/Replay, and the Haptic-unsupported hint.
- **Fullpage release fix.** Dropped `overscroll-behavior:contain` on the container — because it's an overflow:hidden scroll container, `contain` was blocking wheel chaining and trapping the gesture. The wheel handoff is now gesture-scoped: while the deck can move, a whole flick is hijacked (one step, outer never scrolls); the outer scroller only takes over on a *fresh* gesture once the deck is exhausted — so fullpage and page never scroll at the same time. The coexistence demo fills its host and its normal-scroll area has a warm tint so it no longer reads as an error.
- **Lightbox fade speed fix.** When a lightbox shares `data-mk-duration` with another module on the same element (e.g. a lazy loader), the loader's long duration used to bleed into the backdrop fade. New `lightboxDuration` option (`data-mk-lightbox-duration`) overrides just the viewer fade; default lowered to 0.12s. The ambient/animated demo lightboxes now open/close at the same speed as the Lightbox Viewer.

### Fixed / Added (round 23 — media fixes, real photos & cursor hover)

- **ambientMedia no longer breaks on option change**: live edits rebuild only the edited module (single `rebuildModule`), so a stacked card (ambient over a lazy image + lightbox) never tears its own subtree out. Full "Apply" tears down then recreates inner-before-container.
- Lightbox demo opens fast (gallery `duration:0.12`, entry animation 240→170ms).
- Cursor image/custom react to hover: `hoverSrc` swaps the image, `hoverTemplate` swaps the custom HTML, `hoverClass` adds a class for your own CSS. Demo Image/Custom cards show it (image swap, DRAG→OPEN).
- **Real photo gallery**: 6 supplied images optimized to webp (28–64KB) and wired into the Lightbox Viewer (now 6, tidy 3-col grid, no overlap with the panel), Slider/Coverflow, Image Glitch, Brush Reveal and all Image Loading Effects cards.
- The Customize summary module name uses MotionKit's own overflowText (bounce, pause on hover) when it's wider than its slot — also covers longer translated strings.

### Added (round 22 — counter/cursor customization & drawer notes)

- Counter flip (incl. clock/countdown): `seamColor` (fold-line color), `shadow` (toggle/custom drop-shadow), and `separatorColor` (comma/colon color) — all also overridable via CSS vars `--mk-counter-seam`, `--mk-counter-flip-shadow`, `--mk-counter-separator`.
- Cursor **snake**: eased, gentler shrink (`snakeMinScale`, sqrt curve) so glyphs stay legible instead of collapsing instantly.
- Cursor **orbit**: blooms from a flat ellipse into a larger full circle on hover over links (`orbitHoverScale`).
- Cursor **image / custom**: added demo cards + full tooltips (the HELP set never had a `cursor` module before — now ko/en, others fall back to en), with `src/width/height` and `template` exposed in the panel.
- clickSprite already auto-detects frame size/count; the demo now omits explicit sizes to show it, and the verbose sprite-sheet explanation moved into the drawer as a `data-mk-note` block (a reusable "notes in the settings drawer" mechanism).

### Changed (round 21 — full i18n tooltips, scramble & footer)

- Option `?` tooltips are now translated in **all 7 languages** (ko/en/ja/zh-CN/zh-TW/ru/it, 291 entries each, full key parity) in `demo/help-i18n.js`, switching live with the language selector.
- Scramble: `scrambleFade` now takes precedence over `rainbow` — when fade is on, scrambling uses brightness only (no color). `textReveal` flicker mode no longer applies rainbow (decode only).
- Settings apply is fail-safe: options the current preset doesn't support (WHEN-hidden) are dropped before create, and a bad combo can't blank the demo — it restores the captured defaults with a note.
- Intro loader percentage is black on a light brand canvas (no more cyan difference blend); GitHub buttons use the Phosphor GitHub icon; footer rewritten in natural Korean with a line break, `dongri.me` creator link, MIT + "AI 바이브코딩으로 제작" note (also in README).

### Added (round 20 — release packaging & demo polish)

- **Minified distributables + CDN**: `npm run build` now also emits `dist/motionkit.min.js` (ESM, rolldown-minified, gzip ~62KB), `dist/motionkit.umd.min.js` (CDN drop-in) and `dist/motionkit.min.css`. `package.json` `unpkg`/`jsdelivr` fields point at the min UMD, and `exports` adds `./min` and `./umd`.
- **README bundle documentation**: a "번들 · 배포 포맷" table (file / format / use / gzip size) plus CDN (`jsdelivr`/`unpkg`), ESM CDN (`/+esm`), and optional GSAP/Lenis snippets; demo install box points at the npm CDN paths.
- **Tooltip i18n**: option `?` tooltips are now multilingual (`demo/help-i18n.js`, Korean + full English, 291 entries) and follow the language selector with per-key English→Korean fallback (ja/zh/ru/it fall back to English).
- **Phosphor Icons** across the demo chrome (via jsDelivr CDN): replay FABs, theme switch (sun/moon), hero support icons — replacing the hand-rolled inline SVGs that overlapped/looked off. The library itself stays icon-font-free (zero dependencies).
- **Intro loader redesign**: oversized thin Wanted Sans percentage (clamp up to 14rem, weight 100), a `MOTIONKIT` monospace wordmark, and `difference` blend so the number stays vivid over both the dark start and the rising orange fill.

### Fixed (round 19 — release QA)

- Intro loader was invisible on fast/cached loads twice over: the "already loaded → skip" branch always won on file://, and the whole-page fade veil (`body{opacity:0}`) also hid the loader overlay. The loader now always shows (resolved promise + minDuration) and the fade veil only covers the content containers (header/layout/footer), never the overlay.
- Loader scroll lock now locks the **root scroller** too (body overflow alone doesn't propagate when `<html>` has `overflow-x:clip`) and restores both on exit/destroy — applies to every loader, not just the intro.
- Intro percentage set in thin Wanted Sans (variable weight 100, tabular numerals) — `!important`ed over the module's inline slot typography.
- demo-qa waits for the deferred module boot before asserting.
- **Release QA sweep** (headless, full demo): 40 replay FABs, 87 option panels opened/changed/closed, lightbox open→nav→zoom→reset→close, 3 loaders with scroll-lock/restore, page reveals, fullpage round-trip, slider next/prev, 7-language cycle, theme round-trip, `MotionKit.destroy()` → 0 instances → re-init — **zero page/console errors**. Full suite green: contract 34, owner requirements 46, package surface, utils/SSR, browser smoke; demo-qa passes except the sandbox-only H.264 video assert.

### Added (round 18 — demo split, Page Reveal panel & fixes)

- Demo split into `index.html` / `styles.css` / `main.js` (pre-paint theme/preload scripts stay inline by design); QA/requirement tests read the split files.
- Page Reveal card gained a full Customize panel (effect/direction/duration/delay/colors/pieces/stagger/angle) — the effect buttons and the panel share the same options.
- Loader: `exit:'slide'` is directional now (exitDirection or the fill direction), and `exit:'wipe'` actually sweeps — the mask transition had no start state, so it snapped instead of animating.
- Scramble options broke when the painter moved into utils (the option names vanished from the modules' contract extraction, so the playground filtered `data-mk-rainbow` & co. away) — modules now pass the options explicitly; rainbow / palette-range / fade all work from the drawer.
- Drawer field show/hide had silently stopped (descriptor kind guard was too broad) — WHEN-based visibility works again for every module.
- Mobile: the hero column was locked at 640px by its content and got clipped — it now stretches to the container (100%/min-width:0), verified at 390px.
- First visit: the whole page fades in (0.65s) the moment the preload veil lifts, with the entrance choreography playing underneath (skipped under reduced motion).

### Added (round 17 — loader fill everywhere & snap-x wheel)

- The intro's background-fill treatment is now a first-class **loader option set**, exposed in the Loading playground: `fill` (up/down/left/right), `fillColor`, `labelColor`, `labelBlend` (difference/exclusion/screen/overlay) — and a new **`exit:'wipe'` directional mask-out** that sweeps the finished overlay away (`exitDirection` defaults to the fill direction). The demo's Run slot ships with fill-up + difference label + wipe exit.
- Fullpage: wheel now works in `mode:'snap'` + `axis:'x'` (vertical wheel steps the horizontal snap container, gesture-grouped like transform mode).
- Cursor sprite auto-probe moved off the options object (WeakMap) so the feature contract stays clean.

### Added (round 16 — deterministic startup, axes everywhere & full i18n)

- **Deterministic startup (library + demo)**: new `mk-preload` convention — an inline script adds the class to `<html>` at first paint, entrance-animated elements stay invisible (motionkit.css rules), and `scan()` releases the veil after modules apply their initial states. No more content flashing before its entrance plays, on any connection speed. The demo defers all module init to window `load`, covered by a **slot intro loader** (orange, thin mono type) whose background fills like a giant progress bar.
- **loader**: `fill` ('up'/'down'/'left'/'right') fills the overlay background with `fillColor` as progress rises; `labelColor` + `labelBlend` (e.g. `difference`) keep the percentage readable over the fill.
- **fullpage**: `axis:'x'` (horizontal paging — dots at bottom, arrow keys, nesting inside a vertical container gives mixed layouts), mouse **drag-swipe** (`drag`, on by default), and snap mode actually scrolls now (the percent chain was collapsing; dots sync to native snapping). Horizontal demo card added.
- **slider/coverflow**: `axis:'y'` — vertical sliding and vertical coverflow (rotateX), drag and arrow keys follow the axis.
- **Scramble styling** shared by shuffle + textReveal decode/flicker: `rainbow`, `rainbowColors` (hex/rgba stops sampled algorithmically instead of the full rainbow) and `scrambleFade` (brightness-only flicker).
- **vibrate**: `trigger:'manual'` + `instance.play()` for firing patterns from code; every module's JS code tab now shows selector-based usage (`MotionKit.module('#id'|'.class', options)`).
- **cursor clickSprite** auto-detects frame size/count from the sheet (square frames assumed) when width/frames are omitted — explicit options still win.
- **tilt / cardGlow**: `disableOnMobile` switches the effect off entirely on touch devices.
- **i18n completed**: all 68 card descriptions translated into the 6 languages (plus chips/tooltips/support/footer); tooltips wrap at punctuation (`white-space:pre-line`).
- Lightbox: clicking the empty area beside the image now closes the viewer (drag/zoom-safe) — the stage was swallowing backdrop clicks; gallery demo grew to 4 images.
- Playground: drawer controls use the accent color (no more UA blue); the GSAP/LENIS install rows really hide now (`[hidden]` was losing to `display:flex`).

### Added (round 15 — clock everywhere, no-flicker drawer & hero refinements)

- Counter clock family gained `clockStyle:'flip'` — real time, countdown and elapsed timers can now render as a split-flap board (tile options fully compatible), alongside roll/fade/instant.
- Options drawer no longer flickers: option changes sync field visibility **in place** (fields toggle `hidden`) instead of rebuilding the panel; ESC closes the drawer and returns focus to its trigger.
- Module Index badges jump to the section demoing that module (keyboard accessible).
- Page Reveal `diagonal` rebuilt as a real angled curtain sweep (slanted cover + trailing panel, `angle`/`direction` options) — no more corner shrink.
- Hero: dependency toggles (Scroll Scrub / Smooth Scroll, English labels) sit inline in the support line and reveal the matching GSAP/LENIS CDN rows; chips renamed (간편설치 · 구형 브라우저 고려 · …) with centered, caret-arrow tooltips that break lines at punctuation; chip labels/tooltips, support line and footer brand are translated in all 7 languages; hero-meta spacing 50px; install badges auto-size (LENIS no longer cramped).
- Detail pass: summary flex gap 2px; Card Glow cards get a wider option panel (escaping the 50px card padding) with relaxed tracking, and their content stacks centered with a 12px gap.

### Added (round 14 — first-screen snap, 7 languages & final polish)

- Demo hero is a full-viewport (100svh) first screen: one scroll gesture snaps to the first section fullpage-style — and scrolling up from there snaps back — with gesture-grouped momentum swallowing on wheel and touch; everything below scrolls normally. Disabled under prefers-reduced-motion. The header brand (MotionKit 0.8.0) scrolls to the top on click.
- Language selector grew to 7 languages: 한국어 · English · 日本語 · 简体中文 · 繁體中文 · Русский · Italiano (section copies + hero lead, `<html lang>` synced).
- Hero feature chips rewritten in plain Korean with centered hover tooltips (arrow caret) explaining each point; the dependency line now says it plainly — the core runs standalone, and an "PLUS" install row provides copyable GSAP + ScrollTrigger + Lenis CDN tags for the scroll-scrub/smooth modules.
- Counter countdown rolls digits downward by default (they're decreasing); `rollDirection` still overrides.

### Fixed (round 14)

- Snake cursor restored to the original loose elastic chain — and when the letters converge at rest, each glyph scales down with its spread so the stack collapses into a 1–2px dot (measured scale 0.12) instead of a letter blob.
- Slider/Coverflow: the Prev/Next row sat flush against the options summary — cards with real control rows keep a separated panel with proper spacing (16px, own border and radius).
- Module Index group labels vertically centered against their chip rows.

### Fixed (round 13 — gesture isolation & detail pass)

- **Fullpage really swallows momentum now**: wheel events are grouped into gestures (280ms window) — once a gesture triggers a step, its entire momentum tail is preventDefault-ed, and touch swipes navigate at the threshold then consume the rest of the touch. `overscroll-behavior:contain` blocks scroll chaining on mobile. Verified: 14 rapid wheel events → exactly one section step, 0px page movement.
- Theme switch: states were inverted — dark mode now highlights the moon (knob on the moon side), light highlights the sun; icons are larger filled monochrome glyphs (no accent colors).
- "Blink colon" (and other true-by-default checkboxes: seconds, lightbox toolbar/info/minimap, fullpage dots/wheel/touch/keyboard) rendered unchecked in the drawer while actually on — defaults registered so the panel reflects and controls them correctly.
- Counter digits clipped in narrow cards — counter stages use container queries to scale the type down (with the old vw clamp as fallback), everything centered and fully visible.
- Content Entrance preview cards now join their Customize summary (shared corner radii) like every other section.
- Footer: the top border runs full-bleed and meets the sidebar divider (no more floating inset line with a dead gap above it).

### Added (round 12 — clock modes, countdown & theme switch)

- Counter clock: `clockStyle` (roll · fade · instant), `rollDirection` (up/down), **countdown** (`until`) and **elapsed** (`since`) modes with automatic day count (`daysLabel`, `showDays`) and onComplete at zero; the layout rebuilds itself when the day digits change. Reduced motion renders plain updating text for all clock modes. Demo gains a Countdown card (D-day to 2027).
- Theme control is now a real switch — sun/moon at each end, sliding knob, `role="switch"` + `aria-checked`, larger icons.
- Install box: npm row is a copyable `npm install motionkit` like the others; CDN/ESM snippets point at `dong-gri/motionKit`.

### Fixed (round 12)

- Brush Reveal at `opacity:1` never looked opaque: the trail fade ran *after* the re-stamp (permanently one step below full), and the blur filter diluted the core. The loop now fades first then stamps, and a crisp unfiltered core is re-laid over the blurred pass — opacity 1 is truly opaque.
- Fullpage: wheel/touch during a section transition is swallowed completely, so the page behind no longer scrolls mid-animation (verified 0px page movement); the demo container and its Customize summary now share joined corner radii.
- The sidebar divider ended with the sticky nav and looked cut off next to the footer — the border moved to the main column, running the full content height.

### Added (round 11 — fullpage, progress UI & clock) — 34 modules

- **fullpage** (new 34th module): fullpage.js-style section paging — wheel / touch swipe / keyboard / dot navigation, `mode:'snap'` for native scroll-snap, loop, callbacks. Percent-based transforms adapt to any resize instantly; the container releases scroll at its edges so it never traps the page; reduced motion falls back to native snap scrolling.
- **progress** module grew visual shapes: `ui:'bar'` (fixed or in-place track+fill, thickness/radius/gradient/trackColor/position) and `ui:'ring'` (SVG circle, size/stroke, `showPercent`, `clickToTop` back-to-top button, corner + offset, `showAfter`, `hideAtEnd`, smoothing, per-element `target`). Themable via `--mk-progress-*` variables. The demo's floating TOP button is now this ring.
- **counter**: `clock` mode — a live clock (HH:MM:SS) where only changing digits roll and the colon blinks each second (`seconds`, `hour12`, `blink`, `clockSeparator`, `rollDuration`); grouping separator accepts any character (`separator`), and `blinkSeparators` makes separators blink in the other modes. Reduced motion renders a plain updating time.
- **shuffle**: `rainbow` option — scrambled characters flash in random rainbow colors (or a custom `rainbowColors` palette) until they settle.
- **pageReveal**: three new effects — `checker` (random tile grid), `strips` (shuffled vertical strips), `shutter` (alternating horizontal blades).

### Fixed (round 11)

- **Hero markup had one extra `</div>`** (introduced with the install box), which closed `<main>` early and spilled every section out of the layout grid — breaking the sidebar's sticky positioning. Rebalanced; sidebar sticks again.
- Hero title: the text-reveal char split defeated `background-clip:text` (giant black blocks). The title is now a static element with the flowing gradient glow.
- Marquee `pauseOnHover` never actually paused: the scroll-recovery drift pulled the velocity back to base every frame. Hover now holds the line still (verified: 0px movement while hovered).
- Header scroll bar moved inside the header (it sat above it, and its unfilled track showed an unblurred 2px gap).

### Added (round 10 — hero identity & lightbox polish)

- Lightbox: `backdropBlur` option (px, 0 disables) alongside `backdropOpacity`; zoom −/+/reset buttons disable themselves at min/max/100%; the whole viewer is now designer-themable via CSS custom properties (`--mk-lightbox-backdrop`, `--mk-lightbox-backdrop-blur`, `--mk-lightbox-button-bg/-border/-color/-radius`, `--mk-lightbox-radius`) — explicit JS options still win.
- Demo: hero title flows with an animated gradient glow (disabled under prefers-reduced-motion); theme switch is a sun/moon icon toggle; floating TOP button bottom-right (sits above the mobile nav); install box with copyable CDN/ESM snippets and an "npm 준비 중" row replaces the three wordy fact cards; custom cursors switch to `mix-blend-mode:difference` while the lightbox is open so they stay visible over the dim.

### Fixed (round 10)

- Stage ↔ Customize summary joining now applies to every card section (Counter, image loading, Text Overflow, feedback, Text Motion, entrance, Media & UI, cursor) — not just Loading.
- Replay buttons that sat outside a `.replay-row` (media cards) were still text buttons; the FAB conversion now catches every replay control.
- Card Glow cards force white text, which made the panel summary invisible in light theme — panels now set their own text color and stretch to full card width.
- Section copies rewritten as natural two-line Korean (with matching EN), `<a class="btn">` links lose their underline, and the Page Transition card explains itself in two sentences.

### Changed (round 9 — hero/footer & sticky fix)

- Hero: demo buttons and the "Live playground" notice removed; replaced with a GitHub link, feature chips (progressive enhancement, reduced-motion, mobile/gyro, standards/a11y) and three fact cards — browser support, optional dependencies (GSAP · ScrollTrigger · Lenis), install (UMD/ESM, npm 준비 중). Lead copy now breaks into two lines.
- Footer redesigned: brand statement + Project / Release columns + fine print; build stamp kept.
- Replay FAB moved to the bottom-right of each stage; dropped the `btn` class so later-cascade button styles can't hide or reshape it.
- Loader preview stages and their Customize summary now join into one block (shared corner radii, no gap); summaries elsewhere get more top margin, module name in the summary is right-aligned, standalone playground hosts span full width.
- Options drawer slides in from the right; shadow softened.
- Page Transition card gained a live "Transition reload" link (falls back to normal navigation where fetch is unavailable).

### Fixed (round 9)

- **Sticky broke site-wide** (Scroll Sequence showed a long empty run): `overflow-x:hidden` on `<body>` stopped propagating to the viewport once `<html>` got `overflow-x:clip`, turning the body into a clip container that killed `position:sticky`. Removed the body rule — the html clip alone prevents horizontal scroll.
- Brush Reveal: faint ghost no longer lingers — fade accelerates 4× once remaining ink is faint, so the tail snaps away.

### Added (round 8 — mobile & polish)

- Lightbox: two-finger pinch zoom on touch; mobile safe-area insets for toolbar, nav arrows and bottom metadata; `closeOnBackdrop` option exposed in the playground.
- Brush reveal: scratch-card behavior on touch (`touch-action:none`, paint starts on touch-down); trail healing — older strokes fade continuously while the spot under the pointer stays re-inked every frame.
- Cursor click effects work on touch devices (tap spawns the sprite/one-shot image even though pointer visuals stay disabled).
- Marquee: `skew` option — the line leans with scroll velocity and springs back.
- Slider: horizontal swipe wins over page scroll once a drag starts (touch).
- Demo: mobile bottom navigation bar (scroll-spy chips, safe-area aware); module index grouped by category (Text/Media/Scroll/Pointer/System); replay is a floating icon on each stage; options drawer portals to `<body>` so it renders correctly from tilted cards.

### Fixed (round 8)

- `--font-mono` definition became self-referential during a global font replacement, silently invalidating every `font: … var(--font-mono)` shorthand (section numbers rendered giant). Restored the full stack; numbers now render at the requested 16px IBM Plex Mono.
- Mobile horizontal scroll removed (`overflow-x: clip` on the root scroller); Korean copy no longer breaks mid-word (`word-break: keep-all`, `text-wrap: pretty`).
- Playground: LIVE badge removed, summary slimmed with a fixed-width +/− glyph (no text shift), open-state keeps the border radius; the `?` tooltip opens downward inside the drawer without spawning a horizontal scrollbar.
- Text Motion stages have fixed heights so cycling text no longer reflows the page while scrolling (덜컹거림 해소).

### Added (round 7)

- Vibrate: named haptic presets — `tap`, `double-tap`, `soft`, `rigid`, `heavy`, `success`, `warning`, `error`, `ratchet`(드르륵), `heartbeat`, `long-press` (Web Vibration API has no amplitude control, so texture comes from pulse timing).
- Tilt: gyroscope fallback on touch devices (device orientation drives the tilt; iOS permission handled on first tap).
- Compass: follows the real device heading via gyroscope on mobile.
- Sticky Stack: `align: center | top` — pinned content now centers in the viewport by default (vertical stack, horizontal scroll and floating sequence).
- Cursor: click effects — `clickSprite` (sprite-sheet burst with frame count/size/duration) or `clickImage` (one-shot GIF/APNG/WebP, restarted via cache-busted src). Touch devices still disable cursors entirely.
- Demo: language selector (KO/EN, persisted) replaces the header counter link; theme choice persisted to localStorage; Wanted Sans (body) + IBM Plex Mono (mechanical/numeric type) via CDN.
- Demo structure: Cursor and Smooth Scroll split — the Lenis runtime card now lives in Scroll Effects.

### Fixed (round 7)

- Sidebar/앵커 잠김 완전 해결: `overflow-anchor`를 실제 스크롤러(html)에 적용하고, 해시 이동을 JS 스크롤 + `replaceState`로 바꿔 브라우저의 fragment 재고정이 아예 발동하지 않게 함.
- Ambient image glitch: 색수차 고스트·인버트 슬라이스·스캔라인을 추가해 플랫한 일러스트에서도 버스트가 확실히 보이도록 강화.
- Brush reveal: 호버 중 정지해도 칠이 유지되고(치유는 포인터가 떠난 뒤 시작), 브러시 중심이 기본 불투명(`opacity` 옵션), file:// 이미지에서 치유가 멈추던 taint 문제 제거(픽셀 판독 없는 잉크 추적).
- Lightbox 딤드가 커서 위를 덮어 포인터가 사라지던 z-index 역전 수정.
- Section 번호 타이포를 IBM Plex Mono 기반으로 작고 타이트하게 조정.

### Added (round 6)

- Counter pop: landing origin option `popAlign: bottom | center | top`.
- Lazy skeleton: `skeletonColor` / `skeletonHighlight` / `skeletonIcon` exposed in the playground.
- Overflow Text `page-roll` mode: no horizontal marquee at all — the first page holds, then remaining pages swap by vertical rolling only (`rollDuration`, `rollDirection`, `pageDuration`).
- Glitch `image` preset: standalone ambient glitch bursts over a live image (independent from lazy loading; `sliceCount`, `trigger: hover` supported).
- Brush reveal: real airbrush spread — `softness` now scales the falloff band, plus `blur` for extra gaussian edge.
- Playground: options irrelevant to the current preset are hidden (live re-filter on preset change), and every option has a `?` tooltip with a friendly Korean explanation.
- Demo layout overhaul: sticky sidebar navigation with numbered sections and scroll-spy highlighting; compact hero; uniform card grid (`build r8-20260718`).

### Fixed (round 6)

- Rolling + pauseOnHover: hovering mid-roll restarted a cancelled animation from frame 0 and dropped scheduled steps (freezing on the wrong item); running animations now pause/resume properly and deferred steps fire on pointer-leave.

### Added (round 5 — 33 modules)

- **brushReveal** (new module): pointer paints a second image through a soft Photoshop-style round brush (day→night masking); strokes heal back or persist (`radius`, `softness`, `fade`, `persist`).
- Reveal `clock` preset: conic clock-wipe mask sweeps the content in like a watch hand (`startAngle`, `clockDirection`).
- Mouse Parallax `compass` mode: element rotates to aim at the pointer along the shortest arc, or maps pointer X onto a rotation range (`compassRange`, `rotateOffset`, `smoothing`, `sensitivity`).
- Text Reveal `decode` mode (RF Online style): characters appear in order, flickering through random glyphs before settling — generated from live text, no per-char markup (`flickerCount`, `loop`, `hold`, `chars`).
- Text Reveal `flicker` mode (Callisto TextFlicker): characters strobe on irregularly like failing fluorescents; `flickerLoop` keeps an ambient re-flicker running.
- Lazy `flicker` effect (Callisto ImageFlicker): image loads through canvas slice displacements, blackout flashes and a ghost pass, then settles (`glitchStrength`, `sliceCount`).
- Slider: active slide now centers in plain slide mode too; `align: 'left'` restores edge alignment.
- Cursor: small `+` cross-point variant kept alongside the full-viewport crosshair (`full: false`, `crosshairSize`).

### Fixed (round 5)

- Full-viewport crosshair was invisible: the transformed cursor wrapper became the containing block for its fixed hairlines and collapsed them to 0×0.
- Cursor hover label now sits centered inside the grown dot (no more collision with the ring outline); the dot auto-grows to fit the label.
- Page Reveal buttons only worked once: instances are one-shot and the demo now drops the previous record before re-running.
- Text/overflow dissolve no longer blurs (read as glow); Text Transition gained the same noisy `dissolve` effect.
- Demo: dark editorial redesign is now the default theme (orange accent, mono section numbering); scroll anchoring disabled to prevent snap-back while effects animate; assets cache-busted per build (`build r6-20260718`).

### Added (round 4)

- Overflow Text: `dissolve` mode — characters flicker apart with jitter/micro-blur noise (not a crossfade) and reassemble as the next page (`dissolveDuration`, `jitter`).
- Overflow Text rolling: items can be HTML markup children (div/span/b/em…), not just strings; aria-label uses the plain text.
- Cursor: hover now grows the inner dot while the ring/text-ring keeps its size (`hoverEffect: 'dot' | 'ring'`, `hoverDotSize`, `hoverDotOpacity`).

### Fixed (round 4)

- Overflow Text page/flip/once truncated the tail of the text: overflow was measured against the padded element box instead of the content viewport.
- Coverflow: the last slide never landed dead-center — slide width was measured from a scaled/rotated side slide; now uses layout width.
- Lightbox: title/description moved directly under the image (fade out while zoomed); metadata floated up from the screen edge.

### Fixed (round 3)

- Demo assets are now cache-busted (`?v=r3-20260718`): Chrome kept serving a stale `dist/motionkit.umd.js` from the file:// cache, which made every new module look broken (typewriter hangul/caret, text transition, glitch, new cursors, shuffle fix). The footer shows the build stamp.
- Counter flip: bare mode no longer flashes shaded boxes — fold shading only applies to tiles.
- Cursor sparkle: pooled stars restarted mid-transition and never became visible after the first burst; transitions are now re-armed per spawn so stars keep coming.
- Overflow Text: full timing control — `speed`, `delay`(시작), `endPause`(끝 대기), new `restartDelay`(한 사이클 후 재시작 대기), `pageDuration`/`flipDuration` — all exposed in the playground.
- Demo visual refresh: numbered section headers, refined light/dark palettes, softer card shadows with hover states, cleaner hero/footer.

### Added (round 2)

- Typewriter: caret(|) on/off (`caret`, `caretChar`) and Hangul jamo-composition typing (`hangul`) — merges the old Hangul reveal demo into Typewriter.
- Counter: true split-flap `flip` mode — each digit folds at the middle like a Solari board; tile chrome optional (`tile`, `tileColor`, `tileTextColor`, `tileRadius`, `bareBackground`, `gap`).
- Overflow Text: `flip` mode — page-sized text flips like a departure board (`flipDuration`, `flipDirection`).
- Card Glow: `comet` mode — traveling gradient light along the card outline (original border glow, with optional soft halo).
- Cursor: reference set restored — `text` (rotating circular text), `trail` (elastic dot tail), `orbit`, `snake`, `sparkle` (star particles), full-viewport `crosshair`.
- Page Reveal: `blinds`, `diagonal` effects plus `direction`, `axis`, `count`, `stagger` options; rebuilt on WAAPI.
- Text Transition: `shimmer` (AI gradient sweep) and `charMode` per-character enter/leave.

### Fixed (round 2)

- Glitch and Text Transition rebuilt without animation-engine dependency (WAAPI); glitch picks screen/multiply blending from the background so RGB slices are visible on light themes too.
- Skeleton placeholder now fills the actual image box instead of collapsing into a thin bar.
- Shuffle locks per-glyph widths so multi-line text can no longer collapse to one line mid-scramble.
- Demo playground: removed the rule that expanded a card to span 6 columns when its panel opened (grid no longer breaks); grids top-align cards.
- Lightbox: index counter truly centered, title/description centered under the image, metadata centered at the bottom edge.

### Added

- Text Split: `spin`, `flip`, `scale`, `blur`, `slide-up`, `slide-down` entrance animations plus Toss-style text swap (`texts`, `hold`, `swapOut`, `swapEase`, `onSwap`).
- Card Glow: restored the original rotating conic `aurora` outer halo that leaks beyond the card edge.
- Cursor: scoped cursors (`data-mk-cursor` on a bounded element activates only inside it), `full` crosshair, `dot` toggle for ring mode, `global`/`hideDotOnHover` options.
- Lazy Polaroid: instant-photo development curve with optional paper frame (`frame`, `frameColor`, `keepFrame`).
- Lazy Print: soft printing-edge highlight (`edgeWidth`, `edgeOpacity`) with eased scan.
- Lazy Skeleton: media-icon placeholder (`skeletonIcon`) and refined diagonal shimmer.
- Lightbox: index counter, item fade/rise transition, grab/grabbing pan cursors.

### Changed

- Pixelate now runs on the owner's Pixel Mosaic engine: real pixel-block stages in CSS pixels (auto largest→1px), equal time slices, canvas redraw of the live `<img>` so animated media keeps playing (`steps` in px, `stepCount`, `renderFps`, `maxDpr`; legacy ratio options still map).
- `zoom` lazy preset merged into `blur-up` (duplicate effect removed from the contract).
- Cursor dot now tracks the pointer instantly while the follower eases behind it (original trailing feel), and global cursors yield inside scoped regions so two cursors never overlap.
- Slider/Coverflow rebuilt on a single rAF-spring position engine: drag, buttons, keyboard, autoplay share one value; velocity fling on release; collapsed-height bug fixed.
- Overflow Text rewind/page masks now run on the visible viewport instead of the full track, with soft directional nudge easing.
- Scroll Text Fill uses fractional per-glyph gradient fill for a continuous sweep.
- Lightbox visual refresh: blurred backdrop, ghost buttons, compact nav.

### Fixed

- package-lock.json pointed at a private registry mirror, breaking `npm install` outside that network; regenerated against registry.npmjs.org.
- Slider first-slide inline height was cleared, collapsing wrappers without CSS min-height.

## [0.8.0] - 2026-07-18

### Added

- Added animated-media-safe composition across Lazy, Ambient Media and Lightbox for GIF, APNG and animated WebP.
- Added Skeleton shimmer/pulse variants, dynamic-noise Progressive Print/Dissolve, directional MP3 masks, realtime ranking rolling, surface reflection, luminous border, Reveal class hooks, spring velocity controls, full viewer controls, real Loader sources, custom cursor modes and optional Lenis runtime APIs.
- Expanded the owner contract to 46 requirements and the live demo to 58 configurable playgrounds.

### Changed

- Rebuilt Pixelate and Print around live image layers instead of permanently flattening animated media to canvas.
- Rebuilt Ambient Media to use live image clones or sampled video frames.
- Rebuilt Lightbox as a full-viewport customizable grouped viewer with lazy-effect composition.
- Rebuilt Coverflow around one transform path and removed the duplicate demo button handler.

### Fixed

- Fixed Skeleton creating an overlay object without appending it to the lazy wrapper.
- Fixed Coverflow moving two slides per demo button click.
- Fixed Smooth service recursive teardown and media wrapper insertion edge cases.
- Fixed zoomed Lightbox stages capturing pointer events from Previous/Next controls.
- Fixed animated-media QA stalls by replacing stability-dependent screenshots with direct CDP capture and deterministic Ambient frame markers.
- Corrected module documentation that still described Pixelate as Canvas-based and Lightbox as a native dialog.

## [0.7.1] - 2026-07-18

### Added

- Added a reusable live playground to adjustable demos with module-specific controls, instant re-creation, Replay, Apply, and Reset.
- Added synchronized HTML and JavaScript code tabs with a working clipboard action.
- Added playground QA that changes Counter options, verifies generated code and copy behavior, resets the original DOM, and checks instance-count stability.
- Added `MK-DEMO-002` to the owner requirements contract so future AI-assisted edits cannot silently remove the playground.

### Changed

- Included the `demo` directory in the npm package surface.
- Expanded open playground cards on desktop for a more usable settings layout.
- Cleaned generated JavaScript options by filtering them through each module's public option contract.

### Fixed

- Fixed asynchronous clipboard handlers losing `event.currentTarget` after `await`.
- Kept Loader demo buttons and playground controls on the same live option state.

## [0.7.0] - 2026-07-18

### Corrected

- Reclassified `circular` and `bar` as Loader modes and removed `circular` from Counter.
- Changed Counter `pop` to render the final formatted value immediately and land characters sequentially from a larger scale without count-up.
- Restored the Material-style button `ripple` module and separated Pointer/Button Feedback from Card Glow/Tilt.
- Rebuilt Lazy effects so `skeleton` is a true shimmer placeholder, `print` is blur + fine noise resolving through a directional sharp scan, and `dissolve` globally removes fine noise and blur.
- Moved `slide-up` and `wipe` into viewport-triggered Reveal presets instead of image Lazy loading.
- Restored the original RGB slice Glitch and repaired replayable Shuffle Decode and Text Transition.
- Made MP3 overflow modes distinct: Bounce reverses, Rewind masks out and invisibly resets, and Page changes instantly by viewport-width steps.
- Repaired Coverflow controls/drag/index, Ambient Media stacking, and grouped simple-fade Lightbox navigation.
- Added replay controls throughout Text Motion and content entrance demos.

### Added

- `motionkit.requirements.json` and expanded `OWNER_REQUIREMENTS.md` with 29 machine-tested owner requirements.
- Full categorized 32-module QA demo.
- Browser assertions for Counter/Loader classification, image effect convergence, MP3 mode semantics, replay controls, ripple cleanup, bounded glow, media UI, and zero-instance teardown.

### Fixed

- Pixelate could remove its Canvas before the browser had committed the final native-lazy image, leaving a blank result.
- Horizontal and floating Sticky Stack modes were incorrectly parsed as the default vertical mode.
- WAAPI `fill-forwards` prevented the hidden Rewind reset from returning to the start.
- Slider fallback slides overlapped because generated slides were positioned absolutely.
- Ambient Media glow could be hidden behind the page stacking context.

## [0.5.1] - 2026-07-17

### Stabilized

- Preserved all **30** modules. Previous documents said 29 while the actual source exported 30; no module was deleted to reconcile the mismatch.
- Rebuilt the core registry and lifecycle handling with duplicate initialization protection.
- Fixed direct `instance.destroy()` so it also removes the stale core record and permits clean recreation.
- Added consistent `create`, `pause`, `resume`, `replay`, and `destroy` behavior across modules.
- Repaired undefined runtime references including GSAP/ScrollTrigger helpers, text segmentation, interpolation, presets, and utility functions.
- Registered GSAP and ScrollTrigger in ESM environments instead of relying only on browser globals.
- Repaired Lenis integration and global visibility pause/resume.
- Reworked lazy media effects, including Canvas pixelate with CORS-safe fallback.
- Repaired Hangul composition frames and grapheme segmentation for text reveal effects.
- Repaired slider pointer, keyboard, autoplay, hover pause, accessibility state, and cleanup behavior.
- Repaired page transition content replacement, history handling, abortable fetch, re-scan, and teardown.
- Fixed timers/listeners/observers/RAF/GSAP cleanup across modules, including pageReveal timer cleanup.
- Restored compatibility methods used by the existing demo under `MotionKit.core`.
- Preserved property descriptors while normalizing instances so live getters such as `slider.index` remain live.
- Restored original HTML, inline styles, and ARIA attributes for repaired modules, including reduced-motion fallbacks.
- Replaced the slot counter's fixed row height with computed typography-aware line height.
- Tore down Lenis and visibility services when the final instance is destroyed.
- Added regression checks for unknown-module no-op behavior, descendant destruction, replacement-option replay, and reduced-motion static rendering.

### Added

- `motionkit.features.json`: machine-readable module/API contract covering modules, activation attributes, variants, public options, root properties, and core methods.
- `FEATURE_CONTRACT.md`: no-silent-feature-change rules.
- `AGENTS.md`: strict workflow for AI-assisted patches.
- React, Vue 3, and jQuery adapter entry points.
- ESM, browser UMD, CommonJS-compatible UMD copy, and stable CSS exports.
- ESLint, exact public-surface/option contract test, generated documentation check, Chromium lifecycle smoke test, package surface test, and `npm run verify`.

### Changed

- Correct package CSS import is now `motionkit/style.css`.
- Browser bundle is `dist/motionkit.umd.js`; CommonJS uses `dist/motionkit.umd.cjs`.
- Primary documentation now describes tested behavior and known limitations instead of unverified performance or compatibility claims.
- Build tooling updated to Vite 8.1.5 and Playwright Core 1.61.1.

### Security

- Updated build tooling; `npm audit` reports zero known vulnerabilities at release verification time.

## [0.5.0] - 2026-04-26

- Expanded the experimental library into a broad interaction toolkit.
- Added the modules that now form the 30-module v0.5 public surface.
- This version contained documentation, runtime, package export, and lifecycle inconsistencies corrected in v0.5.1.

## [0.2.0] - 2026-04-26

- Added lazy image effects and the first expanded interaction module set.
- Introduced environment detection, fallback handling, module docs, and examples.

## [0.1.0] - 2026-04-26

- Initial core, parallax, reveal, counter, GSAP/ScrollTrigger, Lenis, architecture document, and demo.
