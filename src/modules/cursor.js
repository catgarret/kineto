import { clamp, lerp } from '../utils.js';

// Sprite sheet metrics probed from the image (square frames assumed);
// keyed by the options object so both pointer and touch paths share it.
const spriteMetaStore = new WeakMap();
function ensureSpriteMeta(opts) {
  if (!opts.clickSprite) return null;
  let meta = spriteMetaStore.get(opts);
  if (!meta) {
    meta = {};
    spriteMetaStore.set(opts, meta);
    const probe = new Image();
    probe.onload = () => {
      const frameHeight = probe.naturalHeight || 96;
      const frames = Math.max(1, Math.round(probe.naturalWidth / Math.max(1, frameHeight)));
      Object.assign(meta, { width: probe.naturalWidth / frames, height: frameHeight, frames });
    };
    probe.src = opts.clickSprite;
  }
  return meta;
}

function pointInsideViewport(event) {
  return event.clientX >= 0 && event.clientY >= 0 && event.clientX <= window.innerWidth && event.clientY <= window.innerHeight;
}

function isScopedElement(el, opts) {
  if (opts.global === true) return false;
  if (opts.global === false) return true;
  if (!el || el === document.body || el === document.documentElement) return false;
  return el.clientWidth > 4 && el.clientHeight > 4;
}

