# lightbox

전체 viewport를 덮는 그룹 이미지 viewer입니다. 과장된 FLIP/back-out thumbnail motion 없이 fade 기반으로 열리며, 그룹 탐색·정보·확대·이동·미니맵·커스텀 UI를 제공합니다.

| variant | 동작 |
|---|---|
| `viewer` | 전체 화면 viewer. 기본 |
| `grouped` | 동일 group의 이전/다음 탐색을 강조하는 alias |

```html
<img
  src="./work-1.jpg"
  data-kt-lightbox="viewer"
  data-kt-group="portfolio"
  data-kt-title="Work 1"
  data-kt-description="Detail view"
  alt="Work 1"
>
```

같은 group은 이전/다음 button과 좌우 방향키로 이동합니다. ESC, 닫기 button, backdrop click을 지원합니다. Wheel, toolbar, double click으로 zoom하고 확대 상태에서는 pan과 minimap을 사용할 수 있습니다.

## Lazy 조합

```js
Kineto.lightbox('.gallery-item', {
  group: 'portfolio',
  lazyEffect: 'dissolve',
  lazyOptions: { blur: 16, noise: 0.24 },
  zoom: true,
  minimap: true
});
```

Lightbox 내부 이미지도 Lazy 효과를 사용할 수 있으며 GIF·APNG·animated WebP는 live `<img>`로 재생을 유지합니다.

## UI 커스텀

```js
Kineto.lightbox('.gallery-item', {
  uiTemplate: '<button class="my-action">Action</button>',
  renderUI(container, controls) {
    container.querySelector('.my-action')?.addEventListener('click', () => {
      console.log(controls.image.currentSrc);
    });
  }
});
```

`className`, `uiTemplate`, `renderUI`와 `.kt-lightbox-*` class를 이용해 아이콘과 UI를 HTML/CSS로 교체할 수 있습니다. 마지막 lightbox instance가 파괴되면 공유 viewer manager도 제거됩니다.
