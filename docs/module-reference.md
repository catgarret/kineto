# Kineto Module Behavior Reference

> 이 문서는 `kineto.features.json`에서 생성됩니다. 직접 수정하지 말고 계약 파일을 명시적으로 변경한 뒤 `npm run docs:contract`를 실행하세요.

- Library: 0.8.30
- Feature contract: 1.3.0
- Behavior contract: 1.2.0
- Public modules: 41
- Root properties: `version`, `env`, `performance`, `registry`, `instanceCount`, `smoothEnabled`, `lenis`, `core`
- Core methods: `config()`, `setAnimationEngine()`, `enableSmooth()`, `disableSmooth()`, `toggleSmooth()`, `scrollTo()`, `register()`, `unregister()`, `create()`, `scan()`, `init()`, `initModules()`, `autoInit()`, `getInstance()`, `destroyModule()`, `replay()`, `destroy()`, `pause()`, `resume()`, `refresh()`
- Additional named exports: `modules`

각 모듈의 이름, 활성화 속성, 기본 모드, 허용 모드, 공개 옵션은 patch/minor 릴리스에서 임의로 변경할 수 없습니다.

## ambientMedia

- Attribute: `data-kt-ambient-media`
- Default variant: `image-clone`
- Variants: `image-clone`, `video-sample`, `color`
- Public options: `allowOverflow`, `ambientSrc`, `ambientSrcset`, `blur`, `brightness`, `color`, `fallbackColor`, `hideOnPause`, `inset`, `opacity`, `radius`, `sampleFps`, `sampleHeight`, `sampleWidth`, `saturation`, `scale`, `source`, `src`

## blurText

- Attribute: `data-kt-blur-text`
- Default variant: `blur`
- Variants: `blur`
- Public options: `duration`, `ease`, `onComplete`, `once`, `stagger`, `start`

## brushReveal

- Attribute: `data-kt-brush-reveal`
- Default variant: `brush`
- Variants: `brush`
- Public options: `blur`, `crossOrigin`, `fade`, `maxDpr`, `onError`, `opacity`, `persist`, `radius`, `revealSrc`, `softness`, `src`

## cardGlow

- Attribute: `data-kt-card-glow`
- Default variant: `spotlight`
- Variants: `spotlight`, `pointer`, `border`, `comet`, `aurora`, `shine`
- Public options: `alwaysOn`, `blendMode`, `blur`, `borderBlur`, `borderColor`, `borderColor2`, `borderGlow`, `borderInset`, `borderOpacity`, `borderRadius`, `borderWidth`, `color`, `color1`, `color2`, `cycleDuration`, `disableOnMobile`, `duration`, `ease`, `follow`, `halo`, `intensity`, `luminousBorder`, `mode`, `opacity`, `preset`, `radius`, `reflection`, `sensitivity`, `smoothing`, `speed`, `spread`, `surface`, `surfaceBlend`, `surfaceBlur`, `surfaceColor`, `surfaceColor2`, `surfaceGradient`, `surfaceInset`, `surfaceOpacity`, `surfaceSize`

## counter

- Attribute: `data-kt-counter`
- Default variant: `slot`
- Variants: `slot`, `plain`, `digit`, `pop`, `flip`, `clock`
- Public options: `bareBackground`, `blink`, `blinkSeparators`, `clockSeparator`, `clockStyle`, `comma`, `daysLabel`, `decimals`, `delay`, `duration`, `ease`, `format`, `from`, `gap`, `grouping`, `hour12`, `lineHeight`, `locale`, `loops`, `mode`, `onComplete`, `once`, `popAlign`, `popDuration`, `popScale`, `prefix`, `preset`, `rollDirection`, `rollDuration`, `seamColor`, `seconds`, `separator`, `separatorColor`, `shadow`, `showDays`, `since`, `stagger`, `start`, `style`, `suffix`, `tile`, `tileColor`, `tileRadius`, `tileTextColor`, `to`, `until`

## cssScroll

- Attribute: `data-kt-css-scroll`
- Default variant: `progress-property`
- Variants: `progress-property`, `css-animation-timeline`
- Public options: `cssAnimation`, `end`, `onUpdate`, `property`, `rangeEnd`, `rangeStart`, `start`

