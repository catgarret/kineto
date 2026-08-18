# 모듈 유지 상태표

이 표의 상태는 기능의 좋고 나쁨을 평가하는 점수가 아니라, 유지보수 약속의 범위를 표시합니다. 공개 모듈의 상태를 임의로 `experimental` 또는 `deprecated`로 낮추지 않고, 계약·문서·지원 증거가 먼저 있어야 변경합니다.

## 현재 기준선

| 상태 | 현재 수 | 의미 |
|---|---:|---|
| `stable` | 52 | 공개 feature contract와 semver 변경 정책의 적용을 받는 모듈 |
| `maintenance` | 0 | 새 기능보다 버그·보안·호환성 수정만 우선하는 모듈 |
| `experimental` | 0 | 공개 계약에 포함하기 전 opt-in으로 검증하는 경로 |
| `deprecated` | 0 | migration 문서와 최소 한 minor의 이행 기간을 거치는 모듈 |

현재 `cssScroll`, Scroll Snap, Scroll-driven Animations 같은 플랫폼 경로의 **실험성**은 모듈 전체를 experimental로 분류한다는 뜻이 아닙니다. 해당 경로만 [플랫폼 progressive enhancement 문서](platform-enhancements.md)의 opt-in 범위로 남깁니다.

## 상태 변경 게이트

- `stable` → `maintenance`: 유지 비용, 실제 사용량, 대체 경로를 issue 또는 릴리스 기록으로 남깁니다.
- `stable` → `deprecated`: 대체 API, migration 예제, 지원 종료 예정 major를 먼저 문서화하고 소유자 승인을 받습니다.
- `experimental` → `stable`: Vanilla 계약, reduced motion, keyboard/focus, destroy, 브라우저 증거와 최소 두 개의 실제 사례를 확보합니다.
- `deprecated` → 제거: 최소 한 minor의 migration 기간과 major release note를 거친 뒤에만 가능합니다.

각 상태 변경은 `CHANGELOG.md`, 모듈 문서, contract/reference, demo QA를 같은 변경에 포함해야 합니다. 상태 숫자는 공개 다운로드나 star로 자동 변경하지 않습니다.

## 다음 갱신 조건

실제 issue·case study·공급망 대응 기록이 생길 때만 해당 모듈의 행을 `maintenance`로 세분화합니다. 그 전까지는 52개 공개 모듈을 계약상 `stable`로 유지하고, 품질 차이는 [사용·품질 매트릭스](module-usage-matrix.md)의 접근성·성능·reduced-motion 기준으로 표시합니다.
