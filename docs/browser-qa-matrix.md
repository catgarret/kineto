# 브라우저 레이어 QA 매트릭스

기준 버전: v0.9.3 후속 · 검토: 2026-09-05

모든 공개 모듈은 Chromium·Firefox·WebKit에서 registry 일치와
create → duplicate init → replay → destroy lifecycle smoke를 통과해야 합니다. 모든
variant와 입력을 같은 깊이로 검사한다는 뜻은 아니며, 브라우저 엔진 차이가 실제
화면을 바꿀 가능성이 높은 레이어 모듈은 별도 `heavy-layout` 체크포인트로
승격합니다.

## 공개 지원표

`docs/module-usage-matrix.md`의 브라우저 기준은 지원 범위를 과장하지 않도록 다음 QA 깊이와 연결합니다.

| 기준 | 자동 증거 | 공개 의미 | 현재 한계 |
|---|---|---|---|
| `evergreen` | Chromium 전체 + 세 엔진 52/52 lifecycle smoke | 최신 evergreen 브라우저의 일반 DOM·CSS 경로 | 모든 variant를 세 엔진에서 같은 깊이로 검사하지 않음 |
| `evergreen-pointer` | Chromium 포인터·pointer-events 검사 + 세 엔진 전체 module lifecycle + 대표 입력 smoke | 데스크톱 포인터 입력을 보조 기능으로 지원 | 터치 전용 기기의 실제 센서·포인터 조합은 별도 확인 필요 |
| `evergreen-scroll` | Chromium 스크롤/레이아웃 검사 + 세 엔진 전체 module lifecycle + 대표 스크롤 smoke | 최신 스크롤 API가 있는 브라우저에서 동작, 미지원 시 정적·기본 흐름 유지 | 실제 iOS Safari/Android Chrome 실기기 검증은 아직 릴리스 증거에 포함하지 않음 |
| `evergreen-touch` | Chromium touch 에뮬레이션 + 모바일 레이아웃 검사 | 키보드·touch fallback과 native semantics를 우선 | 제조사 WebView와 실기기 IME/viewport 차이는 [실기기 실행표](browser-device-qa.md)로 별도 기록 |
| `evergreen-canvas` | Chromium canvas/media QA + heavy-layout 대상 세 엔진 | 캔버스·미디어 효과의 fallback과 레이어 경계를 검증 | cross-origin 미디어와 저사양 GPU의 실제 성능은 소비자가 측정해야 함 |

이 표의 “지원”은 브라우저·OS 조합 전체를 보증한다는 뜻이 아닙니다. 실기기 검증을 추가할 때는 [실기기 실행표](browser-device-qa.md)의 절차와 증거 형식을 사용해 기기·OS·브라우저 버전과 재현 fixture를 [QA 이력](browser-qa-history.md)에 함께 기록하고, 자동화되지 않은 수동 확인은 자동 통과율에 합산하지 않습니다.

## 대상과 검사 계약

`tests/browser/demo-polish.mjs`의 `checkpoint('heavy-layout')`는 Chromium·Firefox·WebKit에서 다음 계약을 한 번에 검사합니다.

다음 모듈은 transform 조상·fixed/sticky·clip/mask·3D 경계를 실제로 사용하므로
일반 smoke가 아니라 세 엔진의 `heavy-layout` 전체 대상으로 유지합니다: `pageReveal`,
`pageTransition`, `slider`, `stickyStack`, `stickyHeader`, `lightbox`, `cursor`,
`fullpage`, `radial`, `coverReveal`. 새 모듈을 이 목록에 넣으려면 아래 편입 조건과
재현 가능한 레이아웃 회귀를 함께 추가해야 합니다.

| 모듈 | 위험 경계 | 검사하는 결과 |
|---|---|---|
| `pageReveal` | transform 조상·fixed/sticky containing block | 루트 애니메이션과 persistent header의 레이어·크기·cover 중복 없음 |
| `pageTransition` | clip·overlay·반응형 overflow | 효과 선택 행이 실제 레이아웃되고 버튼 수와 stage bounds가 유지됨 |
| `slider` | clip·3D transform·ghost layer | Coverflow clip, dissolve scene/slide clip, dot geometry가 유지됨 |
| `stickyStack` | native sticky·absolute layer·overflow clip | vertical sticky 카드, horizontal overflowing track, floating viewport의 측정 가능한 bounds |
| `stickyHeader` | scroll host 내부 sticky/fixed 전환 | header position, 내부 scroll progress, `kt-stuck`, cover header bounds |
| `lightbox` | overlay·grid·viewport clipping | thumbnail grid와 viewer 레이어가 0×0 또는 행 겹침 없이 배치됨 |
| `cursor` | fixed layer·pointer transparency | 커서 루트가 fixed이고 `pointer-events:none`을 유지함 |
| `radial` | radial item transform·image layer | 각 item이 하나의 측정 가능한 이미지 레이어를 유지하고 드래그 후 ghost duplicate가 생기지 않음 |
| `coverReveal` | wrapper·mask panel clipping | 8개 gallery target이 wrapper와 mask panel을 하나씩 유지하고 0×0·ghost panel이 없음 |
| `fullpage` | transformed track·section overflow | 각 track/section의 bounds와 host clip, 내부 overflow 상태 |

