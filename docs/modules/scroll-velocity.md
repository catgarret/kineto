# scrollVelocity

스크롤 방향과 속도를 요소의 transform/filter로 변환합니다. 탄성을 켜거나 끄고 물리 계수를 조절할 수 있습니다.

| 모드 | 동작 |
|---|---|
| `skew` | 방향에 따른 skew |
| `translate` | 선택 축 이동 |
| `rotate` | 방향에 따른 회전 |
| `scale` | 속도 절댓값에 따른 확대 |
| `blur` | 움직이지 않고 스크롤 속도만큼 흐려짐 (기본 `maxBlur` 8px) |

`maxBlur`를 주면 다른 모드에도 속도 기반 blur를 더할 수 있습니다. `blur` 모드는 transform을
쓰지 않으므로 요소 자신의 CSS transform이 그대로 유지됩니다.

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

값과 탄성 속도가 모두 안정되면 RAF 계산과 스타일 갱신을 중지하고, 다음 스크롤
입력에서 재개합니다. `onUpdate`는 처리 프레임에 호출되며 정지 중에는 반복 호출되지
않습니다. `pause()` 중에는 입력이 와도 자동 재개하지 않고, `destroy()` 후에는
`resume()`을 호출해도 다시 실행되지 않습니다.
