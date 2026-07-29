# Kineto Architecture

## 1. 설계 목표

Kineto는 새 애니메이션 엔진을 만들지 않습니다. 디자이너는 HTML
속성으로 시작하고, 개발자는 같은 기능을 JavaScript로 제어합니다.
GSAP, ScrollTrigger, Lenis와 브라우저 API는 하나의 인터페이스로
연결합니다.

핵심 목표는 다음 네 가지다.

1. **한 기능, 두 진입점**: `data-kt-*`와 `Kineto.<module>()`가 같은 옵션을 사용한다.
2. **수명주기 안전성**: 생성한 이벤트, observer, RAF, timer, GSAP 인스턴스, 생성 DOM을 `destroy()`에서 정리한다.
3. **중복 초기화 방지**: 같은 요소와 모듈 조합은 한 번만 활성화한다.
4. **기능 계약 보존**: 공개 모듈/API는 소스 코드보다 먼저 `kineto.features.json`으로 검증한다.

## 2. 계층

```text
HTML data-kt-* / JavaScript / Framework adapter
                     │
                     ▼
                Kineto Core
 registry · option parsing · instance records · environment · lifecycle
                     │
        ┌────────────┼─────────────┐
        ▼            ▼             ▼
 GSAP/ScrollTrigger  Lenis   Browser APIs/Canvas
        │            │             │
        └────────────┴─────────────┘
                     ▼
              Module instances
```

### `src/runtime.js`

- ESM 환경에서 GSAP와 ScrollTrigger를 가져옵니다.
- ScrollTrigger를 GSAP에 등록합니다.
- `setAnimationEngine()`으로 테스트나 외부 런타임이 엔진을 교체할 수 있습니다.

### `src/utils.js`

- 환경 감지, 옵션 변환, selector 정규화
- `lerp`, `clamp`, `segmentText`, 한글 조합 프레임
- GSAP/ScrollTrigger 접근 함수
- inline style snapshot과 observer helper

### `src/core.js`

- 모듈 레지스트리
- 요소별 활성 인스턴스 WeakMap
- 전체 인스턴스 Set
- 자동 스캔과 `data-kt-*` 옵션 읽기
- Lenis/visibility 서비스
- pause, resume, replay, destroy

### `src/modules/*.js`

각 파일은 하나의 공개 모듈입니다. 모듈이 소유한 리소스는 해당 인스턴스가 정리합니다.

## 3. 모듈 인터페이스

```js
export default {
  create(el, options, Kineto) {
    return {
      el,
      type: 'moduleName',
      pause() {},
      resume() {},
      destroy() {}
    };
  },

  reduced(el, options, Kineto) {},
  fallback(el, options, Kineto) {}
};
```

- `create`는 활성 인스턴스 또는 `null`을 반환합니다.
- `null`은 현재 장치/환경에서 의도적으로 비활성화되었음을 뜻할 수 있습니다.
- `reduced`는 reduced-motion 환경의 최종 또는 정적 표현입니다. 원래 DOM이나 속성을 건드리는 경우 정리 가능한 인스턴스를 반환해야 합니다.
- `fallback`은 low performance 환경의 대체 구현입니다. 원래 상태를 변경한다면 동일하게 정리 가능한 인스턴스를 반환합니다.
- 코어는 반환 객체를 정규화해 `pause`, `resume`, `destroy`가 항상 존재하게 하며 getter/setter descriptor도 보존합니다.

## 4. 인스턴스 레코드

```text
source element ──WeakMap──> Map(module name → record)
                                  │
                                  ├─ options
                                  ├─ normalized instance
                                  └─ original destroy implementation
```

`instance.destroy()`는 모듈의 정리 함수만 실행하는 것이 아니라 레코드도 함께 제거합니다. 이 결합이 없으면 이미 파괴된 인스턴스가 캐시에 남아 재초기화를 막습니다.

## 5. 자동 초기화

```html
<div data-kt-reveal="fade-up" data-kt-duration="0.8"></div>
```

```js
Kineto.autoInit();
```

1. 등록된 각 모듈 이름을 kebab-case 속성으로 변환합니다.
2. 일치하는 요소를 찾습니다.
3. 활성화 속성 값은 `preset`으로, 나머지 `data-kt-*`는 옵션으로 읽습니다.
   기존 공개 계약을 보존해야 하는 `radial`만 활성화 값을 `position`으로
   읽습니다.
