# Framework adapter QA

실제 React, Vue, jQuery 패키지에서 Kineto adapter의 mount/update/unmount,
React Strict Mode 반복 수명주기, React·Vue SSR 렌더와 hydration을 확인하는
독립 테스트 프로젝트입니다. Hydration fixture는 두 adapter가 update 재생성 시
실제로 받은 options revision이 `[0, 1]`인지도 검사합니다.

```bash
cd tests/framework-qa
npm install
npm run qa
```

Chromium 실행 파일은 기본적으로 `/usr/bin/chromium`을 사용합니다. 다른 환경에서는 `run-qa.mjs`의 `executablePath`를 조정합니다.
