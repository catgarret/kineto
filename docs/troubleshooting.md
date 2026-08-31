# 문제 해결

이 문서는 Kineto v0.8.104에서 확인된 증상을 증상·원인·확인 순서로 정리한 운영
가이드입니다. 효과를 숨기거나 모듈을 제거하는 방식으로 문제를 피하지 말고, 먼저
레이아웃·입력·라이프사이클을 확인하십시오.

## 모듈형 엔트리가 동작하지 않음

`@dong-gri/kineto/core`는 모듈을 자동 등록하지 않습니다. 사용하는 모듈 엔트리를
등록한 뒤 스캔해야 합니다.

```js
import Kineto from '@dong-gri/kineto/core';
import slider from '@dong-gri/kineto/modules/slider';

Kineto.register('slider', slider);
Kineto.scan();
```

`data-kt-slider`가 있어도 `slider`를 등록하지 않았으면 아무 일도 일어나지 않는 것이
정상입니다. `Kineto.registry.slider`와 `Kineto.instanceCount`를 먼저 확인하고,
동적 import를 쓰는 경우 모듈 로드가 완료된 뒤 `register()`를 호출하십시오.

## 숨겨진 컨테이너에서 크기·정렬이 틀림

`display:none`, 닫힌 `<details>`, `hidden` 속성이 붙은 탭 패널 안에서는 브라우저가
실제 used size를 계산할 수 없습니다. 이 상태에서 초기화하면 Tabs indicator, Slider,
Scroll Shadows, 터미널 인디케이터의 폭·높이가 0 또는 예상보다 크게 고정될 수 있습니다.

1. 패널을 먼저 표시합니다.
2. 다음 프레임에 모듈을 만들거나 공개 refresh 메서드를 호출합니다.
3. 고정 폭을 강제하는 `min-width`/`min-height`와 부모의 `align-items`를 확인합니다.

Tabs에는 외부에서 다시 측정할 수 있는 `tabs.refresh()`가 있습니다.

```js
const tabs = Kineto.getInstance('.tabs', 'tabs');
tabs?.refresh?.();
```

v0.8.104의 데모는 패널 공개 직후와 두 개의 animation frame, 제한된 후속 측정까지
사용합니다. 애플리케이션에서 임의의 무한 polling을 추가하지 말고, 표시 상태 변경과
레이아웃 완료 시점에 맞춰 한 번 호출하십시오.

## 모바일 Mega Menu가 열리지 않거나 엉뚱한 위치에 표시됨

모바일에는 hover가 없습니다. 좁은 화면에서는 `trigger: 'click'`을 사용하고, 메뉴
패널이 잘리지 않아야 하면 부모의 `overflow:hidden`, `transform`, `contain:paint`를
제거하거나 메뉴를 해당 stacking context 밖에 둡니다.

```html
<nav data-kt-mega-menu="dropdown"
     data-kt-trigger="click"
     data-kt-responsive="scroll">
  ...
</nav>
```

`responsive`는 `wrap`, `scroll`, `custom` 중에서 선택합니다. iPhone Safari와
Android Chrome에서 실제 터치 동작을 확인할 때는 pointer 이벤트를 가로채는 상위
요소, `pointer-events:none`, `z-index`, `position` 조합을 함께 확인하십시오.
키보드 사용자는 Enter/Space와 Escape로 같은 메뉴를 열고 닫을 수 있어야 합니다.

## Slider/Radial을 드래그하면 고스트 이미지가 생김

슬라이드 안의 `<img>`가 브라우저 기본 drag source로 남아 있으면 반투명 고스트가
생기고 pointer capture가 끊길 수 있습니다. Slider는 슬라이드 이미지를
`draggable=false`, `-webkit-user-drag:none`, 캡처 단계 `dragstart` 취소를 함께 적용하고,
실제 이동 임계값을 넘은 뒤에만 페이지 스크롤과 클릭을 억제합니다. 사용자 코드에서
초기화 후 이미지를 다시 `draggable=true`로 바꾸거나 `-webkit-user-drag`를 덮어쓰지 마십시오.

Radial에서 드래그가 끊기면 다음을 확인하십시오.

- 활성 항목 아래에 항목이 두 개 이상 있는가
- 컨테이너가 pointer 이벤트를 받는가
- 부모가 `touch-action:none` 또는 `pan-y`를 필요한 축에 맞게 허용하는가
- `spring:true`를 켠 경우 `stiffness`, `damping`, `mass`가 과도하지 않은가

## Page Reveal의 fade·flash가 비슷하게 보임

`fade`는 콘텐츠 오버레이 없이 페이지의 opacity를 점진적으로 바꾸는 단순 전환이고,
`flash`는 짧은 색상 패널을 삽입해 번쩍인 뒤 제거하는 효과입니다. 두 효과가 같아
보이면 `color`, `duration`, reduced-motion 설정과 실제 생성된
`.kt-page-reveal__panel`의 존재를 확인하십시오. `curtain`, `wipe`, `split`처럼
마스크·패널 기반 효과와 `fade`를 같은 페이지에 겹쳐 초기화하지도 마십시오.

## dateTime이 `n분 전` 대신 이상한 날짜를 표시함

dateTime은 ISO/RFC, Unix timestamp, SQL datetime, `YYYY.MM.DD`, `YYYY/MM/DD`,
`YYYY년 M월 D일` 형식을 인식합니다. 한국어 locale의 시간대 없는 SQL/ISO 값은 +09:00으로
정규화하며, 존재하지 않는 달력 날짜는 다른 날짜로 자동 보정하지 않습니다. 상대 표기는 `relativeUnit: 'auto'`일 때 초·분·시·일·주·월·년
중 가장 알맞은 단위를 선택하고, `relativeCutoff`를 넘으면 현지화된 절대 시각으로
전환합니다.

