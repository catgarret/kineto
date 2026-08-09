# Kineto v0.8.55 — 개발·유지보수 컨텍스트

## 프로젝트 목적

Kineto는 `dongri.me`의 픽셀 모자이크 실험에서 시작한 인터랙션
라이브러리입니다. 디자이너는 옵션을 조절하고 완성된 코드를 복사할 수
있으며, 개발자는 같은 기능을 JavaScript API로 확장할 수 있습니다.

## 현재 기준

- 버전: `0.8.55`
- 공개 모듈: 51개
- Core API: 27개
- 소유자 고정 요구사항: 48개
- 라이브 플레이그라운드: 131개
- Smooth Scroll: 기본 비활성화, Lenis runtime API로 선택 사용

소스 오브 트루스:

1. 소유자의 구체적인 최신 요청
2. `kineto.requirements.json`
3. `kineto.features.json`
4. 자동 테스트와 전체 데모
5. 문서

`demo/index.html`은 소개 페이지이면서 시각 회귀 QA 표면입니다. 조절 가능한 데모는 실시간 설정, Replay, Reset, 현재 설정 기반 HTML/JavaScript와 Copy 동작을 유지합니다.

## 특히 보존해야 하는 동작

- Counter Pop은 count-up하지 않고 완성된 포맷 문자열이 큰 상태에서 자릿수별로 정착합니다.
- Circular와 Bar는 Counter가 아니라 Loader입니다.
- Skeleton은 별도 shimmer/pulse placeholder이며 Blur-up과 구조적으로 다릅니다.
- Pixelate, Print, Dissolve는 GIF·APNG·animated WebP를 첫 프레임 Canvas로 굳히지 않습니다.
- Lazy Wave와 Film Grain은 FPS·DPR 제한을 지키며, 모션 축소 환경에서는
  원본 이미지를 즉시 표시합니다.
- Progressive Print는 전체 blur+dynamic fine noise 상태에서 방향성 mask로 선명해집니다.
- Dissolve는 방향성 mask 없이 전체 blur와 dynamic noise가 제거됩니다.
- Overflow Rewind와 Page는 상하좌우 mask 방향을 지원하고, Rolling은 실시간 검색어식 항목 전환을 제공합니다.
- Card Glow는 내부 spotlight, 표면 reflection, luminous border를 독립적으로 조절합니다.
- Reveal은 상하좌우 프리셋과 class-only designer hook을 제공합니다.
- ScrollVelocity는 탄성 on/off와 stiffness/damping/mass/response를 제공합니다.
- Vertical Sticky Stack은 CSS sticky flow로 동작하고 Horizontal/Floating과 구분됩니다.
- Lightbox는 전체 viewport를 덮고 그룹 이동, 정보, zoom/pan, minimap, custom UI, Lazy 조합을 제공합니다.
- Ambient는 영상 frame sampling과 살아 있는 이미지 clone을 지원합니다.
- Loader는 manual/window/resources/promise/fetch 진행률 소스를 받습니다.
- Loader와 Loading Indicator는 진행률 이벤트·CSS 변수·출력 바인딩을
  공유하며, Indicator는 `bindProgress()`로 Loader를 구독할 수 있습니다.
- Smooth Scroll은 명시적으로 켜고 끌 수 있어야 합니다.

## 개발 규칙

- 관련 요구사항·계약·테스트를 읽기 전 소스를 수정하지 않습니다.
- 깨진 기능을 registry·데모·테스트에서 빼서 해결하지 않습니다.
- direct `destroy()`와 Core destroy 모두 DOM, inline style, ARIA, listener, timer, observer, RAF, GSAP 객체와 생성 UI를 정리해야 합니다.
- reduced-motion에서는 의미 있는 최종 상태를 표시하고 destroy 시 원래 상태를 복원합니다.
- 모듈 조합은 초기화 순서와 관계없이 동작해야 합니다. 특히 Lazy + Ambient + Lightbox를 회귀 검사합니다.
- 외부 iframe 영상은 내부 픽셀 샘플링 대신 `ambientSrc` 또는 `source`를 사용합니다.

## 검증

```bash
npm run ci
```

배포 전에는 `npm run verify`로 전체 검사와 의존성 보안 감사를 실행하고, 최종 `.tgz`를 별도 프로젝트에 설치해 ESM/CommonJS surface와 React StrictMode, Vue, jQuery 반복 mount/unmount를 검사합니다. 자동 브라우저 QA는 Chromium 기준이며 Safari/WebKit, Firefox, 실제 iOS/Android는 별도 QA 대상입니다.
