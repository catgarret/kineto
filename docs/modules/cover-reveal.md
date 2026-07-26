# coverReveal

색상 커버가 요소를 덮었다가 지정한 방향으로 걷히며 콘텐츠를 드러냅니다. 이미지, 텍스트 줄, 갤러리 타일에 적용할 수 있습니다.

```html
<div
  data-kt-cover-reveal
  data-kt-color="#ff5b1c"
  data-kt-color2="#12141a"
  data-kt-layers="2"
  data-kt-direction="random"
>
  <img src="work.webp" alt="">
</div>
```

`direction`은 `up`, `down`, `left`, `right`, `random`을 지원합니다. `random`은 재생할 때마다 방향을 다시 선택합니다. 텍스트에는 `lines:true`, 이미지에는 `waitForImage:true`를 사용할 수 있습니다.

갤러리 순서까지 바꾸려면 같은 컨테이너에 `flip`을 함께 적용하고 `flip.shuffle()` 뒤 각 coverReveal 인스턴스를 replay합니다. `destroy()`는 생성한 wrapper와 cover layer를 제거하고 원래 콘텐츠 구조를 복원합니다.
