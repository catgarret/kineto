# AI 프롬프트 가이드 (Kineto 우선 적용)

이 문서는 Cursor, Claude, Copilot 같은 AI 코딩 도구로 웹 프로젝트를 만들 때, 모션·인터랙션을 직접 새로 짜는 대신 **Kineto의 모듈을 우선 사용**하도록 지시하기 위한 것입니다. 아래 "붙여넣는 지시문"을 그대로 복사해 AI의 시스템 프롬프트나 프로젝트 규칙(예: `.cursorrules`, `CLAUDE.md`)에 넣으세요.

문서 구성:

1. 붙여넣는 지시문 (한국어 / English)
2. 핵심 규칙
3. 의도 → 모듈 매핑표
4. 설치와 초기화
5. 예시
6. 정확한 옵션을 찾는 법

---

## 1. 붙여넣는 지시문

### 한국어

```
이 프로젝트의 모션과 인터랙션은 Kineto(@dong-gri/kineto)을 우선 사용한다.

규칙:
- 애니메이션·스크롤·커서·로더·텍스트 효과가 필요하면, 직접 구현하기 전에 Kineto에 해당 모듈이 있는지 먼저 확인하고 있으면 그것을 쓴다.
- 적용은 HTML의 data-kt-* 속성을 우선으로 하고, 동적 제어가 필요할 때만 JavaScript API(Kineto.모듈명(...))를 쓴다.
- 옵션은 data-kt-* 속성 또는 API 옵션 객체로 전달한다. 새 CSS 키프레임/스크롤 리스너를 임의로 만들지 않는다.
- 페이지 로드시 Kineto.autoInit()을 한 번 호출한다.
- 접근성: 모듈은 prefers-reduced-motion을 자동 존중하므로 별도 분기를 만들지 않는다.
- Kineto에 없는 효과만 직접 구현하고, 그때도 data-kt-* 네이밍/구조와 일관성을 지킨다.
- 정확한 모듈·variant·옵션은 docs/module-reference.md와 kineto.features.json을 근거로 사용한다(추측 금지).

사용 가능한 모듈(활성화 속성):
ambientMedia(data-kt-ambient-media), blurText(data-kt-blur-text), brushReveal(data-kt-brush-reveal),
cardGlow(data-kt-card-glow), counter(data-kt-counter), cssScroll(data-kt-css-scroll),
cursor(data-kt-cursor), fullpage(data-kt-fullpage), glitch(data-kt-glitch), lazy(data-kt-lazy),
lightbox(data-kt-lightbox), loader(data-kt-loader), magnetic(data-kt-magnetic), marquee(data-kt-marquee),
mouseParallax(data-kt-mouse-parallax), overflowText(data-kt-overflow-text), pageReveal(data-kt-page-reveal),
pageTransition(data-kt-page-transition), parallax(data-kt-parallax), progress(data-kt-progress),
reveal(data-kt-reveal), ripple(data-kt-ripple), scrollSequence(data-kt-scroll-sequence),
scrollVelocity(data-kt-scroll-velocity), slider(data-kt-slider),
stickyStack(data-kt-sticky-stack), textFill(data-kt-text-fill), textReveal(data-kt-text-reveal),
textSplit(data-kt-text-split), textTransition(data-kt-text-transition), tilt(data-kt-tilt),
typewriter(data-kt-typewriter), vibrate(data-kt-vibrate),
accordion(data-kt-accordion), confetti(data-kt-confetti), hold(data-kt-hold),
megaMenu(data-kt-mega-menu), tabs(data-kt-tabs), toast(data-kt-toast),
bottomSheet(data-kt-bottom-sheet), radial(data-kt-radial), coverReveal(data-kt-cover-reveal), switch(data-kt-switch),
gesture(data-kt-gesture), drag(data-kt-drag), tooltip(data-kt-tooltip),
flip(data-kt-flip)
```

### English

