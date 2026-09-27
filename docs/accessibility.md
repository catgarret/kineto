# 접근성 가이드

Kineto는 콘텐츠의 의미와 기본 조작을 유지한 채 모션을 더하는 것을
원칙으로 합니다.

## Reduced motion

기본값으로 OS의 `prefers-reduced-motion: reduce`를 존중합니다.

```js
Kineto.config({
  respectReducedMotion: true,
  forceReducedMotion: false
});
```

테스트에서는 `forceReducedMotion: true`로 정적 폴백을 강제할 수 있습니다. 모듈별 폴백은 최종 값 표시, transform 제거, 첫 이미지/첫 문자열 표시, 또는 환경상 비활성화입니다.

## 텍스트 모듈

Typewriter, Text Split, Blur Text, Text Reveal, Text Fill, Glitch(텍스트), Overflow Text,
Text Transition(글자 단위)은 모션을 재생할 때 글자를 `aria-hidden` 조각으로 그리고, 전체 문장은
요소 안의 **보이지 않는 텍스트 하나**(`<span class="kt-sr-only">`)로 남깁니다. 스크린 리더는 이 한
줄만 읽으므로 문장이 글자마다 끊기거나 두 번 읽히지 않습니다. 이 span은 인라인 스타일로 숨겨지므로
`kineto.css`를 불러오지 않은 페이지에서도 화면에 보이지 않습니다. Reduced motion에서는 조각 없이
원문을 그대로 표시합니다.

- `aria-label`은 이름을 가질 수 있는 요소(`h1`–`h6`, `href`가 있는 링크, 버튼, `nav`·`section`
  같은 랜드마크)에만 함께 붙습니다. `div`·`span`·`p`의 `aria-label`은 명세상 허용되지 않고
  NVDA·JAWS가 읽기 모드에서 무시하기 때문에, 예전처럼 거기에 문장을 넣지 않습니다.
- 작성한 `<br>`와 옵션 문자열의 `\n`도 그 텍스트에 들어갑니다. Text Split이 `texts`를 교체하면
  숨은 텍스트도 화면에 보이는 문구로 바뀝니다.
- 스스로 바뀌는 텍스트는 live region이 되지 않습니다. Overflow Text의 흐르는 목록·`rolling`·장면
  목록과 반복하는 Text Transition은 읽기 모드에서 현재 문구로 읽히지만, 몇 초마다 소리 내어
  알리지는 않습니다. `ariaLive`·`role` 옵션은 페이지가 직접 요청했고 텍스트가 반복해 바뀌지 않을
  때만 적용됩니다.
- Overflow Text는 링크·버튼·제목·목록 항목처럼 자기 역할이 있는 요소에 `role`을 덧붙이지 않습니다.
  `rolling` 링크는 링크로 남고, 항목을 이어 붙인 문장 대신 첫 번째 항목(시간에 따라 넘어가면 화면에
  보이는 항목)으로 읽힙니다.
- `destroy()`는 숨은 텍스트를 지우고 요소의 원래 `aria-label`을 되돌립니다.

적용 후 실제 스크린 리더 확인이 필요합니다.

## Counter

Counter의 숫자 릴, flip 타일의 위·아래 반쪽, pop 글자는 `aria-hidden`이고 값은 보이지 않는
텍스트 하나로 읽힙니다. `plain` 모드는 숫자를 그대로 텍스트로 씁니다. Counter는 더 이상
`aria-live`가 아닙니다. 값이 프레임마다 바뀌므로 알림으로 두면 끝없이 읽혔기 때문입니다. 완료된
값을 알려야 하는 화면이라면 `onComplete`에서 페이지의 live region에 최종 값을 한 번 넣으세요.
Clock은 표시되는 시간 문구가 바뀔 때만 숨은 텍스트를 고칩니다.

## Slider

slider는 wrapper에 carousel 역할과 label을 제공하고 키보드 방향키를 지원합니다. 화면 밖 슬라이드는
`aria-hidden`이며, Tab으로 그 안의 링크·버튼에 들어가면 그 슬라이드가 화면으로 들어옵니다.

- **Reduced motion:** 모든 슬라이드에 닿을 수 있습니다. 뷰포트(`.kt-slider-wrap`)가 스냅 포인트가 있는
  가로 스크롤 영역이 되어 포커스를 받고 방향키로 스크롤되며, `slideNext()`·`slidePrev()`·`slideTo()`는
  애니메이션 없이 바로 이동합니다. 자동 재생과 전환 모션은 없습니다.
