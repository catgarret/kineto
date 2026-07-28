# Loading Indicator

콘텐츠 안에 놓는 독립형 로딩 표시입니다. 오버레이를 만들거나 페이지 스크롤을 잠그지 않습니다.

## 내장 모드

| 값 | 표시 |
|---|---|
| `spinner` | `ring`, `comet`, `dual`, `spokes`, `orbit` |
| `dots` | `pulse`, `bounce`, `wave` |
| `bar` | 진행률 또는 왕복 바 |
| `shimmer` | 텍스트 후광 |
| `shimmer-wave` | 글자별 후광과 높낮이 |
| `terminal` | `cursor`, `dots`, `blocks`, `meter`, ASCII·Braille·Unicode 프레임 스피너 |

터미널 모드는 문구를 포함하지 않습니다. 필요한 라벨은 일반 HTML로 따로 작성합니다. 기본 프레임 프리셋은 `ascii`, `pulse`, `quadrant`, `braille`, `braille-dot`, `braille-bounce`, `arrow`, `line`, `circle`, `corners`, `squares`, `boxes`입니다.

```html
<span class="loading-line">
  <span>설치하는 중</span>
  <span data-kt-loading-indicator="terminal"
        data-kt-terminal-style="dots"></span>
</span>

<span data-kt-loading-indicator="spinner"
      data-kt-spinner-style="comet"></span>
```

### 터미널 프레임 스피너

```html
<span data-kt-loading-indicator="terminal"
      data-kt-terminal-style="braille"
      data-kt-frame-interval="72"></span>
```

```js
Kineto.loadingIndicator('.custom-terminal-spinner', {
  type: 'terminal',
  frames: ['⠁', '⠂', '⠄', '⠂'],
  frameInterval: 72
});
```

`frames`에 문자열 배열을 넘기면 내장 프리셋 대신 사용자 프레임을 순환합니다. `frameInterval`은 프레임 사이의 밀리초 간격이며 최소 40ms로 제한됩니다. 기본 후광은 꺼져 있고 `glow: true`일 때만 적용됩니다.

회전·이동·스케일 기반 표시에는 `transformOrigin`을 지정할 수 있습니다. CSS의 `transform-origin` 문법을 그대로 사용합니다.

```html
<span data-kt-loading-indicator="spinner"
      data-kt-spinner-style="comet"
      data-kt-transform-origin="50% 100%"></span>
```

## 상태와 API

```js
const indicator = Kineto.loadingIndicator('.saving', {
  type: 'bar',
  indeterminate: false,
  color: '#ff5b1c',
  onComplete(element) {
    element.closest('.save-row')?.classList.add('is-saved');
  }
});

indicator.setProgress(64);
indicator.complete();
await indicator.finished;
```

`start()`/`show()`, `hide()`, `stop()`/`complete()`, `pause()`, `resume()`, `setProgress()`, `trackPromise()`, `destroy()`를 제공합니다. 상태는 `kt-loading-indicator-start`, `progress`, `statechange`, `show`, `hide`, `complete`, `error` 이벤트로도 전달됩니다.

```js
const indicator = Kineto.loadingIndicator('.request', {
  type: 'spinner'
});

await indicator.trackPromise(fetch('/api/data'));
```

## CSS와 사용자 UI

색·크기·두께·간격·속도·후광은 옵션과 `--kt-loading-*` 토큰으로 바꿀 수 있습니다. `.kt-loading-*` 하위 클래스도 안정적인 스타일 훅으로 제공합니다.

```css
.brand-indicator {
  --kt-loading-color: #ff5b1c;
  --kt-loading-track-color: rgb(0 0 0 / 12%);
  --kt-loading-size: 44px;
  --kt-loading-stroke: 4px;
  --kt-loading-motion-duration: 900ms;
  --kt-loading-glow-color: #ff8a5c;
  --kt-loading-glow-size: 20px;
}
```

내장 DOM을 쓰지 않으려면 `renderUI(host, options)`에서 `{ root, render, setState, destroy }`를 반환하세요. 런타임은 `--kt-loading-progress`와 `--kt-loading-percent`를 갱신합니다.

정확한 옵션은 [Module Reference](../module-reference.md#loadingindicator)를 확인하세요.
