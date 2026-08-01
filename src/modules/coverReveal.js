import { clamp, cssEase, env } from '../utils.js';

const COLOR_MODES = new Set(['single', 'pair', 'palette', 'auto']);

const paletteTokens = (value) => {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  const text = String(value || '').trim();
  if (!text) return [];
  if (text.includes('|')) return text.split('|').map((item) => item.trim()).filter(Boolean);
  const tokens = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '(') depth += 1;
    else if (char === ')') depth = Math.max(0, depth - 1);
    else if (char === ',' && depth === 0) {
      tokens.push(text.slice(start, index).trim());
      start = index + 1;
    }
  }
  tokens.push(text.slice(start).trim());
  return tokens.filter(Boolean);
};

const cssRgb = (value) => {
  const text = String(value || '').trim();
  const rgb = text.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  const hex = text.match(/^#([\da-f]{3}|[\da-f]{6})$/i)?.[1];
  if (!hex) return null;
  const full = hex.length === 3 ? hex.split('').map((part) => part + part).join('') : hex;
  return [0, 2, 4].map((index) => Number.parseInt(full.slice(index, index + 2), 16));
};

const rgbToHsl = ([red, green, blue]) => {
  const r = red / 255; const g = green / 255; const b = blue / 255;
  const max = Math.max(r, g, b); const min = Math.min(r, g, b);
  const light = (max + min) / 2;
  if (max === min) return [0, 0, light * 100];
  const delta = max - min;
  const saturation = delta / (1 - Math.abs(2 * light - 1));
  let hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  hue = (hue * 60 + 360) % 360;
  return [hue, saturation * 100, light * 100];
};

const sampledImageRgb = (root) => {
  const image = root?.tagName === 'IMG' ? root : root?.querySelector?.('img');
  if (!image || !image.complete || !image.naturalWidth) return null;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 12; canvas.height = 12;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return null;
    context.drawImage(image, 0, 0, 12, 12);
    const pixels = context.getImageData(0, 0, 12, 12).data;
    let red = 0; let green = 0; let blue = 0; let weight = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      const alpha = pixels[index + 3] / 255;
      if (alpha < 0.08) continue;
      red += pixels[index] * alpha;
      green += pixels[index + 1] * alpha;
      blue += pixels[index + 2] * alpha;
      weight += alpha;
    }
    return weight ? [red / weight, green / weight, blue / weight] : null;
  } catch (_error) {
    return null;
  }
};

const sampledImagePalette = (root) => {
  const image = root?.tagName === 'IMG' ? root : root?.querySelector?.('img');
  if (!image || !image.complete || !image.naturalWidth) return null;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 20; canvas.height = 20;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return null;
    context.drawImage(image, 0, 0, 20, 20);
    const data = context.getImageData(0, 0, 20, 20).data;
    const buckets = new Map();
    for (let index = 0; index < data.length; index += 4) {
      if (data[index + 3] < 32) continue;
      const red = data[index]; const green = data[index + 1]; const blue = data[index + 2];
      const key = `${red >> 4}:${green >> 4}:${blue >> 4}`;
      const bucket = buckets.get(key) || [0, 0, 0, 0];
      bucket[0] += red; bucket[1] += green; bucket[2] += blue; bucket[3] += 1;
      buckets.set(key, bucket);
    }
    const colors = [...buckets.values()].map(([red, green, blue, count]) => {
      const rgb = [red / count, green / count, blue / count];
      const chroma = Math.max(...rgb) - Math.min(...rgb);
      return { rgb, score: count * (1 + chroma / 96) };
    }).sort((a, b) => b.score - a.score);
    if (!colors.length) return null;
    const first = colors[0];
    const distance = (a, b) => ((a[0] - b[0]) ** 2) + ((a[1] - b[1]) ** 2) + ((a[2] - b[2]) ** 2);
    const second = colors.slice(1).sort((a, b) =>
      (b.score * Math.sqrt(distance(b.rgb, first.rgb))) - (a.score * Math.sqrt(distance(a.rgb, first.rgb)))
    )[0] || first;
    return [first, second].map(({ rgb }) => `rgb(${rgb.map((value) => Math.round(value)).join(' ')})`);
  } catch (_error) { return null; }
};

