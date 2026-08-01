# Loading Indicator

콘텐츠 안에 놓는 독립형 로딩 표시입니다. 오버레이를 만들거나 페이지 스크롤을 잠그지 않습니다.

## 내장 모드

| 값 | 표시 |
|---|---|
| `spinner` | `ring`, `comet`, `spokes`; `comet`은 `spin`, `grow`, `fill` 지원 |
| `dots` | `pulse`, `bounce`, `wave` |
| `bar` | 진행률 또는 왕복 바 |
| `shimmer` | 텍스트 후광 |
| `shimmer-wave` | 글자별 후광과 높낮이 |
| `terminal` | `cursor`, `dots`, `blocks`, `meter`, ASCII·Braille·Unicode 프레임 스피너 |

터미널 모드는 문구를 포함하지 않습니다. 필요한 라벨은 일반 HTML로 따로 작성합니다. 설정창의 프리셋 목록에서 지원되는 프레임만 제공하며, 선택한 프리셋이 사용하지 않는 옵션은 숨깁니다.

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

비슷하게 보이는 점자·원형 프리셋은 진행 방향과 리듬이 다릅니다.

| 프리셋 | 구분 |
|---|---|
| `braille` | 두 점이 점자 셀 가장자리를 따라 계속 회전합니다. |
| `braille-pulse` | 빈 세로 막대가 아래부터 차오르고, 완전히 찬 상태를 잠시 유지한 뒤 다시 비워집니다. |
| `circle` | 부채꼴 문자가 시계 방향으로 회전합니다. |
| `clock` | 실제 시계 얼굴이 12시·3시·6시·9시 순서로 바뀝니다. |

`scanner`는 진행률이 없으면 계속 움직입니다. `progress` 또는
`setProgress()`로 값을 전달하면 해당 위치에서 멈추는 실제 진행률
표시로 전환됩니다.

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

표시 문구도 같은 값으로 갱신하려면 범위를 묶고 출력 템플릿을
지정합니다.

```html
<span data-kt-progress-scope>
  <span data-kt-loading-indicator="spinner"
        data-kt-spinner-mode="fill"
        data-kt-progress="64"
        data-kt-auto-complete="false"></span>
  <output data-kt-progress-output
          data-kt-progress-template="{value}% 완료">64% 완료</output>
</span>
```

`start()`/`show()`, `hide()`, `stop()`/`complete()`, `pause()`, `resume()`,
`setProgress()`, `bindProgress()`, `trackPromise()`, `destroy()`를 제공합니다.
상태는 `kt-loading-indicator-start`, `progress`, `statechange`, `show`,
`hide`, `complete`, `error` 이벤트로도 전달됩니다.

```js
const indicator = Kineto.loadingIndicator('.request', {
  type: 'spinner'
});

await indicator.trackPromise(fetch('/api/data'));
```

Loader나 다른 Loading Indicator의 실제 진행률을 공유할 수도 있습니다.

```js
const pageLoader = Kineto.loader('#page-loader', { source: 'resources' });
const compact = Kineto.loadingIndicator('#header-progress', {
  type: 'bar',
  indeterminate: false
});

compact.bindProgress(pageLoader);
```

선언형 사용은 `data-kt-progress-source="#page-loader"`를 지정합니다.
연결은 기존 진행률 DOM 이벤트만 구독하므로 두 모듈 사이에 순환
의존성을 만들지 않습니다.

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
