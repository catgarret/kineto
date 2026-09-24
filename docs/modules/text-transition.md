# textTransition

여러 텍스트 또는 자식 item을 한 자리에서 차례로 바꿔 보여 줍니다. 보이는 텍스트는
언제나 일반 흐름 안의 실제 노드 하나이므로(겹쳐 쌓거나 높이를 재지 않음) 전환 중에도
비어 보이지 않습니다. 애니메이션은 Web Animations API만 쓰며 외부 엔진이 필요 없습니다.

| 효과 | 동작 |
|---|---|
| `slide-up` (기본) | 아래에서 올라오며 나타나고 위로 빠지며 사라짐 |
| `flip` | 평면 밖으로 도는 rotateX (상자 밖은 잘림) |
| `rise` | 잘린 상자 안에서 한 줄 높이만큼 올라옴 |
| `fade` | 불투명도만 바뀜 |
| `blur` | 흐림에서 선명해짐 — `blur`로 흐림 정도(px) |
| `scale` | 작게 들어와 크게 나감 — `startScale`·`endScale` |
| `clip` | 가로 clip-path 와이프 |
| `dissolve` | 글자마다 계단식으로 깜빡이며 흔들림 — `jitter`로 흔들림 폭(px) |
| `shimmer` | 멈춘 글자 위를 그라디언트가 지나감 — `baseColor`·`shimColor`·`shimSpeed` |
| `pop` | 글자마다 튀어 올라 살짝 넘쳤다가 제자리에 섬 (아래 참고) |

```html
<div data-kt-text-transition="slide-up" data-kt-hold="1200" data-kt-loop="true">
  <span>Design</span>
  <span>Motion</span>
  <span>Automation</span>
</div>
```

```js
const transition = Kineto.textTransition('.roles', {
  effect: 'blur',
  blur: 16,
  duration: 0.45,
  hold: 1200
});

transition.next();
transition.replay(); // 첫 item으로 돌아가 재생
console.log(transition.index);
```

`index`는 현재 item을 반영하는 live getter이며, `next()`와 `replay()`가 공개 lifecycle입니다.
`charMode: true`이면 글자마다 차례로(`stagger`, `charDirection`: `ltr`·`rtl`·`random`) 전환하고,
`dissolve`와 `pop`은 원래 글자 단위라 켜지 않아도 그렇게 동작합니다. 글자는 단어 상자로 묶여
좁은 칸에서도 단어 중간에서 줄이 바뀌지 않습니다. 조절값(`blur`·`startScale`·`endScale`)은
인스턴스마다 따로 적용되어, 한 페이지에 값이 다른 전환이 여러 개 있어도 서로 섞이지 않습니다.

## `pop` — 스프링으로 튀어 오르는 글자

제목이 바뀔 때 글자가 하나씩 아래에서 작게 기울어진 채 튀어 올라, 조금 넘쳤다가 제자리에
서는 입장입니다. 이전 텍스트는 짧은 페이드 한 번으로 사라져서 새 텍스트의 입장이 보이게 됩니다.

```html
<h2 data-kt-text-transition="pop" data-kt-pause="1400">
  <span>01 Kinetic</span>
  <span>02 Spring</span>
  <span>03 Motion</span>
</h2>
```

- **시작 상태:** 불투명도 0, `translateY(.4em)`, `scale(.4)`, `rotate(-15deg)`.
- **곡선:** 감쇠비 0.5의 스프링(흔히 “stiffness 100 / damping 10”이라 부르는 느낌)을 keyframe으로
  샘플링해 linear로 재생합니다. 그래서 세 엔진이 같은 곡선을 그리고, 약 10 % 넘친 뒤(`scale` 1.1,
  `+2.4deg`) 멈춥니다. 불투명도는 1을 넘지 않습니다.
- **시간:** `duration`은 스프링이 자리 잡는 시간입니다. 주지 않으면 1초, `stagger`는 0.02초입니다.
  `ease`는 쓰지 않습니다(곡선이 스프링이기 때문입니다).
- **축소 모션:** 첫 텍스트만 정지 상태로 보여 줍니다.
