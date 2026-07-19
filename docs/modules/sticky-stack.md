# stickyStack

세로 카드 스택, 가로 핀 스크롤, z-index 시퀀스, 핀 고정 플로팅 콘텐츠를 제공합니다.

| 모드 | 설명 |
|---|---|
| `vertical` | CSS `position: sticky`로 카드 누적. 기본 |
| `horizontal` | 컨테이너를 pin하고 자식 패널을 가로 이동 |
| `zindex` | 전체 화면 sticky 패널을 순서대로 겹침 |
| `floating` | 고정된 무대 안에서 콘텐츠가 순차 진입·퇴장 |

활성화 속성의 값은 공통 파서에서 `preset`으로 전달되므로 모듈은 `data-kt-sticky-stack="horizontal"`과 JS `{ mode: 'horizontal' }`를 동일하게 처리합니다.

## Vertical

```html
<div data-kt-sticky-stack="vertical" data-kt-offset="22">
  <article>01</article><article>02</article><article>03</article>
</div>
```

## Horizontal pinned scroll

```html
<div
  data-kt-sticky-stack="horizontal"
  data-kt-gap="20"
  data-kt-panel-width="100%"
  data-kt-scrub="0.8"
  data-kt-snap="true"
>
  <article>01</article><article>02</article><article>03</article>
</div>
```

## Floating pinned sequence

```html
<div
  data-kt-sticky-stack="floating"
  data-kt-effect="depth"
  data-kt-overlap="0.35"
  data-kt-scroll-length="90"
  data-kt-previous-opacity="0.12"
>
  <article>FLOAT</article><article>FOCUS</article><article>FLOW</article>
</div>
```

## 주요 옵션

| 옵션 | 기본값 | 설명 |
|---|---:|---|
| `mode` / `type` / `preset` | `vertical` | 네 모드 |
| `offset` / `offsetY` | `20` | vertical 카드 top 간격(px) |
| `zIndex` | `true` | vertical z-index 자동 설정 |
| `gap` | `24` | horizontal 패널 간격(px) |
| `panelWidth` | `100%` | horizontal 자식 flex-basis |
| `pin` / `pinSpacing` | `true` | horizontal/floating pin 설정 |
| `scrub` | `1` | ScrollTrigger scrub |
| `snap` | `false` | horizontal 패널 snap |
| `start` / `end` | 모드별 | ScrollTrigger 범위 |
| `effect` | `fade-up` | floating 진입 효과 |
| `distance` | `80` | floating 이동 거리(px) |
| `scaleFrom` | `0.82` | scale/depth 시작 scale |
| `rotate` | `6` | rotate/depth 시작 각도 |
| `blur` | `18` | blur 효과 시작값 |
| `overlap` | `0.25` | floating 항목 겹침 비율 |
| `itemDuration` | `1` | 항목 timeline 길이 |
| `scrollLength` | `80` | 항목당 pin scroll 길이(%) |
| `previousOpacity` | `0.18` | 다음 항목 진입 후 이전 opacity |
| `previousScale` | `0.88` | 이전 항목 scale |
| `previousY` | `-40` | 이전 항목 Y 이동 |
| `previousBlur` | `8` | 이전 항목 blur(px) |
| `fadePrevious` | `true` | 이전 항목 blur 처리 |
| `perspective` | `1200` | floating 3D perspective |
| `minHeight` | `70vh` | floating 무대 최소 높이 |
| `ease` | 모드별 | GSAP ease |

`destroy()`는 tween/ScrollTrigger를 kill하고 컨테이너와 모든 자식의 기존 inline style을 복원합니다. reduced-motion에서는 자식을 일반 문서 흐름의 정적 콘텐츠로 표시합니다.
