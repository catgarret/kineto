# RFC: 모듈 합성 계약 (Module Composition Contract)

> 상태: 초안 · 2026-08-09
> 대상: 9개 요청 중 4번 — "모든 모듈들의 설정은 최대한 커스텀이 다 가능해야하고,
> 서로 유기적으로 연동해서 쓸 수 있는건 연동해서 쓸 수 있도록 해줄것"

## 1. 왜 RFC인가

`docs/ROADMAP.md` §9의 의사결정 게이트는 새 public API에 "최소 두 개의 실제 예제 또는
사용자 요구"를 요구하고, §11.1에서 로드맵 자신이 그 게이트를 통과하지 못한 항목을
지적했습니다. 합성 API도 같은 기준을 받아야 합니다. 그래서 이 문서는 **구현이 아니라
측정된 현황과 경계**를 먼저 확정합니다.

## 2. 측정: 합성은 이미 부분적으로 동작합니다

`tilt`와 `cardGlow`를 같은 요소에 올리고 포인터를 움직여 측정한 결과입니다.

| 구성 | 자식 노드 | 호스트 transform | box-shadow |
|---|---|---|---|
| `tilt` 단독 | 1 | `matrix3d(...)` 동작 | `var(--kt-tilt-shadow, …)` |
| `cardGlow` 단독 | 1 | 없음 | `var(--kt-tilt-shadow, …), var(…)` |
| **둘 다** | **2** | `matrix3d(...)` 동작 | 두 모듈의 레이어가 **합쳐짐** |
| `cardGlow` destroy 후 | 1 | 계속 동작 | tilt 것만 남음 |

두 가지 장치가 이걸 가능하게 합니다.

1. **각 모듈이 자기 오버레이 자식을 소유합니다.** 호스트의 콘텐츠를 건드리지 않으므로
   자식이 2개로 늘어날 뿐 서로를 지우지 않습니다.
2. **공유 `box-shadow`가 CSS 커스텀 프로퍼티 체인으로 구성됩니다.**
   (`src/interactiveShadow.js`) 한 모듈이 문자열을 덮어쓰는 대신 각자 자기 레이어를
   변수로 기여합니다.

즉 **합성 primitive는 이미 존재합니다.** 없는 것은 그 계약의 *문서화*와, 그것이
성립하지 않는 축에 대한 처리입니다.

## 3. 측정: 합성이 깨지는 곳

52개 모듈 중 **14개가 호스트 요소의 `transform`을 직접 씁니다.**

```
lazy(8) bottomSheet(2+2) loader(2+1) drag(2) gesture(2) marquee(2) parallax(2)
magnetic(1) mouseParallax(1) progress(1) reveal(1) scrollVelocity(1)
textSplit(1) tilt(1)
```

`transform`은 문자열 하나짜리 단일 슬롯이므로, 이 중 **둘을 같은 요소에 올리면 나중에
쓴 쪽이 앞의 것을 지웁니다.** `box-shadow`는 변수 체인으로 풀었지만 `transform`은 아직
아무도 풀지 않았습니다.

실제로 부딪히는 조합의 예:

- `tilt` + `magnetic` (둘 다 포인터 기반 호스트 transform)
- `parallax` + `scrollVelocity` (둘 다 스크롤 기반 호스트 transform)
- `drag` + `gesture` (둘 다 포인터 기반)
- `marquee` + 무엇이든

현재 데모에 실제로 공존하는 조합은 네 가지뿐이고, 우연히 전부 안전합니다:
`cardGlow + tilt`(위 표), `lazy + lightbox`, `progress + slider`, `hold + textSplit`.
**즉 이 문제는 아직 데모에서 한 번도 드러난 적이 없습니다.** 그것이 이 RFC가 구현이
아니라 초안인 이유입니다.

## 4. 제안: transform도 같은 방식으로 합성

`box-shadow`에서 이미 검증된 패턴을 그대로 옮깁니다. 새 public API 없이 CSS 변수만으로
성립하므로 §9 게이트 7번("새 public API 없이 실험할 수 있는가")을 통과합니다.

```css
/* 합성된 최종 값. 순서가 곧 적용 순서입니다. */
transform:
  var(--kt-t-layout,    translate(0))   /* parallax / scrollVelocity  */
  var(--kt-t-pointer,   translate(0))   /* magnetic / mouseParallax   */
  var(--kt-t-tilt,      rotate(0))      /* tilt                       */
  var(--kt-t-gesture,   scale(1));      /* gesture / drag             */
```

각 모듈은 `el.style.transform = …` 대신 자기 슬롯 변수만 씁니다.

**슬롯을 이름으로 나누는 이유**: transform은 교환법칙이 성립하지 않습니다.
`translate` 다음의 `rotate`와 `rotate` 다음의 `translate`는 다른 결과입니다. 등록 순서에
맡기면 모듈을 선언한 순서에 따라 결과가 달라지므로, 순서를 **계약으로 고정**해야 합니다.

### 진입·중단 조건

- **진입**: 위 충돌 조합 중 최소 2개가 실제 사용 사례로 확인될 것 (§9 게이트 8번).
- **중단**: 슬롯 방식이 `will-change`/합성 레이어 수를 늘려 스크롤 성능을 떨어뜨리면
  중단하고, 대신 "한 요소에 호스트 transform 모듈은 하나만"을 문서화된 제약으로 확정.

### 선행 작업 (지금 해도 되는 것)

1. **충돌 감지 경고.** 두 번째 호스트-transform 모듈이 같은 요소에 붙으면 개발 빌드에서
   `console.warn`. API 변경이 아니고, 실제 충돌이 존재하는지 데이터를 모을 수 있습니다.
2. **문서화.** `docs/common-options.md`에 "한 요소에 올릴 수 있는 조합"과 위 14개 목록.
3. **회귀 테스트.** `cardGlow + tilt`가 지금처럼 합성되는지 고정하는 테스트. 지금은
   우연히 동작하는 것이지 보장된 것이 아닙니다.

## 5. 범위 밖

- 공유 스크롤 타임라인(`parallax`/`scrollVelocity`/`stickyStack`이 하나의 스크롤 관찰자를
  공유하는 것)은 성능 과제이지 합성 과제가 아니므로 분리합니다.
- 모듈 간 이벤트 버스는 만들지 않습니다. 로드맵 §3 "하지 않을 일"의 정신에 어긋나고,
  현재 요구가 없습니다.
