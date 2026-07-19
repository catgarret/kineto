<div align="center">

<img src="assets/logo.svg" width="72" height="72" alt="MotionKit">

# MotionKit

Un toolkit di interazioni web guidato da attributi HTML o da un'API JavaScript

[한국어](README.ko.md) · [English](README.md) · [日本語](README.jp.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Русский](README.ru.md) · Italiano

[![npm](https://img.shields.io/npm/v/@dong-gri/motionkit.svg)](https://www.npmjs.com/package/@dong-gri/motionkit) [![license](https://img.shields.io/npm/l/@dong-gri/motionkit.svg)](LICENSE) [![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/@dong-gri/motionkit.svg)](https://www.jsdelivr.com/package/npm/@dong-gri/motionkit)

[Demo dal vivo](https://git.dongri.me/example/motionKit) · [Riferimento moduli](docs/module-reference.md) · [Contratto delle funzionalità](FEATURE_CONTRACT.md)

</div>

---

MotionKit è una libreria di 34 moduli di interazione — movimento, media, scroll, loader e testo — che colleghi con un solo attributo `data-mk-*` o controlli con precisione tramite un'API JavaScript. Il core non ha dipendenze obbligatorie e, su browser non supportati o dispositivi datati, gli effetti si disattivano mentre il contenuto resta intatto.

> Lavori con strumenti di coding AI (Cursor, Claude, ecc.)? Vedi la [guida ai prompt AI](AI-PROMPT-GUIDE.md): contiene un'istruzione pronta da incollare che indica all'assistente di usare prima i moduli MotionKit per movimento e interazioni.

## Installazione

### npm

```bash
npm install @dong-gri/motionkit
```

```js
import MotionKit from '@dong-gri/motionkit';
import '@dong-gri/motionkit/style.css';

MotionKit.autoInit();
```

### CDN (tag script, senza build)

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

## Avvio rapido

Tutto funziona con i soli attributi HTML.

```html
<h2 data-mk-text-reveal="stream">Testo che appare a flusso</h2>
<strong data-mk-counter="pop" data-mk-to="98760" data-mk-format=",">98,760</strong>
<img data-mk-lazy="skeleton" data-src="./cover.webp" alt="Cover">
<section data-mk-reveal="fade-up">Appare allo scroll</section>
```

Le stesse funzioni sono disponibili tramite l'API JavaScript.

```js
MotionKit.counter('#total', { preset: 'pop', to: 98760, format: ',' });
MotionKit.reveal('.card', { preset: 'fade-up', stagger: 0.06 });
const lightbox = MotionKit.lightbox('.gallery img', { group: 'work', minimap: true });
```

## Dipendenze opzionali

Il core funziona da solo. Se nella pagina sono presenti GSAP + ScrollTrigger (scrub allo scroll) o Lenis (smooth scroll), MotionKit li rileva e li usa automaticamente; altrimenti ricade sulle API standard.

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js"></script>
```

Lo smooth scroll è disattivato per impostazione predefinita e si attiva a runtime quando serve.

```js
MotionKit.enableSmooth({ lerp: 0.08 });
MotionKit.disableSmooth();
```

## Moduli

| Modulo | Attributo di attivazione | Scopo |
|---|---|---|
| `ambientMedia` | `data-mk-ambient-media` | Luce ambientale dai media |
| `blurText` | `data-mk-blur-text` | Comparsa sfocata lettera per lettera |
| `brushReveal` | `data-mk-brush-reveal` | Rivelazione a pennello col puntatore |
| `cardGlow` | `data-mk-card-glow` | Faretto, riflesso di superficie, bordo luminoso |
| `counter` | `data-mk-counter` | Conteggio, flip, orologio, conto alla rovescia |
| `cssScroll` | `data-mk-css-scroll` | Collegato a variabili CSS / animation timeline |
| `cursor` | `data-mk-cursor` | Undici preset di cursore |
| `fullpage` | `data-mk-fullpage` | Paginazione a schermo intero (x / y / asse misto) |
| `glitch` | `data-mk-glitch` | Slice RGB e comparsa glitch |
| `lazy` | `data-mk-lazy` | Effetti di caricamento immagini (skeleton, pixelate, print, dissolve) |
| `lightbox` | `data-mk-lightbox` | Viewer a schermo intero, gruppi, zoom, minimappa |
| `loader` | `data-mk-loader` | Loader legato al progresso reale |
| `magnetic` | `data-mk-magnetic` | Risposta magnetica al puntatore |
| `marquee` | `data-mk-marquee` | Marquee continuo |
| `mouseParallax` | `data-mk-mouse-parallax` | Parallasse da puntatore / giroscopio |
| `overflowText` | `data-mk-overflow-text` | Otto modi di gestire il testo in eccesso |
| `pageReveal` | `data-mk-page-reveal` | Overlay di ingresso pagina |
| `pageTransition` | `data-mk-page-transition` | Transizioni tra pagine della stessa origine |
| `parallax` | `data-mk-parallax` | Parallasse allo scroll |
| `progress` | `data-mk-progress` | Barra/anello di avanzamento lettura |
| `reveal` | `data-mk-reveal` | Comparsa all'ingresso in viewport |
| `ripple` | `data-mk-ripple` | Ripple al clic |
| `scrollSequence` | `data-mk-scroll-sequence` | Scrub di sequenze di immagini |
| `scrollVelocity` | `data-mk-scroll-velocity` | Risposta a velocità/direzione di scroll |
| `shuffle` | `data-mk-shuffle` | Decodifica con mescolamento caratteri |
| `slider` | `data-mk-slider` | Slide e coverflow |
| `stickyStack` | `data-mk-sticky-stack` | Stack sticky (verticale/orizzontale/flottante) |
| `textFill` | `data-mk-text-fill` | Riempimento testo guidato dallo scroll |
| `textReveal` | `data-mk-text-reveal` | Comparsa del testo (incl. composizione hangul) |
| `textSplit` | `data-mk-text-split` | Movimento per lettere/parole |
| `textTransition` | `data-mk-text-transition` | Transizioni di sostituzione testo |
| `tilt` | `data-mk-tilt` | Inclinazione 3D e riflesso |
| `typewriter` | `data-mk-typewriter` | Effetto macchina da scrivere |
| `vibrate` | `data-mk-vibrate` | Feedback aptico di vibrazione |

Per varianti e opzioni complete di ogni modulo, vedi il [riferimento moduli](docs/module-reference.md) e `motionkit.features.json`.

## Adattatori per framework

```jsx
import { Motion } from '@dong-gri/motionkit/react';
<Motion as="h2" type="textReveal" options={{ mode: 'hangul' }}>Ciao</Motion>
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

## Supporto browser

Chrome, Edge, Firefox e Safari più recenti (desktop e mobile). Con `prefers-reduced-motion` attivo, ogni modulo mostra lo stato finale senza animazione; negli ambienti non supportati gli effetti si riducono a contenuto statico.

## Build

```bash
npm install
npm run build   # genera dist/
npm run verify  # lint, build, test, controlli del contratto
```

## Licenza

MIT © [dongri](https://dongri.me)