## cursor

- Attribute: `data-kt-cursor`
- Default variant: `dot`
- Variants: `dot`, `ring`, `blob`, `crosshair`, `text`, `trail`, `orbit`, `snake`, `sparkle`, `image`, `custom`
- Public options: `backdropFilter`, `background`, `blur`, `borderColor`, `borderWidth`, `className`, `clickImage`, `clickImageDuration`, `clickImageSize`, `clickSprite`, `clickSpriteDuration`, `clickSpriteFrames`, `clickSpriteHeight`, `clickSpriteWidth`, `color`, `crosshairSize`, `dot`, `dotColor`, `dotSize`, `ease`, `follower`, `followerSize`, `full`, `global`, `height`, `hiddenSelector`, `hideDotOnHover`, `hoverBackground`, `hoverClass`, `hoverColor`, `hoverDotOpacity`, `hoverDotSize`, `hoverEffect`, `hoverLabel`, `hoverScale`, `hoverSelector`, `hoverSrc`, `hoverTemplate`, `html`, `label`, `labelColor`, `labelSize`, `mixBlendMode`, `onEnter`, `onLeave`, `opacity`, `orbitHoverScale`, `orbitRadius`, `orbitSpeed`, `orbitSquash`, `orbitText`, `preset`, `pressScale`, `radius`, `rotate`, `rotateDuration`, `rotateText`, `shadow`, `shape`, `smoothing`, `snakeGap`, `snakeMinScale`, `snakeScaleEase`, `snakeText`, `sparkleColor`, `sparkleColor2`, `sparkleDuration`, `sparkleSize`, `sparkleSymbols`, `sparkleThrottle`, `speed`, `spring`, `src`, `template`, `text`, `textColor`, `trailColor`, `trailCount`, `trailSize`, `type`, `width`, `zIndex`

## fullpage

- Attribute: `data-kt-fullpage`
- Default variant: `transform`
- Variants: `transform`, `snap`
- Public options: `autoAdvance`, `axis`, `dots`, `drag`, `duration`, `ease`, `height`, `initial`, `keyboard`, `loop`, `mode`, `onChange`, `onLeave`, `sectionSelector`, `threshold`, `touch`, `wheel`

## glitch

- Attribute: `data-kt-glitch`
- Default variant: `rgb`
- Variants: `rgb`, `noise`, `crt`, `digital`, `image`, `vcr`
- Public options: `blendMode`, `colors`, `delay`, `duration`, `intensity`, `loop`, `preset`, `sliceCount`, `speed`, `trigger`, `type`

## lazy

- Attribute: `data-kt-lazy`
- Default variant: `fade`
- Variants: `fade`, `blur-up`, `skeleton`, `pixelate`, `print`, `dissolve`, `flicker`, `polaroid`
- Public options: `animated`, `aspectRatio`, `blur`, `crossOrigin`, `delay`, `direction`, `display`, `duration`, `ease`, `edgeOpacity`, `edgeWidth`, `effect`, `fadeDuration`, `fallbackSrc`, `feather`, `flickerBackground`, `frame`, `frameColor`, `glitchStrength`, `height`, `holdDuration`, `keepFrame`, `maxDpr`, `minDuration`, `nativeLazy`, `noise`, `noiseBlend`, `noiseContrast`, `noiseFps`, `noiseHeight`, `noiseWidth`, `objectFit`, `objectPosition`, `onError`, `onLoad`, `onProgress`, `pixelEnd`, `pixelStart`, `pixelStepCount`, `preset`, `renderFps`, `rootMargin`, `rotate`, `sizes`, `skeletonAngle`, `skeletonColor`, `skeletonHighlight`, `skeletonIcon`, `skeletonSpeed`, `skeletonVariant`, `sliceCount`, `src`, `srcset`, `startScale`, `stepCount`, `stepDuration`, `steps`, `threshold`, `variant`

## lightbox

