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
| `dither` | 2~8단계 팔레트 디더링. 아래 `ditherType` 9종 |
| `ascii` | 셀 밝기를 글리프 밀도 ramp로 바꿔 문자를 그리는 텍스트 아트 |
| `halftone` | 셀 밝기를 도형 크기로 바꾸는 인쇄 망점. 도형 7종과 스크린 각도 |

### 디더 패턴 (`ditherType`)

| 값 | 패턴 | 언제 |
|---|---|---|
| `8x8`(기본)·`4x4`·`2x2`·`16x16` | 정렬(Bayer) 격자. 클수록 톤 단계가 많고 격자가 덜 보입니다 | 그래픽한 2색 질감 |
| `cluster` | 점이 셀 가운데에서 한 덩어리로 자라는 인쇄 스크린 | 신문·리소 느낌. 셀을 작게(1~3px) |
| `noise` | 반복되는 타일이 없는 임계값 필드 | **사진**. 격자가 무늬 대신 질감으로 보입니다 |
| `random` | 셀마다 seed 고정 무작위 임계값 | 거친 노이즈 |
| `floyd-steinberg`·`atkinson` | 오차 확산 | 계조가 부드러운 사진, 원본 색 유지 |

> 사진이 "엉성해 보인다"면 대개 패턴이 아니라 **격자가 눈에 먼저 보이는 것**입니다.
> `noise`로 바꾸고 `cellSize`를 2~3으로 내리면 같은 사진이 인화지처럼 보입니다.

### 망점 도형과 각도 (`halftoneShape` · `halftoneAngle`)

도형은 `dot`(기본)·`square`·`line`·`cross`·`diamond`·`ring`·`triangle`이고, 잉크가
많을수록 크게 그립니다(면적이 잉크 양에 비례하도록 반지름은 √ink).

`halftoneAngle`(0~90도, 기본 0)은 **망점 격자 자체를 기울입니다.** 실제 인쇄가 판을
기울이는 이유와 같습니다 — 0도 격자는 표처럼 읽히고, 15~45도로 기울이면 격자가 눈에
덜 띄어 인쇄물에 가까워집니다. 각도를 줘도 단위 면적당 망점 수는 같습니다.

```html
<img data-kt-stylize="halftone" data-kt-halftone-shape="dot" data-kt-halftone-angle="45"
     data-kt-cell-size="6" src="photo.webp" alt="…">
```

```html
<img data-kt-stylize="halftone" data-kt-cell-size="7" src="photo.webp" alt="…">
<video data-kt-stylize="ascii" src="clip.mp4" muted loop playsinline autoplay></video>
<img data-kt-stylize="dither" data-kt-mode="reveal" data-kt-trigger="view" src="photo.webp" alt="…">
```

## 선명함은 대비에서 나옵니다

이 모듈로 처음 만들어 보면 대개 결과가 뿌옇습니다. 이유는 두 가지이고, 둘 다
해결되어 있습니다.

첫째, **격자는 항상 device pixel 정수 배로 그립니다.** CSS 픽셀 기준으로 셀을
잡으면 한 셀이 2.4 device pixel에 걸쳐 어떤 셀은 2px, 옆 셀은 3px이 되어 점이
고르지 않고 어른거립니다. Kineto는 `cellSize`를 화면 배율에 맞춰 정수로 반올림해
모든 점을 같은 크기로 만듭니다. 별도 설정은 없습니다.

둘째, **사진은 대부분 중간 톤입니다.** 그대로 2색으로 디더하면 회색 죽이 됩니다.
`contrast`(기본 1)를 1.3~1.6으로 올리면 형태가 또렷해지고, `brightness`로 잉크
양을 맞춥니다. 레퍼런스에서 보는 인쇄물 같은 질감은 거의 이 한 줄에서 나옵니다.

```html
<img data-kt-stylize="dither" data-kt-cell-size="3" data-kt-dither-type="4x4"
     data-kt-contrast="1.45" src="photo.webp" alt="…">
```

