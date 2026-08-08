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
