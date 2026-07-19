# ambientMedia

영상은 프레임을 저해상도 Canvas로 sampling하고, 이미지는 살아 있는 복제 `<img>`를 blur 처리해 YouTube형 주변 Ambient Glow를 만듭니다.

| variant | 동작 |
|---|---|
| `image-clone` | 원본/`data-src` 이미지를 복제해 blur·saturation·brightness 적용 |
| `video-sample` | 재생 중인 `<video>` 프레임을 낮은 FPS로 sampling |
| `color` | 지정 색상 또는 fallback 색상 glow |

```html
<video data-kt-ambient-media="video-sample" autoplay muted loop playsinline src="movie.mp4"></video>
<img data-kt-ambient-media="image-clone" data-src="motion-demo.gif" alt="Animated image">
```

이미지 clone은 GIF·APNG·animated WebP의 재생을 유지합니다. `blur`, `opacity`, `scale`, `inset`, `saturation`, `brightness`, `sampleFps`를 조절할 수 있습니다.

iframe 영상은 보안 경계 때문에 내부 픽셀을 직접 읽지 않습니다. `ambientSrc` 또는 `source`에 썸네일 이미지를 지정합니다.

Glow는 미디어 뒤에 보이지만 page stacking context 뒤로 사라지지 않아야 하며, `destroy()`는 wrapper와 media의 원래 style을 복원합니다.
