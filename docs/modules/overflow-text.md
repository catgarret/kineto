# overflowText

구형 아이리버 MP3/LCD 화면처럼 폭을 넘는 텍스트만 움직입니다. 짧은 문자열은 정적으로 유지합니다.

| 모드 | 정확한 동작 |
|---|---|
| `loop` | 복제된 두 구간이 끊김 없이 같은 방향으로 흐름 |
| `bounce` | 끝까지 이동한 뒤 반대 방향으로 실제 이동 |
| `rewind` | 끝까지 이동 → mask-out → 숨은 상태에서 시작점 reset → mask-in |
| `once` | 끝까지 한 번 이동하고 멈춤 |
| `page` | 현재 페이지 mask-out → 다음 페이지 교체 → mask-in |
| `rolling` | 옛날 실시간 검색어처럼 항목이 위/아래로 롤링 전환 |

```html
<div
  data-kt-overflow-text="rewind"
  data-kt-mask-direction="top-to-bottom"
  data-kt-mask-duration="220"
>오래된 MP3 플레이어의 아주 긴 곡 제목</div>
```

## Mask 방향

Rewind와 Page는 `top-to-bottom`, `bottom-to-top`, `left-to-right`, `right-to-left`를 지원합니다. Rewind는 Bounce처럼 뒤로 이동하지 않습니다.

```html
<div data-kt-overflow-text="page" data-kt-mask-direction="right-to-left">...</div>
```

Page는 페이지 사이를 긴 슬라이드 tween으로 이동하지 않습니다. 현재 페이지를 mask로 감춘 뒤 다음 페이지로 교체하고 다시 드러냅니다.

## Rolling

```html
<div data-kt-overflow-text="rolling" data-kt-roll-direction="up" data-kt-hold-duration="1800">
  <span>1. Kineto</span>
  <span>2. Pixel Mosaic</span>
  <span>3. Ambient Glow</span>
</div>
```

### Hover Roll (`data-kt-trigger="hover"`)

항목이 둘인 Rolling에 `trigger: "hover"`를 주면 GNB 라벨처럼 호버·포커스에서 한 번 굴러 올라가고, 벗어나면 돌아옵니다.

| 입력 | 동작 |
|---|---|
| 마우스 | `pointerenter`에서 굴러가고 `pointerleave`에서 돌아옴. 링크 클릭은 즉시 이동 |
| 키보드 | `focusin`/`focusout`이 호버와 같음. Enter는 즉시 이동(지연 없음) |
| 터치 | 호버가 없으므로, **같은 창으로 가는 일반 링크**는 탭하면 먼저 굴러간 뒤 `rollDuration` 후 원래 클릭을 한 번 다시 실행 |
| 터치 예외 | `download`, `target`이 `_self`가 아닌 링크, 수정키, 이미 `preventDefault()`된 클릭은 지연하지 않음 |

전체 모듈의 호버 전용 동작 정책은 [hover-touch-policy.md](../hover-touch-policy.md)에 있습니다.

## 접근성

- 움직이는 레이어는 `aria-hidden`이고, 스크린리더는 요소 안의 보이지 않는 텍스트 하나(`kt-sr-only`)를
  읽습니다. `aria-label`은 링크·버튼·제목처럼 이름을 가질 수 있는 요소에만 함께 붙습니다.
- `rolling`과 장면 목록은 항목의 텍스트를 이어 붙여 읽지 않습니다. `title`은 첫 번째 항목이고, 보이지
  않는 텍스트도 첫 항목에서 시작해 시간에 따라 넘어가는 목록에서는 화면에 보이는 항목을 따라갑니다.
- 스스로 넘어가는 텍스트는 live region이 되지 않습니다. `rolling`은 더 이상 기본으로
  `role="status"`·`aria-live="polite"`를 붙이지 않으며, 읽기 모드에서 현재 항목으로 읽힙니다.
- `ariaLive`·`role`은 `rolling`에서 페이지가 지정했고, 목록이 시간에 따라 넘어가지 않으며(hover로
  넘기거나 항목이 하나), 요소에 자기 역할이 없을 때만 적용됩니다. 링크·버튼·제목·목록 항목·
  `tabindex`가 있는 요소는 역할을 그대로 유지하므로, `rolling` 내비게이션 링크는 계속 링크로 읽힙니다.

`resume()`·`replay()`로 다시 만들어도 hover 리스너는 한 벌만 남고, 시간으로 넘어가는 `rolling`은 보이던
항목에서 이어집니다.

정확한 option allowlist는 [Module Reference](../module-reference.md#overflowtext)를 확인합니다. ResizeObserver가 overflow를 다시 계산하며 `destroy()`는 animation, timer, observer, listener와 생성 구조를 정리하고 원래 HTML/style/title/ARIA를 복원합니다.
