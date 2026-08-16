# Motion States RFC

> 상태: v1 초기 구현 완료 (v0.8.66 예정). 공개 범위는 이 문서의 제한된 시각 속성·lifecycle 계약으로 고정합니다.

상태 기반 모션은 새 효과 모듈을 추가하기 위한 이름이 아닙니다. `reveal`,
`flip`, `textReveal`처럼 이미 존재하는 모듈을 조합할 때 반복되는 “초기 상태 →
표시 상태” 계약을 Core에서 한 번 정의하기 위한 제안입니다.

## 상태

```js
const cardStates = Kineto.states({
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
});

await cardStates.apply('.card', 'visible');
```

v1에서 허용하는 값은 `opacity`, `transform`에 해당하는 `x`, `y`, `scale`,
`rotate`, `skewX`, `skewY`, 그리고 제한된 `filter` 집합(`blur`,
`brightness`)으로 한정합니다. 임의의 CSS 속성이나 레이아웃 측정은 상태 API의
범위에 넣지 않습니다.

`duration`, `delay`, `stagger`, `delayChildren`의 단위는 밀리초입니다.

## 실제 적용 예제

### 대시보드 카드 진입

카드가 서버 데이터와 함께 렌더된 뒤 한 번에 표시하되, 사용자가 reduced motion을
선택하면 지연 없이 최종 상태를 적용합니다.

```js
const dashboard = Kineto.states({
  initial: { opacity: 0, y: 16, blur: 4 },
  ready: { opacity: 1, y: 0, blur: 0 }
});

await dashboard.apply('.dashboard-card', 'ready', {
  initial: 'initial',
  stagger: 40,
  reducedMotion: 'final'
});
```

### 필터 결과 전환

상품 필터가 바뀔 때 목록을 사라지게 한 뒤 새 결과를 표시합니다. DOM을 제거하거나
추가하는 Presence 책임은 포함하지 않으며, 현재 DOM에 남아 있는 요소만 다룹니다.

```js
const results = Kineto.states({
  shown: { opacity: 1, y: 0, scale: 1 },
  hidden: { opacity: 0, y: 8, scale: 0.98 }
});

await results.apply('.result-card', 'hidden', { stagger: 20 });
// 데이터를 갱신한 뒤
await results.apply('.result-card', 'shown', { stagger: 20 });
```

## lifecycle와 취소

- `apply(target, state, options)`는 취소 가능한 Promise를 반환합니다. 완료 결과는
  `{ status: 'finished' }`, 취소 결과는 `{ status: 'cancelled' }` 형태로 구분합니다.
- 같은 대상에 새 상태를 적용하면 이전 재생을 취소하고 새 상태를 시작합니다.
- `replay(target?, state?)`는 마지막으로 적용한 상태를 다시 재생합니다.
- `destroy()`는 생성한 애니메이션·listener·inline style을 정리하고 상태 엔진이
  변경하기 전의 DOM을 복원합니다. 두 번 호출해도 오류가 없어야 합니다.
- `initial: false`는 기존 computed 상태를 시작점으로 사용하며, 초기 상태를
  강제로 덮어쓰지 않습니다.
- `delayChildren`, `stagger`, `beforeChildren`, `afterChildren`는 부모-자식
  순서만 조정합니다. DOM 삽입·삭제와 focus 이동은 Presence의 책임입니다.

## 구현 경계

- 기본 구현은 WAAPI를 사용합니다. GSAP 같은 외부 엔진은 별도 bridge로만 연결합니다.
- Core + States의 추가 gzip 예산은 **3KB 이하**를 1차 상한으로 둡니다. 이를 넘으면
  상태 오케스트레이션을 모듈형 엔트리로 분리한 뒤 다시 측정합니다.
- reduced motion에서는 애니메이션을 재생하지 않고 최종 프레임을 동기화합니다.
- 대상이 숨겨진 컨테이너 안에 있으면 임의로 레이아웃을 측정하지 않습니다. 실제
  rect가 생긴 뒤 적용하거나 최종 상태를 유지합니다.
- keyboard focus, `aria-hidden`, `inert`를 자동으로 바꾸지 않습니다. 상태 모션은
  시각 상태만 다루고, 접근성 상태 변경은 컴포넌트·Presence 계층에서 명시합니다.

## 검증 계획

v1 구현 전에 다음을 테스트 계약으로 고정합니다.

1. 단일 대상의 `apply`, `replay`, `destroy`와 취소 결과
2. 여러 대상의 stagger 및 부모 순서
3. 중복 `apply`와 빠른 재진입
4. reduced motion, 숨겨진 컨테이너, WAAPI 미지원 fallback
5. React Strict Mode·Vue mount/unmount에서 인스턴스 누수 0
6. Core + States 소비자 fixture의 gzip 예산과 모듈형 import 경계

## 출시 게이트

- 위 두 실제 예제가 Vanilla Core에서 동일한 의미로 동작해야 합니다.
- `reveal`, `flip`, `textReveal`과 중복되는 preset을 새로 만들지 않아야 합니다.
- cancel/replay/destroy/reduced motion과 SSR 안전성이 자동 테스트로 고정돼야 합니다.
- 공개 API와 HTML 속성 연결을 문서화하기 전, 두 개 이상의 실제 사용 사례에서
  기존 모듈 조합보다 코드가 단순해지는지 검토합니다.

## v1 구현 표면

`Kineto.states(definitions, defaults)`와 named export `states`를 제공합니다.
`apply`, `replay`, `scan('[data-kt-state]')`, `destroy`를 지원하며, `apply`가
반환하는 Promise에는 현재 재생을 취소하는 `cancel()`이 붙습니다. 부모 대상의
`children`, `stagger`, `delayChildren`, `beforeChildren`, `afterChildren`는
DOM 수명주기를 건드리지 않고 재생 순서만 조정합니다.

v1의 검증은 `tests/states.mjs`와 실제 Chromium의
`tests/browser/states.mjs`에 고정되어 있습니다. `@dong-gri/kineto/core`와
`@dong-gri/kineto/states`를 함께 가져오는 소비자 fixture의 gzip 경계도
`tests/consumer-bundles`에서 측정합니다. React/Vue lifecycle·SSR 검증은
프레임워크 QA fixture에서 별도 계약으로 유지합니다.

이 문서는 범위와 중단 조건을 정하는 RFC이면서 v1 계약의 근거입니다. 임의의
CSS 속성, DOM 삽입·삭제, focus/ARIA 관리, Presence semantics는 여전히 범위
밖이며, 필요하면 별도의 Presence 설계와 출시 게이트를 거칩니다.
