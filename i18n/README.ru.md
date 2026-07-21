<div align="center">

<img src="../assets/logo.svg" width="72" height="72" alt="Kineto">

# Kineto

Инструментарий веб-интеракций, управляемый HTML-атрибутами или JavaScript API

[한국어](README.ko.md) · [English](../README.md) · [日本語](README.jp.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · Русский · [Italiano](README.it.md)

[![npm](https://img.shields.io/npm/v/@dong-gri/kineto.svg)](https://www.npmjs.com/package/@dong-gri/kineto) [![license](https://img.shields.io/npm/l/@dong-gri/kineto.svg)](../LICENSE) [![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/@dong-gri/kineto.svg)](https://www.jsdelivr.com/package/npm/@dong-gri/kineto)

[Живое демо](https://git.dongri.me/example/kineto) · [Справочник модулей](../docs/module-reference.md) · [Контракт возможностей](../FEATURE_CONTRACT.md)

</div>

---

> **Kineto** — название происходит от *kinetic* (от греческого *kínēsis* — «движение»). Подходящее имя для библиотеки, посвящённой движению в вебе.

Kineto — библиотека из 34 интерактивных модулей (движение, медиа, скролл, лоадер, текст), которые подключаются одним атрибутом `data-kt-*` или точно управляются через JavaScript API. Ядро не имеет обязательных зависимостей; в неподдерживаемых браузерах и на слабых устройствах эффекты отключаются, а контент остаётся нетронутым.

> Работаете с ИИ-инструментами (Cursor, Claude и т. п.)? Смотрите [руководство по промтам для ИИ](../AI-PROMPT-GUIDE.md) — там есть готовая инструкция, которая велит ассистенту в первую очередь использовать модули Kineto для движения и интеракций.

<img src="https://cdn.jsdelivr.net/gh/catgarret/kineto@main/assets/preview/kineto.gif" width="620" alt="Kineto Preview">

## Установка

### npm

```bash
npm install @dong-gri/kineto
```

```js
import Kineto from '@dong-gri/kineto';
import '@dong-gri/kineto/style.css';

Kineto.autoInit();
```

### CDN (тег script, без сборки)

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

## Быстрый старт

Всё работает через одни только HTML-атрибуты.

```html
<h2 data-kt-text-reveal="stream">Текст, который «вытекает»</h2>
<strong data-kt-counter="pop" data-kt-to="98760" data-kt-format=",">98,760</strong>
<img data-kt-lazy="skeleton" data-src="./cover.webp" alt="Cover">
<section data-kt-reveal="fade-up">Появляется при прокрутке</section>
```

Те же возможности доступны через JavaScript API.

```js
Kineto.counter('#total', { preset: 'pop', to: 98760, format: ',' });
Kineto.reveal('.card', { preset: 'fade-up', stagger: 0.06 });
const lightbox = Kineto.lightbox('.gallery img', { group: 'work', minimap: true });
```

## Необязательные зависимости

Ядро работает самостоятельно. Если на странице есть GSAP + ScrollTrigger (scrub при скролле) или Lenis (плавный скролл), Kineto сам их обнаружит и задействует; иначе используется откат на стандартные API.

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js"></script>
```

Плавный скролл по умолчанию выключен и включается по требованию во время выполнения.

```js
Kineto.enableSmooth({ lerp: 0.08 });
Kineto.disableSmooth();
```

## Модули

| Модуль | Атрибут активации | Назначение |
|---|---|---|
| `ambientMedia` | `data-kt-ambient-media` | Окружающее свечение от медиа |
| `blurText` | `data-kt-blur-text` | Проявление по буквам с размытием |
| `brushReveal` | `data-kt-brush-reveal` | Проявление маской-кистью по курсору |
| `cardGlow` | `data-kt-card-glow` | Прожектор, блик поверхности, светящаяся рамка |
| `counter` | `data-kt-counter` | Счётчик, флип, часы, обратный отсчёт |
| `cssScroll` | `data-kt-css-scroll` | Привязка к CSS-переменным / animation timeline |
| `cursor` | `data-kt-cursor` | Одиннадцать пресетов курсора |
| `fullpage` | `data-kt-fullpage` | Постраничная прокрутка (x / y / смешанная ось) |
| `glitch` | `data-kt-glitch` | RGB-срез и глитч-проявление |
| `lazy` | `data-kt-lazy` | Эффекты загрузки изображений (skeleton, pixelate, print, dissolve) |
| `lightbox` | `data-kt-lightbox` | Полноэкранный просмотрщик, группы, зум, миникарта |
| `loader` | `data-kt-loader` | Лоадер, привязанный к реальному прогрессу |
| `magnetic` | `data-kt-magnetic` | Магнитная реакция на курсор |
| `marquee` | `data-kt-marquee` | Непрерывная бегущая строка |
| `mouseParallax` | `data-kt-mouse-parallax` | Параллакс по курсору / гироскопу |
| `overflowText` | `data-kt-overflow-text` | Восемь способов обработки переполнения текста |
| `pageReveal` | `data-kt-page-reveal` | Оверлей входа на страницу |
| `pageTransition` | `data-kt-page-transition` | Переходы между страницами одного источника |
| `parallax` | `data-kt-parallax` | Параллакс при скролле |
| `progress` | `data-kt-progress` | Индикатор чтения (полоса/кольцо) |
| `reveal` | `data-kt-reveal` | Проявление при скролле |
| `ripple` | `data-kt-ripple` | Рябь по клику |
| `scrollSequence` | `data-kt-scroll-sequence` | Скраб последовательности кадров |
| `scrollVelocity` | `data-kt-scroll-velocity` | Реакция на скорость/направление скролла |
| `shuffle` | `data-kt-shuffle` | Декодирование перемешиванием символов |
| `slider` | `data-kt-slider` | Слайдер и coverflow |
| `stickyStack` | `data-kt-sticky-stack` | Липкий стек (вертикальный/горизонтальный/плавающий) |
| `textFill` | `data-kt-text-fill` | Заливка текста при скролле |
| `textReveal` | `data-kt-text-reveal` | Проявление текста (в т. ч. хангыль) |
| `textSplit` | `data-kt-text-split` | Движение по буквам/словам |
| `textTransition` | `data-kt-text-transition` | Переходы при смене текста |
| `tilt` | `data-kt-tilt` | 3D-наклон и блик |
| `typewriter` | `data-kt-typewriter` | Эффект печатной машинки |
| `vibrate` | `data-kt-vibrate` | Тактильная вибро-отдача |

Варианты и полный список опций каждого модуля — в [справочнике модулей](../docs/module-reference.md) и `kineto.features.json`.

## Адаптеры фреймворков

```jsx
import { Motion } from '@dong-gri/kineto/react';
<Motion as="h2" type="textReveal" options={{ mode: 'hangul' }}>Привет</Motion>
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

## Поддержка браузеров

Актуальные Chrome, Edge, Firefox и Safari (десктоп и мобильные). При включённом `prefers-reduced-motion` каждый модуль показывает финальное состояние без анимации; в неподдерживаемых средах эффекты сводятся к статичному контенту.

## Сборка

```bash
npm install
npm run build   # создаёт dist/
npm run verify  # линт, сборка, тесты, проверки контракта
```

## Лицензия

MIT © [dongri.me](https://dongri.me) · Создано с помощью AI vibe-coding.
