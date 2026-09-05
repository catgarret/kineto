<div align="center">

<img src="../assets/logo.svg" width="72" height="72" alt="Kineto">

# Kineto

Un toolkit di interazioni web guidato da attributi HTML o da un'API JavaScript

[한국어](README.ko.md) · [English](../README.md) · [日本語](README.jp.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Русский](README.ru.md) · Italiano

<p><a href="https://www.npmjs.com/package/@dong-gri/kineto"><img src="https://img.shields.io/npm/v/@dong-gri/kineto.svg" alt="npm" height="20"></a>&nbsp;&nbsp;<a href="../LICENSE"><img src="https://img.shields.io/npm/l/@dong-gri/kineto.svg" alt="license" height="20"></a>&nbsp;&nbsp;<a href="https://www.jsdelivr.com/package/npm/@dong-gri/kineto"><img src="https://img.shields.io/jsdelivr/npm/hm/@dong-gri/kineto.svg" alt="jsDelivr" height="20"></a></p>

[Demo dal vivo](https://kineto.dongri.me) · [Riferimento moduli](../docs/module-reference.md) · [Risoluzione dei problemi](../docs/troubleshooting.md) · [Contratto delle funzionalità](../FEATURE_CONTRACT.md)

</div>

---

Kineto è una libreria di 52 moduli di interazione — movimento, media, scroll, loader e testo — che colleghi con un solo attributo `data-kt-*` o controlli con precisione tramite un'API JavaScript. Il core non ha dipendenze obbligatorie e, su browser non supportati o dispositivi datati, gli effetti si disattivano mentre il contenuto resta intatto.

> Lavori con strumenti di coding AI (Cursor, Claude, ecc.)? Vedi la [guida ai prompt AI](../AI-PROMPT-GUIDE.md): contiene un'istruzione pronta da incollare che indica all'assistente di usare prima i moduli Kineto per movimento e interazioni.

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

### iOS edge-to-edge (notch e home bar)

Gli effetti a schermo intero (loader, page reveal, page transition) coprono l'intero viewport. Perché si estendano sotto il notch e la home bar dell'iPhone (invece di lasciare una striscia di colore diverso), aggiungi `viewport-fit=cover` al meta viewport:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

## motore di movimento

Kineto non include GSAP e Lenis nel suo pacchetto.
L'effetto richiesto verrà caricato dal CDN la prima volta che lo utilizzi e, se esiste già
un'istanza sulla pagina, verrà utilizzata.
Se una CDN non è disponibile, mantieni il contenuto statico e torna al comportamento standard.
I motori CDN predefiniti usano la verifica di integrità SHA-384. Se cambi un URL, imposta anche il valore integrity del file corrispondente.

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
| `ambientMedia` | `data-kt-ambient-media` | Luce ambientale estratta dai media |
| `blurText` | `data-kt-blur-text` | Sfoca la voce per lettera |
| `brushReveal` | `data-kt-brush-reveal` | Maschera pennello puntatore |
| `cardGlow` | `data-kt-card-glow` | Faretto puntatore/riflesso/luce esterna |
| `counter` | `data-kt-counter` | Conteggio dei numeri, rotazione, orologio, conto alla rovescia |
| `dateTime` | `data-kt-date-time` | Data del server in tempo relativo e assoluto |
| `cssScroll` | `data-kt-css-scroll` | Integrazione di variabili CSS/sequenza temporale di scorrimento |
| `cursor` | `data-kt-cursor` | 11 cursori personalizzati |
| `fullpage` | `data-kt-fullpage` | Pagina intera asse verticale/orizzontale/misto |
| `glitch` | `data-kt-glitch` | Problema relativo alla porzione/pixel RGB |
| `lazy` | `data-kt-lazy` | Scheletro·Pixel·Stampa·Dissolvi caricamento |
| `lightbox` | `data-kt-lightbox` | Visualizzatore a schermo intero Gruppo/Zoom/Minimappa |
| `loader` | `data-kt-loader` | Caricatore collegato al progresso reale |
| `loadingIndicator` | `data-kt-loading-indicator` | Spinner, barre, riflessi e indicatori simbolici inline |
| `magnetic` | `data-kt-magnetic` | reazione del magnete puntatore |
| `marquee` | `data-kt-marquee` | tendone continuo |
| `mouseParallax` | `data-kt-mouse-parallax` | Parallasse puntatore/giroscopio |
| `overflowText` | `data-kt-overflow-text` | Gestione del testo in eccesso |
| `pageReveal` | `data-kt-page-reveal` | Sovrapposizione dell'immissione della pagina |
| `pageTransition` | `data-kt-page-transition` | Conversione di pagine della stessa origine |
| `parallax` | `data-kt-parallax` | parallasse dello scorrimento |
| `progress` | `data-kt-progress` | Lettura della barra di avanzamento e dell'anello |
| `reveal` | `data-kt-reveal` | Rivela voce di scorrimento |
| `ripple` | `data-kt-ripple` | fare clic su ondulazione |
| `scrollSequence` | `data-kt-scroll-sequence` | Scrub sequenza di immagini |
| `scrollVelocity` | `data-kt-scroll-velocity` | Risposta di velocità/direzione di scorrimento |
| `slider` | `data-kt-slider` | Slide, coverflow, pile e carosello radiale |
| `radial` | `data-kt-radial` | Punto di ingresso compatibile per il carosello radiale |
| `stickyStack` | `data-kt-sticky-stack` | Pila adesiva verticale, orizzontale e mobile |
| `textFill` | `data-kt-text-fill` | riempimento del testo scorrevole |
| `textReveal` | `data-kt-text-reveal` | Shuffle, decodifica, rivelazione combinazione Hangul |
| `textSplit` | `data-kt-text-split` | Movimento di segmentazione di lettere/parole |
| `textTransition` | `data-kt-text-transition` | Sostituzione di frasi |
| `tilt` | `data-kt-tilt` | Inclinazione 3D, abbagliamento, ombra |
| `typewriter` | `data-kt-typewriter` | Digitazione combinata coreana |
| `vibrate` | `data-kt-vibrate` | Feedback di vibrazione tattile |
| `confetti` | `data-kt-confetti` | Effetto coriandoli clic/entrata |
| `accordion` | `data-kt-accordion` | dettagli secondo la fisarmonica per supportare l'accessibilità |
| `hold` | `data-kt-hold` | Indicatore di conferma pressione prolungata/colpi multipli |
| `megaMenu` | `data-kt-mega-menu` | Menu mega tastiera/ARIA |
| `toast` | `data-kt-toast` | Notifica del brindisi sullo stato |
| `bottomSheet` | `data-kt-bottom-sheet` | Il foglio inferiore supporta il blocco della messa a fuoco |
| `tabs` | `data-kt-tabs` | Controllo scheda/segmento WAI-ARIA |
| `coverReveal` | `data-kt-cover-reveal` | rivelazione della copertina a colori |
| `gesture` | `data-kt-gesture` | Feedback al passaggio del mouse/spinta della molla |
| `drag` | `data-kt-drag` | Inerzia, confine, resistenza allo snapback |
| `tooltip` | `data-kt-tooltip` | Posiziona la descrizione comando di correzione automatica |
| `switch` | `data-kt-switch` | Interruttori di accessibilità utilizzati nei moduli |
| `flip` | `data-kt-flip` | Ordina/Aggiungi/Elimina conversione FLIP |
| `scrollShadows` | `data-kt-scroll-shadows` | ombra del bordo di scorrimento |
| `stickyHeader` | `data-kt-sticky-header` | Testata fissa pieghevole/con copertura |
| `horizontalScroll` | `data-kt-horizontal-scroll` | Corretto lo scorrimento orizzontale |

Per varianti e opzioni complete di ogni modulo, vedi il [riferimento moduli](../docs/module-reference.md) e `kineto.features.json`.

## Adattatori per framework

```jsx
import { Motion } from '@dong-gri/kineto/react';
<Motion as="h2" type="textReveal" options={{ mode: 'hangul' }}>Ciao</Motion>
```

```js
import KinetoVue from '@dong-gri/kineto/vue';
app.use(KinetoVue);
```

Gli aggiornamenti delle opzioni negli adattatori seguono una politica esplicita
di sostituzione. React ricrea il modulo solo quando cambia `type` o un valore in
`dependencies`; `useKineto()` di Vue fa lo stesso per `watchSources`, mentre
`v-motion` sostituisce l'istanza quando cambia il binding. Vue accetta un oggetto
options, un ref o un getter; usa un ref/getter quando la sostituzione deve leggere
valori cambiati dopo `setup()`. L'adattatore valuta la sorgente delle opzioni subito
prima di ogni create. La pulizia viene sempre eseguita prima della sostituzione. Gli
adattatori non tentano di dedurre se un singolo modulo supporti una chiamata parziale
a `updateModule()`. Per aggiornamenti live imperativi, conserva l'istanza restituita
oppure chiama direttamente l'API Core.

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
npm run ci      # lint, build, test Node/Chromium, contratto e pacchetto
npm run verify  # suite CI completa + audit di sicurezza delle dipendenze
```

## Licenza

MIT © [dongri.me](https://dongri.me)
