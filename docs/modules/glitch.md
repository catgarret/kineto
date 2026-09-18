# glitch

텍스트와 이미지에 짧은 신호 오류 모션을 적용합니다. `prefers-reduced-motion` 환경에서는 원본 콘텐츠만 표시합니다.

## 프리셋

| 프리셋 | 대상 | 동작 |
|---|---|---|
| `rgb` | 텍스트 | RGB 복제 레이어와 가로 슬라이스가 짧게 어긋남 |
| `rgb-slice-burst` | 텍스트·이미지 컨테이너 | seed 기반 색수차·슬라이스·artifact 버스트 |
| `pixel` | 텍스트 | 글자 조각을 사각 그리드로 잘라 계단식으로 이동 |
| `noise` | 텍스트 | 임의 글리프가 원문으로 정착 |
| `wave` | 텍스트·이미지 | SVG turbulence/displacement로 연속 신호 왜곡 |
| `crt` | 텍스트·이미지 | 텍스트는 CRT 버스트, 이미지는 주사선·롤바 오버레이 |
| `image` | 이미지 | 얇은 색수차·가로 슬라이스·스캔라인이 간헐적으로 발생 |
| `datamosh` | 이미지 | 저해상도 압축 매크로블록을 복제·이동 |
| `reveal` | 이미지 | 강한 글리치에서 원본으로 정착하는 1회 리빌 |
| `vcr` | 이미지 | 주사선·트래킹 노이즈·미세한 화면 흔들림 |

```html
<h2 data-kt-glitch="pixel" data-kt-intensity="1.2" data-kt-duration="0.45">
  PIXEL ERROR
</h2>

<div data-kt-glitch="datamosh" data-kt-slice-count="9">
  <img src="/image.webp" alt="">
</div>
```

프리셋에 따라 `intensity`는 이동량·노이즈·블록 수, `speed`는 재생 속도, `frequency`는 반복 빈도, `randomness`는 패턴과 간격의 무작위성(0–1)을 제어합니다. 버스트 계열에서는 `trigger`(`auto`·`hover`·`scroll`)와 `loop`로 시작·반복을 설정합니다. 이미지 프리셋은 `sliceCount`, `pixel`·`datamosh`·`reveal`은 `duration`을 추가로 사용합니다. `replay()`, `pause()`, `resume()`, `destroy()`를 제공합니다.

## 종료와 스타일 복원

`destroy()`는 최종 종료입니다. 이전 인스턴스에 남아 있는 `replay()`·`resume()`·
`pause()`·`fire()` 호출은 효과를 다시 예약하거나 복원된 DOM을 바꾸지 않습니다.
같은 인스턴스의 `destroy()`를 다시 호출해도 새로 작성한 스타일을 덮어쓰지 않습니다.
다시 적용하려면 Core의 `create()`/`replay()`로 새 인스턴스를 만듭니다.

이미지·Datamosh·Reveal의 canvas와 CRT/VCR overlay를 제거할 때 소유한 스타일의
값과 `!important`를 복원합니다. Reveal의 원래 이미지 투명도, CRT/VCR의 원래
필터·애니메이션·재생 상태, RGB Slice Burst의 position·isolation도 보존합니다.
이는 종료 처리 보강이며 효과의 기본 모양이나 재생 옵션을 바꾸지 않습니다.

## Wave 제어

`wave`는 SVG 필터로 원본을 변형하며 이미지·자식 DOM을 복제하지 않습니다.
옵션을 생략하면 기존의 2.6초 연속 주기와 약 24fps(42ms) 갱신을 유지합니다.

| 옵션 | Wave 동작 |
|---|---|
| `intensity`, `channelOffset` | 왜곡량 |
| `seed` | turbulence 노이즈 패턴 |
| `speed`, `frequency` | 주기 속도 배율; 기본 주기는 최소 600ms |
| `duration` | 명시하면 한 주기의 초 단위 길이; 속도 배율 적용 후 최소 42ms |
| `randomness` | 주기 내 변화 폭(0–1); `0`은 일정한 중간값, `1`은 기존 변화 폭 |
| `trigger` | `auto`는 즉시 시작, `hover`는 포인터 진입, `scroll`/`view`는 viewport 진입 시 시작 |
| `delay` | 시작 지연; 0–10은 초, 10보다 큰 값은 기존 Glitch와 동일하게 밀리초 |
| `loop` | 기본 `true`; `false`는 한 주기 후 원본 필터로 복귀 |
| `colors` | 선택 사항. CSS 색상 배열을 한 주기에 균등 분배해 35% 색조로 합성. 빈 배열은 기존 왜곡만 사용 |
| `blendMode` | 선택 사항. 재생 중 요소의 CSS `mix-blend-mode`; 색상 배열 없이도 사용 가능 |

```js
const wave = Kineto.create('glitch', element, {
  preset: 'wave', trigger: 'hover', loop: false, duration: 0.6, delay: 0.1
});
```

포인터·viewport 이탈 시 왜곡과 타이머를 제거하고, 재진입 시 지연부터 새 주기를
시작합니다. `pause()`/`resume()`는 주기와 남은 지연을 보존하며 중복 호출해도
타이머가 늘어나지 않습니다. 숨겨진 탭에서는 연산을 멈추고, 돌아와도 수동으로
일시 정지한 상태는 유지합니다. `replay()`는 지연 없이 처음부터 다시 재생하므로
완료된 `loop:false` 효과도 재생할 수 있습니다.

`destroy()`는 타이머·이벤트·관찰자·SVG를 제거하고 원래 inline filter와
`!important`를 복원합니다. 다른 코드가 바꾼 비소유 스타일은 유지하며, 파괴한
인스턴스의 `resume()`/`replay()`는 아무 작업도 다시 시작하지 않습니다.
`prefers-reduced-motion`과 저성능 fallback은 필터 없이 원본만 표시합니다.

색상·합성 옵션을 생략하면 기존 Wave의 모양과 필터 구조를 유지합니다.
`colors: ['#ff0040', 'rgb(0, 120, 255)']`처럼 지정할 수 있으며, CSS 변수와
`currentColor`는 생성 시 대상 요소의 문맥으로 해석합니다. 잘못된 색상은
제외합니다. 데모의 Color palette에는 JSON 배열을 입력합니다.
색조는 기존 타이머를 공유하고 pause 시 함께 멈추며, 원본의 투명 영역을 채우지
않습니다. 종료·이탈·destroy 시 원래 합성 값과 priority도 복원합니다.
`blendMode`의 결과는 뒤쪽 배경과 stacking context에 따라 달라집니다.

구현 기준: [SVG feFlood](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feFlood),
[feComposite atop](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feComposite).
