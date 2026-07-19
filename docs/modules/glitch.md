# glitch

## RGB

기본 `rgb`는 원본 텍스트 위에 빨강·초록·파랑 복제 레이어를 겹치고, 간헐적으로 서로 다른 가로 slice가 짧게 튀는 원래 Claude 구현 계열의 glitch입니다. 단순 전체 흔들림이나 grayscale noise로 대체하지 않습니다.

```html
<h2 data-kt-glitch="rgb" data-kt-intensity="1.1">SIGNAL LOST</h2>
```

## Digital

`digital`은 별도의 디지털 distortion variant입니다.

| 옵션 | 설명 |
|---|---|
| `type` / `preset` | `rgb` 또는 `digital` |
| `intensity` | slice 이동과 burst 강도 |
| `delay` | burst 간 대기 |

Text Motion demo에는 Replay 버튼이 있으며, destroy 시 복제 layer와 animation을 모두 제거하고 원본 DOM을 복원합니다.
