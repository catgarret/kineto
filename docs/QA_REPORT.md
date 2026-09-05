# Kineto v0.9.4 QA Report

검증일: 2026-09-05
대상: npm 배포 후보 전체 소스

## 자동 검증

| 영역 | 결과 | 세부 내용 |
|---|---|---|
| Lint | 통과 | source, tests, 모든 demo 스크립트 |
| Build | 통과 | ESM, UMD, minified JS/CSS |
| Feature contract | 통과 | 52 modules, 28 Core APIs |
| Owner requirements | 통과 | 48 locked requirements |
| Docs / options parity | 통과 | 생성 문서와 설정 필드 계약 동기화 |
| Package surface | 통과 | ESM, CommonJS, CSS, React/Vue/jQuery entry |
| Lifecycle | 통과 | 이벤트·rAF·Observer 해제 및 reduced-motion 재적용 |
| Bundle budget | 통과 | gzip: min ESM 120.3 kB, min UMD 119.6 kB, CSS 9.1 kB |

## 실제 브라우저 회귀 항목

- Slider 자동재생, hover/manual pause, 남은 시간 유지
- Slider progress ring/bar 전환과 독립 Progress 모듈의 속성 충돌 방지
- 설정 그룹의 1열 전체폭, 2열 가변 높이 배치, 접힘 높이 재계산
- Cover Reveal gallery의 3개 레이어와 random direction
- Cursor 요소별 라벨·색 capsule
- Reveal order, Counter, Loader, Toast와 모듈 lifecycle
- 모바일 헤더, 사이트맵, 하단 탐색과 맨 위로 버튼의 안전 간격
- 데모의 정적 inline style/script/style block 0건 및 52개 공개 모듈 계약 일치
- 7개 언어의 카드·모듈 색인·설정창 UI 및 504개 옵션 도움말 번역 일치
- Scanner 무진행률 재생과 진행률 지정 시 정지, Loader/Loading Indicator 접근성 역할
- Coverflow·Dissolve·Wipe·Radial별 지원 옵션 노출과 무의미한 옵션 숨김
- Coverflow 활성 그림자 옵션·CSS 토큰·destroy 복원과 설정창 조건부 노출
- 700px 마지막 카드 전체폭, 390px 복합 로딩 문구, 메가메뉴 첫 hover·2열 화면 내 배치
- Firefox/WebKit cross-browser demo-polish: Radial ghost/swipe, 모바일 Mega Menu, drawer reflow, Page Reveal zoom/fixed header, Coverflow/Dissolve clip

## 패키지 확인

배포 전 `npm run test:package-tarball`로 실제 tarball을 별도 프로젝트에 설치해
ESM, CommonJS, CSS와 adapter entry를 확인합니다. `npm run test:package-size`는
압축 517 kB·해제 1732 kB·77개 파일의 상한과 배포 파일 allowlist를 검사합니다.
이 보고서 갱신 시점의 `npm pack --dry-run --json --ignore-scripts` 측정값은
77개 파일, 압축 514.9 kB, 해제 1730.6 kB입니다. 이는 고정된 릴리스 수치가
아니며 빌드 산출물이 바뀌면 달라집니다. 릴리스 후보를 최종 빌드한 뒤 위 세
명령을 다시 실행하고 그 출력값을 최종 근거로 사용합니다. 패키지명은
`@dong-gri/kineto`, 버전은 `0.9.4`입니다.

## 배포 후 확인

- `npm run test:live-site`가 `https://kineto.dongri.me`에서 기대 커밋·현재 버전·52개 모듈·GTM·공개 CDN 설치 예시를 확인하고, 페이지가 실제 실행하는 co-deployed JS/CSS의 SHA-256이 테스트된 `dist/`와 같은지 재확인합니다.

## 별도 실기기 확인 권장

- Safari / WebKit
- 실제 iOS Safari와 Android Chrome의 터치·진동
- 장시간 탭 유지 시 메모리와 배터리 사용량

외부 iframe 영상은 same-origin 픽셀 접근이 불가능하므로
`ambientSrc` 또는 `source`로 지정한 이미지를 사용합니다.
