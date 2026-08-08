# counter

숫자 애니메이션과 실시간 시계를 여섯 가지 방식으로 표시합니다. `circular`는 Counter가 아니라 [Loader](loader.md)입니다.

| 모드 | 동작 | 기본 |
|---|---|---|
| `slot` | 세로 숫자 릴이 최종 자릿수에 도착 | ✓ |
| `plain` | 실제 수치가 시작값에서 목표값까지 연속 증가 |  |
| `digit` | 위치 이동 없이 각 숫자가 0–9 글리프로 교체 |  |
| `pop` | **count-up 없이 최종 포맷 문자열**이 큰 상태에서 자릿수별로 정착 |  |
| `flip` | 숫자 상·하단이 분리되어 전광판처럼 접힘 |  |
| `clock` | 실시간 시계·카운트다운·경과 시간 |  |

## HTML

```html
<span data-kt-counter="slot" data-kt-to="95800" data-kt-format=",">0</span>
<span data-kt-counter="plain" data-kt-to="2389540" data-kt-format=",">0</span>
<span data-kt-counter="digit" data-kt-to="126540" data-kt-format="," data-kt-loops="2">0</span>
<span data-kt-counter="pop" data-kt-to="98760" data-kt-format="," data-kt-pop-scale="1.9">98,760</span>
<span data-kt-counter="flip" data-kt-to="365">0</span>
<span data-kt-counter="clock" data-kt-clock-style="flip" data-kt-seconds="true"></span>
<span data-kt-counter="clock" data-kt-seconds-only="true" data-kt-seconds-digits="3" data-kt-seconds-label="S" data-kt-since="2026-08-02T00:00:00Z"></span>
```

## Pop 동작 계약

`pop`은 카운트업 효과가 아닙니다. 예를 들어 목표가 `98,760`이면 DOM에는 처음부터 `98,760`의 각 글자가 존재하고, 중간 수치나 0–9 순환 없이 각 글자가 `scale(popScale)`에서 `scale(1)`로 `stagger` 간격을 두고 착지합니다. 콤마도 같은 리듬으로 등장하지만 숫자로 계산되지는 않습니다.

## 주요 옵션

| 옵션 | 기본값 | 설명 |
|---|---:|---|
| `mode` / `preset` / `style` | `slot` | 여섯 모드 |
| `from` | `0` | `plain` 시작값 |
| `to` | 요소 숫자 텍스트 | 목표값 |
| `duration` | `2` | 전체 재생 시간 기준 |
| `decimals` | `0` | 소수점 자리 수 |
| `format` | 빈 문자열 | `,`이면 자릿수 그룹핑 |
| `grouping` / `comma` | `false` | locale 그룹핑 활성화 |
| `separator` | 없음 | `,`이면 그룹핑 활성화 |
| `locale` | 브라우저 기본 | `Intl.NumberFormat` locale |
| `prefix` / `suffix` | 빈 문자열 | 접두사·접미사 |
| `loops` | 모드별 | `digit`/`slot` 반복 수 |
| `stagger` | 자동/모드별 | 자릿수별 시간차 |
| `popScale` | `1.8` | Pop 시작 크기 |
| `popDuration` | 자동 | 글자 하나의 착지 시간 |
| `lineHeight` | 계산값 | Slot 한 칸 높이 |
| `tileColor` / `tileTextColor` | 모드 기본값 | Flip 타일과 숫자 색 |
| `clockStyle` | `roll` | `roll`, `fade`, `instant`, `flip` |
| `seconds` / `hour12` | 모드 기본값 | 초 표시와 12시간제 |
| `secondsOnly` | `false` | Clock을 `000S` 같은 초 단위 표시로 전환 |
| `secondsDigits` / `secondsLabel` | `3` / `'S'` | 초 단위 표시의 최소 자릿수와 접미사 |
| `until` / `since` | 없음 | 카운트다운 목표 또는 경과 시간 기준. `secondsOnly:true`와 함께 각각 `000S` 남은 초·경과 초를 표시 |
| `start` | `top 85%` | ScrollTrigger 시작. `false`면 즉시 |
| `once` | `true` | 재진입 재생 정책 |

## 보장

- 수치 모드는 콤마/locale 그룹핑을 지원합니다.
- `digit`와 `pop`은 세로 reel을 만들지 않습니다.
- `pop`은 최종 문자열을 다른 숫자로 바꾸지 않습니다.
- `destroy()`는 원래 HTML, style, ARIA를 복원합니다.
- Clock의 `blink:true`는 시간 구분자만 깜빡이며, `secondsOnly`의 단위(`S`)에는 적용되지 않습니다.
- `secondsOnly:true`는 Clock 전용 표시입니다. 다른 `mode` 또는 `preset`이 함께 전달돼도 Clock 렌더러를 우선해 `000S` 형식을 유지합니다.
- `since`를 전달하면 경과 초를, `until`을 전달하면 남은 초를 표시합니다. 둘 다 전달된 경우 `until`(카운트다운)을 우선합니다.
