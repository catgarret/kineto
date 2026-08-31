# dateTime

서버가 렌더링한 날짜를 절대 날짜 또는 상대 시간으로 표시합니다. ISO/RFC, Unix timestamp, SQL datetime, `YYYY.MM.DD`, `YYYY/MM/DD`, `YYYY년 M월 D일` 형식을 인식합니다. 달력에 존재하지 않는 날짜는 자동 보정하지 않고 원문 또는 `fallback`으로 남깁니다.

```html
<time data-kt-date-time data-kt-date="2026년 8월 9일 10:30">2026년 8월 9일 10:30</time>
<time data-kt-date-time data-kt-date="2026-08-09T10:30:00+09:00" data-kt-mode="both"></time>
```

`mode`는 `relative`(기본), `absolute`, `both`를 지원합니다. 상대 표기는 `second`, `minute`, `hour`, `day`, `week`, `month`, `year`를 자동 선택하거나 `relativeUnit`으로 고정할 수 있으며, `relativeRounding`은 `round`(기본), `floor`, `ceil`, `trunc`을 지원합니다. `relativeStyle`은 `long`, `short`, `narrow` 중에서 고릅니다.

`relativeCutoff`(0이면 사용 안 함)와 `relativeCutoffUnit`을 설정하면 `relative` 모드는 해당 기간을 넘긴 날짜를 현지화된 절대 시각으로 자동 전환합니다. 예를 들어 `relativeCutoff: 30`, `relativeCutoffUnit: 'day'`는 30일 이내에는 `n일 전`, 그 이후에는 원래 날짜를 표시합니다. `both`는 요청한 대로 상대·절대 표기를 항상 함께 유지합니다.

`locale`, `timeZone`, `dateStyle`, `timeStyle`, `updateInterval`, `live:false`로 표시와 갱신을 조절할 수 있습니다. `YYYY-MM-DD HH:mm[:ss]`처럼 시간대가 없는 SQL/ISO 문자열은 한국어 locale에서 서버 관례에 맞춰 +09:00으로 정규화하여 UTC와 브라우저의 결과가 달라지지 않게 합니다. `MM/DD/YYYY`처럼 모호한 숫자형 날짜는 `en-US`에서는 월-일, 그 외 locale에서는 일-월 규칙을 사용하며, 해석할 수 없으면 원문 또는 `fallback`을 유지합니다.
