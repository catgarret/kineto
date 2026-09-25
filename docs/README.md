# Kineto Documentation

Kineto v0.12.1의 공개 API와 소유자 의도를 기준으로 정리한 문서입니다.

## 시작하기

- [Getting Started](getting-started.md)
- [제품·기술 로드맵](ROADMAP.md)
- [아키텍처 리뷰와 부서별 방향 (2026-09-24)](ARCHITECTURE-REVIEW.md) — 이번 배치가 닫은 원인 계열, 남은 구조 부채와 순서
- [Motion States RFC](motion-states-rfc.md)
- [Presence Core RFC](presence-core-rfc.md)
- [공통 옵션과 데이터 속성](common-options.md)
- [접근성](accessibility.md)
- [성능과 fallback](performance.md)
- [모듈 사용·품질 매트릭스](module-usage-matrix.md)
- [모듈 유지 상태표](module-status.md)
- [소비자 번들 측정](consumer-bundle-size.md)
- [브라우저 레이어 QA 매트릭스](browser-qa-matrix.md)
- [브라우저 레이어 QA 이력](browser-qa-history.md)
- [실기기 브라우저 QA 실행표](browser-device-qa.md)
- [모듈 카테고리 판단 순서](module-taxonomy.md)
- [Page Reveal variant 중복 감사](variant-distinctness.md)
- [Variant 비교 시트](variant-compare.md)
- [FLIP shared layout 범위](flip-shared-layout.md)
- [Slider physics RFC](slider-physics-rfc.md)
- [1.0 계약 준비도](1.0-readiness.md)
- [1.0 진단·deprecation 계약](diagnostics-and-deprecation.md)
- [Preset과 runtime 경계](preset-runtime-boundary.md)
- [플랫폼 progressive enhancement 경로](platform-enhancements.md)
- [실제 사용 사례 기록 템플릿](case-study-template.md)
- [문제 해결](troubleshooting.md)
- [공급망 운영](supply-chain.md)
- [보안 신고 정책](../SECURITY.md)

## 디자인 시스템·UI 라이브러리·AI 도구 연동

- [연동 가이드 인덱스](integrations/README.md) — shadcn/ui·Tailwind·Bootstrap 5·MUI·Mantine·Chakra·Ant Design·daisyUI·Nuxt UI·PrimeVue·Vuetify 각각의 붙이는 방식, 라이브러리가 이미 제공하는 것, 충돌 규칙, 의도별 레시피
- [Figma MCP → 코드 → Kineto 워크플로우](integrations/figma-mcp.md)
- [AI 에이전트 규칙 파일](../ai/kineto.rules.md) (`kineto.dongri.me/llms.txt`로도 제공) · Cursor 규칙 `ai/cursor/kineto.mdc`
- [Kineto MCP 서버](../packages/kineto-mcp/README.md) — `npx @dong-gri/kineto-mcp`, `kineto_suggest`/`kineto_snippet`/`kineto_validate_options`/`kineto_figma_layers`
- shadcn 레지스트리: [`registry/`](../registry/registry.json) → `https://kineto.dongri.me/r/{name}.json` (`@kineto/provider`, `@kineto/reveal` …)
- [Bootstrap 5 공존 예제](../examples/bootstrap/index.html) — `tests/integrations/bootstrap-qa.mjs`가 실제 브라우저에서 검증

모든 연동 문서·규칙 파일·레지스트리·MCP 계약 사본은 [`kineto.integrations.json`](../kineto.integrations.json) 하나에서 `npm run integrations:build`로 생성되며, `tests/integrations-contract.mjs`가 기능 계약과 대조합니다.

## API와 기능

- [계약에서 자동 생성된 53개 Module Reference](module-reference.md)
- [기능 계약](../FEATURE_CONTRACT.md)
- [51개 소유자 요구사항](../OWNER_REQUIREMENTS.md)
- [전체 라이브 데모](../demo/index.html)

`module-reference.md`는 `kineto.features.json`에서 생성됩니다. variant 또는 공개 option을 바꾸려면 소유자 승인을 확인한 뒤 `npm run docs:contract`를 실행하고 테스트·데모·changelog를 함께 갱신합니다.

`module-usage-matrix.md`는 55개 모듈의 사용 시점, 피해야 할 조합, 접근성·성능·reduced motion 상태를 데모 뱃지와 함께 관리합니다.

문제 해결 문서는 SSR/hydration, 숨겨진 컨테이너, 모바일 Mega Menu, WebKit 레이아웃,
슬라이더 드래그, 날짜 파싱, CDN·CSP/SRI와 CI 실패를 증상별로 정리합니다.
