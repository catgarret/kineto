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

## 클릭 이미지와 스프라이트

`clickImage`는 GIF, APNG, animated WebP를 클릭하거나 탭한 좌표에서 매번
첫 프레임부터 한 번 재생합니다. 같은 출처 이미지 또는 CORS 읽기가 허용된
이미지는 다운로드한 바이트의 반복 메타데이터를 1회로 바꾼 뒤 클릭마다
새 Blob URL로 재생합니다. 동시에 여러 번 클릭해도 각각 독립 재생하며,
`destroy()`는 대기 중인 요청, 이미지, 타이머, Blob URL을 모두 정리합니다.
`clickImageDuration`을 생략하거나 `0`으로 설정하면 파일의 프레임 지연을 합산해 한 사이클이
끝날 시간을 계산합니다(최소 700ms, 마지막 프레임 여유 80ms). 직접 지정한
값은 이미지 로드가 완료된 시점부터 적용되며, 원본 사이클보다 짧으면
도중에 제거됩니다. 바이트 요청은 15초 뒤 중단하고 원본 이미지로 대체하며,
이미지 로드에도 별도로 15초 제한을 적용합니다.

```js
const cursor = Kineto.cursor('.click-area', {
  type: 'dot',
  clickImage: '/motion/click.apng', // .gif, .webp도 지원
  clickImageSize: 120
  // clickImageDuration: 1200 // 필요할 때만 표시 시간을 직접 지정
});
```

1회 재생 처리는 각 포맷의 컨테이너 규칙을 따릅니다.

- APNG는 W3C PNG 명세의 `acTL.num_plays`를 `1`로 쓰고 해당 chunk CRC를
  다시 계산합니다. [PNG 3rd Edition — acTL](https://www.w3.org/TR/png-3/#11acTL)
- animated WebP는 `ANIM` chunk의 little-endian `Loop Count`를 `1`로
  씁니다. [WebP Image Format — ANIM](https://www.rfc-editor.org/rfc/rfc9649.html#section-2.5.2)
- GIF89a 자체에는 반복 횟수 필드가 없으므로 `NETSCAPE2.0` 또는
  `ANIMEXTS1.0` Application Extension만 제거하고 프레임 데이터는
  유지합니다. [GIF89a — Application Extension](https://www.w3.org/Graphics/GIF/spec-gif89a.txt)

교차 출처 서버가 CORS 읽기를 허용하지 않거나 CSP가 Blob 이미지를 막으면
브라우저가 원본 `<img>`를 표시하도록 대체됩니다. 이 경우 Kineto가 파일
내부 반복 횟수를 바꿀 수는 없고 `clickImageDuration` 뒤에 이미지를
제거합니다. 완전한 1회 재생이 필요하면 같은 출처에 두거나 응답에 적절한
`Access-Control-Allow-Origin`을 설정하고 CSP의 `img-src`에서 `blob:`을
허용하세요. 파일을 읽지 못하면 생략한 표시 시간은 700ms를 사용합니다.

가로 스프라이트 시트는 `clickSprite`를 사용합니다. 정사각 프레임은
이미지 크기로 자동 추론하며 `clickSpriteWidth`, `clickSpriteHeight`,
`clickSpriteFrames`, `clickSpriteDuration`으로 덮어쓸 수 있습니다.
CSS `steps()` 애니메이션은 한 번만 실행하고 마지막 프레임에서 멈춥니다.
2프레임 이상은 `steps(프레임 수, jump-none)`으로 전체 시간을 프레임 수만큼
균등하게 나누며, 한 프레임 시트는 그대로 유지합니다.
[CSS Easing — Step easing functions](https://www.w3.org/TR/css-easing-1/#step-easing-functions)
`clickSprite`와 `clickImage`를 함께 지정하면 `clickSprite`를 우선합니다.
