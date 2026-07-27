# Loader

페이지 전체를 덮는 로딩 화면입니다. 기존 `slot`, `circular`, `bar` 모드와 실제 진행률 추적을 제공합니다.

콘텐츠 안에 놓는 스피너·왕복 바·텍스트 후광은 [Loading Indicator](loadingIndicator.md)를 사용하세요. `Loader`는 화면 오버레이와 스크롤 잠금을 담당하고, `Loading Indicator`는 레이아웃 안에서 독립적으로 동작합니다.

## 기본 사용

```html
<div class="page-loader" data-kt-loader="bar"></div>
```

```css
.page-loader {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: #fff;
}
```

```js
const loader = Kineto.loader('.page-loader', {
  type: 'bar',
  source: 'manual',
  color: '#ff5b1c'
});

loader.setProgress(38);
loader.complete();
await loader.finished;
```

## 진행률 소스

| `source` | 동작 |
|---|---|
| `manual` | `setProgress()` 또는 `manualDuration` 사용 |
| `window` | 페이지 `load` 완료 추적 |
| `resources` | 이미지·영상·스타일·스크립트 완료 비율 추적 |
| `promise` | Promise 완료 전 `promiseCeiling`까지 진행 |
| `fetch` | `Content-Length`가 있으면 받은 byte 기준으로 진행 |

`finished`는 종료 상태를 반환합니다. `complete()`, `fail(error)`, `cancel(reason)`, `show()`, `hide(reason)`, `pause()`, `resume()`, `destroy()`로 상태를 제어할 수 있습니다.

`hideScrollbar: false`로 스크롤 잠금을 끌 수 있습니다. 기본값은 `true`입니다.

## 확장

`renderUI(el, opts)`에서 `{ root, render, setState, destroy }`를 반환하면 내장 표시를 교체할 수 있습니다. 런타임은 `--kt-loader-progress`(0–1)와 `--kt-loader-percent`(0–100)를 갱신합니다.

정확한 옵션은 [Module Reference](../module-reference.md#loader)를 확인하세요.
