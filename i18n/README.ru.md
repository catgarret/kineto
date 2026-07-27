<div align="center">

<img src="../assets/logo.svg" width="72" height="72" alt="Kineto">

# Kineto

Инструментарий веб-интеракций, управляемый HTML-атрибутами или JavaScript API

[한국어](README.ko.md) · [English](../README.md) · [日本語](README.jp.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · Русский · [Italiano](README.it.md)

[![npm](https://img.shields.io/npm/v/@dong-gri/kineto.svg)](https://www.npmjs.com/package/@dong-gri/kineto) [![license](https://img.shields.io/npm/l/@dong-gri/kineto.svg)](../LICENSE) [![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/@dong-gri/kineto.svg)](https://www.jsdelivr.com/package/npm/@dong-gri/kineto)

[Живое демо](https://git.dongri.me/example/kineto) · [Справочник модулей](../docs/module-reference.md) · [Контракт возможностей](../FEATURE_CONTRACT.md)

</div>

---

Kineto — библиотека из 51 интерактивного модуля (движение, медиа, скролл, лоадер, текст), которые подключаются одним атрибутом `data-kt-*` или точно управляются через JavaScript API. Ядро не имеет обязательных зависимостей; в неподдерживаемых браузерах и на слабых устройствах эффекты отключаются, а контент остаётся нетронутым.

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

### iOS во весь экран (вырез и домашняя полоса)

Полноэкранные эффекты (загрузчик, page reveal, page transition) закрывают весь вьюпорт. Чтобы они заходили под вырез и домашнюю полосу iPhone (а не оставляли полоску другого цвета), добавьте `viewport-fit=cover` в мета viewport:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

## двигатель движения

Kineto не включает в свой комплект GSAP и Lenis.
Требуемый эффект будет загружен из CDN при первом его использовании, и если экземпляр уже
существует на странице, он будет использован.
Если CDN недоступен, сохраните статический контент и вернитесь к стандартному поведению.

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
| `ambientMedia` | `data-kt-ambient-media` | Окружающий свет, извлеченный из носителя |
| `blurText` | `data-kt-blur-text` | Размытие записи по букве |
| `brushReveal` | `data-kt-brush-reveal` | Маска кисти-указателя |
| `cardGlow` | `data-kt-card-glow` | Указатель прожектора/отражение/внешний свет |
| `counter` | `data-kt-counter` | Подсчет чисел, переворот, часы, обратный отсчет |
| `cssScroll` | `data-kt-css-scroll` | Интеграция переменных CSS/прокрутки временной шкалы |
| `cursor` | `data-kt-cursor` | 11 пользовательских курсоров |
| `fullpage` | `data-kt-fullpage` | Полная страница по вертикальной/горизонтальной/смешанной оси |
| `glitch` | `data-kt-glitch` | Сбой фрагмента/пикселя RGB |
| `lazy` | `data-kt-lazy` | Скелет·Пиксель·Печать·Растворение загрузки |
| `lightbox` | `data-kt-lightbox` | Полноэкранный просмотр группы/масштаба/миникарты |
| `loader` | `data-kt-loader` | Загрузчик, связанный с реальным прогрессом |
| `loadingIndicator` | `data-kt-loading-indicator` | Встроенные спиннеры, полосы, мерцание и символьные индикаторы |
| `magnetic` | `data-kt-magnetic` | реакция магнита указателя |
| `marquee` | `data-kt-marquee` | непрерывный шатер |
| `mouseParallax` | `data-kt-mouse-parallax` | Указатель/гироскопический параллакс |
| `overflowText` | `data-kt-overflow-text` | Обработка переполненного текста |
| `pageReveal` | `data-kt-page-reveal` | Наложение записи на странице |
| `pageTransition` | `data-kt-page-transition` | Преобразование страниц из одного источника |
| `parallax` | `data-kt-parallax` | прокрутка параллакса |
| `progress` | `data-kt-progress` | Чтение индикатора выполнения и кольца |
| `reveal` | `data-kt-reveal` | Прокрутка записи |
| `ripple` | `data-kt-ripple` | нажмите пульсацию |
| `scrollSequence` | `data-kt-scroll-sequence` | Очистить последовательность изображений |
| `scrollVelocity` | `data-kt-scroll-velocity` | Реакция скорости/направления прокрутки |
| `slider` | `data-kt-slider` | Слайд·Покрытие·Растворение |
| `stickyStack` | `data-kt-sticky-stack` | Вертикальная, горизонтальная, плавающая стопка липких материалов |
| `textFill` | `data-kt-text-fill` | прокрутка текста, заливка |
| `textReveal` | `data-kt-text-reveal` | Перемешать, декодировать, показать комбинацию хангыль |
| `textSplit` | `data-kt-text-split` | Движение сегментации букв/слов |
| `textTransition` | `data-kt-text-transition` | Замена фраз |
| `tilt` | `data-kt-tilt` | 3D наклон, блики, тени |
| `typewriter` | `data-kt-typewriter` | Комбинированный набор текста на корейском языке |
| `vibrate` | `data-kt-vibrate` | Тактильная вибрационная обратная связь |
| `confetti` | `data-kt-confetti` | Эффект конфетти щелчка/входа |
| `accordion` | `data-kt-accordion` | детали аккордеона для обеспечения доступности |
| `hold` | `data-kt-hold` | Индикатор подтверждения длительного нажатия/множественных нажатий |
| `megaMenu` | `data-kt-mega-menu` | Клавиатура/Мегаменю ARIA |
| `toast` | `data-kt-toast` | Всплывающее уведомление о статусе |
| `bottomSheet` | `data-kt-bottom-sheet` | Нижний лист поддерживает блокировку фокуса |
| `tabs` | `data-kt-tabs` | Управление вкладками/сегментами WAI-ARIA |
| `radial` | `data-kt-radial` | круглая карусель |
| `coverReveal` | `data-kt-cover-reveal` | цветная обложка раскрывается |
| `gesture` | `data-kt-gesture` | Наведите/нажмите пружинную обратную связь |
| `drag` | `data-kt-drag` | Инерция, граница, обратное сопротивление |
| `tooltip` | `data-kt-tooltip` | Подсказка по автокоррекции положения |
| `switch` | `data-kt-switch` | Переключатели доступности, используемые в формах |
| `flip` | `data-kt-flip` | Сортировать/Добавить/Удалить преобразование FLIP |
| `scrollShadows` | `data-kt-scroll-shadows` | тень от края прокрутки |
| `stickyHeader` | `data-kt-sticky-header` | Фиксированный коллектор складного/крышного типа |
| `horizontalScroll` | `data-kt-horizontal-scroll` | Исправлена ​​горизонтальная прокрутка |

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
npm run ci      # линт, сборка, тесты Node/Chromium, контракт и пакет
npm run verify  # полный CI + аудит безопасности зависимостей
```

## Лицензия

MIT © [dongri.me](https://dongri.me)
