# dateTime

서버가 렌더링한 날짜를 절대 날짜 또는 상대 시간으로 표시합니다. ISO/RFC, Unix timestamp, `YYYY.MM.DD`, `YYYY/MM/DD`, `YYYY년 M월 D일` 형식을 인식합니다.

```html
<time data-kt-date-time data-kt-date="2026년 8월 9일 10:30">2026년 8월 9일 10:30</time>
<time data-kt-date-time data-kt-date="2026-08-09T10:30:00+09:00" data-kt-mode="both"></time>
```

`mode`는 `relative`(기본), `absolute`, `both`를 지원합니다. `locale`, `timeZone`, `dateStyle`, `timeStyle`, `updateInterval`, `live:false`로 표시와 갱신을 조절할 수 있습니다. 모호한 날짜 형식은 추측하지 않고 브라우저 파서에 맡기며, 해석할 수 없으면 원문 또는 `fallback`을 유지합니다.
