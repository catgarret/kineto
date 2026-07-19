# MotionKit v0.8.0 QA Report

검증일: 2026-07-18  
대상: MotionKit v0.8.0 reconstructed complete source

## 결과 요약

| 영역 | 결과 | 세부 내용 |
|---|---|---|
| Lint | 통과 | ESLint: source, tests, playground |
| Build | 통과 | ESM 152.5 kB, UMD 251.9 kB, CSS 1.5 kB |
| Utility / SSR | 통과 | SSR import와 utility 회귀 검사 |
| Feature contract | 통과 | 32 modules, 20 Core APIs |
| Owner requirements | 통과 | 46 locked requirements |
| Generated docs | 통과 | `docs/module-reference.md` 동기화 |
| Package surface | 통과 | ESM, CommonJS, CSS, React/Vue/jQuery entry |
| Security audit | 통과 | 알려진 npm 취약점 0 |
| Tarball | 통과 | 73 files, unpacked 약 975 kB |
| Tarball install | 통과 | 새 프로젝트에서 실제 설치 후 import 검사 |
| Framework bundle | 통과 | React 19, Vue 3.5, jQuery 3.7 production build |
| Chromium functional assertions | 통과* | 58 playgrounds, 32-module lifecycle/UMD, animated media continuity |

`*` Chromium 기능 assertion은 현재 구현에서 성공 출력을 확인했습니다. 이후 문서·패키지·테스트 종료 처리만 변경했습니다. 반복 실행으로 컨테이너의 Chromium 런처가 소진되어 최종 패키징 직후 같은 묶음을 새 Chromium으로 다시 실행하지는 못했습니다.

## Chromium에서 확인한 동작

- 58개 Live Settings playground
- 옵션 변경, Apply/Replay, Reset, HTML/JavaScript code sync 및 Copy
- Counter Pop의 final-value-only 착지
- Skeleton shimmer/pulse placeholder
- Progressive Print/Dissolve의 changing fine noise
- MP3 Rewind/Page 4방향 mask 및 Rolling
- Card spotlight, surface reflection, luminous border
- Text Transition 및 Original RGB Glitch
- Reveal 4방향/class-only hook
- ScrollVelocity spring on/off 및 Vertical Sticky Stack
- Coverflow 1-step 이동, Cursor, Loader progress, Smooth toggle
- full-viewport Lightbox, group navigation, zoom/pan/minimap/custom UI
- GIF·animated WebP·APNG가 원본, Ambient clone, Lightbox에서 계속 재생
- MP4 재생 유지와 Ambient video frame sampling
- 32개 모듈 lifecycle 종료 후 active instance 0
- UMD global version 0.8.0 및 32개 registry

## 실제 tarball 설치 결과

설치 파일: `motionkit-0.8.0.tgz`

```json
{
  "version": "0.8.0",
  "modules": 32,
  "namedModules": 32,
  "react": true,
  "vue": true,
  "jquery": true,
  "css": true
}
```

CommonJS 검사:

```json
{"version":"0.8.0","modules":32}
```

## 검증하지 못한 환경

- Firefox
- Safari / WebKit
- 실제 iOS Safari
- 실제 Android Chrome 및 터치·진동 동작
- 실제 기기 장시간 메모리 프로파일링

외부 iframe 영상은 same-origin pixel access가 불가능하므로 `ambientSrc` 또는 `source`로 지정한 썸네일을 사용합니다.
