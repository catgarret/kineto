# Kineto Design System / 키네토 디자인 시스템

> **Status: proposal (2026-10-16).** This document defines the visual language for Kineto's own surfaces — the demo site, examples, documentation pages and any future Kineto UI. The library itself stays design-system-agnostic: modules never ship these colors. Nothing in `demo/` changes until a separate task adopts it.
>
> **상태: 제안(2026-10-16).** 데모 사이트 · 예제 · 문서 페이지 같은 Kineto 자체 화면의 디자인 언어입니다. 라이브러리(모듈)는 지금처럼 어떤 디자인 시스템에도 붙는 중립을 유지하고, 이 색을 모듈에 넣지 않습니다. `demo/` 는 별도 작업에서 옮기기 전까지 바뀌지 않습니다.

이 문서는 범용 통합 디자인 시스템(라이트/다크 · 투명도 레이어 · XSM~XLG 크기 · 입력 장치 밀도 · 화면 등급 · 모션 규칙)을 **그대로 기반**으로 하고, **색 · 서체 · 면만 Kineto 브랜드로** 바꾼 판입니다. 간격 · 크기 · 행간 · 반경 · 모션 값은 기반과 같습니다(6~9장).

- 토큰 접두사: `--kt-` (기존 `data-kt-*` 속성과 같은 이름 공간)
- 테마: **다크가 기본**(데모의 정체성), 라이트는 `data-kt-theme="light"` (지금 데모는 `html.light` — 12장 대응표)
- 숫자의 근거: 색 값은 기반 시스템의 OKLab 보간 · 알파 계산 · WCAG 대비 함수로 계산했고, 데모에 이미 있는 색(`demo/styles.css` 의 `--bg` `--accent` `--accent2` 등)을 기준점으로 고정했습니다.

## 목차

1. 브랜드 키컬러 · 2. 테마 · 3. 원시 램프 · 4. 의미 토큰 · 5. 투명도(알파) · 6. 대비 검증 · 7. 서체 · 타이포 · 8. 크기 · 밀도 · 화면 등급 · 9. 간격 · 반경 · 면 · 10. 모션 · 11. 컴포넌트 규칙 · 12. 데모 변수 대응표 · 13. 복사용 토큰 블록 · 14. 적용 순서 · 유지보수

---

## 1. 브랜드 키컬러

| 역할 | 이름 | 다크(기본) | 라이트 | 쓰는 곳 |
|---|---|---|---|---|
| **메인** | Ink / Bone | `#f2f3f7` (뼈색 면 + 잉크 글자) | `#16130f` (따뜻한 잉크 면 + 흰 글자) | 가장 중요한 버튼, 선택된 칩 · 세그먼트 · 탭 표시, 입력 포커스 테두리 |
| **포인트** | **Ember** | `#ff6a22` (잉크 글자) | `#d34303` (흰 글자) · 글자 `#ae3819` | 강조 버튼, 켜짐 · 진행, 커서(`var(--accent)` 계승), 포커스 링, 강조 단어 |
| **빛** | Ember Glow | `rgba(255,106,34,.38)` | `rgba(255,106,34,.28)` | 커서 후광 · 트레일 · 진행 끝의 번짐 — 블러와 함께, 움직이는 순간에만 |
| **보조 강조** | Sun | `#ffbd47` | `#ffbd47` 면 / `#926422` 글자 | 표시점, 배지 면, 하이라이트 밑줄, 브랜드 그라데이션의 끝 — 넓은 면 · 본문 글자에 쓰지 않음 |
| **브랜드 그라데이션** | Ember → Sun | `linear-gradient(120deg, #ff6a22, #ffbd47)` | `linear-gradient(120deg, #d34303, #e19b34)` | 워드마크 · 히어로 한 단어 · 로더처럼 "Kineto 다운" 순간 한 곳 |

**왜 이 조합인가**

- **주황은 유지하되 다시 설계했습니다(Ember 2).** 지금 데모의 주황 `#ff5b1c` · `#e14e12` 와 노랑 `#ffd166` 은 각각 따로 고른 값이라 단계가 없고, 라이트 주황은 흰 글자 대비가 3.96:1 이라 "굵은 큰 글자만" 같은 예외 규칙이 붙었습니다. 그래서 OKLCH(지각 균일 색공간)에서 색상각 · 명도 · 채도 곡선을 직접 설계했습니다.
  - **500 `#ff6a22`**: 색상각 38° → 42° 로 살짝 노란 쪽, 명도 0.683 → 0.705 로 조금 밝게. 어두운 바탕에서 "빛나는 점"처럼 보여 모션 데모의 커서 · 진행 표시가 더 또렷합니다.
  - **600 `#d34303`**: 흰 글자 **4.59:1** — 라이트에서도 포인트 버튼에 예외 규칙이 필요 없습니다.
  - **램프 전체가 불꽃처럼 흐릅니다**: 밝은 단계는 복숭아 쪽(색상각 58°), 어두운 단계는 붉은 숯 쪽(31°). 같은 색상각에 명도만 바꾼 램프보다 틴트가 탁하지 않고 그림자 쪽이 깊습니다.
  - **Sun `#ffbd47`**: 예전 노랑 `#ffd166`(86°)을 오렌지 쪽으로 당겨(78°) 둘이 한 가족처럼 보이게 했습니다. Ember → Sun 그라데이션이 브랜드 서명입니다.
  - **Glow**: 모션 라이브러리답게 "움직임의 빛"을 따로 토큰으로 두었습니다 — 커서 후광 · 트레일 · 진행 끝 번짐에만, 정지 상태에는 남기지 않습니다.
- 메인을 Ember 가 아니라 **잉크/뼈색**으로 둔 이유: 모션 라이브러리의 데모는 움직이는 요소 자체가 주인공입니다. 주황 면이 많으면 효과보다 버튼이 먼저 보입니다. 무채색 메인이 효과를 돋보이게 하고, Ember 는 "여기가 살아 있다"는 신호로만 씁니다(기반 시스템의 "메인은 무게, 포인트는 신호" 원칙).
- 다크에서 Ember 버튼 글자는 **잉크(`#0d0e12`)** 입니다. 흰 글자는 2.86:1 이지만 잉크 글자는 6.74:1 입니다. 라이트에서는 `#d34303` 위 흰 글자 4.59:1(모든 크기 가능), 더 강한 대비가 필요하면 `#ae3819`(6.21:1).
- 오류색은 Ember 와 헷갈리지 않게 **장미빛 진홍**(`#c81e5a` / `#ff6b8a`, Ember 600 과 색상각 30° 차이)으로 분리했습니다.

**하지 말 것**

| 하지 말 것 | 이유 |
|---|---|
| Ember 를 섹션 바탕 · 카드 면처럼 넓게 칠하기 | 신호가 소음이 됨 → `accent-tint`(투명) |
| Ember 버튼과 메인 버튼을 같은 무게로 나란히 | 주 행동이 흐려짐 → 하나는 약한 변형 |
| 라이트에서 `#d34303` 을 페이지 바탕(`#f6f5f2`) 위 작은 글자로 | 4.21:1 로 부족 → `accent-text`(`#ae3819`) |
| Sun 을 글자색으로(라이트) | 2:1 미만 → `highlight-text`(`#926422`) |
| Glow 를 정지 상태에 남기기 · 그라데이션을 여러 곳에 | 빛 · 서명이 흔해지면 효과가 묻힘 → 움직이는 순간 · 화면당 한 곳 |
| 오류를 Ember 로 표시 | 브랜드 색과 경고가 섞임 → `negative-text` |