const surroundingRgb = (root) => {
  let node = root?.parentElement;
  while (node) {
    const value = getComputedStyle(node).backgroundColor;
    const alpha = Number(value.match(/rgba?\([^/]*[,/]\s*([\d.]+)\s*\)$/)?.[1] ?? 1);
    const rgb = cssRgb(value);
    if (rgb && alpha > 0.05) return rgb;
    node = node.parentElement;
  }
  return null;
};

const harmoniousPalette = (root) => {
  const [hue, saturation, light] = rgbToHsl(sampledImageRgb(root) || surroundingRgb(root) || [255, 91, 28]);
  const sat = clamp(saturation < 18 ? 64 : saturation, 48, 82);
  const lit = clamp(light < 18 ? 45 : light > 82 ? 56 : light, 36, 66);
  const drift = Math.round(Math.random() * 16 - 8);
  return [
    `hsl(${Math.round(hue)} ${Math.round(sat)}% ${Math.round(lit)}%)`,
    `hsl(${Math.round((hue + 28 + drift + 360) % 360)} ${Math.round(clamp(sat + 7, 48, 88))}% ${Math.round(clamp(lit + 7, 38, 72))}%)`,
    `hsl(${Math.round((hue - 34 + drift + 360) % 360)} ${Math.round(clamp(sat - 4, 44, 80))}% ${Math.round(clamp(lit - 6, 32, 64))}%)`
  ];
};

