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

`wave`는 연속 필터 효과입니다. `intensity`·`channelOffset`으로 왜곡량,
`speed`·`frequency`로 주기, `seed`로 노이즈 패턴을 조절합니다. 현재
`trigger`·`loop`·`duration`·`delay`는 이 경로에 적용되지 않습니다.
필요한 시점에 `pause()`/`resume()`으로 제어하며, `destroy()`는 필터와 타이머를
제거하고 원래 inline filter를 복원합니다. 데모 설정의 Type에서 선택할 수 있습니다.