작은 `cellSize`(2~4)와 올린 `contrast`의 조합이 기본 출발점입니다.

## 계속 움직이는 효과 (`motion`)

`persist`는 정지 화면이 아닙니다. `motion`을 주면 정지 이미지에서도 효과 자체가
살아 움직입니다.

| 값 | 동작 | 어울리는 곳 |
|---|---|---|
| `none`(기본) | 한 번 그리고 멈춤 | 조용한 배경, 저사양 |
| `drift` | 격자가 천천히 기어가며 필름 그레인처럼 일렁임 | 모든 룩 |
| `shuffle` | 밝기가 비슷한 글자·패턴으로 셀이 계속 교체됨 | ascii(터미널 느낌) |
| `scan` | 밴드가 훑고 지나가며 그 구간이 진해짐 | CRT·터미널 연출 |
| `flow` | 격자가 대각선으로 흐름 | 인쇄기·스크롤 느낌 |
| `pulse` | 노출이 숨 쉬듯 오르내림 | 은은한 배경 |

`motionSpeed`(기본 1)가 속도, `motionAmount`(기본 0.5)가 세기입니다.

```html
<img data-kt-stylize="ascii" data-kt-motion="shuffle" data-kt-motion-amount="0.35"
     src="portrait.webp" alt="…">
```

**여섯 가지 motion은 세 룩 모두에서 실제로 움직입니다.** `tests/browser/stylize-patterns.mjs`가
룩 × motion 조합을 전부 재생해 보고, 움직이지 않는 조합이 하나라도 있으면 실패합니다.
`none`은 반대로 한 픽셀도 변하지 않아야 통과합니다 — "멈춰 있음"도 보장되는 상태입니다.

> `drift`는 셀마다 임계값을 다시 뽑는 대신 **정렬 행렬을 이동**시킵니다. 임계값을
> 무작위로 다시 뽑으면 정렬 디더가 랜덤 디더가 되어 사진이 노이즈로 녹아내립니다.
> 밀 격자가 없는 룩(`noise`·`random`·오차 확산 디더, `halftone`)에서는 대신 **부드럽게
> 이동하는 톤 파동**을 더합니다. 공간적으로 이어진 파동이라 구조를 해치지 않고 그레인이
> 기어가는 인상만 만듭니다.

## 포인터 반응 (`pointer`)

| 값 | 동작 |
|---|---|
| `none`(기본) | 반응하지 않음 |
| `lens` | 커서 주변 원형 영역만 `pointerCellSize` 격자로 다시 그림(선명하게 또는 더 거칠게) |
| `spotlight` | 커서 주변의 잉크를 더함 |
| `ripple` | 커서에서 물결이 퍼지며 잉크가 오르내림 |

`pointerRadius`(기본 140px)가 범위, `pointerStrength`(기본 0.6)가 spotlight·ripple의
세기, `pointerCellSize`(기본 0 = 바깥 격자의 절반)가 lens 안쪽 격자입니다.

```html
<img data-kt-stylize="dither" data-kt-cell-size="8"
     data-kt-pointer="lens" data-kt-pointer-cell-size="2" data-kt-pointer-radius="90"
     src="photo.webp" alt="…">
```

포인터가 없는 기기에서는 아무 일도 일어나지 않고 기본 격자만 보입니다.

## 유지(persist)와 리빌(reveal)

`mode`는 이 모듈에서 가장 중요한 선택입니다.

- `persist`(기본값) — 질감을 계속 유지합니다. 정지 이미지는 크기가 바뀔 때
  다시 그리고, GIF·APNG·애니메이션 WebP와 `<video>`는 프레임마다 다시 그립니다.
- `reveal` — 질감을 한 번 재생합니다. 아래 `transition` 방식으로 원본을 드러낸
  뒤 `holdDuration`이 지나면 레이어를 지우고 `onComplete`를 부릅니다.

