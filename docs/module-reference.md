# Kineto Module Behavior Reference

> 이 문서는 `kineto.features.json`에서 생성됩니다. 직접 수정하지 말고 계약 파일을 명시적으로 변경한 뒤 `npm run docs:contract`를 실행하세요.

- Library: 0.8.45
- Feature contract: 1.3.0
- Behavior contract: 1.2.0
- Public modules: 51
- Root properties: `version`, `easings`, `prefersReducedMotion`, `env`, `performance`, `registry`, `instanceCount`, `smoothEnabled`, `lenis`, `core`
- Core methods: `autoInit()`, `config()`, `create()`, `destroy()`, `destroyModule()`, `disableSmooth()`, `easing()`, `easingFn()`, `enableSmooth()`, `getEngineSource()`, `getInstance()`, `init()`, `initModules()`, `listTerminalFramePresets()`, `pause()`, `refresh()`, `register()`, `replay()`, `resume()`, `scan()`, `scrollTo()`, `setAnimationEngine()`, `setEngineSource()`, `setReducedMotion()`, `toggleSmooth()`, `unregister()`, `updateModule()`
- Additional named exports: `modules`, `listTerminalFramePresets`

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
- Public options: `blur`, `crossOrigin`, `fade`, `hold`, `maxDpr`, `onError`, `onProgress`, `onReveal`, `opacity`, `persist`, `radius`, `revealSrc`, `softness`, `src`, `threshold`

## cardGlow

- Attribute: `data-kt-card-glow`
- Default variant: `spotlight`
- Variants: `spotlight`, `pointer`, `border`, `comet`, `aurora`, `shine`
- Public options: `alwaysOn`, `blendMode`, `blur`, `borderBlur`, `borderColor`, `borderColor2`, `borderGlow`, `borderInset`, `borderOpacity`, `borderRadius`, `borderWidth`, `color`, `color1`, `color2`, `cycleDuration`, `disableOnMobile`, `duration`, `ease`, `follow`, `halo`, `intensity`, `luminousBorder`, `mode`, `opacity`, `preset`, `radius`, `reflection`, `sensitivity`, `shadow`, `shadowBlur`, `shadowColor`, `shadowCss`, `shadowFollow`, `shadowHoverOnly`, `shadowInset`, `shadowOpacity`, `shadowSpread`, `shadowX`, `shadowY`, `smoothing`, `speed`, `spread`, `surface`, `surfaceBlend`, `surfaceBlur`, `surfaceColor`, `surfaceColor2`, `surfaceGradient`, `surfaceInset`, `surfaceOpacity`, `surfaceSize`

## counter

- Attribute: `data-kt-counter`
- Default variant: `slot`
- Variants: `slot`, `plain`, `digit`, `pop`, `flip`, `clock`
- Public options: `blink`, `blinkSeparators`, `clockSeparator`, `clockStyle`, `comma`, `daysLabel`, `decimals`, `delay`, `duration`, `ease`, `format`, `from`, `gap`, `grouping`, `hour12`, `lineHeight`, `locale`, `loops`, `mode`, `onComplete`, `once`, `popAlign`, `popDuration`, `popScale`, `prefix`, `preset`, `rollDirection`, `rollDuration`, `seamColor`, `seconds`, `separator`, `separatorColor`, `shadow`, `showDays`, `since`, `stagger`, `start`, `style`, `suffix`, `tileColor`, `tileRadius`, `tileTextColor`, `to`, `until`

## cssScroll

- Attribute: `data-kt-css-scroll`
- Default variant: `progress-property`
- Variants: `progress-property`, `css-animation-timeline`, `scroll-timeline`
- Public options: `axis`, `cssAnimation`, `end`, `onUpdate`, `property`, `rangeEnd`, `rangeStart`, `start`, `timeline`

## cursor

