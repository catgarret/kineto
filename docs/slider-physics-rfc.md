# Slider physics RFC

상태: 실험적 opt-in 구현 (기본값 아님)

이 문서는 Slider의 물리 동작을 서로 섞지 않고 검증하기 위한 경계 문서입니다. 현재
공개된 구현은 track Slider의 `momentum`, `bounce`, `stickySnap` 세 옵션이며, 기존
기본값을 바꾸지 않습니다. Radial은 원호 좌표와 별도의 입력 임계값을 사용하므로
같은 옵션을 자동으로 공유하지 않습니다.

## 동작 모델

| 모델 | 의미 | 현재 경계 |
| --- | --- | --- |
| momentum | pointerup 시 최근 속도를 다음 이동량에 반영 | track에서 `true`가 기본값, `velocityInfluence`로 배율 조절 가능 |
| bounce | 양 끝 overscroll을 경계로 되돌리는 제한된 물리 정착 | `bounce:true`일 때만 동작, loop에서는 의미 없음 |
| sticky snap | 드래그 해제 위치를 가장 가까운 정수 슬라이드로 고정 | `stickySnap:true`일 때만 동작, 버튼·키보드·API 이동은 항상 정착 |
| native scroll snap | 브라우저의 scroll container와 `scroll-snap-align`을 사용 | `scrollSnap:true`의 단순 `slide` 전용 opt-in. 조건 밖은 transform fallback |
| FLIP shared layout | 서로 다른 부모·scroll container 사이의 keyed child 이동 | Slider 범위가 아니며 실제 요구 2건 전까지 구현하지 않음 |

## native Scroll Snap 도입 조건

현재 `scrollSnap:true`는 다음 조건을 모두 만족할 때만 native 경로를 선택합니다.

1. `effect:'slide'`, `loop:'off'`, `perView:1`, `axis:'x'`의 단순 구성에서
   transform 엔진과 같은 `index`, `isBeginning`, `isEnd`, change 이벤트를 보장합니다.
2. 마우스·touch·키보드·wheel 입력이 같은 슬라이드에 도착하고, 조건 밖 구성은
   기존 엔진으로 자동 fallback합니다.
3. `destroy()` 뒤에 `overflow`, `scroll-snap-type`, `scroll-behavior`,
   `tabindex`와 authored style이 모두 복원됩니다.
4. reduced motion, hidden/offscreen lifecycle, sync 대상, dynamic resize를
   Chromium·Firefox·WebKit에서 각각 확인합니다.
5. core + slider 소비자 gzip 예산과 초기 layout 비용이 기존 경계 안에 있습니다.

`perView>1`, loop, 3D effect, radial, autoHeight, 세로 축과 양수 `gap`은 native
경로에서 제외합니다. 기능을 억지로 하나의 엔진에 섞으면 현재 해결한 Radial
고스트 이미지와 드래그 회귀를 다시 만들 가능성이 큽니다. 마우스 드래그는
native scroll offset을 직접 갱신하고, touch는 브라우저의 native scrolling을
그대로 사용합니다.

## bounce 수치와 reduced motion

`bounce:true`는 현재 spring 파라미터를 재사용하되, 경계 바깥으로 계속 진행하지
않도록 target을 0 또는 마지막 index로 제한합니다. `prefers-reduced-motion`에서는
overscroll을 즉시 경계로 정착시키고 rAF를 추가로 예약하지 않아야 합니다. 새 공개
수치를 늘리기보다 실제 사용 사례에서 “얼마나 튀어야 하는가”가 확인될 때 별도
`bounceStiffness`를 검토합니다.

## FLIP 확장 gate

`flip`의 View Transitions progressive enhancement와 기존 same-document fallback은
유지합니다. 서로 다른 부모·scroll container·fixed header·transformed ancestor를
보정하는 shared layout은 다음 증거가 각각 2건 모일 때만 구현 RFC로 승격합니다.

- 재현 가능한 keyed child fixture와 기대하는 identity/focus/scroll 정책
- 지원 브라우저와 reduced-motion 결과
- 기존 `data-kt-layout-id`와 충돌하지 않는 API 제안

그 전까지는 [`docs/flip-shared-layout.md`](flip-shared-layout.md)의 현재 계약을
기준으로 하며 새 `layout` 모듈을 만들지 않습니다.

## 검증 순서

1. Node 회귀 테스트에서 momentum on/off, sticky snap, edge bounce의 target과
   `destroy()` 복원을 고정합니다.
2. Chromium에서 native scroll offset, pointer drag, keyboard, sync와 실제 layout
   rect를 측정합니다(`tests/browser/slider-scroll-snap.mjs`).
3. Firefox/WebKit smoke 및 reduced-motion 경로를 확인합니다.
4. 소비자 번들 gzip과 demo drawer의 7개 언어 tooltip을 함께 검사합니다.

한 단계라도 실패하면 다음 물리 모델로 진행하지 않고 해당 모델을 opt-in 상태로
남깁니다.
