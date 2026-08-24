# Changelog

## [Unreleased]

### English

<!-- Add matching English release bullets here. -->
- Add a pinned Rolldown consumer fixture alongside Vite, with separate gzip budgets and a generated report that distinguishes cross-bundler evidence from universal byte promises.
- Bound Playwright Chromium binary installation to five minutes per attempt with three required retries and kept apt dependency provisioning out of the main lane, so a stalled browser or package mirror cannot leave CI running until its global timeout.
- Annotate the exact consumer/framework subcommand when the hosted grouped check fails, preserving the hard gate while making remote-only failures actionable without private logs.
- Emit failure annotations from locked nested installs and consumer/Rolldown budget checks so a hosted failure identifies its failing boundary even when job logs require authentication.
- Account for the measured 0.3 KB Linux esbuild gzip delta at the full consumer fixture boundary while keeping the 130 KB product budget unchanged.
- Keep Firefox/WebKit matrix lanes on bounded browser-binary installs without apt provisioning, while restoring the Chromium lane's required libraries behind a 10-minute timeout so full browser QA remains runnable without an unbounded package-mirror wait.
- Connect cross-browser smoke servers through their originating Playwright engine instead of always using Chromium, restoring the WebKit smoke contract.
- Provision WebKit's required runtime libraries in its bounded matrix lane while retaining the faster Firefox binary-only path.
- Record the successful hosted v0.8.104 verification across Chromium, Firefox, WebKit, Pages, and both live-site hostnames.
- Add an opt-in public diagnostics hub with stable `KT_*` codes, bounded history, sink/subscriber APIs, and validation while keeping default consumers silent.
- Add an iOS Safari/Android Chrome physical-device QA runbook and evidence format without counting Playwright emulation as device success.
- Audit all 16 Page Reveal variants against distinct source mechanisms and keep removed aliases out of the public contract.
- Promote Cover Reveal gallery and Radial Carousel layer checks into the cross-engine `heavy-layout` regression checkpoint to catch clipping and ghost-image regressions.
- Absorb the measured Node 24/npm 11 diagnostics package archive boundary without widening the release file allowlist.
- Refresh the roadmap baseline to v0.8.104 and record the WebKit Tabs recovery, 52-module live-site check, and post-deploy verification evidence.
- Add a Korean troubleshooting guide for modular imports, hidden layouts, mobile Mega Menu, Slider/Radial drag, Page Reveal distinctions, date parsing, Scroll Shadows, SSR, CDN/SRI/GTM, CI, and reduced motion.
- Add a docs-navigation CI audit that keeps the package version, 52-module reference, module index, roadmap, and troubleshooting headings synchronized.
- Document when to use the full entry versus `core` + module imports and link the troubleshooting path from both README indexes.
- Absorb the measured 0.3 KB Node 24/npm 11 release-tarball boundary without widening the runtime file allowlist, and run the docs-navigation audit in the hosted CI group.
- Add a single generated 52-module usage and quality matrix, neutral demo badges for accessibility/performance/reduced-motion status, and a CI completeness check that keeps the demo surface and docs aligned.
- Bound Playwright Firefox/WebKit binary installation to five minutes per attempt with three required retries, so a stalled browser CDN cannot consume the full matrix job without producing a useful failure.
- Promote transform, clip, fixed/sticky, mask, and 3D layer boundaries for pageReveal, pageTransition, slider, stickyStack, stickyHeader, lightbox, cursor, and fullpage into a cross-engine `heavy-layout` demo-polish checkpoint, verified in Chromium, Firefox, and WebKit.
- Add a browser-layer QA matrix with module risk boundaries, used-value measurement rules, release triage categories, and criteria for promoting additional modules into the cross-engine checkpoint.
- Add five roadmap decision documents covering QA history, FLIP shared-layout scope, 1.0 readiness, preset/runtime boundaries, and platform progressive enhancement.
- Derive demo variant choices from the feature contract, remove stale Page Reveal/Loader effects, and add browser-support, consumer-bundle, module-status, and 1.0 diagnostics/deprecation audits.
- Add contract-aware contribution and issue forms for reproducible bugs, gated feature proposals, and browser/device QA evidence, plus a case-study template and CI readiness check for the long-term 1.0 gate.
- Record the successful `b6dbc87` Node/Firefox/WebKit matrix and Pages deployment in the browser QA history.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- Vite와 함께 고정된 Rolldown 소비자 fixture를 추가하고, bundler 간 근거와 모든 bundler의 절대 바이트 약속을 구분하는 gzip 예산·생성 보고서를 연결했습니다.
- Playwright Chromium 바이너리 설치를 시도당 5분, 최대 3회로 제한하고 메인 lane에서는 apt 의존성 설치를 제외해 브라우저·패키지 mirror 정체가 CI를 전역 timeout까지 붙잡지 않도록 했습니다.
- hosted grouped check가 실패하면 정확히 어떤 consumer/framework 하위 명령인지 annotation으로 남겨 private log 없이도 원격 전용 실패를 추적할 수 있게 했습니다. 테스트 gate 자체는 유지합니다.
- locked nested install과 consumer/Rolldown 예산 검사가 실패할 때도 annotation을 남겨 job log 인증이 없어도 어느 경계에서 실패했는지 확인할 수 있게 했습니다.
- full consumer fixture에서 측정된 Linux esbuild gzip 0.3KB 차이만 반영하고 130KB 제품 예산 자체는 유지했습니다.
- Firefox/WebKit matrix lane은 apt 의존성 설치 없이 제한된 브라우저 바이너리를 사용하고, 전체 browser QA에 필요한 Chromium 라이브러리는 10분 timeout 안에서 복원해 package mirror 정체가 무기한 대기하지 않도록 했습니다.
- 교차 브라우저 smoke server를 항상 Chromium client로 연결하지 않고 생성한 Playwright engine으로 연결해 WebKit smoke 계약을 복구했습니다.
- WebKit matrix lane에는 필요한 runtime library를 제한 시간 안에 설치하고 Firefox는 빠른 바이너리-only 경로를 유지했습니다.
- Chromium·Firefox·WebKit·Pages와 두 live-site hostname에서 v0.8.104 hosted 검증이 성공한 근거를 기록했습니다.
- 기본 소비자는 조용하게 유지하면서 안정적인 `KT_*` 코드, 제한된 history, sink/subscriber API와 validation을 제공하는 opt-in 공개 diagnostics hub를 추가했습니다.
- iOS Safari·Android Chrome 실기기 QA 실행표와 증거 형식을 추가했으며, Playwright emulation을 실기기 성공으로 집계하지 않습니다.
- 16개 Page Reveal variant를 서로 다른 소스 메커니즘과 대조 감사하고, 제거된 alias가 공개 contract로 돌아오지 않도록 고정했습니다.
- Cover Reveal gallery와 Radial Carousel 레이어 검사를 교차 엔진 `heavy-layout` 회귀 체크포인트로 승격해 clipping·고스트 이미지 회귀를 잡도록 했습니다.
- release 파일 allowlist를 넓히지 않고 Node 24/npm 11 diagnostics 패키지 archive의 측정된 경계 차이만 흡수했습니다.
- 로드맵 기준을 v0.8.104로 갱신하고 WebKit Tabs 복구, 52개 모듈 live-site 점검, 배포 후 검증 근거를 기록했습니다.
- 모듈형 import, 숨겨진 레이아웃, 모바일 Mega Menu, Slider/Radial 드래그, Page Reveal 차이, 날짜 파싱, Scroll Shadows, SSR, CDN/SRI/GTM, CI, reduced motion을 증상별로 설명하는 한국어 troubleshooting 문서를 추가했습니다.
- package 버전·52개 module reference·module index·로드맵·troubleshooting heading의 동기화를 유지하는 docs-navigation CI 감사를 추가했습니다.
- 전체 엔트리와 `core` + 모듈 import를 언제 선택할지 문서화하고 두 README 색인에서 troubleshooting 경로를 연결했습니다.
- Node 24/npm 11에서 측정된 release tarball 0.3KB 경계만 흡수하고 runtime 파일 allowlist는 넓히지 않았으며, hosted CI 그룹에도 docs-navigation 감사를 포함했습니다.
- 52개 모듈의 사용 시점·피해야 할 상황·접근성·성능·reduced motion 상태를 단일 생성 매트릭스와 데모 뱃지로 연결하고, 데모·문서 누락을 잡는 CI completeness 검사를 추가했습니다.
- Playwright Firefox/WebKit 바이너리 설치를 시도당 5분, 최대 3회로 제한해 브라우저 CDN이 멈춰도 matrix job 전체 시간을 소모하지 않고 원인을 남기도록 했습니다.
- pageReveal·pageTransition·slider·stickyStack·stickyHeader·lightbox·cursor·fullpage의 transform·clip·fixed/sticky·mask·3D 레이어 경계를 `demo-polish`의 교차 엔진 `heavy-layout` 체크포인트로 승격하고 Chromium·Firefox·WebKit에서 검증했습니다.
- 모듈별 레이어 위험, used value 측정 규칙, 릴리스 triage 분류, 추가 모듈 편입 조건을 정리한 브라우저 레이어 QA 매트릭스를 추가하고 docs-navigation CI에 연결했습니다.
- 브라우저 QA 이력, FLIP shared-layout 범위, 1.0 계약 준비도, preset/runtime 경계, 플랫폼 progressive enhancement를 다루는 로드맵 문서 5개를 추가했습니다.
- 기능 계약에서 데모 variant 선택지를 생성해 오래된 Page Reveal·Loader 효과를 제거하고, 브라우저 지원표·소비자 번들·모듈 상태·1.0 진단/deprecation 감사를 추가했습니다.
- 계약 수치를 자동 감시하는 기여 가이드와 재현 가능한 버그·게이트가 포함된 기능 제안·브라우저/실기기 QA issue form, 실제 사용 사례 템플릿과 장기 1.0 readiness CI 검사를 추가했습니다.
- `b6dbc87`의 Node·Firefox·WebKit matrix와 Pages 배포 성공 결과를 브라우저 QA 이력에 기록했습니다.

## [0.8.104] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Give the Firefox/WebKit full demo-polish lane a third bounded attempt and a 20-minute job ceiling, while keeping the Chromium and cross-browser smoke contracts unchanged.
- Serialize the Firefox/WebKit hosted lanes and retain per-engine progress logs so WebKit resource contention or a stalled checkpoint can be diagnosed without weakening the gate.
- Bound the detached data-URL image readiness probe in Cover Reveal QA so a WebKit decode stall cannot consume all three browser retries.
- Emit the last completed demo-polish checkpoint as a CI annotation when a browser retry is terminated, keeping hosted-runner failures actionable without relaxing the gate.
- Synchronize both Cover Reveal mask regressions on their actual clip-path/stagger states instead of fixed delays, preserving the WebKit assertions while tolerating slow first-paint delivery.
- Keep the exhaustive help-field audit in Chromium's integrated lane and use a representative lazy drawer audit in Firefox/WebKit, so hosted engine QA reaches the motion checks within its bounded retry window.
- Make the line-mask regression sample unambiguously multi-line across engine font metrics, so stagger coverage tests the mask rather than an accidental single-line layout.
- Synchronize the Page Reveal zoom probe on the actual root animation and accept an already-exited color panel in slow WebKit mask timing while still requiring the color1 layer contract.
- Reposition Tabs indicators when a previously hidden tab set becomes visible, including WebKit where an ancestor visibility change may not resize the tablist.
- Watch hidden-ancestor mutations as a final Tabs visibility signal so WebKit reliably remeasures indicators when intersection and resize notifications are both skipped.
- Raise only the UMD raw ceiling by 1 KB for the measured hidden-tab recovery watcher; keep the consumer-facing gzip ceiling unchanged.
- Expose `tabs.refresh()` and invoke it after demo panels are revealed, giving externally hidden tab sets a deterministic post-layout indicator measurement path on WebKit.
- Cover delayed WebKit hidden-attribute commits with immediate, two-frame, and bounded follow-up Tabs measurements instead of an open-ended polling loop.
- Refresh the technical roadmap baseline to v0.8.103 and record the shipped View Transitions, provenance, and Node 24 verification evidence.
- Make Pages wait for the triggering CI run to finish and deploy only after that run succeeds, even when GitHub emits the workflow-run event before its conclusion is populated.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- Chromium과 cross-browser smoke 계약은 유지하면서 Firefox/WebKit 전체 demo-polish 단계에 제한된 세 번째 시도와 20분 작업 상한을 적용합니다.
- Firefox/WebKit 호스팅 단계를 엔진별로 직렬화하고 엔진별 진행 로그를 보존해 WebKit 자원 경합이나 정지한 체크포인트를 게이트 완화 없이 진단할 수 있게 합니다.
- Cover Reveal QA의 분리된 data URL 이미지 준비 대기를 제한해 WebKit decode 정지가 세 번의 브라우저 재시도를 모두 소모하지 않게 합니다.
- 브라우저 재시도가 종료될 때 마지막 demo-polish 체크포인트를 CI annotation으로 남겨 게이트를 완화하지 않고도 호스팅 러너 실패 원인을 확인할 수 있게 합니다.
- Cover Reveal mask 회귀 검사를 고정 지연이 아닌 실제 clip-path·stagger 상태에 동기화해 WebKit의 느린 첫 페인트에서도 검증을 약화하지 않고 통과하도록 합니다.
- 전체 help-field 감사는 Chromium 통합 단계에 유지하고 Firefox/WebKit에서는 대표 lazy 드로어를 감사해 호스팅 엔진 QA가 제한된 재시도 안에 모션 검사까지 도달하도록 합니다.
- line-mask 회귀 샘플을 엔진별 글꼴 측정에서도 확실한 여러 줄로 고정해 우연한 한 줄 레이아웃이 아닌 stagger mask를 검증합니다.
- Page Reveal zoom 검사를 실제 루트 애니메이션 생성 시점에 동기화하고, 느린 WebKit의 mask 타이밍에서 이미 빠져나간 색상 패널도 허용하되 color1 레이어 계약은 계속 검증합니다.
- 숨겨져 있던 탭 세트가 표시될 때 Tabs indicator를 다시 배치하며, 조상 visibility 변경이 tablist 크기 변경으로 전달되지 않을 수 있는 WebKit도 포함합니다.
- intersection와 resize 알림을 모두 건너뛸 수 있는 WebKit에서도 숨겨진 조상 변경을 감지해 Tabs indicator를 확실히 다시 측정합니다.
- 숨겨진 탭 복구 watcher의 측정된 비용만 반영해 UMD raw 상한을 1KB 올리고, 소비자가 체감하는 gzip 상한은 그대로 유지합니다.
- `tabs.refresh()`를 공개하고 데모 패널을 표시한 뒤 호출해 외부에서 숨겼던 탭 세트도 WebKit에서 인디케이터를 확실히 다시 측정하도록 합니다.
- WebKit의 지연된 hidden 속성 반영도 무한 polling 없이 즉시·두 프레임·제한된 후속 Tabs 측정으로 처리합니다.
- 기술 로드맵의 기준을 v0.8.103으로 갱신하고 배포된 View Transitions·provenance·Node 24 검증 근거를 기록합니다.
- GitHub가 workflow-run conclusion을 채우기 전에 이벤트를 보내더라도 Pages가 CI 완료까지 기다리고 성공한 경우에만 배포하도록 보강합니다.
## [0.8.103] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Verify the canonical Pages URL after deployment, including runtime version, module count, GTM, and the unversioned CDN route.
- Run the real demo-polish regression suite in the Firefox and WebKit CI lanes so Radial, mobile Mega Menu, drawer layout, and Page Reveal engine regressions cannot hide behind smoke-only coverage.
- Add Page Reveal mechanism smoke assertions for curtain, flash, iris, dissolve, fade, and push so visually-collapsing presets fail at the source-level boundary before a demo review.
- Keep the browser-coverage promise synchronized in release automation and QA reports, including cross-browser demo checks and post-Deploy live-site verification.
- Preserve Firefox/WebKit smoke and demo-polish screenshots as seven-day CI artifacts when a cross-browser lane fails, so engine-specific regressions remain inspectable.
- Add the opt-in Vue `useKinetoTransition()` bridge for `<Transition>` enter/leave hooks, phase-specific options, cancellation cleanup, and bounded completion fallback.
- Add opt-in same-document View Transitions enhancement to `flip` for keyed reorders, with authored-name restoration and automatic FLIP fallback.
- Keep the 130/135 KB consumer budgets and entry allowlist unchanged while absorbing only measured Node 24 runner variance for consumer bundles and distributable ESM gzip output.
- Create the GitHub Release with the runner's built-in `gh` CLI so transient codeload 429/502 failures from an external release action do not block npm publication.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 배포 후 canonical Pages URL에서 런타임 버전·모듈 수·GTM·unversioned CDN 경로를 실제로 확인합니다.
- Firefox·WebKit CI 단계에서 실제 데모 polish 회귀 검사를 실행해 Radial·모바일 Mega Menu·드로어 레이아웃·Page Reveal 엔진 회귀가 smoke 검사 뒤에 숨지 않게 합니다.
- curtain·flash·iris·dissolve·fade·push의 Page Reveal 메커니즘 smoke 검사를 추가해 시각적으로 합쳐지는 preset이 데모 검토 전 소스 경계에서 실패하게 합니다.
- 릴리스 자동화와 QA 보고서의 브라우저 범위 약속을 실제 cross-browser demo 검사와 배포 후 live-site 검증까지 동기화합니다.
- cross-browser 단계가 실패하면 Firefox/WebKit smoke·demo-polish 스크린샷을 7일간 CI 아티팩트로 보존해 엔진별 회귀를 확인할 수 있게 합니다.
- Vue `<Transition>`의 enter/leave 훅을 연결하는 opt-in `useKinetoTransition()`과 phase별 옵션·취소 정리·완료 fallback을 추가합니다.
- `flip`의 keyed same-document 재배치에서 opt-in View Transitions 경로를 사용하고, 기존 이름을 복원하며 미지원 환경에서는 FLIP으로 자동 fallback합니다.
- 소비자 번들과 배포용 ESM gzip에서 측정된 Node 24 러너 차이만 제한적으로 흡수하고 130/135KB 소비자 예산과 엔트리 허용 목록은 유지합니다.
- 외부 release action의 codeload 429/502 오류로 npm 배포가 막히지 않도록 러너 기본 `gh` CLI로 GitHub Release를 생성합니다.
## [0.8.102] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Add opt-in spring settling to Radial and share the Slider physics controls without changing the legacy cubic default.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 기존 cubic 기본 동작은 유지하면서 Radial에도 Slider 물리 제어값을 공유하는 opt-in 스프링 정착을 추가했습니다.
## [0.8.101] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Normalize ambiguous slash-form server dates in Korean locale as KST (+09:00), keeping relative labels stable across UTC hosts.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 한국어 locale의 슬래시형 모호한 서버 날짜도 한국 표준시(+09:00)로 정규화해 UTC 호스트에서 상대 시간 표기가 달라지지 않게 했습니다.
## [0.8.100] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Treat compact `YYYYMMDD[HHmmss]` server timestamps as Korean (+09:00) dates, keeping relative output stable on UTC hosts.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 압축형 `YYYYMMDD[HHmmss]` 서버 시각도 한국 표준시(+09:00) 날짜로 처리해 UTC 호스트에서도 상대 시간 결과가 달라지지 않게 했습니다.
## [0.8.99] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Fixed the date-time regression fixture to pin its Korean server timestamp comparison to `+09:00`, matching the parser contract on UTC runners.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 한국어 서버 날짜 파서 계약과 UTC 러너의 결과가 달라지지 않도록 날짜·시간 회귀 fixture의 비교 시각에 `+09:00`을 고정했습니다.
## [0.8.98] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Emit the exact uncaught assertion from motion-regression QA as a GitHub annotation so runner-only failures remain diagnosable without authenticated logs.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 러너에서만 발생하는 실패도 인증된 로그 없이 진단할 수 있도록 motion-regression QA의 처리되지 않은 assertion을 정확한 GitHub annotation으로 남깁니다.
## [0.8.97] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Keep runtime-regression checks running after an individual failure and emit the exact failed command as a GitHub annotation before failing the group.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 런타임 회귀 그룹에서 개별 검사가 실패해도 나머지 검사를 계속 실행하고, 그룹 실패 전에 정확한 명령을 GitHub annotation으로 남깁니다.
## [0.8.96] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Split the Node verification chain into five retryable groups so CI failures identify the contracts/package, consumer/framework, demo-surface, runtime-regression, or site/release boundary.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- CI 실패가 계약·패키지, 소비자·프레임워크, 데모 표면, 런타임 회귀, 사이트·릴리스 중 어느 경계인지 드러나도록 Node 검증 체인을 5개 재시도 가능 그룹으로 나눴습니다.
## [0.8.95] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Split CI and release verification into retryable lint, build, Node, demo, browser, packaging, and audit stages so runner-only failures identify their exact boundary.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 러너에서만 발생하는 실패의 정확한 경계를 확인할 수 있도록 CI·릴리스 검증을 lint, build, Node, 데모, 브라우저, 패키징, audit 단계로 나누고 각 단계를 재시도·로그 보존합니다.
## [0.8.94] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Preserve full CI and release verification logs as failure artifacts so runner-only failures can be diagnosed without rerunning blindly.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 러너에서만 발생하는 실패를 무작정 재실행하지 않고 진단할 수 있도록 전체 CI·릴리스 검증 로그를 실패 artifact로 보존합니다.
## [0.8.93] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Increased the bounded full CI/release verification retry policy to three attempts for transient browser and generated-bundle runner failures.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 일시적인 브라우저·생성 번들 러너 실패를 흡수하도록 전체 CI/릴리스 검증 재시도 정책을 3회로 조정했습니다.
## [0.8.92] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Preserved the 130 KB consumer bundle budget while allowing a measured 1 KB Node 24/Linux gzip variance at the generated-byte boundary.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 130KB consumer bundle 예산은 유지하고 생성 바이트 경계에서 발생하는 Node 24/Linux gzip 변동만 1KB까지 허용하도록 조정했습니다.
## [0.8.91] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Widened only the measured npm packed-size headroom for Node 24/npm 11 so the release workflow accepts the same 76-file allowlist across runners.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 동일한 76개 파일 allowlist를 러너별로 유지할 수 있도록 Node 24/npm 11에서 측정된 npm packed-size 여유만 조정했습니다.
## [0.8.90] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Expanded the date-time demo into past, future, combined, and absolute-handoff examples so every relative-time mode is visible and configurable.
- Normalized compact, Korean clock-text, and locale-aware day/month server timestamps before relative or absolute formatting.
- Fixed reduced-motion `secondsOnly` counters to keep the `000S` elapsed/countdown contract, and locked Clock/Elapsed seconds/Countdown demos to equal three-column desktop rows.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 날짜·시간 데모를 과거·미래·상대+절대·절대 날짜 전환 예제로 확장해 상대 시간 모드와 설정을 모두 확인할 수 있게 했습니다.
- 압축형 날짜, 한국어 시각 문장, locale 기준 일/월 표기의 서버 날짜를 정규화한 뒤 상대·절대 형식으로 처리합니다.
- reduced-motion에서도 `000S` elapsed/countdown 계약을 유지하도록 `secondsOnly`를 보완하고 Clock/Elapsed seconds/Countdown 데모를 데스크톱 3열 동일 폭으로 고정했습니다.
## [0.8.89] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Added opt-in nested Presence propagation for React and Vue: parent exit now waits for registered keyed children and preserves child-before-parent `safeToRemove` ordering.
- Kept Vue keyed groups stable when a propagated parent exit settles, while allowing the same keys to re-enter cleanly.
- Kept the npm release allowlist unchanged and absorbed only the measured nested-propagation package-size increase.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- React·Vue에서 선택형 중첩 Presence 전파를 지원합니다. 부모 exit가 등록된 keyed child를 기다리고 자식 `safeToRemove`가 부모보다 먼저 호출됩니다.
- 부모 전파 exit가 끝난 뒤에도 Vue keyed group이 안정적으로 유지되며 같은 key가 다시 enter할 수 있습니다.
- npm 릴리스 허용 목록은 그대로 유지하고 중첩 전파로 측정된 패키지 용량 증가만 반영했습니다.
## [0.8.88] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.87] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Added opt-in React/Vue `KinetoPresenceGroup` wrappers that track direct keyed children and retain exiting nodes until Presence settles, including `sync`/`wait`/`popLayout` forwarding.
- Kept the npm release allowlist unchanged while accounting for the measured keyed-child adapter source cost and cross-runner package variance.
- Kept the Vue adapter's 135 KB product budget strict while documenting a bounded 1 KB verification variance for the Linux runner's gzip output.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- React·Vue에 direct keyed child를 추적하고 Presence가 완료될 때까지 나가는 노드를 유지하는 `KinetoPresenceGroup`을 추가했습니다. `sync`/`wait`/`popLayout` 전달도 지원합니다.
- npm 릴리스 허용 목록은 그대로 유지하고 keyed child adapter 소스 용량과 러너별 패키지 편차만 측정값에 반영했습니다.
- Vue adapter의 135KB 제품 예산은 유지하고 Linux 러너 gzip 출력의 제한된 1KB 검증 편차만 문서화했습니다.
## [0.8.86] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Adjusted the packed-size budget for the measured Node 24/npm 11 GitHub runner variance without changing the release file allowlist.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- Node 24/npm 11 GitHub runner의 패키지 압축 크기 차이를 반영해 허용 한계를 조정했습니다. 릴리스 파일 허용 목록은 변경하지 않았습니다.
## [0.8.85] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Added host-owned React and Vue Presence composables/components with stable lifecycle refs, SSR-safe setup, and explicit enter/leave results; keyed-child auto-removal remains gated.
- Kept the npm release allowlist unchanged while accounting for the measured source cost of the new Presence adapters.
- Corrected the Presence Core RFC status so the completed Vanilla prototype is distinguished from the still-gated React/Vue adapters.
- Synced the roadmap baseline to v0.8.85 and recorded that `kineto.dongri.me` is canonical while the separate GitHub Pages copy is a manual backup.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 안정적인 lifecycle ref, SSR 안전한 초기화, 명시적인 enter/leave 결과를 제공하는 React·Vue Presence composable/component를 추가했습니다. keyed child 자동 제거는 아직 출시 게이트로 남겨 두었습니다.
- npm 릴리스 허용 목록은 그대로 유지하고 새 Presence adapter 소스의 측정된 패키지 용량만 반영했습니다.
- Presence Core RFC의 상태를 완료된 Vanilla prototype과 아직 출시를 보류한 React/Vue adapter가 구분되도록 바로잡았습니다.
- 로드맵 기준 버전을 v0.8.85로 맞추고 `kineto.dongri.me`를 공식 주소로, 별도 GitHub Pages 사본을 수동 백업으로 명시했습니다.
## [0.8.84] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Included the opt-in Slider spring settling feature from the failed v0.8.83 candidate in the next publishable patch.
- Increased the full consumer-bundle runner variance to a bounded 0.75 KB so Node 24/Linux gzip output at the rounding edge does not reject the 130 KB product budget.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 실패한 v0.8.83 후보에 들어갔던 Slider 선택형 스프링 정착 기능을 다음에 배포할 패치에 포함합니다.
- 130KB 제품 예산은 유지하면서 Node 24/Linux gzip 출력이 반올림 경계에서 거부되지 않도록 전체 소비자 번들의 러너 편차 한도를 0.75KB로 제한적으로 조정했습니다.
## [0.8.83] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Added opt-in Slider spring settling with public `stiffness`, `damping`, and `mass` controls; the existing interpolation remains the default and Radial hides the track-only controls.
- Kept the release package allowlist unchanged while accounting for the spring controls' measured unpacked archive cost.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- Slider에 선택형 스프링 정착과 공개 `stiffness`, `damping`, `mass` 조절을 추가했습니다. 기존 보간이 기본값으로 유지되며 Radial에서는 트랙 전용 컨트롤을 숨깁니다.
- 스프링 컨트롤로 늘어난 측정된 압축 해제 아카이브 용량만 반영했으며 릴리스 패키지 허용 목록은 그대로 유지했습니다.
## [0.8.82] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Extended the browser QA attempt timeout to 180 seconds so slower shared runners can finish the full demo and animated-media checks before a retry.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 느린 공유 러너에서도 전체 데모·애니메이션 미디어 검사를 재시도 전에 완료할 수 있도록 브라우저 QA 시도 제한을 180초로 늘렸습니다.
## [0.8.81] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Increased the release archive size guard by a measured 1 KB cross-runner margin; the npm allowlist and unpacked/file-count limits are unchanged.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- GitHub Actions와 로컬 npm 압축 차이를 반영해 릴리스 아카이브 크기 검사에 측정된 1KB 여유만 추가했습니다. npm 허용 목록과 압축 해제·파일 수 제한은 그대로입니다.
## [0.8.80] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Added the opt-in Slider `velocityInfluence` control for tuning release momentum; the default remains `0.35` and Radial hides the irrelevant field.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- Slider 해제 관성을 조절하는 선택형 `velocityInfluence` 컨트롤을 추가했습니다. 기본값은 `0.35`로 유지되며 Radial에서는 무관한 필드를 숨깁니다.
## [0.8.79] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Made Slider settling elapsed-time based with a capped frame delta, keeping release motion consistent across 60/90/120Hz displays and long background-tab gaps.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- Slider 정착을 경과 시간 기반으로 바꾸고 프레임 간격 상한을 적용해 60/90/120Hz 화면과 긴 백그라운드 탭 복귀에서도 해제 모션이 일관되도록 했습니다.
## [0.8.78] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Improved Slider drag release inertia by weighting up to five recent pointer samples by recency.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 최근 최대 5개 포인터 샘플을 순서로 가중해 Slider 드래그 해제 관성을 더 안정적으로 계산합니다.
## [0.8.77] - 2026-08-17

