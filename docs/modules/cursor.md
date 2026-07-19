# cursor

페이지 또는 특정 영역에 적용하는 커스텀 커서입니다.

| type | 동작 |
|---|---|
| `dot` | 작은 점 |
| `ring` | dot + follower ring |
| `blob` | 부드러운 면 형태 |
| `crosshair` | 십자형 |
| `image` | 사용자 이미지 |
| `custom` | `template` 기반 사용자 HTML |

```html
<section
  data-kt-cursor="ring"
  data-kt-color="#4d6bff"
  data-kt-follower-size="42"
  data-kt-hover-scale="1.8"
>
  <button data-kt-cursor-label="OPEN">Hover</button>
</section>
```

```js
Kineto.cursor(document.body, {
  type: 'custom',
  template: '<span class="my-cursor">VIEW</span>',
  smoothing: 0.16,
  pressScale: 0.82,
  hiddenSelector: 'input, textarea'
});
```

색상, 크기, border, blur, shadow, mix-blend-mode, hover label/background/scale, press scale, follower on/off와 custom callbacks를 조절할 수 있습니다. 터치 또는 hover 없는 환경, reduced-motion에서는 fallback을 사용합니다.