---

## 2. 테마

```html
<html>                              <!-- 다크(기본) -->
<html data-kt-theme="light">        <!-- 라이트 -->
<section data-kt-theme="light">     <!-- 부분 라이트: 그 안에서 토큰이 다시 연결됨 -->
```

- 다크가 기본인 이유: 데모의 첫 화면 · 영상 · 캔버스 효과가 어두운 바탕에서 가장 잘 보입니다. OS 설정을 따르게 하려면 `@media (prefers-color-scheme: light) { :root:not([data-kt-theme]) { … } }` 를 추가합니다.
- 다크 바탕은 **차가운 흑연**(graphite, 살짝 푸른 기), 라이트 바탕은 **따뜻한 돌색**(stone, 살짝 노란 기)입니다. 두 테마가 같은 회색을 뒤집은 것이 아니라 각자 온도가 있습니다 — 데모의 현재 값과 같습니다.
- 다크에서 높이는 명도로: 페이지 `#0d0e12` → 섹션 `#111217` → 카드 `#15171c` → 떠 있는 카드 `#1c1f26` → 팝오버 `#21242c`. 그림자 대신 위쪽 1px 흰 선(`inset 0 1px 0 rgba(255,255,255,.03)`)으로 모서리를 보여 줍니다.

---

## 3. 원시 램프

50 = 바탕 쪽, 900 = 글자 쪽. 다크 램프는 50 이 가장 어둡습니다(테마마다 같은 단계 이름이 같은 역할을 하도록).

| 램프 | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 |
|---|---|---|---|---|---|---|---|---|---|---|
| **stone (light neutral)** | `#f6f5f2` | `#edecea` | `#e4e1da` | `#c5c2ba` | `#a8a39b` | `#8b867e` | `#6f6a61` | `#4f4b43` | `#312e28` | `#16130f` |
| **graphite (dark neutral)** | `#0d0e12` | `#15171c` | `#1c1f26` | `#262a32` | `#464c56` | `#6a707d` | `#8f97a6` | `#afb5c0` | `#d0d3db` | `#f2f3f7` |
| **ember light** | `#fff3e8` | `#ffe2cd` | `#ffc9ab` | `#ffad84` | `#ff8d5a` | `#ff6a22` | `#d34303` | `#ae3819` | `#882d1b` | `#632319` |
| **ember dark** | `#2a1b19` | `#3f241d` | `#643322` | `#9a4726` | `#cb5826` | `#ff6a22` | `#ff8d5a` | `#ffad84` | `#ffc8a9` | `#ffe2cd` |
| **sun light** | `#fff8e7` | `#ffedca` | `#ffdfa7` | `#ffd285` | `#ffc767` | `#ffbd47` | `#e19b34` | `#b97f2b` | `#926422` | `#6e4a19` |
| **sun dark** | `#24201b` | `#392f22` | `#5d4a2c` | `#937038` | `#c89640` | `#ffbd47` | `#ffc767` | `#ffd896` | `#ffe8bf` | `#fff8e7` |


- stone: 데모 라이트 `#f6f5f2`(50) · `#edecea`(100) · `#e4e1da`(200) · `#6f6a61`(600) · `#16130f`(900) 고정, 나머지 OKLab 보간
- graphite: 데모 다크 `#0d0e12`(50) · `#15171c`(100) · `#1c1f26`(200) · `#262a32`(300) · `#8f97a6`(600) · `#f2f3f7`(900) 고정
- ember light: OKLCH 설계 — 명도 0.972 → 0.350, 채도 최고 0.205(500), 색상각 58° → 31°(밝은 쪽 복숭아 · 어두운 쪽 숯)
- sun light: 색상각 78°(600 부터 72°), 채도 최고 0.150
- ember dark · sun dark: 어두운 바탕에서 50 = 가장 어두운 틴트(바탕 `#0d0e12` 와 섞음), 600~900 은 밝은 단계(글자 · 빛)

그 밖의 카테고리 색(그래프 · 태그)은 기반 시스템의 blue · green · teal · violet · magenta 램프를 그대로 씁니다(13장에는 넣지 않음 — 필요할 때 추가).

---

## 4. 의미 토큰 (컴포넌트는 이것만 씀)

| 토큰 | Light | Dark | 뜻 |
|---|---|---|---|
| `--kt-bg-page` | `#f6f5f2` | `#0d0e12` | 페이지 바탕 |
| `--kt-bg-canvas` | `#edecea` | `#111217` | 한 단계 들어간 섹션 |
| `--kt-bg-surface` | `#ffffff` | `#15171c` | 카드·패널 |
| `--kt-bg-raised` | `#ffffff` | `#1c1f26` | 떠 있는 카드 |
| `--kt-bg-float` | `#ffffff` | `#21242c` | 팝오버·시트 |
| `--kt-bg-inverse` | `#16130f` | `#f2f3f7` | 반전 면(툴팁·토스트) |
| `--kt-fg-strong` | `#16130f` | `#f2f3f7` | 제목 |
| `--kt-fg-default` | `#312e28` | `#d0d3db` | 본문 |
| `--kt-fg-subtle` | `#4f4b43` | `#afb5c0` | 보조 |
| `--kt-fg-muted` | `#6f6a61` | `#8f97a6` | 설명 |
| `--kt-fg-faint` | `#8b867e` | `#6a707d` | 메타·자리표시(보조 정보만) |
| `--kt-fg-inverse` | `#ffffff` | `#0d0e12` | 반전 면 위 글자 |
| `--kt-line-subtle` | `#edecea` | `#1c1f26` | 아주 옅은 구분 |
| `--kt-line-default` | `#e4e1da` | `#262a32` | 기본 구분선 |
| `--kt-line-strong` | `#c5c2ba` | `#464c56` | 입력 테두리 |
| `--kt-primary-solid` | `#16130f` | `#f2f3f7` | 메인 키컬러 — 주 버튼·선택 상태 (다크에서 뼈색으로 뒤집힘) |
| `--kt-primary-on` | `#ffffff` | `#0d0e12` | 주 버튼 글자 |
| `--kt-accent-solid` | `#d34303` | `#ff6a22` | 포인트 키컬러 Ember — 강조 버튼·켜짐·진행·커서 |
| `--kt-accent-glow` | `rgba(255,106,34,.28)` | `rgba(255,106,34,.38)` | 움직임의 빛 — 커서 후광·트레일·포커스 번짐(블러와 함께) |
| `--kt-accent-solid-hc` | `#ae3819` | `#ff6a22` | 고대비 포인트 면(작은 라벨·접근성 우선) |
| `--kt-accent-on` | `#ffffff` | `#0d0e12` | 포인트 버튼 글자 (라이트 흰 글자 4.59:1 · 다크 잉크 글자 6.74:1) |
| `--kt-accent-text` | `#ae3819` | `#ff8d5a` | 포인트 글자·링크 |
| `--kt-highlight` | `#ffbd47` | `#ffbd47` | 보조 강조 Sun — 장식·배지 면·표시점 |
| `--kt-highlight-text` | `#926422` | `#ffc767` | Sun 글자 |
| `--kt-info-text` | `#1b64da` | `#449bff` | 정보 |
| `--kt-positive-text` | `#007a36` | `#29CF73` | 성공 |
| `--kt-negative-text` | `#c81e5a` | `#ff6b8a` | 오류 — Ember 와 색상각 30° 이상 떨어진 장미빛 진홍 |
| `--kt-attention-text` | `#9c5c00` | `#ffb134` | 주의 |
| `--kt-line-focus` | `#d34303` | `#ff6a22` | 포커스 링 |


