# scrollVelocity

스크롤 방향과 속도를 요소의 transform/filter로 변환합니다. 탄성을 켜거나 끄고 물리 계수를 조절할 수 있습니다.

| 모드 | 동작 |
|---|---|
| `skew` | 방향에 따른 skew |
| `translate` | 선택 축 이동 |
| `rotate` | 방향에 따른 회전 |
| `scale` | 속도 절댓값에 따른 확대 |
| `blur` | 속도 기반 blur |

```html
<h2
  data-kt-scroll-velocity="translate"
  data-kt-axis="x"
  data-kt-spring="true"
  data-kt-stiffness="150"
  data-kt-damping="22"
  data-kt-mass="1"
>SCROLL DIRECTION →</h2>
```

- `spring: false`: `smoothing`, `decay` 기반 직접 반응
- `spring: true`: `stiffness`, `damping`, `mass`, `response` 기반 탄성 반응

`destroy()`는 RAF와 ScrollTrigger를 정리하고 기존 transform/filter/will-change를 복원합니다. reduced-motion에서는 비활성화됩니다.
