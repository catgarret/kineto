<div align="center">

<img src="assets/logo.svg" width="72" height="72" alt="Kineto">

# Kineto

HTML属性または JavaScript API で制御するWebインタラクションツールキット

[한국어](README.ko.md) · [English](README.md) · 日本語 · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Русский](README.ru.md) · [Italiano](README.it.md)

[![npm](https://img.shields.io/npm/v/@dong-gri/kineto.svg)](https://www.npmjs.com/package/@dong-gri/kineto) [![license](https://img.shields.io/npm/l/@dong-gri/kineto.svg)](LICENSE) [![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/@dong-gri/kineto.svg)](https://www.jsdelivr.com/package/npm/@dong-gri/kineto)

[ライブデモ](https://git.dongri.me/example/kineto) · [モジュールリファレンス](docs/module-reference.md) · [AIプロンプトガイド](AI-PROMPT-GUIDE.md) · [機能コントラクト](FEATURE_CONTRACT.md)

</div>

---

> **Kineto** — 名前は「運動・動き」を意味するギリシャ語 *kínēsis* に由来する *kinetic* から取りました。ウェブのモーションを扱うライブラリにふさわしい名前です。

Kineto は、モーション・メディア・スクロール・ローダー・テキストにわたる34個のインタラクションモジュールを、`data-kt-*` 属性ひとつで付与するか、JavaScript API で細かく制御できるライブラリです。コアに必須の依存はなく、非対応ブラウザや低スペック端末では効果だけが無効化され、コンテンツはそのまま保たれます。

> AIコーディングツール（Cursor、Claude など）で作業する場合は [AIプロンプトガイド](AI-PROMPT-GUIDE.md) を参照してください。モーションとインタラクションに Kineto のモジュールを優先的に使わせる、貼り付けるだけの指示文が入っています。

## インストール

### npm

```bash
npm install @dong-gri/kineto
```

```js
import Kineto from '@dong-gri/kineto';
import '@dong-gri/kineto/style.css';

Kineto.autoInit();
```

### CDN（script タグ、ビルド不要）

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

## クイックスタート

HTML属性だけで動作します。

```html
<h2 data-kt-text-reveal="stream">流れるように現れるテキスト</h2>
<strong data-kt-counter="pop" data-kt-to="98760" data-kt-format=",">98,760</strong>
<img data-kt-lazy="skeleton" data-src="./cover.webp" alt="Cover">
<section data-kt-reveal="fade-up">スクロールで表示</section>
```

同じ機能を JavaScript API でも利用できます。

```js
Kineto.counter('#total', { preset: 'pop', to: 98760, format: ',' });
Kineto.reveal('.card', { preset: 'fade-up', stagger: 0.06 });
const lightbox = Kineto.lightbox('.gallery img', { group: 'work', minimap: true });
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
Kineto.enableSmooth({ lerp: 0.08 });
Kineto.disableSmooth();
```

## モジュール

| モジュール | 有効化属性 | 用途 |
|---|---|---|
| `ambientMedia` | `data-kt-ambient-media` | メディアの環境光 |
| `blurText` | `data-kt-blur-text` | 文字ごとのブラーリビール |
| `brushReveal` | `data-kt-brush-reveal` | ポインターのブラシマスク |
| `cardGlow` | `data-kt-card-glow` | スポットライト・表面反射・発光ボーダー |
| `counter` | `data-kt-counter` | カウント・フリップ・時計・カウントダウン |
| `cssScroll` | `data-kt-css-scroll` | CSS変数・アニメーションタイムライン連動 |
| `cursor` | `data-kt-cursor` | カスタムカーソル11種 |
| `fullpage` | `data-kt-fullpage` | フルページ送り（縦・横・混合軸） |
| `glitch` | `data-kt-glitch` | RGBスライス・グリッチリビール |
| `lazy` | `data-kt-lazy` | 画像ロード演出（スケルトン・ピクセル・プリント・ディゾルブ） |
| `lightbox` | `data-kt-lightbox` | 全画面ビューア・グループ・ズーム・ミニマップ |
| `loader` | `data-kt-loader` | 実進捗と連動するローダー |
| `magnetic` | `data-kt-magnetic` | マグネットポインター |
| `marquee` | `data-kt-marquee` | 連続マーキー |
| `mouseParallax` | `data-kt-mouse-parallax` | ポインター・ジャイロのパララックス |
| `overflowText` | `data-kt-overflow-text` | あふれるテキストの処理8種 |
| `pageReveal` | `data-kt-page-reveal` | ページ進入オーバーレイ |
| `pageTransition` | `data-kt-page-transition` | 同一オリジンのページ遷移 |
| `parallax` | `data-kt-parallax` | スクロールパララックス |
| `progress` | `data-kt-progress` | 読み込み進捗バー・リング |
| `reveal` | `data-kt-reveal` | スクロール進入リビール |
| `ripple` | `data-kt-ripple` | クリックリップル |
| `scrollSequence` | `data-kt-scroll-sequence` | 画像シーケンスのスクラブ |
| `scrollVelocity` | `data-kt-scroll-velocity` | スクロール速度・方向への反応 |
| `shuffle` | `data-kt-shuffle` | 文字シャッフルデコード |
| `slider` | `data-kt-slider` | スライド・カバーフロー |
| `stickyStack` | `data-kt-sticky-stack` | スティッキースタック（縦・横・フローティング） |
| `textFill` | `data-kt-text-fill` | スクロール連動のテキスト塗り |
| `textReveal` | `data-kt-text-reveal` | テキストリビール（ハングル合成対応） |
| `textSplit` | `data-kt-text-split` | 文字・単語分割モーション |
| `textTransition` | `data-kt-text-transition` | テキスト差し替え遷移 |
| `tilt` | `data-kt-tilt` | 3Dチルト・グレア |
| `typewriter` | `data-kt-typewriter` | タイピング効果 |
| `vibrate` | `data-kt-vibrate` | ハプティック振動フィードバック |

各モジュールの variant とオプション一覧は [モジュールリファレンス](docs/module-reference.md) と `kineto.features.json` を参照してください。

## フレームワークアダプター

```jsx
import { Motion } from '@dong-gri/kineto/react';
<Motion as="h2" type="textReveal" options={{ mode: 'hangul' }}>こんにちは</Motion>
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
