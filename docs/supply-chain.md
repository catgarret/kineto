# 공급망 운영

Kineto의 공급망 안전성은 단일 점수로 판단하지 않습니다. npm provenance,
릴리스 태그, 실제 tarball, CDN 무결성, 의존성 변경 이력을 함께 확인합니다.

## 릴리스 전 확인

1. `npm run verify`로 린트·빌드·계약·브라우저·패키지 크기·tarball과 세 잠금파일 audit를 통과시킵니다.
2. `docs/RELEASING.md` 절차에 따라 버전, CHANGELOG, GitHub Release 노트를 검토합니다.
3. `npm run release:ship -- v<version>`은 소유자의 명시적 배포 승인 뒤에만 실행합니다.
4. 태그 워크플로가 npm provenance 포함 배포와 GitHub Release 생성을 끝낸 뒤 npm과 Release의 버전을 대조합니다.

## 경고 분류

Socket, npm audit, GitHub Advisory 경고는 다음 네 가지 중 하나로 기록합니다.

- 재현됨: 영향 범위와 수정 버전을 이슈에 기록합니다.
- 의존성 수정: upstream 버전·근거·회귀 검사를 기록합니다.
- 허용 위험: 실제 도달 경로와 완화책을 기록하고 재검토 날짜를 둡니다.
- 오탐: 경고 규칙과 실제 패키지 증거를 링크합니다.

runtime dependency, 개발 도구 dependency, CDN 엔진은 영향 범위가 다르므로
자동 업데이트와 대응 우선순위도 분리합니다.

## 2026-09-05 Socket 0.9.3 triage

Socket의 공개 0.9.3 화면에서 확인된 package alert는 Network access,
Unpopular package, Minified code, URL strings 네 개이며 dependency alert는
0개입니다. 아래 판정은 화면의 이름만 옮긴 것이 아니라 npm registry에서 받은
`@dong-gri/kineto@0.9.3` tarball을 풀어 실제 파일과 소스를 대조한 결과입니다.

- registry tarball integrity:
  `sha512-VMaIVHW5XYtpPS6BXPQIcUZ2yWIa64tDOZt7EQmHY7AGfV4Mz94fKqi2du4KENgueFAsHL3LtOZw2iEYquNnYw==`
- 크기와 표면: 525,214 bytes packed, 1,763,246 bytes unpacked, 77 files
- 77개 구성: package metadata·README·LICENSE·logo 4개, full ESM/UMD/CSS 4개,
  modular runtime 58개, framework adapter source 3개, declaration 8개
- install lifecycle hook과 runtime `dependencies`/`optionalDependencies`는 없고,
  GSAP·Lenis·React·Vue·jQuery는 optional peer입니다.

