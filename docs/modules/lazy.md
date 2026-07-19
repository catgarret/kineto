# lazy

이미지를 뷰포트 근처에서 로드하고 이미지 로딩에 맞는 방식으로 노출합니다. 콘텐츠가 상하좌우로 들어오거나 mask로 열리는 효과는 [Reveal](reveal.md)입니다.

## 공개 효과 8개

| 효과 | 동작 |
|---|---|
| `fade` | 단순 opacity fade |
| `blur-up` | 이미지 blur와 scale 제거 |
| `skeleton` | 별도 shimmer 또는 pulse placeholder |
| `pixelate` | 살아 있는 이미지의 단계별 pixel scale 정착 |
| `print` | 전체 blur+동적 fine noise에서 방향성 sharp mask 진행 |
| `dissolve` | 방향성 없이 전체 dynamic noise와 blur 제거 |
| `polaroid` | blur/contrast/sepia/rotation 정착 |
| `zoom` | 확대·blur 상태에서 정착 |

## Skeleton

```html
<img
  data-kt-lazy="skeleton"
  data-src="./photo.webp"
  data-kt-skeleton-variant="shimmer"
  data-kt-skeleton-speed="1.4"
  data-kt-skeleton-color="#222"
  data-kt-skeleton-highlight="rgba(255,255,255,.25)"
  alt="Skeleton loading"
>
```

`skeletonVariant`는 `shimmer`와 `pulse`를 지원합니다. Placeholder는 이미지 blur와 다른 DOM layer이며 로드 완료 후 제거됩니다.

## Pixelate

```html
<img
  data-kt-lazy="pixelate"
  data-src="./motion-demo.gif"
  data-kt-steps="[0.02,0.05,0.12,0.28,0.56,1]"
  data-kt-delay="100"
  data-kt-step-duration="220"
  data-kt-hold-duration="120"
  data-kt-animated="true"
  alt="Pixel reveal"
>
```

`steps` 대신 `pixelStart`, `pixelEnd`, `pixelStepCount`로 단계를 만들 수 있습니다. GIF·APNG·animated WebP는 정지 Canvas에 그리지 않고 원본 `<img>`의 재생을 유지합니다.

## Progressive Print

```html
<img
  data-kt-lazy="print"
  data-src="./generated.png"
  data-kt-direction="down"
  data-kt-duration="2.4"
  data-kt-feather="72"
  data-kt-noise="0.24"
  data-kt-noise-fps="18"
  data-kt-blur="18"
  alt="Progressive print"
>
```

전체 이미지가 blur+계속 바뀌는 fine noise 상태로 존재하고 `direction` 방향으로 sharp 영역이 진행합니다. 네모 모자이크, 반복 정적 노이즈 패턴, 네온 scan line을 만들지 않습니다.

## Dissolve

```html
<img
  data-kt-lazy="dissolve"
  data-src="./photo.jpg"
  data-kt-duration="1.8"
  data-kt-blur="18"
  data-kt-noise="0.3"
  data-kt-noise-fps="20"
  alt="Noise dissolve"
>
```

`dissolve`는 방향성 wipe가 아닙니다. 전체 영역의 dynamic fine noise와 blur가 같은 시간축에서 감소해 원본이 선명해집니다.

## 애니메이션 미디어 조합

```html
<img
  data-kt-lazy="dissolve"
  data-kt-ambient-media="image-clone"
  data-kt-lightbox="viewer"
  data-src="./motion-demo.webp"
  data-kt-animated="true"
  alt="Animated WebP"
>
```

Lazy, Ambient, Lightbox 모두 live media element를 사용하므로 애니메이션이 첫 프레임으로 정지하지 않습니다.

정확한 option allowlist는 [자동 생성 reference](../module-reference.md#lazy)를 기준으로 합니다. `destroy()`는 observer, RAF, timer, noise/mask/skeleton layer와 wrapper를 정리하고 원래 이미지 속성과 style을 복원합니다.
