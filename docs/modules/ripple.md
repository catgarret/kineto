# ripple

버튼을 누른 위치에서 원이 퍼지는 Android/Material 스타일 click feedback입니다.

```html
<button data-kt-ripple data-kt-color="255,255,255" data-kt-opacity="0.28">
  저장
</button>
```

| 옵션 | 기본 동작 | 설명 |
|---|---|---|
| `color` | current/light ripple | 원 색상 |
| `opacity` | 효과 기본값 | 최대 opacity |
| `duration` | 효과 기본값 | 확산 시간 |
| `scale` | element를 덮는 크기 | 최종 배율 |
| `centered` | `false` | pointer 대신 중앙에서 시작 |
| `unbounded` | `false` | 요소 바깥 확산 허용 |
| `easing` | Material 계열 | easing |
| `disableInReducedMotion` | `true` | reduced-motion에서 비활성화 |

각 클릭마다 생성한 원은 animation 종료 후 제거되며 `destroy()` 시 남은 ripple과 listener도 정리합니다. Card Glow/Tilt가 아니라 Pointer & Button Feedback 카테고리에 속합니다.