export default {
  create(el, opts = {}) {
    const touchDevice = window.matchMedia?.('(hover: none), (pointer: coarse)').matches || navigator.maxTouchPoints > 0;
    // Touch devices get no pointer visuals, but click/tap effects still work:
    // taps spawn the sprite or one-shot image at the touch point.
    if (touchDevice) {
      if (!opts.clickSprite && !opts.clickImage) return null;
      ensureSpriteMeta(opts);
      return this._clickEffectsOnly(el, opts);
    }

    const type = opts.type || opts.preset || 'dot';
    const smoothing = clamp(Number(opts.smoothing ?? opts.ease ?? opts.speed ?? 0.16), 0.01, 1);
    const dotSize = Math.max(1, Number(opts.dotSize ?? 7));
    const followerSize = Math.max(dotSize, Number(opts.followerSize ?? 34));
    const hoverScale = Math.max(0.1, Number(opts.hoverScale ?? 1.7));
    const pressScale = Math.max(0.1, Number(opts.pressScale ?? 0.82));
    const color = opts.color || 'currentColor';
    const borderColor = opts.borderColor || color;
    const background = opts.background || 'transparent';
    const mixBlendMode = opts.mixBlendMode || 'normal';
    const opacity = clamp(Number(opts.opacity ?? 1), 0, 1);
    const zIndex = Number(opts.zIndex ?? 2147483000);
    const hoverSelector = opts.hoverSelector || 'a,button,input,select,textarea,label,[role="button"],[data-kt-cursor-hover]';
    const hiddenSelector = opts.hiddenSelector || '[data-kt-cursor-hide]';
    const scoped = isScopedElement(el, opts);
    const root = document.documentElement;
    const originalRootCursor = root.style.cursor;

    if (scoped) {
      el.classList.add('kt-cursor-scope');
      el.setAttribute('data-kt-cursor-scope', '');
    } else {
      root.classList.add('kt-cursor-active');
    }

    const cursor = document.createElement('div');
    cursor.className = `kt-cursor kt-cursor-${type}${opts.className ? ` ${opts.className}` : ''}`;
    cursor.setAttribute('aria-hidden', 'true');
    cursor.style.cssText = `position:fixed;top:0;left:0;z-index:${zIndex};pointer-events:none;opacity:0;color:${color};mix-blend-mode:${mixBlendMode};transition:opacity .18s ease;`;

    // The dot snaps to the pointer, the follower eases behind. Multi-element
    // types (trail/orbit/snake/sparkle) keep their own state in `chain`.
    let dot = null;
    let follower = null;
    let single = null;
    let label = null;
    let injectedStyle = null;
    const chain = { nodes: [], xs: [], ys: [], angles: [] };
    const sparkles = { pool: [], last: 0 };

    const addDot = (size = dotSize) => {
      dot = document.createElement('span');
      dot.className = 'kt-cursor-dot';
      dot.dataset.baseSize = String(size);
      dot.style.cssText = `position:fixed;left:0;top:0;width:${size}px;height:${size}px;border-radius:50%;background:${opts.dotColor || color};will-change:transform;transform:translate3d(-100px,-100px,0) translate(-50%,-50%);transition:width .22s cubic-bezier(.3,.7,.35,1.25),height .22s cubic-bezier(.3,.7,.35,1.25),opacity .18s ease;`;
      cursor.appendChild(dot);
    };
    const addFollower = (shape = 'circle') => {
      follower = document.createElement('span');
      follower.className = 'kt-cursor-follower';
      follower.style.cssText = `position:fixed;left:0;top:0;width:${followerSize}px;height:${followerSize}px;border:${Math.max(0, Number(opts.borderWidth ?? 1))}px solid ${borderColor};border-radius:${shape === 'square' ? (opts.radius || '8px') : '50%'};background:${background};box-shadow:${opts.shadow || 'none'};will-change:transform;transform:translate3d(-100px,-100px,0) translate(-50%,-50%) scale(1);transition:background-color .2s ease,border-color .2s ease;backdrop-filter:${opts.backdropFilter || 'none'};`;
      cursor.appendChild(follower);
    };
    const addSingle = (html) => {
      single = document.createElement('span');
      single.className = 'kt-cursor-single';
      single.style.cssText = 'position:fixed;left:0;top:0;will-change:transform;transform:translate3d(-100px,-100px,0);';
      if (html != null) single.innerHTML = html;
      cursor.appendChild(single);
    };
    const addChainNode = (styles, index = chain.nodes.length) => {
      const node = document.createElement('span');
      node.setAttribute('aria-hidden', 'true');
      node.style.cssText = `position:fixed;left:0;top:0;pointer-events:none;z-index:${zIndex - index};will-change:transform;transform:translate3d(-200px,-200px,0);${styles}`;
      cursor.appendChild(node);
      chain.nodes.push(node);
      chain.xs.push(-200);
      chain.ys.push(-200);
      return node;
    };

    if (type === 'crosshair') {
      // Reference feel: full-viewport hairlines plus a center dot.
      if (opts.full !== false) {
        addSingle(`<span style="position:fixed;left:0;right:0;top:0;height:1px;background:currentColor;opacity:.4"></span><span style="position:fixed;top:0;bottom:0;left:0;width:1px;background:currentColor;opacity:.4"></span>`);
        single.dataset.crosshairFull = 'true';
        // A transformed/will-change parent would become the containing block
        // for the fixed hairlines and collapse them to a 0×0 box.
        single.style.transform = 'none';
        single.style.willChange = 'auto';
        addDot(Math.max(4, dotSize));
      } else {
        const size = Math.max(8, Number(opts.crosshairSize ?? 20));
        addSingle(`<span style="position:absolute;width:${size}px;height:1px;background:currentColor;left:${-size / 2}px;top:0"></span><span style="position:absolute;width:1px;height:${size}px;background:currentColor;left:0;top:${-size / 2}px"></span>`);
      }
    } else if (type === 'image' && opts.src) {
      addSingle('');
      const image = document.createElement('img');
      image.src = opts.src;
      image.alt = '';
      image.style.cssText = `display:block;width:${Number(opts.width ?? 36)}px;height:${Number(opts.height ?? 36)}px;transform:translate(-50%,-50%) rotate(${Number(opts.rotate ?? 0)}deg);object-fit:contain;`;
      single.appendChild(image);
    } else if (type === 'custom') {
      const template = opts.template || opts.html || (el !== document.body && el !== document.documentElement && !scoped ? el.innerHTML : '');
      addSingle(template);
      single.firstElementChild?.setAttribute('aria-hidden', 'true');
    } else if (type === 'text') {
      // Rotating circular text ring (SVG textPath) that follows the pointer.
      const ringSize = Math.max(40, followerSize * 2.4);
      const ringText = opts.rotateText || opts.text || 'KINETO · KINETO · ';
      const uid = `kt-cur-txt-${Math.random().toString(36).slice(2, 7)}`;
      injectedStyle = document.createElement('style');
      injectedStyle.textContent = `@keyframes ${uid} { to { transform: rotate(360deg); } }`;
      document.head.appendChild(injectedStyle);
      const radius = ringSize / 2 - Math.max(8, Number(opts.labelSize ?? 11));
      addSingle(`<svg width="${ringSize}" height="${ringSize}" viewBox="0 0 ${ringSize} ${ringSize}" style="position:absolute;left:${-ringSize / 2}px;top:${-ringSize / 2}px;animation:${uid} ${Math.max(2, Number(opts.rotateDuration ?? 7))}s linear infinite;transform-origin:center;"><defs><path id="${uid}-p" d="M ${ringSize / 2},${ringSize / 2 - radius} a ${radius},${radius} 0 1,1 -0.01,0 Z"></path></defs><text style="fill:${opts.textColor || color};font: 700 ${Number(opts.labelSize ?? 11)}px ui-monospace,monospace;letter-spacing:.16em;text-transform:uppercase;"><textPath href="#${uid}-p">${String(ringText)}</textPath></text></svg>`);
      if (opts.dot !== false) addDot(Math.max(3, dotSize - 2));
    } else if (type === 'trail') {
      // Elastic dot tail.
      const count = Math.max(3, Math.round(Number(opts.trailCount ?? 9)));
      const size = Math.max(4, Number(opts.trailSize ?? 13));
      for (let index = 0; index < count; index += 1) {
        const nodeSize = Math.max(2, Math.round(size * (1 - (index / count) * 0.6)));
        const alpha = (1 - (index / count) * 0.75).toFixed(2);
        const node = addChainNode(`width:${nodeSize}px;height:${nodeSize}px;border-radius:50%;background:${opts.trailColor || color};opacity:${alpha};`, index);
        node.dataset.half = String(nodeSize / 2);
      }
      chain.spring = clamp(Number(opts.spring ?? 0.28), 0.05, 0.9);
    } else if (type === 'orbit') {
      // Characters orbiting the eased pointer on a flat ellipse.
      const orbitText = String(opts.orbitText || opts.text || 'KINETO · ');
      const characters = Array.from(orbitText);
      characters.forEach((char, index) => {
        const node = addChainNode(`font:700 ${Number(opts.labelSize ?? 12)}px ui-monospace,monospace;color:${opts.textColor || color};text-transform:uppercase;line-height:1;`, index);
        node.textContent = char === ' ' ? ' ' : char;
        chain.angles.push((index / characters.length) * Math.PI * 2);
      });
      chain.orbitRadius = Math.max(16, Number(opts.orbitRadius ?? 56));
      chain.orbitSpeed = Number(opts.orbitSpeed ?? 0.016);
      chain.squash = clamp(Number(opts.orbitSquash ?? 0.42), 0.1, 1);
      // On hover the flat ellipse blooms into a larger full circle.
      chain.orbitHoverRadius = chain.orbitRadius * Math.max(1, Number(opts.orbitHoverScale ?? 1.55));
      chain.orbitCur = chain.orbitRadius;
      chain.squashCur = chain.squash;
    } else if (type === 'snake') {
      // Text snake: each character chases the one before it while keeping a
      // minimum spacing, so letters never pile into a blob when idle.
      const snakeText = String(opts.snakeText || opts.text || 'KINETO');
      const snakeSize = Number(opts.labelSize ?? 14);
      Array.from(snakeText).forEach((char, index) => {
        const node = addChainNode(`font:800 ${snakeSize}px ui-monospace,monospace;color:${opts.textColor || color};line-height:1;`, index);
        node.textContent = char === ' ' ? ' ' : char;
      });
      chain.spring = clamp(Number(opts.spring ?? 0.35), 0.05, 0.9);
      chain.gap = Math.max(4, Number(opts.snakeGap ?? snakeSize * 0.78));
      // Per-glyph eased scale + a legible floor so letters stay readable and
      // shrink gently (not an instant collapse) when the pointer rests.
      chain.scales = chain.nodes.map(() => 1);
      chain.minScale = clamp(Number(opts.snakeMinScale ?? 0.42), 0.1, 1);
      chain.scaleEase = clamp(Number(opts.snakeScaleEase ?? 0.08), 0.02, 0.5);
    } else if (type === 'sparkle') {
      // Star particles bursting along the pointer path.
      addDot(Math.max(4, dotSize - 1));
      sparkles.symbols = Array.isArray(opts.sparkleSymbols) ? opts.sparkleSymbols : ['✦', '✧', '★', '✺', '·', '✱'];
      sparkles.size = Math.max(8, Number(opts.sparkleSize ?? 15));
      sparkles.duration = Math.max(150, Number(opts.sparkleDuration ?? 620));
      sparkles.throttle = Math.max(16, Number(opts.sparkleThrottle ?? 42));
      sparkles.colors = [opts.sparkleColor || (color === 'currentColor' ? '#ffd166' : color), opts.sparkleColor2 || '#7b9fff'];
    } else if (type === 'blob') {
      addFollower('circle');
      follower.style.background = opts.background || color;
      follower.style.border = '0';
      follower.style.opacity = '.75';
      follower.style.filter = `blur(${Math.max(0, Number(opts.blur ?? 0))}px)`;
    } else if (type === 'ring') {
      addFollower(opts.shape || 'circle');
      if (opts.dot === true) addDot();
    } else {
      addDot();
      if (opts.follower !== false) addFollower(opts.shape || 'circle');
    }

    if (opts.label !== false && (dot || follower || single)) {
      // The label sits centered inside the grown hover dot (reference look)
      // instead of hanging below the ring where it collided with the outline.
      label = document.createElement('span');
      label.className = 'kt-cursor-label';
      label.style.cssText = `position:absolute;inset:0;display:flex;align-items:center;justify-content:center;white-space:nowrap;font:800 ${Number(opts.labelSize ?? 9)}px/1 ui-sans-serif,system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:${opts.labelColor || '#fff'};opacity:0;transition:opacity .18s ease;pointer-events:none;`;
      (dot || follower || single).appendChild(label);
    }
    document.body.appendChild(cursor);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let x = mouseX;
    let y = mouseY;
    let alive = true;
    let visible = false;
    let pressed = false;
    let rafId = null;
    let hoverTarget = null;
    let insideScope = !scoped;

    const setVisible = (next) => {
      visible = next;
      cursor.style.opacity = next ? String(opacity) : '0';
    };
    // Hover behavior: when the cursor has an inner dot, the DOT grows to fill
    // the ring (the ring itself stays put) — 'ring' restores the old scaling.
    const hoverEffect = opts.hoverEffect || (dot ? 'dot' : 'ring');
    const hoverDotSize = Math.max(dotSize + 2, Number(opts.hoverDotSize ?? (follower ? followerSize * 0.58 : dotSize * 3)));
    const followerScale = () => (hoverTarget && hoverEffect === 'ring' ? hoverScale : 1) * (pressed ? pressScale : 1);
    const enterTarget = (target) => {
      hoverTarget = target;
      cursor.classList.add('is-hover');
      // image/custom cursors can react to hover: swap the image, swap the
      // custom HTML, or just add a class you style yourself.
      if (opts.hoverClass) cursor.classList.add(...String(opts.hoverClass).split(/\s+/).filter(Boolean));
      if (single) {
        const swapSrc = target.getAttribute('data-kt-cursor-hover-src') || opts.hoverSrc;
        const img = single.querySelector('img');
        if (img && swapSrc) { if (!img.dataset.baseSrc) img.dataset.baseSrc = img.src; img.src = swapSrc; }
        if (type === 'custom' && opts.hoverTemplate) { if (single.dataset.baseHtml == null) single.dataset.baseHtml = single.innerHTML; single.innerHTML = opts.hoverTemplate; }
      }
      const text = target.getAttribute('data-kt-cursor-label') || opts.hoverLabel || '';
      if (label) { label.textContent = text; label.style.opacity = text ? '1' : '0'; }
      if (follower) {
        follower.style.backgroundColor = target.getAttribute('data-kt-cursor-background') || opts.hoverBackground || background;
        follower.style.borderColor = target.getAttribute('data-kt-cursor-color') || opts.hoverColor || borderColor;
      }
      if (dot) {
        if (opts.hideDotOnHover === true) dot.style.opacity = '0';
        else if (hoverEffect === 'dot') {
          // Grow enough to comfortably contain the label text, if any.
          const grow = label && text ? Math.max(hoverDotSize, label.scrollWidth + 18) : hoverDotSize;
          dot.style.width = `${grow}px`;
          dot.style.height = `${grow}px`;
          dot.style.opacity = String(opts.hoverDotOpacity ?? 0.94);
        }
      }
      opts.onEnter?.(target, cursor);
    };
    const leaveTarget = () => {
      const previous = hoverTarget;
      hoverTarget = null;
      cursor.classList.remove('is-hover');
      if (opts.hoverClass) cursor.classList.remove(...String(opts.hoverClass).split(/\s+/).filter(Boolean));
      if (single) {
        const img = single.querySelector('img');
        if (img && img.dataset.baseSrc) img.src = img.dataset.baseSrc;
        if (type === 'custom' && single.dataset.baseHtml != null) single.innerHTML = single.dataset.baseHtml;
      }
      if (label) label.style.opacity = '0';
      if (follower) { follower.style.backgroundColor = background; follower.style.borderColor = borderColor; }
      if (dot) {
        dot.style.opacity = '1';
        const base = dot.dataset.baseSize || dotSize;
        dot.style.width = `${base}px`;
        dot.style.height = `${base}px`;
      }
      opts.onLeave?.(previous, cursor);
    };

    const spawnSparkle = (sx, sy) => {
      const node = sparkles.pool.pop() || document.createElement('span');
      node.setAttribute('aria-hidden', 'true');
      const symbol = sparkles.symbols[Math.floor(Math.random() * sparkles.symbols.length)];
      const tint = Math.random() > 0.5 ? sparkles.colors[0] : sparkles.colors[1];
      const size = sparkles.size * (0.6 + Math.random() * 0.9);
      const angle = Math.random() * 360;
      const distance = 8 + Math.random() * 26;
      const ox = Math.cos(angle * Math.PI / 180) * distance;
      const oy = Math.sin(angle * Math.PI / 180) * distance;
      node.textContent = symbol;
      // Reset without transition first, otherwise a pooled star would start
      // mid-transition from its old faded state and never become visible.
      node.style.cssText = `position:fixed;left:${sx + ox}px;top:${sy + oy}px;z-index:${zIndex - 2};pointer-events:none;font-size:${size}px;font-weight:900;line-height:1;color:${tint};text-shadow:0 0 6px currentColor;transform:translate(-50%,-50%) rotate(${angle}deg) scale(1);opacity:1;transition:none;`;
      if (!node.parentNode) cursor.appendChild(node);
      void node.offsetWidth;
      node.style.transition = `opacity ${sparkles.duration}ms cubic-bezier(.2,0,.8,1),transform ${sparkles.duration}ms cubic-bezier(.2,0,.8,1)`;
      requestAnimationFrame(() => {
        node.style.opacity = '0';
        node.style.transform = `translate(-50%,-50%) rotate(${angle + 90}deg) scale(.1)`;
      });
      setTimeout(() => { if (node.parentNode) sparkles.pool.push(node); }, sparkles.duration + 60);
    };

    const shouldShowAt = (event) => {
      if (scoped) return insideScope;
      return !event.target?.closest?.('[data-kt-cursor-scope]');
    };

    const onMove = (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      if (scoped) insideScope = Boolean(event.target && typeof event.target.closest === 'function' && (event.target.closest('[data-kt-cursor-scope]') === el || el.contains(event.target)));
      const show = shouldShowAt(event) && pointInsideViewport(event) && !event.target?.closest?.(hiddenSelector);
      if (show !== visible) setVisible(show);
      if (dot) dot.style.transform = `translate3d(${mouseX}px,${mouseY}px,0) translate(-50%,-50%)`;
      if (single) {
        if (single.dataset.crosshairFull) {
          single.children[0].style.transform = `translateY(${mouseY}px)`;
          single.children[1].style.transform = `translateX(${mouseX}px)`;
        } else {
          single.style.transform = `translate3d(${mouseX}px,${mouseY}px,0)`;
        }
      }
      if (type === 'sparkle' && visible) {
        const now = performance.now();
        if (now - sparkles.last >= sparkles.throttle) {
          sparkles.last = now;
          spawnSparkle(mouseX, mouseY);
        }
      }
    };
    const onOver = (event) => {
      if (scoped && !el.contains(event.target)) return;
      const target = event.target.closest?.(hoverSelector);
      if (target && target !== hoverTarget) enterTarget(target);
      else if (!target && hoverTarget) leaveTarget();
    };
    const onOut = (event) => {
      if (hoverTarget && !hoverTarget.contains(event.relatedTarget)) leaveTarget();
      if (!event.relatedTarget) setVisible(false);
    };
    // Click effects: a sprite-sheet burst or a one-shot image (GIF/APNG/WebP
    // restart via cache-busted src) spawned at the click point.
    let clickStyle = null;
    const spawnClickEffect = (x, y) => {
      if (opts.clickSprite) {
        const meta = ensureSpriteMeta(opts) || {};
        const frameWidth = Math.max(8, Number(opts.clickSpriteWidth ?? meta.width ?? 96));
        const frameHeight = Math.max(8, Number(opts.clickSpriteHeight ?? meta.height ?? frameWidth));
        const frames = Math.max(1, Math.round(Number(opts.clickSpriteFrames ?? meta.frames ?? 8)));
        const duration = Math.max(80, Number(opts.clickSpriteDuration ?? 480));
        const signature = `${frameWidth}x${frames}`;
        if (!clickStyle) {
          const uid = `kt-cur-spr-${Math.random().toString(36).slice(2, 7)}`;
          clickStyle = document.createElement('style');
          clickStyle.dataset.uid = uid;
          document.head.appendChild(clickStyle);
        }
        if (clickStyle.dataset.signature !== signature) {
          clickStyle.dataset.signature = signature;
          clickStyle.textContent = `@keyframes ${clickStyle.dataset.uid} { to { background-position: -${frameWidth * frames}px 0; } }`;
        }
        const node = document.createElement('span');
        node.setAttribute('aria-hidden', 'true');
        node.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${frameWidth}px;height:${frameHeight}px;transform:translate(-50%,-50%);pointer-events:none;z-index:${zIndex + 1};background:url("${opts.clickSprite}") 0 0/auto ${frameHeight}px no-repeat;animation:${clickStyle.dataset.uid} ${duration}ms steps(${frames}) forwards;`;
        cursor.appendChild(node);
        setTimeout(() => node.remove(), duration + 40);
      } else if (opts.clickImage) {
        const size = Math.max(8, Number(opts.clickImageSize ?? 96));
        const duration = Math.max(80, Number(opts.clickImageDuration ?? 700));
        const node = document.createElement('img');
        node.alt = '';
        node.setAttribute('aria-hidden', 'true');
        const src = String(opts.clickImage);
        node.src = src + (src.includes('?') ? '&' : '?') + 'mkc=' + Date.now();
        node.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${size}px;height:auto;transform:translate(-50%,-50%);pointer-events:none;z-index:${zIndex + 1};`;
        cursor.appendChild(node);
        setTimeout(() => node.remove(), duration);
      }
    };
    const onDown = (event) => {
      pressed = true;
      cursor.classList.add('is-pressed');
      if (visible && (opts.clickSprite || opts.clickImage)) spawnClickEffect(event.clientX, event.clientY);
    };
    const onUp = () => { pressed = false; cursor.classList.remove('is-pressed'); };
    const onWindowOut = (event) => { if (!event.relatedTarget) setVisible(false); };
    const onScopeLeave = () => { insideScope = false; setVisible(false); if (hoverTarget) leaveTarget(); };

    const render = () => {
      if (!alive) return;
      x = lerp(x, mouseX, smoothing);
      y = lerp(y, mouseY, smoothing);
      if (follower) follower.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${followerScale()})`;
      if (type === 'text' && single && !single.dataset.crosshairFull) {
        // The text ring keeps its size; only the inner dot reacts to hover.
        single.style.transform = `translate3d(${x}px,${y}px,0) scale(${pressed ? pressScale : 1})`;
      }
      if (type === 'trail') {
        let leadX = mouseX;
        let leadY = mouseY;
        const spring = chain.spring || 0.2;
        chain.nodes.forEach((node, index) => {
          chain.xs[index] = lerp(chain.xs[index], leadX, spring);
          chain.ys[index] = lerp(chain.ys[index], leadY, spring);
          const half = Number(node.dataset.half || 0);
          node.style.transform = `translate3d(${chain.xs[index] - half}px,${chain.ys[index] - half}px,0)`;
          leadX = chain.xs[index];
          leadY = chain.ys[index];
        });
      } else if (type === 'snake') {
        // Classic elastic snake: every glyph chases its leader freely, so the
        // tail stretches out with movement. When the pointer rests and the
        // letters converge, each glyph scales down with its spread — the
        // whole stack collapses into a 1–2px dot instead of a letter blob.
        let leadX = mouseX;
        let leadY = mouseY;
        const spring = chain.spring || 0.35;
        const gap = chain.gap || 11;
        const minScale = chain.minScale ?? 0.42;
        const scaleEase = chain.scaleEase ?? 0.08;
        chain.nodes.forEach((node, index) => {
          chain.xs[index] = lerp(chain.xs[index], leadX, spring);
          chain.ys[index] = lerp(chain.ys[index], leadY, spring);
          const spread = Math.hypot(leadX - chain.xs[index], leadY - chain.ys[index]);
          // Gentle curve (sqrt) keeps glyphs near full size while moving, and
          // an eased scale means they shrink slowly, staying legible.
          const target = clamp(minScale + (1 - minScale) * Math.sqrt(Math.min(1, spread / gap)), minScale, 1);
          chain.scales[index] = lerp(chain.scales[index] ?? 1, target, scaleEase);
          node.style.transform = `translate3d(${chain.xs[index]}px,${chain.ys[index]}px,0) scale(${chain.scales[index].toFixed(3)})`;
          leadX = chain.xs[index];
          leadY = chain.ys[index];
        });
      } else if (type === 'orbit') {
        // Ellipse → circle bloom on hover, eased for smoothness.
        chain.orbitCur = lerp(chain.orbitCur, hoverTarget ? chain.orbitHoverRadius : chain.orbitRadius, 0.12);
        chain.squashCur = lerp(chain.squashCur, hoverTarget ? 1 : chain.squash, 0.12);
        chain.angles = chain.angles.map((angle) => angle + chain.orbitSpeed);
        chain.nodes.forEach((node, index) => {
          const ox = x + chain.orbitCur * Math.cos(chain.angles[index]);
          const oy = y + chain.orbitCur * Math.sin(chain.angles[index]) * chain.squashCur;
          node.style.transform = `translate3d(${Math.round(ox)}px,${Math.round(oy)}px,0)`;
        });
      }
      rafId = requestAnimationFrame(render);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver);
    document.addEventListener('pointerout', onOut);
    document.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('pointerup', onUp, { passive: true });
    window.addEventListener('mouseout', onWindowOut);
    if (scoped) el.addEventListener('pointerleave', onScopeLeave);
    rafId = requestAnimationFrame(render);

    return {
      el,
      type: 'cursor',
      cursor,
      setLabel(text = '') { if (label) { label.textContent = text; label.style.opacity = text ? '1' : '0'; } },
      show() { cursor.hidden = false; setVisible(true); },
      hide() { setVisible(false); },
      pause() { alive = false; if (rafId != null) cancelAnimationFrame(rafId); cursor.hidden = true; },
      resume() { if (!alive) { alive = true; cursor.hidden = false; rafId = requestAnimationFrame(render); } },
      destroy() {
        alive = false;
        if (rafId != null) cancelAnimationFrame(rafId);
        window.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerover', onOver);
        document.removeEventListener('pointerout', onOut);
        document.removeEventListener('pointerdown', onDown);
        document.removeEventListener('pointerup', onUp);
        window.removeEventListener('mouseout', onWindowOut);
        if (scoped) {
          el.removeEventListener('pointerleave', onScopeLeave);
          el.classList.remove('kt-cursor-scope');
          el.removeAttribute('data-kt-cursor-scope');
        }
        injectedStyle?.remove();
        clickStyle?.remove();
        cursor.remove();
        if (!scoped && !document.querySelector('.kt-cursor')) {
          root.classList.remove('kt-cursor-active');
          root.style.cursor = originalRootCursor;
        }
      }
    };
  },

  // Minimal instance for touch devices: no pointer visuals, only tap effects.
  _clickEffectsOnly(el, opts) {
    const zIndex = Number(opts.zIndex ?? 2147483000);
    let clickStyle = null;
    const spawn = (x, y) => {
      if (opts.clickSprite) {
        const meta = ensureSpriteMeta(opts) || {};
        const frameWidth = Math.max(8, Number(opts.clickSpriteWidth ?? meta.width ?? 96));
        const frameHeight = Math.max(8, Number(opts.clickSpriteHeight ?? meta.height ?? frameWidth));
        const frames = Math.max(1, Math.round(Number(opts.clickSpriteFrames ?? meta.frames ?? 8)));
        const duration = Math.max(80, Number(opts.clickSpriteDuration ?? 480));
        const signature = `${frameWidth}x${frames}`;
        if (!clickStyle) {
          const uid = `kt-cur-spr-${Math.random().toString(36).slice(2, 7)}`;
          clickStyle = document.createElement('style');
          clickStyle.dataset.uid = uid;
          document.head.appendChild(clickStyle);
        }
        if (clickStyle.dataset.signature !== signature) {
          clickStyle.dataset.signature = signature;
          clickStyle.textContent = `@keyframes ${clickStyle.dataset.uid} { to { background-position: -${frameWidth * frames}px 0; } }`;
        }
        const node = document.createElement('span');
        node.setAttribute('aria-hidden', 'true');
        node.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${frameWidth}px;height:${frameHeight}px;transform:translate(-50%,-50%);pointer-events:none;z-index:${zIndex + 1};background:url("${opts.clickSprite}") 0 0/auto ${frameHeight}px no-repeat;animation:${clickStyle.dataset.uid} ${duration}ms steps(${frames}) forwards;`;
        document.body.appendChild(node);
        setTimeout(() => node.remove(), duration + 40);
      } else if (opts.clickImage) {
        const size = Math.max(8, Number(opts.clickImageSize ?? 96));
        const duration = Math.max(80, Number(opts.clickImageDuration ?? 700));
        const node = document.createElement('img');
        node.alt = '';
        node.setAttribute('aria-hidden', 'true');
        const src = String(opts.clickImage);
        node.src = src + (src.includes('?') ? '&' : '?') + 'mkc=' + Date.now();
        node.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${size}px;height:auto;transform:translate(-50%,-50%);pointer-events:none;z-index:${zIndex + 1};`;
        document.body.appendChild(node);
        setTimeout(() => node.remove(), duration);
      }
    };
    const target = (el === document.body || el === document.documentElement) ? document : el;
    const onDown = (event) => spawn(event.clientX, event.clientY);
    target.addEventListener('pointerdown', onDown, { passive: true });
    return {
      el,
      type: 'cursor',
      pause() {},
      resume() {},
      destroy() {
        target.removeEventListener('pointerdown', onDown);
        clickStyle?.remove();
      }
    };
  },
  reduced() {},
  fallback() { return null; }
};
