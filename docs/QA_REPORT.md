# Kineto v0.9.8 QA Report

검증일: 2026-09-12
대상: v0.9.8 공개 릴리스 `92bc1b6` · 이전 공개 배포 근거는 버전별로 유지

## 2026-09-14 Unreleased 검증

### 후속: Reveal 비교 카드 5개

Fade·Zoom In·Zoom Out·Flip X·Flip Y에 동일한 문구·박스 크기·0.9초 재생
시간을 사용하는 전용 카드를 추가했습니다. 기존 variant의 기본값이나
런타임은 변경하지 않았습니다. 새 카드는 semantic 공유 링크만 사용하며
기존 v1 순번을 소비하지 않습니다.

전용 고위험 variant markup은 62/78, Reveal은 14/23, 전체 playground는
204개입니다. 카드 설명은 160개로 늘었으며 7개 언어 대응 검사를 통과했습니다.
이 숫자는 전용 데모 범위이며, 모든 variant의 실기기 시각 검증 완료를 뜻하지
않습니다. 로컬 Chromium의 reduced-motion 최종 상태를 직접 캡처해 균등한
카드 폭과 문구 중앙 정렬을 확인했습니다. 외부 CDN을 차단한 캡처이므로 외부
아이콘·폰트 표시의 운영 환경 검증 근거로 사용하지 않습니다.

Node 24 전체 `npm run ci`가 종료 코드 0으로 완료됐습니다. 구조·번역 검사가
새 설명 수와 로드맵 집계 불일치를 잡아 정확히 갱신한 뒤 전체를 다시 실행했습니다.
204개 playground·652개 고유 컨트롤, 14개 Slider/Reveal 비교 카드의 설정 연결·
고유 semantic 링크·desktop/390px bounds·Reset 후 drawer 정리 검사를 포함합니다.
최종 lint와 roadmap readiness도 통과했습니다. 런타임 패키지 77파일과
기존 번들 예산을 유지하며 실제 모바일 기기·공개 배포는 이번 범위에서 미검증입니다.
최종 `npm run test:demo`도 다시 통과했으며, 복사 HTML의 프리셋·전용 Replay
버튼·작성한 줄바꿈 보존 단언을 포함합니다.

### 후속: Wave 색상과 합성 옵션

기본 SVG 왜곡을 유지하면서 명시한 `colors` 배열만 35% 색조로 순환하고,
`blendMode`는 재생 중 대상의 배경 합성으로 적용합니다. 색조는 원본 alpha
안에서 합성하며 DOM/이미지를 복제하지 않습니다. CSS 변수·currentColor는
생성 시 대상 문맥에서 해석합니다. 기존 타이머를 공유하며 종료·이탈·destroy
시 원래 mix-blend-mode와 priority를 복원합니다.

Chromium·Firefox·WebKit 각각 81개 결정적 검사와 실제 hover/scroll·재진입,
원래 DOM 보존·reduced motion·렌더링 픽셀 차이 검사를 통과했습니다.
기본/빨강/파랑/배경 difference 합성의 스크린샷 바이트를 비교해 옵션이
실제 픽셀에 영향을 주는지 확인했습니다. 픽셀 차이는 시각 디자인 평가를
대체하지 않으며, 실제 모바일 기기와 공개 배포는 이번 범위에서 미검증입니다.

측정: 534.0KiB packed / 1770.3KiB unpacked / 77파일. UMD gzip은
124.2KiB로 약 0.3KiB 증가했습니다. 패키지 상한은 535/1771KiB,
readable ESM raw/gzip은 527/139KiB, UMD gzip은 124KiB로 조정했습니다.
기존 runner variance·minified ESM·소비자 조합 예산은 그대로입니다.
이 변경은 최적화 수치가 아니라 선택적 기능 구현 비용입니다.

Node 24 전체 `npm run ci`가 종료 코드 0으로 완료됐습니다. 추가한 테스트의
Event 전역 표기와 중국어 도움말 로캘 누락을 lint/번역 게이트가 잡아 수정한
뒤 전체를 다시 실행했습니다. 652개 데모 컨트롤·515개 도움말 키, 프레임워크·
SSR/hydration·Chromium 회귀·패키지 dry-run을 통과했습니다.

