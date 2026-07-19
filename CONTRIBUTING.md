# Contributing to MotionKit

## 시작 전

`OWNER_REQUIREMENTS.md`, `FEATURE_CONTRACT.md`, `docs/AGENTS.md`, 영향을 받는 테스트를 먼저 읽습니다. 현재 공개 범위는 **32개 모듈·20개 Core API·46개 소유자 요구사항**이며, 기능명뿐 아니라 카테고리·variant 의미·공개 option·시각 동작도 계약입니다.

## 변경 원칙

- 버그 수정은 기존 기능을 보존하는 가장 작은 변경이어야 합니다.
- 새 기능은 opt-in으로 추가하며 기존 default나 variant 의미를 몰래 바꾸지 않습니다.
- 구현이 어렵거나 데모에 없다는 이유로 기능을 제거하지 않습니다.
- 기능 분류 변경도 public behavior 변경으로 취급합니다.
- 공개 계약을 바꾸는 변경은 소유자 승인과 계약·문서·데모·테스트·changelog 동시 갱신이 필요합니다.
- animated media를 Canvas 첫 프레임으로 바꾸거나, 동적 노이즈를 반복 정적 패턴으로 대체하지 않습니다.

## 코드 규칙

- 모듈은 `src/modules/<name>.js`에 두고 `create()`와 필요한 fallback/reduced-motion lifecycle을 제공합니다.
- 모든 timer, listener, observer, RAF, animation, 생성 DOM은 `destroy()`에서 정리합니다.
- 기존 HTML, inline style, ARIA와 의미 있는 attribute를 복원합니다.
- option은 계약 검사가 읽을 수 있도록 `opts.optionName` 형태로 접근합니다.
- 브라우저 전역에 무조건 의존하지 않고 SSR import와 ESM/UMD 양쪽을 고려합니다.
- 한 요소에 여러 모듈이 결합될 때 wrapper·style·source를 독점하지 않습니다.

## 테스트와 문서

변경 시 다음을 함께 확인합니다.

1. 영향을 받는 모듈과 lifecycle
2. 전체 데모의 해당 카테고리와 플레이그라운드
3. `motionkit.features.json` — 공개 surface가 실제로 바뀌는 경우만
4. `motionkit.requirements.json` — 소유자 승인으로 요구사항이 바뀌는 경우만
5. 자동 테스트, README, Module Reference, `CHANGELOG.md`

```bash
npm run verify
```

`verify`는 lint, ESM/UMD build, 32개 모듈·20개 Core API, 46개 요구사항, 생성 문서, Chromium 기능/lifecycle, animated media, 58개 플레이그라운드, package surface, audit와 tarball 내용을 확인합니다.

## Pull request 설명에 포함할 내용

- 수정하려는 기존 동작과 관련 요구사항 ID
- 변경한 파일
- public behavior 변화 여부
- 추가하거나 수정한 테스트
- 실제 검증한 브라우저·환경
- 검증하지 못한 환경과 남은 위험