`reveal`일 때만 `trigger`가 의미를 가집니다. `load`는 이미지·영상이 준비되는 즉시,
`view`는 화면에 들어올 때(`threshold`·`rootMargin`), `manual`은 인스턴스의
`replay()`를 부를 때 시작합니다.

영상도 같은 실행 조건을 따릅니다. `manual`에서 재생 이벤트나 `resume()`만으로
효과가 시작되지는 않으며, 데이터 준비 전 `replay()`를 호출하면 준비 후 시작합니다.
Kineto는 영상 자체의 재생을 강제하지 않습니다. `<video>`의 재생은 `autoplay`나
사용자의 재생 버튼으로 제어하세요.

영상의 `delay` → `duration` → `holdDuration`은 **효과와 영상이 모두 실행 중이고
탭이 보이는 시간**으로 계산합니다. 모듈 `pause()`·영상 일시정지·숨김 탭에서는
RAF를 취소하고 남은 시간을 보존합니다. 재개해도 완료 지점으로 건너뛰지 않으며,
종료 콜백은 한 번만 호출됩니다. 완료 후에는 `replay()`로 다시 시작할 수 있습니다.

이미지도 `pause()`·숨김 탭에서 RAF와 지연/완료 대기 타이머를 취소하고 남은
시간을 보존합니다. 정지 이미지의 크기가 중단 중 바뀌면 재개 시 한 번 다시
그리며, 계속 도는 RAF는 만들지 않습니다. 숨김 탭에서 처음 생성한 효과와
일시정지 중 요청한 `replay()`도 실행 가능한 시점까지 기다립니다.
명시적으로 `pause()`한 인스턴스는 탭이 다시 보여도 `resume()` 전까지 멈춥니다.

```html
<video data-kt-stylize="halftone" data-kt-mode="reveal" data-kt-trigger="view"
       data-kt-delay="0.3" data-kt-duration="1.6" data-kt-hold-duration="0.4"
       src="clip.mp4" muted loop playsinline autoplay></video>
```

데모의 **Halftone Video — Scan** 설정에서 Mode를 Reveal로 바꾸고 Trigger·Delay·
Reveal duration·Hold (ms)을 조절해 확인할 수 있습니다. 기본 Persist 모드에는
리빌의 실행 조건과 시간 옵션이 적용되지 않습니다.

`transition`은 리빌이 원본으로 넘어가는 방식입니다.

| 값 | 동작 |
|---|---|
| `dissolve`(기본) | 셀 크기는 그대로 두고 셀이 무작위 순서로 걷힘 — 모든 프레임이 완성된 효과만큼 선명 |
| `wipe` | 같은 방식이되 대각선 경계가 훑고 지나감 |
| `shrink` | 셀을 점점 줄인 뒤 크로스페이드. 가장 부드럽지만 중간 해상도가 흐릿해 권하지 않음 |

`shrink`는 0.10.0의 동작이라 deprecated Lazy alias의 기본값으로만 남아 있습니다.

```js
const stylized = Kineto.stylize('#hero', { effect: 'dither', mode: 'reveal', trigger: 'manual' });
stylized.replay();
```

## 색과 디자인 토큰

`paperColor`·`inkColor`·`accentColor`는 **CSS 사용자 정의 속성을 그대로 받습니다.**
디자인 시스템의 토큰을 hex로 베껴 적지 말고 그대로 가리키세요.

```html
<img data-kt-stylize="dither"
     data-kt-paper-color="var(--surface)"
     data-kt-ink-color="var(--fg, #111)"
     src="photo.webp" alt="…">
```

토큰은 **효과가 붙은 요소 기준**으로 읽습니다. 섹션이 토큰을 덮어써 테마를
바꾸면 그 안의 효과도 같은 테마를 따라갑니다. 정의되지 않은 토큰은 CSS와 똑같이
`var(--x, 폴백)`의 폴백을 씁니다.

> 색은 인스턴스를 만들 때 한 번 읽습니다. 런타임에 테마를 토글하는 페이지라면
> 해당 요소를 `Kineto.destroyModule(el, 'stylize')` 후 다시 만들면 새 토큰으로
> 그려집니다.

