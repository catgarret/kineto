# 플랫폼 progressive enhancement 경로

Kineto는 브라우저가 제공하는 안정적인 기능을 먼저 사용하고, 미지원 환경에서는 같은 콘텐츠와 조작을 남기는 방향으로 구현합니다.

| 플랫폼 기능 | Kineto 사용 경로 | fallback | 상태 |
|---|---|---|---|
| View Transitions | `flip({ viewTransition: true })` + `data-kt-layout-id` | 기존 FLIP | 구현·회귀 검사 완료 |
| CSS Scroll Snap | Fullpage `mode: 'snap'`, Slider `scrollSnap:true` 단순 경로 | 기존 transform/drag 엔진 | 실험적 opt-in, 조건 밖 자동 fallback |
| Scroll-driven Animations | `cssScroll`의 native `scroll()` / `view()` timeline | CSS progress property + ScrollTrigger | opt-in 구현·실브라우저 회귀 검사 완료 |
| `prefers-reduced-motion` | 최종 상태·정적 표시 | 모션 제거 | 전 모듈 계약과 QA 유지 |

## 채택 기준

새 native 경로는 다음을 모두 만족할 때만 기본값 후보가 됩니다.

- 지원 브라우저에서 기존 fallback과 의미가 같고, 콘텐츠·키보드·touch 조작이 사라지지 않습니다.
- native 경로를 끄는 명시적 opt-out과 reduced-motion 결과가 있습니다.
- 동일한 결과를 확인할 수 있는 자동 fixture가 있고, 지원하지 않는 브라우저의 fallback도 검사합니다.
- 초기 runtime과 소비자 번들 비용이 측정 예산 안에 있습니다.

지원 브라우저가 충분하지 않은 실험은 `experimental` 문서와 opt-in 옵션에 머물며 Core 기본 계약으로 승격하지 않습니다.

## Scroll-driven Animations 검증 범위

`cssScroll`은 기존 공개 옵션만으로 두 경로를 선택합니다. `cssAnimation`을 지정하고 브라우저가 생성될 `scroll()` 또는 `view()` timeline 문자열을 지원하면 CSS native 경로를 사용합니다. `cssAnimation`을 생략한 progress-property variant와 해당 timeline을 지원하지 않는 브라우저는 기존 ScrollTrigger 경로에서 같은 CSS custom property를 갱신합니다. 별도의 공개 force-fallback 옵션은 추가하지 않습니다.

`tests/browser/css-scroll.mjs`는 다음 동작을 실제 브라우저 스크롤로 고정합니다.

- Chromium에서는 `scroll(nearest block)` 진행률과 `view(block)` 요소 통과 진행률이 각각 실제 scrollport 스크롤과 함께 0→1로 갱신되는지 검사합니다.
- native 지원 여부와 무관하게 `cssAnimation`을 생략한 progress-property 경로가 ScrollTrigger의 실제 진행률과 `onUpdate`에 같은 값을 전달하는지 검사합니다.
- 정확히 생성된 timeline 값만 미지원인 조건을 결정적으로 재현해 `cssAnimation` 요청이 잘못된 CSS longhand를 남기지 않고 ScrollTrigger로 전환되는지 검사합니다.
- native·fallback 두 경로 모두 `destroy()` 후 animation longhand, CSS custom property와 `!important` priority, Core instance와 ScrollTrigger 수를 원래 상태로 복원하는지 검사합니다.
- reduced-motion에서는 native animation과 ScrollTrigger를 만들지 않고 custom property를 완료 값 `1`로 설정하며, `destroy()`에서 작성자 값을 복원하는지 검사합니다.

동일 fixture를 Chromium 기본 browser gate와 Firefox·WebKit CI/release matrix에서 실행합니다. 이는 데스크톱 엔진 자동화 증거이며 실제 iOS Safari·Android Chrome 검증을 대신하지 않습니다.