### English

- Added opt-in visibility lifecycle control for Slider and Radial: offscreen instances now stop transition rAF, autoplay, and progress work by default, with `pauseWhenOffscreen:false` for continuous playback.

### 한국어

- Slider·Radial이 화면 밖에 있을 때 전환 rAF·자동 재생·진행 UI 작업을 기본으로 멈추도록 했고, 계속 재생하려면 `pauseWhenOffscreen:false`로 선택할 수 있게 했습니다.
## [0.8.76] - 2026-08-16

### English

- Kept the 130 KB consumer budget strict while documenting a bounded 0.5 KB gzip variance for cross-platform runner output.

<!-- Add matching English release bullets here. -->

### 한국어

- 130KB 소비자 예산은 유지하고, 플랫폼별 러너 출력 차이만 허용하는 제한된 0.5KB gzip 편차를 문서화했습니다.

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.75] - 2026-08-16

### English

- Reduced the Radial smoothing branch so Linux consumer-bundle gzip stays below the 130 KB release budget without changing its behavior.

<!-- Add matching English release bullets here. -->

### 한국어

- Radial smoothing 동작은 유지하면서 Linux 소비자 번들도 130KB 릴리스 예산 아래에 남도록 해당 경로의 번들 크기를 줄였습니다.

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.74] - 2026-08-16

### English

- CI now retries the complete verification command once after transient runner or browser failures, while keeping the pass requirement strict.

<!-- Add matching English release bullets here. -->

### 한국어

- 일시적인 러너·브라우저 실패로 전체 검증이 중단되지 않도록 검증 명령을 한 번 재시도하되, 두 번째 실행도 반드시 통과해야 하도록 CI를 보강했습니다.

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.73] - 2026-08-16

### English

<!-- Add matching English release bullets here. -->
- Added opt-in Radial `smoothing` so orbit transitions can share the track slider's frame-based settling while preserving the existing duration default.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 기존 duration 기본 동작은 유지하면서 Radial에도 트랙 슬라이더와 같은 프레임 기반 정착감을 선택적으로 적용하는 `smoothing` 옵션을 추가했습니다.
## [0.8.72] - 2026-08-16

### English

<!-- Add matching English release bullets here. -->
- Restored direct GitHub Pages deployment from the verified `site/` artifact so the canonical demo receives updates after CI without a cross-repository token; added regression checks for the CI, npm, license, and jsDelivr badges.
- Synchronized the demo's visible module count and all locale copy with the 52-module feature contract, with a regression check preventing stale 51-module text.
- Hardened Radial Carousel touch handling and native drag prevention, restoring authored `draggable` and `touch-action` values on destroy.
- Reduced Radial Carousel's drag-protection bookkeeping so the full consumer bundle remains within the Node 24 gzip budget.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 검증된 `site/` artifact를 canonical 데모의 GitHub Pages에 직접 배포하도록 복구해 cross-repository token 없이 CI 후 최신 내용이 반영되게 하고, CI·npm·license·jsDelivr 배지 회귀 검사를 추가했습니다.
- 데모에 표시되는 모듈 수와 모든 locale copy를 52개 feature contract와 동기화하고, 오래된 51개 문구가 재발하지 않도록 회귀 검사를 추가했습니다.
- Radial Carousel의 터치 처리와 native drag preview 차단을 보강하고, destroy 시 작성자가 지정한 `draggable`·`touch-action` 값을 복원하게 했습니다.
- Radial Carousel의 드래그 보호 bookkeeping을 줄여 전체 소비자 번들이 Node 24 gzip 예산 안에 유지되도록 했습니다.
## [0.8.71] - 2026-08-16

### English

<!-- Add matching English release bullets here. -->
- Restored direct GitHub Pages deployment from the verified `site/` artifact so the canonical demo receives updates after CI without a cross-repository token; added regression checks for the CI, npm, license, and jsDelivr badges.
- Synchronized the demo's visible module count and all locale copy with the 52-module feature contract, with a regression check preventing stale 51-module text.
- Hardened Radial Carousel touch handling and native drag prevention, restoring authored `draggable` and `touch-action` values on destroy.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 검증된 `site/` artifact를 canonical 데모의 GitHub Pages에 직접 배포하도록 복구해 cross-repository token 없이 CI 후 최신 내용이 반영되게 하고, CI·npm·license·jsDelivr 배지 회귀 검사를 추가했습니다.
- 데모에 표시되는 모듈 수와 모든 locale copy를 52개 feature contract와 동기화하고, 오래된 51개 문구가 재발하지 않도록 회귀 검사를 추가했습니다.
- Radial Carousel의 터치 처리와 native drag preview 차단을 보강하고, destroy 시 작성자가 지정한 `draggable`·`touch-action` 값을 복원하게 했습니다.
## [0.8.70] - 2026-08-16

### English

<!-- Add matching English release bullets here. -->
- Added a Presence framework-adapter contract and React/Vue consumer fixtures that verify host-owned exit timing, cleanup, and SSR behavior before publishing keyed adapter components.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- keyed adapter component를 공개하기 전에 host가 DOM을 소유한 exit timing·cleanup·SSR 경계를 검증하는 Presence framework adapter 계약과 React/Vue 소비자 fixture를 추가했습니다.
## [0.8.69] - 2026-08-16

### English

<!-- Add matching English release bullets here. -->
- Added a Presence Core RFC that fixes cancellation, re-entry, safe-to-remove, focus/ARIA/inert, SSR, and reduced-motion gates before implementation.
- Added an opt-in `@dong-gri/kineto/presence` prototype with cancellable enter/exit, wait-mode re-entry, safe-to-remove callbacks, managed accessibility restoration, and SSR/reduced-motion fallbacks.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 구현 전에 취소·재진입·safe-to-remove·focus/ARIA/inert·SSR·reduced motion 출시 게이트를 고정하는 Presence Core RFC를 추가했습니다.
- 취소 가능한 enter/exit, wait 모드 재진입, safe-to-remove callback, 접근성 상태 복원, SSR/reduced motion fallback을 지원하는 선택형 `@dong-gri/kineto/presence` prototype을 추가했습니다.
## [0.8.68] - 2026-08-16

### English

- Aligned the packed release budget with the measured Node 24/npm 11 runner while keeping the npm allowlist unchanged.

### 한국어

- npm allowlist는 유지하면서 Node 24/npm 11 실행기에서 측정되는 패키지 압축 크기를 반영하도록 릴리스 예산을 조정했습니다.
## [0.8.67] - 2026-08-16

### English

- Added a standalone `@dong-gri/kineto/states` modular entry so Core consumers can opt into Motion States without the full module registry.
- Added Core + States consumer gzip coverage and React/Vue lifecycle plus full/standalone SSR checks for state controllers.

### 한국어

- 전체 모듈 레지스트리 없이 Core와 Motion States만 선택할 수 있도록 독립 `@dong-gri/kineto/states` 모듈 엔트리를 추가했습니다.
- Core + States 소비자 gzip 예산과 React/Vue lifecycle, full/standalone States SSR 검증을 추가했습니다.
## [0.8.66] - 2026-08-16

### English

<!-- Add matching English release bullets here. -->

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.65] - 2026-08-16

### English

- Added the first Motion States API with restricted visual states, cancellable apply/replay, HTML state scanning, destroy restoration, and reduced-motion final-state handling.
- Stabilized playground option help tooltips by removing animation sampling races and keeping the explanation visible while the settings drawer transfers focus.

### 한국어

- 제한된 시각 상태 집합, 취소 가능한 apply/replay, HTML 상태 스캔, destroy 복원, reduced motion 최종 상태 적용을 지원하는 Motion States 초기 API를 추가했습니다.
- 플레이그라운드 옵션 도움말에서 애니메이션 초기 프레임과 설정창 포커스 이동으로 툴팁이 사라지는 경합을 없애고 설명이 안정적으로 표시되도록 했습니다.
## [0.8.64] - 2026-08-15

### English

- Added a Motion States RFC with two real usage examples, lifecycle/cancellation semantics, bundle limits, accessibility boundaries, and explicit release gates before any public API is implemented.
- Extended the first-screen snap's opposite-direction momentum guard to cover the full landing animation on slower runners, while preserving same-direction momentum.

### 한국어

- 실제 사용 예제 2개, lifecycle·취소 의미, 번들 한도, 접근성 경계, 공개 API 구현 전 출시 게이트를 정의한 Motion States RFC를 추가했습니다.
- 느린 러너에서도 첫 화면 스냅의 반대 방향 관성 꼬리를 전체 착지 애니메이션 동안 차단하되 같은 방향 관성은 유지하도록 보호 시간을 확장했습니다.
## [0.8.63] - 2026-08-15

### English

- Kept playground help tooltips visible through focus changes and drawer reflow, removing a timing-sensitive failure in remote browser QA.

### 한국어

- 포커스 이동과 설정창 재배치 중에도 플레이그라운드 도움말 툴팁을 유지해 원격 브라우저 QA에서 발생하던 타이밍 의존 실패를 제거했습니다.
## [0.8.62] - 2026-08-15

### English

- Added framework-specific playground copy tabs for Vanilla HTML, Vanilla JS, React, Vue, and CSS variables, including current option values and an explicit Vanilla fallback for page-level modules.
- Made playground help tooltips use an explicit manual trigger so click/focus help remains visible while the settings drawer reflows in slower browsers and CI.

### 한국어

- 플레이그라운드 코드 복사 탭을 Vanilla HTML, Vanilla JS, React, Vue, CSS 변수로 확장하고 현재 옵션 값을 반영합니다. 페이지 단위 모듈은 어댑터가 없는 이유와 Vanilla fallback을 명시합니다.
- 설정창이 느린 브라우저나 CI에서 재배치될 때도 클릭·포커스 도움말이 유지되도록 플레이그라운드 도움말 툴팁을 명시적 수동 트리거로 변경했습니다.
## [0.8.61] - 2026-08-15

### English

- Radial now consumes the click generated after a drag instead of relying on a short timing window, keeping drag navigation stable on slower browsers and CI runners.

### 한국어

- Radial이 드래그 직후 발생하는 클릭을 짧은 시간 제한이 아니라 다음 이벤트 자체로 소비하도록 바꿔 느린 브라우저와 CI에서도 드래그 이동이 안정적으로 유지됩니다.
## [0.8.60] - 2026-08-15

### English

- Made Korean server-rendered Date Time values timezone-stable by parsing them as KST instead of the host environment's local timezone.
- Kept Brush Reveal's dynamically inserted images out of native drag previews, so late image hydration cannot reintroduce a translucent ghost.

### 한국어

- 한국어 서버 날짜를 호스트 환경의 로컬 시간대가 아니라 KST로 파싱해 Date Time 상대 표기가 CI와 SSR 환경에서도 동일하게 나오도록 수정했습니다.
- Brush Reveal에 나중에 삽입되는 이미지도 기본 드래그 고스트가 생기지 않도록 처리해 지연 이미지 하이드레이션 뒤에도 반투명 미리보기가 나타나지 않습니다.
## [0.8.59] - 2026-08-09

### English

- Added copyable, compact demo-setting URLs that restore safe changed controls for the selected example.
<!-- Add matching English release bullets here. -->

### 한국어

- 선택한 예시의 변경된 안전한 설정만 복원하는 짧은 데모 설정 URL 복사를 추가했습니다.
<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.58] - 2026-08-09

### English

- Retried locked nested QA installs after transient npm registry timeouts, while retaining strict lockfile installs and bounded retry delays.
<!-- Add matching English release bullets here. -->

### 한국어

- 잠깐의 npm 레지스트리 타임아웃은 제한된 재시도로 다시 시도하되, lockfile을 엄격히 따르는 설치 방식은 유지합니다.
<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.57] - 2026-08-09

### English

- Aligned CI with the Node 24/npm 11 release runtime, so the same full verification runs before a tag is created.
- Recalibrated Kineto's own bundle budgets after the 52-module release while retaining explicit GSAP/Lenis source and CDN-boundary checks.
<!-- Add matching English release bullets here. -->

### 한국어

- CI를 Node 24/npm 11 릴리스 런타임과 맞춰 태그를 만들기 전에 동일한 전체 검증을 실행합니다.
- 52개 모듈 릴리스 기준으로 Kineto 자체 번들 예산을 다시 측정했습니다. GSAP/Lenis의 소스·CDN 경계 검사는 그대로 유지합니다.
<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.56] - 2026-08-09

### English

- Prevented native image drag previews from appearing while painting a Brush Reveal stroke.
- Expanded Date Time relative formatting with selectable units, long/short/narrow style, rounding, and an automatic absolute-date cutoff.
- **Breaking:** removed preset names that were duplicates of another preset and replaced each with a distinct mechanism, keeping every module's preset count unchanged. Page Reveal dropped `circle`, `wipe`, `columns`, `strips` and `checker` for `curve`, `dissolve`, `push`, `grid` and `fold`; Text Transition's `slide` (literally the same object as `slide-up`) became `flip`; Glitch's `digital` (an alias that redirected to `noise`) became `wave`; Card Glow's `pointer` (identical to `spotlight`) became `edge`; Reveal's `zoom` and `flip` (indistinguishable from `zoom-in` and `flip-x`) became `swing` and `skew`.
- Rebuilt Page Reveal's timing on expo-out curves with a per-preset pace multiplier, so presets no longer start with a visible hesitation and all sixteen settle at a comparable perceived speed.
- Fixed Page Reveal `push` throwing the page to the bottom of the document: a percentage translate on the document root resolves against the whole document, not the viewport.
- Rewrote Page Reveal `flash` as an anamorphic light streak that clips the cover open, replacing a whiteout that ramped opacity and therefore read as `fade`.
- Fixed Reveal's no-GSAP fallback silently discarding rotation, shear, 3D and transform-origin, which left `rotate`, `flip-x` and `flip-y` rendering as a plain slide-and-fade.
- Fixed the Slider coverflow active shadow being clipped: the wrap now uses `overflow: clip` with a clip margin instead of two conflicting overflow decisions in the same module.
- Loader, Page Reveal and Page Transition settings now update the copied HTML as well as the JavaScript; their HTML tab used to be a fixed snippet that ignored every control.
- Added a development warning when two modules that both write the host element's `transform` are mounted on the same element, since one silently overwrites the other. `docs/rfc/module-composition.md` records the measurements and the proposed fix.
<!-- Add matching English release bullets here. -->

### 한국어

