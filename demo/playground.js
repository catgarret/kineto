(() => {
  'use strict';

  const MODULE_ATTRIBUTES = {
    parallax: 'data-kt-parallax', mouseParallax: 'data-kt-mouse-parallax', reveal: 'data-kt-reveal',
    counter: 'data-kt-counter', lazy: 'data-kt-lazy', textSplit: 'data-kt-text-split',
    blurText: 'data-kt-blur-text', typewriter: 'data-kt-typewriter', progress: 'data-kt-progress', fullpage: 'data-kt-fullpage',
    textReveal: 'data-kt-text-reveal', textTransition: 'data-kt-text-transition', magnetic: 'data-kt-magnetic',
    ripple: 'data-kt-ripple', marquee: 'data-kt-marquee', overflowText: 'data-kt-overflow-text',
    tilt: 'data-kt-tilt', cursor: 'data-kt-cursor', textFill: 'data-kt-text-fill', stickyStack: 'data-kt-sticky-stack',
    scrollVelocity: 'data-kt-scroll-velocity', slider: 'data-kt-slider', ambientMedia: 'data-kt-ambient-media',
    glitch: 'data-kt-glitch', cardGlow: 'data-kt-card-glow', lightbox: 'data-kt-lightbox', vibrate: 'data-kt-vibrate',
    cssScroll: 'data-kt-css-scroll', scrollSequence: 'data-kt-scroll-sequence', brushReveal: 'data-kt-brush-reveal'
  };
  const ACTIVATION_OPTION_OWNERS = {
    cursor: ['lightbox'],
    drag: ['fullpage', 'radial'],
    hold: ['textReveal', 'textSplit'],
    progress: ['slider']
  };
  const activationIsOwnedOption = (element, module) => (
    (ACTIVATION_OPTION_OWNERS[module] || []).some((owner) => element.hasAttribute(MODULE_ATTRIBUTES[owner] || `data-kt-${dash(owner)}`))
  );

  const PUBLIC_OPTIONS = {"accordion":["activeClass","arrowPosition","blur","duration","ease","effect","single"],"ambientMedia":["allowOverflow","ambientSrc","ambientSrcset","blur","brightness","color","fallbackColor","hideOnPause","inset","opacity","radius","sampleFps","sampleHeight","sampleWidth","saturation","scale","source","src"],"blurText":["duration","ease","onComplete","once","stagger","start"],"bottomSheet":["backdrop","backdropOpacity","dismissible","duration","handle","label","maxHeight","minHeight","onResize","resizable","resizeArea","trigger"],"brushReveal":["blur","crossOrigin","fade","hold","maxDpr","onError","onProgress","onReveal","opacity","persist","radius","revealSrc","softness","src","threshold"],"cardGlow":["alwaysOn","blendMode","blur","borderBlur","borderColor","borderColor2","borderGlow","borderInset","borderOpacity","borderRadius","borderWidth","color","color1","color2","cycleDuration","disableOnMobile","duration","ease","follow","halo","intensity","luminousBorder","mode","opacity","preset","radius","reflection","sensitivity","shadow","shadowBlur","shadowColor","shadowCss","shadowFollow","shadowHoverOnly","shadowInset","shadowOpacity","shadowSpread","shadowX","shadowY","smoothing","speed","spread","surface","surfaceBlend","surfaceBlur","surfaceColor","surfaceColor2","surfaceGradient","surfaceInset","surfaceOpacity","surfaceSize"],"confetti":["colors","count","duration","gravity","once","scalar","spread","trigger","zIndex"],"counter":["blink","blinkSeparators","clockSeparator","clockStyle","comma","daysLabel","decimals","delay","duration","ease","format","from","gap","grouping","hour12","lineHeight","locale","loops","mode","onComplete","once","popAlign","popDuration","popScale","prefix","preset","rollDirection","rollDuration","seamColor","seconds","separator","separatorColor","shadow","showDays","since","stagger","start","style","suffix","tileColor","tileRadius","tileTextColor","to","until"],"coverReveal":["color","color2","colorMode","colors","delay","direction","duration","ease","layers","lines","onComplete","stagger","threshold","waitForImage"],"cssScroll":["axis","cssAnimation","end","onUpdate","property","rangeEnd","rangeStart","start","timeline"],"cursor":["backdropFilter","background","blur","borderColor","borderWidth","className","clickImage","clickImageDuration","clickImageSize","clickSprite","clickSpriteDuration","clickSpriteFrames","clickSpriteHeight","clickSpriteWidth","color","crosshairSize","dot","dotColor","dotShadow","dotSize","ease","follower","followerSize","full","global","height","hiddenSelector","hideDotOnHover","hoverBackground","hoverClass","hoverColor","hoverDotOpacity","hoverDotSize","hoverEffect","hoverLabel","hoverScale","hoverSelector","hoverShadow","hoverSrc","hoverTemplate","html","label","labelColor","labelSize","mixBlendMode","onEnter","onLeave","opacity","orbitHoverScale","orbitRadius","orbitSpeed","orbitSquash","orbitText","preset","pressScale","radius","rotate","rotateDuration","rotateText","shadow","shape","smoothing","snakeGap","snakeMinScale","snakeScaleEase","snakeText","sparkleColor","sparkleColor2","sparkleDuration","sparkleSize","sparkleSymbols","sparkleThrottle","speed","spring","src","template","text","textColor","trailColor","trailCount","trailSize","type","width","zIndex"],"drag":["axis","bounds","handle","inertia","snapBack"],"flip":["duration","ease","item","stagger","watch"],"fullpage":["autoAdvance","axis","dots","drag","duration","ease","height","initial","keyboard","loop","mode","onChange","onLeave","sectionSelector","threshold","touch","wheel"],"gesture":["duration","ease","hoverEase","hoverScale","lift","origin","pressEase","tapScale"],"glitch":["blendMode","colors","delay","duration","frequency","intensity","loop","preset","randomness","sliceCount","speed","trigger","type"],"hold":["action","blend","color","decay","duration","mode","onComplete","step","submit"],"horizontalScroll":["height","smooth","top"],"lazy":["animated","aspectRatio","autoplay","blur","crossOrigin","delay","direction","display","duration","ease","edgeOpacity","edgeWidth","effect","fadeDuration","fallbackSrc","feather","flickerBackground","frame","frameColor","glitchStrength","height","holdDuration","keepFrame","loop","maxDpr","minDuration","muted","nativeLazy","noise","noiseBlend","noiseContrast","noiseFps","noiseHeight","noiseWidth","objectFit","objectPosition","onError","onLoad","onProgress","onReveal","once","pixelEnd","pixelStart","pixelStepCount","playsinline","preload","preset","renderFps","rootMargin","rotate","sizes","skeletonAngle","skeletonColor","skeletonHighlight","skeletonIcon","skeletonSpeed","skeletonVariant","sliceCount","src","srcset","startScale","stepCount","stepDuration","steps","threshold","variant"],"lightbox":["alt","backdropBlur","backdropColor","backdropOpacity","caption","className","closeOnBackdrop","cursor","description","doubleClickZoom","download","duration","exif","group","info","lazyEffect","lazyOptions","lightboxDuration","maxZoom","metadata","minZoom","minimap","onChange","onClose","onLoad","onOpen","radius","renderUI","share","src","thumbnails","title","toolbar","transition","uiTemplate","wheelStep","zoom","zoomStep"],"loader":["announce","ariaLabel","barHeight","barWidth","className","color","completeHold","completeOnError","duration","exit","exitDirection","exitDuration","expectedResources","fetch","fetchOptions","fill","fillColor","hideScrollbar","label","labelBlend","labelColor","linecap","manualDuration","minDuration","onCancel","onComplete","onError","onHide","onProgress","onShow","onStart","onStateChange","percent","preset","progress","progressSource","promise","promiseCeiling","promiseStart","radius","renderUI","resourceSelector","resources","showPercent","size","smoothing","source","stroke","trackColor","transition","type","url"],"loadingIndicator":["ariaLabel","autoComplete","barHeight","barWidth","baseColor","className","color","completeHold","completeOnError","cursorChar","direction","dotCount","dotGap","dotSize","dotStyle","exitDuration","fontFamily","glow","glowColor","glowSize","hideOnComplete","highlightColor","indeterminate","label","motionDuration","onComplete","onError","onHide","onProgress","onShow","onStart","onStateChange","preset","progress","renderUI","size","spinnerStyle","spread","stroke","terminalStyle","text","textSize","trackColor","type"],"magnetic":["ease","radius","strength"],"marquee":["clones","direction","fade","pauseOnHover","reverseOnScrollUp","scrollAcceleration","skew","speed"],"megaMenu":["closeDelay","duration","indicator","layout","openDelay","trigger"],"mouseParallax":["compassRange","ease","global","gyro","maxX","maxY","mode","preset","rotateOffset","sensitivity","smoothing","speed"],"overflowText":["ariaLive","crossfade","delay","direction","dissolveDuration","easing","ellipsis","endPause","flipDirection","flipDuration","force","gap","holdDuration","hoverTarget","items","jitter","loopOnHover","maskDirection","maskDuration","maskEase","mode","onChange","onPage","pageDuration","pageOverlap","pauseOnHover","perspective","preset","repeat","restartDelay","restoreDirection","restoreOnLeave","role","rollDirection","rollDuration","speed","text","threshold","title","transitionDirection","trigger"],"pageReveal":["angle","axis","color","color2","count","delay","direction","duration","ease","effect","onComplete","preset","stagger"],"pageTransition":["animationSelector","cache","color","color2","container","duration","ease","effect","executeScripts","linkSelector","minDuration","onClick","onEnter","onError","onLeave","scrollTop"],"parallax":["axis","distance","end","onUpdate","scrub","speed","start"],"progress":["attach","clickToTop","color","color2","hideAtEnd","label","offset","onUpdate","position","property","radius","showAfter","showPercent","size","smoothing","stroke","target","thickness","trackColor","ui","zIndex"],"radial":["activeAngle","activeClass","align","autoplay","controls","drag","duration","loop","position","radius","step"],"reveal":["activeClass","classOnly","clockDirection","delay","direction","duration","ease","end","enterClass","enterEase","leaveClass","onClassChange","onComplete","onEnter","onEnterBack","onLeave","onLeaveBack","once","order","preset","removeClassOnLeave","rootMargin","spring","stagger","start","startAngle","threshold"],"ripple":["centered","color","disableInReducedMotion","duration","easing","opacity","scale","unbounded"],"scrollSequence":["crossOrigin","end","extension","fit","frames","height","maxDpr","onError","onFrame","padding","preloadRadius","scrollLength","scrub","start","top","urlPrefix","urls","vhPerFrame"],"scrollShadows":["axis","color","ease","mode","onChange","opacity","shadow","shape","size","transition","transitionDuration","transitionMode"],"scrollVelocity":["axis","damping","decay","distance","effect","elastic","end","global","mass","maxBlur","maxRotate","maxScale","maxSkew","mode","onDirection","onUpdate","preset","response","reverse","smoothing","spring","start","stiffness","velocityDivisor"],"slider":["align","autoplay","axis","depth","dots","drag","duration","effect","effectDirection","effectIntensity","enabled","gap","initial","keyboard","label","loop","minOpacity","minScale","nextSelector","onBeforeChange","onChange","onInit","opacityStep","pauseButton","pauseOnHover","perView","perspective","preset","prevSelector","progress","progressType","rotate","scaleStep","smoothing","spacing","speed","touch","wheel"],"stickyHeader":["activeClass","distance","offset","onChange","shadow","shrink"],"stickyStack":["align","blur","bottomSpace","distance","ease","effect","end","fadePrevious","gap","itemDuration","itemHeight","minHeight","mode","offset","offsetTop","offsetY","onProgress","overlap","panelWidth","perspective","pin","pinSpacing","preset","previousBlur","previousOpacity","previousScale","previousY","reverseZ","rotate","scaleFrom","scalePrevious","scrollLength","scrub","snap","start","top","transformOrigin","transitionStartOffset","type"],"switch":["checked","duration","offColor","onChange","onColor","size","thumbColor"],"tabs":["activation","activeClass","duration","effect","indicator","indicatorMotion","onChange","orientation"],"textFill":["baseColor","end","fillColor","onUpdate","scrub","start"],"textReveal":["chars","delay","duration","ease","flickerCount","flickerLoop","hold","loop","mode","onComplete","preset","rainbow","rainbowColors","revealRate","rootMargin","scrambleFade","speed","stagger","text","threshold"],"textSplit":["animation","by","delay","duration","ease","hold","onComplete","onSwap","once","pause","perspective","preset","stagger","start","swapEase","swapOut","texts"],"textTransition":["ariaLive","baseColor","blur","charDirection","charMode","duration","ease","effect","endScale","hold","jitter","loop","minHeight","onChange","onComplete","pause","preset","shimColor","shimSpeed","stagger","startScale","texts"],"tilt":["axis","disableOnMobile","ease","glare","glareBlur","glareColor","glareOpacity","glareRadius","gyro","max","maxX","maxY","perspective","reset","reverse","scale","sensitivity","smoothing","tiltShadow","tiltShadowBlur","tiltShadowColor","tiltShadowCss","tiltShadowFollow","tiltShadowHoverOnly","tiltShadowInset","tiltShadowOpacity","tiltShadowSpread","tiltShadowX","tiltShadowY"],"toast":["barColor","dismissible","duration","icon","max","message","position","progressBar","type"],"tooltip":["content","delay","duration","effect","hideDelay","html","interactive","offset","placement","trigger"],"typewriter":["caret","caretChar","compose","eraseSpeed","hangul","loop","onComplete","pauseAfter","strings","typeSpeed"],"vibrate":["haptic","pattern","preset","threshold","trigger"]};

  const FIELDS = {
    counter: [
      ['preset','Mode','select',['slot','plain','digit','pop','flip','clock']], ['from','Start from','number'], ['to','Target','number'], ['separator','Separator','text'], ['blinkSeparators','Blink separators','checkbox'],
      ['locale','Locale','text'], ['duration','Duration','range',0.1,4,0.1], ['loops','Digit loops','range',0,6,1],
      ['popScale','Pop scale','range',1,3,0.05], ['popAlign','Pop align','select',['bottom','center','top']], ['popDuration','Pop duration','range',0.05,1,0.05],
      ['stagger','Stagger','range',0,0.3,0.01], ['prefix','Prefix','text'], ['suffix','Suffix','text'],
      ['tileColor','Tile color','color'], ['tileTextColor','Tile text','color'], ['gap','Flip gap','range',0,12,1], ['separatorColor','Separator color','color'], ['seamColor','Flip seam color','color'], ['shadow','Flip shadow','checkbox'], ['seconds','Show seconds','checkbox'], ['hour12','12-hour + AM/PM','checkbox'], ['blink','Blink colon','checkbox'], ['clockStyle','Digit change','select',['roll','fade','instant','flip']], ['rollDirection','Roll direction','select',['up','down']], ['until','Countdown until','text'], ['since','Elapsed since','text'], ['daysLabel','Days label','text'], ['clockSeparator','Clock separator','text'], ['rollDuration','Roll duration','range',0.1,0.8,0.02]
    ],
    lazy: [
      ['preset','Effect','select',['fade','blur-up','skeleton','pixelate','print','dissolve','flicker','polaroid','crt']],
      ['glitchStrength','Glitch strength','range',0.1,3,0.05], ['sliceCount','Glitch slices','range',2,16,1],
      ['duration','Duration','range',0.1,4,0.1], ['delay','Delay (ms)','range',0,1500,50], ['blur','Blur','range',0,40,1],
      ['noise','Noise','range',0,1,0.01], ['direction','Direction','select',['down','up','left','right']],
      ['feather','Feather','range',0,180,5], ['steps','Explicit steps (px)','text'], ['stepCount','Pixel steps','range',2,16,1],
      ['stepDuration','Step time (ms)','range',0,600,10], ['holdDuration','Hold (ms)','range',0,1200,50],
      ['minDuration','Placeholder min (ms)','range',0,2500,100], ['skeletonColor','Skeleton color','color'], ['skeletonHighlight','Skeleton highlight','color'], ['skeletonIcon','Skeleton icon','checkbox'], ['startScale','Start scale','range',0.7,1.4,0.01]
    ],
    overflowText: [
      ['preset','Mode','select',['loop','bounce','rewind','once','page','flip','dissolve','fade','scroll-fade','page-roll','rolling']], ['speed','Speed','range',10,180,2],
      ['delay','Start pause (ms)','range',0,2500,50], ['endPause','End pause (ms)','range',0,2500,50],
      ['restartDelay','Restart delay (ms)','range',0,4000,50],
      ['maskDuration','Mask time (ms)','range',50,700,10], ['pageDuration','Page hold (ms)','range',100,2500,50],
      ['flipDuration','Flip time (ms)','range',100,900,20], ['flipDirection','Flip direction','select',['down','up']],
      ['dissolveDuration','Dissolve time (ms)','range',150,1200,10], ['jitter','Dissolve jitter','range',0,14,1],
      ['gap','Loop gap','range',0,120,2], ['maskDirection','Mask direction','select',['top-to-bottom','bottom-to-top','left-to-right','right-to-left']], ['rollDuration','Roll time (ms)','range',80,1200,20],['rollDirection','Roll direction','select',['up','down']],['items','Rolling items','text'], ['crossfade','Crossfade','checkbox'], ['pauseOnHover','Pause on hover','checkbox'],
      ['restoreOnLeave','Restore on leave','checkbox'],['restoreDirection','Leave direction','select',['reverse','continue']],['loopOnHover','Loop while hovered','checkbox']
    ],
    cardGlow: [
      ['preset','Glow','select',['spotlight','pointer','border','comet','aurora','shine']], ['color','Color','color'],
      ['cycleDuration','Cycle (s)','range',1,12,0.5],
      ['radius','Radius','range',20,360,5], ['opacity','Opacity','range',0,1,0.02], ['blur','Blur','range',0,60,1],
      ['spread','Spread','range',0,100,1], ['follow','Follow','range',0.02,1,0.02], ['sensitivity','Sensitivity','range',0.1,3,0.05],
      ['surface','Surface reflection','checkbox'], ['surfaceOpacity','Surface opacity','range',0,1,0.02], ['surfaceColor','Surface color','color'], ['borderGlow','Luminous border','checkbox'], ['borderColor','Border color','color'], ['borderWidth','Border width','range',1,8,0.5], ['alwaysOn','Always on','checkbox'], ['disableOnMobile','Disable on mobile','checkbox'],
      ['shadow','Shadow','checkbox'], ['shadowColor','Shadow color','color'], ['shadowOpacity','Shadow opacity','range',0,1,0.02],
      ['shadowBlur','Shadow blur','range',0,100,1], ['shadowSpread','Shadow spread','range',-40,60,1],
      ['shadowX','Shadow X','range',-60,60,1], ['shadowY','Shadow Y','range',-60,60,1],
      ['shadowFollow','Shadow follow','range',0,40,1], ['shadowHoverOnly','Hover only','checkbox'],
      ['shadowInset','Inset shadow','checkbox'], ['shadowCss','Custom shadow CSS','text']
    ],
    tilt: [
      ['max','Angle','range',0,30,1], ['maxX','Angle X','range',0,30,1], ['maxY','Angle Y','range',0,30,1],
      ['sensitivity','Sensitivity','range',0.1,3,0.05], ['smoothing','Smoothing','range',0.02,0.5,0.01],
      ['perspective','Perspective','range',300,2000,50], ['scale','Scale','range',1,1.12,0.005], ['reverse','Reverse','checkbox'],
      ['reset','Reset on leave','checkbox'], ['glare','Glare','checkbox'], ['glareOpacity','Glare opacity','range',0,0.8,0.02], ['disableOnMobile','Disable on mobile','checkbox'],
      ['glareRadius','Glare radius','range',20,260,5],
      ['tiltShadow','Shadow','checkbox'], ['tiltShadowColor','Shadow color','color'], ['tiltShadowOpacity','Shadow opacity','range',0,1,0.02],
      ['tiltShadowBlur','Shadow blur','range',0,100,1], ['tiltShadowSpread','Shadow spread','range',-40,60,1],
      ['tiltShadowX','Shadow X','range',-60,60,1], ['tiltShadowY','Shadow Y','range',-60,60,1],
      ['tiltShadowFollow','Shadow follow','range',0,3,0.05], ['tiltShadowHoverOnly','Hover only','checkbox'],
      ['tiltShadowInset','Inset shadow','checkbox'], ['tiltShadowCss','Custom shadow CSS','text']
    ],
    magnetic: [['strength','Strength','range',0,1.2,0.05],['radius','Radius','range',20,260,5]],
    ripple: [['color','Color','text'],['duration','Duration (ms)','range',100,1400,20],['opacity','Opacity','range',0,1,0.05],['scale','Scale','range',1,5,0.1],['centered','Centered','checkbox'],['unbounded','Unbounded','checkbox']],
    vibrate: [['preset','Haptic','select',['tap','double-tap','soft','rigid','heavy','success','warning','error','ratchet','heartbeat','long-press']],['trigger','Trigger','select',['hover','click','scroll','manual']],['pattern','Custom pattern','text'],['threshold','Scroll threshold','range',0,500,10]],
    mouseParallax: [['preset','Mode','select',['','compass']],['compassRange','Compass range (deg)','range',0,180,5],['rotateOffset','Rotate offset','range',-180,180,5],['smoothing','Smoothing','range',0.02,0.5,0.01],['sensitivity','Sensitivity','range',0.1,3,0.05],['maxX','Max X','range',0,80,1],['maxY','Max Y','range',0,80,1],['speed','Speed','range',0.02,1,0.02],['global','Global pointer','checkbox']],
    textSplit: [['by','Split by','select',['char','word']],['animation','Animation','select',['rise','fade','wave','spin','flip','scale','blur','slide-up','slide-down']],['duration','Duration','range',0.1,2,0.05],['stagger','Stagger','range',0,0.2,0.005],['delay','Delay','range',0,2,0.05],['hold','Swap hold (ms)','range',400,5000,100],['swapOut','Swap out','select',['slide-up','slide-down','fade','blur','scale','flip','spin']]],
    typewriter: [['typeSpeed','Type speed (ms)','range',10,200,5],['eraseSpeed','Erase speed (ms)','range',10,160,5],['pauseAfter','Pause (ms)','range',0,3000,50],['loop','Loop','checkbox'],['caret','Caret (|)','checkbox'],['hangul','한글 조합 타이핑','checkbox']],
    textReveal: [['preset','Mode','select',['stream','char','word','line','bounce','hangul','decode','flicker']],['rainbow','Rainbow scramble','checkbox'],['rainbowColors','Scramble palette','text'],['scrambleFade','Fade scramble','checkbox'],['flickerLoop','Ambient flicker','checkbox'],['loop','Loop','checkbox'],['hold','Loop hold (ms)','range',200,4000,100],['flickerCount','Decode frames','range',1,8,1],['speed','Speed (ms)','range',10,200,5],['stagger','Stagger','range',0,0.2,0.005],['duration','Duration','range',0.1,2,0.05]],
    textTransition: [['preset','Effect','select',['slide-up','rise','fade','blur','scale','clip','dissolve','shimmer']],['jitter','Dissolve jitter','range',0,14,1],['duration','Duration','range',0.1,2,0.05],['pause','Pause (ms)','range',100,4000,100],['blur','Blur','range',0,40,1],['startScale','Start scale','range',0.4,1.4,0.05],['endScale','End scale','range',0.4,1.4,0.05],['charMode','Char mode','checkbox'],['charDirection','Char order','select',['ltr','rtl','random']],['loop','Loop','checkbox']],
    glitch: [['preset','Type','select',['rgb','pixel','noise','crt','image','datamosh','reveal','vcr']],['sliceCount','Image slices','range',2,16,1],['intensity','Intensity','range',0.1,3,0.05],['speed','Playback speed','range',0.2,3,0.05],['frequency','Burst frequency','range',0.1,4,0.05],['randomness','Randomness','range',0,1,0.05],['duration','Burst duration','range',0.2,3,0.05],['trigger','Trigger','select',['auto','hover','scroll']],['delay','Initial delay','range',0,3,0.05],['loop','Loop','checkbox']],
    cursor: [['preset','Type','select',['dot','ring','blob','crosshair','text','trail','orbit','snake','sparkle','image','custom']],['src','Image URL','text'],['hoverSrc','Hover image URL','text'],['width','Image width','range',16,120,2],['height','Image height','range',16,120,2],['template','Custom HTML','text'],['hoverTemplate','Hover HTML','text'],['hoverClass','Hover class','text'],['snakeText','Snake text','text'],['snakeMinScale','Snake min scale','range',0.1,1,0.02],['orbitHoverScale','Orbit hover grow','range',1,2.5,0.05],['color','Color','color'],['dotSize','Dot size','range',1,30,1],['followerSize','Follower size','range',8,120,2],['smoothing','Smoothing','range',0.01,1,0.01],['hoverScale','Hover scale','range',0.5,4,0.1],['pressScale','Press scale','range',0.3,1.5,0.05],['hoverEffect','Hover effect','select',['dot','ring','pill']],['hoverDotSize','Hover size','range',6,80,2],['trailCount','Trail count','range',3,16,1],['orbitRadius','Orbit radius','range',20,120,2],['orbitText','Orbit text','text'],['snakeText','Snake text','text'],['rotateText','Rotate text','text'],['mixBlendMode','Blend','select',['normal','difference','screen','multiply']]],
    textFill: [['baseColor','Base color','color'],['fillColor','Fill color','color'],['start','Start','text'],['end','End','text'],['scrub','Scrub','range',0,2,0.1]],
    reveal: [['preset','Preset','select',['fade','fade-up','fade-down','fade-left','fade-right','slide-up','slide-down','slide-left','slide-right','zoom','zoom-in','zoom-out','blur','rise','soft','flip','flip-x','flip-y','rotate','mask','wipe','clock','class']],['startAngle','Clock start (deg)','range',0,360,5],['clockDirection','Clock direction','select',['cw','ccw']],['direction','Direction','select',['up','down','left','right']],['duration','Duration','range',0.1,2.5,0.05],['delay','Delay','range',0,2,0.05],['stagger','Stagger (s)','range',0,0.3,0.01],['order','Order','select',['start','end','center','edges','random']],['once','Once','checkbox']],
    scrollVelocity: [['preset','Effect','select',['skew','translate','rotate','scale','combo']],['axis','Axis','select',['x','y']],['distance','Distance','range',0,180,5],['maxSkew','Max skew','range',0,24,1],['maxRotate','Max rotate','range',0,24,1],['maxScale','Max scale','range',0,0.5,0.01],['maxBlur','Max blur','range',0,12,0.25],['smoothing','Smoothing','range',0.01,0.5,0.01],['spring','Spring','checkbox'],['stiffness','Stiffness','range',20,400,5],['damping','Damping','range',1,60,1],['mass','Mass','range',0.1,4,0.1],['reverse','Reverse','checkbox']],
    stickyStack: [['preset','Mode','select',['vertical','horizontal','zindex','floating']],['align','Align','select',['center','top']],['gap','Gap','range',0,80,2],['scrub','Scrub','range',0,2,0.05],['snap','Snap','checkbox'],['effect','Floating effect','select',['depth','fade','scale','slide']],['overlap','Overlap','range',0,0.9,0.05],['previousOpacity','Previous opacity','range',0,1,0.05],['previousScale','Previous scale','range',0.5,1,0.02],['previousBlur','Previous blur','range',0,30,1],['scrollLength','Scroll length','range',20,300,5]],
    slider: [['preset','Effect','select',['slide','fade','dissolve','wipe','coverflow','flip','cube','cards','creative']],['effectDirection','Effect direction','select',['left','right','up','down']],['effectIntensity','Effect intensity','range',0,2,0.05],['axis','Axis','select',['x','y']],['align','Align','select',['center','left']],['loop','Loop','select',['off','infinite','rewind']],['drag','Mouse drag','checkbox'],['touch','Touch swipe','checkbox'],['keyboard','Keyboard','checkbox'],['wheel','Wheel nav','checkbox'],['dots','Pagination dots','checkbox'],['progress','Autoplay progress','checkbox'],['progressType','Progress UI','select',['bar','ring']],['pauseButton','Pause button','checkbox'],['gap','Gap','range',0,80,2],['perView','Per view','range',1,2.5,0.05],['speed','Speed','range',0.1,2,0.05],['autoplay','Autoplay (ms)','range',0,6000,250],['pauseOnHover','Pause on hover','checkbox'],['rotate','Rotate','range',0,70,1],['depth','Depth','range',0,400,10],['minScale','Side scale','range',0.5,1,0.02]],
    ambientMedia: [['ambientSrc','Image source','text'],['blur','Blur','range',0,100,2],['inset','Inset','range',-80,30,2],['opacity','Opacity','range',0,1,0.02],['saturation','Saturation','range',0,3,0.05],['brightness','Brightness','range',0,2,0.05],['sampleFps','Video FPS','range',2,30,1]],
    lightbox: [['duration','Duration','range',0,1.5,0.05],['backdropOpacity','Backdrop opacity','range',0,1,0.05],['backdropBlur','Backdrop blur','range',0,40,1],['minZoom','Min zoom','range',0.25,1,0.05],['maxZoom','Max zoom','range',1,8,0.25],['zoomStep','Zoom step','range',0.1,1,0.05],['minimap','Minimap','checkbox'],['toolbar','Toolbar','checkbox'],['share','Share button','checkbox'],['exif','Show EXIF','checkbox'],['info','Info','checkbox'],['closeOnBackdrop','Close on backdrop','checkbox']],
    progress: [['ui','UI','select',['bar','ring']],['thickness','Bar thickness','range',1,14,1],['radius','Bar radius','range',0,99,1],['color2','Gradient end','color'],['size','Ring size','range',24,120,2],['stroke','Ring stroke','range',1,10,1],['showPercent','Show percent','checkbox'],['clickToTop','Click to top','checkbox'],['smoothing','Smoothing','range',0,0.9,0.05],['hideAtEnd','Hide at end','checkbox']],
    fullpage: [['duration','Duration','range',0.2,1.6,0.05],['axis','Axis','select',['y','x','mixed']],['drag','Mouse drag','checkbox'],['mode','Mode','select',['transform','snap']],['loop','Loop','checkbox'],['dots','Dots','checkbox'],['wheel','Wheel','checkbox'],['touch','Touch swipe','checkbox'],['keyboard','Keyboard','checkbox'],['threshold','Swipe threshold','range',10,80,2],['autoAdvance','Auto advance (ms)','range',0,6000,250]],
    marquee: [['direction','Direction','select',['left','right']],['skew','Scroll skew (deg)','range',0,20,1],['fade','Edge fade (px)','range',0,120,4],['speed','Speed','range',10,200,5],['pauseOnHover','Pause on hover','checkbox'],['reverseOnScrollUp','Reverse on scroll','checkbox'],['scrollAcceleration','Acceleration','range',0,1.5,0.05]],
    parallax: [['axis','Axis','select',['x','y']],['speed','Speed','range',-1,1,0.05],['distance','Distance','range',-300,300,10],['scrub','Scrub','range',0,2,0.1]],
    cssScroll: [['property','CSS property','text'],['start','Start','text'],['end','End','text']],
    scrollSequence: [['fit','Fit','select',['cover','contain']],['scrollLength','Scroll length','text'],['scrub','Scrub','range',0,2,0.1],['preloadRadius','Preload radius','range',0,12,1]],
    brushReveal: [['radius','Brush radius','range',12,200,2],['softness','Softness','range',0,0.95,0.05],['fade','Heal speed','range',0.005,0.3,0.005],['persist','Persist strokes','checkbox'],['blur','Edge blur (px)','range',0,20,1],['opacity','Brush opacity','range',0.1,1,0.05]],
    blurText: [['duration','Duration','range',0.1,2.5,0.05],['stagger','Stagger','range',0,0.2,0.005],['once','Once','checkbox']]
  };

  const DEFAULTS = {
    fullpage:{duration:.75,mode:'transform',loop:false,dots:true,wheel:true,touch:true,keyboard:true,threshold:24,autoAdvance:0},
    counter:{duration:1.2,loops:2,popScale:2,popDuration:.3,stagger:.06,format:',',tileColor:'#191b20',tileTextColor:'#f6f7fb',gap:3,seconds:true,blink:true,blinkSeparators:false,clockStyle:'roll',rollDirection:'up',rollDuration:.28,daysLabel:'d'},
    lazy:{duration:1,delay:0,blur:18,skeletonIcon:true,noise:.25,direction:'down',feather:70,pixelStart:.02,pixelEnd:1,pixelStepCount:7,stepDuration:180,holdDuration:0,minDuration:700,startScale:1.12},
    overflowText:{speed:45,delay:600,endPause:800,restartDelay:600,maskDuration:160,pageDuration:900,flipDuration:320,flipDirection:'down',gap:40,pauseOnHover:true},
    cardGlow:{radius:160,opacity:.8,blur:14,spread:0,follow:.18,sensitivity:1,alwaysOn:false,color:'#ff5b1c',shadow:false,shadowColor:'#111827',shadowOpacity:.24,shadowBlur:32,shadowSpread:-10,shadowX:0,shadowY:12,shadowFollow:12,shadowHoverOnly:false,shadowInset:false,shadowCss:''},
    tilt:{max:12,sensitivity:1,smoothing:.12,perspective:1000,scale:1.02,reverse:false,reset:true,glare:true,glareOpacity:.22,glareRadius:120,tiltShadow:false,tiltShadowColor:'#111827',tiltShadowOpacity:.28,tiltShadowBlur:34,tiltShadowSpread:-8,tiltShadowX:0,tiltShadowY:14,tiltShadowFollow:1.1,tiltShadowHoverOnly:false,tiltShadowInset:false,tiltShadowCss:''},
    magnetic:{strength:.45,radius:120},ripple:{duration:520,opacity:.75,scale:2.6,centered:false,unbounded:false,color:'rgba(255,255,255,.75)'},
    mouseParallax:{maxX:40,maxY:40,speed:.05,global:false},textSplit:{by:'char',animation:'wave',duration:.8,stagger:.035,delay:0},
    typewriter:{typeSpeed:55,eraseSpeed:30,pauseAfter:950,loop:true,caret:true,hangul:false},textReveal:{speed:65,stagger:.04,duration:.8},
    textTransition:{duration:.45,pause:1100,blur:16,startScale:.86,endScale:1.12,charMode:false,loop:true},glitch:{intensity:1.15,delay:.2,speed:1,trigger:'auto',loop:true},
    reveal:{duration:1,delay:0,once:true},scrollVelocity:{axis:'x',distance:90,maxSkew:10,maxRotate:8,maxScale:.08,maxBlur:1.5,smoothing:.1,reverse:false},
    stickyStack:{gap:20,scrub:.8,snap:true,effect:'depth',overlap:.35,previousOpacity:.12,previousScale:.9,previousBlur:8,scrollLength:90},
    slider:{loop:'infinite',gap:18,perView:1.35,speed:.55,autoplay:0,dots:false,progress:false,progressType:'bar',pauseButton:false,pauseOnHover:false,drag:true,touch:true,keyboard:true,effectIntensity:1,effectDirection:'left',rotate:42,depth:130,minScale:.82},ambientMedia:{blur:48,inset:-28,opacity:.78,sampleInterval:700},
    lightbox:{duration:.18,backdropOpacity:.82,backdropBlur:20,radius:14,closeOnImage:false,toolbar:true,info:true,minimap:true,closeOnBackdrop:true},marquee:{direction:'left',speed:70,pauseOnHover:true,reverseOnScrollUp:true,scrollAcceleration:.35},
    parallax:{axis:'y',speed:-.18,distance:100,scrub:1},brushReveal:{radius:80,softness:.55,fade:.045,persist:false,blur:0},scrollSequence:{fit:'cover',scrollLength:'400vh',scrub:1,preloadRadius:3},blurText:{duration:.8,stagger:.025,once:true},
    scrollShadows:{mode:'shadow',shape:'radial',axis:'vertical',size:44,transition:180,opacity:1,shadow:'rgba(0, 0, 0, 0.24)'}
  };


  // Show only the options that actually do something for the current preset.
  const WHEN = {
    counter: {
      loops:(o)=>['slot','digit','flip'].includes(o.preset||'slot'),
      popScale:(o)=>(o.preset)==='pop', popDuration:(o)=>(o.preset)==='pop', popAlign:(o)=>(o.preset)==='pop',
      stagger:(o)=>(o.preset||'slot')!=='plain',
      tileColor:(o)=>(o.preset)==='flip'||((o.preset)==='clock'&&o.clockStyle==='flip'), tileTextColor:(o)=>(o.preset)==='flip'||((o.preset)==='clock'&&o.clockStyle==='flip'), gap:(o)=>(o.preset)==='flip', seamColor:(o)=>(o.preset)==='flip'||((o.preset)==='clock'&&o.clockStyle==='flip'), shadow:(o)=>(o.preset)==='flip'||((o.preset)==='clock'&&o.clockStyle==='flip'), separatorColor:(o)=>(o.preset||'slot')!=='plain',
      to:(o)=>(o.preset||'slot')!=='clock', from:(o)=>['slot','plain'].includes(o.preset||'slot'), separator:(o)=>(o.preset||'slot')!=='clock', blinkSeparators:(o)=>!['clock','plain'].includes(o.preset||'slot'),
      duration:(o)=>(o.preset||'slot')!=='clock', locale:(o)=>(o.preset||'slot')!=='clock', prefix:(o)=>(o.preset||'slot')!=='clock', suffix:(o)=>(o.preset||'slot')!=='clock',
      seconds:(o)=>(o.preset)==='clock', hour12:(o)=>(o.preset)==='clock'&&!o.until&&!o.since, blink:(o)=>(o.preset)==='clock', clockStyle:(o)=>(o.preset)==='clock', until:(o)=>(o.preset)==='clock', since:(o)=>(o.preset)==='clock'&&!o.until, daysLabel:(o)=>(o.preset)==='clock'&&(!!o.until||!!o.since), clockSeparator:(o)=>(o.preset)==='clock', rollDuration:(o)=>(o.preset)==='clock'&&(o.clockStyle||'roll')!=='instant', rollDirection:(o)=>(o.preset)==='clock'&&(o.clockStyle||'roll')==='roll'
    },
    loader: {
      trackColor:(o)=>['circular','bar'].includes(o.preset||'slot'),
      size:(o)=>(o.preset)==='circular',
      stroke:(o)=>(o.preset)==='circular',
      linecap:(o)=>(o.preset)==='circular',
      showPercent:(o)=>['slot','circular','bar'].includes(o.preset||'slot'),
      barWidth:(o)=>(o.preset)==='bar',
      barHeight:(o)=>(o.preset)==='bar',
      radius:(o)=>(o.preset)==='bar',
      label:(o)=>(o.preset)==='bar'
    },
    loadingIndicator: {
      spinnerStyle:(o)=>(o.preset)==='spinner',
      dotStyle:(o)=>(o.preset)==='dots',
      dotCount:(o)=>o.preset==='dots'||(o.preset==='spinner'&&o.spinnerStyle==='spokes'),
      dotSize:(o)=>(o.preset)==='dots',
      dotGap:(o)=>(o.preset)==='dots',
      text:(o)=>['shimmer','shimmer-wave'].includes(o.preset),
      textSize:(o)=>['shimmer','shimmer-wave'].includes(o.preset),
      baseColor:(o)=>['shimmer','shimmer-wave'].includes(o.preset),
      highlightColor:(o)=>['shimmer','shimmer-wave','terminal'].includes(o.preset)||(o.preset==='spinner'&&o.spinnerStyle==='dual'),
      spread:(o)=>(o.preset)==='shimmer',
      fontFamily:(o)=>['shimmer','shimmer-wave','terminal'].includes(o.preset),
      terminalStyle:(o)=>(o.preset)==='terminal',
      cursorChar:(o)=>(o.preset)==='terminal'&&(o.terminalStyle||'cursor')==='cursor',
      direction:(o)=>(o.preset||'slot')!=='slot',
      motionDuration:()=>true,
      barWidth:(o)=>(o.preset)==='bar',
      barHeight:(o)=>(o.preset)==='bar',
      indeterminate:(o)=>(o.preset)==='bar',
      progress:(o)=>(o.preset)==='terminal'&&o.terminalStyle==='meter'
    },
    scrollShadows: {
      shape:(o)=>(o.mode||o.preset||'shadow')==='shadow',
      opacity:(o)=>(o.mode||o.preset||'shadow')==='shadow',
      shadow:(o)=>(o.mode||o.preset||'shadow')==='shadow',
      transitionMode:(o)=>(o.mode||o.preset||'shadow')==='mask',
      transitionDuration:(o)=>(o.mode||o.preset||'shadow')==='mask'&&(o.transitionMode||'smooth')==='smooth',
      ease:(o)=>(o.mode||o.preset||'shadow')==='mask'&&(o.transitionMode||'smooth')==='smooth'
    },
    progress: {
      // Headless (property is a CSS var like --read): no built-in UI, so hide
      // the bar/ring options entirely — switching them broke the custom demo.
      ui:(o)=>!String(o.property||'').startsWith('--'),
      thickness:(o)=>!String(o.property||'').startsWith('--')&&(o.ui||'bar')==='bar', radius:(o)=>!String(o.property||'').startsWith('--')&&(o.ui||'bar')==='bar', color2:(o)=>!String(o.property||'').startsWith('--')&&(o.ui||'bar')==='bar',
      size:(o)=>o.ui==='ring', stroke:(o)=>o.ui==='ring', showPercent:(o)=>o.ui==='ring', clickToTop:(o)=>o.ui==='ring'
    },
    lazy: {
      blur:(o)=>['blur-up','print','dissolve'].includes(o.preset||'fade'),
      noise:(o)=>['print','dissolve','pixelate'].includes(o.preset), direction:(o)=>(o.preset)==='print', feather:(o)=>(o.preset)==='print',
      steps:(o)=>(o.preset)==='pixelate', stepCount:(o)=>(o.preset)==='pixelate', stepDuration:(o)=>(o.preset)==='pixelate', holdDuration:(o)=>(o.preset)==='pixelate',
      glitchStrength:(o)=>(o.preset)==='flicker', sliceCount:(o)=>(o.preset)==='flicker',
      minDuration:(o)=>(o.preset)==='skeleton', skeletonColor:(o)=>(o.preset)==='skeleton', skeletonHighlight:(o)=>(o.preset)==='skeleton', skeletonIcon:(o)=>(o.preset)==='skeleton',
      startScale:(o)=>(o.preset)==='blur-up'
    },
    overflowText: {
      preset:(o)=>o.trigger!=='hover',
      gap:(o)=>(o.preset||'loop')==='loop',
      endPause:(o)=>['bounce','rewind','scroll-fade'].includes(o.preset),
      restartDelay:(o)=>['bounce','rewind','page','flip','dissolve','page-roll','fade'].includes(o.preset),
      maskDuration:(o)=>['rewind','page','fade','scroll-fade'].includes(o.preset), maskDirection:(o)=>['rewind','page'].includes(o.preset),
      pageDuration:(o)=>['page','flip','dissolve','page-roll','fade'].includes(o.preset),
      crossfade:(o)=>o.preset==='scroll-fade',
      flipDuration:(o)=>(o.preset)==='flip', flipDirection:(o)=>(o.preset)==='flip',
      dissolveDuration:(o)=>(o.preset)==='dissolve', jitter:(o)=>(o.preset)==='dissolve',
      rollDuration:(o)=>['rolling','page-roll'].includes(o.preset), rollDirection:(o)=>['rolling','page-roll'].includes(o.preset),
      items:(o)=>(o.preset)==='rolling',
      // Hover-trigger options only make sense when trigger:'hover'; pause-on-hover
      // is meaningless for a hover-triggered effect, so hide it there.
      speed:(o)=>o.trigger==='hover' ? o.loopOnHover===true : ['loop','bounce','rewind','once','scroll-fade'].includes(o.preset||'loop'),
      pauseOnHover:(o)=>o.trigger!=='hover',
      restoreOnLeave:(o)=>o.trigger==='hover',
      restoreDirection:(o)=>o.trigger==='hover'&&o.restoreOnLeave!==false,
      loopOnHover:(o)=>o.trigger==='hover'
    },
    hold: {
      step:(o)=>o.mode==='mash', decay:(o)=>o.mode==='mash',
      duration:(o)=>(o.mode||'hold')!=='mash'
    },
    accordion: { blur:(o)=>(o.effect||'blur')==='blur' },
    cursor: {
      dotSize:(o)=>['dot','ring','crosshair','sparkle','text'].includes(o.preset||'dot'),
      followerSize:(o)=>['dot','ring','blob','text'].includes(o.preset||'dot'),
      smoothing:(o)=>!['crosshair','sparkle'].includes(o.preset),
      hoverScale:(o)=>o.hoverEffect==='ring',
      hoverEffect:(o)=>['dot','ring','text'].includes(o.preset||'dot'),
      hoverDotSize:(o)=>['dot','ring','text'].includes(o.preset||'dot')&&o.hoverEffect!=='ring',
      trailCount:(o)=>(o.preset)==='trail', orbitRadius:(o)=>(o.preset)==='orbit', orbitText:(o)=>(o.preset)==='orbit',
      snakeText:(o)=>(o.preset)==='snake', rotateText:(o)=>(o.preset)==='text',
      src:(o)=>(o.preset)==='image', hoverSrc:(o)=>(o.preset)==='image', width:(o)=>(o.preset)==='image', height:(o)=>(o.preset)==='image', template:(o)=>(o.preset)==='custom', hoverTemplate:(o)=>(o.preset)==='custom', hoverClass:(o)=>['image','custom'].includes(o.preset), snakeMinScale:(o)=>(o.preset)==='snake', orbitHoverScale:(o)=>(o.preset)==='orbit'
    },
    textReveal: {
      rainbow:(o)=>(o.preset)==='decode', rainbowColors:(o)=>(o.preset)==='decode'&&o.rainbow===true&&o.scrambleFade!==true, scrambleFade:(o)=>(o.preset)==='decode',
      speed:(o)=>['stream','char','word','line','hangul','decode'].includes(o.preset||'stream'),
      stagger:(o)=>['stream','char','word','line','bounce'].includes(o.preset||'stream'),
      duration:(o)=>['bounce','flicker'].includes(o.preset),
      flickerLoop:(o)=>(o.preset)==='flicker',
      loop:(o)=>(o.preset)==='decode', hold:(o)=>(o.preset)==='decode', flickerCount:(o)=>(o.preset)==='decode'
    },
    textTransition: {
      blur:(o)=>(o.preset)==='blur', startScale:(o)=>(o.preset)==='scale', endScale:(o)=>(o.preset)==='scale',
      jitter:(o)=>(o.preset)==='dissolve',
      charMode:(o)=>!['shimmer','dissolve'].includes(o.preset),
      charDirection:(o)=>o.charMode===true&&!['shimmer'].includes(o.preset),
      pause:(o)=>(o.preset)!=='shimmer', loop:(o)=>(o.preset)!=='shimmer'
    },
    glitch: { sliceCount:(o)=>['image','datamosh','reveal'].includes(o.preset), duration:(o)=>!['crt','vcr'].includes(o.preset), loop:(o)=>(o.preset)!=='reveal' },
    cardGlow: {
      radius:(o)=>['spotlight','pointer','border'].includes(o.preset||'spotlight'),
      sensitivity:(o)=>['spotlight','pointer','border'].includes(o.preset||'spotlight'),
      follow:(o)=>['spotlight','pointer','border'].includes(o.preset||'spotlight'),
      cycleDuration:(o)=>['comet','aurora','shine'].includes(o.preset),
      surfaceOpacity:(o)=>o.surface===true, surfaceColor:(o)=>o.surface===true,
      borderColor:(o)=>o.borderGlow===true||['comet','border'].includes(o.preset), borderWidth:(o)=>o.borderGlow===true||['comet','border'].includes(o.preset),
      shadowColor:(o)=>o.shadow===true, shadowOpacity:(o)=>o.shadow===true, shadowBlur:(o)=>o.shadow===true,
      shadowSpread:(o)=>o.shadow===true, shadowX:(o)=>o.shadow===true, shadowY:(o)=>o.shadow===true,
      shadowFollow:(o)=>o.shadow===true, shadowHoverOnly:(o)=>o.shadow===true, shadowInset:(o)=>o.shadow===true,
      shadowCss:(o)=>o.shadow===true
    },
    tilt: {
      glareOpacity:(o)=>o.glare!==false, glareRadius:(o)=>o.glare!==false,
      tiltShadowColor:(o)=>o.tiltShadow===true, tiltShadowOpacity:(o)=>o.tiltShadow===true,
      tiltShadowBlur:(o)=>o.tiltShadow===true, tiltShadowSpread:(o)=>o.tiltShadow===true,
      tiltShadowX:(o)=>o.tiltShadow===true, tiltShadowY:(o)=>o.tiltShadow===true,
      tiltShadowFollow:(o)=>o.tiltShadow===true, tiltShadowHoverOnly:(o)=>o.tiltShadow===true,
      tiltShadowInset:(o)=>o.tiltShadow===true, tiltShadowCss:(o)=>o.tiltShadow===true
    },
    bottomSheet: {
      resizeArea:(o)=>o.resizable===true,
      minHeight:(o)=>o.resizable===true,
      maxHeight:(o)=>o.resizable===true
    },
    slider: {
      rotate:(o)=>(o.preset||'slide')==='coverflow', depth:(o)=>(o.preset||'slide')==='coverflow', minScale:(o)=>(o.preset||'slide')==='coverflow',
      align:(o)=>(o.preset||'slide')==='slide',
      axis:(o)=>['slide','coverflow','wipe','flip','cube'].includes(o.preset||'slide'),
      effectDirection:(o)=>(o.preset||'slide')==='wipe',
      effectIntensity:(o)=>['dissolve','wipe','flip','cube','cards','creative'].includes(o.preset||'slide'),
      gap:(o)=>['slide','coverflow'].includes(o.preset||'slide'),
      perView:(o)=>['slide','coverflow'].includes(o.preset||'slide'),
      progress:(o)=>Number(o.autoplay || 0) > 0,
      progressType:(o)=>Number(o.autoplay || 0) > 0 && o.progress === true,
      pauseButton:(o)=>Number(o.autoplay || 0) > 0,
      pauseOnHover:(o)=>Number(o.autoplay || 0) > 0
    },
    reveal: {
      direction:(o)=>['wipe','mask','slide-up','slide-down','slide-left','slide-right'].includes(o.preset||'fade-up'),
      order:(o)=>Number(o.stagger || 0) > 0,
      startAngle:(o)=>(o.preset)==='clock', clockDirection:(o)=>(o.preset)==='clock'
    },
    stickyStack: {
      effect:(o)=>(o.preset)==='floating', overlap:(o)=>(o.preset)==='floating', previousOpacity:(o)=>(o.preset)==='floating',
      previousScale:(o)=>(o.preset)==='floating', previousBlur:(o)=>(o.preset)==='floating',
      gap:(o)=>(o.preset)==='horizontal', snap:(o)=>(o.preset)==='horizontal',
      scrollLength:(o)=>['floating','horizontal'].includes(o.preset)
    },
    coverReveal: {
      color:(o)=>['single','pair'].includes(o.colorMode || 'pair'),
      color2:(o)=>(o.colorMode || 'pair') === 'pair' && Number(o.layers || 2) > 1,
      colors:(o)=>(o.colorMode || 'pair') === 'palette',
      waitForImage:(o)=>o.lines !== true
    },
    lightbox: {
      zoomStep:(o)=>Number(o.maxZoom || 1) > Number(o.minZoom || 1),
      minimap:(o)=>Number(o.maxZoom || 1) > 1,
      share:(o)=>o.toolbar !== false,
      download:(o)=>o.toolbar !== false,
      exif:(o)=>o.info !== false
    },
    textSplit: { hold:(o)=>o.texts!=null, swapOut:(o)=>o.texts!=null }
  };

  // Friendly Korean explanations shown in the (?) tooltip of each option.
  let HELP_LANG = 'ko';
  const HELP_SETS = (typeof window !== 'undefined' && window.MK_HELP_I18N) || { ko: {}, en: {} };
  const UI_SETS = (typeof window !== 'undefined' && window.KINETO_PLAYGROUND_I18N) || { ko: {}, en: {} };
  let UI_LANG = 'ko';
  const ui = (key) => UI_SETS[UI_LANG]?.[key] ?? UI_SETS.en?.[key] ?? UI_SETS.ko?.[key] ?? key;
  const localize = (element, key, attribute = 'textContent') => {
    if (!element) return element;
    element.dataset.pgI18n = key;
    element.dataset.pgI18nAttribute = attribute;
    if (attribute === 'textContent') element.textContent = ui(key);
    else element.setAttribute(attribute, ui(key));
    return element;
  };
  const refreshUi = (root = document) => {
    root.querySelectorAll('[data-pg-i18n]').forEach((element) => {
      const value = ui(element.dataset.pgI18n);
      const attribute = element.dataset.pgI18nAttribute || 'textContent';
      const prefix = element.dataset.pgI18nPrefix;
      if (attribute === 'textContent') element.textContent = prefix ? `${prefix} · ${value}` : value;
      else element.setAttribute(attribute, value);
    });
    root.querySelectorAll('[data-pg-i18n-title]').forEach((element) => {
      element.title = ui(element.dataset.pgI18nTitle);
    });
    root.querySelectorAll('[data-pg-drawer-sub]').forEach((element) => element.__ktRefreshLocale?.());
  };
  const HELP = new Proxy({}, {
    get(_t, moduleName) {
      const lang = HELP_SETS[HELP_LANG] ? HELP_LANG : (HELP_SETS.en ? 'en' : 'ko');
      const primary = HELP_SETS[lang]?.[moduleName] || {};
      const fallback = HELP_SETS.en?.[moduleName] || HELP_SETS.ko?.[moduleName] || {};
      // Per-key fallback so a missing translation drops to English then Korean.
      return new Proxy({}, { get: (_o, key) => primary[key] ?? fallback[key] ?? HELP_SETS.ko?.[moduleName]?.[key] } );
    }
  });

  // ── Interaction / component modules added to the playground so every demo
  // card exposes live options + copyable code (same as all other modules).
  Object.assign(MODULE_ATTRIBUTES, {
    confetti: 'data-kt-confetti', accordion: 'data-kt-accordion', hold: 'data-kt-hold',
    megaMenu: 'data-kt-mega-menu', toast: 'data-kt-toast', bottomSheet: 'data-kt-bottom-sheet', tabs: 'data-kt-tabs',
    radial: 'data-kt-radial', coverReveal: 'data-kt-cover-reveal',
    gesture: 'data-kt-gesture', drag: 'data-kt-drag', tooltip: 'data-kt-tooltip', switch: 'data-kt-switch', flip: 'data-kt-flip'
  });
  // NOTE: PUBLIC_OPTIONS is generated verbatim from kineto.features.json (see
  // scripts/sync-playground-options.mjs) — it is the single source of truth for
  // the option CONTRACT and must not be hand-patched here. Only FIELDS/DEFAULTS
  // (the settings UI) are defined below.
  Object.assign(FIELDS, {
    confetti: [['count','Count','range',10,300,5],['spread','Spread','range',10,180,2],['gravity','Gravity','range',0,3,0.05],['scalar','Scale','range',0.4,3,0.05],['duration','Duration (s)','range',0.5,4,0.1],['colors','Colors (comma)','text'],['trigger','Trigger','select',['click','view','auto']],['zIndex','z-index','range',1000,20000,500]],
    hold: [['mode','Mode','select',['hold','mash']],['duration','Duration (ms)','range',300,4000,50],['step','Mash step','range',0.02,0.4,0.02],['decay','Mash decay/s','range',0,2,0.05],['color','Fill color','text'],['blend','Fill blend','select',['normal','multiply','screen','overlay','difference','luminosity']],['submit','Auto submit/action','checkbox'],['action','Action selector','text']],
    accordion: [['single','Single open','checkbox'],['effect','Reveal effect','select',['blur','fade','none']],['duration','Duration (s)','range',0.1,1,0.02],['blur','Blur','range',0,20,1],['arrowPosition','Arrow side','select',['right','left']],['ease','Ease','text'],['activeClass','Active class','text']],
    megaMenu: [['trigger','Trigger','select',['hover','click']],['layout','Layout','select',['dropdown','mega']],['indicator','Indicator','select',['none','chevron','plus']],['openDelay','Open delay (ms)','range',0,400,10],['closeDelay','Close delay (ms)','range',0,600,10],['duration','Duration (s)','range',0.05,0.6,0.01]],
    toast: [['message','Message','text'],['type','Type','select',['info','success','warning','error','none']],['icon','Icon (glyph/emoji)','text'],['position','Position','select',['bottom-right','bottom-left','top-right','top-left','top','bottom']],['duration','Duration (ms)','range',1000,30000,500],['progressBar','Progress','select',['none','bar','ring']],['barColor','Progress color','text'],['max','Max stack','range',1,8,1],['dismissible','Dismissible (close btn)','checkbox']],
    bottomSheet: [['backdrop','Backdrop','checkbox'],['backdropOpacity','Backdrop opacity','range',0,1,0.05],['dismissible','Dismissible','checkbox'],['handle','Drag handle','checkbox'],['resizable','Resizable height','checkbox'],['resizeArea','Resize area','select',['handle','header']],['minHeight','Minimum height','range',120,480,10],['maxHeight','Maximum height','range',320,1200,20],['duration','Duration (s)','range',0.1,0.8,0.02]],
    tabs: [['activation','Activation','select',['automatic','manual']],['orientation','Orientation','select',['horizontal','vertical']],['effect','Panel effect','select',['fade','slide','blur','cross','none']],['indicatorMotion','Marker motion','select',['slide','none','fade']],['indicator','Indicator','checkbox'],['duration','Duration (s)','range',0,0.6,0.02],['activeClass','Active class','text']],
    radial: [['position','Dock','select',['bottom','top','left','right']],['align','Align','select',['center','edge']],['radius','Radius','range',80,900,10],['step','Angle step','range',6,60,1],['activeAngle','Active angle','range',-180,180,5],['duration','Duration (s)','range',0,1.5,0.05],['loop','Loop','checkbox'],['drag','Drag','checkbox'],['controls','Controls','checkbox'],['autoplay','Autoplay (ms)','range',0,6000,250],['activeClass','Active class','text']],
    coverReveal: [['lines','Per-line (text)','checkbox'],['colorMode','Color mode','select',['single','pair','palette','auto']],['color','Panel color','color'],['color2','Panel color 2','color'],['colors','Color palette','text'],['direction','Direction','select',['right','left','up','down','random']],['duration','Duration (s)','range',0.2,2,0.05],['delay','Delay (ms)','range',0,2000,50],['layers','Layers','range',1,3,1],['stagger','Stagger (ms)','range',0,400,10],['waitForImage','Wait for image','checkbox']],
    gesture: [['hoverScale','Hover scale','range',1,1.4,0.01],['tapScale','Tap scale','range',0.7,1,0.01],['lift','Lift (px)','range',0,20,1],['origin','Origin','select',['center','top','bottom','left','right']],['duration','Duration (s)','range',0,0.6,0.02]],
    drag: [['axis','Axis','select',['both','x','y']],['bounds','Bounds','select',['','parent']],['snapBack','Snap back','checkbox'],['inertia','Inertia','checkbox']],
    tooltip: [['content','Content','text'],['placement','Placement','select',['top','bottom','left','right']],['effect','Show/hide','select',['fade','scale','shift','none']],['trigger','Trigger','select',['hover','focus','click','manual']],['delay','Show delay (ms)','range',0,800,20],['hideDelay','Hide delay (ms)','range',0,800,20],['offset','Offset (px)','range',0,24,1],['duration','Fade (s)','range',0,0.5,0.02],['html','HTML content','checkbox'],['interactive','Interactive (hover into)','checkbox']],
    switch: [['checked','On','checkbox'],['size','Size','range',14,40,2],['onColor','On color','color'],['offColor','Off color','text'],['thumbColor','Thumb color','color'],['duration','Duration (s)','range',0,0.6,0.02]],
    flip: [['duration','Duration (s)','range',0,1,0.02],['stagger','Stagger (s)','range',0,0.15,0.01],['watch','Auto-watch','checkbox']]
  });
  Object.assign(DEFAULTS, {
    confetti:{count:140,spread:75,gravity:.9,scalar:1,duration:1.8,trigger:'click'},
    hold:{mode:'hold',duration:1100,step:.08,decay:.4,blend:'normal'},
    accordion:{single:false,effect:'blur',duration:.4,blur:6,arrowPosition:'right'},
    megaMenu:{trigger:'hover',layout:'dropdown',indicator:'none',openDelay:60,closeDelay:180,duration:.24},
    radial:{position:'bottom',align:'center',radius:260,step:26,activeAngle:-90,duration:.6,loop:true,drag:true,controls:true,autoplay:0},
    coverReveal:{colorMode:'pair',color:'#ff5b1c',color2:'#12141a',colors:'#ff5b1c,#ac7bef,#2791ef,#e5b322',direction:'right',duration:.7,delay:0,layers:2,stagger:120,lines:false,waitForImage:true},
    gesture:{hoverScale:1.04,tapScale:.96,lift:0,origin:'center',duration:.22},
    drag:{axis:'both',bounds:'',snapBack:false,inertia:true},
    tooltip:{placement:'top',effect:'fade',trigger:'hover',delay:120,hideDelay:80,offset:8,duration:.16,interactive:false},
    switch:{checked:false,size:24,onColor:'#ff5b1c',duration:.22},
    flip:{duration:.4,stagger:0,watch:true},
    toast:{type:'info',position:'bottom-right',duration:5000,dismissible:true},
    bottomSheet:{backdrop:true,backdropOpacity:.5,dismissible:true,handle:true,resizable:false,resizeArea:'handle',minHeight:140,maxHeight:900,duration:.34},
    tabs:{activation:'automatic',orientation:'horizontal',effect:'fade',indicatorMotion:'slide',indicator:true,duration:.28}
  });

  // Settings fields for lightbox extras (the CONTRACT already lists these in
  // features.json → synced PUBLIC_OPTIONS; here we only add the UI controls).
  if (FIELDS.lightbox && !FIELDS.lightbox.some((f) => f[0] === 'transition')) FIELDS.lightbox.push(['transition','Change effect','select',['rise','fade','crossfade','dissolve','slide','zoom','none']]);
  if (FIELDS.lightbox && !FIELDS.lightbox.some((f) => f[0] === 'download')) FIELDS.lightbox.push(['download','Download button','checkbox']);
  if (FIELDS.lightbox && !FIELDS.lightbox.some((f) => f[0] === 'share')) FIELDS.lightbox.push(['share','Share button','checkbox']);
  if (FIELDS.lightbox && !FIELDS.lightbox.some((f) => f[0] === 'thumbnails')) FIELDS.lightbox.push(['thumbnails','Filmstrip (group)','checkbox']);
  if (FIELDS.brushReveal && !FIELDS.brushReveal.some((f) => f[0] === 'hold')) { FIELDS.brushReveal.push(['hold','Hold to scratch','checkbox']); FIELDS.brushReveal.push(['threshold','Reveal threshold','range',0.1,1,0.05]); }

  Object.assign(MODULE_ATTRIBUTES, {
    scrollShadows: 'data-kt-scroll-shadows', stickyHeader: 'data-kt-sticky-header', horizontalScroll: 'data-kt-horizontal-scroll',
    loadingIndicator: 'data-kt-loading-indicator'
  });
  Object.assign(FIELDS, {
    scrollShadows: [['mode','Mode','select',['shadow','mask']],['shape','Shape','select',['radial','linear']],['axis','Axis','select',['vertical','horizontal']],['size','Edge size (px)','range',12,80,2],['transitionMode','Edge motion','select',['smooth','instant']],['transitionDuration','Transition (s)','range',0,2,0.05],['ease','Ease','easing'],['opacity','Shadow opacity','range',0,1,0.05],['shadow','Shadow color','color']],
    stickyHeader: [['shrink','Shrink','checkbox'],['shadow','Shadow','checkbox'],['activeClass','Stuck class','text'],['offset','Stuck offset (px)','range',0,120,2],['distance','Progress distance (px)','range',20,400,10]],
    horizontalScroll: [['height','Stage height','text'],['top','Pin top','text'],['smooth','Smooth','checkbox']],
    loadingIndicator: [
      ['spinnerStyle','Spinner style','select',['ring','comet','dual','spokes','orbit']],['dotStyle','Dot style','select',['pulse','bounce','wave']],['terminalStyle','Terminal style','select',['cursor','dots','blocks','meter']],
      ['motionDuration','Motion duration (s)','range',0.2,4,0.05],['direction','Direction','select',['normal','reverse']],['size','Size','range',18,160,2],['stroke','Stroke','range',1,16,1],
      ['barWidth','Bar width','range',80,520,10],['barHeight','Bar height','range',2,24,1],['indeterminate','Indeterminate','checkbox'],['progress','Progress','range',0,100,1],
      ['dotCount','Dot count','range',3,16,1],['dotSize','Dot size','range',2,24,1],['dotGap','Dot gap','range',0,24,1],
      ['text','Text','text'],['textSize','Text size','range',12,72,1],['fontFamily','Font family','text'],['cursorChar','Cursor','text'],
      ['color','Color','color'],['trackColor','Track color','color'],['baseColor','Base color','color'],['highlightColor','Highlight color','color'],['glow','Glow','checkbox'],['glowColor','Glow color','color'],['glowSize','Glow size','range',0,48,1],['spread','Highlight spread','range',2,80,1]
    ]
  });
  Object.assign(DEFAULTS, {
    scrollShadows:{mode:'shadow',shape:'radial',axis:'vertical',size:44,transitionMode:'smooth',transitionDuration:.18,ease:'cubic-out',opacity:1},
    stickyHeader:{shrink:true,shadow:true,offset:8,distance:120},
    horizontalScroll:{height:'100vh',top:'',smooth:false},
    loadingIndicator:{motionDuration:1.1,direction:'normal',size:48,stroke:4,barWidth:240,barHeight:5,indeterminate:true,progress:64,dotCount:3,dotSize:8,dotGap:6,glow:true,glowSize:16,spread:24}
  });
  // cssScroll gained scroll/view timeline + axis.
  if (PUBLIC_OPTIONS.cssScroll) ['axis','timeline'].forEach((o) => { if (!PUBLIC_OPTIONS.cssScroll.includes(o)) PUBLIC_OPTIONS.cssScroll.push(o); });
  // marquee gained an edge `fade`.
  if (PUBLIC_OPTIONS.marquee && !PUBLIC_OPTIONS.marquee.includes('fade')) PUBLIC_OPTIONS.marquee.push('fade');
  // slider gained mouse-wheel navigation.
  if (PUBLIC_OPTIONS.slider && !PUBLIC_OPTIONS.slider.includes('wheel')) PUBLIC_OPTIONS.slider.push('wheel');
  // confetti gained `once`.
  if (PUBLIC_OPTIONS.confetti && !PUBLIC_OPTIONS.confetti.includes('once')) PUBLIC_OPTIONS.confetti.push('once');
  if (FIELDS.confetti && !FIELDS.confetti.some((f) => f[0] === 'once')) FIELDS.confetti.push(['once','Fire once only','checkbox']);
  // toast progress gained a `fill` style (whole box fills).
  if (FIELDS.toast) { const pf = FIELDS.toast.find((f) => f[0] === 'progressBar'); if (pf && !pf[3].includes('fill')) pf[3].push('fill'); }

  // ── Easing editor: preset picker + live cubic-bezier curve preview ──────────
  // Grouped presets (CSS keywords, easings.net cubic-beziers, spring, GSAP).
  // Full easings.net set (cubic-beziers) + CSS keywords + spring/back + GSAP.
  const EASING_GROUPS = [
    ['Basic', [['default (module)', ''], ['linear', 'linear'], ['ease', 'ease'], ['ease-in', 'ease-in'], ['ease-out', 'ease-out'], ['ease-in-out', 'ease-in-out']]],
    ['Sine', [['In', 'cubic-bezier(0.12,0,0.39,0)'], ['Out', 'cubic-bezier(0.61,1,0.88,1)'], ['In-Out', 'cubic-bezier(0.37,0,0.63,1)']]],
    ['Quad', [['In', 'cubic-bezier(0.11,0,0.5,0)'], ['Out', 'cubic-bezier(0.5,1,0.89,1)'], ['In-Out', 'cubic-bezier(0.45,0,0.55,1)']]],
    ['Cubic', [['In', 'cubic-bezier(0.32,0,0.67,0)'], ['Out', 'cubic-bezier(0.33,1,0.68,1)'], ['In-Out', 'cubic-bezier(0.65,0,0.35,1)']]],
    ['Quart', [['In', 'cubic-bezier(0.5,0,0.75,0)'], ['Out', 'cubic-bezier(0.25,1,0.5,1)'], ['In-Out', 'cubic-bezier(0.76,0,0.24,1)']]],
    ['Quint', [['In', 'cubic-bezier(0.64,0,0.78,0)'], ['Out', 'cubic-bezier(0.22,1,0.36,1)'], ['In-Out', 'cubic-bezier(0.83,0,0.17,1)']]],
    ['Expo', [['In', 'cubic-bezier(0.7,0,0.84,0)'], ['Out', 'cubic-bezier(0.16,1,0.3,1)'], ['In-Out', 'cubic-bezier(0.87,0,0.13,1)']]],
    ['Circ', [['In', 'cubic-bezier(0.55,0,1,0.45)'], ['Out', 'cubic-bezier(0,0.55,0.45,1)'], ['In-Out', 'cubic-bezier(0.85,0,0.15,1)']]],
    // Back overshoots via a real single cubic-bezier (honest to easings.net).
    ['Back (overshoot bezier)', [['In', 'cubic-bezier(0.36,0,0.66,-0.56)'], ['Out', 'cubic-bezier(0.34,1.56,0.64,1)'], ['In-Out', 'cubic-bezier(0.68,-0.6,0.32,1.6)']]],
    // Elastic & Bounce CANNOT be a single cubic-bezier — emitted as real CSS
    // linear() curves sampled from their true easing functions (Kineto.easing).
    ['Elastic (linear())', [['In', 'linear(0,0.00007,0.00086,0.00164,0.00205,0.00175,0.00054,-0.00149,-0.00381,-0.00552,-0.0056,-0.00322,0.00171,0.00819,0.01408,0.01648,0.0127,0.0015,-0.01563,-0.03386,-0.04562,-0.04265,-0.01936,0.02347,0.076,0.11946,0.13031,0.08839,-0.01246,-0.15515,-0.29598,-0.37157,-0.31769,-0.09746,0.26949,0.68916,1)'], ['Out', 'linear(0,0.31084,0.73051,1.09746,1.31769,1.37157,1.29598,1.15515,1.01246,0.91161,0.86969,0.88054,0.924,0.97653,1.01936,1.04265,1.04562,1.03386,1.01563,0.9985,0.9873,0.98352,0.98592,0.99181,0.99829,1.00322,1.0056,1.00552,1.00381,1.00149,0.99946,0.99825,0.99795,0.99836,0.99914,0.99993,1)'], ['In-Out', 'linear(0,0.00058,0.00104,0.00093,-0.00031,-0.00265,-0.00489,-0.00454,0.00103,0.01197,0.0229,0.02219,-0.00288,-0.05399,-0.10707,-0.10808,0.00449,0.24288,0.5,0.75712,0.99551,1.10808,1.10707,1.05399,1.00288,0.97781,0.9771,0.98803,0.99897,1.00454,1.00489,1.00265,1.00031,0.99907,0.99896,0.99942,1)']]],
    ['Bounce (linear())', [['In', 'linear(0,0.01326,0.01485,0.00477,0.02469,0.04856,0.06076,0.06129,0.05015,0.02734,0.0137,0.08213,0.13889,0.18398,0.2174,0.23915,0.24923,0.24764,0.23438,0.20944,0.17284,0.12457,0.06462,0.01384,0.15972,0.29393,0.41647,0.52734,0.62654,0.71407,0.78993,0.85412,0.90664,0.94748,0.97666,0.99416,1)'], ['Out', 'linear(0,0.00584,0.02334,0.05252,0.09336,0.14588,0.21007,0.28593,0.37346,0.47266,0.58353,0.70607,0.84028,0.98616,0.93538,0.87543,0.82716,0.79056,0.76563,0.75236,0.75077,0.76085,0.7826,0.81602,0.86111,0.91787,0.9863,0.97266,0.94985,0.93871,0.93924,0.95144,0.97531,0.99523,0.98515,0.98674,1)'], ['In-Out', 'linear(0,0.00743,0.01235,0.03038,0.02508,0.00685,0.06944,0.1087,0.12461,0.11719,0.08642,0.03231,0.07986,0.20824,0.31327,0.39497,0.45332,0.48833,0.5,0.51167,0.54668,0.60503,0.68673,0.79176,0.92014,0.96769,0.91358,0.88281,0.87539,0.8913,0.93056,0.99315,0.97492,0.96962,0.98765,0.99257,1)']]],
    // A REAL physics spring (stiffness/damping/mass) → linear(). Not a bezier.
    ['Spring (physics)', [['Gentle', 'linear(0,0.01454,0.0527,0.10739,0.17288,0.2446,0.31898,0.39327,0.46544,0.53403,0.59805,0.65688,0.71023,0.75801,0.80031,0.83737,0.86948,0.89703,0.9204,0.94002,0.95631,0.96965,0.98043,0.989,0.9957,1.0008,1.00458,1.00727,1.00908,1.01017,1.0107,1.0108,1.01057,1.01011,1.00949,1.00876,1)'], ['Bouncy', 'linear(0,0.08527,0.29745,0.56971,0.84248,1.07129,1.23018,1.31114,1.32089,1.27601,1.19771,1.10725,1.02242,0.95558,0.913,0.89542,0.89932,0.91858,0.94617,0.97547,1.00128,1.02031,1.03118,1.03422,1.03091,1.02343,1.01405,1.00477,0.99709,0.99184,0.98925,0.98907,0.99071,0.99345,0.99655,0.99942,1)'], ['Stiff', 'linear(0,0.01857,0.06716,0.13639,0.21854,0.30742,0.39816,0.48707,0.57147,0.64952,0.72008,0.78256,0.83681,0.883,0.92156,0.95307,0.9782,0.99769,1.0123,1.02275,1.02972,1.03387,1.03576,1.0359,1.03473,1.03264,1.02992,1.02683,1.02358,1.02033,1.01718,1.01423,1.01153,1.00911,1.00698,1.00515,1)']]],
    ['GSAP (reveal/parallax)', [['power2.out', 'power2.out'], ['power3.out', 'power3.out'], ['power4.out', 'power4.out'], ['back.out(1.7)', 'back.out(1.7)'], ['elastic.out(1,0.5)', 'elastic.out(1,0.5)'], ['none', 'none']]]
  ];
  // Resolve a value to [x1,y1,x2,y2] control points for the preview (or null).
  const CSS_EASE_BEZIER = { linear: [0, 0, 1, 1], ease: [0.25, 0.1, 0.25, 1], 'ease-in': [0.42, 0, 1, 1], 'ease-out': [0, 0, 0.58, 1], 'ease-in-out': [0.42, 0, 0.58, 1] };
  const easingBezier = (value) => {
    const v = String(value || '').trim();
    if (CSS_EASE_BEZIER[v]) return CSS_EASE_BEZIER[v];
    const m = v.match(/cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/i);
    return m ? [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])] : null;
  };
  // Parse a CSS linear(v0, v1 25%, …) into evenly/explicitly placed [x,y] points.
  const linearPoints = (value) => {
    const m = String(value || '').match(/^linear\(([^)]*)\)$/i);
    if (!m) return null;
    const parts = m[1].split(',').map((s) => s.trim()).filter(Boolean);
    const pts = []; let autoI = 0;
    parts.forEach((p, i) => {
      const seg = p.split(/\s+/);
      const y = Number(seg[0]);
      let x = seg[1] && seg[1].endsWith('%') ? Number(seg[1]) / 100 : (parts.length > 1 ? i / (parts.length - 1) : 0);
      if (!Number.isFinite(x)) x = autoI;
      pts.push([x, y]); autoI += 1 / Math.max(1, parts.length - 1);
    });
    return pts.length ? pts : null;
  };
  const easingPreviewSVG = (value) => {
    const W = 132, H = 44, pad = 6;
    const ix = (t) => pad + t * (W - pad * 2);
    const iy = (t) => (H - pad) - t * (H - pad * 2);
    const grid = `<line x1="${pad}" y1="${iy(0)}" x2="${W - pad}" y2="${iy(0)}" class="ek-grid"/><line x1="${pad}" y1="${iy(1)}" x2="${W - pad}" y2="${iy(1)}" class="ek-grid"/>`;
    // linear() curves (Elastic/Bounce/Spring) → polyline through the sampled pts.
    const lin = linearPoints(value);
    if (lin) {
      const d = lin.map((p, i) => `${i ? 'L' : 'M'} ${ix(p[0]).toFixed(1)} ${iy(p[1]).toFixed(1)}`).join(' ');
      return `<svg class="ek-svg" viewBox="0 0 ${W} ${H}">${grid}<path d="${d}" class="ek-curve"/></svg>`;
    }
    const b = easingBezier(value);
    if (!b) return `<svg class="ek-svg" viewBox="0 0 ${W} ${H}">${grid}<text x="${W / 2}" y="${H / 2 + 4}" class="ek-note">no preview</text></svg>`;
    const path = `M ${ix(0)} ${iy(0)} C ${ix(b[0])} ${iy(b[1])} ${ix(b[2])} ${iy(b[3])} ${ix(1)} ${iy(1)}`;
    return `<svg class="ek-svg" viewBox="0 0 ${W} ${H}">${grid}<path d="${path}" class="ek-curve"/><circle cx="${ix(0)}" cy="${iy(0)}" r="2" class="ek-dot"/><circle cx="${ix(1)}" cy="${iy(1)}" r="2" class="ek-dot"/></svg>`;
  };
  // ── Interactive cubic-bezier editor ────────────────────────────────────────
  // Two draggable control points (P1/P2). x is clamped to [0,1] (a CSS
  // requirement); y may overshoot. Pointer drag + keyboard (arrows / shift) both
  // work, the four number inputs stay in two-way sync, and every change reports a
  // `cubic-bezier(...)` string back through onChange for live application.
  const round3 = (n) => Math.round(n * 1000) / 1000;
  const fmtBezier = (p) => `cubic-bezier(${p.map(round3).join(',')})`;
  // Named custom-easing tokens, persisted so a curve tuned once is reusable
  // everywhere (audit C-2 / J-3). Stored as { name: cubicBezierString }.
  const savedEasings = () => { try { return Object.entries(JSON.parse(localStorage.getItem('kt-easings') || '{}')); } catch (_e) { return []; } };
  const saveEasing = (name, value) => { try { const all = JSON.parse(localStorage.getItem('kt-easings') || '{}'); all[name] = value; localStorage.setItem('kt-easings', JSON.stringify(all)); } catch (_e) { /* storage blocked */ } };
  const mountBezierEditor = (host, initial, onChange) => {
    let pts = (easingBezier(initial) || [0.25, 0.1, 0.25, 1]).slice();
    const W = 150, H = 150, pad = 16;
    const ix = (t) => pad + t * (W - pad * 2);
    const iy = (t) => (H - pad) - t * (H - pad * 2);
    const xInv = (px) => clampNum((px - pad) / (W - pad * 2), 0, 1);
    const yInv = (py) => ((H - pad) - py) / (H - pad * 2);
    host.innerHTML = `<svg class="kt-bz-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="Cubic bezier editor">
      <line class="kt-bz-grid" x1="${ix(0)}" y1="${iy(0)}" x2="${ix(1)}" y2="${iy(0)}"/>
      <line class="kt-bz-grid" x1="${ix(0)}" y1="${iy(1)}" x2="${ix(1)}" y2="${iy(1)}"/>
      <line class="kt-bz-guide" data-g="1"/><line class="kt-bz-guide" data-g="2"/>
      <path class="kt-bz-curve"/>
      <circle class="kt-bz-anchor" cx="${ix(0)}" cy="${iy(0)}" r="3"/>
      <circle class="kt-bz-anchor" cx="${ix(1)}" cy="${iy(1)}" r="3"/>
      <circle class="kt-bz-handle" data-p="1" r="7" tabindex="0" role="slider" aria-label="Control point 1"/>
      <circle class="kt-bz-handle" data-p="2" r="7" tabindex="0" role="slider" aria-label="Control point 2"/>
    </svg>
    <div class="kt-bz-nums">
      ${['x1', 'y1', 'x2', 'y2'].map((l, i) => `<label class="kt-bz-num"><span>${l}</span><input type="number" data-i="${i}" step="0.01" ${i % 2 === 0 ? 'min="0" max="1"' : ''} value="${round3(pts[i])}"></label>`).join('')}
    </div>
    <div class="kt-bz-preview" aria-hidden="true"><span class="kt-bz-dot"></span></div>
    <div class="kt-bz-tools">
      <button type="button" class="kt-bz-btn kt-bz-copy"></button>
      <button type="button" class="kt-bz-btn kt-bz-save"></button>
      <button type="button" class="kt-bz-btn kt-bz-reset"></button>
      <span class="kt-bz-status" role="status" aria-live="polite"></span>
    </div>`;
    const svg = host.querySelector('.kt-bz-svg');
    const curve = host.querySelector('.kt-bz-curve');
    const handles = [...host.querySelectorAll('.kt-bz-handle')];
    const guides = [host.querySelector('[data-g="1"]'), host.querySelector('[data-g="2"]')];
    const nums = [...host.querySelectorAll('.kt-bz-nums input')];
    const dot = host.querySelector('.kt-bz-dot');
    const status = host.querySelector('.kt-bz-status');
    const resetControl = localize(host.querySelector('.kt-bz-reset'), 'reset');
    const copyControl = localize(host.querySelector('.kt-bz-copy'), 'easeCopyCss');
    const saveControl = localize(host.querySelector('.kt-bz-save'), 'easeSaveToken');
    [[resetControl, 'easeResetTitle'], [copyControl, 'easeCopyTitle'], [saveControl, 'easeSaveTitle']].forEach(([element, key]) => {
      element.dataset.pgI18nTitle = key;
      element.title = ui(key);
    });
    const initialPts = (easingBezier(initial) || [0.25, 0.1, 0.25, 1]).slice();
    // Live preview: a dot travels left→right using the CURRENT curve, on a loop,
    // so you feel the timing (J-3 "실시간 preview" / duration과 함께 반복 비교).
    let previewAnim = null;
    const prefersReduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_e) { return false; } };
    const replayPreview = () => {
      if (!dot || typeof dot.animate !== 'function') return;
      previewAnim?.cancel();
      // Respect reduced motion: show the endpoint statically instead of looping.
      if (prefersReduced()) { dot.style.left = '100%'; return; }
      try {
        previewAnim = dot.animate(
          [{ left: '0%' }, { left: '100%' }],
          { duration: 1100, easing: fmtBezier(pts), iterations: Infinity, direction: 'alternate' }
        );
      } catch (_e) { /* invalid curve — skip preview */ }
    };
    const render = (emit) => {
      curve.setAttribute('d', `M ${ix(0)} ${iy(0)} C ${ix(pts[0])} ${iy(pts[1])} ${ix(pts[2])} ${iy(pts[3])} ${ix(1)} ${iy(1)}`);
      handles[0].setAttribute('cx', ix(pts[0])); handles[0].setAttribute('cy', iy(pts[1]));
      handles[1].setAttribute('cx', ix(pts[2])); handles[1].setAttribute('cy', iy(pts[3]));
      guides[0].setAttribute('x1', ix(0)); guides[0].setAttribute('y1', iy(0)); guides[0].setAttribute('x2', ix(pts[0])); guides[0].setAttribute('y2', iy(pts[1]));
      guides[1].setAttribute('x1', ix(1)); guides[1].setAttribute('y1', iy(1)); guides[1].setAttribute('x2', ix(pts[2])); guides[1].setAttribute('y2', iy(pts[3]));
      // Screen-reader coordinates + validity per handle (J-3 a11y).
      handles.forEach((h, hi) => {
        const x = pts[hi * 2]; const y = pts[hi * 2 + 1];
        h.setAttribute('aria-valuetext', `x ${round3(x)}, y ${round3(y)}`);
        h.setAttribute('aria-invalid', x < 0 || x > 1 ? 'true' : 'false');
      });
      nums.forEach((n, i) => { if (document.activeElement !== n) n.value = round3(pts[i]); });
      replayPreview();
      if (emit) onChange(fmtBezier(pts));
    };
    const setFromEvent = (idx, e) => {
      const r = svg.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width * W; const py = (e.clientY - r.top) / r.height * H;
      pts[idx * 2] = round3(xInv(px)); pts[idx * 2 + 1] = round3(clampNum(yInv(py), -1, 2)); render(true);
    };
    handles.forEach((hd, i) => {
      hd.addEventListener('pointerdown', (e) => { e.preventDefault(); hd.setPointerCapture(e.pointerId);
        const move = (ev) => setFromEvent(i, ev);
        const up = () => { hd.releasePointerCapture(e.pointerId); hd.removeEventListener('pointermove', move); hd.removeEventListener('pointerup', up); };
        hd.addEventListener('pointermove', move); hd.addEventListener('pointerup', up);
      });
      hd.addEventListener('keydown', (e) => {
        const step = e.shiftKey ? 0.1 : 0.02; let dx = 0, dy = 0;
        if (e.key === 'ArrowLeft') dx = -step; else if (e.key === 'ArrowRight') dx = step;
        else if (e.key === 'ArrowUp') dy = step; else if (e.key === 'ArrowDown') dy = -step; else return;
        e.preventDefault();
        pts[i * 2] = round3(clampNum(pts[i * 2] + dx, 0, 1)); pts[i * 2 + 1] = round3(clampNum(pts[i * 2 + 1] + dy, -1, 2)); render(true);
      });
    });
    nums.forEach((n) => n.addEventListener('input', () => {
      const i = Number(n.dataset.i); let v = Number(n.value); if (!Number.isFinite(v)) return;
      if (i % 2 === 0) v = clampNum(v, 0, 1); pts[i] = round3(v); render(true);
    }));
    const resetBtn = host.querySelector('.kt-bz-reset');
    const copyBtn = host.querySelector('.kt-bz-copy');
    const say = (msg) => { if (status) { status.textContent = msg; clearTimeout(status.__t); status.__t = setTimeout(() => { status.textContent = ''; }, 1600); } };
    resetBtn?.addEventListener('click', () => { pts = initialPts.slice(); render(true); say(ui('easeResetDone')); });
    copyBtn?.addEventListener('click', async () => {
      const css = fmtBezier(pts);
      try { await navigator.clipboard.writeText(css); } catch (_e) { const t = document.createElement('textarea'); t.value = css; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (_err) { /* ignore */ } t.remove(); }
      say(`${ui('easeCopied')}: ${css}`);
    });
    const saveBtn = host.querySelector('.kt-bz-save');
    saveBtn?.addEventListener('click', () => {
      let name = ''; try { name = (window.prompt(ui('easeSavePrompt'), 'my-ease') || '').trim(); } catch (_e) { name = `ease-${Date.now().toString(36)}`; }
      if (!name) return;
      saveEasing(name, fmtBezier(pts));
      // Reflect the new token in every open easing select immediately.
      document.querySelectorAll('.kt-ease-select').forEach((sel) => {
        if (sel.querySelector(`optgroup[data-saved-easings] option[value="${fmtBezier(pts)}"]`)) return;
        let og = sel.querySelector('optgroup[data-saved-easings]');
        if (!og) {
          og = document.createElement('optgroup');
          og.dataset.savedEasings = 'true';
          localize(og, 'easeSavedGroup', 'label');
          sel.insertBefore(og, sel.firstChild);
        }
        const o = document.createElement('option'); o.value = fmtBezier(pts); o.textContent = name; og.appendChild(o);
      });
      say(`${ui('easeSaved')}: ${name}`);
    });
    render(false);
    return { set(value) { const b = easingBezier(value); if (b) { pts = b.slice(); render(false); } }, destroy() { previewAnim?.cancel(); } };
  };
  const clampNum = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
  // ── Role-based option grouping (audit B-4 / J-10) ──────────────────────────
  // Every option key is bucketed into one of these groups so the core knobs read
  // clearly (Motion/Look first) instead of one flat, equally-weighted list.
  // Modules whose contract (kineto.features.json) exposes an ease/easing option
  // but whose FIELDS list didn't surface it. We inject an easing control for
  // each so every ease-capable module is tunable from the panel. The key must
  // match the real publicOption name ('easing' for overflowText/ripple, else
  // 'ease') or the phantom-field guard in the options test would trip.
  const EASE_FIELDS = {
    blurText: 'ease', cardGlow: 'ease', counter: 'ease', cursor: 'ease', fullpage: 'ease',
    lazy: 'ease', magnetic: 'ease', mouseParallax: 'ease', reveal: 'ease', textReveal: 'ease',
    textSplit: 'ease', textTransition: 'ease', tilt: 'ease', coverReveal: 'ease', gesture: 'ease',
    flip: 'ease', stickyStack: 'ease', overflowText: 'easing', ripple: 'easing',
    pageReveal: 'ease', pageTransition: 'ease'
  };
  const GROUP_ORDER = ['Motion', 'Trigger', 'Look', 'Behavior', 'Advanced'];
  const GROUP_I18N_KEYS = {
    Motion: 'groupMotion',
    Trigger: 'groupTrigger',
    Look: 'groupLook',
    Behavior: 'groupBehavior',
    Advanced: 'groupAdvanced'
  };
  const G_MOTION = new Set(['duration', 'delay', 'stagger', 'ease', 'easing', 'speed', 'smoothing', 'spring', 'stiffness', 'damping', 'mass', 'velocity', 'scrub', 'rollDuration', 'popDuration', 'exitDuration', 'minDuration', 'fadeDuration', 'dissolveDuration', 'flipDuration', 'pageDuration', 'pageOverlap', 'itemDuration', 'holdDuration', 'clickImageDuration', 'clickSpriteDuration', 'sparkleDuration', 'rotateDuration', 'cycleDuration', 'manualDuration', 'lightboxDuration', 'maskDuration', 'swapEase', 'maskEase', 'snakeScaleEase', 'completeHold', 'endPause', 'pause', 'pauseAfter', 'typeSpeed', 'eraseSpeed', 'revealRate', 'scrollAcceleration', 'decay', 'elastic', 'response', 'velocityDivisor', 'transitionStartOffset', 'orbitSpeed', 'sparkleThrottle', 'shimSpeed', 'skeletonSpeed', 'noiseFps', 'renderFps', 'sampleFps', 'stepDuration']);
  const G_TRIGGER = new Set(['trigger', 'start', 'end', 'threshold', 'rootMargin', 'once', 'loop', 'autoplay', 'pauseOnHover', 'activation', 'openDelay', 'closeDelay', 'wheel', 'drag', 'keyboard', 'touch', 'reverseOnScrollUp', 'initial', 'snap', 'pin', 'repeat', 'restartDelay', 'since', 'until', 'hold', 'flickerLoop', 'preloadRadius', 'rangeStart', 'rangeEnd', 'scrollLength', 'vhPerFrame', 'force', 'watch', 'reset', 'dismissible', 'closeOnBackdrop', 'clickToTop']);
  const G_LOOK = /(colou?r|blur|radius|opacity|shadow|scale|gradient|glare|halo|spread|intensity|surface|border|fill|width|height|thickness|stroke|size|perspective|skew|rotate|tile|inset|brightness|saturation|feather|noise|blend|font|glow|reflection|luminous|edge|shape|skeleton|frame|track|seam|caret|dot|trail|crosshair|sparkle|bare|background|shim)/i;
  const G_ADV = /^(on[A-Z]|.*(selector|src|srcset|source|template|classname|api)$)|^(className|selector|src|srcset|urls|frames|urlPrefix|extension|crossOrigin|maxDpr|renderUI|uiTemplate|container|executeScripts|cache|linkSelector|animationSelector|target|attach|property|timeline|cssAnimation|fetch|fetchOptions|promise|promiseStart|promiseCeiling|url|html|compose|hangul|expectedResources|resources|resourceSelector|progressSource|manual)$/;
  const groupOf = (key) => {
    if (G_MOTION.has(key)) return 'Motion';
    if (G_TRIGGER.has(key)) return 'Trigger';
    if (G_ADV.test(key)) return 'Advanced';
    if (G_LOOK.test(key)) return 'Look';
    return 'Behavior';
  };
  // CSS custom properties each module exposes for style-level overrides (audit
  // B / J-10 "CSS vars 탭"). Drives a copyable CSS snippet in the code preview.
  const CSS_VARS = {
    tooltip: [['--kt-tooltip-bg', '#101318'], ['--kt-tooltip-fg', '#fff'], ['--kt-tooltip-radius', '8px'], ['--kt-tooltip-pad', '7px 10px'], ['--kt-tooltip-size', '12.5px'], ['--kt-tooltip-max', '240px']],
    toast: [['--kt-toast-bg', '#15171c'], ['--kt-toast-fg', '#f2f3f7'], ['--kt-toast-accent', '#ff5b1c'], ['--kt-toast-radius', '12px'], ['--kt-toast-gap', '10px'], ['--kt-toast-bar', '#ff5b1c'], ['--kt-toast-bar-size', '3px']],
    bottomSheet: [['--kt-sheet-bg', '#15171c'], ['--kt-sheet-fg', '#f2f3f7'], ['--kt-sheet-radius', '18px'], ['--kt-sheet-width', 'min(560px,100%)'], ['--kt-sheet-max', '86vh'], ['--kt-sheet-backdrop-bg', '#000'], ['--kt-sheet-backdrop-opacity', '.5'], ['--kt-sheet-backdrop-blur', '0px']],
    accordion: [['--kt-accordion-arrow', 'currentColor'], ['--kt-accordion-arrow-size', '.9em'], ['--kt-accordion-arrow-weight', '2px'], ['--kt-accordion-arrow-duration', '.35s']],
    megaMenu: [['--kt-menu-accent', '#ff5b1c'], ['--kt-menu-hover-bg', 'rgba(255,255,255,.06)'], ['--kt-menu-hover-color', '#fff'], ['--kt-menu-hover-duration', '.15s']],
    radial: [['--kt-radial-accent', '#ff5b1c'], ['--kt-radial-btn-bg', 'var(--panel)'], ['--kt-radial-btn-fg', 'currentColor'], ['--kt-radial-btn-border', 'var(--line)']],
    slider: [['--kt-slider-ui-color', '#fff'], ['--kt-slider-ui-bg', 'rgba(10,14,22,.5)'], ['--kt-slider-progress-color', 'currentColor'], ['--kt-slider-progress-track', 'rgba(255,255,255,.24)'], ['--kt-slider-progress-size', '44px'], ['--kt-slider-progress-width', '2.5px'], ['--kt-slider-progress-inset', '14px'], ['--kt-slider-dissolve-noise', '.2'], ['--kt-slider-dissolve-blend', 'overlay']],
    tabs: [['--kt-tab-accent', '#ff5b1c'], ['--kt-tab-indicator-size', '2px'], ['--kt-seg-bg', '#1c1f26'], ['--kt-seg-active', '#15171c'], ['--kt-seg-radius', '12px'], ['--kt-seg-pill-radius', '9px']],
    switch: [['--kt-switch-on', '#ff5b1c']],
    scrollShadows: [['--kt-scroll-shadow', 'rgba(0,0,0,.24)'], ['--kt-scroll-shadow-cover', 'Canvas'], ['--kt-scroll-shadow-size', '44px'], ['--kt-scroll-shadow-shade', '15px']],
    cardGlow: [['--kt-card-glow-shadow', '0 12px 32px -10px rgba(17,24,39,.24)'], ['--kt-card-glow-shadow-color', '#111827'], ['--kt-card-glow-shadow-opacity', '24%'], ['--kt-card-glow-shadow-x', '0px'], ['--kt-card-glow-shadow-y', '12px'], ['--kt-card-glow-shadow-blur', '32px'], ['--kt-card-glow-shadow-spread', '-10px']],
    tilt: [['--kt-tilt-shadow', '0 14px 34px -8px rgba(17,24,39,.28)'], ['--kt-tilt-shadow-color', '#111827'], ['--kt-tilt-shadow-opacity', '28%'], ['--kt-tilt-shadow-x', '0px'], ['--kt-tilt-shadow-y', '14px'], ['--kt-tilt-shadow-blur', '34px'], ['--kt-tilt-shadow-spread', '-8px']],
    loader: [['--kt-loader-color', '#ff5b1c'], ['--kt-loader-track-color', 'rgba(127,127,127,.18)'], ['--kt-loader-radius', '999px']],
    loadingIndicator: [['--kt-loading-color', '#ff5b1c'], ['--kt-loading-track-color', 'rgba(127,127,127,.18)'], ['--kt-loading-highlight-color', '#fff'], ['--kt-loading-base-color', 'rgba(127,127,127,.32)'], ['--kt-loading-glow-color', '#ff8a5c'], ['--kt-loading-glow-size', '16px'], ['--kt-loading-motion-duration', '1.1s'], ['--kt-loading-size', '48px'], ['--kt-loading-stroke', '4px'], ['--kt-loading-bar-width', '240px'], ['--kt-loading-bar-height', '5px'], ['--kt-loading-dot-size', '8px'], ['--kt-loading-dot-gap', '6px'], ['--kt-loading-text-size', '1rem']],
  };
  const cssVarsSnippet = (descriptors) => {
    const blocks = descriptors.map((d) => {
      const vars = CSS_VARS[d.module]; if (!vars) return null;
      const sel = `[${MODULE_ATTRIBUTES[d.module] || ('data-kt-' + d.module.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()))}]`;
      return `${sel} {\n${vars.map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}`;
    }).filter(Boolean);
    return blocks.length ? blocks.join('\n\n') : '/* 이 모듈은 JS 옵션으로 커스터마이즈합니다 — 노출된 CSS 변수가 없습니다. */';
  };
  // One-line module descriptions shown atop each options panel.
  const MODULE_DESC = {
    counter: '숫자 카운트업·플립·시계·카운트다운.', loader: '실제 진행률에 연동되는 전체 화면 로더.', loadingIndicator: '콘텐츠 안에 놓는 스피너·바·텍스트·CLI 인디케이터.', lazy: '이미지 로딩 연출(스켈레톤·픽셀·프린트·디졸브).',
    overflowText: '넘치는 텍스트/목록 아이템 처리(루프·페이지·롤링·씬전환).', cardGlow: '포인터 스포트라이트·표면 반사·발광 외곽선·그림자.', tilt: '3D 기울기·글레어·포인터 추종 그림자.',
    reveal: '스크롤 진입 시 등장(페이드·슬라이드·마스크·시계).', textSplit: '글자/단어 단위 분할 모션.', textReveal: '글자 단위 등장(스트림·디코드·한글).',
    textTransition: '문구 교체 전환(방향·랜덤 옵션).', typewriter: '타이핑 효과(한글 조합).', blurText: '글자별 블러 리빌.', textFill: '스크롤에 따라 텍스트 채우기.',
    glitch: 'RGB 분리·픽셀 시프트·데이터모시.', marquee: '무한 흐르는 마퀴(엣지 페이드 옵션).', slider: '슬라이드·페이드·디졸브·와이프·3D 전환.', lightbox: '전체화면 그룹 뷰어(줌·미니맵·필름스트립).',
    ambientMedia: '미디어에서 샘플링한 주변광.', cursor: '커스텀 커서 프리셋 11종.', magnetic: '버튼 자석 반응.', ripple: '클릭 리플.', mouseParallax: '포인터/자이로 패럴럭스.',
    parallax: '스크롤 패럴럭스(요소 이동).', scrollVelocity: '스크롤 속도·방향 반응.', scrollSequence: '이미지 시퀀스 스크럽.', progress: '읽기 진행률 바/링.', fullpage: '풀페이지 섹션 넘기기.',
    stickyStack: '쌓이는 스티키 스택.', cssScroll: 'CSS scroll/view 타임라인 연동.', scrollShadows: '스크롤 가장자리 그림자/마스크 페이드.', stickyHeader: '스크롤 시 축소·그림자 헤더.', horizontalScroll: '섹션 고정 + 가로 스크롤.',
    accordion: '접근성 details 아코디언.', megaMenu: 'GNB 드롭다운·메가메뉴.', tabs: 'WAI-ARIA 탭·세그먼트 컨트롤.', bottomSheet: '드래그 바텀시트.', tooltip: '자동 배치 툴팁.', switch: '폼 연동 토글 스위치.',
    radial: '원형(휠) 캐러셀.', coverReveal: '컬러 커버가 걷히는 리빌.', gesture: 'hover/press 스프링 피드백.', drag: '관성·경계·키보드 드래그.', flip: 'FLIP 레이아웃 자동 이동.',
    confetti: '클릭/뷰 색종이 버스트.', hold: '길게 눌러 확정 게이지.', toast: '상태 알림 토스트.', pageReveal: '페이지 진입 오버레이.', pageTransition: '동일 출처 페이지 전환.', vibrate: '햅틱 진동 피드백.', brushReveal: '포인터 브러시 리빌/복권긁기.'
  };
  // Promote every `ease` / `easing` text field to the rich easing picker, and
  // every SINGLE-colour option to the shared colour control (visual picker +
  // lossless CSS value supporting HEX/RGB/RGBA/HSL/HSLA). Palettes (plural
  // `…colors` / comma lists) stay plain text because they contain many values.
  Object.values(FIELDS).forEach((defs) => {
    if (!Array.isArray(defs)) return;
    defs.forEach((def) => {
      if ((def[0] === 'ease' || def[0] === 'easing') && (def[2] === 'text' || def[2] == null)) { def[2] = 'easing'; return; }
      const key = def[0];
      const isSingleColor = /colou?r/i.test(key) && !/colou?rs$/i.test(key);
      if (isSingleColor && (def[2] === 'text' || def[2] == null)) def[2] = 'color';
    });
  });

  const state = { snapshots: new WeakMap(), timers: new WeakMap() };
  const dash = (value) => value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  const camel = (value) => value.replace(/-([a-z])/g, (_m, c) => c.toUpperCase());
  const labelize = (value) => value.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());
  const parse = (value) => {
    if (value === '' || value === true) return true;
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value !== null && value !== '' && Number.isFinite(Number(value))) return Number(value);
    try { return JSON.parse(value); } catch (_error) { return value; }
  };
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const normalizeColor = (value, fallback = '#ff5b1c') => {
    const text = String(value || '').trim();
    const hex = text.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i)?.[1];
    if (hex) {
      const full = hex.length === 3 ? hex.split('').map((part) => part + part).join('') : hex.slice(0, 6);
      return `#${full}`;
    }
    const rgb = text.match(/rgba?\(\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)/i);
    if (!rgb) return fallback;
    return `#${rgb.slice(1,4).map((channel) => Math.round(Math.max(0, Math.min(255, Number(channel)))).toString(16).padStart(2,'0')).join('')}`;
  };
  const validCssColor = (value) => {
    const text = String(value || '').trim();
    if (!text) return false;
    if (window.CSS?.supports) return CSS.supports('color', text);
    return /^#[\da-f]{3,8}$/i.test(text) || /^(?:rgb|hsl)a?\([^)]*\)$/i.test(text);
  };

  // The text field is the source of truth because native colour inputs cannot
  // preserve alpha. The swatch remains a quick visual picker while HEX, RGB,
  // RGBA, HSL, HSLA and CSS variables survive unchanged in generated code.
  const buildColorControl = (input, apply) => {
    const wrap = document.createElement('div'); wrap.className = 'kt-color-row';
    const picker = document.createElement('input');
    picker.type = 'color';
    picker.className = 'kt-color-picker';
    picker.value = normalizeColor(input.value);
    localize(picker, 'chooseColor', 'aria-label');
    input.classList.add('kt-color-value');
    localize(input, 'colorValue', 'aria-label');
    input.spellcheck = false;
    picker.addEventListener('input', () => {
      input.value = picker.value;
      input.removeAttribute('aria-invalid');
      apply();
    });
    input.addEventListener('input', () => {
      const value = input.value.trim();
      const valid = validCssColor(value);
      input.setAttribute('aria-invalid', String(!valid));
      if (valid) picker.value = normalizeColor(value, picker.value);
    });
    wrap.append(picker, input);
    return wrap;
  };

  function capture(root = document) {
    Object.values(MODULE_ATTRIBUTES).forEach((attribute) => {
      root.querySelectorAll(`[${attribute}]`).forEach((element) => {
        if (!state.snapshots.has(element)) state.snapshots.set(element, element.cloneNode(true));
      });
    });
  }

  function descriptorOptions(descriptor) {
    if (descriptor.kind === 'loader' || descriptor.kind === 'pageReveal' || descriptor.kind === 'pageTransition') return { ...descriptor.options };
    const target = descriptor.targets[0];
    const activation = MODULE_ATTRIBUTES[descriptor.module];
    const options = {};
    if (activation && target.hasAttribute(activation)) {
      const value = target.getAttribute(activation);
      if (value) options.preset = parse(value);
    }
    const allowed = new Set(PUBLIC_OPTIONS[descriptor.module] || []);
    Array.from(target.attributes).forEach((attribute) => {
      if (!attribute.name.startsWith('data-kt-') || attribute.name === activation) return;
      const key = camel(attribute.name.slice(8));
      if (allowed.size && !allowed.has(key)) return;
      options[key] = parse(attribute.value);
    });
        // Drop options the current preset doesn't support (WHEN-hidden) so an
    // irrelevant attribute can never break the module.
    const rules = WHEN[descriptor.module];
    if (rules) {
      Object.keys(options).forEach((key) => {
        const rule = rules[key];
        if (rule) { try { if (!rule(options)) delete options[key]; } catch (_e) { /* keep */ } }
      });
    }
    return options;
  }

  function optionValue(descriptor, key) {
    const options = (descriptor.kind === 'loader' || descriptor.kind === 'pageReveal' || descriptor.kind === 'pageTransition') ? descriptor.options : descriptorOptions(descriptor);
    if (descriptor.kind === 'loader' && key === 'preset') return options.type;
    if (Object.prototype.hasOwnProperty.call(options, key)) return options[key];
    return DEFAULTS[descriptor.module]?.[key] ?? (FIELDS[descriptor.module]?.find((field) => field[0] === key)?.[2] === 'checkbox' ? false : '');
  }

  function discover(host) {
    const candidates = [host, ...host.querySelectorAll('*')];
    const found = [];
    Object.entries(MODULE_ATTRIBUTES).forEach(([module, attribute]) => {
      const targets = candidates.filter((element) => element.hasAttribute?.(attribute) && !activationIsOwnedOption(element, module));
      if (targets.length) found.push({ module, targets, kind: 'element' });
    });
    return found;
  }

  function restoreElement(element) {
    const snapshot = state.snapshots.get(element);
    if (!snapshot) return;
    Array.from(element.attributes).forEach((attribute) => element.removeAttribute(attribute.name));
    Array.from(snapshot.attributes).forEach((attribute) => element.setAttribute(attribute.name, attribute.value));
    if (!['IMG','INPUT','VIDEO','IFRAME','CANVAS'].includes(element.tagName)) element.innerHTML = snapshot.innerHTML;
  }

  function setOption(descriptor, key, value, type) {
    // Special "virtual" descriptors (loader / pageReveal / pageTransition) have
    // no target element — their options live on descriptor.options. Write there
    // so text/easing/custom controls (e.g. the bezier editor) actually apply.
    if (descriptor.kind === 'loader' || descriptor.kind === 'pageReveal' || descriptor.kind === 'pageTransition') {
      const k = (descriptor.kind === 'loader' && key === 'preset') ? 'type' : key;
      descriptor.options[k] = type === 'checkbox' ? Boolean(value) : (type === 'number' || type === 'range') ? Number(value) : value;
      if (descriptor.kind === 'pageTransition') window.KinetoPlayground.syncPageTransitionPreview?.();
      return;
    }
    const activation = MODULE_ATTRIBUTES[descriptor.module];
    const attribute = key === 'preset' ? activation : `data-kt-${dash(key)}`;
    descriptor.targets.forEach((target) => {
      if (type === 'checkbox') target.setAttribute(attribute, value ? 'true' : 'false');
      else if (value === '' || value == null) target.removeAttribute(attribute);
      else target.setAttribute(attribute, String(value));
    });
  }

  function syncGroupLayout(groupsRoot) {
    if (!groupsRoot) return;
    if (groupsRoot.__ktLayoutFrame) cancelAnimationFrame(groupsRoot.__ktLayoutFrame);
    groupsRoot.__ktLayoutFrame = 0;
    const groupNodes = [...groupsRoot.querySelectorAll(':scope > .kt-playground__group')];
    groupsRoot.classList.remove('is-masonry');
    groupNodes.forEach((group) => {
      group.classList.remove('is-full-row');
      group.style.removeProperty('grid-column');
      group.style.removeProperty('grid-row');
    });
    const visibleGroups = groupNodes.filter((group) => (
      !group.hidden
      && !group.classList.contains('kt-search-hidden')
      && group.querySelector('.kt-playground__field:not([hidden]):not(.kt-search-hidden)')
    ));
    const expandedGroups = visibleGroups.filter((group) => !group.classList.contains('is-collapsed'));
    if (visibleGroups.length === 1) visibleGroups[0].classList.add('is-full-row');

    // Keep layout deterministic. The old measured masonry implementation wrote
    // pixel-derived grid rows while the drawer was resizing or crossfading.
    // A stale measurement then made accordions overlap or occupy half a row.
    // Native grid auto-flow is stable at every height and preserves DOM order.
    // One useful expanded group spans the row; an unpaired final group also
    // spans the row so an option category never leaves a blank half-column.
    if (expandedGroups.length === 1) {
      expandedGroups[0].classList.add('is-full-row');
      const collapsedGroups = visibleGroups.filter((group) => group.classList.contains('is-collapsed'));
      if (collapsedGroups.length % 2 === 1) collapsedGroups.at(-1)?.classList.add('is-full-row');
    } else if (visibleGroups.length % 2 === 1) {
      visibleGroups.at(-1)?.classList.add('is-full-row');
    }

    const body = groupsRoot.closest('.kt-playground__body');
    const drawer = drawerRoot();
    if (drawer.current === body) {
      groupsRoot.__ktLayoutFrame = requestAnimationFrame(() => {
        groupsRoot.__ktLayoutFrame = 0;
        if (body?.isConnected) drawer.fit(body);
      });
    }
  }

  function syncVisibility(host, descriptors) {
    const panel = host.querySelector(':scope > .kt-playground');
    const body = panel?.__mkBody || panel;
    if (!body) return;
    descriptors.forEach((descriptor) => {
      const currentOptions = descriptor.kind === 'loader'
        ? { preset: descriptor.options.type, ...descriptor.options }
        : (descriptor.kind === 'pageReveal' || descriptor.kind === 'pageTransition')
          ? { ...descriptor.options }
          : { ...(DEFAULTS[descriptor.module] || {}), ...descriptorOptions(descriptor) };
      body.querySelectorAll(`[data-module="${descriptor.module}"][data-key]`).forEach((field) => {
        const rule = WHEN[descriptor.module]?.[field.dataset.key];
        let show = true;
        try { show = !rule || rule(currentOptions); } catch (_e) { show = true; }
        field.hidden = !show;
      });
    });
    const groupsRoot = body.querySelector('.kt-playground__groups');
    if (groupsRoot) {
      const groupNodes = [...groupsRoot.querySelectorAll(':scope > .kt-playground__group')];
      groupNodes.forEach((group) => {
        group.hidden = !group.querySelector('.kt-playground__field:not([hidden])');
      });
      syncGroupLayout(groupsRoot);
      requestAnimationFrame(() => {
        const drawer = drawerRoot();
        if (drawer.current === body) drawer.fit(body);
      });
    }
  }

  function runPageRevealDescriptor(descriptor) {
    const MK = window.Kineto;
    MK.destroyModule(document.body, 'pageReveal');
    MK.pageReveal(document.body, { ...descriptor.options });
  }

  // Container modules that wrap/transform their subtree must be (re)built
  // AFTER the inner-element modules on the same card, or tearing down the
  // inner one removes the container's captured nodes (e.g. ambientMedia over
  // a lazy image). Lower weight = created first.
  const CREATE_ORDER = { lazy: 0, lightbox: 0, brushReveal: 1, ambientMedia: 3, stickyStack: 3, slider: 3, fullpage: 3, marquee: 3 };
  function rebuildModule(descriptor) {
    // Rebuild a single element module in place — inner modules on the same card
    // stay untouched, so a stacked container (ambientMedia over a lazy image)
    // never has its subtree torn out from under it.
    const MK = window.Kineto;
    descriptor.targets.forEach((target) => {
      // Prefer a live in-place update when the module supports it — no
      // destroy/recreate churn on a colour or label tweak (audit B-5). Only the
      // modules without update() fall through to the careful recreate below.
      const existing = MK.getInstance?.(target, descriptor.module);
      if (existing && typeof existing.update === 'function' && MK.updateModule) {
        if (MK.updateModule(target, descriptor.module, descriptorOptions({ ...descriptor, targets: [target] }))) return;
      }
      MK.destroyModule(target, descriptor.module);
      const snapshot = state.snapshots.get(target);
      // Restore the pristine DOM (keeping the current data-kt-* option values)
      // before recreating, so DOM-mutating modules — coverReveal line-split,
      // radial item moves, accordion/tabs/megaMenu wrapping — never rebuild on
      // top of their own previous output (which left demos broken until Reset).
      // Skip when the target hosts ANOTHER module inside it (stacked containers
      // like ambientMedia over a lazy image), where a restore would wipe it.
      const activation = MODULE_ATTRIBUTES[descriptor.module];
      const hasInnerModule = Object.values(MODULE_ATTRIBUTES).some((attr) => attr !== activation && target.querySelector && target.querySelector(`[${attr}]`));
      // A few demos (notably Card Glow + Tilt) use the card itself as the
      // effect target. Their playground trigger is appended after the pristine
      // snapshot was captured, so restoring `innerHTML` here would delete the
      // settings UI on the first option change. Module destroy() is already
      // responsible for removing its generated nodes; never clone-restore over
      // a live control host.
      const ownsPlayground = Boolean(target.querySelector?.(':scope > .kt-playground'));
      // coverReveal.destroy() already unwraps and restores the live target.
      // Replacing its inner image from a clone here made an option change wait
      // for a fresh image load and left the staggered gallery apparently blank.
      if (snapshot && !hasInnerModule && !ownsPlayground && descriptor.module !== 'coverReveal') {
        const currentKt = Array.from(target.attributes).filter((a) => a.name.startsWith('data-kt-')).map((a) => [a.name, a.value]);
        restoreElement(target);
        Array.from(target.attributes).filter((a) => a.name.startsWith('data-kt-')).forEach((a) => target.removeAttribute(a.name));
        currentKt.forEach(([n, v]) => target.setAttribute(n, v));
      }
      // Last-known-good rollback (audit B-6): the current data-kt-* attributes ARE
      // the option object AND drive the code preview, so snapshotting them lets us
      // atomically revert options + controls + code + instance if a bad
      // value/combination makes create() throw — instead of leaving a broken demo.
      const ktAttrs = () => Array.from(target.attributes).filter((a) => a.name.startsWith('data-kt-')).map((a) => [a.name, a.value]);
      const applyKtAttrs = (pairs) => { ktAttrs().forEach(([n]) => target.removeAttribute(n)); pairs.forEach(([n, v]) => target.setAttribute(n, v)); };
      try {
        MK.create(descriptor.module, target, descriptorOptions({ ...descriptor, targets: [target] }));
        target.__ktLastGood = ktAttrs(); // commit: this state is known-good
      } catch (error) {
        // Roll everything back to the last good state and rebuild from it:
        // pristine DOM snapshot first, then last-good option attributes on top.
        if (snapshot && !ownsPlayground) restoreElement(target);
        const good = target.__ktLastGood;
        if (good) applyKtAttrs(good);
        try { MK.create(descriptor.module, target, descriptorOptions({ ...descriptor, targets: [target] })); } catch (_again) { /* stay on good */ }
        // Reflect the reverted attributes back into the descriptor + controls +
        // code preview so the UI never shows values that aren't actually applied.
        try {
          const host = target.closest('.card, .kt-playground-host') || target.parentElement;
          const panel = host?.querySelector?.(':scope > .kt-playground') || document.querySelector('.kt-playground[open]');
          const s = (panel?.__mkBody || panel)?.querySelector?.('.kt-playground__status');
          if (s) { s.textContent = `적용 실패 — 이전 값으로 되돌렸습니다 (${error.message || '유효하지 않은 값'})`; s.dataset.error = '1'; }
        } catch (_ui) { /* status is best-effort */ }
        window.ktToast?.('유효하지 않은 값이라 이전 설정으로 되돌렸습니다');
      }
    });
    if (descriptor.module === 'horizontalScroll') {
      const target = descriptor.targets[0];
      const unit = target?.closest?.('.hscroll-demo-unit,[data-demo-id]');
      const stage = target?.closest?.('.demo-stage');
      const controlHost = unit?.querySelector?.(':scope > .kt-playground-host')
        || (stage?.nextElementSibling?.classList?.contains('kt-playground-host') ? stage.nextElementSibling : null);
      ensureHorizontalSettings(controlHost, [descriptor]);
    }
  }

  function apply(host, descriptors, status, message = '적용됨') {
    const MK = window.Kineto;
    descriptors.forEach((descriptor) => {
      if (descriptor.kind === 'pageReveal') runPageRevealDescriptor(descriptor);
    });
    const live = descriptors.filter((d) => d.kind !== 'pageReveal' && d.kind !== 'loader' && d.kind !== 'pageTransition');
    // Tear all down, then recreate inner modules before their containers.
    live.forEach((d) => d.targets.forEach((t) => MK.destroyModule(t, d.module)));
    const ordered = live.slice().sort((a, b) => (CREATE_ORDER[a.module] ?? 2) - (CREATE_ORDER[b.module] ?? 2));
    let failure = null;
    ordered.forEach((descriptor) => {
      descriptor.targets.forEach((target) => {
        const ktAttrs = () => Array.from(target.attributes).filter((a) => a.name.startsWith('data-kt-')).map((a) => [a.name, a.value]);
        const applyKtAttrs = (pairs) => { ktAttrs().forEach(([n]) => target.removeAttribute(n)); pairs.forEach(([n, v]) => target.setAttribute(n, v)); };
        try {
          MK.create(descriptor.module, target, descriptorOptions({ ...descriptor, targets: [target] }));
          target.__ktLastGood = ktAttrs();
        } catch (error) {
          // Atomic rollback to the last-known-good options + instance (audit B-6):
          // reset the DOM to its pristine snapshot FIRST, then re-apply the last
          // good option attributes on top so they win over the snapshot's.
          const snapshot = state.snapshots.get(target);
          const ownsPlayground = Boolean(target.querySelector?.(':scope > .kt-playground'));
          if (snapshot && !ownsPlayground) restoreElement(target);
          if (target.__ktLastGood) applyKtAttrs(target.__ktLastGood);
          try { MK.create(descriptor.module, target, descriptorOptions({ ...descriptor, targets: [target] })); } catch (_again) { /* stay good */ }
          failure = error;
        }
      });
    });
    MK.refresh?.();
    ensureHorizontalSettings(host, descriptors);
    updateCode(host, descriptors);
    // Page Transition settings drive the in-place preview (colour/duration/ease).
    if (descriptors.some((d) => d.kind === 'pageTransition')) window.KinetoPlayground.syncPageTransitionPreview?.();
    if (failure) { status.textContent = `적용 실패 — 이전 값으로 되돌렸습니다 (${failure.message || '유효하지 않은 값'})`; status.dataset.error = '1'; }
    else { status.textContent = `${message} · 활성 인스턴스 ${MK.instanceCount}개`; delete status.dataset.error; }
  }

  function replay(host, descriptors, status) {
    const MK = window.Kineto;
    const loader = descriptors.find((item) => item.kind === 'loader');
    if (loader) {
      runLoader(loader, status);
      return;
    }
    const pageRevealDescriptor = descriptors.find((item) => item.kind === 'pageReveal');
    if (pageRevealDescriptor) {
      runPageRevealDescriptor(pageRevealDescriptor);
      status.textContent = `Replayed ${pageRevealDescriptor.options.effect}`;
      return;
    }
    descriptors.forEach((descriptor) => descriptor.targets.forEach((target) => {
      // No options → core uses the instance's own replay() (in-place, e.g. the
      // classOnly reveal that removes+re-adds its class to retrigger the CSS
      // transition). The module already holds the current options from the last
      // live edit, so recreating with options here would only break in-place
      // replays like Class Hook. Falls back to recreate when no replay() exists.
      const inst = MK.replay(target, descriptor.module);
      const one = Array.isArray(inst) ? inst[0] : inst;
      if (one && typeof one.fire === 'function') one.fire();
    }));
    MK.refresh?.();
    status.textContent = `다시 재생됨 · 활성 인스턴스 ${MK.instanceCount}개`;
  }

  function reset(host, descriptors) {
    const MK = window.Kineto;
    clearTimeout(state.timers.get(host));
    state.timers.delete(host);
    const elementDescriptors = descriptors.filter((descriptor) => descriptor.kind !== 'loader');
    const targets = [...new Set(elementDescriptors.flatMap((descriptor) => descriptor.targets))];

    descriptors.filter((descriptor) => descriptor.kind === 'loader').forEach((descriptor) => {
      Object.keys(descriptor.options).forEach((key) => delete descriptor.options[key]);
      Object.assign(descriptor.options, descriptor.initialOptions);
    });
    elementDescriptors.forEach((descriptor) => descriptor.targets.forEach((target) => MK.destroyModule(target, descriptor.module)));
    targets.forEach(restoreElement);
    elementDescriptors.forEach((descriptor) => descriptor.targets.forEach((target) => {
      MK.create(descriptor.module, target, descriptorOptions({ ...descriptor, targets: [target] }));
    }));

    rebuildPanel(host, descriptors, 'Reset to demo defaults');
    ensureHorizontalSettings(host, descriptors);
    MK.refresh?.();
  }

  function runLoader(descriptor, status) {
    // Block re-entry while a loader is already on screen — a rapid double/triple
    // click otherwise stacks multiple overlays and instances.
    if (document.querySelector('.kt-demo-loader-overlay')) return;
    const options = { ...descriptor.options };
    const overlay = document.createElement('div');
    overlay.className = 'kt-demo-loader-overlay';
    overlay.dataset.loaderType = options.type || 'slot';
    document.body.appendChild(overlay);
    let instance;
    // Hide the page scrollbar while the loader runs (requested) and restore it on
    // finish. Safe now that the loader uses a reference-counted scroll lock and
    // releases it early in exit() — the overlay covers the viewport meanwhile, and
    // the sticky side-nav is back before the overlay wipes away.
    instance = window.Kineto.loader(overlay, { ...options, hideScrollbar: true, onComplete: () => { instance?.destroy(); overlay.remove(); } });
    status.textContent = `Running ${options.type || 'slot'} loader`;
  }

  function currentSource(descriptor) {
    if (descriptor.kind === 'pageReveal') {
      const options = JSON.stringify(descriptor.options, null, 2);
      return {
        html: `<button id="reveal-page">Reveal</button>`,
        js: `// 화면 전환 커버 — 원하는 시점에 코드로 실행합니다.\nKineto.pageReveal(document.body, ${options});`
      };
    }
    if (descriptor.kind === 'loader') {
      const options = JSON.stringify(descriptor.options, null, 2);
      return {
        html: `<button id="show-loader">Run loader</button>`,
        js: `const overlay = document.createElement('div');\noverlay.className = 'loader-overlay';\ndocument.body.appendChild(overlay);\n\nKineto.loader(overlay, ${options});`
      };
    }
    if (descriptor.kind === 'pageTransition') {
      const options = JSON.stringify(descriptor.options, null, 2);
      return {
        html: `<!-- 같은 출처 링크는 자동으로 오버레이 전환됩니다. -->\n<a href="/about">About</a>\n<a href="/contact" data-kt-no-transition>Contact (전환 없이)</a>\n\n<!-- 전환 룩은 CSS로 정의합니다 -->\n<style>\n  [data-kt-transitioning] main { transition: opacity .4s ease; }\n  [data-kt-transitioning].kt-pt-out main { opacity: 0; }\n</style>`,
        js: `// 페이지 전체에 한 번만 실행 — 이후 같은 출처 링크 클릭이\n// 전체 새로고침 없이 오버레이 전환으로 처리됩니다.\nKineto.pageTransition(${options});`
      };
    }
    const html = descriptor.targets.map((target) => {
      const clean = state.snapshots.get(target)?.cloneNode(true) || target.cloneNode(true);
      const activation = MODULE_ATTRIBUTES[descriptor.module];
      Array.from(target.attributes).filter((attribute) => attribute.name.startsWith('data-kt-') && attribute.name !== 'data-kt-note').forEach((attribute) => clean.setAttribute(attribute.name, attribute.value));
      if (activation && target.hasAttribute(activation)) clean.setAttribute(activation, target.getAttribute(activation));
      return prettyMarkup(clean.outerHTML);
    }).join('\n');
    const options = descriptorOptions(descriptor);
    const target = descriptor.targets[0];
    const selector = target?.id
      ? `#${target.id}`
      : (target?.classList?.length ? `.${target.classList[0]}` : `[${MODULE_ATTRIBUTES[descriptor.module]}]`);
    const js = `// data-kt-* 속성 없이 JS만으로도 동일하게 적용됩니다.\n// 셀렉터 문자열(#id / .class)이나 요소를 그대로 전달하세요.\nconst instance = Kineto.${descriptor.module}('${selector}', ${JSON.stringify(options, null, 2)});\n// 같은 API: Kineto.${descriptor.module}(document.querySelector('${selector}'), options)`;
    return { html, js };
  }

  function prettyMarkup(markup) {
    const template = document.createElement('template');
    template.innerHTML = String(markup || '').trim();
    const voidTags = new Set(['AREA','BASE','BR','COL','EMBED','HR','IMG','INPUT','LINK','META','PARAM','SOURCE','TRACK','WBR']);
    const render = (node, depth = 0) => {
      const indent = '  '.repeat(depth);
      if (node.nodeType === 8) return `${indent}<!--${node.data.trim()}-->`;
      if (node.nodeType === 3) {
        const text = node.textContent.replace(/\s+/g, ' ').trim();
        return text ? `${indent}${text}` : '';
      }
      if (node.nodeType !== 1) return '';
      const tag = node.tagName.toLowerCase();
      const attrs = Array.from(node.attributes).map((attr) => ` ${attr.name}="${attr.value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`).join('');
      const open = `<${tag}${attrs}>`;
      if (voidTags.has(node.tagName)) return `${indent}<${tag}${attrs}>`;
      const children = Array.from(node.childNodes).filter((child) => child.nodeType !== 3 || child.textContent.trim());
      if (!children.length) return `${indent}${open}</${tag}>`;
      if (children.length === 1 && children[0].nodeType === 3 && children[0].textContent.trim().length < 72) {
        return `${indent}${open}${children[0].textContent.replace(/\s+/g, ' ').trim()}</${tag}>`;
      }
      return `${indent}${open}\n${children.map((child) => render(child, depth + 1)).filter(Boolean).join('\n')}\n${indent}</${tag}>`;
    };
    return Array.from(template.content.childNodes).map((node) => render(node, 0)).filter(Boolean).join('\n');
  }

  function combinedSource(descriptors) {
    const sources = descriptors.map(currentSource);
    return {
      html: [...new Set(sources.map((source) => source.html))].join('\n'),
      js: sources.map((source) => source.js).join('\n\n')
    };
  }

  function updateCode(host, descriptors) {
    const panel = host.matches('.kt-playground-host') ? host.querySelector('.kt-playground') : host.querySelector(':scope > .kt-playground');
    if (!panel) return;
    const source = combinedSource(descriptors);
    panel.dataset.htmlCode = source.html;
    panel.dataset.jsCode = source.js;
    panel.dataset.cssCode = cssVarsSnippet(descriptors);
    const active = (panel.__mkBody || panel).querySelector('.kt-playground__tab.is-active')?.dataset.codeTab || 'html';
    const code = (panel.__mkBody || panel).querySelector('.kt-playground__pre code');
    const text = active === 'css' ? panel.dataset.cssCode : active === 'js' ? source.js : source.html;
    if (!code) return;
    // Prism syntax highlighting + line numbers (loaded from CDN). Falls back to
    // plain escaped text if Prism isn't available (offline / blocked).
    const lang = active === 'css' ? 'css' : active === 'js' ? 'javascript' : 'markup';
    code.className = `language-${lang}`;
    code.textContent = text;
    if (window.Prism?.highlightElement) { try { window.Prism.highlightElement(code); } catch (_e) { code.innerHTML = escapeHtml(text); } }
  }

  function createField(descriptor, definition, host, descriptors, status) {
    const [key, label, type, a, b, c] = definition;
    // The field wrapper is a DIV, not a LABEL: a help <button> inside a <label>
    // makes clicking help toggle the associated control (audit B-8). The caption
    // is a real <label for=…> so the text still focuses the input; the help
    // button is its sibling, outside the label's activation area.
    const wrapper = document.createElement('div');
    wrapper.className = `kt-playground__field${type === 'checkbox' ? ' kt-playground__check' : ''}`;
    const fieldId = `ktf-${descriptor.module}-${key}-${Math.random().toString(36).slice(2, 6)}`;
    const capRow = document.createElement('div');
    capRow.className = 'kt-field-cap';
    const caption = document.createElement('label');
    caption.setAttribute('for', fieldId);
    caption.textContent = label;
    capRow.appendChild(caption);
    const tip = HELP[descriptor.module]?.[key];
    if (tip) {
      const help = document.createElement('button');
      help.type = 'button';
      help.className = 'kt-help';
      help.setAttribute('aria-label', `${label} 설명`);
      help.dataset.tip = tip;
      help.textContent = '?';
      capRow.append(help);
      // Reuse Kineto's fixed-position Tooltip module instead of inserting a
      // popover into the settings grid. Create it only on first use so lazily
      // rendered setting panels do not allocate hundreds of dormant instances.
      const ensureHelpTooltip = () => {
        if (help.__ktHelpTooltip) return help.__ktHelpTooltip;
        const created = window.Kineto?.tooltip?.(help, {
          content: help.dataset.tip,
          placement: 'top',
          trigger: 'hover',
          delay: 70,
          hideDelay: 50,
          offset: 9,
          effect: 'shift'
        });
        const instance = Array.isArray(created) ? created[0] : created;
        if (!instance) return null;
        help.__ktHelpTooltip = instance;
        status.__ktHelpTooltips ||= [];
        status.__ktHelpTooltips.push(instance);
        const tipId = (help.getAttribute('aria-describedby') || '').split(/\s+/).find((id) => id.startsWith('kt-tooltip-'));
        document.getElementById(tipId)?.classList.add('kt-playground-help');
        return instance;
      };
      help.addEventListener('pointerenter', () => ensureHelpTooltip()?.show?.());
      help.addEventListener('focus', () => ensureHelpTooltip()?.show?.());
      wrapper.dataset.tip = tip;
    }
    let input;
    let easingPreview = null;
    let easingCustom = null;
    let easingEditor = null; let bezierCtl = null;
    if (type === 'select') {
      input = document.createElement('select');
      a.forEach((choice) => {
        const option = document.createElement('option'); option.value = choice; option.textContent = choice || 'none'; input.appendChild(option);
      });
    } else if (type === 'easing') {
      input = document.createElement('select');
      input.className = 'kt-ease-select';
      const known = new Set();
      // User-saved custom curves (named tokens) come first so they're easy to
      // reuse across modules (audit C-2 / J-3 "이름을 붙여 저장").
      const saved = savedEasings();
      if (saved.length) {
        const og = document.createElement('optgroup');
        og.dataset.savedEasings = 'true';
        localize(og, 'easeSavedGroup', 'label');
        saved.forEach(([name, val]) => { known.add(val); const o = document.createElement('option'); o.value = val; o.textContent = name; og.appendChild(o); });
        input.appendChild(og);
      }
      EASING_GROUPS.forEach(([grp, items]) => {
        const og = document.createElement('optgroup'); og.label = grp;
        items.forEach(([name, val]) => { known.add(val); const o = document.createElement('option'); o.value = val; o.textContent = name; og.appendChild(o); });
        input.appendChild(og);
      });
      // Keep a module's own default (e.g. power3.out / cubic-bezier) selectable
      // even if it isn't one of the presets.
      const current = optionValue(descriptor, key);
      if (current && !known.has(String(current))) {
        const o = document.createElement('option'); o.value = current; o.textContent = `current · ${current}`; input.insertBefore(o, input.firstChild);
      }
      easingPreview = document.createElement('div');
      easingPreview.className = 'kt-ease-preview';
      easingPreview.innerHTML = easingPreviewSVG(current);
      // Free-form custom value (any cubic-bezier(...) / keyword / GSAP ease).
      easingCustom = document.createElement('input');
      easingCustom.type = 'text';
      easingCustom.className = 'kt-ease-custom';
      easingCustom.placeholder = 'cubic-bezier(…) / custom';
      easingCustom.value = current || '';
      // Interactive drag editor — only meaningful for cubic-bezier values.
      easingEditor = document.createElement('div');
      easingEditor.className = 'kt-ease-editor';
    } else {
      input = document.createElement('input'); input.type = type === 'color' ? 'text' : type;
      if (type === 'range') { input.min = a; input.max = b; input.step = c; }
    }
    input.dataset.option = key;
    input.dataset.module = descriptor.module;
    const value = optionValue(descriptor, key);
    if (type === 'checkbox') input.checked = Boolean(value);
    else if (type === 'color') input.value = String(value || '#ff5b1c');
    else if (type === 'easing') input.value = (value == null ? '' : String(value));
    else input.value = value;
    const valueLabel = document.createElement('small');
    valueLabel.className = 'kt-playground__value';
    // Only echo a compact value for ranges/checkboxes — long text/HTML values
    // wrapped and overlapped neighbouring fields.
    const showValue = type === 'range' || type === 'checkbox';
    valueLabel.textContent = type === 'checkbox' ? (input.checked ? 'on' : 'off') : input.value;
    if (!showValue) valueLabel.style.display = 'none';
    const schedule = () => {
      clearTimeout(state.timers.get(host));
      state.timers.set(host, setTimeout(() => {
        // Live edits rebuild only the edited module so stacked cards (e.g.
        // ambient over a lazy image) never tear each other's DOM apart.
        if (descriptor.kind === 'loader' || descriptor.kind === 'pageReveal' || descriptor.kind === 'pageTransition') {
          apply(host, descriptors, status);
        } else {
          rebuildModule(descriptor);
          // Replay immediately so the changed property is visible without having
          // to press "다시 재생" (one-shot / scroll-triggered effects otherwise
          // sit at their end state after a silent recreate).
          descriptor.targets.forEach((target) => {
            const inst = window.Kineto.replay?.(target, descriptor.module);
            const one = Array.isArray(inst) ? inst[0] : inst;
            if (one && typeof one.fire === 'function') one.fire();
          });
          window.Kineto.refresh?.();
          updateCode(host, descriptors);
          status.textContent = `적용됨 · 활성 인스턴스 ${window.Kineto.instanceCount}개`;
        }
      }, type === 'range' || type === 'color' ? 80 : 0));
    };
    // Reflect an easing value into the static preview, the custom input and the
    // interactive drag editor (which only shows for cubic-bezier values).
    const emitEase = (v) => {
      if (easingCustom) easingCustom.value = v;
      if (input) input.value = '';
      if (easingPreview) easingPreview.innerHTML = easingPreviewSVG(v);
      setOption(descriptor, key, v, 'text');
      updateCode(host, descriptors); schedule();
    };
    const syncEase = (val) => {
      if (easingPreview) easingPreview.innerHTML = easingPreviewSVG(val);
      if (!easingEditor) return;
      // The cubic-bezier graph editor is ALWAYS shown (requested) — a consistent
      // layout regardless of preset. A bezier/keyword/GSAP value updates the curve;
      // a non-bezier value (spring/steps) keeps the last curve, and dragging the
      // graph switches the value to the edited cubic-bezier.
      easingEditor.hidden = false;
      if (!bezierCtl) bezierCtl = mountBezierEditor(easingEditor, val, emitEase);
      else if (easingBezier(val)) bezierCtl.set(val);
    };
    input.addEventListener(type === 'range' || type === 'color' ? 'input' : 'change', () => {
      const next = type === 'checkbox' ? input.checked : input.value;
      if (type === 'color' && !validCssColor(next)) return;
      if (showValue) valueLabel.textContent = type === 'checkbox' ? (input.checked ? 'on' : 'off') : input.value;
      if (descriptor.kind === 'loader' || descriptor.kind === 'pageReveal' || descriptor.kind === 'pageTransition') descriptor.options[descriptor.kind === 'loader' && key === 'preset' ? 'type' : key] = type === 'checkbox' ? next : (type === 'number' || type === 'range' ? Number(next) : next);
      else setOption(descriptor, key, next, type);
      if (type === 'easing') { if (easingCustom) easingCustom.value = input.value; syncEase(input.value); }
      updateCode(host, descriptors);
      schedule();
      // No panel rebuild on option changes — field visibility syncs in
      // place, so the drawer never flickers.
      syncVisibility(host, descriptors);
    });
    if (easingCustom) {
      easingCustom.addEventListener('input', () => {
        const next = easingCustom.value.trim();
        setOption(descriptor, key, next, 'text');
        syncEase(next);
        schedule();
      });
    }
    if (input) input.id = fieldId;
    if (type === 'checkbox') { wrapper.append(input, capRow, valueLabel); }
    else if (type === 'easing') {
      // Mockup layout: one grid — left column = preset select + cubic-bezier()
      // input + x1/y1/x2/y2, right column = graph + scrubber, tools below. The
      // editor uses display:contents so its svg/nums/scrub/tools join this grid.
      wrapper.classList.add('kt-ease-field');
      wrapper.append(capRow, input, easingCustom, easingEditor, valueLabel);
      if (easingEditor) syncEase(input.value);
    }
    else if (type === 'color') { wrapper.append(capRow, buildColorControl(input, () => input.dispatchEvent(new Event('input'))), valueLabel); }
    else { wrapper.append(capRow, input, valueLabel); }
    return wrapper;
  }

  function panelFor(host, descriptors) {
    const details = document.createElement('details');
    details.className = 'kt-playground';
    const summary = document.createElement('summary');
    const moduleNames = descriptors.map((item) => item.module === 'loader' ? 'Loader' : labelize(item.module)).join(' + ');
    summary.innerHTML = `<span class="kt-playground__summary-copy"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true" focusable="false"><path d="M5.33409 4.54491C6.3494 3.63637 7.55145 2.9322 8.87555 2.49707C9.60856 3.4128 10.7358 3.99928 12 3.99928C13.2642 3.99928 14.3914 3.4128 15.1245 2.49707C16.4486 2.9322 17.6506 3.63637 18.6659 4.54491C18.2405 5.637 18.2966 6.90531 18.9282 7.99928C19.5602 9.09388 20.6314 9.77679 21.7906 9.95392C21.9279 10.6142 22 11.2983 22 11.9993C22 12.7002 21.9279 13.3844 21.7906 14.0446C20.6314 14.2218 19.5602 14.9047 18.9282 15.9993C18.2966 17.0932 18.2405 18.3616 18.6659 19.4536C17.6506 20.3622 16.4486 21.0664 15.1245 21.5015C14.3914 20.5858 13.2642 19.9993 12 19.9993C10.7358 19.9993 9.60856 20.5858 8.87555 21.5015C7.55145 21.0664 6.3494 20.3622 5.33409 19.4536C5.75952 18.3616 5.7034 17.0932 5.0718 15.9993C4.43983 14.9047 3.36862 14.2218 2.20935 14.0446C2.07212 13.3844 2 12.7002 2 11.9993C2 11.2983 2.07212 10.6142 2.20935 9.95392C3.36862 9.77679 4.43983 9.09388 5.0718 7.99928C5.7034 6.90531 5.75952 5.637 5.33409 4.54491ZM13.5 14.5974C14.9349 13.7689 15.4265 11.9342 14.5981 10.4993C13.7696 9.0644 11.9349 8.57277 10.5 9.4012C9.06512 10.2296 8.5735 12.0644 9.40192 13.4993C10.2304 14.9342 12.0651 15.4258 13.5 14.5974Z"/></svg><span class="kt-playground__summary-label"></span></span><span class="kt-playground__summary-name">${escapeHtml(moduleNames)}</span>`;
    localize(summary.querySelector('.kt-playground__summary-label'), 'summary');
    // Dogfood: if the module name is wider than its slot, Kineto's own
    // overflowText scrolls it (bounce, pause on hover) instead of truncating —
    // also covers longer translated strings.
    requestAnimationFrame(() => {
      const nameEl = summary.querySelector('.kt-playground__summary-name');
      if (nameEl && nameEl.scrollWidth > nameEl.clientWidth + 2) {
        window.Kineto?.overflowText?.(nameEl, { mode: 'bounce', speed: 34, delay: 900, endPause: 900, pauseOnHover: true });
      }
    });
    // B-1 lazy render: with ~119 demos, building every full options body up front
    // (fieldsets, controls, code, search) is the dominant load cost. We build the
    // heavy body only the first time its panel is opened. The lightweight
    // <details>/<summary> trigger stays eager so layout + ordering are identical.
    let __body = null;
    const buildBody = () => {
      if (__body) return __body;
    const body = document.createElement('div'); body.className = 'kt-playground__body';
    const groups = document.createElement('div'); groups.className = 'kt-playground__groups';
    const status = document.createElement('div'); status.className = 'kt-playground__status'; status.setAttribute('aria-live','polite');

    descriptors.forEach((descriptor) => {
      const multi = descriptors.length > 1;
      const currentOptions = descriptor.kind === 'loader' ? { preset: descriptor.options.type, ...descriptor.options } : { ...(DEFAULTS[descriptor.module] || {}), ...descriptorOptions(descriptor) };
      let definitions = descriptor.kind === 'pageReveal' ? [
        ['effect','Effect','select',['curtain','split','circle','wipe','blinds','diagonal','checker','strips','shutter','columns','zoom','fade']],['direction','Direction','select',['up','down','left','right']],['duration','Duration','range',0.2,2,0.05],['delay','Delay','range',0,1,0.05],['ease','Ease','easing'],['color','Color','color'],['color2','Color 2','color'],['count','Pieces','range',3,14,1],['stagger','Stagger','range',0,0.2,0.005],['angle','Diagonal angle','range',-45,45,1]
      ] : descriptor.kind === 'loader' ? [
        ['preset','Type','select',['slot','circular','bar']],['minDuration','Minimum (ms)','range',300,5000,100],['duration','Exit duration','range',0.1,1.5,0.05],
        ['color','Color','color'],['trackColor','Track color','color'],
        ['size','Size','range',24,220,4],['stroke','Stroke','range',1,18,1],['linecap','Line cap','select',['round','butt','square']],['showPercent','Show percent','checkbox'],
        ['barWidth','Bar width','range',120,620,10],['barHeight','Bar height','range',2,24,1],['radius','Radius','range',0,40,1],
        ['label','Label','text'],['fill','Background fill','select',['','up','down','left','right']],['fillColor','Fill color','color'],['labelColor','Text color','color'],['labelBlend','Text blend','select',['','difference','exclusion','screen','overlay']],['exit','Exit','select',['fade','slide','wipe']],['exitDirection','Exit direction','select',['','up','down','left','right']]
      ] : descriptor.kind === 'pageTransition' ? [
        ['effect','Effect','select',['fade','slide','cover','curtain','circle','wipe','blinds','split']],['color','Cover color','color'],['color2','Cover color 2','color'],['duration','Duration (s)','range',0.1,1.5,0.05],['ease','Ease','easing'],['minDuration','Min fetch (ms)','range',0,2000,50],['scrollTop','Scroll to top','checkbox'],['cache','Fetched-page cache','checkbox'],['executeScripts','Run inline scripts','checkbox'],['linkSelector','Link selector','text'],['container','Content selector','text']
      ] : (FIELDS[descriptor.module] || []);
      if (descriptor.module === 'coverReveal') {
        const hasImageTarget = descriptor.targets.some((target) => target.tagName === 'IMG' || target.querySelector?.('img'));
        const hasTextTarget = descriptor.targets.some((target) => {
          if (target.tagName === 'IMG' || target.querySelector?.('img')) return false;
          return Boolean(target.textContent?.trim());
        });
        // Per-line only applies to rendered text. Wait-for-image only applies
        // to image covers. Hiding these at definition time prevents invalid
        // combinations from ever entering the live option object.
        definitions = definitions.filter(([key]) => {
          if (key === 'lines') return hasTextTarget;
          if (key === 'waitForImage') return hasImageTarget;
          return true;
        });
      }
      // Surface the ease/easing control for every ease-capable module.
      const easeKey = EASE_FIELDS[descriptor.module];
      if (easeKey && !definitions.some((d) => d[0] === easeKey)) {
        definitions = [...definitions, [easeKey, easeKey === 'easing' ? 'Easing' : 'Ease', 'easing']];
      }
      // Bucket options into role-based groups (Motion / Trigger / Look /
      // Behavior / Advanced) so core knobs read clearly instead of one flat list.
      const buckets = new Map(GROUP_ORDER.map((g) => [g, []]));
      definitions.forEach((definition) => { buckets.get(groupOf(definition[0])).push(definition); });
      GROUP_ORDER.forEach((groupName) => {
        const defs = buckets.get(groupName); if (!defs.length) return;
        // A plain DIV group (not <fieldset>) so the header/border have no legend
        // notch artifact; a native <button> header folds it like an accordion.
        const fieldset = document.createElement('div'); fieldset.className = 'kt-playground__group'; fieldset.dataset.group = groupName;
        const legend = document.createElement('button'); legend.type = 'button'; legend.className = 'kt-playground__legend';
        legend.setAttribute('aria-expanded', 'true');
        const legendLabel = document.createElement('span'); legendLabel.className = 'kt-playground__legend-text';
        localize(legendLabel, GROUP_I18N_KEYS[groupName]);
        if (multi) {
          legendLabel.dataset.pgI18nPrefix = labelize(descriptor.module);
          legendLabel.textContent = `${legendLabel.dataset.pgI18nPrefix} · ${ui(GROUP_I18N_KEYS[groupName])}`;
        }
        legend.appendChild(legendLabel);
        legend.addEventListener('click', () => {
          const collapsed = fieldset.classList.toggle('is-collapsed');
          legend.setAttribute('aria-expanded', String(!collapsed));
          syncGroupLayout(groups);
          requestAnimationFrame(() => {
            const drawer = drawerRoot();
            if (drawer.current === body) drawer.fit(body);
          });
        });
        const controls = document.createElement('div'); controls.className = 'kt-playground__controls';
        defs.forEach((definition) => {
          const field = createField(descriptor, definition, host, descriptors, status);
          field.dataset.module = descriptor.module;
          field.dataset.key = definition[0];
          const rule = WHEN[descriptor.module]?.[definition[0]];
          try { field.hidden = !!rule && !rule(currentOptions); } catch (_e) { field.hidden = false; }
          controls.appendChild(field);
        });
        fieldset.append(legend, controls); groups.appendChild(fieldset);
      });
    });
    syncGroupLayout(groups);

    const toolbar = document.createElement('div'); toolbar.className = 'kt-playground__toolbar';
    const replayButton = document.createElement('button'); replayButton.type = 'button'; replayButton.className = 'is-primary'; localize(replayButton, descriptors.some((item) => item.kind === 'loader') ? 'run' : 'replay');
    const resetButton = document.createElement('button'); resetButton.type = 'button'; localize(resetButton, 'reset');
    replayButton.addEventListener('click', () => { replay(host, descriptors, status); window.ktToast?.(ui('replayDone')); });
    resetButton.addEventListener('click', () => { reset(host, descriptors); window.ktToast?.(ui('resetDone')); });
    toolbar.append(replayButton, resetButton);

    const codeWrap = document.createElement('div'); codeWrap.className = 'kt-playground__code';
    codeWrap.innerHTML = '<div class="kt-playground__code-head"><div class="kt-playground__tabs"><button type="button" class="kt-playground__tab is-active" data-code-tab="html">HTML</button><button type="button" class="kt-playground__tab" data-code-tab="js">JS</button><button type="button" class="kt-playground__tab" data-code-tab="css">CSS vars</button></div><div class="kt-playground__code-actions"><button type="button" class="kt-playground__wrap" aria-pressed="false"></button><button type="button" class="kt-playground__copy"></button></div></div><pre class="kt-playground__pre line-numbers"><code></code></pre>';
    localize(codeWrap.querySelector('.kt-playground__wrap'), 'wrap');
    localize(codeWrap.querySelector('.kt-playground__copy'), 'copyCode');
    codeWrap.querySelectorAll('[data-code-tab]').forEach((tab) => tab.addEventListener('click', () => {
      codeWrap.querySelectorAll('[data-code-tab]').forEach((item) => item.classList.toggle('is-active', item === tab));
      updateCode(host, descriptors);
    }));
    codeWrap.querySelector('.kt-playground__copy').addEventListener('click', async (event) => {
      const copyButton = event.currentTarget;
      const active = codeWrap.querySelector('.kt-playground__tab.is-active').dataset.codeTab;
      const text = details.dataset[active === 'html' ? 'htmlCode' : active === 'css' ? 'cssCode' : 'jsCode'] || '';
      try {
        await navigator.clipboard.writeText(text);
      } catch (_error) {
        const textarea = document.createElement('textarea'); textarea.value = text; document.body.appendChild(textarea); textarea.select(); document.execCommand('copy'); textarea.remove();
      }
      copyButton.textContent = ui('copied'); status.textContent = `${active.toUpperCase()} ${ui('copied')}`;
      window.ktToast?.(ui('copyDone'));
      setTimeout(() => { copyButton.textContent = ui('copyCode'); }, 1000);
    });
    codeWrap.querySelector('.kt-playground__wrap').addEventListener('click', (event) => {
      const button = event.currentTarget;
      const pre = codeWrap.querySelector('.kt-playground__pre');
      const wrapped = !pre.classList.contains('is-wrapped');
      pre.classList.toggle('is-wrapped', wrapped);
      pre.classList.toggle('line-numbers', !wrapped);
      button.classList.toggle('is-active', wrapped);
      button.setAttribute('aria-pressed', String(wrapped));
    });

    // Options live in a wide floating dock. A sticky head carries the title +
    // actions; controls fill the middle; the code preview is tucked into a
    // collapsible drawer so the panel reads like a design tool, not a console.
    const drawerHead = document.createElement('div');
    drawerHead.className = 'kt-playground__drawer-head';
    const headText = document.createElement('div');
    headText.className = 'kt-playground__drawer-heading';
    const drawerTitle = document.createElement('strong');
    drawerTitle.textContent = moduleNames;
    const drawerSub = document.createElement('span');
    drawerSub.className = 'kt-playground__drawer-sub';
    drawerSub.dataset.pgDrawerSub = 'true';
    drawerSub.__ktRefreshLocale = () => {
      const ownerDescription = host.closest('.card, .scroll-demo-unit, .hscroll-demo-unit')?.querySelector(':scope > p')?.textContent?.trim();
      const fallback = descriptors.map((descriptor) => MODULE_DESC[descriptor.module]).filter(Boolean).join(' ');
      const descClean = (ownerDescription || fallback).replace(/\s*[.。]\s*$/, '');
      drawerSub.textContent = descClean ? `${descClean} · ${ui('liveHint')}` : ui('liveHint');
    };
    drawerSub.__ktRefreshLocale();
    headText.append(drawerTitle, drawerSub);
    // 설정 ↔ 코드 view toggle in the head — the code is one click away instead
    // of a scroll to the bottom (replaces the old option-search field).
    const viewTabs = document.createElement('div'); viewTabs.className = 'kt-playground__viewtabs';
    viewTabs.setAttribute('role', 'tablist');
    viewTabs.innerHTML = '<button type="button" class="kt-vt is-active" data-view="settings" role="tab" aria-selected="true"></button><button type="button" class="kt-vt" data-view="code" role="tab" aria-selected="false"></button>';
    localize(viewTabs.querySelector('[data-view="settings"]'), 'settings');
    localize(viewTabs.querySelector('[data-view="code"]'), 'code');

    const headActions = document.createElement('div');
    headActions.className = 'kt-playground__head-actions';
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'kt-playground__close';
    localize(closeButton, 'closeOptions', 'aria-label');
    // Inline SVG (not an icon font) so the close control never renders as an
    // empty square if the icon CDN fails (audit B-8 / E-4).
    closeButton.innerHTML = '<svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true" focusable="false"><path d="M5 5l10 10M15 5L5 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    closeButton.addEventListener('click', () => { details.open = false; });
    // Keep replay/reset in the head so the actions are always visible.
    headActions.append(toolbar, closeButton);
    drawerHead.append(headText, viewTabs, headActions);

    // Settings and code occupy one fixed view stage. Keeping both panes mounted
    // allows a simple crossfade without changing the bottom-sheet height.
    const viewStage = document.createElement('div');
    viewStage.className = 'kt-playground__viewstage';
    viewStage.dataset.view = 'settings';
    groups.classList.add('kt-playground__view', 'is-active');
    codeWrap.classList.add('kt-playground__view');
    groups.setAttribute('aria-hidden', 'false');
    codeWrap.setAttribute('aria-hidden', 'true');
    codeWrap.inert = true;
    viewTabs.dataset.view = 'settings';
    const switchView = (t) => {
      const isCode = t.dataset.view === 'code';
      viewTabs.dataset.view = isCode ? 'code' : 'settings';
      viewStage.dataset.view = isCode ? 'code' : 'settings';
      viewTabs.querySelectorAll('.kt-vt').forEach((b) => { const on = b === t; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', String(on)); });
      groups.classList.toggle('is-active', !isCode);
      codeWrap.classList.toggle('is-active', isCode);
      groups.setAttribute('aria-hidden', String(isCode));
      codeWrap.setAttribute('aria-hidden', String(!isCode));
      groups.inert = isCode;
      codeWrap.inert = !isCode;
      if (isCode) updateCode(host, descriptors);
      requestAnimationFrame(() => drawerRoot().fit(body));
    };
    viewTabs.querySelectorAll('.kt-vt').forEach((t) => t.addEventListener('click', () => switchView(t)));
    viewTabs.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const tabs = [...viewTabs.querySelectorAll('.kt-vt')];
      const active = tabs.findIndex((tab) => tab.classList.contains('is-active'));
      const next = tabs[(active + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      next.focus();
      switchView(next);
    });

    details.__mkBody = body;
    body.__mkOwner = details;
    body.classList.add('is-portal');
    body.hidden = true;
    viewStage.append(groups, codeWrap);
    body.append(viewStage, status);
    // Long, module-specific notes (data-kt-note) sit just under the head.
    const noteText = descriptors.map((d) => d.targets?.[0]?.getAttribute?.('data-kt-note')).find(Boolean);
    if (noteText) {
      const note = document.createElement('p');
      note.className = 'kt-playground__note';
      note.textContent = noteText;
      groups.prepend(note);
    }
    body.prepend(drawerHead);
    drawerRoot().sheet.appendChild(body);
      __body = body;
      return body;
    };
    details.__buildBody = buildBody;
    // Programmatic hook for QA and integrations that need an explicit
    // validation pass. The visible controls remain live and do not need an
    // extra "적용" button.
    details.__apply = () => {
      const body = buildBody();
      const status = body.querySelector('.kt-playground__status');
      apply(host, descriptors, status);
    };
    details.append(summary);
    details.addEventListener('toggle', () => {
      const drawer = drawerRoot();
      if (details.open) {
        document.querySelectorAll('.kt-playground[open]').forEach((other) => { if (other !== details) other.open = false; });
        const body = buildBody();
        // Code dataset was primed on the closed panel; sync the freshly-built
        // <pre> to it now that the code element exists.
        updateCode(host, descriptors);
        drawer.show(body, moduleNames, details);
      } else if (__body && drawer.current === __body) {
        drawer.hide();
      }
    });
    return details;
  }

  // A wide floating bottom dock with a light, blurred backdrop. The card being
  // edited is spotlit ABOVE the backdrop (crisp + centered) so you keep seeing
  // the live example while everything else recedes. Only one body shows at a
  // time. Closing is via ✕, ESC, the summary, the backdrop, or opening another.
  let _drawer = null;
  function drawerRoot() {
    if (_drawer) return _drawer;
    const backdrop = document.createElement('div');
    backdrop.className = 'kt-drawer-backdrop';
    const sheet = document.createElement('div');
    sheet.className = 'kt-drawer-sheet kt-density-compact';
    // Modal dialog semantics (audit B-2 / J-5). We keep the spotlit demo card
    // interactive for the live preview, so instead of `inert`-ing the page we
    // trap keyboard focus inside the dialog and let the backdrop close on click.
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    localize(sheet, 'options', 'aria-label');
    // Resize from the grip or the drawer header only. Keeping the settings/code
    // body out of the gesture surface preserves native text selection and copy.
    const grip = document.createElement('div');
    grip.className = 'kt-drawer-grip'; grip.setAttribute('role', 'separator'); grip.setAttribute('aria-orientation', 'horizontal'); localize(grip, 'resize', 'aria-label'); grip.tabIndex = 0;
    sheet.dataset.resizeArea = 'header';
    let sheetH = null; try { sheetH = parseInt(localStorage.getItem('kt-drawer-h') || '', 10) || null; } catch (_) {}
    const applySheetH = () => { if (!sheetH) return; const h = Math.min(Math.max(sheetH, 240), Math.round(window.innerHeight * 0.92)); sheet.style.height = h + 'px'; sheet.style.maxHeight = '92vh'; };
    const resetSheetH = () => { sheetH = null; sheet.style.height = ''; sheet.style.maxHeight = ''; try { localStorage.removeItem('kt-drawer-h'); } catch (_) {} };
    const noResize = 'button,a,input,select,textarea,label,[contenteditable="true"],[data-no-sheet-resize]';
    let resizePointer = null; let resizeStartY = 0; let resizeStartH = 0; let resizeMoved = false; let resizeTapAt = 0;
    sheet.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const onGrip = event.target === grip || grip.contains(event.target);
      const inHeader = Boolean(event.target.closest?.('.kt-playground__drawer-head'));
      if (!onGrip && (!inHeader || event.target.closest?.(noResize))) return;
      resizePointer = event.pointerId; resizeStartY = event.clientY; resizeStartH = sheet.getBoundingClientRect().height; resizeMoved = false;
      sheet.classList.add('is-resizing');
      sheet.setPointerCapture?.(event.pointerId);
    });
    sheet.addEventListener('pointermove', (event) => {
      if (resizePointer !== event.pointerId) return;
      const delta = event.clientY - resizeStartY;
      if (Math.abs(delta) > 3) resizeMoved = true;
      sheetH = Math.round(resizeStartH - delta);
      applySheetH();
    });
    const endResize = (event) => {
      if (resizePointer !== event.pointerId) return;
      sheet.releasePointerCapture?.(event.pointerId);
      resizePointer = null; sheet.classList.remove('is-resizing');
      if (!resizeMoved) {
        const now = Date.now();
        if (now - resizeTapAt < 320) resetSheetH();
        resizeTapAt = now;
      }
      try { if (sheetH) localStorage.setItem('kt-drawer-h', String(sheetH)); } catch (_) {}
    };
    sheet.addEventListener('pointerup', endResize);
    sheet.addEventListener('pointercancel', endResize);
    grip.addEventListener('keydown', (e) => { if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return; e.preventDefault(); sheetH = (sheetH || Math.round(window.innerHeight * 0.5)) + (e.key === 'ArrowUp' ? 40 : -40); applySheetH(); try { localStorage.setItem('kt-drawer-h', String(sheetH)); } catch (_) {} });
    // Double-click/tap the grip or a non-interactive part of the header to
    // restore automatic height.
    sheet.addEventListener('dblclick', (event) => {
      const onGrip = event.target === grip || grip.contains(event.target);
      const inHeader = Boolean(event.target.closest?.('.kt-playground__drawer-head'));
      if (!onGrip && (!inHeader || event.target.closest?.(noResize))) return;
      resetSheetH();
    });
    localize(grip, 'resizeTitle', 'title');
    sheet.appendChild(grip);
    document.body.append(backdrop, sheet);
    const focusables = () => [...sheet.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter((el) => el.offsetParent !== null || el === document.activeElement);
    const api = {
      sheet, backdrop, current: null, spotlit: null, lastFocus: null,
      fit(body) {
        if (sheetH || !body || matchMedia('(max-width:720px)').matches) return;
        const head = body.querySelector('.kt-playground__drawer-head');
        const chrome = grip.offsetHeight + (head?.offsetHeight || 74);
        const maxHeight = Math.round(window.innerHeight * 0.5);
        const groupsPane = body.querySelector('.kt-playground__groups');
        const groupItems = groupsPane ? [...groupsPane.children].filter((item) => !item.hidden) : [];
        const groupsNatural = groupItems.length
          ? Math.max(...groupItems.map((item) => item.offsetTop + item.offsetHeight)) + 24
          : 0;
        // Size from the settings content only. The code view crossfades in the
        // same stage and scrolls when longer, so switching tabs never jolts the
        // sheet from a compact height to 50vh.
        const desired = chrome + groupsNatural;
        sheet.style.height = `${Math.max(230, Math.min(maxHeight, desired))}px`;
        sheet.style.maxHeight = `${maxHeight}px`;
      },
      show(body, _title, owner) {
        api.lastFocus = document.activeElement;
        Array.from(sheet.children).forEach((child) => { if (child !== grip) child.hidden = child !== body; });
        body.hidden = false;
        api.current = body;
        applySheetH();
        // Move focus into the dialog (its labelled heading), once painted.
        requestAnimationFrame(() => {
          api.fit(body);
          (sheet.querySelector('.kt-playground__close') || focusables()[0] || sheet).focus?.();
        });
        // Spotlight the owning card above the dim so its demo stays crisp.
        const card = owner?.closest?.('.card, .scroll-demo-unit, .hscroll-demo-unit')
          || (owner?.closest?.('.kt-playground-host')?.previousElementSibling)
          || owner;
        api.spotlit?.classList.remove('kt-fp-spotlight');
        api.spotlit = card;
        card?.classList?.add('kt-fp-spotlight');
        requestAnimationFrame(() => {
          backdrop.classList.add('is-open');
          sheet.classList.add('is-open');
          if (!card) return;
          requestAnimationFrame(() => {
            const rect = card.getBoundingClientRect();
            const dockTop = window.innerHeight - sheet.offsetHeight;
            const gap = dockTop - 76; // usable space above the dock
            // Tall cards (e.g. fullpage) align to the top so the most of the
            // example stays visible above the dock; short cards center.
            const targetTop = rect.height > gap - 8 ? 76 : Math.max(76, 76 + (gap - rect.height) / 2);
            if ((rect.top < 70 || rect.bottom > dockTop - 8) && typeof window.scrollTo === 'function') {
              window.scrollTo({ top: Math.max(0, window.scrollY + rect.top - targetTop), behavior: 'smooth' });
            }
          });
        });
      },
      hide() {
        backdrop.classList.remove('is-open');
        sheet.classList.remove('is-open');
        api.spotlit?.classList.remove('kt-fp-spotlight');
        api.spotlit = null;
        const owner = api.current?.__mkOwner;
        api.current = null;
        if (owner && owner.open) owner.open = false;
        // Restore focus to the trigger that opened the dialog (a11y).
        const restore = owner?.querySelector?.('summary') || api.lastFocus;
        restore?.focus?.();
        api.lastFocus = null;
      }
    };
    // Keyboard focus trap: Tab / Shift+Tab cycle within the dialog only.
    sheet.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || !sheet.classList.contains('is-open')) return;
      const f = focusables(); if (!f.length) return;
      const first = f[0]; const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    backdrop.addEventListener('click', () => {
      const owner = api.current?.__mkOwner;
      if (owner) owner.open = false; else api.hide();
    });
    _drawer = api;
    return _drawer;
  }

  // Accessibility: ESC closes the open options drawer and returns focus to
  // its summary trigger.
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const open = document.querySelector('.kt-playground[open]');
    if (!open) return;
    event.preventDefault();
    open.open = false;
    open.querySelector('summary')?.focus();
  });

  function rebuildPanel(host, descriptors, message = '', keepOpen = false) {
    const previous = host.querySelector(':scope > .kt-playground');
    const wasOpen = keepOpen || previous?.open;
    previous?.__mkBody?.querySelector('.kt-playground__status')?.__ktHelpTooltips?.forEach?.((instance) => {
      if (instance?.el) window.Kineto?.destroyModule?.(instance.el, 'tooltip');
    });
    previous?.__mkBody?.remove();
    previous?.remove();
    const panel = panelFor(host, descriptors);
    host.appendChild(panel);
    // When the previous panel was open, eagerly build the new body so it can
    // re-open in place and receive the status message (which lives in the body).
    if (wasOpen) { panel.__buildBody?.(); panel.open = true; }
    updateCode(host, descriptors);
    if (message) { const s = (panel.__mkBody || panel).querySelector('.kt-playground__status'); if (s) s.textContent = message; }
  }

  function ensureHorizontalSettings(controlHost, descriptors) {
    const descriptor = descriptors.find((item) => item.module === 'horizontalScroll');
    const target = descriptor?.targets?.[0];
    const viewport = target?.querySelector?.('.kt-hscroll-viewport');
    if (!controlHost || !viewport || viewport.querySelector('.kt-hscroll-settings')) return;
    const proxy = document.createElement('button');
    proxy.type = 'button';
    proxy.className = 'kt-hscroll-settings';
    localize(proxy, 'openSettings', 'aria-label');
    proxy.innerHTML = '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M8.2 2.4h3.6l.5 2a6.2 6.2 0 0 1 1.3.8l2-.6 1.8 3.1-1.5 1.4a6.1 6.1 0 0 1 0 1.8l1.5 1.4-1.8 3.1-2-.6a6.2 6.2 0 0 1-1.3.8l-.5 2H8.2l-.5-2a6.2 6.2 0 0 1-1.3-.8l-2 .6-1.8-3.1 1.5-1.4a6.1 6.1 0 0 1 0-1.8L2.6 7.7l1.8-3.1 2 .6a6.2 6.2 0 0 1 1.3-.8l.5-2Z" fill="none" stroke="currentColor" stroke-width="1.35"/><circle cx="10" cy="10" r="2.3" fill="none" stroke="currentColor" stroke-width="1.35"/></svg><span></span>';
    localize(proxy.querySelector('span'), 'settings');
    proxy.addEventListener('click', () => {
      const panel = controlHost.querySelector('.kt-playground');
      if (panel) panel.open = true;
    });
    viewport.appendChild(proxy);
  }

  function mountHost(host, descriptors) {
    if (!descriptors.length || host.dataset.playgroundMounted === 'true') return;
    let controlHost = host;
    if (!host.classList.contains('card') && !host.classList.contains('kt-playground-host')) {
      controlHost = document.createElement('div');
      controlHost.className = 'kt-playground-host';
      // The settings TRIGGER always sits BELOW the demo (per spec). The panel
      // body itself opens as a fixed bottom drawer (portalled to <body>), so the
      // trigger's position never hides the controls even for long pinned demos.
      const anchor = host.closest('.demo-stage') || host;
      anchor.insertAdjacentElement('afterend', controlHost);
    }
    // Expose which module this settings trigger drives (used by ordering tests).
    if (descriptors[0]?.module) controlHost.dataset.settingsFor = descriptors[0].module;
    const demoUnit = host.closest('.scroll-demo-unit,.hscroll-demo-unit,[data-demo-id]');
    if (demoUnit && !demoUnit.dataset.demoId) {
      const primaryOptions = descriptors[0] ? descriptorOptions(descriptors[0]) : {};
      const variant = primaryOptions.preset || primaryOptions.mode || primaryOptions.type || 'default';
      demoUnit.dataset.demoId = `${descriptors[0]?.module || 'demo'}-${variant}`;
    }
    const demoId = demoUnit?.dataset.demoId;
    if (demoId) controlHost.dataset.settingsForDemo = demoId;
    host.dataset.playgroundMounted = 'true';
    controlHost.dataset.playgroundMounted = 'true';
    // Seed each target's last-known-good attribute set from the pristine page
    // state so the very first edit can still roll back safely (audit B-6).
    descriptors.forEach((d) => d.targets?.forEach?.((t) => { if (!t.__ktLastGood) t.__ktLastGood = Array.from(t.attributes).filter((a) => a.name.startsWith('data-kt-')).map((a) => [a.name, a.value]); }));
    rebuildPanel(controlHost, descriptors);
    ensureHorizontalSettings(controlHost, descriptors);
  }

  function mount(root = document) {
    // Replay as a floating icon on the stage's bottom-left corner.
    root.querySelectorAll('.card [data-action="replay-parent"], .card [data-action="replay"]').forEach((button) => {
      if (button.dataset.playgroundReplayMounted === 'true') return;
      const card = button.closest('.card');
      const stage = card?.querySelector('.demo-stage, .reveal-demo-card');
      if (!stage) return;
      const row = button.closest('.replay-row');
      button.classList.remove('btn');
      button.classList.add('replay-fab');
      // Preserve explicitly authored icons and labels. Otherwise every replay
      // control, including List Reveal, uses the same replay arrow.
      if (!button.querySelector('i, svg')) {
        button.innerHTML = '<i class="ph-bold ph-arrow-counter-clockwise" aria-hidden="true"></i>';
      }
      if (!button.hasAttribute('aria-label')) button.setAttribute('aria-label', 'Replay');
      if (!button.title) button.title = 'Replay';
      stage.appendChild(button);
      button.dataset.playgroundReplayMounted = 'true';
      if (row && !row.children.length) row.remove();
    });
    root.querySelectorAll('.card').forEach((card) => {
      let descriptors = discover(card);
      const loaderButton = card.querySelector('[data-loader-type]');
      if (loaderButton) {
        const type = loaderButton.dataset.loaderType;
        const options = { type, source: 'manual', manualDuration: 1800, minDuration: 1500, duration: .45, color: '#ff5b1c', trackColor: '#dfe3ea', size: 104, stroke: 8, showPercent: true, barWidth: 320, barHeight: 8, ...(type === 'slot' ? { fill: 'up', fillColor: '#ff5b1c', labelColor: '#ffffff', labelBlend: 'difference', exit: 'wipe' } : {}) };
        Object.entries(loaderButton.dataset).forEach(([dataKey, rawValue]) => {
          if (!dataKey.startsWith('loader') || dataKey === 'loaderType') return;
          const option = dataKey.slice(6).replace(/^./, (character) => character.toLowerCase());
          options[option] = parse(rawValue);
        });
        const loaderDescriptor = { module: 'loader', targets: [], kind: 'loader', options, initialOptions: { ...options } };
        descriptors = [loaderDescriptor];
        loaderButton.addEventListener('click', (event) => {
          event.preventDefault();
          const status = card.querySelector('.kt-playground__status') || { textContent: '' };
          runLoader(loaderDescriptor, status);
        });
      }
      mountHost(card, descriptors);
    });

    const pageRevealCard = [...root.querySelectorAll('.card')].find((card) => card.querySelector('[data-page-effect]'));
    if (pageRevealCard && pageRevealCard.dataset.playgroundMounted !== 'true') {
      const options = { effect: 'curtain', duration: .65, delay: 0, direction: 'up', color: '#ff5b1c', color2: '#101318', count: 8, stagger: .05, angle: -14 };
      const descriptor = { module: 'pageReveal', targets: [], kind: 'pageReveal', options, initialOptions: { ...options } };
      window.KinetoPlayground.pageRevealOptions = () => ({ ...descriptor.options });
      mountHost(pageRevealCard, [descriptor]);
    }

    // Page Transition (SPA link interception) — settings + copyable code, plus
    // an in-place preview whose effect/colour/duration/ease mirror the settings.
    const pageTransitionCard = [...root.querySelectorAll('.card')].find((card) => card.querySelector('[data-pt-preview]'));
    if (pageTransitionCard && pageTransitionCard.dataset.playgroundMounted !== 'true') {
      const options = { effect: 'fade', color: '#101318', color2: '#1e2a4a', duration: 0.5, ease: '', minDuration: 600, cache: true, scrollTop: true, executeScripts: false, linkSelector: 'a[href]', container: 'main' };
      const descriptor = { module: 'pageTransition', targets: [], kind: 'pageTransition', options, initialOptions: { ...options } };
      const stage = pageTransitionCard.querySelector('.pt-preview');
      // Push settings → preview CSS vars so colour/duration/ease are live.
      const syncPreview = () => {
        if (!stage) return;
        stage.dataset.fx = options.effect || 'fade';
        stage.style.setProperty('--pt-c1', options.color || '#101318');
        stage.style.setProperty('--pt-c2', options.color2 || options.color || '#1e2a4a');
        stage.style.setProperty('--pt-dur', `${Math.max(0.05, Number(options.duration ?? 0.5))}s`);
        stage.style.setProperty('--pt-ease', options.ease ? easingBezier(options.ease) ? `cubic-bezier(${easingBezier(options.ease).join(',')})` : String(options.ease) : 'cubic-bezier(.76,0,.24,1)');
        // NOTE: don't force a tab active here — on first load no effect is
        // "chosen" yet; the tab highlights only when the user clicks it.
      };
      window.KinetoPlayground.pageTransitionOptions = () => ({ ...options });
      window.KinetoPlayground.setPageTransitionEffect = (fx) => { options.effect = fx; const sel = pageTransitionCard.querySelector('.kt-playground [data-option="effect"]'); if (sel && sel.value !== fx) sel.value = fx; syncPreview(); updateCode(pageTransitionCard, [descriptor]); };
      window.KinetoPlayground.syncPageTransitionPreview = syncPreview;
      mountHost(pageTransitionCard, [descriptor]);
      syncPreview();
    }

    root.querySelectorAll('[data-kt-sticky-stack],[data-kt-marquee],[data-kt-scroll-sequence],[data-kt-horizontal-scroll]').forEach((element) => {
      if (element.closest('.card')) return;
      mountHost(element, discover(element));
    });

  }

  window.KinetoPlayground = {
    setHelpLang(lang){
      HELP_LANG = HELP_SETS[lang] ? lang : 'en';
      UI_LANG = UI_SETS[lang] ? lang : 'en';
      refreshUi();
    },
    refreshLocale(){ refreshUi(); },
    // Re-point every already-rendered tooltip to the current language.
    refreshHelp(){
      document.querySelectorAll('.kt-playground__field[data-module][data-key]').forEach((field) => {
        const tip = HELP[field.dataset.module]?.[field.dataset.key];
        if (tip == null) return;
        field.dataset.tip = tip;
        const help = field.querySelector('.kt-help');
        if (help) {
          help.dataset.tip = tip;
          help.__ktHelpTooltip?.update?.({ content: tip });
        }
      });
    }, capture, mount, updateCode, publicOptions: PUBLIC_OPTIONS,
    // Exposed for the options-sync test: the settings-field definitions after all
    // Object.assign/push patches, so tests can assert FIELDS ⊆ publicOptions and
    // measure per-module settings coverage against the single source (features.json).
    fields: FIELDS };
})();
