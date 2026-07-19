<div align="center">

<img src="assets/logo.svg" width="72" height="72" alt="Kineto">

# Kineto

透過 HTML 屬性或 JavaScript API 驅動的網頁互動工具庫

[한국어](README.ko.md) · [English](README.md) · [日本語](README.jp.md) · [简体中文](README.zh-CN.md) · 繁體中文 · [Русский](README.ru.md) · [Italiano](README.it.md)

[![npm](https://img.shields.io/npm/v/@dong-gri/kineto.svg)](https://www.npmjs.com/package/@dong-gri/kineto) [![license](https://img.shields.io/npm/l/@dong-gri/kineto.svg)](LICENSE) [![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/@dong-gri/kineto.svg)](https://www.jsdelivr.com/package/npm/@dong-gri/kineto)

[線上示範](https://git.dongri.me/example/kineto) · [模組參考](docs/module-reference.md) · [功能契約](FEATURE_CONTRACT.md)

</div>

---

> **Kineto** — 名稱取自 *kinetic*（源自希臘語 *kínēsis*，意為「運動」）。對一個專注於網頁動效的函式庫而言，名副其實。

Kineto 是一個包含 34 個互動模組（動效、媒體、捲動、載入器、文字）的函式庫，你可以用一個 `data-kt-*` 屬性直接掛載，或透過 JavaScript API 精細控制。核心沒有任何必要相依；在不支援的瀏覽器或低階裝置上，效果會自動關閉而內容維持完整。

> 使用 AI 編程工具（Cursor、Claude 等）？請參閱 [AI 提示詞指南](AI-PROMPT-GUIDE.md)——內含可直接貼上的指令，讓助手在處理動效與互動時優先使用 Kineto 模組。

<img src="https://cdn.jsdelivr.net/gh/catgarret/kineto@main/assets/preview/kineto.gif" width="620" alt="Kineto Preview">

## 安裝

### npm

```bash
npm install @dong-gri/kineto
```

```js
import Kineto from '@dong-gri/kineto';
import '@dong-gri/kineto/style.css';

Kineto.autoInit();
```

### CDN（script 標籤，免建置）

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@dong-gri/kineto/dist/kineto.min.css">
<script src="https://cdn.jsdelivr.net/npm/@dong-gri/kineto/dist/kineto.umd.min.js"></script>
<script>
  Kineto.autoInit();
</script>
```

### CDN（ESM）

```js
import Kineto from 'https://cdn.jsdelivr.net/npm/@dong-gri/kineto/+esm';
```

## 快速開始

僅用 HTML 屬性即可運作。

```html
<h2 data-kt-text-reveal="stream">流動出現的文字</h2>
<strong data-kt-counter="pop" data-kt-to="98760" data-kt-format=",">98,760</strong>
<img data-kt-lazy="skeleton" data-src="./cover.webp" alt="Cover">
<section data-kt-reveal="fade-up">捲動時出現</section>
```

同樣的功能也可透過 JavaScript API 使用。

```js
Kineto.counter('#total', { preset: 'pop', to: 98760, format: ',' });
Kineto.reveal('.card', { preset: 'fade-up', stagger: 0.06 });
const lightbox = Kineto.lightbox('.gallery img', { group: 'work', minimap: true });
```

## 選用相依

核心可獨立運作。若頁面中存在 GSAP + ScrollTrigger（捲動 scrub）或 Lenis（平滑捲動），Kineto 會自動偵測並使用；否則回退到標準 API。

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js"></script>
```

平滑捲動預設關閉，可在執行時按需啟用。

```js
Kineto.enableSmooth({ lerp: 0.08 });
Kineto.disableSmooth();
```

## 模組

| 模組 | 啟用屬性 | 用途 |
|---|---|---|
| `ambientMedia` | `data-kt-ambient-media` | 媒體環境光 |
| `blurText` | `data-kt-blur-text` | 逐字模糊顯現 |
| `brushReveal` | `data-kt-brush-reveal` | 指標筆刷遮罩顯現 |
| `cardGlow` | `data-kt-card-glow` | 指標聚光、表面反射、發光邊框 |
| `counter` | `data-kt-counter` | 數字計數、翻牌、時鐘、倒數 |
| `cssScroll` | `data-kt-css-scroll` | 綁定 CSS 變數/動畫時間軸 |
| `cursor` | `data-kt-cursor` | 11 種自訂游標 |
| `fullpage` | `data-kt-fullpage` | 整頁分頁（縱向/橫向/混合軸） |
| `glitch` | `data-kt-glitch` | RGB 切片與故障顯現 |
| `lazy` | `data-kt-lazy` | 圖片載入效果（骨架/像素/列印/溶解） |
| `lightbox` | `data-kt-lightbox` | 全螢幕檢視器、群組、縮放、小地圖 |
| `loader` | `data-kt-loader` | 綁定真實進度的載入器 |
| `magnetic` | `data-kt-magnetic` | 磁吸指標反應 |
| `marquee` | `data-kt-marquee` | 連續跑馬燈 |
| `mouseParallax` | `data-kt-mouse-parallax` | 指標/陀螺儀視差 |
| `overflowText` | `data-kt-overflow-text` | 處理溢出文字的八種方式 |
| `pageReveal` | `data-kt-page-reveal` | 頁面進入遮罩 |
| `pageTransition` | `data-kt-page-transition` | 同源頁面切換 |
| `parallax` | `data-kt-parallax` | 捲動視差 |
| `progress` | `data-kt-progress` | 閱讀進度條/環 |
| `reveal` | `data-kt-reveal` | 捲動進入顯現 |
| `ripple` | `data-kt-ripple` | 點擊漣漪 |
| `scrollSequence` | `data-kt-scroll-sequence` | 圖片序列 scrub |
| `scrollVelocity` | `data-kt-scroll-velocity` | 回應捲動速度/方向 |
| `shuffle` | `data-kt-shuffle` | 字元亂序解碼 |
| `slider` | `data-kt-slider` | 幻燈片與 coverflow |
| `stickyStack` | `data-kt-sticky-stack` | 黏性堆疊（縱向/橫向/浮動） |
| `textFill` | `data-kt-text-fill` | 捲動驅動的文字填充 |
| `textReveal` | `data-kt-text-reveal` | 文字顯現（含韓文組合） |
| `textSplit` | `data-kt-text-split` | 字元/單字拆分動效 |
| `textTransition` | `data-kt-text-transition` | 文字替換過場 |
| `tilt` | `data-kt-tilt` | 3D 傾斜與光澤 |
| `typewriter` | `data-kt-typewriter` | 打字效果 |
| `vibrate` | `data-kt-vibrate` | 觸覺震動回饋 |

各模組的 variant 與完整選項清單請見 [模組參考](docs/module-reference.md) 與 `kineto.features.json`。

## 框架轉接器

```jsx
import { Motion } from '@dong-gri/kineto/react';
<Motion as="h2" type="textReveal" options={{ mode: 'hangul' }}>你好</Motion>
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

## 瀏覽器支援

支援最新版 Chrome、Edge、Firefox 與 Safari（桌面與行動裝置）。啟用 `prefers-reduced-motion` 時，所有模組直接呈現最終狀態而不播放動畫；在不支援的環境中效果退化為靜態內容。

## 建置

```bash
npm install
npm run build   # 產生 dist/
npm run verify  # lint、建置、測試、契約檢查
```

## 授權

MIT © [dongri](https://dongri.me)
