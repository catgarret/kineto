# Instructions for AI-assisted Kineto changes

## 반드시 먼저 읽을 문서

1. `OWNER_REQUIREMENTS.md`
2. `kineto.requirements.json`
3. `FEATURE_CONTRACT.md`
4. `kineto.features.json`
5. `CONTEXT.md`
6. 영향받는 모듈 문서, 소스, 테스트

## 범위 잠금

- 현재 공개 범위는 정확히 **32개 모듈**입니다.
- 소유자의 명시적 요청 없이 모듈·variant·option·기본값·활성화 속성·return shape·public method를 삭제하거나 재해석하지 않습니다.
- 기능 분류 역시 계약입니다. 예: `circular`/`bar`는 Loader, `slide-up`/`wipe`는 viewport Reveal, `ripple`은 Button Feedback입니다.
- `kineto.features.json`이나 `kineto.requirements.json`을 실패한 구현에 맞춰 낮추지 않습니다.
- 계약된 옵션은 `opts.optionName`으로 접근합니다. bracket access와 option destructuring은 계약 검사 우회를 막기 위해 금지합니다.
- 관련 없는 모듈을 함께 리팩터링하지 않습니다.
- 데모를 축약해 버그를 숨기지 않습니다. 데모는 QA 표면입니다.
- 각 조절 가능한 데모의 Live Settings, Replay, Reset, HTML/JS 코드 동기화, Copy 기능을 삭제하거나 정적 코드 블록으로 축소하지 않습니다.

## 작업 순서

1. 고칠 기존 동작을 문장으로 고정합니다.
2. 변경 파일과 영향을 받는 public behavior를 식별합니다.
3. 가능하면 실패하는 테스트를 먼저 추가합니다.
4. 요구사항을 만족하는 최소 구현 변경을 합니다.
5. 모듈 문서, 전체 데모, changelog를 갱신합니다.
6. `npm run verify`를 실행합니다.
7. 실제 배포 tarball을 별도 프로젝트에 설치해 adapter/lifecycle을 검증합니다.
8. 통과한 브라우저와 검증하지 못한 환경을 구분해 보고합니다.

## 금지되는 지름길

- 실패 모듈 주석 처리 또는 registry/test에서 삭제
- 복잡한 효과를 시각적으로 무관한 효과로 교체
- 깨진 경로를 피하도록 HTML 예시만 수정
- 소유자 승인 없이 deprecated 처리
- 오류를 catch 후 무시해 테스트만 통과
- 우발적 구현을 정답으로 삼아 문서를 하향 수정
- 기능 수를 문서 숫자에 맞추기 위해 실제 기능 삭제

## 완료 기준

```bash
npm run verify
```

이 명령이 통과하고, 실제 데모에서 요구된 시각 동작이 확인되며, 반복 생성·재생·파괴 후 active instance가 0이어야 완료입니다.
