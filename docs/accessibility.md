# 접근성 가이드

Kineto은 모션을 추가하지만 콘텐츠의 의미와 기본 조작을 대체하지 않는 것을 원칙으로 합니다.

## Reduced motion

기본값으로 OS의 `prefers-reduced-motion: reduce`를 존중합니다.

```js
Kineto.config({
  respectReducedMotion: true,
  forceReducedMotion: false
});
```

테스트에서는 `forceReducedMotion: true`로 정적 폴백을 강제할 수 있습니다. 모듈별 폴백은 최종 값 표시, transform 제거, 첫 이미지/첫 문자열 표시, 또는 환경상 비활성화입니다.

## 텍스트 분할

`textSplit`, `blurText`, `textFill`, 일부 `textReveal` 모드는 원문을 `aria-label`에 보존하고 시각용 span을 `aria-hidden` 처리합니다. 적용 후 실제 스크린리더 확인이 필요합니다.

## Counter

counter는 최종 값을 `aria-label`로 제공하고 동적 값을 `aria-live="polite"`로 알립니다. 숫자가 지나치게 자주 갱신되는 UI에서는 제품 맥락에 따라 live 영역을 별도로 설계하는 편이 나을 수 있습니다.

## Slider

slider는 wrapper에 carousel 역할과 label을 제공하고 키보드 방향키를 지원합니다. 보이지 않는 슬라이드의 interactive descendant tabindex를 관리합니다. 실제 페이지에서는 명확한 이전/다음 버튼과 현재 위치 텍스트를 함께 제공하는 것을 권장합니다.

## Lightbox

native `<dialog>`를 사용하고 Escape, 좌우 화살표, 닫기 backdrop을 지원합니다. 원본 이미지의 `alt`가 확대 이미지로 전달됩니다.

## Pointer-only modules

`cursor`, `magnetic`, `tilt`, `mouseParallax`는 핵심 기능이나 링크 의미를 대신하면 안 됩니다. 버튼과 링크는 본래 HTML 요소를 유지해야 합니다.

```html
<a href="/contact" data-kt-magnetic>Contact</a>
```

## Touch and unsupported APIs

- hover가 없는 장치에서는 custom cursor가 비활성화될 수 있습니다.
- Vibration API가 없거나 권한이 제한되면 vibrate는 동작하지 않습니다.
- 모션이 비활성화되어도 콘텐츠와 기본 클릭/스크롤은 사용 가능해야 합니다.

## 배포 전 체크

- OS 동작 줄이기 설정에서 콘텐츠가 모두 보이는가
- 키보드만으로 링크, 버튼, slider, dialog를 사용할 수 있는가
- VoiceOver/NVDA에서 분할 텍스트가 한 번만 자연스럽게 읽히는가
- focus indicator가 시각 효과에 가려지지 않는가
- 이미지 alt, 색 대비, landmark 구조가 제품 기준을 충족하는가
