# Kineto 제품·기술 로드맵

> 기준 버전: v0.9.6 · 작성일: 2026-08-02 · 검토: 2026-09-06
> 성격: 일정 약속이 아니라 우선순위와 진입·중단 조건을 정하는 실행 문서
>
> 2026-08-09 검토에서 추가·수정된 부분은 §2 병목 3개 항목, §3 하지 않을 일 2개 항목,
> §8 지표 교체, §11 검토 의견입니다. §11은 당시의 검토 기록으로 보존하며, 채택한 권고는
> 현재 우선순위·완료 목록·자동 게이트에 이미 반영되어 있습니다.

2026-09-05 후속 묶음은 dateTime 입력 경계(96~105)에 이어 배포 무결성·framework
hydration·공급망·데모 재현성·cross-browser 범위(106~129)를 보강했습니다.
현재 미배포 묶음은 설정 전수 검사·CSS scroll 검증과 실사용 줄바꿈·카운터·
클릭 이미지·모바일 스크롤 수정입니다. 구현 완료와 원격 배포 완료를 구분하며,
최종 CI·npm·두 호스팅 결과는 배포 후 QA 이력에 기록합니다.

## 1. 결론

Kineto는 Motion, GSAP, Swiper를 정면으로 대체하는 범용 애니메이션 엔진을 목표로 하지 않습니다.

우리가 가져가야 할 위치는 다음과 같습니다.

> **디자이너가 라이브 데모에서 인터랙션을 조절하고, 개발자가 같은 설정을 HTML 속성·모듈형 JavaScript·프레임워크 어댑터로 가져가는 점진적 인터랙션 시스템**

앞으로의 우선순위는 모듈 수를 늘리는 것이 아니라 아래 네 가지입니다.

1. 기존 52개 모듈의 신뢰도와 일관성
2. 실제 소비자 기준의 초기 로드 비용
3. Vanilla에서 먼저 성립하는 상태·Presence·레이아웃 primitive
4. 외부 사용 사례와 문서로 증명되는 제품 신뢰

## 2. 현재 기준선

### 확인된 강점

- 52개 모듈을 `data-kt-*`, JavaScript API, `core`와 `modules/*` 엔트리로 제공합니다.
- TypeScript 선언이 전체·모듈형·React·Vue·jQuery 표면에 제공됩니다.
- npm 자기 의존성을 제거했고, 설치 tarball과 타입 표면을 CI에서 검사합니다.
- GSAP·ScrollTrigger·Lenis 기본 CDN에는 고정 버전과 SHA-384 SRI가 적용됩니다.
- Chromium 전체 QA와 Chromium·Firefox·WebKit 52/52 공개 모듈 lifecycle smoke가 있으며, transform·clip·fixed/sticky 의존 모듈은 세 엔진의 `heavy-layout` 체크포인트로 별도 검증합니다. lifecycle·패키지·번들 예산·npm provenance 검증도 함께 유지합니다.
- reduced motion, 저사양 fallback, 키보드·ARIA, `destroy()` 복원을 제품 원칙으로 관리합니다.
- v0.9.3은 Node 24/npm 11 전체 검증, npm provenance 공개, GitHub Release와 Pages 배포를 통과했습니다. 배포용 gzip 상한은 유지하고 Node 24 zlib 경계 차이만 별도 variance로 흡수합니다.
- v0.8.104에서 숨겨진 Tabs 패널을 다시 열 때 WebKit의 지연된 `hidden` 반영까지 포함해 indicator를 재측정하고, `tabs.refresh()` 공개 메서드와 bounded follow-up 측정을 추가했습니다. canonical demo에서 52개 모듈·GTM·unversioned CDN 경로를 다시 확인했습니다.
- 52개 모듈의 사용 시점·피해야 할 상황·접근성·성능·reduced motion 상태를 단일 생성 원본과 데모 뱃지, 문서 매트릭스, CI completeness 검사로 연결했습니다.
- v0.8.104 후속으로 `pageReveal`, `pageTransition`, `slider`, `stickyStack`, `stickyHeader`, `lightbox`, `cursor`, `fullpage`의 레이어·클리핑·sticky/fixed 경계를 `demo-polish`의 `heavy-layout` 체크포인트로 고정하고 Chromium·Firefox·WebKit에서 모두 통과시켰습니다.
- v0.8.105에서 소수 초가 포함된 ISO 날짜 입력을 보존 파싱하도록 수정해 Date Time의 `Both · relative + absolute` 데모가 상대 시각과 절대 시각을 함께 표시합니다. 배포 후 canonical demo의 CDN 경로까지 확인합니다.
- v0.9.0에서 단순 Slider에 `scrollSnap:true` native CSS Scroll Snap 경로를 추가하고, 조건 밖 transform fallback과 Chromium·Firefox·WebKit smoke, 소비자 번들·패키지 예산을 함께 검증했습니다.
- v0.9.1에서 Node 24/Linux의 실제 전체 consumer gzip 측정값(133.2KB)을 반영해 제품 130KB 예산은 유지하고 제한된 runner variance만 조정했습니다.
- v0.9.2에서 site/release 테스트 묶음이 실패한 하위 명령을 CI와 Release annotation으로 남기도록 해 원격 러너 실패를 재현 가능한 단위로 분류합니다.
- v0.9.3에서 전체 Chromium 브라우저 QA를 hosted runner 기준 시도당 240초·3회로 제한하고, 재시도 후 실패 시 `test:browser` annotation을 남겨 브라우저 단계의 원격 실패를 바로 분류합니다.
- v0.9.3 배포 후 canonical `kineto.dongri.me`와 별도 백업 `git.dongri.me/example/kineto`가 모두 같은 버전·모듈 수·GTM·build marker를 제공하는 것을 확인했습니다.
- v0.9.4에서 co-deployed runtime hash, 최소 권한 release, 세 lockfile, React·Vue hydration, 52개 cross-browser lifecycle, semantic 공유 URL과 locale별 ARIA를 릴리스 게이트로 고정했으며 실제 태그·Pages 결과는 배포 후 QA 이력에 기록합니다.
- v0.9.5에서 v0.9.4 배포 게이트가 발견한 다국어 맨 위로 이동 ring의 observer 재생성 후 label 회귀를 수정하고, 예제 본문과 사용자 조작 UI를 분리한 결정적 QA를 고정했으며 실제 npm·GitHub Release·Pages 결과는 배포 후 증거로 남깁니다.
- v0.9.6에서 checksum 검증 tarball을 `./release-artifact/...tgz` 형태의 명시적인 로컬 경로로 전달해 npm 11의 Git package spec 오해를 차단하고, v0.9.5 publish 실패는 태그를 변경하지 않은 새 patch로 정방향 수정합니다.

### 현재 병목

