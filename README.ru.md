<div align="center">

<img src="assets/logo.svg" width="72" height="72" alt="MotionKit">

# MotionKit

Инструментарий веб-интеракций, управляемый HTML-атрибутами или JavaScript API

[한국어](README.ko.md) · [English](README.md) · [日本語](README.jp.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · Русский · [Italiano](README.it.md)

[![npm](https://img.shields.io/npm/v/@dong-gri/motionkit.svg)](https://www.npmjs.com/package/@dong-gri/motionkit) [![license](https://img.shields.io/npm/l/@dong-gri/motionkit.svg)](LICENSE) [![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/@dong-gri/motionkit.svg)](https://www.jsdelivr.com/package/npm/@dong-gri/motionkit)

[Живое демо](https://git.dongri.me/example/motionKit) · [Справочник модулей](docs/module-reference.md) · [Контракт возможностей](FEATURE_CONTRACT.md)

</div>

---

MotionKit — библиотека из 34 интерактивных модулей (движение, медиа, скролл, лоадер, текст), которые подключаются одним атрибутом `data-mk-*` или точно управляются через JavaScript API. Ядро не имеет обязательных зависимостей; в неподдерживаемых браузерах и на слабых устройствах эффекты отключаются, а контент остаётся нетронутым.

> Работаете с ИИ-инструментами (Cursor, Claude и т. п.)? Смотрите [руководство по промтам для ИИ](AI-PROMPT-GUIDE.md) — там есть готовая инструкция, которая велит ассистенту в первую очередь использовать модули MotionKit для движения и интеракций.

## Установка

### npm

```bash
npm install @dong-gri/motionkit
```

```js
import MotionKit from '@dong-gri/motionkit';
import '@dong-gri/motionkit/style.css';

MotionKit.autoInit();
```

### CDN (тег script, без сборки)

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

## Быстрый старт

Всё работает через одни только HTML-атрибуты.

```html
<h2 data-mk-text-reveal="stream">Текст, который «вытекает»</h2>
<strong data-mk-counter="pop" data-mk-to="98760" data-mk-format=",">98,760</strong>
<img data-mk-lazy="skeleton" data-src="./cover.webp" alt="Cover">
<section data-mk-reveal="fade-up">Появляется при прокрутке</section>
```

Те же возможности доступны через JavaScript API.

```js
MotionKit.counter('#total', { preset: 'pop', to: 98760, format: ',' });
MotionKit.reveal('.card', { preset: 'fade-up', stagger: 0.06 });
const lightbox = MotionKit.lightbox('.gallery img', { group: 'work', minimap: true });
```

## Необязательные зависимости

Ядро работает самостоятельно. Если на странице есть GSAP + ScrollTrigger (scrub при скролле) или Lenis (плавный скролл), MotionKit сам их обнаружит и задействует; иначе используется откат на стандартные API.

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js"></script>
```

Плавный скролл по умолчанию выключен и включается по требованию во время выполнения.

```js
MotionKit.enableSmooth({ lerp: 0.08 });
MotionKit.disableSmooth();
```

## Модули

| Модуль | Атрибут активации | Назначение |
|---|---|---|
| `ambientMedia` | `data-mk-ambient-media` | Окружающее свечение от медиа |
| `blurText` | `data-mk-blur-text` | Проявление по буквам с размытием |
| `brushReveal` | `data-mk-brush-reveal` | Проявление маской-кистью по курсору |
| `cardGlow` | `data-mk-card-glow` | Прожектор, блик поверхности, светящаяся рамка |
| `counter` | `data-mk-counter` | Счётчик, флип, часы, обратный отсчёт |
| `cssScroll` | `data-mk-css-scroll` | Привязка к CSS-переменным / animation timeline |
| `cursor` | `data-mk-cursor` | Одиннадцать пресетов курсора |
| `fullpage` | `data-mk-fullpage` | Постраничная прокрутка (x / y / смешанная ось) |
| `glitch` | `data-mk-glitch` | RGB-срез и глитч-проявление |
| `lazy` | `data-mk-lazy` | Эффекты загрузки изображений (skeleton, pixelate, print, dissolve) |
| `lightbox` | `data-mk-lightbox` | Полноэкранный просмотрщик, группы, зум, миникарта |
| `loader` | `data-mk-loader` | Лоадер, привязанный к реальному прогрессу |
| `magnetic` | `data-mk-magnetic` | Магнитная реакция на курсор |
| `marquee` | `data-mk-marquee` | Непрерывная бегущая строка |
| `mouseParallax` | `data-mk-mouse-parallax` | Параллакс по курсору / гироскопу |
| `overflowText` | `data-mk-overflow-text` | Восемь способов обработки переполнения текста |
| `pageReveal` | `data-mk-page-reveal` | Оверлей входа на страницу |
| `pageTransition` | `data-mk-page-transition` | Переходы между страницами одного источника |
| `parallax` | `data-mk-parallax` | Параллакс при скролле |
| `progress` | `data-mk-progress` | Индикатор чтения (полоса/кольцо) |
| `reveal` | `data-mk-reveal` | Проявление при скролле |
| `ripple` | `data-mk-ripple` | Рябь по клику |
| `scrollSequence` | `data-mk-scroll-sequence` | Скраб последовательности кадров |
| `scrollVelocity` | `data-mk-scroll-velocity` | Реакция на скорость/направление скролла |
| `shuffle` | `data-mk-shuffle` | Декодирование перемешиванием символов |
| `slider` | `data-mk-slider` | Слайдер и coverflow |
| `stickyStack` | `data-mk-sticky-stack` | Липкий стек (вертикальный/горизонтальный/плавающий) |
| `textFill` | `data-mk-text-fill` | Заливка текста при скролле |
| `textReveal` | `data-mk-text-reveal` | Проявление текста (в т. ч. хангыль) |
| `textSplit` | `data-mk-text-split` | Движение по буквам/словам |
| `textTransition` | `data-mk-text-transition` | Переходы при смене текста |
| `tilt` | `data-mk-tilt` | 3D-наклон и блик |
| `typewriter` | `data-mk-typewriter` | Эффект печатной машинки |
| `vibrate` | `data-mk-vibrate` | Тактильная вибро-отдача |

Варианты и полный список опций каждого модуля — в [справочнике модулей](docs/module-reference.md) и `motionkit.features.json`.

## Адаптеры фреймворков

```jsx
import { Motion } from '@dong-gri/motionkit/react';
<Motion as="h2" type="textReveal" options={{ mode: 'hangul' }}>Привет</Motion>
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

## Поддержка браузеров

Актуальные Chrome, Edge, Firefox и Safari (десктоп и мобильные). При включённом `prefers-reduced-motion` каждый модуль показывает финальное состояние без анимации; в неподдерживаемых средах эффекты сводятся к статичному контенту.

## Сборка

```bash
npm install
npm run build   # создаёт dist/
npm run verify  # линт, сборка, тесты, проверки контракта
```

## Лицензия

MIT © [dongri](https://dongri.me)