---

## 5. 투명도(알파)

다른 면 · 영상 · 캔버스 효과 위에 얹히는 색은 단색이 아니라 **알파**를 씁니다. Kineto 는 특히 움직이는 배경(canvas effect · ambient media · glass) 위에 UI 가 올라가는 일이 많아 단색 틴트가 쉽게 떠 보입니다.

| 참고한 원리 | 내용 |
|---|---|
| Radix Colors alpha scale | 알파 색은 "기준 바탕 위에 얹으면 단색과 같은 색"이 되도록 계산 — 기준 바탕(라이트 카드 `#ffffff`, 다크 페이지 `#0d0e12` — 다크는 가장 어두운 면을 기준으로 해야 모든 단계가 "더하는" 색이 됨) 위에서는 단색과 구분이 안 됨 |
| Material 3 state layers | 호버 .08 · 포커스 .10 · 누름 .10 · 끌기 .16 · 선택 .12 · 비활성 .38 |
| Apple HIG system fills | 회색 채움 4단계, 다크는 투명도를 더 높게 |

**알파 램프** (`--kt-{neutral|ember|sun}-a{50~900}`, 계산 결과 30색 × 2테마 모두 기준 바탕 위에서 단색과 차이 0)

| 램프 | 테마 | a50 | a100 | a200 | a300 | a400 | a500 | a600 | a700 | a800 | a900 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| neutral (stone · graphite) | light | `rgba(79,59,0,0.051)` | `rgba(38,26,2,0.083)` | `rgba(70,50,2,0.146)` | `rgba(41,30,0,0.271)` | `rgba(34,21,1,0.393)` | `rgba(26,16,0,0.506)` | `rgba(23,15,0,0.62)` | `rgba(17,11,0,0.738)` | `rgba(11,7,0,0.844)` | `rgba(8,4,0,0.942)` |
| neutral (stone · graphite) | dark | `rgba(0,0,0,0)` | `rgba(199,223,251,0.043)` | `rgba(189,214,253,0.085)` | `rgba(197,220,253,0.136)` | `rgba(212,230,255,0.287)` | `rgba(219,231,255,0.452)` | `rgba(221,233,255,0.625)` | `rgba(233,241,255,0.735)` | `rgba(243,246,255,0.849)` | `rgba(250,251,255,0.967)` |
| ember | light | `rgba(255,123,2,0.091)` | `rgba(255,108,1,0.197)` | `rgba(255,91,0,0.33)` | `rgba(255,85,0,0.483)` | `rgba(255,79,0,0.648)` | `rgba(255,83,0,0.867)` | `rgba(211,65,0,0.989)` | `rgba(165,34,0,0.902)` | `rgba(122,20,0,0.895)` | `rgba(82,11,0,0.902)` |
| ember | dark | `rgba(255,122,76,0.12)` | `rgba(255,120,71,0.207)` | `rgba(255,117,62,0.36)` | `rgba(255,112,52,0.583)` | `rgba(255,108,43,0.786)` | `rgba(255,106,34,1)` | `rgba(255,141,90,1)` | `rgba(255,173,132,1)` | `rgba(255,200,169,1)` | `rgba(255,226,205,1)` |
| sun | light | `rgba(255,181,2,0.095)` | `rgba(255,168,0,0.208)` | `rgba(255,163,1,0.346)` | `rgba(255,161,0,0.479)` | `rgba(255,161,0,0.597)` | `rgba(255,164,0,0.722)` | `rgba(217,130,0,0.797)` | `rgba(171,101,0,0.832)` | `rgba(129,76,0,0.867)` | `rgba(94,54,0,0.902)` |
| sun | dark | `rgba(253,201,112,0.096)` | `rgba(255,195,106,0.182)` | `rgba(255,195,97,0.331)` | `rgba(255,191,87,0.554)` | `rgba(255,190,78,0.773)` | `rgba(255,189,71,1)` | `rgba(255,199,103,1)` | `rgba(255,216,150,1)` | `rgba(255,232,191,1)` | `rgba(255,248,231,1)` |


**중립 채움 · 덮개**

| 토큰 | 다크 | 라이트 | 쓰임 |
|---|---|---|---|
| `--kt-fill-1` | `rgba(242,243,247,.16)` | `rgba(28,22,12,.12)` | 눌린 · 선택된 회색 면, 꺼진 스위치 |
| `--kt-fill-2` | `rgba(242,243,247,.12)` | `rgba(28,22,12,.08)` | 회색 버튼 · 칩 |
| `--kt-fill-3` | `rgba(242,243,247,.08)` | `rgba(28,22,12,.05)` | 입력 · 세그먼트 바깥 |
| `--kt-fill-4` | `rgba(242,243,247,.05)` | `rgba(28,22,12,.03)` | 아주 옅은 면 |
| `--kt-overlay-hover` | `rgba(242,243,247,.06)` | `rgba(28,22,12,.05)` | 옅은 면 위 호버 덮개 |
| `--kt-overlay-press` | `rgba(242,243,247,.10)` | `rgba(28,22,12,.09)` | 눌림 |
| `--kt-overlay-solid-hover` | `rgba(13,14,18,.10)` | `rgba(255,255,255,.12)` | 색 있는 면(메인 · 포인트 버튼) 위 호버 |
| `--kt-accent-tint` | `rgba(255,106,34,.14)` | `rgba(211,67,3,.10)` | 포인트 옅은 면 · 선택 배경 |
| `--kt-accent-tint-strong` | `rgba(255,106,34,.22)` | `rgba(211,67,3,.16)` | 약한 포인트 버튼 면 |
| `--kt-accent-line` | `rgba(255,106,34,.45)` | `rgba(211,67,3,.36)` | 틴트 위 테두리 |
| `--kt-accent-glow` | `rgba(255,106,34,.38)` | `rgba(255,106,34,.28)` | 움직임의 빛(후광 · 트레일) |
| `--kt-line-alpha` | `rgba(242,243,247,.10)` | `rgba(28,22,12,.10)` | 다른 면 위 구분선 · 카드 링 |

라이트 덮개의 기준색 `rgb(28,22,12)` 는 데모 라이트 그림자에 이미 쓰는 따뜻한 잉크, 다크 덮개의 기준색은 본문 글자 `#f2f3f7` 입니다 — 회색 덮개가 테마 온도를 따라갑니다.

---

## 6. 대비 검증 (WCAG 2.x, 자동 계산)