4. 문자열은 boolean, number, JSON으로 안전하게 변환합니다.
5. 이미 활성화된 요소/모듈 조합은 기존 인스턴스를 반환합니다.

## 6. 전역 서비스

### Lenis

첫 모듈 생성 시 한 번만 초기화됩니다. `smooth: false` 또는 low performance 환경이면 건너뜁니다. GSAP ticker가 있으면 Lenis RAF를 ticker에 연결하고, 그렇지 않으면 독립 RAF를 사용합니다.

### Visibility

탭이 숨겨지면 모든 활성 인스턴스의 `pause()`, 다시 보이면 `resume()`을 호출합니다.

### ScrollTrigger

모듈이 각자의 trigger/tween을 소유합니다. 전역 `Kineto.refresh()`는 레이아웃 변경 후 ScrollTrigger refresh를 호출합니다.

> 이전 문서의 “모든 모듈이 단일 RAF를 공유한다”는 설명은 실제 구현과 달라 제거했습니다. RAF 기반 모듈은 각 인스턴스가 자신의 RAF를 소유하고 반드시 `destroy()`에서 해제합니다.

## 7. 기능 변경 규칙

공개 범위는 `kineto.features.json`입니다.

- Patch: 계약을 유지하는 버그 수정
- Minor: 기존 동작을 유지하는 opt-in 기능 추가
- Major: 이름, 옵션 의미, 기본값, 반환 구조 등 호환성 파괴

AI 또는 사람이 기능을 고칠 때 구현만 바꾸면 안 됩니다. 문서, 테스트, changelog가 같은 커밋에서 바뀌어야 합니다.

## 8. 빌드

### ESM

- 앱 번들러용
- GSAP/ScrollTrigger/Lenis를 외부 패키지로 사용
- named export와 default Kineto 제공

### UMD

- `<script>` 직접 사용용
- GSAP, ScrollTrigger, Lenis를 번들에 포함하지 않음
- 필요한 효과가 처음 사용될 때만 설정된 CDN 또는 페이지 전역 엔진을 사용
- 전역 `Kineto` 제공

### CSS

Vite가 `src/kineto.css`를 `dist/kineto.css`로 출력합니다.

## 9. 테스트 경계

`npm run verify`는 다음 실패를 차단합니다.

- 레지스트리에서 모듈이 사라지거나 계약에 없는 모듈/API가 추가됨
- named export 또는 코어 API 누락
- CSS/UMD 경로 불일치
- 브라우저 전역 미정의 참조
- 같은 모듈의 중복 인스턴스 생성
- 이전 옵션 또는 교체 옵션을 사용한 replay 실패
- unknown module이 대상을 변경함
- reduced-motion 정적 폴백이 원래 DOM을 복원하지 못함
- replay/destroy 실패
- 직접 destroy 후 stale record
- 테스트 종료 후 활성 인스턴스 누수

개별 모듈의 시각 품질과 제품별 레이아웃 적합성은 별도의 visual regression과 실제 콘텐츠 QA가 필요합니다.

## Variant capabilities — how the settings drawer knows what to offer

A module's variants often need something specific from the element: glitch's
`image`/`reveal`/`datamosh`/`crt`/`vcr` presets bail out without an `<img>`,
while `rgb`/`pixel`/`noise` operate on text. Offering all of them regardless is
how the playground ends up showing options that silently do nothing.

That knowledge lives in **one** place — `kineto.features.json`:

```jsonc
"variantCapabilities": {
  "any":   "No requirement — works on any element.",
  "image": "Needs an <img> (the element itself or a descendant).",
  "text":  "Needs rendered text and no image to operate on.",
  "video": "Needs a <video> element.",
  "items": "Needs two or more element children to sequence.",
  "track": "Needs a .kt-slider-track descendant for track-based slider effects."
},
"modules": [
  { "name": "glitch",
    "variants": ["rgb", "pixel", "image", "..."],
    "variantRequires": { "image": "image", "rgb": "text", "rgb-slice-burst": "any" } }
]
```

`npm run sync:options` mirrors every `variantRequires` block into
`demo/playground.js` as a generated `VARIANT_REQUIRES` constant, and the drawer
tests the requirement against the real target before it builds a variant select.
The demo holds **no** per-module list of its own.

### Adding a module or a variant

1. Add the variant to `variants` in the contract.
2. If it needs a capability, add one line to that module's `variantRequires`.
   Leave it out when the variant works anywhere — absent means `any`.
3. Run `npm run sync:options`.

