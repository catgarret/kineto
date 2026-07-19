<div align="center">

<img src="assets/logo.svg" width="72" height="72" alt="MotionKit">

# MotionKit

HTML属性または JavaScript API で制御するWebインタラクションツールキット

[한국어](README.ko.md) · [English](README.md) · 日本語 · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Русский](README.ru.md) · [Italiano](README.it.md)

[![npm](https://img.shields.io/npm/v/@dong-gri/motionkit.svg)](https://www.npmjs.com/package/@dong-gri/motionkit) [![license](https://img.shields.io/npm/l/@dong-gri/motionkit.svg)](LICENSE) [![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/@dong-gri/motionkit.svg)](https://www.jsdelivr.com/package/npm/@dong-gri/motionkit)

[ライブデモ](https://git.dongri.me/example/motionKit) · [モジュールリファレンス](docs/module-reference.md) · [AIプロンプトガイド](AI-PROMPT-GUIDE.md) · [機能コントラクト](FEATURE_CONTRACT.md)

</div>

---

MotionKit は、モーション・メディア・スクロール・ローダー・テキストにわたる34個のインタラクションモジュールを、`data-mk-*` 属性ひとつで付与するか、JavaScript API で細かく制御できるライブラリです。コアに必須の依存はなく、非対応ブラウザや低スペック端末では効果だけが無効化され、コンテンツはそのまま保たれます。

> AIコーディングツール（Cursor、Claude など）で作業する場合は [AIプロンプトガイド](AI-PROMPT-GUIDE.md) を参照してください。モーションとインタラクションに MotionKit のモジュールを優先的に使わせる、貼り付けるだけの指示文が入っています。

## インストール

### npm

```bash
npm install @dong-gri/motionkit
```

```js
import MotionKit from '@dong-gri/motionkit';
import '@dong-gri/motionkit/style.css';

MotionKit.autoInit();
```

### CDN（script タグ、ビルド不要）

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

## クイックスタート

HTML属性だけで動作します。

```html
<h2 data-mk-text-reveal="stream">流れるように現れるテキスト</h2>
<strong data-mk-counter="pop" data-mk-to="98760" data-mk-format=",">98,760</strong>
<img data-mk-lazy="skeleton" data-src="./cover.webp" alt="Cover">
<section data-mk-reveal="fade-up">スクロールで表示</section>
```

同じ機能を JavaScript API でも利用できます。

```js
MotionKit.counter('#total', { preset: 'pop', to: 98760, format: ',' });
MotionKit.reveal('.card', { preset: 'fade-up', stagger: 0.06 });
const lightbox = MotionKit.lightbox('.gallery img', { group: 'work', minimap: true });
```

## オプションの依存関係

コアは単体で動作します。GSAP + ScrollTrigger（スクロールスクラブ）や Lenis（スムーススクロール）がページにあれば自動検出して活用し、なければ標準APIにフォールバックします。

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js"></script>
```

スムーススクロールは既定で無効で、必要なときだけ有効化します。

```js
MotionKit.enableSmooth({ lerp: 0.08 });
MotionKit.disableSmooth();
```

## モジュール

| モジュール | 有効化属性 | 用途 |
|---|---|---|
| `ambientMedia` | `data-mk-ambient-media` | メディアの環境光 |
| `blurText` | `data-mk-blur-text` | 文字ごとのブラーリビール |
| `brushReveal` | `data-mk-brush-reveal` | ポインターのブラシマスク |
| `cardGlow` | `data-mk-card-glow` | スポットライト・表面反射・発光ボーダー |
| `counter` | `data-mk-counter` | カウント・フリップ・時計・カウントダウン |
| `cssScroll` | `data-mk-css-scroll` | CSS変数・アニメーションタイムライン連動 |
| `cursor` | `data-mk-cursor` | カスタムカーソル11種 |
| `fullpage` | `data-mk-fullpage` | フルページ送り（縦・横・混合軸） |
| `glitch` | `data-mk-glitch` | RGBスライス・グリッチリビール |
| `lazy` | `data-mk-lazy` | 画像ロード演出（スケルトン・ピクセル・プリント・ディゾルブ） |
| `lightbox` | `data-mk-lightbox` | 全画面ビューア・グループ・ズーム・ミニマップ |
| `loader` | `data-mk-loader` | 実進捗と連動するローダー |
| `magnetic` | `data-mk-magnetic` | マグネットポインター |
| `marquee` | `data-mk-marquee` | 連続マーキー |
| `mouseParallax` | `data-mk-mouse-parallax` | ポインター・ジャイロのパララックス |
| `overflowText` | `data-mk-overflow-text` | あふれるテキストの処理8種 |
| `pageReveal` | `data-mk-page-reveal` | ページ進入オーバーレイ |
| `pageTransition` | `data-mk-page-transition` | 同一オリジンのページ遷移 |
| `parallax` | `data-mk-parallax` | スクロールパララックス |
| `progress` | `data-mk-progress` | 読み込み進捗バー・リング |
| `reveal` | `data-mk-reveal` | スクロール進入リビール |
| `ripple` | `data-mk-ripple` | クリックリップル |
| `scrollSequence` | `data-mk-scroll-sequence` | 画像シーケンスのスクラブ |
| `scrollVelocity` | `data-mk-scroll-velocity` | スクロール速度・方向への反応 |
| `shuffle` | `data-mk-shuffle` | 文字シャッフルデコード |
| `slider` | `data-mk-slider` | スライド・カバーフロー |
| `stickyStack` | `data-mk-sticky-stack` | スティッキースタック（縦・横・フローティング） |
| `textFill` | `data-mk-text-fill` | スクロール連動のテキスト塗り |
| `textReveal` | `data-mk-text-reveal` | テキストリビール（ハングル合成対応） |
| `textSplit` | `data-mk-text-split` | 文字・単語分割モーション |
| `textTransition` | `data-mk-text-transition` | テキスト差し替え遷移 |
| `tilt` | `data-mk-tilt` | 3Dチルト・グレア |
| `typewriter` | `data-mk-typewriter` | タイピング効果 |
| `vibrate` | `data-mk-vibrate` | ハプティック振動フィードバック |

各モジュールの variant とオプション一覧は [モジュールリファレンス](docs/module-reference.md) と `motionkit.features.json` を参照してください。

## フレームワークアダプター

```jsx
import { Motion } from '@dong-gri/motionkit/react';
<Motion as="h2" type="textReveal" options={{ mode: 'hangul' }}>こんにちは</Motion>
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

## ブラウザ対応

最新の Chrome・Edge・Firefox・Safari（デスクトップ／モバイル）に対応します。`prefers-reduced-motion` が有効な場合、全モジュールはアニメーションなしで最終状態を表示し、非対応環境では効果が静的コンテンツに縮退します。

## ビルド

```bash
npm install
npm run build   # dist/ を生成
npm run verify  # lint・build・テスト・コントラクト検証
```

## ライセンス

MIT © [dongri](https://dongri.me)
