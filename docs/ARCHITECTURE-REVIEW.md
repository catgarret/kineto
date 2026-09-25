# Architecture review — 2026-09-24

이 문서는 0.12 라인 준비 막바지(`v0.12.0` 태그 이후, 첫 게시본 v0.12.1 전)에 저장소 전체를 다시 읽고 정리한
**기술 방향 문서**입니다.
대상은 세 부류입니다: 다음에 코드를 만질 개발자(사람·AI), 데모를 리뷰 도구로 쓰는 디자인,
그리고 로드맵과 릴리스 순서를 정하는 기획·제품 쪽입니다. 구현 규칙 자체는
[ARCHITECTURE.md](ARCHITECTURE.md)와 [AI-HANDOFF.md](AI-HANDOFF.md)의 "Runtime conventions"가
기준이고, 여기서는 **왜 그 규칙이 생겼는지와 다음에 무엇을 해야 하는지**를 적습니다.

## 1. 한 줄 요약

Kineto는 "마크업 한 줄로 안전한 모션"이라는 약속이 대부분 지켜지고 있지만, 그 약속을
깨는 버그는 거의 항상 **같은 사실을 두 곳 이상에 손으로 적어 둔 자리**, **옵션 값을
신뢰한 자리**, **수명주기의 가장자리(pause·destroy·reduced motion)** 에서 나왔습니다.
이번 배치는 개별 증상이 아니라 그 세 가지 원인 계열을 닫는 데 집중했습니다.

## 2. 이번에 닫은 원인 계열

각 항목은 "증상 → 근본 원인 → 이제 무엇이 막는가" 순서입니다.

### 2.1 같은 사실을 두 번 적은 자리 (drift)

- **옵션 이름 충돌 목록.** `data-kt-hold="1400"`을 단 Text Transition이 Hold 버튼이
  되고, Slider의 `data-kt-drag`가 요소 자체를 끌 수 있게 만들었습니다. 코어와 데모가 같은
  목록을 각자 손으로 적었고 둘 다 빠진 항목이 있었습니다. → 계약(`kineto.features.json`)에서
  생성하는 `src/activationOwners.js`, `tests/activation-owners.mjs`.
- **Radial 드로어 필드.** Radial 카드를 Radial 블록으로 옮기자 설정창이 비었습니다. 필드를
  새로 적는 대신 Slider의 radial 필드를 Radial이 받는 옵션으로 걸러 **도출**했고, 툴팁도
  같은 방식으로 빌립니다.
- **Scroll Velocity `combo`.** 구현과 데모에는 있고 계약에는 없어 설정창·비교 시트에서
  빠져 있었습니다. → 계약에 추가, 생성물 재생성.

원칙: **목록·개수·선택지는 계약이나 소스에서 도출하고, 손으로 적은 사본은 테스트가 원본과
비교합니다.** 이 원칙은 이미 variant 목록·모듈 수·캐시 키에 적용돼 있었고 이번에 넓혔습니다.

### 2.2 옵션 값을 신뢰한 자리 (trust boundary)

옵션은 대부분 마크업에서 오고, 마크업은 CMS·번역 파일·사용자 데이터로 채워집니다.
Typewriter 커서 문자, Progress 링 색, Toast 아이콘, Cursor 링 문구, Overflow Text 속성
항목이 HTML 문자열에 들어가 있었고, 이전 빌드는 테스트 페이로드로 이미지 네 개를 만들고
스크립트를 네 번 실행했습니다. Page Transition은 같은 출처 링크가 다른 출처로
리다이렉트된 응답도 주입·실행했습니다.

→ 옵션 값은 텍스트로만 쓰고, HTML은 이름이 그렇게 붙은 옵션만 받습니다(`SECURITY.md`).
Page Transition은 요청·최종 응답 URL·`navigate()` 모두 같은 출처 http(s)이고 HTML일 때만
주입합니다. 엔진 전역은 DOM clobbering(`<img id="gsap">`)을 막기 위해 모양을 검사합니다.
데모 공유 링크는 설정창이 만들 수 있는 값만 복원합니다. 게이트:
`tests/browser/markup-trust.mjs`, MCP 테스트의 prototype 키 검사.

### 2.3 수명주기의 가장자리

