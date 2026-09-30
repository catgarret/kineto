# Kineto v0.13.1 QA Report

검증일: 2026-09-20
대상: v0.13.1 릴리스 후보 소스 · 이전 공개 배포 근거는 버전별로 유지

## 2026-09-30 CI annotation 잡음 · Slider 반복 타임스탬프 멈춤 · 테스트 흔들림 (Unreleased)

- PR #57 CI(run 36633320041, ed170fa)는 성공했고 가장 느린 job이 226초였습니다(WebKit 3/3 211초, 이전 202~284초). 비인증 API로 annotation을 읽으니 새 재시도 두 개와 잡음 하나가 있었습니다.
- 잡음: 모든 Node job에 `node_modules/.bin/attw` "exited with code 1" 실패 annotation이 있었습니다(dc215ba main CI와 v0.13.0 Release에도). `check-package-lint`는 attw의 JSON으로 판단하고 종료 코드를 일부러 무시하는데, `tests/ci-annotate.mjs`가 NODE_OPTIONS를 물려받은 attw 프로세스의 종료를 실패로 알렸습니다. 이 컨테이너에서 `GITHUB_ACTIONS=true`와 같은 NODE_OPTIONS로 옛 코드를 돌리면 `::error` 1줄에 종료 코드 0, 새 코드는 0줄입니다. `expectedExitEnv()`(`scripts/gh-actions.mjs`)가 `KT_CI_ANNOTATE=off`를 넘기고, 훅은 그때 조용합니다.
- WebKit 2/3 `slider-variant-browser`: "dissolve did not settle at 1" — 들어오는 슬라이드 progress 0.9811080386818688, 나가는 슬라이드 0.0188919613181312. 처음에는 렌더링 정지로 보고 대기를 프레임 수 기준으로 바꿨지만(`__frameDeadline`), PR #58 CI(run 36645204708, f7abb25)에서 **소수점 끝자리까지 같은 값**으로 다시 실패했습니다. 무작위 정지라면 값이 매번 달라야 하므로 결정적 결함입니다. 0.0188919613181312는 0.82^20과 16자리까지 같습니다. 즉 smoothing 0.18로 정확히 16ms 프레임 20개를 간 뒤 더 나아가지 않았습니다. 슬라이더 트랙 루프는 `dt = Math.min(64, time - lastFrameTime)`이라 같은 타임스탬프가 반복되면 dt 0 → 진행 0이면서 프레임은 계속 요청합니다(방사형 루프는 `time`을 `performance.now()`와 비교). CI 러너의 WebKit이 실제로 타임스탬프를 반복하는지는 로그 없이 확인하지 못했지만, 같은 모양의 멈춤을 재현하는 게이트를 만들었습니다: `tests/browser/motion-timing.mjs`가 수동 rAF 큐로 5프레임 뒤 같은 타임스탬프 콜백 90번을 주면 옛 트랙은 fade 80%(0.802)에 머물고 방사형도 끝나지 않습니다. 두 루프를 `frameClock()` + `frameEase()`(반복·역행 타임스탬프 = 한 프레임, 한 번에 최대 `MAX_FRAME_STEP_MS`)로 옮겼고 세 엔진에서 통과합니다. 다음에 또 실패하면 메시지가 반복된 타임스탬프 수와 페이지 오류를 알려 줍니다.
- WebKit 3/3 `components-a11y` `sheet-close-button`: 고정 150ms 대기 뒤 `hidden`을 읽었습니다. 같은 시점의 `backgroundBack`(inert 해제, 닫을 때 바로 실행)은 통과했으니 닫힘 자체는 일어났고 40ms WAAPI 애니메이션의 끝이 늦었습니다. `__until()`로 최대 2초 확인합니다.
- Firefox 2/2 `stylize-patterns`(PR #58 CI): "these motions paint the same frame forever: dither-noise:flow"가 두 번 실패한 뒤 세 번째 통과. 같은 룩의 drift·shuffle·scan·pulse는 움직였으니 시계 정지는 아닙니다. `flow`는 셀 하나만큼 이동할 때마다 같은 그림으로 돌아오고(이 속도·셀 4px에서 약 390ms), 650ms 한 점 비교는 그 주기에 걸리면 "안 움직임"으로 봅니다. 250·450·650ms 세 점에서 보고, `none`은 세 점 모두 멈춰 있어야 합니다(더 엄격). 로컬 Firefox 4회 반복에서는 재현되지 않았습니다.
- 로컬 확인: `motion-timing`(새 Slider 케이스)·`slider-variant-browser`·`stylize-patterns` Chromium·WebKit·Firefox, `slider-scroll-snap`, `components-a11y` 세 엔진, lint, `test:release`, Node 레인 65/65.

## 2026-09-29 WebKit shard 3 · Reveal 긴 프레임 · jsdom 30 탐색 selector · 숨긴 패널의 Squircle·Reveal (v0.13.1)

- 증상: PR #52·#53과 main push CI에서 `webkit · test:browser:cross · 3/3`의 lane 시간이 202~284초였습니다. 다른 shard는 약 140~150초이고, 측정 시간 기준 예상은 세 shard 모두 134초입니다. 비인증 API로 check-run annotation을 읽으니 매번 `reveal-variant-browser`(native mask·wipe "must render intermediate frames", 한 번은 gsap/fade "must finish fully visible")와 `components-a11y` `tilt-rest`(7~10프레임 요청)가 첫 시도에 실패하고 재시도로 통과했습니다. 이 컨테이너에서도 첫 WebKit shard 실행에서 둘 다 같은 방식으로 흔들렸습니다(3.5분, 예상 134초).
- Reveal(라이브러리 결함): GSAP 없는 mask·wipe·clock은 rAF 시계에 프레임 간격을 그대로 더했습니다. 탐침에서 시작 직후 300ms 프레임 하나를 넣으면 WebKit·Chromium 모두 mask·wipe의 움직이는 프레임이 0개였고(요소가 그냥 나타남), 150ms일 때는 4~5개였습니다. WAAPI로 도는 다른 preset은 영향이 없었습니다. 수정: 한 프레임의 진행을 `MAX_FRAME_STEP_MS`(60Hz 4프레임, `frameEase()`와 같은 한도)로 제한 → 같은 탐침에서 10개. 게이트: `reveal-variant-browser`의 native "300ms frame" 케이스. 옛 코드에서는 0 frame으로 실패하고, 새 코드는 Chromium 7·WebKit·Firefox 통과입니다.
- 테스트 결함 둘: reveal 표본 창이 고정 450ms였고, tilt-rest는 고정 1.2초였습니다. 기본 smoothing 0.1은 60Hz에서 약 1.05초가 걸려 수렴해서 여유가 0.15초뿐이었습니다. 이제 reveal은 최소 450ms를 보고 모든 등장이 끝날 때까지(최대 2.5초) 읽고, tilt-rest는 멈출 때까지(최대 4초) 기다립니다. 실패하면 마지막 움직임 뒤 몇 ms인지 남깁니다.
- Dependabot 점검: react 19.3·vue 3.5.43·vite 8.3·scheduler 0.28 PR(#18·#20·#22·#23·#24·#31·#33)은 이미 main lockfile에 들어 있어 할 일이 없습니다. 실제로 남은 것은 rolldown 1.2.11(#54), vuetify 3.13.5(#55), MCP SDK 1.30.1(#56)이고 셋 다 CI 초록입니다. major는 따로 시험했습니다. TypeScript 7.0.2(#9)는 `test:types`를 통과하지만 공급망 정책(`dependency-floors`)이 major 변경 검토를 요구합니다. jsdom 30.1.1(#7)에서는 Node 레인 65개 중 3개가 실패했습니다: 공급망 정책(TS 7을 같이 올렸기 때문), `test:perf`, `test:leak`. `test:perf`는 Kineto 결함이었습니다. 모듈 100개의 탐색 selector(2.3 KB)가 jsdom 30의 2048자 한도에 걸려 `RangeError`가 났습니다. 이 브랜치에서 selector를 한도 안으로 나눠 고쳤습니다. `test:leak`은 jsdom 쪽 결함입니다. jsdom 30의 CSSOM은 `removeProperty('background-position')` 뒤에도 `background-position-x/y`를 남깁니다(jsdom 29와 브라우저는 모두 지움). 그래서 scrollShadows의 destroy 뒤 style이 남은 것처럼 보이므로 #7은 보류합니다. jQuery 4(#16)는 공급망 정책이 거부합니다. download-artifact v8(#25)은 릴리스 파이프라인이라, playwright 1.63(#17·#19)은 새 브라우저 빌드가 필요해 이 컨테이너에서 확인할 수 없어 보류합니다.
- 숨긴 패널 점검(새 도구 `npm run audit:hidden-panel`): 데모 마크업이 있는 모듈 53개를 보이게 두 번, `display:none` 안에서 한 번 만들어 비교했습니다. 숨겨서 만들었을 때만 다른 것은 **Squircle**(Chromium 네이티브 경로)이었습니다. 만들 때 한 번 재서 0×0이면 아무것도 쓰지 않고, 네이티브 경로에는 ResizeObserver가 없어 탭이 열려도 직사각형으로 남았습니다(WebKit·Firefox의 polyfill 경로는 정상). 퍼센트 `cornerRadius`도 요소 크기가 바뀌면 옛 픽셀 값에 머물렀습니다. 두 경로 모두 상자를 관찰하게 고쳤고, `tests/browser/squircle.mjs`에 숨긴 패널·`50%` 리사이즈 게이트를 추가했습니다(옛 코드에서는 `""`로 실패). 수정 뒤 세 엔진 모두 51개가 같습니다. Counter·Page Transition은 두 번의 일반 실행끼리도 달라 제외했습니다. Tilt·Card Glow의 재개 뒤 항등 transform은 알려진 차이로 표시했고, hover 뒤와 같은 상태입니다. WebKit Flip은 lazy 이미지 때문에 1.5초 settle에서 가끔 달랐지만 3.5초에서는 3/3 같았습니다.
- 숨긴 패널 점검을 데모의 모든 변형(`--each`, Chromium 291개)으로 넓혔습니다. 그 결과 **Reveal native slide-right/left**(데모의 비교 카드 두 개)를 찾았습니다. 숨겨서 만들면 패널이 열려도 opacity 0, 옮겨진 위치에 그대로 남았습니다. 조건은 GSAP 없음(CDN 차단·오프라인·데이터 절약 low 단계)과 html/body `overflow-x: clip`(데모도 해당)입니다. 이때 옮겨진 상자는 뷰포트에 7.6%만 걸쳐 IntersectionObserver 기준 10%에 못 미쳤고, 패널이 열려도 새 알림이 없었습니다. 요소에 ResizeObserver를 붙여 크기 변화 때 판단(옮기지 않은 상자 기준)을 다시 하게 했습니다. 처음 시도한 "관찰 root를 옆으로 넓히기"는 html/body의 clip이 교차 영역을 먼저 잘라서 효과가 없었습니다. 위/아래 퍼센트 margin이 너비 기준이던 계산도 IO처럼 높이 기준으로 고쳤습니다. 게이트 `tests/browser/reveal-hidden-panel.mjs`는 옛 코드에서 세 엔진 모두 3초 뒤 opacity 0,0으로 실패하고, 새 코드에서는 세 엔진 모두 약 420ms에 재생됩니다. 수정 뒤 `--each reveal` 38개 모두 차이가 없습니다.
- **v0.13.0 릴리스 실패(2026-09-29 21:27 UTC)**: 소유자가 `release:ship -- v0.13.0`을 실행했고, CI 초록 뒤 태그가 푸시됐습니다. 그런데 [Release 실행 `36633306727`](https://github.com/catgarret/kineto/actions/runs/36633306727)의 `Audit root and fixture lockfiles` 단계가 3번 모두 실패해 publish job이 건너뛰어졌고, npm은 0.12.3 그대로입니다. 태그 트리(`dc215ba`)에서 재현해 보니 root lockfile의 undici 7.29.0(jsdom 29의 `^7.25.0`, dev 전용)에 새 advisory 10개가 있었습니다(high 2: GHSA-rfgv-xxqx-mfg5, GHSA-w293-vg96-wgc3, 수정 7.29.1). 나머지 lockfile 4개는 0건입니다. RELEASING.md 규칙대로 태그는 그대로 두고 0.13.1로 게시합니다. 조치는 두 가지입니다. `npm update undici`로 7.30.0으로 올려 5개 lockfile 모두 0건이 됐습니다. 그리고 `release:ship`이 CI 뒤·태그 전에 같은 감사 스크립트를 돌려, 실패하면 태그 없이 멈추게 했습니다(`tests/release-automation.mjs` 게이트). CI는 감사를 돌리지 않고 릴리스 워크플로만 태그 뒤에 돌렸기 때문에, CI와 태그 사이에 나온 advisory가 버전을 소진시킨 것입니다(v0.12.0에 이은 두 번째 사례).
- 검증(2코어 컨테이너): WebKit shard 3는 11/11, 2.2분, 재시도 0. selector 분할 뒤 Node 레인 65/65와 Chromium 브라우저 레인 48/48 재통과. Chromium 브라우저 레인 48/48, 재시도 0. `components-a11y`는 세 엔진 통과, `reveal-variant-browser`도 세 엔진 통과. Node 레인 65/65, lint OK. CI에서 shard 3가 다른 shard와 비슷해지는지는 push 뒤 PR CI로 확인합니다.

## 2026-09-27 감사 수정 · 데모 접근성 · CI와 로컬 확인 속도 (v0.13.0)

소유자 요청: "대폭 성능 최적화, 접근성, 오류 등 잡는 리팩토링 거하게. 그리고 CI나 지금 작업하는 데
반나절+하루 걸리는 것도 이슈라 생각해서 그것까지 개선."

### 무엇을 했나

- **감사 수정(약 40개 모듈):** 세 갈래(상호작용 컴포넌트, 코어·페이지 수준 lifecycle, 텍스트 모듈)로 나눠 찾고
  고쳤습니다. 수정마다 "고치기 전 코드에서 실패하는 것"을 확인한 게이트를 붙였습니다:
  `tests/browser/components-a11y.mjs`(51개 케이스), `lifecycle-core.mjs`(17개), `text-a11y-lifecycle.mjs`(12개).
  세 엔진 모두 통과했습니다. 내용은 CHANGELOG `[Unreleased]`에 있습니다.
- **데모:** 닫힌 설정 드로어는 `inert`이고 모달이 아닙니다. 페이드 중에 다시 연 사이트맵이 열린 채로 남습니다.
  탭 줄은 탭 패턴(패널·`aria-controls`·로빙 탭 정지·화살표)을 따릅니다. 히어로를 지나면 제목 그라디언트가 멈추고,
  휠·터치 이벤트마다 레이아웃을 읽지 않습니다. 게이트는 `tests/browser/demo-a11y.mjs`(v0.12.2에서 5개 모두 실패).
- **reduced motion 텍스트:** Text Split·Blur Text·Text Reveal이 문단에도 `aria-label`을 붙이던 것을 고쳤습니다.
  이제 `utils.labelStaticText()`로 이름을 가질 수 있는 요소에만 붙입니다(`tests/motion-regressions.mjs`).
- **CI 속도:** shard를 위치 순서(round-robin)가 아니라 측정 시간(`tests/lane-timings.json`, LPT)으로 나누고,
  Chromium 3·WebKit 3·Firefox 2개로 늘렸습니다. 병합한 트리에서 측정한 시간(2코어)으로 계산한 shard 부하:
  Chromium 161/161/161초(위치 순서였다면 92/198/194), WebKit 134/135/134초(195/84/124), Firefox 201/201초
  (한 shard였을 때 402)입니다. CI에서 가장 느린 job은 전에는 Firefox 1/1(363초)이었습니다. 게이트 `tests/lane-select.mjs`: 분할이 모든 단계를 한 번씩 덮는지,
  실제 레인에서 LPT 한계(최적의 4/3) 안인지, round-robin보다 느리지 않은지 확인합니다.
- **로컬 확인 속도:** `run-lane --changed[=ref]`와 `verify:push -- --changed`는 바뀐 파일이 영향을 줄 수 있는
  단계만 돌립니다. 공유 파일(`src/` 코어·어댑터·`package.json`·레인 도구)이 바뀌면 전부 돌리고, CI는 이 옵션을
  쓰지 않습니다. Slider 하나를 바꾸면 Chromium 48개 중 9개가 선택됩니다(측정 시간 합 약 210초, 전체 약 480초).
  실시간 대기가 서로 독립인 두 테스트는 대기를 나란히 돌립니다: Reveal variant 58 → 42초, Stylize pattern 31 → 8초
  (엔진마다, 단언은 그대로, 모션을 얼린 변이는 여전히 실패).
  Playwright 브라우저 캐시는 넣지 않았습니다. Playwright가 권하지 않고(복원 시간이 다운로드와 비슷하고 OS
  패키지는 어차피 설치), path 필터도 넣지 않았습니다(필수 검사가 건너뛰어지면 PR이 막힘).

### 최신 `main`(v0.12.3 + 0.13 엔트리) 위로 합치기

작업 도중 원격 `main`이 42커밋 앞서 갔습니다(v0.12.3 게시, `/auto`·`/all` 엔트리, `utils.canHover()` 입력 정책,
Counter·Fullpage teardown, `observe()` 하위 트리 정리, `KT_ENGINE_UNAVAILABLE`, `dist/` 미추적).
`AGENTS.md`의 동시 작업 규칙대로 최신 `main`에서 새 작업 브랜치 `agent/claude/perf-a11y-ci`를 만들고 병합해,
충돌 13곳을 의도에 맞게 풀었습니다(병합 커밋 메시지에 곳곳의 결정을 적었습니다). 병합한 트리에서 테스트가 잡은 것:

- `hover-touch`는 Hover Roll이 시작됐는지를 링크의 `aria-label` 변화로 확인했습니다. 감사 수정은 링크 이름을
  첫 항목으로 고정했으므로(hover 중 이름이 바뀌던 결함), 트랙의 transform으로 확인하고 이름이 그대로인지도 봅니다.
- `lifecycle-core`의 어댑터 케이스: 어댑터가 `@dong-gri/kineto/all`을 import 하므로 테스트 import map에 추가했습니다.
- `components-a11y`의 gyro 케이스: `canHover()` 정책 이후 gyro는 "아무 입력도 호버하지 못할 때"만 씁니다.
  테스트는 `(hover: none)` 하나만 흉내 냈으므로, 휴대폰의 hover/pointer 질의 응답 전체를 흉내 내게 했습니다.
  함정: 이 도우미는 HTML 템플릿 리터럴 안에 있어 정규식의 `\s`가 `s`가 되었습니다 — 백슬래시를 두 번 씁니다.
- 예산은 병합한 트리에서 다시 쟀습니다. 패키지: packed 674.0 → 682, unpacked 2157.0 → 2179(88개 파일).
  소비자 번들: full·all 176, React 180, Vue 181(Vite 175.3/179.1/180.3, Rolldown 175.6/179.3/180.8 KB).
  `docs/consumer-bundle-size.md`도 다시 생성했습니다.

### 검증 (이 컨테이너, 2코어, 병합한 트리)

| 검사 | 결과 |
|---|---|
| `npm run lint`, `npm run build` | 통과 |
| `run-lane test:node` | 64/64 (2.3분) |
| Chromium `test:browser` | 45/48 → 병합에서 깨진 3개(`hover-touch`·`lifecycle-core`·`components-a11y`)를 고친 뒤 다시 돌려 3/3 (전체 8.6분) |
| Firefox `test:browser:cross` | 33/34 → `components-a11y` 수정 뒤 `components-a11y`·`lifecycle-core` 2/2 (전체 7.1분) |
| WebKit `test:browser:cross` | 34/34 (6.7분) |
| `npm run test:demo` | 통과(742개 컨트롤, 239개 플레이그라운드. H.264 비디오 단계는 이 브라우저에서 건너뜀 — CI에서 실행) |
| 병합 전 브랜치 Chromium 레인 | 47/47 (8.1분) |

검증하지 못한 것: 새 shard matrix의 실제 CI 시간(PR의 첫 CI가 첫 측정), 실기기 iOS/Android, 스크린 리더 실제 낭독
(NVDA·JAWS·VoiceOver). 스크린 리더 동작은 접근성 트리와 DOM 규칙으로만 확인했습니다.

PR #52(`agent/claude/perf-a11y-ci`, `18d5a80`)의 첫 CI: 11개 job 모두 통과. 가장 느린 job은 WebKit 3/3의 245초였습니다
(전에는 Firefox 1/1이 363초). Chromium 171/189/172초, WebKit 196/200/245초, Firefox 191/214초, Node 24 job 206초.

### 소유자 보고 — Fullpage 첫 카드가 창 높이만큼 커짐

접속해서 스크롤만 해도 첫 카드의 덱이 `style="height: 100svh; …"`였습니다(소유자 콘솔 확인). 높이 없는 덱을 화면에
채우는 대체 규칙을 만들 때 한 번 잰 `clientHeight`로 정했고, 배치되기 전에 만들어진 덱은 0으로 재져 창 높이에
고정됐습니다. 이 컨테이너의 Chromium·WebKit에서는 같은 순서가 재현되지 않았지만(여러 창 크기, 첫 방문, 스크롤로 이동,
설정 변경, 비교 시트 — 라이브 사이트 포함), 숨긴 패널·붙기 전 요소에서는 옛 코드가 매번 `100svh`를 씁니다
(`components-a11y`의 `fullpage-hidden-panel`, 옛 코드에서 실패). 이제 10px 미만으로 재지면 배치된 덱의 ResizeObserver
보고로 한 번 더 확인합니다.

### v0.13.0 준비 (브랜치 `agent/claude/release-0.13.0`)

- 준비 중 `npm run verify`에서 흔들림 셋을 찾아 고쳤습니다.
  - `demo-code-access`의 30초 클릭 실패: 설정 드로어를 연 프레임 안에 닫으면 프레임 콜백이 배경을 다시 열었습니다. 데모 결함이며, `demo-a11y`에 게이트를 추가했습니다.
  - `create-cost`: 트레이스 창이 너무 길었습니다.
  - `measure`: 포인터가 도착했을 때 무대가 화면 밖에 있었습니다.
  - `demo-qa`: 시간이 걸리는 확인 다섯 개가 고정 대기였습니다.
  - 고친 뒤 결과: demo QA는 코어 하나를 바쁘게 둔 채 5/5, `create-cost`는 부하 중 3/3입니다.
- 최종 `npm run verify` 통과. 결과는 Node 64/64, 데모 QA(한 번 흔들린 뒤 위 수정), Chromium 레인 48/48(flaky 0), pack, lockfile 5개 감사 0건입니다.
- `release:prepare -- minor`: 모든 버전 소스를 0.13.0으로 올리고, `[0.13.0]` 절(영/한 각 20개)과 `.github/release-notes/v0.13.0.md`를 만들고, `docs/module-cost.md`(core 16.1 KB gzip)를 갱신했습니다. `docs/consumer-bundle-size.md`는 다시 측정했습니다.
- 게시(`release:ship -- v0.13.0`)는 소유자의 명시적 승인 뒤에만 합니다.

### #52 병합 뒤 첫 예약 실행 — `dist/`를 빌드 없이 읽던 job 셋 (2026-09-29)

- 2026-09-28 월요일 예약 실행 두 개가 `main` `41d3319`에서 실패했습니다: [Supply-chain audit `36407856338`](https://github.com/catgarret/kineto/actions/runs/36407856338)의 `Check package surface`와 [Live-site parity `36405966893`](https://github.com/catgarret/kineto/actions/runs/36405966893)의 `Verify live-site parity`. 깨끗한 checkout에서 재현했습니다. `package-size`는 `required release file missing: dist/…`, `package-tarball`은 `ERR_MODULE_NOT_FOUND …/dist/kineto.default.js`, `verify-live-site`는 `ENOENT dist/kineto.umd.min.js`로 실패했습니다.
- 원인: v1 Phase 1이 `dist/`를 추적에서 뺄 때 이 두 워크플로와 태그 전용 `release-mcp.yml`(`test:contract`가 `dist/kineto.js`를 import)이 빌드 없이 옛 커밋 사본을 읽고 있었습니다. MCP 릴리스는 아직 태그가 없어 실패가 드러나지 않았을 뿐입니다.
- 조치: 세 job에 `npm run build`를 추가했습니다. MCP 릴리스는 빌드 뒤 `git diff --exit-code`로 추적 파일이 그대로인지 확인해, 패킹하는 tarball이 태그 소스와 같게 합니다. 새 게이트 `tests/workflow-build-order.mjs`(`test:workflow-build-order`, Node 레인)는 모든 워크플로의 job을 순서대로 읽습니다. npm 스크립트와 그 스크립트가 실행하는 파일을 따라가, `dist/`를 읽는 명령이 `npm run build`보다 앞서면 실패합니다. 수정 전 트리에서는 정확히 이 세 job만 잡고 다른 job은 오탐이 없습니다. fixture 16개로 래퍼 인자, `for` 목록, import 경유, 다른 패키지, 주석, job 경계를 고정했습니다.
- 빌드 뒤 `test:live-site:parity`: canonical `kineto.dongri.me`는 `41d3319`와 런타임 해시까지 일치했습니다. 백업 `git.dongri.me/example/kineto`는 build `1b28eb9`(2026-08-25, v0.8.104)를 서빙했습니다. 백업 저장소의 `sync-kineto.yml`은 "가장 최근 성공한 main push CI"를 묻는데, 2026-09-29 06:11 UTC 실행에서 그 질의가 8월 run을 돌려줬고 백업이 v0.12.3에서 v0.8.104로 되돌아갔습니다. 같은 질의를 다시 하면 `41d3319`를 돌려주므로 일시적인 응답 오류로 보입니다. 이 저장소 밖의 파일이라, main 끝 커밋(`git ls-remote`)을 정하고 그 SHA의 push CI가 성공했을 때만 배포하는 패치를 소유자에게 전달했습니다. 이 방식은 CI가 도는 동안 백업이 뒤처질 수는 있어도 뒤로 가지는 않습니다.
- 검증: `dist/`가 없는 깨끗한 checkout에서 고친 job의 명령을 순서대로 실행했습니다. Supply-chain은 boundary → build → package-size·tarball 통과. MCP 릴리스는 build 뒤 추적 파일 변화 없음 → `integrations:check`·`test:contract`·integrations-contract·MCP stdio 통과. Live-site parity는 main 트리에서 build 뒤 canonical 런타임 해시가 일치했습니다. 이 브랜치 트리에서는 v0.13.0이 아직 배포 전이라 설계대로 불일치를 보고합니다. Node 레인은 65/65 통과(새 게이트 포함), lint·`release:check` OK.

## 2026-09-26 아이폰 탭 튐 · 유령 커서 · 스크롤 중 ScrollTrigger refresh (v0.12.3)

v0.12.2 게시(태그 `v0.12.2` → `3cc58bb`, Release·데모 배포 성공) 뒤의 소유자 보고 셋:
"아이폰에서 폴딩된 기준으로 스크롤하면 버벅이거나 튐, 특히 데모 버튼 누르면 튐",
"마우스 포인트도 건들임? 이상한 외곽선 하나 더"(주황 점 + 주황 링 + 회색 링 스크린샷),
"주황색을 또 멋대로 검은색으로 바꾸노".

### 탭 튐 — 측정 방법

Playwright WebKit, `devices['iPhone 13']`(터치), 로컬에서 서빙한 `site/`. 데모 컨트롤 519개
(`.card button, .card [role="button"], .card summary, .module-block button:not(.module-fold__toggle)`)를
**컨트롤마다 새 컨텍스트**로 열어(WebKit 웹 프로세스가 재로드마다 커져 컨테이너가 죽었음) —
`KINETO_FOLD.reveal` → `KINETO_BLOCKS.jumpTo(el, { block: 'center' })` → 칠해진 위치가 400ms 동안
그대로일 때까지(최대 3초) 기다림 → `touchscreen.tap` → 900ms 동안 **칠해진 프레임마다** 그 컨트롤의 위치를 기록.

"칠해진 프레임": `requestAnimationFrame` 안에서 `MessageChannel` 로 한 번 더 넘겨, 그 프레임의 렌더링이
끝난 직후에 읽습니다. 처음 스윕은 탭 전후를 `getBoundingClientRect()` 로 바로 읽었는데, 그러면 레이아웃은
바뀌었지만 ResizeObserver 보정 전인 — **한 번도 칠해지지 않은** — 상태가 보여 "튐"으로 잡혔습니다
(부하가 큰 2코어에서 17~22개가 이런 가짜였고, 같은 컨트롤을 단독으로 다시 재면 0). 튐은 반드시 칠해진 프레임으로 잽니다.

### 원인과 조치 (데모)

1. **탭을 플링의 시작으로 봄** — `touchstart`/`touchend` 가 "터치 스크롤 중"을 켜서, 탭 직후의 높이 변화
   (포커스, 위쪽 블록 측정)를 "손 뗀 뒤 관성 중"으로 보고 보정하지 않았습니다 → 움직인 손가락(`touchmove`)만 셈.
2. **워밍업이 블록을 실제로 그림** — 멈춘 뒤 화면 위 블록을 `content-visibility: visible` 로 그려서 높이를
   기억시켰는데, 그 안의 효과가 전부 깨어나 한 번에 최대 약 0.5초(overflowText 블록 4,602px) 붙잡았고
   바로 그때 독자가 탭했습니다 → 그리지 않고 **레이아웃만**(줄 배치·접기 계획 → 자식 아래 끝 측정 →
   `--demo-block-size`), 프레임당 6ms 예산, 가까운 블록부터. 블록당 몇 ms, 오차 1px 이내.
3. **가운데를 품은 블록 안의 변화** — Loading Indicator(그리드 6개)처럼 긴 블록은 화면 가운데를 품은 채
   위쪽 그리드가 가까워지며 접혀, 탭한 카드를 1,000px 끌어올렸습니다(블록 단위 보정은 가운데를 품은 블록을
   건드리지 않음) → 블록의 **부분(자식)** 도 ResizeObserver 로 보고, 고정선은 화면 가운데(헤더 아래).
4. **먼 블록의 카드로 가는 링크** — 아직 접기 계획이 없는 블록이면 `reveal()` 이 아무것도 못 열고, 도착
   600ms 뒤 그 카드가 접혀 사라졌습니다 → `KINETO_FOLD.reveal()` 이 먼저 그 블록의 접기를 계획.

### 결과 (수정 후, 칠해진 프레임)

| 항목 | 값 |
|---|---:|
| 누른 컨트롤 | 502 (숨은 메뉴·탭 패널 안의 17개는 크기 0이라 제외) |
| 1px 이상 움직임 | 98 (대부분 1px 반올림) |
| 99번째 백분위 | 1 px |
| 20px 넘게 움직임 | 2 |

남은 둘: Flip "펼치기/접기"(-36px, 자기 카드 안의 그리드가 접히며 버튼이 올라감 — 의도된 동작),
Counter "모든 variant 비교"(57px, 같은 조건으로 다시 재면 0 — 탭 전에 3초 동안 멈추지 않은 경우로,
위쪽 블록 보정이 이어지던 중이었음). 설정 드로어를 열면 카드가 드로어 위로 보이도록 페이지가 부드럽게
움직이는 것(`demo/playground.js`)은 의도된 동작이라 튐으로 세지 않았습니다.

**수정 전과 비교(같은 방법, 짝수 번째 컨트롤 260개 표본):**

| | v0.12.2 (라이브, `3cc58bb`) | 수정 후 |
|---|---:|---:|
| 누른 컨트롤 | 218 | 251 |
| 20px 넘게 움직임 | **10** | **0** |
| 가장 크게 움직인 것 | 71,271 px (Loading Indicator 설정) | 7 px |

v0.12.2 에서 튄 것: Lazy·Slider·Stylize·Cursor·Loading Indicator 의 "설정 · 코드"(1,862~71,271px — 탭을 플링으로
여겨 그 직후 위쪽 블록이 그려지며 생긴 높이 변화를 보정하지 않음), Reveal "Replay"(549·618px), Slider "Go to slide 2"(453px).
v0.12.2 에서 누른 수가 적은 것은 이동 뒤 컨트롤이 화면 밖에 있어 건너뛴 경우가 많아서입니다.

### 스크롤 중 ScrollTrigger refresh (라이브러리)

`src/layoutRefresh.js` 는 문서 높이가 안정되면 ScrollTrigger 를 새로 고칩니다. 블록이 화면에 가까워질 때
자리 잡는 0.12.2 데모에서는 12화면 스크롤 동안 9~11번 불렸고, 한 번이 WebKit 에서 40~70ms 긴 작업 +
스크롤 위치 되돌림이라 진행 중인 스크롤이 멈칫하고 iOS 플링이 끊깁니다 → 스크롤이 멈출 때까지도 기다림.
게이트: `tests/browser/layout-refresh.mjs` 5번(스크롤 중 0번, 멈춘 뒤 정확히 1번). 세 엔진 통과, 수정 전 실패.

### 유령 커서 (데모 + 라이브러리)

스크린샷의 주황 점 + 주황 링은 **Cursor 블록 "모든 variant 비교" 시트의 Ring + Dot 타일 커서**, 회색 링이
페이지 커서였습니다. 타일은 화면에 가까워질 때 만들어지는데, 그 IntersectionObserver 알림이 시트를 닫은 **뒤에**
도착할 수 있었고, 그러면 이미 페이지에서 빠진 무대에 커서가 만들어져 `<body>` 에 남았습니다(아무도 destroy 하지 않음).
재현: 시트를 열고 16~200ms 뒤 닫기 → 유령 커서 3개가 페이지 어디서나 그려짐(Chromium·WebKit). 수정 뒤 0.

- `demo/compare.js`: 페이지에 없는 타일은 만들지 않음, 닫을 때 기다리던 타일을 비움, 한 프레임 뒤 맞춤 검사도
  떨어져 나간 무대는 건너뜀. 게이트 `tests/variant-compare.mjs` 3절(가짜 IntersectionObserver 로 늦은 알림을
  전달 — 수정 전 20개 생성, 수정 후 0).
- `src/modules/cursor.js`: 같은 계열의 라이브러리 결함 — 생성 시점의 크기로 "페이지 전체냐 영역이냐"를 정해,
  숨겨진 채 시작한 카드 커서(닫힌 탭 패널·접힌 아코디언·페이지에 없는 노드)가 0×0 으로 재져 페이지 전체
  커서가 됐습니다. 내용이 있으면 영역, 크기는 그려진 요소일 때만. 게이트 `tests/browser/cursor-scope.mjs`
  (Chromium·WebKit·Firefox, 수정 전 실패).

페이지 커서 색: 7월부터 흰 점 + `difference` 라 라이트 테마에서 검게 보였습니다(바꾼 적 없음). 소유자에게 보인
주황은 유령이었고 고치면 검은 커서만 남으므로, 소유자 뜻에 맞춰 페이지 커서를 **주황 점 + 주황 링 하나**
(`var(--accent)`)로 바꿨습니다.

### 검증

- 브라우저 레인: Chromium `test:browser` 43/43, Firefox `test:browser:cross` 30/30, WebKit 30/30(흔들림 0).
  데모 코드를 더 고친 뒤 Chromium 43/43 다시, WebKit·Firefox 에서 `demo-blocks`·`demo-polish`·`lifecycle-edges`·`cursor-scope`·`layout-refresh`.
- `npm run verify:push` 통과(lint, 빌드·생성물, Node 58/58, 데모 QA). `demo-qa` 는 릴리스 빌드와 3회씩 대조 — 새 빌드에서만
  떨어지던 셋(Rolling Ticker, Loader, Skeleton)을 원인별로 고친 뒤 3/3.
  · Rolling Ticker: 점프 프레임에서 부분 보정이 목표를 한 화면 밖으로 → 점프 목표 블록은 부분까지 제외.
  · Loader: 폴드를 모두 연 페이지에서 워밍업이 블록마다 50~100ms 레이아웃 → 워밍업은 터치 독자에게만.
  · Skeleton: Lazy `replay()` 경쟁(원래 있던 라이브러리 결함, 가끔 떨어짐) → 실행 번호로 낡은 실행 중단. `lifecycle-edges` 에 게이트.
- 이동 검사(Chromium, 폰 CPU 4배·데스크톱): 해시·사이드 내비·딥 링크 착지 82px(헤더 아래), 한 화면씩 위로 스크롤할 때 내용 이동 0,
  맨 위로 부드럽게 0, 스크롤 중 ScrollTrigger refresh 는 멈춘 뒤 1번(전에는 12화면에 9~11번).
- 유령 커서: 시트 열고 닫기 경쟁 재현(Chromium·WebKit 유령 3개 → 0), 페이지 커서 스크린샷(다크·라이트, 빈 곳·버튼 위·모듈 인덱스).
- 확인하지 못한 것: 실기기 iOS Safari(에뮬레이션은 WebKit + 터치 이벤트). 손가락을 뗀 뒤 관성 중 동작은 에뮬레이션으로 재현 불가.

## 2026-09-25 휴대폰 성능 · v0.12.1·v0.12.2 CI

소유자 보고: "데모사이트는 모바일 접속할 때 모든 효과가 다 떠서 버벅거림".

### 측정 방법

Playwright Chromium, `devices['iPhone 13']`(390×844, DPR 3, 터치), CDP
`Emulation.setCPUThrottlingRate` 4배, 로컬에서 서빙한 `site/`(배포 빌드와 같은 파일).
"이전"은 `792a445`의 `site/`를 같은 스크립트로 잰 값입니다. 로드 → 4초 뒤 스냅샷 → 3초 유휴
(메인 스레드 사용률) → **rAF로 초당 1,400px씩 12화면을 스크롤**(프레임 간격·긴 작업). 원인은 CPU
프로파일·트레이스로 찾았습니다.

처음에는 CDP `Input.synthesizeScrollGesture`(터치)로 스크롤을 쟀는데, 이 에뮬레이션에서는
페이지가 **전혀 움직이지 않았습니다**(`scrollY` 0 그대로). 그 "스크롤" 숫자는 사실 유휴 프레임이라
버리고 위 방식으로 다시 쟀습니다. 스크롤을 잴 때는 스크롤 위치가 실제로 바뀌었는지부터 확인합니다.

| 항목 | 이전 | 이후 |
|---|---:|---:|
| 로드 이벤트 | 7.5 s | 2.7 s |
| 첫 10초의 긴 작업 합계 | 9.8 s | 3.4 s |
| 로드 직후 인스턴스 | 520 | 102 |
| 가만히 있을 때 메인 스레드 | 101% | 약 30% |
| 12화면 스크롤(5.7초) 프레임 수 | 64 (11fps) | 222 (39fps) |
| 스크롤 프레임 중앙값 / 50ms 초과 | 83 ms / 62 | 17 ms / 16 |
| 스크롤 중 긴 작업 | 62개, 5.3 s | 13개, 1.0 s |

남은 긴 작업은 새로 가까워진 블록을 처음 그리는 비용입니다. 스크롤 중 효과 생성(`defer`)은
합계 0.1초 남짓이라 생성 작업을 쪼개도 얻을 것이 거의 없습니다.

### 원인과 조치

1. **매 프레임 페이지 전체를 그림** — 트레이스에서 유휴 2초 중 1.6초가 layerize·paint·
   compositing inputs·IntersectionObserver 계산. 70,000px 페이지의 모든 블록이 애니메이션
   한 프레임마다 다시 처리됨 → 먼 모듈 블록 `content-visibility: auto`(핀 블록 제외).
2. **먼 블록을 재서 렌더 건너뛰기를 무력화** — `demo/fold.js`·줄 배치가 시작할 때 모든
   블록의 카드를 측정(1.5초의 강제 레이아웃) → 화면 1.5칸 안 블록만 측정.
3. **보이지 않는 효과까지 시작할 때 전부 생성** — 520개 → `Kineto.config({ defer })`(터치 기기)와
   설정 제목 Overflow Text 240개의 지연 부착.
4. **Lazy·Stylize 래퍼가 이미지마다 강제 레이아웃** — 쓰기 사이의 읽기 → 작업 끝의 일괄 측정
   (이미지 40개: 강제 레이아웃 40 → 1).
5. 렌더 건너뛰기의 부작용: 건너뛴 블록은 추정 높이(1,100px)로 있다가 가까워질 때 실제 높이로
   그려지므로, **화면 위쪽 블록이 그려지면 읽던 화면이 밀림**. 데모는 브라우저 스크롤 앵커링을 꺼
   두었고(`overflow-anchor: none`, 해시 재고정·사이드 내비 잠김 때문) iOS에는 아예 없음.
   처음에는 이동 전에 지나갈 블록을 모두 재 두는 방식(`prepareJumpTo`)으로 막았는데, 목표가
   멀면 휴대폰에서 클릭 한 번이 0.2~0.4초(4배 감속이면 1초 넘게) 멈췄고, 스크롤바 끌기·End 키·
   페이지 내 찾기·테스트의 이동은 막지 못했음 → 세 가지로 바꿈:
   - **직접 하는 스크롤 앵커링**(`demo/main.js` `blockAnchor`): ResizeObserver가 레이아웃 뒤·페인트
     전에 알려 주면, 읽는 선(고정 헤더 아래) 위로 지나간 블록의 높이 변화만큼 페이지를 옮김. 다른
     스크립트의 부드러운 스크롤(맨 위로 버튼)과 손을 뗀 뒤 관성으로 흐르는 터치 플링 중에는
     기다림 — 페이지를 옮기면 둘 다 멈추기 때문. Lenis가 휠 스크롤을 easing 중이면 그 시작·목표
     값도 같이 옮김. 한 번에 한 화면 넘게 움직인 **점프 프레임**에서는 화면 가운데를 품은 블록(점프
     목표)의 높이 변화는 옮기지 않음 — 건너뛴 블록 안의 요소로 `scrollIntoView()` 하면 브라우저가 그
     블록을 먼저 그려서 겨냥하므로, 그 성장을 또 보정하면 목표가 화면 밖으로 밀렸음(`demo-qa`의
     Rolling Ticker가 이것으로 실패). 높이를 바꾸는 데모 작업(줄 배치·워밍업)은 프레임 시작(rAF)에서
     해서, 프레임 사이에 페이지를 읽는 스크립트가 "밀렸다가 아직 안 돌아온" 상태를 보지 않게 함.
   - **이동은 `KINETO_BLOCKS.jumpTo()` 하나로**: 부드러운 이동은 매 프레임 목표 위치를 다시 읽는
     글라이드이고, 목표가 두 화면보다 멀면 한 화면 앞까지 먼저 건너뜀. 사이드 내비·`#hash`·
     페이지 안 링크·비교 시트·공유 링크가 모두 이것을 씀.
   - **워밍업**: 플링 중에는 앵커링을 못 하므로, 페이지가 멈춰 있을 때 화면 위쪽 6화면 안의 한 번도
     그려지지 않은 블록을 가까운 것부터 하나씩 그려 실제 높이를 기억시킴.

   결과(휴대폰·데스크톱): 사이드 내비 이동 네 곳 모두 목표에 정확히 착지(클릭 순간 동기 작업
   3ms 이하), 도움 없는 즉시 이동도 정확히 착지, 그 뒤 휠로 20번 거슬러 올라가도 화면 밀림 0px
   (데스크톱은 Lenis 포함), 맨 위로 가는 네이티브 부드러운 스크롤도 끝까지 감.
6. **딥 링크가 다른 모듈로 감**(렌더 건너뛰기로 드러난 잠재 버그): 인트로가 스크롤을 잠근 동안
   블록이 그려지며 위치가 바뀌자, 스크롤 스파이가 그때 보이던 블록으로 주소(`#mod-…`)를 바꿨고,
   인트로 뒤 `startModules()`는 바뀐 주소로 이동함(`b2_navigation`의 `#mod-counter` →
   `#mod-overflowText`). 또 사이드 내비 활성 링크의 `scrollIntoView()`가 잠긴 동안 페이지 맨 위로
   끌어올렸음 → 딥 링크로 연 페이지는 그 이동이 자리 잡을 때까지 스파이가 기다리고, 활성 링크는
   내비 자신의 스크롤 영역만 움직임.

7. **WebKit 전용 두 가지**(세 엔진 레인에서 발견): ① 화면 크기를 바꾸면 "ResizeObserver loop completed
   with undelivered notifications" 페이지 오류 — Overflow Text가 ResizeObserver 콜백 안에서 자신을 다시
   만들어 같은 프레임에 또 알림을 받음(렌더 건너뛰기와 겹칠 때 WebKit이 보고) → 다음 프레임에 다시 만듦.
   ② Playwright `scrollIntoViewIfNeeded()`가 렌더링을 건너뛰는 블록 안 요소로 WebKit을 옮기지 못함
   (페이지가 17,000px 떨어진 채) — JS `scrollIntoView()`와 `jumpTo()`는 정상 → 테스트가 `jumpTo()` 사용.

### v0.12.1·v0.12.2 CI

- `v0.12.1` 릴리스: CI(3645064) 초록 뒤 릴리스 workflow가 같은 검사를 다시 돌리다
  `demo-blocks` CSS Scroll에서 3회 실패 → 게시 안 됨(파이프라인 재설계의 원인).
- `792a445`(v0.12.2 준비) CI: 새 병렬 구조의 첫 실행 — Node 3.6분, Chromium shard 3.7/7.2분,
  WebKit 8.3/6.0분, Firefox 8.3분(전체 약 8분, 이전 25분). `stylize.mjs`가 세 엔진 모두 실패:
  마지막 줄 재배치로 Stylize 여섯째 카드가 접힌(inert) 줄로 내려갔는데 테스트가 접기를 열지
  않고 눌렀음 → 테스트 수정. WebKit `browser-smoke`는 flaky로 보고(재시도 통과) → 1초 고정
  예산을 조건 대기 5초로.

## 2026-09-24 v0.12.0 태그가 게시되지 않은 원인과 v0.12.1

`v0.12.0`은 `cf962db`에 태그됐지만 Release 워크플로(#83)의 `Verify · Chromium · package`(`test:browser`)와
`webkit · release gate`가 실패해 publish 단계가 돌지 않았습니다. npm `latest`는 0.11.0, GitHub Release도 0.11.0이
마지막이고, 데모 사이트는 `main` CI가 초록일 때만 배포되므로 이전 빌드(0.11.0, 54개 모듈)에 머물렀습니다.
원격 로그는 로그인 없이 볼 수 없어서, 같은 커밋을 이 컨테이너에서 재현해 원인을 찾았습니다.

| 확인 | 결과 |
|---|---|
| `cf962db` WebKit `demo-polish` | "a tab revealed after hidden initialization must place its active pill" `{width:0}` — 재현 |
| 원인 | 숨겨진 패널에서 만든 Tabs가 표시에 `width: 0`을 써 두고, 드러날 때 스타일시트 전환이 0부터 시작. WebKit은 바쁜 페이지에서 그 전환에 프레임을 늦게 줘서 80ms 뒤에도 0 |
| `cf962db` Chromium 같은 순간 | 드러난 직후 0px → 40ms 153px → 80ms 198px(같은 전환). 느린 CI 러너에서 같은 단언이 실패했을 가능성이 가장 큼. 이 컨테이너의 `cf962db` Chromium 브라우저 레인 36개는 모두 통과 |
| 수정 후 | 두 엔진 모두 드러난 즉시 224px, 전환 없음. `lifecycle-edges`에 5초 전환으로 결정적 재현 케이스(수정 전 실패 확인) |
| 절차 | `release:ship`이 `main`과 태그를 함께 푸시해, 검증 안 된 커밋에 태그가 먼저 생겼음 → 이제 그 커밋의 CI 통과 뒤에만 태그 |

같은 조사에서 나온 것: 포인터를 따라가는 모듈 일곱 개가 매 프레임 일정 비율로 움직여 120Hz에서 같은 150ms에
39% 더 멀리 감(Tilt 11.4° → 15.9°, 수정 후 11.4° / 11.8°, `motion-timing`이 rAF 시각을 직접 정해 결정적으로 비교).
Tilt·Magnetic·Cursor·Mouse Parallax의 숫자 `ease`에 곡선 문자열이 들어가면 NaN(데모 설정창이 곡선 편집기를 제공).
Mouse Parallax 기본 프리셋이 `smoothing`을 읽지 않음, 계약 기본값 0.12 ↔ 코드 0.08. Card Glow 복귀 검사는 고정 900ms
대기에서 결과 대기로(느린 WebKit에서 복귀가 늦어 실패하던 원인은 위의 프레임 의존).

태그는 옮기지 않는다는 규칙대로 수정은 새 패치 `v0.12.1`로 나갑니다. 이 컨테이너 전용 한계: WebKit `demo-polish`의
"mobile hero landing" 단계는 소프트웨어 렌더링으로 데모가 초당 몇 프레임밖에 못 받아 1초 샘플에 프레임이 2개뿐이라
멈춥니다(`cf962db`와 현재 모두 같은 프레임률 — 회귀 아님, v0.11.0 CI에서는 통과).

## 2026-09-24 소유자 데모 리뷰 반영 (원인 계열 정리)

소유자가 라이브 데모에서 아홉 가지를 짚었습니다(Squircle 코드 복사, Radial이 숨겨짐, Slider 블록이 모든 variant를
늘어놓음, Reveal 모서리, Class Hook 이후 고정 섹션 겹침, CSS Scroll 네이티브 탭이 안 움직임, Card Glow 배치,
Liquid Glass 품질, Dock 끊김). 증상마다 고치기보다 원인 계열을 찾아 닫았고, 그 배경과 남은 구조 부채는
[아키텍처 리뷰](ARCHITECTURE-REVIEW.md)에 있습니다.

| 항목 | 원인 | 결과 | 게이트 |
|---|---|---|---|
| Dock 끊김 | 라이브(구) 코드의 패킹 알고리즘 — 현재 `main`에는 이미 소유자 수정이 있음 | 같은 스윕에서 떨림 83회(라이브) → 0회. 수정 전 코드로 되돌리면 새 검사가 60회로 실패 | `magnetic-dock` |
| Radial 숨김 | 유일한 카드가 Slider 블록에 있었음 | Radial 블록에 `data-kt-radial` 카드, 드로어는 Slider radial 필드에서 도출 | `demo-blocks`·`nav-parity`·`drawer-layout` |
| Slider가 모든 variant를 늘어놓음 | 블록이 카드를 전부 출력(페이지 70,126px) | 블록은 측정한 두 줄 + "데모 더 보기 +N"(61,243px, 폰에서는 한 장씩 두 줄) | `demo-blocks` |
| Reveal 모서리 | `.card .reveal-demo-card` 규칙이 스테이지 안쪽 상자까지 적용 | 설정 패널에 바로 닿은 상자만 아래 모서리를 폄 | `demo-blocks` |
| 고정 섹션 겹침 | 레이아웃 변화 뒤 ScrollTrigger 위치가 갱신되지 않음(헤드리스로 그 화면을 재현하지는 못함) | 코어가 body 높이 변화 뒤 refresh | `layout-refresh` |
| CSS Scroll 네이티브 정지 | `overflow: hidden` 스테이지가 타임라인을 캡처 | 데모는 `overflow: clip`, 라이브러리는 캡처 감지 → 대체 경로 + `KT_NATIVE_FALLBACK` | `css-scroll`·`demo-blocks` |
| Card Glow 배치 | 현재 빌드는 이미 3×2로 정렬됨 | 변경 없음(라이브가 이전 빌드) | — |
| Liquid Glass | 굴절 프로파일이 띠 안쪽 끝에서 배경을 약 15배로 늘림 | (1−u)² 프로파일, 베벨 폭 상한, 빛 방향 명암, 데모에서 끌어 보기 | `card-glass` |
| Squircle 코드 복사 | 현재 빌드는 이미 모든 카드에서 복사 가능 | 변경 없음 | `demo-code-access` |

데모를 고치며 읽은 라이브러리에서 나온 결함(각각 수정 전 코드로 되돌려 실패를 확인): 옵션 값 HTML 주입 4곳과
Overflow Text 속성 항목(이전 빌드는 페이로드로 이미지 4개 생성·스크립트 4회 실행), 다른 출처로 리다이렉트된
Page Transition 응답 주입, `<img id="gsap">` DOM clobbering, 계약과 어긋난 옵션 이름 충돌 목록(11건),
destroy 뒤 쓰기(Sticky Header·Parallax·Bottom Sheet·Counter), Tilt resume, Radial `autoplay: true`,
동작 줄이기에서 사라지던 기능(Lightbox·Date Time·Sticky Header·당겨서 새로고침), Presence `exit`,
Vue `v-motion` 재생성, MCP의 `__proto__` 조회, 옮겨진 노드의 IntersectionObserver 묶음에서 첫 기록만 읽던
Lazy·Reveal·Slider/Radial·Vibrate(Ambient Media 안의 Lazy 이미지가 뜨지 않음 — 데모 QA animated-media 단계가
이 컨테이너에서 멈추던 진짜 원인. 가짜 묶음으로 결정적으로 재현).

검증: 전체 `test:node`(각 단계 개별 실행), Chromium 브라우저 레인 전체, 새·보강 브라우저 게이트 세 엔진
(`layout-refresh`·`css-scroll`·`card-glass`·`markup-trust`·`lifecycle-edges`·`demo-blocks`·`magnetic-dock`),
framework QA(React·Vue·jQuery·하이드레이션·SSR), 데모 QA(GIF·WebP·APNG 연속성까지 통과, 마지막 MP4 단계는
이 컨테이너의 Chromium이 H.264를 재생하지 못해 멈춤 — `canPlayType('video/mp4; codecs="avc1…"')`가 빈 문자열.
Kineto가 붙기 전 `readyState`에서 멈추므로 컨테이너 전용).
예산은 실측과 이유를 주석으로 남기고 다음 KB로 올렸습니다(ESM 618.8/168.6, min 484.2/149.9, UMD 482.3/149.2 KB;
패키지 640.3 KB 압축 + CI 여유 1.5 → 642; 소비자 번들 React 171.6·Vue 173.1 KB).

## 2026-09-24 Unreleased 검증 (Text Transition `pop` · 시간 단위 · Scroll Velocity `blur`)

소유자가 한 제품 사이트에서 제목이 바뀔 때의 글자 애니메이션을 보고 “우리꺼에도 쓸만하겠다”고 했습니다.
그 페이지의 동작을 실제로 재 보니(글자마다 opacity·transform을 40ms 간격으로 기록) 글자는
`opacity 0, translateY(20px) scale(.4) rotate(-15deg)`에서 출발해 약 0.4초에 `scale 1.098, rotate +2.4deg,
-3.26px`까지 넘친 뒤 약 1.1초에 멈췄고, 이전 텍스트는 즉시 교체됐습니다. 감쇠비 0.5 스프링의
해석해와 정확히 맞아(최고점 1.0978·2.45°·−3.26px), 그 곡선을 keyframe으로 샘플링해 Text Transition의
10번째 효과 `pop`으로 넣었습니다(새 모듈이 아니라 variant — 문구가 바뀌는 방식 = Text Transition 그 자체).
효과 이름·문구·색은 가져오지 않았고 데모 문구도 자체 작성입니다.

그 모듈을 읽다가 나온 결함 넷:

1. **Text Transition 조절값이 인스턴스끼리 섞였습니다.** `blur`·`startScale`·`endScale`을 `create()`에서
   모듈 전체의 keyframe 표에 써 넣어, 마지막으로 만든 인스턴스가 다른 인스턴스의 두 번째 텍스트부터
   값을 정했습니다. `tests/browser/text-transition.mjs`가 옛 동작(공유 표)에서 실패하는 것을 확인했습니다.
2. **`hold`가 밀리초로만 읽혔습니다.** 연동 지도가 AI 도구·MCP에 내주는 레시피 `hold: 1.4`가 1.4ms가
   되어 단어가 매 프레임 바뀌었고, Text Split 계약 기본값 `hold: 1.2`는 200ms로 잘렸습니다.
   `utils.timeMs`로 통일(20 이하 = 초).
3. **Scroll Velocity `blur`가 `skew`와 똑같았습니다.** `maxBlur` 0으로 skew transform에 떨어졌습니다.
   `tests/scroll-velocity.mjs`가 옛 코드에서 “blur == skew”로 실패하는 것을 확인했습니다.
4. **설정창 variant 목록이 손으로 쓴 사본이었습니다.** Text Transition은 `flip`, Text Reveal은 `shuffle`이
   빠졌고 Scroll Velocity는 계약에 없는 `combo`를 보였습니다. 여섯 모듈만 보던 검사를 모든 preset 목록으로
   넓혔고, 되돌린 목록에서 실패하는 것을 확인했습니다.

검증: `text-transition` 세 엔진, `scroll-velocity`·`utils`·`demo-control-contract`·`variant-distinctness`
(Text Transition 추가, 10/10 · 전용 카드 2/10)·`copy-i18n`·`site-deploy`, 전체 `test:node`, Chromium 브라우저
레인 전체. 예산은 실측과 이유를 주석으로 남기고 다음 KB로 올렸습니다(패키지 압축은 CI 여유 1.5KB 포함).

## 2026-09-24 Unreleased 검증 (데모 정비 · 런타임 비용 · Canvas Effect — 55번째 모듈)

같은 날 `main`에 들어온 `cd59c10`(DOM 스캔·Stylize·Scroll Velocity 성능) 위에 올렸습니다.
Scroll Velocity는 두 작업이 같은 개선(안정되면 쉬고 입력이 깨움)을 따로 만들어, `cd59c10`의
구현(`destroyed` 가드 포함)을 유지하고 이쪽에서는 화면 밖 일시정지만 더했습니다.

### 새 모듈 추가 근거 (ROADMAP §3 ④)

소유자 요청 원문: **“reactbits.dev 이런기능을 직접 탑재하는건 어려울것 같고, 성격도
우리꺼랑 좀 안맞음. 대신 연계해서 쓸 수 있는 발판이나 그런걸 좀 마련해줬으면 해.”**
함께 준 자료는 “React Bits 같은 효과를 AI에게 부탁하려면” 받은 프롬프트였고, 그 요구사항
— rAF, devicePixelRatio 상한, 리사이즈, 포인터·스크롤 반응, 모바일 품질 조절, 재사용 가능한
컴포넌트 — 이 곧 막힘입니다: 효과를 AI에게 맡길 때마다 그 런타임을 매번 새로 짜게 되고,
그렇게 만든 컴포넌트는 Kineto의 수명주기(화면 밖·숨은 탭 일시정지, 축소 모션, destroy,
`data-kt-*`, React·Vue 어댑터) 밖에 있습니다. 그래서 효과가 아니라 **효과를 돌리는 호스트**를
모듈로 넣었습니다. 요구사항 `MK-CANVAS-001`로 잠갔습니다.

### 측정 (데모, 1440×900, 헤드리스 크로미엄)

| 항목 | 이전 (`e58442a` 배포본) | 이후 |
|---|---|---|
| 유휴 rAF 콜백 / 초 | 787 (전부 Kineto) | **78** (Kineto 0 — 나머지는 GSAP·ScrollTrigger) |
| 유휴 스타일 재계산 | 약 290 ms/s | **16~29 ms/s** |
| 유휴 메인 스레드 작업 | 약 830 ms/s | **약 400 ms/s** (남은 것은 화면에 보이는 애니메이션의 래스터) |
| 실행 중인 CSS 애니메이션 | 65 (대부분 화면 밖) | **8** |
| 로딩 중 긴 작업 합계 / 최장 | 4.1~4.5 s / 1.2~1.4 s | **2.85~3.3 s / 0.69 s** |
| Overflow Text 150개 생성 시 강제 레이아웃 | 200 | **1** |

유휴 비용의 가장 큰 원인은 rAF가 아니라 **타이머**였습니다: Loading Indicator의 터미널
프레임이 화면 밖에서도 초당 약 230번 텍스트 노드를 바꿨고, 데모 CSS의
`.card:has(.replay-row:not(:empty))`·`body:has(#kt-lightbox:not([hidden]))` 때문에 그때마다
카드 전체, 또는 페이지 전체가 다시 검사되었습니다. 플레이그라운드가 장착되면 replay 행은
전부 사라지므로 앞의 규칙은 한 번도 맞지 않으면서 비용만 냈습니다.

### 측정하면서 드러난 버그

1. **Loading Indicator `resume()`이 어떤 상태든 `running`으로 바꿨습니다.** 숨은 탭 왕복이
   모든 인스턴스에 `resume()`을 불러, 완료되거나 숨긴 인디케이터가 되살아나고
   `statechange`를 보냈습니다. 화면 밖 일시정지를 같은 경로에 얹었다면 스크롤할 때마다
   그랬을 것이라, `suspend(on)`이라는 조용한 경로를 따로 두었습니다.
2. **안정 루프의 `pause()`가 취소한 프레임 id를 남겼습니다.** `wake()`는 `rafId == null`일
   때만 예약하므로, 움직이는 중에 멈춘 커서·패럴랙스는 resume 뒤 영영 움직이지 않았습니다.
   `idle-cost.mjs`의 2b 단계가 되돌린 코드에서 실패하는 것을 확인했습니다.
3. **복합 터미널 로더가 휴대폰에서 한 줄을 차지하지 못했습니다.** 통합 격자의
   `.module-block-body--dense.grid>.card{grid-column:auto}`가 앞쪽 모바일 규칙과 명시도가 같고
   뒤에 있어서 이겼습니다. 기존 검사는 “스테이지 안에 들어가는가”만 봤고, 대체 글꼴에서는
   우연히 들어갔습니다. 이제 `fullRow`도 확인합니다.
4. **캔버스는 padding box를 채우는데, 백킹 스토어를 content box로 잡았습니다.** 데모
   스테이지의 24px 패딩만큼 작게 그려져 늘어나 보였습니다. `canvas-effect.mjs` 1단계가
   되돌린 코드에서 `{width:300, …}`로 실패하는 것을 확인했습니다.
5. **`data-kt-*` 값은 JSON으로 해석됩니다.** 그래서 `effect` 자리에 정의 객체가 마크업에서
   들어올 수 있었고, 셰이더 문자열이 컴파일될 뻔했습니다. 옵션으로는 등록된 **이름**만
   받습니다. `canvas-effect.mjs`(Node)가 되돌린 코드에서 실패하는 것을 확인했습니다.

### 검증

- `npm run lint && npm run build && npm run test:node` 통과.
- 브라우저: 전체 `test:browser`(크로미엄) 통과. 새 검사 `idle-cost`·`create-cost`·
  `canvas-effect`·`text-word-wrap`·`browser-smoke`(55개 모듈)는 Firefox·WebKit에서도 통과.
  Firefox 헤드리스에는 WebGL이 없어 `canvas-effect`가 셰이더 대신 대체 경로를 실제로 검증합니다.
- 각 새 검사는 고치기 전 코드로 되돌려 실패하는 것을 확인했습니다(unread 루프, 화면 밖
  marquee, rafId, Overflow Text 200 레이아웃, 코드 복사 칩, 로더 resume, padding box, 이름 전용).
- 이 컨테이너에서만: `b2_navigation`의 히어로 스냅 궤적 검사가 다른 측정과 동시에 돌 때
  한 번 실패했다가 단독 재실행에서 통과했습니다(CPU 경합, 회귀 아님).

### 예산

| 항목 | 이전 | 이후 |
|---|---|---|
| `kineto.umd.js` raw / gzip | 460.5 / 141.1 KB | **476.1 / 146.9 KB** |
| `kineto.js` gzip | 159.3 KB | **165.9 KB** |
| `canvasEffect` 모듈형 엔트리 gzip | — | **5.2 KB** (ROADMAP §4: 3KB를 넘는 primitive는 모듈형 분리 필수 — 충족) |
| full / React / Vue consumer gzip (Vite) | 158.2 / 162.4 / 163.2 KB | **164.7 / 168.7 / 169.7 KB** |
| core + 모듈 엔트리 (core-reveal / core-three) | 16.2 / 31.6 KB | **16.2 / 31.6 KB** (변화 없음) |
| 패키지 packed / unpacked / 파일 | 605.2 / 1970.5 KB / 80 | **630.4 / 2037.6 KB / 81** |

## 2026-09-21 CI 복구 — 배포가 세 커밋 동안 멈춰 있던 이유

`30d057f`(squircle) 부터 CI 가 계속 실패했고, `Deploy demo site` 는 CI 성공에 달려 있어
그동안 전부 `skipped` 였습니다. 즉 glass·fold·dock·tap·pull 은 **공개 데모에 올라간 적이
없었습니다.** 마지막 초록불은 `70c3100`(2026-09-20 20:05 UTC) 입니다.

원인은 두 층이었습니다.

**1층 — `Run demo QA`:** `tests/browser-smoke-page.js` 의 `smokeCases` 에 squircle
픽스처가 없어 `smoke registry mismatch; missing: squircle` 로 떨어졌습니다. 이 블록이
`demo-qa.mjs` 의 맨 끝이라 그 앞은 전부 초록으로 보였고, 로컬에서 `test:node` 만 돌리면
잡히지 않습니다(`test:demo` 는 별도 스크립트). → `ad772aa`.

**2층 — 크로스브라우저 레인:** 1층이 실패하면 이 잡은 `skipped` 되므로, glass·fold·dock·
tap·pull 은 크로미엄 밖에서 **한 번도 검증되지 않은 채** 있었습니다. 1층을 고치자 레인이
처음 돌면서 셋이 걸렸습니다.

| 증상 | 정체 |
|---|---|
| webkit: `destroy() must leave the panel exactly as it found it` | **라이브러리 버그.** 아래 참조 |
| webkit: `the lit edge must follow the pointer` | **테스트 문제.** 손으로 만든 `new PointerEvent('pointermove', { clientX })` 는 웹킷에서 좌표가 전달되지 않습니다. Playwright 의 실제 입력 경로로 교체 |
| firefox·webkit: `the backdrop must actually be blurred` | **환경.** 헤드리스 파이어폭스·웹킷은 `backdrop-filter` 선언을 받고도 합성을 하지 않습니다. 같은 줄무늬 위에 인라인 `backdrop-filter` 를 건 대조용 div 로 먼저 재고, 실제로 그리는 엔진에서만 픽셀을 단언하도록 변경(대조군 실측: 크로미엄 12.9배, 나머지 1.0배) |

### 라이브러리 버그: `style` 속성은 한 번 지워서는 지워지지 않습니다

세 엔진에서 같은 최소 예제로 측정했습니다 — 요소를 새로 만들고 `el.style.setProperty()`
한 뒤 `removeAttribute('style')`:

| 엔진 | 결과 |
|---|---|
| Chromium | `<div style="">x</div>` |
| WebKit | `<div style="">x</div>` |
| Firefox | `<div>x</div>` |

크로미엄과 웹킷은 속성 제거 요청에 대해 선언 블록을 비운 다음 **그 빈 블록을 다시
직렬화**합니다. 두 번째 `removeAttribute` 는 깨끗하게 지웁니다. `snapshotAttributes` 가
이걸 몰랐으므로, **속성을 스냅샷하고 인라인 스타일을 쓰는 모든 모듈**이 `destroy()` 후
`style=""` 를 남기고 있었습니다. 크로미엄 전용 테스트로는 보이지 않았습니다 — 라디얼
메뉴가 마크업을 글자 단위로 비교하기 전까지는요.

`src/utils.js` 한 곳에서 고쳤고(`tests/utils.mjs` 가 가드 자체를 검사합니다), 역검증으로
가드를 빼면 그 테스트가 실패하는 것을 확인했습니다.

### 이 컨테이너에서만 실패하는 것(회귀 아님)

`tests/browser/lazy-stylized.mjs` 의 webkit 비디오 검사(코덱), `tests/browser/measure.mjs`
의 슬라이더 타이밍, `tests/animated-media-qa.mjs` 의 7초 대기. 셋 다 `HEAD` 워크트리에서도
같게 실패하며, 앞의 것은 마지막 초록불 CI(`70c3100`)에서 통과했습니다.

## 2026-09-21 Unreleased 검증 (Radial menu — 메가메뉴 세 번째 레이아웃)

### 새 모듈이 아니라 레이아웃인 이유

ROADMAP §3 대로, 얹힐 자리가 있으면 모듈을 늘리지 않습니다. 방사형 메뉴에서 새로운
것은 **항목이 어디에 놓이는가** 하나뿐이고, 트리거·ARIA(`aria-haspopup` /
`aria-expanded` / `aria-controls`)·키보드(Enter/Space/↓ 열기, Esc 닫고 포커스 복귀,
←/→ 상위 이동)·한 번에 하나만 열림·바깥 클릭으로 닫힘은 전부 메가메뉴가 이미 갖고
있습니다. 그래서 `megaMenu` 의 세 번째 `layout` 입니다.

라이브러리에 이미 `radial` **모듈**(슬라이더의 원형 캐러셀, `data-kt-radial`)이 있는데,
이름이 겹쳐 보여도 다른 축입니다 — 하나는 캐러셀 배치, 하나는 메뉴 레이아웃이고
속성도 `data-kt-radial` 대 `data-kt-mega-menu` + `layout="radial"` 로 갈립니다.
소유자 요청(bencho.dev 목록 중 “Radial menu — 방사형 메뉴”)의 단어를 그대로 쓰는 쪽이
검색과 문서에서 헷갈림이 적다고 판단했습니다.

### 레이아웃을 분기가 아니라 객체로 나눈 이유

`doOpen()` 안에 `if (radial)` 를 하나 더 넣으면 네 번째 레이아웃에서 또 하나가 붙습니다.
"패널이 어떻게 오고 가는가"만 레이아웃마다 다르므로 그 부분만
`slidePanels()` / `radialPanels()` 두 객체로 떼어 냈습니다
(`attach` / `open` / `close` / `cut` / `detach`). 네 번째 레이아웃은 분기가 아니라
객체 하나입니다.

### 측정으로만 알 수 있던 것 둘

1. **`hidden` 이던 패널에는 상자가 없어서 전환이 실행되지 않습니다.** 접힌 상태를
   화면에 한 번 반영(`void panel.offsetWidth`)한 다음에 여는 클래스를 붙여야 합니다.
   그러지 않으면 항목이 펼쳐지지 않고 제자리에 그냥 나타납니다 — 실측으로는 첫 항목과
   마지막 항목의 거리가 90ms 시점에 똑같이 120px 로 나와 `stagger` 검사가 잡습니다.
2. **`hidden` 은 `display:none` 이라 진행 중인 전환을 끊습니다.** 마지막 항목이 돌아온
   뒤에야 패널을 감출 수 있고, 그래서 닫을 때 고리가 사라지지 않고 접혀 들어옵니다.

### 검증

`tests/browser/mega-radial.mjs` — 모듈이 써 넣은 사용자 지정 속성이 아니라
`getBoundingClientRect()` 로 잰 **화면상의 위치**만 봅니다. 속성을 되읽으면 `setProperty`
가 동작한다는 것밖에 증명하지 못하기 때문입니다. 반원(120px·5개), 완전한 원(마지막 한 칸을
빼서 겹치지 않는지), `stagger` 가 실제 선행인지, `--kt-menu-ring-scale` 이 고리를 반으로
줄이는지, 닫는 동안 항목이 돌아오는 중인지, `destroy()` 후 마크업이 글자 단위로 같은지를
확인합니다. 네 가지 역검증(0°가 12시가 아니게, 완전한 원을 count-1 로, 패널을 먼저 감추게,
`stagger` 를 0 으로)으로 검사가 비어 있지 않음을 확인했습니다.

### 예산

실측값과, 그 값이 넘어선 직전 상한입니다. 상한은 실측을 다음 KiB 로 올림한 값이므로
"직전 상한"은 직전 실측보다 크거나 같습니다.

| 항목 | 직전 상한 | radial 실측 | 새 상한 |
|---|---|---|---|
| `kineto.js` raw / gzip | 589 / 159 KB | **590.1 / 159.3 KB** | 591 / 160 KB |
| `kineto.min.js` raw | 462 KB | **462.4 KB** | 463 KB |
| `kineto.umd.js` raw / gzip | 460 / 141 KB | **460.5 / 141.1 KB** | 462 / 142 KB |
| `kineto.css` raw | 45 KB (직전 실측 44.6) | **45.0 KB** | 46 KB |
| Vue consumer gzip | 162 KB | **163.2 KB** (Vite) | 163 KB |
| 패키지 packed / unpacked | 603 / 1965 KB | **605.2 / 1970.5 KB** | 606 / 1971 KB |

`full`(158.2)과 `react-adapter`(162.4)는 각자의 상한 안에 남아 움직이지 않았습니다.

## 2026-09-21 Unreleased 검증 (Liquid Glass · Fold)

### 새 모듈이 아니라 variant 인 이유

ROADMAP §3 이 정한 대로, 얹힐 자리가 있는 효과는 모듈을 늘리지 않습니다.
글래스는 **포인터에 반응하는 카드 표면 처리**이므로 `cardGlow` 의 일곱 번째 variant,
폴딩은 **두 배치 사이를 건너는 방식**이므로 `flip` 의 move style 입니다.
후자는 ROADMAP 이 “`flip` 과 겹치는 새 `layout` 모듈을 만들지 않는다”고 못박아 둔
바로 그 경우입니다.

### 글래스가 피해야 했던 함정

`cardGlow` 는 다른 모든 룩에서 카드에 `isolation: isolate` 를 겁니다. 그런데
**격리된 stacking context 안의 `backdrop-filter` 는 필터링할 배경이 없습니다** —
computed style 은 완전히 정상인데 유리만 투명하게 나옵니다. 그래서 `glass` 는 격리를
건너뛰고, `tests/browser/card-glass.mjs` 는 스타일이 아니라 **그려진 픽셀**을 잽니다:
8px 줄무늬 위 패널의 PNG 가 옆의 맨 줄무늬 대비 **11.1배**(필터 미적용이면 1배,
단색으로 덮으면 1배 미만 — 숫자 하나로 세 실패 모드가 갈립니다).

두 번째: 글래스 옵션은 **`mode === 'glass'` 분기 안에서** 읽어야 합니다. 팩토리 상단에서
읽으면 `scripts/derive-variant-options.mjs` 가 모든 variant 에 귀속시켜, spotlight 에서도
설정 서랍에 글래스 컨트롤이 뜹니다.

굴절은 `src/modules/surface/glass.js` 의 부호거리장으로 패널마다 만든 변위맵이고,
SVG 필터를 `backdrop-filter` 로 쓰는 방식이라 현재 크로미엄 전용입니다. 필터 요소는
패널 자신의 레이어 안에 있어 id 충돌이 없고 destroy 와 함께 사라집니다.

### 폴딩 검사에 대조군을 둔 이유

`fold` 는 `crossfade` 와 고스트 경로를 공유하고, 둘을 가르는 것은 **블러 하나**입니다.
그래서 `tests/browser/flip-fold.mjs` 는 `crossfade` 를 옆에서 같이 돌리고 “저쪽은 끝까지
선명할 것”을 함께 단언합니다. 블러가 빠지면 두 효과가 같아지는데, 대조군이 없으면
그 사실을 아무도 눈치채지 못합니다. 또 **요청한 옵션이 아니라 브라우저가 실제로 재생 중인
키프레임**을 읽으므로, 모드가 조용히 `slide` 로 떨어지면 통과하지 못합니다.

### 예산

| 항목 | squircle 이후 | glass·fold 이후 |
|---|---|---|
| `kineto.min.js` raw | 450.1 KB | **454.3 KB** |
| `kineto.js` gzip | 154.8 KB | **156.2 KB** |
| full consumer gzip | 153.5 KB | **154.9 KB** |
| 패키지 packed / unpacked | 589.2 / 1920.1 KB | **594.1 / 1937.0 KB** |

## 2026-09-21 Unreleased 검증 (Squircle — 54번째 모듈)

### 새 모듈 추가 근거 (ROADMAP §3 ④)

소유자 요청 원문: **“단순 css는 squircle radius안되는데 그거 적용가능하게 지원해주면 좋겠음.”**
구체적 막힘: 디자인에서 쓰는 모서리 곡선을 `border-radius`로는 그릴 수 없고,
CSS `corner-shape`는 2026-09 기준 **크로미엄 전용**(약 65%)이라 Safari·Firefox에는
대안이 아예 없습니다. 이 문장이 근거 ④의 감사 기록입니다.
요구사항 `MK-SQUIRCLE-001`로 잠갔습니다.

### 측정으로만 알 수 있던 것 셋

크로미엄의 `corner-shape`를 옆에 놓고 비교하면서 찾았고, 셋 다 명세를 읽어서는
나오지 않았습니다.

1. **폴리필이 `border-radius`를 지우지 않으면 스퀘어클이 둥글게 나옵니다.** 클립과
   반지름이 **교집합**으로 적용되어 더 깊게 자르는 쪽이 이깁니다. 원보다 평평한
   모양(squircle·square), 즉 사람들이 실제로 요청하는 그 둘이 조용히 무효가 됩니다.
2. **음수 `superellipse(K)`는 지수를 분수로 넣는 게 아니라 거울상입니다.** 측정:
   `scoop`이 45° 대각선과 만나는 지점이 반지름의 **70.7%**(분수 지수 해석은 75%).
3. **양 끝에서 `Math.cos(Math.PI / 2)`는 0이 아니라 6.1e-17** 이고 아주 작은 지수를
   씌우면 0.98이 됩니다. 사분원이 끝점에 닿지 못해 `notch`가 막대로 무너졌습니다.
   끝점을 계산하지 않고 적어 두는 것으로 해결했습니다.

### 검증

`tests/browser/squircle.mjs` — 6개 모양(square·squircle·round·bevel·scoop·notch)을
크로미엄의 `corner-shape`와 **모서리 면적**과 **대각선 교차점**으로 비교합니다.
가로 방향 거리로 비교하지 않는 이유는 모서리 양 끝에서 곡선이 거의 수평이라
히트테스트의 2px 오차가 수십 px로 증폭되기 때문입니다(실측: squircle 행 하나에서만
13px). 면적 불일치 1.4~2.0%, 대각선 교차점은 해석해와 0.5px 이내
(squircle 15.5/15.9, round 29/29.3, bevel 49.5/50, scoop 74.5/75).
테두리 다시 그리기와 destroy 복원도 같은 파일에서 확인합니다.

### 서랍 툴팁 검사의 사각지대

`tests/help-coverage.mjs`가 `demo/playground.js`의 **첫 `FIELDS` 리터럴**만 읽어
서랍이 실제로 만드는 50개 모듈 중 32개만 검사하고 있었습니다. 나머지는 아래쪽
`Object.assign`으로 붙으며, 거기 추가된 옵션은 (?)가 없어도 “0 gaps”로 통과했습니다.
실제 스크립트를 실행해 `KinetoPlayground.fields`를 읽도록 바꾸자 **16개 모듈 110개
옵션**이 한 번도 툴팁을 가진 적이 없음이 드러났습니다. 목록은 줄어들기만 하는
래칫(`KNOWN_GAPS`)으로 고정했고, 툴팁을 쓴 뒤 목록에서 지우지 않아도 실패합니다.

### 예산

| 항목 | 이전 | 이후 |
|---|---|---|
| `kineto.umd.js` raw | 445 KB | **448.0 KB** |
| `kineto.js` gzip | 153.1 KB | **154.7 KB** |
| full consumer bundle gzip | 153.5 KB | **153.5 KB** |
| 패키지 packed / unpacked / 파일 | 582.9 / 1903.0 KB / 79 | **588.7 / 1919.1 KB / 80** |

## 2026-09-20 Unreleased 검증 (Native Reveal 반복 경계)

Claude의 페이지 전환·비교 화면 작업과 분리한 worktree에서 수정했습니다.
`once:false`도 `observeOnce`만 사용하던 native 일반 프리셋은 새 실제 스크롤
검사에서 수정 전 13개 항목이 실패했습니다. 마스크 계열 감지기를 공유해
진입·이탈·역진입·역이탈, 현재 진행률의 역재생, Replay 후 감지 유지와
중단 중 경계 변경 후 재개를 연결했습니다. `once:true`에서도 요청한 경계
콜백은 관찰하되 모션은 한 번만 실행합니다.

자체 transform을 감지 기준에서 제외하여 역재생이 스스로 재진입을 만드는
경계 진동을 막습니다. 중첩 overflow 스크롤, 다섯 transform 프리셋의 경계,
여섯 콜백 안의 destroy와 작성자 DOM 복원을 검사합니다. 새 wrapper·상시
측정 RAF·공개 옵션·의존성은 없습니다. 기존 마스크/GSAP/저성능 검사를 포함한
Reveal 23종은 Chromium·Firefox·WebKit 모두 통과했습니다.

Node 24 산출물: 574.5KiB 압축 / 1879.6KiB 해제 / 79개 파일,
ESM raw 561.2KiB / min ESM 440.2KiB / UMD 438.3KiB입니다.
측정된 추가 구현 비용만 상한에 반영했으며 gzip·runner variance·소비자 예산은
유지합니다. Once 도움말 7개 언어와 모듈 문서·로드맵을 갱신했습니다.
실기기와 no-WAAPI 일시정지 지원은 이번 자동 검사로 완료 처리하지 않습니다.

통합 검사에서 기반 커밋 `ee9d8c0`의 비교 영역 ARIA 라벨이 언어 변경 후에도
한국어로 남는 실패를 확인했습니다. 정적 `aria-label` 대신 실제 모듈 제목과
번역되는 버튼 문구를 `aria-labelledby`로 참조합니다. 기존 번역 검사는 유지하고
34개 비교 영역의 이름 참조 및 7개 언어 변경 검사를 추가했습니다.

최종 Node 24.20.0 `npm run ci`는 종료 코드 0으로 통과했습니다. React/Vue
SSR·hydration·반복 mount/unmount, 연동·MCP, 실제 tarball 설치, 전체 데모와
Chromium 회귀를 포함합니다. 추가 Reveal 검사는 Firefox·WebKit에서도 통과했고,
5개 잠금파일 감사는 취약점 0건입니다. 문서·로드맵·diff 공백 검사도 통과했습니다.
기존 Lazy/Stylize의 오프스크린 GIF 검사는 환경 감지로 제외된 상태이며,
별도 클릭 미디어 GIF/APNG/WebP 1회 재생 검사는 통과했습니다.

## 2026-09-20 Unreleased 검증 (이미지 시간 보존·Core 정지 소유권)

소스와 공개 번들에서 지연·리빌·완료 대기 중 pause/숨김 전환, 정지 이미지
resize 보류, 중단 중 replay, 콜백 내부 replay를 회귀 검사로 재현했습니다.
RAF와 타이머를 중단할 때 남은 시간/진행률을 보존하며, 정지 이미지 resize는
재개 시 한 번만 그립니다. 숨김 상태의 초기 렌더링·콜백도 보류합니다.

공개 API에서만 남던 실패는 Core가 visibility 복귀 때 명시적 pause도 풀던
문제였습니다. Core record에 사용자 정지 상태를 분리하고 공개 메서드 후킹을
유지하면서 자동 정지와 사용자 정지를 구분합니다. `tests/update-model.mjs`는 인스턴스/전역 pause, 숨김 중
resume, 기존 반환값, destroy 이후 비활성 상태를 검사합니다. 이미지 브라우저
probe는 실제 PNG 픽셀 위에서 RAF·타이머·visibility·resize를 제어하고,
기존 실제 재생 영상 및 GIF 환경 감지 검사는 유지합니다.

Node 24 실측 비용: 패키지 압축 572.9KiB / 해제 1874.9KiB / 79개 파일,
ESM raw 559.7KiB / UMD raw 437.2KiB입니다. 해당 상한만 각각
573/1875/560/438KiB로 반영했습니다. Vite React 153.1KiB, Vue 154.2KiB가
기존 경계를 넘어 adapter 상품 예산만 1KiB씩 반영했습니다. 기존 runner variance,
full/core 조합 예산, 런타임 의존성 0개와 배포 파일 수는 유지합니다.

최종 Node 24.20.0 `npm run ci`는 종료 코드 0으로 통과했습니다. 수정된 소스와
공개 번들의 이미지·영상 회귀는 Chromium·Firefox·WebKit 모두 통과했습니다.
기존 공개 pause/resume 후킹 검사(`test:perf`)도 수정 없이 통과했습니다.
문서 계약·로드맵·diff 공백 검사도 통과했으며, 오프스크린 GIF 연속 재생은
세 엔진의 기존 환경 감지에 따라 제외했습니다(별도 클릭 미디어 검사는 통과).

7개 언어 Hold 도움말을 이미지/영상 공통 동작으로 교정하고 모듈·Core 문서와
로드맵을 갱신했습니다. 물리 모바일 기기와 OS 백그라운드 전환은 미검증이며,
소유자의 이번 요청에 따라 공개 데모 배포를 진행합니다(npm 출시는 별도).

## 2026-09-20 Unreleased 검증 (Stylize 영상 실행·시간·정지)

이전 검토의 영상 후속 항목을 실제 디코딩된 MP4로 재현했습니다. 새 테스트는
수정 전 수동/뷰포트 실행 조건, 로드 전 replay, delay/hold와 pause 예약 등에서
실패했습니다. 영상 실행 조건을 이미지와 맞추고, 리빌 시계는 활성 프레임 사이의
시간만 누적하도록 수정했습니다. 모듈·영상 pause와 숨김 탭에서는 RAF를 취소하며
재개할 때 지연·진행·완료 대기 시간을 보존합니다. 콜백 destroy/replay 이후에는
이전 실행이 완료되거나 다시 예약되지 않습니다.

`tests/browser/stylize-video-probe.js`는 실제 영상 픽셀 위에서 RAF·재생 상태·
visibility·IntersectionObserver를 제어해 경계를 검사합니다. 직접 소스와 빌드된
공개 API를 각각 검사하며 기존 실제 재생 영상 검사도 유지합니다. 이는 실제 OS의
백그라운드 전환이나 물리 모바일 기기 검증을 대체하지 않습니다. 세 엔진의 기존
오프스크린 GIF 검사 제외는 계속 별도 환경 제한으로 기록합니다.

데모의 기존 Halftone Video 설정을 유지하고 Trigger·Hold 도움말 7개 언어를
교정했습니다. 새 API·기본값·런타임 의존성·배포 파일은 추가하지 않았습니다.
이미지 경로의 pause/숨김 탭 예약과 timer 보존은 별도 잔여 항목입니다.

Node 24 패키지 실측은 압축 571.7KiB / 해제 1872.1KiB / 79개 파일입니다.
중복 스타일·이벤트 연결을 공유해 최초 해제 1872.7KiB에서 줄였으며, 기존
1872KiB 경계를 넘는 확인된 수정 비용만 반영해 해제 상한을 1873KiB로 조정했습니다.
압축 572KiB 상한·파일 수·소비자 번들 상한은 유지합니다.
개별 raw 산출물도 ESM 558.8 / min ESM 438.3 / UMD 436.4KiB로 기존 경계를
넘어 각각 다음 1KiB로 올렸습니다. 해당 gzip은 149.9 / 133.5 / 132.8KiB로
기존 상한 안이며 gzip·runner variance·외부 엔진 경계 검사는 그대로입니다.

최종 Node 24.20.0 `npm run ci`는 종료 코드 0으로 통과했습니다. 직접 소스와
공개 번들의 새 영상 회귀 검사는 Chromium·Firefox·WebKit 모두 통과했습니다.
기존 Lazy 별칭·Reveal·Slider·Glitch 검사, React/Vue SSR·hydration, 연동·MCP,
소비자 번들 및 tarball 검사도 포함합니다. 문서 계약·로드맵 검사와 diff 공백
검사도 통과했습니다. push·공개 사이트 배포·npm 게시·실제 모바일 기기 검사는
수행하지 않았습니다. 권장 릴리스 분류는 기존 계약 복구에 해당하는 patch입니다.

## 2026-09-20 Unreleased 검증 (Stylize 후속 검토)

`ed12b0d`까지의 Stylize·비교 시트 작업을 검토했습니다. 모션 축소 환경에서
`motion: drift`가 정지 이미지의 픽셀을 계속 바꾸는 것을 새 브라우저 단언으로
재현했습니다. persist 질감과 원본 미디어 재생은 유지하고 Kineto가 더하는
`motion`·`pointer`만 비활성화했습니다.

직접 모듈 API의 이미지·영상 destroy를 멱등 처리해 종료 후 수정한 스타일을
반복 destroy가 덮지 않게 했습니다. 이미지 컨트롤러의 onRendered/onProgress
안에서 destroy할 때 이후 RAF·ResizeObserver·후속 콜백을 예약하지 않도록
종료 상태를 다시 확인합니다. 렌더러·프리셋·공개 API·기본값은 유지합니다.

Node 24에서 `tests/browser/stylize.mjs`가 Chromium·Firefox·WebKit 모두
통과했습니다. 기존 픽셀/팔레트·pointer·reveal·video 검사와 함께, 모션 축소
픽셀 정지·직접 API의 반복 종료·3개 콜백 종료 경로의 잔여 작업 0을 검사합니다.
세 엔진 모두 raw GIF 오프스크린 프레임 변화가 감지되지 않아 기존 환경 감지에
따라 GIF redraw 검사는 건너뛰었습니다. 이를 GIF 연속성 검증 완료로 집계하지
않습니다. 실제 iOS/Android·스크린리더·공개 배포는 이번 범위에서 미검증입니다.

`test:structure` 실측은 227개 settings host와 53개 모듈 인덱스이며 오래된
CONTEXT의 217개 집계를 수정했습니다. ROADMAP §10의 이미 완료된 전용 카드·
비교 시트·Stylize 분리 항목을 정리하고, 영상 trigger/timing 및 pause 예약
정책은 코드 검토상 남은 항목으로 명시했습니다(아직 동작 재현 전).

Node 24.20.0에서 전체 `npm run ci`가 종료 코드 0으로 통과했습니다.
React/Vue hydration·연동/레지스트리·MCP·데모·Chromium 회귀 및 패키지
검사를 포함하며, 기존 번들·패키지 예산은 변경하지 않았습니다(배포 파일 79개).
후속 `test:roadmap-readiness`·`test:docs`와 `git diff --check`도 통과했습니다.
검증 중 공유 작업 트리의 수정분이 `23c8965`로 커밋된 것을 확인했으며,
해당 코드에 대한 로컬 검증 근거입니다. 원격 CI·배포·npm 게시 성공을 뜻하지 않습니다.

## 2026-09-19 Unreleased 검증 (연동 배치: observe · 연동 지도 · 레지스트리 · MCP)

v0.10.0 게시 직후 같은 클라우드 클론(Node 22.22 · npm 10.9 · Chromium 141)에서 검증했습니다.
원격 CI(Node 24 · 최신 Playwright 세 엔진)가 최종 권위입니다.

### `Kineto.observe()` (29번째 Core API)

`tests/observe.mjs`(jsdom)가 root당 단일 observer(멱등), 마이크로태스크 배칭, 제거 시 인스턴스 정리,
core teardown 이후 생존, `attributes` 옵션, `disconnect()`, 전역 `destroy()` 연동, SSR 비활성 핸들을
검증합니다. `tests/types.ts`가 `KinetoObserveOptions`/`KinetoObserverHandle`을 strict로 컴파일합니다.
실제 라이브러리 검증은 아래 attachment QA의 React client render 케이스가 담당합니다.

### 연동 지도와 생성물

`tests/integrations-contract.mjs`: 12개 생태계·31개 의도·88개 레시피가 기능 계약(53개 모듈)과 일치,
53개 모듈 커버(의도 없는 모듈 0), Figma 규칙이 실제 의도를 가리킴, 생성 문서 18개·레지스트리 13개·MCP
계약 사본 6개가 현재 상태, README·예제 README가 unscoped 패키지명을 쓰지 않음.

### 실제 라이브러리 attachment QA (`tests/integrations/attachment-qa.mjs`)

MUI 7.3.11·Mantine 8.3.18·Chakra 3.37.0·antd 5.29.3(React 19.3.0 SSR → jsdom → `Kineto.scan()`),
React client render + `Kineto.observe()`(붙임·해제), Vuetify 3.13.4·PrimeVue 4.5.5(Vue 3.5.43 SSR)
— 18개 검사 통과. GSAP 엔진이 필요한 모듈은 jsdom에서 초기화되지 않으므로 속성 전달만 확인하고,
엔진이 필요 없는 모듈(tilt·magnetic·glitch·cardGlow)로 인스턴스 생성을 증명합니다.

### shadcn 레지스트리 QA (`tests/integrations/registry-qa.mjs`)

13개 항목 유효성, `site/r/*.json`이 원본과 바이트 일치, registry-item 스키마, 실제 `@types/react`로
strict TypeScript 통과, shadcn CLI 3.8.5가 새 프로젝트에 URL 형식(provider·reveal·counter·utils·
ai-rules)과 `@kineto` 네임스페이스(`registries` 템플릿, 로컬 HTTP 서버) 두 방식으로 설치, lib alias
재작성과 `@dong-gri/kineto` 의존성 추가 확인.

### Bootstrap 5 공존 QA (`tests/integrations/bootstrap-qa.mjs`, Chromium)

bootstrap 5.3.8 CDN 파일 2개의 SRI가 설치 패키지와 일치(오프라인 검증), 원격 `<link>/<script>` 전부
integrity 보유, `.carousel`+`data-kt-slider`·이중 툴팁·`.placeholder`+lazy 조합 없음. 실제 페이지에서
모달(포커스 Bootstrap 소유, 본문 reveal 재생), 툴팁 1개(Kineto 0개), 아코디언(본문 reveal), 캐러셀
(slider 인스턴스 없음), 동적 카드 tilt, 동적 토스트 textReveal 붙임·제거 시 해제, KPI 카운터
`12,800`·`98%`·`42` 도달, `.row` display flex 유지, `Kineto.destroy()` 뒤 Bootstrap 모달 정상, 콘솔·
페이지·요청 오류 0.

### Kineto MCP 서버 (`packages/kineto-mcp`)

`npm test`가 순수 로직(모듈 목록·필터, 영/한 의도 랭킹, 라이브러리 우선 판단, 스니펫, 옵션 검증
did-you-mean, Figma 레이어 매핑·자동 이름 무시)과 stdio 왕복(도구 7개·리소스 4개·프롬프트 1개, 입력
스키마가 경로 문자열·비식별자 옵션 키·400자 초과 질의를 거부)을 검증합니다. Kineto 0.10.0 계약 사본.

### 게이트·문서

lockfile 5개 경계(`lockfile-boundary`), 감사 5개 대상 0 취약점(`audit:lockfiles`), 공급망 하한
(picomatch 4.0.7 / 2.3.2 라인별), Dependabot 5개 npm 디렉터리, `test:release`가 `test:node`의 모든
단계(`test:observe`·`test:integrations`·`test:mcp`)가 두 워크플로우에 있음을 확인, `docs-navigation`이
README 7개 언어·문서 인덱스·Getting Started·AI 프롬프트 가이드의 연동 링크와 생성 문서 표식을 확인.

### 측정과 예산

Node 22 기준 readable ESM 541.9/144.7KB, min ESM 425.7/129.1KB, UMD 423.9/128.5KB(raw/gzip),
release package 552.9KB packed / 1820.6KB unpacked / 77 files, Vite full 143.6KB·React 147.5KB·
Vue 148.6KB, Rolldown full 143.3KB·React 147.8KB·Vue 149.2KB. `observe()`의 실측 비용(약 1.7KB raw /
0.5KB gzip)만 반영해 raw 번들·패키지 상한을 다음 KB로 올렸고 gzip 상한·runner variance·소비자
예산·77개 파일은 유지합니다.

### v0.11.0 후보 검증 (release:prepare 이후)

`release:prepare -- minor`로 버전을 0.11.0으로 올린 소스(연동 지도 `libraryVersion`, MCP 계약 사본
`kinetoVersion` 포함)에서 lint·build·Node suite 전체(`test:observe`·`test:integrations`·`test:mcp`·
`test:release`의 mcp-v 경로 포함)·`npm pack --dry-run`(77개 파일)·lockfile 5개 감사(0 취약점)를
다시 통과했습니다. 브라우저 레인은 `measure.mjs`의 “slider leave resumes from remaining time” 검사
하나가 이 컨테이너에서 간헐적으로 실패합니다(같은 실행에서 hover 시점의 진행률이 0.009~1.0으로 흔들려
autoplay 타이머 자체가 불안정한 환경 요인; 변경 전 checkout에서도 동일하게 재현). 나머지 suite는 통과했고
검사는 완화하지 않았습니다. 원격 CI가 최종 권위입니다.

### 이 환경에서 검증하지 못한 항목

`test:demo`의 animated-media 단계는 v0.9.8·v0.9.9·v0.10.0 기준선과 동일하게 이 컨테이너의 Chromium
141에서 실패해 환경 요인으로 분류했습니다. 그 외 lint·build·Node suite 전체(새 게이트 포함)·Chromium
브라우저 레인 전체·`npm pack --dry-run`(77개 파일)이 통과했습니다. Nuxt UI·daisyUI·Tailwind는 문서
전용(attachment는 Vue/React 공통 경로)이며, MCP 서버의 실제 에이전트 클라이언트 연결과 npm 게시는
소유자 확인 항목입니다. 원격 CI는 다음 `main` 푸시에서 확인합니다.

## 2026-09-19 Unreleased 검증 (v0.10.0 후보)

v0.9.9 배포 직후 같은 클라우드 클론(Node 22.22 · npm 10.9 · Chromium 141 · Playwright
Firefox 153 · WebKit 26.5)에서 Lazy 스타일화 미디어 variant와 데모 설정창 결함 수정을
검증했습니다. 원격 CI(Node 24 · 최신 Playwright 세 엔진)가 최종 권위입니다.

### Lazy `dither`·`ascii`·`halftone` (MK-LAZY-008)

세 variant는 `src/modules/lazy/stylizedMedia.js` 하나의 canvas rasterizer를 공유하고,
`src/modules/lazy.js`의 `<img>`·`<video>` 경로는 `readStylizedSettings()`·
`createStylizedCanvasLayer()`·`stylizedRevealFrame()`을 함께 써서 옵션 읽기·레이어·리빌
타임라인이 한 곳에만 있습니다. `tests/browser/lazy-stylized.mjs`가 Chromium·Firefox·WebKit
에서 다음을 실제 픽셀로 확인했습니다: persist 2색 디더가 정확히 paper·ink 두 색만 칠함,
`inverted`가 잉크 비율을 뒤집음, `ditherType`·`inverted`가 렌더 결과를 바꿈, ASCII·halftone이
paper 위에 글리프·점을 그림, 오차 확산+`originalColors`가 원본 색을 유지함, 원본 미디어가
canvas 아래에 남아 있음, 리빌이 레이어를 제거해 원본을 노출하고 `onProgress`가 1로 끝남,
canvas stream `<video>`가 재생 중 다시 그려지고 `pause()`에서 멈춤, `destroy()` 뒤 인스턴스·
wrapper·canvas 0개와 inline style 복원. 애니메이션 이미지 프레임 진행과 canvas stream 프레임
전달은 headless 빌드에 따라 없을 수 있어 원본 요소를 먼저 샘플해 환경이 진행시킬 때만 단언하고
생략 사실을 로그에 남깁니다(이 컨테이너의 세 엔진 모두 GIF 프레임을 진행시키지 않았고, WebKit은
stream 프레임도 전달하지 않았습니다). `tests/lazy-stylized-media.mjs`는 threshold matrix·옵션
정규화·cover 기하·색 파싱 fallback·가짜 2D context 페인팅을 Node에서 고정합니다. 데모 카드 4개는
Chromium에서 리빌 중간·완료 화면을 캡처해 확인했습니다(영상 카드는 이 컨테이너의 Chromium이
H.264를 재생하지 못해 비어 보이며, stream 기반 검사로 대신 검증).

### 설정창 variant gating (데모 결함 수정)

기준선 `9b9449e`에서 CRT 카드의 설정창을 열면 Lazy 컨트롤 24개가 모두 보였고 첫 옵션 변경
뒤에만 숨겨졌습니다(`syncVisibility`가 변경 이벤트에서만 실행). `fieldIsVisible()` 하나가 초기
빌드와 변경 시 모두 쓰이도록 고쳤고 모든 컨트롤이 숨겨진 그룹은 헤더를 그리지 않습니다.
`drawer-layout` 38개 검사(신규 2개: CRT는 duration만 보이고 stepDuration·waveAmplitude·
cellSize·ditherType은 숨김, ASCII 카드는 authored cellSize 10·persist·paper `#0b1220`을 보이고
ditherType·halftoneShape는 숨김)가 통과합니다. Demo control QA는 664/664 컨트롤을 유지하며
conditional-only 집계가 20→38로 늘어난 것은 gating이 열림 시점에 적용된 결과입니다.

### 계약·문서·데모

기능 계약 1.4.0(`media` 능력, 공개 옵션 12개·기본값 선언, variantOptions 파생), 요구사항 3.2.0
(49개), variant 감사 81개(전용 demo 74/81), 설정 도움말 425 필드×7개 언어, 카드 설명 173개,
README 7개 언어 표, module-reference 재생성, 217개 playground. `derive-variant-options --check`,
`sync:options`, `docs:contract`, `generate-module-metadata --check`가 모두 현재 상태입니다.

### 측정과 예산

Node 22 기준 readable ESM 540.2/144.2KB, min ESM 424.5/128.7KB, UMD 422.7/128.1KB(raw/gzip),
release package 549.9KB packed / 1812.0KB unpacked / 77 files, Vite full 143.2KB·React 147.1KB·
Vue 148.2KB, Rolldown full 142.9KB·React 147.3KB·Vue 148.7KB. 스타일화 렌더러의 실측 비용
(약 13KB raw / 4.7KB gzip)만 반영해 JS 번들·패키지·full/React/Vue 소비자 상한을 다음 KB로
올렸고 runner variance·CSS·모듈형 core 예산·77개 파일은 유지합니다. `tests/deps-boundary.mjs`의
UMD 상한은 `scripts/bundle-size.mjs`의 값을 읽어 중복 상수를 없앴습니다.

### 이 환경에서 검증하지 못한 항목

`test:demo`의 animated-media 단계는 v0.9.8·v0.9.9 기준선과 동일하게 이 컨테이너의 Chromium 141
에서 실패해 환경 요인으로 분류했습니다. 그 외 lint·build·Node suite 전체·Chromium 브라우저 레인
20개 suite·`npm pack --dry-run`이 통과했고, Lazy 스타일화 suite는 Firefox·WebKit에서도 통과했습니다.
실기기·공개 배포·원격 CI는 v0.10.0 배포 시 확인합니다.

## 2026-09-18 Unreleased 검증

소유자 체크아웃과 동기화한 클라우드 클론(Node 22.22 · npm 10.9 · Chromium 141)에서
미커밋 Glitch 종료 안전성 작업을 검증해 커밋한 뒤 여섯 개 변경을 추가했습니다.
원격 CI(Node 24 · 최신 Playwright Chromium · Firefox · WebKit)가 최종 권위입니다.

### 데모 공유 링크 정책 (보안)

`?kt=` 링크 하나로 Tooltip `html:true`+`content`, Cursor `template`/`hoverTemplate`,
Toast `icon`, Overflow Text `items`에 마크업을 주입하면 공개 데모에서 `innerHTML`로
스크립트가 실행되는 것을 재현했습니다(수정 전 검사에서 `<img onerror>` canary가
실행됨). 이제 이 필드들은 링크에 직렬화되지도 복원되지도 않고, Cursor 이미지·스프라이트와
Ambient 소스 URL은 데모와 같은 origin일 때만 복원합니다. 설정 패널의 직접 편집은
바뀌지 않습니다. `tests/browser/share-link-policy.mjs`(14개 단언)가 정책 함수, 마크업
페이로드 무력화, 외부·protocol-relative·`javascript:` URL 거부, 같은 링크의 일반 필드
(placement·color·same-origin clickImage) 복원을 검사합니다.

### SRI 검증 태그 재사용

`src/runtime.js`는 같은 엔진 URL의 기존 `<script>`를 integrity가 일치할 때만 재사용합니다.
`tests/engine-loader.mjs`에 검증되지 않은 GSAP 태그가 미리 있는 경우를 추가해, Kineto가
자체 SHA-384 태그를 주입하고 기존 태그를 로드 완료로 채택하지 않음을 고정했습니다.

### Presence 상태 구독과 어댑터 동기화

이 환경에서 framework QA의 "React nested Presence child did not propagate parent exit"가
2초 폴링에서도 항상 실패했습니다. 원인은 어댑터가 자기 `enter()`/`leave()` Promise가 끝날
때만 상태를 갱신해, 부모 전파로 취소·재시작된 자식이 `leaving`에 고정되는 것이었습니다
(v0.9.8 기준선은 120ms 고정 대기가 우연히 전환 창 안에 들어가 통과). Presence 컨트롤러에
`subscribe(listener)`를 추가하고 React/Vue가 이를 통해 `status`/`result`를 갱신합니다.
`tests/browser/presence.mjs`가 전파된 enter/leave의 알림 순서
(`entering→finished→leaving→finished`)와 구독 해제를 검사하며, framework QA
(React StrictMode·Vue·jQuery·hydration·SSR)는 이 환경에서 결정적으로 통과합니다.

### 공용 인라인 스타일 스냅샷

`utils.snapshotInlineStyles()`가 값과 우선순위를 CSSOM 이름으로 기록하고, camelCase·kebab-case·
vendor prefix 이름을 받으며, DOM 어댑터가 노출하지 않는 vendor 멤버(`webkitUserDrag`)는
멤버 값으로 복원하고, 원래 없던 `style` 속성을 남기지 않습니다. Glitch의 지역 복사본을 제거했고
`tests/utils.mjs`에 우선순위·kebab·vendor 멤버·빈 속성 케이스를 추가했습니다. 모듈 lifecycle
Node 검사(regressions·leak·audit·reduced·update)와 Glitch 렌더러 10개·Wave 81개 검사가 통과합니다.

### 배포 사이트 minify

`scripts/build-demo-cdn.mjs`가 데모 소유 JS/CSS 10개를 964.2KB → 745.6KB로 minify해 `site/`에
담습니다(gzip 합계 약 296KB → 238KB). 최상위 바인딩은 mangle하지 않습니다. `demo:cdn --check`와
`test:site`가 배포 바이트 == 현재 소스의 결정적 minify를 단언하고,
`tests/browser/site-smoke.mjs`(17개 단언)가 생성된 사이트의 버전·모듈 수·빌드 스탬프·i18n 테이블·
설정 드로어·실시간 옵션 변경·공유 링크 복원을 first-party 오류 0으로 검사합니다.
`verify-live-site`가 해시 대조하는 런타임 2개 파일은 그대로 dist와 바이트 일치합니다.

### GitHub Actions 고정 갱신

Dependabot 제안 5건(checkout 7.0.1, setup-node 7.0.0, upload-artifact 7.0.1, upload-pages-artifact
5.0.0, deploy-pages 5.0.1)의 SHA를 `git ls-remote --tags`로 업스트림 태그와 대조한 뒤 반영했습니다.
upload-artifact 7은 `archive: true` 기본값을 유지해 검증 tarball 전달과 download-artifact 7이 그대로
동작합니다. 실제 러너 호환성은 이 배치의 원격 CI·Pages 실행으로 확인합니다.

### 측정과 예산

Node 22 기준 release package 535.5KB packed / 1774.2KB unpacked / 77 files, UMD gzip 124.5KB,
min ESM raw 415.1KB, Vite full 139.2KB, React 143.1KB, Vue 144.2KB, Rolldown full 138.9KB.
정확성·보안 바이트의 측정 비용만 반영해 packed 536, unpacked 1775, min ESM raw 416, Vue 소비자
144로 상한을 1KB씩 올렸고 runner variance·77개 파일·모듈 조합 경계는 유지합니다.
`audit:lockfiles`는 3개 lockfile 모두 0 vulnerabilities입니다.

### 이 환경에서 검증하지 못한 항목

`test:demo`의 animated-media 단계(`tests/animated-media-helper.mjs` 7초 대기)와 `b2_navigation`의
"focused skip link is visible in the viewport" 단언은 이 컨테이너의 Chromium 141에서 변경 전
v0.9.8 기준선(`a66de20`)으로도 동일하게 실패해 환경 요인으로 분류했습니다. 그 외 Chromium 브라우저
레인 17개 suite와 Node suite 전체가 통과했습니다. Firefox·WebKit·실기기·공개 배포는 원격 CI와
배포 후 검증으로 확인합니다.

## 2026-09-14 Unreleased 검증

### 후속: Glitch 종료 후 재시작과 스타일 복원

수정 전 직접 소스 회귀 검사에서 텍스트·이미지 계열의 종료 후 작업 재예약,
두 번째 destroy의 후속 스타일 덮어쓰기, 이미지·CRT/VCR·RGB Slice Burst의
소유 스타일 우선순위 손실을 재현했습니다. 종료 상태를 재생/정지 상태와
구분하고 이미지 투명도·필터·애니메이션 재생 상태 및 호스트 스타일을 복원합니다.

Chromium·Firefox·WebKit에서 10개 렌더링 경로(text RGB/Pixel/Noise/CRT,
image CRT/VCR/Image/Datamosh/Reveal, RGB Slice Burst)의 종료 검사가 통과했습니다.
타이머/RAF를 추적해 종료 후 공개 메서드 호출이 새 작업을 만들지 않고,
반복 destroy가 후속 편집을 덮지 않으며 원래 CSS 값·priority가 복원됨을 검사합니다.
기존 Wave 81개 결정적 검사와 실제 hover/scroll·픽셀 차이 검사도 유지합니다.
이 종료 검사는 타이머를 실행하지 않는 계측이며 각 렌더러의 전체 시각 동작을
추가 검증한 것으로 집계하지 않습니다. 실제 모바일 기기·공개 배포는 미검증입니다.

첫 통합 시도는 해제 패키지 상한, 후속 측정은 전체 소비자·React·minified ESM·
UMD raw 경계 초과를 잡았습니다. 실측은 534.4KiB packed / 1771.4KiB unpacked /
77파일, UMD gzip 124.4KiB(약 0.2KiB 증가), Vite full 139.1KiB와 Rolldown
React 143.1KiB입니다. 해제 상한 1772KiB, min ESM gzip 기본 상한 124KiB,
UMD raw 414KiB, full/React 기본 상한 136/143KiB로 해당 항목만 조정했습니다.
기존 runner variance·packed·modular/Vue 예산은 유지합니다. 최적화가 아닌
종료 안전성 수정 비용이며, 정확한 최신 측정치는 생성된 번들 보고서에 기록합니다.

### 후속: Reveal 전용 예제 완성

Blur·Rise·Soft·Rotate에 동일 문구·크기·0.9초 비교 카드를 추가했습니다.
기존 19개와 합쳐 Reveal 23/23 프리셋에 전용 markup이 있으며, 공개 프리셋과
전용 예제 집합이 정확히 같은지 검사해 누락을 방지합니다. 전체 playground는
213개, 확대 감사 전용 예제는 71/78입니다. Lazy 2개·Cursor 1개·Glitch 4개의
전용 예제는 남아 있습니다. 런타임·기본값·계약·번들 예산은 변경하지 않았습니다.

169개 카드 설명·515개 옵션 도움말의 7개 언어 동기화 검사를 통과했습니다.
로컬 Chromium의 reduced-motion 화면에서 새 카드가 같은 폭의 2열로 배치되고
문구가 중앙에 놓이는 것을 캡처로 확인했습니다. 외부 CDN을 비운 로컬 캡처이므로
외부 아이콘·폰트나 공개 사이트의 표시 검증을 뜻하지 않습니다.

Node 24 전체 `npm run ci`가 종료 코드 0으로 통과했습니다. 213개 playground·
652개 고유 컨트롤과 23개 Slider/Reveal 비교 카드의 설정 연결·복사 프리셋·
Replay·줄바꿈·고유 semantic 공유·desktop/390px bounds·Reset 정리를 검사했습니다.
Reveal 23개 프리셋의 native/GSAP·저성능·중간 동작·재생·destroy 검사는
Chromium(전체 CI)과 Firefox·WebKit(별도 직접 실행)에서 모두 통과했습니다.
Rise의 96% 크기와 Rotate의 -8도·92% 시작 변환 단언을 추가했습니다.
실제 모바일 기기·공개 배포는 미검증이며 이번 변경은 Unreleased입니다.

### 후속: Reveal 방향 비교 카드 5개

Fade Down/Left/Right·Slide Down/Right를 동일 문구·크기·0.9초 재생 시간의
전용 카드로 추가했습니다. 기본 시작 위치는 Fade의 40px과 Slide의 자기
크기 100%를 구분해 설명하며, 기존 프리셋 이름·방향·런타임은 변경하지
않았습니다. `distance` 지정 시 픽셀 이동량으로 대체하는 기존 동작도 문서화했습니다.

전용 고위험 variant markup은 67/78, Reveal은 19/23, 전체 playground는
209개입니다. 165개 카드 설명·515개 옵션 도움말의 7개 언어 대응 검사를
통과했습니다. 19개 Slider/Reveal 비교 카드의 설정 연결·고유 semantic 공유·
복사 HTML 프리셋·Replay·작성한 줄바꿈·desktop/390px bounds·Reset 정리를
검사했습니다. 새 카드는 과거 v1 공유 순번을 소비하지 않습니다.

Node 24 전체 `npm run ci`가 종료 코드 0으로 완료됐습니다. 209개 playground와
652개 고유 컨트롤 검사, Chromium의 Reveal 23개 프리셋 × native/GSAP·저성능
경로의 중간 동작·재생·DOM 복원 검사를 포함합니다. 런타임 변경 없이 기존
패키지 77파일과 번들 예산을 유지했습니다. 실제 모바일 기기와 공개 배포는
이번 변경의 검증 범위가 아닙니다.

### 후속: Reveal 비교 카드 5개

Fade·Zoom In·Zoom Out·Flip X·Flip Y에 동일한 문구·박스 크기·0.9초 재생
시간을 사용하는 전용 카드를 추가했습니다. 기존 variant의 기본값이나
런타임은 변경하지 않았습니다. 새 카드는 semantic 공유 링크만 사용하며
기존 v1 순번을 소비하지 않습니다.

전용 고위험 variant markup은 62/78, Reveal은 14/23, 전체 playground는
204개입니다. 카드 설명은 160개로 늘었으며 7개 언어 대응 검사를 통과했습니다.
이 숫자는 전용 데모 범위이며, 모든 variant의 실기기 시각 검증 완료를 뜻하지
않습니다. 로컬 Chromium의 reduced-motion 최종 상태를 직접 캡처해 균등한
카드 폭과 문구 중앙 정렬을 확인했습니다. 외부 CDN을 차단한 캡처이므로 외부
아이콘·폰트 표시의 운영 환경 검증 근거로 사용하지 않습니다.

Node 24 전체 `npm run ci`가 종료 코드 0으로 완료됐습니다. 구조·번역 검사가
새 설명 수와 로드맵 집계 불일치를 잡아 정확히 갱신한 뒤 전체를 다시 실행했습니다.
204개 playground·652개 고유 컨트롤, 14개 Slider/Reveal 비교 카드의 설정 연결·
고유 semantic 링크·desktop/390px bounds·Reset 후 drawer 정리 검사를 포함합니다.
최종 lint와 roadmap readiness도 통과했습니다. 런타임 패키지 77파일과
기존 번들 예산을 유지하며 실제 모바일 기기·공개 배포는 이번 범위에서 미검증입니다.
최종 `npm run test:demo`도 다시 통과했으며, 복사 HTML의 프리셋·전용 Replay
버튼·작성한 줄바꿈 보존 단언을 포함합니다.

### 후속: Wave 색상과 합성 옵션

기본 SVG 왜곡을 유지하면서 명시한 `colors` 배열만 35% 색조로 순환하고,
`blendMode`는 재생 중 대상의 배경 합성으로 적용합니다. 색조는 원본 alpha
안에서 합성하며 DOM/이미지를 복제하지 않습니다. CSS 변수·currentColor는
생성 시 대상 문맥에서 해석합니다. 기존 타이머를 공유하며 종료·이탈·destroy
시 원래 mix-blend-mode와 priority를 복원합니다.

Chromium·Firefox·WebKit 각각 81개 결정적 검사와 실제 hover/scroll·재진입,
원래 DOM 보존·reduced motion·렌더링 픽셀 차이 검사를 통과했습니다.
기본/빨강/파랑/배경 difference 합성의 스크린샷 바이트를 비교해 옵션이
실제 픽셀에 영향을 주는지 확인했습니다. 픽셀 차이는 시각 디자인 평가를
대체하지 않으며, 실제 모바일 기기와 공개 배포는 이번 범위에서 미검증입니다.

측정: 534.0KiB packed / 1770.3KiB unpacked / 77파일. UMD gzip은
124.2KiB로 약 0.3KiB 증가했습니다. 패키지 상한은 535/1771KiB,
readable ESM raw/gzip은 527/139KiB, UMD gzip은 124KiB로 조정했습니다.
기존 runner variance·minified ESM·소비자 조합 예산은 그대로입니다.
이 변경은 최적화 수치가 아니라 선택적 기능 구현 비용입니다.

Node 24 전체 `npm run ci`가 종료 코드 0으로 완료됐습니다. 추가한 테스트의
Event 전역 표기와 중국어 도움말 로캘 누락을 lint/번역 게이트가 잡아 수정한
뒤 전체를 다시 실행했습니다. 652개 데모 컨트롤·515개 도움말 키, 프레임워크·
SSR/hydration·Chromium 회귀·패키지 dry-run을 통과했습니다.

### 후속: 프레임워크 검사의 상태 기반 동기화

React·Vue mount/update/재진입의 고정 100~120ms 대기를 최대 2초의
상태 단언으로 교체했습니다. 기존 단언 49개가 순서까지 동일한지 비교했고,
callback·DOM 제거·상태 전파·누수 검사는 삭제하지 않았습니다.
대기 helper는 즉시 성공, 반복 확인 후 성공, 기존 100ms보다 늦은 150ms 완료,
미완료 시간 초과 및 원본 실패 원인 보존을 검사합니다. 런타임·공개 옵션은
변경하지 않았습니다. 이는 이전 실패의 확정 원인 규명이 아니라, 고정 대기
시간에 의존하던 검사 구조의 보강입니다.

Node 24 전체 `npm run ci`가 첫 통합 실행에서 종료 코드 0으로 완료됐습니다.
React/Vue/jQuery lifecycle, SSR/hydration, 데모·Chromium 회귀 및 패키지
dry-run을 통과했습니다. 추가 브라우저 엔진·실기기·공개 배포는 이번 범위에서
검증하지 않았습니다.

### 후속: class-only Reveal 관찰 재개

Native class-only 경로는 pause에서 IntersectionObserver를 끊은 뒤 resume에서
다시 연결하지 않았습니다. 정지 상태의 class 변경을 막고 필요한 관찰만 재개하도록
수정했습니다. 일반·저성능 티어 각각의 once true/false, 반복 pause/resume,
완료한 1회 진입 보존과 destroy 후 DOM 복원을 Chromium·Firefox·WebKit에서 확인했습니다.
작성자가 연결한 CSS 애니메이션 자체의 정지는 이 기능에 포함되지 않습니다.

패키지는 압축 533.0KiB·해제 1766.4KiB·77파일로 기존 상한을 통과했습니다.
첫 통합 CI는 Vue Transition의 100ms 후 DOM 제거 단언에서 실패했습니다.
이 실패를 Reveal 수정으로 해결했다고 주장하지 않으며, 별도 브라우저 검사와
겹치지 않는 단독 통합 실행 결과를 아래에 기록합니다. 실제 모바일 기기는 미검증이며
변경은 아직 게시하지 않았습니다.

단독 재실행한 Node 24 `npm run ci`는 종료 코드 0으로 완료됐습니다.
Vue Transition을 포함한 프레임워크·650개 데모 컨트롤·전체 Chromium 회귀와
패키지 dry-run을 통과했습니다. 최초 실패의 원인은 확정하지 않았습니다.

### 후속: 저성능 Reveal 경로와 반복 작업 비용

Core가 `fallback(el, options, Kineto)`로 전달한 context를 Reveal의 내부
시작 geometry로 잘못 읽어 선택한 프리셋이 사라지는 문제를 재현했습니다.
추가한 Chromium 검사에서 수정 전 32개 단언이 실패했고, 수정 후에는 저성능
티어에서도 23개 프리셋·class-only·원본 DOM 복원이 통과했습니다.
GSAP·ScrollTrigger가 로드된 경우에도 저성능 재생에서 해당 엔진을 호출하지
않는지 검사하며 Firefox·WebKit에서도 통과했습니다.

Native 완료 목록은 Set으로 관리해 완료마다 전체 배열을 복사·검색하던
작업을 제거했습니다. 공통 keyframe 입력을 자식마다 다시 만들지 않고 재사용하며,
여러 class token의 추가·제거를 각각 한 번의 DOM 호출로 처리합니다.
FPS·배터리 사용량의 개선 수치는 측정하지 않았습니다.

압축 패키지는 532.8KiB, 압축 해제는 1766.1KiB·77파일입니다. 해제 크기가
이전 1766KiB 상한을 약 0.1KiB 초과해 해당 상한만 1767KiB로 조정했습니다.
압축 상한 534KiB·소비자 번들 예산·runtime 의존성 0개는 유지합니다.
이 변경은 아직 게시되지 않았으며 v0.9.8 배포 근거와 구분합니다.
Node 24 전체 `npm run ci`가 종료 코드 0으로 완료됐고, 최종 Chromium
Reveal 검사에도 23개 프리셋의 native/GSAP·저성능 경로가 포함됐습니다.

### 후속: 일반 native Reveal 재생 제어

일반 native Reveal의 Web Animations 경로에서 pause/resume가 시작 지연·
자식 stagger·중간 진행률을 보존하도록 보강했습니다. 작성자의 별도 애니메이션을
유지하며, 완료 후 resume는 재시작하지 않습니다. replay/destroy는 소유한
애니메이션만 취소합니다. 기존 `ease` 움직임과 API 없는 CSS 경로는 유지합니다.
일반 native 반복 viewport callback 및 구형 CSS 경로의 pause/resume는 미지원입니다.

Node 24 `npm run ci`가 종료 코드 0으로 완료됐습니다. 후속 빌드의 패키지는
532.7KiB packed / 1765.9KiB unpacked·77파일이며, min UMD gzip은 123.9KiB입니다.
Reveal의 23개 프리셋 × native/GSAP 및 추가 재생 제어·구형 CSS 경로를
Chromium·Firefox·WebKit에서 검사했습니다.
이번에는 번들·패키지 예산을 올리지 않았습니다. 기존 마스크 전용 경로로 이동한
중복 clipping 처리를 일반 fallback에서 제거했습니다.

이전 문서 수정 `a66de20`의 원격 CI `34805256180`과 canonical Pages
`34806167009`는 성공한 것을 별도 확인했습니다. 이것은 이번 Unreleased 소스의
원격 검사나 npm 게시 성공 근거가 아닙니다.

### 앞선 Mask·Wave 묶음

아래 변경은 로컬 검증 완료 상태이며, v0.9.8 공개 릴리스에 포함된 것으로
표시하지 않습니다. Node 24에서 `npm run ci`가 종료 코드 0으로 완료됐습니다.

- Reveal: 23개 프리셋 × native/GSAP 검사, Mask·Wipe·Clock 반복 진입과 역재생,
  네 경계 callback, pause/resume, stagger 완료, clipping 조상과 destroy 복원을
  Chromium·Firefox·WebKit에서 통과했습니다.
- Wave: 세 엔진에서 각각 65개 결정적 검사와 실제 hover/scroll·SVG 프레임·
  reduced-motion·제거 검사를 통과했습니다. 숨김 탭 정지, 진행률·지연 보존,
  1회 재생과 replay를 포함합니다.
- 데모: Wave 1회 재생 카드, 7개 언어 설명, seed·왜곡량 표시와 복사 설정을
  추가했습니다. 199개 playground와 기존 공유 링크를 전체 데모 QA로 검사했습니다.
- 소비자: Vite·Rolldown 및 React·Vue SSR·hydration·lifecycle fixture를 통과했습니다.
  전체 Vite gzip은 138.4KiB, min UMD gzip은 123.8KiB입니다.
- 비용: 패키지는 약 532.3KiB/압축 해제 1764.7KiB·77파일입니다. 기존 용량
  상한 초과를 확인한 뒤 상태 관리 보강 비용으로 해당 예산만 명시적으로
  조정했습니다. 런타임 연산 감소와 별개로 번들 용량 최적화라고 주장하지 않습니다.
  모듈 조합 예산, 허용 러너 오차, runtime 의존성 0개는 유지합니다.
- 공급망: 추가 실행한 root `npm audit --json`의 취약점은 0건입니다.

현재 Wave의 `colors`·`blendMode`, 일반 native Reveal의 반복 경계 callback, 실기기
iOS/Android·스크린리더와 외부 프로젝트 장기 사용 증거는 남아 있습니다.
이번 브라우저 자동 검사는 실기기 검증을 대신하지 않습니다.

## 2026-09-12 후속 변경 검증

아래는 v0.9.8에 포함된 변경의 로컬 실행 근거입니다. 이후 완료한 원격
CI·npm·Pages 검증은 아래 `배포 후 확인 > v0.9.8`에 별도로 기록합니다.
v0.9.7 공개 릴리스 근거는 보존하며, 후속 Unreleased 소스의 검증과 구분합니다.

| 영역 | 결과 | 검증 범위 |
|---|---|---|
| Slider | 통과 | 세 엔진 10/10 효과의 실제 중간·최종 프레임, 이미지 드래그, 버튼·키보드, Replay·destroy, 앱이 변경한 비소유 host/viewport/Radial 항목 스타일·클래스 보존 |
| Reveal | 통과 | 세 엔진 23개 프리셋 × native/GSAP, 실제 진입, delay/완료 시점, 원본 줄바꿈, 재생 중 제거, 일반 GSAP 경로 반복 진입, callback 내부 destroy 후 후속 변경 차단 |
| 데모 | 통과 | 198개 playground, 650/650 고유 설정(렌더된 control 5,122개), 신규 비교 카드 9개, 390px 배치, 기존 공유 URL, 7개 locale의 실행 중 hero text·ARIA |
| 공급망 | 통과 | Node 24에서 root·consumer·framework 3개 lockfile 각각 취약점 0건 |
| 통합 CI·릴리스 검증 | 통과 | Node 24.20.0 `npm run ci` 및 v0.9.8 `npm run verify`: lint·build·전체 Node·데모·Chromium·npm pack·3개 lockfile 감사, 기존 번들·패키지 상한 유지 |
| 공개 범위 | 확대 | 53개 모듈·29개 Core API·50개 요구사항, runtime 의존성 0개·npm 파일 77개 |

비교 카드 검사의 숨겨진 drawer 본문이 후속 공유 링크 검사에 간섭한 문제는
기존 Reset 경로로 정리해 해결했습니다. 이후 드러난 hero의 이전 언어 ARIA는
정상 사용에서도 재현돼, 언어 전환 시 Blur Text의 DOM·snapshot·접근성 이름을
함께 재생성했습니다. 기존 공유 링크·번역 단언을 제외하지 않았습니다.
Native Scroll Snap의 복원 검사는 CSSOM이 정규화한 공백·세미콜론을 실패로
판정하던 문자열 비교 대신 전체 CSS 속성값·priority를 비교합니다.
`overflow:auto !important` 복원까지 포함한 11개 검사가 통과했습니다.

패키지 예산을 넘긴 초기 구현은 Reveal의 대상 수집·원본 복원·클래스 처리와
Slider의 소유 상태 복원 중복을 통합했습니다. 기존 예산·77개 allowlist는
변경하지 않았습니다. 실기기 iOS/Android·스크린리더, 외부 프로젝트 사례와
문서에 남긴 마스크 계열 반복·Glitch Wave 옵션의 동작 차이는 미완료입니다.

## v0.9.7 자동 검증 기록

| 영역 | 결과 | 세부 내용 |
|---|---|---|
| Lint | 통과 | source, tests, 모든 demo 스크립트 |
| Build | 통과 | ESM, UMD, minified JS/CSS |
| Feature contract | 통과 | 55 modules, 31 Core APIs |
| Owner requirements | 통과 | 48 locked requirements |
| Docs / options parity | 통과 | 생성 문서와 설정 필드 계약 동기화 |
| Package surface | 통과 | ESM, CommonJS, CSS, React/Vue/jQuery entry |
| Lifecycle | 통과 | 이벤트·rAF·Observer 해제 및 reduced-motion 재적용 |
| Bundle budget | 통과 | Node 24 gzip: min ESM 123.2 kB, min UMD 122.5 kB, CSS 9.2 kB; 전체 측정값은 `docs/bundle-size.md` |
| Integrated gates | 통과 | 수정본 `npm run ci`, v0.9.7 `npm run verify`; root·consumer·framework lockfile 모두 취약점 0건 |

## v0.9.7 추가 검증

| 영역 | 결과 | 세부 내용 |
|---|---|---|
| 데모 설정 응답 | 통과 | 런타임 필드 정의 576개와 virtual/ease 확장을 포함한 고유 control 650개 전수 조작, 무반응 0건 |
| 데모 재빌드 | 통과 | 51개 모듈·7개 control 타입의 debounce 적용 완료, 오류·trigger 유실·중복 instance 0건 |

Chromium 검사는 189개 playground에 실제 렌더된 control instance 4,804개를
`module.key:type` 기준으로 중복 제거해 검사합니다. 초기 preset에서 조건부로 숨겨진
23개 control도 포함하며, 각 값을 다른 유효 값으로 바꿔 attribute 또는 생성 코드의
동기 반영을 확인한 뒤 원래 값으로 복원하고 모듈별 실제 재빌드를 한 번 실행합니다.
별도 Node 계약 검사는 `Object.assign()`과 후속 `push()`까지 반영된 전체 런타임
manifest를 읽어 중복 키와 지원하지 않는 control 타입을 차단합니다.

Node 24 첫 시도의 `ERR_INTERNET_DISCONNECTED` 13건은 강제 오프라인 진단에서
동일하게 재현했습니다. 원인은 fixture에서 빠진 GTM 1건·Prism CSS/JS 4건과
두 번 요청된 배지 이미지 8건이었습니다. 신규 Cursor fetch나 로컬 이미지
요청 실패는 없었습니다.

해당 고유 URL 9개만 QA용 noop script·빈 CSS·유효 SVG로 격리하고, 데모
검사 문맥을 항상 offline으로 고정했습니다. 변경 후 데모 초기화와 7개
locale 전환에서 요청 실패·console 오류는 모두 0건입니다. 별도로 주입한
미등록 외부 이미지 요청은 계속 실패하며 console에 실제 URL이 기록됨을
확인했습니다. 공개 사이트의 GTM·배지 markup은 유지합니다.

## 회귀 검증 범위

아래는 Node DOM 회귀 검사와 실제 브라우저 검사의 합산 범위입니다.
문자열·중첩 원본 DOM 복원 경계는 `test:regressions`의 DOM fixture로,
움직임·좌표·이미지 프레임은 실제 Chromium·Firefox·WebKit fixture로 확인합니다.
실제 iPhone·Android 기기의 OS 관성이나 화면 시각 검증으로 집계하지 않습니다.

- Slider 자동재생, hover/manual pause, 남은 시간 유지
- Slider progress ring/bar 전환과 독립 Progress 모듈의 속성 충돌 방지
- 설정 그룹의 1열 전체폭, 2열 가변 높이 배치, 접힘 높이 재계산
- 데모의 고유 설정 전수 옵션 반영, 모듈별 재빌드, trigger 유지와 instance 중복 방지
- GIF·APNG·animated WebP 클릭 이미지의 첫 사이클 변화·최종 프레임 정지·재시작·터치 cleanup을 세 엔진에서 실제 이미지로 확인
- Text Split·Text Reveal·Blur Text의 `<br>`·LF·CRLF·reduced-motion·중첩 원본 DOM 복원과 native flicker 취소/재개
- Counter Slot·Clock의 authored line-height 표시 창 및 overflow·paint containment
- hero 한 제스처의 감속 이동·양방향 착지·잔여 입력 처리, Quad Dot 중복 제거 후 이전 공유 URL 복원
- Cover Reveal gallery의 3개 레이어와 random direction
- Cursor 요소별 라벨·색 capsule
- Reveal order, Counter, Loader, Toast와 모듈 lifecycle
- 모바일 헤더, 사이트맵, 하단 탐색과 맨 위로 버튼의 안전 간격
- 데모의 정적 inline style/script/style block 0건 및 52개 공개 모듈 계약 일치
- 7개 언어의 카드·모듈 색인·설정창 UI 및 513개 옵션 도움말 번역 일치
- Scanner 무진행률 재생과 진행률 지정 시 정지, Loader/Loading Indicator 접근성 역할
- Coverflow·Dissolve·Wipe·Radial별 지원 옵션 노출과 무의미한 옵션 숨김
- Coverflow 활성 그림자 옵션·CSS 토큰·destroy 복원과 설정창 조건부 노출
- 700px 마지막 카드 전체폭, 390px 복합 로딩 문구, 메가메뉴 첫 hover·2열 화면 내 배치
- Firefox/WebKit cross-browser demo-polish: Radial ghost/swipe, 모바일 Mega Menu, drawer reflow, Page Reveal zoom/fixed header, Coverflow/Dissolve clip

## 패키지 확인

배포 전 `npm run test:package-tarball`로 실제 tarball을 별도 프로젝트에 설치해
ESM, CommonJS, CSS와 adapter entry를 확인합니다. `npm run test:package-size`는
압축 536 KiB·해제 1775 KiB·77개 파일의 상한과 배포 파일 allowlist를 검사합니다.
v0.9.9 후보의 Node 22 `npm pack --dry-run` 측정값은 77개 파일, 압축 548.4 kB
(535.5 KiB), 해제 약 1.8 MB(1774.2 KiB)입니다; 공개 tarball 수치는 게시 후 기록합니다.
v0.9.8의 Node 24 `npm pack --dry-run --json` 측정값은 77개 파일,
압축 528.0 kB, 해제 1755.1 kB입니다. 실제 공개 tarball은 540,657 bytes,
registry의 해제 크기는 1,797,191 bytes로 확인했습니다. 이 수치는 릴리스
`92bc1b6`의 근거이며 후속 빌드 비용을 대신하지 않습니다. 다음 릴리스 후보는
최종 빌드한 뒤 위 세 명령을 다시 실행합니다.

<!-- release:prepare updates this source label, not the publication evidence below. -->
현재 소스의 패키지명은
`@dong-gri/kineto`, 버전은 `0.13.1`입니다.

## 배포 후 확인

- `npm run test:live-site`가 `https://kineto.dongri.me`에서 기대 커밋·현재 버전·52개 모듈·GTM·공개 CDN 설치 예시를 확인하고, 페이지가 실제 실행하는 co-deployed JS/CSS의 SHA-256이 테스트된 `dist/`와 같은지 재확인합니다.
- v0.9.6 CI `33947520040`, Release `33947520948`, canonical Pages `33947939177`이 성공했으며 npm에는 SLSA provenance v1 attestation이 함께 게시됐습니다.
- npm registry tarball과 GitHub Release asset은 SHA-256 `bfbd557cb7b34032df71fb2d6b629c4f39ebd03f8b518afcbec3abeca3b948b9`로 byte-for-byte 일치합니다.
- backup sync `33947970148`과 Pages `33947986088` 뒤 `npm run test:live-site:parity`가 두 도메인의 v0.9.6·52개 모듈·GTM·build `8d784b6`·runtime hash `77e3fae55ef1` 일치를 확인했습니다.

### v0.9.7

- [CI `34022107743`](https://github.com/catgarret/kineto/actions/runs/34022107743), [Release `34022108485`](https://github.com/catgarret/kineto/actions/runs/34022108485), [canonical Pages `34022529453`](https://github.com/catgarret/kineto/actions/runs/34022529453)가 모두 성공했습니다. Node 20·22 호환성과 Node 24 전체·Firefox·WebKit 검사를 포함합니다.
- npm 공개 version/latest `0.9.7`과 [GitHub Release](https://github.com/catgarret/kineto/releases/tag/v0.9.7)를 확인했습니다. npm 게시 metadata 시각은 `2026-09-06T08:39:55.559Z`입니다.
- npm/GitHub tarball은 직접 바이트 비교로 동일한 539,534 bytes이며 SHA-256은 `f79d165e05e0f77781826295b02b1fa8e43c0407ab5ad37a96336f569489dcbd`입니다. npm SHA512와 GitHub asset digest도 일치합니다.
- npm publish/v0.1·SLSA provenance/v1 attestation metadata의 subject digest, git commit `32db56e30c0edcecfae0ebd100017c84acc881e3`, Release run이 일치합니다. 별도 암호학적 서명 검증을 수행했다는 의미는 아닙니다.
- [backup sync `34022621240`](https://github.com/catgarret/catgarret.github.io/actions/runs/34022621240), [backup Pages `34022646728`](https://github.com/catgarret/catgarret.github.io/actions/runs/34022646728) 성공 후 `npm run test:live-site:parity`가 두 도메인의 `v0.9.7 / 52 modules / GTM / build 32db56e`를 확인했습니다.
- 2026-09-06 17:44 KST에 각 HTML이 참조하는 자체 JS/CSS 12개와 GIF·animated WebP·APNG·Click Burst SVG 4개가 두 도메인에서 모두 로컬 `site/`와 SHA256 일치했습니다. UMD는 `979166e8665ba347f067e92a1cc1c5c8bdd8bc9e66153b9e0b3aed6ca65ce900`, `main.js`는 `0bb967fe729b4a367028de8445afeb63896ccc02d77bb204b004698099de6ba9`입니다.
- 이 보고서의 후속 docs-only 커밋은 런타임·자체 asset을 변경하지 않습니다. Pages가 새 커밋을 배포하면 HTML build marker만 달라질 수 있으므로, release payload의 build와 현재 Pages build를 구분해 기록합니다.

### v0.9.8

- [CI `34674057118`](https://github.com/catgarret/kineto/actions/runs/34674057118), [Release `34674057605`](https://github.com/catgarret/kineto/actions/runs/34674057605), [canonical Pages `34674519452`](https://github.com/catgarret/kineto/actions/runs/34674519452)가 모두 성공했습니다. Node 20.19·22.12 호환성, Node 24 전체, Firefox·WebKit 및 별도 Release gate의 성공을 공개 API로 확인했습니다.
- npm 공개 version/latest `0.9.8`과 [GitHub Release](https://github.com/catgarret/kineto/releases/tag/v0.9.8)를 확인했습니다. npm 게시 metadata 시각은 `2026-09-12T05:00:06.440Z`, GitHub Release 게시 시각은 `2026-09-12T04:57:05Z`입니다. publish job 성공 직후의 registry 전파 지연은 재게시하지 않고 공개 응답으로 확인했습니다.
- npm/GitHub tarball은 직접 바이트 비교로 동일한 540,657 bytes이며 SHA-256은 `3590f2ce36caaef544811935cb2748000312e781f5f5b2f8fac63990508e29c4`입니다. npm SHA1·SHA512 integrity와 GitHub asset digest도 일치합니다.
- npm publish/v0.1·SLSA provenance/v1 attestation metadata의 subject SHA512가 실제 tarball과 일치합니다. source commit은 `92bc1b688c04c0bf9833abfa53d4200648b80464`, workflow는 `.github/workflows/release.yml@refs/tags/v0.9.8`, invocation은 `34674057605/attempts/1`입니다. 서명·투명성 로그의 암호학적 신뢰 체인 검증은 별도로 수행하지 않았습니다.
- [backup sync `34674543935`](https://github.com/catgarret/catgarret.github.io/actions/runs/34674543935), [backup Pages `34674565133`](https://github.com/catgarret/catgarret.github.io/actions/runs/34674565133)가 성공했습니다. backup Pages commit은 `9a0f39ed394eebc31ffe9a652c6277aa087457e7`이며 포함된 Kineto build는 `92bc1b6`입니다.
- `KT_EXPECTED_BUILD=92bc1b688c04c0bf9833abfa53d4200648b80464 KT_LIVE_ATTEMPTS=2 npm run test:live-site:parity`가 두 도메인의 `v0.9.8 / 52 modules / GTM / build 92bc1b6` 및 co-deployed UMD·CSS 일치를 확인했습니다.
- 2026-09-12 14:04:41 KST(`05:04:41 UTC`)에 각 공개 HTML의 실제 참조로 선택한 자체 JS/CSS 12개와 클릭 미디어 4개가 모두 해당 릴리스의 로컬 `site/` 및 상대 도메인과 byte/SHA256 일치했습니다. GTM script·noscript와 CI·npm·license·jsDelivr 배지 4개도 양쪽에 존재했습니다. 이는 네 배지의 markup 보존 확인이며 외부 배지 서비스의 내용까지 보증하지 않습니다.

주요 공개 asset SHA-256:

| 파일 | SHA-256 |
|---|---|
| `kineto.umd.min.js` | `f50b7ab3506f57d6dc0933d7fdf29435c358e2052d6493e8ffc93b6aeb2b6332` |
| `kineto.min.css` | `c777c609621d688ac6cebdc59d092d9455272348d55d94cabd01f33e10802e31` |
| `main.js` | `7f8b0555c9893518d3799528b9bc07a7700dbd25c4ca1687001ef5423ab1ae93` |
| `assets/click-burst.svg` | `596080f8bec342b88e30a336cebdcc976b0f1a6a538d2fdc3e260987e003931d` |
| `assets/motion-demo.gif` | `c92c37f8a025be36660a05dfc11d5d12464ea0e929b3c6284252964718c4aac6` |
| `assets/motion-demo.webp` | `68f2430e17b5e12c95aec32558aec30a589f2575c9d09007c70f57f697846e11` |
| `assets/motion-demo.png` | `f841f7735a9c73a31b5aef162b84a372ce6dc6ed33cee0f249e1f91c76a603bc` |

### v0.10.0

- [CI `35420646875`](https://github.com/catgarret/kineto/actions/runs/35420646875)(release: prepare v0.10.0, 15m41s: Node 24 full suite 8m16s, Node 20.19·22.12 엔진 계약, Firefox·WebKit smoke)와 [Release `35420648097`](https://github.com/catgarret/kineto/actions/runs/35420648097)(8m07s: Verify·Chromium·package 6m29s, Firefox/WebKit release gate, publish 30s; artifact `verified-package-v0.10.0` 550 KB `sha256:2a003c25e23f2ab13f7891a7ce689a37893fb12c6266cce1450b1dd51203d6ef`)는 성공했습니다.
- **canonical Pages는 배포되지 않았습니다.** [Deploy demo site `35421347873`](https://github.com/catgarret/kineto/actions/runs/35421347873)(#217, 3228d26)는 14초 만에 `Canceling since a higher priority waiting request for demo-site exists`로 취소됐습니다. 원인은 `pages.yml`의 정적 `concurrency.group: demo-site`입니다. Dependabot 브랜치 CI가 완료될 때마다 `workflow_run`으로 만들어지는 Deploy 실행(#214–#216·#218, job 조건 불충족으로 skip)이 같은 그룹에 들어와 진행 중이던 실제 배포를 취소했습니다. 2026-09-19 05:29 UTC 기준 `https://kineto.dongri.me`는 여전히 build `9b9449e`(v0.9.9 UMD `676c4517…`)를 서빙하고, 15분 주기 backup `git.dongri.me/example/kineto`는 build `3228d26`·UMD `a4491a34…`(npm과 동일)를 서빙해 `test:live-site:parity`가 설계대로 불일치를 보고합니다. 수정: 실제 배포(main push·workflow_dispatch)만 `demo-site-main` 그룹을 공유하고 그 외 실행은 `run_id` 그룹을 쓰도록 바꿨으며(`tests/release-automation.mjs`가 고정), 다음 `main` 푸시의 CI → Deploy가 현재 코드로 canonical을 갱신합니다(또는 `pages.yml` `workflow_dispatch`).
- npm `@dong-gri/kineto@0.10.0`의 게시 시각은 `2026-09-19T04:22:09.141Z`, 77개 파일, unpacked 1,855,536 bytes, shasum `239f5dbb305f7a80ea87ce050f60018729924f8f`, integrity `sha512-uNS/RcBMPqih1DiS+iLX7NAU2vm5Sl/mqFbZa7cpPhaJPU7DWmbDr+pE6lTvWyq8oxSHBRUPCsSd1MMD990jAw==`입니다. [GitHub Release v0.10.0](https://github.com/catgarret/kineto/releases/tag/v0.10.0)은 github-actions가 영문 → 한국어 순서의 노트와 tarball asset으로 생성했습니다.
- npm registry tarball과 GitHub Release asset은 563,063 bytes, SHA-256 `50d6d0e0cbeb71ae8fa4b184a3fd2431ee792ff632b17014b2bb23b2584b658f`로 byte-for-byte 일치합니다. tarball 안의 `dist/kineto.umd.min.js`(432,902 bytes, SHA-256 `a4491a343cd5d42ac830b8d14adc34455f49e19f435394e70a4c2d063bd03b16`)와 `dist/kineto.min.css`(45,081 bytes, `c777c609…802e31`)는 릴리스 커밋 `3228d26`의 추적 `dist/`와 동일합니다.
- npm publish/v0.1·SLSA provenance/v1 attestation의 subject SHA512 `b8d4bf45…`가 실제 tarball과 일치합니다. source는 `git+https://github.com/catgarret/kineto@refs/tags/v0.10.0` commit `3228d26cdd91380fdb08af59c2580b7876f6f59f`, workflow는 `.github/workflows/release.yml@refs/tags/v0.10.0`입니다. 서명·투명성 로그의 암호학적 신뢰 체인 검증은 별도로 수행하지 않았습니다.
- 릴리스 커밋 체인은 저자 `Claude <noreply@anthropic.com>`으로 재구성한 커밋(트리는 원본과 동일)이며 `git ls-remote`로 `origin/main == 3228d26`, `v0.10.0 == fd9f01c`(annotated tag)임을 확인했습니다.

### v0.9.9

- [CI `35359625205`](https://github.com/catgarret/kineto/actions/runs/35359625205)(release: prepare v0.9.9, 14m46s), [Release `35359768823`](https://github.com/catgarret/kineto/actions/runs/35359768823)(8m31s: Verify·Chromium·package 7m44s, Firefox/WebKit release gate, publish 28s), [canonical Pages `35361162158`](https://github.com/catgarret/kineto/actions/runs/35361162158)(25s, `github-pages` artifact 669 KB `sha256:900359019a7dbb06b559664dbc34face07153b09a48958af84bec601c7887244`)가 모두 성공했습니다. 앞선 [CI `35357144226`](https://github.com/catgarret/kineto/actions/runs/35357144226)(docs 커밋 `cc95f58`, 13m48s)과 [Pages `35358575972`](https://github.com/catgarret/kineto/actions/runs/35358575972)는 새 GitHub Actions 메이저(checkout 7·setup-node 7·upload-artifact 7·upload-pages-artifact 5·deploy-pages 5)로 처음 실행된 배치이며 Node 20.19·22.12·24, Firefox·WebKit 전부 통과했습니다.
- npm `@dong-gri/kineto@0.9.9`의 게시 시각은 `2026-09-18T15:11:07.865Z`, 77개 파일, unpacked 1,816,800 bytes, integrity `sha512-b2P8XY1LiNCRZuAxjNa38dyhb1OKZ3wjTIwlEAN+d9fs9ggZsHI6TTzgFzDcQma4PBkkQaTAXWFGUBjroXW05A==`입니다. [GitHub Release v0.9.9](https://github.com/catgarret/kineto/releases/tag/v0.9.9)는 github-actions가 영문 → 한국어 순서의 노트와 tarball asset으로 생성했습니다.
- npm registry tarball과 GitHub Release asset은 548,364 bytes, SHA-256 `f9104ab470361136d14fe9f01ff455ac97a717df456f3c985bd065779af210cd`로 byte-for-byte 일치합니다.
- npm publish/v0.1·SLSA provenance/v1 attestation의 subject SHA512 `6f63fc5d…b4e4`가 실제 tarball과 일치합니다. source는 `git+https://github.com/catgarret/kineto@refs/tags/v0.9.9` commit `ba0bb4bcfe51a3fc6919149f7ac1191da4d7a93d`, workflow는 `.github/workflows/release.yml@refs/tags/v0.9.9`, invocation은 `35359768823/attempts/1`입니다. 서명·투명성 로그의 암호학적 신뢰 체인 검증은 별도로 수행하지 않았습니다.
- `KT_EXPECTED_BUILD=ba0bb4bcfe51a3fc6919149f7ac1191da4d7a93d npm run test:live-site`가 `https://kineto.dongri.me`의 `v0.9.9 / 52 modules / GTM / build ba0bb4b`와 co-deployed UMD·CSS의 SHA-256 일치를 확인했습니다. 2026-09-19 00:18 KST(`2026-09-18 15:18 UTC`)에 공개 HTML이 실제 참조하는 자체 JS/CSS 12개(이번 릴리스부터 minify된 데모 자산 포함)와 클릭 미디어 4개가 로컬 `site/` 빌드와 byte 일치했습니다.
- 확인 시점에 backup `git.dongri.me/example/kineto`는 아직 build `a66de20`(v0.9.8)을 서빙했습니다. 15분 주기 `sync-kineto.yml`이 따라잡은 뒤 `npm run test:live-site:parity`로 두 도메인 일치를 별도 확인합니다.

주요 공개 asset SHA-256 (v0.9.9):

| 파일 | SHA-256 |
|---|---|
| `kineto.umd.min.js` | `676c4517e50e84d47dc6bb9f4314818b1d9072b4e7fab733539dbc408860742b` |
| `kineto.min.css` | `c777c609621d688ac6cebdc59d092d9455272348d55d94cabd01f33e10802e31` |
| `main.js` | `f1c685cabc6d691b68b1d8dca898d49e2b66ef6093d75aa5923b63f903eea7d5` |
| `playground.js` | `c6882f95c6788a8acf9e4dd8bc991bd24e9d99e1260c8abb8ed411bb2da7d7c6` |
| `styles.css` | `51d90b3b2c30628338303724f8ce99c8e79c794cd9b6e9a37c193ac560850916` |
| `assets/click-burst.svg` | `596080f8bec342b88e30a336cebdcc976b0f1a6a538d2fdc3e260987e003931d` |
| `assets/motion-demo.gif` | `c92c37f8a025be36660a05dfc11d5d12464ea0e929b3c6284252964718c4aac6` |
| `assets/motion-demo.webp` | `68f2430e17b5e12c95aec32558aec30a589f2575c9d09007c70f57f697846e11` |
| `assets/motion-demo.png` | `f841f7735a9c73a31b5aef162b84a372ce6dc6ed33cee0f249e1f91c76a603bc` |

## 별도 실기기 확인 권장

- 실제 macOS Safari 앱(WebKit 자동화와 구분)
- 실제 iOS Safari와 Android Chrome의 터치·진동
- 장시간 탭 유지 시 메모리와 배터리 사용량

외부 iframe 영상은 same-origin 픽셀 접근이 불가능하므로
`ambientSrc` 또는 `source`로 지정한 이미지를 사용합니다.