| 검사 | 글자 | 바탕 | 대비 | 기준 | 결과 |
|---|---|---|---|---|---|
| light fg-strong / bg-surface | `#16130f` | `#ffffff` | 18.52:1 | 4.5 | 통과 |
| light fg-strong / bg-page | `#16130f` | `#f6f5f2` | 16.98:1 | 4.5 | 통과 |
| light fg-default / bg-surface | `#312e28` | `#ffffff` | 13.53:1 | 4.5 | 통과 |
| light fg-default / bg-page | `#312e28` | `#f6f5f2` | 12.41:1 | 4.5 | 통과 |
| light fg-subtle / bg-surface | `#4f4b43` | `#ffffff` | 8.68:1 | 4.5 | 통과 |
| light fg-subtle / bg-page | `#4f4b43` | `#f6f5f2` | 7.96:1 | 4.5 | 통과 |
| light fg-muted / bg-surface | `#6f6a61` | `#ffffff` | 5.37:1 | 4.5 | 통과 |
| light fg-muted / bg-page | `#6f6a61` | `#f6f5f2` | 4.93:1 | 4.5 | 통과 |
| light accent-text / bg-surface | `#ae3819` | `#ffffff` | 6.21:1 | 4.5 | 통과 |
| light accent-text / bg-page | `#ae3819` | `#f6f5f2` | 5.7:1 | 4.5 | 통과 |
| light highlight-text / bg-surface | `#926422` | `#ffffff` | 5.16:1 | 4.5 | 통과 |
| light highlight-text / bg-page | `#926422` | `#f6f5f2` | 4.73:1 | 4.5 | 통과 |
| light info-text / bg-surface | `#1b64da` | `#ffffff` | 5.41:1 | 4.5 | 통과 |
| light info-text / bg-page | `#1b64da` | `#f6f5f2` | 4.96:1 | 4.5 | 통과 |
| light positive-text / bg-surface | `#007a36` | `#ffffff` | 5.47:1 | 4.5 | 통과 |
| light positive-text / bg-page | `#007a36` | `#f6f5f2` | 5.02:1 | 4.5 | 통과 |
| light negative-text / bg-surface | `#c81e5a` | `#ffffff` | 5.54:1 | 4.5 | 통과 |
| light negative-text / bg-page | `#c81e5a` | `#f6f5f2` | 5.08:1 | 4.5 | 통과 |
| light attention-text / bg-surface | `#9c5c00` | `#ffffff` | 5.32:1 | 4.5 | 통과 |
| light attention-text / bg-page | `#9c5c00` | `#f6f5f2` | 4.88:1 | 4.5 | 통과 |
| light fg-muted / bg-canvas | `#6f6a61` | `#edecea` | 4.55:1 | 4.5 | 통과 |
| light fg-faint / bg-surface (보조) | `#8b867e` | `#ffffff` | 3.62:1 | 3.0 | 통과 |
| light primary-on / primary-solid | `#ffffff` | `#16130f` | 18.52:1 | 4.5 | 통과 |
| light accent-on / accent-solid | `#ffffff` | `#d34303` | 4.59:1 | 3.0 | 통과 |
| light accent-on / accent-solid-hc | `#ffffff` | `#ae3819` | 6.21:1 | 4.5 | 통과 |
| light accent-solid / bg-page (UI 윤곽) | `#d34303` | `#f6f5f2` | 4.21:1 | 3.0 | 통과 |
| dark fg-strong / bg-surface | `#f2f3f7` | `#15171c` | 16.17:1 | 4.5 | 통과 |
| dark fg-strong / bg-page | `#f2f3f7` | `#0d0e12` | 17.4:1 | 4.5 | 통과 |
| dark fg-default / bg-surface | `#d0d3db` | `#15171c` | 11.97:1 | 4.5 | 통과 |
| dark fg-default / bg-page | `#d0d3db` | `#0d0e12` | 12.88:1 | 4.5 | 통과 |
| dark fg-subtle / bg-surface | `#afb5c0` | `#15171c` | 8.7:1 | 4.5 | 통과 |
| dark fg-subtle / bg-page | `#afb5c0` | `#0d0e12` | 9.36:1 | 4.5 | 통과 |
| dark fg-muted / bg-surface | `#8f97a6` | `#15171c` | 6.1:1 | 4.5 | 통과 |
| dark fg-muted / bg-page | `#8f97a6` | `#0d0e12` | 6.56:1 | 4.5 | 통과 |
| dark accent-text / bg-surface | `#ff8d5a` | `#15171c` | 7.86:1 | 4.5 | 통과 |
| dark accent-text / bg-page | `#ff8d5a` | `#0d0e12` | 8.46:1 | 4.5 | 통과 |
| dark highlight-text / bg-surface | `#ffc767` | `#15171c` | 11.63:1 | 4.5 | 통과 |
| dark highlight-text / bg-page | `#ffc767` | `#0d0e12` | 12.51:1 | 4.5 | 통과 |
| dark info-text / bg-surface | `#449bff` | `#15171c` | 6.3:1 | 4.5 | 통과 |
| dark info-text / bg-page | `#449bff` | `#0d0e12` | 6.78:1 | 4.5 | 통과 |
| dark positive-text / bg-surface | `#29CF73` | `#15171c` | 8.77:1 | 4.5 | 통과 |
| dark positive-text / bg-page | `#29CF73` | `#0d0e12` | 9.43:1 | 4.5 | 통과 |
| dark negative-text / bg-surface | `#ff6b8a` | `#15171c` | 6.59:1 | 4.5 | 통과 |
| dark negative-text / bg-page | `#ff6b8a` | `#0d0e12` | 7.09:1 | 4.5 | 통과 |
| dark attention-text / bg-surface | `#ffb134` | `#15171c` | 9.9:1 | 4.5 | 통과 |
| dark attention-text / bg-page | `#ffb134` | `#0d0e12` | 10.65:1 | 4.5 | 통과 |
| dark fg-muted / bg-canvas | `#8f97a6` | `#111217` | 6.36:1 | 4.5 | 통과 |
| dark fg-faint / bg-surface (보조) | `#6a707d` | `#15171c` | 3.61:1 | 3.0 | 통과 |
| dark primary-on / primary-solid | `#0d0e12` | `#f2f3f7` | 17.4:1 | 4.5 | 통과 |
| dark accent-on / accent-solid | `#0d0e12` | `#ff6a22` | 6.74:1 | 3.0 | 통과 |
| dark accent-on / accent-solid-hc | `#0d0e12` | `#ff6a22` | 6.74:1 | 4.5 | 통과 |
| dark accent-solid / bg-page (UI 윤곽) | `#ff6a22` | `#0d0e12` | 6.74:1 | 3.0 | 통과 |


> 모두 통과합니다. 라이트 포인트 버튼(흰 글자 / `#d34303`)이 4.59:1 이라 크기 예외 규칙이 없습니다. 더 강한 대비가 필요한 화면은 `accent-solid-hc`(`#ae3819`). `fg-faint` 는 3:1 기준의 보조 정보(자리표시 · 메타)에만 씁니다.

---

## 7. 서체 · 타이포

| 토큰 | 값 | 쓰임 |
|---|---|---|
| `--kt-font-sans` | `"Wanted Sans Variable", "Wanted Sans", Pretendard, Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif` | 본문 · 제목 (데모와 같음) |
| `--kt-font-mono` | `"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace` | 코드 · 옵션 이름 · 숫자 라벨 · eyebrow |

- 자간: 제목 -0.02em, 본문 -0.01em, 모노 0. 한글은 `word-break: keep-all` + `overflow-wrap: anywhere`.
- 코드 · `data-kt-*` 속성 이름은 항상 모노. 데모 카드 제목의 모듈 이름도 모노 라벨로 붙입니다.
- 크기 · 행간은 기반과 같습니다:

#### 디스플레이 타이포 (반응형)
| 토큰 | ≥1600 | ≤1599 | ≤1439 | ≤1023 | ≤767 | 행간 | 굵기 | 자간 | 쓰임 |
|---|---|---|---|---|---|---|---|---|---|
| `display-xl` | 80 | 64 | 56 | 48 | 44 | 1.2 | 700 | -0.02em | 히어로 슬로건 |
| `display-lg` | 64 | 52 | 48 | 48 | 36 | 1.28 | 700 | -0.02em | 섹션 대제목 |
| `display-md` | 56 | 48 | 36 | 28 | 28 | 1.28 | 700 | -0.02em | 섹션 제목 |
| `heading-xl` | 48 | 40 | 40 | 32 | 28 | 1.4 | 700 | -0.02em | 블록 제목 |
| `heading-lg` | 40 | 32 | 32 | 28 | 28 | 1.4 | 700 | -0.02em | 블록 제목(작게) |
| `heading-md` | 32 | 28 | 24 | 22 | 22 | 1.4 | 700 | -0.02em | 카드 큰 제목 |
| `heading-sm` | 24 | 20 | 20 | 18 | 18 | 1.48 | 700 | -0.02em | 카드 제목 |

#### UI 타이포 (고정)
| 토큰 | 크기 | 행간 | 굵기 | 자간 | 쓰임 |
|---|---|---|---|---|---|
| `--kt-text-title-lg` | 22px | 28px | 700 | -0.02em | 모달·시트 제목 |
| `--kt-text-title-md` | 20px | 28px | 700 | -0.02em | 카드 제목 |
| `--kt-text-title-sm` | 18px | 24px | 700 | -0.02em | 목록 제목 |
| `--kt-text-label-lg` | 17px | 22px | 600 | -0.02em | 큰 버튼 |
| `--kt-text-label-md` | 16px | 21px | 600 | -0.02em | 버튼·탭 |
| `--kt-text-label-sm` | 15px | 20px | 500 | -0.02em | 칩·작은 버튼 |
| `--kt-text-label-xs` | 14px | 19px | 500 | -0.02em | 태그·보조 버튼 |
| `--kt-text-body-lg` | 18px | 29px | 400 | -0.02em | 랜딩 본문 |
| `--kt-text-body-md` | 16px | 26px | 400 | -0.02em | 기본 본문 |
| `--kt-text-body-sm` | 15px | 24px | 400 | -0.02em | 촘촘한 본문 |
| `--kt-text-body-xs` | 14px | 22px | 400 | -0.01em | 보조 본문 |
| `--kt-text-caption-lg` | 13px | 18px | 500 | -0.01em | 캡션 |
| `--kt-text-caption-md` | 12px | 16px | 500 | -0.01em | 메타 |
| `--kt-text-caption-sm` | 11px | 14px | 500 | 0 | 아주 작은 메타 |
| `--kt-text-overline` | 13px | 16px | 500 | 0 | 모노 라벨(eyebrow) — mono 서체 |


---

## 8. 크기 · 밀도 · 화면 등급 (기반과 같음)

```
실제 크기 = 크기 단계(data-size: xsm~xlg) × 입력 장치 밀도(mouse / touch / compact — `data-kt-density` 로 강제) × 화면 배율(루트 글자 100~125%)
```

- 같은 MD 라도 마우스 40px · 터치 44px · 촘촘 32px. 자동 판정은 `@media (pointer: coarse)` — Kineto 의 호버 판단 `canHover()` 와 같은 원칙(장치가 아니라 입력 정밀도로 판단).
- 기기 픽셀 비율(DPR)은 크기를 바꾸지 않습니다. 고밀도 화면에서는 0.5px 헤어라인(`--kt-hairline`).
- 1920 · 2560 · 3200px 이상에서는 루트 글자가 106.25 · 112.5 · 125% 로 커져 모든 rem 이 비례 확대(끄기: `data-kt-scale="fixed"`).

#### 컴포넌트 크기 XSM~XLG (`--kt-size-{속성}-{크기}`) — 입력 장치별
같은 `data-size="md"` 라도 마우스(fine)·터치(coarse)·촘촘(compact)에서 실제 값이 다릅니다. 모두 rem 이라 고해상도 배율(아래)도 함께 적용됩니다.

| 속성 | 뜻 | 밀도 | XSM | SM | MD | LG | XLG |
|---|---|---|---|---|---|---|---|
| `h` | 컨트롤 높이 | 마우스 | 28 | 32 | 40 | 48 | 56 |
| `h` | 컨트롤 높이 | 터치 | 32 | 36 | 44 | 52 | 60 |
| `h` | 컨트롤 높이 | 촘촘 | 24 | 28 | 32 | 40 | 48 |
| `px` | 좌우 안쪽 여백 | 마우스 | 8 | 12 | 16 | 20 | 24 |
| `px` | 좌우 안쪽 여백 | 터치 | 10 | 12 | 16 | 20 | 24 |
| `px` | 좌우 안쪽 여백 | 촘촘 | 6 | 8 | 12 | 16 | 20 |
| `gap` | 아이콘↔글자 간격 | 마우스 | 4 | 6 | 6 | 8 | 8 |
| `gap` | 아이콘↔글자 간격 | 터치 | 4 | 6 | 8 | 8 | 10 |
| `gap` | 아이콘↔글자 간격 | 촘촘 | 4 | 4 | 6 | 6 | 8 |
| `font` | 글자 크기 | 마우스 | 12 | 14 | 15 | 16 | 18 |
| `font` | 글자 크기 | 터치 | 13 | 14 | 16 | 17 | 18 |
| `font` | 글자 크기 | 촘촘 | 12 | 13 | 14 | 15 | 16 |
| `lh` | 행간 | 마우스 | 16 | 20 | 22 | 24 | 26 |
| `lh` | 행간 | 터치 | 18 | 20 | 22 | 24 | 26 |
| `lh` | 행간 | 촘촘 | 16 | 18 | 20 | 22 | 24 |
| `icon` | 아이콘 크기 | 마우스 | 14 | 16 | 18 | 20 | 24 |
| `icon` | 아이콘 크기 | 터치 | 16 | 16 | 20 | 22 | 24 |
| `icon` | 아이콘 크기 | 촘촘 | 12 | 14 | 16 | 18 | 20 |
| `radius` | 모서리 | 마우스 | 6 | 8 | 10 | 12 | 16 |
| `radius` | 모서리 | 터치 | 6 | 8 | 12 | 14 | 16 |
| `radius` | 모서리 | 촘촘 | 4 | 6 | 8 | 10 | 12 |

#### 화면 등급 (tier) · 루트 배율
| 등급 | 폭(px) | 루트 글자 | 1rem 실제 | 쓰임 |
|---|---|---|---|---|
| `mo` | 0–767 | 100% | 16px | 휴대폰 |
| `ta` | 768–1023 | 100% | 16px | 태블릿·작은 노트북 |
| `pc` | 1024–1439 | 100% | 16px | 노트북 |
| `pcl` | 1440–1919 | 100% | 16px | 데스크톱 |
| `hd` | 1920–2559 | 106.25% | 17px | FHD 모니터 |
| `qhd` | 2560–3199 | 112.5% | 18px | QHD 모니터 |
| `uhd` | 3200+ | 125% | 20px | 4K 모니터 |

