# canvasEffect

직접 만든 Canvas 2D·WebGL·프래그먼트 셰이더 효과를 요소 **뒤에** 그리는 실행
호스트입니다. Kineto는 인터랙티브 배경·파티클·셰이더 같은 "효과 자체"를 싣지
않습니다. 그런 효과를 새로 짤 때마다 — 특히 AI에게 맡길 때마다 — 매번 다시
만들고 매번 조금씩 틀리는 부분을 대신 맡습니다.

| 호스트가 맡는 일 | 효과가 할 일 |
|---|---|
| 캔버스 삽입, 요소 크기에 맞춘 리사이즈, 픽셀 비율 상한(`maxDpr`) | 그리기 |
| 하나의 requestAnimationFrame 루프, 프레임 상한(`fps`), 멈추면 쉬는 루프 | 멈췄으면 `false` 반환 |
| 포인터·스크롤 신호(프레임마다 한 번 측정) | 읽기 |
| 화면 밖·숨은 탭 일시정지, 축소 모션의 정지 프레임, 품질 단계 | — |
| WebGL 컨텍스트 소실·복구, WebGL이 없을 때 요소 자신의 배경으로 대체 | — |
| `destroy()` 후 요소를 처음 모습 그대로 복원 | 필요하면 정리 |
| 셰이더: 컴파일, 전체 화면 삼각형, uniform 채우기 | GLSL 한 파일 |

## 한 번 정의하고, 이름으로 씁니다

```html
<div class="hero" data-kt-canvas-effect="shape-grid" data-kt-color2="#7a5cff">
  <h1>콘텐츠는 캔버스 위에 그대로 있습니다</h1>
</div>
<script src="https://cdn.jsdelivr.net/npm/@dong-gri/kineto/dist/kineto.umd.min.js"></script>
<script src="./effects/shape-grid.js"></script>
```

```js
Kineto.defineCanvasEffect('shape-grid', {
  context: '2d',
  options: { color: '#3a3f4b', color2: '#ff5b1c', size: 28, strength: 1 },
  setup(api) { return { cells: [] }; },      // 반환값이 api.state가 됩니다
  resize(api) { /* api.width·api.height에 맞춰 격자를 다시 만듭니다 */ },
  frame(api) {
    const { ctx, dpr, width, height, pointer, options } = api;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    // …그리기…
    return pointer.active;                   // 움직임이 없으면 false → 루프가 쉽니다
  }
});
```

- 효과 정의 스크립트가 Kineto보다 **나중에** 로드되어도 됩니다. 이름으로 요청했지만
  아직 정의가 없던 요소는, 정의되는 순간 자동으로 시작합니다.
- JavaScript에서는 `Kineto.canvasEffect(el, { effect: 'shape-grid', size: 40 })`.
  `effect`에는 **등록된 이름만** 넘깁니다. 정의 객체는 받지 않습니다 — 아래 보안 참고.
- React·Vue: `<Motion type="canvasEffect" options={{ effect: 'shape-grid' }} />`,
  `useKineto('canvasEffect', { effect: 'shape-grid' })`.
- 요소 자체가 `<canvas>`면 그 캔버스에 바로 그립니다. 이때 캔버스에 CSS 크기를
  주세요(`width:100%; height:100%` 등). 그 외 요소에는 캔버스를 첫 자식으로 넣고,
  요소를 `position: relative`(static일 때만)·`isolation: isolate`로 만들어 캔버스가
  `z-index: -1`로 콘텐츠 뒤에 머물게 합니다. 캔버스는 요소의 padding box를 채웁니다.

## 정의 (definition)

| 키 | 필수 | 설명 |
|---|---|---|
| `context` | — | `'2d'`(기본) · `'webgl'` · `'webgl2'`. `fragment`가 있으면 기본 `'webgl'` |
| `options` | — | 효과가 읽는 **모든** 옵션과 기본값. 여기 없는 옵션은 효과에 전달되지 않습니다 |
| `setup(api)` | — | 한 번. 반환값이 `api.state` |
| `resize(api)` | — | 크기가 바뀔 때와 옵션이 바뀔 때마다. 옵션에서 파생되는 배치(격자 등)를 여기서 |
| `frame(api)` | `fragment`가 없으면 필수 | 매 프레임. `false`를 반환하면 입력·리사이즈·업데이트가 깨울 때까지 쉽니다 |
| `destroy(api)` | — | 인스턴스가 사라질 때 한 번 |
| `fragment` | — | WebGL1 GLSL 문자열. 주면 호스트가 셰이더 쪽을 전부 맡습니다 |
| `uniforms(api)` | — | 셰이더에 추가로 넘길 uniform `{ uName: 값 }` |

