# Page Reveal variant 중복 감사

기준 버전: v0.8.104 후속 · 수동 검토일: 2026-08-19

`pageReveal`의 공개 variant는 이름이나 색상만 다른 preset을 늘리는 대신, 화면에서
구분되는 움직임의 메커니즘을 가져야 합니다. 아래 표는 공개 contract 16개를 현재
구현 branch와 일대일로 대조한 결과입니다.

| variant | 구분되는 메커니즘 | 코드 근거 | 상태 |
|---|---|---|---|
| `curtain` | 한 장의 cover가 지정 edge를 기준으로 scale-out | 기본 fallback branch | distinct |
| `split` | 두 반쪽 cover가 반대 방향으로 분리 | `split` branch | distinct |
| `blinds` | 세로 slat이 교대 hinge에서 scaleY 축소 | `blinds` branch | distinct |
| `diagonal` | 회전한 oversized slab이 대각선으로 이동 | `diagonal` branch | distinct |
| `shutter` | 가로 slat이 교대 좌우 hinge에서 scaleX 축소 | `shutter` branch | distinct |
| `fade` | 단일 overlay의 opacity ramp와 미세 scale | `fade` branch | distinct |
| `zoom` | 페이지 root 자체의 viewport 중심 scale·opacity | `zoom` branch | distinct |
| `iris` | 중앙 원형 clip-path aperture와 trailing ring | `iris` branch | distinct |
| `flash` | anamorphic light streak가 중앙을 clip으로 개방 | `flash` branch | distinct |
| `center-slit` | 중앙 hairline에서 수직·수평 패널 순차 개방 | `center-slit` branch | distinct |
| `data-mosaic` | seeded tile dissolve와 noise/cleanup 단계 | `data-mosaic` branch | distinct |
| `curve` | border-radius bulge가 있는 한 장의 곡면 cover | `curve` branch | distinct |
| `dissolve` | feathered mask gradient의 비경계형 sweep | `dissolve` branch | distinct |
| `push` | 기존 page와 새 cover가 반대 방향으로 함께 이동 | `push` branch | distinct |
| `grid` | 독립 cell grid가 staggered scale로 해체 | `grid` branch | distinct |
| `fold` | 공유 perspective의 교대 hinge 패널이 3D 접힘 | `fold` branch | distinct |

이 감사에서 제거된 과거 alias는 `circle`(→`iris`), `wipe`(→`curtain`),
`columns`·`strips`(→`blinds`), `checker`(→`data-mosaic`)입니다. `fade`는
전체 opacity 변화이고 `flash`는 중앙 광선과 clip 개방이므로 같은 효과로 합치지
않습니다. 새 variant는 contract·demo·문서·mechanism branch와 함께 추가하고,
두 variant가 같은 메커니즘이면 공개 목록에 넣지 않습니다.
