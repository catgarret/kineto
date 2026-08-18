# 1.0 진단·deprecation 계약

이 문서는 구현 완료를 주장하는 API reference가 아니라, 1.0 전에 동결해야 할 공개 진단·이행 계약입니다. 현재 기본 동작은 오류를 숨기지 않고, `debug`를 켜지 않은 소비자에게 진단 로그를 추가하지 않는 것입니다.

## 현재 상태

| 항목 | 상태 | 현재 약속 |
|---|---|---|
| public error code | 구현 | `Kineto.diagnosticCodes`와 `Kineto.diagnostics.create()`가 `KT_*` 코드와 공통 shape를 제공합니다. |
| opt-in debug output | 구현 | `Kineto.config({ debug: true, debugSink })` 또는 `Kineto.diagnostics.subscribe()`로 명시적으로 켭니다. 기본값은 비활성입니다. |
| deprecated public API | 없음 | 소유자 승인 없이 deprecated로 표시하지 않음 |
| migration fixture | 준비 전 | 실제 deprecated API가 생기는 release에서 추가 |

## 제안하는 오류 shape

새 오류 계약을 공개할 때는 모듈 내부 예외를 삼키지 않고 다음 정보를 구조화합니다.

```js
{
  code: 'KT_<AREA>_<REASON>',
  module: 'slider',
  phase: 'create|update|destroy|replay',
  recoverable: true,
  cause: originalError
}
```

현재 구현 예시는 다음과 같습니다.

```js
const events = [];
const unsubscribe = Kineto.diagnostics.subscribe((event) => events.push(event));
Kineto.config({ debug: true });

const event = Kineto.diagnostics.create({
  code: Kineto.diagnosticCodes.CREATE_FAILED,
  module: 'slider',
  phase: 'create',
  recoverable: true,
  cause: new Error('example')
});
Kineto.diagnostics.emit(event);
unsubscribe();
Kineto.diagnostics.clear();
```

`debugSink`를 주입하면 콘솔 대신 소비자 sink로만 전달됩니다. Kineto는 DOM,
URL, 서버 응답을 자동 수집하지 않으며, 최근 50개 이벤트만 opt-in 상태에서
메모리에 보관합니다. `cause`는 원래 오류 객체를 그대로 전달하므로 소비자가
필요한 경우에만 직렬화해야 합니다.

`code`는 문서와 테스트에 고정된 대문자 식별자여야 하며, `cause`를 제외한 필드는 브라우저·프레임워크 어댑터에서 동일해야 합니다. 복구 가능한 오류는 정적/fallback 경로를 유지하고, 복구 불가능한 오류는 callback·Promise·debug sink 중 기존 소비자가 선택한 경로로 전달해야 합니다.

## opt-in debug gate

- 기본값은 `false`이며 console 출력이나 성능 측정을 추가하지 않습니다.
- debug sink는 소비자가 주입한 함수로 제한하고, DOM·URL·서버 응답을 자동 수집하지 않습니다.
- `Kineto.diagnostics.clear()`로 buffer를 비우고, `subscribe()`가 반환한 unsubscribe 함수로 listener를 제거합니다.
- 새 debug 필드는 Core와 React/Vue adapter에서 같은 의미를 가져야 하며, 먼저 Node·SSR fixture를 통과해야 합니다.

## deprecation 절차

1. 대체 API와 migration 예제를 먼저 추가합니다.
2. deprecated 표시는 minor release note·reference·TypeScript declaration에 동시에 반영합니다.
3. 최소 한 minor 동안 동작을 유지하고, 개발 환경에서만 opt-in 경고를 허용합니다.
4. major에서 제거할 때 old/new fixture와 변경 전후 번들·lifecycle 결과를 함께 기록합니다.

현재 공개 API에는 deprecation을 시작할 항목이 없습니다. 진단 API는 Core와
어댑터가 공유하는 sink·shape만 제공하며, 어댑터가 임의로 다른 오류 의미를
만들지 않습니다. 실제 deprecated API가 생기면 이 문서의 migration fixture와
minor 유예 기간을 함께 갱신합니다.