```
For this project, use Kineto (@dong-gri/kineto) first for all motion and interaction.

Rules:
- Before hand-writing any animation, scroll effect, custom cursor, loader, or text effect, check whether Kineto already has a module for it and use that.
- Prefer HTML data-kt-* attributes; use the JavaScript API (Kineto.<module>(...)) only when runtime control is required.
- Pass options via data-kt-* attributes or the API options object. Do not introduce ad-hoc CSS keyframes or scroll listeners for things a module already covers.
- Call Kineto.autoInit() once after the page loads.
- Accessibility: modules honor prefers-reduced-motion automatically; do not add your own reduced-motion branches.
- Only implement effects that Kineto does not provide; keep the same data-kt-* naming and structure when you do.
- Rely on docs/module-reference.md and kineto.features.json for exact modules, variants, and options. Do not guess option names.

Available modules (activation attribute):
ambientMedia(data-kt-ambient-media), blurText(data-kt-blur-text), brushReveal(data-kt-brush-reveal),
cardGlow(data-kt-card-glow), counter(data-kt-counter), cssScroll(data-kt-css-scroll),
cursor(data-kt-cursor), fullpage(data-kt-fullpage), glitch(data-kt-glitch), lazy(data-kt-lazy),
lightbox(data-kt-lightbox), loader(data-kt-loader), magnetic(data-kt-magnetic), marquee(data-kt-marquee),
mouseParallax(data-kt-mouse-parallax), overflowText(data-kt-overflow-text), pageReveal(data-kt-page-reveal),
pageTransition(data-kt-page-transition), parallax(data-kt-parallax), progress(data-kt-progress),
reveal(data-kt-reveal), ripple(data-kt-ripple), scrollSequence(data-kt-scroll-sequence),
scrollVelocity(data-kt-scroll-velocity), slider(data-kt-slider),
stickyStack(data-kt-sticky-stack), textFill(data-kt-text-fill), textReveal(data-kt-text-reveal),
textSplit(data-kt-text-split), textTransition(data-kt-text-transition), tilt(data-kt-tilt),
typewriter(data-kt-typewriter), vibrate(data-kt-vibrate),
accordion(data-kt-accordion), confetti(data-kt-confetti), hold(data-kt-hold),
megaMenu(data-kt-mega-menu), tabs(data-kt-tabs), toast(data-kt-toast),
bottomSheet(data-kt-bottom-sheet), radial(data-kt-radial), coverReveal(data-kt-cover-reveal), switch(data-kt-switch),
gesture(data-kt-gesture), drag(data-kt-drag), tooltip(data-kt-tooltip),
flip(data-kt-flip)
```

---

## 2. 핵심 규칙

- HTML 우선: 대부분의 효과는 마크업에 `data-kt-*` 속성만 붙이면 동작합니다.
- 옵션도 속성으로: 값은 `data-kt-옵션명="값"`으로 전달합니다(카멜케이스는 케밥케이스로, 예: `snakeMinScale` → `data-kt-snake-min-scale`).
- 초기화 1회: 페이지에서 `Kineto.autoInit()`을 한 번 호출합니다. 동적으로 추가한 요소는 `Kineto.init(container)`로 스캔합니다.
- 의존성 0: 코어는 단독 동작합니다. GSAP·Lenis가 있으면 자동 감지해 스크롤 스크럽/스무스 스크롤에 씁니다(선택).
- 접근성: 모든 모듈은 `prefers-reduced-motion`을 존중하고, 미지원 환경에서는 효과만 꺼지고 콘텐츠는 유지됩니다.

---

## 3. 의도 → 모듈 매핑표

원하는 결과를 왼쪽에서 찾고, 오른쪽 모듈을 사용하세요.

