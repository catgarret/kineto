# shuffle

해결되지 않은 글자를 무작위 문자로 바꾸다가 왼쪽부터 정확한 목표 문자열로 정착시키는 decode 효과입니다.

```html
<h2 data-kt-shuffle data-kt-speed="32" data-kt-reveal-rate="2">
  DECRYPTING SIGNAL
</h2>
<button type="button" onclick="Kineto.replay('[data-kt-shuffle]', 'shuffle')">Replay</button>
```

| 옵션 | 설명 |
|---|---|
| `text` | 목표 문자열. 없으면 원래 textContent |
| `speed` | decode tick 간격(ms) |
| `revealRate` | 몇 tick마다 한 글자를 확정할지 |
| `chars` | unresolved 글자에 사용할 문자 집합 |
| `threshold`, `rootMargin` | viewport 시작 조건 |
| `onComplete` | 정확한 목표 문자열로 끝난 뒤 호출 |

`replay()`는 원래 목표 문자열을 보존한 채 처음부터 다시 decode합니다. unresolved 글자가 실제로 변하지 않거나 최종 문자열이 달라지면 버그입니다. reduced-motion에서는 목표 문자열을 즉시 표시합니다.
