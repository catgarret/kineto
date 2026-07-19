<div align="center">

<img src="assets/logo.svg" width="72" height="72" alt="Kineto">

# Kineto

Un toolkit di interazioni web guidato da attributi HTML o da un'API JavaScript

[한국어](README.ko.md) · [English](README.md) · [日本語](README.jp.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Русский](README.ru.md) · Italiano

[![npm](https://img.shields.io/npm/v/@dong-gri/kineto.svg)](https://www.npmjs.com/package/@dong-gri/kineto) [![license](https://img.shields.io/npm/l/@dong-gri/kineto.svg)](LICENSE) [![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/@dong-gri/kineto.svg)](https://www.jsdelivr.com/package/npm/@dong-gri/kineto)

[Demo dal vivo](https://git.dongri.me/example/kineto) · [Riferimento moduli](docs/module-reference.md) · [Contratto delle funzionalità](FEATURE_CONTRACT.md)

</div>

---

> **Kineto** — il nome deriva da *kinetic* (dal greco *kínēsis*, “movimento”). Un nome adatto a una libreria dedicata al movimento sul web.

Kineto è una libreria di 34 moduli di interazione — movimento, media, scroll, loader e testo — che colleghi con un solo attributo `data-kt-*` o controlli con precisione tramite un'API JavaScript. Il core non ha dipendenze obbligatorie e, su browser non supportati o dispositivi datati, gli effetti si disattivano mentre il contenuto resta intatto.

> Lavori con strumenti di coding AI (Cursor, Claude, ecc.)? Vedi la [guida ai prompt AI](AI-PROMPT-GUIDE.md): contiene un'istruzione pronta da incollare che indica all'assistente di usare prima i moduli Kineto per movimento e interazioni.

<img src="https://cdn.jsdelivr.net/gh/catgarret/kineto@main/assets/preview/kineto.gif" width="620" alt="Kineto Preview">

## Installazione

### npm

```bash
npm install @dong-gri/kineto
```

```js
import Kineto from '@dong-gri/kineto';
import '@dong-gri/kineto/style.css';

Kineto.autoInit();
```

### CDN (tag script, senza build)

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

## Avvio rapido

Tutto funziona con i soli attributi HTML.

```html
<h2 data-kt-text-reveal="stream">Testo che appare a flusso</h2>
<strong data-kt-counter="pop" data-kt-to="98760" data-kt-format=",">98,760</strong>
<img data-kt-lazy="skeleton" data-src="./cover.webp" alt="Cover">
<section data-kt-reveal="fade-up">Appare allo scroll</section>
```

Le stesse funzioni sono disponibili tramite l'API JavaScript.

```js
Kineto.counter('#total', { preset: 'pop', to: 98760, format: ',' });
Kineto.reveal('.card', { preset: 'fade-up', stagger: 0.06 });
const lightbox = Kineto.lightbox('.gallery img', { group: 'work', minimap: true });
```

## Dipendenze opzionali

Il core funziona da solo. Se nella pagina sono presenti GSAP + ScrollTrigger (scrub allo scroll) o Lenis (smooth scroll), Kineto li rileva e li usa automaticamente; altrimenti ricade sulle API standard.

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js"></script>
```

Lo smooth scroll è disattivato per impostazione predefinita e si attiva a runtime quando serve.

```js
Kineto.enableSmooth({ lerp: 0.08 });
Kineto.disableSmooth();
```

## Moduli

| Modulo | Attributo di attivazione | Scopo |
|---|---|---|
| `ambientMedia` | `data-kt-ambient-media` | Luce ambientale dai media |
| `blurText` | `data-kt-blur-text` | Comparsa sfocata lettera per lettera |
| `brushReveal` | `data-kt-brush-reveal` | Rivelazione a pennello col puntatore |
| `cardGlow` | `data-kt-card-glow` | Faretto, riflesso di superficie, bordo luminoso |
| `counter` | `data-kt-counter` | Conteggio, flip, orologio, conto alla rovescia |
| `cssScroll` | `data-kt-css-scroll` | Collegato a variabili CSS / animation timeline |
| `cursor` | `data-kt-cursor` | Undici preset di cursore |
| `fullpage` | `data-kt-fullpage` | Paginazione a schermo intero (x / y / asse misto) |
| `glitch` | `data-kt-glitch` | Slice RGB e comparsa glitch |
| `lazy` | `data-kt-lazy` | Effetti di caricamento immagini (skeleton, pixelate, print, dissolve) |
| `lightbox` | `data-kt-lightbox` | Viewer a schermo intero, gruppi, zoom, minimappa |
| `loader` | `data-kt-loader` | Loader legato al progresso reale |
| `magnetic` | `data-kt-magnetic` | Risposta magnetica al puntatore |
| `marquee` | `data-kt-marquee` | Marquee continuo |
| `mouseParallax` | `data-kt-mouse-parallax` | Parallasse da puntatore / giroscopio |
| `overflowText` | `data-kt-overflow-text` | Otto modi di gestire il testo in eccesso |
| `pageReveal` | `data-kt-page-reveal` | Overlay di ingresso pagina |
| `pageTransition` | `data-kt-page-transition` | Transizioni tra pagine della stessa origine |
| `parallax` | `data-kt-parallax` | Parallasse allo scroll |
| `progress` | `data-kt-progress` | Barra/anello di avanzamento lettura |
| `reveal` | `data-kt-reveal` | Comparsa all'ingresso in viewport |
| `ripple` | `data-kt-ripple` | Ripple al clic |
| `scrollSequence` | `data-kt-scroll-sequence` | Scrub di sequenze di immagini |
| `scrollVelocity` | `data-kt-scroll-velocity` | Risposta a velocità/direzione di scroll |
| `shuffle` | `data-kt-shuffle` | Decodifica con mescolamento caratteri |
| `slider` | `data-kt-slider` | Slide e coverflow |
| `stickyStack` | `data-kt-sticky-stack` | Stack sticky (verticale/orizzontale/flottante) |
| `textFill` | `data-kt-text-fill` | Riempimento testo guidato dallo scroll |
| `textReveal` | `data-kt-text-reveal` | Comparsa del testo (incl. composizione hangul) |
| `textSplit` | `data-kt-text-split` | Movimento per lettere/parole |
| `textTransition` | `data-kt-text-transition` | Transizioni di sostituzione testo |
| `tilt` | `data-kt-tilt` | Inclinazione 3D e riflesso |
| `typewriter` | `data-kt-typewriter` | Effetto macchina da scrivere |
| `vibrate` | `data-kt-vibrate` | Feedback aptico di vibrazione |

Per varianti e opzioni complete di ogni modulo, vedi il [riferimento moduli](docs/module-reference.md) e `kineto.features.json`.

## Adattatori per framework

```jsx
import { Motion } from '@dong-gri/kineto/react';
<Motion as="h2" type="textReveal" options={{ mode: 'hangul' }}>Ciao</Motion>
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