| 증상 | 원인 |
|---|---|
| destroy 후 Sticky Header 클래스·Parallax transform이 되살아남 | destroy 직전 예약된 rAF가 가드 없이 실행 |
| destroy한 Bottom Sheet가 숨겨짐 | 닫힘 애니메이션의 finish 핸들러가 destroy 뒤에 실행 |
| Tilt가 탭 전환 한 번 뒤 죽음 | `pause()`가 취소한 rAF id를 지우지 않아 `resume()`이 예약하지 않음 |
| Radial `autoplay: true`가 폭주 | `Number(true)` = 1ms |
| 멈춘 캐러셀이 호버 아웃·스크롤 복귀로 다시 돔 | 모듈 내부 코드가 공개 `pause()/resume()`을 직접 호출 |
| 동작 줄이기에서 Lightbox가 안 열림, 날짜가 안 바뀜 | `reduced()`가 no-op → 기능 전체가 사라짐 |
| Presence의 exit 모션이 무시됨 | 문서·타입은 `exit`, 코드는 `leave`를 읽음 |
| Vue `v-motion`이 렌더마다 애니메이션 재시작 | 옵션 객체를 참조로 비교 |
| 120Hz 화면에서 Tilt·Magnetic·Card Glow 등이 약 40% 빠름, 바쁜 페이지에서 늘어짐 | 매 프레임 `lerp(현재, 목표, smoothing)` — 속도가 주사율에 묶임. Cursor만 시간 기준이었음 → `frameEase()`·`frameClock()` |
| 설정창에서 Tilt·Magnetic·Cursor·Mouse Parallax에 곡선을 고르면 멈춤 | 이 모듈들의 `ease`는 숫자(`smoothing` 별칭)인데 곡선 편집기를 붙였고, 모듈은 숫자 검사 없이 NaN을 씀. 옵션 *타입*이 계약에 없다는 §3-2 부채의 실제 사례 |
| 숨겨진 패널에서 만든 Tabs의 필이 드러난 뒤에도 안 보임(WebKit 릴리스 게이트 실패) | 숨김 중에 `width: 0`을 써 두고, 드러날 때 슬라이드 전환이 0부터 시작 → 크기 없으면 안 쓰고, 기하 복구는 전환 없이 |
| Ambient Media 안의 Lazy 이미지가 영영 안 뜸, 화면 안 슬라이더가 멈춤 | 옮겨진 노드는 IntersectionObserver가 `[안 보임, 보임]`을 한 묶음으로 보내는데 첫 기록(`([entry]) =>`)만 읽음 → `latestEntry()` |

→ `tests/browser/lifecycle-edges.mjs`(세 엔진)와 Presence·framework QA 보강. 규칙은
AI-HANDOFF의 "pause/resume/destroy leave nothing running", "Reduced motion removes
motion, not features".

### 2.4 스크롤 위치가 레이아웃을 따라가지 못한 자리

ScrollTrigger는 트리거 위치를 한 번 재고, 창 크기 변경·`load` 때만 다시 잽니다. 위쪽
내용 높이가 나중에 바뀌면(이미지·아코디언·"더 보기") 고정 섹션이 엉뚱한 곳에서 켜져
내용과 겹칩니다. → 코어가 body 높이를 지켜보다가 멈추면 한 번 refresh
(`src/layoutRefresh.js`, `tests/browser/layout-refresh.mjs`). 소유자가 본 겹침을 헤드리스로
그대로 재현하지는 못했으므로, **원인 계열을 닫은 것**이지 그 화면 하나를 재현해 고친 것은
아닙니다. 배포 후 같은 경로(Class Hook 이후 스크롤)를 실제 브라우저로 다시 확인해야 합니다.

### 2.5 네이티브 경로가 조용히 멈춘 자리

`overflow: hidden` 조상은 아무도 스크롤할 수 없는 스크롤 컨테이너라서, 그 안의 네이티브
`scroll()`/`view()` 타임라인은 영원히 0입니다. 데모의 CSS Scroll 네이티브 탭이 그랬습니다.
→ `cssScroll`이 그 조상을 찾으면 대체 경로로 동작하고 `KT_NATIVE_FALLBACK` 진단으로 원인과
해결책(`overflow: clip`)을 알려 줍니다.

### 2.6 릴리스가 검증보다 먼저 나간 자리