- **호환성 변경:** 다른 프리셋과 사실상 같았던 프리셋 이름을 제거하고 각각 다른 메커니즘으로 교체했습니다. 모듈별 프리셋 개수는 그대로입니다. Page Reveal은 `circle`·`wipe`·`columns`·`strips`·`checker`를 빼고 `curve`·`dissolve`·`push`·`grid`·`fold`를 넣었고, Text Transition의 `slide`(`slide-up`과 같은 객체였습니다)는 `flip`으로, Glitch의 `digital`(`noise`로 리다이렉트되던 별칭)은 `wave`로, Card Glow의 `pointer`(`spotlight`와 동일)는 `edge`로, Reveal의 `zoom`·`flip`(`zoom-in`·`flip-x`와 구분 불가)은 `swing`·`skew`로 바뀌었습니다.
- Page Reveal의 타이밍을 expo-out 곡선과 프리셋별 배속 계수로 다시 잡았습니다. 시작 직후 멈칫하던 느낌이 사라지고 16개 프리셋의 체감 속도가 맞춰집니다.
- Page Reveal `push`가 페이지를 문서 맨 아래로 밀어버리던 문제를 고쳤습니다. 문서 루트에 건 퍼센트 translate는 뷰포트가 아니라 문서 전체를 기준으로 계산됩니다.
- Page Reveal `flash`를 커버를 잘라 여는 애너모픽 광선으로 다시 만들었습니다. 이전 화이트아웃은 opacity를 램프해서 구조적으로 `fade`와 같았습니다.
- Reveal의 GSAP 미사용 폴백이 회전·전단·3D·transform-origin을 조용히 버리던 문제를 고쳤습니다. 그래서 `rotate`·`flip-x`·`flip-y`가 단순 슬라이드 페이드로만 보였습니다.
- Slider 코버플로우 액티브 섀도가 잘리던 문제를 고쳤습니다. 같은 모듈 안에서 충돌하던 두 개의 overflow 설정을 `overflow: clip` + clip margin으로 통일했습니다.
- Loader·Page Reveal·Page Transition 설정이 JavaScript뿐 아니라 복사용 HTML에도 반영됩니다. 기존에는 HTML 탭이 어떤 설정에도 반응하지 않는 고정 스니펫이었습니다.
- 호스트 요소의 `transform`을 함께 쓰는 두 모듈이 같은 요소에 올라가면 개발 중 경고를 띄웁니다. 한쪽이 다른 쪽을 조용히 덮어쓰기 때문입니다. 측정 결과와 해결안은 `docs/rfc/module-composition.md`에 정리했습니다.
- Brush Reveal을 문지를 때 브라우저 기본 이미지 드래그 고스트가 나타나지 않도록 수정했습니다.
- Date Time 상대 표기에 단위 선택, long/short/narrow 스타일, 반올림 방식, 일정 기간 이후 절대 날짜 자동 전환을 추가했습니다.
<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.55] - 2026-08-09

### English

- Clarified and exposed seconds-only Clock settings so `000S` supports both elapsed time from `since` and a remaining-seconds countdown to `until`.
- Fixed the Elapsed seconds Counter specialization: it now keeps the Clock renderer when a stale or conflicting mode is supplied, and its demo no longer exposes incompatible modes.
<!-- Add matching English release bullets here. -->

### 한국어

- `000S` 초 단위 표기는 `since` 기준 경과 시간과 `until` 기준 남은 시간 카운트다운을 모두 지원하도록 문구와 설정을 보완했습니다.
- Elapsed seconds Counter는 이전 설정에 충돌하는 모드가 남아 있어도 Clock 렌더러를 유지하도록 수정했고, 데모에서는 호환되지 않는 모드 선택을 숨겼습니다.
<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.54] - 2026-08-08

### English

- Replaced private registry URLs captured in the framework QA lockfile with public npm URLs, so hosted runners can install its fixture dependencies.
<!-- Add matching English release bullets here. -->

### 한국어

- framework QA lockfile에 기록된 사설 레지스트리 URL을 공개 npm URL로 교체해 호스팅 러너도 fixture 의존성을 설치할 수 있게 했습니다.
<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.53] - 2026-08-08

### English

- Added an explicit Counter demo card for elapsed `000S` seconds, including its server-origin timestamp attributes.
- Restored a smooth hero scene transition for the deliberate one-gesture snap while retaining its momentum guard.
- Added the Date Time module for relative, absolute, and combined timestamps, with common server-date parsing and lifecycle cleanup.
- Made Page Reveal Flash a white double-exposure pulse with a tinted afterimage; Fade remains a continuous colour-cover dissolve.
- Normalized all Counter demo rows to equal three-column cards, vertically centered settings summary controls, and made the Date Time demo show a live past timestamp with its full settings panel.
<!-- Add matching English release bullets here. -->

### 한국어

- Counter에 서버 기준 시점과 함께 `000S` 경과 초 표시를 바로 확인할 수 있는 전용 데모 카드를 추가했습니다.
- 한 번의 입력으로 이동하는 첫 화면 장면 전환은 유지하되, 관성 차단을 유지한 채 부드러운 전환으로 복원했습니다.
- 일반적인 서버 날짜 형식을 인식하고 상대 시간·절대 시간·동시 표기를 제공하며 lifecycle 정리를 지원하는 Date Time 모듈을 추가했습니다.
- Page Reveal Flash를 흰색 이중 노출 펄스와 색상 잔상으로 분리하고, Fade는 연속적인 색상 커버 페이드로 유지했습니다.
- Counter 데모의 모든 행을 동일한 3열 카드로 정렬하고 설정 요약 컨트롤을 수직 중앙에 맞췄으며, Date Time 데모는 실제 과거 시각과 전체 설정 패널을 표시하도록 수정했습니다.
<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.52] - 2026-08-08

### English

- Made the release-package budget robust to the measured Node 24/npm 11 archive compression variance without widening the package allowlist.
<!-- Add matching English release bullets here. -->

### 한국어

- 패키지 허용 목록은 유지한 채 Node 24/npm 11에서 확인된 아카이브 압축 편차를 반영하도록 릴리스 패키지 예산을 조정했습니다.
<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.51] - 2026-08-08

### English

- Added the GTM-KFQSFGJL loader and no-script fallback to the demo source so every generated deployment includes the same Google Tag Manager container.
- Added a staged product and engineering roadmap covering consumer bundle budgets, adapter reliability, Motion States, Presence, shared layout, 1.0 gates, ecosystem growth, and explicit non-goals.
- Tightened inline terminal indicators, made Page Reveal Flash a distinct exposure pulse, restored touch opening for responsive Mega Menus, and improved edge fades, Reveal distance controls, and Slider drag handling.
- Added seconds-only Counter clocks, reliable blinking separators, consumer bundle budgets, React/Vue lifecycle and SSR fixtures, and supply-chain reporting guidance.
- Removed the default terminal frame-width reservation and vertically centered inline terminal glyphs; a fixed viewport is now reserved only when `viewportWidth` is explicitly set.
- Applied the Slider drag protections to Radial Carousel: images no longer create native ghost drags, swipes keep pointer ownership after the movement threshold, and the following click is ignored.
- Fixed responsive Dropdown as well as Mega Menu panels: touch toggles now share the mobile path and every non-custom responsive panel is viewport-bounded.
- Kept the demo hero's one-gesture bidirectional scene snap while suppressing gesture momentum after a landing and limiting reverse entry to the actual section boundary.
<!-- Add matching English release bullets here. -->

### 한국어

- 데모 원본에 GTM-KFQSFGJL 로더와 noscript fallback을 추가해 생성되는 모든 배포 사이트에 같은 Google Tag Manager 컨테이너가 포함되도록 했습니다.
- 소비자 번들 예산, 어댑터 안정성, Motion States, Presence, shared layout, 1.0 진입 조건, 생태계 확장 및 명시적 비목표를 단기·중기·장기로 정리한 제품·기술 로드맵을 추가했습니다.
- 인라인 터미널 표시기의 여백을 줄이고, Page Reveal Flash를 별도 노출 펄스로 구분했으며, 반응형 Mega Menu의 터치 열기와 가장자리 페이드, Reveal 거리 조절, Slider 드래그를 개선했습니다.
- 초 단위 Counter 시계와 안정적인 구분자 깜빡임, 소비자 번들 예산, React/Vue lifecycle·SSR fixture, 공급망 대응 문서를 추가했습니다.
- 터미널 프레임의 기본 폭 예약을 제거하고 인라인 특수문자를 수직 중앙에 맞췄습니다. 고정 폭은 이제 `viewportWidth`를 명시한 경우에만 예약됩니다.
- Radial Carousel에도 Slider의 드래그 보호를 적용했습니다. 이미지 고스트 드래그를 막고, 이동 임계값 뒤 스와이프의 포인터 소유권을 유지하며, 뒤따르는 클릭은 무시합니다.
- Mega Menu뿐 아니라 일반 Dropdown도 수정했습니다. 터치 토글은 같은 모바일 경로를 사용하며, `custom` 이외의 반응형 패널은 모두 뷰포트 안에 고정됩니다.
- 데모 첫 화면의 한 번 스크롤 양방향 장면 이동은 유지하되, 도착 뒤 관성을 차단하고 실제 섹션 경계에서만 역방향 진입하도록 해 튕김을 없앴습니다.
<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.50] - 2026-08-02

### English

- Preserved each Fullpage section's internal scroll position when paging away and returning, while keeping first entry anchored at the top.
<!-- Add matching English release bullets here. -->

### 한국어

- Fullpage 섹션에 처음 진입할 때는 내부 스크롤 맨 위에서 시작하되, 다른 장에 다녀오면 각 섹션의 마지막 내부 스크롤 위치를 유지하도록 수정했습니다.
<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.49] - 2026-08-02

### English

- Added first-party TypeScript declarations for the full, modular, React, Vue, and jQuery package surfaces, enforced them in CI and installed-tarball checks, and removed the package's unnecessary dependency on itself.
- Protected default CDN engine downloads with SHA-384 subresource integrity, allowed custom engine sources to provide matching integrity metadata, and stopped Scroll Sequence from making an implicit request to an example.com placeholder when no frame source is configured.
- Corrected Loading Indicator Spokes so `normal` runs left-to-right and `reverse` runs right-to-left, with browser coverage for both phase orders.
- Aligned the bundle-size ceilings with the measured cost of pinned CDN integrity metadata while retaining tight guards against dependency bloat.
<!-- Add matching English release bullets here. -->

### 한국어

- 전체 패키지와 모듈형 import, React, Vue, jQuery 어댑터에 공식 TypeScript 선언을 추가하고 CI 및 설치 tarball 검사에 포함했으며, 패키지가 자기 자신을 의존하던 불필요한 항목을 제거했습니다.
- 기본 CDN 엔진 다운로드에 SHA-384 하위 리소스 무결성 검증을 적용하고 사용자 지정 엔진에 대응하는 integrity 설정을 추가했으며, 프레임 소스가 없는 Scroll Sequence가 example.com placeholder를 암묵적으로 요청하지 않도록 수정했습니다.
- Loading Indicator Spokes의 `normal`이 왼쪽에서 오른쪽으로, `reverse`가 오른쪽에서 왼쪽으로 진행하도록 방향을 바로잡고 두 위상 순서를 브라우저 테스트로 고정했습니다.
- 고정 CDN 무결성 메타데이터의 실제 측정 크기에 맞춰 번들 용량 상한을 조정하되, 의존성 비대화를 막는 엄격한 기준은 유지했습니다.
<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.47] - 2026-08-02

### English

- Made FLIP `crossfade` simultaneously fade an old-position visual clone out and the live new-position item in, and fixed Reset for nested Cover Reveal + Flip demos without detaching the reveal targets.
- Kept settings sections in their assigned masonry columns when ordinary option changes only alter fields inside an existing section.
- Made Cover Reveal `auto` extract a distinct, deterministic two-color palette per actual image element instead of relying on a gallery-level fallback; the Staggered Gallery now declares `auto` directly in its source markup.
- Normalized cursor following and Page Reveal Zoom across Safari frame rates, fixed Safari Lightbox Grid and Slider dot layout, and tuned the demo's Safari scroll/hover timing.
- Added diverse two-color image sampling to Cover Reveal, switched its image demos from a fixed palette to per-image `auto`, and made `mask:true` replace the final colored panel with an outer mask around each complete cover unit.
- Fixed Coverflow boundary/shadow sizing and Safari pagination artifacts, sealed Dissolve's rounded edges against inactive-slide color leakage, and added a complete-wheel Radial Slider layout with `position: 'center'` whose demo keeps its circles opaque, separated, and inside the stage.
- Made Cover Reveal Mask opt-in in the staggered gallery and matched the replaced final panel's per-line timing. The Radial demo now opens at Bottom, uses separate center/docked geometry, and animates every item from one shared angular position; Coverflow reserves a clipped lower gutter for its active shadow.
- Made FLIP `fade` visibly sequential at the old and new slots with a short transparent handoff, and combined Page Reveal Zoom's scale with an opacity 0→1 entrance.
<!-- Add matching English release bullets here. -->

### 한국어

- FLIP `crossfade`가 이전 위치의 시각 복제본을 Fade-out하는 동시에 새 위치의 실제 요소를 Fade-in하도록 구분하고, 중첩된 Cover Reveal + Flip 데모를 초기화해도 Reveal 대상이 분리되지 않도록 수정했습니다.
- 일반 옵션 변경으로 기존 설정 섹션 안의 필드만 달라질 때 섹션 자체가 다른 masonry 열로 이동하지 않도록 위치를 고정했습니다.
- Cover Reveal `auto`가 갤러리 공통 fallback에 의존하지 않고 실제 이미지 요소마다 대표색 두 개를 결정론적으로 별도 추출하도록 수정했으며, Staggered Gallery 원본 마크업도 직접 `auto`를 선언하도록 변경했습니다.
- Safari 프레임 속도에서도 커서 추종과 Page Reveal Zoom이 일관되도록 보정하고, Safari Lightbox Grid와 Slider 점 레이아웃 및 데모 스크롤·호버 타이밍을 수정했습니다.
- Cover Reveal에 서로 구별되는 이미지 대표색 두 개 추출을 추가하고 이미지 데모를 고정 팔레트에서 이미지별 `auto`로 전환했으며, `mask:true`가 마지막 색상 패널을 각 커버 전체를 감싸는 최상위 마스크로 교체하도록 수정했습니다.
- Coverflow 경계·그림자 크기와 Safari 페이지네이션 깨짐을 바로잡고, Dissolve의 둥근 모서리에서 비활성 이미지 색이 새는 현상을 차단했습니다. Radial Slider에는 원 전체를 표시하는 `position: 'center'`를 추가하고 데모 원이 반투명하게 겹치거나 무대 밖으로 잘리지 않도록 다듬었습니다.
- Staggered Gallery의 Cover Reveal Mask 기본값을 끄고 교체된 마지막 패널과 동일한 줄별 시간차로 마스크가 재생되도록 맞췄습니다. Radial 데모는 Bottom으로 시작하고 Center·도크 배치를 따로 조절하며, 모든 항목을 하나의 각도 값으로 회전시켜 끝 잔상을 없앴습니다. Coverflow는 클리핑 경계 안에 하단 그림자 여백을 확보했습니다.
- FLIP `fade`가 이전 위치에서 완전히 사라진 뒤 짧은 공백을 거쳐 새 위치에서 나타나도록 구분하고, Page Reveal Zoom에는 확대와 함께 opacity 0→1 진입을 적용했습니다.
<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.46] - 2026-08-01

### English

- Kept the persistent demo header visible and zooming with the rest of the page during Page Reveal `zoom` by removing the host-wide opacity fade.
- Removed Page Reveal Zoom's redundant full-viewport cover so the header no longer flashes behind it, added a left-right `pingpong` Loading Indicator bar mode, and made every generated settings field expose a non-shrinking, translated help button that works by hover, focus, or click.
- Kept the active Radial Carousel item fixed when switching from `infinite` to `off`, and removed click-handler accumulation across recreations.
- Expanded Flip reorder modes with motionless `none`, renamed the previous dissolve to `crossfade`, made `fade` pause between outgoing and incoming layouts, and made `scale` visibly shrink and grow without an opacity fade. Documented that `watch` observes external direct-child DOM mutations while instance reorder methods always play explicitly.
- Preserved the page scroll position across full-page Loader scroll locks, including overlapping Loader instances.
- Differentiated terminal presets: Braille remains a rotating two-dot spinner, Braille Pulse now visibly fills, holds, and drains, while Circle and Clock are documented as clockwise and anticlockwise variants.
- Added compact CI, npm version, license, and jsDelivr badges to the demo hero with keyboard focus styles and working external destinations.
- Automated the separate `catgarret.github.io/example/kineto` deployment after successful `main` CI, retained a moving jsDelivr runtime route, and refreshes its cache after npm publication.
- Changed the canonical live-demo URL to `kineto.dongri.me` for direct Cloudflare Pages hosting while retaining the existing separate-site deployment as a backup.
<!-- Add matching English release bullets here. -->

### 한국어

- Page Reveal `zoom`에서 대상 전체의 불투명도 페이드를 제거해 고정 헤더가 사라지거나 멈춰 있지 않고 나머지 페이지와 함께 확대되도록 수정했습니다.
- Page Reveal Zoom의 중복 전체 화면 커버를 제거해 헤더 깜박임을 없애고, Loading Indicator 막대에 좌우 왕복 `pingpong` 모드를 추가했습니다. 모든 설정 필드의 번역된 도움말 버튼이 잘리지 않고 호버·포커스·클릭으로 열리도록 보강했습니다.
- Radial Carousel의 반복 모드를 `infinite`에서 `off`로 바꿔도 활성 항목 위치를 유지하고, 재생성할 때 클릭 핸들러가 누적되지 않도록 수정했습니다.
- Flip 재배치 모드에 모션 없는 `none`을 추가하고 기존 디졸브를 `crossfade`로 이름 붙였습니다. `fade`는 이전 상태가 사라진 뒤 새 상태가 등장하며, `scale`은 불투명도 페이드 없이 축소·확대됩니다. `watch`는 외부 직계 자식 DOM 변경만 감지하고 인스턴스 재배치 메서드는 항상 명시적으로 재생한다는 점도 문서화했습니다.
- 전체 화면 Loader가 스크롤을 잠갔다 해제해도 페이지 위치가 맨 위로 돌아가지 않도록 했으며, Loader가 겹쳐 실행되는 경우도 기존 위치를 보존합니다.
- Braille은 두 점 회전형, Braille Pulse는 채움·유지·비움 게이지형으로 구분했습니다. Circle과 Clock은 각각 시계 방향·반시계 방향임을 데모와 문서에 명시했습니다.
- 데모 첫 화면에 CI, npm 버전, 라이선스, jsDelivr 배지를 작은 상태 행으로 추가하고 키보드 포커스와 실제 외부 링크를 적용했습니다.
- `main` CI 통과 후 별도 `catgarret.github.io/example/kineto`를 자동 배포하도록 구성하고, jsDelivr 최신 런타임 경로를 유지하면서 npm 발행 뒤 해당 캐시를 갱신하도록 했습니다.
- 기존 별도 사이트 배포는 백업으로 유지하면서 Cloudflare Pages에서 직접 제공할 수 있도록 공식 라이브 데모 주소를 `kineto.dongri.me`로 변경했습니다.
<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.45] - 2026-08-01

### English

- Fixed Hover Roll links restarting on click when pointer hover and keyboard focus overlapped; the label now restores only after both states leave.
<!-- Add matching English release bullets here. -->

### 한국어

- Hover Roll 링크에서 포인터 호버와 키보드 포커스가 겹칠 때 클릭으로 모션이 재시작되던 문제를 수정했습니다. 이제 두 상태가 모두 해제된 뒤에만 원래 라벨로 돌아갑니다.
<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.44] - 2026-08-01

### English

