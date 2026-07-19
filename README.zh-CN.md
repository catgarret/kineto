<div align="center">

<img src="assets/logo.svg" width="72" height="72" alt="Kineto">

# Kineto

通过 HTML 属性或 JavaScript API 驱动的网页交互工具库

[한국어](README.ko.md) · [English](README.md) · [日本語](README.jp.md) · 简体中文 · [繁體中文](README.zh-TW.md) · [Русский](README.ru.md) · [Italiano](README.it.md)

[![npm](https://img.shields.io/npm/v/@dong-gri/kineto.svg)](https://www.npmjs.com/package/@dong-gri/kineto) [![license](https://img.shields.io/npm/l/@dong-gri/kineto.svg)](LICENSE) [![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/@dong-gri/kineto.svg)](https://www.jsdelivr.com/package/npm/@dong-gri/kineto)

[在线演示](https://git.dongri.me/example/kineto) · [模块参考](docs/module-reference.md) · [功能契约](FEATURE_CONTRACT.md)

</div>

---

> **Kineto** — 名称取自 *kinetic*（源自希腊语 *kínēsis*，意为“运动”）。用于网页动效的库，名副其实。

Kineto 是一个包含 34 个交互模块（动效、媒体、滚动、加载器、文本）的库，你可以用一个 `data-kt-*` 属性直接挂载，或通过 JavaScript API 精细控制。核心无任何必需依赖；在不支持的浏览器或低端设备上，效果会自动关闭而内容保持完整。

> 使用 AI 编程工具（Cursor、Claude 等）？请参阅 [AI 提示词指南](AI-PROMPT-GUIDE.md)——其中包含可直接粘贴的指令，让助手在处理动效与交互时优先使用 Kineto 模块。

<img src="https://cdn.jsdelivr.net/gh/catgarret/kineto@main/assets/preview/kineto.gif" width="620" alt="Kineto Preview">

## 安装

### npm

```bash
npm install @dong-gri/kineto
```

```js
import Kineto from '@dong-gri/kineto';
import '@dong-gri/kineto/style.css';

Kineto.autoInit();
```

### CDN（script 标签，无需构建）

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

## 快速开始

仅用 HTML 属性即可运行。

```html
<h2 data-kt-text-reveal="stream">流动出现的文字</h2>
<strong data-kt-counter="pop" data-kt-to="98760" data-kt-format=",">98,760</strong>
<img data-kt-lazy="skeleton" data-src="./cover.webp" alt="Cover">
<section data-kt-reveal="fade-up">滚动时出现</section>
```

同样的功能也可通过 JavaScript API 使用。

```js
Kineto.counter('#total', { preset: 'pop', to: 98760, format: ',' });
Kineto.reveal('.card', { preset: 'fade-up', stagger: 0.06 });
const lightbox = Kineto.lightbox('.gallery img', { group: 'work', minimap: true });
```

## 可选依赖

核心可独立运行。如果页面中存在 GSAP + ScrollTrigger（滚动 scrub）或 Lenis（平滑滚动），Kineto 会自动检测并使用；否则回退到标准 API。

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js"></script>
```

平滑滚动默认关闭，按需在运行时启用。

```js
Kineto.enableSmooth({ lerp: 0.08 });
Kineto.disableSmooth();
```

## 模块

| 模块 | 激活属性 | 用途 |
|---|---|---|
| `ambientMedia` | `data-kt-ambient-media` | 媒体环境光 |
| `blurText` | `data-kt-blur-text` | 逐字模糊显现 |
| `brushReveal` | `data-kt-brush-reveal` | 指针笔刷遮罩显现 |
| `cardGlow` | `data-kt-card-glow` | 指针聚光、表面反射、发光边框 |
| `counter` | `data-kt-counter` | 数字计数、翻牌、时钟、倒计时 |
| `cssScroll` | `data-kt-css-scroll` | 绑定 CSS 变量/动画时间线 |
| `cursor` | `data-kt-cursor` | 11 种自定义光标 |
| `fullpage` | `data-kt-fullpage` | 整页分页（纵向/横向/混合轴） |
| `glitch` | `data-kt-glitch` | RGB 切片与故障显现 |
| `lazy` | `data-kt-lazy` | 图片加载效果（骨架/像素/打印/溶解） |
| `lightbox` | `data-kt-lightbox` | 全屏查看器、分组、缩放、小地图 |
| `loader` | `data-kt-loader` | 绑定真实进度的加载器 |
| `magnetic` | `data-kt-magnetic` | 磁吸指针反应 |
| `marquee` | `data-kt-marquee` | 连续跑马灯 |
| `mouseParallax` | `data-kt-mouse-parallax` | 指针/陀螺仪视差 |
| `overflowText` | `data-kt-overflow-text` | 处理溢出文本的八种方式 |
| `pageReveal` | `data-kt-page-reveal` | 页面进入遮罩 |
| `pageTransition` | `data-kt-page-transition` | 同源页面切换 |
| `parallax` | `data-kt-parallax` | 滚动视差 |
| `progress` | `data-kt-progress` | 阅读进度条/环 |
| `reveal` | `data-kt-reveal` | 滚动进入显现 |
| `ripple` | `data-kt-ripple` | 点击涟漪 |
| `scrollSequence` | `data-kt-scroll-sequence` | 图片序列 scrub |
| `scrollVelocity` | `data-kt-scroll-velocity` | 响应滚动速度/方向 |
| `shuffle` | `data-kt-shuffle` | 字符乱序解码 |
| `slider` | `data-kt-slider` | 幻灯片与 coverflow |
| `stickyStack` | `data-kt-sticky-stack` | 粘性堆叠（纵向/横向/浮动） |
| `textFill` | `data-kt-text-fill` | 滚动驱动的文字填充 |
| `textReveal` | `data-kt-text-reveal` | 文字显现（含韩文组合） |
| `textSplit` | `data-kt-text-split` | 字符/单词拆分动效 |
| `textTransition` | `data-kt-text-transition` | 文字替换过渡 |
| `tilt` | `data-kt-tilt` | 3D 倾斜与光泽 |
| `typewriter` | `data-kt-typewriter` | 打字效果 |
| `vibrate` | `data-kt-vibrate` | 触觉振动反馈 |

各模块的 variant 与完整选项列表请见 [模块参考](docs/module-reference.md) 与 `kineto.features.json`。

## 框架适配器

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

## 浏览器支持

支持最新版 Chrome、Edge、Firefox 和 Safari（桌面与移动端）。启用 `prefers-reduced-motion` 时，所有模块直接呈现最终状态而不播放动画；在不支持的环境中效果退化为静态内容。

## 构建

```bash
npm install
npm run build   # 生成 dist/
npm run verify  # lint、构建、测试、契约校验
```

## 许可

MIT © [dongri](https://dongri.me)
