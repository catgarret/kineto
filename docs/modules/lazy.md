# lazy

이미지를 뷰포트 근처에서 로드하고 이미지 로딩에 맞는 방식으로 노출합니다. 콘텐츠가 상하좌우로 들어오거나 mask로 열리는 효과는 [Reveal](reveal.md)입니다.

## 공개 효과

| 효과 | 동작 |
|---|---|
| `fade` | 단순 opacity fade |
| `blur-up` | 이미지 blur와 scale 제거 |
| `wave` | 가로 조각의 물결 왜곡과 선택적 grain 제거 |
| `grain` | 동적 필름 입자를 걷어 원본 복원 |
| `skeleton` | 별도 shimmer 또는 pulse placeholder |
| `pixelate` | 살아 있는 이미지의 단계별 pixel scale 정착 |
| `print` | 전체 blur+동적 fine noise에서 방향성 sharp mask 진행 |
| `dissolve` | 방향성 없이 전체 dynamic noise와 blur 제거 |
| `flicker` | 수평 슬라이스 점멸 정착 |
| `polaroid` | blur/contrast/sepia/rotation 정착 |
| `crt` | CRT 전원 켜짐과 주사선 정착 |
| `data-mosaic` | 크기가 다른 데이터 타일 제거 |
| `rgb-slice-burst` | 짧은 RGB 슬라이스 버스트 후 정착 |
| `dither` | 2~8단계 팔레트 디더링(Bayer·random·오차 확산) 셀이 잘게 쪼개지며 원본으로 이어짐 |
| `ascii` | 밝기를 문자 밀도로 바꾼 텍스트 아트가 원본으로 이어짐 |
| `halftone` | 망점(점·사각·선) 크기로 밝기를 표현한 인쇄 질감이 원본으로 이어짐 |

`zoom`과 `noise`는 기존 사용자를 위해 각각 `blur-up`, `dissolve`로
연결되는 호환 별칭입니다. `dither`, `ascii`, `halftone`은 `<img>`와
`<video>` 모두에 적용되며 `persist`로 리빌 대신 영구 스타일 필터가 됩니다.

## Wave와 Film Grain

```html
<img
  data-kt-lazy="wave"
  data-src="./photo.webp"
  data-kt-wave-amplitude="24"
  data-kt-wave-frequency="0.035"
  data-kt-wave-speed="0.012"
  data-kt-wave-slice-height="2"
  data-kt-grain="0.14"
  alt="Wave reveal"
>
```

`wave`는 이미지 로드가 끝난 뒤 가로 조각을 실시간으로 다시 그리며
왜곡을 줄입니다. `grain`은 독립 효과로 사용할 수도 있고 `wave` 위에
겹칠 수도 있습니다. `renderFps`, `maxDpr`, `noiseWidth`,
`noiseHeight`, `noiseFps`, `noiseContrast`, `noiseBlend`로 작업량과
질감을 조절합니다. 저사양·모션 축소 환경에서는 원본 이미지를 즉시
표시합니다.

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

## Dither · ASCII · Halftone (스타일화 미디어)

```html
<!-- 2색 디더링 리빌: 셀이 잘게 쪼개진 뒤 원본으로 크로스페이드 -->
<img
  data-kt-lazy="dither"
  data-src="./photo.webp"
  data-kt-cell-size="8"
  data-kt-dither-type="4x4"
  data-kt-paper-color="#f1ede2"
  data-kt-ink-color="#ff4a1c"
  alt="Dither reveal"
>

<!-- 원본 색을 3단계로 살리는 오차 확산 디더링 -->
<img
  data-kt-lazy="dither"
  data-src="./photo.webp"
  data-kt-dither-type="floyd-steinberg"
  data-kt-original-colors
  data-kt-color-steps="3"
  alt="Color dither"
>

<!-- 리빌 없이 계속 문자로 그리는 ASCII 필터 -->
<img data-kt-lazy="ascii" data-src="./photo.webp" data-kt-persist data-kt-cell-size="10" alt="ASCII art">

<!-- 재생 중인 영상을 매 프레임 망점으로 그리는 필터 -->
<video data-kt-lazy="halftone" data-src="./clip.mp4" data-kt-persist data-kt-halftone-shape="dot" muted loop playsinline></video>
```

세 효과는 `src/modules/lazy/stylizedMedia.js`의 canvas rasterizer를 공유합니다.
원본 미디어는 canvas 아래에 그대로 남아 있으므로, CORS 없이 다른 origin에서
불러온 이미지처럼 canvas가 픽셀을 읽을 수 없는 경우에도 그림은 보입니다(효과만
생략). 리빌은 `duration`의 앞 70%에서 셀을 `cellSize`부터 효과별 최소 셀까지
줄이고 나머지 30%에서 원본으로 크로스페이드합니다.

| option | 기본값 | 설명 |
|---|---|---|
| `persist` | `false` | `true`면 리빌 없이 스타일을 유지합니다. GIF·APNG·animated WebP·`<video>`는 계속 다시 그립니다. |
| `cellSize` | dither 6 · ascii 12 · halftone 8 | 시작 셀 크기(px). 2~64. 값을 생략했을 때만 효과별 기본값이 적용되며, 설정창의 안내 기본값은 dither 기준(6)입니다. |
| `ditherType` | `8x8` | `8x8`·`4x4`·`2x2`(Bayer), `random`(seed 고정), `floyd-steinberg`·`atkinson`(오차 확산). |
| `halftoneShape` | `dot` | `dot`·`square`·`line`. |
| `asciiChars` | `@%#*+=-:. ` | 어두운 곳부터 밝은 곳까지의 문자 ramp. 2자 이상. |
| `asciiFont` | 시스템 monospace | canvas 폰트 family. |
| `paperColor` / `inkColor` | `#f4f1ea` / `#111111` | 밝은 부분(종이)과 어두운 부분(잉크) 색. |
| `accentColor` | 없음 | 지정하면 중간 톤을 채우는 세 번째 색이 됩니다. |
| `originalColors` | `false` | `true`면 팔레트 대신 원본 색을 `colorSteps` 단계로 양자화합니다. |
| `colorSteps` | dither 2 · 그 외 4 | 팔레트 단계 수. 2~8. `originalColors`가 꺼진 `ascii`·`halftone`에서는 사용하지 않습니다. |
| `inverted` | `false` | 종이와 잉크를 맞바꿉니다. |
| `renderFps` | 리빌 30 · persist/video 24 | canvas 재그리기 상한. `performance: 'low'`에서는 12로 제한됩니다. |
| `maxDpr` | 이미지 2 · 영상 1.5 | canvas 해상도 상한. |

`<video>`에서는 일반 lazy video reveal(로드·자동 재생)이 먼저 동작하고, 그 위에서
재생 프레임을 다시 그립니다. `pause()`는 프레임을 멈추고 `resume()`은 이어서
그립니다. `destroy()`는 canvas layer, RAF, ResizeObserver를 정리하고 원래 style을
복원합니다.

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