- Added code-split `core` and `modules/*` package entry points so applications can register only the modules they use, with installed-tarball coverage and package-size budgets.
- Reduced runtime and rendering overhead with disposable environment listeners, bounded and retryable engine loading, low-performance fallbacks, lazy demo images, and compatibility-safe replacements for newer JavaScript APIs.
- Added Playwright Firefox and WebKit smoke jobs to GitHub Actions alongside the existing Chromium browser suite.
- Corrected Page Reveal `zoom` so its rectangular opening grows outward from the viewport centre instead of shrinking the cover inward.
- Gated settings by the selected variant: Lazy wave controls appear only for `wave`, pixel-step controls only for `pixelate`, and grain controls only for `grain`; terminal presets likewise hide unsupported direction and origin fields.
- Fixed Scroll Shadows to treat `axis:"x"` as horizontal, and contained Coverflow's active-slide shadow inside the demo card without clipping the intended shadow room.
- Localized terminal-frame descriptions across all seven demo languages and removed a duplicate full-grid measurement pass during responsive resizing.
- Fixed Tabs initialized inside hidden demo panels so the active underline or segmented pill appears on first reveal, without requiring a click or viewport resize.
- Added Mega Menu `responsive` modes (`wrap`, `scroll`, `custom`). The demo uses the single-row swipe mode on narrow screens, while open dropdown and mega panels remain viewport-bounded instead of being clipped by the scroller.
- Made the Page Transition effect picker a single swipeable mobile row and automatically scroll the selected effect into view.
- Added opt-in Coverflow active-slide shadows with configurable opacity and CSS tokens; the default remains off for backward-compatible rendering.
- Fixed responsive demo layout edge cases: compound Loading Indicator labels fit on mobile, a final lone card fills its row even after a full-width card, and mega menus open on the first hover while their two-column mobile panels stay inside the viewport.
- Fixed Loading Indicator settings and motion: the drawer now exposes its real `spinner` / `spin` defaults, preset changes hide unsupported controls, Scanner animates until an explicit progress value arrives, and bar/arc grow modes use slower continuous easing without low-refresh stepping.
- Added Lazy `wave` and `grain` reveals with configurable amplitude, frequency, speed, slice height, film grain, FPS and DPR limits. The existing `noise` and `zoom` compatibility aliases keep their prior meanings.
- Unified determinate loading output: Loader and Loading Indicator update scoped `data-kt-progress-output` text, CSS variables and ARIA values; Loading Indicator can subscribe to an existing Loader through `bindProgress()` or `progressSource`.
- Rebuilt `AI-PROMPT-GUIDE.md` around one canonical English application prompt with Korean usage guidance, current 51-module boundaries, Wave/Grain and shared determinate-progress examples. The repository-focused English AI handoff and Korean owner guide remain separate and intact.
- Shared one radial carousel engine between Slider's `effect:"radial"` and the backward-compatible standalone `radial` module. The 51-module public surface and `data-kt-radial` / `Kineto.radial()` entry points remain intact.
- Hardened preset-aware settings: secondary `mode` values can no longer be mistaken for module variants, defaults participate in every visibility decision, Slider hides effect-specific no-op controls, and incompatible track/radial markup choices are not offered.
- Split the GNB demo into read-only overview, dropdown, and mega-menu tabs so each editable example owns an independent settings panel.
- Documented bounded module composition, deferred module-entry/tree-shaking work, and mandatory copy-paste Git commands for agents without repository integration.
- Extended Slider with `perGroup`, `breakpoints`, `grabCursor`, `slideToClickedSlide`, `autoHeight` and `sync` — the last one links two sliders for the Swiper "thumbs gallery" / slick `asNavFor` pattern in either direction.
- Added Page Reveal `center-slit`, `iris`, `flash` and `data-mosaic`, preserved the existing `zoom` preset for compatibility, and removed only `panels` and `reveal-text` (duplicates of `strips` and a weak rule wipe).
- Added Glitch `rgb-slice-burst`: seeded, weighted-preset bursts of channel separation, slice shifts and artifact blocks with a clean recovery frame, and made `randomness` actually scale the plan spread.
- Added `data-mosaic` and `rgb-slice-burst` to Lazy so an image can assemble out of tiles or land through one glitch burst.
- Added Cover Reveal `mask` lead-in with `maskDirection`, plus `exit()`, `refresh()` and `watch` so a reordered list vanishes and re-enters instead of silently mutating.
- Added Flip `mode` (`slide`, `fade`, `fade-slide`, `scale`) and Text Split `drift` / `squeeze`.
- Made compound terminal indicators fully composable: `showSpinner`, `showLabel`, `showStatus` and `stepTotal` toggle each part, and one shared meter renderer means `dotCount`, `spread`, `fillChar` and `emptyChar` behave identically in Terminal Meter and Spinner + Meter.
- Fixed terminal frame spinners: `white-space:pre` restored the collapsed spaces that made every sprite track look stationary, descenders are no longer clipped, cursor presets keep a fixed width by blinking a persistent caret, and Marquee scrolls left-to-right with Hangul kept intact via grapheme segmentation plus optional `shuffle` / `decode` reveals.
- Corrected Text Shimmer direction: percentage `background-position` on an oversized image resolves to a negative span, so `normal` had been running right-to-left.
- Declared variant capabilities in the feature contract (`variantCapabilities` / `variantRequires`). `npm run sync:options` mirrors them into the playground, which now probes the real target, so a variant that cannot run on an element is never offered. Guarded by `tests/variant-capabilities.mjs` and documented in `docs/ARCHITECTURE.md`.
- Bottom Sheet and the settings drawer now allow text selection in the header while still resizing on a vertical drag; `maxHeight` applies as a ceiling in every mode and accepts `vh`, `%` or px.
- Page Loader can hand its exit to a Page Reveal effect via `revealEffect`, animating the loader itself rather than stacking a second cover on top.
- Overhauled Loading Indicator visuals (dual ring, orbit, spokes rotation, stretch/squeeze bar) and rebuilt Terminal Meter with true text characters for strict A11y compliance. Deployed automatic conditional option visibility across all 51 modules in the Playground.
- Added real progress support for Terminal Meter & Blocks, expanded ASCII/Unicode spinner frame presets (including braille-bounce, corners, squares, boxes), fixed light mode text shimmer looping, upgraded Orbit and Dual ring spinners, and implemented a smart auto-responsive Tetris-like grid layout for settings controls.
- Polished Loading Indicator visuals and behavior: removed default shadows, rebuilt equal-size dual rings, fixed spokes and reverse playback, refined orbit and Glow motion, made light-theme shimmer visible with a seamless loop, animated Terminal Meter, and added ASCII, Braille, arrow, line, circle and custom-frame terminal presets.
- Added `transformOrigin` to transform-driven loading variants and synchronized the playground, feature contract, documentation, localization and regression coverage.
- Restored the Cover Reveal line-demo display type, compacted the settings drawer with a draggable visible grip and groups-only scrolling, and cleared stale persisted drawer heights.
- Bottom Sheet header resizing now keeps the original top grip active as a second drag surface, with exact border-box height tracking. Toast countdown rings retain their depleted state through the exit animation instead of flashing full.
- Audited v0.8.43 for release readiness: all bundle and package budgets now pass, the npm dry-run contains 11 allowlisted files at 341.4 KiB compressed, and the approval-gated shipping sequence is documented.
- Added a separate inline Loading Indicator module with comet, dual-ring, spokes and orbit spinners; dots; indeterminate glow bars; text shimmer; and four symbol-only terminal styles.
- Kept Loader focused on full-page slot, circular and bar overlays while Loading Indicator remains in normal document flow.
- Added indicator lifecycle control through `show()`, `hide()`, `complete()`, `trackPromise()`, `finished`, callbacks, `kt-loading-indicator-*` events and custom renderer hooks.
- Added granular CSS tokens and preset-aware settings. Wandering Eyes is intentionally excluded.
- Replaced measured settings-panel masonry with deterministic two-column grid flow. A single or unpaired last group now spans the full row without overlap.
- Limited Bottom Sheet resizing to its handle or header so body text remains selectable.
- Fixed the settings-drawer easing field towering over every neighbouring control: a 430px container-query threshold matched the 420px controls column, so the field stacked and `aspect-ratio:1; width:100%` inflated the curve to 420×420 — the field measured 709.6px tall against 49.6px for a plain field. The threshold is now 330px, the stacked curve is capped at 200px, and an empty copy-status no longer reserves a 14px band. Field height: 709.6px → 263.6px.
- Replaced the demo's hand-written per-variant `WHEN` predicates with option support DERIVED from the module sources. `scripts/derive-variant-options.mjs` parses each module with acorn, finds the variable its variant funnels through (following re-derivations like `const preset = type === 'digital' ? 'noise' : type`), attributes every `opts.X` read to the variant branch enclosing it, and follows single-option locals so modules that read their options up front — Glitch and Lazy both do — are analysed correctly. The result is written to the contract as `variantOptions` and mirrored into the drawer, so adding a variant needs no demo edit. Glitch now shows 9 controls on `rgb` and 19 on `rgb-slice-burst` instead of the same list either way; 13 modules and 117 variants are gated this way. The analysis is conservative: anything it cannot attribute stays visible.
- Reserved exactly what a compound terminal meter needs instead of a hardcoded 17ch, sized for a 10-cell bar. Spinner + Meter measured 252px inside a 240px demo stage and was clipped; it is now 214px with 0px of width jitter as the percentage runs 9% -> 100%.
- Merged Text Shimmer/Wave and Tabs/Segmented into tabbed cards, found by scanning all 172 demo cards for groups whose `data-kt-*` key set is identical and only values differ. The other candidate groups are preset galleries (the 35 frame spinners, Glitch/Lazy presets) and Fullpage, whose cards differ in page structure rather than in option values, so tabbing them would hide the point of the demo.
- Gave every settings-drawer control a declared resting value. 176 of 371 fields showed an EMPTY input whenever the demo markup did not spell the option out as a `data-kt-*` attribute, so the panel disagreed with the running demo until you touched the control — which then wrote an attribute that had never existed. Defaults now live in `kineto.features.json` as `optionDefaults`, are mirrored into the demo by `sync:options`, and `tests/option-defaults.mjs` fails the build if a new control ships without one. Blank fields: 176 -> 0.
- Completed option tooltips: 371 drawer fields x 7 languages, 0 gaps. 29 fields (Slider, Glitch, Lazy) had no tooltip at all, 20 Cursor tooltips existed only in ko/en, and 16 merely restated their own label ("Glare opacity" -> "Glare opacity."). `tests/help-coverage.mjs` now rejects missing, over-long and label-restating tooltips.
- Removed inline presentation from the demo and from module-generated markup: the intro overlay's `cssText`, the root scroll locks, a `scrollMarginTop` that silently overrode a 4px-different CSS declaration, the async-font `onload` handler, and 5 `style="..."` attributes baked into innerHTML in cursor/lazy/progress. Runtime geometry that cannot be static (the drag-resized drawer) now publishes `--kt-drawer-h` instead. `tests/no-inline-styles.mjs` guards all of it.
- Rebuilt the Terminal Scanner preset: `direction:'reverse'` now mirrors the arrowhead (`[ <=== ]` against `[ ===> ]`) instead of replaying the same frames backwards, `dotCount` sets the track length, and a numeric `progress` fills the beam like the arc, the bar and the Terminal Meter. Compound presets can request a shorter meter through `compound.meterCount`.

### 한국어

- 애플리케이션이 사용하는 모듈만 등록할 수 있도록 코드 분할된 `core` 및 `modules/*` 패키지 진입점을 추가하고, 설치된 tarball 검증과 패키지 용량 예산을 적용했습니다.
- 해제 가능한 환경 감시자, 제한 시간·재시도 가능한 엔진 로딩, 저성능 환경 기능 축소, 데모 이미지 지연 로딩, 최신 JavaScript API의 호환성 안전 대체로 런타임·렌더링 비용을 줄였습니다.
- 기존 Chromium 브라우저 스위트와 함께 Playwright Firefox·WebKit 스모크 검증을 GitHub Actions에 추가했습니다.
- Page Reveal `zoom`의 사각형 노출이 커버를 중앙으로 줄이는 대신 화면 중앙에서 바깥쪽으로 커지도록 바로잡았습니다.
- Lazy 설정은 선택한 효과에 필요한 항목만 표시합니다. Wave 조절값은 `wave`, 픽셀 단계는 `pixelate`, 입자값은 `grain`에서만 보입니다. 터미널 프리셋도 실제 지원 여부에 따라 방향·원점 옵션을 숨깁니다.
- `axis:"x"` Scroll Shadows를 수평으로 해석하도록 고쳤고, Coverflow의 활성 그림자는 카드 밖으로 새지 않으면서 내부에서 잘리지 않도록 여백을 확보했습니다.
- 터미널 프레임 스피너 설명을 7개 언어로 맞추고, 반응형 변경 시 전체 데모 그리드를 중복 측정하던 작업을 제거했습니다.
- 숨겨진 데모 패널 안에서 초기화된 Tabs도 처음 열 때 활성 밑줄·세그먼트 필이 바로 보이도록 수정했습니다. 클릭이나 화면 크기 변경이 필요하지 않습니다.
- Mega Menu에 `responsive` 모드(`wrap`, `scroll`, `custom`)를 추가했습니다. 데모는 좁은 화면에서 한 줄 스와이프를 사용하며, 열린 드롭다운·메가 패널은 스크롤 영역에 잘리지 않고 화면 안에 표시됩니다.
- 모바일 Page Transition 효과 선택을 한 줄 가로 스와이프로 바꾸고, 선택한 효과가 자동으로 화면 안에 들어오도록 했습니다.
- Coverflow 활성 슬라이드 그림자를 선택형 옵션으로 추가했습니다. 투명도와 CSS 토큰을 제공하며 기존 화면 호환성을 위해 기본값은 꺼짐입니다.
- 반응형 데모 배치의 경계 조건을 고쳤습니다. 모바일에서 Loading Indicator 복합 문구가 잘리지 않고, 전체 폭 카드 뒤 마지막 한 장이 행을 채우며, 메가메뉴가 첫 hover에 열리고 모바일 2열 패널은 화면 안에 머뭅니다.
- Loading Indicator의 설정과 동작을 바로잡았습니다. 설정창에 실제 기본값 `spinner` / `spin`이 표시되고 프리셋 변경 시 미지원 옵션을 숨기며, Scanner는 명시적인 진행률을 받기 전까지 움직입니다. 막대·원호 grow 모션은 저주사율에서도 끊기지 않도록 더 느리고 연속적인 이징으로 다듬었습니다.
- Lazy에 `wave`·`grain` 노출 효과를 추가했습니다. 진폭·주파수·속도·조각 높이·필름 입자·FPS·DPR을 조절하며, 기존 `noise`·`zoom` 호환 별칭의 의미는 유지합니다.
- Loader와 Loading Indicator의 실제 진행률 출력을 통합했습니다. 범위 안의 `data-kt-progress-output` 문구·CSS 변수·ARIA 값이 함께 바뀌며, Loading Indicator는 `bindProgress()` 또는 `progressSource`로 기존 Loader를 구독합니다.
- `AI-PROMPT-GUIDE.md`를 영문 애플리케이션 프롬프트 기준본과 한국어 사용 안내 구조로 다시 썼습니다. 51개 모듈의 역할, Wave·Grain, 실제 진행률 공유 예시를 최신화했으며, 저장소용 영문 AI 인수인계와 한국어 소유자 안내는 별도로 유지합니다.
- Slider의 `effect:"radial"`과 기존 독립 `radial` 모듈이 같은 원형 캐러셀 엔진을 사용하도록 통합했습니다. 51개 공개 모듈과 `data-kt-radial` / `Kineto.radial()` 진입점은 그대로 유지합니다.
- 프리셋별 설정 노출을 보강했습니다. 보조 `mode`를 모듈 variant로 오인하지 않고, 기본값을 모든 노출 판단에 반영하며, Slider는 효과별 무의미한 옵션과 현재 마크업에서 실행할 수 없는 트랙/원형 효과를 제공하지 않습니다.
- GNB 데모를 전체 보기·드롭다운·메가메뉴 탭으로 나눴습니다. 전체 보기는 읽기 전용이고 편집 가능한 두 예시는 각각 독립 설정창을 사용합니다.
- 결합도가 낮은 모듈 연동 범위, 추후 트리셰이킹 계획, Git 연동이 없는 에이전트의 복사·붙여넣기 명령 제공 원칙을 문서화했습니다.
- Slider에 `perGroup`, `breakpoints`, `grabCursor`, `slideToClickedSlide`, `autoHeight`, `sync`를 추가했습니다. `sync`는 두 슬라이더를 양방향으로 연결해 Swiper의 썸네일 갤러리 / slick의 `asNavFor` 패턴을 지원합니다.
- Page Reveal에 `center-slit`, `iris`, `flash`, `data-mosaic`을 추가하고 기존 `zoom` 프리셋은 호환성을 위해 유지했으며, `strips`와 중복되는 `panels`와 완성도가 낮은 `reveal-text`만 제거했습니다.
- Glitch에 `rgb-slice-burst`를 추가했습니다. 시드 기반 가중 프리셋으로 채널 분리·슬라이스 밀림·아티팩트 블록을 조합한 짧은 버스트 뒤 완전히 깨끗한 프레임으로 복귀하며, `randomness`가 계획의 변동 폭을 실제로 조절합니다.
- Lazy에도 `data-mosaic`과 `rgb-slice-burst`를 추가해 이미지가 타일로 조립되거나 한 번의 글리치로 등장합니다.
- Cover Reveal에 `mask` 선행 노출과 `maskDirection`을 추가하고, `exit()`·`refresh()`·`watch`로 목록이 바뀔 때 사라졌다 다시 등장하도록 했습니다.
- Flip에 `mode`(`slide`, `fade`, `fade-slide`, `scale`), Text Split에 `drift`·`squeeze`를 추가했습니다.
- 컴파운드 터미널 인디케이터를 완전히 조립 가능하게 했습니다. `showSpinner`·`showLabel`·`showStatus`·`stepTotal`로 각 부분을 켜고 끄며, 미터 렌더러를 하나로 합쳐 `dotCount`·`spread`·`fillChar`·`emptyChar`가 Terminal Meter와 Spinner + Meter에서 동일하게 동작합니다.
- 터미널 프레임 스피너를 수정했습니다. `white-space:pre`로 붕괴됐던 연속 공백을 되살려 모든 스프라이트가 실제로 움직이게 했고, 디센더 잘림을 없앴으며, 커서 프리셋은 커서를 항상 두고 opacity만 깜박여 폭이 변하지 않습니다. Marquee는 좌→우로 흐르고 자소 분할로 한글 결합을 유지하며 `shuffle`·`decode` 연출을 옵션으로 제공합니다.
- Text Shimmer 방향을 바로잡았습니다. 박스보다 넓은 이미지의 퍼센트 `background-position`은 음수 구간으로 해석되므로, 지금까지 `normal`이 우→좌로 흐르고 있었습니다.
- 기능 계약에 variant 능력 선언(`variantCapabilities` / `variantRequires`)을 추가했습니다. `npm run sync:options`가 이를 플레이그라운드로 자동 반영하고, 설정창이 실제 대상을 검사해 실행할 수 없는 variant는 아예 제공하지 않습니다. `tests/variant-capabilities.mjs`로 보호하고 `docs/ARCHITECTURE.md`에 가이드를 남겼습니다.
- 바텀시트와 설정창 헤더에서 텍스트 선택과 수직 드래그 리사이즈가 함께 동작하도록 했고, `maxHeight`가 모든 모드에서 상한으로 적용되며 `vh`·`%`·px를 받습니다.
- Page Loader가 `revealEffect`로 Page Reveal 연출에 퇴장을 넘길 수 있습니다. 위에 커버를 덮는 대신 로더 자신이 그 효과로 걷힙니다.
- Loading Indicator 비주얼 퀄리티를 향상(듀얼 링, 궤도, 살 회전, 스트레치/스퀴즈 모션 추가)하고, 접근성 향상을 위해 터미널 미터를 텍스트 기반으로 새로 구현했습니다. 플레이그라운드의 전체 51개 모듈에 대해 비활성 옵션을 자동으로 숨기는 의존성 로직을 적용했습니다.
- Terminal Meter 및 Blocks에 실제 진행률(setProgress) 연동을 추가하고, braille-bounce·corners·squares·boxes 등 유니코드 스피너 프리셋을 확장했습니다. 라이트 모드 시머 루프 및 Orbit·Dual ring 스피너를 개선하였으며, 설정창 항목 수 및 아코디언 상태에 따라 빈 공간 없이 자동 정렬되는 반응형 테트리스 그리드를 구축했습니다.
- Loading Indicator의 기본 그림자를 제거하고 동일 크기 듀얼 링, 스포크·역방향 재생, 오빗, Glow 진행 모션, 라이트 모드 시머의 자연스러운 루프, 움직이는 Terminal Meter를 정비했습니다. ASCII·Braille·화살표·라인·원형·사용자 프레임 터미널 프리셋도 추가했습니다.
- transform 기반 로딩 타입에 `transformOrigin`을 추가하고 설정창, 기능 계약, 문서, 번역, 회귀 테스트를 동기화했습니다.
- Cover Reveal 줄 단위 데모의 큰 타이포를 복구하고, 설정창을 더 낮고 촘촘하게 정리했습니다. 보이는 회색 그립으로 높이를 조절할 수 있고 설정 그룹만 스크롤하며, 오래 저장된 높이값은 제거합니다.
- 바텀시트의 헤더 조절 모드에서도 기존 상단 그립을 함께 사용할 수 있도록 했고 `border-box` 기준으로 정확히 높이가 바뀝니다. Toast 카운트다운 링은 닫히기 직전 다시 차오르지 않고 소진 상태를 유지합니다.
- v0.8.43 배포 준비 상태를 점검했습니다. 모든 번들·패키지 예산이 통과했고 npm dry-run은 허용된 11개 파일, 압축 341.4 KiB이며 승인 후 배포 절차를 문서화했습니다.
- 코멧·듀얼 링·스포크·오빗 스피너, 점, 후광 바, 텍스트 시머, 기호형 터미널 표시를 별도 인라인 Loading Indicator 모듈로 추가했습니다.
- Loader는 전체 화면 Slot·Circular·Bar 오버레이만 담당하고, Loading Indicator는 일반 콘텐츠 흐름 안에서 동작합니다.
- `show()`, `hide()`, `complete()`, `trackPromise()`, `finished`, 콜백, 이벤트와 사용자 렌더러로 수명주기를 제어할 수 있습니다.
- 크기·두께·속도·방향·후광·글꼴을 옵션과 CSS 토큰으로 조절합니다. Wandering Eyes는 포함하지 않습니다.
- 설정창의 높이 측정형 배치를 제거했습니다. 하나만 남거나 홀수로 남은 마지막 그룹은 겹치지 않고 전체 폭을 사용합니다.
- 바텀시트는 그립이나 헤더에서만 높이를 조절해 본문 텍스트 선택을 방해하지 않습니다.
- 설정창의 easing 필드가 다른 옵션보다 과하게 크던 문제를 고쳤습니다. 컨테이너 쿼리 임계값 430px이 420px 폭의 옵션 컬럼에 매칭돼 세로 적층으로 바뀌고, `aspect-ratio:1; width:100%`가 곡선을 420×420으로 부풀려 필드 높이가 709.6px(일반 필드 49.6px)이 됐습니다. 임계값을 330px로 낮추고 적층 시 곡선 폭을 200px로 제한했으며, 비어 있는 복사 상태 줄이 14px을 예약하지 않게 했습니다. 필드 높이 709.6px → 263.6px.
- 데모에 손으로 적어두던 variant별 `WHEN` 조건식을 모듈 소스에서 도출한 지원 옵션으로 교체했습니다. `scripts/derive-variant-options.mjs`가 acorn으로 각 모듈을 파싱해 variant가 흐르는 변수를 찾고(`const preset = type === 'digital' ? 'noise' : type` 같은 파생도 추적), 모든 `opts.X` 읽기를 그것을 감싼 variant 분기에 귀속시키며, 옵션을 상단에서 지역변수로 먼저 읽는 모듈(Glitch·Lazy가 그렇습니다)도 지역변수 사용처를 따라가 정확히 분석합니다. 결과는 계약서의 `variantOptions`에 기록되고 설정창으로 복제되므로, variant를 추가해도 데모를 고칠 필요가 없습니다. Glitch는 `rgb`에서 9개, `rgb-slice-burst`에서 19개를 보여주며(이전에는 어느 쪽이든 같은 목록), 13개 모듈 117개 variant가 이렇게 게이팅됩니다. 분석은 보수적이어서 귀속하지 못한 옵션은 계속 보입니다.
- 복합 터미널 미터의 예약 폭을 10칸 기준 하드코딩 17ch 대신 실제 셀 수에서 유도합니다. Spinner + Meter가 240px 스테이지 안에서 252px로 측정돼 잘리고 있었고, 지금은 214px이며 퍼센트가 9%→100%로 변하는 동안 폭 흔들림이 0px입니다.
- Text Shimmer/Wave와 Tabs/Segmented를 탭 카드로 묶었습니다. 데모 카드 172개 전체에서 `data-kt-*` 키 집합이 동일하고 값만 다른 그룹을 스캔해 찾았습니다. 나머지 후보는 프리셋 갤러리(프레임 스피너 35종, Glitch·Lazy 프리셋)와 Fullpage였고, Fullpage는 옵션 값이 아니라 페이지 구조가 다른 카드들이어서 탭으로 묶으면 데모의 요점이 가려집니다.
- 설정창의 모든 컨트롤에 기본값을 선언했습니다. 371개 필드 중 176개가 데모 마크업에 `data-kt-*` 속성으로 적혀 있지 않으면 빈칸으로 떴고, 그래서 컨트롤을 만지기 전까지 설정창과 실제 데모가 어긋났습니다(만지는 순간 없던 속성이 처음 생겼습니다). 이제 기본값은 `kineto.features.json`의 `optionDefaults`에 있고 `sync:options`가 데모로 복제하며, 새 컨트롤이 기본값 없이 들어오면 `tests/option-defaults.mjs`가 빌드를 실패시킵니다. 빈칸 176 → 0.
- 옵션 툴팁을 전부 채웠습니다. 371개 필드 × 7개 언어, 누락 0. 29개(Slider·Glitch·Lazy)는 툴팁이 아예 없었고, Cursor 20개는 ko/en에만 있었으며, 16개는 라벨을 그대로 반복하고 있었습니다("Glare opacity" → "Glare opacity."). `tests/help-coverage.mjs`가 누락·과다길이·라벨 반복을 모두 거부합니다.
- 데모와 모듈 생성 마크업에서 인라인 표현을 제거했습니다. 인트로 오버레이의 `cssText`, 루트 스크롤 락, CSS 선언과 4px 어긋난 채 조용히 이기고 있던 `scrollMarginTop`, 폰트 비동기 로딩의 `onload` 핸들러, cursor·lazy·progress의 innerHTML에 박혀 있던 `style="…"` 5개입니다. 정적일 수 없는 런타임 값(드래그로 조절한 설정창 높이)은 `--kt-drawer-h`로 발행합니다. `tests/no-inline-styles.mjs`가 전부 감시합니다.
- 터미널 Scanner 프리셋을 다시 만들었습니다. `direction:'reverse'`가 같은 프레임을 거꾸로 재생하는 대신 화살촉을 뒤집고(`[ ===> ]` ↔ `[ <=== ]`), `dotCount`로 트랙 길이를 정하며, 숫자 `progress`를 주면 아크·바·터미널 미터처럼 채워집니다. 복합 프리셋은 `compound.meterCount`로 더 짧은 미터를 요청할 수 있습니다.