### 후속: 프레임워크 검사의 상태 기반 동기화

React·Vue mount/update/재진입의 고정 100~120ms 대기를 최대 2초의
상태 단언으로 교체했습니다. 기존 단언 49개가 순서까지 동일한지 비교했고,
callback·DOM 제거·상태 전파·누수 검사는 삭제하지 않았습니다.
대기 helper는 즉시 성공, 반복 확인 후 성공, 기존 100ms보다 늦은 150ms 완료,
미완료 시간 초과 및 원본 실패 원인 보존을 검사합니다. 런타임·공개 옵션은
변경하지 않았습니다. 이는 이전 실패의 확정 원인 규명이 아니라, 고정 대기
시간에 의존하던 검사 구조의 보강입니다.

Node 24 전체 `npm run ci`가 첫 통합 실행에서 종료 코드 0으로 완료됐습니다.
React/Vue/jQuery lifecycle, SSR/hydration, 데모·Chromium 회귀 및 패키지
dry-run을 통과했습니다. 추가 브라우저 엔진·실기기·공개 배포는 이번 범위에서
검증하지 않았습니다.

### 후속: class-only Reveal 관찰 재개

Native class-only 경로는 pause에서 IntersectionObserver를 끊은 뒤 resume에서
다시 연결하지 않았습니다. 정지 상태의 class 변경을 막고 필요한 관찰만 재개하도록
수정했습니다. 일반·저성능 티어 각각의 once true/false, 반복 pause/resume,
완료한 1회 진입 보존과 destroy 후 DOM 복원을 Chromium·Firefox·WebKit에서 확인했습니다.
작성자가 연결한 CSS 애니메이션 자체의 정지는 이 기능에 포함되지 않습니다.

패키지는 압축 533.0KiB·해제 1766.4KiB·77파일로 기존 상한을 통과했습니다.
첫 통합 CI는 Vue Transition의 100ms 후 DOM 제거 단언에서 실패했습니다.
이 실패를 Reveal 수정으로 해결했다고 주장하지 않으며, 별도 브라우저 검사와
겹치지 않는 단독 통합 실행 결과를 아래에 기록합니다. 실제 모바일 기기는 미검증이며
변경은 아직 게시하지 않았습니다.

단독 재실행한 Node 24 `npm run ci`는 종료 코드 0으로 완료됐습니다.
Vue Transition을 포함한 프레임워크·650개 데모 컨트롤·전체 Chromium 회귀와
패키지 dry-run을 통과했습니다. 최초 실패의 원인은 확정하지 않았습니다.

### 후속: 저성능 Reveal 경로와 반복 작업 비용

Core가 `fallback(el, options, Kineto)`로 전달한 context를 Reveal의 내부
시작 geometry로 잘못 읽어 선택한 프리셋이 사라지는 문제를 재현했습니다.
추가한 Chromium 검사에서 수정 전 32개 단언이 실패했고, 수정 후에는 저성능
티어에서도 23개 프리셋·class-only·원본 DOM 복원이 통과했습니다.
GSAP·ScrollTrigger가 로드된 경우에도 저성능 재생에서 해당 엔진을 호출하지
않는지 검사하며 Firefox·WebKit에서도 통과했습니다.

Native 완료 목록은 Set으로 관리해 완료마다 전체 배열을 복사·검색하던
작업을 제거했습니다. 공통 keyframe 입력을 자식마다 다시 만들지 않고 재사용하며,
여러 class token의 추가·제거를 각각 한 번의 DOM 호출로 처리합니다.
FPS·배터리 사용량의 개선 수치는 측정하지 않았습니다.

압축 패키지는 532.8KiB, 압축 해제는 1766.1KiB·77파일입니다. 해제 크기가
이전 1766KiB 상한을 약 0.1KiB 초과해 해당 상한만 1767KiB로 조정했습니다.
압축 상한 534KiB·소비자 번들 예산·runtime 의존성 0개는 유지합니다.
이 변경은 아직 게시되지 않았으며 v0.9.8 배포 근거와 구분합니다.
Node 24 전체 `npm run ci`가 종료 코드 0으로 완료됐고, 최종 Chromium
Reveal 검사에도 23개 프리셋의 native/GSAP·저성능 경로가 포함됐습니다.

### 후속: 일반 native Reveal 재생 제어

