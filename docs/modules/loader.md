# loader

페이지·영역의 로딩 상태를 표현합니다. 숫자 Counter와 별도 모듈입니다.

| 모드 | 동작 |
|---|---|
| `slot` | 숫자 진행률 표현 |
| `circular` | SVG 원형 진행률과 선택적 퍼센트 |
| `bar` | 수평 진행 bar와 선택적 라벨/퍼센트 |

`fade`, `slide`, `wipe`는 Loader 모드가 아니라 완료 시 overlay가 사라지는 `exit` 옵션입니다.

```html
<div data-kt-loader="circular" data-kt-source="window" data-kt-size="140" data-kt-stroke="8"></div>
<div data-kt-loader="bar" data-kt-source="resources" data-kt-label="Loading"></div>
```

## 진행률 소스

| source | 동작 |
|---|---|
| `manual` | `setProgress()` 또는 `manualDuration` 사용 |
| `window` | 페이지 `load` 완료를 추적 |
| `resources` | image/video/source/stylesheet/script 완료 비율 추적 |
| `promise` | Promise 완료 전 ceiling까지 완만하게 진행 |
| `fetch` | Content-Length가 있으면 실제 byte 진행률 추적 |

```js
const loader = Kineto.loader('.loader', { type: 'bar', source: 'manual' });
loader.setProgress(38);
await loader.trackPromise(fetch('/api/bootstrap'));
loader.complete();
```

정확한 option allowlist는 [Module Reference](../module-reference.md#loader)를 확인합니다. 생성 UI, observer, timer, RAF와 scroll 잠금은 `destroy()`에서 정리됩니다.