- Attribute: `data-kt-cursor`
- Default variant: `dot`
- Variants: `dot`, `ring`, `blob`, `crosshair`, `text`, `trail`, `orbit`, `snake`, `sparkle`, `image`, `custom`
- Public options: `backdropFilter`, `background`, `blur`, `borderColor`, `borderWidth`, `className`, `clickImage`, `clickImageDuration`, `clickImageSize`, `clickSprite`, `clickSpriteDuration`, `clickSpriteFrames`, `clickSpriteHeight`, `clickSpriteWidth`, `color`, `crosshairSize`, `dot`, `dotColor`, `dotShadow`, `dotSize`, `ease`, `follower`, `followerSize`, `full`, `global`, `height`, `hiddenSelector`, `hideDotOnHover`, `hoverBackground`, `hoverClass`, `hoverColor`, `hoverDotOpacity`, `hoverDotSize`, `hoverEffect`, `hoverLabel`, `hoverScale`, `hoverSelector`, `hoverShadow`, `hoverSrc`, `hoverTemplate`, `html`, `label`, `labelColor`, `labelSize`, `mixBlendMode`, `onEnter`, `onLeave`, `opacity`, `orbitHoverScale`, `orbitRadius`, `orbitSpeed`, `orbitSquash`, `orbitText`, `preset`, `pressScale`, `radius`, `rotate`, `rotateDuration`, `rotateText`, `shadow`, `shape`, `smoothing`, `snakeGap`, `snakeMinScale`, `snakeScaleEase`, `snakeText`, `sparkleColor`, `sparkleColor2`, `sparkleDuration`, `sparkleSize`, `sparkleSymbols`, `sparkleThrottle`, `speed`, `spring`, `src`, `template`, `text`, `textColor`, `trailColor`, `trailCount`, `trailSize`, `type`, `width`, `zIndex`

## fullpage

- Attribute: `data-kt-fullpage`
- Default variant: `transform`
- Variants: `transform`, `snap`
- Public options: `autoAdvance`, `axis`, `dots`, `drag`, `duration`, `ease`, `height`, `initial`, `keyboard`, `loop`, `mode`, `onChange`, `onLeave`, `sectionSelector`, `threshold`, `touch`, `wheel`

## glitch

- Attribute: `data-kt-glitch`
- Default variant: `rgb`
- Variants: `rgb`, `pixel`, `noise`, `crt`, `digital`, `image`, `datamosh`, `reveal`, `vcr`, `rgb-slice-burst`
- Public options: `artifactCount`, `artifactMaxSize`, `artifactMinSize`, `blendMode`, `burstDurationMax`, `burstDurationMin`, `channelOffset`, `colors`, `delay`, `duration`, `frequency`, `intensity`, `intervalMax`, `intervalMin`, `loop`, `maxSliceOffset`, `preset`, `randomness`, `seed`, `sliceCount`, `sliceCountMax`, `sliceCountMin`, `speed`, `trigger`, `type`

## lazy

- Attribute: `data-kt-lazy`
- Default variant: `fade`
- Variants: `fade`, `blur-up`, `wave`, `grain`, `skeleton`, `pixelate`, `print`, `dissolve`, `flicker`, `polaroid`, `crt`, `data-mosaic`, `rgb-slice-burst`
- Public options: `animated`, `aspectRatio`, `autoplay`, `blur`, `colors`, `crossOrigin`, `delay`, `direction`, `display`, `duration`, `ease`, `edgeOpacity`, `edgeWidth`, `effect`, `fadeDuration`, `fallbackSrc`, `feather`, `flickerBackground`, `frame`, `frameColor`, `grain`, `glitchStrength`, `height`, `holdDuration`, `keepFrame`, `loop`, `maxDpr`, `minDuration`, `muted`, `nativeLazy`, `noise`, `noiseBlend`, `noiseContrast`, `noiseFps`, `noiseHeight`, `noiseWidth`, `objectFit`, `objectPosition`, `onError`, `onLoad`, `onProgress`, `onReveal`, `once`, `pixelEnd`, `pixelStart`, `pixelStepCount`, `playsinline`, `preload`, `preset`, `renderFps`, `rootMargin`, `rotate`, `seed`, `sizes`, `skeletonAngle`, `skeletonColor`, `skeletonHighlight`, `skeletonIcon`, `skeletonSpeed`, `skeletonVariant`, `sliceCount`, `src`, `srcset`, `startScale`, `stepCount`, `stepDuration`, `steps`, `threshold`, `tileMax`, `tileMin`, `variant`, `waveAmplitude`, `waveFrequency`, `waveSliceHeight`, `waveSpeed`

## lightbox

- Attribute: `data-kt-lightbox`
- Default variant: `viewer`
- Variants: `viewer`, `grouped`
- Public options: `alt`, `backdropBlur`, `backdropColor`, `backdropOpacity`, `caption`, `className`, `closeOnBackdrop`, `cursor`, `description`, `doubleClickZoom`, `download`, `duration`, `exif`, `group`, `info`, `lazyEffect`, `lazyOptions`, `lightboxDuration`, `maxZoom`, `metadata`, `minZoom`, `minimap`, `onChange`, `onClose`, `onLoad`, `onOpen`, `radius`, `renderUI`, `share`, `src`, `thumbnails`, `title`, `toolbar`, `transition`, `uiTemplate`, `wheelStep`, `zoom`, `zoomStep`