#### 등급별 레이아웃 간격 (px, 루트 배율 적용 전)
| 토큰 | 뜻 | mo | ta | pc | pcl | hd | qhd | uhd |
|---|---|---|---|---|---|---|---|---|
| `--kt-gutter` | 페이지 좌우 여백 | 20 | 32 | 48 | 108 | 160 | 160 | 160 |
| `--kt-section` | 섹션 위아래 간격 | 72 | 96 | 120 | 140 | 160 | 160 | 160 |
| `--kt-grid-gap` | 카드 그리드 간격 | 12 | 16 | 20 | 24 | 24 | 24 | 24 |
| `--kt-card-pad` | 카드 안쪽 여백 | 20 | 20 | 24 | 28 | 32 | 32 | 32 |
| `--kt-stack-xsm` | 붙어 있는 요소(아이콘·배지) | 4 | 4 | 4 | 4 | 4 | 4 | 4 |
| `--kt-stack-sm` | 같은 덩어리(제목↔부제) | 8 | 8 | 8 | 12 | 12 | 12 | 12 |
| `--kt-stack-md` | 관련 요소(입력↔도움말, 문단 사이) | 12 | 16 | 16 | 20 | 20 | 20 | 20 |
| `--kt-stack-lg` | 블록 사이(제목 블록↔본문) | 24 | 24 | 32 | 40 | 40 | 40 | 40 |
| `--kt-stack-xlg` | 큰 블록 사이(섹션 안 그룹) | 40 | 48 | 56 | 64 | 72 | 72 | 72 |
| `--kt-header-h` | 헤더 높이 | 56 | 60 | 64 | 64 | 64 | 64 | 64 |


---

## 9. 간격 · 반경 · 면 (간격 · 반경은 기반과 같음)

#### 간격 별칭
| 별칭 | none | 4xs | 3xs | 2xs | xs | sm | md | lg | xl | 2xl | 3xl | 4xl | 5xl | 6xl | 7xl | 8xl |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| px | 0 | 2 | 4 | 6 | 8 | 12 | 16 | 20 | 24 | 32 | 40 | 48 | 64 | 80 | 120 | 160 |

#### 반경
| 별칭 | none | 2xs | xs | sm | md | lg | xl | 2xl | 3xl | 4xl | full |
|---|---|---|---|---|---|---|---|---|---|---|---|
| px | 0 | 4 | 6 | 8 | 12 | 16 | 20 | 24 | 32 | 40 | 999 |


- 데모의 현재 간격 척도 `--sp-1~16`(4 · 8 · 12 · 16 · 20 · 24 · 32 · 48 · 64)은 위 척도의 부분집합이라 그대로 호환됩니다(12장).
- 데모 카드 반경 `--r-card: 14px`, 무대 `--r-stage: 10px` 는 이 척도 밖입니다 → 옮길 때 카드 `lg`(16) · 무대 `md`(12) 로 맞추는 것을 권합니다(눈으로 비교 후 결정).

**면 · 그림자 (Kineto 판)**

| 토큰 | 다크 | 라이트 |
|---|---|---|
| `--kt-shadow-sm` | `inset 0 1px 0 rgba(255,255,255,.03), 0 4px 12px rgba(0,0,0,.25)` | `0 1px 2px rgba(28,22,12,.05), 0 4px 12px rgba(28,22,12,.05)` |
| `--kt-shadow-md` | `inset 0 1px 0 rgba(255,255,255,.03), 0 14px 40px rgba(0,0,0,.35)` (= 데모 `--shadow`) | `0 1px 2px rgba(28,22,12,.05), 0 12px 34px rgba(28,22,12,.07)` (= 데모 라이트 `--shadow`) |
| `--kt-shadow-lg` | `inset 0 1px 0 rgba(255,255,255,.05), 0 22px 60px rgba(0,0,0,.5)` (= 데모 `--shadow-hover`) | `0 2px 4px rgba(28,22,12,.06), 0 20px 50px rgba(28,22,12,.11)` |
| `--kt-glass` | `color-mix(in srgb, #15171c 70%, transparent)` + `blur(20px) saturate(1.4)` | `color-mix(in srgb, #ffffff 75%, transparent)` + 같은 blur |

---

## 10. 모션

기반 시스템의 모션 토큰과 같습니다. Kineto 옵션(`data-kt-ease`, `data-kt-duration`)에는 **리터럴**을 넣습니다(JS 가 읽는 옵션이라 `var()` 를 해석하지 않음).

#### 모션
| 지속 | instant | fast | quick | base | moderate | slow | slower | cinematic |
|---|---|---|---|---|---|---|---|---|
| ms | 100 | 150 | 200 | 300 | 400 | 500 | 800 | 1000 |

| 이징 | 값 | 쓰임 |
|---|---|---|
| `--kt-ease-standard` | `cubic-bezier(.33,0,.2,1)` | UI 상태 전환 기본 |
| `--kt-ease-enter` | `cubic-bezier(.25,.46,.45,.94)` | 목록·아코디언·등장 |
| `--kt-ease-exit` | `cubic-bezier(.32,0,.67,0)` | 사라짐 |
| `--kt-ease-move` | `cubic-bezier(.65,0,.35,1)` | 위치 이동 |
| `--kt-ease-emphasized` | `cubic-bezier(.37,.31,0,1)` | 제목 블러 등장(1s) |
| `--kt-ease-expo` | `cubic-bezier(.16,1,.3,1)` | 큰 요소가 길게 감속 |
| `--kt-ease-sharp` | `cubic-bezier(.6,0,0,.6)` | 짧은 대칭 전환(.2~.4s) |
| `--kt-ease-menu` | `cubic-bezier(.44,0,.56,1)` | 드롭다운 항목 |
| `--kt-ease-spring` | `cubic-bezier(.34,1.56,.64,1)` | 살짝 튕김 |
| `--kt-ease-spring-strong` | `cubic-bezier(.45,1.8,.57,.92)` | 팝·넛지 |
| `--kt-ease-linear` | `linear` | 진행 표시·스크롤 동기 |


| 토큰 | `data-kt-ease` 에 넣는 값 |
|---|---|
| standard | `cubic-bezier(.33,0,.2,1)` |
| enter | `cubic-bezier(.25,.46,.45,.94)` |
| exit | `cubic-bezier(.32,0,.67,0)` |
| emphasized | `cubic-bezier(.37,.31,0,1)` |
| expo | `cubic-bezier(.16,1,.3,1)` |
| spring | `cubic-bezier(.34,1.56,.64,1)` 또는 물리 스프링 `spring(200, 30)` |

안무 규칙: 들어올 때 길게 · 나갈 때 짧게(300/200), UI 상태는 150~300ms, 연출 등장은 500~1000ms, 순차 간격 항목 50 · 줄 100 · 카드 80~120ms, 총 1.2초 이하, 동시에 움직이는 덩어리는 하나, 블러는 등장에만(최대 16px), 바꾸는 속성은 transform · opacity · filter · clip-path. 데모는 "효과를 보여 주는 무대"이므로 **데모 UI(헤더 · 설정창 · 카드 틀)는 조용하게**(standard · 200ms), 효과만 크게 움직이게 합니다.

---

## 11. 컴포넌트 규칙 (요약)