- **Radial:** 휠 자체와, 항목 중에서는 앞에 온 항목 하나만 Tab 정지점입니다. 항목에 포커스가 있을 때
  방향키로 돌리면 포커스도 새 앞 항목으로 옮겨 가고, 휠이나 앞 항목에서 누른 Enter·Space는 그 항목을
  클릭한 것과 같습니다. 앞 항목이 바뀔 때만 그 항목의 이름을 `labels.radialStatus`로 알립니다.
  포인터가 위에 있거나 포커스가 안에 있는 동안 자동 재생은 멈춥니다. Radial이 만드는 이전/다음
  버튼의 이름은 `labels.previous`·`labels.next`입니다.

점 버튼은 8px 크기 그대로입니다. 누르기 쉬운 영역이 필요하면 `--kt-slider-dot-size`·
`--kt-slider-dot-gap`으로 키우고, 실제 페이지에서는 명확한 이전/다음 버튼과 현재 위치 텍스트를
함께 제공하는 것을 권장합니다. Radial Carousel도 방향별 `touch-action`을 적용해 페이지 스크롤과
스와이프를 분리하고, 이미지의 native drag preview를 차단합니다.

## Marquee

복제된 구간은 `inert`이고 `id`가 없습니다. Tab 순서에 들어가지 않고, 스크린 리더가 두 번 읽지 않으며,
같은 `id`가 페이지에 두 번 생기지 않습니다. 키보드 포커스가 띠 안에 들어오면 흐름이 멈춥니다
(WCAG 2.2.2). 포인터로는 `pauseOnHover`가 같은 역할을 합니다.

## Hold

스크린 리더는 버튼을 길게 누르거나 연타할 수 없습니다. 누름 없이 들어온 클릭(스크린 리더의 활성화,
`el.click()`)은 `hold`·`mash` 모드에서도 `tap`처럼 버튼을 대기 상태로 만들고(문구
`labels.confirm`, 기본 `'Sure?'`, 최소 5초), 한 번 더 활성화하면 확인됩니다. 모드마다 사용 방법이
`labels.holdHint`·`mashHint`·`tapHint`로 버튼 설명(`aria-describedby`)에 붙습니다. `hold`·`mash`
모드의 링크와 제출 버튼은 그냥 클릭해서는 이동·제출되지 않고, 확인됐을 때만 동작합니다.

## Tooltip

- 아이콘 버튼의 이름이 `title` 하나뿐이면 그 문구를 `aria-label`로 옮깁니다. 툴팁이 기본 `title`
  툴팁을 막아도 버튼 이름은 남고, `destroy()`에서 원래대로 돌아갑니다.
- 호버 툴팁은 포인터가 툴팁 위로 옮겨 가도 닫히지 않고, 떠 있는 툴팁은 포커스가 어디에 있든 Escape로
  닫힙니다(WCAG 1.4.13). `interactive`는 이제 focus·click 툴팁 안에 링크를 둘 때만 필요합니다.

## Toast

- 알림은 첫 인스턴스가 만들어질 때 비어 있는 채로 붙는 live region 두 개(`polite`, `error`·`warning`은
  `assertive`)에 문장을 추가하는 방식으로 읽힙니다. 이미 채워진 채로 나타난 영역은 읽히지 않는 경우가
  많았기 때문입니다. 화면의 토스트 자체는 live region이 아니므로 같은 문장을 두 번 듣지 않으며, 두
  영역은 마지막 인스턴스와 함께 사라집니다.
- 포커스가 있던 토스트를 닫으면 포커스는 `<body>`가 아니라 토스트로 들어오기 전 위치(없으면 트리거)로
  돌아갑니다.
- 닫기 버튼은 24px 크기입니다.

## Bottom Sheet

- 시트가 열린 동안 뒤 페이지는 `inert`입니다. 키보드·포인터·스크린 리더 모두 닿지 않고, 백드롭 클릭으로
  닫는 동작만 남습니다. 닫으면 원래대로 돌아갑니다.
- 열면 포커스가 첫 컨트롤로, 컨트롤이 없으면 시트 자체로 갑니다. Tab은 시트를 벗어나지 않습니다.
- 시트 안의 `[data-kt-sheet-close]` 버튼은 시트를 닫습니다.
- `resizable` 시트의 그립은 포커스를 받는 구분선(`role="separator"`)입니다. ↑/↓는 24px씩, Home/End는
  최소·최대 높이로 바꾸며, 이름은 `resizeLabel`입니다.