Kineto follows Semantic Versioning. Public scope is additionally governed by `FEATURE_CONTRACT.md`.
## [0.8.43]

- **Automated releases and AI handoff**: added repository-wide Codex/Claude
  completion rules, bilingual release notes, version preparation, tag shipping,
  npm Trusted Publishing, and GitHub Release automation.
- **Lean distribution**: reduced the npm/GitHub Release tarball from about
  1.06 MB to 293 KB by publishing only minimized runtime entry points. CI now
  enforces packed/unpacked/file-count budgets and installs the real tarball to
  verify ESM, CommonJS, and CSS exports.
- **Cover Reveal colour system**: supports a fixed colour, a two-colour layer pair, random selection within a user palette, or an automatically derived harmonious palette. Gallery cards now use the same public options shown in the playground.
- **Colour controls**: playground colour values preserve HEX, RGB(A), HSL(A), and CSS custom-property input while retaining a native colour swatch. Scroll Shadows exposes the useful shadow colour control with an RGBA default and infers its cover colour from the surface/CSS variable.
- **Playground polish**: contextual help uses Kineto's viewport-aware fixed tooltip without changing sheet scroll height; Ease controls are more compact; invalid Hover Roll mode choices are hidden; the footer, multi-row FLIP example, accordion spacing, and Confetti completion icon were refined.
- **Demo layout and reliability**: settings triggers now sit directly below their demo stages, Sticky/Floating/Horizontal scroll examples have native fallbacks, and fullpage/tab/slider/cover layouts are balanced. The rejected Split-flap Minimal variant and its standalone code/docs were removed.
- **Playground UX**: settings update live without a redundant Apply button; the settings/code views cross-fade in a content-sized responsive drawer, groups flow through a height-aware two-column layout and expand to full width when alone, and an unpaired collapsed group also fills its row. The Ease editor fills its two tracks with a square graph, unsupported option combinations stay hidden, and invalid values roll back to the last working state.
- **Module updates**: Slider adds dissolve, dots, CSS-customizable progress, and pause controls; hover and manual pauses preserve the remaining autoplay time instead of restarting the interval, while coverflow keeps its adjacent-card preview. Tilt and Card Glow add composable pointer-following shadows with full option and CSS-variable control. Reveal clock masks staggered list items independently. Fullpage now absorbs the gesture tail after a page change so a newly entered long section always starts at the top and scrolls internally only on the next gesture. Cover Reveal adds random direction and FLIP composition; FLIP adds reorder/shuffle/sort APIs; Scroll Shadows adds transitions, CSS variables, state APIs, and change events.
- **Runtime hardening**: option attributes that share another module's activation name (`progress`, `hold`, `drag`, `cursor`) are no longer double-initialized, preventing settings-driven destroy/recreate collisions.
- **Demo content and documentation**: Korean descriptions were tightened and completed across every card, translations and module contracts were synchronized to the 51-module registry, and obsolete standalone Shuffle help was folded into Text Reveal. Static inline styles/scripts were moved into the demo CSS/JS, and generated/package artifacts now pass browser, lifecycle, structure, dependency, size, and package checks.

## [0.8.42]

- **Accessibility & progressive enhancement**: `hold` and `progress` now provide a **reduced-motion path** so they keep working (hold confirms on click; the progress bar / back-to-top still render) instead of being no-op'd; `bottomSheet` dialog gets an accessible name (from a heading, `aria-label`, or `label`); `lightbox` traps <kbd>Tab</kbd> focus inside the modal; the reduced-motion "show it anyway" CSS now also covers `text-transition` / `shuffle` / `cover-reveal` / `text-fill`.
- **Performance**: `progress` no longer runs a permanent per-frame rAF (it idles when settled and wakes on scroll/resize) and caches its target element instead of `querySelector` every frame; `marquee` caches its width (re-measured on resize) instead of reading `offsetWidth` each frame; `radial.destroy()` now fully restores items (removes `kt-radial-item`, clearing the lingering `will-change`).
- **slider**: `wheel:true` — mouse-wheel navigation (whichever wheel axis has the larger delta pages the slider, throttled to one slide per flick).
- **tooltip**: `effect` (`fade` / `scale` / `shift` / `none`) for the show/hide animation; colours/shape stay themeable via `--kt-tooltip-*`.
- **radial**: items fade out toward the arc edges so a wrapping/leaving item no longer lingers as a translucent ghost.
- **Demo**: content reorganized into 7 category sections (Text / Media / Scroll / Pointer / Components / Feedback / System) matching the sidebar nav order 1:1; card descriptions trimmed to a single line; sticky-header / cover-to-fixed demos moved into cards with an options panel; loader/intro overlays cover the scrollbar-gutter; asset cache-busting.

## [0.8.41]

- **Scroll toolkit — three new modules** (now 51), CSS-first where the browser allows:
  - **`scrollShadows`** (`data-kt-scroll-shadows`): soft edge shadows on a scroll container that melt away at each end. Pure-CSS gradient technique — no per-scroll JS. Options: `axis`, `size`, `color`, `shadow`.
  - **`stickyHeader`** (`data-kt-sticky-header`): a sticky header that gains a shadow and (optionally) shrinks past a threshold — the shrinking-header / cover-to-fixed pattern. Publishes `--kt-header-progress` (0→1) for custom scrubbed styling. Options: `offset`, `distance`, `shrink`, `shadow`, `activeClass`, `onChange`.
  - **`horizontalScroll`** (`data-kt-horizontal-scroll`): pins a stage and slides its inner track sideways as you scroll vertically. Universal (no GSAP needed), `smooth` for inertial easing; `destroy()` rebuilds the original DOM.
- **`cssScroll` engine** gained `timeline:"scroll"` (links to the scrollport, for reading bars / reverse columns) alongside the default `view()`, plus an `axis` option — so more scroll-driven-animation patterns resolve to native CSS timelines when supported.
- **Global spring** — `Kineto.config({ spring: true })` gives `reveal` entrances and `gesture` feedback springy, overshooting easing by default (still overridable per element).
- **Segmented tabs fixes**: the active pill is restored in **vertical** orientation (was collapsing to zero height), marker motion / effects apply in both orientations, and activating a tab no longer reflows its width/height (a hidden bold twin reserves the space).
- **Tabs** `indicatorMotion` (`slide`/`none`/`fade`) — controls the moving marker independent of the panel `effect`.
- **overflowText**: item **scene transitions** (fade/dissolve/flip/page) no longer collapse the parent height mid-swap (box is locked to the tallest item and items cross-fade in place); **scroll-fade `crossfade`** rewritten to a clean end→start cross-dissolve so characters no longer smear over each other.
- **Toast** `progressBar:"fill"` — the whole toast box fills like a progress bar (in addition to `bar`/`ring`).
- **Confetti** `once:true` — fire a single burst instead of on every click.
- **Playground — easing editor**: `ease` / `easing` fields are now a **preset picker with a live cubic-bezier curve preview** (easings.net curves, CSS keywords, spring/back, GSAP eases) — pick a feel and see the curve, then copy the code.
- **scrollShadows** also gained `opacity` (0–1 shadow strength) and `shape:"radial"|"linear"` (soft bloom vs straight edge gradient).
- **scrollShadows** `mode:"mask"` — instead of edge shadows, the content itself **dissolves** at the overflowing edges via a scroll-aware gradient mask (ramped smoothly, not toggled). Shadow colour now reads a themeable `--kt-scroll-shadow` CSS variable.
- **marquee** `fade` — a gradient edge-mask (px) so continuous strips / logo rows dissolve at the ends instead of hard-cutting.
- **radial** `align:"center"` — places the active item at the container's centre for any dock/angle (was clipping at the docked edge).
- **parallax** now has a **native (non-GSAP) scroll fallback**, so parallax + reverse-scrolling-column layouts work everywhere, degrading gracefully.
- **textFill** — rounded glyph edges (e.g. the right of an "O") are no longer shaved off under tight letter-spacing.
- **Lightbox**: new `thumbnails:true` shows a **filmstrip** of the group's thumbnails inside the viewer (click to jump, active highlighted); the strip uses the on-page thumbnail so it stays light even when `data-kt-src` points at a big original (thumbnail↔original was already supported via `data-kt-src`). The playground panel now exposes `share`/`thumbnails` so it matches the live demo.

## [0.8.40]

- **Layout (FLIP) motion — new module `flip`** (48th): `data-kt-flip` smoothly animates children when they're reordered, added, or removed (First-Last-Invert-Play via a `MutationObserver`). Options: `duration`, `ease`, `stagger`, `item`, `watch`; API `record()` / `play()`. Fully accessible (honours reduced-motion) and `destroy()` restores the DOM untouched.
- **Brush Reveal — scratch-card API**: `hold:true` only paints while the pointer is pressed (click-drag), matching a lottery scratch card; default still paints on hover/drag. `threshold` (0–1) fires `onReveal(p, el)` + a `kt-brush-reveal` event once that fraction of the back image is uncovered, and `onProgress(p, el)` + `kt-brush-progress` stream the ratio continuously. New `progress()` API returns the current ratio.
- **Text Transition — reveal direction**: `charDirection` adds `rtl` (right→left) and `random` alongside the default `ltr`, so characters can cascade in from either side or scatter in.
- **Tabs — marker motion**: new `indicatorMotion` (`slide` / `none` / `fade`) controls the moving tab pill/underline itself, independent of the panel `effect` — glide it, snap it instantly, or blink it across.
- **Segmented tabs — vertical fix**: the active pill now spans the column width and moves vertically when `orientation:"vertical"` (was breaking horizontally).

## [0.8.39]

- **Toast polish**: default duration is now **10s (max 30s)**; clean **line-symbol icons** per type (no emoji); when using the countdown **ring**, the type icon sits in the ring's centre (no more overlap).
- **Switch — form-usable**: wrap a checkbox (`<button data-kt-switch><input type="checkbox" name="notify" hidden></button>`) and the switch drives it — it submits with the form and fires native `change`/`input` — while staying an accessible `role="switch"` control. Radios work the same way.
- **Tabs — selection API**: `onChange(index, tab, panel)` callback + a `kt-tabs-change` event on every change (so a segmented control can drive form state / analytics).
- **Segmented tabs** active pill now uses a `currentColor` mix so it's clearly visible on any background (was invisible on dark).
- **Radial carousel**: the active item exposes `.kt-active` / `.active-item` / `aria-current` for custom styling; the demo now scales the active thumbnail up and dims the rest.
- **Demo Module Index**: all 47 modules are listed and every chip scrolls to its section (button-triggered/body-level modules like loader, pageReveal, pageTransition now map correctly).
- **Gesture** `origin` and **Hold** `mash` `step`/`decay` demos retuned so the options' effect is clear.
- **overflowText — item scene transitions**: `fade` / `dissolve` / `flip` / `page` now also cycle **discrete item children** (like `rolling`), not just paginated overflowing text — automatically when the element holds ≥2 item children (keeping full markup).
- **Segmented tabs** demo: white active pill in light theme, light overlay in dark.

## [0.8.38]

- **Toast rewrite for robustness + customization**:
  - **Instant-dismiss fixed for good**: dismissal is now driven ONLY by a timer that can never drop below 300 ms; the progress bar/ring is purely visual (and stays in sync on hover). No event or hover can make a toast vanish instantly.
  - **`type:"none"`** (no accent/icon) added alongside info/success/warning/error.
  - **`icon` option**: default is the accent-coloured type glyph; `icon:false` removes it; or pass a custom string / emoji / inline SVG. Cleaner default than the old dot, and fully restyleable via `.kt-toast__icon` — or set a per-type background with `.kt-toast--error{--kt-toast-bg:…}`.
- Added **docs/DESIGN-PRINCIPLES.md** — every module (current 47 + future) must be optimized, accessible, progressively degrading, easy to apply, and easy to customize (options + CSS variables + class hooks); retro-applied where missing.

## [0.8.37]

- **New module `data-kt-switch` (46 → 47)** — accessible animated toggle: role="switch" + aria-checked, sliding thumb, click/Space/Enter, `onChange(checked, el)` + `kt-switch-change` event, `instance.toggle()/set()/checked`. Options `size`, `onColor`, `offColor`, `thumbColor`, `duration` (or `--kt-switch-*` CSS vars).
- **Tabs — segmented style**: add the `kt-tabs--segment` class to render the animated indicator as a sliding pill behind the active tab (the "Published / Scheduled / Drafts" look). Themeable via `--kt-seg-*`.
- **overflowText `scroll-fade` — `crossfade` option**: two overlapping tracks so the end fades out while the start fades in (no empty gap between passes).
- **Loader — headless API**: the built-in `renderUI` (custom DOM) and `onProgress` callback already allow full custom loaders; now the progress is also streamed to CSS variables `--kt-loader-progress` (0–1) and `--kt-loader-percent` (0–100) on the element, so a custom loader can be built in pure CSS. Built-in visuals stay restyleable via the `kt-loader-*` classes.
- **Lightbox — download button** (`download:true`) next to Share, and confirmed per-image thumbnail↔full-resolution: the thumbnail is the `<img src>`, the full image is `data-kt-src` (each image independent). Download fetches the full image as a blob (works cross-origin).

## [0.8.36]

- **overflowText — two new modes**: `fade` (pure page crossfade, no noise) and `scroll-fade` (scroll to the end, fade out, fade the start back in, repeat — a soft-looping marquee with no hard jump).
- **Hold — `mode:"mash"`** (button-mashing): each tap adds `step` and the fill `decay`s between taps, so rapid taps climb it to full — for games/UI mechanics. Also: fill is themeable via `color` / `--kt-hold-fill` and a `blend` (mix-blend-mode) option; new `instance.progress()`.
- **Accordion — `effect` option**: `blur` (blur + fade + height, default), `fade` (fade + height), or `none` (plain height, no opacity/blur).
- **Tabs — richer `effect`**: `fade` · `slide` · `blur` (blur-in) · `cross` (outgoing fades out, then incoming fades in) · `none` (instant, and the indicator no longer slides). The indicator is CSS-customizable (`--kt-tab-accent`, `--kt-tab-indicator-size`, or override `.kt-tabs__indicator`).
- **Reading Progress playground**: when `property` is a CSS variable (headless), the bar/ring `ui` options are hidden — switching them was clipping the custom-gauge demo.
- **Gesture — `origin` option** (transform-origin: center/top/bottom/left/right or any value) so the hover/press scale grows from where you want.
- **Toast**: type is now visually distinct via a small type-coloured dot (info/success/warning/error) instead of the removed border; `barColor` option (or `--kt-toast-bar`) for the progress colour; `progressBar` also accepts `"ring"`; `dismissible` toggles the close button; hardened the auto-dismiss timer so a stray hover can't make it vanish instantly.

## [0.8.35]

- **New module `data-kt-tooltip` (45 → 46)** — accessible, themeable tooltips: content from `content`/`title`/`aria-label`, `placement` (top/bottom/left/right, auto-flips at the viewport edge), `trigger` (hover / focus / click / manual), `delay` / `hideDelay`, `offset`, `duration`, `interactive`. role="tooltip" + aria-describedby, shows on keyboard focus, Esc closes. Theme with `--kt-tooltip-*`.
- **Toast progress option renamed** `progress` → **`progressBar`** (`data-kt-progress-bar`) — the old name collided with the `progress` module's `data-kt-progress` activation attribute, which was attaching a scroll-progress bar to the toast button (squished button, "Progress + Toast" panel, broken stacking/timing).
- **Class Hook (and all in-place) replay fixed**: the playground now replays via the instance's own `replay()` (no forced recreate), so `classOnly` reveals re-trigger their CSS transition.
- **Reading Progress — headless API**: set `property` to a CSS custom property (e.g. `--read`) to stream the 0–1 progress into it and render any custom shape from CSS; `onUpdate(value, el)` fires every frame. No built-in bar/ring required.
- **Bottom sheet** default now uses `light-dark()` + `color-scheme` so it adapts to the user's OS light/dark automatically (no site theming needed), still overridable via `--kt-sheet-bg` / `--kt-sheet-fg`.
- **Tooltip re-show fix**: it showed once then never again — `show()` cancelling a lingering hide animation fired that animation's `oncancel`, which re-hid the freshly-shown tooltip. `done` is now guarded by the visible state.
- **Rolling ticker replay fix**: replaying appended a second rolling viewport each time (stacked tracks, only the last animating). `buildRolling` now clears prior output first.
- **Toast**: `progressBar` now accepts `"ring"` for a circular countdown (as well as `"bar"`/`true`). The flicker/instant-dismiss users saw was the `data-kt-progress`↔`progress`-module collision, resolved by the `progressBar` rename in this release.
- **Composition note**: modules stack — e.g. `data-kt-magnetic data-kt-ripple` gives a magnetic button with a click ripple (demoed).

## [0.8.34]

- **Playground robustness (systemic)**: DOM-mutating modules (text-split, wrap, line-split, item-move) are now restored to their pristine snapshot before each live rebuild (keeping the current option values), so toggling options no longer leaves a demo broken until Reset. Stacked containers (e.g. ambient over lazy) are skipped to avoid wiping an inner module.
- **Full destroy() audit of all 45 modules** for restore-completeness. Fixes found:
  - **`loader`**: the page-fill overlay was never removed on destroy and accumulated on every recreate; also guarded against removing the host element when a custom `renderUI` returns no root.
  - **`hold`**: now restores the element's `position`/`overflow` and clears `kt-hold-confirmed` / `aria-pressed` on destroy.
  - **`cardGlow`**: restores the inline `position` it promoted onto child elements.
- **`coverReveal`**: `lines` mode on an element with no text (e.g. an image) now falls back to a whole-element block cover instead of blanking it; original text is restored on destroy.

## [0.8.33]

- **2 new Motion-benchmarked modules (43 → 45)**:
  - **`data-kt-gesture`** — whileHover / whileTap feedback: springs up (+ optional `lift`) on hover/focus, presses down on pointer/Enter/Space. Options: `hoverScale`, `tapScale`, `lift`, `duration`, `ease`. Keyboard-accessible; no-op under reduced motion.
  - **`data-kt-drag`** — draggable with `axis` lock, `bounds:"parent"` containment, `snapBack` spring-return, `inertia` momentum, and a `handle` selector. Focus + arrow keys nudge (Shift = larger). Reduced motion keeps drag, drops momentum.
- **Cursor**: empty cursor holders (`<div data-kt-cursor>` with no children/text) are now treated as **global** automatically, so the native OS cursor is reliably hidden (a stretched empty holder was being mis-detected as a scoped container).
- **Demo i18n**: language switch no longer breaks Replay — module-bearing elements (e.g. the text `coverReveal`) are excluded from the translation pass that rewrites paragraph HTML.
- All README translations (ko/jp/zh-CN/zh-TW/ru/it) and AI-PROMPT-GUIDE updated to 45 modules.

- **Radial carousel**: prev/next now advance on a single click (the pointer-capture that stole clicks is gone), wrap-around items jump instantly instead of sweeping across the arc, and the `left`/`right` dock focal angles are corrected (items were landing off-screen).
- **Cover reveal**: load-aware — when wrapping an `<img>` that isn't decoded yet it waits for load before sweeping (`waitForImage`, default on), so it never uncovers a blank frame; inherits the element's `border-radius` so panels clip to rounded corners; text (`lines`) mode split fixed to real rendered lines with sequential per-line reveal and 2-layer support.
- **Mega-menu**: the open/close indicator is now a clean SVG chevron (was a crude CSS border caret); ↑/↓ move between links in an open panel.
- **Accordion (demo)**: header padding moved onto `<summary>` so the whole header row toggles, not just the text.
- **Toast**: progress-bar default colour is the key orange (not the green type accent); demo button no longer squished.
- **Cursor (demo)**: inner dot grows on hover (instead of scaling the outer ring); thinner, slightly translucent ring; inverts over content via `mix-blend-mode`.
- **Demo**: hero no longer drifts with the pointer.

## [0.8.32]