## loader

- Attribute: `data-kt-loader`
- Default variant: `bar`
- Variants: `slot`, `circular`, `bar`
- Public options: `announce`, `ariaLabel`, `barHeight`, `barWidth`, `className`, `color`, `completeHold`, `completeOnError`, `duration`, `exit`, `exitDirection`, `exitDuration`, `expectedResources`, `fetch`, `fetchOptions`, `fill`, `fillColor`, `hideScrollbar`, `label`, `labelBlend`, `labelColor`, `linecap`, `manualDuration`, `minDuration`, `onCancel`, `onComplete`, `onError`, `onHide`, `onProgress`, `onShow`, `onStart`, `onStateChange`, `percent`, `preset`, `progress`, `progressOutput`, `progressScope`, `progressTemplate`, `progressSource`, `promise`, `promiseCeiling`, `promiseStart`, `radius`, `renderUI`, `resourceSelector`, `resources`, `revealEffect`, `showPercent`, `size`, `smoothing`, `source`, `stroke`, `trackColor`, `transition`, `type`, `url`

## loadingIndicator

- Attribute: `data-kt-loading-indicator`
- Default variant: `spinner`
- Variants: `spinner`, `dots`, `bar`, `shimmer`, `shimmer-wave`, `terminal`
- Public options: `ariaLabel`, `asciiOnly`, `autoComplete`, `barHeight`, `barMode`, `barWidth`, `baseColor`, `className`, `color`, `completeHold`, `completeOnError`, `cursorChar`, `direction`, `dotCount`, `dotGap`, `dotSize`, `dotStyle`, `emptyChar`, `exitDuration`, `fillChar`, `fixedWidth`, `fontFamily`, `fontWeight`, `frameInterval`, `frames`, `glow`, `glowColor`, `glowSize`, `hideOnComplete`, `highlightColor`, `indeterminate`, `label`, `letterSpacing`, `lineHeight`, `motionDuration`, `onComplete`, `onError`, `onHide`, `onProgress`, `onShow`, `onStart`, `onStateChange`, `preset`, `progress`, `progressOutput`, `progressScope`, `progressSource`, `progressTemplate`, `renderUI`, `rotateSpokes`, `secondaryColor`, `showLabel`, `showSpinner`, `showStatus`, `size`, `spinnerMode`, `spinnerStyle`, `spread`, `stepTotal`, `stroke`, `terminalStyle`, `text`, `textSize`, `track`, `trackColor`, `transformOrigin`, `type`, `viewportWidth`

## magnetic

- Attribute: `data-kt-magnetic`
- Default variant: `pointer`
- Variants: `pointer`
- Public options: `ease`, `radius`, `strength`

## marquee

- Attribute: `data-kt-marquee`
- Default variant: `left`
- Variants: `left`, `right`, `reverse-on-scroll`
- Public options: `clones`, `direction`, `fade`, `pauseOnHover`, `reverseOnScrollUp`, `scrollAcceleration`, `skew`, `speed`

## mouseParallax

- Attribute: `data-kt-mouse-parallax`
- Default variant: `pointer`
- Variants: `pointer`, `gyro`, `compass`
- Public options: `compassRange`, `ease`, `global`, `gyro`, `maxX`, `maxY`, `mode`, `preset`, `rotateOffset`, `sensitivity`, `smoothing`, `speed`

## overflowText

- Attribute: `data-kt-overflow-text`
- Default variant: `loop`
- Variants: `loop`, `bounce`, `rewind`, `once`, `page`, `flip`, `dissolve`, `page-roll`, `rolling`, `fade`, `scroll-fade`
- Public options: `ariaLive`, `crossfade`, `delay`, `direction`, `dissolveDuration`, `easing`, `ellipsis`, `endPause`, `flipDirection`, `flipDuration`, `force`, `gap`, `holdDuration`, `hoverTarget`, `items`, `jitter`, `loopOnHover`, `maskDirection`, `maskDuration`, `maskEase`, `mode`, `onChange`, `onPage`, `pageDuration`, `pageOverlap`, `pauseOnHover`, `perspective`, `preset`, `repeat`, `restartDelay`, `restoreDirection`, `restoreOnLeave`, `role`, `rollDirection`, `rollDuration`, `speed`, `text`, `threshold`, `title`, `transitionDirection`, `trigger`

## pageReveal

