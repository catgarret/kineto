# Presence Core RFC

> 상태: Vanilla prototype 완료 · React/Vue adapter와 keyed-child 자동 제거는 별도 출시 게이트

Presence는 요소의 시각 상태가 아니라 DOM 수명주기를 조율하는 기능입니다.
따라서 `states`의 별칭이나 React 전용 컴포넌트로 만들지 않고, Vanilla Core에서
제거 전후의 순서·취소·접근성 계약을 먼저 고정합니다.

## 목표와 범위

Presence Core는 다음 한 가지 작업을 안정적으로 처리합니다.

1. 요소가 DOM에 들어올 때 enter 모션을 시작합니다.
2. 제거 요청을 받으면 DOM에서 실제로 제거하기 전에 exit 모션을 완료합니다.
3. 실행 중 재진입·취소·중복 요청의 결과를 호출자가 구분할 수 있게 합니다.

초기 범위에는 DOM 삽입 방법, 데이터 fetching, 포커스 트랩, 라우터, 레이아웃
측정을 포함하지 않습니다. DOM을 언제 추가·제거할지는 호스트가 결정하고,
Presence는 `safeToRemove` 경계를 제공합니다.

## 제안 API

```js
import presence from '@dong-gri/kineto/presence';

const lifecycle = presence(panel, {
  enter: { state: cardStates, name: 'visible' },
  exit: { state: cardStates, name: 'hidden' },
  mode: 'wait',
  accessibility: 'managed'
});

await lifecycle.enter();
const result = await lifecycle.leave();
if (result.status === 'finished') panel.remove();
```

현재 prototype은 `@dong-gri/kineto/presence` 선택형 엔트리로 제공됩니다. 전체
번들에 자동 포함하지 않는 이유는 Presence가 DOM 수명주기·접근성 정책까지
소유하므로 visual-only 모듈보다 도입 비용이 크기 때문입니다. 컨트롤러는
`enter()`, `leave()`, `cancel()`, `destroy()`와 읽기 전용 `status`를
제공합니다. `enter()`·`leave()`는 다음 결과 중 하나로 resolve합니다.

| 결과 | 의미 |
| --- | --- |
| `{ status: 'finished' }` | 요청한 enter/exit와 후속 정리가 완료됨 |
| `{ status: 'cancelled', reason: 'reenter' }` | 반대 방향 요청이 현재 실행을 대체함 |
| `{ status: 'cancelled', reason: 'destroy' }` | `destroy()`가 실행을 중단함 |
| `{ status: 'skipped' }` | 이미 제거되었거나 reduced motion 정책으로 모션이 생략됨 |
| `{ status: 'error', error }` | 모션 어댑터가 실패했으며 호스트가 처리해야 함 |

같은 방향의 중복 요청은 현재 Promise를 반환해야 합니다. 반대 방향 요청은
이전 실행을 취소하고 새 실행을 시작하며, 이전 호출자는 반드시 `cancelled`를
받습니다. `cancel()`은 DOM을 제거하지 않습니다.

## 순서 정책

- `sync`: enter/exit가 겹칠 수 있습니다. 기본값이며 가장 짧은 지연을 목표로 합니다.
- `wait`: 현재 exit가 끝난 뒤 다음 enter를 시작합니다. 대기 중 요청은 마지막
  의도만 남기고 중간 요청을 합칩니다.
- `popLayout`: exit 대상의 현재 rect를 고정한 뒤 형제 레이아웃이 먼저 재배치됩니다.
  측정값이 0이거나 숨겨진 컨테이너이면 `sync`로 안전하게 낮춥니다.

부모가 자식을 포함할 때의 전파는 기본적으로 꺼 둡니다. `propagate: true`일
때만 자식 컨트롤러가 같은 취소 토큰으로 exit하고, 부모의 `safeToRemove`는
모든 자식 결과가 끝난 뒤에 resolve합니다.

## focus·ARIA·inert 계약

`accessibility: 'managed'`일 때만 Presence가 접근성 상태를 소유합니다.

- enter 시작 전에는 `aria-hidden="true"`와 `inert`를 적용하고, enter 완료 후
  원래 값을 복원합니다.
- leave가 시작될 때 대상 안에 focus가 있으면 `focusTarget`으로 이동합니다.
  지정하지 않으면 대상 이전의 유효한 trigger, 없으면 `document.body`를 사용합니다.
- leave 중에는 pointer interaction을 차단하지만, exit 취소로 재진입하면 원래
  값을 복원합니다.
- 컨트롤러가 만든 속성·listener만 `destroy()`에서 되돌립니다. 호스트가 설정한
  `aria-hidden`, `inert`, `tabindex`는 덮어쓰지 않고 snapshot으로 보존합니다.

기본값은 `'visual-only'`입니다. 이 경우 Presence는 focus, ARIA, inert를 건드리지
않으며, 접근성 상태는 컴포넌트가 별도로 관리해야 합니다.

## SSR·reduced motion·오류

- SSR에서는 컨트롤러를 만들 수 있고 `enter()`·`leave()`가 DOM을 만지지 않은 채
  `skipped`로 비동기 resolve해야 합니다.
- reduced motion에서는 exit의 최종 상태와 `safeToRemove` 순서만 유지하고 시간
  지연은 제거합니다.
- 모션 어댑터 오류는 DOM 제거로 삼키지 않습니다. `error` 결과를 반환하고,
  호스트가 제거를 계속할지 보류할지 결정합니다.
- `destroy()`는 실행 중인 모션·observer·timer·접근성 snapshot을 정리하며,
  두 번 호출해도 같은 컨트롤러를 반환합니다.

## 어댑터 경계

React와 Vue 어댑터는 framework key를 Core의 identity로 변환할 뿐, 자체 exit
의미를 만들지 않습니다. Strict Mode의 setup/cleanup 반복과 hydration에서는
Core 컨트롤러가 중복 생성되지 않아야 합니다. adapter가 없어도 동일한 API를
Vanilla에서 사용할 수 있어야 하며, 실제 adapter 구현은 Core 계약 테스트가
통과한 뒤 시작합니다.

## 출시 게이트

Presence 공개 API를 구현하기 전에 다음을 자동화합니다.

1. 중복 enter/leave의 idempotency와 `sync`/`wait`/`popLayout` 순서
2. 실행 중 cancel·reenter·destroy 및 `safeToRemove` 중복 호출
3. 이미 제거된 요소·숨겨진 컨테이너·부모 exit 전파
4. focus 이동, 원래 `aria-hidden`·`inert`·`tabindex` 복원
5. reduced motion, SSR, WAAPI 미지원 fallback
6. React Strict Mode·Vue mount/update/unmount와 hydration
7. Core + Presence 소비자 gzip 예산과 listener/timer 순증가 0

이 중 하나라도 Vanilla Core에서 명확히 검증되지 않으면 공개 API 대신 실험
브랜치에 둡니다. `states`의 시각 상태 계약과 Presence의 DOM 수명주기 계약은
서로 합치지 않고 별도 controller로 유지합니다.
