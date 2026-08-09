import { clamp, env, snapshotAttributes, snapshotInlineStyles } from '../utils.js';

function backgroundIsDark(el) {
  let node = el;
  while (node && node !== document.documentElement) {
    const bg = getComputedStyle(node).backgroundColor;
    const match = bg && bg.match(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\)/);
    if (match && (match[4] == null || Number(match[4]) > 0.15)) {
      const luma = 0.2126 * Number(match[1]) + 0.7152 * Number(match[2]) + 0.0722 * Number(match[3]);
      return luma < 128;
    }
    node = node.parentElement;
  }
  return false;
}

const NOISE_CHARS = '!@#$%^&*()<>?/|{}~ABCDEFGHIJabcdefghij0123456789';

export default {
  create(el, opts) {
    const type = opts.preset || opts.type || 'rgb';
    // `digital` used to redirect here to `noise` — an exact alias, so the two
    // presets produced identical output and the settings panel offered a choice
    // that changed nothing. Removed; `wave` took its slot with a mechanism the
    // set did not have.
    const preset = type;
    const intensity = clamp(Number(opts.intensity ?? 1), 0.1, 3);
    const speed = Math.max(0.1, Number(opts.speed ?? 1));
    // Frequency controls how often a burst recurs without changing its playback
    // speed. Randomness scales every stochastic choice: 0 produces a stable,
    // repeatable midpoint pattern; 1 preserves the full organic variation.
    const frequency = clamp(Number(opts.frequency ?? 1), 0.1, 4);
    const randomness = clamp(Number(opts.randomness ?? 1), 0, 1);
    const random = () => 0.5 + (Math.random() - 0.5) * randomness;
    const repeatDelay = (milliseconds) => milliseconds / frequency;
    const cadence = speed * frequency;
    const loop = opts.loop !== false;
    const trigger = opts.trigger || 'auto';

    // ── RGB Slice Burst: short, hard, seeded bursts with a clean recovery ─────
    // Reference behaviour: the target is CLEAN most of the time, then a 60–180ms
    // burst hits it — RGB channel separation, a few horizontal slices shoved
    // sideways, and a couple of solid artifact blocks — then it returns to fully
    // clean. Randomness is planned once per burst from a seed, not re-rolled every
    // frame: per-frame Math.random() is what makes glitch look cheap.
    if (preset === 'rgb-slice-burst') {
      const seedBase = Math.floor(Number(opts.seed ?? 20260729)) || 1;
      let seedState = seedBase >>> 0;
      const rnd = () => {
        seedState = (seedState + 0x6D2B79F5) >>> 0;
        let t = seedState;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
      // `randomness` scales how far each planned value may stray from the
      // midpoint: 0 gives a stable, repeatable burst, 1 the full spread. Without
      // this the shared Randomness control was inert for this preset.
      const between = (min, max) => {
        const mid = (min + max) / 2;
        return mid + (min + rnd() * (max - min) - mid) * randomness;
      };
      const palette = (Array.isArray(opts.colors) && opts.colors.length)
        ? opts.colors
        : ['#ff2e2e', '#00e07a', '#2b6bff', '#ff5b1c'];
      const channelOffset = Math.max(0, Number(opts.channelOffset ?? 6)) * intensity;
      const maxSliceOffset = Math.max(0, Number(opts.maxSliceOffset ?? 26)) * intensity;
      const sliceMin = Math.max(1, Math.round(Number(opts.sliceCountMin ?? 3)));
      const sliceMax = Math.max(sliceMin, Math.round(Number(opts.sliceCountMax ?? 7)));
      const burstMin = Math.max(30, Number(opts.burstDurationMin ?? 60));
      const burstMax = Math.max(burstMin, Number(opts.burstDurationMax ?? 180));
      const gapMin = Math.max(80, Number(opts.intervalMin ?? 250));
      const gapMax = Math.max(gapMin, Number(opts.intervalMax ?? 1200));
      const artifactCount = Math.max(0, Math.round(Number(opts.artifactCount ?? 3)));
      // Weighted presets, so no two bursts are built the same way but each one is
      // still a deliberate combination rather than pure noise.
      const RECIPES = [
        { weight: 34, channel: 1, slices: 1, artifacts: 0.3, label: 'soft' },
        { weight: 30, channel: 1.4, slices: 1.4, artifacts: 1, label: 'medium' },
        { weight: 22, channel: 2.1, slices: 1.8, artifacts: 1.4, label: 'hard' },
        { weight: 14, channel: 0.6, slices: 2.4, artifacts: 1.8, label: 'shred' }
      ];
      const totalWeight = RECIPES.reduce((sum, r) => sum + r.weight, 0);
      const pickRecipe = () => {
        let roll = rnd() * totalWeight;
        for (const recipe of RECIPES) { roll -= recipe.weight; if (roll <= 0) return recipe; }
        return RECIPES[0];
      };

      const host = el;
      const restore = snapshotInlineStyles(host, ['position', 'isolation']);
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      host.style.isolation = 'isolate';
      const stage = document.createElement('span');
      stage.setAttribute('aria-hidden', 'true');
      stage.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;opacity:0';
      host.appendChild(stage);

      const timers = new Set();
      const after = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
      let alive = true;
      let paused = false;

      const clear = () => { stage.textContent = ''; stage.style.opacity = '0'; };

      const runBurst = () => {
        if (!alive || paused) return;
        const recipe = pickRecipe();
        const length = between(burstMin, burstMax) / speed;
        const rect = host.getBoundingClientRect();
        const width = rect.width || 1;
        const height = rect.height || 1;
        stage.textContent = '';
        stage.style.opacity = '1';
        // 1) channel separation — two tinted copies of the box, offset apart
        const chan = channelOffset * recipe.channel;
        ['#ff0040', '#00ffd0'].forEach((tint, index) => {
          const layer = document.createElement('span');
          const dx = (index ? -1 : 1) * chan * between(0.6, 1);
          layer.style.cssText = `position:absolute;inset:0;background:${tint};mix-blend-mode:screen;`
            + `opacity:${(0.22 * recipe.channel).toFixed(2)};transform:translateX(${dx.toFixed(1)}px)`;
          stage.appendChild(layer);
        });
        // 2) horizontal slices shoved sideways
        const slices = Math.round(between(sliceMin, sliceMax) * recipe.slices);
        for (let index = 0; index < slices; index += 1) {
          const bandHeight = between(height * 0.02, height * 0.16);
          const top = between(0, Math.max(0, height - bandHeight));
          const shift = between(-maxSliceOffset, maxSliceOffset);
          const band = document.createElement('span');
          band.style.cssText = `position:absolute;left:0;right:0;top:${top.toFixed(1)}px;height:${bandHeight.toFixed(1)}px;`
            + `background:${palette[Math.floor(rnd() * palette.length)]};mix-blend-mode:${opts.blendMode || 'screen'};`
            + `opacity:${between(0.35, 0.85).toFixed(2)};transform:translateX(${shift.toFixed(1)}px)`;
          stage.appendChild(band);
        }
        // 3) a few solid artifact blocks
        const blocks = Math.round(artifactCount * recipe.artifacts);
        for (let index = 0; index < blocks; index += 1) {
          const w = between(Number(opts.artifactMinSize ?? 6), Number(opts.artifactMaxSize ?? 42));
          const h = between(4, 16);
          const block = document.createElement('span');
          block.style.cssText = `position:absolute;left:${between(0, width - w).toFixed(1)}px;top:${between(0, height - h).toFixed(1)}px;`
            + `width:${w.toFixed(1)}px;height:${h.toFixed(1)}px;background:${palette[Math.floor(rnd() * palette.length)]}`;
          stage.appendChild(block);
        }
        // Clean recovery, then schedule the next burst after a random quiet gap.
        after(() => {
          clear();
          if (loop) after(runBurst, between(gapMin, gapMax) / cadence);
        }, length);
      };

      if (env().reducedMotion) {
        // No slicing for reduced motion — a barely-there chromatic flicker only.
        return { el, type: 'glitch', preset, pause() {}, resume() {}, destroy() { stage.remove(); restore(); } };
      }
      after(runBurst, Math.max(0, Number(opts.delay ?? 0)) * 1000 + between(gapMin, gapMax) / cadence);

      return {
        el,
        type: 'glitch',
        preset,
        fire: runBurst,
        pause() { paused = true; clear(); },
        resume() { paused = false; after(runBurst, between(gapMin, gapMax) / cadence); },
        destroy() {
          alive = false;
          timers.forEach(clearTimeout);
          stage.remove();
          restore();
        }
      };
    }

    // ── Continuous CRT / VCR overlay on an image (retro scanlines + roll bar) ──
    // `crt`/`vcr` on an <img> apply a persistent CSS overlay: 1px scanlines, a
    // sweeping roll bar, a vignette and flicker (VCR adds tracking noise + a
    // jitter on the picture). CSS-only, so it's cheap on mobile. Previously `crt`
    // on an image fell through to the text path and blanked the image out.
    // ── Wave: analogue signal warp (SVG displacement map) ────────────────────
    // The one deformation in the set. `rgb` offsets whole slices, `pixel`
    // quantises, `crt`/`vcr` overlay scanlines, `image`/`datamosh` repaint a
    // canvas — none of them bend the picture itself. feTurbulence drives
    // feDisplacementMap so rows shear by a smoothly varying amount, which is what
    // a real analogue signal does under interference.
    if (preset === 'wave') {
      const uid = `kt-glitch-wave-${Math.random().toString(36).slice(2, 9)}`;
      const amount = Math.round(clamp(Number(opts.channelOffset ?? 8), 1, 40) * intensity);
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      // Kept out of layout and out of the a11y tree; it exists only to host the
      // filter definition.
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;';
      const filter = document.createElementNS(svgNS, 'filter');
      filter.setAttribute('id', uid);
      // The filter region has to exceed the source box or the warped edges clip.
      filter.setAttribute('x', '-15%'); filter.setAttribute('y', '-15%');
      filter.setAttribute('width', '130%'); filter.setAttribute('height', '130%');
      const turbulence = document.createElementNS(svgNS, 'feTurbulence');
      turbulence.setAttribute('type', 'fractalNoise');
      // Very low frequency across x, higher across y: that ratio is what makes the
      // distortion read as horizontal tearing rather than as general mush.
      turbulence.setAttribute('baseFrequency', '0.0008 0.06');
      turbulence.setAttribute('numOctaves', '1');
      turbulence.setAttribute('seed', String(Math.floor(Number(opts.seed ?? 7)) || 7));
      turbulence.setAttribute('result', 'noise');
      // Measured: SMIL (<animate>) did not advance at all in headless Chromium —
      // 14 samples of `baseFrequencyY.animVal` over a second all read 0.02. Rather
      // than ship an effect whose motion depends on SMIL being scheduled, the
      // frequency is driven from JS. It also makes pause/resume exact and costs
      // one attribute write per tick.
      //
      // Throttled to ~24fps on purpose: a glitch that updates every frame reads as
      // smooth noise, and the slight quantisation is part of the look.
      const period = Math.max(600, 2600 / cadence);
      const tickMs = 42;
      let waveStart = performance.now();
      let waveTimer = null;
      const stepWave = () => {
        const phase = ((performance.now() - waveStart) % period) / period;
        // Triangle sweep low -> high -> low. Held near the low end most of the
        // cycle so the element stays readable and only tears periodically; a
        // constantly warped element just looks broken.
        const ramp = phase < 0.5 ? phase * 2 : (1 - phase) * 2;
        const eased = Math.pow(ramp, 1.6);
        const y = (0.02 + eased * 0.07).toFixed(4);
        turbulence.setAttribute('baseFrequency', `0.0008 ${y}`);
      };
      const startWave = () => { if (!waveTimer) waveTimer = setInterval(stepWave, tickMs); };
      const stopWave = () => { clearInterval(waveTimer); waveTimer = null; };
      const displace = document.createElementNS(svgNS, 'feDisplacementMap');
      displace.setAttribute('in', 'SourceGraphic');
      displace.setAttribute('in2', 'noise');
      displace.setAttribute('scale', String(amount));
      displace.setAttribute('xChannelSelector', 'R');
      displace.setAttribute('yChannelSelector', 'G');
      filter.appendChild(turbulence);
      filter.appendChild(displace);
      svg.appendChild(filter);
      document.body.appendChild(svg);
      stepWave();
      startWave();
      const originalFilter = el.style.filter;
      el.style.filter = `${originalFilter ? originalFilter + ' ' : ''}url(#${uid})`;
      return {
        el,
        type: 'glitch',
        replay: () => { waveStart = performance.now(); stepWave(); },
        pause: stopWave,
        resume: startWave,
        destroy: () => {
          stopWave();
          svg.remove();
          if (originalFilter) el.style.filter = originalFilter; else el.style.removeProperty('filter');
        }
      };
    }

    if (preset === 'crt' || preset === 'vcr') {
      const imageEl = el.tagName === 'IMG' ? el : el.querySelector?.('img');
      const host = el.tagName === 'IMG' ? el.parentElement : el;
      if (imageEl && host) {
        const isVcr = preset === 'vcr';
        const oHostPos = host.style.position;
        const oHostOvf = host.style.overflow;
        const oImgFilter = imageEl.style.filter;
        const oImgAnim = imageEl.style.animation;
        if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
        host.style.overflow = 'hidden';
        const sl = 0.08 * intensity;   // scanline darkness (kept subtle)
        const gr = 0.035 * intensity;  // aperture-grille (RGB phosphor) strength
        const overlay = document.createElement('div');
        overlay.className = 'kt-glitch-crt';
        overlay.setAttribute('aria-hidden', 'true');
        // Layer 1: fine horizontal scanlines. Layer 2: vertical RGB aperture
        // grille (phosphor stripes). Soft vignette + gentle flicker on top.
        overlay.style.cssText = 'position:absolute;inset:0;z-index:3;pointer-events:none;border-radius:inherit;overflow:hidden;'
          + `background:repeating-linear-gradient(0deg,rgba(0,0,0,${sl}) 0,rgba(0,0,0,${sl}) 1px,transparent 1px,transparent 3px),`
          + `repeating-linear-gradient(90deg,rgba(255,40,40,${gr}) 0,rgba(255,40,40,${gr}) 1px,rgba(40,255,90,${gr}) 1px,rgba(40,255,90,${gr}) 2px,rgba(60,120,255,${gr}) 2px,rgba(60,120,255,${gr}) 3px);`
          + `box-shadow:inset 0 0 ${isVcr ? 70 : 110}px rgba(0,0,0,${isVcr ? 0.45 : 0.4}),inset 0 0 20px rgba(0,0,0,.28);`
          + `animation:${randomness > 0 ? `kt-crt-flicker ${(isVcr ? 2.2 : 3.4) / cadence}s ease-in-out infinite` : 'none'};`;
        // Soft bright scan band drifting down slowly (CRT refresh sweep).
        const roll = document.createElement('div');
        roll.style.cssText = `position:absolute;left:0;right:0;height:${isVcr ? 22 : 34}%;pointer-events:none;`
          + `background:linear-gradient(to bottom,transparent,rgba(255,255,255,${isVcr ? 0.04 : 0.07}) 45%,rgba(255,255,255,${isVcr ? 0.08 : 0.11}) 55%,transparent);`
          + `filter:blur(1px);animation:kt-crt-roll ${(isVcr ? 4.5 : 8) / cadence}s linear infinite;`;
        overlay.appendChild(roll);
        // Subtle CRT phosphor bloom / color lift on the picture itself.
        imageEl.style.filter = `${oImgFilter ? oImgFilter + ' ' : ''}saturate(${isVcr ? 1.18 : 1.08}) contrast(1.06) brightness(1.02)`;
        let noise = null;
        let track = null;
        if (isVcr) {
          // Analogue VCR noise (SVG fractal turbulence), a jumping tracking band,
          // chromatic bleed and a slight picture jitter — the tape look.
          noise = document.createElement('div');
          noise.style.cssText = `position:absolute;inset:-20%;pointer-events:none;opacity:${0.08 * randomness * intensity};mix-blend-mode:overlay;`
            + "background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\");"
            + `animation:kt-vcr-noise ${0.5 / cadence}s steps(3,end) infinite;`;
          overlay.appendChild(noise);
          track = document.createElement('div');
          track.style.cssText = 'position:absolute;left:0;right:0;height:20%;pointer-events:none;'
            + 'background:linear-gradient(to bottom,transparent 0%,rgba(0,0,0,.16) 38%,rgba(0,0,0,.32) 50%,rgba(0,0,0,.16) 62%,transparent 100%);mix-blend-mode:multiply;filter:blur(2px);'
            + `animation:kt-vcr-track ${3.2 / cadence}s linear infinite;`;
          overlay.appendChild(track);
          imageEl.style.filter += ' drop-shadow(1.2px 0 0 rgba(255,0,60,.4)) drop-shadow(-1.2px 0 0 rgba(0,180,255,.4))';
          imageEl.style.animation = randomness > 0 ? `kt-vcr-jitter ${7 / cadence}s steps(1,end) infinite` : 'none';
        }
        host.appendChild(overlay);
        const setPlay = (s) => { [overlay, roll, noise, track].forEach((n) => { if (n) n.style.animationPlayState = s; }); if (isVcr) imageEl.style.animationPlayState = s; };
        return {
          el,
          type: 'glitch',
          replay: () => {},
          pause: () => setPlay('paused'),
          resume: () => setPlay('running'),
          destroy: () => {
            overlay.remove();
            host.style.position = oHostPos;
            host.style.overflow = oHostOvf;
            imageEl.style.filter = oImgFilter;
            imageEl.style.animation = oImgAnim;
          }
        };
      }
    }

    // ── Ambient image glitch (독립 상시 효과, 레이지 로딩과 무관) ──────────
    // A canvas overlay bursts slice displacements / blackout flashes over a
    // live <img> at random intervals, then goes transparent again.
    if (preset === 'image' || preset === 'reveal' || preset === 'datamosh') {
      const revealMode = preset === 'reveal';
      const datamoshMode = preset === 'datamosh';
      const imageEl = el.tagName === 'IMG' ? el : el.querySelector?.('img');
      if (!imageEl) return null;
      const host = el.tagName === 'IMG' ? el.parentElement : el;
      if (!host) return null;
      const originalHostPosition = host.style.position;
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      const canvas = document.createElement('canvas');
      canvas.className = 'kt-glitch-image-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;border-radius:inherit;z-index:2;opacity:0;';
      host.appendChild(canvas);
      const context = canvas.getContext('2d', { alpha: false });
      const macroCanvas = document.createElement('canvas');
      const macroContext = macroCanvas.getContext('2d', { alpha: false });
      const slices = Math.max(2, Math.round(Number(opts.sliceCount ?? 7)));
      let imgAlive = true;
      let imgRaf = null;
      const imgTimers = new Set();
      const imgLater = (fn, ms) => {
        const id = setTimeout(() => { imgTimers.delete(id); if (imgAlive) fn(); }, ms);
        imgTimers.add(id);
      };
      const syncCanvas = () => {
        const box = host.getBoundingClientRect();
        const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
        const pw = Math.max(1, Math.round(box.width * dpr));
        const ph = Math.max(1, Math.round(box.height * dpr));
        if (canvas.width !== pw || canvas.height !== ph) { canvas.width = pw; canvas.height = ph; }
      };
      const drawImageGlitch = (amp) => {
        if (!imageEl.naturalWidth) return;
        const w = canvas.width;
        const h = canvas.height;
        const scale = Math.max(w / imageEl.naturalWidth, h / imageEl.naturalHeight);
        const sw = Math.min(imageEl.naturalWidth, w / scale);
        const sh = Math.min(imageEl.naturalHeight, h / scale);
        const sx = (imageEl.naturalWidth - sw) / 2;
        const sy = (imageEl.naturalHeight - sh) / 2;
        const power = amp * intensity;
        context.filter = 'none';
        context.imageSmoothingEnabled = true;
        context.fillStyle = '#000';
        context.fillRect(0, 0, w, h);
        if (!datamoshMode && random() < power * 0.12) return; // blackout flash
        if (datamoshMode) {
          context.drawImage(imageEl, sx, sy, sw, sh, 0, 0, w, h);
          // Build a deliberately low-resolution source once per frame. Regions
          // copied from it keep crisp square pixels when scaled back up.
          const pixelSize = Math.max(8, Math.round(18 / Math.max(0.55, intensity)));
          const coarseWidth = Math.max(2, Math.ceil(w / pixelSize));
          const coarseHeight = Math.max(2, Math.ceil(h / pixelSize));
          if (macroCanvas.width !== coarseWidth || macroCanvas.height !== coarseHeight) {
            macroCanvas.width = coarseWidth;
            macroCanvas.height = coarseHeight;
          }
          macroContext.imageSmoothingEnabled = true;
          macroContext.drawImage(imageEl, sx, sy, sw, sh, 0, 0, coarseWidth, coarseHeight);
          const grid = pixelSize;
          const blocks = Math.max(10, Math.round(slices * 3.2));
          context.imageSmoothingEnabled = false;
          for (let index = 0; index < blocks; index += 1) {
            const sourceX = Math.floor(random() * Math.max(1, coarseWidth - 3));
            const sourceY = Math.floor(random() * Math.max(1, coarseHeight - 2));
            const sourceWidth = Math.max(1, Math.min(coarseWidth - sourceX, 2 + Math.floor(random() * 8)));
            const sourceHeight = Math.max(1, Math.min(coarseHeight - sourceY, 1 + Math.floor(random() * 4)));
            const blockWidth = sourceWidth * grid;
            const blockHeight = sourceHeight * grid;
            const baseX = sourceX * grid;
            const baseY = sourceY * grid;
            const shiftX = Math.round((random() - 0.5) * 7 * power) * grid;
            const shiftY = random() < 0.22 ? Math.round((random() - 0.5) * 2) * grid : 0;
            context.globalAlpha = 0.76 + random() * 0.24;
            context.drawImage(
              macroCanvas,
              sourceX, sourceY, sourceWidth, sourceHeight,
              baseX + shiftX, baseY + shiftY, blockWidth, blockHeight
            );
            if (random() < 0.18) {
              context.globalCompositeOperation = 'screen';
              context.fillStyle = random() > 0.5 ? 'rgba(0,225,255,.16)' : 'rgba(255,30,100,.14)';
              context.fillRect(baseX + shiftX, baseY + shiftY, blockWidth, blockHeight);
              context.globalCompositeOperation = 'source-over';
            }
          }
          context.globalAlpha = 1;
          // Live analogue/digital noise: changing pixel speckles, short dropout
          // bars and CRT scan rows. This is redrawn on every animation frame, so
          // it reads as a failing low-resolution monitor rather than a static
          // texture placed over the image.
          const noiseUnit = Math.max(2, Math.round(grid / 4));
          const noiseCount = Math.max(40, Math.round((w * h) / 1800));
          const noiseColors = ['#050505', '#f5f5f5', '#10e8d2', '#f32183', '#5d72ff'];
          context.globalCompositeOperation = 'source-over';
          for (let index = 0; index < noiseCount; index += 1) {
            const nx = Math.floor(random() * w / noiseUnit) * noiseUnit;
            const ny = Math.floor(random() * h / noiseUnit) * noiseUnit;
            const nw = noiseUnit * (1 + Math.floor(random() * 4));
            const nh = noiseUnit * (1 + Math.floor(random() * 2));
            context.globalAlpha = 0.08 + random() * 0.28 * Math.min(1.2, power);
            context.fillStyle = noiseColors[Math.floor(random() * noiseColors.length)];
            context.fillRect(nx, ny, nw, nh);
          }
          context.globalAlpha = 0.22 * Math.min(1.2, power);
          for (let index = 0; index < 2 + Math.round(intensity); index += 1) {
            const lineY = Math.floor(random() * h / noiseUnit) * noiseUnit;
            context.fillStyle = random() > 0.55 ? '#050505' : noiseColors[2 + Math.floor(random() * 3)];
            context.fillRect(0, lineY, w * (0.22 + random() * 0.78), noiseUnit);
          }
          context.globalAlpha = 0.1;
          context.fillStyle = '#000';
          for (let y = 0; y < h; y += 4) context.fillRect(0, y, w, 1);
          context.globalAlpha = 1;
          context.imageSmoothingEnabled = true;
          return;
        }
        // Image Ambient stays a fine chromatic slice treatment. It intentionally
        // avoids square blocks so it cannot be mistaken for Datamosh.
        if ('filter' in context) {
          context.globalCompositeOperation = 'screen';
          context.globalAlpha = 0.55;
          context.filter = 'hue-rotate(90deg) saturate(3)';
          context.drawImage(imageEl, sx, sy, sw, sh, Math.round(-w * 0.02 * power), 0, w, h);
          context.filter = 'hue-rotate(-90deg) saturate(3)';
          context.drawImage(imageEl, sx, sy, sw, sh, Math.round(w * 0.02 * power), 0, w, h);
          context.filter = 'none';
          context.globalAlpha = 1;
          context.globalCompositeOperation = 'source-over';
        }
        for (let index = 0; index < slices; index += 1) {
          const bandY = Math.floor((index / slices) * h);
          const bandH = Math.ceil(h / slices);
          const shifted = random() < 0.55;
          const offset = shifted ? Math.round((random() - 0.5) * w * 0.16 * power) : 0;
          if (shifted && random() < 0.28 && 'filter' in context) context.filter = `invert(1) brightness(${1 + power * 0.3})`;
          context.drawImage(imageEl, sx, sy + (bandY / h) * sh, sw, (bandH / h) * sh, offset, bandY, w, bandH);
          context.filter = 'none';
        }
        context.globalAlpha = 0.18 * power;
        context.fillStyle = '#000';
        for (let y = 0; y < h; y += 4) context.fillRect(0, y, w, 1);
        context.globalAlpha = 1;
      };
      // Reveal mode = the lazy "flicker" decode-in as a one-shot: the image is
      // hidden, the canvas glitches from full strength down to clean, then the
      // real <img> is shown and the canvas removed.
      if (revealMode) imageEl.style.opacity = '0';
      const imageBurst = () => {
        if (!imgAlive) return;
        const burstDuration = revealMode
          ? Math.max(200, Number(opts.duration ?? 1.15) * 1000) / speed
          : datamoshMode
            ? Math.max(220, Number(opts.duration ?? 0.48) * 1000) / speed
            : (140 + random() * 260) / speed;
        const started = performance.now();
        canvas.style.opacity = '1';
        syncCanvas();
        const frame = (time) => {
          if (!imgAlive) return;
          const progress = Math.min(1, (time - started) / burstDuration);
          drawImageGlitch(revealMode ? (1 - progress) : datamoshMode ? (0.35 + Math.sin(progress * Math.PI) * 0.8) : (1 - progress * 0.5));
          if (progress < 1) imgRaf = requestAnimationFrame(frame);
          else if (revealMode) {
            imageEl.style.opacity = '1';
            canvas.style.opacity = '0';
          } else {
            canvas.style.opacity = '0';
            if (loop) imgLater(imageBurst, repeatDelay(datamoshMode ? 900 + random() * 2100 : 700 + random() * 1800));
          }
        };
        imgRaf = requestAnimationFrame(frame);
      };
      let imgHoverEnter = null;
      let imgHoverLeave = null;
      if (trigger === 'hover') {
        imgHoverEnter = () => { imgAlive = true; imageBurst(); };
        imgHoverLeave = () => {
          imgTimers.forEach(clearTimeout);
          imgTimers.clear();
          if (imgRaf != null) cancelAnimationFrame(imgRaf);
          canvas.style.opacity = '0';
        };
        host.addEventListener('pointerenter', imgHoverEnter);
        host.addEventListener('pointerleave', imgHoverLeave);
      } else {
        const rawDelay = Number(opts.delay ?? 0.4);
        imgLater(imageBurst, rawDelay <= 10 ? rawDelay * 1000 : rawDelay);
      }
      return {
        el,
        type: 'glitch',
        replay: () => { imgAlive = true; if (revealMode) imageEl.style.opacity = '0'; imageBurst(); },
        pause: () => {
          imgAlive = false;
          imgTimers.forEach(clearTimeout);
          imgTimers.clear();
          if (imgRaf != null) cancelAnimationFrame(imgRaf);
          canvas.style.opacity = '0';
        },
        resume: () => { if (!imgAlive) { imgAlive = true; imgLater(imageBurst, 200); } },
        destroy: () => {
          imgAlive = false;
          imgTimers.forEach(clearTimeout);
          imgTimers.clear();
          if (imgRaf != null) cancelAnimationFrame(imgRaf);
          if (imgHoverEnter) host.removeEventListener('pointerenter', imgHoverEnter);
          if (imgHoverLeave) host.removeEventListener('pointerleave', imgHoverLeave);
          if (revealMode) imageEl.style.opacity = '';
          canvas.remove();
          host.style.position = originalHostPosition;
        }
      };
    }
    const originalHTML = el.innerHTML;
    const originalStyle = el.getAttribute('style');
    const restoreAttributes = snapshotAttributes(el, ['aria-label']);
    const text = el.textContent || '';
    // Colored duplicates must read on any background: screen-blend disappears
    // on light panels, multiply disappears on dark ones — pick per background.
    const dark = backgroundIsDark(el);
    const blend = opts.blendMode || (dark ? 'screen' : 'multiply');
    const colors = Array.isArray(opts.colors) && opts.colors.length >= 2
      ? opts.colors
      : (dark ? ['rgba(255,0,60,.9)', 'rgba(0,255,0,.85)', 'rgba(61,139,255,.9)'] : ['#ff0040', '#00b894', '#2f6bff']);

    // Text-glitch presets (rgb/noise/crt-burst) wrap and rewrite the element's
    // text. On an image, an element containing an image, or anything with no
    // text, that would blank the content — so no-op safely instead of breaking.
    if (el.tagName === 'IMG' || (el.querySelector && el.querySelector('img')) || !text || !String(text).trim()) {
      return { el, type: 'glitch', replay() {}, pause() {}, resume() {}, destroy() {} };
    }

    el.setAttribute('aria-label', text);
    el.innerHTML = '';
    el.style.position = 'relative';
    el.style.display = 'inline-block';

    const base = document.createElement('span');
    // Keep the source glyphs and every RGB duplicate on the exact same text
    // box. Layers live inside this box so host padding can never offset them.
    base.style.cssText = 'position:relative;z-index:2;display:block;white-space:inherit;font:inherit;letter-spacing:inherit;text-align:inherit;will-change:transform;';
    base.setAttribute('aria-hidden', 'true');
    const source = document.createElement('span');
    source.textContent = text;
    source.style.cssText = 'position:relative;display:block;white-space:inherit;font:inherit;letter-spacing:inherit;text-align:inherit;will-change:transform;';
    base.appendChild(source);
    el.appendChild(base);

    const layers = colors.slice(0, 3).map((color, index) => {
      const layer = document.createElement('span');
      layer.textContent = text;
      layer.setAttribute('aria-hidden', 'true');
      layer.style.cssText = `position:absolute;inset:0;z-index:${3 + index};display:block;white-space:inherit;font:inherit;letter-spacing:inherit;text-align:inherit;transform-origin:0 0;opacity:0;pointer-events:none;color:${color};mix-blend-mode:${blend};will-change:transform,clip-path;`;
      base.appendChild(layer);
      return layer;
    });

    let scanline = null;
    const timers = new Set();
    const running = new Set();
    const pixelBits = new Set();
    const pixelRafs = new Set();
    let alive = true;

    const later = (callback, ms) => {
      const id = setTimeout(() => {
        timers.delete(id);
        if (alive) callback();
      }, Math.max(0, ms));
      timers.add(id);
      return id;
    };
    const animate = (node, keyframes, options) => {
      const player = node.animate(keyframes, options);
      running.add(player);
      player.finished.catch(() => {}).finally(() => running.delete(player));
      return player;
    };
    const stopWork = () => {
      timers.forEach(clearTimeout);
      timers.clear();
      running.forEach((player) => player.cancel());
      running.clear();
      pixelRafs.forEach(cancelAnimationFrame);
      pixelRafs.clear();
      pixelBits.forEach((node) => node.remove());
      pixelBits.clear();
      source.textContent = text;
      layers.forEach((layer) => { layer.style.opacity = '0'; });
    };

    // ── RGB slice burst (original three colored duplicates) ────────────────
    const rgbBurst = () => {
      if (!alive) return;
      const configured = Number(opts.duration);
      const duration = (Number.isFinite(configured) ? Math.max(0.05, configured) * 1000 : 170 + random() * 280) / speed;
      const sliceOf = () => {
        const top = Math.round(random() * 82);
        const height = Math.round(4 + random() * 20 * intensity);
        return `inset(${top}% 0 ${Math.max(0, 100 - top - height)}% 0)`;
      };
      const offsetX = (random() - 0.5) * 18 * intensity;
      const offsetY = (random() - 0.5) * 5 * intensity;
      const steps = Math.max(2, Math.round(3 + intensity));
      const directions = [-1, 0, 1];
      layers.forEach((layer, index) => {
        // Symmetric chromatic displacement keeps the RGB composite centred on
        // the source text instead of making the whole effect lean to one side.
        const direction = directions[index] ?? 0;
        animate(layer, [
          { opacity: 0.9, clipPath: sliceOf(), webkitClipPath: sliceOf(), transform: `translate(${offsetX * direction}px,${offsetY * direction}px)` },
          { opacity: 0.85, clipPath: sliceOf(), webkitClipPath: sliceOf(), transform: `translate(${-offsetX * direction * 0.6}px,${-offsetY * direction}px)`, offset: 0.5 },
          { opacity: 0, clipPath: 'inset(0 0 0 0)', webkitClipPath: 'inset(0 0 0 0)', transform: 'translate(0,0)' }
        ], { duration, delay: index * 18, easing: `steps(${steps}, end)`, fill: 'forwards' });
      });
      animate(source, [
        { transform: 'skewX(0deg)' },
        { transform: `skewX(${1.8 * intensity}deg)`, offset: 0.33 },
        { transform: `skewX(${-1.4 * intensity}deg)`, offset: 0.66 },
        { transform: 'skewX(0deg)' }
      ], { duration, easing: `steps(${steps}, end)` });
      if (loop) later(rgbBurst, repeatDelay(520 + random() * 1400));
    };

    // ── Digital noise scramble ──────────────────────────────────────────────
    const noiseBurst = () => {
      if (!alive) return;
      const configured = Number(opts.duration);
      const duration = (Number.isFinite(configured) ? Math.max(0.05, configured) * 1000 : 320 + random() * 320) / speed;
      const frameMs = 40 / speed;
      const totalFrames = Math.max(3, Math.round(duration / frameMs));
      let frame = 0;
      const tick = () => {
        if (!alive) return;
        frame += 1;
        const progress = frame / totalFrames;
        source.textContent = Array.from(text, (char) => {
          if (/^\s$/.test(char)) return char;
          return random() > progress * (1.35 - Math.min(0.9, 0.3 * intensity))
            ? NOISE_CHARS[Math.floor(random() * NOISE_CHARS.length)]
            : char;
        }).join('');
        if (frame < totalFrames) later(tick, frameMs);
        else {
          source.textContent = text;
          if (loop) later(noiseBurst, repeatDelay(620 + random() * 1100));
        }
      };
      tick();
    };

    // ── Pixel shift: square glyph fragments on a visible pixel grid ─────────
    const pixelBurst = () => {
      if (!alive) return;
      const duration = Math.max(180, Number(opts.duration ?? 0.42) * 1000) / speed;
      const steps = Math.max(4, Math.round(5 + intensity * 2));
      animate(source, [
        { transform: 'translate(0,0)', filter: 'none' },
        { transform: `translate(${Math.round(2 * intensity)}px,0)`, filter: 'contrast(1.3)', offset: .18 },
        { transform: `translate(${Math.round(-3 * intensity)}px,${Math.round(1 * intensity)}px)`, filter: 'contrast(1.55)', offset: .52 },
        { transform: 'translate(0,0)', filter: 'none' }
      ], { duration, easing: `steps(${steps}, end)` });

      const rect = base.getBoundingClientRect();
      const unit = Math.max(4, Math.round(Math.min(rect.height || 24, 40) / 7));
      const columns = Math.max(1, Math.ceil(rect.width / unit));
      const rows = Math.max(1, Math.ceil(rect.height / unit));
      const bitCount = Math.min(columns * rows, Math.max(14, Math.round(18 + intensity * 8)));
      for (let index = 0; index < bitCount; index += 1) {
        const bit = document.createElement('span');
        const col = Math.floor(random() * columns);
        const row = Math.floor(random() * rows);
        const widthUnits = 1 + Math.floor(random() * 3);
        const heightUnits = 1 + Math.floor(random() * 2);
        const left = col * unit;
        const top = row * unit;
        const width = Math.min(rect.width - left, widthUnits * unit);
        const height = Math.min(rect.height - top, heightUnits * unit);
        const right = Math.max(0, rect.width - left - width);
        const bottom = Math.max(0, rect.height - top - height);
        bit.textContent = text;
        bit.setAttribute('aria-hidden', 'true');
        bit.style.cssText = 'position:absolute;z-index:8;inset:0;display:block;white-space:inherit;'
          + 'font:inherit;letter-spacing:inherit;text-align:inherit;color:inherit;pointer-events:none;'
          + `clip-path:inset(${top}px ${right}px ${bottom}px ${left}px);`;
        base.appendChild(bit);
        pixelBits.add(bit);
        const shiftX = Math.round((random() - .5) * 7 * intensity) * unit;
        const shiftY = random() < .35 ? Math.round((random() - .5) * 3) * unit : 0;
        const player = animate(bit, [
          { opacity: 0, transform: 'translate(0,0)' },
          { opacity: 1, transform: `translate(${shiftX}px,${shiftY}px)`, offset: .18 },
          { opacity: .92, transform: `translate(${-shiftX * .45}px,${-shiftY}px)`, offset: .62 },
          { opacity: 0, transform: 'translate(0,0)' }
        ], { duration: duration * (.55 + random() * .45), delay: random() * 70, easing: `steps(${steps}, end)`, fill: 'forwards' });
        player.finished.catch(() => {}).finally(() => { bit.remove(); pixelBits.delete(bit); });
      }
      const noise = document.createElement('canvas');
      const noiseWidth = Math.max(1, Math.round(rect.width));
      const noiseHeight = Math.max(1, Math.round(rect.height));
      noise.width = noiseWidth;
      noise.height = noiseHeight;
      noise.setAttribute('aria-hidden', 'true');
      noise.style.cssText = 'position:absolute;inset:0;z-index:7;width:100%;height:100%;'
        + `pointer-events:none;image-rendering:pixelated;mix-blend-mode:${dark ? 'screen' : 'multiply'};`;
      base.appendChild(noise);
      pixelBits.add(noise);
      const noiseContext = noise.getContext('2d');
      const noiseStarted = performance.now();
      let noiseRaf = null;
      const drawNoise = (time) => {
        pixelRafs.delete(noiseRaf);
        if (!alive || !noise.isConnected || time - noiseStarted >= duration) {
          noise.remove();
          pixelBits.delete(noise);
          return;
        }
        noiseContext.clearRect(0, 0, noiseWidth, noiseHeight);
        const noiseColors = dark
          ? ['#ffffff', '#00f5d4', '#ff2d95', '#6c7dff', '#050505']
          : ['#111111', '#00a98f', '#e60065', '#3155df', '#ffffff'];
        const count = Math.max(18, Math.round((noiseWidth * noiseHeight) / 260));
        for (let index = 0; index < count; index += 1) {
          const nx = Math.floor(random() * columns) * unit;
          const ny = Math.floor(random() * rows) * unit;
          noiseContext.globalAlpha = 0.15 + random() * 0.55;
          noiseContext.fillStyle = noiseColors[Math.floor(random() * noiseColors.length)];
          noiseContext.fillRect(nx, ny, unit * (1 + Math.floor(random() * 3)), unit);
        }
        noiseContext.globalAlpha = 0.28;
        noiseContext.fillStyle = noiseColors[Math.floor(random() * noiseColors.length)];
        noiseContext.fillRect(0, Math.floor(random() * rows) * unit, noiseWidth, Math.max(1, Math.round(unit / 2)));
        noiseContext.globalAlpha = 1;
        noiseRaf = requestAnimationFrame(drawNoise);
        pixelRafs.add(noiseRaf);
      };
      noiseRaf = requestAnimationFrame(drawNoise);
      pixelRafs.add(noiseRaf);
      if (loop) later(pixelBurst, repeatDelay(700 + random() * 1700));
    };

    // ── CRT analog jitter with scanlines ────────────────────────────────────
    const crtBurst = () => {
      if (!alive) return;
      if (!scanline) {
        scanline = document.createElement('span');
        scanline.setAttribute('aria-hidden', 'true');
        scanline.style.cssText = `position:absolute;inset:0;z-index:6;pointer-events:none;border-radius:inherit;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,${0.13 * intensity}) 2px,rgba(0,0,0,${0.13 * intensity}) 4px);opacity:0;transition:opacity .2s var(--kt-ease-ui, ease);`;
        el.appendChild(scanline);
      }
      scanline.style.opacity = '1';
      const configured = Number(opts.duration);
      const duration = (Number.isFinite(configured) ? Math.max(0.05, configured) * 1000 : 900 + random() * 700) / speed;
      const jitter = 4 * intensity;
      animate(el, [
        { opacity: 1, filter: 'none', transform: 'none' },
        { opacity: 0.82, filter: 'brightness(1.35) hue-rotate(6deg)', transform: `translateX(${jitter}px)`, offset: 0.08 },
        { transform: `translateX(${-jitter}px)`, offset: 0.09 },
        { opacity: 1, filter: 'none', transform: 'none', offset: 0.1 },
        { opacity: 0.78, filter: 'brightness(.85) hue-rotate(-8deg)', transform: `skewX(${1.5 * intensity}deg)`, offset: 0.45 },
        { filter: 'none', transform: 'none', opacity: 1, offset: 0.46 },
        { opacity: 0.9, filter: 'brightness(1.2)', transform: `translateX(${-jitter * 0.5}px)`, offset: 0.72 },
        { transform: 'none', offset: 0.73 },
        { opacity: 1, filter: 'none', transform: 'none' }
      ], { duration, easing: 'linear' });
      later(() => {
        if (scanline) scanline.style.opacity = '0';
        if (loop && alive) later(crtBurst, repeatDelay(900 + random() * 1500));
      }, duration);
    };

    const burst = () => {
      if (preset === 'noise') noiseBurst();
      else if (preset === 'pixel') pixelBurst();
      else if (preset === 'crt') crtBurst();
      else rgbBurst();
    };

    let hoverEnter = null;
    let hoverLeave = null;
    let observer = null;
    if (trigger === 'hover') {
      hoverEnter = () => { alive = true; burst(); };
      hoverLeave = () => { stopWork(); };
      el.addEventListener('pointerenter', hoverEnter);
      el.addEventListener('pointerleave', hoverLeave);
    } else if (trigger === 'scroll' || trigger === 'view') {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => { if (entry.isIntersecting) burst(); });
      }, { threshold: 0.4 });
      observer.observe(el);
    } else {
      const rawDelay = Number(opts.delay ?? (preset === 'noise' ? 0.7 : preset === 'pixel' ? 0.5 : 0.35));
      later(burst, rawDelay <= 10 ? rawDelay * 1000 : rawDelay);
    }

    return {
      el,
      type: 'glitch',
      replay: () => { stopWork(); alive = true; burst(); },
      pause: () => { alive = false; stopWork(); },
      resume: () => {
        if (alive) return;
        alive = true;
        later(burst, 120);
      },
      destroy: () => {
        alive = false;
        stopWork();
        if (hoverEnter) el.removeEventListener('pointerenter', hoverEnter);
        if (hoverLeave) el.removeEventListener('pointerleave', hoverLeave);
        observer?.disconnect();
        el.innerHTML = originalHTML;
        if (originalStyle == null) el.removeAttribute('style'); else el.setAttribute('style', originalStyle);
        restoreAttributes();
      }
    };
  },
  // Low-perf devices show the plain content without the per-frame glitch canvas.
  fallback(el) { return this.reduced(el); },
  reduced(el) {
    const restore = snapshotAttributes(el, ['aria-label']);
    return { el, type: 'glitch', pause() {}, resume() {}, destroy: restore };
  }
};
