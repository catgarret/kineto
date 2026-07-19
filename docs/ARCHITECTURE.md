# MotionKit Architecture

## 1. 설계 목표

MotionKit은 애니메이션 엔진을 새로 만드는 프로젝트가 아니다. 디자이너가 HTML 속성으로 시작하고, 개발자가 같은 기능을 JavaScript로 제어할 수 있도록 GSAP, ScrollTrigger, Lenis, 브라우저 API를 일관된 인터페이스로 묶는다.

핵심 목표는 다음 네 가지다.

1. **한 기능, 두 진입점**: `data-mk-*`와 `MotionKit.<module>()`가 같은 옵션을 사용한다.
2. **수명주기 안전성**: 생성한 이벤트, observer, RAF, timer, GSAP 인스턴스, 생성 DOM을 `destroy()`에서 정리한다.
3. **중복 초기화 방지**: 같은 요소와 모듈 조합은 한 번만 활성화한다.
4. **기능 계약 보존**: 공개 모듈/API는 소스 코드보다 먼저 `motionkit.features.json`으로 검증한다.

## 2. 계층

```text
HTML data-mk-* / JavaScript / Framework adapter
                     │
                     ▼
                MotionKit Core
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
- 자동 스캔과 `data-mk-*` 옵션 읽기
- Lenis/visibility 서비스
- pause, resume, replay, destroy

### `src/modules/*.js`

각 파일은 하나의 공개 모듈입니다. 모듈이 소유한 리소스는 해당 인스턴스가 정리합니다.

## 3. 모듈 인터페이스

```js
export default {
  create(el, options, MotionKit) {
    return {
      el,
      type: 'moduleName',
      pause() {},
      resume() {},
      destroy() {}
    };
  },

  reduced(el, options, MotionKit) {},
  fallback(el, options, MotionKit) {}
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
<div data-mk-reveal="fade-up" data-mk-duration="0.8"></div>
```

```js
MotionKit.autoInit();
```

1. 등록된 각 모듈 이름을 kebab-case 속성으로 변환합니다.
2. 일치하는 요소를 찾습니다.
3. 활성화 속성 값은 `preset`으로, 나머지 `data-mk-*`는 옵션으로 읽습니다.
4. 문자열은 boolean, number, JSON으로 안전하게 변환합니다.
5. 이미 활성화된 요소/모듈 조합은 기존 인스턴스를 반환합니다.

## 6. 전역 서비스

### Lenis

첫 모듈 생성 시 한 번만 초기화됩니다. `smooth: false` 또는 low performance 환경이면 건너뜁니다. GSAP ticker가 있으면 Lenis RAF를 ticker에 연결하고, 그렇지 않으면 독립 RAF를 사용합니다.

### Visibility

탭이 숨겨지면 모든 활성 인스턴스의 `pause()`, 다시 보이면 `resume()`을 호출합니다.

### ScrollTrigger

모듈이 각자의 trigger/tween을 소유합니다. 전역 `MotionKit.refresh()`는 레이아웃 변경 후 ScrollTrigger refresh를 호출합니다.

> 이전 문서의 “모든 모듈이 단일 RAF를 공유한다”는 설명은 실제 구현과 달라 제거했습니다. RAF 기반 모듈은 각 인스턴스가 자신의 RAF를 소유하고 반드시 `destroy()`에서 해제합니다.

## 7. 기능 변경 규칙

공개 범위는 `motionkit.features.json`입니다.

- Patch: 계약을 유지하는 버그 수정
- Minor: 기존 동작을 유지하는 opt-in 기능 추가
- Major: 이름, 옵션 의미, 기본값, 반환 구조 등 호환성 파괴

AI 또는 사람이 기능을 고칠 때 구현만 바꾸면 안 됩니다. 문서, 테스트, changelog가 같은 커밋에서 바뀌어야 합니다.

## 8. 빌드

### ESM

- 앱 번들러용
- GSAP/ScrollTrigger/Lenis를 외부 패키지로 사용
- named export와 default MotionKit 제공

### UMD

- `<script>` 직접 사용용
- 런타임 의존성 포함
- 전역 `MotionKit` 제공

### CSS

Vite가 `src/motionkit.css`를 `dist/motionkit.css`로 출력합니다.

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