옵션은 **기본값의 타입으로** 변환됩니다. 숫자 기본값에 `"abc"`가 오면 기본값으로
돌아가고, 같은 요소에 붙은 다른 모듈의 `data-kt-*` 옵션은 효과에 새어 들어가지
않습니다.

### api

| 필드 | 뜻 |
|---|---|
| `ctx` / `gl` | 2D 컨텍스트 / WebGL 컨텍스트(WebGL일 때만 `gl`) |
| `canvas`, `el` | 그리는 캔버스와 호스트 요소 |
| `width`, `height` | CSS px 크기 |
| `dpr` | 상한이 적용된 픽셀 비율. 2D는 `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` 후 CSS px로 그립니다 |
| `time`, `delta`, `frame` | 경과 초(일시정지 동안은 멈춤), 이번 프레임 간격(초, 최대 1/15), 프레임 수 |
| `pointer` | `{ x, y, nx, ny, vx, vy, inside, down, active }` — 요소 기준 CSS px, 0~1 비율, 속도(px/s) |
| `scroll` | `{ progress, velocity }` — 요소가 화면 아래에서 들어와(0) 위로 나갈 때(1)까지, 스크롤 속도 |
| `options`, `state` | 변환된 옵션, 효과 자신의 데이터 |
| `quality` | `'low'` · `'medium'` · `'high'` — 낮으면 입자·셀·옥타브를 줄이세요 |
| `reducedMotion` | `true`면 정지 프레임 한 장만 그립니다 |
| `color(css)` | CSS 색 → `[r, g, b, a]`(0~1). `var(--token)`도 요소 기준으로 풉니다 |
| `wake()` | 쉬고 있는 루프를 다시 깨웁니다(타이머 등 외부 신호) |

## 셰이더 효과

`fragment`만 주면 됩니다. 호스트가 전체 화면 삼각형을 그리고 아래 uniform을 채웁니다
(쓰는 것만 선언).

```glsl
uniform float uTime;        // 초
uniform vec2  uResolution;  // 캔버스 크기(device px)
uniform vec2  uPointer;     // 0~1, y는 위쪽이 1
uniform float uPointerDown; // 누르는 동안 1
uniform float uScroll;      // 0~1
```

**옵션도 uniform이 됩니다.** 이름은 `u` + PascalCase: 숫자 → `float`, 불리언 →
`float` 0/1, 색 문자열 → `vec3`, 숫자 2~4개 배열 → `vec2`~`vec4`.
`options: { speed: 1, color: '#ff5b1c' }` → `uniform float uSpeed; uniform vec3 uColor;`.

`void mainImage(out vec4 fragColor, in vec2 fragCoord)`만 있고 `main`이 없는
Shadertoy 형식 코드는 자동으로 감싸고 `iTime`·`iResolution`·`iMouse`를 채웁니다.
단, **Shadertoy 셰이더의 기본 라이선스는 CC BY-NC-SA 3.0**으로 상업적 사용을
막습니다. 복사하기 전에 각 셰이더의 라이선스를 확인하세요.

## 공용 옵션 어휘

효과는 어떤 옵션 이름이든 선언할 수 있지만, 아래 이름은 모든 효과에서 같은 뜻입니다.
마크업·데모 설정창·AI가 쓴 효과가 같은 말을 하게 하려는 약속입니다.

| 옵션 | 뜻 |
|---|---|
| `color` · `color2` | 주 색 · 보조 색 |
| `background` | 캔버스를 지우는 색 (`transparent`면 요소 배경이 비칩니다) |
| `speed` | 속도 (1 = 효과 본래 속도) |
| `density` | 촘촘함 (셀·입자·띠의 수나 비율) |
| `size` | 하나의 크기 (CSS px) |
| `strength` | 포인터 반응 세기 (0 = 반응 없음) |
| `distortion` | 휨·일그러짐 정도 (0 = 없음) |

효과가 선언하지 않은 어휘 옵션을 페이지가 붙이면 콘솔에 한 번 알려 줍니다(오타나
효과를 잘못 고른 경우가 대부분입니다). 데모 설정창은 효과가 실제로 읽는 옵션만
보여 줍니다 — `Kineto.listCanvasEffects()`가 각 효과의 옵션을 알려 줍니다.

## 호스트 옵션

