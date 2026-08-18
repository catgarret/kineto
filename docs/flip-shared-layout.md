# FLIP shared layout 범위

현재 `flip`은 컨테이너 자식의 First–Last–Invert–Play 이동·크기 변화·추가·삭제·정렬을 담당합니다. `viewTransition: true`와 `data-kt-layout-id`를 함께 사용하면 같은 문서 안의 재배치에서 View Transitions를 우선 사용하고, 미지원·실패 환경에서는 기존 FLIP으로 축소합니다.

## 현재 지원

- 같은 `flip` 컨테이너 안의 자식 reorder와 multi-row layout
- `record()` → DOM 변경 → `play()` 수동 경로
- `reorder()`, `sort()`, `shuffle()`과 `mode: 'slide' | 'fade' | 'crossfade' | 'fade-slide' | 'scale' | 'none'`
- `data-kt-layout-id` 기반 same-document View Transition progressive enhancement
- reduced motion과 `destroy()` 복원

## 아직 공개하지 않는 범위

다음은 현재 계약에 없는 확장입니다.

- 서로 다른 부모 사이의 shared element 이동
- 서로 다른 scroll container 간 이동
- cross-document route transition
- border-radius·clip·fixed header·transformed ancestor를 자동 보정하는 별도 shared-layout API

이 기능을 바로 새 `layout` 모듈로 만들지 않습니다. 실제 keyed child 전환 요구가 최소 두 건 모이고, 동일한 identity·focus·scroll 정책을 먼저 정할 때 `flip`의 선택형 확장으로 검토합니다.

## 출시 게이트

1. 동일 문서·동일 부모의 현재 fallback 계약을 깨지 않는 fixture가 있습니다.
2. 서로 다른 부모와 scroll container의 최소 재현이 각각 확보됩니다.
3. View Transitions 지원·미지원·reduced motion 세 경로의 DOM 복원과 focus 정책이 정의됩니다.
4. 새 API가 기존 `flip` 옵션·`data-kt-layout-id`와 충돌하지 않는다는 타입·문서 검사가 있습니다.

그 전까지는 현재 `flip`을 안정화하고, 요구가 생긴 사례만 이 문서와 로드맵에 추가합니다.
