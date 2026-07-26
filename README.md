<div align="center">

<img src="assets/logo.svg" width="72" height="72" alt="Kineto">

# Kineto

**Interactive web motion effects with live controls and copy-ready code — for Vanilla JavaScript, React, Vue, and jQuery.**

실시간으로 조절하고 코드를 그대로 복사해 쓰는 웹 모션 라이브러리 — 바닐라 JS · React · Vue · jQuery 지원.

English · [한국어](i18n/README.ko.md) · [日本語](i18n/README.jp.md) · [简体中文](i18n/README.zh-CN.md) · [繁體中文](i18n/README.zh-TW.md) · [Русский](i18n/README.ru.md) · [Italiano](i18n/README.it.md)

[![CI](https://github.com/catgarret/kineto/actions/workflows/ci.yml/badge.svg)](https://github.com/catgarret/kineto/actions/workflows/ci.yml) [![npm](https://img.shields.io/npm/v/@dong-gri/kineto.svg)](https://www.npmjs.com/package/@dong-gri/kineto) [![license](https://img.shields.io/npm/l/@dong-gri/kineto.svg)](LICENSE) [![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/@dong-gri/kineto.svg)](https://www.jsdelivr.com/package/npm/@dong-gri/kineto)

[Live demo](https://git.dongri.me/example/kineto) · [Module reference](docs/module-reference.md) · [AI prompt guide](AI-PROMPT-GUIDE.md) · [Feature contract](FEATURE_CONTRACT.md)

</div>

---

> **Kineto** — the name comes from *kinetic* (from the Greek *kínēsis*, “motion”). A fitting name for a library that is all about motion on the web.

Kineto is an interactive web motion effects library with live controls and copy-ready code — 50 modules for motion, media, scroll, loaders, and text, with integrations for JavaScript, React, Vue, and jQuery. Attach effects with a single `data-kt-*` attribute or drive them precisely through a JavaScript API. There is nothing to install by hand: the motion engines it can use (GSAP, Lenis) are never bundled — Kineto loads them from the CDN on demand only when a scroll/scrub effect needs one (or uses a copy already on your page), so a page of CSS-based effects ships zero engine code. On unsupported browsers or low-end devices the effects switch off while the content stays intact.

> Building with an AI coding tool (Cursor, Claude, etc.)? See the [AI prompt guide](AI-PROMPT-GUIDE.md) — it includes a ready-to-paste instruction that tells the assistant to reach for Kineto modules first for motion and interaction.

<img src="https://cdn.jsdelivr.net/gh/catgarret/kineto@main/assets/preview/kineto.gif" width="620" alt="Kineto Preview">

## Highlights

Every effect is tunable in the [live demo](https://git.dongri.me/example/kineto): adjust the options for an immediate preview, then copy the resulting HTML or JavaScript.

**Progressive Print** — `lazy` images resolve in like an inkjet print, line by line, low to high resolution.

<img src="https://cdn.jsdelivr.net/gh/catgarret/kineto@main/assets/preview/print.gif" width="620" alt="Progressive Print">

**Card Spotlight & Reflection** — `cardGlow` tracks the pointer with a spotlight, surface sheen, and a luminous border.

<img src="https://cdn.jsdelivr.net/gh/catgarret/kineto@main/assets/preview/cardglow.gif" width="620" alt="Card Spotlight and Reflection">

**Text Transition** — `textTransition` swaps phrases with slide, blur, or scale transitions.

<img src="https://cdn.jsdelivr.net/gh/catgarret/kineto@main/assets/preview/texttransition.gif" width="620" alt="Text Transition">

**ScrollVelocity** — `scrollVelocity` skews, scales, and shifts elements in response to scroll speed and direction.

<img src="https://cdn.jsdelivr.net/gh/catgarret/kineto@main/assets/preview/scrollvelocity.gif" width="620" alt="ScrollVelocity">

**Lightbox** — `lightbox` is a full-screen image viewer with groups, zoom, and a minimap.

<img src="https://cdn.jsdelivr.net/gh/catgarret/kineto@main/assets/preview/lightbox.gif" width="620" alt="Lightbox">

See the [full module list](#modules) below for all 50 modules.

## Installation

### npm

```bash
npm install @dong-gri/kineto
```

```js
import Kineto from '@dong-gri/kineto';
import '@dong-gri/kineto/style.css';

Kineto.autoInit();
```

### CDN (script tag, no build step)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@dong-gri/kineto/dist/kineto.min.css">
<script src="https://cdn.jsdelivr.net/npm/@dong-gri/kineto/dist/kineto.umd.min.js"></script>
<script>
  Kineto.autoInit();
</script>
```

### CDN (ESM)

```js
import Kineto from 'https://cdn.jsdelivr.net/npm/@dong-gri/kineto/+esm';
```

## Quick start

Everything works from HTML attributes alone.

```html
<h2 data-kt-text-reveal="stream">Text that streams in</h2>
<strong data-kt-counter="pop" data-kt-to="98760" data-kt-format=",">98,760</strong>
<img data-kt-lazy="skeleton" data-src="./cover.webp" alt="Cover">
<section data-kt-reveal="fade-up">Appears on scroll</section>
```

The same features are available through the JavaScript API.

```js
Kineto.counter('#total', { preset: 'pop', to: 98760, format: ',' });
Kineto.reveal('.card', { preset: 'fade-up', stagger: 0.06 });
const lightbox = Kineto.lightbox('.gallery img', { group: 'work', minimap: true });
```

### iOS edge-to-edge (notch & home bar)

Full-screen effects — the loader, page reveal and page transition — cover the whole viewport. So they extend under the iPhone notch and home bar instead of leaving a mismatched strip, add `viewport-fit=cover` to your viewport meta:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

## Motion engines (GSAP, Lenis) — loaded on demand, not bundled

Kineto does **not** bundle GSAP or Lenis. They are third-party engines with their own licences and release cadence, so shipping copies inside Kineto would mean redistributing them and pinning their versions. Instead Kineto loads an engine only when an effect actually needs one, and only if the page doesn't already have it:

1. **Already on the page** — if you (or your bundler) expose `window.gsap` / `window.Lenis`, Kineto detects and uses that instance. Nothing extra is fetched, and there's never a duplicate-GSAP conflict.
2. **Otherwise, fetched on demand** — the first time a GSAP-backed effect (reveal, scroll-scrub, sticky, text…) initialises, Kineto injects the official GSAP + ScrollTrigger `<script>` from jsDelivr. Smooth scroll does the same with Lenis when you call `enableSmooth()`. A page that uses only CSS-based effects never loads GSAP at all.

If the CDN is blocked or offline, those effects fall back to native behaviour instead of erroring. Every non-GSAP effect (cursor, media, most UI, CSS-timeline scroll) works with no engine at all.

You stay in control of the source — pin an exact version, self-host, or point at an internal mirror:

```js
Kineto.setEngineSource({
  gsap: 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js',
  scrollTrigger: 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js',
  lenis: 'https://cdn.jsdelivr.net/npm/lenis@1.1.0/dist/lenis.min.js'
});
```

Prefer to manage them yourself? Add the `<script>` tags (or `npm install gsap lenis` as optional peers and set the globals) before Kineto initialises, and it will use those instead of fetching anything:

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js"></script>
```

Smooth scroll is off by default and opt-in at runtime.

```js
Kineto.enableSmooth({ lerp: 0.08 });
Kineto.disableSmooth();
```

## Modules

| Module | Activation attribute | Purpose |
|---|---|---|
| `accordion` | `data-kt-accordion` | Accessible `<details>` accordion, CSS-customizable arrow |
| `ambientMedia` | `data-kt-ambient-media` | Ambient glow sampled from media |
| `blurText` | `data-kt-blur-text` | Per-character blur reveal |
| `bottomSheet` | `data-kt-bottom-sheet` | Draggable bottom sheet with focus trap |
| `brushReveal` | `data-kt-brush-reveal` | Pointer brush-mask reveal / scratch card |
| `cardGlow` | `data-kt-card-glow` | Pointer spotlight, surface sheen, luminous border |
| `confetti` | `data-kt-confetti` | Click / view confetti burst |
| `counter` | `data-kt-counter` | Number count, flip, clock, countdown |
| `coverReveal` | `data-kt-cover-reveal` | Color cover wipe reveal |
| `cssScroll` | `data-kt-css-scroll` | Scroll bound to CSS vars / scroll & view timeline |
| `cursor` | `data-kt-cursor` | Eleven custom cursor presets |
| `drag` | `data-kt-drag` | Drag with inertia, bounds, snap-back, keyboard |
| `flip` | `data-kt-flip` | FLIP layout animation on reorder / add / remove |
| `fullpage` | `data-kt-fullpage` | Fullpage section paging (x / y / mixed axis) |
| `gesture` | `data-kt-gesture` | whileHover / whileTap spring feedback |
| `glitch` | `data-kt-glitch` | RGB slice and glitch reveal |
| `hold` | `data-kt-hold` | Hold / mash-to-confirm gauge |
| `horizontalScroll` | `data-kt-horizontal-scroll` | Pinned horizontal scroll section |
| `lazy` | `data-kt-lazy` | Image load effects (skeleton, pixelate, print, dissolve) |
| `lightbox` | `data-kt-lightbox` | Full-screen viewer, groups, zoom, minimap, filmstrip |
| `loader` | `data-kt-loader` | Loader bound to real progress sources |
| `magnetic` | `data-kt-magnetic` | Magnetic pointer response |
| `marquee` | `data-kt-marquee` | Continuous marquee |
| `megaMenu` | `data-kt-mega-menu` | GNB dropdown / mega menu (keyboard + aria) |
| `mouseParallax` | `data-kt-mouse-parallax` | Pointer / gyroscope parallax |
| `overflowText` | `data-kt-overflow-text` | Ways to handle overflowing text + item scenes |
| `pageReveal` | `data-kt-page-reveal` | Page-entry overlay |
| `pageTransition` | `data-kt-page-transition` | Same-origin page transitions |
| `parallax` | `data-kt-parallax` | Scroll parallax |
| `progress` | `data-kt-progress` | Reading progress bar / ring |
| `radial` | `data-kt-radial` | Radial (wheel) carousel |
| `reveal` | `data-kt-reveal` | Scroll-entry reveal |
| `ripple` | `data-kt-ripple` | Click ripple |
| `scrollSequence` | `data-kt-scroll-sequence` | Image-sequence scrubbing |
| `scrollShadows` | `data-kt-scroll-shadows` | CSS edge shadows on scroll containers |
| `scrollVelocity` | `data-kt-scroll-velocity` | Scroll speed / direction response |
| `slider` | `data-kt-slider` | Slide and coverflow |
| `stickyHeader` | `data-kt-sticky-header` | Shrinking / cover-to-fixed sticky header |
| `stickyStack` | `data-kt-sticky-stack` | Sticky stack (vertical / horizontal / floating) |
| `switch` | `data-kt-switch` | Accessible toggle switch (form-usable) |
| `tabs` | `data-kt-tabs` | WAI-ARIA tabs, segmented control |
| `textFill` | `data-kt-text-fill` | Scroll-driven text fill |
| `textReveal` | `data-kt-text-reveal` | Text reveal (incl. Hangul composition) |
| `textSplit` | `data-kt-text-split` | Character / word split motion |
| `textTransition` | `data-kt-text-transition` | Text swap transitions (direction options) |
| `tilt` | `data-kt-tilt` | 3D tilt and glare |
| `toast` | `data-kt-toast` | Status toast (role=status/alert) |
| `tooltip` | `data-kt-tooltip` | Accessible tooltip (auto-placement) |
| `typewriter` | `data-kt-typewriter` | Typing effect |
| `vibrate` | `data-kt-vibrate` | Haptic vibration feedback |

For each module's variants and full option list, see the [module reference](docs/module-reference.md) and `kineto.features.json`.

## Framework adapters

```jsx
import { Motion } from '@dong-gri/kineto/react';
<Motion as="h2" type="textReveal" options={{ mode: 'hangul' }}>Hello</Motion>
```

```js
import KinetoVue from '@dong-gri/kineto/vue';
app.use(KinetoVue);
```

```js
import installKineto from '@dong-gri/kineto/jquery';
installKineto(window.jQuery);
$('.card').kineto('reveal', { preset: 'fade-up' });
```

## Browser support

Latest Chrome, Edge, Firefox, and Safari (desktop and mobile). With `prefers-reduced-motion` enabled, every module renders its final state without animation; on unsupported environments the effects degrade to static content.

## Build

```bash
npm install
npm run build   # emits dist/
npm run ci      # lint, build, Node/Chromium tests, contract and package checks
npm run verify  # full CI suite plus dependency security audit
```

## License

MIT © [dongri.me](https://dongri.me) · Built with AI vibe-coding.