- Attribute: `data-kt-page-reveal`
- Default variant: `curtain`
- Variants: `curtain`, `split`, `circle`, `wipe`, `blinds`, `diagonal`, `checker`, `strips`, `shutter`, `columns`, `fade`, `zoom`, `iris`, `flash`, `center-slit`, `data-mosaic`
- Public options: `angle`, `axis`, `cleanupDuration`, `color`, `color2`, `count`, `delay`, `density`, `direction`, `duration`, `ease`, `effect`, `horizontalDuration`, `largeTileChance`, `lineHeight`, `lineWidth`, `noiseDuration`, `onComplete`, `overscan`, `preset`, `reverse`, `seed`, `smallTileChance`, `stagger`, `tileMax`, `tileMin`, `verticalDuration`

## pageTransition

- Attribute: `data-kt-page-transition`
- Default variant: `same-origin`
- Variants: `same-origin`
- Public options: `animationSelector`, `cache`, `color`, `color2`, `container`, `duration`, `ease`, `effect`, `executeScripts`, `linkSelector`, `minDuration`, `onClick`, `onEnter`, `onError`, `onLeave`, `scrollTop`

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
- Public options: `activeClass`, `classOnly`, `clockDirection`, `delay`, `direction`, `duration`, `ease`, `end`, `enterClass`, `enterEase`, `leaveClass`, `onClassChange`, `onComplete`, `onEnter`, `onEnterBack`, `onLeave`, `onLeaveBack`, `once`, `order`, `preset`, `removeClassOnLeave`, `rootMargin`, `spring`, `stagger`, `start`, `startAngle`, `threshold`

## radial

- Attribute: `data-kt-radial`
- Default variant: `bottom`
- Variants: `bottom`, `top`, `left`, `right`
- Public options: `activeAngle`, `activeClass`, `align`, `autoplay`, `controls`, `drag`, `duration`, `loop`, `position`, `radius`, `step`

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

## slider

- Attribute: `data-kt-slider`
- Default variant: `slide`
- Variants: `slide`, `fade`, `dissolve`, `wipe`, `coverflow`, `flip`, `cube`, `cards`, `creative`, `radial`
- Public options: `activeAngle`, `activeClass`, `activeShadow`, `activeShadowOpacity`, `align`, `autoHeight`, `autoplay`, `axis`, `breakpoints`, `controls`, `depth`, `dots`, `drag`, `duration`, `effect`, `effectDirection`, `effectIntensity`, `enabled`, `gap`, `grabCursor`, `initial`, `keyboard`, `label`, `loop`, `minOpacity`, `minScale`, `nextSelector`, `onBeforeChange`, `onChange`, `onInit`, `opacityStep`, `pauseButton`, `pauseOnHover`, `perGroup`, `perView`, `perspective`, `position`, `preset`, `prevSelector`, `progress`, `progressType`, `radius`, `rotate`, `scaleStep`, `slideToClickedSlide`, `smoothing`, `spacing`, `speed`, `step`, `sync`, `touch`, `wheel`

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
- Variants: `stream`, `char`, `word`, `line`, `bounce`, `hangul`, `decode`, `flicker`, `shuffle`
- Public options: `chars`, `delay`, `duration`, `ease`, `flickerCount`, `flickerLoop`, `hold`, `loop`, `mode`, `onComplete`, `preset`, `rainbow`, `rainbowColors`, `revealRate`, `rootMargin`, `scrambleFade`, `speed`, `stagger`, `text`, `threshold`

## textSplit

- Attribute: `data-kt-text-split`
- Default variant: `char`
- Variants: `char`, `word`
- Public options: `animation`, `by`, `delay`, `duration`, `ease`, `hold`, `onComplete`, `onSwap`, `once`, `pause`, `perspective`, `preset`, `stagger`, `start`, `swapEase`, `swapOut`, `texts`

## textTransition

- Attribute: `data-kt-text-transition`
- Default variant: `slide`
- Variants: `slide-up`, `slide`, `rise`, `fade`, `blur`, `scale`, `clip`, `dissolve`, `shimmer`
- Public options: `ariaLive`, `baseColor`, `blur`, `charDirection`, `charMode`, `duration`, `ease`, `effect`, `endScale`, `hold`, `jitter`, `loop`, `minHeight`, `onChange`, `onComplete`, `pause`, `preset`, `shimColor`, `shimSpeed`, `stagger`, `startScale`, `texts`

## tilt

