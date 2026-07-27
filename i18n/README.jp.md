<div align="center">

<img src="../assets/logo.svg" width="72" height="72" alt="Kineto">

# Kineto

HTML属性または JavaScript API で制御するWebインタラクションツールキット

[한국어](README.ko.md) · [English](../README.md) · 日本語 · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Русский](README.ru.md) · [Italiano](README.it.md)

[![npm](https://img.shields.io/npm/v/@dong-gri/kineto.svg)](https://www.npmjs.com/package/@dong-gri/kineto) [![license](https://img.shields.io/npm/l/@dong-gri/kineto.svg)](../LICENSE) [![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/@dong-gri/kineto.svg)](https://www.jsdelivr.com/package/npm/@dong-gri/kineto)

[ライブデモ](https://git.dongri.me/example/kineto) · [モジュールリファレンス](../docs/module-reference.md) · [AIプロンプトガイド](../AI-PROMPT-GUIDE.md) · [機能コントラクト](../FEATURE_CONTRACT.md)

</div>

---

Kineto は、モーション・メディア・スクロール・ローダー・テキストにわたる51個のインタラクションモジュールを、`data-kt-*` 属性ひとつで付与するか、JavaScript API で細かく制御できるライブラリです。コアに必須の依存はなく、非対応ブラウザや低スペック端末では効果だけが無効化され、コンテンツはそのまま保たれます。

> AIコーディングツール（Cursor、Claude など）で作業する場合は [AIプロンプトガイド](../AI-PROMPT-GUIDE.md) を参照してください。モーションとインタラクションに Kineto のモジュールを優先的に使わせる、貼り付けるだけの指示文が入っています。

<img src="https://cdn.jsdelivr.net/gh/catgarret/kineto@main/assets/preview/kineto.gif" width="620" alt="Kineto Preview">

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

### iOS エッジトゥエッジ（ノッチ・ホームバー）

全画面エフェクト（ローダー・ページリビール・ページトランジション）はビューポート全体を覆います。iPhone のノッチやホームバーの下まで自然に伸びるよう（色のずれた帯が出ないよう）、viewport メタに `viewport-fit=cover` を追加してください：

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

## モーションエンジン

KinetoはGSAPとLenisをバンドルに含めません。
必要なエフェクトを初めて使用するときにCDNから呼び出され、ページにすでに存在するインスタンスがある場合はそのまま使用します。
CDNが利用できない場合は、静的コンテンツを維持し、標準の動作に置き換えます。

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
| `ambientMedia` | `data-kt-ambient-media` | メディアから抽出した周辺光 |
| `blurText` | `data-kt-blur-text` | 文字によるぼかし |
| `brushReveal` | `data-kt-brush-reveal` | ポインターブラシマスク |
| `cardGlow` | `data-kt-card-glow` | ポインタスポットライト・反射・外郭光 |
| `counter` | `data-kt-counter` | 数字カウント・フリップ・時計・カウントダウン |
| `cssScroll` | `data-kt-css-scroll` | CSS変数・スクロールタイムライン連動 |
| `cursor` | `data-kt-cursor` | 11のカスタムカーソル |
| `fullpage` | `data-kt-fullpage` | 縦・横・混合軸 フルページ |
| `glitch` | `data-kt-glitch` | RGBスライス・ピクセルグリッチ |
| `lazy` | `data-kt-lazy` | スケルトン・ピクセル・プリント・ディゾルブローディング |
| `lightbox` | `data-kt-lightbox` | グループ・拡大・ミニマップ全画面ビューア |
| `loader` | `data-kt-loader` | 実際の進行状況連動ローダー |
| `loadingIndicator` | `data-kt-loading-indicator` | インラインのスピナー・バー・シマー・記号インジケーター |
| `magnetic` | `data-kt-magnetic` | ポインタマグネット反応 |
| `marquee` | `data-kt-marquee` | 連続マーキ |
| `mouseParallax` | `data-kt-mouse-parallax` | ポインター・ジャイロパララックス |
| `overflowText` | `data-kt-overflow-text` | あふれるテキスト処理 |
| `pageReveal` | `data-kt-page-reveal` | ページエントリオーバーレイ |
| `pageTransition` | `data-kt-page-transition` | 同じソースページを切り替える |
| `parallax` | `data-kt-parallax` | スクロールパララックス |
| `progress` | `data-kt-progress` | 読み取り進行状況バー・リング |
| `reveal` | `data-kt-reveal` | スクロールエントリリビル |
| `ripple` | `data-kt-ripple` | クリックリップル |
| `scrollSequence` | `data-kt-scroll-sequence` | 画像シーケンススクラブ |
| `scrollVelocity` | `data-kt-scroll-velocity` | スクロール速度・方向反応 |
| `slider` | `data-kt-slider` | スライド・カバーフロー・ディゾルブ |
| `stickyStack` | `data-kt-sticky-stack` | 縦・横・フローティングスティッキースタック |
| `textFill` | `data-kt-text-fill` | スクロールテキストの塗りつぶし |
| `textReveal` | `data-kt-text-reveal` | シャッフル・デコード・ハングル組み合わせリビル |
| `textSplit` | `data-kt-text-split` | 文字・単語分割モーション |
| `textTransition` | `data-kt-text-transition` | フレーズ交換の切り替え |
| `tilt` | `data-kt-tilt` | 3Dチルト・グレア・シャドウ |
| `typewriter` | `data-kt-typewriter` | ハングル組み合わせタイピング |
| `vibrate` | `data-kt-vibrate` | 触覚振動フィードバック |
| `confetti` | `data-kt-confetti` | クリック・進入紙吹雪効果 |
| `accordion` | `data-kt-accordion` | アクセシビリティをサポートする details アコーディオン |
| `hold` | `data-kt-hold` | 長押し・連打確認ゲージ |
| `megaMenu` | `data-kt-mega-menu` | キーボード・ARIAメガメニュー |
| `toast` | `data-kt-toast` | ステータストースト通知 |
| `bottomSheet` | `data-kt-bottom-sheet` | フォーカス固定をサポートするボトムシート |
| `tabs` | `data-kt-tabs` | WAI-ARIAタップ・セグメントコントロール |
| `radial` | `data-kt-radial` | 円形カルーセル |
| `coverReveal` | `data-kt-cover-reveal` | カラーカバーリビル |
| `gesture` | `data-kt-gesture` | ホバー・押しばねフィードバック |
| `drag` | `data-kt-drag` | 慣性・境界・スナップバックドラッグ |
| `tooltip` | `data-kt-tooltip` | 位置自動補正ツールチップ |
| `switch` | `data-kt-switch` | フォームで使用されるアクセシビリティスイッチ |
| `flip` | `data-kt-flip` | 整列・追加・削除 FLIP切り替え |
| `scrollShadows` | `data-kt-scroll-shadows` | スクロールエッジシャドウ |
| `stickyHeader` | `data-kt-sticky-header` | 縮小・カバー型固定ヘッダ |
| `horizontalScroll` | `data-kt-horizontal-scroll` | 固定型水平スクロール |

各モジュールの variant とオプション一覧は [モジュールリファレンス](../docs/module-reference.md) と `kineto.features.json` を参照してください。

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
npm run ci      # lint・build・Node/Chromiumテスト・コントラクト/パッケージ検証
npm run verify  # CI全体 + 依存関係のセキュリティ監査
```

## ライセンス

MIT © [dongri.me](https://dongri.me)
