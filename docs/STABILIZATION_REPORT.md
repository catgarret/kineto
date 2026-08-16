# Kineto v0.8.70 Stabilization Report

## 범위

`src`, `dist`, 데모, 계약, 테스트, 문서, 번역, framework adapter와
패키지 메타데이터를 하나의 배포 가능한 소스 트리로 유지합니다.

## 현재 기준

- 51개 모듈과 26개 Core API
- 모든 데모의 설정·코드 패널과 지원 옵션 계약 동기화
- ESM, CommonJS, UMD, CSS 및 React/Vue/jQuery entry
- reduced-motion, lifecycle teardown, dependency boundary, bundle budget 검사
- GitHub Actions에서 lint, build, node/browser QA 및 package 검증 자동 실행

## 주요 안정화 내용

- Slider progress ring/bar와 독립 Progress 모듈의 속성 충돌 제거
- Text Reveal/Text Split의 `hold`, Fullpage/Radial의 `drag`,
  Lightbox의 `cursor` 옵션을 동명 모듈 활성 속성과 구분
- Cover Reveal 설정 변경 후 검은 커버가 남는 재초기화 경로 수정
- 설정 그룹을 가변 높이 2열로 배치하고, 한 그룹만 남으면 전체폭 사용
- 접힌 그룹의 빈 배경과 설정/코드 전환 시 높이 점프 제거
- 모바일 헤더·사이트맵·하단 탐색·맨 위로 버튼 간 충돌 수정
- 모듈별 지원하지 않는 설정 필드를 조건부로 숨김
- 공개 ease/easing 옵션이 있는 모듈에 공통 easing editor 제공
- 데모 카드 제목 1줄, 설명 2줄, 모듈 내부 높이 정렬 규칙 적용

## 배포 검증

`npm run ci`와 tarball 설치 검증을 모두 통과한 커밋만 배포 대상으로
사용합니다. 자동 브라우저 QA는 Chromium 기준이며 Safari/WebKit 및
실기기 터치·진동은 릴리스 후 별도 확인 항목입니다.
