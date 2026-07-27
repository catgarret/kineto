# loader

페이지나 영역의 로딩 상태를 표시합니다. 실제 진행률을 보여주는 모드와 완료 시점을 알 수 없는 모드를 함께 제공합니다.

## 내장 모드

| `type` | 동작 | 주요 스타일 |
|---|---|---|
| `slot` | 숫자 진행률 | — |
| `circular` | 원형 진행률 | `indeterminate` |
| `bar` | 수평 진행률 | `indeterminate`, `glow` |
| `spinner` | 회전 인디케이터 | `ring`, `comet`, `dual`, `spokes`, `orbit` |
| `dots` | 점 인디케이터 | `pulse`, `bounce`, `wave` |
| `shimmer` | 텍스트 위를 흐르는 빛 | — |
| `shimmer-wave` | 글자별 빛과 높낮이 | — |
| `terminal` | CLI 로딩 상태 | `cursor`, `dots`, `steps`, `meter` |

`fade`, `slide`, `wipe`는 로더 종류가 아니라 완료 후 오버레이가 사라지는 `exit` 옵션입니다.

```html
<div data-kt-loader="spinner"
     data-kt-spinner-style="comet"
     data-kt-color="#ff5b1c"></div>

<div data-kt-loader="bar"
     data-kt-indeterminate="true"
     data-kt-glow="true"></div>

<div data-kt-loader="terminal"
     data-kt-terminal-style="steps"
     data-kt-terminal-lines="모듈 확인|스타일 빌드|접근성 검사"></div>
```

## 진행률 소스

| `source` | 동작 |
|---|---|
| `manual` | `setProgress()` 또는 `manualDuration` 사용 |
| `window` | 페이지 `load` 완료 추적 |
| `resources` | 이미지·영상·스타일·스크립트 완료 비율 추적 |
| `promise` | Promise 완료 전 `promiseCeiling`까지 완만하게 진행 |
| `fetch` | `Content-Length`가 있으면 받은 byte 기준으로 진행 |

```js
const loader = Kineto.loader('.loader', {
  type: 'bar',
  source: 'manual',
  color: '#ff5b1c',
  glow: true
});

loader.setProgress(38);
await loader.trackPromise(fetch('/api/bootstrap'));
loader.complete();
await loader.finished;
```

`finished`는 `{ status, reason?, error? }` 형태로 종료 결과를 반환합니다. `complete()`, `fail(error)`, `cancel(reason)`, `show()`, `hide(reason)`, `pause()`, `resume()`, `destroy()`로 상태를 직접 제어할 수 있습니다.

## 수명주기와 이벤트

콜백은 `onStart`, `onProgress`, `onStateChange`, `onShow`, `onHide`, `onComplete`, `onCancel`, `onError`를 지원합니다. 같은 상태는 DOM 이벤트로도 전달됩니다.

```js
const host = document.querySelector('.loader');
const loader = Kineto.loader(host, {
  type: 'terminal',
  terminalStyle: 'meter',
  source: 'manual',
  onStateChange(state, previous, element, detail) {
    console.log(previous, '→', state, detail);
  }
});

host.addEventListener('kt-loader-progress', ({ detail }) => {
  console.log(detail.value);
});

host.addEventListener('kt-loader-complete', ({ detail }) => {
  console.log(detail.outcome);
});
```

이벤트 이름은 `kt-loader-start`, `kt-loader-progress`, `kt-loader-statechange`, `kt-loader-show`, `kt-loader-hide`, `kt-loader-complete`, `kt-loader-cancel`, `kt-loader-error`입니다.

## 디자인 커스텀

옵션으로 색·크기·두께·속도·방향·후광·텍스트·점 개수·터미널 문구를 조절할 수 있습니다. CSS에서는 다음 토큰과 `.kt-loader-*` 하위 클래스를 덮어쓸 수 있습니다.

```css
.brand-loader {
  --kt-loader-color: #ff5b1c;
  --kt-loader-track-color: rgb(255 255 255 / 14%);
  --kt-loader-highlight-color: #fff;
  --kt-loader-glow-color: #ff8a5c;
  --kt-loader-glow-size: 24px;
  --kt-loader-motion-duration: 900ms;
  --kt-loader-radius: 12px;
  --kt-loader-text-size: 1.25rem;
  --kt-loader-terminal-bg: rgb(7 10 8 / 94%);
  --kt-loader-terminal-border: rgb(169 247 187 / 24%);
}

.brand-loader .kt-loader-bar-progress {
  background: linear-gradient(90deg, #ff5b1c, #ffd5c5);
}
```

런타임은 `--kt-loader-progress`(0–1)와 `--kt-loader-percent`(0–100)를 계속 갱신합니다. 별도 장식이나 WebGL·Canvas UI도 이 값을 구독할 수 있습니다.

내장 DOM을 쓰지 않으려면 `renderUI(el, opts)`에서 `{ root, render, setState, destroy }`를 반환합니다.

```js
Kineto.loader('.loader', {
  source: 'manual',
  renderUI(host) {
    const root = document.createElement('canvas');
    host.append(root);
    return {
      root,
      render(percent) {
        drawCustomLoader(root, percent);
      },
      setState(state) {
        root.dataset.state = state;
      },
      destroy() {
        releaseWebGL(root);
      }
    };
  }
});
```

진행 상태는 `role="progressbar"`, `aria-valuenow`, `aria-busy`로 전달됩니다. 완료 시점을 알 수 없는 모드는 `aria-valuenow`를 제거합니다. `prefers-reduced-motion` 환경에서는 반복 모션을 정지합니다.

정확한 option allowlist는 [Module Reference](../module-reference.md#loader)를 확인합니다. 생성 UI, observer, timer, RAF와 스크롤 잠금은 `destroy()`에서 정리됩니다.