- Attribute: `data-kt-lightbox`
- Default variant: `viewer`
- Variants: `viewer`, `grouped`
- Public options: `alt`, `backdropBlur`, `backdropColor`, `backdropOpacity`, `caption`, `className`, `closeOnBackdrop`, `cursor`, `description`, `doubleClickZoom`, `duration`, `exif`, `group`, `info`, `lazyEffect`, `lazyOptions`, `lightboxDuration`, `maxZoom`, `metadata`, `minZoom`, `minimap`, `onChange`, `onClose`, `onLoad`, `onOpen`, `radius`, `renderUI`, `share`, `src`, `title`, `toolbar`, `uiTemplate`, `wheelStep`, `zoom`, `zoomStep`

## loader

- Attribute: `data-kt-loader`
- Default variant: `bar`
- Variants: `slot`, `circular`, `bar`
- Public options: `ariaLabel`, `barHeight`, `barWidth`, `className`, `color`, `completeHold`, `completeOnError`, `duration`, `exit`, `exitDirection`, `exitDuration`, `expectedResources`, `fetch`, `fetchOptions`, `fill`, `fillColor`, `hideScrollbar`, `label`, `labelBlend`, `labelColor`, `manualDuration`, `minDuration`, `onComplete`, `onError`, `onProgress`, `percent`, `preset`, `progress`, `progressSource`, `promise`, `promiseCeiling`, `promiseStart`, `renderUI`, `resourceSelector`, `resources`, `showPercent`, `size`, `smoothing`, `source`, `stroke`, `trackColor`, `transition`, `type`, `url`

## magnetic

- Attribute: `data-kt-magnetic`
- Default variant: `pointer`
- Variants: `pointer`
- Public options: `ease`, `radius`, `strength`

## marquee

- Attribute: `data-kt-marquee`
- Default variant: `left`
- Variants: `left`, `right`, `reverse-on-scroll`
- Public options: `clones`, `direction`, `pauseOnHover`, `reverseOnScrollUp`, `scrollAcceleration`, `skew`, `speed`

## mouseParallax

- Attribute: `data-kt-mouse-parallax`
- Default variant: `pointer`
- Variants: `pointer`, `gyro`, `compass`
- Public options: `compassRange`, `ease`, `global`, `gyro`, `maxX`, `maxY`, `mode`, `preset`, `rotateOffset`, `sensitivity`, `smoothing`, `speed`

## overflowText

- Attribute: `data-kt-overflow-text`
- Default variant: `loop`
- Variants: `loop`, `bounce`, `rewind`, `once`, `page`, `flip`, `dissolve`, `page-roll`, `rolling`
- Public options: `ariaLive`, `delay`, `direction`, `dissolveDuration`, `easing`, `ellipsis`, `endPause`, `flipDirection`, `flipDuration`, `force`, `gap`, `holdDuration`, `items`, `jitter`, `maskDirection`, `maskDuration`, `maskEase`, `mode`, `onChange`, `onPage`, `pageDuration`, `pageOverlap`, `pauseOnHover`, `perspective`, `preset`, `repeat`, `restartDelay`, `role`, `rollDirection`, `rollDuration`, `speed`, `text`, `threshold`, `title`, `transitionDirection`

## pageReveal

- Attribute: `data-kt-page-reveal`
- Default variant: `curtain`
- Variants: `curtain`, `split`, `circle`, `wipe`, `blinds`, `diagonal`, `fade`
- Public options: `angle`, `axis`, `color`, `color2`, `count`, `delay`, `direction`, `duration`, `ease`, `effect`, `onComplete`, `preset`, `stagger`

## pageTransition

- Attribute: `data-kt-page-transition`
- Default variant: `same-origin`
- Variants: `same-origin`
- Public options: `animationSelector`, `cache`, `container`, `executeScripts`, `linkSelector`, `minDuration`, `onClick`, `onEnter`, `onError`, `onLeave`, `scrollTop`

## parallax

- Attribute: `data-kt-parallax`
- Default variant: `y`
- Variants: `x`, `y`
- Public options: `axis`, `distance`, `end`, `onUpdate`, `scrub`, `speed`, `start`

## progress