일반 native Reveal의 Web Animations 경로에서 pause/resume가 시작 지연·
자식 stagger·중간 진행률을 보존하도록 보강했습니다. 작성자의 별도 애니메이션을
유지하며, 완료 후 resume는 재시작하지 않습니다. replay/destroy는 소유한
애니메이션만 취소합니다. 기존 `ease` 움직임과 API 없는 CSS 경로는 유지합니다.
일반 native 반복 viewport callback 및 구형 CSS 경로의 pause/resume는 미지원입니다.

Node 24 `npm run ci`가 종료 코드 0으로 완료됐습니다. 후속 빌드의 패키지는
532.7KiB packed / 1765.9KiB unpacked·77파일이며, min UMD gzip은 123.9KiB입니다.
Reveal의 23개 프리셋 × native/GSAP 및 추가 재생 제어·구형 CSS 경로를
Chromium·Firefox·WebKit에서 검사했습니다.
이번에는 번들·패키지 예산을 올리지 않았습니다. 기존 마스크 전용 경로로 이동한
중복 clipping 처리를 일반 fallback에서 제거했습니다.

이전 문서 수정 `a66de20`의 원격 CI `34805256180`과 canonical Pages
`34806167009`는 성공한 것을 별도 확인했습니다. 이것은 이번 Unreleased 소스의
원격 검사나 npm 게시 성공 근거가 아닙니다.

### 앞선 Mask·Wave 묶음

아래 변경은 로컬 검증 완료 상태이며, v0.9.8 공개 릴리스에 포함된 것으로
표시하지 않습니다. Node 24에서 `npm run ci`가 종료 코드 0으로 완료됐습니다.

- Reveal: 23개 프리셋 × native/GSAP 검사, Mask·Wipe·Clock 반복 진입과 역재생,
  네 경계 callback, pause/resume, stagger 완료, clipping 조상과 destroy 복원을
  Chromium·Firefox·WebKit에서 통과했습니다.
- Wave: 세 엔진에서 각각 65개 결정적 검사와 실제 hover/scroll·SVG 프레임·
  reduced-motion·제거 검사를 통과했습니다. 숨김 탭 정지, 진행률·지연 보존,
  1회 재생과 replay를 포함합니다.
- 데모: Wave 1회 재생 카드, 7개 언어 설명, seed·왜곡량 표시와 복사 설정을
  추가했습니다. 199개 playground와 기존 공유 링크를 전체 데모 QA로 검사했습니다.
- 소비자: Vite·Rolldown 및 React·Vue SSR·hydration·lifecycle fixture를 통과했습니다.
  전체 Vite gzip은 138.4KiB, min UMD gzip은 123.8KiB입니다.
- 비용: 패키지는 약 532.3KiB/압축 해제 1764.7KiB·77파일입니다. 기존 용량
  상한 초과를 확인한 뒤 상태 관리 보강 비용으로 해당 예산만 명시적으로
  조정했습니다. 런타임 연산 감소와 별개로 번들 용량 최적화라고 주장하지 않습니다.
  모듈 조합 예산, 허용 러너 오차, runtime 의존성 0개는 유지합니다.
- 공급망: 추가 실행한 root `npm audit --json`의 취약점은 0건입니다.

현재 Wave의 `colors`·`blendMode`, 일반 native Reveal의 반복 경계 callback, 실기기
iOS/Android·스크린리더와 외부 프로젝트 장기 사용 증거는 남아 있습니다.
이번 브라우저 자동 검사는 실기기 검증을 대신하지 않습니다.

## 2026-09-12 후속 변경 검증

아래는 v0.9.8에 포함된 변경의 로컬 실행 근거입니다. 이후 완료한 원격
CI·npm·Pages 검증은 아래 `배포 후 확인 > v0.9.8`에 별도로 기록합니다.
v0.9.7 공개 릴리스 근거는 보존하며, 후속 Unreleased 소스의 검증과 구분합니다.