검사는 “스타일 문자열이 존재한다”에서 끝나지 않습니다. 먼저 `getBoundingClientRect()`가 0이 아닌지 확인하고, 실제 used value를 읽은 뒤 스크롤·레이어 관계를 확인합니다. `repeat(...)`, `auto`, `none`처럼 아직 레이아웃되지 않았거나 효과가 적용되지 않은 computed value는 성공으로 취급하지 않습니다.

## 실행과 릴리스 게이트

로컬에서 한 엔진만 확인할 때:

```bash
KT_BROWSER=chromium node tests/browser-smoke.mjs
KT_BROWSER=firefox node tests/browser-smoke.mjs
KT_BROWSER=webkit node tests/browser-smoke.mjs

KT_BROWSER=chromium node tests/browser/css-scroll.mjs
KT_BROWSER=firefox node tests/browser/css-scroll.mjs
KT_BROWSER=webkit node tests/browser/css-scroll.mjs

KT_BROWSER=chromium node tests/retry-browser-test.mjs tests/browser/demo-polish.mjs
KT_BROWSER=firefox node tests/retry-browser-test.mjs tests/browser/demo-polish.mjs
KT_BROWSER=webkit node tests/retry-browser-test.mjs tests/browser/demo-polish.mjs
```

`tests/browser-smoke.mjs`는 `kineto.features.json`과 실제 runtime registry, 실행된
fixture 이름·개수가 모두 같은지 비교하므로 새 공개 모듈에 fixture가 없으면
실패합니다. 릴리스 전에는 `npm run ci`의 Node 24 전체 job과 Firefox/WebKit
matrix가 모두 성공해야 하며, tag release도 같은 두 cross-browser gate가 끝나기
전에는 publish job을 시작하지 않습니다. `heavy-layout` 단계가 실패하면 다음
순서로 분류합니다.

`tests/browser/css-scroll.mjs`는 Scroll-driven Animations의 별도 scroll 계약입니다. Chromium lane은 native `scroll()`과 `view()` timeline의 computed custom-property 값이 실제 scrollport 진행률과 요소 통과 진행률을 따르는지 반드시 검사합니다. Firefox·WebKit lane도 같은 feature detection을 실행해 지원되는 native 경로를 검사합니다. 세 엔진 모두 `cssAnimation`을 생략한 명시적 progress-property fallback, 정확히 생성한 timeline만 미지원인 결정적 fallback, reduced-motion 완료 상태와 `destroy()` 복원을 공통으로 검사하므로 CSS longhand 존재 여부만으로 성공 처리하지 않습니다.

`demo-polish`의 `mobile-hero-scene`은 세 엔진에서 모바일 폭의 touch 입력 후
내려가기·올라가기 위치를 연속 측정합니다. 한 제스처로 시작한 이동이 여러
프레임으로 감속하고 방향 반전·오버슈트 없이 정착해야 합니다. Chromium의
`b2_navigation`은 wheel 잔여 입력과 모바일 touch 입력의 소유권도 검사합니다.
합성 입력과 브라우저 측정은 실제 iOS·Android의 OS rubber-band 검증을 대신하지 않습니다.

Chromium 전체 lane은 모든 playground를 포함하므로 hosted runner에서 시도당 `240s`, 최대
3회로 실행합니다. 재시도 후에도 실패하면 `test:browser` annotation과 `ci.log`의 마지막
checkpoint를 먼저 확인합니다. 이 제한은 실패를 숨기지 않고, 일시적인 runner 지연만
재현 가능한 범위에서 흡수하기 위한 것입니다.

1. **레이아웃 준비 실패**: rect가 0이거나 hidden 조상에서 측정됐는지 확인합니다. 대상이 레이아웃되기 전에 읽은 assertion이면 동기화를 고칩니다.
2. **엔진 차이**: 같은 DOM·CSS가 한 엔진에서만 다른 used value를 내는지 확인합니다. 브라우저별 예외를 추가하기 전에 containing block·overflow·clip 원인을 재현합니다.
3. **실제 회귀**: 두 엔진 이상에서 같은 경계가 깨지거나 한 엔진에서 사용자에게 보이는 레이어가 사라지면 모듈 수정과 회귀 테스트를 함께 추가합니다.
4. **환경 실패**: 브라우저 설치·CDN·러너 정지라면 코드 게이트를 완화하지 않고 bounded retry와 마지막 checkpoint를 확인합니다.

현재 대상 목록에 없는 모듈은 다음 조건을 모두 만족할 때만 추가합니다.

- transform 조상, `position:fixed`/`position:sticky`, `clip-path`/mask, 3D transform 중 하나가 실제 데모에서 사용됩니다.
- Chromium smoke만으로 재현되지 않는 Firefox/WebKit 레이아웃 차이가 확인됩니다.
- 0×0, viewport 밖, clipping 누수처럼 자동으로 판정할 수 있는 회귀 결과가 있습니다.

2026-08-18 기준 `fa055cc`의 CI run `32099365793`에서 Node 24 전체, Firefox, WebKit과 Pages 배포가 모두 성공했습니다. 이 기록은 통과 사실을 남기는 용도이며, 브라우저 버전이나 러너가 바뀌면 같은 명령으로 다시 갱신해야 합니다.
