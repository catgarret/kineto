(() => {
  'use strict';

  const MODULE_ATTRIBUTES = {
    parallax: 'data-kt-parallax', mouseParallax: 'data-kt-mouse-parallax', reveal: 'data-kt-reveal',
    counter: 'data-kt-counter', lazy: 'data-kt-lazy', textSplit: 'data-kt-text-split',
    blurText: 'data-kt-blur-text', shuffle: 'data-kt-shuffle', typewriter: 'data-kt-typewriter', progress: 'data-kt-progress', fullpage: 'data-kt-fullpage',
    textReveal: 'data-kt-text-reveal', textTransition: 'data-kt-text-transition', magnetic: 'data-kt-magnetic',
    ripple: 'data-kt-ripple', marquee: 'data-kt-marquee', overflowText: 'data-kt-overflow-text',
    tilt: 'data-kt-tilt', cursor: 'data-kt-cursor', textFill: 'data-kt-text-fill', stickyStack: 'data-kt-sticky-stack',
    scrollVelocity: 'data-kt-scroll-velocity', slider: 'data-kt-slider', ambientMedia: 'data-kt-ambient-media',
    glitch: 'data-kt-glitch', cardGlow: 'data-kt-card-glow', lightbox: 'data-kt-lightbox', vibrate: 'data-kt-vibrate',
    cssScroll: 'data-kt-css-scroll', scrollSequence: 'data-kt-scroll-sequence', brushReveal: 'data-kt-brush-reveal'
  };

  const PUBLIC_OPTIONS = {"ambientMedia":["allowOverflow","ambientSrc","ambientSrcset","blur","brightness","color","fallbackColor","hideOnPause","inset","opacity","radius","sampleFps","sampleHeight","sampleWidth","saturation","scale","source","src"],"blurText":["duration","ease","onComplete","once","stagger","start"],"brushReveal":["blur","crossOrigin","fade","maxDpr","onError","opacity","persist","radius","revealSrc","softness","src"],"cardGlow":["alwaysOn","blendMode","blur","borderBlur","borderColor","borderColor2","borderGlow","borderInset","borderOpacity","borderRadius","borderWidth","color","color1","color2","cycleDuration","disableOnMobile","duration","ease","follow","halo","intensity","luminousBorder","mode","opacity","preset","radius","reflection","sensitivity","smoothing","speed","spread","surface","surfaceBlend","surfaceBlur","surfaceColor","surfaceColor2","surfaceGradient","surfaceInset","surfaceOpacity","surfaceSize"],"counter":["bareBackground","blink","blinkSeparators","clockSeparator","clockStyle","comma","daysLabel","decimals","delay","duration","ease","format","from","gap","grouping","hour12","lineHeight","locale","loops","mode","onComplete","once","popAlign","popDuration","popScale","prefix","preset","rollDirection","rollDuration","seamColor","seconds","separator","separatorColor","shadow","showDays","since","stagger","start","style","suffix","tile","tileColor","tileRadius","tileTextColor","to","until"],"cssScroll":["cssAnimation","end","onUpdate","property","rangeEnd","rangeStart","start"],"cursor":["backdropFilter","background","blur","borderColor","borderWidth","className","clickImage","clickImageDuration","clickImageSize","clickSprite","clickSpriteDuration","clickSpriteFrames","clickSpriteHeight","clickSpriteWidth","color","crosshairSize","dot","dotColor","dotSize","ease","follower","followerSize","full","global","height","hiddenSelector","hideDotOnHover","hoverBackground","hoverClass","hoverColor","hoverDotOpacity","hoverDotSize","hoverEffect","hoverLabel","hoverScale","hoverSelector","hoverSrc","hoverTemplate","html","label","labelColor","labelSize","mixBlendMode","onEnter","onLeave","opacity","orbitHoverScale","orbitRadius","orbitSpeed","orbitSquash","orbitText","preset","pressScale","radius","rotate","rotateDuration","rotateText","shadow","shape","smoothing","snakeGap","snakeMinScale","snakeScaleEase","snakeText","sparkleColor","sparkleColor2","sparkleDuration","sparkleSize","sparkleSymbols","sparkleThrottle","speed","spring","src","template","text","textColor","trailColor","trailCount","trailSize","type","width","zIndex"],"fullpage":["axis","dots","drag","duration","ease","height","initial","keyboard","loop","mode","onChange","onLeave","sectionSelector","threshold","touch","wheel"],"glitch":["blendMode","colors","delay","duration","intensity","loop","preset","sliceCount","speed","trigger","type"],"lazy":["animated","aspectRatio","blur","crossOrigin","delay","direction","display","duration","ease","edgeOpacity","edgeWidth","effect","fadeDuration","fallbackSrc","feather","flickerBackground","frame","frameColor","glitchStrength","height","holdDuration","keepFrame","maxDpr","minDuration","nativeLazy","noise","noiseBlend","noiseContrast","noiseFps","noiseHeight","noiseWidth","objectFit","objectPosition","onError","onLoad","onProgress","pixelEnd","pixelStart","pixelStepCount","preset","renderFps","rootMargin","rotate","sizes","skeletonAngle","skeletonColor","skeletonHighlight","skeletonIcon","skeletonSpeed","skeletonVariant","sliceCount","src","srcset","startScale","stepCount","stepDuration","steps","threshold","variant"],"lightbox":["alt","backdropBlur","backdropColor","backdropOpacity","caption","className","closeOnBackdrop","cursor","description","doubleClickZoom","duration","group","info","lazyEffect","lazyOptions","lightboxDuration","maxZoom","metadata","minZoom","minimap","onChange","onClose","onLoad","onOpen","radius","renderUI","src","title","toolbar","uiTemplate","wheelStep","zoom","zoomStep"],"loader":["ariaLabel","barHeight","barWidth","className","color","completeHold","completeOnError","duration","exit","exitDirection","exitDuration","expectedResources","fetch","fetchOptions","fill","fillColor","hideScrollbar","label","labelBlend","labelColor","manualDuration","minDuration","onComplete","onError","onProgress","percent","preset","progress","progressSource","promise","promiseCeiling","promiseStart","renderUI","resourceSelector","resources","showPercent","size","smoothing","source","stroke","trackColor","transition","type","url"],"magnetic":["ease","radius","strength"],"marquee":["clones","direction","pauseOnHover","reverseOnScrollUp","scrollAcceleration","skew","speed"],"mouseParallax":["compassRange","ease","global","gyro","maxX","maxY","mode","preset","rotateOffset","sensitivity","smoothing","speed"],"overflowText":["ariaLive","delay","direction","dissolveDuration","easing","ellipsis","endPause","flipDirection","flipDuration","force","gap","holdDuration","items","jitter","maskDirection","maskDuration","maskEase","mode","onChange","onPage","pageDuration","pageOverlap","pauseOnHover","perspective","preset","repeat","restartDelay","role","rollDirection","rollDuration","speed","text","threshold","title","transitionDirection"],"pageReveal":["angle","axis","color","color2","count","delay","direction","duration","ease","effect","onComplete","preset","stagger"],"pageTransition":["animationSelector","cache","container","executeScripts","linkSelector","minDuration","onClick","onEnter","onError","onLeave","scrollTop"],"parallax":["axis","distance","end","onUpdate","scrub","speed","start"],"progress":["attach","clickToTop","color","color2","hideAtEnd","label","offset","onUpdate","position","property","radius","showAfter","showPercent","size","smoothing","stroke","target","thickness","trackColor","ui","zIndex"],"reveal":["activeClass","classOnly","clockDirection","delay","direction","duration","ease","end","enterClass","leaveClass","onClassChange","onComplete","onEnter","onEnterBack","onLeave","onLeaveBack","once","preset","removeClassOnLeave","rootMargin","spring","stagger","start","startAngle","threshold"],"ripple":["centered","color","disableInReducedMotion","duration","easing","opacity","scale","unbounded"],"scrollSequence":["crossOrigin","end","extension","fit","frames","height","maxDpr","onError","onFrame","padding","preloadRadius","scrollLength","scrub","start","top","urlPrefix","urls","vhPerFrame"],"scrollVelocity":["axis","damping","decay","distance","effect","elastic","end","global","mass","maxBlur","maxRotate","maxScale","maxSkew","mode","onDirection","onUpdate","preset","response","reverse","smoothing","spring","start","stiffness","velocityDivisor"],"shuffle":["chars","onComplete","rainbow","rainbowColors","revealRate","rootMargin","scrambleFade","speed","text","threshold"],"slider":["align","autoplay","axis","depth","duration","effect","gap","initial","label","loop","minOpacity","minScale","nextSelector","onChange","opacityStep","pauseOnHover","perView","perspective","preset","prevSelector","rotate","scaleStep","smoothing","spacing","speed"],"stickyStack":["align","blur","bottomSpace","distance","ease","effect","end","fadePrevious","gap","itemDuration","itemHeight","minHeight","mode","offset","offsetTop","offsetY","onProgress","overlap","panelWidth","perspective","pin","pinSpacing","preset","previousBlur","previousOpacity","previousScale","previousY","reverseZ","rotate","scaleFrom","scalePrevious","scrollLength","scrub","snap","start","top","transformOrigin","transitionStartOffset","type"],"textFill":["baseColor","end","fillColor","onUpdate","scrub","start"],"textReveal":["chars","delay","duration","ease","flickerCount","flickerLoop","hold","loop","mode","onComplete","preset","rainbow","rainbowColors","rootMargin","scrambleFade","speed","stagger","text","threshold"],"textSplit":["animation","by","delay","duration","ease","hold","onComplete","onSwap","once","pause","perspective","preset","stagger","start","swapEase","swapOut","texts"],"textTransition":["ariaLive","baseColor","blur","charMode","duration","ease","effect","endScale","hold","jitter","loop","minHeight","onChange","onComplete","pause","preset","shimColor","shimSpeed","stagger","startScale","texts"],"tilt":["axis","disableOnMobile","ease","glare","glareBlur","glareColor","glareOpacity","glareRadius","gyro","max","maxX","maxY","perspective","reset","reverse","scale","sensitivity","smoothing"],"typewriter":["caret","caretChar","compose","eraseSpeed","hangul","loop","onComplete","pauseAfter","strings","typeSpeed"],"vibrate":["haptic","pattern","preset","threshold","trigger"]};

  const FIELDS = {
    counter: [
      ['preset','Mode','select',['slot','plain','digit','pop','flip','clock']], ['from','Start from','number'], ['to','Target','number'], ['separator','Separator','text'], ['blinkSeparators','Blink separators','checkbox'],
      ['locale','Locale','text'], ['duration','Duration','range',0.1,4,0.1], ['loops','Digit loops','range',0,6,1],
      ['popScale','Pop scale','range',1,3,0.05], ['popAlign','Pop align','select',['bottom','center','top']], ['popDuration','Pop duration','range',0.05,1,0.05],
      ['stagger','Stagger','range',0,0.3,0.01], ['prefix','Prefix','text'], ['suffix','Suffix','text'],
      ['tile','Flip tile','checkbox'], ['tileColor','Tile color','color'], ['tileTextColor','Tile text','color'], ['gap','Flip gap','range',0,12,1], ['separatorColor','Separator color','color'], ['seamColor','Flip seam color','color'], ['shadow','Flip shadow','checkbox'], ['seconds','Show seconds','checkbox'], ['hour12','12-hour + AM/PM','checkbox'], ['blink','Blink colon','checkbox'], ['clockStyle','Digit change','select',['roll','fade','instant','flip']], ['rollDirection','Roll direction','select',['up','down']], ['until','Countdown until','text'], ['since','Elapsed since','text'], ['daysLabel','Days label','text'], ['clockSeparator','Clock separator','text'], ['rollDuration','Roll duration','range',0.1,0.8,0.02]
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
      ['preset','Mode','select',['loop','bounce','rewind','once','page','flip','dissolve','page-roll','rolling']], ['speed','Speed','range',10,180,2],
      ['delay','Start pause (ms)','range',0,2500,50], ['endPause','End pause (ms)','range',0,2500,50],
      ['restartDelay','Restart delay (ms)','range',0,4000,50],
      ['maskDuration','Mask time (ms)','range',50,700,10], ['pageDuration','Page hold (ms)','range',100,2500,50],
      ['flipDuration','Flip time (ms)','range',100,900,20], ['flipDirection','Flip direction','select',['down','up']],
      ['dissolveDuration','Dissolve time (ms)','range',150,1200,10], ['jitter','Dissolve jitter','range',0,14,1],
      ['gap','Loop gap','range',0,120,2], ['maskDirection','Mask direction','select',['top-to-bottom','bottom-to-top','left-to-right','right-to-left']], ['rollDuration','Roll time (ms)','range',80,1200,20],['rollDirection','Roll direction','select',['up','down']],['items','Rolling items','text'], ['pauseOnHover','Pause on hover','checkbox']
    ],
    cardGlow: [
      ['preset','Glow','select',['spotlight','pointer','border','comet','aurora','shine']], ['color','Color','color'],
      ['cycleDuration','Cycle (s)','range',1,12,0.5],
      ['radius','Radius','range',20,360,5], ['opacity','Opacity','range',0,1,0.02], ['blur','Blur','range',0,60,1],
      ['spread','Spread','range',0,100,1], ['follow','Follow','range',0.02,1,0.02], ['sensitivity','Sensitivity','range',0.1,3,0.05],
      ['surface','Surface reflection','checkbox'], ['surfaceOpacity','Surface opacity','range',0,1,0.02], ['surfaceColor','Surface color','color'], ['borderGlow','Luminous border','checkbox'], ['borderColor','Border color','color'], ['borderWidth','Border width','range',1,8,0.5], ['alwaysOn','Always on','checkbox'], ['disableOnMobile','Disable on mobile','checkbox']
    ],
    tilt: [
      ['max','Angle','range',0,30,1], ['maxX','Angle X','range',0,30,1], ['maxY','Angle Y','range',0,30,1],
      ['sensitivity','Sensitivity','range',0.1,3,0.05], ['smoothing','Smoothing','range',0.02,0.5,0.01],
      ['perspective','Perspective','range',300,2000,50], ['scale','Scale','range',1,1.12,0.005], ['reverse','Reverse','checkbox'],
      ['reset','Reset on leave','checkbox'], ['glare','Glare','checkbox'], ['glareOpacity','Glare opacity','range',0,0.8,0.02], ['disableOnMobile','Disable on mobile','checkbox'],
      ['glareRadius','Glare radius','range',20,260,5]
    ],
    magnetic: [['strength','Strength','range',0,1.2,0.05],['radius','Radius','range',20,260,5]],
    ripple: [['color','Color','text'],['duration','Duration (ms)','range',100,1400,20],['opacity','Opacity','range',0,1,0.05],['scale','Scale','range',1,5,0.1],['centered','Centered','checkbox'],['unbounded','Unbounded','checkbox']],
    vibrate: [['preset','Haptic','select',['tap','double-tap','soft','rigid','heavy','success','warning','error','ratchet','heartbeat','long-press']],['trigger','Trigger','select',['hover','click','scroll','manual']],['pattern','Custom pattern','text'],['threshold','Scroll threshold','range',0,500,10]],
    mouseParallax: [['preset','Mode','select',['','compass']],['compassRange','Compass range (deg)','range',0,180,5],['rotateOffset','Rotate offset','range',-180,180,5],['smoothing','Smoothing','range',0.02,0.5,0.01],['sensitivity','Sensitivity','range',0.1,3,0.05],['maxX','Max X','range',0,80,1],['maxY','Max Y','range',0,80,1],['speed','Speed','range',0.02,1,0.02],['global','Global pointer','checkbox']],
    textSplit: [['by','Split by','select',['char','word']],['animation','Animation','select',['rise','fade','wave','spin','flip','scale','blur','slide-up','slide-down']],['duration','Duration','range',0.1,2,0.05],['stagger','Stagger','range',0,0.2,0.005],['delay','Delay','range',0,2,0.05],['hold','Swap hold (ms)','range',400,5000,100],['swapOut','Swap out','select',['slide-up','slide-down','fade','blur','scale','flip','spin']]],
    shuffle: [['speed','Frame speed (ms)','range',10,160,2],['revealRate','Reveal rate','range',1,8,1],['chars','Characters','text'],['rainbow','Rainbow scramble','checkbox'],['rainbowColors','Scramble palette','text'],['scrambleFade','Fade scramble','checkbox']],
    typewriter: [['typeSpeed','Type speed (ms)','range',10,200,5],['eraseSpeed','Erase speed (ms)','range',10,160,5],['pauseAfter','Pause (ms)','range',0,3000,50],['loop','Loop','checkbox'],['caret','Caret (|)','checkbox'],['hangul','한글 조합 타이핑','checkbox']],
    textReveal: [['preset','Mode','select',['stream','char','word','line','bounce','hangul','decode','flicker']],['rainbow','Rainbow scramble','checkbox'],['rainbowColors','Scramble palette','text'],['scrambleFade','Fade scramble','checkbox'],['flickerLoop','Ambient flicker','checkbox'],['loop','Loop','checkbox'],['hold','Loop hold (ms)','range',200,4000,100],['flickerCount','Decode frames','range',1,8,1],['speed','Speed (ms)','range',10,200,5],['stagger','Stagger','range',0,0.2,0.005],['duration','Duration','range',0.1,2,0.05]],
    textTransition: [['preset','Effect','select',['slide-up','rise','fade','blur','scale','clip','dissolve','shimmer']],['jitter','Dissolve jitter','range',0,14,1],['duration','Duration','range',0.1,2,0.05],['pause','Pause (ms)','range',100,4000,100],['blur','Blur','range',0,40,1],['startScale','Start scale','range',0.4,1.4,0.05],['endScale','End scale','range',0.4,1.4,0.05],['charMode','Char mode','checkbox'],['loop','Loop','checkbox']],
    glitch: [['preset','Type','select',['rgb','noise','crt','image','reveal','vcr']],['sliceCount','Image slices','range',2,16,1],['intensity','Intensity','range',0.1,3,0.05],['speed','Speed','range',0.2,3,0.05],['duration','Reveal duration','range',0.3,3,0.05],['trigger','Trigger','select',['auto','hover','scroll']],['delay','Burst delay','range',0,3,0.05],['loop','Loop','checkbox']],
    cursor: [['preset','Type','select',['dot','ring','blob','crosshair','text','trail','orbit','snake','sparkle','image','custom']],['src','Image URL','text'],['hoverSrc','Hover image URL','text'],['width','Image width','range',16,120,2],['height','Image height','range',16,120,2],['template','Custom HTML','text'],['hoverTemplate','Hover HTML','text'],['hoverClass','Hover class','text'],['snakeText','Snake text','text'],['snakeMinScale','Snake min scale','range',0.1,1,0.02],['orbitHoverScale','Orbit hover grow','range',1,2.5,0.05],['color','Color','color'],['dotSize','Dot size','range',1,30,1],['followerSize','Follower size','range',8,120,2],['smoothing','Smoothing','range',0.01,1,0.01],['hoverScale','Hover scale','range',0.5,4,0.1],['pressScale','Press scale','range',0.3,1.5,0.05],['hoverEffect','Hover effect','select',['dot','ring']],['hoverDotSize','Hover dot size','range',6,80,2],['trailCount','Trail count','range',3,16,1],['orbitRadius','Orbit radius','range',20,120,2],['orbitText','Orbit text','text'],['snakeText','Snake text','text'],['rotateText','Rotate text','text'],['mixBlendMode','Blend','select',['normal','difference','screen','multiply']]],
    textFill: [['baseColor','Base color','color'],['fillColor','Fill color','color'],['start','Start','text'],['end','End','text'],['scrub','Scrub','range',0,2,0.1]],
    reveal: [['preset','Preset','select',['fade','fade-up','fade-down','fade-left','fade-right','slide-up','slide-down','slide-left','slide-right','zoom','zoom-in','zoom-out','blur','rise','soft','flip','flip-x','flip-y','rotate','mask','wipe','clock','class']],['startAngle','Clock start (deg)','range',0,360,5],['clockDirection','Clock direction','select',['cw','ccw']],['direction','Direction','select',['up','down','left','right']],['duration','Duration','range',0.1,2.5,0.05],['delay','Delay','range',0,2,0.05],['once','Once','checkbox']],
    scrollVelocity: [['preset','Effect','select',['skew','translate','rotate','scale','combo']],['axis','Axis','select',['x','y']],['distance','Distance','range',0,180,5],['maxSkew','Max skew','range',0,24,1],['maxRotate','Max rotate','range',0,24,1],['maxScale','Max scale','range',0,0.5,0.01],['maxBlur','Max blur','range',0,12,0.25],['smoothing','Smoothing','range',0.01,0.5,0.01],['spring','Spring','checkbox'],['stiffness','Stiffness','range',20,400,5],['damping','Damping','range',1,60,1],['mass','Mass','range',0.1,4,0.1],['reverse','Reverse','checkbox']],
    stickyStack: [['preset','Mode','select',['vertical','horizontal','zindex','floating']],['align','Align','select',['center','top']],['gap','Gap','range',0,80,2],['scrub','Scrub','range',0,2,0.05],['snap','Snap','checkbox'],['effect','Floating effect','select',['depth','fade','scale','slide']],['overlap','Overlap','range',0,0.9,0.05],['previousOpacity','Previous opacity','range',0,1,0.05],['previousScale','Previous scale','range',0.5,1,0.02],['previousBlur','Previous blur','range',0,30,1],['scrollLength','Scroll length','range',20,300,5]],
    slider: [['preset','Effect','select',['slide','coverflow']],['axis','Axis','select',['x','y']],['align','Align','select',['center','left']],['loop','Loop','select',['off','infinite','rewind']],['gap','Gap','range',0,80,2],['perView','Per view','range',1,2.5,0.05],['speed','Speed','range',0.1,2,0.05],['autoplay','Autoplay (ms)','range',0,6000,250],['rotate','Rotate','range',0,70,1],['depth','Depth','range',0,400,10],['minScale','Side scale','range',0.5,1,0.02]],
    ambientMedia: [['ambientSrc','Image source','text'],['blur','Blur','range',0,100,2],['inset','Inset','range',-80,30,2],['opacity','Opacity','range',0,1,0.02],['saturation','Saturation','range',0,3,0.05],['brightness','Brightness','range',0,2,0.05],['sampleFps','Video FPS','range',2,30,1]],
    lightbox: [['preset','Viewer','select',['viewer','grouped']],['duration','Duration','range',0,1.5,0.05],['backdropOpacity','Backdrop opacity','range',0,1,0.05],['backdropBlur','Backdrop blur','range',0,40,1],['minZoom','Min zoom','range',0.25,1,0.05],['maxZoom','Max zoom','range',1,8,0.25],['zoomStep','Zoom step','range',0.1,1,0.05],['minimap','Minimap','checkbox'],['toolbar','Toolbar','checkbox'],['share','Share button','checkbox'],['exif','Show EXIF','checkbox'],['info','Info','checkbox'],['closeOnBackdrop','Close on backdrop','checkbox']],
    progress: [['ui','UI','select',['bar','ring']],['thickness','Bar thickness','range',1,14,1],['radius','Bar radius','range',0,99,1],['color2','Gradient end','color'],['size','Ring size','range',24,120,2],['stroke','Ring stroke','range',1,10,1],['showPercent','Show percent','checkbox'],['clickToTop','Click to top','checkbox'],['smoothing','Smoothing','range',0,0.9,0.05],['hideAtEnd','Hide at end','checkbox']],
    fullpage: [['duration','Duration','range',0.2,1.6,0.05],['axis','Axis','select',['y','x','mixed']],['drag','Mouse drag','checkbox'],['mode','Mode','select',['transform','snap']],['loop','Loop','checkbox'],['dots','Dots','checkbox'],['wheel','Wheel','checkbox'],['touch','Touch swipe','checkbox'],['keyboard','Keyboard','checkbox'],['threshold','Swipe threshold','range',10,80,2],['autoAdvance','Auto advance (ms)','range',0,6000,250]],
    marquee: [['direction','Direction','select',['left','right']],['skew','Scroll skew (deg)','range',0,20,1],['speed','Speed','range',10,200,5],['pauseOnHover','Pause on hover','checkbox'],['reverseOnScrollUp','Reverse on scroll','checkbox'],['scrollAcceleration','Acceleration','range',0,1.5,0.05]],
    parallax: [['axis','Axis','select',['x','y']],['speed','Speed','range',-1,1,0.05],['distance','Distance','range',-300,300,10],['scrub','Scrub','range',0,2,0.1]],
    cssScroll: [['property','CSS property','text'],['start','Start','text'],['end','End','text']],
    scrollSequence: [['fit','Fit','select',['cover','contain']],['scrollLength','Scroll length','text'],['scrub','Scrub','range',0,2,0.1],['preloadRadius','Preload radius','range',0,12,1]],
    brushReveal: [['radius','Brush radius','range',12,200,2],['softness','Softness','range',0,0.95,0.05],['fade','Heal speed','range',0.005,0.3,0.005],['persist','Persist strokes','checkbox'],['blur','Edge blur (px)','range',0,20,1],['opacity','Brush opacity','range',0.1,1,0.05]],
    blurText: [['duration','Duration','range',0.1,2.5,0.05],['stagger','Stagger','range',0,0.2,0.005],['once','Once','checkbox']]
  };

  const DEFAULTS = {
    fullpage:{duration:.75,mode:'transform',loop:false,dots:true,wheel:true,touch:true,keyboard:true,threshold:24,autoAdvance:0},
    counter:{duration:1.2,loops:2,popScale:2,popDuration:.3,stagger:.06,format:',',tile:true,tileColor:'#191b20',tileTextColor:'#f6f7fb',gap:3,seconds:true,blink:true,blinkSeparators:false,clockStyle:'roll',rollDirection:'up',rollDuration:.28,daysLabel:'d'},
    lazy:{duration:1,delay:0,blur:18,skeletonIcon:true,noise:.25,direction:'down',feather:70,pixelStart:.02,pixelEnd:1,pixelStepCount:7,stepDuration:180,holdDuration:0,minDuration:700,startScale:1.12},
    overflowText:{speed:45,delay:600,endPause:800,restartDelay:600,maskDuration:160,pageDuration:900,flipDuration:320,flipDirection:'down',gap:40,pauseOnHover:true},
    cardGlow:{radius:160,opacity:.8,blur:14,spread:0,follow:.18,sensitivity:1,alwaysOn:false,color:'#ff5b1c'},
    tilt:{max:12,sensitivity:1,smoothing:.12,perspective:1000,scale:1.02,reverse:false,reset:true,glare:true,glareOpacity:.22,glareRadius:120},
    magnetic:{strength:.45,radius:120},ripple:{duration:520,opacity:.75,scale:2.6,centered:false,unbounded:false,color:'rgba(255,255,255,.75)'},
    mouseParallax:{maxX:40,maxY:40,speed:.05,global:false},textSplit:{by:'char',animation:'wave',duration:.8,stagger:.035,delay:0},
    shuffle:{speed:34,revealRate:2},typewriter:{typeSpeed:55,eraseSpeed:30,pauseAfter:950,loop:true,caret:true,hangul:false},textReveal:{speed:65,stagger:.04,duration:.8},
    textTransition:{duration:.45,pause:1100,blur:16,startScale:.86,endScale:1.12,charMode:false,loop:true},glitch:{intensity:1.15,delay:.2,speed:1,trigger:'auto',loop:true},
    reveal:{duration:1,delay:0,once:true},scrollVelocity:{axis:'x',distance:90,maxSkew:10,maxRotate:8,maxScale:.08,maxBlur:1.5,smoothing:.1,reverse:false},
    stickyStack:{gap:20,scrub:.8,snap:true,effect:'depth',overlap:.35,previousOpacity:.12,previousScale:.9,previousBlur:8,scrollLength:90},
    slider:{loop:'infinite',gap:18,perView:1.35,speed:.55,autoplay:0,rotate:42,depth:130,minScale:.82},ambientMedia:{blur:48,inset:-28,opacity:.78,sampleInterval:700},
    lightbox:{duration:.18,backdropOpacity:.82,backdropBlur:20,radius:14,closeOnImage:false,toolbar:true,info:true,minimap:true,closeOnBackdrop:true},marquee:{direction:'left',speed:70,pauseOnHover:true,reverseOnScrollUp:true,scrollAcceleration:.35},
    parallax:{axis:'y',speed:-.18,distance:100,scrub:1},brushReveal:{radius:80,softness:.55,fade:.045,persist:false,blur:0},scrollSequence:{fit:'cover',scrollLength:'400vh',scrub:1,preloadRadius:3},blurText:{duration:.8,stagger:.025,once:true}
  };


  // Show only the options that actually do something for the current preset.
  const WHEN = {
counter: {
      loops:(o)=>['slot','digit','flip'].includes(o.preset||'slot'),
      popScale:(o)=>(o.preset)==='pop', popDuration:(o)=>(o.preset)==='pop', popAlign:(o)=>(o.preset)==='pop',
      stagger:(o)=>(o.preset||'slot')!=='plain',
      tile:(o)=>(o.preset)==='flip'||((o.preset)==='clock'&&o.clockStyle==='flip'), tileColor:(o)=>((o.preset)==='flip'||((o.preset)==='clock'&&o.clockStyle==='flip'))&&o.tile!==false, tileTextColor:(o)=>((o.preset)==='flip'||((o.preset)==='clock'&&o.clockStyle==='flip'))&&o.tile!==false, gap:(o)=>(o.preset)==='flip', seamColor:(o)=>((o.preset)==='flip'||((o.preset)==='clock'&&o.clockStyle==='flip'))&&o.tile!==false, shadow:(o)=>((o.preset)==='flip'||((o.preset)==='clock'&&o.clockStyle==='flip'))&&o.tile!==false, separatorColor:(o)=>(o.preset||'slot')!=='plain',
      to:(o)=>(o.preset||'slot')!=='clock', from:(o)=>['slot','plain'].includes(o.preset||'slot'), separator:(o)=>(o.preset||'slot')!=='clock', blinkSeparators:(o)=>!['clock','plain'].includes(o.preset||'slot'),
      duration:(o)=>(o.preset||'slot')!=='clock', locale:(o)=>(o.preset||'slot')!=='clock', prefix:(o)=>(o.preset||'slot')!=='clock', suffix:(o)=>(o.preset||'slot')!=='clock',
      seconds:(o)=>(o.preset)==='clock', hour12:(o)=>(o.preset)==='clock'&&!o.until&&!o.since, blink:(o)=>(o.preset)==='clock', clockStyle:(o)=>(o.preset)==='clock', until:(o)=>(o.preset)==='clock', since:(o)=>(o.preset)==='clock'&&!o.until, daysLabel:(o)=>(o.preset)==='clock'&&(!!o.until||!!o.since), clockSeparator:(o)=>(o.preset)==='clock', rollDuration:(o)=>(o.preset)==='clock'&&(o.clockStyle||'roll')!=='instant', rollDirection:(o)=>(o.preset)==='clock'&&(o.clockStyle||'roll')==='roll'
    },
    shuffle: { rainbowColors:(o)=>o.rainbow===true&&o.scrambleFade!==true },
    progress: {
      thickness:(o)=>(o.ui||'bar')==='bar', radius:(o)=>(o.ui||'bar')==='bar', color2:(o)=>(o.ui||'bar')==='bar',
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
      speed:(o)=>['loop','bounce','rewind','once'].includes(o.preset||'loop'),
      gap:(o)=>(o.preset||'loop')==='loop',
      endPause:(o)=>['bounce','rewind'].includes(o.preset),
      restartDelay:(o)=>['bounce','rewind','page','flip','dissolve','page-roll'].includes(o.preset),
      maskDuration:(o)=>['rewind','page'].includes(o.preset), maskDirection:(o)=>['rewind','page'].includes(o.preset),
      pageDuration:(o)=>['page','flip','dissolve','page-roll'].includes(o.preset),
      flipDuration:(o)=>(o.preset)==='flip', flipDirection:(o)=>(o.preset)==='flip',
      dissolveDuration:(o)=>(o.preset)==='dissolve', jitter:(o)=>(o.preset)==='dissolve',
      rollDuration:(o)=>['rolling','page-roll'].includes(o.preset), rollDirection:(o)=>['rolling','page-roll'].includes(o.preset),
      items:(o)=>(o.preset)==='rolling'
    },
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
      pause:(o)=>(o.preset)!=='shimmer', loop:(o)=>(o.preset)!=='shimmer'
    },
    glitch: { sliceCount:(o)=>['image','reveal'].includes(o.preset), duration:(o)=>(o.preset)==='reveal', loop:(o)=>(o.preset)!=='reveal', delay:(o)=>!['image','reveal'].includes(o.preset) },
    cardGlow: {
      radius:(o)=>['spotlight','pointer','border'].includes(o.preset||'spotlight'),
      sensitivity:(o)=>['spotlight','pointer','border'].includes(o.preset||'spotlight'),
      follow:(o)=>['spotlight','pointer','border'].includes(o.preset||'spotlight'),
      cycleDuration:(o)=>['comet','aurora','shine'].includes(o.preset),
      surfaceOpacity:(o)=>o.surface===true, surfaceColor:(o)=>o.surface===true,
      borderColor:(o)=>o.borderGlow===true||['comet','border'].includes(o.preset), borderWidth:(o)=>o.borderGlow===true||['comet','border'].includes(o.preset)
    },
    slider: {
      rotate:(o)=>(o.preset||'slide')==='coverflow', depth:(o)=>(o.preset||'slide')==='coverflow', minScale:(o)=>(o.preset||'slide')==='coverflow',
      align:(o)=>(o.preset||'slide')==='slide'
    },
    reveal: {
      direction:(o)=>['wipe','mask','slide-up','slide-down','slide-left','slide-right'].includes(o.preset||'fade-up'),
      startAngle:(o)=>(o.preset)==='clock', clockDirection:(o)=>(o.preset)==='clock'
    },
    stickyStack: {
      effect:(o)=>(o.preset)==='floating', overlap:(o)=>(o.preset)==='floating', previousOpacity:(o)=>(o.preset)==='floating',
      previousScale:(o)=>(o.preset)==='floating', previousBlur:(o)=>(o.preset)==='floating',
      gap:(o)=>(o.preset)==='horizontal', snap:(o)=>(o.preset)==='horizontal',
      scrollLength:(o)=>['floating','horizontal'].includes(o.preset)
    },
    textSplit: { hold:(o)=>o.texts!=null, swapOut:(o)=>o.texts!=null }
  };

  // Friendly Korean explanations shown in the (?) tooltip of each option.
  let HELP_LANG = 'ko';
  const HELP_SETS = (typeof window !== 'undefined' && window.MK_HELP_I18N) || { ko: {}, en: {} };
  const HELP = new Proxy({}, {
    get(_t, moduleName) {
      const lang = HELP_SETS[HELP_LANG] ? HELP_LANG : (HELP_SETS.en ? 'en' : 'ko');
      const primary = HELP_SETS[lang]?.[moduleName] || {};
      const fallback = HELP_SETS.en?.[moduleName] || HELP_SETS.ko?.[moduleName] || {};
      // Per-key fallback so a missing translation drops to English then Korean.
      return new Proxy({}, { get: (_o, key) => primary[key] ?? fallback[key] ?? HELP_SETS.ko?.[moduleName]?.[key] } );
    }
  });

  const state = { snapshots: new WeakMap(), mounted: false, timers: new WeakMap() };
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
    if (/^#[0-9a-f]{6}$/i.test(text)) return text;
    const rgb = text.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (!rgb) return fallback;
    return `#${rgb.slice(1,4).map((channel) => Number(channel).toString(16).padStart(2,'0')).join('')}`;
  };

  function capture(root = document) {
    Object.values(MODULE_ATTRIBUTES).forEach((attribute) => {
      root.querySelectorAll(`[${attribute}]`).forEach((element) => {
        if (!state.snapshots.has(element)) state.snapshots.set(element, element.cloneNode(true));
      });
    });
  }

  function descriptorOptions(descriptor) {
    if (descriptor.kind === 'loader' || descriptor.kind === 'pageReveal') return { ...descriptor.options };
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
    const options = (descriptor.kind === 'loader' || descriptor.kind === 'pageReveal') ? descriptor.options : descriptorOptions(descriptor);
    if (descriptor.kind === 'loader' && key === 'preset') return options.type;
    if (Object.prototype.hasOwnProperty.call(options, key)) return options[key];
    return DEFAULTS[descriptor.module]?.[key] ?? (FIELDS[descriptor.module]?.find((field) => field[0] === key)?.[2] === 'checkbox' ? false : '');
  }

  function discover(host) {
    const candidates = [host, ...host.querySelectorAll('*')];
    const found = [];
    Object.entries(MODULE_ATTRIBUTES).forEach(([module, attribute]) => {
      const targets = candidates.filter((element) => element.hasAttribute?.(attribute));
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
    const activation = MODULE_ATTRIBUTES[descriptor.module];
    const attribute = key === 'preset' ? activation : `data-kt-${dash(key)}`;
    descriptor.targets.forEach((target) => {
      if (type === 'checkbox') target.setAttribute(attribute, value ? 'true' : 'false');
      else if (value === '' || value == null) target.removeAttribute(attribute);
      else target.setAttribute(attribute, String(value));
    });
  }

  function syncVisibility(host, descriptors) {
    const panel = host.querySelector(':scope > .kt-playground');
    const body = panel?.__mkBody || panel;
    if (!body) return;
    descriptors.forEach((descriptor) => {
      // Special panels (loader/pageReveal) manage their own fields.
      if (descriptor.kind === 'loader' || descriptor.kind === 'pageReveal') return;
      const currentOptions = { ...(DEFAULTS[descriptor.module] || {}), ...descriptorOptions(descriptor) };
      body.querySelectorAll(`[data-module="${descriptor.module}"][data-key]`).forEach((field) => {
        const rule = WHEN[descriptor.module]?.[field.dataset.key];
        let show = true;
        try { show = !rule || rule(currentOptions); } catch (_e) { show = true; }
        field.hidden = !show;
      });
    });
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
      MK.destroyModule(target, descriptor.module);
      try {
        MK.create(descriptor.module, target, descriptorOptions({ ...descriptor, targets: [target] }));
      } catch (_e) {
        const snapshot = state.snapshots.get(target);
        if (snapshot) { restoreElement(target); MK.create(descriptor.module, target, descriptorOptions({ ...descriptor, targets: [target] })); }
      }
    });
  }

  function apply(host, descriptors, status, message = 'Applied') {
    const MK = window.Kineto;
    descriptors.forEach((descriptor) => {
      if (descriptor.kind === 'pageReveal') runPageRevealDescriptor(descriptor);
    });
    const live = descriptors.filter((d) => d.kind !== 'pageReveal' && d.kind !== 'loader');
    // Tear all down, then recreate inner modules before their containers.
    live.forEach((d) => d.targets.forEach((t) => MK.destroyModule(t, d.module)));
    const ordered = live.slice().sort((a, b) => (CREATE_ORDER[a.module] ?? 2) - (CREATE_ORDER[b.module] ?? 2));
    ordered.forEach((descriptor) => {
      descriptor.targets.forEach((target) => {
        try {
          MK.create(descriptor.module, target, descriptorOptions({ ...descriptor, targets: [target] }));
        } catch (_e) {
          const snapshot = state.snapshots.get(target);
          if (snapshot) { restoreElement(target); MK.create(descriptor.module, target, descriptorOptions({ ...descriptor, targets: [target] })); }
          status.textContent = '이 옵션 조합은 이 타입에서 지원되지 않아 기본값으로 되돌렸습니다';
        }
      });
    });
    MK.refresh?.();
    updateCode(host, descriptors);
    status.textContent = `${message} · active instances ${MK.instanceCount}`;
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
    descriptors.forEach((descriptor) => descriptor.targets.forEach((target) => MK.replay(target, descriptor.module, descriptorOptions({ ...descriptor, targets: [target] }))));
    MK.refresh?.();
    status.textContent = `Replayed · active instances ${MK.instanceCount}`;
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
    MK.refresh?.();
  }

  function runLoader(descriptor, status) {
    const options = { ...descriptor.options };
    const overlay = document.createElement('div');
    overlay.className = 'kt-demo-loader-overlay';
    overlay.dataset.loaderType = options.type || 'slot';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:10010;background:var(--bg);color:var(--text);';
    document.body.appendChild(overlay);
    let instance;
    instance = window.Kineto.loader(overlay, { ...options, onComplete: () => { instance?.destroy(); overlay.remove(); } });
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
    const html = descriptor.targets.map((target) => {
      const clean = state.snapshots.get(target)?.cloneNode(true) || target.cloneNode(true);
      const activation = MODULE_ATTRIBUTES[descriptor.module];
      Array.from(target.attributes).filter((attribute) => attribute.name.startsWith('data-kt-') && attribute.name !== 'data-kt-note').forEach((attribute) => clean.setAttribute(attribute.name, attribute.value));
      if (activation && target.hasAttribute(activation)) clean.setAttribute(activation, target.getAttribute(activation));
      return clean.outerHTML;
    }).join('\n');
    const options = descriptorOptions(descriptor);
    const target = descriptor.targets[0];
    const selector = target?.id
      ? `#${target.id}`
      : (target?.classList?.length ? `.${target.classList[0]}` : `[${MODULE_ATTRIBUTES[descriptor.module]}]`);
    const js = `// data-kt-* 속성 없이 JS만으로도 동일하게 적용됩니다.\n// 셀렉터 문자열(#id / .class)이나 요소를 그대로 전달하세요.\nconst instance = Kineto.${descriptor.module}('${selector}', ${JSON.stringify(options, null, 2)});\n// 같은 API: Kineto.${descriptor.module}(document.querySelector('${selector}'), options)`;
    return { html, js };
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
    const active = (panel.__mkBody || panel).querySelector('.kt-playground__tab.is-active')?.dataset.codeTab || 'html';
    const code = (panel.__mkBody || panel).querySelector('.kt-playground__pre code');
    if (code) code.innerHTML = escapeHtml(active === 'html' ? source.html : source.js);
  }

  function createField(descriptor, definition, host, descriptors, status) {
    const [key, label, type, a, b, c] = definition;
    const wrapper = document.createElement('label');
    wrapper.className = `kt-playground__field${type === 'checkbox' ? ' kt-playground__check' : ''}`;
    const caption = document.createElement('span');
    caption.textContent = label;
    const tip = HELP[descriptor.module]?.[key];
    if (tip) {
      const help = document.createElement('button');
      help.type = 'button';
      help.className = 'kt-help';
      help.setAttribute('aria-label', `${label} 설명`);
      help.dataset.tip = tip;
      help.textContent = '?';
      caption.appendChild(help);
      wrapper.dataset.tip = tip;
    }
    let input;
    if (type === 'select') {
      input = document.createElement('select');
      a.forEach((choice) => {
        const option = document.createElement('option'); option.value = choice; option.textContent = choice || 'none'; input.appendChild(option);
      });
    } else {
      input = document.createElement('input'); input.type = type;
      if (type === 'range') { input.min = a; input.max = b; input.step = c; }
    }
    input.dataset.option = key;
    input.dataset.module = descriptor.module;
    const value = optionValue(descriptor, key);
    if (type === 'checkbox') input.checked = Boolean(value);
    else if (type === 'color') input.value = normalizeColor(value);
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
        if (descriptor.kind === 'loader' || descriptor.kind === 'pageReveal') {
          apply(host, descriptors, status);
        } else {
          rebuildModule(descriptor);
          window.Kineto.refresh?.();
          updateCode(host, descriptors);
          status.textContent = `Applied · active instances ${window.Kineto.instanceCount}`;
        }
      }, type === 'range' ? 80 : 0));
    };
    input.addEventListener(type === 'range' ? 'input' : 'change', () => {
      const next = type === 'checkbox' ? input.checked : input.value;
      if (showValue) valueLabel.textContent = type === 'checkbox' ? (input.checked ? 'on' : 'off') : input.value;
      if (descriptor.kind === 'loader' || descriptor.kind === 'pageReveal') descriptor.options[descriptor.kind === 'loader' && key === 'preset' ? 'type' : key] = type === 'checkbox' ? next : (type === 'number' || type === 'range' ? Number(next) : next);
      else setOption(descriptor, key, next, type);
      updateCode(host, descriptors);
      schedule();
      // No panel rebuild on option changes — field visibility syncs in
      // place, so the drawer never flickers.
      syncVisibility(host, descriptors);
    });
    if (type === 'checkbox') { wrapper.append(input, caption, valueLabel); }
    else { wrapper.append(caption, input, valueLabel); }
    return wrapper;
  }

  function panelFor(host, descriptors) {
    const details = document.createElement('details');
    details.className = 'kt-playground';
    const summary = document.createElement('summary');
    const moduleNames = descriptors.map((item) => item.module === 'loader' ? 'Loader' : labelize(item.module)).join(' + ');
    summary.innerHTML = `<span class="kt-playground__summary-copy">Customize & copy code</span><span class="kt-playground__summary-name">${escapeHtml(moduleNames)}</span>`;
    // Dogfood: if the module name is wider than its slot, Kineto's own
    // overflowText scrolls it (bounce, pause on hover) instead of truncating —
    // also covers longer translated strings.
    requestAnimationFrame(() => {
      const nameEl = summary.querySelector('.kt-playground__summary-name');
      if (nameEl && nameEl.scrollWidth > nameEl.clientWidth + 2) {
        window.Kineto?.overflowText?.(nameEl, { mode: 'bounce', speed: 34, delay: 900, endPause: 900, pauseOnHover: true });
      }
    });
    const body = document.createElement('div'); body.className = 'kt-playground__body';
    const groups = document.createElement('div'); groups.className = 'kt-playground__groups';
    const status = document.createElement('div'); status.className = 'kt-playground__status'; status.setAttribute('aria-live','polite');

    descriptors.forEach((descriptor) => {
      const fieldset = document.createElement('fieldset'); fieldset.className = 'kt-playground__group';
      const legend = document.createElement('legend'); legend.className = 'kt-playground__legend'; legend.textContent = descriptor.module === 'loader' ? 'Loader' : labelize(descriptor.module);
      const controls = document.createElement('div'); controls.className = 'kt-playground__controls';
      const currentOptions = descriptor.kind === 'loader' ? { preset: descriptor.options.type, ...descriptor.options } : { ...(DEFAULTS[descriptor.module] || {}), ...descriptorOptions(descriptor) };
      const definitions = descriptor.kind === 'pageReveal' ? [
        ['effect','Effect','select',['curtain','split','circle','wipe','blinds','diagonal','checker','strips','shutter','fade']],['direction','Direction','select',['up','down','left','right']],['duration','Duration','range',0.2,2,0.05],['delay','Delay','range',0,1,0.05],['color','Color','color'],['color2','Color 2','color'],['count','Pieces','range',3,14,1],['stagger','Stagger','range',0,0.2,0.005],['angle','Diagonal angle','range',-45,45,1]
      ] : descriptor.kind === 'loader' ? [
        ['preset','Type','select',['slot','circular','bar']],['minDuration','Minimum (ms)','range',300,4000,100],['duration','Exit duration','range',0.1,1.5,0.05],
        ['color','Color','color'],['trackColor','Track color','color'],['size','Circle size','range',48,220,4],['stroke','Stroke','range',2,18,1],
        ['showPercent','Show percent','checkbox'],['barWidth','Bar width','range',120,620,10],['barHeight','Bar height','range',2,24,1],['label','Label','text'],['fill','Background fill','select',['','up','down','left','right']],['fillColor','Fill color','color'],['labelColor','Text color','color'],['labelBlend','Text blend','select',['','difference','exclusion','screen','overlay']],['exit','Exit','select',['fade','slide','wipe']],['exitDirection','Exit direction','select',['','up','down','left','right']]
      ] : (FIELDS[descriptor.module] || []);
      definitions.forEach((definition) => {
        const field = createField(descriptor, definition, host, descriptors, status);
        field.dataset.module = descriptor.module;
        field.dataset.key = definition[0];
        const rule = WHEN[descriptor.module]?.[definition[0]];
        try { field.hidden = !!rule && !rule(currentOptions); } catch (_e) { field.hidden = false; }
        controls.appendChild(field);
      });
      fieldset.append(legend, controls); groups.appendChild(fieldset);
    });

    const toolbar = document.createElement('div'); toolbar.className = 'kt-playground__toolbar';
    const replayButton = document.createElement('button'); replayButton.type = 'button'; replayButton.className = 'is-primary'; replayButton.textContent = descriptors.some((item) => item.kind === 'loader') ? 'Run' : 'Replay';
    const applyButton = document.createElement('button'); applyButton.type = 'button'; applyButton.textContent = 'Apply';
    const resetButton = document.createElement('button'); resetButton.type = 'button'; resetButton.textContent = 'Reset';
    replayButton.addEventListener('click', () => { replay(host, descriptors, status); window.ktToast?.('다시 재생했습니다'); });
    applyButton.addEventListener('click', () => { apply(host, descriptors, status); try { if (matchMedia('(pointer:coarse)').matches && navigator.vibrate) navigator.vibrate([14, 40, 26]); } catch (_) {} window.ktToast?.('설정을 적용했습니다'); });
    resetButton.addEventListener('click', () => { reset(host, descriptors); window.ktToast?.('기본값으로 되돌렸습니다'); });
    toolbar.append(replayButton, applyButton, resetButton);

    const codeWrap = document.createElement('div'); codeWrap.className = 'kt-playground__code';
    codeWrap.innerHTML = `<div class="kt-playground__code-head"><div class="kt-playground__tabs"><button type="button" class="kt-playground__tab is-active" data-code-tab="html">HTML</button><button type="button" class="kt-playground__tab" data-code-tab="js">JS</button></div><button type="button" class="kt-playground__copy">Copy</button></div><pre class="kt-playground__pre"><code></code></pre>`;
    codeWrap.querySelectorAll('[data-code-tab]').forEach((tab) => tab.addEventListener('click', () => {
      codeWrap.querySelectorAll('[data-code-tab]').forEach((item) => item.classList.toggle('is-active', item === tab));
      updateCode(host, descriptors);
    }));
    codeWrap.querySelector('.kt-playground__copy').addEventListener('click', async (event) => {
      const copyButton = event.currentTarget;
      const active = codeWrap.querySelector('.kt-playground__tab.is-active').dataset.codeTab;
      const text = details.dataset[active === 'html' ? 'htmlCode' : 'jsCode'] || '';
      try {
        await navigator.clipboard.writeText(text);
      } catch (_error) {
        const textarea = document.createElement('textarea'); textarea.value = text; document.body.appendChild(textarea); textarea.select(); document.execCommand('copy'); textarea.remove();
      }
      copyButton.textContent = 'Copied'; status.textContent = `${active.toUpperCase()} copied`;
      window.ktToast?.('복사되었습니다');
      setTimeout(() => { copyButton.textContent = 'Copy'; }, 1000);
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
    drawerSub.textContent = '옵션을 바꾸면 위 예제에 바로 반영됩니다';
    headText.append(drawerTitle, drawerSub);
    const headActions = document.createElement('div');
    headActions.className = 'kt-playground__head-actions';
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'kt-playground__close';
    closeButton.setAttribute('aria-label', '옵션 닫기');
    closeButton.innerHTML = '<i class="ph-bold ph-x" aria-hidden="true"></i>';
    closeButton.addEventListener('click', () => { details.open = false; });
    // Move Replay/Apply/Reset up into the head so the actions are always visible.
    headActions.append(toolbar, closeButton);
    drawerHead.append(headText, headActions);

    // Collapsible code preview.
    const codeSection = document.createElement('details');
    codeSection.className = 'kt-playground__codebox';
    const codeSummary = document.createElement('summary');
    codeSummary.innerHTML = '<i class="ph-bold ph-code" aria-hidden="true"></i> 코드 보기 · 복사';
    codeSection.append(codeSummary, codeWrap);

    details.__mkBody = body;
    body.__mkOwner = details;
    body.classList.add('is-portal');
    body.hidden = true;
    body.append(groups, codeSection, status);
    // Long, module-specific notes (data-kt-note) sit just under the head.
    const noteText = descriptors.map((d) => d.targets?.[0]?.getAttribute?.('data-kt-note')).find(Boolean);
    if (noteText) {
      const note = document.createElement('p');
      note.className = 'kt-playground__note';
      note.textContent = noteText;
      body.prepend(note);
    }
    body.prepend(drawerHead);
    const drawer = drawerRoot();
    drawer.sheet.appendChild(body);
    details.append(summary);
    details.addEventListener('toggle', () => {
      if (details.open) {
        document.querySelectorAll('.kt-playground[open]').forEach((other) => { if (other !== details) other.open = false; });
        drawer.show(body, moduleNames, details);
      } else if (drawer.current === body) {
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
    sheet.className = 'kt-drawer-sheet';
    document.body.append(backdrop, sheet);
    const api = {
      sheet, backdrop, current: null, spotlit: null,
      show(body, _title, owner) {
        Array.from(sheet.children).forEach((child) => { child.hidden = child !== body; });
        body.hidden = false;
        api.current = body;
        // Spotlight the owning card above the dim so its demo stays crisp.
        const card = owner?.closest?.('.card')
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
      }
    };
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
    previous?.__mkBody?.remove();
    previous?.remove();
    const panel = panelFor(host, descriptors);
    if (wasOpen) panel.open = true;
    host.appendChild(panel);
    updateCode(host, descriptors);
    if (message) (panel.__mkBody || panel).querySelector('.kt-playground__status').textContent = message;
  }

  function mountHost(host, descriptors) {
    if (!descriptors.length || host.dataset.playgroundMounted === 'true') return;
    let controlHost = host;
    if (!host.classList.contains('card') && !host.classList.contains('kt-playground-host')) {
      controlHost = document.createElement('div');
      controlHost.className = 'kt-playground-host';
      host.insertAdjacentElement('afterend', controlHost);
    }
    controlHost.dataset.playgroundMounted = 'true';
    rebuildPanel(controlHost, descriptors);
  }

  function mount(root = document) {
    if (state.mounted) return;
    state.mounted = true;
    // Replay as a floating icon on the stage's bottom-left corner.
    root.querySelectorAll('.card [data-action="replay-parent"], .card [data-action="replay"]').forEach((button) => {
      const card = button.closest('.card');
      const stage = card?.querySelector('.demo-stage, .reveal-demo-card');
      if (!stage) return;
      const row = button.closest('.replay-row');
      button.classList.remove('btn');
      button.classList.add('replay-fab');
      button.innerHTML = '<i class="ph-bold ph-arrow-counter-clockwise" aria-hidden="true"></i>';
      button.setAttribute('aria-label', 'Replay');
      button.title = 'Replay';
      stage.appendChild(button);
      if (row && !row.children.length) row.remove();
    });
    root.querySelectorAll('.card').forEach((card) => {
      let descriptors = discover(card);
      const loaderButton = card.querySelector('[data-loader-type]');
      if (loaderButton) {
        const type = loaderButton.dataset.loaderType;
        const options = { type, minDuration: 1100, duration: .45, color: '#ff5b1c', trackColor: '#dfe3ea', size: 104, stroke: 8, showPercent: true, barWidth: 320, barHeight: 8, label: type === 'bar' ? 'Loading assets' : '', ...(type === 'slot' ? { fill: 'up', fillColor: '#ff5b1c', labelColor: '#ffffff', labelBlend: 'difference', exit: 'wipe' } : {}) };
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

    root.querySelectorAll('[data-kt-sticky-stack],[data-kt-marquee],[data-kt-scroll-sequence]').forEach((element) => {
      if (element.closest('.card') || element.nextElementSibling?.classList.contains('kt-playground-host')) return;
      mountHost(element, discover(element));
    });

  }

  window.KinetoPlayground = {
    setHelpLang(lang){ HELP_LANG = lang; },
    // Re-point every already-rendered tooltip to the current language.
    refreshHelp(){
      document.querySelectorAll('.kt-playground__field[data-module][data-key]').forEach((field) => {
        const tip = HELP[field.dataset.module]?.[field.dataset.key];
        if (tip == null) return;
        field.dataset.tip = tip;
        const help = field.querySelector('.kt-help');
        if (help) { help.dataset.tip = tip; help.setAttribute('aria-label', tip); }
      });
    }, capture, mount, updateCode, publicOptions: PUBLIC_OPTIONS };
})();
