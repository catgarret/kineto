# bottomSheet

포커스 트랩, 백드롭, Esc 닫기와 포인터·키보드 높이 조절을 지원하는 바텀 시트입니다.

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
  <button data-kt-sheet-close>닫기</button>
</section>
```

## 포커스와 닫기

- 시트가 열린 동안 뒤 페이지는 `inert`입니다. 키보드·포인터·스크린 리더 모두 뒤 내용에 닿지 않고,
  백드롭 클릭으로 닫는 동작만 남습니다. 닫으면 원래대로 돌아갑니다.
- 열면 포커스가 시트 안의 첫 컨트롤로 갑니다(크기 조절 그립보다 내용이 먼저입니다). 컨트롤이 없으면 시트 자체가 포커스를
  받고, Tab을 눌러도 시트를 벗어나지 않습니다.
- 시트 안에서 `data-kt-sheet-close`를 붙인 버튼은 시트를 닫습니다.

## 높이 조절

- `resizable:true`: 드래그로 높이를 조절합니다.
- `resizeArea:'handle'`: 상단 그립에서만 조절합니다.
- `resizeArea:'header'`: 기본 상단 그립은 그대로 유지하며, `[data-kt-sheet-header]`, `<header>` 또는 `.kt-sheet__header`에서도 조절합니다.

본문은 드래그 영역으로 사용하지 않으므로 텍스트 선택과 복사가 그대로 동작합니다.
- `minHeight`, `maxHeight`: 드래그 범위를 픽셀로 제한합니다.
- 더블클릭 또는 더블탭: CSS 기본 높이로 돌아갑니다.
- 키보드: 그립은 포커스를 받는 구분선(`role="separator"`)입니다. ↑/↓는 24px씩 높이를 바꾸고,
  Home/End는 최소·최대 높이로 맞춥니다. 키보드로 바꾼 높이는 `aria-valuenow`로 읽힙니다.

상호작용 요소나 별도의 제외 영역에는 `data-kt-sheet-no-resize`를 붙일 수 있습니다.

### 그립 툴팁 문구

- `resizeLabel`: 상단 그립에 붙는 `title` 문구이며, 키보드 구분선의 이름도 이 문구입니다.
  기본값은 `'Drag to resize · Double-click to reset'` 입니다.
- 빈 문자열(`resizeLabel:''`)을 주면 툴팁을 달지 않습니다. 이때 구분선에도 이름이 없어집니다.
- 라이브러리는 읽는 사람의 언어를 알 수 없으므로 문구를 대신 정하지 않습니다.
  `label`과 같은 규칙으로, 화면에 보이는 문구는 페이지가 정합니다.

```html
<div data-kt-bottom-sheet
     data-kt-resizable="true"
     data-kt-resize-label="드래그: 높이 조절 · 더블클릭: 초기화">
```

여러 언어를 쓰는 페이지라면 언어를 바꿀 때 이 옵션 값도 함께 바꿔 주세요. 이미 만들어진
그립의 `title`은 초기화 시점의 값이라 옵션만 바꾸면 갱신되지 않습니다.

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

높이가 바뀌면 `kt-sheet-resize` 이벤트가 발생합니다. `detail`에는 `height`와 `source`가 들어가며, 키보드로 바꾼 경우 `source`는 `'keyboard'`입니다.

상단 그립은 30px 높이의 포인터 영역을 사용하고, 실제 막대는 작게 유지합니다. `resizeArea:'header'`에서도 그립과 헤더를 모두 사용할 수 있습니다. 색상, 너비, 모서리, 백드롭은 `--kt-sheet-*` CSS 변수로 변경할 수 있습니다.
