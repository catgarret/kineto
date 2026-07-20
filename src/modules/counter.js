import { formatNumber, G, observeOnce, snapshotAttributes } from '../utils.js';

function normalizedFormat(opts) {
  if (opts.format) return opts.format;
  // Any character works as a grouping separator — not just the comma.
  if (opts.separator) return String(opts.separator);
  if (opts.grouping === true || opts.comma === true) return ',';
  return '';
}

// Clock-style blink for separator glyphs (the ":" in 12:34), shared by the
// clock mode and the blinkSeparators option on the other modes.
function blinkNode(node) {
  if (!node.animate) return null;
  return node.animate(
    [{ opacity: 1 }, { opacity: 1 }, { opacity: 0.15 }, { opacity: 0.15 }],
    { duration: 1000, iterations: Infinity, easing: 'steps(1,end)' }
  );
}

// Shared flip visuals — seam color, drop-shadow (toggle/custom) and separator
// color, all overridable via options or the matching CSS custom properties.
function flipVisuals(opts) {
  const seam = `var(--kt-counter-seam,${opts.seamColor || 'rgba(0,0,0,.5)'})`;
  const shadowValue = opts.shadow === false || opts.shadow === 'none'
    ? 'none'
    : (typeof opts.shadow === 'string' ? opts.shadow : 'drop-shadow(0 2px 5px rgba(0,0,0,.3))');
  const shadow = `var(--kt-counter-flip-shadow,${shadowValue})`;
  return { seam, shadow, hasShadow: shadowValue !== 'none', separatorColor: opts.separatorColor || '' };
}

function appendAffix(el, value, className) {
  if (!value) return;
  const node = document.createElement('span');
  node.className = className;
  node.textContent = value;
  el.appendChild(node);
}

function createCharacter(el, char, className = 'kt-counter-char') {
  const node = document.createElement('span');
  node.className = className;
  node.textContent = char;
  node.style.display = 'inline-block';
  el.appendChild(node);
  return node;
}

function buildScrollTrigger(el, opts) {
  if (opts.start === false) return undefined;
  const rect = el.getBoundingClientRect();
  const visible = rect.bottom > 0 && rect.top < window.innerHeight;
  if (visible) return undefined;
  return {
    trigger: el,
    start: opts.start || 'top 85%',
    toggleActions: opts.once === false ? 'play reverse play reverse' : 'play none none none'
  };
}