## Mega Menu

트리거는 메뉴 팝업이 아니라 펼침 버튼(disclosure)입니다. `aria-expanded`·`aria-controls`만 붙이고
`aria-haspopup`은 더하지 않습니다. `<a href>` 트리거에서 Enter는 링크로 이동하고, Space와 ↓가
패널을 엽니다. 그 밖의 트리거는 Enter·Space·↓로 엽니다. ←/→는 패널이 없는 일반 링크를 포함해 윗줄의
모든 항목을 차례로 지나가며, Escape는 열린 패널을 닫고 트리거로 포커스를 돌려줍니다.

## Fullpage

- 포커스가 있는 컨트롤의 키는 그 컨트롤이 씁니다. 입력 필드·select는 모든 키를, 버튼·링크는 Space를
  그대로 받으며, 다른 위젯이 이미 처리한 키로는 페이지를 넘기지 않습니다.
- 내용이 넘치는 긴 섹션에서는 방향키·Page Up/Down·Space가 먼저 그 섹션을 스크롤하고, 끝에 닿은 뒤에
  다음 섹션으로 넘어갑니다. 휠과 같은 규칙입니다.
- 점 버튼 묶음은 `role="group"`이고 이름은 `labels.dots`(기본 `'Sections'`)입니다. 현재 섹션은
  `aria-current`로 표시하며, 각 점은 8px로 보이지만 24px 영역에서 눌립니다.

## 작은 컨트롤

- Switch의 기본 꺼짐 트랙은 글자색의 55%로 그려져 배경과 구분됩니다.
- Progress의 `ui:'ring'` 맨 위로 버튼(`clickToTop`)은 `showAfter`·`hideAtEnd`로 숨겨진 동안 `inert`입니다.
  Tab 순서와 스크린 리더에서 빠집니다.
- Drag의 방향키는 드래그 요소나 그 `handle`에 포커스가 있을 때만 요소를 움직입니다. 안에 든 입력
  필드·select·슬라이더의 방향키는 그 컨트롤이 씁니다.
- 중첩된 Tabs·Accordion은 각자 자기 탭·패널·항목만 다룹니다. 바깥 인스턴스가 안쪽 패널을 제어하거나
  안쪽 항목을 두 번 감싸지 않습니다.

## Lightbox

viewer는 `role="dialog"`·`aria-modal="true"` 요소이고(이름은 `labels.viewer`), Escape, 좌우 화살표, 닫기 backdrop을 지원합니다. 원본 이미지의 `alt`가 확대 이미지로 전달됩니다. 닫으면 포커스는 열기 전 위치로 돌아가며, 닫히는 페이드 중에 다시 열어도 마찬가지입니다.

## Pointer-only modules

`cursor`, `magnetic`, `tilt`, `mouseParallax`는 핵심 기능이나 링크 의미를 대신하면 안 됩니다. 버튼과 링크는 본래 HTML 요소를 유지해야 합니다.

```html
<a href="/contact" data-kt-magnetic>Contact</a>
```

커스텀 커서를 쓰는 동안에도 텍스트 입력 필드·`textarea`·`select`·`contenteditable`(텍스트 캐럿)과
`[data-kt-cursor-hide]` 영역에서는 기본 포인터가 보이고 커스텀 커서는 숨습니다.
`pause()`나 `Kineto.pause()`는 기본 포인터를 돌려주고 `resume()`은 다시 숨깁니다.

## Touch and unsupported APIs

- hover가 없는 장치에서는 custom cursor가 비활성화될 수 있습니다.
- Vibration API가 없거나 권한이 제한되면 vibrate는 동작하지 않습니다.
- 모션이 비활성화되어도 콘텐츠와 기본 클릭/스크롤은 사용 가능해야 합니다.

## 배포 전 체크

- OS 동작 줄이기 설정에서 콘텐츠가 모두 보이는가
- 키보드만으로 링크, 버튼, slider, dialog를 사용할 수 있는가
- VoiceOver/NVDA에서 분할 텍스트가 한 번만 자연스럽게 읽히는가
- focus indicator가 시각 효과에 가려지지 않는가
- 이미지 alt, 색 대비, landmark 구조가 제품 기준을 충족하는가
