<div align="center">

<img src="../assets/logo.svg" width="72" height="72" alt="Kineto">

# Kineto

透過 HTML 屬性或 JavaScript API 驅動的網頁互動工具庫

[한국어](README.ko.md) · [English](../README.md) · [日本語](README.jp.md) · [简体中文](README.zh-CN.md) · 繁體中文 · [Русский](README.ru.md) · [Italiano](README.it.md)

<p><a href="https://www.npmjs.com/package/@dong-gri/kineto"><img src="https://img.shields.io/npm/v/@dong-gri/kineto.svg" alt="npm" height="20"></a>&nbsp;&nbsp;<a href="../LICENSE"><img src="https://img.shields.io/npm/l/@dong-gri/kineto.svg" alt="license" height="20"></a>&nbsp;&nbsp;<a href="https://www.jsdelivr.com/package/npm/@dong-gri/kineto"><img src="https://img.shields.io/jsdelivr/npm/hm/@dong-gri/kineto.svg" alt="jsDelivr" height="20"></a></p>

[線上示範](https://kineto.dongri.me) · [模組參考](../docs/module-reference.md) · [功能契約](../FEATURE_CONTRACT.md)

</div>

---

Kineto 是一個包含 51 個互動模組（動效、媒體、捲動、載入器、文字）的函式庫，你可以用一個 `data-kt-*` 屬性直接掛載，或透過 JavaScript API 精細控制。核心沒有任何必要相依；在不支援的瀏覽器或低階裝置上，效果會自動關閉而內容維持完整。

> 使用 AI 編程工具（Cursor、Claude 等）？請參閱 [AI 提示詞指南](../AI-PROMPT-GUIDE.md)——內含可直接貼上的指令，讓助手在處理動效與互動時優先使用 Kineto 模組。

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

### iOS 全螢幕（瀏海與主畫面列）

全螢幕效果（載入器、頁面揭示、頁面轉場）會覆蓋整個視窗。為了讓它們延伸到 iPhone 瀏海與主畫面列底下（而非留下顏色不一致的長條），請在 viewport meta 加入 `viewport-fit=cover`：

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

## 運動引擎

Kineto 的捆綁包中不包括 GSAP 和 Lenis。
第一次使用時會從CDN載入所需的效果，如果頁面上已經存在實例，則會使用該效果。
如果 CDN 不可用，請保留靜態內容並回退到標準行為。
預設 CDN 引擎使用 SHA-384 完整性驗證。變更引擎 URL 時，也應設定對應檔案的 integrity 值。

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
| `ambientMedia` | `data-kt-ambient-media` | 從介質中提取的環境光 |
| `blurText` | `data-kt-blur-text` | 按字母模糊條目 |
| `brushReveal` | `data-kt-brush-reveal` | 指針刷蒙版 |
| `cardGlow` | `data-kt-card-glow` | 指針聚光燈/反射光/外部光 |
| `counter` | `data-kt-counter` | 數數、翻轉、時鐘、倒數計時 |
| `dateTime` | `data-kt-date-time` | 伺服器日期的相對與絕對時間顯示 |
| `cssScroll` | `data-kt-css-scroll` | CSS 變數/滾動時間軸集成 |
| `cursor` | `data-kt-cursor` | 11個自訂遊標 |
| `fullpage` | `data-kt-fullpage` | 垂直/水平/混合軸整頁 |
| `glitch` | `data-kt-glitch` | RGB 切片/像素故障 |
| `lazy` | `data-kt-lazy` | 骨架·像素·列印·溶解載入 |
| `lightbox` | `data-kt-lightbox` | 分組/縮放/小地圖全螢幕檢視器 |
| `loader` | `data-kt-loader` | 真實進度連結載入程序 |
| `loadingIndicator` | `data-kt-loading-indicator` | 行內旋轉器、進度列、流光和符號指示器 |
| `magnetic` | `data-kt-magnetic` | 指針磁鐵反應 |
| `marquee` | `data-kt-marquee` | 連續字幕 |
| `mouseParallax` | `data-kt-mouse-parallax` | 指針/陀螺儀視差 |
| `overflowText` | `data-kt-overflow-text` | 處理溢出的文本 |
| `pageReveal` | `data-kt-page-reveal` | 頁面條目覆蓋 |
| `pageTransition` | `data-kt-page-transition` | 同源頁面轉換 |
| `parallax` | `data-kt-parallax` | 滾動視差 |
| `progress` | `data-kt-progress` | 閱讀進度條和圓環 |
| `reveal` | `data-kt-reveal` | 捲動條目顯示 |
| `ripple` | `data-kt-ripple` | 點選波紋 |
| `scrollSequence` | `data-kt-scroll-sequence` | 擦洗影像序列 |
| `scrollVelocity` | `data-kt-scroll-velocity` | 滾動速度/方向響應 |
| `slider` | `data-kt-slider` | 滑動、Coverflow、堆疊與圓形輪播 |
| `radial` | `data-kt-radial` | 相容舊版的圓形輪播入口 |
| `stickyStack` | `data-kt-sticky-stack` | 垂直、水平、浮動黏性堆疊 |
| `textFill` | `data-kt-text-fill` | 滾動文字填充 |
| `textReveal` | `data-kt-text-reveal` | 隨機播放、解碼、韓文組合顯示 |
| `textSplit` | `data-kt-text-split` | 字母/分詞運動 |
| `textTransition` | `data-kt-text-transition` | 替換短語 |
| `tilt` | `data-kt-tilt` | 3D 傾斜、眩光、陰影 |
| `typewriter` | `data-kt-typewriter` | 韓文組合打字 |
| `vibrate` | `data-kt-vibrate` | 觸覺振動回饋 |
| `confetti` | `data-kt-confetti` | 點選/輸入五彩紙屑效果 |
| `accordion` | `data-kt-accordion` | 細節手風琴以支援可訪問性 |
| `hold` | `data-kt-hold` | 長按/多次點擊確認計 |
| `megaMenu` | `data-kt-mega-menu` | 鍵盤/ARIA 超級選單 |
| `toast` | `data-kt-toast` | 狀態 toast 通知 |
| `bottomSheet` | `data-kt-bottom-sheet` | 底板支援焦點鎖定 |
| `tabs` | `data-kt-tabs` | WAI-ARIA 選項卡/段控制 |
| `coverReveal` | `data-kt-cover-reveal` | 彩色封面揭曉 |
| `gesture` | `data-kt-gesture` | 懸停/推彈簧反饋 |
| `drag` | `data-kt-drag` | 慣性、邊界、回彈阻力 |
| `tooltip` | `data-kt-tooltip` | 位置自動校正工具提示 |
| `switch` | `data-kt-switch` | 表單中使用的輔助開關 |
| `flip` | `data-kt-flip` | 排序/新增/刪除 FLIP 轉換 |
| `scrollShadows` | `data-kt-scroll-shadows` | 滾動邊緣陰影 |
| `stickyHeader` | `data-kt-sticky-header` | 折疊式/蓋式固定頭 |
| `horizontalScroll` | `data-kt-horizontal-scroll` | 固定水平捲動 |

各模組的 variant 與完整選項清單請見 [模組參考](../docs/module-reference.md) 與 `kineto.features.json`。

## 框架轉接器

Kineto 為完整套件、模組化 core/module 匯入以及 React、Vue、jQuery 轉接器提供官方
TypeScript 宣告。模組選項維持可擴充，因此自訂模組和新增選項無需型別斷言即可使用。

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
npm run ci      # lint、建置、Node/Chromium 測試、契約與套件檢查
npm run verify  # 完整 CI 檢查 + 相依套件安全稽核
```

## 授權

MIT © [dongri.me](https://dongri.me)
