# Kineto v0.8.43 QA Report

검증일: 2026-07-26
대상: npm 배포 후보 전체 소스

## 자동 검증

| 영역 | 결과 | 세부 내용 |
|---|---|---|
| Lint | 통과 | source, tests, playground |
| Build | 통과 | ESM, UMD, minified JS/CSS |
| Feature contract | 통과 | 50 modules, 26 Core APIs |
| Owner requirements | 통과 | 46 locked requirements |
| Docs / options parity | 통과 | 생성 문서와 설정 필드 계약 동기화 |
| Package surface | 통과 | ESM, CommonJS, CSS, React/Vue/jQuery entry |
| Lifecycle | 통과 | 이벤트·rAF·Observer 해제 및 reduced-motion 재적용 |
| Bundle budget | 통과 | gzip: ESM 100.4 kB, UMD 88.8 kB, CSS 4.5 kB |

## 실제 브라우저 회귀 항목

- Slider 자동재생, hover/manual pause, 남은 시간 유지
- Slider progress ring/bar 전환과 독립 Progress 모듈의 속성 충돌 방지
- 설정 그룹의 1열 전체폭, 2열 가변 높이 배치, 접힘 높이 재계산
- Cover Reveal gallery의 3개 레이어와 random direction
- Cursor 요소별 라벨·색 capsule
- Reveal order, Counter, Loader, Toast와 모듈 lifecycle
- 모바일 헤더, 사이트맵, 하단 탐색과 맨 위로 버튼의 안전 간격
- 데모의 정적 inline style/script/style block 0건 및 50개 모듈 탐색 일치

## 패키지 확인

배포 전 `npm pack --dry-run`으로 92개 파일, 압축 1.0 MB의 패키지 구성을
검사하고, ESM, CommonJS, CSS 및 adapter entry를 별도 package surface
테스트로 확인합니다. 현재 패키지명은 `@dong-gri/kineto`, 버전은
`0.8.43`입니다.

## 별도 실기기 확인 권장

- Safari / WebKit
- 실제 iOS Safari와 Android Chrome의 터치·진동
- 장시간 탭 유지 시 메모리와 배터리 사용량

외부 iframe 영상은 same-origin 픽셀 접근이 불가능하므로
`ambientSrc` 또는 `source`로 지정한 이미지를 사용합니다.
