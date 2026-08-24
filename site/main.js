// Kineto demo behavior — split from index.html (styles in styles.css)
    // If the bundle failed to load/parse (e.g. an engine-specific issue), don't
    // let the whole page stay hidden behind the kt-preload veil — reveal it.
    if(typeof Kineto==='undefined'){
      document.documentElement.classList.remove('kt-preload');
      throw new Error('Kineto failed to load');
    }
    // Seed relative-time cards from the visitor's current clock so the demo
    // always exercises the server-date parser without becoming stale. Each card
    // can opt into a different past/future offset and mode in markup.
    document.querySelectorAll('[data-demo-relative-time]').forEach((node)=>{
      const offset=Number(node.getAttribute('data-demo-relative-offset')||-5*60*1000);
      node.setAttribute('data-kt-date',new Date(Date.now()+offset).toISOString());
      if(!node.hasAttribute('data-kt-mode'))node.setAttribute('data-kt-mode','relative');
    });
    // Image Cover Reveal examples demonstrate the real per-image sampler by
    // default. This runs before autoInit on the live page; browser QA injects
    // scripts after DOM ready, so recreate an already-started instance there.
    document.querySelectorAll('[data-kt-cover-reveal]').forEach((target)=>{
      if(!target.querySelector('img'))return;
      const gallery=Boolean(target.closest('#cover-gallery-demo'));
      target.setAttribute('data-kt-color-mode','auto');
      target.removeAttribute('data-kt-colors');
      if(gallery)target.setAttribute('data-kt-mask','false');
      if(Kineto.getInstance(target,'coverReveal')){
        Kineto.updateModule(target,'coverReveal',{colorMode:'auto',colors:'',...(gallery?{mask:false}:{})});
      }
    });
    const radialDemo=document.querySelector('[data-kt-slider="radial"]');
    if(radialDemo){
      radialDemo.setAttribute('data-kt-position','bottom');
      radialDemo.setAttribute('data-kt-radius','180');
      radialDemo.setAttribute('data-kt-step','34');
      if(Kineto.getInstance(radialDemo,'slider')){
        Kineto.updateModule(radialDemo,'slider',{position:'bottom',radius:180,step:34});
      }
    }
    document.addEventListener('change',(event)=>{
      const field=event.target.closest?.('.kt-playground__field[data-module="slider"][data-key="position"]');
      if(!field||!radialDemo)return;
      const scope=field.closest('.kt-drawer-sheet,.kt-playground__body,.kt-playground')||document;
      const radius=event.target.value==='center'?96:180;
      const radiusInput=scope.querySelector('.kt-playground__field[data-module="slider"][data-key="radius"] input[data-option]');
      if(radiusInput&&Number(radiusInput.value)!==radius){
        radiusInput.value=String(radius);
        radiusInput.dispatchEvent(new Event('input',{bubbles:true}));
      }
    });
    // The demo ships WITH smooth scrolling on — it is one of the library's
    // features, so the default page should show it. The Smooth Scroll card
    // lets a visitor switch it off and feel the difference immediately.
    // Respect prefers-reduced-motion: never hijack scrolling for those users.
    const wantsSmooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
      // WebKit's native trackpad momentum already has a longer decay. A shorter
      // Lenis duration avoids stacking two long easing tails, and a slightly
      // longer hover roll compensates for WebKit's sharper transition finish.
      document.querySelectorAll('[data-kt-overflow-text="rolling"][data-kt-trigger="hover"]')
        .forEach((item) => item.setAttribute('data-kt-roll-duration', '380'));
    }
    try{ Kineto.config({smooth:false}); }catch(_){}
    // B-2: when the page opens with a #mod-… deep link, don't let the scroll
    // observer clear the hash before the initial restore scroll runs. Unlocked
    // after the restore settles or on first user scroll.
    let allowHashClear=!/^#mod-/.test(location.hash||'');
    const enableHashClear=()=>{ allowHashClear=true; };
    window.addEventListener('wheel',enableHashClear,{passive:true,once:true});
    window.addEventListener('touchmove',enableHashClear,{passive:true,once:true});
    // B-1 / C-8: stamp version, module count and build id from the RUNTIME so the
    // header/footer can never drift from Kineto.version or the real module count
    // (kills the stale "51 modules" text and any hardcoded-version mismatch).
    (()=>{
      const version=(()=>{try{return String(Kineto.version||'');}catch(_){return '';}})();
      const count=Object.keys(Kineto.registry||{}).length;
      const build=(typeof window!=='undefined'&&window.__KT_BUILD__)?String(window.__KT_BUILD__):'dev';
      if(version) document.querySelectorAll('[data-kt-version]').forEach(n=>{n.textContent=version;});
      document.querySelectorAll('[data-kt-module-count]').forEach(n=>{n.textContent=String(count);});
      document.querySelectorAll('[data-kt-build]').forEach(n=>{n.textContent=build;});
    })();
    KinetoPlayground.capture(document);
    // Card convention: a title plus up to two lines of description. Keep preset
    // names as stable API identifiers, but describe each renderer in the Korean
    // source language so the normal copy-i18n pass can translate it.
    (()=>{
      let presets=[];
      try{ presets=Kineto.listTerminalFramePresets?.()||[]; }catch(_){ }
      if(!presets.length)return;
      const byId=new Map(presets.map(p=>[p.id,p]));
      const descriptions={
        'text-frame':'문자를 한 칸씩 바꾸는 가벼운 터미널 스피너입니다.',
        'multiline-frame':'여러 문자 프레임을 순서대로 바꾸는 터미널 스피너입니다.',
        'matrix-frame':'여러 점의 밝기와 위치를 바꾸는 터미널 스피너입니다.',
        'marquee-frame':'고정 폭 트랙 안에서 기호가 이동하는 터미널 스피너입니다.',
        'cursor-frame':'문구 뒤의 커서로 진행 상태를 표시합니다.',
        'compound-frame':'스피너와 상태 정보를 한 줄에 조합합니다.'
      };
      const presetDescriptions={
        braille:'두 점이 셀 가장자리를 따라 회전하는 점자 스피너입니다.',
        'braille-pulse':'점자 세로 막대가 차오르고 잠시 멈춘 뒤 비워집니다.',
        circle:'부채꼴 문자가 시계 방향으로 회전합니다.',
        clock:'시계 얼굴이 12시·3시·6시·9시 순서로 바뀝니다.'
      };
      document.querySelectorAll('.loader-preview--frame [data-kt-terminal-style]').forEach((node)=>{
        const card=node.closest('article.card');
        if(!card||card.querySelector(':scope > p'))return;
        const preset=byId.get(node.getAttribute('data-kt-terminal-style'));
        const description=presetDescriptions[preset?.id]||descriptions[preset?.renderer];
        if(!description)return;
        const p=document.createElement('p');
        p.textContent=description;
        card.querySelector(':scope > h3')?.insertAdjacentElement('afterend',p);
      });
    })();

    // Deterministic startup: every effect waits for the FULL page load
    // (window 'load'), covered by a slot intro loader — so the entrance
    // choreography plays in the intended order on any connection speed.
    (()=>{
      const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
      // The intro loader is a showcase, not an entry barrier (audit D-6): skip it
      // on reduced-motion, Save-Data, or a repeat visit this session — so those
      // visitors get straight to content with no forced ~1.1s delay.
      const conn=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
      const saveData=Boolean(conn&&conn.saveData);
      // Slow network (2g/slow-2g) or a low-power device shouldn't be held behind
      // a ~1.1s showcase loader either (audit D-6).
      const slowConn=Boolean(conn&&/(^|-)2g$/.test(String(conn.effectiveType||'')));
      const lowPerf=(()=>{ try{ return Kineto.performance==='low'; }catch(_){ return (navigator.deviceMemory&&navigator.deviceMemory<=2)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=2); } })();
      let seen=false; try{ seen=sessionStorage.getItem('kt-intro-seen')==='1'; }catch(_){ }
      const skipIntro=reduced||saveData||slowConn||lowPerf||seen;
      try{ sessionStorage.setItem('kt-intro-seen','1'); }catch(_){ }
      // Back/forward cache restore: the page already ran its intro, so if the
      // browser serves it from bfcache just make sure the preload veil is gone.
      try{ window.addEventListener('pageshow',(e)=>{ if(e.persisted) document.documentElement.classList.remove('kt-preload'); }); }catch(_){ }
      let started=false;
      const startModules=()=>{ if(started)return; started=true; try{Kineto.init(document);}catch(_){}
        document.documentElement.classList.remove('kt-preload');
        // Restore a bookmarked #hash once modules are up: the intro locks scroll
        // and lazy images / reveals shift layout, so the browser's initial jump
        // lands in the wrong place. Re-scroll a few times as things settle, and
        // bail the moment the visitor scrolls themselves.
        const hash=location.hash;
        const initMod=/^#mod-([A-Za-z0-9]+)$/.exec(hash||'');
        if(initMod){
          // Deep link to a module: route through the unified navigator so scroll,
          // active nav and hash all land together (retry as late layout settles).
          const name=initMod[1];
          let cancelled=false;
          const go=()=>{ if(cancelled)return; try{navigateToModule(name,{source:'initial',history:'replace'});}catch(_){} };
          window.addEventListener('wheel',()=>{cancelled=true;},{passive:true,once:true});
          window.addEventListener('touchmove',()=>{cancelled=true;},{passive:true,once:true});
          requestAnimationFrame(go); setTimeout(go,260); setTimeout(go,800);
          setTimeout(enableHashClear,1200);
        } else if(hash&&hash.length>1){
          let cancelled=false;
          const stop=()=>{cancelled=true;};
          const jump=()=>{ if(cancelled)return; let t=null; try{t=document.querySelector(hash);}catch(_){} if(t)t.scrollIntoView(); };
          window.addEventListener('wheel',stop,{passive:true,once:true});
          window.addEventListener('touchmove',stop,{passive:true,once:true});
          requestAnimationFrame(jump); setTimeout(jump,260); setTimeout(jump,800);
        }
      };
      // Skip the intro (reduced-motion / Save-Data / repeat visit): no overlay,
      // just start modules once the page is ready.
      if(skipIntro){
        if(document.readyState==='complete')startModules();
        else window.addEventListener('load',startModules,{once:true});
        return;
      }
      const overlay=document.createElement('div');
      // Geometry and the light brand canvas live in `.intro-loader` in
      // styles.css — no inline style strings anywhere in the demo.
      overlay.className='intro-loader';
      const introBg=getComputedStyle(document.documentElement).getPropertyValue('--intro-bg').trim()||'#efe9de';
      const wordmark=document.createElement('span');
      wordmark.className='kt-loader-wordmark';
      wordmark.textContent='Kineto';
      overlay.appendChild(wordmark);
      document.body.appendChild(overlay);
      // One root class drives the whole intro state (scroll lock, released
      // scrollbar-gutter, painted <html>) — see `html.is-intro` in styles.css.
      // Doing it in CSS keeps the three concerns in one place and leaves nothing
      // to restore by hand except removing the class.
      document.documentElement.classList.add('is-intro');
      // Match the iOS status-bar / home-bar tint to the intro canvas so the notch
      // and home-bar areas blend with the loader while it fills.
      const introTcMeta = document.getElementById('theme-color-meta');
      introTcMeta?.setAttribute('content', introBg);
      // Fast/file loads can already be complete when this script runs —
      // resolve immediately then, otherwise the loader would never finish
      // (and skipping it entirely meant no intro at all).
      const pageLoaded=document.readyState==='complete'
        ? Promise.resolve()
        : new Promise(resolve=>window.addEventListener('load',resolve,{once:true}));
      let finished=false;
      const finishIntro=()=>{ if(finished)return; finished=true; if(overlay.parentNode)overlay.remove(); document.documentElement.classList.remove('is-intro'); introTcMeta?.setAttribute('content', getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()||'#0d0e12'); startModules(); };
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
      'Text':['textSplit','blurText','typewriter','textReveal','textTransition','textFill','overflowText','glitch','counter','dateTime'],
      'Media':['lazy','lightbox','slider','ambientMedia','brushReveal','scrollSequence','marquee','coverReveal'],
      'Scroll':['parallax','reveal','stickyStack','scrollVelocity','cssScroll','scrollShadows','stickyHeader','horizontalScroll','progress','fullpage'],
      'Pointer':['cursor','tilt','cardGlow','magnetic','ripple','vibrate','mouseParallax','gesture','drag'],
      'Components':['accordion','megaMenu','tabs','bottomSheet','tooltip','switch','flip'],
      'Feedback':['confetti','hold','toast'],
      'System':['loader','loadingIndicator','pageReveal','pageTransition']
    };
    // Modules whose data-kt-* attribute isn't inside a demo section (button-
    // triggered / body-level) map to their section by id instead.
    const SECTION_FALLBACK={loader:'loading',pageReveal:'content-reveal',pageTransition:'module-index',marquee:'text-effects',confetti:'buttons-feedback',hold:'buttons-feedback',toast:'buttons-feedback',gesture:'buttons-feedback',drag:'buttons-feedback',bottomSheet:'components',switch:'components'};
    const registered=new Set(Object.keys(Kineto.registry));
    // #module-list (Module Index) is rendered from the same manifest inside the
    // nav builder below, with a one-line description under each module name.
    // Shared: scroll to a module's live demo (used by the sidebar + Module Index).
    const targetSectionFor=(name)=>{
      const attr='data-kt-'+name.replace(/[A-Z]/g,m=>'-'+m.toLowerCase());
      let node=[...document.querySelectorAll('['+attr+']')].map(el=>el.closest('section[id]')).find(Boolean);
      if(!node&&SECTION_FALLBACK[name])node=document.getElementById(SECTION_FALLBACK[name]);
      return node;
    };
    // Scroll to the module's actual demo CARD (not just the category section),
    // so e.g. clicking "Counter" lands on the counter demo, centred in view.
    // B-2: single navigation function — every entry point (nav click, module
    // index chip, scroll observer, initial hash, Back/Forward) routes through
    // here so scroll position, active nav item and the URL hash stay in sync.
    const moduleTargetEl=(name)=>{
      const sub=document.getElementById('mod-'+name);
      if(sub) return sub;
      const attr='data-kt-'+name.replace(/[A-Z]/g,m=>'-'+m.toLowerCase());
      const elx=document.querySelector('main section[id] ['+attr+']')||document.querySelector('['+attr+']');
      return (elx&&(elx.closest('.card')||elx.closest('article')||elx))||targetSectionFor(name)||null;
    };
    const setActiveNav=(name)=>{
      document.querySelectorAll('#side-nav-modules .nav-mod.active').forEach(a=>a.classList.remove('active'));
      const link=document.querySelector('#side-nav-modules [data-module="'+CSS.escape(name)+'"]');
      if(link) link.classList.add('active');
    };
    const writeModuleHash=(name,mode)=>{
      if(mode==='none') return;
      const h='#mod-'+name;
      if(location.hash===h) return;
      try{ if(mode==='push') history.pushState({ktModule:name},'',h); else history.replaceState({ktModule:name},'',h); }catch(_){/* file:// */}
    };
    // While a programmatic scroll is in flight, suppress the scroll observer's
    // replaceState so it can't fight the click's pushState.
    let navScrollLock=false;
    const navigateToModule=(name,opts={})=>{
      if(!name) return;
      const source=opts.source||'click';
      const mode=opts.history||(source==='scroll'?'replace':source==='history'?'none':source==='initial'?'replace':'push');
      const el=moduleTargetEl(name);
      setActiveNav(name);
      if(opts.scroll!==false && el && source!=='scroll'){
        navScrollLock=true;
        el.scrollIntoView({behavior:source==='initial'||source==='history'?'auto':'smooth',block:'start'});
        clearTimeout(navigateToModule._t);
        navigateToModule._t=setTimeout(()=>{navScrollLock=false;},1200);
      }
      writeModuleHash(name,mode);
    };
    // Back/Forward and manual hash edits — move without pushing new history.
    const moduleFromHash=()=>{ const h=location.hash; const m=/^#mod-([A-Za-z0-9]+)$/.exec(h); return m?m[1]:null; };
    window.addEventListener('popstate',()=>{ const n=moduleFromHash(); if(n) navigateToModule(n,{source:'history',history:'none'}); });
    window.addEventListener('hashchange',()=>{ const n=moduleFromHash(); if(n && !navScrollLock) navigateToModule(n,{source:'history',history:'none'}); });
    // Back-compat alias used by older call sites.
    const scrollToModule=(name)=>navigateToModule(name,{source:'click',history:'push'});
    // Module Index 뱃지 → 해당 모듈 데모 섹션으로 스크롤
    document.getElementById('module-list').addEventListener('click',(event)=>{
      const chip=event.target.closest('[data-module]');
      if(chip)scrollToModule(chip.dataset.module);
    });
    document.getElementById('module-list').addEventListener('keydown',(event)=>{
      if(event.key==='Enter'||event.key===' '){
        const chip=event.target.closest('[data-module]');
        if(chip){event.preventDefault();chip.click();}
      }
    });

    // ── Categorized + searchable sidebar nav ──────────────────────────────
    (()=>{
      const host=document.getElementById('side-nav-modules');
      const search=document.getElementById('nav-search');
      const empty=document.getElementById('nav-empty');
      if(!host)return;
      const labelize=(n)=>n.replace(/([a-z0-9])([A-Z])/g,'$1 $2').replace(/^./,c=>c.toUpperCase());
      // Category nav (Text / Media / Scroll / …), ordered by where each category
      // first appears on the page and by DOM order within.
      // Fixed category order (matches the content's category ordering). Inside
      // each category, order modules by the ACTUAL on-page position of their
      // first demo (compareDocumentPosition) — after merging sections into one
      // per category, a section-index sort was no longer fine-grained enough.
      const attrOf=(n)=>'data-kt-'+n.replace(/[A-Z]/g,m=>'-'+m.toLowerCase());
      // ─────────────────────────────────────────────────────────────────────
      // SINGLE SOURCE OF TRUTH = MODULE_GROUPS (the left nav definition).
      // The left nav AND the right content blocks are both generated FROM it, in
      // the SAME order. Left order == right order BY CONSTRUCTION — we never read
      // the DOM order and sort the other side to it. Each right block carries
      // data-module-block + id="mod-<name>" + a title (identical to the nav
      // label) + a subtitle, and owns its demo(s) explicitly.
      // ─────────────────────────────────────────────────────────────────────
      const LABEL_OVERRIDE={cssScroll:'CSS Scroll',loader:'Loader'};
      const labelOf=(n)=>LABEL_OVERRIDE[n]||labelize(n);
      const MODULE_STATUS=window.KINETO_MODULE_METADATA||{};
      const qualityMeta=(name)=>{
        const meta=MODULE_STATUS[name];
        if(!meta)return '';
        const labels=[['A11Y',meta.accessibility],['PERF',meta.performance],['RM',meta.reducedMotion]];
        const aria=labels.map(([label,value])=>`${label} ${value}`).join(' · ');
        return `<span class="module-quality-meta" data-module-quality="${name}" aria-label="${aria}" title="${aria}">${labels.map(([label,value])=>`<span class="module-quality-meta__item module-quality-meta__item--${value}" data-quality-${label.toLowerCase()}="${value}"><b>${label}</b> ${value}</span>`).join('')}</span>`;
      };
      const SUBS={
        textSplit:'문장을 글자·단어 단위로 쪼개 3D로 등장·교체.',blurText:'흐림에서 또렷하게, 스태거로 등장.',shuffle:'랜덤 글리프로 흩뿌린 뒤 확정.',typewriter:'타이핑·한글 자모 조합·캐럿.',textReveal:'글자별 점멸 후 확정되는 등장.',textTransition:'문장을 글자 단위로 교체.',textFill:'스크롤 진행률로 글자에 색이 차오름.',overflowText:'컨테이너보다 긴 텍스트의 여덟 가지 순환.',glitch:'RGB 분리·픽셀 시프트·데이터모시.',counter:'카운트업·플립·시계·카운트다운.',dateTime:'서버 날짜를 상대 시간·절대 시간으로 표시.',
        lazy:'이미지 로딩 중 재생되는 전환들.',lightbox:'전체화면 그룹 뷰어 — 줌·미니맵·필름스트립.',slider:'커버플로우 슬라이더.',ambientMedia:'재생 프레임을 샘플링한 주변광.',brushReveal:'포인터로 문질러 드러내는 브러시 마스크.',scrollSequence:'스크롤로 이미지 프레임을 스크럽.',marquee:'무한 흐름 마퀴.',radial:'원형 캐러셀(도크형).',coverReveal:'커버가 걷히며 콘텐츠 등장.',
        parallax:'레이어가 다른 속도로 움직여 깊이를 만듦.',reveal:'진입 시 방향·마스크·클록 등장.',stickyStack:'핀 고정 스택 — 세로·가로·플로팅.',scrollVelocity:'스크롤 속도·방향에 반응.',cssScroll:'CSS 애니메이션 타임라인에 연결.',scrollShadows:'스크롤 가능 영역에 엣지 그림자.',stickyHeader:'스크롤에 반응하는 고정 헤더.',horizontalScroll:'세로 스크롤로 가로 이동.',progress:'읽기 진행률 바·링.',fullpage:'한 화면씩 넘기는 풀페이지.',
        cursor:'커스텀 커서 프리셋.',tilt:'포인터 추종 3D 틸트 + 글레어.',cardGlow:'표면 반사·외곽 광택 글로우.',magnetic:'포인터로 끌려오는 자석 버튼.',ripple:'클릭 지점에서 퍼지는 리플.',vibrate:'햅틱 진동 패턴.',mouseParallax:'마우스·자이로 시차 이동.',gesture:'hover·press 스프링 제스처.',drag:'관성·경계·키보드 드래그.',
        accordion:'접근성 details 아코디언.',megaMenu:'GNB 드롭다운·메가메뉴.',tabs:'WAI-ARIA 탭·세그먼트.',bottomSheet:'드래그 바텀시트.',tooltip:'자동 배치 툴팁.',switch:'폼 연동 토글 스위치.',flip:'레이아웃 변화 FLIP 애니메이션.',
        confetti:'클릭·뷰 색종이 버스트.',hold:'길게 눌러 확정하는 게이지.',toast:'상태 알림 토스트.',
        loader:'실제 진행률과 연결된 전체 화면 로더.',loadingIndicator:'콘텐츠 안에 놓는 스피너·바·텍스트 인디케이터.',pageReveal:'페이지 진입 오버레이.',pageTransition:'동일 출처 페이지 전환.'
      };
      // Left nav — straight from MODULE_GROUPS order. href points at the block id.
      host.innerHTML=Object.entries(MODULE_GROUPS)
        .map(([group,names])=>({group,items:names.filter(n=>registered.has(n))}))
        .filter(g=>g.items.length)
        .map(({group,items})=>{
          const links=items.map(n=>
            `<a class="nav-mod" data-module="${n}" href="#mod-${n}" data-name="${n.toLowerCase()}" data-label="${labelOf(n).toLowerCase()}">${labelOf(n)}</a>`
          ).join('');
          return `<section class="nav-cat" data-cat>
            <button type="button" class="nav-cat-head" aria-expanded="true"><span>${group}</span><i class="ph-bold ph-caret-down" aria-hidden="true"></i></button>
            <div class="nav-cat-list">${links}</div>
          </section>`;
        }).join('');
      // Module Index used to sit as the last nav category, so it blended into the
      // module hierarchy. Pull it out into a distinct sticky footer at the bottom
      // of the nav (divider + gear icon) so it reads as a separate destination.
      (()=>{
        const inner=host.closest('.side-nav-inner'); if(!inner) return;
        let foot=inner.querySelector('.side-nav-foot');
        if(!foot){ foot=document.createElement('div'); foot.className='side-nav-foot'; inner.appendChild(foot); }
        foot.innerHTML='<a class="nav-index" href="#module-index" data-name="module index" data-label="module index"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 4H21V6H8V4ZM3 3.5H6V6.5H3V3.5ZM3 10.5H6V13.5H3V10.5ZM3 17.5H6V20.5H3V17.5ZM8 11H21V13H8V11ZM8 18H21V20H8V18Z"/></svg><span>Module Index</span></a>';
      })();

      // Module Index — same manifest, every module with a one-line description
      // under its name. Count equals the registry exactly (no stale/extra items).
      const mlHost=document.getElementById('module-list');
      if(mlHost){
        mlHost.innerHTML=Object.entries(MODULE_GROUPS)
          .map(([group,names])=>({group,items:names.filter(n=>registered.has(n))}))
          .filter(g=>g.items.length)
          .map(({group,items})=>{
            const cells=items.map(n=>
              `<button type="button" class="mod-index-item" data-module="${n}" title="데모로 이동"><span class="mii-name">${labelOf(n)}</span><span class="mii-sub">${SUBS[n]||''}</span>${qualityMeta(n)}</button>`
            ).join('');
            return `<div class="module-group"><p class="module-group-label">${group}</p><div class="module-group-chips">${cells}</div></div>`;
          }).join('');
      }

      // Right content — rebuild each category section as manifest-ordered module
      // blocks, MOVING each demo unit into its owning module's block. Ownership is
      // EXPLICIT (data-demo-module) or unambiguous (a unit with exactly one
      // module); it is never guessed from attribute order.
      (function buildContent(){
        const CAT_SECTION={Text:'counter',Media:'lazy',Scroll:'content-reveal',Pointer:'pointer',Components:'components',Feedback:'buttons-feedback',System:'loading'};
        const attr2mod={}; registered.forEach(m=>{attr2mod[attrOf(m)]=m;});
        const modsIn=(el)=>{const s=new Set();const scan=n=>{for(const a of n.getAttributeNames())if(attr2mod[a])s.add(attr2mod[a]);};scan(el);el.querySelectorAll('*').forEach(scan);
          if(el.matches('[data-loader-type]')||el.querySelector('[data-loader-type]'))s.add('loader');
          if(el.matches('[data-page-effect]')||el.querySelector('[data-page-effect]'))s.add('pageReveal');
          return [...s];};
        const unitSel='.card, .reveal-demo-card, .hscroll-demo-unit, .scroll-demo-unit, [data-demo-module], [data-kt-sticky-stack], [data-kt-horizontal-scroll], [data-kt-scroll-sequence], [data-loader-type]';
        const raw=[...document.querySelectorAll('main '+unitSel)];
        const units=raw.filter(u=>!raw.some(o=>o!==u&&o.contains(u)));
        // Owner: explicit tag → the single module in the unit → the FIRST module
        // when several are combined (combo demos keep one owner) → null ONLY when
        // the unit carries no module signal at all. A null owner never causes a
        // deletion (see the orphan-safe clear below).
        const ownerOf=(u)=>{ if(u.dataset.demoModule)return u.dataset.demoModule; const m=modsIn(u); return m.length?m[0]:null; };
        const byOwner={}; units.forEach(u=>{const o=ownerOf(u); if(o&&registered.has(o))(byOwner[o]=byOwner[o]||[]).push(u);});
        // Units that resolved to no owning module — kept in place, never deleted.
        const moved=new Set(Object.values(byOwner).flat());
        const orphans=units.filter(u=>!moved.has(u));
        try{ window.__ktDemoOrphans=orphans.length; }catch(_e){}
        if(orphans.length) console.warn('[kineto-demo] '+orphans.length+' demo unit(s) have no resolvable module owner and were kept in place:',orphans);
        // Layout per module: a 3-up responsive grid ONLY for 2+ plain cards.
        // Full-width / special demos (standalone scroll demos, .card.full) and
        // single-card modules stack full width so nothing gets squeezed.
        // Grid whenever a module has 2+ CARD demos — cards flow 3-up / 50-50 and
        // a `.card.full` still spans a full row inside the grid. Only standalone
        // demos (scroll-sequence / sticky-stack / horizontal-scroll, which aren't
        // `.card`) or single-card modules stack full width.
        // Sub-grouping: [label, test] pairs, evaluated in order. Anything that
        // matches nothing lands in the trailing "기타" bucket.
        const SUBGROUPS={
          loadingIndicator:[
            ['스피너', u=>u.querySelector('[data-kt-loading-indicator="spinner"]')],
            ['도트', u=>u.querySelector('[data-kt-loading-indicator="dots"]')],
            ['진행 바', u=>u.querySelector('[data-kt-loading-indicator="bar"]')],
            ['텍스트', u=>u.querySelector('[data-kt-loading-indicator="shimmer"],[data-kt-loading-indicator="shimmer-wave"]')],
            ['터미널 · 미터/커서', u=>u.querySelector('[data-kt-terminal-style="meter"],[data-kt-terminal-style="cursor"],[data-kt-terminal-style="dots"],[data-kt-terminal-style="blocks"]')],
            ['터미널 · 프레임 스피너', u=>u.querySelector('[data-kt-loading-indicator="terminal"]')]
          ],
          counter:[
            ['숫자', u=>!['Clock','Elapsed seconds','Countdown'].includes(u.querySelector('h3')?.textContent.trim())],
            ['시간', u=>['Clock','Elapsed seconds','Countdown'].includes(u.querySelector('h3')?.textContent.trim())]
          ]
        };
        const groupUnits=(list,rules)=>{
          const used=new Set();
          const out=rules.map(([label,test])=>{
            const units=list.filter(u=>!used.has(u)&&test(u));
            units.forEach(u=>used.add(u));
            return [label,units];
          }).filter(([,units])=>units.length);
          const rest=list.filter(u=>!used.has(u));
          if(rest.length) out.push(['기타',rest]);
          return out;
        };
        // Per-module / per-sub-group column counts. Some modules have small
        // previews that waste a 3-up row (lazy, cursor) and some have text
        // demos that only need a font tweak to fit three across.
        const MODULE_COLS={lazy:4,cursor:3,textReveal:3,textSplit:3,overflowText:3,scrollVelocity:3,progress:3,fullpage:3};
        const SUBGROUP_COLS={'터미널 · 미터/커서':3};
        const applyCols=(body,count)=>{
          if(!count||!body.classList.contains('grid'))return;
          body.classList.add('module-block-body--cols-'+count);
        };
        // If the final row holds a single card, let it claim the row. Measured
        // rather than counted: a `.card.full` earlier in the grid takes a whole
        // row on its own, so any nth-child guess is wrong.
        // Any incomplete last row is split evenly between the cards left in it —
        // one card takes the row, two take 50/50, three take a third each. The
        // grid is 12 tracks wide precisely so those fractions are whole spans.
        // Measured, not counted: a `.card.full` earlier in the grid claims a whole
        // row and shifts every nth-child guess.
        const LAST_ROW_CLASSES=['is-last-row-1','is-last-row-2','is-last-row-3','is-last-row-4'];
        const markLoneLastCard=(body)=>{
          const cards=[...body.children].filter(c=>c.classList.contains('card'));
          cards.forEach(c=>c.classList.remove('is-row-filler',...LAST_ROW_CLASSES));
          if(!cards.length)return;
          if(cards.length===1){
            cards[0].classList.add('is-last-row-1');
            return;
          }
          // Group by row using the measured top edge, then re-measure once the
          // classes are off so a previous pass cannot bias the grouping.
          const rows=new Map();
          cards.forEach(c=>{const top=Math.round(c.getBoundingClientRect().top);
            if(!rows.has(top))rows.set(top,[]);
            rows.get(top).push(c);});
          const tops=[...rows.keys()].sort((a,b)=>a-b);
          if(tops.length<2)return;
          const last=rows.get(tops[tops.length-1]);
          const widest=Math.max(1,...[...rows.values()]
            .filter(row=>!row.some(card=>card.classList.contains('full')))
            .map(row=>row.length));
          // A full last row needs no help.
          if(last.length>=widest||last.length>LAST_ROW_CLASSES.length)return;
          const cls=LAST_ROW_CLASSES[last.length-1];
          last.forEach(c=>c.classList.add(cls));
        };
        const rebalanceRows=()=>{
          document.querySelectorAll('.module-block-body.grid').forEach(markLoneLastCard);
        };
        const rowBalanceObserver='ResizeObserver' in window
          ? new ResizeObserver((entries)=>entries.forEach(({target})=>markLoneLastCard(target)))
          : null;
        let rowBalanceFrame=0;
        // ResizeObserver already reports only grids whose width changed. Avoid a
        // second full-page measurement pass on every resize — the Loading
        // Indicator gallery alone contains 40+ animated cards.
        if(!rowBalanceObserver) window.addEventListener('resize',()=>{
          if(rowBalanceFrame)cancelAnimationFrame(rowBalanceFrame);
          rowBalanceFrame=requestAnimationFrame(()=>{rowBalanceFrame=0;rebalanceRows();});
        });
        const layoutFor=(list)=>{
          const hasStandalone=list.some(u=>!u.classList.contains('card'));
          const cards=list.filter(u=>u.classList.contains('card')).length;
          return (!hasStandalone && cards>=2) ? 'module-block-body grid' : 'module-block-body module-block-body--stack';
        };
        // Phase 1: build each category's blocks. appendChild MOVES the unit node,
        // detaching it from its old grid, so nothing is lost when we clear next.
        const wraps={};
        Object.entries(MODULE_GROUPS).forEach(([cat,names])=>{
          const wrap=document.createElement('div'); wrap.className='module-blocks';
          names.filter(n=>registered.has(n)).forEach(n=>{
            const list=byOwner[n]||[];
            const block=document.createElement('section');
            block.className='module-block'; block.id='mod-'+n; block.setAttribute('data-module-block',n);
            // scroll-margin-top lives in `.module-block` (styles.css). It used to
            // be written inline as 78px here, which silently overrode the 82px in
            // CSS — two sources of truth disagreeing by 4px.
            const h=document.createElement('h3'); h.className='module-block-title'; h.textContent=labelOf(n);
            const p=document.createElement('p'); p.className='module-block-sub'; p.textContent=SUBS[n]||'';
            block.append(h,p);
            const quality=document.createElement('div');
            quality.className='module-block-quality';
            quality.innerHTML=qualityMeta(n);
            block.append(quality);
            // Some modules ship far too many demos for one flat grid (Loading
            // Indicator alone has 40+). Those declare a sub-grouping so the
            // block reads as a few short, labelled sets instead of one wall.
            const groups=SUBGROUPS[n]?groupUnits(list,SUBGROUPS[n]):null;
            if(groups&&groups.length>1){
              groups.forEach(([label,units])=>{
                const sh=document.createElement('h4');
                sh.className='module-subgroup'; sh.textContent=label;
                const sb=document.createElement('div'); sb.className=layoutFor(units);
                if(n==='counter'&&label==='시간')sb.classList.add('module-block-body--counter-time');
                // A long set of tiny previews (the 35 frame spinners) would run
                // for a dozen rows at the default 3-up. Pack those denser.
                if(units.length>=12) sb.classList.add('module-block-body--dense');
                applyCols(sb,SUBGROUP_COLS[label]||MODULE_COLS[n]);
                units.forEach(u=>sb.appendChild(u));
                block.append(sh,sb);
              });
            } else {
              const body=document.createElement('div'); body.className=layoutFor(list);
              applyCols(body,MODULE_COLS[n]);
              list.forEach(u=>body.appendChild(u));
              block.append(body);
            }
            wrap.appendChild(block);
          });
          wraps[cat]=wrap;
        });
        // Phase 2: append the rebuilt blocks and remove ONLY leftover containers
        // that hold no surviving unit — an orphan (and its wrapper) is preserved.
        requestAnimationFrame(()=>requestAnimationFrame(()=>{
          rebalanceRows();
          rowBalanceObserver?.disconnect();
          document.querySelectorAll('.module-block-body.grid').forEach(body=>rowBalanceObserver?.observe(body));
        }));
        Object.entries(CAT_SECTION).forEach(([cat,secId])=>{
          const sec=document.getElementById(secId); if(!sec||!wraps[cat])return;
          const head=sec.querySelector('.section-head');
          [...sec.children].forEach(c=>{
            if(c===head||c===wraps[cat]) return;
            const holdsOrphan=orphans.some(u=>u===c||c.contains(u));
            if(!holdsOrphan) c.remove();
          });
          sec.appendChild(wraps[cat]);
        });
      })();
      // Navigate
      host.addEventListener('click',(e)=>{
        const head=e.target.closest('.nav-cat-head');
        if(head){const cat=head.closest('.nav-cat');const open=cat.classList.toggle('collapsed');head.setAttribute('aria-expanded',open?'false':'true');return;}
        const mod=e.target.closest('.nav-mod');
        if(mod){e.preventDefault();navigateToModule(mod.dataset.module,{source:'click',history:'push'});}
      });
      // Live search filter
      const filter=()=>{
        const q=(search.value||'').trim().toLowerCase();
        let anyVisible=false;
        host.querySelectorAll('.nav-cat').forEach(cat=>{
          let catVisible=false;
          cat.querySelectorAll('.nav-mod').forEach(a=>{
            const hit=!q||a.dataset.name.includes(q)||a.dataset.label.includes(q);
            a.hidden=!hit; if(hit){catVisible=true;anyVisible=true;}
          });
          cat.hidden=!catVisible;
          if(q)cat.classList.remove('collapsed'); // auto-expand while searching
        });
        if(empty)empty.hidden=anyVisible;
      };
      search?.addEventListener('input',filter);
      // '/' focuses search
      document.addEventListener('keydown',(e)=>{
        if(e.key==='/'&&document.activeElement!==search&&!/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName||'')){e.preventDefault();search?.focus();}
      });
      // Active highlight while scrolling — observe the per-module BLOCKS and
      // light the nav link whose data-module === the block's data-module-block.
      // Same id space as the href (#mod-<name>), so click/scroll/URL agree.
      if('IntersectionObserver'in window){
        const seen=new Map();
        const io=new IntersectionObserver((ents)=>{
          ents.forEach(en=>seen.set(en.target,en.isIntersecting?en.intersectionRatio:0));
          let best=null,bestR=0;
          seen.forEach((r,blk)=>{if(r>bestR){bestR=r;best=blk;}});
          if(!best||!bestR)return;
          const mod=best.getAttribute('data-module-block');
          const link=host.querySelector(`.nav-mod[data-module="${mod}"]`);
          if(link){host.querySelectorAll('.nav-mod.active').forEach(a=>a.classList.remove('active'));link.classList.add('active');
            link.scrollIntoView({block:'nearest'});}
        },{threshold:[0.15,0.4,0.7]});
        document.querySelectorAll('main [data-module-block]').forEach(s=>io.observe(s));
      }
    })();
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
      // every button press runs a fresh reveal. The whole page is the intended
      // demo surface, including the persistent header.
      Kineto.destroyModule(document.body,'pageReveal');
      const panelOptions=window.KinetoPlayground?.pageRevealOptions?.()||{duration:.65,color:getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#ff5b1c',color2:'#101318'};
      Kineto.pageReveal(document.body,{...panelOptions,effect});
    };
    document.getElementById('page-reveal-demo')?.addEventListener('click',()=>runPageReveal('curtain'));
    document.querySelectorAll('[data-page-effect]').forEach(button=>button.addEventListener('click',()=>runPageReveal(button.dataset.pageEffect)));

    // Loader demo is owned SOLELY by demo/playground.js (settings-connected).
    // A second binding here previously fired Kineto.loader a second time per
    // click → two overlays, and its hideScrollbar-default:true instance locked
    // <html>/<body> overflow so the sticky side-nav collapsed and the page froze.
    const smoothToggle=document.getElementById('smooth-toggle');
    const syncSmoothLabel=(on)=>{
      const label=smoothToggle?.closest('.smooth-switch')?.querySelector('strong');
      if(label)label.textContent=on?'켜짐':'꺼짐';
    };
    // Turn it on for real so the switch's checked state is honest. Lenis and the
    // hero's one-flick snap both want the wheel event, and Lenis wins — which
    // killed the snap. So smooth scrolling stays off WHILE the hero is on screen
    // and switches on the moment the visitor is past it (and back off if they
    // return to the top). The switch still overrides this manually.
    let smoothManual=false;
    const smoothWanted=()=>smoothToggle?smoothToggle.checked:wantsSmooth;
    const heroEl=document.querySelector('.hero');
    const pastHero=()=>!heroEl||window.scrollY>heroEl.offsetHeight-120;
    let smoothOn=false;
    const syncSmoothForScroll=()=>{
      // The hero scene controller owns this short programmatic landing. Starting
      // Lenis in the middle of it turns an instant snap into a second easing pass.
      if(window.__ktHeroSceneSnap)return;
      if(smoothManual)return;
      const shouldRun=smoothWanted()&&pastHero();
      if(shouldRun===smoothOn)return;
      smoothOn=shouldRun;
      try{ shouldRun?Kineto.enableSmooth({duration:isSafari?.72:1.05}):Kineto.disableSmooth(); }catch(_){}
    };
    if(smoothToggle){
      smoothToggle.checked=wantsSmooth;
      syncSmoothLabel(wantsSmooth);
    }
    window.addEventListener('scroll',syncSmoothForScroll,{passive:true});
    syncSmoothForScroll();
    smoothToggle?.addEventListener('change',(event)=>{
      const checked=event.currentTarget.checked;
      // An explicit choice wins over the hero heuristic from here on.
      smoothManual=true;
      smoothOn=checked;
      if(checked)Kineto.enableSmooth({duration:isSafari?.72:1.05});
      else Kineto.disableSmooth();
      syncSmoothLabel(checked);
    });
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

    // Language: Korean source plus six complete static translations.
    (()=>{
      const select=document.getElementById('lang');
      if(!select)return;
      const LANGS=window.KINETO_COPY_I18N?.langs||{};
      // Module count comes from the live registry. Locale strings may outlive a
      // registry refactor, so normalize their old numeric copy at runtime.
      const moduleCount=registered.size;
      const normalizeCount=(value)=>{
        if(Array.isArray(value))return value.map(normalizeCount);
        if(value&&typeof value==='object'){Object.keys(value).forEach(key=>{value[key]=normalizeCount(value[key]);});return value;}
        return typeof value==='string'?value.replace(/\b(?:34|50|51)\b/g,String(moduleCount)):value;
      };
      Object.values(LANGS).forEach(normalizeCount);
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
      const CARD_I18N=window.KINETO_COPY_I18N?.cards||{};
      const TITLE_I18N=window.KINETO_COPY_I18N?.titles||{};
      const UI_I18N=window.KINETO_COPY_I18N?.ui||{};
      Object.assign(CARD_I18N,{
        '서버가 내려준 날짜를 n분 전 같은 상대 시간으로 표시합니다.':[
          'Shows a server-rendered timestamp as relative time, such as n minutes ago.',
          'サーバー日時を「n分前」のような相対時刻で表示します。',
          '将服务器日期显示为“n 分钟前”等相对时间。',
          '將伺服器日期顯示為「n 分鐘前」等相對時間。',
          'Показывает дату с сервера как относительное время, например «n минут назад».',
          'Mostra una data del server in forma relativa, ad esempio «n minuti fa».'
        ]
      });
      const LANG_IDX={"en": 0, "ja": 1, "zh-CN": 2, "zh-TW": 3, "ru": 4, "it": 5};
      const cleanCopy=(value)=>value.replace(/\s+/g,' ').trim();
      const cardNodes=[...document.querySelectorAll([
        'main .card > p',
        'main .scroll-demo-unit > p',
        'main .hscroll-demo-unit > p',
        'main .sticky-stack-unit > p',
        'main .reveal-demo-card > p',
        'main .glow-demo > div > p'
      ].join(','))]
        .filter(node=>/[가-힣]/.test(node.textContent))
        .map(node=>({node,ko:node.innerHTML,key:cleanCopy(node.textContent)}));
      const titleNodes=[...document.querySelectorAll('article.card > h3')]
        .filter(node=>/[가-힣]/.test(node.textContent))
        .map(node=>({node,ko:node.textContent,key:cleanCopy(node.textContent)}));
      const navSearch=document.getElementById('nav-search');
      const navEmpty=document.getElementById('nav-empty');
      const exploreLink=document.querySelector('.hero-actions a[href="#counter"]');
      const backToTop=document.querySelector('.footer-fine a[href="#top"]');
      const uiNodes=[
        {node:navSearch,key:'모듈 검색…',kind:'placeholder'},
        {node:navEmpty,key:'검색 결과가 없습니다.',kind:'text'},
        {node:exploreLink,key:'모듈 보기',kind:'text'},
        {node:backToTop,key:'맨 위로',kind:'text'},
        ...[...document.querySelectorAll('[data-demo-i18n]')].map((node)=>({
          node,
          key:node.dataset.demoI18n,
          kind:node.hasAttribute('data-kt-progress-output')?'progress-template':'text'
        }))
      ].filter(item=>item.node);
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
        titleNodes.forEach(({node,ko,key})=>{
          const translated=dict&&TITLE_I18N[key]?TITLE_I18N[key][LANG_IDX[lang]]:null;
          node.textContent=dict?(translated||ko):ko;
        });
        uiNodes.forEach(({node,key,kind})=>{
          const translated=dict&&UI_I18N[key]?UI_I18N[key][LANG_IDX[lang]]:null;
          const value=dict?(translated||key):key;
          if(kind==='placeholder')node.placeholder=value;
          else if(kind==='progress-template'){
            const progress=node.dataset.ktProgressValue||node.textContent.match(/\d+(?:\.\d+)?/)?.[0]||'0';
            node.dataset.ktProgressTemplate=value;
            node.textContent=value.replaceAll('{value}',progress).replaceAll('{progress}',progress);
          } else node.textContent=value;
        });
        document.querySelectorAll('[data-module-block] .module-block-sub').forEach((subtitle)=>{
          const block=subtitle.closest('[data-module-block]');
          if(!subtitle.dataset.koSub)subtitle.dataset.koSub=subtitle.textContent;
          const localizedDescription=block?.querySelector('.card > p, .glow-demo > div > p, .scroll-demo-unit > p, .hscroll-demo-unit > p, .sticky-stack-unit > p')?.textContent?.trim();
          subtitle.textContent=dict?(localizedDescription||subtitle.dataset.koSub):subtitle.dataset.koSub;
        });
        document.querySelectorAll('.mod-index-item[data-module]').forEach((button)=>{
          const subtitle=button.querySelector('.mii-sub');
          if(!subtitle)return;
          if(!button.dataset.koSub)button.dataset.koSub=subtitle.textContent;
          const block=document.getElementById(`mod-${button.dataset.module}`);
          const localizedDescription=block?.querySelector('.card > p, .glow-demo > div > p, .scroll-demo-unit > p, .hscroll-demo-unit > p, .sticky-stack-unit > p')?.textContent?.trim();
          subtitle.textContent=dict?(localizedDescription||button.dataset.koSub):button.dataset.koSub;
          button.title=window.KINETO_PLAYGROUND_I18N?.[lang]?.demoLink
            ||window.KINETO_PLAYGROUND_I18N?.ko?.demoLink
            ||'데모로 이동';
        });
        window.KinetoPlayground?.refreshLocale?.();
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
      // Scroll observer routes through the SAME navigation helpers as clicks, so
      // active nav + URL hash stay consistent (B-2). Uses replaceState (no history
      // spam) and yields to programmatic scrolls (navScrollLock).
      const clearHash=()=>{ if(location.hash){ try{history.replaceState(null,'',location.pathname+location.search);}catch(_){/* file:// */} } };
      const io=new IntersectionObserver((entries)=>{
        if(navScrollLock) return;
        const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
        if(visible && /^mod-/.test(visible.target.id)){
          const name=visible.target.id.replace(/^mod-/,'');
          setActiveNav(name);
          if(window.scrollY>=48) writeModuleHash(name,'replace'); else if(allowHashClear) clearHash();
        } else if(window.scrollY<48 && allowHashClear) clearHash();
      },{rootMargin:'-30% 0px -55% 0px',threshold:[0,.2,.5]});
      sections.forEach(section=>io.observe(section));
      // Clear the hash if we settle back at the very top (hero) after scrolling up.
      window.addEventListener('scroll',()=>{if(window.scrollY<48&&location.hash&&!navScrollLock&&allowHashClear)clearHash();},{passive:true});
    })();
    // First-screen snap: a deliberate first wheel/touch gesture moves between
    // the hero and the first content scene. Momentum from that gesture is held
    // until the landing settles, so it cannot trigger the opposite snap.
    (()=>{
      if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
      const hero=document.querySelector('.hero');
      const target=document.getElementById('mod-textSplit')||document.querySelector('main [data-module-block]');
      if(!hero||!target)return;
      const firstModule=(target.id||'').replace(/^mod-/,'')||'textSplit';
      const landing=document.querySelector('main .section-head')||target;
      const SNAP_TAIL_MS=1200;
      let snapping=false,lastAt=0,consumed=false,ignoreUntil=0,snapDirection=0;
      const scrollScene=(top)=>{
        // Keep the intentional one-gesture scene transition visually smooth.
        // Lenis can otherwise take ownership midway through the native scene
        // scroll (especially going back to the hero) and leave it unfinished.
        const lenis=window.Kineto?.lenis;
        lenis?.stop?.();
        window.scrollTo({top,behavior:'smooth'});
        setTimeout(()=>lenis?.start?.(),900);
      };
      const snapTop=()=>{
        snapping=true;
        snapDirection=-1;
        window.__ktHeroSceneSnap=true;
        ignoreUntil=performance.now()+SNAP_TAIL_MS;
        scrollScene(0);
        try{history.replaceState(null,'',location.pathname+location.search);}catch(_){/* file:// */}
        setTimeout(()=>{snapping=false;snapDirection=0;window.__ktHeroSceneSnap=false;window.dispatchEvent(new Event('scroll'));},1000);
      };
      const inHero=()=>window.scrollY<hero.offsetHeight-120;
      const heroFullySeen=()=>window.scrollY+window.innerHeight>=hero.offsetHeight-4;
      const nearFirstSection=()=>window.scrollY>60&&window.scrollY<=landing.offsetTop+24;
      const snap=()=>{
        snapping=true;
        snapDirection=1;
        window.__ktHeroSceneSnap=true;
        ignoreUntil=performance.now()+SNAP_TAIL_MS;
        // Use an explicit document position. `scrollIntoView()` can be ignored
        // during a cancelled wheel event in WebKit, which left the URL changed
        // but the first scene still at the hero.
        const landingTop=Math.max(0,landing.offsetTop-96);
        scrollScene(landingTop);
        try{history.replaceState({ktModule:firstModule},'','#mod-'+firstModule);}catch(_){/* file:// */}
        setTimeout(()=>{snapping=false;snapDirection=0;window.__ktHeroSceneSnap=false;window.dispatchEvent(new Event('scroll'));},1000);
      };
      window.addEventListener('wheel',(event)=>{
        const now=performance.now();
        // Preserve physical momentum in the direction of travel. Only suppress
        // the short opposite-direction tail that used to re-trigger the other
        // scene and make the transition look like a bounce.
        if(now<ignoreUntil&&Math.sign(event.deltaY)!==snapDirection){event.preventDefault();return;}
        const sameGesture=now-lastAt<280;
        lastAt=now;
        if(!sameGesture)consumed=false;
        if(snapping||(sameGesture&&consumed))return;
        if(inHero()&&heroFullySeen()&&event.deltaY>8){event.preventDefault();consumed=true;snap();}
        else if(nearFirstSection()&&event.deltaY<-8){event.preventDefault();consumed=true;snapTop();}
      },{passive:false});
      document.getElementById('brand-home')?.addEventListener('click',snapTop);
      // The same intentional one-swipe movement is available on touch screens.
      // Listen on window so the reverse gesture still works in the intro gap;
      // only prevent its native scroll once this handler actually owns the swipe.
      let touchY=null,touchDone=false;
      window.addEventListener('touchstart',(event)=>{
        touchY=event.touches[0]?.clientY??null;
        touchDone=false;
      },{passive:true});
      window.addEventListener('touchmove',(event)=>{
        if(touchY==null)return;
        if(performance.now()<ignoreUntil||snapping||touchDone){
          if(touchDone||performance.now()<ignoreUntil)event.preventDefault();
          return;
        }
        const delta=touchY-(event.touches[0]?.clientY??touchY);
        const down=inHero()&&heroFullySeen()&&delta>26;
        const up=nearFirstSection()&&delta<-26;
        if(!down&&!up)return;
        event.preventDefault();
        touchDone=true;
        if(down)snap();else snapTop();
      },{passive:false});
      window.addEventListener('touchend',()=>{touchY=null;},{passive:true});
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
    // Replay with the currently selected order. The playground can still
    // switch start/end/center/random without this button forcing a preset.
    document.getElementById('list-reveal-replay')?.addEventListener('click',()=>{
      const list=document.getElementById('list-reveal-demo'); if(!list)return;
      Kineto.getInstance(list,'reveal')?.replay?.();
    });
    document.getElementById('cover-gallery-replay')?.addEventListener('click',async ()=>{
      const gallery=document.getElementById('cover-gallery-demo'); if(!gallery)return;
      const tiles=[...gallery.querySelectorAll('[data-kt-cover-reveal]')];
      const instances=tiles.map((tile)=>Kineto.getInstance(tile,'coverReveal')).filter(Boolean);
      // Honour the option: `watch` on = vanish -> reorder -> re-enter, `watch`
      // off = the plain FLIP move where tiles slide to their new slots. Ignoring
      // it made both settings look identical.
      const watching=tiles.some((tile)=>tile.getAttribute('data-kt-watch')==='true');
      if(watching&&instances.length&&typeof instances[0].exit==='function'){
        await Promise.all(instances.map((instance)=>instance.exit()));
        Kineto.getInstance(gallery,'flip')?.shuffle?.();
        instances.forEach((instance)=>instance.replay());
        return;
      }
      Kineto.getInstance(gallery,'flip')?.shuffle?.();
    });
    // Page Transition demo preview lives here (not as an inline script in the
    // HTML) so the demo markup stays declarative and the interaction is covered
    // by the same behavior bundle as the rest of the page.
    (function pageTransitionPreview(){
      const stage=document.querySelector('.pt-preview'); if(!stage)return;
      const screenA=stage.querySelector('.pt-a');
      const screenB=stage.querySelector('.pt-b');
      const cover=stage.querySelector('.pt-cover');
      const row=stage.querySelector('.pt-fx-row');
      const buttons=[...stage.querySelectorAll('[data-pt-preview]')];
      let toB=true;
      let busy=false;
      const moveIndicator=(button)=>{
        if(!row||!button)return;
        const firstSelection=!row.classList.contains('has-indicator');
        row.classList.toggle('is-first-selection',firstSelection);
        row.style.setProperty('--pt-tab-x',`${button.offsetLeft}px`);
        row.style.setProperty('--pt-tab-y',`${button.offsetTop}px`);
        row.style.setProperty('--pt-tab-w',`${button.offsetWidth}px`);
        row.style.setProperty('--pt-tab-h',`${button.offsetHeight}px`);
        row.classList.add('has-indicator');
        if(firstSelection)requestAnimationFrame(()=>row.classList.remove('is-first-selection'));
      };
      buttons.forEach((button)=>button.addEventListener('click',()=>{
        if(busy)return;
        busy=true;
        const effect=button.dataset.ptPreview;
        buttons.forEach((other)=>other.classList.toggle('is-active',other===button));
        moveIndicator(button);
        if(row.scrollWidth>row.clientWidth){
          row.scrollTo({
            left:button.offsetLeft-(row.clientWidth-button.offsetWidth)/2,
            behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'
          });
        }
        if(window.KinetoPlayground?.setPageTransitionEffect)window.KinetoPlayground.setPageTransitionEffect(effect);
        const incoming=toB?screenB:screenA;
        const outgoing=toB?screenA:screenB;
        stage.dataset.fx=effect;
        cover.className='pt-cover is-in';
        const cssDuration=Number.parseFloat(getComputedStyle(stage).getPropertyValue('--pt-dur'))||0.42;
        const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?0:cssDuration*1000;
        setTimeout(()=>{
          outgoing.hidden=true;
          incoming.hidden=false;
          cover.className='pt-cover is-out';
        },duration);
        setTimeout(()=>{
          cover.className='pt-cover';
          toB=!toB;
          busy=false;
        },duration*2);
      }));
      addEventListener('resize',()=>moveIndicator(stage.querySelector('[data-pt-preview].is-active')),{passive:true});
    })();
    // FLIP demo: stable layout ids make the opt-in View Transitions control
    // demonstrable while the default remains the existing JS FLIP path.
    const flipDemoGrid = document.getElementById('flip-grid');
    flipDemoGrid?.querySelectorAll('.flip-chip').forEach((item, index) => {
      item.dataset.ktLayoutId = `flip-${index}`;
    });
    // FLIP demo: record once, reorder as one DOM transaction, then animate
    // existing items directly to their new boxes (no disappear/re-enter pass).
    document.getElementById('flip-shuffle')?.addEventListener('click',()=>{
      const grid=document.getElementById('flip-grid'); if(!grid)return;
      const instance=Kineto.getInstance(grid,'flip');
      instance?.shuffle?.();
    });
    KinetoPlayground.mount(document);

    // Links inside a preview box are part of the DEMO, not site navigation. The
    // menu entries, mega-menu submenus and 'release notes' style items all pointed
    // at real section anchors, so clicking one threw the reader hundreds of cards
    // away from what they were looking at. They are inert now — same as the
    // Gesture / ripple / Magnetic previews, which never navigated either.
    //
    // Scoped to `.demo-stage` and delegated, so future demo previews inherit it
    // with no extra markup. A preview that genuinely needs to navigate opts out
    // with `data-demo-navigate`.
    // Capture phase + stopImmediatePropagation: preventDefault alone was not
    // enough. The demo's own anchor router and the smooth-scroll handler both
    // listen further up and do their own scrolling, so a bubbling listener still
    // let the page jump (measured: a 'release notes' click moved 558px, a
    // mega-menu submenu click moved 15,500px). Killing the event before anyone
    // else sees it is the only way to make these links truly inert.
    document.addEventListener('click', (event) => {
      const link = event.target instanceof Element
        ? event.target.closest('.demo-stage a[href^="#"]')
        : null;
      if (!link || link.hasAttribute('data-demo-navigate')) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);

    // Reusable toast — window.ktToast(msg, {duration}). Multi-line via '\n',
    // always centered. Use it anywhere: copy, apply, reset, unsupported hints…
    (()=>{
      let host=null;
      window.ktToast=(msg,opts={})=>{
        if(!host){host=document.createElement('div');host.className='demo-toast-host';document.body.appendChild(host);}
        const t=document.createElement('div');t.className='demo-toast';
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
        const sections=Object.entries(MODULE_GROUPS).flatMap(([group,names])=>
          names.filter(name=>registered.has(name)).map(name=>{
            const block=document.getElementById('mod-'+name);
            return {
              group,name,id:'mod-'+name,
              title:block?.querySelector('.module-block-title')?.textContent?.trim()||name,
              desc:block?.querySelector('.module-block-sub')?.textContent?.trim()||''
            };
          })
        );
        const overlay=document.createElement('div');
        overlay.className='sitemap-overlay';
        overlay.hidden=true;
        const closeSvg='<svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true" focusable="false"><path d="M5 5l10 10M15 5L5 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
        overlay.innerHTML='<div class="sitemap-panel" role="dialog" aria-modal="true" aria-labelledby="sitemap-title">'
          +'<div class="sitemap-head"><strong id="sitemap-title">Kineto — Sitemap</strong><button class="sitemap-close" type="button" aria-label="닫기">'+closeSvg+'</button></div>'
          +'<div class="sitemap-grid">'+sections.map((s,i)=>{
            return `<a href="#${s.id}" data-module="${s.name}" data-sitemap-module data-kt-no-transition><i>${String(i+1).padStart(2,'0')}</i><span class="sm-txt"><b>${s.title}</b><small data-description>${s.desc}</small></span></a>`;
          }).join('')+'</div></div>';
        document.body.appendChild(overlay);
        let previousFocus=null;
        let inertState=[];
        const focusables=()=>[...overlay.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el=>!el.hidden);
        const open=()=>{
          previousFocus=document.activeElement;
          // Scroll lock is a root class (`html.is-locked`), not an inline style —
          // see styles.css. Nothing to snapshot or restore by hand.
          inertState=[...document.body.children].filter(el=>el!==overlay).map(el=>[el,el.inert]);
          inertState.forEach(([el])=>{el.inert=true;});
          overlay.hidden=false;
          document.documentElement.classList.add('is-locked');
          requestAnimationFrame(()=>{overlay.classList.add('is-open');overlay.querySelector('.sitemap-close')?.focus();});
        };
        const close=()=>{
          overlay.classList.remove('is-open');
          document.documentElement.classList.remove('is-locked');
          inertState.forEach(([el,wasInert])=>{el.inert=wasInert;});
          setTimeout(()=>{overlay.hidden=true;previousFocus?.focus?.();},260);
        };
        btn.addEventListener('click',open);
        overlay.addEventListener('click',(e)=>{ if(e.target===overlay)close(); });
        overlay.querySelector('.sitemap-close').addEventListener('click',close);
        overlay.querySelectorAll('.sitemap-grid a').forEach(a=>a.addEventListener('click',(event)=>{
          event.preventDefault();
          const moduleName=a.dataset.module;
          close();
          setTimeout(()=>navigateToModule(moduleName,{source:'click',history:'push'}),270);
        }));
        document.addEventListener('keydown',(e)=>{
          if(overlay.hidden)return;
          if(e.key==='Escape'){e.preventDefault();close();return;}
          if(e.key!=='Tab')return;
          const items=focusables();
          if(!items.length){e.preventDefault();return;}
          const first=items[0],last=items[items.length-1];
          if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
          else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
        });
      })();
    })();