// Cover reveal — coloured panel(s) cover the target and sweep away when it
// scrolls into view. Two modes:
//   • block (default): covers the whole element — good for images/cards.
//   • lines (`lines:true`): splits text into its rendered lines and covers each
//     line to its own width, revealing them one after another (staggered) —
//     the cover hugs the text, not the surrounding box.
// Options: colorMode (single/pair/palette/auto), color / color2 / colors,
// direction, duration, delay, ease, layers (1–3), stagger (ms between layers,
// and between lines), threshold.
// Reduced motion reveals instantly with no panels.
export default {
  create(el, opts = {}) {
    const reduce = env().reducedMotion;
    const color = opts.color || '#ff5b1c';
    const color2 = opts.color2 || '#12141a';
    const colorMode = COLOR_MODES.has(opts.colorMode)
      ? opts.colorMode
      : (paletteTokens(opts.colors).length ? 'palette' : 'pair');
    const specifiedPalette = paletteTokens(opts.colors);
    const requestedDirection = ['left', 'right', 'up', 'down', 'random'].includes(opts.direction) ? opts.direction : 'right';
    const duration = Math.max(0.05, Number(opts.duration ?? 0.7));
    const delay = Math.max(0, Number(opts.delay ?? 0));
    const ease = opts.ease ? cssEase(opts.ease) : 'cubic-bezier(.77,0,.18,1)';
    const layers = clamp(Math.round(Number(opts.layers ?? 2)), 1, 3);
    // In mask mode the final coloured panel is replaced by the content mask.
    const maskLead = opts.mask === true;
    const panelLayers = Math.max(0, layers - (maskLead ? 1 : 0));
    const stagger = Math.max(0, Number(opts.stagger ?? 120));
    const linesMode = opts.lines === true;
    const pickDirection = () => requestedDirection === 'random'
      ? ['left', 'right', 'up', 'down'][Math.floor(Math.random() * 4)]
      : requestedDirection;
    const exitFor = (direction) => ({
      right: 'translateX(101%)', left: 'translateX(-101%)',
      down: 'translateY(101%)', up: 'translateY(-101%)'
    }[direction]);

    let timers = [];
    const covers = []; // { container, panels[], restoreOverflow, restorePosition }
    let observeTarget = el;
    let unwrap = null;
    let alive = true;

    const colorsFor = (container) => {
      if (colorMode === 'single') return [color];
      if (colorMode === 'pair') return [color, color2];
      if (colorMode === 'palette') return specifiedPalette.length ? specifiedPalette : [color, color2];
      return sampledImagePalette(el || container) || harmoniousPalette(el || container);
    };

    const paintPanels = (cover) => {
      const palette = colorsFor(cover.container);
      const offset = colorMode === 'pair' ? 0 : Math.floor(Math.random() * palette.length);
      cover.panels.forEach((panel, index) => {
        let panelColor = colorMode === 'pair'
          ? (layers > 1 && index === layers - 1 ? palette[1] : palette[0])
          : palette[(offset + index) % palette.length];
        panel.style.background = panelColor;
      });
    };

    const appendPanels = (cover) => {
      cover.panels = [];
      for (let index = 0; index < panelLayers; index += 1) {
        const panel = document.createElement('span');
        panel.setAttribute('aria-hidden', 'true');
        panel.style.cssText = `position:absolute;inset:0;z-index:${20 + index};transform:translate(0,0);transition:transform ${duration}s ${ease};pointer-events:none;will-change:transform;`;
        cover.container.appendChild(panel);
        cover.panels.push(panel);
      }
      paintPanels(cover);
    };

    // Add cover panels over a container and return a play() for it.
    const coverOf = (container, content = container) => {
      const restorePosition = container.style.position;
      const restoreOverflow = container.style.overflow;
      if (getComputedStyle(container).position === 'static') container.style.position = 'relative';
      container.style.overflow = 'hidden';
      const cover = { container, content, panels: [], restorePosition, restoreOverflow };
      appendPanels(cover);
      covers.push(cover);
      return cover.panels;
    };

    let linesText = null; // original text — restored on destroy (lines mode)

    const coverBlock = () => {
      // Block mode — wrap so panels overlay without disturbing layout.
      const cs = getComputedStyle(el);
      const inline = el.tagName === 'IMG' || cs.display.startsWith('inline');
      const wrap = document.createElement('div');
      wrap.className = 'kt-cover-wrap';
      // Inherit the element's rounding so the panels are clipped to the same
      // shape (otherwise their square corners poke outside a rounded element).
      wrap.style.cssText = `position:relative;overflow:hidden;display:${inline ? 'inline-block' : 'block'};width:${inline ? 'auto' : '100%'};height:${inline ? 'auto' : '100%'};min-width:0;min-height:0;border-radius:${cs.borderRadius};`;
      el.parentNode.insertBefore(wrap, el);
      wrap.appendChild(el);
      observeTarget = wrap;
      unwrap = () => { if (wrap.parentNode) { wrap.parentNode.insertBefore(el, wrap); wrap.remove(); } };
      coverOf(wrap, el);
    };

    function buildLines() {
      const raw = el.textContent;
      const words = raw.split(/\s+/).filter((w) => w.length);
      // Nothing to line-split (e.g. an image, or empty) — leave the element
      // untouched so the caller can fall back to a whole-element block cover.
      if (words.length < 1) return false;
      linesText = raw;
      // Measure with plain inline spans (they wrap naturally at the element's
      // real width); group by rendered top via getBoundingClientRect.
      el.textContent = '';
      const wordSpans = words.map((w, i) => {
        const s = document.createElement('span');
        s.textContent = w;
        el.appendChild(s);
        if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
        return s;
      });
      const lines = [];
      let current = null; let lastTop = null;
      wordSpans.forEach((s) => {
        const top = Math.round(s.getBoundingClientRect().top);
        if (lastTop === null || Math.abs(top - lastTop) > 3) { current = []; lines.push(current); lastTop = top; }
        current.push(s);
      });
      el.textContent = '';
      lines.forEach((group) => {
        const line = document.createElement('span');
        line.className = 'kt-cover-line';
        line.style.cssText = 'position:relative;display:block;overflow:hidden;width:max-content;max-width:100%;';
        const content = document.createElement('span');
        content.style.display = 'block';
        content.textContent = group.map((s) => s.textContent).join(' ');
        line.appendChild(content);
        el.appendChild(line);
        coverOf(line, content);
      });
      return true;
    }

    // Lines mode only when there's real text; otherwise a whole-element cover.
    if (!(linesMode && buildLines())) coverBlock();

    let played = false;
    let io = null;
    let initRaf = null;
    // `mask:true` adds the lead-in the Plus X reference has: before the stacked
    // panels peel off, the content itself is wiped in along the SAME direction,
    // so the reveal reads as one continuous move instead of panels popping off a
    // static image.
    const maskInsetFor = (direction) => ({
      right: 'inset(0 0 0 100%)', left: 'inset(0 100% 0 0)',
      down: 'inset(100% 0 0 0)', up: 'inset(0 0 100% 0)'
    }[direction] || 'inset(0 0 0 100%)');
    // The wipe followed the panel exit direction, so `direction:'random'` made it
    // unpredictable with no way to pin it. `maskDirection` sets it explicitly;
    // left unset it keeps following the panels.
    const maskDirections = ['left', 'right', 'up', 'down'];
    const maskDirectionOpt = maskDirections.includes(opts.maskDirection) ? opts.maskDirection : null;

    const play = () => {
      if (!alive || played) return;
      played = true;
      const moveDirection = pickDirection();
      const exitTransform = exitFor(moveDirection);
      if (maskLead) {
        covers.forEach((cover) => {
          const target = cover.content;
          target.style.clipPath = maskInsetFor(maskDirectionOpt || moveDirection);
          target.style.webkitClipPath = target.style.clipPath;
          target.style.transition = `clip-path ${duration}s ${ease},-webkit-clip-path ${duration}s ${ease}`;
        });
      }
      void el.offsetWidth; // paint the covered start frame first
      if (maskLead) {
        requestAnimationFrame(() => {
          covers.forEach((cover) => {
            cover.content.style.clipPath = 'inset(0 0 0 0)';
            cover.content.style.webkitClipPath = 'inset(0 0 0 0)';
          });
        });
      }
      requestAnimationFrame(() => {
        covers.forEach((cover, lineIndex) => {
          const lineDelay = delay + (linesMode ? lineIndex * stagger : 0);
          cover.panels.forEach((panel, i) => {
            const order = Math.max(0, panelLayers - 1 - i);
          timers.push(setTimeout(() => { if (alive) panel.style.transform = exitTransform; }, lineDelay + order * stagger));
          });
        });
      });
      const totalLines = linesMode ? Math.max(0, covers.length - 1) : 0;
      const total = delay + totalLines * stagger + Math.max(0, panelLayers - 1) * stagger + duration * 1000 + 80;
      timers.push(setTimeout(() => {
        if (!alive) return;
        covers.forEach((cover) => {
          cover.panels.forEach((panel) => panel.remove());
          if (maskLead) {
            cover.content.style.removeProperty('clip-path');
            cover.content.style.removeProperty('-webkit-clip-path');
            cover.content.style.removeProperty('transition');
          }
        });
        opts.onComplete?.(el);
      }, total));
    };

    // Load-aware: if this wraps an <img> that isn't decoded yet, hold the sweep
    // until it loads so the reveal never uncovers a blank frame. `waitForImage`
    // (default true) turns it off. Text (lines) mode never waits.
    const waitForImage = opts.waitForImage !== false;
    const img = !linesMode ? (el.tagName === 'IMG' ? el : (el.querySelector && el.querySelector('img'))) : null;
    const startPlay = () => {
      if (waitForImage && img && !(img.complete && img.naturalWidth)) {
        let fired = false;
        const kick = () => {
          if (fired || !alive) return;
          fired = true;
          img.removeEventListener('load', kick);
          img.removeEventListener('error', kick);
          if (colorMode === 'auto') covers.forEach(paintPanels);
          play();
        };
        try { if (img.decode) img.decode().then(kick, kick); } catch (_e) { /* ignore */ }
        img.addEventListener('load', kick, { once: true });
        img.addEventListener('error', kick, { once: true });
        timers.push(setTimeout(kick, 4000)); // safety: never hang
      } else {
        if (colorMode === 'auto') covers.forEach(paintPanels);
        play();
      }
    };

    if (reduce) {
      // Instantly visible — remove any panels.
      covers.forEach((cover) => cover.panels.forEach((panel) => panel.remove()));
    } else if (typeof IntersectionObserver !== 'undefined') {
      // Live settings recreate a cover while its demo is already visible.
      // Some browsers do not deliver a new observer entry before the opaque
      // start panel paints, leaving the demo black indefinitely. Start directly
      // for an on-screen target; observe only targets that are actually outside.
      initRaf = requestAnimationFrame(() => {
        if (!alive) return;
        const rect = observeTarget.getBoundingClientRect();
        const visibleNow = rect.bottom > 0 && rect.right > 0
          && rect.top < window.innerHeight && rect.left < window.innerWidth;
        if (visibleNow) {
          startPlay();
          return;
        }
        io = new IntersectionObserver((records) => {
          for (const record of records) {
            if (record.isIntersecting) {
              io.disconnect();
              io = null;
              startPlay();
              break;
            }
          }
        }, { threshold: clamp(Number(opts.threshold ?? 0.2), 0, 1) });
        io.observe(observeTarget);
      });
    } else {
      startPlay();
    }

    // `watch:true` re-runs the reveal whenever the content changes — items
    // reordered, added or swapped out. The panels drop back over the element and
    // sweep off again, so an updated list reads as "gone, then back" instead of
    // silently mutating underneath the visitor.
    let watcher = null;
    let watchFrame = 0;
    if (opts.watch === true && typeof MutationObserver !== 'undefined') {
      watcher = new MutationObserver(() => {
        if (!alive || reduce) return;
        if (watchFrame) cancelAnimationFrame(watchFrame);
        // Coalesce a burst of DOM writes into one reveal.
        watchFrame = requestAnimationFrame(() => {
          watchFrame = 0;
          if (!alive) return;
          api.replay();
        });
      });
      watcher.observe(el, { childList: true, subtree: false, characterData: true });
    }

    const api = {
      el,
      type: 'coverReveal',
      replay() {
        played = false;
        timers.forEach(clearTimeout); timers = [];
        if (reduce) return;
        covers.forEach((cover) => {
          // A replay may be requested before the previous sweep's cleanup timer
          // fires (live settings and gallery shuffle both do this). Remove those
          // panels first; otherwise every replay stacks another opaque layer set.
          cover.panels.forEach((panel) => panel.remove());
          appendPanels(cover);
        });
        requestAnimationFrame(play);
      },
      // Cover the content again WITHOUT revealing it — the "disappear" half of a
      // list update. Pair it with replay() to get vanish -> re-enter, which is
      // what a reordered or refreshed gallery needs; until now the only options
      // were "slide to a new position" or "already visible, no entrance".
      exit() {
        if (reduce) return Promise.resolve();
        played = false;
        timers.forEach(clearTimeout); timers = [];
        covers.forEach((cover) => {
          cover.panels.forEach((panel) => panel.remove());
          appendPanels(cover);
          if (maskLead) {
            cover.content.style.removeProperty('clip-path');
            cover.content.style.removeProperty('-webkit-clip-path');
            cover.content.style.removeProperty('transition');
          }
        });
        // The panels start covering, so one frame is enough to be hidden.
        return new Promise((resolve) => requestAnimationFrame(() => resolve()));
      },
      // Vanish, let the caller reorder/replace content, then re-enter.
      async refresh(update) {
        await this.exit();
        if (typeof update === 'function') await update(el);
        this.replay();
      },
      pause() {}, resume() {},
      destroy() {
        alive = false;
        io?.disconnect();
        watcher?.disconnect();
        if (watchFrame) cancelAnimationFrame(watchFrame);
        if (initRaf != null) cancelAnimationFrame(initRaf);
        timers.forEach(clearTimeout);
        covers.forEach((cover) => {
          cover.panels.forEach((panel) => panel.remove());
          cover.content.style.removeProperty('clip-path');
          cover.content.style.removeProperty('-webkit-clip-path');
          cover.content.style.removeProperty('transition');
          cover.container.style.overflow = cover.restoreOverflow;
          cover.container.style.position = cover.restorePosition;
        });
        unwrap?.();
        // Lines mode replaced the text with per-line spans — put the text back.
        if (linesText != null) el.textContent = linesText;
      }
    };
    return api;
  },
  reduced(el, opts) { return this.create(el, opts); }
};
