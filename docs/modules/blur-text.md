# blurText

글자가 흐린 상태에서 차례로 선명해지는 텍스트 등장 효과입니다.

```html
<h2 data-kt-blur-text data-kt-duration="0.6" data-kt-stagger="0.03">첫 번째 줄<br>두 번째 줄</h2>
```

```js
const title = document.querySelector('.title');
title.textContent = '첫 번째 줄\n두 번째 줄';
const motion = Kineto.blurText(title, { duration: 0.6, stagger: 0.03 });
```

`<br>`, 실제 줄바꿈 문자 `\n`, Windows 줄바꿈 `\r\n`은 애니메이션과
`replay()`에서 모두 유지됩니다. 문자열에 HTML 태그를 넣는 옵션은 없으며,
DOM에 작성한 텍스트를 사용합니다.

| 옵션 | 기본값 | 동작 |
|---|---|---|
| `duration` | `0.6` | 글자별 전환 시간(초) |
| `stagger` | `0.03` | 글자 간 시작 간격(초) |
| `ease` | `power2.out` | GSAP 경로의 easing |
| `start` | `top 85%` | GSAP ScrollTrigger 시작 위치 |
| `once` | `true` | `false`이면 GSAP 경로에서 재진입·역재생 |
| `onComplete` | 없음 | 등장 완료 콜백 |

GSAP이 없는 환경에서는 CSS 전환과 viewport 감지로 등장합니다.
`prefers-reduced-motion`에서는 애니메이션 없이 내용과 줄바꿈을 표시하고
작성자의 inline markup을 유지합니다. 일반 애니메이션은 텍스트를 글자
span으로 나누므로 `<em>` 같은 inline markup의 표현은 유지하지 않습니다.

`destroy()`는 원래 HTML·ARIA와 모듈이 변경한 inline style을 복원합니다.
