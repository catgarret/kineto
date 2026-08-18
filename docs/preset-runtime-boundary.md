# Preset과 runtime 경계

현재 패키지는 별도 preset 패키지를 만들지 않고, runtime과 모듈형 entry를 먼저 제공합니다. 소비자는 필요한 표면을 선택하고 디자인 preset은 애플리케이션 CSS 또는 별도 정적 manifest로 관리합니다.

| 사용 목적 | 권장 entry | 비고 |
|---|---|---|
| 빠른 CDN·전체 데모 | `@dong-gri/kineto` | registry와 전체 모듈을 한 번에 사용 |
| 기본 모션 + 특정 모듈 | `@dong-gri/kineto/core` + `@dong-gri/kineto/modules/<name>` | 소비자 gzip 예산의 기본 경로 |
| States만 선택 | `@dong-gri/kineto/states` | Core와 함께 사용, 전체 registry를 끌어오지 않음 |
| Presence만 선택 | `@dong-gri/kineto/presence` | Core와 함께 사용, adapter 없이 Vanilla 계약 사용 |
| 프레임워크 | `@dong-gri/kineto/react`, `/vue`, `/jquery` | adapter lifecycle·SSR 계약을 별도 검증 |

## 분리하지 않는 이유

브랜드 preset을 지금 별도 패키지로 쪼개면 중복 코드·버전 동기화·설치 경로가 늘어나는 반면, 실제 소비자 이득은 아직 측정되지 않습니다. preset이 runtime보다 큰 배포 단위가 되거나 두 개 이상의 독립 사용 사례가 확인될 때만 별도 manifest/package를 검토합니다.

소비자 번들 측정은 full, core 단일 모듈, core + 3개 모듈, States, Presence, React, Vue fixture를 기준으로 유지합니다.