`paperColor`와 `inkColor`는 밝은 부분과 어두운 부분에 칠할 두 색이고,
`accentColor`를 주면 중간 톤에 쓰이는 세 번째 색이 됩니다. `originalColors`를
켜면 팔레트 대신 이미지 자신의 색을 `colorSteps` 단계로 포스터라이즈해 쓰고,
`inverted`는 밝기를 뒤집습니다.

## 성능

`cellSize`가 작을수록 셀 수가 제곱으로 늘어납니다. `renderFps`는 초당 다시
그리는 횟수의 상한, `maxDpr`은 그릴 때 쓰는 픽셀 밀도의 상한입니다.
`Kineto.performance === 'low'`인 기기에서는 두 값이 자동으로 더 낮아집니다.
큰 영상에 작은 셀을 쓰는 조합은 실제 기기에서 먼저 측정하세요.

`motion`이나 `pointer`를 켜면 정지 이미지도 매 프레임 다시 그립니다. 화면에 이런
카드를 여러 장 놓을 때는 `renderFps`를 12~18로 낮추는 것만으로 비용이 크게
줄어듭니다. 아무 것도 켜지 않으면 정지 이미지는 한 번만 그리고 크기가 바뀔 때만
다시 그립니다.

## 접근성과 안전한 실패

- 원본 요소는 숨기지 않습니다. canvas가 픽셀을 읽을 수 없는 소스(CORS 헤더가
  없는 다른 origin의 이미지)는 질감 없이 원본 그대로 보입니다.
- canvas 레이어는 `aria-hidden`이므로 `alt` 텍스트와 자막은 그대로 남습니다.
- `prefers-reduced-motion`에서 `persist`는 그대로 적용됩니다(질감 자체는
  움직임이 아니며, 움직이는 소스는 질감과 무관하게 움직입니다). `reveal`은
  재생하지 않고 건드리지 않은 원본을 보여 줍니다.
- 모션 축소 환경의 `persist`는 추가 `motion`과 `pointer` 반응을 비활성화합니다.
  원본 GIF·영상의 자체 재생은 제어하지 않으며 정적인 질감은 유지합니다.
- 다만 `motion`은 말 그대로 움직임입니다. 중요한 콘텐츠 위에 강한 `motion`을
  상시로 두지 말고, 장식 이미지에 낮은 `motionAmount`로 쓰세요.

`destroy()`는 이미지·영상 모두 한 번만 정리합니다. 이전 인스턴스를 다시 종료해도
그 이후 작성자가 바꾼 스타일을 덮지 않습니다. 이미지의 `onComplete`·`onProgress`
안에서 인스턴스를 종료한 경우에도 이후 프레임이나 크기 관찰을 다시 예약하지 않습니다.

## Lazy와 함께 쓰기 (지연 로딩 + 리빌)

두 모듈을 한 요소에 붙일 수 있습니다. Lazy가 이미지를 **가져오고**, Stylize가
가져온 픽셀을 **그립니다.** Lazy가 만든 wrapper를 Stylize가 재사용하므로 레이어가
겹치지 않습니다.

```html
<!-- 뷰포트 근처에서 로드하고, 디더가 셀 단위로 걷히며 사진이 드러남 -->
<img data-kt-lazy="fade"
     data-kt-stylize="dither" data-kt-mode="reveal" data-kt-transition="dissolve"
     data-kt-cell-size="3" data-kt-contrast="1.45" data-kt-duration="2.2"
     data-src="photo.webp" alt="…">

<!-- 로드는 Lazy가, 질감은 계속 유지 -->
<img data-kt-lazy="fade" data-kt-stylize="halftone" data-src="photo.webp" alt="…">
```

## 옵션

전체 목록과 기본값은 [module-reference.md](../module-reference.md#stylize)에
있습니다. 공통 옵션은 [common-options.md](../common-options.md)를 참고하세요.
