# 성능 가이드

## 자동 환경 티어

`Kineto.env`는 다음 신호를 사용합니다.

- `navigator.connection.saveData`
- 2G/slow-2g effective connection
- `navigator.deviceMemory`
- `navigator.hardwareConcurrency`
- `prefers-reduced-motion`
- touch/gyro/vibration 지원

성능 티어는 `high`, `mid`, `low`입니다.

```js
Kineto.config({ performance: 'auto' });
```

- save-data 또는 매우 느린 네트워크: `low`
- 메모리/CPU 신호가 낮음: `mid`
- 그 외: `high`

`low`에서 모듈이 `fallback()`을 제공하면 해당 구현을 사용합니다. fallback이 없는 모듈은 정상 구현을 사용할 수 있으므로, `low`가 모든 모션을 끈다는 뜻은 아닙니다.

지속적인 RAF·타이머·큰 합성 레이어를 사용하는 Ambient Media, Card Glow,
Marquee, Overflow Text, Slider, Text Transition, Typewriter는 `low`에서 정적
콘텐츠 또는 네이티브 스크롤 형태로 축소됩니다. 원본 콘텐츠와 접근 가능한
텍스트는 유지됩니다.

Reveal은 `low`에서도 선택한 방향·확대·회전·마스크·class-only 프리셋을
유지하고 native 경로로 재생합니다. 이미 GSAP·ScrollTrigger가 로드돼 있어도
해당 엔진을 호출하지 않습니다. 이 유한한 등장 모션은 `forceReducedMotion`
설정에 따른 정적 최종 상태와 구분합니다.

## 수동 설정

```js
Kineto.config({ performance: 'low' });
Kineto.config({ smooth: false });
Kineto.config({ forceReducedMotion: true });
```

지원 값은 `auto`, `high`, `mid`, `low`입니다. 과거 문서의 `off` 및 자동 FPS 강등 기능은 현재 구현되어 있지 않습니다.

## DOM 탐색 비용

`Kineto.scan(root)`는 등록된 모듈마다 DOM을 다시 검색하지 않습니다. 활성화
속성을 비-GSAP/GSAP 두 그룹으로 묶어 각 그룹을 selector traversal 한 번으로
발견한 뒤, 실제 생성 순서는 기존처럼 모듈 등록 순서를 유지합니다. GSAP을
처음 비동기로 불러오는 경우에만 로딩 중 추가된 마크업을 놓치지 않도록 GSAP
그룹을 완료 시 한 번 다시 발견합니다.
한 그룹의 발견은 생성 **전에** 찍은 스냅샷입니다. 그래서 모듈이 생성 중에 복제한 마크업(예:
Marquee가 복제한 그룹 안의 다른 모듈 활성화 속성)은 이번 `scan()`이 아니라 다음 `scan()`이나
`observe()`에서 붙습니다. 예전에는 등록 순서가 뒤인 모듈만 복제본에 붙어, 결과가 등록 순서에
따라 달랐습니다.

`Kineto.observe()`는 같은 프레임워크 커밋에서 부모와 자식이 함께 추가돼도
가장 바깥 subtree만 스캔하며, 이미 붙은 인스턴스는 옵션을 다시 파싱하지
않습니다. 따라서 모듈 수나 한 번의 DOM commit 크기가 커져도 탐색 비용이
불필요하게 곱해지지 않습니다.

## 탭 가시성과 화면 밖 — 시스템 일시정지

규칙은 하나입니다: **탭이 숨었거나 요소가 화면 밖이면 인스턴스는 일시정지**합니다.
코어는 이 판단을 한 곳(`src/core.js`의 `syncSuspension`)에서만 하고, 페이지가 직접 부른
`pause()`와 따로 관리합니다. 그래서 둘은 서로를 덮어쓰지 않습니다 — 페이지가 멈춘
인스턴스는 화면에 들어와도 멈춰 있고, 화면 밖에서 부른 `resume()`은 요소가 돌아올 때
실행됩니다.

- 탭이 숨겨지면 모든 인스턴스가, 요소가 화면 밖으로 나가면 **참여한 모듈**만 멈춥니다.
  모듈 정의에 `offscreen: 'pause'`(또는 옵션을 받아 `'pause'`/`null`을 돌려주는 함수)를
  두면 IntersectionObserver 하나가 지켜봅니다(`rootMargin` 25%라 스크롤해 들어오기 전에
  다시 시작합니다). 현재 Marquee·Mouse Parallax·Scroll Velocity·Loading Indicator·
  Card Glow·Glitch·Overflow Text·Stylize·Text Transition·Typewriter·Canvas Effect가 참여합니다.