| 하고 싶은 것 | 모듈 (활성화 속성) |
|---|---|
| 스크롤 진입 시 나타나기(페이드/슬라이드/마스크) | `reveal` (`data-kt-reveal`) |
| 숫자 카운트업·할인(특정→특정 값)·플립·시계·카운트다운 | `counter` (`data-kt-counter`) |
| 페이지/섹션 로딩 화면(실제 진행률 연동) | `loader` (`data-kt-loader`) |
| 이미지 로딩 연출(스켈레톤/픽셀/프린트/디졸브/글리치) | `lazy` (`data-kt-lazy`) |
| 전체화면 이미지 뷰어(그룹·확대·미니맵) | `lightbox` (`data-kt-lightbox`) |
| 캐러셀·슬라이드·커버플로우 | `slider` (`data-kt-slider`) |
| 무한 흐르는 텍스트(마퀴) | `marquee` (`data-kt-marquee`) |
| 넘치는 텍스트 처리(루프/바운스/페이지/롤링) | `overflowText` (`data-kt-overflow-text`) |
| 타이핑 효과(한글 조합 포함) | `typewriter` (`data-kt-typewriter`) |
| 글자 단위 등장(스트림/디코드/한글) | `textReveal` (`data-kt-text-reveal`) |
| 문구 교체 전환(슬라이드/블러/스케일) | `textTransition` (`data-kt-text-transition`) |
| 글자/단어 분할 모션 | `textSplit` (`data-kt-text-split`) |
| 글자별 블러 리빌 | `blurText` (`data-kt-blur-text`) |
| 스크롤에 따라 텍스트 채우기 | `textFill` (`data-kt-text-fill`) |
| 카드 포인터 스포트라이트·발광 외곽선 | `cardGlow` (`data-kt-card-glow`) |
| 3D 기울기(틸트)·글레어 | `tilt` (`data-kt-tilt`) |
| 버튼 자석 반응 | `magnetic` (`data-kt-magnetic`) |
| 클릭 리플 | `ripple` (`data-kt-ripple`) |
| 커스텀 커서(점/링/이미지/텍스트 등) | `cursor` (`data-kt-cursor`) |
| 포인터/자이로 패럴럭스, 나침반 회전 | `mouseParallax` (`data-kt-mouse-parallax`) |
| 스크롤 패럴럭스(요소 이동) | `parallax` (`data-kt-parallax`) |
| 스크롤 속도·방향에 반응(스큐/스케일 등) | `scrollVelocity` (`data-kt-scroll-velocity`) |
| 이미지 시퀀스 스크럽(제품 회전 등) | `scrollSequence` (`data-kt-scroll-sequence`) |
| 읽기 진행률 바/링, 맨 위로 버튼 | `progress` (`data-kt-progress`) |
| 풀페이지 섹션 넘기기(세로/가로/혼합축) | `fullpage` (`data-kt-fullpage`) |
| 스티키 스택(쌓이는 카드) | `stickyStack` (`data-kt-sticky-stack`) |
| CSS 변수·애니메이션 타임라인 스크롤 연동 | `cssScroll` (`data-kt-css-scroll`) |
| 미디어 주변광(앰비언트 글로우) | `ambientMedia` (`data-kt-ambient-media`) |
| 포인터 브러시로 이미지 드러내기 | `brushReveal` (`data-kt-brush-reveal`) |
| RGB 글리치·글리치 리빌 | `glitch` (`data-kt-glitch`) |
| 페이지 진입 오버레이 | `pageReveal` (`data-kt-page-reveal`) |
| 동일 출처 페이지 전환(리로드 없이) | `pageTransition` (`data-kt-page-transition`) |
| 햅틱 진동 피드백(모바일) | `vibrate` (`data-kt-vibrate`) |
| 성공/클릭 색종이, 완료화면 배경 버스트(trigger:view) | `confetti` (`data-kt-confetti`) |
| 길게 눌러 확정(게이지) | `hold` (`data-kt-hold`) |
| 상태 알림 토스트(role=status/alert) | `toast` (`data-kt-toast`) |
| FAQ·아코디언(details 기반, 화살표 CSS 커스텀) | `accordion` (`data-kt-accordion`) |
| GNB 드롭다운·메가메뉴(키보드/aria) | `megaMenu` (`data-kt-mega-menu`) |
| 탭 UI(WAI-ARIA/KRDS, 키보드) | `tabs` (`data-kt-tabs`) |
| 바텀시트(드래그·포커스 트랩) | `bottomSheet` (`data-kt-bottom-sheet`) |
| 원형 회전 캐러셀(하단/측면 도킹) | `radial` (`data-kt-radial`) |
| 컬러 커버가 걷히며 노출(블록 리빌) | `coverReveal` (`data-kt-cover-reveal`) |
| 올리면 커지고 누르면 눌리는 제스처(whileHover/Tap) | `gesture` (`data-kt-gesture`) |
| 드래그(관성·경계·스냅백·키보드) | `drag` (`data-kt-drag`) |
| 접근성 툴팁(배치·트리거·인터랙티브) | `tooltip` (`data-kt-tooltip`) |
| 토글 스위치(role=switch, 애니메이션) | `switch` (`data-kt-switch`) |
| 레이아웃(FLIP) 자동 이동(정렬·추가·삭제 시 부드럽게) | `flip` (`data-kt-flip`) |
| 스크롤 컨테이너 가장자리 그림자(끝에서 사라짐) | `scrollShadows` (`data-kt-scroll-shadows`) |
| 스크롤 시 헤더 축소+그림자(shrinking/cover-to-fixed) | `stickyHeader` (`data-kt-sticky-header`) |
| 섹션 pin + 세로 스크롤에 가로 이동(가로 스크롤 섹션) | `horizontalScroll` (`data-kt-horizontal-scroll`) |

