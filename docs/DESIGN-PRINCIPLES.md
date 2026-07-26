# Kineto — 모듈 설계 원칙 (필수)

현재 50개 + **앞으로 추가/수정되는 모든 모듈**은 아래 5가지를 반드시 만족해야 한다.
빠진 모듈이 있으면 소급 적용한다.

1. **최적화 (Performance)** — 대기 상태에서 rAF/타이머 정지, `will-change`는 필요할 때만·끝나면 해제,
   `IntersectionObserver`로 오프스크린 작업 회피, 캔버스 `desynchronized` + DPR 클램프, passive 리스너.
2. **접근성 (Accessibility)** — 올바른 role/aria, 키보드 조작(Tab/Enter/Space/화살표/Esc), 포커스 관리,
   `prefers-reduced-motion` 자동 존중. 상태 변화는 스크린리더에 전달.
3. **단계적 기능축소 (Progressive enhancement / graceful degradation)** — JS/미지원 환경·저사양에서
   효과만 꺼지고 콘텐츠·기능은 유지. `destroy()`는 원본 DOM/스타일/속성을 완전 복원.
4. **쉬운 적용** — `data-kt-*` 속성 하나로 동작. 옵션도 속성 또는 API 옵션 객체로. 셀렉터/요소 모두 허용.
5. **쉬운 커스텀** — 디자인·효과·색·타이밍을 **옵션 + CSS 변수 + 클래스 훅**으로 자유롭게 바꿀 수 있어야 함.
   좋은 기본값을 제공하되 강제하지 않는다. 필요하면 headless(값만 흘려주는 콜백/CSS 변수) API도 제공
   (예: `progress`/`loader`의 `onUpdate`·`--kt-*-progress`, 커버/커서/토스트 등의 CSS 변수).

## 체크리스트 (새 모듈/변경 시)
- [ ] reduced-motion 분기(`reduced()` 또는 내부 가드)
- [ ] role/aria + 키보드 + 포커스
- [ ] destroy가 DOM/스타일/속성/리스너를 완전 복원 (플레이그라운드 재빌드 안전)
- [ ] 옵션은 kineto.features.json publicOptions와 **정확히 일치** (contract 테스트)
- [ ] CSS 변수/클래스 훅으로 색·디자인 커스텀 가능
- [ ] 플레이그라운드 등록(MODULE_ATTRIBUTES/PUBLIC_OPTIONS/FIELDS/DEFAULTS) + 데모 카드 + 코드 복사
- [ ] AI-PROMPT-GUIDE.md · module-reference 갱신