| 경고 | Socket 심각도 | tarball 근거 | 판정과 재검토 조건 |
|---|---|---|---|
| [Network access](https://socket.dev/alerts/networkAccess) | Medium | full entry 세 개와 modular runtime에 아래의 지연 CDN·`fetch()`·media `src` 경로가 있습니다. import/install만으로 호출되는 telemetry나 background request는 없습니다. | **허용 위험 — 공개 기능에 도달 가능하고 의도됨.** UMD의 zero-setup CDN fallback, `MK-LOADER-003`, same-origin Page Transition, Lightbox EXIF/download 및 media loader를 유지하는 한 제거할 수 없습니다. major packaging에서 CDN 자동 fallback을 opt-in으로 바꾸거나 네트워크 모듈을 별도 entry로 분리할 때 재검토합니다. 새 네트워크 primitive나 미승인 host가 생기면 즉시 다시 분류합니다. |
| [URL strings](https://socket.dev/alerts/urlStrings) | Low | 실행 가능한 외부 literal은 `src/runtime.js`에서 생성된 jsDelivr GSAP·ScrollTrigger·Lenis 세 URL입니다. README badge/demo/CDN 예시, package repository/homepage, LICENSE의 프로젝트 링크도 포함됩니다. CSS·SVG와 Loader/Glitch/Loading Indicator의 `http://www.w3.org/2000/svg`는 DOM namespace/data SVG이며 원격 요청 주소가 아닙니다. | **허용 위험 + 일부 비네트워크 문자열.** 문서 URL이나 W3C namespace를 숨겨도 runtime CDN URL이 남고, 문자열 분할은 scanner 회피일 뿐 위험을 줄이지 않습니다. 각 CDN 버전 변경 때 host·bytes·SRI를 다시 확인하고, Socket이 현재 목록 밖 host를 표시하면 차단합니다. |
| [Minified code](https://socket.dev/alerts/minifiedFile) | Low | npm 표면은 `dist/kineto.min.js`, `dist/kineto.umd.min.js`, 동일 runtime의 CommonJS `dist/kineto.umd.cjs`, `dist/kineto.min.css`와 minified modular entry로 구성됩니다. | **허용 위험 — CDN/UMD 소비 계약상 의도됨.** 공개 repository·tag·provenance로 검토 가능한 source를 유지합니다. 경고만 없애려고 allowlist를 넓히지 않습니다. 1.0 package format 검토에서 readable entry/source map의 실제 소비 수요와 tarball·consumer bundle 예산을 함께 측정할 때 재검토합니다. |
| [Unpopular package](https://socket.dev/alerts/unpopularPackage) | Medium | Socket 문서상 npm/PyPI 1,000 download 미만에서 발생하는 외부 popularity 지표이며 tarball code나 dependency 문제를 가리키지 않습니다. | **외부 지표 — 조작하지 않음.** 다운로드를 인위적으로 만들지 않고 release provenance, 유지보수 활동, browser/lifecycle/package QA를 계속 공개합니다. 각 공개 release에서 자연 다운로드 수와 함께 재확인합니다. |
| Dependency alerts | 0 | 공개 tarball에는 runtime dependency와 install hook이 없습니다. | **통과.** dependency 또는 install lifecycle이 추가되는 모든 변경에서 즉시 재검토합니다. |

### 네트워크 도달 경로

full ESM/UMD entry에는 아래 기능이 모두 포함됩니다. modular 소비자는 선택한
module과 공유 runtime만 받습니다. 경로 목록은 `npm run test:deps`에서 source
단위로 고정해, `fetch`, dynamic script, resource `src` 사용 파일이 사전 검토 없이
늘어나면 실패하도록 합니다.

| source | 공개 0.9.3 artifact | 요청이 생기는 조건 |
|---|---|---|
| [`src/runtime.js`](../src/runtime.js) | full entry 세 개, `dist/modular/chunks/utils-CKn7Fyis.js` | GSAP/ScrollTrigger 기반 모듈 또는 opt-in Lenis가 필요하고 페이지 전역에 엔진이 없을 때만 version-pinned jsDelivr script를 삽입합니다. URL은 `setEngineSource()`로 self-hosting하거나 비활성화할 수 있습니다. |
| [`src/modules/loader.js`](../src/modules/loader.js) | full entry 세 개, `dist/modular/modules/loader.js` | 소비자가 fetch progress source 또는 `trackFetch()`를 사용할 때 전달한 URL을 요청합니다. |
| [`src/modules/pageTransition.js`](../src/modules/pageTransition.js) | full entry 세 개, `dist/modular/modules/pageTransition.js` | same-origin link 전환 때 대상 HTML을 요청합니다. `executeScripts`가 켜져 있으면 받은 container의 script를 다시 활성화하며, 실패 시 native navigation으로 전환합니다. |
| [`src/modules/lightbox.js`](../src/modules/lightbox.js) | full entry 세 개, `dist/modular/modules/lightbox.js` | 표시할 image/thumbnail `src`, opt-in EXIF read, 사용자가 누른 download, share 동작에만 도달합니다. |
| Ambient Media, Brush Reveal, Cursor, Lazy, Scroll Sequence | 각각의 modular module과 full entry | 소비자가 제공한 image/video/frame/sprite URL을 DOM `src`에 연결할 때 브라우저가 media를 요청합니다. library가 고정한 외부 host는 없습니다. |

0.9.3 공개 bundle의 기본 Lenis는 1.3.25였습니다. 다음 build의 1.3.26 CDN
자산은 jsDelivr 응답의 `x-jsd-version: 1.3.26`을 확인하고 npm
`lenis@1.3.26` tarball의 `dist/lenis.min.js`와 byte-for-byte 대조했습니다. 두 파일은
모두 18,722 bytes이며 SHA-384는
`sha384-jqpi9VmOdhyLoLURgjCn7EpnG9BbnHW57ibIZoeaIU+erWDH3k8fQQg0xH2ySjnw`입니다.
이 값은 runtime default와 engine regression test에 함께 고정합니다.

## 패키지 metadata 경계

공개 package는 런타임 `dependencies`와 `optionalDependencies`를 두지 않습니다.
GSAP·Lenis와 framework integration은 optional peer dependency 또는 on-demand CDN
경로로만 제공해 설치 시 암묵적인 실행 payload가 늘지 않도록 합니다. `npm run
test:deps`가 이 metadata 경계, source import, built bundle의 CDN loader와 UMD
크기를 함께 검사합니다.

## 잠금파일 registry 경계

세 개의 npm 잠금파일(`package-lock.json`, consumer fixture, framework fixture)은
lockfileVersion 3을 사용하고, 외부 패키지의 `resolved` URL을
`https://registry.npmjs.org/*.tgz`로 고정합니다. 각 registry 항목은 무결성
`integrity` 값을 가져야 하며, git·사설 registry·임의 tarball URL을 허용하지
않습니다. fixture가 로컬 Kineto 소스를 소비하는 경우에만
`node_modules/@dong-gri/kineto`가 `../..` npm link로 예외 처리됩니다.

이 경계는 `npm run test:lockfile-boundary`로 검사하며 `test:node`, CI, release
workflow에서 같은 명령을 실행합니다. lockfile을 갱신할 때 registry 변경이나
새로운 workspace link가 생기면 코드 변경과 같은 검토·근거를 남겨야 합니다.

## 주간 공급망 점검

`.github/workflows/supply-chain.yml`은 매주 월요일과 수동 dispatch에서 별도
공급망 점검을 실행합니다. `npm ci --ignore-scripts`로 루트 잠금 설치를 재현한 뒤
registry 경계를 확인하고 루트·consumer fixture·framework fixture의
`npm audit --audit-level=low` 결과를 각각 JSON으로 저장합니다. audit가 실패해도
SPDX SBOM, package-size, tarball 검사를 계속 실행하고 모든 보고서를 업로드한 뒤
job을 실패시켜 원인을 잃지 않습니다. 산출물은 14일 동안 workflow artifact로
보관합니다. 로컬 `npm run audit:lockfiles` 보고서는 `/artifacts/`에 생성하되 Git에서
제외해 `npm run verify` 뒤의 릴리스 준비 worktree를 오염시키지 않습니다.
`.github/dependabot.yml`은 세 npm 잠금파일과 GitHub Actions를 각각
매주 점검합니다. 패키지는 install lifecycle script를 제공하지 않는 정책을
유지합니다.

모든 외부 GitHub Action은 태그가 아니라 검토한 40자리 commit SHA로 고정합니다.
GitHub도 full-length commit SHA를 action release를 고정하는 유일한 불변 방식으로
안내합니다([Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use?learn=getting_started&learnProduct=actions)).
이 workflow는 공개 Socket 점수나 경고를 자동으로 대체하지 않으며, Socket 경고는
위의 분류 절차에 따라 별도로 검토·기록합니다.