| 영역 | 결과 | 검증 범위 |
|---|---|---|
| Slider | 통과 | 세 엔진 10/10 효과의 실제 중간·최종 프레임, 이미지 드래그, 버튼·키보드, Replay·destroy, 앱이 변경한 비소유 host/viewport/Radial 항목 스타일·클래스 보존 |
| Reveal | 통과 | 세 엔진 23개 프리셋 × native/GSAP, 실제 진입, delay/완료 시점, 원본 줄바꿈, 재생 중 제거, 일반 GSAP 경로 반복 진입, callback 내부 destroy 후 후속 변경 차단 |
| 데모 | 통과 | 198개 playground, 650/650 고유 설정(렌더된 control 5,122개), 신규 비교 카드 9개, 390px 배치, 기존 공유 URL, 7개 locale의 실행 중 hero text·ARIA |
| 공급망 | 통과 | Node 24에서 root·consumer·framework 3개 lockfile 각각 취약점 0건 |
| 통합 CI·릴리스 검증 | 통과 | Node 24.20.0 `npm run ci` 및 v0.9.8 `npm run verify`: lint·build·전체 Node·데모·Chromium·npm pack·3개 lockfile 감사, 기존 번들·패키지 상한 유지 |
| 공개 범위 | 유지 | 52개 모듈·28개 Core API·48개 요구사항, runtime 의존성 0개·npm 파일 77개 |

비교 카드 검사의 숨겨진 drawer 본문이 후속 공유 링크 검사에 간섭한 문제는
기존 Reset 경로로 정리해 해결했습니다. 이후 드러난 hero의 이전 언어 ARIA는
정상 사용에서도 재현돼, 언어 전환 시 Blur Text의 DOM·snapshot·접근성 이름을
함께 재생성했습니다. 기존 공유 링크·번역 단언을 제외하지 않았습니다.
Native Scroll Snap의 복원 검사는 CSSOM이 정규화한 공백·세미콜론을 실패로
판정하던 문자열 비교 대신 전체 CSS 속성값·priority를 비교합니다.
`overflow:auto !important` 복원까지 포함한 11개 검사가 통과했습니다.

패키지 예산을 넘긴 초기 구현은 Reveal의 대상 수집·원본 복원·클래스 처리와
Slider의 소유 상태 복원 중복을 통합했습니다. 기존 예산·77개 allowlist는
변경하지 않았습니다. 실기기 iOS/Android·스크린리더, 외부 프로젝트 사례와
문서에 남긴 마스크 계열 반복·Glitch Wave 옵션의 동작 차이는 미완료입니다.

## v0.9.7 자동 검증 기록

| 영역 | 결과 | 세부 내용 |
|---|---|---|
| Lint | 통과 | source, tests, 모든 demo 스크립트 |
| Build | 통과 | ESM, UMD, minified JS/CSS |
| Feature contract | 통과 | 52 modules, 28 Core APIs |
| Owner requirements | 통과 | 48 locked requirements |
| Docs / options parity | 통과 | 생성 문서와 설정 필드 계약 동기화 |
| Package surface | 통과 | ESM, CommonJS, CSS, React/Vue/jQuery entry |
| Lifecycle | 통과 | 이벤트·rAF·Observer 해제 및 reduced-motion 재적용 |
| Bundle budget | 통과 | Node 24 gzip: min ESM 123.2 kB, min UMD 122.5 kB, CSS 9.2 kB; 전체 측정값은 `docs/bundle-size.md` |
| Integrated gates | 통과 | 수정본 `npm run ci`, v0.9.7 `npm run verify`; root·consumer·framework lockfile 모두 취약점 0건 |

## v0.9.7 추가 검증

| 영역 | 결과 | 세부 내용 |
|---|---|---|
| 데모 설정 응답 | 통과 | 런타임 필드 정의 576개와 virtual/ease 확장을 포함한 고유 control 650개 전수 조작, 무반응 0건 |
| 데모 재빌드 | 통과 | 51개 모듈·7개 control 타입의 debounce 적용 완료, 오류·trigger 유실·중복 instance 0건 |

Chromium 검사는 189개 playground에 실제 렌더된 control instance 4,804개를
`module.key:type` 기준으로 중복 제거해 검사합니다. 초기 preset에서 조건부로 숨겨진
23개 control도 포함하며, 각 값을 다른 유효 값으로 바꿔 attribute 또는 생성 코드의
동기 반영을 확인한 뒤 원래 값으로 복원하고 모듈별 실제 재빌드를 한 번 실행합니다.
별도 Node 계약 검사는 `Object.assign()`과 후속 `push()`까지 반영된 전체 런타임
manifest를 읽어 중복 키와 지원하지 않는 control 타입을 차단합니다.

