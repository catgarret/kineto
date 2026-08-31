# 플랫폼 progressive enhancement 경로

Kineto는 브라우저가 제공하는 안정적인 기능을 먼저 사용하고, 미지원 환경에서는 같은 콘텐츠와 조작을 남기는 방향으로 구현합니다.

| 플랫폼 기능 | Kineto 사용 경로 | fallback | 상태 |
|---|---|---|---|
| View Transitions | `flip({ viewTransition: true })` + `data-kt-layout-id` | 기존 FLIP | 구현·회귀 검사 완료 |
| CSS Scroll Snap | Fullpage `mode: 'snap'`, Slider `scrollSnap:true` 단순 경로 | 기존 transform/drag 엔진 | 실험적 opt-in, 조건 밖 자동 fallback |
| Scroll-driven Animations | CSS variable·native scroll을 우선 검토 | rAF/ScrollTrigger bridge | 실험·호환성 조사 |
| `prefers-reduced-motion` | 최종 상태·정적 표시 | 모션 제거 | 전 모듈 계약과 QA 유지 |

## 채택 기준

새 native 경로는 다음을 모두 만족할 때만 기본값 후보가 됩니다.

- 지원 브라우저에서 기존 fallback과 의미가 같고, 콘텐츠·키보드·touch 조작이 사라지지 않습니다.
- native 경로를 끄는 명시적 opt-out과 reduced-motion 결과가 있습니다.
- 동일한 결과를 확인할 수 있는 자동 fixture가 있고, 지원하지 않는 브라우저의 fallback도 검사합니다.
- 초기 runtime과 소비자 번들 비용이 측정 예산 안에 있습니다.

지원 브라우저가 충분하지 않은 실험은 `experimental` 문서와 opt-in 옵션에 머물며 Core 기본 계약으로 승격하지 않습니다.