`release:ship`은 `main`과 태그를 한 번에 푸시했습니다. 태그는 옮기지 않으므로, CI가 그 뒤에 실패하면 버전
번호만 소진됩니다. `v0.12.0`이 정확히 그렇게 됐습니다 — 태그는 남았지만 릴리스 검사가 실패해 npm에는 0.11.0이
그대로이고, 데모 사이트는 CI가 초록일 때만 배포되므로 이전 빌드에 머물렀습니다. 이제 `release:ship`은 `main`을
푸시하고 **그 커밋의 CI가 통과한 뒤에만** 태그를 만듭니다(`scripts/ci-status.mjs`, 토큰 없이 공개 API 읽기).
CI가 실패하면 태그가 없으므로 같은 명령을 다시 실행하면 됩니다. 수정은 규칙대로 새 패치 v0.12.1로 나갑니다.

v0.12.1은 반대 방향으로 같은 결과가 났습니다. CI가 통과한 커밋을 릴리스 workflow가 25분 동안 **똑같이 다시**
돌리다 흔들리는 테스트 하나에 실패해 그 버전도 소진됐습니다. 같은 커밋을 두 번 검증하는 것은 안전을 더하지
않고 실패 기회만 두 배로 만듭니다. 이제 릴리스는 태그 커밋의 CI 성공을 요구하고(`scripts/require-green-ci.mjs`)
배포할 패키지만 다시 검사합니다. CI가 빨간색이면 실패한 job만 다시 돌리고 같은 태그로 릴리스를 다시 돌릴 수
있습니다.

### 2.7 CI가 테스트 실행기로 쓰인 자리

2026-09-25에 본 실패 CI 26건 중 15건은 lint, `ReferenceError`, 재생성하지 않은 생성 파일이었습니다. 로컬에서
몇 분이면 잡히는 문제를 push한 뒤 CI에서 발견한 것입니다. 나머지 11건은 한 엔진에서 깨지거나 흔들린 브라우저
테스트였고, 재시도가 조용히 통과시키면 흔들림이 쌓였습니다. 테스트 목록도 `package.json`과 workflow YAML에
사본이 있어 어긋나 있었습니다(Firefox/WebKit CI가 `npm run test:browser:cross`보다 8개 더 돌림). 조치:
push 전 `npm run verify:push`(선택형 pre-push hook), 목록은 `package.json`에만 두고 CI는
`scripts/run-lane.mjs --shard`로 병렬 실행, 재시도로 통과한 테스트는 flaky로 annotation 보고.

## 3. 남은 구조 부채와 권장 순서

비용 대비 효과 순서입니다. 앞의 것이 뒤의 것을 쉽게 만듭니다.

1. **모듈 수명주기 헬퍼 `createScope()`** — 리스너·rAF·타이머·옵저버·Web Animation을
   한 곳에 등록하고 `destroy()`에서 자동 해제. 2.3의 버그는 전부 "해제를 손으로 적는다"에서
   나왔습니다. 먼저 옮길 모듈: Counter, Slider, Lightbox, Overflow Text(해제 지점이 가장
   많은 곳). 헬퍼는 3KB gzip 한도 안에서 코어에 둡니다.
   옵저버 등록도 이 헬퍼가 맡으면 "묶음의 마지막 기록을 따른다"를 모듈마다 기억할 필요가
   없어집니다(지금은 `latestEntry()`를 직접 불러야 합니다).
2. **옵션 타입을 계약에** — 지금 계약은 옵션 *이름*만 압니다. `text | number | boolean |
   color | selector | html` 같은 타입이 있으면 빈 속성 해석(`textOption`), 공유 링크 검증,
   MCP 검증, 설정창 필드, `d.ts` 생성이 전부 한 곳에서 나옵니다. 2.1과 2.2의 나머지 사본이
   여기서 사라집니다.
3. **트리셰이킹 가능한 기본 경로** — 메인 엔트리는 55개 모듈을 모두 등록하므로 번들러
   사용자는 전체(약 167KB gzip)를 냅니다. `@dong-gri/kineto/core` + 모듈별 import는 이미
   있으니, 문서·레시피·MCP 스니펫의 **기본값**을 모듈형으로 바꾸는 것이 먼저이고 코드
   변경은 작습니다.
4. **어댑터를 `/core` 위로** — React/Vue 어댑터가 전체 패키지를 가져와 171~173KB가
   됩니다. 어댑터는 코어와 사용하는 모듈만 받아야 합니다(브레이킹이므로 다음 minor에서
   병행 제공 후 전환).