export default {
  create(el, opts) {
    const gsap = G();
    const originalHTML = el.innerHTML;
    const originalStyle = el.getAttribute('style');
    const restoreAttributes = snapshotAttributes(el, ['aria-label', 'aria-live']);
    const mode = opts.mode || opts.preset || opts.style || 'slot';
    const from = Number(opts.from ?? 0);
    const parsed = Number.parseFloat((el.textContent || '').replace(/[^0-9.-]/g, ''));
    const to = Number(opts.to ?? (Number.isFinite(parsed) ? parsed : 0));
    const duration = Math.max(0, Number(opts.duration ?? 2));
    const decimals = Math.max(0, Number(opts.decimals ?? 0));
    const prefix = opts.prefix || '';
    const suffix = opts.suffix || '';
    const format = normalizedFormat(opts);
    const formatOptions = { decimals, format, locale: opts.locale };
    const finalNumericString = formatNumber(to, formatOptions);
    const finalValue = `${prefix}${finalNumericString}${suffix}`;
    const scrollTrigger = buildScrollTrigger(el, opts);
    const animations = [];

    el.setAttribute('aria-label', finalValue);
    el.setAttribute('aria-live', 'polite');

    const addAnimation = (animation) => {
      if (animation) animations.push(animation);
      return animation;
    };
    const killAnimations = () => {
      animations.forEach((animation) => {
        animation.scrollTrigger?.kill?.();
        animation.kill?.();
      });
      animations.length = 0;
    };

    if (mode === 'plain') {
      const state = { value: from };
      const render = () => {
        el.textContent = `${prefix}${formatNumber(state.value, formatOptions)}${suffix}`;
      };
      render();
      if (gsap) {
        addAnimation(gsap.to(state, {
          value: to,
          duration,
          delay: Number(opts.delay ?? 0),
          ease: opts.ease || 'power2.out',
          onUpdate: render,
          onComplete: () => opts.onComplete?.(el),
          scrollTrigger
        }));
      } else {
        state.value = to;
        render();
        opts.onComplete?.(el);
      }
    } else if (mode === 'digit') {
      el.innerHTML = '';
      el.style.display = 'inline-flex';
      el.style.alignItems = 'baseline';
      appendAffix(el, prefix, 'kt-counter-prefix');

      const digitNodes = [];
      for (const char of finalNumericString) {
        if (/\d/.test(char)) digitNodes.push({ node: createCharacter(el, '0', 'kt-counter-digit'), target: Number(char) });
        else createCharacter(el, char, 'kt-counter-separator');
      }
      appendAffix(el, suffix, 'kt-counter-suffix');

      const loops = Math.max(0, Number(opts.loops ?? 2));
      const stagger = Math.max(0, Number(opts.stagger ?? 0.06));
      if (gsap) {
        const timeline = gsap.timeline({
          delay: Number(opts.delay ?? 0),
          scrollTrigger,
          onComplete: () => opts.onComplete?.(el)
        });
        digitNodes.forEach(({ node, target }, index) => {
          const state = { value: 0 };
          const total = loops * 10 + target;
          let previousDigit = -1;
          timeline.to(state, {
            value: total,
            duration: Math.max(0.05, duration + index * stagger),
            ease: opts.ease || 'none',
            onUpdate: () => {
              const digit = Math.floor(state.value) % 10;
              if (digit === previousDigit) return;
              previousDigit = digit;
              node.textContent = String(digit);
            },
            onComplete: () => { node.textContent = String(target); }
          }, 0);
        });
        addAnimation(timeline);
      } else {
        digitNodes.forEach(({ node, target }) => { node.textContent = String(target); });
        opts.onComplete?.(el);
      }
    } else if (mode === 'pop') {
      // Pop is not a count-up mode. The final formatted value is known from the
      // beginning, then each character lands in sequence from a larger scale.
      el.innerHTML = '';
      el.style.display = 'inline-flex';
      el.style.alignItems = 'baseline';
      appendAffix(el, prefix, 'kt-counter-prefix');
      const characters = Array.from(finalNumericString, (char) => createCharacter(
        el,
        char,
        /\d/.test(char) ? 'kt-counter-digit kt-counter-pop-char' : 'kt-counter-separator kt-counter-pop-char'
      ));
      appendAffix(el, suffix, 'kt-counter-suffix');

      // Where the pop lands from: bottom (default), center, or top.
      const popAlign = opts.popAlign || 'bottom';
      const popOrigin = popAlign === 'top' ? '50% 0%' : popAlign === 'center' ? '50% 50%' : '50% 85%';
      const popScale = Math.max(1, Number(opts.popScale ?? 1.8));
      const totalDuration = Math.max(0.1, duration || 0.8);
      const defaultCharDuration = Math.min(0.36, Math.max(0.14, totalDuration * 0.38));
      const popDuration = Math.max(0.05, Number(opts.popDuration ?? defaultCharDuration));
      const defaultStagger = characters.length > 1
        ? Math.max(0.025, (totalDuration - popDuration) / (characters.length - 1))
        : 0;
      const stagger = Math.max(0, Number(opts.stagger ?? defaultStagger));

      if (gsap) {
        const timeline = gsap.timeline({
          delay: Number(opts.delay ?? 0),
          scrollTrigger,
          onComplete: () => opts.onComplete?.(el)
        });
        timeline.set(characters, { opacity: 0, scale: popScale, transformOrigin: popOrigin });
        characters.forEach((node, index) => {
          timeline.to(node, {
            opacity: 1,
            scale: 1,
            duration: popDuration,
            ease: opts.ease || 'back.out(2.2)',
            clearProps: 'transform,opacity'
          }, index * stagger);
        });
        addAnimation(timeline);
      } else {
        characters.forEach((node, index) => {
          node.style.opacity = '0';
          node.style.transformOrigin = popOrigin;
          node.style.transform = `scale(${popScale})`;
          node.style.transition = `opacity ${popDuration}s ease ${index * stagger}s,transform ${popDuration}s cubic-bezier(.2,.9,.3,1.25) ${index * stagger}s`;
          requestAnimationFrame(() => {
            node.style.opacity = '1';
            node.style.transform = 'scale(1)';
          });
        });
        setTimeout(() => opts.onComplete?.(el), (popDuration + stagger * characters.length) * 1000);
      }
    } else if (mode === 'flip') {
      // True split-flap (Solari board): each digit is split at the middle.
      // The top half of the current digit folds down over the bottom half,
      // revealing the next digit — never a rolling slot.
      el.innerHTML = '';
      el.style.display = 'inline-flex';
      el.style.alignItems = 'center';
      el.style.gap = `${Math.max(0, Number(opts.gap ?? 3))}px`;
      appendAffix(el, prefix, 'kt-counter-prefix');

      const tile = opts.tile !== false;
      const tileColor = opts.tileColor || '#191b20';
      const tileText = opts.tileTextColor || '#f6f7fb';
      const radius = Math.max(0, Number(opts.tileRadius ?? 6));
      const cellHeight = '1.24em';
      const flip = flipVisuals(opts);
      const cells = [];

      // Bare cells still need opaque flaps, otherwise the folding half would
      // overlap the digit behind it. Defaults to the page canvas color.
      const bareBackground = opts.bareBackground || 'Canvas';
      const halfStyle = (top) => `position:absolute;left:0;right:0;height:50%;overflow:hidden;${top ? 'top:0;border-radius:' + (tile ? `${radius}px ${radius}px 0 0` : '0') : 'bottom:0;border-radius:' + (tile ? `0 0 ${radius}px ${radius}px` : '0')};background:${tile ? tileColor : bareBackground};backface-visibility:hidden;`;
      const glyphStyle = (top) => `position:absolute;left:0;width:100%;height:${cellHeight};line-height:${cellHeight};text-align:center;${top ? 'top:0' : 'bottom:0'};color:${tile ? tileText : 'inherit'};`;
      const buildHalf = (top, hinged) => {
        const half = document.createElement('span');
        half.setAttribute('aria-hidden', 'true');
        half.style.cssText = halfStyle(top) + (hinged
          ? `transform-origin:50% ${top ? '100%' : '0%'};will-change:transform;z-index:3;`
          : 'z-index:1;');
        const glyph = document.createElement('span');
        glyph.style.cssText = glyphStyle(top);
        glyph.textContent = '0';
        half.appendChild(glyph);
        return { half, glyph };
      };

      // Direction: count up folds down (classic Solari), count down folds up.
      const flipCountingUp = to >= from;
      const flipDigitCount = finalNumericString.replace(/\D/g, '').length;
      const flipFromDigits = String(Math.round(Math.abs(from))).padStart(flipDigitCount, '0').slice(-flipDigitCount);
      let flipDigitIndex = 0;
      for (const char of finalNumericString) {
        const digit = /\d/.test(char);
        if (!digit) {
          const separator = document.createElement('span');
          separator.className = 'kt-counter-separator';
          separator.textContent = char;
          if (tile) separator.style.opacity = '.7';
          el.appendChild(separator);
          continue;
        }
        const startDigit = Number(flipFromDigits[flipDigitIndex] || '0');
        flipDigitIndex += 1;
        const cell = document.createElement('span');
        cell.className = 'kt-counter-flip-cell';
        cell.style.cssText = `display:inline-block;position:relative;width:${tile ? '1.34ch' : '1.12ch'};height:${cellHeight};perspective:340px;${(tile && flip.hasShadow) ? `filter:${flip.shadow};` : ''}`;
        const topStatic = buildHalf(true, false);     // shows the NEXT digit
        const bottomStatic = buildHalf(false, false); // shows the CURRENT digit
        const topFlap = buildHalf(true, true);        // current digit, folds down
        const bottomFlap = buildHalf(false, true);    // next digit, unfolds
        bottomFlap.half.style.transform = 'rotateX(90deg)';
        cell.append(topStatic.half, bottomStatic.half, topFlap.half, bottomFlap.half);
        if (tile) {
          const seam = document.createElement('span');
          seam.className = 'kt-counter-seam';
          seam.setAttribute('aria-hidden', 'true');
          seam.style.cssText = `position:absolute;left:0;right:0;top:50%;height:1px;margin-top:-0.5px;background:${flip.seam};z-index:4;pointer-events:none;`;
          cell.appendChild(seam);
        }
        el.appendChild(cell);
        cells.push({ topStatic, bottomStatic, topFlap, bottomFlap, target: Number(char), start: startDigit });
      }
      appendAffix(el, suffix, 'kt-counter-suffix');

      const loops = Math.max(0, Number(opts.loops ?? 1));
      const timers = new Set();
      let flipAlive = true;
      const later = (fn, ms) => {
        const id = setTimeout(() => { timers.delete(id); if (flipAlive) fn(); }, ms);
        timers.add(id);
      };
      const setCell = (cell, value) => {
        cell.topStatic.glyph.textContent = String(value);
        cell.bottomStatic.glyph.textContent = String(value);
        cell.topFlap.glyph.textContent = String(value);
        cell.bottomFlap.glyph.textContent = String(value);
        cell.topFlap.half.style.transform = 'rotateX(0deg)';
        cell.bottomFlap.half.style.transform = 'rotateX(90deg)';
      };
      const shade = (frames) => (tile ? frames.withFilter : frames.plain);
      const flipStep = (cell, current, next, flipMs, up = true) => {
        const half = Math.max(34, flipMs / 2);
        if (up) {
          // Counting up: top half (current) folds down, bottom half (next) unfolds.
          cell.topStatic.glyph.textContent = String(next);
          cell.bottomStatic.glyph.textContent = String(current);
          cell.topFlap.glyph.textContent = String(current);
          cell.bottomFlap.glyph.textContent = String(next);
          cell.topFlap.half.style.transform = 'rotateX(0deg)';
          cell.bottomFlap.half.style.transform = 'rotateX(90deg)';
          const downFrames = shade({
            withFilter: [{ transform: 'rotateX(0deg)', filter: 'brightness(1)' }, { transform: 'rotateX(-90deg)', filter: 'brightness(.6)' }],
            plain: [{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(-90deg)' }]
          });
          const upFrames = shade({
            withFilter: [{ transform: 'rotateX(90deg)', filter: 'brightness(.6)' }, { transform: 'rotateX(0deg)', filter: 'brightness(1)' }],
            plain: [{ transform: 'rotateX(90deg)' }, { transform: 'rotateX(0deg)' }]
          });
          cell.topFlap.half.animate(downFrames, { duration: half, easing: 'cubic-bezier(.55,0,.85,.5)', fill: 'forwards' });
          later(() => {
            cell.bottomFlap.half.animate(upFrames, { duration: half, easing: 'cubic-bezier(.15,.6,.3,1.15)', fill: 'forwards' });
            later(() => { cell.bottomStatic.glyph.textContent = String(next); }, half);
          }, half);
        } else {
          // Counting down: bottom half (current) folds up, top half (next) unfolds down.
          cell.topStatic.glyph.textContent = String(current);
          cell.bottomStatic.glyph.textContent = String(next);
          cell.bottomFlap.glyph.textContent = String(current);
          cell.topFlap.glyph.textContent = String(next);
          cell.bottomFlap.half.style.transform = 'rotateX(0deg)';
          cell.topFlap.half.style.transform = 'rotateX(-90deg)';
          const foldUp = shade({
            withFilter: [{ transform: 'rotateX(0deg)', filter: 'brightness(1)' }, { transform: 'rotateX(90deg)', filter: 'brightness(.6)' }],
            plain: [{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(90deg)' }]
          });
          const unfoldDown = shade({
            withFilter: [{ transform: 'rotateX(-90deg)', filter: 'brightness(.6)' }, { transform: 'rotateX(0deg)', filter: 'brightness(1)' }],
            plain: [{ transform: 'rotateX(-90deg)' }, { transform: 'rotateX(0deg)' }]
          });
          cell.bottomFlap.half.animate(foldUp, { duration: half, easing: 'cubic-bezier(.55,0,.85,.5)', fill: 'forwards' });
          later(() => {
            cell.topFlap.half.animate(unfoldDown, { duration: half, easing: 'cubic-bezier(.15,.6,.3,1.15)', fill: 'forwards' });
            later(() => { cell.topStatic.glyph.textContent = String(next); }, half);
          }, half);
        }
      };
      const run = () => {
        timers.forEach(clearTimeout);
        timers.clear();
        flipAlive = true;
        const staggerMs = Math.max(0, Number(opts.stagger ?? 0.08)) * 1000;
        let pending = 0;
        cells.forEach((cell, index) => {
          setCell(cell, cell.start);
          const delta = flipCountingUp
            ? (((cell.target - cell.start) % 10) + 10) % 10
            : (((cell.start - cell.target) % 10) + 10) % 10;
          const stepsCount = loops * 10 + delta;
          if (stepsCount === 0) return;
          pending += 1;
          const flipMs = Math.max(120, (duration * 1000) / Math.max(1, stepsCount));
          for (let step = 1; step <= stepsCount; step += 1) {
            const isLast = step === stepsCount;
            const current = flipCountingUp ? (cell.start + step - 1) % 10 : (((cell.start - (step - 1)) % 10) + 10) % 10;
            const nextDigit = flipCountingUp ? (cell.start + step) % 10 : (((cell.start - step) % 10) + 10) % 10;
            later(() => {
              flipStep(cell, current, nextDigit, flipMs, flipCountingUp);
              if (isLast) {
                pending -= 1;
                if (pending === 0) later(() => opts.onComplete?.(el), flipMs);
              }
            }, index * staggerMs + (step - 1) * flipMs + Number(opts.delay ?? 0) * 1000);
          }
        });
      };
      const rect = el.getBoundingClientRect();
      const visibleNow = opts.start === false || (rect.bottom > 0 && rect.top < window.innerHeight);
      let flipObserver = null;
      if (visibleNow) run();
      else flipObserver = observeOnce(el, run, { threshold: 0.3 });
      addAnimation({
        restart: run,
        pause: () => { flipAlive = false; },
        resume: () => { flipAlive = true; },
        kill: () => { flipAlive = false; timers.forEach(clearTimeout); timers.clear(); flipObserver?.disconnect(); }
      });
    } else if (mode === 'clock') {
      // Live clock, countdown (opts.until) or elapsed timer (opts.since).
      // Digit changes can roll like an odometer, blink-fade, or swap
      // instantly (clockStyle: roll | fade | instant).
      el.innerHTML = '';
      el.style.display = 'inline-flex';
      el.style.alignItems = 'center';
      // A ticking clock must not announce itself every second.
      el.setAttribute('aria-live', 'off');
      const computedClock = getComputedStyle(el);
      const clockLh = Number.parseFloat(computedClock.lineHeight);
      const clockFs = Number.parseFloat(computedClock.fontSize);
      const lineHeight = Math.max(1, Number(opts.lineHeight
        ?? (Number.isFinite(clockLh) ? clockLh : (Number.isFinite(clockFs) ? clockFs * 1.2 : 40))));
      const showSeconds = opts.seconds !== false;
      const hour12 = opts.hour12 === true;
      const sepChar = String(opts.clockSeparator ?? ':');
      const blink = opts.blink !== false;
      const clockStyle = opts.clockStyle || 'roll';
      const rollMs = Math.max(80, Number(opts.rollDuration ?? 0.28) * 1000);
      const daysLabel = String(opts.daysLabel ?? 'd');
      const until = opts.until ? new Date(opts.until) : null;
      const since = opts.since ? new Date(opts.since) : null;
      let completed = false;

      const pad = (value) => String(value).padStart(2, '0');
      const timeParts = () => {
        if (until || since) {
          let ms = until ? until.getTime() - Date.now() : Date.now() - since.getTime();
          if (until && ms <= 0 && !completed) { completed = true; opts.onComplete?.(el); }
          ms = Math.max(0, ms);
          const days = Math.floor(ms / 86400000);
          const parts = [pad(Math.floor(ms / 3600000) % 24), pad(Math.floor(ms / 60000) % 60)];
          if (showSeconds) parts.push(pad(Math.floor(ms / 1000) % 60));
          return { text: parts.join(sepChar), meridiem: '', days };
        }
        const now = new Date();
        let hours = now.getHours();
        let meridiem = '';
        if (hour12) { meridiem = hours >= 12 ? 'PM' : 'AM'; hours = (hours % 12) || 12; }
        const parts = [pad(hours), pad(now.getMinutes())];
        if (showSeconds) parts.push(pad(now.getSeconds()));
        return { text: parts.join(sepChar), meridiem, days: null };
      };

      const makeDigit = (char) => {
        const viewport = document.createElement('span');
        viewport.className = 'kt-counter-digit kt-counter-clock-digit';
        viewport.style.cssText = `display:inline-block;overflow:hidden;height:${lineHeight}px;min-width:1ch;text-align:center;`;
        const stack = document.createElement('span');
        stack.style.cssText = 'display:block;will-change:transform;';
        const glyph = document.createElement('span');
        glyph.style.cssText = `display:block;height:${lineHeight}px;line-height:${lineHeight}px;`;
        glyph.textContent = char;
        stack.appendChild(glyph);
        viewport.appendChild(stack);
        return { viewport, stack, value: char };
      };

      // Split-flap digits for the clock family (clockStyle:'flip') — the same
      // half-fold mechanic as the flip counter, driven by time updates.
      const flipVis = flipVisuals(opts);
      const flipConfig = {
        tile: opts.tile !== false,
        tileColor: opts.tileColor || '#191b20',
        tileText: opts.tileTextColor || '#f6f7fb',
        radius: Math.max(0, Number(opts.tileRadius ?? 6)),
        bareBackground: opts.bareBackground || 'Canvas'
      };
      const makeFlipDigit = (char) => {
        const f = flipConfig;
        const cellHeight = '1.24em';
        const halfStyle = (top) => `position:absolute;left:0;right:0;height:50%;overflow:hidden;${top ? 'top:0;border-radius:' + (f.tile ? `${f.radius}px ${f.radius}px 0 0` : '0') : 'bottom:0;border-radius:' + (f.tile ? `0 0 ${f.radius}px ${f.radius}px` : '0')};background:${f.tile ? f.tileColor : f.bareBackground};backface-visibility:hidden;`;
        const glyphStyle = (top) => `position:absolute;left:0;width:100%;height:${cellHeight};line-height:${cellHeight};text-align:center;${top ? 'top:0' : 'bottom:0'};color:${f.tile ? f.tileText : 'inherit'};`;
        const buildHalf = (top, hinged) => {
          const half = document.createElement('span');
          half.setAttribute('aria-hidden', 'true');
          half.style.cssText = halfStyle(top) + (hinged
            ? `transform-origin:50% ${top ? '100%' : '0%'};will-change:transform;z-index:3;`
            : 'z-index:1;');
          const glyph = document.createElement('span');
          glyph.style.cssText = glyphStyle(top);
          glyph.textContent = char;
          half.appendChild(glyph);
          return { half, glyph };
        };
        const cell = document.createElement('span');
        cell.className = 'kt-counter-digit kt-counter-clock-digit kt-counter-flip-cell';
        cell.style.cssText = `display:inline-block;position:relative;width:${f.tile ? '1.34ch' : '1.12ch'};height:1.24em;perspective:340px;${f.tile ? `${flipVis.hasShadow ? `filter:${flipVis.shadow};` : ''}margin:0 1px;` : ''}`;
        const parts = {
          topStatic: buildHalf(true, false),
          bottomStatic: buildHalf(false, false),
          topFlap: buildHalf(true, true),
          bottomFlap: buildHalf(false, true)
        };
        parts.bottomFlap.half.style.transform = 'rotateX(90deg)';
        cell.append(parts.topStatic.half, parts.bottomStatic.half, parts.topFlap.half, parts.bottomFlap.half);
        if (f.tile) {
          const seam = document.createElement('span');
          seam.className = 'kt-counter-seam';
          seam.setAttribute('aria-hidden', 'true');
          seam.style.cssText = `position:absolute;left:0;right:0;top:50%;height:1px;margin-top:-0.5px;background:${flipVis.seam};z-index:4;pointer-events:none;`;
          cell.appendChild(seam);
        }
        return { viewport: cell, parts, value: char };
      };
      const flipTo = (cell, nextChar) => {
        const current = cell.value;
        cell.value = nextChar;
        const c = cell.parts;
        if (!c.topFlap.half.animate) {
          [c.topStatic, c.bottomStatic, c.topFlap, c.bottomFlap].forEach((part) => { part.glyph.textContent = nextChar; });
          return;
        }
        const half = Math.max(40, (rollMs * 1.5) / 2);
        c.topStatic.glyph.textContent = nextChar;
        c.bottomStatic.glyph.textContent = current;
        c.topFlap.glyph.textContent = current;
        c.bottomFlap.glyph.textContent = nextChar;
        c.topFlap.half.style.transform = 'rotateX(0deg)';
        c.bottomFlap.half.style.transform = 'rotateX(90deg)';
        const tiled = flipConfig.tile;
        const downFrames = tiled
          ? [{ transform: 'rotateX(0deg)', filter: 'brightness(1)' }, { transform: 'rotateX(-90deg)', filter: 'brightness(.6)' }]
          : [{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(-90deg)' }];
        const upFrames = tiled
          ? [{ transform: 'rotateX(90deg)', filter: 'brightness(.6)' }, { transform: 'rotateX(0deg)', filter: 'brightness(1)' }]
          : [{ transform: 'rotateX(90deg)' }, { transform: 'rotateX(0deg)' }];
        c.topFlap.half.animate(downFrames, { duration: half, easing: 'cubic-bezier(.55,0,.85,.5)', fill: 'forwards' });
        setTimeout(() => {
          c.bottomFlap.half.animate(upFrames, { duration: half, easing: 'cubic-bezier(.15,.6,.3,1.15)', fill: 'forwards' });
          setTimeout(() => { c.bottomStatic.glyph.textContent = nextChar; }, half);
        }, half);
      };

      let cells = [];
      let meridiemNode = null;
      let daysNode = null;
      let currentPattern = '';
      const blinkPlayers = new Set();
      const showDays = (days) => days != null && (days > 0 || opts.showDays === true);
      const patternOf = (state) => `${showDays(state.days) ? String(state.days).length : 0}|${state.text.length}`;

      const build = (state) => {
        blinkPlayers.forEach((player) => player.cancel());
        blinkPlayers.clear();
        el.innerHTML = '';
        cells = [];
        meridiemNode = null;
        daysNode = null;
        appendAffix(el, prefix, 'kt-counter-prefix');
        if (showDays(state.days)) {
          daysNode = document.createElement('span');
          daysNode.className = 'kt-counter-days';
          daysNode.style.cssText = 'margin-right:.5ch;';
          daysNode.textContent = `${state.days}${daysLabel}`;
          el.appendChild(daysNode);
        }
        for (const char of state.text) {
          if (/\d/.test(char)) {
            const cell = clockStyle === 'flip' ? makeFlipDigit(char) : makeDigit(char);
            el.appendChild(cell.viewport);
            cells.push(cell);
          } else {
            const separator = createCharacter(el, char, 'kt-counter-separator kt-counter-clock-separator');
            if (blink) {
              const player = blinkNode(separator);
              if (player) blinkPlayers.add(player);
            }
            cells.push(null);
          }
        }
        if (hour12 && !until && !since) {
          meridiemNode = document.createElement('span');
          meridiemNode.className = 'kt-counter-suffix kt-counter-meridiem';
          meridiemNode.style.cssText = 'margin-left:.4ch;font-size:.55em;opacity:.75;align-self:center;';
          meridiemNode.textContent = state.meridiem;
          el.appendChild(meridiemNode);
        }
        appendAffix(el, suffix, 'kt-counter-suffix');
      };

      const changeTo = (cell, nextChar) => {
        if (clockStyle === 'flip') { flipTo(cell, nextChar); return; }
        cell.value = nextChar;
        const glyph = cell.stack.firstChild;
        if (clockStyle === 'instant' || !cell.stack.animate) {
          glyph.textContent = nextChar;
          return;
        }
        if (clockStyle === 'fade') {
          // Blink swap: fade out, change, fade back in.
          cell.stack.animate(
            [{ opacity: 1 }, { opacity: 0, offset: 0.45 }, { opacity: 0, offset: 0.55 }, { opacity: 1 }],
            { duration: rollMs, easing: 'ease' }
          );
          setTimeout(() => { glyph.textContent = nextChar; }, rollMs / 2);
          return;
        }
        // roll (default): odometer-style vertical roll. rollDirection picks
        // whether the next digit enters from below (up) or from above (down).
        // Countdown digits shrink, so they roll downward by default.
        const rollDown = (opts.rollDirection || (until ? 'down' : 'up')) === 'down';
        const incoming = document.createElement('span');
        incoming.style.cssText = `display:block;height:${lineHeight}px;line-height:${lineHeight}px;`;
        incoming.textContent = nextChar;
        if (rollDown) {
          cell.stack.insertBefore(incoming, cell.stack.firstChild);
          while (cell.stack.children.length > 2) cell.stack.lastChild.remove();
        } else {
          cell.stack.appendChild(incoming);
          while (cell.stack.children.length > 2) cell.stack.firstChild.remove();
        }
        const player = cell.stack.animate(
          rollDown
            ? [{ transform: `translateY(-${lineHeight}px)` }, { transform: 'translateY(0)' }]
            : [{ transform: 'translateY(0)' }, { transform: `translateY(-${lineHeight}px)` }],
          { duration: rollMs, easing: 'cubic-bezier(.3,.7,.25,1)', fill: 'forwards' }
        );
        player.finished.catch(() => {}).finally(() => {
          if (cell.stack.children.length > 1) {
            if (rollDown) cell.stack.lastChild.remove();
            else cell.stack.firstChild.remove();
          }
          player.cancel?.();
        });
      };

      const label = (state) => {
        const daysText = showDays(state.days) ? `${state.days}${daysLabel} ` : '';
        el.setAttribute('aria-label', `${daysText}${state.text}${state.meridiem ? ` ${state.meridiem}` : ''}`);
      };

      const firstState = timeParts();
      currentPattern = patternOf(firstState);
      build(firstState);
      label(firstState);

      let clockAlive = true;
      const update = () => {
        if (!clockAlive) return;
        const state = timeParts();
        const pattern = patternOf(state);
        if (pattern !== currentPattern) {
          // Day count gained/lost a digit (or days appeared): rebuild cleanly.
          currentPattern = pattern;
          build(state);
        } else {
          Array.from(state.text).forEach((char, index) => {
            const cell = cells[index];
            if (cell && cell.value !== char) changeTo(cell, char);
          });
          if (daysNode) {
            const daysText = `${state.days}${daysLabel}`;
            if (daysNode.textContent !== daysText) daysNode.textContent = daysText;
          }
          if (meridiemNode && meridiemNode.textContent !== state.meridiem) meridiemNode.textContent = state.meridiem;
        }
        label(state);
      };
      let intervalId = setInterval(update, 250);
      addAnimation({
        kill: () => { clockAlive = false; clearInterval(intervalId); blinkPlayers.forEach((player) => player.cancel()); },
        pause: () => { clockAlive = false; clearInterval(intervalId); blinkPlayers.forEach((player) => player.pause()); },
        resume: () => { if (!clockAlive) { clockAlive = true; intervalId = setInterval(update, 250); } blinkPlayers.forEach((player) => player.play()); },
        restart: () => { if (!clockAlive) { clockAlive = true; intervalId = setInterval(update, 250); } }
      });
    } else {
      const computed = getComputedStyle(el);
      const parsedLineHeight = Number.parseFloat(computed.lineHeight);
      const parsedFontSize = Number.parseFloat(computed.fontSize);
      const automaticLineHeight = Number.isFinite(parsedLineHeight)
        ? parsedLineHeight
        : (Number.isFinite(parsedFontSize) ? parsedFontSize * 1.2 : 40);
      const lineHeight = Math.max(1, Number(opts.lineHeight ?? automaticLineHeight));
      el.innerHTML = '';
      el.style.display = 'inline-flex';
      el.style.alignItems = 'flex-end';
      el.style.overflow = 'hidden';
      appendAffix(el, prefix, 'kt-counter-prefix');

      // Roll each digit reel from the `from` value's digit to the target digit,
      // in the correct direction (down when counting down, e.g. a 34,000 → 10,000
      // discount). Default from:0 keeps the original spin-up behaviour.
      const digitCount = finalNumericString.replace(/\D/g, '').length;
      const fromDigits = String(Math.round(Math.abs(from))).padStart(digitCount, '0').slice(-digitCount);
      const countingUp = to >= from;
      const slots = [];
      let digitIndex = 0;
      for (const char of finalNumericString) {
        if (!/\d/.test(char)) {
          createCharacter(el, char, 'kt-counter-separator');
          continue;
        }

        const targetDigit = Number(char);
        const startDigit = Number(fromDigits[digitIndex] || '0');
        digitIndex += 1;
        const loops = Math.max(0, Number(opts.loops ?? (3 + Math.floor(Math.random() * 2))));
        const base = countingUp
          ? (((targetDigit - startDigit) % 10) + 10) % 10
          : (((startDigit - targetDigit) % 10) + 10) % 10;
        const steps = base + loops * 10;
        const viewport = document.createElement('span');
        viewport.className = 'kt-counter-slot';
        viewport.style.cssText = `display:inline-block;overflow:hidden;height:${lineHeight}px;vertical-align:bottom;`;
        const reel = document.createElement('span');
        reel.className = 'kt-counter-reel';
        reel.style.cssText = 'display:flex;flex-direction:column;will-change:transform;';
        // Build the digit strip from start → target. Counting up scrolls the reel
        // upward (new digits rise in from below); counting down scrolls it
        // downward (new digits drop in from above), which reads as a decreasing
        // odometer instead of everything rolling the same way.
        const digits = [];
        for (let k = 0; k <= steps; k += 1) {
          digits.push(countingUp ? (startDigit + k) % 10 : (((startDigit - k) % 10) + 10) % 10);
        }
        if (!countingUp) digits.reverse(); // top→bottom becomes target … start
        digits.forEach((digit) => {
          const item = document.createElement('span');
          item.textContent = String(digit);
          item.style.cssText = `height:${lineHeight}px;line-height:${lineHeight}px;display:flex;align-items:center;justify-content:center;`;
          reel.appendChild(item);
        });
        viewport.appendChild(reel);
        el.appendChild(viewport);
        // Up: 0 → -(steps·L), the reel rises. Down: the reel begins scrolled to
        // its bottom (showing `start`) and settles at 0 (showing `target` on top),
        // so the strip travels downward.
        slots.push({ reel, fromY: countingUp ? 0 : -(steps * lineHeight), toY: countingUp ? -(steps * lineHeight) : 0 });
      }
      appendAffix(el, suffix, 'kt-counter-suffix');

      if (gsap) {
        const timeline = gsap.timeline({
          delay: Number(opts.delay ?? 0),
          scrollTrigger,
          onComplete: () => opts.onComplete?.(el)
        });
        slots.forEach(({ reel, fromY, toY }, index) => {
          timeline.fromTo(reel, { y: fromY }, {
            y: toY,
            duration: duration + index * Number(opts.stagger ?? 0.1),
            ease: opts.ease || 'power3.inOut'
          }, 0);
        });
        addAnimation(timeline);
      } else {
        slots.forEach(({ reel, toY }) => { reel.style.transform = `translateY(${toY}px)`; });
        opts.onComplete?.(el);
      }
    }

    // Custom separator color (comma, colon, …) — option or CSS var.
    if (opts.separatorColor) {
      el.querySelectorAll('.kt-counter-separator').forEach((node) => {
        node.style.color = `var(--kt-counter-separator,${opts.separatorColor})`;
      });
    }

    // Optional clock-style blink on grouping/custom separators in any mode.
    if (opts.blinkSeparators === true && mode !== 'clock' && mode !== 'plain') {
      el.querySelectorAll('.kt-counter-separator').forEach((node) => {
        const player = blinkNode(node);
        if (player) addAnimation({ kill: () => player.cancel(), pause: () => player.pause(), resume: () => player.play() });
      });
    }

    return {
      el,
      type: 'counter',
      replay: () => animations.forEach((animation) => animation.restart?.()),
      pause: () => animations.forEach((animation) => animation.pause?.()),
      resume: () => animations.forEach((animation) => animation.resume?.()),
      destroy: () => {
        killAnimations();
        el.innerHTML = originalHTML;
        if (originalStyle == null) el.removeAttribute('style'); else el.setAttribute('style', originalStyle);
        restoreAttributes();
      }
    };
  },

  reduced(el, opts) {
    const originalHTML = el.innerHTML;
    const originalStyle = el.getAttribute('style');
    const mode = opts.mode || opts.preset || opts.style || 'slot';
    if (mode === 'clock') {
      // Reduced motion: plain text time, refreshed without any animation.
      const sepChar = String(opts.clockSeparator ?? ':');
      const showSeconds = opts.seconds !== false;
      const hour12 = opts.hour12 === true;
      const renderTime = () => {
        const pad = (value) => String(value).padStart(2, '0');
        if (opts.until || opts.since) {
          const target = opts.until ? new Date(opts.until) : new Date(opts.since);
          const ms = Math.max(0, opts.until ? target.getTime() - Date.now() : Date.now() - target.getTime());
          const days = Math.floor(ms / 86400000);
          const parts = [pad(Math.floor(ms / 3600000) % 24), pad(Math.floor(ms / 60000) % 60)];
          if (showSeconds) parts.push(pad(Math.floor(ms / 1000) % 60));
          const daysText = days > 0 || opts.showDays === true ? `${days}${opts.daysLabel ?? 'd'} ` : '';
          el.textContent = `${opts.prefix || ''}${daysText}${parts.join(sepChar)}${opts.suffix || ''}`;
          return;
        }
        const now = new Date();
        let hours = now.getHours();
        let meridiem = '';
        if (hour12) { meridiem = hours >= 12 ? ' PM' : ' AM'; hours = (hours % 12) || 12; }
        const parts = [pad(hours), pad(now.getMinutes())];
        if (showSeconds) parts.push(pad(now.getSeconds()));
        el.textContent = `${opts.prefix || ''}${parts.join(sepChar)}${meridiem}${opts.suffix || ''}`;
      };
      renderTime();
      const intervalId = setInterval(renderTime, 1000);
      return {
        el, type: 'counter', pause() {}, resume() {},
        destroy() {
          clearInterval(intervalId);
          el.innerHTML = originalHTML;
          if (originalStyle == null) el.removeAttribute('style'); else el.setAttribute('style', originalStyle);
        }
      };
    }
    const decimals = Math.max(0, Number(opts.decimals ?? 0));
    const parsed = Number.parseFloat((el.textContent || '').replace(/[^0-9.-]/g, ''));
    const to = Number(opts.to ?? (Number.isFinite(parsed) ? parsed : 0));
    const format = normalizedFormat(opts);
    el.textContent = `${opts.prefix || ''}${formatNumber(to, { decimals, format, locale: opts.locale })}${opts.suffix || ''}`;
    return {
      el, type: 'counter', pause() {}, resume() {},
      destroy() {
        el.innerHTML = originalHTML;
        if (originalStyle == null) el.removeAttribute('style'); else el.setAttribute('style', originalStyle);
      }
    };
  }
};
