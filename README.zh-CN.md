<div align="center">

<img src="assets/logo.svg" width="72" height="72" alt="MotionKit">

# MotionKit

通过 HTML 属性或 JavaScript API 驱动的网页交互工具库

[한국어](README.ko.md) · [English](README.md) · [日本語](README.jp.md) · 简体中文 · [繁體中文](README.zh-TW.md) · [Русский](README.ru.md) · [Italiano](README.it.md)

[![npm](https://img.shields.io/npm/v/@dong-gri/motionkit.svg)](https://www.npmjs.com/package/@dong-gri/motionkit) [![license](https://img.shields.io/npm/l/@dong-gri/motionkit.svg)](LICENSE) [![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/@dong-gri/motionkit.svg)](https://www.jsdelivr.com/package/npm/@dong-gri/motionkit)

[在线演示](https://git.dongri.me/example/motionKit) · [模块参考](docs/module-reference.md) · [功能契约](FEATURE_CONTRACT.md)

</div>

---

MotionKit 是一个包含 34 个交互模块（动效、媒体、滚动、加载器、文本）的库，你可以用一个 `data-mk-*` 属性直接挂载，或通过 JavaScript API 精细控制。核心无任何必需依赖；在不支持的浏览器或低端设备上，效果会自动关闭而内容保持完整。

> 使用 AI 编程工具（Cursor、Claude 等）？请参阅 [AI 提示词指南](AI-PROMPT-GUIDE.md)——其中包含可直接粘贴的指令，让助手在处理动效与交互时优先使用 MotionKit 模块。

## 安装

### npm

```bash
npm install @dong-gri/motionkit
```

```js
import MotionKit from '@dong-gri/motionkit';
import '@dong-gri/motionkit/style.css';

MotionKit.autoInit();
```

### CDN（script 标签，无需构建）

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@dong-gri/motionkit/dist/motionkit.min.css">
<script src="https://cdn.jsdelivr.net/npm/@dong-gri/motionkit/dist/motionkit.umd.min.js"></script>
<script>
  MotionKit.autoInit();
</script>
```

### CDN（ESM）

```js
import MotionKit from 'https://cdn.jsdelivr.net/npm/@dong-gri/motionkit/+esm';
```

## 快速开始

仅用 HTML 属性即可运行。

```html
<h2 data-mk-text-reveal="stream">流动出现的文字</h2>
<strong data-mk-counter="pop" data-mk-to="98760" data-mk-format=",">98,760</strong>
<img data-mk-lazy="skeleton" data-src="./cover.webp" alt="Cover">
<section data-mk-reveal="fade-up">滚动时出现</section>
```

同样的功能也可通过 JavaScript API 使用。

```js
MotionKit.counter('#total', { preset: 'pop', to: 98760, format: ',' });
MotionKit.reveal('.card', { preset: 'fade-up', stagger: 0.06 });
const lightbox = MotionKit.lightbox('.gallery img', { group: 'work', minimap: true });
```

## 可选依赖

核心可独立运行。如果页面中存在 GSAP + ScrollTrigger（滚动 scrub）或 Lenis（平滑滚动），MotionKit 会自动检测并使用；否则回退到标准 API。

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js"></script>
```

平滑滚动默认关闭，按需在运行时启用。

```js
MotionKit.enableSmooth({ lerp: 0.08 });
MotionKit.disableSmooth();
```

## 模块

| 模块 | 激活属性 | 用途 |
|---|---|---|
| `ambientMedia` | `data-mk-ambient-media` | 媒体环境光 |
| `blurText` | `data-mk-blur-text` | 逐字模糊显现 |
| `brushReveal` | `data-mk-brush-reveal` | 指针笔刷遮罩显现 |
| `cardGlow` | `data-mk-card-glow` | 指针聚光、表面反射、发光边框 |
| `counter` | `data-mk-counter` | 数字计数、翻牌、时钟、倒计时 |
| `cssScroll` | `data-mk-css-scroll` | 绑定 CSS 变量/动画时间线 |
| `cursor` | `data-mk-cursor` | 11 种自定义光标 |
| `fullpage` | `data-mk-fullpage` | 整页分页（纵向/横向/混合轴） |
| `glitch` | `data-mk-glitch` | RGB 切片与故障显现 |
| `lazy` | `data-mk-lazy` | 图片加载效果（骨架/像素/打印/溶解） |
| `lightbox` | `data-mk-lightbox` | 全屏查看器、分组、缩放、小地图 |
| `loader` | `data-mk-loader` | 绑定真实进度的加载器 |
| `magnetic` | `data-mk-magnetic` | 磁吸指针反应 |
| `marquee` | `data-mk-marquee` | 连续跑马灯 |
| `mouseParallax` | `data-mk-mouse-parallax` | 指针/陀螺仪视差 |
| `overflowText` | `data-mk-overflow-text` | 处理溢出文本的八种方式 |
| `pageReveal` | `data-mk-page-reveal` | 页面进入遮罩 |
| `pageTransition` | `data-mk-page-transition` | 同源页面切换 |
| `parallax` | `data-mk-parallax` | 滚动视差 |
| `progress` | `data-mk-progress` | 阅读进度条/环 |
| `reveal` | `data-mk-reveal` | 滚动进入显现 |
| `ripple` | `data-mk-ripple` | 点击涟漪 |
| `scrollSequence` | `data-mk-scroll-sequence` | 图片序列 scrub |
| `scrollVelocity` | `data-mk-scroll-velocity` | 响应滚动速度/方向 |
| `shuffle` | `data-mk-shuffle` | 字符乱序解码 |
| `slider` | `data-mk-slider` | 幻灯片与 coverflow |
| `stickyStack` | `data-mk-sticky-stack` | 粘性堆叠（纵向/横向/浮动） |
| `textFill` | `data-mk-text-fill` | 滚动驱动的文字填充 |
| `textReveal` | `data-mk-text-reveal` | 文字显现（含韩文组合） |
| `textSplit` | `data-mk-text-split` | 字符/单词拆分动效 |
| `textTransition` | `data-mk-text-transition` | 文字替换过渡 |
| `tilt` | `data-mk-tilt` | 3D 倾斜与光泽 |
| `typewriter` | `data-mk-typewriter` | 打字效果 |
| `vibrate` | `data-mk-vibrate` | 触觉振动反馈 |

各模块的 variant 与完整选项列表请见 [模块参考](docs/module-reference.md) 与 `motionkit.features.json`。

## 框架适配器

```jsx
import { Motion } from '@dong-gri/motionkit/react';
<Motion as="h2" type="textReveal" options={{ mode: 'hangul' }}>你好</Motion>
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