5. **CSS 분리** — `kineto.css` 한 파일(45KB raw)을 모듈형 빌드에서는 모듈별로.
6. **데모 스크립트 분할** — `demo/main.js`(1,400줄+)와 `demo/playground.js`(3,200줄+)를
   `demo/fold.js`·`demo/compare.js`처럼 기능 파일로. 기능마다 브라우저 테스트가 하나씩
   붙는 구조가 이미 검증됐습니다.

## 4. 유관 부서와의 방향

### 디자인

- 데모는 이제 **리뷰 도구**입니다: 블록은 대표 두 줄, "모든 variant 비교" 시트는 같은 소재
  위의 전 variant, "설정 · 코드"의 공유 링크는 조정한 값을 그대로 전달합니다. 리뷰 요청은
  `#cmp-<모듈>` 링크나 공유 링크로 주고받는 것을 권합니다.
- 다음 단계 제안: **모션 토큰**(duration·easing 단계)을 디자인 시스템과 같은 이름으로
  계약에 두기. Figma 레이어 이름 → 모듈 추천은 MCP의 `kineto_figma_layers`가 이미 합니다.
- Liquid Glass처럼 "플랫폼 재질"을 흉내 내는 효과는 **엔진 지원 차이가 큽니다**(SVG
  backdrop 굴절은 Chromium 전용). 시안 검토는 Chromium에서, 대체 모습(블러·림)은
  Safari·Firefox에서 따로 확인해야 합니다.

### 제품·사업

- 가치 제안: **의존성 없는 런타임 + 필요할 때만 엔진 로드 + 접근성·동작 줄이기 기본 대응 +
  AI 도구 연동(MCP·규칙 파일)**. 이번 배치로 "안전한 기본값"에 보안 신뢰 경계가 명시적으로
  추가됐고, 이는 CMS 연동 사례에서 채택 장벽을 낮춥니다.
- 위험: 전체 번들 크기. 3의 3·4번(모듈형 기본 경로, 어댑터 경량화)이 도입 비용을 가장 크게
  줄이는 작업입니다.
- 측정 지표 제안: 모듈별 gzip 크기(이미 예산으로 관리), npm·jsDelivr 사용량(배지 존재),
  데모 유휴 비용(idle-cost 테스트), 공개 이슈의 재현 소요 시간.

### 기획·로드맵

- 1.0 조건으로 권장: API 동결 선언 + 옵션 타입 계약(3-2) + 수명주기 헬퍼(3-1).
- 새 모듈 기준은 그대로: 3KB gzip 정지 규칙, variant 구분성 감사 통과, 데모 카드·비교
  시트·드로어가 계약에서 자동으로 나올 것.
- 릴리스는 두 단계로 유지합니다: `main` push → CI·Pages 확인 → `release:ship`. 태그는 옮길
  수 없으므로 CI 확인 전에 태그를 만들지 않습니다([RELEASING.md](RELEASING.md)).

## 5. 이번 배치의 품질 게이트

| 게이트 | 지키는 것 |
|---|---|
| `tests/browser/layout-refresh.mjs` | 높이 변화 뒤 트리거 위치 갱신, refresh 고리 없음, opt-out |
| `tests/browser/css-scroll.mjs` (보강) | `overflow: hidden` 안의 네이티브 타임라인 → 대체 경로 + 진단 |
| `tests/browser/card-glass.mjs` (보강) | 굴절 프로파일: 단조, 테두리 최대, 안쪽 끝 이음매 없음 |
| `tests/browser/markup-trust.mjs` | 옵션 값 텍스트화, Page Transition 출처 규칙, 엔진 전역 검사 |
| `tests/activation-owners.mjs` | 계약 도출 충돌 목록과 11개 충돌 동작 |
| `tests/browser/lifecycle-edges.mjs` | destroy 뒤 쓰기 없음, pause/resume, 동작 줄이기 기능 유지 |
| `tests/browser/demo-blocks.mjs` | Radial 블록, 두 줄 접기(데스크톱·폰), Reveal 모서리, CSS Scroll 탭 |
| `tests/browser/magnetic-dock.mjs` (보강) | Dock 스윕의 떨림(flip) 회귀 |

모든 브라우저 게이트는 Chromium·Firefox·WebKit에서 돌며 CI의 cross-browser 단계와 릴리스
워크플로에 연결돼 있습니다.
