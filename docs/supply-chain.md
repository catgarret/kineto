# 공급망 운영

Kineto의 공급망 안전성은 단일 점수로 판단하지 않습니다. npm provenance,
릴리스 태그, 실제 tarball, CDN 무결성, 의존성 변경 이력을 함께 확인합니다.

## 릴리스 전 확인

1. `npm run verify`로 린트·빌드·계약·브라우저·패키지 크기·tarball 검사를 통과시킵니다.
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
공급망 점검을 실행합니다. `npm ci --ignore-scripts`로 잠금 설치를 재현한 뒤
lockfile registry 경계, `npm audit --audit-level=low`, SPDX SBOM 생성,
`npm pack --dry-run`을 차례로 확인합니다. SBOM과 점검 산출물은 14일 동안
workflow artifact로 보관해 특정 실행의 의존성 표면을 재검토할 수 있습니다.
`.github/dependabot.yml`은 npm과 GitHub Actions 업데이트를 서로 분리해 매주
제안하며, 패키지는 install lifecycle script를 제공하지 않는 정책을 유지합니다.
이 workflow는 공개 Socket 점수나 경고를 자동으로 대체하지 않으며, Socket 경고는
위의 분류 절차에 따라 별도로 검토·기록합니다.
