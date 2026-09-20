# 1.0 진단·deprecation 계약

이 문서는 구현 완료를 주장하는 API reference가 아니라, 1.0 전에 동결해야 할 공개 진단·이행 계약입니다. 현재 기본 동작은 오류를 숨기지 않고, `debug`를 켜지 않은 소비자에게 진단 로그를 추가하지 않는 것입니다.

## 현재 상태

| 항목 | 상태 | 현재 약속 |
|---|---|---|
| public error code | 구현 | `Kineto.diagnosticCodes`와 `Kineto.diagnostics.create()`가 `KT_*` 코드와 공통 shape를 제공합니다. |
| opt-in debug output | 구현 | `Kineto.config({ debug: true, debugSink })` 또는 `Kineto.diagnostics.subscribe()`로 명시적으로 켭니다. 기본값은 비활성입니다. |
| deprecated public API | 1건 | `data-kt-lazy="dither|ascii|halftone"` (v0.11.0에서 Stylize로 이관, 한 minor 유예) |
| migration fixture | 구현 | `KT_DEPRECATED` 진단과 아래 migration 예제, `tests/lazy-stylized-media.mjs`의 alias 검사 |

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

### `KT_NOT_APPLICABLE` — 요청했는데 붙지 못한 경우

요소가 `data-kt-*` 로 모듈을 요청했는데 모듈이 그 마크업에는 붙을 수 없다고 판단하면
(필수 자식이 없는 등) `create()` 는 `null` 을 돌려줍니다. 오류가 아니므로 예외도 콘솔
출력도 없고, 화면에도 아무 변화가 없습니다. 신호가 없으면 작성자에게는 "동작하지 않는다"로만
보이므로, 이때 `KT_NOT_APPLICABLE` 을 한 번 보냅니다.

```js
// { code: 'KT_NOT_APPLICABLE', module: 'tabs', phase: 'create',
//   recoverable: true, detail: 'div#pricing.card' }
```

`detail` 은 `태그#id.첫-클래스` 형태의 짧은 식별자입니다. 페이지의 텍스트나 속성 값은
담지 않습니다 — 진단이 페이지 내용을 실어 나르지 않게 하기 위해서입니다.
사용자용 안내는 [문제 해결](troubleshooting.md#속성을-붙였는데-아무-일도-일어나지-않음)에 있습니다.

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

진단 API는 Core와 어댑터가 공유하는 sink·shape만 제공하며, 어댑터가 임의로
다른 오류 의미를 만들지 않습니다.

## 현재 deprecated 목록

### `data-kt-lazy="dither|ascii|halftone"` → `data-kt-stylize`

v0.11.0에서 이 세 variant는 Lazy를 떠나 Stylize 모듈이 되었습니다. 이유는
분류입니다. Lazy가 하는 일은 이미지를 *가져오는* 것이고, 이 셋이 하는 일은
이미 있는 픽셀을 *다시 그리는* 것입니다. 자세한 근거는
[`module-taxonomy.md`](module-taxonomy.md)에 있습니다.

Lazy의 세 값은 **한 minor 동안 그대로 동작합니다.** 같은 rasterizer와 같은
lifecycle을 쓰므로 결과 픽셀도 동일하며, 사용 시 `debug`를 켠 소비자에게만
`KT_DEPRECATED` 진단을 한 번 보냅니다.

```js
Kineto.config({ debug: true }); // 진단은 opt-in입니다
Kineto.diagnostics.subscribe((entry) => {
  if (entry.code === Kineto.diagnosticCodes.DEPRECATED) console.warn(entry);
});
// { code: 'KT_DEPRECATED', module: 'lazy', phase: 'create', recoverable: true,
//   detail: { variant: 'dither', replacement: 'data-kt-stylize="dither"', removal: 'next major' } }
```

migration은 속성 이름만 바꾸면 됩니다. 다만 Stylize는 로딩을 다루지 않으므로
`data-src`가 아니라 `src`를 쓰고, `data-kt-persist` 대신 `data-kt-mode`로
유지(`persist`, 기본값)와 리빌(`reveal`)을 고릅니다.

```html
<!-- before (v0.10.x) -->
<img data-kt-lazy="dither" data-src="photo.webp" data-kt-cell-size="8" alt="…">
<img data-kt-lazy="ascii" data-src="photo.webp" data-kt-persist alt="…">

<!-- after (v0.11.0+) -->
<img data-kt-stylize="dither" data-kt-mode="reveal" src="photo.webp" data-kt-cell-size="8" alt="…">
<img data-kt-stylize="ascii" src="photo.webp" alt="…">
```

로딩 전환과 질감을 함께 쓰고 싶다면 두 모듈을 한 요소에 붙이면 됩니다. Stylize는
Lazy가 만든 wrapper를 재사용하므로 레이어가 겹치지 않습니다.

```html
<img data-kt-lazy="fade" data-kt-stylize="halftone" data-src="photo.webp" alt="…">
```

major에서 제거할 때 old/new fixture와 변경 전후 번들·lifecycle 결과를 함께
기록합니다.