| 컴포넌트 | 규칙 |
|---|---|
| 버튼 | 메인 = `primary-solid`/`primary-on`, 포인트 = `accent-solid`/`accent-on`, 약하게 = `accent-tint-strong` + `accent-text`, 중립 = `fill-2`. 크기 `data-size`, 글자 넘침은 말줄임(글자 span 에 `min-width: 0`) |
| 칩 · 세그먼트 · 탭 | 선택 = 메인 색. 굵기가 바뀌어도 폭 고정(`::after` 에 굵은 글자 미리 자리) |
| 스위치 | 꺼짐 `fill-1` → 켜짐 Ember. 손잡이 `spring` 300ms |
| 입력 | 테두리 `line-strong` → 포커스 메인 색 2px(안쪽 여백 1px 줄여 크기 유지) → 오류 `negative-text` |
| 카드 | 다크 `bg-surface` + `shadow-sm`(위쪽 흰 선), 라이트 흰 면 + `line-alpha` 링. 데모 카드는 효과가 주인공이므로 장식 그림자 최소 |
| 아코디언 | 오른쪽 꺾쇠는 **20~22px 아이콘 + 32px 이상 누름 영역**, 열리면 180° 회전 + 아이콘 면이 메인 색으로. 제목은 줄바꿈 허용, 아이콘은 줄지 않음 |
| 토스트 · 떠 있는 막대 | 최대 폭 = 화면 − 좌우 여백, 문장은 최대 2~3줄, 버튼은 줄지 않고 가운데 고정 |
| 코드 블록 | `bg-canvas` + 모노, 옵션 이름은 `accent-text`, 값은 `fg-default` |
| 커서 | 페이지 커서 = Ember 점 + Ember 링(`--kt-accent-solid`, 지금 데모 `var(--accent)` 자리), 움직이는 동안만 `--kt-accent-glow` 후광 |
| 포커스 링 | `line-focus`(Ember) 2px, offset 2px — 키보드 입력일 때만 |

---

## 12. 데모 변수 대응표 (옮길 때)

| 지금 `demo/styles.css` | 이 문서 | 비고 |
|---|---|---|
| `--bg` | `--kt-bg-page` | 같은 값 |
| `--panel` | `--kt-bg-surface` | 같은 값 |
| `--panel2` | `--kt-bg-raised` (다크) / `--kt-bg-canvas` (라이트) | 다크 `#1c1f26` 같음, 라이트 `#edecea` 같음 |
| `--text` | `--kt-fg-strong` | 같은 값 |
| `--muted` | `--kt-fg-muted` | 같은 값 |
| `--line` | `--kt-line-default` | 같은 값 |
| `--accent` | `--kt-accent-solid` | **값이 바뀜**: 다크 `#ff5b1c` → `#ff6a22`, 라이트 `#e14e12` → `#d34303` (Ember 2). 다크 포인트 버튼 글자는 흰색 → 잉크 |
| `--accent2` | `--kt-highlight` | **값이 바뀜**: `#ffd166` → `#ffbd47`(Sun). 라이트 글자는 `--kt-highlight-text` `#926422` (데모 `#c99516` 은 글자로 쓰면 대비 부족) |
| `--shadow` / `--shadow-hover` | `--kt-shadow-md` / `--kt-shadow-lg` | 같은 값 |
| `--sp-1~16` | `--kt-space-*` | 부분집합 |
| `--r-card` 14 / `--r-stage` 10 | `--kt-radius-lg` 16 / `--kt-radius-md` 12 | 값이 다름 — 눈으로 확인 후 |
| `html.light` | `[data-kt-theme="light"]` | 옮기는 동안 둘 다 같은 블록에 걸면 호환 |
| `.u-amber { color: #ffd166 }` | `color: var(--kt-highlight-text)` | 하드코딩 제거 |
| (없음) | `--kt-accent-glow` · `--kt-gradient-brand` | 새로 생김 — 커서 후광 · 워드마크 |

옮기는 순서 제안: ① 13장 블록을 `demo/styles.css` 맨 위에 추가하고 옛 변수를 새 토큰의 별칭으로(`--bg: var(--kt-bg-page)`) → ② 화면이 같은지 데모 QA → ③ 사용처를 새 이름으로 바꾸고 별칭 제거. 각 단계가 따로 커밋 · PR 이어야 시각 회귀를 찾기 쉽습니다.

---

## 13. 복사용 토큰 블록 (색 · 서체 · 기본 크기)

