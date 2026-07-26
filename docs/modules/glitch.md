# glitch

텍스트와 이미지에 짧은 신호 오류 모션을 적용합니다. `prefers-reduced-motion` 환경에서는 원본 콘텐츠만 표시합니다.

## 프리셋

| 프리셋 | 대상 | 동작 |
|---|---|---|
| `rgb` | 텍스트 | RGB 복제 레이어와 가로 슬라이스가 짧게 어긋남 |
| `pixel` | 텍스트 | 글자 조각을 사각 그리드로 잘라 계단식으로 이동 |
| `noise` / `digital` | 텍스트 | 임의 글리프가 원문으로 정착 |
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

모든 프리셋에서 `intensity`는 이동량·노이즈·블록 수, `speed`는 한 번의 재생 속도, `frequency`는 반복 빈도, `randomness`는 패턴과 간격의 무작위성(0–1)을 제어합니다. `trigger`는 `auto`·`hover`·`scroll`, `loop`는 반복 여부를 정합니다. 이미지 프리셋은 `sliceCount`, `pixel`·`datamosh`·`reveal`은 `duration`을 추가로 사용합니다. `replay()`, `pause()`, `resume()`, `destroy()`를 제공합니다.