- Attribute: `data-kt-progress`
- Default variant: `page:scaleX`
- Variants: `page:scaleX`, `page:width`, `element:scaleX`, `element:width`
- Public options: `attach`, `clickToTop`, `color`, `color2`, `hideAtEnd`, `label`, `offset`, `onUpdate`, `position`, `property`, `radius`, `showAfter`, `showPercent`, `size`, `smoothing`, `stroke`, `target`, `thickness`, `trackColor`, `ui`, `zIndex`

## reveal

- Attribute: `data-kt-reveal`
- Default variant: `fade-up`
- Variants: `fade`, `fade-up`, `fade-down`, `fade-left`, `fade-right`, `slide-up`, `slide-down`, `slide-left`, `slide-right`, `zoom`, `zoom-in`, `zoom-out`, `blur`, `rise`, `soft`, `flip`, `flip-x`, `flip-y`, `rotate`, `mask`, `wipe`, `class`, `clock`
- Public options: `activeClass`, `classOnly`, `clockDirection`, `delay`, `direction`, `duration`, `ease`, `end`, `enterClass`, `leaveClass`, `onClassChange`, `onComplete`, `onEnter`, `onEnterBack`, `onLeave`, `onLeaveBack`, `once`, `preset`, `removeClassOnLeave`, `rootMargin`, `spring`, `stagger`, `start`, `startAngle`, `threshold`

## ripple

- Attribute: `data-kt-ripple`
- Default variant: `material`
- Variants: `material`
- Public options: `centered`, `color`, `disableInReducedMotion`, `duration`, `easing`, `opacity`, `scale`, `unbounded`

## scrollSequence

- Attribute: `data-kt-scroll-sequence`
- Default variant: `cover`
- Variants: `cover`, `contain`
- Public options: `crossOrigin`, `end`, `extension`, `fit`, `frames`, `height`, `maxDpr`, `onError`, `onFrame`, `padding`, `preloadRadius`, `scrollLength`, `scrub`, `start`, `top`, `urlPrefix`, `urls`, `vhPerFrame`

## scrollVelocity

- Attribute: `data-kt-scroll-velocity`
- Default variant: `skew`
- Variants: `skew`, `rotate`, `scale`, `blur`, `translate`
- Public options: `axis`, `damping`, `decay`, `distance`, `effect`, `elastic`, `end`, `global`, `mass`, `maxBlur`, `maxRotate`, `maxScale`, `maxSkew`, `mode`, `onDirection`, `onUpdate`, `preset`, `response`, `reverse`, `smoothing`, `spring`, `start`, `stiffness`, `velocityDivisor`

## shuffle

- Attribute: `data-kt-shuffle`
- Default variant: `decode`
- Variants: `decode`
- Public options: `chars`, `onComplete`, `rainbow`, `rainbowColors`, `revealRate`, `rootMargin`, `scrambleFade`, `speed`, `text`, `threshold`

## slider

- Attribute: `data-kt-slider`
- Default variant: `slide`
- Variants: `slide`, `coverflow`
- Public options: `align`, `autoplay`, `axis`, `depth`, `duration`, `effect`, `gap`, `initial`, `label`, `loop`, `minOpacity`, `minScale`, `nextSelector`, `onChange`, `opacityStep`, `pauseOnHover`, `perView`, `perspective`, `preset`, `prevSelector`, `rotate`, `scaleStep`, `smoothing`, `spacing`, `speed`

## stickyStack

- Attribute: `data-kt-sticky-stack`
- Default variant: `vertical`
- Variants: `vertical`, `horizontal`, `zindex`, `floating`
- Public options: `align`, `blur`, `bottomSpace`, `distance`, `ease`, `effect`, `end`, `fadePrevious`, `gap`, `itemDuration`, `itemHeight`, `minHeight`, `mode`, `offset`, `offsetTop`, `offsetY`, `onProgress`, `overlap`, `panelWidth`, `perspective`, `pin`, `pinSpacing`, `preset`, `previousBlur`, `previousOpacity`, `previousScale`, `previousY`, `reverseZ`, `rotate`, `scaleFrom`, `scalePrevious`, `scrollLength`, `scrub`, `snap`, `start`, `top`, `transformOrigin`, `transitionStartOffset`, `type`

## textFill