```css
/* Kineto design tokens — dark first. Values: docs/design-system.md §3–§9 */
:root {
  color-scheme: dark;
  --kt-bg-page: #0d0e12; --kt-bg-canvas: #111217; --kt-bg-surface: #15171c; --kt-bg-raised: #1c1f26; --kt-bg-float: #21242c; --kt-bg-inverse: #f2f3f7; --kt-fg-strong: #f2f3f7; --kt-fg-default: #d0d3db; --kt-fg-subtle: #afb5c0; --kt-fg-muted: #8f97a6; --kt-fg-faint: #6a707d; --kt-fg-inverse: #0d0e12; --kt-line-subtle: #1c1f26; --kt-line-default: #262a32; --kt-line-strong: #464c56; --kt-primary-solid: #f2f3f7; --kt-primary-on: #0d0e12; --kt-accent-solid: #ff6a22; --kt-accent-glow: rgba(255,106,34,.38); --kt-accent-solid-hc: #ff6a22; --kt-accent-on: #0d0e12; --kt-accent-text: #ff8d5a; --kt-highlight: #ffbd47; --kt-highlight-text: #ffc767; --kt-info-text: #449bff; --kt-positive-text: #29CF73; --kt-negative-text: #ff6b8a; --kt-attention-text: #ffb134; --kt-line-focus: #ff6a22;
  --kt-neutral-a50: rgba(0,0,0,0); --kt-neutral-a100: rgba(199,223,251,0.043); --kt-neutral-a200: rgba(189,214,253,0.085); --kt-neutral-a300: rgba(197,220,253,0.136); --kt-neutral-a400: rgba(212,230,255,0.287); --kt-neutral-a500: rgba(219,231,255,0.452); --kt-neutral-a600: rgba(221,233,255,0.625); --kt-neutral-a700: rgba(233,241,255,0.735); --kt-neutral-a800: rgba(243,246,255,0.849); --kt-neutral-a900: rgba(250,251,255,0.967);
  --kt-ember-a50: rgba(255,122,76,0.12); --kt-ember-a100: rgba(255,120,71,0.207); --kt-ember-a200: rgba(255,117,62,0.36); --kt-ember-a300: rgba(255,112,52,0.583); --kt-ember-a400: rgba(255,108,43,0.786); --kt-ember-a500: rgba(255,106,34,1); --kt-ember-a600: rgba(255,141,90,1); --kt-ember-a700: rgba(255,173,132,1); --kt-ember-a800: rgba(255,200,169,1); --kt-ember-a900: rgba(255,226,205,1);
  --kt-sun-a50: rgba(253,201,112,0.096); --kt-sun-a100: rgba(255,195,106,0.182); --kt-sun-a200: rgba(255,195,97,0.331); --kt-sun-a300: rgba(255,191,87,0.554); --kt-sun-a400: rgba(255,190,78,0.773); --kt-sun-a500: rgba(255,189,71,1); --kt-sun-a600: rgba(255,199,103,1); --kt-sun-a700: rgba(255,216,150,1); --kt-sun-a800: rgba(255,232,191,1); --kt-sun-a900: rgba(255,248,231,1);
  --kt-fill-1: rgba(242,243,247,.16); --kt-fill-2: rgba(242,243,247,.12); --kt-fill-3: rgba(242,243,247,.08); --kt-fill-4: rgba(242,243,247,.05);
  --kt-overlay-hover: rgba(242,243,247,.06); --kt-overlay-press: rgba(242,243,247,.10); --kt-overlay-solid-hover: rgba(13,14,18,.10); --kt-accent-tint: rgba(255,106,34,.14); --kt-accent-tint-strong: rgba(255,106,34,.22); --kt-accent-line: rgba(255,106,34,.45); --kt-line-alpha: rgba(242,243,247,.10); --kt-gradient-brand: linear-gradient(120deg, #ff6a22 0%, #ffbd47 100%); --kt-shadow-sm: inset 0 1px 0 rgba(255,255,255,.03), 0 4px 12px rgba(0,0,0,.25); --kt-shadow-md: inset 0 1px 0 rgba(255,255,255,.03), 0 14px 40px rgba(0,0,0,.35); --kt-shadow-lg: inset 0 1px 0 rgba(255,255,255,.05), 0 22px 60px rgba(0,0,0,.5);
  --kt-font-sans: "Wanted Sans Variable", "Wanted Sans", Pretendard, Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --kt-font-mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --kt-hairline: 1px;
  --kt-ease-standard: cubic-bezier(.33,0,.2,1); --kt-ease-enter: cubic-bezier(.25,.46,.45,.94); --kt-ease-exit: cubic-bezier(.32,0,.67,0);
  --kt-ease-emphasized: cubic-bezier(.37,.31,0,1); --kt-ease-expo: cubic-bezier(.16,1,.3,1); --kt-ease-spring: cubic-bezier(.34,1.56,.64,1);
  --kt-duration-fast: 150ms; --kt-duration-quick: 200ms; --kt-duration-base: 300ms; --kt-duration-slow: 500ms; --kt-duration-slower: 800ms; --kt-duration-cinematic: 1000ms;
}
[data-kt-theme="light"], html.light {
  color-scheme: light;
  --kt-bg-page: #f6f5f2; --kt-bg-canvas: #edecea; --kt-bg-surface: #ffffff; --kt-bg-raised: #ffffff; --kt-bg-float: #ffffff; --kt-bg-inverse: #16130f; --kt-fg-strong: #16130f; --kt-fg-default: #312e28; --kt-fg-subtle: #4f4b43; --kt-fg-muted: #6f6a61; --kt-fg-faint: #8b867e; --kt-fg-inverse: #ffffff; --kt-line-subtle: #edecea; --kt-line-default: #e4e1da; --kt-line-strong: #c5c2ba; --kt-primary-solid: #16130f; --kt-primary-on: #ffffff; --kt-accent-solid: #d34303; --kt-accent-glow: rgba(255,106,34,.28); --kt-accent-solid-hc: #ae3819; --kt-accent-on: #ffffff; --kt-accent-text: #ae3819; --kt-highlight: #ffbd47; --kt-highlight-text: #926422; --kt-info-text: #1b64da; --kt-positive-text: #007a36; --kt-negative-text: #c81e5a; --kt-attention-text: #9c5c00; --kt-line-focus: #d34303;
  --kt-neutral-a50: rgba(79,59,0,0.051); --kt-neutral-a100: rgba(38,26,2,0.083); --kt-neutral-a200: rgba(70,50,2,0.146); --kt-neutral-a300: rgba(41,30,0,0.271); --kt-neutral-a400: rgba(34,21,1,0.393); --kt-neutral-a500: rgba(26,16,0,0.506); --kt-neutral-a600: rgba(23,15,0,0.62); --kt-neutral-a700: rgba(17,11,0,0.738); --kt-neutral-a800: rgba(11,7,0,0.844); --kt-neutral-a900: rgba(8,4,0,0.942);
  --kt-ember-a50: rgba(255,123,2,0.091); --kt-ember-a100: rgba(255,108,1,0.197); --kt-ember-a200: rgba(255,91,0,0.33); --kt-ember-a300: rgba(255,85,0,0.483); --kt-ember-a400: rgba(255,79,0,0.648); --kt-ember-a500: rgba(255,83,0,0.867); --kt-ember-a600: rgba(211,65,0,0.989); --kt-ember-a700: rgba(165,34,0,0.902); --kt-ember-a800: rgba(122,20,0,0.895); --kt-ember-a900: rgba(82,11,0,0.902);
  --kt-sun-a50: rgba(255,181,2,0.095); --kt-sun-a100: rgba(255,168,0,0.208); --kt-sun-a200: rgba(255,163,1,0.346); --kt-sun-a300: rgba(255,161,0,0.479); --kt-sun-a400: rgba(255,161,0,0.597); --kt-sun-a500: rgba(255,164,0,0.722); --kt-sun-a600: rgba(217,130,0,0.797); --kt-sun-a700: rgba(171,101,0,0.832); --kt-sun-a800: rgba(129,76,0,0.867); --kt-sun-a900: rgba(94,54,0,0.902);
  --kt-fill-1: rgba(28,22,12,.12); --kt-fill-2: rgba(28,22,12,.08); --kt-fill-3: rgba(28,22,12,.05); --kt-fill-4: rgba(28,22,12,.03);
  --kt-overlay-hover: rgba(28,22,12,.05); --kt-overlay-press: rgba(28,22,12,.09); --kt-overlay-solid-hover: rgba(255,255,255,.12); --kt-accent-tint: rgba(211,67,3,.10); --kt-accent-tint-strong: rgba(211,67,3,.16); --kt-accent-line: rgba(211,67,3,.36); --kt-line-alpha: rgba(28,22,12,.10); --kt-gradient-brand: linear-gradient(120deg, #d34303 0%, #e19b34 100%); --kt-shadow-sm: 0 1px 2px rgba(28,22,12,.05), 0 4px 12px rgba(28,22,12,.05); --kt-shadow-md: 0 1px 2px rgba(28,22,12,.05), 0 12px 34px rgba(28,22,12,.07); --kt-shadow-lg: 0 2px 4px rgba(28,22,12,.06), 0 20px 50px rgba(28,22,12,.11);
}
@media (min-resolution: 2dppx) { :root { --kt-hairline: 0.5px; } }
@media (prefers-reduced-motion: reduce) { :root { --kt-duration-fast: 1ms; --kt-duration-quick: 1ms; --kt-duration-base: 1ms; --kt-duration-slow: 1ms; --kt-duration-slower: 1ms; --kt-duration-cinematic: 1ms; } }
```

크기(`--kt-size-*`) · 화면 등급(`--kt-gutter` 등) 블록은 8장 표의 값을 같은 방식으로 씁니다(마우스 기본 → `@media (pointer: coarse)` 터치 → `[data-kt-density="compact"]`, rem 출력, 1920 · 2560 · 3200px 루트 배율).

---

## 14. 적용 순서 · 유지보수

1. 이 문서는 **제안**입니다. 데모에 옮기는 작업은 별도 브랜치 · PR 로(12장 순서), 데모 QA(`npm run test:demo`, Chromium 레인 전체 — 데모 레이아웃 · 시작 코드를 바꾸면 필수)를 통과해야 합니다.
2. 라이브러리 모듈 · `kineto.features.json` 기본값에는 넣지 않습니다. 모듈의 색 옵션 기본값은 지금처럼 "작성자 페이지의 색을 따름"을 유지합니다(디자인 시스템 중립 — 연동 가이드의 원칙).
3. 색을 바꿀 때는 기준점(데모 값)을 먼저 바꾸고, 램프 · 알파 · 대비를 다시 계산해 이 문서의 표를 함께 고칩니다. 대비가 기준 아래로 내려가면 단계를 조정합니다(4.5:1 본문, 3:1 큰 글자 · UI 윤곽).
4. 회사 · 제품 이름을 이 문서에 넣지 않습니다(저장소 문서 규칙).
5. 데모 주황을 Ember 2 로 바꾸는 것은 소유자의 리브랜딩 결정(2026-10-16)입니다. "데모 브랜드 색을 검정 · 회색으로 바꾸지 않음" 규칙은 그대로 — 주황 계열은 유지됩니다.
