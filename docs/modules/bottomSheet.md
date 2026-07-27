# bottomSheet

포커스 트랩, 백드롭, Esc 닫기와 포인터 높이 조절을 지원하는 바텀 시트입니다.

```html
<button data-kt-sheet-trigger="#share-sheet">열기</button>

<section
  id="share-sheet"
  data-kt-bottom-sheet
  data-kt-resizable="true"
  data-kt-resize-area="header"
>
  <h2>공유하기</h2>
  <button>링크 복사</button>
</section>
```

## 높이 조절

- `resizable:true`: 드래그로 높이를 조절합니다.
- `resizeArea:'handle'`: 상단 그립에서만 조절합니다.
- `resizeArea:'header'`: `[data-kt-sheet-header]`, `<header>` 또는 `.kt-sheet__header`에서 조절합니다.

본문은 드래그 영역으로 사용하지 않으므로 텍스트 선택과 복사가 그대로 동작합니다.
- `minHeight`, `maxHeight`: 드래그 범위를 픽셀로 제한합니다.
- 더블클릭 또는 더블탭: CSS 기본 높이로 돌아갑니다.

상호작용 요소나 별도의 제외 영역에는 `data-kt-sheet-no-resize`를 붙일 수 있습니다.

## API와 이벤트

```js
const sheet = Kineto.bottomSheet('#share-sheet', {
  resizable: true,
  resizeArea: 'handle',
  minHeight: 180,
  maxHeight: 760,
  onResize(height, element) {
    console.log(height, element);
  }
})[0];

sheet.open();
sheet.close();
sheet.resetSize();
```

높이가 바뀌면 `kt-sheet-resize` 이벤트가 발생합니다. `detail`에는 `height`와 `source`가 들어갑니다.

상단 그립은 30px 높이의 포인터 영역을 사용하고, 실제 막대는 작게 유지합니다. 색상, 너비, 모서리, 백드롭은 `--kt-sheet-*` CSS 변수로 변경할 수 있습니다.
