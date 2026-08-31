# Kineto Documentation

Kineto v0.9.3의 공개 API와 소유자 의도를 기준으로 정리한 문서입니다.

## 시작하기

- [Getting Started](getting-started.md)
- [제품·기술 로드맵](ROADMAP.md)
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
- [Page Reveal variant 중복 감사](variant-distinctness.md)
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

## API와 기능

- [계약에서 자동 생성된 52개 Module Reference](module-reference.md)
- [기능 계약](../FEATURE_CONTRACT.md)
- [48개 소유자 요구사항](../OWNER_REQUIREMENTS.md)
- [전체 라이브 데모](../demo/index.html)

`module-reference.md`는 `kineto.features.json`에서 생성됩니다. variant 또는 공개 option을 바꾸려면 소유자 승인을 확인한 뒤 `npm run docs:contract`를 실행하고 테스트·데모·changelog를 함께 갱신합니다.

`module-usage-matrix.md`는 52개 모듈의 사용 시점, 피해야 할 조합, 접근성·성능·reduced motion 상태를 데모 뱃지와 함께 관리합니다.

문제 해결 문서는 SSR/hydration, 숨겨진 컨테이너, 모바일 Mega Menu, WebKit 레이아웃,
슬라이더 드래그, 날짜 파싱, CDN·CSP/SRI와 CI 실패를 증상별로 정리합니다.
