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
scrollVelocity(data-kt-scroll-velocity), shuffle(data-kt-shuffle), slider(data-kt-slider),
stickyStack(data-kt-sticky-stack), textFill(data-kt-text-fill), textReveal(data-kt-text-reveal),
textSplit(data-kt-text-split), textTransition(data-kt-text-transition), tilt(data-kt-tilt),
typewriter(data-kt-typewriter), vibrate(data-kt-vibrate)
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
scrollVelocity(data-kt-scroll-velocity), shuffle(data-kt-shuffle), slider(data-kt-slider),
stickyStack(data-kt-sticky-stack), textFill(data-kt-text-fill), textReveal(data-kt-text-reveal),
textSplit(data-kt-text-split), textTransition(data-kt-text-transition), tilt(data-kt-tilt),
typewriter(data-kt-typewriter), vibrate(data-kt-vibrate)
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
| 문자 셔플 디코드 | `shuffle` (`data-kt-shuffle`) |
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