- **New module `data-kt-cover-reveal` (42 → 43)**: one or two coloured panels cover an element and sweep away when it scrolls into view — a block/curtain reveal. Options: `color`, `color2`, `direction`, `duration`, `delay`, `ease`, `layers` (1–3), `stagger`, `threshold`.
- **Hold-to-confirm now performs the action** on completion, so it's usable without extra wiring: an `<a href>` navigates, a submit button (or `submit:true` / `data-kt-hold-submit`) submits the closest form, and `action="#selector"` clicks that element. The `kt-hold-confirm` event is cancelable (preventDefault to skip), and `onComplete(el)` still fires. Opt out with `submit:false`.
- **Toast**: opt-in countdown **progress bar** (`progress:true`, colour `--kt-toast-bar`/`--kt-toast-accent`) that pauses with the timer on hover; a **stack limit** (`max`, default 5) that evicts the oldest; multiple toasts stack with spacing. Position, size, colours and layout stay CSS-customizable (`--kt-toast-*`).
- **Cursor**: the demo cursor is reworked to match a proper reference — a small dot + smoothly-lagging outlined ring that inverts over content (`mix-blend-mode:difference`) and expands over links (dot hides). All via existing options (`hoverScale`, `hoverEffect`, `hideDotOnHover`, `mixBlendMode`, `borderWidth`).
- **Demo**: removed the pointer-parallax drift from the hero (the main content no longer moves with the mouse).
- **Lightbox `crossfade` fixed**: it was identical to `fade`. It now does a true cross-dissolve (outgoing frame fades out over the incoming one), distinct from `fade` (incoming only) and `dissolve` (blur).
- **Bottom sheet backdrop fix**: no more flash to full black then settle — the fade now targets the configured `backdropOpacity`, and that value is applied to the backdrop element itself (it was previously set where it couldn't reach it, so the option was ignored).
- **Mega-menu keyboard**: ↑/↓ now move between links inside an open panel (in addition to ←/→ across top items, Enter/Space/↓ to open, Esc to close).
- **Radial carousel geometry fixed**: the items were mis-positioned; the orbit transform origin and centering order are corrected so items sit on the arc.
- **Mouse Parallax**: reverted the global default multiplier to its original subtle value (the earlier change made the demo hero drift with the pointer). The demo's dedicated parallax card sets `speed` explicitly instead.

## [0.8.31]

- **New module `data-kt-radial` — radial / circular carousel (41 → 42)**: items orbit a hub docked to any edge (`position: bottom | top | left | right`) so only the focal arc shows. Rotate via prev/next, click an item, drag, autoplay, or ←/→. Accessible (role=group, aria-current, live region), reduced-motion snaps. Options: `radius`, `step`, `activeAngle`, `position`, `duration`, `loop`, `drag`, `controls`, `autoplay`.
- **Mega-menu / GNB — real-world options**:
  - Per-item trigger override: `<li data-kt-menu-trigger="click">` mixes click dropdowns with hover mega-menus in one bar.
  - Hover zone: `<li data-kt-menu-open="#selector">` opens that item when the pointer enters any matching element (e.g. a banner opens the mega).
  - `indicator: "chevron" | "plus"` shows an open/close icon on each trigger (state = aria-expanded).
  - **Fixed the broken mega layout**: a mega `<li>` is now a static container so its panel spans the whole bar (not the narrow item) — the collapsed/overlapping columns are gone.
  - **Ships clean default styling** for panel links (no raw browser blue/underline), list resets, focus rings — themeable via `--kt-menu-accent` / `--kt-menu-hover-bg`.
- **Lightbox — `transition` option** for the image change effect: `rise` (default) · `fade` / `crossfade` · `dissolve` · `slide` (direction-aware) · `zoom` · `none`.
- **Bottom sheet fixes**: reopening after close now works (the close animation's `oncancel` no longer hides a freshly reopened sheet). Backdrop is fully themeable — colour (`--kt-sheet-backdrop-bg`), opacity (`backdropOpacity`), and blur (`--kt-sheet-backdrop-blur`); width via `--kt-sheet-width`.
- **Toast**: removed the default left accent border (opt-in only now).
- Playground: radialCarousel, the new megaMenu `indicator`, and the lightbox `transition` are all exposed as live controls with copyable code.

## [0.8.30]

- **3 new modules (38 → 41)**:
  - **`data-kt-toast`** — transient status notifications in a shared live region (`role="status"`, or `"alert"` for warning/error), auto-dismiss with hover/focus pause, dismiss button, imperative `instance.show(msg, overrides)`. Options: `type`, `position`, `duration`, `dismissible`, `message`. Themeable via `.kt-toast*` / CSS variables.
  - **`data-kt-bottom-sheet`** — panel that slides up from the bottom with backdrop, drag-to-dismiss handle, Esc/backdrop close, focus trap and focus return. Triggers via `data-kt-sheet-trigger="#id"`. Options: `backdrop`, `backdropOpacity`, `dismissible`, `handle`, `duration`, `trigger`.
  - **`data-kt-tabs`** — WAI-ARIA / KRDS tab pattern: roving tabindex, ←/→ (↑/↓ vertical), Home/End, `automatic`/`manual` activation, animated indicator, panel fade/slide. Options: `activation`, `orientation`, `effect`, `indicator`, `duration`.
- **Playground: every new component is now fully customizable + copyable.** confetti, hold, accordion, megaMenu, toast, bottomSheet and tabs were added to the playground registry, so each demo card now has the live "Customize & copy code" drawer with option controls and HTML/JS copy — previously confetti and the others had no options panel at all.
- **Mouse Parallax fix**: the default per-layer multiplier was `0.05`, so `maxX`/`maxY` produced only ~1px of movement (effectively invisible). Default is now `1` — `maxX`/`maxY` are the real travel in px; layered depth stays opt-in per child via `data-mp-speed`.
- **Accordion**: cleaner default chevron (SVG-mask caret, vertically centred) and a new `arrowPosition:"left" | "right"` option (`.kt-accordion--arrow-left`).
- **Mega-menu**: fixed the broken demo layout — panels are dropdowns by default and only go full-width when the `<li>` has `.kt-menu-mega` (or `layout:"mega"`); removed the hover gap between trigger and panel.
- **AI-PROMPT-GUIDE.md**: added all seven UI/interaction modules (accordion, confetti, hold, megaMenu, toast, bottomSheet, tabs) to the module lists, the intent→module table, and a new customization cheat-sheet.

## [0.8.29]

- **New module `data-kt-mega-menu` (37 → 38)** — accessible GNB / mega-menu navigation. Hover-to-open dropdowns (Korean GNB style) or full-width mega panels (`layout:"mega"`), one open at a time. Progressive enhancement over a plain nested `<ul>`; full keyboard support (Enter/Space/↓ open, Esc close & return focus, ←/→ move between top items), automatic `aria-haspopup` / `aria-expanded` / `aria-controls`, outside-click & Esc to close, `openDelay` / `closeDelay` / `duration` / `trigger`.
- **Confetti — `trigger:"view"`**: fires once when the element scrolls into view, for success / completion screens where the burst should go off in the background on arrival. Colours, count, gravity, spread, and scalar remain fully customizable (e.g. a monochrome dark-mode palette).
- **Accordion — CSS theming hooks**: the open item now gets a `.kt-open` class and the trigger a `.kt-accordion-summary` class. A default rotating chevron ships in the stylesheet, themeable via `--kt-accordion-arrow`, `--kt-accordion-arrow-size`, `--kt-accordion-arrow-weight`, `--kt-accordion-arrow-duration`, or replaceable by restyling `.kt-accordion-summary::after`.
- **Demo — section re-categorization**: added a dedicated **Components** section (11) for disclosure / navigation UI; Accordion moved there out of "Content Entrance", Mega-menu added. Confetti and Hold cards now expose their options; corrected the stale "34 modules" labels to 38.

## [0.8.28]

- **3 new modules (34 → 37)** — filling gaps benchmarked against Motion UI / Toss, all attribute-driven, a11y-aware, progressively enhanced:
  - **`data-kt-accordion`**: animates native `<details>`/`<summary>` with a springy height morph + blur-in, keeping keyboard & aria; `single` (one-open), `duration`, `ease`, `blur`. Reduced motion leaves the native (instant) accordion.
  - **`data-kt-confetti`**: canvas celebration burst on click / `trigger:"auto"` / manual `.fire()`; `count`, `spread`, `colors`, `duration`, `gravity`, `scalar`. Skipped under reduced motion; the rAF loop stops once particles die.
  - **`data-kt-hold`**: hold-to-confirm control with a sweeping fill; fires a `kt-hold-confirm` event + `onComplete`, rewinds on early release; pointer + keyboard.
- **Ambient video — follows the frame, not just play state**: the glow now fades in with the first decodable frame (poster/paused frame included), keeps showing the frozen frame on pause/end, and only fades out when the video truly shows nothing (source cleared).
- **Demo — spacing fix**: standalone full-width cards in a section (e.g. "Scroll text fill" + "Direction responsive") were glued together with no gap; consecutive section-level cards/grids now share the 16px grid rhythm. New Accordion / Confetti / Hold-to-confirm demo cards added.

## [0.8.27]

- **Lazy pixelate — film-grain noise (Pixel-Mosaic parity)**: the pixel-mosaic reveal now composites monochrome noise that fades out as the picture resolves, matching the standalone Pixel-Mosaic-Lazy-Loader. On by default; `data-kt-noise="false"` (or `0`) disables it, a number sets peak opacity. Steps / stepCount / explicit px steps already worked.
- **Ambient media — synced to the media**: the glow starts hidden and fades in with the content — images fade in when their clone decodes; videos fade in on play, out on pause/end, and only sample while actually playing (YouTube-style). No more blurred backdrop sitting over a blank/paused box.
- **Optimization**: reveal releases its `will-change` GPU layer on completion; the ambient video sampler uses a desynchronized canvas. (Existing modern patterns kept: IntersectionObserver gating, rAF fps caps, DPR caps, off-screen/hidden-tab pause.)

## [0.8.26]

- **Docs — iOS `viewport-fit=cover` note**: README (+ all 6 translations) and AI-PROMPT-GUIDE now tell consumers to add `viewport-fit=cover` so full-screen effects reach under the notch & home bar.

## [0.8.25 audit]

- **Fix — clip/mask on iOS Safari (audit)**: every clip-path animation now also sets `-webkit-clip-path` so iOS repaints intermediate frames instead of popping to the end — reveal wipe/mask (gsap), loader exit wipe/mask (CSS transition), and the textTransition / overflowText / glitch WAAPI keyframes. Full-screen overlays (loader, pageReveal, pageTransition) are `position:fixed;inset:0`, so they cover the notch & home-bar when the host page uses `viewport-fit=cover`.

## [0.8.24]

- **Demo — iOS notch & home-bar**: `viewport-fit=cover` + a `theme-color` meta (kept in sync with the light/dark toggle) + base bg on `<html>` + safe-area padding on the header, so the notch and home-bar areas match the page instead of showing mismatched colors — including the intro loader, whose orange fill now reaches the screen edges (theme-color also tinted to the intro canvas while it plays).
- **Fix — lazy blur-up/fade/polaroid replay**: these animate the <img> via a CSS transition that lingered after the first run, so on replay the start value animated and immediately cancelled the reveal (nothing visible). The transition is now reset + a reflow forced before each run, so replay re-animates from the start.

## [0.8.23]

- **Fix — Wipe/mask stayed blank (real bug)**: the clip branch referenced `ease` before its declaration (TDZ), so `play()` threw and the clip never animated — the element stayed fully clipped (white). ease is now computed inside the branch; wipe reveals correctly.

## [0.8.22]

- **Demo deploy — moving alias + purge script**: the site used a moving version alias; run `npm run purge` after publishing to flush the jsDelivr cache so the newest build shows immediately.

## [0.8.21]

- **Demo deploy — pin exact version (fixes stale fixes)**: the generated site switched from a moving version alias to `@<version>`. jsDelivr can cache moving aliases for hours or days, so published library fixes (wipe, slider loop, counter…) kept serving an old bundle on the demo. Pinning the immutable exact version loads each release fresh, no purge needed.

## [0.8.20]

- **Fix — progress ring off-center (root cause)**: a mobile `@media` rule lifted *every* `.kt-progress-ring` with `bottom:calc(...)!important`, shoving the in-card static ring up ~78px. Scoped it to `body>.kt-progress-ring` so only the floating corner ring is lifted; the demo ring now centers.

## [0.8.19]

- **Demo — progress ring centered (absolute fill)**: the ring container now absolutely fills its stage and grid-centers, independent of any flex/grid height quirks, so the indicator is dead-center on mobile.

## [0.8.18]

- **Fix — horizontal pinned deck clipped**: the horizontal sticky-stack deck used `vh` for its height, so on mobile the bottom of a panel was clipped while scrolling down (URL bar showing). It now uses `svh` so panels always fit.
- **Fix — mobile pinned-scroll bounce**: ScrollTrigger no longer refreshes on the mobile URL-bar show/hide resize (`ignoreMobileResize`), so sticky-stack / scroll-sequence sections stop jumping the page down to the footer.
- **Demo — progress ring centered (for real)**: the ring stage now flex-centers, fixing the indicator being clipped at the top on mobile.

## [0.8.17]

- **Demo — progress ring truly centered**: the ring stage now fills its cell and grid-centers the indicator, so it sits dead-center vertically on mobile instead of drifting up.

## [0.8.16]

- **Demo — first-screen snap only after content is seen**: the hero→first-section snap now waits until the hero is fully scrolled into view, so a hero taller than the viewport (low-res / small window) reveals its cut-off content by normal scroll before snapping instead of jumping straight past it.
- **Demo — iOS motion button removed**: the built-in permission gate grants DeviceOrientation on the first genuine tap, so tilt + compass work without the extra button.

## [0.8.15]

- **Demo — Fullpage inner-scroll shown**: the "Fullpage Sections" demo now has a long section (02) that scrolls its own content before paging to the next, demonstrating the inner-scroll-then-advance behavior added in 0.8.13.

## [0.8.14]

- **Wipe/mask — actually animates now**: the real cause was that the bundled gsap won't tween a `clip-path: inset()` string (it stayed frozen fully-clipped = blank). Wipe/mask now run on a numeric proxy tween and build the inset string in onUpdate, so the reveal always plays (via ScrollTrigger or the IntersectionObserver backup) and on replay.
- **Lazy replay on Safari/iOS**: `preload` now resolves immediately for an already-cached image (Safari doesn't re-fire `onload` for a cached src), so BlurUp/Fade replay no longer hangs.
- **Demo — mobile notice keeps the border**: the touch “desktop only” overlay redraws the stage's 1px border so cards don't look broken.
- **Demo — progress ring centered**: the ring stage uses explicit flex centering so the indicator sits dead-center on mobile.
- **Demo — motion button placement**: the iOS “모션 센서 켜기” button sits above the bottom bar and fades out over the footer so it never overlaps it (still auto-dismisses after granting).

## [0.8.13]

- **Reveal — reliable entrance (fixes stuck Wipe)**: an IntersectionObserver backup now guarantees a reveal plays when it actually enters the viewport, even if ScrollTrigger measured its position before images/intro settled or the element was already on screen. Wipe no longer stays blank.
- **Slider — two loop styles**: `loop:'infinite'` (or `true`) endlessly wraps seamlessly; `loop:'rewind'` plays to the last slide then returns to the first; `loop:'off'` disables.
- **Counter (split-flap) — up & down**: the flip counter supports decreasing values (folds up) as well as increasing (folds down), following `from`→`to`.
- **Lazy skeleton/pulse — no icon ghost**: the pulse opacity keyframe is stopped before the fade-out, so the skeleton + icon disappear cleanly instead of lingering over the loaded image.
- **Fullpage — auto-advance + inner scroll**: new `autoAdvance` (ms) steps sections on a timer (pauses when hidden, resets on manual nav); a section taller than the viewport scrolls its own content before the deck pages on.
- **iOS — motion enable button** and **mobile demo polish**: a visible “모션 센서 켜기” button guarantees a valid tap to grant DeviceOrientation; pointer-only demos show a dimmed “desktop only” notice on touch; progress ring centers vertically; `scrollbar-gutter` is desktop-only to reduce mobile scroll jitter.

## [0.8.12]

- **iOS gyroscope — retry until granted**: the motion-permission gate now retries on each genuine tap (a first tap that turns into a scroll no longer permanently gives up) and listens in the capture phase, using `click`/`touchend`.

## [0.8.11]

- **Packaging — leaner tarball**: `.DS_Store` and stray `.fuse_hidden*` filesystem artifacts are excluded from the published package via negation patterns in the `files` list (a plain `.npmignore` is bypassed when `files` whitelists whole folders). Publish size dropped and no junk files ship.

## [0.8.10]

- **Fix — iOS gyroscope (tilt + compass)**: motion effects stopped working on iOS because the DeviceOrientation permission was requested per-element from `pointerdown`, which recent WebKit no longer treats as a valid user-activation for the permission prompt. There is now one shared permission gate triggered by the first `click`/`touchend` anywhere on the page, so a single tap unlocks the gyroscope for every tilt and compass element at once.

## [0.8.9]

- **Counter (slot) — direction follows the count**: a decreasing counter (e.g. a 34,000 → 10,000 discount) now rolls its digits downward (new digits drop in from above), while an increasing counter still rolls upward. Previously every reel scrolled up regardless of direction.
- **Demo — narrow-phone responsiveness**: the card grid drops to a single fluid column below 560px (the old `minmax(330px,…)` forced horizontal overflow that clipped cards and the overflow-text bar on iPhone-width screens), the overflow-text bar is now fluid, and the settings drawer gets a dedicated ≤480px layout (single-column controls, tighter gutters, wrapping header actions).

## [0.8.8]

- **Fix — `replay()` now works for on-screen elements**: `Kineto.replay()` used to destroy and recreate the instance, which built a fresh ScrollTrigger that never fires `onEnter` for an element already in view — so reveal effects stayed frozen at their start (e.g. `wipe` showed a blank/white box, `class` hooks did nothing). Replay now calls the instance's own `replay()` in place, and reveal's replay plays the entrance as a one-shot independent of the scroll trigger.
- **Slider / Coverflow — true infinite loop**: `loop` now cycles seamlessly in both directions with no snap-back at the ends. Slides are rendered at their shortest distance around a ring (no cloned DOM nodes), so drag, buttons, keyboard and autoplay all wrap continuously. `loop` stays an opt-in option (off by default).
- **Cursor (orbit) — press feedback**: while the orbit ring is bloomed over a hover target, pressing now contracts it by `pressScale` so a click is felt.
- **Lightbox — share no longer closes the viewer**: dismissing the native share sheet by clicking the page previously registered as a backdrop click and closed the lightbox; close is now suppressed while sharing (and briefly after).
- **Demo — intro scroll lock restored**: scrolling is locked at the root while the intro is up, so lazy images loading in behind it no longer shift the layout and jolt the scroll position when the intro releases.
- **Demo — no layout jank on overflow toggle**: `scrollbar-gutter: stable` reserves the scrollbar's width, so toggling `overflow:hidden` (intro, sitemap, lightbox) no longer changes the page width.

## [0.8.7]

- **Lightbox — share, editable zoom, swipe, EXIF**: opt-in `share` button (Web Share API, falls back to copying the URL); click the zoom percentage to type an exact value (double-click resets); swipe left/right to change image on touch when not zoomed; opt-in `exif` reads camera/exposure tags from the file and appends them to the info line (best-effort — silently skipped when absent or CORS-blocked).
- **Higher-quality CRT / VCR**: added an RGB aperture-grille (phosphor stripes), softer vignette, a gentle non-strobe flicker and a slow refresh sweep; VCR now has analogue SVG-turbulence noise, chromatic bleed and a tracking band. CRT power-on toned down — removed the horizontal flip/overstretch and softened the roll bar and overexposure.
- **Demo — sitemap centering**: the Module Index overlay now opens centred on screen; header icon button vertically aligned.

- **Continuous CRT / VCR effect** (`data-kt-glitch="crt"` / `"vcr"` on an image): a CSS overlay with 1px scanlines, a sweeping roll bar, vignette and flicker; VCR adds tracking noise and a picture jitter. Lightweight (no canvas). Added to the Media & UI demo.
- **Fix — glitch no longer destroys images**: text glitch presets (rgb/noise) applied to an image (or any element without text) previously blanked the content to grey; they now no-op safely. Any glitch preset is safe on any target.
- **CRT power-on (`lazy` crt)**: added black roll bars sweeping up/down as the picture powers on, for a more convincing tube feel.
- **Card Glow — press / tap reaction**: pressing/tapping moves the light to the touch point and pulses a brightness burst (touch + corner taps get a response without hover).
- **Demo — Module Index sitemap**: a header button opens a full overview of every section; each entry jumps straight to that module (in-page anchors, no page transition).
- **Playground selects**: restored the dropdown arrow in the options drawer (a `background` shorthand was wiping the arrow image) and gave the value room on the right.

## [0.8.5]

- **New `lazy` effect — `crt`**: old CRT / cathode-ray TV power-on. A bright line snaps open, the picture expands vertically out of it with an overexposed bloom, then settles behind a faint scanline overlay. Added to the demo and the playground effect list.
- **Lightbox mobile toolbar**: on narrow screens the centered `1 / N` counter overlapped the zoom/close controls — it now drops into flow so the counter sits left and the controls right (no overlap); zoom/close buttons are square.
- **Demo mobile fixes**: lightbox thumbnail grid no longer overlaps (robust 2-column, square thumbnails); the ripple sample is more visible (higher opacity) so the effect reads on touch.
- **Tooling — CDN demo generator**: `npm run demo:cdn` (also part of `npm run build`) regenerates a deploy-ready `site/` copy of the demo with the Kineto script/style pinned to the exact CDN version — no more hand-editing the public demo on every update, and no stale-cache surprises. `site/` is git-ignored (build output).
- **README**: added an "AI vibe-coding" credit line to the footer of all seven language READMEs.

## [0.8.4]

- **ambientMedia performance**: the video-sampling loop now pauses when the element scrolls off-screen or the tab is hidden (IntersectionObserver + visibilitychange), instead of sampling every frame forever. Cuts background work on long pages and weaker mobile GPUs.
- **Demo**: lighter `backdrop-filter` blur on mobile (8px instead of 20px) to reduce Android scroll jank; hidden scrollbar on the fullpage "first-slide" host; header language select / theme switch vertically centered; dark-mode toggle knob given more contrast; guarded against stray horizontal scroll.
- **Repo hygiene**: `tests/` untracked (kept locally, ignored) and the duplicate root `README.ko.md` removed (Korean lives in `i18n/`).

## [0.8.3]

- **GSAP conflict when a CDN copy is also loaded**: Kineto bundles gsap + ScrollTrigger, but if the host page also loaded gsap from a CDN there were two gsap instances — ScrollTrigger registered on one while Kineto animated on the other, so every scrollTrigger tween failed ("Invalid property scrollTrigger … Missing plugin? gsap.registerPlugin()") and scroll-sequence, sticky-stack (floating/horizontal scale-fade), parallax scrub and textFill silently stopped. Kineto now prefers the gsap/ScrollTrigger already present on the page and registers the plugin, so loading them from a CDN no longer breaks anything (loading them is unnecessary either way).
- **Fullpage swipe on mobile**: vertical and mixed-axis decks now use `touch-action:none` and hand the gesture off to the outer scroll themselves at the first/last section, so swipes are captured reliably instead of competing with the page's native scroll — without trapping the page at the edges.
- **Playground**: pressing Apply on a touch device now gives a short success haptic.
- **Ripple on touch devices**: the click-ripple was suppressed on some mobile browsers because touch `pointerdown` can report a non-zero `button`. The guard now only ignores secondary *mouse* buttons, so taps on phones (iOS Safari, Android Chrome) trigger the ripple.
- **npm README fix**: the npm package now ships only the English `README.md`, so the package page reliably shows it instead of arbitrarily picking one of the translated `README.*.md` files. All translations remain available in the GitHub repository.

## [0.8.2]

- **Brand consistency**: replaced the remaining all-caps `MOTIONKIT` strings — including the default `cursor` ring/orbit/snake text shipped in the library — with `KINETO`. Demo header, title, and footer updated to the current version.
- **README**: English is the default README with the other languages linked; added the five headline effect previews (GIF) and a short note on the origin of the name (from *kinetic* / Greek *kínēsis*, "motion").

## [0.8.1]

- **Fix: framework adapters resolve the scoped package.** The React, Vue, and jQuery adapters imported the core as `kineto`; after the rename to `@dong-gri/kineto` that no longer resolved, breaking adapter users on 0.8.0. They now import `@dong-gri/kineto`.
- Removed a stray duplicated `demo/kineto/` directory from the package.

## [0.8.0 development archive]

### Added / Changed (release prep)

- **Counter `from`**: counters can start from any value, not just 0, and animate up or down to `to` (e.g. a 34,000 → 10,000 discount). `plain` tweens the value; `slot` rolls each digit reel from the start digit to the target in the correct direction. Exposed in the demo playground and shown in a new "Discount" card.
- **Fullpage scroll hand-off (Chrome mouse wheel)**: restored `overscroll-behavior:contain` on the pager to stop the compositor from chain-scrolling the parent on uncancelable wheel events, and drive the outer scroll manually at the edges so nothing gets trapped. Normalises `deltaMode` (line/page → px) for mice that don't report pixels. Inside a scroll container the deck only takes over once it is fully pinned, so scrolling back up lets the parent rise first.
- **Safari `file://` fix**: removed `?v=` cache-buster query strings from local demo resources — Safari refuses query strings on `file://` URLs, which had blocked the whole bundle from loading. The demo intro loader also has a failsafe so it can never leave the page blank.
- **Header (dark mode)**: the brand button now sets its own `color` (buttons don't inherit it), so the wordmark is visible in dark mode.
- **Release packaging**: package renamed to `@dong-gri/kineto` with repository/homepage/bugs/keywords and `publishConfig.access: public`; READMEs (ko/en/ja) rewritten; added `PUBLISH-GUIDE.md` and `VSCODE-GUIDE.md`; removed the stale `kineto-0.5.1-stabilized` snapshot and stray `.DS_Store` files.

### Changed / Added (round 24 — inline options panel & polish)

- **Options are a wide floating dock with a spotlight.** The panel is a wide bottom dock; the card being edited is lifted above a light dim (no blur on the example) and scrolled into view, so you watch the live effect while adjusting. Toss/Supabase-style layout: grouped setting cards, label + value on one row, boolean toggles as switches, focus rings, and the code preview tucked into a collapsible "코드 보기" drawer. Actions (Replay/Apply/Reset/close) live in a sticky head; the sheet keeps its rounded top.
- **Fullpage — real mixed axis.** A single sequence can change direction per step: `axis:"mixed"` with `data-kt-fp-axis="x|y"` on each section (e.g. A→B→C horizontal, C→D vertical). Sections are placed on a 2D grid and the track translates in both axes. Added to the playground axis select.
- **Fullpage coexists with normal scroll.** At an edge it can't move toward, the wheel gesture is now fully released — even mid-gesture — so an outer scroll container or the page takes over. New demo: two slides that hand off to a normal-scroll area + footer ("첫 화면만 슬라이드").
- **Cursor orbit** demo now has a hover target so the ellipse→circle bloom is visible; **cursor image** demo shows the click burst (`clickSprite`/`clickImage` fire on click for any cursor type).
- **Glitch** gains a `reveal` preset: the flicker/decode-in load effect as a one-shot on an image, with its own `duration`.
- **Haptic** buttons show a toast on PC/iOS explaining vibration only fires on supported (mainly Android) hardware, instead of silently doing nothing.
- The Customize summary now scrolls long / translated module names with Kineto's own overflowText instead of clipping them.
- Lightbox Viewer grid rows trimmed to a fixed height so images no longer overlap the Customize summary.
- **Brand symbol.** New Kineto mark (`assets/logo.svg` / `demo/favicon.svg`) — a rounded tile with an object tracing an easing curve and a fading motion trail. Wired into the demo header (replacing the plain square), the favicon, and all READMEs.
- **Reusable toast** (`window.ktToast(msg)`): multi-line via `\n`, always centered, one shared component. Used by the copy buttons ("복사되었습니다"), Apply/Reset/Replay, and the Haptic-unsupported hint.
- **Fullpage release fix.** Dropped `overscroll-behavior:contain` on the container — because it's an overflow:hidden scroll container, `contain` was blocking wheel chaining and trapping the gesture. The wheel handoff is now gesture-scoped: while the deck can move, a whole flick is hijacked (one step, outer never scrolls); the outer scroller only takes over on a *fresh* gesture once the deck is exhausted — so fullpage and page never scroll at the same time. The coexistence demo fills its host and its normal-scroll area has a warm tint so it no longer reads as an error.
- **Lightbox fade speed fix.** When a lightbox shares `data-kt-duration` with another module on the same element (e.g. a lazy loader), the loader's long duration used to bleed into the backdrop fade. New `lightboxDuration` option (`data-kt-lightbox-duration`) overrides just the viewer fade; default lowered to 0.12s. The ambient/animated demo lightboxes now open/close at the same speed as the Lightbox Viewer.

### Fixed / Added (round 23 — media fixes, real photos & cursor hover)

- **ambientMedia no longer breaks on option change**: live edits rebuild only the edited module (single `rebuildModule`), so a stacked card (ambient over a lazy image + lightbox) never tears its own subtree out. Full "Apply" tears down then recreates inner-before-container.
- Lightbox demo opens fast (gallery `duration:0.12`, entry animation 240→170ms).
- Cursor image/custom react to hover: `hoverSrc` swaps the image, `hoverTemplate` swaps the custom HTML, `hoverClass` adds a class for your own CSS. Demo Image/Custom cards show it (image swap, DRAG→OPEN).
- **Real photo gallery**: 6 supplied images optimized to webp (28–64KB) and wired into the Lightbox Viewer (now 6, tidy 3-col grid, no overlap with the panel), Slider/Coverflow, Image Glitch, Brush Reveal and all Image Loading Effects cards.
- The Customize summary module name uses Kineto's own overflowText (bounce, pause on hover) when it's wider than its slot — also covers longer translated strings.

### Added (round 22 — counter/cursor customization & drawer notes)

- Counter flip (incl. clock/countdown): `seamColor` (fold-line color), `shadow` (toggle/custom drop-shadow), and `separatorColor` (comma/colon color) — all also overridable via CSS vars `--kt-counter-seam`, `--kt-counter-flip-shadow`, `--kt-counter-separator`.
- Cursor **snake**: eased, gentler shrink (`snakeMinScale`, sqrt curve) so glyphs stay legible instead of collapsing instantly.
- Cursor **orbit**: blooms from a flat ellipse into a larger full circle on hover over links (`orbitHoverScale`).
- Cursor **image / custom**: added demo cards + full tooltips (the HELP set never had a `cursor` module before — now ko/en, others fall back to en), with `src/width/height` and `template` exposed in the panel.
- clickSprite already auto-detects frame size/count; the demo now omits explicit sizes to show it, and the verbose sprite-sheet explanation moved into the drawer as a `data-kt-note` block (a reusable "notes in the settings drawer" mechanism).

### Changed (round 21 — full i18n tooltips, scramble & footer)

- Option `?` tooltips are now translated in **all 7 languages** (ko/en/ja/zh-CN/zh-TW/ru/it, 291 entries each, full key parity) in `demo/help-i18n.js`, switching live with the language selector.
- Scramble: `scrambleFade` now takes precedence over `rainbow` — when fade is on, scrambling uses brightness only (no color). `textReveal` flicker mode no longer applies rainbow (decode only).
- Settings apply is fail-safe: options the current preset doesn't support (WHEN-hidden) are dropped before create, and a bad combo can't blank the demo — it restores the captured defaults with a note.
- Intro loader percentage is black on a light brand canvas (no more cyan difference blend); GitHub buttons use the Phosphor GitHub icon; footer rewritten in natural Korean with a line break, `dongri.me` creator link, MIT + "AI 바이브코딩으로 제작" note (also in README).

### Added (round 20 — release packaging & demo polish)

- **Minified distributables + CDN**: `npm run build` now also emits `dist/kineto.min.js` (ESM, rolldown-minified, gzip ~62KB), `dist/kineto.umd.min.js` (CDN drop-in) and `dist/kineto.min.css`. `package.json` `unpkg`/`jsdelivr` fields point at the min UMD, and `exports` adds `./min` and `./umd`.
- **README bundle documentation**: a "번들 · 배포 포맷" table (file / format / use / gzip size) plus CDN (`jsdelivr`/`unpkg`), ESM CDN (`/+esm`), and optional GSAP/Lenis snippets; demo install box points at the npm CDN paths.
- **Tooltip i18n**: option `?` tooltips are now multilingual (`demo/help-i18n.js`, Korean + full English, 291 entries) and follow the language selector with per-key English→Korean fallback (ja/zh/ru/it fall back to English).
- **Phosphor Icons** across the demo chrome (via jsDelivr CDN): replay FABs, theme switch (sun/moon), hero support icons — replacing the hand-rolled inline SVGs that overlapped/looked off. The library itself stays icon-font-free (zero dependencies).
- **Intro loader redesign**: oversized thin Wanted Sans percentage (clamp up to 14rem, weight 100), a `KINETO` monospace wordmark, and `difference` blend so the number stays vivid over both the dark start and the rising orange fill.

### Fixed (round 19 — release QA)

- Intro loader was invisible on fast/cached loads twice over: the "already loaded → skip" branch always won on file://, and the whole-page fade veil (`body{opacity:0}`) also hid the loader overlay. The loader now always shows (resolved promise + minDuration) and the fade veil only covers the content containers (header/layout/footer), never the overlay.
- Loader scroll lock now locks the **root scroller** too (body overflow alone doesn't propagate when `<html>` has `overflow-x:clip`) and restores both on exit/destroy — applies to every loader, not just the intro.
- Intro percentage set in thin Wanted Sans (variable weight 100, tabular numerals) — `!important`ed over the module's inline slot typography.
- demo-qa waits for the deferred module boot before asserting.
- **Release QA sweep** (headless, full demo): 40 replay FABs, 87 option panels opened/changed/closed, lightbox open→nav→zoom→reset→close, 3 loaders with scroll-lock/restore, page reveals, fullpage round-trip, slider next/prev, 7-language cycle, theme round-trip, `Kineto.destroy()` → 0 instances → re-init — **zero page/console errors**. Full suite green: contract 34, owner requirements 46, package surface, utils/SSR, browser smoke; demo-qa passes except the sandbox-only H.264 video assert.

### Added (round 18 — demo split, Page Reveal panel & fixes)

- Demo split into `index.html` / `styles.css` / `main.js` (pre-paint theme/preload scripts stay inline by design); QA/requirement tests read the split files.
- Page Reveal card gained a full Customize panel (effect/direction/duration/delay/colors/pieces/stagger/angle) — the effect buttons and the panel share the same options.
- Loader: `exit:'slide'` is directional now (exitDirection or the fill direction), and `exit:'wipe'` actually sweeps — the mask transition had no start state, so it snapped instead of animating.
- Scramble options broke when the painter moved into utils (the option names vanished from the modules' contract extraction, so the playground filtered `data-kt-rainbow` & co. away) — modules now pass the options explicitly; rainbow / palette-range / fade all work from the drawer.
- Drawer field show/hide had silently stopped (descriptor kind guard was too broad) — WHEN-based visibility works again for every module.
- Mobile: the hero column was locked at 640px by its content and got clipped — it now stretches to the container (100%/min-width:0), verified at 390px.
- First visit: the whole page fades in (0.65s) the moment the preload veil lifts, with the entrance choreography playing underneath (skipped under reduced motion).

### Added (round 17 — loader fill everywhere & snap-x wheel)

- The intro's background-fill treatment is now a first-class **loader option set**, exposed in the Loading playground: `fill` (up/down/left/right), `fillColor`, `labelColor`, `labelBlend` (difference/exclusion/screen/overlay) — and a new **`exit:'wipe'` directional mask-out** that sweeps the finished overlay away (`exitDirection` defaults to the fill direction). The demo's Run slot ships with fill-up + difference label + wipe exit.
- Fullpage: wheel now works in `mode:'snap'` + `axis:'x'` (vertical wheel steps the horizontal snap container, gesture-grouped like transform mode).
- Cursor sprite auto-probe moved off the options object (WeakMap) so the feature contract stays clean.

### Added (round 16 — deterministic startup, axes everywhere & full i18n)

- **Deterministic startup (library + demo)**: new `kt-preload` convention — an inline script adds the class to `<html>` at first paint, entrance-animated elements stay invisible (kineto.css rules), and `scan()` releases the veil after modules apply their initial states. No more content flashing before its entrance plays, on any connection speed. The demo defers all module init to window `load`, covered by a **slot intro loader** (orange, thin mono type) whose background fills like a giant progress bar.
- **loader**: `fill` ('up'/'down'/'left'/'right') fills the overlay background with `fillColor` as progress rises; `labelColor` + `labelBlend` (e.g. `difference`) keep the percentage readable over the fill.
- **fullpage**: `axis:'x'` (horizontal paging — dots at bottom, arrow keys, nesting inside a vertical container gives mixed layouts), mouse **drag-swipe** (`drag`, on by default), and snap mode actually scrolls now (the percent chain was collapsing; dots sync to native snapping). Horizontal demo card added.
- **slider/coverflow**: `axis:'y'` — vertical sliding and vertical coverflow (rotateX), drag and arrow keys follow the axis.
- **Scramble styling** shared by shuffle + textReveal decode/flicker: `rainbow`, `rainbowColors` (hex/rgba stops sampled algorithmically instead of the full rainbow) and `scrambleFade` (brightness-only flicker).
- **vibrate**: `trigger:'manual'` + `instance.play()` for firing patterns from code; every module's JS code tab now shows selector-based usage (`Kineto.module('#id'|'.class', options)`).
- **cursor clickSprite** auto-detects frame size/count from the sheet (square frames assumed) when width/frames are omitted — explicit options still win.
- **tilt / cardGlow**: `disableOnMobile` switches the effect off entirely on touch devices.
- **i18n completed**: all 68 card descriptions translated into the 6 languages (plus chips/tooltips/support/footer); tooltips wrap at punctuation (`white-space:pre-line`).
- Lightbox: clicking the empty area beside the image now closes the viewer (drag/zoom-safe) — the stage was swallowing backdrop clicks; gallery demo grew to 4 images.
- Playground: drawer controls use the accent color (no more UA blue); the GSAP/LENIS install rows really hide now (`[hidden]` was losing to `display:flex`).

### Added (round 15 — clock everywhere, no-flicker drawer & hero refinements)

- Counter clock family gained `clockStyle:'flip'` — real time, countdown and elapsed timers can now render as a split-flap board (tile options fully compatible), alongside roll/fade/instant.
- Options drawer no longer flickers: option changes sync field visibility **in place** (fields toggle `hidden`) instead of rebuilding the panel; ESC closes the drawer and returns focus to its trigger.
- Module Index badges jump to the section demoing that module (keyboard accessible).
- Page Reveal `diagonal` rebuilt as a real angled curtain sweep (slanted cover + trailing panel, `angle`/`direction` options) — no more corner shrink.
- Hero: dependency toggles (Scroll Scrub / Smooth Scroll, English labels) sit inline in the support line and reveal the matching GSAP/LENIS CDN rows; chips renamed (간편설치 · 구형 브라우저 고려 · …) with centered, caret-arrow tooltips that break lines at punctuation; chip labels/tooltips, support line and footer brand are translated in all 7 languages; hero-meta spacing 50px; install badges auto-size (LENIS no longer cramped).
- Detail pass: summary flex gap 2px; Card Glow cards get a wider option panel (escaping the 50px card padding) with relaxed tracking, and their content stacks centered with a 12px gap.

### Added (round 14 — first-screen snap, 7 languages & final polish)

- Demo hero is a full-viewport (100svh) first screen: one scroll gesture snaps to the first section fullpage-style — and scrolling up from there snaps back — with gesture-grouped momentum swallowing on wheel and touch; everything below scrolls normally. Disabled under prefers-reduced-motion. The header brand (Kineto 0.8.0) scrolls to the top on click.
- Language selector grew to 7 languages: 한국어 · English · 日本語 · 简体中文 · 繁體中文 · Русский · Italiano (section copies + hero lead, `<html lang>` synced).
- Hero feature chips rewritten in plain Korean with centered hover tooltips (arrow caret) explaining each point; the dependency line now says it plainly — the core runs standalone, and an "PLUS" install row provides copyable GSAP + ScrollTrigger + Lenis CDN tags for the scroll-scrub/smooth modules.
- Counter countdown rolls digits downward by default (they're decreasing); `rollDirection` still overrides.

### Fixed (round 14)

- Snake cursor restored to the original loose elastic chain — and when the letters converge at rest, each glyph scales down with its spread so the stack collapses into a 1–2px dot (measured scale 0.12) instead of a letter blob.
- Slider/Coverflow: the Prev/Next row sat flush against the options summary — cards with real control rows keep a separated panel with proper spacing (16px, own border and radius).
- Module Index group labels vertically centered against their chip rows.

### Fixed (round 13 — gesture isolation & detail pass)

- **Fullpage really swallows momentum now**: wheel events are grouped into gestures (280ms window) — once a gesture triggers a step, its entire momentum tail is preventDefault-ed, and touch swipes navigate at the threshold then consume the rest of the touch. `overscroll-behavior:contain` blocks scroll chaining on mobile. Verified: 14 rapid wheel events → exactly one section step, 0px page movement.
- Theme switch: states were inverted — dark mode now highlights the moon (knob on the moon side), light highlights the sun; icons are larger filled monochrome glyphs (no accent colors).
- "Blink colon" (and other true-by-default checkboxes: seconds, lightbox toolbar/info/minimap, fullpage dots/wheel/touch/keyboard) rendered unchecked in the drawer while actually on — defaults registered so the panel reflects and controls them correctly.
- Counter digits clipped in narrow cards — counter stages use container queries to scale the type down (with the old vw clamp as fallback), everything centered and fully visible.
- Content Entrance preview cards now join their Customize summary (shared corner radii) like every other section.
- Footer: the top border runs full-bleed and meets the sidebar divider (no more floating inset line with a dead gap above it).

### Added (round 12 — clock modes, countdown & theme switch)

- Counter clock: `clockStyle` (roll · fade · instant), `rollDirection` (up/down), **countdown** (`until`) and **elapsed** (`since`) modes with automatic day count (`daysLabel`, `showDays`) and onComplete at zero; the layout rebuilds itself when the day digits change. Reduced motion renders plain updating text for all clock modes. Demo gains a Countdown card (D-day to 2027).
- Theme control is now a real switch — sun/moon at each end, sliding knob, `role="switch"` + `aria-checked`, larger icons.
- Install box: npm row is a copyable `npm install kineto` like the others; CDN/ESM snippets point at `dong-gri/kineto`.

### Fixed (round 12)

- Brush Reveal at `opacity:1` never looked opaque: the trail fade ran *after* the re-stamp (permanently one step below full), and the blur filter diluted the core. The loop now fades first then stamps, and a crisp unfiltered core is re-laid over the blurred pass — opacity 1 is truly opaque.
- Fullpage: wheel/touch during a section transition is swallowed completely, so the page behind no longer scrolls mid-animation (verified 0px page movement); the demo container and its Customize summary now share joined corner radii.
- The sidebar divider ended with the sticky nav and looked cut off next to the footer — the border moved to the main column, running the full content height.

### Added (round 11 — fullpage, progress UI & clock) — 34 modules

- **fullpage** (new 34th module): fullpage.js-style section paging — wheel / touch swipe / keyboard / dot navigation, `mode:'snap'` for native scroll-snap, loop, callbacks. Percent-based transforms adapt to any resize instantly; the container releases scroll at its edges so it never traps the page; reduced motion falls back to native snap scrolling.
- **progress** module grew visual shapes: `ui:'bar'` (fixed or in-place track+fill, thickness/radius/gradient/trackColor/position) and `ui:'ring'` (SVG circle, size/stroke, `showPercent`, `clickToTop` back-to-top button, corner + offset, `showAfter`, `hideAtEnd`, smoothing, per-element `target`). Themable via `--kt-progress-*` variables. The demo's floating TOP button is now this ring.
- **counter**: `clock` mode — a live clock (HH:MM:SS) where only changing digits roll and the colon blinks each second (`seconds`, `hour12`, `blink`, `clockSeparator`, `rollDuration`); grouping separator accepts any character (`separator`), and `blinkSeparators` makes separators blink in the other modes. Reduced motion renders a plain updating time.
- **shuffle**: `rainbow` option — scrambled characters flash in random rainbow colors (or a custom `rainbowColors` palette) until they settle.
- **pageReveal**: three new effects — `checker` (random tile grid), `strips` (shuffled vertical strips), `shutter` (alternating horizontal blades).

### Fixed (round 11)

- **Hero markup had one extra `</div>`** (introduced with the install box), which closed `<main>` early and spilled every section out of the layout grid — breaking the sidebar's sticky positioning. Rebalanced; sidebar sticks again.
- Hero title: the text-reveal char split defeated `background-clip:text` (giant black blocks). The title is now a static element with the flowing gradient glow.
- Marquee `pauseOnHover` never actually paused: the scroll-recovery drift pulled the velocity back to base every frame. Hover now holds the line still (verified: 0px movement while hovered).
- Header scroll bar moved inside the header (it sat above it, and its unfilled track showed an unblurred 2px gap).

### Added (round 10 — hero identity & lightbox polish)

- Lightbox: `backdropBlur` option (px, 0 disables) alongside `backdropOpacity`; zoom −/+/reset buttons disable themselves at min/max/100%; the whole viewer is now designer-themable via CSS custom properties (`--kt-lightbox-backdrop`, `--kt-lightbox-backdrop-blur`, `--kt-lightbox-button-bg/-border/-color/-radius`, `--kt-lightbox-radius`) — explicit JS options still win.
- Demo: hero title flows with an animated gradient glow (disabled under prefers-reduced-motion); theme switch is a sun/moon icon toggle; floating TOP button bottom-right (sits above the mobile nav); install box with copyable CDN/ESM snippets and an "npm 준비 중" row replaces the three wordy fact cards; custom cursors switch to `mix-blend-mode:difference` while the lightbox is open so they stay visible over the dim.

### Fixed (round 10)

- Stage ↔ Customize summary joining now applies to every card section (Counter, image loading, Text Overflow, feedback, Text Motion, entrance, Media & UI, cursor) — not just Loading.
- Replay buttons that sat outside a `.replay-row` (media cards) were still text buttons; the FAB conversion now catches every replay control.
- Card Glow cards force white text, which made the panel summary invisible in light theme — panels now set their own text color and stretch to full card width.
- Section copies rewritten as natural two-line Korean (with matching EN), `<a class="btn">` links lose their underline, and the Page Transition card explains itself in two sentences.

### Changed (round 9 — hero/footer & sticky fix)

- Hero: demo buttons and the "Live playground" notice removed; replaced with a GitHub link, feature chips (progressive enhancement, reduced-motion, mobile/gyro, standards/a11y) and three fact cards — browser support, optional dependencies (GSAP · ScrollTrigger · Lenis), install (UMD/ESM, npm 준비 중). Lead copy now breaks into two lines.
- Footer redesigned: brand statement + Project / Release columns + fine print; build stamp kept.
- Replay FAB moved to the bottom-right of each stage; dropped the `btn` class so later-cascade button styles can't hide or reshape it.
- Loader preview stages and their Customize summary now join into one block (shared corner radii, no gap); summaries elsewhere get more top margin, module name in the summary is right-aligned, standalone playground hosts span full width.
- Options drawer slides in from the right; shadow softened.
- Page Transition card gained a live "Transition reload" link (falls back to normal navigation where fetch is unavailable).

### Fixed (round 9)

- **Sticky broke site-wide** (Scroll Sequence showed a long empty run): `overflow-x:hidden` on `<body>` stopped propagating to the viewport once `<html>` got `overflow-x:clip`, turning the body into a clip container that killed `position:sticky`. Removed the body rule — the html clip alone prevents horizontal scroll.
- Brush Reveal: faint ghost no longer lingers — fade accelerates 4× once remaining ink is faint, so the tail snaps away.

### Added (round 8 — mobile & polish)

- Lightbox: two-finger pinch zoom on touch; mobile safe-area insets for toolbar, nav arrows and bottom metadata; `closeOnBackdrop` option exposed in the playground.
- Brush reveal: scratch-card behavior on touch (`touch-action:none`, paint starts on touch-down); trail healing — older strokes fade continuously while the spot under the pointer stays re-inked every frame.
- Cursor click effects work on touch devices (tap spawns the sprite/one-shot image even though pointer visuals stay disabled).
- Marquee: `skew` option — the line leans with scroll velocity and springs back.
- Slider: horizontal swipe wins over page scroll once a drag starts (touch).
- Demo: mobile bottom navigation bar (scroll-spy chips, safe-area aware); module index grouped by category (Text/Media/Scroll/Pointer/System); replay is a floating icon on each stage; options drawer portals to `<body>` so it renders correctly from tilted cards.

### Fixed (round 8)

- `--font-mono` definition became self-referential during a global font replacement, silently invalidating every `font: … var(--font-mono)` shorthand (section numbers rendered giant). Restored the full stack; numbers now render at the requested 16px IBM Plex Mono.
- Mobile horizontal scroll removed (`overflow-x: clip` on the root scroller); Korean copy no longer breaks mid-word (`word-break: keep-all`, `text-wrap: pretty`).
- Playground: LIVE badge removed, summary slimmed with a fixed-width +/− glyph (no text shift), open-state keeps the border radius; the `?` tooltip opens downward inside the drawer without spawning a horizontal scrollbar.
- Text Motion stages have fixed heights so cycling text no longer reflows the page while scrolling (덜컹거림 해소).

### Added (round 7)

- Vibrate: named haptic presets — `tap`, `double-tap`, `soft`, `rigid`, `heavy`, `success`, `warning`, `error`, `ratchet`(드르륵), `heartbeat`, `long-press` (Web Vibration API has no amplitude control, so texture comes from pulse timing).
- Tilt: gyroscope fallback on touch devices (device orientation drives the tilt; iOS permission handled on first tap).
- Compass: follows the real device heading via gyroscope on mobile.
- Sticky Stack: `align: center | top` — pinned content now centers in the viewport by default (vertical stack, horizontal scroll and floating sequence).
- Cursor: click effects — `clickSprite` (sprite-sheet burst with frame count/size/duration) or `clickImage` (one-shot GIF/APNG/WebP, restarted via cache-busted src). Touch devices still disable cursors entirely.
- Demo: language selector (KO/EN, persisted) replaces the header counter link; theme choice persisted to localStorage; Wanted Sans (body) + IBM Plex Mono (mechanical/numeric type) via CDN.
- Demo structure: Cursor and Smooth Scroll split — the Lenis runtime card now lives in Scroll Effects.

### Fixed (round 7)

- Sidebar/앵커 잠김 완전 해결: `overflow-anchor`를 실제 스크롤러(html)에 적용하고, 해시 이동을 JS 스크롤 + `replaceState`로 바꿔 브라우저의 fragment 재고정이 아예 발동하지 않게 함.
- Ambient image glitch: 색수차 고스트·인버트 슬라이스·스캔라인을 추가해 플랫한 일러스트에서도 버스트가 확실히 보이도록 강화.
- Brush reveal: 호버 중 정지해도 칠이 유지되고(치유는 포인터가 떠난 뒤 시작), 브러시 중심이 기본 불투명(`opacity` 옵션), file:// 이미지에서 치유가 멈추던 taint 문제 제거(픽셀 판독 없는 잉크 추적).
- Lightbox 딤드가 커서 위를 덮어 포인터가 사라지던 z-index 역전 수정.
- Section 번호 타이포를 IBM Plex Mono 기반으로 작고 타이트하게 조정.

### Added (round 6)

- Counter pop: landing origin option `popAlign: bottom | center | top`.
- Lazy skeleton: `skeletonColor` / `skeletonHighlight` / `skeletonIcon` exposed in the playground.
- Overflow Text `page-roll` mode: no horizontal marquee at all — the first page holds, then remaining pages swap by vertical rolling only (`rollDuration`, `rollDirection`, `pageDuration`).
- Glitch `image` preset: standalone ambient glitch bursts over a live image (independent from lazy loading; `sliceCount`, `trigger: hover` supported).
- Brush reveal: real airbrush spread — `softness` now scales the falloff band, plus `blur` for extra gaussian edge.
- Playground: options irrelevant to the current preset are hidden (live re-filter on preset change), and every option has a `?` tooltip with a friendly Korean explanation.
- Demo layout overhaul: sticky sidebar navigation with numbered sections and scroll-spy highlighting; compact hero; uniform card grid (`build r8-20260718`).

### Fixed (round 6)

- Rolling + pauseOnHover: hovering mid-roll restarted a cancelled animation from frame 0 and dropped scheduled steps (freezing on the wrong item); running animations now pause/resume properly and deferred steps fire on pointer-leave.

### Added (round 5 — 33 modules)

- **brushReveal** (new module): pointer paints a second image through a soft Photoshop-style round brush (day→night masking); strokes heal back or persist (`radius`, `softness`, `fade`, `persist`).
- Reveal `clock` preset: conic clock-wipe mask sweeps the content in like a watch hand (`startAngle`, `clockDirection`).
- Mouse Parallax `compass` mode: element rotates to aim at the pointer along the shortest arc, or maps pointer X onto a rotation range (`compassRange`, `rotateOffset`, `smoothing`, `sensitivity`).
- Text Reveal `decode` mode (RF Online style): characters appear in order, flickering through random glyphs before settling — generated from live text, no per-char markup (`flickerCount`, `loop`, `hold`, `chars`).
- Text Reveal `flicker` mode (Callisto TextFlicker): characters strobe on irregularly like failing fluorescents; `flickerLoop` keeps an ambient re-flicker running.
- Lazy `flicker` effect (Callisto ImageFlicker): image loads through canvas slice displacements, blackout flashes and a ghost pass, then settles (`glitchStrength`, `sliceCount`).
- Slider: active slide now centers in plain slide mode too; `align: 'left'` restores edge alignment.
- Cursor: small `+` cross-point variant kept alongside the full-viewport crosshair (`full: false`, `crosshairSize`).

### Fixed (round 5)

- Full-viewport crosshair was invisible: the transformed cursor wrapper became the containing block for its fixed hairlines and collapsed them to 0×0.
- Cursor hover label now sits centered inside the grown dot (no more collision with the ring outline); the dot auto-grows to fit the label.
- Page Reveal buttons only worked once: instances are one-shot and the demo now drops the previous record before re-running.
- Text/overflow dissolve no longer blurs (read as glow); Text Transition gained the same noisy `dissolve` effect.
- Demo: dark editorial redesign is now the default theme (orange accent, mono section numbering); scroll anchoring disabled to prevent snap-back while effects animate; assets cache-busted per build (`build r6-20260718`).

### Added (round 4)

- Overflow Text: `dissolve` mode — characters flicker apart with jitter/micro-blur noise (not a crossfade) and reassemble as the next page (`dissolveDuration`, `jitter`).
- Overflow Text rolling: items can be HTML markup children (div/span/b/em…), not just strings; aria-label uses the plain text.
- Cursor: hover now grows the inner dot while the ring/text-ring keeps its size (`hoverEffect: 'dot' | 'ring'`, `hoverDotSize`, `hoverDotOpacity`).

### Fixed (round 4)

- Overflow Text page/flip/once truncated the tail of the text: overflow was measured against the padded element box instead of the content viewport.
- Coverflow: the last slide never landed dead-center — slide width was measured from a scaled/rotated side slide; now uses layout width.
- Lightbox: title/description moved directly under the image (fade out while zoomed); metadata floated up from the screen edge.

### Fixed (round 3)

- Demo assets are now cache-busted (`?v=r3-20260718`): Chrome kept serving a stale `dist/kineto.umd.js` from the file:// cache, which made every new module look broken (typewriter hangul/caret, text transition, glitch, new cursors, shuffle fix). The footer shows the build stamp.
- Counter flip: bare mode no longer flashes shaded boxes — fold shading only applies to tiles.
- Cursor sparkle: pooled stars restarted mid-transition and never became visible after the first burst; transitions are now re-armed per spawn so stars keep coming.
- Overflow Text: full timing control — `speed`, `delay`(시작), `endPause`(끝 대기), new `restartDelay`(한 사이클 후 재시작 대기), `pageDuration`/`flipDuration` — all exposed in the playground.
- Demo visual refresh: numbered section headers, refined light/dark palettes, softer card shadows with hover states, cleaner hero/footer.

### Added (round 2)

- Typewriter: caret(|) on/off (`caret`, `caretChar`) and Hangul jamo-composition typing (`hangul`) — merges the old Hangul reveal demo into Typewriter.
- Counter: true split-flap `flip` mode — each digit folds at the middle like a Solari board; tile chrome optional (`tile`, `tileColor`, `tileTextColor`, `tileRadius`, `bareBackground`, `gap`).
- Overflow Text: `flip` mode — page-sized text flips like a departure board (`flipDuration`, `flipDirection`).
- Card Glow: `comet` mode — traveling gradient light along the card outline (original border glow, with optional soft halo).
- Cursor: reference set restored — `text` (rotating circular text), `trail` (elastic dot tail), `orbit`, `snake`, `sparkle` (star particles), full-viewport `crosshair`.
- Page Reveal: `blinds`, `diagonal` effects plus `direction`, `axis`, `count`, `stagger` options; rebuilt on WAAPI.
- Text Transition: `shimmer` (AI gradient sweep) and `charMode` per-character enter/leave.

### Fixed (round 2)

- Glitch and Text Transition rebuilt without animation-engine dependency (WAAPI); glitch picks screen/multiply blending from the background so RGB slices are visible on light themes too.
- Skeleton placeholder now fills the actual image box instead of collapsing into a thin bar.
- Shuffle locks per-glyph widths so multi-line text can no longer collapse to one line mid-scramble.
- Demo playground: removed the rule that expanded a card to span 6 columns when its panel opened (grid no longer breaks); grids top-align cards.
- Lightbox: index counter truly centered, title/description centered under the image, metadata centered at the bottom edge.

### Added

- Text Split: `spin`, `flip`, `scale`, `blur`, `slide-up`, `slide-down` entrance animations plus Toss-style text swap (`texts`, `hold`, `swapOut`, `swapEase`, `onSwap`).
- Card Glow: restored the original rotating conic `aurora` outer halo that leaks beyond the card edge.
- Cursor: scoped cursors (`data-kt-cursor` on a bounded element activates only inside it), `full` crosshair, `dot` toggle for ring mode, `global`/`hideDotOnHover` options.
- Lazy Polaroid: instant-photo development curve with optional paper frame (`frame`, `frameColor`, `keepFrame`).
- Lazy Print: soft printing-edge highlight (`edgeWidth`, `edgeOpacity`) with eased scan.
- Lazy Skeleton: media-icon placeholder (`skeletonIcon`) and refined diagonal shimmer.
- Lightbox: index counter, item fade/rise transition, grab/grabbing pan cursors.

### Changed

- Pixelate now runs on the owner's Pixel Mosaic engine: real pixel-block stages in CSS pixels (auto largest→1px), equal time slices, canvas redraw of the live `<img>` so animated media keeps playing (`steps` in px, `stepCount`, `renderFps`, `maxDpr`; legacy ratio options still map).
- `zoom` lazy preset merged into `blur-up` (duplicate effect removed from the contract).
- Cursor dot now tracks the pointer instantly while the follower eases behind it (original trailing feel), and global cursors yield inside scoped regions so two cursors never overlap.
- Slider/Coverflow rebuilt on a single rAF-spring position engine: drag, buttons, keyboard, autoplay share one value; velocity fling on release; collapsed-height bug fixed.
- Overflow Text rewind/page masks now run on the visible viewport instead of the full track, with soft directional nudge easing.
- Scroll Text Fill uses fractional per-glyph gradient fill for a continuous sweep.
- Lightbox visual refresh: blurred backdrop, ghost buttons, compact nav.

### Fixed

- package-lock.json pointed at a private registry mirror, breaking `npm install` outside that network; regenerated against registry.npmjs.org.
- Slider first-slide inline height was cleared, collapsing wrappers without CSS min-height.

## [0.8.0] - 2026-07-18

### Added

- Added animated-media-safe composition across Lazy, Ambient Media and Lightbox for GIF, APNG and animated WebP.
- Added Skeleton shimmer/pulse variants, dynamic-noise Progressive Print/Dissolve, directional MP3 masks, realtime ranking rolling, surface reflection, luminous border, Reveal class hooks, spring velocity controls, full viewer controls, real Loader sources, custom cursor modes and optional Lenis runtime APIs.
- Expanded the owner contract to 46 requirements and the live demo to 58 configurable playgrounds.

### Changed

- Rebuilt Pixelate and Print around live image layers instead of permanently flattening animated media to canvas.
- Rebuilt Ambient Media to use live image clones or sampled video frames.
- Rebuilt Lightbox as a full-viewport customizable grouped viewer with lazy-effect composition.
- Rebuilt Coverflow around one transform path and removed the duplicate demo button handler.

### Fixed

- Fixed Skeleton creating an overlay object without appending it to the lazy wrapper.
- Fixed Coverflow moving two slides per demo button click.
- Fixed Smooth service recursive teardown and media wrapper insertion edge cases.
- Fixed zoomed Lightbox stages capturing pointer events from Previous/Next controls.
- Fixed animated-media QA stalls by replacing stability-dependent screenshots with direct CDP capture and deterministic Ambient frame markers.
- Corrected module documentation that still described Pixelate as Canvas-based and Lightbox as a native dialog.

## [0.7.1] - 2026-07-18

### Added

- Added a reusable live playground to adjustable demos with module-specific controls, instant re-creation, Replay, Apply, and Reset.
- Added synchronized HTML and JavaScript code tabs with a working clipboard action.
- Added playground QA that changes Counter options, verifies generated code and copy behavior, resets the original DOM, and checks instance-count stability.
- Added `MK-DEMO-002` to the owner requirements contract so future AI-assisted edits cannot silently remove the playground.

### Changed

- Included the `demo` directory in the npm package surface.
- Expanded open playground cards on desktop for a more usable settings layout.
- Cleaned generated JavaScript options by filtering them through each module's public option contract.

### Fixed

- Fixed asynchronous clipboard handlers losing `event.currentTarget` after `await`.
- Kept Loader demo buttons and playground controls on the same live option state.

## [0.7.0] - 2026-07-18

### Corrected

- Reclassified `circular` and `bar` as Loader modes and removed `circular` from Counter.
- Changed Counter `pop` to render the final formatted value immediately and land characters sequentially from a larger scale without count-up.
- Restored the Material-style button `ripple` module and separated Pointer/Button Feedback from Card Glow/Tilt.
- Rebuilt Lazy effects so `skeleton` is a true shimmer placeholder, `print` is blur + fine noise resolving through a directional sharp scan, and `dissolve` globally removes fine noise and blur.
- Moved `slide-up` and `wipe` into viewport-triggered Reveal presets instead of image Lazy loading.
- Restored the original RGB slice Glitch and repaired replayable Shuffle Decode and Text Transition.
- Made MP3 overflow modes distinct: Bounce reverses, Rewind masks out and invisibly resets, and Page changes instantly by viewport-width steps.
- Repaired Coverflow controls/drag/index, Ambient Media stacking, and grouped simple-fade Lightbox navigation.
- Added replay controls throughout Text Motion and content entrance demos.

### Added

- `kineto.requirements.json` and expanded `OWNER_REQUIREMENTS.md` with 29 machine-tested owner requirements.
- Full categorized 32-module QA demo.
- Browser assertions for Counter/Loader classification, image effect convergence, MP3 mode semantics, replay controls, ripple cleanup, bounded glow, media UI, and zero-instance teardown.

### Fixed

- Pixelate could remove its Canvas before the browser had committed the final native-lazy image, leaving a blank result.
- Horizontal and floating Sticky Stack modes were incorrectly parsed as the default vertical mode.
- WAAPI `fill-forwards` prevented the hidden Rewind reset from returning to the start.
- Slider fallback slides overlapped because generated slides were positioned absolutely.
- Ambient Media glow could be hidden behind the page stacking context.

## [0.5.1] - 2026-07-17

### Stabilized

- Preserved all **30** modules. Previous documents said 29 while the actual source exported 30; no module was deleted to reconcile the mismatch.
- Rebuilt the core registry and lifecycle handling with duplicate initialization protection.
- Fixed direct `instance.destroy()` so it also removes the stale core record and permits clean recreation.
- Added consistent `create`, `pause`, `resume`, `replay`, and `destroy` behavior across modules.
- Repaired undefined runtime references including GSAP/ScrollTrigger helpers, text segmentation, interpolation, presets, and utility functions.
- Registered GSAP and ScrollTrigger in ESM environments instead of relying only on browser globals.
- Repaired Lenis integration and global visibility pause/resume.
- Reworked lazy media effects, including Canvas pixelate with CORS-safe fallback.
- Repaired Hangul composition frames and grapheme segmentation for text reveal effects.
- Repaired slider pointer, keyboard, autoplay, hover pause, accessibility state, and cleanup behavior.
- Repaired page transition content replacement, history handling, abortable fetch, re-scan, and teardown.
- Fixed timers/listeners/observers/RAF/GSAP cleanup across modules, including pageReveal timer cleanup.
- Restored compatibility methods used by the existing demo under `Kineto.core`.
- Preserved property descriptors while normalizing instances so live getters such as `slider.index` remain live.
- Restored original HTML, inline styles, and ARIA attributes for repaired modules, including reduced-motion fallbacks.
- Replaced the slot counter's fixed row height with computed typography-aware line height.
- Tore down Lenis and visibility services when the final instance is destroyed.
- Added regression checks for unknown-module no-op behavior, descendant destruction, replacement-option replay, and reduced-motion static rendering.

### Added

- `kineto.features.json`: machine-readable module/API contract covering modules, activation attributes, variants, public options, root properties, and core methods.
- `FEATURE_CONTRACT.md`: no-silent-feature-change rules.
- `AGENTS.md`: strict workflow for AI-assisted patches.
- React, Vue 3, and jQuery adapter entry points.
- ESM, browser UMD, CommonJS-compatible UMD copy, and stable CSS exports.
- ESLint, exact public-surface/option contract test, generated documentation check, Chromium lifecycle smoke test, package surface test, and `npm run verify`.

### Changed

- Correct package CSS import is now `kineto/style.css`.
- Browser bundle is `dist/kineto.umd.js`; CommonJS uses `dist/kineto.umd.cjs`.
- Primary documentation now describes tested behavior and known limitations instead of unverified performance or compatibility claims.
- Build tooling updated to Vite 8.1.5 and Playwright Core 1.61.1.

### Security

- Updated build tooling; `npm audit` reports zero known vulnerabilities at release verification time.

## [0.5.0] - 2026-04-26

- Expanded the experimental library into a broad interaction toolkit.
- Added the modules that now form the 30-module v0.5 public surface.
- This version contained documentation, runtime, package export, and lifecycle inconsistencies corrected in v0.5.1.

## [0.2.0] - 2026-04-26

- Added lazy image effects and the first expanded interaction module set.
- Introduced environment detection, fallback handling, module docs, and examples.

## [0.1.0] - 2026-04-26

- Initial core, parallax, reveal, counter, GSAP/ScrollTrigger, Lenis, architecture document, and demo.