Node 24 첫 시도의 `ERR_INTERNET_DISCONNECTED` 13건은 강제 오프라인 진단에서
동일하게 재현했습니다. 원인은 fixture에서 빠진 GTM 1건·Prism CSS/JS 4건과
두 번 요청된 배지 이미지 8건이었습니다. 신규 Cursor fetch나 로컬 이미지
요청 실패는 없었습니다.

해당 고유 URL 9개만 QA용 noop script·빈 CSS·유효 SVG로 격리하고, 데모
검사 문맥을 항상 offline으로 고정했습니다. 변경 후 데모 초기화와 7개
locale 전환에서 요청 실패·console 오류는 모두 0건입니다. 별도로 주입한
미등록 외부 이미지 요청은 계속 실패하며 console에 실제 URL이 기록됨을
확인했습니다. 공개 사이트의 GTM·배지 markup은 유지합니다.

## 회귀 검증 범위

아래는 Node DOM 회귀 검사와 실제 브라우저 검사의 합산 범위입니다.
문자열·중첩 원본 DOM 복원 경계는 `test:regressions`의 DOM fixture로,
움직임·좌표·이미지 프레임은 실제 Chromium·Firefox·WebKit fixture로 확인합니다.
실제 iPhone·Android 기기의 OS 관성이나 화면 시각 검증으로 집계하지 않습니다.

- Slider 자동재생, hover/manual pause, 남은 시간 유지
- Slider progress ring/bar 전환과 독립 Progress 모듈의 속성 충돌 방지
- 설정 그룹의 1열 전체폭, 2열 가변 높이 배치, 접힘 높이 재계산
- 데모의 고유 설정 전수 옵션 반영, 모듈별 재빌드, trigger 유지와 instance 중복 방지
- GIF·APNG·animated WebP 클릭 이미지의 첫 사이클 변화·최종 프레임 정지·재시작·터치 cleanup을 세 엔진에서 실제 이미지로 확인
- Text Split·Text Reveal·Blur Text의 `<br>`·LF·CRLF·reduced-motion·중첩 원본 DOM 복원과 native flicker 취소/재개
- Counter Slot·Clock의 authored line-height 표시 창 및 overflow·paint containment
- hero 한 제스처의 감속 이동·양방향 착지·잔여 입력 처리, Quad Dot 중복 제거 후 이전 공유 URL 복원
- Cover Reveal gallery의 3개 레이어와 random direction
- Cursor 요소별 라벨·색 capsule
- Reveal order, Counter, Loader, Toast와 모듈 lifecycle
- 모바일 헤더, 사이트맵, 하단 탐색과 맨 위로 버튼의 안전 간격
- 데모의 정적 inline style/script/style block 0건 및 52개 공개 모듈 계약 일치
- 7개 언어의 카드·모듈 색인·설정창 UI 및 513개 옵션 도움말 번역 일치
- Scanner 무진행률 재생과 진행률 지정 시 정지, Loader/Loading Indicator 접근성 역할
- Coverflow·Dissolve·Wipe·Radial별 지원 옵션 노출과 무의미한 옵션 숨김
- Coverflow 활성 그림자 옵션·CSS 토큰·destroy 복원과 설정창 조건부 노출
- 700px 마지막 카드 전체폭, 390px 복합 로딩 문구, 메가메뉴 첫 hover·2열 화면 내 배치
- Firefox/WebKit cross-browser demo-polish: Radial ghost/swipe, 모바일 Mega Menu, drawer reflow, Page Reveal zoom/fixed header, Coverflow/Dissolve clip

## 패키지 확인

배포 전 `npm run test:package-tarball`로 실제 tarball을 별도 프로젝트에 설치해
ESM, CommonJS, CSS와 adapter entry를 확인합니다. `npm run test:package-size`는
압축 534 kB·해제 1767 kB·77개 파일의 상한과 배포 파일 allowlist를 검사합니다.
v0.9.8의 Node 24 `npm pack --dry-run --json` 측정값은 77개 파일,
압축 528.0 kB, 해제 1755.1 kB입니다. 실제 공개 tarball은 540,657 bytes,
registry의 해제 크기는 1,797,191 bytes로 확인했습니다. 이 수치는 릴리스
`92bc1b6`의 근거이며 후속 빌드 비용을 대신하지 않습니다. 다음 릴리스 후보는
최종 빌드한 뒤 위 세 명령을 다시 실행합니다.

