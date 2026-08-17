<div align="center">

<img src="../assets/logo.svg" width="72" height="72" alt="Kineto">

# Kineto

通过 HTML 属性或 JavaScript API 驱动的网页交互工具库

[한국어](README.ko.md) · [English](../README.md) · [日本語](README.jp.md) · 简体中文 · [繁體中文](README.zh-TW.md) · [Русский](README.ru.md) · [Italiano](README.it.md)

<p><a href="https://www.npmjs.com/package/@dong-gri/kineto"><img src="https://img.shields.io/npm/v/@dong-gri/kineto.svg" alt="npm" height="20"></a>&nbsp;&nbsp;<a href="../LICENSE"><img src="https://img.shields.io/npm/l/@dong-gri/kineto.svg" alt="license" height="20"></a>&nbsp;&nbsp;<a href="https://www.jsdelivr.com/package/npm/@dong-gri/kineto"><img src="https://img.shields.io/jsdelivr/npm/hm/@dong-gri/kineto.svg" alt="jsDelivr" height="20"></a></p>

[在线演示](https://kineto.dongri.me) · [模块参考](../docs/module-reference.md) · [问题排查](../docs/troubleshooting.md) · [功能契约](../FEATURE_CONTRACT.md)

</div>

---

Kineto 是一个包含 52 个交互模块（动效、媒体、滚动、加载器、文本）的库，你可以用一个 `data-kt-*` 属性直接挂载，或通过 JavaScript API 精细控制。核心无任何必需依赖；在不支持的浏览器或低端设备上，效果会自动关闭而内容保持完整。

> 使用 AI 编程工具（Cursor、Claude 等）？请参阅 [AI 提示词指南](../AI-PROMPT-GUIDE.md)——其中包含可直接粘贴的指令，让助手在处理动效与交互时优先使用 Kineto 模块。

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

### iOS 全面屏（刘海与主屏幕指示条）

全屏效果（加载器、页面揭示、页面转场）会覆盖整个视口。为了让它们延伸到 iPhone 刘海和主屏幕指示条下方（而不是留下颜色不一致的条带），请在 viewport meta 中加入 `viewport-fit=cover`：

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

## 运动引擎

Kineto 的捆绑包中不包括 GSAP 和 Lenis。
第一次使用时会从CDN加载所需的效果，如果页面上已经存在实例，则会使用该效果。
如果 CDN 不可用，请保留静态内容并回退到标准行为。
默认 CDN 引擎使用 SHA-384 完整性校验。更改引擎 URL 时，还应设置对应文件的 integrity 值。

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
| `ambientMedia` | `data-kt-ambient-media` | 从介质中提取的环境光 |
| `blurText` | `data-kt-blur-text` | 按字母模糊条目 |
| `brushReveal` | `data-kt-brush-reveal` | 指针刷蒙版 |
| `cardGlow` | `data-kt-card-glow` | 指针聚光灯/反射光/外部光 |
| `counter` | `data-kt-counter` | 计数、翻转、时钟、倒计时 |
| `dateTime` | `data-kt-date-time` | 服务器日期的相对与绝对时间显示 |
| `cssScroll` | `data-kt-css-scroll` | CSS 变量/滚动时间轴集成 |
| `cursor` | `data-kt-cursor` | 11个自定义光标 |
| `fullpage` | `data-kt-fullpage` | 垂直/水平/混合轴整页 |
| `glitch` | `data-kt-glitch` | RGB 切片/像素故障 |
| `lazy` | `data-kt-lazy` | 骨架·像素·打印·溶解加载 |
| `lightbox` | `data-kt-lightbox` | 分组/缩放/小地图全屏查看器 |
| `loader` | `data-kt-loader` | 真实进度链接加载程序 |
| `loadingIndicator` | `data-kt-loading-indicator` | 内联旋转器、进度条、流光和符号指示器 |
| `magnetic` | `data-kt-magnetic` | 指针磁铁反应 |
| `marquee` | `data-kt-marquee` | 连续字幕 |
| `mouseParallax` | `data-kt-mouse-parallax` | 指针/陀螺仪视差 |
| `overflowText` | `data-kt-overflow-text` | 处理溢出的文本 |
| `pageReveal` | `data-kt-page-reveal` | 页面条目覆盖 |
| `pageTransition` | `data-kt-page-transition` | 同源页面转换 |
| `parallax` | `data-kt-parallax` | 滚动视差 |
| `progress` | `data-kt-progress` | 阅读进度条和圆环 |
| `reveal` | `data-kt-reveal` | 滚动条目显示 |
| `ripple` | `data-kt-ripple` | 点击波纹 |
| `scrollSequence` | `data-kt-scroll-sequence` | 擦洗图像序列 |
| `scrollVelocity` | `data-kt-scroll-velocity` | 滚动速度/方向响应 |
| `slider` | `data-kt-slider` | 滑动、Coverflow、堆叠与圆形轮播 |
| `radial` | `data-kt-radial` | 兼容旧版的圆形轮播入口 |
| `stickyStack` | `data-kt-sticky-stack` | 垂直、水平、浮动粘性堆栈 |
| `textFill` | `data-kt-text-fill` | 滚动文本填充 |
| `textReveal` | `data-kt-text-reveal` | 随机播放、解码、韩文组合显示 |
| `textSplit` | `data-kt-text-split` | 字母/分词运动 |
| `textTransition` | `data-kt-text-transition` | 替换短语 |
| `tilt` | `data-kt-tilt` | 3D 倾斜、眩光、阴影 |
| `typewriter` | `data-kt-typewriter` | 韩文组合打字 |
| `vibrate` | `data-kt-vibrate` | 触觉振动反馈 |
| `confetti` | `data-kt-confetti` | 单击/输入五彩纸屑效果 |
| `accordion` | `data-kt-accordion` | 细节手风琴以支持可访问性 |
| `hold` | `data-kt-hold` | 长按/多次点击确认计 |
| `megaMenu` | `data-kt-mega-menu` | 键盘/ARIA 超级菜单 |
| `toast` | `data-kt-toast` | 状态 toast 通知 |
| `bottomSheet` | `data-kt-bottom-sheet` | 底板支持焦点锁定 |
| `tabs` | `data-kt-tabs` | WAI-ARIA 选项卡/段控制 |
| `coverReveal` | `data-kt-cover-reveal` | 彩色封面揭晓 |
| `gesture` | `data-kt-gesture` | 悬停/推弹簧反馈 |
| `drag` | `data-kt-drag` | 惯性、边界、回弹阻力 |
| `tooltip` | `data-kt-tooltip` | 位置自动校正工具提示 |
| `switch` | `data-kt-switch` | 表单中使用的辅助开关 |
| `flip` | `data-kt-flip` | 排序/添加/删除 FLIP 转换 |
| `scrollShadows` | `data-kt-scroll-shadows` | 滚动边缘阴影 |
| `stickyHeader` | `data-kt-sticky-header` | 折叠式/盖式固定头 |
| `horizontalScroll` | `data-kt-horizontal-scroll` | 固定水平滚动 |

各模块的 variant 与完整选项列表请见 [模块参考](../docs/module-reference.md) 与 `kineto.features.json`。

## 框架适配器

Kineto 为完整包、模块化 core/module 导入以及 React、Vue、jQuery 适配器提供官方
TypeScript 声明。模块选项保持可扩展，因此自定义模块和新增选项无需类型断言即可使用。

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
npm run ci      # lint、构建、Node/Chromium 测试、契约与包校验
npm run verify  # 完整 CI 校验 + 依赖安全审计
```

## 许可

MIT © [dongri.me](https://dongri.me)