| 옵션 | 기본 | 설명 |
|---|---|---|
| `effect` (또는 속성 값) | — | 등록된 효과 이름, JS에서는 정의 객체도 가능 |
| `quality` | `auto` | `low`(DPR 1·30fps) · `medium`(1.5·60fps) · `high`(2·디스플레이). `auto`는 저사양·절약 모드에서 low, 터치·중급 기기에서 medium |
| `maxDpr` | 품질 단계 | 픽셀 비율 상한 (0.5~4) |
| `fps` | 품질 단계 | 프레임 상한, 0 = 디스플레이 주사율 |
| `pointer` | `host` | `host`(요소 위) · `window`(페이지 전체 — 콘텐츠 뒤에 깔린 고정 배경) · `none` |
| `scroll` | `true` | `false`면 스크롤 신호와 스크롤 깨우기를 끕니다 |
| `pauseOffscreen` | `true` | `false`면 화면 밖에서도 계속 그립니다(항상 보이는 고정 배경) |
| `reducedMotion` | — | `'run'`이면 축소 모션에서도 움직입니다. 기본은 정지 프레임 한 장 |
| `onError(error, el)` | — | 효과가 오류로 멈췄을 때 |

## 상태와 대체

- 요소에 `kt-canvas-effect` 클래스가 붙고, 상황에 따라 `is-still`(축소 모션),
  `is-unsupported`(이 브라우저에 WebGL이 없음), `is-failed`(효과가 오류로 멈춤)가
  붙습니다. 뒤의 둘에서는 캔버스가 숨고 **요소 자신의 CSS 배경**이 보이므로, 셰이더
  효과를 쓰는 요소에는 비슷한 그라디언트를 CSS로 주세요.
- 효과 코드의 오류는 그 효과만 멈추고 콘솔에 알립니다. 페이지의 다른 효과는 계속
  움직입니다.
- `instance.update(patch)` / `Kineto.updateModule()`로 옵션을 바꾸면 인스턴스를
  다시 만들지 않고 `resize(api)`가 다시 불립니다. 다른 효과로 바꾸면 재생성합니다.
- `instance.redraw()`는 바깥에서 `api.state`를 바꾼 뒤 한 프레임을 다시 그립니다.

## 보안

효과 정의는 **코드**이므로 페이지 자신의 스크립트만 `Kineto.defineCanvasEffect()`로
등록할 수 있습니다. 마크업은 등록된 효과의 **이름만** 가리킬 수 있고, 속성에서 읽은 어떤
값도 컴파일·실행·요청되지 않습니다. `data-kt-*` 값은 JSON으로 해석되므로, `effect`
자리에 객체(예: `{"fragment": "…"}`)가 오면 호스트는 경고만 남기고 시작하지 않습니다. CMS나 사용자 입력이 만든 마크업이 이 모듈을 통해 코드를 실행할 수 없습니다.
호스트는 네트워크 요청을 하지 않습니다.

## 성능

- 멈춘 효과는 프레임을 요청하지 않습니다(`frame()`이 `false`). 입력·리사이즈·옵션
  변경만 깨웁니다.
- 화면 밖에서는 코어가 멈추고, 돌아오면 다시 시작합니다. 숨은 탭도 같습니다.
- 한 화면에 여러 개를 동시에 띄우지 마세요. 특히 WebGL 컨텍스트는 브라우저마다
  동시에 쓸 수 있는 수가 제한되어 있습니다(보통 8~16개). `destroy()`는 컨텍스트를
  즉시 반납합니다.

## 레시피

데모에서 쓰는 두 효과는 그대로 복사해 쓸 수 있는 독립 파일입니다.

- [`demo/effects/shape-grid.js`](../../demo/effects/shape-grid.js) — Canvas 2D.
  포인터 주변 도형이 커지고 돌며 색이 변하고, 멈추면 루프가 쉽니다.
- [`demo/effects/flow-gradient.js`](../../demo/effects/flow-gradient.js) — WebGL
  셰이더. 노이즈로 휘는 두 색의 흐름, 포인터가 끌어당기고 스크롤이 흐름을 옮깁니다.

## AI에게 효과 만들기를 맡길 때

React 컴포넌트가 아니라 **효과 정의 하나**를 받으세요. 캔버스·루프·리사이즈·포인터·
일시정지를 AI가 매번 다시 짜지 않게 되고, 결과는 바로 Vanilla·React·Vue 어디서나
같은 방식으로 붙습니다. 복사할 프롬프트는
[AI-PROMPT-GUIDE.md의 Canvas effects](../../AI-PROMPT-GUIDE.md#canvas-effects-react-bitsstyle-backgrounds)에
있고, 데모의 **AI로 효과 만들기** 카드도 같은 블록을 복사합니다. 프롬프트 아래에
원하는 효과(모양, 움직임, 포인터·스크롤 반응, 참고 링크)를 적으면 됩니다.
