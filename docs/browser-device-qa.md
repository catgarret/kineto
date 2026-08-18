# 실기기 브라우저 QA 실행표

`browser-qa-matrix.md`의 `evergreen-touch`와 `evergreen-scroll`은 에뮬레이션과
자동 smoke의 범위입니다. 이 문서는 iOS Safari와 Android Chrome에서 실제
하드웨어·viewport·키보드/IME·URL bar 동작을 확인할 때 남길 증거 형식입니다.

## 실행 대상

| 대상 | 최소 기록 항목 | 현재 상태 |
|---|---|---|
| iPhone Safari | 기기 모델, iOS 버전, Safari 버전, orientation, reduced motion | 미실행 |
| Android Chrome | 기기 모델, Android 버전, Chrome 버전, orientation, font scale | 미실행 |

## 수동 실행 순서

1. 배포된 canonical URL과 backup URL을 각각 열고, 캐시를 새로 고칩니다.
2. 첫 화면에서 한 번의 wheel/touch 이동, 역방향 이동, 브라우저 URL bar 표시·숨김을 확인합니다.
3. Mega Menu와 Dropdown을 한 번 탭하고, 메뉴가 같은 trigger 아래에 열리는지 확인합니다.
4. Slider와 Radial Carousel을 한 손가락으로 끌고, release 후 관성과 고스트 이미지가 없는지 확인합니다.
5. Fullpage 내부 스크롤을 끝까지 내린 뒤 다음 섹션으로 이동하고, 다시 돌아왔을 때 내부 `scrollTop`이 보존되는지 확인합니다.
6. Terminal/Spinner, Page Reveal, Brush Reveal, Counter/Relative time의 대표 fixture를 확인합니다.

## 증거 저장 형식

실패가 있으면 `docs/qa-evidence/<YYYY-MM-DD>/<device>/` 아래에 다음을 저장합니다.

- `environment.md`: 기기·OS·브라우저·orientation·reduced motion·네트워크
- `steps.md`: 재현 순서와 기대/실제 결과
- `before.png`, `after.png`: 고스트·클리핑·정렬 문제의 전후 화면
- `console.txt`: 개발자 도구 오류와 경고
- `screen-recording.*` (선택): 관성·URL bar·메뉴 위치처럼 정지 화면으로 부족한 경우

수동 검증 결과는 자동 CI 통과율에 합산하지 않습니다. `browser-qa-history.md`에
실행 날짜, 커밋, 두 도메인, 기기 정보, 결과와 증거 경로를 별도 행으로 남깁니다.
실기기 접근이 없는 CI에서는 Playwright touch emulation만 실행하며, 이를 실제
iOS/Android 성공으로 표기하지 않습니다.
