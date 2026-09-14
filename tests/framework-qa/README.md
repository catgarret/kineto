# Framework adapter QA

실제 React, Vue, jQuery 패키지에서 Kineto adapter의 mount/update/unmount,
React Strict Mode 반복 수명주기, React·Vue SSR 렌더와 hydration을 확인하는
독립 테스트 프로젝트입니다. Hydration fixture는 두 adapter가 update 재생성 시
실제로 받은 options revision이 `[0, 1]`인지도 검사합니다.

React·Vue의 mount/update/재진입 검사는 고정 100~120ms 대기 대신 기존
단언 전체가 충족되는지 최대 2초 동안 확인합니다. 완료 callback 누락이나
DOM 제거 실패는 제한 시간 뒤 마지막 실패 원인과 함께 실패합니다.
실행 전체를 재시도하거나 실패 단언을 생략하지 않습니다. 대기 helper의
즉시 성공·지연 성공·시간 초과·원인 보존 검사도 `npm run qa`에 포함됩니다.

```bash
cd tests/framework-qa
npm ci
npm run qa
```

Chromium 경로는 `MK_CHROMIUM` 또는 `KT_CHROME`, fixture의 Playwright Core,
저장소의 Playwright 순서로 찾고 마지막으로 `/usr/bin/chromium`을 사용합니다.
실행 파일을 바꿀 때는 소스를 수정하지 않고 환경 변수를 지정할 수 있습니다.
