# Module usage and quality matrix

> Generated from `scripts/generate-module-metadata.mjs` · library v0.9.5 · 52 modules.
>
> 데모의 모듈 인덱스와 복사 코드에서 확인할 최소 판단 기준입니다. `native`·`managed`가 표시되어도 실제 콘텐츠의 이름·대체 동작은 소비자가 함께 제공해야 합니다.

## 상태 읽는 법

| 항목 | 값 | 의미 |
|---|---|---|
| 접근성 | `native` | native semantics/keyboard |
| 접근성 | `managed` | module-managed semantics |
| 접근성 | `manual` | consumer fallback required |
| 접근성 | `visual-only` | visual effect; provide semantic content |
| 성능 | `light` | low overhead |
| 성능 | `medium` | measure in repeated lists |
| 성능 | `heavy` | lazy-load or limit instances |
| reduced motion | `final-state` | settles to a final state |
| reduced motion | `static` | keeps a static/fallback presentation |

## 모듈별 판단

| 모듈 | 요약 | 언제 사용 | 피해야 할 때 | 접근성 | 성능 | reduced motion | 브라우저 기준 |
|---|---|---|---|---|---|---|---|
| `ambientMedia` | 콘텐츠 주변에 원본을 샘플링한 분위기 배경을 만듭니다. | 영상·히어로의 깊이를 낮은 우선순위 장식으로 보강할 때 | 텍스트 가독성이 핵심이거나 저사양 기기에서 영상 샘플링을 피해야 할 때 | `manual` | `heavy` | `static` | `evergreen-canvas` |
| `blurText` | 흐린 텍스트가 또렷해지는 진입 효과입니다. | 짧은 제목이나 핵심 카피를 한 번만 강조할 때 | 긴 본문 전체에 적용해 읽기를 방해할 때 | `visual-only` | `light` | `final-state` | `evergreen` |
| `brushReveal` | 브러시 입력으로 이미지를 드러내는 캔버스 효과입니다. | 제품 이미지·아트워크를 탐색형으로 보여줄 때 | 대체 텍스트가 주 콘텐츠이거나 터치 조작이 필수인 UI에서 | `manual` | `heavy` | `static` | `evergreen-canvas` |
| `cardGlow` | 포인터 위치에 반응하는 표면·테두리 광택입니다. | 짧은 카드 목록에서 hover 피드백을 강화할 때 | 모바일 중심 화면이나 많은 카드에 상시 적용할 때 | `manual` | `medium` | `static` | `evergreen-pointer` |
| `counter` | 숫자·시계·경과·카운트다운을 같은 포맷 엔진으로 표시합니다. | 수치 변화나 시간 상태를 시각적으로 강조할 때 | 숫자 자체가 아닌 설명 문장이 중요한 곳에 과하게 사용할 때 | `managed` | `light` | `final-state` | `evergreen` |
| `dateTime` | 서버 날짜를 절대·상대·혼합 형식으로 표시합니다. | 게시 시각과 업데이트 시각을 사용자 시간대에 맞춰 보여줄 때 | 서버 타임존과 입력 형식을 확인하지 않은 채 문자열을 추측할 때 | `managed` | `light` | `final-state` | `evergreen` |
| `cssScroll` | CSS scroll-timeline 진행률에 모션을 연결합니다. | 브라우저가 타임라인을 지원하는 장식 효과에 | 핵심 정보나 구형 브라우저를 반드시 지원해야 하는 동작에 | `manual` | `medium` | `final-state` | `evergreen-scroll` |
| `cursor` | 커스텀 포인터 프리셋을 제공합니다. | 데스크톱 포트폴리오의 보조 피드백으로 사용할 때 | 터치 전용 화면이나 포인터가 콘텐츠를 가릴 수 있는 환경에서 | `manual` | `medium` | `static` | `evergreen-pointer` |
| `fullpage` | 한 화면 단위의 섹션 전환과 관성을 제공합니다. | 짧은 내러티브·프레젠테이션형 섹션을 구성할 때 | 긴 문서·게시판처럼 자유로운 스크롤이 필요한 화면에 | `manual` | `medium` | `final-state` | `evergreen-scroll` |
| `glitch` | RGB 분리와 픽셀 시프트로 글리치 전환을 만듭니다. | 짧은 브랜드 타이틀이나 오류·상태 연출에 | 지속적으로 읽어야 하는 본문이나 광과민성 우려가 있는 화면에 | `visual-only` | `light` | `final-state` | `evergreen` |
| `lazy` | 이미지 로딩 시점에 전환과 fallback을 연결합니다. | 이미지가 많은 목록에서 초기 비용을 줄일 때 | 이미지가 즉시 노출되어야 하는 LCP 핵심 이미지에 | `managed` | `medium` | `static` | `evergreen` |
| `lightbox` | 이미지 그룹을 확대·탐색하는 접근 가능한 뷰어입니다. | 갤러리·포트폴리오의 상세 보기를 제공할 때 | 단일 장식 이미지나 라우팅이 필요한 복잡한 미디어 뷰어에 | `managed` | `medium` | `static` | `evergreen` |
| `loader` | 전체 화면 로딩과 실제 진행률을 연결합니다. | 앱 초기화처럼 콘텐츠를 잠시 차단해야 할 때 | 짧은 작업이나 콘텐츠를 가리는 불필요한 대기 화면에 | `managed` | `medium` | `final-state` | `evergreen` |
| `loadingIndicator` | 콘텐츠 안에 놓는 스피너·바·텍스트 인디케이터입니다. | 비동기 작업의 현재 상태를 인라인으로 알릴 때 | 진행률을 알 수 있는데 불확정 스피너만 사용할 때 | `managed` | `medium` | `final-state` | `evergreen` |
| `magnetic` | 포인터를 따라 버튼이 살짝 끌려옵니다. | 데스크톱 CTA의 보조 반응을 만들 때 | 키보드·터치가 주 입력이거나 버튼 위치가 안정적이어야 할 때 | `manual` | `medium` | `static` | `evergreen-pointer` |
| `marquee` | 텍스트나 아이템을 끊김 없이 흐르게 합니다. | 짧은 태그·로고 스트립을 장식으로 보여줄 때 | 긴 문장·중요 공지를 자동 흐름으로 읽히게 할 때 | `manual` | `medium` | `final-state` | `evergreen-scroll` |
| `mouseParallax` | 포인터·자이로 위치에 따라 레이어가 이동합니다. | 히어로 이미지에 약한 깊이감을 더할 때 | 모바일 센서 권한이나 멀미 우려가 있는 핵심 UI에 | `manual` | `medium` | `static` | `evergreen-pointer` |
| `overflowText` | 넘치는 텍스트를 순환·롤·페이드로 처리합니다. | 한 줄 제목이나 상태 라벨이 제한 폭을 넘을 때 | 사용자가 문장을 천천히 읽어야 하는 본문에 | `visual-only` | `light` | `final-state` | `evergreen` |
| `pageReveal` | 새 페이지 진입 시 오버레이 메커니즘을 재생합니다. | 짧은 랜딩 페이지의 진입 장면을 연출할 때 | 라우팅이 잦거나 즉시 콘텐츠 접근이 필요한 앱에 | `managed` | `heavy` | `final-state` | `evergreen` |
| `pageTransition` | 동일 출처 페이지 사이의 전환을 연결합니다. | 문서형 사이트에서 페이지 이동의 맥락을 유지할 때 | 외부 출처·새 탭·스트리밍 라우터가 전환을 직접 관리할 때 | `managed` | `medium` | `final-state` | `evergreen` |
| `parallax` | 레이어별 스크롤 속도로 깊이감을 만듭니다. | 정적 히어로와 장식 이미지에 약한 시차를 줄 때 | 많은 레이어나 콘텐츠 위치가 정확해야 하는 문서에 | `manual` | `medium` | `final-state` | `evergreen-scroll` |
| `progress` | 읽기 진행률을 바·링 UI로 표시합니다. | 긴 글이나 섹션 위치를 알려줄 때 | 짧은 화면이나 진행률이 사용자를 압박할 수 있는 흐름에 | `manual` | `medium` | `final-state` | `evergreen-scroll` |
| `reveal` | 요소 진입 시 방향·마스크·클록 효과를 적용합니다. | 섹션 단위로 콘텐츠를 순차 노출할 때 | 모든 문장에 적용해 첫 읽기를 지연시킬 때 | `manual` | `medium` | `final-state` | `evergreen-scroll` |
| `radial` | 슬라이더와 같은 접근 경계를 공유하는 원형 캐러셀입니다. | 소수의 항목을 도크처럼 순환 선택할 때 | 항목이 많거나 검색·목록 탐색이 핵심인 화면에 | `managed` | `medium` | `static` | `evergreen` |
| `ripple` | 클릭 위치에서 원형 피드백이 퍼집니다. | 버튼 입력이 등록됐다는 즉각 피드백이 필요할 때 | 텍스트 링크·키보드 포커스처럼 별도 상태가 있는 요소에 | `manual` | `medium` | `static` | `evergreen-pointer` |
| `scrollSequence` | 스크롤 위치로 이미지 프레임을 스크럽합니다. | 제품 분해·스토리텔링처럼 프레임 순서가 의미 있을 때 | 긴 목록이나 저사양 모바일에서 많은 프레임을 로드해야 할 때 | `manual` | `heavy` | `static` | `evergreen-canvas` |
| `scrollVelocity` | 스크롤 속도와 방향에 반응하는 보조 모션입니다. | 마퀴·타이포그래피에 스크롤 감각을 더할 때 | 핵심 조작을 속도에 의존하게 만들 때 | `manual` | `medium` | `final-state` | `evergreen-scroll` |
| `slider` | 드래그·스와이프·키보드로 콘텐츠를 넘기는 슬라이더입니다. | 한 번에 하나 또는 소수의 항목을 비교할 때 | 전체 항목을 한눈에 비교하거나 검색 가능한 목록이 필요할 때 | `managed` | `medium` | `static` | `evergreen` |
| `stickyStack` | 스크롤 중 카드가 순서대로 고정되는 스택입니다. | 짧은 단계형 이야기나 비교 카드에 | 긴 본문·모바일 성능이 중요한 화면에 | `manual` | `medium` | `final-state` | `evergreen-scroll` |
| `textFill` | 스크롤 진행률에 따라 글자 색을 채웁니다. | 한두 줄의 선언문을 읽기 진행과 함께 강조할 때 | 대량 텍스트나 색 대비가 중요한 본문에 | `manual` | `medium` | `final-state` | `evergreen-scroll` |
| `textReveal` | 글자별 점멸 후 텍스트를 확정합니다. | 짧은 타이틀의 등장 순간을 강조할 때 | 스크린리더 순서와 시각적 지연이 충돌할 수 있는 본문에 | `visual-only` | `light` | `final-state` | `evergreen` |
| `textSplit` | 문장을 글자·단어 단위로 나눠 등장시킵니다. | 짧은 헤드라인에 스태거·3D 리듬을 줄 때 | 복사 가능한 긴 문장이나 동적 콘텐츠에 무분별하게 적용할 때 | `visual-only` | `light` | `final-state` | `evergreen` |
| `textTransition` | 문장을 글자 단위로 교체합니다. | 짧은 슬로건이나 상태 문구를 순환할 때 | 사용자가 한 문장을 끝까지 읽어야 하는 안내에 | `visual-only` | `light` | `final-state` | `evergreen` |
| `tilt` | 포인터 추종 3D 틸트와 글레어를 적용합니다. | 제품 카드·썸네일에 깊이감을 줄 때 | 많은 카드나 정밀한 포인터 조작이 필요한 작업 화면에 | `manual` | `medium` | `static` | `evergreen-pointer` |
| `typewriter` | 타이핑·한글 자모 조합·캐럿을 재현합니다. | 짧은 터미널·챗봇·소개 문구를 연출할 때 | 실시간 입력값이나 접근성 핵심 안내를 흉내 낼 때 | `visual-only` | `light` | `final-state` | `evergreen` |
| `vibrate` | 지원 기기의 햅틱 패턴을 재생합니다. | 탭 성공·경고처럼 촉각 보조 피드백이 필요할 때 | 진동을 기본 성공 신호로 가정하거나 데스크톱 전용 화면에 | `manual` | `medium` | `static` | `evergreen-pointer` |
| `confetti` | 클릭·뷰 이벤트에서 색종이 버스트를 실행합니다. | 완료·축하 상태를 짧게 강조할 때 | 반복 노출되거나 사용자의 집중을 깨는 업무 화면에 | `managed` | `medium` | `final-state` | `evergreen` |
| `accordion` | details 기반으로 열고 닫는 콘텐츠 그룹입니다. | FAQ·설정처럼 여러 내용을 접어야 할 때 | 동시에 여러 패널을 비교해야 하는 화면에 | `native` | `light` | `final-state` | `evergreen-touch` |
| `hold` | 길게 누르거나 연타해 확인하는 게이지입니다. | 삭제·위험 작업에 의도적 확인 단계를 둘 때 | 키보드·보조기기에서 동일한 대체 동작을 제공하지 않을 때 | `native` | `light` | `final-state` | `evergreen-touch` |
| `megaMenu` | GNB 드롭다운과 모바일 터치 메뉴를 제공합니다. | 카테고리·하위 링크가 많은 사이트 헤더에 | 단일 링크나 작은 화면에서 전체 메뉴를 한 번에 펼칠 때 | `native` | `light` | `final-state` | `evergreen-touch` |
| `toast` | 화면 모서리에 상태 알림을 표시합니다. | 저장·업로드 결과를 비차단으로 알릴 때 | 오류·확인처럼 사용자가 반드시 읽어야 하는 메시지에 | `native` | `light` | `final-state` | `evergreen-touch` |
| `bottomSheet` | 드래그 가능한 모바일 바텀시트입니다. | 모바일 필터·공유·보조 작업을 잠깐 띄울 때 | 데스크톱에서만 중요한 정보나 깊은 중첩 모달에 | `native` | `light` | `final-state` | `evergreen-touch` |
| `tabs` | WAI-ARIA 탭과 세그먼트 전환을 제공합니다. | 같은 맥락의 패널을 공간 절약형으로 나눌 때 | 서로 비교해야 하는 내용을 숨겨 탐색 비용을 높일 때 | `native` | `light` | `final-state` | `evergreen-touch` |
| `coverReveal` | 커버가 걷히며 콘텐츠를 드러냅니다. | 이미지·카드의 첫 노출을 한 번 강조할 때 | 반복 스크롤 목록이나 즉시 읽어야 하는 콘텐츠에 | `managed` | `medium` | `static` | `evergreen` |
| `gesture` | hover·press·키보드 입력에 스프링으로 반응합니다. | 버튼의 입력 상태를 부드럽게 보여줄 때 | 모션 없이도 상태가 명확해야 하는 폼 핵심 조작에 | `manual` | `medium` | `static` | `evergreen-pointer` |
| `drag` | 관성·경계·스냅백·방향키 드래그를 제공합니다. | 캔버스·칩·작은 패널을 직접 배치할 때 | 정밀한 폼 입력이나 드래그 대체 동작이 없는 환경에 | `native` | `light` | `final-state` | `evergreen-touch` |
| `tooltip` | 포인터·포커스·클릭에 맞춰 툴팁을 배치합니다. | 짧은 보조 설명을 컨텍스트에 붙일 때 | 핵심 설명·긴 문장·터치에서 hover만 의존할 때 | `native` | `light` | `final-state` | `evergreen-touch` |
| `switch` | 폼과 연결되는 키보드·ARIA 토글 스위치입니다. | 두 상태를 즉시 바꾸는 설정에 | 세 가지 이상 상태나 단순 링크 이동에 | `native` | `light` | `final-state` | `evergreen-touch` |
| `flip` | 레이아웃 변화 전후 위치를 FLIP으로 보간합니다. | 카드 정렬·필터 결과가 자연스럽게 이동해야 할 때 | 개수가 많거나 레이아웃 측정이 잦은 저사양 목록에 | `native` | `light` | `final-state` | `evergreen-touch` |
| `scrollShadows` | 스크롤 가능 영역의 가장자리에 그림자·마스크를 표시합니다. | 긴 패널의 더 많은 콘텐츠가 있음을 알려줄 때 | 배경 대비가 약하거나 고정 높이가 없는 영역에 | `manual` | `medium` | `final-state` | `evergreen-scroll` |
| `stickyHeader` | 스크롤 방향에 반응하는 고정 헤더입니다. | 긴 페이지에서 탐색을 계속 노출할 때 | 헤더가 콘텐츠를 가리거나 전체 화면 내러티브가 필요한 곳에 | `manual` | `medium` | `final-state` | `evergreen-scroll` |
| `horizontalScroll` | 세로 스크롤을 가로 이동으로 매핑합니다. | 가로 갤러리·스토리텔링 구간을 구성할 때 | 일반 목록·키보드 탐색·모바일 세로 흐름이 우선인 곳에 | `manual` | `medium` | `final-state` | `evergreen-scroll` |

새 모듈은 이 표의 필수 필드를 채운 뒤 `npm run test:module-metadata`와 `npm run test:docs-navigation`을 통과해야 합니다.
