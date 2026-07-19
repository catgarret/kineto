<div align="center">

<img src="assets/logo.svg" width="72" height="72" alt="MotionKit">

# MotionKit

**Interactive web motion effects with live controls and copy-ready code — for Vanilla JavaScript, React, Vue, and jQuery.**

실시간으로 조절하고 코드를 그대로 복사해 쓰는 웹 모션 라이브러리 — 바닐라 JS · React · Vue · jQuery 지원.

English · [한국어](README.ko.md) · [日本語](README.jp.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Русский](README.ru.md) · [Italiano](README.it.md)

[![npm](https://img.shields.io/npm/v/@dong-gri/motionkit.svg)](https://www.npmjs.com/package/@dong-gri/motionkit) [![license](https://img.shields.io/npm/l/@dong-gri/motionkit.svg)](LICENSE) [![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/@dong-gri/motionkit.svg)](https://www.jsdelivr.com/package/npm/@dong-gri/motionkit)

[Live demo](https://git.dongri.me/example/motionKit) · [Module reference](docs/module-reference.md) · [AI prompt guide](AI-PROMPT-GUIDE.md) · [Feature contract](FEATURE_CONTRACT.md)

</div>

---

MotionKit is a library of 34 interaction modules — motion, media, scroll, loader, and text — that you attach with a single `data-mk-*` attribute or control precisely through a JavaScript API. The core has no required dependencies, and on unsupported browsers or low-end devices the effects switch off while the content stays intact.

> Building with an AI coding tool (Cursor, Claude, etc.)? See the [AI prompt guide](AI-PROMPT-GUIDE.md) — it includes a ready-to-paste instruction that tells the assistant to reach for MotionKit modules first for motion and interaction.

## Highlights

Every effect is tunable in the [live demo](https://git.dongri.me/example/motionKit): adjust the options, hit Apply, and copy the resulting HTML or JavaScript.

| Effect | Module | What it does |
|---|---|---|
| Progressive Print | `lazy` | Images resolve in like an inkjet print — line by line, low to high resolution |
| Card Spotlight & Reflection | `cardGlow` | Pointer-tracked spotlight, surface sheen, and a luminous border on cards |
| Text Transition | `textTransition` | Swap phrases with slide, blur, or scale transitions |
| ScrollVelocity | `scrollVelocity` | Skew, scale, and shift elements in response to scroll speed and direction |
| Lightbox | `lightbox` | Full-screen image viewer with groups, zoom, and a minimap |

See the [full module list](#modules) below for all 34 modules.

## Installation

### npm

```bash
npm install @dong-gri/motionkit
```

```js
import MotionKit from '@dong-gri/motionkit';
import '@dong-gri/motionkit/style.css';

MotionKit.autoInit();
```

### CDN (script tag, no build step)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@dong-gri/motionkit/dist/motionkit.min.css">
<script src="https://cdn.jsdelivr.net/npm/@dong-gri/motionkit/dist/motionkit.umd.min.js"></script>
<script>
  MotionKit.autoInit();
</script>
```

### CDN (ESM)

```js
import MotionKit from 'https://cdn.jsdelivr.net/npm/@dong-gri/motionkit/+esm';
```

## Quick start

Everything works from HTML attributes alone.

```html
<h2 data-mk-text-reveal="stream">Text that streams in</h2>
<strong data-mk-counter="pop" data-mk-to="98760" data-mk-format=",">98,760</strong>
<img data-mk-lazy="skeleton" data-src="./cover.webp" alt="Cover">
<section data-mk-reveal="fade-up">Appears on scroll</section>
```

The same features are available through the JavaScript API.

```js
MotionKit.counter('#total', { preset: 'pop', to: 98760, format: ',' });
MotionKit.reveal('.card', { preset: 'fade-up', stagger: 0.06 });
const lightbox = MotionKit.lightbox('.gallery img', { group: 'work', minimap: true });
```

## Optional dependencies

The core runs on its own. If GSAP + ScrollTrigger (scroll scrubbing) or Lenis (smooth scroll) are present on the page, MotionKit detects and uses them automatically; otherwise it falls back to standard APIs.

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js"></script>
```

Smooth scroll is off by default and opt-in at runtime.

```js
MotionKit.enableSmooth({ lerp: 0.08 });
MotionKit.disableSmooth();
```

## Modules

| Module | Activation attribute | Purpose |
|---|---|---|
| `ambientMedia` | `data-mk-ambient-media` | Ambient glow sampled from media |
| `blurText` | `data-mk-blur-text` | Per-character blur reveal |
| `brushReveal` | `data-mk-brush-reveal` | Pointer brush-mask reveal |
| `cardGlow` | `data-mk-card-glow` | Pointer spotlight, surface sheen, luminous border |
| `counter` | `data-mk-counter` | Number count, flip, clock, countdown |
| `cssScroll` | `data-mk-css-scroll` | Scroll bound to CSS vars / animation timeline |
| `cursor` | `data-mk-cursor` | Eleven custom cursor presets |
| `fullpage` | `data-mk-fullpage` | Fullpage section paging (x / y / mixed axis) |
| `glitch` | `data-mk-glitch` | RGB slice and glitch reveal |
| `lazy` | `data-mk-lazy` | Image load effects (skeleton, pixelate, print, dissolve) |
| `lightbox` | `data-mk-lightbox` | Full-screen viewer, groups, zoom, minimap |
| `loader` | `data-mk-loader` | Loader bound to real progress sources |
| `magnetic` | `data-mk-magnetic` | Magnetic pointer response |
| `marquee` | `data-mk-marquee` | Continuous marquee |
| `mouseParallax` | `data-mk-mouse-parallax` | Pointer / gyroscope parallax |
| `overflowText` | `data-mk-overflow-text` | Eight ways to handle overflowing text |
| `pageReveal` | `data-mk-page-reveal` | Page-entry overlay |
| `pageTransition` | `data-mk-page-transition` | Same-origin page transitions |
| `parallax` | `data-mk-parallax` | Scroll parallax |
| `progress` | `data-mk-progress` | Reading progress bar / ring |
| `reveal` | `data-mk-reveal` | Scroll-entry reveal |
| `ripple` | `data-mk-ripple` | Click ripple |
| `scrollSequence` | `data-mk-scroll-sequence` | Image-sequence scrubbing |
| `scrollVelocity` | `data-mk-scroll-velocity` | Scroll speed / direction response |
| `shuffle` | `data-mk-shuffle` | Character shuffle decode |
| `slider` | `data-mk-slider` | Slide and coverflow |
| `stickyStack` | `data-mk-sticky-stack` | Sticky stack (vertical / horizontal / floating) |
| `textFill` | `data-mk-text-fill` | Scroll-driven text fill |
| `textReveal` | `data-mk-text-reveal` | Text reveal (incl. Hangul composition) |
| `textSplit` | `data-mk-text-split` | Character / word split motion |
| `textTransition` | `data-mk-text-transition` | Text swap transitions |
| `tilt` | `data-mk-tilt` | 3D tilt and glare |
| `typewriter` | `data-mk-typewriter` | Typing effect |
| `vibrate` | `data-mk-vibrate` | Haptic vibration feedback |

For each module's variants and full option list, see the [module reference](docs/module-reference.md) and `motionkit.features.json`.

## Framework adapters

```jsx
import { Motion } from '@dong-gri/motionkit/react';
<Motion as="h2" type="textReveal" options={{ mode: 'hangul' }}>Hello</Motion>
```

```js
import MotionKitVue from '@dong-gri/motionkit/vue';
app.use(MotionKitVue);
```

```js
import installMotionKit from '@dong-gri/motionkit/jquery';
installMotionKit(window.jQuery);
$('.card').motionKit('reveal', { preset: 'fade-up' });
```

## Browser support

Latest Chrome, Edge, Firefox, and Safari (desktop and mobile). With `prefers-reduced-motion` enabled, every module renders its final state without animation; on unsupported environments the effects degrade to static content.

## Build

```bash
npm install
npm run build   # emits dist/
npm run verify  # lint, build, tests, contract checks
```

## License

MIT © [dongri](https://dongri.me)
