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

`hideScrollbar: false`로 스크롤 잠금을 끌 수 있습니다. 기본값은 `true`입니다. 잠금을 사용하는 동안 브라우저가 루트 스크롤 영역을 일시적으로 접더라도, Loader가 끝나면 열기 직전의 가로·세로 스크롤 위치를 복원합니다. 겹쳐 실행된 Loader는 마지막 잠금이 해제될 때 한 번만 복원합니다.

현재 값은 `loader.progress`, `aria-valuenow`,
`--kt-loader-progress`(0–1), `--kt-loader-percent`(0–100),
`kt-loader-progress` 이벤트의 `event.detail.value`로 읽습니다.
완료는 `loader.finished` 또는 `kt-loader-complete`로 감지합니다.

```html
<div data-kt-progress-scope>
  <div id="page-loader" data-kt-loader="bar"></div>
  <output data-kt-progress-output
          data-kt-progress-template="{value}%">0%</output>
</div>
```

출력 대상은 `<output>`·`<input>`·일반 요소(텍스트)·`<progress>`(값) 모두 됩니다. `<progress>`에는
그 요소의 눈금으로 값을 씁니다 — `max`가 없으면(기본 1) 42%는 `0.42`, `max="100"`이면 `42`입니다.
출력은 반올림한 퍼센트·상태·템플릿이 바뀔 때만 다시 쓰고, `--kt-progress`와 `<progress>` 값은
매 틱 갱신합니다.

출력 대상은 `destroy()` 때 Loader가 쓴 쪽만 되돌립니다. `<output>`·`<input>`·`<progress>`는 값,
버튼·목록 항목 같은 일반 요소는 텍스트입니다.

`window`은 브라우저의 페이지 완료 시점을, `resources`는 발견한
리소스의 완료 개수를 추적합니다. 실제 전송 byte 비율이 필요하면
`trackFetch()`를 사용하고 서버가 `Content-Length`를 제공해야 합니다.
일반 Promise는 전체 크기를 알 수 없으므로 완료 전 수치는 추정값입니다.

## 끝나는 조건

- `window`: 페이지 `load` 이벤트에서 끝나고 `finished`는 `{ status: 'completed' }`로 resolve합니다.
- `resources`: Loader가 만들어지기 전에 이미 받은 스크립트·스타일시트·이미지·영상도 완료로 셉니다.
  `<video>`·`<audio>`는 첫 프레임 데이터(`loadeddata`)에서 끝난 것으로 보고, `loading="lazy"`
  이미지는 기다리지 않습니다(스크롤이 잠긴 동안에는 불러오지 않기 때문입니다). 끝내 소식이 없는
  리소스가 있어도 최대 10초 뒤에는 완료합니다.
- `revealEffect`로 닫혀도 `finished`가 resolve하고 `onHide`와 `kt-loader-complete`·`kt-loader-hide`
  이벤트가 발생합니다. 닫히는 중에 `destroy()`하면 요소가 잘린 채로 남지 않습니다.
- `onStart`·`onStateChange`·`renderUI`의 `render` 같은 페이지 콜백이 예외를 던져도 Loader는 멈추지
  않습니다. 오류는 콘솔과 `KT_LIFECYCLE_FAILED` 진단으로 보고되고 Loader는 계속 진행하므로, 스크롤 잠금이
  남거나 `finished`가 끝나지 않는 일이 없습니다. `promise` 옵션의 Promise가 실패하면 `fail()`로
  처리되고 처리되지 않은 rejection으로 남지 않습니다.

## 확장

`renderUI(el, opts)`에서 `{ root, render, setState, destroy }`를 반환하면 내장 표시를 교체할 수 있습니다. 런타임은 `--kt-loader-progress`(0–1)와 `--kt-loader-percent`(0–100)를 갱신합니다.

정확한 옵션은 [Module Reference](../module-reference.md#loader)를 확인하세요.
