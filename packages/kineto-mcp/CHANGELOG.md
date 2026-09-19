# Changelog — @dong-gri/kineto-mcp

Versions of the MCP server are independent of `@dong-gri/kineto`; each entry
names the Kineto contract version its bundled copies were generated from.

## [Unreleased]

### English

<!-- Add matching English release bullets here. -->

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->

## [0.1.0] - 2026-09-19

Generated from Kineto 0.10.0 (feature contract 1.4.0, integrations map 1.0.0).

### English

- First release of the Kineto MCP server (stdio). Tools: `kineto_suggest` (rank design intents for a description, component or Figma layer name in English or Korean, with library-vs-Kineto decisions per ecosystem), `kineto_figma_layers` (map Figma layers with node facts to intents and ready `data-kt-*` attributes), `kineto_snippet` (validated html/react/vue/js markup), `kineto_validate_options` (unknown keys with "did you mean", variant hints, attribute spellings), `kineto_module`, `kineto_list_modules` and `kineto_ecosystem`; resources `kineto://rules`, `kineto://integrations`, `kineto://features`, `kineto://meta`; prompt `kineto_apply_motion`.
- Answers only from contract copies synced by `scripts/build-mcp.mjs` in the Kineto repository; every input passes a bounded schema; no ports, no network, no file access outside the package.

### 한국어

- Kineto MCP 서버(stdio) 첫 릴리스. 도구: `kineto_suggest`(설명·컴포넌트·Figma 레이어 이름을 영/한으로 받아 디자인 의도를 랭킹하고 생태계별 라이브러리 우선/Kineto 판단 제공), `kineto_figma_layers`(노드 정보가 있는 Figma 레이어를 의도와 `data-kt-*` 속성으로 매핑), `kineto_snippet`(검증된 html/react/vue/js 마크업), `kineto_validate_options`(모르는 키의 “혹시 이 옵션?” 힌트·variant 힌트·속성 표기), `kineto_module`, `kineto_list_modules`, `kineto_ecosystem`; 리소스 `kineto://rules`·`kineto://integrations`·`kineto://features`·`kineto://meta`; 프롬프트 `kineto_apply_motion`.
- Kineto 저장소의 `scripts/build-mcp.mjs`가 동기화한 계약 사본으로만 답하고, 모든 입력은 상한이 있는 스키마를 거치며, 포트·네트워크·패키지 밖 파일 접근이 없습니다.
