# Kineto 제품·기술 로드맵

> 기준 버전: v0.8.84 · 작성일: 2026-08-02 · 검토: 2026-08-17
> 성격: 일정 약속이 아니라 우선순위와 진입·중단 조건을 정하는 실행 문서
>
> 2026-08-09 검토에서 추가·수정된 부분은 §2 병목 3개 항목, §3 하지 않을 일 2개 항목,
> §8 지표 교체, §11 검토 의견입니다. §11은 이 로드맵과 다른 판단을 적은 절이므로
> 반영 여부를 먼저 결정한 뒤 나머지 절을 갱신해야 합니다.

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
- Chromium 전체 QA, Firefox/WebKit smoke, lifecycle·패키지·번들 예산·npm provenance 검증이 있습니다.
- reduced motion, 저사양 fallback, 키보드·ARIA, `destroy()` 복원을 제품 원칙으로 관리합니다.

### 현재 병목

- 전체 번들은 제품 범위에 비해 관리 가능하지만 예산 상한에 가깝고, 실제 소비자 앱에서 모듈 하나를 가져왔을 때의 번들 비용은 별도 예산으로 관리하지 않습니다.
- React·Vue 어댑터는 라이프사이클 연결 수준입니다. 선언적 상태 전파, exit 지연, SSR/hydration 검증은 부족합니다.
- 52개 모듈과 7개 언어는 유지 비용이 큽니다. 새 기능이 기존 기능의 품질과 문서화를 밀어낼 위험이 있습니다.
- 공개 저장소 지표는 2026-08-02 확인 기준 star 0, fork 0입니다. 코드 품질과 별개로 외부 검증과 사용 사례가 없는 상태입니다.
- Socket 경고를 줄이는 기술 조치는 진행됐지만, 공급망 신뢰는 특정 점수 하나가 아니라 릴리스 provenance, 의존성 최소화, 변경 이력, 대응 절차를 함께 유지해야 합니다. Socket도 경고 심각도와 공급망 위험을 종합해 점수를 계산한다고 설명합니다([Socket package scores](https://docs.socket.dev/docs/package-scores)).
- **테스트가 틀린 이유로 실패합니다.** v0.8.43 릴리스는 같은 assertion에서 반복 실패했는데, 원인은 스타일시트가 아니라 아직 레이아웃되지 않은 패널을 측정한 것이었습니다. `display:none` 요소의 `getComputedStyle`은 used value가 아니라 computed value(`repeat(2, minmax(0px, 1fr))`)를 돌려주고, 이 문자열을 공백으로 자르면 토큰이 정확히 3개가 나옵니다. 즉 **그럴듯하게 틀린 값**이 나왔고, 사람은 CSS를 세 번 고쳤습니다. 브라우저 QA에 “측정 대상이 실제로 레이아웃됐는가”를 먼저 확인하는 규칙이 없으면, 통과율 지표 자체를 신뢰할 수 없습니다.
- **엔진 커버리지가 Chromium에 편중돼 있습니다.** Firefox/WebKit은 smoke 수준입니다. 모션 라이브러리에서 이 격차는 이론이 아닙니다. `pageReveal`의 `zoom`은 transform이 걸린 `<body>`가 fixed/sticky 자손의 containing block이 되는 동작에서 Safari와 Chromium이 갈렸고, 커버를 `<html>`로 옮겨야 양쪽이 같아졌습니다. 이런 종류는 smoke 테스트로는 절대 안 잡힙니다.
- **variant 중복을 아무도 측정하지 않습니다.** 모듈 수 상한(§3)은 있지만 모듈 *안*의 preset 중복 상한은 없습니다. 2026-08-09 기준 `pageReveal`은 16개 variant 중 5개가 서로 구분되지 않는 상태였습니다(`circle`↔`iris`, `wipe`↔`curtain`, `blinds`↔`columns`↔`strips`, `checker`↔`data-mosaic`). 사용자가 체감하는 “기능이 많다”는 variant 개수인데, 품질 관리 단위는 모듈 개수입니다.

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

| 항목 | 상태 | 완료 근거 |
|---|---|---|
| 소비자 번들 예산 | 완료 | 5개 Vite 소비자 fixture와 gzip 예산을 CI에 추가했습니다. |
| React/Vue lifecycle·SSR | 완료 | React Strict Mode, Vue mount/update/unmount, jQuery lifecycle, React/Vue SSR fixture를 CI에 추가했습니다. |
| 공급망 운영 문서 | 완료 | `SECURITY.md`와 공급망 대응·릴리스 확인 문서를 추가했습니다. |
| 전체 검증 재시도 안전망 | 완료 | CI와 릴리스 검증이 일시적인 러너·브라우저 실패 시 한 번만 재시도하되, 재실행도 반드시 통과하도록 고정했습니다. |
| 데모·문서 경험 개선 | 완료(1차) | 실제 적용 문제를 반영한 CSS 훅·예제, 변경 설정 URL 공유, Vanilla HTML/JS·React·Vue·CSS 복사 탭을 추가했습니다. 실제 조합 예제와 문제 중심 문서는 다음 단위입니다. |

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

### P1. Motion States — v1 초기 구현 완료

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

### P1. Presence Core — 선택형 Vanilla prototype 완료

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

Core가 안정된 뒤에만 다음을 제공합니다.

- React: `<KinetoPresence>`, `useKineto`, stable ref, Strict Mode 보장
- Vue: `<KinetoPresence>`, composable, Vue transition interop
- framework key와 Core presence identity의 연결
- adapter 없이도 같은 동작을 구현할 수 있는 Vanilla 예제

### P2. Slider physics 통합

일반 Slider는 기존 velocity 경로를 유지하면서 `spring:true`를 선택할 때만
별도의 정착 solver를 사용합니다. 기본값은 기존 보간이므로 기존 소비자의
동작을 보존하고 비용은 명시된 번들 예산 안에서 관리합니다. Radial은 현재 호환성을 위해 `smoothing`만
공개하며, 두 모드의 spring solver 통합은 별도 검증 과제로 남겨 둡니다.

- 완료(v0.8.78): 최근 최대 5개 pointer sample의 순서 가중 속도
- 완료(v0.8.80): `velocityInfluence`로 track Slider 해제 플링 배율을 선택적으로 조정
- 후속: radial과 track slider의 spring solver 공유는 Radial의 각도·반지름
  정착 모델을 먼저 고정한 뒤 검토
- 완료(v0.8.84): track Slider에서 `stiffness`, `damping`, `mass`를
  `spring:true`일 때만 사용하는 opt-in 공개
- 완료(v0.8.79): 큰 `dt` 상한과 60/90/120Hz 재현 테스트
- 완료(v0.8.77): 화면 밖 Slider·Radial의 rAF·autoplay 정지와 `pauseWhenOffscreen:false` opt-out
- momentum, bounce, sticky snap을 서로 독립된 설정으로 모델링
- simple mode에서 CSS Scroll Snap을 쓸 수 있는 경로 검토

Swiper도 free mode와 sticky 동작을 분리하고, 단순 구성에서는 CSS mode의 성능 이점과 기능 제한을 명시합니다([Swiper API](https://swiperjs.com/swiper-api)). Kineto는 옵션 수를 복제하지 말고 물리 모델의 경계를 참고합니다.

### P2. FLIP과 View Transitions

새 Layout 모듈을 만들지 않고 `flip`을 확장합니다.

- `data-kt-layout-id` 기반 shared element
- 서로 다른 부모와 scroll container 간 이동
- border-radius, clip, fixed header, transformed ancestor 보정
- 가능한 환경에서 View Transitions API, 미지원 환경에서 현재 clone/FLIP fallback
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
| P1 | 데모 공유 URL·복사 경로 개선 | 높음 | 중간 | 2~4주 | 문서 구조 |
| P1 | Motion States v1 | 높음 | 높음 | 4~8주 | 번들 예산·취소 모델 |
| P1 | Presence Core | 높음 | 높음 | 4~8주 | States 또는 공통 실행 primitive |
| P2 | React/Vue Presence | 중간~높음 | 높음 | 3~5주 | Presence Core 안정화 |
| P2 | Slider physics 통합 | 중간 | 중간 | 3~5주 | 시간 기반 테스트 harness |
| P2 | FLIP shared layout | 중간 | 높음 | 4~8주 | View Transition fallback 설계 |
| 장기 | 1.0 계약·생태계 | 매우 높음 | 중간 | 6~18개월 | 외부 사용 증거 |

## 8. 성과 지표

다운로드 수나 star만으로 제품 방향을 결정하지 않습니다. 다음 지표를 함께 봅니다.

### 기술 지표

- core + 단일 모듈 소비자 gzip 크기와 증감
- module import가 전체 runtime을 포함하는 회귀 횟수: 0
- Chromium 전체, Firefox/WebKit smoke, adapter fixture 통과율
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

다음 개발 사이클은 아래 순서가 가장 안전합니다.

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
12. 다음: 실제 keyed child 제거 요구가 확인될 때 React/Vue Presence 컴포넌트 구현
13. 완료(v0.8.77): 화면 밖 Slider·Radial의 rAF·autoplay 정지와 opt-out 계약
14. 완료(v0.8.78): 최근 pointer sample 기반 Slider release 관성
15. 완료(v0.8.79): Slider 정착을 경과 시간 기반으로 보정하고 큰 `dt`·60/90/120Hz 회귀 테스트 추가
16. 완료(v0.8.80): track Slider 해제 플링 배율을 `velocityInfluence`로 공개하고 Radial에는 노출하지 않음
17. 완료(v0.8.84): track Slider에 opt-in spring solver와 공개 물리 파라미터를 추가하고 Radial에는 노출하지 않음
18. 후속 선택: FLIP shared-layout은 실제 keyed child 전환 요구가 확인될 때 별도 검토

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
존재합니다**. 남은 것은 패키징이 아니라 **무엇을 기본 설치 경로로 문서화할 것인가**라는
결정 하나입니다. README와 데모 복사 출력이 아직 전체 번들을 기본으로 보여주고 있다면,
소비자가 받는 바이트는 예산 측정과 무관하게 줄지 않습니다. 이건 1~2일짜리 문서·복사 출력
변경이고, §4 P0의 번들 예산 작업과 같은 사이클에 있어야 합니다.

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
