# textTransition

여러 텍스트 또는 자식 item을 안정된 높이의 container 안에서 순환합니다.

| 효과 | 동작 |
|---|---|
| `slide` | 기존 item이 나가고 다음 item이 이동해 들어옴 |
| `blur` | blur/opacity 전환 |
| `scale` | scale/opacity 전환 |
| `fade` | opacity 전환 |
| `clip` | clip 기반 전환 |

```html
<div data-kt-text-transition="slide" data-kt-hold="1200" data-kt-loop="true">
  <span>Design</span>
  <span>Motion</span>
  <span>Automation</span>
</div>
```

```js
const transition = Kineto.textTransition('.roles', {
  effect: 'blur',
  duration: 0.45,
  hold: 1200
});

transition.next();
transition.replay(); // 첫 item으로 돌아가 재생
console.log(transition.index);
```

container는 item 높이를 측정해 전환 중 레이아웃이 무너지지 않게 합니다. `index`는 현재 item을 반영하는 live getter이며, `next()`와 `replay()`가 공개 lifecycle입니다.