- Vite·Rolldown 소비자 fixture가 full·core+1·core+3·States·Presence·React·Vue 비용과 tree-shaking을 예산으로 관리합니다. 남은 병목은 전체 entry가 제품 상한에 가깝고, 실제 운영 앱의 장기 로딩·캐시·조합 비용 증거가 아직 없다는 점입니다.
- React·Vue 기본 어댑터의 Strict lifecycle·SSR·실제 브라우저 hydration은 자동 검증합니다. 남은 확장은 새 wrapper를 늘리는 일이 아니라 nested keyed transition과 shared-layout 요구 증거·identity/focus 정책을 먼저 확보하는 일입니다.
- 52개 모듈과 7개 언어는 유지 비용이 큽니다. 새 기능이 기존 기능의 품질과 문서화를 밀어낼 위험이 있습니다.
- 공개 저장소 지표는 2026-08-31 확인 기준 star 0, fork 0, 공개 issue 0입니다. 코드 품질과 별개로 외부 검증과 사용 사례가 없는 상태입니다.
- Socket 경고를 줄이는 기술 조치는 진행됐지만, 공급망 신뢰는 특정 점수 하나가 아니라 릴리스 provenance, 의존성 최소화, 변경 이력, 대응 절차를 함께 유지해야 합니다. Socket도 경고 심각도와 공급망 위험을 종합해 점수를 계산한다고 설명합니다([Socket package scores](https://docs.socket.dev/docs/package-scores)).
- **테스트가 틀린 이유로 실패합니다.** v0.8.43 릴리스는 같은 assertion에서 반복 실패했는데, 원인은 스타일시트가 아니라 아직 레이아웃되지 않은 패널을 측정한 것이었습니다. `display:none` 요소의 `getComputedStyle`은 used value가 아니라 computed value(`repeat(2, minmax(0px, 1fr))`)를 돌려주고, 이 문자열을 공백으로 자르면 토큰이 정확히 3개가 나옵니다. 즉 **그럴듯하게 틀린 값**이 나왔고, 사람은 CSS를 세 번 고쳤습니다. 브라우저 QA에 “측정 대상이 실제로 레이아웃됐는가”를 먼저 확인하는 규칙이 없으면, 통과율 지표 자체를 신뢰할 수 없습니다.
- **엔진 커버리지가 아직 균등하지 않습니다.** 일반 모듈은 Chromium 전체와 Firefox/WebKit smoke를 유지하지만, transform·clip·fixed/sticky·mask·3D 경계를 쓰는 고위험 목록은 `heavy-layout` 체크포인트로 세 엔진을 함께 검사합니다. `pageReveal`의 `zoom`은 transform이 걸린 `<body>`가 fixed/sticky 자손의 containing block이 되는 동작에서 Safari와 Chromium이 갈렸고, 커버를 `<html>`로 옮겨야 양쪽이 같아졌습니다. 남은 일반 모듈까지 전부 같은 깊이로 올리는 것은 실제 회귀 신호와 실행 비용을 비교해 단계적으로 결정합니다.
- **variant 구분성은 정적 게이트와 실제 시각 검증을 분리해 관리합니다.** `pageReveal` 16개와 Reveal·Lazy·Cursor·Overflow Text·Glitch·Slider 78개는 contract·구현 branch/source fingerprint·생성 설정의 1:1 대응을 자동 검사합니다. 다만 확대 범위 중 전용 데모 markup은 47/78이고 source fingerprint는 픽셀 단위 시각 회귀를 대신하지 않습니다. 남은 병목은 이름 수가 아니라 실제 회귀 신호가 있는 variant의 전용 비교 화면과 cross-browser 시각 검증을 비용에 맞춰 확대하는 일입니다.

## 3. 제품 원칙과 하지 않을 일

### 유지할 원칙

- Vanilla 우선: Core primitive가 먼저 성립한 뒤 React·Vue 어댑터를 얹습니다.
- 점진적 기능 향상: 효과가 실패해도 콘텐츠와 조작 기능은 남아야 합니다.
- 한 기능, 두 진입점: HTML 속성과 JavaScript API가 같은 옵션·동작을 사용합니다.
- 작은 기본 엔진, 선택적 외부 엔진: transform·opacity 중심의 기본 동작은 브라우저 API로 처리하고 복잡한 timeline은 GSAP 등에 위임합니다.
- 기능 추가보다 계약·테스트·데모·문서·삭제 가능한 lifecycle을 먼저 완성합니다.

### 하지 않을 일

- Motion의 모든 CSS 값·gesture·layout API를 복제하지 않습니다.
- Swiper의 방대한 플러그인 목록을 따라 모듈 수를 늘리지 않습니다.
- 기존 `flip`과 겹치는 새 `layout` 모듈을 만들지 않습니다.
- 실제 사용 근거 없이 52개 공개 모듈을 더 늘리지 않습니다.
- 생태계 지표를 만들기 위해 품질이 낮은 예제·홍보성 패키지·의존성을 추가하지 않습니다.
- **서로 구분되지 않는 variant를 개수 유지 목적으로 남겨두지 않습니다.** 나란히 재생했을 때 어느 쪽인지 말할 수 없으면 하나로 통합하고, 빈 자리는 다른 메커니즘으로 채우거나 비웁니다. 판정 기준은 “옵션이 다르다”가 아니라 “움직임의 메커니즘이 다르다”입니다.
- **측정 대상이 레이아웃됐는지 확인하지 않는 브라우저 assertion을 추가하지 않습니다.** rect가 0이거나 computed value가 `repeat(`/`auto`/`none` 같은 미해석 문자열이면 그 시점의 측정은 버립니다.

## 4. 단기 로드맵: 0~8주

목표는 “새 기능이 많은 라이브러리”에서 “도입해도 되는 라이브러리”로 기준을 옮기는 것입니다.

### P0. 측정과 릴리스 안전망

| 후속 항목 | 상태 | 완료 근거 |
|---|---|---|
| 96. 연-월-일 비표준 구분자 | 완료 | `dateTime`이 `-`, `/`, `.`와 한 자리 월·일을 동일하게 검증합니다. |
| 97. 시간 범위 검증 | 완료 | 시·분·초·밀리초 범위를 검사하고 잘못된 값은 `fallback`으로 보냅니다. |
| 98. 명시적 timezone 보존 | 완료 | `Z`, `+09:00`, `+0900`을 정규화하되 입력 offset을 보존합니다. |
| 99. 다국어 rollover 회귀 | 완료 | `ko`뿐 아니라 `en-US`와 slash/dot 입력의 불가능한 날짜 회귀 테스트를 추가했습니다. |
| 100. 입력 경계 문서화 | 완료 | dateTime reference·troubleshooting과 Node 회귀 테스트에 서버 입력 사례를 기록했습니다. |
| 101. 시간대 앞 공백 | 완료 | SQL/ISO 시각의 시간과 offset 사이 공백을 허용하고 명시적 offset으로 해석합니다. |
| 102. 고정밀 소수초 | 완료 | 3자리보다 긴 소수초를 앞 세 자리 밀리초로 일관되게 정규화합니다. |
| 103. 숫자형 날짜 offset | 완료 | `MM/DD/YYYY`·`DD/MM/YYYY`에도 `Z`·`+hh:mm`·`+hhmm` 명시적 offset을 적용합니다. |
| 104. 조합 입력 회귀 | 완료 | 공백 offset·고정밀 소수초·숫자형 offset 조합을 Node 회귀 테스트에 추가했습니다. |
| 105. 호환성 문서 갱신 | 완료 | dateTime reference·troubleshooting에 서버 드라이버별 입력 경계를 설명했습니다. |

| 항목 | 상태 | 완료 근거 |
|---|---|---|
| 소비자 번들 예산 | 완료 | 5개 Vite 소비자 fixture와 gzip 예산을 CI에 추가했습니다. |
| React/Vue lifecycle·SSR | 완료 | React Strict Mode, Vue mount/update/unmount, jQuery lifecycle, React/Vue SSR fixture를 CI에 추가했습니다. |
| 공급망 운영 문서 | 완료 | `SECURITY.md`와 공급망 대응·릴리스 확인 문서를 추가했습니다. |
| 전체 검증 재시도 안전망 | 완료 | CI와 릴리스 검증이 일시적인 러너·브라우저 실패 시 한 번만 재시도하되, 재실행도 반드시 통과하도록 고정했습니다. |
| 데모·문서 경험 개선 | 완료(3차) | 실제 적용 문제를 반영한 CSS 훅·예제, 변경 설정 URL 공유, Vanilla HTML/JS·React·Vue·CSS 복사 탭, 문제 중심 troubleshooting 문서, 52개 모듈 사용·품질 매트릭스와 completeness CI를 추가했습니다. |

#### 1) 실제 소비자 번들 예산

- Vite와 대표적인 한 개 이상의 다른 번들러로 fixture 앱을 만듭니다.
- 다음 import별 minified/gzip 비용을 CI에서 기록합니다.
  - `@dong-gri/kineto`
  - `@dong-gri/kineto/core` + 모듈 1개
  - core + 모듈 3개
  - React/Vue adapter
- 모듈 하나의 변경이 전체 엔트리뿐 아니라 소비자 엔트리에 미치는 비용을 PR에서 확인합니다.
- 중복 chunk와 side effect 때문에 tree-shaking이 막히는 경로를 목록화합니다.

Motion도 전체 패키지 숫자보다 실제 import와 lazy feature 경계를 기준으로 크기를 설명하며, `LazyMotion`으로 초기 기능을 분리합니다([Motion bundle-size guide](https://motion.dev/docs/react-reduce-bundle-size)). Kineto도 “모듈형 엔트리가 있다”가 아니라 소비자가 실제로 받는 바이트로 증명해야 합니다.

**완료 조건**

- 소비자 fixture 4종 이상이 CI에서 설치·빌드됩니다.
- 현재 측정값과 회귀 상한이 `docs/bundle-size.md`에 자동 기록됩니다.
- 모듈형 import가 전체 런타임을 끌어오지 않는다는 테스트가 있습니다.

#### 2) 어댑터 호환성 매트릭스

- React Strict Mode에서 mount → cleanup → mount가 인스턴스·DOM·listener를 남기지 않는지 검사합니다.
- React SSR 렌더와 hydration 전후 DOM 안정성을 검사합니다.
- Vue mount/update/unmount 및 SSR hydration fixture를 추가합니다.
- options 객체가 바뀔 때 무조건 destroy/create할지, `updateModule()`을 쓸지 명시적 정책을 정합니다.
- jQuery는 신규 기능 확장보다 기존 호환성 유지 범위로 고정합니다.

React Strict Mode는 개발 중 Effect에 setup/cleanup을 한 번 더 실행해 누락된 정리를 드러냅니다([React StrictMode](https://react.dev/reference/react/StrictMode)). 어댑터 신뢰도는 별도 편의 기능보다 이 반복 lifecycle을 먼저 통과해야 합니다.

**완료 조건**

- React/Vue 설치 fixture가 CI에 포함됩니다.
- 반복 mount/unmount 후 `Kineto.instanceCount === 0`입니다.
- SSR 단계에서 `window`/`document` 접근 오류가 없습니다.
- 옵션 업데이트 정책과 호환성 표가 문서화됩니다.

#### 3) 공급망·보안 운영 문서

- `SECURITY.md`에 지원 버전, 비공개 신고 경로, 대응 목표 시간을 명시합니다.
- 자동 dependency update는 devDependency와 runtime/CDN 엔진을 구분합니다.
- 릴리스마다 provenance, tarball allowlist, SRI, npm·GitHub Release 일치 여부를 검사합니다.
- Socket 경고는 “점수 올리기”가 아니라 경고별 사실 확인 → 재현 → 수정/오탐 기록으로 관리합니다.

npm provenance는 패키지가 어느 저장소와 빌드 환경에서 만들어졌는지 검증할 수 있게 합니다([npm provenance](https://docs.npmjs.com/generating-provenance-statements/)). 현재 자동화를 유지하되 대응 정책까지 공개해야 외부 사용자가 판단할 수 있습니다.

### P1. 기존 제품 경험 정리

#### 4) 데모를 기능 목록에서 작업 도구로 전환

- 각 모듈에 “언제 쓰는가 / 언제 쓰지 않는가 / 대안”을 짧게 표시합니다.
- 조절한 옵션을 URL에 직렬화해 설정을 공유하고 재현할 수 있게 합니다.
- 복사 코드를 Vanilla HTML, Vanilla JS, React, Vue, CSS 변수 탭으로 구분합니다.
- 실제 콘텐츠가 있는 조합 예제 8~12개를 선별합니다. 효과를 전부 한 페이지에 나열하는 것보다 landing hero, gallery, article, product card 같은 결과물을 보여줍니다.
- 모듈마다 최소 접근성·성능 상태를 표시합니다: keyboard, reduced motion, low-tier fallback, browser coverage.

#### 5) 문서 정보 구조

- “처음 10분”, “모듈 선택”, “조합”, “프레임워크”, “문제 해결” 경로로 재구성합니다.
- 52개 reference와 별도로 문제 중심 가이드를 만듭니다.
- public option에는 타입, 기본값, 적용 대상, live update 가능 여부를 자동 생성합니다.
- CDN 실패, CSP/SRI, SSR, 숨겨진 컨테이너 초기화, Safari 레이아웃 문제를 troubleshooting에 모읍니다.

### 단기 중단 기준

- 새 primitive가 전체 gzip을 3KB 이상 늘리는데 모듈형으로 분리되지 않으면 출시하지 않습니다.
- 어댑터 기능이 Vanilla Core와 다른 의미를 만들면 Core 설계로 되돌립니다.
- 새 모듈 제안은 기존 모듈 조합으로 80% 이상 구현 가능하면 추가하지 않습니다.

## 5. 중기 로드맵: 2~6개월

목표는 Kineto만의 조합 모델을 만드는 것입니다.

### P2. Motion States — v1 prototype 완료, 확장 보류

현재 `variant`는 모듈 preset을 의미하므로 상태 시스템에 같은 용어를 쓰지 않습니다. `states` 또는 `motionState`로 분리합니다.

```js
const cardStates = Kineto.states({
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
});

await cardStates.apply('.card', 'visible');
```

**v1 범위**

- 이름 있는 상태 등록·재사용
- transform·opacity·filter의 제한된 집합
- 부모 상태의 자식 전파
- `delayChildren`, `stagger`, `beforeChildren`, `afterChildren`
- `initial: false`
- 취소 가능한 Promise와 명시적 `destroy()`
- reduced motion에서 최종 상태 즉시 적용
- WAAPI 기본 구현과 선택적 외부 엔진 bridge

Web Animations API는 브라우저 애니메이션 엔진을 JavaScript에 노출하고 재생 제어를 제공합니다([MDN Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)). Kineto의 기본 상태 엔진은 이 범위를 활용하되 임의의 모든 CSS 값을 처리하는 범용 엔진으로 확장하지 않습니다.

**출시 게이트**

- core + states 소비자 gzip 예산을 먼저 정합니다.
- Vanilla API와 HTML의 최소 상태 이름 연결이 동일하게 작동합니다.
- nested orchestration, cancel, replay, destroy, reduced motion 테스트가 있습니다.
- 기존 `reveal`, `textReveal`, `flip`과 역할 경계를 문서화합니다.

**v1 완료 근거 (v0.8.66)**

- `Kineto.states()`와 named export `states`를 제한된 시각 속성 집합으로 구현했습니다.
- `apply`, `replay`, `scan('[data-kt-state]')`, 취소 가능한 Promise, `destroy` 복원을 제공합니다.
- Chromium에서 nested children/stagger, cancel, replay, destroy, reduced motion을 검증하고 SSR 입력 계약을 Node 테스트로 고정했습니다.
- Presence의 DOM 삽입·삭제·focus·ARIA 책임은 의도대로 포함하지 않았습니다.

**소비자 경계·어댑터 검증 완료 (v0.8.70)**

- `@dong-gri/kineto/states` 독립 ESM 엔트리를 추가해 `core`와 States를 선택적으로
  함께 가져올 수 있게 했습니다. 독립 엔트리도 전체 레지스트리를 등록하지 않습니다.
- Core + States Vite 소비자 fixture에 gzip 예산을 추가하고, 패키지 surface·tarball·타입
  선언에서 `./states` export를 검증합니다.
- React Strict Mode와 Vue mount/unmount에서 States controller 생성·취소·destroy 복원을
  검사하며, full/standalone States의 SSR 호출이 브라우저 전역 없이 완료되는지 고정했습니다.

### P2. Presence Core — 선택형 Vanilla prototype 완료, 확장 보류

Presence는 React 전용 컴포넌트가 아니라 DOM 제거 전후를 조율하는 Core primitive로 시작합니다.

```js
import presence from '@dong-gri/kineto/presence';

const lifecycle = presence(panel, {
  mode: 'wait'
});

await lifecycle.enter();
const result = await lifecycle.leave({ duration: 180 });
if (result.status === 'finished') panel.remove();
```

**필수 범위**

- 중복 `leave()`의 idempotency
- 실행 중 취소와 재진입
- 이미 제거된 요소 처리
- `sync`, `wait`, `popLayout`에 대응하는 순서 정책
- 부모 제거 시 자식 exit 전파 여부
- focus가 제거 대상 안에 있을 때의 이동 정책
- `aria-hidden`, inert, pointer interaction 적용 시점
- exit 완료·취소·오류를 구분하는 Promise 결과
- reduced motion과 destroy 복원

Motion의 AnimatePresence도 direct-child key 추적, 수동 safe-to-remove, exit 전파, `sync`/`wait`/`popLayout`을 각각 다룹니다([Motion AnimatePresence](https://motion.dev/docs/react-animate-presence)). Kineto는 단순 fade-out helper만 추가하지 말고 DOM 수명주기 문제를 끝까지 정의해야 합니다.

`@dong-gri/kineto/presence` 선택형 엔트리와 `docs/presence-core-rfc.md`에 API 결과,
중복 요청·취소·재진입, `sync`/`wait`/`popLayout`, focus 이동,
`aria-hidden`·`inert` 복원, SSR·reduced motion 경계를 고정했습니다. 전체 번들에는
자동 포함하지 않아 Core + Presence 소비자 gzip 경계를 별도로 측정합니다.

### P2. React·Vue Presence adapter

Vanilla Presence Core 계약이 고정된 뒤 host-owned lifecycle 범위부터 제공합니다.

- 완료(v0.8.85): `useKinetoPresence`와 `KinetoPresence` wrapper를 React·Vue에 추가
- 완료(v0.8.85): Strict Mode·Vue lifecycle·SSR·hydration markup fixture를 통과
- 완료(v0.8.86): direct keyed child를 추적하고 exit 완료 뒤 자동 제거하는 `KinetoPresenceGroup`을 React·Vue에 추가
- 완료(v0.8.89): 부모가 `propagate: true`를 선택하면 React·Vue keyed group의 자식 exit와 부모 `safeToRemove` 순서를 전파
- 완료(v0.8.103): `useKinetoTransition()`이 Vue `<Transition>`의 enter/leave,
  cancellation, phase별 옵션, completion fallback을 연결하고 framework QA로 검증

- React: `<KinetoPresence>`, `useKineto`, stable ref, Strict Mode 보장
- Vue: `<KinetoPresence>`, composable, Vue transition interop
- framework key와 Core presence identity의 연결
- adapter 없이도 같은 동작을 구현할 수 있는 Vanilla 예제

### P2. Slider physics 통합

일반 Slider는 기존 velocity 경로를 유지하면서 `spring:true`를 선택할 때만
별도의 정착 solver를 사용합니다. 기본값은 기존 보간이므로 기존 소비자의
동작을 보존하고 비용은 명시된 번들 예산 안에서 관리합니다. Radial도
`spring:true`를 선택할 때만 같은 정착 solver를 사용하며, 기본값은 기존
호환 동작을 유지합니다.

- 완료(v0.8.78): 최근 최대 5개 pointer sample의 순서 가중 속도
- 완료(v0.8.80): `velocityInfluence`로 track Slider 해제 플링 배율을 선택적으로 조정
- 완료(v0.8.102): radial과 track slider가 `spring`, `stiffness`, `damping`,
  `mass`를 공유하는 opt-in 정착 모델과 각도·반지름 회귀 테스트
- 완료(v0.8.84): track Slider에서 `stiffness`, `damping`, `mass`를
  `spring:true`일 때만 사용하는 opt-in 공개
- 완료(v0.8.79): 큰 `dt` 상한과 60/90/120Hz 재현 테스트
- 완료(v0.8.77): 화면 밖 Slider·Radial의 rAF·autoplay 정지와 `pauseWhenOffscreen:false` opt-out
- momentum, bounce, sticky snap을 서로 독립된 설정으로 모델링
- simple mode에서 CSS Scroll Snap을 쓸 수 있는 경로 검토

**v0.8.105~v0.9.0 진행 결과**

- 완료(v0.8.105): track Slider에 `momentum:false`를 추가해 release velocity를 의미적으로 끌 수 있게 했습니다. 기존 기본값과 `velocityInfluence` 동작은 보존합니다.
- 완료(v0.8.105): `bounce:true`에서 양 끝 overscroll을 경계로 되돌리는 bounded physics 경로를 추가했습니다. loop와 reduced-motion 경계는 기존 모델을 따릅니다.
- 완료(v0.8.105): `stickySnap:true`에서 drag release를 가장 가까운 정수 slide로 고정합니다. 기본값은 기존 fractional release target을 보존하도록 `false`입니다.
- 완료(v0.9.0): 단순 `slide` 전용 `scrollSnap:true`를 strict eligibility와 transform fallback으로 공개했습니다. Chromium fixture에서 native scroll, API·마우스 드래그·키보드·sync·destroy 복원을 고정하며, perView>1·loop·3D·radial·autoHeight·세로 축은 계속 fallback합니다.
- 유지(증거 게이트): FLIP shared layout은 실제 keyed child 전환 요구 2건과 focus·scroll 정책이 모일 때까지 현재 gate를 유지합니다. 새 `layout` 모듈은 만들지 않습니다.

Swiper도 free mode와 sticky 동작을 분리하고, 단순 구성에서는 CSS mode의 성능 이점과 기능 제한을 명시합니다([Swiper API](https://swiperjs.com/swiper-api)). Kineto는 옵션 수를 복제하지 말고 물리 모델의 경계를 참고합니다.

### P2. FLIP과 View Transitions

새 Layout 모듈을 만들지 않고 `flip`을 확장합니다.

- 완료(v0.8.103): `flip({ viewTransition: true })`가 `data-kt-layout-id`가 있는
  same-document 재배치에서 지원 브라우저의 View Transitions API를 선택적으로 사용하고,
  미지원·실패 환경에서는 기존 FLIP으로 fallback
- `data-kt-layout-id` 기반 shared element의 서로 다른 부모와 scroll container 간 이동
- border-radius, clip, fixed header, transformed ancestor 보정
- same-document부터 검증하고 cross-document는 별도 단계로 둡니다.

View Transitions API는 SPA DOM 변경뿐 아니라 문서 간 전환에도 사용할 수 있지만 브라우저 지원과 기능 차이가 있으므로 progressive enhancement가 필요합니다([MDN View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)).

## 6. 장기 로드맵: 6~18개월

### 1) 1.0 계약 확정

1.0은 기능 개수가 아니라 안정성 조건으로 결정합니다.

- Core API·option naming·instance return shape 동결
- deprecation 정책과 최소 1개 minor의 이행 기간
- 브라우저 지원표와 Node/React/Vue 지원 범위 공개
- 패키지 entry와 타입 호환성 테스트
- 오류 코드와 debug mode
- 모듈별 lifecycle·접근성·성능 상태표 완성
- 최소 3개의 외부 실제 사용 사례 또는 독립 소비자 피드백 확보

### 2) 프리셋과 런타임 분리

- 런타임, 모듈, 디자인 preset의 경계를 분리합니다.
- 브랜드성 프리셋은 core에 계속 누적하지 않고 별도 선택형 패키지 또는 정적 preset manifest를 검토합니다.
- preset이 없어도 headless API와 CSS variable만으로 제품 디자인에 맞출 수 있어야 합니다.
- 공개 패키지 분리는 중복 코드·버전 동기화·설치 혼란이 실제 이점보다 작을 때는 하지 않습니다.

### 3) 플랫폼 통합

- View Transitions, Scroll-driven Animations, CSS Scroll Snap 등 플랫폼 기능을 우선 사용하고 Kineto는 호환성·fallback·도구화를 담당합니다.
- 지원 브라우저에서 네이티브 경로가 충분히 안정되면 JS 구현을 단계적으로 축소합니다.
- 실험 기능은 `experimental` entry에서 시작하고 Core 계약에 바로 넣지 않습니다.

### 4) 생태계와 운영

- 실제 프로젝트 사례를 case study로 남기고 성능·접근성 결과를 함께 공개합니다.
- issue template, 최소 재현 템플릿, contribution guide, security policy를 갖춥니다.
- 모듈 owner와 유지 상태를 표시합니다: stable, maintenance, experimental.
- 사용량이 낮고 유지비가 높은 모듈은 즉시 삭제하지 않고 maintenance → deprecation → major removal 순서를 따릅니다.
- 릴리스 빈도보다 예측 가능성을 우선해 patch는 버그, minor는 opt-in 기능, major는 계약 변경으로 고정합니다.

## 7. 우선순위 표

| 순위 | 과제 | 사용자 가치 | 기술 위험 | 예상 범위 | 선행 조건 |
|---|---|---:|---:|---:|---|
| P0 | 소비자 번들 fixture·예산 | 높음 | 낮음 | 1~2주 | 없음 |
| P0 | React/Vue lifecycle·SSR 매트릭스 | 높음 | 중간 | 2~3주 | 없음 |
| P0 | SECURITY.md·공급망 운영 | 중간 | 낮음 | 1주 | 없음 |
| P0 | 데모 정합성·복사 경로·troubleshooting | 매우 높음 | 중간 | 1~2주 | 문서 구조 |
| P1 | 데모 공유 URL·복사 경로 개선 | 높음 | 중간 | 2~4주 | 문서 구조 |
| P2 | Motion States 확장 | 높음 | 높음 | 4~8주 | 실제 요구 2건·번들 예산·취소 모델 |
| P2 | Presence Core 확장 | 높음 | 높음 | 4~8주 | 실제 요구 2건·States 또는 공통 실행 primitive |
| P2 | React/Vue Presence | 중간~높음 | 높음 | 3~5주 | Presence Core 안정화 |
| P2 | Slider physics 통합 | 중간 | 중간 | 3~5주 | 시간 기반 테스트 harness |
| P2 | FLIP shared layout | 중간 | 높음 | 4~8주 | View Transition fallback 설계 |
| 장기 | 1.0 계약·생태계 | 매우 높음 | 중간 | 6~18개월 | 외부 사용 증거 |

## 8. 성과 지표

다운로드 수나 star만으로 제품 방향을 결정하지 않습니다. 다음 지표를 함께 봅니다.

### 기술 지표

- core + 단일 모듈 소비자 gzip 크기와 증감
- module import가 전체 runtime을 포함하는 회귀 횟수: 0
- Chromium 전체, `heavy-layout` 대상의 Firefox/WebKit 통과율, 나머지 Firefox/WebKit smoke, adapter fixture 통과율
- 반복 mount/update/unmount 후 active instance와 listener 순증가: 0
- npm tarball 파일 수·압축 크기·runtime allowlist
- 배포 후 npm/GitHub Release/provenance 불일치: 0
- high/critical 공급망 경고의 미분류 체류 시간

### 제품 지표

앞의 초안은 “데모에서 설정 변경 후 코드 복사 완료율”, “copied example로 첫 동작까지 걸리는 시간”처럼 **텔레메트리가 있어야만 잴 수 있는 항목**을 올려놓고, 바로 다음 문단에서 초기에는 수집하지 않는다고 적어 서로 모순이었습니다. 수집 없이 관측 가능한 것으로 교체합니다.

- 데모 설정값과 실제 데모 상태의 불일치 건수 (자동 검사, 목표 0)
- 옵션 하나를 바꿨을 때 아무 반응도 없는 컨트롤 수 (자동 검사, 목표 0)
- 나란히 재생했을 때 구분되지 않는 variant 쌍의 수 (수동 검토, 목표 0)
- 릴리스가 **제품 결함이 아닌 이유**로 실패한 횟수 (목표 0)
- 문서 검색 후 해결되지 않은 질문의 유형
- 실제 프로젝트 사례 수와 재사용된 모듈 조합
- 외부 issue의 최소 재현 가능 비율과 해결 시간
- 사용되지 않는 모듈과 자주 조합되는 모듈

앞의 네 항목은 전부 CI나 정기 점검으로 자동화할 수 있고, 사용자를 추적하지 않습니다. 수집 기능을 넣는다면 기본 비활성·개인정보 비수집·명시적 동의 원칙을 적용합니다. 초기에는 GitHub issue, 문서 피드백, 공개 npm 지표, 사용자 인터뷰만으로도 충분합니다.

## 9. 의사결정 게이트

새 기능은 다음 질문에 모두 답한 뒤 시작합니다.

1. 어떤 실제 작업을 기존 모듈 조합으로 해결할 수 없는가?
2. Vanilla Core에서 독립적으로 성립하는가?
3. 정적·reduced-motion·저사양 fallback은 무엇인가?
4. destroy·cancel·replay·update 의미가 정의됐는가?
5. 소비자 번들 비용과 외부 엔진 경계는 얼마인가?
6. 키보드·focus·ARIA 영향은 무엇인가?
7. 새 public API 없이 실험할 수 있는가?
8. 최소 두 개의 실제 예제 또는 사용자 요구가 있는가?

답이 부족하면 실험 브랜치나 문서 제안으로 두고 공개 계약에 넣지 않습니다.

## 10. 다음 실행 순서

현재 남은 순서는 다음과 같습니다.

- 진행 중: 실사용 수정 묶음의 통합 CI, 번들·패키지 비용 검토, patch 배포와 두 도메인 산출물 일치 확인.
- 후속: 전용 데모가 없는 variant 중 실제 적용·회귀 근거가 있는 항목의 비교 화면과 브라우저 검증 확대.
- 외부 증거 필요: 실제 iOS Safari·Android Chrome·스크린리더 검사, 운영 앱의 장기 성능 측정, 공개 동의를 받은 외부 사용 사례 3개.
- 증거 확보 후 결정: FLIP shared layout과 States·Presence 추가 확장. 현재 자동 검사나 데모를 외부 사용 증거로 집계하지 않습니다.

아래는 완료 이력입니다.

1. 완료: 소비자 번들 fixture와 CI 예산
2. 완료: React Strict Mode·SSR, Vue lifecycle·SSR fixture
3. 완료: `SECURITY.md`와 공급망 대응 절차
4. 완료: 데모 설정 URL 공유 — 변경한 안전한 공개 옵션만 직렬화·복원
5. 완료: framework별 copy output — 현재 옵션을 React `Motion`과 Vue `useKineto` 예제로 복사
6. 완료: Motion States RFC 작성 및 2개 실제 예제·출시 게이트 정의
7. 완료: States v1 초기 구현 — 제한된 시각 상태·취소·replay·destroy·reduced motion 검증
8. 완료: Core + States 소비자 번들 fixture와 React/Vue lifecycle·SSR 연동 검증
9. 완료: Presence Core RFC와 focus/ARIA/cancel 모델 확정
10. 완료: Presence Core Vanilla prototype과 listener/timer·safeToRemove 테스트
11. 완료(계약·fixture 1차, v0.8.70): Presence 소비자 fixture 확장 및 React/Vue adapter 계약 설계
    — 현재는 host-owned lifecycle 경계만 고정했으며, keyed child 자동 제거 컴포넌트는
    별도 release gate 후에 공개합니다.
12. 완료(v0.8.85): host-owned React/Vue Presence composable·wrapper와 SSR/lifecycle fixture
13. 완료(v0.8.86): React/Vue direct keyed child group, `sync`/`wait`/`popLayout` 전달, reorder·SSR fixture
14. 완료(v0.8.89): nested group propagation과 부모 safe-to-remove ordering 검증
15. 완료(v0.8.77): 화면 밖 Slider·Radial의 rAF·autoplay 정지와 opt-out 계약
16. 완료(v0.8.78): 최근 pointer sample 기반 Slider release 관성
17. 완료(v0.8.79): Slider 정착을 경과 시간 기반으로 보정하고 큰 `dt`·60/90/120Hz 회귀 테스트 추가
18. 완료(v0.8.80): track Slider 해제 플링 배율을 `velocityInfluence`로 공개하고 Radial에는 노출하지 않음
19. 완료(v0.8.84): track Slider에 opt-in spring solver와 공개 물리 파라미터를 추가
20. 완료(v0.8.102): Radial에 동일한 opt-in spring solver와 물리 파라미터를 연결하고 회귀 테스트 추가
21. 완료(v0.8.103): Vue Transition interop과 transition cancellation 경계 검토
22. 완료(v0.8.103): same-document `flip` View Transitions progressive enhancement와 FLIP fallback 검증
23. 완료(v0.8.104): 숨겨진 Tabs 패널의 WebKit indicator 재측정과 live-site 배포 후 검증
24. 완료(v0.8.104): troubleshooting 문서와 문서 링크·버전 기준선 자동 감사
25. 완료(v0.8.104 후속): 모듈별 “언제 쓰는가 / 언제 피하는가 / 접근성·성능·reduced motion 상태” 메타데이터를 52개 모듈 매트릭스와 데모 뱃지·CI completeness 검사에 연결
26. 완료(v0.8.104 후속): `pageReveal`, `pageTransition`, `slider`, `stickyStack`, `stickyHeader`, `lightbox`, `cursor`, `fullpage`의 transform·clip·fixed/sticky 의존 경계를 `heavy-layout` 체크포인트로 고정하고 Chromium·Firefox·WebKit 정기 QA 지표에 연결
27. 완료(v0.8.104 후속): `docs/browser-qa-matrix.md`에 대상 모듈·레이어 위험·rect/used-value 측정 규칙·실패 분류·대상 편입 조건을 기록하고 docs-navigation CI에 연결
28. 완료(v0.8.104 후속): `docs/browser-qa-history.md`에 CI·브라우저·Pages 결과와 실패 분류 규칙을 기록해 릴리스 전 `heavy-layout` triage 이력을 시작
29. 완료(v0.8.104 후속): `docs/flip-shared-layout.md`에 현재 `flip` 계약, 미공개 범위, 실제 요구 2건 기반의 확장 gate를 고정
30. 완료(v0.8.104 후속): `docs/1.0-readiness.md`에 Core·entry·types·lifecycle·browser evidence·외부 사용 사례의 동결 준비도를 분리 기록
31. 완료(v0.8.104 후속): `docs/preset-runtime-boundary.md`에 full/core/module/states/presence/adapter import 경계와 별도 preset 분리 조건을 문서화
32. 완료(v0.8.104 후속): `docs/platform-enhancements.md`에 View Transitions·CSS Scroll Snap·Scroll-driven Animations의 progressive enhancement와 fallback gate를 기록
33. 완료(v0.8.104 후속): 실제 회귀 사례가 보고된 Cover Reveal gallery와 Radial Carousel의 wrapper·image layer·measurable bounds를 `heavy-layout`에 편입
34. 후속 선택: FLIP shared-layout은 실제 keyed child 전환 요구 2건이 확인될 때 구현 RFC로 승격
35. 완료(v0.8.104 후속): 공개 variant 목록을 `PUBLIC_VARIANTS`로 contract에서 생성하고 pageReveal·Loader의 stale effect 선택지를 제거; 16개 Page Reveal variant의 메커니즘·코드 branch 수동 감사를 `docs/variant-distinctness.md`와 CI로 고정
36. 완료(문서·게이트): `docs/browser-qa-matrix.md`에 일반·pointer·scroll·touch·canvas 지원표와 실기기 검증 한계를 고정하고, iOS Safari·Android Chrome 실행표와 증거 형식을 추가
37. 완료(측정 범위): Vite와 별도로 고정된 Rolldown consumer fixture·gzip 예산·생성 보고서를 추가해 비-Vite tree-shaking 신호를 CI에서 기록
38. 완료(기준선): 52개 공개 모듈의 `stable`/`maintenance`/`experimental`/`deprecated` 상태표와 변경 게이트를 추가
39. 완료(구현·계약): `Kineto.diagnosticCodes`, `Kineto.diagnostics`, opt-in debug sink·subscription·최근 50개 history와 validation을 구현하고 1.0 readiness·문서·Node 테스트에 연결
40. 완료(소비자 번들): Vite/Rolldown fixture를 함께 실행하도록 CI·release workflow와 lockfile을 갱신하고 측정 보고서를 자동 생성
41. 완료(모바일 QA 경계): 실기기 미실행 상태를 숨기지 않고 기기·OS·orientation·reduced-motion·증거 경로를 기록하는 실행표를 추가
42. 완료(진단 API): Core 오류·debug 경로가 공통 `KT_*` shape를 사용하고 sink/listener 오류가 모듈 동작을 깨뜨리지 않는지 회귀 테스트 추가
43. 완료(variant 감사): `pageReveal` 공개 16개가 각각 하나의 구현 branch와 구분 메커니즘을 가지며 legacy alias가 contract에 없는지 검사
44. 완료(heavy-layout 확대): Cover Reveal·Radial을 포함한 10개 레이어 모듈의 measurable bounds·wrapper·image layer 경계를 Chromium·Firefox·WebKit에서 검사
45. 완료(운영): `CONTRIBUTING.md`·기준 문서의 공개 계약 수치를 52개 모듈·28개 Core API로 갱신하고 readiness 검사에 연결
46. 완료(운영): 재현 URL·환경·기대/실제 결과를 강제하는 GitHub Bug Report form 추가
47. 완료(운영): 실제 사용 사례·fallback·lifecycle·번들 비용을 요구하는 Feature Proposal form 추가
48. 완료(운영): Chromium·Firefox·WebKit·iOS Safari·Android Chrome의 증거 경계를 기록하는 Browser QA form 추가
49. 완료(운영): 1.0 외부 검증을 위한 [실제 사용 사례 기록 템플릿](case-study-template.md)과 계약-aware readiness CI 검사 추가
50. 완료(v0.8.105): Slider track release의 `momentum` 의미 스위치와 회귀 계약 추가
51. 완료(v0.8.105): Slider edge overscroll `bounce` opt-in 정착 경로와 reduced-motion 경계 문서화
52. 완료(v0.8.105): Slider drag `stickySnap` opt-in 정수 정착과 기존 fractional target 보존
53. 완료(v0.9.0): 단순 Slider `scrollSnap:true`를 strict eligibility·transform fallback·번들 gate와 함께 구현하고 Chromium·Firefox·WebKit smoke fixture로 검증
54. 유지(증거 게이트): FLIP shared layout은 실제 요구 2건 전까지 구현하지 않는 evidence gate 유지
55. 완료(v0.9.3 후속): 별도 Pages 백업 경로 `catgarret.github.io/example/kineto`를 canonical `kineto.dongri.me`의 v0.9.3 산출물과 동기화하고, CNAME·사이트 전체 범위는 변경하지 않음
56. 완료(v0.9.3 후속): `test:live-site:parity`와 로컬 fixture를 추가해 canonical·백업의 버전·모듈 수·GTM·CDN·build marker drift를 검출
57. 완료(v0.9.3 후속): `.github/workflows/live-site-parity.yml`에 주간 schedule·수동 dispatch parity 경보를 추가하고 canonical Pages 배포와 독립적으로 운영
58. 완료(v0.9.3 후속): `test:readiness-gates`로 실기기·외부 사례·deprecated·FLIP 증거 게이트와 parity monitor 연결을 자동 점검; 증거가 없을 때 1.0 완료로 오판하지 않도록 고정
59. 완료(v0.9.3 후속): `test:deps`에 zero-runtime-dependency·optional peer metadata 경계를 추가해 공급망 payload drift를 조기에 검출
60. 완료(v0.9.3 후속): 실기기 QA 증거 디렉터리의 날짜·환경·기대/실제 결과 형식을 자동 검사해 에뮬레이션 결과와 실기기 증거를 섞지 않도록 고정
61. 완료(v0.9.3 후속): 외부 case study가 필수 사용 사례·검증 결과·공개 동의를 갖춘 실제 기록인지 검사하고 빈 템플릿 집계를 차단
62. 완료(v0.9.3 후속): deprecated 모듈이 생길 때 migration fixture와 문서 상태 갱신을 요구하는 조건부 gate 추가
63. 완료(v0.9.3 후속): 브라우저 QA 이력 각 행에 커밋·CI/결과 귀속이 남는지 검사해 성공 주장을 추적 가능하게 고정
64. 완료(v0.9.3 후속): readiness evidence 검사를 `test:node`·release automation 계약에 연결해 CI와 릴리스가 같은 외부 증거 경계를 사용
65. 완료(v0.9.3 후속): readiness evidence와 로드맵 우선순위 변경의 CI·Pages·canonical/backup parity 결과를 브라우저 QA 이력에 귀속
66. 완료(v0.9.3 후속): 세 개의 npm lockfile을 lockfileVersion 3과 public registry tarball·integrity 경계로 검사
67. 완료(v0.9.3 후속): consumer/framework fixture의 유일한 로컬 Kineto link(`../..`)를 명시적 예외로 고정하고 임의 workspace link를 차단
68. 완료(v0.9.3 후속): lockfile boundary 검사를 `test:node`·CI·release workflow에 연결해 설치 경계가 모든 릴리스 경로에서 동일하게 검증되도록 고정
69. 완료(v0.9.3 후속): 공급망 문서에 lockfile registry 경계와 갱신 시 검토 기준을 기록
70. 완료(v0.9.3 후속): 주간·수동 공급망 audit workflow를 추가해 잠금 설치를 별도 job에서 재현
71. 완료(v0.9.3 후속): 공급망 workflow에 `npm audit --audit-level=low`를 연결하고 Socket 점수와 역할을 분리
72. 완료(v0.9.3 후속): 같은 workflow에서 `npm pack --dry-run`과 lockfile boundary를 함께 실행해 설치·배포 표면을 점검
73. 완료(v0.9.3 후속): supply-chain workflow 계약 테스트를 `test:node`·CI·release에 연결
74. 완료(v0.9.3 후속): 주간 점검의 범위·한계와 Socket 수동 triage 절차를 공급망 문서에 기록
75. 완료(v0.9.3 후속): supply-chain workflow 메타데이터로 발생한 Node 24/npm 11 packed archive 경계를 실제 측정값으로 보정
76. 완료(v0.9.3 후속): package-size 보정이 runtime gzip·unpacked·파일 allowlist를 넓히지 않는다는 회귀 검증
77. 완료(v0.9.3 후속): Node 24와 Node 25의 package archive 차이를 별도 runner variance로 문서화
78. 완료(v0.9.3 후속): 로컬 Node 24/npm 11 재현 명령으로 원격 package-size 실패를 재현·확인
79. 완료(v0.9.3 후속): package-size 경계 수정 후 전체 CI 재실행을 release 전제조건으로 고정
80. 완료(v0.9.3 후속): npm과 GitHub Actions를 분리한 주간 Dependabot 업데이트 정책 추가
81. 완료(v0.9.3 후속): 공급망 workflow에서 SPDX SBOM을 생성하고 실행 artifact로 14일 보관
82. 완료(v0.9.3 후속): SBOM·audit 산출물 누락을 실패시키는 artifact 업로드 계약 추가
83. 완료(v0.9.3 후속): package install lifecycle script 금지 정책을 공급망 회귀검사에 고정
84. 완료(v0.9.3 후속): 공급망 운영 문서에 Dependabot·SBOM·artifact 보존 범위 기록
85. 완료(v0.9.3 후속): hosted WebKit full-demo regression의 추가 runner variance를 QA 이력에 분리 기록
86. 완료(v0.9.3 후속): WebKit에만 bounded process-group 재시도 1회를 추가하고 assertion 실패는 계속 fatal로 유지
87. 완료(v0.9.3 후속): Radial 이미지에 WebKit native drag 억제·capturing `dragstart` guard를 추가하고 destroy 복원을 검증
88. 완료(v0.9.3 후속): 시간대 없는 SQL/ISO 서버 시각을 한국어 locale에서 +09:00으로 안정화
89. 완료(v0.9.3 후속): 존재하지 않는 달력 날짜를 자동 보정하지 않는 dateTime parser 경계 추가
90. 완료(v0.9.3 후속): Radial ghost-drag와 비표준 dateTime 입력을 Chromium·Firefox·WebKit QA 체크포인트에 고정
91. 완료(v0.9.3 후속): Scroll Shadows mask와 Page Reveal 효과 차이의 사용·troubleshooting 문서 경계를 최신 상태로 갱신
92. 완료(v0.9.3 후속): Radial/dateTime 안전 guard의 측정된 unpacked 비용과 Node 24 packed archive 514.2KB 경계를 package budget에 흡수하고 77개 파일 표면·소비자 gzip 상한은 유지
93. 완료(v0.9.3 후속): Radial/dateTime guard의 1KB 미만 raw 산출물 비용만 bundle-size 상한에 반영하고 gzip 제품 예산은 유지
94. 완료(v0.9.3 후속): WebKit 전용 computed style 부재를 허용하도록 Radial cross-browser QA assertion을 엔진별로 분리
95. 완료(v0.9.3 후속): Radial QA에서 user-select·touch-action vendor 스타일을 정규화해 Firefox·WebKit 검증을 동일 계약으로 통합
96. 완료(v0.9.3 후속): 연-월-일 입력의 dash/slash/dot 구분자와 한 자리 월·일을 동일하게 검증
97. 완료(v0.9.3 후속): 시·분·초·밀리초 범위를 검사해 브라우저의 잘못된 시간 rollover를 차단
98. 완료(v0.9.3 후속): `Z`, `+09:00`, `+0900` 명시적 timezone offset을 보존·정규화
99. 완료(v0.9.3 후속): `ko`·`en-US` 및 slash/dot 입력의 불가능한 날짜 회귀를 추가
100. 완료(v0.9.3 후속): dateTime reference·troubleshooting·Node 회귀 테스트에 입력 경계를 문서화
101. 완료(v0.9.3 후속): SQL/ISO 시간과 명시적 timezone offset 사이의 공백을 허용
102. 완료(v0.9.3 후속): 3자리 초과 소수초를 밀리초 정밀도로 결정적으로 정규화
103. 완료(v0.9.3 후속): 모호한 숫자형 날짜도 명시적 timezone offset을 우선 적용
104. 완료(v0.9.3 후속): 공백·고정밀 소수초·숫자형 offset 조합의 Node 회귀를 추가
105. 완료(v0.9.3 후속): dateTime reference·troubleshooting에 새 서버 입력 경계를 반영
106. 완료(v0.9.4): Pages가 테스트한 `dist/kineto.umd.min.js`·`kineto.min.css`를 HTML과 함께 배포하고, 생성 산출물의 byte 일치·build marker와 live-site SHA-256 불일치 검출을 자동화
107. 완료(v0.9.4): Pages workflow가 같은 저장소 `main`의 성공한 push CI가 가리키는 정확한 commit에서만 자동 배포되고, 배포 후 기대 commit을 다시 검사하도록 고정
108. 완료(v0.9.4): 태그 릴리스를 read-only 검증·Firefox/WebKit gate·최소 권한 publish job으로 분리하고 두 검증 job이 모두 성공해야 쓰기·OIDC 권한을 얻도록 제한
109. 완료(v0.9.4): 검증 job이 tarball 하나와 SHA-256 checksum을 만들고 publish job이 digest를 확인한 동일 tarball만 npm과 GitHub Release에 사용하도록 고정
110. 완료(v0.9.4): 릴리스 재실행 시 기존 npm 버전의 integrity가 검증 tarball과 같을 때만 publish를 건너뛰고, 기존 GitHub Release는 수정하지 않는 불변 재실행 계약 추가
111. 완료(v0.9.4): jsDelivr purge 대상을 실제 공개 alias 4개로 제한하고 요청 timeout·최대 5회 bounded retry·부분 실패의 non-zero 종료를 회귀 테스트로 고정
112. 완료(v0.9.4): 외부 GitHub Action을 commit SHA로 고정하고 Node 20.19·22.12에서 build·package·types·tarball public-engine 계약을 별도 CI matrix로 검증
113. 완료(v0.9.4): root·consumer-bundles·framework-qa 세 lockfile을 모두 감사해 성공·실패와 무관하게 기계 판독 보고서를 남기고, 세 npm 경로를 주간 Dependabot 범위에 포함
114. 완료(v0.9.4): root와 두 fixture의 도구·framework 의존성을 잠금 갱신하고 `picomatch` 안전 하한, jQuery 3 호환 경계, Lenis 1.3.26 URL·SRI를 자동 검사
115. 완료(v0.9.4): Vite와 Rolldown이 full·core+1·core+3·States·Presence·React·Vue의 단일 fixture matrix와 동일 제품 gzip·tree-shaking 경계를 공유하도록 통합
116. 완료(v0.9.4): React와 Vue의 실제 SSR markup을 Chromium에서 hydrate해 DOM 재사용·warning/error 0·host당 단일 생성·update 교체·unmount 후 instance 0을 검사
117. 완료(v0.9.4): Chromium·Firefox·WebKit smoke가 공개 52개 모듈을 각각 실제 create·중복 init·replay·destroy하고 registry·실행 목록·instance leak을 contract와 대조
118. 완료(v0.9.4): 데모 설정 공유 URL을 authored module block·card·module·variant 기반 semantic key의 payload v2로 전환하고 v1 ordinal alias·실제 옵션 복원·hash 착지를 보존
119. 완료(v0.9.4): 데모 맨 앞 skip link, 설정/코드와 코드 형식 tablist의 ARIA 관계·roving tabindex·화살표/Home/End 자동 활성화, 재초기화 중복 방지를 Chromium QA로 고정
120. 완료(v0.9.4): 7개 locale에서 header·검색·사이트맵·설정 탭의 accessible name을 동기화하고, Mega Menu 다중 인스턴스 panel ID·trigger ARIA의 생성·destroy 복원을 자동 검사
121. 완료(v0.9.4): 별도 `catgarret.github.io` workflow가 Kineto `main`의 최신 성공 CI commit을 15분 간격으로 선택해 read-only build job에서 검증하고, write 권한을 분리한 job이 `example/kineto`만 자동 동기화하도록 복구했으며 수동 dispatch 실행도 성공
122. 완료(v0.9.4): Vue options의 일반 객체·ref·getter를 실제 create 직전에 다시 평가하고 React·Vue hydration fixture에서 revision `0 → 1` 교체와 최종 instance 0을 검증
123. 완료(v0.9.4): Mega Menu destroy가 실행 중 animation을 취소한 뒤 작성자의 host/item/trigger/panel class·inline style·hidden·ID·ARIA를 정확히 복원하고 재생성·재파괴 lifecycle까지 회귀 검사
124. 완료(v0.9.4): semantic 공유 key가 card 내부 heading까지 읽도록 보강해 CardGlow Soft·Sharp 충돌을 제거하고, 사용자 조작 UI accessible name의 7개 locale 동기화와 의도적 한국어 예제 범위를 자동 검사
125. 완료(v0.9.5): 생성형 맨 위로 이동 progress ring의 accessible name을 7개 locale로 동기화하고, observer가 control을 재생성해도 원본 declarative label과 생성 button이 같은 locale을 유지하도록 회귀 검사
126. 완료(v0.9.5): 없는 local release tag를 fatal 출력 없이 확인하고, 이미 push된 tag의 publish workflow 실패는 tag를 변경하지 않고 새 patch version으로 정방향 수정하도록 release 절차를 고정
127. 완료(v0.9.5 실행 증거): `8ac7a2b`의 CI `33946293529`와 canonical Pages `33946819020`, Release `33946295274`의 Verify·Firefox·WebKit 성공을 확인하고, prefix 없는 tarball 경로 때문에 publish만 실패한 사실을 분리해 기록
128. 완료(v0.9.6): checksum 검증 tarball output을 명시적인 `./release-artifact/...tgz`로 고정하고, npm이 이를 Git package spec으로 해석하지 않도록 release contract를 추가한 뒤 실제 `npm publish --dry-run`으로 경로 해석을 검증
129. 완료(v0.9.6 실행 증거): `8d784b6`의 CI `33947520040`·Release `33947520948`·Pages `33947939177`, npm SLSA provenance, npm/GitHub tarball SHA-256 일치, backup sync `33947970148`·Pages `33947986088`, 두 공개 도메인의 v0.9.6·52개·GTM·build/runtime hash 일치를 확인
130. 완료(Unreleased): 로드맵의 당시 검토 의견과 현재 구현 상태를 분리하고, 소비자 번들·framework hydration·Slider·공유 URL 완료 이력을 실제 릴리스에 귀속
131. 완료(Unreleased): Page Reveal 16개에 더해 Reveal·Lazy·Cursor·Overflow Text·Glitch·Slider 78개 variant의 구현 fingerprint·계약·데모·설정 대응을 정적 게이트로 검증
132. 완료(Unreleased): 데모의 고유 설정 control을 타입별로 전수 조작하고, 옵션 반영·모듈 재빌드·trigger 보존·중복 instance를 검사하며 런타임 field key 중복을 제거
133. 완료(Unreleased): CSS Scroll의 native scroll/view와 ScrollTrigger fallback·reduced motion·작성자 style 복원을 Chromium·Firefox·WebKit 실제 스크롤로 검증하고 3가지 다국어 데모·설정을 제공
134. 완료(Unreleased): Text Split·Text Reveal·Blur Text의 `<br>`·`\n`·CRLF를 모션 축소까지 보존하고, 실제 로딩 문구 형태·문구 교체·replay·ARIA·원본 DOM 복원 및 native flicker lifecycle을 회귀 검사에 포함
135. 완료(Unreleased): Counter Slot·Clock 숫자 전환 viewport를 소비자 computed `line-height`로 제한하고 overflow·paint containment와 작성자 style 복원을 검증
136. 완료(Unreleased): 모바일 hero 전환의 한 제스처 이동·감속을 유지하면서 같은 물리 제스처의 잔여 입력을 정착까지 처리하고, 세 엔진에서 단조 이동·오버슈트 없음·양방향 복귀를 검사
137. 완료(Unreleased): 클릭 GIF·APNG·animated WebP의 1회 반복 정규화·파일 길이 기반 수명·매 클릭 재시작과 포인터·터치 cleanup을 제공하고, 세 엔진에서 실제 이미지 프레임의 진행·정지·재시작을 검증
138. 완료(Unreleased): Quad Dot Pulse를 Chase의 호환 alias로 통합하고 중복 공개 카드·선택지를 제거하면서 기존 v1·v2 공유 URL을 보존
139. 완료(Unreleased): 두 GitHub workflow에 설정 전수·클릭 이미지 회귀를 연결하고, 릴리스 준비 시 현재 소스 버전만 갱신해 과거 npm·workflow·checksum 증거를 보존
140. 완료(Unreleased 측정): Node 24에서 Vite 전체 소비자 gzip 증가 약 3.3KB와 tarball 압축 526.9KB/해제 1755.0KB를 측정해 요청 기능 비용으로 기록하고, full·adapter 비용 예산만 조정하며 core 조합 예산·runtime dependency 0·52개 모듈·77개 파일 경계를 유지

가장 중요한 원칙은 명확합니다. **다음 10개 효과보다, 기존 효과를 작은 비용으로 안전하게 도입하고 조합할 수 있게 만드는 한 단계가 더 가치가 큽니다.**

## 11. 검토 의견 (2026-08-09)

이 로드맵은 방향과 문장이 대체로 정확합니다. 특히 §3 “하지 않을 일”과 §9 의사결정 게이트는
이 규모의 프로젝트에서 보기 드물게 구체적입니다. 아래는 **동의하지 않거나 보강이 필요하다고
판단한 지점**만 적습니다.

### 11.1 로드맵이 자기 게이트를 통과하지 못합니다

§9 게이트 8번은 “최소 두 개의 실제 예제 또는 사용자 요구가 있는가”입니다.
그런데 §5의 **Motion States(4~8주, 위험 높음)**와 **Presence Core(4~8주, 위험 높음)**는
둘 다 외부 요구 없이 P1로 올라가 있습니다. 합치면 8~16주이고, §2가 인정한 현재 상태는
외부 사용자 0명입니다.

두 기능 모두 Motion이 이미 잘 하고 있는 영역이라 “Kineto만의 조합 모델”이라는 §5 목표에도
정확히 부합하지 않습니다. Motion을 쓰는 사람이 Kineto의 states로 옮길 이유가 아직 문서에
없습니다.

**제안**: States/Presence는 RFC와 **실제 요구 2건**이 모일 때까지 P2로 내리고, 그 자리에
§4 P1의 “데모를 작업 도구로 전환”을 P0으로 올립니다. 근거는 §1이 이미 제품 정의를
“디자이너가 라이브 데모에서 조절하고 개발자가 가져가는 시스템”이라고 못박았다는 점입니다.
제품 정의가 데모라면 데모 정합성은 폴리시가 아니라 핵심 기능입니다.

### 11.2 데모 정합성이 P1에 있는 것은 §1과 모순입니다

2026-08-09 점검에서 설정 패널 빈칸 176건, variant별 미지원 옵션 노출, 옵션을 바꿔도 데모가
반응하지 않는 컨트롤이 실제로 나왔습니다. 이것은 “경험 개선”이 아니라 **제품 정의의 기본
동작이 깨져 있는 상태**입니다. §4 P0으로 올리고, §8의 자동 검사 지표 두 개(불일치 0, 무반응
컨트롤 0)를 완료 조건으로 붙이는 것을 권합니다.

### 11.3 tree-shaking은 장기 과제가 아니라 문서 결정입니다

§6-2는 “프리셋과 런타임 분리”를 6~18개월로 두는데, `core` + `modules/*` 엔트리는 **이미
존재합니다**. 따라서 1.0 전의 남은 일은 패키징이 아니라 **무엇을 기본 설치 경로로 문서화할 것인가**라는
결정 하나입니다. README와 데모 복사 출력이 아직 전체 번들을 기본으로 보여주고 있다면,
소비자가 받는 바이트는 예산 측정과 무관하게 줄지 않습니다. 제품 앱은 `core` + 필요한
모듈 entry를 기본으로 안내하고, 전체 entry는 CDN·빠른 prototype으로 한정하는 결정을
이번 사이클에 문서와 복사 출력에 반영합니다. 별도 preset package 분리는 실제 중복 비용이
확인될 때까지 보류합니다.

### 11.4 “star 0”에 대한 대응이 비어 있습니다

§2는 외부 검증이 없다는 사실을 정확히 적었지만, §6-4의 대응은 “case study를 남긴다”뿐입니다.
1인 유지보수 라이브러리에서 현실적인 첫 외부 검증은 star가 아니라 **유지보수자 본인의 실무
투입**입니다. 실제 상용 페이지 한 곳에 넣고 그때 나온 문제를 issue로 남기는 것이, 사례 문서
열 개보다 로드맵에 주는 정보가 큽니다. §6-4에 “최소 1개 실서비스 투입”을 선행 조건으로
명시하는 편이 정직합니다.

### 11.5 브라우저 QA 등급을 올려야 합니다

§2에 추가한 대로 WebKit이 smoke 수준인 것은 모션 라이브러리에서 구조적 위험입니다.
전 모듈 WebKit QA는 비용이 크므로, **transform이 걸린 조상 / fixed·sticky / clip-path /
mask / 3D transform을 쓰는 모듈만 골라 WebKit 전체 QA 대상**으로 승격하는 중간 등급을
제안합니다. 현재 그 목록은 `pageReveal`, `pageTransition`, `slider`, `stickyStack`,
`stickyHeader`, `lightbox`, `cursor`, `fullpage` 정도입니다.

### 11.6 유지하는 데 동의하는 부분

- §3의 “Motion/Swiper를 복제하지 않는다”는 이 프로젝트에서 가장 가치 있는 문장입니다.
- §4 P0 세 항목(번들 fixture, lifecycle/SSR, 공급망 문서)이 이미 완료로 닫힌 것은
  우선순위 판단이 옳았다는 근거입니다.
- §6-3의 “플랫폼 기능을 우선 쓰고 Kineto는 호환성·fallback·도구화를 담당한다”는
  장기적으로 이 라이브러리가 살아남는 유일한 포지션입니다.