```html
<time data-kt-date-time
      data-kt-mode="relative"
      data-kt-relative-style="long"
      data-kt-relative-cutoff="30"
      data-kt-relative-cutoff-unit="day"
      datetime="2026-08-09T10:30:00+09:00">
  2026-08-09 10:30
</time>
```

시간대가 없는 숫자형 서버 날짜는 locale에 따라 해석 규칙이 달라질 수 있습니다.
가능하면 `+09:00` 같은 offset을 포함한 ISO 값을 내려주고, 서버 형식을 바꿀 수 없으면
`locale`, `timeZone`, `fallback`을 명시하십시오. 해석할 수 없는 값은 원문 또는
`fallback`을 유지합니다. 연-월-일 입력은 `-`, `/`, `.` 구분자와 한 자리 월·일을
지원하지만, 존재하지 않는 날짜(`2026-02-31`)나 24시간 범위를 벗어난 시각
(`25:70:00`)은 브라우저가 임의로 다음 날짜로 넘기지 않고 해석 실패로 처리합니다.
offset이 없는 한국어 SQL/ISO 시각은 `+09:00`으로 고정하고, 입력에 포함된 `Z`,
`+09:00`, `+0900` 같은 명시적 offset은 그대로 적용합니다. SQL 드라이버가
시간대 앞에 공백을 붙이거나(`10:30:00 +09:00`), 소수초를 3자리보다 길게
내려도 인식하며, 밀리초는 앞 세 자리 기준으로 처리합니다. `MM/DD/YYYY`와
같은 숫자형 날짜도 명시적 offset이 있으면 locale 추정 대신 해당 시간대를
우선합니다.

## 설정 URL을 열어도 공유한 모듈로 이동하지 않음

데모의 설정 복사 URL은 `?kt=…` 쿼리와 `#mod-모듈명` 해시를 함께 사용할 수 있습니다.
쿼리는 선택한 카드의 안전한 옵션을 복원하고, 해시는 복원이 끝난 뒤 해당 모듈 블록으로
이동하는 역할을 합니다. 최신 데모에서는 두 동작이 서로 다른 스크롤을 시작하지 않도록
해시 이동이 최종 위치를 소유합니다.

예를 들어 아래 URL은 설정을 복원한 뒤 Text Reveal 블록 상단으로 이동합니다.

```text
https://kineto.dongri.me/?kt=<encoded-settings>#mod-textReveal
```

브라우저가 이전 방문 상태를 복원해 처음에 상단을 잠깐 보여주더라도, 모듈 초기화와
레이아웃 측정이 끝나면 자동으로 해시 위치를 다시 맞춥니다. 사용자가 그 전에 직접
스크롤하면 자동 이동을 취소하므로, 링크를 다시 열어 확인하십시오.

## Scroll Shadows가 너무 진하거나 자연스럽지 않음

`mode: 'shadow'`는 그림자를 덧칠하고, `mode: 'mask'`는 가장자리를 그라데이션으로
페이드합니다. 콘텐츠가 비치는 자연스러운 경계가 필요하면 `mask`와
`transitionMode: 'smooth'`를 사용하고, 커버색이 테마 배경과 다르면
`--kt-scroll-shadow-cover`를 지정하십시오. 이 모듈은 외부 UI 라이브러리에 의존하지
않으며, Base UI의 gradient fade를 그대로 포함하지 않습니다.

## SSR·hydration에서 `window` 오류 또는 DOM 불일치

SSR 단계에서는 브라우저 전역을 읽지 않는 Core/adapter 엔트리만 렌더링하고, 실제
모듈 생성은 mount/effect 이후에 실행하십시오. React Strict Mode에서는 mount → cleanup
→ mount가 반복되므로 ref를 안정적으로 유지하고 `destroy()`를 누락하지 않아야 합니다.
Vue도 같은 원칙으로 `onMounted`에서 초기화하고 `onBeforeUnmount`에서 정리합니다.

## CDN·CSP/SRI·GTM 확인

CDN 엔진을 직접 지정할 때는 URL과 일치하는 SHA-384 integrity를 함께 지정하거나
자체 호스트하십시오. CSP를 사용하는 사이트는 `script-src`, `connect-src`에 필요한
origin을 허용해야 하며, Google Tag Manager는 사이트 `index.html`의 head bootstrap과
body noscript iframe을 함께 배치해야 합니다. Kineto 데모는 GTM ID
`GTM-KFQSFGJL`을 사용합니다.

## CI가 오래 걸리거나 실패함

로컬 기본 게이트는 다음 순서로 좁혀 실행합니다.

```bash
npm run lint
npm run test:docs-navigation
npm run test:demo
npm run test:browser
npm run ci
```

Chromium 전체 lane은 시도당 `240s`, 최대 3회로 제한된 browser retry를 사용하고,
Firefox/WebKit hosted lane은 브라우저 바이너리 설치도 시도당 `timeout 5m`으로 제한한
bounded retry와 job timeout을 사용합니다. 실패 시 마지막 checkpoint와 엔진별 artifact를
먼저 확인하고, 테스트를 삭제하거나 timeout을 무제한으로 늘리지 마십시오. 릴리스 전에는
`npm run verify`와 `npm run test:live-site`까지 실행해야 합니다.

## reduced motion·접근성

`prefers-reduced-motion: reduce`에서는 비필수 무한 루프를 시작하지 않고 최종 콘텐츠를
표시합니다. 효과가 사라진 것처럼 보이는 것이 결함인지 확인하려면 OS 설정을 잠시
`no-preference`로 바꾸고, 키보드 focus·ARIA 상태·원본 DOM 복원을 별도로 검사하십시오.