<!-- release:prepare updates this source label, not the publication evidence below. -->
현재 소스의 패키지명은
`@dong-gri/kineto`, 버전은 `0.9.8`입니다.

## 배포 후 확인

- `npm run test:live-site`가 `https://kineto.dongri.me`에서 기대 커밋·현재 버전·52개 모듈·GTM·공개 CDN 설치 예시를 확인하고, 페이지가 실제 실행하는 co-deployed JS/CSS의 SHA-256이 테스트된 `dist/`와 같은지 재확인합니다.
- v0.9.6 CI `33947520040`, Release `33947520948`, canonical Pages `33947939177`이 성공했으며 npm에는 SLSA provenance v1 attestation이 함께 게시됐습니다.
- npm registry tarball과 GitHub Release asset은 SHA-256 `bfbd557cb7b34032df71fb2d6b629c4f39ebd03f8b518afcbec3abeca3b948b9`로 byte-for-byte 일치합니다.
- backup sync `33947970148`과 Pages `33947986088` 뒤 `npm run test:live-site:parity`가 두 도메인의 v0.9.6·52개 모듈·GTM·build `8d784b6`·runtime hash `77e3fae55ef1` 일치를 확인했습니다.

### v0.9.7

- [CI `34022107743`](https://github.com/catgarret/kineto/actions/runs/34022107743), [Release `34022108485`](https://github.com/catgarret/kineto/actions/runs/34022108485), [canonical Pages `34022529453`](https://github.com/catgarret/kineto/actions/runs/34022529453)가 모두 성공했습니다. Node 20·22 호환성과 Node 24 전체·Firefox·WebKit 검사를 포함합니다.
- npm 공개 version/latest `0.9.7`과 [GitHub Release](https://github.com/catgarret/kineto/releases/tag/v0.9.7)를 확인했습니다. npm 게시 metadata 시각은 `2026-09-06T08:39:55.559Z`입니다.
- npm/GitHub tarball은 직접 바이트 비교로 동일한 539,534 bytes이며 SHA-256은 `f79d165e05e0f77781826295b02b1fa8e43c0407ab5ad37a96336f569489dcbd`입니다. npm SHA512와 GitHub asset digest도 일치합니다.
- npm publish/v0.1·SLSA provenance/v1 attestation metadata의 subject digest, git commit `32db56e30c0edcecfae0ebd100017c84acc881e3`, Release run이 일치합니다. 별도 암호학적 서명 검증을 수행했다는 의미는 아닙니다.
- [backup sync `34022621240`](https://github.com/catgarret/catgarret.github.io/actions/runs/34022621240), [backup Pages `34022646728`](https://github.com/catgarret/catgarret.github.io/actions/runs/34022646728) 성공 후 `npm run test:live-site:parity`가 두 도메인의 `v0.9.7 / 52 modules / GTM / build 32db56e`를 확인했습니다.
- 2026-09-06 17:44 KST에 각 HTML이 참조하는 자체 JS/CSS 12개와 GIF·animated WebP·APNG·Click Burst SVG 4개가 두 도메인에서 모두 로컬 `site/`와 SHA256 일치했습니다. UMD는 `979166e8665ba347f067e92a1cc1c5c8bdd8bc9e66153b9e0b3aed6ca65ce900`, `main.js`는 `0bb967fe729b4a367028de8445afeb63896ccc02d77bb204b004698099de6ba9`입니다.
- 이 보고서의 후속 docs-only 커밋은 런타임·자체 asset을 변경하지 않습니다. Pages가 새 커밋을 배포하면 HTML build marker만 달라질 수 있으므로, release payload의 build와 현재 Pages build를 구분해 기록합니다.

### v0.9.8

- [CI `34674057118`](https://github.com/catgarret/kineto/actions/runs/34674057118), [Release `34674057605`](https://github.com/catgarret/kineto/actions/runs/34674057605), [canonical Pages `34674519452`](https://github.com/catgarret/kineto/actions/runs/34674519452)가 모두 성공했습니다. Node 20.19·22.12 호환성, Node 24 전체, Firefox·WebKit 및 별도 Release gate의 성공을 공개 API로 확인했습니다.
- npm 공개 version/latest `0.9.8`과 [GitHub Release](https://github.com/catgarret/kineto/releases/tag/v0.9.8)를 확인했습니다. npm 게시 metadata 시각은 `2026-09-12T05:00:06.440Z`, GitHub Release 게시 시각은 `2026-09-12T04:57:05Z`입니다. publish job 성공 직후의 registry 전파 지연은 재게시하지 않고 공개 응답으로 확인했습니다.
- npm/GitHub tarball은 직접 바이트 비교로 동일한 540,657 bytes이며 SHA-256은 `3590f2ce36caaef544811935cb2748000312e781f5f5b2f8fac63990508e29c4`입니다. npm SHA1·SHA512 integrity와 GitHub asset digest도 일치합니다.
- npm publish/v0.1·SLSA provenance/v1 attestation metadata의 subject SHA512가 실제 tarball과 일치합니다. source commit은 `92bc1b688c04c0bf9833abfa53d4200648b80464`, workflow는 `.github/workflows/release.yml@refs/tags/v0.9.8`, invocation은 `34674057605/attempts/1`입니다. 서명·투명성 로그의 암호학적 신뢰 체인 검증은 별도로 수행하지 않았습니다.
- [backup sync `34674543935`](https://github.com/catgarret/catgarret.github.io/actions/runs/34674543935), [backup Pages `34674565133`](https://github.com/catgarret/catgarret.github.io/actions/runs/34674565133)가 성공했습니다. backup Pages commit은 `9a0f39ed394eebc31ffe9a652c6277aa087457e7`이며 포함된 Kineto build는 `92bc1b6`입니다.
- `KT_EXPECTED_BUILD=92bc1b688c04c0bf9833abfa53d4200648b80464 KT_LIVE_ATTEMPTS=2 npm run test:live-site:parity`가 두 도메인의 `v0.9.8 / 52 modules / GTM / build 92bc1b6` 및 co-deployed UMD·CSS 일치를 확인했습니다.
- 2026-09-12 14:04:41 KST(`05:04:41 UTC`)에 각 공개 HTML의 실제 참조로 선택한 자체 JS/CSS 12개와 클릭 미디어 4개가 모두 해당 릴리스의 로컬 `site/` 및 상대 도메인과 byte/SHA256 일치했습니다. GTM script·noscript와 CI·npm·license·jsDelivr 배지 4개도 양쪽에 존재했습니다. 이는 네 배지의 markup 보존 확인이며 외부 배지 서비스의 내용까지 보증하지 않습니다.

주요 공개 asset SHA-256:

| 파일 | SHA-256 |
|---|---|
| `kineto.umd.min.js` | `f50b7ab3506f57d6dc0933d7fdf29435c358e2052d6493e8ffc93b6aeb2b6332` |
| `kineto.min.css` | `c777c609621d688ac6cebdc59d092d9455272348d55d94cabd01f33e10802e31` |
| `main.js` | `7f8b0555c9893518d3799528b9bc07a7700dbd25c4ca1687001ef5423ab1ae93` |
| `assets/click-burst.svg` | `596080f8bec342b88e30a336cebdcc976b0f1a6a538d2fdc3e260987e003931d` |
| `assets/motion-demo.gif` | `c92c37f8a025be36660a05dfc11d5d12464ea0e929b3c6284252964718c4aac6` |
| `assets/motion-demo.webp` | `68f2430e17b5e12c95aec32558aec30a589f2575c9d09007c70f57f697846e11` |
| `assets/motion-demo.png` | `f841f7735a9c73a31b5aef162b84a372ce6dc6ed33cee0f249e1f91c76a603bc` |

## 별도 실기기 확인 권장

- 실제 macOS Safari 앱(WebKit 자동화와 구분)
- 실제 iOS Safari와 Android Chrome의 터치·진동
- 장시간 탭 유지 시 메모리와 배터리 사용량

외부 iframe 영상은 same-origin 픽셀 접근이 불가능하므로
`ambientSrc` 또는 `source`로 지정한 이미지를 사용합니다.
