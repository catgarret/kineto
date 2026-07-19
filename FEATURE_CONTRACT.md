# Kineto Feature Contract

이 문서는 Kineto의 **공개 기능 범위 잠금 규칙**입니다. 기계 판독 원본은 `kineto.features.json`이며, 소유자가 의도한 시각 동작은 `kineto.requirements.json`과 `OWNER_REQUIREMENTS.md`가 함께 규정합니다.

## 공개 범위

- 라이브러리 버전: `0.8.0`
- 기능 계약 버전: `1.3.0`
- 동작 계약 버전: `1.2.0`
- 공개 모듈: 정확히 **32개**
- Core public property: **8개**
- Core API: **20개**
- compatibility API: **9개**
- additional named export: `modules`

모듈명, `data-kt-*` 활성화 속성, 기본 variant, 허용 variant, 공개 option은 정확한 allowlist입니다. 자동 생성된 세부 표는 [`docs/module-reference.md`](docs/module-reference.md)를 확인합니다.

## 중요 동작 계약

- **duplicateInitialization**: Creating the same module on the same source element returns the existing instance.
- **destroy**: Destroy removes listeners, observers, timers, RAF handles, generated UI and restores owned DOM state.
- **replay**: Replay destroys and recreates the same module with prior or replacement options.
- **reducedMotion**: Reduced-motion mode does not start nonessential infinite animation loops.
- **animatedMedia**: GIF, APNG and animated WebP remain live media elements through Lazy, Ambient and Lightbox composition.
- **lazyNoise**: Print and Dissolve use changing fine-noise frames rather than a repeating static pattern.
- **loaderSources**: Loader accepts manual, promise, fetch, resource and window progress sources.
- **lightboxViewer**: Lightbox covers the full viewport and supports grouped navigation, information, zoom, pan, minimap and custom UI.
- **smoothScroll**: Lenis smooth scrolling is opt-in and can be enabled or disabled at runtime.
- **boundedCardGlow**: Pointer glow remains clipped while optional surface reflection and luminous border are independently configurable.

## 변경 금지 규칙

1. 소유자의 명시적 요청 없이 모듈·variant·option·API를 삭제, 이름 변경, 병합, 분리 또는 재분류하지 않습니다.
2. 구현이 어렵다는 이유로 시각적으로 다른 단순 효과로 대체하지 않습니다.
3. 데모 누락은 기능 삭제 사유가 아니라 데모 버그입니다.
4. 문서와 코드가 충돌하면 문서를 구현에 맞춰 낮추지 않고, 소유자 요구사항과 기존 의도를 확인해 구현을 교정합니다.
5. 새 기능은 opt-in으로 추가하며 기존 variant의 의미를 몰래 바꾸지 않습니다.
6. 테스트를 통과시키기 위해 계약 JSON을 축소하거나 실제 구현에 없는 기능을 기록하지 않습니다.
7. 공개 동작 변경은 구현·데모·테스트·문서·계약·`CHANGELOG.md`를 함께 갱신합니다.
8. breaking change는 major version, migration guide, deprecation period, 소유자 승인이 필요합니다.

## 계약 우선순위

1. 소유자의 구체적인 최신 요청
2. `kineto.requirements.json` / `OWNER_REQUIREMENTS.md`
3. `kineto.features.json` / 이 문서
4. 자동 테스트로 확인된 기존 공개 동작
5. 모듈 문서와 데모
6. 구현 세부사항

충돌을 발견하면 기능을 삭제해 숫자를 맞추지 않고, 충돌을 드러내고 보존 쪽으로 수정합니다.

## 필수 검증

```bash
npm run verify
```

이 명령은 lint, ESM/UMD 빌드, 공개 surface, 46개 소유자 요구사항, 생성 문서, Chromium lifecycle, 애니메이션 미디어 연속성, 58개 플레이그라운드, package surface, audit, tarball 내용을 검사합니다. 빌드 성공만으로는 완료가 아닙니다.