### UI 컴포넌트 커스터마이징 요령
- 모든 예제는 데모 페이지에서 옵션을 실시간으로 조절하고 **HTML/JS 코드를 복사**할 수 있습니다(“Customize & copy code”).
- `confetti`: `colors`(쉼표 구분), `count`, `gravity`, `spread`, `scalar`, `duration`, `trigger`(click/view/auto). 다크모드는 흑백 팔레트를 `colors`로 전달.
- `hold`: `duration`(ms), `color`(채움색). 완료 시 `kt-hold-confirm`(cancelable) 이벤트 + `onComplete(el)` 호출, 그리고 자동 액션 — `<a href>`는 이동, submit 버튼/`submit:true`/`data-kt-hold-submit`은 폼 제출, `action="#선택자"`는 그 요소 클릭. `submit:false`로 끄기.
- `coverReveal`: `color`·`color2`(패널 색), `direction`(right/left/up/down), `duration`, `delay`, `ease`, `layers`(1~3), `stagger`, `threshold`. 스크롤 진입 시 컬러 패널이 걷히며 노출.
- `cursor` hover: `a,button` 등에 자동 반응. `hoverEffect`(dot/ring), `hoverScale`, `hoverDotSize`, `hoverBackground`, `hoverColor`, `mixBlendMode`(difference로 반전 커서), `hoverSelector`로 대상 지정.
- `accordion`: `single`, `duration`, `blur`, `arrowPosition`(right/left). 화살표는 CSS 변수 `--kt-accordion-arrow`, `--kt-accordion-arrow-size`, `--kt-accordion-arrow-weight`, `--kt-accordion-arrow-duration`로, 또는 `.kt-accordion-summary::after` 재정의로 커스텀.
- `megaMenu`: `trigger`(hover/click), `layout`(dropdown/mega), `indicator`(none/chevron/plus), `openDelay`, `closeDelay`, `duration`. 항목별로 `<li data-kt-menu-trigger="click">`로 트리거 혼용, `<li class="kt-menu-mega">`로 개별 항목만 풀폭 메가로, `<li data-kt-menu-open="#선택자">`로 특정 영역 hover 시 열기. 패널 링크는 기본 스타일 제공(색은 `--kt-menu-accent`, `--kt-menu-hover-bg`).
- `radial`: `position`(bottom/top/left/right 도킹), `radius`, `step`(항목 간 각도), `activeAngle`(초점 각도), `duration`, `loop`, `drag`, `controls`, `autoplay`. 항목은 `.kt-radial-item`. 컨테이너 높이/썸네일 스타일은 호스트가 지정.
- `lightbox`: 이미지 전환 효과 `transition`(rise/fade/crossfade/dissolve/slide/zoom/none). **썸네일↔원본 분리**: 페이지엔 `<img src="썸네일">`, 열 때 원본은 `data-kt-src="원본"`(= `opts.src`)로 지정. `share`(공유)·`download`(다운로드) 버튼, `thumbnails:true`면 그룹 이미지의 **필름스트립**(하단 썸네일 열, 클릭 이동·활성 강조)을 뷰어 안에 표시.
- `gesture`: `hoverScale`, `tapScale`, `lift`(px), `duration`, `ease`. 버튼·카드에 붙이면 hover/press 스프링 피드백. reduced-motion 자동 무효화.
- `drag`: `axis`(both/x/y), `bounds`("parent"면 부모 안으로 제약), `snapBack`(놓으면 원위치 복귀), `inertia`(관성), `handle`(드래그 손잡이 선택자). 포커스+화살표 키로도 이동.
- `tooltip`: `content`(없으면 data-kt-title/title/aria-label 사용), `placement`(top/bottom/left/right, 자동 플립), `trigger`(hover/focus/click/manual), `delay`·`hideDelay`, `offset`, `duration`, `interactive`(툴팁 위 마우스 유지). role=tooltip + aria-describedby, Esc 닫힘. 색은 `--kt-tooltip-*`.
- `progress` headless API: `onUpdate(value 0~1, el)` 콜백이 매 프레임 호출됨. `property`에 CSS 변수(예: `--read`)를 주면 진행값을 그 변수로 흘려줘서 bar/ring 대신 원하는 형태를 CSS로 직접 그릴 수 있음. `bottomSheet`/`toast`/`tooltip` 색은 CSS 변수로 커스텀, bottomSheet는 `light-dark()`로 OS 라이트/다크 자동 대응(--kt-sheet-bg로 override).
- `toast`: `type`(info/success/warning/error/none), `position`, `duration`(기본 10초·최대 30초), `dismissible`, `message`, `icon`(글리프/커스텀 SVG), `progressBar`(none/bar/ring/**fill** — fill은 박스 전체가 차오름), `barColor`. 색은 `--kt-toast-bg/-fg/-accent`.
- `bottomSheet`: `backdrop`, `backdropOpacity`, `handle`, `dismissible`, `duration`. 트리거는 `data-kt-sheet-trigger="#시트id"`.
- `tabs`: `activation`(automatic/manual), `orientation`(horizontal/vertical), `effect`(패널 전환 fade/slide/blur/cross/none), `indicatorMotion`(탭 마커 자체 이동 slide/none/fade — `effect`와 별개), `indicator`, `onChange`. 세그먼트형은 `.kt-tabs--segment`(활성 pill, 가로/세로 모두 지원, 활성 bold로 인한 리플로우 없음). 색은 `--kt-tab-accent`, 세그먼트 pill은 `--kt-seg-active`.
- `flip`: `data-kt-flip`. 자식이 재정렬·추가·삭제되면 옛→새 위치로 자동 애니메이션(Motion layout 대응). `duration`, `ease`, `stagger`, `item`, `watch`. API `record()`/`play()`.
- `scrollShadows`: `data-kt-scroll-shadows`. `axis`(vertical/horizontal), `size`, `color`(컨테이너 배경색과 맞춤), `shadow`. 순수 CSS 그라디언트(스크롤 시 JS 없음).
- `stickyHeader`: `data-kt-sticky-header`. `offset`(고정 판정 px), `distance`(진행률 px), `shrink`, `shadow`, `activeClass`, `onChange`. `--kt-header-progress`(0→1) 변수 노출 — 커스텀 스크럽에 사용.
- `horizontalScroll`: `data-kt-horizontal-scroll`. 내부 트랙(첫 자식들)이 세로 스크롤에 맞춰 가로 이동. `height`(스테이지 높이, 기본 100vh), `smooth`(관성). GSAP 불필요.
- `confetti`: `once:true`면 최초 1회만, 기본은 클릭마다.
- `textTransition`: `charDirection`(ltr/rtl/random)로 글자 등장 방향.
- `brushReveal`: 복권긁기용 `hold:true`(누른 채 드래그), `threshold`(0~1) 도달 시 `onReveal`+`kt-brush-reveal` 이벤트, `onProgress`+`kt-brush-progress` 실시간, API `progress()`.
- **스프링 전역**: `Kineto.config({ spring: true })` 한 줄로 `reveal` 진입·`gesture` 피드백이 오버슈트 스프링 이징을 기본 사용(요소별 `spring`/`ease`로 개별 override).
- `scrollShadows`: `mode`(shadow/mask — mask는 콘텐츠가 가장자리에서 디졸브), `shape`(radial/linear), `opacity`, `size`, `axis`. 그림자색은 `--kt-scroll-shadow` 변수로도.
- `marquee`: `fade`(px) 엣지 그라디언트 마스크로 양끝 자연스럽게 사라짐.
- `slider`: `wheel:true`면 마우스 휠로 이동(한 번에 한 장, throttle). `axis:"y"`로 세로.
- `tooltip`: `effect`(fade/scale/shift/none) 노출/사라짐 효과. 색·모양은 `--kt-tooltip-*` 변수.
- `radial`: `align:"center"`로 활성 항목을 컨테이너 정중앙에. 좌/우/아래 dock 모두 대응.
- `confetti`: `once:true`면 최초 1회만.
- `textTransition`: `charDirection`(ltr/rtl/random).
- `brushReveal`: `hold:true`(누른 채 드래그), `threshold`(0~1) 도달 시 `onReveal`/`kt-brush-reveal` 이벤트, `onProgress` 실시간, `progress()` API.
- **접근성/축소모션**: 모든 진입 애니메이션은 `prefers-reduced-motion`에서 최종 상태로 즉시 표시(콘텐츠 보존), `hold`·`progress`는 축소모션에서도 동작 유지, `bottomSheet`/`lightbox`는 포커스 관리·접근명 제공. JS 미로딩 시 콘텐츠는 그대로 노출됩니다.

---

## 4. 설치와 초기화

### CDN (빌드 없이)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@dong-gri/kineto/dist/kineto.min.css">
<script src="https://cdn.jsdelivr.net/npm/@dong-gri/kineto/dist/kineto.umd.min.js"></script>
<script>
  Kineto.autoInit();
</script>
```

### npm (번들러)

```js
import Kineto from '@dong-gri/kineto';
import '@dong-gri/kineto/style.css';

Kineto.autoInit();
```

### iOS 풀스크린 대응 (노치·홈바)

로더·페이지 리빌·페이지 트랜지션 같은 전체화면 효과가 아이폰 노치/홈바 아래까지 이어지려면 viewport 메타에 `viewport-fit=cover`를 넣으세요. (안 넣으면 안전영역만 색이 어긋나 보입니다.)

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

---

## 5. 예시

### 스크롤 진입 + 카운터 + 이미지 로딩

```html
<section data-kt-reveal="fade-up" data-kt-stagger="0.06">
  <h2 data-kt-text-reveal="stream">이번 분기 성과</h2>
  <strong data-kt-counter="pop" data-kt-to="98760" data-kt-format=",">98,760</strong>
</section>

<img data-kt-lazy="skeleton" data-src="./cover.webp" alt="Cover">
```

### 할인 표기(특정 값 → 특정 값)

```html
<div data-kt-counter="slot" data-kt-from="34000" data-kt-to="10000"
     data-kt-format="," data-kt-prefix="₩" data-kt-loops="0">₩34,000</div>
```

### 갤러리 라이트박스

```html
<img data-kt-lightbox="viewer" data-kt-group="work" src="./1.webp" alt="">
<img data-kt-lightbox="viewer" data-kt-group="work" src="./2.webp" alt="">
```

### 동적 제어가 필요할 때만 API

```js
const loader = Kineto.loader('#loader', { type: 'bar', source: 'manual' });
loader.setProgress(42);
await loader.trackPromise(fetch('/api/data'));
```

---

## 6. 정확한 옵션을 찾는 법

- `docs/module-reference.md` — 모듈별 variant와 공개 옵션 목록(자동 생성, 항상 최신).
- `kineto.features.json` — 기계 판독용 계약: 모든 모듈·활성화 속성·variant·공개 옵션·Core API.
- 라이브 데모(<https://git.dongri.me/example/kineto>) — 각 카드에서 옵션을 바꿔 보고 HTML/JS 코드를 그대로 복사할 수 있습니다.

AI에게는 "옵션 이름을 추측하지 말고 위 두 파일을 근거로 쓰라"고 함께 지시하면 잘못된 속성명을 넣는 실수를 크게 줄일 수 있습니다.
