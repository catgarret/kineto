// Kineto demo behavior — split from index.html (styles in styles.css)
    // If the bundle failed to load/parse (e.g. an engine-specific issue), don't
    // let the whole page stay hidden behind the kt-preload veil — reveal it.
    if(typeof Kineto==='undefined'){
      document.documentElement.classList.remove('kt-preload');
      throw new Error('Kineto failed to load');
    }
    try{ Kineto.config({smooth:false}); }catch(_){}
    KinetoPlayground.capture(document);
    // Deterministic startup: every effect waits for the FULL page load
    // (window 'load'), covered by a slot intro loader — so the entrance
    // choreography plays in the intended order on any connection speed.
    (()=>{
      const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
      let started=false;
      const startModules=()=>{ if(started)return; started=true; try{Kineto.init(document);}catch(_){}
        document.documentElement.classList.remove('kt-preload');
        // Restore a bookmarked #hash once modules are up: the intro locks scroll
        // and lazy images / reveals shift layout, so the browser's initial jump
        // lands in the wrong place. Re-scroll a few times as things settle, and
        // bail the moment the visitor scrolls themselves.
        const hash=location.hash;
        if(hash&&hash.length>1){
          let cancelled=false;
          const stop=()=>{cancelled=true;};
          const jump=()=>{ if(cancelled)return; let t=null; try{t=document.querySelector(hash);}catch(_){} if(t)t.scrollIntoView(); };
          window.addEventListener('wheel',stop,{passive:true,once:true});
          window.addEventListener('touchmove',stop,{passive:true,once:true});
          requestAnimationFrame(jump); setTimeout(jump,260); setTimeout(jump,800);
        }
      };
      // Reduced motion: no intro, just wait for load (or start now if done).
      if(reduced){
        if(document.readyState==='complete')startModules();
        else window.addEventListener('load',startModules,{once:true});
        return;
      }
      const overlay=document.createElement('div');
      overlay.className='intro-loader';
      // Light brand canvas so the black percentage reads before + during the fill.
      overlay.style.cssText='position:fixed;inset:0;z-index:10020;background:#efe9de;color:#14110d;';
      const wordmark=document.createElement('span');
      wordmark.className='kt-loader-wordmark';
      wordmark.textContent='Kineto';
      overlay.appendChild(wordmark);
      document.body.appendChild(overlay);
      // Lock scrolling at the root while the intro is up: otherwise the page
      // scrolls behind the overlay and lazy images loading in shift the layout,
      // so releasing the intro leaves the scroll position jumping around.
      const introScrollLock = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      // Match the iOS status-bar / home-bar tint to the intro canvas so the notch
      // and home-bar areas blend with the loader while it fills.
      const introTcMeta = document.getElementById('theme-color-meta');
      introTcMeta?.setAttribute('content', '#efe9de');
      // Fast/file loads can already be complete when this script runs —
      // resolve immediately then, otherwise the loader would never finish
      // (and skipping it entirely meant no intro at all).
      const pageLoaded=document.readyState==='complete'
        ? Promise.resolve()
        : new Promise(resolve=>window.addEventListener('load',resolve,{once:true}));
      let finished=false;
      const finishIntro=()=>{ if(finished)return; finished=true; if(overlay.parentNode)overlay.remove(); document.documentElement.style.overflow=introScrollLock; introTcMeta?.setAttribute('content', getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()||'#0d0e12'); startModules(); };
      try{
        Kineto.loader(overlay,{
          type:'slot',
          promise:pageLoaded,
          minDuration:1100,
          duration:.45,
          color:'#ff5b1c',
          trackColor:'#dfe3ea',
          size:104,
          stroke:8,
          showPercent:true,
          barWidth:320,
          barHeight:8,
          label:'',
          fill:'up',
          fillColor:'#ff5b1c',
          labelColor:'#14110d',
          exit:'wipe',
          onComplete:finishIntro
        });
      }catch(_){ finishIntro(); }
      // Failsafe: never let the intro trap the page. Some engines (notably
      // WebKit/Safari) can drop the exit animation's transitionend/animationend,
      // so onComplete would never fire and the overlay would sit there forever.
      pageLoaded.then(()=>setTimeout(finishIntro,2200));
      setTimeout(finishIntro,9000); // absolute backstop regardless of load
    })();
    const MODULE_GROUPS={
      'Text':['textSplit','blurText','shuffle','typewriter','textReveal','textTransition','textFill','overflowText','glitch','counter'],
      'Media':['lazy','lightbox','slider','ambientMedia','brushReveal','scrollSequence','marquee'],
      'Scroll':['parallax','reveal','stickyStack','scrollVelocity','cssScroll','progress','fullpage'],
      'Pointer':['cursor','tilt','cardGlow','magnetic','ripple','vibrate','mouseParallax'],
      'System':['loader','pageReveal','pageTransition']
    };
    const registered=new Set(Object.keys(Kineto.registry));
    document.getElementById('module-list').innerHTML=Object.entries(MODULE_GROUPS).map(([group,names])=>{
      const chips=names.filter(name=>registered.has(name)).map(name=>`<span role="link" tabindex="0" data-module="${name}" title="데모로 이동">${name}</span>`).join('');
      return `<div class="module-group"><p class="module-group-label">${group}</p><div class="module-group-chips">${chips}</div></div>`;
    }).join('');
    // Module Index 뱃지 → 해당 모듈 데모 섹션으로 스크롤
    document.getElementById('module-list').addEventListener('click',(event)=>{
      const chip=event.target.closest('[data-module]');
      if(!chip)return;
      const attr='data-kt-'+chip.dataset.module.replace(/[A-Z]/g,m=>'-'+m.toLowerCase());
      const section=[...document.querySelectorAll('['+attr+']')].map(el=>el.closest('section[id]')).find(Boolean);
      section?.scrollIntoView({behavior:'smooth',block:'start'});
    });
    document.getElementById('module-list').addEventListener('keydown',(event)=>{
      if(event.key==='Enter'||event.key===' '){
        const chip=event.target.closest('[data-module]');
        if(chip){event.preventDefault();chip.click();}
      }
    });
    (()=>{const themeButton=document.getElementById('theme');
    const themeColorMeta=document.getElementById('theme-color-meta');
    const syncThemeColor=()=>{ if(!themeColorMeta)return; const bg=getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(); if(bg) themeColorMeta.setAttribute('content',bg); };
    const syncTheme=()=>{themeButton.setAttribute('aria-checked',document.documentElement.classList.contains('light')?'true':'false');syncThemeColor();};
    syncTheme();
    themeButton.addEventListener('click',()=>{const light=document.documentElement.classList.toggle('light');syncTheme();try{localStorage.setItem('kt-theme',light?'light':'dark')}catch(_){}});})();

    // (iOS motion-permission button removed — the library's built-in gate now
    // grants DeviceOrientation on the first genuine tap, so tilt + compass work
    // without an explicit button.)

    // Pointer-only demos (custom cursors, magnetic hover) can't be experienced on
    // touch — dim their stage and explain, instead of showing a dead example.
    (()=>{
      if(!window.matchMedia||!window.matchMedia('(hover:none)').matches)return;
      const msg='마우스 환경에서 확인할 수 있는 예제입니다.\n모바일에서는 동작을 보기 어려워요.';
      const seen=new Set();
      ['[data-kt-cursor]','[data-kt-magnetic]'].forEach(sel=>document.querySelectorAll(sel).forEach(node=>{
        const stage=node.closest('.demo-stage');
        if(!stage||seen.has(stage))return; seen.add(stage);
        stage.classList.add('mk-na');
        const ov=document.createElement('div'); ov.className='mk-na-overlay'; ov.textContent=msg;
        stage.appendChild(ov);
      }));
    })();

    document.addEventListener('click',(event)=>{
      const button=event.target.closest('[data-action]');
      if(!button)return;
      if(button.dataset.action==='replay'){
        const el=document.querySelector(button.dataset.target); if(el) Kineto.replay(el,button.dataset.module);
      }
      if(button.dataset.action==='replay-parent'){
        const card=button.closest('.card'); const el=card?.querySelector(`[data-kt-${button.dataset.module.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())}]`); if(el) Kineto.replay(el,button.dataset.module);
      }
    });

    const runPageReveal=(effect='curtain')=>{
      // pageReveal instances are one-shot: drop the previous record first so
      // every button press runs a fresh reveal.
      Kineto.destroyModule(document.body,'pageReveal');
      const panelOptions=window.KinetoPlayground?.pageRevealOptions?.()||{duration:.65,color:getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#ff5b1c',color2:'#101318'};
      Kineto.pageReveal(document.body,{...panelOptions,effect});
    };
    document.getElementById('page-reveal-demo')?.addEventListener('click',()=>runPageReveal('curtain'));
    document.querySelectorAll('[data-page-effect]').forEach(button=>button.addEventListener('click',()=>runPageReveal(button.dataset.pageEffect)));

    const runLoader=(type='slot')=>{
      const overlay=document.createElement('div');
      overlay.className='kt-demo-loader-overlay';
      overlay.dataset.loaderType=type;
      overlay.style.cssText='position:fixed;inset:0;z-index:10010;background:var(--bg);color:var(--text);';
      document.body.appendChild(overlay);
      let instance;
      instance=Kineto.loader(overlay,{type,minDuration:1100,duration:.45,label:type==='bar'?'Loading assets':'',onComplete:()=>{instance?.destroy();overlay.remove();}});
    };
    document.getElementById('loader-demo')?.addEventListener('click',()=>runLoader('circular'));
    document.getElementById('smooth-on')?.addEventListener('click',()=>Kineto.enableSmooth({duration:1.05}));
    document.getElementById('smooth-off')?.addEventListener('click',()=>Kineto.disableSmooth());
    document.querySelectorAll('[data-slider-action]').forEach(button=>button.addEventListener('click',()=>{
      const slider=button.closest('.card').querySelector('[data-kt-slider]');
      const instance=Kineto.getInstance(slider,'slider');
      instance?.[button.dataset.sliderAction]?.();
    }));


    // In-page anchors: scroll via JS + replaceState so the browser never arms
    // fragment re-anchoring (which kept snapping the page back to the target).
    document.addEventListener('click',(event)=>{
      const link=event.target.closest('a[href^="#"]');
      if(!link)return;
      const target=document.getElementById(link.getAttribute('href').slice(1));
      if(!target)return;
      event.preventDefault();
      target.scrollIntoView({behavior:'smooth',block:'start'});
      try{history.replaceState(null,'',link.getAttribute('href'));}catch(_){/* about:blank/file 환경 대비 */}
    });

    // Language: KO (default) / EN — section copy, hero and notice.
    (()=>{
      const select=document.getElementById('lang');
      if(!select)return;
      const LANGS={"en": {"counter": "Five ways to present a number.<br>Pop drops the finished digits into place, one by one, without counting up.", "loading": "Full-screen loading treatments wired to real progress — manual updates, promises, streamed fetch.<br>Restyle everything with CSS classes and variables, or replace the whole UI via renderUI.", "lazy": "Transitions that play while an image loads.<br>Animated images — GIF · WebP · APNG — keep playing throughout.", "overflow-text": "Eight modes for text longer than its container.<br>Every timing — travel, transition, hold — is an option.", "pointer": "Pointer-following light and 3D tilt.<br>Layer surface reflections, edge beams and halos however you like.", "buttons-feedback": "Feedback modules that react to pointer and input.<br>Magnetic, Ripple, Vibration, Mouse Parallax and Compass live here.", "text-effects": "Modules that set typography in motion.<br>Any card can be replayed from its first frame.", "content-reveal": "Stage the moment content enters the screen.<br>Directional slides, masks, even a clock wipe — all presets.", "scroll-effects": "React to scroll direction, velocity and progress.<br>Pinning, horizontal scroll, image sequences and fullpage snapping are gathered here.", "media-ui": "Viewer, slider, ambient light and interactive masks.<br>Several modules can share a single image.", "cursor-smooth": "Eleven cursor presets.<br>Scope them to any region — they switch themselves off on touch devices.", "module-index": "The 34 public modules locked in the distribution contract.", "_hero": ["34 motion modules on one page.", "Tune each card’s options and take the result as HTML/JS code."], "_chips": [["Drop-in install", "Works from a single script tag.\nGSAP · Lenis are picked up automatically when present."], ["Legacy-browser safe", "On unsupported browsers or low-end devices,\neffects switch off and content stays intact."], ["Reduced-motion aware", "With the OS reduce-motion setting on,\nevery module renders its final state without animation."], ["Mobile & touch ready", "Touch swipe, pinch zoom, even gyro —\nit all works the same on mobile."], ["Standards & a11y", "Semantic markup and ARIA throughout;\nremoving a module restores the original DOM."]], "_support": "Core runs standalone", "_footerBrand": "Drop it into your HTML and it just moves.<br>Pick as many of the 34 modules as you need; on old or unsupported browsers it simply stays off."}, "ja": {"counter": "数値を見せる5つの方式。<br>Popはカウントアップせず、完成した数字を一桁ずつ着地させます。", "loading": "実際の進捗とつながる全画面ローディング。手動更新、Promise、ストリーミングfetchに対応。<br>CSSクラスと変数で自由に再スタイルでき、renderUIでUIごと差し替えられます。", "lazy": "画像の読み込み中に再生されるトランジション。<br>GIF · WebP · APNGなどのアニメーション画像も止まりません。", "overflow-text": "コンテナより長いテキストを扱う8つのモード。<br>移動・切替・待機のタイミングはすべてオプションです。", "pointer": "ポインターを追う光と3Dチルト。<br>表面反射、エッジビーム、ハローを自由に重ねられます。", "buttons-feedback": "ポインターと入力に反応するフィードバックモジュール。<br>Magnetic、Ripple、Vibration、Mouse Parallax、Compassがここに。", "text-effects": "タイポグラフィを動かすモジュール群。<br>どのカードも最初のフレームから再生し直せます。", "content-reveal": "コンテンツが画面に入る瞬間を演出。<br>方向スライドからマスク、時計ワイプまでプリセットで選べます。", "scroll-effects": "スクロールの方向・速度・進捗に反応。<br>ピン留め、横スクロール、画像シーケンス、フルページスナップもここに。", "media-ui": "ビューア、スライダー、アンビエントライト、インタラクティブマスク。<br>1枚の画像に複数モジュールを重ねられます。", "cursor-smooth": "11種のカーソルプリセット。<br>領域ごとに適用でき、タッチ端末では自動でオフになります。", "module-index": "配布契約でロックされた34の公開モジュール。", "_hero": ["34のモーションモジュールを1ページで。", "カードのオプションを調整し、完成した設定をHTML/JSコードとして持ち帰れます。"], "_chips": [["簡単導入", "scriptタグ1つでそのまま動作します。\nGSAP · Lenisがあれば自動で検出して活用します。"], ["旧ブラウザ配慮", "未対応ブラウザや低スペック端末では効果だけがオフになり、\nコンテンツはそのまま表示されます。"], ["モーション軽減対応", "OSの「視差効果を減らす」設定をオンにすると、\n全モジュールがアニメーションなしで最終状態を表示します。"], ["モバイル・タッチ対応", "タッチスワイプ・ピンチズーム・ジャイロまで、\nモバイルでも同じように動きます。"], ["Web標準・A11y準拠", "セマンティックなマークアップとARIAを守り、\nモジュールを外すと元のDOMに復元されます。"]], "_support": "コアは単体で動作", "_footerBrand": "HTMLに貼るだけで動くWebモーションライブラリ。<br>34モジュールを必要な分だけ選べ、低スペックや未対応の環境では自動的に動きません。"}, "zh-CN": {"counter": "呈现数字的五种方式。<br>Pop 不做递增计数，而是让完成的数字逐位落定。", "loading": "与真实进度相连的全屏加载效果——手动更新、Promise、流式 fetch。<br>可用 CSS 类与变量重新定义样式，或通过 renderUI 整体替换界面。", "lazy": "图片加载过程中播放的过渡效果。<br>GIF · WebP · APNG 等动图全程不中断。", "overflow-text": "处理超出容器文本的八种模式。<br>移动、切换、停留的每个时间点都是可配置项。", "pointer": "跟随指针的光效与 3D 倾斜。<br>表面反射、边缘光束、光晕可任意叠加。", "buttons-feedback": "响应指针与输入的反馈模块。<br>Magnetic、Ripple、Vibration、Mouse Parallax 与 Compass 都在这里。", "text-effects": "让文字动起来的模块。<br>每张卡片都能从第一帧重新播放。", "content-reveal": "为内容进入画面的瞬间做演出。<br>方向滑入、遮罩、甚至时钟擦除——全部是预设。", "scroll-effects": "响应滚动的方向、速度与进度。<br>固定、横向滚动、图像序列与整页吸附都在这一节。", "media-ui": "查看器、轮播、环境光与交互式遮罩。<br>多个模块可以共用同一张图片。", "cursor-smooth": "11 种光标预设。<br>可按区域启用，在触屏设备上自动关闭。", "module-index": "由分发契约锁定的 34 个公开模块。", "_hero": ["一个页面演示 34 个动效模块。", "调整每张卡片的选项，把完成的配置以 HTML/JS 代码带走。"], "_chips": [["一行接入", "一个 script 标签即可运行。\n检测到 GSAP · Lenis 时会自动启用。"], ["兼容旧浏览器", "在不支持的浏览器或低端设备上只关闭效果，\n内容保持原样。"], ["支持减弱动态", "开启系统「减弱动态效果」后，\n所有模块直接呈现最终状态。"], ["移动端 · 触控", "触控滑动、双指缩放、陀螺仪，\n在移动端同样可用。"], ["遵循标准与无障碍", "遵循语义化标记与 ARIA，\n移除模块后恢复原始 DOM。"]], "_support": "核心可独立运行", "_footerBrand": "贴进 HTML 就能动的网页动效库。<br>34 个模块按需选用，浏览器过旧或不支持时会自动不运行。"}, "zh-TW": {"counter": "呈現數字的五種方式。<br>Pop 不做遞增計數，而是讓完成的數字逐位落定。", "loading": "與真實進度相連的全螢幕載入效果——手動更新、Promise、串流 fetch。<br>可用 CSS 類別與變數重新定義樣式，或透過 renderUI 整體替換介面。", "lazy": "圖片載入過程中播放的過場效果。<br>GIF · WebP · APNG 等動圖全程不中斷。", "overflow-text": "處理超出容器文字的八種模式。<br>移動、切換、停留的每個時間點都是可調選項。", "pointer": "跟隨指標的光效與 3D 傾斜。<br>表面反射、邊緣光束、光暈可任意疊加。", "buttons-feedback": "回應指標與輸入的回饋模組。<br>Magnetic、Ripple、Vibration、Mouse Parallax 與 Compass 都在這裡。", "text-effects": "讓文字動起來的模組。<br>每張卡片都能從第一格重新播放。", "content-reveal": "為內容進入畫面的瞬間做演出。<br>方向滑入、遮罩、甚至時鐘擦除——全部是預設。", "scroll-effects": "回應捲動的方向、速度與進度。<br>固定、橫向捲動、影像序列與整頁吸附都在這一節。", "media-ui": "檢視器、輪播、環境光與互動式遮罩。<br>多個模組可以共用同一張圖片。", "cursor-smooth": "11 種游標預設。<br>可按區域啟用，在觸控裝置上自動關閉。", "module-index": "由發佈契約鎖定的 34 個公開模組。", "_hero": ["一個頁面展示 34 個動態模組。", "調整每張卡片的選項，將完成的設定以 HTML/JS 程式碼帶走。"], "_chips": [["一行接入", "一個 script 標籤即可運行。\n偵測到 GSAP · Lenis 時會自動啟用。"], ["相容舊瀏覽器", "在不支援的瀏覽器或低階裝置上只關閉效果，\n內容保持原樣。"], ["支援減少動態", "開啟系統「減少動態效果」後，\n所有模組直接呈現最終狀態。"], ["行動裝置 · 觸控", "觸控滑動、雙指縮放、陀螺儀，\n在行動裝置上同樣可用。"], ["遵循標準與無障礙", "遵循語義化標記與 ARIA，\n移除模組後還原原始 DOM。"]], "_support": "核心可獨立運行", "_footerBrand": "貼進 HTML 就能動的網頁動態庫。<br>34 個模組按需選用，瀏覽器過舊或不支援時會自動不運行。"}, "ru": {"counter": "Пять способов показать число.<br>Pop не считает вверх — готовые цифры встают на место одна за другой.", "loading": "Полноэкранная загрузка, связанная с реальным прогрессом: ручные обновления, промисы, потоковый fetch.<br>Всё перекрашивается CSS-классами и переменными, а renderUI заменяет интерфейс целиком.", "lazy": "Переходы, которые играют, пока грузится изображение.<br>Анимированные форматы — GIF · WebP · APNG — не останавливаются.", "overflow-text": "Восемь режимов для текста длиннее контейнера.<br>Каждый тайминг — движение, переход, пауза — настраивается.", "pointer": "Свет, следующий за курсором, и 3D-наклон.<br>Отражения, краевые лучи и ореолы сочетаются как угодно.", "buttons-feedback": "Модули обратной связи на курсор и ввод.<br>Magnetic, Ripple, Vibration, Mouse Parallax и Compass живут здесь.", "text-effects": "Модули, которые приводят типографику в движение.<br>Любую карточку можно проиграть с первого кадра.", "content-reveal": "Обыгрываем момент появления контента на экране.<br>Направленные слайды, маски и даже «часовая» шторка — всё пресеты.", "scroll-effects": "Реакция на направление, скорость и прогресс прокрутки.<br>Пиннинг, горизонтальный скролл, секвенции кадров и постраничные секции.", "media-ui": "Просмотрщик, слайдер, эмбиент-подсветка и интерактивные маски.<br>Несколько модулей могут работать с одним изображением.", "cursor-smooth": "Одиннадцать пресетов курсора.<br>Включаются для любой области и сами отключаются на сенсорных экранах.", "module-index": "34 публичных модуля, зафиксированных контрактом поставки.", "_hero": ["34 модуля анимации на одной странице.", "Настройте параметры карточек и заберите результат как HTML/JS-код."], "_chips": [["Установка в одну строку", "Работает с одного тега script.\nGSAP · Lenis подхватываются автоматически, если они есть."], ["Бережно к старым браузерам", "В неподдерживаемых браузерах и на слабых устройствах\nотключаются только эффекты — контент остаётся."], ["Учитывает reduce motion", "При включённой настройке «уменьшить движение»\nмодули показывают финальное состояние без анимации."], ["Мобильные и тач", "Свайпы, пинч-зум и даже гироскоп —\nна мобильных всё работает так же."], ["Стандарты и доступность", "Семантическая разметка и ARIA;\nпри удалении модуля DOM восстанавливается."]], "_support": "Ядро работает автономно", "_footerBrand": "Вставьте в HTML — и всё уже движется.<br>Берите нужные из 34 модулей; на старых или неподдерживаемых браузерах он просто не запускается."}, "it": {"counter": "Cinque modi per presentare un numero.<br>Pop non conta: le cifre finite atterrano al loro posto una a una.", "loading": "Caricamenti a schermo intero collegati al progresso reale: aggiornamenti manuali, promise, fetch in streaming.<br>Tutto si ristilizza con classi e variabili CSS, o si sostituisce l’intera UI con renderUI.", "lazy": "Transizioni che girano mentre l’immagine si carica.<br>Le immagini animate — GIF · WebP · APNG — continuano a muoversi.", "overflow-text": "Otto modalità per testi più lunghi del contenitore.<br>Ogni tempo — corsa, transizione, pausa — è un’opzione.", "pointer": "Luce che segue il puntatore e tilt 3D.<br>Riflessi, fasci sui bordi e aloni si combinano liberamente.", "buttons-feedback": "Moduli di feedback che reagiscono a puntatore e input.<br>Magnetic, Ripple, Vibration, Mouse Parallax e Compass vivono qui.", "text-effects": "Moduli che mettono in moto la tipografia.<br>Ogni card si può rigiocare dal primo fotogramma.", "content-reveal": "Metti in scena l’ingresso dei contenuti.<br>Slide direzionali, maschere, perfino una tendina a orologio: tutti preset.", "scroll-effects": "Reagisce a direzione, velocità e progresso dello scroll.<br>Pinning, scroll orizzontale, sequenze di immagini e sezioni fullpage.", "media-ui": "Viewer, slider, luce ambientale e maschere interattive.<br>Più moduli possono condividere la stessa immagine.", "cursor-smooth": "Undici preset di cursore.<br>Attivabili per area: sui dispositivi touch si spengono da soli.", "module-index": "I 34 moduli pubblici bloccati dal contratto di distribuzione.", "_hero": ["34 moduli di animazione in una sola pagina.", "Regola le opzioni di ogni scheda e porta via la configurazione come codice HTML/JS."], "_chips": [["Installazione immediata", "Funziona con un solo tag script.\nGSAP · Lenis vengono rilevati e usati automaticamente."], ["Sicuro sui browser datati", "Su browser non supportati o dispositivi lenti\nsi spengono solo gli effetti: i contenuti restano."], ["Rispetta reduce motion", "Con l'impostazione di sistema attiva,\nogni modulo mostra lo stato finale senza animazioni."], ["Mobile e touch", "Swipe, pinch-zoom, perfino il giroscopio:\nsu mobile funziona tutto allo stesso modo."], ["Standard e accessibilità", "Markup semantico e ARIA ovunque;\nrimuovendo un modulo il DOM torna com'era."]], "_support": "Il core funziona da solo", "_footerBrand": "La incolli nell\u2019HTML e si muove subito.<br>Scegli i moduli che ti servono tra 34; su browser vecchi o non supportati semplicemente non parte."}};
      const KO={};
      document.querySelectorAll('section[id]').forEach((section)=>{
        const copy=section.querySelector('.section-copy');
        if(copy)KO[section.id]=copy.innerHTML;
      });
      const leadLines=[...document.querySelectorAll('.lead-line')];
      KO['_hero']=leadLines.map(line=>line.textContent);
      const chipNodes=[...document.querySelectorAll('.hero-chips li')];
      KO['_chips']=chipNodes.map(chip=>[chip.textContent,chip.dataset.tip]);
      const coreNote=document.getElementById('core-note');
      KO['_support']=coreNote?coreNote.textContent:'';
      const footerBrand=document.querySelector('.footer-brand p');
      KO['_footerBrand']=footerBrand?footerBrand.innerHTML:'';
      const CARD_I18N={"위아래로 굴러가는 오도미터.": ["An odometer rolling vertically.", "上下に回転するオドメーター。", "上下滚动的里程计。", "上下滾動的里程計。", "Одометр, прокручивающийся по вертикали.", "Un contachilometri che scorre in verticale."], "실제 값이 0부터 목표값까지 증가.": ["The real value counts up from 0 to the target.", "実際の値が0から目標値まで増加。", "数值从 0 递增到目标值。", "數值從 0 遞增到目標值。", "Значение растёт от 0 до цели.", "Il valore reale sale da 0 al target."], "세로 이동 없이 0–9 글리프만 교체.": ["Swaps 0–9 glyphs in place, no vertical motion.", "縦移動なしで0–9のグリフだけ交換。", "不做纵向移动，仅替换 0–9 字形。", "不做縱向移動，僅替換 0–9 字形。", "Меняет глифы 0–9 на месте, без движения.", "Sostituisce i glifi 0–9 sul posto, senza scorrere."], "완성된 숫자가 큰 상태로 나타나 순서대로 정착합니다. 정착 기준(상·중·하)은 옵션입니다.": ["Finished digits appear large and land in order. The landing anchor (top/center/bottom) is an option.", "完成した数字が大きく現れ、順に着地します。基準(上・中・下)はオプション。", "完成的数字放大出现并依次落定。落点(上/中/下)可选。", "完成的數字放大出現並依次落定。落點(上/中/下)可選。", "Готовые цифры появляются крупно и встают по порядку. Точка посадки настраивается.", "Le cifre appaiono ingrandite e atterrano in ordine. L'ancoraggio è un'opzione."], "전광판처럼 숫자가 반으로 접히며 넘어갑니다. 타일 배경은 옵션.": ["Digits fold in half like a departure board. Tile background is optional.", "出発案内板のように数字が半分に折れて切り替わります。タイル背景はオプション。", "数字像机场翻牌那样对折翻页。底板可选。", "數字像機場翻牌那樣對摺翻頁。底板可選。", "Цифры складываются пополам, как на табло. Плитка — опция.", "Le cifre si piegano a metà come un tabellone. La piastrella è opzionale."], "실제 시각이 초 단위로 흐릅니다. 콜론은 초에 맞춰 깜빡이고, 숫자가 바뀌는 방식은 롤 · 깜빡임 · 즉시 교체 중에서 고릅니다.": ["Real time ticks by the second. The colon blinks each second; digit changes can roll, blink or swap instantly.", "実際の時刻が秒単位で進みます。コロンは秒に合わせて点滅し、数字の変化はロール・点滅・即時交換から選べます。", "真实时间按秒走动。冒号随秒闪烁；数字变化可选滚动、闪烁或即时替换。", "真實時間按秒走動。冒號隨秒閃爍；數字變化可選滾動、閃爍或即時替換。", "Реальное время идёт по секундам. Двоеточие мигает; цифры меняются прокруткой, миганием или мгновенно.", "L'ora reale scorre al secondo. I due punti lampeggiano; le cifre cambiano con roll, blink o scambio istantaneo."], "지정한 시점까지 남은 시간을 셉니다. 하루 이상 남으면 일수가 함께 붙고, since를 주면 반대로 지난 시간을 셉니다.": ["Counts down to a target moment. Days are shown when more than a day remains; `since` counts elapsed time instead.", "指定時刻までの残り時間をカウント。1日以上なら日数も表示、sinceを与えると経過時間を数えます。", "倒计时到指定时刻。剩余超过一天时显示天数；给 since 则改为计经过时间。", "倒數計時到指定時刻。剩餘超過一天時顯示天數；給 since 則改為計經過時間。", "Отсчёт до заданного момента. Если больше суток — показываются дни; since считает прошедшее время.", "Conto alla rovescia verso un momento. I giorni appaiono oltre le 24h; con `since` conta il tempo trascorso."], "타일 없이 글자만 접히는 미니멀 플립.": ["A minimal flip — only the glyphs fold, no tiles.", "タイルなしで文字だけが折れるミニマルフリップ。", "无底板、仅字形对折的极简翻页。", "無底板、僅字形對摺的極簡翻頁。", "Минимальный флип — складываются только глифы.", "Flip minimale: si piegano solo i glifi, senza piastrelle."], "Pixel Mosaic 엔진. 요소 크기에서 자동으로 픽셀 단계를 만들고 균등 시간으로 해상도가 올라갑니다. 애니메이션 이미지도 재생 유지.": ["Pixel Mosaic engine. Pixel steps derive from the element size and resolution rises on an even clock. Animated images keep playing.", "Pixel Mosaicエンジン。要素サイズからピクセル段階を自動生成し、均等な時間で解像度が上がります。アニメ画像も再生継続。", "Pixel Mosaic 引擎。按元素尺寸自动生成像素阶梯，分辨率匀速提升。动图持续播放。", "Pixel Mosaic 引擎。按元素尺寸自動生成像素階梯，解析度勻速提升。動圖持續播放。", "Движок Pixel Mosaic: шаги пикселизации из размера элемента, разрешение растёт равномерно. Анимации не останавливаются.", "Motore Pixel Mosaic: gli step derivano dalla dimensione, la risoluzione sale a tempo uniforme. Le immagini animate continuano."], "명시적인 픽셀 블록 크기 배열(px)과 단계별 시간.": ["An explicit array of pixel block sizes (px) with per-step timing.", "明示的なピクセルブロックサイズ配列(px)と段階ごとの時間。", "显式的像素块尺寸数组(px)与每步时长。", "顯式的像素塊尺寸陣列(px)與每步時長。", "Явный массив размеров блоков (px) и время каждого шага.", "Array esplicito di blocchi pixel (px) con tempi per passo."], "블러+미세 노이즈 상태에서 위→아래로 스캔되며 선명해짐. 사각 모자이크 없음.": ["Sharpens top-to-bottom out of blur + fine noise. No square mosaic.", "ブラー+微細ノイズから上→下へスキャンして鮮明に。四角モザイクなし。", "从模糊+细噪点状态自上而下扫描变清晰。无方块马赛克。", "從模糊+細噪點狀態自上而下掃描變清晰。無方塊馬賽克。", "Резкость проявляется сверху вниз из блюра и шума. Без мозаики.", "Si mette a fuoco dall'alto in basso da blur + grana. Nessun mosaico."], "방향성 없이 전체 노이즈와 블러가 점차 사라지며 원본이 선명해짐.": ["Noise and blur dissolve evenly with no direction until the original is sharp.", "方向性なくノイズとブラーが徐々に消え、原画が鮮明に。", "噪点与模糊无方向地渐渐消散，原图变清晰。", "噪點與模糊無方向地漸漸消散，原圖變清晰。", "Шум и блюр растворяются равномерно, пока не проявится оригинал.", "Grana e blur si dissolvono senza direzione fino alla nitidezza."], "Blur-up과 달리 이미지가 아닌 shimmer UI placeholder. 최소 1.2초 표시.": ["Unlike blur-up, a shimmer UI placeholder rather than an image. Shown at least 1.2s.", "Blur-upと違い、画像ではなくシマーUIプレースホルダー。最低1.2秒表示。", "不同于 blur-up，是闪光 UI 占位而非图像。至少显示 1.2 秒。", "不同於 blur-up，是閃光 UI 佔位而非圖像。至少顯示 1.2 秒。", "В отличие от blur-up — шиммер-плейсхолдер, а не изображение. Минимум 1,2 с.", "A differenza del blur-up, è un placeholder shimmer, non un'immagine. Minimo 1,2s."], "그라디언트 이동 대신 밝기가 반복되는 placeholder.": ["A placeholder that pulses brightness instead of sliding a gradient.", "グラデーション移動の代わりに明度が脈動するプレースホルダー。", "以亮度脉动代替渐变移动的占位。", "以亮度脈動代替漸變移動的佔位。", "Плейсхолдер с пульсацией яркости вместо движущегося градиента.", "Un placeholder che pulsa in luminosità invece di far scorrere un gradiente."], "실제 이미지 레이어가 흐린 상태에서 선명해지는 이미지 전환.": ["The actual image layer sharpens out of a blur.", "実画像レイヤーがぼかしから鮮明になる転換。", "真实图像层由模糊变清晰的过渡。", "真實圖像層由模糊變清晰的過渡。", "Слой изображения проявляется из размытия.", "Il livello immagine si mette a fuoco dal blur."], "슬라이스가 어긋나고 블랙아웃이 번쩍이다 정착하는 로드 연출.": ["Slices shear and blackouts flash before the image settles.", "スライスがずれ、ブラックアウトが明滅してから定着するロード演出。", "切片错位、黑屏闪烁后落定的加载演出。", "切片錯位、黑屏閃爍後落定的載入演出。", "Слои сдвигаются и мигает затемнение, затем кадр встаёт.", "Le fette slittano e i blackout lampeggiano prima che l'immagine si fissi."], "인화지가 현상되듯 과노출 상태에서 서서히 색이 차오릅니다.": ["Colors develop slowly out of overexposure, like a printing photo.", "印画紙が現像されるように、露出過多から徐々に色が満ちます。", "像相纸显影一样，从过曝中慢慢显出色彩。", "像相紙顯影一樣，從過曝中慢慢顯出色彩。", "Цвета проявляются из пересвета, как на фотобумаге.", "I colori si sviluppano dalla sovraesposizione, come una polaroid."], "같은 제목이 이어지는 연속 marquee.": ["A continuous marquee of the repeating title.", "同じタイトルが続く連続マーキー。", "同一标题连续滚动的字幕。", "同一標題連續滾動的字幕。", "Непрерывная бегущая строка с повторяющимся заголовком.", "Un marquee continuo con il titolo che si ripete."], "끝에 도착한 뒤 실제로 반대 방향으로 돌아옴.": ["Actually reverses direction after reaching the end.", "端に着いたら実際に逆方向へ戻ります。", "到达末端后真正反向返回。", "到達末端後真正反向返回。", "Дойдя до края, действительно едет обратно.", "Arrivato in fondo, torna davvero indietro."], "끝에서 mask-out → 숨은 상태로 시작점 이동 → mask-in. 뒤로 이동하지 않음.": ["Mask-out at the end → jump back hidden → mask-in. Never travels backwards.", "端でマスクアウト→隠れたまま先頭へ→マスクイン。逆走しません。", "末端 mask-out → 隐藏回到起点 → mask-in。不倒退。", "末端 mask-out → 隱藏回到起點 → mask-in。不倒退。", "Маска в конце → скрытый возврат к началу → маска-вход. Назад не едет.", "Mask-out alla fine → ritorno nascosto → mask-in. Mai a ritroso."], "한 번 이동하고 마지막에 정지.": ["Travels once and stops at the end.", "一度だけ移動し、最後で停止。", "移动一次并在末尾停住。", "移動一次並在末尾停住。", "Проезжает один раз и останавливается.", "Scorre una volta e si ferma alla fine."], "페이지 단위 텍스트가 지정한 방향의 마스크로 교체됩니다.": ["Page-sized chunks swap via a directional mask.", "ページ単位のテキストが指定方向のマスクで切り替わります。", "按页文本以指定方向的遮罩切换。", "按頁文字以指定方向的遮罩切換。", "Текст листается страницами через направленную маску.", "Blocchi a pagina si scambiano con una maschera direzionale."], "페이지 단위 텍스트가 전광판처럼 위/아래로 플립되며 교체됩니다.": ["Page chunks flip up/down like a departure board.", "ページ単位のテキストが案内板のように上下フリップ。", "按页文本像翻牌那样上下翻转切换。", "按頁文字像翻牌那樣上下翻轉切換。", "Страницы переворачиваются вверх/вниз, как табло.", "Le pagine si ribaltano su/giù come un tabellone."], "가로 이동(마퀴) 없이 동작합니다 — 첫 구간이 잠시 표시된 뒤, 나머지 구간들이 순서대로 세로 롤링으로만 교체됩니다.": ["No horizontal travel — the first chunk holds, then the rest swap by vertical rolling only.", "横移動なし — 最初の区間を表示後、残りは縦ローリングのみで交代。", "没有水平移动——先显示第一段，其余仅以纵向滚动依次替换。", "沒有水平移動——先顯示第一段，其餘僅以縱向滾動依次替換。", "Без горизонтального движения: первый блок держится, остальные меняются вертикальной прокруткой.", "Nessun movimento orizzontale: il primo blocco resta, gli altri ruotano solo in verticale."], "글자들이 노이즈처럼 흩어졌다가 다음 구간으로 재조립됩니다.": ["Characters scatter like noise and reassemble into the next chunk.", "文字がノイズのように散り、次の区間へ再構成。", "字符像噪点一样散开，再重组为下一段。", "字元像噪點一樣散開，再重組為下一段。", "Символы рассыпаются шумом и собираются в следующий блок.", "I caratteri si disgregano come rumore e si ricompongono."], "목록 아이템이 세로로 순환합니다. div·span 등 HTML 마크업 아이템을 그대로 지원합니다.": ["List items cycle vertically. HTML markup items (div, span…) are supported as-is.", "リスト項目が縦に循環。div・spanなどのHTML項目をそのまま対応。", "列表项纵向循环。原样支持 div、span 等 HTML 项。", "清單項縱向循環。原樣支援 div、span 等 HTML 項。", "Пункты списка циклически прокручиваются. HTML-элементы поддерживаются как есть.", "Gli elementi ruotano in verticale. Il markup HTML è supportato così com'è."], "표면 반사와 외곽 광택을 각각 켜고 색상·감도를 조절합니다.": ["Toggle surface reflection and edge sheen separately; tune color and sensitivity.", "表面反射とエッジ光沢を個別にオンにし、色と感度を調整。", "可分别开启表面反射与边缘光泽，并调节颜色与灵敏度。", "可分別開啟表面反射與邊緣光澤，並調節顏色與靈敏度。", "Отражение поверхности и блеск кромки включаются отдельно; цвет и чувствительность настраиваются.", "Riflesso e lucentezza dei bordi si attivano separatamente; colore e sensibilità regolabili."], "카드 바깥으로 새어 나오는 회전 conic 글로우 — 오리지널 효과 복원.": ["A rotating conic glow leaking beyond the card — the original effect restored.", "カードの外へ漏れる回転コニックグロー — オリジナル効果を復元。", "溢出卡片的旋转锥形光晕——复刻原版效果。", "溢出卡片的旋轉錐形光暈——復刻原版效果。", "Вращающееся коническое свечение за краем карточки — восстановленный оригинал.", "Un bagliore conico rotante che trabocca dalla card: l'effetto originale."], "외곽선을 따라 흐르는 그라디언트 광선 — 오리지널 보더 글로우.": ["A gradient beam flowing along the outline — the original border glow.", "輪郭に沿って流れるグラデーション光線 — オリジナルのボーダーグロー。", "沿轮廓流动的渐变光束——原版描边光。", "沿輪廓流動的漸變光束——原版描邊光。", "Градиентный луч, бегущий по контуру, — оригинальное свечение рамки.", "Un raggio sfumato che scorre lungo il bordo: il border glow originale."], "클릭 지점에서 원이 퍼지는 Material 스타일.": ["Material-style circles expanding from the click point.", "クリック地点から円が広がるMaterialスタイル。", "从点击处扩散圆形的 Material 风格。", "從點擊處擴散圓形的 Material 風格。", "Круги в стиле Material, расходящиеся из точки клика.", "Cerchi in stile Material che si espandono dal punto di clic."], "탭하면 이름에 맞는 진동 패턴이 재생됩니다(안드로이드 크롬 등 지원 기기). 타이밍 조합으로 톡톡·드르륵 같은 질감을 만듭니다.": ["Tap to play the named vibration pattern (supported devices, e.g. Chrome on Android). Timing combos create tap-tap / ratchet textures.", "タップで名前どおりの振動パターンを再生(Android Chrome等)。タイミングの組合せでトントン・ガリガリの質感を作ります。", "点按即播放对应振动模式(如安卓 Chrome)。用时序组合出哒哒、咔哒等质感。", "點按即播放對應震動模式(如安卓 Chrome)。用時序組合出噠噠、咔噠等質感。", "Тап воспроизводит вибропаттерн (например, Chrome на Android). Тайминги создают текстуры «тук-тук», «трещотка».", "Il tap riproduce il pattern di vibrazione (es. Chrome su Android). I tempi creano texture tap-tap e ratchet."], "바늘이 포인터를 조준해 회전합니다. compassRange로 X축 매핑 회전도 가능.": ["The needle rotates to aim at the pointer. compassRange maps rotation to the X axis instead.", "針がポインターを狙って回転。compassRangeでX軸マッピング回転も可能。", "指针旋转指向光标。compassRange 可改为按 X 轴映射旋转。", "指針旋轉指向游標。compassRange 可改為按 X 軸映射旋轉。", "Стрелка целится в курсор. compassRange привязывает вращение к оси X.", "L'ago ruota puntando il cursore. compassRange mappa la rotazione sull'asse X."], "글자가 3D로 회전하며 등장합니다. flip·scale·blur 선택 가능.": ["Characters enter with a 3D spin. flip, scale and blur are selectable.", "文字が3D回転しながら登場。flip・scale・blurを選択可能。", "字符以 3D 旋转登场。可选 flip、scale、blur。", "字元以 3D 旋轉登場。可選 flip、scale、blur。", "Символы появляются с 3D-вращением. Доступны flip, scale, blur.", "I caratteri entrano ruotando in 3D. flip, scale e blur selezionabili."], "문장이 글자 단위로 교체됩니다 — 슬라이드 업 + 페이드 아웃, 스태거 입장.": ["Sentences swap character by character — slide-up in, fade out, staggered entrance.", "文が文字単位で入れ替わります — スライドアップ+フェードアウト、スタッガー入場。", "句子按字符替换——上滑进入+淡出，交错入场。", "句子按字元替換——上滑進入+淡出，交錯入場。", "Фразы меняются посимвольно: слайд вверх, затухание, ступенчатый вход.", "Le frasi si scambiano carattere per carattere: slide-up, fade-out, ingresso sfalsato."], "caret(|) 표시 여부와 한글 자음·모음 조합 타이핑을 옵션으로 선택합니다.": ["Choose whether to show the caret (|) and whether Korean types by jamo composition.", "キャレット(|)表示と、ハングルの字母合成タイピングをオプションで選択。", "可选是否显示光标(|)，以及韩文是否按字母组合打字。", "可選是否顯示游標(|)，以及韓文是否按字母組合打字。", "Опции: показывать ли каретку (|) и печатать ли хангыль по чамо.", "Opzioni: mostrare il caret (|) e digitare l'hangul per composizione."], "slide-up · blur · dissolve(노이즈) · shimmer 등.": ["slide-up · blur · dissolve (noise) · shimmer and more.", "slide-up・blur・dissolve(ノイズ)・shimmerなど。", "slide-up · blur · dissolve(噪点) · shimmer 等。", "slide-up · blur · dissolve(噪點) · shimmer 等。", "slide-up · blur · dissolve (шум) · shimmer и другие.", "slide-up · blur · dissolve (rumore) · shimmer e altri."], "글자가 순서대로 나타나며 랜덤 글리프로 깜빡인 뒤 확정됩니다. 텍스트에서 자동 생성.": ["Characters appear in order, flicker through random glyphs, then settle. Generated from live text.", "文字が順に現れ、ランダムなグリフで明滅してから確定。テキストから自動生成。", "字符依次出现，先闪烁随机字形再确定。由文本自动生成。", "字元依次出現，先閃爍隨機字形再確定。由文字自動生成。", "Символы появляются по порядку, мерцая случайными глифами. Генерируется из текста.", "I caratteri appaiono in ordine, tremolano su glifi casuali e si fissano. Generato dal testo."], "글자마다 불규칙하게 점멸하며 켜집니다. flickerLoop로 상시 잔플리커 유지.": ["Each character strobes on irregularly. flickerLoop keeps an ambient flicker alive.", "文字ごとに不規則に点滅して点灯。flickerLoopで常時の残りフリッカーを維持。", "每个字符不规则地闪烁点亮。flickerLoop 可保持常驻微闪。", "每個字元不規則地閃爍點亮。flickerLoop 可保持常駐微閃。", "Каждый символ зажигается неровным стробом. flickerLoop оставляет фоновое мерцание.", "Ogni carattere si accende a intermittenza. flickerLoop mantiene un tremolio di fondo."], "세 겹의 색상 분리 레이어와 간헐적 슬라이스 버스트.": ["Three color-separated layers with intermittent slice bursts.", "3層の色分離レイヤーと間欠的なスライスバースト。", "三层色彩分离叠加与间歇性切片爆发。", "三層色彩分離疊加與間歇性切片爆發。", "Три слоя цветового расслоения и редкие всплески срезов.", "Tre livelli a colori separati con burst di fette intermittenti."], "열 가지 화면 전환 커버입니다.방향·색·조각 수·스태거를 옵션으로 조절합니다.": ["Ten full-screen transition covers.<br>Direction, colors, piece count and stagger are options.", "10種の画面転換カバー。<br>方向・色・分割数・スタッガーをオプションで調整。", "十种全屏转场遮罩。<br>方向、颜色、分片数与错峰均可配置。", "十種全螢幕轉場遮罩。<br>方向、顏色、分片數與錯峰均可配置。", "Десять полноэкранных шторок.<br>Направление, цвета, число фрагментов и стаггер настраиваются.", "Dieci coperture di transizione.<br>Direzione, colori, numero di pezzi e stagger sono opzioni."], "시계 바늘이 돌 듯 원형 마스크가 채워지며 콘텐츠가 드러납니다.": ["A circular mask fills like a clock hand to reveal the content.", "時計の針のように円形マスクが満ち、コンテンツが現れます。", "圆形遮罩像表针一样扫过，露出内容。", "圓形遮罩像錶針一樣掃過，露出內容。", "Круговая маска заполняется, как стрелка часов.", "Una maschera circolare si riempie come una lancetta."], "모션을 강제하지 않고 진입 시 원하는 CSS class만 on/off.": ["No forced motion — just toggles your CSS classes on enter/leave.", "モーションを強制せず、進入時に任意のCSSクラスだけon/off。", "不强加动效——进入/离开时仅切换你的 CSS class。", "不強加動效——進入/離開時僅切換你的 CSS class。", "Никакой навязанной анимации — только переключение ваших CSS-классов.", "Nessun moto imposto: attiva/disattiva solo le tue classi CSS."], "반복되는 작업과 정보 단절.": ["Repetitive work and broken context.", "繰り返しの作業と情報の分断。", "重复劳动与信息断层。", "重複勞動與資訊斷層。", "Рутина и разрывы контекста.", "Lavoro ripetitivo e contesto frammentato."], "흐름을 자동화하고 인터랙션을 모듈화.": ["Automate the flow, modularize the interactions.", "フローを自動化し、インタラクションをモジュール化。", "让流程自动化，交互模块化。", "讓流程自動化，互動模組化。", "Автоматизируем поток, разбиваем интеракции на модули.", "Automatizza il flusso, modularizza le interazioni."], "재사용 가능한 Kineto.": ["A reusable Kineto.", "再利用できるKineto。", "可复用的 Kineto。", "可複用的 Kineto。", "Переиспользуемый Kineto.", "Un Kineto riutilizzabile."], "콘텐츠가 고정된 화면 안으로 등장합니다.": ["Content enters inside a pinned screen.", "コンテンツが固定画面の中に登場します。", "内容在固定的屏幕内登场。", "內容在固定的螢幕內登場。", "Контент появляется внутри закреплённого экрана.", "Il contenuto entra in uno schermo bloccato."], "이전 항목은 뒤로 물러나며 흐려집니다.": ["Previous items recede and blur.", "前の項目は後ろへ退き、ぼやけます。", "上一项后退并变模糊。", "上一項後退並變模糊。", "Предыдущие элементы отходят назад и размываются.", "Gli elementi precedenti arretrano e sfocano."], "스크롤 진행률로 전체 시퀀스를 제어합니다.": ["Scroll progress drives the whole sequence.", "スクロール進捗でシーケンス全体を制御。", "以滚动进度驱动整段序列。", "以捲動進度驅動整段序列。", "Прогресс прокрутки управляет всей секвенцией.", "Il progresso dello scroll guida l'intera sequenza."], "ScrollTrigger fallback 또는 CSS animation timeline에 연결.": ["Wired to a ScrollTrigger fallback or the CSS animation timeline.", "ScrollTriggerフォールバックまたはCSS animation timelineに接続。", "接入 ScrollTrigger 回退或 CSS animation timeline。", "接入 ScrollTrigger 回退或 CSS animation timeline。", "Подключается к ScrollTrigger или CSS animation timeline.", "Collegato al fallback ScrollTrigger o alla CSS animation timeline."], "읽은 만큼 채워지는 바입니다. 페이지 상단에 고정하거나, 이 카드처럼 요소 안에 넣을 수 있습니다.": ["A bar that fills as you read. Fix it to the page top or embed it in an element like this card.", "読んだ分だけ満ちるバー。ページ上部に固定するか、このカードのように要素内へ。", "随阅读进度填充的进度条。可固定在页顶，也可像本卡片一样内嵌。", "隨閱讀進度填充的進度條。可固定在頁頂，也可像本卡片一樣內嵌。", "Полоса, заполняющаяся по мере чтения. Крепится сверху или встраивается в элемент.", "Una barra che si riempie leggendo. Fissala in alto o incorporala come in questa card."], "원형 인디케이터입니다. 퍼센트 표시, 맨 위로 이동 버튼, 특정 요소 추적을 옵션으로 켭니다. 우측 하단 플로팅 링도 이 모듈입니다.": ["A circular indicator. Percent readout, back-to-top button and per-element tracking are options. The floating ring bottom-right is this module.", "円形インジケーター。％表示・トップへ戻るボタン・要素追跡をオプションで。右下のフローティングリングもこのモジュール。", "圆形指示器。百分比、回到顶部按钮、跟踪特定元素均为选项。右下角浮动圆环就是它。", "圓形指示器。百分比、回到頂部按鈕、跟蹤特定元素均為選項。右下角浮動圓環就是它。", "Круговой индикатор: проценты, кнопка «наверх», привязка к элементу. Плавающее кольцо справа внизу — этот модуль.", "Indicatore circolare: percentuale, back-to-top e tracking per elemento. L'anello flottante in basso a destra è questo modulo."], "휠 · 스와이프 · 키보드 · 도트로 한 단락씩 이동하는 fullpage 컨테이너입니다. 끝에 도달하면 페이지 스크롤로 자연스럽게 이어지고, 창 크기가 바뀌어도 즉시 맞춰집니다.": ["A fullpage container paging by wheel, swipe, keyboard and dots. At its edges it hands back to normal page scroll, and it adapts instantly to any resize.", "ホイール・スワイプ・キーボード・ドットで1段ずつ進むフルページコンテナ。端では通常スクロールへ、リサイズにも即対応。", "以滚轮、滑动、键盘、圆点逐屏切换的整页容器。到边缘自然交还页面滚动，窗口变化即时适配。", "以滾輪、滑動、鍵盤、圓點逐屏切換的整頁容器。到邊緣自然交還頁面捲動，視窗變化即時適配。", "Fullpage-контейнер: колесо, свайп, клавиатура, точки. На краях отдаёт прокрутку странице и мгновенно подстраивается под размер.", "Un contenitore fullpage con rotella, swipe, tastiera e dot. Ai bordi restituisce lo scroll alla pagina e si adatta subito al resize."], "전체 화면 그룹 뷰어 — 캡션·메타데이터, 확대·이동·미니맵, 커스텀 UI 훅.": ["A full-screen group viewer — captions and metadata, zoom/pan/minimap, custom UI hooks.", "全画面グループビューア — キャプション・メタデータ、ズーム・パン・ミニマップ、カスタムUIフック。", "全屏组图查看器——说明与元数据、缩放/平移/小地图、自定义 UI 钩子。", "全螢幕群組檢視器——說明與中繼資料、縮放/平移/小地圖、自訂 UI 鉤子。", "Полноэкранный просмотрщик: подписи и метаданные, зум/панорама/миникарта, свои UI-хуки.", "Un visualizzatore a schermo intero: didascalie, zoom/pan/minimappa, hook UI personalizzati."], "단일 transform 경로로 드래그·키보드·버튼 이동이 중복 실행되지 않습니다.": ["One transform path — drag, keyboard and buttons never double-fire.", "単一のtransform経路で、ドラッグ・キーボード・ボタンが重複実行されません。", "单一 transform 路径——拖拽、键盘与按钮不会重复触发。", "單一 transform 路徑——拖曳、鍵盤與按鈕不會重複觸發。", "Единый transform-путь: драг, клавиатура и кнопки не дублируются.", "Un unico percorso transform: drag, tastiera e pulsanti non si duplicano."], "세 모듈을 한 이미지에 조합해도 애니메이션 재생이 유지됩니다.": ["Stack three modules on one image and the animation keeps playing.", "3つのモジュールを1枚に重ねても、アニメ再生は維持されます。", "三个模块叠加在一张图上，动画依然持续播放。", "三個模組疊加在一張圖上，動畫依然持續播放。", "Три модуля на одном изображении — анимация не прерывается.", "Tre moduli sulla stessa immagine e l'animazione continua."], "재생 프레임을 저해상도로 샘플링해 미디어 주변광을 만듭니다.": ["Samples playing frames at low resolution to build ambient light around the media.", "再生フレームを低解像度でサンプリングし、メディアの環境光を作ります。", "以低分辨率采样播放帧，生成媒体环境光。", "以低解析度取樣播放幀，生成媒體環境光。", "Кадры сэмплируются в низком разрешении и создают подсветку вокруг медиа.", "Campiona i frame a bassa risoluzione per creare la luce ambientale."], "로딩과 무관한 상시 효과 — 색수차·슬라이스·스캔라인 버스트가 랜덤 간격으로 발생합니다(hover 트리거 옵션).": ["An always-on effect independent of loading — chromatic, slice and scanline bursts at random intervals (hover trigger optional).", "ロードと無関係な常時エフェクト — 色収差・スライス・走査線バーストがランダム間隔で発生(hoverトリガー可)。", "与加载无关的常驻效果——色差、切片、扫描线爆发随机出现(可选 hover 触发)。", "與載入無關的常駐效果——色差、切片、掃描線爆發隨機出現(可選 hover 觸發)。", "Постоянный эффект вне загрузки: хроматика, срезы и сканлайны случайными сериями (по hover — опция).", "Effetto sempre attivo: aberrazioni, fette e scanline a intervalli casuali (trigger hover opzionale)."], "같은 구도의 두 이미지 — 포인터가 지나간 곳만 브러시 마스크로 두 번째 이미지가 드러납니다. 잔상 유지(persist)·치유 속도·퍼짐·블러 모두 옵션.": ["Two aligned images — the second shows only where the pointer brushed. Persist, heal speed, softness and blur are all options.", "同構図の2枚 — ポインターが通った所だけブラシマスクで2枚目が現れます。persist・治癒速度・広がり・ぼかしすべてオプション。", "同构图的两张图——只有指针刷过之处显出第二张。persist、恢复速度、扩散、模糊均可选。", "同構圖的兩張圖——只有指標刷過之處顯出第二張。persist、恢復速度、擴散、模糊均可選。", "Два совмещённых кадра: второй проявляется только под кистью. Persist, скорость заживления, растушёвка и блюр — опции.", "Due immagini allineate: la seconda appare solo dove passa il puntatore. Persist, guarigione, morbidezza e blur sono opzioni."], "점은 즉시, 링은 탄성으로 따라옵니다. 호버 시 링은 유지되고 안쪽 점만 커집니다.": ["The dot is instant, the ring follows elastically. On hover the ring holds and only the inner dot grows.", "点は即時、リングは弾性で追従。ホバー時はリングを保ち、内側の点だけ拡大。", "圆点即时跟随，圆环弹性跟随。悬停时环不变，仅内点放大。", "圓點即時跟隨，圓環彈性跟隨。懸停時環不變，僅內點放大。", "Точка следует мгновенно, кольцо — упруго. На ховере растёт только точка.", "Il punto è immediato, l'anello segue elastico. In hover cresce solo il punto."], "커서 주위를 도는 원형 텍스트. 호버 시 중앙 점만 확대됩니다.": ["Circular text orbiting the cursor. On hover only the center dot grows.", "カーソルの周りを回る円形テキスト。ホバー時は中央の点だけ拡大。", "环绕光标旋转的圆形文字。悬停时仅中心点放大。", "環繞游標旋轉的圓形文字。懸停時僅中心點放大。", "Круговой текст вокруг курсора. На ховере растёт только центр.", "Testo circolare attorno al cursore. In hover cresce solo il punto centrale."], "글자들이 궤도를 돕니다.": ["Letters orbit the pointer.", "文字が軌道を回ります。", "字母沿轨道环绕。", "字母沿軌道環繞。", "Буквы вращаются по орбите.", "Le lettere orbitano."], "탄성 꼬리가 커서를 따라옵니다.": ["An elastic tail trails the cursor.", "弾性の尻尾がカーソルを追います。", "弹性尾迹跟随光标。", "彈性尾跡跟隨游標。", "Упругий хвост тянется за курсором.", "Una coda elastica segue il cursore."], "이동 궤적에 별 파티클이 흩날립니다.": ["Star particles scatter along the path.", "移動軌跡に星のパーティクルが舞います。", "移动轨迹上洒落星形粒子。", "移動軌跡上灑落星形粒子。", "По траектории рассыпаются звёздочки.", "Particelle a stella lungo il percorso."], "글자들이 사슬처럼 이어 따라옵니다.": ["Letters follow in a chain.", "文字が鎖のように連なって追従。", "字母像锁链一样相连跟随。", "字母像鎖鏈一樣相連跟隨。", "Буквы следуют цепочкой.", "Le lettere seguono in catena."], "화면 전체 십자선 + 중심 점.": ["Full-screen crosshair + center dot.", "画面全体の十字線+中心点。", "全屏十字线+中心点。", "全螢幕十字線+中心點。", "Прицел на весь экран + точка в центре.", "Mirino a schermo intero + punto centrale."], "클릭 지점에서 1회 재생. 스프라이트는 정사각 프레임을 가로로 이어붙인 시트(예: 96×96 8프레임 = 768×96)이며 clickSpriteWidth/Height/Frames로 어떤 크기든 지정합니다. GIF/APNG는 clickImage. 터치 기기에서도 동작.": ["Plays once at the click point. Sprites are square frames in a horizontal sheet (e.g. 96×96 ×8 = 768×96), any size via clickSpriteWidth/Height/Frames. GIF/APNG via clickImage. Works on touch too.", "クリック地点で1回再生。スプライトは正方形フレームを横に並べたシート(例: 96×96×8=768×96)で、clickSpriteWidth/Height/Framesで任意サイズ指定。GIF/APNGはclickImage。タッチでも動作。", "在点击处播放一次。精灵图为方形帧横向拼接(如 96×96×8=768×96)，尺寸由 clickSpriteWidth/Height/Frames 指定。GIF/APNG 用 clickImage。触屏同样可用。", "在點擊處播放一次。精靈圖為方形幀橫向拼接(如 96×96×8=768×96)，尺寸由 clickSpriteWidth/Height/Frames 指定。GIF/APNG 用 clickImage。觸屏同樣可用。", "Один проигрыш в точке клика. Спрайт — квадратные кадры в ряд (96×96×8=768×96), размер через clickSpriteWidth/Height/Frames. GIF/APNG — clickImage. Работает и на тач.", "Riproduce una volta al clic. Gli sprite sono frame quadrati in fila (96×96×8=768×96), dimensioni via clickSpriteWidth/Height/Frames. GIF/APNG con clickImage. Funziona anche su touch."], "포인터 위치에 작게 표시되는 + 크로스.": ["A small + cross at the pointer position.", "ポインター位置に小さく表示される+クロス。", "在指针位置显示的小 + 十字。", "在指標位置顯示的小 + 十字。", "Маленький крестик + в позиции курсора.", "Una piccola croce + sulla posizione del puntatore."], "같은 사이트 안에서의 이동을 전체 리로드 없이 처리합니다. 아래 버튼으로 직접 확인해보세요.빼고 싶은 링크에는 data-kt-no-transition 하나면 됩니다.": ["Handles same-site navigation without a full reload. Try the button below.<br>To exclude a link, one data-kt-no-transition is enough.", "同一サイト内の移動をフルリロードなしで処理。下のボタンでお試しを。<br>除外したいリンクにはdata-kt-no-transitionを1つ。", "站内跳转无需整页刷新。用下面的按钮试试。<br>想排除的链接加一个 data-kt-no-transition 即可。", "站內跳轉無需整頁刷新。用下面的按鈕試試。<br>想排除的連結加一個 data-kt-no-transition 即可。", "Навигация по сайту без полной перезагрузки. Попробуйте кнопкой ниже.<br>Для исключения ссылки достаточно data-kt-no-transition.", "Naviga nello stesso sito senza ricaricare. Prova col pulsante.<br>Per escludere un link basta data-kt-no-transition."]};
      const LANG_IDX={"en": 0, "ja": 1, "zh-CN": 2, "zh-TW": 3, "ru": 4, "it": 5};
      const cardNodes=[...document.querySelectorAll('main p')].filter(node=>!node.classList.contains('section-copy')&&!node.classList.contains('lead')&&!node.closest('.hero')&&/[가-힣]/.test(node.textContent)).map(node=>({node,ko:node.innerHTML,key:node.textContent.replace(/\s+/g,' ').trim()}));
      const apply=(lang)=>{
        document.documentElement.lang=lang;
        // Option tooltips follow the UI language (English fallback).
        window.KinetoPlayground?.setHelpLang?.(lang);
        window.KinetoPlayground?.refreshHelp?.();
        const dict=LANGS[lang]||null;
        document.querySelectorAll('section[id]').forEach((section)=>{
          const copy=section.querySelector('.section-copy');
          if(!copy)return;
          const text=dict?dict[section.id]:KO[section.id];
          if(text)copy.innerHTML=text;
        });
        const heroLines=dict?dict._hero:KO._hero;
        leadLines.forEach((line,i)=>{if(heroLines&&heroLines[i]!=null)line.textContent=heroLines[i];});
        const chips=dict?dict._chips:KO._chips;
        chipNodes.forEach((chip,i)=>{if(chips&&chips[i]){chip.textContent=chips[i][0];chip.dataset.tip=chips[i][1];}});
        if(coreNote)coreNote.textContent=(dict?dict._support:KO._support)||KO._support;
        if(footerBrand)footerBrand.innerHTML=(dict?dict._footerBrand:KO._footerBrand)||KO._footerBrand;
        cardNodes.forEach(({node,ko,key})=>{
          const translated=dict&&CARD_I18N[key]?CARD_I18N[key][LANG_IDX[lang]]:null;
          node.innerHTML=dict?(translated||ko):ko;
        });
      };
      let saved='ko';
      try{saved=localStorage.getItem('kt-lang')||'ko';}catch(_){}
      select.value=saved;
      if(saved!=='ko')apply(saved);
      select.addEventListener('change',()=>{
        apply(select.value);
        try{localStorage.setItem('kt-lang',select.value);}catch(_){}
      });
    })();
    // Sidebar: highlight the section in view.
    (()=>{
      const links=[...document.querySelectorAll('.side-nav a')];
      if(!links.length)return;
      const byId=new Map(links.map(link=>[link.getAttribute('href').slice(1),link]));
      const sections=[...byId.keys()].map(id=>document.getElementById(id)).filter(Boolean);
      const setActive=(id)=>links.forEach(link=>link.classList.toggle('active',link.getAttribute('href')==='#'+id));
      const io=new IntersectionObserver((entries)=>{
        const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
        if(visible)setActive(visible.target.id);
      },{rootMargin:'-30% 0px -55% 0px',threshold:[0,.2,.5]});
      sections.forEach(section=>io.observe(section));
    })();
    // First-screen snap: one scroll gesture in the hero jumps to #counter,
    // everything after that is normal scrolling. Momentum is grouped into
    // gestures so the flick tail never keeps pushing the page. Respects
    // prefers-reduced-motion (no hijack) and touch swipes on mobile.
    (()=>{
      if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
      const hero=document.querySelector('.hero');
      const target=document.getElementById('counter');
      if(!hero||!target)return;
      let snapping=false,lastAt=0,consumed=false;
      const inHero=()=>window.scrollY<hero.offsetHeight-120;
      // Only snap once the hero's own content is fully scrolled into view — if the
      // hero is taller than the viewport (low-res / small window), let the cut-off
      // content scroll natively first instead of jumping straight to #counter.
      const heroFullySeen=()=>window.scrollY+window.innerHeight>=hero.offsetHeight-4;
      const snap=()=>{
        snapping=true;
        target.scrollIntoView({behavior:'smooth',block:'start'});
        try{history.replaceState(null,'','#counter');}catch(_){/* file:// */}
        setTimeout(()=>{snapping=false;},900);
      };
      const snapTop=()=>{
        snapping=true;
        window.scrollTo({top:0,behavior:'smooth'});
        try{history.replaceState(null,'',location.pathname+location.search);}catch(_){/* file:// */}
        setTimeout(()=>{snapping=false;},900);
      };
      // 첫 섹션 상단부에서 위로 올리면 히어로로 똑같이 스냅 (대칭 동작)
      const nearFirstSection=()=>window.scrollY>60&&window.scrollY<=target.offsetTop+140;
      window.addEventListener('wheel',(event)=>{
        const now=performance.now();
        const sameGesture=now-lastAt<280;
        lastAt=now;
        if(!sameGesture)consumed=false;
        if(snapping||(sameGesture&&consumed)){event.preventDefault();return;}
        if(inHero()&&heroFullySeen()&&event.deltaY>8){event.preventDefault();consumed=true;snap();}
        else if(nearFirstSection()&&event.deltaY<-8){event.preventDefault();consumed=true;snapTop();}
      },{passive:false});
      document.getElementById('brand-home')?.addEventListener('click',snapTop);
      let touchY=null,touchDone=false;
      hero.addEventListener('touchstart',(event)=>{touchY=event.touches[0].clientY;touchDone=false;},{passive:true});
      hero.addEventListener('touchmove',(event)=>{
        if(touchY==null||!inHero()||!heroFullySeen())return;
        if(snapping||touchDone){event.preventDefault();return;}
        const delta=touchY-event.touches[0].clientY;
        if(delta>10){event.preventDefault();if(delta>26){touchDone=true;snap();}}
      },{passive:false});
      target.addEventListener('touchstart',(event)=>{touchY=event.touches[0].clientY;touchDone=false;},{passive:true});
      target.addEventListener('touchmove',(event)=>{
        if(touchY==null||!nearFirstSection())return;
        if(snapping||touchDone){event.preventDefault();return;}
        const delta=touchY-event.touches[0].clientY;
        if(delta<-10){event.preventDefault();if(delta<-26){touchDone=true;snapTop();}}
      },{passive:false});
    })();
    // optional dependency toggles → conditional CDN rows
    document.querySelectorAll('.extra-toggle input[data-extra]').forEach(input=>input.addEventListener('change',()=>{
      const row=document.getElementById(input.dataset.extra);
      if(row)row.hidden=!input.checked;
    }));
    // install snippet copy
    document.querySelectorAll('.copy-chip').forEach(chip=>chip.addEventListener('click',async()=>{
      const code=document.querySelector(chip.dataset.copy);
      if(!code)return;
      try{await navigator.clipboard.writeText(code.textContent);}catch(_){
        const range=document.createRange();range.selectNodeContents(code);
        const sel=getSelection();sel.removeAllRanges();sel.addRange(range);
        document.execCommand('copy');sel.removeAllRanges();
      }
      const prev=chip.textContent;chip.textContent='Copied';chip.disabled=true;
      window.ktToast?.('복사되었습니다');
      setTimeout(()=>{chip.textContent=prev;chip.disabled=false;},1200);
    }));
    KinetoPlayground.mount(document);

    // Reusable toast — window.ktToast(msg, {duration}). Multi-line via '\n',
    // always centered. Use it anywhere: copy, apply, reset, unsupported hints…
    (()=>{
      let host=null;
      window.ktToast=(msg,opts={})=>{
        if(!host){host=document.createElement('div');host.className='kt-toast-host';document.body.appendChild(host);}
        const t=document.createElement('div');t.className='kt-toast';
        String(msg).split('\n').forEach((line,i)=>{
          if(i)t.appendChild(document.createElement('br'));
          t.appendChild(document.createTextNode(line));
        });
        host.appendChild(t);
        requestAnimationFrame(()=>t.classList.add('is-in'));
        const life=Math.max(1200,opts.duration||2600);
        setTimeout(()=>{t.classList.remove('is-in');setTimeout(()=>t.remove(),300);},life);
        return t;
      };
      // Haptic vibration only fires on touch hardware (mainly Android). On PC
      // and iOS there's no perceptible feedback, so tell the user instead of
      // leaving them tapping a dead button.
      const canHaptic=('vibrate' in navigator)&&matchMedia('(pointer:coarse)').matches;
      if(!canHaptic){
        document.querySelectorAll('[data-kt-vibrate]').forEach(btn=>{
          btn.addEventListener('click',()=>window.ktToast('이 환경에서는 진동(Haptic)이 지원되지 않습니다.\n주로 Android 기기에서 동작합니다.'),{passive:true});
        });
      }

      // Sitemap: a header button opens a full overview of every section so you
      // can jump straight to any module (instead of hunting the side nav). Links
      // are plain in-page anchors (data-kt-no-transition) — no page transition.
      (function sitemap(){
        const btn=document.getElementById('sitemap-btn');
        if(!btn)return;
        const sections=[...document.querySelectorAll('main section[id]')];
        const overlay=document.createElement('div');
        overlay.className='sitemap-overlay';
        overlay.hidden=true;
        overlay.innerHTML='<div class="sitemap-panel" role="dialog" aria-modal="true" aria-label="Sitemap">'
          +'<div class="sitemap-head"><strong>Kineto — Sitemap</strong><button class="sitemap-close" type="button" aria-label="닫기"><i class="ph-bold ph-x" aria-hidden="true"></i></button></div>'
          +'<div class="sitemap-grid">'+sections.map((s,i)=>{
            const h=s.querySelector('.section-head h2, h2, h1');
            const title=h?h.textContent.trim():s.id;
            return `<a href="#${s.id}" data-kt-no-transition><i>${String(i+1).padStart(2,'0')}</i><span>${title}</span></a>`;
          }).join('')+'</div></div>';
        document.body.appendChild(overlay);
        const open=()=>{overlay.hidden=false;requestAnimationFrame(()=>overlay.classList.add('is-open'));document.documentElement.style.overflow='hidden';};
        const close=()=>{overlay.classList.remove('is-open');document.documentElement.style.overflow='';setTimeout(()=>{overlay.hidden=true;},260);};
        btn.addEventListener('click',open);
        overlay.addEventListener('click',(e)=>{ if(e.target===overlay)close(); });
        overlay.querySelector('.sitemap-close').addEventListener('click',close);
        overlay.querySelectorAll('.sitemap-grid a').forEach(a=>a.addEventListener('click',()=>{ close(); }));
        document.addEventListener('keydown',(e)=>{ if(e.key==='Escape'&&!overlay.hidden)close(); });
      })();
    })();
