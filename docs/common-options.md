# 공통 옵션과 데이터 속성

모든 옵션이 모든 모듈에 적용되는 것은 아닙니다. 아래는 여러 모듈이 공유하는 이름과 변환 규칙이며, 실제 기본값은 각 모듈 문서와 소스를 기준으로 합니다.

## 모션 옵션

| 옵션 | 일반적인 타입 | 의미 |
|---|---|---|
| `duration` | number | 모션 시간(초) |
| `delay` | number | 시작 지연(초) |
| `ease` | string | GSAP easing |
| `stagger` | number/object | 자식 또는 분할 텍스트의 순차 간격 |
| `speed` | number | 모듈별 이동량·문자 속도·흐름 속도 |
| `onComplete` | function | 완료 콜백 |

## 스크롤 옵션

| 옵션 | 일반적인 타입 | 의미 |
|---|---|---|
| `start` | string | ScrollTrigger 시작 위치 |
| `end` | string | ScrollTrigger 종료 위치 |
| `scrub` | boolean/number | 스크롤 진행률 연동 |
| `once` | boolean | 모듈이 지원할 때 1회 재생 여부 |
| `onUpdate` | function | 진행률 변경 콜백 |

각 모듈은 서로 다른 기본 `start`, `end`, `scrub` 값을 가질 수 있습니다.

## data 속성 변환

```html
<div
  data-kt-reveal="fade-up"
  data-kt-duration="0.8"
  data-kt-once="false"
  data-kt-stagger='{"each":0.08,"from":"center"}'
></div>
```

| HTML 값 | JS 값 |
|---|---|
| 빈 문자열 / `"true"` | `true` |
| `"false"` | `false` |
| `"12"`, `"0.5"` | number |
| `"{...}"`, `"[...]"` | JSON parse 결과 |
| 그 외 | string |

모듈 활성화 속성 자체의 값은 `preset`으로 읽습니다. 예를 들어 `data-kt-reveal="fade-up"`은 `{ preset: 'fade-up' }`과 같습니다.

## 반환값

```js
const one = Kineto.reveal('#hero', { preset: 'fade-up' });
const many = Kineto.reveal('.card', { preset: 'fade-up' });
```

- 일치 요소 1개: 인스턴스
- 일치 요소 여러 개: 인스턴스 배열
- 일치 요소 없음/지원 환경 아님: `null`

정규화된 인스턴스는 `pause`, `resume`, `destroy`를 가집니다. 모듈에 따라 `replay`, `next`, `previous`, `navigate` 같은 추가 메서드가 있을 수 있습니다.
