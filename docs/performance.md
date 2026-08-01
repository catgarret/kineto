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

## 수동 설정

```js
Kineto.config({ performance: 'low' });
Kineto.config({ smooth: false });
Kineto.config({ forceReducedMotion: true });
```

지원 값은 `auto`, `high`, `mid`, `low`입니다. 과거 문서의 `off` 및 자동 FPS 강등 기능은 현재 구현되어 있지 않습니다.

## 탭 가시성

탭이 숨겨지면 코어는 활성 인스턴스의 `pause()`를 호출하고, 다시 보이면 `resume()`을 호출합니다. 모듈은 자신이 소유한 RAF, tween, timer의 의미에 맞춰 대응합니다.

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
  lenis: '/vendor/lenis.min.js'
});
```

## Canvas 모듈

### lazy pixelate

- 표시 크기에 맞춰 canvas를 만들고 DPR은 `maxDpr`로 제한합니다.
- 작은 offscreen canvas를 nearest-neighbor로 확대합니다.
- 동일 출처 또는 올바른 CORS 이미지가 필요합니다.
- 실패하면 일반 이미지 reveal로 폴백합니다.

### scrollSequence

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

ESM은 GSAP/Lenis를 external로 두고, UMD는 브라우저 단독 사용을 위해 포함하므로 UMD가 더 큽니다.