- 화면 밖 요소에는 `data-kt-offscreen`이 붙고, `kineto.css`가 그 안의 **Kineto 자신의**
  CSS 키프레임(`[class*="kt-"]`)을 멈춥니다. 페이지의 애니메이션은 건드리지 않습니다.
  이 속성은 코어의 상태라서 `Kineto.observe()`가 다시 탐색하지 않습니다.
- 기본 경로는 모듈의 `pause()`/`resume()`입니다. `pause()`가 **공개 상태**인 모듈
  (Loading Indicator는 `paused`를 페이지에 알립니다)은 `suspend(on)`을 구현합니다.
  그러면 코어는 규칙이 바뀔 때마다 `pause()` 대신 이것을 부르고, 페이지의 pause·resume은
  곧바로 모듈로 갑니다. `suspend`는 일만 멈추고 페이지가 보는 상태는 바꾸지 않습니다.

### 새 모듈을 쓸 때

- **따라잡은 루프는 쉬게 하세요.** 목표에 도달하면 다음 프레임을 요청하지 말고, 입력이
  `wake()`로 깨우게 합니다. `pause()`에서 프레임을 취소할 때는 `rafId = null`까지 해야
  합니다 — id가 남으면 `wake()`가 루프가 이미 있다고 믿고 다시 시작하지 않습니다.
- **`create()` 안에서 쓰고 읽지 마세요.** DOM을 쓴 뒤 크기를 읽으면 그 자리에서 레이아웃이
  강제되고, 페이지가 인스턴스를 수백 개 만들면 수백 번이 됩니다. `measureThenApply(read,
  apply)`(`src/utils.js`)는 다음 프레임에 모든 read를 먼저, 그다음 모든 apply를 실행합니다.
  반환값(취소 함수)은 `destroy()`에서 부르세요. Overflow Text가 이렇게 바뀌어 150개 생성의
  강제 레이아웃이 200번에서 1번이 되었습니다.
- **ResizeObserver 콜백에서는 관찰 결과를 쓰세요.** 콜백은 레이아웃 뒤에 오므로 읽어도
  싸지만, 앞선 콜백이 DOM을 바꿨다면 다시 강제됩니다. 필요한 값이 `contentRect`이면 그것을
  쓰고, padding box가 필요하면(`clientWidth`) 콜백 안에서만 읽습니다.

마지막 인스턴스가 제거되면 코어의 `visibilitychange`, `prefers-reduced-motion`,
Network Information 감시기도 해제됩니다. 이후 새 인스턴스가 만들어지면 다시
설치되므로 SPA의 반복 mount/unmount에서 전역 리스너가 남지 않습니다.

## 외부 애니메이션 엔진

GSAP·ScrollTrigger·Lenis는 필요한 경우에만 비동기로 요청합니다. 기본 CDN
주소는 재현 가능한 캐시와 갑작스러운 상위 버전 변경 방지를 위해 정확한
버전으로 고정되어 있습니다. 요청은 12초 후 중단되어 정적 폴백 또는 네이티브
스크롤로 계속 진행하며, 실패한 요청은 이후 재시도하거나 self-host 주소로
교체할 수 있습니다.

```js
Kineto.setEngineSource({
  gsap: '/vendor/gsap.min.js',
  scrollTrigger: '/vendor/ScrollTrigger.min.js',
  lenis: '/vendor/lenis.min.js',
  gsapIntegrity: 'sha384-...',
  scrollTriggerIntegrity: 'sha384-...',
  lenisIntegrity: 'sha384-...'
});
```

기본 CDN 엔진에는 SHA-384 SRI가 적용됩니다. 엔진 URL을 교체할 때는 해당
파일의 integrity 값도 함께 교체하거나 동일 출처에 직접 호스팅하세요.

## Canvas 모듈

### lazy pixelate

- 표시 크기에 맞춰 canvas를 만들고 DPR은 `maxDpr`로 제한합니다.
- 작은 offscreen canvas를 nearest-neighbor로 확대합니다.
- 동일 출처 또는 올바른 CORS 이미지가 필요합니다.
- 실패하면 일반 이미지 reveal로 폴백합니다.

