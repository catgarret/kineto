# flip

자식 요소의 순서·위치·크기가 바뀔 때 기존 DOM을 유지한 채 새 위치로 이동시킵니다. 이벤트와 내부 상태를 보존하므로 필터·정렬 UI에 사용할 수 있습니다.

```html
<div id="work-grid" data-kt-flip data-kt-duration="0.45">
  <article data-date="2026-07-10" data-category="work">A</article>
  <article data-date="2026-06-18" data-category="lab">B</article>
</div>
```

```js
const layout = Kineto.flip('#work-grid');

layout.shuffle();
layout.sort('asc');
layout.sort('desc');
layout.sort('date', { key: 'date', order: 'desc' });
layout.sort('category', {
  key: 'category',
  categoryOrder: ['work', 'lab']
});
layout.sort((a, b) => Number(a.dataset.rank) - Number(b.dataset.rank));
```

행 수나 열 수를 가정하지 않고 각 자식의 이전/이후 위치를 비교하므로 한 줄 목록뿐 아니라 CSS Grid/Flex의 2–3행 배치, 반응형 열 변경, 아이템 크기 변경에도 같은 API를 사용합니다.

## 재배치 모드

| `mode` | 동작 |
|---|---|
| `none` | 모션 없이 즉시 새 순서를 표시합니다. |
| `slide` | 기존 위치에서 새 위치까지 이동합니다. 기본값입니다. |
| `fade` | 원래 상태가 사라지고 짧은 공백 뒤 새 순서가 나타납니다. |
| `crossfade` | 이전 상태와 새 상태가 끊김 없이 교차 전환됩니다. |
| `fade-slide` | 위치 이동과 페이드를 함께 적용합니다. |
| `scale` | 원래 위치에서 작아진 뒤 새 위치에서 다시 커집니다. 불투명도 페이드는 사용하지 않습니다. |

```html
<div data-kt-flip data-kt-mode="none">...</div>
```

수동 변경은 `record()` → DOM 변경 → `play()` 순서로 실행합니다. `reorder(items)`는 전달한 기존 자식 목록을 새 순서로 배치합니다.

`watch`는 외부 코드가 컨테이너의 직계 자식 DOM을 추가·삭제·재배치할 때 MutationObserver로 자동 재생할지를 정합니다. `watch:false`로 이 감지를 끌 수 있습니다. `shuffle()`, `sort()`, `reorder()`는 명시적으로 호출하는 인스턴스 메서드이므로 `watch` 값과 관계없이 선택한 `mode`로 재생됩니다.

`destroy()`는 observer를 해제하며, 정렬 과정에서 자식을 복제하거나 다시 만들지 않습니다.
