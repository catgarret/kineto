# stylize

이미지와 영상에 dither · ASCII · halftone 질감을 입히는 canvas 필터입니다.
원본 위에 canvas 레이어를 덮어 매 프레임 다시 그리며, 로딩과는 아무 관계가
없습니다. 이미지를 지연 로딩하면서 전환 효과를 주는 것은 [Lazy](lazy.md)입니다.

> v0.11.0에서 Lazy의 `dither` · `ascii` · `halftone` variant가 이 모듈로
> 분리되었습니다. `data-kt-lazy="dither"` 같은 기존 속성은 한 minor 동안
> 계속 동작합니다 — [이전 방법](../diagnostics-and-deprecation.md).

## 공개 효과

| 효과 | 동작 |
|---|---|
| `dither` | 2~8단계 팔레트 디더링. Bayer 8×8·4×4·2×2 정렬 격자, seed 고정 random 임계값, Floyd–Steinberg·Atkinson 오차 확산 |
| `ascii` | 셀 밝기를 글리프 밀도 ramp로 바꿔 문자를 그리는 텍스트 아트 |
| `halftone` | 셀 밝기를 점·사각·선의 크기로 바꾸는 인쇄 망점 |

```html
<img data-kt-stylize="halftone" data-kt-cell-size="7" src="photo.webp" alt="…">
<video data-kt-stylize="ascii" src="clip.mp4" muted loop playsinline autoplay></video>
<img data-kt-stylize="dither" data-kt-mode="reveal" data-kt-trigger="view" src="photo.webp" alt="…">
```

## 유지(persist)와 리빌(reveal)

`mode`는 이 모듈에서 가장 중요한 선택입니다.

- `persist`(기본값) — 질감을 계속 유지합니다. 정지 이미지는 크기가 바뀔 때
  다시 그리고, GIF·APNG·애니메이션 WebP와 `<video>`는 프레임마다 다시 그립니다.
- `reveal` — 질감을 한 번 재생합니다. 셀이 점점 잘게 쪼개지다가 마지막 30%
  구간에서 원본으로 크로스페이드한 뒤, 레이어를 지우고 `onComplete`를 부릅니다.

`reveal`일 때만 `trigger`가 의미를 가집니다. `load`는 이미지가 준비되는 즉시,
`view`는 화면에 들어올 때(`threshold`·`rootMargin`), `manual`은 인스턴스의
`replay()`를 부를 때 시작합니다.

```js
const stylized = Kineto.stylize('#hero', { effect: 'dither', mode: 'reveal', trigger: 'manual' });
stylized.replay();
```

## 색

`paperColor`와 `inkColor`는 밝은 부분과 어두운 부분에 칠할 두 색이고,
`accentColor`를 주면 중간 톤에 쓰이는 세 번째 색이 됩니다. `originalColors`를
켜면 팔레트 대신 이미지 자신의 색을 `colorSteps` 단계로 포스터라이즈해 쓰고,
`inverted`는 밝기를 뒤집습니다.

## 성능

`cellSize`가 작을수록 셀 수가 제곱으로 늘어납니다. `renderFps`는 초당 다시
그리는 횟수의 상한, `maxDpr`은 그릴 때 쓰는 픽셀 밀도의 상한입니다.
`Kineto.performance === 'low'`인 기기에서는 두 값이 자동으로 더 낮아집니다.
큰 영상에 작은 셀을 쓰는 조합은 실제 기기에서 먼저 측정하세요.

## 접근성과 안전한 실패

- 원본 요소는 숨기지 않습니다. canvas가 픽셀을 읽을 수 없는 소스(CORS 헤더가
  없는 다른 origin의 이미지)는 질감 없이 원본 그대로 보입니다.
- canvas 레이어는 `aria-hidden`이므로 `alt` 텍스트와 자막은 그대로 남습니다.
- `prefers-reduced-motion`에서 `persist`는 그대로 적용됩니다(질감 자체는
  움직임이 아니며, 움직이는 소스는 질감과 무관하게 움직입니다). `reveal`은
  재생하지 않고 건드리지 않은 원본을 보여 줍니다.

## Lazy와 함께 쓰기

두 모듈을 한 요소에 붙일 수 있습니다. Lazy가 만든 wrapper를 Stylize가
재사용하므로 레이어가 겹치지 않습니다.

```html
<img data-kt-lazy="fade" data-kt-stylize="halftone" data-src="photo.webp" alt="…">
```

## 옵션

전체 목록과 기본값은 [module-reference.md](../module-reference.md#stylize)에
있습니다. 공통 옵션은 [common-options.md](../common-options.md)를 참고하세요.