- Attribute: `data-kt-tilt`
- Default variant: `tilt-glare`
- Variants: `tilt-glare`, `tilt`, `x-only`, `y-only`, `reverse`
- Public options: `axis`, `disableOnMobile`, `ease`, `glare`, `glareBlur`, `glareColor`, `glareOpacity`, `glareRadius`, `gyro`, `max`, `maxX`, `maxY`, `perspective`, `reset`, `reverse`, `scale`, `sensitivity`, `smoothing`, `tiltShadow`, `tiltShadowBlur`, `tiltShadowColor`, `tiltShadowCss`, `tiltShadowFollow`, `tiltShadowHoverOnly`, `tiltShadowInset`, `tiltShadowOpacity`, `tiltShadowSpread`, `tiltShadowX`, `tiltShadowY`

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
- Public options: `colors`, `count`, `duration`, `gravity`, `once`, `scalar`, `spread`, `trigger`, `zIndex`

## accordion

- Attribute: `data-kt-accordion`
- Default variant: `panel`
- Variants: `panel`
- Public options: `activeClass`, `arrowPosition`, `blur`, `duration`, `ease`, `effect`, `single`

## hold

- Attribute: `data-kt-hold`
- Default variant: `confirm`
- Variants: `confirm`
- Public options: `action`, `blend`, `color`, `decay`, `duration`, `mode`, `onComplete`, `step`, `submit`

## megaMenu

- Attribute: `data-kt-mega-menu`
- Default variant: `dropdown`
- Variants: `dropdown`, `mega`
- Public options: `closeDelay`, `duration`, `indicator`, `layout`, `openDelay`, `responsive`, `trigger`

## toast

- Attribute: `data-kt-toast`
- Default variant: `stack`
- Variants: `stack`
- Public options: `barColor`, `dismissible`, `duration`, `icon`, `max`, `message`, `position`, `progressBar`, `type`

## bottomSheet

- Attribute: `data-kt-bottom-sheet`
- Default variant: `sheet`
- Variants: `sheet`
- Public options: `autoHeight`, `backdrop`, `backdropOpacity`, `dismissible`, `duration`, `handle`, `label`, `maxHeight`, `minHeight`, `onResize`, `resizable`, `resizeArea`, `trigger`

## tabs

- Attribute: `data-kt-tabs`
- Default variant: `line`
- Variants: `line`
- Public options: `activation`, `activeClass`, `duration`, `effect`, `indicator`, `indicatorMotion`, `onChange`, `orientation`

## coverReveal

- Attribute: `data-kt-cover-reveal`
- Default variant: `block`
- Variants: `block`
- Public options: `color`, `color2`, `colorMode`, `colors`, `delay`, `direction`, `duration`, `ease`, `layers`, `lines`, `mask`, `maskDirection`, `onComplete`, `stagger`, `threshold`, `waitForImage`, `watch`

## gesture

- Attribute: `data-kt-gesture`
- Default variant: `spring`
- Variants: `spring`
- Public options: `duration`, `ease`, `hoverEase`, `hoverScale`, `lift`, `origin`, `pressEase`, `tapScale`

## drag

- Attribute: `data-kt-drag`
- Default variant: `free`
- Variants: `free`
- Public options: `axis`, `bounds`, `handle`, `inertia`, `snapBack`

## tooltip

- Attribute: `data-kt-tooltip`
- Default variant: `default`
- Variants: `default`
- Public options: `content`, `delay`, `duration`, `effect`, `hideDelay`, `html`, `interactive`, `offset`, `placement`, `trigger`

## switch

- Attribute: `data-kt-switch`
- Default variant: `toggle`
- Variants: `toggle`
- Public options: `checked`, `duration`, `offColor`, `onChange`, `onColor`, `size`, `thumbColor`

## flip

- Attribute: `data-kt-flip`
- Default variant: `layout`
- Variants: `layout`, `slide`, `fade`, `fade-slide`, `scale`
- Public options: `duration`, `ease`, `item`, `mode`, `stagger`, `watch`

## scrollShadows

- Attribute: `data-kt-scroll-shadows`
- Default variant: `vertical`
- Variants: `vertical`, `horizontal`, `mask`
- Public options: `axis`, `color`, `ease`, `mode`, `onChange`, `opacity`, `shadow`, `shape`, `size`, `transition`, `transitionDuration`, `transitionMode`

## stickyHeader

- Attribute: `data-kt-sticky-header`
- Default variant: `shrink`
- Variants: `shrink`, `toggle`
- Public options: `activeClass`, `distance`, `offset`, `onChange`, `shadow`, `shrink`

## horizontalScroll

- Attribute: `data-kt-horizontal-scroll`
- Default variant: `pin`
- Variants: `pin`
- Public options: `height`, `smooth`, `top`
