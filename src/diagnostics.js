const CODE_PATTERN = /^KT_[A-Z0-9_]+$/;
const PHASES = new Set(['register', 'create', 'update', 'destroy', 'replay', 'runtime']);

export const DIAGNOSTIC_CODES = Object.freeze({
  DEBUG: 'KT_DEBUG',
  INVALID_MODULE: 'KT_INVALID_MODULE',
  UNKNOWN_MODULE: 'KT_UNKNOWN_MODULE',
  CREATE_FAILED: 'KT_CREATE_FAILED',
  // 요소가 `data-kt-*` 로 모듈을 **요청했는데** 모듈이 붙을 수 없다고 판단한 경우.
  // 오류가 아니라 "이 마크업에는 해당 없음"이고, 화면에는 아무 일도 일어나지 않습니다.
  // 그래서 신호가 없으면 "동작을 안 하는데 이유를 모르겠다"가 됩니다. `detail` 이
  // 어느 요소인지 알려 줍니다(진단은 debug 일 때만 나가므로 기본 소음은 없습니다).
  NOT_APPLICABLE: 'KT_NOT_APPLICABLE',
  UPDATE_FAILED: 'KT_UPDATE_FAILED',
  DESTROY_FAILED: 'KT_DESTROY_FAILED',
  LIFECYCLE_FAILED: 'KT_LIFECYCLE_FAILED',
  TRANSFORM_CONFLICT: 'KT_TRANSFORM_CONFLICT',
  // A still-working public API that has a replacement and a removal release;
  // `detail` names the replacement (docs/diagnostics-and-deprecation.md).
  DEPRECATED: 'KT_DEPRECATED'
});

export function createDiagnostic({ code, module = 'core', phase = 'runtime', recoverable = false, cause, detail } = {}) {
  if (typeof code !== 'string' || !CODE_PATTERN.test(code)) throw new TypeError(`Invalid Kineto diagnostic code: ${String(code)}`);
  if (typeof module !== 'string' || !module) throw new TypeError('Kineto diagnostic module must be a non-empty string');
  if (!PHASES.has(phase)) throw new TypeError(`Invalid Kineto diagnostic phase: ${String(phase)}`);
  return Object.freeze({
    code,
    module,
    phase,
    recoverable: recoverable === true,
    ...(cause === undefined ? {} : { cause }),
    ...(detail === undefined ? {} : { detail }),
    timestamp: Date.now()
  });
}

export function createDiagnosticHub({ isEnabled = () => false, sink = null } = {}) {
  const history = [];
  const listeners = new Set();
  const emit = (payload) => {
    const event = createDiagnostic(payload);
    if (!isEnabled()) return event;
    history.push(event);
    if (history.length > 50) history.shift();
    try { sink?.(event); } catch (_error) { /* diagnostic sinks must never break the module */ }
    listeners.forEach((listener) => {
      try { listener(event); } catch (_error) { /* one observer cannot block the others */ }
    });
    return event;
  };
  return Object.freeze({
    emit,
    create: createDiagnostic,
    subscribe(listener) {
      if (typeof listener !== 'function') throw new TypeError('Kineto diagnostic subscriber must be a function');
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    clear() { history.length = 0; },
    get history() { return history.slice(); }
  });
}
