# Hover · touch · keyboard policy

포인터를 따라가거나 호버에 반응하는 모듈이 **입력 장치별로 무엇을 하는지** 한곳에 적은 표입니다.
구현의 판단 기준은 하나입니다: `src/utils.js` 의 `canHover()`.

## 판단 기준: "지금 붙어 있는 입력 중 하나라도 호버할 수 있는가?"

```js
canHover() === matchMedia('(any-hover: hover) and (any-pointer: fine)').matches
```

| 기기 | `hover`/`pointer` (주 입력) | `any-hover`/`any-pointer` | `maxTouchPoints` | `canHover()` |
|---|---|---|---|---|
| 데스크톱·노트북 (마우스/트랙패드) | hover · fine | hover · fine | 0 | **true** |
| 터치스크린 노트북·트랙패드 달린 태블릿 | **none · coarse** | hover · fine | > 0 | **true** |
| 휴대폰·트랙패드 없는 태블릿 | none · coarse | none · coarse | > 0 | **false** |

**왜 `(hover: none)`·`maxTouchPoints` 가 아닌가:** 두 번째 줄의 기기는 마우스를 쓰는 중에도 주 입력을
coarse·non-hover 로, 터치 포인트를 1 이상으로 보고합니다. 그 두 값으로 판단하던 시절에는
Cursor 가 꺼지고, Tilt·Mouse Parallax 가 노트북에서 절대 오지 않는 자이로스코프를 기다리며 마우스를 무시했습니다
(0.12.3 에서 수정, 게이트 `tests/browser/hover-touch.mjs`). Mega Menu 는 같은 이유로 이미 `any-hover` 를 쓰고 있었고,
지금은 같은 헬퍼를 씁니다.

- 미디어 쿼리가 없는 런타임(DOM shim)은 `true`(가능한 브라우저로 취급 — `env()` 와 같음). Mega Menu 만 예외로
  그 경우에도 탭으로 열리도록 기존 동작을 유지합니다.
- `any-hover` 를 모르는 엔진은 두 값 모두 `false` 를 답하므로 주 입력 쿼리 `(hover: none)` 로 돌아갑니다.
- `env().touch` 는 그대로입니다(터치스크린 **유무**). 캔버스 효과의 품질 단계처럼 "터치 가능한 기기인가"가 질문일 때만 씁니다.
  호버 동작을 켤지 말지는 `canHover()` 로 정합니다.

## 모듈별 동작

| 모듈 | 마우스 (`canHover()`) | 터치 전용 기기 | 터치스크린 노트북에서 손가락 | 키보드 |
|---|---|---|---|---|
| **Cursor** | 페이지/영역 커서가 포인터를 따라감 | 커서를 그리지 않음. `clickSprite`·`clickImage` 만 탭 위치에서 재생 | 커서를 숨기고, 마우스가 다시 움직이면 나타남 | 없음(시각 효과) |
| **Tilt** | 포인터 위치로 기울기·글레어 | 자이로(`gyro: false` 이거나 자이로 없으면 인스턴스 없음). iOS 는 첫 탭에서 권한 요청 | 누르는 동안 그 위치로 기울고, 떼면 복귀 | 없음 |
| **Mouse Parallax** | 레이어·나침반이 포인터를 따라감 | 자이로(`gyro: false` 면 포인터 이벤트 — 손가락으로 끄는 동안) | 끄는 동안 따라감 | 없음 |
| **Card Glow** | 빛이 포인터를 따라감 | 누른 위치로 빛이 이동하며 한 번 밝아짐(press). `disableOnMobile: true` 면 인스턴스 없음 | press + 끄는 동안 따라감 | 없음 |
| **Magnetic** | 가까이 오면 끌려옴(`dock` 은 확대) | 호버가 없으므로 사실상 정지. 끄는 동안만 반응하고 브라우저가 스크롤을 가져가면(`pointercancel`) 복귀 | 끄는 동안 반응 | 없음 — 버튼·링크 자체의 포커스 스타일을 유지 |
| **Gesture** | 끌기 | 끌기(`pull` 은 당기는 중에만 `touchmove` 를 막아 페이지 스크롤과 겨루지 않음) | 끌기 | 없음 — 끌어서 하는 동작은 원래 컨트롤(버튼)도 함께 두세요 |
| **Overflow Text · Hover Roll** | `pointerenter` 에서 굴러가고 `pointerleave` 에서 복귀, 클릭은 즉시 | 같은 창으로 가는 일반 링크는 탭하면 굴러간 뒤 `rollDuration` 후 이동 | 터치 탭 규칙과 같음 | `focusin`/`focusout` = 호버, Enter 즉시 이동 |
| **Mega Menu** (`trigger: hover`) | 호버로 열림(지연 `openDelay`/`closeDelay`) | 탭으로 열림 | 넓은 화면(> 720px)에서는 호버로 여므로 탭은 클릭 경로 | 버튼 Enter/Space·Esc (ARIA `aria-expanded`) |
| **Vibrate** (`trigger: hover`) | `pointerenter` 에서 진동(진동 API 가 있는 기기만) | 연결 안 함 — 호버가 없는 기기에서 호버 진동은 탭마다 울리는 소음 | 호버와 같음 | 없음 |
| **Brush Reveal** | 호버로 칠함(`hold` 모드면 누르는 동안) | 누르는 동안 칠함 | 누르는 동안 칠함 | 없음(시각 효과) |

## 새 모듈·variant 를 만들 때

1. 호버 여부를 직접 `matchMedia('(hover…)')`·`maxTouchPoints`·`'ontouchstart' in window` 로 판단하지 말고 `canHover()` 를 부르세요.
2. 터치 전용 기기에서 **꺼지는** 게 아니라 **다른 방식으로 보여 주는** 경로가 있으면 그쪽을 택하세요(Tilt 자이로, Card Glow press, Hover Roll 지연 이동).
3. 포인터 이벤트 핸들러에서 `event.pointerType === 'touch'` 는 "호버 기기의 손가락"일 수 있습니다. 마우스를 따라가는 시각물은 손가락 위치에 남기지 마세요(Cursor).
4. 이 표와 `tests/browser/hover-touch.mjs` 의 세 프로필(desktop · hybrid · touch)에 새 행을 추가하세요.
