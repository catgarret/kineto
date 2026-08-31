# 브라우저 레이어 QA 이력

`heavy-layout`은 통과율을 꾸미기 위한 숫자가 아니라, 레이어·클리핑·sticky/fixed 경계가 실제 엔진에서 유지됐는지 남기는 릴리스 전 이력입니다. 상세한 대상과 실패 분류는 [브라우저 레이어 QA 매트릭스](browser-qa-matrix.md)를 기준으로 합니다.

## 통과 이력

| 날짜 | 버전 | 커밋 | CI | Node 24 전체 | Firefox | WebKit | Pages | 결과 |
|---|---|---|---|---|---|---|---|---|
| 2026-08-18 | v0.8.104 | `fa055cc` | `32099365793` | 성공 | 성공 | 성공 | `32099951004` 성공 | 대상 8개 모듈의 `heavy-layout` 통과 |
| 2026-08-19 | v0.8.104 후속 | `b027a42` | `32157033656` | 실패(package-size: Node 24 archive 509.8 KB > 509 KB) | 미실행 | 미실행 | 미실행 | `1f0938c`에서 Node 24 측정 경계 수정 |
| 2026-08-19 | v0.8.104 후속 | `1f0938c` | `32158273523` | 성공 | 실패(consumer/framework 묶음) | 미실행 | 미실행 | 동일 Node 24 명령과 `npm ci`를 로컬에서 재현했을 때는 통과; 원격 상세 로그는 공개되지 않아 원인 미확정 |
| 2026-08-19 | v0.8.104 후속 | `dbd4074` | `32165756521` | 성공 | 성공 | 성공 | `32167074624` 성공 | Chromium·Firefox·WebKit `heavy-layout` 및 live-site canonical/backup URL(v0.8.104·52개·GTM) 확인 |
| 2026-08-24 | v0.8.104 운영 gate 후속 | `b6dbc87` | `32688876241` | 성공 | 성공 | 성공 | `32689372504` 성공 | 운영 문서·issue form·readiness CI 추가 후 Chromium·Firefox·WebKit과 Pages 재확인 |
| 2026-08-25 | v0.8.104 Slider physics 후속 | `a13c04d` | `32747071438` | 성공 | 성공 | 성공 | `32747976927` 성공 | `momentum`·`bounce`·`stickySnap` 추가 후 Chromium·Firefox·WebKit, Pages와 live-site 재확인 |
| 2026-08-31 | v0.9.3 browser QA hardening | `2898293` | `33398495438` | 성공 | 성공 | 성공 | `33399421877` 성공 | Chromium 전체 QA 재시도 경계를 적용한 릴리스 검증; npm provenance·GitHub Release·canonical live-site까지 확인 |
| 2026-08-31 | v0.9.3 parity monitor 후속 | `23ee145` | `33406221579` | 성공 | 성공 | 성공 | `33407131223` 성공 | 주간·수동 parity workflow 추가 후 canonical·backup live-site가 모두 v0.9.3·52개·GTM·build `23ee145`로 일치 |
| 2026-09-01 | v0.9.3 readiness evidence 후속 | `8a880e2` | `33412656491` | 성공 | 성공 | 성공 | `33413636565` 성공 | 실기기·case study·deprecation·FLIP evidence contract를 CI에 연결; canonical·backup parity는 build `8a880e2`로 확인 |
| 2026-09-01 | v0.9.3 roadmap priority 후속 | `aba05d9` | `33414388601` | 성공 | 성공 | 성공 | `33415329474` 성공 | States/Presence 확장 gate, modular entry 기본 경로, 고위험 WebKit 목록과 실서비스 선행 조건을 문서화; canonical·backup parity는 build `aba05d9`로 확인 |
| 2026-09-01 | v0.9.3 supply-chain boundary 후속 | `f500a74` | `33418047636` | 성공 | 성공 | 성공 | `33418967364` 성공 | lockfile registry·integrity 경계를 CI에 연결; canonical·backup parity는 build `f500a74`로 확인했고 backup Pages run `33419171058`도 성공 |

## 기록 규칙

- 새 릴리스 또는 레이어 관련 회귀 수정이 병합되면 한 행을 추가합니다.
- Node 전체 job, Firefox, WebKit, Pages 결과를 모두 확인하기 전에는 성공으로 기록하지 않습니다.
- 브라우저 설치·러너 정지 같은 환경 실패는 결과에 `환경 실패`로 적고, 코드 회귀와 섞지 않습니다.
- 대상 목록을 넓히면 같은 행의 결과 설명과 [QA 매트릭스](browser-qa-matrix.md)의 조건을 함께 갱신합니다.

## 다음 기록 후보

다음 대상 편입은 실제 재현 가능한 transform 조상, fixed/sticky, clip/mask, 3D 레이어 회귀가 발견될 때만 진행합니다. 근거가 없는 브라우저별 예외나 모듈 수 확대는 이 이력에 추가하지 않습니다.