- Attribute: `data-kt-text-fill`
- Default variant: `scroll-fill`
- Variants: `scroll-fill`
- Public options: `baseColor`, `end`, `fillColor`, `onUpdate`, `scrub`, `start`

## textReveal

- Attribute: `data-kt-text-reveal`
- Default variant: `stream`
- Variants: `stream`, `char`, `word`, `line`, `bounce`, `hangul`, `decode`, `flicker`
- Public options: `chars`, `delay`, `duration`, `ease`, `flickerCount`, `flickerLoop`, `hold`, `loop`, `mode`, `onComplete`, `preset`, `rainbow`, `rainbowColors`, `rootMargin`, `scrambleFade`, `speed`, `stagger`, `text`, `threshold`

## textSplit

- Attribute: `data-kt-text-split`
- Default variant: `char`
- Variants: `char`, `word`
- Public options: `animation`, `by`, `delay`, `duration`, `ease`, `hold`, `onComplete`, `onSwap`, `once`, `pause`, `perspective`, `preset`, `stagger`, `start`, `swapEase`, `swapOut`, `texts`

## textTransition

- Attribute: `data-kt-text-transition`
- Default variant: `slide`
- Variants: `slide-up`, `slide`, `rise`, `fade`, `blur`, `scale`, `clip`, `dissolve`, `shimmer`
- Public options: `ariaLive`, `baseColor`, `blur`, `charMode`, `duration`, `ease`, `effect`, `endScale`, `hold`, `jitter`, `loop`, `minHeight`, `onChange`, `onComplete`, `pause`, `preset`, `shimColor`, `shimSpeed`, `stagger`, `startScale`, `texts`

## tilt

- Attribute: `data-kt-tilt`
- Default variant: `tilt-glare`
- Variants: `tilt-glare`, `tilt`, `x-only`, `y-only`, `reverse`
- Public options: `axis`, `disableOnMobile`, `ease`, `glare`, `glareBlur`, `glareColor`, `glareOpacity`, `glareRadius`, `gyro`, `max`, `maxX`, `maxY`, `perspective`, `reset`, `reverse`, `scale`, `sensitivity`, `smoothing`

## typewriter

- Attribute: `data-kt-typewriter`
- Default variant: `type-erase`
- Variants: `type-erase`
- Public options: `caret`, `caretChar`, `compose`, `eraseSpeed`, `hangul`, `loop`, `onComplete`, `pauseAfter`, `strings`, `typeSpeed`

## vibrate

- Attribute: `data-kt-vibrate`
- Default variant: `tap`
- Variants: `tap`, `double-tap`, `soft`, `rigid`, `heavy`, `success`, `warning`, `error`, `ratchet`, `heartbeat`, `long-press`
- Public options: `haptic`, `pattern`, `preset`, `threshold`, `trigger`

## confetti

- Attribute: `data-kt-confetti`
- Default variant: `burst`
- Variants: `burst`
- Public options: `colors`, `count`, `duration`, `gravity`, `scalar`, `spread`, `trigger`, `zIndex`

## accordion

- Attribute: `data-kt-accordion`
- Default variant: `panel`
- Variants: `panel`
- Public options: `arrowPosition`, `blur`, `duration`, `ease`, `single`

## hold

- Attribute: `data-kt-hold`
- Default variant: `confirm`
- Variants: `confirm`
- Public options: `color`, `duration`, `onComplete`

## megaMenu

- Attribute: `data-kt-mega-menu`
- Default variant: `dropdown`
- Variants: `dropdown`, `mega`
- Public options: `closeDelay`, `duration`, `layout`, `openDelay`, `trigger`

## toast

- Attribute: `data-kt-toast`
- Default variant: `stack`
- Variants: `stack`
- Public options: `dismissible`, `duration`, `message`, `position`, `type`

## bottomSheet

- Attribute: `data-kt-bottom-sheet`
- Default variant: `sheet`
- Variants: `sheet`
- Public options: `backdrop`, `backdropOpacity`, `dismissible`, `duration`, `handle`, `trigger`

## tabs

- Attribute: `data-kt-tabs`
- Default variant: `line`
- Variants: `line`
- Public options: `activation`, `duration`, `effect`, `indicator`, `orientation`