### scrollSequence

- `urls` 또는 `urlPrefix`를 반드시 명시해야 하며, 값이 없으면 외부 placeholder를 요청하지 않습니다.
- 전체 프레임을 한 번에 강제 로드하지 않고 현재 프레임 주변을 preload합니다.
- 프레임 수와 이미지 해상도가 메모리 사용량을 결정합니다.
- 모바일에서는 프레임 수, DPR, preloadRadius를 보수적으로 설정합니다.

## 권장 설정

- 패럴럭스/velocity 효과는 페이지의 핵심 구간에만 사용합니다.
- large image는 AVIF/WebP, `srcset`, `sizes`로 먼저 최적화합니다.
- slider autoplay는 화면 밖 또는 문서 hidden 상태에서 불필요한 작업이 없도록 lifecycle을 유지합니다.
- SPA 전환 전에 route container의 `Kineto.destroy(container)`를 호출하거나 pageTransition의 내장 정리를 사용합니다.
- 레이아웃 변경 후 `Kineto.refresh()`를 호출합니다.

## 번들 측정

번들 크기는 의존성 버전과 minifier에 따라 달라지므로 README에 고정된 홍보 수치를 두지 않습니다. 현재 결과는 빌드 명령에서 직접 확인합니다.

```bash
npm run build
```

ESM과 UMD 모두 GSAP·ScrollTrigger·Lenis 본체를 포함하지 않습니다.
필요한 외부 엔진은 runtime loader로 요청하거나 애플리케이션에서 주입합니다.
엔진을 요청하지 않는 native 경로와, 별도 네트워크로 내려받는 엔진 비용은
Kineto 번들 크기와 구분해야 합니다. 이 경계는 `npm run test:deps`로 검사합니다.

## 반복 작업 비용

- `Kineto.observe()`는 같은 변경 묶음에 포함된 부모와 자식을 중복 탐색하지
  않습니다. 연결된 최상위 추가 요소만 탐색하며, `disconnect()`는 이미 예약한
  탐색도 취소합니다. 관찰 영역 밖으로 이동한 요소는 새로 초기화하지 않습니다.
- `scan()`은 기존 인스턴스의 옵션을 다시 파싱하지 않습니다. 옵션을 바꾸려면
  기존과 같이 `updateModule()` 또는 `replay()`를 사용하세요.
- Scroll Velocity는 위치·목표·탄성 속도가 모두 안정되면 RAF를 중지합니다.
  새로운 스크롤 입력에서 재개하며, `onUpdate`는 실제 처리 프레임에만 호출됩니다.
  Cursor(팔로워·체인·스네이크)·Mouse Parallax·나침반·Marquee의 스크롤 기울기도 같습니다.
- `npm run test:browser`의 `idle-cost.mjs`는 아무 입력이 없는 페이지에서 Kineto의 rAF가
  초당 3개 미만인지, 입력이 깨우고 다시 쉬는지, 화면 밖 일시정지와 페이지의 pause가
  서로를 덮어쓰지 않는지 확인합니다. `create-cost.mjs`는 인스턴스 150개를 한꺼번에 만들 때
  강제 레이아웃 수를 크로미엄 트레이스로 셉니다.
- Stylize 디더링은 샘플 `ImageData`를 출력에도 사용합니다. 오차 확산은 전체
  격자가 아닌 Floyd–Steinberg 2행·Atkinson 3행만 보관하고 같은 폭에서 재사용합니다.
  ASCII·단색 Halftone은 셀마다 같은 색을 다시 설정하지 않습니다.

`npm run test:perf`는 시간 제한 대신 탐색·예약·메모리 할당 횟수를 검사하고,
디더링 1,080회(렌즈 포함 1,188개 출력)의 픽셀 해시를 최적화 전과 비교합니다.
실행 시간과 실제 프레임률은 브라우저·하드웨어·이미지 크기에 따라 별도 측정해야 합니다.

구현 참고: [MDN Canvas 최적화](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas),
[MutationObserver disconnect](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/disconnect).

측정 조건·변경 전후 수치·남은 검증 범위는 [2026-09-24 성능 점검](performance-audit-2026-09-24.md)에 기록했습니다.
