# 공개 variant 중복 감사

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

## 고위험 모듈 확대 감사

확대 검토일: 2026-09-05

`pageReveal`에서 사용한 기준을 variant 수가 많거나 canvas·mask·3D·pointer
렌더러를 분기하는 여섯 모듈로 확대했습니다. 여기서 “distinct”는 색·속도·기본값만
다른 이름이 아니라, 서로 다른 초기 상태, DOM 구조, 렌더링 알고리즘 또는 이동
경로가 소스에 남아 있다는 뜻입니다. 정적 검사는 각 공개 이름을 고유한 mechanism
identity와 실제 source anchor 묶음에 연결합니다.

| module | source mechanism | 전용 demo markup | 상태 |
|---|---:|---:|---|
| `reveal` | `23/23` | `6/23` | distinct |
| `lazy` | `13/13` | `11/13` | distinct |
| `cursor` | `11/11` | `10/11` | distinct |
| `overflowText` | `11/11` | `11/11` | distinct |
| `glitch` | `10/10` | `5/10` | distinct |
| `slider` | `10/10` | `4/10` | distinct |

전용 markup 합계는 47/78입니다. 전용 카드가 없는 variant도 생성된
`PUBLIC_VARIANTS` 설정 선택지에는 78/78 모두 노출됩니다. 따라서 위 수치는 기능
구현 여부를 낮춰 잡은 값이 아니라, 첫 화면에서 즉시 비교할 수 있는 시각 QA 표면의
범위를 별도로 드러낸 값입니다. 데모가 계약에 없는 오래된 이름을 직접 작성하거나
설정 선택지에서 공개 variant를 누락하면 CI가 실패합니다.

### 모듈별 구분 근거

- `reveal`: 21개 선언형 preset은 opacity, px/% translate, scale, blur,
  perspective flip, rotate·corner swing, skew, clip-path의 서로 다른 초기 상태를
  가집니다. `class`는 observer가 작성자 class만 토글하는 lifecycle branch이고,
  `clock`은 conic mask 진행률을 그리는 별도 branch입니다.
- `lazy`: `fade`와 `blur-up`을 분리하고, `wave`는 slice 변위 canvas,
  `grain`은 live-image noise canvas를 사용합니다. `skeleton`, `pixelate`, `flicker`,
  `polaroid`, `crt`는 각각 placeholder, discrete resolution, blackout slice,
  instant-film, tube power-on 구조입니다. `print`는 방향성 sharp mask,
  `dissolve`는 전역 noise·blur 감소이며, `data-mosaic`와 `rgb-slice-burst`는 각각
  seeded tile clear와 one-shot channel slice입니다.
- `cursor`: `dot`, `ring`, `blob`, `crosshair`, `text`, `trail`, `orbit`, `snake`,
  `sparkle`, `image`, `custom`을 점+추종 링, outline follower, filled blur,
  viewport/local axis, SVG text path, elastic chain, ellipse orbit, spaced glyph chase,
  particle pool, live image, authored template 구조로 각각 고정합니다.
- `overflowText`: `loop`, `bounce`, `rewind`, `once`는 seamless duplicate,
  왕복, masked invisible reset, one-way hold로 구분됩니다. `page`, `flip`,
  `dissolve`, `page-roll`, `rolling`, `fade`, `scroll-fade`도 각각 directional mask,
  split-flap, character scramble, paged ticker, item ticker, page crossfade,
  marquee seam crossfade 경로를 유지합니다.
- `glitch`: text의 `rgb`, `pixel`, `noise`는 3-layer slice, glyph fragment grid,
  character scramble입니다. image의 `crt`, `wave`, `image`, `datamosh`, `reveal`,
  `vcr`은 scan/roll, seeded wave slice, 반복 channel canvas, compression block,
  one-shot decode, tracking band로 구분되며 `rgb-slice-burst`는 seeded artifact
  scheduler를 사용합니다.
- `slider`: `slide`는 선형 track, `fade`는 stacked opacity, `dissolve`는
  blur·scale, `wipe`는 directional clip, `coverflow`는 centered 3D neighbours,
  `flip`은 180도 plane, `cube`는 90도 hinge, `cards`는 depth stack,
  `creative`는 offset·rotate·blur stack입니다. `radial`은 track renderer를 쓰지 않고
  hub orbit와 독립 drag/settle engine을 사용합니다.

`tests/variant-distinctness.mjs`는 이 감사 범위의 contract 완전성, source-anchor
fingerprint 고유성, Reveal 초기 상태 고유성, 전용 demo variant의 유효성, 생성된
설정 선택지의 1:1 동기화를 함께 검사합니다. source anchor는 브라우저 시각 회귀를
대체하지 않으며, 분기 삭제·alias 재도입·데모 drift를 빠르게 차단하는 정적 gate입니다.