Nothing in `demo/` needs editing. `tests/variant-capabilities.mjs` fails the
build if a rule names an unknown capability, points at a variant the module does
not declare, or if the generated block in the demo has drifted from the contract.

### Adding a capability

Add it to `variantCapabilities` with a real description, then teach
`targetSupports()` in `demo/playground.js` how to probe for it — that function is
the single place a capability name turns into a DOM test.

## Variant options — which controls a variant actually uses

Capabilities decide which *variants* to offer. A second question follows: given
the chosen variant, which of the module's options does it actually read? Glitch
publishes 25 public options, but `rgb` reads 12 and `rgb-slice-burst` reads 24 —
and they barely overlap. Showing all 25 either way is how the drawer ends up with
sliders that do nothing.

This is **derived, not authored**. `scripts/derive-variant-options.mjs` parses
each module with acorn and:

1. finds the variable the module funnels its variant through — the one assigned
   from `opts.preset` / `opts.effect` / `opts.type` / … with a string default,
   following re-derivations such as
   `const preset = type === 'digital' ? 'noise' : type`;
   candidates such as a secondary `opts.mode` are retained only when their
   compared labels overlap the variants declared by the contract;
2. records every `if` / `switch` / ternary that compares that variable against
   string literals, and the source range it guards;
3. attributes each `opts.X` read to the innermost guarded range it sits in. A
   read outside every variant branch is **common** and belongs to all variants;
4. follows single-option locals — `const channelOffset = Number(opts.channelOffset ?? 6)`
   read at the top of the factory and used only inside one branch is attributed
   to that branch, not to the common set. Without this step Glitch and Lazy came
   out as "no difference at all", because both read their options up front.

The result lands in each module's `variantOptions`:

```jsonc
{ "name": "glitch",
  "variantOptions": {
    "rgb":             ["blendMode", "colors", "delay", "duration", "…"],
    "rgb-slice-burst": ["artifactCount", "channelOffset", "seed", "…"]
  } }
```

`npm run sync:options` mirrors it into the demo as `VARIANT_OPTIONS`, and
`syncVisibility()` hides any field the active variant does not read.

The analysis is deliberately conservative: anything it cannot attribute stays in
the common set, so the failure mode is *one option too many*, never a usable
option disappearing. A table whose variants all come out identical is dropped
rather than written, so its presence always means the variants really differ.

### When you change a module

Run `npm run derive:variant-options` (it is part of `npm run build`).
`tests/variant-options.mjs` fails if the committed contract is stale, if an entry
names an option or variant that does not exist, if a variant is missing, or if the
generated demo block has drifted.

The old hand-written `WHEN` table in `demo/playground.js` still exists, but only
for **cross-option** dependencies that no variant analysis can express — "show
`tileColor` when `clockStyle` is `flip`". Per-variant support is no longer its
job; do not add entries for it there.

## 10. 모듈 연동 원칙

모든 모듈을 연결하는 전역 그래프는 만들지 않습니다. 같은 요소에 여러
모듈을 적용하는 기본 합성은 코어의 요소별 모듈 레코드가 담당하고,
명확한 사용 사례가 있으며 결합도가 낮은 연결만 모듈 API로 제공합니다.

현재 검증 대상은 다음 세 가지입니다.

- `slider.sync` / `syncTo()` — 메인 슬라이더와 썸네일처럼 인덱스를 공유
- `coverReveal.watch` / `refresh()` — 콘텐츠 변경 뒤 커버 구조를 다시 계산
- `loadingIndicator.trackPromise()` — 비동기 작업의 완료·오류를 상태와 연결

새 연결이 순환 의존성, 공개 API 복잡도, 번들 증가를 만들면 구현하지
않고 후보와 근거만 문서화합니다.

## 11. 패키징과 트리셰이킹

현재 단일 ESM/UMD/CSS 경로와 CDN 경로는 하위 호환성 계약입니다. 모듈별
엔트리는 단일 모듈 사용자의 전송량을 줄일 수 있지만, `exports`, 문서,
CDN URL, 패키지 크기 예산을 함께 바꿔야 합니다.

릴리스 직전에는 이 구조를 변경하지 않습니다. 측정값은
`scripts/bundle-size.mjs`에 남기고, 향후 minor 릴리스에서 다음을 함께
설계합니다.

1. 모듈별 ESM subpath와 기존 root entry의 공존
2. side-effect 없는 명시적 registration 경로
3. CDN·CommonJS·framework adapter 호환성
4. tarball 크기와 단일 모듈 전송량을 함께 보는 예산
